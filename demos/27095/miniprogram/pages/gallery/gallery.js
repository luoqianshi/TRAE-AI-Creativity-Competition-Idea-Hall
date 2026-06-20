const app = getApp()

Page({
  data: {
    memories: [],
    filteredMemories: [],
    currentFilter: 'all',
    gradients: [
      '#C97B63,#E8A5A5',
      '#D4A574,#C97B63',
      '#E8A5A5,#D4A574',
      '#C97B63,#D4A574',
      '#FFF0EB,#D4A574'
    ]
  },

  onLoad() {
    this.loadMemories()
  },

  onShow() {
    this.loadMemories()
  },

  loadMemories() {
    const memories = app.globalData.memories
    this.setData({
      memories,
      filteredMemories: memories
    })
  },

  setFilter(e) {
    const filter = e.currentTarget.dataset.filter
    let filtered = this.data.memories

    if (filter !== 'all') {
      filtered = this.data.memories.filter(item => item.type === filter)
    }

    this.setData({
      currentFilter: filter,
      filteredMemories: filtered
    })
  },

  viewMemory(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/addMemory/addMemory?id=${id}&mode=view`
    })
  }
})
