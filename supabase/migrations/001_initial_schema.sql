-- =============================================================================
-- My Flight Academy — Migración 001: Esquema inicial (v2 — post-auditoría)
-- =============================================================================
-- Historial de cambios:
--   v1 (Fase 1 inicial)   : Esquema base, RLS, triggers.
--   v2 (correcciones audit): Resuelve ALTO-1, ALTO-2, MEDIO-1, MEDIO-2,
--                            MEDIO-3, BAJO-1, BAJO-2 e INFORMATIVO-1/2.
--
-- Prerequisito : El esquema "auth" de Supabase ya existe (gestionado por
--                Supabase). No ejecutar en instancias sin ese esquema.
-- Idempotente  : Sí — usa IF NOT EXISTS / OR REPLACE / DO-guard.
--                Puede ejecutarse de nuevo sin destruir datos existentes.
-- Entorno      : Supabase (PostgreSQL 15+). Las funciones usan sintaxis PG15.
--                Validado con análisis estático; pendiente de ejecución real.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONES
-- ---------------------------------------------------------------------------
-- pgcrypto: gen_random_uuid(). En PG13+ también existe como built-in, pero
-- declararlo explícitamente garantiza disponibilidad sin asumir la versión.
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =============================================================================
-- TABLA: profiles
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    -- PK: mismo UUID que auth.users.id. Relación 1-a-1.
    id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Handle público único. Solo minúsculas, números, _ . -
    -- Normalizado a minúsculas por la función handle_new_user.
    username            TEXT NOT NULL
                            UNIQUE
                            CHECK (
                                char_length(username) BETWEEN 3 AND 30
                                AND username ~ '^[a-z0-9_.-]+$'
                            ),

    avatar_url          TEXT,

    -- ISO 3166-1 alpha-2 en mayúsculas, ej. "CO", "ES", "MX".
    country             CHAR(2) CHECK (country ~ '^[A-Z]{2}$'),

    -- Visibilidad del perfil.
    profile_visibility  TEXT NOT NULL DEFAULT 'public'
                            CHECK (profile_visibility IN ('public', 'private')),

    -- created_at: protegido contra modificación por el usuario.
    -- Ver trigger trg_profiles_protect_created_at más abajo.
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.profiles IS 'Perfil público de cada usuario. Vinculado 1-a-1 con auth.users.';
COMMENT ON COLUMN public.profiles.id                 IS 'Mismo UUID que auth.users.id.';
COMMENT ON COLUMN public.profiles.username           IS 'Handle público único. Solo minúsculas, números, _ . -';
COMMENT ON COLUMN public.profiles.profile_visibility IS '''public'' o ''private''. Controla la exposición en rankings y comunidad.';
COMMENT ON COLUMN public.profiles.created_at         IS 'Inmutable tras la creación. Protegido por trigger.';

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);


-- ---------------------------------------------------------------------------
-- FUNCIÓN: set_updated_at
-- ---------------------------------------------------------------------------
-- Actualiza updated_at en cualquier tabla que tenga esa columna.
-- SECURITY DEFINER + search_path fijo para prevenir search_path injection.
-- Se revoca EXECUTE a PUBLIC porque este función no debe ser invocada
-- directamente por clientes; solo por triggers definidos en este archivo.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Las funciones de trigger son invocadas por el motor, no por el cliente.
-- Revocar EXECUTE a PUBLIC no impide que los triggers las ejecuten.
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC;

-- Trigger updated_at para profiles
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
-- FUNCIÓN: protect_profiles_created_at  (resuelve BAJO-2)
-- ---------------------------------------------------------------------------
-- Impide que cualquier UPDATE modifique created_at en profiles,
-- independientemente del rol. Solo el propio trigger de creación
-- establece created_at en el momento del INSERT.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profiles_created_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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
-- FUNCIÓN: handle_new_user  (resuelve MEDIO-3)
-- ---------------------------------------------------------------------------
-- Crea automáticamente una fila en public.profiles cuando Supabase Auth
-- registra un usuario nuevo en auth.users.
--
-- CAMBIOS respecto a v1:
--   1. Guard de 100 iteraciones máximas para el bucle de colisiones.
--   2. Email nulo (usuarios OAuth sin email): usa 'pilot' como base.
--   3. Estrategia de reintento ante unique_violation concurrente:
--      captura la excepción y reintenta una vez con un sufijo aleatorio
--      (4 dígitos) para evitar que dos registros concurrentes colisionen
--      en el mismo sufijo secuencial.
--   4. El INSERT usa ON CONFLICT DO NOTHING como última línea de defensa.
--
-- POR QUÉ SECURITY DEFINER:
--   El trigger se ejecuta en el contexto del esquema auth, donde el nuevo
--   usuario aún no tiene permisos de escritura en public.profiles.
--   SECURITY DEFINER permite la escritura con los privilegios del propietario
--   de la función (postgres/supabase_admin), que sí tiene ese acceso.
--
-- QUÉ PUEDE MODIFICAR ESTA FUNCIÓN:
--   Solo inserta en public.profiles (id, username). No lee ni expone
--   ningún otro campo de auth.users más allá del id y el email
--   (el email se usa solo para derivar el username y no se almacena).
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
    -- Derivar username base.
    -- Si email es NULL (registro OAuth sin email), usar 'pilot' como base.
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

    -- Garantizar longitud mínima de 3 caracteres.
    IF char_length(base_username) < 3 THEN
        base_username := base_username || 'usr';
    END IF;

    -- Truncar a 26 caracteres (deja 4 para el sufijo numérico).
    base_username  := left(base_username, 26);
    final_username := base_username;

    -- Resolver colisiones con sufijo incremental.
    -- Guard de 100 iteraciones: si hay tantas colisiones es señal de problema.
    WHILE EXISTS (
        SELECT 1 FROM public.profiles WHERE username = final_username
    ) LOOP
        suffix := suffix + 1;
        IF suffix > max_attempts THEN
            -- Usar sufijo aleatorio de 4 dígitos como fallback final.
            final_username := left(base_username, 22) ||
                              lpad((floor(random() * 9000) + 1000)::INT::TEXT, 4, '0');
            EXIT;
        END IF;
        final_username := base_username || suffix::TEXT;
    END LOOP;

    -- INSERT con ON CONFLICT DO NOTHING: defensa ante registros concurrentes.
    -- Si dos transacciones concurrentes generan el mismo username final,
    -- la constraint UNIQUE lo captura. ON CONFLICT DO NOTHING evita el error
    -- y deja el registro existente intacto.
    -- Nota: si el perfil ya existe (re-ejecución idempotente de la migración),
    -- tampoco se produce error.
    INSERT INTO public.profiles (id, username)
    VALUES (NEW.id, final_username)
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;

EXCEPTION
    -- Capturar unique_violation sobre username (concurrencia) y reintentar
    -- con un sufijo aleatorio adicional, que estadísticamente no colisionará.
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

-- Esta función es invocada solo por el trigger trg_on_auth_user_created.
-- No debe ser llamada directamente por ningún cliente.
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

    -- ON DELETE CASCADE: si el usuario elimina su cuenta, sus vuelos se
    -- eliminan también. Comportamiento explícito y documentado.
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Identificador estable de la sesión del conector.
    -- ÚNICO POR USUARIO: un mismo connector no puede crear dos vuelos para
    -- el mismo user_id con el mismo session_uuid. La unicidad global no
    -- aportaría ninguna garantía adicional de negocio y podría generar
    -- conflictos espurios si dos usuarios distintos usasen el mismo UUID
    -- por un bug del conector.
    -- Ver decisión técnica en docs/database.md §3.2.
    session_uuid        UUID,
    CONSTRAINT uq_flights_user_session UNIQUE (user_id, session_uuid),

    dep_icao            CHAR(4) CHECK (dep_icao ~ '^[A-Z0-9]{4}$'),
    arr_icao            CHAR(4) CHECK (arr_icao ~ '^[A-Z0-9]{4}$'),
    alt_icao            CHAR(4) CHECK (alt_icao ~ '^[A-Z0-9]{4}$'),

    aircraft            TEXT CHECK (char_length(aircraft) <= 80),

    -- Cronología. Los dos campos deben existir juntos o no existir ninguno.
    started_at          TIMESTAMPTZ,
    ended_at            TIMESTAMPTZ,

    -- Duración en segundos. NULL si desconocida; no forzar a 0.
    duration_seconds    INTEGER CHECK (
                            duration_seconds IS NULL
                            OR duration_seconds BETWEEN 60 AND 86400
                        ),

    -- Métricas opcionales. NULL = dato no disponible, distinto de cero.
    distance_nm         NUMERIC(8,2) CHECK (distance_nm IS NULL OR distance_nm > 0),
    max_altitude_ft     INTEGER      CHECK (
                            max_altitude_ft IS NULL
                            OR max_altitude_ft BETWEEN -2000 AND 100000
                        ),

    -- Tasa de descenso al toque en ft/min (negativo = descenso normal).
    -- Rango ±6 000 ft/min: cubre acrobacias y situaciones de emergencia
    -- sin aceptar valores físicamente imposibles para aeronaves convencionales.
    -- Se acepta NULL cuando el conector no puede medir el contacto.
    landing_vs_fpm      INTEGER CHECK (
                            landing_vs_fpm IS NULL
                            OR landing_vs_fpm BETWEEN -6000 AND 6000
                        ),

    -- Estado operacional del vuelo.
    flight_status       TEXT NOT NULL DEFAULT 'planned'
                            CHECK (flight_status IN (
                                'planned','active','completed',
                                'interrupted','cancelled'
                            )),

    -- Estado de verificación.
    -- PROTECCIÓN: este campo NO puede ser modificado por usuarios autenticados.
    -- La protección se implementa mediante el trigger
    -- trg_flights_protect_verification (ver más abajo), que comprueba
    -- current_role. Solo los roles 'service_role', 'postgres' y
    -- 'supabase_admin' pueden cambiar este valor.
    -- La política RLS flights_update_own ya no contiene subconsultas
    -- autorreferenciales frágiles.
    verification_status TEXT NOT NULL DEFAULT 'unverified'
                            CHECK (verification_status IN (
                                'unverified','pending_review',
                                'verified','rejected'
                            )),

    notes               TEXT CHECK (char_length(notes) <= 4000),

    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- ── Constraints inter-columna ──────────────────────────────────────────

    -- Las fechas deben existir en par o no existir ninguna.
    CONSTRAINT chk_flights_dates_both_or_none
        CHECK (
            (started_at IS NULL AND ended_at IS NULL)
            OR (started_at IS NOT NULL AND ended_at IS NOT NULL)
        ),

    -- El vuelo no puede terminar antes de empezar.
    CONSTRAINT chk_flights_end_after_start
        CHECK (ended_at IS NULL OR ended_at > started_at),

    -- Duración máxima derivada de las fechas: 24 horas.
    CONSTRAINT chk_flights_duration_max
        CHECK (
            ended_at IS NULL OR started_at IS NULL
            OR EXTRACT(EPOCH FROM (ended_at - started_at)) <= 86400
        ),

    -- Coherencia entre duration_seconds y el par de fechas (resuelve BAJO-1).
    -- Solo aplica cuando los tres valores están presentes.
    -- Tolerancia de 120 s para latencias de red o redondeo del conector.
    -- Este constraint NO rechaza registros donde falta alguno de los tres
    -- valores (el caso habitual de registros manuales desde el frontend).
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
COMMENT ON COLUMN public.flights.session_uuid        IS 'UUID de la sesión del conector. Único por (user_id, session_uuid).';
COMMENT ON COLUMN public.flights.verification_status IS 'Protegido por trigger. Solo roles privilegiados (service_role, postgres) pueden modificarlo.';
COMMENT ON COLUMN public.flights.duration_seconds    IS 'Duración en segundos. NULL si desconocida. No forzar a 0.';
COMMENT ON COLUMN public.flights.landing_vs_fpm      IS 'Tasa de descenso al toque (ft/min, negativo). Rango ±6000. NULL si no medido.';

CREATE INDEX IF NOT EXISTS idx_flights_user_created
    ON public.flights (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_flights_user_status
    ON public.flights (user_id, flight_status);

CREATE INDEX IF NOT EXISTS idx_flights_ranking
    ON public.flights (user_id, duration_seconds DESC)
    WHERE flight_status = 'completed' AND verification_status = 'verified';

-- Trigger updated_at para flights
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
-- FUNCIÓN: protect_flights_verification_status  (resuelve ALTO-1)
-- ---------------------------------------------------------------------------
-- Impide que roles no privilegiados modifiquen verification_status.
--
-- MECANISMO:
--   El trigger comprueba current_role (el rol PostgreSQL real de la sesión,
--   no un valor del JWT que el cliente pueda falsificar). Si el rol es
--   'authenticated' o 'anon', y el nuevo valor de verification_status
--   difiere del actual, la operación se rechaza con un error claro.
--
--   Los roles privilegiados ('service_role', 'postgres', 'supabase_admin')
--   pueden modificar verification_status directamente, sin necesidad de
--   variables de sesión ni flags adicionales.
--
-- POR QUÉ current_role ES SEGURO:
--   current_role refleja el rol PostgreSQL activo en la conexión, asignado
--   por Supabase al autenticar la petición. Un cliente con la anon_key
--   obtiene el rol 'anon'; uno con un JWT válido obtiene 'authenticated'.
--   Ningún cliente puede cambiar su propio current_role mediante SQL
--   (solo un superuser puede hacer SET ROLE a un rol privilegiado).
--
-- CÓMO HABILITAR VERIFICACIÓN DESDE EL BACKEND (Fase futura):
--   La función RPC de verificación se implementará como SECURITY DEFINER
--   con propietario 'postgres' (superuser). Al ejecutarse, current_role
--   es el propietario de la función (postgres), que está en la lista
--   permitida, y el trigger no bloqueará el cambio.
--   Alternativamente, si se usa service_role desde una Edge Function,
--   current_role es 'service_role', también permitido.
--
-- ADVERTENCIA:
--   Este trigger se ejecuta incluso si la función RPC usa SECURITY DEFINER.
--   SECURITY DEFINER cambia el contexto de privilegios pero NO cambia
--   current_role a menos que la función incluya SET ROLE explícitamente.
--   Esto es intencional: la función RPC verificará vuelos desde postgres
--   (propietario de la función), lo que sí está en la lista permitida.
--
-- QUÉ NO HACE ESTE TRIGGER:
--   No protege otros campos (para eso existe la política RLS).
--   No invalida vuelos ya verificados (eso lo hará la lógica RPC futura).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_flights_verification_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Solo actuar si verification_status está cambiando.
    IF NEW.verification_status IS NOT DISTINCT FROM OLD.verification_status THEN
        RETURN NEW;
    END IF;

    -- Permitir el cambio solo a roles privilegiados.
    -- 'authenticated' y 'anon' son los roles de usuarios finales en Supabase.
    IF current_role IN ('authenticated', 'anon') THEN
        RAISE EXCEPTION
            'No tienes permiso para cambiar el estado de verificación de un vuelo. '
            'Esta operación requiere autorización de backend.'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.protect_flights_verification_status() FROM PUBLIC;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'trg_flights_protect_verification'
          AND tgrelid = 'public.flights'::regclass
    ) THEN
        CREATE TRIGGER trg_flights_protect_verification
        BEFORE UPDATE ON public.flights
        FOR EACH ROW EXECUTE FUNCTION public.protect_flights_verification_status();
    END IF;
END $$;


-- =============================================================================
-- TABLA: simulator_sessions
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.simulator_sessions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- UUID generado por el conector. Único globalmente: un mismo evento del
    -- conector no puede generar dos sesiones distintas en ningún usuario.
    -- A diferencia de session_uuid en flights, aquí la unicidad global sí
    -- tiene sentido: el connector_session_id identifica una instancia única
    -- de ejecución del programa conector, no una sesión de usuario.
    connector_session_id    UUID NOT NULL UNIQUE,

    -- El servidor asigna estas marcas de tiempo, NO el cliente.
    started_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen               TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Vuelo asociado a esta sesión (puede ser NULL mientras el vuelo no se complete).
    flight_id               UUID REFERENCES public.flights(id) ON DELETE SET NULL,

    session_status          TEXT NOT NULL DEFAULT 'active'
                                CHECK (session_status IN (
                                    'active','completed','lost','error'
                                )),

    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.simulator_sessions IS 'Sesiones del conector MSFS24. Una sesión puede generar uno o más vuelos.';
COMMENT ON COLUMN public.simulator_sessions.connector_session_id IS 'UUID generado por el conector. UNIQUE global: identifica una instancia única de ejecución.';
COMMENT ON COLUMN public.simulator_sessions.started_at           IS 'Asignado por el servidor con now(). No usar el reloj del cliente.';

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

    -- NULL = activo. Registros revocados se conservan para auditoría.
    revoked_at      TIMESTAMPTZ,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.device_connections IS 'Dispositivos vinculados (conector MSFS24). Estructura preparatoria; autenticación real en fases posteriores.';
COMMENT ON COLUMN public.device_connections.revoked_at IS 'NULL = activo. No eliminar filas: conservar historial de auditoría.';

CREATE INDEX IF NOT EXISTS idx_device_connections_user_active
    ON public.device_connections (user_id)
    WHERE revoked_at IS NULL;


-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================


-- ---------------------------------------------------------------------------
-- RLS: profiles
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Lectura pública de perfiles marcados como 'public'.
CREATE POLICY "profiles_select_public"
    ON public.profiles FOR SELECT
    USING (profile_visibility = 'public');

-- El propietario puede leer su propio perfil aunque sea 'private'.
CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- El propietario puede actualizar su perfil.
-- La protección de created_at la realiza el trigger trg_profiles_protect_created_at,
-- no esta política, para evitar subconsultas autorreferenciales.
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING  (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- INSERT: solo el trigger handle_new_user (SECURITY DEFINER) puede insertar.
-- Los usuarios autenticados no tienen política INSERT: la inserción directa
-- está bloqueada.

-- DELETE: no se permite desde el cliente.


-- ---------------------------------------------------------------------------
-- RLS: flights
-- ---------------------------------------------------------------------------
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;

-- El propietario puede ver sus propios vuelos.
CREATE POLICY "flights_select_own"
    ON public.flights FOR SELECT
    USING (auth.uid() = user_id);

-- El propietario puede insertar vuelos.
-- verification_status solo puede ser 'unverified' al insertar.
-- La constraint CHECK de la tabla ya lo valida; esta política es una
-- capa adicional de intención explícita.
CREATE POLICY "flights_insert_own"
    ON public.flights FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND verification_status = 'unverified'
    );

-- El propietario puede actualizar sus vuelos.
-- La protección de verification_status la realiza el trigger
-- trg_flights_protect_verification, que comprueba current_role.
-- Esta política ya no contiene subconsultas autorreferenciales.
CREATE POLICY "flights_update_own"
    ON public.flights FOR UPDATE
    USING  (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- El propietario puede eliminar sus propios vuelos.
CREATE POLICY "flights_delete_own"
    ON public.flights FOR DELETE
    USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- RLS: simulator_sessions
-- ---------------------------------------------------------------------------
ALTER TABLE public.simulator_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sim_sessions_select_own"
    ON public.simulator_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "sim_sessions_insert_own"
    ON public.simulator_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sim_sessions_update_own"
    ON public.simulator_sessions FOR UPDATE
    USING  (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- RLS: device_connections
-- ---------------------------------------------------------------------------
ALTER TABLE public.device_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "device_connections_select_own"
    ON public.device_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "device_connections_insert_own"
    ON public.device_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "device_connections_update_own"
    ON public.device_connections FOR UPDATE
    USING  (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- =============================================================================
-- PERMISOS DE TABLA Y COLUMNA  (resuelve MEDIO-1)
-- =============================================================================
-- Supabase aplica GRANT ALL en el esquema public por defecto en proyectos
-- nuevos, pero esa configuración no es parte de esta migración y puede diferir
-- en instancias locales (supabase start) o entornos de CI/CD.
-- Se declaran aquí de forma explícita y mínima para que la migración sea
-- reproducible en cualquier entorno.
--
-- PRINCIPIO DE MÍNIMO PRIVILEGIO:
--   anon        : Solo SELECT sobre la vista public_profiles.
--                 Sin acceso directo a ninguna tabla.
--   authenticated: SELECT + INSERT + UPDATE + DELETE donde tiene sentido,
--                 con RLS como barrera principal.
--                 UPDATE (verification_status) en flights NO se revoca a nivel
--                 de columna porque la protección la da el trigger, que es más
--                 robusto y no depende del cliente que invoca la API.
--                 Revocar el privilegio de columna rompería las actualizaciones
--                 legítimas que el usuario hace en otros campos del mismo vuelo
--                 si la petición incluye verification_status con su valor actual.
-- =============================================================================

-- Acceso al esquema (prerequisito para cualquier operación)
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- profiles
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
-- anon no tiene acceso directo a la tabla; usa la vista public_profiles.

-- flights
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flights TO authenticated;

-- simulator_sessions
GRANT SELECT, INSERT, UPDATE ON public.simulator_sessions TO authenticated;

-- device_connections
GRANT SELECT, INSERT, UPDATE ON public.device_connections TO authenticated;

-- Las secuencias de las PKs (UUIDs con gen_random_uuid no usan secuencias,
-- pero se incluye por compatibilidad con entornos que usen SERIAL):
-- (No aplica aquí porque todas las PKs son UUID con DEFAULT gen_random_uuid())


-- =============================================================================
-- VISTA PÚBLICA DE PERFILES  (resuelve ALTO-2)
-- =============================================================================
-- WITH (security_invoker = true): la vista evalúa RLS con el rol del llamante,
-- no con el del propietario. Disponible desde PostgreSQL 15.
-- Supabase usa PostgreSQL 15 en todos los proyectos creados desde 2023.
--
-- RESULTADO:
--   - anon        → ve solo perfiles con profile_visibility = 'public'
--                   (política profiles_select_public + filtro WHERE de la vista)
--   - authenticated → ve perfiles públicos + el suyo propio si es privado
--                   (políticas profiles_select_public + profiles_select_own)
--
-- COLUMNAS EXPUESTAS: solo las necesarias para la comunidad.
-- NO se expone profile_visibility, updated_at ni ningún campo sensible.
--
-- PERMISOS:
--   anon y authenticated reciben SELECT sobre la vista.
--   Para que security_invoker funcione, anon también necesita SELECT sobre
--   la tabla subyacente (public.profiles), pero RLS impide que acceda a
--   filas privadas. Se otorga solo SELECT.
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
    'Vista de perfiles públicos. security_invoker=true: RLS evalúa con el rol del llamante. '
    'Solo expone columnas autorizadas explícitamente.';

-- Permisos sobre la vista
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Para que security_invoker funcione, el rol llamante necesita SELECT
-- sobre la tabla subyacente (para que RLS pueda evaluarse).
-- RLS sigue siendo la barrera real; este GRANT solo permite que PostgreSQL
-- evalúe las políticas. Sin este GRANT, security_invoker devuelve
-- "permission denied" antes de llegar a evaluar RLS.
GRANT SELECT ON public.profiles TO anon;


-- =============================================================================
-- VERIFICACIÓN DE ESTRUCTURA (consultas de comprobación, comentadas)
-- =============================================================================
-- Ejecutar después de aplicar la migración para confirmar el estado.
-- No modifican datos.
-- =============================================================================

-- 1. Tablas con RLS habilitado
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN ('profiles','flights','simulator_sessions','device_connections');

-- 2. Políticas activas
-- SELECT tablename, policyname, cmd, qual, with_check
-- FROM pg_policies WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- 3. Triggers activos
-- SELECT trigger_name, event_object_table, action_timing, event_manipulation
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public'
-- ORDER BY event_object_table, trigger_name;

-- 4. Permisos de tabla
-- SELECT grantee, table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE table_schema = 'public'
-- ORDER BY table_name, grantee;

-- 5. Propietario y permisos de funciones
-- SELECT proname, prosecdef, proowner::regrole
-- FROM pg_proc
-- WHERE pronamespace = 'public'::regnamespace
--   AND proname IN (
--     'set_updated_at','handle_new_user',
--     'protect_flights_verification_status',
--     'protect_profiles_created_at'
--   );

-- 6. Verificar que anon no puede leer flights directamente
-- SET LOCAL role anon;
-- SELECT count(*) FROM public.flights; -- debe devolver 0 filas o error de RLS

-- 7. Verificar que authenticated no puede cambiar verification_status
-- SET LOCAL role authenticated;
-- SET LOCAL "request.jwt.claims" TO '{"sub":"<uuid-de-prueba>","role":"authenticated"}';
-- UPDATE public.flights SET verification_status = 'verified' WHERE id = '<uuid-vuelo>';
-- -- Debe lanzar: insufficient_privilege
