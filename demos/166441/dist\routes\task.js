"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const llmService_1 = require("../services/llmService");
exports.router = express_1.default.Router();
exports.router.put('/:id/status', async (req, res) => {
    try {
        const request = req.body;
        const updatedTask = {
            id: req.params.id,
            title: '任务标题',
            description: '任务描述',
            dueDate: new Date(),
            priority: 'medium',
            completed: request.completed,
        };
        let aiAdvice;
        if (!request.completed && request.feedback) {
            aiAdvice = `根据您的反馈，建议您：${request.feedback.length > 20 ? '重新评估任务难度' : '调整时间安排'}`;
        }
        else if (request.completed) {
            aiAdvice = '恭喜完成！继续保持这个节奏！';
        }
        const response = {
            success: true,
            task: updatedTask,
            aiAdvice,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ success: false, message: 'Failed to update task status' });
    }
});
exports.router.post('/:id/feedback', async (req, res) => {
    try {
        const request = req.body;
        const result = await (0, llmService_1.analyzeFeedback)('当前任务', request.feedback, request.issueType);
        const response = {
            success: true,
            aiAnalysis: result.aiAnalysis,
            suggestedChanges: result.suggestedChanges,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error analyzing feedback:', error);
        res.status(500).json({ success: false, message: 'Failed to analyze feedback' });
    }
});
