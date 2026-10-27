# Conector MSFS 2024 (Fase 4)

Aplicación de consola C# / .NET 8, fuera del simulador (si falla, no tumba MSFS), que lee SimConnect,
resume cada vuelo en local y lo guarda en `public.flights` como el usuario autenticado. Sin Electron, sin
servicios extra, sin base de datos local: ~10 archivos de código y cero dependencias NuGet.

## Requisitos reales (verificados en la documentación oficial del SDK de MSFS 2024)

| Requisito | Detalle |
|---|---|
| SDK de MSFS 2024 | Aporta `Microsoft.FlightSimulator.SimConnect.dll` (en `SimConnect SDK\lib\managed`) y `SimConnect.dll` nativa. Define la variable `MSFS2024_SDK`. |
| Usar el SDK **2024**, no el de 2020 | Cambió el tamaño de `ident` en las estructuras de aeropuertos; mezclar versiones da datos erróneos. |
| Proceso x64 | La `SimConnect.dll` del SDK es de 64 bits (el `.csproj` ya fija `x64`). |
| .NET 8 SDK (para compilar) / Runtime 8 (para ejecutar) | La doc oficial habla de .NET Framework 4.7; ver «No verificado». |
| Ensamblado administrado | El SDK lo instala en el GAC, que .NET 8 no usa: el `.csproj` copia ambas DLL junto al `.exe`. |
| Sin SDK | Compila igual, pero solo funciona `simulate` (el `.csproj` lo detecta y avisa). |

## Compilar y ejecutar

```
cd connector\MfaConnector
dotnet build -c Release
bin\Release\net8.0\MfaConnector.exe status      # debe decir "compilado CON SDK de MSFS 2024"
bin\Release\net8.0\MfaConnector.exe login       # una vez
bin\Release\net8.0\MfaConnector.exe run         # dejar abierto mientras se vuela
```
Si el SDK está en otra ruta: `dotnet build -c Release -p:MsfsSdkRoot="D:\MSFS 2024 SDK"`.

## Qué se detecta y con qué fiabilidad

| Dato | Cómo | Si no es fiable |
|---|---|---|
| Conexión con MSFS | Proceso `FlightSimulator2024` + `SimConnect` abierto | Espera cada 15 s |
| Inicio / fin de vuelo | Despegue = pasar de tierra a aire con >30 kt durante 3 s (solo si antes se vio en tierra). Fin = tras el último toque, <30 kt durante 20 s. Rebotes y touch-and-go no cortan el vuelo | Vuelos que empiezan en el aire no se registran |
| Aeronave | `TITLE` (puede ser el nombre de la librea) | `NULL` si vacío |
| `dep_icao` / `arr_icao` | Aeropuerto **más cercano** a ≤5 nm del punto de despegue / toque (lista de aeropuertos de SimConnect). **No** es el plan de vuelo | `NULL` + `undetected` en `connector_meta` |
| `alt_icao` | SimConnect no lo expone | **Siempre `NULL`** |
| Tiempos | Reloj del PC en UTC: inicio = despegue, fin = último toque. `duration_seconds` = fin − inicio (exigido por el CHECK de la BD). Incluye pausas; `paused_s` en `connector_meta` las cuantifica | — |
| `distance_nm` | Suma de tramos ortodrómicos a 1 Hz, despegue→frenada | `NULL` si 0 |
| `max_altitude_ft` | Máximo de `PLANE ALTITUDE` (MSL) | — |
| `landing_vs_fpm` | `PLANE TOUCHDOWN NORMAL VELOCITY` × 60, guardado en negativo (convención del frontend). Solo si el valor cambió respecto al aire y es ≥0,1 ft/s | `NULL` + `undetected` (algunos aviones de terceros no actualizan la variable) |
| Interrumpidos | MSFS se cierra o salto de posición (>1500 kt implícitos) en vuelo ≥5 min → `flight_status='interrupted'` | <5 min se descarta |
| Descartados | Duración <60 s o >24 h (límites del CHECK) | Se registra en consola |

`connector_meta` (≤2000 caracteres) también guarda `sim_version`, `max_sim_rate`, `position_jumps` y `touchdowns`.

## Seguridad

- El conector **no tiene secretos de servidor**. Solo la clave pública (anon/publishable) y la sesión del propio usuario; `login` rechaza claves `sb_secret_`.
- Inserta con el JWT del usuario: se aplican íntegras `flights_insert_own` (`auth.uid() = user_id` y `verification_status = 'unverified'`). **Nunca envía `verification_status`**; las 3 capas de `docs/security.md §3` no se tocan.
- La migración 003 no cambia RLS ni GRANT de UPDATE: `source` y `connector_meta` no se pueden editar tras el INSERT.
- `source`/`connector_meta` los escribe el cliente: son informativos y **no deben usarse como criterio de confianza**. Los datos del conector no son infalsificables (reloj del PC); la verificación sigue siendo cosa de `verify_flight_status()`.
- Guarda solo el *refresh token*, cifrado con DPAPI (usuario de Windows actual). Nunca la contraseña. `logout` lo borra.
- Se usa deliberadamente la sesión del usuario y no `device_connections`/tokens de dispositivo: esa ruta exigiría una Edge Function. Sigue pendiente para una fase posterior. Tampoco se usa `simulator_sessions` (evita 2 llamadas de red por vuelo).

## Fiabilidad de red

- Cada vuelo se escribe en `%LOCALAPPDATA%\MyFlightAcademy\outbox\` **antes** de enviarse y se borra solo con confirmación del servidor.
- Sin Internet / 5xx / 429: reintento en 30 s, 60 s… hasta 15 min. Con la cola vacía no hay temporizadores ni peticiones.
- Sesión caducada o de otro usuario: se pausa 30 min y la cola se conserva (`login` para reanudar).
- Rechazo permanente (RLS/CHECK): el archivo pasa a `outbox\rejected\` con el motivo; no se reintenta.
- Sin duplicados: `session_uuid` fijo por vuelo + `UNIQUE (user_id, session_uuid)` (ya existía en 001) + `ON CONFLICT DO NOTHING`.
- Si el conector se cae a mitad de vuelo, ese vuelo se pierde (no hay checkpoint, por simplicidad).

## Consumo

Un hilo dormido en un `EventWaitHandle`, 1 muestra/s, sin historial en memoria, sin GC de servidor. Las listas de aeropuertos
(~40 000 entradas, 2 veces por vuelo) generan memoria temporal. **No se ha medido** con MSFS: ver la etapa 3.

## Pruebas por etapas

**Etapa 1 – Supabase de pruebas (nunca el principal).**
1. SQL Editor del proyecto de pruebas: ejecutar `supabase/migrations/003_connector_flights.sql` (idempotente).
2. Ejecutar `supabase/tests/003_connector_flights_test.sql`: debe mostrar 12 filas con `passed = true`. Termina en `ROLLBACK`, no deja datos.
3. Opcional: las 3 consultas comentadas al final de la migración.

**Etapa 2 – Sin MSFS.**
1. `MfaConnector login` con URL y clave pública del proyecto de pruebas.
2. `MfaConnector simulate` (dry-run: imprime el registro, no escribe nada).
3. `MfaConnector simulate --send` → aparece una fila con `source='connector'`, `aircraft='SIMULATED Test Aircraft'`, `verification_status='unverified'`. Bórrala desde el Table Editor.
4. Corte de red: desactiva Internet, `simulate --send` (queda «Envío pendiente»; `status` muestra 1 en cola), reactiva y ejecuta `run` o `simulate --send`: se sincroniza sin duplicar.

**Etapa 3 – Con MSFS 2024 (no ejecutada todavía).** Instalar el SDK, recompilar, `status` → «CON SDK», `run`, abrir MSFS, volar un circuito corto (despegue, toque, frenar 20 s). Esperado: logs «Conectado a…», «Despegue detectado», «Toque de pista detectado», «Vuelo completado», «Vuelo sincronizado». Medir RAM: `Get-Process MfaConnector | Select WorkingSet64`.

## No verificado (requiere MSFS/Windows)

1. Que .NET 8 cargue el ensamblado administrado (diseñado para .NET Framework). Si falla, el plan B es `net48`.
2. Que `new SimConnect(..., IntPtr.Zero, 0, EventWaitHandle, 0)` funcione sin ventana y que `ReceiveMessage()` en bucle vacíe la cola.
3. Nombres exactos de miembros del wrapper (`dwApplicationVersionMajor`, `SIMCONNECT_DATA_FACILITY_AIRPORT.Icao/Latitude/Longitude`, `dwEntryNumber/dwOutOf`). El `.cs` de SimConnect es el único archivo que no pudo compilarse aquí.
4. Que los valores y el signo de `PLANE TOUCHDOWN NORMAL VELOCITY` coincidan con el aterrizaje mostrado por el simulador.
5. Que el proceso se llame `FlightSimulator2024` en tu instalación (Steam/Microsoft Store).