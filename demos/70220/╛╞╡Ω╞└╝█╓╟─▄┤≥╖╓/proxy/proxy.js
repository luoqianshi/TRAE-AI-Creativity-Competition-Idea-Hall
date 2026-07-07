/**
 * 酒店评价智能分析评分系统 - 本地代理服务
 * 零依赖：仅使用 Node.js 内置模块
 * 功能：
 *   1. 转发 AI 大模型 API 请求（解决浏览器 CORS 限制）
 *   2. 读写本地 JSON 数据文件（持久化）
 *   3. 读取/保存代理配置
 *   4. 托管前端静态资源（HTML/CSS/JS/图片）
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// ==================== 基础配置 ====================
const ROOT_DIR = path.join(__dirname, '..');
const CONFIG_FILE = path.join(__dirname, 'proxy-config.json');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');

// 静态资源 MIME 类型映射
const MIME_MAP = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.map': 'application/json',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.csv': 'text/csv; charset=utf-8'
};

// ==================== 工具函数 ====================

// 读取配置文件
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
        }
    } catch (e) {
        console.error('[配置读取失败]', e.message);
    }
    return { port: 3000, models: [], data_dir: '../data' };
}

// 保存配置文件
function saveConfig(cfg) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
}

// 确保数据目录存在
function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

// 读取评价数据
function loadReviews() {
    try {
        if (fs.existsSync(REVIEWS_FILE)) {
            return JSON.parse(fs.readFileSync(REVIEWS_FILE, 'utf-8'));
        }
    } catch (e) {
        console.error('[数据读取失败]', e.message);
    }
    return [];
}

// 保存评价数据
function saveReviews(data) {
    ensureDataDir();
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// 跨域响应头
function setCORS(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// 统一 JSON 响应
function sendJson(res, statusCode, data) {
    setCORS(res);
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
}

// 读取请求体
function readBody(req) {
    return new Promise((resolve) => {
        let chunks = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
            try {
                const raw = Buffer.concat(chunks).toString('utf-8');
                resolve(raw ? JSON.parse(raw) : {});
            } catch (e) {
                resolve({});
            }
        });
    });
}

// 调用大模型 API（OpenAI 兼容协议）
function callLLM(modelCfg, messages, maxTokens, temperature) {
    return new Promise((resolve, reject) => {
        const apiURL = new URL(modelCfg.api_url);
        const postData = JSON.stringify({
            model: modelCfg.model,
            messages: messages,
            max_tokens: maxTokens || modelCfg.max_tokens || 2048,
            temperature: temperature !== undefined ? temperature : (modelCfg.temperature !== undefined ? modelCfg.temperature : 0.1),
            stream: false
        });

        const options = {
            hostname: apiURL.hostname,
            port: apiURL.port || 443,
            path: apiURL.pathname + apiURL.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${modelCfg.api_key}`,
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: (modelCfg.timeout || 30) * 1000
        };

        const req = https.request(options, (resp) => {
            let data = '';
            resp.on('data', (c) => data += c);
            resp.on('end', () => {
                if (resp.statusCode !== 200) {
                    reject(new Error(`API 返回状态码 ${resp.statusCode}: ${data.slice(0, 500)}`));
                    return;
                }
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (e) {
                    reject(new Error('API 返回内容解析失败: ' + data.slice(0, 200)));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.on('timeout', () => { req.destroy(); reject(new Error('请求超时')); });
        req.write(postData);
        req.end();
    });
}

// 从 AI 返回内容中提取 JSON
function extractJSON(text) {
    if (!text) return null;
    // 去除 ```json ``` 包裹
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    // 尝试找到第一个 { 和最后一个 }
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
        const jsonStr = cleaned.substring(start, end + 1);
        try {
            return JSON.parse(jsonStr);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// ==================== 静态文件服务 ====================
function serveStatic(req, res, pathname) {
    // 安全：禁止路径穿越
    const safePath = pathname.replace(/\.\./g, '').replace(/^\/+/, '');
    let filePath = path.join(ROOT_DIR, safePath);

    // 默认 index.html
    if (pathname === '/' || pathname === '') {
        filePath = path.join(ROOT_DIR, 'index.html');
    } else if (pathname === '/favicon.ico') {
        filePath = path.join(ROOT_DIR, 'favicon.ico');
    }

    fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
            // 兜底回退到 index.html（避免刷新 404）
            const fallback = path.join(ROOT_DIR, 'index.html');
            if (fs.existsSync(fallback) && pathname !== '/' && pathname !== '/index.html') {
                fs.readFile(fallback, (e, c) => {
                    if (e) { sendJson(res, 404, { error: 'Not Found' }); return; }
                    setCORS(res);
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(c);
                });
                return;
            }
            sendJson(res, 404, { error: 'Not Found', path: pathname });
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const mime = MIME_MAP[ext] || 'application/octet-stream';
        fs.readFile(filePath, (e, content) => {
            if (e) { sendJson(res, 500, { error: e.message }); return; }
            setCORS(res);
            res.writeHead(200, { 'Content-Type': mime });
            res.end(content);
        });
    });
}

// ==================== API 路由处理 ====================
async function handleApi(req, res, pathname, body) {
    // ----- 评价分析 -----
    if (pathname === '/api/analyze' && req.method === 'POST') {
        try {
            const { model_key, system_prompt, user_prompt, review_content } = body;
            const cfg = loadConfig();
            const model = (cfg.models || []).find(m => m.key === model_key && m.enabled);
            if (!model) {
                sendJson(res, 400, { success: false, message: `未找到启用的模型: ${model_key}` });
                return;
            }
            if (!model.api_key || model.api_key.indexOf('在此填入') === 0) {
                sendJson(res, 400, { success: false, message: '模型 API Key 未配置，请编辑 proxy/proxy-config.json 填入有效 Key' });
                return;
            }

            // 拼接 user prompt
            const finalUserPrompt = (user_prompt || '').replace(/\{\{review_content\}\}/g, review_content || '');

            const messages = [
                { role: 'system', content: system_prompt || '你是酒店服务质量评估专家。' },
                { role: 'user', content: finalUserPrompt }
            ];

            const startTime = Date.now();
            const aiResp = await callLLM(model, messages);
            const elapsed = Date.now() - startTime;

            const content = aiResp.choices && aiResp.choices[0] && aiResp.choices[0].message
                ? aiResp.choices[0].message.content : '';
            const parsed = extractJSON(content);

            sendJson(res, 200, {
                success: true,
                data: {
                    raw: content,
                    parsed: parsed,
                    usage: aiResp.usage || null,
                    model: model.name,
                    elapsed_ms: elapsed
                }
            });
        } catch (e) {
            sendJson(res, 200, { success: false, message: e.message });
        }
        return;
    }

    // ----- 测试连接 -----
    if (pathname === '/api/test-connection' && req.method === 'POST') {
        try {
            const { model_key } = body;
            const cfg = loadConfig();
            const model = (cfg.models || []).find(m => m.key === model_key);
            if (!model) {
                sendJson(res, 400, { success: false, message: '未找到该模型配置' });
                return;
            }
            if (!model.api_key || model.api_key.indexOf('在此填入') === 0) {
                sendJson(res, 400, { success: false, message: 'API Key 未配置' });
                return;
            }
            const messages = [
                { role: 'system', content: '你是测试助手。' },
                { role: 'user', content: '请回复：连接测试成功' }
            ];
            await callLLM(model, messages, 50, 0);
            sendJson(res, 200, { success: true, message: '连接成功' });
        } catch (e) {
            sendJson(res, 200, { success: false, message: e.message });
        }
        return;
    }

    // ----- 配置读取 -----
    if (pathname === '/api/config/load' && req.method === 'GET') {
        const cfg = loadConfig();
        // 不返回 API Key 给前端
        const safeModels = (cfg.models || []).map(m => ({
            key: m.key,
            name: m.name,
            api_url: m.api_url,
            model: m.model,
            max_tokens: m.max_tokens,
            temperature: m.temperature,
            timeout: m.timeout,
            enabled: m.enabled,
            has_api_key: !!(m.api_key && m.api_key.indexOf('在此填入') !== 0),
            remark: m.remark || ''
        }));
        sendJson(res, 200, { success: true, data: { port: cfg.port, models: safeModels } });
        return;
    }

    // ----- 配置保存（从前端来的，只更新非敏感字段，保留原 API Key） -----
    if (pathname === '/api/config/save' && req.method === 'POST') {
        try {
            const cfg = loadConfig();
            const newModels = (body.models || []).map(m => {
                const existing = (cfg.models || []).find(o => o.key === m.key);
                return {
                    key: m.key,
                    name: m.name,
                    api_url: m.api_url,
                    api_key: m.api_key || (existing ? existing.api_key : ''),
                    model: m.model,
                    max_tokens: m.max_tokens || 2048,
                    temperature: m.temperature !== undefined ? m.temperature : 0.1,
                    timeout: m.timeout || 30,
                    enabled: !!m.enabled,
                    remark: m.remark || ''
                };
            });
            cfg.models = newModels;
            if (body.port) cfg.port = body.port;
            saveConfig(cfg);
            sendJson(res, 200, { success: true, message: '配置已保存' });
        } catch (e) {
            sendJson(res, 500, { success: false, message: e.message });
        }
        return;
    }

    // ----- 配置：设置单个模型的 API Key（避免前端明文传输全部 Key） -----
    if (pathname === '/api/config/set-key' && req.method === 'POST') {
        try {
            const { model_key, api_key } = body;
            const cfg = loadConfig();
            const model = (cfg.models || []).find(m => m.key === model_key);
            if (!model) {
                sendJson(res, 400, { success: false, message: '未找到该模型' });
                return;
            }
            model.api_key = api_key;
            saveConfig(cfg);
            sendJson(res, 200, { success: true, message: 'API Key 已保存' });
        } catch (e) {
            sendJson(res, 500, { success: false, message: e.message });
        }
        return;
    }

    // ----- 评价数据读取 -----
    if (pathname === '/api/data/load' && req.method === 'GET') {
        const data = loadReviews();
        sendJson(res, 200, { success: true, data: data });
        return;
    }

    // ----- 评价数据保存 -----
    if (pathname === '/api/data/save' && req.method === 'POST') {
        try {
            saveReviews(body.data || []);
            sendJson(res, 200, { success: true, message: '数据已保存' });
        } catch (e) {
            sendJson(res, 500, { success: false, message: e.message });
        }
        return;
    }

    // ----- 404 -----
    sendJson(res, 404, { success: false, message: 'API 不存在: ' + pathname });
}

// ==================== HTTP 服务 ====================
const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    // 处理 OPTIONS 预检
    if (req.method === 'OPTIONS') {
        setCORS(res);
        res.writeHead(204);
        res.end();
        return;
    }

    // API 路由
    if (pathname.indexOf('/api/') === 0) {
        const body = ['GET', 'DELETE'].includes(req.method) ? {} : await readBody(req);
        await handleApi(req, res, pathname, body);
        return;
    }

    // 静态文件
    serveStatic(req, res, pathname);
});

const cfg = loadConfig();
const PORT = cfg.port || 3000;
server.listen(PORT, () => {
    console.log('');
    console.log('============================================');
    console.log('  酒店评价智能分析评分系统 - 代理服务已启动');
    console.log('============================================');
    console.log('  访问地址: http://localhost:' + PORT);
    console.log('  静态根目录: ' + ROOT_DIR);
    console.log('  数据文件: ' + REVIEWS_FILE);
    console.log('  按 Ctrl+C 停止服务');
    console.log('============================================');
    console.log('');
});
