@echo off
setlocal
cd /d "%~dp0"
echo Starting AI Lawyer Demo...
echo Open: http://127.0.0.1:4173/
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1"
pause
