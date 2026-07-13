@echo off
echo ============================================
echo AI视频剪辑助手 - 启动脚本
echo ============================================
echo.

REM 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Python，请先安装Python 3.8+
    pause
    exit /b 1
)

REM 检查FFmpeg
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo [警告] 未检测到FFmpeg，视频处理功能将不可用
    echo 请从 https://ffmpeg.org/download.html 下载并安装FFmpeg
    echo.
)

REM 安装依赖
echo [1/3] 检查并安装依赖...
pip install -r requirements.txt -q

REM 创建必要目录
echo [2/3] 创建必要目录...
if not exist "uploads" mkdir uploads
if not exist "outputs" mkdir outputs

REM 启动应用
echo [3/3] 启动应用...
echo.
echo ============================================
echo 访问地址: http://localhost:5000
echo 按 Ctrl+C 停止服务
echo ============================================
echo.
python app.py

pause