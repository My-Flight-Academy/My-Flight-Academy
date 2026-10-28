-- =============================================================================
-- My Flight Academy - Migración 003: vuelos registrados por el conector (Fase 4)
-- =============================================================================
-- Requiere 001 y 002 ya aplicadas. NO modifica ni debilita RLS, ni los GRANT,
-- ni los triggers de verification_status. Aplicar primero en el proyecto de
-- pruebas (my-flight-academy-tests). Idempotente.
--
-- Qué añade (solo 2 columnas informativas en public.flights):
--   source          'manual' | 'connector'. Origen del registro.
--   connector_meta  JSONB pequeño con calidad de datos: qué campos el conector
--                   NO pudo detectar de forma fiable, pausas, saltos, etc.
--
-- Seguridad:
--   * El conector inserta como el usuario autenticado (JWT propio): se aplican
--     flights_insert_own (auth.uid() = user_id y verification_status = 'unverified').
--   * Las columnas nuevas NO reciben GRANT UPDATE para authenticated: tras el
--     INSERT no se pueden modificar desde el cliente.
--   * source/connector_meta son DATOS INFORMATIVOS ESCRITOS POR EL CLIENTE en el
--     INSERT. NUNCA deben usarse como criterio de confianza ni de verificación;
--     eso sigue siendo exclusivamente verify_flight_status() (service_role).
--   * La idempotencia ya existe: UNIQUE (user_id, session_uuid) de la migración 001.
-- =============================================================================

ALTER TABLE public.flights ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE public.flights ADD COLUMN IF NOT EXISTS connector_meta JSONB;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint
                   WHERE conname = 'chk_flights_source' AND conrelid = 'public.flights'::regclass) THEN
        ALTER TABLE public.flights
            ADD CONSTRAINT chk_flights_source CHECK (source IN ('manual', 'connector'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint
                   WHERE conname = 'chk_flights_connector_meta' AND conrelid = 'public.flights'::regclass) THEN
        ALTER TABLE public.flights
            ADD CONSTRAINT chk_flights_connector_meta
            CHECK (
                connector_meta IS NULL
                OR (jsonb_typeof(connector_meta) = 'object'
                    AND length(connector_meta::text) <= 2000)
            );
    END IF;
END $$;

COMMENT ON COLUMN public.flights.source IS
    'Origen del registro (manual/connector). Informativo, escrito por el cliente en el INSERT: no usar como criterio de confianza.';
COMMENT ON COLUMN public.flights.connector_meta IS
    'Calidad de datos del conector: campos no detectados, pausas, saltos de posición. Informativo; máx. 2000 caracteres.';

-- UPDATE por columna: quitar el UPDATE de TABLA que Supabase concede por defecto
-- (default privileges) y reconceder solo las columnas editables. Sin esto, el
-- GRANT por columna no restringe nada, porque el privilegio de tabla lo cubre todo.
REVOKE UPDATE ON public.flights FROM anon, authenticated;

GRANT UPDATE (
    dep_icao, arr_icao, alt_icao, aircraft,
    started_at, ended_at, duration_seconds, distance_nm,
    max_altitude_ft, landing_vs_fpm, flight_status, notes,
    simulator
) ON public.flights TO authenticated;

-- =============================================================================
-- VERIFICACIÓN (consultas comentadas, ejecutar tras aplicar)
-- =============================================================================
-- SELECT column_name, data_type, column_default FROM information_schema.columns
--  WHERE table_schema='public' AND table_name='flights' AND column_name IN ('source','connector_meta');
-- SELECT conname FROM pg_constraint
--  WHERE conrelid='public.flights'::regclass AND conname IN ('chk_flights_source','chk_flights_connector_meta');
-- SELECT grantee, column_name, privilege_type FROM information_schema.column_privileges
--  WHERE table_schema='public' AND table_name='flights' AND column_name IN ('source','connector_meta')
--    AND grantee='authenticated';   -- debe listar SOLO INSERT y SELECT, nunca UPDATE