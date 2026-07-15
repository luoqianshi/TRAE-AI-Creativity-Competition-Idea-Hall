// utils/request.js — 云函数统一调用封装
// 所有业务请求走云函数，API Key 不落地客户端

const TIMEOUT = 15000;

/**
 * 调用云函数（核心请求方法）
 * @param {string} name 云函数名
 * @param {object} data 请求数据
 * @param {object} options { loading, showError, retry }
 */
const call = (name, data = {}, options = {}) => {
  const { loading = false, showError = true, retry = 1 } = options;

  if (loading) wx.showLoading({ title: '加载中', mask: true });

  return new Promise((resolve, reject) => {
    const doCall = (left) => {
      wx.cloud.callFunction({
        name,
        data,
        success: (res) => {
          if (loading) wx.hideLoading();
          const result = res.result || {};
          if (result.code === 0 || result.code === undefined) {
            resolve(result.data !== undefined ? result.data : result);
          } else if (result.code === 401) {
            // 登录态失效，重新静默登录后重试一次
            getApp().silentLogin().then(() => {
              if (left > 0) doCall(left - 1);
              else reject(result);
            });
          } else {
            if (showError) wx.showToast({ title: result.message || '请求失败', icon: 'none' });
            reject(result);
          }
        },
        fail: (err) => {
          if (loading) wx.hideLoading();
          if (left > 0) {
            setTimeout(() => doCall(left - 1), 800);
          } else {
            if (showError) wx.showToast({ title: '网络开小差了', icon: 'none' });
            reject({ code: -1, message: 'network_error', detail: err });
          }
        },
      });
    };
    doCall(retry);
  });
};

/**
 * 上传文件到云存储
 * @param {string} filePath 本地文件路径
 * @param {string} cloudPath 云存储路径
 */
const upload = (filePath, cloudPath) => {
  return new Promise((resolve, reject) => {
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: (res) => resolve(res.fileID),
      fail: (err) => reject(err),
    });
  });
};

/**
 * 下载云存储文件临时链接
 */
const getTempUrl = (fileID) => {
  return new Promise((resolve, reject) => {
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: (res) => resolve(res.fileList[0].tempFileURL),
      fail: reject,
    });
  });
};

module.exports = { call, upload, getTempUrl };
