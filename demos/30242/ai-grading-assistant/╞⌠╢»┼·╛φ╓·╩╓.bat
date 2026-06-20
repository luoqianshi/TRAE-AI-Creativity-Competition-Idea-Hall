@echo off
chcp 65001 >nul
title AI批卷助手

echo.
echo ========================================
echo      AI批卷助手 - 一键启动
echo ========================================
echo.

:: 检查Node.js是否安装
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    echo        下载地址: https://nodejs.org/
    pause
    exit /b 1
)

:: 启动本地服务器
echo [信息] 正在启动本地服务器...
echo [信息] 请稍等，服务器启动后会自动打开浏览器
echo.

:: 在后台启动服务器
start /b node server.js

:: 等待服务器启动
timeout /t 2 /nobreak >nul

:: 打开浏览器
echo [信息] 正在打开浏览器...
start http://localhost:8080

echo.
echo [成功] AI批卷助手已启动！
echo [提示] 请保持此窗口打开，关闭窗口将停止服务
echo.
pause
