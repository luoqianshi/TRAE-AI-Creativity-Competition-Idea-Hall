/**
 * 神煞计算模块
 * 从 constants 和 engine 中抽取神煞相关逻辑作为独立模块
 */

const { TIAN_GAN, DI_ZHI, SIXTY_JIAZI, YIN_YANG } = require('./constants');

// ==================== 神煞对照表 ====================
const SHEN_SHA_TABLE = {
  // 天乙贵人: "甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，六辛逢虎马"
  tianYi: { '甲': ['丑','未'],'戊': ['丑','未'],'庚': ['丑','未'],'乙': ['子','申'],'己': ['子','申'],'丙': ['亥','酉'],'丁': ['亥','酉'],'壬': ['卯','巳'],'癸': ['卯','巳'],'辛': ['寅','午'] },
  
  // 桃花（咸池）: "寅午戌见卯，申子辰见酉，亥卯未见子，巳酉丑见午"
  taoHua: { '寅午戌': '卯', '申子辰': '酉', '亥卯未': '子', '巳酉丑': '午' },
  
  // 驿马
  yiMa: { '寅午戌': '申', '申子辰': '寅', '亥卯未': '巳', '巳酉丑': '亥' },
  
  // 华盖
  huaGai: { '寅午戌': '戌', '申子辰': '辰', '亥卯未': '未', '巳酉丑': '丑' },
  
  // 文昌贵人
  wenChang: { '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申', '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯' },
  
  // 羊刃
  yangRen: { '甲': '卯', '丙': '午', '戊': '午', '庚': '酉', '壬': '子' },
  
  // 禄神
  luShen: { '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳', '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子' },
  
  // 空亡（旬空）
  kongWang: { 0: ['戌','亥'], 10: ['申','酉'], 20: ['午','未'], 30: ['辰','巳'], 40: ['寅','卯'], 50: ['子','丑'] }
};

// 桃花/驿马/华盖 的分组匹配
const SHEN_SHA_GROUPS = ['寅午戌', '申子辰', '亥卯未', '巳酉丑'];

function findGroup(zhi) {
  return SHEN_SHA_GROUPS.find(g => g.includes(zhi)) || '';
}

/**
 * 获取完整神煞列表
 * @param {Object} pillars - 四柱 { yearZhi, monthZhi, dayZhi, dayGan, yearGan, gender }
 */
function getShenSha({ yearZhi, monthZhi, dayZhi, hourZhi, dayGan, yearGan, gender }) {
  const result = [];
  
  // 1. 天乙贵人
  const tianYiZhi = SHEN_SHA_TABLE.tianYi[dayGan] || [];
  [{zhi: yearZhi, p: '年柱'}, {zhi: monthZhi, p: '月柱'}, {zhi: dayZhi, p: '日柱'}, {zhi: hourZhi, p: '时柱'}].forEach(({zhi, p}) => {
    if (tianYiZhi.includes(zhi)) result.push({ name: '天乙贵人', pillar: p, type: '吉' });
  });
  
  // 2. 文昌贵人
  const wenChangZhi = SHEN_SHA_TABLE.wenChang[dayGan];
  [{zhi: monthZhi, p: '月柱'}, {zhi: dayZhi, p: '日柱'}].forEach(({zhi, p}) => {
    if (zhi === wenChangZhi) result.push({ name: '文昌贵人', pillar: p, type: '吉' });
  });
  
  // 3. 禄神
  const luZhi = SHEN_SHA_TABLE.luShen[dayGan];
  [{zhi: monthZhi, p: '月柱'}, {zhi: dayZhi, p: '日柱'}].forEach(({zhi, p}) => {
    if (zhi === luZhi) result.push({ name: '禄神', pillar: p, type: '吉' });
  });
  
  // 4. 羊刃
  const yangZhi = SHEN_SHA_TABLE.yangRen[dayGan];
  [{zhi: monthZhi, p: '月柱'}, {zhi: dayZhi, p: '日柱'}].forEach(({zhi, p}) => {
    if (zhi === yangZhi) result.push({ name: '羊刃', pillar: p, type: '凶' });
  });
  
  // 5. 桃花
  const yearGroup = findGroup(yearZhi);
  const riGroup = findGroup(dayZhi);
  if (yearGroup) {
    const taoHuaZhi = SHEN_SHA_TABLE.taoHua[yearGroup];
    if (monthZhi === taoHuaZhi) result.push({ name: '桃花', pillar: '月柱', type: '中性' });
    if (dayZhi === taoHuaZhi) result.push({ name: '桃花', pillar: '日柱', type: '中性' });
    if (hourZhi === taoHuaZhi) result.push({ name: '桃花', pillar: '时柱', type: '中性' });
  }
  
  // 6. 驿马
  if (yearGroup) {
    const yiMaZhi = SHEN_SHA_TABLE.yiMa[yearGroup];
    if (monthZhi === yiMaZhi) result.push({ name: '驿马', pillar: '月柱', type: '中性' });
    if (dayZhi === yiMaZhi) result.push({ name: '驿马', pillar: '日柱', type: '中性' });
  }
  
  // 7. 华盖
  if (riGroup) {
    const huaGaiZhi = SHEN_SHA_TABLE.huaGai[riGroup];
    if (dayZhi === huaGaiZhi) result.push({ name: '华盖', pillar: '日柱', type: '中性' });
    if (monthZhi === huaGaiZhi) result.push({ name: '华盖', pillar: '月柱', type: '中性' });
  }
  
  // 8. 空亡
  const dayGanZhi = dayGan + dayZhi;
  const dayIndex = SIXTY_JIAZI.indexOf(dayGanZhi);
  if (dayIndex >= 0) {
    const xunStart = Math.floor(dayIndex / 10) * 10;
    const kongWangZhi = SHEN_SHA_TABLE.kongWang[xunStart] || [];
    [{zhi: yearZhi, p: '年柱'}, {zhi: monthZhi, p: '月柱'}, {zhi: hourZhi, p: '时柱'}].forEach(({zhi, p}) => {
      if (kongWangZhi.includes(zhi)) result.push({ name: '空亡', pillar: p, type: '中性' });
    });
  }
  
  // 9. 天罗地网
  if (gender === '男' && (monthZhi === '辰' || monthZhi === '巳')) {
    result.push({ name: '天罗', pillar: '月柱', type: '凶' });
  }
  if (gender === '女' && (monthZhi === '戌' || monthZhi === '亥')) {
    result.push({ name: '地网', pillar: '月柱', type: '凶' });
  }
  
  return result;
}

module.exports = { getShenSha, SHEN_SHA_TABLE };
