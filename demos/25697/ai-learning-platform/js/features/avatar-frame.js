// ========== Avatar Frame System - 注册用户专属 ==========
const AvatarFrameSystem = {
    frames: [
        { id: 'none', name: '无框', icon: '❌', css: '', unlockCondition: 'default' },
        { id: 'classic_gold', name: '经典金框', icon: '🥇', css: 'frame-classic-gold', unlockCondition: 'free', effect: 'glow' },
        { id: 'silver', name: '银色边框', icon: '🥈', css: 'frame-silver', unlockCondition: 'free', effect: 'shine' },
        { id: 'bronze', name: '铜色边框', icon: '🥉', css: 'frame-bronze', unlockCondition: 'free', effect: 'pulse' },
        { id: 'neon_blue', name: '霓虹蓝', icon: '💙', css: 'frame-neon-blue', unlockCondition: 'free', effect: 'neon' },
        { id: 'neon_purple', name: '霓虹紫', icon: '💜', css: 'frame-neon-purple', unlockCondition: 'free', effect: 'neon' },
        { id: 'fire', name: '烈焰框', icon: '🔥', css: 'frame-fire', unlockCondition: 'level_15', effect: 'fire' },
        { id: 'rainbow', name: '彩虹框', icon: '🌈', css: 'frame-rainbow', unlockCondition: 'level_25', effect: 'rainbow' },
        { id: 'crown', name: '皇冠框', icon: '👑', css: 'frame-crown', unlockCondition: 'level_35', effect: 'crown' },
        { id: 'diamond', name: '钻石框', icon: '💎', css: 'frame-diamond', unlockCondition: 'level_45', effect: 'diamond' },
        { id: 'legendary', name: '传说之框', icon: '🏆', css: 'frame-legendary', unlockCondition: 'level_50', effect: 'legendary' },
        { id: 'star', name: '星空框', icon: '⭐', css: 'frame-star', unlockCondition: 'free', effect: 'stars' },
        { id: 'gradient', name: '渐变流光', icon: '🎨', css: 'frame-gradient', unlockCondition: 'free', effect: 'gradient' },
        { id: 'ice', name: '冰霜框', icon: '❄️', css: 'frame-ice', unlockCondition: 'free', effect: 'ice' },
        { id: 'thunder', name: '雷电框', icon: '⚡', css: 'frame-thunder', unlockCondition: 'free', effect: 'thunder' },
        { id: 'sakura', name: '樱花框', icon: '🌸', css: 'frame-sakura', unlockCondition: 'free', effect: 'sakura' },
        { id: 'shadow', name: '暗影框', icon: '🌑', css: 'frame-shadow', unlockCondition: 'free', effect: 'shadow' },
        { id: 'holy', name: '神圣框', icon: '✨', css: 'frame-holy', unlockCondition: 'level_40', effect: 'holy' },
        { id: 'scholar', name: '学霸框', icon: '📚', css: 'frame-scholar', unlockCondition: 'free', effect: 'scholar' },
        { id: 'night_owl', name: '夜猫子框', icon: '🦉', css: 'frame-night-owl', unlockCondition: 'free', effect: 'night_owl' },
        { id: 'win_streak', name: '连胜框', icon: '🏆', css: 'frame-win-streak', unlockCondition: '5_win_streak', effect: 'win_streak' },
        { id: 'aurora', name: '极光框', icon: '🌌', css: 'frame-aurora', unlockCondition: 'free', effect: 'aurora' },
        { id: 'lava', name: '熔岩框', icon: '🌋', css: 'frame-lava', unlockCondition: 'free', effect: 'lava' },
        { id: 'ocean', name: '海洋框', icon: '🌊', css: 'frame-ocean', unlockCondition: 'free', effect: 'ocean' },
        { id: 'forest', name: '森林框', icon: '🌲', css: 'frame-forest', unlockCondition: 'free', effect: 'forest' },
        { id: 'galaxy', name: '银河框', icon: '💫', css: 'frame-galaxy', unlockCondition: 'level_50', effect: 'galaxy' },
        { id: 'dragon', name: '龙焰框', icon: '🐉', css: 'frame-dragon', unlockCondition: 'level_45', effect: 'dragon' },
        { id: 'crystal', name: '水晶框', icon: '🔮', css: 'frame-crystal', unlockCondition: 'free', effect: 'crystal' },
        { id: 'cyber', name: '赛博框', icon: '🤖', css: 'frame-cyber', unlockCondition: 'free', effect: 'cyber' }
    ],

    // Get total question count across all subjects
    _getTotalQuestionCount() {
        let total = 0;
        if (!state.learningStats) return 0;
        Object.keys(state.learningStats).forEach(function(subject) {
            const subjectStats = state.learningStats[subject];
            Object.keys(subjectStats).forEach(function(date) {
                total += (subjectStats[date].count || 0);
            });
        });
        return total;
    },

    // Get number of unique subjects with activity
    _getActiveSubjectCount() {
        if (!state.learningStats) return 0;
        let count = 0;
        Object.keys(state.learningStats).forEach(function(subject) {
            const subjectStats = state.learningStats[subject];
            let hasActivity = false;
            Object.keys(subjectStats).forEach(function(date) {
                if (subjectStats[date].count > 0) hasActivity = true;
            });
            if (hasActivity) count++;
        });
        return count;
    },

    // Get consecutive day streak
    _getDayStreak() {
        if (!state.learningStats) return 0;
        var streak = 0;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var checkDate = new Date(today);

        // Check if today has activity
        var todayActive = false;
        Object.keys(state.learningStats).forEach(function(subject) {
            var todayKey = today.toISOString().split('T')[0];
            if (state.learningStats[subject][todayKey] && state.learningStats[subject][todayKey].count > 0) {
                todayActive = true;
            }
        });

        if (!todayActive) {
            // Check if yesterday was active (streak might still be going from yesterday)
            checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
            var dateKey = checkDate.toISOString().split('T')[0];
            var dayActive = false;
            Object.keys(state.learningStats).forEach(function(subject) {
                if (state.learningStats[subject][dateKey] && state.learningStats[subject][dateKey].count > 0) {
                    dayActive = true;
                }
            });
            if (dayActive) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    },

    // Get total games played
    _getGamesPlayed() {
        try {
            var data = localStorage.getItem('gamesPlayed_' + (state.currentUser ? state.currentUser.id : 'guest'));
            return data ? parseInt(data, 10) : 0;
        } catch (e) {
            return 0;
        }
    },

    // Get total questions answered (from LevelSystem if available, fallback to learningStats)
    _getTotalQuestionsAnswered() {
        if (typeof LevelSystem !== 'undefined' && LevelSystem.data && LevelSystem.data.totalQuestions) {
            return LevelSystem.data.totalQuestions;
        }
        return this._getTotalQuestionCount();
    },

    // Check if user has studied after 22:00
    _hasNightStudy() {
        try {
            var data = localStorage.getItem('nightStudy_' + (state.currentUser ? state.currentUser.id : 'guest'));
            return data === 'true';
        } catch (e) {
            return false;
        }
    },

    // Get current consecutive game win streak
    _getGameWinStreak() {
        try {
            var data = localStorage.getItem('gameWinStreak_' + (state.currentUser ? state.currentUser.id : 'guest'));
            return data ? parseInt(data, 10) : 0;
        } catch (e) {
            return 0;
        }
    },

    // Get total number of available subjects
    _getTotalSubjectCount() {
        return (state.subjects || []).length;
    },

    // Check if a specific frame is unlocked
    isFrameUnlocked(frameId) {
        var frame = this.frames.find(function(f) { return f.id === frameId; });
        if (!frame) return false;
        if (frame.unlockCondition === 'default') return true;
        if (frame.unlockCondition === 'free') return true;
        if (!state.currentUser || state.currentUser.isGuest) return false;

        var totalQuestions = this._getTotalQuestionCount();
        var activeSubjects = this._getActiveSubjectCount();
        var totalSubjects = this._getTotalSubjectCount();
        var dayStreak = this._getDayStreak();
        var gamesPlayed = this._getGamesPlayed();
        var questionsAnswered = this._getTotalQuestionsAnswered();
        var hasNightStudy = this._hasNightStudy();
        var winStreak = this._getGameWinStreak();

        // Check level-based conditions
        if (frame.unlockCondition.indexOf('level_') === 0) {
            var requiredLevel = parseInt(frame.unlockCondition.replace('level_', ''), 10);
            var userLevel = (typeof LevelSystem !== 'undefined') ? LevelSystem.data.level : 0;
            return userLevel >= requiredLevel;
        }

        switch (frame.unlockCondition) {
            case 'register':
                return true; // Already registered (not guest)
            case '7_day_streak':
                return dayStreak >= 7;
            case '10_games':
                return gamesPlayed >= 10;
            case '100_questions':
                return questionsAnswered >= 100;
            case 'night_study':
                return hasNightStudy;
            case '5_win_streak':
                return winStreak >= 5;
            default:
                return false;
        }
    },

    // Get all unlocked frames
    getUnlockedFrames() {
        return this.frames.filter(function(frame) {
            return AvatarFrameSystem.isFrameUnlocked(frame.id);
        });
    },

    // Get unlock progress for a frame (returns { current, target, percentage })
    getFrameProgress(frameId) {
        var frame = this.frames.find(function(f) { return f.id === frameId; });
        if (!frame) return { current: 0, target: 1, percentage: 100 };
        if (frame.unlockCondition === 'default' || frame.unlockCondition === 'register') {
            return { current: 1, target: 1, percentage: 100 };
        }

        // Level-based progress
        if (frame.unlockCondition.indexOf('level_') === 0) {
            var requiredLevel = parseInt(frame.unlockCondition.replace('level_', ''), 10);
            var userLevel = (typeof LevelSystem !== 'undefined') ? LevelSystem.data.level : 0;
            var percentage = Math.min(100, Math.round((userLevel / requiredLevel) * 100));
            return { current: userLevel, target: requiredLevel, percentage: percentage };
        }

        var dayStreak = this._getDayStreak();
        var gamesPlayed = this._getGamesPlayed();
        var questionsAnswered = this._getTotalQuestionsAnswered();
        var hasNightStudy = this._hasNightStudy();
        var winStreak = this._getGameWinStreak();

        var current = 0;
        var target = 1;

        switch (frame.unlockCondition) {
            case '7_day_streak': current = dayStreak; target = 7; break;
            case '10_games': current = gamesPlayed; target = 10; break;
            case '100_questions': current = questionsAnswered; target = 100; break;
            case 'night_study': current = hasNightStudy ? 1 : 0; target = 1; break;
            case '5_win_streak': current = winStreak; target = 5; break;
            default: return { current: 1, target: 1, percentage: 100 };
        }

        var percentage = Math.min(100, Math.round((current / target) * 100));
        return { current: current, target: target, percentage: percentage };
    },

    // Get the user's currently selected frame
    getActiveFrame() {
        if (!state.currentUser || state.currentUser.isGuest) return 'none';
        try {
            var data = localStorage.getItem('activeFrame_' + state.currentUser.id);
            return data || 'none';
        } catch (e) {
            return 'none';
        }
    },

    // Set active frame
    setFrame(frameId) {
        if (!state.currentUser || state.currentUser.isGuest) {
            showToast('warning', '游客用户无法使用头像框');
            return;
        }
        if (!this.isFrameUnlocked(frameId)) {
            showToast('warning', '该头像框尚未解锁');
            return;
        }
        try {
            localStorage.setItem('activeFrame_' + state.currentUser.id, frameId);
        } catch (e) { /* ignore */ }
        // Also save to user object for chat avatar display
        state.currentUser.avatarFrame = frameId;
        UserManager.updateUser(state.currentUser.id, { avatarFrame: frameId });
        showToast('success', '头像框已更换');

        // Update all visible avatars
        this.refreshAllAvatars();
    },

    // Apply frame to a specific avatar element
    applyFrame(avatarElement, frameId) {
        if (!avatarElement) return;

        // Remove any existing frame
        var existingFrame = avatarElement.querySelector('.avatar-frame');
        if (existingFrame) existingFrame.remove();

        if (!frameId || frameId === 'none') return;
        if (state.currentUser && state.currentUser.isGuest) return;

        var frame = this.frames.find(function(f) { return f.id === frameId; });
        if (!frame || !frame.css) return;

        // Create frame as a border overlay (positioned absolutely)
        var frameEl = document.createElement('div');
        frameEl.className = 'avatar-frame ' + frame.css;

        // The frame goes ON TOP of the avatar as a border
        // Don't move children - just append the frame overlay
        avatarElement.style.position = 'relative';
        avatarElement.appendChild(frameEl);
    },

    // Refresh all avatar elements on the page
    refreshAllAvatars() {
        var activeFrame = this.getActiveFrame();

        // Sidebar avatar
        var sidebarAvatar = document.getElementById('sidebarUserAvatar');
        if (sidebarAvatar) {
            this.applyFrame(sidebarAvatar, activeFrame);
        }

        // Profile avatar
        var profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar) {
            this.applyFrame(profileAvatar, activeFrame);
        }
    },

    // Render frame selector UI for settings
    renderFrameSelector() {
        var container = document.getElementById('avatarFrameSelector');
        if (!container) return;

        // Guest check
        if (state.currentUser && state.currentUser.isGuest) {
            container.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:8px;">游客用户无法使用头像框，请先注册账号。</div>';
            return;
        }

        var activeFrame = this.getActiveFrame();
        var unlockedFrames = this.getUnlockedFrames();
        var self = this;

        // Update badge count
        var badge = document.getElementById('frameCount');
        if (badge) {
            badge.textContent = unlockedFrames.length + '/' + this.frames.length;
        }

        // Frame categories
        var categories = [
            { id: 'basic', name: '基础框', frames: ['none', 'classic_gold', 'silver'] },
            { id: 'level', name: '等级框', frames: ['bronze', 'neon_blue', 'neon_purple', 'fire', 'rainbow', 'crown', 'diamond', 'legendary', 'ice', 'thunder', 'sakura', 'shadow', 'holy'] },
            { id: 'achievement', name: '成就框', frames: ['star', 'gradient', 'scholar', 'night_owl', 'win_streak'] },
            { id: 'effect', name: '特效框', frames: ['aurora', 'lava', 'ocean', 'forest', 'galaxy', 'dragon', 'crystal', 'cyber'] }
        ];

        var html = '';
        categories.forEach(function(cat) {
            var catUnlocked = 0;
            cat.frames.forEach(function(fid) {
                if (self.isFrameUnlocked(fid)) catUnlocked++;
            });

            html += '<div class="frame-category" data-cat="' + cat.id + '" data-expanded="false">';
            html += '<div class="frame-category-header" onclick="AvatarFrameSystem.toggleCategory(\'' + cat.id + '\')">';
            html += '<span class="frame-category-name">' + cat.name + '</span>';
            html += '<span class="frame-category-count">' + catUnlocked + '/' + cat.frames.length + '</span>';
            html += '<span class="frame-category-arrow" id="cat-arrow-' + cat.id + '">▶</span>';
            html += '</div>';
            html += '<div class="frame-category-body" id="cat-body-' + cat.id + '" style="display:none;">';
            html += '<div class="frame-grid">';

            cat.frames.forEach(function(frameId) {
                var frame = self.frames.find(function(f) { return f.id === frameId; });
                if (!frame) return;
                var isUnlocked = self.isFrameUnlocked(frame.id);
                var isActive = frame.id === activeFrame;
                var progress = self.getFrameProgress(frame.id);

                html += '<div class="frame-card' + (isActive ? ' active' : '') + (isUnlocked ? ' unlocked' : ' locked') + '" ';
                html += 'data-frame-id="' + frame.id + '" ';
                html += 'onclick="AvatarFrameSystem.onFrameCardClick(\'' + frame.id + '\')">';

                html += '<div class="frame-preview">';
                if (isUnlocked) {
                    html += '<div class="frame-preview-avatar ' + (frame.css ? frame.css : '') + '">';
                    html += '<span>' + frame.icon + '</span>';
                    html += '</div>';
                } else {
                    html += '<div class="frame-preview-avatar locked-preview">';
                    html += '<span>🔒</span>';
                    html += '</div>';
                }
                html += '</div>';

                html += '<div class="frame-info">';
                html += '<div class="frame-name">' + frame.icon + ' ' + frame.name;
                if (isActive) html += ' <span class="frame-active-tag">使用中</span>';
                html += '</div>';

                if (!isUnlocked) {
                    html += '<div class="frame-progress">';
                    html += '<div class="frame-progress-bar"><div class="frame-progress-fill" style="width:' + progress.percentage + '%;"></div></div>';
                    html += '<div class="frame-progress-text">' + progress.current + '/' + progress.target + '</div>';
                    html += '</div>';
                }
                html += '</div>';
                html += '</div>';
            });

            html += '</div></div></div>';
        });

        container.innerHTML = html;
    },

    toggleCategory: function(catId) {
        var body = document.getElementById('cat-body-' + catId);
        var arrow = document.getElementById('cat-arrow-' + catId);
        var catEl = document.querySelector('.frame-category[data-cat="' + catId + '"]');
        if (!body || !arrow) return;
        if (body.style.display === 'none') {
            body.style.display = 'block';
            arrow.textContent = '▼';
            if (catEl) catEl.setAttribute('data-expanded', 'true');
        } else {
            body.style.display = 'none';
            arrow.textContent = '▶';
            if (catEl) catEl.setAttribute('data-expanded', 'false');
        }
    },

    // Handle frame card click
    onFrameCardClick(frameId) {
        if (this.isFrameUnlocked(frameId)) {
            var currentActive = this.getActiveFrame();
            if (currentActive === frameId) {
                // Toggle off - switch to none
                this.setFrame('none');
            } else {
                this.setFrame(frameId);
            }
            this.renderFrameSelector();
        } else {
            var progress = this.getFrameProgress(frameId);
            var frame = this.frames.find(function(f) { return f.id === frameId; });
            showToast('info', '「' + frame.name + '」尚未解锁 (' + progress.current + '/' + progress.target + ')');
        }
    }
};
