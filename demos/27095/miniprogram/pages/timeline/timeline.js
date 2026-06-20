const app = getApp()

Page({
  data: {
    memories: []
  },

  onLoad() {
    this.loadMemories()
  },

  onShow() {
    this.loadMemories()
  },

  loadMemories() {
    const memories = app.globalData.memories
    this.setData({ memories })
  },

  viewMemory(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/addMemory/addMemory?id=${id}&mode=view`
    })
  }
})
