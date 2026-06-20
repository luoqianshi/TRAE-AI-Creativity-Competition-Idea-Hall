// ========== StorageManager ==========
const StorageManager = {
    getCurrentUserId() { return state.currentUser?.id || 'guest'; },

    saveSubjectData(subjectId, data) {
        const key = `user_${this.getCurrentUserId()}_subject_${subjectId}`;
        localStorage.setItem(key, JSON.stringify(data));
    },

    loadSubjectData(subjectId) {
        const key = `user_${this.getCurrentUserId()}_subject_${subjectId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    saveErrors(subjectId, errors) {
        const key = `user_${this.getCurrentUserId()}_errors_${subjectId}`;
        localStorage.setItem(key, JSON.stringify(errors));
    },

    loadErrors(subjectId) {
        const key = `user_${this.getCurrentUserId()}_errors_${subjectId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    saveChatHistory(subjectId, chats) {
        const key = `user_${this.getCurrentUserId()}_chats_${subjectId}`;
        localStorage.setItem(key, JSON.stringify(chats));
    },

    loadChatHistory(subjectId) {
        const key = `user_${this.getCurrentUserId()}_chats_${subjectId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    saveNotes(notes) {
        const key = `user_${this.getCurrentUserId()}_notes`;
        localStorage.setItem(key, JSON.stringify(notes));
    },

    loadNotes() {
        const key = `user_${this.getCurrentUserId()}_notes`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    saveSettings(settings) {
        const key = `user_${this.getCurrentUserId()}_settings`;
        localStorage.setItem(key, JSON.stringify(settings));
    },

    loadSettings() {
        const key = `user_${this.getCurrentUserId()}_settings`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    savePreferences(prefs) {
        const key = `user_${this.getCurrentUserId()}_preferences`;
        localStorage.setItem(key, JSON.stringify(prefs));
    },

    loadPreferences() {
        const key = `user_${this.getCurrentUserId()}_preferences`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    saveAllUserData() {
        // Save all subjects data
        state.subjects.forEach(s => {
            this.saveErrors(s.id, s.errors || []);
            this.saveChatHistory(s.id, state.chatHistories[s.id] || []);
        });
        // Save notes
        this.saveNotes(state.notes);
        // Save settings
        this.saveSettings(state.settings);
        // Save learning stats
        this.saveAllStats();
        // Save user preferences
        this.savePreferences(state.userPreferences);
        // Save custom subjects/projects
        const customSubjects = state.subjects.filter(s => s.id.startsWith('custom_'));
        if (customSubjects.length > 0) {
            localStorage.setItem(`user_${this.getCurrentUserId()}_custom_subjects`, JSON.stringify(customSubjects));
        }
    },

    loadAllUserData() {
        // Load errors and chats for each subject
        state.subjects.forEach(s => {
            const errors = this.loadErrors(s.id);
            if (errors) s.errors = errors;
            const chats = this.loadChatHistory(s.id);
            if (chats) state.chatHistories[s.id] = chats;
        });
        // Load custom subjects
        const customSubjects = localStorage.getItem(`user_${this.getCurrentUserId()}_custom_subjects`);
        if (customSubjects) {
            const customs = JSON.parse(customSubjects);
            customs.forEach(cs => {
                if (!state.subjects.find(s => s.id === cs.id)) {
                    const errors = this.loadErrors(cs.id);
                    if (errors) cs.errors = errors;
                    const chats = this.loadChatHistory(cs.id);
                    if (chats) state.chatHistories[cs.id] = chats;
                    state.subjects.push(cs);
                }
            });
        }
        // Load notes
        const notes = this.loadNotes();
        if (notes) state.notes = notes;
        // Load settings
        const settings = this.loadSettings();
        if (settings) {
            Object.assign(state.settings, settings);
        }
        // Load learning stats
        this.loadAllStats();
        // Load user preferences
        const preferences = this.loadPreferences();
        if (preferences) {
            state.userPreferences = preferences;
        }
    },

    saveStats(subjectId, stats) {
        const key = `user_${this.getCurrentUserId()}_stats_${subjectId}`;
        localStorage.setItem(key, JSON.stringify(stats));
    },

    loadStats(subjectId) {
        const key = `user_${this.getCurrentUserId()}_stats_${subjectId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    saveAllStats() {
        for (const [subjectId, stats] of Object.entries(state.learningStats)) {
            this.saveStats(subjectId, stats);
        }
    },

    loadAllStats() {
        const items = state.role === 'student' ? state.subjects : state.projects;
        items.forEach(item => {
            const stats = this.loadStats(item.id);
            if (stats) state.learningStats[item.id] = stats;
        });
        // Also load custom subjects stats
        const customSubjects = localStorage.getItem(`user_${this.getCurrentUserId()}_custom_subjects`);
        if (customSubjects) {
            const customs = JSON.parse(customSubjects);
            customs.forEach(cs => {
                const stats = this.loadStats(cs.id);
                if (stats) state.learningStats[cs.id] = stats;
            });
        }
    },

    clearUserData() {
        const userId = this.getCurrentUserId();
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`user_${userId}_`)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
    },

    exportData() {
        const data = {};
        const userId = this.getCurrentUserId();
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`user_${userId}_`)) {
                data[key] = JSON.parse(localStorage.getItem(key));
            }
        }
        data._exportInfo = { userId, exportDate: new Date().toISOString(), version: '1.0' };
        return JSON.stringify(data, null, 2);
    },

    importData(jsonStr) {
        try {
            const data = JSON.parse(jsonStr);
            if (!data._exportInfo) {
                showToast('error', '无效的数据文件');
                return false;
            }
            const userId = this.getCurrentUserId();
            Object.keys(data).forEach(key => {
                if (key === '_exportInfo') return;
                // Remap to current user
                const newKey = key.replace(/user_[^_]+_/, `user_${userId}_`);
                localStorage.setItem(newKey, JSON.stringify(data[key]));
            });
            return true;
        } catch (e) {
            showToast('error', '数据文件解析失败');
            return false;
        }
    }
};

// ========== VerifyCodeManager ==========
const VerifyCodeManager = {
    codes: {},

    sendCode(account) {
        const code = String(Math.floor(1000 + Math.random() * 9000));
        const expireAt = Date.now() + 5 * 60 * 1000; // 5 minutes
        this.codes[account] = { code, expireAt };
        return code;
    },

    verify(account, code) {
        const record = this.codes[account];
        if (!record) return { valid: false, message: '请先获取验证码' };
        if (Date.now() > record.expireAt) {
            delete this.codes[account];
            return { valid: false, message: '验证码已过期，请重新获取' };
        }
        if (record.code !== code) return { valid: false, message: '验证码错误' };
        delete this.codes[account];
        return { valid: true };
    }
};
