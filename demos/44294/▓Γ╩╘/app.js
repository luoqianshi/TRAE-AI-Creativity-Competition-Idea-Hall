/* ============================================
   VOICE STUDIO — Application Logic
   双引擎：原生 Web Speech API + ElevenLabs AI
   ============================================ */

(function () {
  'use strict';

  // ---------- 状态 ----------
  const state = {
    engine: 'native', // 'native' | 'elevenlabs'
    voices: [],
    selectedVoice: null,
    text: '',
    rate: 1,
    pitch: 1,
    volume: 1,
    emotion: 'neutral',
    speaking: false,
    paused: false,
    charIndex: 0,
    audioBuffer: null,
    audioCtx: null,
    analyser: null,
    analyserSource: null,
    refPlaying: false,
    spectrumMode: 'idle',
    // 原生增强
    smartSegment: true,
    dynamicParam: true,
    // ElevenLabs
    elApiKey: '',
    elVoices: [],
    elSelectedVoiceId: '',
    elStability: 0.5,
    elSimilarity: 0.75,
    elStyle: 0,
    elAudioEl: null,
    elAbortCtrl: null,
  };

  // ---------- 持久化键 ----------
  const KEYS = {
    history: 'voice_studio_history',
    settings: 'voice_studio_settings',
  };

  // ---------- DOM 引用 ----------
  const $ = (id) => document.getElementById(id);
  const els = {
    textInput: $('textInput'),
    charCount: $('charCount'),
    estDuration: $('estDuration'),
    clearTextBtn: $('clearTextBtn'),
    dropzone: $('dropzone'),
    audioInput: $('audioInput'),
    dropzoneEmpty: $('dropzoneEmpty'),
    dropzoneFilled: $('dropzoneFilled'),
    removeAudioBtn: $('removeAudioBtn'),
    audioName: $('audioName'),
    audioDuration: $('audioDuration'),
    audioSize: $('audioSize'),
    waveformCanvas: $('waveformCanvas'),
    refAudio: $('refAudio'),
    refPlayBtn: $('refPlayBtn'),
    refPlayIcon: $('refPlayIcon'),
    refProgressFill: $('refProgressFill'),
    refTime: $('refTime'),
    voiceSelect: $('voiceSelect'),
    emotionSelect: $('emotionSelect'),
    mainPlayBtn: $('mainPlayBtn'),
    mainPlayIcon: $('mainPlayIcon'),
    stopBtn: $('stopBtn'),
    speakProgress: $('speakProgress'),
    speakStatus: $('speakStatus'),
    speakPosition: $('speakPosition'),
    statusLed: $('statusLed'),
    statusLabel: $('statusLabel'),
    engineLabel: $('engineLabel'),
    spectrumCanvas: $('spectrumCanvas'),
    spectrumLabel: $('spectrumLabel'),
    historyList: $('historyList'),
    historyEmpty: $('historyEmpty'),
    clearHistoryBtn: $('clearHistoryBtn'),
    toast: $('toast'),
    // 设置面板
    settingsBtn: $('settingsBtn'),
    settingsModal: $('settingsModal'),
    settingsCloseBtn: $('settingsCloseBtn'),
    settingsSaveBtn: $('settingsSaveBtn'),
    elSection: $('elSection'),
    nativeSection: $('nativeSection'),
    apiKeyInput: $('apiKeyInput'),
    verifyKeyBtn: $('verifyKeyBtn'),
    keyStatus: $('keyStatus'),
    elVoiceSelect: $('elVoiceSelect'),
    refreshVoicesBtn: $('refreshVoicesBtn'),
    cloneNameInput: $('cloneNameInput'),
    cloneVoiceBtn: $('cloneVoiceBtn'),
    stabilitySlider: $('stabilitySlider'),
    stabilityVal: $('stabilityVal'),
    similaritySlider: $('similaritySlider'),
    similarityVal: $('similarityVal'),
    styleSlider: $('styleSlider'),
    styleVal: $('styleVal'),
    smartSegmentToggle: $('smartSegmentToggle'),
    dynamicParamToggle: $('dynamicParamToggle'),
  };

  // ---------- 工具函数 ----------
  function showToast(msg, type = '') {
    els.toast.textContent = msg;
    els.toast.className = 'toast show ' + type;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      els.toast.className = 'toast ' + type;
    }, 2800);
  }

  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + s.toString().padStart(2, '0');
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function uuid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ---------- 设置持久化 ----------
  function loadSettings() {
    try {
      const s = JSON.parse(localStorage.getItem(KEYS.settings) || '{}');
      if (s.engine) state.engine = s.engine;
      if (s.elApiKey) state.elApiKey = s.elApiKey;
      if (s.elSelectedVoiceId) state.elSelectedVoiceId = s.elSelectedVoiceId;
      if (typeof s.elStability === 'number') state.elStability = s.elStability;
      if (typeof s.elSimilarity === 'number') state.elSimilarity = s.elSimilarity;
      if (typeof s.elStyle === 'number') state.elStyle = s.elStyle;
      if (typeof s.smartSegment === 'boolean') state.smartSegment = s.smartSegment;
      if (typeof s.dynamicParam === 'boolean') state.dynamicParam = s.dynamicParam;
      if (s.emotion) state.emotion = s.emotion;
    } catch (_) {}
  }

  function saveSettings() {
    const s = {
      engine: state.engine,
      elApiKey: state.elApiKey,
      elSelectedVoiceId: state.elSelectedVoiceId,
      elStability: state.elStability,
      elSimilarity: state.elSimilarity,
      elStyle: state.elStyle,
      smartSegment: state.smartSegment,
      dynamicParam: state.dynamicParam,
      emotion: state.emotion,
    };
    try { localStorage.setItem(KEYS.settings, JSON.stringify(s)); } catch (_) {}
  }

  // ---------- 情感参数映射 ----------
  // 根据情感风格和句尾标点动态调整语速、音调
  function getDynamicParams(emotion, endPunct) {
    const base = { rate: state.rate, pitch: state.pitch };
    if (!state.dynamicParam) return base;

    // 情感基础偏移
    const emotionMap = {
      neutral:   { rate: 1.0, pitch: 1.0 },
      narrative: { rate: 0.92, pitch: 0.95 },  // 叙事：稍慢稍低
      cheerful:  { rate: 1.1, pitch: 1.15 },   // 明快：稍快稍高
      calm:      { rate: 0.85, pitch: 0.9 },   // 舒缓：慢且低
      serious:   { rate: 0.9, pitch: 0.85 },   // 严肃：稍慢偏低
      question:  { rate: 1.0, pitch: 1.2 },    // 疑问：上扬
      exclaim:   { rate: 1.05, pitch: 1.25 },  // 激昂：稍快偏高
    };
    const emo = emotionMap[emotion] || emotionMap.neutral;

    let rate = base.rate * emo.rate;
    let pitch = base.pitch * emo.pitch;

    // 句尾标点微调
    if (endPunct === '？' || endPunct === '?') {
      pitch *= 1.12; // 问号上扬
    } else if (endPunct === '！' || endPunct === '!') {
      rate *= 0.95; pitch *= 1.1; // 感叹加强
    } else if (endPunct === '。' || endPunct === '.') {
      pitch *= 0.95; // 句号稍降
    } else if (endPunct === '，' || endPunct === ',') {
      rate *= 1.02; // 逗号微快
    }

    // 限制范围
    rate = Math.max(0.5, Math.min(2, rate));
    pitch = Math.max(0, Math.min(2, pitch));
    return { rate, pitch };
  }

  // ---------- 智能分段 ----------
  // 将长文本按句子切分，保留标点用于情感判断
  function segmentText(text) {
    if (!state.smartSegment) return [text];
    // 按中英文句末标点切分，保留标点
    const parts = text.match(/[^。！？!?,，;；\n]+[。！？!?,，;；\n]?/g) || [text];
    // 合并过短的片段（<4字符合并到上一段）
    const merged = [];
    for (const p of parts) {
      const trimmed = p.trim();
      if (!trimmed) continue;
      if (merged.length && trimmed.length < 4) {
        merged[merged.length - 1] += trimmed;
      } else {
        merged.push(trimmed);
      }
    }
    return merged.length ? merged : [text];
  }

  function getEndPunct(segment) {
    const last = segment.trim().slice(-1);
    if ('。！？!?,，;；\n'.includes(last)) return last;
    return '';
  }

  // ---------- 原生语音合成 ----------
  const synth = window.speechSynthesis;
  let nativeQueue = [];
  let nativeQueueIdx = 0;
  let nativeTotalLen = 0;

  function loadVoices() {
    return new Promise((resolve) => {
      let voices = synth ? synth.getVoices() : [];
      if (voices.length) { resolve(voices); return; }
      if (synth) {
        synth.onvoiceschanged = () => resolve(synth.getVoices());
      }
      setTimeout(() => resolve(synth ? synth.getVoices() : []), 1000);
    });
  }

  function populateVoices(voices) {
    state.voices = voices;
    els.voiceSelect.innerHTML = '';

    if (!voices.length) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = '无可用音色（浏览器不支持）';
      els.voiceSelect.appendChild(opt);
      return;
    }

    const sorted = [...voices].sort((a, b) => {
      const aZh = a.lang.startsWith('zh');
      const bZh = b.lang.startsWith('zh');
      if (aZh && !bZh) return -1;
      if (!aZh && bZh) return 1;
      return a.lang.localeCompare(b.lang);
    });

    sorted.forEach((v, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = v.name + ' · ' + v.lang;
      els.voiceSelect.appendChild(opt);
    });

    const zhIdx = sorted.findIndex((v) => v.lang.startsWith('zh'));
    const defaultIdx = zhIdx >= 0 ? zhIdx : 0;
    els.voiceSelect.value = defaultIdx;
    state.selectedVoice = sorted[defaultIdx];
  }

  function speakNative() {
    const text = state.text.trim();
    if (!text) { showToast('请先输入要朗读的文本', 'error'); return; }
    if (!state.selectedVoice) { showToast('请选择一个音色', 'error'); return; }
    if (!synth) { showToast('浏览器不支持语音合成', 'error'); return; }

    synth.cancel();
    nativeQueue = segmentText(text);
    nativeQueueIdx = 0;
    nativeTotalLen = text.length;

    state.speaking = true;
    state.paused = false;
    state.charIndex = 0;
    updateStatus('speaking', '朗读中 / SPEAKING');
    els.mainPlayBtn.classList.add('speaking');
    setPlayIcon('pause');
    els.stopBtn.disabled = false;
    els.speakStatus.textContent = '朗读中';
    state.spectrumMode = 'speaking';
    els.spectrumLabel.textContent = '朗读频谱 / SPEAKING';
    startSpectrumLoop();

    speakNextSegment();
  }

  function speakNextSegment() {
    if (nativeQueueIdx >= nativeQueue.length) {
      finishSpeak();
      saveToHistory();
      return;
    }
    const segment = nativeQueue[nativeQueueIdx];
    const endPunct = getEndPunct(segment);
    const params = getDynamicParams(state.emotion, endPunct);

    const u = new SpeechSynthesisUtterance(segment);
    u.voice = state.selectedVoice;
    u.rate = params.rate;
    u.pitch = params.pitch;
    u.volume = state.volume;
    u.lang = state.selectedVoice.lang;

    u.onboundary = (e) => {
      if (e.charIndex != null) {
        // 累计已朗读段长度 + 当前段内偏移
        let offset = 0;
        for (let i = 0; i < nativeQueueIdx; i++) offset += nativeQueue[i].length;
        state.charIndex = offset + e.charIndex;
        const pct = Math.min(100, (state.charIndex / nativeTotalLen) * 100);
        els.speakProgress.style.width = pct + '%';
        els.speakPosition.textContent = state.charIndex + ' / ' + nativeTotalLen;
      }
    };

    u.onend = () => {
      if (!state.speaking) return; // 已被停止
      nativeQueueIdx++;
      // 段间短暂停顿由浏览器自然处理，这里直接继续
      speakNextSegment();
    };

    u.onerror = (e) => {
      if (e.error && e.error !== 'interrupted' && e.error !== 'canceled') {
        showToast('朗读出错: ' + (e.error || '未知'), 'error');
      }
    };

    synth.speak(u);
  }

  function finishSpeak() {
    state.speaking = false;
    state.paused = false;
    state.charIndex = 0;
    nativeQueue = [];
    nativeQueueIdx = 0;
    updateStatus('idle', '待机 / IDLE');
    els.mainPlayBtn.classList.remove('speaking');
    setPlayIcon('play');
    els.stopBtn.disabled = true;
    els.speakStatus.textContent = '就绪';
    els.speakProgress.style.width = '0%';
    els.speakPosition.textContent = '0 / 0';
    state.spectrumMode = 'idle';
    els.spectrumLabel.textContent = '实时频谱 / LIVE';
    setTimeout(() => { if (!state.speaking && !state.refPlaying) stopSpectrumLoop(); }, 600);
  }

  function togglePlay() {
    if (state.engine === 'elevenlabs') {
      togglePlayElevenLabs();
      return;
    }
    // 原生
    if (!state.speaking) {
      speakNative();
      return;
    }
    if (state.paused) {
      synth.resume();
      state.paused = false;
      updateStatus('speaking', '朗读中 / SPEAKING');
      setPlayIcon('pause');
      els.speakStatus.textContent = '朗读中';
    } else {
      synth.pause();
      state.paused = true;
      updateStatus('paused', '已暂停 / PAUSED');
      setPlayIcon('play');
      els.speakStatus.textContent = '已暂停';
    }
  }

  function stopSpeak() {
    if (state.engine === 'elevenlabs') {
      stopElevenLabs();
      return;
    }
    if (synth) synth.cancel();
    finishSpeak();
  }

  function setPlayIcon(type) {
    if (type === 'pause') {
      els.mainPlayIcon.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
    } else {
      els.mainPlayIcon.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    }
  }

  function updateStatus(ledClass, label) {
    els.statusLed.className = 'status-led ' + ledClass;
    els.statusLabel.textContent = label;
  }

  // ============================================
  // ElevenLabs AI 引擎
  // ============================================
  const EL_BASE = 'https://api.elevenlabs.io/v1';

  async function elFetch(path, options = {}) {
    if (!state.elApiKey) throw new Error('未设置 API Key');
    const res = await fetch(EL_BASE + path, {
      ...options,
      headers: {
        'xi-api-key': state.elApiKey,
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      let msg = 'HTTP ' + res.status;
      try {
        const j = await res.json();
        if (j.detail) msg = typeof j.detail === 'string' ? j.detail : (j.detail.message || JSON.stringify(j.detail));
      } catch (_) {}
      throw new Error(msg);
    }
    return res;
  }

  async function verifyApiKey(key) {
    try {
      const res = await fetch(EL_BASE + '/user', {
        headers: { 'xi-api-key': key },
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      return { ok: true, data };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async function fetchElVoices() {
    try {
      const res = await elFetch('/voices');
      const data = await res.json();
      state.elVoices = data.voices || [];
      populateElVoices();
      return state.elVoices;
    } catch (e) {
      showToast('加载音色失败: ' + e.message, 'error');
      return [];
    }
  }

  function populateElVoices() {
    els.elVoiceSelect.innerHTML = '';
    if (!state.elVoices.length) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = '暂无音色';
      els.elVoiceSelect.appendChild(opt);
      return;
    }
    state.elVoices.forEach((v) => {
      const opt = document.createElement('option');
      opt.value = v.voice_id;
      const labels = v.labels || {};
      const desc = [labels.language, labels.gender, labels.accent].filter(Boolean).join(' · ');
      opt.textContent = v.name + (desc ? ' (' + desc + ')' : '');
      els.elVoiceSelect.appendChild(opt);
    });
    if (state.elSelectedVoiceId) {
      els.elVoiceSelect.value = state.elSelectedVoiceId;
    }
    if (!els.elVoiceSelect.value && state.elVoices.length) {
      els.elVoiceSelect.value = state.elVoices[0].voice_id;
      state.elSelectedVoiceId = state.elVoices[0].voice_id;
    }
  }

  async function cloneVoiceFromRef() {
    const name = els.cloneNameInput.value.trim();
    if (!name) { showToast('请为克隆音色命名', 'error'); return; }
    if (!state.refAudio.src) { showToast('请先在"02 / REF AUDIO"上传参考音频', 'error'); return; }

    els.cloneVoiceBtn.disabled = true;
    els.cloneVoiceBtn.textContent = '克隆中...';
    try {
      // 获取音频文件 blob
      const resp = await fetch(state.refAudio.src);
      const blob = await resp.blob();
      const file = new File([blob], 'sample.mp3', { type: blob.type || 'audio/mpeg' });

      const fd = new FormData();
      fd.append('name', name);
      fd.append('files', file);

      const res = await elFetch('/voices/add', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      showToast('音色克隆成功: ' + (data.name || name), 'success');
      await fetchElVoices();
      if (data.voice_id) {
        els.elVoiceSelect.value = data.voice_id;
        state.elSelectedVoiceId = data.voice_id;
      }
      els.cloneNameInput.value = '';
    } catch (e) {
      showToast('克隆失败: ' + e.message, 'error');
    } finally {
      els.cloneVoiceBtn.disabled = false;
      els.cloneVoiceBtn.textContent = '克隆音色';
    }
  }

  async function speakElevenLabs() {
    const text = state.text.trim();
    if (!text) { showToast('请先输入要朗读的文本', 'error'); return; }
    if (!state.elApiKey) { showToast('请先在设置中验证 API Key', 'error'); openSettings(); return; }
    if (!state.elSelectedVoiceId) { showToast('请选择一个 AI 音色', 'error'); return; }

    stopElevenLabs();

    state.speaking = true;
    state.paused = false;
    updateStatus('speaking', 'AI 朗读中 / AI SPEAKING');
    els.mainPlayBtn.classList.add('speaking');
    setPlayIcon('pause');
    els.stopBtn.disabled = false;
    els.speakStatus.textContent = 'AI 合成中...';
    state.spectrumMode = 'speaking';
    els.spectrumLabel.textContent = 'AI 朗读 / ELEVENLABS';
    startSpectrumLoop();

    state.elAbortCtrl = new AbortController();

    try {
      const voiceSettings = {
        stability: state.elStability,
        similarity_boost: state.elSimilarity,
        style: state.elStyle,
        use_speaker_boost: true,
      };

      const res = await elFetch('/text-to-speech/' + state.elSelectedVoiceId + '?output_format=mp3_44100_128', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: voiceSettings,
        }),
        signal: state.elAbortCtrl.signal,
      });

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (state.elAudioEl) {
        state.elAudioEl.pause();
        URL.revokeObjectURL(state.elAudioEl.src);
      }
      state.elAudioEl = new Audio(audioUrl);
      state.elAudioEl.crossOrigin = 'anonymous';

      state.elAudioEl.oncanplay = () => {
        els.speakStatus.textContent = 'AI 朗读中';
        connectElAnalyser(state.elAudioEl);
        state.elAudioEl.play();
      };

      state.elAudioEl.ontimeupdate = () => {
        const pct = (state.elAudioEl.currentTime / state.elAudioEl.duration) * 100 || 0;
        els.speakProgress.style.width = pct + '%';
        els.speakPosition.textContent = formatTime(state.elAudioEl.currentTime) + ' / ' + formatTime(state.elAudioEl.duration);
      };

      state.elAudioEl.onended = () => {
        finishElSpeak();
        saveToHistory();
      };

      state.elAudioEl.onerror = () => {
        showToast('音频播放失败', 'error');
        finishElSpeak();
      };

    } catch (e) {
      if (e.name === 'AbortError') {
        // 用户主动停止
      } else {
        showToast('AI 合成失败: ' + e.message, 'error');
      }
      finishElSpeak();
    }
  }

  function connectElAnalyser(audioEl) {
    if (!state.audioCtx) {
      state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (state.audioCtx.state === 'suspended') state.audioCtx.resume();
    // 断开旧的
    if (state.analyserSource) {
      try { state.analyserSource.disconnect(); } catch (_) {}
    }
    if (!state.analyser) {
      state.analyser = state.audioCtx.createAnalyser();
      state.analyser.fftSize = 256;
      state.analyser.connect(state.audioCtx.destination);
    }
    try {
      state.analyserSource = state.audioCtx.createMediaElementSource(audioEl);
      state.analyserSource.connect(state.analyser);
    } catch (_) {}
  }

  function togglePlayElevenLabs() {
    if (!state.speaking) {
      speakElevenLabs();
      return;
    }
    if (state.elAudioEl) {
      if (state.elAudioEl.paused) {
        state.elAudioEl.play();
        state.paused = false;
        updateStatus('speaking', 'AI 朗读中 / AI SPEAKING');
        setPlayIcon('pause');
        els.speakStatus.textContent = 'AI 朗读中';
      } else {
        state.elAudioEl.pause();
        state.paused = true;
        updateStatus('paused', '已暂停 / PAUSED');
        setPlayIcon('play');
        els.speakStatus.textContent = '已暂停';
      }
    }
  }

  function stopElevenLabs() {
    if (state.elAbortCtrl) {
      try { state.elAbortCtrl.abort(); } catch (_) {}
      state.elAbortCtrl = null;
    }
    if (state.elAudioEl) {
      state.elAudioEl.pause();
      URL.revokeObjectURL(state.elAudioEl.src);
      state.elAudioEl = null;
    }
    if (state.speaking) finishElSpeak();
  }

  function finishElSpeak() {
    state.speaking = false;
    state.paused = false;
    updateStatus('idle', '待机 / IDLE');
    els.mainPlayBtn.classList.remove('speaking');
    setPlayIcon('play');
    els.stopBtn.disabled = true;
    els.speakStatus.textContent = '就绪';
    els.speakProgress.style.width = '0%';
    els.speakPosition.textContent = '0 / 0';
    state.spectrumMode = 'idle';
    els.spectrumLabel.textContent = '实时频谱 / LIVE';
    state.elAbortCtrl = null;
    setTimeout(() => { if (!state.speaking && !state.refPlaying) stopSpectrumLoop(); }, 600);
  }

  // ---------- 音频上传与播放 ----------
  function handleAudioFile(file) {
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      showToast('请选择音频文件', 'error');
      return;
    }
    const url = URL.createObjectURL(file);
    els.refAudio.src = url;
    state.refAudioFile = file;
    els.audioName.textContent = file.name;
    els.audioSize.textContent = formatSize(file.size);

    els.refAudio.onloadedmetadata = () => {
      els.audioDuration.textContent = formatTime(els.refAudio.duration);
      decodeForWaveform(file);
    };

    els.dropzoneEmpty.classList.add('hidden');
    els.dropzoneFilled.classList.remove('hidden');
    els.removeAudioBtn.classList.remove('hidden');
    // 启用克隆按钮（若已验证 Key）
    updateCloneBtnState();
    showToast('参考音频已加载', 'success');
  }

  async function decodeForWaveform(file) {
    try {
      if (!state.audioCtx) {
        state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await state.audioCtx.decodeAudioData(arrayBuffer);
      state.audioBuffer = audioBuffer;
      drawWaveform(audioBuffer);
    } catch (err) {
      console.warn('音频解码失败:', err);
    }
  }

  function drawWaveform(audioBuffer) {
    const canvas = els.waveformCanvas;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const data = audioBuffer.getChannelData(0);
    const samples = 120;
    const block = Math.floor(data.length / samples);
    const barWidth = w / samples;
    const mid = h / 2;

    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.fillRect(0, mid - 0.5, w, 1);

    for (let i = 0; i < samples; i++) {
      let max = 0;
      for (let j = 0; j < block; j++) {
        const v = Math.abs(data[i * block + j] || 0);
        if (v > max) max = v;
      }
      const barH = Math.max(2, max * h * 0.9);
      const x = i * barWidth;
      const grad = ctx.createLinearGradient(0, mid - barH / 2, 0, mid + barH / 2);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.9)');
      grad.addColorStop(0.5, 'rgba(0, 240, 255, 0.5)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0.9)');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, mid - barH / 2, barWidth - 2, barH);
    }
  }

  function toggleRefPlay() {
    const audio = els.refAudio;
    if (audio.paused) {
      if (state.speaking) {
        if (state.engine === 'native') synth.pause();
        else if (state.elAudioEl) state.elAudioEl.pause();
      }
      audio.play();
    } else {
      audio.pause();
    }
  }

  function setupRefAudioEvents() {
    const audio = els.refAudio;
    audio.onplay = () => {
      state.refPlaying = true;
      els.refPlayIcon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
      state.spectrumMode = 'ref';
      els.spectrumLabel.textContent = '参考音频 / REF AUDIO';
      connectRefAnalyser(audio);
      startSpectrumLoop();
    };
    audio.onpause = () => {
      state.refPlaying = false;
      els.refPlayIcon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
      if (!state.speaking) {
        state.spectrumMode = 'idle';
        els.spectrumLabel.textContent = '实时频谱 / LIVE';
        setTimeout(() => { if (!state.speaking && !state.refPlaying) stopSpectrumLoop(); }, 600);
      }
    };
    audio.ontimeupdate = () => {
      const pct = (audio.currentTime / audio.duration) * 100 || 0;
      els.refProgressFill.style.width = pct + '%';
      els.refTime.textContent = formatTime(audio.currentTime);
    };
    audio.onended = () => {
      els.refProgressFill.style.width = '0%';
      els.refTime.textContent = '0:00';
    };
  }

  function connectRefAnalyser(audioEl) {
    if (!state.audioCtx) {
      state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (state.audioCtx.state === 'suspended') state.audioCtx.resume();
    if (!state.analyser) {
      state.analyser = state.audioCtx.createAnalyser();
      state.analyser.fftSize = 256;
    }
    if (!state.refAnalyserSource) {
      try {
        state.refAnalyserSource = state.audioCtx.createMediaElementSource(audioEl);
        state.refAnalyserSource.connect(state.analyser);
        state.analyser.connect(state.audioCtx.destination);
      } catch (_) {}
    }
  }

  function removeAudio() {
    els.refAudio.pause();
    els.refAudio.removeAttribute('src');
    els.refAudio.load();
    state.audioBuffer = null;
    state.refAudioFile = null;
    state.refAnalyserSource = null;
    els.dropzoneEmpty.classList.remove('hidden');
    els.dropzoneFilled.classList.add('hidden');
    els.removeAudioBtn.classList.add('hidden');
    els.refProgressFill.style.width = '0%';
    els.refTime.textContent = '0:00';
    updateCloneBtnState();
  }

  // ---------- 频谱可视化 ----------
  let spectrumRAF = null;
  let idlePhase = 0;

  function startSpectrumLoop() {
    if (spectrumRAF) return;
    const loop = () => {
      drawSpectrum();
      spectrumRAF = requestAnimationFrame(loop);
    };
    loop();
  }

  function stopSpectrumLoop() {
    if (spectrumRAF) {
      cancelAnimationFrame(spectrumRAF);
      spectrumRAF = null;
    }
    drawSpectrum();
  }

  function drawSpectrum() {
    const canvas = els.spectrumCanvas;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const barCount = 64;
    const gap = 2;
    const barWidth = (w - gap * (barCount - 1)) / barCount;
    let data;

    if ((state.spectrumMode === 'ref' || (state.spectrumMode === 'speaking' && state.engine === 'elevenlabs' && state.elAudioEl && !state.elAudioEl.paused)) && state.analyser) {
      data = new Uint8Array(state.analyser.frequencyBinCount);
      state.analyser.getByteFrequencyData(data);
    } else if (state.spectrumMode === 'speaking') {
      data = generatePseudoSpectrum(barCount);
    } else {
      data = generateIdleSpectrum(barCount);
    }

    const isRef = state.spectrumMode === 'ref';
    for (let i = 0; i < barCount; i++) {
      const v = data[i] / 255;
      const barH = Math.max(2, v * h * 0.92);
      const x = i * (barWidth + gap);
      const y = h - barH;

      const grad = ctx.createLinearGradient(0, y, 0, h);
      if (isRef) {
        grad.addColorStop(0, 'rgba(255, 157, 77, 1)');
        grad.addColorStop(0.6, 'rgba(255, 157, 77, 0.6)');
        grad.addColorStop(1, 'rgba(184, 109, 46, 0.2)');
      } else if (state.spectrumMode === 'speaking') {
        grad.addColorStop(0, 'rgba(0, 240, 255, 1)');
        grad.addColorStop(0.6, 'rgba(0, 240, 255, 0.6)');
        grad.addColorStop(1, 'rgba(0, 168, 184, 0.2)');
      } else {
        grad.addColorStop(0, 'rgba(138, 138, 152, 0.6)');
        grad.addColorStop(1, 'rgba(90, 90, 104, 0.1)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barWidth, barH);

      if (v > 0.1) {
        ctx.fillStyle = isRef ? 'rgba(255, 200, 150, 0.9)' : 'rgba(180, 255, 255, 0.9)';
        ctx.fillRect(x, y, barWidth, 1.5);
      }
    }
  }

  function generatePseudoSpectrum(count) {
    const t = performance.now() / 1000;
    const arr = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      const freq = i / count;
      const base = Math.exp(-freq * 2.5) * 200;
      const wave = Math.sin(t * 4 + i * 0.3) * 30 + Math.sin(t * 7 + i * 0.5) * 20;
      const noise = Math.random() * 40;
      arr[i] = Math.max(0, Math.min(255, base + wave + noise));
    }
    return arr;
  }

  function generateIdleSpectrum(count) {
    idlePhase += 0.015;
    const arr = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      const v = Math.sin(idlePhase + i * 0.2) * 15 + 20;
      arr[i] = Math.max(0, v);
    }
    return arr;
  }

  // ---------- 旋钮控件 ----------
  function initKnob(el) {
    const min = parseFloat(el.dataset.min);
    const max = parseFloat(el.dataset.max);
    const step = parseFloat(el.dataset.step);
    const param = el.dataset.param;
    let value = parseFloat(el.dataset.value);
    const arc = $('arc-' + param);
    const ptr = $('ptr-' + param);
    const valEl = $('val-' + param);

    function render() {
      const pct = (value - min) / (max - min);
      const angle = -135 + pct * 270;
      ptr.style.transform = 'translate(-50%, -100%) rotate(' + angle + 'deg)';
      const deg = pct * 270;
      arc.style.background = 'conic-gradient(from 225deg, var(--accent) 0deg, var(--accent) ' + deg + 'deg, transparent ' + deg + 'deg, transparent 270deg)';
      valEl.textContent = value.toFixed(2);
      state[param] = value;
    }

    let dragging = false;
    let lastY = 0;
    el.addEventListener('pointerdown', (e) => { dragging = true; lastY = e.clientY; el.setPointerCapture(e.pointerId); e.preventDefault(); });
    el.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dy = e.clientY - lastY; lastY = e.clientY;
      const range = max - min;
      value = Math.max(min, Math.min(max, value - dy * range * 0.005));
      value = Math.round(value / step) * step;
      render();
    });
    el.addEventListener('pointerup', (e) => { dragging = false; try { el.releasePointerCapture(e.pointerId); } catch (_) {} });
    el.addEventListener('pointercancel', () => { dragging = false; });
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      value = Math.max(min, Math.min(max, value + (e.deltaY > 0 ? 1 : -1) * step * 2));
      value = Math.round(value / step) * step;
      render();
    }, { passive: false });
    el.addEventListener('dblclick', () => { value = parseFloat(el.dataset.value); render(); });
    render();
  }

  function setKnobValue(param, value) {
    const el = document.querySelector('.knob[data-param="' + param + '"]');
    if (!el) return;
    el.dataset.value = value;
    const min = parseFloat(el.dataset.min);
    const max = parseFloat(el.dataset.max);
    const step = parseFloat(el.dataset.step);
    const arc = $('arc-' + param);
    const ptr = $('ptr-' + param);
    const valEl = $('val-' + param);
    const pct = (value - min) / (max - min);
    ptr.style.transform = 'translate(-50%, -100%) rotate(' + (-135 + pct * 270) + 'deg)';
    const deg = pct * 270;
    arc.style.background = 'conic-gradient(from 225deg, var(--accent) 0deg, var(--accent) ' + deg + 'deg, transparent ' + deg + 'deg, transparent 270deg)';
    valEl.textContent = value.toFixed(2);
    state[param] = value;
  }

  // ---------- 历史记录 ----------
  function getHistory() {
    try { return JSON.parse(localStorage.getItem(KEYS.history) || '[]'); } catch (_) { return []; }
  }
  function saveHistoryList(list) {
    try { localStorage.setItem(KEYS.history, JSON.stringify(list)); } catch (_) {}
  }

  function saveToHistory() {
    const text = state.text.trim();
    if (!text) return;
    const item = {
      id: uuid(),
      text: text.slice(0, 500),
      engine: state.engine,
      voiceName: state.engine === 'elevenlabs'
        ? (state.elVoices.find(v => v.voice_id === state.elSelectedVoiceId) || {}).name || 'AI 音色'
        : (state.selectedVoice ? state.selectedVoice.name : '默认'),
      rate: state.rate,
      pitch: state.pitch,
      volume: state.volume,
      emotion: state.emotion,
      timestamp: Date.now(),
    };
    const list = getHistory();
    list.unshift(item);
    if (list.length > 30) list.length = 30;
    saveHistoryList(list);
    renderHistory();
  }

  function renderHistory() {
    const list = getHistory();
    if (!list.length) {
      els.historyEmpty.classList.remove('hidden');
      els.historyList.innerHTML = '';
      els.historyList.appendChild(els.historyEmpty);
      return;
    }
    els.historyEmpty.classList.add('hidden');
    els.historyList.innerHTML = '';

    list.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'history-card';

      const text = document.createElement('div');
      text.className = 'history-card-text';
      text.textContent = item.text;
      card.appendChild(text);

      const tags = document.createElement('div');
      tags.className = 'history-card-tags';
      const engineTag = document.createElement('span');
      engineTag.className = 'history-tag' + (item.engine === 'elevenlabs' ? ' accent' : '');
      engineTag.textContent = item.engine === 'elevenlabs' ? 'AI' : '原生';
      tags.appendChild(engineTag);
      const voiceTag = document.createElement('span');
      voiceTag.className = 'history-tag accent';
      voiceTag.textContent = (item.voiceName || '').slice(0, 18);
      tags.appendChild(voiceTag);
      if (item.emotion && item.emotion !== 'neutral') {
        const emoTag = document.createElement('span');
        emoTag.className = 'history-tag';
        emoTag.textContent = item.emotion;
        tags.appendChild(emoTag);
      }
      const rateTag = document.createElement('span');
      rateTag.className = 'history-tag';
      rateTag.textContent = 'R ' + (item.rate || 1).toFixed(2);
      tags.appendChild(rateTag);
      card.appendChild(tags);

      const foot = document.createElement('div');
      foot.className = 'history-card-foot';
      const time = document.createElement('span');
      time.textContent = formatHistoryTime(item.timestamp);
      foot.appendChild(time);
      const reload = document.createElement('button');
      reload.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg> 重载';
      reload.onclick = (e) => { e.stopPropagation(); reloadHistoryItem(item); };
      foot.appendChild(reload);
      card.appendChild(foot);

      card.onclick = () => reloadHistoryItem(item);
      els.historyList.appendChild(card);
    });
  }

  function formatHistoryTime(ts) {
    const diff = Date.now() - ts;
    const min = Math.floor(diff / 60000);
    if (min < 1) return '刚刚';
    if (min < 60) return min + ' 分钟前';
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + ' 小时前';
    const d = new Date(ts);
    return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  function reloadHistoryItem(item) {
    els.textInput.value = item.text;
    state.text = item.text;
    updateCharCount();
    if (item.emotion && els.emotionSelect) els.emotionSelect.value = item.emotion;
    state.emotion = item.emotion || 'neutral';
    setKnobValue('rate', item.rate || 1);
    setKnobValue('pitch', item.pitch || 1);
    setKnobValue('volume', item.volume || 1);
    if (item.engine === 'elevenlabs' && state.elVoices.length) {
      const v = state.elVoices.find(vv => vv.name === item.voiceName);
      if (v) { els.elVoiceSelect.value = v.voice_id; state.elSelectedVoiceId = v.voice_id; }
    } else {
      const idx = state.voices.findIndex((v) => v.name === item.voiceName);
      if (idx >= 0) { els.voiceSelect.value = idx; state.selectedVoice = state.voices[idx]; }
    }
    showToast('已重载历史参数', 'success');
    els.textInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function clearHistory() {
    if (!getHistory().length) { showToast('暂无历史记录'); return; }
    saveHistoryList([]);
    renderHistory();
    showToast('历史记录已清空', 'success');
  }

  // ---------- 文本输入 ----------
  function updateCharCount() {
    const len = state.text.length;
    els.charCount.textContent = len;
    const est = len / (4 * state.rate);
    els.estDuration.textContent = formatTime(est);
  }

  // ---------- 引擎切换 ----------
  function switchEngine(engine) {
    state.engine = engine;
    document.querySelectorAll('.engine-opt').forEach(b => {
      b.classList.toggle('active', b.dataset.engine === engine);
    });
    if (engine === 'elevenlabs') {
      els.elSection.classList.remove('hidden');
      els.nativeSection.classList.add('hidden');
      els.engineLabel.textContent = 'AI';
      els.engineLabel.style.color = 'var(--accent)';
      els.voiceSelect.disabled = true;
    } else {
      els.elSection.classList.add('hidden');
      els.nativeSection.classList.remove('hidden');
      els.engineLabel.textContent = '原生';
      els.engineLabel.style.color = 'var(--amber)';
      els.voiceSelect.disabled = false;
    }
    saveSettings();
  }

  function updateCloneBtnState() {
    const ready = state.elApiKey && state.refAudio.src;
    els.cloneVoiceBtn.disabled = !ready;
  }

  // ---------- 设置面板 ----------
  function openSettings() {
    els.settingsModal.classList.add('show');
    // 同步当前状态到 UI
    els.apiKeyInput.value = state.elApiKey;
    els.stabilitySlider.value = state.elStability;
    els.stabilityVal.textContent = state.elStability.toFixed(2);
    els.similaritySlider.value = state.elSimilarity;
    els.similarityVal.textContent = state.elSimilarity.toFixed(2);
    els.styleSlider.value = state.elStyle;
    els.styleVal.textContent = state.elStyle.toFixed(2);
    els.smartSegmentToggle.checked = state.smartSegment;
    els.dynamicParamToggle.checked = state.dynamicParam;
    document.querySelectorAll('.engine-opt').forEach(b => {
      b.classList.toggle('active', b.dataset.engine === state.engine);
    });
    if (state.engine === 'elevenlabs') {
      els.elSection.classList.remove('hidden');
      els.nativeSection.classList.add('hidden');
    } else {
      els.elSection.classList.add('hidden');
      els.nativeSection.classList.remove('hidden');
    }
    if (state.elApiKey && !state.elVoices.length) {
      // 自动加载音色
      fetchElVoices();
    }
  }

  function closeSettings() {
    els.settingsModal.classList.remove('show');
  }

  function setupSettingsEvents() {
    els.settingsBtn.addEventListener('click', openSettings);
    els.settingsCloseBtn.addEventListener('click', closeSettings);
    els.settingsModal.addEventListener('click', (e) => {
      if (e.target === els.settingsModal) closeSettings();
    });

    // 引擎切换
    document.querySelectorAll('.engine-opt').forEach(btn => {
      btn.addEventListener('click', () => switchEngine(btn.dataset.engine));
    });

    // 验证 API Key
    els.verifyKeyBtn.addEventListener('click', async () => {
      const key = els.apiKeyInput.value.trim();
      if (!key) { showToast('请输入 API Key', 'error'); return; }
      els.verifyKeyBtn.disabled = true;
      els.verifyKeyBtn.textContent = '验证中...';
      els.keyStatus.textContent = '正在验证...';
      els.keyStatus.className = 'key-status';
      const result = await verifyApiKey(key);
      els.verifyKeyBtn.disabled = false;
      els.verifyKeyBtn.textContent = '验证';
      if (result.ok) {
        state.elApiKey = key;
        els.keyStatus.textContent = '验证成功! 订阅: ' + (result.data.subscription ? result.data.subscription.tier : '未知');
        els.keyStatus.className = 'key-status ok';
        els.elVoiceSelect.disabled = false;
        els.refreshVoicesBtn.disabled = false;
        updateCloneBtnState();
        await fetchElVoices();
        saveSettings();
      } else {
        els.keyStatus.textContent = '验证失败: ' + result.error;
        els.keyStatus.className = 'key-status err';
      }
    });

    // 刷新音色
    els.refreshVoicesBtn.addEventListener('click', async () => {
      els.refreshVoicesBtn.disabled = true;
      els.refreshVoicesBtn.textContent = '加载中...';
      await fetchElVoices();
      els.refreshVoicesBtn.disabled = false;
      els.refreshVoicesBtn.textContent = '刷新';
    });

    // 音色选择
    els.elVoiceSelect.addEventListener('change', (e) => {
      state.elSelectedVoiceId = e.target.value;
      saveSettings();
    });

    // 克隆音色
    els.cloneVoiceBtn.addEventListener('click', cloneVoiceFromRef);

    // 高级参数滑块
    els.stabilitySlider.addEventListener('input', (e) => {
      state.elStability = parseFloat(e.target.value);
      els.stabilityVal.textContent = state.elStability.toFixed(2);
    });
    els.similaritySlider.addEventListener('input', (e) => {
      state.elSimilarity = parseFloat(e.target.value);
      els.similarityVal.textContent = state.elSimilarity.toFixed(2);
    });
    els.styleSlider.addEventListener('input', (e) => {
      state.elStyle = parseFloat(e.target.value);
      els.styleVal.textContent = state.elStyle.toFixed(2);
    });

    // 原生增强开关
    els.smartSegmentToggle.addEventListener('change', (e) => {
      state.smartSegment = e.target.checked;
    });
    els.dynamicParamToggle.addEventListener('change', (e) => {
      state.dynamicParam = e.target.checked;
    });

    // 保存
    els.settingsSaveBtn.addEventListener('click', () => {
      saveSettings();
      closeSettings();
      showToast('设置已保存', 'success');
    });
  }

  // ---------- 事件绑定 ----------
  function bindEvents() {
    els.textInput.addEventListener('input', (e) => {
      state.text = e.target.value;
      updateCharCount();
      els.mainPlayBtn.disabled = !state.text.trim();
    });

    els.clearTextBtn.addEventListener('click', () => {
      els.textInput.value = '';
      state.text = '';
      updateCharCount();
      els.mainPlayBtn.disabled = true;
      els.textInput.focus();
    });

    // 音频上传
    els.dropzone.addEventListener('click', () => {
      if (els.dropzoneFilled.classList.contains('hidden')) els.audioInput.click();
    });
    els.audioInput.addEventListener('change', (e) => {
      if (e.target.files[0]) handleAudioFile(e.target.files[0]);
    });
    els.dropzone.addEventListener('dragover', (e) => { e.preventDefault(); els.dropzone.classList.add('drag-over'); });
    els.dropzone.addEventListener('dragleave', () => els.dropzone.classList.remove('drag-over'));
    els.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      els.dropzone.classList.remove('drag-over');
      if (e.dataTransfer.files[0]) handleAudioFile(e.dataTransfer.files[0]);
    });
    els.removeAudioBtn.addEventListener('click', (e) => { e.stopPropagation(); removeAudio(); });

    els.refPlayBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleRefPlay(); });
    els.refProgressFill.parentElement.addEventListener('click', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      els.refAudio.currentTime = ((e.clientX - rect.left) / rect.width) * els.refAudio.duration;
    });

    // 音色 & 情感
    els.voiceSelect.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value, 10);
      state.selectedVoice = state.voices[idx] || null;
    });
    els.emotionSelect.addEventListener('change', (e) => {
      state.emotion = e.target.value;
      saveSettings();
    });

    // 旋钮
    document.querySelectorAll('.knob').forEach(initKnob);

    // 播放控制
    els.mainPlayBtn.addEventListener('click', togglePlay);
    els.stopBtn.addEventListener('click', stopSpeak);

    // 历史
    els.clearHistoryBtn.addEventListener('click', clearHistory);

    // 设置
    setupSettingsEvents();

    // 窗口大小变化
    window.addEventListener('resize', () => {
      if (state.audioBuffer) drawWaveform(state.audioBuffer);
      drawSpectrum();
    });

    window.addEventListener('beforeunload', () => {
      if (synth) synth.cancel();
    });
  }

  // ---------- 初始化 ----------
  async function init() {
    loadSettings();
    bindEvents();
    setupRefAudioEvents();
    renderHistory();
    startSpectrumLoop();

    // 同步设置到 UI
    els.emotionSelect.value = state.emotion;
    els.engineLabel.textContent = state.engine === 'elevenlabs' ? 'AI' : '原生';
    els.engineLabel.style.color = state.engine === 'elevenlabs' ? 'var(--accent)' : 'var(--amber)';
    if (state.elApiKey) {
      els.apiKeyInput.value = state.elApiKey;
      els.elVoiceSelect.disabled = false;
      els.refreshVoicesBtn.disabled = false;
    }

    // 加载原生音色
    if (synth) {
      const voices = await loadVoices();
      populateVoices(voices);
    } else {
      populateVoices([]);
    }

    // 加载 ElevenLabs 音色（若有 Key）
    if (state.elApiKey) {
      fetchElVoices().then(() => {
        if (state.elSelectedVoiceId) els.elVoiceSelect.value = state.elSelectedVoiceId;
      });
    }

    els.mainPlayBtn.disabled = true;

    // 示例文本
    const sampleText = '欢迎使用语音朗读工作站。\n在左侧输入文本，上传参考音频，调节参数后点击播放即可朗读。\n试试切换到 ElevenLabs AI 引擎，获得更自然有感情的语音！';
    els.textInput.value = sampleText;
    state.text = sampleText;
    updateCharCount();
    els.mainPlayBtn.disabled = false;

    console.log('[VOICE STUDIO] 初始化完成，引擎:', state.engine);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
