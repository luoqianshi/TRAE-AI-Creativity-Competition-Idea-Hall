// 动画循环模块 - 箭头可视化系统
// 核心原则：用箭头展示辐射过程，长短波有明显区别

// 缓存物理数据，避免每帧重新计算
let cachedData = null;
let lastDataUpdate = 0;
// 云层/粒子重建节流
let lastCloudRebuild = 0;
let lastParticleRebuild = 0;
// 大气层对象
let atmoShell = null;
// 地表热辐射光晕
let surfaceGlow = null;

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  controls.update();

  // 每200ms更新一次物理数据
  if (elapsed - lastDataUpdate > 0.2) {
    cachedData = calculateData();
    lastDataUpdate = elapsed;
  }
  const data = cachedData;

  // ========== 1. 云层动态响应云量 ==========
  updateCloudsDynamic(elapsed, data);

  // ========== 2. 太阳动态响应高度角+时段 ==========
  updateSunDynamic(elapsed, data);

  // ========== 3. 尘埃粒子动态响应尘埃浓度 ==========
  updateParticlesDynamic(elapsed, data);

  // ========== 4. 大气层可视化响应水汽/CO₂ ==========
  updateAtmoShellDynamic(elapsed, data);

  // ========== 5. 地表热辐射光晕响应地面温度 ==========
  updateSurfaceGlowDynamic(elapsed, data);

  // ========== 6. 箭头动画响应物理参数 ==========
  updateArrowsDynamic(elapsed, data);

  // ========== 7. 水面动画 ==========
  surfaceObjects.forEach(o => {
    if (o.userData.isWater) {
      o.position.y = 0.3 + Math.sin(elapsed*0.5)*0.1;
    }
  });

  update3DLabels();
  updateLighting();
  renderer.render(scene, camera);
}

// ========== 云层动态更新 ==========
function updateCloudsDynamic(elapsed, data) {
  // 云层动画（漂移）
  clouds.forEach(c => {
    c.position.x = c.userData.origX + Math.sin(elapsed * c.userData.speed) * 3;
  });

  // 云量变化时重建云层（节流：间隔500ms）
  const targetCloudCount = Math.max(1, Math.ceil(state.cloud / 8));
  if (Math.abs(clouds.length - targetCloudCount) > 1 && elapsed - lastCloudRebuild > 0.5) {
    createClouds();
    lastCloudRebuild = elapsed;
  }

  // 云层透明度：云量越大越不透明，夜晚略暗
  const cloudOpacity = 0.5 + (state.cloud / 100) * 0.4;
  const timeDim = { day: 1.0, dusk: 0.7, night: 0.4 }[state.time] || 1.0;
  clouds.forEach(c => {
    c.children.forEach(blob => {
      if (blob.material) {
        blob.material.opacity = cloudOpacity * timeDim;
      }
    });
  });
}

// ========== 太阳动态更新 ==========
function updateSunDynamic(elapsed, data) {
  if (!sun) return;

  const aRad = state.angle * Math.PI / 180;
  const timeMult = { day: 1.0, dusk: 0.5, night: 0.0 }[state.time] || 1.0;

  // 太阳位置：高度角决定Y，夜晚时隐藏
  sun.position.set(-32 * Math.cos(aRad), 32 * Math.sin(aRad) * timeMult + 10 * timeMult, -22);
  sun.visible = state.time !== 'night' && state.angle > 5;

  // 太阳亮度：根据到达大气上界的S归一化
  const intensity = data.S / 1361;
  // 内层光晕
  if (sun.children[0]) {
    sun.children[0].material.opacity = (0.15 + intensity * 0.25) * timeMult;
    sun.children[0].scale.setScalar(1 + intensity * 0.3);
  }
  // 外层光晕
  if (sun.children[1]) {
    sun.children[1].material.opacity = (0.05 + intensity * 0.15) * timeMult;
    sun.children[1].scale.setScalar(1 + intensity * 0.2);
  }

  // 太阳颜色：傍晚偏红
  if (state.time === 'dusk') {
    sun.material.color.setHex(0xff8844);
  } else {
    sun.material.color.setHex(0xffee44);
  }
}

// ========== 尘埃粒子动态更新 ==========
function updateParticlesDynamic(elapsed, data) {
  particles.forEach(p => {
    if (p.userData.type === 'dust') {
      // 尘埃浓度越高，粒子越多越亮
      const dustFactor = state.dust / 100;
      p.material.opacity = 0.1 + dustFactor * 0.5;
      p.material.size = 0.08 + dustFactor * 0.15;

      // 粒子缓慢飘动
      const positions = p.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(elapsed * 0.3 + i) * 0.002;
        positions[i + 1] += Math.cos(elapsed * 0.2 + i) * 0.001;
      }
      p.geometry.attributes.position.needsUpdate = true;
    }
  });
}

// ========== 大气层可视化（水汽/CO₂响应）==========
function updateAtmoShellDynamic(elapsed, data) {
  // 创建或更新大气层半透明壳
  if (!atmoShell) {
    const shellGeo = new THREE.SphereGeometry(32, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x4488cc,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    atmoShell = new THREE.Mesh(shellGeo, shellMat);
    atmoShell.position.y = -2;
    scene.add(atmoShell);
  }

  // 水汽+CO₂越高，大气层颜色越深（温室效应可视化）
  const greenhouseFactor = (state.vapor * 0.005 + state.co2 * 0.004 + state.cloud * 0.003);
  const clampedGF = Math.min(0.85, greenhouseFactor);

  // 颜色从淡蓝（洁净）到深紫（强温室）
  const r = 0.27 + clampedGF * 0.4;
  const g = 0.53 - clampedGF * 0.3;
  const b = 0.80 - clampedGF * 0.1;
  atmoShell.material.color.setRGB(r, g, b);

  // 透明度：温室气体越多越不透明
  atmoShell.material.opacity = 0.04 + clampedGF * 0.12;

  // 夜晚大气层略暗
  const timeDim = { day: 1.0, dusk: 0.7, night: 0.4 }[state.time] || 1.0;
  atmoShell.material.opacity *= timeDim;
}

// ========== 地表热辐射光晕 ==========
function updateSurfaceGlowDynamic(elapsed, data) {
  if (!terrain) return;

  // 地面温度越高，地表颜色越偏暖（模拟热辐射）
  const tempFactor = Math.min(1, Math.max(0, (data.T_ground - 10) / 30));

  // 地表基础色 + 温度偏移
  const baseColors = {
    forest: [0.30, 0.68, 0.31],
    city: [0.62, 0.62, 0.62],
    lake: [0.13, 0.59, 0.95],
    desert: [1.00, 0.76, 0.03],
    snow: [0.89, 0.95, 0.99],
    farmland: [0.55, 0.76, 0.29]
  };
  const bc = baseColors[state.surface] || [0.18, 0.35, 0.12];

  // 温度高→偏红/橙，温度低→偏蓝
  const warmR = bc[0] + tempFactor * 0.15;
  const warmG = bc[1] - tempFactor * 0.05;
  const warmB = bc[2] - tempFactor * 0.10;

  terrain.material.color.setRGB(
    Math.min(1, warmR),
    Math.max(0, warmG),
    Math.max(0, warmB)
  );

  // 夜晚地表略暗
  const timeDim = { day: 1.0, dusk: 0.6, night: 0.25 }[state.time] || 1.0;
  terrain.material.opacity = timeDim;

  // 冰雪反照率可视化：高反照率时地表更亮
  if (state.surface === 'snow') {
    terrain.material.color.setRGB(0.92 * timeDim, 0.96 * timeDim, 1.0 * timeDim);
  }
}

// ========== 箭头动态更新 ==========
function updateArrowsDynamic(elapsed, data) {
  const mode = state.mode;

  // === 太阳箭头（黄色，向下）- 短波辐射S↓ ===
  // 白天有太阳时才显示，夜晚/无太阳模式隐藏
  const showSolar = (mode==='solar' || mode==='ground' || mode==='atmosphere' || mode==='weakening' || mode==='life') && state.time !== 'night';
  solarArrows.forEach((a, i) => {
    a.visible = showSolar;
    if (showSolar) {
      // 箭头下落动画
      a.position.y = a.userData.origY - ((elapsed * a.userData.speed * 18) % 16);
      if (a.position.y < 2) a.position.y = a.userData.origY;

      // 透明度根据到达地面的短波辐射S↓动态变化
      const shortwaveIntensity = Math.min(1, data.groundSolar / 1000);
      // 沙漠无云时S↓最大，箭头最亮
      a.children.forEach(c => {
        if (c.material) {
          c.material.opacity = (0.3 + shortwaveIntensity * 0.6) + Math.sin(elapsed * 3 + i) * 0.15;
        }
      });

      // 箭头大小随辐射强度缩放
      const scale = 0.6 + shortwaveIntensity * 0.6;
      a.scale.set(scale, scale, scale);
    }
  });

  // === 反射箭头（白色，向上）- 大气削弱 ===
  const showReflect = (mode === 'weakening' || mode === 'solar' || mode === 'life');
  reflectArrows.forEach((a, i) => {
    a.visible = showReflect;
    if (showReflect) {
      a.position.y = a.userData.origY + ((elapsed * a.userData.speed * 14) % 12);
      if (a.position.y > 25) a.position.y = a.userData.origY;

      // 透明度根据大气削弱比例α动态变化
      const weakeningIntensity = data.atmoRatio / 100;
      a.children.forEach(c => {
        if (c.material) {
          c.material.opacity = (0.2 + weakeningIntensity * 0.6) + Math.sin(elapsed * 2.5 + i) * 0.15;
        }
      });

      // 箭头数量感：削弱比例高时箭头更大
      const scale = 0.5 + weakeningIntensity * 0.7;
      a.scale.set(scale, scale, scale);
    }
  });

  // === 地面箭头（橙色，向上）- 地面长波辐射R地↑ ===
  const showGround = (mode==='ground' || mode==='atmosphere' || mode==='insulation' || mode==='life');
  groundArrows.forEach((a, i) => {
    a.visible = showGround;
    if (showGround) {
      a.position.y = a.userData.origY + ((elapsed * a.userData.speed * 14) % 13);
      if (a.position.y > 14) a.position.y = a.userData.origY;

      // 透明度根据地面长波辐射R地↑动态变化
      const longwaveIntensity = Math.min(1, data.groundLW / 500);
      a.children.forEach(c => {
        if (c.material) {
          c.material.opacity = (0.3 + longwaveIntensity * 0.6) + Math.sin(elapsed * 2 + i) * 0.12;
        }
      });

      // 箭头大小随长波辐射强度缩放
      const scale = 0.5 + longwaveIntensity * 0.7;
      a.scale.set(scale, scale, scale);
    }
  });

  // === 大气箭头（紫色，向下）- 大气逆辐射R逆↓ ===
  const showAtmo = (mode==='atmosphere' || mode==='insulation' || mode==='life');
  atmoArrows.forEach((a, i) => {
    a.visible = showAtmo;
    if (showAtmo) {
      a.position.y = a.userData.origY - ((elapsed * a.userData.speed * 12) % 15);
      if (a.position.y < 2) a.position.y = a.userData.origY;

      // 透明度根据大气逆辐射R逆↓动态变化
      const insulationIntensity = Math.min(1, data.atmoIR / 300);
      a.children.forEach(c => {
        if (c.material) {
          c.material.opacity = (0.3 + insulationIntensity * 0.6) + Math.sin(elapsed * 2.5 + i) * 0.12;
        }
      });

      // 箭头大小随逆辐射强度缩放
      const scale = 0.5 + insulationIntensity * 0.7;
      a.scale.set(scale, scale, scale);
    }
  });
}

function update3DLabels() {
  const sl = document.getElementById('sceneLabel');
  const rl = document.getElementById('reflectionLabel');
  const scl = document.getElementById('scatterLabel');
  const gl = document.getElementById('groundLabel3d');
  const al = document.getElementById('atmoLabel3d');

  // 第一阶段标签
  sl.classList.toggle('show', state.mode==='solar'||state.mode==='weakening');
  if (state.mode==='solar'||state.mode==='weakening') sl.textContent = '太阳短波辐射 S↓';

  // 削弱作用标签
  rl.classList.toggle('show', state.mode==='weakening');
  scl.classList.toggle('show', state.mode==='weakening');

  // 第二阶段标签
  gl.classList.toggle('show', state.mode==='ground'||state.mode==='atmosphere'||state.mode==='insulation');
  if (gl.classList.contains('show')) { gl.style.left='62%'; gl.style.top='56%'; }

  // 第三阶段标签
  al.classList.toggle('show', state.mode==='atmosphere'||state.mode==='insulation');
  if (al.classList.contains('show')) { al.style.left='36%'; al.style.top='36%'; }
}

function updateLighting() {
  const b = { day: 1.0, dusk: 0.35, night: 0.08 }[state.time] || 1.0;
  scene.children.forEach(c => {
    if (c.isDirectionalLight) c.intensity = 1.3 * b;
    if (c.isAmbientLight) c.intensity = 0.5 * b;
  });
  const sky = { day: 0x0a0e27, dusk: 0x1a0a2e, night: 0x040410 }[state.time] || 0x0a0e27;
  scene.fog.color.set(sky);

  // 方向光颜色：傍晚偏红
  scene.children.forEach(c => {
    if (c.isDirectionalLight) {
      if (state.time === 'dusk') {
        c.color.setHex(0xff9944);
      } else {
        c.color.setHex(0xffeedd);
      }
    }
  });
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
