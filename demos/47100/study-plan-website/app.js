(function() {
  'use strict';

  const STORAGE_KEY = 'focus-study-app';
  const MODES = {
    focus: { label: '专注', seconds: 25 * 60, message: '专注时段结束，休息一下吧。' },
    short: { label: '短休息', seconds: 5 * 60, message: '休息结束，准备下一轮专注。' },
    long: { label: '长休息', seconds: 15 * 60, message: '休息结束，重新出发。' }
  };

  const pageTitles = {
    dashboard: '仪表盘',
    plans: '学习计划',
    calendar: '学习日历',
    stats: '数据统计',
    focus: '专注计时'
  };

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  let state = {
    theme: 'light',
    plans: [],
    tasks: [],
    sessions: [],
    calendarDate: new Date(),
    selectedDate: null,
    timer: {
      mode: 'focus',
      timeLeft: MODES.focus.seconds,
      running: false,
      interval: null
    }
  };

  // ---------- Utilities ----------
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function pad(n) {
    return n < 10 ? '0' + n : n;
  }

  function formatDate(d) {
    const date = new Date(d);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function todayStr() {
    return formatDate(new Date());
  }

  function addDays(dateStr, n) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + n);
    return formatDate(d);
  }

  function daysBetween(a, b) {
    const one = new Date(a);
    const two = new Date(b);
    return Math.round((two - one) / (1000 * 60 * 60 * 24));
  }

  function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${pad(m)}:${pad(s)}`;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ---------- Persistence ----------
  function storageAvailable() {
    try {
      const s = window.localStorage;
      s.setItem('__test__', '1');
      s.removeItem('__test__');
      return true;
    } catch (e) {
      return false;
    }
  }

  function loadState() {
    if (!storageAvailable()) return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      seedSampleData();
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      state.plans = parsed.plans || [];
      state.tasks = parsed.tasks || [];
      state.sessions = parsed.sessions || [];
      state.theme = parsed.theme || 'light';
      state.calendarDate = new Date();
    } catch (e) {
      seedSampleData();
    }
  }

  function saveState() {
    if (!storageAvailable()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      theme: state.theme,
      plans: state.plans,
      tasks: state.tasks,
      sessions: state.sessions
    }));
  }

  // ---------- Seed Data ----------
  function seedSampleData() {
    state.theme = 'light';
    state.plans = [];
    state.tasks = [];
    state.sessions = [];

    createPlan({
      title: '前端技能提升',
      category: '编程',
      deadline: addDays(todayStr(), 13),
      dailyMinutes: 60,
      description: '系统学习现代前端工程化、响应式设计与交互细节。'
    });

    createPlan({
      title: '每日英语阅读',
      category: '语言',
      deadline: addDays(todayStr(), 29),
      dailyMinutes: 30,
      description: '每天阅读一篇英文技术博客，积累表达与词汇。'
    });

    // Mark a couple of historical tasks as completed for demo stats
    const t = todayStr();
    state.tasks.slice(0, 4).forEach(task => {
      if (task.date <= t) task.completed = true;
    });
    state.sessions = [
      { id: uid(), date: addDays(t, -2), duration: 25 },
      { id: uid(), date: addDays(t, -1), duration: 50 }
    ];
    saveState();
  }

  // ---------- Data Operations ----------
  function createPlan({ title, category, deadline, dailyMinutes, description }) {
    const plan = {
      id: uid(),
      title,
      category: category || '未分类',
      deadline,
      dailyMinutes: parseInt(dailyMinutes, 10) || 30,
      description: description || '',
      createdAt: todayStr()
    };
    state.plans.push(plan);

    const start = new Date(todayStr());
    const end = new Date(deadline);
    if (end < start) end.setTime(start.getTime());

    let count = 0;
    for (let d = new Date(start); d <= end && count < 30; d.setDate(d.getDate() + 1)) {
      state.tasks.push({
        id: uid(),
        planId: plan.id,
        title: `学习：${title}`,
        date: formatDate(d),
        duration: plan.dailyMinutes,
        completed: false
      });
      count++;
    }
    saveState();
    return plan;
  }

  function deletePlan(id) {
    state.plans = state.plans.filter(p => p.id !== id);
    state.tasks = state.tasks.filter(t => t.planId !== id);
    saveState();
    renderPlans();
    renderDashboard();
    renderCalendar();
    renderStats();
  }

  function createTask(planId, title, date, duration) {
    state.tasks.push({
      id: uid(),
      planId,
      title: title || '学习任务',
      date,
      duration: parseInt(duration, 10) || 30,
      completed: false
    });
    saveState();
    renderPlans();
    renderDashboard();
    renderCalendar();
    renderStats();
  }

  function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    saveState();
    renderDashboard();
    renderPlans();
    renderCalendar();
    renderStats();
  }

  function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveState();
    renderDashboard();
    renderPlans();
    renderCalendar();
    renderStats();
  }

  // ---------- Rendering ----------
  function renderAll() {
    document.body.setAttribute('data-theme', state.theme);
    updateDateDisplay();
    renderDashboard();
    renderPlans();
    renderCalendar();
    renderStats();
    renderFocus();
  }

  function updateDateDisplay() {
    const now = new Date();
    const label = `${now.getFullYear()}年${pad(now.getMonth() + 1)}月${pad(now.getDate())}日 星期${weekDays[now.getDay()]}`;
    document.getElementById('dateDisplay').textContent = label;
  }

  function setGreeting() {
    const hour = new Date().getHours();
    let text = '你好，今天想学什么？';
    if (hour < 6) text = '夜深了，记得休息。';
    else if (hour < 11) text = '早上好，从一个小目标开始。';
    else if (hour < 14) text = '中午好，保持节奏。';
    else if (hour < 18) text = '下午好，继续深耕。';
    else text = '晚上好，复盘与沉淀的时刻。';
    document.getElementById('greeting').textContent = text;
  }

  function renderDashboard() {
    setGreeting();
    const t = todayStr();
    const todayTasks = state.tasks.filter(task => task.date === t);
    const pending = todayTasks.filter(t => !t.completed).length;
    const completed = state.tasks.filter(t => t.completed).length;
    const total = state.tasks.length;
    const focusMinutes = state.sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    document.getElementById('statToday').textContent = pending;
    document.getElementById('statMinutes').textContent = focusMinutes;
    document.getElementById('statRate').textContent = total ? Math.round((completed / total) * 100) : 0;

    const list = document.getElementById('todayTasks');
    const empty = document.getElementById('todayEmpty');
    list.innerHTML = '';

    if (todayTasks.length === 0) {
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
      todayTasks.sort((a, b) => a.completed - b.completed);
      todayTasks.forEach(task => {
        const plan = state.plans.find(p => p.id === task.planId) || { title: '未分类' };
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
          <button class="task-check" aria-label="完成任务"></button>
          <span class="task-title">${escapeHtml(task.title)}</span>
          <span class="task-meta">${escapeHtml(plan.title)} · ${task.duration}min</span>
        `;
        li.querySelector('.task-check').addEventListener('click', () => toggleTask(task.id));
        list.appendChild(li);
      });
    }
  }

  function renderPlans() {
    const grid = document.getElementById('planGrid');
    grid.innerHTML = '';

    if (state.plans.length === 0) {
      grid.innerHTML = '<div class="empty-state"><p>暂无学习计划，点击右上角「+ 新建计划」开始。</p></div>';
      return;
    }

    state.plans.forEach(plan => {
      const planTasks = state.tasks.filter(t => t.planId === plan.id);
      const completed = planTasks.filter(t => t.completed).length;
      const total = planTasks.length;
      const percent = total ? Math.round((completed / total) * 100) : 0;
      const daysLeft = daysBetween(todayStr(), plan.deadline);

      const card = document.createElement('div');
      card.className = 'plan-card';
      card.innerHTML = `
        <div class="plan-header">
          <div>
            <div class="plan-title">${escapeHtml(plan.title)}</div>
          </div>
          <span class="plan-category">${escapeHtml(plan.category)}</span>
        </div>
        <p class="plan-desc">${escapeHtml(plan.description || '暂无描述')}</p>
        <div class="plan-progress">
          <div class="plan-progress-bar" style="width: ${percent}%"></div>
        </div>
        <div class="plan-footer">
          <span>截止 ${plan.deadline} · 剩余 ${Math.max(0, daysLeft)} 天</span>
          <span>${completed}/${total} 完成</span>
        </div>
        <ul class="mini-task-list"></ul>
        <form class="inline-task-form">
          <input type="text" name="title" placeholder="任务内容" required>
          <input type="date" name="date" value="${todayStr()}" required>
          <input type="number" name="duration" value="${plan.dailyMinutes}" min="5" max="600">
          <button type="submit" class="btn btn-primary">添加</button>
        </form>
        <div class="plan-actions">
          <button class="btn btn-secondary btn-small delete-plan">删除计划</button>
        </div>
      `;

      const miniList = card.querySelector('.mini-task-list');
      const upcoming = planTasks
        .filter(t => !t.completed)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);
      if (upcoming.length === 0) {
        miniList.innerHTML = '<li class="mini-empty">暂无待办任务</li>';
      } else {
        upcoming.forEach(task => {
          const li = document.createElement('li');
          li.className = 'mini-task';
          li.innerHTML = `<span>${escapeHtml(task.title)}</span><span>${task.date}</span>`;
          miniList.appendChild(li);
        });
      }

      const form = card.querySelector('.inline-task-form');
      form.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(form);
        createTask(plan.id, fd.get('title'), fd.get('date'), fd.get('duration'));
        form.reset();
        form.querySelector('input[name="date"]').value = todayStr();
        form.querySelector('input[name="duration"]').value = plan.dailyMinutes;
      });

      card.querySelector('.delete-plan').addEventListener('click', () => {
        if (confirm(`确定删除计划「${plan.title}」及其所有任务吗？`)) {
          deletePlan(plan.id);
        }
      });

      grid.appendChild(card);
    });
  }

  function renderCalendar() {
    const year = state.calendarDate.getFullYear();
    const month = state.calendarDate.getMonth();
    document.getElementById('calendarMonth').textContent = `${year}年 ${pad(month + 1)}月`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    weekDays.forEach(d => {
      const cell = document.createElement('div');
      cell.className = 'calendar-day-header';
      cell.textContent = '周' + d;
      grid.appendChild(cell);
    });

    const t = todayStr();
    const selected = state.selectedDate || t;

    for (let i = 0; i < startOffset; i++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day empty';
      grid.appendChild(cell);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
      const dayTasks = state.tasks.filter(task => task.date === dateStr);
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      if (dateStr === t) cell.classList.add('today');
      if (dateStr === selected) cell.classList.add('selected');

      const dots = dayTasks.slice(0, 3).map(() => '<span class="calendar-dot"></span>').join('');
      cell.innerHTML = `<span class="calendar-day-number">${d}</span><div class="calendar-dots">${dots}</div>`;
      cell.addEventListener('click', () => {
        state.selectedDate = dateStr;
        renderCalendar();
        renderDayPanel();
      });
      grid.appendChild(cell);
    }

    renderDayPanel();
  }

  function renderDayPanel() {
    const date = state.selectedDate || todayStr();
    document.getElementById('selectedDate').textContent = date;
    const dayTasks = state.tasks.filter(t => t.date === date);
    document.getElementById('dayTaskCount').textContent = `${dayTasks.length} 项任务`;
    const list = document.getElementById('dayTasks');
    list.innerHTML = '';

    if (dayTasks.length === 0) {
      list.innerHTML = '<li class="empty-state"><p>该日期没有学习任务。</p></li>';
      return;
    }

    dayTasks.forEach(task => {
      const plan = state.plans.find(p => p.id === task.planId) || { title: '未分类' };
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.innerHTML = `
        <button class="task-check" aria-label="完成任务"></button>
        <span class="task-title">${escapeHtml(task.title)}</span>
        <span class="task-meta">${escapeHtml(plan.title)} · ${task.duration}min</span>
      `;
      li.querySelector('.task-check').addEventListener('click', () => toggleTask(task.id));
      list.appendChild(li);
    });
  }

  function renderStats() {
    const chart = document.getElementById('weekChart');
    chart.innerHTML = '';

    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(todayStr(), -i);
      const completed = state.tasks.filter(t => t.date === d && t.completed).length;
      const total = state.tasks.filter(t => t.date === d).length;
      data.push({ date: d, day: new Date(d).getDay(), completed, total });
    }

    const max = Math.max(1, ...data.map(d => d.total));
    data.forEach(d => {
      const item = document.createElement('div');
      item.className = 'bar-item';
      const pct = (d.completed / max) * 100;
      item.innerHTML = `
        <div class="bar-track">
          <div class="bar-fill" style="height: ${pct}%"></div>
        </div>
        <span class="bar-label">${d.completed}/${d.total}</span>
        <span class="bar-label">${weekDays[d.day]}</span>
      `;
      chart.appendChild(item);
    });

    document.getElementById('overviewPlans').textContent = state.plans.length;
    document.getElementById('overviewTasks').textContent = state.tasks.length;
    document.getElementById('overviewCompleted').textContent = state.tasks.filter(t => t.completed).length;
    document.getElementById('overviewSessions').textContent = state.sessions.length;
  }

  function renderFocus() {
    const display = document.getElementById('timerDisplay');
    display.textContent = formatTime(state.timer.timeLeft);

    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === state.timer.mode);
    });

    const toggleBtn = document.getElementById('timerToggle');
    toggleBtn.textContent = state.timer.running ? '暂停' : '开始';
  }

  function startTimer() {
    if (state.timer.running) return;
    state.timer.running = true;
    renderFocus();
    state.timer.interval = setInterval(() => {
      if (state.timer.timeLeft > 0) {
        state.timer.timeLeft--;
        renderFocus();
      } else {
        finishTimer();
      }
    }, 1000);
  }

  function pauseTimer() {
    state.timer.running = false;
    clearInterval(state.timer.interval);
    state.timer.interval = null;
    renderFocus();
  }

  function resetTimer() {
    pauseTimer();
    state.timer.timeLeft = MODES[state.timer.mode].seconds;
    renderFocus();
  }

  function finishTimer() {
    pauseTimer();
    const mode = MODES[state.timer.mode];
    if (state.timer.mode === 'focus') {
      const minutes = Math.round(mode.seconds / 60);
      state.sessions.push({ id: uid(), date: todayStr(), duration: minutes });
      saveState();
      renderDashboard();
      renderStats();
    }
    alert(mode.message);
    state.timer.timeLeft = mode.seconds;
    renderFocus();
  }

  function setTimerMode(mode) {
    state.timer.mode = mode;
    resetTimer();
  }

  // ---------- Navigation ----------
  function showPage(page) {
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    document.querySelectorAll('.nav-link').forEach(el => el.classList.toggle('active', el.dataset.page === page));
    document.getElementById('pageTitle').textContent = pageTitles[page] || '';
    if (page === 'dashboard') renderDashboard();
    if (page === 'plans') renderPlans();
    if (page === 'calendar') renderCalendar();
    if (page === 'stats') renderStats();
    if (page === 'focus') renderFocus();
  }

  // ---------- Export ----------
  function exportData() {
    const blob = new Blob([JSON.stringify({
      exportedAt: new Date().toISOString(),
      plans: state.plans,
      tasks: state.tasks,
      sessions: state.sessions
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focus-study-backup-${todayStr()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ---------- Event Listeners ----------
  document.addEventListener('DOMContentLoaded', () => {
    loadState();
    renderAll();

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        showPage(link.dataset.page);
      });
    });

    // Theme
    document.getElementById('themeToggle').addEventListener('click', () => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      document.body.setAttribute('data-theme', state.theme);
      saveState();
    });

    // Topbar
    document.getElementById('quickFocusBtn').addEventListener('click', () => showPage('focus'));
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('goToPlans').addEventListener('click', () => showPage('plans'));

    // Plan form
    const planFormPanel = document.getElementById('planFormPanel');
    document.getElementById('showPlanForm').addEventListener('click', () => {
      planFormPanel.classList.add('open');
    });
    document.getElementById('closePlanForm').addEventListener('click', () => {
      planFormPanel.classList.remove('open');
    });
    document.getElementById('planForm').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      createPlan({
        title: fd.get('title'),
        category: fd.get('category'),
        deadline: fd.get('deadline'),
        dailyMinutes: fd.get('dailyMinutes'),
        description: fd.get('description')
      });
      e.target.reset();
      planFormPanel.classList.remove('open');
      renderAll();
    });

    // Calendar
    document.getElementById('prevMonth').addEventListener('click', () => {
      state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
      renderCalendar();
    });
    document.getElementById('nextMonth').addEventListener('click', () => {
      state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
      renderCalendar();
    });

    // Focus
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => setTimerMode(btn.dataset.mode));
    });
    document.getElementById('timerToggle').addEventListener('click', () => {
      if (state.timer.running) pauseTimer();
      else startTimer();
    });
    document.getElementById('timerReset').addEventListener('click', resetTimer);

    // Expose state for debugging
    window.__focusApp = { state, showPage, renderAll, exportData };
  });
})();
