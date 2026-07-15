const eventSequence = [
  {
    key: "tailwind",
    label: "顺风",
    mode: "事件轮播中",
    description:
      "金色边缘增强，玩家船速获得鼓励性提升，营造乘风竞渡的情绪推进感。",
    countdown: "24s",
    rank: "第 2 名",
    rhythm: "8.2 / 5s",
    mood: "乘势而上",
    message:
      "你正在顺势前行，不靠盲目的冲刺，而是借着节奏把力量放在最有效的位置。",
    positions: {
      player: 64,
      a: 132,
      b: 208,
      c: 178,
    },
  },
  {
    key: "headwind",
    label: "逆风",
    mode: "压力演示中",
    description:
      "暗红警示出现，船速被压低，但系统仍保留公平性约束，避免形成失控压制。",
    countdown: "18s",
    rank: "第 3 名",
    rhythm: "9.0 / 5s",
    mood: "逆势稳住",
    message:
      "逆风不只是阻力，也是在提醒你稳住动作。真正决定结果的，不是慌张，而是节奏。",
    positions: {
      player: 98,
      a: 164,
      b: 224,
      c: 206,
    },
  },
  {
    key: "undercurrent",
    label: "暗流",
    mode: "波动演示中",
    description:
      "水道发生轻微扰动，船体会有横向摆动与赛道偏移表现，但不会越过安全边界。",
    countdown: "13s",
    rank: "第 2 名",
    rhythm: "9.4 / 5s",
    mood: "应变调整",
    message:
      "真正的竞渡，不是在平静里发力，而是在暗流里保持方向。你的判断比速度更重要。",
    positions: {
      player: 138,
      a: 186,
      b: 236,
      c: 202,
    },
  },
  {
    key: "calm",
    label: "平静",
    mode: "节奏重整中",
    description:
      "所有加成暂时归零，系统回到基础状态，让比赛重新回到稳定的节奏与判断中。",
    countdown: "08s",
    rank: "第 2 名",
    rhythm: "7.8 / 5s",
    mood: "稳态推进",
    message:
      "风浪暂歇时，最能看见真正的节奏。你已经证明自己不是靠运气前行，而是靠稳定。",
    positions: {
      player: 168,
      a: 196,
      b: 248,
      c: 214,
    },
  },
];

const dom = {
  eventLabel: document.getElementById("currentEventText"),
  heroEventLabel: document.getElementById("heroEventLabel"),
  eventDescription: document.getElementById("eventDescription"),
  countdownValue: document.getElementById("countdownValue"),
  rankValue: document.getElementById("rankValue"),
  rhythmValue: document.getElementById("rhythmValue"),
  trackMoodValue: document.getElementById("trackMoodValue"),
  messageText: document.getElementById("messageText"),
  demoModeLabel: document.getElementById("demoModeLabel"),
  playerBoat: document.getElementById("playerBoat"),
  npcBoatA: document.getElementById("npcBoatA"),
  npcBoatB: document.getElementById("npcBoatB"),
  npcBoatC: document.getElementById("npcBoatC"),
  cycleEventBtn: document.getElementById("cycleEventBtn"),
  showMessageBtn: document.getElementById("showMessageBtn"),
};

const scrollButtons = document.querySelectorAll("[data-scroll-target]");
let currentIndex = 0;
let autoCycleId = null;

function applyBoatPosition(element, leftValue) {
  if (!element) {
    return;
  }

  element.style.left = `${leftValue}px`;
}

function renderEvent(index) {
  const state = eventSequence[index];
  if (!state) {
    return;
  }

  document.body.dataset.event = state.key;
  dom.eventLabel.textContent = state.label;
  dom.heroEventLabel.textContent = state.label;
  dom.eventDescription.textContent = state.description;
  dom.countdownValue.textContent = state.countdown;
  dom.rankValue.textContent = state.rank;
  dom.rhythmValue.textContent = state.rhythm;
  dom.trackMoodValue.textContent = state.mood;
  dom.messageText.textContent = state.message;
  dom.demoModeLabel.textContent = state.mode;

  applyBoatPosition(dom.playerBoat, state.positions.player);
  applyBoatPosition(dom.npcBoatA, state.positions.a);
  applyBoatPosition(dom.npcBoatB, state.positions.b);
  applyBoatPosition(dom.npcBoatC, state.positions.c);
}

function nextEvent() {
  currentIndex = (currentIndex + 1) % eventSequence.length;
  renderEvent(currentIndex);
}

function restartAutoCycle() {
  if (autoCycleId) {
    window.clearInterval(autoCycleId);
  }

  autoCycleId = window.setInterval(nextEvent, 4200);
}

function showRandomMessage() {
  const randomIndex = Math.floor(Math.random() * eventSequence.length);
  dom.messageText.textContent = eventSequence[randomIndex].message;
}

scrollButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetSelector = button.getAttribute("data-scroll-target");
    const target = targetSelector ? document.querySelector(targetSelector) : null;
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

if (dom.cycleEventBtn) {
  dom.cycleEventBtn.addEventListener("click", () => {
    nextEvent();
    restartAutoCycle();
  });
}

if (dom.showMessageBtn) {
  dom.showMessageBtn.addEventListener("click", showRandomMessage);
}

renderEvent(currentIndex);
restartAutoCycle();
