/* ==================== 好日子 · 交互逻辑 ==================== */

// 全局状态
let STATE = {
  currentPage: "choose",
  currentEvent: null,
  chatMessages: [],
  chatStep: 0,        // 0: 未开始, 1: 已问时间, 2: 已问偏好, 3: 推荐中, 4: 已选日期, 5: 已问清单
  selectedDate: null,
  plans: [],
  currentPlanId: null,
  plansFilter: "active",
  editingItem: null,
  confirmAction: null
};

// ===== 初始化 =====
document.addEventListener("DOMContentLoaded", function() {
  STATE.plans = loadPlans();
  renderEventGrid();
  renderBrowse();
  renderPlans();
  initTabbar();
});

// ===== 通用工具 =====
function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

function showToast(msg, duration) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), duration || 2000);
}

function formatDate(dateStr) {
  const parts = dateStr.split("-");
  return `${parseInt(parts[1])}月${parseInt(parts[2])}日`;
}

// ===== 页面切换 =====
function goToPage(pageName) {
  STATE.currentPage = pageName;
  $$(".page").forEach(p => p.classList.remove("active"));
  const target = document.querySelector(`.page[data-page="${pageName}"]`);
  if (target) target.classList.add("active");

  // 更新底部导航
  $$(".tab").forEach(t => t.classList.remove("active"));
  const activeTab = document.querySelector(`.tab[data-tab="${pageName}"]`);
  if (activeTab) activeTab.classList.add("active");

  // 页面特殊处理
  if (pageName === "choose") {
    resetChoosePage();
  }
  window.scrollTo(0, 0);
}

function initTabbar() {
  // 底部导航已经在 HTML 中绑定 onclick
}

// ===== 择好日 · 事件网格 =====
function renderEventGrid() {
  const grid = $("#eventGrid");
  if (!grid) return;
  grid.innerHTML = EVENTS.map(ev => `
    <div class="event-card" onclick="startChat('${ev.key}')">
      <div class="ec-icon">${ev.iconSvg}</div>
      <div class="ec-name">${ev.name}</div>
      <div class="ec-hint">${ev.hint}</div>
    </div>
  `).join("");
}

function submitMainInput() {
  const input = $("#mainInput");
  const val = input.value.trim();
  if (!val) {
    showToast("说说你想办什么大事？");
    return;
  }
  // 关键词匹配
  let matched = null;
  const kwMap = {
    "车": "car", "提车": "car", "提新车": "car", "买车": "car",
    "搬家": "move", "乔迁": "move", "入住": "move",
    "装修": "decor", "动工": "decor", "开工": "decor",
    "签约": "sign", "签合同": "sign", "签字": "sign",
    "开业": "open", "开张": "open", "开店": "open",
    "买房": "house", "收房": "house", "房产": "house"
  };
  for (const kw in kwMap) {
    if (val.includes(kw)) { matched = kwMap[kw]; break; }
  }
  if (matched) {
    startChat(matched, val);
  } else {
    // 未识别，进入通用对话
    startChat("car", val);
    setTimeout(() => {
      addAIMessage(`我听到你说："${val}"。我可以帮你挑选提车、搬家、装修、签约、开业、买房这些大事的好日子。你想先从哪件事开始？`);
      renderQuickOptions(EVENTS.map(e => ({
        label: e.name,
        action: () => startChat(e.key)
      })));
    }, 600);
  }
}

// ===== 择好日 · 聊天流程 =====
function resetChoosePage() {
  const chatArea = $("#chatArea");
  const entry = $("#chooseEntry");
  if (chatArea) chatArea.style.display = "none";
  if (entry) entry.style.display = "block";
  STATE.currentEvent = null;
  STATE.chatMessages = [];
  STATE.chatStep = 0;
  STATE.selectedDate = null;
}

function startChat(eventKey, userMsg) {
  STATE.currentEvent = eventKey;
  STATE.chatMessages = [];
  STATE.chatStep = 0;
  STATE.selectedDate = null;

  // 切换到聊天视图
  const entry = $("#chooseEntry");
  const chatArea = $("#chatArea");
  if (entry) entry.style.display = "none";
  if (chatArea) chatArea.style.display = "block";

  const chatScroll = $("#chatScroll");
  if (chatScroll) chatScroll.innerHTML = "";

  const ev = EVENTS.find(e => e.key === eventKey);
  if (!ev) return;

  // 用户消息
  if (userMsg) {
    addUserMessage(userMsg);
  } else {
    addUserMessage(`我最近想${ev.name}，帮我挑个好日子`);
  }

  // AI 第一轮：介绍 + 问时间
  setTimeout(() => {
    const rec = RECOMMENDATIONS[eventKey];
    addAIMessage(`好，我先按"${ev.name}"帮你看。${rec ? rec.intro : ""} 你大概想什么时候${ev.name}？`);
    renderQuickOptions([
      { label: "本周", action: () => pickTimeRange("本周") },
      { label: "下周", action: () => pickTimeRange("下周") },
      { label: "本月内", action: () => pickTimeRange("本月内") },
      { label: "我自己选日期", action: () => openCalendarModal() }
    ]);
    STATE.chatStep = 1;
  }, 700);
}

function pickTimeRange(range) {
  addUserMessage(`选在${range}`);
  setTimeout(() => {
    addAIMessage(`明白了。再问一句，你更看重哪一点？`);
    renderQuickOptions([
      { label: "黄历更合适", action: () => pickPreference("黄历更合适") },
      { label: "周末更方便", action: () => pickPreference("周末更方便") },
      { label: "上午好办理", action: () => pickPreference("上午好办理") },
      { label: "都可以", action: () => pickPreference("都可以") }
    ]);
    STATE.chatStep = 2;
  }, 500);
}

function pickPreference(pref) {
  addUserMessage(pref);
  setTimeout(() => {
    addAIMessage(`收到～我帮你筛出了 3 个比较合适的选择，你可以按自己的实际情况选。`);
    setTimeout(() => renderRecommendDates(), 400);
    STATE.chatStep = 3;
  }, 500);
}

function renderRecommendDates() {
  const rec = RECOMMENDATIONS[STATE.currentEvent];
  if (!rec) return;
  window._currentRecDates = rec.dates;

  const chatScroll = $("#chatScroll");
  const block = document.createElement("div");
  block.className = "msg msg-ai";
  block.innerHTML = rec.dates.map((d, i) => `
    <div class="rc-card">
      <div class="rc-top">
        <div class="rc-date-num">${d.day}</div>
        <div>
          <div class="rc-date-text">${d.month}月${d.day}日 ${d.weekday}</div>
          <div class="rc-time">建议时间 · ${d.time}</div>
        </div>
        <div class="rc-tag ${d.tag}">${d.tagText}</div>
      </div>
      <div class="rc-divider"></div>
      <div class="rc-row">
        <div class="rc-row-label">适合原因</div>
        <div>${d.reason}</div>
        <div class="rc-tags">${d.tags.map(t => `<span>${t}</span>`).join("")}</div>
      </div>
      <div class="rc-note"><b>现实提醒：</b>${d.reminder}</div>
      <button class="rc-btn" data-date-idx="${i}">选这个日子</button>
    </div>
  `).join("") + `
    <div class="rec-bottom-btns">
      <button data-action="refresh">换一批日子</button>
      <button data-action="restart">调整条件</button>
    </div>
  `;
  // 绑定点击事件
  block.querySelectorAll(".rc-btn[data-date-idx]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-date-idx"), 10);
      pickDate(window._currentRecDates[idx]);
    });
  });
  block.querySelectorAll("[data-action='refresh']").forEach(btn => {
    btn.addEventListener("click", refreshRecommend);
  });
  block.querySelectorAll("[data-action='restart']").forEach(btn => {
    btn.addEventListener("click", restartChat);
  });
  chatScroll.appendChild(block);
  scrollChatToBottom();
}

function pickDate(dateData) {
  STATE.selectedDate = dateData;
  addUserMessage(`我选 ${dateData.month}月${dateData.day}日 ${dateData.weekday}`);

  const ev = EVENTS.find(e => e.key === STATE.currentEvent);
  setTimeout(() => {
    addAIMessage(`好，那我先帮你把 <b>${dateData.month}月${dateData.day}日 ${dateData.weekday}</b> 上午定为"${ev.name}好日子"。<br><br>这天适合办理交付、付款、开车回家这类事情。建议你上午去，时间更从容，也方便检查车辆和处理手续。<br><br>要不要我顺手帮你生成一份「${ev.name}办好事清单」？`);

    renderQuickOptions([
      { label: "生成清单并加入办好事", action: () => generateChecklistAndSave(dateData, true), primary: true },
      { label: "先只保存日子", action: () => generateChecklistAndSave(dateData, false) }
    ]);
    STATE.chatStep = 4;
  }, 700);
}

function refreshRecommend() {
  addUserMessage("换一批日子看看");
  setTimeout(() => {
    addAIMessage("没问题～我再帮你看看其他合适的日子。以下日期也可以考虑：");
    const rec = RECOMMENDATIONS[STATE.currentEvent];
    if (!rec) return;
    // 对日期数据做轻微修改以模拟"换一批"
    const altDates = rec.dates.map((d, i) => ({
      ...d,
      day: d.day + (i + 1) * 2,
      reason: `换一批 · ${d.reason}`,
      tag: "alt",
      tagText: "备选"
    }));
    window._currentRecDates = altDates;
    const chatScroll = $("#chatScroll");
    const block = document.createElement("div");
    block.className = "msg msg-ai";
    block.innerHTML = altDates.map((d, i) => `
      <div class="rc-card">
        <div class="rc-top">
          <div class="rc-date-num">${d.day}</div>
          <div>
            <div class="rc-date-text">${d.month}月${d.day}日</div>
            <div class="rc-time">建议时间 · ${d.time}</div>
          </div>
          <div class="rc-tag ${d.tag}">${d.tagText}</div>
        </div>
        <div class="rc-divider"></div>
        <div class="rc-row">
          <div class="rc-row-label">适合原因</div>
          <div>${d.reason}</div>
          <div class="rc-tags">${d.tags.map(t => `<span>${t}</span>`).join("")}</div>
        </div>
        <div class="rc-note"><b>现实提醒：</b>${d.reminder}</div>
        <button class="rc-btn" data-alt-date-idx="${i}">选这个日子</button>
      </div>
    `).join("");
    block.querySelectorAll(".rc-btn[data-alt-date-idx]").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-alt-date-idx"), 10);
        pickDate(window._currentRecDates[idx]);
      });
    });
    chatScroll.appendChild(block);
    scrollChatToBottom();
  }, 500);
}

function restartChat() {
  startChat(STATE.currentEvent);
}

// 生成清单并保存
function generateChecklistAndSave(dateData, withList) {
  const ev = EVENTS.find(e => e.key === STATE.currentEvent);
  if (withList) {
    addUserMessage("生成清单并加入办好事");
    setTimeout(() => {
      addAIMessage(`已加入「办好事」。<br>我帮你整理了办事事项清单，涵盖证件资料、手续确认、车辆检查、当天建议等几大类。涉及车管所、保险、银行等外部机构的事项，我也加了备注提醒，你可以后续自己修改或补充。`);

      // 创建新计划
      const checklist = CHECKLISTS[STATE.currentEvent];
      const newPlan = {
        id: "plan_" + Date.now(),
        eventKey: STATE.currentEvent,
        title: (checklist ? checklist.title : ev.name + "计划"),
        date: dateData.date,
        dateText: `${dateData.month}月${dateData.day}日 ${dateData.weekday}`,
        time: dateData.time,
        status: "preparing",
        statusText: "准备中",
        summary: dateData.reason,
        tag: dateData.tagText,
        checklist: checklist ? checklist.groups.map(g => ({
          groupName: g.name,
          items: g.items.map((it, idx) => ({
            id: `${g.name}_${idx}_${Date.now()}`,
            text: it.text,
            checked: false,
            tags: it.tags || [],
            note: it.note || "",
            reminder: it.reminder || ""
          }))
        })) : []
      };
      STATE.plans.unshift(newPlan);
      savePlans(STATE.plans);

      renderPlanCreatedCard(newPlan);
      STATE.chatStep = 5;
    }, 600);
  } else {
    addUserMessage("先只保存日子");
    setTimeout(() => {
      addAIMessage(`好的，已帮你把 <b>${dateData.month}月${dateData.day}日 ${dateData.weekday}</b> 记下来。<br>随时可以回来补充清单，我也会帮你梳理。`);
      showToast("已保存这个好日子");
    }, 500);
  }
}

function renderPlanCreatedCard(plan) {
  const chatScroll = $("#chatScroll");
  const block = document.createElement("div");
  block.className = "msg msg-ai";
  block.innerHTML = `
    <div class="plan-success-card">
      <div class="psc-title">${plan.title} 已创建</div>
      <div class="psc-date">${plan.dateText} · ${plan.time}</div>
      <div class="psc-progress">
        <div class="psc-progress-bar"><div class="psc-progress-fill" style="width: 0%"></div></div>
        <div class="psc-progress-num">清单 · 0/${countPlanTotal(plan)}</div>
      </div>
      <button class="psc-btn" onclick="goToPlanDetail('${plan.id}')">查看办好事计划</button>
    </div>
  `;
  chatScroll.appendChild(block);
  scrollChatToBottom();
  renderPlans();
}

// ===== 聊天消息渲染 =====
function addAIMessage(html) {
  const chatScroll = $("#chatScroll");
  const msg = document.createElement("div");
  msg.className = "msg msg-ai";
  msg.innerHTML = `<div class="msg-meta"><div class="dot"></div>好日子 AI</div><div class="msg-bubble">${html}</div>`;
  chatScroll.appendChild(msg);
  scrollChatToBottom();
}

function addUserMessage(text) {
  const chatScroll = $("#chatScroll");
  const msg = document.createElement("div");
  msg.className = "msg msg-me";
  msg.innerHTML = `<div class="msg-bubble">${text}</div>`;
  chatScroll.appendChild(msg);
  scrollChatToBottom();
}

function renderQuickOptions(opts) {
  const chatScroll = $("#chatScroll");
  const grp = document.createElement("div");
  grp.className = "msg msg-ai";
  grp.innerHTML = `<div class="opt-group">${opts.map((o, i) => `<button class="opt-btn ${o.primary ? 'primary' : ''}" data-idx="${i}">${o.label}</button>`).join("")}</div>`;
  chatScroll.appendChild(grp);

  // 绑定点击
  const btns = grp.querySelectorAll(".opt-btn");
  btns.forEach((b, i) => b.onclick = () => {
    // 禁用所有按钮
    btns.forEach(x => { x.disabled = true; x.classList.add("disabled"); });
    opts[i].action();
  });
  scrollChatToBottom();
}

function scrollChatToBottom() {
  const chatScroll = $("#chatScroll");
  if (chatScroll) {
    setTimeout(() => {
      chatScroll.scrollTop = chatScroll.scrollHeight;
    }, 50);
  }
}

// 聊天输入框发送
function sendTextMsg() {
  const input = $("#textInput");
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  addUserMessage(val);
  input.value = "";

  setTimeout(() => {
    addAIMessage(`明白了，我会把"${val}"这个信息考虑进去。<br>继续帮你挑一个合适的好日子吧～`);
    // 简化：如果还没推荐过，就展示推荐
    if (STATE.chatStep < 3) {
      setTimeout(() => renderRecommendDates(), 700);
      STATE.chatStep = 3;
    }
  }, 600);
}

// ===== 看好日页面 =====
function renderBrowse() {
  // 趋势卡片
  const trend = `
    <div class="trend-card">
      <div class="trend-title"><div class="trend-dot"></div>近期趋势</div>
      <div class="trend-item good">
        <div class="ti-num">5</div>
        <div>天比较适合安排 <b>提车</b>、<b>签约</b>、<b>出行</b>；周末可以安排家人一起。</div>
      </div>
      <div class="trend-item bad">
        <div class="ti-num">2</div>
        <div>天不太适合 <b>搬家</b>、<b>装修开工</b>、<b>动土</b>；可以避开这些时间。</div>
      </div>
      <div class="trend-tip">如果你已经有具体事项，<b>去「择好日」</b>让 AI 帮你细选。</div>
    </div>
  `;
  const trendEl = $("#trendCard");
  if (trendEl) trendEl.innerHTML = trend;

  // 好日子列表
  const list = $("#browseList");
  if (list) {
    list.innerHTML = BROWSE_DAYS.map(d => `
      <div class="browse-card" data-date="${d.date}">
        <div class="bc-top">
          <div class="bc-date">
            <div class="bc-date-num">${d.day}</div>
            <div class="bc-date-sub">${d.month}月${d.weekday}</div>
          </div>
          <div class="bc-body">
            <div class="bc-title">
              <span class="bc-tag ${d.level}">${d.levelText}</span>
            </div>
            <div class="bc-tags">
              ${d.suitable.slice(0, 4).map(t => `<span>${t}</span>`).join("")}
            </div>
            <div class="bc-desc">${d.desc}</div>
          </div>
        </div>
        <div class="bc-actions">
          <button class="primary" onclick="openDayDetail('${d.date}')">看看详情</button>
          <button onclick="askFromBrowse('${d.date}')">问问适合我吗</button>
        </div>
      </div>
    `).join("");
  }
}

function askFromBrowse(dateStr) {
  const d = BROWSE_DAYS.find(x => x.date === dateStr);
  goToPage("choose");
  // 进入聊天
  setTimeout(() => {
    const ev = d.suitable[0];
    // 匹配事项
    const eventKey = { "提车": "car", "搬家": "move", "装修": "decor", "签约": "sign", "开业": "open", "买房": "house" }[ev] || "car";
    startChat(eventKey, `我看了 ${d.month}月${d.day}日 这个日子，适合我吗？`);
  }, 400);
}

// ===== 看好日 · 日详情弹层 =====
function openDayDetail(dateStr) {
  const d = BROWSE_DAYS.find(x => x.date === dateStr);
  if (!d) return;

  const modal = $("#dayModal");
  const body = $("#dayModalBody");
  if (!body) return;

  body.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="day-detail">
      <div class="dd-top">
        <div class="dd-bigdate">${d.month}.${d.day}</div>
        <div class="dd-sub">${d.weekday}</div>
        <div class="dd-tags-row">
          <span class="bc-tag ${d.level}">${d.levelText}</span>
        </div>
      </div>

      <div class="dd-section">
        <div class="dd-section-title">这天适合</div>
        <div class="dd-chips">${d.suitable.map(t => `<span>${t}</span>`).join("")}</div>
        <div class="dd-divider"></div>
        <div class="dd-section-title">这天建议缓一缓</div>
        <div class="dd-chips">${d.avoid.map(t => `<span class="bad">${t}</span>`).join("")}</div>
        <div class="dd-divider"></div>
        <div class="dd-section-title">建议时间</div>
        <div class="dd-row" style="margin-top:6px">${d.time}</div>
      </div>

      <div class="dd-section">
        <div class="dd-section-title">传统黄历参考</div>
        <div class="dd-row">
          <div class="dd-label" style="min-width: 44px">宜</div>
          <div>${d.tradYi.join(" · ")}</div>
        </div>
        <div class="dd-row">
          <div class="dd-label" style="min-width: 44px">忌</div>
          <div>${d.tradJi.join(" · ")}</div>
        </div>
      </div>

      <div class="dd-section">
        <div class="dd-section-title">说明</div>
        <div class="dd-trad">${d.desc}<br><br>日期参考结合传统黄历文化与现代办事场景，仅供生活参考，请结合实际安排综合决定。</div>
      </div>
    </div>
  `;
  modal.classList.add("show");
}

function closeDayModal() {
  const m = $("#dayModal");
  if (m) m.classList.remove("show");
}

// ===== 看好日 · 月历弹层 =====
function openCalendarModal() {
  const modal = $("#calendarModal");
  const body = $("#calendarModalBody");
  if (!body) return;

  // 显示 2026 年 6 月和 7 月
  const now = new Date(2026, 5, 22); // 6 月
  renderMonth(body, 2026, 5);
  modal.classList.add("show");
}

function renderMonth(container, year, month) {
  // month: 0-based
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

  let cells = "";
  // 前导空白
  for (let i = 0; i < firstDay; i++) {
    cells += `<div class="cal-cell muted"></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const mark = CALENDAR_MARKS[dateKey];
    const isToday = (year === 2026 && month === 5 && d === 22);
    let cls = "";
    if (mark === "good") cls = "good";
    if (mark === "bad") cls = "bad";
    if (isToday) cls = (cls ? cls + " " : "") + "today";
    const dotHtml = mark ? `<div class="cc-dot"></div>` : "";
    cells += `<div class="cal-cell ${cls}" onclick="handleCalCellClick('${dateKey}')">${d}${dotHtml}</div>`;
  }

  container.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="calendar-wrap">
      <div class="cal-head">
        <button><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M15 18l-6-6 6-6"/></svg></button>
        <div class="cal-title">${year} 年 ${month + 1} 月</div>
        <button onclick="switchCalMonth()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M9 18l6-6-6-6"/></svg></button>
      </div>
      <div class="cal-week">${weekdays.map(w => `<div>${w}</div>`).join("")}</div>
      <div class="cal-grid">${cells}</div>
      <div class="cal-legend">
        <div class="cal-legend-item"><div class="dot good"></div>推荐办理</div>
        <div class="cal-legend-item"><div class="dot bad"></div>建议避开</div>
        <div class="cal-legend-item"><div class="dot today"></div>今日</div>
      </div>
    </div>
  `;
  // 月切换按钮
  window._calMonthIdx = window._calMonthIdx || 0;
}

function switchCalMonth() {
  window._calMonthIdx = (window._calMonthIdx || 0) + 1;
  const months = [
    { y: 2026, m: 5 }, { y: 2026, m: 6 }, { y: 2026, m: 7 }
  ];
  const idx = window._calMonthIdx % months.length;
  const body = $("#calendarModalBody");
  renderMonth(body, months[idx].y, months[idx].m);
}

let _calClickIdx = 0;
function handleCalCellClick(dateKey) {
  _calClickIdx++;
  // 简单处理：如果有推荐就打开日详情
  const d = BROWSE_DAYS.find(x => x.date === dateKey);
  if (d) {
    closeCalendarModal();
    setTimeout(() => openDayDetail(dateKey), 300);
  } else {
    showToast("这一天没有特别推荐的事项");
  }
}

function closeCalendarModal() {
  const m = $("#calendarModal");
  if (m) m.classList.remove("show");
}

// ===== 办好事 · 计划列表 =====
function renderPlans() {
  const list = $("#plansList");
  if (!list) return;

  // 过滤
  let filtered = STATE.plans;
  if (STATE.plansFilter === "active") {
    filtered = STATE.plans.filter(p => p.status === "preparing" || p.status === "waiting" || p.status === "todo");
  } else if (STATE.plansFilter === "done") {
    filtered = STATE.plans.filter(p => p.status === "done");
  }

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="plans-empty">
        <div class="plans-empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h8"/></svg>
        </div>
        <h3>${STATE.plansFilter === "done" ? "还没有已完成的计划" : "这里还没有计划"}</h3>
        <p>${STATE.plansFilter === "all" ? "点击右下角「新增计划」，或去「择好日」让 AI 帮你挑日子。" : "点击右下角「新增计划」开始吧～"}</p>
      </div>
    `;
    return;
  }

  list.innerHTML = filtered.map(p => {
    const total = countPlanTotal(p);
    const done = countPlanDone(p);
    const pct = total > 0 ? Math.round(done / total * 100) : 0;
    const icon = getEventIcon(p.eventKey);

    return `
      <div class="plan-card" onclick="goToPlanDetail('${p.id}')">
        <div class="pc-head">
          <div class="pc-icon">${icon}</div>
          <div class="pc-title-area">
            <div class="pc-title">${p.title}</div>
            <div class="pc-date">${p.dateText} · ${p.time}</div>
          </div>
          <div class="pc-status ${p.status}">${p.statusText}</div>
        </div>
        <div class="pc-body">
          <div class="pc-summary">${p.summary}</div>
          <div class="pc-progress-row">
            <div class="pc-progress-bar"><div class="pc-progress-fill" style="width: ${pct}%"></div></div>
            <div class="pc-progress-num">${done}/${total}</div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function countPlanTotal(plan) {
  if (!plan.checklist) return 0;
  return plan.checklist.reduce((sum, g) => sum + (g.items ? g.items.length : 0), 0);
}
function countPlanDone(plan) {
  if (!plan.checklist) return 0;
  return plan.checklist.reduce((sum, g) => sum + (g.items ? g.items.filter(i => i.checked).length : 0), 0);
}

function getEventIcon(eventKey) {
  const ev = EVENTS.find(e => e.key === eventKey);
  return ev ? ev.iconSvg : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>`;
}

// 过滤器按钮（办好事页顶部）
document.addEventListener("click", function(e) {
  const btn = e.target.closest("[data-status]");
  if (btn && btn.parentElement && btn.parentElement.id === "plansFilter") {
    STATE.plansFilter = btn.getAttribute("data-status");
    $$("#plansFilter .filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderPlans();
  }
  const bBtn = e.target.closest("[data-filter]");
  if (bBtn && bBtn.parentElement && bBtn.parentElement.id === "browseFilter") {
    $$("#browseFilter .filter-btn").forEach(b => b.classList.remove("active"));
    bBtn.classList.add("active");
  }
});

// ===== 办好事详情 =====
function goToPlanDetail(planId) {
  STATE.currentPlanId = planId;
  renderPlanDetail();
  goToPage("plan-detail");
}

function renderPlanDetail() {
  const plan = STATE.plans.find(p => p.id === STATE.currentPlanId);
  if (!plan) return;

  const total = countPlanTotal(plan);
  const done = countPlanDone(plan);
  const pct = total > 0 ? Math.round(done / total * 100) : 0;

  const body = $("#planDetailBody");
  if (!body) return;

  // 标题
  const titleEl = $("#detailTitle");
  if (titleEl) titleEl.textContent = plan.title;

  body.innerHTML = `
    <div class="detail-hero">
      <div class="dh-title">${plan.title}</div>
      <div class="dh-meta">好日子：${plan.dateText} · ${plan.time}</div>
      <div class="dh-row"><b>推荐原因</b>　${plan.summary}</div>
      <div class="dh-row"><b>状态</b>　<span class="dh-status-badge">${plan.statusText}</span></div>
      <div class="dh-progress-row">
        <div class="dh-progress-bar"><div class="dh-progress-fill" style="width: ${pct}%"></div></div>
        <div class="dh-progress-num">${done}/${total}</div>
      </div>
    </div>

    ${plan.checklist.map(group => `
      <div class="check-group">
        <div class="check-group-title">
          <div class="cg-dot"></div>${group.groupName}
          <div class="cg-num">${group.items.filter(i=>i.checked).length}/${group.items.length}</div>
        </div>
        <div class="check-list">
          ${group.items.map(item => `
            <div class="check-item ${item.checked ? "checked" : ""}">
              <div class="ci-cb" onclick="toggleItemCheck('${group.groupName}', '${item.id}', event)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>
              </div>
              <div class="ci-body">
                <div class="ci-text">${item.text}</div>
                ${item.tags && item.tags.length ? `<div class="ci-tags">${item.tags.map(t => `<span class="${t.type || ''}">${t.label}</span>`).join("")}</div>` : ""}
                ${item.note ? `<div class="ci-note"><b>备注</b>${item.note}</div>` : ""}
                ${item.reminder ? `<div class="ci-note" style="background: #FFF3E8"><b>提醒</b>${item.reminder}</div>` : ""}
              </div>
              <div class="ci-action" onclick="openEditNote('${group.groupName}', '${item.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </div>
              <div class="ci-action del" onclick="deleteItem('${group.groupName}', '${item.id}')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14"/></svg>
              </div>
            </div>
          `).join("")}
        </div>
        <button class="add-item-btn" onclick="addCustomItem('${group.groupName}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          添加自定义事项
        </button>
      </div>
    `).join("")}

    <div class="bottom-note" style="padding: 20px 4px 40px">
      <p>本产品基于传统黄历文化和现代办事场景提供日期参考与清单提醒。</p>
      <p>结果仅供生活参考，请结合实际安排综合决定。</p>
    </div>
  `;
}

function toggleItemCheck(groupName, itemId, ev) {
  if (ev) { ev.stopPropagation(); }
  const plan = STATE.plans.find(p => p.id === STATE.currentPlanId);
  if (!plan) return;
  const group = plan.checklist.find(g => g.groupName === groupName);
  if (!group) return;
  const item = group.items.find(i => i.id === itemId);
  if (!item) return;
  item.checked = !item.checked;
  savePlans(STATE.plans);
  renderPlanDetail();
  renderPlans();
}

function deleteItem(groupName, itemId) {
  STATE.confirmAction = { type: "delete-item", groupName, itemId };
  const modal = $("#confirmModal");
  const body = $("#confirmModalBody");
  body.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="confirm-modal">
      <h3>删除这个事项？</h3>
      <p>删除后可以手动重新添加。</p>
      <div class="cm-buttons">
        <button class="cancel" onclick="closeConfirmModal()">再想想</button>
        <button class="confirm" onclick="confirmDeleteItem()">删除</button>
      </div>
    </div>
  `;
  modal.classList.add("show");
}
function confirmDeleteItem() {
  if (!STATE.confirmAction || STATE.confirmAction.type !== "delete-item") return;
  const { groupName, itemId } = STATE.confirmAction;
  const plan = STATE.plans.find(p => p.id === STATE.currentPlanId);
  if (!plan) return;
  const group = plan.checklist.find(g => g.groupName === groupName);
  if (!group) return;
  group.items = group.items.filter(i => i.id !== itemId);
  savePlans(STATE.plans);
  closeConfirmModal();
  renderPlanDetail();
  renderPlans();
  showToast("已删除");
}

function closeConfirmModal() {
  const m = $("#confirmModal");
  if (m) m.classList.remove("show");
  STATE.confirmAction = null;
}

function openConfirmModal(type) {
  if (type === "confirmDeletePlan") {
    STATE.confirmAction = { type: "delete-plan" };
    const modal = $("#confirmModal");
    const body = $("#confirmModalBody");
    body.innerHTML = `
      <div class="sheet-handle"></div>
      <div class="confirm-modal">
        <h3>删除这个计划？</h3>
        <p>删除后将无法恢复。</p>
        <div class="cm-buttons">
          <button class="cancel" onclick="closeConfirmModal()">取消</button>
          <button class="confirm" onclick="confirmDeletePlan()">删除</button>
        </div>
      </div>
    `;
    modal.classList.add("show");
  }
}
function confirmDeletePlan() {
  STATE.plans = STATE.plans.filter(p => p.id !== STATE.currentPlanId);
  savePlans(STATE.plans);
  closeConfirmModal();
  showToast("计划已删除");
  goToPage("plans");
  renderPlans();
}

// 新增自定义事项
function addCustomItem(groupName) {
  STATE.editingItem = { groupName, itemId: null, text: "", note: "", reminder: "", tags: [] };
  const modal = $("#noteModal");
  const body = $("#noteModalBody");
  body.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="note-modal">
      <h3>添加事项</h3>
      <div class="nm-label">事项内容</div>
      <input type="text" id="nm-text" placeholder="例如：准备灭火器、拍照存底等">
      <div class="nm-label" style="margin-top: 14px">标签（可选）</div>
      <div class="nm-tag-select">
        <button data-tag="关键" data-type="key">关键</button>
        <button data-tag="需确认" data-type="warn">需确认</button>
        <button data-tag="涉及银行" data-type="bank">涉及银行</button>
      </div>
      <div class="nm-label" style="margin-top: 14px">备注</div>
      <textarea id="nm-note" placeholder="写点小提示，比如需要的资料、联系方式..."></textarea>
      <div class="nm-label" style="margin-top: 14px">提醒</div>
      <input type="text" id="nm-reminder" placeholder="例如：提前 1 天确认">
      <div class="nm-buttons">
        <button class="cancel" onclick="closeNoteModal()">取消</button>
        <button class="confirm" onclick="saveNewItem()">保存</button>
      </div>
    </div>
  `;
  modal.classList.add("show");

  // 标签切换
  body.querySelectorAll(".nm-tag-select button").forEach(b => {
    b.onclick = () => {
      b.classList.toggle("active");
    };
  });
}

function saveNewItem() {
  const textEl = $("#nm-text");
  const noteEl = $("#nm-note");
  const reminderEl = $("#nm-reminder");
  const text = textEl.value.trim();
  if (!text) {
    showToast("请填写事项内容");
    return;
  }
  const tags = [];
  document.querySelectorAll("#noteModalBody .nm-tag-select button.active").forEach(b => {
    tags.push({ label: b.dataset.tag, type: b.dataset.type });
  });

  const plan = STATE.plans.find(p => p.id === STATE.currentPlanId);
  if (!plan) return;
  const group = plan.checklist.find(g => g.groupName === STATE.editingItem.groupName);
  if (!group) return;
  group.items.push({
    id: "custom_" + Date.now(),
    text: text,
    checked: false,
    tags: tags,
    note: noteEl.value.trim(),
    reminder: reminderEl.value.trim()
  });
  savePlans(STATE.plans);
  closeNoteModal();
  renderPlanDetail();
  renderPlans();
  showToast("已添加");
}

function openEditNote(groupName, itemId) {
  const plan = STATE.plans.find(p => p.id === STATE.currentPlanId);
  if (!plan) return;
  const group = plan.checklist.find(g => g.groupName === groupName);
  if (!group) return;
  const item = group.items.find(i => i.id === itemId);
  if (!item) return;

  STATE.editingItem = { groupName, itemId };

  const modal = $("#noteModal");
  const body = $("#noteModalBody");
  body.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="note-modal">
      <h3>编辑事项</h3>
      <div class="nm-label">事项内容</div>
      <input type="text" id="nm-text" value="${escapeHtml(item.text)}">
      <div class="nm-label" style="margin-top: 14px">标签</div>
      <div class="nm-tag-select">
        ${[{l:"关键",t:"key"},{l:"需确认",t:"warn"},{l:"涉及银行",t:"bank"}].map(tag => {
          const active = item.tags && item.tags.some(x => x.type === tag.t);
          return `<button class="${active ? "active" : ""}" data-tag="${tag.l}" data-type="${tag.t}">${tag.l}</button>`;
        }).join("")}
      </div>
      <div class="nm-label" style="margin-top: 14px">备注</div>
      <textarea id="nm-note" placeholder="补充一些提示信息...">${escapeHtml(item.note || "")}</textarea>
      <div class="nm-label" style="margin-top: 14px">提醒</div>
      <input type="text" id="nm-reminder" value="${escapeHtml(item.reminder || "")}" placeholder="例如：提前 1 天确认">
      <div class="nm-buttons">
        <button class="cancel" onclick="closeNoteModal()">取消</button>
        <button class="confirm" onclick="saveEditItem()">保存修改</button>
      </div>
    </div>
  `;
  modal.classList.add("show");

  body.querySelectorAll(".nm-tag-select button").forEach(b => {
    b.onclick = () => b.classList.toggle("active");
  });
}

function saveEditItem() {
  const plan = STATE.plans.find(p => p.id === STATE.currentPlanId);
  if (!plan) return;
  const group = plan.checklist.find(g => g.groupName === STATE.editingItem.groupName);
  if (!group) return;
  const item = group.items.find(i => i.id === STATE.editingItem.itemId);
  if (!item) return;

  const textEl = $("#nm-text");
  const noteEl = $("#nm-note");
  const reminderEl = $("#nm-reminder");

  item.text = textEl.value.trim() || item.text;
  item.note = noteEl.value.trim();
  item.reminder = reminderEl.value.trim();

  const tags = [];
  document.querySelectorAll("#noteModalBody .nm-tag-select button.active").forEach(b => {
    tags.push({ label: b.dataset.tag, type: b.dataset.type });
  });
  item.tags = tags;

  savePlans(STATE.plans);
  closeNoteModal();
  renderPlanDetail();
  renderPlans();
  showToast("已保存");
}

function closeNoteModal() {
  const m = $("#noteModal");
  if (m) m.classList.remove("show");
  STATE.editingItem = null;
}

// HTML 转义
function escapeHtml(s) {
  if (!s) return "";
  return String(s).replace(/[&<>"']/g, function(c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// 点击弹层遮罩关闭
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("modal") && e.target.classList.contains("show")) {
    // 不处理，由各自的 mask 点击处理
  }
  if (e.target.classList.contains("modal-mask")) {
    e.target.parentElement.classList.remove("show");
  }
});
