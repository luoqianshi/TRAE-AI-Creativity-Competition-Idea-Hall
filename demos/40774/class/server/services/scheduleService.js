/**
 * 排课服务
 * 将原前端 Web Worker 中的 runSchedule 算法移植到后端，
 * 以异步任务方式运行，并通过内存 Map 维护任务状态。
 */
const { v4: uuidv4 } = require('uuid');
const {
    Teacher, Class, Course, Schedule, Config
} = require('../models');

// 内存任务状态存储：taskId -> { status, progress, logs, result }
const tasks = new Map();

/**
 * 启动排课任务
 * @param {Object} options
 * @param {Number} options.dayEnd      星期范围上限（0=周一 ... 6=周日）
 * @param {Number} options.periodEnd   每天节次上限
 * @param {Array}  options.failedTasks 补排时的失败任务列表（可选）
 * @returns {String} taskId
 */
async function startTask({ dayEnd, periodEnd, failedTasks }) {
    const taskId = uuidv4();
    tasks.set(taskId, {
        status: 'running',
        progress: 0,
        logs: ['启动排课任务'],
        newSchedulesCount: 0,
        failed: [],
        warnings: [],
        autoMatchFailed: [],
        createdAt: Date.now()
    });

    // 异步执行，不阻塞 HTTP 响应
    runScheduleTask(taskId, { dayEnd, periodEnd, failedTasks }).catch(err => {
        const task = tasks.get(taskId);
        if (task) {
            task.status = 'error';
            task.logs.push('排课异常：' + err.message);
        }
        console.error('排课任务异常', err);
    });

    return taskId;
}

/**
 * 查询任务状态
 * @param {String} taskId
 */
function getTaskStatus(taskId) {
    return tasks.get(taskId) || null;
}

/**
 * 执行排课主流程
 */
async function runScheduleTask(taskId, { dayEnd, periodEnd, failedTasks }) {
    const task = tasks.get(taskId);

    // 1. 读取基础数据
    const [teachers, classes, courses, configs, existingSchedules] = await Promise.all([
        Teacher.find().lean(),
        Class.find().lean(),
        Course.find().lean(),
        Config.find().lean(),
        Schedule.find().lean()
    ]);

    task.logs.push(`读取基础数据：教师${teachers.length} 班级${classes.length} 课程${courses.length} 配置${configs.length}`);

    if (!teachers.length || !classes.length || !courses.length) {
        task.status = 'error';
        task.logs.push('错误：教师、班级、课程数据不能为空');
        return;
    }

    // 2. 运行排课算法
    const result = runSchedule({
        teachers, classes, courses, configs,
        dayEnd,
        periodEnd,
        existingSchedules,
        failedTasks
    }, (progress, current, total) => {
        task.progress = progress;
        task.logs.push(`进度 ${progress}%（${current}/${total}）`);
    });

    task.logs.push(`排课计算完成，成功 ${result.newSchedules.length} 条，失败 ${result.failed.length + result.autoMatchFailed.length} 项`);

    // 3. 保存结果到 schedules 集合
    // 策略：重新排课时，先清空旧排课，再批量插入新结果
    await Schedule.deleteMany({});
    if (result.newSchedules.length) {
        await Schedule.insertMany(result.newSchedules);
    }

    task.status = 'done';
    task.progress = 100;
    task.newSchedulesCount = result.newSchedules.length;
    task.failed = result.failed;
    task.warnings = result.warnings;
    task.autoMatchFailed = result.autoMatchFailed;
    task.logs.push('排课结果已保存到数据库');
}

/**
 * 排课核心算法（移植自前端 Web Worker）
 * @param {Object} payload
 * @param {Function} onProgress 进度回调 (progress, current, total)
 * @returns {Object} { newSchedules, failed, warnings, autoMatchFailed }
 */
function runSchedule(payload, onProgress) {
    const { teachers, classes, courses, configs, dayEnd, periodEnd, existingSchedules, failedTasks } = payload;

    const idxTeacher = new Map();
    const idxClass = new Map();
    const idxDayPeriod = new Map();
    existingSchedules.forEach(s => {
        if (!idxTeacher.has(s.teacherId)) idxTeacher.set(s.teacherId, []);
        idxTeacher.get(s.teacherId).push(s);
        if (!idxClass.has(s.classId)) idxClass.set(s.classId, []);
        idxClass.get(s.classId).push(s);
        const key = s.day + '-' + s.period;
        if (!idxDayPeriod.has(key)) idxDayPeriod.set(key, []);
        idxDayPeriod.get(key).push(s);
    });

    function getTeacherHours(tid) { return (idxTeacher.get(tid) || []).length; }
    function getClassHours(cid) { return (idxClass.get(cid) || []).length; }
    function getTeacherDayHours(tid, day) { return (idxTeacher.get(tid) || []).filter(s => s.day === day).length; }
    function getClassDayHours(cid, day) { return (idxClass.get(cid) || []).filter(s => s.day === day).length; }
    function getGradeCfg(grade, type) { return configs.find(c => c.grade === grade && c.type === (type || '默认')); }
    function getClassItems(cls) {
        if (cls.subjects && cls.subjects.length) return cls.subjects;
        const cfg = getGradeCfg(cls.grade, cls.type);
        return cfg ? cfg.items : [];
    }

    // 根据课程匹配教师：精确指定优先，否则按学科+任教班级自动匹配
    function resolveTeacher(course, classIds) {
        if (course.teacherId) {
            return teachers.find(t => t.id === course.teacherId) || null;
        }
        const subject = course.subject;
        if (!subject) return null;
        const matched = teachers.filter(t =>
            (t.subject || '') === subject &&
            classIds.every(cid => (t.classes || []).includes(cid))
        );
        if (!matched.length) return null;
        matched.sort((a, b) => getTeacherHours(a.id) - getTeacherHours(b.id));
        return matched[0];
    }

    let nextScheduleId = 1;
    existingSchedules.forEach(s => { if (s.id > nextScheduleId) nextScheduleId = s.id; });
    nextScheduleId++;
    function genScheduleId() { return nextScheduleId++; }

    const tasks = [];
    const autoMatchFailed = [];
    const retryMode = Array.isArray(failedTasks) && failedTasks.length;
    const sourceCourses = retryMode ?
        failedTasks.map(t => {
            const course = courses.find(c => c.id === t.courseId);
            return course ? { course, classIds: (t.classIds && t.classIds.length) ? t.classIds : (course.classIds || []) } : null;
        }).filter(Boolean) :
        courses.map(c => ({ course: c, classIds: c.classIds || [] }));

    sourceCourses.forEach(({ course, classIds }) => {
        const teacher = resolveTeacher(course, classIds);
        if (!teacher) {
            autoMatchFailed.push(course.name + '：未匹配到能任教 ' + (course.subject || '-') + ' 且覆盖全部班级的教师');
            return;
        }
        if (course.merged && classIds.length > 1) {
            const cls = classes.find(c => c.id === classIds[0]);
            const items = cls ? getClassItems(cls) : [];
            const item = items.find(i => i.subject === teacher.subject);
            tasks.push({
                courseId: course.id,
                courseName: course.name,
                teacherId: teacher.id,
                classIds: classIds.slice(),
                displayName: classIds.map(cid => { const k = classes.find(c => c.id === cid); return k ? k.name : ''; }).filter(Boolean).join('、'),
                hours: item ? item.hours : (course.hours || 4),
                duration: item ? item.duration : (course.duration || 1),
                priority: item ? item.priority : 3,
                merged: true
            });
        } else {
            classIds.forEach(cid => {
                const cls = classes.find(c => c.id === cid);
                if (!cls) return;
                const items = getClassItems(cls);
                const item = items.find(i => i.subject === teacher.subject);
                tasks.push({
                    courseId: course.id,
                    courseName: course.name,
                    teacherId: teacher.id,
                    classIds: [cid],
                    displayName: cls.name,
                    hours: item ? item.hours : (course.hours || 4),
                    duration: item ? item.duration : (course.duration || 1),
                    priority: item ? item.priority : 3,
                    merged: false
                });
            });
        }
    });

    tasks.sort((a, b) => {
        const tA = teachers.find(t => t.id === a.teacherId);
        const tB = teachers.find(t => t.id === b.teacherId);
        const remainA = (tA ? (tA.maxHours || 20) : 999) - getTeacherHours(a.teacherId);
        const remainB = (tB ? (tB.maxHours || 20) : 999) - getTeacherHours(b.teacherId);
        return (remainA - remainB) || (b.duration - a.duration) || (b.priority - a.priority) || (b.hours - a.hours);
    });

    const failed = [];
    const warnings = [];
    const newSchedules = [];
    let lastProgress = 0;

    function checkTeacherClass(task, teacher) {
        if (!teacher || !teacher.classes || !teacher.classes.length) return;
        task.classIds.forEach(cid => {
            const cls = classes.find(c => c.id === cid);
            if (cls && !teacher.classes.includes(cid)) {
                warnings.push('教师 ' + teacher.name + ' 未任教 ' + cls.name + '（' + task.courseName + '）');
            }
        });
    }

    function canPlace(task, day, period, duration) {
        for (let p = 0; p < duration; p++) {
            const cp = period + p;
            if (cp > periodEnd) return false;
            const key = day + '-' + cp;
            const list = idxDayPeriod.get(key) || [];
            for (let s of list) {
                if (task.teacherId && s.teacherId === task.teacherId) return false;
                if (task.classIds.includes(s.classId)) return false;
                if (s.courseId === task.courseId) return false;
            }
        }
        return true;
    }

    function place(task, day, period, duration) {
        for (let p = 0; p < duration; p++) {
            const cp = period + p;
            task.classIds.forEach(cid => {
                const s = { id: genScheduleId(), courseId: task.courseId, classId: cid, teacherId: task.teacherId, day, period: cp, merged: task.merged };
                newSchedules.push(s);
                if (!idxTeacher.has(task.teacherId)) idxTeacher.set(task.teacherId, []);
                idxTeacher.get(task.teacherId).push(s);
                if (!idxClass.has(cid)) idxClass.set(cid, []);
                idxClass.get(cid).push(s);
                const key = day + '-' + cp;
                if (!idxDayPeriod.has(key)) idxDayPeriod.set(key, []);
                idxDayPeriod.get(key).push(s);
            });
        }
    }

    function scoreSlots(slots, task) {
        return slots.map(slot => {
            let score = 0;
            score += getTeacherDayHours(task.teacherId, slot.day) * 100;
            task.classIds.forEach(cid => score += getClassDayHours(cid, slot.day) * 80);
            const sameCourse = (idxDayPeriod.get(slot.day + '-' + slot.period) || []).filter(s => s.courseId === task.courseId).length;
            score += sameCourse * 200;
            if (task.priority >= 4 && slot.period <= 4) score -= 30;
            if (task.duration >= 2 && slot.period <= 3) score -= 20;
            return { ...slot, score };
        }).sort((a, b) => a.score - b.score);
    }

    function generateSlots(duration) {
        const slots = [];
        for (let d = 0; d <= dayEnd; d++) {
            for (let p = 1; p + duration - 1 <= periodEnd; p++) slots.push({ day: d, period: p });
        }
        return slots;
    }

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const teacher = teachers.find(t => t.id === task.teacherId);
        checkTeacherClass(task, teacher);
        const sessions = Math.ceil(task.hours / task.duration);
        let taskFailed = false;
        for (let s = 0; s < sessions; s++) {
            let placed = false;
            const slots = generateSlots(task.duration);
            const scored = scoreSlots(slots, task);
            for (let slot of scored) {
                if (canPlace(task, slot.day, slot.period, task.duration)) {
                    place(task, slot.day, slot.period, task.duration);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                failed.push({
                    courseId: task.courseId,
                    courseName: task.courseName,
                    classIds: task.classIds,
                    displayName: task.displayName,
                    reason: '无可用时段',
                    attempts: scored.length
                });
                taskFailed = true;
                break;
            }
        }

        const progress = Math.round((i + 1) / tasks.length * 100);
        if (progress - lastProgress >= 5 || i === tasks.length - 1) {
            if (typeof onProgress === 'function') onProgress(progress, i + 1, tasks.length);
            lastProgress = progress;
        }
    }

    return { newSchedules, failed, warnings, autoMatchFailed };
}

module.exports = {
    startTask,
    getTaskStatus
};
