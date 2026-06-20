/**
 * 火山引擎TTS代理服务器 - Node.js版本
 * 
 * 使用方法:
 * 1. 安装依赖: npm install express body-parser request
 * 2. 运行: node tts_proxy.js
 * 3. 服务器将监听 http://localhost:5000
 */

const http = require('http');
const https = require('https');
const url = require('url');

// 火山引擎TTS配置
const TTS_CONFIG = {
    appid: '7303281258',
    accessToken: 'Mty0R-gmudKz9HMW3oHlZGpRzmMdlii7',
    cluster: 'volcengine_streaming_common',
    voiceType: 'zh_female_qingxin',
    host: 'openspeech.bytedance.com',
    apiUrl: 'https://openspeech.bytedance.com/api/v1/tts'
};

// 生成唯一请求ID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 处理TTS请求
function handleTTSRequest(req, res, body) {
    console.log('\n=== 收到TTS请求 ===');
    
    try {
        const data = JSON.parse(body);
        const text = data.text || '';
        
        if (!text) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '文本不能为空' }));
            return;
        }
        
        const reqid = generateUUID();
        console.log('请求ID:', reqid);
        console.log('文本长度:', text.length);
        
        // 构建请求体
        const requestBody = JSON.stringify({
            app: {
                appid: TTS_CONFIG.appid,
                token: TTS_CONFIG.accessToken,
                cluster: TTS_CONFIG.cluster
            },
            user: {
                uid: "388808087185088"
            },
            audio: {
                voice: "other",
                voice_type: TTS_CONFIG.voiceType,
                encoding: "mp3",
                speed: 50,
                volume: 50,
                pitch: 50
            },
            request: {
                reqid: reqid,
                text: text,
                text_type: "plain",
                operation: "submit",
                with_frontend: 1,
                frontend_type: "unitTson"
            }
        });
        
        // 请求选项
        const options = {
            hostname: TTS_CONFIG.host,
            port: 443,
            path: '/api/v1/tts',
            method: 'POST',
            headers: {
                'Authorization': `Bearer;${TTS_CONFIG.accessToken}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        };
        
        console.log('正在调用火山引擎TTS API...');
        
        // 发送请求到火山引擎
        const proxyReq = https.request(options, (proxyRes) => {
            console.log('火山引擎响应状态:', proxyRes.statusCode);
            
            let responseData = '';
            proxyRes.on('data', (chunk) => {
                responseData += chunk;
            });
            
            proxyRes.on('end', () => {
                console.log('火山引擎响应数据长度:', responseData.length);
                
                try {
                    const result = JSON.parse(responseData);
                    
                    // 添加CORS头
                    res.writeHead(200, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    });
                    
                    // 检查是否有音频数据
                    if (result.data) {
                        res.end(JSON.stringify({
                            success: true,
                            audio: result.data,
                            reqid: reqid
                        }));
                    } else {
                        res.end(JSON.stringify({
                            success: true,
                            result: result,
                            reqid: reqid
                        }));
                    }
                } catch (e) {
                    console.error('解析响应失败:', e);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: '解析响应失败' }));
                }
            });
        });
        
        proxyReq.on('error', (error) => {
            console.error('请求错误:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        });
        
        proxyReq.write(requestBody);
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
    
    // TTS接口
    if (parsedUrl.pathname === '/tts' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            handleTTSRequest(req, res, body);
        });
        return;
    }
    
    // 健康检查接口
    if (parsedUrl.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            service: 'TTS Proxy (Node.js)',
            config: {
                appid: TTS_CONFIG.appid.substring(0, 10) + '...',
                cluster: TTS_CONFIG.cluster
            }
        }));
        return;
    }
    
    // 首页
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>TTS代理服务器</title>
    <style>
        body { font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px; }
        h1 { color: #667eea; }
        .info { background: #f0f0f0; padding: 15px; border-radius: 10px; }
        .success { color: green; }
        pre { background: #333; color: #fff; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>火山引擎TTS代理服务器</h1>
    <div class="info">
        <p class="success">✅ 服务器运行正常</p>
        <p>TTS接口地址: POST /tts</p>
        <p>健康检查: GET /health</p>
    </div>
    <h2>使用方法</h2>
    <pre>
前端调用示例:
fetch('http://localhost:5000/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: '要转换的文本' })
})
    </pre>
</body>
</html>
    `);
});

// 启动服务器
const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('火山引擎TTS代理服务器 (Node.js版)');
    console.log('='.repeat(50));
    console.log(`服务地址: http://localhost:${PORT}`);
    console.log(`TTS接口: http://localhost:${PORT}/tts`);
    console.log(`健康检查: http://localhost:${PORT}/health`);
    console.log('='.repeat(50));
});
