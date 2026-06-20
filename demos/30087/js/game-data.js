/**
 * 时空抉择 - 历史数据
 * 包含朝代、事件、人物、抉择点等完整数据结构
 */

const GameData = {
  // 朝代数据
  dynasties: [
    { id: 'xia', name: '夏', year: '约前2070-前1600', icon: '🏛️' },
    { id: 'shang', name: '商', year: '前1600-前1046', icon: '🏺' },
    { id: 'zhou', name: '周', year: '前1046-前256', icon: '📜' },
    { id: 'qin', name: '秦', year: '前221-前207', icon: '⚔️' },
    { id: 'han', name: '汉', year: '前206-220', icon: '🔥' },
    { id: 'sanguo', name: '三国', year: '220-280', icon: '⚔️' },
    { id: 'jin', name: '晋', year: '265-420', icon: '🌸' },
    { id: 'sui', name: '隋', year: '581-618', icon: '🏯' },
    { id: 'tang', name: '唐', year: '618-907', icon: '🎋' },
    { id: 'song', name: '宋', year: '960-1279', icon: '🏮' },
    { id: 'yuan', name: '元', year: '1271-1368', icon: '🐎' },
    { id: 'ming', name: '明', year: '1368-1644', icon: '🏯' },
    { id: 'qing', name: '清', year: '1644-1912', icon: '🐉' }
  ],

  // 人物图鉴
  characters: {
    liu_bei: {
      id: 'liu_bei',
      name: '刘备',
      title: '蜀汉昭烈帝',
      avatar: '👤',
      color: '#e74c3c',
      description: '汉室宗亲，以仁德服人',
      skills: ['仁政', '知人善任', '韧性'],
      relations: { zhou_yu: '盟友', cao_cao: '宿敌', sun_quan: '盟友' }
    },
    sun_quan: {
      id: 'sun_quan',
      name: '孙权',
      title: '东吴大帝',
      avatar: '👤',
      color: '#3498db',
      description: '江东之主，少年英才',
      skills: ['制衡', '用人', '守成'],
      relations: { liu_bei: '盟友', cao_cao: '对手' }
    },
    cao_cao: {
      id: 'cao_cao',
      name: '曹操',
      title: '魏武帝',
      avatar: '👤',
      color: '#2c3e50',
      description: '乱世奸雄，志在天下',
      skills: ['军事', '政治', '文学'],
      relations: { liu_bei: '宿敌', sun_quan: '对手' }
    },
    zhou_yu: {
      id: 'zhou_yu',
      name: '周瑜',
      title: '吴军都督',
      avatar: '⚔️',
      color: '#9b59b6',
      description: '东吴名将，火烧赤壁',
      skills: ['火攻', '水战', '音乐'],
      relations: { zhu_ge: '亦敌亦友' }
    },
    zhu_ge: {
      id: 'zhu_ge',
      name: '诸葛亮',
      title: '蜀汉丞相',
      avatar: '📖',
      color: '#27ae60',
      description: '卧龙先生，智慧化身',
      skills: ['谋略', '内政', '发明'],
      relations: { zhou_yu: '亦敌亦友', cao_cao: '对手' }
    },
    poe: {
      id: 'poe',
      name: '庞统',
      title: '凤雏先生',
      avatar: '📚',
      color: '#e67e22',
      description: '刘备谋士，与孔明齐名',
      skills: ['奇谋', '内政'],
      relations: { zhu_ge: '好友' }
    }
  },

  // 事件数据 - 赤壁之战完整流程
  events: {
    chibi: {
      id: 'chibi',
      name: '赤壁之战',
      dynasty: 'sanguo',
      year: '208年',
      difficulty: '★★★☆☆',
      description: '三国时期最著名的以少胜多战役',

      // 阶段1：战前联盟
      stages: [
        {
          id: 'stage_1',
          name: '孙刘联盟',
          type: 'dialogue',
          background: '曹操率二十万大军南下，意图统一天下。刘备兵微将寡，危在旦夕。诸葛亮主动请缨，前往江东说服孙权。',
          situation: '你作为诸葛亮的随从，见证了这场决定三国格局的对话。周瑜内心矛盾，既想抗曹，又忌惮诸葛亮。',
          speaker: '周瑜',
          dialogue: '孔明先生，曹操兵马众多，此战当真有胜算？',
          choices: [
            {
              id: 'c1_1',
              label: '引用兵法，以理服人',
              desc: '从军事角度分析曹军弱点',
              deviation: 0,
              response: '知己知彼，百战不殆。曹军远来疲惫，不习水战，且北方士兵多晕船。此战有三分胜算。',
              next: 'stage_2'
            },
            {
              id: 'c1_2',
              label: '激将法，激怒周瑜',
              desc: '暗示周瑜不如曹操，激发斗志',
              deviation: 15,
              response: '将军若降曹操，不过封侯拜将。以将军之才，何不与曹操划江而治？',
              next: 'stage_2b'
            },
            {
              id: 'c1_3',
              label: '以天意说之',
              desc: '借助天象预言曹军必败',
              deviation: 25,
              response: '近日有星象示警，曹操有败兆。此乃天意，不可违也。',
              next: 'stage_2c'
            }
          ]
        },
        {
          id: 'stage_2',
          name: '制定战略',
          type: 'strategy',
          background: '孙权决定联合抗曹，但如何用兵需要仔细谋划。周瑜作为吴军都督，需要制定详细的作战方案。',
          situation: '周瑜召集众将商议，询问破曹之策。曹操水军虽然精锐，但也有致命弱点。',
          speaker: '周瑜',
          dialogue: '诸位，曹操水军虽强，但必有破绽。如何破之？',
          choices: [
            {
              id: 'c2_1',
              label: '火攻为上',
              desc: '利用曹操战船连环的弱点，火攻破曹',
              deviation: 0,
              response: '好！曹操战船首尾相连，若用火攻，必可大破曹军！',
              effect: { type: 'buff', target: 'fire', value: 30 },
              next: 'stage_3'
            },
            {
              id: 'c2_2',
              label: '水战消耗',
              desc: '利用水军优势，长期对峙消耗曹军',
              deviation: 20,
              response: '此计虽稳，但曹操补给充足，恐难以持久...罢了，姑且一试。',
              effect: { type: 'debuff', target: 'stamina', value: -15 },
              next: 'stage_3b'
            },
            {
              id: 'c2_3',
              label: '诈降之计',
              desc: '利用曹操轻敌心理，诈降火攻',
              deviation: 10,
              response: '妙计！黄盖愿为内应，可行苦肉计！',
              next: 'stage_3'
            }
          ]
        },
        {
          id: 'stage_2b',
          name: '周瑜的决心',
          type: 'strategy',
          background: '激将法奏效，周瑜决心抗曹。但方法仍需商议。',
          situation: '周瑜被激怒，决心与曹操一战。但作为都督，他需要听取各将意见。',
          speaker: '黄盖',
          dialogue: '都督，末将愿率水军冲锋陷阵！',
          choices: [
            {
              id: 'c2b_1',
              label: '采纳黄盖建议',
              desc: '让黄盖率火船冲锋',
              deviation: 5,
              response: '好！黄将军勇气可嘉，此计可行！',
              next: 'stage_3'
            },
            {
              id: 'c2b_2',
              label: '谨慎行事',
              desc: '需要更周全的计划',
              deviation: 15,
              response: '将军稍安勿躁，此战关乎江东存亡，需从长计议。',
              next: 'stage_3b'
            }
          ]
        },
        {
          id: 'stage_2c',
          name: '天命之争',
          type: 'strategy',
          background: '天象之说动摇了部分将领，但仅靠天命难以说服众人。',
          situation: '鲁肃提出疑问：天命之说虚无缥缈，实际情况如何应对？',
          speaker: '鲁肃',
          dialogue: '天象之说虽好，但实际作战还需真刀真枪。周都督有何打算？',
          choices: [
            {
              id: 'c2c_1',
              label: '顺势而行',
              desc: '结合天象与实际制定火攻计划',
              deviation: 10,
              response: '子敬说得有理。天时地利人和，缺一不可。当以火攻配合实际战术。',
              next: 'stage_3'
            },
            {
              id: 'c2c_2',
              label: '坚守待变',
              desc: '据守江东，等待时机',
              deviation: 30,
              response: '也罢，暂且坚守，看曹操能否找到破绽。',
              next: 'stage_3c'
            }
          ]
        },
        {
          id: 'stage_3',
          name: '苦肉计',
          type: 'action',
          background: '火攻之计已定，但需要有人诈降曹操，作为内应。黄盖愿意执行苦肉计。',
          situation: '黄盖将假装与周瑜不和，向曹操投降。这需要忍受巨大的屈辱。',
          speaker: '黄盖',
          dialogue: '为破曹贼，粉身碎骨在所不惜！只求都督莫要心软。',
          choices: [
            {
              id: 'c3_1',
              label: '执行苦肉计',
              desc: '让黄盖挨打后投降曹操',
              deviation: 0,
              response: '公覆受刑，曹操必信。火船已备，只等东南风起！',
              next: 'stage_4',
              effect: { type: 'hidden', target: 'caowei', value: 100 }
            },
            {
              id: 'c3_2',
              label: '修改计划',
              desc: '苦肉计太冒险，改用其他方式',
              deviation: 25,
              response: '这...罢了，此计确有风险。改用连环计如何？',
              next: 'stage_4b'
            },
            {
              id: 'c3_3',
              label: '加强防守',
              desc: '放弃进攻，专心防守',
              deviation: 40,
              response: '进攻风险太大，不如固守江东，以逸待劳。',
              next: 'stage_4c'
            }
          ]
        },
        {
          id: 'stage_3b',
          name: '持久对峙',
          type: 'action',
          background: '联军选择与曹军长期对峙，消耗敌军补给。',
          situation: '曹操北方士兵水土不服，疾病蔓延。但曹军补给充足，僵局持续。',
          speaker: '诸葛亮',
              dialogue: '主公，对峙已过半月，曹操援军将至，需尽快破局。',
          choices: [
            {
              id: 'c3b_1',
              label: '夜袭曹营',
                  desc: '趁夜色偷袭曹操大营',
              deviation: 15,
              response: '夜袭虽险，但可打乱曹军部署。成败在此一举！',
              next: 'stage_4'
            },
            {
              id: 'c3b_2',
              label: '继续等待',
              desc: '等待更好的时机',
              deviation: 25,
              response: '再等等...或许会有转机。',
              next: 'stage_4c'
            }
          ]
        },
        {
          id: 'stage_3c',
          name: '坚守江东',
          type: 'action',
          background: '联军选择坚守战略，以逸待劳。',
          situation: '曹操多次挑战，联军坚守不出。但军需消耗日益严重。',
          speaker: '周瑜',
          dialogue: '坚守固然安全，但士气渐低。需想办法破局。',
          choices: [
            {
              id: 'c3c_1',
              label: '坚守到援军',
              desc: '等待刘备援军到达',
              deviation: 20,
              response: '好！派人催促刘备尽快出兵！',
              next: 'stage_4'
            },
            {
              id: 'c3c_2',
              label: '主动出击',
              desc: '改变策略，主动进攻',
              deviation: 15,
              response: '不能坐以待毙！准备火攻！',
              next: 'stage_4'
            }
          ]
        },
        {
          id: 'stage_4',
          name: '万事俱备',
          type: 'climax',
          background: '火攻计划一切就绪。黄盖的诈降已经骗过曹操，曹操把战船用铁链相连。万事俱备，只欠东风。',
          situation: '东南风起，火船即将出发。这是决定命运的时刻。',
          speaker: '周瑜',
          dialogue: '传令！火船出发！全军备战！',
          choices: [
            {
              id: 'c4_1',
              label: '按计划执行',
              desc: '按原计划火攻赤壁',
              deviation: 0,
              response: '火船撞入曹营！赤壁火光冲天！曹军大乱！',
              next: 'stage_5'
            },
            {
              id: 'c4_2',
              label: '分兵追击',
              desc: '趁乱分兵追击曹操',
              deviation: 10,
              response: '好！令甘兴霸率水军追击！务必活捉曹操！',
              next: 'stage_5b'
            },
            {
              id: 'c4_3',
              label: '围困而非追击',
              desc: '围困曹军，迫使其投降',
              deviation: 20,
              response: '穷寇莫追！封锁江面，断其归路！',
              next: 'stage_5c'
            }
          ]
        },
        {
          id: 'stage_4b',
          name: '连环计变',
          type: 'climax',
          background: '放弃了苦肉计，改用庞统的连环计。将曹操战船用铁链相连。',
          situation: '连环计已成，但少了内应，风险更大。',
          speaker: '庞统',
          dialogue: '铁索连船，曹操必不生疑。火攻可成。',
          choices: [
            {
              id: 'c4b_1',
              label: '继续火攻',
              desc: '按连环计执行火攻',
              deviation: 10,
              response: '火起！连环船无法分散，火势蔓延曹军大营！',
              next: 'stage_5'
            },
            {
              id: 'c4b_2',
              label: '谨慎观察',
              desc: '先观察火攻效果',
              deviation: 15,
              response: '先观其变，若火攻有效再全军出击。',
              next: 'stage_5b'
            }
          ]
        },
        {
          id: 'stage_4c',
          name: '僵局',
          type: 'climax',
          background: '联军未能抓住战机，曹操援军已到，战局陷入僵持。',
          situation: '曹操援军到达，局势逆转。联军面临艰难抉择。',
          speaker: '鲁肃',
          dialogue: '主公，曹操援军已到，再战不利。不如...',
          choices: [
            {
              id: 'c4c_1',
              label: '战略撤退',
              desc: '保存实力，战略转移',
              deviation: 35,
              response: '留得青山在，不怕没柴烧。撤军！',
              next: 'stage_5c'
            },
            {
              id: 'c4c_2',
              label: '背水一战',
              desc: '破釜沉舟，决一死战',
              deviation: 20,
              response: '退无可退！今日就是决战之时！冲！',
              next: 'stage_5'
            }
          ]
        },
        {
          id: 'stage_5',
          name: '赤壁大火',
          type: 'ending',
          background: '火光冲天，曹军大乱！这一战将决定三国的走向！',
          situation: '赤壁火光冲天，曹操大军陷入混乱。吴蜀联军全线出击！',
          speaker: '士兵',
          dialogue: '报——！曹营火起！曹军大乱！',
          choices: [
            {
              id: 'c5_1',
              label: '乘胜追击',
              desc: '全力追杀曹操',
              deviation: 5,
              response: '追！不许让曹操逃脱！',
              next: 'ending_1'
            },
            {
              id: 'c5_2',
              label: '收复失地',
              desc: '趁机收复荆州等地',
              deviation: 10,
              response: '先占地盘要紧！速占江陵！',
              next: 'ending_2'
            }
          ]
        },
        {
          id: 'stage_5b',
          name: '华容道',
          type: 'ending',
          background: '曹操败走华容道，在此设伏的正是关羽。',
          situation: '曹操狼狈逃窜，来到华容道。关羽奉命在此拦截。',
          speaker: '关羽',
          dialogue: '关某奉军师之命，在此等候多时！',
          choices: [
            {
              id: 'c5b_1',
              label: '义释曹操',
              desc: '念及旧情，放走曹操',
              deviation: 30,
              response: '今日之事，我记你人情。来日再报！',
              next: 'ending_3'
            },
            {
              id: 'c5b_2',
              label: '执行军令',
              desc: '按军令拦截曹操',
              deviation: 0,
              response: '关某受军令，不敢徇私。拿下！',
              next: 'ending_4'
            }
          ]
        },
        {
          id: 'stage_5c',
          name: '无功而返',
          type: 'ending',
          background: '联军未能取得决定性胜利，曹操得以撤退。',
          situation: '曹操援军已到，联军被迫撤退。这场战役未能改变大局。',
          speaker: '刘备',
          dialogue: '唉，时也命也。暂且退兵，日后再议。',
          choices: [
            {
              id: 'c5c_1',
              label: '重整旗鼓',
              desc: '退守江陵，重整兵马',
              deviation: 25,
              response: '胜败乃兵家常事。来日方长！',
              next: 'ending_5'
            }
          ]
        }
      ],

      // 结局定义
      endings: {
        ending_1: {
          id: 'ending_1',
          title: '改写历史之人',
          icon: '👑',
          type: 'legendary',
          subtitle: '历史被你彻底改写',
          description: '你成功擒获了曹操，彻底改变了三国的走向。曹操死后，北方陷入混乱，刘备和孙权瓜分天下。你成为了改变历史的关键人物！',
          stats: {
            historical_accuracy: 15,
            deviation: 85,
            choices_made: 5,
            best_choice: '乘胜追击'
          }
        },
        ending_2: {
          id: 'ending_2',
          title: '三国霸主',
          icon: '🏆',
          type: 'epic',
          subtitle: '三国鼎立的缔造者',
          description: '你成功收复荆州，为蜀汉奠定了根基。虽然曹操逃脱，但三国鼎立的格局已经形成。你展现了出色的战略眼光。',
          stats: {
            historical_accuracy: 45,
            deviation: 55,
            choices_made: 5,
            best_choice: '收复失地'
          }
        },
        ending_3: {
          id: 'ending_3',
          title: '义薄云天',
          icon: '⚔️',
          type: 'rare',
          subtitle: '关羽式的义气',
          description: '你选择了义释曹操，虽然偏离了历史，但展现了儒家仁义精神。这一选择让你在民间留下了美名。',
          stats: {
            historical_accuracy: 35,
            deviation: 65,
            choices_made: 5,
            best_choice: '义释曹操'
          }
        },
        ending_4: {
          id: 'ending_4',
          title: '历史守护者',
          icon: '🛡️',
          type: 'normal',
          subtitle: '完美还原历史',
          description: '你几乎完美地还原了赤壁之战的真实历史！每一个选择都与诸葛亮、周瑜的决策高度一致。你展现了深厚的历史智慧！',
          stats: {
            historical_accuracy: 92,
            deviation: 8,
            choices_made: 5,
            best_choice: '执行军令'
          }
        },
        ending_5: {
          id: 'ending_5',
          title: '乱世隐士',
          icon: '🌙',
          type: 'bad',
          subtitle: '错失良机',
          description: '你错过了击败曹操的最佳时机。虽然保全了实力，但也失去了改变历史的可能。三国的格局依然存在，但你未能成为关键人物。',
          stats: {
            historical_accuracy: 55,
            deviation: 45,
            choices_made: 5,
            best_choice: '重整旗鼓'
          }
        }
      }
    }
  },

  // 获取结局的条件映射
  ending_conditions: {
    chibi: {
      // 曹操死亡
      'ending_1': (choices) => choices.every(c => c.deviation <= 10),
      // 占据荆州
      'ending_2': (choices) => choices.some(c => c.id.includes('c4_2') || c.id.includes('c2_1')),
      // 义释曹操
      'ending_3': (choices) => choices.some(c => c.id === 'c5b_1'),
      // 完美路径
      'ending_4': (choices) => choices.filter(c => c.deviation === 0).length >= 4,
      // 失败路径
      'ending_5': (choices) => choices.some(c => c.id.includes('stage_4c'))
    }
  }
};

// 游戏状态管理
const GameState = {
  currentDynasty: null,
  currentEvent: null,
  currentStageIndex: 0,
  choices: [],
  totalDeviation: 0,
  stageHistory: [],

  reset() {
    this.currentDynasty = null;
    this.currentEvent = null;
    this.currentStageIndex = 0;
    this.choices = [];
    this.totalDeviation = 0;
    this.stageHistory = [];
  },

  addChoice(choice) {
    this.choices.push(choice);
    this.totalDeviation += choice.deviation;
    this.stageHistory.push(this.currentStageIndex);
  },

  getHistoricalAccuracy() {
    return Math.max(0, 100 - this.totalDeviation);
  },

  getDeviationDegree() {
    return Math.min(100, this.totalDeviation);
  },

  getEnding() {
    const conditions = GameData.ending_conditions[this.currentEvent];
    if (!conditions) return null;

    for (const [endingId, conditionFn] of Object.entries(conditions)) {
      if (conditionFn(this.choices)) {
        return GameData.events[this.currentEvent].endings[endingId];
      }
    }
    // 默认结局
    return GameData.events[this.currentEvent].endings['ending_4'];
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GameData, GameState };
}
