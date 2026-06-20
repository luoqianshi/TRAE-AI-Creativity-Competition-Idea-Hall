/**
 * 智学规划师 - 番茄时钟模块
 * Pomodoro Timer with task integration
 */

(function() {
    'use strict';

    // ===== Pomodoro State =====
    var PomoState = {
        mode: 'focus',           // focus | shortBreak | longBreak
        isRunning: false,
        timeLeft: 25 * 60,       // seconds
        totalTime: 25 * 60,
        intervalId: null,
        completedPomodoros: 0,   // in current session (resets every 4)
        todayPomodoros: 0,
        todayMinutes: 0,
        currentTaskId: null,
        currentTaskName: '',
        settings: {
            focusDuration: 25,
            shortBreak: 5,
            longBreak: 15,
            dailyTarget: 8,
            soundEnabled: true
        }
    };

    var CIRCUMFERENCE = 2 * Math.PI * 120; // 753.98

    // ===== Utility =====
    function $(sel) { return document.querySelector(sel); }
    function $$(sel) { return document.querySelectorAll(sel); }

    function formatTime(seconds) {
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    function getTodayStr() {
        var d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    // ===== Sound =====
    function playNotificationSound() {
        if (!PomoState.settings.soundEnabled) return;
        try {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach(function(freq, i) {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.2);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.4);
                osc.start(ctx.currentTime + i * 0.2);
                osc.stop(ctx.currentTime + i * 0.2 + 0.5);
            });
        } catch (e) {
            // Audio not supported
        }
    }

    // ===== Notification =====
    function showPomoNotification(title, desc) {
        var notif = $('#pomo-notification');
        var notifTitle = $('#notif-title');
        var notifDesc = $('#notif-desc');
        if (!notif) return;
        if (notifTitle) notifTitle.textContent = title;
        if (notifDesc) notifDesc.textContent = desc;
        notif.classList.add('show');
        playNotificationSound();
        setTimeout(function() {
            notif.classList.remove('show');
        }, 4000);
    }

    // ===== Timer Core =====
    function updateTimerDisplay() {
        var timeEl = $('#pomo-time');
        var labelEl = $('#pomo-label');
        var progressEl = $('#pomo-progress');
        var startBtn = $('#pomo-start-btn');

        if (timeEl) timeEl.textContent = formatTime(PomoState.timeLeft);

        var labels = { focus: '专注时间', shortBreak: '短休息', longBreak: '长休息' };
        if (labelEl) labelEl.textContent = labels[PomoState.mode] || '专注时间';

        // Progress
        if (progressEl) {
            var progress = PomoState.totalTime > 0 ? (PomoState.totalTime - PomoState.timeLeft) / PomoState.totalTime : 0;
            var offset = CIRCUMFERENCE - (progress * CIRCUMFERENCE);
            progressEl.style.strokeDashoffset = offset;
            if (PomoState.mode === 'shortBreak' || PomoState.mode === 'longBreak') {
                progressEl.classList.add('break-mode');
            } else {
                progressEl.classList.remove('break-mode');
            }
        }

        // Button text
        if (startBtn) {
            if (PomoState.isRunning) {
                startBtn.textContent = '⏸ 暂停';
                startBtn.classList.add('running');
                if (PomoState.mode !== 'focus') {
                    startBtn.classList.add('break-mode');
                } else {
                    startBtn.classList.remove('break-mode');
                }
            } else {
                var btnLabels = { focus: '▶ 开始专注', shortBreak: '▶ 开始休息', longBreak: '▶ 开始休息' };
                startBtn.textContent = btnLabels[PomoState.mode] || '▶ 开始专注';
                startBtn.classList.remove('running', 'break-mode');
            }
        }

        // Page title
        if (PomoState.isRunning) {
            document.title = formatTime(PomoState.timeLeft) + ' - ' + (labels[PomoState.mode] || '') + ' | 智学规划师';
        } else {
            document.title = '智学规划师 - AI智能学习规划系统';
        }
    }

    function timerTick() {
        if (PomoState.timeLeft > 0) {
            PomoState.timeLeft--;
            updateTimerDisplay();
        } else {
            onTimerComplete();
        }
    }

    function onTimerComplete() {
        clearInterval(PomoState.intervalId);
        PomoState.intervalId = null;
        PomoState.isRunning = false;

        if (PomoState.mode === 'focus') {
            PomoState.completedPomodoros++;
            PomoState.todayPomodoros++;
            PomoState.todayMinutes += PomoState.settings.focusDuration;
            savePomoStats();
            updatePomoStats();

            if (PomoState.completedPomodoros % 4 === 0) {
                showPomoNotification('专注完成！', '已完成 ' + PomoState.completedPomodoros + ' 个番茄钟，该长休息了');
                switchPomoMode('longBreak');
            } else {
                showPomoNotification('专注完成！', '已完成第 ' + PomoState.completedPomodoros + ' 个番茄钟，休息一下');
                switchPomoMode('shortBreak');
            }
        } else {
            showPomoNotification('休息结束', '精力已恢复，继续专注吧！');
            switchPomoMode('focus');
        }

        updateTimerDisplay();
    }

    // ===== Public API =====
    window.togglePomoTimer = function() {
        if (PomoState.isRunning) {
            // Pause
            clearInterval(PomoState.intervalId);
            PomoState.intervalId = null;
            PomoState.isRunning = false;
        } else {
            // Start
            PomoState.isRunning = true;
            PomoState.intervalId = setInterval(timerTick, 1000);
        }
        updateTimerDisplay();
    };

    window.resetPomoTimer = function() {
        clearInterval(PomoState.intervalId);
        PomoState.intervalId = null;
        PomoState.isRunning = false;
        var durations = { focus: PomoState.settings.focusDuration, shortBreak: PomoState.settings.shortBreak, longBreak: PomoState.settings.longBreak };
        PomoState.totalTime = (durations[PomoState.mode] || 25) * 60;
        PomoState.timeLeft = PomoState.totalTime;
        updateTimerDisplay();
    };

    window.skipPomoPhase = function() {
        clearInterval(PomoState.intervalId);
        PomoState.intervalId = null;
        PomoState.isRunning = false;

        if (PomoState.mode === 'focus') {
            switchPomoMode('shortBreak');
        } else {
            switchPomoMode('focus');
        }
    };

    window.switchPomoMode = function(mode) {
        clearInterval(PomoState.intervalId);
        PomoState.intervalId = null;
        PomoState.isRunning = false;
        PomoState.mode = mode;

        var durations = { focus: PomoState.settings.focusDuration, shortBreak: PomoState.settings.shortBreak, longBreak: PomoState.settings.longBreak };
        PomoState.totalTime = (durations[mode] || 25) * 60;
        PomoState.timeLeft = PomoState.totalTime;

        // Update mode buttons
        $$('.pomo-mode').forEach(function(btn) {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        updateTimerDisplay();
    };

    window.updatePomoSettings = function() {
        var focusEl = $('#pomo-focus-duration');
        var shortEl = $('#pomo-short-break');
        var longEl = $('#pomo-long-break');
        var targetEl = $('#pomo-daily-target');
        var soundEl = $('#pomo-sound-toggle');

        if (focusEl) PomoState.settings.focusDuration = Math.max(1, parseInt(focusEl.value) || 25);
        if (shortEl) PomoState.settings.shortBreak = Math.max(1, parseInt(shortEl.value) || 5);
        if (longEl) PomoState.settings.longBreak = Math.max(1, parseInt(longEl.value) || 15);
        if (targetEl) PomoState.settings.dailyTarget = Math.max(1, parseInt(targetEl.value) || 8);
        if (soundEl) PomoState.settings.soundEnabled = soundEl.checked;

        // Update mode button labels
        var focusBtn = document.querySelector('.pomo-mode[data-mode="focus"]');
        var shortBtn = document.querySelector('.pomo-mode[data-mode="shortBreak"]');
        var longBtn = document.querySelector('.pomo-mode[data-mode="longBreak"]');
        if (focusBtn) focusBtn.textContent = '专注 (' + PomoState.settings.focusDuration + 'm)';
        if (shortBtn) shortBtn.textContent = '短休息 (' + PomoState.settings.shortBreak + 'm)';
        if (longBtn) longBtn.textContent = '长休息 (' + PomoState.settings.longBreak + 'm)';

        // Update target display
        var targetDisplay = $('#pomo-today-target');
        if (targetDisplay) targetDisplay.textContent = PomoState.settings.dailyTarget;

        // Reset timer with new settings
        resetPomoTimer();
        savePomoSettings();
        updatePomoStats();
    };

    // ===== Task Selection =====
    window.selectPomoTask = function() {
        var modal = $('#pomo-task-modal');
        var list = $('#pomo-task-modal-list');
        if (!modal || !list) return;

        list.innerHTML = '';

        // Get today's tasks from AppState
        var todayStr = getTodayStr();
        var dayTasks = [];
        if (window.AppState && window.AppState.tasks && window.AppState.tasks[todayStr]) {
            dayTasks = window.AppState.tasks[todayStr];
        }

        if (dayTasks.length === 0) {
            list.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 20px;">今日暂无学习任务<br>请先在"智能规划"中生成学习计划</p>';
        } else {
            dayTasks.forEach(function(task) {
                var item = document.createElement('div');
                item.className = 'pomo-task-modal-item' + (PomoState.currentTaskId === task.id ? ' selected' : '');
                item.innerHTML = '<div class="task-title">' + task.title + '</div>' +
                    '<div class="task-desc">' + task.description + '</div>';
                item.addEventListener('click', function() {
                    PomoState.currentTaskId = task.id;
                    PomoState.currentTaskName = task.title;
                    var nameEl = $('#pomo-current-task');
                    if (nameEl) nameEl.textContent = task.title;
                    closePomoTaskModal();
                    savePomoStats();
                });
                list.appendChild(item);
            });
        }

        modal.classList.add('active');
    };

    window.closePomoTaskModal = function() {
        var modal = $('#pomo-task-modal');
        if (modal) modal.classList.remove('active');
    };

    // ===== Stats =====
    function updatePomoStats() {
        var countEl = $('#pomo-today-count');
        var minutesEl = $('#pomo-today-minutes');
        var targetEl = $('#pomo-today-target');
        var progressEl = $('#pomo-daily-progress');
        var progressText = $('#pomo-progress-text');
        var tomatoGrid = $('#pomo-tomato-grid');

        if (countEl) countEl.textContent = PomoState.todayPomodoros;
        if (minutesEl) minutesEl.textContent = PomoState.todayMinutes;
        if (targetEl) targetEl.textContent = PomoState.settings.dailyTarget;

        var target = PomoState.settings.dailyTarget;
        var percent = Math.min(100, Math.round((PomoState.todayPomodoros / target) * 100));
        if (progressEl) progressEl.style.width = percent + '%';
        if (progressText) progressText.textContent = '今日进度 ' + PomoState.todayPomodoros + '/' + target;

        // Tomato grid
        if (tomatoGrid) {
            tomatoGrid.innerHTML = '';
            for (var i = 0; i < target; i++) {
                var tomato = document.createElement('div');
                tomato.className = 'pomo-tomato' + (i < PomoState.todayPomodoros ? ' completed' : '');
                tomato.textContent = i < PomoState.todayPomodoros ? '🍅' : '○';
                tomatoGrid.appendChild(tomato);
            }
        }
    }

    // ===== Persistence =====
    function savePomoStats() {
        try {
            var data = {
                date: getTodayStr(),
                todayPomodoros: PomoState.todayPomodoros,
                todayMinutes: PomoState.todayMinutes,
                completedPomodoros: PomoState.completedPomodoros,
                currentTaskId: PomoState.currentTaskId,
                currentTaskName: PomoState.currentTaskName
            };
            localStorage.setItem('pomoStats', JSON.stringify(data));
        } catch (e) { /* ignore */ }
    }

    function loadPomoStats() {
        try {
            var saved = localStorage.getItem('pomoStats');
            if (saved) {
                var data = JSON.parse(saved);
                if (data.date === getTodayStr()) {
                    PomoState.todayPomodoros = data.todayPomodoros || 0;
                    PomoState.todayMinutes = data.todayMinutes || 0;
                    PomoState.completedPomodoros = data.completedPomodoros || 0;
                    PomoState.currentTaskId = data.currentTaskId || null;
                    PomoState.currentTaskName = data.currentTaskName || '';
                }
            }
        } catch (e) { /* ignore */ }
    }

    function savePomoSettings() {
        try {
            localStorage.setItem('pomoSettings', JSON.stringify(PomoState.settings));
        } catch (e) { /* ignore */ }
    }

    function loadPomoSettings() {
        try {
            var saved = localStorage.getItem('pomoSettings');
            if (saved) {
                var data = JSON.parse(saved);
                if (data.focusDuration) PomoState.settings.focusDuration = data.focusDuration;
                if (data.shortBreak) PomoState.settings.shortBreak = data.shortBreak;
                if (data.longBreak) PomoState.settings.longBreak = data.longBreak;
                if (data.dailyTarget) PomoState.settings.dailyTarget = data.dailyTarget;
                if (data.soundEnabled !== undefined) PomoState.settings.soundEnabled = data.soundEnabled;
            }
        } catch (e) { /* ignore */ }
    }

    // ===== Init =====
    function initPomodoro() {
        loadPomoSettings();
        loadPomoStats();

        // Apply settings to inputs
        var focusEl = $('#pomo-focus-duration');
        var shortEl = $('#pomo-short-break');
        var longEl = $('#pomo-long-break');
        var targetEl = $('#pomo-daily-target');
        var soundEl = $('#pomo-sound-toggle');

        if (focusEl) focusEl.value = PomoState.settings.focusDuration;
        if (shortEl) shortEl.value = PomoState.settings.shortBreak;
        if (longEl) longEl.value = PomoState.settings.longBreak;
        if (targetEl) targetEl.value = PomoState.settings.dailyTarget;
        if (soundEl) soundEl.checked = PomoState.settings.soundEnabled;

        // Update mode button labels
        var focusBtn = document.querySelector('.pomo-mode[data-mode="focus"]');
        var shortBtn = document.querySelector('.pomo-mode[data-mode="shortBreak"]');
        var longBtn = document.querySelector('.pomo-mode[data-mode="longBreak"]');
        if (focusBtn) focusBtn.textContent = '专注 (' + PomoState.settings.focusDuration + 'm)';
        if (shortBtn) shortBtn.textContent = '短休息 (' + PomoState.settings.shortBreak + 'm)';
        if (longBtn) longBtn.textContent = '长休息 (' + PomoState.settings.longBreak + 'm)';

        // Restore current task
        var nameEl = $('#pomo-current-task');
        if (nameEl && PomoState.currentTaskName) {
            nameEl.textContent = PomoState.currentTaskName;
        }

        // Set initial timer
        PomoState.totalTime = PomoState.settings.focusDuration * 60;
        PomoState.timeLeft = PomoState.totalTime;

        updatePomoStats();
        updateTimerDisplay();
    }

    // Expose init for integration with main app
    window.initPomodoro = initPomodoro;

    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPomodoro);
    } else {
        initPomodoro();
    }
})();
