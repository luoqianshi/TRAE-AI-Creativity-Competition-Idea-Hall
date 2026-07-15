// utils/auth.js — 登录与角色管理
const { call } = require('./request');

/**
 * 获取用户角色（首次进入引导选择）
 */
const getRole = () => {
  const app = getApp();
  return app.globalData.role;
};

/**
 * 设置角色并同步到服务端
 */
const setRole = async (role, childProfile) => {
  const app = getApp();
  app.globalData.role = role;
  try {
    const data = await call('login', { action: 'setRole', role, childProfile }, { loading: true });
    if (role === 'parent' && data && data.childId) {
      app.globalData.childId = data.childId;
    }
    return data;
  } catch (e) {
    throw e;
  }
};

/**
 * 确保已登录且有角色，否则跳转登录页
 */
const ensureLogin = () => {
  const app = getApp();
  if (!app.globalData.openid) {
    return app.silentLogin().then(() => {
      if (!app.globalData.role) redirectLogin();
    });
  }
  if (!app.globalData.role) {
    redirectLogin();
    return Promise.reject({ code: 'no_role' });
  }
  return Promise.resolve();
};

const redirectLogin = () => {
  wx.redirectTo({ url: '/pages/login/login' });
};

/**
 * 微信登录（获取 code 供云函数换 openid）
 */
const wxLogin = () => {
  return new Promise((resolve, reject) => {
    wx.login({ success: (res) => resolve(res.code), fail: reject });
  });
};

module.exports = { getRole, setRole, ensureLogin, wxLogin };
