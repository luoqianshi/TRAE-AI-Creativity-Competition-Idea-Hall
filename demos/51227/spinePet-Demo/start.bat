@echo off
cd /d "%~dp0"

echo.
echo  ============================================
echo   Spine Multi-Version Preview Server
echo   4.1.x (.skel) + 3.8.x (.json)
echo  ============================================
echo.

node server.js 7420
pause
