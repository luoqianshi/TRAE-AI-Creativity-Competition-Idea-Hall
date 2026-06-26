const Cache = {
    setCache(key, data, ttlMinutes = 30) {
        const now = Date.now();
        const item = {
            data: data,
            expiry: now + ttlMinutes * 60 * 1000
        };
        localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    },
    getCache(key) {
        const itemStr = localStorage.getItem(`cache_${key}`);
        if (!itemStr) return null;
        const item = JSON.parse(itemStr);
        if (Date.now() > item.expiry) {
            this.removeCache(key);
            return null;
        }
        return item.data;
    },
    removeCache(key) {
        localStorage.removeItem(`cache_${key}`);
    },
    clearCache() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cache_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
};
window.Cache = Cache;
