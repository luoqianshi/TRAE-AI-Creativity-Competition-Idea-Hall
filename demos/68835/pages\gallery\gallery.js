const { mockDogs } = require('../../data/mock.js')

Page({
  data: {
    dogList: [],
    filteredDogs: [],
    activeFilter: 'all',
    collectedCount: 0,
    totalCount: 0,
    progress: 0
  },

  onLoad: function () {
    this.loadData()
  },

  onShow: function () {
    this.loadData()
  },

  loadData: function () {
    const dogs = [...mockDogs]
    const collectedCount = dogs.filter(d => d.unlocked).length
    const totalCount = dogs.length
    const progress = Math.round((collectedCount / totalCount) * 100)

    this.setData({
      dogList: dogs,
      filteredDogs: dogs,
      collectedCount,
      totalCount,
      progress
    })
  },

  setFilter: function (e) {
    const filter = e.currentTarget.dataset.filter
    let filteredDogs = []

    if (filter === 'all') {
      filteredDogs = this.data.dogList
    } else if (filter === 'unlocked') {
      filteredDogs = this.data.dogList.filter(d => d.unlocked)
    } else if (filter === 'locked') {
      filteredDogs = this.data.dogList.filter(d => !d.unlocked)
    }

    this.setData({
      activeFilter: filter,
      filteredDogs
    })
  },

  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/dog-detail/dog-detail?id=${id}`
    })
  }
})