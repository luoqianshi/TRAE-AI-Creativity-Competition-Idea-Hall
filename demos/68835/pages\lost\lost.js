const { lostDogs } = require('../../data/mock.js')

Page({
  data: {
    lostDogs: lostDogs
  },

  onLoad: function () {
  },

  publishLost: function () {
    wx.showToast({
      title: '发布功能开发中',
      icon: 'none'
    })
  }
})