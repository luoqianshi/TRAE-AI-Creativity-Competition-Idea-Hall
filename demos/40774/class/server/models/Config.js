/**
 * 年级课时配置模型
 * 对应前端 store: configs
 */
const mongoose = require('mongoose');

const ConfigItemSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    hours: { type: Number, required: true },
    duration: { type: Number, required: true },
    priority: { type: Number, required: true }
}, { _id: false });

const ConfigSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    grade: { type: String, required: true },
    type: { type: String, default: '默认' },
    items: { type: [ConfigItemSchema], default: [] }
}, {
    _id: false,
    versionKey: false,
    timestamps: false
});

module.exports = mongoose.model('Config', ConfigSchema);
