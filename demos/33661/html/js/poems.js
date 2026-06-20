/* ============================================================
   诗词库 + 匹配引擎
   公有领域古典诗词，按节气/场景/心情/工种打标签
   ============================================================ */

const PoemDB = {
  poems: [
    // —— 通用·日记 ——
    { id: 'p001', poem: '晨兴理荒秽，带月荷锄归', title: '归园田居', author: '陶渊明', dynasty: '晋', annotation: '清晨起来清除杂草，披着月光扛锄归家。写尽农人日出而作、日落而息的辛劳。', tags: ['diary', '通用', '辛劳'] },
    { id: 'p002', poem: '锄禾日当午，汗滴禾下土', title: '悯农', author: '李绅', dynasty: '唐', annotation: '正午锄禾，汗水滴入泥土。道尽劳动之艰辛。', tags: ['diary', '通用', '辛劳'] },
    { id: 'p003', poem: '足蒸暑土气，背灼炎天光', title: '观刈麦', author: '白居易', dynasty: '唐', annotation: '双脚蒸着暑热的地气，脊背灼烤着炎热的阳光。', tags: ['diary', '夏', '辛劳'] },
    { id: 'p004', poem: '采得百花成蜜后，为谁辛苦为谁甜', title: '蜂', author: '罗隐', dynasty: '唐', annotation: '采尽百花酿成蜜，到底为谁辛苦为谁甜？写劳动者的奉献与追问。', tags: ['diary', '通用', '感慨'] },
    { id: 'p005', poem: '炉火照天地，红星乱紫烟', title: '秋浦歌', author: '李白', dynasty: '唐', annotation: '炉火映照天地，火星在紫烟中飞舞。写工匠劳作之壮美。', tags: ['diary', '制造', '壮美'] },
    { id: 'p006', poem: '孤舟蓑笠翁，独钓寒江雪', title: '江雪', author: '柳宗元', dynasty: '唐', annotation: '孤舟上一位披蓑戴笠的老翁，独自在寒江雪中垂钓。写孤独坚守。', tags: ['diary', '冬', '孤独'] },

    // —— 丰收·发薪 ——
    { id: 'p010', poem: '稻花香里说丰年，听取蛙声一片', title: '西江月', author: '辛弃疾', dynasty: '宋', annotation: '稻花飘香中谈论着丰收年景，耳边是一片蛙声。写丰收喜悦。', tags: ['salary', '丰收', '喜悦'] },
    { id: 'p011', poem: '春种一粒粟，秋收万颗子', title: '悯农', author: '李绅', dynasty: '唐', annotation: '春天播下一粒种子，秋天收获万颗粮食。写劳动回报。', tags: ['salary', '丰收', '欣慰'] },
    { id: 'p012', poem: '囊空恐羞涩，留得一钱看', title: '空囊', author: '杜甫', dynasty: '唐', annotation: '口袋空空怕人笑话，留下一文钱看着。写囊中羞涩的自嘲。', tags: ['salary', '自嘲', '平常'] },
    { id: 'p013', poem: '卖炭得钱何所营？身上衣裳口中食', title: '卖炭翁', author: '白居易', dynasty: '唐', annotation: '卖炭得来的钱用来做什么？不过是身上衣裳口中食罢了。写劳动者的朴素愿望。', tags: ['salary', '朴素', '欣慰'] },
    { id: 'p014', poem: '仓廪实而知礼节，衣食足而知荣辱', title: '管子', author: '管仲', dynasty: '春秋', annotation: '粮仓充实才懂礼节，衣食丰足才知荣辱。写物质基础的重要。', tags: ['salary', '丰收', '欣慰'] },
    { id: 'p015', poem: '黄金无足色，白璧有微瑕', title: '送别', author: '戴复古', dynasty: '宋', annotation: '黄金没有十足纯色，白璧也有微小瑕疵。写收入虽不完美，亦值得珍惜。', tags: ['salary', '平常', '感慨'] },

    // —— 突破·匠心 ——
    { id: 'p020', poem: '宝剑锋从磨砺出，梅花香自苦寒来', title: '警世贤文', author: '佚名', dynasty: '明', annotation: '宝剑的锋利来自磨砺，梅花的清香来自苦寒。写刻苦修炼终成大器。', tags: ['breakthrough', '匠心', '喜悦'] },
    { id: 'p021', poem: '千淘万漉虽辛苦，吹尽狂沙始到金', title: '浪淘沙', author: '刘禹锡', dynasty: '唐', annotation: '千遍淘洗虽然辛苦，吹尽狂沙才能见到真金。写坚持终有收获。', tags: ['breakthrough', '匠心', '欣慰'] },
    { id: 'p022', poem: '纸上得来终觉浅，绝知此事要躬行', title: '冬夜读书', author: '陆游', dynasty: '宋', annotation: '书本上学到的终究浅薄，真正掌握必须亲自实践。写技艺需实干。', tags: ['breakthrough', '匠心', '感慨'] },
    { id: 'p023', poem: '如切如磋，如琢如磨', title: '卫风·淇奥', author: '诗经', dynasty: '先秦', annotation: '像切像磋，像琢像磨。写精益求精的工匠精神。', tags: ['breakthrough', '匠心', '精进'] },
    { id: 'p024', poem: '操千曲而后晓声，观千剑而后识器', title: '文心雕龙', author: '刘勰', dynasty: '南朝', annotation: '弹过千曲才懂音律，看过千剑才识兵器。写大量练习才能精通。', tags: ['breakthrough', '匠心', '精进'] },

    // —— 立约·契约 ——
    { id: 'p030', poem: '一诺千金重', title: '史记', author: '司马迁', dynasty: '汉', annotation: '一个承诺比千金还重。写信守契约的精神。', tags: ['milestone', '契约', '庄重'] },
    { id: 'p031', poem: '海岳尚可倾，口诺终不移', title: '酬崔光禄', author: '李白', dynasty: '唐', annotation: '山海尚可倾覆，亲口许诺绝不改变。写一诺千金。', tags: ['milestone', '契约', '庄重'] },
    { id: 'p032', poem: '人生交契无老少，论交何必先同调', title: '徒步归行', author: '杜甫', dynasty: '唐', annotation: '交朋友不论年老年少，何必先求志趣相同。写合作之缘。', tags: ['milestone', '契约', '欣慰'] },

    // —— 归乡·归园田 ——
    { id: 'p040', poem: '少无适俗韵，性本爱丘山', title: '归园田居', author: '陶渊明', dynasty: '晋', annotation: '从小就不适应世俗，本性热爱山丘田园。写归乡之心。', tags: ['dream', '归乡', '欣慰'] },
    { id: 'p041', poem: '羁鸟恋旧林，池鱼思故渊', title: '归园田居', author: '陶渊明', dynasty: '晋', annotation: '笼中鸟眷恋旧林，池中鱼思念故渊。写游子思乡。', tags: ['dream', '归乡', '感慨'] },
    { id: 'p042', poem: '近乡情更怯，不敢问来人', title: '渡汉江', author: '宋之问', dynasty: '唐', annotation: '越靠近家乡心里越胆怯，不敢向路人打听。写归乡的复杂心情。', tags: ['dream', '归乡', '感慨'] },
    { id: 'p043', poem: '举头望明月，低头思故乡', title: '静夜思', author: '李白', dynasty: '唐', annotation: '抬头望明月，低头思念故乡。写月夜思乡。', tags: ['dream', '归乡', '孤独'] },
    { id: 'p044', poem: '独在异乡为异客，每逢佳节倍思亲', title: '九月九日', author: '王维', dynasty: '唐', annotation: '独自在外乡做客，每逢佳节更加思念亲人。写游子孤寂。', tags: ['dream', '归乡', '孤独'] },
    { id: 'p045', poem: '春风又绿江南岸，明月何时照我还', title: '泊船瓜洲', author: '王安石', dynasty: '宋', annotation: '春风又吹绿了江南岸，明月什么时候照着我归还？写盼归之情。', tags: ['dream', '归乡', '感慨'] },

    // —— 节气·春 ——
    { id: 'p050', poem: '好雨知时节，当春乃发生', title: '春夜喜雨', author: '杜甫', dynasty: '唐', annotation: '好雨知道下雨的节气，正是在春天植物萌发的时候。', tags: ['diary', '雨水', '欣慰'] },
    { id: 'p051', poem: '不知细叶谁裁出，二月春风似剪刀', title: '咏柳', author: '贺知章', dynasty: '唐', annotation: '不知细叶是谁裁出的，二月春风像剪刀一样。', tags: ['diary', '立春', '喜悦'] },

    // —— 节气·夏 ——
    { id: 'p060', poem: '时雨及芒种，四野皆插秧', title: '时雨', author: '陆游', dynasty: '宋', annotation: '应时的雨水在芒种时节降下，田野里都在插秧。', tags: ['diary', '芒种', '辛劳'] },
    { id: 'p061', poem: '昼晷已云极，宵漏自此长', title: '夏至避暑北池', author: '韦应物', dynasty: '唐', annotation: '白天的日影已到极点，夜晚的漏刻从此变长。', tags: ['diary', '夏至', '平常'] },

    // —— 节气·秋 ——
    { id: 'p070', poem: '落霞与孤鹜齐飞，秋水共长天一色', title: '滕王阁序', author: '王勃', dynasty: '唐', annotation: '落霞与孤雁齐飞，秋水与长天融为一色。写秋日壮美。', tags: ['diary', '立秋', '喜悦'] },
    { id: 'p071', poem: '停车坐爱枫林晚，霜叶红于二月花', title: '山行', author: '杜牧', dynasty: '唐', annotation: '停下马车是因为喜爱枫林晚景，经霜的枫叶比二月春花还红。', tags: ['diary', '霜降', '喜悦'] },

    // —— 节气·冬 ——
    { id: 'p080', poem: '绿蚁新醅酒，红泥小火炉', title: '问刘十九', author: '白居易', dynasty: '唐', annotation: '新酿的绿蚁酒，红泥小火炉正旺。写冬日温暖。', tags: ['diary', '小雪', '欣慰'] },
    { id: 'p081', poem: '忽如一夜春风来，千树万树梨花开', title: '白雪歌', author: '岑参', dynasty: '唐', annotation: '仿佛一夜春风吹来，千树万树梨花盛开。写雪景壮美。', tags: ['diary', '大雪', '喜悦'] },

    // —— 心情·疲惫 ——
    { id: 'p090', poem: '满面尘灰烟火色，两鬓苍苍十指黑', title: '卖炭翁', author: '白居易', dynasty: '唐', annotation: '满脸尘灰烟火色，两鬓灰白十指乌黑。写劳作之苦。', tags: ['diary', '疲惫'] },
    { id: 'p091', poem: '力尽不知热，但惜夏日长', title: '观刈麦', author: '白居易', dynasty: '唐', annotation: '力气耗尽不觉得热，只珍惜夏日天长可以多干活。写辛劳。', tags: ['diary', '疲惫'] },

    // —— 心情·喜悦 ——
    { id: 'p100', poem: '春风得意马蹄疾，一日看尽长安花', title: '登科后', author: '孟郊', dynasty: '唐', annotation: '春风得意马蹄轻快，一日看尽长安繁花。写得意喜悦。', tags: ['diary', '喜悦', 'breakthrough'] },
    { id: 'p101', poem: '白日放歌须纵酒，青春作伴好还乡', title: '闻官军收河南河北', author: '杜甫', dynasty: '唐', annotation: '白日放声高歌须纵情饮酒，春光作伴正好还乡。写狂喜。', tags: ['dream', '喜悦', '归乡'] }
  ],

  /** 按场景匹配诗句 */
  match({ scene = 'diary', term = null, mood = null, craft = null } = {}) {
    let candidates = this.poems.filter(p => p.tags.includes(scene));
    if (candidates.length === 0) candidates = this.poems.filter(p => p.tags.includes('diary'));

    // 节气加权
    if (term) {
      const byTerm = candidates.filter(p => p.tags.includes(term));
      if (byTerm.length > 0) candidates = byTerm;
    }

    // 心情加权
    const moodMap = { 1: '疲惫', 2: '平常', 3: '平常', 4: '欣慰', 5: '喜悦' };
    const moodTag = moodMap[mood];
    if (moodTag) {
      const byMood = candidates.filter(p => p.tags.includes(moodTag));
      if (byMood.length > 0) candidates = byMood;
    }

    // 随机选一首
    return candidates[Math.floor(Math.random() * candidates.length)];
  },

  /** 按 ID 获取 */
  getById(id) {
    return this.poems.find(p => p.id === id);
  }
};
