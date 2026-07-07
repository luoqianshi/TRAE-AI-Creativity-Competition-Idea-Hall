#!/bin/bash
echo ""
echo "============================================"
echo "  酒店评价智能分析评分系统 - 启动中..."
echo "============================================"
echo ""

echo "[1/3] 检查 Node.js 环境..."
if ! command -v node &> /dev/null; then
    echo ""
    echo "[错误] 未检测到 Node.js，请先安装 Node.js"
    echo "下载地址：https://nodejs.org"
    echo ""
    read -p "按回车键退出..."
    exit 1
fi
echo "已安装 Node.js 版本：$(node --version)"
echo ""

echo "[2/3] 启动代理服务..."
node proxy/proxy.js &
PROXY_PID=$!
echo "代理服务已启动，监听 http://localhost:3000"
echo ""

echo "[3/3] 打开浏览器..."
sleep 2
if command -v open &> /dev/null; then
    open http://localhost:3000/
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000/
fi

echo ""
echo "============================================"
echo "  系统已启动！按 Ctrl+C 停止代理服务"
echo "============================================"
echo ""
wait $PROXY_PID
