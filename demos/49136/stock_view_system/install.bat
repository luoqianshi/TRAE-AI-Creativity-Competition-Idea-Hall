@echo off
chcp 65001 >nul
title 安装依赖 - 股票观点验证系统
echo ============================================
echo   📦 安装依赖（只需执行一次）
echo ============================================
echo.
echo 🌐 使用国内镜像源下载（清华镜像）
echo.
python -m pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple --trusted-host pypi.tuna.tsinghua.edu.cn --timeout 120
if %errorlevel% neq 0 (
    echo.
    echo ⚠️ 清华镜像失败，尝试阿里云镜像...
    python -m pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com --timeout 120
)
echo.
echo ✅ 安装完成！
echo   以后双击「启动系统.py」即可运行
pause