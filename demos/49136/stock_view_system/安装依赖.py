"""📦 安装依赖（双击运行，使用国内镜像源）"""
import subprocess
import sys
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("=" * 50)
print("  📦 安装依赖（只需执行一次）")
print("=" * 50)
print()
print("🌐 使用国内镜像源下载（清华镜像）")
print()

# 先用镜像源安装
ret = subprocess.run([
    sys.executable, "-m", "pip", "install",
    "-r", "requirements.txt",
    "-i", "https://pypi.tuna.tsinghua.edu.cn/simple",
    "--trusted-host", "pypi.tuna.tsinghua.edu.cn",
    "--timeout", "120"
])

if ret.returncode != 0:
    print()
    print("⚠️ 清华镜像失败，尝试阿里云镜像...")
    ret = subprocess.run([
        sys.executable, "-m", "pip", "install",
        "-r", "requirements.txt",
        "-i", "https://mirrors.aliyun.com/pypi/simple/",
        "--trusted-host", "mirrors.aliyun.com",
        "--timeout", "120"
    ])

if ret.returncode == 0:
    print()
    print("✅ 安装完成！以后双击「启动系统.py」即可运行")
else:
    print()
    print("⚠️ 还是没装好，可能是网络问题。")
    print("   试试：")
    print("   1. 开手机热点")
    print("   2. 换个网络环境（公司/家里的WiFi）")
    print("   3. 用手机流量开热点给电脑")

print()
input("按回车键退出...")