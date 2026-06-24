/**
 * 课程模型
 * 对应前端 store: courses
 */
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    subject: { type: String, required: true },
    teacherId: { type: Number, default: null },   // 指定教师 id，留空则自动匹配
    classIds: { type: [Number], default: [] },
    hours: { type: Number, default: 4 },
    duration: { type: Number, default: 1 },       // 每次连排节数
    type: { type: String, default: '必修' },
    merged: { type: Boolean, default: false }     // 是否合班课
}, {
    _id: false,
    versionKey: false,
    timestamps: false
});

module.exports = mongoose.model('Course', CourseSchema);
