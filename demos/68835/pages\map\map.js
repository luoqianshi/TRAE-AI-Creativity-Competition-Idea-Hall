const app = getApp()
const { mockDogs } = require('../../data/mock.js')

Page({
  data: {
    centerLatitude: 39.9042,
    centerLongitude: 116.4074,
    markers: [],
    dogList: []
  },

  onLoad: function () {
    this.loadData()
    this.getUserLocation()
  },

  onShow: function () {
    this.loadData()
  },

  getUserLocation: function () {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          centerLatitude: res.latitude,
          centerLongitude: res.longitude
        })
        app.globalData.userLocation = {
          latitude: res.latitude,
          longitude: res.longitude
        }
      },
      fail: () => {
        console.log('获取位置失败')
      }
    })
  },

  loadData: function () {
    const dogs = [...mockDogs]
    
    const markers = dogs.map((dog, index) => ({
      id: index,
      latitude: dog.location.latitude,
      longitude: dog.location.longitude,
      iconPath: dog.unlocked 
        ? '/images/marker-active.png' 
        : '/images/marker-locked.png',
      width: 40,
      height: 40,
      callout: {
        content: dog.name,
        fontSize: 14,
        borderRadius: 10,
        bgColor: '#ffffff',
        padding: 8,
        display: 'BYCLICK'
      },
      data: {
        dogId: dog.id
      }
    }))

    this.setData({
      dogList: dogs,
      markers
    })
  },

  refreshLocation: function () {
    wx.showLoading({
      title: '定位中...'
    })
    this.getUserLocation()
    setTimeout(() => {
      wx.hideLoading()
    }, 1000)
  },

  showSearch: function () {
    wx.showToast({
      title: '搜索功能开发中',
      icon: 'none'
    })
  },

  onMarkerTap: function (e) {
    const markerId = e.detail.markerId
    const marker = this.data.markers[markerId]
    if (marker && marker.data && marker.data.dogId) {
      this.goToDetail({
        currentTarget: {
          dataset: {
            id: marker.data.dogId
          }
        }
      })
    }
  },

  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/dog-detail/dog-detail?id=${id}`
    })
  },

  goToCamera: function () {
    wx.switchTab({
      url: '/pages/camera/camera'
    })
  }
})