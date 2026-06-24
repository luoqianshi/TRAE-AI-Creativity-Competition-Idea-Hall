// Cute Cartoon Pomodoro Todo List App Logic
// Wrapped in an IIFE to prevent global namespace pollution and recursion errors.
(function() {
  // Audio Context Synthesizers for cute SFX
  function playCuteChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      // Warm ascending cute chime notes (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.3);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + index * 0.12);
        osc.stop(ctx.currentTime + index * 0.12 + 0.35);
      });
    } catch (e) {
      console.warn("Audio Context is blocked or not supported on this browser:", e);
    }
  }

  function playPopSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.06);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.warn("Audio Context not supported:", e);
    }
  }

  function playBellSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio Context not supported:", e);
    }
  }

  // State Management
  let tasks = [];
  let activeTab = 'urgent-important';
  let activeBg = 'bg_cute_cat';
  let testMode = false;

  // Timer State Variables
  let timerMode = 'focus'; // 'focus', 'break', 'longBreak'
  let isTimerRunning = false;
  let timerInterval = null;
  let timeLeft = 25 * 60; // default 25 minutes
  let focusTaskId = null; // Currently focused task ID

  // Tomato Selection State
  let selectedTomatoCount = 1;

  // Time Constants (Seconds)
  const TIMES = {
    normal: {
      focus: 25 * 60,
      break: 5 * 60,
      longBreak: 15 * 60
    },
    test: {
      focus: 10,
      break: 3,
      longBreak: 5
    }
  };

  // DOM Elements
  const body = document.body;
  const clockTimer = document.getElementById('clock-timer');
  const clockState = document.getElementById('clock-state');
  const focusTaskName = document.getElementById('focus-task-name');
  const btnTimerToggle = document.getElementById('btn-timer-toggle');
  const btnTimerReset = document.getElementById('btn-timer-reset');
  const btnTimerSkip = document.getElementById('btn-timer-skip');
  const playPauseIcon = document.getElementById('play-pause-icon');

  // Background switcher DOMs
  const btnToggleBg = document.getElementById('btn-toggle-bg');
  const bgMenu = document.getElementById('bg-menu');
  const bgOptions = document.querySelectorAll('.bg-option');

  // Test Mode DOMs
  const btnToggleTest = document.getElementById('btn-toggle-test');
  const testBanner = document.getElementById('test-banner');
  const btnCloseTestBanner = document.getElementById('btn-close-test-banner');

  // Add Task DOMs
  const addTaskForm = document.getElementById('add-task-form');
  const taskNameInput = document.getElementById('task-name-input');
  const taskQuadrantSelect = document.getElementById('task-quadrant-select');
  const tomatoSelector = document.getElementById('tomato-selector');
  const tomatoButtons = tomatoSelector.querySelectorAll('.tomato-select-btn');

  // Tabs & Lists DOMs
  const quadrantTabs = document.getElementById('quadrant-tabs');
  const tabItems = quadrantTabs.querySelectorAll('.tab-item');
  const tasksList = document.getElementById('tasks-list');

  // Badges
  const badgeUI = document.getElementById('badge-ui');
  const badgeIN = document.getElementById('badge-in');
  const badgeUN = document.getElementById('badge-un');
  const badgeNN = document.getElementById('badge-nn');
  const badgeComp = document.getElementById('badge-comp');

  // Modal DOMs
  const settleModal = document.getElementById('settle-modal');
  const settleTaskName = document.getElementById('settle-task-name');
  const btnSettleCompleted = document.getElementById('btn-settle-completed');
  const btnSettleContinue = document.getElementById('btn-settle-continue');

  // Focus Overlay DOMs
  const focusOverlay = document.getElementById('focus-overlay');
  const overlayClockTimer = document.getElementById('overlay-clock-timer');
  const overlayClockState = document.getElementById('overlay-clock-state');
  const overlayTaskName = document.getElementById('overlay-task-name');
  const btnOverlayToggle = document.getElementById('btn-overlay-toggle');
  const btnOverlaySkip = document.getElementById('btn-overlay-skip');
  const btnExitFocus = document.getElementById('btn-exit-focus');
  const btnEnterFullscreen = document.getElementById('btn-enter-fullscreen');
  const overlayPlayPauseIcon = document.getElementById('overlay-play-pause-icon');

  // Initialize the Application
  function init() {
    // Load tasks and bg from localStorage
    const savedTasks = localStorage.getItem('pomodoro_tasks');
    if (savedTasks) {
      try {
        tasks = JSON.parse(savedTasks);
      } catch(e) {
        console.error("Failed to parse saved tasks", e);
        tasks = [];
      }
    } else {
      // Inject some cute initial tasks so it doesn't look empty
      tasks = [
        { id: 1, name: "整理书桌并擦干净桌子 🧼", quadrant: "urgent-important", estimatedTomatoes: 1, completedTomatoes: 0, completed: false, createdAt: Date.now() - 40000 },
        { id: 2, name: "阅读绘本 30 分钟 📖", quadrant: "important-not", estimatedTomatoes: 2, completedTomatoes: 0, completed: false, createdAt: Date.now() - 30000 },
        { id: 3, name: "给阳台的小花浇水 🌸", quadrant: "urgent-not", estimatedTomatoes: 1, completedTomatoes: 0, completed: false, createdAt: Date.now() - 20000 },
        { id: 4, name: "吃个甜甜圈休息一下 🍩", quadrant: "not-not", estimatedTomatoes: 1, completedTomatoes: 0, completed: false, createdAt: Date.now() - 10000 }
      ];
      saveTasks();
    }

    const savedBg = localStorage.getItem('pomodoro_bg');
    if (savedBg) {
      activeBg = savedBg;
    }
    updateBackground(activeBg);

    const savedTestMode = localStorage.getItem('pomodoro_test_mode');
    if (savedTestMode === 'true') {
      testMode = true;
      updateTestModeUI();
    }

    // Set initial timer state
    resetTimerState();

    // Event Listeners
    setupEventListeners();

    // Initial Render
    renderAll();
  }

  // Background functions
  function updateBackground(bgName) {
    activeBg = bgName;
    localStorage.setItem('pomodoro_bg', bgName);
    body.style.backgroundImage = `url('assets/${bgName}.png')`;
    
    bgOptions.forEach(opt => {
      if (opt.dataset.bg === bgName) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });
  }

  // Event Listeners Registration
  function setupEventListeners() {
    // Toggle Bg Menu
    btnToggleBg.addEventListener('click', (e) => {
      e.stopPropagation();
      playPopSound();
      bgMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      bgMenu.classList.remove('show');
    });

    bgMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    bgOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        playCuteChime();
        updateBackground(opt.dataset.bg);
        bgMenu.classList.remove('show');
      });
    });

    // Toggle Test Mode
    btnToggleTest.addEventListener('click', () => {
      playPopSound();
      testMode = !testMode;
      localStorage.setItem('pomodoro_test_mode', testMode ? 'true' : 'false');
      updateTestModeUI();
      resetTimerState();
    });

    btnCloseTestBanner.addEventListener('click', () => {
      playPopSound();
      testMode = false;
      localStorage.setItem('pomodoro_test_mode', 'false');
      updateTestModeUI();
      resetTimerState();
    });

    // Timer controls
    btnTimerToggle.addEventListener('click', () => {
      playPopSound();
      if (isTimerRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    });

    btnTimerReset.addEventListener('click', () => {
      playPopSound();
      resetTimerState();
    });

    btnTimerSkip.addEventListener('click', () => {
      playPopSound();
      skipStage();
    });

    // Tomato selector
    tomatoButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        playPopSound();
        selectedTomatoCount = parseInt(btn.dataset.val);
        tomatoButtons.forEach(b => {
          if (parseInt(b.dataset.val) <= selectedTomatoCount) {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });
      });
    });

    // Add Task submit
    addTaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = taskNameInput.value.trim();
      if (!name) return;

      playCuteChime();
      const newTask = {
        id: Date.now(),
        name: name,
        quadrant: taskQuadrantSelect.value,
        estimatedTomatoes: selectedTomatoCount,
        completedTomatoes: 0,
        completed: false,
        createdAt: Date.now()
      };

      tasks.push(newTask);
      saveTasks();
      
      // Switch tab to the quadrant the task was added to, so they see it instantly!
      activeTab = newTask.quadrant;

      // Reset Form
      taskNameInput.value = '';
      selectedTomatoCount = 1;
      tomatoButtons.forEach(b => {
        if (parseInt(b.dataset.val) === 1) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      renderAll();
    });

    // Quadrant Tabs
    tabItems.forEach(tab => {
      tab.addEventListener('click', () => {
        playPopSound();
        activeTab = tab.dataset.tab;
        tabItems.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        renderTasks();
      });
    });

    // Settle Modal actions
    btnSettleCompleted.addEventListener('click', () => {
      settleTask(true);
    });

    btnSettleContinue.addEventListener('click', () => {
      settleTask(false);
    });

    // Focus Overlay event listeners
    btnOverlayToggle.addEventListener('click', () => {
      playPopSound();
      if (isTimerRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    });

    btnOverlaySkip.addEventListener('click', () => {
      playPopSound();
      skipStage();
    });

    btnExitFocus.addEventListener('click', () => {
      playPopSound();
      focusOverlay.classList.remove('show');
    });

    btnEnterFullscreen.addEventListener('click', () => {
      playPopSound();
      if (focusTaskId) {
        const task = tasks.find(t => t.id === focusTaskId);
        if (task) {
          overlayTaskName.textContent = task.name;
          focusOverlay.classList.add('show');
        }
      }
    });
  }

  function updateTestModeUI() {
    if (testMode) {
      testBanner.style.display = 'flex';
    } else {
      testBanner.style.display = 'none';
    }
  }

  // Timer Logic
  function resetTimerState() {
    pauseTimer();
    timerMode = 'focus';
    const limits = testMode ? TIMES.test : TIMES.normal;
    timeLeft = limits.focus;
    updateTimerUI();
  }

  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    updatePlayPauseBtn(true);
    
    // Audio Context wake up if needed
    playPopSound();

    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timerInterval = null;
        handleTimerComplete();
      }
      updateTimerUI();
    }, 1000);
  }

  function pauseTimer() {
    if (!isTimerRunning) return;
    isTimerRunning = false;
    clearInterval(timerInterval);
    timerInterval = null;
    updatePlayPauseBtn(false);
  }

  function skipStage() {
    pauseTimer();
    if (timerMode === 'focus') {
      handleTimerComplete();
    } else {
      // If it was a break, go back to focus
      timerMode = 'focus';
      const limits = testMode ? TIMES.test : TIMES.normal;
      timeLeft = limits.focus;
      playCuteChime();
      updateTimerUI();
    }
  }

  function handleTimerComplete() {
    playBellSound();
    updatePlayPauseBtn(false);
    
    if (timerMode === 'focus') {
      // Focus period finished
      if (focusTaskId) {
        const task = tasks.find(t => t.id === focusTaskId);
        if (task) {
          // Show settlement modal
          settleTaskName.textContent = task.name;
          settleModal.classList.add('show');
          return; // Don't switch timer mode until settled
        }
      }
      
      // If no task was actively focused, switch to break automatically
      startBreak();
    } else {
      // Break finished, go to focus
      timerMode = 'focus';
      const limits = testMode ? TIMES.test : TIMES.normal;
      timeLeft = limits.focus;
      alert("休息时间结束啦！准备开始专注了吗？ 🍅");
      startTimer();
    }
    updateTimerUI();
  }

  function startBreak() {
    timerMode = 'break';
    const limits = testMode ? TIMES.test : TIMES.normal;
    timeLeft = limits.break;
    updateTimerUI();
    alert("番茄钟完成！来休息一下吧 ☕");
    startTimer();
  }

  // Settlement logic
  function settleTask(isCompleted) {
    settleModal.classList.remove('show');
    
    const taskIndex = tasks.findIndex(t => t.id === focusTaskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].completedTomatoes++;
      
      if (isCompleted) {
        // Completed task
        tasks[taskIndex].completed = true;
        playCuteChime();
        
        // Auto move completed to completed section
        saveTasks();
        
        // If we completed the task, clear focusing focusTaskId
        focusTaskId = null;
        
        // Hide the focus overlay since task is finished
        focusOverlay.classList.remove('show');
        
        // Start short break
        startBreak();
      } else {
        // Continue task in next tomato
        saveTasks();
        playPopSound();
        
        // Automatically continue to next Focus Pomodoro
        timerMode = 'focus';
        const limits = testMode ? TIMES.test : TIMES.normal;
        timeLeft = limits.focus;
        updateTimerUI();
        
        // Auto start focus
        startTimer();
      }
    }
    
    renderAll();
  }

  // Timer UI updates
  function updateTimerUI() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    clockTimer.textContent = timeStr;
    overlayClockTimer.textContent = timeStr;
    
    // Tab Title updates so user can see countdown in browser tab
    const modeText = timerMode === 'focus' ? '🎯 专注中' : '☕ 休息中';
    document.title = `[${timeStr}] ${modeText} | 萌趣清单`;
    
    if (timerMode === 'focus') {
      clockState.textContent = '专注 Focus';
      clockState.style.background = 'var(--color-primary)';
      overlayClockState.textContent = '专注 Focus';
      overlayClockState.style.background = 'var(--color-primary)';
    } else {
      clockState.textContent = '休息 Break';
      clockState.style.background = 'var(--color-not-not)';
      overlayClockState.textContent = '休息 Break';
      overlayClockState.style.background = 'var(--color-not-not)';
    }
  }

  function updatePlayPauseBtn(running) {
    const iconHtml = running 
      ? `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>` 
      : `<path d="M8 5v14l11-7z"/>`;
    playPauseIcon.innerHTML = iconHtml;
    overlayPlayPauseIcon.innerHTML = iconHtml;
  }

  // Task focus trigger
  function setFocusTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    playCuteChime();
    focusTaskId = task.id;
    focusTaskName.textContent = task.name;
    overlayTaskName.textContent = task.name;
    
    // Highlight the task card visually
    renderTasks();
    
    // Show fullscreen focus overlay automatically
    focusOverlay.classList.add('show');
    
    // Switch to Focus mode timer & Reset countdown
    timerMode = 'focus';
    const limits = testMode ? TIMES.test : TIMES.normal;
    timeLeft = limits.focus;
    updateTimerUI();
    
    // Auto start the timer for friction-free focus!
    startTimer();
  }

  function removeFocusTask() {
    focusTaskId = null;
    focusTaskName.textContent = '请从右侧列表选择任务开始';
    btnEnterFullscreen.style.display = 'none';
    focusOverlay.classList.remove('show');
    renderTasks();
  }

  // Render Functions
  function renderAll() {
    renderBadges();
    renderTasks();
    updateTimerUI();
    
    // Focus task text update and button display
    if (focusTaskId) {
      const task = tasks.find(t => t.id === focusTaskId);
      if (task && !task.completed) {
        focusTaskName.textContent = task.name;
        btnEnterFullscreen.style.display = 'inline-flex';
      } else {
        removeFocusTask();
      }
    } else {
      focusTaskName.textContent = '请从右侧列表选择任务开始';
      btnEnterFullscreen.style.display = 'none';
    }
  }

  function renderBadges() {
    const counts = {
      'urgent-important': 0,
      'important-not': 0,
      'urgent-not': 0,
      'not-not': 0,
      'completed': 0
    };
    
    tasks.forEach(t => {
      if (t.completed) {
        counts['completed']++;
      } else {
        counts[t.quadrant]++;
      }
    });
    
    badgeUI.textContent = counts['urgent-important'];
    badgeIN.textContent = counts['important-not'];
    badgeUN.textContent = counts['urgent-not'];
    badgeNN.textContent = counts['not-not'];
    badgeComp.textContent = counts['completed'];
  }

  function renderTasks() {
    tasksList.innerHTML = '';
    
    // Filter tasks based on activeTab
    let filteredTasks = [];
    if (activeTab === 'completed') {
      filteredTasks = tasks.filter(t => t.completed);
    } else {
      filteredTasks = tasks.filter(t => !t.completed && t.quadrant === activeTab);
    }
    
    // Sort: newest first
    filteredTasks.sort((a, b) => b.createdAt - a.createdAt);
    
    if (filteredTasks.length === 0) {
      const icon = activeTab === 'completed' ? '⭐' : '☁️';
      const text = activeTab === 'completed' ? '还没有完成的任务呢，加油噢！' : '这里空空如也，添加点目标吧！';
      tasksList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${icon}</div>
          <div class="empty-state-text">${text}</div>
        </div>
      `;
      return;
    }
    
    filteredTasks.forEach(task => {
      const isFocusing = task.id === focusTaskId;
      
      // Create card
      const card = document.createElement('div');
      card.className = `task-item ${task.completed ? 'completed-item' : ''} ${isFocusing ? 'focusing' : ''}`;
      
      // Tomatoes Progress Icons HTML
      let tomatoesHtml = '';
      const maxTomatoes = Math.max(task.estimatedTomatoes, task.completedTomatoes);
      for (let i = 0; i < maxTomatoes; i++) {
        if (i < task.completedTomatoes) {
          tomatoesHtml += '<span class="tomato-icon">🍅</span>';
        } else {
          tomatoesHtml += '<span class="tomato-icon pending">🍅</span>';
        }
      }
      
      // Indicator class
      const indClass = task.completed ? 'completed' : task.quadrant;
      
      // Actions HTML
      let actionsHtml = '';
      if (!task.completed) {
        actionsHtml = `
          <button class="btn-action play" onclick="setFocusTask(${task.id})" title="开始专注这个任务" aria-label="Focus on task">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button class="btn-action done" onclick="completeTaskDirect(${task.id})" title="直接标为完成" aria-label="Mark task complete">
            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </button>
        `;
      }
      
      actionsHtml += `
        <button class="btn-action delete" onclick="deleteTask(${task.id})" title="删除任务" aria-label="Delete task">
          <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      `;
      
      card.innerHTML = `
        <div class="task-info">
          <div class="task-indicator ${indClass}"></div>
          <div class="task-details">
            <span class="task-name" title="${task.name}">${task.name}</span>
            <div class="task-tomatoes">
              ${tomatoesHtml}
              <span class="tomato-progress-text">${task.completedTomatoes}/${task.estimatedTomatoes}</span>
            </div>
          </div>
        </div>
        <div class="task-actions">
          ${actionsHtml}
        </div>
      `;
      
      tasksList.appendChild(card);
    });
  }

  // Global functions for task actions (called from inline onclicks)
  function completeTaskDirect(taskId) {
    playCuteChime();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index].completed = true;
      if (focusTaskId === taskId) {
        removeFocusTask();
      }
      saveTasks();
      renderAll();
    }
  }

  function deleteTask(taskId) {
    playPopSound();
    tasks = tasks.filter(t => t.id !== taskId);
    if (focusTaskId === taskId) {
      removeFocusTask();
    }
    saveTasks();
    renderAll();
  }

  function saveTasks() {
    localStorage.setItem('pomodoro_tasks', JSON.stringify(tasks));
  }

  // Export only the required interfaces to global scope
  window.setFocusTask = setFocusTask;
  window.completeTaskDirect = completeTaskDirect;
  window.deleteTask = deleteTask;

  // Start application
  window.addEventListener('DOMContentLoaded', () => {
    init();
  });
})();
