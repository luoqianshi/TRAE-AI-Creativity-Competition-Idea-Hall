// ========== 化学科目模块 - 按学龄分类 ==========
// 智学空间 - 化学知识库与智能应答

window.SubjectModules.chemistry = {
    id: 'chemistry',
    name: '化学',
    icon: '\uD83D\uDD28',

    levels: {
        kindergarten: {
            name: '幼儿园',
            topics: [
                {
                    id: 'ck-water',
                    name: '认识水',
                    keywords: ['水', '冰', '水蒸气', '溶解'],
                    knowledge: '水是生命之源。\n水有三种状态：\n冰（固态）：温度低于0°C\n水（液态）：0°C到100°C\n水蒸气（气态）：100°C以上沸腾\n\n水可以溶解很多物质：糖、盐等。\n有些物质不能溶于水：油、沙子等。',
                    example: '把糖放进水里搅拌，糖会慢慢消失，因为糖溶解在了水中。',
                    analysis: '溶解是物质均匀分散到水中的过程，糖水是溶液。',
                    mistakes: '常见错误：认为溶解就是消失了（糖还在水里，只是看不见）。',
                    tips: '观察生活中哪些物质能溶于水，哪些不能。'
                }
            ]
        },
        primary: {
            name: '小学',
            topics: [
                {
                    id: 'cp-matter-states',
                    name: '物质的状态',
                    keywords: ['固体', '液体', '气体', '熔化', '凝固', '蒸发'],
                    knowledge: '物质的三种状态：\n\n固态：有固定形状和体积（冰、铁、石头）\n液态：有固定体积但无固定形状（水、油、牛奶）\n气态：无固定形状和体积（空气、水蒸气）\n\n状态变化：\n熔化：固态\u2192液态（吸热）如 冰\u2192水\n凝固：液态\u2192固态（放热）如 水\u2192冰\n蒸发：液态\u2192气态（吸热）如 水\u2192水蒸气\n液化：气态\u2192液态（放热）如 水蒸气\u2192水滴',
                    example: '冬天窗户上的水珠是怎么来的？\n答：室内空气中的水蒸气遇到冰冷的玻璃，液化成小水珠。',
                    analysis: '液化是气体遇冷变成液体的过程，冬天室内外温差大容易发生。',
                    mistakes: '常见错误：认为水蒸气是白色的（水蒸气无色，看到的是小水滴）。',
                    tips: '观察冰箱里的冰融化、烧水时壶嘴冒"白气"等现象。'
                },
                {
                    id: 'cp-air',
                    name: '空气',
                    keywords: ['空气', '氧气', '二氧化碳', '氮气'],
                    knowledge: '空气的组成：\n氮气：约78%\n氧气：约21%\n二氧化碳：约0.03%\n其他气体和杂质：约1%\n\n氧气的作用：\n支持燃烧、供给呼吸\n\n二氧化碳：\n植物光合作用需要二氧化碳\n人和动物呼出二氧化碳\n\n氮气：\n化学性质稳定，可用于食品包装防腐',
                    example: '为什么蜡烛在空气中能燃烧，在水里不能？\n因为燃烧需要氧气，空气中有氧气，水中没有足够的氧气。',
                    analysis: '氧气是支持燃烧的气体，没有氧气燃烧就不能进行。',
                    mistakes: '常见错误：认为空气是一种单一气体（空气是混合物）。',
                    tips: '了解空气的组成和各成分的作用。'
                }
            ]
        },
        junior: {
            name: '初中',
            topics: [
                {
                    id: 'cj-elements',
                    name: '元素与化合物',
                    keywords: ['元素', '原子', '分子', '离子', '元素周期表', '化学式'],
                    knowledge: '基本概念：\n原子：化学变化中的最小粒子\n分子：保持物质化学性质的最小粒子\n离子：带电的原子或原子团\n元素：具有相同核电荷数（质子数）的一类原子的总称\n\n元素周期表：\n横行叫周期（7个），纵列叫族（18个）\n前20个元素：H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca\n\n化学式书写：\n正价在前，负价在后\n化合价代数和为零\n例：H₂O, NaCl, CO₂, H₂SO₄',
                    example: '水的化学式H₂O表示：\n1. 水由氢元素和氧元素组成\n2. 每个水分子由2个氢原子和1个氧原子构成\n3. 氢为+1价，氧为-2价，代数和=0',
                    analysis: '化学式既表示物质组成，又表示分子构成。',
                    mistakes: '常见错误：元素和原子混淆，化学式化合价代数和不为零。',
                    tips: '熟记前20个元素符号和常见化合价，多练习化学式书写。'
                },
                {
                    id: 'cj-chemical-reactions',
                    name: '化学反应类型',
                    keywords: ['化合反应', '分解反应', '置换反应', '复分解反应', '化学方程式'],
                    knowledge: '四种基本反应类型：\n\n化合反应：多变一 A+B\u2192AB\n例：2H₂+O₂\u21922H₂O\n\n分解反应：一变多 AB\u2192A+B\n例：2H₂O\u21922H₂\u2191+O₂\u2191\n\n置换反应：单质+化合物\u2192新单质+新化合物\n例：Fe+CuSO₄\u2192FeSO₄+Cu\n\n复分解反应：两种化合物交换成分\n例：NaOH+HCl\u2192NaCl+H₂O\n条件：生成物有沉淀、气体或水\n\n氧化还原反应：\n有电子转移的反应\n氧化剂得电子被还原，还原剂失电子被氧化',
                    example: '判断反应类型：\nCaCO₃\u2192CaO+CO₂\u2191\n答：分解反应（一变多）',
                    analysis: '根据反应物和生成物的种类和数目判断反应类型。',
                    mistakes: '常见错误：化学方程式未配平，反应条件忘记写。',
                    tips: '配平化学方程式用最小公倍数法，检查每种原子个数是否相等。'
                },
                {
                    id: 'cj-solution',
                    name: '溶液',
                    keywords: ['溶液', '溶解度', '饱和', '浓度', '溶质', '溶剂'],
                    knowledge: '溶液组成：溶质（被溶解的）+ 溶剂（溶解别的物质的）\n\n溶解度：在一定温度下，100g溶剂中最多能溶解的溶质质量。\n影响因素：温度（大多数固体随温度升高而增大）\n\n饱和溶液：不能再继续溶解某种溶质的溶液\n不饱和溶液：还能继续溶解\n\n溶液浓度：\n质量分数 = 溶质质量 / 溶液质量 × 100%\n溶液质量 = 溶质质量 + 溶剂质量\n\n配制一定浓度的溶液步骤：\n计算\u2192称量\u2192溶解\u2192装瓶',
                    example: '20°C时，将36g食盐溶解在100g水中，求食盐水的质量分数。\n质量分数 = 36/(36+100) × 100% = 36/136 × 100% ≈ 26.5%',
                    analysis: '质量分数 = 溶质质量 ÷（溶质+溶剂）质量 × 100%。',
                    mistakes: '常见错误：分母用溶剂质量而不是溶液质量，溶解度和质量分数混淆。',
                    tips: '记住质量分数的分母是溶液质量（溶质+溶剂），不是溶剂质量。'
                }
            ]
        },
        senior: {
            name: '高中',
            topics: [
                {
                    id: 'cs-organic-chemistry',
                    name: '有机化学',
                    keywords: ['有机化学', '烷烃', '烯烃', '醇', '醛', '羧酸', '酯'],
                    knowledge: '有机化合物分类：\n\n烃（只含C和H）：\n烷烃（CnH2n+2）：甲烷CH₄、乙烷C₂H₆\n烯烃（CnH2n）：乙烯C₂H₄（含C=C双键）\n炔烃（CnH2n-2）：乙炔C₂H₂（含C\u2261C三键）\n苯（C₆H₆）：芳香烃\n\n烃的衍生物：\n醇（-OH）：乙醇C₂H₅OH\n醛（-CHO）：乙醛CH₃CHO\n羧酸（-COOH）：乙酸CH₃COOH\n酯（-COO-）：乙酸乙酯CH₃COOC₂H₅\n\n有机反应类型：\n取代、加成、消去、氧化、还原、酯化、水解',
                    example: '乙醇的化学性质：\n1. 与Na反应：2C₂H₅OH+2Na\u21922C₂H₅ONa+H₂\u2191\n2. 氧化反应：燃烧生成CO₂和H₂O\n3. 催化氧化：C₂H₅OH\u2192CH₃CHO+H₂O（Cu催化）\n4. 酯化反应：与乙酸反应生成乙酸乙酯',
                    analysis: '乙醇含有羟基(-OH)，可以发生取代、氧化和酯化反应。',
                    mistakes: '常见错误：有机方程式漏写小分子（如H₂O），同分异构体写不全。',
                    tips: '掌握官能团的性质，以官能团为中心学习有机化学。'
                },
                {
                    id: 'cs-chemical-equilibrium',
                    name: '化学平衡',
                    keywords: ['化学平衡', '平衡常数', '勒夏特列', '平衡移动', '可逆反应'],
                    knowledge: '化学平衡：\n可逆反应中，正反应速率等于逆反应速率时，各组分浓度不再改变的状态。\n\n平衡常数K：\n对于 aA + bB \u21cc cC + dD\nK = [C]^c[D]^d / [A]^a[B]^b\nK只与温度有关。\n\n勒夏特列原理：\n如果改变影响平衡的一个条件（浓度、温度、压强），\n平衡就向能够减弱这种改变的方向移动。\n\n平衡移动方向：\n增大反应物浓度 \u2192 正向移动\n增大生成物浓度 \u2192 逆向移动\n升高温度 \u2192 向吸热方向移动\n增大压强 \u2192 向气体分子数减少的方向移动',
                    example: 'N₂+3H₂ \u21cc 2NH\u2083 \u0394H<0（正反应放热）\n升高温度，平衡向哪个方向移动？\n答：向逆反应方向移动（吸热方向），因为升高温度平衡向吸热方向移动以减弱温度升高。',
                    analysis: '正反应放热，逆反应吸热。升高温度平衡向吸热方向（逆反应方向）移动。',
                    mistakes: '常见错误：催化剂不能使平衡移动（只加快达到平衡的速度），压强对无气体参与的反应无影响。',
                    tips: '记住勒夏特列原理，分析每个条件改变对平衡的影响。'
                },
                {
                    id: 'cs-electrochemistry',
                    name: '电化学',
                    keywords: ['原电池', '电解池', '氧化还原', '电极', '电镀'],
                    knowledge: '原电池（化学能\u2192电能）：\n负极：氧化反应（失电子）\n正极：还原反应（得电子）\n电子从负极流向正极\n例：锌铜电池（Zn负极，Cu正极）\n\n电解池（电能\u2192化学能）：\n阳极：氧化反应（与电源正极相连）\n阴极：还原反应（与电源负极相连）\n例：电解水：2H₂O\u21922H₂\u2191+O₂\u2191\n\n金属腐蚀与防护：\n吸氧腐蚀（中性/弱酸性环境）\n析氢腐蚀（酸性环境）\n防护方法：涂层、牺牲阳极、外加电流',
                    example: '铜锌原电池中，Zn为负极，Cu为正极，稀H₂SO₄为电解液。\n负极：Zn-2e\u207b\u2192Zn²\u207a（氧化）\n正极：2H\u207a+2e\u207b\u2192H₂\u2191（还原）\n总反应：Zn+H₂SO₄\u2192ZnSO₄+H₂\u2191',
                    analysis: '活泼金属作负极被氧化，不活泼金属作正极，H\u207a在正极被还原。',
                    mistakes: '常见错误：原电池和电解池的阴阳极搞混，电极反应式写错。',
                    tips: '原电池：负氧正还。电解池：阳氧阴还。'
                }
            ]
        },
        vocational: {
            name: '职高',
            topics: [
                {
                    id: 'cv-industrial-chemistry',
                    name: '工业化学常识',
                    keywords: ['工业化学', '材料', '塑料', '金属', '水泥', '玻璃'],
                    knowledge: '常见工业材料：\n\n金属材料：\n铁合金（生铁、钢）：含碳量不同\n铝合金：轻而强，用于航空\n铜合金：导电性好\n\n高分子材料：\n塑料：聚乙烯PE、聚氯乙烯PVC\n纤维：涤纶、尼龙\n橡胶：天然橡胶、合成橡胶\n\n硅酸盐材料：\n水泥：石灰石+黏土高温煅烧\n玻璃：石英砂+纯碱+石灰石高温熔融\n陶瓷：黏土高温烧结',
                    example: '塑料袋的主要成分是聚乙烯（PE），是一种高分子聚合物，化学性质稳定，不易降解，会造成白色污染。',
                    analysis: '高分子材料的优点是轻便耐用，缺点是不易降解，污染环境。',
                    mistakes: '常见错误：认为所有塑料都可以加热（有些塑料加热会释放有毒物质）。',
                    tips: '了解常见材料的性质和用途，注意环保。'
                }
            ]
        },
        university: {
            name: '大学',
            topics: [
                {
                    id: 'cu-physical-chemistry',
                    name: '物理化学',
                    keywords: ['物理化学', '热力学', '动力学', '量子化学', '吉布斯自由能'],
                    knowledge: '热力学三大定律：\n\n第一定律：\u0394U = Q + W（能量守恒）\n\n第二定律：\n孤立系统熵永不减少\n\u0394S \u2265 Q/T（等号可逆，不等号不可逆）\n\n吉布斯自由能：\nG = H - TS\n\u0394G < 0：反应自发进行\n\u0394G = 0：反应达到平衡\n\u0394G > 0：反应不能自发进行\n\n化学动力学：\n反应速率方程：r = k[A]^m[B]^n\n阿伦尼乌斯方程：k = A·e^(-Ea/RT)\n活化能Ea越大，反应速率越小',
                    example: '判断反应能否自发进行：\n\u0394H = -92.2 kJ/mol, \u0394S = -198.7 J/(mol·K), T = 298K\n\u0394G = \u0394H - T\u0394S = -92.2 - 298×(-0.1987) = -92.2 + 59.2 = -33.0 kJ/mol\n\u0394G < 0，反应自发进行。',
                    analysis: '焓变和熵变共同决定反应方向，用吉布斯自由能判断。',
                    mistakes: '常见错误：\u0394G < 0只说明热力学可行，不代表反应一定快（动力学问题）。',
                    tips: '热力学判断方向，动力学判断速度，两者缺一不可。'
                }
            ]
        }
    },

    levelKeywords: {
        kindergarten: ['幼儿园', '学前', '启蒙'],
        primary: ['小学', '小学科学'],
        junior: ['初中', '九年级', '初三', '中考化学'],
        senior: ['高中', '高一', '高二', '高三', '高考化学'],
        vocational: ['职高', '中职', '工业化学'],
        university: ['大学', '有机化学', '物理化学', '分析化学']
    },

    detectLevel: function(question, context) {
        var q = (question || '').toLowerCase();
        var ctx = (typeof context === 'string' ? context : '').toLowerCase();
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
                {q: '水的化学式是：\nA. HO  B. H\u2082O  C. H\u2082O\u2082  D. OH', a: 'B', h: '\u6c34\u7531\u6c22\u548c\u6c27\u7ec4\u6210'},
                {q: '下列属于化合反应的是：\nA. 2H\u2082O\u21922H\u2082+O\u2082  B. 2H\u2082+O\u2082\u21922H\u2082O\nC. Zn+H\u2082SO\u2084\u2192ZnSO\u2084+H\u2082  D. NaOH+HCl\u2192NaCl+H\u2082O', a: 'B', h: '\u5316\u5408\u53cd\u5e94\u662f\u591a\u53d8\u4e00'}
            ];
            var idx = rand(0, problems.length - 1);
            return {question: problems[idx].q, answer: problems[idx].a, type: '\u9009\u62e9\u9898', hint: problems[idx].h, level: level};
        }
        var topics = [
            {q: '\u914d\u5e73\u5316\u5b66\u65b9\u7a0b\u5f0f\uff1aFe + O\u2082 \u2192 Fe\u2083O\u2084', a: '4Fe + 3O\u2082 \u2192 2Fe\u2083O\u2084\n\u68c0\u67e5\uff1aFe: 4=2\u00d73\u2713, O: 3\u00d72=6=4\u00d72\u2713', h: '\u6700\u5c0f\u516c\u500d\u6570\u6cd5'},
            {q: '\u8ba1\u7b97\u5c0640g NaOH \u6eb6\u89e3\u5728160g\u6c34\u4e2d\u7684\u8d28\u91cf\u5206\u6570\u3002', a: '\u8d28\u91cf\u5206\u6570 = 40/(40+160) \u00d7 100% = 40/200 \u00d7 100% = 20%', h: '\u6eb6\u8d28\u8d28\u91cf/\u6eb6\u6db2\u8d28\u91cf\u00d7100%'}
        ];
        var idx2 = rand(0, topics.length - 1);
        return {question: topics[idx2].q, answer: topics[idx2].a, type: '\u89e3\u7b54\u9898', hint: topics[idx2].h, level: level};
    },

    knowledgeDB: [
        {
            title: '有机化学基础',
            content: '有机化学是研究碳化合物及其衍生物的化学。烃类包括烷烃、烯烃、炔烃和芳香烃。官能团决定有机物的化学性质，如羟基(-OH)、羧基(-COOH)、醛基(-CHO)等。有机反应类型包括取代反应、加成反应、消去反应、氧化反应和还原反应。',
            difficulty: 'hard',
            tags: ['有机化学', '烃类', '官能团', '有机反应']
        },
        {
            title: '元素周期表详解（周期律、族特征）',
            content: '元素周期表按原子序数排列，共7个周期、18个纵列（16个族）。周期律：元素的性质随原子序数的递增呈周期性变化。同周期从左到右，金属性减弱、非金属性增强；同主族从上到下，金属性增强、非金属性减弱。主族元素的最高正化合价等于族序数（O、F除外）。',
            difficulty: 'medium',
            tags: ['元素周期表', '周期律', '族特征', '化合价']
        },
        {
            title: '化学键类型（离子键、共价键、金属键、氢键）',
            content: '离子键：阴阳离子间的静电作用，如NaCl。共价键：原子间通过共用电子对形成，分为极性键和非极性键。金属键：金属阳离子与自由电子之间的强烈相互作用。氢键：氢原子与电负性大的原子（N、O、F）之间的特殊分子间作用力，影响物质的熔沸点和溶解性。',
            difficulty: 'medium',
            tags: ['化学键', '离子键', '共价键', '金属键', '氢键']
        },
        {
            title: '化学平衡（勒夏特列原理、平衡常数）',
            content: '化学平衡是可逆反应中正逆反应速率相等时的状态。勒夏特列原理：如果改变影响平衡的一个条件，平衡就向能够减弱这种改变的方向移动。平衡常数K：生成物浓度幂之积与反应物浓度幂之积的比值，只与温度有关。K值越大，反应进行得越完全。',
            difficulty: 'hard',
            tags: ['化学平衡', '勒夏特列原理', '平衡常数', '可逆反应']
        },
        {
            title: '电化学基础（原电池与电解池）',
            content: '原电池：将化学能转化为电能的装置，负极发生氧化反应，正极发生还原反应。电解池：将电能转化为化学能的装置，阳极发生氧化反应，阴极发生还原反应。金属腐蚀主要是电化学腐蚀，防护方法包括涂保护层、牺牲阳极的阴极保护法等。',
            difficulty: 'hard',
            tags: ['电化学', '原电池', '电解池', '金属腐蚀']
        },
        {
            title: '配位化合物与过渡金属',
            content: '配位化合物由中心原子（或离子）和配体通过配位键结合而成。过渡金属具有可变价态、形成有色化合物和配合物的特性。常见配合物如[Cu(NH₃)₄]²⁺（深蓝色）、[Fe(SCN)]²⁺（血红色）。配位化合物在催化、医药、冶金等领域有重要应用。',
            difficulty: 'hard',
            tags: ['配位化合物', '过渡金属', '配位键', '配合物']
        }
    ]
};
