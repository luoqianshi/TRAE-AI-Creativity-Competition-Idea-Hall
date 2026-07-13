class ChineseChapter extends Chapter {
  constructor() {
    super('chinese', '语文', 'fa-book-open', '#e74c3c');
    this.initLevels();
  }

  initLevels() {
    this.levels = [
      {
        levelNumber: 1,
        name: '第一单元 现代诗歌',
        description: '高一语文现代诗歌鉴赏',
        difficulty: 1,
        timeLimit: 180,
        unlocked: true,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chinese_001',
            question: '《沁园春·长沙》的作者是（ ）',
            options: [
              { key: 'A', value: '鲁迅', explanation: '鲁迅是中国现代文学的奠基人，代表作品有《呐喊》《彷徨》等，并非该词作者。' },
              { key: 'B', value: '毛泽东', explanation: '《沁园春·长沙》是毛泽东于1925年晚秋创作的词，通过对长沙橘子洲头秋景的描绘和对青年时代斗争生活的回忆，抒发了革命青年对国家命运的感慨和以天下为己任的壮志豪情。' },
              { key: 'C', value: '郭沫若', explanation: '郭沫若为现代著名诗人、剧作家，代表作品有《女神》《屈原》等，与该词无关。' },
              { key: 'D', value: '徐志摩', explanation: '徐志摩是新月派代表诗人，代表作品有《再别康桥》《翡冷翠的一夜》等，并非该词作者。' }
            ],
            correctAnswer: 'B',
            explanation: '《沁园春·长沙》是毛泽东于1925年创作的词，通过对自然景色的描绘和历史的回顾，表达了对国家命运的深切关怀和改造中国的豪情壮志。'
          },
          {
            id: 'q_chinese_002',
            question: '下列词语中，加点字注音正确的一项是（ ）',
            options: [
              { key: 'A', value: '百侣(lǚ)', explanation: '' },
              { key: 'B', value: '方遒(qiú)', explanation: '' },
              { key: 'C', value: '怅寥廓(kuò)', explanation: '' },
              { key: 'D', value: '以上都对', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '三个选项的注音都是正确的。'
          },
          {
            id: 'q_chinese_003',
            question: '《立在地球边上放号》的作者是（ ）',
            options: [
              { key: 'A', value: '闻一多', explanation: '' },
              { key: 'B', value: '郭沫若', explanation: '' },
              { key: 'C', value: '艾青', explanation: '' },
              { key: 'D', value: '冰心', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '《立在地球边上放号》是郭沫若的作品。'
          },
          {
            id: 'q_chinese_004',
            question: '《红烛》的作者是（ ）',
            options: [
              { key: 'A', value: '闻一多', explanation: '' },
              { key: 'B', value: '徐志摩', explanation: '' },
              { key: 'C', value: '戴望舒', explanation: '' },
              { key: 'D', value: '林徽因', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《红烛》是闻一多的诗集。'
          },
          {
            id: 'q_chinese_005',
            question: '下列词语中，没有错别字的一项是（ ）',
            options: [
              { key: 'A', value: '沧茫', explanation: '错误，应为"苍茫"。"苍"指青绿色，"苍茫"形容空阔辽远、无边无际的样子；而"沧"多指水色青苍，如"沧海"。' },
              { key: 'B', value: '斑澜', explanation: '错误，应为"斑斓"。"斓"指颜色灿烂多彩，"斑斓"形容色彩繁多艳丽；而"澜"指波浪。' },
              { key: 'C', value: '寥廓', explanation: '正确。"寥廓"指空旷深远，常用来形容天空、宇宙等空间的广阔。' },
              { key: 'D', value: '枯躁', explanation: '错误，应为"枯燥"。"燥"指缺少水分、干燥，"枯燥"形容单调乏味；而"躁"指性情急、不冷静。' }
            ],
            correctAnswer: 'C',
            explanation: '本题考查汉字字形辨析能力。A应为"苍茫"，B应为"斑斓"，D应为"枯燥"。'
          },
          {
            id: 'q_chinese_006',
            question: '《致云雀》的作者是（ ）',
            options: [
              { key: 'A', value: '雪莱', explanation: '' },
              { key: 'B', value: '拜伦', explanation: '' },
              { key: 'C', value: '济慈', explanation: '' },
              { key: 'D', value: '华兹华斯', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《致云雀》是英国诗人雪莱的作品。'
          },
          {
            id: 'q_chinese_007',
            question: '"怅寥廓，问苍茫大地，谁主沉浮？"出自（ ）',
            options: [
              { key: 'A', value: '《沁园春·雪》', explanation: '' },
              { key: 'B', value: '《沁园春·长沙》', explanation: '' },
              { key: 'C', value: '《水调歌头·游泳》', explanation: '' },
              { key: 'D', value: '《菩萨蛮·黄鹤楼》', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '这句词出自《沁园春·长沙》。'
          },
          {
            id: 'q_chinese_008',
            question: '《百合花》的作者是（ ）',
            options: [
              { key: 'A', value: '茹志鹃', explanation: '' },
              { key: 'B', value: '茅盾', explanation: '' },
              { key: 'C', value: '巴金', explanation: '' },
              { key: 'D', value: '老舍', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《百合花》是茹志鹃的短篇小说。'
          },
          {
            id: 'q_chinese_009',
            question: '下列句子中，标点符号使用正确的一项是（ ）',
            options: [
              { key: 'A', value: '他说："我来了"。', explanation: '' },
              { key: 'B', value: '我喜欢读《红楼梦》这本书。', explanation: '' },
              { key: 'C', value: '今天天气真好！', explanation: '' },
              { key: 'D', value: 'B和C都对', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: 'B和C的标点符号使用都是正确的。'
          },
          {
            id: 'q_chinese_010',
            question: '《哦，香雪》的作者是（ ）',
            options: [
              { key: 'A', value: '铁凝', explanation: '' },
              { key: 'B', value: '毕淑敏', explanation: '' },
              { key: 'C', value: '王安忆', explanation: '' },
              { key: 'D', value: '迟子建', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《哦，香雪》是铁凝的短篇小说。'
          }
        ]
      },
      {
        levelNumber: 2,
        name: '第二单元 古代诗歌',
        description: '唐诗宋词鉴赏',
        difficulty: 1,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chinese_011',
            question: '《登高》的作者是（ ）',
            options: [
              { key: 'A', value: '李白', explanation: '' },
              { key: 'B', value: '杜甫', explanation: '' },
              { key: 'C', value: '白居易', explanation: '' },
              { key: 'D', value: '王维', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '《登高》是杜甫的代表作之一。'
          },
          {
            id: 'q_chinese_012',
            question: '"无边落木萧萧下，不尽长江滚滚来"出自（ ）',
            options: [
              { key: 'A', value: '《望岳》', explanation: '' },
              { key: 'B', value: '《登高》', explanation: '' },
              { key: 'C', value: '《春望》', explanation: '' },
              { key: 'D', value: '《茅屋为秋风所破歌》', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '这两句诗出自杜甫的《登高》。'
          },
          {
            id: 'q_chinese_013',
            question: '《念奴娇·赤壁怀古》的作者是（ ）',
            options: [
              { key: 'A', value: '苏轼', explanation: '' },
              { key: 'B', value: '辛弃疾', explanation: '' },
              { key: 'C', value: '李清照', explanation: '' },
              { key: 'D', value: '柳永', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《念奴娇·赤壁怀古》是苏轼的代表作。'
          },
          {
            id: 'q_chinese_014',
            question: '"大江东去，浪淘尽，千古风流人物"出自（ ）',
            options: [
              { key: 'A', value: '《水调歌头·明月几时有》', explanation: '' },
              { key: 'B', value: '《念奴娇·赤壁怀古》', explanation: '' },
              { key: 'C', value: '《江城子·密州出猎》', explanation: '' },
              { key: 'D', value: '《定风波·莫听穿林打叶声》', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '这句词出自苏轼的《念奴娇·赤壁怀古》。'
          },
          {
            id: 'q_chinese_015',
            question: '《声声慢》的作者是（ ）',
            options: [
              { key: 'A', value: '苏轼', explanation: '' },
              { key: 'B', value: '李清照', explanation: '' },
              { key: 'C', value: '辛弃疾', explanation: '' },
              { key: 'D', value: '陆游', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '《声声慢》是李清照的代表作。'
          },
          {
            id: 'q_chinese_016',
            question: '"寻寻觅觅，冷冷清清，凄凄惨惨戚戚"出自（ ）',
            options: [
              { key: 'A', value: '《如梦令》', explanation: '' },
              { key: 'B', value: '《声声慢》', explanation: '' },
              { key: 'C', value: '《醉花阴》', explanation: '' },
              { key: 'D', value: '《武陵春》', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '这句词出自李清照的《声声慢》。'
          },
          {
            id: 'q_chinese_017',
            question: '《琵琶行》的作者是（ ）',
            options: [
              { key: 'A', value: '李白', explanation: '' },
              { key: 'B', value: '杜甫', explanation: '' },
              { key: 'C', value: '白居易', explanation: '' },
              { key: 'D', value: '韩愈', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '《琵琶行》是白居易的代表作。'
          },
          {
            id: 'q_chinese_018',
            question: '"同是天涯沦落人，相逢何必曾相识"出自（ ）',
            options: [
              { key: 'A', value: '《长恨歌》', explanation: '' },
              { key: 'B', value: '《琵琶行》', explanation: '' },
              { key: 'C', value: '《卖炭翁》', explanation: '' },
              { key: 'D', value: '《赋得古原草送别》', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '这句诗出自白居易的《琵琶行》。'
          },
          {
            id: 'q_chinese_019',
            question: '《永遇乐·京口北固亭怀古》的作者是（ ）',
            options: [
              { key: 'A', value: '苏轼', explanation: '' },
              { key: 'B', value: '辛弃疾', explanation: '' },
              { key: 'C', value: '陆游', explanation: '' },
              { key: 'D', value: '岳飞', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '《永遇乐·京口北固亭怀古》是辛弃疾的代表作。'
          },
          {
            id: 'q_chinese_020',
            question: '"千古江山，英雄无觅孙仲谋处"出自（ ）',
            options: [
              { key: 'A', value: '《破阵子·为陈同甫赋壮词以寄之》', explanation: '' },
              { key: 'B', value: '《永遇乐·京口北固亭怀古》', explanation: '' },
              { key: 'C', value: '《水龙吟·登建康赏心亭》', explanation: '' },
              { key: 'D', value: '《菩萨蛮·书江西造口壁》', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '这句词出自辛弃疾的《永遇乐·京口北固亭怀古》。'
          }
        ]
      },
      {
        levelNumber: 3,
        name: '第三单元 文言文',
        description: '文言文阅读',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chinese_021',
            question: '《劝学》的作者是（ ）',
            options: [
              { key: 'A', value: '孔子', explanation: '' },
              { key: 'B', value: '孟子', explanation: '' },
              { key: 'C', value: '荀子', explanation: '' },
              { key: 'D', value: '庄子', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '《劝学》是荀子的代表作。'
          },
          {
            id: 'q_chinese_022',
            question: '"学不可以已"中"已"的意思是（ ）',
            options: [
              { key: 'A', value: '已经', explanation: '' },
              { key: 'B', value: '停止', explanation: '' },
              { key: 'C', value: '完毕', explanation: '' },
              { key: 'D', value: '太', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"已"在这里是"停止"的意思。'
          },
          {
            id: 'q_chinese_023',
            question: '《师说》的作者是（ ）',
            options: [
              { key: 'A', value: '韩愈', explanation: '' },
              { key: 'B', value: '柳宗元', explanation: '' },
              { key: 'C', value: '欧阳修', explanation: '' },
              { key: 'D', value: '苏轼', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《师说》是韩愈的代表作。'
          },
          {
            id: 'q_chinese_024',
            question: '"师者，所以传道受业解惑也"中"受"的意思是（ ）',
            options: [
              { key: 'A', value: '接受', explanation: '' },
              { key: 'B', value: '传授', explanation: '' },
              { key: 'C', value: '遭受', explanation: '' },
              { key: 'D', value: '忍受', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"受"通"授"，是"传授"的意思。'
          },
          {
            id: 'q_chinese_025',
            question: '《赤壁赋》的作者是（ ）',
            options: [
              { key: 'A', value: '苏轼', explanation: '' },
              { key: 'B', value: '苏辙', explanation: '' },
              { key: 'C', value: '苏洵', explanation: '' },
              { key: 'D', value: '王安石', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《赤壁赋》是苏轼的代表作。'
          },
          {
            id: 'q_chinese_026',
            question: '"寄蜉蝣于天地，渺沧海之一粟"出自（ ）',
            options: [
              { key: 'A', value: '《前赤壁赋》', explanation: '' },
              { key: 'B', value: '《后赤壁赋》', explanation: '' },
              { key: 'C', value: '《念奴娇·赤壁怀古》', explanation: '' },
              { key: 'D', value: '《江城子·密州出猎》', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '这句出自苏轼的《前赤壁赋》。'
          },
          {
            id: 'q_chinese_027',
            question: '"假舆马者，非利足也，而致千里"中"假"的意思是（ ）',
            options: [
              { key: 'A', value: '虚假', explanation: '' },
              { key: 'B', value: '借助', explanation: '' },
              { key: 'C', value: '假装', explanation: '' },
              { key: 'D', value: '给予', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"假"在这里是"借助"的意思。'
          },
          {
            id: 'q_chinese_028',
            question: '"故不积跬步，无以至千里"中"跬步"指的是（ ）',
            options: [
              { key: 'A', value: '大步', explanation: '' },
              { key: 'B', value: '半步', explanation: '' },
              { key: 'C', value: '跑步', explanation: '' },
              { key: 'D', value: '跳跃', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"跬步"指半步，古人称跨一脚为"跬"，跨两脚为"步"。'
          },
          {
            id: 'q_chinese_029',
            question: '"道之所存，师之所存也"出自（ ）',
            options: [
              { key: 'A', value: '《劝学》', explanation: '' },
              { key: 'B', value: '《师说》', explanation: '' },
              { key: 'C', value: '《论语》', explanation: '' },
              { key: 'D', value: '《孟子》', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '这句出自韩愈的《师说》。'
          },
          {
            id: 'q_chinese_030',
            question: '"是故弟子不必不如师，师不必贤于弟子"出自（ ）',
            options: [
              { key: 'A', value: '《劝学》', explanation: '' },
              { key: 'B', value: '《师说》', explanation: '' },
              { key: 'C', value: '《论语》', explanation: '' },
              { key: 'D', value: '《墨子》', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '这句出自韩愈的《师说》。'
          }
        ]
      },
      {
        levelNumber: 4,
        name: '第四单元 新闻',
        description: '新闻阅读与写作',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chinese_031',
            question: '新闻的六要素是（ ）',
            options: [
              { key: 'A', value: '时间、地点、人物、事件、原因、结果', explanation: '' },
              { key: 'B', value: '标题、导语、主体、背景、结语、署名', explanation: '' },
              { key: 'C', value: '记叙、描写、议论、说明、抒情、夸张', explanation: '' },
              { key: 'D', value: '开头、发展、高潮、结尾', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '新闻的六要素是：时间、地点、人物、事件、原因、结果。'
          },
          {
            id: 'q_chinese_032',
            question: '新闻的结构通常包括（ ）',
            options: [
              { key: 'A', value: '标题、导语、主体、背景、结语', explanation: '' },
              { key: 'B', value: '开头、发展、高潮、结尾', explanation: '' },
              { key: 'C', value: '起因、经过、结果', explanation: '' },
              { key: 'D', value: '引言、正文、结论', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '新闻的结构通常包括标题、导语、主体、背景、结语。'
          },
          {
            id: 'q_chinese_033',
            question: '《别了，不列颠尼亚》报道的是（ ）',
            options: [
              { key: 'A', value: '香港回归', explanation: '' },
              { key: 'B', value: '澳门回归', explanation: '' },
              { key: 'C', value: '台湾光复', explanation: '' },
              { key: 'D', value: '上海解放', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《别了，不列颠尼亚》报道的是1997年香港回归祖国的事件。'
          },
          {
            id: 'q_chinese_034',
            question: '新闻的特点不包括（ ）',
            options: [
              { key: 'A', value: '真实性', explanation: '' },
              { key: 'B', value: '时效性', explanation: '' },
              { key: 'C', value: '虚构性', explanation: '' },
              { key: 'D', value: '客观性', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '新闻必须真实，不允许虚构。'
          },
          {
            id: 'q_chinese_035',
            question: '下列哪项不是新闻标题的特点（ ）',
            options: [
              { key: 'A', value: '简明扼要', explanation: '' },
              { key: 'B', value: '吸引读者', explanation: '' },
              { key: 'C', value: '详细冗长', explanation: '' },
              { key: 'D', value: '概括内容', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '新闻标题应该简明扼要，不应该详细冗长。'
          },
          {
            id: 'q_chinese_036',
            question: '新闻导语的作用是（ ）',
            options: [
              { key: 'A', value: '详细叙述事件经过', explanation: '' },
              { key: 'B', value: '概括新闻的主要内容', explanation: '' },
              { key: 'C', value: '提供背景信息', explanation: '' },
              { key: 'D', value: '发表评论', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '导语的作用是概括新闻的主要内容。'
          },
          {
            id: 'q_chinese_037',
            question: '新闻的主体部分主要是（ ）',
            options: [
              { key: 'A', value: '概括主要内容', explanation: '' },
              { key: 'B', value: '详细叙述事件经过', explanation: '' },
              { key: 'C', value: '提供背景信息', explanation: '' },
              { key: 'D', value: '总结全文', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '新闻的主体部分详细叙述事件经过。'
          },
          {
            id: 'q_chinese_038',
            question: '《奥斯维辛没有什么新闻》的作者是（ ）',
            options: [
              { key: 'A', value: '罗森塔尔', explanation: '' },
              { key: 'B', value: '海明威', explanation: '' },
              { key: 'C', value: '卡夫卡', explanation: '' },
              { key: 'D', value: '萨特', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《奥斯维辛没有什么新闻》是罗森塔尔的作品。'
          },
          {
            id: 'q_chinese_039',
            question: '新闻特写的特点是（ ）',
            options: [
              { key: 'A', value: '全面报道事件', explanation: '' },
              { key: 'B', value: '突出描写某一精彩瞬间', explanation: '' },
              { key: 'C', value: '发表评论', explanation: '' },
              { key: 'D', value: '虚构情节', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '新闻特写的特点是突出描写某一精彩瞬间。'
          },
          {
            id: 'q_chinese_040',
            question: '下列哪项是新闻摄影的特点（ ）',
            options: [
              { key: 'A', value: '抽象性', explanation: '' },
              { key: 'B', value: '直观性', explanation: '' },
              { key: 'C', value: '虚构性', explanation: '' },
              { key: 'D', value: '主观性', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '新闻摄影具有直观性的特点。'
          }
        ]
      },
      {
        levelNumber: 5,
        name: '第五单元 文学评论',
        description: '文学评论写作',
        difficulty: 3,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chinese_041',
            question: '文学评论的主要目的是（ ）',
            options: [
              { key: 'A', value: '复述作品内容', explanation: '' },
              { key: 'B', value: '分析作品的艺术价值', explanation: '' },
              { key: 'C', value: '记录作者生平', explanation: '' },
              { key: 'D', value: '编写创作背景', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '文学评论的主要目的是分析作品的艺术价值。'
          },
          {
            id: 'q_chinese_042',
            question: '文学评论的基本方法不包括（ ）',
            options: [
              { key: 'A', value: '文本分析', explanation: '' },
              { key: 'B', value: '历史分析', explanation: '' },
              { key: 'C', value: '道德评判', explanation: '' },
              { key: 'D', value: '作者崇拜', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '文学评论应该客观分析，不应该盲目崇拜作者。'
          },
          {
            id: 'q_chinese_043',
            question: '《红楼梦》的作者是（ ）',
            options: [
              { key: 'A', value: '曹雪芹', explanation: '' },
              { key: 'B', value: '高鹗', explanation: '' },
              { key: 'C', value: '罗贯中', explanation: '' },
              { key: 'D', value: '施耐庵', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《红楼梦》的作者是曹雪芹。'
          },
          {
            id: 'q_chinese_044',
            question: '文学评论的开头通常（ ）',
            options: [
              { key: 'A', value: '详细分析', explanation: '' },
              { key: 'B', value: '引出评论对象', explanation: '' },
              { key: 'C', value: '总结全文', explanation: '' },
              { key: 'D', value: '引用名言', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '文学评论的开头通常引出评论对象。'
          },
          {
            id: 'q_chinese_045',
            question: '下列哪项不是文学评论的要素（ ）',
            options: [
              { key: 'A', value: '论点', explanation: '' },
              { key: 'B', value: '论据', explanation: '' },
              { key: 'C', value: '论证', explanation: '' },
              { key: 'D', value: '虚构', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '文学评论应该基于事实，不应该虚构。'
          },
          {
            id: 'q_chinese_046',
            question: '文学评论的语言应该（ ）',
            options: [
              { key: 'A', value: '晦涩难懂', explanation: '' },
              { key: 'B', value: '清晰准确', explanation: '' },
              { key: 'C', value: '华丽夸张', explanation: '' },
              { key: 'D', value: '模棱两可', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '文学评论的语言应该清晰准确。'
          },
          {
            id: 'q_chinese_047',
            question: '《三国演义》的作者是（ ）',
            options: [
              { key: 'A', value: '施耐庵', explanation: '' },
              { key: 'B', value: '罗贯中', explanation: '' },
              { key: 'C', value: '曹雪芹', explanation: '' },
              { key: 'D', value: '吴承恩', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '《三国演义》的作者是罗贯中。'
          },
          {
            id: 'q_chinese_048',
            question: '文学评论的结尾通常（ ）',
            options: [
              { key: 'A', value: '提出问题', explanation: '' },
              { key: 'B', value: '总结观点', explanation: '' },
              { key: 'C', value: '引出新话题', explanation: '' },
              { key: 'D', value: '复述内容', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '文学评论的结尾通常总结观点。'
          },
          {
            id: 'q_chinese_049',
            question: '《水浒传》的作者是（ ）',
            options: [
              { key: 'A', value: '罗贯中', explanation: '' },
              { key: 'B', value: '施耐庵', explanation: '' },
              { key: 'C', value: '吴承恩', explanation: '' },
              { key: 'D', value: '曹雪芹', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '《水浒传》的作者是施耐庵。'
          },
          {
            id: 'q_chinese_050',
            question: '《西游记》的作者是（ ）',
            options: [
              { key: 'A', value: '罗贯中', explanation: '' },
              { key: 'B', value: '施耐庵', explanation: '' },
              { key: 'C', value: '吴承恩', explanation: '' },
              { key: 'D', value: '曹雪芹', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '《西游记》的作者是吴承恩。'
          }
        ]
      },
      {
        levelNumber: 6,
        name: '第六单元 写作',
        description: '议论文写作',
        difficulty: 3,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chinese_051',
            question: '议论文的三要素是（ ）',
            options: [
              { key: 'A', value: '论点、论据、论证', explanation: '' },
              { key: 'B', value: '时间、地点、人物', explanation: '' },
              { key: 'C', value: '开头、发展、结尾', explanation: '' },
              { key: 'D', value: '记叙、描写、抒情', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '议论文的三要素是论点、论据、论证。'
          },
          {
            id: 'q_chinese_052',
            question: '论点的特点不包括（ ）',
            options: [
              { key: 'A', value: '明确', explanation: '' },
              { key: 'B', value: '深刻', explanation: '' },
              { key: 'C', value: '模糊', explanation: '' },
              { key: 'D', value: '新颖', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '论点应该明确，不应该模糊。'
          },
          {
            id: 'q_chinese_053',
            question: '论据的类型包括（ ）',
            options: [
              { key: 'A', value: '事实论据和道理论据', explanation: '' },
              { key: 'B', value: '记叙论据和描写论据', explanation: '' },
              { key: 'C', value: '开头论据和结尾论据', explanation: '' },
              { key: 'D', value: '正面论据和反面论据', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '论据的类型包括事实论据和道理论据。'
          },
          {
            id: 'q_chinese_054',
            question: '论证方法不包括（ ）',
            options: [
              { key: 'A', value: '举例论证', explanation: '' },
              { key: 'B', value: '道理论证', explanation: '' },
              { key: 'C', value: '对比论证', explanation: '' },
              { key: 'D', value: '夸张论证', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '夸张不是论证方法，是修辞手法。'
          },
          {
            id: 'q_chinese_055',
            question: '议论文的结构通常包括（ ）',
            options: [
              { key: 'A', value: '提出问题、分析问题、解决问题', explanation: '' },
              { key: 'B', value: '开头、发展、高潮、结尾', explanation: '' },
              { key: 'C', value: '起因、经过、结果', explanation: '' },
              { key: 'D', value: '引言、正文、结论', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '议论文的结构通常包括提出问题、分析问题、解决问题。'
          },
          {
            id: 'q_chinese_056',
            question: '下列哪项是举例论证的特点（ ）',
            options: [
              { key: 'A', value: '抽象概括', explanation: '' },
              { key: 'B', value: '具体真实', explanation: '' },
              { key: 'C', value: '理论分析', explanation: '' },
              { key: 'D', value: '对比鲜明', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '举例论证的特点是具体真实。'
          },
          {
            id: 'q_chinese_057',
            question: '道理论证的特点是（ ）',
            options: [
              { key: 'A', value: '引用名人名言', explanation: '' },
              { key: 'B', value: '列举具体事例', explanation: '' },
              { key: 'C', value: '进行对比分析', explanation: '' },
              { key: 'D', value: '使用比喻修辞', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '道理论证通常引用名人名言或理论观点。'
          },
          {
            id: 'q_chinese_058',
            question: '对比论证的作用是（ ）',
            options: [
              { key: 'A', value: '使观点更加鲜明', explanation: '' },
              { key: 'B', value: '使内容更加丰富', explanation: '' },
              { key: 'C', value: '使语言更加生动', explanation: '' },
              { key: 'D', value: '使结构更加完整', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '对比论证的作用是使观点更加鲜明。'
          },
          {
            id: 'q_chinese_059',
            question: '议论文的语言应该（ ）',
            options: [
              { key: 'A', value: '华丽夸张', explanation: '' },
              { key: 'B', value: '准确严密', explanation: '' },
              { key: 'C', value: '晦涩难懂', explanation: '' },
              { key: 'D', value: '模棱两可', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '议论文的语言应该准确严密。'
          },
          {
            id: 'q_chinese_060',
            question: '下列哪项不是议论文的特点（ ）',
            options: [
              { key: 'A', value: '逻辑性', explanation: '' },
              { key: 'B', value: '说服力', explanation: '' },
              { key: 'C', value: '虚构性', explanation: '' },
              { key: 'D', value: '条理性', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '议论文应该基于事实，不应该虚构。'
          }
        ]
      },
      {
        levelNumber: 7,
        name: '第七单元 整本书阅读',
        description: '《红楼梦》阅读',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chinese_061',
            question: '《红楼梦》的别名是（ ）',
            options: [
              { key: 'A', value: '《石头记》', explanation: '' },
              { key: 'B', value: '《金陵十二钗》', explanation: '' },
              { key: 'C', value: '《情僧录》', explanation: '' },
              { key: 'D', value: '以上都对', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '《红楼梦》的别名包括《石头记》《金陵十二钗》《情僧录》等。'
          },
          {
            id: 'q_chinese_062',
            question: '《红楼梦》的主人公是（ ）',
            options: [
              { key: 'A', value: '贾宝玉和林黛玉', explanation: '' },
              { key: 'B', value: '薛宝钗和王熙凤', explanation: '' },
              { key: 'C', value: '贾政和贾母', explanation: '' },
              { key: 'D', value: '刘姥姥和焦大', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《红楼梦》的主人公是贾宝玉和林黛玉。'
          },
          {
            id: 'q_chinese_063',
            question: '"满纸荒唐言，一把辛酸泪"出自（ ）',
            options: [
              { key: 'A', value: '《红楼梦》第一回', explanation: '' },
              { key: 'B', value: '《红楼梦》第五回', explanation: '' },
              { key: 'C', value: '《红楼梦》最后一回', explanation: '' },
              { key: 'D', value: '《红楼梦》第三回', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '这句诗出自《红楼梦》第一回。'
          },
          {
            id: 'q_chinese_064',
            question: '金陵十二钗不包括（ ）',
            options: [
              { key: 'A', value: '林黛玉', explanation: '' },
              { key: 'B', value: '薛宝钗', explanation: '' },
              { key: 'C', value: '史湘云', explanation: '' },
              { key: 'D', value: '袭人', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '袭人是贾宝玉的丫鬟，不属于金陵十二钗。'
          },
          {
            id: 'q_chinese_065',
            question: '"木石前盟"指的是（ ）',
            options: [
              { key: 'A', value: '贾宝玉和林黛玉', explanation: '' },
              { key: 'B', value: '贾宝玉和薛宝钗', explanation: '' },
              { key: 'C', value: '林黛玉和薛宝钗', explanation: '' },
              { key: 'D', value: '王熙凤和贾琏', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '"木石前盟"指贾宝玉和林黛玉的前世姻缘。'
          },
          {
            id: 'q_chinese_066',
            question: '"金玉良缘"指的是（ ）',
            options: [
              { key: 'A', value: '贾宝玉和林黛玉', explanation: '' },
              { key: 'B', value: '贾宝玉和薛宝钗', explanation: '' },
              { key: 'C', value: '林黛玉和薛宝钗', explanation: '' },
              { key: 'D', value: '史湘云和贾宝玉', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '"金玉良缘"指贾宝玉和薛宝钗的姻缘。'
          },
          {
            id: 'q_chinese_067',
            question: '《红楼梦》中"大观园"是（ ）',
            options: [
              { key: 'A', value: '贾府的后花园', explanation: '' },
              { key: 'B', value: '皇帝的行宫', explanation: '' },
              { key: 'C', value: '林黛玉的住处', explanation: '' },
              { key: 'D', value: '薛宝钗的住处', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '大观园是贾府为迎接元妃省亲修建的后花园。'
          },
          {
            id: 'q_chinese_068',
            question: '林黛玉的住处是（ ）',
            options: [
              { key: 'A', value: '怡红院', explanation: '' },
              { key: 'B', value: '潇湘馆', explanation: '' },
              { key: 'C', value: '蘅芜苑', explanation: '' },
              { key: 'D', value: '稻香村', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '林黛玉住在潇湘馆。'
          },
          {
            id: 'q_chinese_069',
            question: '贾宝玉的住处是（ ）',
            options: [
              { key: 'A', value: '怡红院', explanation: '' },
              { key: 'B', value: '潇湘馆', explanation: '' },
              { key: 'C', value: '蘅芜苑', explanation: '' },
              { key: 'D', value: '稻香村', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '贾宝玉住在怡红院。'
          },
          {
            id: 'q_chinese_070',
            question: '薛宝钗的住处是（ ）',
            options: [
              { key: 'A', value: '怡红院', explanation: '' },
              { key: 'B', value: '潇湘馆', explanation: '' },
              { key: 'C', value: '蘅芜苑', explanation: '' },
              { key: 'D', value: '稻香村', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '薛宝钗住在蘅芜苑。'
          }
        ]
      },
      {
        levelNumber: 8,
        name: '第八单元 文言文',
        description: '古代散文',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chinese_071',
            question: '《兰亭集序》的作者是（ ）',
            options: [
              { key: 'A', value: '王羲之', explanation: '' },
              { key: 'B', value: '王献之', explanation: '' },
              { key: 'C', value: '颜真卿', explanation: '' },
              { key: 'D', value: '柳公权', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《兰亭集序》是王羲之的代表作。'
          },
          {
            id: 'q_chinese_072',
            question: '"仰观宇宙之大，俯察品类之盛"出自（ ）',
            options: [
              { key: 'A', value: '《滕王阁序》', explanation: '' },
              { key: 'B', value: '《兰亭集序》', explanation: '' },
              { key: 'C', value: '《岳阳楼记》', explanation: '' },
              { key: 'D', value: '《醉翁亭记》', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '这句出自王羲之的《兰亭集序》。'
          },
          {
            id: 'q_chinese_073',
            question: '《归去来兮辞》的作者是（ ）',
            options: [
              { key: 'A', value: '陶渊明', explanation: '' },
              { key: 'B', value: '谢灵运', explanation: '' },
              { key: 'C', value: '孟浩然', explanation: '' },
              { key: 'D', value: '王维', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《归去来兮辞》是陶渊明的代表作。'
          },
          {
            id: 'q_chinese_074',
            question: '"采菊东篱下，悠然见南山"出自（ ）',
            options: [
              { key: 'A', value: '《饮酒》', explanation: '' },
              { key: 'B', value: '《归园田居》', explanation: '' },
              { key: 'C', value: '《归去来兮辞》', explanation: '' },
              { key: 'D', value: '《桃花源记》', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '这句出自陶渊明的《饮酒》。'
          },
          {
            id: 'q_chinese_075',
            question: '《滕王阁序》的作者是（ ）',
            options: [
              { key: 'A', value: '王勃', explanation: '' },
              { key: 'B', value: '杨炯', explanation: '' },
              { key: 'C', value: '卢照邻', explanation: '' },
              { key: 'D', value: '骆宾王', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《滕王阁序》是王勃的代表作。'
          },
          {
            id: 'q_chinese_076',
            question: '"落霞与孤鹜齐飞，秋水共长天一色"出自（ ）',
            options: [
              { key: 'A', value: '《岳阳楼记》', explanation: '' },
              { key: 'B', value: '《滕王阁序》', explanation: '' },
              { key: 'C', value: '《醉翁亭记》', explanation: '' },
              { key: 'D', value: '《陋室铭》', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '这句出自王勃的《滕王阁序》。'
          },
          {
            id: 'q_chinese_077',
            question: '《岳阳楼记》的作者是（ ）',
            options: [
              { key: 'A', value: '范仲淹', explanation: '' },
              { key: 'B', value: '欧阳修', explanation: '' },
              { key: 'C', value: '王安石', explanation: '' },
              { key: 'D', value: '苏轼', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《岳阳楼记》是范仲淹的代表作。'
          },
          {
            id: 'q_chinese_078',
            question: '"先天下之忧而忧，后天下之乐而乐"出自（ ）',
            options: [
              { key: 'A', value: '《岳阳楼记》', explanation: '' },
              { key: 'B', value: '《醉翁亭记》', explanation: '' },
              { key: 'C', value: '《滕王阁序》', explanation: '' },
              { key: 'D', value: '《出师表》', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '这句出自范仲淹的《岳阳楼记》。'
          },
          {
            id: 'q_chinese_079',
            question: '《醉翁亭记》的作者是（ ）',
            options: [
              { key: 'A', value: '欧阳修', explanation: '' },
              { key: 'B', value: '范仲淹', explanation: '' },
              { key: 'C', value: '王安石', explanation: '' },
              { key: 'D', value: '苏轼', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《醉翁亭记》是欧阳修的代表作。'
          },
          {
            id: 'q_chinese_080',
            question: '"醉翁之意不在酒，在乎山水之间也"出自（ ）',
            options: [
              { key: 'A', value: '《岳阳楼记》', explanation: '' },
              { key: 'B', value: '《醉翁亭记》', explanation: '' },
              { key: 'C', value: '《滕王阁序》', explanation: '' },
              { key: 'D', value: '《陋室铭》', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '这句出自欧阳修的《醉翁亭记》。'
          }
        ]
      },
      {
        levelNumber: 9,
        name: '第九单元 古代诗歌',
        description: '古诗鉴赏',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chinese_081',
            question: '《诗经》是我国最早的（ ）',
            options: [
              { key: 'A', value: '诗歌总集', explanation: '' },
              { key: 'B', value: '散文总集', explanation: '' },
              { key: 'C', value: '小说集', explanation: '' },
              { key: 'D', value: '戏剧集', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《诗经》是我国最早的诗歌总集。'
          },
          {
            id: 'q_chinese_082',
            question: '《诗经》分为（ ）',
            options: [
              { key: 'A', value: '风、雅、颂', explanation: '' },
              { key: 'B', value: '赋、比、兴', explanation: '' },
              { key: 'C', value: '诗、词、曲', explanation: '' },
              { key: 'D', value: '叙事诗、抒情诗', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《诗经》分为风、雅、颂三部分。'
          },
          {
            id: 'q_chinese_083',
            question: '"关关雎鸠，在河之洲"出自（ ）',
            options: [
              { key: 'A', value: '《诗经·关雎》', explanation: '' },
              { key: 'B', value: '《诗经·蒹葭》', explanation: '' },
              { key: 'C', value: '《楚辞·离骚》', explanation: '' },
              { key: 'D', value: '《古诗十九首》', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '这句出自《诗经·关雎》。'
          },
          {
            id: 'q_chinese_084',
            question: '《楚辞》的代表作家是（ ）',
            options: [
              { key: 'A', value: '屈原', explanation: '' },
              { key: 'B', value: '宋玉', explanation: '' },
              { key: 'C', value: '贾谊', explanation: '' },
              { key: 'D', value: '司马相如', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《楚辞》的代表作家是屈原。'
          },
          {
            id: 'q_chinese_085',
            question: '"路漫漫其修远兮，吾将上下而求索"出自（ ）',
            options: [
              { key: 'A', value: '《离骚》', explanation: '' },
              { key: 'B', value: '《九歌》', explanation: '' },
              { key: 'C', value: '《九章》', explanation: '' },
              { key: 'D', value: '《天问》', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '这句出自屈原的《离骚》。'
          },
          {
            id: 'q_chinese_086',
            question: '汉乐府民歌的特点是（ ）',
            options: [
              { key: 'A', value: '叙事性强', explanation: '' },
              { key: 'B', value: '抒情性强', explanation: '' },
              { key: 'C', value: '议论性强', explanation: '' },
              { key: 'D', value: '描写性强', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '汉乐府民歌的特点是叙事性强。'
          },
          {
            id: 'q_chinese_087',
            question: '"孔雀东南飞，五里一徘徊"出自（ ）',
            options: [
              { key: 'A', value: '汉乐府', explanation: '' },
              { key: 'B', value: '《古诗十九首》', explanation: '' },
              { key: 'C', value: '《诗经》', explanation: '' },
              { key: 'D', value: '《楚辞》', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '这句出自汉乐府民歌《孔雀东南飞》。'
          },
          {
            id: 'q_chinese_088',
            question: '《古诗十九首》的特点是（ ）',
            options: [
              { key: 'A', value: '五言诗', explanation: '' },
              { key: 'B', value: '七言诗', explanation: '' },
              { key: 'C', value: '四言诗', explanation: '' },
              { key: 'D', value: '杂言诗', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '《古诗十九首》是五言诗。'
          },
          {
            id: 'q_chinese_089',
            question: '"行行重行行，与君生别离"出自（ ）',
            options: [
              { key: 'A', value: '《古诗十九首》', explanation: '' },
              { key: 'B', value: '汉乐府', explanation: '' },
              { key: 'C', value: '《诗经》', explanation: '' },
              { key: 'D', value: '《楚辞》', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '这句出自《古诗十九首》。'
          },
          {
            id: 'q_chinese_090',
            question: '建安文学的代表作家不包括（ ）',
            options: [
              { key: 'A', value: '曹操', explanation: '' },
              { key: 'B', value: '曹丕', explanation: '' },
              { key: 'C', value: '曹植', explanation: '' },
              { key: 'D', value: '陶渊明', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '陶渊明是东晋时期的诗人，不属于建安文学。'
          }
        ]
      },
      {
        levelNumber: 10,
        name: '第十单元 文学常识',
        description: '文学常识综合',
        difficulty: 5,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chinese_091',
            question: '我国第一部编年体史书是（ ）',
            options: [
              { key: 'A', value: '《史记》', explanation: '' },
              { key: 'B', value: '《春秋》', explanation: '' },
              { key: 'C', value: '《左传》', explanation: '' },
              { key: 'D', value: '《战国策》', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '《春秋》是我国第一部编年体史书。'
          },
          {
            id: 'q_chinese_092',
            question: '我国第一部纪传体通史是（ ）',
            options: [
              { key: 'A', value: '《汉书》', explanation: '' },
              { key: 'B', value: '《史记》', explanation: '' },
              { key: 'C', value: '《后汉书》', explanation: '' },
              { key: 'D', value: '《三国志》', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '《史记》是我国第一部纪传体通史。'
          },
          {
            id: 'q_chinese_093',
            question: '"四书"不包括（ ）',
            options: [
              { key: 'A', value: '《大学》', explanation: '' },
              { key: 'B', value: '《中庸》', explanation: '' },
              { key: 'C', value: '《论语》', explanation: '' },
              { key: 'D', value: '《诗经》', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '四书是《大学》《中庸》《论语》《孟子》，不包括《诗经》。'
          },
          {
            id: 'q_chinese_094',
            question: '"五经"不包括（ ）',
            options: [
              { key: 'A', value: '《诗经》', explanation: '' },
              { key: 'B', value: '《尚书》', explanation: '' },
              { key: 'C', value: '《礼记》', explanation: '' },
              { key: 'D', value: '《论语》', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '五经是《诗经》《尚书》《礼记》《周易》《春秋》，不包括《论语》。'
          },
          {
            id: 'q_chinese_095',
            question: '唐代诗人中被称为"诗仙"的是（ ）',
            options: [
              { key: 'A', value: '杜甫', explanation: '' },
              { key: 'B', value: '李白', explanation: '' },
              { key: 'C', value: '白居易', explanation: '' },
              { key: 'D', value: '王维', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '李白被称为"诗仙"。'
          },
          {
            id: 'q_chinese_096',
            question: '唐代诗人中被称为"诗圣"的是（ ）',
            options: [
              { key: 'A', value: '李白', explanation: '' },
              { key: 'B', value: '杜甫', explanation: '' },
              { key: 'C', value: '白居易', explanation: '' },
              { key: 'D', value: '王维', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '杜甫被称为"诗圣"。'
          },
          {
            id: 'q_chinese_097',
            question: '宋代文学的代表形式是（ ）',
            options: [
              { key: 'A', value: '诗', explanation: '' },
              { key: 'B', value: '词', explanation: '' },
              { key: 'C', value: '曲', explanation: '' },
              { key: 'D', value: '小说', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '宋代文学的代表形式是词。'
          },
          {
            id: 'q_chinese_098',
            question: '元曲的代表形式不包括（ ）',
            options: [
              { key: 'A', value: '杂剧', explanation: '' },
              { key: 'B', value: '散曲', explanation: '' },
              { key: 'C', value: '小令', explanation: '' },
              { key: 'D', value: '传奇', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '传奇是明清时期的戏曲形式，不属于元曲。'
          },
          {
            id: 'q_chinese_099',
            question: '明清小说的四大名著不包括（ ）',
            options: [
              { key: 'A', value: '《红楼梦》', explanation: '' },
              { key: 'B', value: '《三国演义》', explanation: '' },
              { key: 'C', value: '《水浒传》', explanation: '' },
              { key: 'D', value: '《金瓶梅》', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '四大名著是《红楼梦》《三国演义》《水浒传》《西游记》，不包括《金瓶梅》。'
          },
          {
            id: 'q_chinese_100',
            question: '鲁迅的第一篇白话小说是（ ）',
            options: [
              { key: 'A', value: '《呐喊》', explanation: '' },
              { key: 'B', value: '《彷徨》', explanation: '' },
              { key: 'C', value: '《狂人日记》', explanation: '' },
              { key: 'D', value: '《阿Q正传》', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '《狂人日记》是鲁迅的第一篇白话小说。'
          }
        ]
      }
    ];
  }

  getLevelQuestions(levelNumber) {
    const level = this.getLevel(levelNumber);
    return level ? level.questions : [];
  }
}
