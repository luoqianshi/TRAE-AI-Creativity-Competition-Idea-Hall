// ========== 政治科目模块 - 按学龄分类 ==========
// 智学空间 - 政治知识库与智能应答

window.SubjectModules.politics = {
    id: 'politics',
    name: '政治',
    icon: '\uD83C\uDFDB\uFE0F',

    levels: {
        kindergarten: {
            name: '幼儿园',
            topics: [
                {
                    id: 'pk-rules',
                    name: '生活中的规则',
                    keywords: ['规则', '纪律', '排队', '礼貌', '分享'],
                    knowledge: '生活中的基本规则：\n\n1. 排队：买东西、上车要排队，不插队\n2. 礼貌：说"请""谢谢""对不起""你好"\n3. 分享：和小朋友分享玩具和食物\n4. 诚实：不说谎，做错事要承认\n5. 守时：按时上学，不迟到\n6. 爱护公物：不破坏公共设施\n7. 尊重他人：不打人，不骂人',
                    example: '在超市买东西时应该怎么做？\n答：排队等候，不插队，不大声喧哗，付钱时说谢谢。',
                    analysis: '遵守规则是文明行为的基础，从小养成好习惯。',
                    mistakes: '常见错误：认为规则只是约束，不理解规则保护每个人。',
                    tips: '在生活中时刻注意遵守规则，做一个有礼貌的好孩子。'
                }
            ]
        },
        primary: {
            name: '小学',
            topics: [
                {
                    id: 'pp-citizen-rights',
                    name: '公民基本常识',
                    keywords: ['公民', '权利', '义务', '法律', '国旗', '国歌'],
                    knowledge: '公民基本常识：\n\n中华人民共和国公民的基本权利：\n平等权、选举权、言论自由、人身自由\n受教育权、劳动权、休息权\n\n公民的基本义务：\n遵守宪法和法律\n维护国家统一和民族团结\n依法服兵役\n依法纳税\n\n国家象征：\n国旗：五星红旗\n国歌：《义勇军进行曲》\n国徽：中间是五星照耀下的天安门\n首都：北京\n\n宪法：\n国家的根本大法，一切法律以宪法为依据',
                    example: '为什么上学既是权利也是义务？\n权利：每个孩子都有接受教育的权利\n义务：受教育是公民的法定义务，必须完成九年义务教育',
                    analysis: '权利和义务是统一的，享受权利的同时也要履行义务。',
                    mistakes: '常见错误：只知道自己有权利，不知道自己有义务。',
                    tips: '了解自己的权利和义务，做一个知法守法的好公民。'
                },
                {
                    id: 'pp-social-rules',
                    name: '社会公德',
                    keywords: ['社会公德', '文明', '诚信', '友善', '环保'],
                    knowledge: '社会公德基本规范：\n\n文明礼貌：尊老爱幼，礼貌待人\n助人为乐：帮助有困难的人\n爱护公物：保护公共设施\n保护环境：不乱扔垃圾，节约资源\n遵纪守法：遵守法律法规\n\n社会主义核心价值观（公民层面）：\n爱国、敬业、诚信、友善\n\n诚信的重要性：\n诚信是做人的基本品质\n诚信是社会交往的基础\n失信会影响个人信用记录',
                    example: '捡到别人的钱包应该怎么做？\n答：应该想办法归还失主。可以交给老师、警察，或在原地等待失主。不能据为己有。',
                    analysis: '拾金不昧是诚信的表现，也是法律规定的义务。',
                    mistakes: '常见错误：认为小谎言无伤大雅（诚信要从点滴做起）。',
                    tips: '从身边小事做起，做一个诚实守信的人。'
                }
            ]
        },
        junior: {
            name: '初中',
            topics: [
                {
                    id: 'pj-constitution',
                    name: '宪法与法律',
                    keywords: ['宪法', '法律', '基本法', '公民权', '法治'],
                    knowledge: '宪法是国家的根本大法：\n\n宪法规定：\n国家的根本制度和根本任务\n公民的基本权利和义务\n国家机构的设置和职权\n\n宪法的特征：\n最高法律效力\n制定和修改程序最严格\n是一切法律的立法基础\n\n法律体系：\n宪法\u2192法律（民法、刑法、行政法等）\n\u2192行政法规\u2192地方性法规\n\n法治原则：\n有法可依、有法必依、执法必严、违法必究\n\n公民在法律面前一律平等',
                    example: '宪法和普通法律有什么区别？\n1. 宪法是根本法，普通法律是子法\n2. 宪法规定最根本的问题，普通法律规定具体问题\n3. 宪法具有最高法律效力，普通法律不得与宪法相抵触\n4. 宪法的制定和修改程序更严格',
                    analysis: '宪法是"法律的法律"，是一切法律的母法。',
                    mistakes: '常见错误：认为宪法和普通法律地位相同。',
                    tips: '理解宪法的最高地位，知道宪法保护公民的基本权利。'
                },
                {
                    id: 'pj-economy',
                    name: '经济常识',
                    keywords: ['经济', '市场经济', '供求', '消费', '货币', '银行'],
                    knowledge: '基本经济概念：\n\n市场经济：\n通过市场供求关系配置资源的经济体制\n价格由供求关系决定\n\n货币：\n本质：一般等价物\n职能：价值尺度、流通手段、支付手段、贮藏手段\n通货膨胀：货币发行过多，物价上涨\n\n消费：\n理性消费：根据需要和收入合理安排\n绿色消费：环保、可持续\n\n银行：\n储蓄、贷款、转账\n利率：存款利息与本金的比率\n\n收入分配：\n按劳分配为主体，多种分配方式并存',
                    example: '为什么猪肉价格上涨后，养猪的人变多了？\n答：价格信号引导资源配置。猪肉价格上涨\u2192养猪利润增加\u2192更多人养猪\u2192供给增加\u2192价格下降。这就是市场机制调节供求的过程。',
                    analysis: '市场经济中，价格像一只"看不见的手"引导资源配置。',
                    mistakes: '常见错误：认为价格完全由政府决定（市场调节为主，政府调控为辅）。',
                    tips: '关注生活中的经济现象，用经济学原理解释。'
                }
            ]
        },
        senior: {
            name: '高中',
            topics: [
                {
                    id: 'ps-philosophy',
                    name: '哲学常识',
                    keywords: ['哲学', '唯物论', '辩证法', '认识论', '唯物史观', '价值观'],
                    knowledge: '马克思主义哲学：\n\n唯物论：\n物质决定意识，意识对物质有反作用\n世界是物质的，物质是运动的\n\n辩证法：\n联系的观点：事物是普遍联系的\n发展的观点：事物是不断发展的\n矛盾的的观点：矛盾是事物发展的动力\n三大规律：对立统一、质量互变、否定之否定\n\n认识论：\n实践是认识的基础\n认识具有反复性和无限性\n真理是客观的、具体的、有条件的\n\n唯物史观：\n社会存在决定社会意识\n人民群众是历史的创造者\n\n价值观：\n正确的价值观要符合社会发展规律和人民利益',
                    example: '用辩证法分析"塞翁失马，焉知非福"：\n体现了矛盾的对立统一和相互转化。\n失马是坏事，但也因此避免了参军受伤（好事），好事和坏事在一定条件下可以相互转化。\n\n方法论启示：要用一分为二的观点看问题，在困难中看到希望，在顺利时看到隐患。',
                    analysis: '这个故事体现了矛盾的同一性和斗争性，好事和坏事可以相互转化。',
                    mistakes: '常见错误：混淆唯物论和唯心论，辩证法和形而上学。',
                    tips: '用哲学原理分析生活现象，做到理论联系实际。'
                },
                {
                    id: 'ps-politics-system',
                    name: '政治制度',
                    keywords: ['政治制度', '人民代表大会', '多党合作', '民族区域自治', '基层民主'],
                    knowledge: '中国政治制度：\n\n根本政治制度：\n人民代表大会制度\n全国人大是最高国家权力机关\n人大代表由人民选举产生，对人民负责\n\n基本政治制度：\n1. 中国共产党领导的多党合作和政治协商制度\n2. 民族区域自治制度\n3. 基层群众自治制度\n\n中国共产党领导：\n中国共产党的领导是中国特色社会主义最本质的特征\n\n民主集中制原则：\n民主基础上的集中，集中指导下的民主',
                    example: '人民代表大会制度为什么是我国的根本政治制度？\n1. 由我国的国家性质决定（人民民主专政）\n2. 体现了人民当家作主的核心要求\n3. 决定了其他制度（如多党合作、民族自治等）\n4. 实践证明适合中国国情',
                    analysis: '人民代表大会制度直接体现了人民当家作主。',
                    mistakes: '常见错误：混淆人大和政协的职能。',
                    tips: '理解各政治制度之间的关系和各自的作用。'
                }
            ]
        },
        vocational: {
            name: '职高',
            topics: [
                {
                    id: 'pv-labor-rights',
                    name: '劳动权益',
                    keywords: ['劳动法', '劳动合同', '工资', '社保', '维权'],
                    knowledge: '劳动者基本权益：\n\n劳动合同：\n建立劳动关系应当订立书面劳动合同\n试用期：合同3月~1年不超过1个月，1~3年不超过2个月\n\n工资：\n最低工资保障\n加班费：平日150%、周末200%、法定假日300%\n\n社会保险（五险）：\n养老保险、医疗保险、失业保险、工伤保险、生育保险\n\n劳动争议解决途径：\n协商\u2192调解\u2192仲裁\u2192诉讼\n劳动仲裁是诉讼的前置程序\n\n维权热线：12333（人社）、12351（工会）',
                    example: '公司不签劳动合同怎么办？\n1. 保留工作证据（工资条、考勤记录等）\n2. 向劳动监察部门投诉\n3. 申请劳动仲裁\n4. 不签合同可要求双倍工资（工作满1个月后）',
                    analysis: '劳动合同是保护劳动者权益的重要法律文件。',
                    mistakes: '常见错误：不知道试用期也有工资标准，不签合同就不受保护（事实劳动关系同样受保护）。',
                    tips: '入职时一定要签劳动合同，保留好相关证据。'
                }
            ]
        },
        university: {
            name: '大学',
            topics: [
                {
                    id: 'pu-marxism',
                    name: '马克思主义基本原理',
                    keywords: ['马克思主义', '资本论', '剩余价值', '阶级', '共产主义'],
                    knowledge: '马克思主义三个组成部分：\n\n1. 马克思主义哲学：\n辩证唯物主义和历史唯物主义\n\n2. 马克思主义政治经济学：\n劳动价值论：商品的价值由社会必要劳动时间决定\n剩余价值论：资本家通过剥削工人的剩余劳动获取利润\n资本积累：剩余价值转化为资本，扩大再生产\n\n3. 科学社会主义：\n社会主义代替资本主义的历史必然性\n共产主义社会的基本特征\n\n剩余价值：\n工人创造的价值大于其工资\n差额部分就是剩余价值（被资本家占有）\nm = c + v + m（c不变资本，v可变资本，m剩余价值）',
                    example: '什么是剩余价值？\n例：工人每天工作8小时，其中4小时创造的价值等于自己的工资（必要劳动时间），另外4小时创造的价值被资本家占有（剩余劳动时间）。\n这4小时剩余劳动时间创造的价值就是剩余价值。',
                    analysis: '剩余价值理论揭示了资本主义剥削的本质。',
                    mistakes: '常见错误：混淆不变资本和可变资本的概念。',
                    tips: '理解劳动价值论和剩余价值论是理解马克思主义政治经济学的关键。'
                }
            ]
        }
    },

    levelKeywords: {
        kindergarten: ['幼儿园', '学前', '启蒙'],
        primary: ['小学', '品德', '道德与法治'],
        junior: ['初中', '七年级', '八年级', '九年级', '道德与法治', '中考政治'],
        senior: ['高中', '高一', '高二', '高三', '高考政治'],
        vocational: ['职高', '中职', '经济政治'],
        university: ['大学', '马克思主义', '政治学']
    },

    detectLevel: function(question, context) {
        var q = (question || '').toLowerCase(); var ctx = (context || '').toLowerCase();
        for (var level in this.levelKeywords) { var keywords = this.levelKeywords[level]; for (var i = 0; i < keywords.length; i++) { if (ctx.includes(keywords[i])) return level; } }
        for (var level in this.levelKeywords) { var keywords = this.levelKeywords[level]; for (var i = 0; i < keywords.length; i++) { if (q.includes(keywords[i])) return level; } }
        return 'junior';
    },

    findKnowledge: function(question, level) {
        var q = (question || '').toLowerCase(); var levelData = this.levels[level]; if (!levelData) return null;
        var bestMatch = null, bestScore = 0;
        for (var i = 0; i < levelData.topics.length; i++) { var topic = levelData.topics[i]; var score = 0; if (topic.keywords) { for (var j = 0; j < topic.keywords.length; j++) { if (q.includes(topic.keywords[j].toLowerCase())) score += topic.keywords[j].length >= 4 ? 3 : 2; } } if (q.includes(topic.name.toLowerCase())) score += 5; if (score > bestScore) { bestScore = score; bestMatch = topic; } }
        return bestScore >= 2 ? bestMatch : null;
    },

    handle: function(question, cleanQ, context) {
        if (!question) return null; var level = this.detectLevel(question, context);
        var knowledge = this.findKnowledge(question, level);
        if (knowledge) { return teach(knowledge.name, knowledge.knowledge, knowledge.example, knowledge.analysis, knowledge.mistakes, knowledge.tips); }
        var allLevels = ['kindergarten', 'primary', 'junior', 'senior', 'vocational', 'university'];
        for (var i = 0; i < allLevels.length; i++) { if (allLevels[i] === level) continue; knowledge = this.findKnowledge(question, allLevels[i]); if (knowledge) { return teach(knowledge.name + '\uff08' + this.levels[allLevels[i]].name + '\uff09', knowledge.knowledge, knowledge.example, knowledge.analysis, knowledge.mistakes, knowledge.tips); } }
        return null;
    },

    generateProblem: function(difficulty, type) {
        var rand = function(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };
        var d = difficulty || '\u4e2d\u7b49'; var t = type || '\u89e3\u7b54\u9898';
        var levelMap = {'\u7b80\u5355': 'primary', '\u4e2d\u7b49': 'junior', '\u56f0\u96be': 'senior', '\u6311\u6218': 'university'};
        var level = levelMap[d] || 'junior';
        if (t === '\u9009\u62e9\u9898') {
            var problems = [
                {q: '\u6211\u56fd\u7684\u6839\u672c\u5927\u6cd5\u662f\uff1a\nA. \u6c11\u6cd5  B. \u5211\u6cd5  C. \u5baa\u6cd5  D. \u884c\u653f\u8bc9\u8bbc\u6cd5', a: 'C', h: '\u5baa\u6cd5\u662f\u56fd\u5bb6\u7684\u6839\u672c\u5927\u6cd5'},
                {q: '\u201c\u585e\u7fc1\u5931\u9a6c\uff0c\u7109\u77e5\u975e\u798f\u201d\u4f53\u73b0\u7684\u54f2\u5b66\u539f\u7406\u662f\uff1a\nA. \u7269\u8d28\u51b3\u5b9a\u610f\u8bc6  B. \u77db\u76fe\u7684\u5bf9\u7acb\u7edf\u4e00  C. \u5b9e\u8df5\u51b3\u5b9a\u8ba4\u8bc6  D. \u4ef7\u503c\u5224\u65ad', a: 'B', h: '\u597d\u4e8b\u548c\u574f\u4e8b\u53ef\u4ee5\u76f8\u4e92\u8f6c\u5316'}
            ];
            var idx = rand(0, problems.length - 1);
            return {question: problems[idx].q, answer: problems[idx].a, type: '\u9009\u62e9\u9898', hint: problems[idx].h, level: level};
        }
        var topics = [
            {q: '\u7528\u8fa9\u8bc1\u6cd5\u5206\u6790\u201c\u5931\u8d25\u662f\u6210\u529f\u4e4b\u6bcd\u201d\u3002', a: '\u5931\u8d25\u548c\u6210\u529f\u662f\u77db\u76fe\u7684\u4e24\u4e2a\u65b9\u9762\uff0c\u5b83\u4eec\u5728\u4e00\u5b9a\u6761\u4ef6\u4e0b\u53ef\u4ee5\u76f8\u4e92\u8f6c\u5316\u3002\u5931\u8d25\u4e2d\u603b\u7ed3\u7ecf\u9a8c\u6559\u8bad\uff0c\u4e3a\u6210\u529f\u5960\u5b9a\u57fa\u7840\uff0c\u4f53\u73b0\u4e86\u77db\u76fe\u7684\u5bf9\u7acb\u7edf\u4e00\u3002', h: '\u7528\u77db\u76fe\u89c2\u70b9\u5206\u6790\u597d\u4e8b\u548c\u574f\u4e8b\u7684\u5173\u7cfb'},
            {q: '\u7b80\u8ff0\u5e02\u573a\u7ecf\u6d4e\u4e2d\u4ef7\u683c\u7684\u4f5c\u7528\u3002', a: '\u5728\u5e02\u573a\u7ecf\u6d4e\u4e2d\uff0c\u4ef7\u683c\u662f\u201c\u770b\u4e0d\u89c1\u7684\u624b\u201d\uff0c\u5f15\u5bfc\u8d44\u6e90\u914d\u7f6e\u3002\n1. \u4ef7\u683c\u4e0a\u5347\u2192\u751f\u4ea7\u8005\u589e\u52a0\u4f9b\u7ed9\u2192\u4ef7\u683c\u4e0b\u964d\n2. \u4ef7\u683c\u4e0b\u964d\u2192\u751f\u4ea7\u8005\u51cf\u5c11\u4f9b\u7ed9\u2192\u4ef7\u683c\u4e0a\u5347\n\u4ef7\u683c\u56f4\u7ed5\u4ef7\u503c\u4e0a\u4e0b\u6ce2\u52a8\uff0c\u5b9e\u73b0\u8d44\u6e90\u7684\u4f18\u5316\u914d\u7f6e\u3002', h: '\u4ece\u4f9b\u6c42\u5173\u7cfb\u5206\u6790\u4ef7\u683c\u7684\u8c03\u8282\u4f5c\u7528'}
        ];
        var idx2 = rand(0, topics.length - 1);
        return {question: topics[idx2].q, answer: topics[idx2].a, type: '\u89e3\u7b54\u9898', hint: topics[idx2].h, level: level};
    },

    knowledgeDB: [
        {
            title: '国际政治与经济',
            content: '国际政治研究国家之间的关系和国际体系的运作。主权国家是国际关系的基本行为体。国际组织如联合国、世界贸易组织在全球治理中发挥重要作用。经济全球化使各国经济相互依存，国际贸易和投资自由化成为趋势。同时，保护主义、单边主义也对全球化构成挑战。中国倡导构建人类命运共同体，推动全球治理体系变革。',
            difficulty: 'hard',
            tags: ['国际政治', '国际组织', '经济全球化', '人类命运共同体']
        },
        {
            title: '中国特色社会主义理论',
            content: '中国特色社会主义理论体系包括邓小平理论、"三个代表"重要思想、科学发展观和习近平新时代中国特色社会主义思想。核心内容：坚持中国共产党的领导，坚持社会主义初级阶段基本路线，以经济建设为中心，坚持四项基本原则，坚持改革开放。目标是建设富强民主文明和谐美丽的社会主义现代化强国，实现中华民族伟大复兴。',
            difficulty: 'medium',
            tags: ['中国特色社会主义', '邓小平理论', '改革开放', '中国梦']
        },
        {
            title: '市场经济与宏观调控',
            content: '市场经济是以市场为基础配置资源的经济体制，通过价格机制、供求机制和竞争机制调节经济活动。市场调节存在自发性、盲目性和滞后性等缺陷，需要国家宏观调控。宏观调控的主要手段：财政政策（税收、政府支出）和货币政策（利率、存款准备金率）。社会主义市场经济体制将市场经济的优势与社会主义制度相结合。',
            difficulty: 'medium',
            tags: ['市场经济', '宏观调控', '财政政策', '货币政策']
        },
        {
            title: '国际关系与外交政策',
            content: '国际关系的基本形式包括竞争、合作与冲突。国家利益是国际关系的决定性因素。我国奉行独立自主的和平外交政策，坚持和平共处五项原则（互相尊重主权和领土完整、互不侵犯、互不干涉内政、平等互利、和平共处）。中国积极推动构建新型国际关系，坚持多边主义，反对霸权主义和强权政治。',
            difficulty: 'medium',
            tags: ['国际关系', '外交政策', '和平共处五项原则', '多边主义']
        },
        {
            title: '全面依法治国',
            content: '全面依法治国是中国特色社会主义的本质要求和重要保障。总目标是建设中国特色社会主义法治体系、建设社会主义法治国家。基本要求：科学立法、严格执法、公正司法、全民守法。宪法是国家的根本法，具有最高法律效力。法治政府建设要求职能科学、权责法定、执法严明、公开公正、智能高效、廉洁诚信、人民满意。',
            difficulty: 'medium',
            tags: ['依法治国', '法治体系', '宪法', '法治政府']
        },
        {
            title: '新发展理念与高质量发展',
            content: '新发展理念包括创新、协调、绿色、开放、共享。创新是引领发展的第一动力，协调是持续健康发展的内在要求，绿色是永续发展的必要条件，开放是国家繁荣发展的必由之路，共享是中国特色社会主义的本质要求。高质量发展是体现新发展理念的发展，要求从"有没有"转向"好不好"，推动经济发展质量变革、效率变革、动力变革。',
            difficulty: 'medium',
            tags: ['新发展理念', '高质量发展', '创新', '绿色发展', '共享发展']
        }
    ]
};
