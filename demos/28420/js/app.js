// 应用状态管理
const appState = {
    currentPage: 'home',
    isLoggedIn: false,
    userInfo: null
};

// 页面切换函数
function switchTab(page) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));

    // 显示目标页面
    if (page === 'home') {
        document.getElementById('home-page').classList.add('active');
        document.querySelector('[data-page="home"]').classList.add('active');
    } else if (page === 'mine') {
        document.getElementById('mine-page').classList.add('active');
        document.querySelector('[data-page="mine"]').classList.add('active');
        // updateUserInfo 现在由 showMinePage 调用
    }

    appState.currentPage = page;
}

// 显示登录页面
function showLoginPage() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('login-page').classList.add('active');
    // 默认显示登录表单
    showLoginForm();
}

// 显示注册表单
function showRegisterForm() {
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('register-form-container').style.display = 'block';
    clearAllErrors();
}

// 显示登录表单
function showLoginForm() {
    document.getElementById('login-form-container').style.display = 'block';
    document.getElementById('register-form-container').style.display = 'none';
    clearAllErrors();
}

// 显示我的页面
async function showMinePage() {
    switchTab('mine');
    
    // 立即更新界面显示（根据当前登录状态）
    updateUserInfoDisplay();
    
    // 如果已登录，获取最新用户信息
    if (appState.isLoggedIn) {
        await fetchUserInfo();
    }
}

// 获取用户信息
async function fetchUserInfo() {
    try {
        const result = await get(buildURL(API_CONFIG.endpoints.userInfo));
        
        // 检查 token 是否过期（401 或其他认证错误）
        if (result.code === 401 || result.code === '401' || result.code === 403 || result.code === '403') {
            // token 过期，清除登录状态
            appState.isLoggedIn = false;
            appState.userInfo = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userInfo');
            updateUserInfoDisplay();
            return;
        }
        
        if (result.success && result.code === '0' && result.data) {
            const userData = result.data;
            
            // 更新用户信息显示
            updateUserInfoDisplay(userData);
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
    }
}

// 更新用户信息显示（仅更新界面，不改变状态）
function updateUserInfoDisplay(userData) {
    const notLoginEl = document.getElementById('not-login');
    const loggedInEl = document.getElementById('logged-in');
    const userCodeEl = document.getElementById('user-code');
    const memberLevelEl = document.getElementById('member-level');
    const expireDateEl = document.getElementById('expire-date');

    if (appState.isLoggedIn && appState.userInfo) {
        if (notLoginEl) {
            notLoginEl.style.display = 'none';
        }
        if (loggedInEl) {
            loggedInEl.style.display = 'block';
        }
        if (userCodeEl) {
            userCodeEl.textContent = appState.userInfo.username;
        }
        
        if (userData) {
            if (memberLevelEl) {
                memberLevelEl.textContent = userData.memberLevel ? `${userData.memberLevel} ` : '';
            }
            if (expireDateEl) {
                expireDateEl.textContent = userData.memberEndDate || '';
            }
        }
    } else {
        if (notLoginEl) {
            notLoginEl.style.display = 'block';
        }
        if (loggedInEl) {
            loggedInEl.style.display = 'none';
        }
    }
}

// 表单验证 - 小数位数检查
function validateDecimal(value, maxDecimals) {
    if (value === '' || value === null || value === undefined) return true;
    const str = value.toString();
    const decimalIndex = str.indexOf('.');
    if (decimalIndex === -1) return true;
    const decimals = str.substring(decimalIndex + 1);
    return decimals.length <= maxDecimals;
}

// 显示字段错误
function showFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    const formItem = input.closest('.form-item');
    const errorEl = formItem.querySelector('.error-message');
    
    // 添加错误样式
    input.classList.add('error');
    
    // 显示错误信息
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
    }
}

// 清除所有错误状态
function clearAllErrors() {
    document.querySelectorAll('.form-item input').forEach(input => {
        input.classList.remove('error');
    });
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('show');
        el.textContent = '';
    });
}

// 输入时清除错误状态
document.querySelectorAll('#fund-form input, #login-form input, #register-form input').forEach(input => {
    input.addEventListener('input', function() {
        this.classList.remove('error');
        const formItem = this.closest('.form-item');
        const errorEl = formItem.querySelector('.error-message');
        if (errorEl) {
            errorEl.classList.remove('show');
            errorEl.textContent = '';
        }
    });
});

// 基金表单提交处理
document.getElementById('fund-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    // 清除之前的错误状态
    clearAllErrors();

    // 获取表单数据
    const fundCode = document.getElementById('fund-code').value.trim();
    const basePrice = document.getElementById('base-price').value;
    const costPrice = document.getElementById('cost-price').value;
    const netValue = document.getElementById('net-value').value;
    const dailyChange = document.getElementById('daily-change').value;
    const shares = document.getElementById('shares').value;

    let hasError = false;

    // 验证必填字段
    if (!fundCode) {
        showFieldError('fund-code', '请输入产品编码');
        hasError = true;
    }
    if (!costPrice) {
        showFieldError('cost-price', '请输入持仓成本价');
        hasError = true;
    }
    if (!shares) {
        showFieldError('shares', '请输入持有数量');
        hasError = true;
    }

    // 如果有必填项为空，直接返回
    if (hasError) {
        return;
    }

    // 验证小数位数
    if (!validateDecimal(costPrice, 4)) {
        showFieldError('cost-price', '小数不得超过4位');
        return;
    }
    if (!validateDecimal(netValue, 4)) {
        showFieldError('net-value', '小数不得超过4位');
        return;
    }
    if (!validateDecimal(dailyChange, 2)) {
        showFieldError('daily-change', '小数不得超过2位');
        return;
    }
    if (!validateDecimal(shares, 2)) {
        showFieldError('shares', '小数不得超过2位');
        return;
    }

    // 构建请求参数
    const requestData = {
        fundNo: fundCode,
        basePrice: parseFloat(basePrice),
        costPrice: parseFloat(costPrice),
        lastNet: parseFloat(netValue),
        dayPriceChange: parseFloat(dailyChange),
        shareHeld: parseFloat(shares)
    };

    try {
        // 调用接口（自动添加authorization头）
        const result = await post(buildURL(API_CONFIG.endpoints.addRecon), requestData);

        // 显示结果弹窗
        if (result.success || result.code === '0' || result.code === 200) {
            // 直接展示data字段内容
            showModal(result.data || '提交成功');
            // 清空表单
            document.getElementById('fund-form').reset();
        } else {
            showModal(result.msg || '提交失败，请重试');
        }
    } catch (error) {
        console.error('提交失败:', error);
        showModal('网络错误，请重试');
    }
});

// 计算操作建议
function calculateSuggestion(data) {
    const { costPrice, netValue, dailyChange, shares } = data;

    // 简单的建议算法示例
    let buyAmount = 0;
    let sellShares = 0;

    // 如果当前净值低于成本价且日涨跌幅为负，建议买入
    if (netValue < costPrice && dailyChange < 0) {
        buyAmount = Math.round((costPrice - netValue) * shares * 0.1);
        if (buyAmount < 10) buyAmount = 10;
    }

    // 如果当前净值高于成本价且日涨跌幅为正，建议卖出
    if (netValue > costPrice && dailyChange > 0) {
        sellShares = Math.round(shares * 0.05 * 100) / 100;
        if (sellShares < 10) sellShares = 10;
    }

    // 构建建议文本
    let suggestion = '';
    if (buyAmount > 0) {
        suggestion += `建议购买${buyAmount}元`;
    }
    if (sellShares > 0) {
        if (suggestion) suggestion += '，';
        suggestion += `赎回${sellShares}份`;
    }
    if (!suggestion) {
        suggestion = '当前无需操作，建议继续观察';
    }

    return suggestion;
}

// 显示弹窗
function showModal(content) {
    const modal = document.getElementById('result-modal');
    const modalBody = document.getElementById('modal-body');
    modalBody.textContent = content;
    modal.classList.add('show');
}

// 关闭弹窗
function closeModal() {
    const modal = document.getElementById('result-modal');
    modal.classList.remove('show');
}

// 点击弹窗外部关闭
document.getElementById('result-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// 登录表单提交处理
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    // 清除之前的错误状态
    clearAllErrors();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    let hasError = false;

    if (!username) {
        showFieldError('username', '请输入账户');
        hasError = true;
    }
    if (!password) {
        showFieldError('password', '请输入密码');
        hasError = true;
    }

    if (hasError) {
        return;
    }

    // 调用登录接口
    handleLogin(username, password);
});

// 处理登录
async function handleLogin(username, password) {
    try {
        // SHA-256 加密密码
        const encryptedPassword = await sha256(password);
        
        // 调用登录接口
        const result = await post(buildURL(API_CONFIG.endpoints.login), {
            username: username,
            password: encryptedPassword
        });
        
        if (result.success && result.code === '0') {
            const userData = result.data;
            
            // 保存token
            saveToken(userData.accessToken);
            
            // 保存用户信息，使用接口返回的username
            appState.isLoggedIn = true;
            appState.userInfo = {
                username: userData.username,
                nickname: userData.nickname,
                expires: userData.expires
            };
            localStorage.setItem('userInfo', JSON.stringify(appState.userInfo));
            
            showMinePage();
            
            // 清空表单
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        } else {
            showFieldError('username', result.msg || '登录失败');
        }
    } catch (error) {
        console.error('登录失败:', error);
        showFieldError('username', '网络错误，请重试');
    }
}

// 注册表单提交处理
document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    // 清除之前的错误状态
    clearAllErrors();

    const inviter = document.getElementById('inviter').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    let hasError = false;

    // 验证必填字段
    if (!username) {
        showFieldError('reg-username', '请输入账号');
        hasError = true;
    }
    if (!password) {
        showFieldError('reg-password', '请输入密码');
        hasError = true;
    }
    if (!confirmPassword) {
        showFieldError('confirm-password', '请再次输入密码');
        hasError = true;
    }

    if (hasError) {
        return;
    }

    // 验证两次密码是否一致
    if (password !== confirmPassword) {
        showFieldError('confirm-password', '两次密码不一致');
        return;
    }

    try {
        // SHA-256 加密密码
        const encryptedPassword = await sha256(password);
        
        // 构建请求参数
        const requestData = {
            username: username,
            password: encryptedPassword
        };
        
        // 如果有邀请人，添加到请求中
        if (inviter) {
            requestData.inviter = inviter;
        }
        
        // 调用注册接口
        const result = await post(buildURL(API_CONFIG.endpoints.register), requestData);
        
        if (result.success && result.code === '0') {
            // 注册成功
            showModal('注册成功！请登录');
            
            // 切换到登录表单
            setTimeout(() => {
                closeModal();
                showLoginForm();
                // 填充用户名
                document.getElementById('username').value = username;
            }, 1500);
            
            // 清空注册表单
            document.getElementById('inviter').value = '';
            document.getElementById('reg-username').value = '';
            document.getElementById('reg-password').value = '';
            document.getElementById('confirm-password').value = '';
        } else {
            // 注册失败，显示错误信息
            showFieldError('reg-username', result.msg || '注册失败');
        }
    } catch (error) {
        console.error('注册失败:', error);
        showFieldError('reg-username', '网络错误，请重试');
    }
});

// 生成随机用户编号（6位大写字母和数字）
function generateUserCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// 获取公告内容
async function fetchNotice() {
    try {
        // 模拟API调用（实际应替换为真实接口）
        // const response = await fetch('/api/notice');
        // const data = await response.json();

        // 模拟数据 - 调整为个人理财学习工具定位
        const noticeData = {
            content: '本工具不涉及在线交易、资金流转等金融服务。投资有风险，入市需谨慎。  <br/>每晚8点更新当日行情数据'
        };

        document.getElementById('notice-content').innerHTML  = noticeData.content;
    } catch (error) {
        console.error('获取公告失败:', error);
        document.getElementById('notice-content').innerHTML  = '暂无公告';
    }
}

// 检查登录状态
function checkLoginStatus() {
    const token = getToken();
    const savedUserInfo = localStorage.getItem('userInfo');
    
    if (token && savedUserInfo) {
        try {
            appState.isLoggedIn = true;
            appState.userInfo = JSON.parse(savedUserInfo);
        } catch (e) {
            console.error('解析用户信息失败:', e);
            appState.isLoggedIn = false;
            appState.userInfo = null;
            clearToken();
            localStorage.removeItem('userInfo');
        }
    } else {
        appState.isLoggedIn = false;
        appState.userInfo = null;
    }
}

// 记录访问日志
async function recordVisitLog() {
    try {
        const token = getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        await fetch(buildURL(API_CONFIG.endpoints.visitLog), {
            method: 'GET',
            headers: headers
        });
    } catch (error) {
        console.error('记录访问日志失败:', error);
    }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkLoginStatus();

    // 获取公告内容
    fetchNotice();

    // 默认显示首页
    switchTab('home');
    
    // 强制更新"我的"页面的显示状态（确保刷新后正确显示）
    updateUserInfoDisplay();
    
    // 记录访问日志
    recordVisitLog();
});
