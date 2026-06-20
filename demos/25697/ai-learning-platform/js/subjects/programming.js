// ========== 编程科目模块 ==========
// 智学空间 - 编程知识库与智能应答

window.SubjectModules.programming = {
    id: 'programming',
    name: '编程',
    icon: '💻',

    levels: {
        primary: {
            name: '小学',
            topics: [
                {
                    id: 'pp-scratch',
                    name: 'Scratch编程入门',
                    keywords: ['scratch', '积木', '图形化', '角色', '舞台'],
                    knowledge: 'Scratch是MIT开发的图形化编程工具，适合初学者。\n\n基本概念：\n• 舞台：程序运行的地方\n• 角色：舞台上的对象（如小猫）\n• 积木：不同颜色的积木代表不同功能\n  - 运动积木（蓝色）：移动、旋转\n  - 外观积木（紫色）：说话、换造型\n  - 事件积木（黄色）：点击绿旗、按键\n  - 控制积木（橙色）：循环、条件\n\n程序结构：\n事件 → 执行动作 → 循环/条件',
                    example: '让小猫走正方形：\n重复4次：\n  移动100步\n  右转90度',
                    analysis: '正方形有4条边，4个直角，所以重复4次，每次转90度。',
                    mistakes: '常见错误：忘记重复4次，转角不是90度。',
                    tips: '从简单的动画开始，逐步增加交互功能。'
                }
            ]
        },
        junior: {
            name: '初中',
            topics: [
                {
                    id: 'pj-python',
                    name: 'Python基础',
                    keywords: ['python', '变量', '循环', '条件', '函数', '列表'],
                    knowledge: 'Python是一种简洁易学的编程语言。\n\n基础语法：\n• 变量：name = "张三"\n• 输出：print("Hello")\n• 输入：name = input("请输入名字")\n• 条件：if age >= 18: ... else: ...\n• 循环：for i in range(5): ...\n• 列表：nums = [1, 2, 3, 4, 5]\n• 函数：def hello(): ...\n\n数据类型：\n• int（整数）：10, -5\n• float（浮点数）：3.14, -0.5\n• str（字符串）："Hello"\n• bool（布尔）：True, False\n• list（列表）：[1, 2, 3]',
                    example: '计算1到100的和：\nsum = 0\nfor i in range(1, 101):\n    sum += i\nprint(sum)  # 输出5050',
                    analysis: 'range(1, 101)生成1到100的数，累加到sum中。',
                    mistakes: '常见错误：range(101)是从0到100，不是1到100。',
                    tips: '多写代码，多调试，善用print查看变量值。'
                }
            ]
        },
        senior: {
            name: '高中',
            topics: [
                {
                    id: 'ps-algorithm',
                    name: '算法与数据结构',
                    keywords: ['算法', '数据结构', '排序', '查找', '递归', '栈', '队列'],
                    knowledge: '算法是解决问题的步骤，数据结构是存储数据的方式。\n\n常见算法：\n• 排序：冒泡排序、选择排序、快速排序\n• 查找：顺序查找、二分查找\n• 递归：函数调用自身\n\n数据结构：\n• 数组：连续存储，随机访问快\n• 链表：非连续存储，插入删除快\n• 栈：后进先出（LIFO）\n• 队列：先进先出（FIFO）\n• 树：层次结构，如二叉树',
                    example: '二分查找（在有序数组中查找目标）：\nleft, right = 0, len(arr)-1\nwhile left <= right:\n    mid = (left + right) // 2\n    if arr[mid] == target: return mid\n    elif arr[mid] < target: left = mid + 1\n    else: right = mid - 1',
                    analysis: '二分查找每次将范围缩小一半，时间复杂度O(log n)。',
                    mistakes: '常见错误：循环条件写错，mid计算溢出。',
                    tips: '理解算法思想比背代码更重要，多画图辅助理解。'
                }
            ]
        }
    },

    levelKeywords: {
        primary: ['小学', 'scratch', '图形化'],
        junior: ['初中', 'python', '入门'],
        senior: ['高中', '算法', '数据结构']
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
        var allLevels = ['primary', 'junior', 'senior'];
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
                {q: 'Python中，以下哪个是合法的变量名？\nA. 2name  B. _name  C. name-2  D. class', a: 'B', h: '变量名不能以数字开头，不能含-，不能用关键字'},
                {q: '以下哪个不是Python的数据类型？\nA. int  B. str  C. array  D. list', a: 'C', h: 'Python中没有array类型（有list）'}
            ];
            var idx = rand(0, problems.length - 1);
            return {question: problems[idx].q, answer: problems[idx].a, type: '选择题', hint: problems[idx].h, level: 'junior'};
        }
        var topics = [
            {q: '编写程序，计算1到n的和。', a: 'n = int(input("请输入n:"))\nsum = n * (n + 1) // 2\nprint(sum)', h: '等差数列求和公式'},
            {q: '编写程序，判断一个数是否为素数。', a: 'def is_prime(n):\n    if n < 2: return False\n    for i in range(2, int(n**0.5)+1):\n        if n % i == 0: return False\n    return True', h: '只需检查到√n'}
        ];
        var idx2 = rand(0, topics.length - 1);
        return {question: topics[idx2].q, answer: topics[idx2].a, type: '解答题', hint: topics[idx2].h, level: 'junior'};
    }
};
