// services/ai.js — AI 能力调用封装
const { call } = require('../utils/request');

/**
 * 智能出题
 * @param {object} params { dimension, difficulty, childId }
 */
const generateTask = (params) =>
  call('ai-generate', { action: 'generateTask', ...params }, { loading: true });

/**
 * 成长评估（每完成5个任务触发）
 */
const evaluateGrowth = (childId) =>
  call('ai-generate', { action: 'evaluate', childId }, { loading: false });

/**
 * 语音评测
 * @param {string} fileID 录音文件云存储ID
 */
const evaluateSpeech = (fileID) =>
  call('ai-generate', { action: 'speech', fileID }, { loading: true });

/**
 * 个性化推荐下一步任务
 */
const recommendNext = (childId) =>
  call('ai-generate', { action: 'recommend', childId });

/**
 * 生成周报
 */
const generateWeekly = (childId) =>
  call('ai-weekly', { childId }, { loading: false });

module.exports = { generateTask, evaluateGrowth, evaluateSpeech, recommendNext, generateWeekly };
