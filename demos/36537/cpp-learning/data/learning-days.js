(function(window) {
    'use strict';

    const LEARNING_DAYS_KEY = 'cpp_learning_days';
    const DAILY_SESSION_KEY = 'cpp_daily_session';
    const REQUIRED_MINUTES = 15;
    const MILLISECONDS_PER_MINUTE = 60 * 1000;

    const LearningDays = {
        days: [],
        todayMinutes: 0,
        lastDate: null,
        isDayCompleted: false,

        init: async function() {
            await this.loadData();
            this.checkNewDay();
        },

        loadData: async function() {
            try {
                const stored = localStorage.getItem(LEARNING_DAYS_KEY);
                if (stored) {
                    this.days = JSON.parse(stored);
                } else {
                    this.days = [];
                }
                
                const session = localStorage.getItem(DAILY_SESSION_KEY);
                if (session) {
                    const data = JSON.parse(session);
                    this.todayMinutes = data.minutes || 0;
                    this.lastDate = data.date;
                    this.isDayCompleted = data.completed || false;
                }
            } catch (error) {
                console.error('加载学习天数数据失败:', error);
                this.days = [];
                this.todayMinutes = 0;
            }
        },

        checkNewDay: function() {
            const today = this.formatDate(new Date());
            
            if (this.lastDate !== today) {
                this.todayMinutes = 0;
                this.lastDate = today;
                this.isDayCompleted = false;
                this.saveSession();
            }
        },

        formatDate: function(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },

        addMinutes: function(minutes) {
            if (this.isDayCompleted) return false;

            this.todayMinutes += minutes;
            this.saveSession();

            if (this.todayMinutes >= REQUIRED_MINUTES && !this.isDayCompleted) {
                this.completeDay();
                return true;
            }
            return false;
        },

        completeDay: function() {
            const today = this.formatDate(new Date());
            
            if (!this.isDayCompleted) {
                this.isDayCompleted = true;
                
                if (!this.days.includes(today)) {
                    this.days.push(today);
                    this.days.sort();
                    this.saveDays();
                }
                
                this.saveSession();
            }
        },

        saveDays: function() {
            localStorage.setItem(LEARNING_DAYS_KEY, JSON.stringify(this.days));
        },

        saveSession: function() {
            const session = {
                minutes: this.todayMinutes,
                date: this.lastDate,
                completed: this.isDayCompleted
            };
            localStorage.setItem(DAILY_SESSION_KEY, JSON.stringify(session));
        },

        getTotalDays: function() {
            return this.days.length;
        },

        getTodayMinutes: function() {
            return this.todayMinutes;
        },

        getRequiredMinutes: function() {
            return REQUIRED_MINUTES;
        },

        getProgressPercent: function() {
            return Math.min(100, Math.round((this.todayMinutes / REQUIRED_MINUTES) * 100));
        },

        isTodayCompleted: function() {
            return this.isDayCompleted;
        },

        getStreak: function() {
            if (this.days.length === 0) return 0;

            let streak = 0;
            const today = new Date();
            
            for (let i = 0; i < 365; i++) {
                const checkDate = new Date(today);
                checkDate.setDate(checkDate.getDate() - i);
                const formatted = this.formatDate(checkDate);
                
                if (this.days.includes(formatted)) {
                    streak++;
                } else if (i > 0) {
                    break;
                }
            }
            
            return streak;
        },

        resetAll: function() {
            this.days = [];
            this.todayMinutes = 0;
            this.lastDate = null;
            this.isDayCompleted = false;
            localStorage.removeItem(LEARNING_DAYS_KEY);
            localStorage.removeItem(DAILY_SESSION_KEY);
        },

        getDaysArray: function() {
            return [...this.days];
        }
    };

    window.LearningDays = LearningDays;
})(window);