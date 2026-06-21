/**
 * 数据存储模块 - IndexedDB 封装
 * 提供跨浏览器的本地数据持久化
 */
const DataStore = (function() {
    'use strict';

    // 数据库配置
    const DB_NAME = 'CppMasteryDB';
    const DB_VERSION = 1;
    let db = null;

    // 对象仓库定义
    const STORES = {
        progress: 'progress',     // 学习进度
        notes: 'notes',           // 笔记
        projectFiles: 'projectFiles', // 项目文件
        achievements: 'achievements', // 成就
        settings: 'settings',     // 设置
        experimentLogs: 'experimentLogs' // 实验日志
    };

    /**
     * 初始化数据库
     */
    async function init() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                console.warn('IndexedDB 不可用，将使用 localStorage 作为降级方案');
                resolve(false);
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('数据库打开失败:', request.error);
                resolve(false);
            };

            request.onsuccess = () => {
                db = request.result;
                console.log('IndexedDB 初始化成功');
                resolve(true);
            };

            request.onupgradeneeded = (event) => {
                const database = event.target.result;

                // 创建对象仓库
                if (!database.objectStoreNames.contains(STORES.progress)) {
                    const progressStore = database.createObjectStore(STORES.progress, { keyPath: 'id' });
                    progressStore.createIndex('unitId', 'unitId', { unique: false });
                    progressStore.createIndex('lessonId', 'lessonId', { unique: false });
                }

                if (!database.objectStoreNames.contains(STORES.notes)) {
                    const notesStore = database.createObjectStore(STORES.notes, { keyPath: 'lessonId' });
                    notesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                }

                if (!database.objectStoreNames.contains(STORES.projectFiles)) {
                    const projectStore = database.createObjectStore(STORES.projectFiles, { keyPath: 'id' });
                    projectStore.createIndex('projectName', 'projectName', { unique: false });
                    projectStore.createIndex('version', 'version', { unique: false });
                }

                if (!database.objectStoreNames.contains(STORES.achievements)) {
                    database.createObjectStore(STORES.achievements, { keyPath: 'id' });
                }

                if (!database.objectStoreNames.contains(STORES.settings)) {
                    database.createObjectStore(STORES.settings, { keyPath: 'key' });
                }

                if (!database.objectStoreNames.contains(STORES.experimentLogs)) {
                    const logStore = database.createObjectStore(STORES.experimentLogs, { keyPath: 'id', autoIncrement: true });
                    logStore.createIndex('timestamp', 'timestamp', { unique: false });
                    logStore.createIndex('lessonId', 'lessonId', { unique: false });
                }
            };
        });
    }

    // ==================== 通用方法 ====================

    /**
     * 获取数据
     */
    async function get(storeName, key) {
        if (db) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(key);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }
        // 降级到 localStorage
        return getFromLocalStorage(storeName, key);
    }

    /**
     * 获取所有数据
     */
    async function getAll(storeName) {
        if (db) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }
        return getAllFromLocalStorage(storeName);
    }

    /**
     * 保存数据
     */
    async function set(storeName, data) {
        if (db) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.put(data);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }
        // 降级到 localStorage
        return setToLocalStorage(storeName, data.key || data.id, data);
    }

    /**
     * 删除数据
     */
    async function remove(storeName, key) {
        if (db) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.delete(key);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
        return removeFromLocalStorage(storeName, key);
    }

    /**
     * 清除所有数据
     */
    async function clear(storeName) {
        if (db) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
    }

    // ==================== LocalStorage 降级方案 ====================

    function getLocalStorageKey(storeName, key) {
        return `cpp_${storeName}_${key}`;
    }

    function getFromLocalStorage(storeName, key) {
        try {
            const data = localStorage.getItem(getLocalStorageKey(storeName, key));
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('localStorage 读取失败:', e);
            return null;
        }
    }

    function getAllFromLocalStorage(storeName) {
        try {
            const results = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(`cpp_${storeName}_`)) {
                    const data = localStorage.getItem(key);
                    if (data) results.push(JSON.parse(data));
                }
            }
            return results;
        } catch (e) {
            console.error('localStorage 读取全部失败:', e);
            return [];
        }
    }

    function setToLocalStorage(storeName, key, data) {
        try {
            localStorage.setItem(getLocalStorageKey(storeName, key), JSON.stringify(data));
            return key;
        } catch (e) {
            console.error('localStorage 保存失败:', e);
            return null;
        }
    }

    function removeFromLocalStorage(storeName, key) {
        try {
            localStorage.removeItem(getLocalStorageKey(storeName, key));
        } catch (e) {
            console.error('localStorage 删除失败:', e);
        }
    }

    // ==================== 进度管理 ====================

    /**
     * 获取学习进度
     */
    async function getProgress(unitId, lessonId) {
        const progress = await get(STORES.progress, `${unitId}_${lessonId}`);
        return progress || {
            id: `${unitId}_${lessonId}`,
            unitId,
            lessonId,
            completed: false,
            masteryLevel: 0,
            handsOnCompleted: false,
            attemptCount: 0,
            timeSpent: 0,
            lastAccessed: Date.now()
        };
    }

    /**
     * 保存学习进度
     */
    async function saveProgress(progressData) {
        progressData.lastAccessed = Date.now();
        return set(STORES.progress, progressData);
    }

    /**
     * 获取单元进度
     */
    async function getUnitProgress(unitId) {
        const allProgress = await getAll(STORES.progress);
        return allProgress.filter(p => p.unitId === unitId);
    }

    /**
     * 获取全局进度
     */
    async function getGlobalProgress() {
        return getAll(STORES.progress);
    }

    // ==================== 笔记管理 ====================

    /**
     * 获取笔记
     */
    async function getNote(lessonId) {
        return get(STORES.notes, lessonId);
    }

    /**
     * 保存笔记
     */
    async function saveNote(lessonId, content) {
        const note = {
            lessonId,
            content,
            updatedAt: Date.now()
        };
        return set(STORES.notes, note);
    }

    /**
     * 获取所有笔记
     */
    async function getAllNotes() {
        return getAll(STORES.notes);
    }

    // ==================== 项目文件管理 ====================

    /**
     * 获取项目版本
     */
    async function getProjectVersion(projectName, version) {
        return get(STORES.projectFiles, `${projectName}_v${version}`);
    }

    /**
     * 保存项目版本
     */
    async function saveProjectVersion(projectName, version, files) {
        const project = {
            id: `${projectName}_v${version}`,
            projectName,
            version,
            files,
            createdAt: Date.now()
        };
        return set(STORES.projectFiles, project);
    }

    /**
     * 获取项目所有版本
     */
    async function getProjectVersions(projectName) {
        const allProjects = await getAll(STORES.projectFiles);
        return allProjects
            .filter(p => p.projectName === projectName)
            .sort((a, b) => a.version - b.version);
    }

    // ==================== 成就管理 ====================

    /**
     * 获取所有已解锁成就
     */
    async function getUnlockedAchievements() {
        return getAll(STORES.achievements);
    }

    /**
     * 解锁成就
     */
    async function unlockAchievement(achievementId, achievementData) {
        const existing = await get(STORES.achievements, achievementId);
        if (!existing) {
            return set(STORES.achievements, {
                id: achievementId,
                ...achievementData,
                unlockedAt: Date.now()
            });
        }
        return existing;
    }

    /**
     * 检查成就是否已解锁
     */
    async function isAchievementUnlocked(achievementId) {
        const achievement = await get(STORES.achievements, achievementId);
        return !!achievement;
    }

    // ==================== 设置管理 ====================

    /**
     * 获取设置
     */
    async function getSetting(key, defaultValue = null) {
        const setting = await get(STORES.settings, key);
        return setting ? setting.value : defaultValue;
    }

    /**
     * 保存设置
     */
    async function saveSetting(key, value) {
        return set(STORES.settings, { key, value });
    }

    /**
     * 获取所有设置
     */
    async function getAllSettings() {
        const settings = await getAll(STORES.settings);
        const result = {};
        settings.forEach(s => result[s.key] = s.value);
        return result;
    }

    // ==================== 实验日志 ====================

    /**
     * 添加实验日志
     */
    async function addExperimentLog(lessonId, code, output, result) {
        const log = {
            lessonId,
            code,
            output,
            result,
            timestamp: Date.now()
        };
        return set(STORES.experimentLogs, log);
    }

    /**
     * 获取实验日志
     */
    async function getExperimentLogs(lessonId = null, limit = 50) {
        const logs = await getAll(STORES.experimentLogs);
        let filtered = lessonId ? logs.filter(l => l.lessonId === lessonId) : logs;
        return filtered
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    // ==================== 用户数据统计 ====================

    /**
     * 获取用户统计数据
     */
    async function getUserStats() {
        const progress = await getGlobalProgress();
        const achievements = await getUnlockedAchievements();
        const settings = await getAllSettings();

        const completedLessons = progress.filter(p => p.completed).length;
        const totalHandsOnCompleted = progress.filter(p => p.handsOnCompleted).length;
        const totalTimeSpent = progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
        const totalAttempts = progress.reduce((sum, p) => sum + (p.attemptCount || 0), 0);

        // 计算连续学习天数
        const streak = calculateStreak(progress);

        return {
            completedLessons,
            totalHandsOnCompleted,
            totalTimeSpent,
            totalAttempts,
            unlockedAchievements: achievements.length,
            streak,
            lastActive: settings.lastActive || Date.now()
        };
    }

    /**
     * 计算连续学习天数
     */
    function calculateStreak(progress) {
        if (!progress.length) return 0;

        const dates = progress
            .map(p => new Date(p.lastAccessed).toDateString())
            .filter((date, i, arr) => arr.indexOf(date) === i)
            .map(d => new Date(d).getTime())
            .sort((a, b) => b - a);

        if (!dates.length) return 0;

        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (dates[0] !== new Date(today).getTime() && 
            dates[0] !== new Date(yesterday).getTime()) {
            return 0;
        }

        let streak = 1;
        for (let i = 1; i < dates.length; i++) {
            const diff = dates[i - 1] - dates[i];
            if (diff === 86400000) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * 更新最后活跃时间
     */
    async function updateLastActive() {
        return saveSetting('lastActive', Date.now());
    }

    // ==================== Firebase 同步（预留） ====================
    // 未来可以集成 Firebase Firestore 进行云同步
    // 只需取消下面代码的注释并配置 Firebase

    /**
     * Firebase Firestore 同步代码（注释形式）
     * 启用方法：
     * 1. 在 index.html 中添加 Firebase SDK
     * 2. 取消注释以下代码
     * 3. 配置 Firebase 项目
     */

    /*
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.x/firebase-app.js';
    import { getFirestore, enableIndexedDbPersistence } from 'https://www.gstatic.com/firebasejs/9.x/firebase-firestore.js';

    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // 启用离线持久化
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('多个标签页同时打开，持久化不可用');
        } else if (err.code === 'unimplemented') {
            console.warn('浏览器不支持持久化');
        }
    });

    // 同步到 Firestore
    async function syncToCloud(storeName, data) {
        try {
            await setDoc(doc(db, storeName, data.id || data.key), data);
            return true;
        } catch (e) {
            console.error('云同步失败:', e);
            return false;
        }
    }
    */

    // ==================== 导出公开接口 ====================
    return {
        init,
        STORES,
        
        // 通用方法
        get,
        getAll,
        set,
        remove,
        clear,

        // 进度管理
        getProgress,
        saveProgress,
        getUnitProgress,
        getGlobalProgress,

        // 笔记管理
        getNote,
        saveNote,
        getAllNotes,

        // 项目管理
        getProjectVersion,
        saveProjectVersion,
        getProjectVersions,

        // 成就管理
        getUnlockedAchievements,
        unlockAchievement,
        isAchievementUnlocked,

        // 设置管理
        getSetting,
        saveSetting,
        getAllSettings,

        // 实验日志
        addExperimentLog,
        getExperimentLogs,

        // 用户统计
        getUserStats,
        updateLastActive
    };
})();

// 导出到全局
window.DataStore = DataStore;
