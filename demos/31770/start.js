// 启动前端和后端服务
const { exec } = require('child_process');
const path = require('path');

// 启动前端开发服务器
const frontendProcess = exec('npm run client:dev', {
  cwd: path.join(__dirname)
});

frontendProcess.stdout.on('data', (data) => {
  console.log('前端服务:', data.toString());
});

frontendProcess.stderr.on('data', (data) => {
  console.error('前端服务错误:', data.toString());
});

// 等待 2 秒后启动后端服务
setTimeout(() => {
  const backendProcess = exec('npm run server:dev', {
    cwd: path.join(__dirname)
  });

  backendProcess.stdout.on('data', (data) => {
    console.log('后端服务:', data.toString());
  });

  backendProcess.stderr.on('data', (data) => {
    console.error('后端服务错误:', data.toString());
  });
}, 2000);

console.log('项目正在启动中...');
console.log('前端服务运行在 http://localhost:5173');
console.log('后端服务运行在 http://localhost:3001');
