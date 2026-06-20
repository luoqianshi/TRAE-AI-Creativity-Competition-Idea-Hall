// ========== 音乐科目模块 ==========
// 智学空间 - 音乐知识库与智能应答

window.SubjectModules.music = {
    id: 'music',
    name: '音乐',
    icon: '🎵',

    levels: {
        primary: {
            name: '小学',
            topics: [
                {
                    id: 'mp-basics',
                    name: '音乐基础',
                    keywords: ['音符', '节拍', '节奏', '五线谱', '音阶'],
                    knowledge: '音乐的基本元素：\n\n音符：表示音的高低和长短\n• 全音符：4拍（○）\n• 二分音符：2拍（◐）\n• 四分音符：1拍（♩）\n• 八分音符：1/2拍（♪）\n\n节拍：音乐的基本脉动\n• 2/4拍：每小节2拍，四分音符为一拍\n• 3/4拍：每小节3拍（圆舞曲）\n• 4/4拍：每小节4拍（最常见）\n\n音阶：do re mi fa sol la si do',
                    example: '《小星星》是2/4拍：\n一闪一闪亮晶晶（每小节2拍）',
                    analysis: '2/4拍强弱规律：强 弱',
                    mistakes: '常见错误：把节拍和节奏混淆。',
                    tips: '边拍手边唱，感受节拍规律。'
                }
            ]
        },
        junior: {
            name: '初中',
            topics: [
                {
                    id: 'mj-theory',
                    name: '乐理知识',
                    keywords: ['乐理', '和弦', '调式', '音程', '旋律'],
                    knowledge: '乐理基础知识：\n\n音程：两个音之间的距离\n• 纯一度：相同音\n• 大二度：全音（如do-re）\n• 纯四度：5个半音\n• 纯五度：7个半音\n• 纯八度：12个半音\n\n和弦：三个或以上音的组合\n• 大三和弦：1 3 5（如C和弦：do mi sol）\n• 小三和弦：1 b3 5（如Am和弦：la do mi）\n• 属七和弦：1 3 5 b7\n\n调式：\n• 大调：明亮、欢快（如C大调）\n• 小调：暗淡、忧伤（如a小调）',
                    example: 'C大调和弦进行：C - G - Am - F\n这是流行音乐中最常用的和弦进行之一。',
                    analysis: 'C大调中，I级=C，V级=G，vi级=Am，IV级=F。',
                    mistakes: '常见错误：把大三和弦和小三和弦搞混。',
                    tips: '多听多弹，培养音感。'
                }
            ]
        }
    },

    levelKeywords: {
        primary: ['小学', '音符', '儿歌'],
        junior: ['初中', '乐理', '和弦']
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
                {q: '以下哪个是3/4拍？\nA. 进行曲  B. 圆舞曲  C. 摇滚乐  D. 说唱', a: 'B', h: '圆舞曲是3/4拍'},
                {q: 'C大调的属和弦是？\nA. C  B. Dm  C. G  D. F', a: 'C', h: '属和弦是V级，C大调V级=G'}
            ];
            var idx = rand(0, problems.length - 1);
            return {question: problems[idx].q, answer: problems[idx].a, type: '选择题', hint: problems[idx].h, level: 'junior'};
        }
        return {question: '写出C大调的音阶。', answer: 'C D E F G A B C（do re mi fa sol la si do）', type: '解答题', hint: '从C开始的全音半音关系', level: 'junior'};
    }
};
