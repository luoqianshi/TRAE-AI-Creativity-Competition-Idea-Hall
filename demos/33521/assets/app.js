/**
 * AI被动任务管家 - 核心逻辑 v5
 * 监听 -> 识别 -> 拆解 -> 排期
 * 100% 浏览器本地处理，零后端零API
 *
 * v5 升级：多平台网页消息任务捕获模块
 * - 网页消息监听：支持微信/QQ/钉钉网页版聊天文本捕获
 * - 免打扰突破：群消息任务独立高强度提醒
 * - 多源合并：语音任务 + 群消息任务自动去重合并
 * - 文字任务优先级 > 语音任务
 * - 权限授权、自定义监控群列表、来源标注
 */

const app = {
  recognition: null,
  isListening: false,
  tasks: [],
  logs: [],
  transcriptHistory: [],
  pendingConfirm: null,
  contextWindow: [],
  contextMaxSize: 5,
  contextTimeout: 30000,
  reminderTimers: [],
  isMinimized: false,
  draggedTaskId: null,
  networkErrorCount: 0,
  maxNetworkErrors: 3,

  // ============ v5 消息监控模块 ============
  messageMonitor: {
    enabled: { wechat: false, qq: false, dingtalk: false },
    groups: [],
    selectedGroups: new Set(),
    messageLogs: [],
    captureKeywords: ['任务','作业','截止','提交','会议','汇报','deadline','due','考试','论文','报告','项目','交付','上线','发布','复习','预习','练习','刷题','备考','期末','期中','选课','学分','毕设','答辩','开题','文献','笔记','课程','学习','培训','考证','雅思','托福','gre','考研','看书','读论文','写论文','交作业','上网课','做实验','约会','聚餐','缴费','交电费','交水费','交燃气费','还信用卡','还花呗','还贷款','看病','就医','体检','挂号','买药','家务','打扫','洗衣','买菜','做饭','取快递','寄快递','理发','美容','健身','跑步','瑜伽','游泳','打球','旅行','订票','订酒店','签证','护照','年检','保养','洗车','搬家','维修','换灯泡','交物业费','交房租','买保险','续费','到期','接孩子','遛狗','喂猫','浇花','扔垃圾','洗碗','拖地']
  },

  defaultKeywords: {
    work: ['会议','汇报','截止','截止日期','待办','todo','任务','项目','交付','review','评审','上线','发布','周报','月报','提案','合同','客户','需求','开发','测试','bug','修复','优化','迭代','版本','排期','同步','对齐','跟进','催','deadline','due','报销','审批','签字','盖章','发邮件','写文档','做方案','写代码','改方案','做PPT','写PPT','做表格','填表','提交','申请','预约'],
    study: ['作业','复习','考试','测验','论文','报告','课题','项目','实验','预习','背诵','练习','刷题','备考','期末','期中','选课','学分','毕设','答辩','开题','文献','笔记','课程','学习','培训','考证','雅思','托福','gre','考研','看书','读论文','写论文','交作业','上网课','做实验'],
    life: ['约会','聚餐','缴费','交电费','交水费','交燃气费','还信用卡','还花呗','还贷款','看病','就医','体检','挂号','买药','家务','打扫','洗衣','买菜','做饭','取快递','寄快递','理发','美容','健身','跑步','瑜伽','游泳','打球','旅行','订票','订酒店','签证','护照','年检','保养','洗车','搬家','维修','换灯泡','交物业费','交房租','买保险','续费','到期','接孩子','遛狗','喂猫','浇花','扔垃圾','洗碗','拖地']
  },

  customKeywords: { work: [], study: [], life: [] },
  negationKeywords: ['不用了','算了','取消','不要','不用','没必要','不用管','忘了吧','无所谓','随便吧','不管了','拉倒','作废','已经','完成了','搞定了','弄好了','交了','结束了','开玩笑','开玩笑的','说笑','逗你','骗你','假的','如果','假如','要是','假设','万一','假如说','别人','他','她','他们','听说','据说','据说说'],

  timeKeywords: {
    exact: ['今天','明天','后天','大后天','下周','下下周','这周','本周','本月','下个月','下月','月底','年底','年初','月末','月初','周一','周二','周三','周四','周五','周六','周日','星期一','星期二','星期三','星期四','星期五','星期六','星期日','早上','上午','中午','下午','晚上','凌晨','点','号','日','月','年','之前','以前','以内','内','前','后','之间','截止','deadline','due'],
    fuzzy: ['待会','回头','等会','晚点','过会儿','过会','有空','有空的时候','到时候','改天','哪天','最近','这两天','这几天','这段时间','有空再说','以后','之后','接下来','随后','稍后','一会儿']
  },

  priorityKeywords: {
    high: ['紧急','急','必须','一定','马上','立刻','赶紧','重要','critical','urgent',' asap','尽快','优先','首先','务必','千万','绝不能','不能忘'],
    medium: ['需要','应该','最好','尽量','计划','安排','准备','记得','别忘了','别忘了'],
    low: ['可以','有空','顺便','也许','可能','考虑','看看','想','打算']
  },

  autoHighPriorityKeywords: ['考试','汇报','截止日期','deadline','due','期末','答辩','毕设','上线','发布','交付','截止','deadline'],

  defaultFreeSlots: {
    work: [
      { day: 1, start: 9, end: 18 },
      { day: 2, start: 9, end: 18 },
      { day: 3, start: 9, end: 18 },
      { day: 4, start: 9, end: 18 },
      { day: 5, start: 9, end: 18 }
    ],
    study: [
      { day: 1, start: 19, end: 22 },
      { day: 2, start: 19, end: 22 },
      { day: 3, start: 19, end: 22 },
      { day: 4, start: 19, end: 22 },
      { day: 5, start: 19, end: 22 },
      { day: 6, start: 9, end: 22 },
      { day: 0, start: 9, end: 22 }
    ],
    life: [
      { day: 5, start: 19, end: 23 },
      { day: 6, start: 9, end: 23 },
      { day: 0, start: 9, end: 23 }
    ]
  },

  freeSlots: null,

  init() {
    this.loadCustomKeywords();
    this.loadFreeSlots();
    this.updateStatus('ready', '就绪');
    this.renderTasks();
    this.renderLogs();
    this.renderCustomKeywords();
    this.initReminderLoop();

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.updateStatus('error', '浏览器不支持语音识别');
      document.getElementById('toggleBtn').disabled = true;
      this.addLog('error', '当前浏览器不支持 Web Speech API，请使用 Chrome/Edge/Safari');
      return;
    }
    this.setupRecognition();
  },

  // ============ 本地存储 ============
  loadCustomKeywords() {
    try { const saved = localStorage.getItem('ai-task-manager-custom-keywords'); if (saved) this.customKeywords = JSON.parse(saved); } catch(e) {}
  },
  saveCustomKeywords() {
    try { localStorage.setItem('ai-task-manager-custom-keywords', JSON.stringify(this.customKeywords)); } catch(e) {}
  },
  loadFreeSlots() {
    try {
      const saved = localStorage.getItem('ai-task-manager-free-slots');
      if (saved) { this.freeSlots = JSON.parse(saved); } else { this.freeSlots = JSON.parse(JSON.stringify(this.defaultFreeSlots)); }
    } catch(e) { this.freeSlots = JSON.parse(JSON.stringify(this.defaultFreeSlots)); }
  },
  saveFreeSlots() {
    try { localStorage.setItem('ai-task-manager-free-slots', JSON.stringify(this.freeSlots)); } catch(e) {}
  },

  getMergedKeywords(category) {
    const defaults = this.defaultKeywords[category] || [];
    const customs = this.customKeywords[category] || [];
    return [...new Set([...defaults, ...customs])];
  },
  getAllKeywords() {
    return { work: this.getMergedKeywords('work'), study: this.getMergedKeywords('study'), life: this.getMergedKeywords('life') };
  },

  // ============ 自定义关键词 ============
  handleKeywordInput(event, category) {
    if (event.key !== 'Enter') return;
    const input = event.target;
    const value = input.value.trim();
    if (!value) return;
    if (this.customKeywords[category].includes(value)) { input.value = ''; return; }
    this.customKeywords[category].push(value);
    this.saveCustomKeywords();
    this.renderCustomKeywords();
    input.value = '';
  },
  removeCustomKeyword(category, keyword) {
    this.customKeywords[category] = this.customKeywords[category].filter(k => k !== keyword);
    this.saveCustomKeywords();
    this.renderCustomKeywords();
  },
  resetCustomKeywords() {
    this.customKeywords = { work: [], study: [], life: [] };
    this.saveCustomKeywords();
    this.renderCustomKeywords();
    this.showToast('已恢复默认识别词');
  },
  toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  },
  renderCustomKeywords() {
    const categories = ['work', 'study', 'life'];
    let totalCount = 0;
    categories.forEach(cat => {
      const container = document.getElementById(`custom${cat.charAt(0).toUpperCase() + cat.slice(1)}Tags`);
      const allKeywords = this.getMergedKeywords(cat);
      totalCount += allKeywords.length;
      container.innerHTML = allKeywords.map(kw => {
        const isCustom = this.customKeywords[cat].includes(kw);
        return `<span class="keyword-tag ${isCustom ? 'custom' : 'default'}" title="${isCustom ? '点击删除自定义词' : '默认词'}">${this.escapeHtml(kw)}${isCustom ? `<span class="tag-remove" onclick="app.removeCustomKeyword('${cat}', '${kw}')">&times;</span>` : ''}</span>`;
      }).join('');
    });
    document.getElementById('keywordCount').textContent = `共 ${totalCount} 个识别词（含默认）`;
  },

  // ============ 语音识别 ============
  setupRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'zh-CN';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.updateUIState(true);
      this.addLog('detected', '监听已启动');
    };
    this.recognition.onend = () => {
      this.isListening = false;
      this.updateUIState(false);
      if (this.networkErrorCount >= this.maxNetworkErrors) {
        this.addLog('error', '语音识别服务不可用（网络原因），已停止重试。请检查网络连接或使用VPN，也可通过消息捕获模块手动体验。');
        document.getElementById('toggleBtnText').textContent = '启动监听';
        return;
      }
      if (document.getElementById('toggleBtnText').textContent === '停止监听') {
        setTimeout(() => { if (!this.isListening) { try { this.recognition.start(); } catch(e) {} } }, 300);
      }
    };
    this.recognition.onerror = (event) => {
      if (event.error === 'no-speech') return;
      if (event.error === 'network' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
        this.networkErrorCount++;
        if (this.networkErrorCount >= this.maxNetworkErrors) {
          this.addLog('error', `识别错误: ${event.error}（连续${this.networkErrorCount}次，已停止重试）`);
        } else {
          this.addLog('error', `识别错误: ${event.error}（第${this.networkErrorCount}次，将自动重试）`);
        }
      } else {
        this.addLog('error', `识别错误: ${event.error}`);
      }
    };
    this.recognition.onresult = (event) => { this.handleResult(event); };
  },

  handleResult(event) {
    const results = event.results;
    const lastResult = results[results.length - 1];
    if (!lastResult.isFinal) return;
    const transcript = lastResult[0].transcript.trim();
    if (!transcript) return;

    this.addTranscript(transcript);

    if (this.isNegation(transcript)) {
      this.checkNegationCancel(transcript);
      this.addLog('filtered', `否定过滤: ${transcript.substring(0, 30)}`);
      return;
    }

    const taskInfo = this.extractTask(transcript);
    if (!taskInfo) {
      this.addLog('filtered', `过滤闲聊: ${transcript.substring(0, 30)}`);
      return;
    }

    if (taskInfo.confidence >= 80) {
      this.addTask(taskInfo);
      this.addLog('detected', `识别任务(${Math.round(taskInfo.confidence)}%): ${taskInfo.title}`);
      this.showToast(`已识别任务: ${taskInfo.title}`);
    } else if (taskInfo.confidence >= 50) {
      this.addLog('detected', `待确认(${Math.round(taskInfo.confidence)}%): ${taskInfo.title}`);
      this.showConfirm(taskInfo);
    } else {
      this.addLog('filtered', `低置信度(${Math.round(taskInfo.confidence)}%)忽略: ${transcript.substring(0, 30)}`);
    }
  },

  isNegation(text) {
    const lower = text.toLowerCase();
    return this.negationKeywords.some(kw => lower.includes(kw.toLowerCase()));
  },

  checkNegationCancel(text) {
    if (this.tasks.length === 0) return;
    const lower = text.toLowerCase();
    const cancelWords = ['取消','不用了','算了','不要','不用','没必要','作废','拉倒'];
    if (cancelWords.some(w => lower.includes(w))) {
      const removed = this.tasks.shift();
      this.renderTasks();
      this.addLog('filtered', `已取消任务: ${removed.title}`);
      this.showToast(`已取消: ${removed.title}`);
    }
  },

  // ============ 核心任务提取 ============
  extractTask(text) {
    const lowerText = text.toLowerCase();
    const now = new Date();
    if (this.isNegation(text)) return null;

    let category = null;
    let matchedKeywords = [];
    const allKw = this.getAllKeywords();
    for (const [cat, keywords] of Object.entries(allKw)) {
      for (const kw of keywords) {
        if (lowerText.includes(kw.toLowerCase())) { category = cat; matchedKeywords.push(kw); }
      }
    }

    let timeMatch = null;
    let timeType = null;
    for (const tw of this.timeKeywords.exact) { if (text.includes(tw)) { timeMatch = tw; timeType = 'exact'; break; } }
    if (!timeMatch) { for (const tw of this.timeKeywords.fuzzy) { if (text.includes(tw)) { timeMatch = tw; timeType = 'fuzzy'; break; } } }

    if (!category || !timeMatch) {
      if (category && !timeMatch) { const contextTime = this.findContextTime(); if (contextTime) { timeMatch = contextTime.text; timeType = contextTime.type || 'exact'; } }
      if (!category && timeMatch) { const contextCategory = this.findContextCategory(); if (contextCategory) category = contextCategory; }
      if (!category || !timeMatch) return null;
    }

    let parentTaskId = null;
    const recentContext = this.getRecentContext();
    if (recentContext && recentContext.category === category) {
      const timeDiff = now - recentContext.time;
      if (timeDiff < this.contextTimeout) parentTaskId = recentContext.taskId;
    }

    const confidence = this.calcConfidence(text, { category, matchedKeywords, timeMatch, timeType, parentTaskId });
    const title = this.extractTitle(text, matchedKeywords);
    const timeInfo = this.parseTime(text);
    const priority = this.detectPriorityV3(text, timeInfo.deadline);
    const taskId = Date.now() + Math.random().toString(36).substr(2, 6);
    this.contextWindow.unshift({ text, category, time: now, taskId, timeText: timeMatch });
    if (this.contextWindow.length > this.contextMaxSize) this.contextWindow = this.contextWindow.slice(0, this.contextMaxSize);

    return {
      id: taskId, title, rawText: text, category, priority,
      deadline: timeInfo.deadline, deadlineText: timeInfo.text || '未指定',
      scheduledTime: null, confidence, parentTaskId, createdAt: now, isFuzzy: timeInfo.isFuzzy || false
    };
  },

  getRecentContext() { return this.contextWindow.length > 0 ? this.contextWindow[0] : null; },
  findContextTime() {
    for (const ctx of this.contextWindow) {
      if (ctx.timeText) { const timeDiff = Date.now() - ctx.time.getTime(); if (timeDiff < this.contextTimeout) return { text: ctx.timeText, type: 'exact' }; }
    }
    return null;
  },
  findContextCategory() {
    for (const ctx of this.contextWindow) {
      if (ctx.category) { const timeDiff = Date.now() - ctx.time.getTime(); if (timeDiff < this.contextTimeout) return ctx.category; }
    }
    return null;
  },

  calcConfidence(text, info) {
    let score = 0;
    const lowerText = text.toLowerCase();
    if (info.matchedKeywords.length > 0) { score += 25; score += Math.min((info.matchedKeywords.length - 1) * 5, 15); }
    if (info.timeType === 'exact') score += 25; else score += 12;
    for (const kws of Object.values(this.priorityKeywords)) { for (const kw of kws) { if (lowerText.includes(kw.toLowerCase())) { score += 10; break; } } }
    if (info.parentTaskId) score += 8;
    if (text.length >= 6 && text.length <= 40) score += 7; else if (text.length >= 4 && text.length <= 60) score += 3;
    if (/\d/.test(text)) score += 5;
    const deadlineWords = ['截止','deadline','due','之前','以内','前','到期','必须'];
    for (const dw of deadlineWords) { if (lowerText.includes(dw.toLowerCase())) { score += 10; break; } }
    if (info.timeType === 'fuzzy' && info.matchedKeywords.length <= 1) score -= 10;
    return Math.max(0, Math.min(100, score));
  },

  extractTitle(text) {
    let title = text.replace(/[嗯啊哦哎哟喂吧呢吗嘛哈嘿]/g, '').replace(/\s+/g, ' ').trim();
    if (title.length > 35) title = title.substring(0, 35) + '...';
    return title || '未命名任务';
  },

  parseTime(text) {
    const now = new Date();
    let deadline = null;
    let timeText = '';
    let isFuzzy = false;

    if (text.includes('今天')) { deadline = new Date(now); timeText = '今天'; }
    else if (text.includes('明天')) { deadline = new Date(now); deadline.setDate(deadline.getDate() + 1); timeText = '明天'; }
    else if (text.includes('后天')) { deadline = new Date(now); deadline.setDate(deadline.getDate() + 2); timeText = '后天'; }
    else if (text.includes('大后天')) { deadline = new Date(now); deadline.setDate(deadline.getDate() + 3); timeText = '大后天'; }
    else if (text.includes('下周')) { deadline = new Date(now); deadline.setDate(deadline.getDate() + 7); timeText = '下周'; }
    else if (text.includes('下下周')) { deadline = new Date(now); deadline.setDate(deadline.getDate() + 14); timeText = '下下周'; }
    else if (text.includes('这周') || text.includes('本周')) { const dow = now.getDay() || 7; deadline = new Date(now); deadline.setDate(deadline.getDate() + (7 - dow)); timeText = '这周'; }
    else if (text.includes('月底') || text.includes('月末')) { deadline = new Date(now.getFullYear(), now.getMonth() + 1, 0); timeText = '月底'; }
    else if (text.includes('月初')) { deadline = new Date(now.getFullYear(), now.getMonth() + 1, 1); timeText = '月初'; }
    else if (text.includes('年底') || text.includes('年末')) { deadline = new Date(now.getFullYear(), 11, 31); timeText = '年底'; }

    const dateMatch = text.match(/(\d{1,2})\s*[月/]\s*(\d{1,2})/);
    if (dateMatch) {
      const month = parseInt(dateMatch[1]) - 1;
      const day = parseInt(dateMatch[2]);
      const year = now.getFullYear();
      deadline = new Date(year, month, day);
      if (deadline < now) deadline.setFullYear(year + 1);
      timeText = `${dateMatch[1]}月${dateMatch[2]}日`;
    }

    const dayMatch = text.match(/(\d{1,2})\s*[号日]/);
    if (dayMatch && !dateMatch) {
      const day = parseInt(dayMatch[1]);
      const year = now.getFullYear();
      const month = now.getMonth();
      deadline = new Date(year, month, day);
      if (deadline < now) deadline.setMonth(month + 1);
      timeText = `${day}号`;
    }

    const daysLaterMatch = text.match(/(\d+)\s*天后/);
    if (daysLaterMatch) { const days = parseInt(daysLaterMatch[1]); deadline = new Date(now); deadline.setDate(deadline.getDate() + days); timeText = `${days}天后`; }

    const weeksLaterMatch = text.match(/(\d+)\s*周后/);
    if (weeksLaterMatch) { const weeks = parseInt(weeksLaterMatch[1]); deadline = new Date(now); deadline.setDate(deadline.getDate() + weeks * 7); timeText = `${weeks}周后`; }

    let timeOfDay = '';
    if (text.includes('早上') || text.includes('上午')) timeOfDay = '上午';
    else if (text.includes('中午')) timeOfDay = '中午';
    else if (text.includes('下午')) timeOfDay = '下午';
    else if (text.includes('晚上') || text.includes('夜里')) timeOfDay = '晚上';

    const timeMatch = text.match(/(\d{1,2})\s*[点:：](\d{0,2})/);
    if (timeMatch && deadline) {
      const hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      deadline.setHours(hour, minute, 0, 0);
      timeText += ` ${hour}:${minute.toString().padStart(2, '0')}`;
    } else if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      deadline = new Date(now); deadline.setHours(hour, minute, 0, 0);
      if (deadline < now) deadline.setDate(deadline.getDate() + 1);
      timeText = `${hour}:${minute.toString().padStart(2, '0')}`;
    }

    if (timeOfDay && !timeMatch) timeText = timeText ? `${timeText} ${timeOfDay}` : timeOfDay;

    if (!deadline) {
      if (text.includes('待会') || text.includes('等会') || text.includes('过会儿') || text.includes('过会') || text.includes('一会儿') || text.includes('稍后')) {
        deadline = new Date(now); deadline.setHours(deadline.getHours() + 2); timeText = '待会'; isFuzzy = true;
      } else if (text.includes('回头')) {
        deadline = new Date(now); deadline.setHours(deadline.getHours() + 3); timeText = '回头'; isFuzzy = true;
      } else if (text.includes('晚点')) {
        deadline = new Date(now); deadline.setHours(deadline.getHours() + 4); timeText = '晚点'; isFuzzy = true;
      } else if (text.includes('有空') || text.includes('有空的时候') || text.includes('有空再说')) {
        deadline = new Date(now); deadline.setDate(deadline.getDate() + 3); timeText = '有空时'; isFuzzy = true;
      } else if (text.includes('改天') || text.includes('哪天')) {
        deadline = new Date(now); deadline.setDate(deadline.getDate() + 5); timeText = '改天'; isFuzzy = true;
      } else if (text.includes('最近') || text.includes('这两天') || text.includes('这几天') || text.includes('这段时间')) {
        deadline = new Date(now); deadline.setDate(deadline.getDate() + 3); timeText = '最近'; isFuzzy = true;
      } else if (text.includes('以后') || text.includes('之后') || text.includes('接下来') || text.includes('随后')) {
        deadline = new Date(now); deadline.setDate(deadline.getDate() + 7); timeText = '之后'; isFuzzy = true;
      } else if (text.includes('到时候')) {
        deadline = new Date(now); deadline.setDate(deadline.getDate() + 2); timeText = '到时候'; isFuzzy = true;
      }
    }

    if (!deadline) { deadline = new Date(now); deadline.setHours(23, 59, 0, 0); timeText = timeText || '今天'; }
    return { deadline, text: timeText, isFuzzy };
  },

  detectPriorityV3(text, deadline) {
    const lowerText = text.toLowerCase();
    const now = new Date();
    for (const kw of this.autoHighPriorityKeywords) { if (lowerText.includes(kw.toLowerCase())) return 'high'; }
    for (const kw of this.priorityKeywords.high) { if (lowerText.includes(kw.toLowerCase())) return 'high'; }
    for (const kw of this.priorityKeywords.medium) { if (lowerText.includes(kw.toLowerCase())) return 'medium'; }
    for (const kw of this.priorityKeywords.low) { if (lowerText.includes(kw.toLowerCase())) return 'low'; }
    if (deadline) {
      const diffHours = (deadline - now) / (1000 * 60 * 60);
      if (diffHours <= 24) return 'high';
      if (diffHours <= 72) return 'medium';
    }
    return 'medium';
  },

  // ============ v3 智能排期引擎 ============
  scheduleTaskV3(taskInfo) {
    const now = new Date();
    const deadline = taskInfo.deadline;
    const category = taskInfo.category;
    const priority = taskInfo.priority;
    if (!deadline) return now;

    const slots = this.freeSlots[category] || [];
    let candidate = this.getInitialCandidate(now, deadline, category, priority);
    candidate = this.adjustToFreeSlot(candidate, category, slots);
    candidate = this.resolveConflict(candidate, taskInfo);
    if (candidate >= deadline) { candidate = new Date(deadline); candidate.setHours(candidate.getHours() - 2); }

    if (category === 'study' && (taskInfo.title.includes('复习') || taskInfo.title.includes('背诵') || taskInfo.title.includes('记忆'))) {
      taskInfo.reviewSchedule = this.generateEbbinghaus(candidate);
    }
    return candidate;
  },

  getInitialCandidate(now, deadline, category, priority) {
    const diffMs = deadline - now;
    const diffHours = diffMs / (1000 * 60 * 60);
    let candidate = new Date(now);

    if (category === 'work') {
      if (priority === 'high') { if (diffHours > 48) candidate = this.nextWorkHour(candidate, 9); else candidate.setHours(candidate.getHours() + 1); }
      else if (priority === 'medium') { if (diffHours > 72) { candidate = this.nextWorkHour(new Date(deadline), 10); candidate.setDate(candidate.getDate() - 2); } else { candidate = this.nextWorkHour(candidate, 10); candidate.setDate(candidate.getDate() + 1); } }
      else { if (diffHours > 168) { candidate = this.nextWorkHour(new Date(deadline), 14); candidate.setDate(candidate.getDate() - 3); } else { candidate = this.nextWorkHour(candidate, 14); candidate.setDate(candidate.getDate() + 2); } }
    } else if (category === 'study') {
      if (priority === 'high') { if (diffHours > 48) candidate = this.nextStudyHour(candidate, 19); else candidate.setHours(candidate.getHours() + 1); }
      else if (priority === 'medium') { if (diffHours > 72) { candidate = this.nextStudyHour(new Date(deadline), 19); candidate.setDate(candidate.getDate() - 2); } else { candidate = this.nextStudyHour(candidate, 19); candidate.setDate(candidate.getDate() + 1); } }
      else { if (diffHours > 168) { candidate = this.nextStudyHour(new Date(deadline), 20); candidate.setDate(candidate.getDate() - 3); } else { candidate = this.nextStudyHour(candidate, 20); candidate.setDate(candidate.getDate() + 2); } }
    } else {
      if (priority === 'high') candidate = this.nextLifeSlot(candidate);
      else if (priority === 'medium') { if (diffHours > 72) { candidate = this.nextLifeSlot(new Date(deadline)); candidate.setDate(candidate.getDate() - 2); } else { candidate = this.nextLifeSlot(candidate); candidate.setDate(candidate.getDate() + 1); } }
      else { if (diffHours > 168) { candidate = this.nextLifeSlot(new Date(deadline)); candidate.setDate(candidate.getDate() - 3); } else { candidate = this.nextLifeSlot(candidate); candidate.setDate(candidate.getDate() + 2); } }
    }
    return candidate;
  },

  nextWorkHour(date, targetHour) {
    let d = new Date(date);
    const day = d.getDay();
    if (day === 0) d.setDate(d.getDate() + 1);
    else if (day === 6) d.setDate(d.getDate() + 2);
    d.setHours(targetHour, 0, 0, 0);
    if (d < new Date()) { d.setDate(d.getDate() + 1); const nd = d.getDay(); if (nd === 0) d.setDate(d.getDate() + 1); else if (nd === 6) d.setDate(d.getDate() + 2); }
    return d;
  },

  nextStudyHour(date, targetHour) {
    let d = new Date(date);
    d.setHours(targetHour, 0, 0, 0);
    if (d < new Date()) d.setDate(d.getDate() + 1);
    return d;
  },

  nextLifeSlot(date) {
    let d = new Date(date);
    const day = d.getDay();
    const hour = d.getHours();
    if (day >= 1 && day <= 4) { if (hour < 19) d.setHours(19, 0, 0, 0); else { d.setDate(d.getDate() + (5 - day)); d.setHours(19, 0, 0, 0); } }
    else if (day === 5) { if (hour < 19) d.setHours(19, 0, 0, 0); else d.setDate(d.getDate() + 1); }
    else { if (hour >= 22) d.setDate(d.getDate() + 1); }
    return d;
  },

  adjustToFreeSlot(candidate, category, slots) {
    if (!slots || slots.length === 0) return candidate;
    const day = candidate.getDay();
    const hour = candidate.getHours();
    const todaySlots = slots.filter(s => s.day === day);
    if (todaySlots.length === 0) return this.findNextFreeDay(candidate, category);
    let inSlot = false;
    for (const slot of todaySlots) { if (hour >= slot.start && hour < slot.end) { inSlot = true; break; } }
    if (!inSlot) {
      const nextSlot = todaySlots.find(s => s.start > hour);
      if (nextSlot) candidate.setHours(nextSlot.start, 0, 0, 0);
      else return this.findNextFreeDay(candidate, category);
    }
    return candidate;
  },

  findNextFreeDay(date, category) {
    let d = new Date(date);
    const slots = this.freeSlots[category] || [];
    for (let i = 0; i < 14; i++) {
      d.setDate(d.getDate() + 1);
      const daySlots = slots.filter(s => s.day === d.getDay());
      if (daySlots.length > 0) { d.setHours(daySlots[0].start, 0, 0, 0); return d; }
    }
    return date;
  },

  resolveConflict(candidate, currentTask) {
    const CONFLICT_WINDOW = 60 * 60 * 1000;
    let adjusted = new Date(candidate);
    let attempts = 0;
    const maxAttempts = 20;
    while (attempts < maxAttempts) {
      let hasConflict = false;
      for (const task of this.tasks) {
        if (task.id === currentTask.id) continue;
        if (!task.scheduledTime) continue;
        const diff = Math.abs(adjusted - task.scheduledTime);
        if (diff < CONFLICT_WINDOW) { hasConflict = true; adjusted.setHours(adjusted.getHours() + 1); adjusted = this.adjustToFreeSlot(adjusted, currentTask.category, this.freeSlots[currentTask.category]); break; }
      }
      if (!hasConflict) break;
      attempts++;
    }
    return adjusted;
  },

  generateEbbinghaus(baseTime) {
    const intervals = [
      { label: '20分钟后', minutes: 20 },
      { label: '1小时后', minutes: 60 },
      { label: '9小时后', minutes: 9 * 60 },
      { label: '1天后', minutes: 24 * 60 },
      { label: '2天后', minutes: 2 * 24 * 60 },
      { label: '6天后', minutes: 6 * 24 * 60 },
      { label: '31天后', minutes: 31 * 24 * 60 }
    ];
    return intervals.map(iv => { const t = new Date(baseTime); t.setMinutes(t.getMinutes() + iv.minutes); return { label: iv.label, time: t }; });
  },

  checkOverload() {
    const now = new Date();
    const next24h = this.tasks.filter(t => t.deadline && (t.deadline - now) < 24 * 60 * 60 * 1000);
    const next72h = this.tasks.filter(t => t.deadline && (t.deadline - now) < 72 * 60 * 60 * 1000);
    if (next24h.length > 5) return { overloaded: true, message: `未来24小时有 ${next24h.length} 个任务，建议拆分或调整优先级`, tasks: next24h };
    if (next72h.length > 10) return { overloaded: true, message: `未来3天有 ${next72h.length} 个任务，建议重新规划`, tasks: next72h };
    return { overloaded: false };
  },

  changePriority(taskId, newPriority) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;
    task.priority = newPriority;
    task.scheduledTime = this.scheduleTaskV3(task);
    this.renderTasks();
    this.addLog('detected', `优先级调整: ${task.title} -> ${this.priorityLabel(newPriority)}`);
    this.showToast('已调整优先级并重新排期');
    this.closeModal();
    setTimeout(() => this.showTaskDetail(taskId), 100);
  },

  // ============ 空闲时间段设置 ============
  toggleScheduleSettings() {
    const panel = document.getElementById('scheduleSettingsPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') this.renderScheduleSettings();
  },
  renderScheduleSettings() {
    const container = document.getElementById('scheduleSlotsContainer');
    const days = ['周日','周一','周二','周三','周四','周五','周六'];
    const categories = [
      { key: 'work', label: '工作', color: 'var(--accent)' },
      { key: 'study', label: '学习', color: 'var(--accent2)' },
      { key: 'life', label: '生活', color: 'var(--success)' }
    ];
    let html = '';
    categories.forEach(cat => {
      html += `<div class="schedule-category"><h4 style="color:${cat.color};margin-bottom:8px;">${cat.label}空闲时段</h4>`;
      const slots = this.freeSlots[cat.key] || [];
      html += `<div class="slots-grid">`;
      for (let d = 0; d < 7; d++) {
        const daySlots = slots.filter(s => s.day === d);
        html += `<div class="slot-day">`;
        html += `<div class="slot-day-label">${days[d]}</div>`;
        if (daySlots.length > 0) {
          daySlots.forEach((slot, idx) => {
            html += `<div class="slot-item"><span>${slot.start}:00 - ${slot.end}:00</span><span class="slot-remove" onclick="app.removeFreeSlot('${cat.key}', ${d}, ${idx})">&times;</span></div>`;
          });
        }
        html += `<div class="slot-add" onclick="app.addFreeSlot('${cat.key}', ${d})">+ 添加</div>`;
        html += `</div>`;
      }
      html += `</div></div>`;
    });
    container.innerHTML = html;
  },
  addFreeSlot(category, day) {
    const start = prompt(`设置 ${['周日','周一','周二','周三','周四','周五','周六'][day]} 的开始时间 (0-23):`, '9');
    if (start === null) return;
    const end = prompt('结束时间 (0-23):', '18');
    if (end === null) return;
    const s = parseInt(start);
    const e = parseInt(end);
    if (isNaN(s) || isNaN(e) || s < 0 || s > 23 || e < 0 || e > 23 || s >= e) { alert('时间格式不正确'); return; }
    if (!this.freeSlots[category]) this.freeSlots[category] = [];
    this.freeSlots[category].push({ day, start: s, end: e });
    this.saveFreeSlots();
    this.renderScheduleSettings();
    this.showToast('空闲时段已更新');
  },
  removeFreeSlot(category, day, index) {
    const daySlots = this.freeSlots[category].filter(s => s.day === day);
    const slotToRemove = daySlots[index];
    this.freeSlots[category] = this.freeSlots[category].filter(s => s !== slotToRemove);
    this.saveFreeSlots();
    this.renderScheduleSettings();
  },
  resetFreeSlots() {
    this.freeSlots = JSON.parse(JSON.stringify(this.defaultFreeSlots));
    this.saveFreeSlots();
    this.renderScheduleSettings();
    this.showToast('已恢复默认空闲时段');
  },

  // ============ v5 消息监控面板 ============
  toggleMessageMonitorPanel() {
    const panel = document.getElementById('messageMonitorPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  },
  togglePlatformMonitor(platform) {
    const checkbox = document.getElementById('enable' + platform.charAt(0).toUpperCase() + platform.slice(1));
    const statusEl = document.getElementById(platform + 'Status');
    this.messageMonitor.enabled[platform] = checkbox.checked;
    if (checkbox.checked) {
      statusEl.textContent = '监控中';
      statusEl.classList.add('active');
      this.showToast(`已开启${this.platformLabel(platform)}监控`, 'success');
      this.addLog('detected', `开启${this.platformLabel(platform)}消息监控`);
      this.loadDemoGroups(platform);
      document.getElementById('groupSection').style.display = 'block';
    } else {
      statusEl.textContent = '未开启';
      statusEl.classList.remove('active');
      this.showToast(`已关闭${this.platformLabel(platform)}监控`);
      this.addLog('filtered', `关闭${this.platformLabel(platform)}消息监控`);
    }
    this.renderGroupList();
  },
  platformLabel(p) { return { wechat: '网页版微信', qq: '网页版QQ', dingtalk: '网页版钉钉' }[p] || p; },
  loadDemoGroups(platform) {
    const demoGroups = {
      wechat: [
        { id: 'wx_1', name: '班级群（高数）', source: 'wechat', checked: true },
        { id: 'wx_2', name: '工作项目群', source: 'wechat', checked: true },
        { id: 'wx_3', name: '家庭群', source: 'wechat', checked: false },
        { id: 'wx_4', name: '室友群', source: 'wechat', checked: false },
        { id: 'wx_5', name: '课程通知群', source: 'wechat', checked: true }
      ],
      qq: [
        { id: 'qq_1', name: '学生会通知群', source: 'qq', checked: true },
        { id: 'qq_2', name: '实验室群组', source: 'qq', checked: true },
        { id: 'qq_3', name: '游戏开黑群', source: 'qq', checked: false },
        { id: 'qq_4', name: '老乡群', source: 'qq', checked: false }
      ],
      dingtalk: [
        { id: 'dt_1', name: '部门工作群', source: 'dingtalk', checked: true },
        { id: 'dt_2', name: '公司全员群', source: 'dingtalk', checked: false },
        { id: 'dt_3', name: '项目开发群', source: 'dingtalk', checked: true }
      ]
    };
    const newGroups = demoGroups[platform] || [];
    newGroups.forEach(g => {
      if (!this.messageMonitor.groups.find(existing => existing.id === g.id)) {
        this.messageMonitor.groups.push(g);
        if (g.checked) this.messageMonitor.selectedGroups.add(g.id);
      }
    });
  },
  renderGroupList() {
    const container = document.getElementById('groupList');
    if (this.messageMonitor.groups.length === 0) {
      container.innerHTML = '<div class="group-empty">请先开启上方平台开关，模拟加载群列表</div>';
      return;
    }
    container.innerHTML = this.messageMonitor.groups.map(g => `
      <label class="group-item">
        <input type="checkbox" ${this.messageMonitor.selectedGroups.has(g.id) ? 'checked' : ''}
          onchange="app.toggleGroup('${g.id}')">
        <span class="group-item-name">${this.escapeHtml(g.name)}</span>
        <span class="group-item-source">${this.platformLabel(g.source)}</span>
      </label>
    `).join('');
  },
  toggleGroup(groupId) {
    if (this.messageMonitor.selectedGroups.has(groupId)) {
      this.messageMonitor.selectedGroups.delete(groupId);
    } else {
      this.messageMonitor.selectedGroups.add(groupId);
    }
  },
  selectAllGroups(select) {
    if (select) {
      this.messageMonitor.groups.forEach(g => this.messageMonitor.selectedGroups.add(g.id));
    } else {
      this.messageMonitor.selectedGroups.clear();
    }
    this.renderGroupList();
  },
  clearMessageLogs() {
    this.messageMonitor.messageLogs = [];
    this.showToast('已清空消息记录');
    this.addLog('filtered', '清空消息捕获记录');
  },

  // ============ v5 消息捕获与处理 ============
  simulateMessage(element) {
    const source = element.querySelector('.demo-source').textContent;
    const text = element.querySelector('.demo-text').textContent;
    this.processMessageTask(text, source, 'demo');
  },
  simulateCustomMessage() {
    const input = document.getElementById('customDemoMsg');
    const text = input.value.trim();
    if (!text) return;
    this.processMessageTask(text, '[自定义消息]', 'demo');
    input.value = '';
  },
  processMessageTask(text, sourceGroup, platform) {
    const isMonitored = this.isGroupMonitored(sourceGroup);
    if (!isMonitored && platform !== 'demo') {
      this.addLog('filtered', `非监控群消息: ${text.substring(0, 30)}`);
      return;
    }
    if (!this.containsTaskKeyword(text)) {
      this.addLog('filtered', `非任务消息: ${text.substring(0, 30)}`);
      return;
    }
    const taskInfo = this.extractTaskFromMessage(text, sourceGroup);
    if (!taskInfo) {
      this.addLog('filtered', `无法识别任务: ${text.substring(0, 30)}`);
      return;
    }
    const duplicate = this.findDuplicateTask(taskInfo);
    if (duplicate) {
      this.addLog('detected', `合并重复任务: ${taskInfo.title}`);
      this.showToast(`检测到重复任务，已合并: ${taskInfo.title}`, 'warning');
      return;
    }
    taskInfo.source = 'message';
    taskInfo.sourceGroup = sourceGroup;
    taskInfo.platform = platform;
    taskInfo.confidence = Math.min(100, taskInfo.confidence + 15);
    if (taskInfo.priority !== 'high') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const currentP = priorityOrder[taskInfo.priority] || 2;
      const newP = Math.min(3, currentP + 1);
      taskInfo.priority = Object.keys(priorityOrder).find(k => priorityOrder[k] === newP) || 'medium';
    }
    this.addTask(taskInfo);
    this.messageMonitor.messageLogs.unshift({ text, source: sourceGroup, time: new Date(), taskTitle: taskInfo.title });
    this.addLog('detected', `群消息捕获: [${sourceGroup}] ${taskInfo.title}`);
    this.showHighIntensityReminder(taskInfo, sourceGroup);
  },
  isGroupMonitored(sourceGroup) {
    if (this.messageMonitor.selectedGroups.size === 0) return true;
    const groupName = sourceGroup.replace(/[\[\]]/g, '');
    const group = this.messageMonitor.groups.find(g => g.name.includes(groupName) || groupName.includes(g.name));
    return group && this.messageMonitor.selectedGroups.has(group.id);
  },
  containsTaskKeyword(text) {
    const lower = text.toLowerCase();
    return this.messageMonitor.captureKeywords.some(kw => lower.includes(kw.toLowerCase()));
  },
  extractTaskFromMessage(text, sourceGroup) {
    const taskInfo = this.extractTask(text);
    if (!taskInfo) return null;
    const groupLower = sourceGroup.toLowerCase();
    if (groupLower.includes('班') || groupLower.includes('课程') || groupLower.includes('考试') || groupLower.includes('导师')) {
      taskInfo.category = 'study';
    } else if (groupLower.includes('工作') || groupLower.includes('项目') || groupLower.includes('部门') || groupLower.includes('公司')) {
      taskInfo.category = 'work';
    }
    return taskInfo;
  },
  findDuplicateTask(newTask) {
    return this.tasks.find(t => {
      if (t.source === newTask.source) return false;
      const titleSim = this.textSimilarity(t.title, newTask.title);
      const timeDiff = Math.abs((t.deadline - newTask.deadline) / (1000 * 60 * 60));
      return titleSim > 0.6 && timeDiff < 48;
    });
  },
  textSimilarity(a, b) {
    const sa = a.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').toLowerCase();
    const sb = b.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').toLowerCase();
    if (!sa || !sb) return 0;
    const setA = new Set(sa.split(''));
    const setB = new Set(sb.split(''));
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    return intersection.size / Math.max(setA.size, setB.size);
  },
  showHighIntensityReminder(task, sourceGroup) {
    const reminderHtml = `
      <div class="message-reminder">
        <div class="reminder-icon">📢</div>
        <div class="reminder-content">
          <div class="reminder-title">群消息任务捕获</div>
          <div class="reminder-msg">${this.escapeHtml(task.title)}</div>
          <div class="reminder-time">来源: ${this.escapeHtml(sourceGroup)} | 截止: ${task.deadlineText}</div>
        </div>
      </div>
    `;
    this.showToast(reminderHtml, 'warning');
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`群消息任务提醒：${task.title}，来自${sourceGroup}，已自动排期`);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.1;
      speechSynthesis.speak(utterance);
    }
  },

  // ============ 手动添加任务 ============
  toggleAddTaskPanel() {
    const panel = document.getElementById('addTaskPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  },
  addManualTask() {
    const title = document.getElementById('manualTaskTitle').value.trim();
    if (!title) { alert('请输入任务内容'); return; }
    const category = document.querySelector('input[name="manualCategory"]:checked').value;
    const deadlineInput = document.getElementById('manualDeadline').value;
    const priority = document.querySelector('input[name="manualPriority"]:checked').value;

    let deadline = new Date();
    if (deadlineInput) { deadline = new Date(deadlineInput); }
    else { deadline.setHours(23, 59, 0, 0); }

    const taskId = Date.now() + Math.random().toString(36).substr(2, 6);
    const taskInfo = {
      id: taskId, title, rawText: title, category, priority,
      deadline, deadlineText: this.formatDateShort(deadline),
      scheduledTime: null, confidence: 100, parentTaskId: null,
      createdAt: new Date(), isFuzzy: false
    };
    taskInfo.scheduledTime = this.scheduleTaskV3(taskInfo);
    this.addTask(taskInfo);
    this.addLog('detected', `手动添加: ${title}`);
    this.showToast(`已添加任务: ${title}`);

    document.getElementById('manualTaskTitle').value = '';
    document.getElementById('manualDeadline').value = '';
    this.toggleAddTaskPanel();
  },

  // ============ 导出日程 ============
  exportSchedule() {
    if (this.tasks.length === 0) { this.showToast('暂无任务可导出', 'warning'); return; }
    const sortedTasks = [...this.tasks].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) return priorityOrder[a.priority] - priorityOrder[b.priority];
      return a.deadline - b.deadline;
    });

    let textExport = `AI被动任务管家 - 日程导出\n导出时间: ${new Date().toLocaleString('zh-CN')}\n共 ${this.tasks.length} 个任务\n${'='.repeat(40)}\n\n`;
    sortedTasks.forEach((task, i) => {
      textExport += `${i + 1}. [${this.categoryLabel(task.category)}] ${task.title}\n   优先级: ${this.priorityLabel(task.priority)}\n   截止: ${task.deadlineText} (${this.formatDateFull(task.deadline)})\n   排期: ${this.formatDateFull(task.scheduledTime)}\n\n`;
    });

    let htmlExport = `<div class="export-preview"><h4>日程列表 (${this.tasks.length} 个任务)</h4><div class="export-tasks">`;
    sortedTasks.forEach((task, i) => {
      htmlExport += `<div class="export-task-item">
        <div class="export-task-header">
          <span class="export-task-num">${i + 1}</span>
          <span class="task-category ${task.category}">${this.categoryLabel(task.category)}</span>
          <span class="export-task-title">${this.escapeHtml(task.title)}</span>
        </div>
        <div class="export-task-meta">
          <span>优先级: ${this.priorityLabel(task.priority)}</span>
          <span>截止: ${task.deadlineText}</span>
          <span>排期: ${this.formatDateShort(task.scheduledTime)}</span>
        </div>
      </div>`;
    });
    htmlExport += `</div><textarea id="exportTextArea" style="display:none;">${this.escapeHtml(textExport)}</textarea></div>`;

    document.getElementById('exportBody').innerHTML = htmlExport;
    document.getElementById('exportOverlay').classList.add('show');
  },
  closeExport(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('exportOverlay').classList.remove('show');
  },
  copyExportText() {
    const textarea = document.getElementById('exportTextArea');
    if (textarea) {
      navigator.clipboard.writeText(textarea.value).then(() => {
        this.showToast('已复制到剪贴板');
      }).catch(() => {
        textarea.style.display = 'block';
        textarea.select();
        document.execCommand('copy');
        textarea.style.display = 'none';
        this.showToast('已复制到剪贴板');
      });
    }
  },

  // ============ 最小化悬浮球 ============
  minimizeToBubble() {
    this.isMinimized = true;
    document.getElementById('mainApp').style.display = 'none';
    const bubble = document.getElementById('bubbleMode');
    bubble.style.display = 'flex';
    this.updateBubbleBadge();
    this.showToast('已最小化到悬浮球，点击展开', 'success');
  },
  restoreFromBubble() {
    this.isMinimized = false;
    document.getElementById('mainApp').style.display = 'flex';
    document.getElementById('bubbleMode').style.display = 'none';
    document.getElementById('bubbleMenu').style.display = 'none';
  },
  toggleBubbleMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('bubbleMenu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    document.getElementById('bubbleMenuListenText').textContent = this.isListening ? '暂停监听' : '开启监听';
  },
  toggleListeningFromBubble() {
    this.toggleListening();
    document.getElementById('bubbleMenuListenText').textContent = this.isListening ? '暂停监听' : '开启监听';
  },
  updateBubbleBadge() {
    const badge = document.getElementById('bubbleBadge');
    const count = this.tasks.length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  },

  // ============ 主动提醒系统 ============
  initReminderLoop() {
    setInterval(() => { this.checkReminders(); }, 30000);
  },
  checkReminders() {
    const now = new Date();
    this.tasks.forEach(task => {
      if (!task.deadline || task.reminded) return;
      const diffMs = task.deadline - now;
      const diffMins = diffMs / (1000 * 60);
      if (diffMins <= 15 && diffMins > 0 && !task.reminded15) {
        task.reminded15 = true;
        this.showReminder(task, '15分钟后截止');
      }
      if (diffMins <= 30 && diffMins > 15 && !task.reminded30) {
        task.reminded30 = true;
        this.showReminder(task, '30分钟后截止');
      }
      if (diffMins <= 0 && !task.reminded) {
        task.reminded = true;
        this.showReminder(task, '已到期');
      }
    });
  },
  showReminder(task, message) {
    const reminderHtml = `
      <div class="reminder-popup">
        <div class="reminder-icon">${task.category === 'work' ? '&#128188;' : task.category === 'study' ? '&#128218;' : '&#127968;'}</div>
        <div class="reminder-content">
          <div class="reminder-title">${this.escapeHtml(task.title)}</div>
          <div class="reminder-msg">${message}</div>
          <div class="reminder-time">截止: ${task.deadlineText}</div>
        </div>
      </div>
    `;
    this.showToast(reminderHtml, 'warning');

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`任务提醒：${task.title}，${message}`);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.1;
      speechSynthesis.speak(utterance);
    }
  },

  // ============ 隐私优化 ============
  dismissPrivacyBanner() {
    document.getElementById('privacyBanner').style.display = 'none';
    try { localStorage.setItem('ai-task-manager-privacy-dismissed', 'true'); } catch(e) {}
  },
  clearAllLogs() {
    if (this.logs.length === 0) return;
    if (!confirm('确定清空所有识别记录吗？')) return;
    this.logs = [];
    this.transcriptHistory = [];
    this.renderLogs();
    this.renderTranscripts();
    this.showToast('已清空所有识别记录');
  },

  // ============ 置信度确认弹窗 ============
  showConfirm(taskInfo) {
    this.pendingConfirm = taskInfo;
    const body = document.getElementById('confirmBody');
    body.innerHTML = `
      <p style="margin-bottom:16px;color:var(--muted);font-size:0.85rem;">识别到可能的任务，请确认是否加入日程：</p>
      <div class="confirm-task-preview">
        <div class="confirm-title">${this.escapeHtml(taskInfo.title)}</div>
        <div class="confirm-meta">
          <span class="task-category ${taskInfo.category}">${this.categoryLabel(taskInfo.category)}</span>
          <span>截止: ${taskInfo.deadlineText}</span>
          <span>置信度: <strong style="color:${taskInfo.confidence >= 60 ? 'var(--warning)' : 'var(--muted)'}">${Math.round(taskInfo.confidence)}%</strong></span>
        </div>
      </div>
      <div class="confirm-raw" style="margin-top:12px;">
        <span style="color:var(--muted);font-size:0.8rem;">原始语音: </span>
        <span style="font-size:0.85rem;color:var(--muted);">${this.escapeHtml(taskInfo.rawText)}</span>
      </div>`;
    document.getElementById('confirmOverlay').classList.add('show');
  },
  acceptConfirm() {
    if (this.pendingConfirm) {
      this.addTask(this.pendingConfirm);
      this.addLog('detected', `确认任务(${Math.round(this.pendingConfirm.confidence)}%): ${this.pendingConfirm.title}`);
      this.showToast(`已加入: ${this.pendingConfirm.title}`);
      this.pendingConfirm = null;
    }
    this.closeConfirm();
  },
  rejectConfirm() {
    if (this.pendingConfirm) { this.addLog('filtered', `用户忽略: ${this.pendingConfirm.title}`); this.pendingConfirm = null; }
    this.closeConfirm();
  },
  closeConfirm(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('confirmOverlay').classList.remove('show');
  },

  // ============ Toast通知 ============
  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);
    requestAnimationFrame(() => { toast.classList.add('show'); });
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  // ============ 任务管理 ============
  addTask(taskInfo) {
    if (!taskInfo.scheduledTime) taskInfo.scheduledTime = this.scheduleTaskV3(taskInfo);
    this.tasks.unshift(taskInfo);
    const overload = this.checkOverload();
    if (overload.overloaded) { this.showToast(overload.message, 'warning'); this.addLog('detected', overload.message); }
    this.renderTasks();
    this.updateBubbleBadge();
  },
  addTranscript(text) {
    this.transcriptHistory.unshift({ text, time: new Date() });
    this.renderTranscripts();
  },
  addLog(type, message) {
    this.logs.unshift({ type, message, time: new Date() });
    if (this.logs.length > 50) this.logs = this.logs.slice(0, 50);
    this.renderLogs();
  },
  toggleListening() {
    if (!this.recognition) { this.addLog('error', '语音识别未初始化'); return; }
    if (this.isListening) {
      this.recognition.stop();
      document.getElementById('toggleBtnText').textContent = '启动监听';
      this.updateStatus('ready', '已停止');
      this.addLog('filtered', '监听已停止');
    } else {
      this.networkErrorCount = 0;
      try { this.recognition.start(); document.getElementById('toggleBtnText').textContent = '停止监听'; }
      catch (e) { this.addLog('error', '启动失败: ' + e.message); }
    }
  },

  // ============ UI渲染 ============
  updateUIState(listening) {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    const badge = document.getElementById('listenBadge');
    const btn = document.getElementById('toggleBtn');
    const visualizer = document.getElementById('audioVisualizer');
    if (listening) {
      dot.classList.add('active'); dot.classList.remove('error');
      text.textContent = '监听中';
      badge.textContent = '监听中'; badge.classList.add('listening');
      btn.classList.add('listening');
      visualizer.classList.add('active');
    } else {
      dot.classList.remove('active');
      text.textContent = '已停止';
      badge.textContent = '等待中'; badge.classList.remove('listening');
      btn.classList.remove('listening');
      visualizer.classList.remove('active');
    }
  },
  updateStatus(state, message) {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    text.textContent = message;
    if (state === 'error') { dot.classList.add('error'); dot.classList.remove('active'); }
    else if (state === 'ready') { dot.classList.remove('error', 'active'); }
  },
  renderTranscripts() {
    const box = document.getElementById('transcriptBox');
    if (this.transcriptHistory.length === 0) {
      box.innerHTML = `
        <div class="transcript-placeholder">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.3">
            <rect x="8" y="20" width="4" height="16" rx="2" fill="var(--muted)"/>
            <rect x="16" y="14" width="4" height="22" rx="2" fill="var(--muted)"/>
            <rect x="24" y="8" width="4" height="28" rx="2" fill="var(--muted)"/>
            <rect x="32" y="14" width="4" height="22" rx="2" fill="var(--muted)"/>
            <rect x="40" y="20" width="4" height="16" rx="2" fill="var(--muted)"/>
          </svg>
          <p>打开麦克风后，我将自动识别语音中的任务信息</p>
          <p class="sub">需同时包含「动作事项」+「时间要求」才会被识别为任务</p>
        </div>`;
      return;
    }
    box.innerHTML = '<div class="transcript-content">' +
      this.transcriptHistory.map(t => {
        const taskInfo = this.extractTask(t.text);
        const isTask = !!taskInfo;
        const isNeg = this.isNegation(t.text);
        return `<div class="transcript-line ${isTask ? '' : 'filtered'} ${isNeg ? 'negation' : ''}"><div class="time">${this.formatTime(t.time)}</div><div>${this.escapeHtml(t.text)}</div>${isTask ? `<div class="confidence-tag ${taskInfo.confidence >= 80 ? 'high' : taskInfo.confidence >= 50 ? 'medium' : 'low'}">${Math.round(taskInfo.confidence)}%</div>` : ''}</div>`;
      }).join('') +
    '</div>';
  },
  renderTasks() {
    const list = document.getElementById('taskList');
    const count = document.getElementById('taskCount');
    count.textContent = `${this.tasks.length} 个任务`;
    if (this.tasks.length === 0) {
      list.innerHTML = `
        <div class="task-empty">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" opacity="0.25">
            <rect x="12" y="8" width="40" height="48" rx="4" stroke="var(--muted)" stroke-width="2"/>
            <line x1="20" y1="20" x2="44" y2="20" stroke="var(--muted)" stroke-width="2"/>
            <line x1="20" y1="28" x2="44" y2="28" stroke="var(--muted)" stroke-width="2"/>
            <line x1="20" y1="36" x2="36" y2="36" stroke="var(--muted)" stroke-width="2"/>
            <circle cx="46" cy="46" r="10" stroke="var(--accent)" stroke-width="2"/>
            <line x1="40" y1="46" x2="52" y2="46" stroke="var(--accent)" stroke-width="2"/>
            <line x1="46" y1="40" x2="46" y2="52" stroke="var(--accent)" stroke-width="2"/>
          </svg>
          <p>暂无识别到任务</p>
          <p class="sub">开启监听后，自动识别语音中的任务并排期</p>
        </div>`;
      return;
    }
    const sortedTasks = [...this.tasks].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) return priorityOrder[a.priority] - priorityOrder[b.priority];
      return a.deadline - b.deadline;
    });
    list.innerHTML = sortedTasks.map(task => `
      <div class="task-item" onclick="app.showTaskDetail('${task.id}')">
        <div class="task-priority ${task.priority}"></div>
        <div class="task-content">
          <div class="task-title">${this.escapeHtml(task.title)}</div>
          <div class="task-meta">
            <span class="task-category ${task.category}">${this.categoryLabel(task.category)}</span>
            <span class="task-source ${task.source || 'voice'}">${this.sourceLabel(task.source)}</span>
            <span>截止: ${task.deadlineText}</span>
            <span>排期: ${this.formatDateShort(task.scheduledTime)}</span>
            <span class="confidence-mini ${task.confidence >= 80 ? 'high' : 'medium'}">${Math.round(task.confidence)}%</span>
          </div>
        </div>
      </div>
    `).join('');
  },
  renderLogs() {
    const list = document.getElementById('logList');
    if (this.logs.length === 0) { list.innerHTML = '<div class="log-empty">暂无记录</div>'; return; }
    list.innerHTML = this.logs.map(log => `
      <div class="log-item">
        <span class="log-time">${this.formatTime(log.time)}</span>
        <span class="log-type ${log.type}">${this.logTypeLabel(log.type)}</span>
        <span class="log-text">${this.escapeHtml(log.message)}</span>
      </div>
    `).join('');
  },
  showTaskDetail(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;
    const body = document.getElementById('modalBody');
    let reviewHtml = '';
    if (task.reviewSchedule && task.reviewSchedule.length > 0) {
      reviewHtml = `<div class="detail-row"><div class="detail-label">艾宾浩斯复习</div><div class="detail-value"><div class="review-list">${task.reviewSchedule.map(r => `<div class="review-item"><span class="review-label">${r.label}</span><span class="review-time">${this.formatDateShort(r.time)}</span></div>`).join('')}</div></div></div>`;
    }
    let sourceHtml = '';
    if (task.source === 'message' && task.sourceGroup) {
      sourceHtml = `<div class="detail-row"><div class="detail-label">消息来源</div><div class="detail-value"><span class="task-source message">群消息捕获</span> ${this.escapeHtml(task.sourceGroup)}</div></div>`;
    } else if (task.source === 'manual') {
      sourceHtml = `<div class="detail-row"><div class="detail-label">添加方式</div><div class="detail-value"><span class="task-source manual">手动添加</span></div></div>`;
    } else {
      sourceHtml = `<div class="detail-row"><div class="detail-label">添加方式</div><div class="detail-value"><span class="task-source voice">语音采集</span></div></div>`;
    }
    body.innerHTML = `
      <div class="detail-row"><div class="detail-label">任务内容</div><div class="detail-value">${this.escapeHtml(task.title)}</div></div>
      <div class="detail-row"><div class="detail-label">场景类别</div><div class="detail-value"><span class="task-category ${task.category}">${this.categoryLabel(task.category)}</span></div></div>
      ${sourceHtml}
      <div class="detail-row"><div class="detail-label">优先级</div><div class="detail-value"><span class="priority-current ${task.priority}">${this.priorityLabel(task.priority)}</span><span class="priority-actions"><button class="btn-priority ${task.priority === 'high' ? 'active' : ''}" onclick="app.changePriority('${task.id}', 'high')">高</button><button class="btn-priority ${task.priority === 'medium' ? 'active' : ''}" onclick="app.changePriority('${task.id}', 'medium')">中</button><button class="btn-priority ${task.priority === 'low' ? 'active' : ''}" onclick="app.changePriority('${task.id}', 'low')">低</button></span></div></div>
      <div class="detail-row"><div class="detail-label">截止时间</div><div class="detail-value">${task.deadlineText} (${this.formatDateFull(task.deadline)})</div></div>
      <div class="detail-row"><div class="detail-label">建议执行</div><div class="detail-value" style="color: var(--accent); font-weight: 600;">${this.formatDateFull(task.scheduledTime)}</div></div>
      <div class="detail-row"><div class="detail-label">置信度</div><div class="detail-value"><span class="confidence-bar"><span class="confidence-fill ${task.confidence >= 80 ? 'high' : task.confidence >= 50 ? 'medium' : 'low'}" style="width:${task.confidence}%"></span></span><span style="margin-left:8px;font-size:0.85rem;">${Math.round(task.confidence)}%</span></div></div>
      ${task.parentTaskId ? `<div class="detail-row"><div class="detail-label">关联任务</div><div class="detail-value" style="color:var(--accent2);">上下文关联子项</div></div>` : ''}
      ${reviewHtml}
      <div class="detail-row"><div class="detail-label">原始内容</div><div class="detail-value" style="color: var(--muted); font-size: 0.85rem;">${this.escapeHtml(task.rawText)}</div></div>
      <div class="detail-row"><div class="detail-label">识别时间</div><div class="detail-value">${this.formatDateFull(task.createdAt)}</div></div>
    `;
    document.getElementById('modalOverlay').classList.add('show');
  },
  closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('modalOverlay').classList.remove('show');
  },
  clearAllTasks() {
    if (this.tasks.length === 0) return;
    if (!confirm('确定清空所有任务吗？')) return;
    this.tasks = [];
    this.contextWindow = [];
    this.renderTasks();
    this.updateBubbleBadge();
    this.addLog('filtered', '已清空所有任务');
  },

  // ============ 工具方法 ============
  categoryLabel(cat) { return { work: '工作', study: '学习', life: '生活' }[cat] || '其他'; },
  priorityLabel(p) { return { high: '高优先级', medium: '中优先级', low: '低优先级' }[p] || '中优先级'; },
  logTypeLabel(type) { return { detected: '已识别', filtered: '已过滤', error: '错误' }[type] || type; },
  sourceLabel(source) { return { voice: '语音采集', message: '群消息捕获', manual: '手动添加' }[source] || '语音采集'; },
  formatTime(date) { return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); },
  formatDateShort(date) {
    if (!date) return '-';
    const now = new Date();
    const d = new Date(date);
    const diffDays = Math.floor((d - now) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return `今天 ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
    if (diffDays === 1) return `明天 ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
    if (diffDays === 2) return `后天 ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  },
  formatDateFull(date) {
    if (!date) return '-';
    return new Date(date).toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  },
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// 悬浮球右键菜单
document.addEventListener('DOMContentLoaded', () => {
  app.init();

  const bubble = document.getElementById('bubbleMode');
  if (bubble) {
    bubble.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      app.toggleBubbleMenu(e);
    });
  }
});
