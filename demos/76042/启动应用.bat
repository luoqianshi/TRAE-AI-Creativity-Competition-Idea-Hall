@echo off
chcp 65001 >nul
echo ========================================
echo   合同智能审查系统 - 启动中...
echo ========================================
echo.

:: 检查 Python 是否可用
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 正在启动 HTTP 服务器...
    start http://localhost:8080
    python -m http.server 8080
    goto :end
)

:: 检查 Node.js 是否可用
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 正在启动 HTTP 服务器...
    start http://localhost:8080
    npx http-server -p 8080
    goto :end
)

:: 如果都没有，提示用户
echo 未检测到 Python 或 Node.js，请安装其中一个。
echo.
echo 或者您可以使用以下在线工具预览：
echo https://htmlpreview.github.io/
pause

:end