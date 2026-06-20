@echo off
cd /d "%~dp0"

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /PID %%a /F >nul 2>&1
)

timeout /t 2 /nobreak >nul

set "NODE=%APPDATA%\TRAE SOLO CN\ModularData\ai-agent\vm\tools\node\node.exe"

if not exist "%NODE%" (
    echo Node.js not found at: %NODE%
    echo Please install Node.js or update the path in start.bat
    pause
    exit /b 1
)

start "" /MIN "%NODE%" server.js

timeout /t 3 /nobreak >nul
start "" http://localhost:3000
exit
