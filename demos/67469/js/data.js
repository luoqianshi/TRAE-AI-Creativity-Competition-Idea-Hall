const MockData = {
  categories: [
    { id: 'handmade', name: '手工编织', icon: '🧶', color: 'pink' },
    { id: 'painting', name: '绘画艺术', icon: '🎨', color: 'purple' },
    { id: 'photography', name: '摄影技巧', icon: '📷', color: 'blue' },
    { id: 'cooking', name: '手作美食', icon: '🍳', color: 'orange' },
    { id: 'editing', name: '数码剪辑', icon: '🎬', color: 'green' }
  ],

  courses: [
    {
      id: 'c1',
      title: '零基础学编织：认识手工世界',
      category: 'handmade',
      difficulty: 'beginner',
      duration: 20,
      description: '完全零基础入门，了解手工编织是什么，需要准备什么，开启你的手工之旅。',
      cover: '🧶',
      learners: 5286,
      chapters: [
        { title: '什么是手工编织', duration: 5, content: '介绍编织的历史和种类' },
        { title: '需要准备的工具', duration: 8, content: '棒针、钩针、毛线的选择' },
        { title: '第一个小作品', duration: 7, content: '织一个简单的杯垫' }
      ]
    },
    {
      id: 'c2',
      title: '棒针编织初级：围巾入门课',
      category: 'handmade',
      difficulty: 'elementary',
      duration: 45,
      description: '学习基础棒针针法，亲手织出第一条温暖的围巾。',
      cover: '🧣',
      learners: 3892,
      chapters: [
        { title: '起针方法', duration: 10, content: '学习常用起针技巧' },
        { title: '下针与上针', duration: 15, content: '掌握基础针法' },
        { title: '围巾编织', duration: 20, content: '完整围巾编织流程' }
      ]
    },
    {
      id: 'c3',
      title: '钩针中级：可爱玩偶制作',
      category: 'handmade',
      difficulty: 'intermediate',
      duration: 90,
      description: '学习钩针进阶技巧，制作萌趣十足的手工玩偶。',
      cover: '🧸',
      learners: 2156,
      chapters: [
        { title: '钩针进阶针法', duration: 20, content: '长针、长长针、枣形针' },
        { title: '玩偶头部制作', duration: 25, content: '圆形钩织技巧' },
        { title: '身体与四肢', duration: 25, content: '立体钩织方法' },
        { title: '组装与表情', duration: 20, content: '缝合与表情刺绣' }
      ]
    },
    {
      id: 'c4',
      title: '棒针高级：毛衣设计与编织',
      category: 'handmade',
      difficulty: 'advanced',
      duration: 180,
      description: '从测量尺寸到完整编织，打造专属于你的手工毛衣。',
      cover: '🧥',
      learners: 876,
      chapters: [
        { title: '尺寸测量与计算', duration: 30, content: '毛衣尺寸设计基础' },
        { title: '领部与肩线', duration: 40, content: '各种领型编织方法' },
        { title: '袖山与衣身', duration: 60, content: '减针加针技巧' },
        { title: '收尾与整理', duration: 50, content: '缝合定型技巧' }
      ]
    },
    {
      id: 'c5',
      title: '编织大师：原创设计与工艺精通',
      category: 'handmade',
      difficulty: 'master',
      duration: 300,
      description: '探索高级编织工艺，学习原创设计，成为真正的编织达人。',
      cover: '👑',
      learners: 234,
      chapters: [
        { title: '线材艺术研究', duration: 50, content: '各类线材特性与搭配' },
        { title: '图案设计原理', duration: 60, content: '费尔岛、阿兰等图案' },
        { title: '结构创新设计', duration: 80, content: '特殊结构编织方法' },
        { title: '作品集打造', duration: 60, content: '建立个人编织品牌' },
        { title: '手工创业指导', duration: 50, content: '编织变现之路' }
      ]
    },
    {
      id: 'c6',
      title: '绘画入门：拿起画笔的第一步',
      category: 'painting',
      difficulty: 'beginner',
      duration: 25,
      description: '零基础认识绘画，了解各种画材，开启你的艺术之路。',
      cover: '🎨',
      learners: 6721,
      chapters: [
        { title: '绘画是什么', duration: 5, content: '绘画的意义与乐趣' },
        { title: '画材大科普', duration: 12, content: '水彩、彩铅、马克笔介绍' },
        { title: '第一幅涂鸦', duration: 8, content: '放松心态随便画' }
      ]
    },
    {
      id: 'c7',
      title: '彩铅初级：可爱简笔画',
      category: 'painting',
      difficulty: 'elementary',
      duration: 50,
      description: '用彩铅画出萌萌的简笔画，手账小白也能轻松上手。',
      cover: '✏️',
      learners: 4532,
      chapters: [
        { title: '彩铅基础技法', duration: 15, content: '握笔、排线、叠色' },
        { title: '可爱动物画法', duration: 20, content: '猫咪、兔子、小熊' },
        { title: '植物与小物', duration: 15, content: '多肉、花朵、食物' }
      ]
    },
    {
      id: 'c8',
      title: '水彩中级：风景写生技法',
      category: 'painting',
      difficulty: 'intermediate',
      duration: 120,
      description: '学习水彩风景画技法，把眼中的美景留在画纸上。',
      cover: '🏞️',
      learners: 1987,
      chapters: [
        { title: '水彩基础回顾', duration: 15, content: '干湿画法复习' },
        { title: '天空与云彩', duration: 25, content: '天空的各种画法' },
        { title: '山水与树木', duration: 40, content: '自然元素画法' },
        { title: '完整风景创作', duration: 40, content: '从取景到完成' }
      ]
    },
    {
      id: 'c9',
      title: '人物插画高级：从头像到全身',
      category: 'painting',
      difficulty: 'advanced',
      duration: 200,
      description: '系统学习人物插画，掌握人体结构与画风塑造。',
      cover: '👩‍🎨',
      learners: 1123,
      chapters: [
        { title: '头部结构与五官', duration: 50, content: '头像比例与五官画法' },
        { title: '人体结构基础', duration: 60, content: '比例、动态、透视' },
        { title: '发型与服饰', duration: 45, content: '发型设计与衣褶表现' },
        { title: '色彩与光影', duration: 45, content: '人物上色技巧' }
      ]
    },
    {
      id: 'c10',
      title: '插画大师：原创风格与商业应用',
      category: 'painting',
      difficulty: 'master',
      duration: 280,
      description: '打造个人插画风格，学习商业插画项目实战。',
      cover: '🖌️',
      learners: 345,
      chapters: [
        { title: '风格探索与定位', duration: 60, content: '找到属于你的画风' },
        { title: '构图与叙事', duration: 50, content: '画面故事性表达' },
        { title: '商业插画实战', duration: 80, content: '封面、海报、绘本' },
        { title: 'IP形象设计', duration: 50, content: '打造个人IP' },
        { title: '职业发展路径', duration: 40, content: '自由插画师指南' }
      ]
    },
    {
      id: 'c11',
      title: '摄影入门：用手机拍好照',
      category: 'photography',
      difficulty: 'beginner',
      duration: 22,
      description: '不用专业相机，手机也能拍出好看的照片。',
      cover: '📱',
      learners: 8932,
      chapters: [
        { title: '手机摄影基础', duration: 8, content: '对焦、曝光、构图' },
        { title: '常用拍照模式', duration: 7, content: '人像、夜景、全景' },
        { title: '拍照小技巧', duration: 7, content: '角度、光线小妙招' }
      ]
    },
    {
      id: 'c12',
      title: '人像摄影初级：拍出美美的自己',
      category: 'photography',
      difficulty: 'elementary',
      duration: 55,
      description: '学习人像摄影基础，让每一张自拍都像大片。',
      cover: '📸',
      learners: 5621,
      chapters: [
        { title: '人像构图法则', duration: 15, content: '经典构图方法' },
        { title: '光线的运用', duration: 20, content: '自然光与人造光' },
        { title: '姿势与表情', duration: 20, content: '摆拍姿势大全' }
      ]
    },
    {
      id: 'c13',
      title: '风光摄影中级：记录旅途之美',
      category: 'photography',
      difficulty: 'intermediate',
      duration: 100,
      description: '旅行摄影必备技巧，把美景完美定格。',
      cover: '🌄',
      learners: 2341,
      chapters: [
        { title: '风光摄影器材', duration: 20, content: '镜头与配件选择' },
        { title: '黄金时刻拍摄', duration: 25, content: '日出日落拍摄' },
        { title: '长曝光技巧', duration: 30, content: '流水、星空、车轨' },
        { title: '后期调色基础', duration: 25, content: '风光片调色思路' }
      ]
    },
    {
      id: 'c14',
      title: '商业摄影高级：产品摄影实战',
      category: 'photography',
      difficulty: 'advanced',
      duration: 160,
      description: '专业产品摄影技巧，电商、广告都能用。',
      cover: '🛍️',
      learners: 876,
      chapters: [
        { title: '影棚设备与布光', duration: 40, content: '灯光系统搭建' },
        { title: '各类产品拍摄', duration: 60, content: '美食、美妆、3C产品' },
        { title: '背景与道具搭配', duration: 30, content: '视觉效果提升' },
        { title: '商业后期精修', duration: 30, content: '产品图精修技巧' }
      ]
    },
    {
      id: 'c15',
      title: '摄影大师：艺术创作与个人风格',
      category: 'photography',
      difficulty: 'master',
      duration: 240,
      description: '从记录到创作，形成独特的摄影艺术风格。',
      cover: '🏆',
      learners: 287,
      chapters: [
        { title: '摄影史与流派', duration: 40, content: '了解摄影艺术发展' },
        { title: '视觉语言构建', duration: 50, content: '形成个人视觉语言' },
        { title: '专题摄影创作', duration: 70, content: '长期拍摄项目' },
        { title: '展览与出版', duration: 40, content: '作品展示与传播' },
        { title: '摄影职业规划', duration: 40, content: '职业摄影师之路' }
      ]
    },
    {
      id: 'c16',
      title: '美食入门：厨房小白第一课',
      category: 'cooking',
      difficulty: 'beginner',
      duration: 18,
      description: '认识厨房，学会基础刀法和调味，开启美食之旅。',
      cover: '🍳',
      learners: 7654,
      chapters: [
        { title: '厨房用具介绍', duration: 6, content: '锅碗瓢盆大作战' },
        { title: '基础刀法教学', duration: 7, content: '切菜切肉都不怕' },
        { title: '调味的秘密', duration: 5, content: '盐糖酱油怎么放' }
      ]
    },
    {
      id: 'c17',
      title: '家常菜初级：一日三餐不重样',
      category: 'cooking',
      difficulty: 'elementary',
      duration: 60,
      description: '20道经典家常菜，让餐桌每天都有惊喜。',
      cover: '🍱',
      learners: 4821,
      chapters: [
        { title: '快手早餐系列', duration: 15, content: '10分钟搞定早餐' },
        { title: '下饭神器', duration: 25, content: '10道经典下饭菜' },
        { title: '营养汤品', duration: 20, content: '简单美味的汤品' }
      ]
    },
    {
      id: 'c18',
      title: '烘焙中级：甜蜜的下午茶时光',
      category: 'cooking',
      difficulty: 'intermediate',
      duration: 110,
      description: '饼干、蛋糕、面包，在家也能做甜品店同款。',
      cover: '🧁',
      learners: 3210,
      chapters: [
        { title: '烘焙原料科普', duration: 20, content: '面粉、黄油、糖的选择' },
        { title: '饼干与曲奇', duration: 25, content: '各种饼干制作' },
        { title: '蛋糕基础', duration: 35, content: '戚风、海绵蛋糕' },
        { title: '奶油与装饰', duration: 30, content: '奶油打发与装饰' }
      ]
    },
    {
      id: 'c19',
      title: '料理高级：精致宴客菜',
      category: 'cooking',
      difficulty: 'advanced',
      duration: 180,
      description: '学会这些硬菜，请客吃饭倍儿有面。',
      cover: '🥘',
      learners: 987,
      chapters: [
        { title: '肉类料理进阶', duration: 50, content: '红烧肉、牛排、烤鸭' },
        { title: '海鲜料理', duration: 45, content: '鱼类、虾蟹处理与烹饪' },
        { title: '主食与点心', duration: 40, content: '精致主食与中式点心' },
        { title: '摆盘与搭配', duration: 45, content: '菜品摆盘技巧' }
      ]
    },
    {
      id: 'c20',
      title: '烹饪大师：创意料理与厨艺精通',
      category: 'cooking',
      difficulty: 'master',
      duration: 260,
      description: '从厨艺到艺术，探索烹饪的无限可能。',
      cover: '👨‍🍳',
      learners: 198,
      chapters: [
        { title: '食材深度理解', duration: 50, content: '食材特性与搭配' },
        { title: '分子料理入门', duration: 60, content: '现代烹饪技术' },
        { title: '融合菜创作', duration: 70, content: '中西融合创意菜' },
        { title: '菜单设计与搭配', duration: 40, content: '整套宴席设计' },
        { title: '厨艺创业指导', duration: 40, content: '餐饮创业建议' }
      ]
    },
    {
      id: 'c21',
      title: '剪辑入门：剪出你的第一条vlog',
      category: 'editing',
      difficulty: 'beginner',
      duration: 25,
      description: '零基础学剪辑，用手机也能剪出精彩视频。',
      cover: '🎬',
      learners: 9123,
      chapters: [
        { title: '剪辑是什么', duration: 5, content: '认识视频剪辑' },
        { title: '手机剪辑APP', duration: 10, content: '剪映基础操作' },
        { title: '第一条vlog', duration: 10, content: '拍摄剪辑全流程' }
      ]
    },
    {
      id: 'c22',
      title: '剪映初级：短视频爆款技巧',
      category: 'editing',
      difficulty: 'elementary',
      duration: 55,
      description: '抖音快手爆款视频是怎么剪出来的？',
      cover: '📹',
      learners: 6543,
      chapters: [
        { title: '转场与特效', duration: 20, content: '炫酷转场技巧' },
        { title: '字幕与贴纸', duration: 15, content: '自动字幕与趣味贴纸' },
        { title: '音乐与节奏', duration: 20, content: '卡点视频制作' }
      ]
    },
    {
      id: 'c23',
      title: 'PR剪辑中级：专业视频制作',
      category: 'editing',
      difficulty: 'intermediate',
      duration: 120,
      description: 'Premiere Pro 系统学习，进入专业剪辑世界。',
      cover: '💻',
      learners: 2765,
      chapters: [
        { title: 'PR界面与基础', duration: 25, content: '项目管理与时间线' },
        { title: '剪辑技巧进阶', duration: 35, content: '三点剪辑、多机位' },
        { title: '调色基础', duration: 30, content: 'Lumetri调色面板' },
        { title: '音频处理', duration: 30, content: '声音设计与混音' }
      ]
    },
    {
      id: 'c24',
      title: '特效合成高级：AE动效与合成',
      category: 'editing',
      difficulty: 'advanced',
      duration: 200,
      description: 'After Effects 特效合成，让视频更有冲击力。',
      cover: '✨',
      learners: 1234,
      chapters: [
        { title: 'AE基础与合成', duration: 45, content: '合成面板与图层' },
        { title: '文字动效', duration: 45, content: '文字动画预设' },
        { title: '粒子与特效', duration: 55, content: '粒子系统与特效插件' },
        { title: '跟踪与抠像', duration: 55, content: '运动跟踪与绿幕抠像' }
      ]
    },
    {
      id: 'c25',
      title: '影视后期大师：从入门到精通',
      category: 'editing',
      difficulty: 'master',
      duration: 300,
      description: '全面掌握影视后期制作流程，成为全能后期人。',
      cover: '🎥',
      learners: 432,
      chapters: [
        { title: '影视后期全流程', duration: 60, content: '从前期到后期的完整流程' },
        { title: '高级调色艺术', duration: 60, content: 'DaVinci Resolve调色' },
        { title: '三维与合成', duration: 70, content: 'C4D与AE结合' },
        { title: '作品包装与输出', duration: 50, content: '不同平台输出规范' },
        { title: '职业发展建议', duration: 60, content: '后期职业路径规划' }
      ]
    }
  ],

  works: [
    {
      id: 'w1',
      title: '我的第一条手工围巾',
      userId: 'u1',
      username: '小手巧',
      userAvatar: '🧶',
      courseId: 'c2',
      category: 'handmade',
      imageEmoji: '🧣',
      imageColor: '#FFE4E1',
      likes: 128,
      comments: [
        { user: '编织达人', avatar: '🧸', content: '织得真好！', time: '1天前' },
        { user: '新手小白', avatar: '🐰', content: '想学想学！', time: '2天前' }
      ],
      createdAt: '2024-01-15',
      description: '第一次织围巾，虽然有点歪歪扭扭，但还是很有成就感！'
    },
    {
      id: 'w2',
      title: '可爱小熊玩偶',
      userId: 'u2',
      username: '编织达人',
      userAvatar: '🧸',
      courseId: 'c3',
      category: 'handmade',
      imageEmoji: '🧸',
      imageColor: '#FFF0F5',
      likes: 256,
      comments: [
        { user: '小画家', avatar: '🎨', content: '太可爱了吧！', time: '1天前' }
      ],
      createdAt: '2024-01-12',
      description: '跟着课程做的小熊，超萌的！'
    },
    {
      id: 'w3',
      title: '水彩风景画练习',
      userId: 'u3',
      username: '小画家',
      userAvatar: '🎨',
      courseId: 'c8',
      category: 'painting',
      imageEmoji: '🏞️',
      imageColor: '#E6E6FA',
      likes: 189,
      comments: [
        { user: '摄影师小王', avatar: '📷', content: '色彩很舒服', time: '3天前' }
      ],
      createdAt: '2024-01-10',
      description: '第一次画水彩风景，继续加油！'
    },
    {
      id: 'w4',
      title: '自制草莓蛋糕',
      userId: 'u4',
      username: '美食家',
      userAvatar: '🍰',
      courseId: 'c18',
      category: 'cooking',
      imageEmoji: '🍰',
      imageColor: '#FFF8DC',
      likes: 312,
      comments: [
        { user: '烘焙爱好者', avatar: '🐸', content: '看起来好好吃！', time: '1天前' },
        { user: '巧手妈妈', avatar: '🐨', content: '求教程！', time: '2天前' }
      ],
      createdAt: '2024-01-08',
      description: '第一次做戚风蛋糕，成功啦！'
    },
    {
      id: 'w5',
      title: '旅行vlog剪辑',
      userId: 'u5',
      username: '旅行者',
      userAvatar: '✈️',
      courseId: 'c21',
      category: 'editing',
      imageEmoji: '🎬',
      imageColor: '#E0FFFF',
      likes: 98,
      comments: [
        { user: 'vlogger小雨', avatar: '🐱', content: '拍得不错！', time: '4天前' }
      ],
      createdAt: '2024-01-05',
      description: '第一次剪vlog，记录美好旅程~'
    },
    {
      id: 'w6',
      title: '人像摄影作品',
      userId: 'u6',
      username: '摄影师小王',
      userAvatar: '📷',
      courseId: 'c12',
      category: 'photography',
      imageEmoji: '📸',
      imageColor: '#F0F8FF',
      likes: 234,
      comments: [
        { user: '文艺青年', avatar: '🐯', content: '光影绝了', time: '5天前' }
      ],
      createdAt: '2024-01-03',
      description: '给朋友拍的一组人像照片'
    },
    {
      id: 'w7',
      title: '手工编织小包包',
      userId: 'u7',
      username: '织梦者',
      userAvatar: '👜',
      courseId: 'c3',
      category: 'handmade',
      imageEmoji: '👜',
      imageColor: '#FFE0B2',
      likes: 167,
      comments: [
        { user: '小手巧', avatar: '🧶', content: '配色好好看！', time: '1天前' }
      ],
      createdAt: '2024-01-14',
      description: '用剩余毛线做的小包包，实用又可爱~'
    },
    {
      id: 'w8',
      title: '彩铅多肉植物',
      userId: 'u8',
      username: '画画的鱼',
      userAvatar: '🐟',
      courseId: 'c7',
      category: 'painting',
      imageEmoji: '🌵',
      imageColor: '#E8F5E9',
      likes: 145,
      comments: [
        { user: '小画家', avatar: '🎨', content: '画得好逼真！', time: '2天前' }
      ],
      createdAt: '2024-01-13',
      description: '跟着课程画的多肉，是不是很可爱？'
    },
    {
      id: 'w9',
      title: '日落摄影',
      userId: 'u9',
      username: '追光者',
      userAvatar: '🌅',
      courseId: 'c13',
      category: 'photography',
      imageEmoji: '🌅',
      imageColor: '#FFF3E0',
      likes: 278,
      comments: [
        { user: '摄影师小王', avatar: '📷', content: '构图很棒！', time: '1天前' },
        { user: '文艺青年', avatar: '🐯', content: '太美了', time: '2天前' }
      ],
      createdAt: '2024-01-11',
      description: '海边的日落，真的太治愈了'
    },
    {
      id: 'w10',
      title: '手工曲奇饼干',
      userId: 'u10',
      username: '甜甜圈',
      userAvatar: '🍩',
      courseId: 'c18',
      category: 'cooking',
      imageEmoji: '🍪',
      imageColor: '#FFF8E1',
      likes: 198,
      comments: [
        { user: '美食家', avatar: '🍰', content: '看起来就好吃！', time: '3天前' }
      ],
      createdAt: '2024-01-09',
      description: '第一次做曲奇，酥酥脆脆超好吃~'
    },
    {
      id: 'w11',
      title: '短视频特效练习',
      userId: 'u11',
      username: '剪辑小白',
      userAvatar: '🎞️',
      courseId: 'c22',
      category: 'editing',
      imageEmoji: '✨',
      imageColor: '#E1BEE7',
      likes: 156,
      comments: [
        { user: '剪辑师阿泽', avatar: '🦁', content: '转场很丝滑', time: '2天前' }
      ],
      createdAt: '2024-01-07',
      description: '学了卡点视频，节奏感还不错吧~'
    },
    {
      id: 'w12',
      title: '钩针花朵胸针',
      userId: 'u12',
      username: '花仙子',
      userAvatar: '🌸',
      courseId: 'c3',
      category: 'handmade',
      imageEmoji: '🌸',
      imageColor: '#F8BBD0',
      likes: 213,
      comments: [
        { user: '编织达人', avatar: '🧸', content: '好精致！', time: '1天前' },
        { user: '织梦者', avatar: '👜', content: '手太巧了', time: '1天前' }
      ],
      createdAt: '2024-01-06',
      description: '小小的花朵胸针，别在衣服上超好看~'
    },
    {
      id: 'w13',
      title: '水彩猫咪插画',
      userId: 'u13',
      username: '猫奴画师',
      userAvatar: '🐱',
      courseId: 'c9',
      category: 'painting',
      imageEmoji: '🐈',
      imageColor: '#FFCCBC',
      likes: 324,
      comments: [
        { user: '小画家', avatar: '🎨', content: '太可爱了吧！', time: '1天前' },
        { user: '画画的鱼', avatar: '🐟', content: '求教程', time: '2天前' }
      ],
      createdAt: '2024-01-04',
      description: '画我家主子，胖嘟嘟的~'
    },
    {
      id: 'w14',
      title: '城市街拍',
      userId: 'u14',
      username: '街头猎人',
      userAvatar: '🏙️',
      courseId: 'c12',
      category: 'photography',
      imageEmoji: '🌃',
      imageColor: '#C5CAE9',
      likes: 187,
      comments: [
        { user: '追光者', avatar: '🌅', content: '很有故事感', time: '3天前' }
      ],
      createdAt: '2024-01-02',
      description: '城市的夜晚，充满了故事'
    },
    {
      id: 'w15',
      title: '手工拉面',
      userId: 'u15',
      username: '面师傅',
      userAvatar: '🍜',
      courseId: 'c17',
      category: 'cooking',
      imageEmoji: '🍜',
      imageColor: '#FFE0B2',
      likes: 245,
      comments: [
        { user: '甜甜圈', avatar: '🍩', content: '看起来好有食欲！', time: '1天前' }
      ],
      createdAt: '2024-01-01',
      description: '第一次尝试做拉面，味道还不错！'
    },
    {
      id: 'w16',
      title: 'vlog片头制作',
      userId: 'u16',
      username: '视频新人',
      userAvatar: '📹',
      courseId: 'c23',
      category: 'editing',
      imageEmoji: '🎥',
      imageColor: '#B3E5FC',
      likes: 134,
      comments: [
        { user: '剪辑师阿泽', avatar: '🦁', content: '开头很吸睛', time: '2天前' }
      ],
      createdAt: '2024-01-16',
      description: '给自己的vlog做了个片头，还挺有那味儿~'
    },
    {
      id: 'w17',
      title: '羊毛毡小刺猬',
      userId: 'u17',
      username: '羊毛毡爱好者',
      userAvatar: '🦔',
      courseId: 'c1',
      category: 'handmade',
      imageEmoji: '🦔',
      imageColor: '#D7CCC8',
      likes: 289,
      comments: [
        { user: '花仙子', avatar: '🌸', content: '太萌了吧！', time: '1天前' },
        { user: '小手巧', avatar: '🧶', content: '想学羊毛毡', time: '2天前' }
      ],
      createdAt: '2024-01-17',
      description: '第一次玩羊毛毡，小刺猬太可爱了~'
    },
    {
      id: 'w18',
      title: '数字绘画练习',
      userId: 'u18',
      username: '板绘新手',
      userAvatar: '🖊️',
      courseId: 'c9',
      category: 'painting',
      imageEmoji: '🎭',
      imageColor: '#CE93D8',
      likes: 176,
      comments: [
        { user: '猫奴画师', avatar: '🐱', content: '进步很大！', time: '3天前' }
      ],
      createdAt: '2024-01-18',
      description: '开始学板绘了，这是第三幅练习'
    },
    {
      id: 'w19',
      title: '美食摄影',
      userId: 'u19',
      username: '拍美食的',
      userAvatar: '📷',
      courseId: 'c14',
      category: 'photography',
      imageEmoji: '🥗',
      imageColor: '#C8E6C9',
      likes: 210,
      comments: [
        { user: '美食家', avatar: '🍰', content: '拍得比我的菜好看', time: '1天前' }
      ],
      createdAt: '2024-01-19',
      description: '学习了美食摄影，是不是很有食欲？'
    },
    {
      id: 'w20',
      title: '提拉米苏',
      userId: 'u20',
      username: '甜品控',
      userAvatar: '🍮',
      courseId: 'c18',
      category: 'cooking',
      imageEmoji: '🍮',
      imageColor: '#BCAAA4',
      likes: 356,
      comments: [
        { user: '甜甜圈', avatar: '🍩', content: '我的最爱！', time: '1天前' },
        { user: '面师傅', avatar: '🍜', content: '求配方', time: '2天前' }
      ],
      createdAt: '2024-01-20',
      description: '第一次做提拉米苏，味道绝了！'
    }
  ],

  leaderboardUsers: [
    {
      id: 'lu1',
      username: '手工小达人',
      avatar: '🦊',
      level: 15,
      completedCourses: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'],
      signInDays: 128,
      totalLearnTime: 3600
    },
    {
      id: 'lu2',
      username: '画手阿花',
      avatar: '🐰',
      level: 12,
      completedCourses: ['c6', 'c7', 'c8', 'c9', 'c10', 'c16', 'c17', 'c18'],
      signInDays: 96,
      totalLearnTime: 2800
    },
    {
      id: 'lu3',
      username: '摄影师老王',
      avatar: '🐻',
      level: 14,
      completedCourses: ['c11', 'c12', 'c13', 'c14', 'c15', 'c21', 'c22', 'c23', 'c24'],
      signInDays: 112,
      totalLearnTime: 3200
    },
    {
      id: 'lu4',
      username: '美食家小李',
      avatar: '🐼',
      level: 10,
      completedCourses: ['c16', 'c17', 'c18', 'c19', 'c20'],
      signInDays: 78,
      totalLearnTime: 2100
    },
    {
      id: 'lu5',
      username: '剪辑师阿泽',
      avatar: '🦁',
      level: 13,
      completedCourses: ['c21', 'c22', 'c23', 'c24', 'c25', 'c11', 'c12'],
      signInDays: 105,
      totalLearnTime: 2950
    },
    {
      id: 'lu6',
      username: '巧手妈妈',
      avatar: '🐨',
      level: 8,
      completedCourses: ['c1', 'c2', 'c3', 'c16', 'c17'],
      signInDays: 65,
      totalLearnTime: 1500
    },
    {
      id: 'lu7',
      username: '文艺青年',
      avatar: '🐯',
      level: 9,
      completedCourses: ['c6', 'c7', 'c11', 'c12', 'c21', 'c22'],
      signInDays: 72,
      totalLearnTime: 1800
    },
    {
      id: 'lu8',
      username: '烘焙爱好者',
      avatar: '🐸',
      level: 7,
      completedCourses: ['c16', 'c17', 'c18'],
      signInDays: 54,
      totalLearnTime: 1200
    },
    {
      id: 'lu9',
      username: 'vlogger小雨',
      avatar: '🐱',
      level: 11,
      completedCourses: ['c11', 'c12', 'c13', 'c21', 'c22', 'c23'],
      signInDays: 88,
      totalLearnTime: 2400
    },
    {
      id: 'lu10',
      username: '编织新人',
      avatar: '🐶',
      level: 5,
      completedCourses: ['c1', 'c2'],
      signInDays: 32,
      totalLearnTime: 680
    }
  ],

  teachers: [
    {
      id: 't1',
      name: '林织织',
      avatar: '👩‍🎨',
      category: 'handmade',
      title: '资深手工编织讲师',
      tagline: '用毛线编织温暖生活',
      bio: '10年编织经验，曾赴日本学习棒针和钩针技艺，擅长将传统工艺与现代设计结合。',
      students: 12580,
      courses: 5,
      rating: 4.9,
      experience: '10年',
      specialties: ['棒针编织', '钩针玩偶', '阿尔兰毛衣'],
      coverColor: '#FFE4E1'
    },
    {
      id: 't2',
      name: '陈墨白',
      avatar: '👨‍🎨',
      category: 'painting',
      title: '自由插画师',
      tagline: '每一笔都是热爱',
      bio: '美院毕业，自由插画师，合作过多个知名品牌，擅长水彩和数字插画。',
      students: 18960,
      courses: 8,
      rating: 4.8,
      experience: '8年',
      specialties: ['水彩风景', '人物插画', '商业插画'],
      coverColor: '#E6E6FA'
    },
    {
      id: 't3',
      name: '王镜头',
      avatar: '📸',
      category: 'photography',
      title: '国家高级摄影师',
      tagline: '用镜头记录世界的美好',
      bio: '摄影协会会员，多次获得国内外摄影大奖，专注风光与人像摄影教学。',
      students: 25600,
      courses: 6,
      rating: 4.9,
      experience: '12年',
      specialties: ['风光摄影', '人像摄影', '后期调色'],
      coverColor: '#E0F7FA'
    },
    {
      id: 't4',
      name: '李一勺',
      avatar: '👨‍🍳',
      category: 'cooking',
      title: '五星酒店主厨',
      tagline: '美食是用心做出来的',
      bio: '曾任五星酒店行政主厨，精通中西料理，尤其擅长烘焙和创意菜。',
      students: 32100,
      courses: 7,
      rating: 4.9,
      experience: '15年',
      specialties: ['法式烘焙', '创意料理', '中式宴席'],
      coverColor: '#FFF8DC'
    },
    {
      id: 't5',
      name: '张小剪',
      avatar: '🎬',
      category: 'editing',
      title: '资深后期剪辑师',
      tagline: '剪出属于你的精彩故事',
      bio: '前电视台后期制作，参与过多档热门综艺节目，擅长剪辑与特效合成。',
      students: 21350,
      courses: 6,
      rating: 4.8,
      experience: '9年',
      specialties: ['短视频剪辑', '特效合成', '调色技巧'],
      coverColor: '#E8F5E9'
    },
    {
      id: 't6',
      name: '苏手作',
      avatar: '🧵',
      category: 'handmade',
      title: '手作艺术家',
      tagline: '慢下来，做手工',
      bio: '独立手作人，拥有自己的工作室，擅长刺绣、布艺等多种手工技艺。',
      students: 8920,
      courses: 4,
      rating: 4.9,
      experience: '7年',
      specialties: ['手工刺绣', '布艺小物', '创意手作'],
      coverColor: '#FCE4EC'
    }
  ],

  badges: [
    { id: 'b1', name: '初心者', icon: '🌱', description: '完成第一门课程', type: 'learning', condition: 1 },
    { id: 'b2', name: '勤学奖', icon: '📚', description: '累计学习5门课程', type: 'learning', condition: 5 },
    { id: 'b3', name: '学习达人', icon: '🎓', description: '累计学习15门课程', type: 'learning', condition: 15 },
    { id: 'b4', name: '首次创作', icon: '🎨', description: '发布第一个作品', type: 'creation', condition: 1 },
    { id: 'b5', name: '创作新星', icon: '⭐', description: '发布5个作品', type: 'creation', condition: 5 },
    { id: 'b6', name: '人气王', icon: '🔥', description: '获得100个赞', type: 'popular', condition: 100 },
    { id: 'b7', name: '手工达人', icon: '🧶', description: '完成3门手工课', type: 'category_handmade', condition: 3 },
    { id: 'b8', name: '绘画大师', icon: '🖌️', description: '完成3门绘画课', type: 'category_painting', condition: 3 }
  ]
};
