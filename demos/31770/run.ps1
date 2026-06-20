# 运行前端开发服务器
Start-Process "npm" -ArgumentList "run client:dev" -WorkingDirectory "d:\yunce\开发串口数据读取平台"

# 等待几秒钟，然后运行后端服务
Start-Sleep -Seconds 2
Start-Process "npm" -ArgumentList "run server:dev" -WorkingDirectory "d:\yunce\开发串口数据读取平台"
