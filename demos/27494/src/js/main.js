/**
 * 主入口文件
 * 初始化游戏应用
 */
// 导入游戏控制器
import GameController from './gameController.js';

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 创建游戏控制器实例
    const gameController = new GameController();
    
    // 初始化游戏
    gameController.initializeGame();
});

// 添加键盘快捷键
document.addEventListener('keydown', (e) => {
    // Escape键关闭弹窗
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
});

// 为移动设备添加触摸优化
document.addEventListener('touchstart', () => {}, { passive: true });
