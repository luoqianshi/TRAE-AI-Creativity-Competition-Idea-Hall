const app = getApp()
const { mockDogs } = require('../../data/mock.js')

Page({
  data: {
    dog: {},
    isFavorite: false,
    intimacyLevel: 1,
    intimacyPercent: 0,
    nextLevel: 10,
    markers: []
  },

  onLoad: function (options) {
    const id = options.id
    this.loadDog(id)
  },

  loadDog: function (id) {
    const dog = mockDogs.find(d => d.id === id) || mockDogs[0]
    const isFavorite = app.isFavorite(id)
    const intimacy = app.getIntimacy(id)
    const intimacyLevel = Math.floor(intimacy / 20) + 1
    const intimacyPercent = (intimacy % 20) / 20 * 100
    const nextLevel = 20 - (intimacy % 20)

    const markers = [{
      id: 0,
      latitude: dog.location.latitude,
      longitude: dog.location.longitude,
      iconPath: '/images/marker-active.png',
      width: 40,
      height: 40
    }]

    this.setData({
      dog: { ...dog, intimacy },
      isFavorite,
      intimacyLevel,
      intimacyPercent,
      nextLevel,
      markers
    })
  },

  goBack: function () {
    wx.navigateBack()
  },

  toggleFavorite: function () {
    const id = this.data.dog.id
    const isFavorite = app.toggleFavorite(id)
    this.setData({
      isFavorite
    })

    wx.showToast({
      title: isFavorite ? '已收藏' : '已取消收藏',
      icon: 'none'
    })
  },

  checkIn: function () {
    const id = this.data.dog.id
    const intimacy = app.increaseIntimacy(id)
    const intimacyLevel = Math.floor(intimacy / 20) + 1
    const intimacyPercent = (intimacy % 20) / 20 * 100
    const nextLevel = 20 - (intimacy % 20)

    this.setData({
      dog: { ...this.data.dog, intimacy },
      intimacyLevel,
      intimacyPercent,
      nextLevel
    })

    wx.showToast({
      title: `打卡成功！亲密度+1`,
      icon: 'success'
    })
  }
})