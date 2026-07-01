/**
 * 历史沉浸式决策游戏 - 史实数据库
 * 聚焦：咸丰皇帝逃亡热河（1860年第二次鸦片战争）
 * 所有内容严格依据史实，主要参考《清史稿》《筹办夷务始末》
 */

const HISTORY_DATA = {
    // 关卡基本信息
    level: {
        id: "xianfeng_rehe",
        title: "北狩：咸丰帝的抉择",
        year: "1860年",
        period: "咸丰十年",
        location: "紫禁城 → 热河行宫",
        description: "八里桥之战惨败后，英法联军逼近北京。作为咸丰皇帝，你将面临人生中最艰难的抉择。"
    },

    // 核心史实时间轴（完整版）
    timeline: [
        { date: "1856年10月", event: "第二次鸦片战争爆发（亚罗号事件/马神甫事件）", verified: true, phase: "prelude" },
        { date: "1858年", event: "第一次大沽口之战；《天津条约》签订", verified: true, phase: "prelude" },
        { date: "1858年5月", event: "俄国趁火打劫，迫签《瑷珲条约》，割60万平方公里", verified: true, phase: "prelude" },
        { date: "1860年8月1日", event: "英法联军登陆北塘，第三次大沽口之战开始", verified: true, phase: "war" },
        { date: "1860年8月14日", event: "塘沽失守，清军退至天津", verified: true, phase: "war" },
        { date: "1860年8月21日", event: "天津失守。联军25000人、173艘舰船北上", verified: true, phase: "war" },
        { date: "1860年9月18日", event: "八里桥之战。僧格林沁2万清军vs8000联军，清军惨败", verified: true, phase: "crisis" },
        { date: "1860年9月18日", event: "通州谈判失败，清方扣押英方代表巴夏礼等39人", verified: true, phase: "crisis" },
        { date: "1860年9月21日", event: "咸丰帝召集御前会议，商议去留", verified: true, phase: "decision" },
        { date: "1860年9月22日", event: "咸丰帝凌晨从圆明园偏门出逃，以'木兰秋狝'为名北狩", verified: true, phase: "flee" },
        { date: "1860年10月6日", event: "英法联军占领圆明园，开始大规模劫掠", verified: true, phase: "disaster" },
        { date: "1860年10月13日", event: "清军不战而让出安定门，联军控制北京", verified: true, phase: "fall" },
        { date: "1860年10月18日", event: "额尔金下令焚毁圆明园，大火烧两天两夜", verified: true, phase: "disaster" },
        { date: "1860年10月24日", event: "恭亲王奕訢与英国签订《北京条约》", verified: true, phase: "treaty" },
        { date: "1860年10月25日", event: "恭亲王奕訢与法国签订《北京条约》", verified: true, phase: "treaty" },
        { date: "1860年11月14日", event: "俄国迫签《中俄北京条约》，再割40万平方公里", verified: true, phase: "treaty" },
        { date: "1861年8月22日", event: "咸丰帝病逝于热河行宫烟波致爽殿，终年31岁", verified: true, phase: "death" },
        { date: "1861年11月", event: "辛酉政变，慈禧联合奕訢推翻顾命八大臣", verified: true, phase: "aftermath" }
    ],

    // 场景定义
    scenes: [
        {
            id: "yangxindian",
            name: "养心殿",
            description: "深夜，烛火摇曳。殿外隐约传来八百里加急的马蹄声。",
            type: "indoor",
            bgColor: "#2a1810",
            floorColor: "#4a3525",
            walls: [
                { x: 0, y: 0, w: 800, h: 20 },
                { x: 0, y: 0, w: 20, h: 600 },
                { x: 780, y: 0, w: 20, h: 600 },
                { x: 0, y: 580, w: 800, h: 20 },
                { x: 200, y: 150, w: 400, h: 10 },
                { x: 200, y: 150, w: 10, h: 300 },
                { x: 590, y: 150, w: 10, h: 300 }
            ],
            decorations: [
                { type: "desk", x: 300, y: 200, label: "御案" },
                { type: "incense", x: 400, y: 180, label: "香炉" },
                { type: "screen", x: 250, y: 350, label: "屏风" },
                { type: "bed", x: 500, y: 400, label: "龙榻" }
            ],
            exits: [
                { x: 350, y: 580, w: 100, h: 20, target: "gongmen", label: "出殿" }
            ],
            npcs: ["sushun"],
            commoners: [],
            decisionTrigger: "rehe_001"
        },
        {
            id: "gongmen",
            name: "紫禁城·午门外",
            description: "黎明前的黑暗，秋风萧瑟。远处传来隐约的炮声。",
            type: "outdoor",
            bgColor: "#1a1a2e",
            floorColor: "#3a3a4e",
            walls: [
                { x: 0, y: 0, w: 1000, h: 30 },
                { x: 0, y: 0, w: 30, h: 700 },
                { x: 970, y: 0, w: 30, h: 700 },
                { x: 0, y: 670, w: 1000, h: 30 },
                { x: 450, y: 0, w: 100, h: 80 }
            ],
            decorations: [
                { type: "gate", x: 460, y: 20, label: "午门" },
                { type: "lantern", x: 200, y: 100, label: "宫灯" },
                { type: "lantern", x: 750, y: 100, label: "宫灯" },
                { type: "carriage", x: 300, y: 500, label: "銮驾" }
            ],
            exits: [
                { x: 350, y: 0, w: 100, h: 30, target: "yangxindian", label: "返回养心殿" },
                { x: 950, y: 300, w: 30, h: 100, target: "yizhan", label: "出城" }
            ],
            npcs: ["gongqinwang", "senggelinqin"],
            commoners: ["nong", "shi"],
            decisionTrigger: "rehe_002"
        },
        {
            id: "yizhan",
            name: "北京城外·驿站",
            description: "车马备齐，大臣林立。是去是留，必须在此决断。",
            type: "outdoor",
            bgColor: "#2e2a1a",
            floorColor: "#4a4535",
            walls: [
                { x: 0, y: 0, w: 900, h: 25 },
                { x: 0, y: 0, w: 25, h: 600 },
                { x: 875, y: 0, w: 25, h: 600 },
                { x: 0, y: 575, w: 900, h: 25 }
            ],
            decorations: [
                { type: "tent", x: 150, y: 200, label: "黄罗伞" },
                { type: "horse", x: 700, y: 400, label: "御马" },
                { type: "flag", x: 400, y: 100, label: "龙旗" }
            ],
            exits: [
                { x: 0, y: 250, w: 25, h: 100, target: "gongmen", label: "回城" },
                { x: 400, y: 575, w: 100, h: 25, target: "bishushanzhuang", label: "前往热河" }
            ],
            npcs: ["gongqinwang", "senggelinqin", "yipin"],
            commoners: ["shang", "gong"],
            decisionTrigger: "rehe_003"
        },
        {
            id: "bishushanzhuang",
            name: "热河行宫·避暑山庄",
            description: "塞外秋景，行宫规模远逊于紫禁城，透着萧瑟。",
            type: "outdoor",
            bgColor: "#1a2e1a",
            floorColor: "#3a5a3a",
            walls: [
                { x: 0, y: 0, w: 1200, h: 30 },
                { x: 0, y: 0, w: 30, h: 800 },
                { x: 1170, y: 0, w: 30, h: 800 },
                { x: 0, y: 770, w: 1200, h: 30 }
            ],
            decorations: [
                { type: "pavilion", x: 300, y: 200, label: "烟波致爽殿" },
                { type: "pavilion", x: 600, y: 250, label: "澹泊敬诚殿" },
                { type: "tree", x: 100, y: 100, label: "古松" },
                { type: "tree", x: 900, y: 500, label: "古松" },
                { type: "lake", x: 800, y: 200, label: "湖区" }
            ],
            exits: [
                { x: 550, y: 0, w: 100, h: 30, target: "yanbozhishuang", label: "烟波致爽殿" },
                { x: 0, y: 350, w: 30, h: 100, target: "yizhan", label: "返回驿站" }
            ],
            npcs: ["yipin", "zaitian"],
            commoners: ["nong"],
            decisionTrigger: null
        },
        {
            id: "yanbozhishuang",
            name: "烟波致爽殿",
            description: "行宫的寝殿，简朴而冷清。",
            type: "indoor",
            bgColor: "#2a1a10",
            floorColor: "#4a3525",
            walls: [
                { x: 0, y: 0, w: 700, h: 20 },
                { x: 0, y: 0, w: 20, h: 500 },
                { x: 680, y: 0, w: 20, h: 500 },
                { x: 0, y: 480, w: 700, h: 20 }
            ],
            decorations: [
                { type: "desk", x: 200, y: 150, label: "书案" },
                { type: "bed", x: 400, y: 300, label: "御榻" }
            ],
            exits: [
                { x: 300, y: 480, w: 100, h: 20, target: "bishushanzhuang", label: "出殿" }
            ],
            npcs: ["yipin", "zaitian"],
            commoners: [],
            decisionTrigger: "rehe_004"
        }
    ],

    // NPC定义
    npcs: {
        gongqinwang: {
            id: "gongqinwang",
            name: "恭亲王·奕訢",
            title: "咸丰帝之弟",
            color: "#4169E1",
            avatar: "恭",
            bio: "道光帝第六子，咸丰帝异母弟。才华出众，后留京与英法议和，签订《北京条约》。",
            faction: "留守派",
            dialogues: {
                greeting: "皇上，臣奕訢恭请圣安。京师防务...实在堪忧。",
                topics: {
                    defense: {
                        text: "九门提督报称，八旗精锐在八里桥折损过半，京城内仅余老弱残兵约八千。僧王所部蒙古骑兵...已不堪再战。",
                        source: "《筹办夷务始末·咸丰朝》卷六十二",
                        unlocks: ["treaty"]
                    },
                    treaty: {
                        text: "英法公使照会，若我朝肯允其条件，可保京师不受兵燹。然其所求甚苛，割地赔款，丧权辱国。",
                        source: "《清史稿·恭忠亲王传》",
                        unlocks: ["opinion"]
                    },
                    opinion: {
                        text: "臣以为...皇上当以宗庙社稷为重。留得青山在，不怕没柴烧。臣愿留守北京，与夷人周旋。",
                        source: "综合史料",
                        unlocks: []
                    }
                }
            }
        },
        senggelinqin: {
            id: "senggelinqin",
            name: "僧格林沁",
            title: "科尔沁亲王",
            color: "#8B4513",
            avatar: "僧",
            bio: "蒙古科尔沁亲王，清军统帅。八里桥之战惨败后被革去爵位。",
            faction: "主战派",
            dialogues: {
                greeting: "臣僧格林沁...有负圣恩！",
                topics: {
                    battle: {
                        text: "八里桥一战，臣所部蒙古铁骑三万，迎战夷人枪炮。将士奋勇，然夷人火器犀利，我军伤亡惨重...",
                        source: "《清史稿·僧格林沁传》",
                        unlocks: ["rematch"]
                    },
                    rematch: {
                        text: "臣请集结残部，再守通州！蒙古儿郎虽败，血性犹存。只要圣驾在京，天下勤王之师必至！",
                        source: "综合史料",
                        unlocks: ["reality"]
                    },
                    reality: {
                        text: "...然臣亦知，大势已去。若皇上决意北狩，臣愿率军护送，确保圣驾安全。",
                        source: "综合史料",
                        unlocks: []
                    }
                }
            }
        },
        sushun: {
            id: "sushun",
            name: "肃顺",
            title: "御前大臣",
            color: "#2F4F4F",
            avatar: "肃",
            bio: "咸丰帝宠臣，顾命八大臣之首。后于辛酉政变中被慈禧处死。",
            faction: "近臣",
            dialogues: {
                greeting: "皇上，奴才肃顺伺候您。",
                topics: {
                    situation: {
                        text: "八百里加急，八里桥失守，夷兵已至通州。京城震动，民间已有流言...",
                        source: "《清史稿·文宗本纪》",
                        unlocks: ["advice"]
                    },
                    advice: {
                        text: "奴才以为，皇上当效法木兰秋狝，暂幸热河。京师有恭亲王留守，足以应付夷人。留得青山在...",
                        source: "综合史料",
                        unlocks: ["power"]
                    },
                    power: {
                        text: "朝中已有不稳之象。若皇上离京，奴才愿随驾护从，确保大权不致旁落。",
                        source: "综合史料（暗示其与慈禧的权力斗争）",
                        unlocks: []
                    }
                }
            }
        },
        yipin: {
            id: "yipin",
            name: "懿贵妃",
            title: "载淳生母",
            color: "#C71585",
            avatar: "懿",
            bio: "叶赫那拉氏，后来的慈禧太后。此时为咸丰帝懿贵妃，载淳生母。",
            faction: "后宫",
            dialogues: {
                greeting: "皇上，臣妾在此。淳儿已经睡下了...",
                topics: {
                    child: {
                        text: "淳儿才六岁，一路颠簸，夜里总做噩梦。臣妾只盼...能有个安稳之处。",
                        source: "综合史料（同治帝生于1856年，1860年时6岁）",
                        unlocks: ["worry"]
                    },
                    worry: {
                        text: "听说夷人凶悍，已占了圆明园？皇上龙体要紧，莫要太过忧思。臣妾看您这几日咳血又重了...",
                        source: "咸丰帝素有咯血之疾，见《清史稿》",
                        unlocks: ["future"]
                    },
                    future: {
                        text: "臣妾一介女流，不懂朝政。但淳儿是皇上唯一的骨血，还请皇上...为淳儿多做打算。",
                        source: "咸丰帝仅有一子载淳（同治帝），见《清史稿》",
                        unlocks: []
                    }
                }
            }
        },
        zaitian: {
            id: "zaitian",
            name: "载淳",
            title: "皇长子",
            color: "#FFD700",
            avatar: "淳",
            bio: "咸丰帝独子，时年六岁。1861年即位，年号同治。",
            faction: "皇子",
            dialogues: {
                greeting: "皇阿玛...儿臣给您请安。",
                topics: {
                    fear: {
                        text: "外面好吵，还有火光...皇阿玛，我们为什么要离开家？",
                        source: "综合史料（艺术化演绎）",
                        unlocks: ["dream"]
                    },
                    dream: {
                        text: "儿臣昨晚梦见一只大鹰，把宫殿都烧了。皇阿玛，我们会没事吗？",
                        source: "艺术化演绎",
                        unlocks: []
                    }
                }
            }
        }
    },

    // 决策点定义
    decisions: {
        rehe_001: {
            id: "rehe_001",
            title: "北狩前夜",
            context: "八里桥惨败的消息传来，战报摊于御案。殿外秋风萧瑟，远处隐约传来炮声。",
            timing: "进入养心殿后自动触发",
            options: [
                {
                    id: "opt_001_a",
                    text: "朕当亲征，激励三军",
                    historicalAccuracy: false,
                    consequence: "咸丰帝从未有亲征之念。此选择触发旁白纠正：'史载咸丰性多疑虑，体素羸弱，从无亲征之意。'",
                    feedback: "旁白：史书记载，咸丰帝性多疑虑，体素羸弱，从无亲征之意。您的一腔热血值得敬佩，但不符合史实。",
                    score: 0,
                    unlocks: [],
                    narratorComment: "留得青山在，不怕没柴烧。皇上龙体要紧，何必逞一时之勇？"
                },
                {
                    id: "opt_001_b",
                    text: "即刻下诏北狩，以全社稷",
                    historicalAccuracy: false,
                    consequence: "咸丰确实逃亡热河，但并非'即刻'，而是犹豫数日，并安排了留守大臣。",
                    feedback: "旁白：您选择了逃亡，但过于仓促。历史上咸丰犹豫了数日，并召集重臣安排留守事宜。",
                    score: 1,
                    unlocks: ["rehe_002"],
                    narratorComment: "说走就走？宗庙社稷、在京臣民，您就不管了？"
                },
                {
                    id: "opt_001_c",
                    text: "召恭亲王、僧格林沁即刻进宫议事",
                    historicalAccuracy: true,
                    consequence: "历史上咸丰确实召集重臣商议，这是符合史实的第一步。",
                    feedback: "旁白：善。史载咸丰于九二十一日召集御前会议，与恭亲王、僧格林沁等商议去留。这是符合史实的选择。",
                    score: 3,
                    unlocks: ["rehe_002"],
                    narratorComment: "好，先听听大臣们怎么说。这才是帝王应有的审慎。"
                },
                {
                    id: "opt_001_d",
                    text: "令京城九门紧闭，誓与北京共存亡",
                    historicalAccuracy: false,
                    consequence: "咸丰并无此决心，最终选择了北狩。",
                    feedback: "旁白：壮哉！然史书记载，咸丰并无死守京师之志。最终他还是选择了北狩。",
                    score: 1,
                    unlocks: ["rehe_002"],
                    narratorComment: "宁为玉碎，不为瓦全？可您是皇帝，不是将军。您死了，大清怎么办？"
                }
            ]
        },
        rehe_002: {
            id: "rehe_002",
            title: "人事安排",
            context: "离京在即，必须决定谁留守北京，谁随行护驾。",
            timing: "在午门外与大臣对话后触发",
            options: [
                {
                    id: "opt_002_a",
                    text: "命僧格林沁留守北京，统筹防务",
                    historicalAccuracy: false,
                    consequence: "僧格林沁随驾北上，并未留守。",
                    feedback: "旁白：僧格林沁在八里桥新败，且咸丰对其信任已减。历史上他并未留守，而是随驾北上。",
                    score: 0,
                    unlocks: [],
                    narratorComment: "败军之将，何以言勇？况且...他真的忠心吗？"
                },
                {
                    id: "opt_002_b",
                    text: "命恭亲王奕訢留守，便宜行事",
                    historicalAccuracy: true,
                    consequence: "咸丰确实命恭亲王为钦差便宜行事全权大臣，留京与英法议和。",
                    feedback: "旁白：正是。咸丰命奕訢为'钦差便宜行事全权大臣'，留京处理夷务。奕訢后签订《北京条约》。",
                    score: 3,
                    unlocks: ["rehe_003"],
                    narratorComment: "恭亲王才华出众，又是至亲。留他在京，可保无虞。"
                },
                {
                    id: "opt_002_c",
                    text: "命某汉人大臣（如曾国藩）火速来京",
                    historicalAccuracy: false,
                    consequence: "此时曾国藩正忙于镇压太平天国，且远在江南，无法即刻来京。",
                    feedback: "旁白：曾国藩此时正与太平天国作战，远在江南。远水救不了近火。",
                    score: 1,
                    unlocks: ["rehe_003"],
                    narratorComment: "曾国藩？他正和长毛打得火热呢。等他来，北京都凉透了。"
                }
            ]
        },
        rehe_003: {
            id: "rehe_003",
            title: "最后的决断",
            context: "驿站前，銮驾已备。恭亲王跪请圣驾早日成行，僧格林沁请战死守。",
            timing: "在驿站场景触发",
            options: [
                {
                    id: "opt_003_a",
                    text: "批准僧格林沁所请，令其死守通州",
                    historicalAccuracy: false,
                    consequence: "咸丰并未批准此请，而是选择北狩。",
                    feedback: "旁白：僧部已在八里桥溃散，令其再战，恐全军覆没。咸丰未采纳此议。",
                    score: 0,
                    unlocks: [],
                    narratorComment: "让残兵败将去送死？皇上，您这是在断送我大清最后的军事力量。"
                },
                {
                    id: "opt_003_b",
                    text: "否决僧王所请，令其护送圣驾北上",
                    historicalAccuracy: true,
                    consequence: "历史上咸丰确实否决了再战之请，以'木兰秋狝'为名北上。",
                    feedback: "旁白：史载咸丰以'木兰秋狝'为名，于九月二十二日启程北上。僧格林沁部残军护从。",
                    score: 3,
                    unlocks: ["rehe_004"],
                    narratorComment: "木兰秋狝...好一个体面的说法。皇上，走吧。"
                },
                {
                    id: "opt_003_c",
                    text: "朕不走了，驻跸北京，与城共存亡",
                    historicalAccuracy: false,
                    consequence: "咸丰最终选择了离开。",
                    feedback: "旁白：您选择了留守。然历史没有如果——咸丰最终离开了北京。让我们看看，如果您的选择成真...",
                    score: 1,
                    unlocks: ["alt_history_001"],
                    narratorComment: "好一个天子守国门！可惜...历史上您并没有这份勇气。"
                }
            ]
        },
        rehe_004: {
            id: "rehe_004",
            title: "热河的忧思",
            context: "抵达热河行宫已数日。今日收到急报：英法联军已于十月初六日占领圆明园。",
            timing: "在烟波致爽殿触发",
            options: [
                {
                    id: "opt_004_a",
                    text: "严令恭亲王不得议和，调天下勤王",
                    historicalAccuracy: false,
                    consequence: "此时勤王已来不及，且咸丰实际上授权了恭亲王议和。",
                    feedback: "旁白：勤王诏书到达各地需数日乃至数月。此时京城已陷，为时已晚。",
                    score: 0,
                    unlocks: [],
                    narratorComment: "远水解不了近渴。皇上，您这是在自欺欺人。"
                },
                {
                    id: "opt_004_b",
                    text: "授权恭亲王'便宜行事'，尽快议和",
                    historicalAccuracy: true,
                    consequence: "咸丰确实授权奕訢议和，最终签订《北京条约》。",
                    feedback: "旁白：善。咸丰授权恭亲王'便宜行事'，最终于十月二十四、二十五日签订《北京条约》。",
                    score: 3,
                    unlocks: ["ending_historical"],
                    narratorComment: "割地赔款，丧权辱国...但除此之外，还有别的路吗？"
                },
                {
                    id: "opt_004_c",
                    text: "沉默不语，咳血不止",
                    historicalAccuracy: true,
                    consequence: "咸丰此时确实病情加重，最终于次年八月病逝。",
                    feedback: "旁白：史载咸丰此时已忧思成疾，咯血加重。一年后，他病逝于这烟波致爽殿中。",
                    score: 2,
                    unlocks: ["ending_historical"],
                    narratorComment: "龙体为重...可惜，您已经没有多少时间了。"
                }
            ]
        }
    },

    // AI旁白台词库
    narratorLines: {
        entrance: [
            "你现在是咸丰皇帝，爱新觉罗·奕詝。大清第九位皇帝，此刻正面临人生最大的抉择。",
            "公元1860年，咸丰十年。第二次鸦片战争的战火已烧至京师。",
            "八里桥之战，三万蒙古铁骑不敌八千英法联军。你的帝国，正在崩塌。"
        ],
        idle: [
            "殿外秋风萧瑟，远处隐约传来炮声。",
            "烛火摇曳，将你的影子拉得很长。",
            "御案上的奏折堆积如山，却没有一本能带来好消息。",
            "你想起登基时的雄心壮志，如今只剩这半壁江山。",
            "太医昨日说，你的咳血症又重了。"
        ],
        guidance: [
            "你可以走近大臣，按空格或点击与他们交谈。",
            "御案上可能有未批的奏折，不妨去看看。",
            "当你做出重大决策时，历史的车轮将随之转动。",
            "注意你的一言一行——这都将被记录在史书中。"
        ],
        historicalFacts: [
            "史实提示：八里桥之战发生于1860年9月18日，清军主帅僧格林沁大败。",
            "史实提示：英法联军总人数约1.8万，却击溃了数万清军。",
            "史实提示：咸丰帝最终于9月22日以'木兰秋狝'为名，逃往热河。",
            "史实提示：恭亲王奕訢留守北京，后签订《北京条约》，割让九龙司。",
            "史实提示：圆明园于1860年10月6日被占，10月18日被焚毁。",
            "史实提示：咸丰帝于1861年8月22日病逝于热河行宫，终年31岁。"
        ],
        deviations: [
            "你似乎偏离了历史的轨迹。但历史没有如果...",
            "如果这是另一个时空，你的选择会带来什么后果？",
            "史官会如何记录这一刻？后人会如何评价？"
        ]
    },

    // 结局定义
    endings: {
        ending_historical: {
            id: "ending_historical",
            title: "历史的轨迹",
            description: "你做出了与历史一致的选择。",
            content: `1860年10月24-25日，恭亲王奕訢与英国公使额尔金、法国公使葛罗分别签订《北京条约》。

条约主要内容：
- 割让九龙司地方一区给英国
- 赔偿英法军费各增至800万两白银
- 天津开埠
- 准许华工出国

1861年8月22日，咸丰帝病逝于热河行宫烟波致爽殿，终年31岁。其子载淳即位，年号同治。

历史评价：
咸丰帝的北狩被后人视为懦弱之举，但在当时的军事形势下，这或许是最现实的选择。他的逃离保留了清朝的政治核心，但也彻底暴露了帝国的虚弱。`,
            historicalNote: "本结局基于《清史稿》《筹办夷务始末》等史料。"
        },
        alt_history_001: {
            id: "alt_history_001",
            title: "如果历史可以重来",
            description: "你选择了留守北京，与城共存亡。",
            content: `你选择了留守北京。

假设推演：
英法联军于10月6日攻破北京外城。由于缺乏统一指挥，清军抵抗混乱。10月8日，联军攻入内城。

你被俘的可能性极低——英法联军的目标并非推翻清朝，而是获取条约利益。但作为皇帝被俘，将彻底摧毁清廷的统治合法性。

更可能的结果是：联军占领北京后，以你为筹码提出更苛刻的条件。各地督抚陷入混乱，太平天国趁机扩张。清朝提前崩溃，中国陷入军阀割据...

当然，这只是推演。历史没有如果。`,
            historicalNote: "此推演基于当时军事实力对比和列强战略目标进行的合理假设，非真实历史。"
        }
    },

    // ============================================
    // 国力与国际局势数据
    // ============================================
    geopolitics: {
        // 清朝国力（1860年）
        qingPower: {
            finance: {
                label: "户部存银",
                value: "不足10万两",
                trend: "down",
                detail: "太平天国战争已耗费近3亿两白银，中央财政实质破产，京官俸禄都难以发放。咸丰被迫发行官票宝钞，导致恶性通胀。",
                source: "《清实录》"
            },
            military: {
                label: "可调动兵力",
                value: "约8万（京师）",
                trend: "down",
                detail: "八里桥惨败后，京师精锐尽失。八旗20万编制虚存，湘军3万远在江南。蒙古骑兵在火器面前不堪一击。",
                source: "《清史稿·兵志》"
            },
            population: {
                label: "全国人口",
                value: "约3.5亿",
                trend: "down",
                detail: "太平天国战争导致人口从4.3亿锐减至3.5亿。江苏浙江两省从6000万减至3000万，江西损失超50%。",
                source: "《清实录》"
            },
            morale: {
                label: "民心士气",
                value: "崩溃边缘",
                trend: "down",
                detail: "北京城内物价飞涨、难民涌入、商铺关门。皇帝弃城出逃的消息传开后，民间舆论一片哗然。",
                source: "《庚申夷氛纪略》"
            }
        },
        // 国际局势
        foreignPowers: [
            {
                id: "britain",
                name: "英国",
                flag: "英",
                color: "#003366",
                force: "18000人",
                goal: "强迫中国开放更多通商口岸，获取鸦片贸易合法化",
                status: "从天津向北京推进中",
                location: "天津→通州→北京",
                source: "额尔金率远征军",
                threat: 5
            },
            {
                id: "france",
                name: "法国",
                flag: "法",
                color: "#003399",
                force: "7000人",
                goal: "获取与英国同等的在华特权，扩大天主教传教权",
                status: "与英军联合北进",
                location: "天津→通州→北京",
                source: "葛罗率法军",
                threat: 4
            },
            {
                id: "russia",
                name: "俄国",
                flag: "俄",
                color: "#660033",
                force: "无直接军事行动",
                goal: "趁火打劫，夺取中国东北领土",
                status: "已在黑龙江北岸大规模移民",
                location: "外东北·海参崴",
                source: "穆拉维约夫",
                threat: 5,
                detail: "1858年《瑷珲条约》已割60万平方公里，1860年即将再割40万平方公里。不费一兵一卒，夺取约100万平方公里。"
            },
            {
                id: "usa",
                name: "美国",
                flag: "美",
                color: "#333333",
                force: "无军事行动",
                goal: "利用英法军事压力获取同等商业特权",
                status: "扮演'调停者'实则趁火打劫",
                location: "海上",
                source: "华若翰",
                threat: 2
            },
            {
                id: "taiping",
                name: "太平天国",
                flag: "太",
                color: "#993300",
                force: "数十万",
                goal: "推翻清朝，建立天国",
                status: "1860年军事巅峰期，二破江南大营",
                location: "南京→苏南→浙江",
                source: "洪秀全/李秀成/陈玉成",
                threat: 5,
                detail: "控制南京至苏州一带富庶区域。清军主力正被其牵制在南方，无法北上勤王。"
            }
        ],
        // 战争形势图数据
        warMap: {
            title: "1860年北方战场形势",
            phases: [
                { label: "8月1日", event: "英法联军登陆大沽口", type: "attack" },
                { label: "8月21日", event: "天津失守", type: "fall" },
                { label: "9月18日", event: "八里桥之战", type: "battle" },
                { label: "9月22日", event: "咸丰帝出逃", type: "flee" },
                { label: "10月6日", event: "圆明园被劫", type: "disaster" },
                { label: "10月18日", event: "圆明园焚毁", type: "disaster" },
                { label: "10月24日", event: "签订《北京条约》", type: "treaty" }
            ]
        }
    },

    // ============================================
    // 工商士农阶层NPC
    // ============================================
    commoners: {
        shi: {
            id: "shi",
            name: "赵秀才",
            title: "落第举人",
            color: "#4a7a4a",
            avatar: "赵",
            bio: "京师太学的一名落第举人。科场失意，如今困守城中，眼见帝国风雨飘摇。",
            class: "士",
            dialogues: {
                greeting: "学生给皇上请安...学生本是河南举人，三试不第，困顿京师已三年。",
                topics: {
                    exam: {
                        text: "科举本是正途，可如今国难当头，学生觉得这八股文章写得再好，又有什么用？连洋人的火枪都挡不住...",
                        source: "1860年科举仍在举行，但许多士子已对体制失去信心",
                        unlocks: ["gentry"]
                    },
                    gentry: {
                        text: "听说南方各省，士绅们已不再等朝廷的旨意了。曾国藩在湖南拉起了团练，各省督抚各自为战...朝廷对地方，怕是控制不住了。",
                        source: "太平天国战争导致军权下移，地方督抚自行筹饷练兵",
                        unlocks: ["refugee"]
                    },
                    refugee: {
                        text: "学生亲眼所见——八里桥溃兵退回京城，沿街乞讨，有人连刀都卖了换馒头。堂堂八旗勇士，落魄至此...",
                        source: "《庚申夷氛纪略》记载溃兵涌入京城的惨状",
                        unlocks: []
                    }
                }
            }
        },
        gong: {
            id: "gong",
            name: "陈铁匠",
            title: "京城铁匠",
            color: "#7a6a4a",
            avatar: "陈",
            bio: "京城南城的一名铁匠，祖辈三代打铁。如今战事吃紧，官府强征铁料铸炮。",
            class: "工",
            dialogues: {
                greeting: "小人给万岁爷磕头了！小人就是个打铁的，不懂什么大事。",
                topics: {
                    craft: {
                        text: "这仗打得...官府前月来征了小人的铁料，说要铸炮。可那洋人的火炮，岂是咱这土法子能比的？听说他们的大炮一炮能轰塌一面墙...",
                        source: "清军火炮技术与英法联军存在代差",
                        unlocks: ["weapon"]
                    },
                    weapon: {
                        text: "小人听当兵的说，咱们的弓箭射不到洋人跟前，人家的枪弹就已经到了。蒙古铁骑冲上去，被排枪打得人仰马翻...",
                        source: "八里桥之战中蒙古骑兵不敌英法排枪",
                        unlocks: ["thirteen"]
                    },
                    thirteen: {
                        text: "小人有个师兄，早年在广州十三行做铜活儿。十三行散了以后，他跟一批人回了内地。听他说，南边的工坊也快撑不住了，洋货又便宜又好，手艺人活不下去了。",
                        source: "1842年后广州十三行没落，数十万手工业者失业",
                        unlocks: []
                    }
                }
            }
        },
        shang: {
            id: "shang",
            name: "王掌柜",
            title: "绸缎庄掌柜",
            color: "#8a7a5a",
            avatar: "王",
            bio: "前门外大栅栏绸缎庄的掌柜。战事一来，商铺关门，但他是京城消息灵通之人。",
            class: "商",
            dialogues: {
                greeting: "掌柜的给万岁爷请安！这年头生意难做啊...",
                topics: {
                    price: {
                        text: "万岁爷有所不知，这几个月物价翻了三倍不止！户部发的那些官票，没人肯要。米铺老板说，收了官票就等于收了废纸。百姓们只认银子和铜钱。",
                        source: "1853年起发行户部官票、大清宝钞，导致恶性通胀",
                        unlocks: ["shop"]
                    },
                    shop: {
                        text: "大栅栏的铺子关了一大半。掌柜们都跑了，带不走的货被溃兵抢了个精光。小人还守着，是因为跑也跑不了了——出城的路都堵着呢。",
                        source: "八里桥战败后北京城内商铺大量歇业",
                        unlocks: ["shanghai"]
                    },
                    shanghai: {
                        text: "万岁爷，小人听说上海那边倒是热闹。洋人在上海开了不少洋行，听说有个新行当叫'买办'，专门替洋人跑腿做买卖，赚了不少银子。有人说，将来做生意的中心不在北京了...",
                        source: "1860年上海已取代广州成为最大贸易口岸，买办阶层萌芽",
                        unlocks: []
                    }
                }
            }
        },
        nong: {
            id: "nong",
            name: "老李头",
            title: "逃难老农",
            color: "#6a5a3a",
            avatar: "李",
            bio: "从通州郊外逃进京城的老农。家园被战火摧毁，一家老小流离失所。",
            class: "农",
            dialogues: {
                greeting: "老汉...老汉给皇上磕头了。老汉是通州李家庄的，洋人来了，村子没了...",
                topics: {
                    war: {
                        text: "那天...洋人的大炮轰了一整天。老汉家的房子塌了，老伴被炮弹吓死了...村里死了好几十口人。老汉带着孙子跑了三天才到京城。",
                        source: "八里桥战役周边平民受害记载",
                        unlocks: ["land"]
                    },
                    land: {
                        text: "老汉种了一辈子地，交粮纳税从没断过。可这些年税越来越重，先是太平军闹，又是洋人打，官府还要征粮征夫...种地的人活不下去啊。",
                        source: "太平天国战争期间农民受三重压迫",
                        unlocks: ["hope"]
                    },
                    hope: {
                        text: "老汉不懂什么大道理。就知道庄稼人要地种、有口饭吃。可如今连这点都保不住了...皇上，老汉求您，别让洋人再打过来了...",
                        source: "艺术化演绎（基于当时农民处境）",
                        unlocks: []
                    }
                }
            }
        }
    },

    // ============================================
    // 场景氛围增强（各场景的环境叙事文本）
    // ============================================
    atmosphere: {
        yangxindian: {
            ambient: [
                "殿内烛火微弱，御案上摊着几本尚未批阅的奏折，墨迹已经干涸。",
                "角落里的铜炉还冒着淡淡的香烟，却掩盖不住殿外隐约传来的哭声。",
                "龙案上放着一碗未动过的燕窝粥——太医再三嘱咐您要保重龙体。"
            ],
            sounds: ["远处隐约的马蹄声", "殿外侍卫的低声交谈", "风穿过窗棂的呜咽声"],
            mood: "压抑、紧迫"
        },
        gongmen: {
            ambient: [
                "午门城楼上空无一人，往日守卫的御林军已调往前线。城门半掩，秋风卷着落叶旋入。",
                "远处天际线隐约可见火光——那是通州方向。炮声隆隆，一下比一下近。",
                "几个溃兵瘫坐在城墙根下，衣衫褴褛，有人低声啜泣。他们已无力再战。"
            ],
            sounds: ["远处隆隆炮声", "溃兵的低声啜泣", "秋风卷动落叶"],
            mood: "肃杀、悲壮"
        },
        yizhan: {
            ambient: [
                "驿站外停着几辆沾满泥泞的马车，车帘后隐约可见妇人的身影。随行的宫眷们已在车内枯坐多时。",
                "地上散落着来不及收拾的行李——有人连御膳帐篷都落下了，仓皇程度可见一斑。",
                "路边一个老农带着孙子蜷缩在墙角，眼中满是茫然。逃难的人越来越多。"
            ],
            sounds: ["马匹嘶鸣", "妇人的低泣", "车轮碾过碎石声"],
            mood: "仓皇、混乱"
        },
        bishushanzhuang: {
            ambient: [
                "避暑山庄虽名'避暑'，如今却是避难。行宫规模远逊紫禁城，殿内陈设简陋，透着萧瑟。",
                "咸丰帝到热河后从北京调来升平署戏班，分三批前来。在国难当头之际，沉迷听戏...殿内隐约传来戏腔。",
                "万树园的树叶已经开始泛黄，塞外的秋风比北京更冷了几分。行宫的炭火供应不足，宫人们裹紧了棉衣。"
            ],
            sounds: ["远处戏班的唱腔", "塞外风声", "枯叶簌簌声"],
            mood: "萧瑟、凄凉"
        },
        yanbozhishuang: {
            ambient: [
                "烟波致爽殿是咸丰的寝殿。匾额为木质漆地、阴刻楷书填石绿字，做工简陋，似乎是大清国气数已尽的象征。",
                "案头堆着各地急报——圆明园被占、联军入城...每一本都是噩耗。"
            ],
            sounds: ["咳嗽声", "翻动奏折的沙沙声", "窗外夜风吹拂"],
            mood: "沉寂、悲凉"
        }
    }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HISTORY_DATA;
}