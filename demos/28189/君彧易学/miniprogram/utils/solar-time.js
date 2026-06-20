/**
 * 真太阳时计算工具
 * 
 * 公式：真太阳时 = 平太阳时（北京时间）+ 经度修正 + 均时差(EoT)
 *   - 经度修正 = (当地经度 - 120°) × 4分钟/度
 *   - 均时差 ≈ 轨道椭圆 + 黄赤交角导致的时差（±15分钟）
 */

/**
 * 计算均时差（Equation of Time），单位：分钟
 * @param {number} dayOfYear - 一年中的第几天 (1~366)
 * @returns {number} 均时差（分钟），正值表示真太阳时快于平太阳时
 */
function equationOfTime(dayOfYear) {
  // 以弧度表示的地球轨道角度
  const B = 2 * Math.PI * (dayOfYear - 1) / 365;
  const B2 = 2 * B;

  // Spencer公式，精度约±1.7秒
  const eot = 229.18 * (
    0.000075
    + 0.001868 * Math.cos(B)
    - 0.032077 * Math.sin(B)
    - 0.014615 * Math.cos(B2)
    - 0.040849 * Math.sin(B2)
  );

  return eot; // 分钟
}

/**
 * 获取一年中的第几天
 * @param {number} year
 * @param {number} month - 1~12
 * @param {number} day - 1~31
 * @returns {number}
 */
function getDayOfYear(year, month, day) {
  const date = new Date(year, month - 1, day);
  const startOfYear = new Date(year, 0, 1);
  return Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
}

/**
 * 计算真太阳时
 * @param {Object} params
 * @param {number} params.year    - 公历年
 * @param {number} params.month   - 公历月 (1~12)
 * @param {number} params.day     - 公历日
 * @param {number} params.hour    - 北京时间 时 (0~23)
 * @param {number} params.minute  - 北京时间 分 (0~59)
 * @param {number} params.lng     - 当地经度（东经为正）
 * @returns {{ hour: number, minute: number }} 真太阳时
 */
function calcTrueSolarTime({ year, month, day, hour, minute, lng }) {
  // 1. 经度修正（分钟）：东经每偏离120°一度，差4分钟
  const lonOffset = (lng - 120) * 4;

  // 2. 均时差（分钟）
  const dayOfYear = getDayOfYear(year, month, day);
  const eot = equationOfTime(dayOfYear);

  // 3. 平太阳时（北京时间 → 分钟）
  const meanMinutes = hour * 60 + (minute || 0);

  // 4. 真太阳时 = 平太阳时 + 经度修正 + 均时差
  let trueMinutes = meanMinutes + lonOffset + eot;

  // 5. 处理越界（限制在 0~1439 分钟）
  trueMinutes = ((trueMinutes % 1440) + 1440) % 1440;

  const trueHour = Math.floor(trueMinutes / 60);
  const trueMinute = Math.round(trueMinutes % 60);

  return {
    hour: trueHour,
    minute: trueMinute
  };
}

module.exports = {
  calcTrueSolarTime,
  equationOfTime,
  getDayOfYear
};
