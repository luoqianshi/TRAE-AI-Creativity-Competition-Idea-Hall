// pet-store.js - 宠物数据管理（本地状态管理）
const { STORAGE_KEYS, DEFAULT_PET_DATA, BEAST_CONFIG, LEVEL_CONFIG, EGG_CONFIG, FEED_CONFIG } = require('./constants')
const { saveToCloud } = require('./sync')

/**
 * 获取本地宠物数据
 * @returns {object} PetData
 */
function getPetData() {
  const data = wx.getStorageSync(STORAGE_KEYS.PET_DATA)
  return data || null
}

/**
 * 保存宠物数据到本地
 * @param {object} petData
 */
function setPetData(petData) {
  wx.setStorageSync(STORAGE_KEYS.PET_DATA, petData)
}

/**
 * 初始化宠物数据（首次使用）
 * @returns {object} 初始 PetData
 */
function initPetData() {
  const petData = JSON.parse(JSON.stringify(DEFAULT_PET_DATA))
  petData.hasEgg = true // 初始给一颗蛋
  petData.updatedAt = new Date().toISOString()
  setPetData(petData)
  return petData
}

/**
 * 更新数据并自动设置 updatedAt
 * @param {object} updates - 要更新的字段
 * @param {boolean} autoSave - 是否自动保存到云端
 */
function updatePetData(updates, autoSave = false) {
  const petData = getPetData() || initPetData()
  Object.assign(petData, updates)
  petData.updatedAt = new Date().toISOString()
  setPetData(petData)

  if (autoSave) {
    saveToCloud(petData).catch(err => {
      console.error('自动保存失败:', err)
    })
  }

  return petData
}

/**
 * 点击蛋
 * @returns {object} { petData, hatched, beast }
 */
function clickEgg() {
  const petData = getPetData()
  if (!petData || !petData.hasEgg) {
    return { petData, hatched: false, beast: null }
  }

  const now = Date.now()
  // 防止连点
  if (petData.lastEggClickTime && (now - petData.lastEggClickTime) < EGG_CONFIG.clickInterval) {
    return { petData, hatched: false, beast: null }
  }

  const newClickCount = petData.eggClickCount + 1
  const updates = {
    eggClickCount: newClickCount,
    lastEggClickTime: now
  }

  // 检查是否达到孵化条件
  if (newClickCount >= EGG_CONFIG.clickToHatch) {
    // 随机孵化一只神兽
    const beastIds = Object.keys(BEAST_CONFIG)
    const randomIndex = Math.floor(Math.random() * beastIds.length)
    const beastId = beastIds[randomIndex]
    const beast = BEAST_CONFIG[beastId]

    updates.hasEgg = false
    updates.currentPet = beastId
    updates.level = 1
    updates.exp = 0
    updates.totalFeedCount = 0
    updates.isEscaped = false
    updates.eggClickCount = 0

    // 添加到收藏
    const collection = [...(petData.collection || [])]
    if (!collection.includes(beastId)) {
      collection.push(beastId)
      updates.newCollectionCount = (petData.newCollectionCount || 0) + 1
    }
    updates.collection = collection

    const updatedData = updatePetData(updates, true) // 孵化成功立即保存到云端
    return { petData: updatedData, hatched: true, beast }
  }

  const updatedData = updatePetData(updates)
  return { petData: updatedData, hatched: false, beast: null }
}

/**
 * 喂养宠物
 * @returns {object} { petData, leveledUp, maxLevel }
 */
function feedPet() {
  const petData = getPetData()
  if (!petData || !petData.currentPet) {
    return { petData, leveledUp: false, maxLevel: false, canFeed: false }
  }

  const now = Date.now()
  // 冷却检查
  if (petData.lastFeedTime && (now - petData.lastFeedTime) < FEED_CONFIG.feedCooldown) {
    return { petData, leveledUp: false, maxLevel: false, canFeed: false }
  }

  let leveledUp = false
  let maxLevel = false
  let newExp = petData.exp + FEED_CONFIG.feedExpGain
  let newLevel = petData.level
  const newTotalFeedCount = petData.totalFeedCount + 1

  // 检查升级
  while (newExp >= LEVEL_CONFIG.getExpForLevel(newLevel) && newLevel < LEVEL_CONFIG.maxLevel) {
    newExp -= LEVEL_CONFIG.getExpForLevel(newLevel)
    newLevel++
    leveledUp = true
  }

  if (newLevel >= LEVEL_CONFIG.maxLevel) {
    maxLevel = true
    newExp = 0
  }

  const updates = {
    exp: newExp,
    level: newLevel,
    lastFeedTime: now,
    totalFeedCount: newTotalFeedCount
  }

  // 满级立即保存，升级也立即保存
  const shouldSave = leveledUp || maxLevel
  const updatedData = updatePetData(updates, shouldSave)

  return { petData: updatedData, leveledUp, maxLevel, canFeed: true }
}

/**
 * 计算神兽战力
 * @param {string} beastId - 神兽ID
 * @param {number} level - 等级
 * @returns {number} 战力值
 */
function calculatePower(beastId, level) {
  const beast = BEAST_CONFIG[beastId]
  if (!beast) return 0
  return Math.floor(beast.basePower + level * beast.growthRate)
}

/**
 * 领养新神兽（当前神兽满级后）
 * @param {string} beastId - 新神兽ID
 * @returns {object} { petData, success }
 */
function adoptNewBeast(beastId) {
  const petData = getPetData()
  if (!petData || !petData.currentPet) {
    return { petData, success: false }
  }

  // 保存当前神兽到 savedBeasts
  const savedBeasts = { ...(petData.savedBeasts || {}) }
  savedBeasts[petData.currentPet] = {
    level: petData.level,
    exp: petData.exp,
    totalFeedCount: petData.totalFeedCount
  }

  // 添加到收藏
  const collection = [...(petData.collection || [])]
  if (!collection.includes(beastId)) {
    collection.push(beastId)
  }

  const updates = {
    savedBeasts,
    collection,
    currentPet: beastId,
    level: 1,
    exp: 0,
    totalFeedCount: 0,
    isEscaped: false
  }

  const updatedData = updatePetData(updates, true) // 领养新神兽立即保存
  return { petData: updatedData, success: true }
}

/**
 * 切换神兽
 * @param {string} beastId - 要切换到的神兽ID
 * @returns {object} { petData, success }
 */
function switchToBeast(beastId) {
  const petData = getPetData()
  if (!petData || !petData.currentPet) {
    return { petData, success: false }
  }

  // 保存当前神兽状态
  const savedBeasts = { ...(petData.savedBeasts || {}) }
  savedBeasts[petData.currentPet] = {
    level: petData.level,
    exp: petData.exp,
    totalFeedCount: petData.totalFeedCount
  }

  // 加载目标神兽状态
  const targetBeast = savedBeasts[beastId]
  const updates = {
    savedBeasts,
    currentPet: beastId
  }

  if (targetBeast) {
    updates.level = targetBeast.level
    updates.exp = targetBeast.exp
    updates.totalFeedCount = targetBeast.totalFeedCount
    delete savedBeasts[beastId]
  } else {
    updates.level = 1
    updates.exp = 0
    updates.totalFeedCount = 0
  }

  const updatedData = updatePetData(updates, true) // 切换神兽立即保存
  return { petData: updatedData, success: true }
}

/**
 * 获取当前神兽信息
 * @returns {object|null} { config, power, expProgress }
 */
function getCurrentBeastInfo() {
  const petData = getPetData()
  if (!petData || !petData.currentPet) return null

  const config = BEAST_CONFIG[petData.currentPet]
  const power = calculatePower(petData.currentPet, petData.level)
  const expForNextLevel = LEVEL_CONFIG.getExpForLevel(petData.level)
  const expProgress = petData.level >= LEVEL_CONFIG.maxLevel ? 100 : Math.floor((petData.exp / expForNextLevel) * 100)

  return {
    config,
    power,
    expProgress,
    expForNextLevel,
    level: petData.level,
    exp: petData.exp
  }
}

module.exports = {
  getPetData,
  setPetData,
  initPetData,
  updatePetData,
  clickEgg,
  feedPet,
  calculatePower,
  adoptNewBeast,
  switchToBeast,
  getCurrentBeastInfo
}
