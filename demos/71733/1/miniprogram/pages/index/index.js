// pages/index/index.js - 首页（孵蛋/主界面）
const { getPetData, initPetData, clickEgg, feedPet, getCurrentBeastInfo } = require('../../utils/pet-store')
const { BEAST_CONFIG, LEVEL_CONFIG, EGG_CONFIG, FEED_CONFIG } = require('../../utils/constants')

Page({
  data: {
    // 状态
    hasData: false,
    hasEgg: false,
    hasPet: false,

    // 蛋相关
    eggClickCount: 0,
    eggClickTotal: 10,
    eggProgress: 0,

    // 宠物相关
    beastEmoji: '',
    beastName: '',
    beastElement: '',
    beastDescription: '',
    beastId: '',
    level: 1,
    exp: 0,
    expForNextLevel: 0,
    expProgress: 0,
    power: 0,
    totalFeedCount: 0,
    isMaxLevel: false,

    // 主题色
    beastTheme: '',

    // 喂养冷却
    canFeed: true,
    feedCooldownText: '',

    // 动画
    showHatchAnimation: false,
    showLevelUpAnimation: false,
    showFeedAnimation: false,

    // 粒子效果
    particles: []
  },

  onLoad() {
    this.refreshData()
  },

  onShow() {
    this.refreshData()
  },

  /**
   * 刷新页面数据
   */
  refreshData() {
    let petData = getPetData()

    if (!petData) {
      // 首次使用，初始化数据
      petData = initPetData()
    }

    this.setData({
      hasData: true,
      hasEgg: petData.hasEgg,
      hasPet: !!petData.currentPet && !petData.hasEgg
    })

    if (petData.hasEgg) {
      this.updateEggData(petData)
    } else if (petData.currentPet) {
      this.updatePetDisplay(petData)
    }
  },

  /**
   * 更新蛋的显示
   */
  updateEggData(petData) {
    const progress = Math.floor((petData.eggClickCount / EGG_CONFIG.clickToHatch) * 100)
    this.setData({
      eggClickCount: petData.eggClickCount,
      eggProgress: progress
    })
  },

  /**
   * 更新宠物显示
   */
  updatePetDisplay(petData) {
    const beastConfig = BEAST_CONFIG[petData.currentPet]
    if (!beastConfig) return

    const expForNextLevel = LEVEL_CONFIG.getExpForLevel(petData.level)
    const expProgress = petData.level >= LEVEL_CONFIG.maxLevel ? 100 : Math.floor((petData.exp / expForNextLevel) * 100)

    // 检查喂养冷却
    const now = Date.now()
    const canFeed = !petData.lastFeedTime || (now - petData.lastFeedTime) >= FEED_CONFIG.feedCooldown

    this.setData({
      beastEmoji: beastConfig.emoji,
      beastName: beastConfig.name,
      beastElement: beastConfig.element,
      beastDescription: beastConfig.description,
      beastId: petData.currentPet,
      beastTheme: petData.currentPet,
      level: petData.level,
      exp: petData.exp,
      expForNextLevel,
      expProgress,
      power: Math.floor(beastConfig.basePower + petData.level * beastConfig.growthRate),
      totalFeedCount: petData.totalFeedCount,
      isMaxLevel: petData.level >= LEVEL_CONFIG.maxLevel,
      canFeed
    })

    if (!canFeed) {
      this.startCooldownTimer(petData.lastFeedTime)
    }
  },

  /**
   * 喂养冷却计时器
   */
  startCooldownTimer(lastFeedTime) {
    if (this._cooldownTimer) {
      clearInterval(this._cooldownTimer)
    }

    this._cooldownTimer = setInterval(() => {
      const now = Date.now()
      const remaining = FEED_CONFIG.feedCooldown - (now - lastFeedTime)

      if (remaining <= 0) {
        this.setData({ canFeed: true, feedCooldownText: '' })
        clearInterval(this._cooldownTimer)
      } else {
        const seconds = Math.ceil(remaining / 1000)
        this.setData({ feedCooldownText: `${seconds}s` })
      }
    }, 1000)
  },

  /**
   * 点击蛋
   */
  onTapEgg() {
    const result = clickEgg()
    if (result.hatched) {
      // 孵化成功！播放动画
      this.setData({ showHatchAnimation: true })
      this.createParticles()

      setTimeout(() => {
        this.setData({
          showHatchAnimation: false,
          hasEgg: false,
          hasPet: true
        })
        this.refreshData()

        wx.showToast({
          title: `恭喜！${result.beast.name}降临！`,
          icon: 'none',
          duration: 3000
        })
      }, 1500)
    } else if (result.petData && result.petData.hasEgg) {
      this.updateEggData(result.petData)
      // 点击反馈动画
      this.setData({ eggTapScale: true })
      setTimeout(() => this.setData({ eggTapScale: false }), 150)
    }
  },

  /**
   * 喂养宠物
   */
  onFeedPet() {
    if (!this.data.canFeed) {
      wx.showToast({ title: '冷却中...', icon: 'none' })
      return
    }

    const result = feedPet()
    if (!result.canFeed) {
      wx.showToast({ title: '冷却中...', icon: 'none' })
      return
    }

    // 喂养动画
    this.setData({ showFeedAnimation: true })
    setTimeout(() => this.setData({ showFeedAnimation: false }), 500)

    if (result.leveledUp) {
      // 升级动画
      this.setData({ showLevelUpAnimation: true })
      setTimeout(() => this.setData({ showLevelUpAnimation: false }), 1500)

      if (result.maxLevel) {
        wx.showToast({
          title: '🎉 恭喜满级！',
          icon: 'none',
          duration: 3000
        })
      } else {
        wx.showToast({
          title: `⬆️ 升级！Lv.${result.petData.level}`,
          icon: 'none',
          duration: 2000
        })
      }
    }

    this.updatePetDisplay(result.petData)
  },

  /**
   * 跳转到宠物详情页
   */
  onGoToPet() {
    wx.navigateTo({ url: '/pages/pet/pet' })
  },

  /**
   * 创建粒子效果
   */
  createParticles() {
    const particles = []
    for (let i = 0; i < 12; i++) {
      particles.push({
        id: i,
        x: Math.random() * 600,
        y: Math.random() * 600,
        size: 10 + Math.random() * 20,
        delay: Math.random() * 0.5,
        duration: 0.8 + Math.random() * 0.6
      })
    }
    this.setData({ particles })
  },

  onUnload() {
    if (this._cooldownTimer) {
      clearInterval(this._cooldownTimer)
    }
  }
})
