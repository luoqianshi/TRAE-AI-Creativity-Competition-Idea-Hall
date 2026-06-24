/**
 * 班级模型
 * 对应前端 store: classes
 */
const mongoose = require('mongoose');

const SubjectItemSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    hours: { type: Number, required: true },
    duration: { type: Number, required: true },
    priority: { type: Number, required: true }
}, { _id: false });

const ClassSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    classCode: { type: String, required: true },
    name: { type: String, required: true },
    grade: { type: String, required: true },
    type: { type: String, default: '默认' },
    subjects: { type: [SubjectItemSchema], default: [] },
    students: { type: Number, default: 45 }
}, {
    _id: false,
    versionKey: false,
    timestamps: false
});

module.exports = mongoose.model('Class', ClassSchema);
