// ========== 地理科目模块 - 按学龄分类 ==========
// 智学空间 - 地理知识库与智能应答

window.SubjectModules.geography = {
    id: 'geography',
    name: '地理',
    icon: '\uD83C\uDF0D',

    levels: {
        kindergarten: {
            name: '幼儿园',
            topics: [
                {
                    id: 'gk-earth',
                    name: '认识地球',
                    keywords: ['地球', '太阳', '月亮', '天空', '白天', '黑夜'],
                    knowledge: '地球的基本认知：\n\n地球是我们生活的星球，是一个巨大的球体。\n地球绕着太阳转（公转），一年转一圈。\n地球自己也在转（自转），一天转一圈。\n自转产生白天和黑夜。\n\n太阳：给地球带来光和热\n月亮：地球的卫星，绕地球转\n天空：白天是蓝色的，晚上可以看到星星',
                    example: '为什么有白天和黑夜？\n因为地球在不停地自转。面向太阳的一面是白天，背对太阳的一面是黑夜。',
                    analysis: '地球自转一周约24小时，就是我们所说的一天。',
                    mistakes: '常见错误：认为太阳绕着地球转。',
                    tips: '用手电筒和地球仪演示白天和黑夜的变化。'
                }
            ]
        },
        primary: {
            name: '小学',
            topics: [
                {
                    id: 'gp-continents-oceans',
                    name: '七大洲四大洋',
                    keywords: ['七大洲', '四大洋', '亚洲', '非洲', '欧洲', '美洲', '大洋洲', '南极洲', '太平洋', '大西洋'],
                    knowledge: '世界七大洲（按面积排序）：\n1. 亚洲：面积最大，人口最多\n2. 非洲：国家最多\n3. 北美洲\n4. 南美洲\n5. 南极洲：最寒冷\n6. 欧洲\n7. 大洋洲：面积最小\n\n世界四大洋（按面积排序）：\n1. 太平洋：面积最大，最深\n2. 大西洋\n3. 印度洋\n4. 北冰洋：最小，最冷\n\n中国所在的大洲：亚洲\n中国濒临的海洋：太平洋',
                    example: '世界上最大的洲和大洋分别是什么？\n最大的洲是亚洲，最大的洋是太平洋。',
                    analysis: '记住七大洲四大洋的名称和位置，是地理学习的基础。',
                    mistakes: '常见错误：把北冰洋和印度洋的位置搞混。',
                    tips: '在世界地图上找到每个大洲和大洋的位置。'
                },
                {
                    id: 'gp-china-geography',
                    name: '中国地理常识',
                    keywords: ['中国', '首都', '长江', '黄河', '珠穆朗玛', '省份'],
                    knowledge: '中国地理基本知识：\n\n首都：北京\n面积：约960万平方公里（世界第三）\n人口：约14亿\n\n行政区划：\n23个省、5个自治区、4个直辖市、2个特别行政区\n\n四大直辖市：北京、上海、天津、重庆\n\n主要河流：\n长江：中国最长，6300km，世界第三\n黄河：中华文明发源地，5464km\n珠江：南方最大河流\n\n主要山脉：\n喜马拉雅山脉（世界最高）\n秦岭（南北分界线）\n\n世界最高峰：珠穆朗玛峰（8848.86m）',
                    example: '秦岭-淮河一线有什么地理意义？\n1. 1月0\u00b0C等温线\n2. 800mm等降水量线\n3. 暖温带与亚热带分界线\n4. 旱地与水田分界线\n5. 北方与南方分界线',
                    analysis: '秦岭-淮河是中国重要的地理分界线，南北差异明显。',
                    mistakes: '常见错误：把珠穆朗玛峰的高度记错。',
                    tips: '在中国地图上找到主要河流和山脉的位置。'
                }
            ]
        },
        junior: {
            name: '初中',
            topics: [
                {
                    id: 'gj-climate',
                    name: '气候类型',
                    keywords: ['气候', '气温', '降水', '季风', '热带', '温带', '寒带'],
                    knowledge: '世界主要气候类型：\n\n热带气候：\n热带雨林气候：全年高温多雨\n热带草原气候：干湿季分明\n热带季风气候：雨热同期\n热带沙漠气候：全年高温少雨\n\n温带气候：\n地中海气候：夏干冬雨\n温带海洋性气候：全年温和湿润\n温带季风气候：夏雨冬干\n温带大陆性气候：温差大，降水少\n\n寒带气候：\n苔原气候、冰原气候\n\n中国气候特点：\n季风气候显著\n气候复杂多样',
                    example: '比较地中海气候和温带季风气候：\n地中海气候：夏干冬雨（大陆西岸30\u00b0-40\u00b0）\n温带季风气候：夏雨冬干（大陆东岸）\n\n记忆口诀：西岸地中海夏干冬雨，东岸季风夏雨冬干。',
                    analysis: '两种气候的降水季节恰好相反，原因是大气环流不同。',
                    mistakes: '常见错误：混淆地中海气候和季风气候的降水季节。',
                    tips: '画气候分布图，重点掌握降水季节的差异。'
                },
                {
                    id: 'gj-china-regions',
                    name: '中国四大地理区域',
                    keywords: ['北方地区', '南方地区', '西北地区', '青藏地区', '地理分区'],
                    knowledge: '中国四大地理区域：\n\n北方地区：\n秦岭-淮河以北\n温带季风气候，旱地农业（小麦、玉米）\n面食为主\n\n南方地区：\n秦岭-淮河以南\n亚热带季风气候，水田农业（水稻）\n米饭为主\n\n西北地区：\n大兴安岭以西\n温带大陆性气候，干旱少雨\n绿洲农业（棉花、瓜果）\n\n青藏地区：\n青藏高原\n高原山地气候，高寒\n高寒农业（青稞、牦牛）\n"世界屋脊"，平均海拔4000m以上',
                    example: '比较北方和南方的农业差异：\n北方：旱地、小麦玉米、一年一熟或两年三熟\n南方：水田、水稻油菜、一年两熟到三熟\n\n原因：气候不同导致农业方式不同。',
                    analysis: '秦岭-淮河是南北分界线，两侧气候、农业、文化差异明显。',
                    mistakes: '常见错误：混淆四大区域的范围和特征。',
                    tips: '用表格对比四大区域的气候、农业和文化特征。'
                }
            ]
        },
        senior: {
            name: '高中',
            topics: [
                {
                    id: 'gs-physical-geography',
                    name: '自然地理',
                    keywords: ['自然地理', '地球运动', '大气环流', '洋流', '板块构造', '地表形态'],
                    knowledge: '地球运动：\n\n自转：\n方向：自西向东，周期24小时（1恒星日23h56m）\n地转偏向力：北半球右偏，南半球左偏\n时区和日界线\n\n公转：\n方向：自西向东，周期365.25天\n黄赤交角23\u00b026\u2032\n四季变化、昼夜长短变化\n\n大气环流：\n三圈环流：哈德莱环流、费雷尔环流、极地环流\n七个气压带和六个风带\n季风环流\n\n板块构造学说：\n六大板块：太平洋、亚欧、非洲、美洲、印度洋、南极洲\n板块交界处：地震、火山、造山运动',
                    example: '为什么北半球夏季白天长、冬季白天短？\n因为黄赤交角的存在，夏季太阳直射北半球，北半球昼弧大于夜弧，白天长；冬季太阳直射南半球，北半球昼弧小于夜弧，白天短。',
                    analysis: '黄赤交角是产生四季和昼夜长短变化的根本原因。',
                    mistakes: '常见错误：混淆自转和公转的周期和方向，地转偏向力方向搞反。',
                    tips: '用地球仪演示地球运动，理解黄赤交角的意义。'
                },
                {
                    id: 'gs-human-geography',
                    name: '人文地理',
                    keywords: ['人文地理', '人口', '城市化', '农业区位', '工业区位', '交通'],
                    knowledge: '人口与城市化：\n\n人口分布：\n东亚、南亚、西欧、北美东部人口密集\n影响因素：气候、地形、水源、交通、经济\n\n人口迁移：\n推力因素（迁出地不利条件）\n拉力因素（迁入地有利条件）\n\n城市化：\n标志：城市人口比重上升、城市用地规模扩大\n问题：交通拥堵、环境污染、住房紧张\n解决：合理规划、发展卫星城、改善环境\n\n区位因素：\n农业：气候、地形、土壤、水源、市场、交通、政策\n工业：原料、能源、市场、交通、劳动力、技术、政策\n\n交通：\n五种运输方式：铁路、公路、水运、航空、管道',
                    example: '分析上海成为特大城市的区位因素：\n自然因素：位于长江入海口，地势平坦，气候适宜\n社会经济因素：交通便利（港口、铁路），经济发达，政策支持\n\n城市化过程中面临的问题：交通拥堵、房价高、环境污染等。',
                    analysis: '城市发展是自然和社会经济因素共同作用的结果。',
                    mistakes: '常见错误：只分析自然因素忽略社会经济因素。',
                    tips: '分析区位因素时要从自然和社会经济两方面综合考虑。'
                }
            ]
        },
        vocational: {
            name: '职高',
            topics: [
                {
                    id: 'gv-practical-geography',
                    name: '实用地理知识',
                    keywords: ['地图', '方向', '定位', '出行', '旅游地理'],
                    knowledge: '实用地理技能：\n\n看地图：\n比例尺：图上距离与实际距离的比\n方向：上北下南，左西右东\n图例：地图上符号的含义\n\n出行导航：\n看路牌、看站牌、使用手机导航\n了解所在城市的交通线路\n\n旅游地理：\n中国著名景点：\n北京：故宫、长城、颐和园\n西安：兵马俑、大雁塔\n杭州：西湖\n桂林：山水甲天下\n\n旅行准备：\n查天气、查交通、订住宿、带证件',
                    example: '地图比例尺1:50000表示什么？\n表示图上1厘米代表实际500米（50000厘米）。\n大比例尺（>1:10万）：表示范围小，内容详细\n小比例尺（<1:100万）：表示范围大，内容简略',
                    analysis: '比例尺越大（分母越小），地图越详细。',
                    mistakes: '常见错误：比例尺大小和表示范围的关系搞反。',
                    tips: '出行前学会看地图和交通图，掌握基本方向辨别方法。'
                }
            ]
        },
        university: {
            name: '大学',
            topics: [
                {
                    id: 'gu-gis',
                    name: '地理信息系统',
                    keywords: ['GIS', '遥感', 'GPS', '地理信息系统', '遥感技术'],
                    knowledge: '地理信息技术（3S技术）：\n\n遥感（RS）：\n原理：传感器接收地表电磁波信息\n应用：资源调查、灾害监测、环境监测、农业估产\n特点：覆盖范围大、信息量大、时效性强\n\n全球定位系统（GPS）：\n原理：卫星信号确定地面点位置\n应用：导航、定位、测绘、军事\n组成：24颗卫星+地面控制站+用户接收机\n\n地理信息系统（GIS）：\n功能：数据采集、存储、管理、分析、可视化\n应用：城市规划、交通管理、灾害预警、商业分析\n\n3S集成应用：\nRS获取数据\u2192GPS定位\u2192GIS分析管理',
                    example: 'GIS在城市规划中的应用：\n1. 叠加分析：将土地利用图、交通图、人口分布图叠加\n2. 缓冲区分析：确定道路扩建影响范围\n3. 网络分析：优化公交线路\n4. 三维可视化：建立城市三维模型',
                    analysis: 'GIS的核心功能是空间数据的存储、分析和可视化。',
                    mistakes: '常见错误：混淆RS、GPS和GIS的功能。',
                    tips: '记住3S各自的功能：RS看（获取数据），GPS定位（确定位置），GIS分析（管理数据）。'
                }
            ]
        }
    },

    levelKeywords: {
        kindergarten: ['幼儿园', '学前', '启蒙'],
        primary: ['小学', '小学地理', '小学科学'],
        junior: ['初中', '七年级', '八年级', '中考地理'],
        senior: ['高中', '高一', '高二', '高三', '高考地理'],
        vocational: ['职高', '中职'],
        university: ['大学', '地理信息系统', 'GIS', '遥感']
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
                {q: '\u4e16\u754c\u4e0a\u9762\u79ef\u6700\u5927\u7684\u6d32\u662f\uff1a\nA. \u975e\u6d32  B. \u4e9a\u6d32  C. \u5317\u7f8e\u6d32  D. \u5357\u6781\u6d32', a: 'B', h: '\u4e9a\u6d32\u9762\u79ef\u6700\u5927\uff0c\u4eba\u53e3\u6700\u591a'},
                {q: '\u4e2d\u56fd\u6700\u957f\u7684\u6cb3\u6d41\u662f\uff1a\nA. \u9ec4\u6cb3  B. \u957f\u6c5f  C. \u73e0\u6c5f  D. \u6dee\u6cb3', a: 'B', h: '\u957f\u6c5f\u5168\u957f6300km'},
                {q: '\u5730\u4e2d\u6d77\u6c14\u5019\u7684\u964d\u6c34\u7279\u70b9\u662f\uff1a\nA. \u590f\u5e72\u51ac\u96e8  B. \u590f\u96e8\u51ac\u5e72  C. \u5168\u5e74\u591a\u96e8  D. \u5168\u5e74\u5c11\u96e8', a: 'A', h: '\u5730\u4e2d\u6d77\u6c14\u5019\u590f\u5e72\u51ac\u96e8'}
            ];
            var idx = rand(0, problems.length - 1);
            return {question: problems[idx].q, answer: problems[idx].a, type: '\u9009\u62e9\u9898', hint: problems[idx].h, level: level};
        }
        var topics = [
            {q: '\u7b80\u8ff0\u79e6\u5cad-\u6dee\u6cb3\u4e00\u7ebf\u7684\u5730\u7406\u610f\u4e49\u3002', a: '1. 1\u67080\u00b0C\u7b49\u6e29\u7ebf\n2. 800mm\u7b49\u964d\u6c34\u91cf\u7ebf\n3. \u6696\u6e29\u5e26\u4e0e\u4e9a\u70ed\u5e26\u5206\u754c\u7ebf\n4. \u65f1\u5730\u4e0e\u6c34\u7530\u5206\u754c\u7ebf\n5. \u6e29\u5e26\u843d\u53f6\u6797\u4e0e\u4e9a\u70ed\u5e26\u5e38\u7eff\u6797\u5206\u754c\u7ebf', h: '\u8bb0\u4f4f\u4e94\u5927\u5730\u7406\u610f\u4e49'},
            {q: '\u6bd4\u8f83\u5317\u65b9\u5730\u533a\u548c\u5357\u65b9\u5730\u533a\u7684\u6c14\u5019\u5dee\u5f02\u3002', a: '\u5317\u65b9\u5730\u533a\uff1a\u6e29\u5e26\u5b63\u98ce\u6c14\u5019\uff0c\u590f\u70ed\u51ac\u5bd2\uff0c\u964d\u6c34\u96c6\u4e2d\u590f\u5b63\n\u5357\u65b9\u5730\u533a\uff1a\u4e9a\u70ed\u5e26\u5b63\u98ce\u6c14\u5019\uff0c\u9ad8\u6e29\u591a\u96e8\uff0c\u964d\u6c34\u5206\u5e03\u5747\u5300\n\u539f\u56e0\uff1a\u7eac\u5ea6\u4f4d\u7f6e\u4e0d\u540c\uff0c\u51ac\u5b63\u98ce\u548c\u590f\u5b63\u98ce\u7684\u5f71\u54cd\u4e0d\u540c', h: '\u4ece\u6c14\u6e29\u3001\u964d\u6c34\u3001\u5b63\u98ce\u4e09\u4e2a\u65b9\u9762\u6bd4\u8f83'}
        ];
        var idx2 = rand(0, topics.length - 1);
        return {question: topics[idx2].q, answer: topics[idx2].a, type: '\u89e3\u7b54\u9898', hint: topics[idx2].h, level: level};
    },

    knowledgeDB: [
        {
            title: '区域可持续发展',
            content: '可持续发展是既满足当代人需求，又不损害后代人满足其需求能力的发展。可持续发展的三大支柱：经济发展、社会进步、环境保护。中国实施可持续发展战略，推进生态文明建设，发展循环经济，保护生态环境，促进人与自然和谐共生。',
            difficulty: 'hard',
            tags: ['可持续发展', '生态文明', '循环经济', '环境保护']
        },
        {
            title: '地球运动（自转、公转、时区）',
            content: '地球自转：绕地轴自西向东旋转，周期约24小时，产生昼夜交替、地方时差异和地转偏向力（北半球向右偏，南半球向左偏）。地球公转：绕太阳自西向东运动，周期约365.25天，产生四季更替和昼夜长短变化。时区：全球划分为24个时区，每个时区跨经度15°，相邻时区相差1小时。国际日期变更线大致沿180°经线。',
            difficulty: 'medium',
            tags: ['地球自转', '地球公转', '时区', '地转偏向力', '四季更替']
        },
        {
            title: '水循环与洋流',
            content: '水循环包括蒸发、水汽输送、凝结降水、地表径流、下渗和地下径流等环节，分为海陆间循环、陆地内循环和海上内循环。洋流是海水沿一定方向的大规模流动，分为风海流、密度流和补偿流。暖流增温增湿（如日本暖流），寒流降温减湿（如秘鲁寒流）。洋流影响沿岸气候、海洋生物分布（寒暖流交汇处形成渔场）和航海。',
            difficulty: 'medium',
            tags: ['水循环', '洋流', '暖流', '寒流', '渔场']
        },
        {
            title: '人口问题与城市化',
            content: '人口问题包括人口增长过快、人口老龄化、人口性别比失衡等。人口增长模式分为原始型、传统型和现代型。城市化是人口向城市集聚、城市规模扩大的过程，衡量指标是城市人口占总人口的比重。城市化带来经济发展和社会进步，但也产生交通拥堵、环境污染、住房紧张、就业困难等"城市病"。应对措施包括发展卫星城、完善公共交通、建设生态城市等。',
            difficulty: 'medium',
            tags: ['人口问题', '城市化', '人口老龄化', '城市病']
        },
        {
            title: '地质作用与地貌演化',
            content: '地质作用分为内力作用和外力作用。内力作用包括地壳运动、岩浆活动和变质作用，形成褶皱、断层、火山等地貌。外力作用包括风化、侵蚀、搬运和堆积，形成河谷、三角洲、沙丘等地貌。地貌演化是内外力共同作用的结果，具有阶段性和区域性特征。',
            difficulty: 'hard',
            tags: ['地质作用', '内力作用', '外力作用', '褶皱', '断层', '地貌演化']
        },
        {
            title: '农业区位因素与农业地域类型',
            content: '农业区位因素包括自然因素（气候、地形、土壤、水源）和社会经济因素（市场、交通、劳动力、技术、政策）。主要农业地域类型：水稻种植业（亚洲季风区，劳动密集型）、商品谷物农业（美国中部，机械化程度高）、大牧场放牧业（阿根廷潘帕斯草原）、混合农业（澳大利亚墨累-达令盆地）、乳畜业（西欧，靠近市场）。',
            difficulty: 'medium',
            tags: ['农业区位', '水稻种植业', '商品谷物农业', '乳畜业', '混合农业']
        }
    ]
};
