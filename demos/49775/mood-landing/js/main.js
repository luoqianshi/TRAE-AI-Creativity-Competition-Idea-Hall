// ========== 滚动渐入动画 ==========
document.addEventListener('DOMContentLoaded', function() {
    // 使用 Intersection Observer 实现滚动渐入
    const revealElements = document.querySelectorAll('.reveal');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    revealElements.forEach(function(el, index) {
        // 为每个元素添加延迟，形成错落有致的效果
        el.style.transitionDelay = (index % 4) * 0.1 + 's';
        observer.observe(el);
    });
    
    // ========== 卡片悬停效果增强 ==========
    const cards = document.querySelectorAll('.pain-card, .highlight-card, .scenario-tag, .feature-item, .entrance-card');
    
    cards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
    
    // ========== 平滑滚动 ==========
    // 为所有锚点链接添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ========== 顶部区域视差效果 ==========
    const hero = document.querySelector('.hero');
    const blobs = document.querySelectorAll('.blob');
    
    if (hero && blobs.length > 0) {
        window.addEventListener('scroll', function() {
            const scrollY = window.scrollY;
            const heroHeight = hero.offsetHeight;
            
            if (scrollY < heroHeight) {
                const opacity = 1 - (scrollY / heroHeight) * 0.5;
                blobs.forEach(function(blob, index) {
                    const speed = (index + 1) * 0.3;
                    blob.style.transform = 'translateY(' + (scrollY * speed) + 'px)';
                    blob.style.opacity = opacity * 0.5;
                });
            }
        }, { passive: true });
    }
    
    // ========== 场景标签点击效果 ==========
    const scenarioTags = document.querySelectorAll('.scenario-tag');
    
    scenarioTags.forEach(function(tag) {
        tag.addEventListener('click', function() {
            // 添加点击缩放效果
            this.style.transform = 'scale(0.95)';
            setTimeout(function() {
                tag.style.transform = '';
            }, 150);
        });
    });
    
    // ========== 情绪表格行高亮效果 ==========
    const tableRows = document.querySelectorAll('.emotion-table tbody tr');
    
    tableRows.forEach(function(row) {
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.01)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // ========== 入口卡片点击波纹效果 ==========
    const entranceCards = document.querySelectorAll('.entrance-card');
    
    entranceCards.forEach(function(card) {
        card.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.4)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s ease-out';
            ripple.style.pointerEvents = 'none';
            ripple.style.zIndex = '10';
            
            this.appendChild(ripple);
            
            setTimeout(function() {
                ripple.remove();
            }, 600);
        });
    });
    
    // 添加波纹动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // ========== 导航栏滚动效果（预留） ==========
    let lastScrollY = 0;
    
    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;
        lastScrollY = currentScrollY;
    }, { passive: true });
    
    // ========== 页面加载完成后的初始化 ==========
    console.log('%c🌸 心情着陆点', 'font-size: 24px; font-weight: bold; color: #FF8A65;');
    console.log('%c先接住情绪，再补一点能量，慢慢看见自己正在变好', 'font-size: 14px; color: #8D6E63;');
});
