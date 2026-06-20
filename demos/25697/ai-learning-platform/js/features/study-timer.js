/**
 * 学习计时器 - Study Timer (Pomodoro Style)
 * 智学空间 v3.1.0
 */

class StudyTimer {
    constructor() {
        this.storageKey = 'study_timer_data';
        this.defaultStudyTime = 25 * 60; // 25 minutes in seconds
        this.defaultBreakTime = 5 * 60;  // 5 minutes in seconds
        this.longBreakTime = 15 * 60;    // 15 minutes in seconds
        this.data = this.loadData();
        this.timer = null;
        this.isRunning = false;
        this.isBreak = false;
        this.currentTime = 0;
        this.totalStudyTimeToday = 0;
        this.cyclesCompleted = 0;
        this.audioContext = null;
    }

    loadData() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                const data = JSON.parse(raw);
                // Check if data is from today
                const today = new Date().toDateString();
                if (data.date !== today) {
                    data.dailyStudyTime = 0;
                    data.date = today;
                }
                return data;
            }
        } catch (e) {
            console.warn('加载计时器数据失败', e);
        }
        return {
            studyDuration: this.defaultStudyTime,
            breakDuration: this.defaultBreakTime,
            longBreakDuration: this.longBreakTime,
            dailyStudyTime: 0,
            totalStudyTime: 0,
            totalCycles: 0,
            date: new Date().toDateString(),
            history: []
        };
    }

    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.warn('保存计时器数据失败', e);
        }
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playNotificationSound() {
        try {
            this.initAudio();
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = 880;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        } catch (e) {
            console.warn('播放提示音失败', e);
        }
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    formatDuration(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) {
            return `${h}小时${m}分钟`;
        }
        return `${m}分钟`;
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.currentTime = this.isBreak ? this.data.breakDuration : this.data.studyDuration;
        
        if (this.isBreak) {
            this.showToast('休息开始！放松一下吧', 'success');
        } else {
            this.showToast('专注学习开始！加油', 'success');
        }
        
        this.timer = setInterval(() => {
            this.tick();
        }, 1000);
        
        this.updateUI();
    }

    tick() {
        this.currentTime--;
        
        if (!this.isBreak) {
            this.data.dailyStudyTime++;
            this.data.totalStudyTime++;
        }
        
        if (this.currentTime <= 0) {
            this.complete();
        }
        
        this.updateUI();
        this.saveData();
    }

    pause() {
        if (!this.isRunning) return;
        this.isRunning = false;
        clearInterval(this.timer);
        this.updateUI();
    }

    reset() {
        this.pause();
        this.isBreak = false;
        this.currentTime = 0;
        this.updateUI();
    }

    complete() {
        this.pause();
        this.playNotificationSound();
        
        if (!this.isBreak) {
            this.cyclesCompleted++;
            this.data.totalCycles++;
            
            // Record history
            const now = new Date();
            this.data.history.push({
                type: 'study',
                duration: this.data.studyDuration,
                time: now.toISOString()
            });
            
            this.showToast('专注时间结束！休息一下吧', 'success');
            
            // Award XP
            if (window.LevelSystem) {
                const xp = Math.floor(this.data.studyDuration / 60) * 2;
                window.LevelSystem.addXP(xp, '专注学习');
            }
            
            this.isBreak = true;
            
            // Long break every 4 cycles
            if (this.cyclesCompleted % 4 === 0) {
                this.data.breakDuration = this.data.longBreakDuration;
                this.showToast('完成4个番茄！享受长休息吧', 'success');
            } else {
                this.data.breakDuration = this.defaultBreakTime;
            }
        } else {
            this.showToast('休息结束！准备下一轮学习', 'success');
            this.isBreak = false;
            this.data.breakDuration = this.defaultBreakTime;
        }
        
        this.saveData();
        this.updateUI();
    }

    setStudyDuration(minutes) {
        this.data.studyDuration = minutes * 60;
        if (!this.isRunning && !this.isBreak) {
            this.currentTime = this.data.studyDuration;
        }
        this.saveData();
        this.updateUI();
    }

    setBreakDuration(minutes) {
        this.data.breakDuration = minutes * 60;
        if (!this.isRunning && this.isBreak) {
            this.currentTime = this.data.breakDuration;
        }
        this.saveData();
        this.updateUI();
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        }
    }

    updateUI() {
        const display = document.getElementById('timerDisplay');
        const status = document.getElementById('timerStatus');
        const progress = document.getElementById('timerProgress');
        const dailyTime = document.getElementById('timerDailyTime');
        const cycles = document.getElementById('timerCycles');
        const startBtn = document.getElementById('timerStartBtn');
        const pauseBtn = document.getElementById('timerPauseBtn');
        const resetBtn = document.getElementById('timerResetBtn');

        if (display) {
            const time = this.isRunning ? this.currentTime : 
                        (this.currentTime > 0 ? this.currentTime : 
                         (this.isBreak ? this.data.breakDuration : this.data.studyDuration));
            display.textContent = this.formatTime(time);
        }

        if (status) {
            status.textContent = this.isRunning ? 
                (this.isBreak ? '休息中...' : '专注学习中...') :
                (this.isBreak ? '准备休息' : '准备学习');
            status.className = this.isBreak ? 'timer-status break' : 'timer-status study';
        }

        if (progress) {
            const total = this.isBreak ? this.data.breakDuration : this.data.studyDuration;
            const current = this.isRunning ? this.currentTime : total;
            const pct = total > 0 ? ((total - current) / total * 100) : 0;
            progress.style.width = `${pct}%`;
        }

        if (dailyTime) {
            dailyTime.textContent = this.formatDuration(this.data.dailyStudyTime);
        }

        if (cycles) {
            cycles.textContent = this.data.totalCycles;
        }

        if (startBtn) startBtn.disabled = this.isRunning;
        if (pauseBtn) pauseBtn.disabled = !this.isRunning;
        if (resetBtn) resetBtn.disabled = this.isRunning;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="study-timer-container">
                <div class="timer-header">
                    <h2>⏱️ 学习计时器</h2>
                    <p>番茄工作法，高效学习</p>
                </div>
                
                <div class="timer-main">
                    <div class="timer-circle">
                        <div class="timer-display" id="timerDisplay">${this.formatTime(this.data.studyDuration)}</div>
                        <div class="timer-status" id="timerStatus">准备学习</div>
                        <div class="timer-progress-bar">
                            <div class="timer-progress" id="timerProgress"></div>
                        </div>
                    </div>
                    
                    <div class="timer-controls">
                        <button id="timerStartBtn" class="timer-btn start">开始</button>
                        <button id="timerPauseBtn" class="timer-btn pause" disabled>暂停</button>
                        <button id="timerResetBtn" class="timer-btn reset">重置</button>
                    </div>
                </div>
                
                <div class="timer-settings">
                    <div class="setting-group">
                        <label>学习时长</label>
                        <div class="duration-options">
                            ${[15, 25, 45, 60].map(m => `
                                <button class="duration-btn ${this.data.studyDuration === m * 60 ? 'active' : ''}" 
                                        data-type="study" data-minutes="${m}">${m}分钟</button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="setting-group">
                        <label>休息时长</label>
                        <div class="duration-options">
                            ${[5, 10, 15, 20].map(m => `
                                <button class="duration-btn ${this.data.breakDuration === m * 60 ? 'active' : ''}" 
                                        data-type="break" data-minutes="${m}">${m}分钟</button>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="timer-stats">
                    <div class="timer-stat">
                        <span class="stat-label">今日学习</span>
                        <span class="stat-value" id="timerDailyTime">${this.formatDuration(this.data.dailyStudyTime)}</span>
                    </div>
                    <div class="timer-stat">
                        <span class="stat-label">完成番茄</span>
                        <span class="stat-value" id="timerCycles">${this.data.totalCycles}</span>
                    </div>
                    <div class="timer-stat">
                        <span class="stat-label">累计学习</span>
                        <span class="stat-value">${this.formatDuration(this.data.totalStudyTime)}</span>
                    </div>
                </div>
                
                <div class="timer-tips">
                    <h4>💡 使用提示</h4>
                    <ul>
                        <li>每完成4个番茄钟，会自动进入长休息（15分钟）</li>
                        <li>学习时保持专注，避免分心</li>
                        <li>休息时远离屏幕，放松眼睛</li>
                        <li>坚持每日使用，养成良好学习习惯</li>
                    </ul>
                </div>
            </div>
        `;

        // Bind events
        const startBtn = document.getElementById('timerStartBtn');
        const pauseBtn = document.getElementById('timerPauseBtn');
        const resetBtn = document.getElementById('timerResetBtn');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pause());
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }

        // Duration buttons
        container.querySelectorAll('.duration-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const minutes = parseInt(btn.dataset.minutes);
                
                if (type === 'study') {
                    this.setStudyDuration(minutes);
                } else {
                    this.setBreakDuration(minutes);
                }
                
                // Update active state
                container.querySelectorAll(`.duration-btn[data-type="${type}"]`).forEach(b => {
                    b.classList.toggle('active', b === btn);
                });
            });
        });

        this.updateUI();
    }
}

// Global instance
window.StudyTimer = StudyTimer;
