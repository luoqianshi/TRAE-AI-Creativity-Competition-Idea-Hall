@echo off
pushd "%~dp0"
echo.
echo ============================================
echo   Starting proxy server manually
echo ============================================
echo.
echo This window must stay open.
echo If you see errors below, screenshot them.
echo.
cd proxy
node proxy.js
pause