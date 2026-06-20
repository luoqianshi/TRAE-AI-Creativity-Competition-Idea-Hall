/**
 * 智学规划师 - AI智能学习规划系统
 * 核心JavaScript逻辑
 */

(function() {
    'use strict';

    // ===== State Management =====
    const AppState = window.AppState = {
        currentPage: 'home',
        currentTaskDate: new Date(),
        plan: null,
        tasks: {},
        taskCompletions: {},
        weaknesses: [],
        suggestions: [],
        studyLog: []
    };

    // ===== Utility Functions =====
    function $(selector) {
        return document.querySelector(selector);
    }

    function $$(selector) {
        return document.querySelectorAll(selector);
    }

    function showToast(message, type) {
        type = type || 'success';
        const toast = $('#toast');
        if (!toast) return;
        toast.textContent = message;
        toast.className = 'toast show ' + type;
        setTimeout(function() {
            toast.classList.remove('show');
        }, 3000);
    }

    function formatDate(date) {
        var y = date.getFullYear();
        var m = String(date.getMonth() + 1).padStart(2, '0');
        var d = String(date.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + d;
    }

    function formatDateCN(date) {
        var m = date.getMonth() + 1;
        var d = date.getDate();
        var weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return m + '月' + d + '日 ' + weekdays[date.getDay()];
    }

    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    function getLevelText(level) {
        var map = {
            beginner: '零基础',
            basic: '有基础',
            intermediate: '中等水平',
            advanced: '较好水平'
        };
        return map[level] || level;
    }

    function getPreferenceText(pref) {
        var map = {
            intensive: '集中突破',
            steady: '稳步提升',
            balanced: '均衡分配'
        };
        return map[pref] || pref;
    }

    // ===== Navigation =====
    window.showPage = function(pageId) {
        AppState.currentPage = pageId;

        // Update nav tabs
        $$('.nav-tab').forEach(function(tab) {
            tab.classList.toggle('active', tab.dataset.page === pageId);
        });

        // Update sections
        $$('.page-section').forEach(function(section) {
            section.classList.remove('active');
        });
        var pageEl = $('#page-' + pageId);
        if (pageEl) pageEl.classList.add('active');

        // Page-specific initialization
        if (pageId === 'tasks') {
            initTasksPage();
        } else if (pageId === 'review') {
            initReviewPage();
        } else if (pageId === 'plan') {
            initPlanPage();
        }

        window.scrollTo(0, 0);
    };

    // ===== Tag Input =====
    function initTagInput() {
        var container = $('#weakness-tags');
        var input = $('#weakness-input');
        if (!container || !input) return;

        var tags = [];

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                var value = this.value.trim();
                if (value && tags.indexOf(value) === -1) {
                    tags.push(value);
                    renderTags();
                    this.value = '';
                }
            } else if (e.key === 'Backspace' && !this.value && tags.length > 0) {
                tags.pop();
                renderTags();
            }
        });

        function renderTags() {
            var existingTags = container.querySelectorAll('.tag');
            existingTags.forEach(function(t) { t.remove(); });

            tags.forEach(function(tag, index) {
                var tagEl = document.createElement('span');
                tagEl.className = 'tag';
                tagEl.textContent = tag;
                var removeSpan = document.createElement('span');
                removeSpan.className = 'tag-remove';
                removeSpan.innerHTML = '&times;';
                removeSpan.style.cursor = 'pointer';
                removeSpan.style.marginLeft = '4px';
                removeSpan.style.opacity = '0.6';
                removeSpan.addEventListener('click', function() {
                    tags.splice(index, 1);
                    renderTags();
                });
                tagEl.appendChild(removeSpan);
                container.insertBefore(tagEl, input);
            });
        }

        window.getWeaknessTags = function() {
            return tags.slice();
        };
    }

    // ===== AI Plan Generation =====
    window.generatePlan = function(event) {
        event.preventDefault();

        var goalEl = $('#goal');
        var daysEl = $('#days');
        var hoursEl = $('#hours-per-day');
        if (!goalEl || !daysEl || !hoursEl) return;

        var goal = goalEl.value.trim();
        var days = parseInt(daysEl.value);
        var hoursPerDay = parseFloat(hoursEl.value);
        var levelEl = document.querySelector('input[name="level"]:checked');
        var preferenceEl = document.querySelector('input[name="preference"]:checked');
        var level = levelEl ? levelEl.value : 'beginner';
        var preference = preferenceEl ? preferenceEl.value : 'steady';
        var weaknesses = window.getWeaknessTags ? window.getWeaknessTags() : [];
        var notesEl = $('#notes');
        var notes = notesEl ? notesEl.value.trim() : '';

        if (!goal || !days || !hoursPerDay) {
            showToast('请填写必填项', 'error');
            return;
        }

        // Show loading
        var loadingOverlay = $('#loading-overlay');
        if (loadingOverlay) loadingOverlay.classList.add('active');

        // Simulate AI processing
        setTimeout(function() {
            var plan = generateAIPlan({
                goal: goal,
                days: days,
                hoursPerDay: hoursPerDay,
                level: level,
                preference: preference,
                weaknesses: weaknesses,
                notes: notes
            });

            AppState.plan = plan;
            AppState.tasks = plan.tasks;
            AppState.weaknesses = weaknesses.map(function(w) {
                return {
                    name: w,
                    count: Math.floor(Math.random() * 5) + 1,
                    suggestion: '建议针对"' + w + '"进行专项练习，每天安排30分钟强化训练'
                };
            });

            renderPlanResult(plan);
            if (loadingOverlay) loadingOverlay.classList.remove('active');
            showToast('学习方案生成成功！');
        }, 2500);
    };

    function generateAIPlan(config) {
        var goal = config.goal;
        var days = config.days;
        var hoursPerDay = config.hoursPerDay;
        var level = config.level;
        var preference = config.preference;
        var weaknesses = config.weaknesses || [];
        var totalHours = days * hoursPerDay;

        var phases = [];
        if (preference === 'intensive') {
            phases = [
                { name: '基础强化', ratio: 0.3, type: 'study' },
                { name: '核心突破', ratio: 0.4, type: 'study' },
                { name: '冲刺模拟', ratio: 0.2, type: 'practice' },
                { name: '复盘巩固', ratio: 0.1, type: 'review' }
            ];
        } else if (preference === 'steady') {
            phases = [
                { name: '基础夯实', ratio: 0.4, type: 'study' },
                { name: '稳步提升', ratio: 0.35, type: 'study' },
                { name: '综合训练', ratio: 0.2, type: 'practice' },
                { name: '总结复盘', ratio: 0.05, type: 'review' }
            ];
        } else {
            phases = [
                { name: '基础学习', ratio: 0.25, type: 'study' },
                { name: '进阶提升', ratio: 0.25, type: 'study' },
                { name: '专项突破', ratio: 0.2, type: 'practice' },
                { name: '模拟训练', ratio: 0.2, type: 'practice' },
                { name: '复盘总结', ratio: 0.1, type: 'review' }
            ];
        }

        if (level === 'advanced') {
            phases[0].ratio = Math.max(0.05, phases[0].ratio - 0.1);
            phases[1].ratio += 0.1;
        } else if (level === 'beginner') {
            phases[0].ratio += 0.1;
            phases[phases.length - 1].ratio = Math.max(0.05, phases[phases.length - 1].ratio - 0.1);
        }

        var tasks = {};
        var startDate = new Date();
        var currentDay = 0;
        var totalTasks = 0;

        phases.forEach(function(phase, phaseIndex) {
            var phaseDays = Math.max(1, Math.round(days * phase.ratio));

            for (var d = 0; d < phaseDays && currentDay < days; d++) {
                var date = addDays(startDate, currentDay);
                var dateStr = formatDate(date);
                var dayTasks = [];

                var morningHours = parseFloat((Math.min(hoursPerDay * 0.4, 2)).toFixed(1));
                dayTasks.push({
                    id: 'task-' + currentDay + '-1',
                    title: phase.name + ' - 核心学习',
                    description: getStudyContent(goal, phase.type, level, currentDay),
                    duration: morningHours,
                    type: phase.type,
                    phase: phase.name,
                    completed: false
                });

                var afternoonHours = parseFloat((hoursPerDay - morningHours - 0.5).toFixed(1));
                if (afternoonHours > 0.5) {
                    dayTasks.push({
                        id: 'task-' + currentDay + '-2',
                        title: phase.name + ' - 练习巩固',
                        description: getPracticeContent(goal, phase.type, level, weaknesses),
                        duration: afternoonHours,
                        type: 'practice',
                        phase: phase.name,
                        completed: false
                    });
                }

                if (weaknesses.length > 0 && currentDay % 3 === 0) {
                    var weakness = weaknesses[currentDay % weaknesses.length];
                    dayTasks.push({
                        id: 'task-' + currentDay + '-3',
                        title: '薄弱点强化 - ' + weakness,
                        description: '针对' + weakness + '进行专项训练，查漏补缺',
                        duration: 0.5,
                        type: 'review',
                        phase: phase.name,
                        completed: false
                    });
                }

                if (d === phaseDays - 1 && phaseIndex < phases.length - 1) {
                    dayTasks.push({
                        id: 'task-' + currentDay + '-4',
                        title: '阶段复盘',
                        description: '回顾本阶段学习内容，整理错题，总结收获',
                        duration: 0.5,
                        type: 'review',
                        phase: phase.name,
                        completed: false
                    });
                }

                tasks[dateStr] = dayTasks;
                totalTasks += dayTasks.length;
                currentDay++;
            }
        });

        var suggestions = generateSuggestions(config, phases);

        return {
            goal: goal,
            days: days,
            hoursPerDay: hoursPerDay,
            level: level,
            preference: preference,
            totalHours: totalHours,
            phases: phases,
            tasks: tasks,
            totalTasks: totalTasks,
            suggestions: suggestions,
            createdAt: new Date().toISOString()
        };
    }

    function getStudyContent(goal, type, level, day) {
        var contents = {
            study: [
                '系统学习' + goal + '相关理论知识，深入理解核心概念',
                '阅读教材重点章节，做好笔记整理',
                '观看教学视频，跟随讲解进行思考',
                '梳理知识框架，建立知识体系',
                '精读例题，理解解题思路和方法'
            ],
            practice: [
                '完成' + goal + '相关练习题，检验学习效果',
                '进行模拟测试，熟悉考试节奏',
                '分析错题原因，总结解题技巧',
                '限时训练，提高解题速度',
                '综合练习，融会贯通所学知识'
            ],
            review: [
                '回顾今日学习内容，强化记忆',
                '整理错题本，分析薄弱环节',
                '复习重点笔记，巩固核心知识',
                '进行自我检测，查漏补缺',
                '总结学习方法，优化学习策略'
            ]
        };
        var list = contents[type] || contents.study;
        return list[day % list.length];
    }

    function getPracticeContent(goal, type, level, weaknesses) {
        if (weaknesses.length > 0) {
            return '针对' + weaknesses.join('、') + '等薄弱环节进行专项练习';
        }
        return '完成' + goal + '相关配套练习，巩固所学知识';
    }

    function generateSuggestions(config, phases) {
        var suggestions = [];

        if (config.level === 'beginner') {
            suggestions.push({
                title: '夯实基础',
                content: '建议先从最基础的概念入手，不要急于求成。每天留出20%的时间回顾前一天的内容。'
            });
        }

        if (config.hoursPerDay > 6) {
            suggestions.push({
                title: '注意劳逸结合',
                content: '每日学习时间较长，建议每50分钟休息10分钟，避免疲劳导致效率下降。'
            });
        }

        if (config.days < 14) {
            suggestions.push({
                title: '短期冲刺策略',
                content: '时间较为紧张，建议优先攻克高频考点和核心知识，适当放弃偏题怪题。'
            });
        }

        if (config.weaknesses && config.weaknesses.length > 0) {
            suggestions.push({
                title: '薄弱点专项突破',
                content: '针对' + config.weaknesses.join('、') + '等薄弱环节，建议每3天安排一次专项强化训练。'
            });
        }

        suggestions.push({
            title: '定期复盘',
            content: '建议每周进行一次全面复盘，检查学习进度，及时调整计划。'
        });

        suggestions.push({
            title: '保持节奏',
            content: '严格按照计划执行，避免三天打鱼两天晒网。坚持是取得好成绩的关键。'
        });

        return suggestions;
    }

    function renderPlanResult(plan) {
        var formContainer = $('#plan-form-container');
        var planResult = $('#plan-result');
        if (formContainer) formContainer.style.display = 'none';
        if (planResult) planResult.classList.add('active');

        var resultGoal = $('#result-goal');
        var resultDays = $('#result-days');
        var resultHours = $('#result-hours');
        var resultLevel = $('#result-level');
        var resultPreference = $('#result-preference');

        if (resultGoal) resultGoal.textContent = plan.goal;
        if (resultDays) resultDays.textContent = plan.days;
        if (resultHours) resultHours.textContent = plan.hoursPerDay;
        if (resultLevel) resultLevel.textContent = getLevelText(plan.level);
        if (resultPreference) resultPreference.textContent = getPreferenceText(plan.preference);

        var overviewTotalTasks = $('#overview-total-tasks');
        var overviewStudyDays = $('#overview-study-days');
        var overviewTotalHours = $('#overview-total-hours');
        var overviewReviewDays = $('#overview-review-days');

        if (overviewTotalTasks) overviewTotalTasks.textContent = plan.totalTasks;
        if (overviewStudyDays) overviewStudyDays.textContent = plan.days;
        if (overviewTotalHours) overviewTotalHours.textContent = plan.totalHours;
        if (overviewReviewDays) overviewReviewDays.textContent = Math.ceil(plan.days / 7);

        // Render timeline
        var timeline = $('#plan-timeline');
        if (!timeline) return;
        timeline.innerHTML = '';

        var todayStr = formatDate(new Date());
        var taskKeys = Object.keys(plan.tasks);

        taskKeys.forEach(function(dateStr) {
            var dayTasks = plan.tasks[dateStr];
            var date = new Date(dateStr);
            var isToday = todayStr === dateStr;

            var item = document.createElement('div');
            item.className = 'timeline-item';
            if (isToday) item.style.borderColor = 'var(--accent)';

            var tasksHtml = '';
            dayTasks.forEach(function(task) {
                tasksHtml += '<div class="task-item" data-task-id="' + task.id + '">' +
                    '<div class="task-checkbox" onclick="toggleTask(\'' + dateStr + '\', \'' + task.id + '\')"></div>' +
                    '<div class="task-content">' +
                        '<div class="task-title">' + task.title + '</div>' +
                        '<div class="task-desc">' + task.description + '</div>' +
                        '<div class="task-meta">' +
                            '<span class="task-tag tag-' + task.type + '">' + getTaskTypeLabel(task.type) + '</span>' +
                            '<span class="task-duration">&#9201; ' + task.duration + '小时</span>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            });

            item.innerHTML = '<div class="timeline-date">' + (isToday ? '今天 &#183; ' : '') + formatDateCN(date) + '</div>' +
                '<div class="task-list">' + tasksHtml + '</div>';

            timeline.appendChild(item);
        });

        AppState.suggestions = plan.suggestions;
    }

    function getTaskTypeLabel(type) {
        var map = { study: '学习', practice: '练习', review: '复盘', rest: '休息' };
        return map[type] || type;
    }

    window.toggleTask = function(dateStr, taskId) {
        if (!AppState.tasks[dateStr]) return;

        var task = null;
        for (var i = 0; i < AppState.tasks[dateStr].length; i++) {
            if (AppState.tasks[dateStr][i].id === taskId) {
                task = AppState.tasks[dateStr][i];
                break;
            }
        }
        if (!task) return;

        task.completed = !task.completed;

        // Update UI
        var checkbox = document.querySelector('[data-task-id="' + taskId + '"] .task-checkbox');
        if (checkbox) {
            checkbox.classList.toggle('checked', task.completed);
            checkbox.innerHTML = task.completed ? '&#10003;' : '';
        }

        // Update task title style
        var titleEl = document.querySelector('[data-task-id="' + taskId + '"] .task-title');
        if (titleEl) {
            titleEl.style.textDecoration = task.completed ? 'line-through' : 'none';
            titleEl.style.opacity = task.completed ? '0.6' : '1';
        }

        // Save completion
        if (!AppState.taskCompletions[dateStr]) {
            AppState.taskCompletions[dateStr] = {};
        }
        AppState.taskCompletions[dateStr][taskId] = task.completed;

        // Add to study log
        if (task.completed) {
            AppState.studyLog.push({
                date: dateStr,
                task: task.title,
                duration: task.duration,
                type: task.type,
                timestamp: new Date().toISOString()
            });
        }

        // Re-render stats if on tasks page
        if (AppState.currentPage === 'tasks') {
            renderTasksForDate(AppState.currentTaskDate);
        }

        showToast(task.completed ? '任务已完成！继续保持！' : '任务已取消完成');
    };

    window.savePlan = function() {
        try {
            localStorage.setItem('studyPlan', JSON.stringify(AppState.plan));
            localStorage.setItem('taskCompletions', JSON.stringify(AppState.taskCompletions));
            localStorage.setItem('studyLog', JSON.stringify(AppState.studyLog));
            localStorage.setItem('studyWeaknesses', JSON.stringify(AppState.weaknesses));
            showToast('计划已保存到本地');
        } catch (e) {
            showToast('保存失败：' + e.message, 'error');
        }
    };

    window.editPlan = function() {
        var formContainer = $('#plan-form-container');
        var planResult = $('#plan-result');
        if (formContainer) formContainer.style.display = 'block';
        if (planResult) planResult.classList.remove('active');
    };

    window.printPlan = function() {
        window.print();
    };

    // ===== Tasks Page =====
    function initTasksPage() {
        if (!AppState.plan) {
            var saved = localStorage.getItem('studyPlan');
            if (saved) {
                try {
                    AppState.plan = JSON.parse(saved);
                    AppState.tasks = AppState.plan.tasks || {};

                    var savedCompletions = localStorage.getItem('taskCompletions');
                    if (savedCompletions) {
                        AppState.taskCompletions = JSON.parse(savedCompletions);
                        Object.keys(AppState.taskCompletions).forEach(function(dateStr) {
                            if (AppState.tasks[dateStr]) {
                                Object.keys(AppState.taskCompletions[dateStr]).forEach(function(taskId) {
                                    for (var i = 0; i < AppState.tasks[dateStr].length; i++) {
                                        if (AppState.tasks[dateStr][i].id === taskId) {
                                            AppState.tasks[dateStr][i].completed = AppState.taskCompletions[dateStr][taskId];
                                            break;
                                        }
                                    }
                                });
                            }
                        });
                    }

                    var savedLog = localStorage.getItem('studyLog');
                    if (savedLog) {
                        AppState.studyLog = JSON.parse(savedLog);
                    }

                    var savedWeaknesses = localStorage.getItem('studyWeaknesses');
                    if (savedWeaknesses) {
                        AppState.weaknesses = JSON.parse(savedWeaknesses);
                    }
                } catch (e) {
                    console.error('Failed to load saved plan:', e);
                }
            }
        }

        var tasksContent = $('#tasks-content');
        var tasksEmpty = $('#tasks-empty');

        if (!AppState.plan) {
            if (tasksContent) tasksContent.style.display = 'none';
            if (tasksEmpty) tasksEmpty.style.display = 'block';
            return;
        }

        if (tasksContent) tasksContent.style.display = 'block';
        if (tasksEmpty) tasksEmpty.style.display = 'none';
        renderTasksForDate(AppState.currentTaskDate);
    }

    function renderTasksForDate(date) {
        var dateStr = formatDate(date);
        var currentTaskDateEl = $('#current-task-date');
        if (currentTaskDateEl) currentTaskDateEl.textContent = formatDateCN(date);

        var dayTasks = AppState.tasks[dateStr] || [];

        // Update stats
        var total = dayTasks.length;
        var completed = 0;
        for (var i = 0; i < dayTasks.length; i++) {
            if (dayTasks[i].completed) completed++;
        }
        var pending = total - completed;
        var duration = 0;
        for (var j = 0; j < dayTasks.length; j++) {
            duration += dayTasks[j].duration;
        }

        var statTotal = $('#stat-total');
        var statCompleted = $('#stat-completed');
        var statPending = $('#stat-pending');
        var statDuration = $('#stat-duration');

        if (statTotal) statTotal.textContent = total;
        if (statCompleted) statCompleted.textContent = completed;
        if (statPending) statPending.textContent = pending;
        if (statDuration) statDuration.textContent = duration.toFixed(1) + '小时';

        // Update progress ring
        var percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        var circumference = 2 * Math.PI * 52;
        var offset = circumference - (percent / 100) * circumference;
        var progressCircle = $('#progress-circle');
        var progressPercent = $('#progress-percent');
        if (progressCircle) progressCircle.style.strokeDashoffset = offset;
        if (progressPercent) progressPercent.textContent = percent + '%';

        // Render task list
        var container = $('#task-list-container');
        if (!container) return;

        if (dayTasks.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--muted);">' +
                '<div style="font-size: 3rem; margin-bottom: 12px;">&#128197;</div>' +
                '<div>这一天没有安排学习任务</div>' +
                '<div style="font-size: 0.85rem; margin-top: 8px;">可能是休息日或计划外日期</div>' +
            '</div>';
            return;
        }

        container.innerHTML = '';
        dayTasks.forEach(function(task) {
            var el = document.createElement('div');
            el.className = 'task-item';
            el.innerHTML = '<div class="task-checkbox ' + (task.completed ? 'checked' : '') + '" onclick="toggleTask(\'' + dateStr + '\', \'' + task.id + '\')">' +
                (task.completed ? '&#10003;' : '') +
            '</div>' +
            '<div class="task-content">' +
                '<div class="task-title" style="' + (task.completed ? 'text-decoration: line-through; opacity: 0.6;' : '') + '">' + task.title + '</div>' +
                '<div class="task-desc">' + task.description + '</div>' +
                '<div class="task-meta">' +
                    '<span class="task-tag tag-' + task.type + '">' + getTaskTypeLabel(task.type) + '</span>' +
                    '<span class="task-duration">&#9201; ' + task.duration + '小时</span>' +
                '</div>' +
            '</div>';
            container.appendChild(el);
        });
    }

    window.changeTaskDate = function(delta) {
        AppState.currentTaskDate = addDays(AppState.currentTaskDate, delta);
        renderTasksForDate(AppState.currentTaskDate);
    };

    // ===== Review Page =====
    function initReviewPage() {
        if (!AppState.plan && localStorage.getItem('studyPlan')) {
            var saved = localStorage.getItem('studyPlan');
            try {
                AppState.plan = JSON.parse(saved);
                AppState.tasks = AppState.plan.tasks || {};

                var savedWeaknesses = localStorage.getItem('studyWeaknesses');
                if (savedWeaknesses) {
                    AppState.weaknesses = JSON.parse(savedWeaknesses);
                }

                var savedCompletions = localStorage.getItem('taskCompletions');
                if (savedCompletions) {
                    AppState.taskCompletions = JSON.parse(savedCompletions);
                }
            } catch (e) {
                console.error('Failed to load saved plan for review:', e);
            }
        }

        var reviewContent = $('#review-content');
        var reviewEmpty = $('#review-empty');

        if (!AppState.plan) {
            if (reviewContent) reviewContent.style.display = 'none';
            if (reviewEmpty) reviewEmpty.style.display = 'block';
            return;
        }

        if (reviewContent) reviewContent.style.display = 'block';
        if (reviewEmpty) reviewEmpty.style.display = 'none';

        renderReviewCharts();
        renderWeaknesses();
        renderSuggestions();
        renderSummary();
    }

    function renderReviewCharts() {
        if (typeof echarts === 'undefined') return;

        var trendChartEl = $('#trend-chart');
        var timeChartEl = $('#time-chart');
        if (!trendChartEl || !timeChartEl) return;

        // Dispose existing charts to prevent memory leaks
        var existingTrend = echarts.getInstanceByDom(trendChartEl);
        var existingTime = echarts.getInstanceByDom(timeChartEl);
        if (existingTrend) existingTrend.dispose();
        if (existingTime) existingTime.dispose();

        // Trend chart
        var trendChart = echarts.init(trendChartEl, null, { renderer: 'svg' });
        var dates = Object.keys(AppState.tasks).slice(0, 14);
        var completedData = dates.map(function(d) {
            var tasks = AppState.tasks[d] || [];
            var count = 0;
            for (var i = 0; i < tasks.length; i++) {
                if (tasks[i].completed) count++;
            }
            return count;
        });
        var totalData = dates.map(function(d) {
            var tasks = AppState.tasks[d] || [];
            return tasks.length;
        });

        trendChart.setOption({
            animation: false,
            tooltip: { trigger: 'axis', appendToBody: true },
            grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
            xAxis: {
                type: 'category',
                data: dates.map(function(d) { return d.slice(5); }),
                axisLine: { lineStyle: { color: '#e2e8f0' } },
                axisLabel: { color: '#64748b' }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                splitLine: { lineStyle: { color: '#e2e8f0' } },
                axisLabel: { color: '#64748b' }
            },
            series: [
                {
                    name: '总任务',
                    type: 'bar',
                    data: totalData,
                    itemStyle: { color: '#e2e8f0', borderRadius: [4, 4, 0, 0] }
                },
                {
                    name: '已完成',
                    type: 'bar',
                    data: completedData,
                    itemStyle: { color: '#2563eb', borderRadius: [4, 4, 0, 0] }
                }
            ]
        });

        // Time allocation pie chart
        var timeChart = echarts.init(timeChartEl, null, { renderer: 'svg' });
        var typeStats = { study: 0, practice: 0, review: 0 };
        Object.values(AppState.tasks).forEach(function(dayTasks) {
            dayTasks.forEach(function(task) {
                if (typeStats[task.type] !== undefined) {
                    typeStats[task.type] += task.duration;
                }
            });
        });

        timeChart.setOption({
            animation: false,
            tooltip: { trigger: 'item', appendToBody: true },
            legend: { bottom: '0%', textStyle: { color: '#64748b' } },
            series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['50%', '45%'],
                data: [
                    { value: typeStats.study, name: '学习', itemStyle: { color: '#2563eb' } },
                    { value: typeStats.practice, name: '练习', itemStyle: { color: '#7c3aed' } },
                    { value: typeStats.review, name: '复盘', itemStyle: { color: '#10b981' } }
                ],
                label: { color: '#64748b' }
            }]
        });

        // Use named function for resize to avoid duplicate listeners
        if (!window._studyPlannerResizeHandler) {
            window._studyPlannerResizeHandler = function() {
                var instances = echarts.getInstanceByDom ? [
                    trendChartEl, timeChartEl
                ] : [];
                instances.forEach(function(el) {
                    var inst = echarts.getInstanceByDom(el);
                    if (inst) inst.resize();
                });
            };
            window.addEventListener('resize', window._studyPlannerResizeHandler);
        }
    }

    function renderWeaknesses() {
        var container = $('#weakness-list');
        if (!container) return;

        if (AppState.weaknesses.length === 0) {
            container.innerHTML = '<p style="color: var(--muted);">暂无薄弱知识点记录</p>';
            return;
        }

        container.innerHTML = '';
        AppState.weaknesses.forEach(function(w) {
            var el = document.createElement('div');
            el.className = 'weakness-item';
            el.innerHTML = '<div class="icon">&#9888;</div>' +
                '<div class="content">' +
                    '<div class="title">' + w.name + '</div>' +
                    '<div class="desc">' + w.suggestion + '</div>' +
                '</div>' +
                '<button class="action" onclick="showToast(\'已添加到明日任务\')">加入计划</button>';
            container.appendChild(el);
        });
    }

    function renderSuggestions() {
        var container = $('#suggestion-list');
        if (!container) return;

        var suggestions = AppState.suggestions || [];

        if (suggestions.length === 0) {
            container.innerHTML = '<p style="color: var(--muted);">暂无建议</p>';
            return;
        }

        container.innerHTML = '';
        suggestions.forEach(function(s) {
            var el = document.createElement('div');
            el.className = 'suggestion-item';
            el.innerHTML = '<div class="title">&#128161; ' + s.title + '</div>' +
                '<p>' + s.content + '</p>';
            container.appendChild(el);
        });
    }

    function renderSummary() {
        var container = $('#review-summary');
        if (!container) return;

        var totalTasks = 0;
        var completedTasks = 0;
        var totalHours = 0;
        var taskKeys = Object.keys(AppState.tasks);

        taskKeys.forEach(function(dateStr) {
            var tasks = AppState.tasks[dateStr];
            totalTasks += tasks.length;
            tasks.forEach(function(t) {
                if (t.completed) {
                    completedTasks++;
                    totalHours += t.duration;
                }
            });
        });

        var completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        container.innerHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">' +
            '<div style="text-align: center; padding: 20px; background: var(--bg); border-radius: var(--radius-md);">' +
                '<div style="font-size: 2rem; font-weight: 700; color: var(--accent); font-family: var(--font-heading);">' + completionRate + '%</div>' +
                '<div style="color: var(--muted); font-size: 0.9rem;">总体完成率</div>' +
            '</div>' +
            '<div style="text-align: center; padding: 20px; background: var(--bg); border-radius: var(--radius-md);">' +
                '<div style="font-size: 2rem; font-weight: 700; color: var(--accent2); font-family: var(--font-heading);">' + completedTasks + '/' + totalTasks + '</div>' +
                '<div style="color: var(--muted); font-size: 0.9rem;">任务完成情况</div>' +
            '</div>' +
            '<div style="text-align: center; padding: 20px; background: var(--bg); border-radius: var(--radius-md);">' +
                '<div style="font-size: 2rem; font-weight: 700; color: var(--success); font-family: var(--font-heading);">' + totalHours.toFixed(1) + '</div>' +
                '<div style="color: var(--muted); font-size: 0.9rem;">已完成学时</div>' +
            '</div>' +
            '<div style="text-align: center; padding: 20px; background: var(--bg); border-radius: var(--radius-md);">' +
                '<div style="font-size: 2rem; font-weight: 700; color: var(--warning); font-family: var(--font-heading);">' + taskKeys.length + '</div>' +
                '<div style="color: var(--muted); font-size: 0.9rem;">学习天数</div>' +
            '</div>' +
        '</div>';
    }

    // ===== Plan Page Init =====
    function initPlanPage() {
        if (AppState.plan) {
            var formContainer = $('#plan-form-container');
            var planResult = $('#plan-result');
            if (formContainer) formContainer.style.display = 'none';
            if (planResult) planResult.classList.add('active');
            renderPlanResult(AppState.plan);
        } else {
            var formContainer = $('#plan-form-container');
            var planResult = $('#plan-result');
            if (formContainer) formContainer.style.display = 'block';
            if (planResult) planResult.classList.remove('active');
        }
    }

    // ===== Reset =====
    window.resetAll = function() {
        if (!confirm('确定要重置所有数据吗？这将清除当前的学习计划和进度。')) return;

        AppState.plan = null;
        AppState.tasks = {};
        AppState.taskCompletions = {};
        AppState.studyLog = [];
        AppState.weaknesses = [];
        AppState.suggestions = [];

        localStorage.removeItem('studyPlan');
        localStorage.removeItem('taskCompletions');
        localStorage.removeItem('studyLog');
        localStorage.removeItem('studyWeaknesses');

        var formContainer = $('#plan-form-container');
        var planResult = $('#plan-result');
        if (formContainer) formContainer.style.display = 'block';
        if (planResult) planResult.classList.remove('active');

        showToast('所有数据已重置');
        showPage('home');
    };

    // ===== Initialization =====
    function init() {
        initTagInput();

        // Load saved data
        var savedPlan = localStorage.getItem('studyPlan');
        if (savedPlan) {
            try {
                AppState.plan = JSON.parse(savedPlan);
                AppState.tasks = AppState.plan.tasks || {};
            } catch (e) {
                console.error('Failed to parse saved plan:', e);
            }
        }

        var savedCompletions = localStorage.getItem('taskCompletions');
        if (savedCompletions) {
            try {
                AppState.taskCompletions = JSON.parse(savedCompletions);
            } catch (e) {
                console.error('Failed to parse saved completions:', e);
            }
        }

        var savedLog = localStorage.getItem('studyLog');
        if (savedLog) {
            try {
                AppState.studyLog = JSON.parse(savedLog);
            } catch (e) {
                console.error('Failed to parse saved log:', e);
            }
        }

        var savedWeaknesses = localStorage.getItem('studyWeaknesses');
        if (savedWeaknesses) {
            try {
                AppState.weaknesses = JSON.parse(savedWeaknesses);
            } catch (e) {
                console.error('Failed to parse saved weaknesses:', e);
            }
        }

        // Animate stats on home page
        animateStats();
    }

    function animateStats() {
        var stats = [
            { el: $('#stat-users'), target: 12580, suffix: '+' },
            { el: $('#stat-plans'), target: 86420, suffix: '+' },
            { el: $('#stat-completion'), target: 94.2, suffix: '%', isFloat: true },
            { el: $('#stat-satisfaction'), target: 4.9, suffix: '', isFloat: true }
        ];

        stats.forEach(function(stat) {
            if (!stat.el) return;
            var current = 0;
            var increment = stat.target / 60;
            var timer = setInterval(function() {
                current += increment;
                if (current >= stat.target) {
                    current = stat.target;
                    clearInterval(timer);
                }
                stat.el.textContent = stat.isFloat ? current.toFixed(1) + stat.suffix : Math.floor(current).toLocaleString() + stat.suffix;
            }, 30);
        });
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
