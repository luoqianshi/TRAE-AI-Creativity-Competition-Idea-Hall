const { exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

const DEFAULT_PORT = 8080;

function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

async function main() {
  const PORT = await findAvailablePort(DEFAULT_PORT);

  const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : decodeURIComponent(req.url));

    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();

    fs.readFile(filePath, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404);
          res.end('Not Found');
        } else {
          res.writeHead(500);
          res.end('Server Error');
        }
        return;
      }

      res.writeHead(200, {
        'Content-Type': mimeTypes[ext] || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(data);
    });
  });

  server.listen(PORT, () => {
    console.log(`\n服务器已启动: http://localhost:${PORT}`);
    console.log('正在打开浏览器...\n');

    exec(`start http://localhost:${PORT}`, (err) => {
      if (err) console.error('打开浏览器失败:', err.message);
    });
  });

  process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    server.close(() => process.exit(0));
  });
}

main().catch(err => {
  console.error('启动失败:', err);
  process.exit(1);
});
