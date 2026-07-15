const express = require('express');
const helmet = require('helmet');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname));

const defaultDatabase = {
  users: {},
  admins: {},
  studentData: {},
  adminData: {}
};

async function ensureDatabase() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(defaultDatabase, null, 2), 'utf8');
  }
}

async function readDatabase() {
  await ensureDatabase();
  const raw = await fs.readFile(DB_FILE, 'utf8');
  return { ...defaultDatabase, ...JSON.parse(raw || '{}') };
}

async function writeDatabase(db) {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, record) {
  if (!record?.salt || !record?.hash) return false;
  const { hash } = hashPassword(password, record.salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(record.hash, 'hex'));
}

function signToken(payload) {
  const secret = process.env.SESSION_SECRET || 'study-app-local-secret';
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [body, signature] = token.split('.');
  const secret = process.env.SESSION_SECRET || 'study-app-local-secret';
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (signature !== expected) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: '未登录或登录已失效' });
  req.user = payload;
  next();
}

function accountStore(role, db) {
  return role === 'admin' ? db.admins : db.users;
}

function dataStore(role, db) {
  return role === 'admin' ? db.adminData : db.studentData;
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: '智慧学习后端运行正常' });
});

app.post('/api/auth/register', async (req, res) => {
  const { role = 'student', name, account, password } = req.body || {};
  if (!['student', 'admin'].includes(role)) return res.status(400).json({ error: '身份类型不正确' });
  if (!name || !account || !password) return res.status(400).json({ error: '请填写完整注册信息' });
  if (String(account).length < 3) return res.status(400).json({ error: '账号至少 3 位' });
  if (String(password).length < 6) return res.status(400).json({ error: '密码至少 6 位' });

  const db = await readDatabase();
  const store = accountStore(role, db);
  if (store[account]) return res.status(409).json({ error: '该账号已存在' });

  store[account] = {
    name,
    account,
    role,
    ...hashPassword(password),
    createdAt: new Date().toISOString()
  };
  dataStore(role, db)[account] = req.body.initialData || null;
  await writeDatabase(db);

  const token = signToken({ account, role, name });
  res.json({ ok: true, token, account, role, name });
});

app.post('/api/auth/login', async (req, res) => {
  const { role = 'student', account, password } = req.body || {};
  if (!['student', 'admin'].includes(role)) return res.status(400).json({ error: '身份类型不正确' });
  if (!account || !password) return res.status(400).json({ error: '请输入账号和密码' });

  const db = await readDatabase();
  const user = accountStore(role, db)[account];
  if (!user || !verifyPassword(password, user)) return res.status(401).json({ error: '账号或密码错误' });

  const token = signToken({ account, role, name: user.name });
  res.json({
    ok: true,
    token,
    account,
    role,
    name: user.name,
    data: dataStore(role, db)[account] || null
  });
});

app.get('/api/data/:role/:account', requireAuth, async (req, res) => {
  const { role, account } = req.params;
  if (req.user.role !== role || req.user.account !== account) return res.status(403).json({ error: '无权访问该数据' });
  const db = await readDatabase();
  res.json({ ok: true, data: dataStore(role, db)[account] || null });
});

app.post('/api/data/:role/:account', requireAuth, async (req, res) => {
  const { role, account } = req.params;
  if (req.user.role !== role || req.user.account !== account) return res.status(403).json({ error: '无权保存该数据' });
  const db = await readDatabase();
  dataStore(role, db)[account] = req.body?.data || null;
  await writeDatabase(db);
  res.json({ ok: true });
});

app.post('/api/ai/chat', async (req, res) => {
  const {
    baseUrl = 'https://api.openai.com/v1',
    apiKey,
    model = 'gpt-4o-mini',
    temperature = 0.7,
    maxTokens = 800,
    messages = []
  } = req.body || {};

  if (!apiKey) return res.status(400).json({ error: '请先填写 API Key' });
  if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: 'messages 不能为空' });

  const endpoint = `${String(baseUrl).replace(/\/$/, '')}/chat/completions`;
  try {
    const aiRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: Number(temperature),
        max_tokens: Number(maxTokens)
      })
    });
    const data = await aiRes.json();
    if (!aiRes.ok) {
      return res.status(aiRes.status).json({ error: data.error?.message || 'AI API 调用失败', detail: data });
    }
    res.json({
      ok: true,
      content: data.choices?.[0]?.message?.content || '',
      raw: data
    });
  } catch (err) {
    res.status(500).json({ error: 'AI API 请求失败，请检查 Base URL 或网络', detail: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

ensureDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`智慧学习服务已启动：http://localhost:${PORT}`);
  });
});
