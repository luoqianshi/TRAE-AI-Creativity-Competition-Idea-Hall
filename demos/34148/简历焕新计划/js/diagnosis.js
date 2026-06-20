/**
 * 诊断工作台 - 核心逻辑文件
 * 功能：SPA 路由切换、文件上传、表单验证、状态管理、诊断模拟
 */

// ==================== 模拟诊断数据 ====================
const MOCK_DIAGNOSIS_DATA = {
    score: 70,
    scoreDesc: '简历与岗位匹配度良好，仍有优化空间',
    suggestions: [
        {
            type: 'warning',
            icon: 'warning',
            title: '技能关键词匹配不足',
            text: '建议增加 React、TypeScript 等技能关键词，提升 ATS 匹配率'
        },
        {
            type: 'info',
            icon: 'info',
            title: '工作经历描述过于简单',
            text: '建议使用 STAR 法则，量化工作成果，突出项目亮点'
        },
        {
            type: 'success',
            icon: 'success',
            title: '教育背景格式规范',
            text: '学历信息完整，建议添加相关课程或学术成果'
        }
    ],
    keywords: [
        { name: 'React', match: 85 },
        { name: 'TypeScript', match: 60 },
        { name: 'Node.js', match: 45 },
        { name: 'JavaScript', match: 90 },
        { name: 'CSS', match: 75 }
    ]
};

// ==================== 模拟岗位匹配数据 ====================
const MOCK_MATCHING_DATA = {
    score: 85,
    radarData: [
        { name: '技能匹配', value: 88 },
        { name: '经验年限', value: 75 },
        { name: '学历背景', value: 90 },
        { name: '行业相关', value: 82 },
        { name: '薪资预期', value: 78 },
        { name: '综合评分', value: 85 }
    ],
    jobs: [
        {
            title: '高级前端开发工程师',
            company: '字节跳动',
            reason: '您的 React、TypeScript 技能与该岗位要求高度重合，工作经验也十分匹配',
            salary: '25-40K'
        },
        {
            title: '前端开发工程师',
            company: '阿里巴巴',
            reason: '您的项目经验和技术栈与该岗位高度契合，具备优秀的学习能力',
            salary: '20-35K'
        },
        {
            title: '全栈开发工程师',
            company: '腾讯',
            reason: '您的全栈技术能力符合岗位需求，有丰富的项目实战经验',
            salary: '22-38K'
        }
    ]
};

// ==================== 状态管理器 ====================
const StateManager = {
    // 三种状态：idle, loading, result
    currentState: 'idle',
    
    // DOM 元素引用
    elements: {
        stateIdle: null,
        stateLoading: null,
        stateResult: null,
        loadingSteps: null,
        scoreCircle: null,
        scoreNumber: null,
        scoreDesc: null,
        suggestionsList: null,
        keywordsList: null,
        diagnosisBtn: null,
        btnLoading: null,
        btnIcon: null,
        btnText: null
    },

    /**
     * 初始化状态管理器
     */
    init() {
        this.elements.stateIdle = document.getElementById('state-idle');
        this.elements.stateLoading = document.getElementById('state-loading');
        this.elements.stateResult = document.getElementById('state-result');
        this.elements.loadingSteps = document.querySelectorAll('.loading-step');
        this.elements.scoreCircle = document.getElementById('score-circle');
        this.elements.scoreNumber = document.getElementById('score-number');
        this.elements.scoreDesc = document.getElementById('score-desc');
        this.elements.suggestionsList = document.getElementById('suggestions-list');
        this.elements.keywordsList = document.getElementById('keywords-list');
        this.elements.diagnosisBtn = document.getElementById('diagnosis-btn');
        this.elements.btnLoading = document.getElementById('btn-loading');
        this.elements.btnIcon = this.elements.diagnosisBtn?.querySelector('.btn-icon');
        this.elements.btnText = this.elements.diagnosisBtn?.querySelector('.btn-text');
        
        // 默认显示空闲状态
        this.setState('idle');
    },

    /**
     * 切换状态
     * @param {string} state - 'idle' | 'loading' | 'result'
     */
    setState(state) {
        this.currentState = state;
        
        // 隐藏所有状态容器
        if (this.elements.stateIdle) this.elements.stateIdle.classList.add('hidden');
        if (this.elements.stateLoading) this.elements.stateLoading.classList.add('hidden');
        if (this.elements.stateResult) this.elements.stateResult.classList.add('hidden');

        // 显示目标状态容器
        switch (state) {
            case 'idle':
                if (this.elements.stateIdle) this.elements.stateIdle.classList.remove('hidden');
                this.setButtonEnabled(true);
                break;
            case 'loading':
                if (this.elements.stateLoading) this.elements.stateLoading.classList.remove('hidden');
                this.setButtonEnabled(false);
                this.startLoadingAnimation();
                break;
            case 'result':
                if (this.elements.stateResult) this.elements.stateResult.classList.remove('hidden');
                this.setButtonEnabled(true);
                break;
        }

        console.log(`状态切换: ${state}`);
    },

    /**
     * 设置按钮是否可用
     * @param {boolean} enabled
     */
    setButtonEnabled(enabled) {
        if (!this.elements.diagnosisBtn) return;
        
        if (enabled) {
            this.elements.diagnosisBtn.disabled = false;
            this.elements.diagnosisBtn.classList.remove('btn-disabled');
            if (this.elements.btnLoading) this.elements.btnLoading.classList.add('hidden');
            if (this.elements.btnIcon) this.elements.btnIcon.classList.remove('hidden');
            if (this.elements.btnText) this.elements.btnText.classList.remove('hidden');
        } else {
            this.elements.diagnosisBtn.disabled = true;
            this.elements.diagnosisBtn.classList.add('btn-disabled');
            if (this.elements.btnLoading) this.elements.btnLoading.classList.remove('hidden');
            if (this.elements.btnIcon) this.elements.btnIcon.classList.add('hidden');
            if (this.elements.btnText) this.elements.btnText.classList.add('hidden');
        }
    },

    /**
     * 启动 Loading 动画（逐步显示步骤）
     */
    startLoadingAnimation() {
        // 重置所有步骤状态
        this.elements.loadingSteps?.forEach(step => {
            step.classList.remove('step-active', 'step-completed');
        });

        // 逐步激活每个步骤
        const steps = this.elements.loadingSteps || [];
        let currentStep = 0;
        
        const activateStep = () => {
            if (currentStep > 0 && steps[currentStep - 1]) {
                steps[currentStep - 1].classList.remove('step-active');
                steps[currentStep - 1].classList.add('step-completed');
            }
            
            if (currentStep < steps.length) {
                steps[currentStep].classList.add('step-active');
                currentStep++;
                
                if (currentStep < steps.length) {
                    setTimeout(activateStep, 600);
                }
            }
        };

        // 开始第一步
        setTimeout(activateStep, 200);
    },

    /**
     * 渲染诊断结果
     * @param {Object} data - 诊断数据
     */
    renderResult(data) {
        // 渲染分数（带动画）
        this.animateScore(data.score);
        
        // 渲染分数描述
        if (this.elements.scoreDesc) {
            this.elements.scoreDesc.textContent = data.scoreDesc;
        }

        // 渲染建议列表
        this.renderSuggestions(data.suggestions);

        // 渲染关键词匹配度
        this.renderKeywords(data.keywords);
    },

    /**
     * 分数动画
     * @param {number} targetScore - 目标分数
     */
    animateScore(targetScore) {
        if (!this.elements.scoreCircle || !this.elements.scoreNumber) return;

        // 圆环动画：stroke-dashoffset 从 251.2 到目标值
        // 分数计算：offset = 251.2 * (1 - score/100)
        const circumference = 251.2;
        const targetOffset = circumference * (1 - targetScore / 100);
        
        // 数字动画：从 0 到目标分数
        let currentScore = 0;
        const duration = 1500; // 1.5秒
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用 easeOutQuart 缓动函数
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            
            // 更新数字
            currentScore = Math.round(targetScore * easeProgress);
            this.elements.scoreNumber.textContent = currentScore;
            
            // 更新圆环
            const currentOffset = circumference * (1 - (targetScore * easeProgress) / 100);
            this.elements.scoreCircle.style.strokeDashoffset = currentOffset;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    },

    /**
     * 渲染建议列表
     * @param {Array} suggestions
     */
    renderSuggestions(suggestions) {
        if (!this.elements.suggestionsList) return;
        
        this.elements.suggestionsList.innerHTML = suggestions.map(s => `
            <div class="suggestion-item">
                <div class="suggestion-icon suggestion-icon-${s.icon}">
                    ${this.getSuggestionIconSVG(s.icon)}
                </div>
                <div class="suggestion-content">
                    <div class="suggestion-title">${s.title}</div>
                    <div class="suggestion-text">${s.text}</div>
                </div>
                <button class="suggestion-action" data-suggestion="${s.text}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>复制</span>
                </button>
            </div>
        `).join('');
    },

    /**
     * 获取建议图标 SVG
     * @param {string} type
     */
    getSuggestionIconSVG(type) {
        const icons = {
            warning: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>`,
            info: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`,
            success: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`
        };
        return icons[type] || icons.info;
    },

    /**
     * 渲染关键词匹配度
     * @param {Array} keywords
     */
    renderKeywords(keywords) {
        if (!this.elements.keywordsList) return;
        
        this.elements.keywordsList.innerHTML = keywords.map(k => `
            <div class="keyword-item">
                <span class="keyword-tag">${k.name}</span>
                <div class="keyword-bar-bg">
                    <div class="keyword-bar-fill" style="width: 0%" data-target="${k.match}"></div>
                </div>
                <span class="keyword-percent">${k.match}%</span>
            </div>
        `).join('');

        // 延迟启动进度条动画
        setTimeout(() => {
            this.animateKeywordBars();
        }, 300);
    },

    /**
     * 关键词进度条动画
     */
    animateKeywordBars() {
        const bars = this.elements.keywordsList?.querySelectorAll('.keyword-bar-fill');
        bars?.forEach(bar => {
            const target = bar.dataset.target || 0;
            bar.style.transition = 'width 1s ease-out';
            bar.style.width = `${target}%`;
        });
    },

    /**
     * 重置到初始状态
     */
    reset() {
        this.setState('idle');
        
        // 清空结果内容
        if (this.elements.suggestionsList) this.elements.suggestionsList.innerHTML = '';
        if (this.elements.keywordsList) this.elements.keywordsList.innerHTML = '';
        if (this.elements.scoreNumber) this.elements.scoreNumber.textContent = '0';
        if (this.elements.scoreCircle) this.elements.scoreCircle.style.strokeDashoffset = '251.2';
    }
};

// ==================== SPA 路由管理 ====================
const Router = {
    pages: {
        home: document.getElementById('page-home'),
        diagnosis: document.getElementById('page-diagnosis'),
        matching: document.getElementById('page-matching'),
        workspace: document.getElementById('page-workspace'),
        settings: document.getElementById('page-settings'),
    },
    navLinks: {
        home: document.getElementById('nav-home'),
        diagnosis: document.getElementById('nav-diagnosis'),
        matching: document.getElementById('nav-matching'),
        workspace: document.getElementById('nav-workspace'),
        settings: document.getElementById('nav-settings'),
    },

    /**
     * 切换到指定页面
     * @param {string} pageName - 页面名称 ('home' | 'diagnosis' | 'matching' | 'workspace' | 'settings')
     */
    navigateTo(pageName) {
        // 隐藏所有页面
        Object.values(this.pages).forEach(page => {
            if (page) page.classList.add('hidden');
        });

        // 显示目标页面
        if (this.pages[pageName]) {
            this.pages[pageName].classList.remove('hidden');
        }

        // 更新导航状态
        Object.keys(this.navLinks).forEach(key => {
            const link = this.navLinks[key];
            if (link) {
                if (key === pageName) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            }
        });

        // 滚动到顶部
        const homePage = document.getElementById('page-home');
        if (homePage) homePage.scrollTop = 0;

        // 如果切换到诊断页面，重置状态
        if (pageName === 'diagnosis') {
            StateManager.reset();
        }

        // 如果切换到匹配页面，重置状态
        if (pageName === 'matching') {
            MatchingStateManager.reset();
        }

        console.log(`导航到: ${pageName}`);
    }
};

// ==================== 文件上传管理 ====================
const FileUploader = {
    input: document.getElementById('resume-upload'),
    card: document.querySelector('.upload-card'),
    info: document.getElementById('upload-info'),
    filename: document.getElementById('upload-filename'),
    removeBtn: document.getElementById('remove-upload'),
    currentFile: null,

    /**
     * 初始化文件上传功能
     */
    init() {
        if (!this.input || !this.card) return;

        // 文件选择事件
        this.input.addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        // 拖拽事件
        this.card.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.card.classList.add('dragover');
        });

        this.card.addEventListener('dragleave', () => {
            this.card.classList.remove('dragover');
        });

        this.card.addEventListener('drop', (e) => {
            e.preventDefault();
            this.card.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFiles(files);
            }
        });

        // 移除文件按钮
        if (this.removeBtn) {
            this.removeBtn.addEventListener('click', () => {
                this.removeFile();
            });
        }
    },

    /**
     * 处理文件选择
     */
    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.handleFiles(files);
        }
    },

    /**
     * 处理文件
     */
    handleFiles(files) {
        const file = files[0];

        // 验证文件类型
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            showToast('请上传 PDF 或 Word 文件', 'error');
            return;
        }

        // 验证文件大小（10MB）
        if (file.size > 10 * 1024 * 1024) {
            showToast('文件大小不能超过 10MB', 'error');
            return;
        }

        this.currentFile = file;
        this.showFileInfo(file.name);
        showToast('文件上传成功', 'success');
    },

    /**
     * 显示文件信息
     */
    showFileInfo(name) {
        if (this.info && this.filename) {
            this.filename.textContent = name;
            this.info.classList.remove('hidden');
        }
        if (this.card) {
            this.card.classList.add('hidden');
        }
    },

    /**
     * 移除文件
     */
    removeFile() {
        this.currentFile = null;
        if (this.input) {
            this.input.value = '';
        }
        if (this.info) {
            this.info.classList.add('hidden');
        }
        if (this.card) {
            this.card.classList.remove('hidden');
        }
    },

    /**
     * 获取当前文件
     */
    getFile() {
        return this.currentFile;
    }
};

// ==================== 表单验证 ====================
const FormValidator = {
    companyInput: document.getElementById('target-company'),
    positionInput: document.getElementById('target-position'),
    jdInput: document.getElementById('job-description'),

    /**
     * 获取表单数据
     */
    getFormData() {
        return {
            company: this.companyInput?.value.trim() || '',
            position: this.positionInput?.value.trim() || '',
            jd: this.jdInput?.value.trim() || ''
        };
    },

    /**
     * 验证表单
     */
    validate() {
        const data = this.getFormData();

        if (!data.position) {
            showToast('请填写应聘职位', 'error');
            this.positionInput?.focus();
            return false;
        }

        return true;
    }
};

// ==================== 诊断逻辑 ====================
const DiagnosisController = {
    /**
     * 初始化诊断功能
     */
    init() {
        const btn = document.getElementById('diagnosis-btn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            this.startDiagnosis();
        });
    },

    /**
     * 开始诊断
     */
    startDiagnosis() {
        // 检查 API Key
        const apiKey = getApiKey();
        if (!apiKey) {
            showToast('请先配置 API Key', 'error');
            document.getElementById('settings-btn')?.click();
            return;
        }

        // 验证表单
        if (!FormValidator.validate()) {
            return;
        }

        // 检查文件
        const file = FileUploader.getFile();
        if (!file) {
            showToast('请上传简历文件', 'error');
            return;
        }

        // 切换到 Loading 状态
        StateManager.setState('loading');

        // 模拟诊断过程（2.5秒后显示结果）
        setTimeout(() => {
            this.completeDiagnosis();
        }, 2500);
    },

    /**
     * 完成诊断
     */
    completeDiagnosis() {
        // 切换到结果状态
        StateManager.setState('result');
        
        // 渲染模拟数据
        StateManager.renderResult(MOCK_DIAGNOSIS_DATA);

        // 显示成功提示
        showToast('诊断完成！请查看优化建议', 'success');

        // 打印模拟数据到控制台
        console.log('=== 诊断模拟数据 ===');
        console.log('API Key:', getApiKey());
        console.log('文件:', FileUploader.getFile()?.name);
        console.log('表单数据:', FormValidator.getFormData());
        console.log('=== 诊断结果 ===');
        console.log(MOCK_DIAGNOSIS_DATA);
    }
};

// ==================== 初始化函数 ====================
function initDiagnosis() {
    // 初始化状态管理器
    StateManager.init();

    // 初始化文件上传
    FileUploader.init();

    // 初始化诊断功能
    DiagnosisController.init();

    // 绑定导航事件
    const navHome = document.getElementById('nav-home');
    const navDiagnosis = document.getElementById('nav-diagnosis');
    const heroCtaBtn = document.getElementById('hero-cta-btn');

    if (navHome) {
        navHome.addEventListener('click', (e) => {
            e.preventDefault();
            Router.navigateTo('home');
        });
    }

    if (navDiagnosis) {
        navDiagnosis.addEventListener('click', (e) => {
            e.preventDefault();
            Router.navigateTo('diagnosis');
        });
    }

    if (heroCtaBtn) {
        heroCtaBtn.addEventListener('click', () => {
            Router.navigateTo('diagnosis');
        });
    }

    // 绑定建议项复制按钮事件（事件委托）
    const resultContainer = document.getElementById('result-container');
    if (resultContainer) {
        resultContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.suggestion-action');
            if (!btn) return;

            const text = btn.dataset.suggestion;
            if (!text) return;

            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    showToast('建议已复制到剪贴板', 'success');
                }).catch(() => {
                    showToast('复制失败，请手动复制', 'error');
                });
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    showToast('建议已复制到剪贴板', 'success');
                } catch (err) {
                    showToast('复制失败，请手动复制', 'error');
                }
                document.body.removeChild(textarea);
            }
        });
    }

    console.log('诊断工作台初始化完成');
}

// ==================== 岗位匹配状态管理器 ====================
const MatchingStateManager = {
    currentState: 'idle',
    
    elements: {
        stateIdle: null,
        stateLoading: null,
        stateResult: null,
        scoreCircle: null,
        scoreNumber: null,
        radarPolygon: null,
        jobsList: null,
        matchingBtn: null,
        btnLoading: null,
        btnIcon: null,
        btnText: null,
        locationTags: null
    },

    selectedLocations: [],

    init() {
        this.elements.stateIdle = document.getElementById('matching-idle');
        this.elements.stateLoading = document.getElementById('matching-loading-state');
        this.elements.stateResult = document.getElementById('matching-result');
        this.elements.scoreCircle = document.getElementById('match-score-circle');
        this.elements.scoreNumber = document.getElementById('match-score-number');
        this.elements.radarPolygon = document.getElementById('radar-polygon');
        this.elements.jobsList = document.getElementById('recommend-jobs');
        this.elements.matchingBtn = document.getElementById('matching-btn');
        this.elements.btnLoading = document.getElementById('matching-loading');
        this.elements.btnIcon = this.elements.matchingBtn?.querySelector('.btn-icon');
        this.elements.btnText = this.elements.matchingBtn?.querySelector('.btn-text');
        this.elements.locationTags = document.querySelectorAll('.location-tag');

        this.setState('idle');
        this.initLocationTags();
    },

    setState(state) {
        this.currentState = state;

        if (this.elements.stateIdle) this.elements.stateIdle.classList.add('hidden');
        if (this.elements.stateLoading) this.elements.stateLoading.classList.add('hidden');
        if (this.elements.stateResult) this.elements.stateResult.classList.add('hidden');

        switch (state) {
            case 'idle':
                if (this.elements.stateIdle) this.elements.stateIdle.classList.remove('hidden');
                this.setButtonEnabled(true);
                break;
            case 'loading':
                if (this.elements.stateLoading) this.elements.stateLoading.classList.remove('hidden');
                this.setButtonEnabled(false);
                break;
            case 'result':
                if (this.elements.stateResult) this.elements.stateResult.classList.remove('hidden');
                this.setButtonEnabled(true);
                break;
        }
    },

    setButtonEnabled(enabled) {
        if (!this.elements.matchingBtn) return;
        
        if (enabled) {
            this.elements.matchingBtn.disabled = false;
            this.elements.matchingBtn.classList.remove('btn-disabled');
            if (this.elements.btnLoading) this.elements.btnLoading.classList.add('hidden');
            if (this.elements.btnIcon) this.elements.btnIcon.classList.remove('hidden');
            if (this.elements.btnText) this.elements.btnText.classList.remove('hidden');
        } else {
            this.elements.matchingBtn.disabled = true;
            this.elements.matchingBtn.classList.add('btn-disabled');
            if (this.elements.btnLoading) this.elements.btnLoading.classList.remove('hidden');
            if (this.elements.btnIcon) this.elements.btnIcon.classList.add('hidden');
            if (this.elements.btnText) this.elements.btnText.classList.add('hidden');
        }
    },

    initLocationTags() {
        this.elements.locationTags?.forEach(tag => {
            tag.addEventListener('click', () => {
                const location = tag.dataset.location;
                if (!location) return;

                const index = this.selectedLocations.indexOf(location);
                if (index > -1) {
                    this.selectedLocations.splice(index, 1);
                    tag.classList.remove('selected');
                } else {
                    this.selectedLocations.push(location);
                    tag.classList.add('selected');
                }
            });
        });
    },

    renderResult(data) {
        this.animateScore(data.score);
        this.animateRadar(data.radarData);
        this.renderJobs(data.jobs);
    },

    animateScore(targetScore) {
        if (!this.elements.scoreCircle || !this.elements.scoreNumber) return;

        const circumference = 251.2;
        const targetOffset = circumference * (1 - targetScore / 100);
        
        let currentScore = 0;
        const duration = 1500;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 4);
            
            currentScore = Math.round(targetScore * easeProgress);
            this.elements.scoreNumber.textContent = currentScore;
            
            const currentOffset = circumference * (1 - (targetScore * easeProgress) / 100);
            this.elements.scoreCircle.style.strokeDashoffset = currentOffset;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    },

    animateRadar(radarData) {
        if (!this.elements.radarPolygon) return;

        const centerX = 100;
        const centerY = 100;
        const maxRadius = 80;
        
        const points = radarData.map((item, index) => {
            const angle = (Math.PI * 2 * index) / radarData.length - Math.PI / 2;
            const radius = (item.value / 100) * maxRadius;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return `${x},${y}`;
        }).join(' ');

        this.elements.radarPolygon.setAttribute('points', points);
        this.elements.radarPolygon.style.transition = 'all 1.5s ease-out';
        this.elements.radarPolygon.style.opacity = '1';
    },

    renderJobs(jobs) {
        if (!this.elements.jobsList) return;
        
        this.elements.jobsList.innerHTML = jobs.map((job, index) => `
            <div class="job-card" style="transition-delay: ${index * 200}ms">
                <div class="job-info">
                    <div class="job-title">${job.title}</div>
                    <div class="job-company">${job.company} · ${job.salary}</div>
                    <div class="job-reason">${job.reason}</div>
                </div>
                <button class="job-action-btn">一键投递</button>
            </div>
        `).join('');

        setTimeout(() => {
            const cards = this.elements.jobsList.querySelectorAll('.job-card');
            cards.forEach(card => {
                card.classList.add('animate-in');
            });
        }, 100);
    },

    reset() {
        this.setState('idle');
        
        if (this.elements.jobsList) this.elements.jobsList.innerHTML = '';
        if (this.elements.scoreNumber) this.elements.scoreNumber.textContent = '0';
        if (this.elements.scoreCircle) this.elements.scoreCircle.style.strokeDashoffset = '251.2';
        if (this.elements.radarPolygon) {
            this.elements.radarPolygon.style.opacity = '0';
            this.elements.radarPolygon.setAttribute('points', '100,100 100,100 100,100 100,100 100,100 100,100');
        }
    }
};

// ==================== 岗位匹配控制器 ====================
const MatchingController = {
    init() {
        const btn = document.getElementById('matching-btn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            this.startMatching();
        });

        const jobContainer = document.getElementById('recommend-jobs');
        if (jobContainer) {
            jobContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.job-action-btn');
                if (!btn) return;
                showToast('简历已投递！', 'success');
            });
        }
    },

    startMatching() {
        const apiKey = getApiKey();
        if (!apiKey) {
            showToast('请先配置 API Key', 'error');
            document.getElementById('settings-btn')?.click();
            return;
        }

        MatchingStateManager.setState('loading');

        setTimeout(() => {
            this.completeMatching();
        }, 2500);
    },

    completeMatching() {
        MatchingStateManager.setState('result');
        MatchingStateManager.renderResult(MOCK_MATCHING_DATA);
        showToast('匹配完成！请查看推荐岗位', 'success');

        console.log('=== 岗位匹配模拟数据 ===');
        console.log('筛选条件:', {
            position: document.getElementById('match-position')?.value,
            salaryMin: document.getElementById('salary-min')?.value,
            salaryMax: document.getElementById('salary-max')?.value,
            locations: MatchingStateManager.selectedLocations
        });
        console.log('=== 匹配结果 ===');
        console.log(MOCK_MATCHING_DATA);
    }
};

// ==================== 扩展路由和初始化 ====================
function initMatching() {
    MatchingStateManager.init();
    MatchingController.init();

    const navMatching = document.getElementById('nav-matching');
    if (navMatching) {
        navMatching.addEventListener('click', (e) => {
            e.preventDefault();
            Router.navigateTo('matching');
        });
    }

    console.log('岗位匹配页面初始化完成');
}

// ==================== 设置页面控制器 ====================
const SettingsController = {
    init() {
        this.initMenuSwitching();
        this.initApiKeyToggle();
        this.initToggleSwitches();
        this.initSaveButtons();
    },

    initMenuSwitching() {
        const menuItems = document.querySelectorAll('.settings-menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const target = item.dataset.settings;
                if (!target) return;

                menuItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                const panels = document.querySelectorAll('.settings-panel');
                panels.forEach(p => p.classList.add('hidden'));
                
                const targetPanel = document.getElementById(`settings-${target}`);
                if (targetPanel) {
                    targetPanel.classList.remove('hidden');
                }
            });
        });
    },

    initApiKeyToggle() {
        const toggleBtn = document.getElementById('toggle-api-key');
        const apiInput = document.getElementById('settings-api-key');
        const eyeIcon = document.getElementById('api-key-eye');
        const eyeOffIcon = document.getElementById('api-key-eye-off');

        if (!toggleBtn || !apiInput) return;

        toggleBtn.addEventListener('click', () => {
            if (apiInput.type === 'password') {
                apiInput.type = 'text';
                eyeIcon.classList.add('hidden');
                eyeOffIcon.classList.remove('hidden');
            } else {
                apiInput.type = 'password';
                eyeIcon.classList.remove('hidden');
                eyeOffIcon.classList.add('hidden');
            }
        });

        const savedKey = getApiKey();
        if (savedKey && apiInput) {
            apiInput.value = savedKey;
        }
    },

    initToggleSwitches() {
        const toggles = document.querySelectorAll('.toggle-switch');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
            });
        });
    },

    initSaveButtons() {
        const saveBtns = document.querySelectorAll('.settings-save-btn');
        saveBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const apiInput = document.getElementById('settings-api-key');
                if (apiInput) {
                    const key = apiInput.value.trim();
                    if (key) {
                        saveApiKey(key);
                        showToast('配置已保存', 'success');
                    }
                }
                showToast('设置已保存', 'success');
            });
        });
    }
};

// ==================== 初始化所有页面 ====================
function initAllPages() {
    initDiagnosis();
    initMatching();
    SettingsController.init();

    const navWorkspace = document.getElementById('nav-workspace');
    if (navWorkspace) {
        navWorkspace.addEventListener('click', (e) => {
            e.preventDefault();
            Router.navigateTo('workspace');
        });
    }

    const navSettings = document.getElementById('nav-settings');
    if (navSettings) {
        navSettings.addEventListener('click', (e) => {
            e.preventDefault();
            Router.navigateTo('settings');
        });
    }

    const workspaceUploadBtn = document.getElementById('workspace-upload-btn');
    if (workspaceUploadBtn) {
        workspaceUploadBtn.addEventListener('click', () => {
            showToast('上传功能开发中', 'info');
        });
    }

    const workspaceCards = document.querySelectorAll('.workspace-card-action');
    workspaceCards.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showToast('查看详情功能开发中', 'info');
        });
    });

    console.log('所有页面初始化完成');
}

// 页面加载完成后初始化所有功能
document.addEventListener('DOMContentLoaded', initAllPages);