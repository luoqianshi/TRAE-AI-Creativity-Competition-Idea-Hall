/**
 * 游戏控制器模块
 * 连接游戏逻辑和用户界面
 */
import GameLogic from './gameLogic.js';
import AIPlayer from './aiPlayer.js';
import GameLimit from './gameLimit.js';

class GameController {
    constructor() {
        this.gameLogic = new GameLogic();
        this.aiPlayer = new AIPlayer();
        this.gameLimit = new GameLimit();
        this.gameMode = 'ai-easy'; // 默认AI模式
        this.isAITurn = false;
        this.gameInProgress = false; // 标记游戏是否正在进行
        this.initializeDOM();
    }

    /**
     * 初始化DOM引用
     */
    initializeDOM() {
        this.boardElement = document.querySelector('.game-board');
        this.blackCountElement = document.getElementById('black-count');
        this.whiteCountElement = document.getElementById('white-count');
        this.currentPlayerElement = document.getElementById('current-player');
        this.newGameButton = document.getElementById('new-game-btn');
        this.undoButton = document.getElementById('undo-btn');
        this.rulesButton = document.getElementById('rules-btn');
        this.shareButton = document.getElementById('share-btn');
        this.remainingCountElement = document.getElementById('remaining-count');
        this.rulesModal = document.getElementById('rules-modal');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.limitModal = document.getElementById('limit-modal');
        this.shareModal = document.getElementById('share-modal');
        this.gameOverMessage = document.getElementById('game-over-message');
        this.shareMessage = document.getElementById('share-message');
        this.playAgainButton = document.getElementById('play-again-btn');
        this.closeLimitButton = document.getElementById('close-limit-btn');
        this.closeShareButton = document.getElementById('close-share-btn');
        this.closeModalButton = document.querySelector('.close-modal');
        this.modeOptions = document.querySelectorAll('input[name="mode"]');
    }

    /**
     * 初始化游戏
     */
    initializeGame() {
        this.setupEventListeners();
        this.updateRemainingCount();
        this.resetGame();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 新游戏按钮
        this.newGameButton.addEventListener('click', () => {
            this.resetGame();
        });

        // 悔棋按钮
        this.undoButton.addEventListener('click', () => {
            this.undoMove();
        });

        // 规则按钮
        this.rulesButton.addEventListener('click', () => {
            this.showRules();
        });

        // 分享按钮
        this.shareButton.addEventListener('click', () => {
            this.handleShare();
        });

        // 关闭弹窗按钮
        this.closeModalButton.addEventListener('click', () => {
            this.rulesModal.style.display = 'none';
        });

        // 关闭游戏次数用尽弹窗
        this.closeLimitButton.addEventListener('click', () => {
            this.limitModal.style.display = 'none';
        });

        // 关闭分享成功弹窗
        this.closeShareButton.addEventListener('click', () => {
            this.shareModal.style.display = 'none';
        });

        // 再来一局按钮
        this.playAgainButton.addEventListener('click', () => {
            this.gameOverModal.style.display = 'none';
            this.resetGame();
        });

        // 点击模态框外部关闭
        this.rulesModal.addEventListener('click', (e) => {
            if (e.target === this.rulesModal) {
                this.rulesModal.style.display = 'none';
            }
        });

        // 游戏模式切换
        this.modeOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                this.gameMode = e.target.value;
                this.resetGame();
            });
        });
    }

    /**
     * 显示规则
     */
    showRules() {
        // 直接显示规则弹窗
        this.rulesModal.style.display = 'flex';
    }

    /**
     * 重置游戏
     */
    resetGame() {
        // 检查是否有剩余次数
        if (!this.gameLimit.canStartGame()) {
            this.showLimitModal();
            return;
        }

        // 如果有正在进行的游戏，不消耗次数
        if (!this.gameInProgress) {
            this.gameLimit.startGame();
            this.gameInProgress = true;
            this.updateRemainingCount();
        }

        this.gameLogic = new GameLogic();
        this.aiPlayer = new AIPlayer();
        this.isAITurn = false;
        this.renderBoard();
        this.updateGameInfo();
        if (this.gameOverModal) {
            this.gameOverModal.style.display = 'none';
        }
    }

    /**
     * 渲染棋盘
     */
    renderBoard() {
        this.boardElement.innerHTML = '';
        const board = this.gameLogic.getBoard();
        const currentPlayer = this.gameLogic.getCurrentPlayer();
        const validMoves = this.gameLogic.getValidMoves(currentPlayer);
        const flippedPieces = this.gameLogic.lastFlippedPieces || [];
        console.log(`Render Board: ${currentPlayer}, Valid Moves: ${validMoves.length}`);

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.classList.add('board-cell');
                cell.dataset.row = row;
                cell.dataset.col = col;

                // 检查是否是合法落子位置
                const isValidMove = validMoves.some(move => move.row === row && move.col === col);
                if (isValidMove && !this.isAITurn && !this.gameLogic.isGameOver()) {
                    cell.classList.add('valid-move');
                    cell.addEventListener('click', () => this.handleCellClick(row, col));
                }

                // 放置棋子
                const piece = board[row][col];
                if (piece) {
                    cell.classList.add('has-piece');
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('board-piece', piece);

                    // 检查是否是刚刚被翻转的棋子
                    const wasFlipped = flippedPieces.some(p => p.row === row && p.col === col);
                    if (wasFlipped) {
                        pieceElement.classList.add('flipping');
                        // 添加发光效果
                        pieceElement.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 215, 0, 0.5)';
                        // 动画结束后移除发光效果
                        setTimeout(() => {
                            pieceElement.style.boxShadow = '';
                        }, 600);
                    }

                    cell.appendChild(pieceElement);
                }

                this.boardElement.appendChild(cell);
            }
        }

        // 清除翻转记录
        if (flippedPieces.length > 0) {
            setTimeout(() => {
                this.gameLogic.lastFlippedPieces = [];
            }, 600);
        }
    }

    /**
     * 处理棋盘单元格点击
     */
    handleCellClick(row, col) {
        try {
            const currentPlayer = this.gameLogic.getCurrentPlayer();

            // 确保是有效落子位置
            if (this.gameLogic.isValidMove(row, col, currentPlayer)) {
                const previousPlayer = currentPlayer;

                // 执行落子
                this.gameLogic.placePiece(row, col);

                // 检查是否有玩家被跳过
                const nextPlayer = this.gameLogic.getCurrentPlayer();
                if (previousPlayer === nextPlayer && !this.gameLogic.isGameOver()) {
                    alert('对方无子可落，跳过回合！');
                }

                // 更新游戏信息
                this.updateGameInfo();

                // 渲染新棋盘
                this.renderBoard();

                // 检查游戏是否结束
                if (this.gameLogic.isGameOver()) {
                    this.showGameOver();
                    return;
                }

                // 如果是AI模式，触发AI回合
                if (this.gameMode.startsWith('ai-') && this.gameLogic.getCurrentPlayer() !== currentPlayer) {
                    this.handleAITurn();
                } else if (this.gameMode.startsWith('ai-') && previousPlayer === nextPlayer) {
                    // 如果对方（AI）被跳过，轮到我继续，不需要触发AI
                    // 但如果是AI vs AI（虽然这里不支持），或者特殊情况
                    // 这里如果是人玩，人落子 -> AI无子 -> 人继续。
                    // 所以不需要调用 handleAITurn。
                }
            }
        } catch (error) {
            console.error('处理点击时出错:', error);
        }
    }

    /**
     * 处理AI回合
     */
    handleAITurn() {
        this.isAITurn = true;
        console.log('AI Turn Started');

        // 设置AI难度
        const difficulty = this.gameMode.split('-')[1] || 'easy';
        this.aiPlayer.setDifficulty(difficulty);

        // 延迟AI落子，让用户能看到AI在思考
        setTimeout(() => {
            try {
                // 获取当前玩家颜色
                const currentPlayer = this.gameLogic.getCurrentPlayer();

                // 获取AI移动
                const aiMove = this.aiPlayer.getMove(this.gameLogic, currentPlayer);

                if (aiMove && aiMove.row !== undefined && aiMove.col !== undefined) {
                    const previousPlayer = currentPlayer;

                    // 执行AI落子
                    this.gameLogic.placePiece(aiMove.row, aiMove.col);

                    // 检查是否有玩家（用户）被跳过
                    const nextPlayer = this.gameLogic.getCurrentPlayer();
                    if (previousPlayer === nextPlayer && !this.gameLogic.isGameOver()) {
                        alert('您无子可落，跳过回合！');
                        // AI继续下
                        this.handleAITurn();
                        return; // 递归调用会设置自己的 isAITurn，所以这里直接返回
                    }

                    // 检查游戏是否结束
                    if (this.gameLogic.isGameOver()) {
                        this.isAITurn = false;
                        this.updateGameInfo();
                        this.renderBoard();
                        this.showGameOver();
                        return;
                    }

                    // 重置 isAITurn 标志（在渲染之前）
                    this.isAITurn = false;
                    console.log('AI Turn Completed');

                    // 更新游戏信息
                    this.updateGameInfo();

                    // 渲染新棋盘（现在 isAITurn 已经是 false）
                    this.renderBoard();
                } else {
                    // AI没有合法移动
                    console.warn('AI returned no move!');

                    // 防御性检查：如果当前仍然是AI的回合（意味着checkGameOver没有切换玩家），
                    // 强制切换回玩家，防止游戏卡死
                    if (this.gameLogic.getCurrentPlayer() === currentPlayer) {
                        console.warn('Force switching to player because AI has no moves');
                        this.gameLogic.switchPlayer();
                        this.gameLogic.checkGameOver();
                    }

                    // 重置 isAITurn 标志
                    this.isAITurn = false;

                    // 渲染新棋盘，显示玩家可以落子
                    this.renderBoard();
                }
            } catch (error) {
                console.error('AI选择移动时出错:', error);
                // 重置 isAITurn 标志
                this.isAITurn = false;
                // 渲染新棋盘，确保游戏能继续
                this.renderBoard();
            }
        }, 500);
        console.log('AI Turn Scheduled');
    }

    /**
     * 悔棋功能
     */
    undoMove() {
        // 在 AI 模式下，需要悔棋两步（玩家的一步 + AI 的一步）
        if (this.gameMode.startsWith('ai-')) {
            // 第一次悔棋（撤销 AI 的移动）
            if (this.gameLogic.undoMove()) {
                // 第二次悔棋（撤销玩家的移动）
                if (this.gameLogic.undoMove()) {
                    this.renderBoard();
                    this.updateGameInfo();
                } else {
                    // 如果只能撤销一步，说明是游戏开始，恢复第一次撤销
                    // 实际上这种情况不应该发生，因为游戏开始时没有移动可撤销
                    this.renderBoard();
                    this.updateGameInfo();
                }
            }
        } else {
            // 双人模式，只悔棋一步
            if (this.gameLogic.undoMove()) {
                this.renderBoard();
                this.updateGameInfo();
            }
        }
    }

    /**
     * 更新游戏信息
     */
    updateGameInfo() {
        const counts = this.gameLogic.getPieceCounts();
        this.blackCountElement.textContent = counts.black;
        this.whiteCountElement.textContent = counts.white;

        const currentPlayer = this.gameLogic.getCurrentPlayer();
        this.currentPlayerElement.textContent = `轮到${currentPlayer === 'black' ? '黑' : '白'}方`;
    }

    /**
     * 显示游戏结束
     */
    showGameOver() {
        this.gameInProgress = false; // 标记游戏结束

        const counts = this.gameLogic.getPieceCounts();
        let message = '';
        let playerWon = false;

        if (counts.black > counts.white) {
            message = '黑方获胜！';
            playerWon = true;
        } else if (counts.white > counts.black) {
            message = '白方获胜！';
        } else {
            message = '平局！';
        }

        // 如果玩家获胜，奖励额外次数
        if (playerWon) {
            this.gameLimit.awardVictory();
            message += ' 恭喜获得 +1 次游戏机会！';
            this.updateRemainingCount();
        }

        this.gameOverMessage.textContent = message;
        this.gameOverModal.style.display = 'flex';
    }

    /**
     * 更新剩余次数显示
     */
    updateRemainingCount() {
        const remaining = this.gameLimit.getRemainingGames();
        this.remainingCountElement.textContent = remaining;
    }

    /**
     * 处理分享按钮点击
     */
    handleShare() {
        const success = this.gameLimit.awardShare();

        if (success) {
            // 复制链接到剪贴板
            const gameUrl = window.location.href;
            navigator.clipboard.writeText(gameUrl).then(() => {
                this.shareMessage.textContent = '链接已复制到剪贴板！获得 +1 次游戏机会！';
            }).catch(() => {
                this.shareMessage.textContent = '获得 +1 次游戏机会！';
            });

            this.updateRemainingCount();
            this.shareModal.style.display = 'flex';
        } else {
            this.shareMessage.textContent = '今天已经分享过了，明天再来吧！';
            this.shareModal.style.display = 'flex';
        }
    }

    /**
     * 显示游戏次数用尽弹窗
     */
    showLimitModal() {
        this.limitModal.style.display = 'flex';
    }
}

// 导出GameController类
export default GameController;
