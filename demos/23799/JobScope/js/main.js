/**
 * ============================================================
 * JobScope - 公共工具函数 / API 请求封装
 * ============================================================
 */

var JobScope = (function () {
    'use strict';

    var API_BASE = '';

    /**
     * 通用 API 请求
     */
    function apiRequest(method, url, data) {
        var options = {
            method: method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        return fetch(API_BASE + url, options)
            .then(function (res) {
                if (!res.ok) {
                    return res.json().then(function (errData) {
                        throw new Error(errData.message || ('请求失败: ' + res.status));
                    });
                }
                return res.json();
            });
    }

    /**
     * 格式化耗时
     */
    function formatTime(seconds) {
        if (!seconds || seconds < 0) seconds = 0;
        var m = Math.floor(seconds / 60);
        var s = Math.floor(seconds % 60);
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    /**
     * 简单的 Markdown 转 HTML 渲染器
     * 不依赖外部库，支持常用语法
     */
    function renderMarkdown(mdText) {
        if (!mdText) return '';

        var html = mdText;

        // 转义 HTML 特殊字符（保留我们处理的标签）
        html = html.replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');

        // 代码块 ``` ... ```
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function (match, lang, code) {
            return '<pre><code class="language-' + (lang || '') + '">' + code.trim() + '</code></pre>';
        });

        // 行内代码 `...`
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // 标题
        html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // 粗体和斜体
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // 分隔线
        html = html.replace(/^---+$/gm, '<hr>');

        // 引用块
        html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

        // 无序列表
        html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        // 有序列表
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

        // 段落
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';

        // 清理空段落
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<p>(<h[1-6]>)/g, '$1');
        html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>)/g, '$1');
        html = html.replace(/(<\/ul>)<\/p>/g, '$1');
        html = html.replace(/<p>(<pre>)/g, '$1');
        html = html.replace(/(<\/pre>)<\/p>/g, '$1');
        html = html.replace(/<p>(<blockquote>)/g, '$1');
        html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
        html = html.replace(/<p>(<hr>)<\/p>/g, '$1');

        // 表格处理
        html = html.replace(/^\|(.+)\|$/gm, function (match, content) {
            var cells = content.split('|').map(function (c) { return c.trim(); });
            if (cells.every(function (c) { return /^[\s\-:]+$/.test(c); })) {
                return ''; // 跳过分隔行
            }
            var tag = cells.map(function (c) { return '<td>' + c + '</td>'; }).join('');
            return '<tr>' + tag + '</tr>';
        });
        html = html.replace(/(<tr>.*<\/tr>\n?)+/g, function (m) {
            var rows = m.match(/<tr>.*?<\/tr>/g) || [];
            if (rows.length > 0) {
                // 第一行作为表头
                var headerRow = rows[0].replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>');
                var bodyRows = rows.slice(1).join('\n');
                return '<table><thead>' + headerRow + '</thead><tbody>' + bodyRows + '</tbody></table>';
            }
            return '';
        });

        return html;
    }

    // 公共 API
    return {
        apiRequest: apiRequest,
        formatTime: formatTime,
        renderMarkdown: renderMarkdown,
    };

})();
