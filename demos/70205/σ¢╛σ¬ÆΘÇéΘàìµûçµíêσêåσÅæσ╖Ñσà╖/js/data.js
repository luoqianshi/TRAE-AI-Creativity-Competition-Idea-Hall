/**
 * 图媒适配原生文案一键分发工具 - 内容数据库 v2
 * 核心改动：去AI味，剔除套话，增加真实细节与口语感
 * 原则：不堆梗、不夸张、有细节、有瑕疵、像真人
 */

// ========== 场景类型定义 ==========
const SCENE_TYPES = {
  food: { label: '美食', icon: '🍽️', keywords: ['餐厅', '美食', '探店', '菜品', '味道'] },
  cafe: { label: '咖啡店', icon: '☕', keywords: ['咖啡', '甜品', '下午茶', '蛋糕', '饮品'] },
  travel: { label: '旅行', icon: '✈️', keywords: ['景点', '旅行', '风景', '出游', '打卡'] },
  shopping: { label: '好物', icon: '🛍️', keywords: ['商品', '好物', '购物', '开箱', '测评'] },
  lifestyle: { label: '日常', icon: '🌟', keywords: ['日常', '生活', '打卡', '随手拍'] },
  beauty: { label: '美妆', icon: '💄', keywords: ['美妆', '穿搭', '护肤', '时尚', '造型'] },
  home: { label: '家居', icon: '🏠', keywords: ['家居', '装修', '收纳', '生活好物', '居家'] },
  pet: { label: '萌宠', icon: '🐱', keywords: ['宠物', '猫', '狗', '萌宠', '日常'] },
};

// ========== 口语表达库 v3（融合真实爆款笔记热梗） ==========
// 数据来源：小红书互动数1000+爆款笔记高频表达
// 原则：用真人会说的口语 + 当前流行的热梗，不用被AI滥用的词
const MEME_DATABASE = {
  food: [
    '说实话有点惊艳', '是我会反复去的那种', '这顿没踩雷',
    '朋友说下次还来', '排队排了四十分钟', '上菜挺快的',
    '分量给得很实在', '味道在线', '比想象中好不少',
    '这价格算合理', '环境一般但味道确实行', '服务员态度不错',
    '就是有点咸', '吃到后面有点腻', '总的对得起这个价',
    '同桌的都夸了', '我个人挺喜欢的', '不算踩雷',
    '指定有点说法', '这顿值了', '没白排队',
  ],
  cafe: [
    '坐了一下午没被赶', '适合带电脑来干活', '咖啡中规中矩',
    '甜品不太甜这点很好', '拍照确实好看', '人不多挺安静',
    '空调够冷', '插座有', '音乐不吵',
    '拿铁拉花挺用心的', '蛋糕比咖啡出彩', '价格小贵但能接受',
    '太好拍了', '出片率很高', '氛围感拿捏了',
    '指定有点说法', '坐了一下午不想走',
  ],
  travel: [
    '比攻略上说的好看', '人多但值得', '建议工作日去',
    '我们早上九点到的，人还不算多', '拍照要排队', '体力活，穿舒服的鞋',
    '门票觉得值', '里面比外面大', '走完大概三小时',
    '防晒一定要带', '有段路不太好走', '风景确实没话说',
    '厕所不多，提前上', '带够水', '观景台视野很好',
    '指定有点东西', '随手一拍都是大片', '值得专门跑一趟',
  ],
  shopping: [
    '用了一周来评价', '说真的没想象中那么好', '但也不算踩雷',
    '这个价格还行', '质感对得起价格', '回购了',
    '唯一的缺点是', '比我之前用的那个好', '颜值在线',
    '功能该有的都有', '说明书看不懂自己摸索的', '赠品没用上',
    '物流挺快的', '包装一般', '客服回复挺及时',
    '跟风买的指定有点说法', '人类智慧的产物', '幸福感飙升',
    '买了不后悔', '一物多用太香了',
  ],
  lifestyle: [
    '今天天气不错', '难得休息一天', '随便走走',
    '生活嘛就这样', '偶尔慢下来挺好', '没什么特别的就是记录一下',
    '最近状态还行', '小确幸', '记录一下',
    '平淡但舒服', '挺好的', '日常碎片',
    '松弛感拉满', '浪漫生活的记录者',
  ],
  beauty: [
    '用了半个月来反馈', '我是混油皮', '上脸不闷',
    '这个色号日常能用', '显白是真的', '质地推开挺顺的',
    '持久度一般，下午要补', '味道不难闻', '泵头设计我喜欢',
    '用量省', '敏感肌用了没泛红', '性价比可以',
    '包装好看但实用性一般', '比大牌平替', '会回购',
    '指定有点说法', '黄皮也行', '素颜也能用',
  ],
  home: [
    '用了一个月来评价', '收纳确实变整齐了', '尺寸量好再买',
    '材质比图片好', '安装花了二十分钟', '承重没问题',
    '颜值和实用都在线', '小户型友好', '放桌上不占地方',
    '清理方便', '唯一槽点是', '快递包装可以',
    '租房党刚需', '这个价格值', '邻居来问链接',
    '跟风买的指定有点说法', '人类智慧的产物', '幸福感飙升',
    '一物多用太香了', '买了不后悔',
  ],
  pet: [
    '今天又拆家了', '只认吃的不认我', '拆家小能手',
    '睡了一天', '看到零食就精神了', '毛比之前顺了',
    '体检一切正常', '医生说状态不错', '又胖了半斤',
    '疫苗打完了', '终于学会握手了', '拆了个快递箱子玩半天',
    '猫粮换了这个牌子', '喝水变多了', '掉毛季到了',
    '指定有点东西', '治愈系', '谁懂啊',
  ],
  general: [
    '说实话', '讲真', '其实吧', '我个人觉得', '不吹不黑',
    '讲道理', 'emmm', '怎么说呢', '反正', '不过',
    '有一说一', '别问我怎么知道的', '懂的都懂',
    '不是我说的啊', '信不信由你', '反正我信了',
    '跟风来的', '指定有点说法', '谁懂啊家人们',
  ],
};

// ========== 标题模板库 v3（融合真实爆款笔记特征） ==========
// 数据来源：小红书爆款笔记API，互动数1000+的真实热门笔记
// 爆款标题模式：悬念反问、天花板体、宝藏体、数字buff、情绪感叹
const TITLE_PATTERNS = {
  // 美食（去吃/去探店）
  food: {
    dianping: [
      '{keyword}探店｜人均{price}，说说真实感受',
      '{keyword}实测，{meme}',
      '在{location}吃的{keyword}，{meme}',
      '{keyword}，人均{price}，{meme}',
      '终于来打卡{keyword}了，{meme}',
      '{keyword}探店报告｜{meme}（附点单建议）',
      '本地朋友带去的{keyword}，{meme}',
      '{keyword}｜人均{price}，{meme}？',
      '周末去吃了{keyword}，聊聊体验',
      '{keyword}，排队{wait}分钟，{meme}',
    ],
    xiaohongshu: [
      // 悬念反问式
      '谁还不知道{location}这家{keyword}❓{meme}',
      '{keyword}到底值不值得排队{wait}分钟❓',
      // 天花板体
      '{keyword}天花板！人均{price}，{meme}',
      '这家的{dish}，{keyword}天花板级别了吧🔥',
      // 宝藏体
      '在{location}挖到宝藏{keyword}！{meme}',
      '{location}藏着一家宝藏{keyword}，{meme}',
      // 数字buff式
      '人均{price}❗️{keyword}❗️{meme}❗️',
      // 情绪感叹式
      '{keyword}……{meme}！！',
      '我就说{location}的{keyword}指定有点东西！！',
      '跟风来的{keyword}，{meme}',
      // 真实体验式
      '{keyword}｜人均{price}，{meme}',
      '终于去吃了{keyword}，{meme}',
    ],
    douyin: [
      '{keyword}探店，{meme} #探店',
      '去了{keyword}，{meme} #探店',
      '{keyword}｜人均{price}，{meme} #美食',
      '带你们去{keyword}，{meme} #探店',
      '{keyword}天花板？{meme} #探店',
    ],
  },
  cafe: {
    dianping: [
      '{keyword}探店｜人均{price}，{meme}',
      '{keyword}实测，{meme}',
      '在{location}的{keyword}，{meme}',
      '{keyword}，人均{price}，{meme}',
      '终于来打卡{keyword}了，{meme}',
      '{keyword}｜{meme}（附点单建议）',
      '{keyword}，{meme}',
      '{keyword}｜人均{price}，{meme}？',
      '周末去了{keyword}，聊聊体验',
    ],
    xiaohongshu: [
      // 悬念反问式
      '谁还不敢在{keyword}待一天❓',
      '{location}这家{keyword}也太好拍了吧❓',
      // 宝藏体
      '在{location}挖到宝藏{keyword}！太好拍了',
      '{location}藏着一家仙女{keyword}，{meme}',
      // 情绪感叹式
      '仙女{keyword}🧚‍♀️{meme}',
      '{keyword}……{meme}！！',
      '我就说{location}的{keyword}指定有点说法！！',
      // 一学就会/出片式
      '一学就会☕️{keyword}拍照姿势！！{meme}',
      '{keyword}｜出片率100%，{meme}',
      // 真实体验式
      '{keyword}｜人均{price}，{meme}',
      '终于去了{keyword}，{meme}',
    ],
    douyin: [
      '{keyword}，{meme} #咖啡店',
      '去了{keyword}，{meme} #探店',
      '{keyword}｜人均{price}，{meme} #下午茶',
      '谁还不敢在{keyword}待一天 #咖啡店',
    ],
  },
  // 旅行/景点（不能"去吃"）
  travel: {
    dianping: [
      '{keyword}打卡｜门票{price}，{meme}',
      '{keyword}实测，{meme}',
      '在{location}的{keyword}，{meme}',
      '{keyword}，门票{price}，{meme}',
      '终于去{keyword}了，{meme}',
      '{keyword}游玩攻略｜{meme}',
      '{keyword}｜{meme}（附避坑指南）',
      '{keyword}，{meme}？',
      '周末去了{keyword}，聊聊体验',
    ],
    xiaohongshu: [
      // 悬念反问式
      '谁还不知道{keyword}这个地方❓{meme}',
      '{keyword}到底值不值得去❓',
      // 天花板体
      '{keyword}风景天花板！{meme}',
      // 宝藏体
      '在{location}挖到宝藏{keyword}！{meme}',
      '{location}藏着一个小众{keyword}，{meme}',
      // 情绪感叹式
      '{keyword}……{meme}！！',
      '我就说{location}的{keyword}指定有点东西！！',
      '跟风来的{keyword}，{meme}',
      // 真实体验式
      '{keyword}｜{meme}',
      '终于去{keyword}了，{meme}',
      '{keyword}打卡｜{meme}',
    ],
    douyin: [
      '{keyword}，{meme} #旅行',
      '去了{keyword}，{meme} #旅行',
      '{keyword}｜门票{price}，{meme} #打卡',
      '{keyword}天花板？{meme} #旅行',
    ],
  },
  // 好物/美妆/家居（不能用"探店"，用"测评/分享"）
  shopping: {
    dianping: [
      '{keyword}测评｜{meme}',
      '{keyword}实测，{meme}',
      '{keyword}用后感，{meme}',
      '{keyword}，{meme}',
      '{keyword}开箱，{meme}',
    ],
    xiaohongshu: [
      // 天花板体
      '{keyword}天花板！{meme}',
      // 宝藏体
      '挖到宝藏{keyword}！{meme}',
      // 跟风体
      '跟风买的{keyword}，指定有点说法！！',
      '我就说{keyword}……{meme}！！',
      // 数字buff式
      '平价❗️好用❗️{keyword}❗️{meme}❗️',
      // 幸福感体
      '幸福感飙升的{keyword}！{meme}',
      // 真实体验式
      '{keyword}分享｜{meme}',
      '入了{keyword}，{meme}',
      '{keyword}真实反馈，{meme}',
    ],
    douyin: [
      '{keyword}，{meme} #好物',
      '{keyword}测评，{meme} #好物分享',
      '{keyword}天花板？{meme} #好物',
      '跟风买的{keyword}，{meme} #开箱',
    ],
  },
  beauty: {
    dianping: [
      '{keyword}测评｜{meme}',
      '{keyword}用后感，{meme}',
      '{keyword}实测，{meme}',
    ],
    xiaohongshu: [
      // 天花板体
      '{keyword}天花板！{meme}',
      // 跟风体
      '跟风入的{keyword}，指定有点说法！！',
      '我就说{keyword}……{meme}！！',
      // 平价替代体
      '平价❗️好用❗️{keyword}❗️{meme}❗️',
      '{keyword}＝大牌平替？{meme}',
      // 真实体验式
      '{keyword}分享｜{meme}',
      '入了{keyword}，{meme}',
      '{keyword}反馈，{meme}',
    ],
    douyin: [
      '{keyword}，{meme} #美妆',
      '{keyword}测评，{meme} #美妆',
      '{keyword}天花板？{meme} #美妆',
      '跟风入的{keyword}，{meme} #美妆',
    ],
  },
  home: {
    dianping: [
      '{keyword}测评｜{meme}',
      '{keyword}用后感，{meme}',
      '{keyword}实测，{meme}',
    ],
    xiaohongshu: [
      // 天花板体
      '{keyword}天花板！{meme}',
      // 跟风体
      '跟风买的{keyword}，指定有点说法！！',
      '我就说{keyword}……{meme}！！',
      // 幸福感体
      '幸福感飙升的{keyword}！{meme}',
      '人类智慧的产物！{keyword}{meme}',
      // 数字buff式
      '平价❗️好用❗️{keyword}❗️{meme}❗️',
      // 真实体验式
      '{keyword}分享｜{meme}',
      '入了{keyword}，{meme}',
    ],
    douyin: [
      '{keyword}，{meme} #家居',
      '{keyword}测评，{meme} #家居',
      '跟风买的{keyword}，{meme} #家居好物',
      '{keyword}天花板？{meme} #家居',
    ],
  },
  // 日常/萌宠
  lifestyle: {
    dianping: ['{keyword}｜{meme}', '{keyword}记录，{meme}'],
    xiaohongshu: [
      '谁还不知道{keyword}❓{meme}',
      '{keyword}……{meme}！！',
      '{keyword}｜{meme}',
      '{keyword}，{meme}',
      '{keyword}记录',
    ],
    douyin: ['{keyword}，{meme} #日常'],
  },
  pet: {
    dianping: ['{keyword}日常｜{meme}', '{keyword}，{meme}'],
    xiaohongshu: [
      '谁还不知道{keyword}❓{meme}',
      '{keyword}……{meme}！！',
      '{keyword}日常，{meme}',
      '{keyword}｜{meme}',
      '我就说{keyword}指定有点东西！！',
    ],
    douyin: ['{keyword}，{meme} #萌宠'],
  },
};

// 兼容旧接口：提供默认映射
const _TITLE_FALLBACK = {
  dianping: ['{keyword}｜{meme}', '{keyword}，{meme}'],
  xiaohongshu: ['{keyword}｜{meme}', '{keyword}，{meme}'],
  douyin: ['{keyword}，{meme}'],
};

// ========== 文案开头模板（去AI味版） ==========
// 原则：从场景/小事切入，不要模板化开头
const OPENING_TEMPLATES = {
  dianping: [
    '周末和朋友去的，整体聊一下。',
    '种草挺久了，这次终于来试。',
    '路过看到人挺多就进来了。',
    '朋友极力推荐，说一定要来试试。',
    '在点评上刷到好几次，抱着期待来的。',
    '本来想去另一家，结果排队太长就来了这家。',
    '公司附近新开的，同事拉着我来。',
    '之前来过一次，这次带家人再来。',
  ],
  xiaohongshu: [
    '{meme}，终于来打卡了。',
    '朋友安利了好久，这次终于来了。',
    '路过好几次，这次终于进去了。',
    '刷到好几次，这次自己来试试。',
    '拖了好久才来，说下真实感受。',
    '本来没报太大期望，结果{meme}。',
    '周末和朋友来的，聊聊体验。',
    '第一次来，记录一下。',
  ],
  douyin: [
    '家人们，今天去了{keyword}。',
    '被安利了好久，今天来试试。',
    '路过看到人多就进来了。',
  ],
};

// ========== 文案正文模板 v3（模仿真实爆款笔记） ==========
// 数据来源：小红书互动1000+爆款笔记正文分析
// 爆款特征：短句为主、情绪词+感叹号、emoji点缀、有细节有态度、分行排版
const BODY_TEMPLATES = {
  food: {
    dianping: [
      // 短文案版
      '{dish}{taste_desc}，值得点。{dish2}{taste_desc2}，一般。不过{negative_note}。人均{price}，{value_note}。{tip}',
      '环境{env_desc}。{dish}{taste_desc}，是亮点。{dish2}{taste_desc2}。服务{service_desc}。人均{price}，{value_note}。',
      // 中等文案版
      '{dish}{taste_desc}，这个值得点。{dish2}{taste_desc2}，中规中矩。{dish3}{taste_desc3}，看个人口味。整体分量{portion}，{flavor_note}。环境{env_desc}，{occasion}合适。不过{negative_note}。人均{price}，{value_note}。{tip}',
      '先说缺点：{negative_note}。但{dish}{taste_desc}，扳回来了。{dish2}{taste_desc2}。{dish3}{taste_desc3}。环境{env_desc}，{occasion}合适。分量{portion}，{flavor_note}。服务{service_desc}。人均{price}，{value_note}。',
      // 长文案版
      '【点单】\n{dish}{taste_desc}，这个强烈推荐。\n{dish2}{taste_desc2}，中规中矩。\n{dish3}{taste_desc3}，看个人口味。\n\n【环境】\n{env_desc}，{occasion}合适。\n服务{service_desc}。\n\n【不足】\n{negative_note}。\n\n整体分量{portion}，{flavor_note}。\n人均{price}，{value_note}。{tip}\n{revisit}。',
    ],
    xiaohongshu: [
      // 短文案版（50-120字）
      '{dish}{taste_desc}🔥真的绝了！\n{dish2}{taste_desc2}，也推荐。\n不过{negative_note}。\n人均{price}，{value_note}\n{tip}',
      '说实话{dish}真的{taste_desc}！\n{dish2}{taste_desc2}。\n环境{env_desc}，{occasion}合适。\n姐妹们冲\n💰人均{price}',
      // 中等文案版（120-220字）
      '{meme}！\n{dish}{taste_desc}，这个必须点🔥\n{dish2}{taste_desc2}，也还行。\n{dish3}{taste_desc3}，看个人口味。\n环境{env_desc}，{occasion}合适。\n不过{negative_note}。\n人均{price}，{value_note}\n记得收藏这篇\n\n📍{location}',
      '跟风来的，说下真实感受👇\n{dish}{taste_desc}，没踩雷✅\n{dish2}{taste_desc2}。\n{dish3}{taste_desc3}，一般般。\n环境{env_desc}。\n{negative_note}。\n但整体{value_note}\n人均{price}，{tip}\n📍{location}',
      // 长文案版（220-350字）
      '{meme}！！\n一直想来试试，终于打卡了\n\n📖点单分享：\n{dish}{taste_desc}，这个必点🔥强烈推荐！\n{dish2}{taste_desc2}，也还不错。\n{dish3}{taste_desc3}，看个人口味吧。\n\n🏠环境：\n{env_desc}，{occasion}挺合适。\n音乐不吵，坐了{duration}也不赶人。\n\n💬真实感受：\n{negative_note}。\n但整体{value_note}。\n人均{price}，{tip}\n\n记得收藏不迷路📌\n📍{location}',
    ],
    douyin: [
      // 短文案版
      '家人们{dish}{taste_desc}！这个必点。{dish2}{taste_desc2}。不过{negative_note}。人均{price}，{value_note}。{tip} #探店',
      '{dish}{taste_desc}！这顿没踩雷。{dish2}也行，{taste_desc2}。人均{price}，{value_note} #美食',
      // 中等文案版
      '{dish}{taste_desc}，这个必须点！{dish2}{taste_desc2}，也还行。{dish3}{taste_desc3}，看口味。不过{negative_note}。环境{env_desc}，{occasion}合适。人均{price}，{value_note}。{tip} #探店 #美食',
      '{dish}{taste_desc}，没踩雷！{dish2}{taste_desc2}。环境{env_desc}。服务{service_desc}。就是{negative_note}。人均{price}，{value_note}。{tip} #探店',
      // 长文案版
      '{dish}{taste_desc}，这个必须点，强烈推荐！\n{dish2}{taste_desc2}，也还行。\n{dish3}{taste_desc3}，看个人口味。\n\n环境{env_desc}，{occasion}合适。\n服务{service_desc}。\n\n不足：{negative_note}。\n\n人均{price}，{value_note}。{tip}\n{revisit} #探店 #美食',
    ],
  },
  cafe: {
    dianping: [
      // 短文案版
      '{dish}{taste_desc}。{dish2}{taste_desc2}。环境{env_desc}，坐了{duration}没被催。{negative_note}。人均{price}，{value_note}。',
      '{dish}{taste_desc}，拉花用心。{dish2}{taste_desc2}，甜度刚好。{env_note}。人均{price}，{value_note}。',
      // 中等文案版
      '{dish}{taste_desc}，拉花用心。{dish2}{taste_desc2}，不甜腻这点很好。环境{env_desc}，坐了{duration}没被催。{env_note}。不过{negative_note}。人均{price}，{value_note}。{tip}',
      '{dish}{taste_desc}。{dish2}{taste_desc2}。环境{env_desc}，适合{occasion}。{env_note}。服务{service_desc}。{negative_note}。人均{price}，{value_note}。',
      // 长文案版
      '【点单】\n{dish}{taste_desc}，拉花好看又好喝。\n{dish2}{taste_desc2}，不甜腻这点很好。\n\n【环境】\n{env_desc}，{env_note}。\n坐了{duration}没被催，适合带电脑来干活。\n\n【不足】\n{negative_note}。\n\n人均{price}，{value_note}。{tip}',
    ],
    xiaohongshu: [
      // 短文案版
      '{dish}{taste_desc}☕️太好拍了吧！\n{dish2}{taste_desc2}。\n{env_note}。\n坐了{duration}不想走\n人均{price}，{value_note}',
      '出片率100%✨\n{dish}{taste_desc}！\n{dish2}{taste_desc2}。\n环境{env_desc}，每个角落都好拍。\n人均{price}',
      // 中等文案版
      '{meme}！\n{dish}{taste_desc}，拉花好看又好喝☕️\n{dish2}{taste_desc2}，不甜腻这点很好。\n环境{env_desc}，{env_note}。\n坐了一下午{duration_note}。\n{negative_note}。\n人均{price}，{value_note}\n快约闺蜜来\n📍{location}',
      '跟风来的咖啡店，说下真实感受👇\n{dish}{taste_desc}，没踩雷✅\n{dish2}{taste_desc2}。\n环境{env_desc}，每个角落都好拍。\n{env_note}。\n{negative_note}。\n但氛围感拿捏了\n人均{price}，{value_note}\n📍{location}',
      // 长文案版
      '{meme}！！\n终于来打卡了，太久没发咖啡店了\n\n📖点单分享：\n{dish}{taste_desc}，这个必点🔥拉花好看又好喝！\n{dish2}{taste_desc2}，不甜腻这点很好。\n\n🏠环境：\n{env_desc}，{env_note}。\n每个角落都好拍✨\n坐了一下午{duration_note}。\n\n💬真实感受：\n{negative_note}。\n但氛围感拿捏了。\n人均{price}，{tip}\n\n记得收藏不迷路📌\n📍{location}',
    ],
    douyin: [
      // 短文案版
      '{dish}{taste_desc}！{dish2}{taste_desc2}。{env_note}。人均{price}。#咖啡店',
      '这家咖啡店太好拍了！{dish}{taste_desc}。{dish2}不甜腻。坐了一下午{duration_note} #咖啡店',
      // 中等文案版
      '{dish}{taste_desc}，拉花用心！{dish2}{taste_desc2}，不甜腻。{env_note}。坐了一下午{duration_note}。{negative_note}。人均{price}，{value_note} #咖啡店 #下午茶',
      '{dish}{taste_desc}！{dish2}{taste_desc2}。环境{env_desc}，每个角落都好拍。{negative_note}。但氛围感拿捏了。人均{price} #咖啡店',
      // 长文案版
      '{dish}{taste_desc}，拉花好看又好喝！\n{dish2}{taste_desc2}，不甜腻这点很好。\n\n环境{env_desc}，每个角落都好拍。\n{env_note}。\n坐了一下午{duration_note}。\n\n不足：{negative_note}。\n\n人均{price}，{value_note}。{tip}\n#咖啡店 #下午茶',
    ],
  },
  travel: {
    dianping: [
      // 短文案版
      '逛了{duration}，{spot}{spot_desc}。{spot2}{spot_desc2}。门票{price}，{value_note}。{tip}。',
      '交通{traffic_desc}。{spot}{spot_desc}，必去。{spot2}{spot_desc2}。{negative_note}。{tip}。',
      // 中等文案版
      '逛了{duration}。{spot}{spot_desc}，必去。{spot2}{spot_desc2}。{spot_note}。交通{traffic_desc}。不过{negative_note}。门票{price}，{value_note}。{tip}',
      '早上{time}到的，{spot_note}。{spot}{spot_desc}，值得专门来。{spot2}{spot_desc2}。逛了{duration}，体力活。{negative_note}。门票{price}，{value_note}。{tip}',
      // 长文案版
      '【打卡点】\n{spot}{spot_desc}，必去！\n{spot2}{spot_desc2}。\n{spot_note}。\n\n【攻略】\n交通{traffic_desc}。\n逛了{duration}，穿舒服的鞋。\n{tip}\n\n【不足】\n{negative_note}。\n\n门票{price}，{value_note}。',
    ],
    xiaohongshu: [
      // 短文案版
      '{spot}{spot_desc}！也太出片了吧📸\n{spot2}{spot_desc2}。\n{tip}\n门票{price}',
      '随手一拍都是大片✨\n{spot}{spot_desc}。\n{spot2}{spot_desc2}。\n{spot_note}。\n门票{price}，{value_note}',
      // 中等文案版
      '{meme}！\n{spot}{spot_desc}，必去📸\n{spot2}{spot_desc2}。\n{spot_note}。\n逛了{duration}，穿舒服的鞋。\n交通{traffic_desc}。\n{negative_note}。\n门票{price}，{value_note}\n记得收藏这篇攻略\n📍{location}',
      '跟风来的景点，说下真实感受👇\n{spot}{spot_desc}，没踩雷✅\n{spot2}{spot_desc2}。\n早上{time}到的，{spot_note}。\n{negative_note}。\n但风景确实没话说\n门票{price}，{value_note}\n{tip}\n📍{location}',
      // 长文案版
      '{meme}！！\n终于来打卡了，太久了\n\n📖打卡点：\n{spot}{spot_desc}，必去！出片率100%📸\n{spot2}{spot_desc2}。\n{spot_note}。\n\n🏠攻略：\n交通{traffic_desc}。\n逛了{duration}，穿舒服的鞋。\n{tip}\n\n💬真实感受：\n{negative_note}。\n但{value_note}。\n门票{price}\n\n记得收藏不迷路📌\n📍{location}',
    ],
    douyin: [
      // 短文案版
      '{spot}{spot_desc}！{spot2}{spot_desc2}。门票{price}。{tip} #旅行',
      '随手一拍都是大片！{spot}{spot_desc}。{tip} #旅行 #打卡',
      // 中等文案版
      '{spot}{spot_desc}，必去！{spot2}{spot_desc2}。{spot_note}。逛了{duration}。{tip}。{negative_note}。门票{price} #旅行 #打卡',
      '{spot}{spot_desc}！{spot2}{spot_desc2}。早上{time}到的，{spot_note}。{negative_note}。但风景确实没话说。门票{price} #旅行',
      // 长文案版
      '{spot}{spot_desc}，必去！出片率100%！\n{spot2}{spot_desc2}。\n{spot_note}。\n\n逛了{duration}，穿舒服的鞋。\n{tip}\n\n不足：{negative_note}。\n交通{traffic_desc}。\n\n门票{price}，{value_note}\n#旅行 #打卡',
    ],
  },
  shopping: {
    dianping: [
      // 短文案版
      '用了{duration}来评价。{product}{product_desc}。优点是{pro}，{negative_note}。{value_note}。',
      '{product}用了一段时间，{product_desc}。{pro}这点不错。{negative_note}。{value_note}。',
      // 中等文案版
      '{product}{product_desc}。优点是{pro}，这点不错。{negative_note}。质感对得起价格。{value_note}。{tip}',
      '{product}{product_desc}。{pro}。{negative_note}。{value_note}。{tip}',
      // 长文案版
      '【产品】\n{product}{product_desc}。\n质感对得起价格。\n\n【优点】\n{pro}，这点不错。\n\n【缺点】\n{negative_note}。\n\n【使用建议】\n{tip}\n\n{value_note}。',
    ],
    xiaohongshu: [
      // 短文案版
      '{product}{product_desc}！也太香了吧🔥\n{pro}。\n{negative_note}。\n{value_note}',
      '跟风买的{product}，指定有点说法！\n{product_desc}。\n{pro}，这点太香了。\n{value_note}',
      // 中等文案版
      '{meme}！\n{product}{product_desc}🔥\n{pro}，这点太香了。\n{negative_note}。\n质感对得起价格。\n{value_note}\n{tip}\n记得收藏这篇',
      '跟风买的{product}，说下真实感受👇\n{product}{product_desc}。\n{pro}，没踩雷✅\n{negative_note}。\n但{value_note}。\n{tip}\n📍{location}',
      // 长文案版
      '{meme}！！\n用了一段时间来认真评价\n\n📖产品：\n{product}{product_desc}。\n质感对得起价格。\n\n👍优点：\n{pro}，这点太香了！\n\n👎缺点：\n{negative_note}\n\n💬使用建议：\n{tip}\n\n{value_note}\n记得收藏不迷路📌',
    ],
    douyin: [
      // 短文案版
      '{product}{product_desc}！{pro}。{negative_note}。{value_note}。#好物',
      '跟风买的{product}，指定有点说法！{pro}。{negative_note} #好物 #开箱',
      // 中等文案版
      '{product_desc}。{pro}，这点太香了。{negative_note}。{value_note}。{tip} #好物 #好物分享',
      '{product}{product_desc}！{pro}。{negative_note}。但{value_note}。{tip} #好物',
      // 长文案版
      '{product}{product_desc}。\n质感对得起价格。\n\n优点：{pro}，这点太香了！\n缺点：{negative_note}\n\n使用建议：{tip}\n\n{value_note}\n#好物 #好物分享 #开箱',
    ],
  },
  lifestyle: {
    dianping: [
      // 短文案版
      '{detail1}。{detail2}。{overall_note}。',
      '今天{activity}，{detail1}。{detail2}。{overall_note}。',
      // 中等文案版
      '今天{activity}。{detail1}。{detail2}。{detail3}。{overall_note}。',
      '周末{activity}，{detail1}。{detail2}。{overall_note}。没什么特别的但记录一下。',
      // 长文案版
      '今天{activity}。\n\n{detail1}。\n{detail2}。\n{detail3}。\n\n{overall_note}。',
    ],
    xiaohongshu: [
      // 短文案版
      '今天{activity}。\n{detail1}。\n{detail2}。\n{overall_note}✨',
      '记录一下。\n{detail1}。\n{detail2}。\n{overall_note}。',
      // 中等文案版
      '{meme}！\n今天{activity}。\n{detail1}。\n{detail2}。\n{detail3}。\n{overall_note}。\n偶尔慢下来挺好',
      '周末{activity}，记录一下👇\n{detail1}。\n{detail2}。\n{detail3}。\n{overall_note}。\n平淡但舒服',
      // 长文案版
      '{meme}！！\n今天{activity}\n\n📖记录：\n{detail1}。\n{detail2}。\n{detail3}。\n\n💬感受：\n{overall_note}。\n偶尔慢下来挺好\n\n记得收藏不迷路📌',
    ],
    douyin: [
      // 短文案版
      '{detail1}。{detail2}。{overall_note}。#日常',
      '今天{activity}，{detail1}。{overall_note} #日常',
      // 中等文案版
      '{detail1}。{detail2}。{detail3}。{overall_note} #日常 #生活记录',
      '周末{activity}，{detail1}。{detail2}。{overall_note} #日常',
      // 长文案版
      '{detail1}。\n{detail2}。\n{detail3}。\n\n{overall_note}\n#日常 #生活记录',
    ],
  },
  beauty: {
    dianping: [
      // 短文案版
      '{product}用了{duration}，{product_desc}。{texture}，{effect}。适合{skin_type}。{negative_note}。{value_note}。',
      '试用了{product}，{product_desc}。{effect}。{texture}。{negative_note}。{tip}。',
      // 中等文案版
      '{product}{product_desc}。{texture}，{effect}。适合{skin_type}。{negative_note}。但{value_note}。{tip}',
      '{product}{product_desc}。{effect}，这点很惊喜。{texture}。我是{skin_type}，{negative_note}。{value_note}。',
      // 长文案版
      '【产品】\n{product}{product_desc}。\n包装好看但实用性一般。\n\n【肤感】\n{texture}，{effect}。\n适合{skin_type}。\n\n【不足】\n{negative_note}。\n\n【使用建议】\n{tip}\n\n{value_note}。',
    ],
    xiaohongshu: [
      // 短文案版
      '{product}{product_desc}！也太香了吧🔥\n{effect}。\n{texture}。\n我是{skin_type}，{value_note}',
      '跟风入的{product}，指定有点说法！\n{effect}。\n{negative_note}。\n但{value_note}',
      // 中等文案版
      '{meme}！\n{product}{product_desc}🔥\n{effect}，这点很惊喜。\n{texture}。\n适合{skin_type}。\n{negative_note}。\n但{value_note}\n{tip}\n记得收藏这篇',
      '跟风入的{product}，说下真实感受👇\n{product}{product_desc}。\n{effect}，没踩雷✅\n{texture}。\n我是{skin_type}，{negative_note}。\n但{value_note}。\n{tip}',
      // 长文案版
      '{meme}！！\n用了半个月来认真评价\n\n📖产品：\n{product}{product_desc}。\n包装好看但实用性一般。\n\n👍优点：\n{effect}，这点很惊喜！\n肤感{texture}。\n适合{skin_type}。\n\n👎缺点：\n{negative_note}\n\n💬使用建议：\n{tip}\n\n{value_note}\n记得收藏不迷路📌',
    ],
    douyin: [
      // 短文案版
      '{product}{product_desc}！{effect}。{negative_note}。{value_note}。#美妆',
      '跟风入的{product}，指定有点说法！{effect}。{texture} #美妆',
      // 中等文案版
      '{product_desc}。{effect}，这点很惊喜。{texture}。适合{skin_type}。{negative_note}。{value_note} #美妆 #护肤',
      '{product}{product_desc}！{effect}。{texture}。我是{skin_type}，{negative_note}。但{value_note} #美妆',
      // 长文案版
      '{product}{product_desc}。\n包装好看但实用性一般。\n\n优点：{effect}，这点很惊喜！\n肤感{texture}。\n适合{skin_type}。\n\n缺点：{negative_note}\n\n使用建议：{tip}\n\n{value_note}\n#美妆 #护肤',
    ],
  },
  home: {
    dianping: [
      // 短文案版
      '用了{duration}。{product}{product_desc}。{pro}。{negative_note}。{value_note}。',
      '{product}入手{duration}，{product_desc}。{pro}。{negative_note}。{tip}。',
      // 中等文案版
      '{product}{product_desc}。{pro}，这点不错。{negative_note}。质感对得起价格。{value_note}。{tip}',
      '{product}{product_desc}。{pro}。{negative_note}。租房党刚需。{value_note}。',
      // 长文案版
      '【产品】\n{product}{product_desc}。\n质感对得起价格。\n\n【优点】\n{pro}，这点太香了。\n\n【缺点】\n{negative_note}。\n\n【使用建议】\n{tip}\n\n{value_note}。',
    ],
    xiaohongshu: [
      // 短文案版
      '{product}{product_desc}！也太香了吧🔥\n{pro}。\n{negative_note}。\n{value_note}',
      '跟风买的{product}，指定有点说法！\n{product_desc}。\n{pro}，幸福感飙升。\n{value_note}',
      // 中等文案版
      '{meme}！\n{product}{product_desc}🔥\n{pro}，这点太香了。\n{negative_note}。\n租房党刚需。\n{value_note}\n{tip}\n记得收藏这篇',
      '跟风买的{product}，说下真实感受👇\n{product}{product_desc}。\n{pro}，没踩雷✅\n{negative_note}。\n但{value_note}。\n{tip}',
      // 长文案版
      '{meme}！！\n用了一个月来认真评价\n\n📖产品：\n{product}{product_desc}。\n质感对得起价格。\n\n👍优点：\n{pro}，这点太香了！\n\n👎缺点：\n{negative_note}\n\n💬使用建议：\n{tip}\n\n{value_note}\n记得收藏不迷路📌',
    ],
    douyin: [
      // 短文案版
      '{product}{product_desc}！{pro}。{negative_note}。{value_note}。#家居',
      '跟风买的{product}，指定有点说法！{pro}。{negative_note} #家居 #家居好物',
      // 中等文案版
      '{product_desc}。{pro}，这点太香了。{negative_note}。{value_note}。{tip} #家居 #家居好物',
      '{product}{product_desc}！{pro}。{negative_note}。但{value_note}。{tip} #家居',
      // 长文案版
      '{product}{product_desc}。\n质感对得起价格。\n\n优点：{pro}，这点太香了！\n缺点：{negative_note}\n\n使用建议：{tip}\n\n{value_note}\n#家居 #家居好物',
    ],
  },
  pet: {
    dianping: [
      // 短文案版
      '今天{pet_name}{detail1}。{detail2}。',
      '记录{pet_name}的日常，{detail1}。{detail2}。',
      // 中等文案版
      '今天{pet_name}{detail1}。{detail2}。{detail3}。体检一切正常，医生说状态不错。',
      '{detail1}。{detail2}。{detail3}。又胖了半斤。',
      // 长文案版
      '{detail1}。\n{detail2}。\n{detail3}。\n\n体检一切正常，医生说状态不错。\n又胖了半斤。',
    ],
    xiaohongshu: [
      // 短文案版
      '{pet_name}今天{detail1}🐾\n{detail2}。\n也太可爱了吧！',
      '记录{pet_name}的日常。\n{detail1}。\n{detail2}。\n治愈系没错了✨',
      // 中等文案版
      '{meme}！\n{pet_name}今天{detail1}🐾\n{detail2}。\n{detail3}。\n体检一切正常，医生说状态不错。\n也太可爱了吧',
      '记录{pet_name}的日常👇\n{detail1}。\n{detail2}。\n{detail3}。\n又胖了半斤。\n治愈系没错了✨',
      // 长文案版
      '{meme}！！\n今天记录{pet_name}的日常\n\n📖日常：\n{detail1}。\n{detail2}。\n{detail3}。\n\n💬感受：\n体检一切正常，医生说状态不错。\n又胖了半斤。\n治愈系没错了✨\n\n记得收藏不迷路📌',
    ],
    douyin: [
      // 短文案版
      '{pet_name}今天{detail1}。{detail2}。#萌宠',
      '家人们{pet_name}也太可爱了吧！{detail1} #萌宠',
      // 中等文案版
      '今天{detail1}。{detail2}。{detail3}。治愈系 #萌宠 #宠物日常',
      '今天{detail1}。{detail2}。{detail3} #萌宠',
      // 长文案版
      '今天{detail1}。\n{detail2}。\n{detail3}。\n\n治愈系没错了\n#萌宠 #宠物日常',
    ],
  },
};

// ========== 文案结尾模板（去AI味版） ==========
// 原则：不要升华总结，闲话收尾或戛然而止
const CLOSING_TEMPLATES = {
  dianping: [
    '{revisit}。',
    '{tip}',
    '{revisit}。',
    '评分{rating}。',
    '{revisit}。',
  ],
  xiaohongshu: [
    '📍{location}\n\n{hashtags}',
    '\n\n{hashtags}',
    '📍{location}\n\n{hashtags}',
    '\n\n{hashtags}',
  ],
  douyin: [
    '📍{location}\n\n{hashtags}',
  ],
};

// ========== 标签/话题库 ==========
const HASHTAG_POOLS = {
  food: ['#探店', '#美食', '#同城美食', '#吃货', '#美食打卡', '#探店分享', '#周末去哪吃', '#美食记录', '#吃吃喝喝', '#日常'],
  cafe: ['#咖啡店', '#下午茶', '#咖啡', '#探店咖啡', '#甜品', '#咖啡日常', '#周末下午茶', '#甜品控', '#咖啡续命', '#打卡'],
  travel: ['#旅行', '#旅游', '#旅行打卡', '#旅行记录', '#周末去哪儿', '#旅行日记', '#风景', '#说走就走', '#旅行分享', '#打卡'],
  shopping: ['#好物分享', '#好物', '#开箱', '#测评', '#购物分享', '#日常好物', '#回购', '#平价好物', '#生活好物', '#种草'],
  lifestyle: ['#日常', '#生活记录', '#日常碎片', '#生活', '#小确幸', '#日常打卡', '#生活日常', '#记录生活', '#周末', '#慢生活'],
  beauty: ['#美妆', '#护肤', '#护肤分享', '#好物分享', '#美妆测评', '#护肤打卡', '#日常护肤', '#平价好物', '#护肤记录', '#试色'],
  home: ['#家居', '#收纳', '#租房', '#家居好物', '#生活好物', '#收纳整理', '#居家好物', '#小户型', '#装修', '#幸福感'],
  pet: ['#萌宠', '#猫', '#狗', '#宠物日常', '#毛孩子', '#吸猫', '#撸狗', '#宠物', '#猫奴', '#养宠日常'],
};

// ========== 描述词库（去AI味版） ==========
// 原则：具体、真实、有画面感，不用"绝了""天花板"等套话
const DESC_WORDS = {
  taste: [
    '外酥里嫩，层次分明', '酱汁裹得均匀，入味', '口感细腻，有嚼劲',
    '食材新鲜，火候到位', '调味适中，不会太重', '香气挺足的',
    '汤底浓郁，不寡淡', '层次丰富', '入口即化',
    '原汁原味，没加太多调料', '外焦里嫩', '甜咸刚好',
    '有点惊艳', '是我喜欢的口味', '味道在线',
    '第一口不错，吃多了有点腻', '整体偏清淡', '调味偏重',
  ],
  env: [
    '装修简约，灯光暖', '空间宽敞，不拥挤',
    '走文艺路线，适合拍照', '工业风，氛围感还行',
    '日式原木风，安静', '小店但温馨',
    '落地窗采光好', '绿植多，清新',
    '就是有点吵', '音乐开太大', '空调不太够',
  ],
  service: [
    '态度热情，上菜快', '响应及时，有问必答',
    '中规中矩', '会主动介绍招牌',
    '高峰期忙不过来', '加水收拾都挺及时',
    '点单时推荐了挺多', '服务员对菜品很熟',
  ],
  portion: ['适中', '偏大', '实在', '够吃', '比预期多', '两个人三个菜刚好', '有点少'],
  flavor_note: ['咸鲜口', '微辣', '偏清淡', '酱香浓郁', '酸甜口', '香辣', '偏甜', '偏咸'],
  occasion: ['朋友聚餐', '约会', '家庭聚会', '一人食', '闺蜜局', '同事聚餐'],
  value_note: ['对得起这个价', '性价比不错', '偏贵但能接受', '有点贵', '这个价位算合理', '性价比一般', '值得', '还行'],
  revisit: ['会再来', '会推荐给朋友', '应该会回购', '偶尔会来', '看心情', '下次带别人来', '会回购'],
  photo_time: ['早上光线最好', '下午四点后光线柔和', '傍晚日落时分', '上午人少', '阴天反而好拍'],
  texture: ['轻薄不黏腻', '滋润但不油', '好推开', '上脸服帖', '质地清爽', '偏厚但能接受'],
  effect: ['提亮明显', '保湿够用', '遮瑕在线', '持妆半天', '效果一般', '用了一段时间有改善'],
  skin_type: ['干皮', '油皮', '混油', '敏感肌', '所有肤质'],
  color_desc: ['显白', '日常百搭', '素颜也能用', '黄皮友好', '偏冷调', '偏暖调'],
  // 按场景区分的缺点（避免不相关的缺点出现在错误场景）
  negative_notes_by_scene: {
    food: ['等位有点久', '某道菜偏咸', '上菜慢了点', '空调不太够', '停车不好找', '有点吵', '分量偏少', '价格小贵', '味道偏甜', '服务高峰期跟不上', '环境有点挤', '味道没想象中好', '稍微有点腻'],
    cafe: ['空调不太够', '有点吵', '座位有点挤', '插座不好找', 'Wi-Fi信号一般', '价格小贵', '味道没想象中好', '甜品偏甜', '咖啡偏淡'],
    travel: ['人多要排队', '停车不好找', '厕所有点远', '有段路不好走', '门票偏贵', '天气太热', '走完挺累', '拍照要排队', '人比想象中多'],
    shopping: ['包装一般', '物流慢了点', '说明书不清晰', '尺寸偏小', '颜色比图片深', '需要自己组装', '没有赠品', '客服回复慢', '质感没想象中好', '功能比预期少'],
    beauty: ['用了有点干', '色号偏暗', '持久度一般', '味道不太喜欢', '泵头设计不好', '用量比较费', '包装一般', '上脸有点厚', '敏感肌用了有点泛红'],
    home: ['安装花了点时间', '尺寸偏小', '材质比图片薄', '需要自己组装', '承重比预期低', '清理有点麻烦', '味道有点大（散散就好）', '颜色有色差'],
    lifestyle: ['人多', '天气有点热', '停车不好找', '人比想象中多'],
    pet: ['又拆家了', '掉毛有点多', '不太配合', '看到零食就疯', '早上叫早'],
  },
  env_note: [
    '环境不错，适合待一下午', '安静，能专心干活', '氛围好，拍照好看',
    '就是座位有点挤', '音乐不吵', '空调足',
  ],
  duration_note: [
    '没被催', '服务员没来打扰', '挺自由的',
    '就是插座不好找', 'Wi-Fi还行',
  ],
  spot_desc: [
    '视野开阔，能看全景', '建筑有特色，出片', '自然风光很震撼', '人少，体验好',
  ],
  spot_desc2: ['别有洞天', '也值得看', '慢慢逛挺舒服', '拍照必去'],
  spot_note: ['人还不算多', '光线正好', '不用排队拍照', '体验不错'],
  traffic_desc: ['自驾方便，有停车场', '地铁直达，走五分钟', '建议打车', '公交可达'],
  product_desc: [
    '包装有质感', '设计简约好看', '做工没瑕疵', '颜值在线，实用也行',
    '尺寸刚好', '材质摸着舒服', '比图片好看', '细节处理不错',
  ],
  pro: ['颜值高', '性价比好', '实用', '质感不错', '设计合理', '做工精致', '功能齐全', '好收纳'],
  overall_note: ['挺开心的', '挺充实', '很放松', '心情不错', '平淡但舒服', '小确幸', '挺好的', '没什么特别的但记录一下'],
  detail1: [
    '天气很好阳光足', '沿途风景不错', '遇到点有趣的事', '吃到了想吃的',
    '拍到了满意的照片', '起得早就出门了', '没什么计划随便走走',
  ],
  detail2: [
    '和朋友聊了挺多', '时间过得快', '整个人放松下来了', '收获满满',
    '心情挺好', '没踩雷', '比预期好', '就那样吧也不差',
  ],
  detail3: ['今天也是元气满满的一天', '记录一下', '凑个九宫格', '日常碎片'],
  pet_name: ['小橘子', '团团', '咪咪', '大橘', '布丁', '汤圆', '花花', '小黑'],
};

// ========== 填充词库（按场景区分，避免搭配错误） ==========
const FILLER_WORDS = {
  // 正餐菜品
  dish: ['招牌牛肉面', '手作蛋糕', '烤肉拼盘', '招牌意面', '手工披萨', '炸鸡', '鲜虾沙拉', '熔岩蛋糕', '卤味拼盘', '酸汤肥牛', '蒜蓉粉丝虾', '红豆沙', '椰子鸡', '水煮鱼', '回锅肉', '麻婆豆腐', '宫保鸡丁'],
  // 咖啡甜品专属
  cafe_dish: ['拿铁', '美式', '卡布奇诺', '手冲单品', '提拉米苏', '芝士蛋糕', '可颂', '马卡龙', '巴斯克蛋糕', 'Dirty咖啡', '燕麦拿铁', '肉桂卷'],
  // 美妆专属产品
  beauty_product: ['这款粉底液', '这支口红', '这款精华', '这瓶爽肤水', '这款防晒', '这盘眼影', '这款面霜', '这支眉笔', '这款腮红', '这瓶卸妆水'],
  // 好物分享专属产品
  shopping_product: ['这个收纳盒', '这个帆布包', '这个手机壳', '这个保温杯', '这个充电宝', '这款台灯', '这个置物架', '这款香薰', '这款背包', '这个卡包'],
  // 家居专属产品
  home_product: ['这个收纳盒', '这个置物架', '这款台灯', '这个衣架', '这款收纳柜', '这个鞋架', '这款地毯', '这个窗帘', '这款懒人沙发', '这个微波炉架'],
  spot: ['观景台', '玻璃栈道', '花海', '古街', '湖边栈道', '山顶', '博物馆', '老巷子', '海边', '森林步道'],
  location: ['市中心', '老城区', '商场三楼', '文创园', '地铁口附近', '江边', '大学城', '写字楼底下', '小区门口', '步行街'],
  activity: ['City Walk', '下午茶', '逛街', '公园待了一下午', '看展', '骑行', '爬山', '逛市集'],
  wait: ['20', '30', '40', '50', '60', '十来'],
  time: ['八点', '九点', '十点', '下午两点'],
};

// ========== 默认识别关键词 ==========
const DEFAULT_RECOGNITION = {
  food: {
    objects: ['餐桌', '菜品', '餐具', '饮品'],
    mood: '日常、烟火气',
    colors: ['暖色调', '食欲感'],
    tags: ['美食', '探店', '堂食'],
  },
  cafe: {
    objects: ['咖啡杯', '甜点', '桌椅', '绿植'],
    mood: '安静、放松',
    colors: ['原木色', '暖白'],
    tags: ['咖啡', '下午茶', '文艺'],
  },
  travel: {
    objects: ['自然风光', '建筑', '道路', '天空'],
    mood: '开阔、舒畅',
    colors: ['明亮', '饱和度高'],
    tags: ['旅行', '风景', '打卡'],
  },
  shopping: {
    objects: ['商品', '包装', '桌面', '细节展示'],
    mood: '期待、实用',
    colors: ['清晰', '质感突出'],
    tags: ['好物', '开箱', '测评'],
  },
  lifestyle: {
    objects: ['生活场景', '日常物件', '环境'],
    mood: '平静、日常',
    colors: ['自然', '柔和'],
    tags: ['日常', '生活', '记录'],
  },
  beauty: {
    objects: ['美妆产品', '试用效果', '包装'],
    mood: '精致、日常',
    colors: ['粉嫩', '高级感'],
    tags: ['美妆', '试色', '好物'],
  },
  home: {
    objects: ['家具', '家居装饰', '收纳用品'],
    mood: '温馨、实用',
    colors: ['温馨', '简约'],
    tags: ['家居', '生活', '好物'],
  },
  pet: {
    objects: ['宠物', '毛绒', '可爱'],
    mood: '治愈、日常',
    colors: ['柔和', '温暖'],
    tags: ['萌宠', '日常', '记录'],
  },
};

// ========== 随机插入的语气停顿（增加人味儿） ==========
const TONE_PUNCTUATIONS = [
  '怎么说呢，', '其实吧，', '讲真，', '说实话，', '有一说一，',
  'emmm，', '反正，', '不过，', '我个人觉得，', '别问，问就是',
];

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SCENE_TYPES, MEME_DATABASE, TITLE_PATTERNS, OPENING_TEMPLATES,
    BODY_TEMPLATES, CLOSING_TEMPLATES, HASHTAG_POOLS, DESC_WORDS,
    FILLER_WORDS, DEFAULT_RECOGNITION, TONE_PUNCTUATIONS,
  };
}
