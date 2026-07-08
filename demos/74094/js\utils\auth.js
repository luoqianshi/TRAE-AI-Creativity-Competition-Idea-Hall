/**
 * 学智云学习平台 - 认证工具
 */

const Auth = {
    /**
     * 模拟用户数据库（本地存储）
     */
    mockUsers: [
        {
            id: 'user-student-001',
            phone: '13800138001',
            email: 'student@example.com',
            password: '123456',
            name: '小明',
            role: 'student',
            grade: 3,
            avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=小男孩卡通头像，蓝色背景&image_size=square',
            createdAt: '2026-01-01'
        },
        {
            id: 'user-student-002',
            phone: '13800138002',
            email: 'student2@example.com',
            password: '123456',
            name: '小红',
            role: 'student',
            grade: 5,
            avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=小女孩卡通头像，粉色背景&image_size=square',
            createdAt: '2026-02-01'
        },
        {
            id: 'user-parent-001',
            phone: '13900139001',
            email: 'parent@example.com',
            password: '123456',
            name: '小明爸爸',
            role: 'parent',
            childrenIds: ['user-student-001'],
            avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=中年男性头像，商务风格，灰色背景&image_size=square',
            createdAt: '2026-01-01'
        },
        {
            id: 'user-teacher-001',
            phone: '13700137001',
            email: 'teacher@example.com',
            password: '123456',
            name: '张老师',
            role: 'teacher',
            subject: 'math',
            school: '实验中学',
            avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=教师头像，专业形象，青色背景&image_size=square',
            createdAt: '2026-01-01'
        }
    ],

    /**
     * 初始化认证系统
     */
    init() {
        // 版本号（用于数据迁移）
        const DATA_VERSION = '2.0';
        const savedVersion = Storage.get('data_version');

        // 如果版本不匹配，重置用户数据（确保新功能可用）
        if (savedVersion !== DATA_VERSION) {
            Storage.set('users', this.mockUsers);
            Storage.set('data_version', DATA_VERSION);
        } else {
            // 加载保存的用户数据
            const savedUsers = Storage.get('users');
            if (!savedUsers || savedUsers.length === 0) {
                // 首次使用，初始化示例用户数据
                Storage.set('users', this.mockUsers);
            }
        }

        // 检查是否有已登录的用户
        const currentUser = Storage.getUser();
        if (currentUser) {
            this.updateUI(currentUser);
        }
    },

    /**
     * 用户登录
     * @param {object} credentials - 登录信息
     * @returns {object} 登录结果
     */
    login(credentials) {
        const { phone, password, role } = credentials;
        const users = Storage.get('users') || [];

        // 查找匹配的用户
        const user = users.find(u => {
            const matchPhone = u.phone === phone || u.email === phone;
            const matchPassword = u.password === password;
            const matchRole = u.role === role;
            return matchPhone && matchPassword && matchRole;
        });

        if (user) {
            // 登录成功，保存用户信息
            Storage.setUser({
                ...user,
                loginTime: new Date().toISOString()
            });

            // 记录登录日志
            this.logLogin(user.id);

            // 更新UI
            this.updateUI(user);

            return {
                success: true,
                message: '登录成功',
                user
            };
        } else {
            return {
                success: false,
                message: '账号或密码错误，请重试'
            };
        }
    },

    /**
     * 用户注册
     * @param {object} userData - 注册信息
     * @returns {object} 注册结果
     */
    register(userData) {
        const { phone, email, password, name, role } = userData;
        const users = Storage.get('users') || [];

        // 检查手机号是否已存在
        if (users.some(u => u.phone === phone)) {
            return {
                success: false,
                message: '该手机号已被注册'
            };
        }

        // 检查邮箱是否已存在
        if (email && users.some(u => u.email === email)) {
            return {
                success: false,
                message: '该邮箱已被注册'
            };
        }

        // 创建新用户
        const newUser = {
            id: Helpers.generateId(),
            phone,
            email: email || '',
            password,
            name,
            role,
            avatar: this.getDefaultAvatar(role),
            createdAt: new Date().toISOString()
        };

        // 根据角色添加额外信息
        if (role === 'student') {
            newUser.grade = 1; // 默认一年级
        } else if (role === 'teacher') {
            newUser.subject = 'math'; // 默认数学
            newUser.school = '';
        } else if (role === 'parent') {
            newUser.childrenIds = [];
        }

        // 保存新用户
        users.push(newUser);
        Storage.set('users', users);

        // 自动登录新用户
        Storage.setUser({
            ...newUser,
            loginTime: new Date().toISOString()
        });

        // 更新UI
        this.updateUI(newUser);

        return {
            success: true,
            message: '注册成功',
            user: newUser
        };
    },

    /**
     * 用户退出登录
     */
    logout() {
        // 清除用户信息
        Storage.clearUser();

        // 更新UI
        this.updateUI(null);

        // 跳转到首页
        Router.navigate('home');

        Helpers.showMessage('退出登录成功', 'success');
    },

    /**
     * 检查用户是否已登录
     * @returns {boolean} 是否已登录
     */
    isLoggedIn() {
        return Storage.getUser() !== null;
    },

    /**
     * 获取当前用户信息
     * @returns {object|null} 用户信息
     */
    getCurrentUser() {
        return Storage.getUser();
    },

    /**
     * 获取当前用户角色
     * @returns {string|null} 用户角色（student/parent/teacher）
     */
    getCurrentRole() {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    },

    /**
     * 更新用户信息
     * @param {object} updates - 要更新的信息
     * @returns {object} 更新结果
     */
    updateUser(updates) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                message: '用户未登录'
            };
        }

        // 更新本地存储中的用户列表
        const users = Storage.get('users') || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            Storage.set('users', users);
        }

        // 更新当前用户信息
        const updatedUser = { ...currentUser, ...updates };
        Storage.setUser(updatedUser);

        // 更新UI
        this.updateUI(updatedUser);

        return {
            success: true,
            message: '更新成功',
            user: updatedUser
        };
    },

    /**
     * 更新UI显示
     * @param {object|null} user - 用户信息
     */
    updateUI(user) {
        const userInfo = document.getElementById('userInfo');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (user) {
            // 已登录状态
            userInfo.querySelector('.username').textContent = user.name;
            userInfo.querySelector('.avatar').src = user.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=用户头像图标，简约风格，绿色背景&image_size=square';
            loginBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
        } else {
            // 未登录状态
            userInfo.querySelector('.username').textContent = '未登录';
            userInfo.querySelector('.avatar').src = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=用户头像图标，简约风格，绿色背景&image_size=square';
            loginBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
        }
    },

    /**
     * 获取默认头像
     * @param {string} role - 用户角色
     * @returns {string} 头像路径
     */
    getDefaultAvatar(role) {
        const avatarMap = {
            student: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=学生头像，简约风格，蓝色背景&image_size=square',
            parent: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=家长头像，简约风格，灰色背景&image_size=square',
            teacher: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=教师头像，专业形象，青色背景&image_size=square'
        };
        return avatarMap[role] || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=用户头像图标，简约风格，绿色背景&image_size=square';
    },

    /**
     * 记录登录日志
     * @param {string} userId - 用户ID
     */
    logLogin(userId) {
        const loginLogs = Storage.get('login_logs') || [];
        loginLogs.unshift({
            userId,
            loginTime: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        // 只保留最近50条登录日志
        if (loginLogs.length > 50) {
            loginLogs.splice(50);
        }
        Storage.set('login_logs', loginLogs);
    },

    /**
     * 检查权限（是否允许访问某个页面）
     * @param {string} page - 页面名称
     * @returns {boolean} 是否有权限
     */
    checkPermission(page) {
        const role = this.getCurrentRole();

        // 公共页面，所有人可访问
        const publicPages = ['home', 'courses', 'login', 'register'];
        if (publicPages.includes(page)) {
            return true;
        }

        // 学生专属页面
        const studentPages = ['practice', 'ai-tutor', 'report', 'profile', 'mistakes', 'history'];
        if (role === 'student' && studentPages.includes(page)) {
            return true;
        }

        // 家长专属页面
        const parentPages = ['parent', 'profile'];
        if (role === 'parent' && parentPages.includes(page)) {
            return true;
        }

        // 教师专属页面
        const teacherPages = ['teacher', 'profile'];
        if (role === 'teacher' && teacherPages.includes(page)) {
            return true;
        }

        return false;
    },

    /**
     * 绑定学生账号（家长角色）
     * @param {string} studentPhone - 学生手机号
     * @returns {object} 绑定结果
     */
    bindStudent(studentPhone) {
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'parent') {
            return {
                success: false,
                message: '只有家长账号可以绑定学生'
            };
        }

        const users = Storage.get('users') || [];
        const student = users.find(u => u.phone === studentPhone && u.role === 'student');

        if (!student) {
            return {
                success: false,
                message: '找不到该学生账号'
            };
        }

        // 检查是否已经绑定
        if (currentUser.childrenIds && currentUser.childrenIds.includes(student.id)) {
            return {
                success: false,
                message: '该学生已经绑定'
            };
        }

        // 添加绑定关系
        const updatedChildrenIds = currentUser.childrenIds || [];
        updatedChildrenIds.push(student.id);

        // 更新家长信息
        const result = this.updateUser({ childrenIds: updatedChildrenIds });

        if (result.success) {
            return {
                success: true,
                message: '绑定成功',
                student
            };
        } else {
            return result;
        }
    },

    /**
     * 获取绑定的学生列表（家长角色）
     * @returns {array} 学生列表
     */
    getBindStudents() {
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'parent') {
            return [];
        }

        const users = Storage.get('users') || [];
        const studentIds = currentUser.childrenIds || [];

        return users.filter(u => studentIds.includes(u.id));
    },

    /**
     * 重置密码
     * @param {object} resetData - 重置信息
     * @returns {object} 重置结果
     */
    resetPassword(resetData) {
        const { phone, newPassword } = resetData;
        const users = Storage.get('users') || [];

        const userIndex = users.findIndex(u => u.phone === phone);
        if (userIndex === -1) {
            return {
                success: false,
                message: '找不到该用户'
            };
        }

        users[userIndex].password = newPassword;
        Storage.set('users', users);

        return {
            success: true,
            message: '密码重置成功'
        };
    }
};

// 导出Auth对象（兼容模块化和全局使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
} else {
    window.Auth = Auth;
}