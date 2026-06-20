const app = getApp()

Page({
  data: {
    memories: [],
    recentMemories: [],
    journeyData: {}
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const memories = app.globalData.memories
    const journeyData = app.globalData.journeyData
    const recentMemories = [...memories].reverse().slice(0, 5)

    this.setData({
      memories,
      recentMemories,
      journeyData
    })
  },

  goToTimeline() {
    wx.switchTab({ url: '/pages/timeline/timeline' })
  },

  goToGallery() {
    wx.switchTab({ url: '/pages/gallery/gallery' })
  },

  goToJourney() {
    wx.switchTab({ url: '/pages/journey/journey' })
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/addMemory/addMemory' })
  },

  viewMemory(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/addMemory/addMemory?id=${id}&mode=view`
    })
  }
})
