// 智能客群助手 - 核心交互逻辑

// ==================== 数据定义 ====================

// 标签库
const tagLibrary = [
    // 人口属性
    { id: 'gender_female', name: '女性', category: 'demographic', categoryName: '人口属性' },
    { id: 'gender_male', name: '男性', category: 'demographic', categoryName: '人口属性' },
    { id: 'age_18_24', name: '18-24岁', category: 'demographic', categoryName: '人口属性' },
    { id: 'age_25_35', name: '25-35岁', category: 'demographic', categoryName: '人口属性' },
    { id: 'age_36_45', name: '36-45岁', category: 'demographic', categoryName: '人口属性' },
    { id: 'age_46_60', name: '46-60岁', category: 'demographic', categoryName: '人口属性' },
    { id: 'city_tier1', name: '一线城市', category: 'demographic', categoryName: '人口属性' },
    { id: 'city_tier2', name: '二线城市', category: 'demographic', categoryName: '人口属性' },
    { id: 'city_tier3', name: '三线及以下', category: 'demographic', categoryName: '人口属性' },
    { id: 'income_high', name: '高收入', category: 'demographic', categoryName: '人口属性' },
    { id: 'income_mid', name: '中等收入', category: 'demographic', categoryName: '人口属性' },
    { id: 'occupation_white_collar', name: '白领', category: 'demographic', categoryName: '人口属性' },
    { id: 'occupation_student', name: '学生', category: 'demographic', categoryName: '人口属性' },
    { id: 'occupation_freelance', name: '自由职业', category: 'demographic', categoryName: '人口属性' },
    
    // 行为属性
    { id: 'reg_recent_30d', name: '近30天注册', category: 'behavior', categoryName: '行为属性' },
    { id: 'reg_recent_90d', name: '近90天注册', category: 'behavior', categoryName: '行为属性' },
    { id: 'active_recent_7d', name: '近7天活跃', category: 'behavior', categoryName: '行为属性' },
    { id: 'active_recent_30d', name: '近30天活跃', category: 'behavior', categoryName: '行为属性' },
    { id: 'login_freq_high', name: '高频登录', category: 'behavior', categoryName: '行为属性' },
    { id: 'login_freq_low', name: '低频登录', category: 'behavior', categoryName: '行为属性' },
    { id: 'browse_clothing', name: '浏览服饰', category: 'behavior', categoryName: '行为属性' },
    { id: 'browse_beauty', name: '浏览美妆', category: 'behavior', categoryName: '行为属性' },
    { id: 'browse_electronics', name: '浏览数码', category: 'behavior', categoryName: '行为属性' },
    { id: 'browse_food', name: '浏览食品', category: 'behavior', categoryName: '行为属性' },
    { id: 'cart_active', name: '加购活跃', category: 'behavior', categoryName: '行为属性' },
    { id: 'wishlist_active', name: '收藏活跃', category: 'behavior', categoryName: '行为属性' },
    
    // 消费特征
    { id: 'order_recent_7d', name: '近7天有订单', category: 'consumption', categoryName: '消费特征' },
    { id: 'order_recent_30d', name: '近30天有订单', category: 'consumption', categoryName: '消费特征' },
    { id: 'order_recent_90d', name: '近90天有订单', category: 'consumption', categoryName: '消费特征' },
    { id: 'order_clothing', name: '购买过服饰', category: 'consumption', categoryName: '消费特征' },
    { id: 'order_beauty', name: '购买过美妆', category: 'consumption', categoryName: '消费特征' },
    { id: 'order_electronics', name: '购买过数码', category: 'consumption', categoryName: '消费特征' },
    { id: 'avg_order_high', name: '高客单价', category: 'consumption', categoryName: '消费特征' },
    { id: 'avg_order_mid', name: '中等客单价', category: 'consumption', categoryName: '消费特征' },
    { id: 'buy_freq_high', name: '高频购买', category: 'consumption', categoryName: '消费特征' },
    { id: 'buy_freq_low', name: '低频购买', category: 'consumption', categoryName: '消费特征' },
    { id: 'payment_alipay', name: '支付宝用户', category: 'consumption', categoryName: '消费特征' },
    { id: 'payment_wechat', name: '微信支付用户', category: 'consumption', categoryName: '消费特征' },
    
    // 偏好兴趣
    { id: 'pref_fashion', name: '时尚偏好', category: 'preference', categoryName: '偏好兴趣' },
    { id: 'pref_quality', name: '品质偏好', category: 'preference', categoryName: '偏好兴趣' },
    { id: 'pref_price', name: '价格敏感', category: 'preference', categoryName: '偏好兴趣' },
    { id: 'pref_brand', name: '品牌偏好', category: 'preference', categoryName: '偏好兴趣' },
    { id: 'pref_new', name: '新品偏好', category: 'preference', categoryName: '偏好兴趣' },
    { id: 'pref_promotion', name: '促销敏感', category: 'preference', categoryName: '偏好兴趣' },
    { id: 'interest_beauty', name: '美妆兴趣', category: 'preference', categoryName: '偏好兴趣' },
    { id: 'interest_fitness', name: '健身兴趣', category: 'preference', categoryName: '偏好兴趣' },
    { id: 'interest_travel', name: '旅游兴趣', category: 'preference', categoryName: '偏好兴趣' },
    { id: 'interest_reading', name: '阅读兴趣', category: 'preference', categoryName: '偏好兴趣' },
    { id: 'interest_gaming', name: '游戏兴趣', category: 'preference', categoryName: '偏好兴趣' },
    { id: 'interest_pet', name: '宠物兴趣', category: 'preference', categoryName: '偏好兴趣' }
];

// 关键词映射（用于AI推荐）
const keywordMapping = {
    '女': ['gender_female'],
    '女性': ['gender_female'],
    '男': ['gender_male'],
    '男性': ['gender_male'],
    '18': ['age_18_24'],
    '20': ['age_18_24'],
    '25': ['age_25_35'],
    '30': ['age_25_35'],
    '35': ['age_25_35', 'age_36_45'],
    '40': ['age_36_45'],
    '45': ['age_36_45', 'age_46_60'],
    '50': ['age_46_60'],
    '一线': ['city_tier1'],
    '二线': ['city_tier2'],
    '三线': ['city_tier3'],
    '白领': ['occupation_white_collar'],
    '学生': ['occupation_student'],
    '自由': ['occupation_freelance'],
    '高收入': ['income_high'],
    '中等收入': ['income_mid'],
    '高消费': ['avg_order_high'],
    '高价值': ['avg_order_high', 'buy_freq_high'],
    '低频': ['login_freq_low', 'buy_freq_low'],
    '高频': ['login_freq_high', 'buy_freq_high'],
    '活跃': ['active_recent_7d', 'active_recent_30d'],
    '新用户': ['reg_recent_30d'],
    '新人': ['reg_recent_30d'],
    '注册': ['reg_recent_30d', 'reg_recent_90d'],
    '流失': ['login_freq_low', 'active_recent_30d'],
    '预警': ['login_freq_low'],
    '促销': ['pref_promotion'],
    '敏感': ['pref_promotion', 'pref_price'],
    '价格': ['pref_price'],
    '便宜': ['pref_price'],
    '优惠': ['pref_promotion'],
    '折扣': ['pref_promotion'],
    '品牌': ['pref_brand'],
    '品质': ['pref_quality'],
    '时尚': ['pref_fashion'],
    '潮流': ['pref_fashion'],
    '新品': ['pref_new'],
    '女装': ['gender_female', 'order_clothing', 'browse_clothing'],
    '男装': ['gender_male', 'order_clothing', 'browse_clothing'],
    '服饰': ['order_clothing', 'browse_clothing'],
    '衣服': ['order_clothing', 'browse_clothing'],
    '美妆': ['order_beauty', 'browse_beauty', 'interest_beauty'],
    '化妆品': ['order_beauty', 'browse_beauty'],
    '数码': ['order_electronics', 'browse_electronics'],
    '电子': ['order_electronics', 'browse_electronics'],
    '食品': ['browse_food'],
    '美食': ['browse_food'],
    '健身': ['interest_fitness'],
    '运动': ['interest_fitness'],
    '旅游': ['interest_travel'],
    '旅行': ['interest_travel'],
    '阅读': ['interest_reading'],
    '读书': ['interest_reading'],
    '游戏': ['interest_gaming'],
    '宠物': ['interest_pet'],
    '猫': ['interest_pet'],
    '狗': ['interest_pet'],
    '支付宝': ['payment_alipay'],
    '微信': ['payment_wechat'],
    '白领': ['occupation_white_collar'],
    '上班族': ['occupation_white_collar'],
    '加购': ['cart_active'],
    '收藏': ['wishlist_active'],
    '购物车': ['cart_active']
};

// 快速模板
const templates = {
    'high-value': '我想找到过去3个月消费金额排名前20%、复购次数超过2次、客单价在500元以上的高价值用户，用于会员专属活动',
    'churn-risk': '帮我找出过去30天没有登录、但过去曾经高频购买的沉默用户，用于流失召回活动',
    'new-user': '找到最近7天内注册的新用户，年龄18-30岁，想要进行新人专享优惠活动',
    'promotion': '我想筛选出对价格敏感、经常参与促销活动、收藏/加购活跃但下单犹豫的用户'
};

// 历史方案示例
const historySchemes = [
    {
        id: 1,
        name: '双11高价值女性用户',
        tags: ['gender_female', 'age_25_35', 'city_tier1', 'avg_order_high'],
        count: 12580,
        percent: 12.5,
        date: '2026-06-20',
        logic: 'and'
    },
    {
        id: 2,
        name: '新人专享活动客群',
        tags: ['reg_recent_30d', 'age_18_24', 'pref_promotion'],
        count: 8930,
        percent: 8.9,
        date: '2026-06-18',
        logic: 'and'
    },
    {
        id: 3,
        name: '流失用户召回',
        tags: ['login_freq_low', 'buy_freq_high'],
        count: 5620,
        percent: 5.6,
        date: '2026-06-15',
        logic: 'and'
    },
    {
        id: 4,
        name: '美妆爱好者群体',
        tags: ['order_beauty', 'interest_beauty', 'gender_female'],
        count: 21350,
        percent: 21.3,
        date: '2026-06-10',
        logic: 'and'
    }
];

// ==================== 状态管理 ====================

let currentStep = 1;
let selectedTags = [];
let currentLogic = 'and';
let currentInput = '';
let currentScheme = null;

// ==================== 工具函数 ====================

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

function formatNumber(num) {
    if (num >= 10000) {
        return (num / 10000).toFixed(1) + '万';
    }
    return num.toLocaleString();
}

function getTagById(id) {
    return tagLibrary.find(tag => tag.id === id);
}

// ==================== 标签页切换 ====================

function initTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            
            if (targetTab === 'history') {
                renderHistoryList();
            }
        });
    });
}

// ==================== 步骤导航 ====================

function goToStep(step) {
    // 更新步骤指示器
    document.querySelectorAll('.step').forEach((el, index) => {
        el.classList.remove('active', 'completed');
        if (index + 1 < step) {
            el.classList.add('completed');
        } else if (index + 1 === step) {
            el.classList.add('active');
        }
    });
    
    // 更新步骤线
    document.querySelectorAll('.step-line').forEach((line, index) => {
        line.style.backgroundColor = index + 1 < step ? 'var(--success-color)' : 'var(--border-color)';
    });
    
    // 切换面板
    document.querySelectorAll('.step-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`step-${step}`).classList.add('active');
    
    currentStep = step;
}

function initStepNavigation() {
    // 返回按钮
    document.getElementById('btn-back-1').addEventListener('click', () => goToStep(1));
    document.getElementById('btn-back-2').addEventListener('click', () => goToStep(2));
    document.getElementById('btn-back-3').addEventListener('click', () => goToStep(3));
    
    // 前进按钮
    document.getElementById('btn-to-step-3').addEventListener('click', () => {
        if (selectedTags.length === 0) {
            showToast('请至少选择一个标签');
            return;
        }
        renderSelectedTags();
        renderLibraryTags();
        goToStep(3);
    });
    
    document.getElementById('btn-to-step-4').addEventListener('click', () => {
        generateScheme();
        goToStep(4);
    });
}

// ==================== AI 分析 ====================

function analyzeInput(input) {
    const matchedTags = new Set();
    const matchedKeywords = [];
    
    // 关键词匹配
    for (const [keyword, tagIds] of Object.entries(keywordMapping)) {
        if (input.includes(keyword)) {
            tagIds.forEach(id => matchedTags.add(id));
            matchedKeywords.push(keyword);
        }
    }
    
    // 分类标签
    const core = [];
    const extended = [];
    const filters = [];
    
    matchedTags.forEach(tagId => {
        const tag = getTagById(tagId);
        if (!tag) return;
        
        // 根据分类决定推荐级别
        if (tag.category === 'demographic') {
            core.push(tag);
        } else if (tag.category === 'consumption') {
            core.push(tag);
        } else if (tag.category === 'behavior') {
            extended.push(tag);
        } else {
            filters.push(tag);
        }
    });
    
    // 如果没有匹配到，给默认推荐
    if (core.length === 0 && extended.length === 0 && filters.length === 0) {
        core.push(getTagById('active_recent_30d'));
        extended.push(getTagById('pref_promotion'));
    }
    
    return {
        core,
        extended,
        filters,
        keywords: matchedKeywords,
        intent: generateIntentText(input, matchedKeywords)
    };
}

function generateIntentText(input, keywords) {
    if (keywords.length === 0) {
        return '未能识别具体标签偏好，建议提供更详细的人群描述，如年龄、性别、消费行为等特征。已为你推荐通用活跃标签。';
    }
    
    let intent = 'AI理解你的需求是：寻找';
    
    if (keywords.includes('女') || keywords.includes('女性')) {
        intent += '女性';
    } else if (keywords.includes('男') || keywords.includes('男性')) {
        intent += '男性';
    }
    
    const ageKeywords = keywords.filter(k => k.includes('岁') || ['18', '25', '30', '35', '40', '45', '50'].includes(k));
    if (ageKeywords.length > 0) {
        intent += '、年龄在' + ageKeywords.slice(0, 2).join('/') + '区间';
    }
    
    if (keywords.some(k => k.includes('一线') || k.includes('二线') || k.includes('三线'))) {
        intent += '、特定城市层级';
    }
    
    if (keywords.some(k => k.includes('消费') || k.includes('购买') || k.includes('订单'))) {
        intent += '、有消费行为';
    }
    
    if (keywords.some(k => k.includes('活跃') || k.includes('登录'))) {
        intent += '、活跃度高';
    }
    
    intent += '的用户群体，用于精准营销活动。已为你推荐最匹配的标签组合，可根据实际需求调整。';
    
    return intent;
}

// ==================== 标签渲染 ====================

function createTagElement(tag, isSelected = false, onClick = null) {
    const el = document.createElement('div');
    el.className = `tag-item ${isSelected ? 'selected' : ''}`;
    el.innerHTML = `
        <span>${tag.name}</span>
        <span class="tag-category">${tag.categoryName}</span>
    `;
    if (onClick) {
        el.addEventListener('click', onClick);
    }
    return el;
}

function renderRecommendedTags(analysis) {
    // 渲染核心标签
    const coreContainer = document.getElementById('core-tags');
    coreContainer.innerHTML = '';
    analysis.core.forEach(tag => {
        const isSelected = selectedTags.some(st => st.id === tag.id);
        coreContainer.appendChild(createTagElement(tag, isSelected, () => toggleTag(tag)));
    });
    
    // 渲染扩展标签
    const extendedContainer = document.getElementById('extended-tags');
    extendedContainer.innerHTML = '';
    analysis.extended.forEach(tag => {
        const isSelected = selectedTags.some(st => st.id === tag.id);
        extendedContainer.appendChild(createTagElement(tag, isSelected, () => toggleTag(tag)));
    });
    
    // 渲染过滤条件
    const filterContainer = document.getElementById('filter-tags');
    filterContainer.innerHTML = '';
    analysis.filters.forEach(tag => {
        const isSelected = selectedTags.some(st => st.id === tag.id);
        filterContainer.appendChild(createTagElement(tag, isSelected, () => toggleTag(tag)));
    });
}

function toggleTag(tag) {
    const index = selectedTags.findIndex(st => st.id === tag.id);
    if (index > -1) {
        selectedTags.splice(index, 1);
    } else {
        selectedTags.push(tag);
    }
    
    // 更新当前显示的推荐标签选中状态
    document.querySelectorAll('.tag-item').forEach(el => {
        const tagName = el.querySelector('span').textContent;
        const tagObj = tagLibrary.find(t => t.name === tagName);
        if (tagObj) {
            el.classList.toggle('selected', selectedTags.some(st => st.id === tagObj.id));
        }
    });
    
    updatePreview();
}

// ==================== 客群预估 ====================

function estimateAudience() {
    // 模拟客群规模计算
    const baseCount = 100000; // 假设总用户10万
    let factor = 1;
    
    if (selectedTags.length === 0) return { count: 0, percent: 0, quality: 0 };
    
    // 根据标签数量调整
    if (currentLogic === 'and') {
        factor = Math.pow(0.6, selectedTags.length);
    } else {
        factor = Math.min(0.3 + selectedTags.length * 0.15, 0.8);
    }
    
    // 根据标签类型微调
    selectedTags.forEach(tag => {
        if (tag.category === 'demographic') factor *= 0.9;
        if (tag.category === 'consumption') factor *= 0.7;
        if (tag.category === 'behavior') factor *= 0.8;
    });
    
    const count = Math.round(baseCount * factor);
    const percent = (factor * 100).toFixed(1);
    const quality = Math.min(60 + selectedTags.length * 8, 98).toFixed(0);
    
    return { count, percent, quality };
}

function updatePreview() {
    const estimate = estimateAudience();
    
    document.getElementById('preview-count').textContent = estimate.count > 0 ? formatNumber(estimate.count) : '--';
    document.getElementById('preview-percent').textContent = estimate.count > 0 ? estimate.percent + '%' : '--%';
    document.getElementById('preview-quality').textContent = estimate.count > 0 ? estimate.quality : '--';
    
    const chartFill = document.getElementById('audience-chart-fill');
    chartFill.style.width = estimate.percent + '%';
}

// ==================== 标签库 ====================

function renderLibraryTags(category = 'all', search = '') {
    const container = document.getElementById('library-tags');
    container.innerHTML = '';
    
    let filtered = tagLibrary;
    
    if (category !== 'all') {
        filtered = filtered.filter(tag => tag.category === category);
    }
    
    if (search) {
        filtered = filtered.filter(tag => tag.name.includes(search));
    }
    
    filtered.forEach(tag => {
        const isAdded = selectedTags.some(st => st.id === tag.id);
        const el = document.createElement('div');
        el.className = `library-tag ${isAdded ? 'added' : ''}`;
        el.textContent = tag.name;
        
        if (!isAdded) {
            el.addEventListener('click', () => {
                selectedTags.push(tag);
                renderLibraryTags(category, search);
                renderSelectedTags();
                updatePreview();
            });
        }
        
        container.appendChild(el);
    });
}

function renderSelectedTags() {
    const container = document.getElementById('selected-tags-list');
    container.innerHTML = '';
    
    selectedTags.forEach((tag, index) => {
        const el = document.createElement('div');
        el.className = 'selected-tag-item';
        el.innerHTML = `
            <span>${tag.name}</span>
            <span class="remove-tag" data-index="${index}">
                <i class="fas fa-times"></i>
            </span>
        `;
        
        el.querySelector('.remove-tag').addEventListener('click', () => {
            selectedTags.splice(index, 1);
            renderSelectedTags();
            renderLibraryTags();
            updatePreview();
        });
        
        container.appendChild(el);
    });
}

function initLibrarySearch() {
    const searchInput = document.getElementById('tag-search');
    const categoryBtns = document.querySelectorAll('.category-btn');
    let currentCategory = 'all';
    
    searchInput.addEventListener('input', (e) => {
        renderLibraryTags(currentCategory, e.target.value);
    });
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderLibraryTags(currentCategory, searchInput.value);
        });
    });
}

function initLogicConfig() {
    const logicInputs = document.querySelectorAll('input[name="logic"]');
    logicInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            currentLogic = e.target.value;
            updatePreview();
        });
    });
}

// ==================== 方案生成 ====================

function generateScheme() {
    const estimate = estimateAudience();
    
    currentScheme = {
        name: '智能推荐客群',
        tags: [...selectedTags],
        count: estimate.count,
        percent: estimate.percent,
        quality: estimate.quality,
        logic: currentLogic,
        date: new Date().toISOString().split('T')[0]
    };
    
    // 更新方案名称
    document.getElementById('scheme-name').textContent = currentScheme.name;
    
    // 更新圈选条件
    const schemeTagsContainer = document.getElementById('scheme-tags');
    schemeTagsContainer.innerHTML = '';
    currentScheme.tags.forEach(tag => {
        const el = document.createElement('div');
        el.className = 'scheme-tag';
        el.innerHTML = `
            <span>${tag.name}</span>
            <span class="tag-logic">${currentLogic === 'and' ? '且' : '或'}</span>
        `;
        schemeTagsContainer.appendChild(el);
    });
    
    // 更新客群画像
    renderPersonaCards();
    
    // 更新统计数据
    document.getElementById('final-count').textContent = formatNumber(currentScheme.count);
    document.getElementById('final-percent').textContent = currentScheme.percent + '%';
    document.getElementById('final-accuracy').textContent = currentScheme.quality;
    
    // 预估价值（模拟）
    const value = Math.round(currentScheme.count * 150 * (currentScheme.quality / 100));
    document.getElementById('final-value').textContent = '¥' + formatNumber(value);
}

function renderPersonaCards() {
    const container = document.getElementById('persona-cards');
    container.innerHTML = '';
    
    const personas = [];
    
    // 根据标签生成画像
    const hasFemale = selectedTags.some(t => t.id === 'gender_female');
    const hasMale = selectedTags.some(t => t.id === 'gender_male');
    const hasAge2535 = selectedTags.some(t => t.id === 'age_25_35');
    const hasAge1824 = selectedTags.some(t => t.id === 'age_18_24');
    const hasTier1 = selectedTags.some(t => t.id === 'city_tier1');
    const hasHighValue = selectedTags.some(t => t.id === 'avg_order_high');
    const hasClothing = selectedTags.some(t => t.id === 'order_clothing');
    const hasBeauty = selectedTags.some(t => t.id === 'order_beauty');
    
    if (hasFemale || (!hasMale && !hasFemale)) {
        personas.push({ icon: 'fa-venus', label: '主要性别', value: '女性' });
    } else if (hasMale) {
        personas.push({ icon: 'fa-mars', label: '主要性别', value: '男性' });
    }
    
    if (hasAge2535) {
        personas.push({ icon: 'fa-birthday-cake', label: '主要年龄', value: '25-35岁' });
    } else if (hasAge1824) {
        personas.push({ icon: 'fa-birthday-cake', label: '主要年龄', value: '18-24岁' });
    } else {
        personas.push({ icon: 'fa-birthday-cake', label: '主要年龄', value: '25-40岁' });
    }
    
    if (hasTier1) {
        personas.push({ icon: 'fa-city', label: '主要城市', value: '一线城市' });
    } else {
        personas.push({ icon: 'fa-city', label: '主要城市', value: '一二线城市' });
    }
    
    if (hasHighValue) {
        personas.push({ icon: 'fa-gem', label: '消费层级', value: '高消费' });
    } else {
        personas.push({ icon: 'fa-shopping-bag', label: '消费层级', value: '中等消费' });
    }
    
    if (hasClothing) {
        personas.push({ icon: 'fa-tshirt', label: '偏好品类', value: '服饰' });
    } else if (hasBeauty) {
        personas.push({ icon: 'fa-magic', label: '偏好品类', value: '美妆' });
    } else {
        personas.push({ icon: 'fa-heart', label: '偏好品类', value: '综合' });
    }
    
    personas.forEach(persona => {
        const el = document.createElement('div');
        el.className = 'persona-card';
        el.innerHTML = `
            <div class="persona-icon">
                <i class="fas ${persona.icon}"></i>
            </div>
            <div class="persona-label">${persona.label}</div>
            <div class="persona-value">${persona.value}</div>
        `;
        container.appendChild(el);
    });
}

// ==================== 历史记录 ====================

function renderHistoryList() {
    const container = document.getElementById('history-list');
    container.innerHTML = '';
    
    historySchemes.forEach(scheme => {
        const el = document.createElement('div');
        el.className = 'history-item';
        el.innerHTML = `
            <div class="history-info">
                <h4>${scheme.name}</h4>
                <div class="history-meta">
                    <span><i class="fas fa-users"></i> ${formatNumber(scheme.count)}人</span>
                    <span><i class="fas fa-percentage"></i> 占比${scheme.percent}%</span>
                    <span><i class="fas fa-calendar"></i> ${scheme.date}</span>
                    <span><i class="fas fa-tag"></i> ${scheme.tags.length}个标签</span>
                </div>
            </div>
            <div class="history-actions">
                <button class="btn-icon" title="查看">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon" title="复制">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="btn-icon" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(el);
    });
}

// ==================== 快速模板 ====================

function initTemplates() {
    const templateChips = document.querySelectorAll('.template-chip');
    const textarea = document.getElementById('user-input');
    
    templateChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const templateKey = chip.dataset.template;
            textarea.value = templates[templateKey];
            textarea.focus();
        });
    });
}

// ==================== 按钮事件 ====================

function initButtons() {
    // AI分析按钮
    document.getElementById('btn-analyze').addEventListener('click', () => {
        const input = document.getElementById('user-input').value.trim();
        
        if (!input) {
            showToast('请先描述你的目标人群');
            return;
        }
        
        currentInput = input;
        
        // 显示加载状态
        const btn = document.getElementById('btn-analyze');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<div class="loading"></div> AI分析中...';
        btn.disabled = true;
        
        // 模拟AI分析延迟
        setTimeout(() => {
            const analysis = analyzeInput(input);
            
            // 渲染AI理解的意图
            document.getElementById('intent-text').textContent = analysis.intent;
            
            // 默认选中核心标签
            selectedTags = [...analysis.core];
            
            // 渲染推荐标签
            renderRecommendedTags(analysis);
            
            // 更新预览
            updatePreview();
            
            // 恢复按钮
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            
            // 进入步骤2
            goToStep(2);
            
            showToast('AI分析完成，为你推荐了 ' + selectedTags.length + ' 个核心标签');
        }, 1500);
    });
    
    // 清空按钮
    document.querySelector('.btn-clear').addEventListener('click', () => {
        document.getElementById('user-input').value = '';
        document.getElementById('user-input').focus();
    });
    
    // 保存方案按钮
    document.getElementById('btn-save-scheme').addEventListener('click', () => {
        if (currentScheme) {
            historySchemes.unshift({
                ...currentScheme,
                id: Date.now()
            });
            showToast('方案已保存到历史记录');
        }
    });
    
    // 导出按钮
    document.getElementById('btn-export').addEventListener('click', () => {
        showToast('人群包导出成功！');
    });
    
    // 编辑名称按钮
    document.getElementById('btn-edit-name').addEventListener('click', () => {
        const newName = prompt('请输入方案名称:', currentScheme?.name || '智能推荐客群');
        if (newName) {
            document.getElementById('scheme-name').textContent = newName;
            if (currentScheme) {
                currentScheme.name = newName;
            }
        }
    });
}

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initStepNavigation();
    initTemplates();
    initButtons();
    initLibrarySearch();
    initLogicConfig();
    
    // 初始化历史记录
    renderHistoryList();
    
    console.log('智能客群助手已加载完成');
});