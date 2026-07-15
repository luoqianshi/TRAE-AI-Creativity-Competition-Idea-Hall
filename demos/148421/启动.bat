@echo off
chcp 936 >nul
title Word Master - Launcher

set "NODE_EXE=node"
set "PROJECT_DIR=%~dp0"
set "DEV_PORT=5173"

echo ================================================
echo           Word Master - Quick Launch
echo ================================================
echo.

echo [1/3] Checking Node.js environment...
%NODE_EXE% --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)
echo OK: Node.js ready

echo.
echo [2/3] Checking dependencies...
cd /d "%PROJECT_DIR%"
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)
echo OK: Dependencies ready

echo.
echo [3/3] Starting dev server...
echo.
echo ================================================
echo   Server running at: http://localhost:%DEV_PORT%
echo ================================================
echo.

start "Word Master Dev Server" npm run dev -- --host 0.0.0.0 --port %DEV_PORT%

timeout /t 3 /nobreak >nul

start "" http://localhost:%DEV_PORT%

echo.
echo Browser opened automatically!
echo.
echo Press any key to exit...
pause >nul
