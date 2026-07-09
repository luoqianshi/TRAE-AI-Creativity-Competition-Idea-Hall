// pages/pet/pet.js - 宠物详情页
const { getPetData, switchToBeast, adoptNewBeast, calculatePower } = require('../../utils/pet-store')
const { BEAST_CONFIG, LEVEL_CONFIG } = require('../../utils/constants')

Page({
  data: {
    // 当前神兽
    currentBeast: null,
    beastEmoji: '',
    beastName: '',
    beastElement: '',
    beastDescription: '',
    beastColor: '',
    level: 1,
    exp: 0,
    expForNextLevel: 0,
    expProgress: 0,
    power: 0,
    totalFeedCount: 0,
    isMaxLevel: false,

    // 已保存的神兽
    savedBeasts: [],
    allBeasts: [],

    // 可领养的神兽
    adoptableBeasts: [],

    // 切换弹窗
    showSwitchModal: false,
    showAdoptModal: false,

    // 收藏数
    collectionCount: 0
  },

  onLoad() {
    this.refreshData()
  },

  onShow() {
    this.refreshData()
  },

  refreshData() {
    const petData = getPetData()
    if (!petData || !petData.currentPet) {
      wx.showToast({ title: '还没有宠物哦', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }

    const beastConfig = BEAST_CONFIG[petData.currentPet]
    const expForNextLevel = LEVEL_CONFIG.getExpForLevel(petData.level)
    const expProgress = petData.level >= LEVEL_CONFIG.maxLevel ? 100 : Math.floor((petData.exp / expForNextLevel) * 100)

    // 构建已保存神兽列表
    const savedBeasts = []
    const savedData = petData.savedBeasts || {}
    Object.keys(savedData).forEach(beastId => {
      const config = BEAST_CONFIG[beastId]
      if (config) {
        savedBeasts.push({
          id: beastId,
          ...config,
          level: savedData[beastId].level,
          power: calculatePower(beastId, savedData[beastId].level)
        })
      }
    })

    // 构建所有神兽列表（用于切换/领养）
    const allBeasts = Object.values(BEAST_CONFIG).map(config => ({
      ...config,
      isCurrent: config.id === petData.currentPet,
      isSaved: !!savedData[config.id],
      isCollected: (petData.collection || []).includes(config.id)
    }))

    // 可领养的神兽（未拥有的）
    const adoptableBeasts = allBeasts.filter(b => !b.isCurrent && !b.isSaved && !b.isCollected)

    this.setData({
      currentBeast: petData.currentPet,
      beastEmoji: beastConfig.emoji,
      beastName: beastConfig.name,
      beastElement: beastConfig.element,
      beastDescription: beastConfig.description,
      beastColor: beastConfig.color,
      level: petData.level,
      exp: petData.exp,
      expForNextLevel,
      expProgress,
      power: calculatePower(petData.currentPet, petData.level),
      totalFeedCount: petData.totalFeedCount,
      isMaxLevel: petData.level >= LEVEL_CONFIG.maxLevel,
      savedBeasts,
      allBeasts,
      adoptableBeasts,
      collectionCount: (petData.collection || []).length
    })
  },

  /**
   * 切换神兽
   */
  onSwitchBeast() {
    this.setData({ showSwitchModal: true })
  },

  onCloseSwitchModal() {
    this.setData({ showSwitchModal: false })
  },

  onSelectBeast(e) {
    const beastId = e.currentTarget.dataset.id
    if (beastId === this.data.currentBeast) return

    wx.showModal({
      title: '切换神兽',
      content: `确定切换到${BEAST_CONFIG[beastId].name}吗？`,
      success: (res) => {
        if (res.confirm) {
          const result = switchToBeast(beastId)
          if (result.success) {
            wx.showToast({ title: '切换成功', icon: 'success' })
            this.setData({ showSwitchModal: false })
            this.refreshData()
          }
        }
      }
    })
  },

  /**
   * 领养新神兽
   */
  onAdoptBeast() {
    this.setData({ showAdoptModal: true })
  },

  onCloseAdoptModal() {
    this.setData({ showAdoptModal: false })
  },

  onSelectAdopt(e) {
    const beastId = e.currentTarget.dataset.id
    wx.showModal({
      title: '领养神兽',
      content: `确定领养${BEAST_CONFIG[beastId].name}吗？当前神兽数据将被保存。`,
      success: (res) => {
        if (res.confirm) {
          const result = adoptNewBeast(beastId)
          if (result.success) {
            wx.showToast({ title: '领养成功！', icon: 'success' })
            this.setData({ showAdoptModal: false })
            this.refreshData()
          }
        }
      }
    })
  },

  /**
   * 阻止冒泡
   */
  preventBubble() {}
})
