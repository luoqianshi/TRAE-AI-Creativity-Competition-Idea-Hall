const API_BASE_URL = '/api';

const MOOD_CONFIG = {
    happy: { label: '开心', emoji: '😊' },
    sad: { label: '难过', emoji: '😢' },
    angry: { label: '生气', emoji: '😤' },
    anxious: { label: '焦虑', emoji: '😰' },
    calm: { label: '平静', emoji: '😌' },
    confused: { label: '困惑', emoji: '😕' }
};

const articles = [
    {
        id: '1',
        title: '如何缓解焦虑情绪',
        summary: '焦虑是一种常见的情绪体验，了解其成因并掌握有效的应对方法，能够帮助我们更好地管理情绪。',
        content: '<p>焦虑是一种常见的情绪体验，它可能由多种因素引起，包括工作压力、人际关系、未来不确定性等。以下是一些缓解焦虑的有效方法：</p><p><strong>1. 深呼吸练习</strong>：通过腹式呼吸，慢慢吸气4秒，屏住呼吸4秒，再慢慢呼气4秒。</p><p><strong>2. 正念冥想</strong>：专注于当下的感受，观察自己的思维而不评判。</p><p><strong>3. 身体运动</strong>：适当的运动可以释放压力激素，改善情绪。</p><p><strong>4. 合理规划</strong>：将任务分解成小目标，避免 overwhelm。</p><p><strong>5. 寻求支持</strong>：与信任的人分享感受，获得情感支持。</p><p>请记住，焦虑是正常的，重要的是学会与它和平共处。</p>',
        coverImage: 'https://picsum.photos/id/1015/750/400',
        category: '情绪管理',
        createdAt: '2024-01-15'
    },
    {
        id: '2',
        title: '情绪日记的力量',
        summary: '记录情绪可以帮助我们更好地了解自己，发现情绪模式，从而做出积极改变。',
        content: '<p>情绪日记是一种简单而有效的自我觉察工具。通过每天记录自己的情绪状态，我们可以：</p><p><strong>1. 识别情绪触发点</strong>：发现哪些事件会引起特定的情绪反应。</p><p><strong>2. 追踪情绪变化</strong>：了解自己的情绪波动规律。</p><p><strong>3. 释放压抑情绪</strong>：通过书写来表达和释放内心的感受。</p><p><strong>4. 培养自我关怀</strong>：学会关注自己的内心需求。</p><p>建议每天花10-15分钟记录，可以包括：当天的情绪状态、引起情绪的事件、身体的感受、应对策略。</p><p>坚持记录，你会发现自己对情绪的掌控力逐渐增强。</p>',
        coverImage: 'https://picsum.photos/id/1018/750/400',
        category: '自我成长',
        createdAt: '2024-01-12'
    },
    {
        id: '3',
        title: '建立健康的边界',
        summary: '学会说"不"是保护心理健康的重要技能，建立健康的边界能够减少压力和疲惫。',
        content: '<p>在人际关系中，建立健康的边界非常重要。很多人因为不懂得拒绝他人，导致自己身心疲惫。</p><p><strong>什么是健康的边界？</strong></p><p>- 明确自己的需求和底线</p><p>- 尊重他人的边界</p><p>- 能够优雅地说"不"</p><p><strong>如何建立边界？</strong></p><p><strong>1. 自我觉察</strong>：了解自己的情绪和需求。</p><p><strong>2. 明确表达</strong>：清晰地告诉他人你的界限。</p><p><strong>3. 坚持原则</strong>：不要因为他人的反应而轻易妥协。</p><p><strong>4. 自我关怀</strong>：拒绝后不要自责，这是保护自己的必要方式。</p><p>请记住，你的时间和精力是有限的，优先照顾好自己才能更好地照顾他人。</p>',
        coverImage: 'https://picsum.photos/id/1036/750/400',
        category: '人际关系',
        createdAt: '2024-01-10'
    },
    {
        id: '4',
        title: '睡眠与心理健康',
        summary: '良好的睡眠是心理健康的基础，了解睡眠的重要性并改善睡眠质量。',
        content: '<p>睡眠不仅是身体休息的时间，也是大脑处理情绪和记忆的重要时刻。</p><p><strong>睡眠对心理健康的影响：</strong></p><p>- 缺乏睡眠会加剧焦虑和抑郁情绪</p><p>- 充足的睡眠有助于情绪调节</p><p>- 睡眠质量影响日间的情绪状态</p><p><strong>改善睡眠的方法：</strong></p><p><strong>1. 建立规律的作息</strong>：每天在同一时间上床和起床。</p><p><strong>2. 创造舒适的睡眠环境</strong>：保持卧室黑暗、安静、凉爽。</p><p><strong>3. 避免睡前使用电子设备</strong>：蓝光会抑制褪黑素分泌。</p><p><strong>4. 进行放松活动</strong>：睡前可以进行阅读、冥想或温水浴。</p><p><strong>5. 限制咖啡因和酒精摄入</strong>：尤其是在下午和晚上。</p><p>给自己一个良好的睡眠，是对心理健康最好的投资。</p>',
        coverImage: 'https://picsum.photos/id/1039/750/400',
        category: '健康生活',
        createdAt: '2024-01-08'
    },
    {
        id: '5',
        title: '接纳不完美的自己',
        summary: '完美主义常常带来压力和焦虑，学会接纳自己的不完美是心理健康的重要一步。',
        content: '<p>在这个追求完美的社会中，我们常常对自己过于苛刻。但事实上，不完美才是真实的人生。</p><p><strong>完美主义的陷阱：</strong></p><p>- 过度自我批评</p><p>- 害怕失败</p><p>- 拖延症</p><p>- 持续的焦虑感</p><p><strong>如何接纳不完美？</strong></p><p><strong>1. 认识到完美是不存在的</strong>：每个人都有缺点和不足。</p><p><strong>2. 关注进步而非完美</strong>：庆祝每一个小成就。</p><p><strong>3. 练习自我同情</strong>：像对待朋友一样对待自己。</p><p><strong>4. 接受失败是成长的一部分</strong>：从错误中学习。</p><p><strong>5. 关注内在价值</strong>：你的价值不取决于你的表现。</p><p>记住，你已经足够好。接纳自己，包括那个不完美的部分。</p>',
        coverImage: 'https://picsum.photos/id/1044/750/400',
        category: '自我成长',
        createdAt: '2024-01-05'
    },
    {
        id: '6',
        title: '压力管理的实用技巧',
        summary: '生活中充满了各种压力源，掌握有效的压力管理技巧能够帮助我们保持平衡。',
        content: '<p>压力是生活中不可避免的一部分，但我们可以学会管理它，不让它控制我们的生活。</p><p><strong>常见的压力源：</strong></p><p>- 工作压力</p><p>- 经济压力</p><p>- 人际关系</p><p>- 健康问题</p><p><strong>压力管理技巧：</strong></p><p><strong>1. 时间管理</strong>：优先处理重要的事情，学会分配时间。</p><p><strong>2. 放松技巧</strong>：如冥想、瑜伽、深呼吸等。</p><p><strong>3. 保持积极心态</strong>：关注事物的积极面。</p><p><strong>4. 保持社交联系</strong>：与朋友和家人保持良好的沟通。</p><p><strong>5. 培养兴趣爱好</strong>：做一些能让你忘记时间的事情。</p><p><strong>6. 寻求专业帮助</strong>：如果压力过大，不要犹豫寻求心理咨询。</p><p>管理压力是一个持续的过程，找到适合自己的方法最重要。</p>',
        coverImage: 'https://picsum.photos/id/1015/750/400',
        category: '情绪管理',
        createdAt: '2024-01-03'
    }
];

let selectedMood = null;
let chatMessages = [];

function init() {
    updateGreeting();
    setupEventListeners();
    loadMoodRecords();
    loadChatSessions();
    renderArticles();
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = '你好';
    if (hour < 6) greeting = '夜深了';
    else if (hour < 12) greeting = '早上好';
    else if (hour < 14) greeting = '中午好';
    else if (hour < 18) greeting = '下午好';
    else greeting = '晚上好';
    
    document.getElementById('greeting-text').textContent = greeting;
    
    const now = new Date();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
    document.getElementById('date-text').textContent = dateStr;
}

function setupEventListeners() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const page = e.target.dataset.page;
            switchPage(page);
        });
    });

    document.querySelectorAll('.mood-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const mood = e.currentTarget.dataset.mood;
            selectMood(mood);
        });
    });

    document.getElementById('save-mood-btn').addEventListener('click', saveMood);

    document.querySelectorAll('.shortcut-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const page = e.currentTarget.dataset.page;
            switchPage(page);
        });
    });

    document.getElementById('send-btn').addEventListener('click', sendMessage);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchRecordsTab(tab);
        });
    });

    document.getElementById('search-input').addEventListener('input', (e) => {
        const keyword = e.target.value;
        filterArticles(keyword, getSelectedCategory());
    });

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            selectCategory(category);
        });
    });

    document.getElementById('close-article-btn').addEventListener('click', closeArticle);
}

function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

    if (pageId === 'treehole') {
        loadChatMessages();
    } else if (pageId === 'records') {
        loadMoodRecords();
        loadChatSessions();
    }
}

function selectMood(mood) {
    selectedMood = mood;
    document.querySelectorAll('.mood-card').forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.mood === mood) {
            card.classList.add('selected');
        }
    });
}

async function saveMood() {
    if (!selectedMood) {
        alert('请选择心情');
        return;
    }
    
    const note = document.getElementById('mood-note').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/mood`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mood: selectedMood, note })
        });
        
        const data = await response.json();
        if (data.success) {
            alert('心情记录成功！');
            selectedMood = null;
            document.querySelectorAll('.mood-card').forEach(card => card.classList.remove('selected'));
            document.getElementById('mood-note').value = '';
            loadMoodRecords();
        } else {
            alert('记录失败，请重试');
        }
    } catch (error) {
        console.error('Save mood error:', error);
        alert('记录失败，请检查网络');
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const content = input.value.trim();
    
    if (!content) return;

    const sendBtn = document.getElementById('send-btn');
    sendBtn.classList.add('disabled');
    
    addMessage(content, 'user');
    input.value = '';

    showLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content }] })
        });

        const data = await response.json();
        
        if (data.content) {
            addMessage(data.content, 'assistant');
        } else {
            addMessage('抱歉，我无法回答你的问题。', 'assistant');
        }
    } catch (error) {
        console.error('Chat error:', error);
        addMessage('网络连接失败，请稍后再试。', 'assistant');
    } finally {
        showLoading(false);
        sendBtn.classList.remove('disabled');
    }
}

function addMessage(content, role) {
    const messagesContainer = document.getElementById('chat-messages');
    
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${role}`;
    bubble.textContent = content;
    
    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    chatMessages.push({ content, role });
}

function showLoading(show) {
    const messagesContainer = document.getElementById('chat-messages');
    const loadingIndicator = document.querySelector('.loading-indicator');
    
    if (show) {
        const indicator = document.createElement('div');
        indicator.className = 'loading-indicator';
        indicator.innerHTML = '<div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div>';
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else {
        const indicator = messagesContainer.querySelector('.loading-indicator');
        if (indicator) indicator.remove();
    }
}

async function loadChatMessages() {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/sessions`);
        const sessions = await response.json();
        
        const messagesContainer = document.getElementById('chat-messages');
        
        if (sessions.length > 0) {
            const latestSession = sessions[0];
            messagesContainer.innerHTML = '';
            
            latestSession.messages.forEach(msg => {
                const bubble = document.createElement('div');
                bubble.className = `message-bubble ${msg.role}`;
                bubble.textContent = msg.content;
                messagesContainer.appendChild(bubble);
            });
            
            chatMessages = latestSession.messages;
        } else {
            messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-avatar">🌳</div>
                    <h3>欢迎来到心灵树洞</h3>
                    <p>在这里，你可以放心地倾诉任何心事，我会认真倾听并陪伴你。</p>
                </div>
            `;
            chatMessages = [];
        }
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('Load chat messages error:', error);
    }
}

async function loadMoodRecords() {
    try {
        const response = await fetch(`${API_BASE_URL}/mood`);
        const records = await response.json();
        
        const container = document.getElementById('mood-records');
        
        if (records.length > 0) {
            container.innerHTML = records.map(record => {
                const config = MOOD_CONFIG[record.mood] || record.config;
                const date = new Date(record.timestamp * 1000);
                const dateStr = `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                
                return `
                    <div class="mood-record-item">
                        <div class="mood-record-header">
                            <span class="mood-record-emoji">${config.emoji}</span>
                            <div class="mood-record-info">
                                <div class="mood-record-label">${config.label}</div>
                                <div class="mood-record-date">${dateStr}</div>
                            </div>
                        </div>
                        ${record.note ? `<div class="mood-record-note">${record.note}</div>` : ''}
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📝</span>
                    <p>还没有心情记录</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Load mood records error:', error);
    }
}

async function loadChatSessions() {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/sessions`);
        const sessions = await response.json();
        
        const container = document.getElementById('chat-records');
        
        if (sessions.length > 0) {
            container.innerHTML = sessions.map(session => {
                const date = new Date(session.updated_at);
                const dateStr = `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                const lastMessage = session.messages[session.messages.length - 1];
                
                return `
                    <div class="chat-record-item" onclick="loadChatSession('${session.id}')">
                        <div class="chat-record-header">
                            <span class="chat-record-title">${session.title}</span>
                            <span class="chat-record-date">${dateStr}</span>
                        </div>
                        <div class="chat-record-preview">${lastMessage ? lastMessage.content : ''}</div>
                        <div class="chat-record-footer">
                            <button class="delete-btn" onclick="event.stopPropagation(); deleteChatSession('${session.id}')">删除</button>
                        </div>
                    </div>
                `;
            }).join('');
            
            const recentContainer = document.getElementById('recent-chats-list');
            recentContainer.innerHTML = sessions.slice(0, 3).map(session => {
                const lastMessage = session.messages[session.messages.length - 1];
                
                return `
                    <div class="chat-item" onclick="switchPage('treehole')">
                        <div class="chat-avatar">💚</div>
                        <div class="chat-info">
                            <div class="chat-title">${session.title}</div>
                            <div class="chat-preview">${lastMessage ? lastMessage.content : ''}</div>
                        </div>
                        <span class="chat-arrow">→</span>
                    </div>
                `;
            }).join('');
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">💬</span>
                    <p>还没有对话记录</p>
                </div>
            `;
            
            document.getElementById('recent-chats-list').innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">💭</span>
                    <p>还没有对话记录，去树洞说说吧</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Load chat sessions error:', error);
    }
}

async function deleteChatSession(sessionId) {
    if (!confirm('确定要删除这条对话吗？')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        if (data.success) {
            loadChatSessions();
        }
    } catch (error) {
        console.error('Delete chat session error:', error);
    }
}

function switchRecordsTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    document.querySelectorAll('.records-list').forEach(list => list.classList.remove('active'));
    document.getElementById(`${tab}-records`).classList.add('active');
}

function renderArticles() {
    const container = document.getElementById('articles-list');
    container.innerHTML = articles.map(article => `
        <div class="article-card" onclick="openArticle('${article.id}')">
            <img class="article-cover" src="${article.coverImage}" alt="${article.title}">
            <div class="article-content">
                <div class="article-title">${article.title}</div>
                <div class="article-summary">${article.summary}</div>
                <div class="article-footer">
                    <span class="category-tag">${article.category}</span>
                    <span class="article-date">${article.createdAt}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function openArticle(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;
    
    document.getElementById('article-cover').src = article.coverImage;
    document.getElementById('article-title').textContent = article.title;
    document.getElementById('article-category').textContent = article.category;
    document.getElementById('article-date').textContent = article.createdAt;
    document.getElementById('article-content').innerHTML = article.content;
    
    document.getElementById('article-detail').classList.remove('hidden');
}

function closeArticle() {
    document.getElementById('article-detail').classList.add('hidden');
}

function getSelectedCategory() {
    return document.querySelector('.category-btn.active').dataset.category;
}

function selectCategory(category) {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    const keyword = document.getElementById('search-input').value;
    filterArticles(keyword, category);
}

function filterArticles(keyword, category) {
    const filtered = articles.filter(article => {
        const matchKeyword = !keyword || 
            article.title.includes(keyword) || 
            article.summary.includes(keyword);
        const matchCategory = category === '全部' || article.category === category;
        return matchKeyword && matchCategory;
    });
    
    const container = document.getElementById('articles-list');
    
    if (filtered.length > 0) {
        container.innerHTML = filtered.map(article => `
            <div class="article-card" onclick="openArticle('${article.id}')">
                <img class="article-cover" src="${article.coverImage}" alt="${article.title}">
                <div class="article-content">
                    <div class="article-title">${article.title}</div>
                    <div class="article-summary">${article.summary}</div>
                    <div class="article-footer">
                        <span class="category-tag">${article.category}</span>
                        <span class="article-date">${article.createdAt}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📚</span>
                <p>暂无相关文章</p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', init);