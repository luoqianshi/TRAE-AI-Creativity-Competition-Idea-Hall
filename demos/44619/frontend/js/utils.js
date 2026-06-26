// 生成空状态HTML
function emptyStateHTML(icon, title, description, buttonText, buttonAction) {
    return `
        <div class="empty-state">
            <i class="fas fa-${icon}"></i>
            <h3>${title}</h3>
            <p>${description}</p>
            ${buttonText ? `<a href="javascript:void(0)" class="btn btn-primary" onclick="${buttonAction}">${buttonText}</a>` : ''}
        </div>
    `;
}

// 初始化图片懒加载
function initLazyLoad() {
    // 使用Intersection Observer API
    // 图片src改为data-src
    // 进入视口时将data-src赋值给src
    // 添加.lazy-image类和占位图
    
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('lazy-image');
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // 兼容不支持Intersection Observer的浏览器
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.add('lazy-image');
            img.removeAttribute('data-src');
        });
    }
}

// 防重复点击（指定秒数内只能点击一次）
function debounceClick(callback, delay = 2000) {
    let lastClick = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastClick >= delay) {
            lastClick = now;
            return callback.apply(this, args);
        }
    };
}
