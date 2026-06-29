#!/bin/bash
echo "============================================"
echo "  📈 股票观点验证系统"
echo "============================================"
echo ""
echo "🚀 正在启动..."
echo ""
echo "  浏览器加载慢的话请等待10-20秒"
echo "  按 Ctrl+C 停止服务"
echo ""

# 自动打开浏览器
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:8501 2>/dev/null
elif command -v open &> /dev/null; then
    open http://localhost:8501 2>/dev/null
fi

streamlit run app.py --server.port 8501