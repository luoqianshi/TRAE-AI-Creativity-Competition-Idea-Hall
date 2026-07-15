// services/share.js — 分享裂变 API
const { call } = require('../utils/request');

/** 记录分享行为 */
const traceShare = (channel, contentId) =>
  call('share-trace', { channel, contentId });

/** 获取分享海报数据 */
const getShareCard = (childId, type) =>
  call('share-trace', { action: 'card', childId, type });

/** 领取体验课 */
const claimTrial = (childId, inviterId) =>
  call('share-trace', { action: 'claimTrial', childId, inviterId }, { loading: true });

module.exports = { traceShare, getShareCard, claimTrial };
