/**
 * C++ Mastery Path - 主应用模块
 * 整合所有模块，协调整个应用的运行
 */
const App = (function() {
    'use strict';

    // ==================== 状态管理 ====================
    let currentUnit = 1;
    let currentLesson = '1.1';
    let currentXP = 0;
    let totalLessons = 0;
    let completedLessons = 0;

    // ==================== 工具函数 ====================
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 编辑器实例
    let handsOnEditor = null;
    let sandboxEditor = null;

    // ==================== 初始化 ====================

    async function init() {
        try {
            // 初始化数据存储
            await DataStore.init();
            
            // 初始化成就系统
            await Achievements.init();

            // 加载用户进度
            await loadUserProgress();

            // 渲染导航树
            renderNavTree();

            // 渲染当前课程
            await loadLesson(currentUnit, currentLesson);

            // 绑定事件
            bindEvents();

            // 初始化CodeMirror
            initCodeEditors();

            // 加载用户设置
            await loadSettings();

            // 初始化快捷键
            initKeyboardShortcuts();

            // 初始化学习计时器
            initTimer();

            // 更新界面
            updateUI();

            // 添加成就监听
            Achievements.addListener(handleAchievementUnlocked);

            console.log('C++ Mastery Path 初始化完成！');
        } catch (error) {
            console.error('初始化失败:', error);
        }
    }

    // ==================== 导航树 ====================

    async function renderNavTree() {
        const container = document.getElementById('nav-tree');
        if (!container) return;

        let html = '';

        for (const unit of CourseData.units) {
            const isExpanded = unit.id === currentUnit;
            const isLocked = await isUnitLocked(unit.id);
            const progress = await calculateUnitProgress(unit);

            let lessonsHtml = '';
            for (const lesson of unit.lessons) {
                const lessonProgress = await getLessonProgress(unit.id, lesson.id);
                const isCompleted = lessonProgress?.completed;
                const isActive = unit.id === currentUnit && lesson.id === currentLesson;
                const isLessonLocked = isLocked;

                lessonsHtml += `
                    <div class="nav-lesson ${isActive ? 'active' : ''} ${isLessonLocked ? 'locked' : ''}" 
                         data-unit="${unit.id}" data-lesson="${lesson.id}">
                        <svg class="lesson-status-icon ${isCompleted ? 'completed' : ''} ${isLessonLocked ? 'locked' : ''}" viewBox="0 0 24 24">
                            ${isCompleted 
                                ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
                                : isLessonLocked
                                    ? '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
                                    : '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'
                            }
                        </svg>
                        <span>${lesson.title}</span>
                        ${lessonProgress?.handsOnCompleted 
                            ? `<svg class="text-success" width="14" height="14" viewBox="0 0 24 24" style="margin-left: auto;">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                               </svg>`
                            : ''}
                    </div>
                `;
            }

            html += `
                <div class="nav-unit ${isExpanded ? 'expanded' : ''} ${isLocked ? 'locked' : ''}" data-unit="${unit.id}">
                    <div class="nav-unit-header ${isLocked ? 'locked' : ''}">
                        <svg class="unit-expand-icon" viewBox="0 0 24 24">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                        <span>单元 ${unit.id}</span>
                        <span class="unit-title">${unit.title}</span>
                        <span class="unit-badge ${isLocked ? 'locked' : getBadgeClass(progress)}">${Math.round(progress)}%</span>
                    </div>
                    <div class="nav-lessons">
                        ${lessonsHtml}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    // 进度缓存
    const progressCache = new Map();

    async function getLessonProgress(unitId, lessonId) {
        const cacheKey = `${unitId}_${lessonId}`;
        if (progressCache.has(cacheKey)) {
            return progressCache.get(cacheKey);
        }
        const progress = await DataStore.getProgress(unitId, lessonId);
        progressCache.set(cacheKey, progress);
        return progress;
    }

    async function calculateUnitProgress(unit) {
        if (unit.id === 1) return 0;
        const prevUnit = CourseData.units.find(u => u.id === unit.id - 1);
        if (!prevUnit) return 0;
        
        let completedCount = 0;
        for (const l of prevUnit.lessons) {
            const progress = await getLessonProgress(prevUnit.id, l.id);
            if (progress?.completed) completedCount++;
        }
        
        return (completedCount / prevUnit.lessons.length) * 100;
    }

    async function isUnitLocked(unitId) {
        // 用户要求取消单元锁定限制，允许自由访问所有单元
        return false;
    }

    // 同步版本（用于初始化渲染）
    function isUnitLockedSync(unitId) {
        // 用户要求取消单元锁定限制，允许自由访问所有单元
        return false;
    }

    function getBadgeClass(progress) {
        if (progress >= 90) return 'gold';
        if (progress >= 70) return 'silver';
        if (progress >= 50) return 'bronze';
        return '';
    }

    // ==================== 课程加载 ====================

    async function loadLesson(unitId, lessonId) {
        const lesson = CourseData.getLessonById(unitId, lessonId);
        if (!lesson) {
            console.error('课程不存在:', unitId, lessonId);
            return;
        }

        currentUnit = unitId;
        currentLesson = lessonId;

        // 更新面包屑
        document.getElementById('breadcrumb-unit').textContent = `单元 ${unitId}`;
        document.getElementById('breadcrumb-lesson').textContent = lesson.title;

        // 更新元信息
        document.getElementById('lesson-title').textContent = lesson.title;
        document.getElementById('lesson-duration').textContent = lesson.duration;
        document.getElementById('lesson-difficulty').textContent = lesson.difficulty;
        document.getElementById('lesson-xp').textContent = `+${lesson.xp} XP`;

        // 渲染内容
        const contentContainer = document.getElementById('lesson-content');
        let html = '';

        // 概念讲解
        if (lesson.concepts) {
            html += `
                <div class="concept-card">
                    <div class="card-header">
                        <div class="card-icon">
                            <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        </div>
                        <span class="card-title">概念讲解</span>
                    </div>
                    <div class="concept-content">${marked.parse(lesson.concepts)}</div>
                </div>
            `;
        }

        // 代码示例
        if (lesson.examples && lesson.examples.length) {
            lesson.examples.forEach((example, index) => {
                html += `
                    <div class="code-example-card" data-example-index="${index}">
                        <div class="code-example-header">
                            <span class="code-example-title">${example.title}</span>
                            <div class="code-example-actions">
                                <button class="btn btn-secondary btn-icon sandbox-btn" data-code="${encodeURIComponent(example.code)}" title="在沙盒中实验">
                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                    </svg>
                                </button>
                                <button class="btn btn-secondary btn-icon copy-btn" data-code="${encodeURIComponent(example.code)}" title="复制代码">
                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="code-example-description">${example.description}</div>
                        <div class="code-editor-container">
                            <div class="editor-toolbar">
                                <span class="editor-status"><span class="editor-status-dot"></span>C++</span>
                            </div>
                            <textarea class="code-example-editor" data-index="${index}">${example.code}</textarea>
                            <div class="code-output" id="example-output-${index}"></div>
                        </div>
                        <div class="code-example-actions-bottom">
                            <button class="btn btn-primary run-example-btn" data-index="${index}">
                                <svg viewBox="0 0 24 24" width="14" height="14"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                运行代码
                            </button>
                        </div>
                    </div>
                `;
            });
        }

        // 动手实践
        if (lesson.handsOn) {
            const progress = await getLessonProgress(unitId, lessonId);
            const isCompleted = progress?.handsOnCompleted;

            html += `
                <div class="hands-on-card ${isCompleted ? 'completed' : ''}" id="hands-on-card">
                    <div class="hands-on-header">
                        <span class="hands-on-title">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path d="M16 18l2-2v-3"/><path d="M8 18l-2-2v-3"/><path d="M12 2v9"/><path d="M20 16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3l4 4"/>
                            </svg>
                            动手实践
                            ${isCompleted ? '<svg class="text-success" viewBox="0 0 24 24" width="20" height="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' : ''}
                        </span>
                        <span class="hands-on-xp">+${lesson.handsOn.xp} XP</span>
                    </div>
                    <div class="hands-on-description">${lesson.handsOn.description}</div>
                    <div class="hands-on-editor-container" id="hands-on-editor-container">
                        <div class="editor-toolbar">
                            <span class="editor-status"><span class="editor-status-dot"></span>C++</span>
                            <button class="btn btn-secondary btn-sm" id="run-only-btn">
                                <svg viewBox="0 0 24 24" width="12" height="12"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                仅运行
                            </button>
                        </div>
                        <textarea id="hands-on-editor">${lesson.handsOn.initialCode}</textarea>
                    </div>
                    
                    <!-- 编译结果反馈框 -->
                    <div class="code-feedback-box" id="hands-on-feedback" style="display: none;">
                        <div class="code-feedback-header" id="feedback-header">
                            <svg viewBox="0 0 24 24" width="16" height="16" id="feedback-icon"></svg>
                            <span id="feedback-title"></span>
                        </div>
                        <div class="code-feedback-content" id="feedback-content"></div>
                    </div>
                    
                    <div class="hands-on-actions">
                        <button class="btn btn-secondary" id="reset-code-btn">
                            <svg viewBox="0 0 24 24" width="14" height="14"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                            重置
                        </button>
                        <button class="btn btn-success" id="verify-btn" ${isCompleted ? 'disabled' : ''}>
                            <svg viewBox="0 0 24 24" width="14" height="14"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                            运行并验证
                        </button>
                    </div>
                    
                    <!-- 提示框 -->
                    <div id="hands-on-hint"></div>
                </div>
            `;
        }

        // 章节小测
        if (lesson.quiz && lesson.quiz.length) {
            html += '<div id="quiz-section"></div>';
        }

        // 保存当前编辑器内容
        const currentCode = handsOnEditor ? handsOnEditor.getValue() : '';
        
        // 重置编辑器引用（因为 DOM 将被替换）
        handsOnEditor = null;
        
        contentContainer.innerHTML = html;

        // 初始化代码编辑器
        initCodeEditors();
        
        // 恢复编辑器内容到新创建的编辑器
        if (handsOnEditor && currentCode) {
            handsOnEditor.setValue(currentCode);
        }
        
        bindContentEvents(lesson);

        // 渲染测验
        if (lesson.quiz && lesson.quiz.length) {
            QuizEngine.renderQuiz(lesson.quiz);
        }

        // 更新导航按钮
        await updateNavButtons();

        // 更新导航树高亮
        await renderNavTree();

        // 更新右侧面板
        updateAssistantTips(lesson);
        updateReferences(lesson);

        // 加载笔记
        loadNotes(unitId, lessonId);

        // 标记为已访问
        markLessonAccessed(unitId, lessonId);
    }

    async function updateNavButtons() {
        const currentUnitData = CourseData.units.find(u => u.id === currentUnit);
        const lessonIndex = currentUnitData?.lessons.findIndex(l => l.id === currentLesson) ?? -1;
        
        // 上一课
        const prevBtn = document.getElementById('prev-lesson-btn');
        if (lessonIndex > 0) {
            prevBtn.disabled = false;
            prevBtn.onclick = () => loadLesson(currentUnit, currentUnitData.lessons[lessonIndex - 1].id);
        } else if (currentUnit > 1) {
            prevBtn.disabled = false;
            prevBtn.onclick = () => {
                const prevUnit = CourseData.units.find(u => u.id === currentUnit - 1);
                const lastLesson = prevUnit.lessons[prevUnit.lessons.length - 1];
                loadLesson(currentUnit - 1, lastLesson.id);
            };
        } else {
            prevBtn.disabled = true;
        }

        // 下一课
        const nextBtn = document.getElementById('next-lesson-btn');
        const progress = await getLessonProgress(currentUnit, currentLesson);
        
        if (progress?.handsOnCompleted || !currentUnitData?.lessons[lessonIndex]?.handsOn) {
            if (lessonIndex < currentUnitData.lessons.length - 1) {
                nextBtn.disabled = false;
                nextBtn.onclick = () => loadLesson(currentUnit, currentUnitData.lessons[lessonIndex + 1].id);
            } else if (currentUnit < CourseData.units.length) {
                nextBtn.disabled = false;
                nextBtn.onclick = () => {
                    loadLesson(currentUnit + 1, `${currentUnit + 1}.1`);
                };
            } else {
                nextBtn.disabled = true;
            }
        } else {
            nextBtn.disabled = true;
        }
    }

    // ==================== 代码编辑器 ====================

    // 计算代码编辑器合适的行数高度
    function calcEditorHeight(initialCode, multiplier = 1.0) {
        if (!initialCode) return 300;
        const lines = initialCode.split('\n').length;
        const lineHeight = 24; // 每行高度
        const minHeight = 200;
        const maxHeight = 600;
        // 根据乘数计算高度
        const calculatedHeight = Math.max(minHeight, Math.min(maxHeight, lines * lineHeight * multiplier));
        return calculatedHeight;
    }

    function initCodeEditors() {
        // 示例代码编辑器 - 高度自适应
        document.querySelectorAll('.code-example-editor').forEach((textarea, index) => {
            const code = textarea.value || '';
            const editor = CodeMirror.fromTextArea(textarea, {
                mode: 'text/x-c++src',
                theme: 'monokai',
                lineNumbers: true,
                matchBrackets: true,
                autoCloseBrackets: true,
                lineWrapping: true
            });
            const height = calcEditorHeight(code);
            editor.setSize('100%', height + 'px');
            editor.setOption('viewportMargin', Infinity);
        });

        // 动手实践编辑器 - 高度根据代码长度自适应
        const handsOnTextarea = document.getElementById('hands-on-editor');
        if (handsOnTextarea && !handsOnEditor) {
            const initialCode = handsOnTextarea.value || '';
            
            handsOnEditor = CodeMirror.fromTextArea(handsOnTextarea, {
                mode: 'text/x-c++src',
                theme: 'monokai',
                lineNumbers: true,
                matchBrackets: true,
                autoCloseBrackets: true,
                lineWrapping: true,
                extraKeys: {
                    'Ctrl-Enter': () => handleVerify(),
                    'Cmd-Enter': () => handleVerify()
                }
            });
            // 根据初始代码行数计算高度，动手实践部分为初始代码高度的1.3倍
            const height = calcEditorHeight(initialCode, 1.3);
            handsOnEditor.setSize('100%', height + 'px');
            handsOnEditor.setOption('viewportMargin', Infinity);
        }

        // 沙盒编辑器
        const sandboxTextarea = document.getElementById('sandbox-editor-textarea');
        if (sandboxTextarea && !sandboxEditor) {
            sandboxEditor = CodeMirror.fromTextArea(sandboxTextarea, {
                mode: 'text/x-c++src',
                theme: 'monokai',
                lineNumbers: true,
                matchBrackets: true,
                autoCloseBrackets: true,
                lineWrapping: true
            });
            sandboxEditor.setSize('100%', '200px');
        }
    }

    // ==================== 内容事件绑定 ====================

    function bindContentEvents(lesson) {
        // 运行示例代码
        document.querySelectorAll('.run-example-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const index = parseInt(btn.dataset.index);
                const editor = document.querySelector(`.code-example-editor[data-index="${index}"]`).nextSibling.CodeMirror;
                const code = editor.getValue();
                const outputEl = document.getElementById(`example-output-${index}`);
                
                btn.disabled = true;
                btn.innerHTML = '<span class="loading-spinner"></span> 编译中...';
                
                await CompilerAPI.runCode(code, outputEl);
                
                btn.disabled = false;
                btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><polygon points="5 3 19 12 5 21 5 3"/></svg> 运行代码';
            });
        });

        // 复制代码
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const code = decodeURIComponent(btn.dataset.code);
                navigator.clipboard.writeText(code).then(() => {
                    btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg>';
                    setTimeout(() => {
                        btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
                    }, 2000);
                });
            });
        });

        // 沙盒实验
        document.querySelectorAll('.sandbox-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const code = decodeURIComponent(btn.dataset.code);
                openSandbox(code);
            });
        });

        // 仅运行代码
        const runOnlyBtn = document.getElementById('run-only-btn');
        if (runOnlyBtn && lesson.handsOn) {
            runOnlyBtn.addEventListener('click', async () => {
                if (!handsOnEditor) return;
                
                const code = handsOnEditor.getValue();
                const feedbackBox = document.getElementById('hands-on-feedback');
                const feedbackHeader = document.getElementById('feedback-header');
                const feedbackContent = document.getElementById('feedback-content');
                const feedbackIcon = document.getElementById('feedback-icon');
                const feedbackTitle = document.getElementById('feedback-title');
                
                runOnlyBtn.disabled = true;
                runOnlyBtn.innerHTML = '<span class="loading-spinner"></span> 运行中...';
                
                const result = await CompilerAPI.compileAndRun(code);
                
                runOnlyBtn.disabled = false;
                runOnlyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12"><polygon points="5 3 19 12 5 21 5 3"/></svg> 仅运行';
                
                feedbackBox.style.display = 'block';
                
                if (result.success) {
                    feedbackHeader.className = 'code-feedback-header success';
                    feedbackIcon.innerHTML = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>';
                    feedbackTitle.textContent = '编译成功';
                    feedbackContent.className = 'code-feedback-content success';
                    feedbackContent.innerHTML = `<div class="code-feedback-output-section">
                        <div class="code-feedback-output-label">输出结果</div>
                        <div>${escapeHtml(result.output || '(无输出)')}</div>
                    </div>`;
                } else {
                    feedbackHeader.className = 'code-feedback-header error';
                    feedbackIcon.innerHTML = '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>';
                    feedbackTitle.textContent = '编译失败';
                    feedbackContent.className = 'code-feedback-content error';
                    
                    let errorHtml = '';
            if (result.compileOutput) {
                errorHtml += `<div class="code-feedback-output-section">
                    <div class="code-feedback-output-label">编译器输出</div>
                    <pre style="white-space: pre-wrap; word-break: break-all; margin: 0;">${escapeHtml(result.compileOutput)}</pre>
                </div>`;
            }
            if (result.error) {
                errorHtml += `<div class="code-feedback-output-section">
                    <div class="code-feedback-output-label">运行时错误</div>
                    <pre style="white-space: pre-wrap; word-break: break-all; margin: 0;">${escapeHtml(result.error)}</pre>
                </div>`;
            }
            if (result.signal) {
                errorHtml += `<div class="code-feedback-output-section">
                    <div class="code-feedback-output-label">信号信息</div>
                    <pre style="white-space: pre-wrap; word-break: break-all; margin: 0;">${escapeHtml(result.signal)}</pre>
                </div>`;
            }
            if (result.status && result.status !== 0) {
                errorHtml += `<div class="code-feedback-output-section">
                    <div class="code-feedback-output-label">退出状态码</div>
                    <pre style="white-space: pre-wrap; word-break: break-all; margin: 0;">${escapeHtml(String(result.status))}</pre>
                </div>`;
            }
            feedbackContent.innerHTML = errorHtml || '<div>编译失败</div>';
                }
            });
        }

        // 重置代码
        const resetBtn = document.getElementById('reset-code-btn');
        if (resetBtn && lesson.handsOn) {
            resetBtn.addEventListener('click', () => {
                if (handsOnEditor && lesson.handsOn.initialCode) {
                    handsOnEditor.setValue(lesson.handsOn.initialCode);
                    // 隐藏反馈框
                    const feedbackBox = document.getElementById('hands-on-feedback');
                    if (feedbackBox) feedbackBox.style.display = 'none';
                }
            });
        }

        // 验证代码
        const verifyBtn = document.getElementById('verify-btn');
        if (verifyBtn) {
            verifyBtn.addEventListener('click', handleVerify);
        }
    }

    async function handleVerify() {
        if (!handsOnEditor) return;
        
        const code = handsOnEditor.getValue();
        const lesson = CourseData.getLessonById(currentUnit, currentLesson);
        if (!lesson || !lesson.handsOn) return;

        const verifyBtn = document.getElementById('verify-btn');
        const container = document.getElementById('hands-on-editor-container');
        const feedbackBox = document.getElementById('hands-on-feedback');
        const feedbackHeader = document.getElementById('feedback-header');
        const feedbackContent = document.getElementById('feedback-content');
        const feedbackIcon = document.getElementById('feedback-icon');
        const feedbackTitle = document.getElementById('feedback-title');
        const hintContainer = document.getElementById('hands-on-hint');

        verifyBtn.disabled = true;
        container.classList.add('verifying');
        verifyBtn.innerHTML = '<span class="loading-spinner"></span> 验证中...';
        
        // 显示反馈框
        feedbackBox.style.display = 'block';
        feedbackHeader.className = 'code-feedback-header info';
        feedbackIcon.innerHTML = '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>';
        feedbackTitle.textContent = '编译中...';
        feedbackContent.className = 'code-feedback-content info';
        feedbackContent.innerHTML = '<span class="loading-spinner"></span> 正在编译和运行代码...';

        const result = await CompilerAPI.compileAndRun(code);

        container.classList.remove('verifying');

        if (result.success) {
            // 检查输出是否匹配
            const expectedOutput = lesson.handsOn.expectedOutput;
            const normalizedActual = result.output.trim().replace(/\s+/g, ' ');
            const normalizedExpected = expectedOutput.trim().replace(/\s+/g, ' ');
            const isMatch = normalizedActual === normalizedExpected || 
                           (lesson.handsOn.solutionRegex && new RegExp(lesson.handsOn.solutionRegex, 'i').test(result.output));
            
            if (isMatch) {
                feedbackHeader.className = 'code-feedback-header success';
                feedbackIcon.innerHTML = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>';
                feedbackTitle.textContent = '答案正确！';
                feedbackContent.className = 'code-feedback-content success';
                feedbackContent.innerHTML = `<div class="code-feedback-output-section">
                    <div class="code-feedback-output-label">输出结果</div>
                    <div>${escapeHtml(result.output || '(无输出)')}</div>
                </div>`;
                
                container.classList.add('success');
                container.classList.remove('error');
                
                // 标记完成
                await markHandsOnCompleted(currentUnit, currentLesson);
                
                // 奖励XP（带默认值检查）
                const handsOnXP = (typeof lesson.handsOn?.xp === 'number' && lesson.handsOn.xp > 0) 
                    ? lesson.handsOn.xp 
                    : XPTable?.lesson?.complete_hands_on || 150;
                await awardXP(handsOnXP);
                
                // 庆祝动画
                playSuccessAnimation();
                
                // 更新导航
                await updateNavButtons();
                
                // 更新导航树
                renderNavTree();

                verifyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> 已完成';
                
                // 隐藏提示
                hintContainer.innerHTML = '';
            } else {
                feedbackHeader.className = 'code-feedback-header error';
                feedbackIcon.innerHTML = '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>';
                feedbackTitle.textContent = '输出不匹配';
                feedbackContent.className = 'code-feedback-content error';
                feedbackContent.innerHTML = `<div class="code-feedback-output-section">
                    <div class="code-feedback-output-label">你的输出</div>
                    <div>${escapeHtml(result.output || '(无输出)')}</div>
                </div>
                <div class="code-feedback-output-section">
                    <div class="code-feedback-output-label">期望输出</div>
                    <div>${escapeHtml(expectedOutput)}</div>
                </div>`;
                
                container.classList.add('error');
                container.classList.remove('success');
                verifyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> 再试一次';
                
                // 显示提示
                if (lesson.handsOn.hint) {
                    hintContainer.innerHTML = `<div class="hint-box">${lesson.handsOn.hint}</div>`;
                }
            }
        } else {
            feedbackHeader.className = 'code-feedback-header error';
            feedbackIcon.innerHTML = '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>';
            feedbackTitle.textContent = '编译失败';
            feedbackContent.className = 'code-feedback-content error';
            
            let errorHtml = '';
            if (result.compileOutput) {
                errorHtml += `<div class="code-feedback-output-section">
                    <div class="code-feedback-output-label">编译器输出</div>
                    <pre style="white-space: pre-wrap; word-break: break-all; margin: 0;">${escapeHtml(result.compileOutput)}</pre>
                </div>`;
            }
            if (result.error) {
                errorHtml += `<div class="code-feedback-output-section">
                    <div class="code-feedback-output-label">运行时错误</div>
                    <pre style="white-space: pre-wrap; word-break: break-all; margin: 0;">${escapeHtml(result.error)}</pre>
                </div>`;
            }
            if (result.signal) {
                errorHtml += `<div class="code-feedback-output-section">
                    <div class="code-feedback-output-label">信号信息</div>
                    <pre style="white-space: pre-wrap; word-break: break-all; margin: 0;">${escapeHtml(result.signal)}</pre>
                </div>`;
            }
            if (result.status && result.status !== 0) {
                errorHtml += `<div class="code-feedback-output-section">
                    <div class="code-feedback-output-label">退出状态码</div>
                    <pre style="white-space: pre-wrap; word-break: break-all; margin: 0;">${escapeHtml(String(result.status))}</pre>
                </div>`;
            }
            feedbackContent.innerHTML = errorHtml || '<div>编译失败，请检查代码</div>';
            
            container.classList.add('error');
            container.classList.remove('success');
            verifyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> 再试一次';
            
            // 显示提示
            if (lesson.handsOn.hint) {
                hintContainer.innerHTML = `<div class="hint-box">${lesson.handsOn.hint}</div>`;
            }
        }

        verifyBtn.disabled = false;
    }

    // ==================== 成就系统 ====================

    async function handleAchievementUnlocked(achievement) {
        // 显示成就弹窗
        const overlay = document.getElementById('achievement-overlay');
        const icon = document.getElementById('achievement-icon');
        const title = document.getElementById('achievement-title');
        const desc = document.getElementById('achievement-description');
        const xp = document.getElementById('achievement-xp');

        icon.innerHTML = `<svg viewBox="0 0 24 24">${Achievements.getAchievementIcon(achievement.icon)}</svg>`;
        title.textContent = achievement.title;
        desc.textContent = achievement.description;
        // XP值带默认值检查
        const achievementXP = (typeof achievement.xp === 'number' && achievement.xp > 0) 
            ? achievement.xp 
            : 50;
        xp.textContent = `+${achievementXP} XP`;
        
        // 额外奖励成就XP
        await awardXP(achievementXP);

        overlay.classList.add('show');

        // 播放音效
        playAchievementSound();

        // 自动关闭
        setTimeout(() => {
            overlay.classList.remove('show');
        }, 5000);

        // 更新UI
        updateUI();
    }

    function playAchievementSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('音频播放失败:', e);
        }
    }

    // ==================== 沙盒 ====================

    function openSandbox(code = '') {
        const panel = document.getElementById('sandbox-panel');
        panel.classList.remove('minimized');
        
        if (sandboxEditor && code) {
            sandboxEditor.setValue(code);
        }
        
        sandboxEditor?.focus();
    }

    function closeSandbox() {
        document.getElementById('sandbox-panel').classList.add('minimized');
    }

    async function runSandbox() {
        if (!sandboxEditor) return;
        
        const code = sandboxEditor.getValue();
        const outputEl = document.getElementById('sandbox-output');
        
        outputEl.textContent = '编译中...';
        outputEl.classList.remove('error');

        const result = await CompilerAPI.compileAndRun(code);
        
        if (result.success) {
            outputEl.textContent = result.output || '(无输出)';
        } else {
            outputEl.textContent = result.error || result.compileOutput || '编译失败';
            outputEl.classList.add('error');
        }
    }

    // ==================== 笔记 ====================

    async function loadNotes(unitId, lessonId) {
        const note = await DataStore.getNote(`${unitId}_${lessonId}`);
        const textarea = document.getElementById('notes-textarea');
        const preview = document.getElementById('notes-preview');
        
        if (textarea) {
            textarea.value = note?.content || '';
        }
        
        if (preview) {
            preview.innerHTML = marked.parse(textarea?.value || '');
        }
    }

    async function saveNotes() {
        const textarea = document.getElementById('notes-textarea');
        const preview = document.getElementById('notes-preview');
        
        if (textarea) {
            await DataStore.saveNote(`${currentUnit}_${currentLesson}`, textarea.value);
            
            if (preview) {
                preview.innerHTML = marked.parse(textarea.value);
                preview.classList.toggle('show');
            }
            
            // 显示保存成功提示
            showToast('笔记已保存');
        }
    }

    // ==================== 智能助手 ====================

    function updateAssistantTips(lesson) {
        const tipsList = document.getElementById('quick-tips-list');
        if (tipsList && lesson.assistantTips) {
            tipsList.innerHTML = lesson.assistantTips.map(tip => `<li>${tip}</li>`).join('');
        }
    }

    function sendAssistantMessage() {
        const input = document.getElementById('assistant-input');
        const messagesContainer = document.getElementById('assistant-messages');
        const message = input.value.trim();

        if (!message) return;

        // 添加用户消息
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'assistant-message user';
        userMessageDiv.innerHTML = `
            <div class="message-avatar">
                <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
        messagesContainer.appendChild(userMessageDiv);

        // 清空输入框
        input.value = '';

        // 模拟AI回复
        setTimeout(() => {
            const aiMessageDiv = document.createElement('div');
            aiMessageDiv.className = 'assistant-message ai';
            aiMessageDiv.innerHTML = `
                <div class="message-avatar">
                    <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6a1 1 0 0 0-1 1v5a1 1 0 0 0 .293.707l2.828 2.829a1 1 0 1 0 1.414-1.415L13 12.586V7a1 1 0 0 0-1-1z"/></svg>
                </div>
                <div class="message-content">
                    <p>感谢您的提问！作为您的C++学习助手，我会尽力帮助您理解和掌握C++编程知识。请具体描述您遇到的问题或想了解的概念。</p>
                </div>
            `;
            messagesContainer.appendChild(aiMessageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 500);

        // 滚动到底部
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function updateReferencesPanel() {
        const container = document.getElementById('references-container');
        if (container && !container.innerHTML.trim()) {
            container.innerHTML = '<p class="text-muted">本节暂无参考资料</p>';
        }
    }

    function updateReferences(lesson) {
        const container = document.getElementById('references-container');
        if (!container || !lesson.references) {
            container.innerHTML = '<p class="text-muted">本节暂无参考资料</p>';
            return;
        }

        container.innerHTML = lesson.references.map(ref => `
            <div class="reference-item">
                <div class="reference-title">${ref.title}</div>
                ${ref.book ? `<div class="reference-meta">${ref.book} ${ref.chapter || ''}</div>` : ''}
                ${ref.url ? `<a href="${ref.url}" target="_blank" class="reference-link">访问文档 →</a>` : ''}
            </div>
        `).join('');
    }

    // ==================== 进度管理 ====================

    async function markLessonAccessed(unitId, lessonId) {
        const progress = await DataStore.getProgress(unitId, lessonId);
        progress.lastAccessed = Date.now();
        await DataStore.saveProgress(progress);
    }

    async function markHandsOnCompleted(unitId, lessonId) {
        const progress = await DataStore.getProgress(unitId, lessonId);
        progress.handsOnCompleted = true;
        progress.completed = true;
        await DataStore.saveProgress(progress);
        
        // 更新缓存
        const cacheKey = `${unitId}_${lessonId}`;
        progressCache.set(cacheKey, progress);
        
        completedLessons++;
    }

    async function awardXP(amount) {
        // 类型检查和默认值处理
        const xpAmount = (typeof amount === 'number' && !isNaN(amount)) ? Math.floor(amount) : 0;
        
        if (xpAmount <= 0) {
            console.warn('awardXP: 无效的XP数值', amount);
            return;
        }
        
        currentXP += xpAmount;
        await DataStore.saveSetting('totalXP', currentXP);
        
        // 显示XP获得提示
        showXPGainToast(xpAmount);
        
        // 检查成就
        const stats = await DataStore.getUserStats();
        stats.totalXP = currentXP;
        await Achievements.checkAchievements(stats);
        
        updateUI();
    }
    
    // XP获得提示动画
    function showXPGainToast(amount) {
        // 移除已有的toast
        const existingToast = document.querySelector('.xp-gain-toast');
        if (existingToast) existingToast.remove();
        
        // 创建toast
        const toast = document.createElement('div');
        toast.className = 'xp-gain-toast';
        toast.innerHTML = `
            <div class="xp-gain-icon">⭐</div>
            <div class="xp-gain-amount">+${amount} XP</div>
        `;
        document.body.appendChild(toast);
        
        // 触发动画
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // 2秒后移除
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    async function loadUserProgress() {
        currentXP = await DataStore.getSetting('totalXP', 0);
        const stats = await DataStore.getUserStats();
        completedLessons = stats.completedLessons;
    }

    // ==================== UI更新 ====================

    function updateUI() {
        // XP进度
        const levelInfo = Achievements.getLevelInfo(currentXP);
        
        document.getElementById('total-xp').textContent = currentXP;
        document.getElementById('xp-bar').style.width = `${levelInfo.progress}%`;
        document.getElementById('xp-level').textContent = `等级 ${levelInfo.level} - ${levelInfo.title}`;
        document.getElementById('progress-text').textContent = `${Math.round(levelInfo.progress)}%`;
        document.getElementById('progress-ring').style.setProperty('--progress', levelInfo.progress);

        // 顶部导航栏等级和XP显示
        const navLevel = document.getElementById('nav-level');
        if (navLevel) {
            navLevel.textContent = `Lv.${levelInfo.level}`;
        }
        const navXp = document.getElementById('nav-xp');
        if (navXp) {
            navXp.textContent = currentXP;
        }

        // 连续学习天数
        const stats = DataStore.getUserStats?.() || { streak: 0 };
        document.getElementById('streak-count').textContent = stats.streak || 0;
    }

    async function loadSettings() {
        const theme = await DataStore.getSetting('theme', 'dark');
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        }
    }

    // ==================== 动画 ====================

    function playSuccessAnimation() {
        // 粒子动画
        const overlay = document.getElementById('celebration-overlay');
        const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
        
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDelay = `${Math.random() * 0.5}s`;
            overlay.appendChild(particle);
            
            setTimeout(() => particle.remove(), 2000);
        }

        // 打勾动画
        const checkmark = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        checkmark.classList.add('checkmark-animation');
        checkmark.setAttribute('viewBox', '0 0 100 100');
        checkmark.innerHTML = `
            <circle class="checkmark-circle" cx="50" cy="50" r="45" fill="none" stroke="#3fb950" stroke-width="3"/>
            <path class="checkmark-check" fill="none" stroke="#3fb950" stroke-width="4" d="M28 50 L45 67 L72 35"/>
        `;
        document.body.appendChild(checkmark);
        
        setTimeout(() => {
            checkmark.classList.add('show');
            setTimeout(() => checkmark.remove(), 1000);
        }, 100);
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-secondary);
            color: var(--text-primary);
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 3000;
            animation: fadeInUp 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // ==================== 学习计时器 ====================

    let timerInterval = null;
    let timerSeconds = 25 * 60;
    let timerRunning = false;
    let timerMinimized = false;
    let totalLearningSeconds = 0;
    let learningDayTimer = null;

    function initTimer() {
        updateTimerDisplay();
        bindTimerEvents();
        initLearningDayTracking();
    }

    function bindTimerEvents() {
        // 计时器控制按钮
        document.getElementById('timer-start-btn').addEventListener('click', startTimer);
        document.getElementById('timer-pause-btn').addEventListener('click', pauseTimer);
        document.getElementById('timer-reset-btn').addEventListener('click', resetTimer);
        document.getElementById('timer-decrease-btn').addEventListener('click', decreaseTimer);
        document.getElementById('timer-increase-btn').addEventListener('click', increaseTimer);
        document.getElementById('timer-minimize-btn').addEventListener('click', minimizeTimer);
        
        // 计时器球体事件
        const sphere = document.getElementById('timer-sphere');
        sphere.addEventListener('mousedown', onSphereMouseDown);
        sphere.addEventListener('dblclick', expandTimer);
    }

    function startTimer() {
        if (timerRunning) return;
        
        timerRunning = true;
        updateTimerButtons();
        
        // 显示计时器容器（如果最小化）
        if (timerMinimized) {
            expandTimer();
        }
        
        // 更新状态
        document.getElementById('timer-status').textContent = '学习中...';
        
        timerInterval = setInterval(() => {
            timerSeconds--;
            totalLearningSeconds++;
            
            updateTimerDisplay();
            updateProgress();
            
            if (timerSeconds <= 0) {
                stopTimer();
                showTimerComplete();
            }
        }, 1000);
    }

    function pauseTimer() {
        if (!timerRunning) return;
        
        clearInterval(timerInterval);
        timerRunning = false;
        updateTimerButtons();
        document.getElementById('timer-status').textContent = '已暂停';
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerRunning = false;
        updateTimerButtons();
    }

    function resetTimer() {
        stopTimer();
        timerSeconds = 25 * 60;
        totalLearningSeconds = 0;
        updateTimerDisplay();
        updateProgress();
        document.getElementById('timer-status').textContent = '准备开始';
    }

    function decreaseTimer() {
        if (timerRunning) return;
        if (timerSeconds <= 60) return;
        
        timerSeconds -= 60;
        updateTimerDisplay();
    }

    function increaseTimer() {
        if (timerRunning) return;
        if (timerSeconds >= 120 * 60) return;
        
        timerSeconds += 60;
        updateTimerDisplay();
    }

    function minimizeTimer() {
        const container = document.getElementById('timer-container');
        const sphere = document.getElementById('timer-sphere');
        
        container.style.display = 'none';
        sphere.style.display = 'flex';
        
        timerMinimized = true;
        
        // 球体放置在右下角
        sphere.style.right = '20px';
        sphere.style.bottom = '100px';
        sphere.style.left = 'auto';
        sphere.style.top = 'auto';
    }

    function expandTimer() {
        const container = document.getElementById('timer-container');
        const sphere = document.getElementById('timer-sphere');
        
        container.style.display = 'block';
        sphere.style.display = 'none';
        
        timerMinimized = false;
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timerSeconds / 60);
        const seconds = timerSeconds % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timer-time').textContent = timeStr;
        document.getElementById('sphere-time').textContent = timeStr;
    }

    function updateProgress() {
        const totalTime = 25 * 60;
        const progress = ((totalTime - timerSeconds) / totalTime) * 100;
        
        document.getElementById('timer-progress').style.width = `${progress}%`;
        
        // 更新球体进度环
        const circumference = 2 * Math.PI * 26;
        const offset = circumference - (progress / 100) * circumference;
        document.getElementById('sphere-ring-fill').style.strokeDashoffset = offset;
        
        // 更新球体脉冲效果
        const pulse = document.getElementById('sphere-pulse');
        if (timerRunning) {
            pulse.style.opacity = 0.3 + Math.sin(Date.now() / 500) * 0.2;
        } else {
            pulse.style.opacity = 0;
        }
    }

    function updateTimerButtons() {
        const startBtn = document.getElementById('timer-start-btn');
        const pauseBtn = document.getElementById('timer-pause-btn');
        const decBtn = document.getElementById('timer-decrease-btn');
        const incBtn = document.getElementById('timer-increase-btn');
        
        if (timerRunning) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            decBtn.disabled = true;
            incBtn.disabled = true;
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            decBtn.disabled = false;
            incBtn.disabled = false;
        }
    }

    function showTimerComplete() {
        document.getElementById('timer-status').textContent = '计时结束！';
        
        // 自动展开计时器（如果最小化）
        if (timerMinimized) {
            expandTimer();
        }
        
        // 发送通知
        if (Notification.permission === 'granted') {
            new Notification('C++ Mastery Path', {
                body: '学习时间结束！休息一下吧 ☕'
            });
        }
        
        // 更新学习天数
        const minutesCompleted = Math.floor(totalLearningSeconds / 60);
        if (minutesCompleted > 0 && LearningDays) {
            const dayCompleted = LearningDays.addMinutes(minutesCompleted);
            if (dayCompleted) {
                showToast(`🎉 今日学习达标！已累计 ${LearningDays.getTotalDays()} 天`, 'success');
            }
        }
        
        // 重置计时器
        setTimeout(() => {
            resetTimer();
        }, 3000);
    }

    // 计时器球体拖拽功能
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let isDragging = false;

    function onSphereMouseDown(e) {
        const sphere = e.target.closest('.timer-sphere') || e.target;
        const rect = sphere.getBoundingClientRect();
        
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        isDragging = true;
        
        sphere.style.cursor = 'grabbing';
        
        document.addEventListener('mousemove', onSphereMouseMove);
        document.addEventListener('mouseup', onSphereMouseUp);
        
        e.preventDefault();
    }

    function onSphereMouseMove(e) {
        if (!isDragging) return;
        
        const sphere = document.getElementById('timer-sphere');
        let x = e.clientX - dragOffsetX;
        let y = e.clientY - dragOffsetY;
        
        // 限制在视窗内
        const maxX = window.innerWidth - sphere.offsetWidth;
        const maxY = window.innerHeight - sphere.offsetHeight;
        
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));
        
        sphere.style.left = `${x}px`;
        sphere.style.top = `${y}px`;
        sphere.style.right = 'auto';
        sphere.style.bottom = 'auto';
    }

    function onSphereMouseUp() {
        isDragging = false;
        const sphere = document.getElementById('timer-sphere');
        sphere.style.cursor = 'grab';
        
        document.removeEventListener('mousemove', onSphereMouseMove);
        document.removeEventListener('mouseup', onSphereMouseUp);
    }

    // ==================== 学习天数追踪 ====================

    function initLearningDayTracking() {
        if (!LearningDays) return;
        
        LearningDays.init().then(() => {
            updateLearningDaysUI();
        });
        
        // 后台计时器，每60秒检查一次学习时长
        learningDayTimer = setInterval(() => {
            if (timerRunning && LearningDays) {
                if (!LearningDays.isTodayCompleted()) {
                    LearningDays.addMinutes(1);
                    updateLearningDaysUI();
                } else {
                    // 今日已完成，停止追踪
                    clearInterval(learningDayTimer);
                }
            }
        }, 60000);
    }

    function updateLearningDaysUI() {
        if (!LearningDays) return;
        
        const streakEl = document.getElementById('streak-count');
        const totalDaysEl = document.getElementById('total-learning-days');
        
        if (streakEl) {
            streakEl.textContent = LearningDays.getStreak();
        }
        
        if (totalDaysEl) {
            totalDaysEl.textContent = LearningDays.getTotalDays();
        }
    }

    // ==================== 快捷键 ====================

    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K 搜索
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                toggleSearchModal();
            }
            
            // Ctrl+Enter 运行验证
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                handleVerify();
            }
            
            // Escape 关闭弹窗
            if (e.key === 'Escape') {
                closeSearchModal();
                closeAchievementOverlay();
            }
            
            // 左右箭头切换课程
            if (e.key === 'ArrowLeft' && !isInputFocused()) {
                const prevBtn = document.getElementById('prev-lesson-btn');
                if (!prevBtn.disabled) prevBtn.click();
            }
            
            if (e.key === 'ArrowRight' && !isInputFocused()) {
                const nextBtn = document.getElementById('next-lesson-btn');
                if (!nextBtn.disabled) nextBtn.click();
            }
        });
    }

    function isInputFocused() {
        const active = document.activeElement;
        return active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.classList.contains('CodeMirror'));
    }

    // ==================== 搜索 ====================

    function toggleSearchModal() {
        const modal = document.getElementById('search-modal');
        const overlay = document.getElementById('search-modal-overlay');
        const input = document.getElementById('search-modal-input');
        
        if (modal.classList.contains('show')) {
            closeSearchModal();
        } else {
            modal.classList.add('show');
            overlay.classList.add('show');
            setTimeout(() => input.focus(), 100);
        }
    }

    function closeSearchModal() {
        document.getElementById('search-modal').classList.remove('show');
        document.getElementById('search-modal-overlay').classList.remove('show');
    }

    function performSearch(query) {
        const resultsContainer = document.getElementById('search-modal-results');
        const emptyState = document.getElementById('search-modal-empty');
        
        if (!query.trim()) {
            resultsContainer.innerHTML = '';
            emptyState.classList.remove('show');
            return;
        }

        const results = [];
        
        CourseData.units.forEach(unit => {
            unit.lessons.forEach(lesson => {
                const titleMatch = lesson.title.toLowerCase().includes(query.toLowerCase());
                const conceptMatch = lesson.concepts?.toLowerCase().includes(query.toLowerCase());
                
                if (titleMatch || conceptMatch) {
                    results.push({
                        unitId: unit.id,
                        lessonId: lesson.id,
                        title: lesson.title,
                        unit: unit.title,
                        type: titleMatch ? '课程' : '内容'
                    });
                }
            });
        });

        if (results.length === 0) {
            resultsContainer.innerHTML = '';
            emptyState.classList.add('show');
        } else {
            emptyState.classList.remove('show');
            resultsContainer.innerHTML = results.map(r => `
                <div class="search-result" data-unit="${r.unitId}" data-lesson="${r.lessonId}">
                    <svg class="search-result-icon" viewBox="0 0 24 24">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                    <div class="search-result-content">
                        <div class="search-result-title">${r.title}</div>
                        <div class="search-result-meta">${r.unit}</div>
                    </div>
                    <span class="search-result-badge">${r.type}</span>
                </div>
            `).join('');

            // 绑定点击事件
            resultsContainer.querySelectorAll('.search-result').forEach(item => {
                item.addEventListener('click', () => {
                    const unitId = parseInt(item.dataset.unit);
                    const lessonId = item.dataset.lesson;
                    closeSearchModal();
                    loadLesson(unitId, lessonId);
                });
            });
        }
    }

    function closeAchievementOverlay() {
        document.getElementById('achievement-overlay').classList.remove('show');
    }

    // ==================== 事件绑定 ====================

    function bindEvents() {
        // 导航树
        document.getElementById('nav-tree').addEventListener('click', (e) => {
            const unitHeader = e.target.closest('.nav-unit-header');
            const lessonItem = e.target.closest('.nav-lesson');
            
            if (unitHeader) {
                const unit = unitHeader.closest('.nav-unit');
                unit.classList.toggle('expanded');
            }
            
            if (lessonItem && !lessonItem.classList.contains('locked')) {
                const unitId = parseInt(lessonItem.dataset.unit);
                const lessonId = lessonItem.dataset.lesson;
                loadLesson(unitId, lessonId);
            }
        });

        // 侧边栏切换
        document.getElementById('toggle-sidebar-btn').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });

        document.getElementById('sidebar-overlay').addEventListener('click', () => {
            document.getElementById('sidebar').classList.remove('visible');
            document.getElementById('sidebar-overlay').classList.remove('show');
        });

        // 右侧面板切换
        document.getElementById('toggle-panel-btn').addEventListener('click', () => {
            const panel = document.getElementById('right-panel');
            panel.classList.toggle('hidden');
            document.body.classList.toggle('hidden-right-panel');
        });

        // 面板标签页
        document.getElementById('panel-tabs').addEventListener('click', (e) => {
            const tab = e.target.closest('.panel-tab');
            if (!tab) return;

            document.querySelectorAll('.panel-tab').forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            document.querySelectorAll('.panel-section').forEach(s => s.classList.remove('active'));

            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            document.getElementById(`${tab.dataset.tab}-section`).classList.add('active');
        });

        // 笔记
        document.getElementById('save-notes-btn').addEventListener('click', saveNotes);
        
        document.getElementById('preview-notes-btn').addEventListener('click', () => {
            const preview = document.getElementById('notes-preview');
            preview.classList.toggle('show');
        });

        document.getElementById('notes-textarea').addEventListener('input', (e) => {
            document.getElementById('notes-preview').innerHTML = marked.parse(e.target.value);
        });

        // 助手面板
        document.getElementById('assistant-send-btn').addEventListener('click', sendAssistantMessage);
        document.getElementById('assistant-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendAssistantMessage();
            }
        });

        // 参考面板
        updateReferencesPanel();

        // 成就弹窗
        document.getElementById('achievement-close-btn').addEventListener('click', closeAchievementOverlay);
        document.getElementById('achievement-overlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeAchievementOverlay();
        });

        // 搜索
        document.getElementById('search-modal-overlay').addEventListener('click', closeSearchModal);
        document.getElementById('search-modal-input').addEventListener('input', (e) => {
            performSearch(e.target.value);
        });

        // 移动端导航
        const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
        mobileNavItems.forEach(item => {
            item.addEventListener('click', () => {
                const id = item.id;
                
                mobileNavItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                if (id === 'mobile-nav-home') {
                    loadLesson(1, '1.1');
                } else if (id === 'mobile-nav-sandbox') {
                    openSandbox();
                } else if (id === 'mobile-nav-progress') {
                    // 跳转到进度页面
                    window.location.href = 'progress.html';
                } else if (id === 'mobile-nav-achievements') {
                    // 显示成就
                    showAchievementsList();
                } else if (id === 'mobile-nav-settings') {
                    // 跳转到设置页面
                    window.location.href = 'config.html';
                }
            });
        });

        // 请求通知权限
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // 设置功能
        bindSettingsEvents();

        // 笔记功能
        bindNotesEvents();

        // 小结测验
        bindQuizEvents();

        // 页面关闭时保存数据
        window.addEventListener('beforeunload', async () => {
            // 保存当前课程进度
            if (currentUnit && currentLesson) {
                const progress = await DataStore.getProgress(currentUnit, currentLesson);
                progress.lastAccessed = Date.now();
                await DataStore.saveProgress(progress);
            }
            // 更新最后活跃时间
            await DataStore.updateLastActive();
        });
    }

    // ==================== 笔记自动备份功能 ====================

    let notesAutoSaveTimer = null;

    function bindNotesEvents() {
        const notesTextarea = document.getElementById('notes-textarea');
        
        // 笔记输入时自动备份
        notesTextarea?.addEventListener('input', () => {
            // 取消之前的定时器
            if (notesAutoSaveTimer) {
                clearTimeout(notesAutoSaveTimer);
            }
            
            // 延迟500ms后保存，避免频繁存储
            notesAutoSaveTimer = setTimeout(async () => {
                await saveNotesAuto();
            }, 500);
        });

        // 页面关闭前强制保存
        window.addEventListener('beforeunload', async (e) => {
            await saveNotesAuto();
        });

        // 手动保存按钮
        document.getElementById('save-notes-btn')?.addEventListener('click', async () => {
            await saveNotesManual();
        });

        // 预览按钮
        document.getElementById('preview-notes-btn')?.addEventListener('click', toggleNotesPreview);
    }

    async function saveNotesAuto() {
        const notesTextarea = document.getElementById('notes-textarea');
        if (!notesTextarea) return;

        const content = notesTextarea.value;
        if (!content.trim()) return;

        try {
            const unitId = currentUnit || 'default';
            const lessonId = currentLesson || 'default';
            
            const notesData = {
                content: content,
                unitId: unitId,
                lessonId: lessonId,
                lastSaved: Date.now(),
                autoSaved: true
            };

            await DataStore.saveNotes(notesData);
            showAutoSaveIndicator();
        } catch (error) {
            console.error('笔记自动保存失败:', error);
        }
    }

    async function saveNotesManual() {
        const notesTextarea = document.getElementById('notes-textarea');
        if (!notesTextarea) return;

        const content = notesTextarea.value;

        try {
            const unitId = currentUnit || 'default';
            const lessonId = currentLesson || 'default';
            
            const notesData = {
                content: content,
                unitId: unitId,
                lessonId: lessonId,
                lastSaved: Date.now(),
                autoSaved: false
            };

            await DataStore.saveNotes(notesData);
            showToast('笔记已保存');
        } catch (error) {
            console.error('笔记保存失败:', error);
            showToast('保存失败，请重试', 'error');
        }
    }

    function showAutoSaveIndicator() {
        const saveBtn = document.getElementById('save-notes-btn');
        if (saveBtn) {
            saveBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg> 已自动保存';
            setTimeout(() => {
                saveBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24"><path d="M19 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> 保存';
            }, 2000);
        }
    }

    function toggleNotesPreview() {
        const previewBtn = document.getElementById('preview-notes-btn');
        const preview = document.getElementById('notes-preview');
        const textarea = document.getElementById('notes-textarea');
        
        if (preview.classList.contains('active')) {
            preview.classList.remove('active');
            textarea.style.display = 'block';
            previewBtn.textContent = '预览';
        } else {
            preview.classList.add('active');
            textarea.style.display = 'none';
            preview.innerHTML = marked.parse(document.getElementById('notes-textarea').value) || '<p>暂无内容</p>';
            previewBtn.textContent = '编辑';
        }
    }

    async function loadNotes() {
        const notesTextarea = document.getElementById('notes-textarea');
        if (!notesTextarea) return;

        try {
            const unitId = currentUnit || 'default';
            const lessonId = currentLesson || 'default';
            const notes = await DataStore.getNotes(unitId, lessonId);
            
            if (notes && notes.content) {
                notesTextarea.value = notes.content;
            }
        } catch (error) {
            console.error('加载笔记失败:', error);
        }
    }

    // ==================== 设置功能 ====================

    function bindSettingsEvents() {
        // 顶部设置按钮
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', openSettings);
            console.log('设置按钮事件绑定成功');
        } else {
            console.error('设置按钮未找到');
        }

        // 设置弹窗事件
        document.getElementById('settings-close')?.addEventListener('click', closeSettings);
        document.getElementById('settings-overlay')?.addEventListener('click', closeSettings);
        
        // 主题选择事件
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                applyTheme(theme);
            });
        });

        // 重置所有文件按钮
        document.getElementById('reset-all-data-btn')?.addEventListener('click', openConfirmModal);

        // 确认对话框事件
        document.getElementById('confirm-close')?.addEventListener('click', closeConfirmModal);
        document.getElementById('confirm-overlay')?.addEventListener('click', closeConfirmModal);
        document.getElementById('confirm-cancel')?.addEventListener('click', closeConfirmModal);
        document.getElementById('confirm-ok')?.addEventListener('click', confirmResetAllData);

        // 移动端设置按钮
        const mobileSettingsBtn = document.getElementById('mobile-nav-settings');
        if (mobileSettingsBtn) {
            mobileSettingsBtn.addEventListener('click', openSettings);
        }
    }

    function openSettings() {
        console.log('openSettings 被调用');
        const modal = document.getElementById('settings-modal');
        const overlay = document.getElementById('settings-overlay');
        console.log('settings-modal:', modal);
        console.log('settings-overlay:', overlay);
        if (modal && overlay) {
            updateThemeOptions();
            modal.classList.add('show');
            overlay.classList.add('show');
            console.log('设置弹窗已显示');
        } else {
            console.error('设置弹窗元素未找到');
        }
    }

    function closeSettings() {
        document.getElementById('settings-modal').classList.remove('show');
        document.getElementById('settings-overlay').classList.remove('show');
    }

    async function applyTheme(theme) {
        // 移除所有主题类
        document.body.classList.remove('light-theme', 'eye-care-theme');

        // 应用新主题
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else if (theme === 'eye-care') {
            document.body.classList.add('eye-care-theme');
        }

        // 保存主题设置
        await DataStore.saveSetting('theme', theme);

        // 更新UI反馈
        updateThemeOptions();
        showToast(`已切换到${getThemeName(theme)}`);
    }

    function getThemeName(theme) {
        const names = {
            dark: '深色模式',
            light: '浅色模式',
            'eye-care': '护眼模式'
        };
        return names[theme] || theme;
    }

    function updateThemeOptions() {
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' :
                           document.body.classList.contains('eye-care-theme') ? 'eye-care' : 'dark';

        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === currentTheme);
        });
    }

    function openConfirmModal() {
        closeSettings();
        document.getElementById('confirm-modal').classList.add('show');
        document.getElementById('confirm-overlay').classList.add('show');
    }

    function closeConfirmModal() {
        document.getElementById('confirm-modal').classList.remove('show');
        document.getElementById('confirm-overlay').classList.remove('show');
    }

    async function confirmResetAllData() {
        try {
            await DataStore.resetAllData();
            
            // 关闭对话框
            closeConfirmModal();
            
            // 重新加载页面
            showToast('所有数据已重置，页面将重新加载...');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('重置数据失败:', error);
            showToast('重置失败，请重试', 'error');
        }
    }

    async function resetAllData() {
        if (!confirm('确定要初始化所有数据吗？这将清除所有学习进度、笔记和成就！')) {
            return;
        }

        try {
            // 清除所有数据存储
            await DataStore.clear('progress');
            await DataStore.clear('notes');
            await DataStore.clear('projectFiles');
            await DataStore.clear('achievements');
            await DataStore.clear('settings');
            await DataStore.clear('experimentLogs');

            // 重置本地状态
            currentXP = 0;
            completedLessons = 0;

            // 重新加载页面
            window.location.reload();
        } catch (e) {
            console.error('重置数据失败:', e);
            showToast('重置失败，请重试');
        }
    }

    // ==================== 小结测验功能 ====================

    // 章节小测题库（每个单元5道易混淆单选题）
    const UNIT_QUIZZES = {
        1: [
            {
                question: '以下哪个是正确的C++主函数声明？',
                options: [
                    { text: 'void main()', correct: false },
                    { text: 'int main()', correct: true },
                    { text: 'Main()', correct: false },
                    { text: 'function main()', correct: false }
                ],
                explanation: 'C++标准要求main函数必须返回int类型。'
            },
            {
                question: '表达式 7 / 2 的结果是？',
                options: [
                    { text: '3.5', correct: false },
                    { text: '3', correct: true },
                    { text: '4', correct: false },
                    { text: '2', correct: false }
                ],
                explanation: '整数除法会截断小数部分，所以结果是3。'
            },
            {
                question: '以下哪个循环会无限执行？',
                options: [
                    { text: 'for(int i=0; i<10; i++){}', correct: false },
                    { text: 'for(;;){}', correct: true },
                    { text: 'while(false){}', correct: false },
                    { text: 'for(int i=10; i>0; i--){}', correct: false }
                ],
                explanation: 'for(;;)没有条件限制，会无限循环。'
            },
            {
                question: '关于const int* p，以下说法正确的是？',
                options: [
                    { text: 'p不能指向其他地址', correct: false },
                    { text: '不能通过p修改指向的值', correct: true },
                    { text: 'p和指向的值都不能修改', correct: false },
                    { text: 'p可以随意修改', correct: false }
                ],
                explanation: 'const在*左边表示指向常量，不能通过指针修改指向的值。'
            },
            {
                question: '函数参数传递中，哪种方式会创建副本？',
                options: [
                    { text: '引用传递', correct: false },
                    { text: '指针传递', correct: false },
                    { text: '值传递', correct: true },
                    { text: 'const引用传递', correct: false }
                ],
                explanation: '值传递会创建参数的副本，不影响原始变量。'
            }
        ],
        2: [
            {
                question: '数组arr[5]的最大索引是？',
                options: [
                    { text: '5', correct: false },
                    { text: '4', correct: true },
                    { text: '6', correct: false },
                    { text: '0', correct: false }
                ],
                explanation: '数组索引从0开始，所以长度为5的数组最大索引是4。'
            },
            {
                question: 'std::string s = "hello"; s.length()的值是？',
                options: [
                    { text: '5', correct: true },
                    { text: '6', correct: false },
                    { text: '4', correct: false },
                    { text: '7', correct: false }
                ],
                explanation: '字符串长度是字符个数，"hello"有5个字符。'
            },
            {
                question: '结构体定义末尾必须有？',
                options: [
                    { text: '逗号', correct: false },
                    { text: '分号', correct: true },
                    { text: '冒号', correct: false },
                    { text: '句号', correct: false }
                ],
                explanation: 'C++语法要求结构体定义后必须有分号。'
            },
            {
                question: 'enum Color {RED, GREEN, BLUE}; GREEN的值是？',
                options: [
                    { text: '0', correct: false },
                    { text: '1', correct: true },
                    { text: '2', correct: false },
                    { text: '3', correct: false }
                ],
                explanation: '枚举值默认从0开始递增，所以GREEN=1。'
            },
            {
                question: 'auto x = 3.14; x的类型是？',
                options: [
                    { text: 'int', correct: false },
                    { text: 'double', correct: true },
                    { text: 'float', correct: false },
                    { text: 'auto', correct: false }
                ],
                explanation: '编译器根据字面值3.14推断x为double类型。'
            }
        ],
        3: [
            {
                question: 'int* p = &x; 中&x表示？',
                options: [
                    { text: 'x的值', correct: false },
                    { text: 'x的地址', correct: true },
                    { text: '指针p', correct: false },
                    { text: 'p指向的值', correct: false }
                ],
                explanation: '&运算符用于获取变量的内存地址。'
            },
            {
                question: '指针与数组名的关系，正确的是？',
                options: [
                    { text: '数组名就是指向首元素的指针', correct: true },
                    { text: '数组名和指针完全相同', correct: false },
                    { text: '数组名不能用作指针', correct: false },
                    { text: '指针不能访问数组', correct: false }
                ],
                explanation: '数组名在大多数表达式中会退化为指向首元素的指针。'
            },
            {
                question: '引用与指针的区别，错误的是？',
                options: [
                    { text: '引用必须初始化', correct: false },
                    { text: '引用可以重新绑定', correct: true },
                    { text: '指针可以为空', correct: false },
                    { text: '引用是变量的别名', correct: false }
                ],
                explanation: '引用一旦初始化就不能重新绑定到其他变量。'
            },
            {
                question: '释放动态数组应该使用？',
                options: [
                    { text: 'delete arr;', correct: false },
                    { text: 'delete[] arr;', correct: true },
                    { text: 'free(arr);', correct: false },
                    { text: 'delete(arr);', correct: false }
                ],
                explanation: '动态数组必须用delete[]释放，否则会导致内存泄漏。'
            },
            {
                question: 'int* const p; 表示？',
                options: [
                    { text: '指向常量的指针', correct: false },
                    { text: '常量指针', correct: true },
                    { text: '指向常量的常量指针', correct: false },
                    { text: '普通指针', correct: false }
                ],
                explanation: 'const在*右边表示指针本身是常量，不能指向其他地址。'
            }
        ],
        4: [
            {
                question: '函数重载的条件是？',
                options: [
                    { text: '函数名不同', correct: false },
                    { text: '参数列表不同', correct: true },
                    { text: '返回类型不同', correct: false },
                    { text: '函数体不同', correct: false }
                ],
                explanation: '函数重载要求函数名相同但参数列表不同。'
            },
            {
                question: '内联函数的主要作用是？',
                options: [
                    { text: '减少代码量', correct: false },
                    { text: '提高执行效率', correct: true },
                    { text: '增加可读性', correct: false },
                    { text: '节省内存', correct: false }
                ],
                explanation: '内联函数通过在调用处展开来减少函数调用开销。'
            },
            {
                question: 'constexpr函数的特点是？',
                options: [
                    { text: '只能在运行时计算', correct: false },
                    { text: '可以在编译期计算', correct: true },
                    { text: '必须返回void', correct: false },
                    { text: '不能有参数', correct: false }
                ],
                explanation: 'constexpr函数可以在编译期求值。'
            },
            {
                question: '函数指针的作用是？',
                options: [
                    { text: '指向函数的指针', correct: true },
                    { text: '函数返回指针', correct: false },
                    { text: '指针作为函数参数', correct: false },
                    { text: '指向指针的函数', correct: false }
                ],
                explanation: '函数指针是指向函数入口地址的指针。'
            },
            {
                question: '递归函数必须有？',
                options: [
                    { text: '循环', correct: false },
                    { text: '终止条件', correct: true },
                    { text: '返回值', correct: false },
                    { text: '参数', correct: false }
                ],
                explanation: '递归函数必须有终止条件，否则会无限递归。'
            }
        ],
        5: [
            {
                question: '类的构造函数的作用是？',
                options: [
                    { text: '销毁对象', correct: false },
                    { text: '初始化对象', correct: true },
                    { text: '创建类', correct: false },
                    { text: '删除对象', correct: false }
                ],
                explanation: '构造函数在对象创建时被调用，用于初始化对象。'
            },
            {
                question: '析构函数的特点是？',
                options: [
                    { text: '有返回值', correct: false },
                    { text: '可以有参数', correct: false },
                    { text: '名字以~开头', correct: true },
                    { text: '可以重载', correct: false }
                ],
                explanation: '析构函数名字与类名相同但以~开头，没有参数和返回值。'
            },
            {
                question: '拷贝构造函数的参数是？',
                options: [
                    { text: '对象值', correct: false },
                    { text: '对象引用', correct: true },
                    { text: '指针', correct: false },
                    { text: '整数', correct: false }
                ],
                explanation: '拷贝构造函数的参数必须是同类对象的引用。'
            },
            {
                question: '静态成员的特点是？',
                options: [
                    { text: '每个对象独有', correct: false },
                    { text: '所有对象共享', correct: true },
                    { text: '只能是private', correct: false },
                    { text: '不能访问', correct: false }
                ],
                explanation: '静态成员属于类而非对象，所有对象共享。'
            },
            {
                question: '友元函数的作用是？',
                options: [
                    { text: '只能访问public成员', correct: false },
                    { text: '可以访问private成员', correct: true },
                    { text: '不能访问类成员', correct: false },
                    { text: '必须是类的成员', correct: false }
                ],
                explanation: '友元函数可以访问类的private和protected成员。'
            }
        ],
        6: [
            {
                question: '继承的语法是？',
                options: [
                    { text: 'class Derived : Base', correct: false },
                    { text: 'class Derived : public Base', correct: true },
                    { text: 'class Derived = Base', correct: false },
                    { text: 'class Derived -> Base', correct: false }
                ],
                explanation: '继承使用冒号加访问控制符。'
            },
            {
                question: '虚函数的作用是？',
                options: [
                    { text: '实现函数重载', correct: false },
                    { text: '实现运行时多态', correct: true },
                    { text: '提高效率', correct: false },
                    { text: '减少代码量', correct: false }
                ],
                explanation: '虚函数通过虚函数表实现运行时多态。'
            },
            {
                question: '纯虚函数的特点是？',
                options: [
                    { text: '必须有实现', correct: false },
                    { text: '声明为virtual = 0', correct: true },
                    { text: '不能被继承', correct: false },
                    { text: '只能在基类', correct: false }
                ],
                explanation: '纯虚函数没有实现，声明为virtual返回类型 函数名() = 0;'
            },
            {
                question: '抽象类的特点是？',
                options: [
                    { text: '可以实例化', correct: false },
                    { text: '包含纯虚函数', correct: true },
                    { text: '不能被继承', correct: false },
                    { text: '只能有private成员', correct: false }
                ],
                explanation: '包含纯虚函数的类是抽象类，不能实例化。'
            },
            {
                question: '虚析构函数的作用是？',
                options: [
                    { text: '加快析构速度', correct: false },
                    { text: '确保正确释放派生类资源', correct: true },
                    { text: '减少内存使用', correct: false },
                    { text: '增加代码可读性', correct: false }
                ],
                explanation: '虚析构函数确保通过基类指针删除派生类对象时正确调用析构函数链。'
            }
        ],
        7: [
            {
                question: '运算符重载的语法是？',
                options: [
                    { text: 'operator+(参数)', correct: true },
                    { text: '+(参数)', correct: false },
                    { text: 'operator+(int a)', correct: false },
                    { text: 'function+(参数)', correct: false }
                ],
                explanation: '运算符重载使用operator关键字加运算符符号。'
            },
            {
                question: '重载<<运算符通常作为？',
                options: [
                    { text: '类成员函数', correct: false },
                    { text: '友元函数', correct: true },
                    { text: '静态函数', correct: false },
                    { text: '虚函数', correct: false }
                ],
                explanation: '重载<<用于流输出时通常作为友元函数。'
            },
            {
                question: 'explicit关键字的作用是？',
                options: [
                    { text: '加快编译', correct: false },
                    { text: '禁止隐式类型转换', correct: true },
                    { text: '增加代码可读性', correct: false },
                    { text: '减少内存使用', correct: false }
                ],
                explanation: 'explicit关键字禁止构造函数的隐式类型转换。'
            },
            {
                question: '异常处理的语法是？',
                options: [
                    { text: 'try{...}catch{...}', correct: false },
                    { text: 'try{...}catch(类型){...}', correct: true },
                    { text: 'try{...}catch(){...}', correct: false },
                    { text: 'try{...}catch error{...}', correct: false }
                ],
                explanation: '异常处理使用try块和带类型的catch块。'
            },
            {
                question: 'throw语句的作用是？',
                options: [
                    { text: '捕获异常', correct: false },
                    { text: '抛出异常', correct: true },
                    { text: '处理异常', correct: false },
                    { text: '忽略异常', correct: false }
                ],
                explanation: 'throw用于抛出异常对象。'
            }
        ],
        8: [
            {
                question: '函数模板的语法是？',
                options: [
                    { text: 'template<class T> 返回类型 函数名', correct: true },
                    { text: 'template T 返回类型 函数名', correct: false },
                    { text: 'template(T) 返回类型 函数名', correct: false },
                    { text: 'template<T> 返回类型 函数名', correct: false }
                ],
                explanation: '函数模板使用template<class T>声明。'
            },
            {
                question: '类模板的实例化是？',
                options: [
                    { text: '自动进行', correct: false },
                    { text: '需要显式指定类型', correct: true },
                    { text: '不需要类型', correct: false },
                    { text: '由编译器随机选择', correct: false }
                ],
                explanation: '类模板需要显式指定类型参数进行实例化。'
            },
            {
                question: '模板特化的作用是？',
                options: [
                    { text: '增加代码量', correct: false },
                    { text: '为特定类型提供特殊实现', correct: true },
                    { text: '减少模板使用', correct: false },
                    { text: '提高编译速度', correct: false }
                ],
                explanation: '模板特化允许为特定类型提供专门的实现。'
            },
            {
                question: '可变参数模板使用？',
                options: [
                    { text: '...语法', correct: true },
                    { text: '*语法', correct: false },
                    { text: '#语法', correct: false },
                    { text: '@语法', correct: false }
                ],
                explanation: '可变参数模板使用...语法表示任意数量的参数。'
            },
            {
                question: '模板元编程的特点是？',
                options: [
                    { text: '运行时计算', correct: false },
                    { text: '编译期计算', correct: true },
                    { text: '需要大量内存', correct: false },
                    { text: '降低代码可读性', correct: false }
                ],
                explanation: '模板元编程在编译期进行计算。'
            }
        ],
        9: [
            {
                question: 'std::vector的特点是？',
                options: [
                    { text: '固定大小', correct: false },
                    { text: '动态数组', correct: true },
                    { text: '链表结构', correct: false },
                    { text: '栈结构', correct: false }
                ],
                explanation: 'vector是动态数组，支持随机访问。'
            },
            {
                question: 'std::map的特点是？',
                options: [
                    { text: '无序存储', correct: false },
                    { text: '键值对有序存储', correct: true },
                    { text: '只能存储整数', correct: false },
                    { text: '不支持查找', correct: false }
                ],
                explanation: 'map是有序关联容器，按键排序存储键值对。'
            },
            {
                question: '迭代器的作用是？',
                options: [
                    { text: '创建容器', correct: false },
                    { text: '遍历容器元素', correct: true },
                    { text: '删除容器', correct: false },
                    { text: '复制容器', correct: false }
                ],
                explanation: '迭代器提供统一的方式遍历各种容器。'
            },
            {
                question: 'STL算法sort的复杂度是？',
                options: [
                    { text: 'O(n)', correct: false },
                    { text: 'O(n log n)', correct: true },
                    { text: 'O(n²)', correct: false },
                    { text: 'O(log n)', correct: false }
                ],
                explanation: 'sort使用快速排序或归并排序，平均复杂度O(n log n)。'
            },
            {
                question: 'Lambda表达式的语法是？',
                options: [
                    { text: '[捕获](参数){体}', correct: true },
                    { text: 'lambda(参数){体}', correct: false },
                    { text: 'function(参数){体}', correct: false },
                    { text: '{参数}->返回类型{体}', correct: false }
                ],
                explanation: 'Lambda表达式使用方括号捕获外部变量。'
            }
        ],
        10: [
            {
                question: '右值引用的语法是？',
                options: [
                    { text: 'T&', correct: false },
                    { text: 'T&&', correct: true },
                    { text: '&T', correct: false },
                    { text: '&&T', correct: false }
                ],
                explanation: '右值引用使用&&声明。'
            },
            {
                question: '移动语义的作用是？',
                options: [
                    { text: '复制数据', correct: false },
                    { text: '转移资源所有权', correct: true },
                    { text: '增加内存使用', correct: false },
                    { text: '减慢程序速度', correct: false }
                ],
                explanation: '移动语义通过转移资源避免不必要的复制。'
            },
            {
                question: 'std::thread的作用是？',
                options: [
                    { text: '创建线程', correct: true },
                    { text: '删除线程', correct: false },
                    { text: '暂停线程', correct: false },
                    { text: '终止程序', correct: false }
                ],
                explanation: 'std::thread用于创建和管理线程。'
            },
            {
                question: 'std::mutex的作用是？',
                options: [
                    { text: '加速程序', correct: false },
                    { text: '保护共享数据', correct: true },
                    { text: '创建线程', correct: false },
                    { text: '删除数据', correct: false }
                ],
                explanation: 'mutex用于互斥访问共享资源，防止数据竞争。'
            },
            {
                question: '结构化绑定的语法是？',
                options: [
                    { text: 'auto(a, b) = pair', correct: false },
                    { text: 'auto [a, b] = pair', correct: true },
                    { text: 'auto{a, b} = pair', correct: false },
                    { text: 'auto(a = pair.first, b = pair.second)', correct: false }
                ],
                explanation: '结构化绑定使用方括号声明变量。'
            }
        ]
    };

    let selectedQuizUnits = [];

    function bindQuizEvents() {
        // 渲染单元选择器
        renderUnitQuizSelector();

        // 开始测验按钮
        document.getElementById('start-unit-quiz-btn')?.addEventListener('click', startUnitQuiz);
    }

    async function renderUnitQuizSelector() {
        const container = document.getElementById('unit-checkboxes');
        if (!container) return;

        let html = '';

        for (const unit of CourseData.units) {
            const isUnlocked = !(await isUnitLocked(unit.id));
            const quizProgress = await getUnitQuizProgress(unit.id);
            
            html += `
                <div class="unit-checkbox-item ${isUnlocked ? '' : 'disabled'}" data-unit="${unit.id}">
                    <div class="unit-checkbox-check">
                        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div class="unit-checkbox-info">
                        <div class="unit-checkbox-title">单元 ${unit.id}: ${unit.title}</div>
                        <div class="unit-checkbox-progress">测验进度: ${quizProgress}%</div>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;

        // 绑定选择事件
        container.querySelectorAll('.unit-checkbox-item:not(.disabled)').forEach(item => {
            item.addEventListener('click', () => {
                const unitId = parseInt(item.dataset.unit);
                item.classList.toggle('selected');
                
                if (item.classList.contains('selected')) {
                    selectedQuizUnits.push(unitId);
                } else {
                    selectedQuizUnits = selectedQuizUnits.filter(id => id !== unitId);
                }
            });
        });

        // 更新进度摘要
        await updateQuizProgressSummary();
    }

    async function getUnitQuizProgress(unitId) {
        const progress = await DataStore.getSetting(`unitQuiz_${unitId}`, null);
        if (!progress) return 0;
        return Math.round((progress.correct / 5) * 100);
    }

    async function updateQuizProgressSummary() {
        const container = document.getElementById('quiz-progress-summary');
        if (!container) return;

        let unlockedCount = 0;
        for (const unit of CourseData.units) {
            if (!(await isUnitLocked(unit.id))) unlockedCount++;
        }
        const totalUnits = CourseData.units.length;
        
        let completedQuizzes = 0;
        for (const unit of CourseData.units) {
            const progress = await getUnitQuizProgress(unit.id);
            if (progress >= 100) completedQuizzes++;
        }

        container.innerHTML = `
            <div class="quiz-summary-title">测验进度摘要</div>
            <div class="quiz-summary-stats">
                <div class="quiz-summary-item">
                    <span class="quiz-summary-label">已解锁单元</span>
                    <span class="quiz-summary-value">${unlockedCount} / ${totalUnits}</span>
                </div>
                <div class="quiz-summary-item">
                    <span class="quiz-summary-label">已完成测验</span>
                    <span class="quiz-summary-value ${completedQuizzes >= totalUnits ? 'success' : ''}">${completedQuizzes} 个</span>
                </div>
            </div>
        `;
    }

    async function startUnitQuiz() {
        if (selectedQuizUnits.length === 0) {
            showToast('请先选择要测验的单元');
            return;
        }

        // 收集所有选中单元的题目
        const allQuestions = [];
        selectedQuizUnits.forEach(unitId => {
            const quiz = UNIT_QUIZZES[unitId];
            if (quiz) {
                allQuestions.push(...quiz);
            }
        });

        // 在主内容区显示测验
        const contentContainer = document.getElementById('lesson-content');
        contentContainer.innerHTML = '';

        // 渲染测验
        const quizHtml = `
            <div class="concept-card" style="margin-bottom: 24px;">
                <div class="card-header">
                    <div class="card-icon">
                        <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                    </div>
                    <span class="card-title">章节小测</span>
                </div>
                <div style="padding: 16px;">
                    <div id="unit-quiz-container"></div>
                </div>
            </div>
        `;

        contentContainer.innerHTML = quizHtml;

        // 渲染测验题目
        renderQuizQuestions(allQuestions);
    }

    function renderQuizQuestions(questions) {
        const container = document.getElementById('unit-quiz-container');
        if (!container) return;

        let html = `
            <div id="quiz-header" style="margin-bottom: 20px;">
                <span>共 ${questions.length} 道题目</span>
                <button class="btn btn-primary" id="submit-quiz-btn" style="float: right;">提交答案</button>
            </div>
        `;

        questions.forEach((question, index) => {
            html += `
                <div class="quiz-question" data-index="${index}" style="margin-bottom: 20px;">
                    <div class="question-number">问题 ${index + 1}</div>
                    <div class="question-text">${question.question}</div>
                    <div class="question-options" style="margin-top: 12px;">
                        ${question.options.map((opt, optIndex) => `
                            <div class="option-item" data-option="${optIndex}">
                                <div class="option-radio"></div>
                                <div class="option-content">${opt.text}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="quiz-explanation"></div>
                </div>
            `;
        });

        container.innerHTML = html;

        // 绑定选项点击
        container.querySelectorAll('.option-item').forEach(item => {
            item.addEventListener('click', () => {
                const quizQuestion = item.closest('.quiz-question');
                quizQuestion.querySelectorAll('.option-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });

        // 绑定提交按钮
        document.getElementById('submit-quiz-btn')?.addEventListener('click', () => {
            submitUnitQuiz(questions);
        });
    }

    async function submitUnitQuiz(questions) {
        let correctCount = 0;
        const results = [];

        questions.forEach((question, index) => {
            const quizQuestion = document.querySelector(`.quiz-question[data-index="${index}"]`);
            const selectedOption = quizQuestion?.querySelector('.option-item.selected');
            
            if (selectedOption) {
                const selectedIndex = parseInt(selectedOption.dataset.option);
                const isCorrect = question.options[selectedIndex].correct;
                
                if (isCorrect) {
                    correctCount++;
                    selectedOption.classList.add('correct');
                } else {
                    selectedOption.classList.add('incorrect');
                    // 显示正确答案
                    question.options.forEach((opt, optIndex) => {
                        if (opt.correct) {
                            quizQuestion?.querySelector(`.option-item[data-option="${optIndex}"]`).classList.add('correct');
                        }
                    });
                }

                // 显示解析
                const explanation = quizQuestion?.querySelector('.quiz-explanation');
                if (explanation) {
                    explanation.innerHTML = `
                        <div class="explanation-title">解析</div>
                        <div class="explanation-content">${question.explanation}</div>
                    `;
                    explanation.classList.add('show');
                }

                results.push({ correct: isCorrect });
            }
        });

        // 计算分数
        const questionCount = (questions && questions.length > 0) ? questions.length : 1;
        const score = Math.round((correctCount / questionCount) * 100);
        // 每答对1%获得2XP，至少获得基础XP
        const xpEarned = Math.max(10, Math.floor(score * 2));

        // 显示结果
        const container = document.getElementById('unit-quiz-container');
        container.innerHTML += `
            <div id="quiz-result" style="margin-top: 24px; padding: 24px; text-align: center;">
                <div id="quiz-score" class="${score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 60 ? 'pass' : 'fail'}">${score}%</div>
                <div id="quiz-grade">${score >= 90 ? '优秀' : score >= 70 ? '良好' : score >= 60 ? '及格' : '需加强'}</div>
                <div class="quiz-xp-earned">+${xpEarned} XP</div>
                <button class="btn btn-secondary" id="back-to-quiz-btn" style="margin-top: 16px;">返回选择</button>
            </div>
        `;

        // 保存测验结果
        let resultIndex = 0;
        for (const unitId of selectedQuizUnits) {
            const unitQuiz = UNIT_QUIZZES[unitId];
            if (!unitQuiz) continue;
            
            let unitCorrect = 0;
            for (let i = 0; i < unitQuiz.length && resultIndex < results.length; i++) {
                if (results[resultIndex]?.correct) {
                    unitCorrect++;
                }
                resultIndex++;
            }
            
            await DataStore.saveSetting(`unitQuiz_${unitId}`, { 
                correct: unitCorrect, 
                total: unitQuiz.length, 
                timestamp: Date.now(),
                completed: unitCorrect === unitQuiz.length
            });
        }

        // 奖励XP
        await awardXP(xpEarned);

        // 绑定返回按钮
        document.getElementById('back-to-quiz-btn')?.addEventListener('click', () => {
            // 刷新页面或重新加载课程
            window.location.reload();
        });
    }

    // ==================== 导出公开接口 ====================
    return {
        init,
        loadLesson,
        getCurrentLessonId: () => `${currentUnit}_${currentLesson}`,
        getCurrentXP: () => currentXP,
        awardXP,
        openSandbox
    };
})();

// ==================== 启动应用 ====================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// 导出到全局
window.App = App;
