// ========== 美术科目模块 ==========
// 智学空间 - 美术知识库与智能应答

window.SubjectModules.art = {
    id: 'art',
    name: '美术',
    icon: '🎨',

    levels: {
        primary: {
            name: '小学',
            topics: [
                {
                    id: 'ap-basics',
                    name: '美术基础',
                    keywords: ['色彩', '线条', '形状', '构图', '三原色'],
                    knowledge: '美术的基本元素：\n\n三原色：红、黄、蓝\n• 原色不能由其他颜色混合得到\n• 三间色：橙（红+黄）、绿（黄+蓝）、紫（红+蓝）\n\n色彩三要素：\n• 色相：颜色的名称（红、黄、蓝等）\n• 明度：颜色的明暗程度\n• 纯度：颜色的鲜艳程度\n\n线条：\n• 直线：稳定、坚强\n• 曲线：柔美、流动\n• 折线：紧张、激烈',
                    example: '用三原色画彩虹：红→橙→黄→绿→蓝→紫',
                    analysis: '彩虹是光的色散现象，颜色按波长排列。',
                    mistakes: '常见错误：把三间色和三原色搞混。',
                    tips: '多观察自然界的颜色变化。'
                }
            ]
        },
        junior: {
            name: '初中',
            topics: [
                {
                    id: 'aj-history',
                    name: '中外美术史',
                    keywords: ['美术史', '画家', '名画', '油画', '国画', '素描'],
                    knowledge: '中外美术流派：\n\n中国美术：\n• 山水画：以自然山水为题材\n• 花鸟画：以花卉、鸟兽为题材\n• 人物画：以人物为题材\n• 工笔画：精细写实\n• 写意画：简练概括\n\n西方美术流派：\n• 文艺复兴：达芬奇、米开朗基罗、拉斐尔\n• 印象派：莫奈、梵高、雷诺阿\n• 立体派：毕加索\n• 抽象派：康定斯基',
                    example: '《蒙娜丽莎》是达芬奇的代表作，体现了文艺复兴时期的人文主义精神。',
                    analysis: '达芬奇运用"渐隐法"使画面柔和，蒙娜丽莎的微笑神秘莫测。',
                    mistakes: '常见错误：把不同流派和画家搞混。',
                    tips: '参观美术馆，多看原作。'
                }
            ]
        }
    },

    levelKeywords: {
        primary: ['小学', '色彩', '画画'],
        junior: ['初中', '美术史', '画家']
    },

    detectLevel: function(question, context) {
        var q = (question || '').toLowerCase();
        var ctx = (typeof context === 'string' ? context : '').toLowerCase();
        for (var level in this.levelKeywords) {
            var keywords = this.levelKeywords[level];
            for (var i = 0; i < keywords.length; i++) { if (ctx.includes(keywords[i])) return level; }
        }
        for (var level in this.levelKeywords) {
            var keywords = this.levelKeywords[level];
            for (var i = 0; i < keywords.length; i++) { if (q.includes(keywords[i])) return level; }
        }
        return 'junior';
    },

    findKnowledge: function(question, level) {
        var q = (question || '').toLowerCase();
        var levelData = this.levels[level];
        if (!levelData) return null;
        var bestMatch = null, bestScore = 0;
        for (var i = 0; i < levelData.topics.length; i++) {
            var topic = levelData.topics[i];
            var score = 0;
            if (topic.keywords) {
                for (var j = 0; j < topic.keywords.length; j++) {
                    if (q.includes(topic.keywords[j].toLowerCase())) score += topic.keywords[j].length >= 4 ? 3 : 2;
                }
            }
            if (q.includes(topic.name.toLowerCase())) score += 5;
            if (score > bestScore) { bestScore = score; bestMatch = topic; }
        }
        return bestScore >= 2 ? bestMatch : null;
    },

    handle: function(question, cleanQ, context) {
        if (!question) return null;
        var level = this.detectLevel(question, context);
        var knowledge = this.findKnowledge(question, level);
        if (knowledge) { return teach(knowledge.name, knowledge.knowledge, knowledge.example, knowledge.analysis, knowledge.mistakes, knowledge.tips); }
        var allLevels = ['primary', 'junior'];
        for (var i = 0; i < allLevels.length; i++) {
            if (allLevels[i] === level) continue;
            knowledge = this.findKnowledge(question, allLevels[i]);
            if (knowledge) { return teach(knowledge.name + '（' + this.levels[allLevels[i]].name + '）', knowledge.knowledge, knowledge.example, knowledge.analysis, knowledge.mistakes, knowledge.tips); }
        }
        return null;
    },

    generateProblem: function(difficulty, type) {
        var rand = function(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };
        if (type === '选择题') {
            var problems = [
                {q: '三原色是指？\nA. 红黄绿  B. 红黄蓝  C. 红绿蓝  D. 黄绿蓝', a: 'B', h: '美术三原色是红黄蓝'},
                {q: '《蒙娜丽莎》的作者是？\nA. 梵高  B. 毕加索  C. 达芬奇  D. 莫奈', a: 'C', h: '达芬奇是文艺复兴三杰之一'}
            ];
            var idx = rand(0, problems.length - 1);
            return {question: problems[idx].q, answer: problems[idx].a, type: '选择题', hint: problems[idx].h, level: 'junior'};
        }
        return {question: '画出三原色和它们混合得到的三间色。', answer: '三原色：红、黄、蓝\n三间色：橙（红+黄）、绿（黄+蓝）、紫（红+蓝）', type: '解答题', hint: '记住三原色不能由其他颜色混合得到', level: 'junior'};
    }
};
