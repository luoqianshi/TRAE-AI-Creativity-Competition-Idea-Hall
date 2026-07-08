/**
 * 学智云学习平台 - 登录/注册组件
 */

const LoginComponent = {
    render() {
        return `
            <div class="auth-container">
                <div class="auth-form">
                    <h2>用户登录</h2>
                    <form id="loginFormMain" onsubmit="LoginComponent.handleLogin(event)">
                        <div class="form-group">
                            <label>手机号/邮箱</label>
                            <input type="text" id="loginPhoneMain" placeholder="请输入手机号或邮箱" required>
                        </div>
                        <div class="form-group">
                            <label>密码</label>
                            <input type="password" id="loginPasswordMain" placeholder="请输入密码" required>
                        </div>
                        <div class="form-group">
                            <label>用户类型</label>
                            <select id="loginRoleMain">
                                <option value="student">学生</option>
                                <option value="parent">家长</option>
                                <option value="teacher">教师</option>
                            </select>
                        </div>
                        <button type="submit" class="action-btn submit-btn">登录</button>
                        <p class="register-link">还没有账号？<a href="#/register">立即注册</a></p>
                    </form>
                    <div class="demo-accounts">
                        <h4>示例账号：</h4>
                        <p>学生：13800138001 / 123456</p>
                        <p>家长：13900139001 / 123456</p>
                        <p>教师：13700137001 / 123456</p>
                    </div>
                </div>
            </div>
        `;
    },

    handleLogin(e) {
        e.preventDefault();
        const phone = document.getElementById('loginPhoneMain').value;
        const password = document.getElementById('loginPasswordMain').value;
        const role = document.getElementById('loginRoleMain').value;

        const result = Auth.login({ phone, password, role });

        if (result.success) {
            Helpers.showMessage('登录成功！', 'success');
            Router.navigate('home');
        } else {
            Helpers.showMessage(result.message, 'error');
        }
    }
};

const RegisterComponent = {
    render() {
        return `
            <div class="auth-container">
                <div class="auth-form">
                    <h2>用户注册</h2>
                    <form id="registerForm" onsubmit="RegisterComponent.handleRegister(event)">
                        <div class="form-group">
                            <label>姓名</label>
                            <input type="text" id="registerName" placeholder="请输入姓名" required>
                        </div>
                        <div class="form-group">
                            <label>手机号</label>
                            <input type="text" id="registerPhone" placeholder="请输入手机号" required>
                        </div>
                        <div class="form-group">
                            <label>邮箱（可选）</label>
                            <input type="email" id="registerEmail" placeholder="请输入邮箱">
                        </div>
                        <div class="form-group">
                            <label>密码</label>
                            <input type="password" id="registerPassword" placeholder="请输入密码（至少6位）" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label>用户类型</label>
                            <select id="registerRole">
                                <option value="student">学生</option>
                                <option value="parent">家长</option>
                                <option value="teacher">教师</option>
                            </select>
                        </div>
                        <button type="submit" class="action-btn submit-btn">注册</button>
                        <p class="register-link">已有账号？<a href="#/login">立即登录</a></p>
                    </form>
                </div>
            </div>
        `;
    },

    handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const phone = document.getElementById('registerPhone').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const role = document.getElementById('registerRole').value;

        if (!Helpers.validatePhone(phone)) {
            Helpers.showMessage('请输入正确的手机号', 'warning');
            return;
        }

        const result = Auth.register({ name, phone, email, password, role });

        if (result.success) {
            Helpers.showMessage('注册成功！', 'success');
            Router.navigate('home');
        } else {
            Helpers.showMessage(result.message, 'error');
        }
    }
};

const ParentComponent = {
    render() {
        const currentUser = Auth.getCurrentUser();
        
        if (!currentUser || currentUser.role !== 'parent') {
            return `<p>请以家长身份登录</p>`;
        }

        const students = Auth.getBindStudents();

        return `
            <div class="parent-container">
                <h2>家长端</h2>
                <div class="bind-student">
                    <h3>绑定学生</h3>
                    <div class="form-group">
                        <input type="text" id="bindStudentPhone" placeholder="请输入学生手机号">
                        <button class="action-btn submit-btn" onclick="ParentComponent.bindStudent()">绑定</button>
                    </div>
                </div>
                <div class="students-list">
                    <h3>已绑定学生 (${students.length})</h3>
                    ${students.map(student => `
                        <div class="student-card">
                            <h4>${student.name}</h4>
                            <p>${Helpers.getGradeName(student.grade)}</p>
                            <p>学习记录：${Storage.getLearningRecords().filter(r => r.userId === student.id).length}条</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    bindStudent() {
        const phone = document.getElementById('bindStudentPhone').value;
        const result = Auth.bindStudent(phone);

        if (result.success) {
            Helpers.showMessage('绑定成功', 'success');
            Router.refresh();
        } else {
            Helpers.showMessage(result.message, 'error');
        }
    }
};

const TeacherComponent = {
    render() {
        const currentUser = Auth.getCurrentUser();
        
        if (!currentUser || currentUser.role !== 'teacher') {
            return `<p>请以教师身份登录</p>`;
        }

        return `
            <div class="teacher-container">
                <h2>教师端</h2>
                <div class="teacher-info">
                    <h3>个人信息</h3>
                    <p>姓名：${currentUser.name}</p>
                    <p>学校：${currentUser.school || '未设置'}</p>
                    <p>科目：${Helpers.getSubjectName(currentUser.subject || 'math')}</p>
                </div>
                <div class="teacher-actions">
                    <h3>教学管理</h3>
                    <p>功能开发中...</p>
                </div>
            </div>
        `;
    }
};

window.LoginComponent = LoginComponent;
window.RegisterComponent = RegisterComponent;
window.ParentComponent = ParentComponent;
window.TeacherComponent = TeacherComponent;