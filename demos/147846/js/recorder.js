/* ============================================================
   Recorder 模块 - 音频录制与波形可视化
   基于 MediaRecorder + Web Audio API
   ============================================================ */

const Recorder = (() => {
  const MAX_DURATION = 60; // 最长录音60秒

  let mediaRecorder = null;
  let audioChunks = [];
  let audioBlob = null;       // 最终录制的音频 Blob
  let audioUrl = null;       // 用于播放的 ObjectURL
  let audioContext = null;
  let analyserNode = null;
  let sourceNode = null;
  let recordingStartTime = 0;
  let recordingTimer = null;
  let isRecording = false;
  let duration = 0;
  let stream = null;
  let onTick = null;         // 录音中每秒回调
  let onComplete = null;     // 录音完成回调
  let onError = null;        // 错误回调
  let resumeTimer = null;    // 恢复录音状态计时器

  // ---------- Canvas 波形绘制 ----------
  let waveCanvas = null;
  let waveCtx = null;
  let waveAnimId = null;

  /** 初始化波形 Canvas */
  function initWaveCanvas(canvasEl) {
    waveCanvas = canvasEl;
    if (!waveCanvas) return;
    waveCtx = waveCanvas.getContext('2d');
    // 设置高 DPI
    const rect = waveCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    waveCanvas.width = rect.width * dpr;
    waveCanvas.height = rect.height * dpr;
    waveCtx.scale(dpr, dpr);
  }

  /** 绘制实时波形（录音中） */
  function drawWaveform() {
    if (!waveCtx || !analyserNode) return;

    const rect = waveCanvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteTimeDomainData(dataArray);

    waveCtx.clearRect(0, 0, w, h);
    waveCtx.lineWidth = 2;
    waveCtx.strokeStyle = '#D4733A';
    waveCtx.beginPath();

    const sliceWidth = w / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * h) / 2;
      if (i === 0) waveCtx.moveTo(x, y);
      else waveCtx.lineTo(x, y);
      x += sliceWidth;
    }
    waveCtx.lineTo(w, h / 2);
    waveCtx.stroke();

    waveAnimId = requestAnimationFrame(drawWaveform);
  }

  /** 绘制静态波形（播放/预览用） */
  function drawStaticWaveform(color) {
    if (!waveCtx) return;
    cancelAnimationFrame(waveAnimId);

    const rect = waveCanvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const barCount = 48;
    const barWidth = w / barCount;

    waveCtx.clearRect(0, 0, w, h);

    // 生成模拟波形（基于时长生成伪随机但稳定的形状）
    const seed = duration || 3;
    for (let i = 0; i < barCount; i++) {
      const normalized = Math.sin((i / barCount) * Math.PI * (seed * 0.5 + 2)) * 0.4 +
                         Math.sin((i / barCount) * Math.PI * 7) * 0.3 + 0.3;
      const barH = Math.max(4, normalized * h * 0.8);
      const x = i * barWidth + 1;
      const y = (h - barH) / 2;

      const grad = waveCtx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, color || '#D4733A');
      grad.addColorStop(1, (color || '#D4733A') + '66');
      waveCtx.fillStyle = grad;

      waveCtx.beginPath();
      waveCtx.roundRect(x, y, barWidth - 2, barH, [2, 2, 2, 2]);
      waveCtx.fill();
    }
  }

  // ---------- 录音核心 ----------

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  /** 请求麦克风权限并开始录音 */
  async function startRecording() {
    try {
      // 清理之前的 Blob URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        audioUrl = null;
      }
      audioBlob = null;
      audioChunks = [];
      duration = 0;

      stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 创建 AudioContext + Analyser
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      sourceNode = audioContext.createMediaStreamSource(stream);
      analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      sourceNode.connect(analyserNode);

      // 开始录制
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        audioBlob = new Blob(audioChunks, { type: mimeType });
        audioUrl = URL.createObjectURL(audioBlob);
        // 停止所有轨道
        stream.getTracks().forEach(t => t.stop());
        stream = null;
      };

      mediaRecorder.start();
      isRecording = true;
      recordingStartTime = Date.now();

      // 开始绘制实时波形
      drawWaveform();

      // 定时更新时长
      recordingTimer = setInterval(() => {
        const elapsed = (Date.now() - recordingStartTime) / 1000;
        duration = Math.min(elapsed, MAX_DURATION);
        if (onTick) onTick(duration);

        if (duration >= MAX_DURATION) {
          stopRecording();
        }
      }, 100);

      return true;
    } catch (err) {
      console.error('录音启动失败:', err);
      if (onError) onError(err);
      return false;
    }
  }

  /** 停止录音 */
  function stopRecording() {
    if (!isRecording || !mediaRecorder) return;
    isRecording = false;

    clearInterval(recordingTimer);
    cancelAnimationFrame(waveAnimId);

    if (mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }

    // 等 MediaRecorder 触发 onstop
    // 这里做个短暂延迟确保 blob 已生成
    const checkDone = () => {
      if (onComplete) {
        onComplete({
          blob: audioBlob,
          url: audioUrl,
          duration: Math.round(duration)
        });
      }
    };
    setTimeout(checkDone, 200);
  }

  /** 播放录音 */
  function playAudio(onEnd) {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.play().catch(e => console.error('播放失败:', e));

    // 播放时绘制活动波形
    if (waveCtx && sourceNode) {
      // 复用之前的 analyser 逻辑——实际上 playback 没有 analyser
      // 改用静态波形，但加一些跳动效果
      let playAnimId;
      const pulseWave = () => {
        drawStaticWaveform('#5A8F69');
        playAnimId = requestAnimationFrame(() => {
          setTimeout(pulseWave, 300);
        });
      };
      pulseWave();
      audio.onended = () => {
        cancelAnimationFrame(playAnimId);
        drawStaticWaveform();
        if (onEnd) onEnd();
      };
    } else {
      drawStaticWaveform();
      audio.onended = () => {
        if (onEnd) onEnd();
      };
    }
    return audio;
  }

  /** 获取当前录音音频的播放 URL */
  function getAudioUrl() {
    return audioUrl;
  }

  /** 获取录音时长（秒） */
  function getDuration() {
    return Math.round(duration);
  }

  /** 获取录音 Blob（用于保存到 localStorage） */
  function getAudioBlob() {
    return audioBlob;
  }

  /** 重置录音状态 */
  function reset() {
    stopRecording();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      audioUrl = null;
    }
    audioBlob = null;
    audioChunks = [];
    duration = 0;
    if (waveCtx) {
      waveCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
    }
    cancelAnimationFrame(waveAnimId);
  }

  /** 设置录音状态变化回调 */
  function setCallbacks({ tick, complete, error } = {}) {
    if (tick) onTick = tick;
    if (complete) onComplete = complete;
    if (error) onError = error;
  }

  /** 检查录音权限 */
  async function checkPermission() {
    try {
      // 尝试静默获取权限
      const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      testStream.getTracks().forEach(t => t.stop());
      return true;
    } catch {
      return false;
    }
  }

  // ---------- Blob 与 Base64 互转 ----------

  /** Blob 转 Base64 */
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result 为 data URL，提取 base64 部分
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /** Base64 转 Blob */
  function base64ToBlob(base64, mimeType = 'audio/webm') {
    const byteChars = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteChars.length; offset += 512) {
      const slice = byteChars.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: mimeType });
  }

  /** 根据 Base64 数据创建可播放 URL */
  function createUrlFromBase64(base64, mimeType = 'audio/webm') {
    const blob = base64ToBlob(base64, mimeType);
    return URL.createObjectURL(blob);
  }

  // ---------- 公开 API ----------
  return {
    initWaveCanvas,
    startRecording,
    stopRecording,
    playAudio,
    getAudioUrl,
    getDuration,
    getAudioBlob,
    reset,
    setCallbacks,
    checkPermission,
    blobToBase64,
    base64ToBlob,
    createUrlFromBase64,
    drawStaticWaveform,
    formatTime
  };
})();
