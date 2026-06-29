/**
 * 生日纪念应用 - 工具函数
 * 提供生肖、星座、年代、星期、季节等常用计算函数
 */

/**
 * 根据年份计算生肖
 * @param {number} year - 公历年份
 * @returns {string} 生肖中文名称
 */
function getZodiac(year) {
  const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  // 1900 年是鼠年，以此为基础计算偏移
  const offset = (year - 1900) % 12;
  // 处理负数情况
  return zodiacs[((offset % 12) + 12) % 12];
}

/**
 * 根据月份和日期计算星座
 * @param {number} month - 月份（1-12）
 * @param {number} day - 日期（1-31）
 * @returns {string} 星座中文名称
 */
function getConstellation(month, day) {
  // 星座的起始日期和对应的星座名称
  const constellations = [
    { month: 1, day: 20, name: '摩羯座' },    // 12.22 - 1.19
    { month: 2, day: 19, name: '水瓶座' },    // 1.20 - 2.18
    { month: 3, day: 21, name: '双鱼座' },    // 2.19 - 3.20
    { month: 4, day: 20, name: '白羊座' },    // 3.21 - 4.19
    { month: 5, day: 21, name: '金牛座' },    // 4.20 - 5.20
    { month: 6, day: 22, name: '双子座' },    // 5.21 - 6.21
    { month: 7, day: 23, name: '巨蟹座' },    // 6.22 - 7.22
    { month: 8, day: 23, name: '狮子座' },    // 7.23 - 8.22
    { month: 9, day: 23, name: '处女座' },    // 8.23 - 9.22
    { month: 10, day: 24, name: '天秤座' },   // 9.23 - 10.23
    { month: 11, day: 23, name: '天蝎座' },   // 10.24 - 11.22
    { month: 12, day: 22, name: '射手座' }    // 11.23 - 12.21
  ];

  for (const c of constellations) {
    if ((month === c.month && day >= c.day) || month > c.month) {
      continue;
    }
    // 如果当前月份小于星座起始月份，或者同月但日期小于起始日期，返回上一个星座
    const index = constellations.indexOf(c);
    return index === 0 ? constellations[constellations.length - 1].name : constellations[index - 1].name;
  }

  // 如果遍历完所有星座都匹配不上，说明是摩羯座（12.22 - 1.19 的特殊情况）
  return '摩羯座';
}

/**
 * 根据年份返回年代标签
 * @param {number} year - 公历年份
 * @returns {string} 年代标签，如"90后"
 */
function getGenerationLabel(year) {
  // 1950 年以前
  if (year < 1950) {
    return '50前';
  }

  const decade = Math.floor(year / 10) * 10;

  // 1950-2029 之间的年代
  const labels = {
    1950: '50后',
    1960: '60后',
    1970: '70后',
    1980: '80后',
    1990: '90后',
    2000: '00后',
    2010: '10后',
    2020: '20后'
  };

  if (labels[decade]) {
    return labels[decade];
  }

  // 2030 年以后
  return '30后';
}

/**
 * 根据年月日计算星期几
 * @param {number} year - 公历年份
 * @param {number} month - 月份（1-12）
 * @param {number} day - 日期（1-31）
 * @returns {string} 星期中文名称
 */
function getDayOfWeek(year, month, day) {
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const date = new Date(year, month - 1, day);
  return days[date.getDay()];
}

/**
 * 根据月份和日期判断季节
 * @param {number} month - 月份（1-12）
 * @param {number} day - 日期（1-31）
 * @returns {string} 季节名称（春、夏、秋、冬）
 */
function getSeason(month, day) {
  // 按天文/节气划分：
  // 春季：3月21日 - 6月20日
  // 夏季：6月21日 - 9月22日
  // 秋季：9月23日 - 12月21日
  // 冬季：12月22日 - 3月20日

  const monthDay = month * 100 + day;

  if (monthDay >= 321 && monthDay <= 620) {
    return '春';
  } else if (monthDay >= 621 && monthDay <= 922) {
    return '夏';
  } else if (monthDay >= 923 && monthDay <= 1221) {
    return '秋';
  } else {
    return '冬';
  }
}