/**
 * 统一加载动画组件
 * 提供容器级和全屏级加载动画功能
 */
(function() {
    // 存储容器原始内容的Map
    const containerContentMap = new Map();

    const Loading = {
        /**
         * 在指定容器显示加载动画
         * @param {string|HTMLElement} containerSelector - 容器选择器或DOM元素
         * @param {Object} options - 配置选项
         * @param {string} options.text - 加载文字，默认'加载中...'
         * @param {string} options.size - 尺寸，可选'small'|'medium'|'large'，默认'medium'
         * @param {string} options.color - 旋转圆环颜色，默认'#3498db'
         */
        show(containerSelector, options = {}) {
            const container = typeof containerSelector === 'string'
                ? document.querySelector(containerSelector)
                : containerSelector;

            if (!container) {
                console.warn('Loading.show: 容器不存在');
                return;
            }

            // 保存原始内容
            if (!containerContentMap.has(container)) {
                containerContentMap.set(container, container.innerHTML);
            }

            const {
                text = '加载中...',
                size = 'medium',
                color = '#3498db'
            } = options;

            // 根据尺寸设置圆环大小
            const sizeMap = {
                small: { width: '20px', height: '20px', borderWidth: '2px' },
                medium: { width: '35px', height: '35px', borderWidth: '3px' },
                large: { width: '50px', height: '50px', borderWidth: '4px' }
            };
            const sizeConfig = sizeMap[size] || sizeMap.medium;

            // 创建加载动画HTML
            const loadingHtml = `
                <div class="loading-wrapper" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    min-height: 100px;
                ">
                    <div class="loading-spinner" style="
                        width: ${sizeConfig.width};
                        height: ${sizeConfig.height};
                        border: ${sizeConfig.borderWidth} solid rgba(0,0,0,0.1);
                        border-top-color: ${color};
                        border-radius: 50%;
                        animation: loading-spin 0.8s linear infinite;
                    "></div>
                    ${text ? `<p style="margin-top: 12px; color: #666; font-size: 14px;">${text}</p>` : ''}
                </div>
            `;

            container.innerHTML = loadingHtml;
        },

        /**
         * 隐藏指定容器的加载动画，恢复原始内容
         * @param {string|HTMLElement} containerSelector - 容器选择器或DOM元素
         */
        hide(containerSelector) {
            const container = typeof containerSelector === 'string'
                ? document.querySelector(containerSelector)
                : containerSelector;

            if (!container) {
                console.warn('Loading.hide: 容器不存在');
                return;
            }

            // 恢复原始内容
            if (containerContentMap.has(container)) {
                container.innerHTML = containerContentMap.get(container);
                containerContentMap.delete(container);
            }
        },

        /**
         * 显示全屏加载动画
         * @param {Object} options - 配置选项
         * @param {string} options.text - 加载文字，默认'加载中...'
         * @param {string} options.color - 旋转圆环颜色，默认'#ffffff'
         */
        showFullscreen(options = {}) {
            // 避免重复创建
            if (document.getElementById('fullscreen-loading')) {
                return;
            }

            const { text = '加载中...', color = '#ffffff' } = options;

            const fullscreenHtml = `
                <div id="fullscreen-loading" style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.6);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999;
                ">
                    <div style="
                        width: 45px;
                        height: 45px;
                        border: 3px solid rgba(255,255,255,0.2);
                        border-top-color: ${color};
                        border-radius: 50%;
                        animation: loading-spin 0.8s linear infinite;
                    "></div>
                    ${text ? `<p style="margin-top: 15px; color: ${color}; font-size: 14px;">${text}</p>` : ''}
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', fullscreenHtml);
        },

        /**
         * 隐藏全屏加载动画
         */
        hideFullscreen() {
            const fullscreenLoader = document.getElementById('fullscreen-loading');
            if (fullscreenLoader) {
                fullscreenLoader.remove();
            }
        }
    };

    // 添加CSS动画样式（只添加一次）
    if (!document.getElementById('loading-animation-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'loading-animation-styles';
        styleSheet.textContent = `
            @keyframes loading-spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // 暴露到全局
    window.Loading = Loading;
})();
