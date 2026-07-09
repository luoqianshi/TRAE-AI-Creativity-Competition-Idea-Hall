// app.js - 四神兽养成游戏 小程序入口
const { silentLogin, getToken } = require('./utils/auth')
const { fetchCloudData, saveToCloud, mergeData } = require('./utils/sync')
const { getPetData, setPetData } = require('./utils/pet-store')

App({
  onLaunch() {
    // 启动时静默登录
    this.loginAndSync()
  },

  onHide() {
    // 切后台时保存数据到云端
    const token = getToken()
    if (token) {
      const petData = getPetData()
      if (petData && petData.updatedAt) {
        saveToCloud(petData).catch(err => {
          console.error('切后台保存失败:', err)
        })
      }
    }
  },

  async loginAndSync() {
    try {
      // 1. 静默登录获取 token
      const token = getToken()
      if (!token) {
        await silentLogin()
      }

      // 2. 拉取云端数据并合并
      const cloudData = await fetchCloudData()
      if (cloudData) {
        const localData = getPetData()
        const mergedData = mergeData(localData, cloudData)
        setPetData(mergedData)
      }
    } catch (err) {
      console.error('启动同步失败:', err)
      // 同步失败不影响本地使用
    }
  },

  globalData: {
    baseUrl: 'https://your-domain.com/api' // 请替换为实际后端地址
  }
})
