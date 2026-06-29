#!/usr/bin/env python3
"""一键启动脚本：自动安装依赖并启动系统"""
import subprocess
import sys
import os
import time

def main():
    print("=" * 50)
    print("  📈 股票观点验证系统 - 启动中...")
    print("=" * 50)
    print()
    
    # 安装依赖
    print("📦 正在安装依赖...")
    try:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", "requirements.txt", "-q"],
            check=True
        )
        print("✅ 依赖安装完成")
    except:
        print("⚠️ 部分依赖可能未安装，继续启动...")
    
    print()
    print("🚀 正在启动系统...")
    print()
    print("   打开浏览器后，如果页面加载慢，请等待10-20秒")
    print()
    
    # 启动 Streamlit
    subprocess.run([
        sys.executable, "-m", "streamlit", "run", "app.py",
        "--server.port", "8501"
    ])

if __name__ == "__main__":
    # 切换到脚本所在目录
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    main()