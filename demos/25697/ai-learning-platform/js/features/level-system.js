// ========== Level & Experience System ==========
const LevelSystem = {
    // Level configuration: XP needed for each level
    // Level 0 = 0 XP, Level 1 = 100 XP, Level 2 = 250 XP, etc.
    // Formula: XP for level N = 100 * N * (N + 1) / 2 (triangular numbers scaled)
    getXPForLevel: function(level) {
        return Math.floor(100 * level * (level + 1) / 2);
    },

    getMaxLevel: function() { return 50; },

    // Weekly XP cap
    weeklyXPCap: 5000,

    // XP rewards for different activities
    xpRewards: {
        askQuestion: 10,      // 提问
        correctAnswer: 20,    // 答对
        wrongAnswer: 5,       // 答错（也有参与分）
        dailyLogin: 30,       // 每日登录
        gamePlay: 15,         // 完成一局游戏
        gameWin: 30,          // 游戏获胜
        flashcardReview: 8,   // 复习闪卡
        streakBonus: 50,      // 连续登录奖励（7天）
        weeklyGoal: 100,      // 完成每周目标
        subjectMaster: 200    // 掌握一个科目
    },

    // User level data (stored in localStorage per user)
    data: {
        level: 0,
        totalXP: 0,
        weeklyXP: 0,
        weekStart: '',         // ISO date of week start
        lastLoginDate: '',
        loginStreak: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        totalGames: 0,
        history: []            // [{action, xp, date, details}]
    },

    init: function() {
        try {
            var userId = state.currentUser ? state.currentUser.id : 'guest';
            var saved = localStorage.getItem('level_data_' + userId);
            if (saved) {
                this.data = JSON.parse(saved);
            } else {
                // 尝试从旧的全局key迁移
                var oldData = localStorage.getItem('level_data');
                if (oldData) {
                    this.data = JSON.parse(oldData);
                    localStorage.setItem('level_data_' + userId, oldData);
                    localStorage.removeItem('level_data');
                } else {
                    this._resetData();
                }
            }
        } catch (e) {
            this._resetData();
        }
        this._checkWeeklyReset();
        this._checkDailyLogin();
        this.updateUI();
    },

    _resetData: function() {
        this.data = {
            level: 0,
            totalXP: 0,
            weeklyXP: 0,
            weekStart: '',
            lastLoginDate: '',
            loginStreak: 0,
            totalQuestions: 0,
            totalCorrect: 0,
            totalGames: 0,
            history: []
        };
    },

    save: function() {
        try {
            var userId = state.currentUser ? state.currentUser.id : 'guest';
            localStorage.setItem('level_data_' + userId, JSON.stringify(this.data));
        } catch (e) { /* ignore */ }
    },

    _checkWeeklyReset: function() {
        var now = new Date();
        var weekStart = this._getWeekStart(now);
        if (this.data.weekStart !== weekStart) {
            this.data.weeklyXP = 0;
            this.data.weekStart = weekStart;
            this.save();
        }
    },

    _getWeekStart: function(date) {
        var d = new Date(date);
        var day = d.getDay();
        var diff = d.getDate() - day + (day === 0 ? -6 : 1);
        var monday = new Date(d.setDate(diff));
        return monday.toISOString().split('T')[0];
    },

    _checkDailyLogin: function() {
        var today = new Date().toISOString().split('T')[0];
        if (this.data.lastLoginDate !== today) {
            // Check streak
            var yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            if (this.data.lastLoginDate === yesterday) {
                this.data.loginStreak++;
            } else if (this.data.lastLoginDate !== today) {
                this.data.loginStreak = 1;
            }
            this.data.lastLoginDate = today;

            // Award login XP
            this.addXP('dailyLogin', this.xpRewards.dailyLogin, '每日登录');

            // Streak bonus every 7 days
            if (this.data.loginStreak > 0 && this.data.loginStreak % 7 === 0) {
                this.addXP('streakBonus', this.xpRewards.streakBonus, '连续登录' + this.data.loginStreak + '天奖励');
            }
        }
    },

    addXP: function(action, amount, details) {
        // Check weekly cap
        if (this.data.weeklyXP + amount > this.weeklyXPCap) {
            var remaining = this.weeklyXPCap - this.data.weeklyXP;
            if (remaining <= 0) {
                return { added: 0, capped: true };
            }
            amount = remaining;
        }

        var oldLevel = this.data.level;
        this.data.totalXP += amount;
        this.data.weeklyXP += amount;

        // Update stats
        if (action === 'askQuestion') {
            this.data.totalQuestions++;
        } else if (action === 'correctAnswer') {
            this.data.totalCorrect++;
        } else if (action === 'gamePlay' || action === 'gameWin') {
            this.data.totalGames++;
        }

        // Check level up
        this.data.level = this._calculateLevel(this.data.totalXP);
        var leveledUp = this.data.level > oldLevel;

        // Record history
        this.data.history.push({
            action: action,
            xp: amount,
            date: new Date().toISOString(),
            details: details || ''
        });
        // Keep last 100 records
        if (this.data.history.length > 100) {
            this.data.history = this.data.history.slice(-100);
        }

        this.save();
        this.updateUI();

        if (leveledUp) {
            this._showLevelUpEffect(oldLevel, this.data.level);
        }

        return {
            added: amount,
            capped: this.data.weeklyXP >= this.weeklyXPCap,
            leveledUp: leveledUp,
            newLevel: this.data.level
        };
    },

    _calculateLevel: function(totalXP) {
        var level = 0;
        var maxLevel = this.getMaxLevel();
        while (level < maxLevel && this.getXPForLevel(level + 1) <= totalXP) {
            level++;
        }
        return level;
    },

    getXPProgress: function() {
        var currentLevelXP = this.getXPForLevel(this.data.level);
        var nextLevelXP = this.getXPForLevel(this.data.level + 1);
        var progress = nextLevelXP > currentLevelXP
            ? (this.data.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)
            : 1;
        return Math.min(1, Math.max(0, progress));
    },

    getXPToNextLevel: function() {
        return this.getXPForLevel(this.data.level + 1) - this.data.totalXP;
    },

    getWeeklyXPRemaining: function() {
        return Math.max(0, this.weeklyXPCap - this.data.weeklyXP);
    },

    updateUI: function() {
        // Update sidebar level display
        var levelEl = document.getElementById('userLevel');
        var xpBarEl = document.getElementById('userXPBar');
        var xpTextEl = document.getElementById('userXPText');

        // Ensure elements exist before updating
        if (!levelEl && !xpBarEl && !xpTextEl) {
            return;
        }

        if (levelEl) {
            levelEl.textContent = 'LV.' + this.data.level;
            // Apply level color
            levelEl.className = 'user-level level-color-' + this._getLevelColorClass(this.data.level);
        }
        if (xpBarEl) {
            xpBarEl.style.width = (this.getXPProgress() * 100) + '%';
            xpBarEl.className = 'user-xp-fill level-color-fill-' + this._getLevelColorClass(this.data.level);
        }
        if (xpTextEl) {
            if (this.data.level >= this.getMaxLevel()) {
                xpTextEl.textContent = 'MAX';
            } else {
                xpTextEl.textContent = this.getXPToNextLevel() + ' XP';
            }
        }
    },

    _getLevelColorClass: function(level) {
        if (level >= 50) return 'gold';
        if (level >= 40) return 'red';
        if (level >= 30) return 'orange';
        if (level >= 20) return 'purple';
        if (level >= 10) return 'blue';
        if (level >= 5) return 'green';
        return 'gray';
    },

    _showLevelUpEffect: function(oldLevel, newLevel) {
        showToast('success', '🎉 升级了！ LV.' + oldLevel + ' → LV.' + newLevel);
        // Add level-up animation class to sidebar
        var sidebarUser = document.getElementById('sidebarUser');
        if (sidebarUser) {
            sidebarUser.classList.add('level-up-animation');
            setTimeout(function() {
                sidebarUser.classList.remove('level-up-animation');
            }, 2000);
        }
    },

    // Get level title based on level
    getLevelTitle: function(level) {
        if (level >= 50) return '🏆 学霸传说';
        if (level >= 40) return '👑 知识大师';
        if (level >= 30) return '💎 学习精英';
        if (level >= 20) return '🌟 进阶学者';
        if (level >= 15) return '📖 勤奋学生';
        if (level >= 10) return '✨ 活跃学习者';
        if (level >= 5) return '📚 初学者';
        if (level >= 1) return '🌱 新手入门';
        return '🆕 萌新';
    },

    // Open level modal
    openLevelModal: function() {
        var html = this.renderLevelPanel();
        showModal('等级与经验', html);
    },

    // Show a small popup near the level bar (not full modal)
    showLevelPopup: function() {
        var progress = this.getXPProgress();
        var pct = Math.floor(progress * 100);
        var currentXP = this.data.totalXP;
        var currentLevel = this.data.level;
        var nextXP = this.getXPForLevel(currentLevel + 1);
        var title = this.getLevelTitle(currentLevel);

        // Remove existing popup
        var existing = document.getElementById('levelPopup');
        if (existing) existing.remove();

        var popup = document.createElement('div');
        popup.id = 'levelPopup';
        popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;z-index:2000;box-shadow:0 8px 32px rgba(0,0,0,0.3);min-width:260px;text-align:center;animation:modalScaleIn 0.2s ease;';

        popup.innerHTML = '<div style="font-size:28px;font-weight:900;color:var(--primary-light);margin-bottom:4px;">LV.' + currentLevel + '</div>' +
            '<div style="font-size:13px;color:var(--text-muted);margin-bottom:12px;">' + title + '</div>' +
            '<div style="background:var(--bg-input);border-radius:10px;height:8px;overflow:hidden;margin-bottom:6px;"><div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--primary),var(--secondary));border-radius:10px;transition:width 0.3s ease;"></div></div>' +
            '<div style="font-size:12px;color:var(--text-muted);margin-bottom:16px;">' + currentXP + ' / ' + nextXP + ' XP (' + pct + '%)</div>' +
            '<div style="display:flex;gap:8px;justify-content:center;">' +
            '<button class="btn-secondary" onclick="document.getElementById(\'levelPopup\').remove()" style="padding:6px 16px;font-size:12px;">关闭</button>' +
            '<button class="btn-primary" onclick="document.getElementById(\'levelPopup\').remove();LevelSystem.openLevelModal()" style="padding:6px 16px;font-size:12px;">查看详情</button>' +
            '</div>';

        // Click outside to close
        popup.onclick = function(e) { if (e.target === popup) popup.remove(); };

        document.body.appendChild(popup);
    },

    // Render level info panel for settings (compact version)
    renderLevelPanelCompact: function() {
        var progress = this.getXPProgress();
        var pct = Math.floor(progress * 100);
        var html = '<div class="level-panel-compact">';
        html += '<div class="level-display"><span class="level-number">LV.' + this.data.level + '</span>';
        html += '<span class="level-title">' + this.getLevelTitle(this.data.level) + '</span></div>';
        html += '<div class="xp-bar-container"><div class="xp-bar-fill" style="width:' + pct + '%"></div></div>';
        html += '<div class="xp-info">';
        html += '<span>总经验：' + this.data.totalXP + ' XP</span>';
        if (this.data.level < this.getMaxLevel()) {
            html += '<span>距下一级：' + this.getXPToNextLevel() + ' XP</span>';
        }
        html += '</div>';
        html += '<div class="xp-weekly">本周经验：' + this.data.weeklyXP + '/' + this.weeklyXPCap + '（剩余' + this.getWeeklyXPRemaining() + '）</div>';
        html += '</div>';
        return html;
    },

    // Render full level info panel for modal
    renderLevelPanel: function() {
        var progress = this.getXPProgress();
        var pct = Math.floor(progress * 100);
        var html = '<div class="level-panel">';
        html += '<div class="level-display"><span class="level-number">LV.' + this.data.level + '</span>';
        html += '<span class="level-title">' + this.getLevelTitle(this.data.level) + '</span></div>';
        html += '<div class="xp-bar-container"><div class="xp-bar-fill" style="width:' + pct + '%"></div></div>';
        html += '<div class="xp-info">';
        html += '<span>总经验：' + this.data.totalXP + ' XP</span>';
        if (this.data.level < this.getMaxLevel()) {
            html += '<span>距下一级：' + this.getXPToNextLevel() + ' XP</span>';
        }
        html += '</div>';
        html += '<div class="xp-weekly">本周经验：' + this.data.weeklyXP + '/' + this.weeklyXPCap + '（剩余' + this.getWeeklyXPRemaining() + '）</div>';
        html += '<div class="xp-stats">';
        html += '<div class="xp-stat"><span class="stat-value">' + this.data.totalQuestions + '</span><span class="stat-label">总提问</span></div>';
        html += '<div class="xp-stat"><span class="stat-value">' + this.data.totalCorrect + '</span><span class="stat-label">答对</span></div>';
        html += '<div class="xp-stat"><span class="stat-value">' + this.data.totalGames + '</span><span class="stat-label">游戏</span></div>';
        html += '<div class="xp-stat"><span class="stat-value">' + this.data.loginStreak + '</span><span class="stat-label">连续天数</span></div>';
        html += '</div>';
        html += '<div class="xp-rewards-list"><h4>经验获取方式</h4>';
        var labels = {
            askQuestion: '📝 提问',
            correctAnswer: '✅ 答对',
            wrongAnswer: '❌ 答错',
            dailyLogin: '📅 每日登录',
            gamePlay: '🎮 完成游戏',
            gameWin: '🏆 游戏获胜',
            flashcardReview: '🎴 复习闪卡',
            streakBonus: '🔥 连续登录奖励',
            weeklyGoal: '🎯 周目标',
            subjectMaster: '📖 掌握科目'
        };
        var self = this;
        Object.keys(this.xpRewards).forEach(function(key) {
            html += '<div class="xp-reward-item"><span>' + (labels[key] || key) + '</span><span>+' + self.xpRewards[key] + ' XP</span></div>';
        });
        html += '</div></div>';
        return html;
    }
};
