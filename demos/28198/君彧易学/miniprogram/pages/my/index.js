Page({
  data: {
    isLoggedIn: false,
    user: {
      phone: '',
      avatarUrl: ''
    },
    menuList: [
      { id: 'account', text: '账户服务' },
      { id: 'records', text: '八字排盘记录' },
      { id: 'messages', text: '公告与消息' },
      { id: 'settings', text: '设置' }
    ],
    loginModalVisible: false,
    avatarActionVisible: false,
    viewAvatarVisible: false,
    avatarSourceVisible: false
  },

  onLoad() {
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    const loginInfo = wx.getStorageSync('loginInfo')
    if (loginInfo && loginInfo.phone) {
      this.setData({
        isLoggedIn: true,
        user: { 
          phone: this.maskPhone(loginInfo.phone),
          avatarUrl: loginInfo.avatarUrl || ''
        }
      })
    }
  },

  maskPhone(phone) {
    if (!phone || phone.length !== 11) return phone
    return phone.substring(0, 3) + '****' + phone.substring(7)
  },

  onLoginTap() {
    if (this.data.isLoggedIn) return
    this.setData({ loginModalVisible: true })
  },

  onAvatarTap() {
    if (!this.data.isLoggedIn) return
    this.setData({ avatarActionVisible: true })
  },

  hideAvatarAction() {
    this.setData({ avatarActionVisible: false })
  },

  viewAvatar() {
    this.setData({ avatarActionVisible: false, viewAvatarVisible: true })
  },

  hideViewAvatar() {
    this.setData({ viewAvatarVisible: false })
  },

  changeAvatar() {
    this.setData({ avatarActionVisible: false, avatarSourceVisible: true })
  },

  hideAvatarSource() {
    this.setData({ avatarSourceVisible: false })
  },

  chooseFromAlbum() {
    this.setData({ avatarSourceVisible: false })
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.uploadAvatar(tempFilePath)
      },
      fail: () => {
        wx.showToast({ title: '取消选择', icon: 'none' })
      }
    })
  },

  uploadAvatar(filePath) {
    wx.showLoading({ title: '上传中...' })
    const cloudPath = 'avatars/' + Date.now() + '-' + Math.random().toString(36).substring(2, 8) + '.png'
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath,
      success: (res) => {
        wx.hideLoading()
        console.log('上传成功', res)
        wx.cloud.getTempFileURL({
          fileList: [res.fileID],
          success: (urlRes) => {
            console.log('获取URL成功', urlRes)
            const avatarUrl = urlRes.fileList[0].tempFileURL
            this.updateAvatar(avatarUrl, res.fileID)
          },
          fail: (err) => {
            wx.hideLoading()
            console.error('获取URL失败', err)
            wx.showToast({ title: '获取图片失败', icon: 'none' })
          }
        })
      },
      fail: (err) => {
        wx.hideLoading()
        console.error('上传失败', err)
        wx.showToast({ title: '上传失败', icon: 'none' })
      }
    })
  },

  updateAvatar(avatarUrl, fileID) {
    const loginInfo = wx.getStorageSync('loginInfo') || {}
    const newLoginInfo = {
      ...loginInfo,
      avatarUrl: avatarUrl,
      avatarFileID: fileID,
      loginTime: Date.now()
    }
    wx.setStorageSync('loginInfo', newLoginInfo)
    this.setData({
      user: {
        ...this.data.user,
        avatarUrl: avatarUrl
      }
    })
    wx.showToast({ title: '头像更换成功', icon: 'success' })
  },

  hideLoginModal() {
    this.setData({ loginModalVisible: false })
  },

  wxLogin() {
    wx.showLoading({ title: '登录中...' })
    wx.login({
      success: (res) => {
        wx.hideLoading()
        if (res.code) {
          this.handleWxLoginSuccess(res.code)
        } else {
          this.handleWxLoginMock()
        }
      },
      fail: () => {
        wx.hideLoading()
        this.handleWxLoginMock()
      }
    })
  },

  handleWxLoginSuccess(code) {
    const wxPhone = '139****' + code.substring(code.length - 4)
    wx.setStorageSync('loginInfo', {
      phone: wxPhone,
      loginTime: Date.now(),
      wxCode: code,
      loginType: 'wx'
    })
    this.setData({
      isLoggedIn: true,
      user: { phone: wxPhone },
      loginModalVisible: false
    })
    wx.showToast({ title: '微信登录成功', icon: 'success' })
  },

  handleWxLoginMock() {
    const mockCode = 'mock_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8)
    const mockPhone = '138****' + mockCode.substring(mockCode.length - 4)
    wx.setStorageSync('loginInfo', {
      phone: mockPhone,
      loginTime: Date.now(),
      wxCode: mockCode,
      loginType: 'wx_mock'
    })
    this.setData({
      isLoggedIn: true,
      user: { phone: mockPhone },
      loginModalVisible: false
    })
    wx.showToast({ title: '模拟微信登录成功', icon: 'success' })
  },

  getPhoneNumber(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({ title: '用户取消授权', icon: 'none' })
      return
    }

    wx.showLoading({ title: '登录中...' })

    wx.cloud.callFunction({
      name: 'getPhoneNumber',
      data: { code: e.detail.code }
    }).then(res => {
      wx.hideLoading()
      const { success, phoneNumber, errMsg } = res.result
      if (!success) {
        wx.showToast({ title: errMsg || '获取失败', icon: 'none' })
        return
      }

      wx.setStorageSync('loginInfo', {
        phone: phoneNumber,
        loginTime: Date.now(),
        loginType: 'phone_number'
      })
      this.setData({
        isLoggedIn: true,
        user: { phone: this.maskPhone(phoneNumber) },
        loginModalVisible: false
      })
      wx.showToast({ title: '登录成功', icon: 'success' })
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: '网络错误', icon: 'none' })
    })
  },

  onMenuTap(e) {
    const id = e.currentTarget.dataset.id
    if (id === 'records') {
      wx.navigateTo({ url: '/pages/records/index' })
    } else {
      wx.showToast({
        title: `点击了${id}`,
        icon: 'none'
      })
    }
  }
})
