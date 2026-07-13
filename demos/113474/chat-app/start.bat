@echo off
chcp 65001 >nul
setlocal

cd /d "%~dp0"

echo ============================================
echo   IM 聊天应用 启动脚本
echo ============================================
echo.

REM ===== 检查 Python =====
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Python，请先安装 Python 3.11+ 并加入 PATH。
    echo 下载地址: https://www.python.org/downloads/
    goto :end
)

for /f "tokens=2" %%v in ('python --version 2^>^&1') do set PYVER=%%v
echo [√] Python %PYVER%

REM ===== 首次运行安装依赖 =====
if not exist "data\.deps_installed" (
    echo.
    echo [首次启动] 正在安装依赖...
    python -m pip install --upgrade pip
    python -m pip install -r requirements.txt
    if errorlevel 1 (
        echo [错误] 依赖安装失败，请检查网络或手动运行: pip install -r requirements.txt
        goto :end
    )
    if not exist "data" mkdir "data"
    echo installed > "data\.deps_installed"
    echo [√] 依赖安装完成
)

REM ===== 打印局域网 IP =====
echo.
echo --------------------------------------------
echo  访问方式:
echo   电脑:  http://localhost:8000
echo   手机:  http://^<本机IP^>:8000  (需与电脑同一局域网)
echo --------------------------------------------
echo  本机 IP 地址:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    echo   http://%%a:8000
)
echo --------------------------------------------
echo.

REM ===== 启动服务 =====
echo 正在启动服务... 按 Ctrl+C 停止
echo.
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000

:end
echo.
pause
