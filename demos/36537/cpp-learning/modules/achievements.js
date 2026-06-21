/**
 * 成就系统模块
 * 包含所有成就定义和检查逻辑
 */
const Achievements = (function() {
    'use strict';

    // ==================== 成就定义 ====================
    
    const ACHIEVEMENTS = {
        // 基础成就
        first_compile: {
            id: 'first_compile',
            title: '第一次编译',
            description: '完成第一次代码编译和运行',
            icon: 'terminal',
            xp: 50,
            condition: (stats) => stats.totalAttempts >= 1
        },
        
        first_lesson: {
            id: 'first_lesson',
            title: '入门第一步',
            description: '完成第一节课程',
            icon: 'book-open',
            xp: 50,
            condition: (stats) => stats.completedLessons >= 1
        },
        
        first_hands_on: {
            id: 'first_hands_on',
            title: '动手达人',
            description: '首次通过动手实践任务',
            icon: 'code',
            xp: 100,
            condition: (stats) => stats.totalHandsOnCompleted >= 1
        },
        
        // 连续学习成就
        streak_3: {
            id: 'streak_3',
            title: '三天打鱼',
            description: '连续学习3天',
            icon: 'flame',
            xp: 100,
            condition: (stats) => stats.streak >= 3
        },
        
        streak_7: {
            id: 'streak_7',
            title: '一周坚持',
            description: '连续学习7天',
            icon: 'calendar',
            xp: 200,
            condition: (stats) => stats.streak >= 7
        },
        
        streak_30: {
            id: 'streak_30',
            title: '月度学习者',
            description: '连续学习30天',
            icon: 'trophy',
            xp: 500,
            condition: (stats) => stats.streak >= 30
        },
        
        // 课程完成成就
        unit1_complete: {
            id: 'unit1_complete',
            title: '起步完成',
            description: '完成第一单元：起步——你的第一行C++代码',
            icon: 'check-circle',
            xp: 200,
            condition: (stats) => stats.unitsCompleted >= 1
        },
        
        unit2_complete: {
            id: 'unit2_complete',
            title: '类型探索者',
            description: '完成第二单元：复合类型与初步抽象',
            icon: 'layers',
            xp: 250,
            condition: (stats) => stats.unitsCompleted >= 2
        },
        
        unit3_complete: {
            id: 'unit3_complete',
            title: '指针勇者',
            description: '完成第三单元：指针、引用与内存初探',
            icon: 'zap',
            xp: 300,
            condition: (stats) => stats.unitsCompleted >= 3
        },
        
        all_units_complete: {
            id: 'all_units_complete',
            title: 'C++大师',
            description: '完成所有10个单元的学习',
            icon: 'award',
            xp: 1000,
            condition: (stats) => stats.unitsCompleted >= 10
        },
        
        // XP成就
        xp_1000: {
            id: 'xp_1000',
            title: '初露锋芒',
            description: '累计获得1000点经验值',
            icon: 'star',
            xp: 100,
            condition: (stats) => stats.totalXP >= 1000
        },
        
        xp_5000: {
            id: 'xp_5000',
            title: '代码新星',
            description: '累计获得5000点经验值',
            icon: 'sparkles',
            xp: 200,
            condition: (stats) => stats.totalXP >= 5000
        },
        
        xp_10000: {
            id: 'xp_10000',
            title: '资深程序员',
            description: '累计获得10000点经验值',
            icon: 'crown',
            xp: 500,
            condition: (stats) => stats.totalXP >= 10000
        },
        
        // 动手实践成就
        hands_on_10: {
            id: 'hands_on_10',
            title: '实践者',
            description: '完成10个动手实践任务',
            icon: 'edit',
            xp: 150,
            condition: (stats) => stats.totalHandsOnCompleted >= 10
        },
        
        hands_on_50: {
            id: 'hands_on_50',
            title: '实践大师',
            description: '完成50个动手实践任务',
            icon: 'award',
            xp: 300,
            condition: (stats) => stats.totalHandsOnCompleted >= 50
        },
        
        hands_on_100: {
            id: 'hands_on_100',
            title: '编码狂人',
            description: '完成100个动手实践任务',
            icon: 'fire',
            xp: 500,
            condition: (stats) => stats.totalHandsOnCompleted >= 100
        },
        
        // 特定主题成就
        pointer_master: {
            id: 'pointer_master',
            title: '指针猎人',
            description: '完成指针相关单元的全部任务',
            icon: 'crosshair',
            xp: 300,
            condition: (stats) => stats.themeProgress?.pointers === 100
        },
        
        stl_collector: {
            id: 'stl_collector',
            title: 'STL收藏家',
            description: '使用过STL的所有主要容器',
            icon: 'box',
            xp: 250,
            condition: (stats) => stats.containersUsed?.length >= 6
        },
        
        // 速度成就
        speed_demon: {
            id: 'speed_demon',
            title: '速战速决',
            description: '10分钟内完成一节课',
            icon: 'zap',
            xp: 100,
            condition: (stats) => stats.fastLessons >= 1
        },
        
        perfect_score: {
            id: 'perfect_score',
            title: '满分答卷',
            description: '章节小测获得满分',
            icon: 'check-square',
            xp: 150,
            condition: (stats) => stats.perfectQuizzes >= 1
        },
        
        // 项目成就
        project_v5: {
            id: 'project_v5',
            title: '版本控制者',
            description: 'MyCLI Tool项目版本达到5',
            icon: 'git-branch',
            xp: 200,
            condition: (stats) => stats.projectVersions >= 5
        }
    };

    // ==================== 等级系统 ====================
    
    const LEVELS = [
        { level: 1, title: '代码学徒', minXP: 0 },
        { level: 2, title: '编程新手', minXP: 100 },
        { level: 3, title: '代码学徒', minXP: 250 },
        { level: 4, title: '变量探索者', minXP: 500 },
        { level: 5, title: '循环行者', minXP: 800 },
        { level: 6, title: '函数猎人', minXP: 1200 },
        { level: 7, title: '数组守卫者', minXP: 1700 },
        { level: 8, title: '指针猎人', minXP: 2300 },
        { level: 9, title: '引用骑士', minXP: 3000 },
        { level: 10, title: '内存法师', minXP: 3800 },
        { level: 11, title: '类建筑者', minXP: 4700 },
        { level: 12, title: '继承探索者', minXP: 5700 },
        { level: 13, title: '多态大师', minXP: 6800 },
        { level: 14, title: '模板工匠', minXP: 8000 },
        { level: 15, title: 'STL贤者', minXP: 9500 },
        { level: 16, title: '异常战士', minXP: 11000 },
        { level: 17, title: '并发魔法师', minXP: 13000 },
        { level: 18, title: '现代C++学徒', minXP: 15500 },
        { level: 19, title: '现代C++大师', minXP: 18500 },
        { level: 20, title: 'C++宗师', minXP: 22000 },
        { level: 21, title: 'C++传奇', minXP: 26000 },
        { level: 22, title: '代码艺术家', minXP: 30500 },
        { level: 23, title: '系统架构师', minXP: 35500 },
        { level: 24, title: '性能调优师', minXP: 41000 },
        { level: 25, title: '内存管理大师', minXP: 47000 },
        { level: 26, title: '设计模式专家', minXP: 54000 },
        { level: 27, title: 'STL全图鉴', minXP: 62000 },
        { level: 28, title: '模板元编程师', minXP: 71000 },
        { level: 29, title: '并发安全师', minXP: 81000 },
        { level: 30, title: '现代C++领主', minXP: 92000 },
        { level: 31, title: '底层高手', minXP: 104000 },
        { level: 32, title: '跨平台开发者', minXP: 117000 },
        { level: 33, title: '性能极客', minXP: 131000 },
        { level: 34, title: '代码诗人', minXP: 146000 },
        { level: 35, title: '软件架构大师', minXP: 162000 },
        { level: 36, title: '算法骑士', minXP: 179000 },
        { level: 37, title: '数据结构大师', minXP: 197000 },
        { level: 38, title: '编译原理学者', minXP: 216000 },
        { level: 39, title: '系统程序员', minXP: 236000 },
        { level: 40, title: 'C++半神', minXP: 257000 },
        { level: 41, title: '技术先驱', minXP: 279000 },
        { level: 42, title: '行业专家', minXP: 302000 },
        { level: 43, title: '布道师', minXP: 326000 },
        { level: 44, title: '技术领袖', minXP: 351000 },
        { level: 45, title: 'C++之神', minXP: 377000 },
        { level: 46, title: '代码先知', minXP: 404000 },
        { level: 47, title: '技术大师', minXP: 432000 },
        { level: 48, title: '传奇程序员', minXP: 461000 },
        { level: 49, title: '计算机智者', minXP: 491000 },
        { level: 50, title: '永恒的C++大师', minXP: 522000 }
    ];

    // ==================== 成就管理器 ====================
    
    let unlockedAchievements = new Set();
    let achievementListeners = [];

    /**
     * 初始化成就系统
     */
    async function init() {
        const saved = await DataStore.getUnlockedAchievements();
        unlockedAchievements = new Set(saved.map(a => a.id));
    }

    /**
     * 检查成就条件
     */
    async function checkAchievements(stats) {
        const newUnlocks = [];

        for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
            if (!unlockedAchievements.has(id) && achievement.condition(stats)) {
                await unlockAchievement(id);
                newUnlocks.push(achievement);
            }
        }

        return newUnlocks;
    }

    /**
     * 解锁成就
     */
    async function unlockAchievement(id) {
        const achievement = ACHIEVEMENTS[id];
        if (!achievement || unlockedAchievements.has(id)) return false;

        unlockedAchievements.add(id);
        
        // 保存到数据库
        await DataStore.unlockAchievement(id, {
            title: achievement.title,
            description: achievement.description,
            xp: achievement.xp
        });

        // 触发监听器
        achievementListeners.forEach(listener => listener(achievement));

        return true;
    }

    /**
     * 添加成就解锁监听器
     */
    function addListener(listener) {
        achievementListeners.push(listener);
    }

    /**
     * 移除监听器
     */
    function removeListener(listener) {
        achievementListeners = achievementListeners.filter(l => l !== listener);
    }

    /**
     * 获取等级信息
     */
    function getLevelInfo(totalXP) {
        let currentLevel = LEVELS[0];
        let nextLevel = LEVELS[1];

        for (let i = LEVELS.length - 1; i >= 0; i--) {
            if (totalXP >= LEVELS[i].minXP) {
                currentLevel = LEVELS[i];
                nextLevel = LEVELS[i + 1] || LEVELS[i];
                break;
            }
        }

        const currentXP = totalXP - currentLevel.minXP;
        const requiredXP = nextLevel.minXP - currentLevel.minXP;
        const progress = requiredXP > 0 ? (currentXP / requiredXP) * 100 : 100;

        return {
            level: currentLevel.level,
            title: currentLevel.title,
            progress: Math.min(progress, 100),
            currentXP,
            requiredXP,
            nextLevelTitle: nextLevel.title,
            totalXP
        };
    }

    /**
     * 计算下次升级需要的XP
     */
    function getXPToNextLevel(totalXP) {
        const info = getLevelInfo(totalXP);
        return info.requiredXP - info.currentXP;
    }

    /**
     * 获取所有已解锁成就
     */
    function getUnlockedAchievements() {
        return Array.from(unlockedAchievements).map(id => ACHIEVEMENTS[id]).filter(Boolean);
    }

    /**
     * 获取成就图标SVG
     */
    function getAchievementIcon(iconName) {
        const icons = {
            'terminal': '<path d="M4 17l6-6-6-6M12 19h8"/>',
            'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
            'code': '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
            'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
            'calendar': '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
            'trophy': '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
            'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
            'layers': '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
            'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
            'award': '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
            'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
            'sparkles': '<path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/>',
            'crown': '<path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>',
            'edit': '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
            'fire': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
            'crosshair': '<circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/>',
            'box': '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
            'git-branch': '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
            'check-square': '<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'
        };

        return icons[iconName] || icons['star'];
    }

    // ==================== 导出 ====================
    return {
        ACHIEVEMENTS,
        LEVELS,
        init,
        checkAchievements,
        unlockAchievement,
        addListener,
        removeListener,
        getLevelInfo,
        getXPToNextLevel,
        getUnlockedAchievements,
        getAchievementIcon
    };
})();

// 导出到全局
window.Achievements = Achievements;
