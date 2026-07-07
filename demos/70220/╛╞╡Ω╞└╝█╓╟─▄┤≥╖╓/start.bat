@echo off

pushd "%~dp0"

echo.
echo ============================================
echo   Hotel Review AI Analysis System - Starting
echo ============================================
echo.

echo [1/3] Checking Node.js environment...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Node.js not found. Please install Node.js first.
    echo Download: https://nodejs.org
    echo.
    pause
    exit /b 1
)
for /f "delims=" %%v in ('node --version') do echo Node.js version: %%v
echo.

echo [2/3] Starting proxy server...
start "Hotel Review Proxy" cmd /c "cd /d %~dp0proxy && node proxy.js"
timeout /t 4 >nul
echo Proxy server started at http://localhost:3000
echo.

echo [3/3] Opening browser...
start http://localhost:3000/

echo.
echo ============================================
echo   System started!
echo   - Closing this window will NOT stop proxy
echo   - To stop proxy: close the "Hotel Review Proxy" window
echo ============================================
echo.
pause

popd
