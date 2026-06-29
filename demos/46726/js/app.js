/* ============================================================
   错题闯关 · 应用核心逻辑
   ============================================================ */

let state = loadData();
let currentLevel = null;
let currentQuiz = null;
let quizAnswers = [];
let quizIndex = 0;
let quizCorrectCount = 0;
let comboCount = 0;
let maxCombo = 0;
let quizTimer = null;
let quizSeconds = 0;

/* ============================================================
   页面切换
   ============================================================ */
function switchPage(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const target = document.querySelector('.page-' + pageName);
  if (target) target.classList.add('active');

  const nav = document.querySelector('.nav-item[data-nav="' + pageName + '"]');
  if (nav) nav.classList.add('active');

  // 渲染对应页面内容
  if (pageName === 'home') renderHome();
  if (pageName === 'challenge') renderLevels();
  if (pageName === 'stats') renderStats();
  if (pageName === 'add') renderAddPage();

  document.querySelector('.main').scrollTop = 0;
}

/* ============================================================
   首页渲染
   ============================================================ */
function renderHome() {
  // 问候语
  const hour = new Date().getHours();
  let greet = '你好';
  if (hour < 6) greet = '夜深了，注意休息';
  else if (hour < 11) greet = '早上好呀';
  else if (hour < 14) greet = '中午好';
  else if (hour < 18) greet = '下午好';
  else greet = '晚上好';
  document.getElementById('welcomeGreeting').textContent = greet + '，小明！';

  // 用户数据
  document.getElementById('userLevel').textContent = state.user.level;
  document.getElementById('userXP').textContent = state.user.xp;
  document.getElementById('starCount').textContent = state.user.stars;
  document.getElementById('streakCount').textContent = state.user.learningDays;

  // 待复习数
  const pending = state.mistakes.filter(m => !m.mastered).length;
  document.getElementById('pendingCount').textContent = pending;

  // 今日任务
  const taskList = document.getElementById('taskList');
  const doneTasks = state.dailyTasks.filter(t => t.done).length;
  document.getElementById('taskProgress').textContent = doneTasks + '/' + state.dailyTasks.length;
  taskList.innerHTML = state.dailyTasks.map(t => `
    <div class="task-item ${t.done ? 'done' : ''}" onclick="toggleTask(${t.id})">
      <div class="task-check">${t.done ? '✓' : ''}</div>
      <div class="task-content">
        <div class="task-title">${t.title}</div>
        <div class="task-desc">${t.desc}</div>
      </div>
      <div class="task-reward">+${t.reward} XP</div>
    </div>
  `).join('');

  // 最近错题
  const mistakeList = document.getElementById('recentMistakes');
  const recent = state.mistakes.slice(0, 3);
  if (recent.length === 0) {
    mistakeList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div>暂无错题，快去录入吧！</div>';
  } else {
    mistakeList.innerHTML = recent.map(m => `
      <div class="mistake-item" onclick="startQuickQuiz(${m.id})">
        <div class="mistake-thumb ${m.subject}">${m.icon}</div>
        <div class="mistake-content">
          <div class="mistake-top">
            <span class="subject-chip">${m.subjectName}</span>
            <span class="kp-chip">${m.knowledgePoints[0]}</span>
            ${m.mastered ? '<span class="mastered-badge">✓ 已掌握</span>' : ''}
          </div>
          <div class="mistake-q">${m.question}</div>
          <div class="mistake-meta"><span>📅 ${m.time}</span><span>❌ ${m.reason}</span></div>
        </div>
      </div>
    `).join('');
  }

  // 雷达图
  drawRadar('radarChart',
    KNOWLEDGE_POINTS.map(k => k.name),
    KNOWLEDGE_POINTS.map(k => k.value)
  );

  // 知识点进度条
  const kpList = document.getElementById('kpList');
  kpList.innerHTML = KNOWLEDGE_POINTS.slice(0, 4).map(k => `
    <div class="kp-item">
      <span class="kp-name">${k.name}</span>
      <div class="kp-bar"><div class="kp-fill" style="width:${k.value}%"></div></div>
      <span class="kp-pct">${k.value}%</span>
    </div>
  `).join('');

  // 最近获得徽章
  const badgeRow = document.getElementById('recentBadges');
  const unlocked = state.achievements.filter(a => a.unlocked).slice(-4).reverse();
  badgeRow.innerHTML = (unlocked.length ? unlocked : state.achievements.slice(0, 4)).map(a => `
    <div class="badge-item ${a.unlocked ? '' : 'locked'}">
      <div class="badge-icon">${a.icon}</div>
      <div class="badge-name">${a.name}</div>
    </div>
  `).join('');

  saveData(state);
}

/* ============================================================
   任务切换
   ============================================================ */
function toggleTask(taskId) {
  const task = state.dailyTasks.find(t => t.id === taskId);
  if (!task || task.done) return;
  task.done = true;
  state.user.xp += task.reward;
  showToast('🎉 任务完成！+' + task.reward + ' 经验值');
  checkLevelUp();
  renderHome();
}

/* ============================================================
   升级检测
   ============================================================ */
function checkLevelUp() {
  while (state.user.xp >= state.user.level * 100) {
    state.user.xp -= state.user.level * 100;
    state.user.level += 1;
    showToast('🎊 恭喜升级到 Lv.' + state.user.level + '！');
  }
}

/* ============================================================
   录入页面
   ============================================================ */
function renderAddPage() {
  document.getElementById('previewCard').style.display = 'none';
  document.getElementById('formQuestion').value = '';
  document.getElementById('formAnswer').value = '';
}

// 点击上传区
document.addEventListener('click', function (e) {
  if (e.target.closest('.upload-zone')) {
    document.getElementById('fileInput').click();
  }
});

// 文件选择
document.addEventListener('change', function (e) {
  if (e.target.id === 'fileInput' && e.target.files[0]) {
    handleImageFile(e.target.files[0]);
  }
  if (e.target.id === 'aiFileInput' && e.target.files[0]) {
    handleAIImage(e.target.files[0]);
  }
});

// 粘贴图片
document.addEventListener('paste', function (e) {
  const items = e.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      handleImageFile(items[i].getAsFile());
      break;
    }
  }
});

function handleImageFile(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const imgData = e.target.result;
    showPreview(imgData, true);
  };
  reader.readAsDataURL(file);
}

function showPreview(imgData, withAI) {
  document.getElementById('previewCard').style.display = 'block';
  document.getElementById('previewImage').src = imgData;

  const overlay = document.getElementById('scanOverlay');
  const scanning = document.getElementById('scanningStatus');
  overlay.classList.add('active');
  scanning.classList.add('active');

  if (withAI) {
    // 模拟 AI 识别过程
    setTimeout(function () {
      overlay.classList.remove('active');
      scanning.classList.remove('active');
      const demo = SAMPLE_MISTAKES[Math.floor(Math.random() * SAMPLE_MISTAKES.length)];
      document.getElementById('formSubject').value = demo.subject;
      document.getElementById('formQuestion').value = demo.question;
      document.getElementById('formAnswer').value = demo.answer;
      document.getElementById('formReason').value = demo.reason;

      // 知识点标签
      const kpTags = document.getElementById('kpTags');
      kpTags.innerHTML = demo.knowledgePoints.map(kp => `<div class="chip active">${kp}</div>`).join('');
      showToast('✨ AI 已识别题目内容');
    }, 1800);
  }
}

// 点击加载示例
function loadDemo(idx) {
  const all = SAMPLE_MISTAKES.filter(m => {
    if (idx === 0) return m.subject === 'math';
    if (idx === 1) return m.subject === 'chinese';
    if (idx === 2) return m.subject === 'english';
    return m.subject === 'science';
  });
  const demo = all[0] || SAMPLE_MISTAKES[0];

  // 生成渐变占位图
  const canvas = document.createElement('canvas');
  canvas.width = 400; canvas.height = 300;
  const ctx = canvas.getContext('2d');
  const colors = ['#667eea,#764ba2', '#f093fb,#f5576c', '#4facfe,#00f2fe', '#fa709a,#fee140'];
  const g = ctx.createLinearGradient(0, 0, 400, 300);
  const cs = colors[idx].split(',');
  g.addColorStop(0, cs[0]); g.addColorStop(1, cs[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 400, 300);
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📸 题目图片', 200, 140);
  ctx.font = '14px sans-serif';
  ctx.fillText('（模拟拍照录入）', 200, 170);

  showPreview(canvas.toDataURL(), true);

  // 自动填充表单
  setTimeout(function () {
    document.getElementById('formSubject').value = demo.subject;
    document.getElementById('formQuestion').value = demo.question;
    document.getElementById('formAnswer').value = demo.answer;
    document.getElementById('formReason').value = demo.reason;
    const kpTags = document.getElementById('kpTags');
    kpTags.innerHTML = demo.knowledgePoints.map(kp => `<div class="chip active">${kp}</div>`).join('');
  }, 1800);
}

function cancelAdd() {
  document.getElementById('previewCard').style.display = 'none';
}

function saveMistake() {
  const q = document.getElementById('formQuestion').value.trim();
  if (!q) { showToast('⚠️ 请填写题目内容'); return; }

  const subj = document.getElementById('formSubject').value;
  const subjMap = { math: ['数学', '📐'], chinese: ['语文', '📖'], english: ['英语', '🔤'], science: ['科学', '🧪'] };
  const newMistake = {
    id: Date.now(),
    subject: subj,
    subjectName: subjMap[subj][0],
    icon: subjMap[subj][1],
    question: q,
    answer: document.getElementById('formAnswer').value || '待补充',
    knowledgePoints: Array.from(document.querySelectorAll('#kpTags .chip')).map(c => c.textContent),
    reason: document.getElementById('formReason').value,
    time: new Date().toISOString().slice(0, 10),
    mastered: false
  };
  state.mistakes.unshift(newMistake);
  state.user.totalMistakes += 1;

  // 任务：录入也算一次任务进度
  const t = state.dailyTasks.find(t => t.title.includes('复习'));
  if (!t || !t.done) {
    // 录入也有小奖励
    if (state.user.totalMistakes >= 3) checkAchievement(3);
  }
  checkAchievement(1);

  showToast('✅ 已保存到错题本');
  setTimeout(() => {
    switchPage('home');
  }, 800);
}

/* ============================================================
   闯关挑战
   ============================================================ */
function renderLevels() {
  document.getElementById('quizCard').style.display = 'none';
  document.getElementById('resultCard').style.display = 'none';
  document.getElementById('levelsWrap').style.display = 'block';

  const levels = [
    { id: 1, title: '基础关', icon: '🌱', desc: '3 道基础题', count: 3, stars: 2 },
    { id: 2, title: '进阶关', icon: '🌿', desc: '5 道进阶题', count: 5, stars: 0 },
    { id: 3, title: '挑战关', icon: '🌳', desc: '5 道挑战题', count: 5, stars: 0 },
    { id: 4, title: '数学专项', icon: '🔢', desc: '聚焦数学错题', count: 4, stars: 1, special: 'math' },
    { id: 5, title: '语文专项', icon: '📖', desc: '聚焦语文错题', count: 4, stars: 0, special: 'chinese' },
    { id: 6, title: '终极挑战', icon: '👑', desc: '10 道综合题', count: 10, stars: 0, locked: true }
  ];

  const grid = document.getElementById('levelGrid');
  grid.innerHTML = levels.map(lv => `
    <div class="level-card ${lv.locked ? 'locked' : ''}" onclick="${lv.locked ? '' : 'startLevel(' + lv.id + ')'}">
      <div class="level-num">LEVEL ${lv.id}</div>
      <div class="level-icon">${lv.icon}</div>
      <div class="level-title">${lv.title}</div>
      <div class="level-info">
        <span>${lv.desc}</span>
        <span class="level-stars">${'⭐'.repeat(lv.stars)}${'☆'.repeat(3 - lv.stars)}</span>
      </div>
    </div>
  `).join('');

  currentLevel = levels;
}

function startLevel(levelId) {
  const lv = currentLevel.find(l => l.id === levelId);
  if (!lv || lv.locked) return;

  let pool = state.mistakes.filter(m => !m.mastered);
  if (lv.special) pool = pool.filter(m => m.subject === lv.special);
  if (pool.length === 0) pool = state.mistakes.slice();

  // 确保有选项
  const quizable = pool.filter(m => m.options && m.options.length);
  const finalPool = quizable.length > 0 ? quizable : pool.map(m => {
    if (!m.options) {
      m.options = [m.answer, '选项 B', '选项 C', '选项 D'];
    }
    return m;
  });

  currentQuiz = shuffle(finalPool.slice(0, lv.count));
  if (currentQuiz.length === 0) {
    showToast('📝 暂无错题，先去录入吧');
    return;
  }

  quizIndex = 0;
  quizCorrectCount = 0;
  comboCount = 0;
  maxCombo = 0;
  quizAnswers = [];
  quizSeconds = 0;

  document.getElementById('levelsWrap').style.display = 'none';
  document.getElementById('quizCard').style.display = 'block';
  document.getElementById('quizTotal').textContent = currentQuiz.length;

  startQuizTimer();
  renderQuiz();
}

function startQuizTimer() {
  if (quizTimer) clearInterval(quizTimer);
  quizSeconds = 0;
  document.getElementById('quizTimer').textContent = '00:00';
  quizTimer = setInterval(function () {
    quizSeconds++;
    const m = String(Math.floor(quizSeconds / 60)).padStart(2, '0');
    const s = String(quizSeconds % 60).padStart(2, '0');
    document.getElementById('quizTimer').textContent = m + ':' + s;
  }, 1000);
}

function renderQuiz() {
  const q = currentQuiz[quizIndex];
  document.getElementById('quizCurrent').textContent = quizIndex + 1;
  document.getElementById('quizSubject').textContent = q.subjectName + ' · ' + q.knowledgePoints[0];
  document.getElementById('quizQuestion').textContent = q.question;

  // 图片
  const imgEl = document.getElementById('quizImage');
  if (q._hasImg) {
    imgEl.style.display = 'flex';
    document.getElementById('quizImgSrc').src = q._imgUrl;
  } else {
    imgEl.style.display = 'none';
  }

  // 进度条
  const progress = ((quizIndex) / currentQuiz.length) * 100;
  document.getElementById('quizProgress').style.width = progress + '%';

  // 选项
  const optsEl = document.getElementById('quizOptions');
  optsEl.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const shuffled = shuffle(q.options.slice());
  shuffled.forEach((opt, i) => {
    const div = document.createElement('div');
    div.className = 'option';
    div.innerHTML = '<div class="option-letter">' + letters[i] + '</div><div class="option-text">' + opt + '</div>';
    div.onclick = function () {
      document.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
      div.classList.add('selected');
      div._answer = opt;
    };
    optsEl.appendChild(div);
  });
}

function submitAnswer() {
  const selected = document.querySelector('.option.selected');
  if (!selected) {
    showToast('请选择一个答案');
    return;
  }

  const q = currentQuiz[quizIndex];
  const userAnswer = selected._answer;
  const isCorrect = userAnswer === q.answer;

  // 显示所有选项的对错
  document.querySelectorAll('.option').forEach(opt => {
    opt.style.pointerEvents = 'none';
    if (opt._answer === q.answer) {
      opt.classList.add('correct');
    } else if (opt.classList.contains('selected')) {
      opt.classList.add('wrong');
    }
  });

  if (isCorrect) {
    quizCorrectCount++;
    comboCount++;
    if (comboCount > maxCombo) maxCombo = comboCount;
    showFeedback('correct', '✓ 答对啦！' + (comboCount >= 3 ? ' Combo x' + comboCount : ''));
  } else {
    comboCount = 0;
    showFeedback('wrong', '× 答错了');
  }

  quizAnswers.push({ q: q.question, correct: isCorrect, yourAnswer: userAnswer, rightAnswer: q.answer });

  setTimeout(function () {
    quizIndex++;
    if (quizIndex >= currentQuiz.length) {
      finishQuiz();
    } else {
      renderQuiz();
    }
  }, 1200);
}

function exitQuiz() {
  if (quizTimer) clearInterval(quizTimer);
  renderLevels();
}

function finishQuiz() {
  if (quizTimer) clearInterval(quizTimer);

  document.getElementById('quizCard').style.display = 'none';
  document.getElementById('resultCard').style.display = 'block';

  const totalQs = currentQuiz.length;
  const correct = quizCorrectCount;
  const rate = Math.round((correct / totalQs) * 100);
  const gainedXP = correct * 10 + (rate === 100 ? 20 : 0);

  state.user.xp += gainedXP;
  state.user.stars += Math.floor(correct / 2);
  state.user.correctCount += correct;
  state.user.totalAnswered += totalQs;

  document.getElementById('resultCorrect').textContent = correct;
  document.getElementById('resultWrong').textContent = totalQs - correct;
  document.getElementById('resultXP').textContent = '+' + gainedXP;
  document.getElementById('resultTitle').textContent =
    rate === 100 ? '🎉 完美通关！' : rate >= 60 ? '👏 表现不错！' : '💪 继续加油！';

  const comboEl = document.getElementById('resultCombo');
  comboEl.textContent = maxCombo >= 3 ? '🔥 最高连击 x' + maxCombo : '';

  // 把全对的题目标记为已掌握
  currentQuiz.forEach(q => {
    const a = quizAnswers.find(ans => ans.q === q.question);
    if (a && a.correct) {
      const m = state.mistakes.find(mm => mm.id === q.id);
      if (m && rate >= 60) { /* 保留在错题本，等待下次继续复习 */ }
    }
  });

  // 任务：闯关挑战
  const ct = state.dailyTasks.find(t => t.title.includes('闯关'));
  if (ct && !ct.done) toggleTask(ct.id);

  // 成就检测
  if (rate === 100) checkAchievement(5);
  if (maxCombo >= 3) checkAchievement(2);
  if (state.user.xp >= 100) checkAchievement(4);
  if (rate >= 90 && totalQs >= 5) checkAchievement(7);
  checkLevelUp();

  saveData(state);
}

function backToLevels() {
  document.getElementById('resultCard').style.display = 'none';
  renderLevels();
}

function startQuickQuiz(mistakeId) {
  const mistake = state.mistakes.find(m => m.id === mistakeId);
  if (!mistake) return;

  currentQuiz = [mistake];
  quizIndex = 0;
  quizCorrectCount = 0;
  comboCount = 0;
  maxCombo = 0;
  quizAnswers = [];

  switchPage('challenge');
  document.getElementById('levelsWrap').style.display = 'none';
  document.getElementById('quizCard').style.display = 'block';
  document.getElementById('quizTotal').textContent = 1;
  startQuizTimer();
  renderQuiz();
}

/* ============================================================
   反馈动画
   ============================================================ */
function showFeedback(type, text) {
  const overlay = document.getElementById('feedbackOverlay');
  const box = document.getElementById('feedbackBox');
  box.className = 'feedback-box ' + type;
  box.innerHTML = (type === 'correct' ? '✅' : '❌') + '<span class="fb-text">' + text + '</span>';
  overlay.classList.add('show');
  setTimeout(function () {
    overlay.classList.remove('show');
  }, 900);
}

/* ============================================================
   AI 助教
   ============================================================ */
function sendAI() {
  const input = document.getElementById('aiInput');
  const text = input.value.trim();
  if (!text) return;

  addChatMessage('user', text);
  input.value = '';

  // 任务：提问
  const t = state.dailyTasks.find(t => t.title.includes('AI'));
  if (t && !t.done) toggleTask(t.id);

  // 打字动画
  const typingMsg = addChatMessage('ai', '<span class="typing-dots"><span></span><span></span><span></span></span>', true);

  // 模拟 AI 思考
  setTimeout(function () {
    let response = AI_RESPONSES.default;
    if (/分数|几分之几|应用题/.test(text)) response = AI_RESPONSES['分数应用'];
    else if (/几何|周长|面积|三角|长方/.test(text)) response = AI_RESPONSES['几何'];
    else if (/英语|时态|语法|主谓/.test(text)) response = AI_RESPONSES['语法'];
    else if (/练习|出.*题|测.*试/.test(text)) response = AI_RESPONSES['练习'];
    else if (/粗心|马虎|计算错|失误/.test(text)) response = AI_RESPONSES['粗心'];

    typingMsg.querySelector('.msg-bubble').innerHTML =
      response.split('\n').map(line => '<div>' + line.replace(/ /g, '&nbsp;') + '</div>').join('');
    scrollChatToBottom();
  }, 1200);
}

function handleAIImage(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    addChatMessage('user', '我有一道题不会，帮我看看：<div class="msg-image"><img src="' + e.target.result + '" alt="题目图片"></div>');
    const typingMsg = addChatMessage('ai', '<span class="typing-dots"><span></span><span></span><span></span></span>', true);
    setTimeout(function () {
      const demo = SAMPLE_MISTAKES[Math.floor(Math.random() * SAMPLE_MISTAKES.length)];
      let response = '我识别到这道题啦！📸\n\n' +
        '📚 学科：' + demo.subjectName + '\n' +
        '🧠 知识点：' + demo.knowledgePoints.join('、') + '\n\n' +
        '💡 解题思路：\n' +
        '这道题考查的是' + demo.knowledgePoints[0] + '的应用。\n' +
        '关键步骤是：\n' +
        '1️⃣ 仔细读题，找出已知条件\n' +
        '2️⃣ 确定用什么公式或方法\n' +
        '3️⃣ 列式计算，注意单位\n' +
        '4️⃣ 检查答案是否合理\n\n' +
        '✅ 参考答案：' + demo.answer + '\n\n' +
        '需要我出几道类似的练习题吗？';
      typingMsg.querySelector('.msg-bubble').innerHTML =
        response.split('\n').map(line => '<div>' + line.replace(/ /g, '&nbsp;') + '</div>').join('');
      scrollChatToBottom();
    }, 1500);
  };
  reader.readAsDataURL(file);
}

function askPreset(preset) {
  document.getElementById('aiInput').value = preset;
  sendAI();
}

function addChatMessage(role, contentHtml, isTyping) {
  const area = document.getElementById('chatArea');
  const div = document.createElement('div');
  div.className = 'chat-msg ' + role;
  const avatar = role === 'ai' ? '🤖' : '👦';
  const now = new Date();
  const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  div.innerHTML = '<div class="msg-avatar">' + avatar + '</div>' +
    '<div class="msg-bubble"><div class="msg-text">' + contentHtml + '</div><div class="msg-time">' + timeStr + '</div></div>';
  area.appendChild(div);
  scrollChatToBottom();
  return div;
}

function scrollChatToBottom() {
  const area = document.getElementById('chatArea');
  setTimeout(() => { area.scrollTop = area.scrollHeight; }, 50);
}

/* ============================================================
   统计页面
   ============================================================ */
function renderStats() {
  // 更新顶栏
  document.getElementById('userLevel').textContent = state.user.level;
  document.getElementById('userXP').textContent = state.user.xp;
  document.getElementById('statTotal').textContent = state.user.totalMistakes;
  document.getElementById('statMastered').textContent = state.mistakes.filter(m => m.mastered).length;
  document.getElementById('statRate').textContent =
    state.user.totalAnswered > 0 ? Math.round((state.user.correctCount / state.user.totalAnswered) * 100) : 0;
  document.getElementById('statDays').textContent = state.user.learningDays;

  // 趋势图
  drawTrendChart('trendChart', LEARNING_TREND);

  // 雷达图
  drawRadar('statsRadarChart',
    KNOWLEDGE_POINTS.map(k => k.name),
    KNOWLEDGE_POINTS.map(k => k.value)
  );

  // 成就墙
  document.getElementById('badgeCount').textContent = state.achievements.filter(a => a.unlocked).length;
  const grid = document.getElementById('badgeGrid');
  grid.innerHTML = state.achievements.map(a => `
    <div class="badge-item ${a.unlocked ? '' : 'locked'}" title="${a.desc}">
      <div class="badge-icon">${a.icon}</div>
      <div class="badge-name">${a.name}</div>
    </div>
  `).join('');
}

/* ============================================================
   成就解锁
   ============================================================ */
function checkAchievement(id) {
  const ach = state.achievements.find(a => a.id === id);
  if (ach && !ach.unlocked) {
    ach.unlocked = true;
    setTimeout(() => showToast('🏆 解锁成就：' + ach.name), 600);
  }
}

/* ============================================================
   工具函数
   ============================================================ */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ============================================================
   启动
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  renderHome();
  document.getElementById('msgTime1').textContent =
    String(new Date().getHours()).padStart(2, '0') + ':' + String(new Date().getMinutes()).padStart(2, '0');
});
