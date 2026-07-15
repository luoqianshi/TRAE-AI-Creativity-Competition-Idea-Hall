// services/growth.js — 成长数据 API
const { call } = require('../utils/request');

/** 获取成长雷达（六维） */
const getRadar = (childId) =>
  call('growth-stats', { action: 'radar', childId });

/** 获取本周概览（家长页用） */
const getWeekOverview = (childId) =>
  call('growth-stats', { action: 'weekOverview', childId });

/** 同期群对比 */
const getCohort = (childId) =>
  call('growth-stats', { action: 'cohort', childId });

module.exports = { getRadar, getWeekOverview, getCohort };
