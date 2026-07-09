// arena-store.js - 竞技场数据管理
const { ARENA_CONFIG, STORAGE_KEYS, BEAST_CONFIG } = require('./constants')
const { getPetData, updatePetData, calculatePower } = require('./pet-store')
const { saveToCloud } = require('./sync')

/**
 * 获取竞技场等级配置列表
 * @returns {Array} 竞技场列表
 */
function getArenaList() {
  return Object.values(ARENA_CONFIG.levels)
}

/**
 * 检查每日重置
 * @param {object} petData
 * @returns {object} petData (可能已重置)
 */
function checkDailyReset(petData) {
  const today = new Date().toISOString().split('T')[0]
  if (petData.lastArenaResetDate !== today) {
    petData.dailyArenaCounts = {}
    petData.lastArenaResetDate = today
  }
  return petData
}

/**
 * 获取某竞技场今日剩余次数
 * @param {string} arenaId - 竞技场ID
 * @returns {number} 剩余次数
 */
function getRemainingCount(arenaId) {
  let petData = getPetData()
  if (!petData) return 0

  petData = checkDailyReset(petData)
  const arenaLevel = ARENA_CONFIG.levels[arenaId]
  if (!arenaLevel) return 0

  const usedCount = petData.dailyArenaCounts[arenaId] || 0
  return Math.max(0, arenaLevel.dailyLimit - usedCount)
}

/**
 * 执行竞技场战斗
 * @param {string} arenaId - 竞技场ID
 * @returns {object} { success, victory, expReward, message }
 */
function fightArena(arenaId) {
  let petData = getPetData()
  if (!petData || !petData.currentPet) {
    return { success: false, victory: false, expReward: 0, message: '还没有宠物哦' }
  }

  petData = checkDailyReset(petData)
  const arenaLevel = ARENA_CONFIG.levels[arenaId]
  if (!arenaLevel) {
    return { success: false, victory: false, expReward: 0, message: '竞技场不存在' }
  }

  // 检查战力要求
  const myPower = calculatePower(petData.currentPet, petData.level)
  if (myPower < arenaLevel.powerRequirement) {
    return {
      success: false,
      victory: false,
      expReward: 0,
      message: `战力不足，需要 ${arenaLevel.powerRequirement}，当前 ${myPower}`
    }
  }

  // 检查次数
  const usedCount = petData.dailyArenaCounts[arenaId] || 0
  if (usedCount >= arenaLevel.dailyLimit) {
    return { success: false, victory: false, expReward: 0, message: '今日次数已用完' }
  }

  // 战斗逻辑：基于战力的概率计算
  const powerRatio = myPower / (arenaLevel.powerRequirement || 1)
  // 基础胜率 = 50% + 战力优势加成（最多90%）
  const winRate = Math.min(0.9, 0.5 + (powerRatio - 1) * 0.2)
  const victory = Math.random() < winRate

  // 更新使用次数
  const dailyArenaCounts = { ...(petData.dailyArenaCounts || {}) }
  dailyArenaCounts[arenaId] = (dailyArenaCounts[arenaId] || 0) + 1

  const updates = {
    dailyArenaCounts,
    lastArenaResetDate: petData.lastArenaResetDate
  }

  let expReward = 0
  if (victory) {
    expReward = arenaLevel.expReward
    // 增加经验
    let newExp = petData.exp + expReward
    const { LEVEL_CONFIG } = require('./constants')
    let newLevel = petData.level
    while (newExp >= LEVEL_CONFIG.getExpForLevel(newLevel) && newLevel < LEVEL_CONFIG.maxLevel) {
      newExp -= LEVEL_CONFIG.getExpForLevel(newLevel)
      newLevel++
    }
    if (newLevel >= LEVEL_CONFIG.maxLevel) {
      newExp = 0
    }
    updates.exp = newExp
    updates.level = newLevel
  }

  updatePetData(updates, victory) // 胜利时自动保存

  return {
    success: true,
    victory,
    expReward,
    arenaId,
    message: victory ? '战斗胜利！' : '战斗失败，下次再接再厉'
  }
}

/**
 * 获取所有竞技场状态
 * @returns {Array} 竞技场状态列表
 */
function getArenaStatus() {
  let petData = getPetData()
  if (!petData) {
    return getArenaList().map(arena => ({
      ...arena,
      remaining: 0,
      locked: true,
      myPower: 0
    }))
  }

  petData = checkDailyReset(petData)
  const myPower = petData.currentPet ? calculatePower(petData.currentPet, petData.level) : 0

  return getArenaList().map(arena => {
    const usedCount = petData.dailyArenaCounts[arena.id] || 0
    return {
      ...arena,
      remaining: Math.max(0, arena.dailyLimit - usedCount),
      locked: myPower < arena.powerRequirement,
      myPower
    }
  })
}

module.exports = {
  getArenaList,
  getRemainingCount,
  fightArena,
  getArenaStatus,
  checkDailyReset
}
