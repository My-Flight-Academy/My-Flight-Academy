@echo off
cd /d "%~dp0"
set "MFA_SUPABASE_URL=https://fgyieqtecnwknrqkbgdw.supabase.co"
set "MFA_SUPABASE_ANON_KEY=sb_publishable_TstQVEEgiPxYJmdwm9oBaQ_0B4YvlEo"
echo ============================================================
echo  My Flight Academy - Iniciar sesion del conector (una sola vez)
echo ============================================================
echo Usa la MISMA cuenta (email y contrasena) que usas en la pagina.
echo La contrasena no se guarda en este equipo.
echo.
MfaConnector.exe login
echo.
pause