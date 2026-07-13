const boardColumns = [
  { id: "today", title: "今日建议" },
  { id: "todo", title: "待学习" },
  { id: "doing", title: "进行中" },
  { id: "done", title: "已完成" },
  { id: "review", title: "需要复习" },
];

const DEFAULT_STATE = {
  activeGoalId: "goal-python",
  selectedTaskId: "task-1",
  currentView: "dashboard",
  goals: [
    {
      id: "goal-python",
      title: "三个月掌握 Python 基础",
      deadline: "2026-09-01",
      dailyTime: "90 分钟",
      level: "零基础",
      note: "以基础语法、练习和小项目为主。",
      weeklyStage: "基础语法与练习节奏建立",
    },
  ],
  scores: {
    sleep: 7,
    energy: 7,
    pressure: 4,
    focus: 7,
  },
  files: [
    { id: "file-1", name: "Python 基础课程大纲.pdf", type: "PDF", goalId: "goal-python", content: "Python 基础课程大纲\n1. 变量与数据类型\n2. 条件语句与循环\n3. 函数定义与调用\n4. 文件读写操作\n5. 面向对象编程基础\n6. 常用标准库介绍" },
    { id: "file-2", name: "练习题清单.docx", type: "DOCX", goalId: "goal-python", content: "练习题清单\n1. 编写一个计算器程序\n2. 实现字符串反转函数\n3. 读取文件并统计词频\n4. 创建简单的学生管理系统\n5. 用递归实现斐波那契数列" },
  ],
  tasks: [
    {
      id: "task-1",
      column: "today",
      title: "变量、数据类型与基础练习",
      description: "阅读资料中的基础语法部分，并完成 8 道入门练习。",
      minutes: 55,
      difficulty: "适中",
      dueDate: "2026-06-08",
      stage: "第 1 周",
      startWeek: 1,
      durationWeeks: 1,
    },
    {
      id: "task-2",
      column: "today",
      title: "复习条件语句笔记",
      description: "用自己的话整理 if / elif / else 的使用场景。",
      minutes: 25,
      difficulty: "轻松",
      dueDate: "2026-06-08",
      stage: "第 1 周",
      startWeek: 1,
      durationWeeks: 1,
    },
    {
      id: "task-3",
      column: "todo",
      title: "函数基础",
      description: "理解参数、返回值和简单函数拆分。",
      minutes: 60,
      difficulty: "适中",
      dueDate: "2026-06-09",
      stage: "第 1 周",
      startWeek: 1,
      durationWeeks: 1,
    },
    {
      id: "task-4",
      column: "todo",
      title: "文件读写入门",
      description: "学习读取文本文件，并写一个小型统计脚本。",
      minutes: 70,
      difficulty: "较难",
      dueDate: "2026-06-11",
      stage: "第 2 周",
      startWeek: 2,
      durationWeeks: 1,
    },
    {
      id: "task-5",
      column: "done",
      title: "安装 Python 与编辑器",
      description: "完成开发环境准备，确认可以运行第一个脚本。",
      minutes: 35,
      difficulty: "轻松",
      dueDate: "2026-06-07",
      stage: "准备阶段",
      startWeek: 0,
      durationWeeks: 1,
    },
  ],
  phases: [
    { week: 0, title: "准备阶段", color: "#8b9eab", startDate: "2026-06-01", endDate: "2026-06-06" },
    { week: 1, title: "基础语法与练习", color: "#6bb7df", startDate: "2026-06-07", endDate: "2026-06-13" },
    { week: 2, title: "文件与函数", color: "#4aa375", startDate: "2026-06-14", endDate: "2026-06-20" },
    { week: 3, title: "模块与包管理", color: "#c9902e", startDate: "2026-06-21", endDate: "2026-06-27" },
    { week: 4, title: "面向对象基础", color: "#9b6ec9", startDate: "2026-06-28", endDate: "2026-07-04" },
    { week: 5, title: "异常处理", color: "#c96b6b", startDate: "2026-07-05", endDate: "2026-07-11" },
    { week: 6, title: "常用库 (os, sys)", color: "#4a8ea3", startDate: "2026-07-12", endDate: "2026-07-18" },
    { week: 7, title: "数据结构深入", color: "#8b9eab", startDate: "2026-07-19", endDate: "2026-07-25" },
    { week: 8, title: "项目实战 I", color: "#6bb7df", startDate: "2026-07-26", endDate: "2026-08-01" },
    { week: 9, title: "项目实战 II", color: "#4aa375", startDate: "2026-08-02", endDate: "2026-08-08" },
    { week: 10, title: "代码审查与优化", color: "#c9902e", startDate: "2026-08-09", endDate: "2026-08-15" },
    { week: 11, title: "总复习与模拟", color: "#9b6ec9", startDate: "2026-08-16", endDate: "2026-08-22" },
    { week: 12, title: "最终冲刺", color: "#c96b6b", startDate: "2026-08-23", endDate: "2026-09-01" },
  ],
  qaMessages: [],
};

/* ====== localStorage 持久化 ====== */
const STORAGE_KEY = "ai_learning_board_state";

function saveState() {
  try {
    const toSave = {
      activeGoalId: state.activeGoalId,
      selectedTaskId: state.selectedTaskId,
      currentView: state.currentView,
      goals: state.goals,
      scores: state.scores,
      files: state.files,
      tasks: state.tasks,
      qaMessages: state.qaMessages || [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    // localStorage 可能满了，静默处理
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    // 合并：用 DEFAULT_STATE 做基础，已保存的字段覆盖
    return { ...DEFAULT_STATE, ...saved };
  } catch (e) {
    return null;
  }
}

const state = loadState() || { ...DEFAULT_STATE };

/* ====== AI API 配置（前端直连，无需后端） ====== */
const API_STORAGE_KEY = "ai_learning_board_api_config";

function loadApiConfig() {
  try {
    const raw = localStorage.getItem(API_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { key: "", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" };
  } catch { return { key: "", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" }; }
}

function saveApiConfig(cfg) {
  localStorage.setItem(API_STORAGE_KEY, JSON.stringify(cfg));
}

let apiConfig = loadApiConfig();

function updateApiIndicator() {
  const el = document.querySelector("#apiStatus");
  if (!el) return;
  if (apiConfig.key && !apiConfig.key.startsWith("sk-your-")) {
    el.className = "api-status online";
    el.title = `AI 已配置 (${apiConfig.model})`;
    el.textContent = "● AI 在线";
  } else {
    el.className = "api-status offline";
    el.title = "点击设置 AI API Key";
    el.textContent = "⚙ 设置";
  }
}

async function callAI(systemPrompt, userMessage, temperature = 0.7, maxTokens = 2000) {
  if (!apiConfig.key || apiConfig.key.startsWith("sk-your-")) {
    return null;
  }
  try {
    const res = await fetch(`${apiConfig.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiConfig.key}`,
      },
      body: JSON.stringify({
        model: apiConfig.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (e) {
    console.warn("AI 调用失败:", e.message);
    return null;
  }
}

async function testApiConnection(key, baseUrl, model) {
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "你好，请回复'连接成功'。" }],
        max_tokens: 20,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.error?.message || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ─── API 设置对话框 ────────────────────────────────
const apiDialog = document.querySelector("#apiDialog");
const apiKeyInput = document.querySelector("#apiKey");
const apiBaseUrlInput = document.querySelector("#apiBaseUrl");
const apiModelInput = document.querySelector("#apiModel");
const apiTestResult = document.querySelector("#apiTestResult");

function openApiDialog() {
  apiKeyInput.value = apiConfig.key;
  apiBaseUrlInput.value = apiConfig.baseUrl;
  apiModelInput.value = apiConfig.model;
  apiTestResult.textContent = "";
  apiTestResult.className = "api-test-result";
  apiDialog.showModal();
}

document.querySelector("#apiStatus").addEventListener("click", openApiDialog);
document.querySelector("#navSettings").addEventListener("click", openApiDialog);

document.querySelector("#cancelApiButton").addEventListener("click", () => apiDialog.close());

document.querySelector("#saveApiButton").addEventListener("click", () => {
  apiConfig = {
    key: apiKeyInput.value.trim(),
    baseUrl: apiBaseUrlInput.value.trim() || "https://api.openai.com/v1",
    model: apiModelInput.value.trim() || "gpt-4o-mini",
  };
  saveApiConfig(apiConfig);
  updateApiIndicator();
  apiDialog.close();
});

document.querySelector("#testApiButton").addEventListener("click", async () => {
  const key = apiKeyInput.value.trim();
  const baseUrl = apiBaseUrlInput.value.trim() || "https://api.openai.com/v1";
  const model = apiModelInput.value.trim() || "gpt-4o-mini";

  if (!key) {
    apiTestResult.textContent = "请先输入 API Key";
    apiTestResult.className = "api-test-result error";
    return;
  }

  apiTestResult.textContent = "测试中...";
  apiTestResult.className = "api-test-result testing";

  const result = await testApiConnection(key, baseUrl, model);
  if (result.ok) {
    apiTestResult.textContent = "✅ 连接成功！API 可用";
    apiTestResult.className = "api-test-result success";
  } else {
    apiTestResult.textContent = `❌ 连接失败：${result.error}`;
    apiTestResult.className = "api-test-result error";
  }
});

// 预设按钮
document.querySelectorAll(".preset-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const provider = btn.dataset.provider;
    const presets = {
      openai: { baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" },
      deepseek: { baseUrl: "https://api.deepseek.com/v1", model: "deepseek-chat" },
      qwen: { baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1", model: "qwen-plus" },
      zhipu: { baseUrl: "https://open.bigmodel.cn/api/paas/v4", model: "glm-4-flash" },
    };
    const p = presets[provider];
    if (p) {
      apiBaseUrlInput.value = p.baseUrl;
      apiModelInput.value = p.model;
    }
  });
});

// 初始化指示器
updateApiIndicator();

/* ====== PDF.js 初始化 ====== */
if (typeof pdfjsLib !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "pdf.worker.min.js";
}

/* ====== 清理旧数据（上一次存的占位符内容） ====== */
function cleanupOldFiles() {
  const cleaned = state.files.filter((f) => {
    if (!f.content) return false;
    if (f.content.startsWith("[PDF 文件]") || f.content.startsWith("[DOCX 文件]") || f.content === "[无法读取文件内容]" || f.content === "" || f.content === "解析中...") {
      return false;
    }
    return true;
  });
  if (cleaned.length !== state.files.length) {
    state.files = cleaned;
    saveState();
  }
}
cleanupOldFiles();

const scoreConfig = [
  { key: "sleep", label: "睡眠" },
  { key: "energy", label: "精力" },
  { key: "pressure", label: "压力" },
  { key: "focus", label: "专注" },
];

const elements = {
  goalList: document.querySelector("#goalList"),
  board: document.querySelector("#board"),
  scoreGroup: document.querySelector("#scoreGroup"),
  dailyScore: document.querySelector("#dailyScore"),
  activeGoalTitle: document.querySelector("#activeGoalTitle"),
  deadlineText: document.querySelector("#deadlineText"),
  daysLeftText: document.querySelector("#daysLeftText"),
  progressText: document.querySelector("#progressText"),
  weeklyStageTitle: document.querySelector("#weeklyStageTitle"),
  libraryList: document.querySelector("#libraryList"),
  libraryGrid: document.querySelector("#libraryGrid"),
  aiSuggestion: document.querySelector("#aiSuggestion"),
  taskForm: document.querySelector("#taskForm"),
  taskTitle: document.querySelector("#taskTitle"),
  taskDescription: document.querySelector("#taskDescription"),
  taskMinutes: document.querySelector("#taskMinutes"),
  taskDifficulty: document.querySelector("#taskDifficulty"),
  taskDueDate: document.querySelector("#taskDueDate"),
  deleteTaskButton: document.querySelector("#deleteTaskButton"),
  addTaskButton: document.querySelector("#addTaskButton"),
  addGoalButton: document.querySelector("#addGoalButton"),
  goalDialog: document.querySelector("#goalDialog"),
  goalForm: document.querySelector("#goalForm"),
  cancelGoalButton: document.querySelector("#cancelGoalButton"),
  uploadButton: document.querySelector("#uploadButton"),
  uploadButton2: document.querySelector("#uploadButton2"),
  fileInput: document.querySelector("#fileInput"),
  adjustPlanButton: document.querySelector("#adjustPlanButton"),
  generatePlanButton: document.querySelector("#generatePlanButton"),
  qaForm: document.querySelector("#qaForm"),
  qaInput: document.querySelector("#qaInput"),
  qaLog: document.querySelector("#qaLog"),
  dashboardView: document.querySelector("#dashboardView"),
  ganttView: document.querySelector("#ganttView"),
  libraryView: document.querySelector("#libraryView"),
  ganttChart: document.querySelector("#ganttChart"),
  navItems: document.querySelectorAll(".nav-item"),
  todayTaskCount: document.querySelector("#todayTaskCount"),
  todayDoneCount: document.querySelector("#todayDoneCount"),
};

function render() {
  renderGoals();
  renderScores();
  renderLibrary();
  renderLibraryGrid();
  renderHeader();
  renderBoard();
  renderGantt();
  renderTaskForm();
  renderTodayStats();
  renderQaMessages();
  switchView(state.currentView);
  saveState();
}

// API 状态已在模块顶部初始化

/* ====== 视图切换 ====== */
function switchView(view) {
  state.currentView = view;

  elements.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === view);
  });

  elements.dashboardView.style.display = view === "dashboard" ? "block" : "none";
  elements.ganttView.style.display = view === "gantt" ? "block" : "none";
  elements.libraryView.style.display = view === "library" ? "block" : "none";
}

elements.navItems.forEach((item) => {
  item.addEventListener("click", () => {
    switchView(item.dataset.view);
    if (item.dataset.view === "gantt") renderGantt();
  });
});

/* ====== 目标列表 ====== */
function renderGoals() {
  elements.goalList.innerHTML = "";

  state.goals.forEach((goal) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `goal-item${goal.id === state.activeGoalId ? " active" : ""}`;
    button.innerHTML = `<strong>${goal.title}</strong><span>${goal.deadline} · ${goal.dailyTime}</span>`;
    button.addEventListener("click", () => {
      state.activeGoalId = goal.id;
      render();
    });
    elements.goalList.appendChild(button);
  });
}

/* ====== 状态滑块 ====== */
let scoresInitialized = false;

function renderScores() {
  if (!scoresInitialized) {
    elements.scoreGroup.innerHTML = "";

    scoreConfig.forEach((item) => {
      const row = document.createElement("div");
      row.className = "score-row";
      row.innerHTML = `
        <span>${item.label}</span>
        <input type="range" min="1" max="10" value="${state.scores[item.key]}" data-score="${item.key}" aria-label="${item.label}" />
        <strong>${state.scores[item.key]}</strong>
      `;
      elements.scoreGroup.appendChild(row);
    });

    elements.scoreGroup.addEventListener("input", (event) => {
      const input = event.target.closest("input[data-score]");
      if (!input) return;
      const key = input.dataset.score;
      const display = input.nextElementSibling;
      state.scores[key] = Number(input.value);
      if (display) display.textContent = state.scores[key];
      elements.dailyScore.textContent = calculateScore().toFixed(1);
    });

    scoresInitialized = true;
  } else {
    elements.scoreGroup.querySelectorAll("input[data-score]").forEach((input) => {
      const key = input.dataset.score;
      input.value = state.scores[key];
      const display = input.nextElementSibling;
      if (display) display.textContent = state.scores[key];
    });
  }

  elements.dailyScore.textContent = calculateScore().toFixed(1);
}

function calculateScore() {
  const { sleep, energy, pressure, focus } = state.scores;
  const pressureBalance = 11 - pressure;
  return (sleep + energy + pressureBalance + focus) / 4;
}

/* ====== 学习库 ====== */
function getFilesForGoal(goalId) {
  return state.files.filter((f) => !f.goalId || f.goalId === goalId);
}

function allFilesForGoal(goalId) {
  return state.files.filter((f) => f.goalId === goalId);
}

function renderLibrary() {
  if (!elements.libraryList) return;
  elements.libraryList.innerHTML = "";

  const activeGoal = getActiveGoal();
  const goalFiles = state.files.filter((f) => !f.goalId || f.goalId === activeGoal.id);

  if (goalFiles.length === 0) {
    const empty = document.createElement("div");
    empty.className = "library-empty";
    if (state.files.length === 0) {
      empty.textContent = "暂无资料，点击 + 上传";
    } else {
      empty.textContent = `当前目标「${activeGoal.title}」暂无关联资料，切换到其他目标查看或上传新资料。`;
    }
    elements.libraryList.appendChild(empty);
    return;
  }

  goalFiles.forEach((file) => {
    const item = document.createElement("div");
    item.className = "library-item";
    const belongsToGoal = state.goals.find((g) => g.id === file.goalId);
    const goalName = belongsToGoal ? belongsToGoal.title : "未关联";

    item.innerHTML = `
      <div class="library-item-info">
        <strong>${file.name}</strong>
        <span class="library-item-goal-name">${goalName}</span>
      </div>
      <div class="library-item-meta">
        <select class="file-goal-select" data-file-id="${file.id}" title="切换关联目标">
          <option value="">关联目标...</option>
          ${state.goals.map((g) => `<option value="${g.id}" ${file.goalId === g.id ? "selected" : ""}>${g.title}</option>`).join("")}
        </select>
        <button class="icon-button library-delete" type="button" data-file-id="${file.id}" title="删除文件">×</button>
      </div>
    `;

    item.querySelector(".library-delete").addEventListener("click", (event) => {
      event.stopPropagation();
      state.files = state.files.filter((f) => f.id !== file.id);
      renderLibrary();
      renderLibraryGrid();
      saveState();
    });

    item.querySelector(".file-goal-select").addEventListener("change", (event) => {
      event.stopPropagation();
      file.goalId = event.target.value || undefined;
      renderLibrary();
      renderLibraryGrid();
      saveState();
    });

    elements.libraryList.appendChild(item);
  });
}

function renderLibraryGrid() {
  if (!elements.libraryGrid) return;
  elements.libraryGrid.innerHTML = "";

  if (state.files.length === 0) {
    const empty = document.createElement("div");
    empty.className = "library-empty";
    empty.textContent = "暂无资料，点击上方「上传资料」开始添加";
    elements.libraryGrid.appendChild(empty);
    return;
  }

  state.files.forEach((file) => {
    const belongsToGoal = state.goals.find((g) => g.id === file.goalId);
    const goalTag = belongsToGoal
      ? `<span class="file-goal-tag" style="background:${belongsToGoal.id === state.activeGoalId ? '#e8f4fd' : '#f3f4f6'};color:${belongsToGoal.id === state.activeGoalId ? 'var(--blue-strong)' : 'var(--muted)'}">${belongsToGoal.title}</span>`
      : `<span class="file-goal-tag" style="background:#fff4df;color:var(--amber)">未关联</span>`;

    const card = document.createElement("div");
    card.className = "library-card";
    card.innerHTML = `
      <div class="library-card-icon">${file.type === "PDF" ? "📄" : file.type === "DOCX" ? "📝" : "📁"}</div>
      <div class="library-card-info">
        <strong>${file.name}</strong>
        <span>${file.type} · ${file.content ? (file.content.length > 50 ? "已解析" : "待解析") : "空"}</span>
        ${goalTag}
      </div>
    `;
    elements.libraryGrid.appendChild(card);
  });
}

/* ====== 今日概览 ====== */
function renderTodayStats() {
  if (!elements.todayTaskCount || !elements.todayDoneCount) return;
  const todayTasks = state.tasks.filter((t) => t.column === "today" || t.column === "doing");
  const doneToday = state.tasks.filter((t) => t.column === "done");
  elements.todayTaskCount.textContent = String(todayTasks.length);
  elements.todayDoneCount.textContent = String(doneToday.length);
}

/* ====== 顶部信息栏 ====== */
function renderHeader() {
  const goal = getActiveGoal();
  const doneCount = state.tasks.filter((task) => task.column === "done").length;
  const progress = state.tasks.length ? Math.round((doneCount / state.tasks.length) * 100) : 0;

  elements.activeGoalTitle.textContent = goal.title;
  elements.deadlineText.textContent = goal.deadline;
  elements.daysLeftText.textContent = String(getDaysLeft(goal.deadline));
  elements.progressText.textContent = `${progress}%`;
  elements.weeklyStageTitle.textContent = goal.weeklyStage;
}

/* ====== 看板视图 ====== */
function renderBoard() {
  elements.board.innerHTML = "";

  boardColumns.forEach((column) => {
    const columnElement = document.createElement("section");
    columnElement.className = "board-column";
    columnElement.dataset.column = column.id;
    columnElement.innerHTML = `
      <div class="column-head">
        <h3>${column.title}</h3>
        <span class="count">${getTasksByColumn(column.id).length}</span>
      </div>
      <div class="task-list" data-list="${column.id}"></div>
    `;

    columnElement.addEventListener("dragover", (event) => event.preventDefault());
    columnElement.addEventListener("drop", () => moveDraggedTask(column.id));

    const list = columnElement.querySelector(".task-list");
    getTasksByColumn(column.id).forEach((task) => list.appendChild(createTaskCard(task)));
    elements.board.appendChild(columnElement);
  });
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = `task-card${task.id === state.selectedTaskId ? " selected" : ""}`;
  card.draggable = true;
  card.dataset.taskId = task.id;
  card.innerHTML = `
    <div class="task-top">
      <span class="task-meta">${task.stage}</span>
      <span class="task-meta">${task.dueDate}</span>
    </div>
    <h4>${task.title}</h4>
    <p>${task.description}</p>
    <div class="tag-row">
      <span class="tag">${task.minutes} 分钟</span>
      <span class="tag ${getDifficultyClass(task.difficulty)}">${task.difficulty}</span>
    </div>
    <div class="task-actions">
      ${task.column !== "done" ? `<button class="task-complete-btn" type="button" title="标记完成">✓ 完成</button>` : ""}
    </div>
  `;

  card.addEventListener("click", () => {
    state.selectedTaskId = task.id;
    render();
  });

  const completeBtn = card.querySelector(".task-complete-btn");
  if (completeBtn) {
    completeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      task.column = "done";
      state.selectedTaskId = task.id;
      render();
    });
  }

  card.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", task.id);
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", () => card.classList.remove("dragging"));

  return card;
}

/* ====== 甘特图视图 ====== */
function renderGantt() {
  if (!elements.ganttChart) return;
  elements.ganttChart.innerHTML = "";

  const totalWeeks = state.phases.length;
  const today = new Date();

  // 图例
  const legend = document.createElement("div");
  legend.className = "gantt-legend";
  legend.innerHTML = `
    <span class="legend-item"><span class="legend-dot" style="background:#4aa375"></span>已完成</span>
    <span class="legend-item"><span class="legend-dot" style="background:#6bb7df"></span>进行中</span>
    <span class="legend-item"><span class="legend-dot" style="background:#8b9eab"></span>待开始</span>
    <span class="legend-item"><span class="legend-dot" style="background:#c9902e"></span>今日</span>
    <span class="legend-item"><span class="legend-dot" style="background:var(--line)"></span>点击编辑</span>
  `;
  elements.ganttChart.appendChild(legend);

  // 阶段行
  const phaseSection = document.createElement("div");
  phaseSection.className = "gantt-section";
  phaseSection.innerHTML = `<div class="gantt-section-head"><h3 class="gantt-section-title">阶段规划</h3><button class="ghost-button add-phase-btn" id="addPhaseBtn" type="button">+ 添加阶段</button></div>`;

  const phaseGrid = document.createElement("div");
  phaseGrid.className = "gantt-grid";

  // 左侧标签列
  const phaseLabels = document.createElement("div");
  phaseLabels.className = "gantt-labels";
  phaseLabels.innerHTML = `<div class="gantt-label-header">阶段</div>`;
  state.phases.forEach((phase) => {
    const label = document.createElement("div");
    label.className = "gantt-label";
    label.innerHTML = `<span class="gantt-label-week">W${phase.week}</span> ${phase.title}`;
    phaseLabels.appendChild(label);
  });
  phaseGrid.appendChild(phaseLabels);

  // 右侧甘特条
  const phaseBars = document.createElement("div");
  phaseBars.className = "gantt-bars";
  phaseBars.style.gridTemplateColumns = `repeat(${totalWeeks}, 1fr)`;

  // 表头
  state.phases.forEach((phase) => {
    const header = document.createElement("div");
    header.className = "gantt-bar-header";
    header.textContent = `W${phase.week}`;
    phaseBars.appendChild(header);
  });

  state.phases.forEach((phase) => {
    state.phases.forEach((col, colIdx) => {
      const cell = document.createElement("div");
      cell.className = "gantt-cell";
      if (colIdx === phase.week) {
        const bar = document.createElement("div");
        bar.className = "gantt-bar phase-bar editable";
        bar.style.background = phase.color;
        bar.textContent = phase.title;
        bar.title = `点击编辑「${phase.title}」`;
        bar.addEventListener("click", () => openPhaseDialog(phase));
        cell.appendChild(bar);
      }
      phaseBars.appendChild(cell);
    });
  });

  phaseGrid.appendChild(phaseBars);
  phaseSection.appendChild(phaseGrid);
  elements.ganttChart.appendChild(phaseSection);

  // 任务行
  const taskSection = document.createElement("div");
  taskSection.className = "gantt-section";
  taskSection.innerHTML = `<h3 class="gantt-section-title">任务分配</h3>`;

  const taskGrid = document.createElement("div");
  taskGrid.className = "gantt-grid";

  const taskLabels = document.createElement("div");
  taskLabels.className = "gantt-labels";
  taskLabels.innerHTML = `<div class="gantt-label-header">任务</div>`;
  state.tasks.forEach((task) => {
    const label = document.createElement("div");
    label.className = "gantt-label";
    const statusIcon = task.column === "done" ? "✓" : task.column === "doing" ? "◉" : "○";
    label.innerHTML = `<span class="gantt-label-status">${statusIcon}</span> ${task.title}`;
    taskLabels.appendChild(label);
  });
  taskGrid.appendChild(taskLabels);

  const taskBars = document.createElement("div");
  taskBars.className = "gantt-bars";
  taskBars.style.gridTemplateColumns = `repeat(${totalWeeks}, 1fr)`;

  state.phases.forEach((phase) => {
    const header = document.createElement("div");
    header.className = "gantt-bar-header";
    header.textContent = `W${phase.week}`;
    taskBars.appendChild(header);
  });

  state.tasks.forEach((task) => {
    const startWeek = task.startWeek || 1;
    const durationWeeks = task.durationWeeks || 1;
    state.phases.forEach((col, colIdx) => {
      const cell = document.createElement("div");
      cell.className = "gantt-cell";
      if (colIdx === startWeek) {
        const barColor = task.column === "done" ? "var(--green)" :
                         task.column === "doing" ? "var(--blue)" : "var(--muted)";
        const bar = document.createElement("div");
        bar.className = "gantt-bar task-bar editable";
        bar.style.background = barColor;
        bar.style.width = `${Math.min(durationWeeks * 100, (totalWeeks - startWeek) * 100)}%`;
        bar.textContent = task.title;
        bar.title = `点击选中「${task.title}」— 可在右侧面板编辑`;
        bar.addEventListener("click", () => {
          state.selectedTaskId = task.id;
          state.currentView = "dashboard";
          render();
        });
        cell.appendChild(bar);
      }
      taskBars.appendChild(cell);
    });
  });

  taskGrid.appendChild(taskBars);
  taskSection.appendChild(taskGrid);
  elements.ganttChart.appendChild(taskSection);

  // 添加阶段按钮事件
  document.querySelector("#addPhaseBtn")?.addEventListener("click", () => {
    const newPhase = {
      week: state.phases.length,
      title: "新阶段",
      color: "#6bb7df",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split("T")[0],
    };
    state.phases.push(newPhase);
    render();
    saveState();
  });
}

/* ====== 阶段编辑对话框 ====== */
let editingPhase = null;

function openPhaseDialog(phase) {
  editingPhase = phase;
  document.querySelector("#phaseTitle").value = phase.title;
  document.querySelector("#phaseStartDate").value = phase.startDate;
  document.querySelector("#phaseEndDate").value = phase.endDate;
  document.querySelector("#phaseColor").value = phase.color;
  document.querySelector("#phaseDialog").showModal();
}

document.querySelector("#cancelPhaseButton")?.addEventListener("click", () => {
  document.querySelector("#phaseDialog").close();
  editingPhase = null;
});

document.querySelector("#savePhaseButton")?.addEventListener("click", () => {
  if (!editingPhase) return;
  editingPhase.title = document.querySelector("#phaseTitle").value.trim() || editingPhase.title;
  editingPhase.startDate = document.querySelector("#phaseStartDate").value;
  editingPhase.endDate = document.querySelector("#phaseEndDate").value;
  editingPhase.color = document.querySelector("#phaseColor").value;
  document.querySelector("#phaseDialog").close();
  editingPhase = null;
  render();
  saveState();
});

/* ====== 任务表单 ====== */
function renderTaskForm() {
  const task = getSelectedTask();
  if (!task) {
    elements.taskForm.reset();
    elements.deleteTaskButton.disabled = true;
    return;
  }

  elements.deleteTaskButton.disabled = false;
  elements.taskTitle.value = task.title;
  elements.taskDescription.value = task.description;
  elements.taskMinutes.value = task.minutes;
  elements.taskDifficulty.value = task.difficulty;
  elements.taskDueDate.value = task.dueDate;
}

function moveDraggedTask(columnId) {
  const dragging = document.querySelector(".task-card.dragging");
  if (!dragging) return;

  const task = state.tasks.find((item) => item.id === dragging.dataset.taskId);
  if (!task) return;

  task.column = columnId;
  state.selectedTaskId = task.id;
  render();
}

/* ====== 辅助函数 ====== */
function getActiveGoal() {
  return state.goals.find((goal) => goal.id === state.activeGoalId) || state.goals[0];
}

function getSelectedTask() {
  return state.tasks.find((task) => task.id === state.selectedTaskId);
}

function getTasksByColumn(columnId) {
  return state.tasks.filter((task) => task.column === columnId);
}

function getDifficultyClass(difficulty) {
  if (difficulty === "轻松") return "easy";
  if (difficulty === "较难") return "hard";
  return "medium";
}

function getDaysLeft(deadline) {
  const today = new Date();
  const end = new Date(`${deadline}T23:59:59`);
  const dayLength = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((end - today) / dayLength));
}

function updateSuggestion() {
  const score = calculateScore();
  let suggestion = "今天适合保持稳定节奏，先完成一个核心任务，再安排一段轻量复习。";

  if (score >= 8) {
    suggestion = "你今天整体状态很好，可以安排一个较有挑战的核心任务，并保留短时间复习。";
  } else if (score < 5) {
    suggestion = "你今天状态偏低，建议降低新知识任务量，把重点放在复习、整理笔记和简单练习上。";
  } else if (state.scores.pressure >= 8) {
    suggestion = "你今天压力偏高，建议只保留最关键的一项任务，其余任务可以温和顺延。";
  }

  elements.aiSuggestion.textContent = suggestion;
}

/* ====== 事件绑定 ====== */
elements.taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const task = getSelectedTask();
  if (!task) return;

  task.title = elements.taskTitle.value.trim() || "未命名任务";
  task.description = elements.taskDescription.value.trim();
  task.minutes = Number(elements.taskMinutes.value) || 30;
  task.difficulty = elements.taskDifficulty.value;
  task.dueDate = elements.taskDueDate.value;
  render();
});

elements.deleteTaskButton.addEventListener("click", () => {
  const task = getSelectedTask();
  if (!task) return;

  if (!confirm(`确定要删除任务「${task.title}」吗？此操作不可撤销。`)) return;

  const index = state.tasks.findIndex((item) => item.id === task.id);
  state.tasks.splice(index, 1);
  state.selectedTaskId = state.tasks[0]?.id || "";
  render();
});

elements.addTaskButton.addEventListener("click", () => {
  const goal = getActiveGoal();
  const task = {
    id: `task-${Date.now()}`,
    column: "todo",
    title: "新的学习任务",
    description: "补充任务说明。",
    minutes: 30,
    difficulty: "适中",
    dueDate: goal.deadline,
    stage: "手动添加",
    startWeek: 1,
    durationWeeks: 1,
  };
  state.tasks.unshift(task);
  state.selectedTaskId = task.id;
  render();
});

elements.addGoalButton.addEventListener("click", () => {
  elements.goalDialog.showModal();
});

elements.cancelGoalButton.addEventListener("click", () => {
  elements.goalDialog.close();
});

elements.goalForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = document.querySelector("#goalTitle").value.trim();
  const deadline = document.querySelector("#goalDeadline").value;
  const dailyTime = document.querySelector("#goalDailyTime").value.trim() || "60 分钟";
  const level = document.querySelector("#goalLevel").value;
  const note = document.querySelector("#goalNote").value.trim();

  if (!title) {
    document.querySelector("#goalTitle").focus();
    return;
  }
  if (!deadline) {
    document.querySelector("#goalDeadline").focus();
    return;
  }

  const goal = {
    id: `goal-${Date.now()}`,
    title,
    deadline,
    dailyTime,
    level,
    note,
    weeklyStage: "等待 AI 生成阶段计划",
  };

  state.goals.push(goal);
  state.activeGoalId = goal.id;
  elements.goalForm.reset();
  elements.goalDialog.close();
  render();
});

function handleFileUpload() {
  elements.fileInput.click();
}

if (elements.uploadButton) elements.uploadButton.addEventListener("click", handleFileUpload);
if (elements.uploadButton2) elements.uploadButton2.addEventListener("click", handleFileUpload);

elements.fileInput.addEventListener("change", async (event) => {
  const files = Array.from(event.target.files);
  if (files.length === 0) return;

  for (const file of files) {
    const extension = file.name.split(".").pop()?.toUpperCase() || "FILE";
    const fileEntry = {
      id: `file-${Date.now()}-${file.name}`,
      name: file.name,
      type: extension,
      size: file.size,
      goalId: state.activeGoalId,
      content: "解析中...",
    };
    state.files.push(fileEntry);
    renderLibrary();
    renderLibraryGrid();

    try {
      if (extension === "PDF" && typeof pdfjsLib !== "undefined") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(" ");
          pages.push(pageText);
        }
        fileEntry.content = pages.join("\n\n") || `[PDF 文件] ${file.name} — 未检测到文本内容（可能是扫描件）。`;
      } else if ((extension === "DOCX" || extension === "DOC") && typeof mammoth !== "undefined") {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        fileEntry.content = result.value.trim() || `[DOCX 文件] ${file.name} — 未提取到文本内容。`;
      } else if (extension === "TXT" || extension === "MD" || extension === "CSV" || extension === "JSON") {
        fileEntry.content = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => resolve("[无法读取文件内容]");
          reader.readAsText(file);
        });
      } else {
        fileEntry.content = `[${extension} 文件] ${file.name} — 已上传，暂不支持预览。`;
      }
    } catch (e) {
      fileEntry.content = `[${extension} 解析失败] ${file.name} — ${e.message}`;
      console.warn("文件解析失败:", file.name, e);
    }

    renderLibrary();
    renderLibraryGrid();
    saveState();
  }

  elements.fileInput.value = "";
});

async function handleAdjustPlan() {
  const goal = getActiveGoal();
  const btn = elements.adjustPlanButton;
  btn.disabled = true;
  btn.textContent = "AI 分析中...";

  const systemPrompt = "你是一个温和的学习助手，根据用户今日状态（睡眠、精力、压力、专注）给出1-2句简短、具体、可执行的今日学习建议。只输出建议文本。";
  const userMessage = `目标：${goal.title}（${goal.weeklyStage}）
状态：睡眠${state.scores.sleep}/10 精力${state.scores.energy}/10 压力${state.scores.pressure}/10 专注${state.scores.focus}/10
今日任务：${state.tasks.filter((t) => t.column === "today" || t.column === "doing").map((t) => t.title).join("；") || "暂无"}`;

  const result = await callAI(systemPrompt, userMessage, 0.8, 200);

  btn.disabled = false;
  btn.textContent = "生成今日建议";

  if (result) {
    elements.aiSuggestion.textContent = result.trim();
    flashElement(elements.aiSuggestion);
  } else if (!apiConfig.key || apiConfig.key.startsWith("sk-your-")) {
    elements.aiSuggestion.innerHTML = `⚠️ 尚未配置 AI API Key，<a href="javascript:void(0)" onclick="openApiDialog()" style="color:var(--blue-strong);text-decoration:underline;cursor:pointer">点击这里设置</a>，或使用左侧「AI 设置」菜单。`;
    flashElement(elements.aiSuggestion);
  } else {
    updateSuggestion();
    flashElement(elements.aiSuggestion);
  }
}

elements.adjustPlanButton.addEventListener("click", handleAdjustPlan);

async function handleGeneratePlan() {
  const goal = getActiveGoal();
  const btn = elements.generatePlanButton;
  btn.disabled = true;
  btn.textContent = "AI 生成中...";

  const systemPrompt = `你是一个专业的课程设计师。根据用户的学习目标、截止日期、每日学习时间和基础水平，生成一个结构化的学习计划。
你必须返回纯 JSON 格式，不要包含 markdown 代码块标记：
{
  "weekly_stage": "当前阶段的简短描述",
  "suggestion": "给用户的鼓励和建议",
  "phases": [
    { "week": 0, "title": "准备阶段", "color": "#8b9eab", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD" }
  ],
  "tasks": [
    { "title": "任务名称", "description": "任务描述", "minutes": 30, "difficulty": "适中", "stage": "第1周", "startWeek": 1, "durationWeeks": 1 }
  ]
}
phase 的 week 从 0 开始，共 12 周。tasks 生成 8-12 个任务。difficulty 只能是 轻松/适中/较难。`;

  const materialsText = getFilesForGoal(goal.id).map((f) => `${f.name}:\n${f.content || ""}`).join("\n\n");
  const userMessage = `学习目标：${goal.title}
截止日期：${goal.deadline}
每日学习时间：${goal.dailyTime}
当前基础：${goal.level}
备注：${goal.note}
学习资料：
${materialsText || "无"}`;

  const result = await callAI(systemPrompt, userMessage, 0.7, 3000);

  btn.disabled = false;
  btn.textContent = "生成初始计划";

  if (result) {
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      if (parsed) {
        goal.weeklyStage = parsed.weekly_stage || "AI 生成阶段";
        if (parsed.phases && parsed.phases.length > 0) {
          state.phases = parsed.phases;
        }
        if (parsed.tasks && parsed.tasks.length > 0) {
          const newTasks = parsed.tasks.map((t, i) => ({
            id: `task-ai-${Date.now()}-${i}`,
            column: i < 2 ? "today" : "todo",
            title: t.title,
            description: t.description || "",
            minutes: t.minutes || 30,
            difficulty: t.difficulty || "适中",
            dueDate: goal.deadline,
            stage: t.stage || parsed.weekly_stage || "AI 生成",
            startWeek: t.startWeek || 1,
            durationWeeks: t.durationWeeks || 1,
          }));
          state.tasks = [...newTasks, ...state.tasks.filter((t) => t.column === "done")];
        }
        elements.aiSuggestion.textContent = parsed.suggestion || "计划已生成，开始学习吧！";
        flashElement(elements.aiSuggestion);
      }
    } catch (e) {
      elements.aiSuggestion.textContent = "AI 返回格式异常，请重试。";
    }
  } else {
    goal.weeklyStage = "AI 计划占位：资料解析、阶段拆分、每日任务生成";
    elements.aiSuggestion.textContent = "AI 服务暂不可用，已使用本地模式。点击侧栏「⚙ 设置」配置 API Key 后解锁完整功能。";
  }
  render();
}

elements.generatePlanButton.addEventListener("click", handleGeneratePlan);

elements.qaForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = elements.qaInput.value.trim();
  if (!question) return;

  appendQaMessage(question, "user");
  elements.qaInput.value = "";
  elements.qaInput.disabled = true;

  // 先尝试 AI 接口
  const goal = getActiveGoal();
  const materialsText = getFilesForGoal(goal.id).map((f) => `${f.name}:\n${f.content || ""}`).join("\n\n");
  const historyText = (state.qaMessages || []).slice(-6).map((m) => `${m.type === "user" ? "用户" : "助手"}: ${m.message}`).join("\n");

  const systemPrompt = "你是学习助手，根据用户提供的学习资料回答问题。如果资料中没有相关内容，诚实告知。回答简洁，不超过200字。";
  const userMessage = `学习资料：\n${materialsText || "无"}\n\n对话历史：\n${historyText}\n\n用户问题：${question}`;

  const result = await callAI(systemPrompt, userMessage, 0.5, 500);

  if (result) {
    appendQaMessage(result.trim(), "assistant");
  } else {
    // 回退到本地搜索
    const answer = searchFiles(question);
    appendQaMessage(answer, "assistant");
  }

  elements.qaInput.disabled = false;
  elements.qaInput.focus();
  saveState();
});

function searchFiles(query) {
  const activeGoal = getActiveGoal();
  const goalFiles = getFilesForGoal(activeGoal.id);

  if (goalFiles.length === 0) {
    return "当前目标还没有关联任何学习资料，请在侧栏「学习资料」面板上传文件，并确认文件已关联到当前目标。";
  }

  const cleaned = query.replace(/[？?！!，,。.、\s]+/g, " ").trim().toLowerCase();
  if (!cleaned) {
    return "请描述你想了解的内容，我会在已上传的资料中帮你查找。";
  }

  // 关键词拆分：空格分隔的词 + 中文字符级匹配作为补充
  const spaceKeywords = cleaned.split(" ").filter(Boolean);
  const hasChinese = /[\u4e00-\u9fff]/.test(cleaned);
  const charKeywords = hasChinese
    ? (cleaned.match(/[\u4e00-\u9fff]{2,3}/g) || []).filter((k) => k.length >= 2)
    : [];
  const allKeywords = [...new Set([...spaceKeywords, ...charKeywords])];

  if (allKeywords.length === 0) {
    allKeywords.push(cleaned);
  }

  let bestMatch = null;
  let bestScore = 0;

  goalFiles.forEach((file) => {
    if (!file.content) return;
    const contentLower = file.content.toLowerCase();
    let score = 0;
    allKeywords.forEach((kw) => {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const count = (contentLower.match(new RegExp(escaped, 'g')) || []).length;
      score += count;
    });
    if (score > bestScore) {
      bestScore = score;
      bestMatch = file;
    }
  });

  if (!bestMatch || bestScore === 0) {
    return `在「${activeGoal.title}」关联的 ${goalFiles.length} 份资料中没有找到与「${query}」直接相关的内容。你可以尝试换一个关键词，或者上传更多相关资料。`;
  }

  // 提取相关片段
  const lines = bestMatch.content.split("\n");
  const relevantLines = lines.filter((line) =>
    allKeywords.some((kw) => line.toLowerCase().includes(kw))
  );

  if (relevantLines.length > 0) {
    return `📂 在「${bestMatch.name}」中找到相关内容：\n\n${relevantLines.slice(0, 5).join("\n")}${relevantLines.length > 5 ? "\n..." : ""}`;
  }

  return `📂 在「${bestMatch.name}」中找到了相关内容，但无法提取具体片段。请查看原文。`;
}

function appendQaMessage(message, type) {
  state.qaMessages = state.qaMessages || [];
  state.qaMessages.push({ message, type, time: Date.now() });
  // 限制最多保留 50 条
  if (state.qaMessages.length > 50) state.qaMessages = state.qaMessages.slice(-50);

  const node = document.createElement("div");
  node.className = `qa-message ${type}`;
  node.textContent = message;
  elements.qaLog.appendChild(node);
  elements.qaLog.scrollTop = elements.qaLog.scrollHeight;
}

function renderQaMessages() {
  if (!elements.qaLog) return;
  elements.qaLog.innerHTML = "";
  (state.qaMessages || []).forEach((msg) => {
    const node = document.createElement("div");
    node.className = `qa-message ${msg.type}`;
    node.textContent = msg.message;
    elements.qaLog.appendChild(node);
  });
  if ((state.qaMessages || []).length === 0) {
    const node = document.createElement("div");
    node.className = "qa-message assistant";
    node.textContent = "可以基于已上传资料回答问题。";
    elements.qaLog.appendChild(node);
  }
  elements.qaLog.scrollTop = elements.qaLog.scrollHeight;
}

function flashElement(element) {
  element.classList.add("flash-highlight");
  setTimeout(() => element.classList.remove("flash-highlight"), 800);
}

render();