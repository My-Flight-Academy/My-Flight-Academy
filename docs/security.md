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
│ CAPA 1: Column-level privilege (motor PostgreSQL)            │
│                                                              │
│ authenticated NO tiene GRANT UPDATE(verification_status).   │
│ Si el UPDATE incluye esa columna, PostgreSQL lanza:          │
│   ERROR: permission denied for column "verification_status"  │
│ Ocurre antes de RLS y antes de cualquier trigger.            │
└──────────────────────────────┬───────────────────────────────┘
                               │ (solo llega aquí si no tocó verification_status)
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
│ CAPA 3: Trigger SECURITY INVOKER (defensa en profundidad)    │
│                                                              │
│ protect_verification_status() es SECURITY INVOKER.          │
│ current_role dentro de ella refleja el llamante real:        │
│   authenticated → bloqueado si intenta cambiar el campo.    │
│   postgres/service_role → permitido.                        │
│ Actúa como red de seguridad si la Capa 1 falla o se omite.  │
└──────────────────────────────────────────────────────────────┘
```

### Por qué `SECURITY INVOKER` es correcto para el trigger de protección

`SECURITY INVOKER` (comportamiento por defecto de las funciones en PostgreSQL) hace que la función se ejecute con los privilegios del llamante. Como consecuencia directa, `current_role` dentro de la función refleja el rol real de la sesión:

| Llamante | `current_role` dentro del trigger SECURITY INVOKER |
|---|---|
| Usuario via PostgREST (JWT válido) | `authenticated` |
| Petición anónima | `anon` |
| Edge Function con `service_role_key` | `service_role` |
| Conexión directa como `postgres` | `postgres` |

La condición `current_role IN ('authenticated', 'anon')` funciona correctamente con `SECURITY INVOKER`.

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

---

## 4. Permisos por rol y columna

### `public.profiles`

| Rol | Privilegio | Notas |
|---|---|---|
| `anon` | SELECT | Solo para que `security_invoker` de la vista evalúe RLS |
| `authenticated` | SELECT, UPDATE | UPDATE sobre todos los campos del perfil |

### `public.flights`

| Rol | Privilegio de tabla | Columnas con UPDATE | Columnas SIN UPDATE |
|---|---|---|---|
| `authenticated` | SELECT, INSERT, DELETE | `dep_icao`, `arr_icao`, `alt_icao`, `aircraft`, `started_at`, `ended_at`, `duration_seconds`, `distance_nm`, `max_altitude_ft`, `landing_vs_fpm`, `flight_status`, `notes` | `id`, `user_id`, `session_uuid`, `verification_status`, `created_at`, `updated_at` |
| `service_role` | BYPASSRLS (implícito) | Solo via `verify_flight_status()` | — |

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

## 7. Pruebas recomendadas (pendientes de ejecución)

Las pruebas están diseñadas para ejecutarse en `supabase start` (instancia local). **No se han ejecutado.** Se indica el resultado esperado basado en el análisis del SQL.

```sql
-- ── SETUP ────────────────────────────────────────────────────────────────────
-- (Como postgres, que bypasea RLS y column-level checks)

INSERT INTO auth.users (id, email, encrypted_password, created_at, updated_at)
VALUES
    ('aaaaaaaa-0000-0000-0000-000000000001', 'usera@test.com', 'x', now(), now()),
    ('bbbbbbbb-0000-0000-0000-000000000002', 'userb@test.com', 'x', now(), now())
ON CONFLICT DO NOTHING;
-- Nota: handle_new_user crea los perfiles automáticamente.

-- Vuelo del usuario A (unverified)
INSERT INTO public.flights
    (id, user_id, dep_icao, arr_icao, aircraft, duration_seconds,
     flight_status, verification_status)
VALUES
    ('ffffffff-0000-0000-0000-000000000010',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'SKBO', 'SKBG', 'Cessna 172', 3600, 'completed', 'unverified')
ON CONFLICT DO NOTHING;


-- ── TEST 1: Usuario A intenta verificar su propio vuelo (debe fallar) ─────────
-- Capa 1: sin GRANT UPDATE(verification_status) para authenticated.
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO
    '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}';

UPDATE public.flights
   SET verification_status = 'verified'
 WHERE id = 'ffffffff-0000-0000-0000-000000000010';
-- ESPERADO: ERROR permission denied for column "verification_status"


-- ── TEST 2: Usuario B intenta verificar el vuelo de A (debe fallar) ──────────
-- Capa 1: sin GRANT UPDATE(verification_status) para authenticated.
-- Además RLS: el vuelo no es de B.
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO
    '{"sub":"bbbbbbbb-0000-0000-0000-000000000002","role":"authenticated"}';

UPDATE public.flights
   SET verification_status = 'verified'
 WHERE id = 'ffffffff-0000-0000-0000-000000000010';
-- ESPERADO: 0 filas afectadas (RLS bloquea antes del error de columna)
-- o ERROR permission denied for column — el orden puede variar por versión PG.


-- ── TEST 3: Usuario A actualiza un campo permitido (debe funcionar) ───────────
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO
    '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}';

UPDATE public.flights
   SET notes = 'Vuelo de práctica en circuito.'
 WHERE id = 'ffffffff-0000-0000-0000-000000000010';
-- ESPERADO: UPDATE 1


-- ── TEST 4: Usuario intenta actualizar user_id o session_uuid (debe fallar) ───
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO
    '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}';

UPDATE public.flights
   SET user_id = 'bbbbbbbb-0000-0000-0000-000000000002'
 WHERE id = 'ffffffff-0000-0000-0000-000000000010';
-- ESPERADO: ERROR permission denied for column "user_id"


-- ── TEST 5: Usuario inserta vuelo con verification_status = 'verified' ────────
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO
    '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}';

INSERT INTO public.flights
    (user_id, dep_icao, arr_icao, aircraft, duration_seconds, verification_status)
VALUES
    ('aaaaaaaa-0000-0000-0000-000000000001',
     'SKBO', 'SKBG', 'Cessna 172', 3600, 'verified');
-- ESPERADO: ERROR new row violates row-level security policy (RLS flights_insert_own)


-- ── TEST 6: authenticated llama a verify_flight_status() (debe fallar) ────────
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO
    '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","role":"authenticated"}';

SELECT public.verify_flight_status(
    'ffffffff-0000-0000-0000-000000000010',
    'verified'
);
-- ESPERADO: ERROR permission denied for function verify_flight_status


-- ── TEST 7: service_role llama a verify_flight_status() (debe funcionar) ─────
SET LOCAL ROLE service_role;

SELECT public.verify_flight_status(
    'ffffffff-0000-0000-0000-000000000010',
    'verified'
);
-- ESPERADO: {"ok": true, "flight_id": "ffff...", "new_status": "verified"}

-- Verificar que el cambio se aplicó:
SELECT id, verification_status FROM public.flights
 WHERE id = 'ffffffff-0000-0000-0000-000000000010';
-- ESPERADO: verification_status = 'verified'


-- ── TEST 8: Column-level + RLS funcionan conjuntamente ────────────────────────
-- Verificar que authenticated puede INSERT (RLS permite) pero no con verified.
-- Verificar que authenticated puede UPDATE notas pero no verification_status.
-- (Combinación de Tests 3 y 5 con datos reales del setup.)
-- Ver Tests 3 y 5 arriba.


-- ── LIMPIEZA ──────────────────────────────────────────────────────────────────
-- (Como postgres)
DELETE FROM public.flights  WHERE id = 'ffffffff-0000-0000-0000-000000000010';
DELETE FROM public.profiles WHERE id IN (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'bbbbbbbb-0000-0000-0000-000000000002'
);
DELETE FROM auth.users WHERE id IN (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'bbbbbbbb-0000-0000-0000-000000000002'
);
```
