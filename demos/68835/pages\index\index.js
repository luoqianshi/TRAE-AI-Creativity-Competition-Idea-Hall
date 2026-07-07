const app = getApp()
const { mockDogs, lostDogs, userStats } = require('../../data/mock.js')

Page({
  data: {
    stats: userStats,
    nearbyDogs: [],
    sightings: [],
    lostDogs: lostDogs,
    ranking: []
  },

  onLoad: function () {
    this.loadData()
  },

  onShow: function () {
    this.loadData()
  },

  loadData: function () {
    const dogs = [...mockDogs]
    
    const nearbyDogs = dogs.slice(0, 5)
    
    const sightings = dogs.slice(0, 3)
    
    const ranking = dogs.sort((a, b) => b.intimacy - a.intimacy).slice(0, 5)

    this.setData({
      nearbyDogs,
      sightings,
      ranking
    })

    app.globalData.dogList = dogs
  },

  goToMap: function () {
    wx.switchTab({
      url: '/pages/map/map'
    })
  },

  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/dog-detail/dog-detail?id=${id}`
    })
  },

  goToLost: function () {
    wx.navigateTo({
      url: '/pages/lost/lost'
    })
  }
})