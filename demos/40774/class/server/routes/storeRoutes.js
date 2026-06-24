/**
 * 通用数据路由
 * 为 teachers / classes / courses / schedules / configs / directions / logs 七个 store
 * 提供统一的 RESTful CRUD 接口。
 *
 * 路由前缀由 server.js 统一挂载为 /api/:store
 */
const express = require('express');
const router = express.Router({ mergeParams: true });
const models = require('../models');

// store 名称到 Mongoose Model 的映射
const STORE_MAP = {
    teachers: models.Teacher,
    classes: models.Class,
    courses: models.Course,
    schedules: models.Schedule,
    configs: models.Config,
    directions: models.Direction,
    logs: models.Log
};

/**
 * 根据请求参数获取对应 Model，无效 store 返回 400
 */
function getModel(req, res) {
    const Model = STORE_MAP[req.params.store];
    if (!Model) {
        res.status(400).json({ error: '未知的 store: ' + req.params.store });
        return null;
    }
    return Model;
}

/**
 * GET /api/:store
 * 获取该表全部数据
 */
router.get('/', async (req, res) => {
    const Model = getModel(req, res);
    if (!Model) return;
    try {
        const list = await Model.find().lean();
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/:store/:id
 * 按自定义数字 id 获取单条记录
 */
router.get('/:id', async (req, res) => {
    const Model = getModel(req, res);
    if (!Model) return;
    try {
        const id = Number(req.params.id);
        const item = await Model.findOne({ id }).lean();
        if (!item) return res.status(404).json({ error: '记录不存在' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/:store
 * 新增或更新单条/多条记录（upsert）
 * body 可以是对象或数组
 */
router.post('/', async (req, res) => {
    const Model = getModel(req, res);
    if (!Model) return;
    try {
        let items = req.body;
        if (!Array.isArray(items)) items = [items];

        const result = [];
        for (const item of items) {
            if (item.id == null) {
                return res.status(400).json({ error: '每条记录必须包含自定义 id 字段' });
            }
            // 使用 findOneAndUpdate 实现 upsert：存在则更新，不存在则新增
            const saved = await Model.findOneAndUpdate(
                { id: item.id },
                item,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            ).lean();
            result.push(saved);
        }
        res.json(result.length === 1 ? result[0] : result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /api/:store/:id
 * 按 id 更新单条记录（局部更新）
 */
router.put('/:id', async (req, res) => {
    const Model = getModel(req, res);
    if (!Model) return;
    try {
        const id = Number(req.params.id);
        const updates = req.body;
        // 不允许通过 body 修改 id
        delete updates.id;
        const item = await Model.findOneAndUpdate(
            { id },
            updates,
            { new: true }
        ).lean();
        if (!item) return res.status(404).json({ error: '记录不存在' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /api/:store/:id
 * 按 id 删除单条记录
 */
router.delete('/:id', async (req, res) => {
    const Model = getModel(req, res);
    if (!Model) return;
    try {
        const id = Number(req.params.id);
        const item = await Model.findOneAndDelete({ id });
        if (!item) return res.status(404).json({ error: '记录不存在' });
        res.json({ success: true, deleted: item });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/:store/batch-delete
 * 批量删除，body: { ids: [Number] }
 */
router.post('/batch-delete', async (req, res) => {
    const Model = getModel(req, res);
    if (!Model) return;
    try {
        const ids = (req.body.ids || []).map(Number);
        const result = await Model.deleteMany({ id: { $in: ids } });
        res.json({ success: true, deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /api/:store/clear
 * 清空整表
 */
router.delete('/clear', async (req, res) => {
    const Model = getModel(req, res);
    if (!Model) return;
    try {
        const result = await Model.deleteMany({});
        res.json({ success: true, deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
