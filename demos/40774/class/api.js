/**
 * 后端 API 封装
 * 保持与原 DB 对象一致的方法签名，便于无缝替换 IndexedDB 读写逻辑
 */
const API_BASE = 'http://127.0.0.1:3000/api';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
});

const DB_API = {
    /**
     * 获取某 store 全部数据
     * @param {string} store - teachers/classes/courses/schedules/configs/directions/logs
     */
    async getAll(store) {
        const res = await api.get(`/${store}`);
        return res.data;
    },

    /**
     * 按 id 获取单条
     */
    async getById(store, id) {
        const res = await api.get(`/${store}/${id}`);
        return res.data;
    },

    /**
     * 保存单条或多条（upsert）
     * @param {string} store
     * @param {Object|Array} items
     */
    async save(store, items) {
        const res = await api.post(`/${store}`, items);
        return res.data;
    },

    /**
     * 删除单条
     */
    async delete(store, id) {
        const res = await api.delete(`/${store}/${id}`);
        return res.data;
    },

    /**
     * 批量删除
     * @param {Array<Number>} ids
     */
    async deleteMany(store, ids) {
        const res = await api.post(`/${store}/batch-delete`, { ids });
        return res.data;
    },

    /**
     * 清空整表
     */
    async clear(store) {
        const res = await api.delete(`/${store}/clear`);
        return res.data;
    }
};

/**
 * 排课任务 API
 */
const Schedule_API = {
    /**
     * 启动排课任务
     * @param {Object} payload - { dayEnd, periodEnd }
     * @returns {Promise<string>} taskId
     */
    async run(payload) {
        const res = await api.post('/schedule/run', payload);
        return res.data.taskId;
    },

    /**
     * 查询排课任务状态
     * @param {string} taskId
     */
    async status(taskId) {
        const res = await api.get(`/schedule/status/${taskId}`);
        return res.data;
    }
};
