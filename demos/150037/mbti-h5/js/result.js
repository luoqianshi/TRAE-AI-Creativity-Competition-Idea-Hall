// 结果页面脚本

// 全局变量
let testResult = null;

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    initializeResultPage();
});

function initializeResultPage() {
    // 获取测试结果
    testResult = calculateTestResult();
    
    if (testResult) {
        // 填充页面内容
        populateResultContent();
        
        // 添加动画效果
        addSlideInAnimations();
    } else {
        // 如果没有测试数据，重定向到首页
        alert('未找到测试结果，正在返回首页...');
        window.location.href = 'index.html';
    }
}

// 计算测试结果
function calculateTestResult() {
    // 从localStorage获取测试答案（如果有的话）
    const savedAnswers = localStorage.getItem('mbtiAnswers');
    const savedScores = localStorage.getItem('mbtiScores');
    
    let scores;
    
    if (savedScores) {
        scores = JSON.parse(savedScores);
    } else if (savedAnswers) {
        const answers = JSON.parse(savedAnswers);
        scores = calculateScores(answers);
        // 保存计算后的分数
        localStorage.setItem('mbtiScores', JSON.stringify(scores));
    } else {
        // 如果没有保存的数据，返回一个默认结果（用于演示）
        return getDefaultResult();
    }
    
    const { E, I, S, N, T, F, J, P } = scores;
    
    const first = E > I ? 'E' : 'I';
    const second = S > N ? 'S' : 'N';
    const third = T > F ? 'T' : 'F';
    const fourth = J > P ? 'J' : 'P';
    
    const type = first + second + third + fourth;
    
    return getPersonalityResult(type);
}

// 计算分数
function calculateScores(answers) {
    const scores = {
        E: 0, I: 0,
        S: 0, N: 0,
        T: 0, F: 0,
        J: 0, P: 0
    };
    
    // 根据答案计算分数（这里需要根据实际的题目结构来实现）
    Object.values(answers).forEach(answerIndex => {
        // 这里需要根据题目配置来增加相应的维度分数
        // 示例逻辑，实际应该根据题目数据来计算
    });
    
    return scores;
}

// 获取默认结果（用于演示）
function getDefaultResult() {
    return getPersonalityResult('INTJ');
}

// 获取人格结果数据
function getPersonalityResult(type) {
    const personalityData = {
        'INTJ': {
            name: '建筑师',
            category: '分析家',
            description: '富有想象力和战略性的思想家，一切皆在计划之中。',
            characteristics: ['逻辑思维', '战略规划', '独立自主', '追求完美'],
            loveAnalysis: '您在感情中理性而深刻，重视精神层面的连接。您倾向于寻找能够理解您思维方式的伴侣，并愿意为长久的关系投入大量的思考和规划。',
            idealPartner: '您最适合与思维相近、理解您独立性的伴侣在一起。欣赏能够进行深度对话、尊重您的个人空间并支持您目标的人。',
            loveAdvice: '学会表达内心的感受，不要总是用理性来分析感情。尝试更多的情感交流，让伴侣了解您的真实想法和感受。',
            careers: ['建筑师', '工程师', '战略规划师', '研究员', '律师'],
            workAdvantages: ['出色的战略规划和分析能力', '独立工作能力强', '追求完美，注重细节', '能够制定并执行长期计划'],
            careerAdvice: '发挥您的战略思维优势，在需要深度分析和长期规划的领域发展。学会与团队成员更好地沟通协作，分享您的想法和见解。',
            strengths: '您具有出色的分析能力、战略思维和独立性。您能够制定远大的目标并坚持不懈地追求，同时保持客观理性的判断力。',
            improvements: '建议多关注他人的情感需求，学会表达自己的感受。在团队合作中要更加开放，接受他人的意见和建议。',
            development: '培养更多的社交技能和情感智商，尝试参与团队项目。在追求目标的同时，也要关注过程中的体验和人际关系的建立。',
            socialTraits: '您重视深度而非广度的友谊，更喜欢与志同道合的人进行有意义的交流。在社交场合中，您更愿意做一个观察者而非活跃的参与者。',
            interactionTips: '对朋友要保持真诚和可靠，分享您的想法和见解。同时也要学会倾听他人的故事，给予他们支持和理解。',
            icon: '🏗️',
            color: '#2196F3'
        },
        'INTP': {
            name: '思想家',
            category: '分析家',
            description: '创新的发明家，对知识有着不懈的渴望。',
            characteristics: ['逻辑思维', '独立思考', '好奇心旺盛', '完美主义'],
            loveAnalysis: '您在感情中重视智力和精神上的连接，喜欢与伴侣进行深度的思想交流。您需要时间来建立信任，但一旦建立，会是非常深刻的关系。',
            idealPartner: '最适合与理解您需要独立思考空间的伴侣在一起。欣赏能够进行理论讨论、支持您学习新事物的人。',
            loveAdvice: '记得将理论转化为实际行动，多用具体的行动来表达爱意。学会在理性分析的同时，也关注情感层面的需求。',
            careers: ['科学家', '研究员', '程序员', '哲学家', '理论家'],
            workAdvantages: ['强大的逻辑分析能力', '创新思维和解决问题的能力', '独立工作能力强', '对复杂问题有独特的见解'],
            careerAdvice: '在需要深度思考和创新的领域发挥优势。学会更好地与团队沟通，将您的想法清晰地传达给他人。',
            strengths: '您具有卓越的逻辑思维能力和创新精神。您能够从独特的角度分析问题，提出创造性的解决方案。',
            improvements: '建议提高执行力和时间管理能力，学会将想法转化为实际的行动。多关注他人的感受和需求。',
            development: '培养更多的实践技能和团队合作能力。在追求知识的同时，也要关注人际关系的建立和维护。',
            socialTraits: '您更倾向于与少数几个深度理解的人建立友谊。在群体中，您更愿意倾听和观察，而不是主动发言。',
            interactionTips: '用您的智慧和见解来帮助朋友，但也要学会倾听他们的感受。保持开放的心态，接受不同的观点。',
            icon: '💡',
            color: '#2196F3'
        },
        // 可以继续添加其他类型...
        'ENFP': {
            name: '竞选者',
            category: '外交家',
            description: '热情、有创造力、善于社交的自由精神。',
            characteristics: ['热情洋溢', '创造力强', '社交能力强', '灵活变通'],
            loveAnalysis: '您在感情中充满热情和创意，善于激发伴侣的潜能。您重视情感交流，喜欢与伴侣分享各种想法和体验。',
            idealPartner: '最适合与能够理解您多变性格、欣赏您创造力的伴侣在一起。喜欢能够与您一起探索新事物、保持生活新鲜感的人。',
            loveAdvice: '学会在热情中保持专注，专注于一段关系的深度发展。多倾听伴侣的具体需求，而不仅仅是表达自己的想法。',
            careers: ['记者', '演员', '销售', '培训师', '心理咨询师'],
            workAdvantages: ['出色的沟通和激励能力', '创新思维和灵活应变', '善于团队协作和鼓舞士气', '能够激发他人的潜能'],
            careerAdvice: '在需要人际交往和创意的领域发光发热。学会在发挥创意的同时，也要注重执行的细节和时间管理。',
            strengths: '您具有感染他人的热情和创造力。您能够激发团队的士气，善于处理人际关系和推动项目进展。',
            improvements: '建议提高专注力和执行力，学会完成长期项目。多关注细节，避免因为追求完美而影响进度。',
            development: '培养更多的耐心和毅力，在追求目标的过程中保持坚持。多学会倾听他人的具体建议和反馈。',
            socialTraits: '您是天然的社交达人，善于与各种类型的人建立联系。在群体中，您往往是活跃的协调者和激励者。',
            interactionTips: '用您的热情来感染朋友，但也要学会倾听他们的具体需求。保持开放的心态，接受不同的观点和建议。',
            icon: '🎭',
            color: '#9C27B0'
        }
        // 可以继续添加更多类型...
    };
    
    return personalityData[type] || personalityData['INTJ'];
}

// 填充结果内容
function populateResultContent() {
    // 设置静态内容（在HTML中已经定义了）
    // 这部分在新设计中不需要动态填充
    console.log('Result page initialized');
    
    // 填充类型图标
    const typeIcon = document.getElementById('resultTypeIcon');
    typeIcon.textContent = testResult.icon;
    typeIcon.style.background = `linear-gradient(135deg, ${testResult.color} 0%, ${testResult.color}dd 100%)`;
    
    // 填充核心特征
    testResult.characteristics.forEach((feature, index) => {
        const featureItem = document.getElementById(`feature${index + 1}`);
        if (featureItem) {
            const featureText = featureItem.querySelector('.feature-text');
            if (featureText) {
                featureText.textContent = feature;
            }
        }
    });
    
    // 填充爱情分析
    document.getElementById('loveAnalysis').textContent = testResult.loveAnalysis;
    document.getElementById('idealPartner').textContent = testResult.idealPartner;
    document.getElementById('loveAdvice').textContent = testResult.loveAdvice;
    
    // 填充职业信息
    const careerTags = document.getElementById('careerTags');
    careerTags.innerHTML = testResult.careers.map(career => 
        `<span class="career-tag">${career}</span>`
    ).join('');
    
    const workAdvantages = document.getElementById('workAdvantages');
    workAdvantages.innerHTML = testResult.workAdvantages.map(advantage => 
        `<li>${advantage}</li>`
    ).join('');
    
    document.getElementById('careerAdvice').textContent = testResult.careerAdvice;
    
    // 填充个人成长
    document.getElementById('personalityStrengths').textContent = testResult.strengths;
    document.getElementById('improvementAreas').textContent = testResult.improvements;
    document.getElementById('developmentSuggestions').textContent = testResult.development;
    
    // 填充人际关系
    document.getElementById('socialTraits').textContent = testResult.socialTraits;
    document.getElementById('interactionTips').textContent = testResult.interactionTips;
}

// 添加滑入动画
function addSlideInAnimations() {
    const sections = document.querySelectorAll('.love-section, .career-section, .growth-section, .relationship-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    sections.forEach(section => {
        section.style.animationPlayState = 'paused';
        observer.observe(section);
    });
}

// 分享结果
function shareResult() {
    if (!testResult) return;
    
    const shareText = `我的MBTI人格类型是：${testResult.type} - ${testResult.name}！${testResult.description}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'MBTI人格测试结果',
            text: shareText,
            url: window.location.origin
        }).catch(err => {
            console.log('分享失败:', err);
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
}

// 复制到剪贴板
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showMessage('结果已复制到剪贴板！');
        }).catch(() => {
            fallbackCopyTextToClipboard(text);
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

// 备用复制方法
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showMessage('结果已复制到剪贴板！');
    } catch (err) {
        showMessage('复制失败，请手动复制结果');
    }
    
    document.body.removeChild(textArea);
}

// 保存结果
function saveResult() {
    // 简单的保存功能提示
    showSaveTip();
}

function showSaveTip() {
    const message = document.createElement('div');
    message.className = 'save-message';
    message.innerHTML = `
        <div class="message-content">
            <div class="message-icon">💾</div>
            <p>结果已保存到本地存储</p>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .save-message {
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
            font-size: 2rem;
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
    
    // 保存到localStorage
    localStorage.setItem('mbtiLastResult', JSON.stringify(testResult));
    
    setTimeout(() => {
        message.remove();
        style.remove();
    }, 2000);
}

// 重新测试
function restartTest() {
    if (confirm('确定要重新开始测试吗？当前结果将会丢失。')) {
        // 清除测试数据
        localStorage.removeItem('mbtiAnswers');
        localStorage.removeItem('mbtiScores');
        localStorage.removeItem('mbtiLastResult');
        
        // 跳转到测试页面
        window.location.href = 'test.html';
    }
}

// 返回上一页
function goBack() {
    if (confirm('确定要返回吗？当前结果将会丢失。')) {
        window.history.back();
    }
}

// 显示消息提示
function showMessage(text) {
    const message = document.createElement('div');
    message.className = 'toast-message';
    message.textContent = text;
    
    const style = document.createElement('style');
    style.textContent = `
        .toast-message {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            z-index: 2001;
            animation: toastSlide 0.3s ease-out;
            font-size: 0.9rem;
        }
        
        @keyframes toastSlide {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.animation = 'toastSlide 0.3s ease reverse';
        setTimeout(() => {
            message.remove();
            style.remove();
        }, 300);
    }, 3000);
}

// 页面加载完成后的额外初始化
window.addEventListener('load', function() {
    // 添加页面加载完成的视觉反馈
    document.body.classList.add('loaded');
});