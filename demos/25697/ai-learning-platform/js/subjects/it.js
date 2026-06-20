// ========== 信息技术科目模块 ==========
// 智学空间 - 信息技术知识库与智能应答

window.SubjectModules.it = {
    id: 'it',
    name: '信息技术',
    icon: '📡',

    levels: {
        primary: {
            name: '小学',
            topics: [
                {
                    id: 'ip-basics',
                    name: '计算机基础',
                    keywords: ['计算机', '键盘', '鼠标', '文件', '文件夹'],
                    knowledge: '计算机基本操作：\n\n硬件组成：\n• 显示器：显示图像\n• 主机：计算机的核心\n• 键盘：输入文字和数字\n• 鼠标：点击、拖动、选择\n\n基本操作：\n• 开机：先开显示器，再开主机\n• 关机：开始菜单 → 关机\n• 文件管理：创建文件夹，保存文件\n• 输入法：切换中英文（Ctrl+Shift）\n\n网络安全：\n• 不随意点击陌生链接\n• 不泄露个人信息\n• 安装杀毒软件',
                    example: '如何在电脑上新建文件夹？\n1. 在桌面空白处右键\n2. 选择"新建" → "文件夹"\n3. 输入文件夹名称',
                    analysis: '文件夹用于分类管理文件，养成整理的好习惯。',
                    mistakes: '常见错误：文件保存位置混乱，找不到文件。',
                    tips: '定期整理文件，按科目或日期分类。'
                }
            ]
        },
        junior: {
            name: '初中',
            topics: [
                {
                    id: 'ij-office',
                    name: '办公软件',
                    keywords: ['word', 'excel', 'ppt', 'office', '文档'],
                    knowledge: '常用办公软件：\n\nWord（文字处理）：\n• 排版：字体、字号、段落、页边距\n• 样式：标题、正文、引用\n• 插入：图片、表格、页码\n• 快捷键：Ctrl+C复制，Ctrl+V粘贴，Ctrl+S保存\n\nExcel（电子表格）：\n• 单元格：行号+列标（如A1）\n• 公式：=A1+B1（求和）\n• 函数：SUM（求和）、AVERAGE（平均）、MAX（最大）\n• 图表：柱状图、折线图、饼图\n\nPowerPoint（演示文稿）：\n• 幻灯片：新建、删除、复制\n• 动画：进入、强调、退出\n• 切换：幻灯片之间的过渡效果',
                    example: 'Excel求平均分：\n=AVERAGE(A1:A10)\n计算A1到A10单元格的平均值。',
                    analysis: 'AVERAGE函数自动计算平均值，比手动计算更准确。',
                    mistakes: '常见错误：公式前忘记加=号，单元格引用错误。',
                    tips: '善用快捷键提高效率，Ctrl+Z撤销操作。'
                },
                {
                    id: 'ij-network',
                    name: '网络基础',
                    keywords: ['网络', '互联网', 'ip', '浏览器', '网页'],
                    knowledge: '计算机网络基础：\n\n网络类型：\n• 局域网（LAN）：覆盖范围小，如教室、家庭\n• 广域网（WAN）：覆盖范围大，如互联网\n\n网络协议：\n• TCP/IP：互联网的基础协议\n• HTTP：网页传输协议\n• DNS：域名解析（如www.baidu.com → IP地址）\n\nIP地址：\n• 格式：四组数字，如192.168.1.1\n• IPv4：32位地址，约43亿个\n• IPv6：128位地址，数量极大\n\n网络设备：\n• 路由器：连接不同网络\n• 交换机：连接同一网络内的设备\n• 调制解调器：数字信号和模拟信号转换',
                    example: '为什么输入网址就能打开网页？\n答：DNS将网址（域名）转换为IP地址，浏览器通过IP地址找到服务器，下载网页内容显示出来。',
                    analysis: 'DNS是互联网的"电话簿"，负责域名和IP的映射。',
                    mistakes: '常见错误：把IP地址和网址搞混。',
                    tips: '理解网络分层模型（OSI七层模型）有助于理解网络通信。'
                }
            ]
        }
    },

    levelKeywords: {
        primary: ['小学', '计算机', '键盘'],
        junior: ['初中', 'office', '网络']
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
                {q: 'Excel中求平均值的函数是？\nA. SUM  B. AVERAGE  C. MAX  D. MIN', a: 'B', h: 'AVERAGE是求平均值'},
                {q: 'IP地址由几组数字组成？\nA. 2  B. 3  C. 4  D. 5', a: 'C', h: 'IPv4由4组数字组成'}
            ];
            var idx = rand(0, problems.length - 1);
            return {question: problems[idx].q, answer: problems[idx].a, type: '选择题', hint: problems[idx].h, level: 'junior'};
        }
        return {question: '简述复制和粘贴的快捷键及操作步骤。', answer: '1. 选中要复制的内容\n2. 按Ctrl+C复制\n3. 移动到目标位置\n4. 按Ctrl+V粘贴', type: '解答题', hint: '记住Ctrl+C和Ctrl+V', level: 'junior'};
    }
};
