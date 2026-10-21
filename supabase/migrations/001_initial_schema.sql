-- =============================================================================
-- My Flight Academy — Migración 001: Esquema inicial (v3 — corrección crítica)
-- =============================================================================
-- Historial de cambios:
--   v1 (Fase 1 inicial)    : Esquema base, RLS, triggers.
--   v2 (post-auditoría)    : ALTO-1..BAJO-2 de la primera auditoría.
--   v3 (corrección crítica): Corrige el mecanismo de protección de
--                            verification_status. La v2 usaba un trigger
--                            SECURITY DEFINER que evaluaba current_role,
--                            asumiendo que esa variable refleja el llamante.
--                            Esa suposición es incorrecta: dentro de una
--                            función SECURITY DEFINER, current_role y
--                            current_user devuelven el PROPIETARIO de la
--                            función (postgres), no el rol de la sesión.
--                            (Ref: PostgreSQL docs, "Miscellaneous Functions",
--                            vigente desde PG 7.3 hasta la versión actual.)
--                            La v3 implementa la solución correcta mediante
--                            column-level privileges + trigger SECURITY
--                            INVOKER como capa de defensa en profundidad.
--
-- Prerequisito : El esquema "auth" de Supabase ya existe (gestionado por
--                Supabase). No ejecutar en instancias sin ese esquema.
-- Idempotente  : Sí — usa IF NOT EXISTS / OR REPLACE / DO-guard.
-- Entorno      : Supabase (PostgreSQL 15+). Validado con análisis estático.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- EXTENSIONES
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =============================================================================
-- TABLA: profiles
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username            TEXT NOT NULL
                            UNIQUE
                            CHECK (
                                char_length(username) BETWEEN 3 AND 30
                                AND username ~ '^[a-z0-9_.-]+$'
                            ),
    avatar_url          TEXT,
    country             CHAR(2) CHECK (country ~ '^[A-Z]{2}$'),
    profile_visibility  TEXT NOT NULL DEFAULT 'public'
                            CHECK (profile_visibility IN ('public', 'private')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.profiles IS 'Perfil público de cada usuario. Vinculado 1-a-1 con auth.users.';
COMMENT ON COLUMN public.profiles.created_at IS 'Inmutable tras la creación. Protegido por trigger.';

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);


-- ---------------------------------------------------------------------------
-- FUNCIÓN: set_updated_at
-- ---------------------------------------------------------------------------
-- SECURITY INVOKER (default): corre con los privilegios del llamante.
-- No necesita privilegios elevados: solo modifica NEW.updated_at en memoria.
-- Se revoca EXECUTE a PUBLIC como defensa en profundidad; los triggers no
-- requieren ese privilegio para invocar la función.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'trg_profiles_updated_at'
          AND tgrelid = 'public.profiles'::regclass
    ) THEN
        CREATE TRIGGER trg_profiles_updated_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    END IF;
END $$;


-- ---------------------------------------------------------------------------
-- FUNCIÓN: protect_profiles_created_at
-- ---------------------------------------------------------------------------
-- SECURITY INVOKER: no necesita privilegios elevados.
-- Solo compara OLD.created_at con NEW.created_at y lanza excepción si difieren.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profiles_created_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        RAISE EXCEPTION
            'profiles.created_at es inmutable y no puede modificarse.'
            USING ERRCODE = 'integrity_constraint_violation';
    END IF;
    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.protect_profiles_created_at() FROM PUBLIC;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'trg_profiles_protect_created_at'
          AND tgrelid = 'public.profiles'::regclass
    ) THEN
        CREATE TRIGGER trg_profiles_protect_created_at
        BEFORE UPDATE ON public.profiles
        FOR EACH ROW EXECUTE FUNCTION public.protect_profiles_created_at();
    END IF;
END $$;


-- ---------------------------------------------------------------------------
-- FUNCIÓN: handle_new_user
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER es necesario aquí: el trigger se dispara desde auth.users
-- (esquema auth) y necesita escribir en public.profiles, donde el nuevo
-- usuario aún no tiene permisos. El propietario (postgres) sí los tiene.
--
-- POR QUÉ current_role NO SE USA aquí: handle_new_user no toma decisiones
-- de autorización basadas en el rol de la sesión. Solo inserta el perfil.
-- El contexto de SECURITY DEFINER (propietario = postgres) es lo que permite
-- el INSERT; no se asume nada sobre current_role dentro de la función.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    base_username  TEXT;
    final_username TEXT;
    suffix         INT := 0;
    max_attempts   CONSTANT INT := 100;
BEGIN
    IF NEW.email IS NULL OR trim(NEW.email) = '' THEN
        base_username := 'pilot';
    ELSE
        base_username := lower(
            regexp_replace(
                split_part(NEW.email, '@', 1),
                '[^a-z0-9_.-]', '', 'g'
            )
        );
    END IF;

    IF char_length(base_username) < 3 THEN
        base_username := base_username || 'usr';
    END IF;

    base_username  := left(base_username, 26);
    final_username := base_username;

    WHILE EXISTS (
        SELECT 1 FROM public.profiles WHERE username = final_username
    ) LOOP
        suffix := suffix + 1;
        IF suffix > max_attempts THEN
            final_username := left(base_username, 22) ||
                              lpad((floor(random() * 9000) + 1000)::INT::TEXT, 4, '0');
            EXIT;
        END IF;
        final_username := base_username || suffix::TEXT;
    END LOOP;

    INSERT INTO public.profiles (id, username)
    VALUES (NEW.id, final_username)
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;

EXCEPTION
    WHEN unique_violation THEN
        INSERT INTO public.profiles (id, username)
        VALUES (
            NEW.id,
            left(base_username, 22) ||
            lpad((floor(random() * 9000) + 1000)::INT::TEXT, 4, '0')
        )
        ON CONFLICT (id) DO NOTHING;
        RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'trg_on_auth_user_created'
          AND tgrelid = 'auth.users'::regclass
    ) THEN
        CREATE TRIGGER trg_on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;


-- =============================================================================
-- TABLA: flights
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.flights (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Único por usuario. Ver docs/database.md §3.2.1 para la justificación.
    session_uuid        UUID,
    CONSTRAINT uq_flights_user_session UNIQUE (user_id, session_uuid),

    dep_icao            CHAR(4) CHECK (dep_icao ~ '^[A-Z0-9]{4}$'),
    arr_icao            CHAR(4) CHECK (arr_icao ~ '^[A-Z0-9]{4}$'),
    alt_icao            CHAR(4) CHECK (alt_icao ~ '^[A-Z0-9]{4}$'),
    aircraft            TEXT CHECK (char_length(aircraft) <= 80),

    started_at          TIMESTAMPTZ,
    ended_at            TIMESTAMPTZ,

    duration_seconds    INTEGER CHECK (
                            duration_seconds IS NULL
                            OR duration_seconds BETWEEN 60 AND 86400
                        ),
    distance_nm         NUMERIC(8,2) CHECK (distance_nm IS NULL OR distance_nm > 0),
    max_altitude_ft     INTEGER CHECK (
                            max_altitude_ft IS NULL
                            OR max_altitude_ft BETWEEN -2000 AND 100000
                        ),
    landing_vs_fpm      INTEGER CHECK (
                            landing_vs_fpm IS NULL
                            OR landing_vs_fpm BETWEEN -6000 AND 6000
                        ),

    flight_status       TEXT NOT NULL DEFAULT 'planned'
                            CHECK (flight_status IN (
                                'planned','active','completed',
                                'interrupted','cancelled'
                            )),

    -- ── verification_status ────────────────────────────────────────────────
    -- PROTECCIÓN EN TRES CAPAS (ver docs/security.md §3):
    --
    -- Capa 1 — Column-level privilege:
    --   authenticated NO tiene GRANT UPDATE(verification_status).
    --   Bloquea a authenticated antes de RLS o triggers.
    --   NO protege a service_role: en Supabase, service_role tiene GRANT ALL
    --   a nivel de tabla por defecto; un REVOKE de columna no puede bloquear
    --   ese GRANT de tabla (permisos acumulativos en PostgreSQL).
    --
    -- Capa 2 — Política RLS flights_insert_own:
    --   Al insertar, verification_status debe ser 'unverified'.
    --
    -- Capa 3 — Trigger SECURITY INVOKER (mecanismo principal contra service_role):
    --   Bloquea a 'authenticated', 'anon' Y 'service_role' si intentan cambiar
    --   el campo directamente. Solo permite el cambio cuando current_role es
    --   'postgres' (el propietario de verify_flight_status, SECURITY DEFINER),
    --   que es la única vía de modificación autorizada.
    -- ──────────────────────────────────────────────────────────────────────
    verification_status TEXT NOT NULL DEFAULT 'unverified'
                            CHECK (verification_status IN (
                                'unverified','pending_review',
                                'verified','rejected'
                            )),

    notes               TEXT CHECK (char_length(notes) <= 4000),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_flights_dates_both_or_none
        CHECK (
            (started_at IS NULL AND ended_at IS NULL)
            OR (started_at IS NOT NULL AND ended_at IS NOT NULL)
        ),
    CONSTRAINT chk_flights_end_after_start
        CHECK (ended_at IS NULL OR ended_at > started_at),
    CONSTRAINT chk_flights_duration_max
        CHECK (
            ended_at IS NULL OR started_at IS NULL
            OR EXTRACT(EPOCH FROM (ended_at - started_at)) <= 86400
        ),
    CONSTRAINT chk_flights_duration_consistent
        CHECK (
            started_at IS NULL
            OR ended_at IS NULL
            OR duration_seconds IS NULL
            OR ABS(
                EXTRACT(EPOCH FROM (ended_at - started_at))
                - duration_seconds
            ) <= 120
        )
);

COMMENT ON TABLE  public.flights IS 'Bitácora de vuelo. Cada fila = un vuelo registrado manual o automáticamente por el conector.';
COMMENT ON COLUMN public.flights.verification_status IS
    'Solo el backend puede cambiar este campo a través de verify_flight_status(). '
    'Protegido por: column-level privilege (bloquea authenticated), '
    'trigger SECURITY INVOKER (bloquea authenticated, anon y service_role). '
    'service_role debe usar verify_flight_status() — el UPDATE directo queda bloqueado por el trigger.';
COMMENT ON COLUMN public.flights.session_uuid IS 'UUID de la sesión del conector. Único por (user_id, session_uuid).';

CREATE INDEX IF NOT EXISTS idx_flights_user_created
    ON public.flights (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flights_user_status
    ON public.flights (user_id, flight_status);
CREATE INDEX IF NOT EXISTS idx_flights_ranking
    ON public.flights (user_id, duration_seconds DESC)
    WHERE flight_status = 'completed' AND verification_status = 'verified';

-- Trigger updated_at para flights (SECURITY INVOKER: no necesita privilegios elevados)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'trg_flights_updated_at'
          AND tgrelid = 'public.flights'::regclass
    ) THEN
        CREATE TRIGGER trg_flights_updated_at
        BEFORE UPDATE ON public.flights
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    END IF;
END $$;


-- ---------------------------------------------------------------------------
-- FUNCIÓN: protect_verification_status (Capa 3 — defensa en profundidad)
-- ---------------------------------------------------------------------------
-- SECURITY INVOKER (corrección crítica de v3):
--   A diferencia de SECURITY DEFINER, dentro de una función SECURITY INVOKER
--   current_role refleja el rol REAL del llamante (authenticated, anon,
--   service_role, postgres...), no el propietario de la función.
--   Esto hace que la comprobación de current_role sea fiable.
--
-- POR QUÉ SECURITY INVOKER ES CORRECTO AQUÍ:
--   La función no necesita privilegios elevados. Solo lee OLD/NEW y lanza
--   una excepción. No accede a ningún objeto que requiera permisos especiales.
--   SECURITY INVOKER garantiza que current_role sea el del llamante.
--
-- RELACIÓN CON LOS COLUMN-LEVEL GRANTS (Capa 1):
--   En condiciones normales, authenticated nunca llega a este trigger
--   porque el motor rechaza el UPDATE antes de dispararlo (la Capa 1 actúa
--   antes). Este trigger es la segunda barrera para casos inesperados:
--   por ejemplo, si en el futuro se añade un GRANT accidentalmente, o si
--   se ejecuta la migración en un entorno con permisos distintos.
--
-- QUÉ OCURRE CON service_role:
--   service_role tiene BYPASSRLS pero NO bypass de triggers.
--   service_role NO tiene UPDATE(verification_status) de forma directa:
--   solo puede verificar vuelos a través de verify_flight_status().
--   Dentro de verify_flight_status() (SECURITY DEFINER, propietario postgres),
--   current_role = 'postgres', que no está en la lista de bloqueo del trigger.
--   El cambio procede.
--
-- QUÉ OCURRE CON postgres (superuser):
--   Un superuser puede desactivar triggers (ALTER TABLE DISABLE TRIGGER).
--   Esto es correcto: los superusers tienen control total por diseño.
--   No se puede proteger contra un superuser con solo SQL.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_verification_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    -- Si verification_status no cambia, no hay nada que bloquear.
    IF NEW.verification_status IS NOT DISTINCT FROM OLD.verification_status THEN
        RETURN NEW;
    END IF;

    -- Bloquear a roles no privilegiados.
    -- Con SECURITY INVOKER, current_role refleja el rol real del llamante:
    --   - authenticated / anon: usuarios finales → bloqueados.
    --   - service_role: tiene UPDATE de tabla por defecto en Supabase →
    --     bloqueado aquí para forzar el uso de verify_flight_status().
    --   - postgres: propietario de verify_flight_status() (SECURITY DEFINER);
    --     cuando la función RPC ejecuta el UPDATE, current_role = 'postgres'
    --     → permitido. Es la única vía de modificación autorizada.
    --
    -- POR QUÉ service_role ESTÁ BLOQUEADO DIRECTAMENTE:
    --   En Supabase, GRANT ALL ON ALL TABLES ... TO service_role se aplica
    --   por defecto. Eso incluye UPDATE a nivel de tabla, lo que hace que
    --   REVOKE UPDATE (columna) FROM service_role sea un no-op: el privilegio
    --   de tabla prevalece sobre el REVOKE de columna (permisos acumulativos).
    --   El trigger es el único mecanismo fiable para bloquear este caso.
    IF current_role IN ('authenticated', 'anon', 'service_role') THEN
        RAISE EXCEPTION
            'No tienes permiso para cambiar el estado de verificación. '
            'Esta operación requiere autorización del backend a través de verify_flight_status().'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.protect_verification_status() FROM PUBLIC;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'trg_flights_protect_verification'
          AND tgrelid = 'public.flights'::regclass
    ) THEN
        CREATE TRIGGER trg_flights_protect_verification
        BEFORE UPDATE ON public.flights
        FOR EACH ROW EXECUTE FUNCTION public.protect_verification_status();
    END IF;
END $$;


-- =============================================================================
-- TABLA: simulator_sessions
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.simulator_sessions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    connector_session_id    UUID NOT NULL UNIQUE,
    started_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen               TIMESTAMPTZ NOT NULL DEFAULT now(),
    flight_id               UUID REFERENCES public.flights(id) ON DELETE SET NULL,
    session_status          TEXT NOT NULL DEFAULT 'active'
                                CHECK (session_status IN (
                                    'active','completed','lost','error'
                                )),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.simulator_sessions IS 'Sesiones del conector MSFS24.';
COMMENT ON COLUMN public.simulator_sessions.connector_session_id IS 'UUID generado por el conector. UNIQUE global.';
COMMENT ON COLUMN public.simulator_sessions.started_at IS 'Asignado por el servidor con now(). No usar el reloj del cliente.';

CREATE INDEX IF NOT EXISTS idx_sim_sessions_user
    ON public.simulator_sessions (user_id, started_at DESC);


-- =============================================================================
-- TABLA: device_connections
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.device_connections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_name     TEXT NOT NULL
                        CHECK (char_length(device_name) BETWEEN 1 AND 60),
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.device_connections IS 'Dispositivos vinculados. Estructura preparatoria; autenticación real en fases posteriores.';
COMMENT ON COLUMN public.device_connections.revoked_at IS 'NULL = activo. No eliminar filas: historial de auditoría.';

CREATE INDEX IF NOT EXISTS idx_device_connections_user_active
    ON public.device_connections (user_id)
    WHERE revoked_at IS NULL;


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flights           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulator_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_connections ENABLE ROW LEVEL SECURITY;

-- ── profiles ────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_select_public') THEN
    CREATE POLICY "profiles_select_public"
        ON public.profiles FOR SELECT
        USING (profile_visibility = 'public');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_select_own') THEN
    CREATE POLICY "profiles_select_own"
        ON public.profiles FOR SELECT
        USING (auth.uid() = id);
  END IF;
END $$;

-- UPDATE: created_at protegido por trigger; no hay restricciones de columna
-- adicionales porque los campos de perfil son todos editables por el usuario.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_update_own') THEN
    CREATE POLICY "profiles_update_own"
        ON public.profiles FOR UPDATE
        USING  (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ── flights ──────────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='flights' AND policyname='flights_select_own') THEN
    CREATE POLICY "flights_select_own"
        ON public.flights FOR SELECT
        USING (auth.uid() = user_id);
  END IF;
END $$;

-- Al insertar: verification_status debe ser 'unverified' (Capa 2).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='flights' AND policyname='flights_insert_own') THEN
    CREATE POLICY "flights_insert_own"
        ON public.flights FOR INSERT
        WITH CHECK (
            auth.uid() = user_id
            AND verification_status = 'unverified'
        );
  END IF;
END $$;

-- UPDATE: la restricción de columna (Capa 1) y el trigger (Capa 3) protegen
-- verification_status. Esta política solo controla qué filas puede tocar.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='flights' AND policyname='flights_update_own') THEN
    CREATE POLICY "flights_update_own"
        ON public.flights FOR UPDATE
        USING  (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='flights' AND policyname='flights_delete_own') THEN
    CREATE POLICY "flights_delete_own"
        ON public.flights FOR DELETE
        USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── simulator_sessions ───────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='simulator_sessions' AND policyname='sim_sessions_select_own') THEN
    CREATE POLICY "sim_sessions_select_own"
        ON public.simulator_sessions FOR SELECT
        USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='simulator_sessions' AND policyname='sim_sessions_insert_own') THEN
    CREATE POLICY "sim_sessions_insert_own"
        ON public.simulator_sessions FOR INSERT
        WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='simulator_sessions' AND policyname='sim_sessions_update_own') THEN
    CREATE POLICY "sim_sessions_update_own"
        ON public.simulator_sessions FOR UPDATE
        USING  (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- ── device_connections ───────────────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='device_connections' AND policyname='device_connections_select_own') THEN
    CREATE POLICY "device_connections_select_own"
        ON public.device_connections FOR SELECT
        USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='device_connections' AND policyname='device_connections_insert_own') THEN
    CREATE POLICY "device_connections_insert_own"
        ON public.device_connections FOR INSERT
        WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='device_connections' AND policyname='device_connections_update_own') THEN
    CREATE POLICY "device_connections_update_own"
        ON public.device_connections FOR UPDATE
        USING  (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;


-- =============================================================================
-- PERMISOS DE TABLA Y COLUMNA
-- =============================================================================
-- ── Esquema ──────────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- ── profiles ─────────────────────────────────────────────────────────────────
-- anon: solo SELECT a través de la vista public_profiles (ver más abajo).
-- authenticated: SELECT + UPDATE. No INSERT (trigger handle_new_user).
GRANT SELECT        ON public.profiles TO anon;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- ── flights ───────────────────────────────────────────────────────────────────
-- DISEÑO DE PERMISOS DE COLUMNA (Capa 1 de protección):
--
-- En lugar de un UPDATE general, se otorgan permisos columna por columna
-- solo sobre los campos que el usuario puede modificar legítimamente.
-- Esto impide a nivel del motor cualquier intento de modificar
-- verification_status, user_id, id, created_at o session_uuid.
--
-- Campos editables por authenticated:
--   dep_icao, arr_icao, alt_icao, aircraft, started_at, ended_at,
--   duration_seconds, distance_nm, max_altitude_ft, landing_vs_fpm,
--   flight_status, notes
--   (updated_at lo gestiona el trigger; no hace falta permiso explícito)
--
-- Campos NO editables por authenticated (sin GRANT de UPDATE):
--   id, user_id, session_uuid, verification_status, created_at, updated_at
--
-- INTERACCIÓN CON service_role:
--   Supabase aplica por defecto GRANT ALL ON ALL TABLES ... TO service_role
--   en proyectos nuevos, lo que incluiría UPDATE(verification_status).
--   Se revoca explícitamente para que service_role deba usar
--   verify_flight_status(), que incluye las validaciones de negocio.
--   La función verify_flight_status() es SECURITY DEFINER con propietario
--   postgres (superuser), que sí puede actualizar esa columna sin GRANT.
-- ─────────────────────────────────────────────────────────────────────────────
GRANT SELECT, INSERT, DELETE ON public.flights TO authenticated;

GRANT UPDATE (
    dep_icao,
    arr_icao,
    alt_icao,
    aircraft,
    started_at,
    ended_at,
    duration_seconds,
    distance_nm,
    max_altitude_ft,
    landing_vs_fpm,
    flight_status,
    notes
) ON public.flights TO authenticated;

-- Revocar UPDATE(verification_status) de service_role — NOTA IMPORTANTE:
-- Este REVOKE es un no-op en Supabase porque service_role recibe
-- GRANT ALL ON ALL TABLES ... por defecto, lo que incluye UPDATE a nivel
-- de tabla. En PostgreSQL, los permisos son acumulativos: un REVOKE de
-- columna no puede bloquear un GRANT de tabla del mismo rol. La protección
-- real contra service_role está en el trigger SECURITY INVOKER, que
-- comprueba current_role en tiempo de ejecución.
-- Se mantiene como declaración de intención, pero no produce efecto real:
REVOKE UPDATE (verification_status) ON public.flights FROM service_role;

-- ── simulator_sessions ───────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE ON public.simulator_sessions TO authenticated;

-- ── device_connections ───────────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE ON public.device_connections TO authenticated;


-- =============================================================================
-- VISTA PÚBLICA DE PERFILES
-- =============================================================================
-- WITH (security_invoker = true): RLS se evalúa con el rol del llamante.
-- Requiere PostgreSQL 15 (Supabase 2023+).
-- =============================================================================
CREATE OR REPLACE VIEW public.public_profiles
    WITH (security_invoker = true)
AS
SELECT
    id,
    username,
    avatar_url,
    country,
    created_at
FROM public.profiles
WHERE profile_visibility = 'public';

COMMENT ON VIEW public.public_profiles IS
    'Vista de perfiles públicos. security_invoker=true: RLS evalúa con el rol del llamante.';

GRANT SELECT ON public.public_profiles TO anon, authenticated;


-- =============================================================================
-- FUNCIÓN PRIVILEGIADA: verify_flight_status
-- =============================================================================
-- Única vía autorizada para cambiar verification_status desde el backend.
--
-- CÓMO FUNCIONA:
--   1. Solo service_role tiene EXECUTE sobre esta función.
--      (REVOKE PUBLIC + GRANT service_role)
--   2. Es SECURITY DEFINER con propietario postgres.
--      Dentro de ella, current_role = 'postgres' (propietario).
--   3. postgres no está en la lista de bloqueo del trigger SECURITY INVOKER,
--      por lo que el UPDATE procede.
--   4. La función valida que el vuelo exista y pertenezca al usuario indicado
--      antes de modificar nada.
--
-- POR QUÉ SECURITY DEFINER AQUÍ ES CORRECTO:
--   Necesitamos que postgres ejecute el UPDATE para que:
--   (a) tenga UPDATE(verification_status) a nivel de columna (postgres es
--       superuser y bypasea los column-level checks), y
--   (b) current_role = 'postgres' no quede bloqueado por el trigger.
--
-- POR QUÉ UN USUARIO NORMAL NO PUEDE ABUSAR DE ESTA FUNCIÓN:
--   Solo service_role tiene EXECUTE. Un usuario authenticated que intente
--   llamarla desde PostgREST recibirá un error de permiso antes de que
--   la función se ejecute.
--
-- EXTENSIÓN FUTURA:
--   En Fase 4/5 esta función puede ampliarse para:
--   - Llamar a la Edge Function de validación de telemetría.
--   - Registrar el evento de verificación en una tabla de auditoría.
--   - Manejar transiciones de estado (unverified → pending_review → verified).
-- =============================================================================
CREATE OR REPLACE FUNCTION public.verify_flight_status(
    p_flight_id  UUID,
    p_new_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_flight public.flights%ROWTYPE;
BEGIN
    -- Validar el valor del nuevo estado.
    -- 'unverified' no es un estado alcanzable por esta función;
    -- la reversión a unverified requeriría una vía administrativa separada.
    IF p_new_status NOT IN ('pending_review', 'verified', 'rejected') THEN
        RETURN jsonb_build_object(
            'ok', false,
            'error', 'Estado no válido: ' || p_new_status
        );
    END IF;

    -- Leer el vuelo con bloqueo para evitar race conditions.
    SELECT * INTO v_flight
    FROM public.flights
    WHERE id = p_flight_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Vuelo no encontrado.');
    END IF;

    -- Solo se pueden verificar vuelos completados o interrumpidos.
    IF v_flight.flight_status NOT IN ('completed', 'interrupted') THEN
        RETURN jsonb_build_object(
            'ok', false,
            'error', 'El vuelo debe estar en estado completed o interrupted para verificarse.'
        );
    END IF;

    -- No revertir un vuelo ya verificado sin autorización explícita.
    IF v_flight.verification_status = 'verified' AND p_new_status != 'verified' THEN
        RETURN jsonb_build_object(
            'ok', false,
            'error', 'Un vuelo verificado no puede ser desverificado por esta vía.'
        );
    END IF;

    -- Realizar el cambio de estado.
    UPDATE public.flights
    SET verification_status = p_new_status,
        updated_at = now()
    WHERE id = p_flight_id;

    RETURN jsonb_build_object(
        'ok', true,
        'flight_id', p_flight_id,
        'new_status', p_new_status
    );
END;
$$;

-- Solo service_role puede ejecutar esta función.
-- El propietario se fija a postgres explícitamente para que SECURITY DEFINER
-- eleve current_role a 'postgres' dentro de la función, valor que el trigger
-- protect_verification_status() no bloquea. Sin esta línea, el propietario
-- sería el rol que ejecutó la migración, que puede variar entre entornos.
ALTER FUNCTION public.verify_flight_status(UUID, TEXT) OWNER TO postgres;
REVOKE EXECUTE ON FUNCTION public.verify_flight_status(UUID, TEXT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.verify_flight_status(UUID, TEXT) TO service_role;

COMMENT ON FUNCTION public.verify_flight_status IS
    'Única vía autorizada para cambiar verification_status. '
    'Solo ejecutable por service_role. Ver docs/security.md §3.';


-- =============================================================================
-- VERIFICACIÓN DE ESTRUCTURA (consultas comentadas, ejecutar post-migración)
-- =============================================================================

-- 1. Tablas con RLS habilitado
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN ('profiles','flights','simulator_sessions','device_connections');

-- 2. Políticas activas
-- SELECT tablename, policyname, cmd, qual, with_check
-- FROM pg_policies WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- 3. Permisos por columna en flights
-- SELECT grantee, column_name, privilege_type
-- FROM information_schema.column_privileges
-- WHERE table_schema = 'public' AND table_name = 'flights'
-- ORDER BY grantee, column_name;

-- 4. Triggers activos
-- SELECT trigger_name, event_object_table, action_timing, action_orientation,
--        security_type
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public'
-- ORDER BY event_object_table, trigger_name;

-- 5. Propietario y tipo de seguridad de las funciones
-- SELECT proname, prosecdef,
--        CASE WHEN prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS sec_type,
--        proowner::regrole AS owner
-- FROM pg_proc
-- WHERE pronamespace = 'public'::regnamespace
--   AND proname IN (
--     'set_updated_at', 'handle_new_user', 'protect_verification_status',
--     'protect_profiles_created_at', 'verify_flight_status'
--   );

-- 6. Permisos EXECUTE sobre funciones
-- SELECT routine_name, grantee, privilege_type
-- FROM information_schema.role_routine_grants
-- WHERE routine_schema = 'public'
-- ORDER BY routine_name, grantee;

-- 7. Confirmar que authenticated NO tiene UPDATE(verification_status)
-- SELECT grantee, column_name, privilege_type
-- FROM information_schema.column_privileges
-- WHERE table_schema = 'public'
--   AND table_name = 'flights'
--   AND grantee = 'authenticated'
--   AND column_name = 'verification_status';
-- -- Debe devolver 0 filas.
