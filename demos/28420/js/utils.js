// SHA-256 加密函数（纯JavaScript实现，兼容HTTP和HTTPS）
async function sha256(message) {
    // 如果浏览器支持crypto.subtle且是HTTPS环境，使用原生API
    if (window.crypto && window.crypto.subtle && window.location.protocol === 'https:') {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // 否则使用纯JavaScript实现
    return sha256Fallback(message);
}

// SHA-256 备用实现（纯JavaScript）
function sha256Fallback(message) {
    function rotateRight(n, x) {
        return (x >>> n) | (x << (32 - n));
    }
    
    function choice(x, y, z) {
        return (x & y) ^ (~x & z);
    }
    
    function majority(x, y, z) {
        return (x & y) ^ (x & z) ^ (y & z);
    }
    
    function sigma0(x) {
        return rotateRight(2, x) ^ rotateRight(13, x) ^ rotateRight(22, x);
    }
    
    function sigma1(x) {
        return rotateRight(6, x) ^ rotateRight(11, x) ^ rotateRight(25, x);
    }
    
    function gamma0(x) {
        return rotateRight(7, x) ^ rotateRight(18, x) ^ (x >>> 3);
    }
    
    function gamma1(x) {
        return rotateRight(17, x) ^ rotateRight(19, x) ^ (x >>> 10);
    }
    
    const k = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const bitLen = data.length * 8;
    
    // 填充
    const padLen = Math.ceil((data.length + 9) / 64) * 64;
    const padded = new Uint8Array(padLen);
    padded.set(data);
    padded[data.length] = 0x80;
    
    // 写入长度
    const view = new DataView(padded.buffer);
    view.setUint32(padLen - 4, bitLen, false);
    
    // 初始化哈希值
    let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
    let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
    
    // 处理每个512位块
    for (let i = 0; i < padLen; i += 64) {
        const w = new Uint32Array(64);
        for (let j = 0; j < 16; j++) {
            w[j] = view.getUint32(i + j * 4, false);
        }
        
        for (let j = 16; j < 64; j++) {
            w[j] = (gamma1(w[j - 2]) + w[j - 7] + gamma0(w[j - 15]) + w[j - 16]) >>> 0;
        }
        
        let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
        
        for (let j = 0; j < 64; j++) {
            const t1 = (h + sigma1(e) + choice(e, f, g) + k[j] + w[j]) >>> 0;
            const t2 = (sigma0(a) + majority(a, b, c)) >>> 0;
            h = g;
            g = f;
            f = e;
            e = (d + t1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (t1 + t2) >>> 0;
        }
        
        h0 = (h0 + a) >>> 0;
        h1 = (h1 + b) >>> 0;
        h2 = (h2 + c) >>> 0;
        h3 = (h3 + d) >>> 0;
        h4 = (h4 + e) >>> 0;
        h5 = (h5 + f) >>> 0;
        h6 = (h6 + g) >>> 0;
        h7 = (h7 + h) >>> 0;
    }
    
    // 转换为十六进制字符串
    return [h0, h1, h2, h3, h4, h5, h6, h7]
        .map(h => h.toString(16).padStart(8, '0'))
        .join('');
}

// 获取存储的token
function getToken() {
    return localStorage.getItem('accessToken');
}

// 保存token
function saveToken(token) {
    localStorage.setItem('accessToken', token);
}

// 清除token
function clearToken() {
    localStorage.removeItem('accessToken');
}

// 封装fetch请求，自动添加authorization头
async function request(url, options = {}) {
    const token = getToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // 如果有token，添加到请求头
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        return await response.json();
    } catch (error) {
        console.error('请求失败:', error);
        // 判断是否是网络错误或CORS问题
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('网络连接失败，请检查后端服务是否启动');
        }
        throw error;
    }
}

// POST请求快捷方法
function post(url, data) {
    return request(url, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// GET请求快捷方法
function get(url) {
    return request(url, {
        method: 'GET'
    });
}
