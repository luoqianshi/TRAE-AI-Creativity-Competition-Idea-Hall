@echo off

:: 运行前端开发服务器
start "Frontend" npm run client:dev

:: 等待几秒钟，然后运行后端服务
timeout /t 2 /nobreak >nul
start "Backend" npm run server:dev

:: 显示提示信息
echo 项目正在启动中...
echo 前端服务运行在 http://localhost:5173
echo 后端服务运行在 http://localhost:3001
