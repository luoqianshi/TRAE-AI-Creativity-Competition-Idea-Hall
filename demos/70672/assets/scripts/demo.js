// ============ @mediapipe/tasks-vision 入口 ============
import { HandLandmarker, FilesetResolver } from '../models/tasks_vision_main.js';

const video = document.getElementById('input-video');
const overlayCanvas = document.getElementById('overlay-canvas');
const overlayCtx = overlayCanvas.getContext('2d');
const artboardCanvas = document.getElementById('artboard-canvas');
const artboardCtx = artboardCanvas.getContext('2d');

const startCameraBtn = document.getElementById('start-camera-btn');
const stopCameraBtn = document.getElementById('stop-camera-btn');
const clearBtn = document.getElementById('clear-btn');
const beautifyBtn = document.getElementById('beautify-btn');
const undoBtn = document.getElementById('undo-btn');
const saveBtn = document.getElementById('save-btn');

const cameraStatus = document.getElementById('camera-status');
const handStatus = document.getElementById('hand-status');
const drawStatusText = document.getElementById('draw-status-text');
const trackingText = document.getElementById('tracking-text');
const outputMessage = document.getElementById('output-message');

let handLandmarker = null;
let visionResolver = null;
let mediaStream = null;
let animationId = null;
let isCameraRunning = false;
let isPinching = false;
let currentStroke = [];
let strokes = [];
let lastRenderSize = { width: 0, height: 0 };
let modelReady = false;
// 指尖平滑状态（指数移动平均）
let smoothFingerTip = null;
const FINGER_SMOOTH_ALPHA = 0.35;
// 已完成笔迹持久化（用于摄像头画面上的渐隐痕迹）
let persistedTraces = [];
let traceAge = 0;

const INK_COLOR = '#20160d';
const GOLD_COLOR = '#f0c77c';
const GUIDE_COLOR = 'rgba(240, 199, 124, 0.95)';
// 捏合灵敏度：阈值加大迟滞区间，落笔更干脆、松手不反复
const PINCH_THRESHOLD = 0.045;
const RELEASE_THRESHOLD = 0.095;

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

const setCameraStatus = (text, active = false) => {
  cameraStatus.textContent = text;
  cameraStatus.style.background = active ? 'rgba(95, 209, 166, 0.14)' : 'rgba(255, 138, 122, 0.14)';
  cameraStatus.style.color = active ? '#d9ffef' : '#ffe3dc';
  cameraStatus.style.borderColor = active ? 'rgba(95, 209, 166, 0.22)' : 'rgba(255, 138, 122, 0.2)';
};

const setHandStatus = (text, isWarning = false) => {
  handStatus.textContent = text;
  handStatus.style.background = isWarning ? 'rgba(240, 199, 124, 0.14)' : 'rgba(95, 209, 166, 0.14)';
  handStatus.style.color = isWarning ? '#f6d28a' : '#d9ffef';
  handStatus.style.borderColor = isWarning ? 'rgba(240, 199, 124, 0.22)' : 'rgba(95, 209, 166, 0.22)';
};

const setHandStatusError = (text) => {
  handStatus.textContent = text;
  handStatus.style.background = 'rgba(255, 138, 122, 0.14)';
  handStatus.style.color = '#ffe3dc';
  handStatus.style.borderColor = 'rgba(255, 138, 122, 0.2)';
};

const resizeOverlayCanvas = () => {
  const rect = overlayCanvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = window.devicePixelRatio || 1;
  overlayCanvas.width = rect.width * dpr;
  overlayCanvas.height = rect.height * dpr;
  overlayCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  lastRenderSize = { width: rect.width, height: rect.height };
};

const setupArtboard = () => {
  const { width, height } = artboardCanvas;
  artboardCtx.clearRect(0, 0, width, height);
  const gradient = artboardCtx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f0e5cf');
  gradient.addColorStop(1, '#e6d6b8');
  artboardCtx.fillStyle = gradient;
  artboardCtx.fillRect(0, 0, width, height);
  for (let i = 0; i < 18; i += 1) {
    artboardCtx.beginPath();
    artboardCtx.fillStyle = `rgba(120, 92, 38, ${Math.random() * 0.04})`;
    artboardCtx.arc(Math.random() * width, Math.random() * height, Math.random() * 2.2, 0, Math.PI * 2);
    artboardCtx.fill();
  }
};

const midpoint = (p1, p2) => ({
  x: (p1.x + p2.x) / 2,
  y: (p1.y + p2.y) / 2,
});

const smoothStroke = (stroke, passes = 2) => {
  if (stroke.length < 3) return stroke.map((point) => ({ ...point }));
  let result = stroke.map((point) => ({ ...point }));
  for (let pass = 0; pass < passes; pass += 1) {
    const next = [result[0]];
    for (let i = 1; i < result.length - 1; i += 1) {
      next.push({
        x: (result[i - 1].x + result[i].x + result[i + 1].x) / 3,
        y: (result[i - 1].y + result[i].y + result[i + 1].y) / 3,
      });
    }
    next.push(result[result.length - 1]);
    result = next;
  }
  return result;
};

const renderStrokePath = (ctx, stroke, options = {}) => {
  if (!stroke.length) return;
  const points = smoothStroke(stroke, options.passes ?? 2);
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = options.color ?? INK_COLOR;
  ctx.shadowBlur = options.shadowBlur ?? 0;
  ctx.shadowColor = options.shadowColor ?? 'transparent';
  ctx.globalAlpha = options.alpha ?? 1;
  if (points.length === 1) {
    ctx.beginPath();
    ctx.fillStyle = options.color ?? INK_COLOR;
    ctx.arc(points[0].x, points[0].y, options.lineWidth ?? 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i += 1) {
    const mid = midpoint(points[i], points[i + 1]);
    ctx.lineWidth = options.lineWidth ?? 8;
    ctx.quadraticCurveTo(points[i].x, points[i].y, mid.x, mid.y);
  }
  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
  ctx.restore();
};

const getStrokeBounds = (stroke) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  stroke.forEach((point) => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
};

const transformStrokeToArtboard = (stroke, bounds, scale, offsetX, offsetY) =>
  stroke.map((point) => ({
    x: (point.x - bounds.minX) * scale + offsetX,
    y: (point.y - bounds.minY) * scale + offsetY,
  }));

const redrawArtboard = () => {
  setupArtboard();
  if (!strokes.length) {
    outputMessage.textContent = '这里会保留你的笔迹；点击"书法美化"后将生成稳定版作品。';
    return;
  }
  const allPoints = strokes.flat();
  const bounds = getStrokeBounds(allPoints);
  const innerPadding = 90;
  const availableWidth = artboardCanvas.width - innerPadding * 2;
  const availableHeight = artboardCanvas.height - innerPadding * 2;
  const scale = Math.min(
    availableWidth / Math.max(bounds.width, 1),
    availableHeight / Math.max(bounds.height, 1)
  );
  const scaledWidth = bounds.width * scale;
  const scaledHeight = bounds.height * scale;
  const offsetX = (artboardCanvas.width - scaledWidth) / 2;
  const offsetY = (artboardCanvas.height - scaledHeight) / 2;
  strokes.forEach((stroke) => {
    const transformed = transformStrokeToArtboard(stroke, bounds, scale, offsetX, offsetY);
    renderStrokePath(artboardCtx, transformed, {
      lineWidth: 9,
      color: 'rgba(49, 33, 18, 0.95)',
      passes: 1,
    });
  });
  outputMessage.textContent = '已显示原始笔迹映射结果。点击"书法美化"可生成更有笔锋感的版本。';
};

// ========== 书法美化：带笔锋与墨韵的真实笔触渲染 ==========

// 贝塞尔平滑-插值密集采样，让轨迹更圆润
const resamplePoints = (points, targetSpacing = 6) => {
  if (points.length < 2) return points;
  const result = [points[0]];
  let accDist = 0;
  for (let i = 1; i < points.length; i += 1) {
    const d = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
    accDist += d;
    if (accDist >= targetSpacing) {
      result.push(points[i]);
      accDist = 0;
    }
  }
  if (result[result.length - 1] !== points[points.length - 1]) {
    result.push(points[points.length - 1]);
  }
  return result;
};

// 用可变线宽绘制带毛笔笔锋的一笔
const renderBrushStroke = (ctx, points) => {
  if (points.length < 2) return;
  const len = points.length;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 笔画两端加"笔锋"：起笔细尖→快速变粗→中间饱满→收笔渐细
  const headLen = Math.max(4, Math.round(len * 0.10));
  const tailStart = len - Math.max(4, Math.round(len * 0.14));
  const bodyStart = headLen;
  const bodyEnd = tailStart;

  for (let i = 0; i < len; i += 1) {
    let width;
    let alpha = 1;

    if (i < headLen) {
      // 起笔：从极细到正常（笔锋）
      const t = i / headLen;
      width = 1.8 + t * t * 10;
      alpha = 0.45 + t * 0.55;
    } else if (i >= tailStart) {
      // 收笔：从正常到极细（笔锋）
      const t = (i - tailStart) / (len - tailStart - 1);
      width = (11 - t * 9) * (1 - t * 0.35);
      alpha = 1 - t * 0.35;
    } else {
      // 笔画中段：轻微波动模拟毛笔按压变化
      const t = (i - bodyStart) / (bodyEnd - bodyStart || 1);
      width = 10 + Math.sin(t * Math.PI * 1.8) * 1.2;
      alpha = 1;
    }

    width = Math.max(width, 1);

    // 主墨迹
    ctx.beginPath();
    ctx.strokeStyle = INK_COLOR;
    ctx.lineWidth = width;
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(32, 22, 13, 0.15)';
    ctx.moveTo(points[i].x, points[i].y);
    if (i + 1 < len) {
      ctx.lineTo(points[i + 1].x, points[i + 1].y);
    }
    ctx.stroke();

    // 每间隔一点叠加微淡笔触，产生飞白/枯笔感
    if (i % 3 === 0 && i > headLen && i < tailStart) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(81, 57, 27, 0.08)';
      ctx.lineWidth = width + 4;
      ctx.globalAlpha = 0.06;
      ctx.shadowBlur = 0;
      ctx.moveTo(points[i].x, points[i].y);
      if (i + 2 < len) {
        ctx.lineTo(points[i + 2].x, points[i + 2].y);
      }
      ctx.stroke();
    }
  }

  // 墨韵晕染层：宽而淡的轨迹模拟纸面渗化
  ctx.globalAlpha = 0.07;
  ctx.shadowBlur = 0;
  for (let i = 0; i < len; i += 3) {
    const t = i / len;
    const ramp = t < 0.08 ? t / 0.08 : t > 0.92 ? (1 - t) / 0.08 : 1;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(120, 92, 38, 0.35)';
    ctx.lineWidth = 18 + ramp * 16;
    ctx.moveTo(points[i].x, points[i].y);
    if (i + 2 < len) {
      ctx.lineTo(points[i + 2].x, points[i + 2].y);
    }
    ctx.stroke();
  }

  ctx.restore();
};

const beautifyStrokes = () => {
  if (!strokes.length) {
    outputMessage.textContent = '请先完成至少一笔书写，再进行书法美化。';
    return;
  }
  setupArtboard();
  const allPoints = strokes.flat();
  const bounds = getStrokeBounds(allPoints);
  const innerPadding = 86;
  const availableWidth = artboardCanvas.width - innerPadding * 2;
  const availableHeight = artboardCanvas.height - innerPadding * 2;
  const scale = Math.min(
    availableWidth / Math.max(bounds.width, 1),
    availableHeight / Math.max(bounds.height, 1)
  );
  const scaledWidth = bounds.width * scale;
  const scaledHeight = bounds.height * scale;
  const offsetX = (artboardCanvas.width - scaledWidth) / 2;
  const offsetY = (artboardCanvas.height - scaledHeight) / 2;

  // 传统宣纸边框
  artboardCtx.save();
  artboardCtx.strokeStyle = 'rgba(166, 126, 53, 0.18)';
  artboardCtx.lineWidth = 1;
  artboardCtx.strokeRect(48, 48, artboardCanvas.width - 96, artboardCanvas.height - 96);
  artboardCtx.restore();

  // 对每一笔进行带笔锋的渲染
  strokes.forEach((stroke) => {
    const transformed = transformStrokeToArtboard(stroke, bounds, scale, offsetX, offsetY);
    const smooth = smoothStroke(transformed, 3);
    const resampled = resamplePoints(smooth);
    if (resampled.length < 2) return;
    renderBrushStroke(artboardCtx, resampled);
  });

  outputMessage.textContent = '已完成书法美化。包含笔锋起收、墨韵晕染效果。';
};

const clearWriting = () => {
  strokes = [];
  currentStroke = [];
  isPinching = false;
  isMouseDrawing = false;
  persistedTraces = [];
  traceAge = 0;
  smoothFingerTip = null;
  redrawArtboard();
  drawStatusText.textContent = '尚未开始书写';
  trackingText.textContent = isCameraRunning ? '摄像头已启动，等待手部进入画面' : '等待摄像头启动';
};

const saveArtwork = () => {
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  link.href = artboardCanvas.toDataURL('image/png');
  link.download = `air-ink-artwork-${timestamp}.png`;
  link.click();
};

const undoLastStroke = () => {
  if (!strokes.length) {
    outputMessage.textContent = '没有可以撤回的笔迹。';
    return;
  }
  strokes.pop();
  if (persistedTraces.length) {
    persistedTraces.pop();
  }
  redrawArtboard();
  outputMessage.textContent = strokes.length
    ? `已撤回上一笔，剩余 ${strokes.length} 笔。`
    : '已清空所有笔迹。';
};

// ========== 手部骨架绘制 ==========

const drawHandSkeleton = (landmarks) => {
  const w = lastRenderSize.width;
  const h = lastRenderSize.height;

  overlayCtx.save();
  overlayCtx.strokeStyle = 'rgba(255,255,255,0.14)';
  overlayCtx.lineWidth = 2;

  for (const [i, j] of HAND_CONNECTIONS) {
    const p1 = landmarks[i];
    const p2 = landmarks[j];
    const x1 = (1 - p1.x) * w;
    const y1 = p1.y * h;
    const x2 = (1 - p2.x) * w;
    const y2 = p2.y * h;
    overlayCtx.beginPath();
    overlayCtx.moveTo(x1, y1);
    overlayCtx.lineTo(x2, y2);
    overlayCtx.stroke();
  }

  // 小关节圆点
  for (const p of landmarks) {
    overlayCtx.beginPath();
    overlayCtx.fillStyle = 'rgba(255,255,255,0.12)';
    overlayCtx.arc((1 - p.x) * w, p.y * h, 3, 0, Math.PI * 2);
    overlayCtx.fill();
  }

  overlayCtx.restore();
};

const drawFingerGuide = (fingerTip, thumbTip) => {
  overlayCtx.save();
  overlayCtx.beginPath();
  overlayCtx.strokeStyle = isPinching ? 'rgba(95, 209, 166, 0.95)' : GUIDE_COLOR;
  overlayCtx.lineWidth = 3;
  overlayCtx.moveTo(fingerTip.x, fingerTip.y);
  overlayCtx.lineTo(thumbTip.x, thumbTip.y);
  overlayCtx.stroke();

  overlayCtx.beginPath();
  overlayCtx.fillStyle = isPinching ? 'rgba(95, 209, 166, 0.95)' : GUIDE_COLOR;
  overlayCtx.arc(fingerTip.x, fingerTip.y, 7, 0, Math.PI * 2);
  overlayCtx.fill();

  overlayCtx.beginPath();
  overlayCtx.fillStyle = 'rgba(255,255,255,0.95)';
  overlayCtx.arc(thumbTip.x, thumbTip.y, 5, 0, Math.PI * 2);
  overlayCtx.fill();
  overlayCtx.restore();
};

// ========== 笔迹管理 ==========

const addPointToCurrentStroke = (point) => {
  const previous = currentStroke[currentStroke.length - 1];
  if (previous) {
    const distance = Math.hypot(previous.x - point.x, previous.y - point.y);
    if (distance < 3) return;
  }
  currentStroke.push(point);
};

const finalizeCurrentStroke = () => {
  if (currentStroke.length > 1) {
    strokes.push([...currentStroke]);
    // 加入渐隐痕迹
    persistedTraces.push({
      points: [...currentStroke],
      age: 0,
    });
    redrawArtboard();
  }
  currentStroke = [];
};

// ========== 追踪处理（tasks-vision 新版） ==========

const handleResults = (results) => {
  overlayCtx.clearRect(0, 0, lastRenderSize.width, lastRenderSize.height);

  // 绘制已完成笔迹的渐隐痕迹（黑→深灰渐变透明）
  traceAge += 1;
  const expiredTraces = [];
  for (let t = 0; t < persistedTraces.length; t += 1) {
    const trace = persistedTraces[t];
    const life = trace.age / 120; // 约 2 秒完全淡出（60fps）
    if (life > 1) {
      expiredTraces.push(t);
      continue;
    }
    const alpha = 1 - life;
    const grayVal = Math.round(20 + life * 100);
    renderStrokePath(overlayCtx, trace.points, {
      lineWidth: 6,
      color: `rgba(${grayVal}, ${grayVal}, ${grayVal}, ${alpha * 0.55})`,
      shadowBlur: 0,
      passes: 1,
    });
    trace.age += 1;
  }
  // 移除已完全淡出的痕迹
  for (let i = expiredTraces.length - 1; i >= 0; i -= 1) {
    persistedTraces.splice(expiredTraces[i], 1);
  }

  if (!results.landmarks || !results.landmarks.length) {
    if (modelReady) {
      setHandStatus('未检测到手');
      drawStatusText.textContent = '手部离开画面';
      trackingText.textContent = '请将单手放入画面中，并保持食指与拇指可见';
    }
    if (isPinching) {
      isPinching = false;
      finalizeCurrentStroke();
    }
    return;
  }

  if (!modelReady) {
    modelReady = true;
    setHandStatus('已识别手部');
  }

  setHandStatus('已识别手部');
  trackingText.textContent = '手部追踪中，捏合开始落笔，松开结束';

  const landmarks = results.landmarks[0];
  const fingerTipRaw = landmarks[8];
  const thumbTipRaw = landmarks[4];

  // 镜头镜像：x 翻转
  const rawFingerTip = {
    x: (1 - fingerTipRaw.x) * lastRenderSize.width,
    y: fingerTipRaw.y * lastRenderSize.height,
  };

  // 指数移动平均平滑：消除指尖抖动
  if (!smoothFingerTip) {
    smoothFingerTip = { ...rawFingerTip };
  } else {
    smoothFingerTip.x += (rawFingerTip.x - smoothFingerTip.x) * FINGER_SMOOTH_ALPHA;
    smoothFingerTip.y += (rawFingerTip.y - smoothFingerTip.y) * FINGER_SMOOTH_ALPHA;
  }

  const fingerTip = { ...smoothFingerTip };
  const thumbTip = {
    x: (1 - thumbTipRaw.x) * lastRenderSize.width,
    y: thumbTipRaw.y * lastRenderSize.height,
  };

  const pinchDistance = Math.hypot(
    fingerTipRaw.x - thumbTipRaw.x,
    fingerTipRaw.y - thumbTipRaw.y
  );
  const nextPinching = isPinching
    ? pinchDistance < RELEASE_THRESHOLD
    : pinchDistance < PINCH_THRESHOLD;

  if (nextPinching) {
    isPinching = true;
    drawStatusText.textContent = '正在书写';
    addPointToCurrentStroke(fingerTip);
  } else {
    if (isPinching) {
      finalizeCurrentStroke();
    }
    isPinching = false;
    drawStatusText.textContent = strokes.length ? '已停笔，可继续下一笔' : '检测到手部，等待捏合落笔';
  }

  // 绘制骨架与指示点
  drawHandSkeleton(landmarks);
  drawFingerGuide(fingerTip, thumbTip);

  // 当前笔迹
  if (currentStroke.length > 1) {
    renderStrokePath(overlayCtx, currentStroke, {
      lineWidth: 8,
      color: 'rgba(240, 199, 124, 0.95)',
      shadowBlur: 16,
      shadowColor: 'rgba(240, 199, 124, 0.28)',
      passes: 1,
    });
  }
};

// ========== 摄像头开关 ==========

const stopCamera = () => {
  stopMediaStream();
  isCameraRunning = false;
  modelReady = false;
  smoothFingerTip = null;
  initPromise = null;
  if (handLandmarker) {
    handLandmarker.close();
    handLandmarker = null;
  }
  if (visionResolver) {
    visionResolver = null;
  }
  overlayCtx.clearRect(0, 0, lastRenderSize.width, lastRenderSize.height);
  startCameraBtn.disabled = false;
  startCameraBtn.innerHTML = '<i class="fa-solid fa-camera"></i> 启动摄像头';
  stopCameraBtn.style.display = 'none';
  setCameraStatus('已关闭', false);
  handStatus.textContent = '已关闭';
  handStatus.style.background = 'rgba(255,255,255,0.06)';
  handStatus.style.color = 'rgba(255,255,255,0.84)';
  handStatus.style.borderColor = 'rgba(255,255,255,0.08)';
  trackingText.textContent = '摄像头已关闭，可直接用鼠标绘图';
};

// ========== 初始化 HandLandmarker（tasks-vision） ==========

let initPromise = null;

const initHandLandmarker = async () => {
  if (handLandmarker) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    setHandStatus('正在加载 AI 模型...', true);
    trackingText.textContent = 'MediaPipe 推理引擎加载中（约 3-8 秒）...';
    outputMessage.textContent = '使用 CPU 推理模式，跨浏览器兼容。无需 GPU 加速器。';

    const wasmBase = './assets/models/';
    try {
      visionResolver = await FilesetResolver.forVisionTasks(wasmBase);
    } catch (loadErr) {
      setHandStatusError('模型引擎加载失败');
      throw new Error('FilesetResolver 加载失败: ' + loadErr.message);
    }

    try {
      handLandmarker = await HandLandmarker.createFromOptions(visionResolver, {
        baseOptions: {
          modelAssetPath: './assets/models/hand_landmarker.task',
          delegate: 'CPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
      });
    } catch (modelErr) {
      setHandStatusError('模型加载失败');
      visionResolver = null;
      throw new Error('HandLandmarker 创建失败: ' + modelErr.message);
    }

    modelReady = false;
    setHandStatus('模型加载完成', false);
    trackingText.textContent = '摄像头已启动，请将单手放入画面';
  })();

  return initPromise;
};

// ========== 摄像头与帧循环 ==========

const stopMediaStream = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  if (video) {
    video.srcObject = null;
  }
};

const startCamera = async () => {
  if (isCameraRunning) return;

  try {
    resizeOverlayCanvas();
    clearWriting();

    // 先初始化 HandLandmarker
    await initHandLandmarker();

    // 启动摄像头
    const constraints = {
      video: { width: { ideal: 960 }, height: { ideal: 600 }, facingMode: 'user' },
      audio: false,
    };

    mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = mediaStream;
    await video.play();

    isCameraRunning = true;
    setCameraStatus('摄像头已启动', true);
    startCameraBtn.disabled = true;
    startCameraBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> 摄像头运行中';
    stopCameraBtn.style.display = '';
    trackingText.textContent = '手部追踪运行中，捏合开始落笔';

    // 帧循环
    const frameLoop = () => {
      if (!isCameraRunning || !handLandmarker) {
        animationId = null;
        return;
      }
      try {
        const results = handLandmarker.detectForVideo(video, performance.now());
        handleResults(results);
      } catch (_) {
        // 帧处理失败，继续下一帧
      }
      animationId = requestAnimationFrame(frameLoop);
    };
    animationId = requestAnimationFrame(frameLoop);
  } catch (error) {
    console.error(error);
    setCameraStatus('摄像头启动失败', false);
    setHandStatusError('无法启动');
    stopMediaStream();
    initPromise = null;

    if (error.message && error.message.includes('HandLandmarker')) {
      trackingText.textContent = 'AI 模型初始化失败。请用 Chrome 打开重试，或直接用鼠标绘图。';
      outputMessage.textContent = error.message;
    } else {
      trackingText.textContent = '无法访问摄像头。你可以直接用鼠标或手指在书写区绘图体验。';
      outputMessage.textContent = '摄像头不可用，已自动切换到鼠标/触摸绘图模式。';
    }

    startCameraBtn.disabled = false;
    startCameraBtn.innerHTML = '<i class="fa-solid fa-camera"></i> 重试摄像头';
    stopCameraBtn.style.display = 'none';
    isCameraRunning = false;
  }
};

// ========== 鼠标/触摸回落绘图 ==========

let isMouseDrawing = false;
let mouseStroke = [];

const getPointerPos = (event) => {
  const rect = overlayCanvas.getBoundingClientRect();
  const clientX = event.clientX ?? event.touches?.[0]?.clientX ?? 0;
  const clientY = event.clientY ?? event.touches?.[0]?.clientY ?? 0;
  return { x: clientX - rect.left, y: clientY - rect.top };
};

const startPointerDraw = (pos) => {
  if (!isCameraRunning) {
    isMouseDrawing = true;
    mouseStroke = [pos];
    currentStroke = [pos];
    drawStatusText.textContent = '正在书写（鼠标模式）';
    trackingText.textContent = '鼠标正在绘制中';
  }
};

const movePointerDraw = (pos) => {
  if (!isMouseDrawing || !mouseStroke.length) return;
  mouseStroke.push(pos);
  currentStroke = [...mouseStroke];
  overlayCtx.clearRect(0, 0, lastRenderSize.width, lastRenderSize.height);
  renderStrokePath(overlayCtx, currentStroke, {
    lineWidth: 8,
    color: 'rgba(240, 199, 124, 0.95)',
    shadowBlur: 16,
    shadowColor: 'rgba(240, 199, 124, 0.28)',
    passes: 1,
  });
};

const endPointerDraw = () => {
  if (!isMouseDrawing) return;
  isMouseDrawing = false;
  if (mouseStroke.length > 1) {
    strokes.push([...mouseStroke]);
    redrawArtboard();
  }
  mouseStroke = [];
  currentStroke = [];
  overlayCtx.clearRect(0, 0, lastRenderSize.width, lastRenderSize.height);
  drawStatusText.textContent = strokes.length ? '已停笔（鼠标模式）' : '尚未开始书写';
};

overlayCanvas.addEventListener('mousedown', (e) => startPointerDraw(getPointerPos(e)));
overlayCanvas.addEventListener('mousemove', (e) => {
  if (isMouseDrawing) movePointerDraw(getPointerPos(e));
});
overlayCanvas.addEventListener('mouseup', endPointerDraw);
overlayCanvas.addEventListener('mouseleave', () => {
  if (isMouseDrawing) endPointerDraw();
});

overlayCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); startPointerDraw(getPointerPos(e)); }, { passive: false });
overlayCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (isMouseDrawing) movePointerDraw(getPointerPos(e)); }, { passive: false });
overlayCanvas.addEventListener('touchend', (e) => { e.preventDefault(); endPointerDraw(); });

// ========== 事件绑定 ==========

startCameraBtn.addEventListener('click', startCamera);
stopCameraBtn.addEventListener('click', stopCamera);
clearBtn.addEventListener('click', clearWriting);
beautifyBtn.addEventListener('click', beautifyStrokes);
undoBtn.addEventListener('click', undoLastStroke);
saveBtn.addEventListener('click', saveArtwork);
window.addEventListener('resize', resizeOverlayCanvas);

setupArtboard();
resizeOverlayCanvas();
