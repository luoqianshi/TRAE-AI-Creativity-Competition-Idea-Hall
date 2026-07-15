// index.js — HTTP static server + WebSocket realtime hub.
// Ties together the transcript store (monitoring) and the process manager
// (control), and pushes live updates to every connected phone / browser.

import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { Manager } from './lib/manager.js';
import { listSessions, readHistory, Tailer, findSessionFile } from './lib/store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function loadConfig() {
  const file = path.join(ROOT, 'config.json');
  const cfg = JSON.parse(fs.readFileSync(file, 'utf8'));
  cfg.port = Number(process.env.PORT || cfg.port || 4600);
  cfg.host = process.env.HOST || cfg.host || '0.0.0.0';
  return cfg;
}

const config = loadConfig();
const manager = new Manager(config);

const PUBLIC_DIR = path.join(ROOT, 'public');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(PUBLIC_DIR, path.normalize(urlPath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function suggestedDirs() {
  const home = os.homedir();
  const candidates = [
    home,
    path.join(home, 'Desktop'),
    path.join(home, 'Documents'),
    path.join(home, 'Projects'),
    path.join(home, 'code'),
  ];
  const dirs = [];
  for (const c of candidates) {
    try {
      if (fs.statSync(c).isDirectory()) dirs.push(c);
    } catch {
      /* skip */
    }
  }
  // Add distinct cwds from existing sessions.
  for (const s of listSessions()) {
    if (s.cwd && !dirs.includes(s.cwd)) dirs.push(s.cwd);
    if (dirs.length > 30) break;
  }
  return dirs;
}

// Access-key gate. When config.accessKey is set (recommended before exposing
// the service to the public internet via a tunnel), every control channel
// (WebSocket) and /api/* request must carry the matching key.
const ACCESS_KEY = (config.accessKey || '').trim();
function keyFromReq(req) {
  try {
    const u = new URL(req.url, 'http://x');
    return u.searchParams.get('key') || '';
  } catch {
    return '';
  }
}
function keyOk(req) {
  if (!ACCESS_KEY) return true; // no key configured => open (LAN mode)
  return keyFromReq(req) === ACCESS_KEY;
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url.startsWith('/api/')) {
    if (!keyOk(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'unauthorized' }));
      return;
    }
    if (url === '/api/config') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ defaultModel: config.defaultModel, defaultCwd: config.defaultCwd || os.homedir() }));
      return;
    }
    if (url === '/api/dirs') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ dirs: suggestedDirs() }));
      return;
    }
    res.writeHead(404).end('{}');
    return;
  }
  serveStatic(req, res);
});

// ---- WebSocket hub ---------------------------------------------------------
const wss = new WebSocketServer({ server, path: '/ws' });
const clients = new Set();

function broadcast(obj) {
  const data = JSON.stringify(obj);
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) ws.send(data);
  }
}

function sessionsWithStatus() {
  const live = manager.liveStatuses();
  return listSessions().map((s) => ({
    ...s,
    status: live[s.sessionId] || 'idle',
    live: !!live[s.sessionId],
  }));
}

// ---- Tailer registry (ref-counted per open session) ------------------------
const tailers = new Map(); // sessionId -> Tailer

function ensureTailer(sessionId) {
  let t = tailers.get(sessionId);
  if (!t) {
    t = new Tailer(sessionId, (msgs) => {
      for (const m of msgs) broadcast({ type: 'event', sessionId, message: m });
      // A new message means activity; refresh list ordering.
      scheduleListRefresh();
    });
    tailers.set(sessionId, t);
    t.start();
  }
  t.refs += 1;
  return t;
}

function releaseTailer(sessionId) {
  const t = tailers.get(sessionId);
  if (!t) return;
  t.refs -= 1;
  if (t.refs <= 0) {
    t.stop();
    tailers.delete(sessionId);
  }
}

// ---- Manager -> clients -----------------------------------------------------
manager.on('status', ({ sessionId, status, cwd, model }) => {
  broadcast({ type: 'status', sessionId, status, cwd, model });
  scheduleListRefresh();
});
manager.on('turn_complete', (info) => {
  broadcast({ type: 'turn_complete', ...info });
});
manager.on('log', (info) => {
  broadcast({ type: 'log', ...info });
});
manager.on('remap', ({ from, to }) => {
  broadcast({ type: 'remap', from, to });
});

// ---- Session list polling ---------------------------------------------------
let lastListJson = '';
let listRefreshTimer = null;
function scheduleListRefresh() {
  if (listRefreshTimer) return;
  listRefreshTimer = setTimeout(() => {
    listRefreshTimer = null;
    refreshList();
  }, 300);
}
function refreshList() {
  const sessions = sessionsWithStatus();
  const json = JSON.stringify(sessions);
  if (json !== lastListJson) {
    lastListJson = json;
    broadcast({ type: 'sessions', sessions });
  }
}
setInterval(refreshList, 2000);

wss.on('connection', (ws, req) => {
  if (!keyOk(req)) {
    try { ws.send(JSON.stringify({ type: 'unauthorized' })); } catch { /* ignore */ }
    ws.close(4001, 'unauthorized');
    return;
  }
  clients.add(ws);
  ws.subscriptions = new Set();
  ws.send(JSON.stringify({ type: 'sessions', sessions: sessionsWithStatus() }));

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    handleClientMessage(ws, msg);
  });

  ws.on('close', () => {
    clients.delete(ws);
    for (const id of ws.subscriptions) releaseTailer(id);
    ws.subscriptions.clear();
  });
});

function handleClientMessage(ws, msg) {
  switch (msg.type) {
    case 'list':
      ws.send(JSON.stringify({ type: 'sessions', sessions: sessionsWithStatus() }));
      break;

    case 'open': {
      const { sessionId } = msg;
      if (!sessionId) return;
      const { messages, cwd } = readHistory(sessionId);
      ws.send(JSON.stringify({ type: 'history', sessionId, messages, cwd, status: manager.status(sessionId) }));
      if (!ws.subscriptions.has(sessionId)) {
        ws.subscriptions.add(sessionId);
        ensureTailer(sessionId);
      }
      break;
    }

    case 'close': {
      const { sessionId } = msg;
      if (sessionId && ws.subscriptions.has(sessionId)) {
        ws.subscriptions.delete(sessionId);
        releaseTailer(sessionId);
      }
      break;
    }

    case 'send': {
      const { sessionId, text, model } = msg;
      if (!sessionId || !text || !text.trim()) return;
      const ok = manager.send(sessionId, text, { model });
      ws.send(JSON.stringify({ type: 'ack', sessionId, ok }));
      break;
    }

    case 'create': {
      const cwd = msg.cwd || config.defaultCwd || os.homedir();
      const text = (msg.text || '').trim();
      if (!text) {
        ws.send(JSON.stringify({ type: 'error', message: '首条消息不能为空' }));
        return;
      }
      const sessionId = manager.create({ cwd, text, model: msg.model });
      ws.send(JSON.stringify({ type: 'created', sessionId, cwd }));
      // Auto-subscribe the creator so it streams immediately.
      if (!ws.subscriptions.has(sessionId)) {
        ws.subscriptions.add(sessionId);
        ensureTailer(sessionId);
      }
      scheduleListRefresh();
      break;
    }

    case 'stop': {
      const { sessionId } = msg;
      manager.stop(sessionId);
      ws.send(JSON.stringify({ type: 'ack', sessionId, stopped: true }));
      break;
    }

    default:
      break;
  }
}

server.listen(config.port, config.host, () => {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) ips.push(net.address);
    }
  }
  console.log('');
  console.log('  Claude Mission Control 已启动');
  console.log('  ───────────────────────────────');
  console.log(`  本机:    http://localhost:${config.port}`);
  for (const ip of ips) console.log(`  手机/局域网: http://${ip}:${config.port}`);
  console.log('');
  console.log(`  模型: ${config.env?.ANTHROPIC_DEFAULT_OPUS_MODEL || config.defaultModel}`);
  if (ACCESS_KEY) {
    console.log(`  访问密钥: ${ACCESS_KEY}`);
    console.log(`  带密钥直达: http://localhost:${config.port}/?key=${ACCESS_KEY}`);
  } else {
    console.log('  ⚠ 未设置访问密钥（accessKey），公网暴露前请务必在 config.json 中设置');
  }
  console.log('  提示: 手机与电脑连同一 WiFi，用上面的局域网地址访问');
  console.log('');
});

process.on('SIGINT', () => {
  console.log('\n正在关闭...');
  manager.shutdown();
  process.exit(0);
});
process.on('SIGTERM', () => {
  manager.shutdown();
  process.exit(0);
});
