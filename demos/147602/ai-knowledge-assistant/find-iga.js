const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function run(cmd) {
  try {
    const out = execSync(cmd, { encoding: 'utf8', shell: 'cmd.exe' });
    return out.trim();
  } catch (e) {
    return '';
  }
}

console.log('=== 查找 IGA CLI 安装位置 ===\n');

const npmBin = run('npm bin -g');
console.log('npm 全局 bin 路径:', npmBin);

if (npmBin && fs.existsSync(npmBin)) {
  const files = fs.readdirSync(npmBin);
  const igaFiles = files.filter(f => f.toLowerCase().includes('iga'));
  if (igaFiles.length > 0) {
    console.log('\n找到 IGA 相关文件:', igaFiles);
    console.log('\n完整路径:');
    igaFiles.forEach(f => console.log('  ' + path.join(npmBin, f)));
  } else {
    console.log('\nnpm 全局目录中未找到 iga 命令');
  }
}

console.log('\n=== 检查 TRAE 内置的 iga ===');
const traeIgaPath = path.join(process.env.APPDATA || '', 'TRAE SOLO CN', 'ModularData', 'ai-agent', 'vm', 'tools', 'node');
console.log('TRAE 工具路径:', traeIgaPath);
if (fs.existsSync(traeIgaPath)) {
  const files = fs.readdirSync(traeIgaPath);
  const igaFiles = files.filter(f => f.toLowerCase().includes('iga'));
  if (igaFiles.length > 0) {
    console.log('找到 IGA 相关文件:', igaFiles);
  }
}

console.log('\n=== 检查全局安装的 npm 包 ===');
try {
  const list = run('npm list -g --depth=0');
  console.log(list);
} catch (e) {
  console.log('获取失败');
}
