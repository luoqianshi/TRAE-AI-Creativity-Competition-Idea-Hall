// 主入口 - 初始化、动画循环、事件绑定

function randomBodies() {
  const count = State.bodies.length > 0 ? State.bodies.length : 3;
  const oldNames = State.bodies.map((b) => b.name);
  const oldColors = State.bodies.map((b) => b.color);
  State.bodies = [];
  const baseMass = 1000;

  let massMin = parseNumber(
    document.getElementById("massMinInput")?.value,
    500,
    0.001,
    1e6,
  );
  let massMax = parseNumber(
    document.getElementById("massMaxInput")?.value,
    1500,
    0.001,
    1e6,
  );
  if (massMin > massMax) [massMin, massMax] = [massMax, massMin];

  let speedMin = parseNumber(
    document.getElementById("speedMinInput")?.value,
    0.5,
    0,
    1000,
  );
  let speedMax = parseNumber(
    document.getElementById("speedMaxInput")?.value,
    1.3,
    0,
    1000,
  );
  if (speedMin > speedMax) [speedMin, speedMax] = [speedMax, speedMin];

  const posRange = parseNumber(
    document.getElementById("posRangeInput")?.value,
    200,
    1,
    10000,
  );

  for (let i = 0; i < count; i++) {
    const angle =
      ((Math.PI * 2) / count) * i + Math.random() * 0.5 - 0.25;
    const dist = posRange * (0.5 + Math.random() * 0.5);
    const mass = massMin + Math.random() * (massMax - massMin);
    const speed = speedMin + Math.random() * (speedMax - speedMin);
    const velAngle = angle + Math.PI / 2 + (Math.random() - 0.5) * 0.6;

    State.bodies.push({
      name: oldNames[i] || "天体" + (i + 1),
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      vx: Math.cos(velAngle) * speed,
      vy: Math.sin(velAngle) * speed,
      mass: mass,
      radius: 8 + Math.pow(mass / baseMass, 0.4) * 8,
      color: oldColors[i] || State.bodyColors[i % State.bodyColors.length],
      trail: [],
    });
  }

  let totalMomentumX = 0,
    totalMomentumY = 0,
    totalMass = 0;
  for (const b of State.bodies) {
    totalMomentumX += b.vx * b.mass;
    totalMomentumY += b.vy * b.mass;
    totalMass += b.mass;
  }
  for (const b of State.bodies) {
    b.vx -= totalMomentumX / totalMass;
    b.vy -= totalMomentumY / totalMass;
  }

  State.simulationTime = 0;
  State.selectedBodyIndex = -1;
  State.trackingBodyIndex = -1;
  State.isRunning = false;
  State.offsetX = 0;
  State.offsetY = 0;
  State.scale = 1;
  State.initialBodies = State.bodies.map((b) => ({ ...b, trail: [] }));
  const playBtn = document.getElementById("playBtn");
  if (playBtn) {
    playBtn.textContent = "开始";
    playBtn.classList.add("primary");
  }
  updateBodyPanel();
  renderBodyList();
}

function reset() {
  State.bodies = State.initialBodies.map((b) => ({ ...b, trail: [] }));
  State.simulationTime = 0;
  State.selectedBodyIndex = -1;
  State.trackingBodyIndex = -1;
  State.isRunning = false;
  State.offsetX = 0;
  State.offsetY = 0;
  State.scale = 1;
  const playBtn = document.getElementById("playBtn");
  if (playBtn) {
    playBtn.textContent = "开始";
    playBtn.classList.add("primary");
  }
  if (document.getElementById("bodyList")) {
    updateBodyPanel();
  }
  setControlsEnabled(true);
}

function resize() {
  State.width = State.canvas.width = window.innerWidth;
  State.height = State.canvas.height = window.innerHeight;
  State.centerX = State.width / 2;
  State.centerY = State.height / 2;
  generateStars();
}

function updateTrailControlsVisibility() {
  const modeRow = document.getElementById("trailModeRow");
  const durRow = document.getElementById("trailDurationRow");
  if (!State.showTrail) {
    modeRow.style.display = "none";
    durRow.style.display = "none";
  } else {
    modeRow.style.display = "";
    durRow.style.display = State.trailMode === "partial" ? "" : "none";
  }
}

function animate() {
  State.ctx.fillStyle = "#0a0a1a";
  State.ctx.fillRect(0, 0, State.width, State.height);

  drawStars();

  if (State.isRunning) {
    const steps = Math.max(1, Math.floor(State.speed * 3));
    for (let i = 0; i < steps; i++) {
      updatePhysics();
    }
  }

  if (State.trackingBodyIndex >= 0 && State.bodies[State.trackingBodyIndex]) {
    const body = State.bodies[State.trackingBodyIndex];
    State.offsetX = -body.x;
    State.offsetY = -body.y;
  }

  drawTrails();
  drawBodies();

  State.frameCount++;
  const now = performance.now();
  if (now - State.lastTime >= 500) {
    State.fps = Math.round((State.frameCount * 1000) / (now - State.lastTime));
    State.frameCount = 0;
    State.lastTime = now;
    document.getElementById("fpsDisplay").textContent = State.fps;
  }

  document.getElementById("timeDisplay").textContent =
    State.simulationTime.toFixed(2);

  if (State.isRunning) {
    const body = State.bodies[State.selectedBodyIndex];
    if (body) {
      const speedVal = Math.sqrt(body.vx * body.vx + body.vy * body.vy);
      document.getElementById("bodySpeedInput").value = speedVal.toFixed(2);

      let angle = (Math.atan2(body.vy, body.vx) * 180) / Math.PI;
      if (angle < 0) angle += 360;
      document.getElementById("bodyAngleInput").value = Math.round(angle);
    }
  }

  requestAnimationFrame(animate);
}

// 事件绑定
function bindEvents() {
  const canvas = State.canvas;
  const playBtn = document.getElementById("playBtn");
  const resetBtn = document.getElementById("resetBtn");
  const randomBtn = document.getElementById("randomBtn");
  const speedInput = document.getElementById("speedInput");
  const trailToggle = document.getElementById("trailToggle");
  const velocityToggle = document.getElementById("velocityToggle");

  // 播放/暂停
  playBtn.addEventListener("click", function () {
    State.isRunning = !State.isRunning;
    playBtn.textContent = State.isRunning ? "暂停" : "开始";
    playBtn.classList.toggle("primary", !State.isRunning);
    if (State.isRunning) {
      if (State.simulationTime === 0) {
        State.selectedBodyIndex = -1;
        State.trackingBodyIndex = -1;
        updateBodyPanel();
      }
    } else {
      setControlsEnabled(false);
    }
    renderBodyList();
  });

  // 重置
  resetBtn.addEventListener("click", reset);

  // 随机生成
  randomBtn.addEventListener("click", randomBodies);

  // 模拟速度
  speedInput.addEventListener("change", function () {
    const val = parseNumber(this.value, 1, 0.01, 1000);
    State.speed = val;
    this.value = val.toFixed(1);
  });

  // 高级设置折叠
  const advancedToggle = document.getElementById("advancedToggle");
  advancedToggle.addEventListener("click", function () {
    this.classList.toggle("active");
  });

  // 高级设置参数
  const massMinInput = document.getElementById("massMinInput");
  const massMaxInput = document.getElementById("massMaxInput");
  const speedMinInput = document.getElementById("speedMinInput");
  const speedMaxInput = document.getElementById("speedMaxInput");
  const posRangeInput = document.getElementById("posRangeInput");

  massMinInput.addEventListener("change", function () {
    const minVal = parseNumber(this.value, 500, 0.001, 1e6);
    const maxVal = parseNumber(massMaxInput.value, 1500, 0.001, 1e6);
    const finalMin = Math.min(minVal, maxVal);
    this.value = Math.round(finalMin * 1000) / 1000;
  });

  massMaxInput.addEventListener("change", function () {
    const minVal = parseNumber(massMinInput.value, 500, 0.001, 1e6);
    const maxVal = parseNumber(this.value, 1500, 0.001, 1e6);
    const finalMax = Math.max(minVal, maxVal);
    this.value = Math.round(finalMax * 1000) / 1000;
  });

  speedMinInput.addEventListener("change", function () {
    const minVal = parseNumber(this.value, 0.5, 0, 1000);
    const maxVal = parseNumber(speedMaxInput.value, 1.3, 0, 1000);
    const finalMin = Math.min(minVal, maxVal);
    this.value = finalMin.toFixed(2);
  });

  speedMaxInput.addEventListener("change", function () {
    const minVal = parseNumber(speedMinInput.value, 0.5, 0, 1000);
    const maxVal = parseNumber(this.value, 1.3, 0, 1000);
    const finalMax = Math.max(minVal, maxVal);
    this.value = finalMax.toFixed(2);
  });

  posRangeInput.addEventListener("change", function () {
    const val = parseNumber(this.value, 200, 1, 10000);
    this.value = Math.round(val);
  });

  document
    .getElementById("gravityInput")
    .addEventListener("change", function () {
      if (State.simulationTime !== 0) {
        this.value = Math.round(State.G);
        return;
      }
      const val = parseNumber(this.value, 500, 1, 100000);
      State.G = val;
      this.value = Math.round(val);
    });

  // 显示选项
  velocityToggle.addEventListener("click", function () {
    State.showVelocity = !State.showVelocity;
    this.classList.toggle("active", State.showVelocity);
  });

  document
    .getElementById("bodyNameToggle")
    .addEventListener("click", function () {
      State.showBodyNames = !State.showBodyNames;
      this.classList.toggle("active", State.showBodyNames);
    });

  trailToggle.addEventListener("click", function () {
    State.showTrail = !State.showTrail;
    this.classList.toggle("active", State.showTrail);
    if (!State.showTrail) {
      for (const body of State.bodies) {
        body.trail = [];
      }
    }
    updateTrailControlsVisibility();
  });

  const trailRadios = document.querySelectorAll('input[name="trailMode"]');
  trailRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      State.trailMode = this.value;
      updateTrailControlsVisibility();
    });
  });

  document
    .getElementById("trailDurationInput")
    .addEventListener("change", function () {
      const val = parseNumber(this.value, 10, 1, 10000);
      State.trailDuration = val;
      this.value = Math.round(val);
    });

  // 天体属性编辑
  document
    .getElementById("bodyNameInput")
    .addEventListener("change", function () {
      const body = State.bodies[State.selectedBodyIndex];
      if (!body) return;
      const val = this.value.trim() || body.name;
      body.name = val;
      this.value = val;
      renderBodyList();
      saveInitialBodies();
    });

  document
    .getElementById("bodyColor")
    .addEventListener("input", function () {
      if (State.bodies[State.selectedBodyIndex]) {
        State.bodies[State.selectedBodyIndex].color = this.value;
        renderBodyList();
        saveInitialBodies();
      }
    });

  document
    .getElementById("bodyMassInput")
    .addEventListener("change", function () {
      const body = State.bodies[State.selectedBodyIndex];
      if (!body) return;
      const val = parseNumber(this.value, 1000, 0.001, 1e6);
      const baseMass = 1000;
      body.mass = val;
      body.radius = 8 + Math.pow(body.mass / baseMass, 0.4) * 8;
      this.value = Math.round(val * 1000) / 1000;
      saveInitialBodies();
    });

  document
    .getElementById("bodySpeedInput")
    .addEventListener("change", function () {
      const body = State.bodies[State.selectedBodyIndex];
      if (!body) return;
      const val = parseNumber(this.value, 1, 0, 1000);
      const currentAngle = Math.atan2(body.vy, body.vx);
      body.vx = Math.cos(currentAngle) * val;
      body.vy = Math.sin(currentAngle) * val;
      this.value = val.toFixed(2);
      saveInitialBodies();
    });

  document
    .getElementById("bodyAngleInput")
    .addEventListener("change", function () {
      const body = State.bodies[State.selectedBodyIndex];
      if (!body) return;
      const raw = parseFloat(this.value);
      if (isNaN(raw) || !isFinite(raw)) {
        const currentAngle =
          (Math.atan2(body.vy, body.vx) * 180) / Math.PI;
        this.value = Math.round(
          currentAngle < 0 ? currentAngle + 360 : currentAngle,
        );
        return;
      }
      let val = raw;
      while (val < 0) val += 360;
      while (val >= 360) val -= 360;
      const angle = (val * Math.PI) / 180;
      const currentSpeed = Math.sqrt(
        body.vx * body.vx + body.vy * body.vy,
      );
      body.vx = Math.cos(angle) * currentSpeed;
      body.vy = Math.sin(angle) * currentSpeed;
      this.value = Math.round(val);
      saveInitialBodies();
    });

  // Canvas鼠标事件
  canvas.addEventListener("mousedown", function (e) {
    const hit = getBodyAtMouse(e.clientX, e.clientY);
    if (hit >= 0) {
      State.selectedBodyIndex = hit;
      if (State.simulationTime === 0) {
        State.isDraggingBody = true;
        State.draggedBodyIndex = hit;
        State.trackingBodyIndex = -1;
      } else {
        State.trackingBodyIndex = hit;
      }
      updateBodyPanel();
      canvas.style.cursor = "grabbing";
    } else {
      State.selectedBodyIndex = -1;
      State.trackingBodyIndex = -1;
      State.isPanning = true;
      updateBodyPanel();
      State.lastMouseX = e.clientX;
      State.lastMouseY = e.clientY;
      canvas.style.cursor = "grabbing";
    }
  });

  canvas.addEventListener("mousemove", function (e) {
    if (State.isDraggingBody && State.draggedBodyIndex >= 0) {
      const world = screenToWorld(e.clientX, e.clientY);
      State.bodies[State.draggedBodyIndex].x = world.x;
      State.bodies[State.draggedBodyIndex].y = world.y;
      State.bodies[State.draggedBodyIndex].trail = [];
    } else if (State.isPanning) {
      State.offsetX += (e.clientX - State.lastMouseX) / State.scale;
      State.offsetY += (e.clientY - State.lastMouseY) / State.scale;
      State.lastMouseX = e.clientX;
      State.lastMouseY = e.clientY;
    } else {
      const hit = getBodyAtMouse(e.clientX, e.clientY);
      canvas.style.cursor = hit >= 0 ? "grab" : "grab";
    }
  });

  canvas.addEventListener("mouseup", function () {
    if (State.isDraggingBody && !State.isRunning) {
      saveInitialBodies();
    }
    State.isDraggingBody = false;
    State.draggedBodyIndex = -1;
    State.isPanning = false;
    canvas.style.cursor = "grab";
  });

  canvas.addEventListener("mouseleave", function () {
    if (State.isDraggingBody && !State.isRunning) {
      saveInitialBodies();
    }
    State.isDraggingBody = false;
    State.draggedBodyIndex = -1;
    State.isPanning = false;
    canvas.style.cursor = "grab";
  });

  canvas.addEventListener(
    "wheel",
    function (e) {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      State.scale *= zoomFactor;
    },
    { passive: false },
  );

  // 触摸事件
  canvas.addEventListener(
    "touchstart",
    function (e) {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const hit = getBodyAtMouse(touch.clientX, touch.clientY);
        if (hit >= 0) {
          State.selectedBodyIndex = hit;
          if (State.simulationTime === 0) {
            State.isDraggingBody = true;
            State.draggedBodyIndex = hit;
            State.trackingBodyIndex = -1;
          } else {
            State.trackingBodyIndex = hit;
          }
          updateBodyPanel();
        } else {
          State.selectedBodyIndex = -1;
          State.trackingBodyIndex = -1;
          State.isPanning = true;
          updateBodyPanel();
          State.lastMouseX = touch.clientX;
          State.lastMouseY = touch.clientY;
        }
      } else if (e.touches.length === 2) {
        State.isDraggingBody = false;
        State.isPanning = false;
        State.touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        State.touchStartScale = State.scale;
      }
    },
    { passive: true },
  );

  canvas.addEventListener(
    "touchmove",
    function (e) {
      e.preventDefault();
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (State.isDraggingBody && State.draggedBodyIndex >= 0) {
          const world = screenToWorld(touch.clientX, touch.clientY);
          State.bodies[State.draggedBodyIndex].x = world.x;
          State.bodies[State.draggedBodyIndex].y = world.y;
          State.bodies[State.draggedBodyIndex].trail = [];
        } else if (State.isPanning) {
          State.offsetX += (touch.clientX - State.lastMouseX) / State.scale;
          State.offsetY += (touch.clientY - State.lastMouseY) / State.scale;
          State.lastMouseX = touch.clientX;
          State.lastMouseY = touch.clientY;
        }
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        State.scale = State.touchStartScale * (dist / State.touchStartDist);
      }
    },
    { passive: false },
  );

  canvas.addEventListener("touchend", function () {
    if (State.isDraggingBody && !State.isRunning) {
      saveInitialBodies();
    }
    State.isDraggingBody = false;
    State.draggedBodyIndex = -1;
    State.isPanning = false;
  });

  // 窗口缩放
  window.addEventListener("resize", resize);

  // 欢迎弹窗
  const welcomeModal = document.getElementById("welcomeModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  closeModalBtn.addEventListener("click", function () {
    welcomeModal.style.display = "none";
  });

  // 面板折叠
  const bodyCollapseBtn = document.getElementById("bodyCollapseBtn");
  const bodyPanel = document.getElementById("bodyPanel");
  bodyCollapseBtn.addEventListener("click", function () {
    bodyPanel.classList.toggle("panel-collapsed");
    this.textContent = bodyPanel.classList.contains("panel-collapsed")
      ? "+"
      : "\u2212";
  });

  const infoCollapseBtn = document.getElementById("infoCollapseBtn");
  const infoPanel = document.querySelector(".info-panel");
  infoCollapseBtn.addEventListener("click", function () {
    infoPanel.classList.toggle("panel-collapsed");
    this.textContent = infoPanel.classList.contains("panel-collapsed")
      ? "+"
      : "\u2212";
  });

  const controlCollapseBtn = document.getElementById("controlCollapseBtn");
  const controlPanel = document.getElementById("controlPanel");
  controlCollapseBtn.addEventListener("click", function () {
    controlPanel.classList.toggle("panel-collapsed");
    this.textContent = controlPanel.classList.contains("panel-collapsed")
      ? "+"
      : "\u2212";
  });
}

// 初始化
(function init() {
  State.canvas = document.getElementById("canvas");
  State.ctx = State.canvas.getContext("2d");

  resize();
  randomBodies();
  updateTrailControlsVisibility();
  bindEvents();
  animate();
})();
