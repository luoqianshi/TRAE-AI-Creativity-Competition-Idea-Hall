/**
 * 学习打卡系统 - Study Check-in System
 * 智学空间 v3.1.0
 */

class StudyCheckIn {
    constructor() {
        this.storageKey = 'study_checkin_data';
        this.today = this.getTodayStr();
        this.data = this.loadData();
        this.monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        this.weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        this.rewards = {
            3: { xp: 30, title: '三日坚持', desc: '连续打卡3天' },
            7: { xp: 80, title: '周冠军', desc: '连续打卡7天' },
            14: { xp: 200, title: '双周达人', desc: '连续打卡14天' },
            30: { xp: 500, title: '月度学霸', desc: '连续打卡30天' },
            60: { xp: 1200, title: '学期之星', desc: '连续打卡60天' },
            100: { xp: 3000, title: '百日筑基', desc: '连续打卡100天' }
        };
    }

    getTodayStr() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    loadData() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) {
            console.warn('加载打卡数据失败', e);
        }
        return {
            checkins: {},
            streak: 0,
            longestStreak: 0,
            totalDays: 0,
            lastCheckIn: null,
            rewardsClaimed: []
        };
    }

    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.warn('保存打卡数据失败', e);
        }
    }

    isCheckedIn(dateStr) {
        return !!this.data.checkins[dateStr];
    }

    canCheckIn() {
        return !this.isCheckedIn(this.today);
    }

    checkIn() {
        if (!this.canCheckIn()) {
            return { success: false, message: '今日已打卡' };
        }

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        this.data.checkins[this.today] = {
            time: timeStr,
            timestamp: Date.now()
        };

        // 计算连续打卡
        this.calculateStreak();
        this.data.totalDays++;
        this.data.lastCheckIn = this.today;

        // 检查奖励
        const newRewards = this.checkRewards();

        this.saveData();

        // 奖励XP
        let xpGained = 10;
        if (window.LevelSystem) {
            window.LevelSystem.addXP(xpGained, '每日打卡');
        }

        return {
            success: true,
            message: '打卡成功！',
            streak: this.data.streak,
            xpGained: xpGained,
            newRewards: newRewards,
            time: timeStr
        };
    }

    calculateStreak() {
        let streak = 0;
        const today = new Date();

        for (let i = 0; i < 365; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = this.dateToStr(d);

            if (this.data.checkins[dateStr]) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        this.data.streak = streak;
        if (streak > this.data.longestStreak) {
            this.data.longestStreak = streak;
        }
    }

    dateToStr(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    checkRewards() {
        const newRewards = [];
        for (const [days, reward] of Object.entries(this.rewards)) {
            const d = parseInt(days);
            if (this.data.streak >= d && !this.data.rewardsClaimed.includes(d)) {
                this.data.rewardsClaimed.push(d);
                newRewards.push({ ...reward, days: d });

                if (window.LevelSystem) {
                    window.LevelSystem.addXP(reward.xp, reward.title);
                }
            }
        }
        return newRewards;
    }

    getMonthData(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startWeekDay = firstDay.getDay();

        const days = [];
        for (let i = 0; i < startWeekDay; i++) {
            days.push(null);
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({
                day: d,
                dateStr: dateStr,
                checked: !!this.data.checkins[dateStr],
                isToday: dateStr === this.today
            });
        }
        return days;
    }

    renderCalendar(containerId, year, month) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const days = this.getMonthData(year, month);
        const monthTitle = `${year}年 ${this.monthNames[month]}`;

        let html = `
            <div class="checkin-calendar">
                <div class="calendar-header">
                    <button class="calendar-nav" data-action="prev">&lt;</button>
                    <span class="calendar-title">${monthTitle}</span>
                    <button class="calendar-nav" data-action="next">&gt;</button>
                </div>
                <div class="calendar-weekdays">
                    ${this.weekDays.map(d => `<span>${d}</span>`).join('')}
                </div>
                <div class="calendar-days">
        `;

        for (const day of days) {
            if (day === null) {
                html += `<div class="calendar-day empty"></div>`;
            } else {
                const classes = ['calendar-day'];
                if (day.checked) classes.push('checked');
                if (day.isToday) classes.push('today');
                html += `<div class="${classes.join(' ')}" data-date="${day.dateStr}">
                    <span class="day-num">${day.day}</span>
                    ${day.checked ? '<span class="check-mark">✓</span>' : ''}
                </div>`;
            }
        }

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;

        // 绑定导航事件
        container.querySelectorAll('.calendar-nav').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (action === 'prev') {
                    month--;
                    if (month < 0) { month = 11; year--; }
                } else {
                    month++;
                    if (month > 11) { month = 0; year++; }
                }
                this.renderCalendar(containerId, year, month);
            });
        });
    }

    renderStats(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        this.calculateStreak();

        const currentStreak = this.data.streak;
        const longestStreak = this.data.longestStreak;
        const totalDays = this.data.totalDays;

        // 计算本月打卡天数
        const now = new Date();
        const monthDays = this.getMonthData(now.getFullYear(), now.getMonth());
        const monthChecked = monthDays.filter(d => d && d.checked).length;

        // 计算本周打卡天数
        let weekChecked = 0;
        for (let i = 0; i < 7; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            if (this.data.checkins[this.dateToStr(d)]) weekChecked++;
        }

        container.innerHTML = `
            <div class="checkin-stats">
                <div class="stat-card streak">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-value">${currentStreak}</div>
                    <div class="stat-label">当前连续</div>
                </div>
                <div class="stat-card longest">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-value">${longestStreak}</div>
                    <div class="stat-label">最长连续</div>
                </div>
                <div class="stat-card total">
                    <div class="stat-icon">📅</div>
                    <div class="stat-value">${totalDays}</div>
                    <div class="stat-label">累计打卡</div>
                </div>
                <div class="stat-card week">
                    <div class="stat-icon">📊</div>
                    <div class="stat-value">${weekChecked}/7</div>
                    <div class="stat-label">本周打卡</div>
                </div>
            </div>
        `;
    }

    renderRewards(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '<div class="checkin-rewards">';
        for (const [days, reward] of Object.entries(this.rewards)) {
            const d = parseInt(days);
            const claimed = this.data.rewardsClaimed.includes(d);
            const canClaim = this.data.streak >= d;
            const statusClass = claimed ? 'claimed' : (canClaim ? 'available' : 'locked');

            html += `
                <div class="reward-item ${statusClass}">
                    <div class="reward-icon">${claimed ? '🎁' : (canClaim ? '🎉' : '🔒')}</div>
                    <div class="reward-info">
                        <div class="reward-title">${reward.title}</div>
                        <div class="reward-desc">${reward.desc}</div>
                        <div class="reward-xp">+${reward.xp} XP</div>
                    </div>
                    <div class="reward-status">${claimed ? '已领取' : (canClaim ? '可领取' : `${d}天`)}</div>
                </div>
            `;
        }
        html += '</div>';
        container.innerHTML = html;
    }

    render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const now = new Date();
        const canCheckIn = this.canCheckIn();

        container.innerHTML = `
            <div class="checkin-container">
                <div class="checkin-header">
                    <h2>📚 学习打卡</h2>
                    <p>坚持每日学习，养成好习惯</p>
                </div>
                <div class="checkin-main">
                    <div class="checkin-action">
                        <button id="checkinBtn" class="checkin-btn ${canCheckIn ? '' : 'checked'}">
                            ${canCheckIn ? '立即打卡' : '今日已打卡'}
                        </button>
                        <div class="checkin-today-info">
                            ${this.isCheckedIn(this.today) ? `<span>今日打卡时间：${this.data.checkins[this.today].time}</span>` : ''}
                        </div>
                    </div>
                    <div id="checkinStats"></div>
                    <div id="checkinCalendar"></div>
                    <div id="checkinRewards"></div>
                </div>
            </div>
        `;

        // 绑定打卡按钮
        const btn = document.getElementById('checkinBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                const result = this.checkIn();
                if (result.success) {
                    this.render(containerId);
                    if (window.showToast) {
                        window.showToast(`打卡成功！连续${result.streak}天 🔥`, 'success');
                    }
                    if (result.newRewards.length > 0) {
                        result.newRewards.forEach(r => {
                            setTimeout(() => {
                                if (window.showToast) {
                                    window.showToast(`🎉 达成成就：${r.title}！+${r.xp} XP`, 'success');
                                }
                            }, 500);
                        });
                    }
                } else {
                    if (window.showToast) {
                        window.showToast(result.message, 'warning');
                    }
                }
            });
        }

        this.renderStats('checkinStats');
        this.renderCalendar('checkinCalendar', now.getFullYear(), now.getMonth());
        this.renderRewards('checkinRewards');
    }
}

// 全局实例
window.StudyCheckIn = StudyCheckIn;
