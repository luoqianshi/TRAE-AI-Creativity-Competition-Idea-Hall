// ========== UserManager ==========
const UserManager = {
    users: [],

    init() {
        this.users = JSON.parse(localStorage.getItem('users_list') || '[]');
    },

    generateId() {
        return String(Math.floor(1000000000 + Math.random() * 9000000000));
    },

    register(account, password, nickname, avatar) {
        if (this.users.find(u => u.account === account)) {
            return { success: false, message: '该账号已被注册' };
        }
        const user = {
            id: this.generateId(),
            account: account,
            password: password,
            nickname: nickname || '用户' + Math.floor(Math.random() * 10000),
            avatar: avatar || '😀',
            avatarFrame: 'none', // 默认无头像框
            gender: '', // 'male', 'female', 'other'
            birthday: '', // 'YYYY-MM-DD'
            createdAt: new Date().toISOString(),
            isGuest: false
        };
        this.users.push(user);
        localStorage.setItem('users_list', JSON.stringify(this.users));
        return { success: true, user: user };
    },

    login(account, password) {
        const user = this.users.find(u => u.account === account && u.password === password);
        if (!user) return { success: false, message: '账号或密码错误' };
        return { success: true, user: user };
    },

    loginByCode(account, code) {
        const result = VerifyCodeManager.verify(account, code);
        if (!result.valid) return { success: false, message: result.message };
        const user = this.users.find(u => u.account === account);
        if (!user) return { success: false, message: '该账号未注册' };
        return { success: true, user: user };
    },

    createGuest() {
        const guestId = this.generateId();
        const user = {
            id: guestId,
            account: 'guest_' + Math.floor(Math.random() * 100000),
            password: '',
            nickname: '游客' + Math.floor(Math.random() * 10000),
            avatar: '😀',
            createdAt: new Date().toISOString(),
            isGuest: true
        };
        this.users.push(user);
        localStorage.setItem('users_list', JSON.stringify(this.users));
        return user;
    },

    updateUser(userId, data) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            Object.assign(user, data);
            localStorage.setItem('users_list', JSON.stringify(this.users));
            return true;
        }
        return false;
    },

    getCurrentUser() {
        return state.currentUser;
    }
};

// ========== Login/Register Functions ==========
function switchLoginTab(tab) {
    state.currentLoginTab = tab;
    document.querySelectorAll('#loginForm .login-tab').forEach(t => t.classList.remove('active'));
    event.target.closest('.login-tab').classList.add('active');
    document.getElementById('phoneLogin').style.display = tab === 'phone' ? 'flex' : 'none';
    document.getElementById('emailLogin').style.display = tab === 'email' ? 'flex' : 'none';
    document.getElementById('codeLogin').style.display = tab === 'code' ? 'flex' : 'none';
    document.getElementById('verifyCodeDisplay').classList.remove('active');
}

function switchRegTab(tab) {
    state.currentRegTab = tab;
    document.querySelectorAll('#registerForm .login-tab').forEach(t => t.classList.remove('active'));
    event.target.closest('.login-tab').classList.add('active');
    document.getElementById('phoneRegister').style.display = tab === 'phone' ? 'flex' : 'none';
    document.getElementById('emailRegister').style.display = tab === 'email' ? 'flex' : 'none';
}

function selectAvatar(el, avatar) {
    document.querySelectorAll('#registerForm .avatar-option').forEach(a => a.classList.remove('selected'));
    el.classList.add('selected');
    state.selectedRegAvatar = avatar;
    // 如果是图片URL，清空上传的图片预览
    document.querySelectorAll('#registerForm .avatar-option').forEach(a => {
        const img = a.querySelector('img');
        if (img) img.remove();
    });
}

function triggerAvatarUpload(type) {
    const inputId = type === 'reg' ? 'regAvatarUpload' : 'profileAvatarUpload';
    document.getElementById(inputId).click();
}

function handleAvatarUpload(event, type) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
        const base64 = ev.target.result;
        if (type === 'reg') {
            state.selectedRegAvatar = base64;
            // 取消所有emoji选中状态
            document.querySelectorAll('#registerForm .avatar-option').forEach(a => a.classList.remove('selected'));
            // 在上传按钮前插入一个带图片的avatar-option
            const uploadBtn = document.querySelector('#registerForm .avatar-upload-btn');
            let imgOption = uploadBtn.previousElementSibling;
            if (!imgOption || !imgOption.classList.contains('avatar-option') || !imgOption.querySelector('img')) {
                imgOption = document.createElement('span');
                imgOption.className = 'avatar-option selected';
                imgOption.onclick = function() { selectAvatar(imgOption, base64); };
                uploadBtn.parentNode.insertBefore(imgOption, uploadBtn);
            }
            imgOption.classList.add('selected');
            imgOption.innerHTML = '';
            const img = document.createElement('img');
            img.src = base64;
            img.alt = '头像';
            imgOption.appendChild(img);
        } else {
            // profile
            state.selectedProfileAvatar = base64;
            document.querySelectorAll('#profileAvatarSelector .avatar-option').forEach(a => a.classList.remove('selected'));
            const uploadBtn = document.querySelector('#profileAvatarSelector .avatar-upload-btn');
            let imgOption = uploadBtn.previousElementSibling;
            if (!imgOption || !imgOption.classList.contains('avatar-option') || !imgOption.querySelector('img')) {
                imgOption = document.createElement('span');
                imgOption.className = 'avatar-option selected';
                imgOption.onclick = function() { changeAvatar(imgOption, base64); };
                uploadBtn.parentNode.insertBefore(imgOption, uploadBtn);
            }
            imgOption.classList.add('selected');
            imgOption.innerHTML = '';
            const img = document.createElement('img');
            img.src = base64;
            img.alt = '头像';
            imgOption.appendChild(img);
            // 更新profile头像显示
            setAvatarDisplay('profileAvatar', base64);
        }
    };
    reader.readAsDataURL(file);
}

function setAvatarDisplay(elementId, avatar) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (avatar && (avatar.startsWith('data:image') || avatar.startsWith('http'))) {
        // 图片头像
        el.innerHTML = '';
        const img = document.createElement('img');
        img.src = avatar;
        img.alt = '头像';
        el.appendChild(img);
    } else {
        // emoji头像
        el.textContent = avatar || '😀';
    }
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

function showLogin() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

function sendVerifyCode() {
    const account = document.getElementById('loginCodeAccount').value.trim();
    if (!account) {
        showToast('warning', '请输入手机号或邮箱');
        return;
    }
    const code = VerifyCodeManager.sendCode(account);
    document.getElementById('verifyCodeDisplay').classList.add('active');
    document.getElementById('verifyCodeNum').textContent = code;

    // Countdown
    const btn = document.getElementById('btnSendCode');
    btn.disabled = true;
    let countdown = 60;
    btn.textContent = `${countdown}s`;
    const timer = setInterval(() => {
        countdown--;
        btn.textContent = `${countdown}s`;
        if (countdown <= 0) {
            clearInterval(timer);
            btn.disabled = false;
            btn.textContent = '获取验证码';
        }
    }, 1000);
}

function handleLogin() {
    const tab = state.currentLoginTab;
    let account, password, code;

    if (tab === 'phone') {
        account = document.getElementById('loginPhone').value.trim();
        password = document.getElementById('loginPassword').value;
        if (!account || !password) { showToast('warning', '请输入手机号和密码'); return; }
        const result = UserManager.login(account, password);
        if (!result.success) { showToast('error', result.message); return; }
        loginUser(result.user);
    } else if (tab === 'email') {
        account = document.getElementById('loginEmail').value.trim();
        password = document.getElementById('loginEmailPassword').value;
        if (!account || !password) { showToast('warning', '请输入邮箱和密码'); return; }
        const result = UserManager.login(account, password);
        if (!result.success) { showToast('error', result.message); return; }
        loginUser(result.user);
    } else if (tab === 'code') {
        account = document.getElementById('loginCodeAccount').value.trim();
        code = document.getElementById('loginCode').value.trim();
        if (!account || !code) { showToast('warning', '请输入账号和验证码'); return; }
        const result = UserManager.loginByCode(account, code);
        if (!result.success) { showToast('error', result.message); return; }
        loginUser(result.user);
    }
}

function guestLogin() {
    const user = UserManager.createGuest();
    loginUser(user);
    showToast('success', '已作为游客登录');
}

function handleRegister() {
    const tab = state.currentRegTab;
    let account, password, confirmPassword, nickname;

    if (tab === 'phone') {
        account = document.getElementById('regPhone').value.trim();
        if (!account) { showToast('warning', '请输入手机号'); return; }
        if (!/^1\d{10}$/.test(account)) { showToast('warning', '请输入正确的手机号'); return; }
    } else {
        account = document.getElementById('regEmail').value.trim();
        if (!account) { showToast('warning', '请输入邮箱'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account)) { showToast('warning', '请输入正确的邮箱地址'); return; }
    }

    password = document.getElementById('regPassword').value;
    confirmPassword = document.getElementById('regConfirmPassword').value;
    nickname = document.getElementById('regNickname').value.trim();

    if (!password) { showToast('warning', '请设置密码'); return; }
    if (password.length < 6) { showToast('warning', '密码至少6位'); return; }
    if (password !== confirmPassword) { showToast('warning', '两次密码不一致'); return; }

    const result = UserManager.register(account, password, nickname, state.selectedRegAvatar);
    if (!result.success) { showToast('error', result.message); return; }

    showToast('success', '注册成功');
    loginUser(result.user);
}

function loginUser(user) {
    state.currentUser = user;
    localStorage.setItem('currentUserId', user.id);

    // Ensure avatarFrame field exists for legacy users
    if (!user.avatarFrame) {
        user.avatarFrame = 'none';
    }
    // Sync avatarFrame from localStorage if set there
    if (typeof AvatarFrameSystem !== 'undefined') {
        const savedFrame = AvatarFrameSystem.getActiveFrame();
        if (savedFrame && savedFrame !== 'none') {
            user.avatarFrame = savedFrame;
        }
    }

    // Load user data
    StorageManager.loadAllUserData();

    // Initialize level system
    if (typeof LevelSystem !== 'undefined') {
        LevelSystem.init();
    }

    // Update UI
    updateSidebarUser();
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('rolePage').classList.remove('hidden');
}

function handleLogout() {
    // Save current data before logout
    StorageManager.saveAllUserData();

    state.currentUser = null;
    state.role = null;
    state.chatHistories = {};
    state.notes = [];
    state.subjects = [
        { id: 'math', name: '数学', icon: '🧮', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'english', name: '英语', icon: '📖', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'chinese', name: '语文', icon: '📝', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'physics', name: '物理', icon: '🔭', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'chemistry', name: '化学', icon: '⚗️', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'biology', name: '生物', icon: '🧬', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'history', name: '历史', icon: '🏛️', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'politics', name: '政治', icon: '⚖️', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'geography', name: '地理', icon: '🌍', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'programming', name: '编程', icon: '💻', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'music', name: '音乐', icon: '🎵', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'art', name: '美术', icon: '🎨', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'pe', name: '体育', icon: '⚽', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'it', name: '信息技术', icon: '📡', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'law', name: '法律咨询', icon: '⚖️', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
        { id: 'mental', name: '心理健康', icon: '💚', color: '#4CAF50', isDefault: true, errors: [], chats: {} },
    ];

    localStorage.removeItem('currentUserId');

    document.getElementById('appContainer').classList.remove('active');
    document.getElementById('rolePage').classList.add('hidden');
    document.getElementById('loginPage').classList.remove('hidden');

    // Reset login form
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('verifyCodeDisplay').classList.remove('active');

    showToast('success', '已退出登录');
}

function updateSidebarUser() {
    const user = state.currentUser;
    if (!user) return;
    setAvatarDisplay('sidebarUserAvatar', user.avatar);
    document.getElementById('sidebarUserName').textContent = user.nickname || '用户';
    document.getElementById('sidebarUserRole').textContent = user.isGuest ? '游客' : '已登录';

    // Apply avatar frame AFTER setAvatarDisplay completes (skip for guests)
    if (typeof AvatarFrameSystem !== 'undefined' && !user.isGuest) {
        var activeFrame = AvatarFrameSystem.getActiveFrame();
        var sidebarAvatar = document.getElementById('sidebarUserAvatar');
        if (sidebarAvatar) {
            AvatarFrameSystem.applyFrame(sidebarAvatar, activeFrame);
        }
    }
}

function updateProfileUI() {
    const user = state.currentUser;
    if (!user) return;
    setAvatarDisplay('profileAvatar', user.avatar);
    document.getElementById('profileName').textContent = user.nickname || '用户';
    document.getElementById('profileId').textContent = 'ID: ' + user.id;
    document.getElementById('profileAccount').textContent = user.isGuest ? '游客账号' : '账号: ' + user.account;
    document.getElementById('editNickname').value = user.nickname || '';

    // 性别
    document.querySelectorAll('#genderSelector .gender-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.gender === (user.gender || ''));
    });
    state.selectedGender = user.gender || '';

    // 生日
    document.getElementById('editBirthday').value = user.birthday || '';
    updateBirthdayDisplay(user.birthday);

    // 个人信息摘要
    updateProfileMeta(user);

    // Highlight current avatar
    document.querySelectorAll('#profileAvatarSelector .avatar-option').forEach(a => {
        const isImg = a.querySelector('img');
        const isMatch = isImg ? (user.avatar && user.avatar.startsWith('data:image')) : (a.textContent === (user.avatar || '😀'));
        a.classList.toggle('selected', isMatch);
    });

    // Apply avatar frame to profile avatar (skip for guests)
    if (typeof AvatarFrameSystem !== 'undefined' && !user.isGuest) {
        var activeFrame = AvatarFrameSystem.getActiveFrame();
        var profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar) {
            AvatarFrameSystem.applyFrame(profileAvatar, activeFrame);
        }
    }
}

function changeAvatar(el, avatar) {
    document.querySelectorAll('#profileAvatarSelector .avatar-option').forEach(a => a.classList.remove('selected'));
    el.classList.add('selected');
    state.selectedProfileAvatar = avatar;
    setAvatarDisplay('profileAvatar', avatar);
}

function saveProfile() {
    const user = state.currentUser;
    if (!user) return;
    const nickname = document.getElementById('editNickname').value.trim();
    const avatar = state.selectedProfileAvatar || user.avatar;

    const updates = {};
    if (nickname) updates.nickname = nickname;
    if (avatar) updates.avatar = avatar;
    if (state.selectedGender !== undefined) updates.gender = state.selectedGender;
    const birthday = document.getElementById('editBirthday').value;
    if (birthday) updates.birthday = birthday;

    UserManager.updateUser(user.id, updates);
    Object.assign(user, updates);
    state.selectedProfileAvatar = null;
    updateSidebarUser();
    updateProfileUI();
    showToast('success', '个人信息已更新');
}

// ========== Gender Selection ==========
function selectGender(gender) {
    state.selectedGender = gender;
    document.querySelectorAll('#genderSelector .gender-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.gender === gender);
    });
}

// ========== Birthday ==========
function onBirthdayChange(value) {
    updateBirthdayDisplay(value);
}

function updateBirthdayDisplay(birthday) {
    const el = document.getElementById('birthdayDisplay');
    if (!el) return;
    if (!birthday) { el.textContent = ''; return; }
    const today = new Date();
    const birth = new Date(birthday);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 0) age = 0;

    const zodiacSigns = ['摩羯座','水瓶座','双鱼座','白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座'];
    const zodiacIndex = Math.floor((birth.getMonth() + 10) % 12);
    const zodiac = zodiacSigns[zodiacIndex];

    const chineseAnimals = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
    const chineseAnimal = chineseAnimals[(birth.getFullYear() - 4) % 12];

    el.innerHTML = `<span class="meta-tag">🎂 ${age}岁</span><span class="meta-tag">⭐ ${zodiac}</span><span class="meta-tag">🐉 ${chineseAnimal}年</span>`;
}

function updateProfileMeta(user) {
    const el = document.getElementById('profileMeta');
    if (!el || !user) return;
    let meta = [];
    if (user.gender === 'male') meta.push('♂ 男');
    else if (user.gender === 'female') meta.push('♀ 女');
    else if (user.gender === 'other') meta.push('⚧ 保密');
    if (user.birthday) {
        const today = new Date();
        const birth = new Date(user.birthday);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
        if (age >= 0) meta.push(age + '岁');
    }
    if (user.createdAt) {
        const days = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000);
        meta.push('已加入' + days + '天');
    }
    el.textContent = meta.join(' · ') || '暂无个人信息';
}

// ========== Password Section Toggle ==========
function togglePasswordSection() {
    var section = document.getElementById('passwordSection');
    var icon = document.getElementById('passwordToggleIcon');
    if (!section) return;
    if (section.style.display === 'none') {
        section.style.display = 'block';
        if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
        section.style.display = 'none';
        if (icon) icon.style.transform = 'rotate(0deg)';
    }
}

// ========== Password Change ==========
function changePassword() {
    const user = state.currentUser;
    if (!user) return;
    if (user.isGuest) { showToast('warning', '游客账号不支持修改密码'); return; }

    const currentPwd = document.getElementById('currentPassword').value;
    const newPwd = document.getElementById('newPassword').value;
    const confirmPwd = document.getElementById('confirmNewPassword').value;

    if (!currentPwd) { showToast('warning', '请输入当前密码'); return; }
    if (currentPwd !== user.password) { showToast('error', '当前密码错误'); return; }
    if (!newPwd) { showToast('warning', '请输入新密码'); return; }
    if (newPwd.length < 6) { showToast('warning', '新密码至少6位'); return; }
    if (newPwd !== confirmPwd) { showToast('warning', '两次密码不一致'); return; }

    UserManager.updateUser(user.id, { password: newPwd });
    user.password = newPwd;
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    showToast('success', '密码修改成功');
}

function exportData() {
    const jsonStr = StorageManager.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zhixue_backup_${state.currentUser?.id || 'guest'}_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', '数据已导出');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
            if (confirm('导入数据将覆盖当前数据，确定继续吗？')) {
                const success = StorageManager.importData(ev.target.result);
                if (success) {
                    StorageManager.loadAllUserData();
                    renderSubjects();
                    renderErrors();
                    renderNotes();
                    renderChatHistory();
                    updateErrorCount();
                    showToast('success', '数据导入成功');
                }
            }
        };
        reader.readAsText(file);
    };
    input.click();
}
