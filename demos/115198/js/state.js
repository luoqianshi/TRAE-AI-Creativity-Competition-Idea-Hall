//状态管理 - 所有模拟状态变量集中在此

const State = {
  // Canvas
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  centerX: 0,
  centerY: 0,

  // 视图
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  lastMouseX: 0,
  lastMouseY: 0,

  // 天体
  bodies: [],
  stars: [],
  initialBodies: [],

  // 运行状态
  isRunning: false,
  simulationTime: 0,

  // 参数
  speed: 1,
  G: 500,
  dt: 0.01,
  softening: 20,
  trailMaxLength: 5000,

  // 显示选项
  showTrail: true,
  trailMode: "partial",
  trailDuration: 10,
  showVelocity: false,
  showBodyNames: false,

  // 选中/跟踪
  selectedBodyIndex: -1,
  trackingBodyIndex: -1,

  // 交互
  isDraggingBody: false,
  draggedBodyIndex: -1,
  isPanning: false,

  // 颜色
  bodyColors: [
    "#ff6b6b",
    "#ffd93d",
    "#6bcb77",
    "#4ecdc4",
    "#a78bfa",
    "#fb923c",
    "#f472b6",
  ],

  // FPS
  lastTime: performance.now(),
  frameCount: 0,
  fps: 60,

  // 触摸
  touchStartDist: 0,
  touchStartScale: 1,
};
