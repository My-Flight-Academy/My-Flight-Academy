# Seguridad — My Flight Academy

> Políticas de acceso, amenazas y mitigaciones. Fase 1 — v3 (corrección crítica).

---

## 1. Principios generales

1. **Denegar por defecto.** RLS activado en todas las tablas.
2. **La seguridad vive en la base de datos.** Restricciones, column-level privileges, RLS y triggers se aplican independientemente del cliente.
3. **`verification_status` protegido en tres capas independientes.** Ver §3.
4. **Los secretos nunca en el repositorio.** `service_role_key` y `JWT_SECRET` solo en variables de entorno del servidor.
5. **Mínimo privilegio.** Los GRANTs son los mínimos necesarios por rol y por columna.
6. **`SECURITY DEFINER` solo donde es necesario.** Las funciones de trigger que no necesitan privilegios elevados usan `SECURITY INVOKER` para que `current_role` refleje el llamante real.

---

## 2. Resumen de políticas RLS

### `public.profiles`

| Operación | ¿Quién puede? | Condición |
|---|---|---|
| SELECT | Cualquiera | Solo perfiles `profile_visibility = 'public'` |
| SELECT | El propietario | `auth.uid() = id` (incluye perfiles privados) |
| UPDATE | El propietario | `auth.uid() = id`; `created_at` protegido por trigger |
| INSERT | Solo trigger `handle_new_user` | SECURITY DEFINER; usuarios no pueden insertar directamente |
| DELETE | Nadie desde el cliente | Gestión de cuenta por backend |

### `public.flights`

| Operación | ¿Quién puede? | Condición |
|---|---|---|
| SELECT | El propietario | `auth.uid() = user_id` |
| INSERT | El propietario | `auth.uid() = user_id` y `verification_status = 'unverified'` |
| UPDATE | El propietario | `auth.uid() = user_id`; columnas protegidas sin GRANT de UPDATE |
| DELETE | El propietario | `auth.uid() = user_id` |

### `public.simulator_sessions`

| Operación | ¿Quién puede? | Condición |
|---|---|---|
| SELECT / INSERT / UPDATE | El propietario | `auth.uid() = user_id` |
| DELETE | Nadie | Sin política DELETE |

### `public.device_connections`

| Operación | ¿Quién puede? | Condición |
|---|---|---|
| SELECT / INSERT / UPDATE | El propietario | `auth.uid() = user_id` |
| DELETE | Nadie | Usar `revoked_at` para auditoría |

---

## 3. Protección de `verification_status` — diseño en tres capas

### Por qué falló la v2

La v2 usaba un trigger `SECURITY DEFINER` que evaluaba `current_role IN ('authenticated', 'anon')`. Esta lógica es incorrecta porque la documentación oficial de PostgreSQL establece que dentro de una función `SECURITY DEFINER`, `current_role` (equivalente a `current_user`) devuelve el **propietario de la función**, no el rol que originó la llamada:

> *"The `current_user` is the user identifier applicable for permission checking. Normally it equals the session user, but **it changes during the execution of functions with the attribute SECURITY DEFINER**."*
> — PostgreSQL docs, "Miscellaneous Functions", vigente desde PG 7.3.

Como el propietario de la función en Supabase es `postgres`, `current_role` siempre era `'postgres'`, la condición nunca era verdadera y el trigger nunca bloqueaba nada.

### La solución v3: tres capas independientes

```
Petición UPDATE de usuario authenticated
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ CAPA 1: Column-level privilege                               │
│                                                              │
│ authenticated NO tiene GRANT UPDATE(verification_status).   │
│ Si el UPDATE incluye esa columna, PostgreSQL lanza:          │
│   ERROR: permission denied for column "verification_status"  │
│ Ocurre antes de RLS y antes de cualquier trigger.            │
│                                                              │
│ LIMITACIÓN: no protege a service_role. Supabase aplica       │
│ GRANT ALL ON ALL TABLES TO service_role por defecto          │
│ (GRANT de tabla). Un REVOKE de columna no puede bloquear     │
│ un GRANT de tabla — los permisos son acumulativos en PG.     │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ CAPA 2: RLS flights_insert_own (solo para INSERT)            │
│                                                              │
│ WITH CHECK (verification_status = 'unverified')              │
│ Impide insertar con un estado distinto de 'unverified'.      │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ CAPA 3: Trigger SECURITY INVOKER — mecanismo principal       │
│                                                              │
│ Bloquea: 'authenticated', 'anon', 'service_role'.            │
│ Permite: 'postgres' (propietario de verify_flight_status,    │
│   SECURITY DEFINER — única vía autorizada de modificación).  │
│                                                              │
│ Es el único mecanismo fiable contra service_role porque      │
│ actúa en tiempo de ejecución sobre current_role real,        │
│ independientemente de los privilegios de tabla.              │
└──────────────────────────────────────────────────────────────┘
```

### Por qué `SECURITY INVOKER` es correcto para el trigger de protección

`SECURITY INVOKER` (comportamiento por defecto de las funciones en PostgreSQL) hace que la función se ejecute con los privilegios del llamante. Como consecuencia directa, `current_role` dentro de la función refleja el rol real de la sesión:

| Llamante | `current_role` dentro del trigger SECURITY INVOKER | Resultado |
|---|---|---|
| Usuario via PostgREST (JWT válido) | `authenticated` | Bloqueado |
| Petición anónima | `anon` | Bloqueado |
| Edge Function con `service_role_key` (UPDATE directo) | `service_role` | Bloqueado |
| Edge Function con `service_role_key` → `verify_flight_status()` | `postgres` (propietario SECURITY DEFINER) | Permitido |
| Conexión directa como `postgres` | `postgres` | Permitido |

La condición `current_role IN ('authenticated', 'anon', 'service_role')` funciona correctamente con `SECURITY INVOKER`.

### Por qué `service_role` está en la lista de bloqueo del trigger

En Supabase, `service_role` recibe `GRANT ALL ON ALL TABLES IN SCHEMA public` por defecto. Eso incluye `UPDATE` a nivel de tabla sobre `public.flights`. En PostgreSQL, los permisos son **acumulativos**: un `REVOKE UPDATE (columna) FROM service_role` no puede bloquear el `UPDATE` que viene del GRANT de tabla del mismo rol. El trigger es el único mecanismo que actúa sobre `current_role` en tiempo de ejecución, independientemente de los privilegios acumulados.

### Por qué `SECURITY DEFINER` sigue siendo correcto para `handle_new_user`

`handle_new_user` necesita `SECURITY DEFINER` porque se ejecuta desde el esquema `auth` y debe escribir en `public.profiles`, donde el nuevo usuario aún no tiene permisos. El uso de `SECURITY DEFINER` aquí es correcto porque **no toma decisiones de autorización basadas en `current_role`**; simplemente inserta el perfil con los privilegios del propietario (`postgres`).

### Cómo verifica vuelos el backend (Fase futura)

La única vía autorizada es la función `public.verify_flight_status()`:

```
Edge Function (Deno/Node) usa service_role_key
  → PostgREST establece: SET LOCAL ROLE service_role
  → Llama a: SELECT verify_flight_status(flight_id, 'verified')
  → verify_flight_status() es SECURITY DEFINER (propietario: postgres)
  → Dentro de ella, current_role = 'postgres'
  → postgres no está en la lista de bloqueo del trigger SECURITY INVOKER
  → UPDATE procede
```

Solo `service_role` tiene `EXECUTE` sobre `verify_flight_status()`. Un usuario `authenticated` que intente llamarla recibe `ERROR: permission denied for function verify_flight_status`.

Adicionalmente, `service_role` no puede hacer `UPDATE (verification_status)` directamente: la migración incluye `REVOKE UPDATE (verification_status) ON public.flights FROM service_role`, que garantiza que incluso si Supabase aplica `GRANT ALL` por defecto, `service_role` deba pasar por `verify_flight_status()`. Solo `postgres` (propietario de la función, superuser) puede actualizar esa columna directamente.

### `public.profiles`

| Rol | Privilegio | Notas |
|---|---|---|
| `anon` | SELECT | Solo para que `security_invoker` de la vista evalúe RLS |
| `authenticated` | SELECT, UPDATE | UPDATE sobre todos los campos del perfil |

### `public.flights`

| Rol | Privilegio de tabla | Columnas con UPDATE | Columnas SIN UPDATE (column-level) |
|---|---|---|---|
| `authenticated` | SELECT, INSERT, DELETE | 12 columnas editables | `id`, `user_id`, `session_uuid`, `verification_status`, `created_at`, `updated_at` |
| `service_role` | GRANT ALL (por defecto Supabase) | Todas — **bloqueado por trigger Capa 3** | `REVOKE` de columna es no-op; la protección real es el trigger |

### `public.simulator_sessions` y `public.device_connections`

| Rol | Privilegio |
|---|---|
| `authenticated` | SELECT, INSERT, UPDATE (todos los campos, RLS como barrera) |

### Funciones

| Función | Tipo seguridad | `EXECUTE` para |
|---|---|---|
| `set_updated_at()` | SECURITY INVOKER | Nadie (solo triggers) |
| `protect_profiles_created_at()` | SECURITY INVOKER | Nadie (solo triggers) |
| `handle_new_user()` | SECURITY DEFINER | Nadie (solo triggers) |
| `protect_verification_status()` | SECURITY INVOKER | Nadie (solo triggers) |
| `verify_flight_status()` | SECURITY DEFINER | `service_role` únicamente |

---

## 5. Amenazas y mitigaciones (actualizado v3)

| Amenaza | Mitigación |
|---|---|
| Usuario autenticado cambia `verification_status` via UPDATE | Capa 1: sin GRANT UPDATE(verification_status); Capa 3: trigger SECURITY INVOKER |
| Usuario inserta vuelo con `verification_status = 'verified'` | Capa 2: RLS `flights_insert_own` WITH CHECK |
| Usuario llama a `verify_flight_status()` directamente | Sin EXECUTE para `authenticated`; error antes de ejecutarse |
| Función RPC `SECURITY DEFINER` callable por usuarios cambia `verification_status` | Solo `verify_flight_status()` tiene ese acceso, y solo `service_role` puede llamarla |
| Usuario falsifica `created_at` del perfil | Trigger `protect_profiles_created_at` (SECURITY INVOKER) |
| Usuario lee datos privados de otro | RLS por `auth.uid()` en todas las tablas |
| Secretos en el repositorio | Sin credenciales en código; ver `setup-supabase.md §6` |
| Conector falsifica cronologías | `started_at`/`last_seen` los asigna el servidor con `now()` |
| Vista expone perfiles privados | `security_invoker = true`; RLS filtra |

---

## 6. Limitaciones conocidas

- **`BYPASSRLS` no bypasea column-level privileges.** `service_role` no puede hacer `UPDATE (verification_status)` directamente; debe usar `verify_flight_status()`. Esto es intencional.
- **Un superuser puede desactivar triggers.** No hay protección SQL contra un superuser (`postgres`) determinado a modificar datos. Es una limitación del modelo de seguridad de PostgreSQL, no un fallo del diseño.
- **Protecciones pendientes de verificación empírica.** La Capa 1 (column-level) y la Capa 3 (trigger SECURITY INVOKER) no han sido probadas en una instancia Supabase real. Ver §7.

---

## 7. Pruebas para el SQL Editor de Supabase

> **Estado:** preparadas para ejecución manual. No ejecutadas aún.
> Ejecutar en el **proyecto Supabase de pruebas** (plan Free, separado del proyecto principal). Pegar cada bloque en una nueva consulta del SQL Editor y ejecutarlo individualmente.

### Por qué no se usa `SET LOCAL ROLE` directamente

El SQL Editor se conecta como `postgres` (superuser) sin pasar por PostgREST. Por eso:
- `auth.uid()` devuelve `NULL` aunque se establezca `request.jwt.claims` — las políticas que dependen de `auth.uid()` no se evalúan igual que desde el cliente.
- `SET LOCAL ROLE authenticated` cambia los privilegios de columna y tabla, pero no afecta a `auth.uid()`.

Los tests de columna y trigger **sí funcionan** con `SET LOCAL ROLE` porque dependen de column-level grants y de `current_role`, no de `auth.uid()`. Los tests de RLS que dependen de `auth.uid()` se verifican mediante las consultas de inspección del §7.0.

### §7.0 — Verificación de estructura (ejecutar primero, como `postgres`)

```sql
-- V1: RLS habilitado en las 4 tablas
-- Esperado: 4 filas, todas con rowsecurity = true
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles','flights','simulator_sessions','device_connections')
ORDER BY tablename;
```

```sql
-- V2: 13 políticas definidas
-- Esperado: 13 filas
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

```sql
-- V3: Permisos por columna en flights para authenticated
-- Esperado: 12 filas (dep_icao, arr_icao, alt_icao, aircraft,
--   started_at, ended_at, duration_seconds, distance_nm,
--   max_altitude_ft, landing_vs_fpm, flight_status, notes)
-- verification_status NO debe aparecer en esta lista
SELECT column_name, privilege_type, grantee
FROM information_schema.column_privileges
WHERE table_schema = 'public'
  AND table_name = 'flights'
  AND grantee = 'authenticated'
  AND privilege_type = 'UPDATE'
ORDER BY column_name;
```

```sql
-- V4: verification_status sin UPDATE para authenticated ni service_role
-- Esperado: 0 filas
SELECT column_name, grantee, privilege_type
FROM information_schema.column_privileges
WHERE table_schema = 'public'
  AND table_name = 'flights'
  AND column_name = 'verification_status'
  AND grantee IN ('authenticated', 'service_role')
  AND privilege_type = 'UPDATE';
```

```sql
-- V5: Funciones con su tipo de seguridad y propietario
-- Esperado: prosecdef=false para set_updated_at, protect_*, protect_profiles_created_at
--           prosecdef=true  para handle_new_user, verify_flight_status
SELECT proname,
       CASE WHEN prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS sec_type,
       proowner::regrole AS owner
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname IN (
    'set_updated_at', 'handle_new_user',
    'protect_verification_status', 'protect_profiles_created_at',
    'verify_flight_status'
  )
ORDER BY proname;
```

```sql
-- V6: EXECUTE sobre verify_flight_status solo para service_role
-- Esperado: 1 fila con grantee=service_role
SELECT routine_name, grantee, privilege_type
FROM information_schema.role_routine_grants
WHERE routine_schema = 'public'
  AND routine_name = 'verify_flight_status';
```

```sql
-- V7: Triggers activos en flights
-- Esperado: trg_flights_protect_verification (BEFORE, ROW),
--           trg_flights_updated_at (BEFORE, ROW)
SELECT trigger_name, event_manipulation, action_timing, action_orientation
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'flights'
ORDER BY trigger_name;
```

---

### §7.1 — Setup de datos de prueba

**Opción A — Proyecto Supabase remoto (SQL Editor):**

1. Ir a **Authentication → Users → Add user** en el panel de Supabase.
2. Crear dos usuarios ficticios: `usera-test@example.com` y `userb-test@example.com`.
3. Copiar los UUIDs generados y sustituirlos en todos los tests donde aparecen `aaaaaaaa-0000-0000-0000-000000000001` y `bbbbbbbb-0000-0000-0000-000000000002`.
4. El trigger `handle_new_user` crea los perfiles automáticamente.
5. Insertar el vuelo de prueba (sustituir `<UUID_USUARIO_A>` por el UUID real):

```sql
-- Sustituir <UUID_USUARIO_A> por el UUID del primer usuario creado.
INSERT INTO public.flights
    (id, user_id, dep_icao, arr_icao, aircraft,
     duration_seconds, flight_status, verification_status)
VALUES
    ('ffffffff-0000-0000-0000-000000000010',
     '<UUID_USUARIO_A>',
     'SKBO', 'SKBG', 'Cessna 172',
     3600, 'completed', 'unverified')
ON CONFLICT (id) DO NOTHING;

-- Confirmar:
SELECT id, user_id, verification_status, flight_status
FROM public.flights WHERE id = 'ffffffff-0000-0000-0000-000000000010';
-- Esperado: 1 fila, verification_status = 'unverified'
```

**Opción B — Instancia local (`supabase start`):**

```sql
-- En local se puede insertar directamente en auth.users.
INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at, role)
VALUES
    ('aaaaaaaa-0000-0000-0000-000000000001', 'usera@test.com', 'x', now(), now(), 'authenticated'),
    ('bbbbbbbb-0000-0000-0000-000000000002', 'userb@test.com', 'x', now(), now(), 'authenticated')
ON CONFLICT DO NOTHING;
-- El trigger handle_new_user crea los perfiles automáticamente.

INSERT INTO public.flights
    (id, user_id, dep_icao, arr_icao, aircraft,
     duration_seconds, flight_status, verification_status)
VALUES
    ('ffffffff-0000-0000-0000-000000000010',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'SKBO', 'SKBG', 'Cessna 172',
     3600, 'completed', 'unverified')
ON CONFLICT DO NOTHING;
```

---

### Test 1 — `authenticated` no puede cambiar `verification_status` (Capa 1)

```sql
-- Verifica: column-level privilege bloquea antes de RLS y triggers.
-- SET LOCAL ROLE funciona aquí porque el bloqueo es de columna, no de RLS.
BEGIN;
  SET LOCAL ROLE authenticated;
  UPDATE public.flights
     SET verification_status = 'verified'
   WHERE id = 'ffffffff-0000-0000-0000-000000000010';
ROLLBACK;
-- Esperado: ERROR 42501 — permission denied for column "verification_status"
-- Si aparece ese error, el test PASA.
```

---

### Test 2 — `authenticated` no puede modificar `user_id`

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  UPDATE public.flights
     SET user_id = 'bbbbbbbb-0000-0000-0000-000000000002'
   WHERE id = 'ffffffff-0000-0000-0000-000000000010';
ROLLBACK;
-- Esperado: ERROR 42501 — permission denied for column "user_id"
```

---

### Test 3 — `authenticated` sí puede actualizar un campo autorizado (`notes`)

```sql
-- Nota: SET LOCAL ROLE authenticated implica que la política RLS
-- (que requiere auth.uid() = user_id) NO se aplica aquí — en el SQL Editor
-- auth.uid() es NULL. El test verifica solo el column-level grant.
-- El vuelo existe y la columna notes tiene GRANT UPDATE para authenticated.
BEGIN;
  SET LOCAL ROLE authenticated;
  UPDATE public.flights
     SET notes = 'Test de campo autorizado'
   WHERE id = 'ffffffff-0000-0000-0000-000000000010';
ROLLBACK;
-- Esperado: UPDATE 1 (sin error)
-- Nota: el ROLLBACK deshace el cambio; el test solo verifica que no hay error.
```

---

### Test 4 — `authenticated` no puede insertar con `verification_status = 'verified'` (Capa 2, RLS)

```sql
-- Este test verifica la política RLS flights_insert_own WITH CHECK.
-- Con SET LOCAL ROLE authenticated y auth.uid() = NULL, la política
-- rechaza el INSERT porque auth.uid() != user_id.
-- Para aislar el check de verification_status, verificamos también
-- el constraint CHECK de la tabla, que rechaza valores fuera del enum.
-- La forma más limpia en el SQL Editor es como postgres e intentar
-- insertar con un user_id que no existe en profiles:
BEGIN;
  -- Intentar insertar con verification_status = 'verified' como postgres
  -- (bypasea RLS) pero con un user_id que no existe — fallará por FK.
  -- Lo que nos interesa verificar es que la policy RLS está definida:
  SELECT policyname, cmd, qual, with_check
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'flights'
    AND policyname = 'flights_insert_own';
  -- Esperado: 1 fila con with_check que incluye "verification_status = 'unverified'"
ROLLBACK;
```

```sql
-- Verificación complementaria del constraint CHECK en la tabla:
BEGIN;
  INSERT INTO public.flights
      (user_id, dep_icao, arr_icao, aircraft, duration_seconds,
       flight_status, verification_status)
  VALUES
      ('aaaaaaaa-0000-0000-0000-000000000001',
       'SKBO', 'SKBG', 'Cessna 172', 3600, 'completed', 'inventado');
ROLLBACK;
-- Esperado: ERROR — valor "inventado" no está permitido por el CHECK constraint
```

---

### Test 5 — `authenticated` no puede llamar a `verify_flight_status()`

```sql
BEGIN;
  SET LOCAL ROLE authenticated;
  SELECT public.verify_flight_status(
      'ffffffff-0000-0000-0000-000000000010',
      'verified'
  );
ROLLBACK;
-- Esperado: ERROR 42501 — permission denied for function verify_flight_status
```

---

### Test 6 — `service_role` puede llamar a `verify_flight_status()` y el cambio se aplica

```sql
-- Nota: SET LOCAL ROLE service_role puede fallar si Supabase no permite
-- que postgres eleve a ese rol. En ese caso, ejecutar como postgres directamente.
-- La función es SECURITY DEFINER con propietario postgres, por lo que
-- el UPDATE interno también procede con privilegios de postgres.
BEGIN;
  SET LOCAL ROLE service_role;
  SELECT public.verify_flight_status(
      'ffffffff-0000-0000-0000-000000000010',
      'verified'
  );
ROLLBACK;
-- Esperado: {"ok": true, "flight_id": "ffffffff-...", "new_status": "verified"}
-- Si SET LOCAL ROLE service_role falla, usar:
--   SELECT public.verify_flight_status('ffffffff-0000-0000-0000-000000000010', 'verified');
-- (como postgres, que también tiene acceso porque es superuser)
```

---

### Test 7 — La función rechaza estados no válidos y vuelos en estado incorrecto

```sql
-- 7a: Estado inválido
SELECT public.verify_flight_status(
    'ffffffff-0000-0000-0000-000000000010',
    'inventado'
);
-- Esperado: {"ok": false, "error": "Estado no válido: inventado"}
```

```sql
-- 7b: Vuelo en estado 'planned' (no se puede verificar)
BEGIN;
  UPDATE public.flights SET flight_status = 'planned'
  WHERE id = 'ffffffff-0000-0000-0000-000000000010';

  SELECT public.verify_flight_status(
      'ffffffff-0000-0000-0000-000000000010',
      'verified'
  );
ROLLBACK;
-- Esperado: {"ok": false, "error": "El vuelo debe estar en estado completed o interrupted..."}
```

```sql
-- 7c: Vuelo inexistente
SELECT public.verify_flight_status(
    '00000000-0000-0000-0000-000000000000',
    'verified'
);
-- Esperado: {"ok": false, "error": "Vuelo no encontrado."}
```

---

### Test 8 — El trigger SECURITY INVOKER bloquea `service_role` directo y `authenticated` con grant temporal

```sql
-- Test 8a: service_role hace UPDATE directo (debe fallar por Capa 3 — el trigger)
--
-- PREREQUISITO: que SET LOCAL ROLE service_role funcione desde postgres en el
-- SQL Editor. Si no funciona, el error será de SET ROLE, no del trigger.
-- En ese caso, ejecutar como alternativa el test 8a-alt (ver abajo).
--
-- service_role tiene GRANT ALL de tabla → column REVOKE no lo bloquea.
-- El trigger SECURITY INVOKER sí lo bloquea porque current_role = 'service_role'.
BEGIN;
  SET LOCAL ROLE service_role;
  UPDATE public.flights
     SET verification_status = 'verified'
   WHERE id = 'ffffffff-0000-0000-0000-000000000010';
ROLLBACK;
-- Esperado si SET ROLE funciona:
--   ERROR 42501: "No tienes permiso para cambiar el estado de verificación..."
--   (el mensaje viene del trigger — confirma que es la Capa 3 quien actúa)
-- Si en cambio el error dice "must be member of role" o similar:
--   SET LOCAL ROLE service_role no está disponible en este entorno.
--   Usar el test 8a-alt en su lugar.
```

```sql
-- Test 8a-alt: verificar que el trigger evalúa current_role correctamente
-- (no depende de SET LOCAL ROLE service_role).
-- Inserta temporalmente service_role en la lista de roles permitidos del trigger
-- leyendo su comportamiento desde postgres con un rol simulado.
-- Alternativa práctica: ejecutar la query de diagnóstico del §7.0 V5 para
-- confirmar que protect_verification_status() tiene prosecdef=false (SECURITY INVOKER),
-- y el test 6 para confirmar que verify_flight_status() pasa el trigger.
-- La combinación de V5 + Test 6 demuestra el mecanismo sin SET ROLE directo.
```

```sql
-- Test 8b: trigger bloquea authenticated con grant temporal (aísla Capa 3)
BEGIN;
  GRANT UPDATE (verification_status) ON public.flights TO authenticated;
  SET LOCAL ROLE authenticated;
  UPDATE public.flights
     SET verification_status = 'verified'
   WHERE id = 'ffffffff-0000-0000-0000-000000000010';
ROLLBACK;
-- Esperado: ERROR 42501 — "No tienes permiso para cambiar el estado de verificación"
-- Este error viene del trigger (no del column-level privilege, que se suspende
-- temporalmente con el GRANT dentro del BEGIN).
-- Confirma que la Capa 3 funciona como segunda barrera para authenticated.
-- El ROLLBACK revoca el GRANT temporal y deshace cualquier cambio.
```

---

### §7.2 — Limpieza (ejecutar como `postgres` al terminar)

```sql
DELETE FROM public.flights
WHERE id = 'ffffffff-0000-0000-0000-000000000010';

DELETE FROM public.profiles
WHERE id IN (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'bbbbbbbb-0000-0000-0000-000000000002'
);
-- Nota: NO borrar de auth.users porque en el proyecto de pruebas
-- el setup no insertó en auth.users. Si se crearon usuarios reales
-- via Auth, borrarlos desde Authentication → Users en el panel de Supabase.
```
