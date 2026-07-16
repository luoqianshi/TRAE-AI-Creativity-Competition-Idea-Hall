"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const llmService_1 = require("../services/llmService");
exports.router = express_1.default.Router();
let plans = [];
exports.router.post('/analyze', async (req, res) => {
    try {
        const request = req.body;
        const plan = await (0, llmService_1.generatePlan)(request);
        plans.push(plan);
        const response = {
            success: true,
            plan,
            suggestions: [
                `考虑将计划分解为更小的步骤`,
                `设置定期回顾时间来评估进展`,
                `如果遇到困难，可以随时反馈给我`,
            ],
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error generating plan:', error);
        res.status(500).json({ success: false, message: 'Failed to generate plan' });
    }
});
exports.router.get('/', (req, res) => {
    res.json({ success: true, plans });
});
exports.router.get('/:id', (req, res) => {
    const plan = plans.find(p => p.id === req.params.id);
    if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.json({ success: true, plan });
});
exports.router.put('/:id', (req, res) => {
    const request = req.body;
    const index = plans.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    plans[index] = {
        ...plans[index],
        ...request,
    };
    res.json({ success: true, plan: plans[index] });
});
exports.router.delete('/:id', (req, res) => {
    const initialLength = plans.length;
    plans = plans.filter(p => p.id !== req.params.id);
    if (plans.length === initialLength) {
        return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.json({ success: true });
});
exports.router.post('/conflict-check', (req, res) => {
    const request = req.body;
    const conflicts = [];
    for (const existingPlan of plans) {
        if (existingPlan.id === request.planData.id)
            continue;
        for (const task of request.planData.tasks) {
            for (const existingTask of existingPlan.tasks) {
                if (new Date(task.dueDate).toDateString() ===
                    new Date(existingTask.dueDate).toDateString()) {
                    conflicts.push({
                        type: 'time',
                        message: `任务 "${task.title}" 与计划 "${existingPlan.title}" 中的任务 "${existingTask.title}" 在时间上冲突`,
                        affectedTasks: [task.id, existingTask.id],
                        suggestedResolution: `考虑调整 "${task.title}" 的截止日期，或将优先级较低的任务延后`,
                    });
                }
                if (task.priority === 'urgent' && existingTask.priority === 'urgent') {
                    conflicts.push({
                        type: 'priority',
                        message: `两个紧急任务 "${task.title}" 和 "${existingTask.title}" 需要同时处理`,
                        affectedTasks: [task.id, existingTask.id],
                        suggestedResolution: '评估哪个任务更重要，或寻求帮助同时处理',
                    });
                }
            }
        }
    }
    const response = {
        success: true,
        conflicts,
    };
    res.json(response);
});
