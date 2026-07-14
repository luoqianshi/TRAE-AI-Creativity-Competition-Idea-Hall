// Spine 多版本本地预览服务器 (4.2.x + 4.1.x + 4.0.x + 3.8.x .json + .skel)
// 用法: node server.js [端口号，默认 7420]
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = parseInt(process.argv[2], 10) || 7420;
const BASE = __dirname;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript',
    '.css':  'text/css',
    '.png':  'image/png',
    '.atlas':'text/plain; charset=utf-8',
    '.skel': 'application/octet-stream',
    '.json': 'application/json',
    '.ico':  'image/x-icon',
    '.svg':  'image/svg+xml',
};


function readJsonSkeletonMeta(filePath) {
    try {
        const text = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(text);
        return json && json.skeleton || {};
    } catch (e) {}
    return {};
}

function detectSpineVersion(filePath, suffix, jsonSkeleton) {
    try {
        if (suffix === 'json') return jsonSkeleton && jsonSkeleton.spine || '';

        if (suffix === 'skel') {
            const fd = fs.openSync(filePath, 'r');
            const buf = Buffer.alloc(512);
            const n = fs.readSync(fd, buf, 0, buf.length, 0);
            fs.closeSync(fd);
            const head = buf.slice(0, n).toString('latin1');
            const m = head.match(/(?:^|[^\d])(\d+\.\d+(?:\.\d+)?)/);
            return m ? m[1] : '';
        }
    } catch (e) {}
    return '';
}

function getSkeletonBounds(jsonSkeleton) {
    if (!jsonSkeleton) return null;
    const x = Number(jsonSkeleton.x);
    const y = Number(jsonSkeleton.y);
    const width = Number(jsonSkeleton.width);
    const height = Number(jsonSkeleton.height);
    if (![x, y, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return null;
    return { x, y, width, height };
}

function getSupportInfo(version, suffix, actualVersion) {
    const effective = actualVersion || version;

    if (version === '3.8.99' || effective === '3.8.99') {
        return {
            level: suffix === 'skel' ? 'experimental' : 'supported',
            message: suffix === 'skel'
                ? '3.8.99 .skel is experimental in the generic player; convert to .json if it fails.'
                : ''
        };
    }

    if (version === '3.8') {
        return {
            level: 'supported',
            message: effective && effective !== '3.8.75'
                ? 'Folder version differs from embedded Spine version: ' + effective
                : ''
        };
    }

    return { level: 'supported', message: '' };
}

// ---- 扫描目录，返回文件列表 ----
function scanDir(dirPath, suffix, version, type) {
    try {
        const files = fs.readdirSync(dirPath);
        return files
            .filter(f => f.toLowerCase().endsWith('.' + suffix))
            .map(f => {
                const name = f.slice(0, -(suffix.length + 1));
                const filePath = path.join(dirPath, f);
                const jsonSkeleton = suffix === 'json' ? readJsonSkeletonMeta(filePath) : null;
                const actualVersion = detectSpineVersion(filePath, suffix, jsonSkeleton);
                const support = getSupportInfo(version, suffix, actualVersion);
                // 读取 atlas 文件判断 pma（只有显式写了 pma: 才算，没写的不假设）
                let pma = false;
                try {
                    const atlasPath = path.join(dirPath, name + '.atlas');
                    if (fs.existsSync(atlasPath)) {
                        const fd = fs.openSync(atlasPath, 'r');
                        const buf = Buffer.alloc(4096);
                        const n = fs.readSync(fd, buf, 0, 4096, 0);
                        fs.closeSync(fd);
                        const head = buf.slice(0, n).toString('utf8');
                        pma = /pma:\s*true/i.test(head);
                    }
                } catch (e) {}
                return {
                    name: name,
                    version: version,
                    actualVersion: actualVersion,
                    dir: path.basename(dirPath),
                    ext: suffix,
                    pma: pma,
                    bounds: getSkeletonBounds(jsonSkeleton),
                    supportLevel: support.level,
                    supportMessage: support.message
                };
            });
    } catch (e) {
        return [];
    }
}

const srv = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    res.setHeader('Access-Control-Allow-Origin', '*');

    // API: 列出所有版本的 spine 文件
    if (urlPath === '/api/file-list') {
        const list = [].concat(
            scanDir(path.join(BASE, 'spine-4.2.40'), 'skel', '4.2', 'skel'),
            scanDir(path.join(BASE, 'spine-4.2.40'), 'json', '4.2', 'json'),
            scanDir(path.join(BASE, 'spine-4.1.24'), 'skel', '4.1', 'skel'),
            scanDir(path.join(BASE, 'spine-4.1.24'), 'json', '4.1', 'json'),
            scanDir(path.join(BASE, 'spine-4.0.64'), 'skel', '4.0', 'skel'),
            scanDir(path.join(BASE, 'spine-4.0.64'), 'json', '4.0', 'json'),
            scanDir(path.join(BASE, 'spine-3.8.75'), 'json', '3.8', 'json'),
            scanDir(path.join(BASE, 'spine-3.8.75'), 'skel', '3.8', 'skel'),
            scanDir(path.join(BASE, 'spine-3.8.99'), 'json', '3.8.99', 'json'),
            scanDir(path.join(BASE, 'spine-3.8.99'), 'skel', '3.8.99', 'skel')
        );
        // 按名称排序
        list.sort(function(a, b) { return a.name.localeCompare(b.name); });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(list));
        return;
    }

    // API: 列出根目录下的 .gif 文件（降级模式使用）
    if (urlPath === '/api/gif-list') {
        try {
            const gifs = fs.readdirSync(BASE)
                .filter(f => /\.gif$/i.test(f))
                .sort(function(a, b) { return a.localeCompare(b); });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(gifs));
        } catch(e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '无法读取目录' }));
        }
        return;
    }

    // API: 列出 background/ 目录下的背景图片
    if (urlPath === '/api/bg-list') {
        try {
            const bgDir = path.join(BASE, 'background');
            const files = fs.readdirSync(bgDir)
                .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
                .sort(function(a, b) { return a.localeCompare(b); });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(files));
        } catch(e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '无法读取 background 目录' }));
        }
        return;
    }

    // 兼容旧 API
    if (urlPath === '/api/skel-list') {
        const list = scanDir(path.join(BASE, 'spine-4.1.24'), 'skel', '4.1', 'skel')
            .map(function(f) { return f.name; });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(list));
        return;
    }

    let file = path.join(BASE, urlPath);
    if (req.url === '/') file = path.join(BASE, 'preview.html');

    const ext = path.extname(file).toLowerCase();
    res.setHeader('Access-Control-Allow-Origin', '*');

    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('404 Not Found: ' + req.url);
        } else {
            res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
            res.end(data);
        }
    });
});

srv.listen(PORT, '127.0.0.1', () => {
    const url = 'http://localhost:' + PORT + '/preview.html';
    console.log('');
    console.log('  =============================================');
    console.log('   Spine Multi-Version Preview Server');
    console.log('   4.2.x / 4.1.x / 4.0.x (.skel) + 3.8.x (.json / .skel)');
    console.log('   ' + url);
    console.log('   按 Ctrl+C 停止服务器');
    console.log('  =============================================');
    console.log('');

    const { exec } = require('child_process');
    const cmd = process.platform === 'win32'
        ? 'start "" "' + url + '"'
        : (process.platform === 'darwin' ? 'open "' + url + '"' : 'xdg-open "' + url + '"');
    exec(cmd);
});
