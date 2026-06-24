/**
 * 教师模型
 * 对应前端 store: teachers
 */
const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    subject: { type: String, default: '' },
    classes: { type: [Number], default: [] },     // 任教班级 id 列表
    phone: { type: String, default: '' },
    maxHours: { type: Number, default: 20 }
}, {
    // 禁用 MongoDB 默认 _id，使用自定义 id 字段
    _id: false,
    versionKey: false,
    timestamps: false
});

module.exports = mongoose.model('Teacher', TeacherSchema);
