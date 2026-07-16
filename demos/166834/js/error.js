/**
 * 错误显示模块
 * 管理页面上的错误信息提示区域
 */

/** DOM 引用缓存 */
var errorArea = document.getElementById('errorArea');

/**
 * 显示错误信息
 * @param {string} msg - 错误信息文本
 */
function showError(msg) {
    errorArea.textContent = msg;
    errorArea.classList.add('show');
}

/**
 * 清除错误信息
 */
function clearError() {
    errorArea.textContent = '';
    errorArea.classList.remove('show');
}
