# Configuración de Supabase — My Flight Academy

> Guía paso a paso para configurar el proyecto desde cero. Sin secretos, sin credenciales reales.

---

## 1. Crear el proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) e iniciar sesión con la cuenta del propietario del proyecto.
2. Clic en **New project**.
3. Completar:
   - **Organization:** tu organización personal.
   - **Name:** `my-flight-academy` (o el nombre que prefieras; no afecta al código).
   - **Database password:** generar una contraseña fuerte. **Guardarla en un gestor de contraseñas ahora**; Supabase no la muestra de nuevo.
   - **Region:** elegir la más cercana a los usuarios esperados (ej. `South America (São Paulo)` para Colombia).
4. Clic en **Create new project**. El aprovisionamiento tarda ~2 minutos.

---

## 2. Obtener las claves del proyecto

Una vez creado el proyecto:

1. Ir a **Settings → API**.
2. Anotar (no compartir públicamente más que la `anon_key` y la URL):

| Valor | Dónde usarlo | ¿Secreto? |
|---|---|---|
| `Project URL` | En el frontend (JS), en variables de entorno del servidor | No (público) |
| `anon (public) key` | En el frontend (JS) | No (público por diseño de Supabase) |
| `service_role key` | Solo en Edge Functions / servidor | **SÍ — nunca en el frontend ni en el repositorio** |
| `JWT Secret` | Verificación manual de tokens en el servidor | **SÍ** |
| `Database password` | Conexión directa a PostgreSQL | **SÍ** |

> **La `anon_key` y la `Project URL` son seguras de incluir en el código JavaScript público.** Supabase las diseñó así: la seguridad real la da la RLS, no el secreto de estas claves.

---

## 3. Aplicar la migración inicial

### Opción A: SQL Editor de Supabase (recomendado para la Fase 1)

1. En el panel de Supabase, ir a **SQL Editor**.
2. Crear un nuevo script (clic en **New query**).
3. Copiar y pegar el contenido completo de `supabase/migrations/001_initial_schema.sql`.
4. Revisar que el entorno muestra el nombre del proyecto correcto (esquina superior izquierda).
5. Clic en **Run** (▶).
6. Verificar que no hay errores en el panel de resultados.
7. Ir a **Table Editor** y confirmar que aparecen las tablas: `profiles`, `flights`, `simulator_sessions`, `device_connections`.

### Opción B: Supabase CLI (recomendado para el flujo futuro con CI/CD)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar en la carpeta del proyecto (solo la primera vez)
supabase init

# Vincular con el proyecto remoto
supabase link --project-ref TU_PROJECT_REF

# Aplicar migraciones
supabase db push

# Verificar estado
supabase db diff
```

`TU_PROJECT_REF` se encuentra en **Settings → General → Reference ID**.

> **Advertencia:** `supabase db push` aplica migraciones al proyecto remoto vinculado. Asegurarse de estar vinculado al proyecto correcto antes de ejecutar.

---

## 4. Configurar autenticación (preparación para Fase 2)

En esta fase no se activa el registro público todavía. Estos pasos preparan la configuración.

1. Ir a **Authentication → Providers**.
2. **Email:** verificar que está habilitado. Mantener **Confirm email** activado.
3. **OAuth (opcional, Fase 2):** Google, GitHub — dejar deshabilitados por ahora.
4. Ir a **Authentication → URL Configuration**:
   - **Site URL:** `https://TU_USUARIO.github.io/My-Flight-Academy/` (o `http://localhost:8000` durante desarrollo).
   - **Redirect URLs:** añadir la URL de producción y `http://localhost:8000/**`.

---

## 5. Valores que necesitará el frontend (Fase 2)

Cuando se integre el cliente Supabase JS en el frontend, se necesitarán estos dos valores:

```javascript
// Estos valores son PÚBLICOS (no secretos).
// Se añadirán al frontend en la Fase 2, en un archivo de configuración
// que SÍ puede estar en el repositorio.

const SUPABASE_URL = 'https://XXXXXXXXXXXXXXXX.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

> **No incluir aquí los valores reales.** Obtenerlos de **Settings → API** en el momento de implementar la Fase 2.

---

## 6. Gestión de secretos del backend

Los siguientes valores **NUNCA** deben aparecer en:
- Archivos JavaScript del frontend.
- El repositorio de Git (ni siquiera en ramas privadas).
- Mensajes de commit o comentarios de código.
- Archivos de documentación públicos.

| Secreto | Dónde almacenarlo |
|---|---|
| `service_role key` | Variables de entorno de Edge Functions / CI/CD |
| `JWT Secret` | Variables de entorno del servidor |
| `Database password` | Gestor de contraseñas del propietario |
| Tokens de dispositivo del conector | Supabase Vault (Fase 4) |

Para Edge Functions de Supabase, los secretos se configuran con:
```bash
supabase secrets set SERVICE_KEY=valor_real
```
Y se leen en el código de la función con `Deno.env.get('SERVICE_KEY')`. Nunca con valores literales.

---

## 7. Cómo probar las políticas RLS

### Verificación básica (sin herramientas adicionales)

Después de aplicar la migración, ejecutar en el SQL Editor:

```sql
-- 1. Comprobar que RLS está activado en todas las tablas
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles','flights','simulator_sessions','device_connections');
-- rowsecurity debe ser TRUE en las cuatro tablas.

-- 2. Listar todas las políticas creadas
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Comprobar que un usuario anónimo no puede leer flights
SET LOCAL role anon;
SELECT count(*) FROM public.flights;
-- Debe devolver 0 (sin datos) sin error, o error de RLS si hay datos.

-- 4. Comprobar que solo se ven perfiles públicos como anónimo
SET LOCAL role anon;
SELECT id, username, profile_visibility FROM public.profiles;
-- Solo deben aparecer filas con profile_visibility = 'public'.
```

### Pruebas automáticas con pgTAP (Fase 2)

En Fase 2 se añadirán pruebas formales en `supabase/tests/` usando la librería `pgTAP`. Ejemplo de estructura:

```sql
-- supabase/tests/rls_flights_test.sql
SELECT plan(3);

-- Test: usuario anónimo no puede leer flights directamente
SET LOCAL role anon;
SELECT is_empty(
    $$ SELECT * FROM public.flights $$,
    'anon no ve filas en flights'
);

-- Test: usuario autenticado no puede cambiar verification_status
SET LOCAL role authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';
SELECT throws_ok(
    $$ UPDATE public.flights SET verification_status = ''verified'' WHERE id = ''00000000-0000-0000-0000-000000000002'' $$,
    'insufficient_privilege',
    'authenticated no puede auto-verificar un vuelo'
);

SELECT finish();
```

Ejecutar con: `supabase test db`

---

## 8. Limitaciones del plan gratuito y consideraciones operativas

| Aspecto | Plan gratuito | Implicación |
|---|---|---|
| **Pausa por inactividad** | El proyecto se pausa tras 1 semana sin actividad | La primera petición después de la pausa tarda ~10-30 s en "despertar" el proyecto. Verificar el umbral actual en [supabase.com/docs/guides/platform/going-into-prod](https://supabase.com/docs/guides/platform/going-into-prod) |
| **Base de datos** | 500 MB incluidos | Suficiente para la Fase 1-3; revisar antes de la Fase 5 (telemetría) |
| **Almacenamiento (Storage)** | 1 GB incluido | Suficiente para avatares; ampliar si se almacenan cartas aeronáuticas |
| **Bandwidth** | 5 GB/mes | Revisar cuando el proyecto sea público |
| **Edge Functions** | 500,000 invocaciones/mes | Amplio para la Fase 1-3 |
| **Auth (usuarios)** | 50,000 MAU (usuarios activos mensuales) | Más que suficiente para las fases iniciales |

> **Importante:** Los límites del plan gratuito cambian. Consultar siempre la página oficial vigente: [supabase.com/pricing](https://supabase.com/pricing)

### Respaldo de datos

Supabase no incluye backups automáticos en el plan gratuito. Opciones:

1. **Manual:** SQL Editor → exportar las tablas como CSV periódicamente.
2. **pg_dump:** usando la Connection String de **Settings → Database** (requiere la contraseña de base de datos):
   ```bash
   pg_dump "postgresql://postgres:PASSWORD@db.XXXXX.supabase.co:5432/postgres" \
     --schema=public \
     --file=backup-$(date +%Y%m%d).sql
   ```
3. **Upgrade a Pro:** incluye backups diarios automáticos.

> El plan gratuito es adecuado para el desarrollo de las Fases 1 a 3. Considerar el upgrade a Pro antes de abrir el registro público (Fase 2).
