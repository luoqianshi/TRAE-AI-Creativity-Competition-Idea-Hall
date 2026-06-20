/**
 * 地支藏干模块
 */

const { TIAN_GAN } = require('./constants');

// 地支藏干表（含本气/中气/余气）
const CANG_GAN_DETAIL = {
  '子': [{ gan: '癸', type: '本气', ratio: 100 }],
  '丑': [{ gan: '己', type: '本气', ratio: 60 }, { gan: '癸', type: '中气', ratio: 30 }, { gan: '辛', type: '余气', ratio: 10 }],
  '寅': [{ gan: '甲', type: '本气', ratio: 60 }, { gan: '丙', type: '中气', ratio: 30 }, { gan: '戊', type: '余气', ratio: 10 }],
  '卯': [{ gan: '乙', type: '本气', ratio: 100 }],
  '辰': [{ gan: '戊', type: '本气', ratio: 60 }, { gan: '乙', type: '中气', ratio: 30 }, { gan: '癸', type: '余气', ratio: 10 }],
  '巳': [{ gan: '丙', type: '本气', ratio: 60 }, { gan: '庚', type: '中气', ratio: 30 }, { gan: '戊', type: '余气', ratio: 10 }],
  '午': [{ gan: '丁', type: '本气', ratio: 70 }, { gan: '己', type: '中气', ratio: 30 }],
  '未': [{ gan: '己', type: '本气', ratio: 60 }, { gan: '丁', type: '中气', ratio: 30 }, { gan: '乙', type: '余气', ratio: 10 }],
  '申': [{ gan: '庚', type: '本气', ratio: 60 }, { gan: '壬', type: '中气', ratio: 30 }, { gan: '戊', type: '余气', ratio: 10 }],
  '酉': [{ gan: '辛', type: '本气', ratio: 100 }],
  '戌': [{ gan: '戊', type: '本气', ratio: 60 }, { gan: '辛', type: '中气', ratio: 30 }, { gan: '丁', type: '余气', ratio: 10 }],
  '亥': [{ gan: '壬', type: '本气', ratio: 70 }, { gan: '甲', type: '中气', ratio: 30 }]
};

// 简化版藏干（只返回天干列表）
const CANG_GAN_SIMPLE = {};
for (const [zhi, detail] of Object.entries(CANG_GAN_DETAIL)) {
  CANG_GAN_SIMPLE[zhi] = detail.map(d => d.gan);
}

/**
 * 获取地支藏干详细列表
 */
function getCangGanDetail(zhi) {
  return CANG_GAN_DETAIL[zhi] || [];
}

/**
 * 获取地支藏干简化列表（仅天干）
 */
function getCangGanSimple(zhi) {
  return CANG_GAN_SIMPLE[zhi] || [];
}

/**
 * 获取本气藏干
 */
function getBenQi(zhi) {
  const detail = CANG_GAN_DETAIL[zhi];
  if (!detail) return '';
  const benQi = detail.find(d => d.type === '本气');
  return benQi ? benQi.gan : detail[0].gan;
}

module.exports = {
  getCangGanDetail,
  getCangGanSimple,
  getBenQi,
  CANG_GAN_DETAIL,
  CANG_GAN_SIMPLE
};
