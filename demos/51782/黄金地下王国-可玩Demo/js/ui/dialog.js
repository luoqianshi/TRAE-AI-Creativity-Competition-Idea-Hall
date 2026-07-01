// ============================================================
// Dialog - ui/dialog.js
// 自动从 game.js 拆分
// ============================================================

const Dialog = {
    callback: null,

    show(content, callback, options = {}) {
        const dialogBox = document.getElementById('dialog-box');
        const dialogContent = document.getElementById('dialog-content');
        const dialogCloseBtn = document.querySelector('.dialog-close');
        
        dialogContent.innerHTML = content;
        dialogBox.style.display = 'flex';
        this.callback = callback || null;
        
        // 控制默认确认按钮的显示/隐藏
        if (dialogCloseBtn) {
            dialogCloseBtn.style.display = options.hideDefaultButton ? 'none' : 'inline-block';
        }
    },

    close() {
        const dialogBox = document.getElementById('dialog-box');
        const dialogCloseBtn = document.querySelector('.dialog-close');
        dialogBox.style.display = 'none';
        
        // 恢复默认按钮显示状态
        if (dialogCloseBtn) {
            dialogCloseBtn.style.display = 'inline-block';
        }
        
        if (this.callback) {
            const cb = this.callback;
            this.callback = null;
            cb();
        }
    }
};

export default Dialog;
