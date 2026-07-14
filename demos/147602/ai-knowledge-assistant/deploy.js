const { execSync } = require('child_process');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');

console.log('=== 开始部署 IGA Pages ===');
console.log('项目名称: ai-knowledge-assistant');
console.log('部署目录:', pagesDir);
console.log('');

try {
  const result = execSync('iga pages deploy --name ai-knowledge-assistant', {
    cwd: pagesDir,
    encoding: 'utf8',
    shell: 'cmd.exe',
    stdio: 'inherit',
    timeout: 120000
  });
  
  console.log('\n✓ 部署命令执行完成');
} catch (e) {
  console.error('\n✗ 部署失败');
  console.error('错误信息:', e.message);
  if (e.stderr) {
    console.error('stderr:', e.stderr);
  }
}
