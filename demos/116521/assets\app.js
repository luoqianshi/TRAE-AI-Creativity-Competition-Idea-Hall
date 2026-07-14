/* ============================================================
 * 费曼录音转写官 · 学习打卡系统 v2
 * 融合：语音识别 / 手动输入 / 卡片生成 / 打卡 / 日历 / 阶段进度
 * ============================================================ */
(function () {
  'use strict';

  /* ==================== 备考配置 ==================== */
  var CONFIG = {
    startDate: '2026-07-01',
    examDate: '2026-10-18',
    totalWeeks: 15,
    subjects: ['中国近现代史纲要（03708）', '马克思主义基本原理（03709）']
  };

  var PHASES = [
    { name: '基础通读', weeks: [1, 4], color: '#10b981', icon: '📚', desc: '通读2本教材，理解为主，知道每章讲什么' },
    { name: '真题攻坚', weeks: [5, 10], color: '#3b82f6', icon: '✏️', desc: '刷真题选择题，标记高频考点，正确率≥70%' },
    { name: '大题背诵', weeks: [11, 14], color: '#8b5cf6', icon: '🧠', desc: '背大题模板+高频考点，能写出80%的大题要点' },
    { name: '考前冲刺', weeks: [15, 15], color: '#f97316', icon: '🏃', desc: '模拟考试+查漏补缺，调整状态，轻松应考' }
  ];

  var WEEKLY_TASKS = {
    1: { subject: '近代史', task: '第1-3章：反对外国侵略的斗争、对国家出路的早期探索、辛亥革命' },
    2: { subject: '马原', task: '第3-4章：人类社会及其发展规律、资本主义的本质及规律' },
    3: { subject: '近代史', task: '第7-9章：为新中国而奋斗、社会主义基本制度在中国的确立、社会主义建设在探索中曲折发展' },
    4: { subject: '马原', task: '第5-7章：资本主义的发展及其趋势、社会主义的发展及其规律、共产主义崇高理想' },
    5: { subject: '近代史', task: '刷2022-2023年真题选择题（共4套）' },
    6: { subject: '马原', task: '刷2022-2023年真题选择题（共4套）' },
    7: { subject: '近代史', task: '刷2020-2021年真题选择题（共4套）' },
    8: { subject: '马原', task: '刷2020-2021年真题选择题（共4套）' },
    9: { subject: '近代史', task: '错题回顾 + 开始背诵简答题' },
    10: { subject: '马原', task: '错题回顾 + 开始背诵简答题' },
    11: { subject: '近代史', task: '背20道高频简答题' },
    12: { subject: '马原', task: '背20道高频简答题' },
    13: { subject: '近代史', task: '背论述题+材料题模板' },
    14: { subject: '马原', task: '背论述题+材料题模板' },
    15: { subject: '综合', task: '模拟考试 + 查漏补缺 + 调整状态' }
  };

  /* ==================== 打卡数据存储 ==================== */
  var CheckInStore = {
    KEY: 'zikao_checkin_data',

    getData: function () {
      try {
        var raw = localStorage.getItem(this.KEY);
        return raw ? JSON.parse(raw) : { checkIns: [], streak: 0, lastCheckIn: null };
      } catch (e) {
        return { checkIns: [], streak: 0, lastCheckIn: null };
      }
    },

    save: function (data) {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    },

    isChecked: function (dateStr) {
      return this.getData().checkIns.indexOf(dateStr) >= 0;
    },

    toggle: function (dateStr) {
      var data = this.getData();
      var idx = data.checkIns.indexOf(dateStr);
      if (idx >= 0) {
        data.checkIns.splice(idx, 1);
      } else {
        data.checkIns.push(dateStr);
      }
      data.streak = this.calcStreak(data.checkIns);
      // FIX: lastCheckIn 取最大日期而非数组末尾
      data.lastCheckIn = data.checkIns.length > 0
        ? data.checkIns.slice().sort().pop()
        : null;
      this.save(data);
      return data;
    },

    calcStreak: function (checkIns) {
      var streak = 0;
      var d = new Date();
      while (checkIns.indexOf(this.formatDate(d)) >= 0) {
        streak++;
        d.setDate(d.getDate() - 1);
      }
      return streak;
    },

    formatDate: function (d) {
      var y = d.getFullYear();
      var m = ('0' + (d.getMonth() + 1)).slice(-2);
      var day = ('0' + d.getDate()).slice(-2);
      return y + '-' + m + '-' + day;
    }
  };

  /* ==================== 费曼记录存储 ==================== */
  var FeynmanStore = {
    KEY: 'feynman_records_v1',
    SEED_KEY: 'feynman_seeded_v1',

    getAll: function () {
      try {
        var raw = localStorage.getItem(this.KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    },
    save: function (records) { localStorage.setItem(this.KEY, JSON.stringify(records)); },
    addRecord: function (transcript, cards) {
      var records = this.getAll();
      var now = new Date();
      records.unshift({
        id: 'r_' + now.getTime(),
        date: CheckInStore.formatDate(now),
        time: ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2),
        timestamp: now.getTime(),
        transcript: transcript, cards: cards
      });
      this.save(records);
    },
    deleteRecord: function (id) {
      this.save(this.getAll().filter(function (r) { return r.id !== id; }));
    },
    search: function (keyword) {
      var records = this.getAll();
      if (!keyword) return records;
      var kw = keyword.toLowerCase();
      return records.map(function (r) {
        var matched = r.cards.filter(function (c) {
          return (c.title && c.title.toLowerCase().indexOf(kw) >= 0) ||
                 (c.desc && c.desc.toLowerCase().indexOf(kw) >= 0) ||
                 (c.tags && c.tags.some(function (t) { return t.toLowerCase().indexOf(kw) >= 0; }));
        });
        if (matched.length > 0 || (r.transcript && r.transcript.toLowerCase().indexOf(kw) >= 0)) {
          return Object.assign({}, r, { cards: matched.length > 0 ? matched : r.cards });
        }
        return null;
      }).filter(Boolean);
    },
    getStats: function () {
      var records = this.getAll();
      var byDate = {}, byType = {};
      records.forEach(function (r) {
        byDate[r.date] = (byDate[r.date] || 0) + r.cards.length;
        r.cards.forEach(function (c) {
          (c.tags || []).forEach(function (t) { byType[t] = (byType[t] || 0) + 1; });
        });
      });
      return {
        byDate: byDate, byType: byType,
        totalRecords: records.length,
        totalCards: records.reduce(function (s, r) { return s + r.cards.length; }, 0)
      };
    }
  };

  /* ==================== 卡片生成器 ==================== */
  var CardGenerator = {
    MARKERS: ['核心','本质','是指','就是','指的是','关键','重要','首先','其次','意味着','相当于','实质','特点','区别','关系','作用','目的','原因','结果'],
    SUBJECT_KEYWORDS: {
      '马原': ['马克思','唯物','辩证','资本','阶级','矛盾','实践','认识','真理','价值','生产力','生产关系','哲学','主义','社会','劳动','商品','剩余价值'],
      '近现代史': ['历史','革命','战争','条约','清朝','民国','抗日','解放','改革','鸦片','辛亥','建国','运动','起义','侵略','殖民地','半殖民地'],
      '英语': ['英语','grammar','单词','时态','语态','从句','翻译','写作','词汇','动词','名词','形容词','介词','sentence','tense']
    },
    generate: function (transcript) {
      if (!transcript || !transcript.trim()) return [];
      var sentences = transcript.split(/[。！？\n.!?；;]/).map(function(s){return s.trim();}).filter(function(s){return s.length>=6;});
      if (!sentences.length) return [];
      var scored = sentences.map(function(s, i) {
        var score = 0;
        CardGenerator.MARKERS.forEach(function(m) { if (s.indexOf(m)>=0) score+=2; });
        if (s.length>=12 && s.length<=80) score+=1;
        if (s.length>80) score-=1;
        return { text: s, score: score, idx: i };
      });
      scored.sort(function(a,b){ return b.score!==a.score ? b.score-a.score : a.idx-b.idx; });
      var top = scored.slice(0, 5);
      top.sort(function(a,b){ return a.idx-b.idx; });
      return top.map(function(item, idx) {
        return { id:'c_'+Date.now()+'_'+idx, title: CardGenerator.extractTitle(item.text), desc: item.text, tags: CardGenerator.inferTags(item.text) };
      });
    },
    extractTitle: function (sentence) {
      var leads = ['核心是','本质是','是指','就是','指的是','关键是','意味着','相当于','实质是','特点是'];
      for (var i=0;i<leads.length;i++) {
        var idx = sentence.indexOf(leads[i]);
        if (idx>=0) {
          var after = sentence.substring(idx+leads[i].length).trim();
          var end = after.search(/[，,；;。]/);
          var title = end>=0 ? after.substring(0,end) : after;
          if (title.length>=3) return title.length>22 ? title.substring(0,22)+'…' : title;
        }
      }
      return sentence.length>16 ? sentence.substring(0,16)+'…' : sentence;
    },
    inferTags: function (text) {
      var tags = [];
      for (var subject in CardGenerator.SUBJECT_KEYWORDS) {
        if (!CardGenerator.SUBJECT_KEYWORDS.hasOwnProperty(subject)) continue;
        var kws = CardGenerator.SUBJECT_KEYWORDS[subject];
        for (var i=0;i<kws.length;i++) {
          if (text.indexOf(kws[i])>=0) { if (tags.indexOf(subject)<0) tags.push(subject); break; }
        }
      }
      if (!tags.length) tags.push('其他');
      return tags;
    }
  };

  /* ==================== 语音识别 ==================== */
  var Recorder = {
    recognition: null, isRecording: false, finalText: '', interimText: '', timer: null, seconds: 0, onUpdate: null,
    init: function () {
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { this.recognition = null; return false; }
      this.recognition = new SR();
      this.recognition.lang = 'zh-CN'; this.recognition.continuous = true; this.recognition.interimResults = true;
      var self = this;
      this.recognition.onresult = function (event) {
        var interim = '';
        for (var i = event.resultIndex; i < event.results.length; i++) {
          var t = event.results[i][0].transcript;
          if (event.results[i].isFinal) self.finalText += t; else interim += t;
        }
        self.interimText = interim;
        if (self.onUpdate) self.onUpdate(self.finalText, self.interimText);
      };
      this.recognition.onerror = function (event) {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          showToast('麦克风权限被拒绝，请切换到"手动输入"模式', 'error'); self.stop();
        }
      };
      this.recognition.onend = function () { if (self.isRecording) { try { self.recognition.start(); } catch(e){} } };
      return true;
    },
    isSupported: function () { return this.recognition !== null; },
    start: function (onUpdate) {
      if (!this.recognition) return false;
      this.onUpdate = onUpdate; this.finalText = ''; this.interimText = ''; this.seconds = 0; this.isRecording = true;
      try { this.recognition.start(); } catch(e){}
      var self = this;
      this.timer = setInterval(function () { self.seconds++; if (self.onUpdate) self.onUpdate(self.finalText, self.interimText, self.seconds); }, 1000);
      return true;
    },
    stop: function () {
      this.isRecording = false;
      if (this.timer) { clearInterval(this.timer); this.timer = null; }
      if (this.recognition) { try { this.recognition.stop(); } catch(e){} }
      return (this.finalText + this.interimText).trim();
    }
  };

  /* ==================== 应用状态 ==================== */
  var state = {
    mode: 'voice',
    isRecording: false,
    currentTranscript: '',
    currentCards: [],
    expandedRecord: null,
    calendarMonth: null, // FIX: 支持日历月份导航
    wakeLock: null // 移动端屏幕唤醒锁
  };

  /* ==================== 工具函数 ==================== */
  function $(id) { return document.getElementById(id); }
  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function highlightKeywords(text) {
    if (!text) return '';
    var safe = escapeHtml(text);
    var keywords = ['核心','本质','以教代学','主动回忆','查漏补缺','关键','重要'];
    keywords.forEach(function(m) {
      safe = safe.replace(new RegExp(escapeRegex(m),'g'), '<span class="highlight">'+m+'</span>');
    });
    return safe;
  }
  var toastTimer = null;
  function showToast(msg, type) {
    var el = $('toast'); if (!el) return;
    el.textContent = msg; el.className = 'toast show'+(type?' '+type:'');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ el.className='toast'; }, 2600);
  }
  function formatDuration(sec) { return ('0'+Math.floor(sec/60)).slice(-2)+':'+('0'+(sec%60)).slice(-2); }
  function getTodayStr() { return CheckInStore.formatDate(new Date()); }

  function getWeekNumber(date) {
    // FIX: 手动解析日期字符串，避免 ISO 日期被解析为 UTC 导致时区偏移
    var sp = CONFIG.startDate.split('-');
    var startMidnight = new Date(parseInt(sp[0],10), parseInt(sp[1],10)-1, parseInt(sp[2],10));
    var dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var diffDays = Math.floor((dateMidnight - startMidnight) / (1000*60*60*24));
    var week = Math.floor(diffDays / 7) + 1;
    return Math.max(1, Math.min(week, CONFIG.totalWeeks));
  }

  function getCurrentPhase(week) {
    for (var i=0;i<PHASES.length;i++) { if (week>=PHASES[i].weeks[0] && week<=PHASES[i].weeks[1]) return i; }
    return PHASES.length-1;
  }

  // FIX: 暴露配置给 charts.js
  window.FeynmanConfig = { CONFIG: CONFIG, PHASES: PHASES, getWeekNumber: getWeekNumber };

  /* ==================== 打卡功能 ==================== */
  window.checkIn = function () {
    var today = getTodayStr();
    var data = CheckInStore.getData();
    if (data.checkIns.indexOf(today) >= 0) { showModal('今天已经打过卡啦～明天继续加油！'); return; }
    CheckInStore.toggle(today);
    updateCheckInUI();
    var msgs = ['太棒了！今天的学习任务完成啦 🎉','坚持就是胜利！又近了一步 💪','你超棒的！继续保持～ ✨','今日份学习达成！给自己点个赞 👍','自律即自由，今天也很厉害！🌟'];
    showModal(msgs[Math.floor(Math.random()*msgs.length)]);
  };

  window.undoCheckIn = function () {
    var today = getTodayStr();
    var data = CheckInStore.getData();
    if (data.checkIns.indexOf(today) < 0) { showToast('今天还没有打卡记录', 'error'); return; }
    CheckInStore.toggle(today);
    updateCheckInUI();
    showToast('已撤销今日打卡', 'success');
  };

  // FIX: 禁止未来日期打卡
  window.toggleDay = function (dateStr) {
    var today = getTodayStr();
    if (dateStr > today) { showToast('不能对未来日期打卡哦', 'error'); return; }
    CheckInStore.toggle(dateStr);
    updateCheckInUI();
  };

  function showModal(msg) {
    var m = $('successModal'); if (!m) return;
    $('successMessage').textContent = msg;
    m.classList.add('show');
    m.style.pointerEvents = 'auto'; // FIX: 确保 pointer-events
  }
  window.closeModal = function () {
    var m = $('successModal'); if (!m) return;
    m.classList.remove('show');
    m.style.pointerEvents = '';
  };

  function updateCheckInUI() {
    var data = CheckInStore.getData();
    var today = new Date();
    var weekNum = getWeekNumber(today);
    var examDate = new Date(CONFIG.examDate);
    var daysToExam = Math.ceil((examDate - today) / (1000*60*60*24));

    $('countdown').textContent = daysToExam > 0 ? daysToExam + '天' : '已到考试周';
    $('todayDate').textContent = today.toLocaleDateString('zh-CN', { year:'numeric', month:'long', day:'numeric', weekday:'long' });

    var task = WEEKLY_TASKS[weekNum] || { subject:'复习', task:'查漏补缺，调整状态' };
    $('todayTask').textContent = task.task;
    $('todaySubject').textContent = task.subject;

    var isChecked = data.checkIns.indexOf(getTodayStr()) >= 0;
    var btn = $('checkInBtn');
    if (isChecked) { btn.textContent = '✅ 今日已打卡'; btn.classList.add('btn-success'); btn.classList.remove('btn-primary'); }
    else { btn.textContent = '✅ 完成今日学习'; btn.classList.add('btn-primary'); btn.classList.remove('btn-success'); }

    $('streakDays').textContent = data.streak;
    $('totalDays').textContent = data.checkIns.length;
    $('currentWeek').textContent = '第' + weekNum + '周';

    // FIX: 手动解析 startDate，避免 ISO 时区偏移
    var sp = CONFIG.startDate.split('-');
    var startMidnight = new Date(parseInt(sp[0],10), parseInt(sp[1],10)-1, parseInt(sp[2],10));
    var todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var daysSinceStart = Math.floor((todayMidnight - startMidnight) / (1000*60*60*24)) + 1;
    var rate = Math.round((data.checkIns.length / Math.max(1, daysSinceStart)) * 100);
    $('completionRate').textContent = Math.min(100, rate) + '%';

    renderCalendar();
    renderPhases(weekNum);
    if (window.FeynmanCharts) window.FeynmanCharts.render();
  }

  /* ==================== 日历渲染（支持月份导航） ==================== */
  function renderCalendar() {
    var grid = $('calendarGrid');
    if (!grid) return;

    // FIX: 支持 state.calendarMonth 导航
    var viewDate = state.calendarMonth || new Date();
    var y = viewDate.getFullYear(), m = viewDate.getMonth();
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m+1, 0);
    var startDow = firstDay.getDay();
    var data = CheckInStore.getData();
    var todayStr = getTodayStr();
    var todayDate = new Date();

    var monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    $('calendarTitle').innerHTML = '🗓️ ' + y + '年' + monthNames[m] +
      ' <span style="font-size:0.8rem;font-weight:400;color:var(--muted)">学习日历</span>';

    // FIX: 使用年月整数比较，避免 Date 对象时区差异
    var prevBtn = $('calPrev'), nextBtn = $('calNext');
    var startParts = CONFIG.startDate.split('-');
    var startYear = parseInt(startParts[0], 10);
    var startMonthIdx = parseInt(startParts[1], 10) - 1;
    if (prevBtn) {
      var py = y, pm = m - 1;
      if (pm < 0) { pm = 11; py--; }
      var prevVisible = (py > startYear) || (py === startYear && pm >= startMonthIdx);
      prevBtn.style.visibility = prevVisible ? 'visible' : 'hidden';
    }
    if (nextBtn) {
      var ny = y, nm = m + 1;
      if (nm > 11) { nm = 0; ny++; }
      var todayY = todayDate.getFullYear(), todayM = todayDate.getMonth();
      var nextVisible = (ny < todayY) || (ny === todayY && nm <= todayM);
      nextBtn.style.visibility = nextVisible ? 'visible' : 'hidden';
    }

    var html = '';
    var dows = ['日','一','二','三','四','五','六'];
    dows.forEach(function(d) { html += '<div class="dow">'+d+'</div>'; });

    for (var i=0;i<startDow;i++) html += '<div class="cal-day empty"></div>';
    for (var day=1; day<=lastDay.getDate(); day++) {
      var ds = y+'-'+('0'+(m+1)).slice(-2)+'-'+('0'+day).slice(-2);
      var isToday = ds === todayStr;
      var isChecked = data.checkIns.indexOf(ds) >= 0;
      // FIX: 未来日期不可点击
      var isFuture = ds > todayStr;
      var cls = 'cal-day';
      if (isChecked) cls += ' checked';
      else if (isFuture) cls += ' future';
      else cls += ' normal';
      if (isToday) cls += ' today';
      var clickHandler = isFuture ? '' : ' onclick="toggleDay(\''+ds+'\')"';
      html += '<div class="'+cls+'"'+clickHandler+'>'+day+'</div>';
    }
    grid.innerHTML = html;
  }

  window.changeMonth = function (delta) {
    var base = state.calendarMonth || new Date();
    state.calendarMonth = new Date(base.getFullYear(), base.getMonth() + delta, 1);
    renderCalendar();
  };

  /* ==================== 阶段进度渲染 ==================== */
  function renderPhases(currentWeek) {
    var container = $('phaseList');
    if (!container) return;
    var html = '<div class="phase-line"></div>';
    var currentPhase = getCurrentPhase(currentWeek);

    PHASES.forEach(function(phase, i) {
      var phaseWeeks = phase.weeks[1] - phase.weeks[0] + 1;
      var progress = 0;
      if (currentWeek > phase.weeks[1]) progress = 100;
      else if (currentWeek >= phase.weeks[0]) progress = Math.round(((currentWeek - phase.weeks[0] + 1) / phaseWeeks) * 100);

      var bg = phase.color + '1a';
      var tagBg = phase.color + '1a';
      var tagColor = phase.color;

      html += '<div class="phase-item">';
      html += '<div class="phase-icon" style="background:'+bg+'">'+phase.icon+'</div>';
      html += '<div class="phase-content">';
      html += '<div class="phase-head">';
      html += '<h4>第'+(i+1)+'阶段：'+phase.name+'</h4>';
      html += '<span class="phase-tag" style="background:'+tagBg+';color:'+tagColor+'">第'+phase.weeks[0]+'-'+phase.weeks[1]+'周</span>';
      if (i === currentPhase) html += '<span class="phase-tag" style="background:var(--accent);color:#fff">当前</span>';
      html += '</div>';
      html += '<p class="phase-desc">'+phase.desc+'</p>';
      html += '<div class="phase-progress-bar"><div class="phase-progress-fill" style="width:'+progress+'%;background:'+phase.color+'"></div></div>';
      html += '</div></div>';
    });
    container.innerHTML = html;
  }

  /* ==================== 录音工作台 ==================== */
  window.switchMode = function (mode) {
    if (state.isRecording) { showToast('请先停止录音再切换模式','error'); return; }
    state.mode = mode;
    $('modeVoice').classList.toggle('active', mode==='voice');
    $('modeManual').classList.toggle('active', mode==='manual');
    $('voiceArea').style.display = mode==='voice' ? 'block' : 'none';
    $('manualArea').classList.toggle('active', mode==='manual');
    if (mode==='manual') {
      var text = $('manualText').value.trim();
      state.currentTranscript = text;
      updateTranscribeUI(text, '');
      updateGenerateBtn();
    }
  };

  window.scrollToWorkbench = function () { $('workbench-section').scrollIntoView({behavior:'smooth'}); };

  window.toggleRecording = function () {
    if (!Recorder.isSupported()) { showToast('浏览器不支持语音识别，已切换到手动输入','error'); switchMode('manual'); return; }
    if (state.isRecording) stopRecording(); else startRecording();
  };

  function startRecording() {
    Recorder.start(function(finalText, interimText, seconds) {
      state.currentTranscript = finalText;
      updateTranscribeUI(finalText, interimText);
      if (seconds !== undefined) $('recordStatus').innerHTML = '<span class="listening">● 正在录音</span> · <span class="duration">'+formatDuration(seconds)+'</span>';
      updateGenerateBtn();
    });
    state.isRecording = true;
    $('recordBtn').classList.add('recording'); $('recordBtn').textContent = '⏹';
    $('recordWrapper').classList.add('active');
    $('recordStatus').innerHTML = '<span class="listening">● 正在录音</span> · <span class="duration">00:00</span>';
    // 移动端：防止录音时屏幕休眠
    if (navigator.wakeLock) {
      navigator.wakeLock.request('screen').then(function(lock) { state.wakeLock = lock; }).catch(function(){});
    }
  }

  function stopRecording() {
    var text = Recorder.stop();
    state.isRecording = false;
    state.currentTranscript = text.trim();
    $('recordBtn').classList.remove('recording'); $('recordBtn').textContent = '🎙️';
    $('recordWrapper').classList.remove('active');
    $('recordStatus').textContent = state.currentTranscript ? '录音已停止，可生成知识卡片' : '录音已停止（未识别到内容）';
    // 释放屏幕唤醒锁
    if (state.wakeLock) { try { state.wakeLock.release(); } catch(e){} state.wakeLock = null; }
    updateTranscribeUI(state.currentTranscript, '');
    updateGenerateBtn();
  }

  function updateTranscribeUI(finalText, interimText) {
    var el = $('transcribeText');
    if (!el) return;
    var full = (finalText + ' ' + interimText).trim();
    if (!full) { el.innerHTML = '<span class="placeholder">录音或输入后，转写内容将显示在这里…</span>'; $('transcribeCount').textContent=''; return; }
    var html = highlightKeywords(finalText);
    if (interimText) html += '<span class="interim">'+escapeHtml(interimText)+'</span>';
    el.innerHTML = html;
    $('transcribeCount').textContent = finalText.length > 0 ? '· '+finalText.length+' 字' : '';
  }

  function updateGenerateBtn() {
    $('generateBtn').disabled = !(state.currentTranscript && state.currentTranscript.trim().length > 0);
  }

  window.generateCards = function () {
    var text = state.currentTranscript.trim();
    if (!text) { showToast('请先录音或输入内容','error'); return; }
    var cards = CardGenerator.generate(text);
    if (!cards.length) { showToast('内容太短，无法提取知识点，请多说一些','error'); return; }
    state.currentCards = cards;
    renderCurrentCards();
    $('saveBtn').disabled = false;
    showToast('已生成 '+cards.length+' 张知识卡片', 'success');
  };

  // FIX: 局部更新标签区域，不触发全量 re-render
  function renderCurrentCards() {
    var container = $('currentCards');
    var cards = state.currentCards;
    var badge = $('cardBadge');
    if (!cards.length) {
      container.innerHTML = '<div class="empty-hint">生成卡片后，将在这里展示（可编辑标题、描述、标签）</div>';
      badge.style.display = 'none';
      return;
    }
    badge.style.display = 'inline-block';
    badge.textContent = cards.length;
    var html = '';
    cards.forEach(function(card, idx) {
      var isFull = idx === cards.length-1 && cards.length%2 === 1;
      html += '<div class="k-card'+(isFull?' full':'')+'" data-card-idx="'+idx+'">';
      html += '<button class="card-del" onclick="deleteCurrentCard('+idx+')" title="删除">✕</button>';
      html += '<input class="k-title-input" value="'+escapeHtml(card.title)+'" oninput="updateCardField('+idx+',\'title\',this.value)" placeholder="知识点标题">';
      html += '<textarea class="k-desc-input" oninput="updateCardField('+idx+',\'desc\',this.value)" placeholder="一句话解释">'+escapeHtml(card.desc)+'</textarea>';
      html += '<div class="k-tags" id="kTags_'+idx+'">';
      html += renderTagsHTML(idx, card.tags);
      html += '</div>';
      html += '</div>';
    });
    container.innerHTML = html;
  }

  // FIX: 单独渲染标签 HTML，用于局部更新
  function renderTagsHTML(cardIdx, tags) {
    var html = '';
    tags.forEach(function(tag, ti) {
      var alt = ti%2===1 ? ' alt' : '';
      html += '<span class="k-tag'+alt+'">'+escapeHtml(tag)+'<span class="remove-tag" onclick="removeTag('+cardIdx+','+ti+')">✕</span></span>';
    });
    html += '<input class="add-tag-input" placeholder="+标签" onkeydown="addTag(event,'+cardIdx+')">';
    return html;
  }

  window.updateCardField = function(idx, field, val) {
    if (state.currentCards[idx]) state.currentCards[idx][field] = val;
  };

  // FIX: 局部更新标签区域，不重建整个卡片列表
  window.removeTag = function(ci, ti) {
    if (!state.currentCards[ci]) return;
    state.currentCards[ci].tags.splice(ti, 1);
    var tagsEl = $('kTags_' + ci);
    if (tagsEl) tagsEl.innerHTML = renderTagsHTML(ci, state.currentCards[ci].tags);
  };

  window.addTag = function(event, ci) {
    if (event.key==='Enter' || event.key===',') {
      event.preventDefault();
      var v = event.target.value.trim();
      if (v && state.currentCards[ci]) {
        state.currentCards[ci].tags.push(v);
        var tagsEl = $('kTags_' + ci);
        if (tagsEl) tagsEl.innerHTML = renderTagsHTML(ci, state.currentCards[ci].tags);
        // FIX: 重新聚焦到新的输入框
        var newInput = tagsEl ? tagsEl.querySelector('.add-tag-input') : null;
        if (newInput) newInput.focus();
      }
    }
  };

  window.deleteCurrentCard = function(idx) {
    state.currentCards.splice(idx, 1);
    renderCurrentCards();
    if (!state.currentCards.length) $('saveBtn').disabled = true;
  };

  window.saveToArchive = function () {
    if (!state.currentCards.length) { showToast('没有可保存的卡片','error'); return; }
    FeynmanStore.addRecord(state.currentTranscript, state.currentCards);
    showToast('已归档 '+state.currentCards.length+' 张知识卡片', 'success');
    clearCurrent();
    renderTimeline();
    renderArchiveStats();
    renderReviewArea();
    if (window.FeynmanCharts) window.FeynmanCharts.render();
  };

  window.clearCurrent = function () {
    if (state.isRecording) stopRecording();
    state.currentTranscript = '';
    state.currentCards = [];
    $('manualText').value = '';
    updateTranscribeUI('', '');
    renderCurrentCards();
    $('generateBtn').disabled = true;
    $('saveBtn').disabled = true;
    $('recordStatus').textContent = '点击按钮开始录音（需允许麦克风权限）';
  };

  function bindManualInput() {
    var ta = $('manualText');
    if (!ta) return;
    ta.addEventListener('input', function() {
      if (state.mode==='manual') {
        state.currentTranscript = this.value.trim();
        updateTranscribeUI(state.currentTranscript, '');
        updateGenerateBtn();
      }
    });
  }

  /* ==================== 归档时间轴 ==================== */
  window.renderTimeline = function () {
    var searchBox = $('searchBox');
    var keyword = searchBox ? searchBox.value.trim() : '';
    var records = FeynmanStore.search(keyword);
    var container = $('timeline');
    if (!container) return;

    // FIX: 搜索时清除展开状态（如果展开的记录不在搜索结果中）
    if (state.expandedRecord && !records.some(function(r) { return r.id === state.expandedRecord; })) {
      state.expandedRecord = null;
    }

    if (!records.length) {
      container.innerHTML = '<div class="empty-hint">'+(keyword?'未找到匹配"'+escapeHtml(keyword)+'"的记录':'还没有归档记录，去录音工作台生成第一张知识卡片吧')+'</div>';
      return;
    }
    var html = '';
    records.forEach(function(r) {
      var isExpanded = state.expandedRecord === r.id;
      var dateShort = r.date.substring(5).replace('-','.');
      var preview = r.transcript.substring(0, 40) + (r.transcript.length > 40 ? '…' : '');
      html += '<div class="timeline-item'+(isExpanded?' expanded':'')+'">';
      html += '<div class="timeline-header" onclick="toggleRecord(\''+r.id+'\')">';
      html += '<span class="date-badge">'+dateShort+'</span>';
      html += '<span class="time-text">'+escapeHtml(r.time)+'</span>';
      html += '<span class="desc">'+escapeHtml(preview)+'</span>';
      html += '<span class="count">'+r.cards.length+'条卡片</span>';
      html += '<span class="chevron">▶</span></div>';
      html += '<div class="timeline-body">';
      html += '<div class="transcript-preview">'+escapeHtml(r.transcript)+'</div>';
      html += '<div class="mini-cards">';
      r.cards.forEach(function(c) {
        html += '<div class="mini-card"><div class="mc-title">'+escapeHtml(c.title)+'</div>';
        html += '<div class="mc-desc">'+escapeHtml(c.desc.substring(0,60))+(c.desc.length>60?'…':'')+'</div>';
        html += '<div class="mc-tags">';
        (c.tags||[]).forEach(function(t){ html += '<span class="mc-tag">'+escapeHtml(t)+'</span>'; });
        html += '</div></div>';
      });
      html += '</div>';
      html += '<button class="del-record" onclick="deleteRecord(\''+r.id+'\')">删除此记录</button>';
      html += '</div></div>';
    });
    container.innerHTML = html;
  };

  window.toggleRecord = function(id) {
    state.expandedRecord = (state.expandedRecord === id) ? null : id;
    renderTimeline();
  };

  window.deleteRecord = function(id) {
    if (!confirm('确定删除这条费曼讲解记录？')) return;
    FeynmanStore.deleteRecord(id);
    state.expandedRecord = null;
    showToast('记录已删除', 'success');
    renderTimeline();
    renderArchiveStats();
    renderReviewArea();
    if (window.FeynmanCharts) window.FeynmanCharts.render();
  };

  function renderArchiveStats() {
    var stats = FeynmanStore.getStats();
    var el = $('archiveStats');
    if (el) el.innerHTML = '共 <b>'+stats.totalRecords+'</b> 次讲解 · <b>'+stats.totalCards+'</b> 张卡片';
  }

  /* ==================== 数据导出/导入 ==================== */
  window.exportData = function () {
    var data = {
      checkIn: CheckInStore.getData(),
      feynman: FeynmanStore.getAll(),
      exportedAt: new Date().toISOString()
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'feynman-backup-' + getTodayStr() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('数据已导出', 'success');
  };

  window.importData = function (event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result);
        if (data.checkIn) CheckInStore.save(data.checkIn);
        if (data.feynman) FeynmanStore.save(data.feynman);
        showToast('数据已导入', 'success');
        updateCheckInUI();
        renderTimeline();
        renderArchiveStats();
        renderReviewArea();
      } catch (err) {
        showToast('导入失败：文件格式错误', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // FIX: 允许重复导入同一文件
  };

  /* ==================== 深色模式 ==================== */
  window.toggleDarkMode = function () {
    document.body.classList.toggle('dark');
    var isDark = document.body.classList.contains('dark');
    localStorage.setItem('feynman_dark_mode', isDark ? '1' : '0');
    var btn = $('darkToggle');
    if (btn) btn.textContent = isDark ? '☀️' : '🌙';
    // 重新渲染图表（深色模式需要更新配色）
    if (window.FeynmanCharts) window.FeynmanCharts.render();
  };
  function loadDarkMode() {
    if (localStorage.getItem('feynman_dark_mode') === '1') {
      document.body.classList.add('dark');
      var btn = $('darkToggle');
      if (btn) btn.textContent = '☀️';
    }
  }

  /* ==================== 番茄钟 ==================== */
  var PomoStore = {
    KEY: 'feynman_pomo_data',
    WORK_MIN: 25, BREAK_MIN: 5, GOAL: 8,
    getData: function () {
      try { var raw = localStorage.getItem(this.KEY); return raw ? JSON.parse(raw) : { date: getTodayStr(), sessions: 0, totalMinutes: 0 }; }
      catch(e) { return { date: getTodayStr(), sessions: 0, totalMinutes: 0 }; }
    },
    save: function (data) { localStorage.setItem(this.KEY, JSON.stringify(data)); },
    addSession: function (minutes) {
      var data = this.getData();
      if (data.date !== getTodayStr()) { data = { date: getTodayStr(), sessions: 0, totalMinutes: 0 }; }
      data.sessions++; data.totalMinutes += minutes;
      this.save(data);
      return data;
    },
    getToday: function () {
      var data = this.getData();
      if (data.date !== getTodayStr()) return { sessions: 0, totalMinutes: 0 };
      return data;
    }
  };

  var pomoState = { running: false, isWork: true, timeLeft: PomoStore.WORK_MIN * 60, timer: null };

  function formatPomoTime(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
  }

  function updatePomoUI() {
    $('pomoDisplay').textContent = formatPomoTime(pomoState.timeLeft);
    var totalSec = (pomoState.isWork ? PomoStore.WORK_MIN : PomoStore.BREAK_MIN) * 60;
    var progress = ((totalSec - pomoState.timeLeft) / totalSec) * 100;
    $('pomoProgress').style.width = progress + '%';
    var phaseEl = $('pomoPhase');
    var tagClass = pomoState.isWork ? 'work' : 'break';
    var tagText = pomoState.isWork ? '专注时段' : '休息时段';
    var phaseText = pomoState.running ? (pomoState.isWork ? '专注中…' : '休息中…') : '准备开始';
    phaseEl.innerHTML = phaseText + ' <span class="phase-tag-pomo ' + tagClass + '">' + tagText + '</span>';
    var btn = $('pomoStartBtn');
    btn.textContent = pomoState.running ? '⏸ 暂停' : (pomoState.timeLeft < (pomoState.isWork ? PomoStore.WORK_MIN : PomoStore.BREAK_MIN) * 60 ? '▶ 继续' : '▶ 开始专注');
    var data = PomoStore.getToday();
    $('pomoSessions').textContent = data.sessions;
    $('pomoTotalMin').textContent = data.totalMinutes;
  }

  window.togglePomo = function () {
    if (pomoState.running) {
      pomoState.running = false;
      if (pomoState.timer) { clearInterval(pomoState.timer); pomoState.timer = null; }
    } else {
      pomoState.running = true;
      pomoState.timer = setInterval(function () {
        pomoState.timeLeft--;
        if (pomoState.timeLeft <= 0) { completePomoPhase(); }
        else { updatePomoUI(); }
      }, 1000);
    }
    updatePomoUI();
  };

  function completePomoPhase() {
    if (pomoState.timer) { clearInterval(pomoState.timer); pomoState.timer = null; }
    pomoState.running = false;
    if (pomoState.isWork) {
      PomoStore.addSession(PomoStore.WORK_MIN);
      showToast('🍅 专注完成！休息5分钟', 'success');
      pomoState.isWork = false;
      pomoState.timeLeft = PomoStore.BREAK_MIN * 60;
    } else {
      showToast('休息结束，继续专注！', 'success');
      pomoState.isWork = true;
      pomoState.timeLeft = PomoStore.WORK_MIN * 60;
    }
    updatePomoUI();
    // 播放提示音
    try { var ctx = new (window.AudioContext || window.webkitAudioContext)(); var osc = ctx.createOscillator(); osc.connect(ctx.destination); osc.frequency.value = 880; osc.start(); osc.stop(ctx.currentTime + 0.3); } catch(e){}
  }

  window.resetPomo = function () {
    if (pomoState.timer) { clearInterval(pomoState.timer); pomoState.timer = null; }
    pomoState.running = false; pomoState.isWork = true; pomoState.timeLeft = PomoStore.WORK_MIN * 60;
    updatePomoUI();
  };

  window.skipPomo = function () {
    if (pomoState.timer) { clearInterval(pomoState.timer); pomoState.timer = null; }
    pomoState.running = false;
    if (pomoState.isWork) { PomoStore.addSession(PomoStore.WORK_MIN); }
    pomoState.isWork = !pomoState.isWork;
    pomoState.timeLeft = (pomoState.isWork ? PomoStore.WORK_MIN : PomoStore.BREAK_MIN) * 60;
    updatePomoUI();
  };

  /* ==================== 复习模式 ==================== */
  var ReviewStore = {
    KEY: 'feynman_review_data',
    getData: function () {
      try { var raw = localStorage.getItem(this.KEY); return raw ? JSON.parse(raw) : {}; }
      catch(e) { return {}; }
    },
    save: function (data) { localStorage.setItem(this.KEY, JSON.stringify(data)); },
    getMastery: function (cardId) { var d = this.getData(); return d[cardId] || { level: 'pending', lastReview: null, reviewCount: 0 }; },
    setMastery: function (cardId, level) {
      var d = this.getData();
      d[cardId] = { level: level, lastReview: getTodayStr(), reviewCount: (d[cardId] ? d[cardId].reviewCount : 0) + 1 };
      this.save(d);
    },
    getAllMastery: function () { return this.getData(); },
    getStats: function () {
      var d = this.getData();
      var stats = { pending: 0, mastered: 0, fuzzy: 0, unknown: 0 };
      var records = FeynmanStore.getAll();
      var totalCards = 0;
      records.forEach(function (r) { totalCards += r.cards.length; r.cards.forEach(function (c) {
        var m = d[c.id] ? d[c.id].level : 'pending';
        if (stats[m] !== undefined) stats[m]++; else stats.pending++;
      }); });
      stats.total = totalCards;
      return stats;
    }
  };

  var reviewState = { queue: [], currentIdx: 0, flipped: false, started: false };

  function buildReviewQueue() {
    var records = FeynmanStore.getAll();
    var allCards = [];
    records.forEach(function (r) {
      r.cards.forEach(function (c) {
        var mastery = ReviewStore.getMastery(c.id);
        allCards.push({ card: c, record: r, mastery: mastery });
      });
    });
    // 优先级：unknown > fuzzy > pending > mastered
    var priority = { unknown: 0, fuzzy: 1, pending: 2, mastered: 3 };
    allCards.sort(function (a, b) { return (priority[a.mastery.level] || 2) - (priority[b.mastery.level] || 2); });
    // mastered 的卡片只在每3次复习时出现一次
    var result = [];
    var masteredCount = 0;
    allCards.forEach(function (item) {
      if (item.mastery.level === 'mastered') {
        masteredCount++;
        if (masteredCount % 3 === 0) result.push(item); // 每3张已掌握的取1张
      } else {
        result.push(item);
      }
    });
    return result;
  }

  window.startReview = function () {
    reviewState.queue = buildReviewQueue();
    if (!reviewState.queue.length) { renderReviewEmpty(); return; }
    reviewState.currentIdx = 0;
    reviewState.flipped = false;
    reviewState.started = true;
    renderReviewCard();
  };

  function renderReviewStats() {
    var stats = ReviewStore.getStats();
    var html = '';
    var items = [
      { cls: 'pending', num: stats.pending, label: '待复习' },
      { cls: 'unknown', num: stats.unknown, label: '不会' },
      { cls: 'fuzzy', num: stats.fuzzy, label: '模糊' },
      { cls: 'mastered', num: stats.mastered, label: '已掌握' }
    ];
    items.forEach(function (item) {
      html += '<div class="review-stat-item ' + item.cls + '"><div class="rs-num">' + item.num + '</div><div class="rs-label">' + item.label + '</div></div>';
    });
    var el = $('reviewStats');
    if (el) el.innerHTML = html;
  }

  function renderReviewCard() {
    var area = $('reviewArea');
    if (!area) return;
    if (!reviewState.queue.length || reviewState.currentIdx >= reviewState.queue.length) {
      renderReviewComplete();
      return;
    }
    var item = reviewState.queue[reviewState.currentIdx];
    var card = item.card;
    var total = reviewState.queue.length;
    var current = reviewState.currentIdx + 1;
    var progress = (current / total) * 100;
    var masteryLabels = { pending: '⏳ 待复习', unknown: '❌ 不会', fuzzy: '⚠️ 模糊', mastered: '✅ 已掌握' };

    var html = '<div class="review-progress-bar"><div class="review-progress-fill" style="width:' + progress + '%"></div></div>';
    html += '<div style="text-align:center;margin-bottom:12px;font-size:0.82rem;color:var(--muted);">' + current + ' / ' + total + ' · 当前：' + (masteryLabels[item.mastery.level] || '待复习') + '</div>';
    html += '<div class="flashcard' + (reviewState.flipped ? ' flipped' : '') + '" onclick="flipReviewCard()">';
    html += '<span class="fc-tag-hint">' + (reviewState.flipped ? '点击收起' : '点击翻看答案') + '</span>';
    if (reviewState.flipped) {
      html += '<div class="fc-content">' + escapeHtml(card.desc || card.title) + '</div>';
    } else {
      html += '<div class="fc-content">' + escapeHtml(card.title) + '</div>';
      html += '<div class="fc-hint">点击卡片查看详细解释</div>';
    }
    if (card.tags && card.tags.length) {
      html += '<div class="fc-tags">';
      card.tags.forEach(function (t) { html += '<span class="fc-tag">' + escapeHtml(t) + '</span>'; });
      html += '</div>';
    }
    html += '</div>';
    html += '<div class="review-actions">';
    html += '<button class="review-btn mastered" onclick="markReview(\'mastered\')"><span class="rb-icon">✅</span>已掌握</button>';
    html += '<button class="review-btn fuzzy" onclick="markReview(\'fuzzy\')"><span class="rb-icon">⚠️</span>有点模糊</button>';
    html += '<button class="review-btn unknown" onclick="markReview(\'unknown\')"><span class="rb-icon">❌</span>不会</button>';
    html += '</div>';
    area.innerHTML = html;
  }

  window.flipReviewCard = function () {
    reviewState.flipped = !reviewState.flipped;
    renderReviewCard();
  };

  window.markReview = function (level) {
    if (!reviewState.queue.length) return;
    var item = reviewState.queue[reviewState.currentIdx];
    ReviewStore.setMastery(item.card.id, level);
    reviewState.currentIdx++;
    reviewState.flipped = false;
    renderReviewCard();
    renderReviewStats();
  };

  function renderReviewEmpty() {
    var area = $('reviewArea');
    if (!area) return;
    var stats = ReviewStore.getStats();
    if (stats.total === 0) {
      area.innerHTML = '<div class="review-empty"><div class="emoji">📖</div><p>暂无知识卡片，先去录音工作台生成知识卡片吧</p></div>';
    } else {
      area.innerHTML = '<div class="review-empty"><div class="emoji">🎉</div><p>所有卡片都已复习完毕！<br>共 ' + stats.total + ' 张卡片 · 已掌握 ' + stats.mastered + ' 张</p><button class="btn btn-primary" style="margin-top:16px;" onclick="startReview()">重新复习</button></div>';
    }
  }

  function renderReviewComplete() {
    var area = $('reviewArea');
    if (!area) return;
    var stats = ReviewStore.getStats();
    var reviewed = reviewState.currentIdx;
    area.innerHTML = '<div class="review-empty"><div class="emoji">🎓</div><p>本次复习完成！<br>复习了 ' + reviewed + ' 张卡片</p><div style="margin-top:16px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;"><button class="btn btn-primary" onclick="startReview()">再来一轮</button><button class="btn btn-secondary" onclick="scrollToWorkbench()">去录音生成更多</button></div></div>';
    reviewState.started = false;
  }

  function renderReviewArea() {
    renderReviewStats();
    if (!reviewState.started) {
      var stats = ReviewStore.getStats();
      if (stats.total === 0) {
        renderReviewEmpty();
      } else {
        var area = $('reviewArea');
        var needReview = stats.pending + stats.unknown + stats.fuzzy;
        area.innerHTML = '<div class="review-empty"><div class="emoji">📖</div><p>共 ' + stats.total + ' 张知识卡片<br>待复习 ' + needReview + ' 张 · 已掌握 ' + stats.mastered + ' 张</p><button class="btn btn-primary" style="margin-top:16px;" onclick="startReview()">开始复习</button></div>';
      }
    } else {
      renderReviewCard();
    }
  }

  /* ==================== Markdown 导出 ==================== */
  window.exportMarkdown = function () {
    var records = FeynmanStore.getAll();
    if (!records.length) { showToast('暂无数据可导出', 'error'); return; }
    var md = '# 费曼学习笔记 · 知识卡片库\n\n';
    md += '> 导出时间：' + new Date().toLocaleString('zh-CN') + '\n\n';
    md += '**统计：** ' + records.length + ' 次讲解 · ' + records.reduce(function(s,r){return s+r.cards.length;},0) + ' 张知识卡片\n\n---\n\n';

    // 按日期分组
    var byDate = {};
    records.forEach(function (r) {
      if (!byDate[r.date]) byDate[r.date] = [];
      byDate[r.date].push(r);
    });
    var dates = Object.keys(byDate).sort().reverse();

    dates.forEach(function (date) {
      md += '## ' + date + '\n\n';
      byDate[date].forEach(function (r) {
        md += '### ' + r.time + ' 费曼讲解\n\n';
        md += '**原始转写：**\n\n' + r.transcript + '\n\n';
        md += '**知识卡片：**\n\n';
        r.cards.forEach(function (c, i) {
          md += (i+1) + '. **' + c.title + '**\n   - ' + c.desc + '\n';
          if (c.tags && c.tags.length) md += '   - 标签：' + c.tags.map(function(t){return '`'+t+'`';}).join(' ') + '\n';
          md += '\n';
        });
        md += '---\n\n';
      });
    });

    var blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '费曼学习笔记-' + getTodayStr() + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Markdown 已导出', 'success');
  };

  /* ==================== 示例数据 ==================== */
  function seedDataIfEmpty() {
    if (!localStorage.getItem(FeynmanStore.SEED_KEY)) {
      if (FeynmanStore.getAll().length > 0) {
        localStorage.setItem(FeynmanStore.SEED_KEY, '1');
      } else {
        var samples = [
          { offset:0, time:'22:15', transcript:'今天复习了马克思主义基本原理。唯物辩证法的核心是对立统一规律，它揭示了事物发展的源泉和动力。矛盾是事物发展的根本原因，内因是变化的根据，外因是变化的条件。实践是认识的基础，认识反过来指导实践。真理是客观的，又是绝对和相对的统一。' },
          { offset:1, time:'21:40', transcript:'中国近现代史纲要这部分，鸦片战争是近代史的开端，标志着中国开始沦为半殖民地半封建社会。辛亥革命推翻了清朝统治，但革命果实被袁世凯窃取。新文化运动提倡民主和科学，是一次重要的思想解放运动。' },
          { offset:2, time:'20:30', transcript:'英语复习了写作模板。写作文时要注意时态的一致性，议论文常用一般现在时。从句分为定语从句、状语从句和名词性从句，定语从句中关系代词的选择很重要。' },
          { offset:3, time:'22:50', transcript:'费曼学习法的核心是以教代学，就是把一个复杂的概念用最简单的话讲给别人听。如果能讲清楚，说明你真的懂了。如果讲不清楚，说明还有知识盲区。这个过程本身就是主动回忆和查漏补缺。' },
          { offset:5, time:'21:10', transcript:'商品的价值是由生产商品的社会必要劳动时间决定的。剩余价值是资本家剥削工人的秘密所在。资本的本质不是物，而是物掩盖下的人与人之间的生产关系。' },
          { offset:7, time:'22:00', transcript:'认识的本质是主体在实践基础上对客体的能动反映。实践是认识的来源、动力、目的和检验标准。从实践到认识要经过感性认识和理性认识两个阶段。' }
        ];
        var records = samples.map(function(s) {
          var d = new Date(); d.setDate(d.getDate() - s.offset);
          var cards = CardGenerator.generate(s.transcript);
          return {
            id: 'r_seed_' + s.offset,
            date: CheckInStore.formatDate(d),
            time: s.time,
            timestamp: d.getTime(),
            transcript: s.transcript,
            cards: cards.length > 0 ? cards : [{ id: 'c_seed_' + s.offset, title: s.transcript.substring(0,14)+'…', desc: s.transcript, tags: ['其他'] }]
          };
        });
        records.sort(function(a,b){ return b.timestamp - a.timestamp; });
        FeynmanStore.save(records);
        localStorage.setItem(FeynmanStore.SEED_KEY, '1');
      }
    }

    if (!localStorage.getItem(CheckInStore.KEY)) {
      var checkInData = { checkIns: [], streak: 0, lastCheckIn: null };
      var today = new Date();
      for (var i = 0; i <= 11; i++) {
        var d = new Date(today);
        d.setDate(d.getDate() - i);
        if (i === 4 || i === 7) continue;
        checkInData.checkIns.push(CheckInStore.formatDate(d));
      }
      checkInData.streak = CheckInStore.calcStreak(checkInData.checkIns);
      checkInData.lastCheckIn = checkInData.checkIns.slice().sort().pop();
      CheckInStore.save(checkInData);
    }
  }

  /* ==================== 初始化 ==================== */
  function init() {
    seedDataIfEmpty();
    loadDarkMode();
    Recorder.init();
    if (!Recorder.isSupported()) {
      var rs = $('recordStatus');
      if (rs) rs.textContent = '浏览器不支持语音识别，建议使用"手动输入"模式';
    }
    bindManualInput();
    updateCheckInUI();
    renderTimeline();
    renderArchiveStats();
    renderReviewArea();
    updatePomoUI();
    if (window.FeynmanCharts) window.FeynmanCharts.render();
    if (!Recorder.isSupported()) switchMode('manual');

    // 弹窗外部点击关闭
    var modal = $('successModal');
    if (modal) {
      modal.addEventListener('click', function(e) { if (e.target === this) closeModal(); });
    }

    // ESC 关闭弹窗
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        if (modal && modal.classList.contains('show')) closeModal();
      }
    });

    // 移动端优化：页面可见性变化时重新获取 wakeLock
    document.addEventListener('visibilitychange', function() {
      if (state.isRecording && document.visibilityState === 'visible' && navigator.wakeLock && !state.wakeLock) {
        navigator.wakeLock.request('screen').then(function(lock) { state.wakeLock = lock; }).catch(function(){});
      }
    });

    // 移动端优化：搜索框防抖
    var searchBox = $('searchBox');
    if (searchBox) {
      var searchTimer = null;
      searchBox.addEventListener('input', function() {
        if (searchTimer) clearTimeout(searchTimer);
        searchTimer = setTimeout(function() { renderTimeline(); }, 300);
      });
    }

    // 移动端优化：防止双击缩放
    var lastTouch = 0;
    document.addEventListener('touchend', function(e) {
      var now = Date.now();
      if (now - lastTouch <= 300) { e.preventDefault(); }
      lastTouch = now;
    }, { passive: false });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
