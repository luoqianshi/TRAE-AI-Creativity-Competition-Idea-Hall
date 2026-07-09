// pages/collection/collection.js - 图鉴页面
const { getPetData, calculatePower } = require('../../utils/pet-store')
const { BEAST_CONFIG, LEVEL_CONFIG } = require('../../utils/constants')

Page({
  data: {
    // 图鉴列表
    beasts: [],
    // 收藏进度
    collectedCount: 0,
    totalBeasts: 4,
    // 选中的神兽详情
    selectedBeast: null,
    showDetail: false
  },

  onLoad() {
    this.refreshData()
  },

  onShow() {
    this.refreshData()
  },

  refreshData() {
    const petData = getPetData()
    const collection = petData ? (petData.collection || []) : []
    const currentPet = petData ? petData.currentPet : null
    const savedBeasts = petData ? (petData.savedBeasts || {}) : {}

    const beasts = Object.values(BEAST_CONFIG).map(config => {
      const isCollected = collection.includes(config.id)
      const isCurrent = config.id === currentPet
      const savedData = savedBeasts[config.id]

      let level = 0
      let power = 0
      let totalFeedCount = 0

      if (isCurrent && petData) {
        level = petData.level
        power = calculatePower(config.id, petData.level)
        totalFeedCount = petData.totalFeedCount
      } else if (savedData) {
        level = savedData.level
        power = calculatePower(config.id, savedData.level)
        totalFeedCount = savedData.totalFeedCount
      }

      return {
        ...config,
        isCollected,
        isCurrent,
        level,
        power,
        totalFeedCount
      }
    })

    const collectedCount = beasts.filter(b => b.isCollected).length

    this.setData({
      beasts,
      collectedCount,
      totalBeasts: Object.keys(BEAST_CONFIG).length
    })
  },

  /**
   * 查看神兽详情
   */
  onTapBeast(e) {
    const beastId = e.currentTarget.dataset.id
    const beast = this.data.beasts.find(b => b.id === beastId)

    if (!beast || !beast.isCollected) {
      wx.showToast({ title: '尚未收集', icon: 'none' })
      return
    }

    this.setData({
      selectedBeast: beast,
      showDetail: true
    })
  },

  /**
   * 关闭详情
   */
  onCloseDetail() {
    this.setData({ showDetail: false })
  },

  /**
   * 阻止冒泡
   */
  preventBubble() {}
})
