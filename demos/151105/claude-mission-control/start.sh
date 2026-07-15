#!/usr/bin/env bash
# Claude 指挥中心 —— 一键启动
set -e
cd "$(dirname "$0")/server"

if [ ! -d node_modules ]; then
  echo "首次运行，安装依赖…"
  npm install
fi

echo "启动服务…（Ctrl+C 停止）"
exec node index.js
