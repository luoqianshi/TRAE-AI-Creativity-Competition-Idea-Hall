/* ============================================
   远程守护 · 电视端应用逻辑
   接收手机端消息：字幕、通话、遥控指令
   ============================================ */

(function () {
  'use strict';

  // ============ DOM 工具 ============
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ============ 电视端状态 ============
  const tvState = {
    screen: 'standby',        // standby | incoming | call
    callActive: false,
    callStartTime: 0,
    callDuration: 0,
    callTimer: null,
    helperName: '子女',
    connected: false,
    focusIndex: 0,
    focusables: [],
    historySubtitles: [],
    currentSubtitle: '',
    cmdToastTimer: null,
    callDurationTimer: null
  };

  // ============ BroadcastChannel 通信 ============
  let channel = null;

  function initChannel() {
    try {
      channel = new BroadcastChannel('remote_guard_channel');
      channel.onmessage = handleMessage;
      console.log('电视端通信通道已建立');

      // 通知手机端：电视端已就绪
      setTimeout(() => {
        sendMessage('tv_ready', { time: Date.now() });
      }, 500);

      // 心跳：每 5 秒发送一次在线状态
      setInterval(() => {
        sendMessage('tv_heartbeat', { screen: tvState.screen, time: Date.now() });
      }, 5000);
    } catch (e) {
      console.warn('BroadcastChannel 不可用，尝试 localStorage 事件', e);
      initLocalStorageChannel();
    }
  }

  // 备用通信方案：localStorage 事件
  function initLocalStorageChannel() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'remote_guard_msg' && e.newValue) {
        try {
          const msg = JSON.parse(e.newValue);
          handleMessage({ data: msg });
        } catch (err) {}
      }
    });
    tvState.connected = true;
    updateConnectionUI();
  }

  function sendMessage(type, payload) {
    if (channel) {
      channel.postMessage({ type, payload, from: 'tv', time: Date.now() });
    }
    // 备用：写入 localStorage
    try {
      localStorage.setItem('remote_guard_msg', JSON.stringify({ type, payload, from: 'tv', time: Date.now() }));
    } catch (e) {}
  }

  // ============ 消息处理 ============
  function handleMessage(event) {
    const { type, payload, from } = event.data || {};
    if (from === 'tv') return; // 忽略自己发的

    console.log('电视端收到消息:', type, payload);

    switch (type) {
      case 'mobile_ready':
      case 'mobile_heartbeat':
        tvState.connected = true;
        tvState.helperName = payload.helperName || '子女';
        updateConnectionUI();
        break;

      case 'call_incoming':
        tvState.helperName = payload.helperName || '子女';
        showIncoming();
        break;

      case 'call_answered':
        // 手机端自己接听（一般不会，电视端接听为主）
        break;

      case 'call_start':
        startCall(payload);
        break;

      case 'call_end':
        endCall();
        break;

      case 'subtitle':
        showSubtitle(payload);
        break;

      case 'subtitle_interim':
        showInterimSubtitle(payload.text);
        break;

      case 'remote_command':
        showCommandToast(payload);
        break;

      case 'brand_connected':
        showCommandToast({
          label: `${payload.brandName} 电视已连接`,
          command: 'connected'
        });
        break;
    }
  }

  // ============ 界面切换 ============
  function switchScreen(screenName) {
    tvState.screen = screenName;
    $$('.tv-screen').forEach(s => s.classList.toggle('active', s.id === `screen${capitalize(screenName)}`));

    // 更新可聚焦元素
    setTimeout(updateFocusables, 100);
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // ============ 连接状态 ============
  function updateConnectionUI() {
    const indicator = $('#connIndicator');
    const dot = $('#connDot');
    const text = $('#connText');
    const statusValue = $('#statusValue');

    if (tvState.connected) {
      indicator.classList.add('connected');
      if (dot) dot.classList.add('connected');
      if (text) text.textContent = '已连接手机端';
      if (statusValue) statusValue.textContent = '已连接 · 等待协助';
    } else {
      indicator.classList.remove('connected');
      if (dot) dot.classList.remove('connected');
      if (text) text.textContent = '未连接手机端';
      if (statusValue) statusValue.textContent = '已就绪 · 等待连接';
    }
  }

  // ============ 时钟 ============
  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const timeEl = $('#clockTime');
    const dateEl = $('#clockDate');
    if (timeEl) timeEl.textContent = `${h}:${m}`;

    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    if (dateEl) {
      dateEl.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 · ${weekdays[now.getDay()]}`;
    }
  }

  // ============ 来电界面 ============
  function showIncoming() {
    $('#incomingName').textContent = tvState.helperName;
    switchScreen('incoming');
    tvState.focusIndex = 0;
    updateFocus();

    // 播放铃声（用 Web Audio API 生成）
    playRingtone();
  }

  function playRingtone() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      let count = 0;
      const ring = () => {
        if (tvState.screen !== 'incoming' || count > 8) {
          ctx.close();
          return;
        }
        count++;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
        setTimeout(ring, 1000);
      };
      ring();
    } catch (e) {
      console.warn('铃声播放失败', e);
    }
  }

  function answerCall() {
    sendMessage('call_answered', { time: Date.now() });
    startCall({ helperName: tvState.helperName });
  }

  function rejectCall() {
    sendMessage('call_rejected', { time: Date.now() });
    switchScreen('standby');
  }

  // ============ 通话中 ============
  function startCall(payload) {
    tvState.callActive = true;
    tvState.callStartTime = Date.now();
    tvState.callDuration = 0;
    tvState.historySubtitles = [];
    tvState.currentSubtitle = '';

    $('#tvCallName').textContent = `${payload.helperName || tvState.helperName} 协助中`;
    $('#tvCallDuration').textContent = '00:00';

    // 清空历史
    $('#subtitleHistory').innerHTML = '<p class="history-empty">通话开始，请子女开始说话...</p>';
    $('#subtitleCurrentText').textContent = '';
    $('#subtitleCurrent').classList.remove('active');

    // 启动计时器
    if (tvState.callDurationTimer) clearInterval(tvState.callDurationTimer);
    tvState.callDurationTimer = setInterval(() => {
      tvState.callDuration = Math.floor((Date.now() - tvState.callStartTime) / 1000);
      $('#tvCallDuration').textContent = formatDuration(tvState.callDuration);
    }, 1000);

    switchScreen('call');
    tvState.focusIndex = 0;
    updateFocus();
  }

  function endCall() {
    tvState.callActive = false;
    if (tvState.callDurationTimer) {
      clearInterval(tvState.callDurationTimer);
      tvState.callDurationTimer = null;
    }
    sendMessage('call_end', { time: Date.now() });
    switchScreen('standby');
  }

  function formatDuration(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // ============ 字幕显示 ============
  function showSubtitle(payload) {
    if (!tvState.callActive) return;

    const { speaker, text } = payload;
    if (!text) return;

    // 将当前字幕移入历史
    if (tvState.currentSubtitle) {
      addHistoryItem(speaker === 'elder' ? 'elder' : 'helper', tvState.currentSubtitle);
    }

    // 显示新字幕
    tvState.currentSubtitle = text;
    const currentEl = $('#subtitleCurrent');
    const textEl = $('#subtitleCurrentText');

    // 先隐藏再显示，触发动画
    currentEl.classList.remove('active');
    setTimeout(() => {
      textEl.textContent = text;
      // 协助者的话高亮显示
      if (speaker === 'helper') {
        textEl.classList.add('highlight');
      } else {
        textEl.classList.remove('highlight');
      }
      currentEl.classList.add('active');
    }, 200);

    // 语音播报（TTS）
    if (speaker === 'helper') {
      speakText(text);
    }
  }

  function showInterimSubtitle(text) {
    if (!tvState.callActive || !text) return;
    const textEl = $('#subtitleCurrentText');
    textEl.textContent = text;
    textEl.classList.add('highlight');
    $('#subtitleCurrent').classList.add('active');
  }

  function addHistoryItem(speaker, text) {
    tvState.historySubtitles.push({ speaker, text, time: Date.now() });
    if (tvState.historySubtitles.length > 10) {
      tvState.historySubtitles.shift();
    }

    const historyEl = $('#subtitleHistory');
    // 清除空提示
    const empty = historyEl.querySelector('.history-empty');
    if (empty) empty.remove();

    const item = document.createElement('div');
    item.className = `history-item ${speaker === 'elder' ? 'elder' : ''}`;
    item.textContent = text;
    historyEl.insertBefore(item, historyEl.firstChild);

    // 限制历史数量
    while (historyEl.children.length > 8) {
      historyEl.removeChild(historyEl.lastChild);
    }
  }

  // ============ TTS 语音播报 ============
  function speakText(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'zh-CN';
      utter.rate = 0.9;
      utter.pitch = 1;
      utter.volume = 1;
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('TTS 播报失败', e);
    }
  }

  // ============ 遥控指令提示 ============
  function showCommandToast(payload) {
    const toast = $('#cmdToast');
    const textEl = $('#cmdToastText');
    textEl.textContent = payload.label || payload.command || '操作';

    toast.classList.add('show');

    if (tvState.cmdToastTimer) clearTimeout(tvState.cmdToastTimer);
    tvState.cmdToastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // ============ 遥控器焦点导航 ============
  function updateFocusables() {
    tvState.focusables = Array.from($$('.focusable'));
    tvState.focusIndex = 0;
    updateFocus();
  }

  function updateFocus() {
    tvState.focusables.forEach((el, i) => {
      el.classList.toggle('focused', i === tvState.focusIndex);
    });
  }

  function moveFocus(direction) {
    if (tvState.focusables.length === 0) return;

    if (direction === 'left' || direction === 'up') {
      tvState.focusIndex = (tvState.focusIndex - 1 + tvState.focusables.length) % tvState.focusables.length;
    } else if (direction === 'right' || direction === 'down') {
      tvState.focusIndex = (tvState.focusIndex + 1) % tvState.focusables.length;
    }
    updateFocus();
  }

  function confirmFocus() {
    const el = tvState.focusables[tvState.focusIndex];
    if (!el) return;

    if (el.id === 'btnAnswer') {
      answerCall();
    } else if (el.id === 'btnReject') {
      rejectCall();
    } else if (el.id === 'btnHangup') {
      endCall();
    }
  }

  // ============ 键盘/遥控器事件 ============
  function bindKeyEvents() {
    document.addEventListener('keydown', (e) => {
      console.log('按键:', e.key);
      switch (e.key) {
        case 'ArrowUp':
        case 'Up':
          e.preventDefault();
          moveFocus('up');
          break;
        case 'ArrowDown':
        case 'Down':
          e.preventDefault();
          moveFocus('down');
          break;
        case 'ArrowLeft':
        case 'Left':
          e.preventDefault();
          moveFocus('left');
          break;
        case 'ArrowRight':
        case 'Right':
          e.preventDefault();
          moveFocus('right');
          break;
        case 'Enter':
        case 'OK':
        case ' ':
          e.preventDefault();
          confirmFocus();
          break;
        case 'Escape':
        case 'Back':
          e.preventDefault();
          if (tvState.screen === 'incoming') rejectCall();
          else if (tvState.screen === 'call') endCall();
          break;
      }
    });

    // 鼠标点击也支持
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.focusable');
      if (btn) {
        const idx = tvState.focusables.indexOf(btn);
        if (idx >= 0) {
          tvState.focusIndex = idx;
          updateFocus();
          confirmFocus();
        }
      }
    });
  }

  // ============ 按钮事件 ============
  function bindButtonEvents() {
    $('#btnAnswer').addEventListener('click', answerCall);
    $('#btnReject').addEventListener('click', rejectCall);
    $('#btnHangup').addEventListener('click', endCall);
  }

  // ============ 初始化 ============
  function init() {
    updateClock();
    setInterval(updateClock, 30000);

    initChannel();
    bindKeyEvents();
    bindButtonEvents();
    updateFocusables();

    console.log('电视端应用已启动');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
