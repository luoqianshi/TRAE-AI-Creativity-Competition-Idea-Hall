// ============================================================
//  东方快车 文字扮演游戏引擎
//  TRAE AI 创造力大赛作品
// ============================================================

(function() {
'use strict';

// ---- 游戏状态 ----
var state = {
  stage: 'boarding',
  activeChar: null,
  apiKey: '',
  chatHistory: [],
  stageProgress: {
    boarding: { talkedTo: {}, required: 3 },
    dinner: { done: false },
    murder: { discovered: false },
    investigation: { clues: [], questioned: {} },
    revelation: { revealed: false }
  }
};

// ---- 12角色数据 ----
var characters = {
  poirot: {
    id: 'poirot', name: '赫尔克里·波洛', role: '比利时侦探',
    emoji: '🕵️',
    personality: '你是著名侦探赫尔克里·波洛。观察力极强，善用"灰色小细胞"。说话彬彬有礼，带法语口音。',
    responses: {
      boarding: [
        "Bonjour，我的朋友。我是赫尔克里·波洛，一位小小的侦探。我注意到你也在观察车上的乘客，很好，很好。",
        "啊，这列东方快车，它承载过多少故事啊。我本想在伊斯坦布尔好好休息，但命运总是有别的安排，不是吗？",
        "你问我为什么在这趟车上？很简单，我的朋友，有一桩案子在伦敦等着我。不过，旅途本身也是一种乐趣。"
      ],
      dinner: [
        "今晚的晚餐很不错，但有些乘客似乎心不在焉。尤其是那位雷切特先生，他看起来非常紧张。",
        "朋友，你有没有注意到餐车里每个人的表情？一个好的侦探，即使在吃饭时也在工作。"
      ],
      murder: [
        "Mon Dieu！这太可怕了。雷切特先生被杀了。十二处刀伤，每一个都可能是不同的凶手……不，这太疯狂了，但疯狂之中往往藏着真相。",
        "我需要你的帮助，朋友。你也在车上，也许你看到了什么。任何细节都可能至关重要。"
      ],
      investigation: [
        "每个人都有不在场证明，但每个人也都有动机。不可能的事情恰恰是真相的钥匙。",
        "我注意到了一些有趣的事……比如瑞典女士的护照，还有伯爵夫人的手帕。但暂时还不能告诉你更多。",
        "你问我怀疑谁？我的朋友，我怀疑所有人，又不怀疑任何人。这就是侦探的困境。"
      ],
      revelation: [
        "真相往往比虚构更离奇。十二个人，十二刀——不，应该说，十二个陪审员。雷切特不是无辜的受害者，他是卡塞蒂，那个绑架并杀害小女孩黛西的恶魔。而这十二个人，都与那个案件有关……",
        "这就是真相，我的朋友。法律有时无法伸张正义，但人心不会忘记。"
      ]
    }
  },
  hubbard: {
    id: 'hubbard', name: '赫伯德太太', role: '美国贵妇',
    emoji: '👵',
    personality: '你是赫伯德太太，自称化妆品推销员，实际上曾是著名演员琳达·阿登。表面大大咧咧，内心藏着深沉的悲伤。',
    responses: {
      boarding: [
        "哎哟，亲爱的！这火车可真不错，比我上次坐的那趟好多了。我是赫伯德太太，从美国来，做化妆品生意的。你呢？",
        "你听说了吗？这车上有个大侦探！叫什么波洛的。我总觉得这趟旅途不会太平，我这个人直觉一向很准。"
      ],
      dinner: [
        "今晚的牛排煎得太老了！不过红酒还不错。你有没有看到那个叫雷切特的男人？他看人的眼神让我浑身不舒服。",
        "我隔壁包厢就是雷切特先生，半夜里总是听到奇怪的动静。我准备找列车员投诉！"
      ],
      murder: [
        "天哪！天哪！我就说昨晚不对劲！我听到了隔壁有动静，还有人在走廊里走来走去。我吓得把门锁得死死的！",
        "雷切特先生被杀了？我一点也不意外。那种人，迟早会有人找上门的。"
      ],
      investigation: [
        "侦探问我了，我什么都说了。我昨晚确实听到了一些声音，但我可不敢开门。你知道的，我一个孤身女人……",
        "我听说雷切特不是真名。啧啧，这水可深着呢。"
      ],
      revelation: [
        "是的，我认识他。我认识卡塞蒂。他毁了我的家庭，毁了我女儿黛西。我装疯卖傻这么多年，等的就是这一天。"
      ]
    }
  },
  debenham: {
    id: 'debenham', name: '玛丽·德本汉', role: '英国家庭教师',
    emoji: '👩‍🏫',
    personality: '你是玛丽·德本汉，冷静理智的英国家庭教师。举止优雅，说话得体，内心非常坚定。曾是小黛西·阿姆斯特朗的家庭教师。',
    responses: {
      boarding: [
        "你好，我是玛丽·德本汉。我在巴格达完成了一份家庭教师的工作，现在准备返回英国。这趟旅程很长，但东方快车总能让人心情愉悦。",
        "那位阿巴思诺特上校看起来是个正直的人。我们在伊斯坦布尔就认识了，他帮了我不少忙。"
      ],
      dinner: [
        "晚餐时雷切特先生坐在远处，我尽量避免和他目光接触。有些人，你一看就知道不该靠近。",
        "波洛先生在观察每一个人。他看起来只是随便聊天，但那双眼睛什么都不会放过。"
      ],
      murder: [
        "这太可怕了。虽然我不认识雷切特先生，但任何谋杀都是悲剧。我希望波洛先生能尽快找出凶手。",
        "不，我昨晚什么也没听到。我睡得很沉，可能是因为旅途太累了。"
      ],
      investigation: [
        "波洛先生问了我很多，关于我的行李、护照、来历。我能感觉到他怀疑每个人。",
        "我确实有一些秘密，但和这起谋杀无关。至少，我是这么告诉自己的。"
      ],
      revelation: [
        "是的，我认识黛西·阿姆斯特朗。她是我见过的最可爱的孩子。当我听说卡塞蒂在这趟车上时，我知道命运终于给了他应得的审判。"
      ]
    }
  },
  arbuthnot: {
    id: 'arbuthnot', name: '阿巴思诺特上校', role: '英国陆军上校',
    emoji: '🎖️',
    personality: '你是阿巴思诺特上校，英国陆军军官，印度服役归来。沉默寡言、正直刚毅，不轻易表露情感。',
    responses: {
      boarding: [
        "阿巴思诺特，陆军上校。刚从印度回来。如果你不介意的话，我想安静地看会儿报纸。",
        "德本汉小姐？她是一位令人尊敬的女士。我们在旅途中互相照应，仅此而已。"
      ],
      dinner: [
        "餐车上的气氛有些微妙。我不喜欢过多社交，但即使是我也能感觉到，这车上的人各怀心事。",
        "雷切特？没怎么注意。看起来就是个普通的美国商人。"
      ],
      murder: [
        "谋杀？在火车上？这太荒谬了。不过既然发生了，我信任波洛先生的能力。需要我帮忙的地方尽管说。",
        "昨晚我在自己的包厢里，整晚都在读一本关于印度战役的书。没有证人，但这也是事实。"
      ],
      investigation: [
        "波洛问了很多关于我和德本汉小姐关系的问题。我告诉他，我们只是旅途中的同伴。他没有追问。",
        "我是个军人，我相信正义。有时候，正义不是法庭能给的。"
      ],
      revelation: [
        "阿姆斯特朗上校是我最好的战友。卡塞蒂逃脱了法律制裁，但逃不过我们的审判。我参与了，我承认，而且我不后悔。"
      ]
    }
  },
  dragomiroff: {
    id: 'dragomiroff', name: '德拉戈米罗夫公主', role: '俄国贵族',
    emoji: '👑',
    personality: '你是德拉戈米罗夫公主，年迈的俄国贵族。举手投足尽显优雅和威严，说话缓慢而有力。你是黛西·阿姆斯特朗的教母。',
    responses: {
      boarding: [
        "年轻人，你看起来有些紧张。不必如此，我虽然是个公主，但不会咬人。请坐。",
        "这趟火车让我想起了沙皇时代的荣光。那时候，东方快车才真正是东方的女王。"
      ],
      dinner: [
        "晚餐马马虎虎，不过在这种地方，也不能奢求太多。我注意到波洛先生一直在观察我。他很有意思。",
        "雷切特？那个粗鲁的美国人。他试图和我搭话，但我没有理会。"
      ],
      murder: [
        "谋杀？在这列火车上？这让我想起了圣彼得堡的某些往事。年轻人，不要害怕，命运自有它的安排。",
        "我的女仆施密特整晚都和我在一起。她拿着我的关节炎药，我离不开她。"
      ],
      investigation: [
        "波洛来问话了。我如实回答了他。一个公主不会说谎，但也不一定什么都说。",
        "我注意到了一些细节，但我选择不说。有些事情，留给侦探自己去发现更有趣。"
      ],
      revelation: [
        "黛西是我的教女。我看着她出生，看着她长大，看着她被夺走。卡塞蒂在这趟车上？那是命运的安排。"
      ]
    }
  },
  macqueen: {
    id: 'macqueen', name: '赫克托·麦奎因', role: '雷切特的秘书',
    emoji: '💼',
    personality: '你是赫克托·麦奎因，雷切特的私人秘书。表面上尽职的雇员，但父亲曾是阿姆斯特朗案的检察官，卡塞蒂毁了你的家庭。',
    responses: {
      boarding: [
        "你好，我是麦奎因，雷切特先生的秘书。请多关照。老板在包厢里休息，他不太喜欢和人打交道。",
        "这趟旅行是老板临时决定的。他最近收到了几封恐吓信，所以我们想快点离开伊斯坦布尔。"
      ],
      dinner: [
        "老板今晚没来吃饭，他让我把晚餐送到包厢。他最近总是很紧张，睡不好觉。",
        "说实话，给雷切特先生工作压力很大。但没有办法，我需要这份工作。"
      ],
      murder: [
        "天哪，老板被杀了！我……我昨晚确实给他送过晚餐，但之后我就回自己包厢了。我什么都不知道！",
        "波洛先生，请一定要找到凶手。虽然雷切特先生不是个好老板，但没有人应该这样死去。"
      ],
      investigation: [
        "侦探问了很多关于老板的事情。我全说了，包括那些恐吓信。老板似乎知道有人要杀他。",
        "我父亲是检察官。他在阿姆斯特朗案后抑郁而死。这就是为什么我来到了这里。"
      ],
      revelation: [
        "是的，我知道雷切特就是卡塞蒂。我故意成为他的秘书，等的就是这一刻。我父亲因为无法将卡塞蒂绳之以法而自责至死。"
      ]
    }
  },
  masterman: {
    id: 'masterman', name: '爱德华·马斯特曼', role: '雷切特的男仆',
    emoji: '🤵',
    personality: '你是爱德华·马斯特曼，雷切特的贴身男仆。沉默寡言，做事一丝不苟。曾是一名军人，阿姆斯特朗上校是你的长官。',
    responses: {
      boarding: [
        "先生/女士，我是马斯特曼，雷切特先生的贴身男仆。有什么需要可以告诉我。",
        "老板的行李比较多，他旅行时总是带很多东西。请原谅我不能多聊，还有工作要做。"
      ],
      dinner: [
        "老板今晚不吃饭，我给他送了热牛奶。他最近睡眠不好，需要安眠药。",
        "不，我不觉得老板有什么异常。他一直是这样的，对下属很严格，但也不至于太过分。"
      ],
      murder: [
        "这太可怕了。我昨晚最后一次见到老板是晚上九点，我给他送了安眠药和热水。之后我就回自己包厢了。",
        "我为雷切特先生工作了几个月。他不是一个好相处的人，但这是我的工作。"
      ],
      investigation: [
        "波洛问了很多关于那晚的细节，包括安眠药的剂量、门是否锁好。我如实回答了一切。",
        "我认识阿姆斯特朗上校。他是我见过的最好的长官。卡塞蒂毁了他的一切。"
      ],
      revelation: [
        "当我知道雷切特就是卡塞蒂时，我知道我必须做点什么。阿姆斯特朗上校给了我一切，这是我唯一能回报的。"
      ]
    }
  },
  ohlsson: {
    id: 'ohlsson', name: '格丽塔·奥尔松', role: '瑞典传教士',
    emoji: '🙏',
    personality: '你是格丽塔·奥尔松，瑞典传教士，温柔善良。说话带着瑞典口音，轻声细语。你曾是黛西·阿姆斯特朗的保姆。',
    responses: {
      boarding: [
        "上帝保佑你，亲爱的。我是奥尔松小姐，去巴黎传教。这趟火车真漂亮，不是吗？",
        "我看到一位老妇人需要帮助，但她的女仆似乎很能干。我希望每个人都能平安到达目的地。"
      ],
      dinner: [
        "晚餐很好吃，但我吃不下太多。我最近胃口不太好。雷切特先生？他看起来确实很不安。",
        "我今晚要祈祷很久。我感觉有什么不好的事情要发生了。"
      ],
      murder: [
        "哦，上帝！雷切特先生被杀了！我……我昨晚确实听到了声音，但我以为是火车在转弯。我太害怕了，不敢开门。",
        "请原谅我，我太紧张了。我一生中从未遇到过这样的事情。"
      ],
      investigation: [
        "波洛先生很和善，但他问的问题让我喘不过气来。我告诉他我昨晚在祈祷，这是真的。",
        "我撒了谎。我确实听到了什么，但我不想说。请原谅我。"
      ],
      revelation: [
        "小黛西……她是我的天使。当卡塞蒂逃脱时，我发誓要在天堂里亲自审判他。上帝原谅我，我参与了。"
      ]
    }
  },
  andrenyi: {
    id: 'andrenyi', name: '安德雷尼伯爵', role: '匈牙利外交官',
    emoji: '🎩',
    personality: '你是安德雷尼伯爵，匈牙利外交官。彬彬有礼，风度翩翩，对妻子保护欲极强。妻子海伦娜是黛西·阿姆斯特朗的姨妈。',
    responses: {
      boarding: [
        "晚上好。我是安德雷尼伯爵，这是我的妻子，安德雷尼伯爵夫人。她身体不太舒服，需要休息。",
        "我们会尽量不打扰其他乘客。如果有什么需要，列车员会帮我们处理的。"
      ],
      dinner: [
        "我妻子今晚身体不适，我们在包厢里用餐。请代我向其他乘客致歉。",
        "雷切特？不太了解。我很少关注同车的乘客，尤其是那些看起来不太友善的人。"
      ],
      murder: [
        "谋杀！这太令人震惊了。我妻子受到了惊吓，她现在需要休息。请理解，我不能离开她太久。",
        "昨晚我一直和妻子在一起。她的身体不太好，需要照顾。"
      ],
      investigation: [
        "波洛先生非常专业，但我不能让他打扰我的妻子。她的健康比什么都重要。",
        "我有很多秘密，但都和这起谋杀无关。我以我的荣誉担保。"
      ],
      revelation: [
        "我的妻子海伦娜是黛西的姨妈。她为此自责了多年。当她听说卡塞蒂在这趟车上时，她几乎崩溃了。我做了任何丈夫都会做的事。"
      ]
    }
  },
  foscarelli: {
    id: 'foscarelli', name: '安东尼奥·福斯卡雷利', role: '意大利汽车推销员',
    emoji: '🚗',
    personality: '你是安东尼奥·福斯卡雷利，热情的意大利汽车推销员。说话表情丰富，手势夸张。曾是阿姆斯特朗家的司机。',
    responses: {
      boarding: [
        "Ciao！多么美好的夜晚！我是福斯卡雷利，卖汽车的。意大利最好的汽车，如果你感兴趣的话！",
        "这列火车让我想起了意大利的风景。虽然比不上我们美丽的托斯卡纳，但也很不错！"
      ],
      dinner: [
        "意大利面！他们居然做了意大利面！虽然不是正宗的，但已经很不错了。来，尝尝这个红酒。",
        "雷切特？他看起来心情不太好。我试着和他聊天，但他完全不理我。"
      ],
      murder: [
        "Mamma mia！谋杀！在我乘坐的火车上！这简直像电影一样！",
        "我昨晚睡得很死，什么都没听到。不过我的包厢在车厢的另一头，离雷切特先生很远。"
      ],
      investigation: [
        "波洛问我关于我职业的问题。我告诉他我卖汽车，他看起来不太相信。也许我应该改行卖火车票！",
        "我认识阿姆斯特朗家。他们是我最好的客户，也是我最好的朋友。"
      ],
      revelation: [
        "小黛西最喜欢坐我的菲亚特兜风。她总是说'安东尼奥，开快点！'当卡塞蒂逃脱时，我发誓总有一天会让他付出代价。"
      ]
    }
  },
  michel: {
    id: 'michel', name: '皮埃尔·米歇尔', role: '列车员',
    emoji: '🧑‍✈️',
    personality: '你是皮埃尔·米歇尔，东方快车的列车员。工作了多年，认识车上每一个人。你的女儿曾是阿姆斯特朗家的女佣。',
    responses: {
      boarding: [
        "欢迎乘坐东方快车！我是您的列车员米歇尔。有什么需要随时找我。",
        "今晚的乘客很多，而且来自各个国家。我见过各种各样的人，但这趟车似乎特别……有趣。"
      ],
      dinner: [
        "晚餐服务已经开始了，请前往餐车用餐。想在包厢用餐，也可以告诉我。",
        "雷切特先生点了很多菜送到包厢。他似乎不想见任何人。"
      ],
      murder: [
        "天哪！雷切特先生……我昨晚确实在走廊里巡视过，但什么都没发现。雪太大了，火车被困住了。",
        "波洛先生让我检查了所有车厢。没有人能离开这列火车。"
      ],
      investigation: [
        "我向波洛提供了所有乘客的名单和包厢号。他问了很多关于那晚巡逻路线的问题。",
        "我在这列火车上工作了二十年，从来没有发生过这样的事。"
      ],
      revelation: [
        "我的女儿在阿姆斯特朗家工作过。当卡塞蒂逃脱后，她失去了工作，失去了希望。我做了我必须做的事。"
      ]
    }
  },
  hardman: {
    id: 'hardman', name: '赛勒斯·哈德曼', role: '美国私家侦探',
    emoji: '🕶️',
    personality: '你是赛勒斯·哈德曼，美国私家侦探，受雇于雷切特来保护他。说话直接，硬汉风格。曾是黛西·阿姆斯特朗家的邻居。',
    responses: {
      boarding: [
        "哈德曼，私家侦探。雷切特先生雇我来处理一些私人事务。别担心，不是什么大事。",
        "这趟火车人太多了。人越多，越难控制。但这是我的工作。"
      ],
      dinner: [
        "雷切特先生让我盯着所有乘客。他说有人要杀他。我本来以为他多虑了，现在看来……",
        "我注意到了几个可疑的人，但我不能说太多。职业操守。"
      ],
      murder: [
        "该死！我应该更警惕的。雷切特先生雇我来保护他，现在他死了。这是我的失职。",
        "但说实话，我怀疑这趟车上有太多人想要他的命。这不是普通的谋杀。"
      ],
      investigation: [
        "波洛让我交出我的调查笔记。我照做了。反正雷切特先生已经死了，没人付我钱了。",
        "我认识阿姆斯特朗家。黛西是个好孩子。有些人，活该下地狱。"
      ],
      revelation: [
        "我本来应该是保护雷切特的人，但当我发现他就是卡塞蒂时，我做不到。我选择了站在正义的一边。"
      ]
    }
  }
};

// ---- 剧情阶段 ----
var stages = {
  boarding: {
    name: '登车',
    systemMsg: '🚂 东方快车从伊斯坦布尔缓缓驶出，夜幕降临。你在餐车中坐下，周围是来自世界各地的乘客。空气中弥漫着咖啡和雪茄的味道，还有一丝说不清的紧张感。',
    trigger: null
  },
  dinner: {
    name: '晚餐',
    systemMsg: '🍷 晚餐时间到了。餐车里的水晶吊灯摇曳生辉，乘客们陆续入座。雷切特先生没有出现，他的秘书说他身体不适。窗外，大雪开始纷飞。',
    trigger: 'boarding',
    triggerCondition: function(s) { return countTalked(s) >= 3; }
  },
  murder: {
    name: '谋杀',
    systemMsg: '🔪 清晨，一声尖叫划破了东方快车的宁静。雷切特先生被发现死在自己的包厢中，身中十二刀。火车因大雪被困在南斯拉夫境内，所有人都是嫌疑人。前往现场调查吧。',
    trigger: 'dinner',
    triggerCondition: function(s) { return s.stageProgress.dinner.done; }
  },
  investigation: {
    name: '调查',
    systemMsg: '🔍 波洛开始了他的调查。他逐一询问每一位乘客，仔细记录每一个细节。你可以在旁观察，也可以协助调查。每个人的不在场证明都完美无缺，但每个人似乎都有秘密。',
    trigger: 'murder',
    triggerCondition: function(s) { return s.stageProgress.murder.discovered; }
  },
  revelation: {
    name: '真相',
    systemMsg: '⚖️ 波洛召集了所有乘客，准备公布真相。餐车里的气氛凝重得令人窒息。',
    trigger: 'investigation',
    triggerCondition: function(s) { return countQuestioned(s) >= 5; }
  }
};

function countTalked(s) {
  var count = 0;
  for (var key in s.stageProgress.boarding.talkedTo) {
    if (s.stageProgress.boarding.talkedTo.hasOwnProperty(key) && s.stageProgress.boarding.talkedTo[key]) count++;
  }
  return count;
}

function countQuestioned(s) {
  var count = 0;
  for (var key in s.stageProgress.investigation.questioned) {
    if (s.stageProgress.investigation.questioned.hasOwnProperty(key) && s.stageProgress.investigation.questioned[key]) count++;
  }
  return count;
}

// ---- DOM 引用 ----
var $ = function(id) { return document.getElementById(id); };

// ---- 初始化 ----
function init() {
  renderCharList();
  loadApiKey();
  addSystemMsg(stages[state.stage].systemMsg);
  $('stageBadge').textContent = stages[state.stage].name;
  $('msgInput').focus();
}

window.resetGame = function() {
  state.stage = 'boarding';
  state.activeChar = null;
  state.chatHistory = [];
  state.stageProgress = {
    boarding: { talkedTo: {}, required: 3 },
    dinner: { done: false },
    murder: { discovered: false },
    investigation: { clues: [], questioned: {} },
    revelation: { revealed: false }
  };
  $('chatMessages').innerHTML = '';
  $('stageBadge').textContent = '登车';
  $('chatCharName').textContent = '车厢';
  $('chatCharRole').textContent = '东方快车 · 伊斯坦布尔 → 巴黎';
  init();
};

function renderCharList() {
  var container = $('charList');
  container.innerHTML = '';
  var keys = Object.keys(characters);
  for (var i = 0; i < keys.length; i++) {
    var char = characters[keys[i]];
    var div = document.createElement('div');
    div.className = 'char-card' + (state.activeChar === char.id ? ' active' : '');
    div.innerHTML =
      '<div class="avatar">' + char.emoji + '</div>' +
      '<div class="info">' +
        '<div class="name">' + char.name + '</div>' +
        '<div class="role">' + char.role + '</div>' +
      '</div>' +
      '<div class="new-msg" id="dot-' + char.id + '"></div>';
    (function(id) {
      div.onclick = function() { selectChar(id); };
    })(char.id);
    container.appendChild(div);
  }
}

function selectChar(charId) {
  state.activeChar = charId;
  var char = characters[charId];
  $('chatCharName').textContent = char.name;
  $('chatCharRole').textContent = char.role;
  $('msgInput').focus();
  var dot = $('dot-' + charId);
  if (dot) dot.classList.remove('show');
  renderCharList();

  var existingMsgs = state.chatHistory.filter(function(m) { return m.charId === charId; });
  if (existingMsgs.length === 0) {
    var responses = char.responses[state.stage];
    var greeting = responses ? responses[0] : '你好。';
    addCharMsg(charId, greeting);
    markTalked(charId);
    checkStageProgression();
  }
}

function markTalked(charId) {
  state.stageProgress.boarding.talkedTo[charId] = true;
}

function markQuestioned(charId) {
  state.stageProgress.investigation.questioned[charId] = true;
}

// ---- 阶段推进 ----
function checkStageProgression() {
  var nextStages = ['boarding', 'dinner', 'murder', 'investigation', 'revelation'];
  var currentIdx = nextStages.indexOf(state.stage);
  for (var i = currentIdx + 1; i < nextStages.length; i++) {
    var nextStage = nextStages[i];
    var stageDef = stages[nextStage];
    if (stageDef.triggerCondition && stageDef.triggerCondition(state)) {
      if (state.stage !== nextStage) {
        state.stage = nextStage;
        $('stageBadge').textContent = stages[nextStage].name;
        addSystemMsg(stages[nextStage].systemMsg);
        if (nextStage === 'murder') {
          state.stageProgress.murder.discovered = true;
          showDot('poirot');
        }
        if (nextStage === 'investigation') {
          showDot('poirot');
        }
      }
      break;
    }
  }
}

function showDot(charId) {
  var dot = $('dot-' + charId);
  if (dot) dot.classList.add('show');
}

// ---- 消息渲染 ----
function addSystemMsg(text) {
  state.chatHistory.push({ role: 'system', sender: '系统', text: text });
  var div = document.createElement('div');
  div.className = 'msg system';
  div.innerHTML = '<div class="bubble">' + text + '</div>';
  $('chatMessages').appendChild(div);
  scrollToBottom();
}

function addUserMsg(text) {
  state.chatHistory.push({ role: 'user', sender: '你', text: text });
  var div = document.createElement('div');
  div.className = 'msg user';
  div.innerHTML = '<div class="sender">你</div><div class="bubble">' + text + '</div>';
  $('chatMessages').appendChild(div);
  scrollToBottom();
}

function addCharMsg(charId, text) {
  var char = characters[charId];
  state.chatHistory.push({ role: 'char', sender: char.name, text: text, charId: charId });
  var div = document.createElement('div');
  div.className = 'msg char';
  div.innerHTML = '<div class="sender">' + char.emoji + ' ' + char.name + '</div><div class="bubble">' + text + '</div>';
  $('chatMessages').appendChild(div);
  scrollToBottom();
  if (state.activeChar !== charId) {
    showDot(charId);
  }
}

function scrollToBottom() {
  var container = $('chatMessages');
  setTimeout(function() { container.scrollTop = container.scrollHeight; }, 50);
}

// ---- Mock 回复系统 ----
function getMockResponse(char, userMsg) {
  var responses = char.responses[state.stage];
  if (!responses || responses.length === 0) {
    return getGenericResponse();
  }
  var msg = userMsg.toLowerCase();
  var patterns = [
    { regex: /雷切特|ratchett|被害人|死者/, test: function(r) { return r.indexOf('雷切特') !== -1; } },
    { regex: /凶手|杀人|谋杀|杀|死|murder|kill/, test: function(r) { return r.indexOf('杀') !== -1 || r.indexOf('死') !== -1; } },
    { regex: /波洛|poirot|侦探|调查/, test: function(r) { return r.indexOf('波洛') !== -1 || r.indexOf('侦探') !== -1; } },
    { regex: /不在场|时间|昨晚|那天|alibi/, test: function(r) { return r.indexOf('昨晚') !== -1 || r.indexOf('不在场') !== -1; } },
    { regex: /阿姆斯特朗|armstrong|黛西|daisy|卡塞蒂/, test: function(r) { return r.indexOf('阿姆斯特朗') !== -1 || r.indexOf('黛西') !== -1 || r.indexOf('卡塞蒂') !== -1; } },
    { regex: /秘密|真相|tell|告诉|知道|认识/, test: function(r) { return true; } },
    { regex: /你好|hello|hi|嗨|认识|谁/, test: function(r) { return true; } }
  ];
  for (var i = 0; i < patterns.length; i++) {
    if (patterns[i].regex.test(msg)) {
      var matched = [];
      for (var j = 0; j < responses.length; j++) {
        if (patterns[i].test(responses[j])) matched.push(responses[j]);
      }
      if (matched.length > 0) return matched[0];
    }
  }
  return responses[Math.floor(Math.random() * responses.length)];
}

function getGenericResponse() {
  var generics = [
    '这确实是个有趣的问题。不过现在，我更关心这趟车上发生的事。',
    '我不确定该怎么回答你。也许你应该去问问波洛先生，他才是侦探。',
    '请原谅，我现在没有心情谈论这个。',
    '你看起来是个好人，但有些事情，还是不说为好。'
  ];
  return generics[Math.floor(Math.random() * generics.length)];
}

// ---- DeepSeek API 调用 ----
function callDeepSeek(charId, userMsg) {
  var char = characters[charId];
  var systemPrompt = '你正在扮演《东方快车谋杀案》中的角色：' + char.name + '（' + char.role + '）。\n\n' +
    '角色设定：' + char.personality + '\n\n' +
    '当前剧情阶段：' + stages[state.stage].name + '\n\n' +
    '重要规则：\n' +
    '1. 完全沉浸在这个角色中，用角色的语气和口吻说话\n' +
    '2. 回复简短（50-150字），符合对话场景\n' +
    '3. 不要说出你不知道的信息\n' +
    '4. 用中文回复';

  var msgs = [];
  msgs.push({ role: 'system', content: systemPrompt });
  var recent = state.chatHistory.filter(function(m) { return m.charId === charId || m.role === 'user'; }).slice(-10);
  for (var i = 0; i < recent.length; i++) {
    msgs.push({ role: recent[i].role === 'char' ? 'assistant' : 'user', content: recent[i].text });
  }
  msgs.push({ role: 'user', content: userMsg });

  return fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + state.apiKey
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: msgs,
      temperature: 0.8,
      max_tokens: 300
    })
  }).then(function(resp) { return resp.json(); })
    .then(function(data) {
      if (data.choices && data.choices[0]) {
        return data.choices[0].message.content;
      }
      throw new Error('API format error');
    })
    .catch(function(e) {
      console.error('DeepSeek API error:', e);
      return null;
    });
}

// ---- 发送消息 ----
window.sendMessage = function() {
  var input = $('msgInput');
  var text = input.value.trim();
  if (!text) return;
  if (!state.activeChar) {
    addSystemMsg('💡 请先点击左侧乘客名录，选择一位乘客进行对话。');
    input.value = '';
    return;
  }
  input.value = '';
  $('sendBtn').disabled = true;
  addUserMsg(text);

  var char = characters[state.activeChar];

  if (state.apiKey) {
    callDeepSeek(state.activeChar, text).then(function(reply) {
      if (!reply) reply = getMockResponse(char, text);
      addCharMsg(state.activeChar, reply);
      afterReply();
    });
  } else {
    addCharMsg(state.activeChar, getMockResponse(char, text));
    afterReply();
  }
};

function afterReply() {
  markTalked(state.activeChar);
  markQuestioned(state.activeChar);
  if (state.stage === 'dinner') {
    state.stageProgress.dinner.done = true;
  }
  if (state.stage === 'revelation') {
    state.stageProgress.revelation.revealed = true;
  }
  checkStageProgression();
  $('sendBtn').disabled = false;
  $('msgInput').focus();
}

// ---- API Key 管理 ----
window.toggleApiModal = function() {
  var modal = $('apiModal');
  var isVisible = modal.style.display !== 'none';
  modal.style.display = isVisible ? 'none' : 'flex';
  if (!isVisible) {
    $('apiKeyInput').value = state.apiKey;
  }
};

window.saveApiKey = function() {
  state.apiKey = $('apiKeyInput').value.trim();
  try { localStorage.setItem('deepseek_key', state.apiKey); } catch(e) {}
  toggleApiModal();
  updateApiBtn();
  if (state.apiKey) {
    addSystemMsg('✅ DeepSeek API 已连接，AI 实时对话已启用！');
  } else {
    addSystemMsg('💡 已切换到演示模式（预设回复）。配置 API Key 可启用 AI 实时对话。');
  }
};

function loadApiKey() {
  try { state.apiKey = localStorage.getItem('deepseek_key') || ''; } catch(e) { state.apiKey = ''; }
  updateApiBtn();
}

function updateApiBtn() {
  var btn = $('apiBtn');
  if (state.apiKey) {
    btn.textContent = '⚙ API ✓';
    btn.classList.add('active');
  } else {
    btn.textContent = '⚙ API';
    btn.classList.remove('active');
  }
}

// ---- 启动 ----
init();

})();