-- =============================================================================
-- Prueba de la migración 004 (verificación automática) - ejecutar en el SQL Editor
-- del proyecto de PRUEBAS, después de aplicar 001, 002, 003 (con su REVOKE) y 004.
-- No deja datos: todo ocurre dentro de una transacción que termina en ROLLBACK.
-- Requiere al menos 1 usuario registrado (con perfil) en auth.users.
-- Resultado esperado: 21 filas, TODAS con passed = true.
-- Usa fechas de hace ~2000 días para no solaparse con tus vuelos reales.
-- =============================================================================
BEGIN;

CREATE TEMP TABLE _r (n int, test text, passed boolean, detail text);
CREATE TEMP TABLE _s (n int, id uuid);
GRANT ALL ON _r, _s TO PUBLIC;

SELECT set_config('request.jwt.claim.sub', (SELECT id::text FROM auth.users LIMIT 1), true) AS usuario_de_prueba;
SET LOCAL ROLE authenticated;

DO $$
DECLARE
    me    uuid := auth.uid();
    b     timestamptz := now() - interval '2000 days';
    valid jsonb := '{"v":1,"paused_s":0,"touchdowns":1,"undetected":[],"max_sim_rate":1,"position_jumps":0,"sim_version":"12.2.282174.999"}'::jsonb;
    s1 uuid := gen_random_uuid(); s2 uuid := gen_random_uuid(); s3 uuid := gen_random_uuid();
    s4 uuid := gen_random_uuid(); s5 uuid := gen_random_uuid(); s6 uuid := gen_random_uuid();
    s7 uuid := gen_random_uuid(); s8 uuid := gen_random_uuid(); s9 uuid := gen_random_uuid();
    s10 uuid := gen_random_uuid(); s11 uuid := gen_random_uuid();
    st text; cnt int; ok boolean; code text;
BEGIN
    IF me IS NULL THEN RAISE EXCEPTION 'No hay usuarios en auth.users: crea uno primero.'; END IF;
    INSERT INTO _s VALUES (1,s1),(2,s2),(3,s3),(4,s4),(5,s5),(6,s6),(7,s7),(8,s8),(9,s9),(10,s10),(11,s11);

    -- Preparación: vuelos insertados como los inserta el conector (usuario autenticado).
    BEGIN
        -- 1 válido
        INSERT INTO public.flights (user_id, session_uuid, dep_icao, arr_icao, started_at, ended_at, duration_seconds, distance_nm, flight_status, source, connector_meta)
        VALUES (me, s1, 'SKBG', 'SKBO', b, b + interval '1 hour', 3600, 300, 'completed', 'connector', valid);
        -- 2 saltos de posición
        INSERT INTO public.flights (user_id, session_uuid, dep_icao, arr_icao, started_at, ended_at, duration_seconds, distance_nm, flight_status, source, connector_meta)
        VALUES (me, s2, 'SKBG', 'SKBO', b + interval '10 hours', b + interval '11 hours', 3600, 300, 'completed', 'connector', jsonb_set(valid, '{position_jumps}', '1'));
        -- 3 sin metadatos
        INSERT INTO public.flights (user_id, session_uuid, dep_icao, arr_icao, started_at, ended_at, duration_seconds, distance_nm, flight_status, source)
        VALUES (me, s3, 'SKBG', 'SKBO', b + interval '20 hours', b + interval '21 hours', 3600, 300, 'completed', 'connector');
        -- 4 velocidad media irreal (5000 nm en 1 h a 1x)
        INSERT INTO public.flights (user_id, session_uuid, dep_icao, arr_icao, started_at, ended_at, duration_seconds, distance_nm, flight_status, source, connector_meta)
        VALUES (me, s4, 'SKBG', 'SKBO', b + interval '30 hours', b + interval '31 hours', 3600, 5000, 'completed', 'connector', valid);
        -- 5 pausa excesiva (2000 s de 3600 s)
        INSERT INTO public.flights (user_id, session_uuid, dep_icao, arr_icao, started_at, ended_at, duration_seconds, distance_nm, flight_status, source, connector_meta)
        VALUES (me, s5, 'SKBG', 'SKBO', b + interval '40 hours', b + interval '41 hours', 3600, 300, 'completed', 'connector', jsonb_set(valid, '{paused_s}', '2000'));
        -- 6 solapado con el 1
        INSERT INTO public.flights (user_id, session_uuid, dep_icao, arr_icao, started_at, ended_at, duration_seconds, distance_nm, flight_status, source, connector_meta)
        VALUES (me, s6, 'SKBG', 'SKBO', b + interval '30 minutes', b + interval '90 minutes', 3600, 300, 'completed', 'connector', valid);
        -- 7 manual completado (no se evalúa)
        INSERT INTO public.flights (user_id, session_uuid, dep_icao, arr_icao, started_at, ended_at, duration_seconds, distance_nm, flight_status, source, connector_meta)
        VALUES (me, s7, 'SKBG', 'SKBO', b + interval '50 hours', b + interval '51 hours', 3600, 300, 'completed', 'manual', valid);
        -- 8 interrumpido del conector (no se evalúa)
        INSERT INTO public.flights (user_id, session_uuid, dep_icao, arr_icao, started_at, ended_at, duration_seconds, distance_nm, flight_status, source, connector_meta)
        VALUES (me, s8, 'SKBG', 'SKBO', b + interval '60 hours', b + interval '61 hours', 3600, 300, 'interrupted', 'connector', valid);
        -- 9 en el futuro
        INSERT INTO public.flights (user_id, session_uuid, dep_icao, arr_icao, started_at, ended_at, duration_seconds, distance_nm, flight_status, source, connector_meta)
        VALUES (me, s9, 'SKBG', 'SKBO', now() + interval '3000 days', now() + interval '3000 days' + interval '1 hour', 3600, 300, 'completed', 'connector', valid);
        -- 10 vuelo acelerado a 4x, con los valores de tu vuelo real MGGT -> MMUN
        INSERT INTO public.flights (user_id, session_uuid, dep_icao, arr_icao, started_at, ended_at, duration_seconds, distance_nm, flight_status, source, connector_meta)
        VALUES (me, s10, 'MGGT', 'MMUN', b + interval '70 hours', b + interval '70 hours' + interval '5750 seconds', 5750, 763.98, 'completed', 'connector', jsonb_set(valid, '{max_sim_rate}', '4'));
        -- 11 vuelo del comando simulate (sim_version = SIMULATED), por lo demás válido
        INSERT INTO public.flights (user_id, session_uuid, dep_icao, arr_icao, started_at, ended_at, duration_seconds, distance_nm, flight_status, source, connector_meta)
        VALUES (me, s11, 'SKBG', 'SKBO', b + interval '80 hours', b + interval '81 hours', 3600, 300, 'completed', 'connector', jsonb_set(valid, '{sim_version}', '"SIMULATED"'));
    EXCEPTION WHEN OTHERS THEN
        INSERT INTO _r VALUES (0, 'Preparación de datos', false, SQLSTATE || ' ' || SQLERRM);
    END;

    -- Resultados de la evaluación automática
    SELECT verification_status INTO st FROM public.flights WHERE session_uuid = s1;
    INSERT INTO _r VALUES (1, 'Vuelo válido del conector queda verified', st = 'verified', coalesce(st, 'NULL'));

    SELECT verification_status INTO st FROM public.flights WHERE session_uuid = s2;
    INSERT INTO _r VALUES (2, 'Saltos de posición -> pending_review', st = 'pending_review', coalesce(st, 'NULL'));

    SELECT verification_status INTO st FROM public.flights WHERE session_uuid = s3;
    INSERT INTO _r VALUES (3, 'Sin connector_meta -> pending_review', st = 'pending_review', coalesce(st, 'NULL'));

    SELECT verification_status INTO st FROM public.flights WHERE session_uuid = s4;
    INSERT INTO _r VALUES (4, 'Velocidad media irreal -> pending_review', st = 'pending_review', coalesce(st, 'NULL'));

    SELECT verification_status INTO st FROM public.flights WHERE session_uuid = s5;
    INSERT INTO _r VALUES (5, 'Pausa excesiva -> pending_review', st = 'pending_review', coalesce(st, 'NULL'));

    SELECT verification_status INTO st FROM public.flights WHERE session_uuid = s6;
    INSERT INTO _r VALUES (6, 'Vuelo solapado con otro -> pending_review', st = 'pending_review', coalesce(st, 'NULL'));

    SELECT verification_status INTO st FROM public.flights WHERE session_uuid = s7;
    INSERT INTO _r VALUES (7, 'Vuelo manual no se auto-verifica (unverified)', st = 'unverified', coalesce(st, 'NULL'));

    SELECT verification_status INTO st FROM public.flights WHERE session_uuid = s8;
    INSERT INTO _r VALUES (8, 'Vuelo interrumpido no se evalúa (unverified)', st = 'unverified', coalesce(st, 'NULL'));

    SELECT verification_status INTO st FROM public.flights WHERE session_uuid = s9;
    INSERT INTO _r VALUES (9, 'Vuelo en el futuro -> pending_review', st = 'pending_review', coalesce(st, 'NULL'));

    SELECT verification_status INTO st FROM public.flights WHERE session_uuid = s10;
    INSERT INTO _r VALUES (10, 'Vuelo acelerado 4x (datos reales) queda verified', st = 'verified', coalesce(st, 'NULL'));

    SELECT verification_status INTO st FROM public.flights WHERE session_uuid = s11;
    INSERT INTO _r VALUES (20, 'Vuelo SIMULATED del comando simulate -> pending_review', st = 'pending_review', coalesce(st, 'NULL'));

    -- 11. Reenvío del mismo vuelo: no duplica ni cambia el estado
    BEGIN
        INSERT INTO public.flights (user_id, session_uuid, source) VALUES (me, s1, 'connector')
        ON CONFLICT (user_id, session_uuid) DO NOTHING;
        SELECT count(*), max(verification_status) INTO cnt, st FROM public.flights WHERE session_uuid = s1;
        INSERT INTO _r VALUES (11, 'Reenvío no duplica ni cambia el estado', cnt = 1 AND st = 'verified', 'filas=' || cnt || ' estado=' || coalesce(st, 'NULL'));
    EXCEPTION WHEN OTHERS THEN INSERT INTO _r VALUES (11, 'Reenvío no duplica ni cambia el estado', false, SQLSTATE || ' ' || SQLERRM); END;

    -- 12-13. El usuario no puede ejecutar las funciones de revisión
    BEGIN PERFORM public.auto_review_flight(s1); ok := false; code := 'sin error';
    EXCEPTION WHEN OTHERS THEN ok := SQLSTATE = '42501'; code := SQLSTATE; END;
    INSERT INTO _r VALUES (12, 'authenticated no puede ejecutar auto_review_flight', ok, code);

    BEGIN PERFORM public.flight_auto_review_reasons(s1); ok := false; code := 'sin error';
    EXCEPTION WHEN OTHERS THEN ok := SQLSTATE = '42501'; code := SQLSTATE; END;
    INSERT INTO _r VALUES (13, 'authenticated no puede ejecutar flight_auto_review_reasons', ok, code);

    -- 14. El usuario sigue sin poder cambiar verification_status (ni siquiera de su vuelo verificado)
    BEGIN UPDATE public.flights SET verification_status = 'rejected' WHERE session_uuid = s1; ok := false; code := 'sin error';
    EXCEPTION WHEN OTHERS THEN ok := SQLSTATE = '42501'; code := SQLSTATE; END;
    INSERT INTO _r VALUES (14, 'UPDATE de verification_status por el usuario sigue rechazado', ok, code);

    -- 15-16. El usuario sigue sin poder insertar estados distintos de unverified
    BEGIN INSERT INTO public.flights (user_id, session_uuid, source, flight_status, verification_status) VALUES (me, gen_random_uuid(), 'connector', 'completed', 'verified'); ok := false; code := 'sin error';
    EXCEPTION WHEN OTHERS THEN ok := SQLSTATE = '42501'; code := SQLSTATE; END;
    INSERT INTO _r VALUES (15, 'INSERT con verified sigue rechazado', ok, code);

    BEGIN INSERT INTO public.flights (user_id, session_uuid, source, flight_status, verification_status) VALUES (me, gen_random_uuid(), 'connector', 'completed', 'pending_review'); ok := false; code := 'sin error';
    EXCEPTION WHEN OTHERS THEN ok := SQLSTATE = '42501'; code := SQLSTATE; END;
    INSERT INTO _r VALUES (16, 'INSERT con pending_review sigue rechazado', ok, code);
END $$;

RESET ROLE;

-- Comprobaciones como postgres (SQL Editor): motivos y no reevaluar.
DO $$
DECLARE
    id2 uuid; id6 uuid; id1 uuid; id11 uuid; r2 text[]; r6 text[]; r11 text[]; res jsonb;
BEGIN
    SELECT f.id INTO id1 FROM public.flights f JOIN _s ON _s.id = f.session_uuid WHERE _s.n = 1;
    SELECT f.id INTO id2 FROM public.flights f JOIN _s ON _s.id = f.session_uuid WHERE _s.n = 2;
    SELECT f.id INTO id6 FROM public.flights f JOIN _s ON _s.id = f.session_uuid WHERE _s.n = 6;
    SELECT f.id INTO id11 FROM public.flights f JOIN _s ON _s.id = f.session_uuid WHERE _s.n = 11;

    r2 := public.flight_auto_review_reasons(id2);
    INSERT INTO _r VALUES (17, 'Motivo del vuelo con saltos: saltos_de_posicion', 'saltos_de_posicion' = ANY (r2), array_to_string(r2, ','));

    r6 := public.flight_auto_review_reasons(id6);
    INSERT INTO _r VALUES (18, 'Motivo del vuelo solapado: solapado', 'solapado' = ANY (r6), array_to_string(r6, ','));

    r11 := public.flight_auto_review_reasons(id11);
    INSERT INTO _r VALUES (21, 'Motivo del vuelo simulado: vuelo_simulado', 'vuelo_simulado' = ANY (r11), array_to_string(r11, ','));

    res := public.auto_review_flight(id1);
    INSERT INTO _r VALUES (19, 'No reevalúa un vuelo ya procesado', (res ->> 'ok') = 'false', coalesce(res ->> 'error', 'NULL'));
END $$;

SELECT n, test, passed, detail FROM _r ORDER BY n;

ROLLBACK;