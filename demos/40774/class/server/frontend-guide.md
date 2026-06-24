# 前端改造指南

本指南说明如何将现有纯前端排课系统（`排课系统_企业版.html`）改造为调用后端 API 的版本，同时保持界面和交互逻辑不变。

## 一、总体思路

1. 新增 `api.js`：封装 axios 请求，提供与原来 `DB` 对象一致的接口。
2. 移除或替换原 `DB` 对象中的 IndexedDB 读写逻辑。
3. 将 Web Worker 排课改为调用后端 `/api/schedule/run` 并轮询 `/api/schedule/status/:taskId`。
4. 其余渲染、弹窗、校验逻辑保持不动。

---

## 二、引入 axios

在 `<head>` 中新增 axios CDN：

```html
<script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
```

---

## 三、新增 api.js 模块

在 `class/` 目录下新建 `api.js`，内容如下：

```javascript
/**
 * 后端 API 封装
 * 保持与原 DB 对象一致的方法签名，便于无缝替换
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
```

---

## 四、替换 DB 对象

原 `DB` 对象类似如下：

```javascript
const DB = {
    getAll(store) { ... },
    save(store, items) { ... },
    delete(store, id) { ... },
    // ...
};
```

**改造方式**：

```javascript
// 将 DB 对象的方法直接代理到 DB_API
const DB = DB_API;
```

> 注意：`DB_API` 的方法签名与旧 `DB` 完全一致，因此所有调用处都无需修改。

---

## 五、替换 Cache 层（可选）

如果原系统有 `Cache` 对象在内存中缓存 IndexedDB 数据，建议：

- 首次加载时从后端拉取：
  ```javascript
  Cache.set('teachers', await DB.getAll('teachers'));
  Cache.set('classes', await DB.getAll('classes'));
  // ...
  ```
- 每次增删改后，调用 `refreshDataList()` 重新从后端加载。

---

## 六、改造排课逻辑

### 6.1 删除 Web Worker 创建代码

原代码：

```javascript
function createScheduleWorker() {
    const workerCode = `...`;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
}
```

**直接删除整个 `createScheduleWorker` 函数。**

### 6.2 替换 `startScheduleWorker` 函数

将原函数改为启动后端任务并轮询状态：

```javascript
let schedulePollTimer = null;

async function startScheduleWorker() {
    const teachers = await Cache.get('teachers');
    const classes = await Cache.get('classes');
    const courses = await Cache.get('courses');
    const configs = await Cache.get('configs');

    if (!teachers.length || !classes.length || !courses.length) {
        toast('请先添加教师、班级和课程', 'w');
        return;
    }

    const schedules = await DB.getAll('schedules');
    if (schedules.length && !confirm('重新排课将覆盖现有排课数据，是否继续？')) return;

    // 重置 UI
    document.getElementById('schedule-progress').style.width = '0%';
    document.getElementById('schedule-progress').textContent = '0%';
    document.getElementById('schedule-log').textContent = '启动后端排课任务...\n';
    document.getElementById('schedule-report').style.display = 'none';
    document.getElementById('btn-start-schedule').style.display = 'none';
    document.getElementById('btn-pause-schedule').style.display = 'none'; // 后端暂不支持暂停
    document.getElementById('btn-cancel-schedule').style.display = 'none';
    document.getElementById('engine-status').textContent = '排课中';

    try {
        const dayEnd = parseInt(document.getElementById('day-end').value);
        const periodEnd = parseInt(document.getElementById('period-end').value);
        const taskId = await Schedule_API.run({ dayEnd, periodEnd });

        // 开始轮询任务状态
        pollScheduleStatus(taskId);
    } catch (err) {
        console.error(err);
        toast('启动排课失败：' + err.message, 'e');
        resetScheduleButtons();
    }
}

/**
 * 轮询排课任务状态
 */
function pollScheduleStatus(taskId) {
    if (schedulePollTimer) clearInterval(schedulePollTimer);

    schedulePollTimer = setInterval(async () => {
        try {
            const status = await Schedule_API.status(taskId);

            // 更新进度条
            document.getElementById('schedule-progress').style.width = status.progress + '%';
            document.getElementById('schedule-progress').textContent = status.progress + '%';
            document.getElementById('schedule-status').textContent =
                status.status === 'running' ? '正在排课...' : '排课完成';

            // 更新日志（只显示最后 30 条，避免 DOM 过大）
            const logEl = document.getElementById('schedule-log');
            logEl.textContent = status.logs.slice(-30).join('\n');

            if (status.status === 'done' || status.status === 'error') {
                clearInterval(schedulePollTimer);
                schedulePollTimer = null;

                if (status.status === 'done') {
                    // 重新加载排课结果
                    const newSchedules = await DB.getAll('schedules');
                    Cache.set('schedules', newSchedules);
                    Index.buildScheduleIndex();
                    app.schedule.failedTasks = status.failed || [];

                    // 沿用原 UI 更新逻辑
                    await finishWorkerSchedule(
                        newSchedules,
                        status.failed,
                        status.warnings,
                        status.autoMatchFailed
                    );
                } else {
                    toast('排课失败：' + (status.logs[status.logs.length - 1] || '未知错误'), 'e');
                    resetScheduleButtons();
                }
            }
        } catch (err) {
            console.error('轮询失败', err);
        }
    }, 1000);
}
```

### 6.3 调整 `finishWorkerSchedule`

由于后端已经保存了排课结果，前端无需再调用 `DB.save('schedules', ...)`。

原函数中这段：

```javascript
const chunk = 1000;
for (let i = 0; i < newSchedules.length; i += chunk) {
    await DB.save('schedules', newSchedules.slice(i, i + chunk));
}
```

可以直接删除或注释掉。

---

## 七、调整暂停/取消按钮

后端排课任务目前不支持暂停和取消。建议：

- 隐藏 `btn-pause-schedule` 和 `btn-cancel-schedule`；
- 或者将取消按钮改为只停止前端轮询（不终止后端任务）。

```javascript
function cancelScheduleWorker() {
    if (schedulePollTimer) {
        clearInterval(schedulePollTimer);
        schedulePollTimer = null;
    }
    resetScheduleButtons();
    document.getElementById('schedule-status').textContent = '已取消';
    toast('已停止前端轮询，后端任务可能仍在运行', 'w');
}
```

---

## 八、导入导出功能

原前端导入导出 Excel 功能：

- **导入**：读取本地 Excel → 解析数据 → 调用 `DB.save(store, items)` 写入后端。
- **导出**：从后端获取数据 → 生成 Excel 文件下载。

由于 `DB.save` 已替换为后端 API，导入逻辑无需改动，只需确保解析后的数据包含自定义 `id` 字段。

---

## 九、检查清单

改造完成后，请确认以下功能正常：

- [ ] 页面加载时能从后端拉取教师、班级、课程、配置等数据
- [ ] 新增/编辑/删除教师、班级、课程后，数据能正确同步到后端
- [ ] 一键替换科目、批量生成班级等操作后刷新列表正常
- [ ] 点击"开始排课"后，进度条和日志正常更新
- [ ] 排课完成后，课表查看页面能正确显示新课程
- [ ] Excel 导入导出功能正常
- [ ] 操作日志能正确写入后端

---

## 十、最小改动示例（核心片段）

```html
<head>
  <!-- 新增 axios -->
  <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
  <!-- 新增 api.js -->
  <script src="api.js"></script>
</head>
<script>
  // 替换原 DB 对象
  const DB = DB_API;

  // 替换 startScheduleWorker（见 6.2）
  // 删除 createScheduleWorker
</script>
```

> 按此方式改造后，前端界面与交互逻辑完全保持不变，所有数据持久化和排课计算均交由后端处理。
