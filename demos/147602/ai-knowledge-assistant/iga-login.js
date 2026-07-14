const { spawn } = require('child_process');

console.log('正在启动 IGA 登录流程...');
console.log('请在浏览器中完成登录授权');

const loginProc = spawn('iga', ['login'], {
  shell: 'cmd.exe',
  stdio: ['pipe', 'pipe', 'pipe']
});

let loginUrl = '';

loginProc.stdout.on('data', (data) => {
  const text = data.toString();
  console.log(text);
  
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    loginUrl = urlMatch[0];
    console.log('\n登录URL:', loginUrl);
  }
});

loginProc.stderr.on('data', (data) => {
  console.error(data.toString());
});

loginProc.on('close', (code) => {
  console.log(`\n登录进程退出，代码: ${code}`);
  if (code === 0) {
    console.log('✓ 登录成功！');
  } else {
    console.log('✗ 登录失败');
  }
});

setTimeout(() => {
  console.log('\n等待登录中...请在浏览器中完成授权');
}, 3000);
