/**
 * 生日提醒调度云函数
 * 定时触发：每天凌晨 1:00 执行
 * 扫描所有生日记录，为当天及未来需要提醒的记录生成提醒任务
 */

const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()
const _ = db.command

// 农历公历转换工具（简化版，用于云函数）
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

function getLunarYearInfo(year) {
  const info = LUNAR_INFO[year - 1900]
  const leapMonth = info & 0x0f
  const leapDays = (info >> 16) & 0x01 ? 30 : 29
  const monthDays = []
  let totalDays = 0
  for (let i = 0; i < 12; i++) {
    const days = (info >> (16 - i)) & 0x01 ? 30 : 29
    monthDays.push(days)
    totalDays += days
  }
  if (leapMonth > 0) totalDays += leapDays
  return { leapMonth, leapDays, monthDays, totalDays }
}

function getDaysInMonth(year, month) {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
  if (month === 2 && isLeap) return 29
  return days[month - 1]
}

function lunarToSolar(lunarYear, lunarMonth, lunarDay) {
  let offset = 0
  for (let i = 0; i < lunarMonth - 1; i++) {
    offset += getLunarYearInfo(lunarYear).monthDays[i]
    if (getLunarYearInfo(lunarYear).leapMonth === i + 1) {
      offset += getLunarYearInfo(lunarYear).leapDays
    }
  }
  offset += lunarDay - 1

  let totalDays = 0
  for (let y = 1900; y < lunarYear; y++) {
    totalDays += getLunarYearInfo(y).totalDays
  }
  totalDays += offset

  let currentYear = 1900, currentMonth = 1, currentDay = 31
  let remaining = totalDays
  while (remaining > 0) {
    const dim = getDaysInMonth(currentYear, currentMonth)
    const left = dim - currentDay + 1
    if (remaining < left) {
      currentDay += remaining
      remaining = 0
    } else {
      remaining -= left
      currentMonth++
      currentDay = 1
      if (currentMonth > 12) { currentMonth = 1; currentYear++ }
    }
  }
  return { year: currentYear, month: currentMonth, day: currentDay }
}

function getSolarDateForLunarBirthday(lunarMonth, lunarDay, targetYear) {
  let result = lunarToSolar(targetYear, lunarMonth, lunarDay)
  if (result) return result
  const info = getLunarYearInfo(targetYear)
  if (info.leapMonth === lunarMonth) {
    // 尝试闰月
  }
  return result
}

function getNextBirthdaySolarDate(birthdayType, birthdayMonth, birthdayDay) {
  const now = new Date()
  const currentYear = now.getFullYear()

  if (birthdayType === 'solar') {
    let target = new Date(currentYear, birthdayMonth - 1, birthdayDay)
    if (target < now) target = new Date(currentYear + 1, birthdayMonth - 1, birthdayDay)
    return target
  } else {
    let solar = getSolarDateForLunarBirthday(birthdayMonth, birthdayDay, currentYear)
    let target = new Date(solar.year, solar.month - 1, solar.day)
    if (target < now) {
      solar = getSolarDateForLunarBirthday(birthdayMonth, birthdayDay, currentYear + 1)
      target = new Date(solar.year, solar.month - 1, solar.day)
    }
    return target
  }
}

function formatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

exports.main = async (event, context) => {
  const now = new Date()
  const todayStr = formatDate(now)

  try {
    // 1. 获取所有生日记录
    const { data: birthdays } = await db.collection('birthdays').get()

    let createdCount = 0

    for (const birthday of birthdays) {
      // 计算下一个生日的公历日期
      const nextBirthday = getNextBirthdaySolarDate(
        birthday.birthdayType,
        birthday.birthdayMonth,
        birthday.birthdayDay
      )
      const nextBirthdayStr = formatDate(nextBirthday)

      // 计算距离今天的天数
      const diffDays = Math.ceil((nextBirthday - now) / (1000 * 60 * 60 * 24))

      const strategies = Array.isArray(birthday.remindStrategy) && birthday.remindStrategy.length > 0
        ? birthday.remindStrategy
        : (birthday.remindDays || []).map(day => ({
            daysBefore: day,
            time: birthday.reminderTime || '09:00',
            channels: [
              ...(birthday.enableWechat !== false ? ['wechat'] : []),
              ...(birthday.enableEmail && birthday.email ? ['email'] : [])
            ]
          }))

      const matchedStrategies = strategies.filter(strategy => Number(strategy.daysBefore || 0) === diffDays)
      if (matchedStrategies.length === 0) continue

      for (const strategy of matchedStrategies) {
        const channels = Array.isArray(strategy.channels) ? strategy.channels : []
        const scheduledTime = strategy.time || '09:00'

        for (const channel of channels) {
          if (channel === 'email' && !birthday.email) continue
          if (channel !== 'wechat' && channel !== 'email') continue

          const { data: existingLogs } = await db.collection('reminder_logs')
            .where({
              birthdayId: birthday._id,
              scheduledDate: todayStr,
              scheduledTime,
              daysBefore: Number(strategy.daysBefore || 0),
              channel
            })
            .get()

          if (existingLogs.length > 0) continue

          await db.collection('reminder_logs').add({
            data: {
              birthdayId: birthday._id,
              userOpenId: birthday.userOpenId,
              channel,
              daysBefore: Number(strategy.daysBefore || 0),
              scheduledDate: todayStr,
              targetBirthdayDate: nextBirthdayStr,
              scheduledTime,
              status: 'pending',
              createdAt: db.serverDate()
            }
          })
          createdCount++
        }
      }
    }

    return {
      success: true,
      message: `调度完成，创建了 ${createdCount} 条提醒任务`,
      date: todayStr,
      totalBirthdays: birthdays.length
    }
  } catch (err) {
    console.error('调度失败:', err)
    return { success: false, error: err.message }
  }
}
