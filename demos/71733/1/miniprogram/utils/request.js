// request.js - 通用请求封装
const { getToken } = require('./auth')
const { STORAGE_KEYS } = require('./constants')

const app = getApp()

/**
 * 通用请求方法
 * @param {string} url - 请求路径（不含 baseUrl）
 * @param {object} options - 请求选项
 * @param {string} options.method - 请求方法
 * @param {object} options.data - 请求数据
 * @param {boolean} options.needAuth - 是否需要认证（默认 true）
 * @returns {Promise<object>} 响应数据
 */
function request(url, options = {}) {
  const {
    method = 'GET',
    data = {},
    needAuth = true
  } = options

  return new Promise((resolve, reject) => {
    const header = {
      'Content-Type': 'application/json'
    }

    // 需要认证的接口附加 token
    if (needAuth) {
      const token = getToken()
      if (token) {
        header['Authorization'] = `Bearer ${token}`
      } else {
        // 没有 token，需要重新登录
        reject({ code: 40001, message: '未登录，请重新登录' })
        return
      }
    }

    wx.request({
      url: `${app.globalData.baseUrl}${url}`,
      method,
      data,
      header,
      success(res) {
        // 检查响应中的新 token（自动续期）
        const newToken = res.header['X-New-Token'] || res.header['x-new-token']
        if (newToken) {
          wx.setStorageSync(STORAGE_KEYS.TOKEN, newToken)
        }

        if (res.statusCode === 200) {
          const responseData = res.data
          if (responseData.code === 0) {
            resolve(responseData.data)
          } else if (responseData.code === 40001) {
            // token 过期，清除本地 token 并触发重新登录
            wx.removeStorageSync(STORAGE_KEYS.TOKEN)
            reject(responseData)
          } else {
            reject(responseData)
          }
        } else {
          reject({ code: 50001, message: '服务器错误', data: null })
        }
      },
      fail(err) {
        reject({ code: 50001, message: '网络请求失败', data: null })
      }
    })
  })
}

/**
 * GET 请求
 */
function get(url, needAuth = true) {
  return request(url, { method: 'GET', needAuth })
}

/**
 * POST 请求
 */
function post(url, data, needAuth = true) {
  return request(url, { method: 'POST', data, needAuth })
}

module.exports = {
  request,
  get,
  post
}
