@echo off
echo ==================================================
echo Component Management System - Stopping Server
echo ==================================================
echo.

REM Kill python and pythonw processes
taskkill /F /IM python.exe 2>nul
taskkill /F /IM pythonw.exe 2>nul

echo.
echo [OK] Server stopped.
echo.
pause
