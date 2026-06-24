/**
 * 排课系统后端入口
 *
 * 技术栈：Node.js + Express + MongoDB(Mongoose)
 * 功能：
 *  1. 为前端 7 个数据表提供 RESTful API
 *  2. 将原前端 Web Worker 排课算法迁移到后端异步执行
 *  3. 提供排课任务启动与状态轮询接口
 */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const storeRoutes = require('./routes/storeRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/edu_schedule';

// 1. 中间件
// 允许所有跨域请求，方便本地开发
app.use(cors());
// 解析 JSON 请求体
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 2. 静态文件服务（前端 HTML 可直接访问）
// 假设前端文件位于 server 同级目录，例如 class/排课系统_企业版.html
app.use(express.static(path.join(__dirname, '..')));

// 3. 路由挂载
// 通用数据接口：/api/:store/...
app.use('/api/:store', storeRoutes);
// 排课任务接口：/api/schedule/...
app.use('/api/schedule', scheduleRoutes);

// 4. 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', mongodb: mongoose.connection.readyState });
});

// 5. 全局错误处理
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: err.message || '服务器内部错误' });
});

// 6. 连接 MongoDB 并启动服务
async function start() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB 连接成功:', MONGO_URI);

        app.listen(PORT, () => {
            console.log(`后端服务已启动: http://127.0.0.1:${PORT}`);
            console.log('API 前缀: /api/:store');
            console.log('排课接口: /api/schedule/run, /api/schedule/status/:taskId');
        });
    } catch (err) {
        console.error('启动失败:', err.message);
        process.exit(1);
    }
}

start();
