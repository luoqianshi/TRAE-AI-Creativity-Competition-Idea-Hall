// ========== 物理科目模块 - 按学龄分类 ==========
// 智学空间 - 物理知识库与智能应答

window.SubjectModules.physics = {
    id: 'physics',
    name: '物理',
    icon: '\u26A1',

    levels: {
        kindergarten: {
            name: '幼儿园',
            topics: [
                {
                    id: 'pk-colors-light',
                    name: '颜色与光',
                    keywords: ['颜色', '彩虹', '光', '影子'],
                    knowledge: '光和颜色的基础认知：\n太阳光看起来是白色的，但实际上是由多种颜色混合而成的。\n彩虹有七种颜色：红、橙、黄、绿、蓝、靛、紫。\n影子：光被物体挡住后，在物体后面形成的暗区。有光才有影子。',
                    example: '为什么会有影子？因为光沿直线传播，被不透明的物体挡住后，光照不到的地方就形成了影子。',
                    analysis: '影子的形成需要三个条件：光源、不透明物体、屏幕（或地面）。',
                    mistakes: '常见错误：认为影子是黑色的物体。',
                    tips: '在阳光下或灯光下观察影子，用手做出各种影子造型。'
                },
                {
                    id: 'pk-hot-cold',
                    name: '冷和热',
                    keywords: ['冷', '热', '温度', '冰', '水蒸气'],
                    knowledge: '冷和热的基本概念：\n温度表示物体的冷热程度。\n水在0°C以下会结冰，在100°C会沸腾变成水蒸气。\n太阳给我们带来热量，冰块是冷的。\n热的东西会慢慢变凉，冷的东西放在温暖的地方会慢慢变热。',
                    example: '冰棍从冰箱拿出来后会慢慢融化，因为周围的空气比冰棍热，热量从空气传给冰棍。',
                    analysis: '热量总是从温度高的物体传向温度低的物体。',
                    mistakes: '常见错误：认为"冷"是一种物质（冷不是物质，是温度低的感觉）。',
                    tips: '观察生活中的冷热现象，如冰融化、水烧开。'
                }
            ]
        },
        primary: {
            name: '小学',
            topics: [
                {
                    id: 'pp-forces',
                    name: '力的初步认识',
                    keywords: ['力', '推力', '拉力', '重力', '摩擦力'],
                    knowledge: '力的基本概念：\n力是物体对物体的作用。力不能脱离物体单独存在。\n\n常见力的类型：\n推力：推物体时用的力\n拉力：拉物体时用的力\n重力：地球吸引物体的力（方向向下）\n摩擦力：阻碍物体运动的力\n弹力：物体被压缩或拉伸后恢复原状的力\n\n力的效果：\n使物体运动状态改变（加速、减速、改变方向）\n使物体形状改变（拉伸、压缩、弯曲）',
                    example: '踢足球时，脚对球施加了力，球从静止变为运动，说明力可以改变物体的运动状态。',
                    analysis: '力有两个作用效果：改变运动状态和改变形状。',
                    mistakes: '常见错误：认为力是物体本身具有的（力是物体间的相互作用）。',
                    tips: '在生活中感受各种力：推门、拉书包、摩擦地面。'
                },
                {
                    id: 'pp-simple-circuits',
                    name: '简单电路',
                    keywords: ['电路', '电池', '灯泡', '开关', '导体', '绝缘体'],
                    knowledge: '简单电路组成：\n电源（电池）：提供电能\n导线：传输电能\n用电器（灯泡、电动机）：使用电能\n开关：控制电路通断\n\n电路状态：\n通路：闭合开关，电流流通，灯泡亮\n断路：断开开关，电流不通，灯泡灭\n短路：不经过用电器直接连通，危险！\n\n导体和绝缘体：\n导体：容易导电（铜、铁、铝）\n绝缘体：不容易导电（塑料、橡胶、玻璃）',
                    example: '一个简单电路：电池正极\u2192导线\u2192开关\u2192灯泡\u2192导线\u2192电池负极。闭合开关，灯泡亮。',
                    analysis: '电流从正极出发，经过用电器，回到负极，形成完整回路。',
                    mistakes: '常见错误：短路（不经过灯泡直接连接正负极），正负极接反。',
                    tips: '用电池、导线和小灯泡做实验，理解电路的基本原理。'
                },
                {
                    id: 'pp-sound',
                    name: '声音',
                    keywords: ['声音', '振动', '传播', '噪音', '音调'],
                    knowledge: '声音的产生和传播：\n声音是由物体振动产生的。\n声音的传播需要介质（固体、液体、气体）。\n真空不能传声。\n声音在固体中传播最快，气体中最慢。\n声速：空气中约340m/s。\n\n声音的特性：\n音调：声音的高低（振动频率决定）\n响度：声音的大小（振幅决定）\n音色：声音的特色（发声体材料决定）\n\n噪音：\n不规则振动产生的令人不愉快的声音。\n控制噪音：声源处、传播过程中、接收处。',
                    example: '敲鼓时鼓面振动，发出声音。用力敲鼓面振动幅度大，声音响度大。',
                    analysis: '振动产生声音，振幅决定响度，频率决定音调。',
                    mistakes: '常见错误：认为声音可以在真空中传播。',
                    tips: '用橡皮筋做实验：拉紧时音调高，放松时音调低。'
                }
            ]
        },
        junior: {
            name: '初中',
            topics: [
                {
                    id: 'pj-newton-laws',
                    name: '牛顿运动定律',
                    keywords: ['牛顿', '运动定律', '惯性', '加速度', '力的作用'],
                    knowledge: '牛顿三大定律：\n\n第一定律（惯性定律）：\n一切物体在没有受到力的作用时，总保持静止状态或匀速直线运动状态。\n惯性：物体保持原来运动状态不变的性质。\n\n第二定律：F = ma\n物体的加速度与所受合力成正比，与质量成反比。\n\n第三定律：作用力与反作用力\n两个物体之间的作用力和反作用力总是大小相等、方向相反、作用在同一直线上。',
                    example: '公交车急刹车时，乘客会向前倾倒。\n解释：乘客原来随车向前运动，刹车时身体由于惯性要保持原来的运动状态，所以向前倾。',
                    analysis: '惯性是物体的固有属性，质量越大惯性越大。',
                    mistakes: '常见错误：认为惯性是一种力（惯性是性质不是力），混淆惯性和力。',
                    tips: '用生活中的例子理解惯性：急刹车、抖落衣服上的灰尘。'
                },
                {
                    id: 'pj-work-energy',
                    name: '功与能',
                    keywords: ['功', '功率', '动能', '势能', '机械能', '机械效率'],
                    knowledge: '功：W = Fs（力×在力的方向上的距离）\n单位：焦耳（J）\n做功条件：有力作用在物体上，且物体在力的方向上移动了距离。\n\n功率：P = W/t（功/时间）\n单位：瓦特（W）\n表示做功的快慢。\n\n动能：物体由于运动而具有的能\nEk = ½mv²\n\n重力势能：物体由于被举高而具有的能\nEp = mgh\n\n机械能守恒：在只有重力做功的情况下，动能和势能可以相互转化，但机械能总量不变。',
                    example: '一个1kg的球从2m高处自由下落（g=10m/s²），求落地时的速度。\nmgh = ½mv²\nv² = 2gh = 2×10×2 = 40\nv = √40 ≈ 6.3 m/s',
                    analysis: '用机械能守恒定律，重力势能全部转化为动能。',
                    mistakes: '常见错误：做功条件判断错误（搬而不动不做功），功率和功混淆。',
                    tips: '记住做功的两个必要条件，功率表示做功快慢不是做功多少。'
                },
                {
                    id: 'pj-electricity-j',
                    name: '电学基础',
                    keywords: ['电流', '电压', '电阻', '欧姆定律', '串联', '并联'],
                    knowledge: '电学三大物理量：\n电流（I）：电荷的定向移动，单位安培（A）\n电压（U）：推动电流的原因，单位伏特（V）\n电阻（R）：导体对电流的阻碍，单位欧姆（\u03a9）\n\n欧姆定律：I = U/R\n电流与电压成正比，与电阻成反比。\n\n串联电路：\n电流处处相等：I = I₁ = I₂\n电压之和等于总电压：U = U₁ + U₂\n电阻之和等于总电阻：R = R₁ + R₂\n\n并联电路：\n电压处处相等：U = U₁ = U₂\n电流之和等于总电流：I = I₁ + I₂\n1/R = 1/R₁ + 1/R₂',
                    example: '一个5\u03a9和一个10\u03a9的电阻串联，接在15V电源上，求电流。\nR总 = 5+10 = 15\u03a9\nI = U/R = 15/15 = 1A',
                    analysis: '串联电阻直接相加，用欧姆定律求电流。',
                    mistakes: '常见错误：串联和并联的电阻公式搞混，电流电压关系记错。',
                    tips: '串联分压（电压分配），并联分流（电流分配）。'
                }
            ]
        },
        senior: {
            name: '高中',
            topics: [
                {
                    id: 'ps-kinematics',
                    name: '运动学',
                    keywords: ['运动学', '匀变速', '自由落体', '平抛', '圆周运动'],
                    knowledge: '匀变速直线运动公式：\nv = v₀ + at\ns = v₀t + ½at²\nv² = v₀² + 2as\n\n自由落体（v₀=0, a=g）：\nv = gt, h = ½gt², v² = 2gh\n\n平抛运动：\n水平方向：匀速直线运动 x = v₀t\n竖直方向：自由落体 y = ½gt²\n\n圆周运动：\n线速度 v = 2πr/T = \u03c9r\n向心加速度 a = v²/r = \u03c9²r\n向心力 F = mv²/r = m\u03c9²r',
                    example: '从20m高处自由落体（g=10m/s²），求落地时间和速度。\nh = ½gt² \u2192 20 = ½×10×t² \u2192 t² = 4 \u2192 t = 2s\nv = gt = 10×2 = 20 m/s',
                    analysis: '自由落体是初速度为零的匀加速运动，加速度为g。',
                    mistakes: '常见错误：平抛运动忘记分解为水平和竖直两个方向，向心力公式记错。',
                    tips: '平抛运动先分解再合成，圆周运动抓住向心力公式。'
                },
                {
                    id: 'ps-electromagnetic',
                    name: '电磁学',
                    keywords: ['电磁感应', '安培力', '洛伦兹力', '法拉第', '楞次定律'],
                    knowledge: '安培力：F = BIL（磁场对电流的力）\n方向：左手定则\n\n洛伦兹力：F = qvB（磁场对运动电荷的力）\n方向：左手定则\n\n电磁感应（法拉第定律）：\n感应电动势 \u03b5 = -N\u0394\u03a6/\u0394t\n磁通量变化率越大，感应电动势越大。\n\n楞次定律：\n感应电流的方向，总是使感应电流的磁场阻碍引起感应电流的磁通量的变化。\n\n右手定则：\n判断感应电流方向',
                    example: '一个面积为0.1m²的线圈在0.5T的匀强磁场中，磁通量在0.2s内从0变为0.05Wb，求感应电动势。\n\u03b5 = \u0394\u03a6/\u0394t = 0.05/0.2 = 0.25V',
                    analysis: '用法拉第电磁感应定律，感应电动势等于磁通量变化率。',
                    mistakes: '常见错误：左手定则和右手定则搞混，楞次定律中"阻碍"理解错误。',
                    tips: '记住"左力右电"：左手定则判断力，右手定则判断电流方向。'
                },
                {
                    id: 'ps-thermodynamics',
                    name: '热学',
                    keywords: ['热学', '理想气体', '内能', '热力学定律', '熵'],
                    knowledge: '理想气体状态方程：PV = nRT\n\n热力学第一定律：\n\u0394U = Q + W\n内能变化 = 吸收热量 + 对外做功\n\n热力学第二定律：\n热量不能自发地从低温物体传到高温物体。\n（热力学过程有方向性）\n\n熵增原理：\n孤立系统的熵永不减少。\n自然过程总是向着熵增加的方向进行。',
                    example: '一定质量的理想气体，压强为2atm，体积为10L，温度为300K。若温度升高到600K，体积不变，求压强。\nP₁/T₁ = P₂/T₂\nP₂ = P₁×T₂/T₁ = 2×600/300 = 4atm',
                    analysis: '体积不变时，压强与热力学温度成正比（查理定律）。',
                    mistakes: '常见错误：混淆三个气体定律的条件（等温、等压、等容）。',
                    tips: '记住理想气体状态方程PV=nRT，根据条件选择适当的定律。'
                }
            ]
        },
        vocational: {
            name: '职高',
            topics: [
                {
                    id: 'pv-practical-electricity',
                    name: '实用电工知识',
                    keywords: ['电工', '家庭电路', '安全用电', '电表', '保险丝'],
                    knowledge: '家庭电路：\n进户线\u2192电能表\u2192总开关\u2192保险丝\u2192用电器\n\n安全用电：\n不接触低压带电体，不靠近高压带电体\n湿手不碰开关和电器\n金属外壳电器要接地线\n\n家庭电路电压：220V\n频率：50Hz\n\n常见故障：\n短路：电流过大，保险丝熔断\n断路：某处接触不良或断开\n漏电：电流通过人体，非常危险',
                    example: '一个家庭有100W灯泡2个，200W电视1台，2000W空调1台，同时使用时总电流多少？\n总功率 = 200+200+2000 = 2400W\n总电流 = P/U = 2400/220 \u2248 10.9A',
                    analysis: '家庭电路中各用电器并联，总功率等于各用电器功率之和。',
                    mistakes: '常见错误：同时使用大功率电器导致电路过载。',
                    tips: '了解家庭电路总功率限制，避免同时使用过多大功率电器。'
                }
            ]
        },
        university: {
            name: '大学',
            topics: [
                {
                    id: 'pu-quantum-mechanics',
                    name: '量子力学基础',
                    keywords: ['量子力学', '波函数', '薛定谔方程', '不确定性原理', '量子态'],
                    knowledge: '量子力学基本概念：\n\n波粒二象性：\n微观粒子同时具有波动性和粒子性。\n德布罗意波长：\u03bb = h/p\n\n不确定性原理（海森堡）：\n\u0394x\u00b7\u0394p \u2265 \u0127/2\n不可能同时精确测量位置和动量。\n\n薛定谔方程：\ni\u0127\u2202\u03a8/\u2202t = H\u03a8\n描述量子态随时间的演化。\n\n量子态：\n用波函数\u03a8描述，|\u03a8|²表示概率密度。\n\n量子力学基本假设：\n态叠加原理、测量坍缩、薛定谔方程',
                    example: '一个电子被限制在一维无限深势阱中，宽度为L，求基态能量。\nE₁ = h²/(8mL²) = \u03c0²\u0127²/(2mL²)\n其中h为普朗克常数，m为电子质量。',
                    analysis: '无限深势阱中粒子的能量是量子化的，只能取分立值。',
                    mistakes: '常见错误：用经典力学处理微观粒子问题，混淆波函数和概率。',
                    tips: '量子力学概念抽象，多做习题理解数学形式背后的物理意义。'
                },
                {
                    id: 'pu-relativity',
                    name: '相对论基础',
                    keywords: ['相对论', '爱因斯坦', '光速', '时间膨胀', '质能方程'],
                    knowledge: '狭义相对论（1905年）：\n\n基本假设：\n1. 光速不变原理：真空中光速c对所有观察者相同\n2. 相对性原理：物理定律在所有惯性系中形式相同\n\n主要结论：\n时间膨胀：\u0394t = \u0394t\u2080/\u221a(1-v\u00b2/c\u00b2)\n长度收缩：L = L\u2080\u221a(1-v\u00b2/c\u00b2)\n质能方程：E = mc²\n\n广义相对论（1915年）：\n引力是时空弯曲的表现。\n质量告诉时空如何弯曲，时空告诉物质如何运动。',
                    example: '一个飞船以0.8c的速度飞行，飞船上的钟走了1年，地球上过了多少年？\n\u0394t = 1/\u221a(1-0.64) = 1/\u221a0.36 = 1/0.6 \u2248 1.67年\n地球上过了约1.67年。',
                    analysis: '速度越接近光速，时间膨胀效应越明显。',
                    mistakes: '常见错误：混淆时间膨胀和长度收缩的公式，不理解参考系的概念。',
                    tips: '相对论的核心是光速不变，所有效应都源于此。'
                }
            ]
        }
    },

    levelKeywords: {
        kindergarten: ['幼儿园', '学前', '启蒙'],
        primary: ['小学', '小学科学', '小学物理'],
        junior: ['初中', '八年级', '九年级', '初三', '中考物理'],
        senior: ['高中', '高一', '高二', '高三', '高考物理'],
        vocational: ['职高', '中职', '电工'],
        university: ['大学', '大学物理', '量子力学', '相对论']
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
            var topic = levelData.topics[i]; var score = 0;
            if (topic.keywords) { for (var j = 0; j < topic.keywords.length; j++) { if (q.includes(topic.keywords[j].toLowerCase())) score += topic.keywords[j].length >= 4 ? 3 : 2; } }
            if (q.includes(topic.name.toLowerCase())) score += 5;
            if (score > bestScore) { bestScore = score; bestMatch = topic; }
        }
        return bestScore >= 2 ? bestMatch : null;
    },

    handle: function(question, cleanQ, context) {
        if (!question) return null;
        // 排除具体计算题，让内置处理器处理
        var qLower = question.toLowerCase();
        if (/质量.*加速度|加速度.*质量|合力.*质量|f\s*=\s*ma|\d+\s*[k千]?[g克].*\d+.*合力/.test(qLower)) {
            return null;
        }
        var level = this.detectLevel(question, context);
        var knowledge = this.findKnowledge(question, level);
        if (knowledge) { return teach(knowledge.name, knowledge.knowledge, knowledge.example, knowledge.analysis, knowledge.mistakes, knowledge.tips); }
        var allLevels = ['kindergarten', 'primary', 'junior', 'senior', 'vocational', 'university'];
        for (var i = 0; i < allLevels.length; i++) {
            if (allLevels[i] === level) continue;
            knowledge = this.findKnowledge(question, allLevels[i]);
            if (knowledge) { return teach(knowledge.name + '\uff08' + this.levels[allLevels[i]].name + '\uff09', knowledge.knowledge, knowledge.example, knowledge.analysis, knowledge.mistakes, knowledge.tips); }
        }
        return null;
    },

    generateProblem: function(difficulty, type) {
        var rand = function(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };
        var d = difficulty || '\u4e2d\u7b49';
        var t = type || '\u89e3\u7b54\u9898';
        var levelMap = {'\u7b80\u5355': 'primary', '\u4e2d\u7b49': 'junior', '\u56f0\u96be': 'senior', '\u6311\u6218': 'university'};
        var level = levelMap[d] || 'junior';

        if (t === '\u9009\u62e9\u9898') {
            var problems = [
                {q: '一个物体受到10N的力，移动了5m，做的功是：\nA. 2J  B. 50J  C. 15J  D. 0.5J', a: 'B', h: 'W=Fs'},
                {q: '欧姆定律的表达式是：\nA. I=U/R  B. U=IR  C. R=U/I  D. 以上都是', a: 'D', h: 'I=U/R\u53ef\u4ee5\u53d8\u5f62'},
                {q: '自由落体运动的加速度约为：\nA. 8.9 m/s\u00b2  B. 10 m/s\u00b2  C. 9.8 m/s\u00b2  D. 11 m/s\u00b2', a: 'C', h: 'g\u22489.8m/s\u00b2'}
            ];
            var idx = rand(0, problems.length - 1);
            return {question: problems[idx].q, answer: problems[idx].a, type: '\u9009\u62e9\u9898', hint: problems[idx].h, level: level};
        }

        var topics = [
            {q: '一个2kg的物体从10m高处自由下落（g=10m/s\u00b2），求落地速度和下落时间。', a: 't = \u221a(2h/g) = \u221a(20/10) = \u221a2 \u2248 1.41s\nv = gt = 10\u00d71.41 = 14.1 m/s', h: '\u81ea\u7531\u843d\u4f53\u516c\u5f0f'},
            {q: '一个5\u03a9\u548c\u4e00\u4e2a10\u03a9\u7684\u7535\u963b\u5e76\u8054\uff0c\u63a5\u572810V\u7535\u6e90\u4e0a\uff0c\u6c42\u603b\u7535\u6d41\u3002', a: '1/R = 1/5 + 1/10 = 3/10\nR = 10/3 \u03a9\nI = U/R = 10/(10/3) = 3A', h: '\u5e76\u8054\u7535\u963b\u516c\u5f0f'},
            {q: '\u7528\u725b\u987f\u7b2c\u4e00\u5b9a\u5f8b\u89e3\u91ca\u4e3a\u4ec0\u4e48\u6025\u5239\u8f66\u65f6\u4e58\u5ba2\u4f1a\u5411\u524d\u503e\u3002', a: '\u4e58\u5ba2\u539f\u6765\u968f\u8f66\u5411\u524d\u8fd0\u52a8\uff0c\u5239\u8f66\u65f6\u8f66\u51cf\u901f\uff0c\u4f46\u4e58\u5ba2\u7531\u4e8e\u60ef\u6027\u4fdd\u6301\u539f\u6765\u7684\u8fd0\u52a8\u72b6\u6001\uff0c\u6240\u4ee5\u5411\u524d\u503e\u3002', h: '\u60ef\u6027\u662f\u7269\u4f53\u4fdd\u6301\u539f\u6765\u8fd0\u52a8\u72b6\u6001\u7684\u6027\u8d28'}
        ];
        var idx2 = rand(0, topics.length - 1);
        return {question: topics[idx2].q, answer: topics[idx2].a, type: '\u89e3\u7b54\u9898', hint: topics[idx2].h, level: level};
    },

    knowledgeDB: [
        {
            title: '热力学基础',
            content: '热力学是研究热现象的科学。热力学第一定律：能量守恒在热现象中的表现。热力学第二定律：热量不能自发地从低温物体传到高温物体。熵：系统混乱程度的度量。',
            difficulty: 'hard',
            tags: ['热力学', '能量守恒', '熵']
        },
        {
            title: '电磁感应（法拉第定律、楞次定律）',
            content: '法拉第电磁感应定律：闭合电路中感应电动势的大小与穿过该电路的磁通量变化率成正比，即ε = -dΦ/dt。楞次定律：感应电流的方向总是阻碍引起感应电流的磁通量变化。应用包括发电机、变压器、电磁炉等。',
            difficulty: 'hard',
            tags: ['电磁感应', '法拉第定律', '楞次定律', '发电机']
        },
        {
            title: '简谐振动（弹簧振子、单摆）',
            content: '简谐振动是最基本的周期性运动。弹簧振子：回复力F=-kx，周期T=2π√(m/k)。单摆：周期T=2π√(L/g)，与摆球质量无关，与摆长和重力加速度有关。简谐振动的能量在动能和势能之间转化，总机械能守恒。',
            difficulty: 'medium',
            tags: ['简谐振动', '弹簧振子', '单摆', '周期']
        },
        {
            title: '相对论基础（时间膨胀、长度收缩）',
            content: '爱因斯坦狭义相对论的两个基本假设：物理定律在所有惯性参考系中形式相同；真空中的光速在所有惯性参考系中相同。时间膨胀：运动的时钟变慢，Δt = γΔt₀。长度收缩：运动的物体在运动方向上变短，L = L₀/γ。质能方程：E=mc²。',
            difficulty: 'hard',
            tags: ['相对论', '时间膨胀', '长度收缩', '质能方程']
        },
        {
            title: '电磁波与光的波动性',
            content: '电磁波是由同相振荡且互相垂直的电场和磁场在空间中以波的形式传递动量和能量的现象。电磁波谱包括无线电波、微波、红外线、可见光、紫外线、X射线和γ射线。光的干涉、衍射和偏振现象证明了光的波动性。',
            difficulty: 'hard',
            tags: ['电磁波', '干涉', '衍射', '偏振']
        },
        {
            title: '原子结构与玻尔模型',
            content: '卢瑟福核式结构模型：原子中心有一个很小的原子核，电子绕核运动。玻尔模型引入量子化假设：电子只能在特定轨道上运动，轨道半径和能量都是量子化的。氢原子能级公式：Eₙ = -13.6/n² eV。电子跃迁时吸收或发射光子，光子能量hν = E₂ - E₁。',
            difficulty: 'hard',
            tags: ['原子结构', '玻尔模型', '能级', '电子跃迁']
        }
    ]
};
