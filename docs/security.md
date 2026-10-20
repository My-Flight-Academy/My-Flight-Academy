# Seguridad — My Flight Academy

> Políticas de acceso, amenazas y mitigaciones. Fase 1 — revisión post-auditoría (v2).

---

## 1. Principios generales

1. **Denegar por defecto.** RLS activado en todas las tablas. Sin políticas explícitas, nadie accede.
2. **La seguridad vive en la base de datos, no en el frontend.** Las restricciones de RLS y los triggers se aplican independientemente del cliente.
3. **La protección de campos críticos usa triggers, no subconsultas.** Ver §3 y §4.
4. **Los secretos nunca en el repositorio.** `service_role_key` y `JWT_SECRET` van en variables de entorno del servidor.
5. **Mínimo privilegio.** El frontend solo recibe la `anon_key` y la `supabase_url`. Los GRANTs de tabla son los mínimos necesarios.

---

## 2. Resumen de políticas RLS (v2)

### `public.profiles`

| Operación | ¿Quién puede? | Condición |
|---|---|---|
| SELECT | Cualquiera (anon/authenticated) | Solo perfiles con `profile_visibility = 'public'` |
| SELECT | El propietario | `auth.uid() = id` (incluye perfiles privados) |
| UPDATE | El propietario | `auth.uid() = id`; `created_at` protegido por trigger |
| INSERT | Solo el trigger `handle_new_user` | SECURITY DEFINER; usuarios no pueden insertar directamente |
| DELETE | Nadie desde el cliente | Eliminación de cuenta gestionada por backend |

### `public.flights`

| Operación | ¿Quién puede? | Condición |
|---|---|---|
| SELECT | El propietario | `auth.uid() = user_id` |
| INSERT | El propietario | `auth.uid() = user_id` y `verification_status = 'unverified'` |
| UPDATE | El propietario | `auth.uid() = user_id`; `verification_status` protegido por trigger |
| DELETE | El propietario | `auth.uid() = user_id` |

### `public.simulator_sessions`

| Operación | ¿Quién puede? | Condición |
|---|---|---|
| SELECT | El propietario | `auth.uid() = user_id` |
| INSERT | El propietario | `auth.uid() = user_id` |
| UPDATE | El propietario | `auth.uid() = user_id` |
| DELETE | Nadie | Sin política DELETE definida |

### `public.device_connections`

| Operación | ¿Quién puede? | Condición |
|---|---|---|
| SELECT | El propietario | `auth.uid() = user_id` |
| INSERT | El propietario | `auth.uid() = user_id` |
| UPDATE | El propietario | `auth.uid() = user_id` (revocar = poner `revoked_at`) |
| DELETE | Nadie | Se usa `revoked_at` para mantener historial |

---

## 3. Protección de `verification_status` (diseño definitivo)

### Problema de la v1

La versión anterior usaba una subconsulta autorreferencial dentro del `WITH CHECK` de la política `flights_update_own`:

```sql
verification_status = (SELECT verification_status FROM public.flights f2 WHERE f2.id = flights.id)
```

Esta subconsulta es frágil: dentro de `WITH CHECK`, la consulta a la misma tabla puede reevaluar las políticas RLS y devolver un conjunto vacío o provocar recursión. Además incluía `OR auth.uid() IS NULL` como fallback que podría actuar como bypass para el rol `anon` en condiciones futuras.

### Solución implementada (v2): trigger que comprueba `current_role`

```sql
CREATE OR REPLACE FUNCTION public.protect_flights_verification_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF NEW.verification_status IS NOT DISTINCT FROM OLD.verification_status THEN
        RETURN NEW;  -- El campo no cambia: no hay nada que bloquear.
    END IF;
    IF current_role IN ('authenticated', 'anon') THEN
        RAISE EXCEPTION '...' USING ERRCODE = 'insufficient_privilege';
    END IF;
    RETURN NEW;
END;
$$;
```

### Por qué `current_role` es seguro

`current_role` es el rol PostgreSQL activo en la sesión de base de datos, asignado por Supabase al autenticar la petición a través de su proxy (PostgREST). No es un valor del token JWT que el cliente pueda modificar:

- Un cliente con `anon_key` → `current_role = 'anon'`
- Un cliente con JWT válido → `current_role = 'authenticated'`
- Una Edge Function con `service_role_key` → `current_role = 'service_role'`
- Código del servidor (postgres directo) → `current_role = 'postgres'`

Un usuario no puede hacer `SET ROLE service_role` desde una petición de cliente normal: ese comando requiere que el rol actual tenga el privilegio `SET ROLE` sobre el destino, que `authenticated` no tiene.

### Por qué NO se usa `SECURITY DEFINER` como bypass

`SECURITY DEFINER` cambia el contexto de privilegios de una función (permite acceder a objetos como el propietario), pero **no cambia `current_role`**. `current_role` refleja el rol de la sesión de base de datos, no el propietario de la función en ejecución. Por tanto, una función `SECURITY DEFINER` ejecutada por un usuario `authenticated` sigue mostrando `current_role = 'authenticated'` dentro del trigger — a menos que la función incluya `SET ROLE postgres` explícitamente, lo que requiere ser superuser.

### Cómo funciona la verificación futura de backend (Fase 4/5)

Cuando exista la Edge Function de verificación:

```
Edge Function (Deno/Node) → usa service_role_key para autenticar
  → PostgreSQL recibe la petición con current_role = 'service_role'
  → trigger permite el cambio de verification_status
  → UPDATE procede
```

No se necesita ninguna variable de sesión ni flag especial. La distinción es estructural: el rol de la conexión lo determina la clave de API usada, no el código del cliente.

Alternativamente, la Edge Function puede ser una función SQL `SECURITY DEFINER` con propietario `postgres`:

```sql
CREATE OR REPLACE FUNCTION public.verify_flight(flight_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    -- current_role aquí será 'postgres' (propietario de la función),
    -- que está permitido por el trigger.
    UPDATE public.flights
    SET verification_status = 'verified'
    WHERE id = flight_id;
END;
$$;
```

### Lo que el trigger no hace

- No protege otros campos de `flights` (para eso están las políticas RLS).
- No valida la telemetría (eso lo hará la lógica de la Edge Function de verificación).
- No revierte vuelos ya verificados (escenario de contestación: fuera del alcance de Fase 1).

---

## 4. Protección de `profiles.created_at`

Implementada con el trigger `trg_profiles_protect_created_at`:

```sql
IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'profiles.created_at es inmutable...'
    USING ERRCODE = 'integrity_constraint_violation';
END IF;
```

El trigger se ejecuta para cualquier rol, incluyendo `authenticated`. Un usuario no puede falsificar su fecha de registro.

---

## 5. Vista `public_profiles` con `security_invoker`

### Problema de la v1

Las vistas PostgreSQL usan por defecto `security_definer` semántics: se ejecutan con los privilegios del propietario de la vista (normalmente `postgres`), omitiendo RLS. La única barrera en la v1 era la cláusula `WHERE profile_visibility = 'public'` de la vista, que no tiene las garantías de enforcement de RLS.

### Solución implementada (v2)

```sql
CREATE OR REPLACE VIEW public.public_profiles
    WITH (security_invoker = true)
AS ...
```

Con `security_invoker = true` (disponible desde PostgreSQL 15, que usa Supabase desde 2023):
- La vista evalúa RLS con el rol del llamante, no del propietario.
- `anon` solo ve perfiles donde se cumple `profiles_select_public` (visibilidad pública).
- `authenticated` ve perfiles públicos + el suyo propio.

### Permisos necesarios para que `security_invoker` funcione

Para que PostgreSQL pueda evaluar las políticas RLS cuando se llama a la vista, el rol llamante necesita `SELECT` sobre la tabla subyacente. Sin ese GRANT, PostgreSQL lanza `permission denied` antes de llegar a evaluar RLS:

```sql
GRANT SELECT ON public.profiles TO anon;       -- Para que RLS se evalúe
GRANT SELECT ON public.public_profiles TO anon, authenticated;
```

Esto no da a `anon` acceso libre a `profiles`: RLS filtra lo que ve. El GRANT es el permiso de "intentar la lectura"; RLS es el filtro de "qué filas se devuelven".

---

## 6. Permisos de tabla (GRANTs)

| Rol | Tabla | Privilegios |
|---|---|---|
| `anon` | `public.profiles` | SELECT (necesario para `security_invoker`) |
| `anon` | `public.public_profiles` (vista) | SELECT |
| `authenticated` | `public.profiles` | SELECT, UPDATE |
| `authenticated` | `public.flights` | SELECT, INSERT, UPDATE, DELETE |
| `authenticated` | `public.simulator_sessions` | SELECT, INSERT, UPDATE |
| `authenticated` | `public.device_connections` | SELECT, INSERT, UPDATE |

`authenticated` **no tiene INSERT en `profiles`** (lo gestiona el trigger). No se define `DELETE` para usuarios en `profiles`, `simulator_sessions` ni `device_connections`.

### Por qué no se revoca `UPDATE (verification_status)` a nivel de columna

Los column-level privileges en PostgreSQL son más granulares que los de tabla, pero tienen una limitación importante: si un UPDATE incluye `verification_status` (aunque sea con el mismo valor), PostgreSQL exige el privilegio de columna para esa columna. Esto rompería las actualizaciones legítimas del usuario en otras columnas si el cliente ORM incluye todos los campos.

La protección mediante trigger es más robusta: permite la actualización de otros campos libremente y solo bloquea los cambios reales en `verification_status`.

---

## 7. Funciones SECURITY DEFINER: permisos de ejecución

| Función | Quién puede ejecutarla | Por qué |
|---|---|---|
| `set_updated_at()` | Solo triggers (REVOKE PUBLIC) | No debe ser invocada directamente |
| `handle_new_user()` | Solo triggers (REVOKE PUBLIC) | No debe ser invocada directamente |
| `protect_flights_verification_status()` | Solo triggers (REVOKE PUBLIC) | No debe ser invocada directamente |
| `protect_profiles_created_at()` | Solo triggers (REVOKE PUBLIC) | No debe ser invocada directamente |

Revocar `EXECUTE` a `PUBLIC` no impide que los triggers ejecuten las funciones: los triggers se ejecutan con los privilegios del propietario de la función (que es el propietario que creó el trigger), no del rol de la sesión.

---

## 8. Amenazas y mitigaciones (actualizado)

| Amenaza | Mitigación |
|---|---|
| Usuario lee datos privados de otro | RLS en todas las tablas; políticas `*_own` basadas en `auth.uid()` |
| Usuario se auto-verifica un vuelo | Trigger `trg_flights_protect_verification` comprueba `current_role`; no se puede falsificar desde el cliente |
| Usuario cambia `user_id` de un vuelo | `WITH CHECK (auth.uid() = user_id)` en `flights_update_own` |
| Usuario falsifica `created_at` del perfil | Trigger `trg_profiles_protect_created_at` |
| Usuario anónimo accede a tablas internas | Sin políticas SELECT para `anon` en `flights`, `simulator_sessions`, `device_connections` |
| Secretos en el repositorio | Ninguna credencial en código; ver `setup-supabase.md §6` |
| Conector falsifica cronologías | `started_at`/`last_seen` los asigna el servidor con `now()` |
| Vista expone perfiles privados | `security_invoker = true`; RLS filtra por `profile_visibility` |

---

## 9. Pruebas de RLS recomendadas (post-migración)

```sql
-- ── Test 1: anon no puede leer flights ──────────────────────────────────────
SET LOCAL role anon;
SELECT count(*) FROM public.flights;
-- Esperado: 0 filas (RLS bloquea sin error porque no hay política SELECT para anon)

-- ── Test 2: authenticated no puede cambiar verification_status ───────────────
SET LOCAL role authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub":"<uuid>","role":"authenticated"}';
UPDATE public.flights
   SET verification_status = 'verified'
 WHERE user_id = '<uuid>';
-- Esperado: ERROR insufficient_privilege (trigger)

-- ── Test 3: anon no ve perfiles privados en la vista ─────────────────────────
SET LOCAL role anon;
SELECT count(*) FROM public.public_profiles
 WHERE id IN (SELECT id FROM public.profiles WHERE profile_visibility = 'private');
-- Esperado: 0 filas

-- ── Test 4: propietario ve su perfil privado ─────────────────────────────────
SET LOCAL role authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub":"<uuid-de-perfil-privado>","role":"authenticated"}';
SELECT id, profile_visibility FROM public.profiles WHERE id = '<uuid-de-perfil-privado>';
-- Esperado: 1 fila con profile_visibility = 'private'

-- ── Test 5: usuario no puede falsificar created_at ───────────────────────────
SET LOCAL role authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub":"<uuid>","role":"authenticated"}';
UPDATE public.profiles SET created_at = '2020-01-01' WHERE id = '<uuid>';
-- Esperado: ERROR integrity_constraint_violation (trigger)
```

---

## 10. Limitaciones conocidas

- **Protección de `verification_status` pendiente de prueba real.** El análisis de `current_role` es correcto en teoría; la confirmación requiere ejecutar los Tests 2 y 7 de §9 en una instancia Supabase real.
- **`security_invoker` requiere PostgreSQL 15.** Verificar la versión del proyecto en Supabase antes de aplicar (`SELECT version()`).
- **La verificación automática de vuelos no existe aún.** `verification_status` permanece `'unverified'` hasta que se implemente la Edge Function en Fase 4/5.
- **Rankings solo de vuelos verificados.** Los vuelos manuales no cuentan en rankings comunitarios.
