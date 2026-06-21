/* ============================================
   远程守护 · 应用主逻辑
   ============================================ */

(function () {
  'use strict';

  // ============ 应用状态 ============
  const state = {
    currentView: 'home',
    connection: null,        // { brand, model, connected, lastConnected }
    selectedBrand: null,
    selectedModel: null,
    records: [],
    cmdLog: [],
    call: {
      active: false,
      startTime: 0,
      duration: 0,
      muted: false,
      speakerOn: true,
      fontSize: 'large',
      recognizing: false
    },
    subtitles: [],
    recognition: null,
    callTimer: null,
    audioStream: null,
    tvConnected: false,
    channel: null
  };

  // ============ DOM 工具 ============
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ============ BroadcastChannel 通信（与电视端） ============
  function initChannel() {
    try {
      state.channel = new BroadcastChannel('remote_guard_channel');
      state.channel.onmessage = handleTVMessage;
      console.log('手机端通信通道已建立');

      // 通知电视端：手机端已就绪
      setTimeout(() => {
        sendToTV('mobile_ready', { helperName: '子女' });
      }, 500);

      // 心跳
      setInterval(() => {
        sendToTV('mobile_heartbeat', { helperName: '子女', time: Date.now() });
      }, 5000);
    } catch (e) {
      console.warn('BroadcastChannel 不可用', e);
    }
  }

  function sendToTV(type, payload) {
    if (state.channel) {
      state.channel.postMessage({ type, payload, from: 'mobile', time: Date.now() });
    }
  }

  function handleTVMessage(event) {
    const { type, payload, from } = event.data || {};
    if (from === 'mobile') return;

    console.log('手机端收到电视端消息:', type, payload);

    switch (type) {
      case 'tv_ready':
      case 'tv_heartbeat':
        if (!state.tvConnected) {
          state.tvConnected = true;
          toast('电视端已连接', 'success', 1500);
        }
        break;

      case 'call_answered':
        // 电视端接听，正式开始通话
        if (!state.call.active) {
          startCallActual();
        }
        break;

      case 'call_rejected':
        toast('长辈未接听，请稍后再试', 'warn', 2000);
        break;

      case 'call_end':
        if (state.call.active) {
          endCallByTV();
        }
        break;
    }
  }

  // ============ Toast 提示 ============
  function toast(message, type = 'default', duration = 2400) {
    const container = $('#toastContainer');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  // ============ 持久化 ============
  function loadState() {
    try {
      const conn = localStorage.getItem(STORAGE_KEYS.CONNECTION);
      if (conn) state.connection = JSON.parse(conn);
      const recs = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (recs) state.records = JSON.parse(recs);
      const log = localStorage.getItem(STORAGE_KEYS.CMD_LOG);
      if (log) state.cmdLog = JSON.parse(log);
    } catch (e) {
      console.warn('加载本地数据失败', e);
    }
  }

  function saveConnection() {
    if (state.connection) {
      localStorage.setItem(STORAGE_KEYS.CONNECTION, JSON.stringify(state.connection));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CONNECTION);
    }
  }

  function saveRecords() {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(state.records));
  }

  function saveCmdLog() {
    localStorage.setItem(STORAGE_KEYS.CMD_LOG, JSON.stringify(state.cmdLog));
  }

  // ============ 视图切换 ============
  function switchView(viewName) {
    state.currentView = viewName;
    $$('.view').forEach(v => v.classList.toggle('active', v.dataset.view === viewName));
    $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.nav === viewName));
    // 通话页特殊处理：隐藏底部导航
    $('#appNav').style.display = viewName === 'call' ? 'none' : 'flex';
    // 滚动到顶
    $('#appMain').scrollTop = 0;
    // 视图特定初始化
    if (viewName === 'home') renderHome();
    if (viewName === 'brand') renderBrandGrid();
    if (viewName === 'remote') renderRemote();
    if (viewName === 'call') renderCallView();
  }

  // ============ 首页渲染 ============
  function renderHome() {
    const banner = $('#heroBanner');
    const heroLabel = $('#heroLabel');
    const heroTitle = $('#heroTitle');
    const heroDesc = $('#heroDesc');
    const statusDot = $('#statusDot');
    const statusText = $('#statusText');

    if (state.connection && state.connection.connected) {
      banner.classList.add('connected');
      heroLabel.textContent = '已连接电视';
      heroTitle.textContent = `${state.connection.brand.name} ${state.connection.model.name}`;
      heroDesc.textContent = '点击下方按钮开始远程协助';
      statusDot.classList.add('online');
      statusText.textContent = '已连接';
    } else {
      banner.classList.remove('connected');
      heroLabel.textContent = '尚未连接电视';
      heroTitle.textContent = '为长辈开启远程协助';
      heroDesc.textContent = '选择家中电视品牌，建立连接后即可远程指导';
      statusDot.classList.remove('online');
      statusText.textContent = '未连接';
    }

    renderRecords();
  }

  function renderRecords() {
    const list = $('#recordsList');
    const empty = $('#recordsEmpty');
    if (!state.records || state.records.length === 0) {
      list.innerHTML = '';
      list.appendChild(empty);
      return;
    }
    empty.remove();
    list.innerHTML = state.records.slice(0, 10).map(r => `
      <div class="record-item">
        <div class="record-brand" style="background:${r.brandColor}">${r.brandShort}</div>
        <div class="record-body">
          <div class="record-title">${r.brandName} ${r.modelName}</div>
          <div class="record-meta">${formatTime(r.startTime)} · 协助 ${formatDuration(r.duration)}</div>
        </div>
        <div class="record-tag">已完成</div>
      </div>
    `).join('');
  }

  function formatTime(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前';
    if (diff < 604800000) return Math.floor(diff / 86400000) + ' 天前';
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }

  function formatDuration(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}分${s}秒` : `${s}秒`;
  }

  // ============ 品牌选择页 ============
  function renderBrandGrid() {
    const grid = $('#brandGrid');
    grid.innerHTML = TV_BRANDS.map(b => `
      <button class="brand-card" data-brand="${b.id}">
        <div class="brand-logo" style="background:${b.color}">${b.short}</div>
        <div class="brand-name">${b.name}</div>
        <div class="brand-count">${b.models.length} 个型号</div>
      </button>
    `).join('');

    // 如果已连接，高亮当前品牌
    if (state.connection && state.connection.brand) {
      const card = grid.querySelector(`[data-brand="${state.connection.brand.id}"]`);
      if (card) card.classList.add('selected');
    }
  }

  function selectBrand(brandId) {
    const brand = TV_BRANDS.find(b => b.id === brandId);
    if (!brand) return;

    state.selectedBrand = brand;
    state.selectedModel = null;

    // 更新选中态
    $$('.brand-card').forEach(c => c.classList.toggle('selected', c.dataset.brand === brandId));

    // 显示型号面板
    showModelPanel(brand);
  }

  function showModelPanel(brand) {
    const panel = $('#modelPanel');
    $('#modelBrandColor').style.background = brand.color;
    $('#modelBrandColor').textContent = brand.short;
    $('#modelBrandName').textContent = brand.name;

    const list = $('#modelList');
    list.innerHTML = brand.models.map(m => `
      <div class="model-item" data-model="${m.id}">
        <div class="model-item-info">
          <div class="model-item-name">${m.name}</div>
          <div class="model-item-features">${m.features.join(' · ')}</div>
        </div>
        <div class="model-item-radio"></div>
      </div>
    `).join('');

    $('#pairBtn').disabled = true;
    panel.classList.add('show');
  }

  function hideModelPanel() {
    $('#modelPanel').classList.remove('show');
  }

  function selectModel(modelId) {
    if (!state.selectedBrand) return;
    const model = state.selectedBrand.models.find(m => m.id === modelId);
    if (!model) return;

    state.selectedModel = model;
    $$('.model-item').forEach(item => {
      item.classList.toggle('selected', item.dataset.model === modelId);
    });
    $('#pairBtn').disabled = false;
  }

  function startPairing() {
    if (!state.selectedBrand || !state.selectedModel) return;

    const overlay = $('#pairingOverlay');
    overlay.classList.add('show');

    const steps = [
      { text: '正在搜索电视...', sub: '请确保电视已开机并连接同一网络' },
      { text: '发现 ' + state.selectedBrand.name + ' 电视', sub: '正在建立安全连接...' },
      { text: '正在配对...', sub: '验证设备信息与权限' }
    ];

    let i = 0;
    const updateStep = () => {
      if (i < steps.length) {
        $('#pairingText').textContent = steps[i].text;
        $('#pairingSub').textContent = steps[i].sub;
        i++;
        setTimeout(updateStep, 900);
      } else {
        // 配对成功
        state.connection = {
          brand: state.selectedBrand,
          model: state.selectedModel,
          connected: true,
          lastConnected: new Date().toISOString()
        };
        saveConnection();
        overlay.classList.remove('show');
        hideModelPanel();
        toast(`${state.selectedBrand.name} 电视连接成功`, 'success');

        // 通知电视端品牌连接成功
        sendToTV('brand_connected', {
          brandName: state.selectedBrand.name,
          modelName: state.selectedModel.name,
          time: Date.now()
        });

        switchView('remote');
      }
    };
    setTimeout(updateStep, 600);
  }

  // ============ 远程遥控台 ============
  function renderRemote() {
    const info = $('#remoteTvInfo');
    const brandEl = $('#tvInfoBrand');
    const nameEl = $('#tvInfoName');
    const statusEl = $('#tvInfoStatus');

    if (state.connection && state.connection.connected) {
      brandEl.style.background = state.connection.brand.color;
      brandEl.textContent = state.connection.brand.short;
      nameEl.textContent = `${state.connection.brand.name} ${state.connection.model.name}`;
      statusEl.textContent = '已连接 · 可远程操控';
    } else {
      brandEl.style.background = 'var(--ink-mute)';
      brandEl.textContent = '?';
      nameEl.textContent = '未连接电视';
      statusEl.textContent = '请先连接电视';
    }

    // 显示通话悬浮窗（如果通话中）
    $('#callFab').classList.toggle('show', state.call.active);

    renderCmdLog();
  }

  function sendCommand(cmd, label) {
    if (!state.connection || !state.connection.connected) {
      toast('请先连接电视', 'warn');
      switchView('brand');
      return;
    }

    // 记录日志
    const log = {
      id: Date.now().toString(),
      command: cmd,
      label: label,
      timestamp: new Date().toISOString()
    };
    state.cmdLog.unshift(log);
    if (state.cmdLog.length > 50) state.cmdLog = state.cmdLog.slice(0, 50);
    saveCmdLog();
    renderCmdLog();

    // 推送遥控指令到电视端（显示提示）
    sendToTV('remote_command', { command: cmd, label: label });

    // 触觉反馈
    if (navigator.vibrate) navigator.vibrate(15);

    toast(`已发送：${label}`, 'default', 1200);
  }

  function renderCmdLog() {
    const list = $('#cmdLogList');
    if (!state.cmdLog || state.cmdLog.length === 0) {
      list.innerHTML = '<p class="cmd-log-empty">暂无操作记录</p>';
      return;
    }
    list.innerHTML = state.cmdLog.slice(0, 20).map(log => {
      const d = new Date(log.timestamp);
      const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
      return `
        <div class="cmd-log-item">
          <span class="cmd-log-time">${time}</span>
          <span class="cmd-log-label">${log.label}</span>
          <span class="cmd-log-badge">已发送</span>
        </div>
      `;
    }).join('');
  }

  function clearCmdLog() {
    state.cmdLog = [];
    saveCmdLog();
    renderCmdLog();
    toast('操作记录已清空', 'default', 1200);
  }

  // ============ 语音通话与字幕 ============
  function startCall() {
    if (state.call.active) {
      switchView('call');
      return;
    }

    // 发送来电通知到电视端
    sendToTV('call_incoming', {
      helperName: '子女',
      brandName: state.connection ? state.connection.brand.name : '',
      time: Date.now()
    });

    toast('正在呼叫电视端，等待长辈接听...', 'default', 2500);

    // 如果 30 秒未接听，自动取消
    setTimeout(() => {
      if (!state.call.active) {
        toast('无人接听，请稍后再试', 'warn', 2000);
      }
    }, 30000);
  }

  // 电视端接听后，正式开始通话
  function startCallActual() {
    state.call.active = true;
    state.call.startTime = Date.now();
    state.call.duration = 0;
    state.call.muted = false;
    state.call.speakerOn = true;
    state.subtitles = [];

    // 通知电视端进入通话界面
    sendToTV('call_start', {
      helperName: '子女',
      time: Date.now()
    });

    // 启动计时器
    state.callTimer = setInterval(() => {
      state.call.duration = Math.floor((Date.now() - state.call.startTime) / 1000);
      $('#callDuration').textContent = formatCallDuration(state.call.duration);
    }, 1000);

    // 请求麦克风权限
    requestMicrophone();

    // 显示悬浮窗
    $('#callFab').classList.add('show');

    // 添加欢迎字幕（模拟长辈接听）
    setTimeout(() => {
      addSubtitle('elder', '喂，能听到吗？我这边电视好像需要调一下。');
    }, 800);

    switchView('call');
    toast('通话已接通', 'success', 1500);
  }

  // 电视端主动挂断
  function endCallByTV() {
    if (state.callTimer) {
      clearInterval(state.callTimer);
      state.callTimer = null;
    }
    if (state.audioStream) {
      state.audioStream.getTracks().forEach(t => t.stop());
      state.audioStream = null;
    }
    stopRecognition();

    // 保存协助记录
    if (state.connection && state.call.duration > 0) {
      saveAssistRecord();
    }

    state.call.active = false;
    state.call.duration = 0;
    state.subtitles = [];

    $('#callFab').classList.remove('show');
    $('#callDuration').textContent = '00:00';

    toast('长辈已结束通话', 'default', 1500);
    switchView('home');
  }

  async function requestMicrophone() {
    try {
      state.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // 麦克风获取成功
    } catch (e) {
      console.warn('麦克风权限获取失败', e);
      toast('未获取麦克风权限，语音识别可能不可用', 'warn', 3000);
    }
  }

  function formatCallDuration(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function endCall() {
    if (!state.call.active) {
      switchView('home');
      return;
    }

    // 通知电视端结束通话
    sendToTV('call_end', { time: Date.now() });

    // 停止语音识别
    stopRecognition();

    // 停止计时器
    if (state.callTimer) {
      clearInterval(state.callTimer);
      state.callTimer = null;
    }

    // 释放麦克风
    if (state.audioStream) {
      state.audioStream.getTracks().forEach(t => t.stop());
      state.audioStream = null;
    }

    // 保存协助记录
    if (state.connection && state.call.duration > 0) {
      saveAssistRecord();
    }

    state.call.active = false;
    state.call.duration = 0;
    state.subtitles = [];

    $('#callFab').classList.remove('show');
    $('#callDuration').textContent = '00:00';

    toast('通话已结束', 'default', 1500);
    switchView('home');
  }

  // 保存协助记录（抽取公共函数）
  function saveAssistRecord() {
    if (!state.connection || state.call.duration <= 0) return;
    const record = {
      id: Date.now().toString(),
      brandName: state.connection.brand.name,
      brandShort: state.connection.brand.short,
      brandColor: state.connection.brand.color,
      modelName: state.connection.model.name,
      startTime: new Date(state.call.startTime).toISOString(),
      duration: state.call.duration,
      commandCount: state.cmdLog.filter(l => new Date(l.timestamp).getTime() > state.call.startTime).length,
      summary: `协助时长 ${formatDuration(state.call.duration)}`
    };
    state.records.unshift(record);
    if (state.records.length > 20) state.records = state.records.slice(0, 20);
    saveRecords();
  }

  function renderCallView() {
    $('#callDuration').textContent = formatCallDuration(state.call.duration);
    renderSubtitles();
    updateFontSizeUI();
  }

  function addSubtitle(speaker, text) {
    const sub = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      speaker: speaker,
      text: text,
      timestamp: new Date().toISOString()
    };
    state.subtitles.push(sub);
    renderSubtitles();

    // 推送字幕到电视端（老人看屏幕）
    sendToTV('subtitle', {
      speaker: speaker,
      text: text,
      timestamp: sub.timestamp
    });
  }

  function renderSubtitles() {
    const list = $('#subtitlesList');
    const welcome = $('#subtitleWelcome');

    if (state.subtitles.length === 0) {
      list.innerHTML = '';
      list.appendChild(welcome);
      return;
    }

    const sizeClass = `size-${state.call.fontSize}`;
    list.innerHTML = state.subtitles.map(s => {
      const speakerLabel = s.speaker === 'helper' ? '我（协助者）' : '长辈';
      const d = new Date(s.timestamp);
      const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      return `
        <div class="subtitle-bubble ${s.speaker}">
          <div class="sub-speaker">${speakerLabel}</div>
          <div class="sub-text ${sizeClass}">${escapeHtml(s.text)}</div>
          <div class="sub-time">${time}</div>
        </div>
      `;
    }).join('');

    // 滚动到底部
    const area = $('#subtitlesArea');
    setTimeout(() => area.scrollTop = area.scrollHeight, 50);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============ Web Speech API 语音识别 ============
  function initSpeechRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      console.warn('浏览器不支持语音识别');
      return null;
    }
    const recognition = new SR();
    recognition.lang = 'zh-CN';
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalText = '';

    recognition.onresult = (event) => {
      let interim = '';
      finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interim += transcript;
        }
      }

      // 显示中间结果
      let interimEl = $('#interimSub');
      if (interim) {
        if (!interimEl) {
          interimEl = document.createElement('div');
          interimEl.id = 'interimSub';
          interimEl.className = 'sub-interim';
          $('#subtitlesList').appendChild(interimEl);
        }
        interimEl.textContent = '正在识别：' + interim;
        scrollSubtitles();

        // 推送中间结果到电视端（实时显示）
        sendToTV('subtitle_interim', { text: interim });
      } else if (interimEl) {
        interimEl.remove();
      }

      // 最终结果
      if (finalText.trim()) {
        if (interimEl) interimEl.remove();
        addSubtitle('helper', finalText.trim());
      }
    };

    recognition.onerror = (event) => {
      console.warn('语音识别错误', event.error);
      if (event.error === 'not-allowed') {
        toast('请允许麦克风权限以使用语音识别', 'error', 3000);
        stopRecognition();
      } else if (event.error === 'no-speech') {
        // 无语音输入，继续
      } else if (event.error === 'network') {
        toast('语音识别网络错误', 'error', 2000);
      }
    };

    recognition.onend = () => {
      // 如果仍在识别状态，自动重启
      if (state.call.recognizing) {
        try {
          recognition.start();
        } catch (e) {
          console.warn('重启识别失败', e);
        }
      }
    };

    return recognition;
  }

  function startRecognition() {
    if (!state.recognition) {
      state.recognition = initSpeechRecognition();
    }
    if (!state.recognition) {
      toast('当前浏览器不支持语音识别，建议使用 Chrome 浏览器', 'error', 3000);
      return;
    }

    try {
      state.recognition.start();
      state.call.recognizing = true;
      $('#speakBtn').classList.add('recording');
      $('#speakBtnText').textContent = '停止说话';
      $('#recognizingBar').classList.add('show');
      toast('开始语音识别，请说话', 'success', 1500);
    } catch (e) {
      console.warn('启动识别失败', e);
      toast('启动失败，请重试', 'error', 1500);
    }
  }

  function stopRecognition() {
    if (state.recognition && state.call.recognizing) {
      state.call.recognizing = false;
      try {
        state.recognition.stop();
      } catch (e) {}
      $('#speakBtn').classList.remove('recording');
      $('#speakBtnText').textContent = '开始说话';
      $('#recognizingBar').classList.remove('show');
      const interimEl = $('#interimSub');
      if (interimEl) interimEl.remove();
    }
  }

  function toggleRecognition() {
    if (state.call.recognizing) {
      stopRecognition();
    } else {
      startRecognition();
    }
  }

  function scrollSubtitles() {
    const area = $('#subtitlesArea');
    setTimeout(() => area.scrollTop = area.scrollHeight, 50);
  }

  // ============ 通话控制 ============
  function toggleMute() {
    state.call.muted = !state.call.muted;
    const btn = $('#muteBtn');
    btn.dataset.on = state.call.muted;
    btn.querySelector('.mic-on').style.display = state.call.muted ? 'none' : 'block';
    btn.querySelector('.mic-off').style.display = state.call.muted ? 'block' : 'none';

    if (state.audioStream) {
      state.audioStream.getAudioTracks().forEach(t => t.enabled = !state.call.muted);
    }

    if (state.call.muted && state.call.recognizing) {
      stopRecognition();
      toast('已静音，语音识别已暂停', 'default', 1500);
    }
  }

  function toggleSpeaker() {
    state.call.speakerOn = !state.call.speakerOn;
    $('#speakerBtn').dataset.on = state.call.speakerOn;
    toast(state.call.speakerOn ? '扬声器已开启' : '扬声器已关闭', 'default', 1200);
  }

  function setFontSize(size) {
    state.call.fontSize = size;
    updateFontSizeUI();
    renderSubtitles();
  }

  function updateFontSizeUI() {
    $$('.fs-btn').forEach(b => b.classList.toggle('active', b.dataset.size === state.call.fontSize));
  }

  // ============ 事件绑定 ============
  function bindEvents() {
    // 首页快捷操作
    $('#actionConnect').addEventListener('click', () => switchView('brand'));
    $('#actionRemote').addEventListener('click', () => {
      if (!state.connection || !state.connection.connected) {
        toast('请先连接电视', 'warn');
        switchView('brand');
        return;
      }
      switchView('remote');
    });
    $('#actionCall').addEventListener('click', () => {
      if (!state.connection || !state.connection.connected) {
        toast('请先连接电视后再发起通话', 'warn');
        switchView('brand');
        return;
      }
      startCall();
    });

    // 打开电视端（新标签页）
    $('#actionOpenTV').addEventListener('click', () => {
      window.open('tv.html', '_blank');
      toast('电视端已在新标签页打开', 'success', 1800);
    });

    // 清空记录
    $('#clearRecords').addEventListener('click', () => {
      if (state.records.length === 0) return;
      state.records = [];
      saveRecords();
      renderRecords();
      toast('协助记录已清空', 'default', 1200);
    });

    // 品牌选择
    $('#brandGrid').addEventListener('click', (e) => {
      const card = e.target.closest('.brand-card');
      if (card) selectBrand(card.dataset.brand);
    });

    // 型号选择
    $('#modelList').addEventListener('click', (e) => {
      const item = e.target.closest('.model-item');
      if (item) selectModel(item.dataset.model);
    });

    $('#modelClose').addEventListener('click', hideModelPanel);
    $('#pairBtn').addEventListener('click', startPairing);

    // 返回按钮
    $$('[data-back]').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.back));
    });

    // 遥控器按键
    $$('.view-remote [data-cmd]').forEach(btn => {
      btn.addEventListener('click', () => {
        sendCommand(btn.dataset.cmd, btn.dataset.label);
      });
    });

    $('#clearCmdLog').addEventListener('click', clearCmdLog);

    // 通话悬浮窗
    $('#fabBtn').addEventListener('click', () => switchView('call'));

    // 通话页控制
    $('#callMinimize').addEventListener('click', () => switchView('remote'));
    $('#muteBtn').addEventListener('click', toggleMute);
    $('#speakerBtn').addEventListener('click', toggleSpeaker);
    $('#speakBtn').addEventListener('click', toggleRecognition);
    $('#hangupBtn').addEventListener('click', endCall);

    // 字号控制
    $$('.fs-btn').forEach(btn => {
      btn.addEventListener('click', () => setFontSize(btn.dataset.size));
    });

    // 底部导航
    $$('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const nav = item.dataset.nav;
        if (nav === 'call') {
          if (!state.call.active) {
            if (!state.connection || !state.connection.connected) {
              toast('请先连接电视', 'warn');
              switchView('brand');
              return;
            }
            startCall();
          } else {
            switchView('call');
          }
        } else {
          switchView(nav);
        }
      });
    });
  }

  // ============ 初始化 ============
  function init() {
    loadState();
    bindEvents();
    initChannel();
    renderHome();
    renderBrandGrid();
    renderCmdLog();

    // 如果有连接，显示悬浮窗状态
    if (state.call.active) {
      $('#callFab').classList.add('show');
    }
  }

  // 启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
