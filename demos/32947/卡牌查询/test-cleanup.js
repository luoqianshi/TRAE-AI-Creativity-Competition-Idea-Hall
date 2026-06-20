const fs = require('fs');
const path = require('path');
const http = require('http');

const PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
function bufferPng() { return Buffer.from(PNG_BASE64, 'base64'); }

const UPLOAD_DIR = path.join(__dirname, 'uploads');

function request(method, urlPath, body, isForm) {
  return new Promise((resolve, reject) => {
    const url = new URL('http://localhost:3000' + urlPath);
    const headers = {};
    if (isForm) {
      const boundary = '----TestBoundary' + Date.now();
      headers['Content-Type'] = 'multipart/form-data; boundary=' + boundary;
      const parts = [];
      Object.entries(body).forEach(([k, v]) => {
        if (v && v.filename) {
          parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${k}"; filename="${v.filename}"\r\nContent-Type: ${v.contentType || 'image/png'}\r\n\r\n`));
          parts.push(v.data);
          parts.push(Buffer.from('\r\n'));
        } else {
          parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`));
        }
      });
      parts.push(Buffer.from(`--${boundary}--\r\n`));
      body = Buffer.concat(parts);
      headers['Content-Length'] = body.length;
    } else {
      headers['Content-Type'] = 'application/json';
      if (body) body = Buffer.from(JSON.stringify(body));
      if (body) headers['Content-Length'] = body.length;
    }
    const req = http.request({ method, hostname: url.hostname, port: url.port, path: url.pathname + url.search, headers }, (res) => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf-8');
        let json = null;
        try { json = JSON.parse(text); } catch (e) {}
        resolve({ status: res.statusCode, body: json, text });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function uploadsCount() {
  if (!fs.existsSync(UPLOAD_DIR)) return 0;
  return fs.readdirSync(UPLOAD_DIR).filter(f => !fs.statSync(path.join(UPLOAD_DIR, f)).isDirectory()).length;
}

(async () => {
  console.log('Initial uploads count:', uploadsCount());

  console.log('\n=== CREATE 1st card (should succeed) ===');
  const r1 = await request('POST', '/api/cards', {
    card_name: 'A',
    card_no: 'A1',
    inner_no: 'INNER-001',
    score: '10',
    version: 'V1',
    img_front: { filename: 'a.png', data: bufferPng() },
    img_back: { filename: 'b.png', data: bufferPng() }
  }, true);
  console.log('Status:', r1.status, 'msg:', r1.body && r1.body.msg);
  console.log('Uploads count after create:', uploadsCount());
  const cardId = r1.body && r1.body.data && r1.body.data.id;

  console.log('\n=== DUPLICATE inner_no (should fail & cleanup files) ===');
  const beforeCount = uploadsCount();
  const r2 = await request('POST', '/api/cards', {
    card_name: 'B',
    card_no: 'B1',
    inner_no: 'INNER-001',
    score: '10',
    version: 'V1',
    img_front: { filename: 'c.png', data: bufferPng() },
    img_back: { filename: 'd.png', data: bufferPng() }
  }, true);
  console.log('Status:', r2.status, 'msg:', r2.body && r2.body.msg);
  console.log('Uploads count before dup:', beforeCount, 'after dup:', uploadsCount());
  console.log('Cleanup OK:', uploadsCount() === beforeCount);

  console.log('\n=== UPDATE card with new images ===');
  const beforeUpd = uploadsCount();
  const r3 = await request('PUT', '/api/cards/' + cardId, {
    card_name: 'A-updated',
    card_no: 'A1',
    inner_no: 'INNER-001',
    score: '9',
    version: 'V1-updated',
    img_front: { filename: 'e.png', data: bufferPng() },
    img_back: { filename: 'f.png', data: bufferPng() }
  }, true);
  console.log('Status:', r3.status, 'name:', r3.body.data && r3.body.data.card_name);
  console.log('Uploads count after update:', uploadsCount(), '(before:', beforeUpd + ')');

  console.log('\n=== DELETE card (should remove its files) ===');
  const beforeDel = uploadsCount();
  const r4 = await request('DELETE', '/api/cards/' + cardId);
  console.log('Status:', r4.status);
  console.log('Uploads count before delete:', beforeDel, 'after delete:', uploadsCount());

  console.log('\nFinal uploads count:', uploadsCount());
})().catch(e => { console.error(e); process.exit(1); });
