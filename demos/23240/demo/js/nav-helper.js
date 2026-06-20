/**
 * nav-helper.js — 跨域导航兼容脚本
 * 
 * 解决 Chrome 直接打开 file:// 时，iframe 子页面无法访问
 * window.parent.governancePlatform 的问题。
 * 
 * 原理：
 * 1. 优先尝试直接调用 window.parent.governancePlatform.navigate()
 * 2. 如果不可访问（Chrome file:// 跨域），则通过 postMessage 发送导航请求
 * 3. 父页面 layout.js 中监听 message 事件并执行导航
 * 
 * 使用方式：
 *   在子页面中引入此脚本后，使用 govNav(url, breadcrumb, params) 代替
 *   window.parent.governancePlatform.navigate(url, breadcrumb, params)
 */
(function () {
    'use strict';

    var _canDirectAccess = false;

    try {
        // 检测是否能直接访问 parent 的 governancePlatform
        if (window.parent && window.parent.governancePlatform && typeof window.parent.governancePlatform.navigate === 'function') {
            _canDirectAccess = true;
        }
    } catch (e) {
        // DOMException: Blocked a frame with origin "null" from accessing a cross-origin frame
        _canDirectAccess = false;
    }

    /**
     * 统一导航函数 — 自动选择直接调用或 postMessage
     * @param {string} url - 目标页面URL
     * @param {string|Array} breadcrumb - 面包屑
     * @param {object} params - URL参数
     */
    window.govNav = function (url, breadcrumb, params) {
        if (_canDirectAccess) {
            // 直接调用（HTTP 服务器场景）
            window.parent.governancePlatform.navigate(url, breadcrumb, params);
        } else {
            // postMessage fallback（Chrome file:// 场景）
            try {
                window.parent.postMessage({
                    type: 'GOVERNANCE_NAVIGATE',
                    url: url,
                    breadcrumb: breadcrumb,
                    params: params || {}
                }, '*');
            } catch (e) {
                console.error('[govNav] postMessage 失败:', e);
            }
        }
    };

    /**
     * 获取 URL 参数（兼容 getParam）
     * @param {string} key
     * @returns {string|null}
     */
    window.govGetParam = function (key) {
        if (_canDirectAccess && window.parent.governancePlatform.getParam) {
            return window.parent.governancePlatform.getParam(key);
        }
        // fallback: 从自身 URL 读取
        var search = window.location.search.substring(1);
        var pairs = search.split('&');
        for (var i = 0; i < pairs.length; i++) {
            var kv = pairs[i].split('=');
            if (decodeURIComponent(kv[0]) === key) {
                return decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
            }
        }
        return null;
    };

})();
