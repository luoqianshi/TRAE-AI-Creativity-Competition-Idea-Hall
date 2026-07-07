/**
 * 片刻 Pianke Demo — 摄像头模块
 * 负责相机预览、拍照、前后摄像头切换
 */
window.PKCamera = (function () {
  let stream = null;
  let videoEl = null;
  let facingMode = 'environment'; // 后置优先
  let ready = false;
  let mediaRecorder = null;
  let recordedChunks = [];

  // 初始化相机
  async function init(video) {
    videoEl = video;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('UNSUPPORTED');
    }
    await start();
    ready = true;
  }

  // 启动视频流
  async function start() {
    stop();
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1080 },
          height: { ideal: 1920 }
        },
        audio: false
      });
      if (videoEl) {
        videoEl.srcObject = stream;
        await videoEl.play().catch(() => {});
      }
    } catch (err) {
      // 回退到前置
      if (facingMode === 'environment') {
        facingMode = 'user';
        return start();
      }
      throw err;
    }
  }

  // 停止视频流
  function stop() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
    if (videoEl) videoEl.srcObject = null;
  }

  // 切换前后摄像头
  async function flip() {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    await start();
  }

  // 拍照：截取当前视频帧为 dataURL（不烘焙滤镜，由 CSS 实时应用）
  function capture() {
    if (!videoEl || !videoEl.videoWidth) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const ctx = canvas.getContext('2d');

    // 前置摄像头镜像翻转
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    let dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    // 超过 2MB 降级压缩
    if (dataUrl.length > 2 * 1024 * 1024) {
      dataUrl = canvas.toDataURL('image/jpeg', 0.55);
    }
    return dataUrl;
  }

  function isReady() { return ready; }
  function getFacingMode() { return facingMode; }

  // 开始录制视频
  function startRecording() {
    if (!stream) return false;
    recordedChunks = [];
    try {
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
    } catch (e) {
      // 降级到 vp8
      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });
      } catch (e2) {
        mediaRecorder = new MediaRecorder(stream);
      }
    }
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };
    mediaRecorder.start(100); // 每100ms收集一次数据
    return true;
  }

  // 停止录制并返回视频 URL
  function stopRecording() {
    return new Promise((resolve) => {
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        recordedChunks = [];
        mediaRecorder = null;
        resolve(url);
      };
      mediaRecorder.stop();
    });
  }

  return { init, start, stop, flip, capture, isReady, getFacingMode, startRecording, stopRecording };
})();
