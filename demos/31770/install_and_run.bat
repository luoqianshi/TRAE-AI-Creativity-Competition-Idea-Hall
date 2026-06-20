@echo off

:: 安装项目依赖
echo 正在安装项目依赖...
npm install

:: 检查安装是否成功
if %errorlevel% neq 0 (
    echo 依赖安装失败，请检查网络连接或 package.json 文件
    pause
    exit /b 1
)

:: 运行项目
echo 依赖安装成功，正在启动项目...
npm run dev

pause
