/**
 * Toast 消息提示组件
 */
const Toast = {
    // 默认持续时间（毫秒）
    defaultDuration: {
        success: 3000,
        error: 5000,
        warning: 4000,
        info: 3000
    },

    // Toast 容器样式（注入到body）
    containerStyle: `
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        }

        .toast {
            min-width: 280px;
            max-width: 400px;
            padding: 14px 20px;
            border-radius: 6px;
            color: #fff;
            font-size: 14px;
            line-height: 1.5;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 10px;
            pointer-events: auto;
            animation: toast-slide-in 0.3s ease-out forwards;
        }

        .toast.toast-success {
            background-color: #52c41a;
        }

        .toast.toast-error {
            background-color: #ff4d4f;
        }

        .toast.toast-warning {
            background-color: #faad14;
        }

        .toast.toast-info {
            background-color: #1890ff;
        }

        .toast.toast-fade-out {
            animation: toast-fade-out 0.3s ease-out forwards;
        }

        /* 图标样式 */
        .toast-icon {
            font-size: 18px;
            flex-shrink: 0;
        }

        /* 滑入动画 */
        @keyframes toast-slide-in {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        /* 淡出动画 */
        @keyframes toast-fade-out {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `,

    // 初始化：注入样式
    init() {
        if (!document.getElementById('toast-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'toast-styles';
            styleEl.textContent = this.containerStyle;
            document.body.appendChild(styleEl);
        }

        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    },

    // 显示Toast
    show(type, message, duration) {
        this.init();

        const durationTime = duration || this.defaultDuration[type] || 3000;
        const container = document.querySelector('.toast-container');

        // 创建Toast元素
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getIcon(type)}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        // 设置自动移除
        setTimeout(() => {
            toast.classList.add('toast-fade-out');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, durationTime);
    },

    // 获取图标
    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    },

    // 快捷方法
    success(message, duration) {
        this.show('success', message, duration);
    },

    error(message, duration) {
        this.show('error', message, duration);
    },

    warning(message, duration) {
        this.show('warning', message, duration);
    },

    info(message, duration) {
        this.show('info', message, duration);
    }
};

// 导出到全局
window.Toast = Toast;
