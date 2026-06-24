/**
 * 排课任务路由
 * 提供启动排课任务与查询任务状态的接口
 */
const express = require('express');
const router = express.Router();
const scheduleService = require('../services/scheduleService');

/**
 * POST /api/schedule/run
 * 启动排课异步任务
 * body: { dayEnd, periodEnd, failedTasks? }
 * 立即返回 { taskId }
 */
router.post('/run', async (req, res) => {
    try {
        const { dayEnd, periodEnd, failedTasks } = req.body;
        const taskId = await scheduleService.startTask({
            dayEnd: Number(dayEnd) || 4,
            periodEnd: Number(periodEnd) || 8,
            failedTasks
        });
        res.json({ taskId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/schedule/status/:taskId
 * 查询排课任务状态
 */
router.get('/status/:taskId', (req, res) => {
    try {
        const status = scheduleService.getTaskStatus(req.params.taskId);
        if (!status) {
            return res.status(404).json({ error: '任务不存在或已过期' });
        }
        res.json(status);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
