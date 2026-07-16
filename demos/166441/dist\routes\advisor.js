"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const llmService_1 = require("../services/llmService");
exports.router = express_1.default.Router();
exports.router.post('/suggestions', async (req, res) => {
    try {
        const request = req.body;
        const recentActivity = request.recentActivity || [
            {
                type: 'plan_created',
                timestamp: new Date(),
                details: '用户创建了新计划',
            },
        ];
        const suggestions = await (0, llmService_1.generateSuggestions)(recentActivity);
        const response = {
            success: true,
            suggestions,
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error generating suggestions:', error);
        const defaultSuggestions = [
            {
                id: 'default-1',
                title: '建立日常习惯',
                description: '尝试建立规律的日常习惯，如每天早上花15分钟规划当天任务',
                type: 'habit',
                priority: 'medium',
            },
            {
                id: 'default-2',
                title: '使用番茄工作法',
                description: '使用番茄工作法提高专注力，每25分钟休息5分钟',
                type: 'improvement',
                priority: 'low',
            },
            {
                id: 'default-3',
                title: '每周回顾',
                description: '每周结束时回顾完成情况，总结经验教训',
                type: 'improvement',
                priority: 'high',
            },
        ];
        res.json({ success: true, suggestions: defaultSuggestions });
    }
});
