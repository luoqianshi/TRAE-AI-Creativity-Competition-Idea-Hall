const { userStats } = require('../../data/mock.js')

Page({
  data: {
    userStats: userStats
  },

  onLoad: function () {
  },

  goToGallery: function () {
    wx.switchTab({
      url: '/pages/gallery/gallery'
    })
  },

  goToLost: function () {
    wx.navigateTo({
      url: '/pages/lost/lost'
    })
  },

  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/dog-detail/dog-detail?id=${id}`
    })
  }
})