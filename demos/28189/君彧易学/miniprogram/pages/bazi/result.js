/**
 * 八字排盘 - 结果展示页面（问真八字专业风格）
 */

const { paipan, getLiuNianDetail } = require('../../utils/bazi-engine');
const { WU_XING_SHENG, WU_XING_KE, GAN_ZHI_COLOR } = require('../../utils/constants');
const { getShenshaKnowledge, SHENSHA_DIMENSION_INTRO } = require('../../utils/shensha-knowledge');
const baziAnalysis = require('../../utils/bazi-analysis.js');

Page({
  data: {
    result: null,
    loading: true,
    error: null,
    inputInfo: null,

    // 表格数据
    pillars: [],
    shenShaByPillar: {},
    indexMap: { '年柱': 'year', '月柱': 'month', '日柱': 'day', '时柱': 'hour' },
    shenshaTypeMap: {},

    // 日主分析
    riZhuDesc: '',

    // 起运信息
    qiYunText: '',
    jiaoYunText: '',
    qiYunAgeDisplay: '',

    // 大运
    dayunList: [],
    selectedDayunIndex: 0,

    // 流年（所有）
    allLiuNianList: [],
    selectedLiuNianIndex: 0,
    liunianGanColor: '',
    liunianZhiColor: '',

    // 五行
    wxBarList: [
      { name: '木', cls: 'wx-mu', icon: '🌳' },
      { name: '火', cls: 'wx-huo', icon: '🔥' },
      { name: '土', cls: 'wx-tu', icon: '⛰' },
      { name: '金', cls: 'wx-jin', icon: '⚜' },
      { name: '水', cls: 'wx-shui', icon: '💧' }
    ],
    wxMax: 0,

    // 五行知识弹窗
    showWxOverlay: false,
    wxOverlayData: null,

    // 分享解锁
    unlocked: false,

    // 智能古籍参考
    gujiTabs: [
      { name: '穷通宝鉴', key: 'qiongtong' },
      { name: '滴天髓', key: 'ditiansui' },
      { name: '三命会通', key: 'sanming' }
    ],
    selectedGujiIndex: 0,
    currentGujiData: null,
    gujiAllData: {},
    wuXingKnowledge: {
      '木': {
        season: '春', direction: '东', color: '青（绿）',
        zang: '肝', fu: '胆', body: '筋、目',
        liuqin: '兄弟（比劫）',
        desc: '木曰曲直，主仁，性条达。木旺者仁慈正直，木衰者优柔寡断。'
      },
      '火': {
        season: '夏', direction: '南', color: '赤（红）',
        zang: '心', fu: '小肠', body: '脉、舌',
        liuqin: '父母（印星）',
        desc: '火曰炎上，主礼，性热烈。火旺者热情明理，火衰者畏缩冷漠。'
      },
      '土': {
        season: '长夏', direction: '中', color: '黄',
        zang: '脾', fu: '胃', body: '肉、口',
        liuqin: '妻财（财星）',
        desc: '土曰稼穑，主信，性敦厚。土旺者诚信稳重，土衰者固执愚钝。'
      },
      '金': {
        season: '秋', direction: '西', color: '白',
        zang: '肺', fu: '大肠', body: '皮、鼻',
        liuqin: '官鬼（官杀）',
        desc: '金曰从革，主义，性刚毅。金旺者果敢坚毅，金衰者优柔退缩。'
      },
      '水': {
        season: '冬', direction: '北', color: '黑（蓝）',
        zang: '肾', fu: '膀胱', body: '骨、耳',
        liuqin: '子孙（食伤）',
        desc: '水曰润下，主智，性灵动。水旺者聪慧机敏，水衰者轻浮不定。'
      }
    }
  },

  onLoad(options) {
    // 检查分享解锁状态
    var unlocked = false;
    try { unlocked = !!wx.getStorageSync('bazi_unlocked'); } catch(e) {}
    this.setData({ unlocked: unlocked });

    const { year, month, day, hour, minute, gender, origHour, origMinute, region, lat, lng, name } = options;

    this.setData({
      inputInfo: {
        name: name ? decodeURIComponent(name) : '',
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        hour: parseInt(hour),
        minute: parseInt(minute || 0),
        gender,
        // 原始北京时间（展示用）
        origHour: parseInt(origHour || hour),
        origMinute: parseInt(origMinute || minute || 0),
        region: decodeURIComponent(region || ''),
        lat: parseFloat(lat || 0),
        lng: parseFloat(lng || 0)
      }
    });

    this.doPaipan({
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
      hour: parseInt(hour),
      minute: parseInt(minute || 0),
      gender
    });
  },

  /**
   * 执行解读
   */
  doPaipan(params) {
    try {
      const result = paipan(params);

      // 构建神煞类型映射
      const shenshaTypeMap = {};
      result.shenSha.forEach(s => {
        shenshaTypeMap[s.name] = s.type === '吉' ? 'good' : s.type === '凶' ? 'bad' : 'neutral';
      });

      // 处理大运列表 — V2引擎优化
      var currentYear = new Date().getFullYear();
      var riWuXing = result.riZhu.wuXing;
      var v2DaYunMap = {};
      try {
        // 预计算V2大运分析（如果成功，会为每个大运提供更精准的描述）
        var v2DaYunResult = baziAnalysis.getDaYunAnalysisV2({
          daYunList: result.daYun.daYunList,
          qiYunAge: result.daYun.qiYunAge,
          yongShen: result.yongShen,
          pillars: result.pillars,
          riGan: result.riZhu.gan,
          riWuXing: result.riZhu.wuXing,
          wangShuai: baziAnalysis.getWangShuai(
            result.riZhu.gan, result.riZhu.wuXing,
            result.pillars[1].zhi, result.pillars,
            result.wuXingStats
          ),
          pillarRelations: result.pillarRelations
        });
        if (v2DaYunResult && v2DaYunResult.keyDaYun) {
          v2DaYunResult.keyDaYun.forEach(function(dy) {
            v2DaYunMap[dy.index] = dy;
          });
        }
      } catch (e) { console.warn('V2大运预计算失败:', e.message); }

      const dayunList = result.daYun.daYunList.map((dy, idx) => {
        const shiShen = this.getShiShenForDayun(result.riZhu.gan, dy.gan);
        const baseAge = Math.round(result.daYun.qiYunAge) || 1;
        const safeAge = (dy.age != null && !isNaN(dy.age)) ? dy.age : (baseAge + (idx) * 10);
        const safeYear = (dy.year != null && !isNaN(dy.year)) ? dy.year : (params.year + safeAge);
        var dyObj = {
          ...dy,
          age: safeAge,
          year: safeYear,
          isCurrent: currentYear >= safeYear && currentYear < safeYear + 10,
          ganColor: GAN_ZHI_COLOR[dy.gan] || '#333',
          zhiColor: GAN_ZHI_COLOR[dy.zhi] || '#333',
          shiShen,
          fullDesc: ''
        };
        // 优先使用V2分析描述
        var v2dy = v2DaYunMap[idx + 1];
        if (v2dy && v2dy.desc) {
          dyObj.fullDesc = dy.ganZhi + '阶段（' + safeAge + '~' + (safeAge + 9) + '岁），' + v2dy.desc;
          dyObj.v2Score = v2dy.score;
          dyObj.v2Type = v2dy.type;
          dyObj.v2TypeColor = v2dy.typeColor;
        } else {
          dyObj.fullDesc = this.getDayunDesc(dyObj, riWuXing);
        }
        return dyObj;
      });

      // 起运文字
      var rawQiYunAge = result.daYun.qiYunAge;
      // 防御：若引擎未返回 qiYunAge，从大运列表反推
      if (rawQiYunAge == null || isNaN(rawQiYunAge)) {
        rawQiYunAge = dayunList.length > 0 ? dayunList[0].age : 1;
      }
      var qiYunYears = Math.floor(rawQiYunAge);
      var qiYunMonths = Math.round((rawQiYunAge - qiYunYears) * 12);
      if (isNaN(qiYunMonths)) qiYunMonths = 0;
      var qiYunText = qiYunYears > 0
        ? qiYunYears + '年' + (qiYunMonths > 0 ? qiYunMonths + '个月' : '')
        : qiYunMonths + '个月';
      var qiYunAgeDisplay = Math.round(rawQiYunAge);

      // 交运文字
      const firstDayun = dayunList[0];
      const jiaoYunText = firstDayun
        ? `逢${firstDayun.gan}年 ${firstDayun.year}年进入新阶段`
        : '';

      // 日主分析
      const riZhuDesc = this.getRiZhuDesc(result);

      // 生成所有流年（从出生年到80岁）
      const allLiuNianList = this.generateAllLiuNian(result, params.year, currentYear);

      // 默认选中当前年
      let selectedIndex = allLiuNianList.findIndex(ln => ln.isCurrent);
      if (selectedIndex < 0) selectedIndex = allLiuNianList.length - 1;
      const selectedLiuNian = allLiuNianList[selectedIndex];

      // 五行最大值
      const wxValues = Object.values(result.wuXingStats);
      const wxMax = Math.max(...wxValues, 1);

      // 智能古籍参考
      const gujiAllData = this.generateGujiData(result);
      const currentGujiData = gujiAllData.qiongtong || {};

      // 默认选中当前大运
      let selectedDayunIdx = dayunList.findIndex(dy => dy.isCurrent);
      if (selectedDayunIdx < 0) selectedDayunIdx = 0;

      // 构建V2深度分析参数（供 exclusive.js 调用）
      result._deepAnalysisParams = {
        pillars: result.pillars,
        riZhu: result.riZhu,
        yongShen: result.yongShen,
        geJu: result.geJu,
        pillarRelations: result.pillarRelations,
        wuXingStats: result.wuXingStats,
        daYun: result.daYun,
        shenShaByPillar: result.shenShaByPillar
      };

      this.setData({
        result,
        pillars: result.pillars,
        shenShaByPillar: result.shenShaByPillar,
        shenshaTypeMap,
        riZhuDesc,
        qiYunText,
        jiaoYunText,
        qiYunAgeDisplay,
        dayunList,
        selectedDayunIndex: selectedDayunIdx,
        allLiuNianList,
        selectedLiuNianIndex: selectedIndex,
        liunianGanColor: GAN_ZHI_COLOR[selectedLiuNian.yearGan] || '#333',
        liunianZhiColor: GAN_ZHI_COLOR[selectedLiuNian.yearZhi] || '#333',
        wxMax,
        gujiAllData,
        currentGujiData,
        loading: false
      });

      // 五行力量条形图无需 canvas，普通 view 即可
    } catch (err) {
      console.error('排盘失败:', err);
      this.setData({
        error: err.message || '解读失败，请检查输入参数',
        loading: false
      });
    }
  },

  /**
   * 获取日主分析描述
   */
  getRiZhuDesc(result) {
    var riZhu = result.riZhu;
    var wuXingStats = result.wuXingStats;
    var isMonthLing = result.isMonthLing;

    // 计算日主五行力量
    var selfPower = wuXingStats[riZhu.wuXing] || 0;

    // 十干性格特质
    var ganTraits = {
      '甲': '甲木参天，仁厚正直，有领导才能与开创精神。为人宽宏大量，但有时过于固执己见。做事有恒心，适合从长计议的大业。',
      '乙': '乙木柔顺，温婉细腻，善于察言观色与协调关系。心思缜密，适应力强，能屈能伸。但优柔寡断时需当机立断，不宜过度迁就他人。',
      '丙': '丙火太阳，热情开朗，光明磊落，富有感染力。行动力强，敢于表达，人缘广泛。然性急易躁，须学会沉得住气、三思而后行。',
      '丁': '丁灯火烛，温和内敛，心思灵巧，善于以柔克刚。待人真诚周到，注重细节品质。但内心敏感多思，宜适当放下完美主义，接纳不完美。',
      '戊': '戊土厚重，稳重踏实，诚信可靠，有担当精神。做事有条理，善于守成与管理。然过于保守则错失良机，需在稳健与创新间找到平衡。',
      '己': '己土田园，包容滋养，性情谦和，乐于助人。善解人意，人缘和洽，是团队中的润滑剂。但容易自我牺牲过度，需建立合理边界，先爱己再爱人。',
      '庚': '庚金刚毅，果断坚毅，讲原则重纪律，不畏困难。意志力极强，适合挑战性工作。然锋芒太盛易伤人和己，宜修习圆融之道，刚柔并济方为上格。',
      '辛': '辛金精致，外柔内刚，追求卓越与美感。心思细腻敏锐，审美品位出众，善于发现细节之美。但过于挑剔则难容于人，宜多些宽容与随和。',
      '壬': '壬水浩瀚，智慧灵动，思维开阔，善于变通。反应快悟性高，学习能力强，不拘一格。然心性不定易三心二意，需专注深耕一事方能大成。',
      '癸': '癸水涓流，内秀深沉，直觉敏锐，善解人意。情感丰富细腻，共情能力强，适合需要耐心与洞察的领域。但容易情绪化，宜培养理性判断力。'
    };

    // 旺衰等级
    var levelDesc = '';
    var levelAdvice = '';
    if (selfPower >= 4) {
      levelDesc = '日主强旺，根基深厚，自信心足，行事果敢有力。';
      levelAdvice = '特质能量偏旺者宜泄不宜补，宜从事竞争性强、消耗精力的行业，如销售、管理、创业等，以财官食伤制化其力。';
    } else if (selfPower >= 2.5) {
      levelDesc = '日主中和偏强，精力充沛，适应能力较强，进退自如。';
      levelAdvice = '特质能量偏强者可适度发挥，亦可借运助之，事业方向较为灵活。';
    } else if (selfPower >= 1.5) {
      levelDesc = '日主中和偏弱，性情温润内敛，做事谨慎细致。';
      levelAdvice = '特质能量偏弱者宜扶助为主，宜结交可信之人，借助团队力量成事，选择稳定发展的路径更为稳妥。';
    } else {
      levelDesc = '日主较弱，根基未稳，对外界环境依赖较大。';
      levelAdvice = '特质能量偏弱者最重帮扶，宜亲近长辈贵人，择稳定职业为根基，待时机到来时顺势而为。修身养性、积累实力是此阶段的关键词。';
    }

    // 月令影响
    var monthDesc = '';
    if (isMonthLing) {
      monthDesc = '且得月令相生，如虎添翼，先天条件优越。';
    } else {
      monthDesc = '然不得月令之气，先天助力有限，更需后天努力与阶段趋势配合。';
    }

    // 十干特质
    var traitText = ganTraits[riZhu.gan] || '';

    // 组装完整描述（约150-180字）
    var desc = riZhu.gan + '日主，' + levelDesc + traitText + monthDesc + levelAdvice;

    return desc;
  },

  /**
   * 生成所有流年列表（从出生年~80岁） — V2 引擎
   */
  generateAllLiuNian(result, birthYear, currentYear) {
    try {
      // 使用V2引擎批量生成
      const v2List = baziAnalysis.generateAllLiuNianV2(result, birthYear);
      if (v2List && v2List.length > 0) return v2List;
    } catch (e) {
      console.warn('V2流年引擎失败，降级为V1:', e.message);
    }

    // V1兜底
    const { getLiuNian, getShiShen, getWuXing } = require('../../utils/bazi-engine');
    const riGan = result.riZhu.gan;
    const riWuXing = result.riZhu.wuXing;
    const daYunList = result.daYun.daYunList;
    const startYear = birthYear;
    const endYear = birthYear + 80;
    const list = [];
    for (let year = startYear; year <= endYear; year++) {
      const liuNian = getLiuNian(year);
      const shiShen = getShiShen(riGan, liuNian.yearGan);
      const wuXing = getWuXing(liuNian.yearGan);
      const daYunInteraction = daYunList.find(d => d.year <= year && d.year + 9 >= year) || null;
      list.push({
        year, yearGanZhi: liuNian.yearGanZhi, yearGan: liuNian.yearGan, yearZhi: liuNian.yearZhi,
        shiShen, wuXing,
        ganColor: GAN_ZHI_COLOR[liuNian.yearGan] || '#333',
        zhiColor: GAN_ZHI_COLOR[liuNian.yearZhi] || '#333',
        daYunInteraction,
        briefDesc: shiShen || wuXing,
        fullDesc: year + '年（' + liuNian.yearGanZhi + '）',
        isCurrent: year === currentYear,
        age: year - birthYear
      });
    }
    return list;
  },

  /**
   * 点击流年
   */
  onLiuNianTap(e) {
    const index = e.currentTarget.dataset.index;
    const liuNian = this.data.allLiuNianList[index];
    this.setData({
      selectedLiuNianIndex: index,
      liunianGanColor: liuNian.ganColor,
      liunianZhiColor: liuNian.zhiColor
    });
  },

  /**
   * 获取大运十神
   */
  getShiShenForDayun(riGan, dayunGan) {
    const { getShiShen } = require('../../utils/bazi-engine');
    return getShiShen(riGan, dayunGan) || '';
  },

  /**
   * 生成大运解读（结合八字十神，兼顾正反两面）
   */
  getDayunDesc(dy, riWuXing) {
    var getWuXing = require('../../utils/bazi-engine').getWuXing;
    var dyWuXing = getWuXing(dy.gan);
    var shiShen = dy.shiShen || '';

    // 根据具体十神给出差异化解读（约150字）
    var descMap = {
      '比肩': dy.gan + dy.zhi + '阶段比肩主事。自我意识显著提升，行事独立果断，利于开创事业、拓展人脉。此阶段兄弟朋友为重要助力，但也带来激烈竞争与合作博弈。事业方面宜发挥自主能力，投资创业可试，但合伙事宜务必权责分明，账目清晰。财务上进出频繁，宜开源节流、量入为出。感情上比肩分缘，已婚者需留意第三者介入。健康平稳，宜适度运动以泄比肩过旺之气。',
      '劫财': dy.gan + dy.zhi + '阶段劫财主事。社交异常活跃，朋友缘旺盛，利于团体协作与人际融通。此阶段结交者众、助缘亦多，但劫财夺财，须警惕感情用事导致的财务损失。事业方面可借力而行，不宜单打独打。财运起伏较大，投资消费须理性克制，借贷担保务必三思而行，谨防遭人连累。情感上桃花虽旺，然多为虚花，已婚者宜守正避嫌。健康注意饮食不节与意外磕碰。',
      '食神': dy.gan + dy.zhi + '阶段食神主事。才思舒畅、创造力旺盛，心思细腻而有条理。此阶段利于技艺研习、艺术创作与学识深造，是韬光养晦、厚积薄发的黄金十年。事业上宜深耕专业领域，以才艺服人。但食神主安逸享乐，须防懒散怠惰，宜立目标、守纪律。性情上口才见长，但言多易失，口舌争辩适可而止。财运细水长流，不宜投机急求。健康上注意脾胃调养，饮食有节。',
      '伤官': dy.gan + dy.zhi + '阶段伤官主事。表达欲强烈、见解独到犀利，利于创新突破与改革进取。此阶段最宜发挥个人才华，出奇制胜，不循常规。事业上适合开创性工作，艺术设计与科技研发尤为得势。但伤官性傲，锋芒毕露容易冲撞权威、招惹是非，言辞宜谦和圆融。财运有得有失，入账多但开销也大。情感上标准过高易生挑剔，须多包容伴侣。健康注意心脑血管与神经系统。',
      '正财': dy.gan + dy.zhi + '阶段正财主事。正途财运稳健，一分耕耘一分收获，适合踏实经营、稳步积累。此阶段财富观念成熟，善于规划收支，置产置业可趁。事业上宜专注本职、精益求精，以勤劳换回报。求财忌贪，量力而行方为长久之计。消费欲望增强，需合理规划避免入不敷出。感情方面男命妻缘佳，女命不宜过度关注物质。健康上注意劳逸结合，勿为钱财透支身心。',
      '偏财': dy.gan + dy.zhi + '阶段偏财主事。意外之财可遇、投资机遇增多，适合把握市场脉动灵活取利。此阶段财运起伏较大，大进大出是其常态，宜设止损止盈，见好就收。事业方面副业或兼职收益或超主业，但也容易分心。人情往来频繁，社交开销不小。感情上桃花浮动，男命情缘增多须慎选，女命宜防甜言蜜语。健康注意意外伤害，出行交通多加小心，勿过度熬夜。',
      '正官': dy.gan + dy.zhi + '阶段正官主事。事业步入正轨，职场规范有序，易得上级赏识与提拔重用。此阶段最利公务员、管理者与体制内人士，晋升机遇可期。行事上宜恪守规矩、以诚待人，方能官星护身、福泽绵长。但正官亦是压力之源，责任加重之下身心负荷增大，需劳逸结合。财运平稳合规，不宜剑走偏锋。感情上女命夫缘和顺，男命宜尽责任。健康注意颈椎与失眠。',
      '七杀': dy.gan + dy.zhi + '阶段七杀主事。挑战与机遇交织的十年，魄力大增，有望逆境突围、建功立业。此阶段最宜军警、外科、工程等压力型行业，越战越勇。七杀克身，压力不可小觑，须有印星化解或食神制杀方为上格。行事忌冲动冒险，谋定而后动。事业风浪虽大，却也是升迁最快的时期。健康与情绪是薄弱环节，宜定期体检、适当疏解压力。感情多波折，须以柔克刚。',
      '正印': dy.gan + dy.zhi + '阶段正印主事。贵人扶持、名望提升，利于学问深造、考试取证与安居置业。此阶段吉人多是长辈师者，得人提携可事半功倍。事业上宜深耕学业与专业资质，以知识换取地位。心态趋于平和稳重，但也容易安于现状、缺乏进取，行动力不可松懈。财运虽不暴发，但稳中有升，适合中长线布局。感情上家庭和睦，利婚嫁添丁。健康方面注意发胖与缺乏运动。',
      '偏印': dy.gan + dy.zhi + '阶段偏印主事。思维独特敏锐，擅长钻研冷僻学科与精微技艺。此阶段适合学术研究、技术攻关与独善其身的发展路径。偏印通灵悟性高，但也多疑敏感，人际交往稍显疏离孤高，宜放下偏见、增进交流。事业上独辟蹊径往往有奇效，不宜随波逐流。财运不显但也不缺，宜以才智生财。感情上标准特殊，不易找到契合之人。健康注意神经衰弱与睡眠质量。',
    };

    var key = shiShen;
    if (!descMap[key]) {
      // 按五行生克兜底
      if (dyWuXing === riWuXing) {
        key = '比肩';
      } else if (WU_XING_SHENG[riWuXing] === dyWuXing) {
        key = '食神';
      } else if (WU_XING_SHENG[dyWuXing] === riWuXing) {
        key = '正印';
      } else if (WU_XING_KE[riWuXing] === dyWuXing) {
        key = '正官';
      } else if (WU_XING_KE[dyWuXing] === riWuXing) {
        key = '正财';
      } else {
        var safeAge = (dy.age != null && !isNaN(dy.age)) ? dy.age : '?';
        return dy.ganZhi + '阶段（' + safeAge + '~' + (safeAge + 9) + '岁），五行流通中和，此阶段宜顺势而为，不宜强求。凡事随缘尽分，静待时机。若遇贵人指引，当虚心受教；若逢波折坎坷，亦勿灰心丧气。十年起落本是常态，能守中持正即是上策。';
      }
    }

    var safeAge2 = (dy.age != null && !isNaN(dy.age)) ? dy.age : '?';
    return dy.ganZhi + '阶段（' + safeAge2 + '~' + (safeAge2 + 9) + '岁），' + descMap[key];
  },

  /**
   * 大运点击
   */
  onDayunTap(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ selectedDayunIndex: index });
  },

  /**
   * 重新排盘
   */
  rePaipan() {
    wx.navigateBack();
  },

  /**
   * 进入专属解读 — 始终允许进入（未解锁时仅展示前20%内容）
   */
  goExclusive() {
    // 将排盘结果存入全局数据和缓存
    var app = getApp();
    if (app.globalData) {
      app.globalData.baziResult = this.data.result;
    }
    try {
      wx.setStorageSync('baziResult', this.data.result);
    } catch (e) {}
    
    wx.navigateTo({
      url: '/pages/bazi/exclusive'
    });
  },

  /**
   * 点击神煞标签 - 弹出知识解读
   */
  onShenshaTap(e) {
    const tag = e.currentTarget.dataset.tag;
    const knowledge = getShenshaKnowledge(tag);
    if (!knowledge) {
      wx.showModal({
        title: tag,
        content: SHENSHA_DIMENSION_INTRO,
        showCancel: false,
        confirmText: '关闭',
        confirmColor: '#c8a050'
      });
      return;
    }

    const SEP = '\n────────────────────\n';
    const content =
      '【精评】\n' + (knowledge.jingping || '') +
      SEP + '【古决】\n' + (knowledge.gujue || '') +
      SEP + '【查法】\n' + (knowledge.chafa || '') +
      SEP + SHENSHA_DIMENSION_INTRO;

    wx.showModal({
      title: tag,
      content: content,
      showCancel: false,
      confirmText: '关闭',
      confirmColor: '#c8a050'
    });
  },

  /**
   * 点击五行图例 - 弹出知识卡片
   */
  onWuXingTap(e) {
    const name = e.currentTarget.dataset.wxname;
    const knowledge = this.data.wuXingKnowledge[name];
    if (!knowledge) return;
    const { result } = this.data;
    const count = result.wuXingStats[name] || 0;
    const total = Object.values(result.wuXingStats).reduce((s, v) => s + v, 0);
    const ratio = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
    this.setData({
      showWxOverlay: true,
      wxOverlayData: { name, ...knowledge, count, total, ratio }
    });
  },

  /**
   * 关闭五行知识弹窗
   */
  closeWxOverlay() {
    this.setData({ showWxOverlay: false, wxOverlayData: null });
  },

  /**
   * 空函数 - 阻止事件冒泡
   */
  noop() {},

  /**
   * 生成古籍参考数据（穷通宝鉴、滴天髓、三命会通）
   */
  generateGujiData(result) {
    const riGan = result.riZhu.gan;
    const riZhi = result.riZhu.zhi;
    const monthZhi = result.pillars[1].zhi;
    const baZi = result.baZi;

    // 获取月令名称
    const zhiNames = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
    const monthIdx = zhiNames.indexOf(monthZhi);
    const monthName = monthZhi || '';

    // 构建本解读透/藏信息
    const benbazi = [];
    // 天干透出
    result.pillars.forEach(p => {
      if (p.gan) {
        benbazi.push({ text: p.gan, type: 'tou' });
      }
    });
    // 地支藏干
    result.pillars.forEach(p => {
      if (p.cangGan && p.cangGan.length > 0) {
        p.cangGan.forEach(cg => {
          benbazi.push({ text: cg.gan, type: 'cang' });
        });
      }
    });

    const gujiAllData = {};

    // ========== 穷通宝鉴 ==========
    gujiAllData.qiongtong = this.buildQiongtong(riGan, monthZhi, baZi, benbazi, monthName);

    // ========== 滴天髓 ==========
    gujiAllData.ditiansui = this.buildDitiansui(riGan, monthZhi, baZi, benbazi, monthName);

    // ========== 三命会通 ==========
    gujiAllData.sanming = this.buildSanming(riGan, monthZhi, baZi, benbazi, monthName);

    return gujiAllData;
  },

  /**
   * 穷通宝鉴 - 平衡状态核心能量偏向论
   */
  buildQiongtong(riGan, monthZhi, baZi, benbazi, monthName) {
    const tiaohouMap = {
      '甲子': '丙癸', '甲丑': '丙丁', '甲寅': '庚壬', '甲卯': '庚丁',
      '甲辰': '甲庚壬', '甲巳': '庚壬癸', '甲午': '庚丁', '甲未': '庚丁癸',
      '甲申': '庚丁', '甲酉': '庚丁', '甲戌': '庚甲丁', '甲亥': '庚丁壬',
      '乙子': '丙戊', '乙丑': '丙丁', '乙寅': '丙癸', '乙卯': '丙癸',
      '乙辰': '丙辛癸', '乙巳': '庚癸', '乙午': '庚癸', '乙未': '庚丙癸',
      '乙申': '庚丙', '乙酉': '庚丙', '乙戌': '庚丙', '乙亥': '庚丙',
      '丙子': '壬庚', '丙丑': '壬甲', '丙寅': '壬庚', '丙卯': '壬庚',
      '丙辰': '壬甲庚', '丙巳': '壬庚', '丙午': '壬癸', '丙未': '壬庚',
      '丙申': '壬庚', '丙酉': '壬庚', '丙戌': '壬甲', '丙亥': '壬甲',
      '丁子': '甲庚丙', '丁丑': '甲庚丙', '丁寅': '甲庚丙', '丁卯': '庚甲',
      '丁辰': '甲庚丙', '丁巳': '甲庚丙', '丁午': '甲壬庚', '丁未': '甲庚丙',
      '丁申': '甲庚丙', '丁酉': '甲庚丙', '丁戌': '甲庚丙', '丁亥': '甲庚丙',
      '戊子': '甲丙', '戊丑': '甲丙', '戊寅': '甲丙', '戊卯': '甲丙',
      '戊辰': '甲丙癸', '戊巳': '甲壬丙', '戊午': '甲壬癸', '戊未': '甲丙',
      '戊申': '甲丙壬', '戊酉': '甲丙癸', '戊戌': '甲丙', '戊亥': '甲丙',
      '己子': '丙丁', '己丑': '丙丁', '己寅': '丙丁', '己卯': '甲丙',
      '己辰': '丙丁', '己巳': '丙丁', '己午': '甲丁', '己未': '丙丁',
      '己申': '丙丁', '己酉': '丙丁', '己戌': '丙丁', '己亥': '丙丁',
      '庚子': '丁甲', '庚丑': '丙丁甲', '庚寅': '丙丁甲', '庚卯': '丁甲',
      '庚辰': '甲丁', '庚巳': '丁甲', '庚午': '丁壬', '庚未': '丁甲',
      '庚申': '丁甲', '庚酉': '丁甲', '庚戌': '丁甲', '庚亥': '丁甲',
      '辛子': '丙壬', '辛丑': '丙壬', '辛寅': '壬甲', '辛卯': '壬甲',
      '辛辰': '壬甲丙', '辛巳': '壬庚', '辛午': '壬己', '辛未': '壬丙',
      '辛申': '壬庚', '辛酉': '壬庚', '辛戌': '壬甲', '辛亥': '壬甲',
      '壬子': '庚丙', '壬丑': '庚丁', '壬寅': '庚辛', '壬卯': '庚辛',
      '壬辰': '庚辛', '壬巳': '庚辛', '壬午': '庚辛癸', '壬未': '庚辛',
      '壬申': '庚辛', '壬酉': '庚辛', '壬戌': '庚辛', '壬亥': '庚辛',
      '癸子': '丙辛', '癸丑': '丙丁', '癸寅': '丙辛', '癸卯': '丙辛',
      '癸辰': '丙辛', '癸巳': '丙辛', '癸午': '庚壬', '癸未': '丙辛',
      '癸申': '丙辛', '癸酉': '丙辛', '癸戌': '丙辛', '癸亥': '丙辛'
    };

    const key = riGan + (monthZhi || '');
    const tiaohou = tiaohouMap[key] || '';

    // 论断段落 - 根据日主和月令生成
    const sections = [{
      tag: '',
      title: `论${riGan}生${monthName}月`,
      expanded: true,
      paragraphs: this.getQiongtongParagraphs(riGan, monthZhi, baZi, monthName)
    }];

    return { tiaohou, benbazi, sections };
  },

  getQiongtongParagraphs(riGan, monthZhi, baZi, monthName) {
    // 基于日主和月令的穷通宝鉴核心论断
    var paragraphsMap = {};
    
    // 甲木各月
    paragraphsMap['甲子'] = [
      monthName + '月冬至后生，甲木寒极，宜丙火暖之，以解冻释寒。无丙火者，虽有庚金，亦难成栋梁之材。',
      '水旺之时，更须土来制水，兼以培根。若四柱火土两缺，则甲木漂浮不定，为人多疑寡断。',
      '平衡状态首重丙火，次取辛金劈甲，再配壬水滋润，则甲木得地而发越矣。'
    ];
    paragraphsMap['甲丑'] = [
      monthName + '月天寒地冻，甲木凋零。必赖丙火照暖，方有生机。若无丙丁，纵有庚金，亦是朽木不可雕。',
      '丑为湿土，能蓄水养木，然湿泥埋木，亦需阳光晒之。故平衡状态仍以丙丁为先。'
    ];
    paragraphsMap['甲寅'] = [
      monthName + '月甲木当令，气盛而壮。此时不宜再用印星助身，反喜庚金修削，以成大器。',
      '寅中藏丙戊甲，自有暖意。但若四柱水多，仍需丙火平衡状态；若火炎土燥，又需水润之。',
      '甲木生于春月，最忌叠叠见木，不劳雕刻，反成林中之枯柴，无用之物也。'
    ];
    paragraphsMap['甲卯'] = [
      monthName + '月甲木帝旺，枝叶繁茂。此时最宜庚金修剪，去其冗杂，方能成材。',
      '若柱中无庚，甲木太过，反为不成器之物。所谓"木多不材"，即此谓也。',
      '卯月甲木，亦需适量之水以滋养，火以温暖。水火既济，方显甲木之生机盎然。'
    ];

    // 通用模板 - 其他组合使用通用论断
    var defaultParas = this.getDefaultGujiPara(riGan, monthZhi, baZi, 'qiongtong');
    return paragraphsMap[riGan + (monthZhi || '')] || defaultParas;
  },

  /**
   * 滴天髓 - 五行体性论
   */
  buildDitiansui(riGan, monthZhi, baZi, benbazi, monthName) {
    const sections = [{
      tag: '',
      title: '滴天髓·' + riGan + '木参评',
      expanded: true,
      paragraphs: this.getDitiansuiParagraphs(riGan, monthZhi, baZi, monthName)
    }];
    return { tiaohou: '', benbazi: null, sections };
  },

  getDitiansuiParagraphs(riGan, monthZhi, baZi, monthName) {
    const wuXingText = {
      '甲': ['甲者，阳木也。参天之树，挺拔向上。甲木之性，仁而直，刚而柔。', 
             monthName + '月生人，' + riGan + '木之气或盛或衰，当审四柱五行之配合。',
             '滴天髓云：甲木参天，脱胎要火。春不容金，秋不容土。火炽乘龙，水荡骑虎。'],
      '乙': ['乙者，阴木也。花草藤萝，婉转柔和。乙木之性，仁慈温顺，善于攀附。',
             monthName + '月乙木，如花草之于季节，当察气候之冷暖燥湿，以定荣枯。',
             '滴天髓云：乙木虽柔，刲羊解牛。怀丁抱丙，跨凤乘猴。虚湿之地，骑马亦忧。'],
      '丙': ['丙者，阳火也。太阳之火，普照万物。丙火之性，礼明热烈，光明正大。',
             monthName + '月丙火，犹太阳之于时序，或烈日当空，或夕阳余晖，皆需斟酌。',
             '滴天髓云：丙火猛烈，欺霜侮土。能煅庚金，逢辛反怯。'],
      '丁': ['丁者，阴火也。灯烛之火，内敛含蓄。丁火之性，文明细腻，柔而不弱。',
             monthName + '月丁火，如灯烛之光，虽微而有恒。需甲木引燃，方显其辉。'],
      '戊': ['戊者，阳土也。高山厚土，稳重敦实。戊土之性，信诚宽宏，包容万物。',
             monthName + '月戊土，如大地之承载，四时各有不同。当辨燥湿，以定优劣。'],
      '己': ['己者，阴土也。田园之土，温和柔顺。己土之性，诚信谦和，善于涵养。',
             monthName + '月己土，如田园之稼穑，贵在有源有流，不干不涝。'],
      '庚': ['庚者，阳金也。刀剑斧钺，刚健有力。庚金之性，义气果敢，肃杀威严。',
             monthName + '月庚金，如兵器之于四库，或锈蚀或锋利，全在锻炼之功。'],
      '辛': ['辛者，阴金也。珠玉首饰，精致秀美。辛金之性，义理通达，外柔内刚。',
             monthName + '月辛金，如珠玉之光泽，贵在打磨与养护。'],
      '壬': ['壬者，阳水也。江河湖海，奔流不息。壬水之性，智变灵动，浩瀚无边。',
             monthName + '月壬水，如江河之流向，或奔腾或冻结，皆应时而变。'],
      '癸': ['癸者，阴水也。雨露溪流，润物无声。癸水之性，聪慧内敛，绵延不绝。',
             monthName + '月癸水，如雨露之滋润，贵在适时适量，过则为灾。']
    };
    return wuXingText[riGan] || this.getDefaultGujiPara(riGan, monthZhi, baZi, 'ditiansui');
  },

  /**
   * 三命会通 - 月令格局论
   */
  buildSanming(riGan, monthZhi, baZi, benbazi, monthName) {
    const sections = [{
      tag: '',
      title: '三命会通·' + riGan + monthZhi + '特质组合',
      expanded: true,
      paragraphs: this.getSanmingParagraphs(riGan, monthZhi, baZi, monthName)
    }];
    return { tiaohou: '', benbazi: null, sections };
  },

  getSanmingParagraphs(riGan, monthZhi, baZi, monthName) {
    // 三命会通侧重于月令格局的详细分析
    const paras = [];

    // 根据月令分析格局
    const gejuMap = {
      '子': '子月建子，一阳初生。冬月之木，水冷冰寒，急需丙火平衡状态。若有丙透，可作伤官格看；若无丙而见官杀，亦可取财官格。',
      '丑': '丑月寒冬，土冻木折。平衡状态为急，丙丁为先。丑为金库，若见辛金，可作财星论；若见己土，乃为印绶。',
      '寅': '寅月立春，木气当令。甲禄于寅，日主得地。若见丙火食神，可取食神生财格；若见庚金七杀，可作杀印相生。',
      '卯': '卯月仲春，木气旺盛。乙木专位，日主强健。宜取财官食伤以泄其秀，不宜再见比劫帮扶。',
      '辰': '辰月暮春，土旺木衰。辰为水库，湿土养木。此时宜取官杀制比劫，或食伤泄秀气。',
      '巳': '巳月初夏，火旺木焚。巳中藏丙戊庚，火土金并见。甲木至此，最怕火炎土燥，需水来润泽。',
      '午': '午月仲夏，火烈木焦。午中藏丁己，火土相煎。甲木在此，非水不能救，非湿土不能存。',
      '未': '未月季夏，土热木焦。未为热土，燥气未退。平衡状态用水，培土亦需湿土，方可养木。',
      '申': '申月立秋，金旺木折。申中藏庚壬戊，七杀当权。甲木遇申，若见水化杀生身，可取贵格。',
      '酉': '酉月仲秋，金坚木摧。酉为纯金，克伐无情。甲木在此，必须见水通关，或以火制金。',
      '戌': '戌月暮秋，土燥木困。戌中火库，燥土埋金。甲木需水润之，火暖之，方有生机。',
      '亥': '亥月立冬，水冷木漂。亥为甲木长生之地，然冬水寒冷。需丙火暖局，方可发越。'
    };

    paras.push(gejuMap[monthZhi] || (monthName + '月，四时流转，当审全局配合，以定格局高低。'));

    // 添加八字整体分析
    paras.push('观' + baZi + '八字，天干排列有序，地支藏干分明。当综合十神配置、五行力量、神煞利弊倾向，方能断其一生休咎。');
    paras.push('三命会通云：凡推造化之理，须明天地阴阳之运，五行生克之情，十神配合之义。得其真机，方知特质分析之奥妙。');

    return paras;
  },

  /**
   * 通用古籍论断模板（兜底）
   */
  getDefaultGujiPara(riGan, monthZhi, baZi, source) {
    return [
      riGan + '主人生于' + (monthZhi || '') + '月，四时之气各异，当详察天干地支之配合。',
      '夫' + baZi + '八字，天干为表，地支为本。天干主动，地支静守。动静之间，特质组合之象自现。',
      '古人云：特质分析之道，贵在中和。太过者宜抑，不及者宜扶，中和者自然福寿双全。'
    ];
  },

  /** 古籍 Tab 切换 */
  onGujiTabTap(e) {
    const index = e.currentTarget.dataset.index;
    const key = this.data.gujiTabs[index].key;
    const currentGujiData = this.data.gujiAllData[key];
    this.setData({
      selectedGujiIndex: index,
      currentGujiData: currentGujiData || {}
    });
  },

  /** 古籍章节展开/收起 */
  onGujiSectionToggle(e) {
    const idx = e.currentTarget.dataset.idx;
    const gujiKey = this.data.gujiTabs[this.data.selectedGujiIndex].key;
    const dataKey = `gujiAllData[${gujiKey}].sections[${idx}].expanded`;
    const currentVal = this.data.gujiAllData[gujiKey].sections[idx].expanded;
    this.setData({ [dataKey]: !currentVal });
    // 同步更新 currentGujiData
    const newCurrent = JSON.parse(JSON.stringify(this.data.currentGujiData));
    if (newCurrent.sections && newCurrent.sections[idx]) {
      newCurrent.sections[idx].expanded = !currentVal;
    }
    this.setData({ currentGujiData: newCurrent });
  },

  /** 本解读提示点击 */
  onBenbaziToggle() {
    // 可扩展为弹窗显示详细信息
  },
  // 开发者快捷解锁：连续点击"诚邀共鉴"5次
  _devTapCount: 0,
  _devTapTimer: null,
  onDevBypass: function () {
    this._devTapCount = (this._devTapCount || 0) + 1;
    if (this._devTapTimer) clearTimeout(this._devTapTimer);
    this._devTapTimer = setTimeout(function() { this._devTapCount = 0; }.bind(this), 300);
    if (this._devTapCount >= 5) {
      this._devTapCount = 0;
      clearTimeout(this._devTapTimer);
      try { wx.setStorageSync('bazi_unlocked', true); } catch(e) {}
      this.setData({ unlocked: true });
      wx.showToast({ title: '已解锁（开发模式）', icon: 'none', duration: 1500 });
    }
  },

  onShareAppMessage() {
    var _this = this;
    var name = (_this.data.inputInfo && _this.data.inputInfo.name) || '探索者';
    var result = _this.data.result;
    var baZi = result ? result.baZi : '';
    // 分享即解锁
    try { wx.setStorageSync('bazi_unlocked', true); } catch(e) {}
    _this.setData({ unlocked: true });
    return {
      title: name + ' · ' + baZi + '  —  邀你共鉴 · 君彧易学',
      path: '/pages/bazi/input'
    };
  }
});
