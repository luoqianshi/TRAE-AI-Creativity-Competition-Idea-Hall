const Request = {
    pendingRequests: new Map(),

    // 通用请求方法（带重试）
    async fetchWithRetry(url, options = {}, maxRetries = 3) {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(url, options);
                return response;
            } catch (error) {
                lastError = error;
                if (i < maxRetries - 1) {
                    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
                }
            }
        }
        throw lastError;
    },

    // 请求去重
    async dedupFetch(url, options = {}) {
        const key = `${options.method || 'GET'}:${url}`;
        if (this.pendingRequests.has(key)) {
            return this.pendingRequests.get(key);
        }
        const promise = fetch(url, options).finally(() => {
            this.pendingRequests.delete(key);
        });
        this.pendingRequests.set(key, promise);
        return promise;
    },

    // 设置按钮为loading状态
    setButtonLoading(btn) {
        if (!btn) return;
        btn.dataset.originalText = btn.textContent || btn.innerText;
        btn.textContent = '加载中...';
        btn.disabled = true;
        btn.classList.add('loading');
    },

    // 恢复按钮状态
    resetButton(btn, originalText) {
        if (!btn) return;
        const text = originalText || btn.dataset.originalText || '提交';
        btn.textContent = text;
        btn.disabled = false;
        btn.classList.remove('loading');
    }
};

window.Request = Request;
