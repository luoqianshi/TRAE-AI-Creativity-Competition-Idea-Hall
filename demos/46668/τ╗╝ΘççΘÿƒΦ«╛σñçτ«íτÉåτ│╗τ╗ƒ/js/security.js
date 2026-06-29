/**
 * 安全辅助函数
 * 用于防止 XSS 攻击
 */

// HTML 转义函数
function escapeHtml(text) {
    if (text === null || text === undefined) {
        return '';
    }
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// 安全地设置元素内容
function safeSetText(element, text) {
    if (element) {
        element.textContent = text;
    }
}

// 安全地设置元素 HTML（使用 DOMPurify 或自定义净化）
function safeSetHtml(element, html) {
    if (element) {
        // 如果 DOMPurify 可用，使用它
        if (typeof DOMPurify !== 'undefined') {
            element.innerHTML = DOMPurify.sanitize(html);
        } else {
            // 否则使用简单的转义
            element.innerHTML = escapeHtml(html);
        }
    }
}

// 安全创建表格行
function createSafeTableRow(data) {
    const row = document.createElement('tr');
    data.forEach(cellData => {
        const cell = document.createElement('td');
        if (typeof cellData === 'object' && cellData.html) {
            // 如果明确指定为 HTML，使用安全设置
            safeSetHtml(cell, cellData.html);
        } else {
            // 默认作为文本处理
            safeSetText(cell, cellData);
        }
        row.appendChild(cell);
    });
    return row;
}

// 验证用户输入
function validateInput(input, type = 'text') {
    if (!input) return '';
    
    // 移除前后空格
    input = String(input).trim();
    
    switch (type) {
        case 'number':
            return isNaN(input) ? 0 : Number(input);
        case 'date':
            // 验证日期格式
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            return dateRegex.test(input) ? input : '';
        case 'text':
        default:
            // 限制长度并转义
            return input.substring(0, 1000);
    }
}

// 安全的事件处理器
function safeEventHandler(handler) {
    return function(event) {
        try {
            handler.call(this, event);
        } catch (error) {
            console.error('Event handler error:', error);
            alert('操作失败，请重试');
        }
    };
}

// 导出函数（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        escapeHtml,
        safeSetText,
        safeSetHtml,
        createSafeTableRow,
        validateInput,
        safeEventHandler
    };
}
