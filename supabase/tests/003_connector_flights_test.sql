-- =============================================================================
-- Prueba de la migración 003 (conector, Fase 4) - ejecutar en el SQL Editor del
-- proyecto de PRUEBAS, después de aplicar 001, 002 y 003.
-- No deja datos: todo ocurre dentro de una transacción que termina en ROLLBACK.
-- Requiere al menos 1 usuario registrado (con perfil) en auth.users.
-- Resultado esperado: una tabla con TODAS las filas passed = true.
-- Simula al usuario autenticado con SET LOCAL ROLE authenticated + claim sub.
-- =============================================================================
BEGIN;

CREATE TEMP TABLE _r (n int, test text, passed boolean, detail text);
GRANT ALL ON _r TO PUBLIC;

SELECT set_config('request.jwt.claim.sub', (SELECT id::text FROM auth.users LIMIT 1), true) AS usuario_de_prueba;
SET LOCAL ROLE authenticated;

DO $$
DECLARE
    me  uuid := auth.uid();
    s1  uuid := gen_random_uuid();
    cnt int; st text; src text; ok boolean; code text;
BEGIN
    IF me IS NULL THEN RAISE EXCEPTION 'No hay usuarios en auth.users: crea uno primero.'; END IF;

    -- 1. Inserción como la hace el conector
    BEGIN
        INSERT INTO public.flights (user_id, session_uuid, dep_icao, arr_icao, aircraft, started_at, ended_at,
               duration_seconds, distance_nm, max_altitude_ft, landing_vs_fpm, flight_status, simulator, source, connector_meta)
        VALUES (me, s1, 'SKBG', 'SKBO', 'Test', now() - interval '1 hour', now() - interval '20 minutes',
               2400, 156.39, 20000, -126, 'completed', 'Microsoft Flight Simulator 2024', 'connector',
               '{"v":1,"undetected":["alt_icao"]}'::jsonb)
        ON CONFLICT (user_id, session_uuid) DO NOTHING;
        INSERT INTO _r VALUES (1, 'INSERT del conector con RLS', true, 'ok');
    EXCEPTION WHEN OTHERS THEN INSERT INTO _r VALUES (1, 'INSERT del conector con RLS', false, SQLSTATE || ' ' || SQLERRM); END;

    -- 2. Idempotencia: mismo session_uuid no duplica
    BEGIN
        INSERT INTO public.flights (user_id, session_uuid, source) VALUES (me, s1, 'connector')
        ON CONFLICT (user_id, session_uuid) DO NOTHING;
        SELECT count(*) INTO cnt FROM public.flights WHERE session_uuid = s1;
        INSERT INTO _r VALUES (2, 'Reenvío del mismo vuelo no duplica', cnt = 1, 'filas=' || cnt);
    EXCEPTION WHEN OTHERS THEN INSERT INTO _r VALUES (2, 'Reenvío del mismo vuelo no duplica', false, SQLSTATE || ' ' || SQLERRM); END;

    -- 3. Estado por defecto
    SELECT verification_status INTO st FROM public.flights WHERE session_uuid = s1;
    INSERT INTO _r VALUES (3, 'verification_status queda en unverified', st = 'unverified', coalesce(st, 'NULL'));

    -- 4. Insertar como 'verified' debe fallar (RLS)
    BEGIN INSERT INTO public.flights (user_id, session_uuid, verification_status) VALUES (me, gen_random_uuid(), 'verified'); ok := false; code := 'sin error';
    EXCEPTION WHEN OTHERS THEN ok := SQLSTATE = '42501'; code := SQLSTATE; END;
    INSERT INTO _r VALUES (4, 'INSERT con verification_status=verified es rechazado', ok, code);

    -- 5. Insertar a nombre de otro usuario debe fallar (RLS)
    BEGIN INSERT INTO public.flights (user_id, session_uuid) VALUES (gen_random_uuid(), gen_random_uuid()); ok := false; code := 'sin error';
    EXCEPTION WHEN OTHERS THEN ok := SQLSTATE = '42501'; code := SQLSTATE; END;
    INSERT INTO _r VALUES (5, 'INSERT a nombre de otro usuario es rechazado', ok, code);

    -- 6-8. UPDATE de columnas protegidas debe fallar (sin GRANT)
    BEGIN UPDATE public.flights SET source = 'manual' WHERE session_uuid = s1; ok := false; code := 'sin error';
    EXCEPTION WHEN OTHERS THEN ok := SQLSTATE = '42501'; code := SQLSTATE; END;
    INSERT INTO _r VALUES (6, 'UPDATE de source es rechazado', ok, code);

    BEGIN UPDATE public.flights SET connector_meta = '{}'::jsonb WHERE session_uuid = s1; ok := false; code := 'sin error';
    EXCEPTION WHEN OTHERS THEN ok := SQLSTATE = '42501'; code := SQLSTATE; END;
    INSERT INTO _r VALUES (7, 'UPDATE de connector_meta es rechazado', ok, code);

    BEGIN UPDATE public.flights SET verification_status = 'verified' WHERE session_uuid = s1; ok := false; code := 'sin error';
    EXCEPTION WHEN OTHERS THEN ok := SQLSTATE = '42501'; code := SQLSTATE; END;
    INSERT INTO _r VALUES (8, 'UPDATE de verification_status es rechazado', ok, code);

    -- 9-11. CHECK constraints
    BEGIN INSERT INTO public.flights (user_id, session_uuid, source) VALUES (me, gen_random_uuid(), 'hack'); ok := false; code := 'sin error';
    EXCEPTION WHEN OTHERS THEN ok := SQLSTATE = '23514'; code := SQLSTATE; END;
    INSERT INTO _r VALUES (9, 'source inválido es rechazado (CHECK)', ok, code);

    BEGIN INSERT INTO public.flights (user_id, session_uuid, source, connector_meta) VALUES (me, gen_random_uuid(), 'connector', jsonb_build_object('x', repeat('a', 3000))); ok := false; code := 'sin error';
    EXCEPTION WHEN OTHERS THEN ok := SQLSTATE = '23514'; code := SQLSTATE; END;
    INSERT INTO _r VALUES (10, 'connector_meta > 2000 caracteres es rechazado', ok, code);

    BEGIN INSERT INTO public.flights (user_id, session_uuid, source, connector_meta) VALUES (me, gen_random_uuid(), 'connector', '[1,2]'::jsonb); ok := false; code := 'sin error';
    EXCEPTION WHEN OTHERS THEN ok := SQLSTATE = '23514'; code := SQLSTATE; END;
    INSERT INTO _r VALUES (11, 'connector_meta que no es objeto es rechazado', ok, code);

    -- 12. El frontend actual (sin las columnas nuevas) sigue funcionando
    BEGIN
        INSERT INTO public.flights (user_id, dep_icao, flight_status) VALUES (me, 'SKBG', 'completed') RETURNING source INTO src;
        INSERT INTO _r VALUES (12, 'INSERT del frontend actual sigue funcionando (source=manual)', src = 'manual', coalesce(src, 'NULL'));
    EXCEPTION WHEN OTHERS THEN INSERT INTO _r VALUES (12, 'INSERT del frontend actual sigue funcionando (source=manual)', false, SQLSTATE || ' ' || SQLERRM); END;
END $$;

RESET ROLE;
SELECT n, test, passed, detail FROM _r ORDER BY n;

ROLLBACK;