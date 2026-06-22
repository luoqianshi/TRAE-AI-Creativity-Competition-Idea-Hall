const storageService = require('../../services/storageService.js')

Page({
  data: {
    message: '',
    suggestions: []
  },

  onLoad: function(options) {
    if (options.message) {
      this.setData({ message: decodeURIComponent(options.message) })
    }
    if (options.suggestions) {
      try {
        this.setData({ suggestions: JSON.parse(decodeURIComponent(options.suggestions)) })
      } catch (e) {
        this.setData({ suggestions: [] })
      }
    }
  },

  onMessageInput: function(e) {
    this.setData({ message: e.detail.value })
  },

  copyMessage: function() {
    wx.setClipboardData({
      data: this.data.message,
      success: function() {
        wx.showToast({ title: '复制成功', icon: 'success' })
      },
      fail: function() {
        wx.showToast({ title: '复制失败', icon: 'none' })
      }
    })
  },

  saveAsTemplate: function() {
    wx.showModal({
      title: '保存模板',
      editable: true,
      placeholderText: '请输入模板名称',
      success: (res) => {
        if (res.confirm && res.content.trim()) {
          storageService.saveTemplate({
            id: Date.now().toString(),
            name: res.content.trim(),
            scene: '自定义',
            style: '自定义',
            channel: '自定义',
            content: this.data.message,
            createdAt: Date.now()
          })
          wx.showToast({ title: '保存成功', icon: 'success' })
        }
      }
    })
  },

  regenerate: function() {
    wx.navigateBack()
  },

  goBack: function() {
    wx.navigateBack()
  }
})
