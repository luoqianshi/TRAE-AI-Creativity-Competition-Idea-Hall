#!/bin/bash
# 图媒适配文案分发工具 - 一键启动脚本
# 使用前请设置 ARK_API_KEY 环境变量

cd "$(dirname "$0")"

# ===== 配置区 =====
# 火山引擎方舟 API Key（必填）
export ARK_API_KEY="${ARK_API_KEY:-请替换为你的API_KEY}"

# 视觉模型名称或推理接入点ID（选填，默认 doubao-1.5-vision-pro-32k）
export ARK_MODEL="${ARK_MODEL:-doubao-1.5-vision-pro-32k}"

# 红狐API Key（小红书爆款笔记查询用）
export REDFOX_API_KEY="ak_e846083a24644ab7b4a44c37a88d003a"

# SSL证书路径（macOS）
export SSL_CERT_FILE="/etc/ssl/cert.pem"
# ===== 配置区结束 =====

echo "================================"
echo "  图媒适配文案分发工具 启动中..."
echo "================================"
echo ""
echo "📋 配置信息："
echo "  视觉模型: $ARK_MODEL"
if [ "$ARK_API_KEY" = "请替换为你的API_KEY" ]; then
  echo "  ⚠️  ARK_API_KEY 未设置！AI图片识别将不可用（会回退到色彩分析）"
  echo "  获取地址: https://console.volcengine.com/ark"
else
  echo "  ARK_API_KEY: ${ARK_API_KEY:0:8}****"
fi
echo ""

# 启动API后端（端口8766）
echo "1. 启动API服务 (端口8766)..."
python3 api_server.py &
API_PID=$!
sleep 1

# 启动前端静态服务（端口8765）
echo "2. 启动前端服务 (端口8765)..."
python3 -m http.server 8765 &
WEB_PID=$!
sleep 1

echo ""
echo "================================"
echo "  ✅ 启动完成！"
echo ""
echo "  📱 打开浏览器访问: http://localhost:8765"
echo "  🔧 API服务地址: http://localhost:8766"
echo ""
echo "  按 Ctrl+C 停止所有服务"
echo "================================"

# 等待退出信号
trap "kill $API_PID $WEB_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
