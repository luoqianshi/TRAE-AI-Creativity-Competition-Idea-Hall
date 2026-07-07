App({
  onLaunch: function () {
    const that = this
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        that.globalData.userLocation = {
          latitude: res.latitude,
          longitude: res.longitude
        }
      },
      fail: function() {
        that.globalData.userLocation = {
          latitude: 39.9042,
          longitude: 116.4074
        }
      }
    })
  },

  globalData: {
    userLocation: null,
    dogList: [],
    userInfo: null,
    favorites: [],
    intimacy: {}
  },

  addDog: function(dog) {
    this.globalData.dogList.unshift(dog)
  },

  updateDog: function(id, updates) {
    const index = this.globalData.dogList.findIndex(d => d.id === id)
    if (index !== -1) {
      this.globalData.dogList[index] = { ...this.globalData.dogList[index], ...updates }
    }
  },

  increaseIntimacy: function(dogId) {
    if (!this.globalData.intimacy[dogId]) {
      this.globalData.intimacy[dogId] = 0
    }
    this.globalData.intimacy[dogId] += 1
    return this.globalData.intimacy[dogId]
  },

  getIntimacy: function(dogId) {
    return this.globalData.intimacy[dogId] || 0
  },

  toggleFavorite: function(dogId) {
    const index = this.globalData.favorites.indexOf(dogId)
    if (index === -1) {
      this.globalData.favorites.push(dogId)
      return true
    } else {
      this.globalData.favorites.splice(index, 1)
      return false
    }
  },

  isFavorite: function(dogId) {
    return this.globalData.favorites.includes(dogId)
  }
})