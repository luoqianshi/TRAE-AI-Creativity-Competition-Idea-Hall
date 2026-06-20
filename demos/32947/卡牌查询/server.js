const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const data = require('./data');
const storage = require('./db/storage');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 内存模式:不写磁盘,直接拿到 buffer 走 storage 上传到云端 / 本地
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (/^image\/(jpeg|png|webp|gif|jpg)$/i.test(file.mimetype)) cb(null, true);
    else cb(new Error('仅支持 JPG / PNG / WebP / GIF 格式图片'));
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  setHeaders: (res) => res.setHeader('Cache-Control', 'public, max-age=604800')
}));

app.get('/favicon.ico', (req, res) => {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.end(png);
});

app.use('/h5', express.static(path.join(__dirname, 'public', 'h5'), {
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
}));
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin'), {
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
}));
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
}));

function wrap(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
    storage: {
      backend: storage.getBackend(),
      mode: data.getStorageMode()
    }
  });
});

app.get('/api/config', wrap(async (req, res) => {
  const cfg = await data.getConfigAsync();
  res.json({ ok: true, data: cfg });
}));

app.get('/api/cards', wrap(async (req, res) => {
  const { inner_no, page = 1, pageSize = 10 } = req.query;
  let list = await data.getAllCardsAsync();
  if (inner_no && String(inner_no).trim()) {
    const kw = String(inner_no).trim();
    list = list.filter(c => (c.inner_no || '').includes(kw));
  }
  const total = list.length;
  const p = Math.max(1, parseInt(page, 10) || 1);
  const ps = Math.max(1, Math.min(100, parseInt(pageSize, 10) || 10));
  const start = (p - 1) * ps;
  const items = list.slice(start, start + ps);
  res.json({ ok: true, data: { items, total, page: p, pageSize: ps } });
}));

app.get('/api/cards/:id', wrap(async (req, res) => {
  const card = await data.getCardByIdAsync(req.params.id);
  if (!card) return res.status(404).json({ ok: false, msg: '卡牌不存在' });
  res.json({ ok: true, data: card });
}));

app.get('/api/query', wrap(async (req, res) => {
  const { inner_no } = req.query;
  if (!inner_no || !String(inner_no).trim()) {
    return res.status(400).json({ ok: false, msg: '请填写有效的内部编号' });
  }
  const kw = String(inner_no).trim();
  const card = await data.queryByInnerNoAsync(kw);
  if (!card) {
    return res.status(404).json({ ok: false, msg: '未查询到该编号卡牌信息,请核对编号' });
  }
  res.json({ ok: true, data: card });
}));

app.post('/api/cards', upload.fields([
  { name: 'img_front', maxCount: 1 },
  { name: 'img_back', maxCount: 1 }
]), wrap(async (req, res) => {
  const { card_name, card_no, inner_no, score, version } = req.body;
  const frontFile = req.files && req.files.img_front && req.files.img_front[0];
  const backFile = req.files && req.files.img_back && req.files.img_back[0];

  if (!card_name || !card_no || !inner_no || !score || !version) {
    return res.status(400).json({ ok: false, msg: '请填写所有必填项' });
  }
  if (!frontFile) return res.status(400).json({ ok: false, msg: '请上传卡牌正面图片' });
  if (!backFile) return res.status(400).json({ ok: false, msg: '请上传卡牌背面图片' });

  let img_front, img_back;
  try {
    const r1 = await storage.uploadBuffer(frontFile.buffer, frontFile.originalname, frontFile.mimetype);
    const r2 = await storage.uploadBuffer(backFile.buffer, backFile.originalname, backFile.mimetype);
    img_front = r1.url;
    img_back = r2.url;
  } catch (e) {
    console.error('Upload failed:', e);
    return res.status(500).json({ ok: false, msg: '文件上传失败: ' + e.message });
  }

  try {
    const card = await data.addCardAsync({ card_name, card_no, inner_no, score, version, img_front, img_back });
    res.json({ ok: true, data: card, msg: '录入成功' });
  } catch (err) {
    // 入库失败,清理已上传的文件
    await storage.deleteByUrl(img_front);
    await storage.deleteByUrl(img_back);
    if (err.code === 'DUP_INNER_NO') return res.status(400).json({ ok: false, msg: err.message });
    console.error(err);
    res.status(500).json({ ok: false, msg: '服务器错误' });
  }
}));

app.put('/api/cards/:id', upload.fields([
  { name: 'img_front', maxCount: 1 },
  { name: 'img_back', maxCount: 1 }
]), wrap(async (req, res) => {
  const exist = await data.getCardByIdAsync(req.params.id);
  if (!exist) return res.status(404).json({ ok: false, msg: '卡牌不存在' });
  const { card_name, card_no, inner_no, score, version } = req.body;
  if (!card_name || !card_no || !inner_no || !score || !version) {
    return res.status(400).json({ ok: false, msg: '请填写所有必填项' });
  }

  const frontFile = req.files && req.files.img_front && req.files.img_front[0];
  const backFile = req.files && req.files.img_back && req.files.img_back[0];

  let img_front = exist.img_front;
  let img_back = exist.img_back;
  const uploaded = [];
  try {
    if (frontFile) {
      const r = await storage.uploadBuffer(frontFile.buffer, frontFile.originalname, frontFile.mimetype);
      img_front = r.url;
      uploaded.push(exist.img_front);
    }
    if (backFile) {
      const r = await storage.uploadBuffer(backFile.buffer, backFile.originalname, backFile.mimetype);
      img_back = r.url;
      uploaded.push(exist.img_back);
    }
  } catch (e) {
    console.error('Upload failed:', e);
    return res.status(500).json({ ok: false, msg: '文件上传失败: ' + e.message });
  }

  try {
    const card = await data.updateCardAsync(req.params.id, {
      card_name, card_no, inner_no, score, version, img_front, img_back
    });
    // 新图上传成功后再删旧图
    for (const old of uploaded) await storage.deleteByUrl(old);
    res.json({ ok: true, data: card, msg: '更新成功' });
  } catch (err) {
    if (img_front !== exist.img_front) await storage.deleteByUrl(img_front);
    if (img_back !== exist.img_back) await storage.deleteByUrl(img_back);
    if (err.code === 'DUP_INNER_NO') return res.status(400).json({ ok: false, msg: err.message });
    if (err.code === 'NOT_FOUND') return res.status(404).json({ ok: false, msg: err.message });
    console.error(err);
    res.status(500).json({ ok: false, msg: '服务器错误' });
  }
}));

app.delete('/api/cards/:id', wrap(async (req, res) => {
  const removed = await data.deleteCardAsync(req.params.id);
  if (!removed) return res.status(404).json({ ok: false, msg: '卡牌不存在' });
  if (removed.img_front) await storage.deleteByUrl(removed.img_front);
  if (removed.img_back) await storage.deleteByUrl(removed.img_back);
  res.json({ ok: true, msg: '删除成功' });
}));

app.post('/api/upload', upload.single('file'), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, msg: '请上传文件' });
  const r = await storage.uploadBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
  res.json({ ok: true, data: { url: r.url } });
}));

app.post('/api/bg/home', upload.single('file'), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, msg: '请上传文件' });
  const r = await storage.uploadBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
  const cfg = await data.getConfigAsync();
  if (cfg.home_bg) await storage.deleteByUrl(cfg.home_bg);
  const next = await data.setConfigAsync({ home_bg: r.url });
  res.json({ ok: true, data: next, msg: '首页背景已更新' });
}));

app.post('/api/bg/detail', upload.single('file'), wrap(async (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, msg: '请上传文件' });
  const r = await storage.uploadBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
  const cfg = await data.getConfigAsync();
  if (cfg.detail_bg) await storage.deleteByUrl(cfg.detail_bg);
  const next = await data.setConfigAsync({ detail_bg: r.url });
  res.json({ ok: true, data: next, msg: '详情页背景已更新' });
}));

app.delete('/api/bg/home', wrap(async (req, res) => {
  const cfg = await data.getConfigAsync();
  if (cfg.home_bg) await storage.deleteByUrl(cfg.home_bg);
  const next = await data.setConfigAsync({ home_bg: '' });
  res.json({ ok: true, data: next, msg: '已删除首页背景' });
}));

app.delete('/api/bg/detail', wrap(async (req, res) => {
  const cfg = await data.getConfigAsync();
  if (cfg.detail_bg) await storage.deleteByUrl(cfg.detail_bg);
  const next = await data.setConfigAsync({ detail_bg: '' });
  res.json({ ok: true, data: next, msg: '已删除详情页背景' });
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, msg: err.message || '服务器错误' });
});

app.listen(PORT, () => {
  data.ensureDataFiles();
  const mode = data.getStorageMode();
  const obj = storage.getBackend();
  const tags = [];
  if (obj === 'aliyun-oss') tags.push('OSS:阿里云对象存储');
  else tags.push('OSS:本地磁盘 (uploads/)');
  if (mode === 'supabase') tags.push('DB:Supabase PostgreSQL');
  else tags.push('DB:本地 JSON 文件');
  console.log(`\n卡牌评级查询系统已启动`);
  console.log(`  ${tags.join('  ·  ')}`);
  console.log(`  C 端 H5:  http://localhost:${PORT}/h5/`);
  console.log(`  B 端后台: http://localhost:${PORT}/admin/`);
  console.log(`  API 根:   http://localhost:${PORT}/api/health\n`);
});
