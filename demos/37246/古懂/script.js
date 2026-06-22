// ===== 预设数据 =====
const presetData = {
    "学而时习之": {
        original: "学而时习之，不亦说乎",
        translation: "学习知识并经常复习实践，不是很愉快吗",
        annotations: [
            { word: "时", meaning: "在一定的时候" },
            { word: "习", meaning: "实践、演习" },
            { word: "说", meaning: "同'悦'，喜悦" }
        ],
        background: "出自《论语·学而》，孔子教弟子学习的方法——学不只是听课，还要反复练习",
        modern: "你新学了一个技能，反复练反复用，突然有一天发现已经得心应手了——那种'我居然会了'的爽感，孔子两千五百年前就用'不亦说乎'总结过了。",
        scenarios: [
            { role: "学生", emoji: "🧑‍🎓", content: "今天复习英语时，不是重新看一遍笔记，而是合上书试着默写一遍单词。写不出来的就是你没'习'透的。" },
            { role: "上班族", emoji: "💼", content: "上周学了一个新工具，今天找一个小任务刻意用它做一遍，而不是继续用老方法。" },
            { role: "运动员", emoji: "🏃", content: "今天训练完，回顾昨天的配速数据，想想哪里能改进——'时习之'不只是复习，是复盘。" }
        ],
        source: "论语·学而"
    },
    "道可道非常道": {
        original: "道可道，非常道",
        translation: "可以用语言表达的道，就不是永恒不变的道",
        annotations: [
            { word: "第一个'道'", meaning: "指宇宙的本源和规律" },
            { word: "第二个'道'", meaning: "指用语言表达" },
            { word: "常", meaning: "永恒不变的" }
        ],
        background: "出自《道德经》开篇，老子用这一句话点明——真正的道理是说不清道不明的",
        modern: "有些东西是说不清的。你学会了骑自行车，别人问你'怎么保持平衡'，你张了张嘴发现说不出来——因为你'知道'怎么骑，但那个'知道'不是用语言能表达的。老子说的就是这个意思。",
        scenarios: [
            { role: "学生", emoji: "🧑‍🎓", content: "数学题看答案觉得'我懂了'——关上答案自己做一遍，做不出来就是没真懂。能讲出来的才叫真会。" },
            { role: "上班族", emoji: "💼", content: "领导问你'这个方案你觉得怎么样'，你说'挺好的'——说不清楚好在哪里，其实是你没想透。" },
            { role: "运动员", emoji: "🏃", content: "你知道怎么跑800m，但让你写一篇800m技术要领的文章，你写不出来——你知道怎么跑，但说不出来'道'。" }
        ],
        source: "道德经·第一章"
    },
    "鱼我所欲也": {
        original: "鱼，我所欲也；熊掌，亦我所欲也。二者不可得兼",
        translation: "鱼是我想要的，熊掌也是我想要的。两样不能同时得到",
        annotations: [
            { word: "欲", meaning: "想要" },
            { word: "熊掌", meaning: "熊的脚掌，珍贵食品" },
            { word: "兼", meaning: "同时得到" }
        ],
        background: "出自《孟子·告子上》，孟子用鱼和熊掌比喻生命和道义的抉择",
        modern: "你在奶茶和减肥之间反复横跳的样子，孟子两千年前就看透了。他说'鱼和熊掌不可兼得'——不是让你放弃，是让你想清楚：你更想要哪一个。",
        scenarios: [
            { role: "学生", emoji: "🧑‍🎓", content: "今晚有3个小时空闲，打游戏还是刷题？孟子说不可兼得——想清楚你现在更需要放松还是进步。" },
            { role: "上班族", emoji: "💼", content: "两个offer摆在你面前，钱多的vs成长空间大的——选一个就别后悔另一个。" },
            { role: "运动员", emoji: "🏃", content: "今天状态不好，是咬牙硬练还是休息一天？如果休息能让你明天练得更好，那休息就是对的。" }
        ],
        source: "孟子·告子上"
    }
};

// 古籍库数据
const booksData = [
    {
        name: "论语",
        description: "孔子与弟子的对话集",
        quotes: ["学而时习之", "己所不欲勿施于人", "温故而知新"]
    },
    {
        name: "孟子",
        description: "孟子阐述仁义思想",
        quotes: ["鱼我所欲也", "生于忧患死于安乐", "天将降大任"]
    },
    {
        name: "道德经",
        description: "老子论道，五千言",
        quotes: ["道可道非常道", "上善若水", "无为而治"]
    },
    {
        name: "诗经",
        description: "最早诗歌总集",
        quotes: ["关关雎鸠", "蒹葭苍苍", "桃之夭夭"]
    },
    {
        name: "史记",
        description: "司马迁著，二十四史之首",
        quotes: ["天下熙熙皆为利来", "不飞则已一飞冲天"]
    }
];

// 加载动画文字
const loadingTexts = [
    "正在翻阅《论语》…",
    "查找历代注疏…",
    "比对不同版本…",
    "生成解读…"
];

// ===== 全局变量 =====
let currentResult = null;
let loadingInterval = null;

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initExamples();
    initAnalyzeButton();
    initModernButton();
    initBooksList();
    initFavorites();
    initTodayRecommend();
    loadDefaultFavorites();
});

// ===== Tab 切换 =====
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // 移除所有 active
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // 添加 active
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // 切换到 Tab2 时重新随机推荐
            if (tabId === 'tab2') {
                initTodayRecommend();
            }
        });
    });
}

// ===== 示例按钮 =====
function initExamples() {
    const exampleBtns = document.querySelectorAll('.example-btn');
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.dataset.text;
            document.getElementById('inputText').value = text;
        });
    });
}

// ===== 解读按钮 =====
function initAnalyzeButton() {
    document.getElementById('analyzeBtn').addEventListener('click', () => {
        const inputText = document.getElementById('inputText').value.trim();
        
        if (!inputText) {
            alert('请输入或选择古文内容');
            return;
        }
        
        // 查找预设数据
        let data = null;
        for (let key in presetData) {
            if (inputText.includes(key)) {
                data = presetData[key];
                break;
            }
        }
        
        if (!data) {
            // 如果没有匹配，使用默认数据
            alert('暂无该古文的解读数据，请尝试示例内容');
            return;
        }
        
        currentResult = data;
        showScrollAnimation(data);
    });
}

// ===== 卷轴加载动画 =====
function showScrollAnimation(data) {
    const scrollAnim = document.getElementById('scrollAnimation');
    const resultCard = document.getElementById('resultCard');
    const loadingText = document.getElementById('loadingText');
    
    // 隐藏结果，显示动画
    resultCard.classList.add('hidden');
    scrollAnim.classList.remove('hidden');
    
    // 重置动画
    scrollAnim.querySelector('.scroll-container').style.animation = 'none';
    setTimeout(() => {
        scrollAnim.querySelector('.scroll-container').style.animation = '';
    }, 10);
    
    // 文字轮播
    let currentIndex = 0;
    loadingText.textContent = loadingTexts[0];
    
    if (loadingInterval) clearInterval(loadingInterval);
    
    loadingInterval = setInterval(() => {
        currentIndex++;
        if (currentIndex >= loadingTexts.length) {
            clearInterval(loadingInterval);
            // 动画结束，显示结果
            setTimeout(() => {
                scrollAnim.classList.add('hidden');
                showResultCard(data);
            }, 800);
        } else {
            loadingText.textContent = loadingTexts[currentIndex];
        }
    }, 1500);
}

// ===== 显示结果卡片 =====
function showResultCard(data) {
    const resultCard = document.getElementById('resultCard');
    
    // 填充数据
    document.getElementById('originalText').textContent = data.original;
    document.getElementById('translationText').textContent = data.translation;
    document.getElementById('backgroundText').textContent = data.background;
    document.getElementById('modernText').textContent = data.modern;
    
    // 注释列表
    const annotationsList = document.getElementById('annotationsList');
    annotationsList.innerHTML = '';
    data.annotations.forEach(anno => {
        const item = document.createElement('span');
        item.className = 'annotation-item';
        item.textContent = `${anno.word}：${anno.meaning}`;
        item.onclick = () => showAnnotationPopup(`${anno.word}——${anno.meaning}`);
        annotationsList.appendChild(item);
    });
    
    // 场景列表
    const scenariosList = document.getElementById('scenariosList');
    scenariosList.innerHTML = '';
    data.scenarios.forEach(scenario => {
        const item = document.createElement('div');
        item.className = 'scenario-item';
        item.innerHTML = `
            <span class="scenario-role">${scenario.emoji} ${scenario.role}${scenario.note ? `（${scenario.note}）` : ''}：</span>
            ${scenario.content}
        `;
        scenariosList.appendChild(item);
    });
    
    // 更新收藏按钮状态
    updateFavoriteButton(data);
    
    // 显示卡片
    resultCard.classList.remove('hidden');
    
    // 滚动到结果
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== 注释弹窗 =====
function showAnnotationPopup(text) {
    const popup = document.getElementById('annotationPopup');
    document.getElementById('popupAnnotation').textContent = text;
    popup.classList.remove('hidden');
}

function closeAnnotationPopup() {
    document.getElementById('annotationPopup').classList.add('hidden');
}

// ===== 收藏功能 =====
function getFavorites() {
    const stored = localStorage.getItem('gudong_favorites');
    return stored ? JSON.parse(stored) : [];
}

function saveFavorites(favorites) {
    localStorage.setItem('gudong_favorites', JSON.stringify(favorites));
}

function updateFavoriteButton(data) {
    const btn = document.getElementById('favoriteBtn');
    const favorites = getFavorites();
    const isCollected = favorites.some(f => f.original === data.original);
    
    if (isCollected) {
        btn.textContent = '⭐ 已收藏';
        btn.classList.add('collected');
    } else {
        btn.textContent = '⭐ 收藏';
        btn.classList.remove('collected');
    }
    
    btn.onclick = () => toggleFavorite(data);
}

function toggleFavorite(data) {
    const favorites = getFavorites();
    const index = favorites.findIndex(f => f.original === data.original);
    
    if (index > -1) {
        // 取消收藏
        favorites.splice(index, 1);
    } else {
        // 添加收藏
        favorites.push({
            id: Date.now().toString(),
            original: data.original,
            source: data.source,
            time: new Date().toLocaleString('zh-CN')
        });
    }
    
    saveFavorites(favorites);
    updateFavoriteButton(data);
    renderFavoritesList();
}

function initFavorites() {
    renderFavoritesList();
}

function renderFavoritesList() {
    const favorites = getFavorites();
    const list = document.getElementById('favoritesList');
    const count = document.getElementById('favoriteCount');
    
    count.textContent = `${favorites.length} 条收藏`;
    
    if (favorites.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #8B2500; padding: 40px 0;">暂无收藏</p>';
        return;
    }
    
    list.innerHTML = '';
    favorites.forEach(fav => {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.innerHTML = `
            <div class="favorite-info">
                <div class="favorite-original">${fav.original}</div>
                <div class="favorite-meta">出自：${fav.source} | ${fav.time}</div>
            </div>
            <button class="delete-btn" data-id="${fav.id}">删除</button>
        `;
        
        item.querySelector('.delete-btn').onclick = () => {
            const newFavorites = favorites.filter(f => f.id !== fav.id);
            saveFavorites(newFavorites);
            renderFavoritesList();
            if (currentResult) updateFavoriteButton(currentResult);
        };
        
        list.appendChild(item);
    });
}

// 预设默认收藏
function loadDefaultFavorites() {
    const favorites = getFavorites();
    if (favorites.length === 0) {
        const defaults = [
            {
                id: '1',
                original: '学而时习之，不亦说乎',
                source: '论语·学而',
                time: '2024/1/1 12:00:00'
            },
            {
                id: '2',
                original: '道可道，非常道',
                source: '道德经·第一章',
                time: '2024/1/2 15:30:00'
            }
        ];
        saveFavorites(defaults);
        renderFavoritesList();
    }
}

// ===== Tab2: 古文今写 =====
function initTodayRecommend() {
    const keys = Object.keys(presetData);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const data = presetData[randomKey];
    
    const todayContent = document.getElementById('todayContent');
    todayContent.innerHTML = `
        <div class="today-original">${data.original}</div>
        <div class="today-modern">${data.modern}</div>
    `;
}

function initModernButton() {
    document.getElementById('modernBtn').addEventListener('click', () => {
        const inputText = document.getElementById('modernInput').value.trim();
        
        if (!inputText) {
            alert('请输入古文内容');
            return;
        }
        
        // 查找预设数据
        let data = null;
        for (let key in presetData) {
            if (inputText.includes(key)) {
                data = presetData[key];
                break;
            }
        }
        
        if (!data) {
            alert('暂无该古文的今写数据，请尝试示例内容');
            return;
        }
        
        showWritingAnimation(data);
    });
}

function showWritingAnimation(data) {
    const writingAnim = document.getElementById('writingAnimation');
    const noteResult = document.getElementById('noteResult');
    
    noteResult.classList.add('hidden');
    writingAnim.classList.remove('hidden');
    
    setTimeout(() => {
        writingAnim.classList.add('hidden');
        showNoteResult(data);
    }, 2500);
}

function showNoteResult(data) {
    const noteResult = document.getElementById('noteResult');
    const noteContent = document.getElementById('noteContent');
    const noteScenario = document.getElementById('noteScenario');
    
    noteContent.textContent = data.modern;
    
    const scenario = data.scenarios[Math.floor(Math.random() * data.scenarios.length)];
    noteScenario.textContent = `${scenario.emoji} ${scenario.role}场景：${scenario.content}`;
    
    noteResult.classList.remove('hidden');
}

// ===== Tab3: 古籍库 =====
function initBooksList() {
    const booksList = document.getElementById('booksList');
    booksList.innerHTML = '';
    
    booksData.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <div class="book-header">
                <span class="book-name">📖 ${book.name}</span>
                <span class="book-count">${book.quotes.length} 句</span>
            </div>
            <div class="book-desc">${book.description}</div>
            <div class="book-quotes">
                ${book.quotes.map(q => `<span class="quote-item" data-quote="${q}">${q}</span>`).join('')}
            </div>
        `;
        
        // 点击展开/收起
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('quote-item')) {
                // 点击名句，跳转到 Tab1
                const quote = e.target.dataset.quote;
                document.getElementById('inputText').value = quote;
                
                // 切换到 Tab1
                document.querySelector('[data-tab="tab1"]').click();
                return;
            }
            card.classList.toggle('expanded');
        });
        
        booksList.appendChild(card);
    });
}
