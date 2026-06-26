/**
 * 农历公历转换工具
 * 基于1900-2100年的农历数据
 */

// 农历1900-2100年数据，每个元素代表一年，16进制字符串
// 格式：前12位代表每月大小月（1=大月30天，0=小月29天），第13位代表闰月月份（0=无闰月），最后几位代表闰月大小
const LUNAR_INFO = [
  0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
  0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
  0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
  0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
  0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
  0x06ca0,0x0b550,0x15355,0x04da0,0x0a5d0,0x14573,0x052d0,0x0a9a8,0x0e950,0x06aa0,
  0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
  0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b5a0,0x195a6,
  0x095b0,0x049b0,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
  0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
  0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
  0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
  0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
  0x05aa0,0x076a3,0x096d0,0x04bd7,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
  0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0
]

const MIN_YEAR = 1900
const MAX_YEAR = 2100

// 天干
const HEAVENLY_STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸']
// 地支
const EARTHLY_BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
// 生肖
const ZODIAC_ANIMALS = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪']
// 农历月份名称
const LUNAR_MONTHS = ['正','二','三','四','五','六','七','八','九','十','冬','腊']
// 农历日期名称
const LUNAR_DAYS = [
  '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'
]

/**
 * 判断某年是否为闰年
 */
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

/**
 * 获取某年某月的天数
 */
function getDaysInMonth(year, month) {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month === 2 && isLeapYear(year)) return 29
  return days[month - 1]
}

/**
 * 获取某年的农历信息
 * @returns {Object} { leapMonth: 闰月月份(0=无), monthDays: [每月天数], totalDays: 总天数 }
 */
function getLunarYearInfo(year) {
  const info = LUNAR_INFO[year - MIN_YEAR]
  const leapMonth = info & 0x0f
  const leapDays = (info >> 16) & 0x01 ? 30 : 29
  const monthDays = []
  let totalDays = 0

  for (let i = 0; i < 12; i++) {
    const days = (info >> (16 - i)) & 0x01 ? 30 : 29
    monthDays.push(days)
    totalDays += days
  }

  if (leapMonth > 0) {
    totalDays += leapDays
  }

  return { leapMonth, leapDays, monthDays, totalDays }
}

/**
 * 公历转农历
 * @param {number} year 公历年
 * @param {number} month 公历月 (1-12)
 * @param {number} day 公历日
 * @returns {Object|null} { lunarYear, lunarMonth, lunarDay, isLeap }
 */
function solarToLunar(year, month, day) {
  if (year < MIN_YEAR || year > MAX_YEAR) return null

  // 计算从1900年1月31日（农历1900年正月初一）到目标日期的天数
  let offset = 0
  for (let y = MIN_YEAR; y < year; y++) {
    const info = getLunarYearInfo(y)
    offset += info.totalDays
  }

  for (let m = 1; m < month; m++) {
    offset += getDaysInMonth(year, m)
  }
  offset += day - 1

  // 1900年1月31日是农历正月初一，所以offset从0开始
  // 但我们的LUNAR_INFO从1900年开始，1900年正月初一是第0天
  // 实际上1900年1月1日到1月30日属于1899年农历
  // 简化处理：从1900年1月31日开始计算

  // 重新计算：从1900年1月31日开始
  let daysFrom1900_1_31 = 0
  for (let y = MIN_YEAR; y < year; y++) {
    const info = getLunarYearInfo(y)
    daysFrom1900_1_31 += info.totalDays
  }

  for (let m = 1; m < month; m++) {
    daysFrom1900_1_31 += getDaysInMonth(year, m)
  }
  daysFrom1900_1_31 += day - 31 // 1月31日为第0天

  if (daysFrom1900_1_31 < 0) {
    // 1900年1月1日-30日，属于1899年农历
    return null
  }

  // 逐年逐月查找对应的农历日期
  let remaining = daysFrom1900_1_31
  let lunarYear = MIN_YEAR

  while (true) {
    const info = getLunarYearInfo(lunarYear)
    if (remaining < info.totalDays) break
    remaining -= info.totalDays
    lunarYear++
  }

  const info = getLunarYearInfo(lunarYear)
  let lunarMonth = 1
  let isLeap = false

  for (let i = 0; i < 12; i++) {
    if (remaining < info.monthDays[i]) {
      lunarMonth = i + 1
      break
    }
    remaining -= info.monthDays[i]

    // 检查闰月
    if (info.leapMonth === i + 1) {
      if (remaining < info.leapDays) {
        lunarMonth = i + 1
        isLeap = true
        break
      }
      remaining -= info.leapDays
    }
    lunarMonth = i + 2
  }

  // 如果遍历完12个月还没找到，说明在闰月之后
  if (lunarMonth > 12) {
    lunarMonth = 12
    const lastMonthDays = info.monthDays[11]
    if (remaining >= lastMonthDays) {
      remaining -= lastMonthDays
      if (info.leapMonth === 12) {
        if (remaining < info.leapDays) {
          isLeap = true
        } else {
          remaining -= info.leapDays
        }
      }
    }
  }

  const lunarDay = remaining + 1

  return { lunarYear, lunarMonth, lunarDay, isLeap }
}

/**
 * 农历转公历
 * @param {number} lunarYear 农历年
 * @param {number} lunarMonth 农历月 (1-12)
 * @param {number} lunarDay 农历日
 * @param {boolean} isLeap 是否闰月
 * @returns {Object|null} { year, month, day }
 */
function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeap = false) {
  if (lunarYear < MIN_YEAR || lunarYear > MAX_YEAR) return null
  if (lunarMonth < 1 || lunarMonth > 12) return null
  if (lunarDay < 1 || lunarDay > 30) return null

  const info = getLunarYearInfo(lunarYear)

  // 检查闰月合法性
  if (isLeap && info.leapMonth !== lunarMonth) return null

  // 计算从农历正月初一到目标日期的天数
  let offset = 0
  for (let i = 0; i < lunarMonth - 1; i++) {
    offset += info.monthDays[i]
    if (info.leapMonth === i + 1) {
      offset += info.leapDays
    }
  }

  if (isLeap) {
    offset += info.monthDays[lunarMonth - 1]
  }

  offset += lunarDay - 1

  // 计算从1900年1月31日开始的总天数
  let totalDays = 0
  for (let y = MIN_YEAR; y < lunarYear; y++) {
    totalDays += getLunarYearInfo(y).totalDays
  }
  totalDays += offset

  // 转换回公历
  let year = MIN_YEAR
  let month = 1
  let day = 31

  // 从1900年1月31日开始加天数
  let remaining = totalDays
  let currentYear = 1900
  let currentMonth = 1
  let currentDay = 31

  while (remaining > 0) {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const daysLeftInMonth = daysInMonth - currentDay + 1

    if (remaining < daysLeftInMonth) {
      currentDay += remaining
      remaining = 0
    } else {
      remaining -= daysLeftInMonth
      currentMonth++
      currentDay = 1
      if (currentMonth > 12) {
        currentMonth = 1
        currentYear++
      }
    }
  }

  return { year: currentYear, month: currentMonth, day: currentDay }
}

/**
 * 获取某年农历某月某日的公历日期
 * 用于每年自动计算农历生日对应的公历日期
 */
function getSolarDateForLunarBirthday(lunarMonth, lunarDay, targetYear) {
  // 先尝试非闰月
  let result = lunarToSolar(targetYear, lunarMonth, lunarDay, false)
  if (result) return result

  // 如果该年有闰月且正好是目标月份，尝试闰月
  const info = getLunarYearInfo(targetYear)
  if (info.leapMonth === lunarMonth) {
    result = lunarToSolar(targetYear, lunarMonth, lunarDay, true)
  }

  return result
}

/**
 * 获取农历日期字符串
 */
function getLunarDateString(lunarYear, lunarMonth, lunarDay, isLeap) {
  const stem = HEAVENLY_STEMS[(lunarYear - 4) % 10]
  const branch = EARTHLY_BRANCHES[(lunarYear - 4) % 12]
  const zodiac = ZODIAC_ANIMALS[(lunarYear - 4) % 12]
  const leapStr = isLeap ? '闰' : ''
  return `${stem}${branch}年(${zodiac}) ${leapStr}${LUNAR_MONTHS[lunarMonth - 1]}月${LUNAR_DAYS[lunarDay - 1]}`
}

/**
 * 计算距离下一个生日还有多少天
 */
function getDaysUntilBirthday(birthdayMonth, birthdayDay, birthdayType, isLeap = false) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const currentDay = now.getDate()

  let targetDate

  if (birthdayType === 'solar') {
    // 公历生日
    targetDate = new Date(currentYear, birthdayMonth - 1, birthdayDay)
    if (targetDate < now) {
      targetDate = new Date(currentYear + 1, birthdayMonth - 1, birthdayDay)
    }
  } else {
    // 农历生日
    let solar = getSolarDateForLunarBirthday(birthdayMonth, birthdayDay, currentYear)
    if (!solar) {
      // 如果当年没有对应的农历日期（比如闰月问题），尝试下一年
      solar = getSolarDateForLunarBirthday(birthdayMonth, birthdayDay, currentYear + 1)
    }
    targetDate = new Date(solar.year, solar.month - 1, solar.day)
    if (targetDate < now) {
      solar = getSolarDateForLunarBirthday(birthdayMonth, birthdayDay, currentYear + 1)
      if (solar) {
        targetDate = new Date(solar.year, solar.month - 1, solar.day)
      }
    }
  }

  const diffTime = targetDate - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return {
    daysUntil: diffDays,
    targetDate: targetDate,
    targetDateStr: `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`
  }
}

module.exports = {
  solarToLunar,
  lunarToSolar,
  getSolarDateForLunarBirthday,
  getLunarDateString,
  getDaysUntilBirthday,
  isLeapYear
}
