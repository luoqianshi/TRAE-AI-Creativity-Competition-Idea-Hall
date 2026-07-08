let historyRecords = [];
let currentAnalysis = null;

const mockResume = `张三
前端开发工程师 | 3年工作经验

个人信息
- 电话：138****8888
- 邮箱：zhangsan@example.com
- 所在地：北京

工作经历
XX科技有限公司 | 前端开发工程师 | 2023.03 - 至今
负责公司产品的前端开发工作，使用Vue框架，完成了多个项目的开发。

技能
- HTML/CSS
- JavaScript
- Vue
- 会一点React

项目经验
商城系统前端开发
使用Vue开发商城系统，包括商品列表、购物车、订单等功能。

教育背景
XX大学 | 计算机科学与技术 | 2016 - 2020`;

const mockMissingKeywords = ['TypeScript', 'Webpack', '性能优化', '组件化', 'Node.js', 'HTTP协议', 'Git', '单元测试'];
const mockExistingKeywords = ['HTML/CSS', 'JavaScript', 'Vue', 'React'];

const mockSuggestions = [
    {
        title: '量化成果表达',
        icon: 'trending-up',
        before: '负责公司产品的前端开发工作',
        after: '主导公司核心产品前端架构设计与开发，优化页面加载速度提升40%，用户体验评分提升25%'
    },
    {
        title: '技能描述完善',
        icon: 'wrench',
        before: '会一点React',
        after: '熟练掌握React生态（React Hooks、Redux），具备跨框架开发能力'
    },
    {
        title: '项目经验丰富',
        icon: 'folder-open',
        before: '使用Vue开发商城系统，包括商品列表、购物车、订单等功能',
        after: '负责电商平台全栈前端开发，从零搭建商品管理、购物车、订单系统等核心模块，日活用户10万+'
    },
    {
        title: '关键词补充',
        icon: 'tag',
        before: '',
        after: '建议补充：TypeScript、Webpack、性能优化、组件化开发等关键词'
    }
];

const mockRewriteResult = `张三
高级前端开发工程师 | 3年+企业级项目经验

📞 电话：138****8888 | 📧 邮箱：zhangsan@example.com | 🌍 所在地：北京

💼 工作经历

XX科技有限公司 | 前端开发工程师 | 2023.03 - 至今
主导公司核心产品前端架构设计与开发，负责技术选型与方案落地
- 基于Vue3+TypeScript构建企业级管理系统，代码复用率提升35%
- 优化页面首屏加载速度提升40%，用户体验评分提升25%
- 带领2人小团队完成3个重要项目的交付，按期率100%

🛠️ 专业技能

核心技能：
- Vue3 / React（熟练掌握，3年+实战经验）
- TypeScript（深度使用，类型安全开发）
- HTML5 / CSS3（精通，响应式设计专家）
- JavaScript ES6+（熟练运用现代语法）

工程能力：
- Webpack / Vite（构建工具配置优化）
- Git（代码版本管理，Code Review经验）
- 单元测试（Jest/Vitest，保障代码质量）
- 性能优化（懒加载、代码分割、缓存策略）

📚 项目经验

电商平台前端重构项目 | 技术负责人
- 项目背景：原有系统性能瓶颈明显，用户体验差
- 技术方案：采用Vue3+TypeScript重构，引入微前端架构
- 核心成果：页面加载速度提升45%，代码可维护性大幅提升，团队开发效率提升30%

企业级管理后台系统 | 核心开发者
- 负责权限管理、数据可视化、报表模块开发
- 实现复杂表单校验与动态表单生成器
- 优化大数据量列表渲染性能，支持10万+数据流畅展示

🎓 教育背景

XX大学 | 计算机科学与技术 | 本科 | 2016 - 2020
- 主修课程：数据结构、算法设计、计算机网络、数据库原理
- 毕业设计获校级优秀论文`;

function init() {
    document.getElementById('resumeText').value = mockResume;
    renderHistory();
}

function uploadResume() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.doc,.docx,.pdf';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            alert(`已选择文件：${file.name}\n\n（Demo模式下，将使用示例简历进行演示）`);
        }
    };
    input.click();
}

function analyzeResume() {
    const resumeText = document.getElementById('resumeText').value.trim();
    const targetJob = document.getElementById('targetJob').value.trim();
    
    if (!resumeText) {
        alert('请输入简历内容');
        return;
    }
    
    document.getElementById('loadingOverlay').classList.add('active');
    
    setTimeout(() => {
        document.getElementById('loadingOverlay').classList.remove('active');
        document.getElementById('resumeInput').style.display = 'none';
        document.getElementById('analysisResult').style.display = 'block';
        
        simulateAnalysis(targetJob || '前端开发工程师');
    }, 1500);
}

function simulateAnalysis(jobTitle) {
    const matchScore = Math.floor(Math.random() * 20) + 65;
    
    const scoreCircle = document.getElementById('scoreCircle');
    const scoreDeg = (matchScore / 100) * 360;
    scoreCircle.style.setProperty('--score-deg', scoreDeg + 'deg');
    document.getElementById('matchScore').textContent = matchScore + '%';
    
    renderKeywords();
    renderSuggestions();
    renderRewrite();
    renderSidebarSuggestions();
    
    historyRecords.unshift({
        id: Date.now(),
        job: jobTitle,
        score: matchScore,
        time: new Date().toLocaleString('zh-CN')
    });
    
    if (historyRecords.length > 5) {
        historyRecords.pop();
    }
    renderHistory();
}

function renderKeywords() {
    const missingContainer = document.getElementById('missingKeywords');
    const existingContainer = document.getElementById('existingKeywords');
    
    missingContainer.innerHTML = mockMissingKeywords.map(k => 
        `<span class="keyword-tag missing">${k}</span>`
    ).join('');
    
    existingContainer.innerHTML = mockExistingKeywords.map(k => 
        `<span class="keyword-tag existing">${k}</span>`
    ).join('');
}

function getIconSVG(iconName) {
    const icons = {
        'trending-up': '<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
        'wrench': '<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
        'folder-open': '<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6"/></svg>',
        'tag': '<svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'
    };
    return icons[iconName] || icons['tag'];
}

function renderSuggestions() {
    const container = document.getElementById('suggestionDetail');
    container.innerHTML = mockSuggestions.map(s => `
        <div class="suggestion-card">
            <div class="suggestion-card-header">
                ${getIconSVG(s.icon)}
                <h4>${s.title}</h4>
            </div>
            <div class="suggestion-diff">
                ${s.before ? `<div class="diff-item old">
                    <span class="diff-label">原内容</span>
                    <div class="diff-text">${s.before}</div>
                </div>` : ''}
                <div class="diff-item new">
                    <span class="diff-label">优化建议</span>
                    <div class="diff-text">${s.after}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderRewrite() {
    document.getElementById('rewriteText').textContent = mockRewriteResult;
}

function renderSidebarSuggestions() {
    const container = document.getElementById('suggestionList');
    container.innerHTML = mockSuggestions.slice(0, 3).map(s => `
        <div class="suggestion-item">
            ${getIconSVG(s.icon)}
            ${s.title}
        </div>
    `).join('');
}

function renderHistory() {
    const container = document.getElementById('historyList');
    if (historyRecords.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 20px;">暂无优化记录</div>';
        return;
    }
    container.innerHTML = historyRecords.map(r => `
        <div class="history-item">
            <div class="history-item-title">${r.job} · ${r.score}%</div>
            <div class="history-item-time">${r.time}</div>
        </div>
    `).join('');
}

function showTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    
    const tab = event.currentTarget || event.target.closest('.tab');
    if (tab) tab.classList.add('active');
    document.getElementById(tabName + 'Tab').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', init);