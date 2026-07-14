const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');
const assetsSrc = path.join(__dirname, 'assets');
const assetsDest = path.join(pagesDir, 'assets');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('复制 assets 目录到 pages 下...');
copyDir(assetsSrc, assetsDest);
console.log('✓ assets 目录已复制');

console.log('\n更新 HTML 文件中的资源路径...');
const htmlFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));
for (const file of htmlFiles) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  
  content = content.replace(/\.\.\/assets\//g, 'assets/');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ 已更新 ${file}`);
  } else {
    console.log(`- ${file} 无需修改`);
  }
}

console.log('\n✓ 部署准备完成！');
console.log(`部署目录: ${pagesDir}`);
