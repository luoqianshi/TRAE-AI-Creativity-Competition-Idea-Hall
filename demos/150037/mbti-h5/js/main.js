// MBTI H5 页面交互脚本 - 优化版本

document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面交互
    initVersionSelection();
    initStartTestButton();
    initScrollAnimations();
    initPageInteractions();
});

// 初始化完整版默认选中
function initDefaultSelection() {
    const completeVersion = document.getElementById('completeVersion');
    if (completeVersion) {
        completeVersion.classList.add('selected');
    }
}

// 版本选择功能 - 优化交互
function initVersionSelection() {
    // 默认选中完整版
    initDefaultSelection();
    
    const versionCards = document.querySelectorAll('.version-card');
    
    versionCards.forEach(card => {
        card.addEventListener('click', function() {
            // 移除所有选中状态
            versionCards.forEach(c => c.classList.remove('selected'));
            
            // 添加选中状态
            this.classList.add('selected');
            
            // 添加动画效果
            this.style.transform = 'scale(1.02)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
            
            // 更新CTA提示文字
            updateCtaNote();
        });
    });
}

// 更新CTA提示文字
function updateCtaNote() {
    const selectedCard = document.querySelector('.version-card.selected');
    const ctaNote = document.querySelector('.cta-note');
    
    if (selectedCard && ctaNote) {
        const versionName = selectedCard.querySelector('h3').textContent;
        ctaNote.textContent = `已选择${versionName}，点击开始测试`;
    }
}

// 开始测试按钮功能 - 直接跳转
function initStartTestButton() {
    const startButton = document.getElementById('startTestBtn');
    
    startButton.addEventListener('click', function() {
        const selectedCard = document.querySelector('.version-card.selected');
        
        if (!selectedCard) {
            showMessage('请先选择测试版本', 'warning');
            return;
        }
        
        // 获取选中的版本信息
        const versionName = selectedCard.querySelector('h3').textContent;
        const questionCount = selectedCard.querySelector('.question-count').textContent;
        
        // 显示加载状态
        this.innerHTML = '<span class="loading"></span> 正在启动测试...';
        this.disabled = true;
        
        // 跳转到测试页面
        setTimeout(() => {
            window.location.href = 'test.html';
        }, 1000);
    });
}

// 滚动动画
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // 观察所有卡片元素
    const cards = document.querySelectorAll('.type-card, .dimension-card, .timeline-item, .founder');
    cards.forEach(card => observer.observe(card));
}

// 页面交互增强
function initPageInteractions() {
    // 人格类型卡片悬停效果
    const typeCards = document.querySelectorAll('.type-card');
    typeCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // 平滑滚动到顶部按钮
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '↑';
    scrollButton.className = 'scroll-to-top';
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #8A4D9E 0%, #A855F7 100%);
        color: white;
        border: none;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        box-shadow: 0 4px 15px rgba(138, 77, 158, 0.3);
    `;
    
    document.body.appendChild(scrollButton);
    
    // 显示/隐藏返回顶部按钮
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollButton.style.opacity = '1';
            scrollButton.style.visibility = 'visible';
        } else {
            scrollButton.style.opacity = '0';
            scrollButton.style.visibility = 'hidden';
        }
    });
    
    // 点击返回顶部
    scrollButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // 链接点击追踪
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 显示消息提示
function showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.textContent = text;
    
    const style = document.createElement('style');
    style.textContent = `
        .message {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 12px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 1002;
            animation: messageSlide 0.3s ease;
            font-weight: 500;
        }
        
        .message-warning {
            border-left: 4px solid #F26B5C;
            color: #F26B5C;
        }
        
        .message-info {
            border-left: 4px solid #2196F3;
            color: #2196F3;
        }
        
        .message-success {
            border-left: 4px solid #4CAF50;
            color: #4CAF50;
        }
        
        @keyframes messageSlide {
            from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'messageSlide 0.3s ease reverse';
        setTimeout(() => {
            message.remove();
            style.remove();
        }, 300);
    }, 3000);
}