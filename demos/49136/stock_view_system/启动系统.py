"""📈 启动股票观点验证系统（双击运行）"""
import subprocess
import sys
import os
import webbrowser

os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("=" * 50)
print("  📈 股票观点验证系统")
print("=" * 50)
print()
print("🚀 正在启动...")
print()

# 打开浏览器
webbrowser.open("http://localhost:8501")

# 启动系统
subprocess.run([sys.executable, "-m", "streamlit", "run", "app.py", "--server.port", "8501"])

print()
input("按回车键退出...")