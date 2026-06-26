const weatherConfig = {
  sunny: { icon: "☀️", label: "晴天", emotion: "开心", color: "#FFD93D" },
  cloudy: { icon: "☁️", label: "多云", emotion: "平静", color: "#A0AEC0" },
  overcast: { icon: "🌫️", label: "阴天", emotion: "低落", color: "#718096" },
  "light-rain": { icon: "🌧️", label: "小雨", emotion: "难过", color: "#5B8DEF" },
  thunder: { icon: "⛈️", label: "雷阵雨", emotion: "愤怒", color: "#E53E3E" },
  "heavy-rain": { icon: "⚡", label: "暴雨", emotion: "崩溃", color: "#553C9A" },
  rainbow: { icon: "🌈", label: "彩虹", emotion: "感动", color: "#FF6B9D" }
};

const aiTemplates = {
  sunny: {
    summary: "今天的事件里有明显的成就感和被肯定的感受，你的大脑可能正在把这些积极体验储存成信心。",
    response: "请记住这种发光的感觉。它不是运气，而是你努力、坚持和被看见之后自然出现的晴朗。",
    advice: "可以把今天做对的一件小事写下来，给未来遇到困难的自己留一张信心便签。",
    forecast: "明天可能仍有阳光，也可能有小云朵。带着今天的能量，慢慢来就很好。"
  },
  cloudy: {
    summary: "今天的心情比较稳定，像云层轻轻铺开。它不一定特别兴奋，但也说明你正在保持自己的节奏。",
    response: "平静也是一种很重要的能力。不是每天都要很耀眼，能安稳经过一天也值得被肯定。",
    advice: "睡前可以做一次简单回顾：今天让我舒服的一件事、让我有点累的一件事、我想感谢自己的一件事。",
    forecast: "明天的天气也许会更清亮。保持现在的节奏，不急着要求自己马上变得更好。"
  },
  overcast: {
    summary: "今天可能有一些低落、没精神或不太想说话的时刻。阴天不是错误，它只是提醒你需要多一点照顾。",
    response: "你不需要因为低落而责怪自己。情绪变暗的时候，说明内心正在发出需要休息和理解的信号。",
    advice: "先做一件很小的事：喝水、洗脸、整理桌面的一角，或给信任的人发一句“我今天有点累”。",
    forecast: "阴天通常会慢慢移动。明天不一定立刻放晴，但你可以为自己留一束小光。"
  },
  "light-rain": {
    summary: "今天的难过像小雨一样落下来，可能和失望、委屈、压力或想被理解有关。",
    response: "难过并不代表你脆弱，它说明这件事对你很重要。能承认难过，本身就是在认真对待自己。",
    advice: "试着写下“我难过是因为……我希望……”这两句话，把模糊的雨声变成可以被理解的文字。",
    forecast: "小雨会让土壤变柔软。明天可以给自己安排一个轻一点的开始。"
  },
  thunder: {
    summary: "今天的情绪里可能有愤怒、紧绷或被冒犯的感觉。雷声常常来自边界被碰到的时候。",
    response: "愤怒不是坏情绪，它可能在保护你。重要的是找到安全的方式表达，而不是伤害自己或别人。",
    advice: "可以先离开冲突现场，做三轮深呼吸，再写下：我真正介意的是什么？我希望对方怎么做？",
    forecast: "雷阵雨来得急，也会过去。等情绪声音小一点，你会更清楚自己想守护什么。"
  },
  "heavy-rain": {
    summary: "今天可能出现了强烈压力或快要撑不住的感觉。暴雨天气需要避雨，不需要硬扛。",
    response: "如果你觉得很崩溃，请先把安全放在第一位。你值得被帮助，也不需要一个人解决所有事。",
    advice: "马上做一件求助动作：告诉家长、老师、朋友或心理老师“我现在状态很不好，需要陪一下”。",
    forecast: "暴雨不会定义你。先找到可以停靠的地方，等雨小一点，再一步一步整理。"
  },
  rainbow: {
    summary: "今天的情绪里有被触动、被理解或经历风雨后看见希望的部分，像雨后出现的彩虹。",
    response: "这份感动很珍贵，它说明你仍然能感受到连接、善意和希望。",
    advice: "可以把让你感动的人或事记下来。如果愿意，也可以把感谢传达给对方。",
    forecast: "明天也许会有新的色彩。把今天的彩虹收藏好，它会在未来提醒你：美好的事真实存在。"
  }
};

const factorLabels = {
  sleep: { good: "睡得很好", normal: "一般", bad: "没睡好" },
  study: { easy: "比较顺利", normal: "正常", hard: "压力较大" },
  food: { good: "吃得不错", normal: "一般", bad: "不太规律" },
  exercise: { yes: "有运动", little: "活动较少", no: "没有运动" },
  social: { good: "相处愉快", normal: "一般", bad: "有些不顺" },
  screen: { short: "较短", normal: "适中", long: "偏长" }
};

const positiveMessages = [
  "你不需要把每一天都过成满分，愿意继续前进已经很棒。",
  "情绪不是敌人，它是在提醒你：这里有一些事情值得被看见。",
  "慢一点也没关系，云会移动，雨会停下，你也会恢复力量。",
  "今天照顾好自己的一小步，也是在认真长大。",
  "你可以不完美，但你一直都值得被善待。",
  "遇到难受的事情时，求助不是麻烦别人，而是在保护自己。"
];

let selectedWeather = null;
let currentPage = "record";
let dataDirectoryHandle = null;
let currentCalendarDate = new Date();
const DATA_FILENAME = "emotion-records.json";
let breatheTimer = null;
let positiveIndex = 0;
let editingDiaryDate = null;
window.emotionRecords = [];

document.addEventListener("DOMContentLoaded", () => {
  loadRecordsFromLocalStorage();
  initNavigation();
  initWeatherSelection();
  initSubmitButton();
  initToolCards();
  initProjectInfo();
  initCalendar();
  initDateInput();
  initStorageButtons();
  renderCalendar();
  updateStorageStatus();
});

function initNavigation() {
  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.addEventListener("click", () => switchPage(button.dataset.page));
  });

  document.getElementById("again-btn").addEventListener("click", () => {
    document.getElementById("record-form").reset();
    selectedWeather = null;
    document.querySelectorAll(".weather-btn").forEach((button) => button.classList.remove("selected"));
    initDateInput();
    switchPage("record");
  });
}

function switchPage(pageId) {
  currentPage = pageId;
  document.querySelectorAll(".page").forEach((page) => page.classList.toggle("active", page.id === pageId));
  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });

  if (pageId === "dashboard") {
    renderCalendar();
  }
}

function initWeatherSelection() {
  document.querySelectorAll(".weather-btn").forEach((button) => {
    const weather = button.dataset.weather;
    button.style.setProperty("--weather-color", weatherConfig[weather].color);
    button.addEventListener("click", () => {
      selectedWeather = weather;
      document.querySelectorAll(".weather-btn").forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
      document.documentElement.style.setProperty("--accent", weatherConfig[weather].color);
    });
  });
}

function initSubmitButton() {
  document.getElementById("record-form").addEventListener("submit", handleSubmit);
}

async function handleSubmit(event) {
  event.preventDefault();
  const date = document.getElementById("record-date").value;
  const eventText = document.getElementById("event-text").value.trim();

  if (!date) {
    showNotice("请选择日期。");
    return;
  }

  if (!selectedWeather) {
    showNotice("请选择一个心情天气。");
    return;
  }

  if (!eventText) {
    showNotice("请写下一点今天发生的事情。");
    return;
  }

  await saveRecord(date, selectedWeather, eventText);
  generateAnalysis(date, eventText);
  switchPage("analysis");
}

function collectFactors() {
  return {
    sleep: document.getElementById("factor-sleep").value,
    study: document.getElementById("factor-study").value,
    food: document.getElementById("factor-food").value,
    exercise: document.getElementById("factor-exercise").value,
    social: document.getElementById("factor-social").value,
    screen: document.getElementById("factor-screen").value
  };
}

async function saveRecord(date, weather, eventText) {
  const record = {
    date,
    weather,
    event: eventText,
    factors: collectFactors(),
    createdAt: new Date().toISOString()
  };

  const existingIndex = window.emotionRecords.findIndex((item) => item.date === date);
  if (existingIndex >= 0) {
    window.emotionRecords[existingIndex] = record;
  } else {
    window.emotionRecords.push(record);
  }
  window.emotionRecords.sort((a, b) => a.date.localeCompare(b.date));

  saveRecordsToLocalStorage(window.emotionRecords);
  await saveRecordsToFile(window.emotionRecords);
  renderCalendar();
}

function generateAnalysis(date, eventText) {
  const loading = document.getElementById("analysis-loading");
  const card = document.getElementById("analysis-card");
  loading.classList.remove("hidden");
  card.classList.add("hidden");

  const config = weatherConfig[selectedWeather];
  const template = aiTemplates[selectedWeather];
  const eventHint = buildEventHint(eventText);

  setTimeout(() => {
    document.getElementById("analysis-icon").textContent = config.icon;
    document.getElementById("analysis-title").textContent = `今天是${config.label}`;
    document.getElementById("analysis-date").textContent = formatDate(date);
    document.getElementById("analysis-emotion").textContent = `我识别到的主要情绪是“${config.emotion}”。${eventHint}`;
    document.getElementById("analysis-summary").textContent = template.summary;
    document.getElementById("analysis-response").textContent = template.response;
    document.getElementById("analysis-advice").textContent = template.advice;
    document.getElementById("analysis-forecast").textContent = template.forecast;
    loading.classList.add("hidden");
    card.classList.remove("hidden");
  }, 900);
}

function buildEventHint(text) {
  if (text.length < 20) {
    return "你记录得很简短，但这仍然是一次认真看见自己的开始。";
  }
  if (/考试|作业|成绩|学习|老师/.test(text)) {
    return "这次情绪可能和学习、评价或自我期待有关。";
  }
  if (/朋友|同学|家人|妈妈|爸爸|吵架/.test(text)) {
    return "这次情绪可能和人际关系、沟通或被理解的需要有关。";
  }
  if (/累|困|睡|病|疼/.test(text)) {
    return "身体状态也可能影响了今天的心情，照顾身体同样重要。";
  }
  return "你已经把模糊的感受变成了文字，这会让情绪更容易被理解。";
}

function initCalendar() {
  document.getElementById("prev-month").addEventListener("click", () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById("next-month").addEventListener("click", () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
  });
}

function renderCalendar() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  document.getElementById("calendar-title").textContent = `${year}年${month + 1}月`;

  const grid = document.getElementById("calendar-grid");
  grid.innerHTML = "";

  const firstDay = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - firstDay.getDay());

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = toDateInputValue(date);
    const record = window.emotionRecords.find((item) => item.date === dateStr);
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "day-cell";
    if (date.getMonth() !== month) cell.classList.add("other-month");
    if (record) cell.classList.add("has-record");
    cell.innerHTML = `<span class="date-num">${date.getDate()}</span>${record ? `<span class="cell-icon">${weatherConfig[record.weather].icon}</span>` : ""}`;
    if (record) {
      cell.addEventListener("click", () => showDayDetail(dateStr));
    }
    grid.appendChild(cell);
  }

  updateMonthStats(year, month, window.emotionRecords);
}

function showDayDetail(dateStr) {
  const detail = document.getElementById("day-detail");
  const record = window.emotionRecords.find((item) => item.date === dateStr);
  if (!record) {
    detail.className = "day-detail empty";
    detail.textContent = "这一天还没有记录。";
    return;
  }

  const config = weatherConfig[record.weather];
  const factors = Object.entries(record.factors || {})
    .filter(([, value]) => value)
    .map(([key, value]) => `${factorName(key)}：${factorLabels[key][value] || value}`)
    .join("；");

  detail.className = "day-detail";
  detail.innerHTML = `
    <div class="day-detail-weather"><span>${config.icon}</span><div>${formatDate(dateStr)} · ${config.label} · ${config.emotion}</div></div>
    <p>${escapeHtml(record.event)}</p>
    <p><strong>行为因素：</strong>${factors || "未填写"}</p>
    <div class="day-detail-actions">
      <button type="button" class="detail-edit-btn" id="edit-record-btn">修改</button>
      <button type="button" class="detail-delete-btn" id="delete-record-btn">删除</button>
    </div>
  `;

  document.getElementById("edit-record-btn").addEventListener("click", () => editRecord(dateStr));
  document.getElementById("delete-record-btn").addEventListener("click", () => deleteRecord(dateStr));
}

function editRecord(dateStr) {
  const record = window.emotionRecords.find((item) => item.date === dateStr);
  if (!record) return;

  document.getElementById("record-date").value = record.date;
  document.getElementById("event-text").value = record.event;
  selectedWeather = record.weather;
  document.querySelectorAll(".weather-btn").forEach((button) => {
    button.classList.toggle("selected", button.dataset.weather === record.weather);
  });
  document.documentElement.style.setProperty("--accent", weatherConfig[record.weather].color);

  Object.entries(record.factors || {}).forEach(([key, value]) => {
    const select = document.getElementById(`factor-${key}`);
    if (select) select.value = value || "";
  });

  switchPage("record");
  showNotice("已把这条记录带回记录页，修改后点击“生成情绪分析”即可保存。");
}

async function deleteRecord(dateStr) {
  const record = window.emotionRecords.find((item) => item.date === dateStr);
  if (!record) return;

  const confirmed = await showConfirm(`确定删除 ${formatDate(dateStr)} 的情绪记录吗？\n\n删除后会同步更新本地备份和 JSON 文件。`);
  if (!confirmed) return;

  window.emotionRecords = window.emotionRecords.filter((item) => item.date !== dateStr);
  saveRecordsToLocalStorage(window.emotionRecords);
  await saveRecordsToFile(window.emotionRecords);
  renderCalendar();

  const detail = document.getElementById("day-detail");
  detail.className = "day-detail empty";
  detail.textContent = "这一天的记录已删除。";
}

function updateMonthStats(year, month, records) {
  const box = document.getElementById("month-stats");
  const monthRecords = records.filter((record) => {
    const date = new Date(`${record.date}T00:00:00`);
    return date.getFullYear() === year && date.getMonth() === month;
  });
  const total = Math.max(monthRecords.length, 1);
  const counts = {};
  monthRecords.forEach((record) => {
    counts[record.weather] = (counts[record.weather] || 0) + 1;
  });

  box.innerHTML = Object.keys(weatherConfig).map((key) => {
    const count = counts[key] || 0;
    const config = weatherConfig[key];
    const width = Math.round((count / total) * 100);
    return `
      <div class="stat-row" style="--weather-color:${config.color}">
        <span>${config.icon} ${config.label}</span>
        <div class="stat-bar"><span style="width:${width}%"></span></div>
        <strong>${count}天</strong>
      </div>
    `;
  }).join("");
}

function initDateInput() {
  document.getElementById("record-date").value = toDateInputValue(new Date());
}

function initStorageButtons() {
  document.getElementById("select-folder-btn").addEventListener("click", selectDataDirectory);
  document.getElementById("export-btn").addEventListener("click", exportData);
  window.exportData = exportData;
  window.selectFolder = selectDataDirectory;
}

async function selectDataDirectory() {
  if (!("showDirectoryPicker" in window)) {
    showNotice("当前浏览器不支持选择文件夹，已自动使用 localStorage 和下载导出作为备份。建议使用新版 Edge 或 Chrome。");
    return;
  }

  try {
    dataDirectoryHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    const existingFile = await findExistingDataFile(dataDirectoryHandle);
    if (existingFile) {
      await loadRecordsFromFile();
    } else {
      await saveRecordsToFile(window.emotionRecords);
    }
    updateStorageStatus();
    renderCalendar();
    showNotice("保存文件夹已连接，之后会自动保存 JSON 并创建备份。");
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error);
      showNotice("选择文件夹失败，已继续使用浏览器本地备份。");
    }
  }
}

async function findExistingDataFile(dirHandle) {
  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === "file" && name === DATA_FILENAME) {
      return name;
    }
  }
  return null;
}

async function loadRecordsFromFile() {
  if (!dataDirectoryHandle) return;
  try {
    const fileHandle = await dataDirectoryHandle.getFileHandle(DATA_FILENAME);
    const file = await fileHandle.getFile();
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data)) throw new Error("数据文件格式不是数组");
    window.emotionRecords = data;
    saveRecordsToLocalStorage(data);
  } catch (error) {
    console.error(error);
    loadRecordsFromLocalStorage();
    showNotice("文件读取失败，已从浏览器本地备份恢复。");
  }
}

async function saveRecordsToFile(records) {
  if (!dataDirectoryHandle) return;
  try {
    await backupExistingFile();
    const fileHandle = await dataDirectoryHandle.getFileHandle(DATA_FILENAME, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(records, null, 2));
    await writable.close();
    updateStorageStatus();
  } catch (error) {
    console.error(error);
    showNotice("文件保存失败，但浏览器本地备份已保存。");
  }
}

async function backupExistingFile() {
  try {
    const fileHandle = await dataDirectoryHandle.getFileHandle(DATA_FILENAME);
    const file = await fileHandle.getFile();
    const content = await file.text();
    const now = new Date();
    const pad = (number) => String(number).padStart(2, "0");
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const backupName = `emotion-records-backup-${stamp}.json`;
    const backupHandle = await dataDirectoryHandle.getFileHandle(backupName, { create: true });
    const writable = await backupHandle.createWritable();
    await writable.write(content);
    await writable.close();
  } catch (error) {
    if (error.name !== "NotFoundError") {
      console.warn("备份失败：", error);
    }
  }
}

function loadRecordsFromLocalStorage() {
  try {
    const raw = localStorage.getItem("emotionRecords");
    const data = raw ? JSON.parse(raw) : [];
    window.emotionRecords = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(error);
    window.emotionRecords = [];
  }
}

function saveRecordsToLocalStorage(records) {
  localStorage.setItem("emotionRecords", JSON.stringify(records));
}

async function exportData() {
  const fileName = DATA_FILENAME;
  const confirmed = await showConfirm(`是否将当前情绪记录导出为 ${fileName}？\n\n如果已选择保存文件夹，文件会自动保存在同一文件夹中。`);
  if (!confirmed) return;

  const jsonText = JSON.stringify(window.emotionRecords, null, 2);

  if (dataDirectoryHandle) {
    try {
      const fileHandle = await dataDirectoryHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(jsonText);
      await writable.close();
      updateStorageStatus();
      showNotice("JSON 已保存到已选择的同一文件夹。");
      return;
    } catch (error) {
      console.error(error);
      showNotice("自动保存到同一文件夹失败，请在接下来的窗口中选择保存位置。");
    }
  }

  if ("showSaveFilePicker" in window) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: "JSON 数据文件",
            accept: { "application/json": [".json"] }
          }
        ]
      });
      const writable = await fileHandle.createWritable();
      await writable.write(jsonText);
      await writable.close();
      updateStorageStatus();
      showNotice("JSON 已保存。");
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error(error);
    }
  }

  const blob = new Blob([jsonText], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
  showNotice("当前浏览器不支持直接写入文件夹，已改为下载 JSON 文件。");
}

function initToolCards() {
  document.querySelectorAll(".tool-card").forEach((card) => {
    card.addEventListener("click", () => openTool(card.dataset.tool));
  });
  document.getElementById("close-modal").addEventListener("click", closeModal);
  document.getElementById("tool-modal").addEventListener("click", (event) => {
    if (event.target.id === "tool-modal") closeModal();
  });
}

function initProjectInfo() {
  const openButton = document.getElementById("project-info-btn");
  const closeButton = document.getElementById("close-project-modal");
  const modal = document.getElementById("project-modal");

  if (!openButton || !closeButton || !modal) return;

  openButton.addEventListener("click", () => {
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
  });

  closeButton.addEventListener("click", closeProjectInfo);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeProjectInfo();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeProjectInfo();
    }
  });
}

function closeProjectInfo() {
  const modal = document.getElementById("project-modal");
  if (!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

function openTool(tool) {
  const content = document.getElementById("modal-content");
  stopBreatheAnimation();

  if (tool === "breathe") {
    content.innerHTML = `
      <h2 id="modal-title">深呼吸练习</h2>
      <p class="muted">跟着圆圈做 4 秒吸气、2 秒保持、6 秒呼气。重复几轮，让身体先慢下来。</p>
      <div class="breathe-wrap">
        <div class="breathe-circle" id="breathe-circle">准备</div>
        <button class="primary-btn" id="start-breathe">开始练习</button>
      </div>
    `;
    document.getElementById("start-breathe").addEventListener("click", toggleBreatheAnimation);
  }

  if (tool === "diary") {
    editingDiaryDate = null;
    content.innerHTML = `
      <h2 id="modal-title">情绪日记</h2>
      <p class="muted">这里适合写下还没整理好的念头。内容只会保存在当前浏览器。</p>
      <textarea id="diary-input" rows="5" placeholder="此刻我想说..."></textarea>
      <button class="primary-btn" id="save-diary-btn">保存日记</button>
      <div class="diary-list" id="diary-list"></div>
    `;
    document.getElementById("save-diary-btn").addEventListener("click", saveDiary);
    updateDiaryList();
  }

  if (tool === "positive") {
    content.innerHTML = `
      <h2 id="modal-title">积极暗示</h2>
      <div class="positive-message" id="positive-message">${positiveMessages[positiveIndex]}</div>
      <button class="primary-btn" id="refresh-positive">换一条</button>
    `;
    document.getElementById("refresh-positive").addEventListener("click", refreshPositiveMessage);
  }

  if (tool === "bubble") {
    content.innerHTML = `
      <h2 id="modal-title">解压小游戏</h2>
      <p class="muted">点击泡泡把它捏破。全部捏完后会自动重置。</p>
      <div class="bubble-grid" id="bubble-grid"></div>
      <p id="bubble-tip" class="muted">还剩 12 个泡泡。</p>
    `;
    initBubbleGame();
  }

  document.getElementById("tool-modal").classList.add("show");
  document.getElementById("tool-modal").setAttribute("aria-hidden", "false");
}

function closeModal() {
  stopBreatheAnimation();
  document.getElementById("tool-modal").classList.remove("show");
  document.getElementById("tool-modal").setAttribute("aria-hidden", "true");
}

function toggleBreatheAnimation() {
  if (breatheTimer) {
    stopBreatheAnimation();
    return;
  }

  startBreatheAnimation();
}

function startBreatheAnimation() {
  stopBreatheAnimation();
  const circle = document.getElementById("breathe-circle");
  const button = document.getElementById("start-breathe");
  if (button) button.textContent = "停止练习";
  let step = 0;
  const states = [
    { text: "吸气", expand: true, duration: 4000 },
    { text: "保持", expand: true, duration: 2000 },
    { text: "呼气", expand: false, duration: 6000 }
  ];

  function runStep() {
    const state = states[step % states.length];
    circle.textContent = state.text;
    circle.classList.toggle("expand", state.expand);
    step += 1;
    breatheTimer = setTimeout(runStep, state.duration);
  }

  runStep();
}

function stopBreatheAnimation() {
  if (breatheTimer) {
    clearTimeout(breatheTimer);
    breatheTimer = null;
  }
  const circle = document.getElementById("breathe-circle");
  const button = document.getElementById("start-breathe");
  if (circle) {
    circle.textContent = "准备";
    circle.classList.remove("expand");
  }
  if (button) button.textContent = "开始练习";
}

function saveDiary() {
  const input = document.getElementById("diary-input");
  const saveButton = document.getElementById("save-diary-btn");
  const content = input.value.trim();
  if (!content) {
    showNotice("先写下一点内容再保存。");
    return;
  }
  const diaries = getDiaries();
  if (editingDiaryDate) {
    const target = diaries.find((item) => item.date === editingDiaryDate);
    if (target) {
      target.content = content;
      target.updatedAt = new Date().toISOString();
    }
    editingDiaryDate = null;
    if (saveButton) saveButton.textContent = "保存日记";
  } else {
    diaries.unshift({ date: new Date().toISOString(), content });
  }
  localStorage.setItem("emotionDiaries", JSON.stringify(diaries));
  input.value = "";
  updateDiaryList();
}

function updateDiaryList() {
  const list = document.getElementById("diary-list");
  if (!list) return;
  const diaries = getDiaries();
  list.innerHTML = diaries.length ? diaries.map((item) => `
    <div class="diary-item" data-date="${escapeHtml(item.date)}">
      <strong>${formatDateTime(item.date)}</strong>
      <p>${escapeHtml(item.content)}</p>
      <div class="diary-actions">
        <button type="button" class="diary-edit-btn" data-date="${escapeHtml(item.date)}">修改</button>
        <button type="button" class="diary-delete-btn" data-date="${escapeHtml(item.date)}">删除</button>
      </div>
    </div>
  `).join("") : `<p class="muted">还没有日记，写下第一条吧。</p>`;

  list.querySelectorAll(".diary-edit-btn").forEach((button) => {
    button.addEventListener("click", () => editDiary(button.dataset.date));
  });
  list.querySelectorAll(".diary-delete-btn").forEach((button) => {
    button.addEventListener("click", () => deleteDiary(button.dataset.date));
  });
}

function editDiary(date) {
  const diaries = getDiaries();
  const diary = diaries.find((item) => item.date === date);
  const input = document.getElementById("diary-input");
  const saveButton = document.getElementById("save-diary-btn");
  if (!diary || !input) return;

  editingDiaryDate = date;
  input.value = diary.content;
  input.focus();
  if (saveButton) saveButton.textContent = "保存修改";
}

async function deleteDiary(date) {
  const diaries = getDiaries();
  const diary = diaries.find((item) => item.date === date);
  if (!diary) return;

  const confirmed = await showConfirm("确定删除这条情绪日记吗？");
  if (!confirmed) return;

  const nextDiaries = diaries.filter((item) => item.date !== date);
  localStorage.setItem("emotionDiaries", JSON.stringify(nextDiaries));
  if (editingDiaryDate === date) {
    editingDiaryDate = null;
    const input = document.getElementById("diary-input");
    const saveButton = document.getElementById("save-diary-btn");
    if (input) input.value = "";
    if (saveButton) saveButton.textContent = "保存日记";
  }
  updateDiaryList();
}

function getDiaries() {
  try {
    const raw = localStorage.getItem("emotionDiaries");
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function refreshPositiveMessage() {
  positiveIndex = (positiveIndex + 1) % positiveMessages.length;
  document.getElementById("positive-message").textContent = positiveMessages[positiveIndex];
}

function initBubbleGame() {
  const grid = document.getElementById("bubble-grid");
  const tip = document.getElementById("bubble-tip");
  grid.innerHTML = "";

  for (let i = 0; i < 12; i += 1) {
    const bubble = document.createElement("button");
    bubble.type = "button";
    bubble.className = "bubble";
    bubble.setAttribute("aria-label", `泡泡 ${i + 1}`);
    bubble.addEventListener("click", () => {
      bubble.classList.add("popped");
      const left = 12 - grid.querySelectorAll(".bubble.popped").length;
      tip.textContent = left ? `还剩 ${left} 个泡泡。` : "全部捏完啦，正在重新生成泡泡。";
      if (left === 0) {
        setTimeout(initBubbleGame, 900);
      }
    });
    grid.appendChild(bubble);
  }
}

function updateStorageStatus() {
  const status = document.getElementById("storage-status");
  if (!status) return;
  if (dataDirectoryHandle) {
    status.textContent = `已连接保存文件夹，当前数据文件：${DATA_FILENAME}`;
  } else {
    status.textContent = "当前使用浏览器本地备份。可选择文件夹保存 JSON 文件。";
  }
}

function showNotice(message) {
  return openNoticeDialog({ message, showCancel: false });
}

function showConfirm(message) {
  return openNoticeDialog({ message, showCancel: true });
}

function openNoticeDialog({ message, showCancel }) {
  const modal = document.getElementById("notice-modal");
  const messageBox = document.getElementById("notice-message");
  const confirmButton = document.getElementById("notice-confirm-btn");
  const cancelButton = document.getElementById("notice-cancel-btn");

  if (!modal || !messageBox || !confirmButton || !cancelButton) {
    console.warn(message);
    return Promise.resolve(!showCancel);
  }

  return new Promise((resolve) => {
    messageBox.textContent = message;
    cancelButton.classList.toggle("hidden", !showCancel);
    confirmButton.textContent = "确定";
    cancelButton.textContent = "取消";
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    confirmButton.focus();

    function close(result) {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      confirmButton.removeEventListener("click", onConfirm);
      cancelButton.removeEventListener("click", onCancel);
      modal.removeEventListener("click", onBackdrop);
      document.removeEventListener("keydown", onKeydown);
      resolve(result);
    }

    function onConfirm() {
      close(true);
    }

    function onCancel() {
      close(false);
    }

    function onBackdrop(event) {
      if (event.target === modal && showCancel) {
        close(false);
      }
    }

    function onKeydown(event) {
      if (event.key === "Escape" && showCancel) {
        close(false);
      }
    }

    confirmButton.addEventListener("click", onConfirm);
    cancelButton.addEventListener("click", onCancel);
    modal.addEventListener("click", onBackdrop);
    document.addEventListener("keydown", onKeydown);
  });
}

function toDateInputValue(date) {
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatDateTime(iso) {
  const date = new Date(iso);
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function factorName(key) {
  return {
    sleep: "睡眠",
    study: "学习",
    food: "饮食",
    exercise: "运动",
    social: "社交",
    screen: "屏幕时间"
  }[key] || key;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
