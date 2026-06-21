@echo off
chcp 65001 >nul
echo ========================================
echo    正在关闭服务器...
echo ========================================
echo.

:: 查找占用3000端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    echo 发现进程: %%a
    echo 正在终止进程...
    taskkill /F /PID %%a
    if errorlevel 0 (
        echo 进程已成功终止！
    ) else (
        echo 进程终止失败！
    )
)

echo.
echo ========================================
echo    服务器已关闭！
echo ========================================
echo.
pause
