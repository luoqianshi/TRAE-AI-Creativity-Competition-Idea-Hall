/* ============================================
   公共工具：CDN 引入、布局渲染、通用方法
   每个 pages/*.html 引入此文件即可获得统一环境
   ============================================ */

// CDN 基础库（顺序引入）
const CDN_LIBS_ALL = [
    { type: 'css', url: 'https://cdn.jsdelivr.net/npm/element-ui@2.15.14/lib/theme-chalk/index.css' },
    { type: 'js',  url: 'https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.min.js' },
    { type: 'js',  url: 'https://cdn.jsdelivr.net/npm/element-ui@2.15.14/lib/index.js' },
    { type: 'js',  url: 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js' }
];

// 基础库（不含 ECharts，大多数页面用这个）
const CDN_LIBS_BASIC = CDN_LIBS_ALL.slice(0, 3);

// 同步加载脚本（按顺序）
function loadLibsSync(libs, onDone) {
    let idx = 0;
    function loadNext() {
        if (idx >= libs.length) { onDone(); return; }
        const lib = libs[idx++];
        // 检测是否已加载
        if (lib.type === 'js') {
            // Vue 检测
            if (lib.url.indexOf('vue') >= 0 && window.Vue) { loadNext(); return; }
            // Element UI 检测
            if (lib.url.indexOf('element-ui') >= 0 && window.ELEMENT) { loadNext(); return; }
            // ECharts 检测
            if (lib.url.indexOf('echarts') >= 0 && window.echarts) { loadNext(); return; }
            // 注意：子页面不复用父窗口的 Vue / Element UI / ECharts
            // 因为跨 window 复用会导致 Vue 响应式异常，引发 created 反复执行等问题
            // 每个 iframe 独立加载自己的副本，虽然略慢但稳定可靠
        }
        if (lib.type === 'css') {
            // 检查是否已有同 URL 的 link
            const existing = document.querySelector('link[href="' + lib.url + '"]');
            if (existing) { loadNext(); return; }
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = lib.url;
            document.head.appendChild(link);
            loadNext();
        } else {
            const script = document.createElement('script');
            script.src = lib.url;
            script.onload = loadNext;
            script.onerror = function () {
                console.error('CDN 加载失败:', lib.url);
                // 仍尝试继续
                loadNext();
            };
            document.head.appendChild(script);
        }
    }
    loadNext();
}

// 在子页面使用：自动注入 CDN 库并初始化 Vue 应用
// options.extraLibs: 额外需要加载的库（如 ECharts）
function bootstrapSubPage(appOptions, needECharts) {
    // 先显示加载提示
    const loadingDiv = document.createElement('div');
    loadingDiv.id = '__page_loading__';
    loadingDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;background:#f0f2f5;color:#909399;font-size:14px;z-index:9999;';
    loadingDiv.innerHTML = '<div style="text-align:center;"><div style="font-size:32px;margin-bottom:10px;">⏳</div>页面加载中...</div>';
    document.body.appendChild(loadingDiv);

    const libs = needECharts ? CDN_LIBS_ALL : CDN_LIBS_BASIC;
    loadLibsSync(libs, function () {
        // 注入全局样式（确保子页面也加载 style.css）
        if (!document.querySelector('link[href$="style.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '../css/style.css';
            document.head.appendChild(link);
        }
        // 全局错误捕获，避免白屏
        if (window.Vue && !window.__vueErrorInstalled) {
            Vue.config.errorHandler = function (err, vm, info) {
                console.error('Vue Error:', err, info);
            };
            window.__vueErrorInstalled = true;
        }
        try {
            // 移除加载提示
            if (loadingDiv.parentNode) {
                loadingDiv.parentNode.removeChild(loadingDiv);
            }
            new Vue(appOptions);
        } catch (e) {
            console.error('Vue 初始化失败:', e);
            // 在页面上显示错误信息
            loadingDiv.innerHTML = '<div style="padding:20px;max-width:600px;">'
                + '<h3 style="color:#f56c6c;margin-top:0;">页面加载出错</h3>'
                + '<pre style="background:#fef0f0;padding:12px;border-radius:4px;color:#f56c6c;font-size:12px;white-space:pre-wrap;">' + (e.message || e) + '</pre>'
                + '<p style="color:#909399;font-size:12px;">请刷新页面重试，或检查控制台错误信息。</p>'
                + '</div>';
        }
    });
}

// ==================== 通用工具方法 ====================
const Utils = {
    // 生成唯一 ID
    uuid() {
        return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    },

    // 格式化日期时间
    formatTime(d) {
        if (!d) return '';
        const dt = (d instanceof Date) ? d : new Date(d);
        if (isNaN(dt.getTime())) return '';
        const pad = (n) => n < 10 ? '0' + n : n;
        return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate())
             + ' ' + pad(dt.getHours()) + ':' + pad(dt.getMinutes()) + ':' + pad(dt.getSeconds());
    },
    formatDate(d) {
        if (!d) return '';
        const dt = (d instanceof Date) ? d : new Date(d);
        if (isNaN(dt.getTime())) return '';
        const pad = (n) => n < 10 ? '0' + n : n;
        return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate());
    },

    // 截断文本
    truncate(text, len) {
        if (!text) return '';
        return text.length > len ? text.substring(0, len) + '...' : text;
    },

    // 下载 JSON 文件
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // CSV 转 JSON
    csvToJSON(csvText) {
        const lines = csvText.replace(/\r\n/g, '\n').split('\n').filter(l => l.trim());
        if (lines.length === 0) return [];
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const obj = {};
            headers.forEach((h, idx) => { obj[h] = values[idx] || ''; });
            result.push(obj);
        }
        return result;
    },

    // JSON 转 CSV 并下载
    exportCSV(rows, filename) {
        if (!rows || rows.length === 0) return;
        const headers = Object.keys(rows[0]);
        const csvLines = [headers.join(',')];
        rows.forEach(row => {
            const line = headers.map(h => {
                let val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
                if (val.indexOf(',') >= 0 || val.indexOf('"') >= 0 || val.indexOf('\n') >= 0) {
                    val = '"' + val.replace(/"/g, '""') + '"';
                }
                return val;
            });
            csvLines.push(line);
        });
        // 添加 BOM 解决中文乱码
        const blob = new Blob(['\ufeff' + csvLines.join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'export.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // 深拷贝
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
};

// ==================== localStorage 简易封装 ====================
const Store = {
    get(key, defaultValue) {
        try {
            const v = localStorage.getItem(key);
            return v ? JSON.parse(v) : defaultValue;
        } catch (e) { return defaultValue; }
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    remove(key) {
        localStorage.removeItem(key);
    }
};

// ==================== 操作日志记录 ====================
const Logger = {
    log(type, detail) {
        const logs = Store.get('operation_logs', []);
        logs.unshift({
            time: Utils.formatTime(new Date()),
            type: type,
            detail: detail,
            user: 'admin'
        });
        // 最多保留 500 条
        if (logs.length > 500) logs.length = 500;
        Store.set('operation_logs', logs);
    }
};

// ==================== 等级颜色映射（统一） ====================
const SENTIMENT_COLORS = {
    strong_positive: '#52c41a',
    positive: '#73d13d',
    mild_positive: '#b7eb8f',
    neutral: '#bfbfbf',
    mild_negative: '#ffc069',
    negative: '#ff9c6e',
    strong_negative: '#ff4d4f'
};

const SENTIMENT_LABELS = {
    strong_positive: '强好评',
    positive: '好评',
    mild_positive: '弱好评',
    neutral: '中性',
    mild_negative: '弱差评',
    negative: '差评',
    strong_negative: '强差评'
};

function sentimentLabel(key) {
    return SENTIMENT_LABELS[key] || key;
}

function sentimentColor(key) {
    return SENTIMENT_COLORS[key] || '#bfbfbf';
}
