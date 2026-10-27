-- =============================================================================
-- My Flight Academy - Migración 002: registro de vuelos y rankings (Fase 3)
-- =============================================================================
-- Requiere 001_initial_schema.sql ya aplicada. NO modifica ni debilita RLS.
-- Aplicar primero en el proyecto de pruebas (my-flight-academy-tests).
-- Es idempotente: se puede ejecutar más de una vez sin efectos secundarios.
--
-- Contenido:
--   1. flights.simulator (columna nueva) + permiso de edición por columna.
--   2. Bloqueo de edición de vuelos que ya no están en 'unverified'.
--   3. landing_score(): puntuación de aterrizaje (criterio transparente).
--   4. ranking_hours() y ranking_performance(): rankings agregados que solo
--      cuentan vuelos VERIFICADOS de perfiles públicos.
-- =============================================================================


-- =============================================================================
-- 1. SIMULADOR
-- =============================================================================
-- Valores alineados con la lista del Diario de vuelo local (js/diario.js).
ALTER TABLE public.flights ADD COLUMN IF NOT EXISTS simulator TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'chk_flights_simulator'
          AND conrelid = 'public.flights'::regclass
    ) THEN
        ALTER TABLE public.flights
            ADD CONSTRAINT chk_flights_simulator
            CHECK (
                simulator IS NULL OR simulator IN (
                    'Microsoft Flight Simulator 2024',
                    'Microsoft Flight Simulator 2020',
                    'X-Plane 12',
                    'Prepar3D',
                    'Otro'
                )
            );
    END IF;
END $$;

COMMENT ON COLUMN public.flights.simulator IS
    'Simulador usado. Lista cerrada por CHECK. Editable por el usuario (no afecta a la verificación).';

-- INSERT y SELECT ya están concedidos a nivel de tabla en 001; UPDATE es por
-- columna, así que la columna nueva necesita su propio GRANT.
GRANT UPDATE (simulator) ON public.flights TO authenticated;


-- =============================================================================
-- 2. BLOQUEO DE EDICIÓN DE VUELOS NO 'unverified'
-- =============================================================================
-- Sin esto, un usuario podría editar duración o aterrizaje de un vuelo YA
-- verificado (flights_update_own solo comprueba la propiedad de la fila) y
-- manipular los rankings. Es una restricción adicional: no relaja RLS.
-- Solo afecta a authenticated y anon; el backend (verify_flight_status y
-- futuros procesos con service_role) no se ve afectado.
CREATE OR REPLACE FUNCTION public.protect_flights_locked_rows()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    IF OLD.verification_status <> 'unverified'
       AND current_role IN ('authenticated', 'anon') THEN
        RAISE EXCEPTION
            'Solo los vuelos sin verificar pueden editarse.'
            USING ERRCODE = 'insufficient_privilege';
    END IF;
    RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.protect_flights_locked_rows() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'trg_flights_lock_verified'
          AND tgrelid = 'public.flights'::regclass
    ) THEN
        CREATE TRIGGER trg_flights_lock_verified
        BEFORE UPDATE ON public.flights
        FOR EACH ROW EXECUTE FUNCTION public.protect_flights_locked_rows();
    END IF;
END $$;


-- =============================================================================
-- 3. PUNTUACIÓN DE ATERRIZAJE
-- =============================================================================
-- Único dato de "rendimiento" realmente disponible en flights: landing_vs_fpm
-- (velocidad vertical en el toque, en ft/min). Se usa el valor absoluto.
--   |VS| <= 100  -> 100
--   |VS| <= 200  ->  90
--   |VS| <= 300  ->  75
--   |VS| <= 400  ->  60
--   |VS| <= 600  ->  40
--   |VS| >  600  ->  20
CREATE OR REPLACE FUNCTION public.landing_score(p_vs INTEGER)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
    SELECT CASE
        WHEN p_vs IS NULL    THEN NULL
        WHEN abs(p_vs) <= 100 THEN 100
        WHEN abs(p_vs) <= 200 THEN 90
        WHEN abs(p_vs) <= 300 THEN 75
        WHEN abs(p_vs) <= 400 THEN 60
        WHEN abs(p_vs) <= 600 THEN 40
        ELSE 20
    END;
$$;

REVOKE EXECUTE ON FUNCTION public.landing_score(INTEGER) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.landing_score(INTEGER) TO authenticated, service_role;


-- =============================================================================
-- 4. RANKINGS
-- =============================================================================
-- Las políticas RLS de flights solo permiten ver los vuelos propios, así que
-- un ranking entre usuarios necesita agregar datos de todos. Se hace con
-- funciones SECURITY DEFINER que:
--   - devuelven SOLO agregados (nunca filas de vuelos ni user_id),
--   - incluyen SOLO perfiles con profile_visibility = 'public',
--   - cuentan SOLO vuelos completed + verified (los que el usuario no puede
--     auto-asignarse: verification_status solo cambia vía verify_flight_status),
--   - son ejecutables solo por authenticated (no anon).

-- ── Ranking por horas totales ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.ranking_hours(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
    rank_pos       BIGINT,
    username       TEXT,
    country        TEXT,
    flights_count  BIGINT,
    total_seconds  BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        row_number() OVER (
            ORDER BY SUM(f.duration_seconds) DESC, COUNT(*) DESC, p.username ASC
        ) AS rank_pos,
        p.username,
        p.country::TEXT,
        COUNT(*)::BIGINT,
        SUM(f.duration_seconds)::BIGINT
    FROM public.flights f
    JOIN public.profiles p ON p.id = f.user_id
    WHERE p.profile_visibility = 'public'
      AND f.flight_status = 'completed'
      AND f.verification_status = 'verified'
      AND f.duration_seconds IS NOT NULL
    GROUP BY p.id, p.username, p.country
    ORDER BY rank_pos
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100);
$$;

-- ── Ranking por rendimiento (aterrizajes) ───────────────────────────────────
-- Promedio de landing_score() sobre vuelos verificados con landing_vs_fpm.
-- Mínimo 3 aterrizajes para clasificar (evita que un solo aterrizaje bueno
-- domine la tabla).
CREATE OR REPLACE FUNCTION public.ranking_performance(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
    rank_pos           BIGINT,
    username           TEXT,
    country            TEXT,
    landings_count     BIGINT,
    avg_landing_fpm    NUMERIC,
    performance_score  NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        row_number() OVER (
            ORDER BY AVG(public.landing_score(f.landing_vs_fpm)) DESC,
                     COUNT(*) DESC, p.username ASC
        ) AS rank_pos,
        p.username,
        p.country::TEXT,
        COUNT(*)::BIGINT,
        ROUND(AVG(ABS(f.landing_vs_fpm)), 0),
        ROUND(AVG(public.landing_score(f.landing_vs_fpm)), 1)
    FROM public.flights f
    JOIN public.profiles p ON p.id = f.user_id
    WHERE p.profile_visibility = 'public'
      AND f.flight_status = 'completed'
      AND f.verification_status = 'verified'
      AND f.landing_vs_fpm IS NOT NULL
    GROUP BY p.id, p.username, p.country
    HAVING COUNT(*) >= 3
    ORDER BY rank_pos
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100);
$$;

-- Propietario postgres (bypassa RLS dentro de la función) y permisos mínimos.
-- Supabase concede EXECUTE a anon por defecto: se revoca de forma explícita.
ALTER FUNCTION public.ranking_hours(INTEGER)       OWNER TO postgres;
ALTER FUNCTION public.ranking_performance(INTEGER) OWNER TO postgres;

REVOKE EXECUTE ON FUNCTION public.ranking_hours(INTEGER)       FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.ranking_performance(INTEGER) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.ranking_hours(INTEGER)       TO authenticated;
GRANT  EXECUTE ON FUNCTION public.ranking_performance(INTEGER) TO authenticated;

COMMENT ON FUNCTION public.ranking_hours(INTEGER) IS
    'Ranking por horas: solo vuelos completed+verified de perfiles públicos. Devuelve agregados, nunca filas.';
COMMENT ON FUNCTION public.ranking_performance(INTEGER) IS
    'Ranking por rendimiento: promedio de landing_score() en vuelos verificados. Mínimo 3 aterrizajes.';


-- =============================================================================
-- VERIFICACIÓN (consultas comentadas, ejecutar tras aplicar)
-- =============================================================================
-- SELECT column_name FROM information_schema.columns
--  WHERE table_schema='public' AND table_name='flights' AND column_name='simulator';
-- SELECT tgname FROM pg_trigger WHERE tgrelid='public.flights'::regclass AND NOT tgisinternal;
-- SELECT routine_name, grantee FROM information_schema.role_routine_grants
--  WHERE routine_schema='public' AND routine_name LIKE 'ranking%' ORDER BY 1,2;