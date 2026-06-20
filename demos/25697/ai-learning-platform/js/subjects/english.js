// ========== 英语科目模块 - 按学龄分类 ==========
// 智学空间 - 英语知识库与智能应答

window.SubjectModules.english = {
    id: 'english',
    name: '英语',
    icon: '\uD83C\uDDEC\uD83C\uDDE7',

    levels: {
        kindergarten: {
            name: '幼儿园',
            topics: [
                {
                    id: 'ek-alphabet',
                    name: '英文字母',
                    keywords: ['字母', 'abc', 'alphabet', 'a到z'],
                    knowledge: '英语共有26个字母，分为大写和小写。\n元音字母（5个）：Aa, Ee, Ii, Oo, Uu\n辅音字母（21个）：其余所有字母\n字母歌：A-B-C-D-E-F-G, H-I-J-K-L-M-N, O-P-Q, R-S-T, U-V-W, X-Y-Z',
                    example: '写出5个元音字母：A, E, I, O, U',
                    analysis: '元音字母是发音时口腔不受阻的字母，英语中只有5个。',
                    mistakes: '常见错误：把Y当成元音字母（Y有时是半元音，但标准元音只有5个），大小写混淆。',
                    tips: '唱字母歌帮助记忆，用卡片练习大小写配对。'
                },
                {
                    id: 'ek-simple-words',
                    name: '简单英语单词',
                    keywords: ['单词', '认单词', '学单词', '基础单词'],
                    knowledge: '基础英语单词分类：\n\n颜色：red红色, blue蓝色, green绿色, yellow黄色, white白色, black黑色\n数字：one一, two二, three三, four四, five五\n动物：cat猫, dog狗, bird鸟, fish鱼, rabbit兔子\n水果：apple苹果, banana香蕉, orange橙子, grape葡萄',
                    example: 'apple是苹果，banana是香蕉，cat是猫，dog是狗。',
                    analysis: '学习单词要结合图片和实物，看到物品就想到对应的英文单词。',
                    mistakes: '常见错误：只记中文意思不记拼写，发音不准确。',
                    tips: '每天学5个新单词，用闪卡反复练习，看到实物就说英文。'
                },
                {
                    id: 'ek-greetings',
                    name: '日常问候语',
                    keywords: ['你好', '问候', 'hello', 'good morning', '打招呼'],
                    knowledge: '常用英语问候语：\nHello! 你好！\nGood morning! 早上好！\nGood afternoon! 下午好！\nGood evening! 晚上好！\nGood night! 晚安！\nGoodbye! 再见！\nThank you! 谢谢！\nSorry! 对不起！\nYou\'re welcome! 不客气！',
                    example: 'A: Good morning!\nB: Good morning!\nA: How are you?\nB: I\'m fine, thank you!',
                    analysis: 'Good morning用于上午，Good afternoon用于下午，Good evening用于傍晚。',
                    mistakes: '常见错误：把Good night当成"晚上好"（实际是"晚安"）。',
                    tips: '每天用英语和同学打招呼，养成说英语的习惯。'
                },
                {
                    id: 'ek-phonics',
                    name: '自然拼读基础',
                    keywords: ['拼读', '发音', 'phonics', '读音'],
                    knowledge: '自然拼读是通过字母发音规律来读单词的方法。\n\n常见字母发音：\nb-/b/ (boy), c-/k/ (cat), d-/d/ (dog)\nf-/f/ (fish), g-/g/ (go), h-/h/ (hat)\nm-/m/ (man), n-/n/ (net), p-/p/ (pen)\n\n元音字母发音：\na-/ae/ (apple), e-/e/ (egg), i-/i/ (ink)\no-/o/ (orange), u-/\u028c/ (umbrella)',
                    example: 'c-a-t 拼在一起读 /kaet/，就是 cat（猫）。\nb-a-t 拼在一起读 /baet/，就是 bat（蝙蝠）。',
                    analysis: '自然拼读的核心是掌握每个字母的基本发音，然后按顺序拼读。',
                    mistakes: '常见错误：按中文拼音读英文字母，混淆字母名和字母音。',
                    tips: '多听多读，跟着音频练习发音，每天练习5个单词的拼读。'
                }
            ]
        },
        primary: {
            name: '小学',
            topics: [
                {
                    id: 'ep-tenses-basic',
                    name: '基础时态',
                    keywords: ['时态', '一般现在时', '一般过去时', '一般将来时', '现在进行时'],
                    knowledge: '英语四大基础时态：\n\n1. 一般现在时：主语+动词原形（三单加s/es）\n   用法：习惯、事实\n   例：I go to school every day.\n\n2. 一般过去时：主语+动词过去式\n   用法：过去发生的事\n   例：I went to Beijing yesterday.\n\n3. 一般将来时：will+动词原形 / be going to+动词原形\n   用法：将来的计划\n   例：I will visit my grandma tomorrow.\n\n4. 现在进行时：am/is/are+doing\n   用法：正在进行的动作\n   例：She is reading a book now.',
                    example: '用正确时态填空：\n1. I ___ (go) to school every day. \u2192 go\n2. He ___ (play) football yesterday. \u2192 played\n3. We ___ (have) a picnic tomorrow. \u2192 will have\n4. She ___ (sing) now. \u2192 is singing',
                    analysis: 'every day用一般现在时，yesterday用一般过去时，tomorrow用一般将来时，now用现在进行时。',
                    mistakes: '常见错误：第三人称单数忘记加s（He go \u2192 He goes），过去式不规则变化记错。',
                    tips: '注意时间标志词：every day\u2192现在时，yesterday\u2192过去时，tomorrow\u2192将来时，now\u2192进行时。'
                },
                {
                    id: 'ep-grammar-basics',
                    name: '基础语法',
                    keywords: ['语法', '名词', '动词', '形容词', 'be动词', '句型'],
                    knowledge: '词性分类：\n名词（noun）：人、事物、地点（book, teacher, Beijing）\n动词（verb）：动作或状态（run, is, like）\n形容词（adjective）：描述特征（big, happy, red）\n副词（adverb）：描述方式（quickly, very, always）\n介词（preposition）：表示关系（in, on, at, to）\n\nbe动词：am（I后），is（he/she/it后），are（we/you/they后）\n\n5种基本句型：\nS+V / S+V+O / S+V+P / S+V+IO+O / S+V+O+C',
                    example: '分析句子成分：\nThe happy boy reads an interesting book.\n主语：The happy boy\n谓语：reads\n宾语：an interesting book',
                    analysis: '主语是动作执行者，谓语是动词，宾语是动作承受者。形容词修饰名词。',
                    mistakes: '常见错误：be动词和实义动词混用（He is like \u2192 He likes），主谓不一致。',
                    tips: '每天分析3个句子的成分，掌握5种基本句型。'
                },
                {
                    id: 'ep-vocabulary-expand',
                    name: '词汇扩展',
                    keywords: ['词汇', '单词', '词组', '短语', '常用词'],
                    knowledge: '小学核心词汇分类：\n\n家庭：family, father, mother, brother, sister\n学校：school, teacher, student, classroom, homework\n食物：rice, bread, milk, egg, chicken, vegetable\n身体：head, eye, ear, nose, mouth, hand, foot\n颜色：red, blue, green, yellow, white, black, pink\n职业：doctor, nurse, teacher, driver, farmer\n\n常用短语：\nget up起床, go to school上学, have breakfast吃早餐\ndo homework做作业, go home回家, go to bed睡觉',
                    example: '用英语描述你的家庭：\nThere are three people in my family.\nMy father is a doctor. My mother is a teacher.\nI am a student. I love my family.',
                    analysis: '描述家庭时先说人数，再分别介绍每个成员的职业和特点。',
                    mistakes: '常见错误：There is/are搞混（复数用There are），职业前忘记加a/an。',
                    tips: '按主题分类记单词，每天学一个主题的5个单词和3个短语。'
                },
                {
                    id: 'ep-simple-reading',
                    name: '简单阅读理解',
                    keywords: ['阅读', 'reading', '短文', '理解'],
                    knowledge: '阅读理解解题技巧：\n1. 先读问题，带着问题读文章\n2. 找关键词定位答案所在段落\n3. 注意文章开头和结尾（通常包含主旨）\n4. 细节题在原文中找对应句子\n5. 主旨题看每段首句\n\n常见题型：\n事实细节题、主旨大意题、词义猜测题、推理判断题',
                    example: '阅读短文：\nTom gets up at 7:00. He has breakfast at 7:30. He goes to school at 8:00. He likes math and English.\n问题：What time does Tom go to school?\n答案：At 8:00.',
                    analysis: '在原文中找到"goes to school"对应的句子，提取时间信息。',
                    mistakes: '常见错误：没有通读全文就答题，混淆文章中的时间顺序。',
                    tips: '每天读一篇英语小短文，先快速浏览再细读，划出关键信息。'
                }
            ]
        },
        junior: {
            name: '初中',
            topics: [
                {
                    id: 'ej-tense-complete',
                    name: '时态体系',
                    keywords: ['现在完成时', '过去进行时', '过去完成时', '时态对比'],
                    knowledge: '初中重点时态：\n\n现在完成时：have/has + done\n  用法：过去发生对现在有影响；从过去持续到现在\n  标志词：already, yet, ever, never, since, for\n  例：I have lived here for 10 years.\n\n过去进行时：was/were + doing\n  用法：过去某时正在进行的动作\n  例：I was sleeping when you called.\n\n过去完成时：had + done\n  用法：过去的过去\n  例：When I arrived, the train had left.',
                    example: '选择正确时态：\n1. I ___ (finish) my homework already. \u2192 have finished\n2. She ___ (read) when I came in. \u2192 was reading\n3. He ___ (go) to Beijing before I met him. \u2192 had gone',
                    analysis: 'already提示现在完成时，when提示过去进行时，before I met提示过去完成时。',
                    mistakes: '常见错误：一般过去时和现在完成时混淆（yesterday只能用过去时），过去完成时忘记had。',
                    tips: '制作时态对比表，注意时间标志词和语境。'
                },
                {
                    id: 'ej-clauses',
                    name: '从句',
                    keywords: ['从句', '定语从句', '状语从句', '宾语从句', 'that', 'which', 'who'],
                    knowledge: '三大从句：\n\n定语从句：修饰名词\n  who（指人，作主语/宾语）\n  which（指物，作主语/宾语）\n  that（指人或物）\n  例：The boy who is reading is my brother.\n\n状语从句：表示时间/条件/原因/结果等\n  when, while, before, after, if, because, so that\n  例：I will go if it doesn\'t rain.\n\n宾语从句：作动词的宾语\n  that, if/whether, wh-词引导\n  例：I think that he is right.\n  注意：宾语从句用陈述语序',
                    example: '用适当的关系词填空：\n1. The book ___ I bought yesterday is interesting. \u2192 which/that\n2. The girl ___ is singing is my sister. \u2192 who\n3. I don\'t know ___ he will come. \u2192 if/whether',
                    analysis: '指物用which/that，指人作主语用who，是否用if/whether。',
                    mistakes: '常见错误：who和which混用，宾语从句用疑问语序（应为陈述语序）。',
                    tips: '记住：定语从句看先行词（人/物），宾语从句用陈述语序。'
                },
                {
                    id: 'ej-passive-voice',
                    name: '被动语态',
                    keywords: ['被动语态', 'passive', 'be done', '被'],
                    knowledge: '被动语态结构：be + 过去分词(done)\n\n各时态被动语态：\n一般现在时：am/is/are + done\n一般过去时：was/were + done\n一般将来时：will be done\n现在进行时：am/is/are being done\n现在完成时：have/has been done\n含情态动词：can/must/should be done\n\n主动变被动：宾语变主语，谓语变被动，主语变by+宾语',
                    example: '主动：Tom cleans the room every day.\n被动：The room is cleaned by Tom every day.\n\n主动：They built this bridge in 1990.\n被动：This bridge was built by them in 1990.',
                    analysis: '主动句的宾语变成被动句的主语，动词变成be+过去分词，主语用by引出。',
                    mistakes: '常见错误：be动词时态错误，过去分词写错（不规则动词）。',
                    tips: '先确定时态再写be动词，熟记不规则动词过去分词表。'
                },
                {
                    id: 'ej-writing',
                    name: '英语写作',
                    keywords: ['写作', '作文', 'essay', '书面表达'],
                    knowledge: '初中英语作文结构：\n\n开头段（1-2句）：开门见山，表明主题\n主体段（3-5句）：展开论述，给出理由和例子\n结尾段（1-2句）：总结观点，表达期望\n\n常用连接词：\n递进：and, also, besides, what\'s more\n转折：but, however, although\n因果：because, so, therefore\n举例：for example, such as\n总结：in a word, all in all\n\n时态选择：\n描述过去经历用过去时，发表观点用现在时。',
                    example: '以"My Favorite Season"为题写短文：\nMy favorite season is spring. In spring, the weather becomes warm and flowers begin to bloom. I like going out for a picnic with my family. Everything looks fresh and beautiful. Spring gives me hope and energy.',
                    analysis: '开头表明喜欢春天，主体描述春天的特点和活动，结尾升华主题。',
                    mistakes: '常见错误：中式英语（very like \u2192 really like），句子之间缺少连接词。',
                    tips: '背熟10个常用连接词，每篇作文至少用3个连接词。写完后检查语法和拼写。'
                }
            ]
        },
        senior: {
            name: '高中',
            topics: [
                {
                    id: 'es-nonfinite-verbs',
                    name: '非谓语动词',
                    keywords: ['非谓语', '动名词', '不定式', '分词', 'doing', 'done', 'to do'],
                    knowledge: '非谓语动词三种形式：\n\n不定式 to do：\n  表示目的、将来、具体动作\n  例：I came to help you.\n\n动名词 doing：\n  表示习惯、经验、一般动作\n  例：Swimming is good exercise.\n  只能接动名词的动词：enjoy, finish, mind, practice, avoid\n\n分词：\n  现在分词 doing：表示主动、进行\n  过去分词 done：表示被动、完成\n  例：The exciting news surprised us.\n  例：The broken window needs repairing.',
                    example: '填空：\n1. I enjoy ___ (read) books. \u2192 reading\n2. He decided ___ (study) abroad. \u2192 to study\n3. The ___ (break) glass is on the floor. \u2192 broken',
                    analysis: 'enjoy后接动名词，decide后接不定式，broken表示被动（被打破的）。',
                    mistakes: '常见错误：enjoy/finish/mind后接to do，现在分词和过去分词搞混。',
                    tips: '记住只能接动名词的动词：MEGAFEPS（mind, enjoy, give up, avoid, finish, escape, practice, suggest）。'
                },
                {
                    id: 'es-virtual-mood',
                    name: '虚拟语气',
                    keywords: ['虚拟语气', '虚拟', 'if', 'wish', 'would', 'suggest'],
                    knowledge: '虚拟语气用于表示假设、愿望等非真实情况。\n\n与现在事实相反：\n  If I were you, I would study harder.\n  (If + 过去时, would + 动词原形)\n\n与过去事实相反：\n  If I had known, I would have helped you.\n  (If + had done, would have done)\n\n与将来事实相反：\n  If it rained tomorrow, I would stay at home.\n  (If + should/were to + 动词原形, would + 动词原形)\n\nwish后接虚拟：\n  wish + 过去时（与现在相反）\n  wish + 过去完成时（与过去相反）',
                    example: 'If I ___ (have) a million dollars, I ___ (buy) a big house.\n答案：had, would buy\n（与现在事实相反：If + 过去时, would + 动词原形）',
                    analysis: '这是与现在事实相反的虚拟条件句，从句用过去时，主句用would+动词原形。',
                    mistakes: '常见错误：if从句中用would（if从句不用would），were不分人称（If I were...不是If I was...）。',
                    tips: '记住三种虚拟条件句的时态搭配，特别注意if从句中be动词统一用were。'
                },
                {
                    id: 'es-advanced-writing',
                    name: '高级写作',
                    keywords: ['高级写作', '议论文', '说明文', '图表作文', '续写'],
                    knowledge: '高中英语作文类型：\n\n1. 议论文：\n   开头：引出话题+表明观点\n   主体：分论点+论据（2-3个）\n   结尾：重申观点+建议\n\n2. 图表作文：\n   描述图表数据变化\n   分析原因\n   给出预测或建议\n\n3. 读后续写：\n   紧扣原文风格和情节\n   合理发展，逻辑连贯\n   注意细节描写和心理活动\n\n高级句型：\n倒装句、强调句、with复合结构、独立主格、非谓语作状语',
                    example: 'With the development of technology, online learning has become increasingly popular. While some people argue that it lacks face-to-face interaction, I believe its benefits far outweigh its drawbacks. First and foremost, it provides students with flexible schedules. Furthermore, it offers access to high-quality educational resources regardless of location.',
                    analysis: '开头用With复合结构引入话题，主体用First and foremost和Furthermore递进论述。',
                    mistakes: '常见错误：词汇重复（多次用good），句式单一（全是简单句），逻辑不连贯。',
                    tips: '每篇作文至少用2个高级句型，准备5个万能开头和结尾模板。'
                },
                {
                    id: 'es-inversion',
                    name: '倒装句',
                    keywords: ['倒装', '倒装句', '完全倒装', '部分倒装', '否定词前置'],
                    knowledge: '倒装句分为完全倒装和部分倒装：\n\n完全倒装（谓语全部提前）：\n  地点副词开头：Here comes the bus. / There goes the bell.\n  方向副词开头：Up went the rocket.\n  表语前置：Beautiful is the girl in white.\n\n部分倒装（助动词/情态动词提前）：\n  否定词前置：Never have I seen such a beautiful place.\n  Only+状语前置：Only then did I realize my mistake.\n  Not only...but also：Not only is he clever, but he is also hardworking.\n  So/Such...that：So beautiful was she that everyone admired her.\n  虚拟条件省略if：Had I known, I would have helped you.',
                    example: '1. 否定词前置：\n   正常：I have never been to Paris.\n   倒装：Never have I been to Paris.\n\n2. Only+状语前置：\n   正常：I realized the importance only after I failed.\n   倒装：Only after I failed did I realize the importance.',
                    analysis: '倒装句的核心是"否定词/Only/So/Such等放在句首时，主句需要部分倒装"。',
                    mistakes: '常见错误：部分倒装时忘记把be/助动词/情态动词提前，完全倒装和部分倒装混淆。',
                    tips: '记住触发倒装的关键词：否定词、Only+状语、So/Such...that、虚拟条件省略if。'
                },
                {
                    id: 'es-subjunctive-advanced',
                    name: '虚拟语气进阶',
                    keywords: ['虚拟语气进阶', 'wish', 'as if', 'would rather', 'it is time', 'suggest'],
                    knowledge: '虚拟语气进阶用法：\n\n1. wish后接虚拟：\n  wish + 过去时（与现在相反）：I wish I were taller.\n  wish + 过去完成时（与过去相反）：I wish I had studied harder.\n  wish + would + 动词原形（与将来相反）：I wish it would rain.\n\n2. as if/as though（仿佛）：\n  与现在相反：He talks as if he knew everything.\n  与过去相反：He looked as if he had seen a ghost.\n\n3. would rather：\n  would rather + sb + did（现在/将来）：I\'d rather you came tomorrow.\n  would rather + sb + had done（过去）：I\'d rather you hadn\'t told her.\n\n4. It is time + 过去时/should do：\n  It is time we left. / It is time we should leave.\n\n5. suggest/demand/insist等+that+should+do（should可省）：\n  I suggest that he (should) go there at once.',
                    example: '1. He treats me as if I ___ (be) a child.\n   答案：were（与现在事实相反）\n\n2. I would rather you ___ (not tell) anyone about this.\n   答案：didn\'t tell（与现在/将来相反）\n\n3. It is high time that we ___ (take) measures to protect the environment.\n   答案：took / should take',
                    analysis: 'wish/as if/would rather/it is time 后面的时态都要"退一步"：现在→过去，过去→过去完成。',
                    mistakes: '常见错误：wish后用will而不是would，would rather后忘记用过去时，suggest后接should时省略should后动词忘记用原形。',
                    tips: '虚拟语气进阶关键是记住每个结构的时态搭配，建议整理一个虚拟语气时态对照表。'
                },
                {
                    id: 'es-nominative-absolute',
                    name: '独立主格',
                    keywords: ['独立主格', '独立主格结构', 'with复合结构', '非谓语状语'],
                    knowledge: '独立主格结构：名词/代词+非谓语动词/形容词/副词/介词短语\n\n构成形式：\n  名词+现在分词（主动进行）：Weather permitting, we will go out.\n  名词+过去分词（被动完成）：The work done, he went home.\n  名词+不定式（将来）：He is leaving for Beijing, the meeting to be held next week.\n  名词+形容词/副词/介词短语：The door open, he could hear everything.\n\nwith复合结构（独立主格的变体）：\n  with+宾语+doing/done/to do/adj./adv./prep.\n  With the door locked, he felt safe.\n  With so much work to do, I can\'t go out.\n\n功能：作状语（时间、原因、条件、伴随）',
                    example: '1. The teacher entering the classroom, all the students stood up.\n   （老师走进教室，所有学生站了起来。）\n\n2. With the lights on, the whole city looks beautiful.\n   （灯亮着，整个城市看起来很美。）\n\n3. He lay on the grass, the sun shining on his face.\n   （他躺在草地上，阳光照在脸上。）',
                    analysis: '独立主格没有连词，逻辑主语与主句主语不同。with复合结构是独立主格的常见形式。',
                    mistakes: '常见错误：独立主格的逻辑主语与主句主语混淆，with复合结构中分词形式选错（主动用doing，被动用done）。',
                    tips: '独立主格的判断关键：找逻辑主语。主动进行用doing，被动完成用done，将来用to do。'
                },
                {
                    id: 'es-reading-main-idea',
                    name: '阅读理解-主旨大意',
                    keywords: ['主旨大意', 'main idea', '阅读技巧', '文章主旨', '标题选择'],
                    knowledge: '主旨大意题解题技巧：\n\n1. 重点关注位置：\n   首段首句（开门见山型）\n   首段末句（引出话题型）\n   末段（总结归纳型）\n\n2. 常见题型：\n   What is the main idea of the passage?\n   What is the best title for the passage?\n   The passage is mainly about...\n   The author\'s purpose is to...\n\n3. 解题方法：\n   归纳法：综合各段中心句\n   排除法：排除太具体、太片面、无依据的选项\n   关键词法：反复出现的高频词即主题词\n\n4. 干扰项特征：\n   以偏概全（只涉及一段内容）\n   过于宽泛（超出文章范围）\n   无中生有（文章未提及）',
                    example: '文章各段首句：\nPara 1: Social media has changed the way we communicate.\nPara 2: One major impact is on teenagers\' mental health.\nPara 3: Another concern is the spread of misinformation.\nPara 4: Therefore, we must use social media wisely.\n\n主旨：The impact of social media on society.\n（综合各段：社交媒体改变了沟通方式，影响青少年心理健康，传播虚假信息，需要明智使用。）',
                    analysis: '各段首句分别涉及沟通方式、心理健康、虚假信息、建议使用，综合起来就是"社交媒体的影响"。',
                    mistakes: '常见错误：被某一段的细节吸引而选了以偏概全的选项，混淆主旨和细节。',
                    tips: '先快速浏览各段首句和末句，找出共同主题词，再对比选项。'
                },
                {
                    id: 'es-reading-inference',
                    name: '阅读理解-细节推断',
                    keywords: ['细节推断', '推理判断', 'inference', 'implied', '阅读理解技巧'],
                    knowledge: '推理判断题解题技巧：\n\n1. 题型特征：\n   It can be inferred that...\n   The author implies that...\n   What can we conclude from...?\n   The passage suggests...\n\n2. 解题原则：\n   "言外之意"——答案不在原文原句中\n   基于原文线索合理推理\n   不能过度推断\n\n3. 推断角度：\n   作者态度推断（positive/negative/neutral/objective）\n   文章来源推断（newspaper/science journal/textbook）\n   上下文关系推断\n\n4. 关键线索词：\n   suggest, imply, indicate, infer, conclude\n   however, but, although（转折处常出推断题）',
                    example: '原文："Although the new policy was criticized by some parents, most teachers supported it enthusiastically."\n\n问题：What is the author\'s attitude toward the new policy?\nA. Negative  B. Positive  C. Neutral  D. Indifferent\n\n答案：B. Positive\n分析：although引出让步（部分家长批评），但主句是"大多数老师热情支持"，作者整体态度偏积极。',
                    analysis: '推理判断题要抓住转折词和情感词，although/but后面通常是作者真正想表达的态度。',
                    mistakes: '常见错误：把原文原话当成推断答案（推断题答案不会直接出现在原文中），过度推断超出文章范围。',
                    tips: '推断题答案=原文线索+合理推理一步。不要推断太多，一步即可。'
                },
                {
                    id: 'es-reading-guess-word',
                    name: '阅读理解-词义猜测',
                    keywords: ['词义猜测', 'guess meaning', '生词', '上下文', '构词法'],
                    knowledge: '词义猜测题解题技巧：\n\n1. 构词法（前缀+词根+后缀）：\n   un-(否定)+happy=unhappy(不开心的)\n  re-(再次)+write=rewrite(重写)\n  -less(无/没有)+care=careless(粗心的)\n  -ful(充满的)+wonder=wonderful(精彩的)\n\n2. 上下文线索：\n   定义线索：is, means, refers to, that is\n   举例线索：for example, such as, like\n   对比线索：however, but, unlike, on the contrary\n   因果线索：because, as a result, therefore\n\n3. 同义反义关系：\n   and/or连接的词义相近\n   but/however连接的词义相反\n\n4. 逻辑推理：\n   根据所在句的前后文推断词义',
                    example: '原文："The weather was inclement — cold, windy, and with heavy rain."\n\n问题：What does "inclement" probably mean?\nA. pleasant  B. mild  C. severe/bad  D. warm\n\n答案：C. severe/bad\n分析：破折号后"cold, windy, heavy rain"都是恶劣天气，推断inclement意为"恶劣的"。',
                    analysis: '破折号、冒号后面常给出定义或解释，是猜测词义的重要线索。',
                    mistakes: '常见错误：只看生词本身不看上下文，忽略标点符号（破折号、冒号）提供的线索。',
                    tips: '遇到生词不要慌，先看前后文有没有解释性线索，再看构词法能否拆分。'
                },
                {
                    id: 'es-writing-argumentative',
                    name: '写作技巧-议论文',
                    keywords: ['议论文写作', 'argumentative', 'opinion essay', '观点论述', '论证方法'],
                    knowledge: '英语议论文写作结构：\n\n第一段（引言）：\n  Hook（吸引读者）：引用名言/数据/提问\n  Background（背景信息）：简要介绍话题\n  Thesis statement（论点句）：明确表明立场\n\n第二、三段（主体）：\n  Topic sentence（主题句）：本段分论点\n  Supporting details（论据）：例子、数据、引用\n  Explanation（解释）：分析论据如何支持论点\n  Concluding sentence（小结）：总结本段\n\n第四段（让步与反驳）：\n  Admit the opposing view（承认对立观点）\n  Refute it（反驳）\n\n第五段（结论）：\n  Restate thesis（重申论点）\n  Summarize main points（总结要点）\n  Call to action / Final thought（呼吁/展望）',
                    example: '议论文开头示例：\n"In recent years, the debate over whether students should use smartphones in school has intensified. While some argue that phones are a distraction, I firmly believe that, when used properly, smartphones can be powerful learning tools. This essay will demonstrate the educational benefits of smartphones in the classroom."',
                    analysis: '开头三步走：背景引入→对立观点→明确论点。论点句用I firmly believe that引出。',
                    mistakes: '常见错误：论点不明确（没有thesis statement），论据不具体（说"many studies"但不指出具体哪个），逻辑跳跃。',
                    tips: '论点句放在第一段末尾，每段有且只有一个主题句，论据要具体可查。'
                },
                {
                    id: 'es-writing-expository',
                    name: '写作技巧-说明文',
                    keywords: ['说明文写作', 'expository', '过程描述', '对比说明', '图表描述'],
                    knowledge: '英语说明文写作要点：\n\n类型一：过程说明（How to...）\n  按步骤顺序写作\n  使用过渡词：First, Next, Then, After that, Finally\n  被动语态为主\n\n类型二：对比说明\n  对比两个事物的异同\n  使用连接词：similarly, likewise, on the other hand, in contrast\n  分点对比：先A后B，或逐点对比\n\n类型三：图表描述\n  描述趋势：increase, decrease, rise, fall, fluctuate\n  描述数据：account for, make up, reach a peak of\n  引出数据：According to the chart, As is shown in the graph\n\n说明文语言要求：\n  客观准确，避免主观评价\n  使用第三人称\n  数据引用要精确',
                    example: '图表描述开头示例：\n"As is shown in the bar chart, the number of people using mobile payment in China increased dramatically from 2015 to 2025. In 2015, only 35% of consumers used mobile payment, whereas by 2025, this figure had soared to over 90%."',
                    analysis: '图表作文开头描述总体趋势，主体分析具体数据和变化，结尾总结原因或预测。',
                    mistakes: '常见错误：数据描述不准确（把35%写成35），时态错误（描述过去数据用过去时），缺少总体趋势描述。',
                    tips: '图表作文先描述总体趋势，再描述极值和转折点，最后分析原因。'
                },
                {
                    id: 'es-writing-practical',
                    name: '写作技巧-应用文',
                    keywords: ['应用文', '书信', 'email', '通知', '演讲稿', '申请信', '推荐信'],
                    knowledge: '英语应用文写作类型：\n\n1. 建议信（Advice letter）：\n   表达理解→给出建议→表达期望\n   常用：I suggest that... / It would be a good idea to...\n\n2. 申请信（Application letter）：\n   说明目的→展示优势→表达期望\n   常用：I am writing to apply for... / I believe I am qualified for...\n\n3. 推荐信（Recommendation letter）：\n   说明关系→描述品质→给出推荐\n   常用：I am writing to recommend... / He/She is outstanding in...\n\n4. 演讲稿（Speech）：\n   问候→引入话题→展开论述→总结呼吁\n   常用：It is my great honor to be here... / Let me share with you...\n\n5. 通知/启事（Notice）：\n   标题Notice居中→时间地点事件→落款',
                    example: '申请信示例：\nDear Sir/Madam,\n\nI am writing to apply for the volunteer position at the International Cultural Exchange Festival. I am a senior high school student with a good command of English, having passed the CET-6 exam. Moreover, I have two years of experience in organizing school events. I believe my language skills and organizational abilities make me a suitable candidate.\n\nI look forward to your favorable reply.\n\nYours sincerely,\nLi Hua',
                    analysis: '申请信结构清晰：目的→优势（语言+经验）→期望。注意格式和礼貌用语。',
                    mistakes: '常见错误：格式错误（称呼、落款不规范），内容空洞（没有具体事例支撑优势），语气不恰当。',
                    tips: '应用文格式是得分关键，背熟各类应用文的框架模板，内容要具体有说服力。'
                },
                {
                    id: 'es-culture-difference',
                    name: '英语文化常识-英美差异',
                    keywords: ['英美差异', 'British English', 'American English', '英美文化', '英语文化'],
                    knowledge: '英美英语主要差异：\n\n1. 拼写差异：\n  -or/-our: color(colour), favor(favour)\n  -er/-re: center(centre), theater(theatre)\n  -ize/-ise: realize(realise)\n  -nse/-nce: defense(defence)\n\n2. 词汇差异：\n  apartment(flat), elevator(lift), truck(lorry)\n  vacation(holiday), subway(underground/tube)\n  cookie(biscuit), gas(petrol)\n\n3. 发音差异：\n  美式r音卷舌（car, hard），英式不卷舌\n  美式a发/ae/（dance, ask），英式发/a:/\n\n4. 语法差异：\n  美式：Do you have...? 英式：Have you got...?\n  美式用simple past，英式用present perfect\n\n5. 文化差异：\n  英式更注重传统和礼节，美式更随意直接',
                    example: '英美对话对比：\n美式：Can I borrow your cell phone? I need to call the elevator. The apartment is on the second floor.\n英式：Can I borrow your mobile? I need to call the lift. The flat is on the first floor.\n\n注意：英美"first floor"含义不同！\n美式first floor = 一楼\n英式first floor = 二楼（ground floor = 一楼）',
                    analysis: '英美差异体现在拼写、词汇、发音、语法和文化习惯多个方面，写作和口语中要注意一致性。',
                    mistakes: '常见错误：在一篇文章中混用英美拼写（如同时出现color和colour），不了解词汇的地域含义。',
                    tips: '选择一种风格保持一致，考试中通常接受两种拼写，但不要混用。'
                },
                {
                    id: 'es-culture-idioms',
                    name: '英语文化常识-习语来源',
                    keywords: ['习语', 'idiom', '谚语', '俚语', '典故', '英语习语'],
                    knowledge: '常见英语习语及来源：\n\n1. 来自《圣经》和文学：\n  the writing on the wall（不祥之兆）→ 但以理书\n  a Pandora\'s box（潘多拉魔盒/灾难之源）→ 希腊神话\n  Achilles\' heel（致命弱点）→ 特洛伊战争\n\n2. 来自航海文化：\n  by and large（总的来说）→ 航海术语\n  cut the rope（断绝关系）→ 锚绳\n  in the same boat（同舟共济）→ 航海\n\n3. 来自日常生活：\n  break a leg（祝好运）→ 演员迷信\n  bite the bullet（咬紧牙关）→ 战场手术\n  cost an arm and a leg（代价高昂）→ 夸张表达\n\n4. 动物相关习语：\n  rain cats and dogs（倾盆大雨）\n  let the cat out of the bag（泄密）\n  black sheep（害群之马）',
                    example: '1. Don\'t tell anyone — we don\'t want to let the cat out of the bag.\n   （别告诉任何人——我们不想泄密。）\n\n2. The new project will cost an arm and a leg, so we need to think carefully.\n   （新项目代价高昂，我们需要仔细考虑。）\n\n3. Break a leg in your interview tomorrow!\n   （祝你明天面试好运！）',
                    analysis: '习语不能字面翻译，要理解其文化背景和引申含义。break a leg字面是"摔断腿"，实际是"祝好运"。',
                    mistakes: '常见错误：字面翻译习语（rain cats and dogs译成"下猫和狗"），在正式写作中使用过于口语化的习语。',
                    tips: '积累习语要结合文化背景理解，阅读英文原版小说和新闻是学习习语的好方法。'
                },
                {
                    id: 'es-culture-background',
                    name: '英语文化常识-文化背景',
                    keywords: ['英语文化', '文化背景', '西方文化', '节日', '英美历史', '文化常识'],
                    knowledge: '重要英语文化背景知识：\n\n1. 主要节日：\n  Christmas（12月25日）：耶稣诞生\n  Thanksgiving（11月第四个周四）：感恩丰收\n  Halloween（10月31日）：万圣节前夜\n  Easter：复活节（春分月圆后第一个周日）\n  Valentine\'s Day（2月14日）：情人节\n\n2. 教育体系：\n  英国学制：小学→中学→GCSE→A-Level→大学\n  美国学制：Elementary→Middle→High School→College/University\n  常春藤盟校（Ivy League）：哈佛、耶鲁等8所名校\n\n3. 政治常识：\n  英国：君主立宪制，首相是政府首脑\n  美国：联邦共和制，总统是国家元首\n  议会/国会：UK Parliament / US Congress\n\n4. 文学经典：\n  Shakespeare（莎士比亚）：Hamlet, Romeo and Juliet\n  Dickens（狄更斯）：Oliver Twist, A Tale of Two Cities',
                    example: '文化常识题：\n1. Which holiday is celebrated on the fourth Thursday of November?\n   答案：Thanksgiving（感恩节）\n\n2. What is the supreme law of the United States?\n   答案：The Constitution（美国宪法）\n\n3. Who wrote "To be or not to be, that is the question"?\n   答案：William Shakespeare（莎士比亚）',
                    analysis: '文化背景知识有助于理解英语文章中的典故和引用，也是各类英语考试的重要内容。',
                    mistakes: '常见错误：混淆英国和美国的文化差异（如教育体系、政治制度），不了解文学经典的基本信息。',
                    tips: '通过看英文电影、读英文新闻、了解英美历史来积累文化背景知识。'
                },
                {
                    id: 'es-listening-skills',
                    name: '听力技巧',
                    keywords: ['听力技巧', '抓关键词', '预测内容', '听力', 'listening', '听力理解'],
                    knowledge: '英语听力核心技巧：\n\n1. 抓关键词：\n  听前快速浏览题目，划出关键词（人名、地名、数字、时间）\n  注意转折词：but, however, although（后面常是答案）\n  注意因果词：because, so, therefore\n\n2. 预测内容：\n  根据题目和选项预测对话主题和可能答案\n  利用背景知识推断说话人身份和场景\n\n3. 笔记技巧：\n  用缩写和符号快速记录数字、时间、地点\n  注意同义替换：原文用large，选项用big\n\n4. 题型应对：\n  主旨题：关注开头和结尾\n  细节题：注意数字、时间、地点\n  推断题：理解言外之意',
                    example: '听力预测示例：\n题目：What will the weather be like tomorrow?\n选项：A. Sunny  B. Rainy  C. Cloudy  D. Snowy\n\n预测：关键词是weather和tomorrow，听时重点抓描述天气的形容词。',
                    analysis: '预测能帮助你集中注意力在关键信息上，提高听力效率。',
                    mistakes: '常见错误：试图听懂每一个单词（应抓大意），忽略题目要求（问原因还是结果），被干扰选项迷惑。',
                    tips: '每天坚持听15分钟英语，从慢速开始逐渐加速。听完后对照原文分析没听懂的部分。'
                },
                {
                    id: 'es-speaking-skills',
                    name: '口语表达',
                    keywords: ['口语表达', '日常对话', '演讲技巧', 'speaking', '口语', '对话'],
                    knowledge: '英语口语表达技巧：\n\n日常对话：\n  开场：How\'s it going? / What\'s up? / Long time no see!\n  表达同意：I couldn\'t agree more. / Exactly! / You bet!\n  表达不同意：I see your point, but... / I\'m not sure about that.\n  请求重复：Could you say that again? / Pardon?\n\n演讲技巧：\n  开场白：Good morning, everyone. Today I\'d like to talk about...\n  过渡语：Let\'s move on to... / Another important point is...\n  结尾语：To sum up... / Thank you for your attention.\n\n发音要点：\n  连读：not at all → no-ta-tall\n  弱读：介词、冠词常弱读\n  语调：陈述句降调，一般疑问句升调',
                    example: '演讲开场示例：\n"Good morning, distinguished guests and fellow students. It is my great honor to stand here today. The topic of my speech is \"The Power of Reading.\" As Francis Bacon once said, \"Reading makes a full man.\" I truly believe that reading can transform our lives."',
                    analysis: '演讲开头要吸引听众注意，可以用名言、提问或数据引入主题。',
                    mistakes: '常见错误：语速过快或过慢，缺乏眼神交流，背诵痕迹太重，没有肢体语言。',
                    tips: '对着镜子练习，录下自己的演讲找问题。多用连接词让表达更流畅。'
                },
                {
                    id: 'es-english-culture',
                    name: '英语国家文化',
                    keywords: ['英语国家文化', '节日', '习俗', '礼仪', '英美文化', '西方礼仪'],
                    knowledge: '英语国家文化习俗与礼仪：\n\n节日习俗：\n  Christmas：交换礼物、装饰圣诞树、吃火鸡\n  Thanksgiving：家庭聚餐、吃火鸡、表达感恩\n  Halloween：化妆舞会、trick or treat（不给糖就捣蛋）\n\n社交礼仪：\n  见面：握手、微笑、眼神交流\n  称呼：Mr./Mrs./Ms. + 姓氏（正式），名字（熟悉后）\n  餐桌礼仪：左手拿叉、右手拿刀；嘴里有食物不说话\n  小费文化：美国餐厅一般给15%-20%小费\n\n禁忌话题：\n  避免问年龄、收入、婚姻状况等隐私问题\n  政治和宗教是敏感话题，初次见面不宜讨论',
                    example: '礼仪场景：\n在正式场合介绍他人：\n"Mr. Smith, I\'d like to introduce you to Ms. Johnson. Ms. Johnson, this is Mr. Smith, our new manager."\n\n收到礼物时的回应：\n"Thank you so much! That\'s very kind of you. I really appreciate it."',
                    analysis: '了解英语国家的文化习俗有助于避免交际失误，展现良好的跨文化交际能力。',
                    mistakes: '常见错误：用中式思维理解西方礼仪（如过分谦虚），不了解小费文化，在正式场合过于随意。',
                    tips: '多看英美影视剧了解真实场景，阅读跨文化交际书籍，有机会多与外国友人交流。'
                },
                {
                    id: 'es-academic-english',
                    name: '学术英语',
                    keywords: ['学术英语', '论文写作', '学术词汇', 'academic', '学术', '论文'],
                    knowledge: '学术英语核心要点：\n\n学术词汇特点：\n  正式性：不用缩写（don\'t → do not）\n  客观性：避免第一人称（I think → It is suggested that）\n  精确性：使用专业术语，避免模糊表达\n\n常用学术词汇：\n  表示观点：argue, claim, suggest, demonstrate, indicate\n  表示对比：however, conversely, in contrast, whereas\n  表示因果：therefore, consequently, as a result, thus\n  表示举例：for instance, namely, specifically\n\n论文结构词汇：\n  Introduction：This paper aims to... / The purpose of this study is...\n  Methodology：The data were collected... / A survey was conducted...\n  Results：The findings reveal... / The results indicate...\n  Conclusion：In conclusion... / These findings suggest...',
                    example: '学术写作对比：\n口语化：I think online learning is good for students.\n学术化：It is argued that online learning provides significant benefits for students in terms of flexibility and accessibility.\n\n口语化：A lot of people agree with this idea.\n学术化：A considerable number of scholars support this perspective.',
                    analysis: '学术英语要求语言正式、客观、精确，多用被动语态和名词化结构。',
                    mistakes: '常见错误：使用口语化表达，滥用第一人称，连接词单一（反复用and和but），引用格式不规范。',
                    tips: '建立学术词汇本，阅读英文学术论文模仿写作风格，使用Grammarly等工具检查语言正式度。'
                },
                {
                    id: 'es-word-roots',
                    name: '英语词根词缀记忆法',
                    keywords: ['词根', '词缀', '词根词缀', '记忆法', '构词法', '词根记忆'],
                    knowledge: '英语词根词缀记忆法：\n\n常见词根：\n  spect（看）：inspect（检查），prospect（前景），spectator（观众）\n  port（携带）：export（出口），import（进口），transport（运输）\n  dict（说）：predict（预测），dictionary（词典），contradict（反驳）\n  struct（建造）：construct（建造），structure（结构），destruct（破坏）\n  vis（看）：visible（可见的），vision（视力），supervise（监督）\n\n常见前缀：\n  un-/in-/im-/dis-（否定）：unhappy, impossible, disagree\n  re-（再次）：return, review, recycle\n  pre-（之前）：preview, predict, prepare\n  mis-（错误）：mistake, misunderstand\n  over-（过度）：overwork, overcome\n\n常见后缀：\n  -tion/-sion（名词）：education, decision\n  -ment（名词）：development, movement\n  -ful/-less（形容词）：careful, careless\n  -ly（副词）：quickly, happily',
                    example: '词根分析：\n"unpredictable" = un（否定）+ pre（之前）+ dict（说）+ able（能够）\n= 不能提前说的 = 不可预测的\n\n"transportation" = trans（跨越）+ port（携带）+ ation（名词后缀）\n= 跨越携带 = 运输',
                    analysis: '掌握词根词缀能帮助你推测生词含义，成倍扩大词汇量。',
                    mistakes: '常见错误：生搬硬套词根含义（有些词根有多个含义），忽略词根变体（如spect→spice），只记词根不记例词。',
                    tips: '每天学习3-5个词根，每个词根配3个例词。用思维导图整理同根词。'
                },
                {
                    id: 'es-proverbs',
                    name: '英语谚语与格言',
                    keywords: ['谚语', '格言', 'proverb', 'saying', '名言', '英语谚语'],
                    knowledge: '常用英语谚语与格言：\n\n学习类：\n  Practice makes perfect.（熟能生巧）\n  Where there is a will, there is a way.（有志者事竟成）\n  No pain, no gain.（不劳无获）\n\n时间类：\n  Time is money.（时间就是金钱）\n  Time and tide wait for no man.（岁月不待人）\n\n友谊类：\n  A friend in need is a friend indeed.（患难见真情）\n  Birds of a feather flock together.（物以类聚）\n\n行动类：\n  Actions speak louder than words.（行动胜于言辞）\n  Don\'t put off till tomorrow what should be done today.（今日事今日毕）\n\n智慧类：\n  Every coin has two sides.（事物都有两面性）\n  When in Rome, do as the Romans do.（入乡随俗）\n\n写作应用：\n  议论文开头引用名言增强说服力\n  结尾用谚语升华主题',
                    example: '写作应用示例：\n开头：As the saying goes, \"Where there is a will, there is a way.\" This proverb perfectly illustrates the importance of determination in achieving our goals.\n\n结尾：In conclusion, we should always remember that \"Actions speak louder than words.\" Only through concrete actions can we turn our dreams into reality.',
                    analysis: '恰当地使用谚语能让文章更有文采，增强说服力。但要注意使用场合和语境。',
                    mistakes: '常见错误：谚语拼写错误，使用场合不当（正式学术写作中不宜过多使用），理解偏差导致用错。',
                    tips: '按主题分类记忆谚语，每个谚语造一个句子。写作时选择最贴切的一两个使用，不宜过多。'
                },
                {
                    id: 'es-rhetoric',
                    name: '英语修辞手法',
                    keywords: ['修辞手法', '比喻', '拟人', '排比', 'rhetoric', '修辞', '比喻'],
                    knowledge: '英语常见修辞手法：\n\n1. Simile（明喻）：用like或as比较\n   Her smile is like sunshine.\n\n2. Metaphor（暗喻）：不用like/as直接比喻\n   Time is money.\n\n3. Personification（拟人）：赋予非人事物以人的特征\n   The wind whispered through the trees.\n\n4. Parallelism（排比）：结构相似的句子并列\n   I came, I saw, I conquered.\n\n5. Hyperbole（夸张）：故意夸大\n   I\'ve told you a million times.\n\n6. Alliteration（头韵）：相邻词首字母相同\n   Peter Piper picked a peck of pickled peppers.\n\n7. Irony（反讽）：说反话\n   What a beautiful day! (said during a storm)\n\n8. Euphemism（委婉语）：用温和说法代替直接说法\n   pass away → die',
                    example: '修辞分析：\n"The classroom was a zoo." → Metaphor（暗喻），把教室比作动物园，形容吵闹混乱。\n\n"Her voice was as sweet as honey." → Simile（明喻），用as...as结构比喻声音甜美。\n\n"The sun smiled down on us." → Personification（拟人），赋予太阳以人的动作。',
                    analysis: '修辞手法使语言更生动形象。识别修辞手法有助于理解文学作品和做好阅读理解。',
                    mistakes: '常见错误：混淆simile和metaphor（有无like/as），不理解irony的真实含义，分析修辞效果时只说"生动形象"而不具体。',
                    tips: '阅读文学作品时标注修辞手法，尝试在自己的写作中运用1-2种修辞。'
                },
                {
                    id: 'es-translation-skills',
                    name: '英语翻译技巧',
                    keywords: ['翻译技巧', '直译', '意译', 'translation', '翻译', '英译汉', '汉译英'],
                    knowledge: '英语翻译核心技巧：\n\n直译（Literal Translation）：\n  保留原文形式和结构，逐词对应翻译\n  适用：科技文本、法律文本、说明文\n  例：The sun rises in the east. → 太阳从东方升起。\n\n意译（Free Translation）：\n  保留原文意思，调整形式以适应目标语习惯\n  适用：文学作品、广告、习语\n  例：It rains cats and dogs. → 倾盆大雨。\n\n常用翻译技巧：\n  增译法：补充原文省略的内容\n  省译法：省略原文重复或冗余的内容\n  词性转换：名词转动词、形容词转副词等\n  语序调整：英汉语序差异的调整\n  正反表达：肯定变否定、主动变被动\n\n翻译标准：\n  信（忠实原文）、达（通顺流畅）、雅（优美得体）',
                    example: '翻译对比：\n原文：The early bird catches the worm.\n直译：早起的鸟儿捉到虫。\n意译：捷足先登。/ 早起的鸟儿有虫吃。\n\n原文：He is the last person I want to see.\n直译：他是我最后想见的人。（错误！）\n意译：他是我最不想见的人。',
                    analysis: '直译和意译各有适用场景。理解原文深层含义比逐词翻译更重要。',
                    mistakes: '常见错误：逐字翻译导致中式英语或英式中文，忽略文化差异，长句不分层次直接翻译。',
                    tips: '先通读理解全文意思再翻译，长句拆短句，注意中英文表达习惯差异。多对照优秀译文学习。'
                }
            ]
        },
        vocational: {
            name: '职高',
            topics: [
                {
                    id: 'ev-business-english',
                    name: '商务英语',
                    keywords: ['商务', 'business', '邮件', 'email', '面试', 'interview', '职场'],
                    knowledge: '商务英语常用表达：\n\n邮件用语：\n  开头：I am writing to inquire about...\n  结尾：I look forward to hearing from you.\n  署名：Best regards / Kind regards / Sincerely\n\n面试用语：\n  自我介绍：Let me introduce myself. I graduated from...\n  优势：I am good at... / I have experience in...\n  期望薪资：I expect a salary of...\n\n职场词汇：\n  meeting会议, deadline截止日期, project项目\n  schedule日程, report报告, colleague同事',
                    example: '商务邮件示例：\nDear Mr. Smith,\nI am writing to apply for the Marketing Assistant position advertised on your website.\nI have a degree in Business and two years of relevant experience.\nI look forward to the opportunity to discuss my qualifications.\nBest regards,\nLi Ming',
                    analysis: '商务邮件要简洁、礼貌、专业。开头说明目的，中间展示优势，结尾表达期望。',
                    mistakes: '常见错误：邮件语气过于随意，忘记写主题行，拼写和语法错误。',
                    tips: '准备几个邮件模板，发送前仔细检查拼写和语法。'
                },
                {
                    id: 'ev-daily-english',
                    name: '日常实用英语',
                    keywords: ['日常', '口语', '对话', '生活英语', '实用英语'],
                    knowledge: '生活场景英语：\n\n餐厅点餐：\n  I\'d like to order... / Could I have the menu?\n  What do you recommend? / Check, please.\n\n购物：\n  How much is this? / Can I try this on?\n  Do you have a smaller size? / I\'ll take it.\n\n问路：\n  Excuse me, where is...? / How can I get to...?\n  Turn left/right at the corner.\n\n看病：\n  I have a headache / fever / cold.\n  I need to make an appointment.',
                    example: '餐厅对话：\nA: Good evening. A table for two, please.\nB: Of course. This way, please.\nA: Could I see the menu?\nB: Here you are. Are you ready to order?\nA: I\'d like the chicken salad, please.',
                    analysis: '餐厅用语要礼貌，用I\'d like...代替I want...更得体。',
                    mistakes: '常见错误：直接说I want（不够礼貌），忘记说please和thank you。',
                    tips: '多看英语对话视频，模仿语音语调，每天练习一个场景。'
                }
            ]
        },
        university: {
            name: '大学',
            topics: [
                {
                    id: 'eu-academic-writing',
                    name: '学术英语写作',
                    keywords: ['学术写作', '论文', 'thesis', 'academic', 'paper', 'research'],
                    knowledge: '学术论文写作规范：\n\nAbstract（摘要）：简述研究目的、方法、结果和结论\nIntroduction（引言）：研究背景、文献综述、研究目的\nMethodology（方法）：研究设计、数据收集和分析方法\nResults（结果）：客观数据和发现\nDiscussion（讨论）：解释结果，与前人研究比较\nConclusion（结论）：总结发现，指出局限和未来方向\n\n学术语言特点：\n  客观正式，避免口语化\n  使用被动语态\n  引用文献（APA/MLA格式）\n  避免绝对化表达（用may/might代替must）',
                    example: '摘要示例：\nThis study investigates the impact of online learning on student engagement. A mixed-methods approach was employed, combining quantitative surveys (n=200) with qualitative interviews (n=20). The results indicate that interactive online activities significantly enhance student engagement compared to passive content delivery.',
                    analysis: '摘要要简洁（150-300词），包含研究目的、方法、主要发现。',
                    mistakes: '常见错误：摘要太长或太短，使用第一人称（I think），缺少关键信息。',
                    tips: '先写正文再写摘要，摘要只包含最重要的信息。'
                },
                {
                    id: 'eu-translation-theory',
                    name: '翻译理论与实践',
                    keywords: ['翻译', 'translation', '英译汉', '汉译英', '翻译技巧'],
                    knowledge: '翻译基本方法：\n\n直译（Literal Translation）：\n  尽量保留原文形式和内容\n  例：Knowledge is power. \u2192 知识就是力量。\n\n意译（Free Translation）：\n  保留内容，调整形式以符合目标语习惯\n  例：It rains cats and dogs. \u2192 倾盆大雨。\n\n翻译技巧：\n  增译法、省译法、词性转换、语序调整\n  正反表达法、分译与合译\n\n翻译标准：\n  信（忠实）、达（通顺）、雅（优美）',
                    example: '翻译：The early bird catches the worm.\n直译：早起的鸟儿捉到虫。\n意译：捷足先登。\n\n翻译：Practice makes perfect.\n翻译：熟能生巧。',
                    analysis: '谚语翻译有时直译即可（意思清楚），有时需要意译（找到对应的中文表达）。',
                    mistakes: '常见错误：逐字翻译导致不通顺，忽视中英文表达习惯差异。',
                    tips: '先理解原文意思，再用目标语习惯表达。多读中英文对照材料。'
                },
                {
                    id: 'eu-english-linguistics',
                    name: '英语语言学',
                    keywords: ['语言学', 'linguistics', '语音学', '语法学', '语义学', '语用学'],
                    knowledge: '语言学分支：\n\n语音学（Phonetics）：语音的产生、传播和感知\n音系学（Phonology）：语音的系统组织和规律\n形态学（Morphology）：词的内部结构和构词法\n语法学（Syntax）：句子的结构和规则\n语义学（Semantics）：意义的系统和规律\n语用学（Pragmatics）：语言在语境中的使用\n\n重要概念：\n  音素（phoneme）：最小语音单位\n  语素（morpheme）：最小意义单位\n  句法树（syntax tree）：句子结构分析',
                    example: '分析单词 "unhappiness" 的形态结构：\nun-（前缀：否定）+ happy（词根：高兴）+ -ness（后缀：名词化）\n= 不快乐（名词）\n\n共3个语素：un, happy, ness',
                    analysis: '形态学分析就是把一个词分解为最小的有意义的单位（语素）。',
                    mistakes: '常见错误：混淆音素和语素，形态分析和语音分析搞混。',
                    tips: '语言学理论性强，结合具体例子理解抽象概念。'
                }
            ]
        }
    },

    levelKeywords: {
        kindergarten: ['幼儿园', '学前', '启蒙', '幼儿', '小朋友'],
        primary: ['小学', '小学英语', '三年级', '四年级', '五年级', '六年级', '小升初'],
        junior: ['初中', '七年级', '八年级', '九年级', '初一', '初二', '初三', '中考'],
        senior: ['高中', '高一', '高二', '高三', '高考'],
        vocational: ['职高', '中职', '商务英语', '职场英语'],
        university: ['大学', '英语专业', '四六级', '考研英语', '雅思', '托福', '学术英语']
    },

    detectLevel: function(question, context) {
        var q = (question || '').toLowerCase();
        var ctx = (context || '').toLowerCase();
        for (var level in this.levelKeywords) {
            var keywords = this.levelKeywords[level];
            for (var i = 0; i < keywords.length; i++) {
                if (ctx.includes(keywords[i])) return level;
            }
        }
        for (var level in this.levelKeywords) {
            var keywords = this.levelKeywords[level];
            for (var i = 0; i < keywords.length; i++) {
                if (q.includes(keywords[i])) return level;
            }
        }
        return 'primary';
    },

    findKnowledge: function(question, level) {
        var q = (question || '').toLowerCase();
        var levelData = this.levels[level];
        if (!levelData) return null;
        var bestMatch = null, bestScore = 0;
        for (var i = 0; i < levelData.topics.length; i++) {
            var topic = levelData.topics[i];
            var score = 0;
            if (topic.keywords) {
                for (var j = 0; j < topic.keywords.length; j++) {
                    if (q.includes(topic.keywords[j].toLowerCase())) score += topic.keywords[j].length >= 4 ? 3 : 2;
                }
            }
            if (q.includes(topic.name.toLowerCase())) score += 5;
            if (score > bestScore) { bestScore = score; bestMatch = topic; }
        }
        return bestScore >= 2 ? bestMatch : null;
    },

    handle: function(question, cleanQ, context) {
        if (!question) return null;
        var q = (cleanQ || question).toLowerCase();
        var level = this.detectLevel(question, context);
        var knowledge = this.findKnowledge(question, level);
        if (knowledge) {
            return teach(knowledge.name, knowledge.knowledge, knowledge.example,
                knowledge.analysis, knowledge.mistakes, knowledge.tips);
        }
        var allLevels = ['kindergarten', 'primary', 'junior', 'senior', 'vocational', 'university'];
        for (var i = 0; i < allLevels.length; i++) {
            if (allLevels[i] === level) continue;
            knowledge = this.findKnowledge(question, allLevels[i]);
            if (knowledge) {
                return teach(knowledge.name + '\uff08' + this.levels[allLevels[i]].name + '\uff09',
                    knowledge.knowledge, knowledge.example,
                    knowledge.analysis, knowledge.mistakes, knowledge.tips);
            }
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
            var questions = [
                {q: 'He ___ to school every day.\nA. go  B. goes  C. going  D. went', a: 'B', h: '\u4e09\u5355\u52a0s'},
                {q: 'I ___ my homework yesterday.\nA. finish  B. finishes  C. finished  D. finishing', a: 'C', h: 'yesterday\u7528\u8fc7\u53bb\u65f6'},
                {q: 'She ___ reading when I came in.\nA. is  B. was  C. has  D. had', a: 'B', h: '\u8fc7\u53bb\u8fdb\u884c\u65f6'},
                {q: 'The book ___ I bought is very interesting.\nA. who  B. whom  C. which  D. what', a: 'C', h: '\u6307\u7269\u7528which/that'}
            ];
            var idx = rand(0, questions.length - 1);
            return {question: questions[idx].q, answer: questions[idx].a, type: '\u9009\u62e9\u9898', hint: questions[idx].h, level: level};
        }

        if (t === '\u586b\u7a7a\u9898') {
            var fills = [
                {q: 'There ___ (be) some water in the glass.', a: 'is', h: 'water\u662f\u4e0d\u53ef\u6570\u540d\u8bcd'},
                {q: 'I have ___ (live) here since 2010.', a: 'lived', h: 'since\u63a5\u73b0\u5728\u5b8c\u6210\u65f6'},
                {q: 'English ___ (speak) all over the world.', a: 'is spoken', h: '\u88ab\u52a8\u8bed\u6001'},
                {q: 'He suggested that we ___ (go) there by bus.', a: 'go', h: 'suggest\u540e\u63a5\u865a\u62df\u8bed\u6c14'}
            ];
            var idx2 = rand(0, fills.length - 1);
            return {question: fills[idx2].q, answer: fills[idx2].a, type: '\u586b\u7a7a\u9898', hint: fills[idx2].h, level: level};
        }

        var topics = [
            {q: '\u7528\u82f1\u8bed\u4ecb\u7ecd\u4f60\u7684\u5bb6\u4eba\uff08\u81f3\u5c115\u53e5\uff09\u3002', a: '\u53c2\u8003\u7b54\u6848\uff1a\nThere are three people in my family: my father, my mother and me. My father is a teacher and my mother is a doctor. I am a student. I love my family very much.', h: '\u5148\u8bf4\u4eba\u6570\uff0c\u518d\u4ecb\u7ecd\u6bcf\u4e2a\u4eba'},
            {q: '\u7ffb\u8bd1\uff1a\u4ed6\u6bcf\u5929\u65e9\u4e0a\u4e03\u70b9\u8d77\u5e8a\u3002', a: 'He gets up at seven o\'clock every morning.', h: '\u4e3b\u8bed+\u52a8\u8bcd+\u65f6\u95f4'},
            {q: '\u6539\u9519\uff1aHe don\'t like playing football.', a: 'He doesn\'t like playing football.\n\u9519\u8bef\uff1a\u7b2c\u4e09\u4eba\u79f0\u5355\u6570\u7528doesn\'t', h: '\u68c0\u67e5\u4e3b\u8c13\u4e00\u81f4'}
        ];
        var idx3 = rand(0, topics.length - 1);
        return {question: topics[idx3].q, answer: topics[idx3].a, type: '\u89e3\u7b54\u9898', hint: topics[idx3].h, level: level};
    },

    knowledgeDB: []
};
