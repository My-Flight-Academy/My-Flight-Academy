# Arquitectura — My Flight Academy

> Documento de referencia técnica. Fase 1 — Octubre 2026.

---

## 1. Visión general

My Flight Academy evoluciona en dos etapas distintas:

| Etapa | Descripción |
|---|---|
| **Actual** | Aplicación web estática personal. Todo el estado vive en el navegador. |
| **Objetivo** | Plataforma comunitaria con autenticación, bitácora en la nube y conexión a MSFS 2024. |

Este documento describe la arquitectura de la etapa objetivo y las decisiones tomadas en la Fase 1 para preparar esa transición sin romper lo que ya funciona.

---

## 2. Componentes

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVEGADOR (cliente)                                                │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  My Flight Academy SPA                                       │  │
│  │  HTML + CSS + JavaScript (vanilla, sin framework)            │  │
│  │                                                              │  │
│  │  Estado local: localStorage ('fa_state') + IndexedDB        │  │
│  │  ('fa_lib' — archivos y cartas)                              │  │
│  │                                                              │  │
│  │  Futuro: Supabase JS Client (autenticación, sincronización)  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ HTTPS / WebSocket (Realtime)
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│  SUPABASE (Backend gestionado)                                      │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Auth        │  │  PostgreSQL  │  │  Storage                 │  │
│  │  (JWT, OAuth)│  │  + RLS       │  │  (avatares, archivos)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Edge Functions (SECURITY DEFINER RPCs)                      │  │
│  │  - Verificación de vuelos                                    │  │
│  │  - Vinculación segura de dispositivos (Fase futura)          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────▲───────────────────────────────────────────┘
                          │ API REST / WebSocket
                          │
┌─────────────────────────┴───────────────────────────────────────────┐
│  CONECTOR WINDOWS (aplicación local, Fase futura)                   │
│                                                                     │
│  C# + SimConnect SDK                                                │
│  Lee telemetría de MSFS 2024 en tiempo real                         │
│  Envía eventos a Supabase (sesiones, vuelos)                        │
│  Se autentica con un token de dispositivo (Fase 3 o 4)              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Responsabilidades por capa

### Frontend (SPA estática)

- Presenta las vistas de aprendizaje, diario, simulador y navegación.
- Gestiona el estado local del usuario (progreso, diario, aeropuertos, archivos).
- En fases futuras: inicia sesión con Supabase Auth, lee y escribe datos sincronizados.
- **No implementa lógica de verificación de vuelos.** Esa responsabilidad pertenece al backend.
- **No genera Rankings.** Solo los consume (lectura).

### Supabase

- Autenticación (Supabase Auth: email/contraseña, OAuth).
- Almacenamiento persistente (PostgreSQL + RLS).
- Autorización de acceso a nivel de fila (Row Level Security).
- Lógica segura de negocio (Edge Functions / funciones RPC con `SECURITY DEFINER`).
- Almacenamiento de archivos binarios (Storage: avatares, cartas aeronáuticas).

### Conector Windows

- Lee datos de telemetría de MSFS 2024 mediante SimConnect.
- Los datos de alta frecuencia (posición GPS, velocidad, altitud) se procesan localmente.
- Solo envía resúmenes de vuelo (inicio, fin, distancia, altitud máxima, tasa de descenso) a Supabase.
- **No envía telemetría cruda a la base de datos.** Evita sobrecarga y datos inconsistentes.

---

## 4. Flujo de datos previsto

### 4.1. Registro y onboarding (Fase 2)
```
Usuario → Supabase Auth (email + contraseña)
       → Trigger crea public.profiles automáticamente
       → Frontend redirige a onboarding (elegir username definitivo, país)
```

### 4.2. Sincronización del diario local (Fase 2 o 3)
```
Usuario autenticado → Frontend lee S.logs (localStorage)
                    → Ofrece "migrar al diario en la nube"
                    → Escribe en public.flights vía Supabase JS Client
                    → localStorage sigue funcionando como caché local
```

### 4.3. Vuelo con el conector (Fase 3 o 4)
```
MSFS 2024 → Conector (C#, SimConnect)
          → Detecta despegue: POST simulator_sessions (connector_session_id)
          → El servidor registra started_at con now() (no el reloj local)
          → Detecta aterrizaje: PUT session → status='completed'
          → Crea vuelo en flights (flight_status='completed', verification_status='unverified')
          → Edge Function valida telemetría → verification_status='verified' o 'rejected'
```

### 4.4. Rankings (Fase futura)
```
Consulta de lectura sobre flights
WHERE flight_status = 'completed' AND verification_status = 'verified'
ORDER BY duration_seconds DESC
```

---

## 5. Límites entre fases

| Fase | Alcance |
|---|---|
| **1 (actual)** | Inspección, migración SQL, RLS, documentación. Sin cambios en el frontend. |
| **2** | Autenticación (Supabase Auth), pantallas de registro/login/perfil, onboarding. |
| **3** | Migración del diario local a la nube. Sincronización bidireccional. |
| **4** | Conector Windows (C# + SimConnect). Vinculación de dispositivos. |
| **5** | Rankings, estadísticas comunitarias, validación de vuelos. |

---

## 6. Decisiones técnicas y justificación

| Decisión | Justificación |
|---|---|
| **No migrar a React/Vue/Angular** | El frontend existente funciona. La migración a un framework es un coste sin beneficio en esta fase. Se puede hacer de forma incremental más adelante si se necesita. |
| **Supabase como backend** | Proporciona auth, base de datos PostgreSQL, RLS, Storage y Edge Functions en un solo servicio gestionado. Sin servidor propio que mantener. Plan gratuito viable para el proyecto personal. |
| **PostgreSQL + RLS, no Firebase** | RLS garantiza seguridad a nivel de fila directamente en la base de datos, independientemente del cliente. Firebase/Firestore no ofrece este nivel de control. |
| **Sin telemetría de alta frecuencia en la BD** | Evita millones de filas por vuelo. Solo se almacenan resúmenes. Los datos de alta frecuencia viven en el conector durante el vuelo y se descartan después. |
| **`UNIQUE(user_id, session_uuid)` en flights** | La unicidad por usuario expresa la invariante de negocio correcta. La unicidad global podría rechazar vuelos legítimos de distintos usuarios con el mismo UUID por un bug del conector. Ver `docs/database.md §3.2.1`. |
| **`verification_status` protegido por trigger con `current_role`** | Las subconsultas autorreferenciales en `WITH CHECK` son frágiles bajo RLS recursivo. El trigger comprueba `current_role`, que no puede ser falsificado por el cliente. Ver `docs/security.md §3`. |
| **Vista `public_profiles` con `security_invoker = true`** | Las vistas estándar ejecutan RLS con el propietario de la vista, omitiendo las políticas. `security_invoker` delega la evaluación al rol del llamante, que sí está sujeto a RLS. Requiere PostgreSQL 15. |
| **GRANTs explícitos en la migración** | La configuración por defecto de Supabase aplica grants amplios, pero no es parte de la migración. Declararlos explícitamente hace la migración reproducible en instancias locales y entornos CI/CD. |
| **`revoked_at` en lugar de DELETE en device_connections** | Mantener el historial de auditoría es más seguro. Un dispositivo revocado no puede reactivarse accidentalmente. |
| **Trigger `handle_new_user` con SECURITY DEFINER** | Necesario para escribir en `public.profiles` desde el contexto de `auth`. Con guard de 100 iteraciones y manejo de email nulo (usuarios OAuth). |

---

## 7. Estado del frontend actual (Fase 1)

```
localStorage 'fa_state':
  done     {}       — lecciones completadas (clave "fase|tema" → true)
  exams    []       — historial de exámenes {ph, d, iso, ts, s, n, miss}
  logs     []       — bitácora de vuelo (ver docs/database.md §2)
  chk      {}       — reservado (actualmente sin uso)
  mins     0        — reservado (actualmente sin uso)
  apt      {}       — fichas de aeropuertos por código ICAO
  custom   []       — aeropuertos añadidos por el usuario
  act      []       — actividad reciente (runtime, no en def inicial)
  name     ""       — nombre del piloto (runtime)
  seeded   {}       — flags de precarga de datos por defecto

IndexedDB 'fa_lib' (store 'f'):
  {id, name, kind, cat, icao, vig, type, data, added}
  — archivos de Biblioteca y Cartas (base64 data-URL, máx 15 MB cada uno)
```

Ninguno de estos datos se sincroniza con ningún servidor en la Fase 1.
