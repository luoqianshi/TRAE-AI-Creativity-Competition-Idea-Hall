@echo off
echo ==================================================
echo Component Management System - Starting Server
echo ==================================================
echo.

cd /d "%~dp0server"
if not exist "app.py" (
    cd /d "%~dp0"
)

REM Check if server is already running
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul
if %errorlevel%==0 (
    echo [WARN] Server is already running on port 5000
    echo.
    pause
    exit /b
)

REM Start server silently (no window)
start "" pythonw app.py

echo [OK] Server started (silent mode)
echo Use stop.bat to stop the server.
pause
