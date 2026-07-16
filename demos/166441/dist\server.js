"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const plan_1 = require("./routes/plan");
const task_1 = require("./routes/task");
const advisor_1 = require("./routes/advisor");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/plans', plan_1.router);
app.use('/api/tasks', task_1.router);
app.use('/api/advisor', advisor_1.router);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'DailyAssistant API is running' });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
