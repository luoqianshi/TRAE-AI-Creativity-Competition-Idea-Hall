const riddlesData = [
    {
        id: 1,
        level: 'easy',
        category: '字谜',
        question: '一口咬掉牛尾巴（打一字）',
        answer: '告',
        aliases: [],
        hints: ['牛字的尾巴被咬掉后，上面加上一个口字', '和"告诉"的"告"字相同'],
        explanation: '"牛"字的下半部分被去掉，上面加上"口"字，组合成"告"字。'
    },
    {
        id: 2,
        level: 'easy',
        category: '字谜',
        question: '画时圆，写时方，冬时短，夏时长（打一字）',
        answer: '日',
        aliases: ['太阳'],
        hints: ['这个字代表太阳', '它是时间的基本单位'],
        explanation: '太阳画出来是圆形的，但写出来是方形的；冬天日照时间短，夏天日照时间长。'
    },
    {
        id: 3,
        level: 'easy',
        category: '字谜',
        question: '千条线，万条线，掉到水里看不见（打一自然现象）',
        answer: '雨',
        aliases: ['雨水', '下雨'],
        hints: ['从天空落下的水滴', '会让地面变湿'],
        explanation: '雨滴像千条万条线一样从天空落下，落到水里就和水融为一体，看不见了。'
    },
    {
        id: 4,
        level: 'easy',
        category: '动物谜',
        question: '头戴红帽子，身穿白袍子，走路摆架子，说话伸脖子（打一动物）',
        answer: '鹅',
        aliases: ['白鹅', '家鹅'],
        hints: ['家禽的一种，会游泳', '叫声很响亮'],
        explanation: '鹅的头顶有红色的肉瘤，羽毛是白色的，走路时姿态优雅，叫的时候会伸长脖子。'
    },
    {
        id: 5,
        level: 'easy',
        category: '动物谜',
        question: '耳朵长，尾巴短，红眼睛，白毛衫，三瓣嘴儿胆子小，青菜萝卜吃个饱（打一动物）',
        answer: '兔子',
        aliases: ['兔', '小白兔'],
        hints: ['常见的宠物，喜欢吃胡萝卜', '生肖之一'],
        explanation: '兔子耳朵长、尾巴短，眼睛是红色的，毛是白色的，嘴巴是三瓣的，性格胆小，喜欢吃青菜萝卜。'
    },
    {
        id: 6,
        level: 'easy',
        category: '物品谜',
        question: '兄弟七八个，围着柱子坐，大家一分手，衣服就扯破（打一物品）',
        answer: '大蒜',
        aliases: ['蒜', '蒜头'],
        hints: ['厨房常用的调味品', '由多个蒜瓣组成'],
        explanation: '大蒜由七八个蒜瓣组成，围着中间的蒜茎生长，剥开的时候会把蒜皮扯破。'
    },
    {
        id: 7,
        level: 'easy',
        category: '物品谜',
        question: '有面没有口，有脚没有手，虽有四只脚，自己不会走（打一家具）',
        answer: '桌子',
        aliases: ['桌'],
        hints: ['用来吃饭或写字的家具', '通常有四条腿'],
        explanation: '桌子有桌面但没有口，有桌腿但没有手，虽然有四条腿，但自己不会移动。'
    },
    {
        id: 8,
        level: 'easy',
        category: '自然谜',
        question: '远看像座山，近看不是山，上边水直流，下边石头干（打一自然景观）',
        answer: '瀑布',
        aliases: [],
        hints: ['从高处倾泻而下的水流', '李白有诗描写它'],
        explanation: '瀑布远看像一座山，但走近一看不是山；水流从高处直泻而下，下面的石头却保持干燥。'
    },
    {
        id: 9,
        level: 'easy',
        category: '字谜',
        question: '半个月亮（打一字）',
        answer: '胖',
        aliases: [],
        hints: ['月字加上半个什么字？', '和"瘦"相对的字'],
        explanation: '"月"字加上"半"字，组合成"胖"字。'
    },
    {
        id: 10,
        level: 'easy',
        category: '物品谜',
        question: '身穿绿衣裳，肚里水汪汪，生的子儿多，个个黑脸膛（打一水果）',
        answer: '西瓜',
        aliases: ['瓜'],
        hints: ['夏天常吃的水果，果肉是红色的', '有绿色的外皮'],
        explanation: '西瓜外皮是绿色的，里面水分很多，籽是黑色的。'
    },
    {
        id: 11,
        level: 'medium',
        category: '字谜',
        question: '一点一横长，一撇到南洋，南洋有个人，只有一寸长（打一字）',
        answer: '府',
        aliases: [],
        hints: ['和"政府"的"府"字相同', '包含点、横、撇、人、寸'],
        explanation: '"府"字的结构：一点一横长（亠），一撇到南洋（丿），南洋有个人（亻），只有一寸长（寸）。'
    },
    {
        id: 12,
        level: 'medium',
        category: '字谜',
        question: '左边一个女，右边一个男，站在一起，人人称赞（打一字）',
        answer: '好',
        aliases: [],
        hints: ['左边是"女"字旁，右边是"子"', '表示优秀、出色'],
        explanation: '"好"字左边是"女"，右边是"子"（代表男子），男女结合是美好的事情。'
    },
    {
        id: 13,
        level: 'medium',
        category: '动物谜',
        question: '身披花棉袄，唱歌呱呱叫，田里捉害虫，丰收立功劳（打一动物）',
        answer: '青蛙',
        aliases: ['蛙', '田鸡'],
        hints: ['两栖动物，夏天晚上会叫', '专门吃害虫'],
        explanation: '青蛙身上有花纹，叫声是"呱呱"的，在田里捕食害虫，对农业丰收有很大帮助。'
    },
    {
        id: 14,
        level: 'medium',
        category: '动物谜',
        question: '名字叫做牛，不会拉犁头，说它力气小，背着房子走（打一动物）',
        answer: '蜗牛',
        aliases: ['蜗'],
        hints: ['软体动物，爬行很慢', '背上有壳'],
        explanation: '蜗牛名字里有"牛"，但不会拉犁；它力气小，背着自己的壳（像房子一样）爬行。'
    },
    {
        id: 15,
        level: 'medium',
        category: '物品谜',
        question: '小小诸葛亮，独坐中军帐，摆下八卦阵，专捉飞来将（打一动物）',
        answer: '蜘蛛',
        aliases: ['蛛'],
        hints: ['会织网捕捉昆虫', '诸葛亮是古代军事家'],
        explanation: '蜘蛛织网像诸葛亮布阵一样，等待昆虫自投罗网。'
    },
    {
        id: 16,
        level: 'medium',
        category: '物品谜',
        question: '四四方方一块布，嘴和鼻子都盖住，两根带子耳上挂，不怕风沙不怕土（打一物品）',
        answer: '口罩',
        aliases: [],
        hints: ['用来遮挡口鼻', '预防疾病传播'],
        explanation: '口罩是方形的布，用来盖住嘴巴和鼻子，有两根带子挂在耳朵上，可以防止风沙和灰尘进入口鼻。'
    },
    {
        id: 17,
        level: 'medium',
        category: '自然谜',
        question: '看不见，摸不着，没有颜色没味道，动物植物都需要，一时一刻离不了（打一物质）',
        answer: '空气',
        aliases: ['氧气'],
        hints: ['无色无味的气体', '生命必需'],
        explanation: '空气看不见、摸不着、没有颜色和味道，但所有生物都需要它才能生存。'
    },
    {
        id: 18,
        level: 'medium',
        category: '字谜',
        question: '有口难言，有木难燃，有日难晒，有心难安（打一字）',
        answer: '亚',
        aliases: [],
        hints: ['加上"口"变成"哑"，加上"木"变成"桠"', '和"亚军"的"亚"相同'],
        explanation: '"亚"字加上不同的偏旁：口+亚=哑（不能说话），木+亚=桠（树枝），日+亚=显，心+亚=恶（不安）。'
    },
    {
        id: 19,
        level: 'medium',
        category: '物品谜',
        question: '一个小姑娘，生在水中央，身穿粉红衫，坐在绿船上（打一植物）',
        answer: '荷花',
        aliases: ['莲花', '菡萏'],
        hints: ['夏季开花，生长在池塘里', '出淤泥而不染'],
        explanation: '荷花生长在水中，花瓣是粉红色的，荷叶像绿色的小船托着荷花。'
    },
    {
        id: 20,
        level: 'medium',
        category: '字谜',
        question: '上不在上，下不在下，人有它大，天没它大（打一字）',
        answer: '一',
        aliases: [],
        hints: ['最简单的汉字', '在"上"字的下面，"下"字的上面'],
        explanation: '"一"在"上"字的下面（不是上面），在"下"字的上面（不是下面）；"人"加上"一"变成"大"，"天"去掉"一"变成"大"。'
    },
    {
        id: 21,
        level: 'hard',
        category: '字谜',
        question: '一月又一月，两月共半边，上有可耕之田，下有长流之川，一家有六口，两口不团圆（打一字）',
        answer: '用',
        aliases: [],
        hints: ['两个"月"字组合', '中间是"田"，下面是"川"'],
        explanation: '"用"字由两个"月"组成（共半边），上面像"田"，下面像"川"，共有六笔（六口），但结构不是完整的团圆形状。'
    },
    {
        id: 22,
        level: 'hard',
        category: '字谜',
        question: '有头没有颈，身上冷冰冰，有翅不能飞，无脚也能行（打一动物）',
        answer: '鱼',
        aliases: ['鱼儿'],
        hints: ['生活在水里', '有鳍但没有翅膀'],
        explanation: '鱼有头但没有脖子，身体是冷的，有鳍但不能飞，没有脚但能在水里游动。'
    },
    {
        id: 23,
        level: 'hard',
        category: '动物谜',
        question: '头戴珊瑚帽，身穿梅花袄，腿儿细又长，翻山快如飞（打一动物）',
        answer: '梅花鹿',
        aliases: ['鹿'],
        hints: ['头上有角，身上有斑点', '擅长奔跑跳跃'],
        explanation: '梅花鹿头上的角像珊瑚，身上的斑点像梅花，腿细长，奔跑速度很快。'
    },
    {
        id: 24,
        level: 'hard',
        category: '物品谜',
        question: '稀奇稀奇真稀奇，拿人鼻子当马骑（打一物）',
        answer: '眼镜',
        aliases: ['镜'],
        hints: ['架在鼻梁上', '帮助看清东西'],
        explanation: '眼镜架在人的鼻子上，就像把鼻子当作马一样骑在上面。'
    },
    {
        id: 25,
        level: 'hard',
        category: '自然谜',
        question: '像云不是云，像烟不是烟，风吹轻轻飘，日出慢慢散（打一自然现象）',
        answer: '雾',
        aliases: ['雾气'],
        hints: ['早晨常见', '会影响能见度'],
        explanation: '雾看起来像云又像烟，随风飘动，太阳出来后会慢慢消散。'
    },
    {
        id: 26,
        level: 'hard',
        category: '字谜',
        question: '千言万语（打一字）',
        answer: '够',
        aliases: [],
        hints: ['包含"句"字', '表示数量很多'],
        explanation: '"够"字由"句"和"多"组成，表示句子很多，即千言万语。'
    },
    {
        id: 27,
        level: 'hard',
        category: '物品谜',
        question: '一只黑鞋子，黑帮黑底子，挂破鞋口子，漏出白袜子（打一物）',
        answer: '西瓜子',
        aliases: ['瓜子'],
        hints: ['黑色的外壳，白色的果仁', '常作为零食'],
        explanation: '西瓜子外壳是黑色的，像黑鞋子，磕开后里面的果仁是白色的，像白袜子。'
    },
    {
        id: 28,
        level: 'hard',
        category: '字谜',
        question: '一字十八口（打一字）',
        answer: '杏',
        aliases: ['呆', '束'],
        hints: ['由"十"、"八"、"口"组成', '一种水果'],
        explanation: '"杏"字由"十"、"八"、"口"三个部分组成。'
    },
    {
        id: 29,
        level: 'hard',
        category: '动物谜',
        question: '身穿铁甲衣，脚踏梅花桩，威武又神气，看守大门前（打一动物）',
        answer: '狗',
        aliases: ['犬', '看门狗'],
        hints: ['忠诚的动物', '脚印像梅花'],
        explanation: '狗身上的毛发像铁甲，脚印像梅花，通常用来看守大门，样子威武。'
    },
    {
        id: 30,
        level: 'hard',
        category: '字谜',
        question: '皇帝的衣服（打一字）',
        answer: '袭',
        aliases: [],
        hints: ['皇帝是"龙"，衣服是"衣"', '和"袭击"的"袭"相同'],
        explanation: '皇帝穿的衣服叫"龙袍"，"龙"加上"衣"组成"袭"字。'
    }
];