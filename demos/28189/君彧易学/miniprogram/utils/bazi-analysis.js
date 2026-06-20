/**
 * 特质分析引擎 V2.0 — 基于真实特质推理链
 * 
 * 架构：
 *   旺衰判定（得令/得地/得生/得助）→ 核心能量偏向体系 → 格局定性
 *   → 大运/流年与原局交互（刑冲合害+十神+五行）→ 各维度综合断语
 * 
 * 与 V1 区别：
 *   - 旺衰不再用简单计数，而是四维综合评估
 *   - 大运流年考虑真实干支交互（刑冲合害、藏干引动）
 *   - 各维度断语基于十神配置+格局+旺衰+干支关系交叉推导
 *   - 修复 V1 中 getShiShen(riGan, 地支) 传参错误等 bug
 */

const {
  getShiShen, getWuXing, getCangGan, getNaYin,
  getLiuNian, getPillarRelations
} = require('./bazi-engine');

const { WU_XING_SHENG, WU_XING_KE, GAN_ZHI_COLOR } = require('./constants');

// ==================== 基础工具 ====================

const ALL_WU_XING = ['木', '火', '土', '金', '水'];

/** 地支→阴阳 */
const ZHI_YIN_YANG = {};
['子','寅','辰','午','申','戌'].forEach(z => ZHI_YIN_YANG[z] = '阳');
['丑','卯','巳','未','酉','亥'].forEach(z => ZHI_YIN_YANG[z] = '阴');

/**
 * 获取天干在四柱中的十神（包括地支藏干透出检查）
 */
function getGanShiShenInPillars(riGan, pillars) {
  const result = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
  for (let i = 0; i < pillars.length; i++) {
    const p = pillars[i];
    const ss = getShiShen(riGan, p.gan);
    result.push({ pillar: pillarNames[i], gan: p.gan, zhi: p.zhi, shiShen: ss, index: i });
  }
  return result;
}

/**
 * 统计某一十神在四柱天干出现的次数
 */
function countShiShenInGan(riGan, pillars, shiShenNames) {
  let count = 0;
  for (let i = 0; i < pillars.length; i++) {
    const ss = getShiShen(riGan, pillars[i].gan);
    if (shiShenNames.indexOf(ss) >= 0) count++;
  }
  return count;
}

/**
 * 统计某一十神在四柱地支藏干出现的次数
 */
function countShiShenInZhi(riGan, pillars, shiShenNames) {
  let count = 0;
  for (let i = 0; i < pillars.length; i++) {
    const cangGan = getCangGan(pillars[i].zhi);
    for (let j = 0; j < cangGan.length; j++) {
      const ss = getShiShen(riGan, cangGan[j]);
      if (shiShenNames.indexOf(ss) >= 0) count += j === 0 ? 1 : 0.5; // 本气权重高
    }
  }
  return count;
}

/**
 * 获取日干在地支是否有通根（即地支藏干包含日干或同五行）
 */
function getTongGen(riGan, riWuXing, pillars) {
  const roots = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
  for (let i = 0; i < pillars.length; i++) {
    const cangGan = getCangGan(pillars[i].zhi);
    for (let j = 0; j < cangGan.length; j++) {
      if (cangGan[j] === riGan) {
        roots.push({ pillar: pillarNames[i], zhi: pillars[i].zhi, type: '本气通根', weight: j === 0 ? 3 : 1.5 });
      } else if (getWuXing(cangGan[j]) === riWuXing) {
        roots.push({ pillar: pillarNames[i], zhi: pillars[i].zhi, type: '五行通根', weight: j === 0 ? 2 : 1 });
      }
    }
  }
  return roots;
}

/**
 * 月令旺衰查表：每个日干在十二个月令的旺度
 * 旺=5, 相=4, 休=3, 囚=2, 死=1
 */
function getMonthWangDu(riWuXing, monthZhi) {
  // 月支→五行
  const monthWx = getWuXing(monthZhi);
  // 季节旺相休囚死
  // 当令者旺(5), 我生者相(4), 生我者休(3), 克我者囚(2), 我克者死(1)
  // 以月令五行为"旺"
  if (riWuXing === monthWx) return { level: '旺', score: 5, desc: '日主当令得时，气数充足' };
  if (WU_XING_SHENG[monthWx] === riWuXing) return { level: '相', score: 4, desc: '日主得月令所生（相），次旺' };
  if (WU_XING_SHENG[riWuXing] === monthWx) return { level: '休', score: 3, desc: '日主生月令（休），气泄' };
  if (WU_XING_KE[monthWx] === riWuXing) return { level: '囚', score: 2, desc: '日主被月令所克（囚），气弱' };
  if (WU_XING_KE[riWuXing] === monthWx) return { level: '死', score: 1, desc: '日主克月令（死），气绝' };
  return { level: '平', score: 2.5, desc: '难以判断' };
}


// ==================== 1. 旺衰综合判定 ====================

/**
 * 旺衰四维判定：得令、得地、得生、得助
 * @returns {Object} { level, score, detail, ... }
 */
function getWangShuai(riGan, riWuXing, monthZhi, pillars, wuXingStats) {
  // === 维度1：得令（月令旺相休囚死） ===
  const monthWang = getMonthWangDu(riWuXing, monthZhi);
  const deLingScore = monthWang.score;

  // === 维度2：得地（通根） ===
  const tongGen = getTongGen(riGan, riWuXing, pillars);
  let deDiScore = 0;
  for (let i = 0; i < tongGen.length; i++) {
    deDiScore += tongGen[i].weight;
  }
  // 日柱本身通根权重更高
  const hasDayRoot = tongGen.some(r => r.pillar === '日柱');
  if (hasDayRoot) deDiScore += 1;

  // === 维度3：得生（印星生扶） ===
  const yinCount = countShiShenInGan(riGan, pillars, ['正印', '偏印']);
  const yinCountZhi = countShiShenInZhi(riGan, pillars, ['正印', '偏印']);
  const deShengScore = yinCount * 2 + yinCountZhi * 1.5;

  // === 维度4：得助（比劫帮扶） ===
  const biJieCount = countShiShenInGan(riGan, pillars, ['比肩', '劫财']);
  const biJieCountZhi = countShiShenInZhi(riGan, pillars, ['比肩', '劫财']);
  const deZhuScore = biJieCount * 2 + biJieCountZhi * 1.5;

  // 同五行反压（官杀、财星过旺会削弱日主）
  const guanShaCount = countShiShenInGan(riGan, pillars, ['正官', '七杀']);
  const caiCount = countShiShenInGan(riGan, pillars, ['正财', '偏财']);
  const oppression = guanShaCount * 1.5 + caiCount * 1;

  // === 综合评分 ===
  const totalScore = deLingScore * 2.5    // 月令权重最高
    + deDiScore * 2                       // 通根次之
    + deShengScore * 1.5                 // 印生再次
    + deZhuScore * 1.2                   // 比劫帮扶
    - oppression * 0.8;                  // 克泄耗

  // 五行统计辅助
  const selfCount = wuXingStats[riWuXing] || 0;

  // 判定等级（内部逻辑保持不变，展示文案合规化）
  let level, levelDesc, strategy;
  
  // === 四维明细（用于详细展示） ===
  const dimDeLing = '时令能量：' + riWuXing + '在月令' + monthZhi + '为' + monthWang.level + '（' + monthWang.desc + '），得分' + deLingScore.toFixed(1);
  const dimDeDi = '根基支撑：在' + tongGen.map(r => r.pillar + '(' + r.zhi + ')').join('、') + '有根，得分' + deDiScore.toFixed(1) + (hasDayRoot ? '，日柱自坐有根尤佳' : '');
  const dimDeSheng = '资源供给：天干印星' + yinCount + '个、地支藏印约' + yinCountZhi.toFixed(1) + '个，生扶力' + deShengScore.toFixed(1);
  const dimDeZhu = '同伴助力：天干比劫' + biJieCount + '个、地支藏比约' + biJieCountZhi.toFixed(1) + '个，帮扶力' + deZhuScore.toFixed(1);
  const dimOppression = oppression > 0 ? '外部压力：官杀' + guanShaCount + '个、财星' + caiCount + '个，耗压' + oppression.toFixed(1) : '外部压力：无明显耗压';

  if (totalScore >= 12) {
    level = '特质充盈';
    levelDesc = '【特质能量分析】\n' +
      '◆ ' + dimDeLing + '\n' +
      '◆ ' + dimDeDi + '\n' +
      '◆ ' + dimDeSheng + '\n' +
      '◆ ' + dimDeZhu + '\n' +
      (oppression > 0 ? '◆ ' + dimOppression + '\n' : '') +
      '\n【参考分析】以' + riGan + '（' + riWuXing + '）为核心的特质能量充沛，偏向主动果敢型，能承受一定压力。若成长阶段再叠加同向资源则需留意过刚；适当展现才华、追求目标、接受磨砺或有助力。';
    strategy = '泄耗';
  } else if (totalScore >= 8) {
    level = '特质偏盛';
    levelDesc = '【特质能量分析】\n' +
      '◆ ' + dimDeLing + '\n' +
      '◆ ' + dimDeDi + '\n' +
      '◆ ' + dimDeSheng + '\n' +
      '◆ ' + dimDeZhu + '\n' +
      (oppression > 0 ? '◆ ' + dimOppression + '\n' : '') +
      '\n【参考分析】以' + riGan + '（' + riWuXing + '）为核心的特质能量偏盛，尚有余力。多数情况能承受压力，但资源过于集中时需留意平衡。以适度展现、稳步前进为参考方向。';
    strategy = '略泄耗';
  } else if (totalScore >= 5) {
    level = '特质均衡';
    levelDesc = '【特质能量分析】\n' +
      '◆ ' + dimDeLing + '\n' +
      '◆ ' + dimDeDi + '\n' +
      '◆ ' + dimDeSheng + '\n' +
      '◆ ' + dimDeZhu + '\n' +
      (oppression > 0 ? '◆ ' + dimOppression + '\n' : '') +
      '\n【参考分析】以' + riGan + '（' + riWuXing + '）为核心的各项特质能量均衡，不偏不倚。不同阶段的状态走向对整体影响较大——逢强阶段则偏旺、逢弱阶段则偏衰。宜审时度势，根据节奏调整进退。';
    strategy = '平衡状态为主';
  } else if (totalScore >= 3) {
    level = '特质内敛';
    levelDesc = '【特质能量分析】\n' +
      '◆ ' + dimDeLing + '\n' +
      '◆ ' + dimDeDi + '\n' +
      '◆ ' + dimDeSheng + '\n' +
      '◆ ' + dimDeZhu + '\n' +
      (oppression > 0 ? '◆ ' + dimOppression + '\n' : '') +
      '\n【参考分析】以' + riGan + '（' + riWuXing + '）为核心的特质能量偏内敛，根基偏浅。行事风格偏谨慎稳健，不宜冒进。成长阶段逢资源补给期为有利时机（学习、积累、蓄力），逢压力期则量力而行。';
    strategy = '略生扶';
  } else {
    level = '特质温和';
    levelDesc = '【特质能量分析】\n' +
      '◆ ' + dimDeLing + '\n' +
      '◆ ' + dimDeDi + '\n' +
      '◆ ' + dimDeSheng + '\n' +
      '◆ ' + dimDeZhu + '\n' +
      (oppression > 0 ? '◆ ' + dimOppression + '\n' : '') +
      '\n【参考分析】以' + riGan + '（' + riWuXing + '）为核心的特质能量偏温和，外部影响相对较多。宜寻求资源补给与同伴支持之助力。逢资源集中期可把握机会（求学、拜师、合作等），遇压力期宜稳扎稳打。';
    strategy = '生扶';
  }

  return {
    level, levelDesc, strategy,
    totalScore: Math.round(totalScore * 10) / 10,
    selfCount,
    deLing: { score: deLingScore, level: monthWang.level, desc: monthWang.desc },
    deDi: { score: Math.round(deDiScore * 10) / 10, roots: tongGen },
    deSheng: { score: Math.round(deShengScore * 10) / 10, ganCount: yinCount, zhiCount: Math.round(yinCountZhi * 10) / 10 },
    deZhu: { score: Math.round(deZhuScore * 10) / 10, ganCount: biJieCount, zhiCount: Math.round(biJieCountZhi * 10) / 10 },
    oppression: Math.round(oppression * 10) / 10
  };
}


// ==================== 2. 核心能量偏向综合判定 V2 ====================

function getYongShenV2(params) {
  const { riWuXing, monthZhi, pillars, riGan, wangShuai } = params;
  const wuXingStats = params.wuXingStats || {};

  const allWuXing = ALL_WU_XING;
  const riIndex = allWuXing.indexOf(riWuXing);

  // 五行关系
  const shengWo = allWuXing[(riIndex + 4) % 5];   // 生我=印
  const woSheng = allWuXing[(riIndex + 1) % 5];   // 我生=食伤
  const keWo = allWuXing[(riIndex + 3) % 5];      // 克我=官杀
  const woKe = allWuXing[(riIndex + 2) % 5];      // 我克=财

  // === 扶抑核心能量偏向（基于真实旺衰） ===
  let yongShen = [];
  let jiShen = [];
  let xianShen = [];

  const strongLevel = wangShuai.level;

  if (strongLevel === '特质充盈') {
    // 特质充盈 → 喜泄耗
    yongShen = [woSheng, woKe, keWo];
    jiShen = [shengWo, riWuXing];
    xianShen = [shengWo];
  } else if (strongLevel === '特质偏盛') {
    yongShen = [woSheng, woKe];
    jiShen = [shengWo, riWuXing];
    xianShen = [riWuXing];
  } else if (strongLevel === '特质均衡') {
    // 特质均衡以平衡状态为主
    yongShen = [];
    jiShen = [];
    xianShen = [];
  } else if (strongLevel === '特质内敛') {
    yongShen = [shengWo, riWuXing];
    jiShen = [keWo, woKe];
    xianShen = [woSheng];
  } else {
    // 特质温和
    yongShen = [shengWo, riWuXing];
    jiShen = [keWo, woKe, woSheng];
    xianShen = [keWo];
  }

  // === 平衡状态核心能量偏向 ===
  let tiaoHou = null;
  let tiaoHouDesc = '';
  if (['亥','子','丑'].indexOf(monthZhi) >= 0) {
    tiaoHou = '火'; tiaoHouDesc = '生于寒冬，水冷金寒土冻，急需火来暖局平衡状态。';
  } else if (['巳','午','未'].indexOf(monthZhi) >= 0) {
    tiaoHou = '水'; tiaoHouDesc = '生于盛夏，火炎土燥金熔，需水润局降温。';
  } else if (['寅','卯','辰'].indexOf(monthZhi) >= 0) {
    tiaoHou = '金'; tiaoHouDesc = '生于春月，木气过盛，需金裁剪以成材。';
  } else if (['申','酉','戌'].indexOf(monthZhi) >= 0) {
    tiaoHou = '木'; tiaoHouDesc = '生于秋月，金气肃杀，需木疏土生火以通五行。';
  }

  // 平衡状态与扶抑协调
  const tiaoHouInYong = yongShen.indexOf(tiaoHou) >= 0;
  const tiaoHouInJi = jiShen.indexOf(tiaoHou) >= 0;

  if (tiaoHou && !tiaoHouInYong && !tiaoHouInJi) {
    yongShen.unshift(tiaoHou);
  }
  if (tiaoHou && tiaoHouInJi) {
    tiaoHouDesc += '（注：平衡状态需' + tiaoHou + '，但与扶抑核心能量偏向冲突，属利弊参半）';
  }

  // === 病药 ===
  let sickElement = null, sickDesc = '';
  const wxPower = {};
  allWuXing.forEach(wx => { wxPower[wx] = wuXingStats[wx] || 0; });

  let maxJiPower = 0;
  jiShen.forEach(ji => {
    const p = wxPower[ji] || 0;
    if (p > maxJiPower) { maxJiPower = p; sickElement = ji; }
  });

  if (sickElement && maxJiPower >= 2) {
    // 找药
    let cureElement = null;
    if (sickElement === keWo || sickElement === woKe) {
      // 病在官杀克身或财耗身 → 药在印（化官杀、耗财生身）
      cureElement = shengWo;
    } else if (sickElement === woSheng || sickElement === shengWo || sickElement === riWuXing) {
      // 病在食伤泄身、印过旺赖身、或比劫争财 → 药在官杀
      cureElement = keWo;
    }
    if (cureElement) {
      sickDesc = '特质中' + sickElement + '过旺为患，以' + cureElement + '为调和方向。成长阶段逢' + cureElement + '则为调和之机，逢' + sickElement + '则需留意平衡。';
    }
  }

  // === 通关 ===
  const pillarRelations = params.pillarRelations || getPillarRelations(pillars);
  const tongGuanList = [];
  if (pillarRelations.zhiLiuChong) {
    pillarRelations.zhiLiuChong.forEach(chong => {
      const wx1 = getWuXing(chong.zhi1);
      const wx2 = getWuXing(chong.zhi2);
      const setKey = [wx1, wx2].sort().join('');
      const tongGuanMap = { '金木': '水', '木金': '水', '水火': '木', '火水': '木', '土水': '金', '水土': '金' };
      const tg = tongGuanMap[setKey];
      if (tg && tongGuanList.indexOf(tg) < 0) tongGuanList.push(tg);
    });
  }

  // === 去重 ===
  const uniqueYong = [];
  yongShen.forEach(wx => { if (uniqueYong.indexOf(wx) < 0) uniqueYong.push(wx); });
  const uniqueJi = [];
  jiShen.forEach(wx => { if (uniqueJi.indexOf(wx) < 0) uniqueJi.push(wx); });

  // === 综合描述（深度个性化版） ===
  const primaryYong = uniqueYong[0] || '';
  const yongWuXingMap = {
    '金': { direction: '西方', color: '白色/金色/银色', industries: '金融、机械、珠宝、法律、医疗', stones: '金银饰品、白水晶', numbers: '4、9', style: '果断利落，追求效率与品质' },
    '木': { direction: '东方', color: '绿色/青色', industries: '教育、文化、林业、家具、服装', stones: '绿幽灵、翡翠', numbers: '3、8', style: '温和成长，注重积累与培育' },
    '水': { direction: '北方', color: '黑色/蓝色', industries: '贸易、物流、传媒、旅游、餐饮', stones: '黑曜石、蓝宝石', numbers: '1、6', style: '灵活变通，善用智慧与人脉' },
    '火': { direction: '南方', color: '红色/紫色/粉色', industries: '科技、互联网、能源、演艺、餐饮', stones: '红玛瑙、紫水晶', numbers: '2、7', style: '热情主动，善于表达与展示' },
    '土': { direction: '中央/本地', color: '黄色/棕色', industries: '房地产、农业、建筑、管理、仓储', stones: '黄玉、钛晶', numbers: '5、0', style: '稳重踏实，重视诚信与根基' }
  };

  let yongDesc = '';
  if (strongLevel === '特质均衡') {
    yongDesc = '各项特质能量均衡中和，不偏不倚。以平衡状态（' + (tiaoHou || '—') + '）为第一优先。各阶段状态平衡为先，不宜走极端。';
  } else {
    // 构建详细的核心能量偏向解读
    yongDesc = '【核心能量偏向总纲】此命' + strongLevel + '，取喜用参考为「' + uniqueYong.join('、') + '」，宜规避「' + uniqueJi.join('、') + '」';
    
    // 主核心能量偏向详细展开
    if (primaryYong && yongWuXingMap[primaryYong]) {
      var py = yongWuXingMap[primaryYong];
      yongDesc += '\n【核心方向】宜以' + primaryYong + '为参考——可往' + py.direction + '发展，常用色彩为' + py.color + '，相关领域包括' + py.industries + '。性格上可培养"' + py.style + '"的特质。幸运数字：' + py.numbers + '，开运饰品：' + py.stones + '。';
    }

    // 次核心能量偏向
    if (uniqueYong.length > 1) {
      yongDesc += '\n【辅助方向】次喜' + uniqueYong.slice(1).join('、') + '，与主方向相辅相成，逢之亦有助力。';
    }

    // 忌神规避
    if (uniqueJi.length > 0) {
      var jiAvoidTips = uniqueJi.map(function(j) { return yongWuXingMap[j] ? j + '（避' + yongWuXingMap[j].direction + '方位、少穿' + yongWuXingMap[j].color + '）' : j; }).join('；');
      yongDesc += '\n【所宜规避】' + jiAvoidTips + '。';
    }

    // 不同特质能量偏向的策略
    if (strongLevel === '特质充盈' || strongLevel === '特质偏盛') {
      yongDesc += '\n【成长参考】能量偏盛者可参考以"展现"为主的方向：发挥才华、追求目标、接受挑战，避免过度囤积资源。';
    } else {
      yongDesc += '\n【成长参考】能量偏温和者可参考以"积累"为主的方向：先扎根沉淀、结盟互助、待基础稳固后再图进取。';
    }
  }
  if (tiaoHouDesc) yongDesc += '\n' + tiaoHouDesc;
  if (sickDesc) yongDesc += '\n' + sickDesc;
  if (tongGuanList.length > 0) yongDesc += '\n【调和建议】特质间有冲突需调和，以' + tongGuanList.join('、') + '为调和之参考，亦为喜用方向。';

  // 构建guidance供综合建议区使用
  var guidance = {};
  if (primaryYong && yongWuXingMap[primaryYong]) {
    var g = yongWuXingMap[primaryYong];
    guidance = {
      direction: g.direction,
      color: g.color,
      industries: g.industries,
      trait: g.style
    };
  } else {
    guidance = { direction: '', color: '', industries: '', trait: '' };
  }

  return {
    yongShen: uniqueYong,
    jiShen: uniqueJi,
    xianShen,
    primaryYong,
    tiaoHou,
    tiaoHouDesc,
    sickElement,
    sickDesc,
    tongGuan: tongGuanList,
    desc: yongDesc,
    strongLevel,
    guidance
  };
}


// ==================== 3. 大运分析 V2 ====================

/**
 * 生成大运详细分析（基于与四柱的刑冲合害真实交互）
 */
function getDaYunAnalysisV2(params) {
  const { daYunList, qiYunAge, yongShen, pillars, riGan, riWuXing, wangShuai, pillarRelations } = params;

  if (!daYunList || daYunList.length === 0) return [];

  const yongSet = {};
  (yongShen.yongShen || []).forEach(w => { yongSet[w] = true; });
  const jiSet = {};
  (yongShen.jiShen || []).forEach(w => { jiSet[w] = true; });

  const keyDaYun = [];
  const actualQiYunAge = (qiYunAge && !isNaN(qiYunAge)) ? qiYunAge :
    (daYunList[0] && daYunList[0].age != null && !isNaN(daYunList[0].age)) ? daYunList[0].age : 1;

  for (let d = 0; d < daYunList.length; d++) {
    const dy = daYunList[d];
    const dyGanWx = getWuXing(dy.gan);
    const dyZhiWx = getWuXing(dy.zhi);

    // === 用神/忌神判断 ===
    const isYongGan = !!yongSet[dyGanWx];
    const isYongZhi = !!yongSet[dyZhiWx];
    const isJiGan = !!jiSet[dyGanWx];
    const isJiZhi = !!jiSet[dyZhiWx];

    // === 与四柱的刑冲合害 ===
    const dyPillar = { gan: dy.gan, zhi: dy.zhi, ganZhi: dy.ganZhi };
    const interactions = [];
    const pillarNames = ['年柱', '月柱', '日柱', '时柱'];

    for (let p = 0; p < pillars.length; p++) {
      const pillar = pillars[p];
      // 天干合
      const ganHePairs = { '甲己': '土', '乙庚': '金', '丙辛': '水', '丁壬': '木', '戊癸': '火' };
      const pair1 = dy.gan + pillar.gan;
      const pair2 = pillar.gan + dy.gan;
      if (ganHePairs[pair1]) {
        interactions.push({ type: '天干合', target: pillarNames[p], detail: dy.gan + pillar.gan + '合化' + ganHePairs[pair1], effect: '好事多磨，合作之象' });
      } else if (ganHePairs[pair2]) {
        interactions.push({ type: '天干合', target: pillarNames[p], detail: pillar.gan + dy.gan + '合化' + ganHePairs[pair2], effect: '好事多磨，合作之象' });
      }

      // 地支六合
      const liuHePairs = { '子丑': true, '丑子': true, '寅亥': true, '亥寅': true, '卯戌': true, '戌卯': true,
        '辰酉': true, '酉辰': true, '巳申': true, '申巳': true, '午未': true, '未午': true };
      if (liuHePairs[dy.zhi + pillar.zhi]) {
        interactions.push({ type: '地支六合', target: pillarNames[p], detail: dy.zhi + pillar.zhi + '六合', effect: '有暗合之缘，利合作与感情' });
      }

      // 地支六冲
      const chongPairs = { '子午': true, '午子': true, '丑未': true, '未丑': true, '寅申': true, '申寅': true,
        '卯酉': true, '酉卯': true, '辰戌': true, '戌辰': true, '巳亥': true, '亥巳': true };
      if (chongPairs[dy.zhi + pillar.zhi]) {
        let effect = '变动剧烈，宜灵活应变';
        if (pillarNames[p] === '日柱') effect = '夫妻宫受冲，感情婚姻多有波折，需小心经营';
        else if (pillarNames[p] === '月柱') effect = '事业根基受冲，工作环境多变，宜守不宜攻';
        else if (pillarNames[p] === '年柱') effect = '祖业根基受冲，家庭关系或有变动';
        else effect = '晚运或子女受冲，需关注晚年规划';
        interactions.push({ type: '地支六冲', target: pillarNames[p], detail: dy.zhi + pillar.zhi + '六冲', effect });
      }

      // 地支相害
      const haiPairs = { '子未': true, '未子': true, '丑午': true, '午丑': true, '寅巳': true, '巳寅': true,
        '卯辰': true, '辰卯': true, '申亥': true, '亥申': true, '酉戌': true, '戌酉': true };
      if (haiPairs[dy.zhi + pillar.zhi]) {
        interactions.push({ type: '地支相害', target: pillarNames[p], detail: dy.zhi + pillar.zhi + '相害', effect: '易有小人暗算或误会，需坦诚沟通' });
      }

      // 三合半合
      const sanHeGroups = { '申子辰': '水', '亥卯未': '木', '寅午戌': '火', '巳酉丑': '金' };
      for (const [group, hua] of Object.entries(sanHeGroups)) {
        if (group.includes(dy.zhi) && group.includes(pillar.zhi)) {
          interactions.push({ type: '三合半会', target: pillarNames[p], detail: dy.zhi + pillar.zhi + '半会' + hua + '局', effect: '得' + hua + '气相助，气势增强' });
        }
      }
    }

    // === 综合评分 ===
    let score = 0;
    if (isYongGan) score += 2;
    if (isYongZhi) score += 3;
    if (isJiGan) score -= 2;
    if (isJiZhi) score -= 3;

    // 平衡状态
    if (yongShen.tiaoHou && (dyGanWx === yongShen.tiaoHou || dyZhiWx === yongShen.tiaoHou)) {
      if (jiSet[yongShen.tiaoHou]) score += 0.5;
      else score += 1.5;
    }

    // 通关
    (yongShen.tongGuan || []).forEach(tg => {
      if (dyGanWx === tg || dyZhiWx === tg) score += 1.5;
    });

    // 交互加减分
    interactions.forEach(ix => {
      if (ix.type === '地支六冲') score -= 1;
      else if (ix.type === '地支六合') score += 0.5;
      else if (ix.type === '天干合') score += 0.5;
      else if (ix.type === '地支相害') score -= 0.5;
      else if (ix.type === '三合半会') score += 1;
    });

    // 形势判定
    let type, typeTag, typeColor;
    if (score >= 4) { type = '大吉'; typeTag = '吉'; typeColor = 'yong'; }
    else if (score >= 1.5) { type = '小吉'; typeTag = '平吉'; typeColor = 'yong-light'; }
    else if (score >= -1) { type = '平稳过渡'; typeTag = '平'; typeColor = 'neutral'; }
    else if (score >= -3.5) { type = '多事之秋'; typeTag = '小凶'; typeColor = 'ji-light'; }
    else { type = '坎坷考验'; typeTag = '凶'; typeColor = 'ji'; }

    // === 阶段描述 ===
    let dyDesc = '';
    const dyElements = [];
    if (isYongGan) dyElements.push(dy.gan + '(' + dyGanWx + '·核心能量偏向)');
    else if (isJiGan) dyElements.push(dy.gan + '(' + dyGanWx + '·忌神)');
    else dyElements.push(dy.gan + '(' + dyGanWx + ')');
    if (isYongZhi) dyElements.push(dy.zhi + '(' + dyZhiWx + '·核心能量偏向)');
    else if (isJiZhi) dyElements.push(dy.zhi + '(' + dyZhiWx + '·忌神)');
    else dyElements.push(dy.zhi + '(' + dyZhiWx + ')');

    // 基于真实旺衰+用神+交互的综合描述
    if (score >= 4) {
      dyDesc = '此阶段天干地支得核心能量偏向之力（' + dyElements.join('、') + '），阶段相对有利。可积极进取，把握机遇。';
    } else if (score >= 1.5) {
      dyDesc = '此阶段总体向好（' + dyElements.join('、') + '），虽有波折但大势有利。稳中有进为宜，不躁不馁，步步为营。';
    } else if (score >= -1) {
      dyDesc = '此阶段平稳过渡（' + dyElements.join('、') + '），利弊参半。宜守成为上，稳住基本盘，等待转机。不宜冒进投资或重大决策。';
    } else if (score >= -3.5) {
      dyDesc = '此阶段压力较大（' + dyElements.join('、') + '），忌神较旺。凡事三思后行，注意健康与人际关系，不宜冒进投资或创业。';
    } else {
      dyDesc = '此阶段相对严峻（' + dyElements.join('、') + '），忌神力量较强。宜稳健低调，保重身体，以守为主，静待时机流转，避免逆势强求。';
    }

    // 补充交互说明
    if (interactions.length > 0) {
      dyDesc += '此阶段与特质格局交互显著：';
      const uniqueEffects = [];
      interactions.forEach(ix => {
        const brief = ix.target + ix.detail + '（' + ix.effect + '）';
        if (uniqueEffects.indexOf(brief) < 0) uniqueEffects.push(brief);
      });
      dyDesc += uniqueEffects.join('；') + '。';
    }

    const age = (dy.age != null && !isNaN(dy.age)) ? dy.age : Math.round(actualQiYunAge + d * 10);
    keyDaYun.push({
      index: d + 1,
      ganZhi: dy.ganZhi, gan: dy.gan, zhi: dy.zhi,
      ganWuXing: dyGanWx, zhiWuXing: dyZhiWx,
      ageStart: age, ageEnd: age + 9,
      yearStart: dy.year || 0,
      type, typeTag, typeColor, score,
      desc: dyDesc,
      interactions
    });
  }

  // 计算转折点
  const turningPoints = [];
  for (let k = 1; k < keyDaYun.length; k++) {
    const diff = Math.abs(keyDaYun[k].score - keyDaYun[k - 1].score);
    if (diff >= 3) {
      turningPoints.push({
        year: keyDaYun[k].yearStart,
        age: keyDaYun[k].ageStart,
        from: keyDaYun[k - 1].ganZhi + '(' + keyDaYun[k - 1].typeTag + ')',
        to: keyDaYun[k].ganZhi + '(' + keyDaYun[k].typeTag + ')',
        direction: keyDaYun[k].score > keyDaYun[k - 1].score ? '向上' : '下行',
        desc: '约' + keyDaYun[k].ageStart + '岁前后阶段将出现明显转折，由「' + keyDaYun[k - 1].type + '」转为「' + keyDaYun[k].type + '」，人生轨迹将有重要变化，宜提前做好规划与心理准备。'
      });
    }
  }

  // 最佳/最差大运
  let bestDaYun = null, worstDaYun = null;
  keyDaYun.forEach(dy => {
    if (!bestDaYun || dy.score > bestDaYun.score) bestDaYun = dy;
    if (!worstDaYun || dy.score < worstDaYun.score) worstDaYun = dy;
  });

  return { keyDaYun, turningPoints, bestDaYun, worstDaYun };
}


// ==================== 4. 流年分析 V2 ====================

/**
 * 单年流年真实推理分析
 * @param {Object} params - { riGan, riWuXing, riZhi, pillars, yongShen, wangShuai,
 *                                currentDaYun, liuNian, year, age }
 */
function analyzeLiuNianV2(params) {
  const { riGan, riWuXing, riZhi, pillars, yongShen, wangShuai, currentDaYun, liuNian, year, age } = params;
  if (!liuNian) return '流年数据缺失';

  const yearGan = liuNian.yearGan;
  const yearZhi = liuNian.yearZhi;
  const yearGanZhi = liuNian.yearGanZhi || (yearGan + yearZhi);
  const yearWuXing = getWuXing(yearGan);
  const yearShiShen = getShiShen(riGan, yearGan);

  const yongSet = {};
  (yongShen.yongShen || []).forEach(w => { yongSet[w] = true; });
  const jiSet = {};
  (yongShen.jiShen || []).forEach(w => { jiSet[w] = true; });

  const isYongGan = !!yongSet[getWuXing(yearGan)];
  const isJiGan = !!jiSet[getWuXing(yearGan)];
  const isYongZhi = !!yongSet[getWuXing(yearZhi)];
  const isJiZhi = !!jiSet[getWuXing(yearZhi)];

  // === 与日柱/四柱的刑冲合害 ===
  const interactions = [];
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];

  // 天干合
  const ganHeMap = { '甲己': '土', '乙庚': '金', '丙辛': '水', '丁壬': '木', '戊癸': '火' };
  for (let p = 0; p < pillars.length; p++) {
    const pair1 = yearGan + pillars[p].gan;
    const pair2 = pillars[p].gan + yearGan;
    if (ganHeMap[pair1] || ganHeMap[pair2]) {
      interactions.push({ type: '合', target: pillarNames[p], desc: yearGan + '与' + pillars[p].gan + '天干合' + (ganHeMap[pair1] || ganHeMap[pair2]) });
    }
  }

  // 地支冲合害
  const chongMap = { '子午':1,'午子':1,'丑未':1,'未丑':1,'寅申':1,'申寅':1,'卯酉':1,'酉卯':1,'辰戌':1,'戌辰':1,'巳亥':1,'亥巳':1 };
  const heMap = { '子丑':1,'丑子':1,'寅亥':1,'亥寅':1,'卯戌':1,'戌卯':1,'辰酉':1,'酉辰':1,'巳申':1,'申巳':1,'午未':1,'未午':1 };
  const haiMap = { '子未':1,'未子':1,'丑午':1,'午丑':1,'寅巳':1,'巳寅':1,'卯辰':1,'辰卯':1,'申亥':1,'亥申':1,'酉戌':1,'戌酉':1 };

  for (let p = 0; p < pillars.length; p++) {
    const key = yearZhi + pillars[p].zhi;
    if (chongMap[key]) {
      let effect = '变动';
      if (p === 2) effect = '夫妻宫受冲，感情易生波澜，已婚者宜多加沟通包容';
      interactions.push({ type: '冲', target: pillarNames[p], desc: yearZhi + pillars[p].zhi + '六冲', effect });
    }
    if (heMap[key]) {
      interactions.push({ type: '合', target: pillarNames[p], desc: yearZhi + pillars[p].zhi + '六合', effect: '有喜事或合作机缘' });
    }
    if (haiMap[key]) {
      interactions.push({ type: '害', target: pillarNames[p], desc: yearZhi + pillars[p].zhi + '相害', effect: '防小人与误解' });
    }
  }

  // 岁运并临
  const isSuiYunBingLin = currentDaYun && (currentDaYun.gan === yearGan && currentDaYun.zhi === yearZhi);

  // === 综合评分 ===
  let score = 0;
  if (isYongGan) score += 2;
  if (isJiGan) score -= 2;
  if (isYongZhi) score += 1.5;
  if (isJiZhi) score -= 1.5;

  interactions.forEach(ix => {
    if (ix.type === '冲') score -= 0.8;
    else if (ix.type === '合') score += 0.5;
    else if (ix.type === '害') score -= 0.3;
  });

  if (isSuiYunBingLin) score *= 1.5; // 岁运并临力量翻倍（不一定是凶）

  // === 生成描述 ===
  const parts = [];

  // 1. 十神定性
  if (yearShiShen) {
    const shiShenNature = {
      '比肩': '自我意识增强，竞争与机遇并存，利于独立开拓',
      '劫财': '社交活跃，开销增大，合作与竞争激烈',
      '食神': '才思敏捷，创意丰富，利于学习与创作',
      '伤官': '灵感充沛，求变心切，利于创新突破',
      '正财': '正途财运稳定，适合踏实经营',
      '偏财': '意外机缘频现，投资机遇多但波动大',
      '正官': '事业规范有序，利职位晋升',
      '七杀': '挑战与机遇并存，魄力大增',
      '正印': '贵人运显，利学业与安居',
      '偏印': '思维敏锐独特，利于钻研'
    };
    const nature = shiShenNature[yearShiShen] || '';
    parts.push(yearGanZhi + '年' + yearShiShen + '主事，' + nature);
  } else {
    parts.push(yearGanZhi + '年，' + yearWuXing + '气当令');
  }

  // 2. 与核心特质关系
  if (isYongGan && isYongZhi) {
    parts.push('此年干支皆为喜用参考，阶段顺畅，宜积极把握时机');
  } else if (isJiGan && isJiZhi) {
    parts.push('此年干支皆为忌神，压力较大，宜谨慎低调，守成为上');
  } else if (isYongGan) {
    parts.push('天干为用但地支非用，上半年较顺，下半年宜收敛');
  } else if (isYongZhi) {
    parts.push('地支为用但天干非用，下半年渐入佳境，前期宜耐心');
  } else if (wangShuai.level === '身弱') {
    parts.push('身弱者宜求稳，此年不宜冒进投资或重大变动');
  } else if (wangShuai.level === '身强') {
    parts.push('身强者可担财官，宜主动布局，把握机会');
  }

  // 3. 刑冲合害提示
  interactions.forEach(ix => {
    if (ix.type === '冲') parts.push('流年' + ix.desc + '，' + ix.effect);
    else if (ix.type === '合') parts.push('流年' + ix.desc + '，' + (ix.effect || '有喜事或合作机缘'));
    else if (ix.type === '害') parts.push('流年' + ix.desc + '，' + (ix.effect || '防小人与误解'));
  });

  // 4. 岁运并临
  if (isSuiYunBingLin) {
    parts.push('此年岁运并临（阶段干支相同），力量加倍，顺则加倍顺、逆则加倍逆，是为关键之年');
  }

  // 5. 与大运关系
  if (currentDaYun) {
    const dyGanWx = getWuXing(currentDaYun.gan);
    if (dyGanWx === yearWuXing) {
      parts.push('流年与大运同' + yearWuXing + '气，力量叠加，需看' + yearWuXing + '为用为忌来判利弊倾向');
    }
  }

  const scoreStr = score >= 2 ? '吉' : score >= 0 ? '平偏吉' : score >= -1 ? '平' : score >= -2 ? '平偏凶' : '凶';

  return {
    desc: parts.join('。') + '。',
    score: Math.round(score * 10) / 10,
    scoreStr,
    interactions,
    isSuiYunBingLin,
    yearShiShen,
    yearWuXing
  };
}


// ==================== 5. 婚姻分析 V2 ====================

/**
 * 爱情婚姻分析 V2 —— 修复 getShiShen(diZhi) 传参错误
 */
function analyzeMarriageV2(params) {
  const { riZhu, pillars, yongShen, allShenSha, keyDaYun, wuXingStats, riGan, riWuXing, geJuType, pillarRelations, wangShuai } = params;

  const spouseZhi = riZhu.zhi; // 日支=夫妻宫
  const spouseCangGan = getCangGan(spouseZhi);
  const spouseZhiWx = getWuXing(spouseZhi);

  // === 夫妻宫分析（用藏干十神，不用地支直接查） ===
  const spouseBenQi = spouseCangGan[0]; // 本气
  const spouseBenQiShiShen = getShiShen(riGan, spouseBenQi); // ✅ 用藏干天干，非地支

  const isYongSpouse = yongShen.yongShen && yongShen.yongShen.indexOf(spouseZhiWx) >= 0;
  const isJiSpouse = yongShen.jiShen && yongShen.jiShen.indexOf(spouseZhiWx) >= 0;

  // 夫妻宫描述
  let spousePalaceDesc = '日支' + spouseZhi + '为婚姻宫（夫妻宫），藏' + spouseCangGan.join('、');
  if (spouseBenQiShiShen) {
    spousePalaceDesc += '，本气为' + spouseBenQiShiShen + '星。';
  }
  if (isYongSpouse) {
    spousePalaceDesc += '夫妻宫为喜用参考（' + spouseZhiWx + '），说明配偶对个人特质有正向加持，婚后阶段多有所提升。';
  } else if (isJiSpouse) {
    spousePalaceDesc += '夫妻宫为忌神（' + spouseZhiWx + '），婚后需较多磨合，配偶性格或生活方式与命主存在冲突。建议以包容心态经营，减少五行相克式的相处模式。';
  } else {
    spousePalaceDesc += '夫妻宫五行中平，婚姻属平淡稳重型，配偶缘份中等。';
  }

  // === 十神婚姻特质 ===
  const shiShenMarriageMap = {
    '正官': '配偶正直有责任心，多为传统型伴侣。婚姻结构稳固有秩序感，但官星若过旺则管束过强。',
    '七杀': '配偶个性强势果断，敢作敢为。婚姻激情与冲突并存，需学会互相包容，忌针锋相对。女性尤需以柔克刚。',
    '正财': '配偶务实顾家，重视物质基础与生活品质，贤惠持家型。婚姻务实稳定，但需注意沟通情感层面。',
    '偏财': '配偶慷慨大方、善交际应酬，经济能力不错。但偏财浮动，感情中也易不够专一，宜加强信任纽带。',
    '正印': '配偶通情达理、有文化修养，能给予精神支撑与温柔关爱。婚姻温馨滋养，但过分依赖一方易失衡。',
    '偏印': '配偶思维独特、有专长技艺，与众不同。但偏印多疑敏感，需注意沟通方式，避免冷战与猜忌。',
    '食神': '配偶温和善良、懂得生活情趣，婚姻充满温馨与诗意。但食神安逸，进取心或稍显不足。',
    '伤官': '配偶才华横溢、个性魅力十足。婚姻中需克制情绪化倾向，给彼此留有空间。女性伤官在夫妻宫最忌见官。',
    '比肩': '配偶与己志趣相投，相处如知己。但比肩分福，竞争感强，宜共同成长而非互相较劲。',
    '劫财': '配偶行动力强、讲义气。但劫财在夫妻宫暗示需防外界干扰，建立共同理财规划有助婚姻稳定。'
  };
  const spouseShenDesc = '婚姻宫本气「' + spouseBenQiShiShen + '」——' + (shiShenMarriageMap[spouseBenQiShiShen] || '配偶个性鲜明，婚姻经营需双方用心。');

  // === 配偶星追踪 ===
  const spouseStars = [];
  pillars.forEach((p, i) => {
    const ss = getShiShen(riGan, p.gan);
    const zhiCangGan = getCangGan(p.zhi);
    // 天干配偶星
    if (ss === '正财' || ss === '偏财') {
      spouseStars.push({ pillar: ['年','月','日','时'][i], star: ss, loc: '天干', gender: '男命妻星' });
    }
    if (ss === '正官' || ss === '七杀') {
      spouseStars.push({ pillar: ['年','月','日','时'][i], star: ss, loc: '天干', gender: '女命夫星' });
    }
    // 地支藏干配偶星
    zhiCangGan.forEach((cg, j) => {
      const cgSs = getShiShen(riGan, cg);
      if (cgSs === '正财' || cgSs === '偏财') {
        spouseStars.push({ pillar: ['年','月','日','时'][i], star: cgSs, loc: '地支藏' + cg, gender: '男命妻星' });
      }
      if (cgSs === '正官' || cgSs === '七杀') {
        spouseStars.push({ pillar: ['年','月','日','时'][i], star: cgSs, loc: '地支藏' + cg, gender: '女命夫星' });
      }
    });
  });

  let starDesc = '';
  if (spouseStars.length >= 2) {
    starDesc = '配偶星多现（' + spouseStars.map(s => s.pillar + s.loc + s.star).join('、') + '），感情经历可能较丰富。日坐' + spouseBenQiShiShen + '，婚宫稳定则婚姻相对稳固。';
  } else if (spouseStars.length === 1) {
    starDesc = '配偶星单一（' + spouseStars[0].pillar + spouseStars[0].loc + spouseStars[0].star + '），感情倾向专注稳定。';
  } else {
    starDesc = '配偶星藏而不露，感情较为内敛被动。姻缘或偏晚熟，可考虑主动争取或经人介绍。';
  }

  // === 桃花神煞 ===
  const peachTips = [];
  if (allShenSha.indexOf('桃花') >= 0) peachTips.push('命带桃花星，异性缘较好，情感路上易受异性关注，需分辨真情与烂桃花');
  if (allShenSha.indexOf('红鸾') >= 0) peachTips.push('带红鸾星，婚恋运相对顺利');
  if (allShenSha.indexOf('天喜') >= 0) peachTips.push('带天喜星，婚后生活或较愉悦');
  if (allShenSha.indexOf('寡宿') >= 0) peachTips.push('带寡宿星，性格偏内向，建议主动拓展社交圈');
  if (peachTips.length === 0) peachTips.push('桃花运中平，顺其自然即可。');

  // === 格局→感情风格 ===
  let loveStyle = '';
  const loveStyleMap = {
    '伤官格': '才华洋溢、个性鲜明。感情中追求灵魂契合，但也容易挑剔对方。可尝试多看优点、少挑毛病。',
    '正官格': '对待感情认真负责，追求稳定长久。对伴侣要求较高，自身也愿意付出，属踏实可靠型。',
    '食神格': '温和包容型，在感情中懂得享受生活与制造浪漫。',
    '七杀格': '敢爱敢恨，感情中不畏艰难。但个性较强时宜注意给对方空间。',
    '正财格': '重实际，择偶偏向务实可靠型。一旦认定便倾向稳定长久。',
    '偏财格': '慷慨大方、善交际。感情中魅力十足，需注意定性与专注。',
    '正印格': '温厚体贴，善于照顾伴侣。有时依赖心较强，建议保持个人独立空间。',
    '偏印格': '感情世界较为独特深邃，不易被完全理解。'
  };
  loveStyle = loveStyleMap[geJuType] || '感情随缘而行，遇良人则安，需在大运助力时把握姻缘契机。';

  // 结合旺衰微调
  if (wangShuai && wangShuai.level === '身弱') {
    loveStyle += '身弱者在感情中易缺乏安全感，宜找能给予支持与保护的伴侣，印星（包容型）或比劫（知己型）之人最配。';
  }

  // === 婚期参考 ===
  let bestMarriagePeriod = '';
  for (let mi = 0; mi < keyDaYun.length; mi++) {
    if (keyDaYun[mi].score >= 2) {
      bestMarriagePeriod = keyDaYun[mi].ageStart + '–' + keyDaYun[mi].ageEnd + '岁（' + keyDaYun[mi].ganZhi + '大运）桃花姻缘运相对较旺，可参考把握。';
      break;
    }
  }
  if (!bestMarriagePeriod && keyDaYun.length > 0) {
    bestMarriagePeriod = keyDaYun[0].ageStart + '–' + keyDaYun[0].ageEnd + '岁期间或遇姻缘机缘，建议谨慎选择。';
  }

  // === 婚姻评分 ===
  let marriageScore = 0;
  if (isYongSpouse) marriageScore += 3;
  if (isJiSpouse) marriageScore -= 2;
  if (allShenSha.indexOf('桃花') >= 0) marriageScore += 1;
  if (allShenSha.indexOf('红鸾') >= 0 || allShenSha.indexOf('天喜') >= 0) marriageScore += 1;
  if (allShenSha.indexOf('寡宿') >= 0) marriageScore -= 1;
  if (pillarRelations.zhiLiuHe && pillarRelations.zhiLiuHe.length > 0) marriageScore += 1;
  if (pillarRelations.zhiLiuChong && pillarRelations.zhiLiuChong.length > 0) marriageScore -= 1;

  const marriageLevel = marriageScore >= 3 ? '婚姻基础较好' : (marriageScore >= 1 ? '婚姻条件尚可' : (marriageScore >= -1 ? '婚姻阶段中平' : '宜多用心经营'));
  const marriageLevelColor = marriageScore >= 3 ? 'yong' : (marriageScore >= 1 ? 'yong-light' : (marriageScore >= -1 ? 'neutral' : 'ji'));

  // === 注意事项 ===
  const marriageCautions = [];
  if (isJiSpouse) marriageCautions.push('夫妻宫为忌神，婚后宜互相理解包容。寻找共同爱好增进感情，减少以五行相克的方式相处。');
  if (spouseBenQiShiShen === '七杀') marriageCautions.push('七杀在夫妻宫，婚姻中控制欲不可太强。给对方适度的自由空间是长久之道，以柔克刚为上策。');
  if (spouseBenQiShiShen === '伤官') marriageCautions.push('伤官在夫妻宫，言辞宜温和，避免言语伤害对方。女性伤官须注意与异性保持距离，以免引发误会。');
  if (spouseBenQiShiShen === '劫财') marriageCautions.push('劫财在夫妻宫，需防第三者介入。建议建立共同理财规划，增强婚姻的经济纽带。');
  if (allShenSha.indexOf('桃花') >= 0 && (allShenSha.indexOf('元辰') >= 0 || allShenSha.indexOf('劫煞') >= 0)) {
    marriageCautions.push('桃花带煞，需防烂桃花或婚外情诱惑。保持一份清醒，辨别真情实感与一时冲动。');
  }
  if (pillarRelations.zhiHai && pillarRelations.zhiHai.length > 0) {
    marriageCautions.push('命中有相害关系，夫妻间易有误解和隔阂。沟通宜坦诚直接，避免猜疑积怨。');
  }
  if (marriageCautions.length === 0) marriageCautions.push('婚姻阶段总体平稳，以真诚相待、互相尊重为基础，用心经营可增进感情。');

  return {
    spousePalace: spousePalaceDesc,
    spouseShen: spouseShenDesc,
    starDesc,
    peachTips,
    loveStyle,
    bestPeriod: bestMarriagePeriod,
    marriageLevel,
    marriageLevelColor,
    marriageScore,
    cautions: marriageCautions,
    spouseWuxing: spouseZhiWx,
    spouseShiShen: spouseBenQiShiShen,
    isYong: isYongSpouse,
    isJi: isJiSpouse,
    stars: spouseStars
  };
}


// ==================== 6. 学业分析 V2 ====================

function analyzeAcademicsV2(params) {
  const { pillars, riZhu, yongShen, allShenSha, keyDaYun, riGan, riWuXing, geJuType, wangShuai } = params;

  // 印星力量（天干+地支藏干本气）
  let yinStars = [];
  pillars.forEach((p, i) => {
    const ss = getShiShen(riGan, p.gan);
    if (ss === '正印' || ss === '偏印') yinStars.push({ pillar: ['年','月','日','时'][i], star: ss, loc: '天干', weight: ss === '正印' ? 2 : 1.5 });
    // 藏干印星
    const cangGan = getCangGan(p.zhi);
    cangGan.forEach((cg, j) => {
      const cgSs = getShiShen(riGan, cg);
      if (cgSs === '正印' || cgSs === '偏印') {
        yinStars.push({ pillar: ['年','月','日','时'][i], star: cgSs, loc: '藏' + cg, weight: j === 0 ? (cgSs === '正印' ? 2 : 1.5) : 1 });
      }
    });
  });

  const yinPower = yinStars.reduce((s, y) => s + y.weight, 0);

  // 食伤力量
  let shiShangStars = [];
  pillars.forEach((p, i) => {
    const ss = getShiShen(riGan, p.gan);
    if (ss === '食神' || ss === '伤官') shiShangStars.push({ pillar: ['年','月','日','时'][i], star: ss });
  });
  const shiShangPower = shiShangStars.length * 1.8;

  // 神煞力量
  const hasWenChang = allShenSha.indexOf('文昌贵人') >= 0;
  const hasXueTang = allShenSha.indexOf('学堂') >= 0 || allShenSha.indexOf('词馆') >= 0;

  // === 天赋描述 ===
  let talentDesc = '';
  if (yinPower >= 3) {
    talentDesc = '文星较旺（印星有力），学习吸收能力较强，善于系统整理知识。记忆力表现尚可，偏重理解与归纳的学术方向。';
  } else if (yinPower >= 1.5) {
    talentDesc = '印星有气，有一定学习底子与领悟力。专注时可取得较好成绩，宜养成持续学习的习惯。';
  } else if (shiShangPower >= 2.5) {
    talentDesc = '虽印星不旺，但食伤有力，才华外露型人才。善于表达与创作，实践性强，适合需要创意思维的科目。';
  } else {
    talentDesc = '学业方面可多借助后天努力与良好方法弥补，持之以恒、找到适合自己的学习节奏是关键。';
  }

  // 结合旺衰
  if (wangShuai && wangShuai.level === '身弱') {
    talentDesc += '身弱逢印运时学习状态或有提升，大运遇印星（正印/偏印）可多把握学习进修机会。';
  } else if (wangShuai && wangShuai.level === '身强') {
    talentDesc += '身强者学习宜以输出为主（创作、表达、实践），避免死记硬背。';
  }

  // === 学科建议 ===
  const subjectsMap = {
    '木': ['文学、哲学、语言学、法学、教育学、生态学'],
    '火': ['计算机科学、传媒学、设计艺术、心理学、表演艺术'],
    '土': ['管理学、经济学、建筑学、历史考古、农学'],
    '金': ['工程学、数学、物理学、金融会计、医学'],
    '水': ['外语、国际关系、海洋科学、物流管理、新闻学']
  };
  const subjects = subjectsMap[riWuXing] || ['综合学科'];

  const yongSubjects = [];
  (yongShen.yongShen || []).forEach(yw => {
    const ywSubjects = {
      '木': '教育学、中医学、生态学、园艺设计',
      '火': '计算机、传媒、电子工程、化学',
      '土': '商科、经济管理、土木工程、农学',
      '金': '金融精算、机械工程、法学、外科医学',
      '水': '外语外贸、海洋科学、物流、咨询管理'
    };
    if (ywSubjects[yw]) yongSubjects.push(yw + '性学科：' + ywSubjects[yw]);
  });

  // === 学习风格 ===
  let studyStyle = '';
  if (yinPower >= 2) {
    studyStyle = '适合系统性、长期性的深度学习。善用笔记与思维导图梳理知识体系，安静环境最利专注。';
  } else if (shiShangPower >= 2) {
    studyStyle = '喜欢互动式、实践式学习。讨论与动手操作能让知识事半功倍，碎片化时间巩固效果更佳。';
  } else {
    studyStyle = '适合「少量多餐」的学习方式，每天固定时段坚持。配合学习伙伴互相监督，效果事半功倍。';
  }

  // === 师缘 ===
  let mentorDesc = '';
  if (hasWenChang && hasXueTang) {
    mentorDesc = '命带文昌贵人+学堂，学习环境与师缘条件相对有利。';
  } else if (hasWenChang) {
    mentorDesc = '命带文昌贵人，关键时刻或有良师提携之机，但自身努力仍是根本。';
  } else if (hasXueTang) {
    mentorDesc = '命带学堂，学术氛围较浓厚，适合在校持续深造。';
  } else {
    mentorDesc = '师缘中平，需主动寻访良师益友。自学能力和求知欲将是核心竞争力。';
  }

  // === 考试运 ===
  const examLuck = [];
  for (let ei = 0; ei < keyDaYun.length; ei++) {
    if (keyDaYun[ei].ageStart <= 30 && keyDaYun[ei].score >= 1.5) {
      examLuck.push(keyDaYun[ei].ageStart + '–' + keyDaYun[ei].ageEnd + '岁（' + keyDaYun[ei].ganZhi + '运）考试运佳');
    }
  }
  if (examLuck.length === 0) examLuck.push('考试阶段依赖平时积累。大考之年建议提前一年系统备考，以勤奋补阶段之不足');

  // === 学历参考（仅供参考，非定论） ===
  let eduLevel = '学历走向需结合个人努力与大运配合，仅供参考：';
  if (yinPower >= 3.5) eduLevel += '印星较旺，学术深造方向或有优势，可朝高等学历方向努力';
  else if (yinPower >= 2) eduLevel += '印星有气，学业可持续推进，研究生层次可作为目标之一';
  else if (yinPower >= 1) eduLevel += '适合专业技术路线或职业资格证书路径，学历与技能并重';
  else if (shiShangPower >= 2.5) eduLevel += '实践型能力较为突出，技能证书与实操经验或为竞争优势';
  else eduLevel += '凭持续进修与社会经验积累，可走出属于自己的发展道路';

  return {
    talentDesc, subjects, yongSubjects,
    studyStyle, mentorDesc, examLuck, eduLevel,
    yinPower: Math.round(yinPower * 10) / 10,
    shiShangPower,
    hasWenChang, hasXueTang,
    yinStars: yinStars.map(y => y.pillar + y.loc + y.star),
    shiShangStars: shiShangStars.map(s => s.pillar + s.star)
  };
}


// ==================== 7. 职业分析 V2 ====================

function analyzeCareerV2(params) {
  const { yongShen, geJu, pillars, riGan, riWuXing, allShenSha, wangShuai, wuXingStats } = params;
  const geJuType = geJu.geJu || '';
  const primaryYong = yongShen.primaryYong || '';
  const selfPower = wuXingStats[riWuXing] || 0;
  const allWuXing = ALL_WU_XING;
  const riIndex = allWuXing.indexOf(riWuXing);
  const woKe = allWuXing[(riIndex + 2) % 5]; // 财
  const keWo = allWuXing[(riIndex + 3) % 5]; // 官

  // === 格局→职业大方向 ===
  const geJuCareerHints = {
    '正官格': '可参考体制内、大型企业、管理类方向。以规矩和稳定性为特点。',
    '七杀格': '可参考竞争性行业、创业、军警武职、高管类方向。需魄力和执行力。',
    '正财格': '可参考实业经营、财务管理、稳健投资方向。一步一个脚印积累。',
    '偏财格': '可参考贸易、金融投资、销售、互联网行业方向。善抓机会。',
    '正印格': '可参考学术研究、教育培训、文化传播、顾问咨询方向。以知识立身。',
    '偏印格': '可参考专业技术、研发创新、冷门领域、艺术创作方向。独辟蹊径。',
    '食神格': '可参考美食餐饮、设计创意、演艺娱乐、服务行业方向。以才艺和品味见长。',
    '伤官格': '可参考创意产业、自媒体、技术革新、自由职业方向。才华外露但需注意收敛锋芒。'
  };

  // === 五行→行业细分 ===
  const wxCareerDetail = {
    '木': { best: ['教育培训', '文化传播', '医疗健康', '出版编辑', '园林景观', '中药中医', '公益慈善', '人力资源'] },
    '火': { best: ['互联网科技', '电子信息', '餐饮美食', '传媒广告', '演艺娱乐', '能源化工', '光学照明', '美妆美容'] },
    '土': { best: ['房地产建筑', '农业矿产', '银行保险', '仓储物流', '管理咨询', '中介服务', '公共服务', '陶瓷古玩'] },
    '金': { best: ['机械制造', '汽车行业', '五金金属', '法律法务', '金融投资', '军警安保', '精密仪器', '珠宝首饰'] },
    '水': { best: ['国际贸易', '物流运输', '旅游酒店', '咨询服务', '科研开发', '水产养殖', '医药制药', '新闻传播'] }
  };

  const careerBest = [], careerAvoid = [];
  (yongShen.yongShen || []).forEach(yw => {
    const detail = wxCareerDetail[yw];
    if (detail) detail.best.forEach(b => { if (careerBest.indexOf(b) < 0) careerBest.push(b); });
  });
  (yongShen.jiShen || []).forEach(jw => {
    const detail = wxCareerDetail[jw];
    if (detail) detail.best.forEach(b => { if (careerAvoid.indexOf(b) < 0) careerAvoid.push(b); });
  });

  // === 工作方式（参考） ===
  let workStyle = '';
  if (['正官格', '正财格', '正印格'].indexOf(geJuType) >= 0) {
    workStyle = '可参考稳健路线：选择有制度和保障的平台，按部就班积累资历与声誉。';
  } else if (['七杀格', '偏财格', '伤官格'].indexOf(geJuType) >= 0) {
    workStyle = '可参考灵活多变的工作模式：自主性强的项目制或创业方向，在变化中寻找机会。';
  } else if (['食神格', '偏印格'].indexOf(geJuType) >= 0) {
    workStyle = '可参考发展一技之长、以专业能力立足的方向：自由职业或专业领域深耕。';
  } else {
    workStyle = '可根据大运走向灵活调整方向。阶段有利时进取开拓，平运期稳扎稳打。';
  }

  // 结合旺衰
  if (wangShuai) {
    if (wangShuai.level === '身强') workStyle += '力量偏强者或可在高压高竞争环境中发挥。';
    else if (wangShuai.level === '身弱') workStyle += '力量偏弱者可借助平台之力，避免独立承担过多压力。';
  }

  // === 财官分析 ===
  const caiStars = [], guanStars = [];
  pillars.forEach((p, i) => {
    const ss = getShiShen(riGan, p.gan);
    if (ss === '正财' || ss === '偏财') caiStars.push(['年','月','日','时'][i] + ss);
    if (ss === '正官' || ss === '七杀') guanStars.push(['年','月','日','时'][i] + ss);
  });

  let wealthDesc = '';
  if (caiStars.length >= 2) {
    wealthDesc = '财星能量透出（' + caiStars.join('、') + '），生财有道，物质追求积极。';
    if (selfPower < 2) wealthDesc += '但核心特质偏温和，能量不足则易为财所累，宜借资源补给期积累以担财。';
    else if (selfPower >= 4) wealthDesc += '且特质充盈能任财，财运亨通之象，富贵可期。';
  } else if (caiStars.length === 1) {
    wealthDesc = '财星有制（' + caiStars[0] + '），对财富有规划，能积少成多。';
  } else {
    wealthDesc = '财星藏而不透，对金钱欲望不强，理财意识偏淡。以稳守型财富积累为宜，不宜激进投资。';
  }

  // === 贵人 ===
  const guiRenTips = [];
  if (allShenSha.indexOf('天乙贵人') >= 0) guiRenTips.push('天乙贵人在命，一生遇难呈祥，关键时刻总有贵人相助');
  if (allShenSha.indexOf('文昌贵人') >= 0) guiRenTips.push('文昌贵人相伴，以文以技得贵人赏识');
  if (allShenSha.indexOf('福星贵人') >= 0) guiRenTips.push('福星贵人护佑，一生少有极端苦难之灾');
  if (allShenSha.indexOf('劫煞') >= 0 || allShenSha.indexOf('元辰') >= 0) {
    guiRenTips.push(guiRenTips.length > 0 ? '虽有吉星照拂，仍需留意职场小人' : '职场需防小人暗算，择友宜慎');
  }
  if (guiRenTips.length === 0) guiRenTips.push('以诚待人，自得人缘；持身正直，吉人自有天相。');

  // === 创业建议 ===
  let startupHint = '';
  if (['七杀格', '偏财格', '伤官格'].indexOf(geJuType) >= 0) {
    startupHint = '特质格局中有创业基因，敢闯敢拼。适合自主创业或在创新型公司担纲，关键成长阶段可大胆尝试。';
  } else if (['正官格', '正财格', '正印格'].indexOf(geJuType) >= 0) {
    startupHint = '格局正统稳健，更适合在大平台、体制内深耕。待积累足够资源与经验后，再考虑独立发展。';
  } else {
    startupHint = '宜先积累行业经验与资本，待中年大运来临时可尝试创业或赛道转换。';
  }

  return {
    best: careerBest.slice(0, 8),
    avoid: careerAvoid.slice(0, 5),
    workStyle,
    geJuHint: geJuCareerHints[geJuType] || '',
    summary: (primaryYong ? '可参考向' + primaryYong + '性五行方向发展。' : '') + (geJuCareerHints[geJuType] || ''),
    wealthDesc,
    guiRenTips,
    startupHint,
    caiXingDesc: caiStars.length > 0 ? '财星：' + caiStars.join('、') : '财星不透，重视精神多于物质',
    guanXingDesc: guanStars.length > 0 ? '官星：' + guanStars.join('、') + (guanStars.length >= 2 ? '，官多压力大但领导缘强' : '，仕途有方向') : '官星不显，淡泊权位'
  };
}


// ==================== 8. 健康分析 V2 ====================

function analyzeHealthV2(params) {
  const { wuXingStats, riWuXing, allShenSha, keyDaYun, wangShuai, shenShaByPillar } = params;

  const allWuXing = ALL_WU_XING;
  const wxHealthMap = {
    '木': { organs: '肝胆、筋腱、眼睛、神经系统', weak: '肝气不舒、视力疲劳、筋骨酸痛、情绪抑郁', strong: '肝火旺盛、易怒、头痛眩晕', advice: '规律作息，避免熬夜，多做户外舒展运动，保持心情舒畅' },
    '火': { organs: '心脏、血脉、小肠、舌头', weak: '心血不足、手脚冰凉、精神萎靡', strong: '心火亢盛、高血压、失眠焦躁', advice: '控制情绪波动，避免过度兴奋，午间小憩20分钟养心' },
    '土': { organs: '脾胃、肌肉、口唇、消化系统', weak: '脾胃虚弱、消化不良、乏力倦怠', strong: '湿热内蕴、肥胖倾向、血糖异常', advice: '饮食清淡规律，少食生冷油腻，细嚼慢咽，每餐七分饱' },
    '金': { organs: '肺、大肠、皮肤、鼻、呼吸系统', weak: '肺气虚、易感冒、皮肤干燥敏感', strong: '呼吸道敏感、便秘、皮肤过敏', advice: '注意空气质量，秋季尤重润肺，深呼吸和适度运动增强肺功能' },
    '水': { organs: '肾、膀胱、骨骼、耳朵、生殖系统', weak: '肾气不足、腰膝酸软、听力减退、畏寒怕冷', strong: '水湿泛滥、水肿、肾阳偏亢', advice: '避免受寒凉，节制房劳，冬季注重腰部保暖，常饮温水' }
  };

  // 五行平衡分析
  let maxWx = '', maxPower = 0, minWx = '', minPower = 10;
  allWuXing.forEach(wx => {
    const p = wuXingStats[wx] || 0;
    if (p > maxPower) { maxPower = p; maxWx = wx; }
    if (p < minPower) { minPower = p; minWx = wx; }
  });

  const healthItems = [];
  allWuXing.forEach(wx => {
    const power = wuXingStats[wx] || 0;
    const hInfo = wxHealthMap[wx];
    let status = '平衡';
    if (power <= 0.5) status = '偏弱';
    else if (power >= 3.5) status = '偏旺';
    healthItems.push({
      wuXing: wx, power, organs: hInfo.organs, status,
      advice: hInfo.advice,
      weakSymptoms: hInfo.weak, strongSymptoms: hInfo.strong
    });
  });

  // 体质总评
  let constitution = '';
  if (maxPower >= 3.5) {
    constitution = '体质偏' + maxWx + '型，' + maxWx + '气过旺。重点养护' + ((wxHealthMap[maxWx] || {}).organs || '相关器官') + '，需避免' + maxWx + '气过亢引发的相关病症。';
    if (wangShuai && wangShuai.level === '身强') constitution += '身强者更需注意劳逸结合，勿透支身体。';
  } else if (minPower <= 0.5) {
    constitution = '体质偏' + minWx + '弱，' + minWx + '气不足。重点补养' + ((wxHealthMap[minWx] || {}).organs || '相关器官') + '。日常饮食起居宜以' + minWx + '性食物和运动来调养。';
    if (wangShuai && wangShuai.level === '身弱') constitution += '身弱者需特别注重养生，不可劳累过度。';
  } else {
    constitution = '五行分布较为均衡，体质处于中等水平。各脏腑功能协调，保持良好生活习惯即可维持健康状态。';
  }

  // 神煞健康提示
  const allShenShaFlat = [];
  (shenShaByPillar ? ['year','month','day','hour'] : []).forEach(pos => {
    if (shenShaByPillar[pos]) allShenShaFlat.push(...shenShaByPillar[pos]);
  });
  if (shenShaByPillar && shenShaByPillar.global) allShenShaFlat.push(...shenShaByPillar.global);

  const healthShenShaTips = [];
  if (allShenShaFlat.indexOf('元辰') >= 0) healthShenShaTips.push('命带元辰煞，偶有意外之灾，出行交通需小心谨慎');
  if (allShenShaFlat.indexOf('驿马') >= 0) healthShenShaTips.push('命带驿马星，奔波劳碌，需注意休息质量与交通安全');
  if (allShenShaFlat.indexOf('寡宿') >= 0) healthShenShaTips.push('命带寡宿，注意心理健康，保持适度社交避免孤独抑郁');
  if (allShenShaFlat.indexOf('血刃') >= 0 || allShenShaFlat.indexOf('血支') >= 0) healthShenShaTips.push('需注意意外血光，驾车行路多加小心');

  if (healthShenShaTips.length > 0) constitution += '但' + healthShenShaTips.join('；') + '。';

  // 运动建议
  const sportAdviceMap = {
    '木': ['瑜伽、太极（柔韧调和）', '户外徒步、慢跑（舒展筋骨）', '避免高强度对抗性运动'],
    '火': ['游泳、水上运动（水火既济）', '球类运动（释放精力）', '避免高温暴晒时段锻炼'],
    '土': ['登山、远足（接土气）', '举重、力量训练（增强耐力）', '避免久坐不动'],
    '金': ['呼吸法、冥想（调肺金）', '骑行、室内健身（适度有氧）', '选择空气清新的户外场所'],
    '水': ['慢跑、散步（温和有氧）', '太极拳、八段锦（养肾补气）', '避免大汗淋漓伤津液']
  };
  const sportAdvice = sportAdviceMap[maxWx] || sportAdviceMap['水'];

  // 情绪健康
  const emotionMap = {
    '木': '情绪敏感细腻，易受环境影响。建议通过艺术表达（写作、绘画）或大自然疗愈来平衡情绪。',
    '火': '情绪来得快走得快，热情四射但持久不足。建议练习正念冥想，学会「观呼吸」来调伏心火。',
    '土': '情绪稳定忠厚，但有事喜闷在心里。建议适当倾诉，学会表达内心感受，避免郁结成疾。',
    '金': '外表冷静内心敏感，容易精神内耗。建议通过理性整理思绪（写日记）来释压，不宜长期压抑。',
    '水': '情绪深沉内敛，内心世界丰富。建议保持适度社交，避免独处胡思乱想，多与人交流分享。'
  };
  const emotionAdvice = emotionMap[riWuXing] || emotionMap['土'];

  // 各年龄段健康
  const ageHealth = [];
  if (keyDaYun.length >= 2) {
    ageHealth.push('青少年期（' + keyDaYun[0].ageStart + '–' + keyDaYun[0].ageEnd + '岁）：打好身体底子，培养运动习惯。此期' + (keyDaYun[0].score >= 1 ? '身体状况良好，发育顺利' : '体质偏弱，需加强锻炼和营养补充'));
  }
  if (keyDaYun.length >= 5) {
    ageHealth.push('中年期（' + keyDaYun[4].ageStart + '–' + keyDaYun[4].ageEnd + '岁）：' + (keyDaYun[4].score >= 0 ? '此阶段身体尚可，但工作生活压力大，注意心血管健康和定期体检' : '此阶段劳心劳力，身体容易亮红灯，建议定期体检，劳逸结合'));
  }
  if (keyDaYun.length >= 7) {
    ageHealth.push('中老年期（' + keyDaYun[6].ageStart + '–' + keyDaYun[6].ageEnd + '岁）：' + (keyDaYun[6].score >= 0 ? '此阶段尚可安享，饮食清淡，保持适度运动' : '注意骨骼关节和慢性病管理，养生以静养为主'));
  }

  return {
    items: healthItems,
    summary: '五行健康综合分析：体质偏' + (maxPower >= 3.5 ? maxWx + '盛' : minPower <= 0.5 ? minWx + '弱' : '均衡') + '型，需针对性调养。',
    shenShaTips: healthShenShaTips,
    constitution,
    sportAdvice,
    emotionAdvice,
    ageHealth,
    maxWuXing: maxWx,
    minWuXing: minWx
  };
}


// ==================== 9. 地域/幸运/生活 ====================

function analyzeRegionAndLuck(yongShen, yongSet, jiSet) {
  const regionMap = {
    '木': { direction: '东方', regions: ['江浙沪', '沿海东部'], cities: '上海、杭州、苏州、青岛', climate: '温润多绿之地' },
    '火': { direction: '南方', regions: ['珠三角', '华南'], cities: '深圳、广州、长沙、厦门', climate: '温暖明亮之城' },
    '土': { direction: '中央/中原', regions: ['中原腹地', '西南'], cities: '郑州、武汉、成都、西安', climate: '厚重安稳之都' },
    '金': { direction: '西方', regions: ['西部', '环渤海'], cities: '北京、天津、重庆', climate: '干燥爽朗之所' },
    '水': { direction: '北方', regions: ['东北', '华北'], cities: '大连、哈尔滨、沈阳', climate: '寒冷静谧之地' }
  };

  const regionBest = [];
  (yongShen.yongShen || []).forEach(yw => {
    const r = regionMap[yw];
    if (r && regionBest.findIndex(x => x.direction === r.direction) < 0) {
      regionBest.push({ wuXing: yw, ...r });
    }
  });

  // 幸运数字
  const numMap = { '水': [1,6], '火': [2,7], '木': [3,8], '金': [4,9], '土': [5,0] };
  const luckyNumbers = [], unluckyNumbers = [];
  (yongShen.yongShen || []).forEach(yw => {
    (numMap[yw] || []).forEach(n => { if (luckyNumbers.indexOf(n) < 0) luckyNumbers.push(n); });
  });
  (yongShen.jiShen || []).forEach(jw => {
    (numMap[jw] || []).forEach(n => { if (unluckyNumbers.indexOf(n) < 0) unluckyNumbers.push(n); });
  });

  // 幸运颜色
  const colorMap = {
    '木': [{name:'绿色',cls:'green'}, {name:'青色',cls:'cyan'}],
    '火': [{name:'红色',cls:'red'}, {name:'紫色',cls:'purple'}, {name:'橙色',cls:'orange'}],
    '土': [{name:'黄色',cls:'yellow'}, {name:'棕色',cls:'brown'}],
    '金': [{name:'白色',cls:'white'}, {name:'金色',cls:'gold'}, {name:'银色',cls:'silver'}],
    '水': [{name:'黑色',cls:'black'}, {name:'蓝色',cls:'blue'}, {name:'灰色',cls:'gray'}]
  };
  const luckyColors = [], unluckyColors = [];
  (yongShen.yongShen || []).forEach(yw => {
    (colorMap[yw] || []).forEach(c => { if (luckyColors.findIndex(x => x.name === c.name) < 0) luckyColors.push(c); });
  });
  (yongShen.jiShen || []).forEach(jw => {
    (colorMap[jw] || []).forEach(c => { if (unluckyColors.findIndex(x => x.name === c.name) < 0) unluckyColors.push(c); });
  });

  return {
    region: { best: regionBest, avoid: [] },
    luck: {
      numbers: luckyNumbers, avoidNumbers: unluckyNumbers,
      colors: luckyColors, avoidColors: unluckyColors,
      avoidColorsText: unluckyColors.map(c => c.name).join('、'),
      stones: []
    }
  };
}


// ==================== 10. 生活宜忌 ====================

function analyzeLifeTips(params) {
  const { yongShen, geJu, wuXingStats, wangShuai, pillarRelations, bestDaYun, worstDaYun, turningPoints } = params;
  const geJuType = geJu.geJu || '';
  const lifeTips = [
    { category: '饮食调养', tips: [] },
    { category: '作息起居', tips: [] },
    { category: '人际社交', tips: [] },
    { category: '决策时机', tips: [] }
  ];

  // 饮食
  const dietMap = {
    '木': '多食绿色蔬菜、酸味食物（柠檬、山楂），草本茶饮助舒肝',
    '火': '适量苦味食物（苦瓜、莲子心），红枣桂圆补心血',
    '土': '甘味食物养脾胃（山药、南瓜、小米粥），少食甜腻生湿',
    '金': '辛味食物宣肺（生姜、葱白），多食白色食物润燥（梨、百合）',
    '水': '咸味适中（海带、紫菜），黑芝麻黑豆补肾气'
  };
  (yongShen.yongShen || []).forEach(yw => {
    if (dietMap[yw] && lifeTips[0].tips.indexOf(dietMap[yw]) < 0) lifeTips[0].tips.push(dietMap[yw]);
  });
  if (lifeTips[0].tips.length === 0) lifeTips[0].tips.push('饮食均衡，顺应季节而食，五谷为养');

  // 作息
  const firePower = wuXingStats['火'] || 0;
  const waterPower = wuXingStats['水'] || 0;
  if (firePower > waterPower + 1.5) {
    lifeTips[1].tips.push('火旺水弱，易失眠焦躁，睡前宜冥想或泡脚降火');
  } else if (waterPower > firePower + 1.5) {
    lifeTips[1].tips.push('水盛火弱，精神易低迷，宜晨起晒太阳补充阳气');
  }
  const selfPower = wuXingStats[
    (wangShuai && wangShuai.selfCount !== undefined) ? null : null
  ] || 0;
  if (wangShuai && wangShuai.level === '身强') {
    lifeTips[1].tips.push('身强者精力充沛，但需注意劳逸结合，建议子时（23点前）就寝');
  } else if (wangShuai && wangShuai.level === '身弱') {
    lifeTips[1].tips.push('身弱者需充足睡眠养精蓄锐，午时可小憩20分钟回血');
  } else {
    lifeTips[1].tips.push('保持规律作息，早睡早起，子午觉为养生之要');
  }

  // 人际
  if (['正官格', '正印格'].indexOf(geJuType) >= 0) {
    lifeTips[2].tips.push('格局正统，宜结交稳重诚信之人，远离浮夸虚妄之辈');
  } else if (['偏财格', '七杀格'].indexOf(geJuType) >= 0) {
    lifeTips[2].tips.push('性格外放，人缘广泛但需甄别真心。三五知己胜于泛泛之交');
  } else if (geJuType === '伤官格') {
    lifeTips[2].tips.push('才华外露易招嫉，言谈留三分余地，学会倾听他人心声');
  }
  if (pillarRelations.ganHe && pillarRelations.ganHe.length > 0) {
    lifeTips[2].tips.push('命中带合，天生有人缘魅力，善于合作共赢');
  }
  if (pillarRelations.zhiLiuChong && pillarRelations.zhiLiuChong.length > 0) {
    lifeTips[2].tips.push('命中带冲，人际关系易有波折。遇争执宜退一步，以和为贵');
  }
  if (lifeTips[2].tips.length === 0) lifeTips[2].tips.push('以诚待人，远近有度。亲君子、远小人是处世之道');

  // 决策
  if (bestDaYun) {
    lifeTips[3].tips.push('较有利的大运在' + bestDaYun.ageStart + '–' + bestDaYun.ageEnd + '岁（' + bestDaYun.ganZhi + '运），可参考把握');
  }
  if (worstDaYun && worstDaYun.score < -2) {
    lifeTips[3].tips.push(worstDaYun.ageStart + '–' + worstDaYun.ageEnd + '岁（' + worstDaYun.ganZhi + '运）阶段较弱，宜守不宜攻，不宜做高风险决策');
  }
  if (turningPoints && turningPoints.length > 0) {
    lifeTips[3].tips.push('约' + turningPoints[0].age + '岁为阶段重要转折点，前后两年宜做好过渡准备');
  }
  if (lifeTips[3].tips.length === 0) lifeTips[3].tips.push('顺势而为，借运而行。阶段好时大胆开拓，阶段弱时守成为上');

  return lifeTips;
}


// ==================== 11. 原盘结构 V2 ====================

function analyzeYuanPanV2(params) {
  const { pillars, riGan, riWuXing, wangShuai, pillarRelations, yongShen } = params;

  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
  const shiShenConfig = [];
  const roleDescs = [];

  // 用神/忌神集合（用于判断每柱利弊倾向）
  const yongSet = {};
  (yongShen.yongShen || []).forEach(w => { yongSet[w] = true; });
  const jiSet = {};
  (yongShen.jiShen || []).forEach(w => { jiSet[w] = true; });

  // 十神详细释义
  const ssLifeMap = {
    '正财': { good: '务实稳重的理财能力，物质基础扎实', bad: '过于重利，易因钱财生烦恼' },
    '偏财': { good: '慷慨大方，善于把握商机，偏财运旺', bad: '花销大手大脚，理财需有规划' },
    '正官': { good: '自律正直，有管理能力与社会地位', bad: '压力过大，易受约束感困扰' },
    '七杀': { good: '魄力果断，敢于突破，适于竞争环境', bad: '急躁冲动，人际冲突多，需修心性' },
    '正印': { good: '学识渊博，得长辈贵人扶持，思维深邃', bad: '依赖心强，行动力不足，易想多做少' },
    '偏印': { good: '洞察力强，擅长专业技能与独特领域', bad: '多疑孤僻，人际关系冷淡，想法偏激' },
    '食神': { good: '温和才艺佳，生活品味高，人缘和睦', bad: '安逸怠惰，缺乏进取动力' },
    '伤官': { good: '聪明机智，创造力强，表达才华出众', bad: '傲气凌人，易犯上，情绪波动大' },
    '比肩': { good: '独立自主，意志坚定，能吃苦耐劳', bad: '固执己见，竞争意识过强，合作难' },
    '劫财': { good: '行动力强，讲义气，社交活跃', bad: '冲动破耗，易被朋友连累，财务宜谨慎' }
  };

  for (let i = 0; i < pillars.length; i++) {
    const p = pillars[i];
    const ss = getShiShen(riGan, p.gan);
    const cangGan = getCangGan(p.zhi);
    const zhiSs = cangGan.map(cg => getShiShen(riGan, cg));
    const ganWx = getWuXing(p.gan);
    const zhiWx = getWuXing(p.zhi);

    shiShenConfig.push({
      name: pillarNames[i],
      gan: p.gan, zhi: p.zhi, ganZhi: p.ganZhi,
      shiShen: ss,
      zhiShiShen: zhiSs.join('/'),
      cangGan,
      naYin: p.naYin || ''
    });

    // 判断该柱干支五行是否为喜忌
    const isYongGan = !!yongSet[ganWx];
    const isJiGan = !!jiSet[ganWx];
    const isYongZhi = !!yongSet[zhiWx];
    const isJiZhi = !!jiSet[zhiWx];

    const ssInfo = ssLifeMap[ss] || {};
    const ssGood = ssInfo.good || '';
    const ssBad = ssInfo.bad || '';

    if (i === 0) {
      // 年柱——祖荫、早年
      var yearDesc = '年柱「' + p.ganZhi + '」，天干' + p.gan + '为' + ss + '，地支藏' + cangGan.join('、') + '（十神：' + zhiSs.join('、') + '）。';
      yearDesc += ss === '正印' || ss === '偏印' ? '年干透印，祖辈或父母中有学识/地位之人，早年受庇护滋养。' :
        ss.indexOf('官') >= 0 || ss.indexOf('杀') >= 0 ? '年干透官杀，家教严格或长辈管教严厉，早年压力中成长，磨砺出坚韧性格。' :
        ss.indexOf('财') >= 0 ? '年干透财，家境尚可或祖上有产业基础，早年物质条件优于常人。' :
        ss === '食神' || ss === '伤官' ? '年干透食伤，天资聪颖，幼年即展现才华特长。' :
        '年干' + ss + '，奠定人生底色。';
      // 加上喜忌影响
      if (isYongGan) yearDesc += p.gan + '（' + ganWx + '）属喜用参考，年柱得力，先天根基稳固，早年阶段顺遂。';
      else if (isJiGan) yearDesc += p.gan + '（' + ganWx + '）为宜规避项，年柱有瑕，早年或多波折坎坷，须后天努力弥补。';
      if (ssGood) yearDesc += ssGood;
      roleDescs.push(yearDesc);
    } else if (i === 1) {
      // 月柱——事业核心
      var monthDesc = '月柱「' + p.ganZhi + '」为格局提纲。月令' + p.zhi + '（' + zhiWx + '）藏' + cangGan.join('、') + '，';
      monthDesc += ss === '正印' || ss === '偏印' ? '月干透印，格局以印星立基，一生学业/名声/贵人运为最大优势所在。' :
        ss.indexOf('财') >= 0 ? '月干透财，以财富为人生主旋律，经商求财之命格。' :
        ss.indexOf('官') >= 0 || ss.indexOf('杀') >= 0 ? '月干透官杀，格局贵气，仕途/管理/权威领域可展抱负。' :
        ss === '食神' ? '月坐食神，技艺傍身，以专业能力立足社会。' :
        ss === '伤官' ? '月坐伤官，才华外露但不羁，宜走创意/技术路线。' :
        '月干' + ss + '，主导青中年发展基调。';
      monthDesc += wangShuai && wangShuai.deLing && wangShuai.deLing.level ? '在月令处于' + wangShuai.deLing.level + '之地，' : '';
      monthDesc += isYongGan || isYongZhi ? '月柱五行（' + (isYongGan ? ganWx : '') + (isYongGan && isYongZhi ? '、' : '') + (isYongZhi ? zhiWx : '') + '）属喜用，青中年大运若走此五行则如鱼得水。' :
        isJiGan || isJiZhi ? '月柱含忌神五行（' + (isJiGan ? ganWx : '') + (isJiGan && isJiZhi ? '、' : '') + (isJiZhi ? zhiWx : '') + '），此阶段需格外审慎。' : '';
      roleDescs.push(monthDesc);
    } else if (i === 2) {
      // 日柱——自身+婚姻宫
      var dayDesc = '日柱「' + p.ganZhi + '」——日干' + p.gan + '即为命主本人（' + riWuXing + '命），日支' + p.zhi + '为夫妻宫。';
      dayDesc += '夫妻宫藏' + cangGan.join('、') + '（' + zhiSs.join('、') + '），';
      var benQi = cangGan[0] || '';
      var benQiSs = benQi ? getShiShen(riGan, benQi) : '';
      if (benQiSs) {
        dayDesc += '本气' + benQi + '为' + benQiSs + '星，';
        dayDesc += benQiSs === '正财' || benQiSs === '正官' ? '配偶倾向稳重型，婚姻基础相对稳固。' :
          benQiSs === '偏财' ? '配偶善交际，需用心经营感情。' :
          benQiSs === '七杀' ? '配偶倾向强势果敢，婚姻中或有一定主导权。' :
          benQiSs === '正印' ? '配偶温文尔雅，或为精神支柱型伴侣。' :
          benQiSs === '伤官' ? '配偶才情出众但个性较强，相处宜多包容。' :
          '配偶个性鲜明。';
      }
      if (isYongZhi) dayDesc += '日支' + zhiWx + '为喜用五行，婚姻宫得力，婚后阶段有提升。';
      else if (isJiZhi) dayDesc += '日支' + zhiWx + '临忌神，夫妻宫有瑕疵，感情需更多经营。';
      roleDescs.push(dayDesc);
    } else {
      // 时柱——子女、晚景
      var hourDesc = '时柱「' + p.ganZhi + '」主宰晚年运程与子女缘。';
      hourDesc += ss === '食神' ? '时干食神，子女聪孝，晚年享清福，也代表晚年以技艺/休闲为乐。' :
        ss === '伤官' ? '时坐伤官，子女有才但叛逆，晚年仍操劳操心。' :
        ss === '正财' || ss === '偏财' ? '时柱透财，晚年财运不缺，子女经济条件好。' :
        ss === '比肩' || ss === '劫财' ? '时柱比劫，子女独立性强但关系疏离，晚年宜自寻乐趣。' :
        ss === '正印' || ss === '偏印' ? '时柱透印，晚年仍有学习能力，或子女从事教育/文化行业。' :
        '时干' + ss + '，定晚年归宿格调。';
      if (isYongGan) hourDesc += p.gan + '（' + ganWx + '）属喜用，晚景安稳有保障。';
      else if (isJiGan) hourDesc += p.gan + '（' + ganWx + '）为忌，晚年宜早做规划，不可懈怠。';
      roleDescs.push(hourDesc);
    }
  }

  // 特殊组合——更具体化
  const features = [];
  if (pillarRelations.ganHe && pillarRelations.ganHe.length > 0) {
    var heDetails = pillarRelations.ganHe.map(function(h) { return h.gan1 + h.gan2; }).join('、');
    features.push('天干五合（' + heDetails + '）：外表柔和善交际，人缘佳，利于合作共赢的事业模式');
  }
  if (pillarRelations.zhiLiuHe && pillarRelations.zhiLiuHe.length > 0) {
    var liuHeDetails = pillarRelations.zhiLiuHe.map(function(h) { return h.zhi1 + h.zhi2; }).join('、');
    features.push('地支六合（' + liuHeDetails + '）：暗藏机缘，关键时刻常有意外助力');
  }
  if (pillarRelations.zhiSanHe && pillarRelations.zhiSanHe.length > 0) {
    features.push('地支三合' + pillarRelations.zhiSanHe[0].hua + '局：气势汇聚，遇触发年份（流年见第三支）能量爆发，大事可成');
  }
  if (pillarRelations.zhiLiuChong && pillarRelations.zhiLiuChong.length > 0) {
    var chongDetails = pillarRelations.zhiLiuChong.map(function(c) { return c.zhi1 + '冲' + c.zhi2; }).join('、');
    features.push('地支六冲（' + chongDetails + '）：人生多有起伏变动，冲到哪宫哪方面就有波动，宜未雨绸缪');
  }
  if (pillarRelations.zhiLiuChong && pillarRelations.zhiLiuChong.length > 0) features.push('地支有冲（' + pillarRelations.zhiLiuChong.length + '处），人生多有起伏变动');
  

  return {
    desc: wangShuai.levelDesc + '四柱干支组合参考：' + shiShenConfig.map(s => s.name + s.shiShen).join('－'),
    shiShenConfig,
    strongWeakLevel: wangShuai.level,
    strongWeakDesc: wangShuai.levelDesc,
    wangShuaiDetail: wangShuai,
    roleDescs,
    features
  };
}


// ==================== 12. 综合主入口 ====================

/**
 * 深度综合分析 V2
 * 输入参数与 V1 getDeepAnalysis 完全一致，但全面升级推理逻辑
 * @param {Object} params - 排盘结果中的 _deepAnalysisParams
 */
function getDeepAnalysisV2(params) {
  const { pillars, riZhu, yongShen: oldYongShen, geJu: oldGeJu, pillarRelations,
    wuXingStats, daYun, shenShaByPillar } = params;

  const riGan = riZhu.gan;
  const riWuXing = riZhu.wuXing;
  const monthZhi = pillars[1].zhi;

  // Step 1: 旺衰判定（真实四维评估）
  const wangShuai = getWangShuai(riGan, riWuXing, monthZhi, pillars, wuXingStats);

  // Step 2: 核心能量偏向判定（基于真实旺衰）
  const yongShen = getYongShenV2({
    riWuXing, monthZhi, pillars, riGan, wangShuai, wuXingStats, pillarRelations
  });

  // Step 3: 大运分析（含与四柱交互）
  const daYunAnalysis = getDaYunAnalysisV2({
    daYunList: daYun.daYunList || [],
    qiYunAge: daYun.qiYunAge,
    yongShen, pillars, riGan, riWuXing, wangShuai, pillarRelations
  });

  // Step 4: 原盘解读
  const yuanPan = analyzeYuanPanV2({ pillars, riGan, riWuXing, wangShuai, pillarRelations, yongShen });

  // Step 5: 汇聚全盘神煞
  const allShenSha = [];
  ['year','month','day','hour'].forEach(pos => {
    if (shenShaByPillar[pos]) allShenSha.push(...shenShaByPillar[pos]);
  });
  if (shenShaByPillar.global) allShenSha.push(...shenShaByPillar.global);

  // Step 6: 格局（沿用原算法，但补充身强弱影响）
  const geJu = {
    ...(oldGeJu || {}),
    wangShuaiInfluence: wangShuai.level === '身强' && oldGeJu.geJu === '七杀格' ? '身强杀旺，以食伤制杀为美' :
      wangShuai.level === '身弱' && oldGeJu.geJu === '正财格' ? '身弱财旺，需印比扶身方能担财' : ''
  };

  // Step 7: 婚姻
  const marriage = analyzeMarriageV2({
    riZhu, pillars, yongShen, allShenSha,
    keyDaYun: daYunAnalysis.keyDaYun, wuXingStats,
    riGan, riWuXing, geJuType: (oldGeJu || {}).geJu || '',
    pillarRelations, wangShuai
  });

  // Step 8: 学业
  const academics = analyzeAcademicsV2({
    pillars, riZhu, yongShen, allShenSha,
    keyDaYun: daYunAnalysis.keyDaYun,
    riGan, riWuXing, geJuType: (oldGeJu || {}).geJu || '',
    wangShuai
  });

  // Step 9: 职业
  const career = analyzeCareerV2({
    yongShen, geJu, pillars, riGan, riWuXing,
    allShenSha, wangShuai, wuXingStats
  });

  // Step 10: 健康
  const health = analyzeHealthV2({
    wuXingStats, riWuXing, allShenSha,
    keyDaYun: daYunAnalysis.keyDaYun, wangShuai, shenShaByPillar
  });

  // Step 11: 地域/幸运
  const rl = analyzeRegionAndLuck(yongShen);

  // Step 12: 生活宜忌
  const lifeTips = analyzeLifeTips({
    yongShen, geJu: (oldGeJu || {}), wuXingStats, wangShuai, pillarRelations,
    bestDaYun: daYunAnalysis.bestDaYun,
    worstDaYun: daYunAnalysis.worstDaYun,
    turningPoints: daYunAnalysis.turningPoints
  });

  return {
    yuanPan,
    yongShen,                // V2用神（覆盖V1）
    geJu,                    // V2格局（覆盖V1）
    keyDaYun: daYunAnalysis.keyDaYun,
    turningPoints: daYunAnalysis.turningPoints,
    bestDaYun: daYunAnalysis.bestDaYun,
    worstDaYun: daYunAnalysis.worstDaYun,
    health,
    career,
    marriage,
    academics,
    region: rl.region,
    luck: rl.luck,
    lifeTips
  };
}


// ==================== 导出 ====================

module.exports = {
  // 主入口
  getDeepAnalysisV2,
  
  // 分模块
  getWangShuai,
  getYongShenV2,
  getDaYunAnalysisV2,
  analyzeLiuNianV2,
  analyzeMarriageV2,
  analyzeAcademicsV2,
  analyzeCareerV2,
  analyzeHealthV2,
  
  // 流年批量
  generateAllLiuNianV2,
};

/**
 * 批量生成所有流年分析
 */
function generateAllLiuNianV2(baZiResult, birthYear) {
  const { getLiuNian } = require('./bazi-engine');
  const riGan = baZiResult.riZhu.gan;
  const riWuXing = baZiResult.riZhu.wuXing;
  const riZhi = baZiResult.riZhu.zhi;
  const pillars = baZiResult.pillars;
  const yongShen = baZiResult.yongShen;
  const wangShuai = getWangShuai(riGan, riWuXing, pillars[1].zhi, pillars, baZiResult.wuXingStats);
  const daYunList = baZiResult.daYun.daYunList;
  const currentYear = new Date().getFullYear();

  const startYear = birthYear;
  const endYear = Math.min(birthYear + 80, startYear + 80);
  const list = [];

  for (let year = startYear; year <= endYear; year++) {
    const liuNian = getLiuNian(year);
    const currentDaYun = daYunList.find(d => d.year <= year && d.year + 9 >= year) || null;
    const analysis = analyzeLiuNianV2({
      riGan, riWuXing, riZhi, pillars, yongShen, wangShuai,
      currentDaYun, liuNian, year, age: year - birthYear
    });

    list.push({
      year,
      yearGanZhi: liuNian.yearGanZhi,
      yearGan: liuNian.yearGan,
      yearZhi: liuNian.yearZhi,
      shiShen: analysis.yearShiShen,
      wuXing: analysis.yearWuXing,
      ganColor: GAN_ZHI_COLOR[liuNian.yearGan] || '#333',
      zhiColor: GAN_ZHI_COLOR[liuNian.yearZhi] || '#333',
      daYunInteraction: currentDaYun,
      briefDesc: analysis.yearShiShen || analysis.yearWuXing,
      fullDesc: analysis.desc,
      score: analysis.score,
      scoreStr: analysis.scoreStr,
      interactions: analysis.interactions,
      isSuiYunBingLin: analysis.isSuiYunBingLin,
      isCurrent: year === currentYear,
      age: year - birthYear
    });
  }

  return list;
}
