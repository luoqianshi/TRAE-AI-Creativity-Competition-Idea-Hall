/**
 * 简历焕新计划 - 主逻辑文件
 * 功能：管理设置模态框、localStorage 数据持久化
 */

// ==================== 应用状态管理 ====================
const AppState = {
    apiKey: null, // 存储 API Key
    isModalOpen: false, // 模态框状态
};

// ==================== DOM 元素引用 ====================
const DOM = {
    settingsBtn: null,
    settingsModal: null,
    modalOverlay: null,
    apiKeyInput: null,
    saveBtn: null,
    closeModalBtn: null,
    toast: null,
};

// ==================== 初始化函数 ====================
/**
 * 应用初始化
 * 在 DOMContentLoaded 时调用
 */
function initApp() {
    // 获取 DOM 元素
    DOM.settingsBtn = document.getElementById('settings-btn');
    DOM.settingsModal = document.getElementById('settings-modal');
    DOM.modalOverlay = document.getElementById('modal-overlay');
    DOM.apiKeyInput = document.getElementById('api-key-input');
    DOM.saveBtn = document.getElementById('save-btn');
    DOM.closeModalBtn = document.getElementById('close-modal-btn');
    DOM.toast = document.getElementById('toast');

    // 从 localStorage 加载 API Key
    loadApiKey();

    // 绑定事件监听器
    bindEventListeners();

    console.log('简历焕新计划应用已初始化');
}

// ==================== 事件绑定 ====================
/**
 * 绑定所有事件监听器
 */
function bindEventListeners() {
    // 设置按钮点击事件（可选，因为设置已移到导航栏）
    if (DOM.settingsBtn) {
        DOM.settingsBtn.addEventListener('click', openSettingsModal);
    }

    // 关闭模态框按钮
    if (DOM.closeModalBtn) {
        DOM.closeModalBtn.addEventListener('click', closeSettingsModal);
    }

    // 点击遮罩层关闭模态框
    if (DOM.modalOverlay) {
        DOM.modalOverlay.addEventListener('click', closeSettingsModal);
    }

    // 保存按钮点击事件
    if (DOM.saveBtn) {
        DOM.saveBtn.addEventListener('click', saveApiKey);
    }

    // 输入框回车保存
    if (DOM.apiKeyInput) {
        DOM.apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveApiKey();
            }
        });
    }

    // ESC 键关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && AppState.isModalOpen) {
            closeSettingsModal();
        }
    });

    // 底部设置链接
    const footerSettingsLink = document.getElementById('footer-settings-link');
    if (footerSettingsLink) {
        footerSettingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            openSettingsModal();
        });
    }
}

// ==================== 模态框管理 ====================
/**
 * 打开设置模态框
 */
function openSettingsModal() {
    AppState.isModalOpen = true;
    DOM.settingsModal.classList.remove('hidden');
    DOM.settingsModal.classList.add('fade-in');

    // 如果已有 API Key，显示在输入框中
    if (AppState.apiKey) {
        DOM.apiKeyInput.value = AppState.apiKey;
    }

    // 聚焦到输入框
    setTimeout(() => {
        DOM.apiKeyInput.focus();
    }, 100);
}

/**
 * 关闭设置模态框
 */
function closeSettingsModal() {
    AppState.isModalOpen = false;
    DOM.settingsModal.classList.remove('fade-in');
    DOM.settingsModal.classList.add('fade-out');

    // 等待动画完成后隐藏
    setTimeout(() => {
        DOM.settingsModal.classList.add('hidden');
        DOM.settingsModal.classList.remove('fade-out');
        DOM.apiKeyInput.value = ''; // 清空输入框
    }, 200);
}

// ==================== API Key 管理 ====================
/**
 * 从 localStorage 加载 API Key
 */
function loadApiKey() {
    const savedKey = localStorage.getItem('ai_api_key');
    if (savedKey) {
        AppState.apiKey = savedKey;
        console.log('已加载保存的 API Key');
    }
}

/**
 * 保存 API Key 到 localStorage
 */
function saveApiKey(key) {
    const apiKey = key || (DOM.apiKeyInput ? DOM.apiKeyInput.value.trim() : '');

    // 验证输入
    if (!apiKey) {
        showToast('请输入有效的 API Key', 'error');
        if (DOM.apiKeyInput) DOM.apiKeyInput.focus();
        return;
    }

    // 保存到状态和 localStorage
    AppState.apiKey = apiKey;
    localStorage.setItem('ai_api_key', apiKey);

    // 显示成功提示
    showToast('API Key 保存成功！', 'success');

    // 关闭模态框（仅当从模态框触发时）
    if (!key && DOM.settingsModal) {
        setTimeout(() => {
            closeSettingsModal();
        }, 500);
    }
}

/**
 * 获取当前保存的 API Key
 * @returns {string|null} API Key 或 null
 */
function getApiKey() {
    return AppState.apiKey || localStorage.getItem('ai_api_key');
}

// ==================== Toast 提示 ====================
/**
 * 显示 Toast 提示
 * @param {string} message - 提示消息
 * @param {string} type - 提示类型 ('success' | 'error')
 */
function showToast(message, type = 'success') {
    const toast = DOM.toast;
    const toastMessage = document.getElementById('toast-message');

    // 设置消息和类型
    toastMessage.textContent = message;
    toast.className = `fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 toast-in ${
        type === 'success'
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
    }`;

    // 显示 Toast
    toast.classList.remove('hidden');

    // 3秒后自动隐藏
    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => {
            toast.classList.add('hidden');
            toast.classList.remove('toast-out');
        }, 300);
    }, 2500);
}

// ==================== 页面加载时初始化 ====================
document.addEventListener('DOMContentLoaded', initApp);

// ==================== 导出全局函数（供后续扩展使用） ====================
window.ResumeApp = {
    getApiKey,
    showToast,
    AppState,
};