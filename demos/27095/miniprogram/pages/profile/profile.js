const app = getApp()

Page({
  data: {
    memories: [],
    journeyData: {}
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    this.setData({
      memories: app.globalData.memories,
      journeyData: app.globalData.journeyData
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
  }
})
