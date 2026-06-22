/**
 * KidsEnglish TTS Engine v3
 */
(function() {
  'use strict';

  // Polyfill: closest() for older browsers
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
      var el = this;
      while (el) {
        if (el.matches(s)) return el;
        el = el.parentElement;
      }
      return null;
    };
  }
  if (!Element.prototype.matches) {
    Element.prototype.matches = function(s) {
      var matches = this.parentElement.querySelectorAll(s);
      for (var i = 0; i < matches.length; i++) { if (matches[i] === this) return true; }
      return false;
    };
  }

  // ========== 配置 ==========
  var ttsEnabled = true;
  var currentVoiceType = 'male-young';
  var isHarmony = false;
  var synth = window.speechSynthesis || null;
  var currentUtterance = null;
  var availableVoices = [];
  var voiceMap = {};
  var voicePresets = {
    'male-young':   { pitch: 0.8,  rate: 0.90, volume: 1.0, label: '标准男声',   person: 2, preview: 'Hello! Nice to meet you!' },
    'female-young': { pitch: 1.2,  rate: 0.90, volume: 1.0, label: '标准女声',   person: 0, preview: 'Hello! Nice to meet you!' },
    'male-kid':     { pitch: 1.0,  rate: 1.05, volume: 1.0, label: '男童声',     person: 2, preview: 'Hello! Nice to meet you!' },
    'female-kid':   { pitch: 1.3,  rate: 1.05, volume: 1.0, label: '女童声',     person: 0, preview: 'Hello! Nice to meet you!' }
  };

  // ========== 读取保存的设置 ==========
  try {
    var savedVoice = localStorage.getItem('ke_voice_type');
    if (savedVoice && voicePresets[savedVoice]) currentVoiceType = savedVoice;
    var savedEnabled = localStorage.getItem('ke_tts_enabled');
    if (savedEnabled !== null) ttsEnabled = savedEnabled === 'true';
  } catch(e) {}

  // ========== DOM 元素 ==========
  var ttsToggle = document.getElementById('ttsToggle');
  var ttsIcon = document.getElementById('ttsIcon');
  var ttsLabel = document.getElementById('ttsLabel');
  var ttsNotice = document.getElementById('ttsNotice');
  var ttsNoticeText = document.getElementById('ttsNoticeText');
  var voicePanel = document.getElementById('voicePanel');

  // ========== HarmonyOS JSBridge 检测 ==========
  window.onTtsBridgeReady = function() {
    console.log('[TTS] onTtsBridgeReady called');
    if (typeof window.ttsBridge !== 'undefined' && window.ttsBridge !== null) {
      isHarmony = true;
      console.log('[TTS] HarmonyOS TTS 已激活');
    }
  };

  // 轮询检测 ttsBridge
  var pollCount = 0;
  function pollBridge() {
    if (isHarmony || pollCount >= 15) return;
    pollCount++;
    if (typeof window.ttsBridge !== 'undefined' && window.ttsBridge !== null) {
      isHarmony = true;
      console.log('[TTS] ttsBridge found via polling #' + pollCount);
    } else {
      setTimeout(pollBridge, 200);
    }
  }
  setTimeout(pollBridge, 300);

  // ========== HarmonyOS TTS 调用 ==========
  function harmonySpeak(text, btn, retryCount) {
    retryCount = retryCount || 0;
    try {
      var preset = voicePresets[currentVoiceType] || voicePresets['male-young'];
      var result = window.ttsBridge.speak(text, preset.rate, preset.volume, preset.pitch);
      console.log('[TTS] harmonySpeak result: ' + result);

      if (result && result.indexOf('OK:') === 0) {
        // 成功
        if (btn) {
          btn.classList.add('playing');
          btn.textContent = '\u23F8';
          var duration = Math.max(1500, text.length * 200);
          setTimeout(function() {
            btn.classList.remove('playing');
            btn.textContent = '\u25B6';
          }, duration);
        }
        return true;
      } else if (result && result.indexOf('ENGINE_NOT_READY') !== -1 && retryCount < 5) {
        // 引擎还没准备好，延迟重试
        console.log('[TTS] 引擎未就绪，500ms 后重试 #' + (retryCount + 1));
        setTimeout(function() { harmonySpeak(text, btn, retryCount + 1); }, 500);
        return false;
      } else {
        console.error('[TTS] speak 失败: ' + result);
        if (btn) { btn.classList.remove('playing'); btn.textContent = '\u25B6'; }
        return false;
      }
    } catch(e) {
      console.error('[TTS] harmonySpeak 异常: ' + e);
      if (btn) { btn.classList.remove('playing'); btn.textContent = '\u25B6'; }
      return false;
    }
  }

  function harmonyStop() {
    if (!isHarmony) return;
    try { window.ttsBridge.stop(); } catch(e) {}
  }

  function harmonySwitchAndPreview(voiceType) {
    if (!isHarmony) return;
    try {
      var preset = voicePresets[voiceType] || voicePresets['male-young'];
      var result = window.ttsBridge.switchVoice('en-US', preset.person);
      console.log('[TTS] switchVoice result: ' + result);
      // 切换后延迟播放试听（等引擎重新初始化）
      setTimeout(function() {
        window.ttsBridge.speak(preset.preview, preset.rate, preset.volume, preset.pitch);
      }, 800);
    } catch(e) {
      console.error('[TTS] switchVoice 异常: ' + e);
    }
  }

  // ========== 浏览器 Web Speech API ==========
  function loadVoices() {
    if (!synth) return;
    availableVoices = synth.getVoices();
    buildVoiceMap();
  }

  function buildVoiceMap() {
    if (availableVoices.length === 0) return;
    var pool = availableVoices;
    var maleKw = ['male','david','daniel','james','mark','george','alex','thomas','guy','aaron','fred','sam','oliver','noah','liam','ethan'];
    var femaleKw = ['female','samantha','victoria','karen','moira','tessa','fiona','zira','hazel','susan','alice','ella','jenny','ava','emma','olivia','sophia'];
    function find(prefer, avoid) {
      for (var i = 0; i < pool.length; i++) { if (prefer.some(function(k) { return pool[i].name.toLowerCase().indexOf(k) !== -1; })) return pool[i]; }
      for (var i = 0; i < pool.length; i++) { if (!avoid.some(function(k) { return pool[i].name.toLowerCase().indexOf(k) !== -1; })) return pool[i]; }
      return pool[0];
    }
    var m = find(maleKw, femaleKw);
    var f = find(femaleKw, maleKw);
    if (m === f && pool.length > 1) f = pool[pool.length - 1];
    var kids = pool.filter(function(v) { return v !== m && v !== f; });
    voiceMap['male-young'] = m;
    voiceMap['female-young'] = f;
    voiceMap['male-kid'] = kids.length > 0 ? kids[0] : m;
    voiceMap['female-kid'] = kids.length > 1 ? kids[1] : (kids.length > 0 ? kids[0] : f);
  }

  function browserSpeak(text, btn) {
    if (!synth || !ttsEnabled) return;
    if (availableVoices.length === 0) loadVoices();
    synth.cancel();
    // Chrome bug fix: resume synth if paused
    if (synth.paused) { synth.resume(); }
    if (btn) { btn.classList.add('playing'); btn.textContent = '\u23F8'; }
    var u = new SpeechSynthesisUtterance(text);
    var voice = voiceMap[currentVoiceType] || availableVoices[0] || null;
    if (voice) u.voice = voice;
    u.lang = 'en-US';
    var p = voicePresets[currentVoiceType] || voicePresets['male-young'];
    u.rate = p.rate; u.pitch = p.pitch; u.volume = p.volume;
    u.onend = function() { if (btn) { btn.classList.remove('playing'); btn.textContent = '\u25B6'; } currentUtterance = null; };
    u.onerror = function(e) { console.error('[TTS] error:', e); if (btn) { btn.classList.remove('playing'); btn.textContent = '\u25B6'; } currentUtterance = null; };
    currentUtterance = u;
    // Chrome bug fix: wrap in setTimeout to avoid silent failure on first call
    setTimeout(function() {
      try { synth.speak(u); } catch(e) { if (btn) { btn.classList.remove('playing'); btn.textContent = '\u25B6'; } }
    }, 50);
  }

  function browserPreview(voiceType) {
    if (!synth) return;
    if (availableVoices.length === 0) loadVoices();
    synth.cancel();
    if (synth.paused) { synth.resume(); }
    var p = voicePresets[voiceType] || voicePresets['male-young'];
    var u = new SpeechSynthesisUtterance(p.preview);
    var voice = voiceMap[voiceType] || availableVoices[0] || null;
    if (voice) u.voice = voice;
    u.lang = 'en-US';
    u.rate = p.rate; u.pitch = p.pitch; u.volume = p.volume;
    setTimeout(function() { try { synth.speak(u); } catch(e) {} }, 50);
  }

  // ========== 统一接口 ==========
  function showNotice(msg) {
    if (ttsNoticeText) ttsNoticeText.textContent = msg;
    if (ttsNotice) ttsNotice.style.display = 'block';
    setTimeout(function() { if (ttsNotice) ttsNotice.style.display = 'none'; }, 5000);
  }

  function stopSpeaking() {
    if (isHarmony) { harmonyStop(); }
    else if (synth) {
      synth.cancel();
      // Chrome bug fix: synth may stay paused after cancel
      if (synth.paused) { try { synth.resume(); } catch(e) {} }
    }
    document.querySelectorAll('.tts-btn.playing, .num-tts-btn.playing, .ke-sentence-tts.playing').forEach(function(b) { b.classList.remove('playing'); b.textContent = '\u25B6'; });
    currentUtterance = null;
  }

  function speak(text, btn) {
    if (!ttsEnabled) return;
    if (isHarmony) { harmonySpeak(text, btn); }
    else { browserSpeak(text, btn); }
  }

  function extractText(el) {
    var en = el.querySelector('.word-en, .sentence-en');
    if (!en) return '';
    return en.textContent.replace(/\s*\/[^/]+\/\s*/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function addTTSButtons() {
    document.querySelectorAll('.word-card, .sentence-card').forEach(function(card) {
      if (card.querySelector('.tts-btn')) return;
      var text = extractText(card);
      if (!text) return;
      var btn = document.createElement('button');
      btn.className = 'tts-btn';
      btn.textContent = '\u25B6';
      btn.setAttribute('aria-label', '\u6717\u8BFB: ' + text);
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (btn.classList.contains('playing')) { stopSpeaking(); }
        else { speak(text, btn); }
      });
      card.appendChild(btn);
    });
  }

  // ========== 初始化 ==========
  function checkSupport() {
    if (typeof window.ttsBridge !== 'undefined' && window.ttsBridge !== null) {
      isHarmony = true;
      console.log('[TTS] ttsBridge 同步检测成功');
    }
    if (synth) {
      loadVoices();
      if (availableVoices.length === 0 && synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = function() { loadVoices(); buildVoiceMap(); };
      }
    }
    // 延迟检查
    setTimeout(function() {
      if (!isHarmony && !synth) {
        showNotice('\u60A8\u7684\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u8BED\u97F3\u6717\u8BFB\u529F\u80FD\u3002');
        if (ttsToggle) ttsToggle.style.display = 'none';
      }
    }, 4000);
  }

  // ========== UI 事件 ==========
  if (ttsToggle) {
    ttsToggle.addEventListener('click', function(e) {
      if (e.target.getAttribute('title') === '\u9009\u62E9\u97F3\u8272') return;
      e.preventDefault();
      ttsEnabled = !ttsEnabled;
      try { localStorage.setItem('ke_tts_enabled', String(ttsEnabled)); } catch(e2) {}
      if (!ttsEnabled) {
        stopSpeaking();
        ttsToggle.classList.add('off');
        if (ttsIcon) ttsIcon.textContent = '\u{1F507}';
        if (ttsLabel) ttsLabel.textContent = '\u8BED\u97F3\u5DF2\u5173\u95ED';
        if (voicePanel) voicePanel.classList.remove('show');
      } else {
        ttsToggle.classList.remove('off');
        if (ttsIcon) ttsIcon.textContent = '\u{1F50A}';
        if (ttsLabel) ttsLabel.textContent = '\u8BED\u97F3\u5DF2\u5F00\u542F';
      }
    });
  }

  if (voicePanel) {
    voicePanel.addEventListener('click', function(e) {
      // 试听按钮
      var previewBtn = e.target.closest('.voice-preview');
      if (previewBtn) {
        e.stopPropagation();
        var vt = previewBtn.getAttribute('data-preview');
        // 视觉反馈
        previewBtn.classList.add('playing');
        previewBtn.textContent = '\u23F8';
        var preset = voicePresets[vt] || voicePresets['male-young'];
        var dur = Math.max(2000, preset.preview.length * 200);
        setTimeout(function() { previewBtn.classList.remove('playing'); previewBtn.textContent = '\u25B6'; }, dur);

        if (isHarmony) {
          try { window.ttsBridge.speak(preset.preview, preset.rate, preset.volume, preset.pitch); } catch(ex) {}
        } else {
          browserPreview(vt);
        }
        return;
      }

      // 选择音色
      var option = e.target.closest('.voice-option');
      if (option) {
        var voiceType = option.getAttribute('data-voice');
        currentVoiceType = voiceType;
        try { localStorage.setItem('ke_voice_type', voiceType); } catch(e2) {}

        // 更新选中状态
        document.querySelectorAll('.voice-option').forEach(function(o) { o.classList.remove('active'); });
        option.classList.add('active');

        // 切换音色并播放试听
        if (isHarmony) {
          harmonySwitchAndPreview(voiceType);
        } else {
          browserPreview(voiceType);
        }
      }
    });
  }

  document.addEventListener('click', function(e) {
    if (!e.target.closest('#voicePanel') && !e.target.closest('#ttsToggle')) {
      if (voicePanel) voicePanel.classList.remove('show');
    }
    var numRow = e.target.closest('.num-row');
    if (numRow && ttsEnabled) {
      var text = numRow.getAttribute('data-text') || '';
      if (text) {
        var btn = numRow.querySelector('.num-tts-btn');
        if (btn && btn.classList.contains('playing')) { stopSpeaking(); }
        else {
          document.querySelectorAll('.num-tts-btn.playing').forEach(function(b) { b.classList.remove('playing'); b.textContent = '\u25B6'; });
          if (btn) { btn.classList.add('playing'); btn.textContent = '\u23F8'; }
          speak(text, btn);
        }
      }
      return;
    }
    if (!ttsEnabled) return;
    var card = e.target.closest('.word-card, .sentence-card');
    if (!card) return;
    if (e.target.closest('.tts-btn')) return;
    var text = extractText(card);
    var cardBtn = card.querySelector('.tts-btn');
    if (text && cardBtn) {
      cardBtn.classList.add('playing');
      cardBtn.textContent = '\u23F8';
      speak(text, cardBtn);
    }
  });

  function initUIState() {
    document.querySelectorAll('.voice-option').forEach(function(o) {
      if (o.getAttribute('data-voice') === currentVoiceType) o.classList.add('active');
      else o.classList.remove('active');
    });
    if (!ttsEnabled) {
      if (ttsToggle) ttsToggle.classList.add('off');
      if (ttsIcon) ttsIcon.textContent = '\u{1F507}';
      if (ttsLabel) ttsLabel.textContent = '\u8BED\u97F3\u5DF2\u5173\u95ED';
    } else {
      if (ttsToggle) ttsToggle.classList.remove('off');
      if (ttsIcon) ttsIcon.textContent = '\u{1F50A}';
      if (ttsLabel) ttsLabel.textContent = '\u8BED\u97F3\u5DF2\u5F00\u542F';
    }
  }

  // ========== 日志 ==========
  function keLog(msg) {
    var line = '[KE] ' + msg;
    console.log(line);
    try {
      var logs = JSON.parse(localStorage.getItem('ke_logs') || '[]');
      logs.push({t: new Date().toISOString(), m: msg});
      if (logs.length > 200) logs = logs.slice(-200);
      localStorage.setItem('ke_logs', JSON.stringify(logs));
    } catch(e) {}
  }

  function keLogError(fn, e) {
    keLog('ERROR in ' + fn + ': ' + (e && e.message ? e.message : String(e)));
    console.error('[KE] ERROR in ' + fn + ':', e);
  }

  // ========== 启动 ==========
  function boot() {
    keLog('=== boot start ===');
    keLog('url=' + location.href);
    keLog('ttsBridge=' + (typeof window.ttsBridge));
    // 加载音标缓存
    try {
      loadIPACache();
      keLog('loadIPACache OK');
    } catch(e) { keLogError('loadIPACache', e); }
    try {
      addTTSButtons();
      keLog('addTTSButtons OK');
    } catch(e) { keLogError('addTTSButtons', e); }
    try {
      checkSupport();
      keLog('checkSupport OK');
    } catch(e) { keLogError('checkSupport', e); }
    try {
      initUIState();
      keLog('initUIState OK');
    } catch(e) { keLogError('initUIState', e); }
    try {
      initCollapsibleSections();
      keLog('initCollapsibleSections OK');
    } catch(e) { keLogError('initCollapsibleSections', e); }
    try {
      initSectionCollapse();
      keLog('initSectionCollapse OK');
    } catch(e) { keLogError('initSectionCollapse', e); }
    try {
      initImageReplace();
      keLog('initImageReplace OK');
    } catch(e) { keLogError('initImageReplace', e); }
    try {
      initAddCard();
      keLog('initAddCard OK');
    } catch(e) { keLogError('initAddCard', e); }
    try {
      initCustomSentences();
      keLog('initCustomSentences OK');
    } catch(e) { keLogError('initCustomSentences', e); }
    keLog('=== boot end ===');
  }

  // ========== 折叠/展开子分类 ==========
  function initCollapsibleSections() {
    // 注入折叠样式
    var style = document.createElement('style');
    style.textContent = '.sub-title{cursor:pointer;user-select:none;-webkit-user-select:none;position:relative;padding-right:30px!important;transition:background 0.15s}.sub-title:hover{background:rgba(255,107,74,0.06);border-radius:4px}.sub-title::after{content:"\\25B6";position:absolute;right:6px;top:50%;transform:translateY(-50%);font-size:0.7rem;color:var(--muted);transition:transform 0.25s ease}.sub-title.collapsed::after{transform:translateY(-50%) rotate(-90deg)}';
    document.head.appendChild(style);

    // 为每个 sub-title 添加折叠功能
    document.querySelectorAll('.sub-title').forEach(function(title) {
      var nextEl = title.nextElementSibling;
      if (!nextEl || (!nextEl.classList.contains('word-grid') && !nextEl.classList.contains('sentence-list'))) return;

      title.addEventListener('click', function(e) {
        e.stopPropagation();
        title.classList.toggle('collapsed');
        var sibling = title.nextElementSibling;
        while (sibling && (sibling.classList.contains('word-grid') || sibling.classList.contains('sentence-list'))) {
          if (title.classList.contains('collapsed')) {
            sibling.style.display = 'none';
          } else {
            sibling.style.display = '';
          }
          sibling = sibling.nextElementSibling;
        }
      });
    });
  }

  // ========== 大标题一键折叠/展开（控制所有小标题） ==========
  function initSectionCollapse() {
    keLog('initSectionCollapse start');
    var style = document.createElement('style');
    style.textContent = '.section-header{position:relative;padding-right:36px!important}.section-toggle-btn{position:absolute;right:4px;top:50%;transform:translateY(-50%);width:28px;height:28px;border-radius:8px;border:1px solid var(--rule);background:#fff;color:var(--muted);font-size:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;z-index:2}.section-toggle-btn:hover{background:var(--accent);color:#fff;border-color:var(--accent)}';
    document.head.appendChild(style);
    keLog('initSectionCollapse style injected');

    var sections = document.querySelectorAll('.section');
    keLog('initSectionCollapse found ' + sections.length + ' .section elements');
    sections.forEach(function(sec) {
      var header = sec.querySelector('.section-header');
      if (!header) {
        keLog('initSectionCollapse: section missing .section-header');
        return;
      }

      var btn = document.createElement('button');
      btn.className = 'section-toggle-btn';
      btn.innerHTML = '&#x25BC;';
      btn.title = '一键折叠/展开所有小项';
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        // 获取当前section下所有sub-title
        var subTitles = sec.querySelectorAll('.sub-title');
        if (subTitles.length === 0) return;
        // 判断当前状态：如果所有都已折叠，则展开；否则全部折叠
        var allCollapsed = true;
        subTitles.forEach(function(st) {
          if (!st.classList.contains('collapsed')) allCollapsed = false;
        });
        // 切换所有小标题状态
        subTitles.forEach(function(st) {
          if (allCollapsed) {
            // 当前全部折叠，需要展开
            st.classList.remove('collapsed');
            var sibling = st.nextElementSibling;
            while (sibling && (sibling.classList.contains('word-grid') || sibling.classList.contains('sentence-list'))) {
              sibling.style.display = '';
              sibling = sibling.nextElementSibling;
            }
          } else {
            // 当前有展开的，全部折叠
            st.classList.add('collapsed');
            var sibling = st.nextElementSibling;
            while (sibling && (sibling.classList.contains('word-grid') || sibling.classList.contains('sentence-list'))) {
              sibling.style.display = 'none';
              sibling = sibling.nextElementSibling;
            }
          }
        });
        // 更新按钮图标
        btn.innerHTML = allCollapsed ? '&#x25BC;' : '&#x25B6;';
      });
      header.appendChild(btn);
    });
    keLog('initSectionCollapse end');
  }

  // ========== 手动添加卡片功能 ==========
  function initAddCard() {
    keLog('initAddCard start');
    var style = document.createElement('style');
    var css = '';
    css += '.add-card-btn{position:absolute;bottom:4px;left:4px;width:22px;height:22px;border-radius:50%;border:none;background:rgba(255,255,255,0.85);color:var(--accent);font-size:14px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:all 0.2s;z-index:3;box-shadow:0 1px 3px rgba(0,0,0,0.1)}';
    css += '.word-card:hover .add-card-btn{opacity:0.8}';
    css += '.add-card-btn:hover{opacity:1;background:var(--accent);color:#fff;transform:scale(1.1)}';
    css += '.add-card-modal{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:2000;display:none;align-items:center;justify-content:center;padding:20px}';
    css += '.add-card-modal.show{display:flex}';
    css += '.add-card-box{background:#fff;border-radius:16px;padding:24px;max-width:360px;width:100%;box-shadow:0 10px 40px rgba(0,0,0,0.2)}';
    css += '.add-card-box h3{margin:0 0 16px;font-size:1.1rem;color:var(--ink)}';
    css += '.add-card-field{margin-bottom:14px}';
    css += '.add-card-field label{display:block;font-size:0.85rem;color:var(--muted);margin-bottom:4px;font-weight:600}';
    css += '.add-card-field input,.add-card-field textarea{width:100%;padding:10px 12px;border:1px solid var(--rule);border-radius:10px;font-family:var(--font);font-size:0.9rem;color:var(--ink);outline:none}';
    css += '.add-card-field input:focus,.add-card-field textarea:focus{border-color:var(--accent)}';
    css += '.add-card-img-preview{width:60px;height:60px;border-radius:10px;object-fit:cover;border:2px dashed var(--rule);display:none;margin-top:6px}';
    css += '.add-card-img-preview.show{display:block}';
    css += '.add-card-actions{display:flex;gap:10px;margin-top:20px}';
    css += '.add-card-actions button{flex:1;padding:10px;border-radius:10px;border:none;font-family:var(--font);font-size:0.9rem;font-weight:600;cursor:pointer;transition:all 0.15s}';
    css += '.add-card-actions .btn-primary{background:var(--accent);color:#fff}';
    css += '.add-card-actions .btn-primary:hover{background:#e55a3a}';
    css += '.add-card-actions .btn-secondary{background:var(--bg2);color:var(--ink)}';
    css += '.add-card-actions .btn-secondary:hover{background:var(--rule)}';
    css += '.add-card-file{display:none}';
    css += '.custom-word-card .word-en{font-size:0.85rem!important}';
    css += '.custom-word-card .word-ipa{font-size:0.65rem!important;color:var(--accent)!important;font-weight:600!important}';
    css += '.card-delete-btn{position:absolute;top:4px;left:4px;width:28px;height:16px;border-radius:4px;border:none;background:rgba(231,76,60,0.85);color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:all 0.2s;z-index:5;box-shadow:0 1px 3px rgba(0,0,0,0.15);letter-spacing:0.5px}';
    css += '.word-card:hover .card-delete-btn{opacity:1}';
    css += '.card-delete-btn:hover{background:#c0392b;transform:scale(1.05)}';
    style.textContent = css;
    document.head.appendChild(style);
    keLog('initAddCard style injected');

    // 创建添加卡片模态框
    var modal = document.createElement('div');
    modal.className = 'add-card-modal';
    modal.id = 'addCardModal';
    modal.innerHTML = '<div class="add-card-box"><h3>&#x2795; 添加新单词</h3><div class="add-card-field"><label>英文单词</label><input type="text" id="acWord" placeholder="如: elephant"></div><div class="add-card-field"><label>中文释义</label><input type="text" id="acCn" placeholder="如: 大象"></div><div class="add-card-field"><label>图片（可选）</label><input type="file" id="acFile" class="add-card-file" accept="image/*"><button class="btn-secondary" style="width:100%;padding:10px;border-radius:10px;margin-top:4px;" onclick="document.getElementById(\'acFile\').click()">&#x1F4F7; 选择图片</button><img id="acPreview" class="add-card-img-preview"></div><div class="add-card-actions"><button class="btn-secondary" onclick="closeAddCard()">取消</button><button class="btn-primary" onclick="confirmAddCard()">添加</button></div></div>';
    document.body.appendChild(modal);
    keLog('initAddCard modal created');

    var currentGrid = null;
    var previewData = null;

    // 为每个 word-grid 添加「添加卡片」按钮
    var grids = document.querySelectorAll('.word-grid');
    keLog('initAddCard found ' + grids.length + ' .word-grid elements');
    grids.forEach(function(grid) {
      // 避免重复添加
      if (grid.querySelector('.add-card-placeholder')) {
        keLog('initAddCard: grid already has placeholder, skipping');
        return;
      }

      var addBtn = document.createElement('div');
      addBtn.className = 'add-card-placeholder';
      addBtn.style.cssText = 'border:2px dashed var(--accent);background:var(--bg2);border-radius:12px;padding:0.6rem 0.8rem;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;min-height:100px;gap:4px;transition:all 0.2s';
      addBtn.innerHTML = '<span style="font-size:2rem;color:var(--accent)">&#x2795;</span><span style="font-size:0.75rem;color:var(--muted);font-weight:600">添加单词</span>';
      addBtn.title = '添加新单词';
      addBtn.addEventListener('mouseenter', function() {
        addBtn.style.background = 'rgba(255,107,74,0.08)';
        addBtn.style.borderColor = 'var(--accent)';
        addBtn.style.transform = 'translateY(-2px)';
      });
      addBtn.addEventListener('mouseleave', function() {
        addBtn.style.background = 'var(--bg2)';
        addBtn.style.borderColor = 'var(--accent)';
        addBtn.style.transform = '';
      });
      addBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        currentGrid = grid;
        previewData = null;
        document.getElementById('acWord').value = '';
        document.getElementById('acCn').value = '';
        document.getElementById('acPreview').classList.remove('show');
        document.getElementById('acFile').value = '';
        modal.classList.add('show');
      });
      grid.appendChild(addBtn);
    });
    keLog('initAddCard end');

    // 图片预览
    document.getElementById('acFile').addEventListener('change', function(e) {
      if (!e.target.files || e.target.files.length === 0) return;
      var file = e.target.files[0];
      if (!file.type.startsWith('image/')) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        previewData = ev.target.result;
        var preview = document.getElementById('acPreview');
        preview.src = previewData;
        preview.classList.add('show');
      };
      reader.readAsDataURL(file);
    });

    // 关闭模态框
    window.closeAddCard = function() {
      modal.classList.remove('show');
      currentGrid = null;
      previewData = null;
    };

    // 获取存储key（使用页面名+grid索引，精确到每个word-grid）
    function getStorageKey(grid) {
      var pageId = location.pathname.split('/').pop().replace('.html', '') || 'unknown';
      var allGrids = document.querySelectorAll('.word-grid');
      var gridIdx = 0;
      for (var i = 0; i < allGrids.length; i++) {
        if (allGrids[i] === grid) {
          gridIdx = i;
          break;
        }
      }
      var key = 'ke_custom_' + pageId + '_g' + gridIdx;
      keLog('getStorageKey: pageId=' + pageId + ', gridIndex=' + gridIdx + ' -> ' + key);
      return key;
    }

    // 压缩图片为小尺寸 Base64（最大 80x80，质量 0.6）
    function compressImage(dataUrl) {
      return new Promise(function(resolve) {
        var img = new Image();
        img.onload = function() {
          var canvas = document.createElement('canvas');
          var maxW = 80, maxH = 80;
          var w = img.width, h = img.height;
          if (w > maxW || h > maxH) {
            if (w > h) { h = Math.round(h * maxW / w); w = maxW; }
            else { w = Math.round(w * maxH / h); h = maxH; }
          }
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          var compressed = canvas.toDataURL('image/jpeg', 0.6);
          keLog('compressImage: original=' + dataUrl.length + ' -> compressed=' + compressed.length);
          resolve(compressed);
        };
        img.onerror = function() { resolve(null); };
        img.src = dataUrl;
      });
    }

  // HTML 转义（防止 XSS）
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // 确认添加
    window.confirmAddCard = async function() {
      var word = document.getElementById('acWord').value.trim();
      var cn = document.getElementById('acCn').value.trim();
      if (!word) { alert('请输入英文单词'); return; }
      if (!cn) { alert('请输入中文释义'); return; }
      if (!currentGrid) { alert('请先选择要添加的位置'); return; }

      keLog('confirmAddCard: word=' + word + ', cn=' + cn + ', currentGrid=' + (currentGrid ? 'yes' : 'null'));

      // 查询音标（混合方案：本地缓存 -> API -> 规则引擎）
      var ipa = await queryIPA(word);
      keLog('confirmAddCard: ipa=' + ipa);

      // 获取存储key
      var storageKey = getStorageKey(currentGrid);
      keLog('confirmAddCard: storageKey=' + storageKey);

      // 压缩图片（如有）
      var compressedImg = null;
      if (previewData) {
        compressedImg = await compressImage(previewData);
        keLog('confirmAddCard: compressedImg=' + (compressedImg ? compressedImg.length + ' chars' : 'null'));
      }

      // 创建卡片数据对象
      var cardData = {
        word: word,
        cn: cn,
        ipa: ipa,
        img: compressedImg,
        ts: Date.now()
      };

      // 保存到 localStorage
      var saveSuccess = false;
      try {
        var existingRaw = localStorage.getItem(storageKey);
        keLog('confirmAddCard: existingRaw=' + (existingRaw ? existingRaw.substring(0, 50) : 'null'));
        var existing = JSON.parse(existingRaw || '[]');
        existing.push(cardData);
        var jsonStr = JSON.stringify(existing);
        keLog('confirmAddCard: jsonStr length=' + jsonStr.length);
        localStorage.setItem(storageKey, jsonStr);
        keLog('Card saved: ' + word + ' to ' + storageKey);
        // 立即验证
        var verify = localStorage.getItem(storageKey);
        keLog('confirmAddCard: verify saved=' + (verify ? verify.substring(0, 80) : 'null'));
        saveSuccess = true;
      } catch(e) {
        keLog('Card save failed: ' + e);
        alert('保存失败，卡片将在刷新后消失。请清理一些数据后重试。');
      }

      // 创建并插入卡片
      createCustomCard(cardData, currentGrid);

      closeAddCard();
    };

    // 创建自定义卡片（用于新增和恢复）
    function createCustomCard(data, grid) {
      var card = document.createElement('div');
      card.className = 'word-card custom-word-card';
      card.setAttribute('data-video-en', 'This is a ' + data.word + '.');
      card.setAttribute('data-video-cn', '这是' + data.cn + '。');
      card.setAttribute('data-kid', '&#x1F466;');
      card.setAttribute('data-adult', '&#x1F468;');

      // 删除按钮HTML（仅自定义卡片有）
      var deleteBtnHtml = '<button class="card-delete-btn" title="删除此卡片">DEL</button>';

      if (data.img) {
        card.innerHTML = deleteBtnHtml + '<img class="word-card-img show" src="' + data.img + '" alt=""><span class="word-en">' + escapeHtml(data.word) + '</span><span class="word-ipa">/' + escapeHtml(data.ipa) + '/</span><span class="word-cn">' + escapeHtml(data.cn) + '</span>';
      } else {
        card.innerHTML = deleteBtnHtml + '<span class="word-emoji">&#x2B50;</span><span class="word-en">' + escapeHtml(data.word) + '</span><span class="word-ipa">/' + escapeHtml(data.ipa) + '/</span><span class="word-cn">' + escapeHtml(data.cn) + '</span>';
      }

      // 将新卡片插入到「添加按钮」之前
      var placeholder = grid.querySelector('.add-card-placeholder');
      if (placeholder) {
        grid.insertBefore(card, placeholder);
      } else {
        grid.appendChild(card);
      }

      // 为新卡片添加事件监听（视频播放）
      card.addEventListener('click', function(e) {
        if (e.target.closest('.tts-btn') || e.target.closest('.img-replace-btn') || e.target.closest('.img-reset-btn') || e.target.closest('.card-delete-btn')) return;
        if (typeof openVideo === 'function') { openVideo(card); }
      });

      // 为新卡片添加 TTS 按钮
      addTTSToCard(card);

      // 为新卡片添加图片替换按钮
      addImageReplaceToCard(card);

      // 为删除按钮添加事件
      var deleteBtn = card.querySelector('.card-delete-btn');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          if (confirm('确定要删除这个单词卡片吗？')) {
            // 从 localStorage 移除
            removeCustomCard(data, grid);
            card.remove();
          }
        });
      }
    }

    // 从 localStorage 移除卡片
    function removeCustomCard(data, grid) {
      try {
        var storageKey = getStorageKey(grid);
        var existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        var filtered = existing.filter(function(item) {
          return !(item.word === data.word && item.cn === data.cn && item.ts === data.ts);
        });
        localStorage.setItem(storageKey, JSON.stringify(filtered));
        keLog('Card removed: ' + data.word + ' from ' + storageKey);
      } catch(e) {
        keLog('Card remove failed: ' + e);
      }
    }

    // 页面加载时恢复自定义卡片
    function restoreCustomCards() {
      keLog('=== restoreCustomCards START ===');
      var pageId = location.pathname.split('/').pop().replace('.html', '');
      keLog('restoreCustomCards: pageId=' + pageId);
      
      // 迁移旧数据：清除旧的 section-based key（避免污染）
      try {
        var keysToRemove = [];
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.indexOf('ke_custom_') === 0 && k.indexOf('_s') > 0) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(function(k) { localStorage.removeItem(k); });
        if (keysToRemove.length > 0) {
          keLog('restoreCustomCards: removed ' + keysToRemove.length + ' old keys: ' + keysToRemove.join(','));
        }
      } catch(e) { keLog('restoreCustomCards: migration error=' + e); }
      
      // 先列出所有相关的 localStorage key
      var allKeys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('ke_custom_') === 0) {
          allKeys.push(k);
        }
      }
      keLog('restoreCustomCards: found ' + allKeys.length + ' custom card keys: ' + allKeys.join(', '));
      
      var grids = document.querySelectorAll('.word-grid');
      keLog('restoreCustomCards: found ' + grids.length + ' word-grids');
      
      grids.forEach(function(grid, idx) {
        var storageKey = getStorageKey(grid);
        keLog('restoreCustomCards: grid[' + idx + '] checking key=' + storageKey);
        try {
          var raw = localStorage.getItem(storageKey);
          keLog('restoreCustomCards: raw data for ' + storageKey + '=' + (raw ? raw.substring(0, 100) : 'null'));
          var cards = JSON.parse(raw || '[]');
          keLog('restoreCustomCards: parsed ' + cards.length + ' cards for ' + storageKey);
          if (cards.length > 0) {
            cards.forEach(function(data, cidx) {
              keLog('restoreCustomCards: creating card[' + cidx + '] word=' + data.word);
              createCustomCard(data, grid);
            });
          }
        } catch(e) {
          keLog('Restore failed for ' + storageKey + ': ' + e);
        }
      });
      keLog('=== restoreCustomCards END ===');
    }

    // 立即执行恢复
    restoreCustomCards();

    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeAddCard();
    });
  }

  // ========== 音标查询系统（混合方案）==========
  // 本地常用词缓存
  var LOCAL_IPA_CACHE = {
    'hello':'həˈləʊ','hi':'haɪ','good':'ɡʊd','morning':'ˈmɔːnɪŋ',
    'afternoon':'ˌɑːftəˈnuːn','evening':'ˈiːvnɪŋ','night':'naɪt',
    'goodbye':'ˌɡʊdˈbaɪ','bye':'baɪ','see':'siː','you':'juː',
    'later':'ˈleɪtər','how':'haʊ','are':'ɑːr','fine':'faɪn',
    'thank':'θæŋk','thanks':'θæŋks','please':'pliːz','sorry':'ˈsɒri',
    'welcome':'ˈwelkəm','nice':'naɪs','meet':'miːt','name':'neɪm',
    'what':'wɒt','is':'ɪz','my':'maɪ','your':'jɔːr',
    'yes':'jes','no':'nəʊ','ok':'əʊˈkeɪ','okay':'əʊˈkeɪ',
    'father':'ˈfɑːðər','mother':'ˈmʌðər','dad':'dæd','mom':'mɒm',
    'brother':'ˈbrʌðər','sister':'ˈsɪstər','baby':'ˈbeɪbi',
    'son':'sʌn','daughter':'ˈdɔːtər','family':'ˈfæməli',
    'grandfather':'ˈɡrændfɑːðər','grandmother':'ˈɡrændmʌðər',
    'grandpa':'ˈɡrænpɑː','grandma':'ˈɡrænmɑː',
    'uncle':'ˈʌŋkl','aunt':'ɑːnt','cousin':'ˈkʌzn',
    'red':'red','blue':'bluː','green':'ɡriːn','yellow':'ˈjeləʊ',
    'black':'blæk','white':'waɪt','pink':'pɪŋk','purple':'ˈpɜːpl',
    'orange':'ˈɒrɪndʒ','brown':'braʊn','gray':'ɡreɪ','grey':'ɡreɪ',
    'one':'wʌn','two':'tuː','three':'θriː','four':'fɔːr',
    'five':'faɪv','six':'sɪks','seven':'ˈsevn','eight':'eɪt',
    'nine':'naɪn','ten':'ten','eleven':'ɪˈlevn','twelve':'twelv',
    'apple':'ˈæpl','banana':'bəˈnɑːnə',
    'water':'ˈwɔːtər','milk':'mɪlk','juice':'dʒuːs',
    'cat':'kæt','dog':'dɒɡ','bird':'bɜːd','fish':'fɪʃ',
    'pig':'pɪɡ','duck':'dʌk','cow':'kaʊ','horse':'hɔːs',
    'sheep':'ʃiːp','hen':'hen','bee':'biː','ant':'ænt',
    'bear':'beər','lion':'ˈlaɪən','tiger':'ˈtaɪɡər','monkey':'ˈmʌŋki',
    'elephant':'ˈelɪfənt','giraffe':'dʒəˈrɑːf','panda':'ˈpændə',
    'rabbit':'ˈræbɪt','mouse':'maʊs','frog':'frɒɡ','snake':'sneɪk',
    'happy':'ˈhæpi','sad':'sæd','angry':'ˈæŋɡri','tired':'ˈtaɪəd',
    'hungry':'ˈhʌŋɡri','thirsty':'ˈθɜːsti','hot':'hɒt','cold':'kəʊld',
    'head':'hed','eye':'aɪ','ear':'ɪər','nose':'nəʊz',
    'mouth':'maʊθ','hand':'hænd','arm':'ɑːm','leg':'leɡ',
    'foot':'fʊt','toe':'təʊ','hair':'heər','face':'feɪs',
    'run':'rʌn','jump':'dʒʌmp','walk':'wɔːk','sit':'sɪt',
    'stand':'stænd','sleep':'sliːp','eat':'iːt','drink':'drɪŋk',
    'play':'pleɪ','read':'riːd','write':'raɪt','draw':'drɔː',
    'open':'ˈəʊpən','close':'kləʊz','give':'ɡɪv','take':'teɪk',
    'wash':'wɒʃ','brush':'brʌʃ','dress':'dres','wear':'weər',
    'school':'skuːl','teacher':'ˈtiːtʃər','student':'ˈstjuːdnt',
    'book':'bʊk','pen':'pen','pencil':'ˈpensl','bag':'bæɡ',
    'desk':'desk','chair':'tʃeər','table':'ˈteɪbl','door':'dɔːr',
    'window':'ˈwɪndəʊ','ball':'bɔːl','car':'kɑːr','bus':'bʌs',
    'bike':'baɪk','train':'treɪn','plane':'pleɪn','boat':'bəʊt',
    'sun':'sʌn','moon':'muːn','star':'stɑːr','cloud':'klaʊd',
    'rain':'reɪn','snow':'snəʊ','wind':'wɪnd','tree':'triː',
    'flower':'ˈflaʊər','grass':'ɡrɑːs','mountain':'ˈmaʊntən',
    'river':'ˈrɪvər','sea':'siː','sky':'skaɪ','earth':'ɜːθ',
    'today':'təˈdeɪ','tomorrow':'təˈmɒrəʊ','yesterday':'ˈjestədeɪ',
    'noon':'nuːn','day':'deɪ','week':'wiːk',
    'month':'mʌnθ','time':'taɪm','clock':'klɒk',
    'birthday':'ˈbɜːθdeɪ','christmas':'ˈkrɪsməs','new':'njuː',
    'spring':'sprɪŋ','summer':'ˈsʌmər',
    'autumn':'ˈɔːtəm','fall':'fɔːl','winter':'ˈwɪntər',
    'doctor':'ˈdɒktər','nurse':'nɜːs','police':'pəˈliːs',
    'firefighter':'ˈfaɪəfaɪtər',
    'farmer':'ˈfɑːmər','cook':'kʊk','driver':'ˈdraɪvər',
    'singer':'ˈsɪŋər','dancer':'ˈdɑːnsər','artist':'ˈɑːtɪst',
    'pilot':'ˈpaɪlət','scientist':'ˈsaɪəntɪst',
    'football':'ˈfʊtbɔːl','basketball':'ˈbɑːskɪtbɔːl',
    'swimming':'ˈswɪmɪŋ','running':'ˈrʌnɪŋ','jumping':'ˈdʒʌmpɪŋ',
    'dancing':'ˈdɑːnsɪŋ','singing':'ˈsɪŋɪŋ','drawing':'ˈdrɔːɪŋ',
    'painting':'ˈpeɪntɪŋ','reading':'ˈriːdɪŋ','writing':'ˈraɪtɪŋ',
    'toy':'tɔɪ','doll':'dɒl','kite':'kaɪt',
    'robot':'ˈrəʊbɒt','game':'ɡeɪm','puzzle':'ˈpʌzl',
    'bicycle':'ˈbaɪsɪkl','teddy':'ˈtedi'
  };

  // 从 localStorage 加载缓存
  function loadIPACache() {
    try {
      var cached = localStorage.getItem('ke_ipa_cache');
      if (cached) {
        var parsed = JSON.parse(cached);
        Object.assign(LOCAL_IPA_CACHE, parsed);
        keLog('IPA cache loaded: ' + Object.keys(parsed).length + ' words');
      }
    } catch(e) { keLog('IPA cache load failed: ' + e); }
  }

  // 保存缓存到 localStorage（限制大小防止超出配额）
  function saveIPACache() {
    try {
      var keys = Object.keys(LOCAL_IPA_CACHE);
      if (keys.length > 500) {
        // 只保留最近的500个
        var trimmed = {};
        keys.slice(-500).forEach(function(k) { trimmed[k] = LOCAL_IPA_CACHE[k]; });
        LOCAL_IPA_CACHE = trimmed;
      }
      localStorage.setItem('ke_ipa_cache', JSON.stringify(LOCAL_IPA_CACHE));
    } catch(e) {
      keLog('IPA cache save failed: ' + e);
      // 配额满时尝试清理日志
      try { localStorage.removeItem('ke_logs'); } catch(e2) {}
    }
  }

  // 清理音标格式（去除多余的 / 符号）
  function cleanIPA(ipa) {
    if (!ipa) return '';
    return ipa.replace(/^\//, '').replace(/\/$/, '').trim();
  }

  // 查询音标（混合方案）
  async function queryIPA(word) {
    var w = word.toLowerCase().trim();
    if (!w) return '';

    // 1. 优先查本地缓存
    if (LOCAL_IPA_CACHE[w]) {
      keLog('IPA local hit: ' + w + ' = ' + LOCAL_IPA_CACHE[w]);
      return cleanIPA(LOCAL_IPA_CACHE[w]);
    }

    // 2. 尝试联网查询 Free Dictionary API
    try {
      keLog('IPA fetching from API: ' + w);
      var response = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(w));
      if (response.ok) {
        var data = await response.json();
        if (data && data.length > 0 && data[0].phonetic) {
          var ipa = cleanIPA(data[0].phonetic);
          // 缓存结果（存储原始格式）
          LOCAL_IPA_CACHE[w] = ipa;
          saveIPACache();
          keLog('IPA API success: ' + w + ' = ' + ipa);
          return ipa;
        }
      }
    } catch(e) {
      keLog('IPA API failed: ' + w + ' - ' + e.message);
    }

    // 3. 回退到规则引擎
    keLog('IPA fallback to rules: ' + w);
    return generateIPARules(w);
  }

  // 规则引擎（作为最后回退）
  function generateIPARules(word) {
    var w = word.toLowerCase().trim();
    var map = {
      'a':'æ','e':'e','i':'ɪ','o':'ɒ','u':'ʌ',
      'ar':'ɑːr','er':'ɜːr','ir':'ɪr','or':'ɔːr','ur':'ɜːr',
      'ai':'eɪ','ea':'iː','ee':'iː','oa':'əʊ','oo':'uː','ou':'aʊ',
      'sh':'ʃ','ch':'tʃ','th':'θ','ph':'f','ng':'ŋ',
      'ck':'k','ll':'l','ss':'s','tt':'t','ff':'f','rr':'r'
    };
    var result = '';
    var i = 0;
    while (i < w.length) {
      var found = false;
      for (var k in map) {
        if (w.substring(i, i + k.length) === k) {
          result += map[k];
          i += k.length;
          found = true;
          break;
        }
      }
      if (!found) {
        result += w[i];
        i++;
      }
    }
    return result || w;
  }

  // 为单个卡片添加 TTS 按钮
  function addTTSToCard(card) {
    var textEl = card.querySelector('.word-en');
    if (!textEl) return;
    var text = textEl.textContent.replace(/\s*\/[^/]+\/\s*/g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return;
    var btn = document.createElement('button');
    btn.className = 'tts-btn';
    btn.textContent = '\u25B6';
    btn.setAttribute('aria-label', '\u6717\u8BFB: ' + text);
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (btn.classList.contains('playing')) { stopSpeaking(); }
      else { speak(text, btn); }
    });
    card.appendChild(btn);
  }

  // 为单个卡片添加图片替换按钮
  function addImageReplaceToCard(card) {
    var replaceBtn = document.createElement('button');
    replaceBtn.className = 'img-replace-btn';
    replaceBtn.innerHTML = '&#x1F4F7;';
    replaceBtn.title = '替换图片';
    replaceBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      // 复用全局 fileInput
      var fi = document.querySelector('.img-file-input');
      if (!fi) return;
      // 设置当前卡片
      window._currentReplaceCard = card;
      fi.value = '';
      fi.click();
    });
    card.appendChild(replaceBtn);

    var emoji = card.querySelector('.word-emoji');
    var resetBtn = document.createElement('button');
    resetBtn.className = 'img-reset-btn';
    resetBtn.innerHTML = '&#x2715;';
    resetBtn.title = '恢复默认';
    resetBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      var img = card.querySelector('.word-card-img');
      if (img) { img.remove(); }
      if (emoji) { emoji.classList.remove('replaced'); }
      card.classList.remove('has-custom-img');
    });
    card.appendChild(resetBtn);
  }

  // ========== 自定义语句记录功能 ==========
  function initCustomSentences() {
    var pageId = location.pathname.split('/').pop().replace('.html', '') || 'unknown';
    var storageKey = 'ke_sentences_' + pageId;

    // 注入样式
    var css = '';
    css += '.ke-sentences-section{margin:24px 0 16px;padding:16px;background:linear-gradient(135deg,#FFF8F0 0%,#FFF0E8 100%);border-radius:16px;border:2px dashed #FFD0B0}';
    css += '.ke-sentences-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}';
    css += '.ke-sentences-title{font-size:1rem;font-weight:700;color:var(--accent);display:flex;align-items:center;gap:6px}';
    css += '.ke-sentences-title-icon{font-size:1.2rem}';
    css += '.ke-sentences-count{font-size:0.75rem;color:var(--muted);background:rgba(255,107,74,0.1);padding:2px 8px;border-radius:10px;margin-left:6px}';
    css += '.ke-sentences-add-btn{display:flex;align-items:center;gap:4px;padding:6px 14px;border:2px solid var(--accent);border-radius:20px;background:#fff;color:var(--accent);font-size:0.8rem;font-weight:600;cursor:pointer;transition:all 0.2s}';
    css += '.ke-sentences-add-btn:hover{background:var(--accent);color:#fff}';
    css += '.ke-sentences-add-btn:active{transform:scale(0.95)}';
    css += '.ke-sentences-empty{text-align:center;color:var(--muted);font-size:0.85rem;padding:16px 0;opacity:0.7}';
    css += '.ke-sentences-list{display:flex;flex-direction:column;gap:8px}';
    css += '.ke-sentence-item{display:flex;align-items:flex-start;gap:10px;padding:12px;background:#fff;border-radius:12px;border:1px solid var(--rule);position:relative;transition:all 0.2s}';
    css += '.ke-sentence-item:hover{border-color:var(--accent);box-shadow:0 2px 8px rgba(255,107,74,0.1)}';
    css += '.ke-sentence-num{flex-shrink:0;width:24px;height:24px;border-radius:50%;background:var(--accent);color:#fff;font-size:0.7rem;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:2px}';
    css += '.ke-sentence-body{flex:1;min-width:0}';
    css += '.ke-sentence-en{font-size:0.95rem;font-weight:600;color:var(--ink);line-height:1.5;word-break:break-word}';
    css += '.ke-sentence-cn{font-size:0.8rem;color:var(--muted);margin-top:2px;line-height:1.4;word-break:break-word}';
    css += '.ke-sentence-actions{display:flex;gap:4px;flex-shrink:0;align-items:center;margin-top:2px}';
    css += '.ke-sentence-tts{width:28px;height:28px;border-radius:50%;border:1px solid var(--rule);background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--accent);transition:all 0.15s}';
    css += '.ke-sentence-tts:hover{background:var(--accent);color:#fff;border-color:var(--accent)}';
    css += '.ke-sentence-tts.playing{background:var(--accent);color:#fff;border-color:var(--accent)}';
    css += '.ke-sentence-del{width:28px;height:28px;border-radius:50%;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px;color:#ccc;transition:all 0.15s}';
    css += '.ke-sentence-del:hover{background:rgba(231,76,60,0.1);color:#e74c3c}';
    css += '.ke-sentence-time{font-size:0.65rem;color:#ccc;margin-top:4px}';
    css += '.ke-sentences-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px}';
    css += '.ke-sentences-modal{background:#fff;border-radius:20px;padding:24px;width:100%;max-width:400px;box-shadow:0 20px 60px rgba(0,0,0,0.2)}';
    css += '.ke-sentences-modal h3{font-size:1.05rem;font-weight:700;margin-bottom:16px;color:var(--ink);display:flex;align-items:center;gap:6px}';
    css += '.ke-sentences-modal label{display:block;font-size:0.8rem;font-weight:600;color:var(--muted);margin-bottom:4px;margin-top:12px}';
    css += '.ke-sentences-modal label:first-of-type{margin-top:0}';
    css += '.ke-sentences-modal textarea{width:100%;padding:10px 12px;border:2px solid var(--rule);border-radius:10px;font-family:var(--font);font-size:0.9rem;resize:vertical;min-height:60px;outline:none;transition:border-color 0.2s;box-sizing:border-box}';
    css += '.ke-sentences-modal textarea:focus{border-color:var(--accent)}';
    css += '.ke-sentences-modal input[type=text]{width:100%;padding:10px 12px;border:2px solid var(--rule);border-radius:10px;font-family:var(--font);font-size:0.9rem;outline:none;transition:border-color 0.2s;box-sizing:border-box}';
    css += '.ke-sentences-modal input[type=text]:focus{border-color:var(--accent)}';
    css += '.ke-sentences-modal-btns{display:flex;gap:10px;margin-top:20px;justify-content:flex-end}';
    css += '.ke-sentences-modal-btns button{padding:10px 20px;border-radius:12px;font-family:var(--font);font-size:0.9rem;font-weight:600;cursor:pointer;border:none;transition:all 0.2s}';
    css += '.ke-sentences-modal-cancel{background:#f0f0f0;color:var(--muted)}';
    css += '.ke-sentences-modal-cancel:hover{background:#e0e0e0}';
    css += '.ke-sentences-modal-confirm{background:var(--accent);color:#fff}';
    css += '.ke-sentences-modal-confirm:hover{background:#e55a3a}';
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // 创建区域容器
    var article = document.querySelector('article.page');
    if (!article) { keLog('initCustomSentences: no article.page found'); return; }

    var section = document.createElement('div');
    section.className = 'ke-sentences-section';
    section.innerHTML =
      '<div class="ke-sentences-header">' +
        '<div class="ke-sentences-title">' +
          '<span class="ke-sentences-title-icon">&#x1F4DD;</span>' +
          '我的语句记录' +
          '<span class="ke-sentences-count" id="keSentCount">0</span>' +
        '</div>' +
        '<button class="ke-sentences-add-btn" id="keSentAddBtn">&#x2795; 添加</button>' +
      '</div>' +
      '<div class="ke-sentences-list" id="keSentList"></div>';

    article.appendChild(section);

    var listEl = document.getElementById('keSentList');
    var countEl = document.getElementById('keSentCount');
    var addBtn = document.getElementById('keSentAddBtn');

    // 读取已保存的语句
    function loadSentences() {
      try {
        var raw = localStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : [];
      } catch(e) { return []; }
    }

    // 保存语句
    function saveSentences(arr) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(arr));
      } catch(e) {
        keLog('saveSentences failed: ' + e);
        alert('保存失败，存储空间可能已满。请删除一些记录后重试。');
      }
    }

    // 更新计数
    function updateCount(arr) {
      if (countEl) countEl.textContent = arr.length;
    }

    // 格式化时间
    function formatTime(ts) {
      var d = new Date(ts);
      var mm = String(d.getMonth() + 1).padStart(2, '0');
      var dd = String(d.getDate()).padStart(2, '0');
      var hh = String(d.getHours()).padStart(2, '0');
      var mi = String(d.getMinutes()).padStart(2, '0');
      return mm + '-' + dd + ' ' + hh + ':' + mi;
    }

    // HTML 转义
    function esc(str) {
      var div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    }

    // 渲染单条语句
    function renderSentence(item, index) {
      var el = document.createElement('div');
      el.className = 'ke-sentence-item';
      el.innerHTML =
        '<div class="ke-sentence-num">' + (index + 1) + '</div>' +
        '<div class="ke-sentence-body">' +
          '<div class="ke-sentence-en">' + esc(item.en) + '</div>' +
          '<div class="ke-sentence-cn">' + esc(item.cn) + '</div>' +
          '<div class="ke-sentence-time">' + formatTime(item.ts) + '</div>' +
        '</div>' +
        '<div class="ke-sentence-actions">' +
          '<button class="ke-sentence-tts" title="朗读">&#x25B6;</button>' +
          '<button class="ke-sentence-del" title="删除">&#x2715;</button>' +
        '</div>';

      // TTS 朗读
      var ttsBtn = el.querySelector('.ke-sentence-tts');
      ttsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (ttsBtn.classList.contains('playing')) {
          stopSpeaking();
          ttsBtn.classList.remove('playing');
          ttsBtn.textContent = '\u25B6';
        } else {
          document.querySelectorAll('.ke-sentence-tts.playing').forEach(function(b) {
            b.classList.remove('playing'); b.textContent = '\u25B6';
          });
          speak(item.en, ttsBtn);
        }
      });

      // 删除
      var delBtn = el.querySelector('.ke-sentence-del');
      delBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (confirm('确定要删除这条语句吗？')) {
          var arr = loadSentences();
          arr.splice(index, 1);
          saveSentences(arr);
          renderAll();
        }
      });

      return el;
    }

    // 渲染全部
    function renderAll() {
      var arr = loadSentences();
      updateCount(arr);
      listEl.innerHTML = '';
      if (arr.length === 0) {
        listEl.innerHTML = '<div class="ke-sentences-empty">&#x1F4AC; 还没有记录，点击上方「添加」按钮记录好用的句子吧</div>';
        return;
      }
      // 按时间倒序显示
      arr.sort(function(a, b) { return b.ts - a.ts; });
      arr.forEach(function(item, i) {
        listEl.appendChild(renderSentence(item, i));
      });
    }

    // 创建添加模态框
    var modal = document.createElement('div');
    modal.className = 'ke-sentences-modal-overlay';
    modal.style.display = 'none';
    modal.innerHTML =
      '<div class="ke-sentences-modal">' +
        '<h3>&#x270D; 添加新语句</h3>' +
        '<label>英文句子</label>' +
        '<textarea id="keSentEnInput" placeholder="例如: Practice makes perfect." rows="2"></textarea>' +
        '<label>中文翻译</label>' +
        '<input type="text" id="keSentCnInput" placeholder="例如: 熟能生巧。">' +
        '<div class="ke-sentences-modal-btns">' +
          '<button class="ke-sentences-modal-cancel" id="keSentCancelBtn">取消</button>' +
          '<button class="ke-sentences-modal-confirm" id="keSentConfirmBtn">添加</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    var enInput = document.getElementById('keSentEnInput');
    var cnInput = document.getElementById('keSentCnInput');
    var cancelBtn = document.getElementById('keSentCancelBtn');
    var confirmBtn = document.getElementById('keSentConfirmBtn');

    function openModal() {
      enInput.value = '';
      cnInput.value = '';
      modal.style.display = 'flex';
      setTimeout(function() { enInput.focus(); }, 100);
    }

    function closeModal() {
      modal.style.display = 'none';
    }

    function doAdd() {
      var en = enInput.value.trim();
      var cn = cnInput.value.trim();
      if (!en) { alert('请输入英文句子'); enInput.focus(); return; }
      if (!cn) { alert('请输入中文翻译'); cnInput.focus(); return; }

      var arr = loadSentences();
      arr.push({ en: en, cn: cn, ts: Date.now() });
      saveSentences(arr);
      closeModal();
      renderAll();
      keLog('Sentence added: ' + en.substring(0, 30));
    }

    addBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      openModal();
    });

    cancelBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      closeModal();
    });

    confirmBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      doAdd();
    });

    // 点击遮罩关闭
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeModal();
    });

    // Ctrl+Enter 快捷添加
    enInput.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); doAdd(); }
    });
    cnInput.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); doAdd(); }
      if (e.key === 'Enter') { e.preventDefault(); doAdd(); }
    });

    // 初始渲染
    renderAll();
    keLog('initCustomSentences: pageId=' + pageId + ', key=' + storageKey);
  }

  // ========== 单词卡片图片替换功能 ==========
  function initImageReplace() {
    // 注入图片替换样式
    var style = document.createElement('style');
    style.textContent = '.word-card{position:relative}.img-replace-btn{position:absolute;bottom:4px;left:4px;width:22px;height:22px;border-radius:50%;border:none;background:rgba(255,255,255,0.85);color:var(--accent);font-size:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:all 0.2s;z-index:3;box-shadow:0 1px 3px rgba(0,0,0,0.1)}.word-card:hover .img-replace-btn{opacity:0.8}.img-replace-btn:hover{opacity:1;background:var(--accent);color:#fff;transform:scale(1.1)}.word-emoji.replaced{display:none}.word-card-img{width:48px;height:48px;border-radius:8px;object-fit:cover;margin:0 auto 2px;display:none;box-shadow:0 1px 4px rgba(0,0,0,0.1)}.word-card-img.show{display:block}.img-reset-btn{position:absolute;bottom:4px;right:4px;width:18px;height:18px;border-radius:50%;border:none;background:rgba(255,107,74,0.85);color:#fff;font-size:9px;display:none;align-items:center;justify-content:center;cursor:pointer;z-index:3;opacity:0;transition:all 0.2s}.word-card.has-custom-img .img-reset-btn{display:flex}.word-card:hover .img-reset-btn{opacity:1}.img-reset-btn:hover{background:var(--accent);transform:scale(1.1)}.img-file-input{display:none}';
    document.head.appendChild(style);

    // 创建隐藏的文件选择器
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.className = 'img-file-input';
    document.body.appendChild(fileInput);

    window._currentReplaceCard = null;

    // 为每个有 emoji 的单词卡片添加替换按钮
    document.querySelectorAll('.word-card').forEach(function(card) {
      var emoji = card.querySelector('.word-emoji');
      if (!emoji) return;

      // 替换图片按钮（左下角相机图标）
      var replaceBtn = document.createElement('button');
      replaceBtn.className = 'img-replace-btn';
      replaceBtn.innerHTML = '&#x1F4F7;';
      replaceBtn.title = '替换图片';
      replaceBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        window._currentReplaceCard = card;
        fileInput.value = '';
        fileInput.click();
      });
      card.appendChild(replaceBtn);

      // 重置按钮（右下角，仅替换后显示）
      var resetBtn = document.createElement('button');
      resetBtn.className = 'img-reset-btn';
      resetBtn.innerHTML = '&#x2715;';
      resetBtn.title = '恢复默认';
      resetBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        // 移除自定义图片
        var img = card.querySelector('.word-card-img');
        if (img) { img.remove(); }
        emoji.classList.remove('replaced');
        card.classList.remove('has-custom-img');
        // 清除保存的图片
        var word = card.querySelector('.word-en');
        if (word) {
          try { localStorage.removeItem('ke_img_' + word.textContent.trim().split(/\s+/)[0]); } catch(ex) {}
        }
      });
      card.appendChild(resetBtn);

      // 检查是否有保存的自定义图片
      var word = card.querySelector('.word-en');
      if (word) {
        try {
          var savedImg = localStorage.getItem('ke_img_' + word.textContent.trim().split(/\s+/)[0]);
          if (savedImg) {
            applyCustomImage(card, emoji, savedImg);
          }
        } catch(ex) {}
      }
    });

    // 文件选择后处理
    fileInput.addEventListener('change', function(e) {
      var card = window._currentReplaceCard;
      if (!card || !fileInput.files || fileInput.files.length === 0) return;
      var file = fileInput.files[0];
      if (!file.type.startsWith('image/')) return;

      var reader = new FileReader();
      reader.onload = function(ev) {
        var dataUrl = ev.target.result;
        var emoji = card.querySelector('.word-emoji');
        if (!emoji) return;

        applyCustomImage(card, emoji, dataUrl);

        // 保存到 localStorage
        var word = card.querySelector('.word-en');
        if (word) {
          try { localStorage.setItem('ke_img_' + word.textContent.trim().split(/\s+/)[0], dataUrl); } catch(ex) {}
        }
        window._currentReplaceCard = null;
      };
      reader.readAsDataURL(file);
    });
  }

  function applyCustomImage(card, emoji, src) {
    // 隐藏 emoji，显示图片
    emoji.classList.add('replaced');
    card.classList.add('has-custom-img');

    var img = card.querySelector('.word-card-img');
    if (!img) {
      img = document.createElement('img');
      img.className = 'word-card-img';
      emoji.parentNode.insertBefore(img, emoji);
    }
    img.src = src;
    img.alt = 'custom image';
    img.classList.add('show');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
