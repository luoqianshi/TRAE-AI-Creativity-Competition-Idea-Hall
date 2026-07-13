#!/bin/bash

echo "============================================"
echo "AI视频剪辑助手 - 启动脚本"
echo "============================================"
echo

# 检查Python
if ! command -v python3 &> /dev/null; then
    echo "[错误] 未检测到Python，请先安装Python 3.8+"
    exit 1
fi

# 检查FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo "[警告] 未检测到FFmpeg，视频处理功能将不可用"
    echo "请使用 brew install ffmpeg (Mac) 或 sudo apt install ffmpeg (Linux) 安装"
    echo
fi

# 安装依赖
echo "[1/3] 检查并安装依赖..."
pip3 install -r requirements.txt -q

# 创建必要目录
echo "[2/3] 创建必要目录..."
mkdir -p uploads
mkdir -p outputs

# 启动应用
echo "[3/3] 启动应用..."
echo
echo "============================================"
echo "访问地址: http://localhost:5000"
echo "按 Ctrl+C 停止服务"
echo "============================================"
echo

python3 app.py