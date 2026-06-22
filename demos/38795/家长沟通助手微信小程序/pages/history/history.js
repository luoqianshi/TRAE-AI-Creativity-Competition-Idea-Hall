const storageService = require('../../services/storageService.js')

Page({
  data: {
    scenes: [
      { label: '成绩进步', value: '成绩进步' },
      { label: '成绩退步', value: '成绩退步' },
      { label: '作业完成情况', value: '作业完成情况' },
      { label: '课堂表现', value: '课堂表现' },
      { label: '知识点掌握', value: '知识点掌握情况' },
      { label: '家校配合请求', value: '家校配合请求' }
    ],
    selectedScene: '',
    historyList: []
  },

  onShow: function() {
    this.loadHistory()
  },

  loadHistory: function() {
    let historyList = storageService.getHistory()
    if (this.data.selectedScene) {
      historyList = historyList.filter(h => h.scene === this.data.selectedScene)
    }
    this.setData({ historyList })
  },

  selectScene: function(e) {
    this.setData({ selectedScene: e.currentTarget.dataset.value })
    this.loadHistory()
  },

  copyMessage: function(e) {
    const message = e.currentTarget.dataset.message
    wx.setClipboardData({
      data: message,
      success: () => {
        wx.showToast({ title: '复制成功', icon: 'success' })
      }
    })
  },

  deleteRecord: function(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          storageService.deleteHistory(id)
          wx.showToast({ title: '删除成功', icon: 'success' })
          this.loadHistory()
        }
      }
    })
  },

  clearAll: function() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          storageService.clearHistory()
          wx.showToast({ title: '清空成功', icon: 'success' })
          this.loadHistory()
        }
      }
    })
  },

  formatDate: function(timestamp) {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  }
})
