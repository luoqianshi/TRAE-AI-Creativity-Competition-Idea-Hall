@echo off
chcp 65001 >nul
title 股票观点验证系统

echo ============================================
echo   📈 股票观点验证系统
echo ============================================
echo.
echo 🚀 正在启动...
echo.
echo   浏览器加载慢的话请等待10-20秒
echo   按 Ctrl+C 停止服务
echo.

start http://localhost:8501
streamlit run app.py --server.port 8501
pause