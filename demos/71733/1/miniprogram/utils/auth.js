// auth.js - 认证模块
const { post } = require('./request')
const { STORAGE_KEYS, DEFAULT_PET_DATA } = require('./constants')

/**
 * 静默登录：wx.login 获取 code → 调用后端换取 token
 * @returns {Promise<object>} { token, userInfo }
 */
function silentLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(loginRes) {
        if (loginRes.code) {
          // 调用后端登录接口
          post('/auth/login', { code: loginRes.code }, false)
            .then(data => {
              // 存储 token
              wx.setStorageSync(STORAGE_KEYS.TOKEN, data.token)
              // 存储用户信息
              wx.setStorageSync(STORAGE_KEYS.USER_INFO, data.userInfo)
              resolve(data)
            })
            .catch(err => {
              console.error('登录接口调用失败:', err)
              reject(err)
            })
        } else {
          reject({ message: 'wx.login 失败: ' + loginRes.errMsg })
        }
      },
      fail(err) {
        reject({ message: 'wx.login 调用失败: ' + err.errMsg })
      }
    })
  })
}

/**
 * 获取本地存储的 token
 * @returns {string|null}
 */
function getToken() {
  return wx.getStorageSync(STORAGE_KEYS.TOKEN) || null
}

/**
 * 确保已登录，无效则重新登录
 * @returns {Promise<string>} token
 */
async function ensureLogin() {
  let token = getToken()
  if (token) {
    return token
  }
  // token 不存在，重新登录
  const data = await silentLogin()
  return data.token
}

/**
 * 获取用户信息
 * @returns {object|null}
 */
function getUserInfo() {
  return wx.getStorageSync(STORAGE_KEYS.USER_INFO) || null
}

/**
 * 退出登录（清除本地数据）
 */
function logout() {
  wx.removeStorageSync(STORAGE_KEYS.TOKEN)
  wx.removeStorageSync(STORAGE_KEYS.USER_INFO)
}

module.exports = {
  silentLogin,
  getToken,
  ensureLogin,
  getUserInfo,
  logout
}
