const app = getApp()
const { mockDogs } = require('../../data/mock.js')

Page({
  data: {
    imageSrc: '',
    showResult: false,
    matchedDog: null,
    similarity: 0,
    scanning: false
  },

  takePhoto: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        this.setData({
          imageSrc: res.tempFilePaths[0]
        })
      },
      fail: () => {
        wx.showToast({
          title: '拍照失败',
          icon: 'none'
        })
      }
    })
  },

  chooseImage: function () {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        this.setData({
          imageSrc: res.tempFilePaths[0]
        })
      },
      fail: () => {
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        })
      }
    })
  },

  retakePhoto: function () {
    this.setData({
      imageSrc: '',
      showResult: false,
      matchedDog: null
    })
  },

  identifyDog: function () {
    if (!this.data.imageSrc) {
      wx.showToast({
        title: '请先拍摄照片',
        icon: 'none'
      })
      return
    }

    this.setData({
      scanning: true
    })

    setTimeout(() => {
      this.setData({
        scanning: false
      })

      const random = Math.random()
      if (random > 0.3) {
        const matchedIndex = Math.floor(Math.random() * mockDogs.length)
        const matchedDog = mockDogs[matchedIndex]
        const similarity = Math.floor(75 + Math.random() * 25)
        
        this.setData({
          showResult: true,
          matchedDog: matchedDog,
          similarity: similarity
        })
      } else {
        this.setData({
          showResult: true,
          matchedDog: null,
          similarity: 0
        })
      }
    }, 2000)
  },

  confirmMatch: function () {
    if (!this.data.matchedDog) return

    const intimacy = app.increaseIntimacy(this.data.matchedDog.id)

    wx.showToast({
      title: `打卡成功！亲密度+1`,
      icon: 'success'
    })

    setTimeout(() => {
      this.setData({
        showResult: false,
        imageSrc: '',
        matchedDog: null
      })
      wx.navigateTo({
        url: `/pages/dog-detail/dog-detail?id=${this.data.matchedDog.id}`
      })
    }, 1500)
  },

  createNew: function () {
    wx.showToast({
      title: '跳转到新建档案页面',
      icon: 'none'
    })
    setTimeout(() => {
      this.setData({
        showResult: false,
        imageSrc: ''
      })
    }, 1500)
  },

  goToNewDog: function () {
    wx.showToast({
      title: '新建档案功能开发中',
      icon: 'none'
    })
  },

  closeResult: function () {
    this.setData({
      showResult: false
    })
  }
})