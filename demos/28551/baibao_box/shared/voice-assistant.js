/* ========================================
   故事百宝箱 - 全局悬浮对话头像框逻辑
   IIFE封装，暴露全局 VoiceAssistant 对象
   ======================================== */
;(function () {
  'use strict';

  /* ---------- 默认配置 ---------- */
  const DEFAULTS = {
    role: 'companion',          // companion | guardian
    primaryAvatar: '🦊',
    primaryName: '小箱',
    targets: [],
    messages: [],
    onSend: null,              // function(text, target) {}
    onSwitch: null,             // function(target) {}
    onCall: null                // function(target, action) {}  action: start | end
  };

  let _config = {};
  let _isOpen = false;
  let _mode = 'voice';         // voice | text
  let _isRecording = false;
  let _currentTarget = null;
  let _messages = [];
  let _unread = 0;
  let _isCalling = false;

  /* DOM 引用 */
  let $floatBtn, $overlay, $panel, $switchOverlay, $callOverlay;
  let $msgArea, $inputArea, $textInput, $sendBtn, $voiceBtn;

  /* ---------- 工具函数 ---------- */
  function $(sel, parent) { return (parent || document).querySelector(sel); }
  function $$(sel, parent) { return (parent || document).querySelectorAll(sel); }

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 6) return '凌晨好呀';
    if (h < 9) return '早上好呀';
    if (h < 12) return '上午好呀';
    if (h < 14) return '中午好呀';
    if (h < 18) return '下午好呀';
    if (h < 22) return '晚上好呀';
    return '夜深了';
  }

  /* ---------- 创建DOM ---------- */
  function createDOM() {
    // 悬浮按钮
    $floatBtn = document.createElement('button');
    $floatBtn.className = 'va-float-btn';
    $floatBtn.innerHTML = `
      <span class="va-btn-avatar">${_config.primaryAvatar}</span>
      <span class="va-badge" style="display:none"></span>
    `;
    $floatBtn.addEventListener('click', function () {
      if (_isOpen) close(); else open();
    });
    document.body.appendChild($floatBtn);

    // 遮罩
    $overlay = document.createElement('div');
    $overlay.className = 'va-overlay';
    $overlay.addEventListener('click', close);
    document.body.appendChild($overlay);

    // 面板
    $panel = document.createElement('div');
    $panel.className = 'va-panel';
    $panel.innerHTML = buildPanelHTML();
    document.body.appendChild($panel);

    // 对话对象切换面板
    $switchOverlay = document.createElement('div');
    $switchOverlay.className = 'va-switch-overlay';
    $switchOverlay.innerHTML = buildSwitchHTML();
    $switchOverlay.addEventListener('click', function (e) {
      if (e.target === $switchOverlay) closeSwitch();
    });
    document.body.appendChild($switchOverlay);

    // 通话覆盖层
    $callOverlay = document.createElement('div');
    $callOverlay.className = 'va-call-overlay';
    $callOverlay.innerHTML = buildCallHTML();
    document.body.appendChild($callOverlay);

    // 缓存引用
    $msgArea = $('.va-messages', $panel);
    $inputArea = $('.va-input-area', $panel);
    $textInput = $('.va-text-input', $panel);
    $sendBtn = $('.va-send-btn', $panel);
    $voiceBtn = $('.va-voice-btn', $panel);

    // 绑定事件
    bindEvents();
    bindDragEvents();
  }

  function buildPanelHTML() {
    const target = _currentTarget || { avatar: _config.primaryAvatar, name: _config.primaryName, desc: '在线', online: true };
    return `
      <div class="va-panel-handle"></div>
      <div class="va-panel-header">
        <div class="va-panel-avatar">${target.avatar}</div>
        <div class="va-panel-info">
          <div class="va-panel-name">${target.name}</div>
          <div class="va-panel-status ${target.online ? 'online' : ''}">${target.desc || (target.online ? '在线' : '离线')}</div>
        </div>
        <div class="va-panel-actions">
          <button class="va-panel-action-btn switch-btn" title="切换对话对象"><i class="fa-solid fa-users"></i></button>
          <button class="va-panel-action-btn call-btn" title="语音通话"><i class="fa-solid fa-phone"></i></button>
        </div>
      </div>
      <div class="va-messages"></div>
      <div class="va-input-area">
        <div class="va-mode-voice" style="display:${_mode === 'voice' ? 'flex' : 'none'}">
          <div class="va-voice-waveform" style="display:none">
            ${Array.from({length:10}, (_,i) => `<span></span>`).join('')}
          </div>
          <button class="va-voice-btn"><i class="fa-solid fa-microphone"></i></button>
          <span class="va-voice-hint">按住说话</span>
        </div>
        <div class="va-mode-text" style="display:${_mode === 'text' ? 'flex' : 'none'}">
          <input class="va-text-input" type="text" placeholder="输入消息..." />
          <button class="va-send-btn" disabled><i class="fa-solid fa-paper-plane"></i></button>
        </div>
        <div class="va-mode-switch">
          <button class="va-mode-switch-btn">${_mode === 'voice' ? '切换文字输入' : '切换语音输入'}</button>
        </div>
      </div>
    `;
  }

  function buildSwitchHTML() {
    const targets = _config.targets || [];
    const items = targets.map((t, i) => `
      <div class="va-switch-item ${(_currentTarget && _currentTarget.id === t.id) || (!_currentTarget && i === 0) ? 'active' : ''}" data-index="${i}">
        <div class="va-switch-item-avatar" style="background:${t.bg || '#f0f0f0'}">${t.avatar}</div>
        <div class="va-switch-item-info">
          <div class="va-switch-item-name">${t.name}</div>
          <div class="va-switch-item-desc">${t.desc || ''}</div>
        </div>
        <div class="va-switch-item-check"><i class="fa-solid fa-check"></i></div>
      </div>
    `).join('');
    return `
      <div class="va-switch-panel">
        <div class="va-switch-title">选择对话对象</div>
        <div class="va-switch-list">${items}</div>
      </div>
    `;
  }

  function buildCallHTML() {
    const target = _currentTarget || { avatar: _config.primaryAvatar, name: _config.primaryName };
    return `
      <div class="va-call-avatar">${target.avatar}</div>
      <div class="va-call-name">${target.name}</div>
      <div class="va-call-status">正在呼叫...</div>
      <div class="va-call-actions">
        <button class="va-call-btn mute-call"><i class="fa-solid fa-microphone-slash"></i></button>
        <button class="va-call-btn end-call"><i class="fa-solid fa-phone-slash"></i></button>
      </div>
    `;
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents() {
    // 切换对话对象
    $('.switch-btn', $panel).addEventListener('click', function () {
      openSwitch();
    });

    // 语音通话
    $('.call-btn', $panel).addEventListener('click', function () {
      startCall(_currentTarget);
    });

    // 切换面板中的选择
    $$('.va-switch-item', $switchOverlay).forEach(function (item) {
      item.addEventListener('click', function () {
        var idx = parseInt(this.dataset.index);
        var target = _config.targets[idx];
        if (target) setTarget(target);
        closeSwitch();
      });
    });

    // 模式切换
    $('.va-mode-switch-btn', $panel).addEventListener('click', function () {
      toggleMode();
    });

    // 文字输入
    $textInput.addEventListener('input', function () {
      $sendBtn.disabled = !this.value.trim();
    });
    $textInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && this.value.trim()) {
        sendMessage(this.value.trim());
        this.value = '';
        $sendBtn.disabled = true;
      }
    });

    // 发送按钮
    $sendBtn.addEventListener('click', function () {
      if ($textInput.value.trim()) {
        sendMessage($textInput.value.trim());
        $textInput.value = '';
        $sendBtn.disabled = true;
      }
    });

    // 语音按钮
    $voiceBtn.addEventListener('mousedown', startRecording);
    $voiceBtn.addEventListener('mouseup', stopRecording);
    $voiceBtn.addEventListener('mouseleave', stopRecording);
    $voiceBtn.addEventListener('touchstart', function (e) { e.preventDefault(); startRecording(); });
    $voiceBtn.addEventListener('touchend', function (e) { e.preventDefault(); stopRecording(); });

    // 通话结束
    $('.end-call', $callOverlay).addEventListener('click', function () {
      endCall();
    });

    // 面板拖动关闭
    var startY = 0, currentY = 0, isPanelDragging = false;
    var handle = $('.va-panel-handle', $panel);
    handle.addEventListener('touchstart', function (e) {
      startY = e.touches[0].clientY;
      isPanelDragging = true;
    });
    handle.addEventListener('touchmove', function (e) {
      if (!isPanelDragging) return;
      currentY = e.touches[0].clientY - startY;
      if (currentY > 0) {
        $panel.style.transform = 'translateX(-50%) translateY(' + currentY + 'px)';
      }
    });
    handle.addEventListener('touchend', function () {
      isPanelDragging = false;
      if (currentY > 100) {
        close();
      } else {
        $panel.style.transform = '';
      }
      currentY = 0;
    });
  }

  /* ---------- 悬浮按钮拖拽 ---------- */
  function bindDragEvents() {
    var isDragging = false;
    var startX = 0, startY = 0;
    var initialLeft = 0, initialTop = 0;
    var hasMoved = false;
    var dragThreshold = 5;

    function onPointerDown(e) {
      isDragging = true;
      hasMoved = false;
      startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      startY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      var rect = $floatBtn.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      $floatBtn.classList.add('va-dragging');
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      var clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      var clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      var dx = clientX - startX;
      var dy = clientY - startY;

      if (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold) {
        hasMoved = true;
      }

      if (hasMoved) {
        var newLeft = initialLeft + dx;
        var newTop = initialTop + dy;
        var maxW = window.innerWidth - 64;
        var maxH = window.innerHeight - 64;
        newLeft = Math.max(0, Math.min(newLeft, maxW));
        newTop = Math.max(0, Math.min(newTop, maxH));
        $floatBtn.style.left = newLeft + 'px';
        $floatBtn.style.right = 'auto';
        $floatBtn.style.top = newTop + 'px';
        $floatBtn.style.bottom = 'auto';
      }
      e.preventDefault();
    }

    function onPointerUp(e) {
      if (!isDragging) return;
      isDragging = false;
      $floatBtn.classList.remove('va-dragging');

      // 吸附到最近的边缘
      var rect = $floatBtn.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var winW = window.innerWidth;
      var winH = window.innerHeight;
      var targetLeft, targetTop;

      // 水平吸附：左或右
      if (centerX < winW / 2) {
        targetLeft = 16;
      } else {
        targetLeft = winW - 64 - 16;
      }
      // 垂直：保持在可视范围内
      targetTop = Math.max(80, Math.min(rect.top, winH - 80));

      $floatBtn.style.transition = 'left 0.3s ease, top 0.3s ease';
      $floatBtn.style.left = targetLeft + 'px';
      $floatBtn.style.top = targetTop + 'px';

      setTimeout(function () {
        $floatBtn.style.transition = '';
        // 恢复right/bottom以便响应式
        if (centerX < winW / 2) {
          $floatBtn.style.left = '';
          $floatBtn.style.right = 'auto';
        } else {
          $floatBtn.style.left = 'auto';
          $floatBtn.style.right = '16px';
        }
        $floatBtn.style.top = '';
        $floatBtn.style.bottom = 'auto';
        // 使用transform定位保持相对位置
        var finalTop = targetTop;
        $floatBtn.style.top = finalTop + 'px';
      }, 300);

      // 如果没有移动（只是点击），则打开/关闭面板
      if (!hasMoved) {
        if (_isOpen) close(); else open();
      }
    }

    $floatBtn.addEventListener('mousedown', onPointerDown);
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);
    $floatBtn.addEventListener('touchstart', onPointerDown, { passive: false });
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerUp);
  }

  /* ---------- 录音模拟 ---------- */
  function startRecording() {
    _isRecording = true;
    $voiceBtn.classList.add('recording');
    $voiceBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
    $floatBtn.classList.add('recording');
    $('.va-voice-waveform', $inputArea).style.display = 'flex';
    $('.va-voice-hint', $inputArea).textContent = '录音中...松开发送';
  }

  function stopRecording() {
    if (!_isRecording) return;
    _isRecording = false;
    $voiceBtn.classList.remove('recording');
    $voiceBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    $floatBtn.classList.remove('recording');
    $('.va-voice-waveform', $inputArea).style.display = 'none';
    $('.va-voice-hint', $inputArea).textContent = '按住说话';

    // 模拟发送语音消息
    var duration = Math.floor(Math.random() * 8) + 3;
    addMessage({ type: 'voice', side: 'right', duration: duration });
  }

  /* ---------- 模式切换 ---------- */
  function toggleMode() {
    _mode = _mode === 'voice' ? 'text' : 'voice';
    var voiceMode = $('.va-mode-voice', $panel);
    var textMode = $('.va-mode-text', $panel);
    var switchBtn = $('.va-mode-switch-btn', $panel);

    if (_mode === 'voice') {
      voiceMode.style.display = 'flex';
      textMode.style.display = 'none';
      switchBtn.textContent = '切换文字输入';
    } else {
      voiceMode.style.display = 'none';
      textMode.style.display = 'flex';
      switchBtn.textContent = '切换语音输入';
      $textInput.focus();
    }
  }

  /* ---------- 消息渲染 ---------- */
  function addMessage(msg) {
    _messages.push(msg);
    renderMessage(msg);
    scrollToBottom();
  }

  function renderMessage(msg) {
    var target = _currentTarget || { avatar: _config.primaryAvatar };
    var div = document.createElement('div');
    div.className = 'va-msg va-msg-' + msg.side;

    if (msg.side === 'left') {
      div.innerHTML = `
        <div class="va-msg-avatar">${target.avatar}</div>
        <div class="va-msg-bubble ${msg.type === 'voice' ? 'va-voice-bubble' : ''}">
          ${msg.type === 'voice' ? buildVoiceBubble(msg) : escapeHtml(msg.text)}
        </div>
      `;
    } else {
      div.innerHTML = `
        <div class="va-msg-bubble ${msg.type === 'voice' ? 'va-voice-bubble' : ''}">
          ${msg.type === 'voice' ? buildVoiceBubble(msg) : escapeHtml(msg.text)}
        </div>
        <div class="va-msg-avatar" style="background:linear-gradient(135deg,#ff9a56,#ff6b9d)">😊</div>
      `;
    }
    $msgArea.appendChild(div);
  }

  function buildVoiceBubble(msg) {
    var bars = '';
    for (var i = 0; i < 7; i++) {
      bars += '<span></span>';
    }
    return `
      <div class="va-voice-wave">${bars}</div>
      <span class="va-voice-duration">${msg.duration || 0}"</span>
    `;
  }

  function renderAllMessages() {
    $msgArea.innerHTML = '';
    _messages.forEach(function (msg) { renderMessage(msg); });
    scrollToBottom();
  }

  function scrollToBottom() {
    requestAnimationFrame(function () {
      $msgArea.scrollTop = $msgArea.scrollHeight;
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------- 面板开关 ---------- */
  function open() {
    _isOpen = true;
    $overlay.classList.add('active');
    $panel.classList.add('active');
    document.body.classList.add('va-enabled');
    clearUnread();
    renderAllMessages();
    scrollToBottom();
  }

  function close() {
    _isOpen = false;
    $overlay.classList.remove('active');
    $panel.classList.remove('active');
    document.body.classList.remove('va-enabled');
  }

  /* ---------- 切换面板 ---------- */
  function openSwitch() {
    $switchOverlay.classList.add('active');
  }

  function closeSwitch() {
    $switchOverlay.classList.remove('active');
  }

  /* ---------- 通话 ---------- */
  function startCall(target) {
    if (!target) target = _currentTarget;
    _isCalling = true;
    var avatar = $('.va-call-avatar', $callOverlay);
    var name = $('.va-call-name', $callOverlay);
    if (target) {
      avatar.textContent = target.avatar;
      name.textContent = target.name;
    }
    $callOverlay.classList.add('active');
    if (_config.onCall) _config.onCall(target, 'start');
  }

  function endCall() {
    _isCalling = false;
    $callOverlay.classList.remove('active');
    if (_config.onCall) _config.onCall(_currentTarget, 'end');
  }

  /* ---------- 未读 ---------- */
  function setUnread(count) {
    _unread = count;
    var badge = $('.va-badge', $floatBtn);
    if (count > 0) {
      badge.style.display = 'flex';
      badge.textContent = count > 99 ? '99+' : count;
    } else {
      badge.style.display = 'none';
    }
  }

  function clearUnread() {
    setUnread(0);
  }

  /* ---------- 公开API ---------- */
  window.VoiceAssistant = {
    init: function (opts) {
      _config = Object.assign({}, DEFAULTS, opts);
      _messages = _config.messages || [];
      _currentTarget = _config.targets && _config.targets.length > 0 ? _config.targets[0] : null;
      createDOM();
      return this;
    },

    open: open,
    close: close,

    setTarget: function (target) {
      _currentTarget = target;
      // 更新面板头部
      var avatar = $('.va-panel-avatar', $panel);
      var name = $('.va-panel-name', $panel);
      var status = $('.va-panel-status', $panel);
      if (avatar) avatar.textContent = target.avatar;
      if (name) name.textContent = target.name;
      if (status) {
        status.textContent = target.desc || (target.online ? '在线' : '离线');
        status.className = 'va-panel-status ' + (target.online ? 'online' : '');
      }
      // 更新悬浮按钮
      var btnAvatar = $('.va-btn-avatar', $floatBtn);
      if (btnAvatar) btnAvatar.textContent = target.avatar;
      // 更新通话层
      var callAvatar = $('.va-call-avatar', $callOverlay);
      var callName = $('.va-call-name', $callOverlay);
      if (callAvatar) callAvatar.textContent = target.avatar;
      if (callName) callName.textContent = target.name;
      // 更新切换面板高亮
      $$('.va-switch-item', $switchOverlay).forEach(function (item) {
        var idx = parseInt(item.dataset.index);
        var t = _config.targets[idx];
        item.classList.toggle('active', t && t.id === target.id);
      });
      if (_config.onSwitch) _config.onSwitch(target);
      return this;
    },

    sendMessage: function (text) {
      addMessage({ type: 'text', side: 'right', text: text });
      if (_config.onSend) _config.onSend(text, _currentTarget);
      return this;
    },

    addAIMessage: function (text) {
      addMessage({ type: 'text', side: 'left', text: text });
      return this;
    },

    startCall: startCall,
    endCall: endCall,

    setUnread: setUnread,

    isOpen: function () { return _isOpen; },

    destroy: function () {
      if ($floatBtn) $floatBtn.remove();
      if ($overlay) $overlay.remove();
      if ($panel) $panel.remove();
      if ($switchOverlay) $switchOverlay.remove();
      if ($callOverlay) $callOverlay.remove();
      document.body.classList.remove('va-enabled');
      _isOpen = false;
      _messages = [];
      _config = {};
      $floatBtn = $overlay = $panel = $switchOverlay = $callOverlay = null;
    }
  };
})();
