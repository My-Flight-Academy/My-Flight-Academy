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

-- Sin GRANT UPDATE a propósito (ver cabecera). INSERT ya está concedido a nivel
-- de tabla en 001, por lo que el conector puede escribir ambas columnas al crear.

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