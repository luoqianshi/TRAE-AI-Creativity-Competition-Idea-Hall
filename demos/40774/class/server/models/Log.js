/**
 * 操作日志模型
 * 对应前端 store: logs
 */
const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    action: { type: String, required: true },
    detail: { type: String, default: '' },
    time: { type: Date, default: Date.now }
}, {
    _id: false,
    versionKey: false,
    timestamps: false
});

module.exports = mongoose.model('Log', LogSchema);
