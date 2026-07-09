/**
 * 期末急救站 - 智能复习规划器
 * 基于艾宾浩斯遗忘曲线 + 考点优先级算法
 */

const app = {
    state: {
        currentPage: 'welcome',
        courseName: '',
        chapters: [],
        pptText: '',
        examText: '',
        examDate: '',
        studyHours: 4,
        difficulties: {},
        plan: null,
        keywords: []
    },

    init() {
        // 设置默认考试日期为7天后
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        document.getElementById('examDate').value = defaultDate.toISOString().split('T')[0];
        this.updateDaysLeft();

        // 监听日期变化
        document.getElementById('examDate').addEventListener('change', () => this.updateDaysLeft());
    },

    /* ===== 页面导航 ===== */
    start() {
        this.goStep(1);
    },

    goWelcome() {
        this.switchPage('page-welcome');
        this.updateStepIndicator(0);
    },

    goStep(stepNum) {
        if (stepNum === 1) {
            this.switchPage('page-step1');
            this.updateStepIndicator(0);
        } else if (stepNum === 2) {
            if (!this.validateStep1()) return;
            this.parseChapters();
            this.switchPage('page-step2');
            this.updateStepIndicator(1);
        } else if (stepNum === 3) {
            this.state.pptText = document.getElementById('pptInput').value.trim();
            this.state.examText = document.getElementById('examInput').value.trim();
            this.renderDifficultyList();
            this.switchPage('page-step3');
            this.updateStepIndicator(2);
        } else if (stepNum === 4) {
            this.switchPage('page-step4');
            this.updateStepIndicator(3);
        }
    },

    switchPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        window.scrollTo(0, 0);
    },

    updateStepIndicator(activeStep) {
        document.querySelectorAll('.step-indicator').forEach((el, idx) => {
            el.classList.remove('active', 'completed');
            if (idx < activeStep) {
                el.classList.add('completed');
            } else if (idx === activeStep) {
                el.classList.add('active');
            }
        });
    },

    restart() {
        this.state = {
            currentPage: 'welcome',
            courseName: '',
            chapters: [],
            pptText: '',
            examText: '',
            examDate: '',
            studyHours: 4,
            difficulties: {},
            plan: null,
            keywords: []
        };
        document.getElementById('chapterInput').value = document.getElementById('chapterInput').defaultValue;
        document.getElementById('pptInput').value = document.getElementById('pptInput').defaultValue;
        document.getElementById('examInput').value = document.getElementById('examInput').defaultValue;
        this.goWelcome();
    },

    /* ===== 输入验证 ===== */
    validateStep1() {
        const name = document.getElementById('courseName').value.trim();
        const chapters = document.getElementById('chapterInput').value.trim();
        if (!name) {
            alert('请输入课程名称');
            return false;
        }
        if (!chapters) {
            alert('请输入章节内容');
            return false;
        }
        this.state.courseName = name;
        return true;
    },

    /* ===== 章节解析 ===== */
    parseChapters() {
        const raw = document.getElementById('chapterInput').value.trim();
        const lines = raw.split(/\n/).filter(l => l.trim());
        const chapters = [];

        for (let line of lines) {
            line = line.trim();
            // 匹配格式：1.1 / 1.1.1 / 第1章 / 一、 / (1) 等
            const match = line.match(/^(?:第?\s*(\d+[\.．])?(\d+)[\s\.．、,，)）]?\s*[\.．、,，)）]?\s*|([一二三四五六七八九十]+)[、\.．]\s*|\((\d+)\)\s*)?(.+)$/);
            if (match) {
                const num = match[1] || match[2] || match[3] || match[4] || '';
                const title = match[5] || line;
                chapters.push({
                    id: chapters.length,
                    num: num.toString().trim(),
                    title: title.trim(),
                    full: line
                });
            } else {
                chapters.push({
                    id: chapters.length,
                    num: '',
                    title: line,
                    full: line
                });
            }
        }

        this.state.chapters = chapters;
    },

    /* ===== 快速标签 ===== */
    addTag(keyword) {
        const examInput = document.getElementById('examInput');
        const current = examInput.value.trim();
        if (!current.includes(keyword)) {
            examInput.value = current ? current + '\n' + keyword + '相关题目' : keyword + '相关题目';
        }
        // 视觉反馈
        document.querySelectorAll('.tag').forEach(t => {
            if (t.textContent === keyword) t.classList.add('active');
        });
    },

    /* ===== 日期 & 滑块 ===== */
    updateSlider(val) {
        this.state.studyHours = parseInt(val);
        document.getElementById('sliderValue').textContent = val + ' 小时';
        this.updateDaysLeft();
    },

    updateDaysLeft() {
        const examDateStr = document.getElementById('examDate').value;
        if (!examDateStr) return;
        const examDate = new Date(examDateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = examDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        document.getElementById('daysLeft').textContent = diffDays > 0 ? diffDays : 0;

        // 估算建议天数（基于章节数和每天时长，粗略估计每章30分钟）
        const chapterCount = this.state.chapters.length || 20;
        const totalMinutes = chapterCount * 35; // 平均35分钟每章
        const dailyMinutes = this.state.studyHours * 60;
        const suggestDays = Math.ceil(totalMinutes / dailyMinutes);
        document.getElementById('suggestDays').textContent = suggestDays;

        this.state.examDate = examDateStr;
    },

    /* ===== 难度自评渲染 ===== */
    renderDifficultyList() {
        const container = document.getElementById('difficultyList');
        container.innerHTML = '';

        this.state.chapters.forEach(ch => {
            const row = document.createElement('div');
            row.className = 'diff-item';
            row.innerHTML = `
                <span class="diff-chapter-num">${ch.num || '#' + (ch.id + 1)}</span>
                <span class="diff-name">${ch.title}</span>
                <div class="diff-stars" data-id="${ch.id}">
                    ${[1,2,3,4,5].map(s => `<span class="diff-star" data-star="${s}" onclick="app.setDifficulty(${ch.id}, ${s})">★</span>`).join('')}
                </div>
            `;
            container.appendChild(row);
        });
    },

    setDifficulty(chapterId, stars) {
        this.state.difficulties[chapterId] = stars;
        const starEls = document.querySelectorAll(`.diff-stars[data-id="${chapterId}"] .diff-star`);
        starEls.forEach(el => {
            const s = parseInt(el.dataset.star);
            el.classList.toggle('active', s <= stars);
        });
    },

    /* ===== 核心算法：生成复习计划 ===== */
    async generatePlan() {
        // 验证
        if (!this.state.examDate) {
            alert('请选择考试日期');
            return;
        }

        // 显示加载动画
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.add('active');

        // 模拟分步加载
        const steps = ['loadStep1', 'loadStep2', 'loadStep3', 'loadStep4'];
        for (let i = 0; i < steps.length; i++) {
            document.querySelectorAll('.loading-step').forEach(s => s.classList.remove('active', 'done'));
            for (let j = 0; j < i; j++) document.getElementById(steps[j]).classList.add('done');
            document.getElementById(steps[i]).classList.add('active');
            await this.sleep(600);
        }

        // 执行生成
        this.state.plan = this.computePlan();

        // 渲染结果
        this.renderPlan();

        overlay.classList.remove('active');
        this.goStep(4);
    },

    sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    },

    computePlan() {
        const chapters = this.state.chapters;
        const pptText = (this.state.pptText + ' ' + this.state.examText).toLowerCase();
        const examDate = new Date(this.state.examDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const totalDays = Math.max(1, Math.ceil((examDate - today) / (1000 * 60 * 60 * 24)));
        const dailyMinutes = this.state.studyHours * 60;

        // 1. 为每章计算优先级
        const chapterData = chapters.map(ch => {
            const title = ch.title.toLowerCase();
            // 提取关键词（简单分词：取2-4字的名词性片段）
            const keywords = this.extractKeywords(ch.title);

            // 匹配度计算
            let matchCount = 0;
            keywords.forEach(kw => {
                if (pptText.includes(kw.toLowerCase())) matchCount++;
            });
            const matchScore = Math.min(1, matchCount / Math.max(1, keywords.length * 0.5));

            // 难度（默认3）
            const difficulty = this.state.difficulties[ch.id] || 3;

            // 基础度（章节越靠前越基础，但权重低）
            const baseScore = Math.max(0, 1 - (ch.id / chapters.length) * 0.5);

            // 优先级公式
            const priority = matchScore * 0.5 + (difficulty / 5) * 0.3 + baseScore * 0.2;

            return {
                ...ch,
                keywords,
                matchScore,
                difficulty,
                priority,
                isHighFreq: matchScore > 0.5
            };
        });

        // 2. 按优先级排序（高优先级先学）
        chapterData.sort((a, b) => b.priority - a.priority);

        // 3. 为每章分配学习任务
        // 艾宾浩斯复习节点（天偏移）：0=学习, 1=第1次复习, 2=第2次复习, 4=第3次复习
        // 根据可用天数动态调整
        const reviewIntervals = this.getReviewIntervals(totalDays);

        const tasks = [];
        chapterData.forEach(ch => {
            const baseMinutes = 25 + ch.difficulty * 8; // 33~65分钟基础学习
            reviewIntervals.forEach((interval, idx) => {
                const day = interval;
                if (day >= totalDays) return;
                const type = idx === 0 ? 'learn' : `review${idx}`;
                const minutes = idx === 0 ? baseMinutes : Math.round(baseMinutes * 0.5);
                tasks.push({
                    chapterId: ch.id,
                    chapterTitle: ch.title,
                    chapterNum: ch.num,
                    day,
                    type,
                    minutes,
                    priority: ch.priority,
                    isHighFreq: ch.isHighFreq,
                    keywords: ch.keywords
                });
            });
            // 高频考点额外加一次复习
            if (ch.isHighFreq && totalDays >= 3) {
                const extraDay = Math.min(totalDays - 1, Math.floor(totalDays / 2));
                tasks.push({
                    chapterId: ch.id,
                    chapterTitle: ch.title,
                    chapterNum: ch.num,
                    day: extraDay,
                    type: 'review2',
                    minutes: Math.round(baseMinutes * 0.4),
                    priority: ch.priority,
                    isHighFreq: ch.isHighFreq,
                    keywords: ch.keywords,
                    extra: true
                });
            }
        });

        // 4. 按天分组，确保每天不超时长
        const days = [];
        for (let d = 0; d < totalDays; d++) {
            let dayTasks = tasks.filter(t => t.day === d);
            // 当天按优先级排序
            dayTasks.sort((a, b) => b.priority - a.priority);

            // 如果超时长，把低优先级任务延后或缩减
            let dayMinutes = dayTasks.reduce((s, t) => s + t.minutes, 0);
            if (dayMinutes > dailyMinutes) {
                // 尝试将低优先级的review任务移到其他天或删除
                for (let i = dayTasks.length - 1; i >= 0 && dayMinutes > dailyMinutes; i--) {
                    const t = dayTasks[i];
                    if (t.type !== 'learn') {
                        dayMinutes -= t.minutes;
                        dayTasks.splice(i, 1);
                    }
                }
                // 如果还超，缩减所有任务时间
                if (dayMinutes > dailyMinutes) {
                    const ratio = dailyMinutes / dayMinutes;
                    dayTasks.forEach(t => t.minutes = Math.max(10, Math.round(t.minutes * ratio)));
                }
            }

            // 重新排序：learn在前，review按间隔
            dayTasks.sort((a, b) => {
                const typeOrder = { learn: 0, review1: 1, review2: 2, review3: 3 };
                return (typeOrder[a.type] || 9) - (typeOrder[b.type] || 9);
            });

            days.push({
                dayIndex: d,
                date: this.addDays(today, d),
                tasks: dayTasks,
                totalMinutes: dayTasks.reduce((s, t) => s + t.minutes, 0)
            });
        }

        // 过滤掉没有任务的天
        const nonEmptyDays = days.filter(d => d.tasks.length > 0);

        return {
            totalChapters: chapters.length,
            totalDays: nonEmptyDays.length,
            totalHours: Math.round(nonEmptyDays.reduce((s, d) => s + d.totalMinutes, 0) / 60 * 10) / 10,
            highFreqCount: chapterData.filter(c => c.isHighFreq).length,
            days: nonEmptyDays,
            chapterData
        };
    },

    extractKeywords(title) {
        // 简单提取：去掉标点和数字，按长度取潜在关键词
        const cleaned = title.replace(/[\d\.\(\)\[\]（）【】、，,；;]/g, ' ');
        const words = cleaned.split(/\s+/).filter(w => w.length >= 2);
        // 取2-4字词作为关键词
        const keywords = [];
        words.forEach(w => {
            if (w.length >= 2 && w.length <= 6) keywords.push(w);
            // 再取子串
            for (let i = 0; i <= w.length - 2; i++) {
                const sub = w.substring(i, i + 2);
                if (!keywords.includes(sub)) keywords.push(sub);
            }
        });
        return [...new Set(keywords)];
    },

    getReviewIntervals(totalDays) {
        // 根据可用天数返回合适的复习间隔
        if (totalDays >= 8) return [0, 1, 3, 7];
        if (totalDays >= 5) return [0, 1, 3];
        if (totalDays >= 3) return [0, 1, 2];
        if (totalDays >= 2) return [0, 1];
        return [0];
    },

    addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    },

    /* ===== 渲染复习计划 ===== */
    renderPlan() {
        const plan = this.state.plan;
        document.getElementById('statTotalChapters').textContent = plan.totalChapters;
        document.getElementById('statTotalDays').textContent = plan.totalDays;
        document.getElementById('statTotalHours').textContent = plan.totalHours;
        document.getElementById('statHighFreq').textContent = plan.highFreqCount;

        const container = document.getElementById('planContainer');
        container.innerHTML = '';

        plan.days.forEach(day => {
            const dateStr = `${day.date.getMonth() + 1}月${day.date.getDate()}日`;
            const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][day.date.getDay()];
            const dayHours = Math.round(day.totalMinutes / 60 * 10) / 10;

            const dayEl = document.createElement('div');
            dayEl.className = 'plan-day';

            const typeLabels = {
                learn: { text: '新学', class: 'learn' },
                review1: { text: '复习①', class: 'review1' },
                review2: { text: '复习②', class: 'review2' },
                review3: { text: '复习③', class: 'review3' }
            };

            let tasksHtml = day.tasks.map(t => {
                const tl = typeLabels[t.type] || { text: '复习', class: 'review2' };
                const highFreqBadge = t.isHighFreq ? '<span class="task-badge high-freq">高频</span>' : '';
                const priorityClass = t.priority > 0.7 ? 'priority-high' : t.priority > 0.45 ? 'priority-medium' : 'priority-low';
                const priorityText = t.priority > 0.7 ? '高优先级' : t.priority > 0.45 ? '中优先级' : '基础';

                return `
                    <div class="plan-task">
                        <div>
                            <span class="task-badge ${tl.class}">${tl.text}</span>
                            ${highFreqBadge}
                        </div>
                        <div class="task-content">
                            <div class="task-title">${t.chapterNum ? t.chapterNum + ' ' : ''}${t.chapterTitle}
                                <span class="priority-indicator ${priorityClass}">${priorityText}</span>
                            </div>
                            <div class="task-desc">${this.getTaskDesc(t)}</div>
                            ${t.keywords.slice(0, 3).length > 0 ? `
                                <div class="task-tags">
                                    ${t.keywords.slice(0, 3).map(k => `<span class="task-tag">${k}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                        <div class="task-time">${t.minutes}分钟</div>
                    </div>
                `;
            }).join('');

            dayEl.innerHTML = `
                <div class="plan-day-header">
                    <div>
                        <span class="plan-day-title">第 ${day.dayIndex + 1} 天</span>
                        <span class="plan-day-date">${dateStr} ${weekDay}</span>
                    </div>
                    <span class="plan-day-hours">${dayHours}h</span>
                </div>
                <div class="plan-tasks">
                    ${tasksHtml}
                </div>
            `;
            container.appendChild(dayEl);
        });

        // 如果没有任务
        if (plan.days.length === 0) {
            container.innerHTML = `
                <div class="card" style="text-align:center; padding: 60px 20px;">
                    <div style="font-size: 3rem; margin-bottom: 16px;">😅</div>
                    <h3>时间太紧张了！</h3>
                    <p style="color: var(--gray-500); margin-top: 8px;">距离考试只剩 ${plan.totalDays} 天，建议优先复习标记为「高频」的章节。</p>
                </div>
            `;
        }
    },

    getTaskDesc(task) {
        if (task.type === 'learn') {
            return task.isHighFreq ? '重点章节，需深入理解并配合真题练习' : '完成基础概念学习和例题演练';
        }
        if (task.extra) {
            return '高频考点额外巩固，查漏补缺';
        }
        return '回顾核心概念，强化记忆薄弱点';
    },

    /* ===== 导出计划 ===== */
    exportPlan() {
        const plan = this.state.plan;
        if (!plan) return;

        let text = `🎯 期末急救站 - ${this.state.courseName} 复习计划\n`;
        text += `生成时间：${new Date().toLocaleString()}\n`;
        text += `考试日期：${this.state.examDate}\n`;
        text += `=` .repeat(40) + '\n\n';

        plan.days.forEach(day => {
            const dateStr = `${day.date.getMonth() + 1}月${day.date.getDate()}日`;
            text += `📅 第 ${day.dayIndex + 1} 天（${dateStr}）\n`;
            day.tasks.forEach(t => {
                const typeMap = { learn: '【新学】', review1: '【复习①】', review2: '【复习②】', review3: '【复习③】' };
                text += `  ${typeMap[t.type] || '【复习】'} ${t.chapterNum} ${t.chapterTitle} — ${t.minutes}分钟\n`;
            });
            text += '\n';
        });

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.state.courseName}_复习计划.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
};

// 启动
document.addEventListener('DOMContentLoaded', () => app.init());
