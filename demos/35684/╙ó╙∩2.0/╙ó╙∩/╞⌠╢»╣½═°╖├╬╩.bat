@echo off
chcp 65001 >nul
title 词汇配对游戏 - 公网访问
echo ========================================
echo 🚀 词汇配对游戏 - 公网访问模式
echo ========================================
echo.
echo 🌐 正在启动服务器和公网隧道...
echo 💡 首次运行会自动下载工具，请稍候...
echo.
node tunnel-simple.js
pause