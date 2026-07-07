/* ============================================
   API 封装：与本地代理服务通信
   ============================================ */

const API = {
    // 代理服务地址（同源，相对路径）
    BASE: '',

    // 错误去重：同一接口 3 秒内只报一次错
    _lastError: {},

    // 通用请求方法
    async request(path, method, data) {
        const url = this.BASE + path;
        const options = {
            method: method || 'GET',
            headers: {}
        };
        if (data && method !== 'GET') {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(data);
        }
        try {
            const resp = await fetch(url, options);
            const contentType = resp.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                const text = await resp.text();
                console.error('API 返回非 JSON:', path, resp.status, text.slice(0, 200));
                return { success: false, message: `API 返回非 JSON 内容 (HTTP ${resp.status})，请检查代理服务是否正常`, raw: text.slice(0, 500) };
            }
            const json = await resp.json();
            return json;
        } catch (e) {
            console.error('API 请求失败:', path, e);
            let errorMsg = e.message || String(e);
            if (errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
                errorMsg = '无法连接到代理服务 (' + url + ')，请确认 node proxy/proxy.js 已启动';
            }
            // 错误去重：同一接口 3 秒内只返回一次带 message 的失败
            const now = Date.now();
            const key = path + '|' + errorMsg.slice(0, 50);
            if (this._lastError[key] && now - this._lastError[key] < 3000) {
                return { success: false, message: errorMsg, _suppressed: true };
            }
            this._lastError[key] = now;
            return { success: false, message: errorMsg };
        }
    },

    // 分析评价
    analyze(modelKey, systemPrompt, userPrompt, reviewContent) {
        return this.request('/api/analyze', 'POST', {
            model_key: modelKey,
            system_prompt: systemPrompt,
            user_prompt: userPrompt,
            review_content: reviewContent
        });
    },

    // 测试连接
    testConnection(modelKey) {
        return this.request('/api/test-connection', 'POST', { model_key: modelKey });
    },

    // 加载代理配置（不含 API Key）
    loadProxyConfig() {
        return this.request('/api/config/load', 'GET');
    },

    // 保存代理配置
    saveProxyConfig(config) {
        return this.request('/api/config/save', 'POST', config);
    },

    // 设置单个模型 API Key
    setApiKey(modelKey, apiKey) {
        return this.request('/api/config/set-key', 'POST', { model_key: modelKey, api_key: apiKey });
    },

    // 加载评价数据
    loadReviews() {
        return this.request('/api/data/load', 'GET');
    },

    // 保存评价数据
    saveReviews(data) {
        return this.request('/api/data/save', 'POST', { data: data });
    },

    // 同步本地数据到服务端（页面关闭前调用）
    async syncReviewsToServer() {
        const data = Store.get('reviews_data', []);
        return this.saveReviews(data);
    },

    // 从服务端拉取数据到本地（合并策略：以本地为主，服务端仅作为补充）
    async syncReviewsFromServer() {
        const localData = Store.get('reviews_data', []);
        const resp = await this.loadReviews();
        if (resp.success && Array.isArray(resp.data)) {
            // 如果服务端数据比本地多（说明其他页面写入了），则用服务端数据
            // 如果服务端为空而本地有数据，保留本地数据
            if (resp.data.length > localData.length) {
                Store.set('reviews_data', resp.data);
                return resp.data;
            }
            // 如果本地为空而服务端有数据，用服务端数据
            if (localData.length === 0 && resp.data.length > 0) {
                Store.set('reviews_data', resp.data);
                return resp.data;
            }
            // 其他情况以本地为准
            return localData;
        }
        return localData;
    }
};
