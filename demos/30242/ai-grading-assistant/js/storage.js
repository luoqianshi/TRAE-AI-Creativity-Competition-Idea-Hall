// 存储模块 - LocalStorage数据管理
const Storage = {
    // 生成UUID
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // 获取用户数据
    getUsers() {
        const data = localStorage.getItem('ai_grading_users');
        return data ? JSON.parse(data) : [];
    },

    // 保存用户数据
    saveUsers(users) {
        localStorage.setItem('ai_grading_users', JSON.stringify(users));
    },

    // 获取当前用户
    getCurrentUser() {
        const userId = localStorage.getItem('ai_grading_current_user');
        if (!userId) return null;
        const users = this.getUsers();
        return users.find(u => u.id === userId) || null;
    },

    // 用户注册
    register(name, username, password) {
        const users = this.getUsers();
        if (users.find(u => u.username === username)) {
            return { success: false, message: '用户名已存在' };
        }
        const user = {
            id: this.generateId(),
            name,
            username,
            password, // 实际项目中应加密
            createdAt: new Date().toISOString()
        };
        users.push(user);
        this.saveUsers(users);
        return { success: true, user };
    },

    // 用户登录
    login(username, password) {
        const users = this.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
            return { success: false, message: '用户名或密码错误' };
        }
        localStorage.setItem('ai_grading_current_user', user.id);
        return { success: true, user };
    },

    // 用户登出
    logout() {
        localStorage.removeItem('ai_grading_current_user');
    },

    // 获取当前用户的班级
    getClasses() {
        const user = this.getCurrentUser();
        if (!user) return [];
        const data = localStorage.getItem(`ai_grading_classes_${user.id}`);
        return data ? JSON.parse(data) : [];
    },

    // 保存班级数据
    saveClasses(classes) {
        const user = this.getCurrentUser();
        if (!user) return;
        localStorage.setItem(`ai_grading_classes_${user.id}`, JSON.stringify(classes));
    },

    // 创建班级
    createClass(name, grade) {
        const user = this.getCurrentUser();
        if (!user) return null;
        const classes = this.getClasses();
        const newClass = {
            id: this.generateId(),
            userId: user.id,
            name,
            grade,
            students: [],
            createdAt: new Date().toISOString()
        };
        classes.push(newClass);
        this.saveClasses(classes);
        return newClass;
    },

    // 更新班级
    updateClass(classId, name, grade) {
        const classes = this.getClasses();
        const index = classes.findIndex(c => c.id === classId);
        if (index === -1) return null;
        classes[index] = { ...classes[index], name, grade };
        this.saveClasses(classes);
        return classes[index];
    },

    // 删除班级
    deleteClass(classId) {
        let classes = this.getClasses();
        classes = classes.filter(c => c.id !== classId);
        this.saveClasses(classes);
        // 同时删除班级下的成绩数据
        const user = this.getCurrentUser();
        if (user) {
            localStorage.removeItem(`ai_grading_grades_${user.id}_${classId}`);
        }
    },

    // 获取班级下的学生
    getStudents(classId) {
        const classes = this.getClasses();
        const classData = classes.find(c => c.id === classId);
        if (!classData) return [];
        return classData.students || [];
    },

    // 添加学生
    addStudent(classId, name) {
        const classes = this.getClasses();
        const index = classes.findIndex(c => c.id === classId);
        if (index === -1) return null;
        const student = {
            id: this.generateId(),
            name,
            classId,
            createdAt: new Date().toISOString()
        };
        classes[index].students.push(student);
        this.saveClasses(classes);
        return student;
    },

    // 更新学生
    updateStudent(classId, studentId, name) {
        const classes = this.getClasses();
        const classIndex = classes.findIndex(c => c.id === classId);
        if (classIndex === -1) return null;
        const studentIndex = classes[classIndex].students.findIndex(s => s.id === studentId);
        if (studentIndex === -1) return null;
        classes[classIndex].students[studentIndex].name = name;
        this.saveClasses(classes);
        return classes[classIndex].students[studentIndex];
    },

    // 删除学生
    deleteStudent(classId, studentId) {
        const classes = this.getClasses();
        const classIndex = classes.findIndex(c => c.id === classId);
        if (classIndex === -1) return;
        classes[classIndex].students = classes[classIndex].students.filter(s => s.id !== studentId);
        this.saveClasses(classes);
    },

    // 获取作业列表
    getAssignments() {
        const user = this.getCurrentUser();
        if (!user) return [];
        const data = localStorage.getItem(`ai_grading_assignments_${user.id}`);
        return data ? JSON.parse(data) : [];
    },

    // 保存作业列表
    saveAssignments(assignments) {
        const user = this.getCurrentUser();
        if (!user) return;
        localStorage.setItem(`ai_grading_assignments_${user.id}`, JSON.stringify(assignments));
    },

    // 创建作业
    createAssignment(title, classId, questions, totalScore) {
        const user = this.getCurrentUser();
        if (!user) return null;
        const assignments = this.getAssignments();
        const assignment = {
            id: this.generateId(),
            userId: user.id,
            classId,
            title,
            questions,
            totalScore,
            createdAt: new Date().toISOString()
        };
        assignments.push(assignment);
        this.saveAssignments(assignments);
        return assignment;
    },

    // 删除作业
    deleteAssignment(assignmentId) {
        let assignments = this.getAssignments();
        assignments = assignments.filter(a => a.id !== assignmentId);
        this.saveAssignments(assignments);
    },

    // 获取成绩数据
    getGrades(assignmentId) {
        const user = this.getCurrentUser();
        if (!user) return [];
        const data = localStorage.getItem(`ai_grading_grades_${user.id}_${assignmentId}`);
        return data ? JSON.parse(data) : [];
    },

    // 保存成绩数据
    saveGrades(assignmentId, grades) {
        const user = this.getCurrentUser();
        if (!user) return;
        localStorage.setItem(`ai_grading_grades_${user.id}_${assignmentId}`, JSON.stringify(grades));
    },

    // 保存单个成绩
    saveGrade(assignmentId, studentId, scores, totalScore) {
        let grades = this.getGrades(assignmentId);
        const existingIndex = grades.findIndex(g => g.studentId === studentId);
        const grade = {
            id: existingIndex >= 0 ? grades[existingIndex].id : this.generateId(),
            assignmentId,
            studentId,
            scores,
            totalScore,
            gradedAt: new Date().toISOString()
        };
        if (existingIndex >= 0) {
            grades[existingIndex] = grade;
        } else {
            grades.push(grade);
        }
        this.saveGrades(assignmentId, grades);
        return grade;
    },

    // 获取班级统计数据
    getClassStats() {
        const user = this.getCurrentUser();
        if (!user) return { classes: 0, students: 0, assignments: 0, graded: 0 };
        
        const classes = this.getClasses();
        const assignments = this.getAssignments();
        
        let totalStudents = 0;
        classes.forEach(c => {
            totalStudents += (c.students?.length || 0);
        });
        
        let totalGraded = 0;
        assignments.forEach(a => {
            const grades = this.getGrades(a.id);
            totalGraded += grades.length;
        });
        
        return {
            classes: classes.length,
            students: totalStudents,
            assignments: assignments.length,
            graded: totalGraded
        };
    }
};

// 导出模块
window.Storage = Storage;
