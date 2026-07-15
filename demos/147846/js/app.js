/* ============================================================
   声昔 · 声音时光胶囊 - 主应用逻辑
   路由控制、事件绑定、页面交互
   ============================================================ */

const App = (() => {
  // ---------- 状态 ----------
  let currentDetailId = null;
  let voicePlaybackAudio = null;
  let detailPlayback = null;

  // ---------- 页面路由 ----------
  window.addEventListener('popstate', () => {
    const page = document.querySelector('.page.active');
    if (page) {
      // 简单处理：返回列表页
      UI.showPage('page-list', false);
      UI.renderCapsuleList();
    }
  });

  // ---------- 初始化 ----------
  function init() {
    // 应用已保存的主题
    const settings = Storage.getSettings();
    UI.applyTheme(settings.theme);

    // 检查是否需要密码验证
    if (settings.password) {
      if (!Storage.isPasswordVerified()) {
        showPasswordLock();
      }
    }

    // 渲染列表
    UI.renderCapsuleList();

    // 绑定所有事件
    bindEvents();

    // 初始化波形 Canvas（创建页）
    const waveCanvas = document.getElementById('waveform-canvas');
    if (waveCanvas) {
      Recorder.initWaveCanvas(waveCanvas);
    }
    const largeWave = document.getElementById('waveform-large-canvas');
    if (largeWave) {
      Recorder.initWaveCanvas(largeWave);
    }

    // 设置录音回调
    Recorder.setCallbacks({
      tick: onRecordTick,
      complete: onRecordComplete,
      error: onRecordError
    });

    console.log('🌟 声昔已启动');
  }

  // ---------- 事件绑定 ----------
  function bindEvents() {
    // 页面后退按钮
    document.querySelectorAll('[data-back]').forEach(btn => {
      btn.addEventListener('click', () => {
        const currentPage = UI.getCurrentPage();
        if (currentPage === 'page-create') {
          // 离开创建页时重置录音
          Recorder.reset();
          resetCreateForm();
        }
        if (currentPage === 'page-detail') {
          UI.stopCountdown();
          if (detailPlayback) {
            detailPlayback.pause();
            detailPlayback = null;
          }
        }
        UI.goBack();
        UI.renderCapsuleList();
      });
    });

    // 创建按钮（首页 FAB）
    document.getElementById('btn-create')?.addEventListener('click', () => {
      initCreatePage();
      UI.showPage('page-create');
    });

    // 设置按钮
    document.getElementById('btn-settings')?.addEventListener('click', () => {
      UI.showPage('page-settings');
      UI.updatePasswordDesc();
    });

    // Tab 切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.getElementById(`tab-${btn.dataset.tab}`)?.classList.add('active');

        // 切换到文字时自动聚焦
        if (btn.dataset.tab === 'text') {
          document.getElementById('text-input')?.focus();
        } else {
          // 切换到声音时初始化波形
          const canvas = document.getElementById('waveform-canvas');
          if (canvas) Recorder.initWaveCanvas(canvas);
        }
      });
    });

    // 录音按钮（按下/释放）
    const recordBtn = document.getElementById('recorder-btn');
    const recorderWrapper = document.getElementById('recorder-wrapper');
    if (recordBtn) {
      // 移动端：touch 事件
      recordBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleRecordStart();
      }, { passive: false });
      recordBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleRecordStop();
      }, { passive: false });

      // PC 端：mouse 事件
      recordBtn.addEventListener('mousedown', handleRecordStart);
      recordBtn.addEventListener('mouseup', handleRecordStop);
      recordBtn.addEventListener('mouseleave', handleRecordStop);
    }

    // 重录按钮
    document.getElementById('btn-rerecord')?.addEventListener('click', () => {
      Recorder.reset();
      document.getElementById('audio-preview').style.display = 'none';
      document.getElementById('recorder-timer').textContent = '0s';
      document.getElementById('recorder-status').textContent = '按下录制';
      document.getElementById('recorder-timer').classList.remove('warning');
    });

    // 试听按钮
    document.getElementById('btn-playback')?.addEventListener('click', () => {
      const audio = Recorder.playAudio(() => {
        const playBtn = document.getElementById('btn-playback');
        if (playBtn) playBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg><span>试听</span>';
      });
      if (audio) {
        const playBtn = document.getElementById('btn-playback');
        if (playBtn) playBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg><span>暂停</span>';
        audio.addEventListener('timeupdate', () => {
          const timeEl = document.getElementById('playback-time');
          if (timeEl) timeEl.textContent = Recorder.formatTime(audio.currentTime);
        });
        audio.addEventListener('ended', () => {
          const timeEl = document.getElementById('playback-time');
          if (timeEl) {
            const dur = Recorder.getDuration();
            timeEl.textContent = Recorder.formatTime(dur);
          }
        });
      }
    });

    // 文字输入计数
    document.getElementById('text-input')?.addEventListener('input', (e) => {
      document.getElementById('text-count-current').textContent = e.target.value.length;
    });

    // 颜色选择
    document.querySelectorAll('.color-opt').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.color-opt').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
      });
    });

    // 图标选择
    document.querySelectorAll('.icon-opt').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.icon-opt').forEach(i => i.classList.remove('active'));
        el.classList.add('active');
      });
    });

    // 快捷时间选择
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // 清空自定义日期
        document.getElementById('custom-date').value = '';
      });
    });

    // 自定义日期
    document.getElementById('custom-date')?.addEventListener('change', function() {
      if (this.value) {
        document.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('active'));
      }
    });

    // 封存按钮
    document.getElementById('btn-seal')?.addEventListener('click', handleSeal);

    // 详情页大播放按钮
    document.getElementById('btn-play-large')?.addEventListener('click', handleDetailPlayback);

    // 保存回信
    document.getElementById('btn-save-reply')?.addEventListener('click', handleSaveReply);

    // 设置项
    document.getElementById('toggle-dark')?.addEventListener('change', (e) => {
      const theme = e.target.checked ? 'dark' : 'light';
      UI.applyTheme(theme);
      Storage.saveSettings({ theme });
    });

    document.getElementById('btn-set-password')?.addEventListener('click', showPasswordSetup);

    document.getElementById('btn-export')?.addEventListener('click', handleExport);

    document.getElementById('import-file')?.addEventListener('change', handleImport);

    document.getElementById('btn-year-review')?.addEventListener('click', showYearReview);

    document.getElementById('review-close')?.addEventListener('click', () => {
      document.getElementById('modal-review').style.display = 'none';
    });
    document.querySelectorAll('.modal-overlay').forEach(el => {
      el.addEventListener('click', function() {
        this.parentElement.style.display = 'none';
      });
    });

    // 密码锁键盘（解锁用）
    setupPasswordKeypad('pwd-keypad', 'pwd-dots', (pwd) => {
      const settings = Storage.getSettings();
      if (pwd === settings.password) {
        Storage.setPasswordVerified(true);
        document.getElementById('password-mask').style.display = 'none';
        UI.showToast('欢迎回来 ✨');
      } else {
        UI.showToast('密码错误');
        clearDots('pwd-dots');
      }
    });

    // 密码设置键盘
    setupPasswordKeypad('set-pwd-keypad', 'set-pwd-dots', (pwd) => {
      Storage.saveSettings({ password: pwd });
      document.getElementById('modal-password').style.display = 'none';
      UI.updatePasswordDesc();
      UI.showToast('密码已设置 🔐');
    }, true);
  }

  // ============================================================
  //  录音相关
  // ============================================================

  let isRecording = false;

  function handleRecordStart() {
    if (isRecording) {
      handleRecordStop();
      return;
    }

    const btn = document.getElementById('recorder-btn');
    const ring = document.getElementById('ripple-ring');
    const status = document.getElementById('recorder-status');

    btn.classList.add('recording');
    ring.classList.add('active');
    status.textContent = '录音中…';

    Recorder.startRecording();
    isRecording = true;
  }

  function handleRecordStop() {
    if (!isRecording) return;
    Recorder.stopRecording();
    // UI 更新在回调中做
    isRecording = false;
  }

  function onRecordTick(duration) {
    const timer = document.getElementById('recorder-timer');
    if (timer) {
      timer.textContent = `${Math.floor(duration)}s`;
      if (duration >= 50) {
        timer.classList.add('warning');
      }
    }
  }

  function onRecordComplete(result) {
    const btn = document.getElementById('recorder-btn');
    const ring = document.getElementById('ripple-ring');
    const status = document.getElementById('recorder-status');
    const preview = document.getElementById('audio-preview');
    const timer = document.getElementById('recorder-timer');

    btn.classList.remove('recording');
    ring.classList.remove('active');
    timer.classList.remove('warning');

    if (result && result.blob) {
      status.textContent = '录音完成 ✅';
      preview.style.display = 'block';
      // 绘制静态波形
      Recorder.drawStaticWaveform();
      // 更新试听时间
      const timeEl = document.getElementById('playback-time');
      if (timeEl) timeEl.textContent = Recorder.formatTime(result.duration);
    } else {
      status.textContent = '录音失败，请重试';
    }
  }

  function onRecordError(err) {
    const btn = document.getElementById('recorder-btn');
    const ring = document.getElementById('ripple-ring');
    btn.classList.remove('recording');
    ring.classList.remove('active');

    const status = document.getElementById('recorder-status');
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      status.textContent = '请允许使用麦克风权限';
      UI.showToast('需要麦克风权限才能录音 🎤');
    } else {
      status.textContent = '录音出错';
    }
    isRecording = false;
  }

  // ============================================================
  //  封存胶囊
  // ============================================================

  async function handleSeal() {
    const btn = document.getElementById('btn-seal');
    btn.classList.add('sealing');

    const type = document.querySelector('.tab-btn.active').dataset.tab;
    const coverColor = document.querySelector('.color-opt.active')?.dataset.color || '#D4733A';
    const coverIcon = document.querySelector('.icon-opt.active')?.dataset.icon || 'star';
    const aiEnabled = document.getElementById('toggle-ai').checked;

    // 计算解锁时间
    let unlockTime;
    const customDate = document.getElementById('custom-date').value;
    if (customDate) {
      unlockTime = new Date(customDate + 'T23:59:59').getTime();
    } else {
      const activeQuick = document.querySelector('.quick-btn.active');
      const months = parseInt(activeQuick?.dataset.months || '12');
      const d = new Date();
      d.setMonth(d.getMonth() + months);
      unlockTime = d.getTime();
    }

    // 标题：取文字前20字或"一段声音"
    let title = '一段声音';
    if (type === 'text') {
      const text = document.getElementById('text-input').value.trim();
      title = text.substring(0, 20) || '一段文字';
    }

    const formData = {
      type,
      title,
      voiceContent: type === 'voice' ? Recorder.getAudioBlob() : null,
      voiceDuration: Recorder.getDuration(),
      textContent: document.getElementById('text-input')?.value,
      coverColor,
      coverIcon,
      unlockTime,
      aiEnabled
    };

    const capsule = await Capsule.createCapsule(formData);

    btn.classList.remove('sealing');

    if (capsule) {
      UI.showToast('✨ 时光胶囊已封存！');
      // 重置表单
      resetCreateForm();
      Recorder.reset();
      // 跳转列表
      UI.showPage('page-list');
      UI.renderCapsuleList();
    }
  }

  /** 重置创建表单 */
  function resetCreateForm() {
    document.getElementById('text-input').value = '';
    document.getElementById('text-count-current').textContent = '0';
    document.getElementById('audio-preview').style.display = 'none';
    document.getElementById('recorder-timer').textContent = '0s';
    document.getElementById('recorder-timer').classList.remove('warning');
    document.getElementById('recorder-status').textContent = '按下录制';
    // 默认选中快捷时间
    document.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.quick-btn[data-months="12"]')?.classList.add('active');
    document.getElementById('custom-date').value = '';
    // 默认选中第一色
    document.querySelectorAll('.color-opt').forEach(c => c.classList.remove('active'));
    document.querySelector('.color-opt')?.classList.add('active');
    // 默认AI寄语开启
    document.getElementById('toggle-ai').checked = true;
  }

  /** 初始化创建页 */
  function initCreatePage() {
    // 确保波形Canvas重新初始化
    const canvas = document.getElementById('waveform-canvas');
    if (canvas) Recorder.initWaveCanvas(canvas);
    // 时间默认1年后
    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(now.getFullYear() + 1);
    // 设置日期选择器的最小值为今天
    const dateInput = document.getElementById('custom-date');
    if (dateInput) {
      dateInput.min = now.toISOString().split('T')[0];
    }
  }

  // ============================================================
  //  胶囊详情
  // ============================================================

  /** 打开胶囊详情 */
  function openCapsuleDetail(id) {
    currentDetailId = id;
    const capsule = Storage.getCapsule(id);
    if (!capsule) {
      UI.showToast('胶囊不存在');
      return;
    }

    UI.showPage('page-detail');

    const now = Date.now();
    const isLocked = now < capsule.unlockTime;

    // 更新标题
    document.getElementById('detail-title').textContent = '💊 ' + (capsule.title || '胶囊');

    // 设置胶囊大图标颜色
    const capsuleBody = document.getElementById('capsule-body');
    const capsuleTop = document.getElementById('capsule-top');
    const iconEls = document.querySelectorAll('.capsule-icon-large');
    const iconChar = UI.ICON_MAP[capsule.coverIcon] || '⭐';

    if (capsuleBody) capsuleBody.style.background = capsule.coverColor;
    if (capsuleTop) capsuleTop.style.background = capsule.coverColor;
    iconEls.forEach(el => el.textContent = iconChar);

    if (isLocked) {
      // 未锁定：显示倒计时
      document.getElementById('detail-locked').style.display = 'flex';
      document.getElementById('detail-unlocked').style.display = 'none';

      UI.startCountdown(capsule.unlockTime, {
        days: document.getElementById('cd-days'),
        hours: document.getElementById('cd-hours'),
        minutes: document.getElementById('cd-minutes'),
        seconds: document.getElementById('cd-seconds')
      });
    } else {
      // 已解锁：显示内容
      document.getElementById('detail-locked').style.display = 'none';
      document.getElementById('detail-unlocked').style.display = 'block';

      // 标记已解锁
      if (!capsule.isUnlocked) {
        Capsule.unlockCapsule(id);
        capsule.isUnlocked = true;
      }

      showUnlockedContent(capsule);
    }
  }

  /** 显示已解锁内容 */
  function showUnlockedContent(capsule) {
    // 解锁光效
    const glow = document.getElementById('unlock-glow');
    if (glow) {
      glow.style.display = 'block';
      glow.style.animation = 'none';
      requestAnimationFrame(() => {
        glow.style.animation = '';
      });
    }

    // 显示内容（带延迟的渐入动画）
    const content = document.getElementById('unlocked-content');
    if (content) {
      content.style.opacity = '0';
      setTimeout(() => {
        content.style.transition = 'opacity 0.6s ease-out';
        content.style.opacity = '1';
      }, 500);
    }

    if (capsule.type === 'voice') {
      document.getElementById('detail-voice').style.display = 'block';
      document.getElementById('detail-text').style.display = 'none';
      document.getElementById('detail-voice-content')?.remove();

      // 显示录音播放器
      if (capsule.content) {
        const url = Recorder.createUrlFromBase64(capsule.content);
        const durationEl = document.getElementById('voice-duration');
        if (durationEl) durationEl.textContent = Recorder.formatTime(capsule.duration || 0);

        // 初始化波形 Canvas
        const waveCanvas = document.getElementById('waveform-large-canvas');
        if (waveCanvas) {
          Recorder.initWaveCanvas(waveCanvas);
          // 用录音时长生成静态波形
          Recorder.drawStaticWaveform();
        }

        // 存储 url 用于播放
        document.getElementById('btn-play-large').dataset.audioUrl = url;
      }
    } else {
      document.getElementById('detail-voice').style.display = 'none';
      document.getElementById('detail-text').style.display = 'block';
      document.getElementById('detail-text-content').textContent = capsule.content || '';
    }

    // AI 寄语
    const aiSection = document.getElementById('detail-ai');
    const aiMsg = document.getElementById('detail-ai-message');
    if (capsule.aiMessage) {
      aiSection.style.display = 'flex';
      aiMsg.textContent = capsule.aiMessage;
    } else {
      aiSection.style.display = 'none';
    }

    // 创建时间
    document.getElementById('detail-create-time').textContent = `写于 ${UI.formatDate(capsule.createTime)}`;

    // 回信
    const replyInput = document.getElementById('reply-input');
    const savedReply = document.getElementById('saved-reply');
    const savedText = document.getElementById('saved-reply-text');
    if (capsule.reply) {
      replyInput.value = '';
      replyInput.style.display = 'none';
      savedReply.style.display = 'block';
      savedText.textContent = capsule.reply;
    } else {
      replyInput.value = '';
      replyInput.style.display = 'block';
      savedReply.style.display = 'none';
    }
  }

  /** 处理详情页音频播放 */
  function handleDetailPlayback() {
    const btn = document.getElementById('btn-play-large');
    const url = btn?.dataset.audioUrl;
    if (!url) return;

    if (detailPlayback && !detailPlayback.paused) {
      detailPlayback.pause();
      btn.classList.remove('playing');
      btn.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      return;
    }

    detailPlayback = new Audio(url);
    detailPlayback.play().catch(e => console.error('播放失败:', e));
    btn.classList.add('playing');
    btn.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';

    detailPlayback.addEventListener('timeupdate', () => {
      const durEl = document.getElementById('voice-duration');
      if (durEl && detailPlayback) {
        durEl.textContent = Recorder.formatTime(detailPlayback.currentTime);
      }
    });

    detailPlayback.addEventListener('ended', () => {
      btn.classList.remove('playing');
      btn.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      const durEl = document.getElementById('voice-duration');
      if (durEl) {
        durEl.textContent = Recorder.formatTime(Recorder.getDuration());
      }
    });
  }

  /** 保存回信 */
  function handleSaveReply() {
    if (!currentDetailId) return;
    const text = document.getElementById('reply-input').value;
    const saved = Capsule.saveReply(currentDetailId, text);
    if (saved) {
      document.getElementById('reply-input').style.display = 'none';
      document.getElementById('saved-reply').style.display = 'block';
      document.getElementById('saved-reply-text').textContent = text.trim();
    }
  }

  // ============================================================
  //  密码锁
  // ============================================================

  function showPasswordLock() {
    const mask = document.getElementById('password-mask');
    if (mask) mask.style.display = 'flex';
  }

  function showPasswordSetup() {
    const settings = Storage.getSettings();
    if (settings.password) {
      // 已有密码：可以清除或修改
      if (confirm('已有密码，是否清除密码？点击"确定"清除，取消后重新设置。')) {
        Storage.saveSettings({ password: null });
        UI.updatePasswordDesc();
        UI.showToast('密码已清除');
      }
      return;
    }
    document.getElementById('modal-password').style.display = 'flex';
    clearDots('set-pwd-dots');
  }

  function setupPasswordKeypad(keypadId, dotsId, onComplete, allowClear = false) {
    const keypad = document.getElementById(keypadId);
    if (!keypad) return;

    let pwd = '';

    keypad.addEventListener('click', (e) => {
      const key = e.target.dataset.key;
      if (!key) return;

      if (key === 'back') {
        pwd = pwd.slice(0, -1);
      } else if (key === 'clear') {
        pwd = '';
      } else if (pwd.length < 4) {
        pwd += key;
      }

      updateDots(dotsId, pwd.length);

      if (pwd.length === 4) {
        setTimeout(() => {
          onComplete(pwd);
          pwd = '';
          updateDots(dotsId, 0);
        }, 200);
      }
    });
  }

  function updateDots(dotsId, filled) {
    const dots = document.getElementById(dotsId);
    if (!dots) return;
    dots.querySelectorAll('span').forEach((dot, i) => {
      dot.classList.toggle('filled', i < filled);
    });
  }

  function clearDots(dotsId) {
    updateDots(dotsId, 0);
  }

  // ============================================================
  //  导入导出
  // ============================================================

  function handleExport() {
    const data = Storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `声昔备份_${UI.formatDate(Date.now()).replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    UI.showToast('数据已导出 📦');
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = Storage.importData(evt.target.result);
      if (result.success) {
        UI.showToast(`导入成功，新增 ${result.count} 个胶囊 📥`);
        UI.renderCapsuleList();
        // 重新应用主题
        const settings = Storage.getSettings();
        UI.applyTheme(settings.theme);
      } else {
        UI.showToast(`导入失败：${result.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  // ============================================================
  //  年度回顾
  // ============================================================

  function showYearReview() {
    const stats = Capsule.getYearStats();
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-unlocked').textContent = stats.unlocked;
    document.getElementById('stat-waiting').textContent = stats.waiting;

    const timeline = document.getElementById('review-timeline');
    if (stats.all.length === 0) {
      timeline.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:16px;">今年还没有胶囊</p>';
    } else {
      timeline.innerHTML = stats.all.map(cap => {
        const icon = UI.ICON_MAP[cap.coverIcon] || '⭐';
        const isLocked = Date.now() < cap.unlockTime;
        const month = UI.formatShortDate(cap.createTime);
        return `
          <div class="review-timeline-item">
            <span class="tl-month">${month}</span>
            <span class="tl-status">${isLocked ? '🔒' : '✨'}</span>
            <span class="tl-title">${cap.title || '未命名'}</span>
          </div>
        `;
      }).join('');
    }

    document.getElementById('modal-review').style.display = 'flex';
  }

  // ---------- 公开 API ----------
  return {
    init,
    openCapsuleDetail,
  };
})();

// ============================================================
//  启动
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
