#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
PORT=8765

pkill -f "http.server $PORT" 2>/dev/null || true

nohup python3 -m http.server $PORT >/dev/null 2>&1 &
SERVER_PID=$!

for i in 1 2 3 4 5 6; do
  sleep 0.5
  if curl -s http://localhost:$PORT/ > /dev/null 2>&1; then
    break
  fi
done

open "http://localhost:$PORT/"

echo ""
echo "=========================================="
echo "  「家长助手」Demo 已在浏览器打开"
echo "  http://localhost:$PORT/"
echo "=========================================="
echo ""
echo "按 Ctrl+C 可关闭服务器"
wait $SERVER_PID
