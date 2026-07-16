// ========== 智能问答聊天模块 ==========

// 聊天状态
var chatState = {
  isOpen: false,
  messages: [],
  isTyping: false,
  welcomed: false
};

// 切换聊天窗口
function toggleChatWindow() {
  chatState.isOpen = !chatState.isOpen;
  var chatWindow = document.getElementById('chatWindow');
  var chatFab = document.getElementById('chatFab');

  if (chatState.isOpen) {
    chatWindow.style.display = 'flex';
    chatWindow.style.flexDirection = 'column';
    chatFab.classList.add('chat-fab-open');
    // 隐藏快捷按钮上的badge
    var badge = document.getElementById('chatBadge');
    if (badge) badge.style.display = 'none';
    // 显示欢迎消息
    if (!chatState.welcomed) {
      showWelcomeMessage();
      chatState.welcomed = true;
    }
    // 滚动到底部
    setTimeout(scrollChatToBottom, 100);
  } else {
    chatWindow.style.display = 'none';
    chatFab.classList.remove('chat-fab-open');
  }
}

// 显示欢迎消息
function showWelcomeMessage() {
  var welcomeText = '你好！我是AI职业助手，可以帮你解答职业规划相关的问题。\n\n';
  welcomeText += '你可以问我关于职业方向、技能提升、行业趋势等方面的问题，我会结合你的测评数据给出个性化建议。';

  addMessage('assistant', welcomeText);
}

// 添加消息到聊天界面
function addMessage(role, content) {
  var messagesContainer = document.getElementById('chatMessages');
  if (!messagesContainer) return;

  var message = { role: role, content: content, timestamp: Date.now() };
  chatState.messages.push(message);

  var bubble = document.createElement('div');
  bubble.className = 'chat-bubble chat-bubble-' + role;

  var avatar = document.createElement('div');
  avatar.className = 'chat-bubble-avatar';
  avatar.textContent = role === 'user' ? '我' : 'AI';

  var body = document.createElement('div');
  body.className = 'chat-bubble-body';
  body.innerHTML = parseSimpleMarkdown(content);

  bubble.appendChild(avatar);
  bubble.appendChild(body);
  messagesContainer.appendChild(bubble);

  scrollChatToBottom();
}

// 显示"正在思考"加载动画
function showTypingIndicator() {
  var messagesContainer = document.getElementById('chatMessages');
  if (!messagesContainer) return;

  var typing = document.createElement('div');
  typing.className = 'chat-bubble chat-bubble-assistant';
  typing.id = 'chatTypingIndicator';

  var avatar = document.createElement('div');
  avatar.className = 'chat-bubble-avatar';
  avatar.textContent = 'AI';

  var body = document.createElement('div');
  body.className = 'chat-bubble-body chat-typing-body';
  body.innerHTML = '<span class="chat-typing-dot"></span>' +
    '<span class="chat-typing-dot"></span>' +
    '<span class="chat-typing-dot"></span>';

  typing.appendChild(avatar);
  typing.appendChild(body);
  messagesContainer.appendChild(typing);
  scrollChatToBottom();
}

// 移除"正在思考"加载动画
function removeTypingIndicator() {
  var typing = document.getElementById('chatTypingIndicator');
  if (typing) typing.remove();
}

// 滚动聊天到底部
function scrollChatToBottom() {
  var messagesContainer = document.getElementById('chatMessages');
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// 发送消息
async function sendMessage() {
  var input = document.getElementById('chatInput');
  if (!input) return;

  var text = input.value.trim();
  if (!text || chatState.isTyping) return;

  input.value = '';
  chatState.isTyping = true;

  // 隐藏快捷问题
  var quickActions = document.getElementById('chatQuickActions');
  if (quickActions) quickActions.style.display = 'none';

  // 显示用户消息
  addMessage('user', text);

  // 显示加载动画
  showTypingIndicator();

  // 准备上下文
  var context = buildChatContext();

  // 尝试调用后端API
  var reply = null;
  if (typeof API !== 'undefined' && API.available) {
    var result = await API.sendChatMessage('user', text, context);
    if (result && result.reply) {
      reply = result.reply;
    }
  }

  // 降级到本地模板响应
  if (!reply) {
    reply = generateLocalReply(text, context);
  }

  // 模拟延迟后显示回复
  setTimeout(function() {
    removeTypingIndicator();
    addMessage('assistant', reply);
    chatState.isTyping = false;
  }, 600 + Math.random() * 800);
}

// 发送快捷问题
function sendQuickQuestion(question) {
  var input = document.getElementById('chatInput');
  if (input) input.value = question;
  sendMessage();
}

// 构建聊天上下文（携带测评数据）
function buildChatContext() {
  var scores = assessmentData.riasecScores || {};
  var hasScores = Object.values(scores).some(function(v) { return v > 0; });

  if (!hasScores) {
    return { hasAssessment: false };
  }

  var sorted = Object.entries(scores).sort(function(a, b) { return b[1] - a[1]; });
  var top3 = sorted.slice(0, 3).map(function(e) { return e[0]; });

  var anchorCounts = {};
  assessmentData.anchorAnswers.forEach(function(isA, i) {
    var anchor = isA ? anchorMapping[i] : anchorMappingB[i];
    anchorCounts[anchor] = (anchorCounts[anchor] || 0) + 1;
  });
  var sortedAnchors = Object.entries(anchorCounts).sort(function(a, b) { return b[1] - a[1]; });
  var topAnchors = sortedAnchors.slice(0, 2).map(function(e) { return e[0]; });

  return {
    hasAssessment: true,
    top3: top3,
    scores: scores,
    topAnchors: topAnchors,
    education: assessmentData.education || '',
    experience: assessmentData.experience || '',
    status: assessmentData.status || '',
    preferences: assessmentData.preferences || [],
    careerMatches: (window._careerMatches || []).slice(0, 3).map(function(c) {
      return { name: c.name, matchScore: c.matchScore };
    })
  };
}

// 本地模板响应（无API时降级）
function generateLocalReply(question, context) {
  var q = question.toLowerCase();

  // 如果没有测评数据
  if (!context.hasAssessment) {
    if (q.includes('测评') || q.includes('测试') || q.includes('开始')) {
      return '建议你先完成职业测评，这样我才能根据你的兴趣和价值观给出更精准的建议。\n\n你可以点击导航栏中的"开始测评"来开始。';
    }
    return '我目前还不知道你的职业兴趣和优势。建议你先完成职业测评，这样我就能为你提供更有针对性的建议了。\n\n点击导航栏的"开始测评"即可开始。';
  }

  var topType = typeNames[context.top3[0]] || '综合型';
  var secondType = typeNames[context.top3[1]] || '综合型';
  var topAnchor = context.topAnchors[0] || '多元探索型';
  var topCareers = context.careerMatches || [];

  // 匹配问题类型
  if (q.includes('方向') || q.includes('适合') || q.includes('推荐') || q.includes('职业')) {
    var reply = '根据你的测评结果，你的主导职业类型是**' + topType + '**，辅助类型是**' + secondType + '**。\n\n';
    if (topCareers.length > 0) {
      reply += '为你推荐以下职业方向：\n\n';
      topCareers.forEach(function(c, i) {
        reply += (i + 1) + '. **' + c.name + '**（匹配度 ' + c.matchScore + '分）\n';
      });
      reply += '\n你可以在测评结果页面查看这些职业的详细信息和技能差距分析。';
    } else {
      reply += '建议你在测评结果页面查看为你匹配的职业推荐列表，那里有详细的匹配原因和发展前景分析。';
    }
    return reply;
  }

  if (q.includes('提升') || q.includes('竞争力') || q.includes('技能') || q.includes('学习')) {
    var reply = '提升核心竞争力的建议：\n\n';
    reply += '1. **深耕' + topType + '领域**：这是你最突出的优势方向，持续深耕可以获得更高的专业壁垒。\n\n';
    reply += '2. **补充' + secondType + '能力**：作为辅助方向，培养相关技能可以增加你的职业灵活性。\n\n';
    reply += '3. **关注行业认证**：根据你的目标职业，考取相关的行业认证可以显著提升竞争力。\n\n';
    reply += '4. **实践经验积累**：通过实习、项目或兼职来积累实际经验，理论结合实践效果最佳。\n\n';
    reply += '建议使用"技能差距分析"工具来了解你与目标岗位之间的具体差距。';
    return reply;
  }

  if (q.includes('趋势') || q.includes('行业') || q.includes('前景') || q.includes('未来')) {
    var reply = '关于行业发展趋势：\n\n';
    reply += '- **人工智能/科技行业**：持续高速发展，对' + (context.top3.includes('I') ? '研究型' : '技术') + '人才需求旺盛。\n';
    reply += '- **新能源/绿色经济**：政策支持力度大，是未来5-10年的重点发展方向。\n';
    reply += '- **医疗健康**：人口老龄化趋势下，行业需求稳定增长。\n';
    reply += '- **数字化转型**：传统行业数字化转型带来大量新岗位机会。\n\n';
    reply += '你可以使用"行业探索"功能来详细了解各行业的稳定性、技术迭代速度和热门岗位。';
    return reply;
  }

  if (q.includes('转行') || q.includes('转型') || q.includes('换工作') || q.includes('跳槽')) {
    var reply = '关于职业转型的建议：\n\n';
    reply += '1. **评估自身优势**：你的' + topType + '特质在很多行业都有应用场景，转行并不意味着从零开始。\n\n';
    reply += '2. **寻找交叉领域**：考虑将你现有的' + topType + '优势与目标行业相结合，找到交叉点。\n\n';
    reply += '3. **小步快跑**：可以先通过副业、兼职或学习来试水，降低转型风险。\n\n';
    reply += '4. **利用"决策工具箱"**：使用三圆交叉模型和决策平衡单来理性分析转型方案的利弊。';
    return reply;
  }

  if (q.includes('薪资') || q.includes('工资') || q.includes('收入') || q.includes('待遇')) {
    var reply = '关于职业回报的建议：\n\n';
    reply += '- 职业回报不仅体现在收入上，还包括成长空间、技能提升、工作满足感等多个维度。\n';
    reply += '- **' + topType + '**类型的岗位在不同行业表现差异较大，建议你结合兴趣、价值观和发展潜力综合选择。\n\n';
    reply += '建议你：\n';
    reply += '1. 关注目标岗位的发展路径和技能门槛，而不只是短期收入\n';
    reply += '2. 通过招聘平台（如智联招聘、BOSS直聘等）了解目标岗位的市场行情\n';
    reply += '3. 利用"技能差距分析"工具找出提升核心竞争力的方向\n\n';
    reply += '记住，职业选择是一场长跑，稳定的成长空间和内在的职业满足感比短期收入更重要。';
    return reply;
  }

  if (q.includes('焦虑') || q.includes('迷茫') || q.includes('不确定') || q.includes('困惑')) {
    var reply = '感到迷茫是很正常的，很多职场人都会经历这个阶段。以下是一些建议：\n\n';
    reply += '1. **你已经迈出了第一步**：通过测评了解自己的兴趣和优势，这比很多人做得都好。\n\n';
    reply += '2. **不必急于做出完美决定**：职业发展是一个动态过程，可以先选择一个大致方向，在实践中调整。\n\n';
    reply += '3. **你的' + topType + '特质是你的优势**：发挥你的核心优势，在擅长的领域更容易获得成就感和方向感。\n\n';
    reply += '4. **寻求外部支持**：和信任的朋友、导师交流，或者使用我们的决策工具来理清思路。';
    return reply;
  }

  // 默认回复
  var reply = '感谢你的提问！\n\n';
  reply += '根据你的测评数据，你的主导类型是**' + topType + '**，核心职业锚是"' + topAnchor + '"。\n\n';
  reply += '你可以尝试问我以下问题：\n';
  reply += '- "适合我的职业方向有哪些？"\n';
  reply += '- "如何提升我的核心竞争力？"\n';
  reply += '- "当前行业的发展趋势如何？"\n';
  reply += '- "我想转行，有什么建议？"\n\n';
  reply += '我会根据你的测评数据给出更有针对性的建议。';
  return reply;
}
