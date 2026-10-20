# Base de datos — My Flight Academy

> Diseño de tablas, relaciones, restricciones e índices. Fase 1 — revisión post-auditoría (v2).

---

## 1. Diagrama de relaciones

```
auth.users (Supabase, gestionado)
    │
    │ id (UUID) — trigger crea perfil automáticamente al registrar
    ▼
public.profiles ──────────────────────────────────────────────────────┐
    id (PK)                                                           │
    username (UNIQUE)                                                 │
    avatar_url                                                        │
    country                                                           │
    profile_visibility                                                │
    created_at (inmutable) / updated_at                               │
         │                         │                                  │
         │ user_id (FK)            │ user_id (FK)       user_id (FK)  │
         ▼                         ▼                         ▼        │
public.flights          public.simulator_sessions   public.device_connections
    id (PK)                 id (PK)                     id (PK)
    user_id (FK)            user_id (FK)                user_id (FK)
    session_uuid            connector_session_id (UNIQUE) device_name
      UNIQUE(user_id,        started_at                  revoked_at
      session_uuid)          last_seen                   created_at
    dep_icao / arr_icao     flight_id (FK → flights)
    aircraft                session_status
    started_at / ended_at   created_at
    duration_seconds
    distance_nm
    max_altitude_ft
    landing_vs_fpm (±6000)
    flight_status
    verification_status (protegido por trigger)
    notes
    created_at / updated_at
```

---

## 2. Modelo de datos del diario local (referencia para migración)

El diario actual en `localStorage` usa este esquema por entrada. Al sincronizar con la nube (Fase 3), cada entrada se mapea a una fila de `public.flights`.

| Campo local | Tipo local | → Columna en `flights` | Notas |
|---|---|---|---|
| `id` | string base36 | `session_uuid` (como UUID derivado) | Se generará un UUID v4 real |
| `d` | string ISO date | `started_at` (date part) | Se pierde la hora exacta si no hay `t0` |
| `t0` / `t1` | string HH:MM | `started_at` / `ended_at` | Combinados con `d` |
| `dep` | ICAO 4 chars | `dep_icao` | |
| `arr` | ICAO 4 chars | `arr_icao` | |
| `alt` | ICAO 4 chars | *(sin columna aún)* | Añadir en migración posterior |
| `ac` | string | `aircraft` | |
| `dur` | minutos (int) | `duration_seconds` | × 60 |
| `n` | string | `notes` | |
| `kind` | 'SIMULADOR' / 'VUELO REAL' | *(campo a añadir)* | Fase 3 |
| `sim` | string | *(campo a añadir)* | Fase 3 |
| `ftype`, `wx`, `rules`, `appr`, `land` | strings | *(campos a añadir)* | Fase 3 |
| `reg`, `route` | strings | *(campos a añadir)* | Fase 3 |

---

## 3. Tablas

### 3.1. `public.profiles`

| Columna | Tipo | Nullable | Default | Restricciones |
|---|---|---|---|---|
| `id` | UUID | NO | — | PK, FK → auth.users(id) CASCADE |
| `username` | TEXT | NO | — | UNIQUE, 3–30 chars, regex `^[a-z0-9_.-]+$` |
| `avatar_url` | TEXT | SÍ | — | |
| `country` | CHAR(2) | SÍ | — | regex `^[A-Z]{2}$` |
| `profile_visibility` | TEXT | NO | 'public' | IN ('public','private') |
| `created_at` | TIMESTAMPTZ | NO | `now()` | **Inmutable** — trigger `trg_profiles_protect_created_at` |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Trigger `trg_profiles_updated_at` |

**Índices**
- `idx_profiles_username` — búsquedas y autocompletar por username.

**Triggers**
- `trg_profiles_updated_at` — actualiza `updated_at` en cada UPDATE.
- `trg_profiles_protect_created_at` — impide modificar `created_at` para cualquier rol.
- `trg_on_auth_user_created` — crea perfil en `public.profiles` al registrar en `auth.users`.

---

### 3.2. `public.flights`

| Columna | Tipo | Nullable | Default | Restricciones |
|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK |
| `user_id` | UUID | NO | — | FK → profiles(id) CASCADE; **sin GRANT UPDATE** para authenticated |
| `session_uuid` | UUID | SÍ | — | UNIQUE compuesta `(user_id, session_uuid)`; **sin GRANT UPDATE** |
| `dep_icao` | CHAR(4) | SÍ | — | regex `^[A-Z0-9]{4}$`; GRANT UPDATE ✓ |
| `arr_icao` | CHAR(4) | SÍ | — | regex `^[A-Z0-9]{4}$`; GRANT UPDATE ✓ |
| `alt_icao` | CHAR(4) | SÍ | — | regex `^[A-Z0-9]{4}$`; GRANT UPDATE ✓ |
| `aircraft` | TEXT | SÍ | — | máx 80 chars; GRANT UPDATE ✓ |
| `started_at` | TIMESTAMPTZ | SÍ | — | Par con `ended_at`; GRANT UPDATE ✓ |
| `ended_at` | TIMESTAMPTZ | SÍ | — | > `started_at`; GRANT UPDATE ✓ |
| `duration_seconds` | INTEGER | SÍ | — | 60–86400; coherente con fechas si presentes; GRANT UPDATE ✓ |
| `distance_nm` | NUMERIC(8,2) | SÍ | — | > 0; GRANT UPDATE ✓ |
| `max_altitude_ft` | INTEGER | SÍ | — | -2000–100000; GRANT UPDATE ✓ |
| `landing_vs_fpm` | INTEGER | SÍ | — | -6000–6000, NULL si no medido; GRANT UPDATE ✓ |
| `flight_status` | TEXT | NO | 'planned' | IN ('planned','active','completed','interrupted','cancelled'); GRANT UPDATE ✓ |
| `verification_status` | TEXT | NO | 'unverified' | IN ('unverified','pending_review','verified','rejected'); **SIN GRANT UPDATE para authenticated** |
| `notes` | TEXT | SÍ | — | máx 4000 chars; GRANT UPDATE ✓ |
| `created_at` | TIMESTAMPTZ | NO | `now()` | **Sin GRANT UPDATE** |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Trigger `set_updated_at`; **sin GRANT UPDATE** |

#### 3.2.1. Decisión: unicidad de `session_uuid`

**v1 (auditada):** `session_uuid UUID UNIQUE` — unicidad global.

**v2 (actual):** `CONSTRAINT uq_flights_user_session UNIQUE (user_id, session_uuid)` — unicidad por usuario.

**Justificación:** `session_uuid` identifica la sesión del conector dentro del espacio de vuelos de un usuario, no a nivel global. Si dos usuarios distintos usasen el mismo UUID (por un bug del conector), la unicidad global rechazaría el segundo insert con un error críptico, cuando en realidad son entidades independientes. La unicidad por usuario expresa la invariante de negocio correcta: *un usuario no puede tener dos vuelos del mismo conector en la misma sesión*.

`connector_session_id` en `simulator_sessions` sí mantiene unicidad global porque identifica una instancia de ejecución del programa conector, que sí es globalmente única.

**Constraints inter-columna**
- `chk_flights_dates_both_or_none` — `started_at` y `ended_at` deben existir juntos o no existir ninguno.
- `chk_flights_end_after_start` — `ended_at > started_at`.
- `chk_flights_duration_max` — diferencia entre fechas ≤ 86400 s (24 h).
- `chk_flights_duration_consistent` — si los tres valores están presentes (`started_at`, `ended_at`, `duration_seconds`), la diferencia entre ellos no puede superar 120 s. No aplica cuando alguno es NULL (registros manuales sin fechas exactas).

**Nota sobre `landing_vs_fpm`:** el rango ±6 000 ft/min cubre acrobacias y emergencias sin aceptar valores físicamente imposibles para aeronaves convencionales de MSFS 2024. NULL se acepta cuando el conector no detecta el momento del toque.

**Índices**
- `idx_flights_user_created` — historial por usuario ordenado por fecha.
- `idx_flights_user_status` — filtros por estado.
- `idx_flights_ranking` — índice parcial: solo `completed` + `verified`.

---

### 3.3. `public.simulator_sessions`

| Columna | Tipo | Nullable | Default | Restricciones |
|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK |
| `user_id` | UUID | NO | — | FK → profiles(id) CASCADE |
| `connector_session_id` | UUID | NO | — | **UNIQUE global** |
| `started_at` | TIMESTAMPTZ | NO | `now()` | Asignado por el servidor |
| `last_seen` | TIMESTAMPTZ | NO | `now()` | Actualizar con upsert |
| `flight_id` | UUID | SÍ | — | FK → flights(id) SET NULL |
| `session_status` | TEXT | NO | 'active' | IN ('active','completed','lost','error') |
| `created_at` | TIMESTAMPTZ | NO | `now()` | |

**Patrón de uso anti-duplicados (upsert)**
```sql
INSERT INTO public.simulator_sessions (user_id, connector_session_id, session_status)
VALUES ($1, $2, 'active')
ON CONFLICT (connector_session_id)
DO UPDATE SET last_seen = now(), session_status = EXCLUDED.session_status;
```

---

### 3.4. `public.device_connections`

| Columna | Tipo | Nullable | Default | Restricciones |
|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK |
| `user_id` | UUID | NO | — | FK → profiles(id) CASCADE |
| `device_name` | TEXT | NO | — | 1–60 chars |
| `revoked_at` | TIMESTAMPTZ | SÍ | NULL | NULL = activo |
| `created_at` | TIMESTAMPTZ | NO | `now()` | |

---

## 4. Consultas frecuentes previstas

### Historial de vuelos de un usuario
```sql
SELECT id, dep_icao, arr_icao, aircraft, started_at, duration_seconds, flight_status
FROM public.flights
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 50;
```

### Ranking de horas voladas (completadas y verificadas)
```sql
SELECT p.username, p.country, SUM(f.duration_seconds) AS total_seconds
FROM public.flights f
JOIN public.profiles p ON p.id = f.user_id
WHERE f.flight_status = 'completed'
  AND f.verification_status = 'verified'
  AND p.profile_visibility = 'public'
GROUP BY p.id, p.username, p.country
ORDER BY total_seconds DESC
LIMIT 20;
```

### Anti-duplicados al registrar desde el conector
```sql
INSERT INTO public.simulator_sessions (user_id, connector_session_id)
VALUES ($user_id, $connector_session_id)
ON CONFLICT (connector_session_id) DO UPDATE SET last_seen = now();
```

### Dispositivos activos del usuario
```sql
SELECT id, device_name, created_at
FROM public.device_connections
WHERE user_id = auth.uid()
  AND revoked_at IS NULL
ORDER BY created_at DESC;
```

---

## 5. Comportamiento al eliminar una cuenta

| Tabla | Acción |
|---|---|
| `profiles` | Se elimina (FK `ON DELETE CASCADE` desde `auth.users`) |
| `flights` | Se eliminan en cascada (FK `user_id → profiles.id CASCADE`) |
| `simulator_sessions` | Se eliminan en cascada |
| `device_connections` | Se eliminan en cascada |

La eliminación de cuentas se tramita desde el panel de Supabase o mediante una Edge Function. No está implementada en el cliente en Fase 1.
