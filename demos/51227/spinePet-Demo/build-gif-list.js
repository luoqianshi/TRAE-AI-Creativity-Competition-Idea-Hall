// ============================================================
//  build-gif-list.js
//  用途：扫描同目录下的 .gif 文件，自动注入到 preview.html
//  使用场景：比赛提交前运行一次（file:// 直接打开 HTML 时生效）
//  用法： node build-gif-list.js
// ============================================================
const fs = require('fs');
const path = require('path');

const BASE = __dirname;
const HTML_PATH = path.join(BASE, 'preview.html');

// 1) 扫描目录下的 .gif 文件
const gifs = fs.readdirSync(BASE)
    .filter(f => /\.gif$/i.test(f))
    .sort((a, b) => a.localeCompare(b, 'zh'));

if (!gifs.length) {
    console.error('[build-gif-list] 未找到任何 .gif 文件');
    process.exit(1);
}

console.log('[build-gif-list] 扫描到 ' + gifs.length + ' 个 .gif 文件:');
gifs.forEach(f => console.log('  - ' + f));

// 2) 读取 preview.html
let html = fs.readFileSync(HTML_PATH, 'utf8');

// 3) 替换 _gifFiles 数组（匹配占位符标记行）
//    格式: var _gifFiles = []; /* GIF_FILES_AUTO_INJECT */
//    替换为: var _gifFiles = ['pet1.gif', 'pet2.gif']; /* GIF_FILES_AUTO_INJECT */
const newList = gifs.map(f => "'" + f + "'").join(', ');
const replacement = "var _gifFiles = [" + newList + "]; /* GIF_FILES_AUTO_INJECT */";

const pattern = /var _gifFiles\s*=\s*\[[^\]]*\]\s*;\s*\/\*\s*GIF_FILES_AUTO_INJECT\s*\*\//;
if (!pattern.test(html)) {
    console.error('[build-gif-list] 未找到 _gifFiles 占位符标记，请检查 preview.html');
    process.exit(1);
}

html = html.replace(pattern, replacement);

// 4) 写回 preview.html
fs.writeFileSync(HTML_PATH, html, 'utf8');
console.log('');
console.log('[build-gif-list] 已更新 preview.html 中的 _gifFiles 列表');
console.log('[build-gif-list] 完成！现在可以直接打开 preview.html 测试降级模式');
