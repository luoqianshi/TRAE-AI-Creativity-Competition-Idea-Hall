// AI批卷助手 - 主应用逻辑

// 全局状态
let currentPage = 'auth-page';
let currentClassId = null;
let currentAssignmentId = null;
let currentStudentId = null;
let selectedImage = null;
let gradingResults = null;
let questionCounter = 0;

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    initNavigation();
    initUpload();
    initGrading();
    initStats();
    checkAuth();
});

// 检查登录状态
function checkAuth() {
    const user = Storage.getCurrentUser();
    if (user) {
        showHomePage();
    } else {
        showPage('auth-page');
    }
}

// 认证初始化
function initAuth() {
    // 切换登录/注册标签
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-form`).classList.add('active');
        });
    });
    
    // 登录表单提交
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const result = Storage.login(username, password);
        if (result.success) {
            showToast('登录成功', 'success');
            showHomePage();
        } else {
            showToast(result.message, 'error');
        }
    });
    
    // 注册表单提交
    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        
        const result = Storage.register(name, username, password);
        if (result.success) {
            showToast('注册成功，请登录', 'success');
            document.querySelector('[data-tab="login"]').click();
            document.getElementById('login-username').value = username;
        } else {
            showToast(result.message, 'error');
        }
    });
    
    // 登出按钮
    document.getElementById('logout-btn').addEventListener('click', () => {
        Storage.logout();
        showToast('已退出登录');
        showPage('auth-page');
    });
}

// 导航初始化
function initNavigation() {
    // 初始化班级相关事件
    document.getElementById('create-class-form').addEventListener('submit', handleCreateClass);
    document.getElementById('edit-class-form').addEventListener('submit', handleEditClass);
    document.getElementById('add-student-form').addEventListener('submit', handleAddStudent);
    
    // 初始化作业相关事件
    document.getElementById('create-assignment-form').addEventListener('submit', handleCreateAssignment);
}

// 显示首页
function showHomePage() {
    const user = Storage.getCurrentUser();
    if (!user) return;
    
    document.getElementById('user-name').textContent = user.name;
    showPage('home-page');
    updateHomeStats();
    updateClassOverview();
    updatePendingTasks();
}

// 更新首页统计
function updateHomeStats() {
    const stats = Storage.getClassStats();
    document.getElementById('stat-classes').textContent = stats.classes;
    document.getElementById('stat-students').textContent = stats.students;
    document.getElementById('stat-assignments').textContent = stats.assignments;
    document.getElementById('stat-graded').textContent = stats.graded;
}

// 更新班级概览
function updateClassOverview() {
    const classes = Storage.getClasses();
    const container = document.getElementById('class-overview');
    
    if (classes.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-center py-4">暂无班级</div>';
        return;
    }
    
    container.innerHTML = classes.slice(0, 3).map(c => `
        <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
                <div class="font-medium text-gray-800">${c.name}</div>
                <div class="text-sm text-gray-500">${c.grade}</div>
            </div>
            <div class="text-blue-500 font-medium">${c.students?.length || 0}人</div>
        </div>
    `).join('');
}

// 更新待批改任务
function updatePendingTasks() {
    const assignments = Storage.getAssignments();
    const container = document.getElementById('pending-tasks');
    
    if (assignments.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-center py-4">暂无待批改任务</div>';
        return;
    }
    
    // 显示最近的任务
    container.innerHTML = assignments.slice(0, 3).map(a => {
        const classData = Storage.getClasses().find(c => c.id === a.classId);
        const grades = Storage.getGrades(a.id);
        const pending = (classData?.students?.length || 0) - grades.length;
        return `
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                    <div class="font-medium text-gray-800">${a.title}</div>
                    <div class="text-sm text-gray-500">${classData?.name || '未知班级'}</div>
                </div>
                <div class="text-orange-500 font-medium">${pending}份待批</div>
            </div>
        `;
    }).join('');
}

// 页面导航
function navigateTo(pageId) {
    showPage(pageId);
    
    if (pageId === 'class-page') {
        renderClassList();
    } else if (pageId === 'class-detail-page') {
        renderStudentList();
    } else if (pageId === 'assignment-page') {
        renderAssignmentList();
    } else if (pageId === 'grading-page') {
        initGradingPage();
    } else if (pageId === 'stats-page') {
        initStatsPage();
    }
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId)?.classList.add('active');
    currentPage = pageId;
}

// 班级管理
function renderClassList() {
    const classes = Storage.getClasses();
    const container = document.getElementById('class-list');
    
    if (classes.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-center py-8 col-span-full">暂无班级，点击上方按钮创建</div>';
        return;
    }
    
    container.innerHTML = classes.map(c => `
        <div class="class-card" onclick="showClassDetail('${c.id}')">
            <div class="class-name">${c.name}</div>
            <div class="class-grade">${c.grade}</div>
            <div class="class-count">${c.students?.length || 0} 名学生</div>
        </div>
    `).join('');
}

function showCreateClassModal() {
    document.getElementById('class-name').value = '';
    document.getElementById('class-grade').value = '初一';
    document.getElementById('create-class-modal').classList.add('active');
}

function handleCreateClass(e) {
    e.preventDefault();
    const name = document.getElementById('class-name').value;
    const grade = document.getElementById('class-grade').value;
    
    Storage.createClass(name, grade);
    closeModal('create-class-modal');
    showToast('班级创建成功', 'success');
    renderClassList();
    updateHomeStats();
}

function showEditClassModal() {
    if (!currentClassId) return;
    const classes = Storage.getClasses();
    const classData = classes.find(c => c.id === currentClassId);
    if (!classData) return;
    
    document.getElementById('edit-class-id').value = classData.id;
    document.getElementById('edit-class-name').value = classData.name;
    document.getElementById('edit-class-grade').value = classData.grade;
    document.getElementById('edit-class-modal').classList.add('active');
}

function handleEditClass(e) {
    e.preventDefault();
    const id = document.getElementById('edit-class-id').value;
    const name = document.getElementById('edit-class-name').value;
    const grade = document.getElementById('edit-class-grade').value;
    
    Storage.updateClass(id, name, grade);
    closeModal('edit-class-modal');
    showToast('班级信息已更新', 'success');
    renderClassList();
    document.getElementById('class-detail-title').textContent = name;
}

function deleteClass() {
    showConfirm('确定要删除这个班级吗？学生数据也将被删除。', () => {
        Storage.deleteClass(currentClassId);
        closeModal('edit-class-modal');
        closeModal('confirm-modal');
        showToast('班级已删除', 'success');
        navigateTo('class-page');
        updateHomeStats();
    });
}

function showClassDetail(classId) {
    currentClassId = classId;
    const classes = Storage.getClasses();
    const classData = classes.find(c => c.id === classId);
    if (!classData) return;
    
    document.getElementById('class-detail-title').textContent = classData.name;
    showPage('class-detail-page');
    renderStudentList();
}

function renderStudentList() {
    if (!currentClassId) return;
    const students = Storage.getStudents(currentClassId);
    const container = document.getElementById('student-list');
    
    if (students.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-center py-8">暂无学生</div>';
        return;
    }
    
    container.innerHTML = students.map(s => `
        <div class="student-item">
            <span class="student-name">${s.name}</span>
            <div class="student-actions">
                <button onclick="editStudent('${s.id}')" class="text-blue-500 hover:text-blue-600 text-sm">编辑</button>
                <button onclick="deleteStudent('${s.id}')" class="text-red-500 hover:text-red-600 text-sm">删除</button>
            </div>
        </div>
    `).join('');
}

function showAddStudentModal() {
    document.getElementById('student-name').value = '';
    document.getElementById('add-student-modal').classList.add('active');
}

function handleAddStudent(e) {
    e.preventDefault();
    const name = document.getElementById('student-name').value;
    
    Storage.addStudent(currentClassId, name);
    closeModal('add-student-modal');
    showToast('学生添加成功', 'success');
    renderStudentList();
    updateHomeStats();
}

function editStudent(studentId) {
    const students = Storage.getStudents(currentClassId);
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const newName = prompt('请输入新的学生姓名:', student.name);
    if (newName && newName !== student.name) {
        Storage.updateStudent(currentClassId, studentId, newName);
        showToast('学生信息已更新', 'success');
        renderStudentList();
    }
}

function deleteStudent(studentId) {
    showConfirm('确定要删除这个学生吗？', () => {
        Storage.deleteStudent(currentClassId, studentId);
        closeModal('confirm-modal');
        showToast('学生已删除', 'success');
        renderStudentList();
        updateHomeStats();
    });
}

// 作业管理
function renderAssignmentList() {
    const assignments = Storage.getAssignments();
    const classes = Storage.getClasses();
    const container = document.getElementById('assignment-list');
    
    if (assignments.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-center py-8">暂无作业，点击上方按钮创建</div>';
        return;
    }
    
    container.innerHTML = assignments.map(a => {
        const classData = classes.find(c => c.id === a.classId);
        const grades = Storage.getGrades(a.id);
        const totalStudents = classData?.students?.length || 0;
        return `
            <div class="assignment-card">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="assignment-title">${a.title}</div>
                        <div class="assignment-meta">${classData?.name || '未知班级'} · ${a.totalScore}分 · ${a.questions.length}题</div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-gray-500">已批 ${grades.length}/${totalStudents}</div>
                        <div class="flex gap-2 mt-2">
                            <button onclick="startGradingFromAssignment('${a.id}')" class="text-blue-500 hover:text-blue-600 text-sm">批改</button>
                            <button onclick="deleteAssignment('${a.id}')" class="text-red-500 hover:text-red-600 text-sm">删除</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function showCreateAssignmentModal() {
    const classes = Storage.getClasses();
    if (classes.length === 0) {
        showToast('请先创建班级', 'error');
        return;
    }
    
    // 重置表单
    document.getElementById('assignment-title').value = '';
    document.getElementById('assignment-class').innerHTML = '<option value="">请选择班级</option>' +
        classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    document.getElementById('questions-container').innerHTML = '';
    questionCounter = 0;
    
    // 添加第一个题目
    addQuestion();
    
    document.getElementById('create-assignment-modal').classList.add('active');
}

function addQuestion() {
    questionCounter++;
    const container = document.getElementById('questions-container');
    const questionHtml = `
        <div class="question-card" id="question-${questionCounter}">
            <div class="question-header">
                <span class="question-number">第 ${questionCounter} 题</span>
                <button type="button" onclick="removeQuestion(${questionCounter})" class="question-remove">删除</button>
            </div>
            <div class="form-group">
                <label class="form-label">题型</label>
                <select class="form-input question-type" onchange="toggleQuestionOptions(${questionCounter})">
                    <option value="choice">选择题</option>
                    <option value="blank">填空题</option>
                    <option value="subjective">主观题</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">题目内容</label>
                <input type="text" class="form-input question-content" placeholder="请输入题目内容">
            </div>
            <div class="form-group question-options">
                <label class="form-label">选项（选择题填写）</label>
                <div class="grid grid-cols-2 gap-2">
                    <input type="text" class="form-input" placeholder="A选项" data-option="A">
                    <input type="text" class="form-input" placeholder="B选项" data-option="B">
                    <input type="text" class="form-input" placeholder="C选项" data-option="C">
                    <input type="text" class="form-input" placeholder="D选项" data-option="D">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">正确答案</label>
                <input type="text" class="form-input question-answer" placeholder="选择题填A/B/C/D，填空题填关键词">
            </div>
            <div class="form-group">
                <label class="form-label">分值</label>
                <input type="number" class="form-input question-score" value="5" min="1">
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', questionHtml);
}

function removeQuestion(id) {
    const questionEl = document.getElementById(`question-${id}`);
    if (questionEl) {
        questionEl.remove();
    }
}

function toggleQuestionOptions(id) {
    const card = document.getElementById(`question-${id}`);
    if (!card) return;
    const type = card.querySelector('.question-type').value;
    const optionsDiv = card.querySelector('.question-options');
    if (optionsDiv) {
        optionsDiv.style.display = type === 'choice' ? 'block' : 'none';
    }
}

function handleCreateAssignment(e) {
    e.preventDefault();
    
    const title = document.getElementById('assignment-title').value;
    const classId = document.getElementById('assignment-class').value;
    
    // 收集题目信息
    const questionCards = document.querySelectorAll('.question-card');
    const questions = [];
    let totalScore = 0;
    
    questionCards.forEach((card, index) => {
        const type = card.querySelector('.question-type').value;
        const content = card.querySelector('.question-content').value;
        const answer = card.querySelector('.question-answer').value;
        const score = parseInt(card.querySelector('.question-score').value) || 5;
        
        if (!content) return;
        
        const question = {
            id: `q${index + 1}`,
            type,
            content,
            score,
            answer: type === 'choice' ? answer.toUpperCase() : answer
        };
        
        if (type === 'choice') {
            question.options = {};
            card.querySelectorAll('[data-option]').forEach(input => {
                question.options[input.dataset.option] = input.value;
            });
        }
        
        questions.push(question);
        totalScore += score;
    });
    
    if (questions.length === 0) {
        showToast('请至少添加一道题目', 'error');
        return;
    }
    
    Storage.createAssignment(title, classId, questions, totalScore);
    closeModal('create-assignment-modal');
    showToast('作业创建成功', 'success');
    renderAssignmentList();
    updateHomeStats();
}

function deleteAssignment(assignmentId) {
    showConfirm('确定要删除这个作业吗？', () => {
        Storage.deleteAssignment(assignmentId);
        closeModal('confirm-modal');
        showToast('作业已删除', 'success');
        renderAssignmentList();
        updateHomeStats();
    });
}

function startGradingFromAssignment(assignmentId) {
    currentAssignmentId = assignmentId;
    navigateTo('grading-page');
}

// 批改功能
function initGrading() {
    document.getElementById('start-ocr-btn').addEventListener('click', startOCRProcess);
    document.getElementById('save-grade-btn').addEventListener('click', saveGrade);
    document.getElementById('clear-image-btn').addEventListener('click', clearImage);
}

function initGradingPage() {
    const assignments = Storage.getAssignments();
    const assignmentSelect = document.getElementById('grading-assignment-select');
    assignmentSelect.innerHTML = '<option value="">请选择作业</option>' +
        assignments.map(a => `<option value="${a.id}">${a.title}</option>`).join('');
    
    // 监听作业选择变化
    assignmentSelect.onchange = () => {
        const assignmentId = assignmentSelect.value;
        if (!assignmentId) return;
        
        const assignment = assignments.find(a => a.id === assignmentId);
        if (!assignment) return;
        
        const classData = Storage.getClasses().find(c => c.id === assignment.classId);
        if (!classData) return;
        
        const studentSelect = document.getElementById('grading-student-select');
        studentSelect.innerHTML = '<option value="">请选择学生</option>' +
            classData.students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    };
    
    // 清空图片
    clearImage();
}

function initUpload() {
    const uploadArea = document.getElementById('upload-area');
    const imageInput = document.getElementById('image-input');
    const fileInput = document.getElementById('file-input');
    const cameraBtn = document.getElementById('camera-btn');
    
    // 点击上传区域
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 文件选择
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFileSelect(file);
    });
    
    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileSelect(file);
        }
    });
    
    // 相机按钮
    cameraBtn.addEventListener('click', () => {
        imageInput.click();
    });
    
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFileSelect(file);
    });
}

function handleFileSelect(file) {
    selectedImage = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('preview-img').src = e.target.result;
        document.getElementById('upload-placeholder').classList.add('hidden');
        document.getElementById('image-preview').classList.remove('hidden');
        document.getElementById('start-ocr-btn').disabled = false;
    };
    reader.readAsDataURL(file);
}

function clearImage() {
    selectedImage = null;
    document.getElementById('preview-img').src = '';
    document.getElementById('upload-placeholder').classList.remove('hidden');
    document.getElementById('image-preview').classList.add('hidden');
    document.getElementById('start-ocr-btn').disabled = true;
    
    // 重置OCR状态
    document.getElementById('ocr-status').classList.remove('hidden');
    document.getElementById('ocr-status').textContent = '请先上传图片';
    document.getElementById('ocr-progress').classList.add('hidden');
    document.getElementById('ocr-result').classList.add('hidden');
    document.getElementById('grading-status').textContent = '请先完成OCR识别';
    document.getElementById('grading-status').classList.remove('hidden');
    document.getElementById('grading-result').classList.add('hidden');
}

async function startOCRProcess() {
    if (!selectedImage) {
        showToast('请先上传图片', 'error');
        return;
    }
    
    const assignmentId = document.getElementById('grading-assignment-select').value;
    const studentId = document.getElementById('grading-student-select').value;
    
    if (!assignmentId) {
        showToast('请选择作业', 'error');
        return;
    }
    
    if (!studentId) {
        showToast('请选择学生', 'error');
        return;
    }
    
    currentAssignmentId = assignmentId;
    currentStudentId = studentId;
    
    // 显示进度
    document.getElementById('ocr-status').classList.add('hidden');
    document.getElementById('ocr-progress').classList.remove('hidden');
    document.getElementById('ocr-result').classList.add('hidden');
    
    try {
        // OCR识别
        const ocrResult = await OCR.recognizeImage(selectedImage);
        
        if (ocrResult.success) {
            // 显示识别结果
            document.getElementById('ocr-progress').classList.add('hidden');
            document.getElementById('ocr-result').classList.remove('hidden');
            document.getElementById('ocr-text').textContent = ocrResult.text;
            
            // 执行批改
            performGrading(ocrResult.text);
        } else {
            throw new Error(ocrResult.message);
        }
    } catch (error) {
        document.getElementById('ocr-progress').classList.add('hidden');
        document.getElementById('ocr-status').classList.remove('hidden');
        document.getElementById('ocr-status').textContent = '识别失败: ' + error.message;
        showToast('OCR识别失败', 'error');
    }
}

function performGrading(ocrText) {
    const assignment = Storage.getAssignments().find(a => a.id === currentAssignmentId);
    if (!assignment) {
        showToast('未找到作业信息', 'error');
        return;
    }
    
    // 执行批改
    gradingResults = Grading.extractAnswers(ocrText, assignment.questions);
    const report = Grading.generateReport(gradingResults);
    
    // 显示批改结果
    document.getElementById('grading-status').classList.add('hidden');
    document.getElementById('grading-result').classList.remove('hidden');
    
    const container = document.getElementById('grading-questions');
    container.innerHTML = gradingResults.map((r, index) => `
        <div class="grade-item ${r.status === 'correct' ? 'grade-correct' : r.status === 'wrong' ? 'grade-wrong' : r.status === 'partial' ? 'grade-partial' : ''}">
            <div class="flex justify-between items-start mb-2">
                <div class="font-medium">第${index + 1}题 ${r.type === 'choice' ? '选择题' : r.type === 'blank' ? '填空题' : '主观题'}</div>
                <div class="text-sm">
                    <span class="${r.status === 'correct' ? 'text-green-600' : r.status === 'wrong' ? 'text-red-600' : 'text-orange-500'}">${r.score}/${r.maxScore}分</span>
                    ${r.status === 'manual' ? '<span class="text-blue-500 ml-2">[待手动批改]</span>' : ''}
                </div>
            </div>
            <div class="text-sm text-gray-600 mb-1">题目: ${r.content.substring(0, 50)}${r.content.length > 50 ? '...' : ''}</div>
            <div class="text-sm text-gray-600">
                正确答案: <span class="font-medium">${r.correctAnswer}</span>
                ${r.detectedAnswer ? ` | 识别答案: <span class="font-medium">${r.detectedAnswer}</span>` : ''}
            </div>
            ${r.status === 'manual' ? `
                <div class="mt-2">
                    <label class="text-sm text-gray-500">手动评分:</label>
                    <input type="number" class="form-input mt-1" value="0" min="0" max="${r.maxScore}" 
                           onchange="updateManualScore(${index}, this.value)">
                </div>
            ` : ''}
        </div>
    `).join('');
    
    document.getElementById('grading-total-score').textContent = report.totalScore;
}

function updateManualScore(index, value) {
    if (gradingResults && gradingResults[index]) {
        gradingResults[index].score = parseInt(value) || 0;
        gradingResults[index].finalScore = parseInt(value) || 0;
        updateTotalScore();
    }
}

function updateTotalScore() {
    if (!gradingResults) return;
    const total = Grading.calculateTotalScore(gradingResults);
    document.getElementById('grading-total-score').textContent = total;
}

function saveGrade() {
    if (!gradingResults || !currentAssignmentId || !currentStudentId) {
        showToast('数据不完整，无法保存', 'error');
        return;
    }
    
    const scores = {};
    gradingResults.forEach(r => {
        scores[r.questionId] = {
            autoScore: r.score,
            finalScore: r.finalScore !== undefined ? r.finalScore : r.score
        };
    });
    
    const totalScore = Grading.calculateTotalScore(gradingResults);
    Storage.saveGrade(currentAssignmentId, currentStudentId, scores, totalScore);
    
    showToast('成绩保存成功', 'success');
    updateHomeStats();
    
    // 清空并准备下一次批改
    clearImage();
    document.getElementById('grading-student-select').value = '';
    currentStudentId = null;
}

// 统计页面
function initStats() {
    document.getElementById('export-btn').addEventListener('click', exportGrades);
}

function initStatsPage() {
    const classes = Storage.getClasses();
    const assignments = Storage.getAssignments();
    
    // 填充班级选择
    const classSelect = document.getElementById('stats-class-select');
    classSelect.innerHTML = '<option value="">选择班级</option>' +
        classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    classSelect.onchange = () => {
        const classId = classSelect.value;
        const assignmentSelect = document.getElementById('stats-assignment-select');
        
        if (!classId) {
            assignmentSelect.innerHTML = '<option value="">选择作业</option>';
            return;
        }
        
        const classAssignments = assignments.filter(a => a.classId === classId);
        assignmentSelect.innerHTML = '<option value="">选择作业</option>' +
            classAssignments.map(a => `<option value="${a.id}">${a.title}</option>`).join('');
    };
    
    // 作业选择变化时更新统计
    document.getElementById('stats-assignment-select').onchange = updateStatsDisplay;
}

function updateStatsDisplay() {
    const classId = document.getElementById('stats-class-select').value;
    const assignmentId = document.getElementById('stats-assignment-select').value;
    
    if (!classId || !assignmentId) return;
    
    const assignment = Storage.getAssignments().find(a => a.id === assignmentId);
    const classData = Storage.getClasses().find(c => c.id === classId);
    const grades = Storage.getGrades(assignmentId);
    
    if (!assignment || !classData) return;
    
    // 更新成绩列表
    const gradeList = document.getElementById('grade-list');
    if (grades.length === 0) {
        gradeList.innerHTML = '<div class="text-gray-500 text-center py-8">暂无成绩数据</div>';
    } else {
        gradeList.innerHTML = grades.map(g => {
            const student = classData.students.find(s => s.id === g.studentId);
            return `
                <div class="flex justify-between items-center p-3 hover:bg-gray-50">
                    <span class="font-medium">${student?.name || '未知学生'}</span>
                    <span class="text-blue-500 font-bold">${g.totalScore}分</span>
                </div>
            `;
        }).join('');
    }
    
    // 更新分数分布图
    const distribution = Grading.calculateScoreDistribution(grades, assignment.totalScore);
    const maxCount = Math.max(...distribution.map(d => d.count), 1);
    const scoreChart = document.getElementById('score-chart');
    scoreChart.innerHTML = distribution.map(d => `
        <div class="flex flex-col items-center flex-1">
            <div class="w-full bg-gray-100 rounded-t relative" style="height: 120px; display: flex; align-items: flex-end;">
                <div class="score-bar w-full" style="height: ${(d.count / maxCount) * 100}%"></div>
            </div>
            <div class="text-sm font-medium mt-1">${d.count}</div>
        </div>
    `).join('');
    
    // 更新错题统计
    const errorStats = Grading.calculateErrorStats(assignment, grades);
    const errorContainer = document.getElementById('error-stats');
    
    if (errorStats.length === 0) {
        errorContainer.innerHTML = '<div class="text-gray-500 text-center py-4">暂无错题数据</div>';
    } else {
        errorContainer.innerHTML = errorStats.slice(0, 5).map(e => `
            <div class="error-item">
                <span class="error-question">第${e.questionNumber}题: ${e.content}</span>
                <span class="error-count">${e.errorCount}人错</span>
            </div>
        `).join('');
    }
}

function exportGrades() {
    const classId = document.getElementById('stats-class-select').value;
    const assignmentId = document.getElementById('stats-assignment-select').value;
    
    if (!classId || !assignmentId) {
        showToast('请先选择班级和作业', 'error');
        return;
    }
    
    const assignment = Storage.getAssignments().find(a => a.id === assignmentId);
    const classData = Storage.getClasses().find(c => c.id === classId);
    const grades = Storage.getGrades(assignmentId);
    
    if (!assignment || !classData) return;
    
    const csv = Grading.exportToCSV(assignment, grades, classData.students);
    
    // 创建下载
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${classData.name}_${assignment.title}_成绩单.csv`;
    link.click();
    
    showToast('成绩单导出成功', 'success');
}

// 模态框和提示
function closeModal(modalId) {
    document.getElementById(modalId)?.classList.remove('active');
}

function showConfirm(message, onConfirm) {
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-btn').onclick = onConfirm;
    document.getElementById('confirm-modal').classList.add('active');
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 导出导航函数
window.navigateTo = navigateTo;
window.showCreateClassModal = showCreateClassModal;
window.showEditClassModal = showEditClassModal;
window.showClassDetail = showClassDetail;
window.showAddStudentModal = showAddStudentModal;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.addQuestion = addQuestion;
window.removeQuestion = removeQuestion;
window.toggleQuestionOptions = toggleQuestionOptions;
window.startGradingFromAssignment = startGradingFromAssignment;
window.updateManualScore = updateManualScore;
