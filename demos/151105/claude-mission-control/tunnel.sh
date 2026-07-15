#!/usr/bin/env bash
# Claude 指挥中心 —— 公网隧道一键启动（本地服务 + cloudflared）
# 让手机在任意网络下都能访问。每次启动会生成一个新的随机公网地址。
set -e
cd "$(dirname "$0")"
PROJ="$(pwd)"

# 读取端口与访问密钥
PORT=$(node -e "console.log(require('./config.json').port||4600)")
KEY=$(node -e "console.log(require('./config.json').accessKey||'')")

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "未找到 cloudflared，请先安装： brew install cloudflared"
  exit 1
fi

cd server
[ -d node_modules ] || npm install

# 若端口已被占用则复用，否则启动本地服务
if lsof -ti "tcp:$PORT" >/dev/null 2>&1; then
  echo "检测到 $PORT 端口已有服务，直接复用。"
else
  echo "启动本地服务 (端口 $PORT)…"
  PORT="$PORT" node index.js > /tmp/mc_server.log 2>&1 &
  SERVER_PID=$!
  sleep 2
fi

echo "启动 cloudflared 隧道 (http2)…"
cloudflared tunnel --protocol http2 --url "http://localhost:$PORT" > /tmp/mc_tunnel.log 2>&1 &
TUNNEL_PID=$!

# 等待公网地址出现
echo -n "等待公网地址"
URL=""
for i in $(seq 1 30); do
  URL=$(grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" /tmp/mc_tunnel.log | head -1 || true)
  [ -n "$URL" ] && break
  echo -n "."
  sleep 1
done
echo ""

cleanup() {
  echo ""; echo "正在关闭隧道与服务…"
  kill "$TUNNEL_PID" 2>/dev/null || true
  [ -n "${SERVER_PID:-}" ] && kill "$SERVER_PID" 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

if [ -z "$URL" ]; then
  echo "未能获取公网地址，请查看 /tmp/mc_tunnel.log"
  cat /tmp/mc_tunnel.log | tail -20
  cleanup
fi

FULL="$URL/"
[ -n "$KEY" ] && FULL="$URL/?key=$KEY"

echo ""
echo "  ========================================================"
echo "  🛰️  公网已就绪！手机浏览器打开下面的链接（含密钥）："
echo ""
echo "     $FULL"
echo ""
[ -n "$KEY" ] && echo "  访问密钥: $KEY"
echo "  提示：此地址为临时随机地址，本进程关闭即失效。"
echo "  按 Ctrl+C 停止隧道与服务。"
echo "  ========================================================"
echo ""

# 保持前台
wait "$TUNNEL_PID"
