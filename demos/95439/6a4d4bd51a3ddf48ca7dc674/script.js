const pageMap = {
    home: 'page-home',
    library: 'page-library',
    create: 'page-create',
    reading: 'page-reading',
    discover: 'page-discover',
    about: 'page-about'
};

const STORAGE_KEY = 'daoli_study_books';
const FAVORITES_KEY = 'daoli_study_favorites';
const LIKES_KEY = 'daoli_study_likes';
const COMMENTS_KEY = 'daoli_study_comments';

let selectedColor = '#8B4513';
let currentBookId = null;
let currentChapterIndex = 0;
let aiGeneratedData = null;

const defaultBooks = [
    {
        id: 1,
        title: '职场生存法则',
        author: '过来人',
        cover: '#8B5A2B',
        description: '十年职场摸爬滚打总结出的30条铁律，帮你少走弯路，多走对路。',
        category: 'work',
        isPublic: true,
        tags: ['职场', '生存', '成长', '经验'],
        coverQuote: '别把平台当本事',
        chapters: [
            { title: '第一章：面试那些事儿', content: '面试是职场的第一道门槛。很多人能力很强，却因为不懂得面试技巧而错失良机。面试不是考验你有多厉害，而是考验你有多匹配。\n\n首先，要了解公司和岗位。不要拿着一份简历海投，针对不同的公司和岗位，要准备不同的侧重点。其次，学会讲故事。用STAR法则（情境-任务-行动-结果）来组织你的经历，让面试官看到你的思考过程。\n\n最后，真诚永远是最好的套路。不要造假，但可以学会更好地表达自己。' },
            { title: '第二章：新人入职指南', content: '刚入职的前三个月，决定了你能不能在这家公司站稳脚跟。新人最容易犯的错误，就是急于表现自己。\n\n其实，新人期最重要的是观察和学习。观察公司的文化，观察团队的相处模式，观察领导的做事风格。不要急于发表意见，先搞清楚游戏规则。\n\n多问问题，但不要问蠢问题。问之前先自己想想，实在想不通再去请教。请教的时候要带着你的思考去，而不是空着手去。' },
            { title: '第三章：与领导相处之道', content: '与领导相处，是职场中最重要的课题之一。很多人能力很强，却因为跟领导关系不好而郁郁不得志。\n\n首先，要理解领导的压力。领导不是神，领导也有KPI，也有他的领导。你要做的，是帮领导解决问题，而不是给领导制造问题。\n\n其次，学会汇报。汇报工作不是流水账，而是讲结果、讲问题、讲方案。让领导做选择题，而不是问答题。\n\n最后，保持适当的距离。不要跟领导称兄道弟，也不要怕领导怕得要死。尊重、专业、靠谱，这是最好的相处方式。' },
            { title: '第四章：同事之间的边界感', content: '同事不是朋友，但也不是敌人。同事之间最重要的，是边界感。\n\n不要打听别人的隐私，也不要随便透露自己的私事。工作关系就保持在工作层面，不要掺杂太多私人感情。\n\n帮忙是情分，不帮是本分。不要做老好人，也不要太冷漠。找到那个平衡点，你就赢了。' },
            { title: '第五章：升职加薪的底层逻辑', content: '很多人以为，只要努力工作就能升职加薪。其实不是的。升职加薪的底层逻辑是：你值不值这个价。\n\n首先，你要做出超出当前岗位的成绩。如果你只做分内之事，那你就只配拿现在的工资。想要升职，你得先证明自己能胜任更高的职位。\n\n其次，要让领导看到你的价值。埋头苦干是不够的，你得学会展示自己的成果。不是炫耀，而是让领导知道你在做什么、做成了什么。\n\n最后，要有不可替代性。如果你的工作谁都能做，那为什么要给你升职加薪？找到自己的核心竞争力，让自己变得不可或缺。' }
        ],
        wisdomCards: [
            '别把平台当本事，离开平台你什么都不是。',
            '职场中，靠谱比聪明更重要。',
            '不要用战术上的勤奋，掩盖战略上的懒惰。',
            '跟领导相处，要让他做选择题，不要让他做问答题。'
        ],
        likes: 128,
        wisdomCount: 30
    },
    {
        id: 2,
        title: '人情世故笔记',
        author: '岁月拾遗',
        cover: '#800020',
        description: '人际交往中那些没人明说但必须懂的规矩，让你在社会中如鱼得水。',
        category: 'relationship',
        isPublic: true,
        tags: ['人情世故', '社交', '沟通', '情商'],
        coverQuote: '听懂话外之音，是种修行',
        chapters: [
            { title: '第一章：说话的艺术', content: '说话是一门艺术。一句话能让人笑，一句话也能让人跳。\n\n首先，学会倾听。很多人急于表达，却忘了倾听才是沟通的基础。别人说话的时候，认真听，不要打断。听懂了再回应。\n\n其次，说话要看人看场合。跟不同的人说不同的话，在不同的场合有不同的表达方式。不是虚伪，是尊重。\n\n最后，学会好好说话。同样的意思，换一种说法，效果天差地别。把"你听懂了吗"换成"我说清楚了吗"，把"随便"换成"听你的"，你会发现世界都变温柔了。' },
            { title: '第二章：送礼的学问', content: '送礼是人情往来的重要部分。很多人觉得送礼俗，其实送礼送的不是礼，是心意。\n\n首先，送礼要送到心坎上。不是越贵越好，而是对方需要什么、喜欢什么，你送什么，那才是最好的。\n\n其次，送礼要讲究方式方法。不要当着很多人的面送，不要让对方有压力。私下里送，轻描淡写地送，对方收得也舒服。\n\n最后，礼尚往来。人家送了你，你要记得回礼。人情就是这样一来一往，慢慢变深的。' },
            { title: '第三章：酒桌文化', content: '酒桌是中国人情社会的缩影。很多事情，在办公室里谈不成，在酒桌上就谈成了。\n\n首先，摆正自己的位置。谁是主，谁是客，谁坐哪儿，谁先敬酒，这些都是有讲究的。不懂就多观察，不要乱坐乱说。\n\n其次，喝酒要看人。能喝就喝一点，不能喝就坦诚说出来，不要硬撑，也不要劝别人喝酒。\n\n最后，酒桌上学到的东西，比酒本身重要得多。观察每个人的言行举止，你能学到很多。' },
            { title: '第四章：拒绝的智慧', content: '很多人不懂得拒绝，结果把自己搞得很累，还不一定落好。其实，拒绝也是一种能力。\n\n首先，该拒绝的就要拒绝。不要因为不好意思就答应，答应了又做不到，或者做得很勉强，那还不如一开始就拒绝。\n\n其次，拒绝要讲究方式。直接说"不"太生硬，可以委婉一点。可以先表示理解，然后说明自己的难处，最后再拒绝。\n\n最后，不要因为拒绝别人而愧疚。每个人都有自己的底线和原则，守住自己的边界，不是错。' }
        ],
        wisdomCards: [
            '成年人的世界里，没有爽快答应就是拒绝。',
            '把"你听懂了吗"换成"我说清楚了吗"。',
            '送礼要送到心坎上，不是越贵越好。',
            '守住自己的边界，不是错。'
        ],
        likes: 256,
        wisdomCount: 24
    },
    {
        id: 3,
        title: '人生四十不惑',
        author: '不惑先生',
        cover: '#2F4F4F',
        description: '人到中年才看懂的真相，写给年轻时的自己，也写给正在赶路的你。',
        category: 'life',
        isPublic: true,
        tags: ['人生', '中年', '感悟', '成长'],
        coverQuote: '父母在，人生尚有来处',
        chapters: [
            { title: '第一章：健康是最大的财富', content: '年轻的时候，我们拿健康换钱。到老了，我们拿钱换健康。可惜，很多时候换不回来。\n\n四十岁以后，你会发现，健康不是第一，而是唯一。没有健康，什么事业、家庭、梦想，都是空谈。\n\n从现在开始，好好吃饭，好好睡觉，好好运动。不要熬夜，不要透支身体。身体是革命的本钱，这本钱，你耗不起。' },
            { title: '第二章：父母在，人生尚有来处', content: '年少的时候，我们总想逃离家。长大了才发现，有父母在的地方，才是家。\n\n父母在，人生尚有来处；父母去，人生只剩归途。这句话，年轻的时候读不懂，读懂的时候已经不年轻了。\n\n有空多回家看看，没空就多打打电话。不要等，等你有空的时候，可能已经来不及了。' },
            { title: '第三章：婚姻的真相', content: '谈恋爱是跟对方的优点谈恋爱，结婚是跟对方的缺点过日子。\n\n婚姻里，没有完美的伴侣，只有互相包容的两个人。不要试图改变对方，改变自己都难，何况改变别人。\n\n婚姻不是爱情的坟墓，婚姻是爱情的升华。从轰轰烈烈，到平平淡淡，从两个人，到一大家人。这里面有责任，有担当，更有细水长流的温情。' },
            { title: '第四章：朋友贵在精不在多', content: '年轻的时候，我们认识很多人，觉得朋友越多越好。到了中年才发现，真正的朋友，就那么几个。\n\n朋友不是酒桌上称兄道弟的人，朋友是你落难时愿意拉你一把的人。朋友不是天天见面的人，朋友是很久不见，见面依然亲切的人。\n\n朋友贵在精，不在多。有那么三五个真心朋友，这辈子就值了。' },
            { title: '第五章：与自己和解', content: '人到中年，最重要的一课，是与自己和解。\n\n接受自己的平凡。我们都是普通人，没有超能力，也成不了拯救世界的英雄。但普通人也有普通人的幸福。\n\n接受自己的不完美。每个人都有缺点，都有遗憾。不要跟自己较劲，放过自己，你才能活得轻松。\n\n接受生命中的无常。很多事情，不是努力就有结果，不是付出就有回报。但那又怎样呢？过程本身，就是意义。' }
        ],
        wisdomCards: [
            '父母在，人生尚有来处；父母去，人生只剩归途。',
            '健康不是第一，而是唯一。',
            '真正的成熟，是你不再向任何人证明任何事。',
            '朋友贵在精，不在多。'
        ],
        likes: 512,
        wisdomCount: 28
    },
    {
        id: 4,
        title: '创业避坑指南',
        author: '连续创业者',
        cover: '#191970',
        description: '三次创业两次失败换来的血泪教训，每一条都是真金白银买来的经验。',
        category: 'work',
        isPublic: true,
        tags: ['创业', '商业', '经验', '避坑'],
        coverQuote: '选择比努力更重要',
        chapters: [
            { title: '第一章：选对赛道比努力重要', content: '创业，选赛道是第一步，也是最重要的一步。赛道选错了，再努力也没用。\n\n什么是好赛道？首先，市场要大。小池塘里养不出大鱼。其次，要有增长趋势。夕阳行业再怎么折腾，也翻不出什么浪花。最后，要有差异化。别人都在做的事情，你凭什么能做好？\n\n不要为了创业而创业。想清楚你要做什么、为什么做、怎么做，再动手也不迟。' },
            { title: '第二章：合伙人选择原则', content: '合伙人，是创业中最重要的人。选对了合伙人，成功了一半；选错了合伙人，还没开始就注定失败。\n\n首先，价值观要一致。你们为什么创业？想要什么？这些根本问题上如果不一致，迟早会出问题。\n\n其次，能力要互补。如果你们俩都擅长同样的事情，那很多事情就没人做了。有人擅长技术，有人擅长运营，有人擅长商务，这样的组合才靠谱。\n\n最后，信任是基础。合伙人之间，如果连基本的信任都没有，那还是别一起创业了。' },
            { title: '第三章：现金流是生命线', content: '创业公司怎么死的？大多数都是没钱了。现金流，是创业公司的生命线。\n\n不要小看钱的问题。很多创始人觉得，我有好产品、好想法，钱不是问题。其实，钱就是最大的问题。\n\n花钱的时候要谨慎。每一分钱都要花在刀刃上。能省则省，不要铺张浪费。你永远不知道，明天和意外哪个先来。\n\n融资的时候要抓紧。不要等钱快花完了才去融资，那时候你就被动了。手里有钱，心里不慌。' },
            { title: '第四章：招人用人的坑', content: '创业公司，人是最宝贵的资产。但招人用人，也是最容易踩坑的地方。\n\n招人不要急。不要因为缺人就随便招。招错一个人，比没人更可怕。不仅浪费钱，更浪费时间，还可能带坏团队风气。\n\n用人要大胆。招到了合适的人，就要充分信任，充分授权。不要什么都自己抓着，那样你累，员工也累，还做不好事情。\n\n淘汰要果断。不合适的人，越早送走越好。不要不好意思，拖到最后，对谁都不好。' },
            { title: '第五章：什么时候该放弃', content: '坚持，是创业者的美德。但有时候，放弃比坚持更需要勇气。\n\n方向错了，越努力越失败。发现路走不通的时候，及时止损，也是一种智慧。\n\n但是，放弃之前，先问问自己：你真的尽全力了吗？你有没有试过所有可能的办法？如果答案是肯定的，那放弃也没什么丢人的。\n\n创业不是人生的全部。输了就输了，大不了从头再来，或者回去上班。天不会塌下来。' }
        ],
        wisdomCards: [
            '选对赛道比努力重要。',
            '现金流是创业公司的生命线。',
            '招错一个人，比没人更可怕。',
            '有时候，放弃比坚持更需要勇气。'
        ],
        likes: 89,
        wisdomCount: 22
    },
    {
        id: 5,
        title: '自我成长手记',
        author: '终身学习者',
        cover: '#556B2F',
        description: '一个普通人十年成长的真实记录，告诉你普通人大器晚成的底层方法。',
        category: 'growth',
        isPublic: true,
        tags: ['成长', '学习', '自律', '提升'],
        coverQuote: '每天进步一点点',
        chapters: [
            { title: '第一章：早起改变人生', content: '你怎么过早晨，就怎么过一天。\n\n以前我也是熬夜党，早上起不来，一天浑浑噩噩。后来开始早起，人生好像开了挂一样。\n\n早起的那几个小时，是完全属于你自己的。没人打扰，你可以读书、运动、思考。一天之计在于晨，这句话是对的。\n\n怎么才能早起？首先要早睡。晚上不睡，早上当然起不来。其次，给早起一个理由。你早起要做什么？想清楚了，才有动力起床。' },
            { title: '第二章：读书这件事', content: '读书，是成本最低的成长方式。\n\n一本书几十块钱，却可能浓缩了作者一辈子的智慧。这买卖，太值了。\n\n但读书不是为了装样子，不是为了晒朋友圈。读书是为了解决问题，是为了开拓眼界，是为了提升自己。\n\n怎么读书？首先，要读好书。烂书不如不读。其次，要有方法。带着问题去读，做笔记，去实践。不实践的读书，只是消遣。' },
            { title: '第三章：刻意练习', content: '为什么很多人工作了十年，还是没有成为专家？因为他们只是在重复，没有在进步。\n\n真正的进步，需要刻意练习。什么是刻意练习？就是走出舒适区，挑战自己不擅长的事情，并且持续获得反馈。\n\n刻意练习是痛苦的。但痛苦之后，是成长。如果你觉得最近过得很舒服，那你要小心了，你可能已经停止进步了。' },
            { title: '第四章：时间管理真相', content: '时间管理是个伪命题。时间对每个人都是公平的，一天都是24小时。\n\n所谓时间管理，本质上是选择管理。你选择把时间花在什么地方，你就会成为什么样的人。\n\n重要的事情永远有时间。说"我没时间"的人，只是觉得这件事不重要而已。\n\n少刷手机，少做无用社交，专注在真正重要的事情上。你会发现，你的时间其实很多。' },
            { title: '第五章：走出舒适区', content: '舒适区很舒服，但待久了，人就废了。\n\n成长，就是不断走出舒适区的过程。每一次挑战自己，每一次突破极限，你都会变得更强。\n\n但也不要太急。走出舒适区，不是一下子跳到火坑里。慢慢来，一步一步地，今天比昨天进步一点点就好。\n\n记住，成长是一辈子的事情。不要急，但也不要停。' }
        ],
        wisdomCards: [
            '你永远赚不到超出你认知范围之外的钱。',
            '读书，是成本最低的成长方式。',
            '如果你觉得最近过得很舒服，那你要小心了。',
            '时间管理的本质，是选择管理。'
        ],
        likes: 342,
        wisdomCount: 24
    }
];

const wisdomCardsData = [
    {
        content: '别把平台当本事，离开平台你什么都不是，这个道理越早懂越好。',
        source: '—— 来自《职场生存法则》'
    },
    {
        content: '成年人的世界里，没有爽快答应就是拒绝。听懂话外之音，是种修行。',
        source: '—— 来自《人情世故笔记》'
    },
    {
        content: '父母在，人生尚有来处；父母去，人生只剩归途。尽孝要趁早。',
        source: '—— 来自《人生四十不惑》'
    },
    {
        content: '不要用战术上的勤奋，掩盖战略上的懒惰。选择比努力更重要。',
        source: '—— 来自《创业避坑指南》'
    },
    {
        content: '你永远赚不到超出你认知范围之外的钱，除非你靠运气。靠运气赚到的钱，最后往往又会靠实力亏掉。',
        source: '—— 来自《自我成长手记》'
    },
    {
        content: '真正的成熟，是你不再向任何人证明任何事。你只需要对自己的人生负责。',
        source: '—— 来自《人生四十不惑》'
    }
];

const publicShelvesData = [
    {
        name: '老茶客的书房',
        owner: '茶味人生',
        bookCount: 12,
        description: '三十年人生阅历，慢煮岁月，细品人生',
        avatar: '茶',
        books: ['#8B5A2B', '#2F4F4F', '#556B2F', '#800020', '#4A4A4A']
    },
    {
        name: '职场修行者',
        owner: '职场老司机',
        bookCount: 8,
        description: '在职场中修行，在工作中成长',
        avatar: '职',
        books: ['#191970', '#2F4F4F', '#4A4A4A', '#8B5A2B']
    },
    {
        name: '人间清醒',
        owner: '清醒君',
        bookCount: 15,
        description: '看透人情世故，依然热爱生活',
        avatar: '清',
        books: ['#800020', '#8B5A2B', '#556B2F', '#191970', '#2F4F4F', '#4A4A4A']
    },
    {
        name: '成长之路',
        owner: '向上生长',
        bookCount: 10,
        description: '每天进步一点点，坚持带来大改变',
        avatar: '长',
        books: ['#556B2F', '#191970', '#8B5A2B', '#2F4F4F']
    }
];

const aiTemplates = {
    life: {
        titles: ['岁月如歌', '人生海海', '慢慢走，比较快', '生活的答案', '人间值得'],
        chapterPrefix: '第',
        chapterSuffix: '章：',
        chapters: ['关于成长', '关于选择', '关于遗憾', '关于幸福', '关于和解'],
        tags: ['人生感悟', '成长', '生活智慧', '思考'],
        quotes: ['慢慢来，比较快', '生活不在别处，就在当下', '每一步都算数', '人生没有白走的路'],
        wisdom: '真正的成长，是与自己和解的过程。接受不完美，才能拥抱更完整的人生。'
    },
    work: {
        titles: ['职场进化论', '工作的意义', '向上生长', '职场心理学', '成长型思维'],
        chapterPrefix: '第',
        chapterSuffix: '章：',
        chapters: ['职业规划', '能力提升', '沟通协作', '领导力', '破局之道'],
        tags: ['职场', '成长', '能力提升', '职业发展'],
        quotes: ['能力是最好的名片', '比努力更重要的是方向', '你的价值，不可替代'],
        wisdom: '在职场中，靠谱比聪明更重要。把每一件小事做好，就是最大的本事。'
    },
    relationship: {
        titles: ['关系的艺术', '与人相处', '界限感', '共情力', '好好说话'],
        chapterPrefix: '第',
        chapterSuffix: '章：',
        chapters: ['有效沟通', '边界意识', '情感表达', '冲突处理', '亲密关系'],
        tags: ['人际关系', '沟通', '情商', '社交'],
        quotes: ['听懂话外之音', '边界感是最高级的尊重', '好好说话，是一辈子的修行'],
        wisdom: '最好的关系，是彼此舒服。不用刻意讨好，也不用勉强迁就，做真实的自己就好。'
    },
    growth: {
        titles: ['终身成长', '进化之路', '成为更好的自己', '向上的力量', '成长有痕'],
        chapterPrefix: '第',
        chapterSuffix: '章：',
        chapters: ['自我认知', '习惯养成', '学习方法', '思维升级', '持续行动'],
        tags: ['个人成长', '自律', '学习', '提升'],
        quotes: ['每天进步一点点', '成长是一辈子的事', '你当像鸟飞往你的山'],
        wisdom: '成长不是一蹴而就的，而是日积月累的。今天的你，比昨天的你进步一点点，就够了。'
    },
    other: {
        titles: ['随想录', '思想碎片', '微光集', '路上的风景', '人间观察'],
        chapterPrefix: '第',
        chapterSuffix: '章：',
        chapters: ['所思所想', '所见所闻', '所感所悟', '所得所失', '所念所盼'],
        tags: ['随笔', '思考', '生活', '记录'],
        quotes: ['记录，是最好的纪念', '每一个当下，都是未来的回忆', '文字有温度'],
        wisdom: '人生是一场体验，愿你尽情感受，尽情记录，尽情热爱。'
    }
};

const searchResultsMap = {
    '朋友关系变淡怎么办': [
        {
            title: '关系变淡不是你的错',
            author: '过来人',
            cover: '#800020',
            desc: '有些关系，走着走着就散了。不是谁的错，只是人生阶段不同了。',
            tags: ['友情', '关系', '成长']
        },
        {
            title: '朋友之间的边界感',
            author: '清醒君',
            cover: '#2F4F4F',
            desc: '好的友情，也需要边界。保持适当的距离，友谊才能更长久。',
            tags: ['友情', '边界感', '相处']
        },
        {
            title: '不必维持所有关系',
            author: '不惑先生',
            cover: '#556B2F',
            desc: '人生就像一列火车，有人上车，有人下车。能陪你走到底的，就那么几个。',
            tags: ['人生', '友情', '取舍']
        }
    ],
    '职场焦虑': [
        {
            title: '职场焦虑自救指南',
            author: '职场老司机',
            cover: '#8B5A2B',
            desc: '焦虑不可怕，可怕的是被焦虑吞噬。行动起来，焦虑就会退散。',
            tags: ['职场', '焦虑', '心理健康']
        },
        {
            title: '工作的意义',
            author: '思考者',
            cover: '#191970',
            desc: '工作不是人生的全部，但工作确实占据了人生很大一部分。',
            tags: ['职场', '意义', '思考']
        },
        {
            title: '职业规划：找到你的赛道',
            author: '职业生涯规划师',
            cover: '#CD853F',
            desc: '选对赛道比努力更重要。找到你真正热爱且擅长的事情。',
            tags: ['职场', '规划', '发展']
        }
    ],
    '人生意义': [
        {
            title: '人生有什么意义',
            author: '思想者',
            cover: '#2F4F4F',
            desc: '也许人生本来没有意义，意义是我们自己赋予的。',
            tags: ['人生', '哲学', '意义']
        },
        {
            title: '活着为了什么',
            author: '不惑先生',
            cover: '#800020',
            desc: '为了爱你的人，为了你爱的人，为了这一趟旅程本身。',
            tags: ['人生', '活着', '感悟']
        },
        {
            title: '平凡人的英雄主义',
            author: '普通人',
            cover: '#556B2F',
            desc: '认清生活的真相后，依然热爱生活。这就是平凡人的英雄主义。',
            tags: ['人生', '热爱', '成长']
        }
    ]
};

let sampleBooks = [];
let favorites = [];
let likes = {};
let comments = {};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function loadFromStorage() {
    try {
        const storedBooks = localStorage.getItem(STORAGE_KEY);
        if (storedBooks) {
            const userBooks = JSON.parse(storedBooks);
            sampleBooks = [...userBooks, ...defaultBooks];
        } else {
            sampleBooks = [...defaultBooks];
        }

        const storedFavorites = localStorage.getItem(FAVORITES_KEY);
        if (storedFavorites) {
            favorites = JSON.parse(storedFavorites);
        }

        const storedLikes = localStorage.getItem(LIKES_KEY);
        if (storedLikes) {
            likes = JSON.parse(storedLikes);
        }

        const storedComments = localStorage.getItem(COMMENTS_KEY);
        if (storedComments) {
            comments = JSON.parse(storedComments);
        }
    } catch (e) {
        console.error('加载数据失败:', e);
        sampleBooks = [...defaultBooks];
    }
}

function saveBooksToStorage() {
    try {
        const userBooks = sampleBooks.filter(book => book.id > 1000);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userBooks));
    } catch (e) {
        console.error('保存失败:', e);
    }
}

function saveFavoritesToStorage() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function saveLikesToStorage() {
    localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
}

function saveCommentsToStorage() {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

function showPage(pageKey) {
    const pageId = pageMap[pageKey];
    if (!pageId) return;

    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageKey) {
            link.classList.add('active');
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderBooks() {
    const shelfRow1 = document.getElementById('shelf-row-1');
    const shelfRow2 = document.getElementById('shelf-row-2');
    if (!shelfRow1 || !shelfRow2) return;

    const userBooks = sampleBooks.filter(book => book.id > 1000);
    const displayBooks = userBooks.length > 0 ? [...userBooks, ...defaultBooks.slice(0, 3)] : sampleBooks.slice(0, 5);

    const half = Math.ceil(displayBooks.length / 2);
    const row1Books = displayBooks.slice(0, half);
    const row2Books = displayBooks.slice(half);

    shelfRow1.innerHTML = row1Books.map(book => createBookHTML(book)).join('');
    shelfRow2.innerHTML = row2Books.map(book => createBookHTML(book)).join('');
}

function createBookHTML(book) {
    return `
        <div class="book-item" style="background: linear-gradient(135deg, ${book.cover}, ${adjustColor(book.cover, -30)})" onclick="openBook(${book.id})">
            <div class="book-spine-line"></div>
            <div class="book-item-title">${escapeHtml(book.title)}</div>
            <div class="book-cover-deco">❦</div>
            <div class="book-item-author">${escapeHtml(book.author)}</div>
            <div class="book-cover-bottom"></div>
        </div>
    `;
}

function renderWisdomCards() {
    const cardsGrid = document.getElementById('wisdom-cards');
    if (!cardsGrid) return;

    cardsGrid.innerHTML = wisdomCardsData.map(card => `
        <div class="wisdom-card">
            <div class="wisdom-card-content">${escapeHtml(card.content)}</div>
            <div class="wisdom-card-source">${escapeHtml(card.source)}</div>
        </div>
    `).join('');
}

function renderPublicShelves() {
    const shelvesGrid = document.getElementById('public-shelves');
    if (!shelvesGrid) return;

    shelvesGrid.innerHTML = publicShelvesData.map(shelf => `
        <div class="shelf-card">
            <div class="shelf-card-header">
                <div class="shelf-avatar">${escapeHtml(shelf.avatar)}</div>
                <div class="shelf-info">
                    <h3>${escapeHtml(shelf.name)}</h3>
                    <p>${escapeHtml(shelf.owner)} · ${shelf.bookCount}本书</p>
                </div>
            </div>
            <p>${escapeHtml(shelf.description)}</p>
            <div class="shelf-books-preview">
                ${shelf.books.map(color => `<div class="mini-book" style="background: linear-gradient(135deg, ${color}, ${adjustColor(color, -20)})"></div>`).join('')}
            </div>
        </div>
    `).join('');
}

function openBook(bookId) {
    const book = sampleBooks.find(b => b.id === bookId);
    if (!book) return;

    currentBookId = bookId;
    currentChapterIndex = 0;

    const readingCover = document.getElementById('reading-cover');
    const readingCoverTitle = document.getElementById('reading-cover-title');
    const readingTitle = document.getElementById('reading-title');
    const readingAuthor = document.getElementById('reading-author');
    const readingDesc = document.getElementById('reading-desc');
    const chaptersList = document.getElementById('chapters-list');
    const bookTags = document.getElementById('book-tags');
    const bookStatus = document.getElementById('book-status');
    const coverQuote = document.getElementById('cover-quote');
    const readingWisdomCards = document.getElementById('reading-wisdom-cards');

    if (readingCover) {
        readingCover.style.background = `linear-gradient(135deg, ${book.cover}, ${adjustColor(book.cover, -30)})`;
    }
    if (readingCoverTitle) {
        readingCoverTitle.textContent = book.title;
    }
    if (readingTitle) {
        readingTitle.textContent = book.title;
    }
    if (readingAuthor) {
        readingAuthor.textContent = book.author + ' 著';
    }
    if (readingDesc) {
        readingDesc.innerHTML = `<span class="drop-cap">${escapeHtml(book.description.charAt(0))}</span>${escapeHtml(book.description.slice(1))}`;
    }
    if (chaptersList) {
        chaptersList.innerHTML = book.chapters.map((chapter, index) => `
            <li onclick="openChapter(${index})">${escapeHtml(chapter.title)}</li>
        `).join('');
    }
    if (bookTags && book.tags) {
        bookTags.innerHTML = book.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
    }
    if (bookStatus) {
        bookStatus.innerHTML = book.isPublic 
            ? '<span class="status-badge status-public">🌍 公开</span>'
            : '<span class="status-badge status-private">🔒 私密</span>';
    }
    if (coverQuote && book.coverQuote) {
        coverQuote.textContent = `"${book.coverQuote}"`;
    }
    if (readingWisdomCards && book.wisdomCards) {
        readingWisdomCards.innerHTML = book.wisdomCards.map((wisdom, index) => `
            <div class="mini-wisdom-card">
                <div class="mini-wisdom-icon">💡</div>
                <div class="mini-wisdom-text">${escapeHtml(wisdom)}</div>
            </div>
        `).join('');
    }

    updateInteractionUI();
    renderComments();
    hideChapterContent();

    showPage('reading');
}

function openChapter(index) {
    const book = sampleBooks.find(b => b.id === currentBookId);
    if (!book || !book.chapters[index]) return;

    currentChapterIndex = index;
    const chapter = book.chapters[index];

    const section = document.getElementById('chapter-content-section');
    const content = document.getElementById('chapter-content');

    if (section && content) {
        section.style.display = 'block';
        content.innerHTML = chapter.content.split('\n\n').map(p => `<p>${escapeHtml(p)}</p>`).join('');
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function hideChapterContent() {
    const section = document.getElementById('chapter-content-section');
    if (section) {
        section.style.display = 'none';
    }
}

function updateInteractionUI() {
    if (!currentBookId) return;

    const likeCount = document.getElementById('like-count');
    const btnLike = document.getElementById('btn-like');
    const btnFavorite = document.getElementById('btn-favorite');

    const book = sampleBooks.find(b => b.id === currentBookId);
    if (book && likeCount) {
        const totalLikes = book.likes + (likes[currentBookId] ? 1 : 0);
        likeCount.textContent = totalLikes;
    }

    if (btnLike) {
        if (likes[currentBookId]) {
            btnLike.classList.add('liked');
        } else {
            btnLike.classList.remove('liked');
        }
    }

    if (btnFavorite) {
        if (favorites.includes(currentBookId)) {
            btnFavorite.classList.add('favorited');
        } else {
            btnFavorite.classList.remove('favorited');
        }
    }
}

function toggleLike() {
    if (!currentBookId) return;

    if (likes[currentBookId]) {
        delete likes[currentBookId];
    } else {
        likes[currentBookId] = true;
    }

    saveLikesToStorage();
    updateInteractionUI();
    showToast(likes[currentBookId] ? '已点赞 ❤️' : '已取消点赞');
}

function toggleFavorite() {
    if (!currentBookId) return;

    const index = favorites.indexOf(currentBookId);
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('已取消收藏');
    } else {
        favorites.push(currentBookId);
        showToast('已收藏 ⭐');
    }

    saveFavoritesToStorage();
    updateInteractionUI();
}

function quoteWisdom() {
    showToast('已引用到我的书房草稿 📝');
}

function shareBook() {
    const book = sampleBooks.find(b => b.id === currentBookId);
    if (book) {
        const url = window.location.href + '?book=' + book.id;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                showToast('分享链接已复制 🔗');
            }).catch(() => {
                showToast('分享链接已复制 🔗');
            });
        } else {
            showToast('分享链接已复制 🔗');
        }
    }
}

function renderComments() {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList || !currentBookId) return;

    const bookComments = comments[currentBookId] || [];

    if (bookComments.length === 0) {
        commentsList.innerHTML = '<div class="no-comments">暂无评论，来说说你的想法吧~</div>';
        return;
    }

    commentsList.innerHTML = bookComments.map(comment => `
        <div class="comment-item">
            <div class="comment-avatar">${escapeHtml(comment.author.charAt(0))}</div>
            <div class="comment-body">
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(comment.author)}</span>
                    <span class="comment-time">${comment.time}</span>
                </div>
                <div class="comment-text">${escapeHtml(comment.content)}</div>
            </div>
        </div>
    `).join('');
}

function submitComment() {
    const input = document.getElementById('comment-input');
    if (!input || !currentBookId) return;

    const content = input.value.trim();
    if (!content) {
        showToast('说点什么吧~');
        return;
    }

    if (!comments[currentBookId]) {
        comments[currentBookId] = [];
    }

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    comments[currentBookId].unshift({
        author: '我',
        content: content,
        time: timeStr
    });

    saveCommentsToStorage();
    renderComments();
    input.value = '';
    showToast('评论成功 💬');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function setupColorPicker() {
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            selectedColor = this.dataset.color;
        });
    });
}

function setupAIAssist() {
    const btn = document.getElementById('btn-ai-help');
    if (!btn) return;

    btn.addEventListener('click', function() {
        const content = document.getElementById('book-content').value.trim();
        if (!content) {
            showToast('请先写下你的人生经验内容~');
            return;
        }

        const loading = document.getElementById('ai-loading');
        const resultSection = document.getElementById('ai-result-section');

        if (loading) {
            loading.style.display = 'flex';
        }
        if (resultSection) {
            resultSection.style.display = 'none';
        }

        setTimeout(() => {
            generateAIResult(content);
            if (loading) {
                loading.style.display = 'none';
            }
            if (resultSection) {
                resultSection.style.display = 'block';
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 2000);
    });
}

function generateAIResult(content) {
    let category = document.getElementById('book-category').value;
    if (!category) {
        const keywords = {
            work: ['工作', '职场', '公司', '领导', '同事', '创业', '项目', '客户'],
            relationship: ['朋友', '关系', '感情', '爱情', '家人', '父母', '沟通', '相处'],
            life: ['人生', '生活', '岁月', '时间', '成长', '选择', '意义', '幸福'],
            growth: ['学习', '成长', '进步', '提升', '改变', '习惯', '自律', '努力']
        };

        for (const [cat, words] of Object.entries(keywords)) {
            if (words.some(word => content.includes(word))) {
                category = cat;
                break;
            }
        }
        if (!category) category = 'other';
    }

    const template = aiTemplates[category] || aiTemplates.other;

    const randomTitle = template.titles[Math.floor(Math.random() * template.titles.length)];
    const randomQuote = template.quotes[Math.floor(Math.random() * template.quotes.length)];

    const chapters = template.chapters.map((ch, i) => `${template.chapterPrefix}${['一', '二', '三', '四', '五'][i]}${template.chapterSuffix}${ch}`);

    const tags = [...template.tags];

    aiGeneratedData = {
        title: randomTitle,
        chapters: chapters,
        tags: tags,
        wisdom: template.wisdom,
        coverQuote: randomQuote,
        category: category
    };

    const titleEl = document.getElementById('ai-suggested-title');
    const chaptersEl = document.getElementById('ai-suggested-chapters');
    const tagsEl = document.getElementById('ai-suggested-tags');
    const wisdomCard = document.querySelector('#ai-wisdom-card .ai-wisdom-content');
    const coverQuoteEl = document.getElementById('ai-cover-quote');

    if (titleEl) titleEl.textContent = randomTitle;
    if (chaptersEl) {
        chaptersEl.innerHTML = chapters.map(ch => `<div class="ai-chapter-item">📖 ${escapeHtml(ch)}</div>`).join('');
    }
    if (tagsEl) {
        tagsEl.innerHTML = tags.map(tag => `<span class="ai-tag">${escapeHtml(tag)}</span>`).join('');
    }
    if (wisdomCard) wisdomCard.textContent = template.wisdom;
    if (coverQuoteEl) coverQuoteEl.textContent = `"${randomQuote}"`;
}

function applyAiTitle() {
    if (!aiGeneratedData) return;
    const titleInput = document.getElementById('book-title');
    if (titleInput) {
        titleInput.value = aiGeneratedData.title;
        showToast('已采用建议书名 ✨');
    }
}

function setupForm() {
    const form = document.getElementById('book-create-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('book-title').value.trim();
        const content = document.getElementById('book-content').value.trim();
        const category = document.getElementById('book-category').value;
        const isPublic = document.getElementById('book-public').checked;

        if (!title && aiGeneratedData) {
            applyAiTitle();
            return;
        }

        if (!title) {
            showToast('请输入书名');
            return;
        }

        const newId = Date.now();

        let bookChapters = [];
        let bookWisdomCards = [];
        let bookTags = [];
        let bookCoverQuote = '';

        if (aiGeneratedData) {
            bookChapters = aiGeneratedData.chapters.map((ch, i) => ({
                title: ch,
                content: content || '这一章的内容正在整理中...\n\n你的人生经验，就是最好的内容。\n\n继续记录，继续丰富这本书吧。'
            }));
            bookWisdomCards = [aiGeneratedData.wisdom];
            bookTags = aiGeneratedData.tags;
            bookCoverQuote = aiGeneratedData.coverQuote;
        } else if (content) {
            bookChapters = [
                { title: '第一章：开篇', content: content }
            ];
            bookWisdomCards = [content.substring(0, 50) + '...'];
            bookTags = category ? [category] : ['随笔'];
            bookCoverQuote = content.substring(0, 20) + '...';
        } else {
            bookChapters = [
                { title: '第一章：新的开始', content: '这是你的第一本书。\n\n在这里记录你的人生经验、思考感悟。\n\n慢慢写，慢慢来，你的书会越来越厚，你的智慧会越来越深。' }
            ];
            bookWisdomCards = ['每一段经历，都是宝贵的财富。'];
            bookTags = category ? [category] : ['随笔'];
            bookCoverQuote = '开始记录，就是最好的开始';
        }

        const newBook = {
            id: newId,
            title: title,
            author: '我',
            cover: selectedColor,
            description: content ? content.substring(0, 100) + (content.length > 100 ? '...' : '') : '一本记录人生智慧的书',
            category: category || 'other',
            isPublic: isPublic,
            tags: bookTags,
            coverQuote: bookCoverQuote,
            chapters: bookChapters,
            wisdomCards: bookWisdomCards,
            likes: 0,
            wisdomCount: bookWisdomCards.length
        };

        sampleBooks.unshift(newBook);
        saveBooksToStorage();
        renderBooks();
        updateStats();

        showToast('书籍创建成功！📚');

        form.reset();
        const resultSection = document.getElementById('ai-result-section');
        if (resultSection) {
            resultSection.style.display = 'none';
        }
        aiGeneratedData = null;

        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(opt => opt.classList.remove('active'));
        colorOptions[0].classList.add('active');
        selectedColor = '#8B4513';

        setTimeout(() => {
            showPage('library');
        }, 1000);
    });
}

function updateStats() {
    const bookCount = sampleBooks.length;
    const totalChapters = sampleBooks.reduce((sum, b) => sum + (b.chapters ? b.chapters.length : 0), 0);
    const totalWisdoms = sampleBooks.reduce((sum, b) => sum + (b.wisdomCount || 0), 0);

    const statBooks = document.getElementById('stat-books');
    const statChapters = document.getElementById('stat-chapters');
    const statWisdoms = document.getElementById('stat-wisdoms');

    if (statBooks) statBooks.textContent = bookCount;
    if (statChapters) statChapters.textContent = totalChapters;
    if (statWisdoms) statWisdoms.textContent = totalWisdoms;
}

function setupNavLinks() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const pageKey = this.dataset.page;
            if (pageKey) {
                showPage(pageKey);
            }
        });
    });
}

function searchWisdom() {
    const input = document.getElementById('search-input');
    if (!input) return;

    const query = input.value.trim();
    if (!query) {
        showToast('输入你困惑的问题吧~');
        return;
    }

    let results = [];

    for (const [key, books] of Object.entries(searchResultsMap)) {
        if (key.includes(query) || query.includes(key) || 
            key.split('').some(char => query.includes(char))) {
            results = books;
            break;
        }
    }

    if (results.length === 0) {
        results = [
            {
                title: '关于' + query + '的思考',
                author: '智慧长者',
                cover: '#2F4F4F',
                desc: '人生的很多问题，没有标准答案。但总有人走过类似的路，可以给你一些启发。',
                tags: ['思考', '人生', '解惑']
            },
            {
                title: '慢慢来，一切都有答案',
                author: '过来人',
                cover: '#8B5A2B',
                desc: '不要着急，答案会在合适的时候出现。你要做的，就是继续走下去。',
                tags: ['成长', '心态', '智慧']
            },
            {
                title: '人间值得',
                author: '生活家',
                cover: '#800020',
                desc: '即使有困惑，即使有迷茫，人间依然值得。因为有爱，有光，有希望。',
                tags: ['人生', '热爱', '希望']
            }
        ];
    }

    const resultTitle = document.getElementById('search-result-title');
    const booksGrid = document.getElementById('search-books-grid');
    const searchResults = document.getElementById('search-results');

    if (resultTitle) {
        resultTitle.textContent = `关于"${query}"的答案`;
    }
    if (booksGrid) {
        booksGrid.innerHTML = results.map(book => `
            <div class="search-book-card">
                <div class="search-book-cover" style="background: linear-gradient(135deg, ${book.cover}, ${adjustColor(book.cover, -30)})">
                    <div class="search-book-title">${escapeHtml(book.title)}</div>
                </div>
                <div class="search-book-info">
                    <h4>${escapeHtml(book.title)}</h4>
                    <p class="search-book-author">${escapeHtml(book.author)}</p>
                    <p class="search-book-desc">${escapeHtml(book.desc)}</p>
                    <div class="search-book-tags">
                        ${book.tags.map(tag => `<span class="search-tag">${escapeHtml(tag)}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }
    if (searchResults) {
        searchResults.style.display = 'block';
        searchResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function searchByTag(tag) {
    const input = document.getElementById('search-input');
    if (input) {
        input.value = tag;
    }
    searchWisdom();
}

function adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

function setupBookHoverEffects() {
    document.addEventListener('mouseover', function(e) {
        const bookItem = e.target.closest('.book-item');
        if (bookItem) {
            const allBooks = document.querySelectorAll('.book-item');
            allBooks.forEach(book => {
                if (book !== bookItem) {
                    book.style.opacity = '0.7';
                    book.style.transform = 'scale(0.98)';
                }
            });
        }
    });

    document.addEventListener('mouseout', function(e) {
        const bookItem = e.target.closest('.book-item');
        if (bookItem) {
            const allBooks = document.querySelectorAll('.book-item');
            allBooks.forEach(book => {
                book.style.opacity = '';
                book.style.transform = '';
            });
        }
    });
}

function addRippleEffect() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                background: rgba(255,255,255,0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                left: ${x}px;
                top: ${y}px;
                width: 100px;
                height: 100px;
                margin-left: -50px;
                margin-top: -50px;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function setupNavbarScrollEffect() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            navbar.style.boxShadow = '0 8px 30px rgba(61, 36, 20, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)';
        } else {
            navbar.style.boxShadow = '';
        }
    });
}

function setupFooterInteraction() {
    const footerLogo = document.querySelector('.footer-logo');
    if (footerLogo) {
        footerLogo.style.cursor = 'pointer';
        footerLogo.addEventListener('click', function() {
            showPage('home');
        });
    }
}

function setupSearchInput() {
    const input = document.getElementById('search-input');
    if (!input) return;

    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchWisdom();
        }
    });
}

function setupCommentInput() {
    const input = document.getElementById('comment-input');
    if (!input) return;

    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitComment();
        }
    });
}

function init() {
    loadFromStorage();
    setupNavLinks();
    renderBooks();
    renderWisdomCards();
    renderPublicShelves();
    setupColorPicker();
    setupAIAssist();
    setupForm();
    updateStats();
    setupBookHoverEffects();
    addRippleEffect();
    setupNavbarScrollEffect();
    setupFooterInteraction();
    setupSearchInput();
    setupCommentInput();
}

document.addEventListener('DOMContentLoaded', init);
