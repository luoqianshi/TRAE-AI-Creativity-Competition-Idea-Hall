// 全局状态管理 - 物理参数体系
const state = {
  mode: 'solar',
  angle: 50,        // 太阳高度角 → 影响太阳辐射强度S和大气路径长度
  cloud: 30,        // 云量 → 影响削弱比例α(短波)和保温系数(长波)
  dust: 20,         // 尘埃浓度 → 影响削弱比例α(短波反射/散射)
  vapor: 40,        // 水汽含量 → 影响大气吸收率β(长波吸收)
  co2: 50,          // CO₂浓度 → 影响大气吸收率β(长波吸收)
  surface: 'forest',
  time: 'day',
  musicOn: false,
  narrationOn: false,
  demoRunning: false,
  timeSlider: 50    // 时间轴滑条 (0=清晨, 50=正午, 100=深夜)
};

// 物理参数说明：
// S (太阳辐射强度): 由angle决定, S = 1361 × sin(angle)
// α (大气削弱比例): 由cloud/dust/angle决定
// β (大气吸收率):   由vapor/co2/cloud决定, 影响对地面长波辐射的吸收
// γ (向下分配比例): 由cloud决定, 大气辐射中射向地面的比例
// 地面辐射 ∝ T地⁴ (斯特藩-玻尔兹曼定律)
// 大气辐射 ∝ T气⁴ (斯特藩-玻尔兹曼定律)

// Three.js 全局变量
let scene, camera, renderer, controls;
let terrain, sun, clouds = [], surfaceObjects = [];
let solarArrows = [], groundArrows = [], atmoArrows = [], reflectArrows = [];
let particles = [];
// 粒子流系统
let solarParticles = null;   // 黄色下行粒子（太阳短波）
let groundParticles = null;  // 红色上行粒子（地面长波）
let atmoParticles = null;    // 橙色下行粒子（大气逆辐射）
let clock = new THREE.Clock();
