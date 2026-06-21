const localtunnel = require('localtunnel');
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

// 启动本地服务器
console.log('🚀 正在启动本地服务器...');
const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// 等待服务器启动
setTimeout(async () => {
  console.log('\n🌐 正在创建公网访问隧道...');
  
  try {
    const tunnel = await localtunnel({ port: PORT });
    
    console.log('\n========================================');
    console.log('✅ 公网隧道创建成功！');
    console.log('========================================');
    console.log('📱 手机访问地址（公网）:', tunnel.url);
    console.log('🏠 局域网访问地址: http://' + localIP + ':' + PORT);
    console.log('💻 本地访问地址: http://localhost:' + PORT);
    console.log('========================================');
    console.log('💡 提示：将上面的公网地址发送到手机即可访问');
    console.log('⚠️  注意：免费版隧道可能会定期断开，请重新运行此脚本');
    console.log('========================================\n');
    
    tunnel.on('close', () => {
      console.log('\n❌ 隧道已关闭');
      server.kill();
      process.exit();
    });
    
    tunnel.on('error', (err) => {
      console.error('\n❌ 隧道错误:', err.message);
      console.log('💡 请尝试重新运行脚本');
    });
    
  } catch (error) {
    console.error('\n❌ 创建隧道失败:', error.message);
    console.log('💡 请检查网络连接，或尝试重新运行');
    server.kill();
    process.exit(1);
  }
  
}, 2000);

// 处理程序退出
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭服务器...');
  server.kill();
  process.exit();
});