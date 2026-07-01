// UniMate - Mock Data
const MOCK_DATA = {
  // AI 任务拆解数据
  taskBreakdowns: {
    '新生报到': [
      { step: 1, action: '携带录取通知书、身份证、准考证', tips: '原件+复印件各2份，建议提前用文件袋装好', location: '宿舍/家中', time: '出发前', icon: '📄' },
      { step: 2, action: '前往学校体育馆新生报到处', tips: '从南门进入最方便，可乘坐校内摆渡车', location: '体育馆主馆', time: '8:00-18:00', icon: '🏟️' },
      { step: 3, action: '在学院帐篷完成签到并领取材料包', tips: '材料包含校园卡、宿舍钥匙、新生手册', location: '学院服务区', time: '约15分钟', icon: '✍️' },
      { step: 4, action: '前往宿舍楼办理入住', tips: '先在一楼宿管阿姨处登记，再上楼', location: '学生公寓3号楼', time: '全天', icon: '🏠' },
      { step: 5, action: '到校园卡中心激活并充值', tips: '首次充值建议100元，支持微信/支付宝', location: '行政楼102室', time: '9:00-17:00', icon: '💳' }
    ],
    '办理饭卡': [
      { step: 1, action: '携带身份证和校园卡', tips: '如校园卡未领取，先完成报到流程', location: '-', time: '-', icon: '🆔' },
      { step: 2, action: '前往食堂一楼服务窗口', tips: '1号食堂和3号食堂均可办理', location: '第一食堂一楼', time: '7:00-19:00', icon: '🍽️' },
      { step: 3, action: '填写《校园一卡通申请表》', tips: '现场有模板，也可提前在官网下载', location: '服务窗口', time: '约5分钟', icon: '📝' },
      { step: 4, action: '缴纳押金20元并充值', tips: '退卡时押金可退还，最低充值50元', location: '缴费窗口', time: '即时', icon: '💰' },
      { step: 5, action: '领取饭卡并测试刷卡消费', tips: '可在旁边便利店买瓶水测试', location: '便利店', time: '-', icon: '✅' }
    ],
    '图书馆认证': [
      { step: 1, action: '携带校园卡和身份证', tips: '校园卡需先激活', location: '-', time: '-', icon: '🆔' },
      { step: 2, action: '前往图书馆二楼服务台', tips: '从正门进入，乘坐电梯到二楼', location: '图书馆2F', time: '8:00-22:00', icon: '📚' },
      { step: 3, action: '提交证件进行身份认证', tips: '工作人员会核对你的学号信息', location: '服务台', time: '约3分钟', icon: '👤' },
      { step: 4, action: '设置图书馆密码', tips: '建议与校园网密码保持一致，方便记忆', location: '自助终端', time: '约2分钟', icon: '🔐' },
      { step: 5, action: '借阅测试并完成入馆教育', tips: '在官网完成5分钟入馆教育视频', location: '线上/馆内', time: '约10分钟', icon: '🎓' }
    ],
    '英语分级考试': [
      { step: 1, action: '准备好2B铅笔、橡皮、学生证', tips: '听力部分需要调频收音机，频率85.5MHz', location: '宿舍', time: '考前30分钟', icon: '✏️' },
      { step: 2, action: '提前15分钟到达考场', tips: '考场在第三教学楼，建议提前查好教室', location: '第三教学楼', time: '14:00开始', icon: '🏫' },
      { step: 3, action: '按座位号入座并调试收音机', tips: '如遇设备问题立即举手示意监考老师', location: '考场', time: '考前10分钟', icon: '🎧' },
      { step: 4, action: '认真答题并注意时间分配', tips: '听力30分钟，阅读40分钟，写作20分钟', location: '考场', time: '90分钟', icon: '⏱️' },
      { step: 5, action: '交卷后有序离场', tips: '带走个人物品，成绩3天后公布', location: '考场', time: '考试结束', icon: '🏃' }
    ],
    '军训动员大会': [
      { step: 1, action: '穿着统一军训服装', tips: '记得佩戴军帽，腰带系紧', location: '宿舍', time: '出发前', icon: '👕' },
      { step: 2, action: '携带水杯和防晒用品', tips: '操场无遮阳处，建议涂防晒霜', location: '-', time: '-', icon: '☀️' },
      { step: 3, action: '提前20分钟到操场集合', tips: '按照学院划分区域就坐', location: '西操场', time: '8:00开始', icon: '🏃' },
      { step: 4, action: '认真听讲并记录要点', tips: '重点记录军训时间和纪律要求', location: '西操场', time: '约1小时', icon: '📝' },
      { step: 5, action: '领取军训物资（腰带、水壶等）', tips: '以班级为单位统一领取', location: '器材室', time: '会后', icon: '🎒' }
    ],
    '百团大战': [
      { step: 1, action: '了解各社团信息', tips: '可在UniMate问答中查询社团介绍', location: '线上', time: '提前了解', icon: '🔍' },
      { step: 2, action: '前往学生活动中心广场', tips: '各社团帐篷沿广场两侧排列', location: '学生活动中心', time: '9:00-17:00', icon: '🎪' },
      { step: 3, action: '到感兴趣的社团帐篷咨询', tips: '可领取宣传单并加入招新群', location: '各社团展位', time: '全天', icon: '💬' },
      { step: 4, action: '填写报名表并提交', tips: '部分社团需要面试，记得预留时间', location: '社团展位', time: '现场', icon: '📝' },
      { step: 5, action: '加入社团通知群', tips: '后续面试/活动时间会在群内通知', location: '线上', time: '报名后', icon: '📱' }
    ]
  },

  // 默认推荐任务
  defaultTasks: [
    { id: 1, title: '新生报到', category: '入学必办', priority: 'high', progress: 0, totalSteps: 5 },
    { id: 2, title: '办理饭卡', category: '生活必备', priority: 'high', progress: 0, totalSteps: 5 },
    { id: 3, title: '图书馆认证', category: '学习相关', priority: 'medium', progress: 0, totalSteps: 5 },
    { id: 4, title: '英语分级考试', category: '学习相关', priority: 'high', progress: 0, totalSteps: 5 },
    { id: 5, title: '军训动员大会', category: '活动安排', priority: 'medium', progress: 0, totalSteps: 5 },
    { id: 6, title: '百团大战', category: '社团活动', priority: 'low', progress: 0, totalSteps: 5 }
  ],

  // 日程事件
  scheduleEvents: [
    { id: 1, title: '新生报到', date: '2025-09-01', startTime: '08:00', endTime: '18:00', location: '体育馆', type: 'must', description: '携带录取通知书、身份证原件' },
    { id: 2, title: '军训动员大会', date: '2025-09-02', startTime: '08:00', endTime: '10:00', location: '西操场', type: 'must', description: '着军训服，携带水杯' },
    { id: 3, title: '英语分级考试', date: '2025-09-02', startTime: '14:00', endTime: '15:30', location: '第三教学楼', type: 'exam', description: '携带2B铅笔、收音机(85.5MHz)' },
    { id: 4, title: '图书馆入馆教育', date: '2025-09-03', startTime: '10:00', endTime: '11:00', location: '图书馆报告厅', type: 'study', description: '了解借阅规则和数字资源使用' },
    { id: 5, title: '百团大战', date: '2025-09-05', startTime: '09:00', endTime: '17:00', location: '学生活动中心', type: 'activity', description: '社团招新，现场可报名' },
    { id: 6, title: '选课系统开放', date: '2025-09-04', startTime: '09:00', endTime: '23:59', location: '线上', type: 'must', description: '登录教务系统选课' }
  ],

  // 问答知识库
  qaKnowledge: {
    '澡堂几点开门': '学校澡堂（浴室）开放时间：\n夏季（5-10月）：12:00-14:00, 17:00-23:00\n冬季（11-4月）：12:00-14:00, 16:30-22:30\n\n地点：各宿舍楼内或北区公共浴室\n费用：刷卡计费，约0.5元/分钟',
    '澡堂': '学校澡堂（浴室）开放时间：\n夏季（5-10月）：12:00-14:00, 17:00-23:00\n冬季（11-4月）：12:00-14:00, 16:30-22:30\n\n地点：各宿舍楼内或北区公共浴室\n费用：刷卡计费，约0.5元/分钟',
    '图书馆': '图书馆开放时间：\n周一至周日 7:30-22:30\n法定节假日另行通知\n\n各楼层功能：\n1F：总服务台、报刊阅览室\n2F：文学/社科借阅区\n3F：自然科学/工程技术借阅区\n4F：电子阅览室、研讨间（需预约）\n\n借阅规则：本科生可借10本，借期30天',
    '食堂': '学校共有5个食堂：\n\n第一食堂（北区）：\n一层：基本伙食（最便宜）\n二层：风味小吃\n\n第二食堂（南区）：\n一层：自选餐\n二层：清真餐厅\n\n第三食堂（东区）：网红餐厅，环境最好\n\n第四、五食堂：研究生公寓区\n\n支付方式：校园卡/微信/支付宝均可',
    '选课': '选课流程：\n1. 登录教务系统（jwxt.university.edu.cn）\n2. 进入"选课管理"-"网上选课"\n3. 按照培养方案选择必修课和选修课\n4. 确认后提交\n\n重要时间节点：\n预选：开学前1周\n正选：开学第1-2周\n补退选：开学第3周\n\nTips：热门选修课要抢，建议提前10分钟登录系统',
    '快递': '校内快递服务：\n\n菜鸟驿站：学生活动中心北侧\n营业时间：9:00-21:00\n\n京东快递：东门快递柜\n顺丰快递：图书馆西侧\n\n取件方式：凭取件码到驿站自取，或选择无人车配送到楼下（需预约）',
    '社团': '学校现有注册社团120+个，分为6大类：\n\n思想政治类、学术科技类\n创新创业类、文化体育类\n志愿公益类、自律互助类\n\n每年9月"百团大战"集中招新，也可学期中随时加入。\n\n热门社团：\n- 机器人协会（科技创新类）\n- 话剧社（文化艺术类）\n- 跑步协会（体育健康类）\n- 青年志愿者协会（公益类）',
    '百团大战': '百团大战是学校一年一度的社团集中招新活动！\n\n时间：每年9月第一个周末\n地点：学生活动中心广场\n\n现场有120+社团设摊招新，你可以：\n- 领取各社团宣传单\n- 观看社团现场表演\n- 现场报名并加入招新群\n- 参与互动小游戏赢奖品\n\n建议提前在UniMate查看感兴趣的社团信息哦！',
    '校园网': '校园网使用指南：\n\n覆盖范围：教学楼、图书馆、宿舍、食堂全覆盖\n\n连接方式：\n1. 选择WiFi：University-WiFi\n2. 浏览器会自动弹出认证页\n3. 输入学号和密码（初始密码身份证后6位）\n\n套餐：\n- 免费：每月20GB\n- 10元/月：不限流量\n\n缴费：信息门户-校园网缴费',
    '医务室': '校医院（医务室）信息：\n\n位置：北门进入后右转100米\n\n门诊时间：\n周一至周五 8:00-17:30\n周六 8:00-12:00\n周日及夜间：急诊值班\n\n就诊流程：\n1. 挂号（携带校园卡）\n2. 科室就诊\n3. 缴费取药\n\n费用：学生医保报销比例约70%',
    '军训': '军训安排（2025级新生）：\n\n时间：9月3日-9月16日（共14天）\n地点：西操场及校内各训练场地\n\n每日安排：\n6:30 起床、整理内务\n7:00 早餐\n8:00-11:30 上午训练\n14:00-17:30 下午训练\n19:00-21:00 晚上活动（拉歌、讲座等）\n\n必带物品：\n军训服（统一发放）、水杯、防晒霜、舒适鞋垫',
    '地铁': '学校周边交通：\n\n地铁站：\n- 南门：距离"大学城站"约500米（地铁3号线）\n- 东门：距离"科技园区站"约800米（地铁3号线、5号线换乘）\n\n公交站：\n- 校门口：302路、518路、901路\n- 直达火车站：约40分钟\n- 直达机场：乘坐3号线换乘机场快线，约1小时',
    'wifi': '校园网使用指南：\n\n覆盖范围：教学楼、图书馆、宿舍、食堂全覆盖\n\n连接方式：\n1. 选择WiFi：University-WiFi\n2. 浏览器会自动弹出认证页\n3. 输入学号和密码（初始密码身份证后6位）\n\n套餐：\n- 免费：每月20GB\n- 10元/月：不限流量\n\n缴费：信息门户-校园网缴费',
    '成绩': '成绩查询方式：\n1. 教务系统：jwxt.university.edu.cn\n2. 学校官方APP\n3. 教务大厅自助查询机\n\n成绩构成：\n平时成绩（30%）+ 期中/实验（20%）+ 期末（50%）\n\n绩点计算：\n90-100分：4.0\n85-89分：3.7\n82-84分：3.3\n...\n60分以下：0',
    '绩点': '绩点计算标准：\n\n百分制 -> 绩点：\n90-100分：4.0\n85-89分：3.7\n82-84分：3.3\n78-81分：3.0\n75-77分：2.7\n72-74分：2.3\n68-71分：2.0\n64-67分：1.5\n60-63分：1.0\n60以下：0\n\n平均学分绩点(GPA) = Σ(课程绩点 × 课程学分) / Σ课程学分'
  },

  // 预设问题
  presetQuestions: [
    '澡堂几点开门？',
    '图书馆怎么借书？',
    '食堂哪个最好吃？',
    '选课怎么操作？',
    '快递去哪里取？',
    '有哪些好玩的社团？',
    '校园网怎么连？',
    '医务室在哪里？'
  ],

  // 徽章数据
  badges: [
    { id: 1, name: '初见校园', desc: '完成首次任务拆解', icon: '🎓', unlocked: true },
    { id: 2, name: '井井有条', desc: '完成3个任务计划', icon: '📋', unlocked: true },
    { id: 3, name: '万事通', desc: '提出5个问题', icon: '❓', unlocked: true },
    { id: 4, name: '时间管理大师', desc: '日程无冲突安排7天', icon: '⏰', unlocked: false },
    { id: 5, name: '社交达人', desc: '加入第一个社团', icon: '🤝', unlocked: false },
    { id: 6, name: '完美新生', desc: '完成所有入学任务', icon: '⭐', unlocked: false }
  ],

  // 快递数据（模拟用户登录后的快递）
  userPackages: [
    {
      id: 'PKG001',
      company: '顺丰速运',
      trackingNo: 'SF1029384756',
      location: '图书馆西侧快递柜',
      pickupCode: 'A-1823',
      status: '待取件',
      arrivedAt: '2025-09-01 14:30',
      description: '录取通知书配套行李包裹',
      icon: '📦'
    },
    {
      id: 'PKG002',
      company: '中通快递',
      trackingNo: 'ZT7766554433',
      location: '菜鸟驿站（学生活动中心北侧）',
      pickupCode: '3-2-5566',
      status: '待取件',
      arrivedAt: '2025-09-01 09:15',
      description: '宿舍床上用品三件套',
      icon: '📦'
    },
    {
      id: 'PKG003',
      company: '京东物流',
      trackingNo: 'JD9988776655',
      location: '东门快递柜',
      pickupCode: 'C-9921',
      status: '待取件',
      arrivedAt: '2025-08-31 16:45',
      description: '笔记本电脑及配件',
      icon: '📦'
    }
  ],

  // 周末景点推荐
  weekendSpots: [
    {
      name: '大学城湿地公园',
      tags: ['免费', '骑行', '野餐'],
      distance: '距学校 2.5km',
      desc: '校园周边的天然氧吧，有环湖骑行道和草坪，适合新同学周末放松心情、认识新朋友。',
      icon: '🌳',
      tips: '建议上午去，下午人较多；可自带野餐垫'
    },
    {
      name: '科技园创意市集',
      tags: ['文艺', '美食', '打卡'],
      distance: '距学校 1.8km',
      desc: '每周六日开放的创意市集，有手作、小吃、 live 演出，感受当地年轻人的文化氛围。',
      icon: '🎨',
      tips: '周六下午最热闹，晚上有露天电影'
    },
    {
      name: '城市博物馆',
      tags: ['室内', '文化', '免费'],
      distance: '距学校 4km',
      desc: '了解这座城市的历史与文化，馆内设有互动体验区，凭学生证免费入场。',
      icon: '🏛️',
      tips: '周一闭馆，周二至周日 9:00-17:00'
    },
    {
      name: '滨江夜游步道',
      tags: ['夜景', '散步', '免费'],
      distance: '距学校 3.2km',
      desc: '傍晚沿江散步的最佳选择，夜景灯光秀每晚 19:30 开始，拍照很出片。',
      icon: '🌉',
      tips: '建议日落前到，可以看夕阳+夜景'
    },
    {
      name: '植物园温室馆',
      tags: ['室内', '植物', '治愈'],
      distance: '距学校 5km',
      desc: '热带雨林主题的温室馆，四季恒温，适合雨天或夏天避暑，学生票半价。',
      icon: '🌿',
      tips: '温室区比较闷热，建议穿轻薄衣物'
    }
  ]
};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MOCK_DATA;
}
