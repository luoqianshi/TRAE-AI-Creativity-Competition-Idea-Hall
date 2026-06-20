// ========== 生物科目模块 - 按学龄分类 ==========
// 智学空间 - 生物知识库与智能应答

window.SubjectModules.biology = {
    id: 'biology',
    name: '生物',
    icon: '\uD83C\uDF3F',

    levels: {
        kindergarten: {
            name: '幼儿园',
            topics: [
                {
                    id: 'bk-animals',
                    name: '认识动物',
                    keywords: ['动物', '猫', '狗', '鱼', '鸟', '昆虫'],
                    knowledge: '常见动物分类：\n\n宠物：猫、狗、兔子、仓鼠\n家畜：牛、羊、猪、鸡、鸭\n野生动物：老虎、狮子、大象、熊猫\n水生动物：鱼、虾、蟹、海豚\n鸟类：麻雀、鸽子、老鹰、燕子\n昆虫：蝴蝶、蜜蜂、蚂蚁、蜻蜓\n\n动物的基本需求：食物、水、空气、住所',
                    example: '猫和狗有什么不同？\n猫：会爬树，喜欢吃鱼，爱干净\n狗：会看家，喜欢吃骨头，忠诚',
                    analysis: '不同动物有不同的生活习性和特点。',
                    mistakes: '常见错误：把鲸鱼当成鱼（鲸鱼是哺乳动物）。',
                    tips: '去动物园观察动物，了解它们的生活习性。'
                },
                {
                    id: 'bk-plants',
                    name: '认识植物',
                    keywords: ['植物', '花', '树', '草', '叶子', '根'],
                    knowledge: '植物的基本结构：\n根：吸收水分和养分\n茎：运输水分和养分，支撑植物\n叶：光合作用制造食物\n花：繁殖器官\n果实：包含种子\n\n常见植物：\n树木：松树、柳树、桃树、银杏\n花卉：玫瑰、菊花、向日葵、荷花\n蔬菜：白菜、萝卜、番茄、黄瓜\n水果：苹果、香蕉、葡萄、西瓜',
                    example: '向日葵为什么总是朝向太阳？\n因为向日葵的茎部有"生长素"，在阳光照射下分布不均匀，使茎向阳面弯曲。',
                    analysis: '植物的向光性是生长素分布不均匀造成的。',
                    mistakes: '常见错误：认为植物不需要阳光（植物需要阳光进行光合作用）。',
                    tips: '种一盆小植物，观察它的生长过程。'
                }
            ]
        },
        primary: {
            name: '小学',
            topics: [
                {
                    id: 'bp-human-body',
                    name: '人体常识',
                    keywords: ['人体', '骨骼', '心脏', '肺', '胃', '眼睛'],
                    knowledge: '人体主要器官：\n\n大脑：控制思维和身体活动\n心脏：泵血，维持血液循环\n肺：呼吸，气体交换\n胃：消化食物\n肝脏：解毒，分泌胆汁\n肾脏：过滤血液，产生尿液\n皮肤：保护身体，感觉冷热\n眼睛：看东西\n耳朵：听声音\n\n人体系统：\n消化系统、循环系统、呼吸系统、运动系统、神经系统',
                    example: '食物的消化过程：\n口腔\u2192食道\u2192胃\u2192小肠\u2192大肠\u2192排出\n在口腔中被牙齿嚼碎，在胃中被胃液消化，在小肠中被充分消化吸收。',
                    analysis: '消化系统把食物分解为人体能吸收的营养物质。',
                    mistakes: '常见错误：认为食物在胃里就全部消化完了（主要在小肠吸收）。',
                    tips: '了解人体各器官的位置和功能，养成良好的饮食和作息习惯。'
                },
                {
                    id: 'bp-ecosystem',
                    name: '生态系统',
                    keywords: ['生态', '食物链', '食物网', '生产者', '消费者', '分解者'],
                    knowledge: '生态系统组成：\n\n非生物部分：阳光、空气、水、土壤\n生物部分：\n  生产者：绿色植物（能进行光合作用）\n  消费者：动物（直接或间接以植物为食）\n    初级消费者：草食动物（兔子、鹿）\n    次级消费者：肉食动物（狐狸、蛇）\n  分解者：细菌、真菌（分解有机物）\n\n食物链：草\u2192兔子\u2192狐狸\n食物网：多条食物链交织在一起',
                    example: '写出一条食物链：\n草 \u2192 蝗虫 \u2192 青蛙 \u2192 蛇 \u2192 鹰\n生产者\u2192初级消费者\u2192次级消费者\u2192三级消费者\u2192四级消费者',
                    analysis: '食物链从生产者开始，箭头指向吃它的生物。',
                    mistakes: '常见错误：食物链方向写反，把分解者放进食物链。',
                    tips: '记住食物链从植物开始，箭头表示"被吃"的方向。'
                }
            ]
        },
        junior: {
            name: '初中',
            topics: [
                {
                    id: 'bj-cell',
                    name: '细胞',
                    keywords: ['细胞', '细胞膜', '细胞核', '细胞质', '细胞器', '显微镜'],
                    knowledge: '细胞是生物体结构和功能的基本单位。\n\n细胞结构：\n细胞膜：控制物质进出\n细胞质：生命活动的主要场所\n细胞核：含有遗传物质（DNA）\n细胞器：线粒体（呼吸作用）、叶绿体（光合作用）、核糖体（合成蛋白质）\n\n植物细胞特有：细胞壁、叶绿体、液泡\n动物细胞特有：中心体\n\n细胞分裂：\n有丝分裂：一个细胞分成两个相同的细胞\n减数分裂：产生生殖细胞（染色体减半）\n\n显微镜使用：\n取镜\u2192对光\u2192放片\u2192观察\u2192收镜',
                    example: '比较植物细胞和动物细胞的异同：\n相同：都有细胞膜、细胞质、细胞核\n不同：植物细胞有细胞壁、叶绿体、液泡，动物细胞没有',
                    analysis: '细胞壁使植物细胞有固定形状，叶绿体使植物能光合作用。',
                    mistakes: '常见错误：混淆植物细胞和动物细胞的结构，显微镜操作顺序错误。',
                    tips: '画细胞结构图，标注各部分名称和功能。'
                },
                {
                    id: 'bj-genetics',
                    name: '遗传与变异',
                    keywords: ['遗传', 'DNA', '基因', '染色体', '变异', '孟德尔'],
                    knowledge: '遗传物质：\nDNA是主要的遗传物质\n基因是DNA上有遗传效应的片段\n染色体：DNA+蛋白质（人体46条，23对）\n\n孟德尔遗传定律：\n分离定律：一对等位基因在形成配子时彼此分离\n自由组合定律：不同对的等位基因独立分配\n\n显性和隐性：\n显性基因（大写）：表现出来的性状\n隐性基因（小写）：被掩盖的性状\nAA/Aa表现显性性状，aa表现隐性性状\n\n变异：\n可遗传变异：基因突变、基因重组、染色体变异\n不可遗传变异：环境引起的改变',
                    example: '已知双眼皮(A)对单眼皮(a)为显性，父亲为Aa（双眼皮），母亲为aa（单眼皮），子女的基因型和表现型？\nAa × aa\n配子：A, a 和 a\n后代：Aa（双眼皮）: aa（单眼皮） = 1:1\n子女有50%概率双眼皮，50%概率单眼皮。',
                    analysis: '用分离定律分析，Aa和aa杂交后代比例为1:1。',
                    mistakes: '常见错误：显性和隐性搞反，基因型和表现型混淆。',
                    tips: '画遗传图解帮助分析，注意显隐性的判断。'
                },
                {
                    id: 'bj-photosynthesis',
                    name: '光合作用与呼吸作用',
                    keywords: ['光合作用', '呼吸作用', '叶绿体', '线粒体', '葡萄糖'],
                    knowledge: '光合作用：\n场所：叶绿体\n条件：光照\n原料：CO₂ + H₂O\n产物：有机物(C₆H₁₂O₆) + O₂\n方程式：CO₂+H₂O\u2192(C₆H₁₂O₆)+O₂（光照、叶绿体）\n意义：将无机物转化为有机物，储存能量\n\n呼吸作用：\n场所：线粒体（有氧呼吸）\n原料：C₆H₁₂O₆ + O₂\n产物：CO₂ + H₂O + 能量\n方程式：C₆H₁₂O₆+6O₂\u21926CO₂+6H₂O+能量\n意义：释放能量供生命活动使用\n\n两者关系：\n光合作用储存能量，呼吸作用释放能量，相互依存。',
                    example: '绿色植物在光下和暗处分别有什么变化？\n光下：进行光合作用和呼吸作用，光合作用>呼吸作用，积累有机物\n暗处：只进行呼吸作用，消耗有机物',
                    analysis: '光合作用需要光，没有光只能进行呼吸作用。',
                    mistakes: '常见错误：认为植物只进行光合作用不进行呼吸作用。',
                    tips: '记住光合作用和呼吸作用的场所、原料、产物和条件。'
                }
            ]
        },
        senior: {
            name: '高中',
            topics: [
                {
                    id: 'bs-molecular-biology',
                    name: '分子生物学',
                    keywords: ['DNA', 'RNA', '蛋白质', '转录', '翻译', '中心法则', '基因表达'],
                    knowledge: '中心法则：\nDNA \u2192（转录）\u2192 RNA \u2192（翻译）\u2192 蛋白质\n\nDNA结构：\n双螺旋结构（沃森和克里克）\n碱基配对：A-T, G-C（氢键连接）\n复制方式：半保留复制\n\n转录（DNA\u2192mRNA）：\n模板链：DNA的一条链\n原料：四种核糖核苷酸\n酶：RNA聚合酶\n碱基配对：A-U, T-A, G-C, C-G\n\n翻译（mRNA\u2192蛋白质）：\n场所：核糖体\n密码子：mRNA上每3个碱基决定一个氨基酸\n反密码子：tRNA上的碱基三联体\n\n基因突变：\n碱基对的替换、插入、缺失',
                    example: 'DNA模板链序列：3\'-TACGGA-5\'\n转录得到的mRNA：5\'-AUGCCU-3\'\n翻译得到的氨基酸序列：Met-Pro（甲硫氨酸-脯氨酸）',
                    analysis: '转录时DNA的T对应mRNA的A，翻译时按密码子表查找氨基酸。',
                    mistakes: '常见错误：转录和翻译的碱基配对搞混（转录A-U不是A-T）。',
                    tips: '记住中心法则，转录在细胞核，翻译在核糖体。'
                },
                {
                    id: 'bs-evolution',
                    name: '进化论',
                    keywords: ['进化', '自然选择', '达尔文', '物种', '适应', '遗传漂变'],
                    knowledge: '达尔文自然选择学说：\n1. 过度繁殖：生物产生的后代数量远超过环境能承载的\n2. 生存斗争：个体之间为生存而竞争\n3. 遗传变异：个体之间存在差异\n4. 适者生存：适应环境的个体生存并繁殖\n\n现代进化理论（综合进化论）：\n种群是进化的基本单位\n进化的实质是种群基因频率的改变\n突变和基因重组提供原材料\n自然选择决定进化方向\n\n物种形成：\n地理隔离\u2192生殖隔离\u2192新物种\n\n证据：\n化石记录、比较解剖学、分子生物学、生物地理学',
                    example: '工业黑化现象：\n英国工业革命前，桦尺蠖浅色个体多（树干上长满地衣，浅色有保护色）\n工业革命后，烟尘污染使树干变黑，深色个体更有优势\n说明：环境变化导致自然选择方向改变。',
                    analysis: '自然选择不是"适者生存"的被动过程，而是环境对变异的筛选。',
                    mistakes: '常见错误：认为进化有方向性（进化没有预定的方向），获得性遗传（后天获得的性状不能遗传）。',
                    tips: '理解进化的核心是种群基因频率的改变，自然选择是主要机制。'
                }
            ]
        },
        vocational: {
            name: '职高',
            topics: [
                {
                    id: 'bv-health-biology',
                    name: '健康与营养',
                    keywords: ['营养', '维生素', '蛋白质', '健康', '饮食', '传染病'],
                    knowledge: '人体必需营养素：\n蛋白质：构成细胞，修复组织（肉、蛋、奶、豆）\n碳水化合物：提供能量（米、面、薯类）\n脂肪：储存能量，保温（油、坚果）\n维生素：调节生理功能\n  VitA：视力（胡萝卜、肝脏）\n  VitB：代谢（谷物、肉类）\n  VitC：免疫力（水果、蔬菜）\n  VitD：钙吸收（鱼肝油、晒太阳）\n矿物质：钙、铁、锌、碘\n\n传染病预防：\n控制传染源、切断传播途径、保护易感人群',
                    example: '缺铁性贫血：铁是血红蛋白的重要成分，缺铁会导致血红蛋白减少，携氧能力下降，引起贫血。\n预防：多吃含铁食物（红肉、菠菜、动物肝脏）。',
                    analysis: '合理膳食是健康的基础，各种营养素要均衡摄入。',
                    mistakes: '常见错误：认为维生素吃得越多越好（脂溶性维生素过量会中毒）。',
                    tips: '均衡饮食，不挑食不偏食，每天摄入多种食物。'
                }
            ]
        },
        university: {
            name: '大学',
            topics: [
                {
                    id: 'bu-biochemistry',
                    name: '生物化学',
                    keywords: ['生物化学', '酶', '代谢', '糖代谢', '脂代谢', '蛋白质代谢'],
                    knowledge: '酶：\n本质：大多数是蛋白质\n特性：高效性、专一性、多样性、温和性\n影响因素：温度、pH、底物浓度、酶浓度\n米氏方程：v = Vmax[S]/(Km+[S])\n\n糖代谢：\n糖酵解：葡萄糖\u2192丙酮酸（细胞质，不需要氧）\n三羧酸循环：丙酮酸\u2192CO₂+H₂O+大量ATP（线粒体）\n氧化磷酸化：电子传递链产生ATP\n\n蛋白质代谢：\n氨基酸脱氨基作用\n尿素循环\n转氨基作用\n\n脂代谢：\n脂肪分解：甘油\u2192糖酵解，脂肪酸\u2192\u03b2-氧化\u2192乙酰CoA\u2192三羧酸循环',
                    example: '糖酵解过程：\n1分子葡萄糖\u21922分子丙酮酸\n消耗2个ATP，产生4个ATP和2个NADH\n净产生：2个ATP + 2个NADH\n发生在细胞质中，不需要氧气。',
                    analysis: '糖酵解是葡萄糖分解的第一步，在有氧和无氧条件下都能进行。',
                    mistakes: '常见错误：混淆糖酵解和三羧酸循环的场所和条件。',
                    tips: '画代谢途径图，理解各步骤的物质变化和能量变化。'
                }
            ]
        }
    },

    levelKeywords: {
        kindergarten: ['幼儿园', '学前', '启蒙'],
        primary: ['小学', '小学科学'],
        junior: ['初中', '七年级', '八年级', '中考生物'],
        senior: ['高中', '高一', '高二', '高三', '高考生物'],
        vocational: ['职高', '中职', '健康'],
        university: ['大学', '生物化学', '分子生物学', '遗传学']
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
                {q: '光合作用的场所是：\nA. 线粒体  B. 叶绿体  C. 细胞核  D. 核糖体', a: 'B', h: '\u53f6\u7eff\u4f53\u662f\u5149\u5408\u4f5c\u7528\u7684\u573a\u6240'},
                {q: 'DNA\u7684\u78b1\u57fa\u914d\u5bf9\u89c4\u5219\u662f\uff1a\nA. A-G, T-C  B. A-T, G-C  C. A-C, T-G  D. A-U, T-A', a: 'B', h: '\u78b1\u57fa\u4e92\u8865\u914d\u5bf9'}
            ];
            var idx = rand(0, problems.length - 1);
            return {question: problems[idx].q, answer: problems[idx].a, type: '\u9009\u62e9\u9898', hint: problems[idx].h, level: level};
        }
        var topics = [
            {q: '\u5199\u51fa\u4e00\u6761\u98df\u7269\u94fe\uff08\u5305\u542b\u751f\u4ea7\u8005\u548c\u4e09\u4e2a\u6d88\u8d39\u8005\uff09\u3002', a: '\u8349 \u2192 \u86c7\u866b \u2192 \u9752\u86d9 \u2192 \u86c7 \u2192 \u9e70\n\u751f\u4ea7\u8005(\u8349)\u2192\u521d\u7ea7\u6d88\u8d39\u8005(\u86c7\u866b)\u2192\u6b21\u7ea7\u6d88\u8d39\u8005(\u9752\u86d9)\u2192\u4e09\u7ea7\u6d88\u8d39\u8005(\u86c7)\u2192\u56db\u7ea7\u6d88\u8d39\u8005(\u9e70)', h: '\u98df\u7269\u94fe\u4ece\u751f\u4ea7\u8005\u5f00\u59cb'},
            {q: '\u5df2\u77e5\u53cc\u773c\u76ae(A)\u5bf9\u5355\u773c\u76ae(a)\u4e3a\u663e\u6027\uff0c\u7236\u4eb2\u4e3aAa\uff0c\u6bcd\u4eb2\u4e3aaa\uff0c\u5b50\u5973\u7684\u8868\u73b0\u578b\u3002', a: 'Aa \u00d7 aa\n\u540e\u4ee3\uff1aAa(\u53cc\u773c\u76ae):aa(\u5355\u773c\u76ae) = 1:1\n\u5b50\u5973\u670950%\u6982\u7387\u53cc\u773c\u76ae\uff0c50%\u6982\u7387\u5355\u773c\u76ae\u3002', h: '\u5206\u79bb\u5b9a\u5f8b\u9057\u4f20\u56fe\u89e3'}
        ];
        var idx2 = rand(0, topics.length - 1);
        return {question: topics[idx2].q, answer: topics[idx2].a, type: '\u89e3\u7b54\u9898', hint: topics[idx2].h, level: level};
    },

    knowledgeDB: [
        {
            title: '生物技术',
            content: '生物技术是利用生物体或其组成部分来生产产品或提供服务的技术。基因工程通过重组DNA技术改变生物的遗传特性。克隆技术可以复制生物体。PCR技术用于扩增DNA片段。生物技术在医药、农业、环保等领域有广泛应用。',
            difficulty: 'hard',
            tags: ['生物技术', '基因工程', '克隆', 'PCR']
        },
        {
            title: 'DNA复制与转录',
            content: 'DNA复制：以亲代DNA为模板合成子代DNA的过程，特点是半保留复制、边解旋边复制。需要DNA聚合酶、解旋酶、引物等。转录：以DNA的一条链为模板合成RNA的过程，发生在细胞核中，需要RNA聚合酶。转录产物包括mRNA、tRNA和rRNA。',
            difficulty: 'hard',
            tags: ['DNA复制', '转录', '半保留复制', 'RNA聚合酶']
        },
        {
            title: '神经调节（反射弧、突触传递）',
            content: '反射是神经调节的基本方式，反射弧由感受器、传入神经、神经中枢、传出神经和效应器五部分组成。突触是神经元之间传递信息的结构，包括突触前膜、突触间隙和突触后膜。神经递质由突触前膜释放，与突触后膜上的受体结合，引起下一个神经元兴奋或抑制。兴奋在突触处单向传递。',
            difficulty: 'hard',
            tags: ['神经调节', '反射弧', '突触', '神经递质']
        },
        {
            title: '免疫调节（特异性免疫、抗体）',
            content: '免疫调节是机体识别和清除外来抗原及体内异常细胞的生理过程。特异性免疫包括体液免疫和细胞免疫。体液免疫中B细胞受抗原刺激后分化为浆细胞，产生抗体，抗体与抗原特异性结合。细胞免疫中T细胞直接杀伤靶细胞。免疫失调可导致过敏反应、自身免疫病和免疫缺陷病。',
            difficulty: 'hard',
            tags: ['免疫调节', '特异性免疫', '抗体', '体液免疫', '细胞免疫']
        },
        {
            title: '植物激素调节',
            content: '植物激素是植物体内产生的微量有机物，对植物的生长发育有显著调节作用。生长素促进细胞伸长，具有两重性（低浓度促进、高浓度抑制）。赤霉素促进茎的伸长和种子萌发。细胞分裂素促进细胞分裂。脱落酸抑制生长、促进休眠。乙烯促进果实成熟。各种激素相互协调，共同调节植物生命活动。',
            difficulty: 'medium',
            tags: ['植物激素', '生长素', '赤霉素', '细胞分裂素', '乙烯']
        },
        {
            title: '种群与群落',
            content: '种群是在一定区域内同种生物个体的总和，具有种群密度、出生率、死亡率、年龄组成和性别比例等特征。群落是同一时间内聚集在一定区域中各种生物种群的集合，具有物种组成、种间关系（竞争、捕食、互利共生、寄生）和空间结构（垂直结构和水平结构）。群落演替分为初生演替和次生演替。',
            difficulty: 'medium',
            tags: ['种群', '群落', '种间关系', '群落演替']
        }
    ]
};
