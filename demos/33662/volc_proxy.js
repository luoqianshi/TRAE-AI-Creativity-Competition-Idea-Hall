// 火山引擎API代理服务器
// 使用方法：设置环境变量后运行 node proxy_server.js

const http = require('http');
const https = require('https');
const url = require('url');

// 从环境变量读取API Key
const API_KEY = process.env.ARK_API_KEY || 'ark-3f71e94b-20f0-4a7b-b92b-7950758ba816-4b09b';
const MODEL = process.env.ARK_MODEL || 'ep-20260613071814-2whbr';

// 火山引擎API地址
const VOLC_API_HOST = 'ark.cn-beijing.volces.com';
const VOLC_API_PATH = '/api/v3/chat/completions';

console.log('=== 火山引擎API代理服务器 ===');
console.log(`API Key: ${API_KEY.substring(0, 15)}...`);
console.log(`Model: ${MODEL}`);
console.log(`API地址: https://${VOLC_API_HOST}${VOLC_API_PATH}`);
console.log('==============================');

// 读取HTML文件
const fs = require('fs');
const path = require('path');

function serveHTML(res) {
    const htmlPath = path.join(__dirname, 'index.html');
    fs.readFile(htmlPath, 'utf8', (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('无法读取HTML文件: ' + err.message);
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
    });
}

// 处理API请求
function handleChatRequest(req, res, body) {
    console.log('\n=== 收到API请求 ===');
    console.log('请求体:', body);

    try {
        const requestData = JSON.parse(body);
        
        const options = {
            hostname: VOLC_API_HOST,
            port: 443,
            path: VOLC_API_PATH,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            }
        };

        console.log('转发到火山引擎API...');
        console.log('Headers:', options.headers);

        const proxyReq = https.request(options, (proxyRes) => {
            console.log('火山引擎响应状态:', proxyRes.statusCode);
            
            let responseData = '';
            proxyRes.on('data', (chunk) => {
                responseData += chunk;
            });
            proxyRes.on('end', () => {
                console.log('火山引擎响应数据:', responseData.substring(0, 200) + '...');
                
                res.writeHead(proxyRes.statusCode, {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                });
                res.end(responseData);
            });
        });

        proxyReq.on('error', (error) => {
            console.error('代理请求错误:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        });

        proxyReq.write(body);
        proxyReq.end();
        
    } catch (error) {
        console.error('处理请求错误:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    // CORS预检请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    // API代理端点
    if (parsedUrl.pathname === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            handleChatRequest(req, res, body);
        });
        return;
    }

    // 健康检查端点
    if (parsedUrl.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            apiKeyConfigured: !!API_KEY,
            model: MODEL
        }));
        return;
    }

    // 其他请求返回HTML
    serveHTML(res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`\n服务器已启动: http://localhost:${PORT}/`);
    console.log('API代理端点: http://localhost:' + PORT + '/api/chat');
    console.log('健康检查: http://localhost:' + PORT + '/health');
});
