// ========== 历史科目模块 - 按学龄分类 ==========
// 智学空间 - 历史知识库与智能应答

window.SubjectModules.history = {
    id: 'history',
    name: '历史',
    icon: '\uD83D\uDCDC',

    levels: {
        kindergarten: {
            name: '幼儿园',
            topics: [
                {
                    id: 'hk-festivals',
                    name: '传统节日故事',
                    keywords: ['节日', '春节', '中秋', '端午', '元宵'],
                    knowledge: '中国传统节日：\n\n春节（农历正月初一）：贴春联、放鞭炮、吃年夜饭、拜年\n传说：年兽怕红色和响声\n\n端午节（农历五月初五）：吃粽子、赛龙舟\n纪念：爱国诗人屈原投汨罗江\n\n中秋节（农历八月十五）：赏月、吃月饼\n传说：嫦娥奔月\n\n元宵节（农历正月十五）：赏花灯、吃汤圆\n\n清明节（公历4月4-6日）：扫墓、踏青\n\n重阳节（农历九月初九）：登高、敬老',
                    example: '端午节为什么要吃粽子？\n因为战国时期楚国诗人屈原投汨罗江自尽，百姓划船打捞，投米团入江喂鱼，不让鱼吃屈原的身体。后来演变成吃粽子和赛龙舟的习俗。',
                    analysis: '每个传统节日都有其历史渊源和文化内涵。',
                    mistakes: '常见错误：把端午节说成纪念其他人。',
                    tips: '了解每个节日的来历和习俗，感受传统文化。'
                }
            ]
        },
        primary: {
            name: '小学',
            topics: [
                {
                    id: 'hp-four-inventions',
                    name: '四大发明',
                    keywords: ['四大发明', '造纸术', '印刷术', '火药', '指南针'],
                    knowledge: '中国古代四大发明：\n\n1. 造纸术（东汉·蔡伦改进）：\n用树皮、麻头、破布等造纸，代替竹简和丝帛\n\n2. 印刷术（北宋·毕昇发明活字印刷）：\n先有雕版印刷，后毕昇发明泥活字印刷术\n\n3. 火药（唐代）：\n炼丹家偶然发现，后用于军事\n\n4. 指南针（战国·司南）：\n利用磁石指示方向，后用于航海\n\n影响：四大发明传播到世界各地，推动了人类文明进步。',
                    example: '造纸术发明前人们用什么写字？\n答：在龟甲、兽骨上刻字（甲骨文），在竹简上写字，在丝帛上写字。这些材料要么笨重，要么昂贵。',
                    analysis: '蔡伦改进的造纸术用廉价材料代替了昂贵的丝帛和笨重的竹简。',
                    mistakes: '常见错误：认为蔡伦"发明"了造纸术（实际上是改进了造纸术）。',
                    tips: '了解四大发明对世界文明的影响。'
                },
                {
                    id: 'hp-dynasties',
                    name: '中国朝代顺序',
                    keywords: ['朝代', '秦', '汉', '唐', '宋', '元', '明', '清'],
                    knowledge: '中国主要朝代顺序：\n夏\u2192商\u2192周（西周、东周）\u2192秦\u2192汉（西汉、东汉）\n2192三国\u2192晋\u2192南北朝\u2192隋\u2192唐\n\u2192五代十国\u2192宋（北宋、南宋）\n2192元\u2192明\u2192清\n\n记忆口诀：\n夏商周秦西东汉，三国两晋南北朝\n隋唐五代又十国，辽宋夏金元明清\n\n重要朝代特点：\n秦：第一个统一的多民族封建国家\n汉：丝绸之路，独尊儒术\n唐：繁荣开放，诗歌巅峰\n宋：经济发达，发明活字印刷\n元：疆域最大\n明：郑和下西洋\n清：最后一个封建王朝',
                    example: '秦始皇最大的贡献是什么？\n答：统一六国，建立中国第一个中央集权的封建国家。统一文字、度量衡、货币，修建长城。',
                    analysis: '秦始皇统一中国对中国历史产生了深远影响。',
                    mistakes: '常见错误：朝代顺序记混，把唐朝和宋朝的顺序搞反。',
                    tips: '用口诀记忆朝代顺序，每个朝代记1-2个重要事件。'
                }
            ]
        },
        junior: {
            name: '初中',
            topics: [
                {
                    id: 'hj-modern-history',
                    name: '中国近代史',
                    keywords: ['近代史', '鸦片战争', '辛亥革命', '五四运动', '抗日战争', '新中国成立'],
                    knowledge: '中国近代史重大事件：\n\n1840年 鸦片战争：中国开始沦为半殖民地半封建社会\n1851年 太平天国运动\n1898年 戊戌变法（百日维新）\n1900年 八国联军侵华\n1911年 辛亥革命：推翻清朝统治，建立中华民国\n1919年 五四运动：新民主主义革命的开端\n1921年 中国共产党成立\n1937-1945年 抗日战争\n1945-1949年 解放战争\n1949年10月1日 中华人民共和国成立\n\n近代化探索：\n洋务运动\u2192戊戌变法\u2192辛亥革命\u2192新文化运动\n（器物\u2192制度\u2192思想）',
                    example: '辛亥革命的历史意义：\n1. 推翻了清朝统治，结束了2000多年的封建帝制\n2. 建立了中华民国\n3. 使民主共和观念深入人心\n4. 推动了中国近代化进程',
                    analysis: '辛亥革命虽然没有改变中国半殖民地半封建社会的性质，但推翻了帝制，具有重大历史意义。',
                    mistakes: '常见错误：认为辛亥革命完全成功了（它没有改变社会性质）。',
                    tips: '按时间线梳理近代史事件，理解因果关系。'
                },
                {
                    id: 'hj-world-history',
                    name: '世界历史',
                    keywords: ['世界史', '工业革命', '法国大革命', '两次世界大战', '文艺复兴'],
                    knowledge: '世界历史重大事件：\n\n14-16世纪 文艺复兴：从意大利开始，人文主义思潮\n15世纪 新航路开辟：哥伦布发现美洲，麦哲伦环球航行\n18世纪 工业革命：从英国开始，蒸汽机的发明和应用\n1789年 法国大革命：推翻波旁王朝，发表《人权宣言》\n1914-1918年 第一次世界大战\n1939-1945年 第二次世界大战\n1945年 联合国成立\n\n工业革命的影响：\n1. 生产力极大提高\n2. 城市化进程加快\n3. 阶级结构变化（工业资产阶级和工人阶级）\n4. 环境问题出现',
                    example: '工业革命为什么首先发生在英国？\n1. 政治上：君主立宪制确立，政局稳定\n2. 经济上：海外贸易和殖民扩张积累了资本\n3. 技术上：工场手工业积累了经验\n4. 市场上：广阔的国内外市场需求',
                    analysis: '工业革命的发生需要政治、经济、技术和市场等多方面条件。',
                    mistakes: '常见错误：混淆两次世界大战的起因和参战方。',
                    tips: '用时间轴整理世界历史大事，注意中外历史的联系。'
                }
            ]
        },
        senior: {
            name: '高中',
            topics: [
                {
                    id: 'hs-ancient-civilization',
                    name: '古代文明',
                    keywords: ['古代文明', '古埃及', '古希腊', '古罗马', '两河流域', '印度'],
                    knowledge: '世界古代文明：\n\n古埃及（尼罗河流域）：\n金字塔、狮身人面像、象形文字\n法老制度、木乃伊\n\n两河流域（美索不达米亚）：\n苏美尔文明、巴比伦\n《汉谟拉比法典》\n楔形文字、60进制\n\n古印度（印度河-恒河流域）：\n种姓制度（婆罗门、刹帝利、吠舍、首陀罗）\n佛教（释迦牟尼）\n阿拉伯数字\n\n古希腊：\n民主政治（雅典）\n哲学（苏格拉底、柏拉图、亚里士多德）\n科学（欧几里得、阿基米德）\n\n古罗马：\n共和国\u2192帝国\n罗马法（十二铜表法）\n基督教兴起',
                    example: '比较古希腊民主和现代民主：\n相同：公民都有参政权利\n不同：\n1. 古希腊民主仅限成年男性公民（妇女、奴隶、外邦人除外）\n2. 直接民主（公民大会）vs 代议制民主\n3. 容易导致多数人暴政',
                    analysis: '雅典民主是古代民主的典型，但有很大的局限性。',
                    mistakes: '常见错误：认为古希腊民主和现代民主完全相同。',
                    tips: '比较学习各文明的异同，理解文明的多样性和交流互鉴。'
                },
                {
                    id: 'hs-historical-analysis',
                    name: '历史分析方法',
                    keywords: ['史料', '历史分析', '史论结合', '唯物史观', '历史评价'],
                    knowledge: '历史学习方法：\n\n1. 史料分类：\n一手史料（原始文献、考古发现）\n二手史料（后人编写的著作）\n\n2. 史论结合：\n论从史出，以史证论\n孤证不立（多方验证）\n\n3. 唯物史观：\n生产力决定生产关系\n经济基础决定上层建筑\n人民群众是历史的创造者\n\n4. 历史评价原则：\n把历史事件放在特定历史条件下评价\n全面评价（功过两面）\n用发展的眼光看问题\n\n5. 历史时间轴：\n按时间顺序梳理事件，理解因果关系',
                    example: '如何评价秦始皇？\n功：统一六国，建立中央集权制度，统一文字、度量衡、货币，修筑长城\n过：焚书坑儒，严刑峻法，大兴土木（阿房宫、骊山陵）\n总体：功大于过，是中国历史上杰出的政治家。',
                    analysis: '评价历史人物要全面客观，放在当时的历史条件下分析。',
                    mistakes: '常见错误：用现代标准评价古人，以偏概全。',
                    tips: '评价历史人物和事件要全面客观，一分为二。'
                }
            ]
        },
        vocational: {
            name: '职高',
            topics: [
                {
                    id: 'hv-chinese-culture',
                    name: '中华传统文化',
                    keywords: ['传统文化', '儒家', '道家', '法家', '诸子百家'],
                    knowledge: '诸子百家：\n\n儒家（孔子、孟子）：\n核心：仁、礼\n主张：仁政、德治、教育有教无类\n影响：成为中国传统文化的主流\n\n道家（老子、庄子）：\n核心：道法自然\n主张：无为而治、顺应自然\n影响：影响中国哲学和艺术\n\n法家（韩非子）：\n核心：以法治国\n主张：法治、集权、严刑峻法\n影响：秦朝采用法家思想统一六国\n\n墨家（墨子）：\n核心：兼爱、非攻\n主张：反对战争，提倡节俭',
                    example: '孔子"有教无类"的教育思想：\n不论贫富贵贱，人人都应该有接受教育的权利。这一思想打破了贵族对教育的垄断，促进了文化普及。',
                    analysis: '孔子的教育思想对后世影响深远，至今仍有重要意义。',
                    mistakes: '常见错误：混淆各家的核心主张。',
                    tips: '用表格对比各家的核心思想和代表人物。'
                }
            ]
        },
        university: {
            name: '大学',
            topics: [
                {
                    id: 'hu-historiography',
                    name: '史学理论与方法',
                    keywords: ['史学理论', '史学方法', '年鉴学派', '计量史学', '口述史'],
                    knowledge: '现代史学流派：\n\n传统史学：\n以政治史为中心，叙述重大事件和人物\n代表：兰克学派（"如实直书"）\n\n年鉴学派：\n反对以政治史为中心\n主张综合研究（地理、经济、社会、文化）\n长时段理论（长时段/中时段/短时段）\n代表：布罗代尔\n\n计量史学：\n用统计学和数学方法研究历史\n数据分析和计算机辅助\n\n后现代史学：\n质疑历史的客观性\n关注边缘群体和日常生活\n口述史、微观史',
                    example: '年鉴学派的"长时段"理论：\n布罗代尔将历史时间分为三个层次：\n1. 长时段（地理时间）：几百年甚至更长的结构变化\n2. 中时段（社会时间）：几十年的周期性变化\n3. 短时段（个体时间）：事件性的政治变化\n\n他认为短时段的事件只是历史的表面泡沫，长时段的结构才是历史的深层。',
                    analysis: '年鉴学派扩大了历史研究的视野，不再局限于政治事件。',
                    mistakes: '常见错误：混淆年鉴学派和传统史学的区别。',
                    tips: '了解不同史学流派的方法论，取长补短。'
                }
            ]
        }
    },

    levelKeywords: {
        kindergarten: ['幼儿园', '学前', '启蒙'],
        primary: ['小学', '小学历史', '三年级', '四年级', '五年级', '六年级'],
        junior: ['初中', '七年级', '八年级', '九年级', '中考历史'],
        senior: ['高中', '高一', '高二', '高三', '高考历史'],
        vocational: ['职高', '中职'],
        university: ['大学', '历史学', '史学']
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
                {q: '\u4e2d\u56fd\u56db\u5927\u53d1\u660e\u4e0d\u5305\u62ec\uff1a\nA. \u9020\u7eb8\u672f  B. \u5370\u5237\u672f  C. \u706b\u836f  D. \u6307\u5357\u9488', a: 'D', h: '\u56db\u5927\u53d1\u660e\u90fd\u662f\u4e2d\u56fd\u7684\uff0c\u6b64\u9898\u8003\u67e5\u7ec6\u8282'},
                {q: '\u8f9b\u4ea5\u9769\u547d\u53d1\u751f\u5728\u54ea\u4e00\u5e74\uff1a\nA. 1840\u5e74  B. 1898\u5e74  C. 1911\u5e74  D. 1919\u5e74', a: 'C', h: '1911\u5e74\u8f9b\u4ea5\u5e74'},
                {q: '\u5de5\u4e1a\u9769\u547d\u9996\u5148\u53d1\u751f\u5728\uff1a\nA. \u6cd5\u56fd  B. \u82f1\u56fd  C. \u7f8e\u56fd  D. \u5fb7\u56fd', a: 'B', h: '\u82f1\u56fd\u662f\u5de5\u4e1a\u9769\u547d\u7684\u6447\u7bee'}
            ];
            var idx = rand(0, problems.length - 1);
            return {question: problems[idx].q, answer: problems[idx].a, type: '\u9009\u62e9\u9898', hint: problems[idx].h, level: level};
        }
        var topics = [
            {q: '\u7b80\u8ff0\u79e6\u59cb\u7687\u7edf\u4e00\u516d\u56fd\u7684\u5386\u53f2\u610f\u4e49\u3002', a: '1. \u7ed3\u675f\u4e86\u6625\u79cb\u6218\u56fd\u4ee5\u6765\u7684\u5206\u88c2\u5c40\u9762\n2. \u5efa\u7acb\u4e86\u4e2d\u56fd\u7b2c\u4e00\u4e2a\u7edf\u4e00\u7684\u591a\u6c11\u65cf\u5c01\u5efa\u56fd\u5bb6\n3. \u7edf\u4e00\u4e86\u6587\u5b57\u3001\u5ea6\u91cf\u8861\u548c\u8d27\u5e01\n4. \u4fc3\u8fdb\u4e86\u6c11\u65cf\u878d\u5408', h: '\u4ece\u7edf\u4e00\u3001\u5236\u5ea6\u3001\u6587\u5316\u4e09\u4e2a\u65b9\u9762\u5206\u6790'},
            {q: '\u7b2c\u4e8c\u6b21\u4e16\u754c\u5927\u6218\u7684\u8d77\u56e0\u548c\u5f71\u54cd\u3002', a: '\u8d77\u56e0\uff1a\u6cd5\u897f\u65af\u4e3b\u4e49\u5bf9\u4e00\u6218\u540e\u79e9\u7684\u4e0d\u6ee1\uff0c\u7ecf\u6d4e\u5927\u8427\u6761\u52a0\u5267\u4e86\u77db\u76fe\n\u5f71\u54cd\uff1a\u4eba\u7c7b\u6700\u5927\u7684\u6218\u4e89\u707e\u96be\uff0c\u4fc3\u8fdb\u4e86\u8054\u5408\u56fd\u7684\u5efa\u7acb\u548c\u6c11\u65cf\u89e3\u653e\u8fd0\u52a8\u7684\u53d1\u5c55', h: '\u4ece\u8d77\u56e0\u3001\u8fc7\u7a0b\u3001\u5f71\u54cd\u4e09\u4e2a\u65b9\u9762\u5206\u6790'}
        ];
        var idx2 = rand(0, topics.length - 1);
        return {question: topics[idx2].q, answer: topics[idx2].a, type: '\u89e3\u7b54\u9898', hint: topics[idx2].h, level: level};
    },

    knowledgeDB: [
        {
            title: '当代国际关系',
            content: '冷战结束后，世界格局发生重大变化。多极化趋势明显，美国、欧盟、俄罗斯、中国、日本等成为重要力量。全球化深入发展，各国经济联系日益紧密。联合国、世界贸易组织等国际组织在国际事务中发挥重要作用。和平与发展是当今时代的主题，但地区冲突、恐怖主义、气候变化等全球性问题依然严峻。',
            difficulty: 'hard',
            tags: ['国际关系', '多极化', '全球化', '国际组织']
        },
        {
            title: '中国古代科技成就（四大发明、天文历法）',
            content: '中国古代科技成就辉煌。四大发明：造纸术（东汉蔡伦改进）、印刷术（北宋毕昇发明活字印刷）、火药（唐末用于军事）、指南针（宋代应用于航海）。天文历法：张衡发明地动仪和浑天仪，郭守敬编订《授时历》（精度与现行公历相当），祖冲之精确计算圆周率到小数点后七位。这些成就推动了世界文明的进步。',
            difficulty: 'medium',
            tags: ['四大发明', '造纸术', '印刷术', '火药', '指南针', '天文历法']
        },
        {
            title: '世界两次大战对比',
            content: '第一次世界大战（1914-1918年）：根源是帝国主义国家间政治经济发展不平衡，导火线是萨拉热窝事件，主要战场在欧洲，以同盟国失败告终。第二次世界大战（1939-1945年）：根源是凡尔赛-华盛顿体系的内在矛盾和法西斯主义崛起，波及全球，最终以反法西斯同盟胜利告终。两次世界大战都给人类带来巨大灾难，也推动了国际秩序和国际法的进步。',
            difficulty: 'hard',
            tags: ['第一次世界大战', '第二次世界大战', '萨拉热窝事件', '反法西斯同盟']
        },
        {
            title: '冷战时期重大事件',
            content: '冷战（1947-1991年）是美苏两大阵营之间的对峙。重大事件包括：1947年杜鲁门主义出台，标志冷战开始；1948-1949年柏林封锁；1949年北约成立；1950-1953年朝鲜战争；1962年古巴导弹危机；1961年柏林墙修建；1972年尼克松访华；1979-1989年苏联入侵阿富汗；1989年柏林墙倒塌；1991年苏联解体，冷战结束。',
            difficulty: 'hard',
            tags: ['冷战', '杜鲁门主义', '古巴导弹危机', '柏林墙', '苏联解体']
        },
        {
            title: '中国改革开放历程',
            content: '1978年十一届三中全会开启改革开放新时期。农村改革：家庭联产承包责任制解放了农村生产力。城市改革：扩大企业自主权，建立社会主义市场经济体制。对外开放：设立经济特区（深圳、珠海、汕头、厦门），开放沿海城市，加入WTO（2001年）。改革开放使中国经济快速发展，人民生活水平显著提高，综合国力大幅提升。',
            difficulty: 'medium',
            tags: ['改革开放', '家庭联产承包责任制', '经济特区', '社会主义市场经济']
        },
        {
            title: '古代文明的交流与融合',
            content: '古代文明通过战争、贸易、迁徙等方式交流融合。丝绸之路连接了中华文明、印度文明、波斯文明和地中海文明，促进了丝绸、瓷器、香料、宗教和技术的传播。亚历山大东征促进了希腊文化与东方文化的融合（希腊化时代）。阿拉伯帝国成为东西方文化交流的桥梁，保存和传播了古希腊罗马文化，并将中国四大发明传入欧洲。',
            difficulty: 'hard',
            tags: ['丝绸之路', '文明交流', '希腊化时代', '阿拉伯帝国']
        }
    ]
};
