@echo off
chcp 65001 >nul
title Quiz King Server
color 0A

echo.
echo ========================================
echo          Quiz King Game Server
echo ========================================
echo.
echo Starting game server...
echo.

cd /d "%~dp0"

taskkill /f /im node.exe 2>nul

node server.js

pause