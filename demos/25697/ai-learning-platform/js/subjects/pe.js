// ========== 体育科目模块 ==========
// 智学空间 - 体育知识库与智能应答

window.SubjectModules.pe = {
    id: 'pe',
    name: '体育',
    icon: '⚽',

    levels: {
        primary: {
            name: '小学',
            topics: [
                {
                    id: 'pp-basics',
                    name: '体育基础',
                    keywords: ['跑步', '跳绳', '球类', '体操', '游戏'],
                    knowledge: '体育基本技能：\n\n跑步：\n• 起跑：蹲踞式起跑，听到口令后快速蹬地\n• 途中跑：身体稍前倾，摆臂自然\n• 冲刺：接近终点时加速冲过\n\n跳绳：\n• 握绳：双手握绳柄，手臂自然弯曲\n• 摇绳：手腕发力，绳子从后向前摇\n• 起跳：前脚掌着地，轻轻跳起\n\n球类：\n• 足球：用脚内侧传球，脚背射门\n• 篮球：双手胸前传球，单手肩上投篮\n• 乒乓球：正手攻球，反手推挡',
                    example: '50米跑技巧：起跑反应快，途中跑放松，冲刺尽全力。',
                    analysis: '50米跑主要考验爆发力和加速能力。',
                    mistakes: '常见错误：起跑时抬头过早，影响加速。',
                    tips: '每天坚持锻炼，循序渐进。'
                }
            ]
        },
        junior: {
            name: '初中',
            topics: [
                {
                    id: 'pj-theory',
                    name: '体育理论',
                    keywords: ['体育理论', '运动生理', '健康', '训练', '营养', '热身', '拉伸', '肌肉', '骨骼', '关节', '心率', '呼吸', '耐力', '速度', '力量', '柔韧', '协调', '体能'],
                    knowledge: '运动与健康知识：\n\n运动系统：\n• 骨骼：人体的支架，206块骨头\n• 关节：骨与骨连接的地方，如膝关节、肩关节\n• 肌肉：提供运动动力，600多块肌肉\n\n运动生理：\n• 心率：正常人60-100次/分钟，运动时可达160次以上\n• 呼吸：运动时呼吸加深加快，摄取更多氧气\n• 能量：ATP是肌肉收缩的直接能源\n\n健康常识：\n• 运动前热身：预防运动损伤\n• 运动后放松：促进恢复\n• 合理营养：碳水化合物、蛋白质、脂肪均衡摄入',
                    example: '为什么运动前要热身？\n答：热身可以提高体温，增加肌肉弹性，激活神经系统，预防运动损伤。',
                    analysis: '热身是运动安全的重要保障，不能省略。',
                    mistakes: '常见错误：不做热身直接运动，容易拉伤。',
                    tips: '养成运动前后热身放松的好习惯。'
                }
            ]
        }
    },

    levelKeywords: {
        primary: ['小学', '跑步', '跳绳'],
        junior: ['初中', '体育理论', '健康']
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
                {q: '人体有多少块骨头？\nA. 106  B. 206  C. 306  D. 406', a: 'B', h: '成年人有206块骨头'},
                {q: '运动前应该做什么？\nA. 直接运动  B. 热身  C. 吃饭  D. 喝水', a: 'B', h: '热身可以预防运动损伤'}
            ];
            var idx = rand(0, problems.length - 1);
            return {question: problems[idx].q, answer: problems[idx].a, type: '选择题', hint: problems[idx].h, level: 'junior'};
        }
        return {question: '简述运动前热身的重要性。', answer: '1. 提高体温，增加肌肉弹性\n2. 激活神经系统\n3. 提高关节灵活性\n4. 预防运动损伤', type: '解答题', hint: '从生理角度分析', level: 'junior'};
    }
};
