/**
 * auth.js - 认证模块
 * 处理登录、注册、登出功能，管理用户认证状态
 */

const Auth = (() => {
    'use strict';

    let _currentUser = null;

    // ============================================
    // 用户状态管理
    // ============================================

    /**
     * 获取当前登录用户信息
     * @returns {Object|null}
     */
    function getCurrentUser() {
        if (_currentUser) return _currentUser;
        _currentUser = Utils.Storage.get('current_user');
        return _currentUser;
    }

    /**
     * 设置当前用户信息
     * @param {Object} user
     */
    function setCurrentUser(user) {
        _currentUser = user;
        Utils.Storage.set('current_user', user);
    }

    /**
     * 清除当前用户信息
     */
    function clearCurrentUser() {
        _currentUser = null;
        Utils.Storage.remove('current_user');
    }

    /**
     * 是否已登录
     * @returns {boolean}
     */
    function isLoggedIn() {
        return API.isAuthenticated() && !!getCurrentUser();
    }

    // ============================================
    // 登录功能
    // ============================================

    /**
     * 初始化登录表单
     * @param {string} formSelector - 登录表单选择器
     */
    function initLoginForm(formSelector = '#login-form') {
        const form = document.querySelector(formSelector);
        if (!form) return;

        // 实时验证
        const emailInput = form.querySelector('[name="email"], [name="username"]');
        const passwordInput = form.querySelector('[name="password"]');

        if (emailInput) {
            emailInput.addEventListener('blur', () => validateLoginEmail(emailInput));
        }
        if (passwordInput) {
            passwordInput.addEventListener('blur', () => validateLoginPassword(passwordInput));
        }

        // 表单提交
        form.addEventListener('submit', handleLoginSubmit);
    }

    /**
     * 验证登录邮箱
     * @param {HTMLInputElement} input
     * @returns {boolean}
     */
    function validateLoginEmail(input) {
        const value = input.value.trim();
        const errorEl = getErrorElement(input);

        if (!value) {
            showFieldError(input, errorEl, '请输入邮箱或用户名');
            return false;
        }

        clearFieldError(input, errorEl);
        return true;
    }

    /**
     * 验证登录密码
     * @param {HTMLInputElement} input
     * @returns {boolean}
     */
    function validateLoginPassword(input) {
        const value = input.value;
        const errorEl = getErrorElement(input);

        if (!value) {
            showFieldError(input, errorEl, '请输入密码');
            return false;
        }

        clearFieldError(input, errorEl);
        return true;
    }

    /**
     * 处理登录表单提交
     * @param {Event} e
     */
    async function handleLoginSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = form.querySelector('[type="submit"]');
        const emailInput = form.querySelector('[name="email"], [name="username"]');
        const passwordInput = form.querySelector('[name="password"]');
        const rememberInput = form.querySelector('[name="remember"]');

        // 验证
        const isEmailValid = validateLoginEmail(emailInput);
        const isPasswordValid = validateLoginPassword(passwordInput);

        if (!isEmailValid || !isPasswordValid) return;

        // 防重复提交
        if (submitBtn.disabled) return;
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '登录中...';

        try {
            const data = {
                email: emailInput.value.trim(),
                password: passwordInput.value
            };

            if (rememberInput && rememberInput.checked) {
                data.remember = true;
            }

            const response = await API.Auth.login(data);

            if (response.token) {
                API.setToken(response.token);
            }

            if (response.user) {
                setCurrentUser(response.user);
            }

            Utils.showToast('登录成功！', 'success');

            // 跳转到首页或来源页
            const redirect = Utils.getQueryParam('redirect') || '/index.html';
            setTimeout(() => {
                window.location.href = redirect;
            }, 1000);

        } catch (error) {
            const message = error.message || '登录失败，请重试';
            Utils.showToast(message, 'error');

            if (error.validationErrors) {
                showValidationErrors(form, error.validationErrors);
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    // ============================================
    // 注册功能
    // ============================================

    /**
     * 初始化注册表单
     * @param {string} formSelector
     */
    function initRegisterForm(formSelector = '#register-form') {
        const form = document.querySelector(formSelector);
        if (!form) return;

        // 实时验证
        const fields = {
            username: form.querySelector('[name="username"]'),
            email: form.querySelector('[name="email"]'),
            password: form.querySelector('[name="password"]'),
            confirmPassword: form.querySelector('[name="confirm_password"]')
        };

        if (fields.username) {
            fields.username.addEventListener('blur', () => validateRegisterUsername(fields.username));
        }
        if (fields.email) {
            fields.email.addEventListener('blur', () => validateRegisterEmail(fields.email));
        }
        if (fields.password) {
            fields.password.addEventListener('blur', () => {
                validateRegisterPassword(fields.password);
                if (fields.confirmPassword && fields.confirmPassword.value) {
                    validateRegisterConfirmPassword(fields.confirmPassword, fields.password);
                }
            });
        }
        if (fields.confirmPassword) {
            fields.confirmPassword.addEventListener('blur', () => {
                validateRegisterConfirmPassword(fields.confirmPassword, fields.password);
            });
        }

        // 密码强度指示
        if (fields.password) {
            fields.password.addEventListener('input', () => updatePasswordStrength(fields.password));
        }

        // 表单提交
        form.addEventListener('submit', handleRegisterSubmit);
    }

    /**
     * 验证注册用户名
     */
    function validateRegisterUsername(input) {
        const value = input.value.trim();
        const errorEl = getErrorElement(input);

        if (!value) {
            showFieldError(input, errorEl, '请输入用户名');
            return false;
        }
        if (value.length < 3) {
            showFieldError(input, errorEl, '用户名至少3个字符');
            return false;
        }
        if (value.length > 20) {
            showFieldError(input, errorEl, '用户名最多20个字符');
            return false;
        }
        if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(value)) {
            showFieldError(input, errorEl, '用户名只能包含字母、数字、下划线或中文');
            return false;
        }

        clearFieldError(input, errorEl);
        return true;
    }

    /**
     * 验证注册邮箱
     */
    function validateRegisterEmail(input) {
        const value = input.value.trim();
        const errorEl = getErrorElement(input);

        if (!value) {
            showFieldError(input, errorEl, '请输入邮箱');
            return false;
        }

        const emailError = Utils.Validators.email(value);
        if (emailError) {
            showFieldError(input, errorEl, emailError);
            return false;
        }

        clearFieldError(input, errorEl);
        return true;
    }

    /**
     * 验证注册密码
     */
    function validateRegisterPassword(input) {
        const value = input.value;
        const errorEl = getErrorElement(input);

        if (!value) {
            showFieldError(input, errorEl, '请输入密码');
            return false;
        }
        if (value.length < 6) {
            showFieldError(input, errorEl, '密码长度至少6位');
            return false;
        }

        clearFieldError(input, errorEl);
        return true;
    }

    /**
     * 验证确认密码
     */
    function validateRegisterConfirmPassword(input, passwordInput) {
        const value = input.value;
        const passwordValue = passwordInput ? passwordInput.value : '';
        const errorEl = getErrorElement(input);

        if (!value) {
            showFieldError(input, errorEl, '请再次输入密码');
            return false;
        }
        if (value !== passwordValue) {
            showFieldError(input, errorEl, '两次输入的密码不一致');
            return false;
        }

        clearFieldError(input, errorEl);
        return true;
    }

    /**
     * 更新密码强度指示器
     */
    function updatePasswordStrength(input) {
        const value = input.value;
        const container = input.parentElement.querySelector('.password-strength');

        if (!container) return;

        let strength = 0;
        let label = '';
        let color = '';

        if (value.length >= 6) strength++;
        if (value.length >= 8) strength++;
        if (/[A-Z]/.test(value)) strength++;
        if (/[0-9]/.test(value)) strength++;
        if (/[^A-Za-z0-9]/.test(value)) strength++;

        if (strength <= 2) { label = '弱'; color = '#ef4444'; }
        else if (strength <= 3) { label = '中'; color = '#f59e0b'; }
        else { label = '强'; color = '#22c55e'; }

        container.innerHTML = value ? `
            <div style="height:4px;background:#e5e7eb;border-radius:2px;margin-top:4px;overflow:hidden;">
                <div style="height:100%;width:${(strength / 5) * 100}%;background:${color};transition:width 0.3s;"></div>
            </div>
            <span style="font-size:12px;color:${color};">${label}</span>
        ` : '';
    }

    /**
     * 处理注册表单提交
     */
    async function handleRegisterSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = form.querySelector('[type="submit"]');

        const data = {
            username: form.querySelector('[name="username"]').value.trim(),
            email: form.querySelector('[name="email"]').value.trim(),
            password: form.querySelector('[name="password"]').value,
            confirmPassword: form.querySelector('[name="confirm_password"]')?.value
        };

        // 验证所有字段
        const usernameInput = form.querySelector('[name="username"]');
        const emailInput = form.querySelector('[name="email"]');
        const passwordInput = form.querySelector('[name="password"]');

        const isUsernameValid = validateRegisterUsername(usernameInput);
        const isEmailValid = validateRegisterEmail(emailInput);
        const isPasswordValid = validateRegisterPassword(passwordInput);

        let isConfirmValid = true;
        const confirmInput = form.querySelector('[name="confirm_password"]');
        if (confirmInput) {
            isConfirmValid = validateRegisterConfirmPassword(confirmInput, passwordInput);
        }

        if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) return;

        // 防重复提交
        if (submitBtn.disabled) return;
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '注册中...';

        try {
            const response = await API.Auth.register({
                username: data.username,
                email: data.email,
                password: data.password
            });

            if (response.token) {
                API.setToken(response.token);
            }

            if (response.user) {
                setCurrentUser(response.user);
            }

            Utils.showToast('注册成功！', 'success');

            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);

        } catch (error) {
            const message = error.message || '注册失败，请重试';
            Utils.showToast(message, 'error');

            if (error.validationErrors) {
                showValidationErrors(form, error.validationErrors);
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    // ============================================
    // 登出功能
    // ============================================

    /**
     * 处理登出
     */
    async function logout() {
        try {
            await API.Auth.logout();
        } catch {
            // 即使请求失败也清除本地状态
        }

        API.clearToken();
        clearCurrentUser();
        Utils.showToast('已退出登录', 'info');

        setTimeout(() => {
            window.location.href = '/login.html';
        }, 500);
    }

    /**
     * 初始化登出按钮
     * @param {string} selector
     */
    function initLogoutButton(selector = '.btn-logout') {
        const btns = document.querySelectorAll(selector);
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                Utils.showModal({
                    title: '确认退出',
                    content: '确定要退出登录吗？',
                    onConfirm: logout
                });
            });
        });
    }

    // ============================================
    // 认证状态UI更新
    // ============================================

    /**
     * 根据登录状态更新页面元素
     */
    function updateAuthUI() {
        const user = getCurrentUser();
        const isLoggedIn = !!user;

        // 显示/隐藏需要登录的元素
        document.querySelectorAll('[data-auth]').forEach(el => {
            const requirement = el.dataset.auth;
            if (requirement === 'show' || requirement === 'logged-in') {
                el.style.display = isLoggedIn ? '' : 'none';
            } else if (requirement === 'hide' || requirement === 'logged-out') {
                el.style.display = isLoggedIn ? 'none' : '';
            }
        });

        // 显示用户名
        document.querySelectorAll('[data-username]').forEach(el => {
            if (user) {
                el.textContent = user.username || user.name || '';
            }
        });

        // 显示用户头像
        document.querySelectorAll('[data-avatar]').forEach(el => {
            if (user && user.avatar) {
                if (el.tagName === 'IMG') {
                    el.src = user.avatar;
                } else {
                    el.style.backgroundImage = `url(${user.avatar})`;
                }
            }
        });
    }

    // ============================================
    // DOM 辅助方法
    // ============================================

    /**
     * 获取字段的错误提示元素
     */
    function getErrorElement(input) {
        const group = input.closest('.form-group') || input.parentElement;
        let errorEl = group.querySelector('.field-error');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'field-error';
            errorEl.style.cssText = 'color:#ef4444;font-size:12px;margin-top:4px;display:block;';
            group.appendChild(errorEl);
        }
        return errorEl;
    }

    /**
     * 显示字段错误
     */
    function showFieldError(input, errorEl, message) {
        input.style.borderColor = '#ef4444';
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    /**
     * 清除字段错误
     */
    function clearFieldError(input, errorEl) {
        input.style.borderColor = '';
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
    }

    /**
     * 显示表单验证错误
     */
    function showValidationErrors(form, errors) {
        for (const [field, message] of Object.entries(errors)) {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
                const errorEl = getErrorElement(input);
                showFieldError(input, errorEl, message);
            }
        }
    }

    // ============================================
    // 初始化
    // ============================================

    /**
     * 检查登录状态并初始化
     */
    function checkAuthState() {
        if (isLoggedIn()) {
            updateAuthUI();
            // 可选：刷新用户信息
            refreshUserProfile();
        }
    }

    /**
     * 刷新用户信息
     */
    async function refreshUserProfile() {
        try {
            const response = await API.Auth.profile();
            if (response.user) {
                setCurrentUser(response.user);
            }
        } catch {
            // Token可能已过期
        }
    }

    // ============================================
    // 公共API
    // ============================================

    return {
        getCurrentUser,
        isLoggedIn,
        initLoginForm,
        initRegisterForm,
        logout,
        initLogoutButton,
        updateAuthUI,
        checkAuthState
    };
})();

if (typeof window !== 'undefined') {
    window.Auth = Auth;
}
