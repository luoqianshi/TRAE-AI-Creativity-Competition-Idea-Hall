// 等待页面脚本

document.addEventListener('DOMContentLoaded', function() {
    initializeWaitingAnimation();
});

function initializeWaitingAnimation() {
    // 开始动画序列
    startProgressAnimation();
    
    // 设置12秒后跳转到结果页面
    setTimeout(() => {
        redirectToResults();
    }, 12000); // 12秒给更多时间观看动画
}

// 开始进度动画
function startProgressAnimation() {
    // 第一步：激活第一个进度项目
    setTimeout(() => {
        activateProgress(1);
    }, 1000);
    
    // 第二步：激活第二个进度项目
    setTimeout(() => {
        activateProgress(2);
    }, 3000);
    
    // 第三步：激活第三个进度项目
    setTimeout(() => {
        activateProgress(3);
    }, 5000);
    
    // 第四步：激活第四个进度项目
    setTimeout(() => {
        activateProgress(4);
    }, 7000);
}

// 激活指定进度的项目
function activateProgress(progressNumber) {
    const progressItem = document.getElementById(`progress${progressNumber}`);
    const progressFill = document.getElementById(`fill${progressNumber}`);
    const tag = document.getElementById(`tag${progressNumber}`);
    
    if (progressItem && progressFill) {
        // 激活进度项目
        progressItem.classList.add('active');
        
        // 动画填充进度条
        setTimeout(() => {
            progressFill.style.width = '100%';
        }, 200);
        
        // 完成该项目
        setTimeout(() => {
            progressItem.classList.add('completed');
        }, 2200);
    }
    
    // 激活对应的标签
    if (tag) {
        setTimeout(() => {
            tag.classList.add('active');
        }, 300);
    }
}

// 跳转到结果页面
function redirectToResults() {
    // 显示跳转提示
    showRedirectMessage();
    
    setTimeout(() => {
        window.location.href = 'result.html';
    }, 1500); // 增加到1.5秒让用户看到跳转提示
}

// 显示跳转提示
function showRedirectMessage() {
    // 检查是否已经存在提示框，避免重复显示
    if (document.querySelector('.redirect-message')) {
        return;
    }
    
    const message = document.createElement('div');
    message.className = 'redirect-message';
    message.innerHTML = `
        <div class="message-content">
            <div class="message-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#4CAF50"/>
                </svg>
            </div>
            <p>正在跳转到测试结果...</p>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .redirect-message {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
            z-index: 2000;
            animation: messagePop 0.5s ease-out;
        }
        
        .message-content {
            text-align: center;
        }
        
        .message-icon {
            margin-bottom: 15px;
            animation: iconPulse 1.5s ease-in-out infinite;
        }
        
        .message-content p {
            margin: 0;
            color: #4a5568;
            font-weight: 500;
        }
        
        @keyframes messagePop {
            from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        
        @keyframes iconPulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(message);
}

// 返回上一页
function goBack() {
    if (confirm('确定要返回吗？当前进度将会丢失。')) {
        window.history.back();
    }
}

// 防止页面刷新时丢失状态
window.addEventListener('beforeunload', function(e) {
    e.preventDefault();
    e.returnValue = '确定要离开吗？当前进度将会丢失。';
});

// 页面加载完成后的额外初始化
window.addEventListener('load', function() {
    // 添加页面加载完成的视觉反馈
    document.body.classList.add('loaded');
    
    // 延迟启动主要动画
    setTimeout(() => {
        const heroSection = document.querySelector('.hero-section');
        const titleSection = document.querySelector('.title-section');
        const progressSection = document.querySelector('.progress-section');
        
        if (heroSection) heroSection.classList.add('animate-in');
        if (titleSection) titleSection.classList.add('animate-in');
        if (progressSection) progressSection.classList.add('animate-in');
    }, 300);
});

// CSS动画类
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .waiting-page.loaded .hero-section {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s ease-out;
    }
    
    .waiting-page.loaded .hero-section.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .waiting-page.loaded .title-section {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.8s ease-out 0.2s;
    }
    
    .waiting-page.loaded .title-section.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .waiting-page.loaded .progress-section {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.8s ease-out 0.4s;
    }
    
    .waiting-page.loaded .progress-section.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
`;

document.head.appendChild(additionalStyles);