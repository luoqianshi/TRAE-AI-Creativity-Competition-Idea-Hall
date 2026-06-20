const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;
const MP_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.data': 'application/octet-stream',
  '.bin':  'application/octet-stream',
  '.tflite': 'application/octet-stream',
  '.binarypb': 'application/octet-stream',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

const CORP_HEADERS = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
  'Cross-Origin-Resource-Policy': 'cross-origin',
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/index.html';

  if (reqUrl === '/shutdown') {
    res.writeHead(200, CORP_HEADERS);
    res.end('OK');
    server.close();
    process.exit(0);
    return;
  }

  if (reqUrl.startsWith('/mp/')) {
    const cdnUrl = MP_CDN + reqUrl.slice(3);
    https.get(cdnUrl, (cdnRes) => {
      const headers = Object.assign({}, CORP_HEADERS, {
        'Content-Type': cdnRes.headers['content-type'] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400',
      });
      res.writeHead(cdnRes.statusCode, headers);
      cdnRes.pipe(res);
    }).on('error', () => {
      res.writeHead(502, CORP_HEADERS);
      res.end('Bad Gateway');
    });
    return;
  }

  const file = path.join(ROOT, reqUrl);
  const ext = path.extname(file);

  fs.readFile(file, (err, data) => {
    if (err) {
      if (reqUrl === '/favicon.ico') { res.writeHead(204, CORP_HEADERS); res.end(); return; }
      res.writeHead(404, CORP_HEADERS);
      res.end('Not Found');
    } else {
      res.writeHead(200, Object.assign({
        'Content-Type': MIME[ext] || 'application/octet-stream',
      }, CORP_HEADERS));
      res.end(data);
    }
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port ' + PORT + ' is in use, please close the other process and retry.');
    console.error('Press any key to exit...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => process.exit(1));
  } else {
    console.error('Server error:', err.message);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log('========================================');
  console.log('  3D粒子交互系统 - 手势识别模型');
  console.log('  http://localhost:' + PORT + '/');
  console.log('  正在后台运行，请勿关闭此窗口');
  console.log('  关闭后将无法识别手势');
  console.log('  确定不需要此功能后再关闭');
  console.log('========================================');
});
