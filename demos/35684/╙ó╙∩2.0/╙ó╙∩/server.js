const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 简单的SQLite数据库（使用文件存储）
const DB_FILE = './database.json';

// 数据库初始化
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      levels: [
        {
          id: 1,
          name: "基础词汇",
          description: "物联网基础英语词汇",
          timeLimit: 480, // 8分钟
          words: [
            { english: "Internet of Things", chinese: "物联网" },
            { english: "Sensor", chinese: "传感器" },
            { english: "Microcontroller", chinese: "微控制器" },
            { english: "Network", chinese: "网络" },
            { english: "Data", chinese: "数据" },
            { english: "Cloud Computing", chinese: "云计算" },
            { english: "Smart Device", chinese: "智能设备" },
            { english: "Automation", chinese: "自动化" },
            { english: "Wireless", chinese: "无线的" },
            { english: "Protocol", chinese: "协议" },
            { english: "Embedded", chinese: "嵌入式" },
            { english: "Gateway", chinese: "网关" }
          ],
          createdAt: Date.now()
        }
      ],
      scores: [],
      adminIPs: ["127.0.0.1", "localhost"],
      passwords: {
        admin: "welding2025",
        user: "user123"
      },
      sessions: [],
      settings: {
        leaderboardUpdateInterval: 60000, // 1分钟
        gameTimeLimit: 480 // 8分钟
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

// 生成会话token
function generateToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 创建会话
function createSession(isAdmin, ip) {
  const token = generateToken();
  const session = {
    token: token,
    isAdmin: isAdmin,
    ip: ip,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24小时过期
  };
  
  const db = readDB();
  db.sessions.push(session);
  writeDB(db);
  
  return token;
}

// 验证会话
function validateSession(token) {
  const db = readDB();
  const session = db.sessions.find(s => s.token === token);
  
  if (!session) {
    return null;
  }
  
  // 检查是否过期
  if (session.expiresAt < Date.now()) {
    db.sessions = db.sessions.filter(s => s.token !== token);
    writeDB(db);
    return null;
  }
  
  // 更新过期时间
  session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  writeDB(db);
  
  return session;
}

// 删除会话
function deleteSession(token) {
  const db = readDB();
  db.sessions = db.sessions.filter(s => s.token !== token);
  writeDB(db);
}

// 读取数据库
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    initDB();
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  }
}

// 写入数据库
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// 获取客户端IP（支持内网穿透）
function getClientIP(req) {
  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-forwarded',
    'x-cluster-client-ip',
    'forwarded-for',
    'forwarded',
    'x-appengine-user-ip'
  ];

  for (const header of ipHeaders) {
    const ip = req.headers[header];
    if (ip) {
      const ipList = ip.split(',');
      const realIP = ipList[0].trim();
      if (realIP && isValidIP(realIP)) {
        return realIP;
      }
    }
  }

  const remoteAddress = req.socket.remoteAddress || req.connection.remoteAddress;
  if (remoteAddress) {
    return formatIP(remoteAddress);
  }
  
  return 'unknown';
}

// 验证IP地址有效性
function isValidIP(ip) {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

// 格式化IP地址（处理IPv6格式）
function formatIP(ip) {
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  if (ip === '::1') {
    return '127.0.0.1';
  }
  return ip;
}

// MIME类型
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// 处理API请求
function handleAPI(req, res, pathname, query) {
  const clientIP = getClientIP(req);
  const db = readDB();
  
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // API路由
  if (pathname === '/api/levels' && req.method === 'GET') {
    // 获取所有关卡
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.levels));
    return;
  }
  
  // 获取单个关卡
  const levelMatch = pathname.match(/^\/api\/levels\/(\d+)$/);
  if (levelMatch && req.method === 'GET') {
    const levelId = parseInt(levelMatch[1]);
    const level = db.levels.find(l => l.id === levelId);
    if (level) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(level));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '关卡不存在' }));
    }
    return;
  }
  
  if (pathname === '/api/levels' && req.method === 'POST') {
    // 管理员添加关卡（支持IP和会话两种方式）
    const sessionToken = req.headers['x-session-token'];
    let session = null;
    if (sessionToken) {
      session = validateSession(sessionToken);
    }
    
    const isAdminByIP = db.adminIPs.includes(clientIP) || clientIP === '::1' || clientIP === '::ffff:127.0.0.1';
    const isAdminBySession = session ? session.isAdmin : false;
    
    if (!isAdminByIP && !isAdminBySession) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '需要管理员权限' }));
      return;
    }
    
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const level = JSON.parse(body);
        level.id = Date.now();
        level.createdAt = Date.now();
        if (!level.timeLimit) level.timeLimit = 480;
        db.levels.push(level);
        writeDB(db);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, level }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '添加失败' }));
      }
    });
    return;
  }
  
  if (pathname === '/api/scores' && req.method === 'GET') {
    const levelId = query.levelId;
    const type = query.type || 'all';
    
    let scores = db.scores;
    
    if (levelId) {
      scores = scores.filter(s => s.levelId === parseInt(levelId));
    }
    
    scores.sort((a, b) => b.score - a.score);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(scores.slice(0, 100)));
    return;
  }
  
  if (pathname === '/api/scores/total' && req.method === 'GET') {
    // 总排行榜 - 按用户统计所有关卡分数总和
    const scoreMap = {};
    
    db.scores.forEach(score => {
      if (!scoreMap[score.username]) {
        scoreMap[score.username] = {
          username: score.username,
          totalScore: 0,
          levelCount: 0,
          maxScore: 0,
          latestTime: score.completedAt,
          latestTimeStr: score.time
        };
      }
      scoreMap[score.username].totalScore += score.score;
      scoreMap[score.username].levelCount++;
      if (score.score > scoreMap[score.username].maxScore) {
        scoreMap[score.username].maxScore = score.score;
      }
      if (score.completedAt > scoreMap[score.username].latestTime) {
        scoreMap[score.username].latestTime = score.completedAt;
        scoreMap[score.username].latestTimeStr = score.time;
      }
    });
    
    const totalScores = Object.values(scoreMap).sort((a, b) => b.totalScore - a.totalScore);
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(totalScores.slice(0, 100)));
    return;
  }
  
  if (pathname === '/api/scores' && req.method === 'POST') {
    // 提交分数
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const scoreData = JSON.parse(body);
        // 使用中国时区格式化时间
        const beijingTime = new Date();
        const timeString = beijingTime.toLocaleString('zh-CN', { 
          timeZone: 'Asia/Shanghai',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        
        const newScore = {
          id: Date.now(),
          username: scoreData.username || '匿名用户',
          score: scoreData.score,
          levelId: scoreData.levelId,
          levelName: scoreData.levelName,
          ip: clientIP,
          time: timeString,
          completedAt: Date.now()
        };
        db.scores.push(newScore);
        writeDB(db);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, score: newScore }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '提交失败' }));
      }
    });
    return;
  }
  
  if (pathname === '/api/admin/scores' && req.method === 'GET') {
    // 管理员查看所有分数和IP
    if (!db.adminIPs.includes(clientIP) && clientIP !== '::1' && clientIP !== '::ffff:127.0.0.1') {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '需要管理员权限' }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.scores));
    return;
  }
  
  if (pathname === '/api/admin/ip' && req.method === 'GET') {
    // 获取当前IP
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ip: clientIP }));
    return;
  }
  
  if (pathname === '/api/admin/add-ip' && req.method === 'POST') {
    // 添加管理员IP
    if (!db.adminIPs.includes(clientIP) && clientIP !== '::1' && clientIP !== '::ffff:127.0.0.1') {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '需要管理员权限' }));
      return;
    }
    
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { ip } = JSON.parse(body);
        if (!db.adminIPs.includes(ip)) {
          db.adminIPs.push(ip);
          writeDB(db);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, adminIPs: db.adminIPs }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '操作失败' }));
      }
    });
    return;
  }
  
  if (pathname === '/api/admin/levels' && req.method === 'DELETE') {
    // 删除关卡（支持IP和会话两种方式）
    const sessionToken = req.headers['x-session-token'];
    let session = null;
    if (sessionToken) {
      session = validateSession(sessionToken);
    }
    
    const isAdminByIP = db.adminIPs.includes(clientIP) || clientIP === '::1' || clientIP === '::ffff:127.0.0.1';
    const isAdminBySession = session ? session.isAdmin : false;
    
    console.log('Delete level request - sessionToken:', sessionToken ? 'exists' : 'null');
    console.log('Delete level request - session:', session ? JSON.stringify(session) : 'null');
    console.log('Delete level request - isAdminByIP:', isAdminByIP);
    console.log('Delete level request - isAdminBySession:', isAdminBySession);
    
    if (!isAdminByIP && !isAdminBySession) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '需要管理员权限', debug: { hasToken: !!sessionToken, sessionValid: !!session, isAdminByIP, isAdminBySession } }));
      return;
    }
    
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { levelId } = JSON.parse(body);
        db.levels = db.levels.filter(l => l.id !== levelId);
        writeDB(db);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '删除失败' }));
      }
    });
    return;
  }
  
  if (pathname === '/api/check-admin' && req.method === 'GET') {
    // 检查是否为管理员（支持IP和会话两种方式）
    const sessionToken = req.headers['x-session-token'];
    let session = null;
    if (sessionToken) {
      session = validateSession(sessionToken);
    }
    
    const isAdminByIP = db.adminIPs.includes(clientIP) || clientIP === '::1' || clientIP === '::ffff:127.0.0.1';
    const isAdminBySession = session ? session.isAdmin : false;
    const isAdmin = isAdminByIP || isAdminBySession;
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ isAdmin, ip: clientIP, authenticated: !!session }));
    return;
  }
  
  if (pathname === '/api/login' && req.method === 'POST') {
    // 登录API
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        console.log('Login request body:', body);
        
        let parsedBody;
        // 尝试解析JSON
        if (!body || body.trim() === '') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '请求体不能为空' }));
          return;
        }
        
        try {
          parsedBody = JSON.parse(body);
        } catch (parseError) {
          // 如果JSON解析失败，尝试解析表单格式
          const params = new URLSearchParams(body);
          parsedBody = {
            username: params.get('username'),
            password: params.get('password')
          };
        }
        
        const { username, password } = parsedBody;
        
        if (!username || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '请输入用户名和密码' }));
          return;
        }
        
        // 验证管理员登录
        if (username === 'welding' && password === db.passwords.admin) {
          const token = createSession(true, clientIP);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, token, isAdmin: true, message: '管理员登录成功' }));
          return;
        }
        
        // 验证用户登录
        if (username === 'user' && password === db.passwords.user) {
          const token = createSession(false, clientIP);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, token, isAdmin: false, message: '用户登录成功' }));
          return;
        }
        
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '用户名或密码错误' }));
        
      } catch (error) {
        console.error('Login error:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '请求格式错误: ' + error.message }));
      }
    });
    return;
  }
  
  if (pathname === '/api/logout' && req.method === 'POST') {
    // 登出API
    const sessionToken = req.headers['x-session-token'];
    if (sessionToken) {
      deleteSession(sessionToken);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: '登出成功' }));
    return;
  }
  
  if (pathname === '/api/validate-session' && req.method === 'GET') {
    // 验证会话
    const sessionToken = req.headers['x-session-token'];
    if (!sessionToken) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ valid: false, error: '未登录' }));
      return;
    }
    
    const session = validateSession(sessionToken);
    if (session) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ valid: true, isAdmin: session.isAdmin, ip: session.ip }));
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ valid: false, error: '会话已过期或无效' }));
    }
    return;
  }
  
  if (pathname === '/api/admin/scores' && req.method === 'GET') {
    // 管理员查看所有分数和IP（支持密码登录）
    const sessionToken = req.headers['x-session-token'];
    let session = null;
    if (sessionToken) {
      session = validateSession(sessionToken);
    }
    
    const isAdminByIP = db.adminIPs.includes(clientIP) || clientIP === '::1' || clientIP === '::ffff:127.0.0.1';
    const isAdminBySession = session ? session.isAdmin : false;
    
    if (!isAdminByIP && !isAdminBySession) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '需要管理员权限' }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.scores));
    return;
  }
  
  if (pathname === '/api/admin/add-ip' && req.method === 'POST') {
    // 添加管理员IP（支持密码登录）
    const sessionToken = req.headers['x-session-token'];
    let session = null;
    if (sessionToken) {
      session = validateSession(sessionToken);
    }
    
    const isAdminByIP = db.adminIPs.includes(clientIP) || clientIP === '::1' || clientIP === '::ffff:127.0.0.1';
    const isAdminBySession = session ? session.isAdmin : false;
    
    if (!isAdminByIP && !isAdminBySession) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '需要管理员权限' }));
      return;
    }
    
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { ip } = JSON.parse(body);
        if (!db.adminIPs.includes(ip)) {
          db.adminIPs.push(ip);
          writeDB(db);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, adminIPs: db.adminIPs }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '操作失败' }));
      }
    });
    return;
  }
  
  if (pathname === '/api/admin/levels' && req.method === 'DELETE') {
    // 删除关卡（支持密码登录）
    const sessionToken = req.headers['x-session-token'];
    let session = null;
    if (sessionToken) {
      session = validateSession(sessionToken);
    }
    
    const isAdminByIP = db.adminIPs.includes(clientIP) || clientIP === '::1' || clientIP === '::ffff:127.0.0.1';
    const isAdminBySession = session ? session.isAdmin : false;
    
    if (!isAdminByIP && !isAdminBySession) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '需要管理员权限' }));
      return;
    }
    
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { levelId } = JSON.parse(body);
        db.levels = db.levels.filter(l => l.id !== levelId);
        writeDB(db);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '删除失败' }));
      }
    });
    return;
  }
  
  if (pathname === '/api/levels' && req.method === 'POST') {
    // 管理员添加关卡（支持密码登录）
    const sessionToken = req.headers['x-session-token'];
    let session = null;
    if (sessionToken) {
      session = validateSession(sessionToken);
    }
    
    const isAdminByIP = db.adminIPs.includes(clientIP) || clientIP === '::1' || clientIP === '::ffff:127.0.0.1';
    const isAdminBySession = session ? session.isAdmin : false;
    
    if (!isAdminByIP && !isAdminBySession) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '需要管理员权限' }));
      return;
    }
    
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const level = JSON.parse(body);
        level.id = Date.now();
        level.createdAt = Date.now();
        if (!level.timeLimit) level.timeLimit = 480;
        db.levels.push(level);
        writeDB(db);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, level }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '添加失败' }));
      }
    });
    return;
  }
  
  // 默认返回404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'API不存在' }));
}

// 创建HTTP服务器
const PORT = 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  
  // 处理API请求
  if (pathname.startsWith('/api/')) {
    handleAPI(req, res, pathname, query);
    return;
  }
  
  // 处理静态文件
  let filePath = '.' + pathname;
  if (filePath === './') {
    filePath = './index.html';
  }
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 - 文件未找到</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('服务器错误: ' + error.code, 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// 获取本地IP
function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// 初始化数据库
initDB();

server.listen(PORT, '0.0.0.0', () => {
  console.log('========================================');
  console.log('🚀 词汇配对游戏服务器已启动！');
  console.log('📡 本地访问地址: http://localhost:' + PORT);
  console.log('🏠 局域网访问地址: http://' + getLocalIP() + ':' + PORT);
  console.log('📂 服务器目录: ' + __dirname);
  console.log('========================================');
  console.log('按 Ctrl+C 停止服务器');
  console.log('');
});
