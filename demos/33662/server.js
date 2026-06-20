const http = require('http');
const https = require('https');

const PORT = 3000;
const ARK_API_KEY = process.env.ARK_API_KEY || 'ark-3f71e94b-20f0-4a7b-b92b-7950758ba816-4b09b';

const server = http.createServer((req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // 处理健康检查
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', apiKey: ARK_API_KEY ? 'configured' : 'missing' }));
        return;
    }

    // 处理AI聊天请求
    if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const requestData = JSON.parse(body);
                const { messages, model } = requestData;

                console.log('收到聊天请求，模型:', model || '未指定');

                const postData = JSON.stringify({
                    model: model || 'ep-20260613071814-2whbr',
                    input: messages.map(msg => ({
                        role: msg.role,
                        content: [{ type: 'input_text', text: msg.content }]
                    })),
                    max_tokens: 500,
                    temperature: 0.8
                });

                const options = {
                    hostname: 'ark.cn-beijing.volces.com',
                    port: 443,
                    path: '/api/v3/responses',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${ARK_API_KEY}`,
                        'Content-Length': Buffer.byteLength(postData)
                    }
                };

                const proxyReq = https.request(options, (proxyRes) => {
                    let responseData = '';
                    proxyRes.on('data', chunk => { responseData += chunk; });
                    proxyRes.on('end', () => {
                        res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
                        res.end(responseData);
                        console.log('AI响应状态:', proxyRes.statusCode);
                    });
                });

                proxyReq.on('error', (error) => {
                    console.error('代理请求错误:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: '代理请求失败', details: error.message }));
                });

                proxyReq.write(postData);
                proxyReq.end();

            } catch (error) {
                console.error('请求解析错误:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: '请求解析失败', details: error.message }));
            }
        });
        return;
    }

    // 其他请求返回404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
    console.log(`AI代理服务器已启动，端口: ${PORT}`);
    console.log(`使用API Key: ${ARK_API_KEY ? '已配置' : '未配置'}`);
    console.log(`访问地址: http://localhost:${PORT}/health`);
});
