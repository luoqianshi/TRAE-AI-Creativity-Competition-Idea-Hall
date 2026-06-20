// 太极智学 - 高质量 3D 人体太极模型
// 使用 Three.js 构建层级化人体，支持按招式切换姿态、平滑过渡与多角度观摩

import * as THREE from '../_shared/js/three.module.js';
import { GLTFLoader } from '../_shared/js/GLTFLoader.js';

const sceneContainer = document.getElementById('taiji-3d-container');
if (!sceneContainer) {
  console.warn('[taiji-3d] 未找到 #taiji-3d-container，3D 模型未初始化');
}

// ========== WebGL 可用性检测 ==========
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!(window.WebGLRenderingContext && gl);
  } catch (e) {
    return false;
  }
}

function showFallback(reason) {
  if (!sceneContainer) return;
  sceneContainer.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#5c4b3a;padding:1.5rem;text-align:center;font-size:1rem;line-height:1.7;background:#f7f5f0;">
      <img src="./assets/taiji-3d-preview.jpg" alt="3D 太极人物预览" style="max-width:100%;max-height:60%;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12);object-fit:contain;margin-bottom:1rem;">
      <div>无法实时渲染 3D 模型：${reason}<br>上方为模型效果预览图，建议在支持 WebGL 的浏览器（Chrome / Edge / Safari / Firefox）中打开本页。</div>
    </div>`;
}

if (sceneContainer && !isWebGLAvailable()) {
  showFallback('当前浏览器未启用 WebGL。');
}

// ========== 色板与材质参数 ==========
const COLORS = {
  skin: 0xf3d2b5,
  suit: 0x5a8f7b,
  suitDark: 0x3d6b5b,
  pants: 0x8d6e63,
  belt: 0x2f4f4f,
  joint: 0x4a4a4a,
  hair: 0x2c2c2c,
  ground: 0xd9e3dc,
  grid: 0xaac0b3,
  accent: 0xc9a227,
  line: 0x7a9e8e
};

let scene, camera, renderer, human, ground;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cameraAngle = { theta: Math.PI / 6, phi: Math.PI / 2.8 };
let cameraRadius = 6.2;
let targetPoseKey = 'wuji';
let currentPoseKey = 'wuji';
let autoRotate = true;
let lastTime = performance.now();

// 自动循环演示：把 8 个招式串成一段连续套路，招式之间平滑过渡
const poseSequence = ['wuji', 'yemafenzong', 'baiheliangchi', 'louxi_aobu', 'shouhuipipa', 'lanquewei', 'yunshou', 'danbian'];
const POSE_DURATION = 4.0;     // 每个招式持续时长（秒）
const TRANSITION = 2.0;        // 招式之间过渡时长（秒）
let isPlaying = false;
let playTime = 0;              // 全局播放时间
let currentPoseIndex = 0;      // 当前展示的招式索引

// GLB 动画模型
let gltfModel = null;
let gltfMixer = null;
let gltfAnimations = [];
let isGLBMode = false;
let gltfClipIndex = 0;

function init3D() {
  if (!sceneContainer || !isWebGLAvailable()) return;

  try {
    const width = sceneContainer.clientWidth || 640;
    const height = sceneContainer.clientHeight || 480;
    if (width === 0 || height === 0) {
      showFallback('3D 容器尺寸为 0，无法初始化渲染器。');
      return;
    }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0ede6);
    scene.fog = new THREE.Fog(0xf0ede6, 10, 35);

    camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    updateCameraPosition();

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    sceneContainer.appendChild(renderer.domElement);

    // ========== 灯光系统 ==========
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8a9a90, 0.55);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.15);
  keyLight.position.set(5, 9, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 25;
  keyLight.shadow.camera.left = -6;
  keyLight.shadow.camera.right = 6;
  keyLight.shadow.camera.top = 6;
  keyLight.shadow.camera.bottom = -6;
  keyLight.shadow.bias = -0.0005;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xcce5dd, 0.4);
  fillLight.position.set(-5, 4, -5);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xfff0d0, 0.35);
  rimLight.position.set(0, 5, -7);
  scene.add(rimLight);

  // ========== 地面与装饰 ==========
  const groundGeo = new THREE.CircleGeometry(7, 96);
  const groundMat = new THREE.MeshStandardMaterial({
    color: COLORS.ground,
    roughness: 0.92,
    metalness: 0.02
  });
  ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // 太极图案地面贴花
  const taijiGroup = new THREE.Group();
  taijiGroup.rotation.x = -Math.PI / 2;
  taijiGroup.position.y = 0.005;
  const yin = new THREE.Mesh(
    new THREE.CircleGeometry(2.2, 64, 0, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.12 })
  );
  const yang = new THREE.Mesh(
    new THREE.CircleGeometry(2.2, 64, Math.PI, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 })
  );
  taijiGroup.add(yin, yang);
  scene.add(taijiGroup);

  // 网格参考
  const gridHelper = new THREE.GridHelper(14, 28, COLORS.grid, 0xc8d8d0);
  gridHelper.position.y = 0.008;
  scene.add(gridHelper);

  // ========== 创建人体 ==========
  human = createHuman();
  scene.add(human.root);

  // ========== 交互事件 ==========
  const canvas = renderer.domElement;
  canvas.addEventListener('mousedown', e => { isDragging = true; autoRotate = false; previousMousePosition = { x: e.clientX, y: e.clientY }; });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  canvas.addEventListener('touchstart', e => { isDragging = true; autoRotate = false; previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
  canvas.addEventListener('touchend', () => { isDragging = false; });
  canvas.addEventListener('touchmove', e => { onMouseMove(e.touches[0]); }, { passive: true });

  window.addEventListener('resize', onWindowResize);

    applyPose('wuji', true);
    animate();
  } catch (err) {
    console.error('[taiji-3d] 初始化失败：', err);
    showFallback('3D 初始化出错：' + (err.message || String(err)));
  }
}

function onMouseMove(e) {
  if (!isDragging) return;
  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;
  cameraAngle.theta -= deltaX * 0.007;
  cameraAngle.phi = Math.max(0.18, Math.min(Math.PI - 0.18, cameraAngle.phi - deltaY * 0.007));
  previousMousePosition = { x: e.clientX, y: e.clientY };
  updateCameraPosition();
}

function onWheel(e) {
  e.preventDefault();
  cameraRadius = Math.max(3.2, Math.min(11, cameraRadius + e.deltaY * 0.008));
  updateCameraPosition();
}

function updateCameraPosition() {
  if (!camera) return;
  camera.position.x = cameraRadius * Math.sin(cameraAngle.phi) * Math.sin(cameraAngle.theta);
  camera.position.y = cameraRadius * Math.cos(cameraAngle.phi) + 1.15;
  camera.position.z = cameraRadius * Math.sin(cameraAngle.phi) * Math.cos(cameraAngle.theta);
  camera.lookAt(0, 1.15, 0);
}

function onWindowResize() {
  if (!sceneContainer || !camera || !renderer) return;
  const width = sceneContainer.clientWidth;
  const height = sceneContainer.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  // 缓慢自动旋转展示（仅在未播放招式循环时）
  if (autoRotate && !isDragging && !isPlaying) {
    cameraAngle.theta += 0.08 * dt;
    updateCameraPosition();
  }

  // 连续套路演示：在当前招式与下一招式之间做平滑插值
  if (isPlaying && human) {
    playTime += dt;
    const totalCycle = poseSequence.length * POSE_DURATION;
    const cycleT = playTime % totalCycle;
    const idx = Math.floor(cycleT / POSE_DURATION);
    const nextIdx = (idx + 1) % poseSequence.length;
    const localT = cycleT % POSE_DURATION;
    const alpha = Math.min(1, localT / TRANSITION);

    const poseA = pose3D[poseSequence[idx]];
    const poseB = pose3D[poseSequence[nextIdx]];
    const blended = blendPoses(poseA, poseB, alpha);
    setSkeletonFromPose(blended);

    // 同步 UI
    if (idx !== currentPoseIndex) {
      currentPoseIndex = idx;
      const currentKey = poseSequence[idx];
      updateActivePoseButton(currentKey);
      updatePoseInfoPanel(currentKey);
    }
  } else if (human && !isGLBMode) updatePoseTransition(dt);
  if (gltfMixer) gltfMixer.update(dt);
  if (renderer && scene && camera) renderer.render(scene, camera);
}

// ========== 几何体辅助函数 ==========
function hasCapsuleGeometry() {
  return typeof THREE.CapsuleGeometry !== 'undefined';
}

function createLimb(radius, length, material, name) {
  const group = new THREE.Group();
  group.name = name;

  if (hasCapsuleGeometry()) {
    const geo = new THREE.CapsuleGeometry(radius, Math.max(0.001, length - radius * 2), 8, 16);
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  } else {
    const cylinderGeo = new THREE.CylinderGeometry(radius, radius, length, 18, 1);
    const cylinder = new THREE.Mesh(cylinderGeo, material);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    group.add(cylinder);
    const sphereGeo = new THREE.SphereGeometry(radius, 18, 16);
    const top = new THREE.Mesh(sphereGeo, material);
    top.position.y = length / 2;
    top.castShadow = true;
    const bottom = new THREE.Mesh(sphereGeo, material);
    bottom.position.y = -length / 2;
    bottom.castShadow = true;
    group.add(top, bottom);
  }
  return group;
}

function createJoint(radius) {
  const geo = new THREE.SphereGeometry(radius, 18, 16);
  const mat = new THREE.MeshStandardMaterial({ color: COLORS.joint, roughness: 0.5, metalness: 0.1 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

// 扁平手掌，模拟太极掌型
function createHand(material, side) {
  const group = new THREE.Group();

  // 掌根
  const palmGeo = new THREE.BoxGeometry(0.07, 0.085, 0.018);
  const palm = new THREE.Mesh(palmGeo, material);
  palm.castShadow = true;
  group.add(palm);

  // 四指并拢
  const fingersGeo = new THREE.BoxGeometry(0.065, 0.05, 0.015);
  const fingers = new THREE.Mesh(fingersGeo, material);
  fingers.position.y = -0.055;
  fingers.castShadow = true;
  group.add(fingers);

  // 拇指
  const thumbGeo = new THREE.BoxGeometry(0.02, 0.04, 0.014);
  const thumb = new THREE.Mesh(thumbGeo, material);
  thumb.position.set(side * 0.045, -0.025, 0.005);
  thumb.rotation.z = side * 0.5;
  thumb.castShadow = true;
  group.add(thumb);

  return group;
}

function createFoot(material) {
  const group = new THREE.Group();
  // 脚掌
  const footGeo = new THREE.BoxGeometry(0.11, 0.045, 0.22);
  const foot = new THREE.Mesh(footGeo, material);
  foot.position.set(0, -0.03, 0.06);
  foot.castShadow = true;
  foot.receiveShadow = true;
  group.add(foot);
  // 鞋头
  const toeGeo = new THREE.SphereGeometry(0.055, 14, 14);
  const toe = new THREE.Mesh(toeGeo, material);
  toe.scale.set(1, 0.7, 1.4);
  toe.position.set(0, -0.03, 0.17);
  toe.castShadow = true;
  group.add(toe);
  return group;
}

function createHuman() {
  const matSkin = new THREE.MeshStandardMaterial({ color: COLORS.skin, roughness: 0.55, metalness: 0 });
  const matSuit = new THREE.MeshStandardMaterial({ color: COLORS.suit, roughness: 0.78, metalness: 0.02 });
  const matPants = new THREE.MeshStandardMaterial({ color: COLORS.pants, roughness: 0.82, metalness: 0.02 });
  const matBelt = new THREE.MeshStandardMaterial({ color: COLORS.belt, roughness: 0.55, metalness: 0.1 });

  const root = new THREE.Group();

  // 骨盆/根节点
  const hips = new THREE.Group();
  hips.position.y = 1.02;
  root.add(hips);

  // 髋骨造型
  const pelvisGeo = new THREE.CylinderGeometry(0.2, 0.18, 0.18, 18);
  const pelvis = new THREE.Mesh(pelvisGeo, matPants);
  pelvis.position.y = 0.02;
  pelvis.castShadow = true;
  hips.add(pelvis);

  // 躯干（微收胸，更自然）
  const torsoLen = 0.92;
  const torso = new THREE.Group();
  torso.position.y = 0.12;
  hips.add(torso);

  // 上身服装：上宽下略收
  const torsoGeo = new THREE.CylinderGeometry(0.2, 0.17, torsoLen, 22);
  const torsoMesh = new THREE.Mesh(torsoGeo, matSuit);
  torsoMesh.position.y = torsoLen / 2;
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  torso.add(torsoMesh);

  // 腰带
  const beltGeo = new THREE.TorusGeometry(0.185, 0.028, 10, 32);
  const belt = new THREE.Mesh(beltGeo, matBelt);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.08;
  hips.add(belt);

  // 领口
  const collarGeo = new THREE.TorusGeometry(0.12, 0.018, 8, 24);
  const collar = new THREE.Mesh(collarGeo, matBelt);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = torsoLen - 0.02;
  torso.add(collar);

  // 颈部与头部
  const neck = new THREE.Group();
  neck.position.y = torsoLen;
  torso.add(neck);
  const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.12, 14), matSkin);
  neckMesh.position.y = 0.04;
  neckMesh.castShadow = true;
  neck.add(neckMesh);

  const headGroup = new THREE.Group();
  headGroup.position.y = 0.12;
  neck.add(headGroup);

  // 头型
  const headGeo = new THREE.SphereGeometry(0.135, 28, 26);
  const head = new THREE.Mesh(headGeo, matSkin);
  head.scale.set(0.92, 1.08, 0.98);
  head.castShadow = true;
  headGroup.add(head);

  // 头发
  const hairGeo = new THREE.SphereGeometry(0.138, 28, 26, 0, Math.PI * 2, 0, Math.PI / 2.2);
  const hairMat = new THREE.MeshStandardMaterial({ color: COLORS.hair, roughness: 0.7 });
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.scale.set(0.94, 1.05, 1);
  hair.position.y = 0.01;
  headGroup.add(hair);

  // 发髻（太极常见）
  const bunGeo = new THREE.SphereGeometry(0.045, 14, 14);
  const bun = new THREE.Mesh(bunGeo, hairMat);
  bun.position.set(0, 0.13, -0.06);
  headGroup.add(bun);

  // 手臂
  function createArm(side) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.26, torsoLen - 0.1, 0);
    torso.add(shoulder);
    shoulder.add(createJoint(0.075));

    // 上臂（略宽松袖口）
    const upperArm = new THREE.Group();
    shoulder.add(upperArm);
    const upperArmLen = 0.43;
    const upperArmMesh = createLimb(0.058, upperArmLen, matSuit, 'upperArm' + side);
    upperArmMesh.position.y = -upperArmLen / 2;
    upperArm.add(upperArmMesh);

    // 袖口装饰
    const cuffGeo = new THREE.TorusGeometry(0.062, 0.012, 8, 20);
    const cuffL = new THREE.Mesh(cuffGeo, matBelt);
    cuffL.rotation.x = Math.PI / 2;
    cuffL.position.y = -upperArmLen + 0.02;
    upperArm.add(cuffL);

    const elbow = new THREE.Group();
    elbow.position.y = -upperArmLen;
    upperArm.add(elbow);
    elbow.add(createJoint(0.058));

    const lowerArmLen = 0.4;
    const lowerArm = createLimb(0.048, lowerArmLen, matSuit, 'lowerArm' + side);
    lowerArm.position.y = -lowerArmLen / 2;
    elbow.add(lowerArm);

    const wrist = new THREE.Group();
    wrist.position.y = -lowerArmLen / 2;
    lowerArm.add(wrist);

    const hand = createHand(matSkin, side);
    hand.position.y = -0.06;
    wrist.add(hand);

    return { shoulder, upperArm, elbow, lowerArm, wrist, hand };
  }

  const armL = createArm(-1);
  const armR = createArm(1);

  // 腿
  function createLeg(side) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.12, 0, 0);
    hips.add(hip);
    hip.add(createJoint(0.08));

    const thighLen = 0.56;
    const thigh = createLimb(0.078, thighLen, matPants, 'thigh' + side);
    thigh.position.y = -thighLen / 2;
    hip.add(thigh);

    const knee = new THREE.Group();
    knee.position.y = -thighLen / 2;
    thigh.add(knee);
    knee.add(createJoint(0.07));

    const calfLen = 0.56;
    const calf = createLimb(0.068, calfLen, matPants, 'calf' + side);
    calf.position.y = -calfLen / 2;
    knee.add(calf);

    // 裤脚
    const hemGeo = new THREE.CylinderGeometry(0.075, 0.085, 0.08, 16, 1, true);
    const hem = new THREE.Mesh(hemGeo, matPants);
    hem.position.y = -calfLen / 2 + 0.04;
    calf.add(hem);

    const ankle = new THREE.Group();
    ankle.position.y = -calfLen / 2;
    calf.add(ankle);

    const foot = createFoot(matSkin);
    ankle.add(foot);

    return { hip, thigh, knee, calf, ankle, foot };
  }

  const legL = createLeg(-1);
  const legR = createLeg(1);

  return { root, hips, torso, neck, headGroup, armL, armR, legL, legR, matSuit, matPants };
}

// ========== 姿态数据（以弧度表示，基于人体站立朝向 +Z） ==========
// side: -1 左，1 右
const pose3D = {
  wuji: {
    rootY: 0,
    neck: { x: 0, y: 0, z: 0 },
    shoulderL: { x: 0, y: 0, z: 0.12 },
    elbowL: { x: 0, y: 0, z: 0.18 },
    shoulderR: { x: 0, y: 0, z: -0.12 },
    elbowR: { x: 0, y: 0, z: -0.18 },
    hipL: { x: 0, y: 0, z: 0 },
    kneeL: { x: 0.03, y: 0, z: 0 },
    hipR: { x: 0, y: 0, z: 0 },
    kneeR: { x: 0.03, y: 0, z: 0 },
    hipsY: 1.02
  },
  yemafenzong: {
    // 野马分鬃：弓步，一手掤一手分
    rootY: -0.4,
    neck: { x: 0, y: -0.3, z: 0 },
    shoulderL: { x: 0.35, y: 0, z: 0.6 },
    elbowL: { x: 0.15, y: 0, z: 0.4 },
    shoulderR: { x: -0.35, y: 0.25, z: -0.45 },
    elbowR: { x: -0.15, y: 0, z: -0.65 },
    hipL: { x: -0.4, y: 0, z: 0.18 },
    kneeL: { x: 0.75, y: 0, z: 0 },
    hipR: { x: 0.18, y: 0, z: -0.08 },
    kneeR: { x: 0.05, y: 0, z: 0 },
    hipsY: 0.92
  },
  baiheliangchi: {
    // 白鹤亮翅：虚步，一手上亮一手下按
    rootY: 0.2,
    neck: { x: 0, y: 0.15, z: 0 },
    shoulderL: { x: -0.25, y: 0, z: -0.4 },
    elbowL: { x: -0.1, y: 0, z: -0.2 },
    shoulderR: { x: 0.65, y: 0.2, z: 0.25 },
    elbowR: { x: 0.2, y: 0, z: 0.15 },
    hipL: { x: -0.6, y: 0, z: 0 },
    kneeL: { x: 0.1, y: 0, z: 0 },
    hipR: { x: 0.05, y: 0, z: 0 },
    kneeR: { x: 0.05, y: 0, z: 0 },
    hipsY: 0.98
  },
  louxi_aobu: {
    // 搂膝拗步：弓步，一手搂膝一手前推
    rootY: -0.35,
    neck: { x: 0, y: -0.25, z: 0 },
    shoulderL: { x: -0.2, y: 0, z: -0.6 },
    elbowL: { x: -0.15, y: 0, z: -0.4 },
    shoulderR: { x: 0.2, y: 0, z: 0.55 },
    elbowR: { x: 0.1, y: 0, z: 0.25 },
    hipL: { x: -0.35, y: 0, z: 0.12 },
    kneeL: { x: 0.7, y: 0, z: 0 },
    hipR: { x: 0.12, y: 0, z: -0.06 },
    kneeR: { x: 0.05, y: 0, z: 0 },
    hipsY: 0.9
  },
  shouhuipipa: {
    // 手挥琵琶：虚步，双手合于身前
    rootY: 0.15,
    neck: { x: 0, y: 0.1, z: 0 },
    shoulderL: { x: 0.3, y: 0, z: 0.4 },
    elbowL: { x: 0.25, y: 0, z: 0.3 },
    shoulderR: { x: -0.3, y: 0, z: -0.3 },
    elbowR: { x: -0.15, y: 0, z: -0.2 },
    hipL: { x: -0.55, y: 0, z: 0 },
    kneeL: { x: 0.1, y: 0, z: 0 },
    hipR: { x: 0.05, y: 0, z: 0 },
    kneeR: { x: 0.05, y: 0, z: 0 },
    hipsY: 0.96
  },
  lanquewei: {
    // 揽雀尾：掤、捋、挤、按中的掤势
    rootY: -0.35,
    neck: { x: 0, y: -0.3, z: 0 },
    shoulderL: { x: 0.3, y: 0, z: 0.55 },
    elbowL: { x: 0.2, y: 0, z: 0.4 },
    shoulderR: { x: -0.3, y: 0.15, z: -0.45 },
    elbowR: { x: -0.12, y: 0, z: -0.6 },
    hipL: { x: -0.4, y: 0, z: 0.15 },
    kneeL: { x: 0.75, y: 0, z: 0 },
    hipR: { x: 0.15, y: 0, z: -0.06 },
    kneeR: { x: 0.05, y: 0, z: 0 },
    hipsY: 0.92
  },
  yunshou: {
    // 云手：马步，双手上下交错
    rootY: 0,
    neck: { x: 0, y: 0.3, z: 0 },
    shoulderL: { x: 0.2, y: 0, z: 0.45 },
    elbowL: { x: 0.15, y: 0, z: 0.25 },
    shoulderR: { x: -0.45, y: 0, z: -0.4 },
    elbowR: { x: -0.15, y: 0, z: -0.35 },
    hipL: { x: -0.25, y: 0, z: 0.25 },
    kneeL: { x: 0.45, y: 0, z: 0 },
    hipR: { x: 0.25, y: 0, z: -0.25 },
    kneeR: { x: 0.45, y: 0, z: 0 },
    hipsY: 0.88
  },
  danbian: {
    // 单鞭：弓步转腰，一手钩手一手前推
    rootY: -0.75,
    neck: { x: 0, y: -0.6, z: 0 },
    shoulderL: { x: 0.2, y: 0, z: 0.6 },
    elbowL: { x: 0.08, y: 0, z: 0.3 },
    shoulderR: { x: -0.15, y: 0.35, z: -0.6 },
    elbowR: { x: -0.08, y: 0, z: -0.25 },
    hipL: { x: -0.4, y: 0, z: 0.12 },
    kneeL: { x: 0.75, y: 0, z: 0 },
    hipR: { x: 0.15, y: 0, z: -0.06 },
    kneeR: { x: 0.05, y: 0, z: 0 },
    hipsY: 0.9
  }
};

// 当前各关节的目标欧拉角（用于平滑过渡）
let currentPose = null;
let targetPose = null;

function eulerCopy(e) {
  return new THREE.Euler(e.x, e.y, e.z, e.order);
}

function clonePose(p) {
  return {
    rootY: p.rootY,
    neck: { x: p.neck.x, y: p.neck.y, z: p.neck.z },
    shoulderL: { x: p.shoulderL.x, y: p.shoulderL.y, z: p.shoulderL.z },
    elbowL: { x: p.elbowL.x, y: p.elbowL.y, z: p.elbowL.z },
    shoulderR: { x: p.shoulderR.x, y: p.shoulderR.y, z: p.shoulderR.z },
    elbowR: { x: p.elbowR.x, y: p.elbowR.y, z: p.elbowR.z },
    hipL: { x: p.hipL.x, y: p.hipL.y, z: p.hipL.z },
    kneeL: { x: p.kneeL.x, y: p.kneeL.y, z: p.kneeL.z },
    hipR: { x: p.hipR.x, y: p.hipR.y, z: p.hipR.z },
    kneeR: { x: p.kneeR.x, y: p.kneeR.y, z: p.kneeR.z },
    hipsY: p.hipsY
  };
}

function blendPoses(a, b, t) {
  const r = clonePose(a);
  r.rootY = a.rootY + (b.rootY - a.rootY) * t;
  r.hipsY = a.hipsY + (b.hipsY - a.hipsY) * t;
  const joints = ['neck', 'shoulderL', 'elbowL', 'shoulderR', 'elbowR', 'hipL', 'kneeL', 'hipR', 'kneeR'];
  joints.forEach(k => {
    r[k].x = a[k].x + (b[k].x - a[k].x) * t;
    r[k].y = a[k].y + (b[k].y - a[k].y) * t;
    r[k].z = a[k].z + (b[k].z - a[k].z) * t;
  });
  return r;
}

function applyPose(poseKey, immediate = false) {
  if (!human) return;
  const p = pose3D[poseKey] || pose3D.wuji;
  currentPoseKey = poseKey;

  const build = {
    rootY: p.rootY,
    hipsY: p.hipsY,
    neck: eulerCopy(p.neck),
    shoulderL: eulerCopy(p.shoulderL),
    elbowL: eulerCopy(p.elbowL),
    shoulderR: eulerCopy(p.shoulderR),
    elbowR: eulerCopy(p.elbowR),
    hipL: eulerCopy(p.hipL),
    kneeL: eulerCopy(p.kneeL),
    hipR: eulerCopy(p.hipR),
    kneeR: eulerCopy(p.kneeR)
  };

  if (immediate || !currentPose) {
    currentPose = JSON.parse(JSON.stringify(build));
    targetPose = JSON.parse(JSON.stringify(build));
    setSkeletonFromPose(currentPose);
  } else {
    targetPose = JSON.parse(JSON.stringify(build));
  }

  // 更新页面呼吸提示（如果存在）
  updateBreathHint(poseKey);
}

function setSkeletonFromPose(p) {
  human.root.rotation.y = p.rootY;
  human.hips.position.y = p.hipsY;
  human.neck.rotation.copy(p.neck);
  human.armL.shoulder.rotation.copy(p.shoulderL);
  human.armL.elbow.rotation.copy(p.elbowL);
  human.armR.shoulder.rotation.copy(p.shoulderR);
  human.armR.elbow.rotation.copy(p.elbowR);
  human.legL.hip.rotation.copy(p.hipL);
  human.legL.knee.rotation.copy(p.kneeL);
  human.legR.hip.rotation.copy(p.hipR);
  human.legR.knee.rotation.copy(p.kneeR);
}

function lerpEuler(current, target, t) {
  current.x += (target.x - current.x) * t;
  current.y += (target.y - current.y) * t;
  current.z += (target.z - current.z) * t;
}

function updatePoseTransition(dt) {
  if (!currentPose || !targetPose) return;
  const speed = 4.5 * dt; // 过渡速度

  currentPose.rootY += (targetPose.rootY - currentPose.rootY) * speed;
  currentPose.hipsY += (targetPose.hipsY - currentPose.hipsY) * speed;

  lerpEuler(currentPose.neck, targetPose.neck, speed);
  lerpEuler(currentPose.shoulderL, targetPose.shoulderL, speed);
  lerpEuler(currentPose.elbowL, targetPose.elbowL, speed);
  lerpEuler(currentPose.shoulderR, targetPose.shoulderR, speed);
  lerpEuler(currentPose.elbowR, targetPose.elbowR, speed);
  lerpEuler(currentPose.hipL, targetPose.hipL, speed);
  lerpEuler(currentPose.kneeL, targetPose.kneeL, speed);
  lerpEuler(currentPose.hipR, targetPose.hipR, speed);
  lerpEuler(currentPose.kneeR, targetPose.kneeR, speed);

  setSkeletonFromPose(currentPose);
}

function updateBreathHint(poseKey) {
  const el = document.getElementById('video-breath-hint');
  if (!el || typeof window.poseData === 'undefined') return;
  const data = window.poseData[poseKey];
  if (data && data.breath) {
    el.textContent = data.breath;
  }
}

function updateActivePoseButton(poseKey) {
  const buttons = document.querySelectorAll('.pose-btn');
  buttons.forEach(btn => {
    if (btn.dataset.pose === poseKey) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

function updatePoseInfoPanel(poseKey) {
  const infoEl = document.getElementById('video-pose-info');
  if (infoEl && typeof window.poseData !== 'undefined') {
    const data = window.poseData[poseKey];
    if (data) {
      infoEl.innerHTML = '<h4>' + data.name + '</h4><p>' + data.desc + '</p>';
    }
  }
  updateBreathHint(poseKey);
  if (typeof window.updateFigure === 'function') {
    window.updateFigure(poseKey);
  }
}

window.update3DPose = function(poseKey) {
  targetPoseKey = poseKey;
  // 手动选择招式时暂停自动循环
  isPlaying = false;
  updatePlayButton();
  const idx = poseSequence.indexOf(poseKey);
  if (idx >= 0) currentPoseIndex = idx;
  applyPose(poseKey);
  updateActivePoseButton(poseKey);
};

window.toggle3DPlay = function() {
  isPlaying = !isPlaying;
  if (isPlaying) {
    autoRotate = false;
    playTime = currentPoseIndex * POSE_DURATION;
  }
  updatePlayButton();
};

function updatePlayButton() {
  const btn = document.getElementById('play-3d-btn');
  if (btn) btn.textContent = isPlaying ? '暂停演示' : '循环演示';
}

window.set3DView = function(view) {
  if (!camera) return;
  autoRotate = false;
  switch (view) {
    case 'front':
      cameraAngle = { theta: 0, phi: Math.PI / 2.4 };
      cameraRadius = 6;
      break;
    case 'back':
      cameraAngle = { theta: Math.PI, phi: Math.PI / 2.4 };
      cameraRadius = 6;
      break;
    case 'left':
      cameraAngle = { theta: -Math.PI / 2, phi: Math.PI / 2.4 };
      cameraRadius = 6;
      break;
    case 'right':
      cameraAngle = { theta: Math.PI / 2, phi: Math.PI / 2.4 };
      cameraRadius = 6;
      break;
    case 'top':
      cameraAngle = { theta: 0, phi: 0.18 };
      cameraRadius = 7.5;
      break;
  }
  updateCameraPosition();
};

// ========== GLB / FBX 动画模型加载 ==========
function clearGLBModel() {
  if (gltfModel) {
    scene.remove(gltfModel);
    gltfModel.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
        else child.material.dispose();
      }
    });
    gltfModel = null;
  }
  gltfMixer = null;
  gltfAnimations = [];
}

function loadGLBModel(url, clipIndex = 0) {
  if (!scene || !renderer) return;
  const loader = new GLTFLoader();
  loader.load(url, gltf => {
    clearGLBModel();
    gltfModel = gltf.scene;
    gltfAnimations = gltf.animations || [];

    // 调整尺寸与位置
    const box = new THREE.Box3().setFromObject(gltfModel);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 1.8 / Math.max(size.x, size.y, size.z);
    gltfModel.scale.setScalar(scale);
    gltfModel.position.set(-center.x * scale, -center.y * scale + 0.02, -center.z * scale);
    gltfModel.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(gltfModel);

    if (gltfAnimations.length > 0) {
      gltfMixer = new THREE.AnimationMixer(gltfModel);
      gltfClipIndex = Math.min(clipIndex, gltfAnimations.length - 1);
      const action = gltfMixer.clipAction(gltfAnimations[gltfClipIndex]);
      action.reset().play();
    }

    // 隐藏程序化太极模型，避免重叠
    if (human && human.root) human.root.visible = false;
    isGLBMode = true;
    updateGLBButton();
  }, undefined, err => {
    console.error('[taiji-3d] GLB 加载失败：', err);
    showFallback('GLB 动画文件加载失败：' + (err.message || String(err)));
  });
}

window.toggleGLBModel = function() {
  if (isGLBMode) {
    // 切回程序化太极模型
    clearGLBModel();
    if (human && human.root) human.root.visible = true;
    isGLBMode = false;
    updateGLBButton();
  } else {
    // 加载示例 GLB（Xbot.glb）
    loadGLBModel('./assets/Xbot.glb', 0);
  }
};

window.switchGLBAnimation = function(dir) {
  if (!isGLBMode || gltfAnimations.length === 0 || !gltfMixer) return;
  gltfClipIndex = (gltfClipIndex + dir + gltfAnimations.length) % gltfAnimations.length;
  gltfMixer.stopAllAction();
  const action = gltfMixer.clipAction(gltfAnimations[gltfClipIndex]);
  action.reset().play();
  updateGLBButton();
};

function updateGLBButton() {
  const btn = document.getElementById('glb-toggle-btn');
  if (btn) {
    btn.textContent = isGLBMode ? '返回太极模型' : '加载 GLB 动画示例';
  }
  const switchBtn = document.getElementById('glb-switch-btn');
  if (switchBtn && isGLBMode && gltfAnimations.length > 1) {
    const name = gltfAnimations[gltfClipIndex].name || ('动画 ' + (gltfClipIndex + 1));
    switchBtn.textContent = '切换动画：' + name;
    switchBtn.style.display = 'inline-block';
  } else if (switchBtn) {
    switchBtn.style.display = 'none';
  }
}

init3D();
