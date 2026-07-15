// utils/track.js — 埋点统计（对接微信数据分析 + 自定义上报）
const { call } = require('./request');

/**
 * 上报自定义事件
 * @param {string} eventName 事件名
 * @param {object} params 事件参数
 */
const track = (eventName, params = {}) => {
  // 1. 微信原生数据分析
  if (wx.reportEvent) {
    try {
      wx.reportEvent(eventName, params);
    } catch (e) {}
  }
  // 2. 自建数据上报（异步不等待）
  call('track', { eventName, params, ts: Date.now() }, { showError: false }).catch(() => {});
};

/**
 * 页面浏览埋点
 */
const pageView = (pagePath, params = {}) => {
  track('page_view', { path: pagePath, ...params });
};

module.exports = { track, pageView };
