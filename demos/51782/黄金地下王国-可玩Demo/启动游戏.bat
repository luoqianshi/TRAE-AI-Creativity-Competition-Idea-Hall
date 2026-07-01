@echo off
chcp 65001 >nul
cd /d "%~dp0"

where python >nul 2>nul
if errorlevel 1 (
    echo 未检测到 Python。
    echo.
    echo 本游戏需要通过本地网页服务器运行，不能直接双击 index.html。
    echo 请安装 Python，或使用 VS Code Live Server 等静态服务器工具打开本目录。
    echo.
    pause
    exit /b 1
)

echo 正在启动《黄金地下王国》可玩 Demo...
echo.
echo 浏览器将自动打开：
echo http://localhost:8000/
echo.
echo 如果浏览器没有自动打开，请手动复制上面的地址访问。
echo 关闭此窗口即可停止本地服务器。
echo.

start "" "http://localhost:8000/"
python -m http.server 8000
pause
