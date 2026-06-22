/**
 * 智学错题本 - 扩展逻辑
 * 键盘快捷键、数据导出等附加功能
 */

// 键盘快捷键
document.addEventListener('keydown', (e) => {
  // ESC 关闭弹窗
  if (e.key === 'Escape') App.closeModal();
  // Ctrl/Cmd + N 添加错题
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    App.showAddModal();
  }
});

// 防止误关闭
window.addEventListener('beforeunload', (e) => {
  if (document.getElementById('modalOverlay').classList.contains('show')) {
    e.preventDefault();
    e.returnValue = '';
  }
});
