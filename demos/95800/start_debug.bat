@echo off
echo ==================================================
echo Component Management System - Debug Mode
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

echo [INFO] Starting server in debug mode...
echo Close this window to stop the server.
echo.

python app.py
