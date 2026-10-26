@echo off
rem ============================================================
rem  flight_dispatch DB one-click import (Windows, double-clickable)
rem  Actual logic lives in import_flight_dispatch.ps1 - this file
rem  only invokes it.
rem
rem  To change default DB name / password, edit the param defaults
rem  inside import_flight_dispatch.ps1, or append args here, e.g.
rem    ... -File "%~dp0import_flight_dispatch.ps1" -DbName fd_restore -PgPassword admin
rem ============================================================
setlocal

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0import_flight_dispatch.ps1" %*
set RC=%ERRORLEVEL%

echo.
echo ==============================================
if not "%RC%"=="0" (
  echo  FAILED with exit code %RC% - see messages above
) else (
  echo  Done.
)
echo ==============================================
pause
exit /b %RC%
