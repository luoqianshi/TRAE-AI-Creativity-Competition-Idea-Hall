const http = require('http');
const PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
function bufferPng() { return Buffer.from(PNG_BASE64, 'base64'); }

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
    } else if (body) {
      headers['Content-Type'] = 'application/json';
      body = Buffer.from(JSON.stringify(body));
      headers['Content-Length'] = body.length;
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

(async () => {
  console.log('=== HEALTH ===');
  const h = await request('GET', '/api/health');
  console.log('Status:', h.status, '|', h.text);

  const ts = Date.now();
  const innerNo = `AGC-LOCAL-${ts}`;

  console.log('\n=== CREATE CARD ===');
  const c = await request('POST', '/api/cards', {
    card_name: '本地模式测试',
    card_no: 'TEST-001',
    inner_no: innerNo,
    score: 'GEM MINT 10',
    version: 'Local Test',
    img_front: { filename: 'f.png', data: bufferPng() },
    img_back:  { filename: 'b.png', data: bufferPng() }
  }, true);
  console.log('Status:', c.status, '| id:', c.body.data && c.body.data.id);
  console.log('  img_front:', c.body.data && c.body.data.img_front);
  console.log('  img_back:', c.body.data && c.body.data.img_back);
  const cardId = c.body.data && c.body.data.id;

  console.log('\n=== UPDATE WITH NEW IMAGES ===');
  const u = await request('PUT', '/api/cards/' + cardId, {
    card_name: '本地模式测试-更新',
    card_no: 'TEST-001',
    inner_no: innerNo,
    score: '9',
    version: 'Local Test Updated',
    img_front: { filename: 'f2.png', data: bufferPng() },
    img_back:  { filename: 'b2.png', data: bufferPng() }
  }, true);
  console.log('Status:', u.status, '| img_front:', u.body.data && u.body.data.img_front);

  console.log('\n=== UPDATE BG ===');
  const ub = await request('POST', '/api/bg/home', {
    file: { filename: 'home.png', data: bufferPng() }
  }, true);
  console.log('Status:', ub.status, '| home_bg:', ub.body.data && ub.body.data.home_bg);

  console.log('\n=== DELETE BG ===');
  const dbg = await request('DELETE', '/api/bg/home');
  console.log('Status:', dbg.status, '| home_bg:', JSON.stringify(dbg.body.data && dbg.body.data.home_bg));

  console.log('\n=== DELETE CARD ===');
  const d = await request('DELETE', '/api/cards/' + cardId);
  console.log('Status:', d.status, '|', d.body && d.body.msg);

  console.log('\nDone.');
})().catch(e => { console.error(e); process.exit(1); });
