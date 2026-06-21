/**
 * 经验值对照表
 * 定义完成不同内容可获得的XP经验值
 */
const XPTable = {
    lesson: {
        complete_lesson: 100,
        complete_hands_on: 150,
        complete_quiz_correct: 20,
        complete_quiz_all: 50,
    },
    achievements: {
        first_lesson: 50,
        first_hands_on: 100,
        first_quiz: 50,
        streak_7_days: 300,
        streak_30_days: 1000,
        complete_unit: 500,
        complete_course: 5000,
        perfect_quiz: 100,
        code_master: 200,
    },
    special: {
        daily_login: 10,
        weekend_bonus: 50,
        referral: 200,
    }
};

const LevelTitles = [
    { level: 1, title: '代码学徒', description: '刚刚踏入编程世界的初学者' },
    { level: 2, title: '编程新手', description: '了解基本概念，开始编写简单代码' },
    { level: 3, title: '初级程序员', description: '掌握基础语法，能够独立完成简单任务' },
    { level: 4, title: '中级程序员', description: '熟练使用各种数据类型和控制结构' },
    { level: 5, title: '高级程序员', description: '精通面向对象编程，能够设计复杂系统' },
    { level: 6, title: '代码工匠', description: '注重代码质量，追求优雅的解决方案' },
    { level: 7, title: '架构师', description: '能够设计大型系统架构' },
    { level: 8, title: '技术专家', description: '在特定领域有深入研究' },
    { level: 9, title: '资深工程师', description: '具备丰富的项目经验和技术视野' },
    { level: 10, title: 'C++大师', description: '精通C++的方方面面，能够解决各种复杂问题' },
    { level: 11, title: '编程导师', description: '能够指导他人学习编程' },
    { level: 12, title: '技术领袖', description: '引领技术方向，推动团队进步' },
    { level: 13, title: '开源贡献者', description: '积极参与开源项目' },
    { level: 14, title: '技术作家', description: '分享技术知识，著书立说' },
    { level: 15, title: '传奇程序员', description: '在编程领域留下深远影响' },
];

function calculateLevel(xp) {
    const level = Math.floor(xp / 100) + 1;
    return Math.min(level, LevelTitles.length);
}

function getLevelInfo(level) {
    const index = Math.min(level - 1, LevelTitles.length - 1);
    return LevelTitles[index];
}

window.XPTable = XPTable;
window.LevelTitles = LevelTitles;
window.calculateLevel = calculateLevel;
window.getLevelInfo = getLevelInfo;