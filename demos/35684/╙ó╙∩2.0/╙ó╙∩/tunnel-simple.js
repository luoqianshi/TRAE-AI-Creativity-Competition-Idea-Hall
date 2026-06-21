const { spawn } = require('child_process');
const os = require('os');

const PORT = 3000;

// 获取本地IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIP = getLocalIP();

console.log('🚀 正在启动本地服务器...');
const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// 等待服务器启动
setTimeout(() => {
  console.log('\n🌐 正在创建公网访问隧道（使用 npx localtunnel）...');
  console.log('💡 首次运行会自动下载，请稍候...\n');
  
  const tunnel = spawn('npx', ['localtunnel', '--port', PORT], {
    cwd: __dirname,
    shell: true
  });
  
  tunnel.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    
    // 提取公网地址
    if (output.includes('your url is:')) {
      const url = output.match(/your url is: (https?:\/\/[^\s]+)/);
      if (url) {
        console.log('\n========================================');
        console.log('✅ 公网隧道创建成功！');
        console.log('========================================');
        console.log('📱 手机访问地址（公网）:', url[1]);
        console.log('🏠 局域网访问地址: http://' + localIP + ':' + PORT);
        console.log('💻 本地访问地址: http://localhost:' + PORT);
        console.log('========================================');
        console.log('💡 提示：将上面的公网地址发送到手机即可访问');
        console.log('========================================\n');
      }
    }
  });
  
  tunnel.stderr.on('data', (data) => {
    console.error(data.toString());
  });
  
  tunnel.on('close', (code) => {
    console.log('\n❌ 隧道已关闭');
    server.kill();
    process.exit();
  });
  
}, 2000);

// 处理程序退出
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭服务器...');
  server.kill();
  process.exit();
});