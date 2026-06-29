/**
 * utils.js - 工具函数模块
 * 提供日期格式化、数字格式化、防抖节流、表单验证、Toast提示等通用工具
 */

const Utils = (() => {
    'use strict';

    // ============================================
    // 日期格式化
    // ============================================

    /**
     * 格式化日期
     * @param {Date|string|number} date - 日期对象、时间戳或日期字符串
     * @param {string} format - 格式模板 (YYYY-MM-DD HH:mm:ss)
     * @returns {string} 格式化后的日期字符串
     */
    function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return '';

        const map = {
            'YYYY': d.getFullYear(),
            'MM': String(d.getMonth() + 1).padStart(2, '0'),
            'DD': String(d.getDate()).padStart(2, '0'),
            'HH': String(d.getHours()).padStart(2, '0'),
            'mm': String(d.getMinutes()).padStart(2, '0'),
            'ss': String(d.getSeconds()).padStart(2, '0')
        };

        let result = format;
        for (const [key, val] of Object.entries(map)) {
            result = result.replace(key, val);
        }
        return result;
    }

    /**
     * 获取相对时间描述（如：3分钟前、2小时前）
     * @param {Date|string|number} date
     * @returns {string}
     */
    function timeAgo(date) {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return '';

        const now = Date.now();
        const diff = now - d.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (seconds < 60) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 30) return `${days}天前`;
        if (months < 12) return `${months}个月前`;
        return `${years}年前`;
    }

    // ============================================
    // 数字格式化
    // ============================================

    /**
     * 格式化数字（添加千分位分隔符）
     * @param {number} num
     * @param {number} decimals - 小数位数
     * @returns {string}
     */
    function formatNumber(num, decimals = 0) {
        if (num === null || num === undefined || isNaN(num)) return '0';
        return Number(num).toLocaleString('zh-CN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string}
     */
    function formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
    }

    /**
     * 格式化数字为缩写形式（如：1.2k, 3.5M）
     * @param {number} num
     * @returns {string}
     */
    function formatCompact(num) {
        if (!num || isNaN(num)) return '0';
        if (num < 1000) return String(num);
        if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;
        if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
        return `${(num / 1000000000).toFixed(1)}B`;
    }

    // ============================================
    // 防抖与节流
    // ============================================

    /**
     * 防抖函数
     * @param {Function} fn - 需要防抖的函数
     * @param {number} delay - 延迟时间(ms)
     * @returns {Function}
     */
    function debounce(fn, delay = 300) {
        let timer = null;
        return function (...args) {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                fn.apply(this, args);
                timer = null;
            }, delay);
        };
    }

    /**
     * 节流函数
     * @param {Function} fn - 需要节流的函数
     * @param {number} interval - 间隔时间(ms)
     * @returns {Function}
     */
    function throttle(fn, interval = 300) {
        let lastTime = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastTime >= interval) {
                lastTime = now;
                fn.apply(this, args);
            }
        };
    }

    // ============================================
    // 表单验证
    // ============================================

    const Validators = {
        /** 必填验证 */
        required(value, fieldName = '此字段') {
            if (value === null || value === undefined) return `${fieldName}不能为空`;
            if (typeof value === 'string' && value.trim() === '') return `${fieldName}不能为空`;
            return '';
        },

        /** 邮箱验证 */
        email(value) {
            if (!value) return '';
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(value) ? '' : '请输入有效的邮箱地址';
        },

        /** 手机号验证（中国） */
        phone(value) {
            if (!value) return '';
            const re = /^1[3-9]\d{9}$/;
            return re.test(value) ? '' : '请输入有效的手机号码';
        },

        /** 密码强度验证（至少6位，包含字母和数字） */
        password(value) {
            if (!value) return '';
            if (value.length < 6) return '密码长度至少为6位';
            if (!/[a-zA-Z]/.test(value) || !/\d/.test(value)) return '密码必须包含字母和数字';
            return '';
        },

        /** 最小长度验证 */
        minLength(value, min, fieldName = '此字段') {
            if (!value) return '';
            return value.length >= min ? '' : `${fieldName}长度不能少于${min}个字符`;
        },

        /** 最大长度验证 */
        maxLength(value, max, fieldName = '此字段') {
            if (!value) return '';
            return value.length <= max ? '' : `${fieldName}长度不能超过${max}个字符`;
        },

        /** URL验证 */
        url(value) {
            if (!value) return '';
            try {
                new URL(value);
                return '';
            } catch {
                return '请输入有效的URL地址';
            }
        },

        /** 数字验证 */
        number(value) {
            if (!value) return '';
            return !isNaN(Number(value)) ? '' : '请输入有效的数字';
        },

        /** 两次密码输入一致性验证 */
        confirmPassword(password, confirmPassword) {
            return password === confirmPassword ? '' : '两次输入的密码不一致';
        }
    };

    /**
     * 验证表单字段
     * @param {Object} data - 表单数据 { fieldName: value }
     * @param {Object} rules - 验证规则 { fieldName: [{ validator: 'required', message: 'xxx' }, ...] }
     * @returns {Object} { valid: boolean, errors: { fieldName: errorMessage } }
     */
    function validateForm(data, rules) {
        const errors = {};
        let valid = true;

        for (const [field, fieldRules] of Object.entries(rules)) {
            for (const rule of fieldRules) {
                const value = data[field];
                let error = '';

                if (typeof rule.validator === 'function') {
                    error = rule.validator(value);
                } else if (typeof rule.validator === 'string' && Validators[rule.validator]) {
                    const args = [value];
                    if (rule.params) args.push(...(Array.isArray(rule.params) ? rule.params : [rule.params]));
                    error = Validators[rule.validator](...args);
                }

                if (error) {
                    errors[field] = rule.message || error;
                    valid = false;
                    break;
                }
            }
        }

        return { valid, errors };
    }

    // ============================================
    // Toast 通知
    // ============================================

    let toastContainer = null;

    /**
     * 初始化Toast容器
     */
    function initToastContainer() {
        if (toastContainer) return;
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
    }

    /**
     * 显示Toast提示
     * @param {string} message - 提示消息
     * @param {string} type - 类型：success, error, warning, info
     * @param {number} duration - 显示时间(ms)
     */
    function showToast(message, type = 'info', duration = 3000) {
        initToastContainer();

        const colorMap = {
            success: { bg: '#f0fdf4', border: '#22c55e', text: '#166534', icon: '✓' },
            error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b', icon: '✕' },
            warning: { bg: '#fffbeb', border: '#f59e0b', text: '#92400e', icon: '⚠' },
            info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', icon: 'ℹ' }
        };

        const style = colorMap[type] || colorMap.info;

        const toast = document.createElement('div');
        toast.className = 'toast-item';
        toast.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 20px;
            background: ${style.bg};
            border: 1px solid ${style.border};
            border-radius: 8px;
            color: ${style.text};
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            pointer-events: auto;
            transform: translateX(120%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;

        toast.innerHTML = `
            <span style="font-size:16px;font-weight:bold;">${style.icon}</span>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });

        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // ============================================
    // DOM 操作辅助
    // ============================================

    /**
     * 安全地设置innerHTML
     * @param {HTMLElement|string} el - DOM元素或选择器
     * @param {string} html - HTML内容
     */
    function setHTML(el, html) {
        const element = typeof el === 'string' ? document.querySelector(el) : el;
        if (element) {
            element.innerHTML = html;
        }
    }

    /**
     * 获取URL查询参数
     * @param {string} name - 参数名
     * @returns {string|null}
     */
    function getQueryParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    /**
     * 阻止表单默认提交
     * @param {Event} e
     */
    function preventDefault(e) {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
    }

    /**
     * 深拷贝对象
     * @param {*} obj
     * @returns {*}
     */
    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => deepClone(item));
        const cloned = {};
        for (const key of Object.keys(obj)) {
            cloned[key] = deepClone(obj[key]);
        }
        return cloned;
    }

    /**
     * 生成唯一ID
     * @returns {string}
     */
    function generateId() {
        return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 简单模板替换 ({{key}} -> value)
     * @param {string} template - 模板字符串
     * @param {Object} data - 数据对象
     * @returns {string}
     */
    function template(template, data) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : match;
        });
    }

    // ============================================
    // 模态框
    // ============================================

    /**
     * 显示模态框
     * @param {Object} options - { title, content, onConfirm, onCancel }
     */
    function showModal(options = {}) {
        const { title = '提示', content = '', onConfirm, onCancel, confirmText = '确定', cancelText = '取消', showCancel = true } = options;

        const existing = document.getElementById('app-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'app-modal';
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.5);
            opacity: 0;
            transition: opacity 0.2s ease;
        `;

        modal.innerHTML = `
            <div class="modal-box" style="
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 480px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: transform 0.2s ease;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            ">
                <h3 style="margin:0 0 16px;font-size:18px;color:#1f2937;">${title}</h3>
                <div style="margin-bottom:24px;color:#4b5563;font-size:14px;line-height:1.6;">${content}</div>
                <div style="display:flex;gap:10px;justify-content:flex-end;">
                    ${showCancel ? `<button class="modal-cancel" style="
                        padding: 8px 20px;
                        border: 1px solid #d1d5db;
                        border-radius: 6px;
                        background: white;
                        color: #374151;
                        cursor: pointer;
                        font-size: 14px;
                    ">${cancelText}</button>` : ''}
                    <button class="modal-confirm" style="
                        padding: 8px 20px;
                        border: none;
                        border-radius: 6px;
                        background: #3b82f6;
                        color: white;
                        cursor: pointer;
                        font-size: 14px;
                    ">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.querySelector('.modal-box').style.transform = 'scale(1)';
        });

        const close = () => {
            modal.style.opacity = '0';
            modal.querySelector('.modal-box').style.transform = 'scale(0.9)';
            setTimeout(() => modal.remove(), 200);
        };

        modal.querySelector('.modal-confirm').addEventListener('click', () => {
            if (onConfirm) onConfirm();
            close();
        });

        const cancelBtn = modal.querySelector('.modal-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (onCancel) onCancel();
                close();
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (onCancel) onCancel();
                close();
            }
        });
    }

    // ============================================
    // 本地存储封装
    // ============================================

    const Storage = {
        get(key, defaultValue = null) {
            try {
                const value = localStorage.getItem(key);
                return value ? JSON.parse(value) : defaultValue;
            } catch {
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch {
                return false;
            }
        },

        remove(key) {
            localStorage.removeItem(key);
        },

        clear() {
            localStorage.clear();
        }
    };

    // ============================================
    // 导出公共API
    // ============================================

    return {
        formatDate,
        timeAgo,
        formatNumber,
        formatFileSize,
        formatCompact,
        debounce,
        throttle,
        Validators,
        validateForm,
        showToast,
        setHTML,
        getQueryParam,
        preventDefault,
        deepClone,
        generateId,
        template,
        showModal,
        Storage
    };
})();

if (typeof window !== 'undefined') {
    window.Utils = Utils;
}
