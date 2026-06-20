// ========== Submit Clarification Option ==========
function submitClarify(text) {
    document.getElementById('questionInput').value = text;
    submitQuestion();
}

// ========== Submit Question ==========
function submitQuestion() {
    const text = document.getElementById('questionInput').value.trim();
    const image = state.uploadedImage;

    if (!text && !image) {
        showToast('warning', '请输入问题或上传截图');
        return;
    }

    // 自动检测科目/项目（如果未选择）
    let autoDetectedSubject = null;
    if (!state.currentSubject) {
        // 排除判断题格式的问题，避免误判科目
        const isJudgmentFormat = /[。\.]$/.test(text) &&
            !/[=＝\+\-\*\/\×\÷\^\√\d].*[=＝]/.test(text) &&
            text.trim().length > 5 && text.trim().length < 50 &&
            !/^(写|生成|创建|给我|请|帮我).*(代码|程序|网页|网站)/i.test(text);
        if (!isJudgmentFormat) {
            autoDetectedSubject = detectSubjectFromQuestion(text);
        }
        if (autoDetectedSubject) {
            state.currentSubject = autoDetectedSubject;
            renderSubjects();
            // 更新界面标题
            const items = state.role === 'student' ? state.subjects : state.projects;
            const item = items.find(i => i.id === autoDetectedSubject);
            if (item) {
                const chatTitle = document.getElementById('chatTitle');
                const chatSubtitle = document.getElementById('chatSubtitle');
                chatTitle.textContent = `${item.icon} ${item.name} · AI助手`;
                chatSubtitle.textContent = `已自动识别为${item.name}${state.role === 'student' ? '科目' : '项目'}`;
                showToast('success', `已自动切换到${item.name}${state.role === 'student' ? '科目' : '项目'}`);
            }
        }
    }

    // Add user message
    const userMsg = { type: 'user', text, image };

    // Check if in game mode
    if (currentGame) {
        if (currentGame.waitingStart) {
            addChatMessage(userMsg);
            document.getElementById('questionInput').value = '';
            removeImage();
            const gameResponse = handleGameInput(text);
            if (gameResponse) {
                setTimeout(() => {
                    addChatMessage({ type: 'ai', text: gameResponse, canSaveError: false, originalQuestion: text });
                    document.getElementById('clearChatBtn').style.display = 'flex';
                }, 800);
            }
            return;
        }
        addChatMessage(userMsg);
        document.getElementById('questionInput').value = '';
        removeImage();
        const gameResponse = handleGameInput(text);
        if (gameResponse) {
            setTimeout(() => {
                addChatMessage({ type: 'ai', text: gameResponse, canSaveError: false, originalQuestion: text });
                document.getElementById('clearChatBtn').style.display = 'flex';
            }, 800);
        }
        return;
    }

    addChatMessage(userMsg);

    // Award XP for asking a question
    if (typeof LevelSystem !== 'undefined') {
        LevelSystem.addXP('askQuestion', LevelSystem.xpRewards.askQuestion, '提问');
    }

    // 每日一知：当天第一次发消息时显示
    showDailyTip();

    // Clear input
    document.getElementById('questionInput').value = '';
    removeImage();

    // Show typing indicator
    showTypingIndicator();

    // Simulate AI response with realistic delay
    const responseDelay = 300 + Math.random() * 500;
    setTimeout(async () => {
        hideTypingIndicator();
        const aiResponse = await generateAIResponse(text, image);
        addChatMessage(aiResponse);
        document.getElementById('clearChatBtn').style.display = 'flex';
    }, responseDelay);
}

// ========== Auto-detect Subject from Question ==========
function detectSubjectFromQuestion(question) {
    const q = (question || '').toLowerCase();
    const cleanQ = question || '';

    if (state.role === 'student') {
        // 数学关键词
        const mathKeywords = ['方程', '求解', '计算', '函数', '几何', '数列', '概率', '统计', '微积分', '代数',
            '三角', '向量', '矩阵', '导数', '积分', '极限', '对数', '指数', '平方', '立方',
            '面积', '体积', '周长', '角度', '弧度', '正弦', '余弦', '正切', '鸡兔', '同笼',
            '行程', '工程', '利润', '浓度', 'x=', 'y=', 'z=', 'x²', 'x^2', 'x2', '√', 'π', '∑', '∫',
            '加', '减', '乘', '除', '等于', '多少', '等于几', '结果是', '解', '算', '公式'];
        // 英语关键词
        const englishKeywords = ['english', '翻译', 'translate', 'grammar', '语法', '单词', 'vocabulary',
            'sentence', 'phrase', 'idiom', 'tense', 'verb', 'noun', 'adjective', 'adverb',
            'pronunciation', 'phonetic', '音标', '发音', '听力', 'reading', 'writing',
            'speaking', 'listening', 'essay', 'composition', '作文', '阅读理解', '完形填空',
            '不规则动词', '过去式', '过去分词', 'plural', 'singular', 'synonym', 'antonym',
            'hello', 'world', 'beautiful', 'happy', 'school', 'teacher', 'student', 'book'];
        // 语文关键词
        const chineseKeywords = ['古诗', '诗词', '文言文', '散文', '作文', '阅读理解', '修辞',
            '比喻', '拟人', '排比', '夸张', '对偶', '设问', '反问', '借代', '通感',
            '唐诗', '宋词', '元曲', '诗经', '论语', '孟子', '史记', '红楼梦', '西游记',
            '作者', '朝代', '赏析', '背诵', '默写', '字词', '成语', '典故', '意境',
            '李白', '杜甫', '苏轼', '白居易', '王维', '陶渊明', '曹操', '王安石',
            '静夜思', '春晓', '望庐山瀑布', '登鹳雀楼', '悯农', '咏鹅', '江雪'];

        for (const kw of mathKeywords) {
            if (q.includes(kw.toLowerCase()) || cleanQ.includes(kw)) return 'math';
        }
        for (const kw of englishKeywords) {
            if (q.includes(kw.toLowerCase()) || cleanQ.includes(kw)) return 'english';
        }
        for (const kw of chineseKeywords) {
            if (q.includes(kw.toLowerCase()) || cleanQ.includes(kw)) return 'chinese';
        }
        // 物理关键词
        const physicsKeywords = ['物理', '力学', '运动', '速度', '加速度', '牛顿', '功', '能', '功率', '电路', '电流', '电压', '电阻', '光学', '透镜', '反射', '折射', '热学', '比热', '声学', '焦耳', '安培', '伏特'];
        // 化学关键词
        const chemistryKeywords = ['化学', '元素', '化学式', '方程式', '反应', '酸', '碱', '盐', '摩尔', '分子', '原子', '离子', '化学键', '有机', '氧化', '还原', '溶液', '催化剂'];
        // 生物关键词
        const biologyKeywords = ['生物', '细胞', '基因', 'DNA', '蛋白质', '光合作用', '遗传', '进化', '生态系统', '食物链', '植物', '动物', '微生物', '人体', '呼吸作用', '染色体'];
        // 历史关键词
        const historyKeywords = ['历史', '朝代', '皇帝', '战争', '革命', '古代', '近代', '现代', '世界史', '条约', '文化', '制度', '事件', '年代'];
        // 政治关键词
        const politicsKeywords = ['政治', '宪法', '社会主义', '市场经济', '国情', '核心价值观', '权利', '义务'];
        // 法律咨询关键词
        const lawKeywords = ['法律', '法规', '合同', '劳动法', '消费者', '侵权', '赔偿', '起诉', '诉讼', '刑法', '民法', '婚姻', '继承', '知识产权', '交通法规', '租房', '工资', '加班', '社保'];
        // 心理健康关键词
        const mentalKeywords = ['焦虑', '压力', '抑郁', '失眠', '情绪', '心理', '紧张', '自卑', '心理健康', '人际关系', '学习压力', '考试焦虑', '家庭关系', '情绪管理'];
        // 地理关键词
        const geographyKeywords = ['地理', '七大洲', '四大洋', '经纬度', '赤道', '气候', '地形', '高原', '盆地', '平原', '长江', '黄河', '珠江', '珠穆朗玛', '喜马拉雅', '行政区划', '省份', '季风', '洋流', '板块', '时区', '地图', '等高线'];

        for (const kw of physicsKeywords) {
            if (q.includes(kw.toLowerCase()) || cleanQ.includes(kw)) return 'physics';
        }
        for (const kw of chemistryKeywords) {
            if (q.includes(kw.toLowerCase()) || cleanQ.includes(kw)) return 'chemistry';
        }
        for (const kw of biologyKeywords) {
            if (q.includes(kw.toLowerCase()) || cleanQ.includes(kw)) return 'biology';
        }
        for (const kw of historyKeywords) {
            if (q.includes(kw.toLowerCase()) || cleanQ.includes(kw)) return 'history';
        }
        for (const kw of politicsKeywords) {
            if (q.includes(kw.toLowerCase()) || cleanQ.includes(kw)) return 'politics';
        }
        for (const kw of lawKeywords) {
            if (q.includes(kw.toLowerCase()) || cleanQ.includes(kw)) return 'law';
        }
        for (const kw of mentalKeywords) {
            if (q.includes(kw.toLowerCase()) || cleanQ.includes(kw)) return 'mental';
        }
        for (const kw of geographyKeywords) {
            if (q.includes(kw.toLowerCase()) || cleanQ.includes(kw)) return 'geography';
        }

        // 检测是否包含大量英文字符（可能是英语句子）
        const englishChars = cleanQ.match(/[a-zA-Z]/g);
        if (englishChars && englishChars.length > cleanQ.length * 0.3) {
            return 'english';
        }

        // 检测是否包含数字运算表达式（支持多数字连乘/连加如 4*4*4）
        if (/\d+(?:\s*[+\-×*/x]\s*\d+)+/.test(cleanQ) || /\d+\s*只.*\d+\s*头.*\d+\s*腿/.test(cleanQ)) {
            return 'math';
        }

        // 检测是否包含中文字符
        const chineseChars = cleanQ.match(/[\u4e00-\u9fa5]/g);
        if (chineseChars && chineseChars.length > 3) {
            // 只有包含语文相关关键词时才返回语文
            const hasChineseKeyword = chineseKeywords.some(kw => cleanQ.includes(kw));
            if (hasChineseKeyword) {
                return 'chinese';
            }
            // 否则不自动识别为任何科目
            return null;
        }
    } else {
        // 工作者模式：检测项目类型
        if (q.includes('ppt') || q.includes('演示') || q.includes('幻灯片') || q.includes('汇报')) return 'ppt';
        if (q.includes('代码') || q.includes('开发') || q.includes('编程') || q.includes('程序')) return 'dev';
        if (q.includes('视频') || q.includes('剪辑') || q.includes('拍摄')) return 'video';
        if (q.includes('写作') || q.includes('文章') || q.includes('文案') || q.includes('报告')) return 'writing';
        if (q.includes('计划') || q.includes('方案') || q.includes('规划') || q.includes('策划')) return 'plan';
        if (q.includes('文件') || q.includes('文档') || q.includes('资料')) return 'files';
    }

    return null;
}

let msgIdCounter = 0;
let lastAiMsgId = null;

// ========== Last Message Action Bar ==========
function updateLastMessageActions() {
    if (!lastAiMsgId) return;

    const msgEl = document.querySelector('.chat-message[data-msg-id="' + lastAiMsgId + '"]');
    if (!msgEl) return;

    // Remove actions bar from all previous AI messages
    document.querySelectorAll('.chat-message.ai .last-msg-actions-bar').forEach(function(bar) {
        bar.remove();
    });

    // Create actions bar inside the AI message element (after chat-bubble)
    const actionsBar = document.createElement('div');
    actionsBar.className = 'last-msg-actions-bar';
    actionsBar.style.display = 'inline-flex';
    actionsBar.innerHTML =
        '<button class="msg-action-btn" onclick="copyLastAiMessage()" title="复制"><i class="fas fa-copy"></i></button>' +
        '<button class="msg-action-btn" onclick="editLastAiMessage()" title="修改"><i class="fas fa-edit"></i></button>' +
        '<button class="msg-action-btn" onclick="shareLastAiMessage()" title="分享"><i class="fas fa-share-alt"></i></button>' +
        '<button class="msg-action-btn" onclick="deleteLastAiMessage()" title="删除"><i class="fas fa-trash"></i></button>' +
        '<div class="msg-reaction-btns" style="margin-left:4px;">' +
            '<button onclick="addLastMessageReaction(\'👍\')" title="有用">👍</button>' +
            '<button onclick="addLastMessageReaction(\'👎\')" title="需改进">👎</button>' +
            '<button onclick="addLastMessageReaction(\'📌\')" title="固定">📌</button>' +
            '<button onclick="addLastMessageReaction(\'💡\')" title="灵感">💡</button>' +
        '</div>';

    // Insert after the chat-bubble inside the message
    const bubble = msgEl.querySelector('.chat-bubble');
    if (bubble && bubble.parentNode) {
        bubble.parentNode.insertBefore(actionsBar, bubble.nextSibling);
    }
}

function copyLastAiMessage() {
    const msgEl = document.querySelector('.chat-message[data-msg-id="' + lastAiMsgId + '"]');
    if (!msgEl) return;
    const textEl = msgEl.querySelector('.msg-text');
    if (textEl) {
        navigator.clipboard.writeText(textEl.textContent).then(function() {
            showToast('success', '已复制到剪贴板');
        });
    }
}

function editLastAiMessage() {
    const msgEl = document.querySelector('.chat-message[data-msg-id="' + lastAiMsgId + '"]');
    if (!msgEl) return;
    const textEl = msgEl.querySelector('.msg-text');
    if (textEl) {
        const input = document.getElementById('questionInput');
        input.value = '修改:' + textEl.textContent;
        input.focus();
    }
}

function shareLastAiMessage() {
    const msgEl = document.querySelector('.chat-message[data-msg-id="' + lastAiMsgId + '"]');
    if (!msgEl) return;
    const textEl = msgEl.querySelector('.msg-text');
    if (textEl) {
        const text = textEl.textContent;
        if (navigator.share) {
            navigator.share({ title: '智学空间 - AI回答', text: text });
        } else {
            navigator.clipboard.writeText(text).then(function() {
                showToast('success', '内容已复制，可粘贴分享');
            });
        }
    }
}

function deleteLastAiMessage() {
    const msgEl = document.querySelector('.chat-message[data-msg-id="' + lastAiMsgId + '"]');
    if (!msgEl) return;
    msgEl.style.opacity = '0';
    msgEl.style.transform = 'translateX(100px)';
    msgEl.style.transition = 'all 0.3s ease';
    setTimeout(function() {
        msgEl.remove();
        lastAiMsgId = null;
        updateLastMessageActions();
        // Also remove from chat history
        if (state.chatHistories[state.currentSubject]) {
            state.chatHistories[state.currentSubject].pop();
            StorageManager.saveChatHistory(state.currentSubject, state.chatHistories[state.currentSubject]);
        }
    }, 300);
}

function addLastMessageReaction(emoji) {
    const msgEl = document.querySelector('.chat-message[data-msg-id="' + lastAiMsgId + '"]');
    if (!msgEl) return;
    // Reuse the existing reaction system
    const fakeBtn = document.createElement('button');
    msgEl.appendChild(fakeBtn);
    addMessageReaction(fakeBtn, emoji);
    fakeBtn.remove();
}

// ========== Special Characters Panel ==========
function toggleSpecialChars() {
    const panel = document.getElementById('specialCharsPanel');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        switchSpecialCharsTab('math');
    } else {
        panel.style.display = 'none';
    }
}

function switchSpecialCharsTab(tab) {
    document.querySelectorAll('.sc-tab').forEach(function(t) {
        t.classList.remove('active');
    });
    event.target.classList.add('active');

    const content = document.getElementById('specialCharsContent');
    const chars = {
        math: ['log', 'ln', 'lim', '∫', '∑', '∏', '√', '∞', '≈', '≠', '≤', '≥', '±', '∓', '×', '÷', '°', '′', '″', '∠', '⊥', '∥', '∽', '≌', '∈', '⊂', '∪', '∩'],
        chem: ['¹', '²', '³', '⁺', '⁻', '↔', '⇌', '→', '↑', '↓', 'Δ', '°C', 'mol', 'g', 'L', 'mL', 'cm³', 'dm³', 'e⁻', 'H⁺', 'OH⁻', 'H₂O', 'CO₂'],
        greek: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Γ', 'Δ', 'Θ', 'Λ', 'Σ', 'Φ', 'Ω'],
        symbol: ['♀', '♂', '★', '☆', '♪', '♫', '☀', '☁', '☂', '☃', '✓', '✗', '→', '←', '↑', '↓', '⇒', '⇔', '…', '—', '–', '•', '◆', '◇', '□', '■']
    };

    let html = '<div class="sc-grid">';
    (chars[tab] || []).forEach(function(c) {
        html += '<button class="sc-char-btn" onclick="insertSpecialChar(\'' + c + '\')">' + c + '</button>';
    });
    html += '</div>';
    content.innerHTML = html;
}

function insertSpecialChar(char) {
    const input = document.getElementById('questionInput');
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    input.value = text.substring(0, start) + char + text.substring(end);
    input.focus();
    input.setSelectionRange(start + char.length, start + char.length);
}

function addChatMessage(msg) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `chat-message ${msg.type}`;
    div.dataset.msgId = ++msgIdCounter;

    let contentHtml = '';
    if (msg.image) {
        contentHtml += `<img class="msg-image" src="${msg.image}" alt="uploaded">`;
    }
    if (msg.text) {
        const isShort = msg.text.length <= 24;
        const shortClass = isShort ? ' short-msg' : '';
        const textContent = msg.type === 'user' ? escapeHtml(msg.text) : msg.text;
        contentHtml += `<div class="msg-text${shortClass}">${textContent}</div>`;
    }
    if (msg.type === 'ai' && msg.canSaveError) {
        contentHtml += `<button class="save-error-btn" onclick="saveToErrorBook(this)" data-question="${escapeHtml(msg.originalQuestion)}" data-answer="${escapeHtml(msg.text)}"><i class="fas fa-book-open"></i> 保存到错题本</button>`;
    }

    const userAvatar = state.currentUser?.avatar || (state.currentUser?.isGuest ? '😀' : null) || '😀';
    const avatarHtml = msg.type === 'ai'
        ? `<i class="fas fa-robot"></i>`
        : (userAvatar.startsWith('data:') ? `<img src="${userAvatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : userAvatar);

    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    div.innerHTML = `
        <div class="chat-avatar">${avatarHtml}</div>
        <div>
            <div class="chat-bubble">${contentHtml}</div>
            <div class="msg-timestamp">${timeStr}</div>
        </div>
    `;

    // Apply avatar frame for user messages
    if (msg.type === 'user' && state.currentUser && !state.currentUser.isGuest) {
        const avatarEl = div.querySelector('.chat-avatar');
        if (avatarEl && typeof AvatarFrameSystem !== 'undefined') {
            let frameId = state.currentUser.avatarFrame || 'none';
            if (frameId === 'none') {
                frameId = AvatarFrameSystem.getActiveFrame();
            }
            if (frameId && frameId !== 'none') {
                AvatarFrameSystem.applyFrame(avatarEl, frameId);
            }
        }
    }

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;

    // Track last AI message for the action bar
    if (msg.type === 'ai') {
        lastAiMsgId = div.dataset.msgId;
        updateLastMessageActions();
    }

    // 记录AI回答到上下文
    if (msg.type === 'ai' && msg.text) {
        aiConversationContext.push({ role: 'ai', text: msg.text.substring(0, 200), time: Date.now() });
        if (aiConversationContext.length > MAX_CONTEXT_LENGTH * 2) {
            aiConversationContext = aiConversationContext.slice(-MAX_CONTEXT_LENGTH * 2);
        }
    }

    // Save to history
    if (!state.chatHistories[state.currentSubject]) {
        state.chatHistories[state.currentSubject] = [];
    }
    state.chatHistories[state.currentSubject].push(msg);
    StorageManager.saveChatHistory(state.currentSubject, state.chatHistories[state.currentSubject]);

    // Update learning stats
    if (msg.type === 'ai' && msg.text && state.currentSubject) {
        const today = new Date().toISOString().split('T')[0];
        if (!state.learningStats[state.currentSubject]) {
            state.learningStats[state.currentSubject] = {};
        }
        if (!state.learningStats[state.currentSubject][today]) {
            state.learningStats[state.currentSubject][today] = { count: 0, entries: [] };
        }
        const dayStats = state.learningStats[state.currentSubject][today];
        dayStats.count++;
        dayStats.entries.push({
            q: msg.originalQuestion || '',
            a: msg.text.substring(0, 200),
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            msgId: div.dataset.msgId
        });
        StorageManager.saveStats(state.currentSubject, state.learningStats[state.currentSubject]);

        // Increment daily learning goal
        if (typeof incrementDailyGoal === 'function') {
            incrementDailyGoal();
        }
    }
}

function showTypingIndicator() {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-message ai';
    div.id = 'typingIndicator';
    div.innerHTML = `
        <div class="chat-avatar"><i class="fas fa-robot"></i></div>
        <div class="chat-bubble">
            <div class="typing-dots"><span></span><span></span><span></span></div>
        </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

// Backward compatibility
function removeTypingIndicator() {
    hideTypingIndicator();
}

function renderChatHistory() {
    const container = document.getElementById('chatMessages');
    const history = state.chatHistories[state.currentSubject] || [];
    container.innerHTML = '';

    if (history.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding:40px;">
                <i class="fas fa-comments"></i>
                <p>开始提问吧</p>
            </div>
        `;
        document.getElementById('clearChatBtn').style.display = 'none';
        return;
    }

    history.forEach(msg => {
        const div = document.createElement('div');
        div.className = `chat-message ${msg.type}`;
        div.dataset.msgId = ++msgIdCounter;

        let contentHtml = '';
        if (msg.image) contentHtml += `<img class="msg-image" src="${msg.image}" alt="uploaded">`;
        if (msg.text) {
            const isShort = msg.text.length <= 24;
            const shortClass = isShort ? ' short-msg' : '';
            const textContent = msg.type === 'user' ? escapeHtml(msg.text) : msg.text;
            contentHtml += `<div class="msg-text${shortClass}">${textContent}</div>`;
        }
        if (msg.type === 'ai' && msg.canSaveError) {
            contentHtml += `<button class="save-error-btn" onclick="saveToErrorBook(this)" data-question="${escapeHtml(msg.originalQuestion)}" data-answer="${escapeHtml(msg.text)}"><i class="fas fa-book-open"></i> 保存到错题本</button>`;
        }

        const userAvatar2 = state.currentUser?.avatar || (state.currentUser?.isGuest ? '😀' : null) || '😀';
        const avatarHtml2 = msg.type === 'ai'
            ? `<i class="fas fa-robot"></i>`
            : (userAvatar2.startsWith('data:') ? `<img src="${userAvatar2}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : userAvatar2);

        div.innerHTML = `
            <div class="chat-avatar">${avatarHtml2}</div>
            <div class="chat-bubble">${contentHtml}</div>
        `;

        // Apply avatar frame for user messages in history
        if (msg.type === 'user' && state.currentUser && !state.currentUser.isGuest) {
            const avatarEl = div.querySelector('.chat-avatar');
            if (avatarEl && typeof AvatarFrameSystem !== 'undefined') {
                let frameId = state.currentUser.avatarFrame || 'none';
                if (frameId === 'none') {
                    frameId = AvatarFrameSystem.getActiveFrame();
                }
                if (frameId && frameId !== 'none') {
                    AvatarFrameSystem.applyFrame(avatarEl, frameId);
                }
            }
        }

        container.appendChild(div);

        // Track last AI message during history render
        if (msg.type === 'ai') {
            lastAiMsgId = div.dataset.msgId;
        }
    });

    container.scrollTop = container.scrollHeight;
    document.getElementById('clearChatBtn').style.display = history.length > 0 ? 'flex' : 'none';

    // Update last message action bar after rendering history
    updateLastMessageActions();
}

function clearChat() {
    state.chatHistories[state.currentSubject] = [];
    StorageManager.saveChatHistory(state.currentSubject, []);
    currentQuiz = null;
    lastAIPrompt = null;
    renderChatHistory();
    showToast('success', '对话已清空');
}

function copyMessageText(btn) {
    const bubble = btn.closest('.chat-message');
    const textEl = bubble.querySelector('.msg-text');
    if (textEl) {
        navigator.clipboard.writeText(textEl.textContent).then(() => showToast('success', '已复制到剪贴板'));
    }
}

function editMessage(btn) {
    const bubble = btn.closest('.chat-message');
    const textEl = bubble.querySelector('.msg-text');
    if (textEl) {
        const input = document.getElementById('questionInput');
        const prefix = bubble.classList.contains('ai') ? '修改:' : '';
        input.value = prefix + textEl.textContent;
        input.focus();
    }
}

function resendMessage(btn) {
    const bubble = btn.closest('.chat-message');
    const textEl = bubble.querySelector('.msg-text');
    if (textEl) {
        document.getElementById('questionInput').value = textEl.textContent;
        submitQuestion();
    }
}

function deleteMessage(btn) {
    const msg = btn.closest('.chat-message');
    if (msg) {
        msg.style.opacity = '0';
        msg.style.transform = 'translateX(100px)';
        msg.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            msg.remove();
            // Also remove from chat history
            const id = msg.dataset.msgId;
            if (id && state.chatHistories[state.currentSubject]) {
                state.chatHistories[state.currentSubject] = state.chatHistories[state.currentSubject].filter((m, idx) => String(idx + 1) !== String(id));
                StorageManager.saveChatHistory(state.currentSubject, state.chatHistories[state.currentSubject]);
            }
        }, 300);
    }
}

function shareMessage(btn) {
    const msg = btn.closest('.chat-message');
    const textEl = msg.querySelector('.msg-text');
    if (textEl) {
        const text = textEl.textContent;
        if (navigator.share) {
            navigator.share({ title: '智学空间 - AI回答', text: text });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                showToast('success', '内容已复制，可粘贴分享');
            });
        }
    }
}

// ========== Message Reactions ==========
function getStoredPinnedMessages() {
    try {
        const data = localStorage.getItem('pinnedMessages');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function savePinnedMessages(pinned) {
    localStorage.setItem('pinnedMessages', JSON.stringify(pinned));
    updatePinnedCount();
}

function updatePinnedCount() {
    const pinned = getStoredPinnedMessages();
    const countEl = document.getElementById('pinnedMsgCount');
    if (countEl) {
        countEl.textContent = pinned.length;
        countEl.style.display = pinned.length > 0 ? 'inline-flex' : 'none';
    }
}

function addMessageReaction(btn, emoji) {
    const msgEl = btn.closest('.chat-message');
    if (!msgEl) return;
    const msgId = msgEl.dataset.msgId;
    const textEl = msgEl.querySelector('.msg-text');
    if (!textEl) return;

    // 获取或创建反应按钮容器
    let reactionBar = msgEl.querySelector('.msg-reaction-bar');
    if (!reactionBar) {
        reactionBar = document.createElement('div');
        reactionBar.className = 'msg-reaction-bar';
        msgEl.querySelector('.chat-bubble').appendChild(reactionBar);
    }

    // 切换反应
    const existingBtn = reactionBar.querySelector('[data-emoji="' + emoji + '"]');
    if (existingBtn) {
        existingBtn.remove();
    } else {
        const span = document.createElement('span');
        span.className = 'msg-reaction-chip';
        span.dataset.emoji = emoji;
        span.textContent = emoji;
        span.onclick = function() {
            this.remove();
        };
        reactionBar.appendChild(span);
    }

    // 处理固定消息
    if (emoji === '📌') {
        const pinned = getStoredPinnedMessages();
        const existIdx = pinned.findIndex(function(p) { return p.msgId === msgId; });
        if (existIdx >= 0) {
            pinned.splice(existIdx, 1);
            showToast('success', '已取消固定');
        } else {
            pinned.push({
                msgId: msgId,
                text: textEl.textContent.substring(0, 200),
                time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                timestamp: Date.now()
            });
            showToast('success', '已固定该消息');
        }
        savePinnedMessages(pinned);
    }
}

function buildReactionButtons() {
    return '<div class="msg-reaction-btns">' +
        '<button onclick="addMessageReaction(this, \'👍\')" title="有用">👍</button>' +
        '<button onclick="addMessageReaction(this, \'👎\')" title="需改进">👎</button>' +
        '<button onclick="addMessageReaction(this, \'📌\')" title="固定">📌</button>' +
        '<button onclick="addMessageReaction(this, \'💡\')" title="灵感">💡</button>' +
        '</div>';
}

// ========== Smart Input Suggestions ==========
const subjectSuggestions = {
    math: ['出一道数学题', '帮我解方程', '讲解几何证明', '概率统计怎么算'],
    english: ['翻译这段话', '讲解语法', '英语单词辨析', '帮我写作文'],
    chinese: ['赏析这首古诗', '讲解文言文', '成语故事', '修辞手法分析'],
    physics: ['讲解牛顿定律', '电路分析', '光学原理', '力学计算'],
    chemistry: ['配平方程式', '元素周期表', '有机化学基础', '酸碱反应'],
    biology: ['光合作用原理', '细胞结构', '遗传规律', '生态系统'],
    history: ['朝代顺序', '历史事件分析', '文化成就', '近代史要点'],
    politics: ['核心价值观', '宪法要点', '时事分析', '经济常识'],
    geography: ['气候类型', '中国地理', '世界地理', '地图读图'],
    law: ['法律咨询', '劳动法规定', '消费者权益', '合同常识'],
    mental: ['缓解考试焦虑', '情绪管理', '学习压力', '心理健康'],
    default: ['帮我解答问题', '出一道题', '解释这个概念', '学习建议']
};

function getSuggestionsForCurrentSubject() {
    const subject = state.currentSubject;
    if (subject && subjectSuggestions[subject]) {
        return subjectSuggestions[subject];
    }
    return subjectSuggestions.default;
}

function renderInputSuggestions() {
    const input = document.getElementById('questionInput');
    const container = document.getElementById('inputSuggestions');
    if (!input || !container) return;

    // 只在输入框为空且聚焦时显示
    if (input.value.trim() !== '' || document.activeElement !== input) {
        container.style.display = 'none';
        return;
    }

    const suggestions = getSuggestionsForCurrentSubject();
    // 随机选3-4个
    const shuffled = suggestions.sort(function() { return Math.random() - 0.5; });
    const selected = shuffled.slice(0, 4);

    container.innerHTML = selected.map(function(s) {
        return '<button class="suggestion-chip" onclick="useSuggestion(\'' + escapeHtml(s).replace(/'/g, "\\'") + '\')">' + escapeHtml(s) + '</button>';
    }).join('');
    container.style.display = 'flex';
}

function useSuggestion(text) {
    const input = document.getElementById('questionInput');
    if (input) {
        input.value = text;
        input.focus();
    }
    const container = document.getElementById('inputSuggestions');
    if (container) container.style.display = 'none';
}

function initInputSuggestions() {
    const input = document.getElementById('questionInput');
    if (!input) return;
    input.addEventListener('focus', function() {
        setTimeout(renderInputSuggestions, 100);
    });
    input.addEventListener('input', function() {
        if (this.value.trim() === '') {
            renderInputSuggestions();
        } else {
            const container = document.getElementById('inputSuggestions');
            if (container) container.style.display = 'none';
        }
    });
    input.addEventListener('blur', function() {
        setTimeout(function() {
            const container = document.getElementById('inputSuggestions');
            if (container) container.style.display = 'none';
        }, 200);
    });
}

// ========== Chat Search ==========
function toggleChatSearch() {
    const searchBar = document.getElementById('chatSearchBar');
    if (!searchBar) return;
    if (searchBar.style.display === 'flex') {
        searchBar.style.display = 'none';
        clearChatSearch();
    } else {
        searchBar.style.display = 'flex';
        const input = document.getElementById('chatSearchInput');
        if (input) input.focus();
    }
}

function performChatSearch() {
    const input = document.getElementById('chatSearchInput');
    if (!input) return;
    const keyword = input.value.trim();
    const countEl = document.getElementById('chatSearchCount');

    if (!keyword) {
        clearChatSearch();
        return;
    }

    const messages = document.querySelectorAll('#chatMessages .chat-message');
    let matchCount = 0;

    messages.forEach(function(msgEl) {
        const textEl = msgEl.querySelector('.msg-text');
        if (!textEl) return;

        const originalText = textEl.textContent;
        const lowerText = originalText.toLowerCase();
        const lowerKeyword = keyword.toLowerCase();

        if (lowerText.includes(lowerKeyword)) {
            matchCount++;
            msgEl.style.display = '';
            // 高亮匹配
            const regex = new RegExp('(' + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
            textEl.innerHTML = originalText.replace(regex, '<mark class="chat-search-highlight">$1</mark>');
        } else {
            msgEl.style.display = 'none';
        }
    });

    if (countEl) {
        countEl.textContent = '找到 ' + matchCount + ' 条匹配';
        countEl.style.display = matchCount > 0 ? 'inline' : 'none';
    }
}

function clearChatSearch() {
    const messages = document.querySelectorAll('#chatMessages .chat-message');
    messages.forEach(function(msgEl) {
        msgEl.style.display = '';
        const textEl = msgEl.querySelector('.msg-text');
        if (textEl && textEl.querySelector('.chat-search-highlight')) {
            // 恢复原始文本
            textEl.textContent = textEl.textContent;
        }
    });
    const input = document.getElementById('chatSearchInput');
    if (input) input.value = '';
    const countEl = document.getElementById('chatSearchCount');
    if (countEl) countEl.style.display = 'none';
}

// ========== Daily Learning Goal ==========
function getDailyGoalData() {
    const today = new Date().toISOString().split('T')[0];
    const key = 'user_' + (state.currentUser?.id || 'guest') + '_dailyGoal';
    try {
        const data = localStorage.getItem(key);
        if (data) {
            const parsed = JSON.parse(data);
            if (parsed.date === today) return parsed;
        }
    } catch (e) { /* ignore */ }
    return { date: today, count: 0, goal: 10, celebrated: false };
}

function saveDailyGoalData(data) {
    const key = 'user_' + (state.currentUser?.id || 'guest') + '_dailyGoal';
    localStorage.setItem(key, JSON.stringify(data));
}

function incrementDailyGoal() {
    const data = getDailyGoalData();
    data.count++;
    saveDailyGoalData(data);
    updateDailyGoalDisplay();

    // 检查是否达标
    if (data.count >= data.goal && !data.celebrated) {
        data.celebrated = true;
        saveDailyGoalData(data);
        showCelebrationToast();
    }
}

function updateDailyGoalDisplay() {
    const data = getDailyGoalData();
    const el = document.getElementById('dailyGoalDisplay');
    if (el) {
        el.textContent = '今日目标：' + data.count + '/' + data.goal + '题';
        el.style.display = 'inline-flex';
    }
}

function showCelebrationToast() {
    showToast('success', '恭喜！你已完成今日学习目标！继续保持！');
    // 创建庆祝动画
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast success celebration-toast';
    toast.innerHTML = '<span style="font-size:20px;">🎉</span><span>太棒了！今日目标已达成！</span>';
    container.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(function() { toast.remove(); }, 300);
    }, 4000);
}

// ========== Daily Tip (每日一知) ==========
var dailyTips = [
    { text: '学习新知识时，尝试"费曼学习法"：用简单的话向别人解释，如果解释不清楚就说明还没真正理解。', category: '学习方法' },
    { text: '人类大脑的重量只占体重的2%，却消耗了约20%的能量。', category: '生物' },
    { text: '数学中"无穷大"不是一个具体的数字，而是一个概念，表示没有上界。', category: '数学' },
    { text: '英语是世界上使用最广泛的语言，约有15亿人使用英语作为第一或第二语言。', category: '英语' },
    { text: '中国是世界上历史最悠久的文明之一，有超过5000年的文字记载历史。', category: '历史' },
    { text: '光从太阳到达地球大约需要8分20秒，所以你看到的阳光其实是8分钟前的。', category: '物理' },
    { text: '番茄工作法：专注学习25分钟，休息5分钟，每4个循环后休息15-30分钟，能有效提高效率。', category: '学习方法' },
    { text: '水是地球上唯一能以固态、液态和气态自然存在的物质。', category: '化学' },
    { text: '地球上71%的面积被水覆盖，但只有约2.5%是淡水。', category: '地理' },
    { text: '《论语》记录了孔子及其弟子的言行，是儒家经典之一，共20篇。', category: '语文' },
    { text: '艾宾浩斯遗忘曲线告诉我们：学习后1小时内遗忘最快，之后逐渐减慢，及时复习非常重要。', category: '学习方法' },
    { text: '蜜蜂跳"8字舞"来告诉同伴食物的方向和距离，这是动物界最复杂的交流方式之一。', category: '生物' },
    { text: '圆周率π是一个无理数，它的小数部分永远不会重复，也永远不会结束。', category: '数学' },
    { text: '莎士比亚一生创作了38部戏剧、154首十四行诗，是英语文学最伟大的作家之一。', category: '英语' },
    { text: '秦始皇统一中国后，统一了文字、度量衡和货币，对中国历史影响深远。', category: '历史' },
    { text: '声音在水中传播的速度比在空气中快约4.3倍，约为1500米/秒。', category: '物理' },
    { text: '思维导图可以帮助你将知识可视化，利用图形和颜色增强记忆效果。', category: '学习方法' },
    { text: '人体大约有37.2万亿个细胞，每秒约有380万个细胞在更新替换。', category: '生物' },
    { text: '化学元素周期表中，目前共有118种已确认的元素。', category: '化学' },
    { text: '珠穆朗玛峰海拔8848.86米，是地球上海拔最高的山峰。', category: '地理' },
    { text: '"锲而不舍，金石可镂"出自荀子《劝学》，强调坚持学习的重要性。', category: '语文' },
    { text: '间隔重复法（Spaced Repetition）是记忆单词和知识点的最佳方法之一，利用遗忘曲线安排复习时间。', category: '学习方法' },
    { text: '章鱼有三颗心脏和蓝色的血液，是地球上最聪明的无脊椎动物。', category: '生物' },
    { text: '勾股定理（a²+b²=c²）在公元前1000多年就被巴比伦人发现，比毕达哥拉斯更早。', category: '数学' },
    { text: '英语中字母"E"是使用频率最高的字母，而"Z"是使用频率最低的字母之一。', category: '英语' },
    { text: '造纸术是中国四大发明之一，由蔡伦在东汉时期改进，极大推动了人类文明进步。', category: '历史' },
    { text: '牛顿并不是因为苹果砸到头才发现万有引力的，这个故事是后人美化的传说。', category: '物理' },
    { text: '学习时听背景音乐（尤其是无歌词的古典乐）可以帮助一些人提高专注力。', category: '学习方法' },
    { text: 'DNA双螺旋结构的发现者是沃森和克里克，这一发现被誉为20世纪最伟大的科学成就之一。', category: '生物' },
    { text: '金刚石（钻石）和石墨都是由碳元素组成的，只是碳原子的排列方式不同。', category: '化学' },
    { text: '世界上最长的河流是尼罗河，全长约6670公里，流经11个非洲国家。', category: '地理' },
    { text: '唐代是中国诗歌的黄金时代，流传至今的唐诗约有五万首。', category: '语文' },
    { text: '每天保证7-9小时的睡眠，可以显著提高学习效率和记忆力。', category: '学习方法' },
    { text: '蝴蝶用脚来品尝食物的味道，它们的脚上有味觉感受器。', category: '生物' },
    { text: '零（0）的概念最早由古印度人发明，后来通过阿拉伯传入欧洲。', category: '数学' },
    { text: '英语中有超过170,000个正在使用的单词，但日常交流只需要约3000个。', category: '英语' },
    { text: '丝绸之路不仅运输丝绸，还传播了文化、宗教和技术，是古代最重要的贸易路线。', category: '历史' },
    { text: '彩虹其实是一个完整的圆，但我们通常只能看到上半部分，因为下半部分被地面挡住了。', category: '物理' },
    { text: '主动回忆（Active Recall）比被动阅读效率高得多，合上书本尝试回忆内容是最好的复习方式。', category: '学习方法' },
    { text: '人类基因组包含约30亿个碱基对，如果展开所有DNA，长度可以往返太阳400多次。', category: '生物' },
    { text: '氧元素是地壳中含量最多的元素，约占地壳总质量的46%。', category: '化学' },
    { text: '马里亚纳海沟最深处约11034米，比珠穆朗玛峰还要深。', category: '地理' },
    { text: '"读书破万卷，下笔如有神"出自杜甫，强调广泛阅读对写作的重要性。', category: '语文' },
    { text: '设定具体、可衡量的学习目标比模糊的目标更容易实现。试试SMART目标法！', category: '学习方法' },
    { text: '海马体是大脑中负责记忆形成的关键区域，得名于其形状像海马。', category: '生物' },
    { text: '黄金分割率（约1.618）在自然界中随处可见：贝壳、向日葵种子排列、飓风形状等。', category: '数学' },
    { text: '世界上最短的完整英文句子是"I am"或"I go"，仅由两个词构成。', category: '英语' },
    { text: '指南针是中国古代四大发明之一，最早用于风水，后来用于航海导航。', category: '历史' },
    { text: '学习新技能时，大脑会形成新的神经连接，这就是"神经可塑性"，说明大脑可以不断改变和成长。', category: '学习方法' },
    { text: '闪电的温度可以达到30000摄氏度，是太阳表面温度的5倍。', category: '物理' },
    { text: '世界上已知最古老的树木是一棵名为"玛土撒拉"的刺果松，已有4800多岁。', category: '生物' }
];

function getDailyTipIndex() {
    var today = new Date();
    var seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    return seed % dailyTips.length;
}

function getDailyTip() {
    var idx = getDailyTipIndex();
    return dailyTips[idx];
}

function hasShownDailyTipToday() {
    var today = new Date().toISOString().split('T')[0];
    var key = 'user_' + (state.currentUser?.id || 'guest') + '_dailyTipDate';
    try {
        var data = localStorage.getItem(key);
        return data === today;
    } catch (e) {
        return false;
    }
}

function markDailyTipShown() {
    var today = new Date().toISOString().split('T')[0];
    var key = 'user_' + (state.currentUser?.id || 'guest') + '_dailyTipDate';
    try {
        localStorage.setItem(key, today);
    } catch (e) { /* ignore */ }
}

function showDailyTip() {
    if (hasShownDailyTipToday()) return;

    var tip = getDailyTip();
    var tipHtml = '<div style="border:2px solid transparent;border-image:linear-gradient(135deg,#6C5CE7,#00CEC9,#FD79A8) 1;padding:12px 16px;border-radius:8px;margin:4px 0;">' +
        '<div style="font-size:13px;font-weight:600;color:#A29BFE;margin-bottom:6px;">💡 每日一知 · ' + tip.category + '</div>' +
        '<div style="font-size:13px;color:#B2B2CC;line-height:1.6;">' + tip.text + '</div>' +
        '</div>';

    addChatMessage({
        type: 'ai',
        text: tipHtml,
        canSaveError: false,
        originalQuestion: ''
    });

    markDailyTipShown();
}

// ========== Initialize Interaction Features ==========
document.addEventListener('DOMContentLoaded', function() {
    initInputSuggestions();
    updatePinnedCount();
    updateDailyGoalDisplay();
});
