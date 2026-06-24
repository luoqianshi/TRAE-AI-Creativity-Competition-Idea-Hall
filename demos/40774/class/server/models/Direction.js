/**
 * 选课方向模型
 * 对应前端 store: directions
 */
const mongoose = require('mongoose');

const DirectionSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true }
}, {
    _id: false,
    versionKey: false,
    timestamps: false
});

module.exports = mongoose.model('Direction', DirectionSchema);
