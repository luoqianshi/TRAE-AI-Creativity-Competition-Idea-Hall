@echo off
echo 正在清理旧的依赖...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json

echo.
echo 正在安装依赖...
npm install

echo.
echo 安装完成！
echo.
echo 运行以下命令启动项目：
echo npm run dev
pause