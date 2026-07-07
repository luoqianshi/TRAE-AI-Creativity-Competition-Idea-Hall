@echo off
chcp 65001 >nul
title 空墨 Air Ink — 启动中

echo.
echo    ╔══════════════════════════════════════════╗
echo    ║       空墨 Air Ink — 隔空书法 AI        ║
echo    ║     TRAE AI 创造力大赛 · 硬件交互赛道      ║
echo    ╚══════════════════════════════════════════╝
echo.
echo  正在启动本地服务器...
echo.

start http://127.0.0.1:4173/demo.html
python -m http.server 4173

echo.
echo  服务器已关闭。
pause
