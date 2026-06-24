/**
 * 排课记录模型
 * 对应前端 store: schedules
 */
const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    courseId: { type: Number, required: true },
    classId: { type: Number, required: true },
    teacherId: { type: Number, default: null },
    day: { type: Number, required: true },        // 0=周一, 1=周二 ...
    period: { type: Number, required: true },     // 第几节
    merged: { type: Boolean, default: false }
}, {
    _id: false,
    versionKey: false,
    timestamps: false
});

// 为排课表建立复合索引，加速课表查询和冲突检测
ScheduleSchema.index({ day: 1, period: 1, classId: 1, teacherId: 1 });
ScheduleSchema.index({ classId: 1, day: 1, period: 1 });
ScheduleSchema.index({ teacherId: 1, day: 1, period: 1 });

module.exports = mongoose.model('Schedule', ScheduleSchema);
