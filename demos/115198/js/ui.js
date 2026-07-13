 // UI交互模块 - 天体管理和面板更新
 
function updateBodyPanel() {
  const body = State.bodies[State.selectedBodyIndex];
  const speedInput = document.getElementById("bodySpeedInput");

  updateBodyPanelVisibility();
  setControlsEnabled(State.simulationTime === 0);

  if (!body) {
    speedInput.value = "";
    document.getElementById("bodyNameInput").value = "";
    renderBodyList();
    return;
  }

  document.getElementById("bodyNameInput").value = body.name;
  document.getElementById("bodyColor").value = body.color;
  document.getElementById("bodyMassInput").value = Math.round(body.mass);

  const speedVal = Math.sqrt(body.vx * body.vx + body.vy * body.vy);
  speedInput.value = speedVal.toFixed(2);

  let angle = (Math.atan2(body.vy, body.vx) * 180) / Math.PI;
  if (angle < 0) angle += 360;
  document.getElementById("bodyAngleInput").value = Math.round(angle);

  renderBodyList();
}

function updateBodyPanelVisibility() {
  const detailSection = document.getElementById("bodyDetailSection");
  if (detailSection) {
    detailSection.style.display = State.selectedBodyIndex >= 0 ? "" : "none";
  }
}

function setControlsEnabled(enabled) {
  const inputs = ["bodyMassInput", "bodySpeedInput", "bodyAngleInput"];
  inputs.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = !enabled;
  });
}

function addBody() {
  const massMin = parseNumber(
    document.getElementById("massMinInput")?.value,
    500,
    0.001,
    1e6,
  );
  const massMax = parseNumber(
    document.getElementById("massMaxInput")?.value,
    1500,
    0.001,
    1e6,
  );
  const speedMin = parseNumber(
    document.getElementById("speedMinInput")?.value,
    0.5,
    0,
    1000,
  );
  const speedMax = parseNumber(
    document.getElementById("speedMaxInput")?.value,
    1.3,
    0,
    1000,
  );
  const baseMass = 1000;

  const mass = massMin + Math.random() * (massMax - massMin);
  const speed = speedMin + Math.random() * (speedMax - speedMin);
  const velAngle = Math.random() * Math.PI * 2;

  const centerWorld = screenToWorld(State.centerX, State.centerY);

  const newBody = {
    name: "天体" + (State.bodies.length + 1),
    x: centerWorld.x,
    y: centerWorld.y,
    vx: Math.cos(velAngle) * speed,
    vy: Math.sin(velAngle) * speed,
    mass: mass,
    radius: 8 + Math.pow(mass / baseMass, 0.4) * 8,
    color: State.bodyColors[State.bodies.length % State.bodyColors.length],
    trail: [],
  };

  State.bodies.push(newBody);
  if (State.simulationTime === 0) {
    saveInitialBodies();
  }
  State.selectedBodyIndex = State.bodies.length - 1;
  if (State.simulationTime > 0) {
    State.trackingBodyIndex = State.selectedBodyIndex;
  }
  renderBodyList();
  updateBodyPanel();
}

function deleteBody(index) {
  if (State.bodies.length <= 1) return;
  State.bodies.splice(index, 1);
  if (State.simulationTime === 0) {
    saveInitialBodies();
  }
  if (State.selectedBodyIndex >= State.bodies.length) {
    State.selectedBodyIndex = State.bodies.length - 1;
  }
  if (State.trackingBodyIndex >= State.bodies.length) {
    State.trackingBodyIndex = State.bodies.length - 1;
  }
  if (State.selectedBodyIndex === index) {
    State.selectedBodyIndex = Math.min(index, State.bodies.length - 1);
    if (State.simulationTime > 0) {
      State.trackingBodyIndex = State.selectedBodyIndex;
    }
  } else if (State.selectedBodyIndex > index) {
    State.selectedBodyIndex--;
  }
  if (State.trackingBodyIndex === index) {
    State.trackingBodyIndex = Math.min(index, State.bodies.length - 1);
  } else if (State.trackingBodyIndex > index) {
    State.trackingBodyIndex--;
  }
  renderBodyList();
  updateBodyPanel();
}

function renderBodyList() {
  const list = document.getElementById("bodyList");
  list.innerHTML = "";
  for (let i = 0; i < State.bodies.length; i++) {
    const item = document.createElement("div");
    item.className =
      "body-item" + (i === State.selectedBodyIndex ? " active" : "");
    const deleteBtnHtml =
      State.simulationTime === 0 && State.bodies.length > 1
        ? `<div class="body-delete-btn" data-index="${i}">×</div>`
        : "";
    item.innerHTML = `
      ${deleteBtnHtml}
      <div class="body-color-dot" style="background:${State.bodies[i].color}"></div>
      <div class="body-item-name">${State.bodies[i].name}</div>
    `;
    item.addEventListener("click", (e) => {
      if (e.target.classList.contains("body-delete-btn")) return;
      e.stopPropagation();
      State.selectedBodyIndex = i;
      if (State.simulationTime > 0) {
        State.trackingBodyIndex = i;
      } else {
        State.trackingBodyIndex = -1;
      }
      updateBodyPanel();
      renderBodyList();
    });
    const deleteBtn = item.querySelector(".body-delete-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (State.simulationTime === 0) {
          deleteBody(i);
        }
      });
    }
    list.appendChild(item);
  }

  const addItem = document.createElement("div");
  addItem.className = "body-item body-add-item";
  addItem.innerHTML = '<div class="body-add-icon">+</div>';
  addItem.addEventListener("click", (e) => {
    e.stopPropagation();
    if (State.simulationTime === 0) {
      addBody();
    }
  });
  if (State.simulationTime !== 0) {
    addItem.classList.add("disabled");
  }
  list.appendChild(addItem);
}

function saveInitialBodies() {
  State.initialBodies = State.bodies.map((b) => ({
    name: b.name,
    x: b.x,
    y: b.y,
    vx: b.vx,
    vy: b.vy,
    mass: b.mass,
    radius: b.radius,
    color: b.color,
    trail: [],
  }));
}

function parseNumber(value, defaultValue, min, max) {
  const num = parseFloat(value);
  if (isNaN(num) || !isFinite(num)) return defaultValue;
  let result = num;
  if (min !== undefined && min !== null) result = Math.max(min, result);
  if (max !== undefined && max !== null) result = Math.min(max, result);
  return result;
}
