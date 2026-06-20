App({
  globalData: {
    userInfo: null,
    memories: [
      {
        id: 1,
        title: '初次相遇',
        date: '2020-03-15',
        location: '北京',
        description: '在春天的樱花树下，我们第一次相遇。那一刻，仿佛整个世界都安静了下来。',
        tags: ['相遇', '樱花季'],
        images: ['/images/memory1.jpg'],
        type: 'image'
      },
      {
        id: 2,
        title: '第一次旅行',
        date: '2020-08-20',
        location: '三亚',
        description: '一起去了海边，看了最美的日落。那是我们第一次一起远行，留下了无数美好回忆。',
        tags: ['旅行', '海边', '日落'],
        images: ['/images/memory2.jpg'],
        type: 'image'
      },
      {
        id: 3,
        title: '搬进新家',
        date: '2021-05-01',
        location: '上海',
        description: '终于有了自己的小窝！虽然不大，但充满了我们的爱和期待。',
        tags: ['新家', '开始'],
        images: [],
        type: 'text'
      },
      {
        id: 4,
        title: '求婚成功',
        date: '2022-02-14',
        location: '杭州',
        description: '在这个特别的日子，我向你求婚了。你说"我愿意"的那一刻，是我人生中最幸福的瞬间。',
        tags: ['求婚', '情人节'],
        images: [],
        type: 'text'
      },
      {
        id: 5,
        title: '婚礼',
        date: '2023-06-18',
        location: '杭州',
        description: '在亲朋好友的见证下，我们步入了婚姻的殿堂。',
        tags: ['婚礼', '幸福'],
        images: [],
        type: 'text'
      }
    ],
    journeyData: {
      cities: ['北京', '三亚', '上海', '杭州'],
      photoCount: 1286,
      years: 3,
      path: [
        { city: '北京', lat: 39.9, lng: 116.4, date: '2020-03', event: '初次相遇' },
        { city: '三亚', lat: 18.2, lng: 109.5, date: '2020-08', event: '第一次旅行' },
        { city: '上海', lat: 31.2, lng: 121.4, date: '2021-05', event: '搬进新家' },
        { city: '杭州', lat: 30.2, lng: 120.1, date: '2023-06', event: '婚礼' }
      ]
    }
  },

  onLaunch() {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已准备好，是否重启应用？',
            success: (res) => {
              if (res.confirm) {
                updateManager.applyUpdate()
              }
            }
          })
        })
      }
    })
  }
})
