const heroes = [
  {
    id: 'liubei',
    name: '刘备',
    role: '战士',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/131/131.jpg',
    description: '刘备是一名战士型英雄，擅长近战输出和突进，大招可以免疫控制并增加护盾，非常适合打野和单带。',
    skills: [
      {
        name: '双重射击',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/131/131_001.png',
        description: '刘备每次攻击会发射两颗子弹，造成物理伤害。',
        tip: '贴脸输出伤害最高'
      },
      {
        name: '身先士卒',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/131/131_002.png',
        description: '刘备向前冲锋，造成物理伤害并减速敌人。',
        tip: '用于追击或逃跑'
      },
      {
        name: '以德服人',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/131/131_003.png',
        description: '刘备展开大招，增加护盾并免疫控制，同时每秒对周围敌人造成伤害。',
        tip: '开团时使用，吸收伤害'
      }
    ],
    builds: [
      { name: '贪婪之噬', desc: '增加攻速和物理穿透' },
      { name: '急速战靴', desc: '增加移速和攻速' },
      { name: '泣血之刃', desc: '增加物理攻击和吸血' },
      { name: '暗影战斧', desc: '增加物理攻击和冷却缩减' },
      { name: '宗师之力', desc: '增加暴击和爆发伤害' },
      { name: '贤者的庇护', desc: '增加双抗和复活' }
    ],
    arcana: [
      { name: '异变', count: 10, desc: '物理攻击+20，物理穿透+36' },
      { name: '鹰眼', count: 10, desc: '物理攻击+9，物理穿透+64' },
      { name: '狩猎', count: 10, desc: '攻速+10%，移速+10%' }
    ],
    tips: [
      '刘备适合打野，清野速度快',
      '大招开启时可以越塔强杀',
      '二技能可以穿墙',
      '尽量贴脸输出，伤害更高'
    ],
    counters: {
      strong: ['蔡文姬', '张飞'],
      weak: ['孙悟空', '李白']
    }
  },
  {
    id: 'diaochan',
    name: '貂蝉',
    role: '法师',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/107/107.jpg',
    description: '貂蝉是一名高机动性法师，擅长持续输出和秀操作，二技能可以躲避技能，大招范围内技能冷却极短。',
    skills: [
      {
        name: '落红雨',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/107/107_001.png',
        description: '貂蝉向前挥出花球，造成法术伤害并标记敌人。',
        tip: '用于消耗和标记'
      },
      {
        name: '缘心结',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/107/107_002.png',
        description: '貂蝉瞬间消失并出现在指定位置，同时发出三枚花球造成伤害。',
        tip: '可以躲避技能和调整位置'
      },
      {
        name: '绽·风华',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/107/107_003.png',
        description: '貂蝉展开法阵，在法阵内技能冷却大幅缩短，同时提升移动速度。',
        tip: '团战中心开启，持续输出'
      }
    ],
    builds: [
      { name: '痛苦面具', desc: '增加法术攻击和百分比伤害' },
      { name: '冷静之靴', desc: '增加冷却缩减' },
      { name: '回响之杖', desc: '增加法术攻击和AOE伤害' },
      { name: '博学者之怒', desc: '大幅增加法术攻击' },
      { name: '虚无法杖', desc: '增加法术穿透' },
      { name: '辉月', desc: '增加法术攻击和主动无敌' }
    ],
    arcana: [
      { name: '梦魇', count: 10, desc: '法术攻击+42' },
      { name: '献祭', count: 10, desc: '法术攻击+24，冷却缩减+7%' },
      { name: '轮回', count: 10, desc: '法术攻击+24，法术吸血+10%' }
    ],
    tips: [
      '二技能可以躲掉很多关键技能',
      '大招范围内尽量多放技能',
      '利用被动叠加印记造成额外伤害',
      '注意蓝量管理'
    ],
    counters: {
      strong: ['东皇太一', '张良'],
      weak: ['赵云', '兰陵王']
    }
  },
  {
    id: 'zhangfei',
    name: '张飞',
    role: '坦克',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/125/125.jpg',
    description: '张飞是一名强力坦克，擅长保护队友和开团，大招可以变身增加大量生命值，同时提供群体控制。',
    skills: [
      {
        name: '画地为牢',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/125/125_001.png',
        description: '张飞怒吼，形成一个区域，对区域内敌人造成伤害和减速。',
        tip: '用于封路和减速'
      },
      {
        name: '守护机关',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/125/125_002.png',
        description: '张飞为自己和周围友军添加护盾。',
        tip: '保护队友，吸收伤害'
      },
      {
        name: '狂兽血性',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/125/125_003.png',
        description: '张飞变身，增加大量生命值，同时将周围敌人击退并造成伤害。',
        tip: '开团神器，先手控制'
      }
    ],
    builds: [
      { name: '红莲斗篷', desc: '增加物理防御和AOE伤害' },
      { name: '抵抗之靴', desc: '增加法术防御和韧性' },
      { name: '不祥征兆', desc: '增加物理防御和减速效果' },
      { name: '魔女斗篷', desc: '增加法术防御和护盾' },
      { name: '霸者重装', desc: '增加生命值和回血' },
      { name: '反伤刺甲', desc: '反弹物理伤害' }
    ],
    arcana: [
      { name: '宿命', count: 10, desc: '攻击+10，物理防御+23，攻速+10%' },
      { name: '虚空', count: 10, desc: '最大生命+375，冷却缩减+6%' },
      { name: '调和', count: 10, desc: '最大生命+450，移速+4%，回血+5.2' }
    ],
    tips: [
      '大招需要积攒怒气，注意时机',
      '变身后普攻伤害很高',
      '二技能护盾可以保护队友',
      '开大时注意站位，尽量覆盖更多敌人'
    ],
    counters: {
      strong: ['王昭君', '甄姬'],
      weak: ['貂蝉', '吕布']
    }
  },
  {
    id: 'sunwukong',
    name: '孙悟空',
    role: '刺客',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/104/104.jpg',
    description: '孙悟空是一名高爆发刺客，擅长秒脆皮，被动技能可以暴击，大招可以击飞敌人，非常适合打野和切后排。',
    skills: [
      {
        name: '如意金箍',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/104/104_001.png',
        description: '孙悟空挥舞金箍棒，造成物理伤害并减速敌人。',
        tip: '用于消耗和追击'
      },
      {
        name: '斗战冲锋',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/104/104_002.png',
        description: '孙悟空向指定方向冲锋，对路径上敌人造成伤害。',
        tip: '可以穿墙，用于接近敌人'
      },
      {
        name: '大闹天宫',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/104/104_003.png',
        description: '孙悟空将金箍棒变大并旋转，击飞周围敌人并造成伤害。',
        tip: '团控技能，开团或切后排'
      }
    ],
    builds: [
      { name: '贪婪之噬', desc: '增加攻速和物理穿透' },
      { name: '急速战靴', desc: '增加移速和攻速' },
      { name: '无尽战刃', desc: '增加暴击率和暴击伤害' },
      { name: '宗师之力', desc: '增加暴击和爆发伤害' },
      { name: '碎星锤', desc: '增加物理穿透' },
      { name: '名刀·司命', desc: '增加暴击和保命' }
    ],
    arcana: [
      { name: '无双', count: 10, desc: '暴击率+7%，暴击效果+36%' },
      { name: '鹰眼', count: 10, desc: '物理攻击+9，物理穿透+64' },
      { name: '夺萃', count: 10, desc: '物理吸血+16%' }
    ],
    tips: [
      '被动技能可以打出额外暴击',
      '二技能可以穿墙接近敌人',
      '大招尽量击飞更多敌人',
      '注意进场时机，不要先手开团'
    ],
    counters: {
      strong: ['东皇太一', '张良'],
      weak: ['后羿', '鲁班七号']
    }
  },
  {
    id: 'houyi',
    name: '后羿',
    role: '射手',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/117/117.jpg',
    description: '后羿是一名站桩型射手，擅长远程输出和控制，大招可以全图支援，被动减速敌人，非常适合打团和推塔。',
    skills: [
      {
        name: '惩戒射击',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/117/117_001.png',
        description: '后羿向前方射出箭矢，造成物理伤害并标记敌人。',
        tip: '用于消耗和清兵'
      },
      {
        name: '落日余晖',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/117/117_002.png',
        description: '后羿向指定方向释放火焰，造成伤害并减速敌人。',
        tip: '用于封锁走位和减速'
      },
      {
        name: '灼日之矢',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/117/117_003.png',
        description: '后羿射出一支穿云箭，对命中的第一个敌人造成眩晕，之后的敌人造成伤害。',
        tip: '全图支援，开团或反打'
      }
    ],
    builds: [
      { name: '急速战靴', desc: '增加移速和攻速' },
      { name: '闪电匕首', desc: '增加攻速和连锁闪电' },
      { name: '无尽战刃', desc: '增加暴击率和暴击伤害' },
      { name: '泣血之刃', desc: '增加物理攻击和吸血' },
      { name: '破晓', desc: '增加物理穿透和攻速' },
      { name: '贤者的庇护', desc: '增加双抗和复活' }
    ],
    arcana: [
      { name: '红月', count: 10, desc: '攻速+16%，暴击率+5%' },
      { name: '鹰眼', count: 10, desc: '物理攻击+9，物理穿透+64' },
      { name: '狩猎', count: 10, desc: '攻速+10%，移速+10%' }
    ],
    tips: [
      '保持安全距离输出',
      '大招尽量命中关键敌人',
      '利用被动减速敌人',
      '注意走位，避免被刺客切'
    ],
    counters: {
      strong: ['张飞', '蔡文姬'],
      weak: ['孙悟空', '兰陵王']
    }
  },
  {
    id: 'caiwenji',
    name: '蔡文姬',
    role: '辅助',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/129/129.jpg',
    description: '蔡文姬是一名强力辅助，擅长治疗和控制，大招可以提供群体减伤和回血，非常适合保护队友和打团。',
    skills: [
      {
        name: '思无邪',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/129/129_001.png',
        description: '蔡文姬弹奏乐曲，对周围敌人造成法术伤害并减速。',
        tip: '用于消耗和减速'
      },
      {
        name: '胡笳乐',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/129/129_002.png',
        description: '蔡文姬为自身和周围友军恢复生命值。',
        tip: '及时治疗队友'
      },
      {
        name: '忘忧曲',
        icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/129/129_003.png',
        description: '蔡文姬展开大招，为范围内友军提供持续回血和伤害减免。',
        tip: '团战关键技能，保护全队'
      }
    ],
    builds: [
      { name: '救赎之翼', desc: '增加生命值和保护技能' },
      { name: '抵抗之靴', desc: '增加法术防御和韧性' },
      { name: '极寒风暴', desc: '增加物理防御和冷却缩减' },
      { name: '魔女斗篷', desc: '增加法术防御和护盾' },
      { name: '不祥征兆', desc: '增加物理防御和减速效果' },
      { name: '贤者的庇护', desc: '增加双抗和复活' }
    ],
    arcana: [
      { name: '宿命', count: 10, desc: '攻击+10，物理防御+23，攻速+10%' },
      { name: '虚空', count: 10, desc: '最大生命+375，冷却缩减+6%' },
      { name: '调和', count: 10, desc: '最大生命+450，移速+4%，回血+5.2' }
    ],
    tips: [
      '时刻保护己方射手',
      '二技能及时治疗残血队友',
      '大招尽量覆盖更多队友',
      '注意站位，不要被先手秒'
    ],
    counters: {
      strong: ['干将莫邪', '沈梦溪'],
      weak: ['东皇太一', '张良']
    }
  },
  {
    id: 'zhaoyun',
    name: '赵云',
    role: '战士',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/105/105.jpg',
    description: '赵云是一名灵活的战士，拥有多段位移技能，大招可以击飞敌人，适合打野和切后排。',
    skills: [
      { name: '惊雷之龙', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/105/105_001.png', description: '赵云向指定方向冲锋，对路径上敌人造成物理伤害。', tip: '可穿墙，用于接近敌人' },
      { name: '破云之龙', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/105/105_002.png', description: '赵云快速刺出龙枪，对范围内敌人造成物理伤害。', tip: '可强化下一次普攻' },
      { name: '天翔之龙', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/105/105_003.png', description: '赵云跃向空中，向指定位置发动雷霆一击，击飞敌人。', tip: '大招落地有延迟，注意预判' }
    ],
    builds: [
      { name: '贪婪之噬', desc: '增加攻速和物理穿透' },
      { name: '抵抗之靴', desc: '增加法术防御和韧性' },
      { name: '暗影战斧', desc: '增加物理攻击和冷却缩减' },
      { name: '宗师之力', desc: '增加暴击和爆发伤害' },
      { name: '破军', desc: '大幅增加物理攻击' },
      { name: '贤者的庇护', desc: '增加双抗和复活' }
    ],
    arcana: [
      { name: '异变', count: 10, desc: '物理攻击+20，物理穿透+36' },
      { name: '鹰眼', count: 10, desc: '物理攻击+9，物理穿透+64' },
      { name: '狩猎', count: 10, desc: '攻速+10%，移速+10%' }
    ],
    tips: ['利用一技能穿墙接近敌人', '大招尽量命中更多敌人', '注意技能衔接，打出连招', '后期可以切后排'],
    counters: { strong: ['后羿', '鲁班七号'], weak: ['东皇太一', '张良'] }
  },
  {
    id: 'lvbu',
    name: '吕布',
    role: '战士',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/126/126.jpg',
    description: '吕布是一名强力战士，拥有真实伤害和大范围攻击，大招可以开团，适合上单和打团。',
    skills: [
      { name: '方天画斩', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/126/126_001.png', description: '吕布挥动方天画戟，对范围内敌人造成物理伤害。', tip: '命中英雄后可回血' },
      { name: '贪狼之握', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/126/126_002.png', description: '吕布向前方抓取敌人，造成伤害并减速。', tip: '可用于接近敌人' },
      { name: '魔神降世', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/126/126_003.png', description: '吕布跳向指定位置，落地后造成大范围伤害并击飞敌人。', tip: '开团神器，注意落点' }
    ],
    builds: [
      { name: '抵抗之靴', desc: '增加法术防御和韧性' },
      { name: '红莲斗篷', desc: '增加物理防御和AOE伤害' },
      { name: '反伤刺甲', desc: '反弹物理伤害' },
      { name: '不祥征兆', desc: '增加物理防御和减速效果' },
      { name: '破军', desc: '大幅增加物理攻击' },
      { name: '魔女斗篷', desc: '增加法术防御和护盾' }
    ],
    arcana: [
      { name: '异变', count: 10, desc: '物理攻击+20，物理穿透+36' },
      { name: '鹰眼', count: 10, desc: '物理攻击+9，物理穿透+64' },
      { name: '隐匿', count: 10, desc: '物理攻击+16，移速+10%' }
    ],
    tips: ['二技能尽量命中敌人获取护盾', '大招注意落点，尽量覆盖更多敌人', '真实伤害无视护甲', '团战中站在人群中央'],
    counters: { strong: ['张飞', '蔡文姬'], weak: ['貂蝉', '王昭君'] }
  },
  {
    id: 'wangzhaojun',
    name: '王昭君',
    role: '法师',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/108/108.jpg',
    description: '王昭君是一名控制型法师，拥有大范围减速和冰冻技能，大招伤害高，适合中路和打团。',
    skills: [
      { name: '凋零冰晶', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/108/108_001.png', description: '王昭君释放冰晶，对敌人造成法术伤害并减速。', tip: '用于消耗和减速' },
      { name: '禁锢寒霜', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/108/108_002.png', description: '王昭君召唤寒霜，将范围内敌人冰冻。', tip: '控制技能，配合大招使用' },
      { name: '凛冬已至', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/108/108_003.png', description: '王昭君展开暴风雪，对范围内敌人造成持续法术伤害。', tip: '大招伤害高，需要预判' }
    ],
    builds: [
      { name: '痛苦面具', desc: '增加法术攻击和百分比伤害' },
      { name: '冷静之靴', desc: '增加冷却缩减' },
      { name: '回响之杖', desc: '增加法术攻击和AOE伤害' },
      { name: '博学者之怒', desc: '大幅增加法术攻击' },
      { name: '虚无法杖', desc: '增加法术穿透' },
      { name: '辉月', desc: '增加法术攻击和主动无敌' }
    ],
    arcana: [
      { name: '梦魇', count: 10, desc: '法术攻击+42' },
      { name: '献祭', count: 10, desc: '法术攻击+24，冷却缩减+7%' },
      { name: '轮回', count: 10, desc: '法术攻击+24，法术吸血+10%' }
    ],
    tips: ['二技能冰冻敌人后接大招', '大招需要持续施法，注意安全', '利用一技能减速敌人', '团战中站在后排输出'],
    counters: { strong: ['张飞', '孙悟空'], weak: ['赵云', '兰陵王'] }
  },
  {
    id: 'zhugeliang',
    name: '诸葛亮',
    role: '法师',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/132/132.jpg',
    description: '诸葛亮是一名高机动性法师，拥有多段位移和收割能力，大招可以锁定敌人，适合中路和打野。',
    skills: [
      { name: '东风破袭', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/132/132_001.png', description: '诸葛亮向前方释放东风，对敌人造成法术伤害。', tip: '用于消耗和触发被动' },
      { name: '时空穿梭', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/132/132_002.png', description: '诸葛亮向指定方向位移，同时释放法球。', tip: '可使用三次，第三次有击飞' },
      { name: '元气弹', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/132/132_003.png', description: '诸葛亮锁定敌人，释放元气弹造成大量伤害。', tip: '残血敌人伤害更高' }
    ],
    builds: [
      { name: '贪婪之噬', desc: '增加攻速和物理穿透' },
      { name: '冷静之靴', desc: '增加冷却缩减' },
      { name: '痛苦面具', desc: '增加法术攻击和百分比伤害' },
      { name: '回响之杖', desc: '增加法术攻击和AOE伤害' },
      { name: '博学者之怒', desc: '大幅增加法术攻击' },
      { name: '辉月', desc: '增加法术攻击和主动无敌' }
    ],
    arcana: [
      { name: '梦魇', count: 10, desc: '法术攻击+42' },
      { name: '献祭', count: 10, desc: '法术攻击+24，冷却缩减+7%' },
      { name: '狩猎', count: 10, desc: '攻速+10%，移速+10%' }
    ],
    tips: ['利用二技能调整位置', '大招尽量收割残血敌人', '被动叠加后伤害很高', '注意蓝量管理'],
    counters: { strong: ['后羿', '鲁班七号'], weak: ['东皇太一', '张良'] }
  },
  {
    id: 'donghuangtaiyi',
    name: '东皇太一',
    role: '坦克',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/141/141.jpg',
    description: '东皇太一是一名强力坦克，拥有强大的控制技能，大招可以压制敌人，适合辅助和开团。',
    skills: [
      { name: '暗冕之噬', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/141/141_001.png', description: '东皇太一释放黑暗能量，对周围敌人造成伤害。', tip: '用于消耗和回血' },
      { name: '曜龙烛兆', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/141/141_002.png', description: '东皇太一召唤曜龙，对指定方向敌人造成伤害和减速。', tip: '用于控制和减速' },
      { name: '堕神契约', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/141/141_003.png', description: '东皇太一压制敌人，双方同时受到伤害。', tip: '压制期间双方都无法被选中' }
    ],
    builds: [
      { name: '红莲斗篷', desc: '增加物理防御和AOE伤害' },
      { name: '抵抗之靴', desc: '增加法术防御和韧性' },
      { name: '不祥征兆', desc: '增加物理防御和减速效果' },
      { name: '魔女斗篷', desc: '增加法术防御和护盾' },
      { name: '霸者重装', desc: '增加生命值和回血' },
      { name: '反伤刺甲', desc: '反弹物理伤害' }
    ],
    arcana: [
      { name: '宿命', count: 10, desc: '攻击+10，物理防御+23，攻速+10%' },
      { name: '虚空', count: 10, desc: '最大生命+375，冷却缩减+6%' },
      { name: '调和', count: 10, desc: '最大生命+450，移速+4%，回血+5.2' }
    ],
    tips: ['一技能尽量命中更多敌人', '大招尽量压制对面核心英雄', '压制期间注意自身血量', '保护己方输出'],
    counters: { strong: ['貂蝉', '孙悟空'], weak: ['王昭君', '甄姬'] }
  },
  {
    id: 'xiangyu',
    name: '项羽',
    role: '坦克',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/101/101.jpg',
    description: '项羽是一名老牌坦克，拥有强大的控制和防御能力，大招可以开团，适合辅助和上单。',
    skills: [
      { name: '无畏冲锋', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/101/101_001.png', description: '项羽向指定方向冲锋，将敌人顶向墙边造成眩晕。', tip: '顶到墙上才有眩晕效果' },
      { name: '破釜沉舟', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/101/101_002.png', description: '项羽怒吼，增加自身防御并对周围敌人造成伤害。', tip: '增加防御，吸收伤害' },
      { name: '霸王斩', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/101/101_003.png', description: '项羽蓄力后挥出一剑，对范围内敌人造成大量伤害。', tip: '蓄力越久伤害越高' }
    ],
    builds: [
      { name: '红莲斗篷', desc: '增加物理防御和AOE伤害' },
      { name: '抵抗之靴', desc: '增加法术防御和韧性' },
      { name: '不祥征兆', desc: '增加物理防御和减速效果' },
      { name: '魔女斗篷', desc: '增加法术防御和护盾' },
      { name: '霸者重装', desc: '增加生命值和回血' },
      { name: '反伤刺甲', desc: '反弹物理伤害' }
    ],
    arcana: [
      { name: '宿命', count: 10, desc: '攻击+10，物理防御+23，攻速+10%' },
      { name: '虚空', count: 10, desc: '最大生命+375，冷却缩减+6%' },
      { name: '调和', count: 10, desc: '最大生命+450，移速+4%，回血+5.2' }
    ],
    tips: ['一技能尽量把敌人顶到墙上', '大招蓄力时注意安全', '二技能增加防御，开团必备', '保护己方射手'],
    counters: { strong: ['后羿', '鲁班七号'], weak: ['貂蝉', '吕布'] }
  },
  {
    id: 'lanlingwang',
    name: '兰陵王',
    role: '刺客',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/109/109.jpg',
    description: '兰陵王是一名隐身刺客，擅长偷袭和切后排，大招可以隐身接近敌人，非常适合打野。',
    skills: [
      { name: '秘技·影蚀', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/109/109_001.png', description: '兰陵王向指定方向投射暗影，标记敌人并造成伤害。', tip: '标记后普攻伤害更高' },
      { name: '秘技·影杀', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/109/109_002.png', description: '兰陵王闪现到敌人身边，造成伤害并眩晕。', tip: '用于接近敌人和控制' },
      { name: '秘技·隐匿', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/109/109_003.png', description: '兰陵王进入隐身状态，移动速度提升。', tip: '隐身时注意不要靠近敌人' }
    ],
    builds: [
      { name: '贪婪之噬', desc: '增加攻速和物理穿透' },
      { name: '抵抗之靴', desc: '增加法术防御和韧性' },
      { name: '暗影战斧', desc: '增加物理攻击和冷却缩减' },
      { name: '无尽战刃', desc: '增加暴击率和暴击伤害' },
      { name: '碎星锤', desc: '增加物理穿透' },
      { name: '名刀·司命', desc: '增加暴击和保命' }
    ],
    arcana: [
      { name: '异变', count: 10, desc: '物理攻击+20，物理穿透+36' },
      { name: '鹰眼', count: 10, desc: '物理攻击+9，物理穿透+64' },
      { name: '隐匿', count: 10, desc: '物理攻击+16，移速+10%' }
    ],
    tips: ['利用隐身接近敌人', '一技能标记后再输出', '二技能可以眩晕敌人', '切完后排及时撤退'],
    counters: { strong: ['后羿', '鲁班七号'], weak: ['东皇太一', '张飞'] }
  },
  {
    id: 'libai',
    name: '李白',
    role: '刺客',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/111/111.jpg',
    description: '李白是一名高机动性刺客，拥有三段位移和不可选中技能，大招伤害高，适合打野和秀操作。',
    skills: [
      { name: '将进酒', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/111/111_001.png', description: '李白向前突进，可使用三次，第三次回到原位。', tip: '可穿墙，用于接近或逃跑' },
      { name: '神来之笔', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/111/111_002.png', description: '李白画出剑圈，对敌人造成伤害并减速。', tip: '圈内敌人无法选中李白' },
      { name: '青莲剑歌', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/111/111_003.png', description: '李白快速挥动剑刃，对范围内敌人造成大量伤害。', tip: '需要四道剑气解锁' }
    ],
    builds: [
      { name: '贪婪之噬', desc: '增加攻速和物理穿透' },
      { name: '急速战靴', desc: '增加移速和攻速' },
      { name: '泣血之刃', desc: '增加物理攻击和吸血' },
      { name: '暗影战斧', desc: '增加物理攻击和冷却缩减' },
      { name: '破军', desc: '大幅增加物理攻击' },
      { name: '名刀·司命', desc: '增加暴击和保命' }
    ],
    arcana: [
      { name: '异变', count: 10, desc: '物理攻击+20，物理穿透+36' },
      { name: '鹰眼', count: 10, desc: '物理攻击+9，物理穿透+64' },
      { name: '狩猎', count: 10, desc: '攻速+10%，移速+10%' }
    ],
    tips: ['利用一技能接近敌人', '二技能可以躲避技能', '大招需要普攻解锁', '团战中注意进场时机'],
    counters: { strong: ['后羿', '蔡文姬'], weak: ['东皇太一', '张良'] }
  },
  {
    id: 'lubanqihao',
    name: '鲁班七号',
    role: '射手',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/106/106.jpg',
    description: '鲁班七号是一名站桩型射手，拥有高爆发和AOE伤害，大招可以全图支援，适合打团和推塔。',
    skills: [
      { name: '河豚手雷', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/106/106_001.png', description: '鲁班七号投掷手雷，对敌人造成伤害和减速。', tip: '用于消耗和减速' },
      { name: '无敌鲨嘴炮', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/106/106_002.png', description: '鲁班七号向指定方向发射炮弹，造成伤害。', tip: '可远程消耗' },
      { name: '空中支援', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/106/106_003.png', description: '鲁班七号召唤飞艇，对指定区域造成持续伤害。', tip: '全图支援，推塔神器' }
    ],
    builds: [
      { name: '急速战靴', desc: '增加移速和攻速' },
      { name: '闪电匕首', desc: '增加攻速和连锁闪电' },
      { name: '无尽战刃', desc: '增加暴击率和暴击伤害' },
      { name: '泣血之刃', desc: '增加物理攻击和吸血' },
      { name: '破晓', desc: '增加物理穿透和攻速' },
      { name: '贤者的庇护', desc: '增加双抗和复活' }
    ],
    arcana: [
      { name: '红月', count: 10, desc: '攻速+16%，暴击率+5%' },
      { name: '鹰眼', count: 10, desc: '物理攻击+9，物理穿透+64' },
      { name: '狩猎', count: 10, desc: '攻速+10%，移速+10%' }
    ],
    tips: ['保持安全距离输出', '二技能可以远程消耗', '大招用于推塔和支援', '注意走位，避免被刺客切'],
    counters: { strong: ['张飞', '蔡文姬'], weak: ['孙悟空', '兰陵王'] }
  },
  {
    id: 'sunshangxiang',
    name: '孙尚香',
    role: '射手',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/112/112.jpg',
    description: '孙尚香是一名高机动性射手，拥有位移技能和高爆发，一技能翻滚后伤害很高，适合打团和带线。',
    skills: [
      { name: '翻滚突袭', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/112/112_001.png', description: '孙尚香向指定方向翻滚，下一次普攻伤害提升。', tip: '翻滚后伤害很高' },
      { name: '红莲爆弹', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/112/112_002.png', description: '孙尚香投掷爆弹，对敌人造成伤害并减速。', tip: '用于消耗和减速' },
      { name: '究极弩炮', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/112/112_003.png', description: '孙尚香发射弩炮，对敌人造成大量伤害。', tip: '需要蓄力，伤害高' }
    ],
    builds: [
      { name: '急速战靴', desc: '增加移速和攻速' },
      { name: '闪电匕首', desc: '增加攻速和连锁闪电' },
      { name: '无尽战刃', desc: '增加暴击率和暴击伤害' },
      { name: '宗师之力', desc: '增加暴击和爆发伤害' },
      { name: '破晓', desc: '增加物理穿透和攻速' },
      { name: '贤者的庇护', desc: '增加双抗和复活' }
    ],
    arcana: [
      { name: '无双', count: 10, desc: '暴击率+7%，暴击效果+36%' },
      { name: '鹰眼', count: 10, desc: '物理攻击+9，物理穿透+64' },
      { name: '夺萃', count: 10, desc: '物理吸血+16%' }
    ],
    tips: ['一技能翻滚后接普攻', '利用位移调整位置', '大招尽量命中敌人', '注意走位，避免被刺客切'],
    counters: { strong: ['张飞', '蔡文姬'], weak: ['孙悟空', '兰陵王'] }
  },
  {
    id: 'sunbin',
    name: '孙膑',
    role: '辅助',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/110/110.jpg',
    description: '孙膑是一名功能型辅助，拥有加速和回血技能，大招可以沉默敌人，适合保护队友和打团。',
    skills: [
      { name: '时空爆弹', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/110/110_001.png', description: '孙膑向指定方向投掷炸弹，造成伤害和减速。', tip: '用于消耗和减速' },
      { name: '时光流逝', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/110/110_002.png', description: '孙膑为周围友军加速并恢复生命值。', tip: '加速和回血，保护队友' },
      { name: '时光结界', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/110/110_003.png', description: '孙膑展开结界，沉默范围内敌人并造成伤害。', tip: '团控技能，开团或反打' }
    ],
    builds: [
      { name: '救赎之翼', desc: '增加生命值和保护技能' },
      { name: '冷静之靴', desc: '增加冷却缩减' },
      { name: '极寒风暴', desc: '增加物理防御和冷却缩减' },
      { name: '魔女斗篷', desc: '增加法术防御和护盾' },
      { name: '不祥征兆', desc: '增加物理防御和减速效果' },
      { name: '贤者的庇护', desc: '增加双抗和复活' }
    ],
    arcana: [
      { name: '宿命', count: 10, desc: '攻击+10，物理防御+23，攻速+10%' },
      { name: '虚空', count: 10, desc: '最大生命+375，冷却缩减+6%' },
      { name: '调和', count: 10, desc: '最大生命+450，移速+4%，回血+5.2' }
    ],
    tips: ['二技能及时给队友加速', '大招尽量覆盖更多敌人', '保护己方输出', '注意站位，不要被先手秒'],
    counters: { strong: ['王昭君', '甄姬'], weak: ['东皇太一', '张良'] }
  },
  {
    id: 'daqiao',
    name: '大乔',
    role: '辅助',
    avatar: 'https://game.gtimg.cn/images/yxzj/img201606/heroimg/133/133.jpg',
    description: '大乔是一名战略型辅助，拥有传送和控制技能，大招可以召唤队友，适合团队作战和运营。',
    skills: [
      { name: '鲤跃之潮', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/133/133_001.png', description: '大乔释放海潮，对敌人造成伤害并沉默。', tip: '用于消耗和沉默' },
      { name: '宿命之海', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/133/133_002.png', description: '大乔召唤法阵，为队友恢复生命值。', tip: '治疗队友，提供续航' },
      { name: '决断之桥', icon: 'https://game.gtimg.cn/images/yxzj/img201606/skillimg/133/133_003.png', description: '大乔召唤法阵，召唤所有队友到指定位置。', tip: '传送队友，快速集结' }
    ],
    builds: [
      { name: '救赎之翼', desc: '增加生命值和保护技能' },
      { name: '冷静之靴', desc: '增加冷却缩减' },
      { name: '极寒风暴', desc: '增加物理防御和冷却缩减' },
      { name: '魔女斗篷', desc: '增加法术防御和护盾' },
      { name: '不祥征兆', desc: '增加物理防御和减速效果' },
      { name: '贤者的庇护', desc: '增加双抗和复活' }
    ],
    arcana: [
      { name: '宿命', count: 10, desc: '攻击+10，物理防御+23，攻速+10%' },
      { name: '虚空', count: 10, desc: '最大生命+375，冷却缩减+6%' },
      { name: '调和', count: 10, desc: '最大生命+450，移速+4%，回血+5.2' }
    ],
    tips: ['大招尽量放在安全位置', '二技能及时治疗队友', '利用传送支援队友', '注意站位，不要被先手秒'],
    counters: { strong: ['后羿', '鲁班七号'], weak: ['东皇太一', '张良'] }
  }
];

const roles = ['全部', '战士', '法师', '坦克', '刺客', '射手', '辅助'];