// services/task.js — 任务相关 API
const { call } = require('../utils/request');

/** 获取今日任务列表 */
const getTodayTasks = (childId) =>
  call('task-engine', { action: 'today', childId });

/** 提交任务答案 */
const submitTask = (childId, taskId, answer) =>
  call('task-engine', { action: 'submit', childId, taskId, answer }, { loading: true });

/** 获取任务详情 */
const getTaskDetail = (taskId) =>
  call('task-engine', { action: 'detail', taskId });

module.exports = { getTodayTasks, submitTask, getTaskDetail };
