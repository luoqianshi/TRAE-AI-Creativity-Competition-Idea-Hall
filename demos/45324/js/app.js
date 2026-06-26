/**
 * 2FA 密钥管理器 — 主应用逻辑
 * 负责 UI 交互、CRUD、验证码刷新、导入导出、密码保护等
 */
(function () {
    'use strict';

    // ===== 应用状态 =====
    const state = {
        keys: [],            // 当前已加载的密钥列表
        cryptoKey: null,     // 加密模式下持有 (会话期间内存中)
        unlocked: false,     // 是否已解锁
        editingId: null,     // 当前编辑的密钥 ID
        confirmCallback: null, // 确认对话框回调
        totpTimer: null,     // 验证码刷新定时器
        detailEntry: null    // 当前在详情面板展示的密钥
    };

    // ===== DOM 引用 =====
    const $ = (id) => document.getElementById(id);
    const dom = {
        lockScreen: $('lockScreen'),
        lockPassword: $('lockPassword'),
        unlockBtn: $('unlockBtn'),
        resetAppBtn: $('resetAppBtn'),
        lockError: $('lockError'),
        lockTitle: $('lockTitle'),
        lockSubtitle: $('lockSubtitle'),
        searchInput: $('searchInput'),
        addBtn: $('addBtn'),
        keyList: $('keyList'),
        emptyState: $('emptyState'),
        // 表单
        formModal: $('formModal'),
        keyForm: $('keyForm'),
        formTitle: $('formTitle'),
        editId: $('editId'),
        serviceName: $('serviceName'),
        accountName: $('accountName'),
        secretKey: $('secretKey'),
        generateSecretBtn: $('generateSecretBtn'),
        otpType: $('otpType'),
        algorithm: $('algorithm'),
        digits: $('digits'),
        period: $('period'),
        periodField: $('periodField'),
        counter: $('counter'),
        counterField: $('counterField'),
        saveKeyBtn: $('saveKeyBtn'),
        // 详情
        detailModal: $('detailModal'),
        detailService: $('detailService'),
        detailAccount: $('detailAccount'),
        detailAvatar: $('detailAvatar'),
        detailCode: $('detailCode'),
        detailCountdown: $('detailCountdown'),
        detailProgressBar: $('detailProgressBar'),
        detailProgressWrap: $('detailProgressWrap'),
        detailMeta: $('detailMeta'),
        nextHotpBtn: $('nextHotpBtn'),
        detailSecret: $('detailSecret'),
        detailUri: $('detailUri'),
        qrcode: $('qrcode'),
        copyCodeBtn: $('copyCodeBtn'),
        copySecretBtn: $('copySecretBtn'),
        verifyInput: $('verifyInput'),
        verifyBtn: $('verifyBtn'),
        verifyResult: $('verifyResult'),
        compatWarn: $('compatWarn'),
        timeSyncBtn: $('timeSyncBtn'),
        timeSyncResult: $('timeSyncResult'),
        // 设置
        settingsModal: $('settingsModal'),
        settingsForm: $('settingsForm'),
        enablePassword: $('enablePassword'),
        passwordFields: $('passwordFields'),
        masterPassword: $('masterPassword'),
        confirmPassword: $('confirmPassword'),
        oldPassword: $('oldPassword'),
        // 导入/导出
        importModal: $('importModal'),
        importBtn: $('importBtn'),
        exportBtn: $('exportBtn'),
        importFile: $('importFile'),
        importText: $('importText'),
        importError: $('importError'),
        doImportBtn: $('doImportBtn'),
        // URI 导入
        uriImportModal: $('uriImportModal'),
        importUriBtn: $('importUriBtn'),
        uriImportText: $('uriImportText'),
        uriImportPreview: $('uriImportPreview'),
        uriImportError: $('uriImportError'),
        doUriImportBtn: $('doUriImportBtn'),
        // 头部
        settingsBtn: $('settingsBtn'),
        lockNowBtn: $('lockNowBtn'),
        // 确认对话框
        confirmModal: $('confirmModal'),
        confirmTitle: $('confirmTitle'),
        confirmMessage: $('confirmMessage'),
        confirmOk: $('confirmOk'),
        confirmCancel: $('confirmCancel'),
        // Toast
        toastContainer: $('toastContainer'),
        downloadAnchor: $('downloadAnchor')
    };

    // ===== 工具函数 =====

    /**
     * HTML 转义，防止 XSS 攻击
     */
    function escapeHtml(str) {
        if (str == null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * 生成唯一 ID
     */
    function generateId() {
        return 'k_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    }

    /**
     * 根据服务名生成简单的字母头像与背景色
     */
    function getAvatarInfo(service) {
        const initial = (service || '?').trim().charAt(0).toUpperCase() || '?';
        const colors = [
            '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b',
            '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'
        ];
        let hash = 0;
        for (let i = 0; i < (service || '').length; i++) {
            hash = (hash * 31 + service.charCodeAt(i)) >>> 0;
        }
        return { initial: initial, color: colors[hash % colors.length] };
    }

    /**
     * 显示 Toast 通知
     * @param {string} message
     * @param {'info'|'success'|'error'} [type='info']
     */
    function toast(message, type) {
        type = type || 'info';
        const el = document.createElement('div');
        el.className = 'toast toast-' + type;
        el.textContent = message; // 使用 textContent 防止 XSS
        dom.toastContainer.appendChild(el);
        // 触发动画
        requestAnimationFrame(() => el.classList.add('show'));
        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 300);
        }, 2800);
    }

    /**
     * 打开模态框
     */
    function openModal(id) {
        const modal = $(id);
        if (modal) {
            modal.classList.remove('hidden');
            // 触发过渡
            requestAnimationFrame(() => modal.classList.add('open'));
        }
    }

    /**
     * 关闭模态框
     */
    function closeModal(id) {
        const modal = $(id);
        if (modal) {
            modal.classList.remove('open');
            setTimeout(() => modal.classList.add('hidden'), 200);
        }
    }

    /**
     * 显示确认对话框
     */
    function confirmDialog(title, message, callback) {
        dom.confirmTitle.textContent = title;
        dom.confirmMessage.textContent = message;
        state.confirmCallback = callback;
        openModal('confirmModal');
    }

    /**
     * 显示错误信息到指定元素
     */
    function showError(el, message) {
        if (!el) return;
        el.textContent = message;
        el.classList.remove('hidden');
    }

    /**
     * 隐藏错误元素
     */
    function hideError(el) {
        if (!el) return;
        el.textContent = '';
        el.classList.add('hidden');
    }

    // ===== 校验函数 =====

    /**
     * 校验服务名和账户名 (防 XSS 与空值)
     */
    function isValidName(str) {
        if (typeof str !== 'string') return false;
        const trimmed = str.trim();
        if (trimmed.length === 0 || trimmed.length > 120) return false;
        return true;
    }

    /**
     * 校验 Base32 密钥
     */
    function isValidSecret(str) {
        if (typeof str !== 'string') return false;
        const normalized = Base32.normalize(str);
        if (normalized.length < 8) return false;
        try {
            Base32.decode(normalized);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 校验主密码强度
     */
    function isValidPassword(str) {
        return typeof str === 'string' && str.length >= 6;
    }

    // ===== 锁屏 =====

    /**
     * 显示锁屏界面
     */
    function showLockScreen(isInitial) {
        if (isInitial) {
            dom.lockTitle.textContent = '输入主密码';
            dom.lockSubtitle.textContent = '请输入主密码以解锁您的密钥';
            dom.resetAppBtn.classList.remove('hidden');
        } else {
            dom.lockTitle.textContent = '应用已锁定';
            dom.lockSubtitle.textContent = '请重新输入主密码继续';
            dom.resetAppBtn.classList.add('hidden');
        }
        dom.lockPassword.value = '';
        hideError(dom.lockError);
        dom.lockScreen.classList.remove('hidden');
        setTimeout(() => dom.lockPassword.focus(), 100);
    }

    /**
     * 隐藏锁屏
     */
    function hideLockScreen() {
        dom.lockScreen.classList.add('hidden');
    }

    /**
     * 尝试解锁应用
     */
    async function attemptUnlock() {
        const password = dom.lockPassword.value;
        if (!password) {
            showError(dom.lockError, '请输入主密码');
            return;
        }
        try {
            dom.unlockBtn.disabled = true;
            dom.unlockBtn.textContent = '解锁中...';
            const key = await Storage.unlock(password);
            state.cryptoKey = key;
            state.unlocked = true;
            state.keys = await Storage.loadKeys(key);
            hideLockScreen();
            renderKeyList();
            startTotpTimer();
            dom.lockNowBtn.classList.remove('hidden');
            toast('解锁成功', 'success');
        } catch (e) {
            showError(dom.lockError, e.message || '解锁失败');
        } finally {
            dom.unlockBtn.disabled = false;
            dom.unlockBtn.textContent = '解锁';
        }
    }

    /**
     * 立即锁定应用
     */
    function lockNow() {
        state.unlocked = false;
        state.cryptoKey = null;
        state.keys = [];
        stopTotpTimer();
        dom.lockNowBtn.classList.add('hidden');
        showLockScreen(false);
    }

    // ===== 密钥列表渲染 =====

    /**
     * 渲染密钥列表 (根据搜索过滤)
     */
    async function renderKeyList() {
        const search = dom.searchInput.value.trim().toLowerCase();
        const filtered = state.keys.filter((k) => {
            if (!search) return true;
            return (
                (k.service || '').toLowerCase().includes(search) ||
                (k.account || '').toLowerCase().includes(search)
            );
        });

        dom.keyList.innerHTML = '';
        if (state.keys.length === 0) {
            dom.emptyState.classList.remove('hidden');
            dom.keyList.classList.add('hidden');
            return;
        }
        dom.emptyState.classList.add('hidden');
        dom.keyList.classList.remove('hidden');

        if (filtered.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'no-results muted';
            empty.textContent = '没有匹配的密钥';
            dom.keyList.appendChild(empty);
            return;
        }

        for (const entry of filtered) {
            dom.keyList.appendChild(await buildKeyCard(entry));
        }
    }

    /**
     * 构建单个密钥卡片
     */
    async function buildKeyCard(entry) {
        const avatar = getAvatarInfo(entry.service);
        const card = document.createElement('article');
        card.className = 'key-card';
        card.dataset.id = entry.id;
        const isHotp = (entry.type || 'totp').toLowerCase() === 'hotp';

        card.innerHTML = `
            <div class="key-card-main">
                <div class="avatar" style="background:${avatar.color}">${escapeHtml(avatar.initial)}</div>
                <div class="key-info">
                    <div class="key-service">${escapeHtml(entry.service)}${isHotp ? '<span class="badge">HOTP</span>' : ''}</div>
                    <div class="key-account muted small">${escapeHtml(entry.account)}</div>
                    <div class="key-code" data-code>------</div>
                </div>
            </div>
            <div class="key-card-side">
                <div class="key-progress">
                    <div class="key-progress-bar" data-bar></div>
                </div>
                <div class="key-countdown muted small" data-countdown>--</div>
            </div>
            <div class="key-actions">
                <button class="icon-btn" data-action="detail" title="详情">👁️</button>
                <button class="icon-btn" data-action="copy" title="复制验证码">📋</button>
                ${isHotp ? '<button class="icon-btn" data-action="next" title="下一个码 (计数器+1)">⏭️</button>' : ''}
                <button class="icon-btn" data-action="edit" title="编辑">✏️</button>
                <button class="icon-btn icon-btn-danger" data-action="delete" title="删除">🗑️</button>
            </div>
        `;

        // 绑定事件
        const codeEl = card.querySelector('[data-code]');
        const barEl = card.querySelector('[data-bar]');
        const countdownEl = card.querySelector('[data-countdown]');

        const refresh = async () => {
            try {
                const keyBytes = Base32.decode(entry.secret);
                const digits = entry.digits || 6;
                const algorithm = entry.algorithm || 'SHA1';
                let code;
                if (isHotp) {
                    const counter = parseInt(entry.counter, 10) || 0;
                    code = await TOTP.hotp(keyBytes, counter, { digits: digits, algorithm: algorithm });
                    codeEl.textContent = formatCode(code);
                    barEl.style.width = '100%';
                    countdownEl.textContent = '#' + counter;
                    barEl.classList.remove('urgent');
                    countdownEl.classList.remove('urgent');
                    card._lastCounter = -1; // HOTP 不按时间刷新
                } else {
                    const period = entry.period || 30;
                    card._lastCounter = Math.floor(Date.now() / 1000 / period);
                    code = await TOTP.totp(keyBytes, {
                        digits: digits,
                        period: period,
                        algorithm: algorithm
                    });
                    codeEl.textContent = formatCode(code);
                    updateProgress(barEl, countdownEl, period);
                }
            } catch (e) {
                codeEl.textContent = '错误';
                countdownEl.textContent = '密钥无效';
            }
        };
        refresh();
        card._refresh = refresh;

        // 卡片按钮事件
        card.querySelector('[data-action="detail"]').addEventListener('click', () => openDetail(entry));
        card.querySelector('[data-action="copy"]').addEventListener('click', () => copyCode(entry));
        if (isHotp) {
            card.querySelector('[data-action="next"]').addEventListener('click', () => incrementHotp(entry));
        }
        card.querySelector('[data-action="edit"]').addEventListener('click', () => openEditForm(entry));
        card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteKey(entry));

        return card;
    }

    /**
     * 格式化验证码：每 3 位加空格，便于阅读
     */
    function formatCode(code) {
        if (code.length === 6) return code.slice(0, 3) + ' ' + code.slice(3);
        if (code.length === 8) return code.slice(0, 4) + ' ' + code.slice(4);
        return code;
    }

    /**
     * 更新进度条与倒计时
     */
    function updateProgress(barEl, countdownEl, period) {
        const remaining = TOTP.remainingSeconds(period);
        const percent = (remaining / period) * 100;
        barEl.style.width = percent + '%';
        countdownEl.textContent = remaining + 's';
        // 时间不足时变红
        if (remaining <= 5) {
            barEl.classList.add('urgent');
            countdownEl.classList.add('urgent');
        } else {
            barEl.classList.remove('urgent');
            countdownEl.classList.remove('urgent');
        }
    }

    // ===== TOTP 定时刷新 =====

    function startTotpTimer() {
        stopTotpTimer();
        state.totpTimer = setInterval(refreshAllCodes, 1000);
    }

    function stopTotpTimer() {
        if (state.totpTimer) {
            clearInterval(state.totpTimer);
            state.totpTimer = null;
        }
    }

    /**
     * 每秒刷新所有卡片：进度条 + 验证码 (周期切换时重新生成)
     */
    async function refreshAllCodes() {
        const cards = dom.keyList.querySelectorAll('.key-card');
        const now = Math.floor(Date.now() / 1000);
        for (const card of cards) {
            const id = card.dataset.id;
            const entry = state.keys.find((k) => k.id === id);
            if (!entry) continue;
            const isHotp = (entry.type || 'totp').toLowerCase() === 'hotp';
            // HOTP 不按时间刷新
            if (isHotp) continue;

            const period = entry.period || 30;
            const remaining = period - (now % period);

            const barEl = card.querySelector('[data-bar]');
            const countdownEl = card.querySelector('[data-countdown]');
            barEl.style.width = (remaining / period) * 100 + '%';
            countdownEl.textContent = remaining + 's';
            if (remaining <= 5) {
                barEl.classList.add('urgent');
                countdownEl.classList.add('urgent');
            } else {
                barEl.classList.remove('urgent');
                countdownEl.classList.remove('urgent');
            }

            // 周期切换时重新生成验证码
            // 使用计数器比较，而非 remaining===period，避免定时器抖动错过边界秒
            const currentCounter = Math.floor(now / period);
            if (card._lastCounter !== currentCounter) {
                if (typeof card._refresh === 'function') card._refresh();
            }
        }

        // 同时刷新详情面板
        if (state.detailEntry && dom.detailModal.classList.contains('open')) {
            refreshDetail();
        }
    }

    // ===== 添加 / 编辑 =====

    /**
     * 打开添加表单
     */
    function openAddForm() {
        state.editingId = null;
        dom.formTitle.textContent = '添加密钥';
        dom.keyForm.reset();
        dom.editId.value = '';
        // 重置为默认值
        dom.otpType.value = 'totp';
        dom.algorithm.value = 'SHA1';
        dom.digits.value = '6';
        dom.period.value = '30';
        dom.counter.value = '0';
        toggleOtpTypeFields();
        dom.compatWarn.classList.add('hidden');
        openModal('formModal');
        setTimeout(() => dom.serviceName.focus(), 100);
    }

    /**
     * 打开编辑表单
     */
    function openEditForm(entry) {
        state.editingId = entry.id;
        dom.formTitle.textContent = '编辑密钥';
        dom.editId.value = entry.id;
        dom.serviceName.value = entry.service || '';
        dom.accountName.value = entry.account || '';
        dom.secretKey.value = entry.secret || '';
        dom.otpType.value = (entry.type || 'totp').toLowerCase();
        dom.algorithm.value = TOTP.normalizeAlgorithm(entry.algorithm);
        dom.digits.value = String(entry.digits || 6);
        dom.period.value = String(entry.period || 30);
        dom.counter.value = String(entry.counter || 0);
        toggleOtpTypeFields();
        // 编辑时根据当前值显示/隐藏兼容性警告
        const nonStandard = dom.digits.value !== '6' || dom.period.value !== '30';
        dom.compatWarn.classList.toggle('hidden', !nonStandard);
        openModal('formModal');
    }

    /**
     * 根据 OTP 类型切换表单字段显示
     * TOTP 显示周期；HOTP 显示计数器
     */
    function toggleOtpTypeFields() {
        const isHotp = dom.otpType.value === 'hotp';
        dom.periodField.classList.toggle('hidden', isHotp);
        dom.counterField.classList.toggle('hidden', !isHotp);
    }

    /**
     * 提交表单：添加或更新密钥
     */
    async function submitKeyForm(e) {
        e.preventDefault();
        const service = dom.serviceName.value.trim();
        const account = dom.accountName.value.trim();
        const secret = dom.secretKey.value.trim();
        const otpType = dom.otpType.value; // 'totp' | 'hotp'
        const algorithm = dom.algorithm.value;
        const digits = parseInt(dom.digits.value, 10) || 6;
        const period = parseInt(dom.period.value, 10) || 30;
        const counter = parseInt(dom.counter.value, 10) || 0;

        // 校验输入
        if (!isValidName(service)) {
            toast('请输入有效的服务名称', 'error');
            return;
        }
        if (!isValidName(account)) {
            toast('请输入有效的账户信息', 'error');
            return;
        }
        if (!isValidSecret(secret)) {
            toast('密钥无效，应为至少 8 个 Base32 字符 (A-Z, 2-7)', 'error');
            return;
        }
        if (otpType === 'hotp' && (isNaN(counter) || counter < 0)) {
            toast('HOTP 计数器必须为非负整数', 'error');
            return;
        }

        dom.saveKeyBtn.disabled = true;
        dom.saveKeyBtn.textContent = '保存中...';
        try {
            const normalizedSecret = Base32.normalize(secret);
            if (state.editingId) {
                // 更新
                const idx = state.keys.findIndex((k) => k.id === state.editingId);
                if (idx >= 0) {
                    state.keys[idx] = {
                        ...state.keys[idx],
                        service: service,
                        account: account,
                        secret: normalizedSecret,
                        type: otpType,
                        algorithm: algorithm,
                        digits: digits,
                        period: period,
                        counter: otpType === 'hotp' ? counter : (state.keys[idx].counter || 0)
                    };
                }
                toast('密钥已更新', 'success');
            } else {
                // 新增
                state.keys.push({
                    id: generateId(),
                    service: service,
                    account: account,
                    secret: normalizedSecret,
                    type: otpType,
                    algorithm: algorithm,
                    digits: digits,
                    period: period,
                    counter: otpType === 'hotp' ? counter : 0,
                    createdAt: Date.now()
                });
                toast('密钥已添加', 'success');
            }
            await Storage.saveKeys(state.keys, state.cryptoKey);
            closeModal('formModal');
            await renderKeyList();
        } catch (err) {
            toast('保存失败：' + err.message, 'error');
        } finally {
            dom.saveKeyBtn.disabled = false;
            dom.saveKeyBtn.textContent = '保存';
        }
    }

    /**
     * 删除密钥
     */
    function deleteKey(entry) {
        confirmDialog(
            '删除密钥',
            '确定要删除 "' + entry.service + '" 的密钥吗？此操作不可撤销。',
            async () => {
                state.keys = state.keys.filter((k) => k.id !== entry.id);
                await Storage.saveKeys(state.keys, state.cryptoKey);
                await renderKeyList();
                toast('密钥已删除', 'success');
            }
        );
    }

    /**
     * HOTP 计数器递增 (+1)，并持久化
     * 参考 Google Authenticator HOTPAuthURL.generateNextOTPCode 的行为
     * @param {object} entry
     */
    async function incrementHotp(entry) {
        const idx = state.keys.findIndex((k) => k.id === entry.id);
        if (idx < 0) return;
        state.keys[idx].counter = (parseInt(state.keys[idx].counter, 10) || 0) + 1;
        try {
            await Storage.saveKeys(state.keys, state.cryptoKey);
            // 同步更新当前 entry 引用 (详情面板可能持有旧引用)
            if (state.detailEntry && state.detailEntry.id === entry.id) {
                state.detailEntry = state.keys[idx];
            }
            await renderKeyList();
            toast('HOTP 计数器已递增至 ' + state.keys[idx].counter, 'success');
        } catch (err) {
            toast('计数器递增失败：' + err.message, 'error');
        }
    }

    // ===== 复制验证码 =====

    /**
     * 复制指定密钥的当前验证码到剪贴板
     */
    async function copyCode(entry) {
        try {
            const keyBytes = Base32.decode(entry.secret);
            const digits = entry.digits || 6;
            const algorithm = entry.algorithm || 'SHA1';
            let code;
            if ((entry.type || 'totp').toLowerCase() === 'hotp') {
                const counter = parseInt(entry.counter, 10) || 0;
                code = await TOTP.hotp(keyBytes, counter, { digits: digits, algorithm: algorithm });
            } else {
                code = await TOTP.totp(keyBytes, {
                    digits: digits,
                    period: entry.period || 30,
                    algorithm: algorithm
                });
            }
            await navigator.clipboard.writeText(code);
            toast('验证码已复制：' + code, 'success');
        } catch (e) {
            // 兜底复制方案
            toast('复制失败，请手动复制', 'error');
        }
    }

    // ===== 详情面板 =====

    let detailQrcodeInstance = null;

    /**
     * 打开密钥详情
     */
    function openDetail(entry) {
        state.detailEntry = entry;
        const avatar = getAvatarInfo(entry.service);
        dom.detailService.textContent = entry.service;
        dom.detailAccount.textContent = entry.account;
        dom.detailAvatar.textContent = avatar.initial;
        dom.detailAvatar.style.background = avatar.color;
        dom.detailSecret.textContent = entry.secret;

        // 显示 otpauth:// URI，便于用户排查 Google Authenticator 接收到的密钥/参数
        const uri = TOTP.buildOtpAuthUri(entry);
        dom.detailUri.textContent = uri;

        // 重置验证输入
        dom.verifyInput.value = '';
        dom.verifyResult.textContent = '';
        dom.verifyResult.className = 'verify-result';

        // 显示类型/算法/参数元信息
        const isHotp = (entry.type || 'totp').toLowerCase() === 'hotp';
        const metaParts = [];
        metaParts.push((isHotp ? 'HOTP' : 'TOTP'));
        metaParts.push(entry.algorithm || 'SHA1');
        metaParts.push((entry.digits || 6) + ' 位');
        if (isHotp) {
            metaParts.push('计数器 #' + (entry.counter || 0));
        } else {
            metaParts.push((entry.period || 30) + ' 秒');
        }
        dom.detailMeta.textContent = metaParts.join(' · ');

        // HOTP 显示"下一个码"按钮，TOTP 显示倒计时进度条
        dom.nextHotpBtn.classList.toggle('hidden', !isHotp);
        dom.detailProgressWrap.classList.toggle('hidden', isHotp);
        dom.detailCountdown.classList.toggle('hidden', isHotp);

        // 生成 QR 码
        dom.qrcode.innerHTML = '';
        try {
            detailQrcodeInstance = new QRCode(dom.qrcode, {
                text: uri,
                width: 200,
                height: 200,
                correctLevel: QRCode.CorrectLevel.M
            });
        } catch (e) {
            dom.qrcode.innerHTML = '<p class="muted small">二维码生成失败</p>';
        }

        openModal('detailModal');
        refreshDetail();
    }

    /**
     * 验证用户输入的码 (来自 Google Authenticator) 是否与本应用生成的码一致
     * - TOTP：允许 ±1 个时间窗口的漂移，避免边界切换瞬间不一致
     * - HOTP：检查当前计数器及前后各 1 个 (允许轻微偏差)
     */
    async function verifyUserCode() {
        const entry = state.detailEntry;
        if (!entry) return;
        const input = (dom.verifyInput.value || '').trim();
        if (!/^\d{6,8}$/.test(input)) {
            dom.verifyResult.textContent = '请输入 6-8 位数字验证码';
            dom.verifyResult.className = 'verify-result verify-fail';
            return;
        }
        try {
            const keyBytes = Base32.decode(entry.secret);
            const digits = entry.digits || 6;
            const algorithm = entry.algorithm || 'SHA1';
            const isHotp = (entry.type || 'totp').toLowerCase() === 'hotp';
            let matched = false;
            let matchedOffset = null;

            if (isHotp) {
                const baseCounter = parseInt(entry.counter, 10) || 0;
                for (const offset of [-1, 0, 1]) {
                    const c = baseCounter + offset;
                    if (c < 0) continue;
                    const code = await TOTP.hotp(keyBytes, c, { digits: digits, algorithm: algorithm });
                    if (code === input) {
                        matched = true;
                        matchedOffset = offset;
                        break;
                    }
                }
            } else {
                const period = entry.period || 30;
                const now = Date.now();
                for (const offset of [-1, 0, 1]) {
                    const code = await TOTP.totp(keyBytes, {
                        digits: digits,
                        period: period,
                        algorithm: algorithm,
                        timestamp: now + offset * period * 1000
                    });
                    if (code === input) {
                        matched = true;
                        matchedOffset = offset;
                        break;
                    }
                }
            }

            if (matched) {
                if (matchedOffset === 0) {
                    dom.verifyResult.textContent = '✅ 验证成功！码与本应用当前' + (isHotp ? '计数器' : '窗口') + '完全一致。算法与 Google 身份验证器相同。';
                } else if (matchedOffset < 0) {
                    dom.verifyResult.textContent = '✅ 验证成功！码匹配上一个' + (isHotp ? '计数器' : '时间窗口') + '。';
                } else {
                    dom.verifyResult.textContent = '✅ 验证成功！码匹配下一个' + (isHotp ? '计数器' : '时间窗口') + '。';
                }
                dom.verifyResult.className = 'verify-result verify-success';
            } else {
                dom.verifyResult.textContent = '❌ 不匹配。请检查：(1) Google Authenticator 中扫描的密钥是否与本应用显示的密钥一致；(2) 是否使用了 8 位码或 60 秒周期 (Google Authenticator 旧版不支持)；(3) HOTP 计数器是否一致；(4) 设备时间是否准确。';
                dom.verifyResult.className = 'verify-result verify-fail';
            }
        } catch (e) {
            dom.verifyResult.textContent = '验证失败：' + e.message;
            dom.verifyResult.className = 'verify-result verify-fail';
        }
    }

    /**
     * 检测系统时钟与世界标准时间的偏差
     * 通过请求 HTTP 头中的 Date 字段获取服务器时间
     */
    async function checkTimeSync() {
        dom.timeSyncResult.textContent = '检测中...';
        dom.timeSyncResult.className = 'time-sync-result';
        try {
            const t1 = Date.now();
            // 使用多个时间源增加成功率
            const urls = [
                'https://www.google.com',
                'https://www.cloudflare.com',
                'https://www.microsoft.com'
            ];
            let serverTime = null;
            for (const url of urls) {
                try {
                    const resp = await fetch(url, { method: 'HEAD', mode: 'cors', cache: 'no-store' });
                    const dateHeader = resp.headers.get('date');
                    if (dateHeader) {
                        serverTime = new Date(dateHeader).getTime();
                        break;
                    }
                } catch (e) { /* 尝试下一个 URL */ }
            }
            const t2 = Date.now();
            if (serverTime === null) {
                // CORS 可能阻止读取 header，用备选方案：请求 2fa.fan API 获取响应中的时间
                throw new Error('无法获取服务器时间 (CORS 限制)');
            }
            // 估算网络延迟一半作为校准
            const localTime = (t1 + t2) / 2;
            const offset = Math.round((localTime - serverTime) / 1000); // 偏差秒数

            if (Math.abs(offset) <= 5) {
                dom.timeSyncResult.textContent = '✅ 系统时间正常 (偏差 ' + offset + ' 秒)。验证码应与 Google 身份验证器一致。';
                dom.timeSyncResult.className = 'time-sync-result time-sync-ok';
            } else if (Math.abs(offset) <= 30) {
                dom.timeSyncResult.textContent = '⚠️ 系统时间偏差 ' + offset + ' 秒。可能导致验证码在周期切换时不一致，建议同步系统时间。';
                dom.timeSyncResult.className = 'time-sync-result time-sync-warn';
            } else {
                dom.timeSyncResult.textContent = '❌ 系统时间偏差 ' + offset + ' 秒！这是验证码与 Google 身份验证器不一致的根本原因。请立即同步系统时间：Windows 设置 → 时间和语言 → 日期和时间 → 立即同步。';
                dom.timeSyncResult.className = 'time-sync-result time-sync-error';
            }
        } catch (e) {
            dom.timeSyncResult.textContent = '检测失败：' + e.message + '。请手动确认系统时间是否准确。';
            dom.timeSyncResult.className = 'time-sync-result time-sync-warn';
        }
    }

    /**
     * 刷新详情面板的验证码与倒计时
     */
    async function refreshDetail() {
        const entry = state.detailEntry;
        if (!entry) return;
        try {
            const keyBytes = Base32.decode(entry.secret);
            const digits = entry.digits || 6;
            const algorithm = entry.algorithm || 'SHA1';
            const isHotp = (entry.type || 'totp').toLowerCase() === 'hotp';
            let code;
            if (isHotp) {
                const counter = parseInt(entry.counter, 10) || 0;
                code = await TOTP.hotp(keyBytes, counter, { digits: digits, algorithm: algorithm });
                dom.detailCode.textContent = formatCode(code);
                dom.detailCountdown.textContent = '计数器 #' + counter;
                dom.detailProgressBar.style.width = '100%';
                dom.detailProgressBar.classList.remove('urgent');
            } else {
                code = await TOTP.totp(keyBytes, {
                    digits: digits,
                    period: entry.period || 30,
                    algorithm: algorithm
                });
                dom.detailCode.textContent = formatCode(code);
                const period = entry.period || 30;
                const remaining = TOTP.remainingSeconds(period);
                dom.detailCountdown.textContent = '剩余 ' + remaining + ' 秒';
                dom.detailProgressBar.style.width = (remaining / period) * 100 + '%';
                if (remaining <= 5) {
                    dom.detailProgressBar.classList.add('urgent');
                } else {
                    dom.detailProgressBar.classList.remove('urgent');
                }
            }
        } catch (e) {
            dom.detailCode.textContent = '------';
        }
    }

    // ===== 导入 / 导出 =====

    /**
     * 导出密钥为 JSON 文件
     */
    function exportKeys() {
        if (state.keys.length === 0) {
            toast('没有可导出的密钥', 'error');
            return;
        }
        const data = {
            version: '1',
            exportedAt: new Date().toISOString(),
            keys: state.keys
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const filename = '2fa-keys-' + new Date().toISOString().slice(0, 10) + '.json';
        dom.downloadAnchor.href = url;
        dom.downloadAnchor.download = filename;
        dom.downloadAnchor.click();
        URL.revokeObjectURL(url);
        toast('已导出 ' + state.keys.length + ' 条密钥', 'success');
    }

    /**
     * 执行导入
     */
    async function doImport() {
        hideError(dom.importError);
        let jsonData = null;

        // 优先从文件读取
        if (dom.importFile.files.length > 0) {
            try {
                const text = await dom.importFile.files[0].text();
                jsonData = JSON.parse(text);
            } catch (e) {
                showError(dom.importError, '文件解析失败：' + e.message);
                return;
            }
        } else if (dom.importText.value.trim()) {
            try {
                jsonData = JSON.parse(dom.importText.value.trim());
            } catch (e) {
                showError(dom.importError, 'JSON 解析失败：' + e.message);
                return;
            }
        } else {
            showError(dom.importError, '请选择文件或粘贴 JSON 内容');
            return;
        }

        // 支持数组或 {keys: []} 结构
        let keys = Array.isArray(jsonData) ? jsonData : jsonData.keys;
        if (!Array.isArray(keys)) {
            showError(dom.importError, 'JSON 中未找到有效的密钥数组');
            return;
        }

        // 校验并规范化每条记录
        const validated = [];
        let skipped = 0;
        for (const k of keys) {
            if (!k || typeof k !== 'object') { skipped++; continue; }
            if (!isValidName(k.service) || !isValidName(k.account) || !isValidSecret(k.secret)) {
                skipped++;
                continue;
            }
            // 保留 type / algorithm / counter，未提供时回退默认
            const otpType = (k.type || 'totp').toLowerCase() === 'hotp' ? 'hotp' : 'totp';
            const algorithm = TOTP.normalizeAlgorithm(k.algorithm);
            const digits = (function () {
                const d = parseInt(k.digits, 10);
                if (d === 6 || d === 8) return d;
                return 6;
            })();
            const period = (function () {
                const p = parseInt(k.period, 10);
                if (p > 0 && p <= 300) return p;
                return 30;
            })();
            const counter = otpType === 'hotp' ? (parseInt(k.counter, 10) || 0) : 0;
            validated.push({
                id: generateId(),
                service: k.service.trim(),
                account: k.account.trim(),
                secret: Base32.normalize(k.secret),
                type: otpType,
                algorithm: algorithm,
                digits: digits,
                period: period,
                counter: counter,
                createdAt: k.createdAt || Date.now()
            });
        }

        if (validated.length === 0) {
            showError(dom.importError, '没有有效的密钥可导入');
            return;
        }

        const mode = document.querySelector('input[name="importMode"]:checked').value;
        if (mode === 'replace') {
            state.keys = validated;
        } else {
            state.keys = state.keys.concat(validated);
        }

        try {
            await Storage.saveKeys(state.keys, state.cryptoKey);
            await renderKeyList();
            closeModal('importModal');
            dom.importFile.value = '';
            dom.importText.value = '';
            toast('成功导入 ' + validated.length + ' 条密钥' + (skipped > 0 ? '，跳过 ' + skipped + ' 条无效记录' : ''), 'success');
        } catch (e) {
            showError(dom.importError, '保存失败：' + e.message);
        }
    }

    /**
     * 实时预览 otpauth:// URI 解析结果
     */
    function previewUriImport() {
        const text = dom.uriImportText.value || '';
        const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        dom.uriImportPreview.innerHTML = '';
        hideError(dom.uriImportError);
        if (lines.length === 0) return;

        const parsed = [];
        const errors = [];
        lines.forEach((line, idx) => {
            const entry = TOTP.parseOtpAuthUri(line);
            if (entry) {
                parsed.push(entry);
            } else {
                errors.push('第 ' + (idx + 1) + ' 行无法解析');
            }
        });

        if (parsed.length > 0) {
            const list = document.createElement('div');
            list.className = 'uri-preview-list';
            parsed.forEach((e) => {
                const item = document.createElement('div');
                item.className = 'uri-preview-item';
                const typeTag = e.type === 'hotp' ? 'HOTP' : 'TOTP';
                item.innerHTML =
                    '<div class="uri-preview-main">' +
                    '<span class="badge">' + typeTag + '</span>' +
                    '<strong>' + escapeHtml(e.service || '(未命名)') + '</strong>' +
                    ' <span class="muted small">' + escapeHtml(e.account || '') + '</span>' +
                    '</div>' +
                    '<div class="muted small">' + escapeHtml(e.algorithm) + ' · ' + e.digits + ' 位 · ' +
                    (e.type === 'hotp' ? '计数器 #' + e.counter : e.period + ' 秒') + '</div>';
                list.appendChild(item);
            });
            dom.uriImportPreview.appendChild(list);
        }
        if (errors.length > 0) {
            showError(dom.uriImportError, errors.join('；'));
        }
    }

    /**
     * 执行 otpauth:// URI 导入
     */
    async function doUriImport() {
        const text = dom.uriImportText.value || '';
        const lines = text.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
        if (lines.length === 0) {
            showError(dom.uriImportError, '请粘贴至少一条 otpauth:// URI');
            return;
        }

        const validated = [];
        let skipped = 0;
        lines.forEach((line) => {
            const entry = TOTP.parseOtpAuthUri(line);
            if (!entry) {
                skipped++;
                return;
            }
            // 进一步校验 service/account (URI 中可能没有 label)
            const service = entry.service || '(导入)';
            const account = entry.account || 'user@' + (entry.service || 'imported');
            validated.push({
                id: generateId(),
                service: service,
                account: account,
                secret: entry.secret,
                type: entry.type,
                algorithm: entry.algorithm,
                digits: entry.digits,
                period: entry.period,
                counter: entry.counter,
                createdAt: Date.now()
            });
        });

        if (validated.length === 0) {
            showError(dom.uriImportError, '没有有效的 URI 可导入');
            return;
        }

        try {
            state.keys = state.keys.concat(validated);
            await Storage.saveKeys(state.keys, state.cryptoKey);
            await renderKeyList();
            closeModal('uriImportModal');
            dom.uriImportText.value = '';
            dom.uriImportPreview.innerHTML = '';
            toast('成功从 URI 导入 ' + validated.length + ' 条密钥' + (skipped > 0 ? '，跳过 ' + skipped + ' 条无效行' : ''), 'success');
        } catch (e) {
            showError(dom.uriImportError, '保存失败：' + e.message);
        }
    }

    // ===== 设置 =====

    /**
     * 打开设置面板，根据当前加密状态初始化 UI
     */
    function openSettings() {
        const meta = Storage.getMeta();
        dom.enablePassword.checked = meta.encrypted === true;
        dom.passwordFields.classList.toggle('hidden', !meta.encrypted);
        dom.masterPassword.value = '';
        dom.confirmPassword.value = '';
        dom.oldPassword.value = '';
        if (meta.encrypted) {
            dom.masterPassword.placeholder = '设置新主密码 (留空表示不修改)';
            dom.oldPassword.parentElement.classList.remove('hidden');
        } else {
            dom.masterPassword.placeholder = '设置主密码 (至少 6 位)';
            dom.oldPassword.parentElement.classList.add('hidden');
        }
        openModal('settingsModal');
    }

    /**
     * 提交设置
     */
    async function submitSettings(e) {
        e.preventDefault();
        const enable = dom.enablePassword.checked;
        const meta = Storage.getMeta();

        try {
            if (enable) {
                // 启用 / 修改密码
                const newPwd = dom.masterPassword.value;
                const confirmPwd = dom.confirmPassword.value;
                const oldPwd = dom.oldPassword.value;

                if (!newPwd) {
                    // 留空 + 已启用 = 不修改
                    if (meta.encrypted) {
                        toast('密码未修改', 'info');
                        closeModal('settingsModal');
                        return;
                    } else {
                        toast('请设置主密码', 'error');
                        return;
                    }
                }
                if (!isValidPassword(newPwd)) {
                    toast('主密码至少 6 位', 'error');
                    return;
                }
                if (newPwd !== confirmPwd) {
                    toast('两次输入的密码不一致', 'error');
                    return;
                }
                const key = await Storage.enableEncryption(newPwd, meta.encrypted ? oldPwd : undefined);
                state.cryptoKey = key;
                state.unlocked = true;
                state.keys = await Storage.loadKeys(key);
                dom.lockNowBtn.classList.remove('hidden');
                await renderKeyList();
                toast('密码保护已启用', 'success');
                closeModal('settingsModal');
            } else {
                // 关闭密码保护
                if (meta.encrypted) {
                    const oldPwd = dom.oldPassword.value;
                    if (!oldPwd) {
                        toast('关闭密码保护需要输入原密码', 'error');
                        return;
                    }
                    await Storage.disableEncryption(oldPwd);
                    state.cryptoKey = null;
                    state.unlocked = true;
                    state.keys = await Storage.loadKeys();
                    await renderKeyList();
                    toast('密码保护已关闭', 'success');
                    closeModal('settingsModal');
                } else {
                    toast('设置未变更', 'info');
                    closeModal('settingsModal');
                }
            }
        } catch (err) {
            toast(err.message || '设置失败', 'error');
        }
    }

    // ===== 初始化 =====

    /**
     * 应用启动
     */
    async function init() {
        bindEvents();

        const meta = Storage.getMeta();
        if (meta.encrypted) {
            // 显示锁屏
            showLockScreen(true);
            return;
        }
        // 未启用加密，直接加载
        state.unlocked = true;
        try {
            state.keys = await Storage.loadKeys();
        } catch (e) {
            state.keys = [];
        }
        await renderKeyList();
        startTotpTimer();
    }

    /**
     * 绑定所有事件监听
     */
    function bindEvents() {
        // 锁屏
        dom.unlockBtn.addEventListener('click', attemptUnlock);
        dom.lockPassword.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') attemptUnlock();
        });
        dom.resetAppBtn.addEventListener('click', () => {
            confirmDialog('重置应用', '将清除所有本地密钥数据且不可恢复，确定继续吗？', () => {
                Storage.wipeAll();
                location.reload();
            });
        });

        // 头部
        dom.addBtn.addEventListener('click', openAddForm);
        dom.exportBtn.addEventListener('click', exportKeys);
        dom.importBtn.addEventListener('click', () => {
            dom.importFile.value = '';
            dom.importText.value = '';
            hideError(dom.importError);
            openModal('importModal');
        });
        dom.settingsBtn.addEventListener('click', openSettings);
        dom.lockNowBtn.addEventListener('click', lockNow);

        // 搜索
        dom.searchInput.addEventListener('input', renderKeyList);

        // 表单
        dom.keyForm.addEventListener('submit', submitKeyForm);
        dom.generateSecretBtn.addEventListener('click', () => {
            dom.secretKey.value = Base32.generateSecret(20);
            toast('已生成新密钥', 'success');
        });
        // 位数/周期变更时显示兼容性警告 (Google Authenticator 旧版不支持 8 位/60 秒)
        function updateCompatWarn() {
            const nonStandard = dom.digits.value !== '6' || (dom.otpType.value !== 'hotp' && dom.period.value !== '30');
            dom.compatWarn.classList.toggle('hidden', !nonStandard);
        }
        dom.digits.addEventListener('change', updateCompatWarn);
        dom.period.addEventListener('change', updateCompatWarn);
        // 切换 OTP 类型时显示/隐藏 字段，并刷新兼容性警告
        dom.otpType.addEventListener('change', () => {
            toggleOtpTypeFields();
            updateCompatWarn();
        });

        // URI 导入
        dom.importUriBtn.addEventListener('click', () => {
            dom.uriImportText.value = '';
            dom.uriImportPreview.innerHTML = '';
            hideError(dom.uriImportError);
            openModal('uriImportModal');
            setTimeout(() => dom.uriImportText.focus(), 100);
        });
        dom.uriImportText.addEventListener('input', previewUriImport);
        dom.doUriImportBtn.addEventListener('click', doUriImport);

        // 设置表单
        dom.settingsForm.addEventListener('submit', submitSettings);
        dom.enablePassword.addEventListener('change', () => {
            const checked = dom.enablePassword.checked;
            dom.passwordFields.classList.toggle('hidden', !checked);
        });

        // 详情
        dom.copyCodeBtn.addEventListener('click', () => {
            if (state.detailEntry) copyCode(state.detailEntry);
        });
        dom.copySecretBtn.addEventListener('click', () => {
            if (state.detailEntry) {
                navigator.clipboard.writeText(state.detailEntry.secret)
                    .then(() => toast('密钥已复制', 'success'))
                    .catch(() => toast('复制失败', 'error'));
            }
        });
        // 验证 Google Authenticator 码
        dom.verifyBtn.addEventListener('click', verifyUserCode);
        dom.verifyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') verifyUserCode();
        });
        // HOTP 下一个码按钮 (计数器 +1)
        dom.nextHotpBtn.addEventListener('click', () => {
            if (state.detailEntry) {
                incrementHotp(state.detailEntry).then(() => {
                    // 重新打开详情面板以刷新元信息
                    if (state.detailEntry) openDetail(state.detailEntry);
                });
            }
        });
        // 时间同步检测
        dom.timeSyncBtn.addEventListener('click', checkTimeSync);

        // 导入
        dom.doImportBtn.addEventListener('click', doImport);

        // 确认对话框
        dom.confirmOk.addEventListener('click', () => {
            const cb = state.confirmCallback;
            state.confirmCallback = null;
            closeModal('confirmModal');
            if (typeof cb === 'function') cb();
        });
        dom.confirmCancel.addEventListener('click', () => {
            state.confirmCallback = null;
            closeModal('confirmModal');
        });

        // 所有 [data-close] 关闭按钮 + 点击背景关闭
        document.querySelectorAll('[data-close]').forEach((btn) => {
            btn.addEventListener('click', () => closeModal(btn.dataset.close));
        });
        document.querySelectorAll('.modal-backdrop').forEach((bg) => {
            bg.addEventListener('click', () => {
                const modal = bg.closest('.modal');
                if (modal) closeModal(modal.id);
            });
        });

        // ESC 关闭最顶层模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal.open');
                if (openModals.length > 0) {
                    closeModal(openModals[openModals.length - 1].id);
                }
            }
        });

        // 页面失焦自动锁定 (可选行为，仅在加密模式下生效)
        // 注：为避免开发体验中断，这里不自动锁定，用户可点击锁定按钮
    }

    // 启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
