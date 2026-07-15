const STORAGE_KEYS = {
    USER_STATS: 'hanzi_user_stats',
    LEARNING_PROGRESS: 'hanzi_learning_progress',
    MISTAKE_RECORDS: 'hanzi_mistake_records',
    GAME_RECORDS: 'hanzi_game_records',
    LAST_LOGIN: 'hanzi_last_login',
    CONTINUOUS_DAYS: 'hanzi_continuous_days'
};

const defaultUserStats = {
    points: 0,
    level: 1,
    totalLearned: 0,
    daysStreak: 0,
    lastLogin: null
};

const defaultLearningProgress = {};

const saveToStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Failed to save to storage:', e);
        return false;
    }
};

const loadFromStorage = (key, defaultValue = null) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Failed to load from storage:', e);
        return defaultValue;
    }
};

const getUserStats = () => {
    return loadFromStorage(STORAGE_KEYS.USER_STATS, defaultUserStats);
};

const saveUserStats = (stats) => {
    return saveToStorage(STORAGE_KEYS.USER_STATS, stats);
};

const addPoints = (points) => {
    const stats = getUserStats();
    stats.points += points;
    stats.level = calculateLevel(stats.points);
    saveUserStats(stats);
    return stats;
};

const calculateLevel = (points) => {
    if (points >= 3000) return 3;
    if (points >= 1000) return 2;
    return 1;
};

const getLevelName = (level) => {
    const names = ['初级', '中级', '高级'];
    return names[level - 1] || '初级';
};

const getLearningProgress = () => {
    return loadFromStorage(STORAGE_KEYS.LEARNING_PROGRESS, defaultLearningProgress);
};

const saveLearningProgress = (progress) => {
    return saveToStorage(STORAGE_KEYS.LEARNING_PROGRESS, progress);
};

const updateLearningProgress = (charId, correct) => {
    const progress = getLearningProgress();
    if (!progress[charId]) {
        progress[charId] = {
            learned: 0,
            correct: 0,
            wrong: 0,
            lastLearned: new Date().toISOString(),
            mastery: 0
        };
    }
    
    progress[charId].learned++;
    if (correct) {
        progress[charId].correct++;
    } else {
        progress[charId].wrong++;
    }
    
    progress[charId].lastLearned = new Date().toISOString();
    const total = progress[charId].correct + progress[charId].wrong;
    progress[charId].mastery = total > 0 ? Math.round((progress[charId].correct / total) * 100) : 0;
    
    saveLearningProgress(progress);
    return progress[charId];
};

const getMistakeRecords = () => {
    return loadFromStorage(STORAGE_KEYS.MISTAKE_RECORDS, []);
};

const saveMistakeRecords = (records) => {
    return saveToStorage(STORAGE_KEYS.MISTAKE_RECORDS, records);
};

const addMistakeRecord = (charId, wrongType = 'writing') => {
    const records = getMistakeRecords();
    const existing = records.find(r => r.charId === charId);
    
    if (existing) {
        existing.wrongCount++;
        existing.lastWrong = new Date().toISOString();
    } else {
        records.push({
            id: Date.now().toString(),
            charId,
            wrongCount: 1,
            lastWrong: new Date().toISOString(),
            wrongType
        });
    }
    
    saveMistakeRecords(records);
    return records;
};

const removeMistakeRecord = (charId) => {
    const records = getMistakeRecords();
    const filtered = records.filter(r => r.charId !== charId);
    saveMistakeRecords(filtered);
    return filtered;
};

const getGameRecords = () => {
    return loadFromStorage(STORAGE_KEYS.GAME_RECORDS, []);
};

const saveGameRecord = (record) => {
    const records = getGameRecords();
    records.push({
        id: Date.now().toString(),
        ...record,
        playTime: new Date().toISOString()
    });
    saveToStorage(STORAGE_KEYS.GAME_RECORDS, records);
    return records;
};

const checkContinuousDays = () => {
    const today = new Date().toDateString();
    const lastLogin = loadFromStorage(STORAGE_KEYS.LAST_LOGIN);
    const continuousDays = loadFromStorage(STORAGE_KEYS.CONTINUOUS_DAYS, 0);
    
    if (!lastLogin) {
        saveToStorage(STORAGE_KEYS.LAST_LOGIN, today);
        saveToStorage(STORAGE_KEYS.CONTINUOUS_DAYS, 1);
        return 1;
    }
    
    const lastDate = new Date(lastLogin);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
    
    let newDays = continuousDays;
    if (diffDays === 1) {
        newDays++;
    } else if (diffDays > 1) {
        newDays = 1;
    }
    
    saveToStorage(STORAGE_KEYS.LAST_LOGIN, today);
    saveToStorage(STORAGE_KEYS.CONTINUOUS_DAYS, newDays);
    return newDays;
};

const calculateTotalMastery = () => {
    const progress = getLearningProgress();
    const chars = Object.values(progress);
    
    if (chars.length === 0) return 0;
    
    const totalMastery = chars.reduce((sum, p) => sum + p.mastery, 0);
    return Math.round(totalMastery / chars.length);
};

const getProgressByGrade = () => {
    const progress = getLearningProgress();
    const result = {
        '1-1': { learned: 0, total: 0 },
        '1-2': { learned: 0, total: 0 },
        '2-1': { learned: 0, total: 0 },
        '2-2': { learned: 0, total: 0 }
    };
    
    charactersData.forEach(char => {
        const key = `${char.grade}-${char.semester}`;
        result[key].total++;
        
        if (progress[char.id] && progress[char.id].learned > 0) {
            result[key].learned++;
        }
    });
    
    return result;
};

const getWeakAreas = () => {
    const progress = getLearningProgress();
    const mistakes = getMistakeRecords();
    
    const weakChars = mistakes
        .filter(m => m.wrongCount >= 2)
        .map(m => {
            const char = getCharacterById(m.charId);
            return char ? char.char : '';
        })
        .filter(Boolean);
    
    return weakChars.slice(0, 10);
};

const getCorrectRate = () => {
    const progress = getLearningProgress();
    const chars = Object.values(progress);
    
    if (chars.length === 0) return 0;
    
    const total = chars.reduce((sum, p) => sum + p.correct + p.wrong, 0);
    const correct = chars.reduce((sum, p) => sum + p.correct, 0);
    
    return total > 0 ? Math.round((correct / total) * 100) : 0;
};

const getTotalLearned = () => {
    const progress = getLearningProgress();
    return Object.keys(progress).filter(id => progress[id].learned > 0).length;
};
