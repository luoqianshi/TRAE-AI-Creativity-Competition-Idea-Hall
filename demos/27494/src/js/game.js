/**
 * 黑白棋游戏完整实现
 * 包含所有游戏逻辑和控制器
 */

// 游戏逻辑类
class GameLogic {
    constructor() {
        this.boardSize = 8;
        this.board = this.initializeBoard();
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.moveHistory = [];
        console.log('GameLogic初始化完成');
    }

    // 初始化棋盘
    initializeBoard() {
        const board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        board[3][3] = 'white';
        board[3][4] = 'black';
        board[4][3] = 'black';
        board[4][4] = 'white';
        return board;
    }

    // 检查坐标是否在棋盘范围内
    isValidPosition(row, col) {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }

    // 获取当前玩家
    getCurrentPlayer() {
        return this.currentPlayer;
    }

    // 获取棋盘状态
    getBoard() {
        const boardCopy = Array(this.boardSize);
        for (let i = 0; i < this.boardSize; i++) {
            boardCopy[i] = [...this.board[i]];
        }
        return boardCopy;
    }

    // 获取所有合法落子位置
    getValidMoves(player) {
        const validMoves = [];
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.isValidMove(row, col, player)) {
                    validMoves.push({ row, col });
                }
            }
        }
        return validMoves;
    }

    // 检查指定位置是否是合法落子
    isValidMove(row, col, player) {
        if (!this.isValidPosition(row, col) || this.board[row][col] !== null) {
            return false;
        }

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dr, dc] of directions) {
            if (this.hasFlippablePieces(row, col, dr, dc, player)) {
                return true;
            }
        }

        return false;
    }

    // 检查指定方向是否有可翻转的棋子
    hasFlippablePieces(row, col, dr, dc, player) {
        const opponent = player === 'black' ? 'white' : 'black';
        let currentRow = row + dr;
        let currentCol = col + dc;
        let hasOpponentPiece = false;

        while (this.isValidPosition(currentRow, currentCol)) {
            const piece = this.board[currentRow][currentCol];
            
            if (piece === null) {
                return false;
            }
            
            if (piece === opponent) {
                hasOpponentPiece = true;
            } else if (piece === player) {
                return hasOpponentPiece;
            }
            
            currentRow += dr;
            currentCol += dc;
        }

        return false;
    }

    // 在指定位置落子
    placePiece(row, col) {
        console.log(`GameLogic.placePiece: 玩家 ${this.currentPlayer} 尝试在 (${row}, ${col}) 落子`);
        
        if (!this.isValidMove(row, col, this.currentPlayer)) {
            console.log(`GameLogic.placePiece: 位置 (${row}, ${col}) 无效`);
            return false;
        }
        
        // 记录移动历史（包含完整的棋盘状态，用于悔棋）
        const nextPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.moveHistory.push({
            player: this.currentPlayer,
            row: row,
            col: col,
            board: this.getBoard(), // 保存完整的棋盘状态
            nextPlayer: nextPlayer,
            timestamp: new Date().toISOString()
        });
        
        // 记录最后落子位置
        this.lastPlacedPiece = { player: this.currentPlayer, row: row, col: col };
        
        this.board[row][col] = this.currentPlayer;
        const flippedCount = this.flipPieces(row, col);
        console.log(`GameLogic.placePiece: 翻转了 ${flippedCount} 个棋子`);
        
        this.switchPlayer();
        this.checkGameOver();
        
        console.log(`GameLogic.placePiece: 落子成功，切换到玩家 ${this.currentPlayer}`);
        return true;
    }

    // 翻转指定位置周围的所有可翻转棋子
    flipPieces(row, col) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        let totalFlipped = 0;

        for (const [dr, dc] of directions) {
            if (this.hasFlippablePieces(row, col, dr, dc, this.currentPlayer)) {
                const flipped = this.flipInDirection(row, col, dr, dc);
                totalFlipped += flipped;
            }
        }
        
        return totalFlipped;
    }

    // 沿指定方向翻转棋子
    flipInDirection(row, col, dr, dc) {
        const opponent = this.currentPlayer === 'black' ? 'white' : 'black';
        let currentRow = row + dr;
        let currentCol = col + dc;
        let flippedCount = 0;

        while (this.isValidPosition(currentRow, currentCol) && this.board[currentRow][currentCol] === opponent) {
            this.board[currentRow][currentCol] = this.currentPlayer;
            flippedCount++;
            currentRow += dr;
            currentCol += dc;
        }
        
        return flippedCount;
    }

    // 切换玩家
    switchPlayer() {
        const oldPlayer = this.currentPlayer;
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        console.log(`🔄 玩家切换：${oldPlayer} -> ${this.currentPlayer}`);
    }

    // 检查游戏是否结束
    checkGameOver() {
        const blackMoves = this.getValidMoves('black');
        const whiteMoves = this.getValidMoves('white');
        
        if (blackMoves.length === 0 && whiteMoves.length === 0) {
            this.gameOver = true;
            return true;
        }
        
        this.gameOver = false;
        return false;
    }

    // 检查当前玩家是否有有效移动，如果没有则切换玩家
    checkCurrentPlayerMoves() {
        const currentPlayer = this.getCurrentPlayer();
        const validMoves = this.getValidMoves(currentPlayer);
        
        if (validMoves.length === 0) {
            // 当前玩家没有有效移动，切换到对手
            this.switchPlayer();
            
            // 检查对手是否有有效移动
            const opponent = this.getCurrentPlayer();
            const opponentMoves = this.getValidMoves(opponent);
            
            if (opponentMoves.length === 0) {
                // 双方都没有有效移动，游戏结束
                this.gameOver = true;
                return false;
            }
            
            return true; // 已切换玩家
        }
        
        return false; // 当前玩家有有效移动，不需要切换
    }

    // 获取双方棋子数量
    getPieceCounts() {
        const counts = { black: 0, white: 0 };
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    counts[piece]++;
                }
            }
        }
        
        return counts;
    }

    // 判断游戏是否已结束
    isGameOver() {
        return this.gameOver;
    }
}

// AI玩家类
class AIPlayer {
    constructor(difficulty = 'easy') {
        this.difficulty = difficulty;
    }

    // 设置AI难度
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    // 获取AI的落子位置
    getMove(gameLogic, playerColor) {
        const validMoves = gameLogic.getValidMoves(playerColor);
        
        if (validMoves.length === 0) {
            return null;
        }

        const boardSize = gameLogic.boardSize;

        // 简单难度：偏向选择翻转较少棋子的位置（让对手有更多机会）
        if (this.difficulty === 'easy') {
            // 计算每个位置的翻转数量
            const movesWithFlips = validMoves.map(move => ({
                move: move,
                flips: this.countFlips(gameLogic, move, playerColor)
            }));
            
            // 按翻转数量排序，选择翻转较少的位置
            movesWithFlips.sort((a, b) => a.flips - b.flips);
            
            // 从前30%的少翻转位置中随机选择
            const easyCount = Math.max(1, Math.ceil(movesWithFlips.length * 0.3));
            const easyMoves = movesWithFlips.slice(0, easyCount);
            const randomIndex = Math.floor(Math.random() * easyMoves.length);
            
            console.log(`简单AI：选择翻转${easyMoves[randomIndex].flips}个棋子的位置`);
            return easyMoves[randomIndex].move;
        }

        // 中等难度：平衡策略，考虑位置和翻转数量
        if (this.difficulty === 'medium') {
            let bestMove = null;
            let bestScore = -1000;
            
            for (const move of validMoves) {
                let score = 0;
                const flips = this.countFlips(gameLogic, move, playerColor);
                
                // 翻转数量得分（适中最好）
                if (flips >= 2 && flips <= 4) {
                    score += 10; // 适中的翻转数量
                } else if (flips > 4) {
                    score += 5;  // 翻转太多可能不是最好
                } else {
                    score += 3;  // 翻转太少
                }
                
                // 位置得分
                if ((move.row === 0 || move.row === boardSize - 1) && 
                    (move.col === 0 || move.col === boardSize - 1)) {
                    score += 15; // 角落很有价值
                } else if (move.row === 0 || move.row === boardSize - 1 || 
                           move.col === 0 || move.col === boardSize - 1) {
                    score += 5;  // 边缘位置
                }
                
                // 避免靠近角落的边缘位置（容易被对手利用）
                if ((move.row === 1 && move.col === 1) || 
                    (move.row === 1 && move.col === boardSize - 2) ||
                    (move.row === boardSize - 2 && move.col === 1) ||
                    (move.row === boardSize - 2 && move.col === boardSize - 2)) {
                    score -= 8; // 这些位置很危险
                }
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
            
            console.log(`中等AI：选择得分${bestScore}的位置`);
            return bestMove;
        }

        // 困难难度：高级策略，考虑长期布局和稳定性
        if (this.difficulty === 'hard') {
            let bestMove = null;
            let bestScore = -1000;
            
            // 首先检查是否有角落位置可用 - 抢角是最高优先级
            const cornerMoves = validMoves.filter(move => 
                (move.row === 0 || move.row === boardSize - 1) && 
                (move.col === 0 || move.col === boardSize - 1)
            );
            
            if (cornerMoves.length > 0) {
                console.log(`困难AI：发现${cornerMoves.length}个角落位置，优先抢占！`);
                // 如果有多个角落，选择能翻转更多棋子的
                if (cornerMoves.length > 1) {
                    let bestCorner = cornerMoves[0];
                    let maxCornerFlips = 0;
                    for (const corner of cornerMoves) {
                        const cornerFlips = this.countFlips(gameLogic, corner, playerColor);
                        if (cornerFlips > maxCornerFlips) {
                            maxCornerFlips = cornerFlips;
                            bestCorner = corner;
                        }
                    }
                    return bestCorner;
                }
                return cornerMoves[0];
            }
            
            // 如果没有角落，使用综合评分策略
            for (const move of validMoves) {
                let score = 0;
                const flips = this.countFlips(gameLogic, move, playerColor);
                
                // 边缘位置（次优先级）
                if (move.row === 0 || move.row === boardSize - 1 || 
                    move.col === 0 || move.col === boardSize - 1) {
                    score += 15; // 提高边缘位置优先级
                }
                
                // 强烈避免危险位置（靠近角落的边缘）
                if ((move.row === 1 && move.col === 1) || 
                    (move.row === 1 && move.col === boardSize - 2) ||
                    (move.row === boardSize - 2 && move.col === 1) ||
                    (move.row === boardSize - 2 && move.col === boardSize - 2)) {
                    score -= 25; // 大幅提高惩罚
                }
                
                // 游戏分阶段策略
                const totalPieces = gameLogic.getPieceCounts().black + gameLogic.getPieceCounts().white;
                if (totalPieces < 20) {
                    // 早期：少翻转，保持灵活性，优先抢占好位置
                    if (flips <= 2) score += 15;
                    else if (flips <= 4) score += 8;
                    else score -= 8;
                }
                else if (totalPieces < 40) {
                    // 中期：适中翻转，积极扩张
                    if (flips >= 2 && flips <= 5) score += 12;
                    else if (flips > 5) score += 5;
                }
                else {
                    // 后期：多翻转，争取胜利
                    score += flips * 3;
                }
                
                // 稳定性奖励（边缘和角落更稳定）
                if (this.isStablePosition(gameLogic, move, playerColor)) {
                    score += 18; // 提高稳定性奖励
                }
                
                // 控制中心区域奖励（在适当时机）
                if (move.row >= 2 && move.row <= boardSize-3 && 
                    move.col >= 2 && move.col <= boardSize-3) {
                    if (totalPieces > 30) { // 中后期控制中心有利
                        score += 5;
                    }
                }
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
            
            console.log(`困难AI：选择得分${bestScore}的位置，最高得分${bestScore}`);
            return bestMove || validMoves[0];
        }

        return validMoves[0];
    }

    // 计算一个移动能翻转多少棋子
    countFlips(gameLogic, move, playerColor) {
        let flips = 0;
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dr, dc] of directions) {
            if (gameLogic.hasFlippablePieces(move.row, move.col, dr, dc, playerColor)) {
                let currentRow = move.row + dr;
                let currentCol = move.col + dc;
                const opponent = playerColor === 'black' ? 'white' : 'black';

                while (gameLogic.isValidPosition(currentRow, currentCol) && 
                       gameLogic.board[currentRow][currentCol] === opponent) {
                    flips++;
                    currentRow += dr;
                    currentCol += dc;
                }
            }
        }

        return flips;
    }

    // 判断位置是否稳定（不会被对手轻易翻转）
    isStablePosition(gameLogic, move, playerColor) {
        const boardSize = gameLogic.boardSize;
        
        // 角落位置总是稳定的
        if ((move.row === 0 || move.row === boardSize - 1) && 
            (move.col === 0 || move.col === boardSize - 1)) {
            return true;
        }
        
        // 边缘位置如果相邻有同色棋子，相对稳定
        if (move.row === 0 || move.row === boardSize - 1 || 
            move.col === 0 || move.col === boardSize - 1) {
            return true;
        }
        
        return false;
    }
}

// 游戏控制器类
class GameController {
    constructor() {
        this.gameLogic = new GameLogic();
        this.aiPlayer = new AIPlayer();
        this.gameMode = 'ai-easy';  // 默认人机模式，简化掉双人对战
        this.isAITurn = false;
        this.clickCount = 0;
        this.initializeDOM();
        this.initializeGame();
        this.setupGlobalDebugging();
        this.updateDebugPanel();
    }

    // 初始化DOM引用
    initializeDOM() {
        this.boardElement = document.querySelector('.game-board');
        this.blackCountElement = document.getElementById('black-count');
        this.whiteCountElement = document.getElementById('white-count');
        this.currentPlayerElement = document.getElementById('current-player');
        this.newGameButton = document.getElementById('new-game-btn');
        this.undoButton = document.getElementById('undo-btn');
        this.rulesButton = document.getElementById('rules-btn');
        this.rulesModal = document.getElementById('rules-modal');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.gameOverMessage = document.getElementById('game-over-message');
        this.playAgainButton = document.getElementById('play-again-btn');
        this.closeModalButton = document.querySelector('.close-modal');
        this.modeOptions = document.querySelectorAll('input[name="mode"]');
    }

    // 初始化游戏
    initializeGame() {
        this.setupEventListeners();
        this.setupOtherEventListeners();
        this.resetGame();
    }
    }
    
    // 设置全局调试功能
    setupGlobalDebugging() {
        console.log('全局调试功能已启用');
        
        // 添加键盘快捷键调试
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey) {
                switch(e.key) {
                    case 'D':
                        console.log('=== 游戏状态调试信息 ===');
                        console.log('当前玩家:', this.gameLogic.getCurrentPlayer());
                        console.log('AI回合状态:', this.isAITurn);
                        console.log('游戏模式:', this.gameMode);
                        console.log('游戏结束:', this.gameLogic.isGameOver());
                        console.log('移动历史:', this.gameLogic.moveHistory);
                        console.log('有效移动:', this.gameLogic.getValidMoves(this.gameLogic.getCurrentPlayer()));
                        console.log('=== 结束调试信息 ===');
                        break;
                    case 'R':
                        console.log('强制重新渲染棋盘');
                        this.renderBoard();
                        break;
                }
            }
        });
        
        // 添加右键菜单调试
        document.addEventListener('contextmenu', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                console.log('右键调试菜单触发');
                console.log('当前游戏状态:', {
                    currentPlayer: this.gameLogic.getCurrentPlayer(),
                    isAITurn: this.isAITurn,
                    gameMode: this.gameMode,
                    validMoves: this.gameLogic.getValidMoves(this.gameLogic.getCurrentPlayer())
                });
            }
        });
    }
    
    // 更新调试面板
    updateDebugPanel() {
        const debugPanel = document.getElementById('debug-panel');
        if (!debugPanel) return;
        
        // 显示调试面板（可以按 F12 切换显示/隐藏）
        const showDebug = localStorage.getItem('showDebug') === 'true';
        debugPanel.style.display = showDebug ? 'block' : 'none';
        
        if (!showDebug) return;
        
        try {
            const currentPlayer = this.gameLogic.getCurrentPlayer();
            const validMoves = this.gameLogic.getValidMoves(currentPlayer);
            const lastMove = this.gameLogic.moveHistory[this.gameLogic.moveHistory.length - 1];
            
            document.getElementById('click-count').textContent = this.clickCount;
            document.getElementById('debug-current-player').textContent = currentPlayer;
            document.getElementById('debug-ai-turn').textContent = this.isAITurn ? '是' : '否';
            document.getElementById('debug-valid-moves').textContent = validMoves.length;
            document.getElementById('debug-game-mode').textContent = this.gameMode.replace('ai-', '');
            document.getElementById('debug-last-move').textContent = lastMove ? 
                `${lastMove.player}在(${lastMove.row},${lastMove.col})` : '无';
        } catch (error) {
            console.error('更新调试面板失败:', error);
        }
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 新游戏按钮
        this.newGameButton.addEventListener('click', () => {
            this.resetGame();
        });
        
        // 悔棋按钮
        this.undoButton.addEventListener('click', () => {
            this.undoMove();
        });
        
        // 添加全局点击调试
        document.addEventListener('click', (e) => {
            this.clickCount++;
            console.log(`[全局点击#${this.clickCount}] 目标元素:`, e.target);
            console.log(`[全局点击#${this.clickCount}] 点击坐标: (${e.clientX}, ${e.clientY})`);
            
            // 检查是否点击了棋盘格子
            const cell = e.target.closest('.board-cell');
            if (cell) {
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                console.log(`[全局点击#${this.clickCount}] 点击了棋盘格子: (${row}, ${col})`);
                console.log(`[全局点击#${this.clickCount}] 格子类名:`, cell.className);
                console.log(`[全局点击#${this.clickCount}] 是否有有效移动类:`, cell.classList.contains('valid-move'));
            }
            
            this.updateDebugPanel();
        });
        
        // F12键切换调试面板显示
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12') {
                e.preventDefault();
                const current = localStorage.getItem('showDebug') === 'true';
                localStorage.setItem('showDebug', !current);
                this.updateDebugPanel();
                console.log(`调试面板 ${!current ? '显示' : '隐藏'}`);
            }
        });
        
        // 规则按钮
        this.rulesButton.addEventListener('click', () => {
            this.rulesModal.style.display = 'flex';
        });
    }
    
    // 设置其他事件监听器
    setupOtherEventListeners() {
        // 关闭弹窗按钮
        this.closeModalButton.addEventListener('click', () => {
            this.rulesModal.style.display = 'none';
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

    // 重置游戏
    resetGame() {
        // 清理所有事件监听器
        this.removeAllCellListeners();
        
        // 重置游戏状态
        this.gameLogic = new GameLogic();
        this.aiPlayer = new AIPlayer();
        this.isAITurn = false;
        
        // 更新界面
        this.renderBoard();
        this.updateGameInfo();
        
        if (this.gameOverModal) {
            this.gameOverModal.style.display = 'none';
        }
    }
    
    // 悔棋功能
    undoMove() {
        console.log('悔棋操作开始');
        
        // 检查是否有移动历史
        if (this.gameLogic.moveHistory.length === 0) {
            console.log('没有可悔棋的移动');
            return;
        }
        
        // 撤销两步（玩家和AI的一步）
        let stepsToUndo = 2;
        let historyLength = this.gameLogic.moveHistory.length;
        
        // 创建新的游戏逻辑对象，不包含要撤销的步骤
        const newGameLogic = new GameLogic(); // 这会自动初始化棋盘
        newGameLogic.moveHistory = this.gameLogic.moveHistory.slice(0, historyLength - stepsToUndo);
        
        // 只有当有保留的移动历史时才重新播放
        if (newGameLogic.moveHistory.length > 0) {
            for (const move of newGameLogic.moveHistory) {
                newGameLogic.board = JSON.parse(JSON.stringify(move.board));
                newGameLogic.currentPlayer = move.nextPlayer || 'black';
            }
        }
        // 否则保持初始棋盘状态
        
        // 重置游戏状态
        this.gameLogic = newGameLogic;
        this.isAITurn = false; // 悔棋后回到玩家回合
        this.gameLogic.gameOver = false;
        
        // 更新界面
        this.renderBoard();
        this.updateGameInfo();
        
        console.log('悔棋操作完成');
        console.log('当前移动历史:', this.gameLogic.moveHistory);
    }

    // 渲染棋盘
    renderBoard() {
        console.log('开始渲染棋盘');
        console.log(`AI回合状态: ${this.isAITurn}`);
        console.log(`当前游戏模式: ${this.gameMode}`);
        
        // 清空棋盘前先移除所有事件监听器
        this.removeAllCellListeners();
        
        this.boardElement.innerHTML = '';
        const board = this.gameLogic.getBoard();
        const currentPlayer = this.gameLogic.getCurrentPlayer();
        const validMoves = this.gameLogic.getValidMoves(currentPlayer);
        
        console.log(`🔄 当前玩家: ${currentPlayer}`);
        console.log(`🔄 有效移动数量: ${validMoves.length}`);
        console.log(`🔄 有效移动位置: ${JSON.stringify(validMoves)}`);
        
        if (validMoves.length === 0) {
            console.log('⚠️ 警告：当前玩家没有有效移动！');
            alert(`⚠️ 玩家 ${currentPlayer} 没有有效移动，游戏可能卡住！`);
        }
        
        // 获取最后落子位置
        const lastPlaced = this.gameLogic.lastPlacedPiece;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.classList.add('board-cell');
                cell.dataset.row = row;
                cell.dataset.col = col;

                // 检查是否是合法落子位置
                const isValidMove = validMoves.some(move => move.row === row && move.col === col);
                console.log(`位置 (${row}, ${col}): 棋子=${board[row][col]}, 是否有效=${isValidMove}`);
                
                if (isValidMove && !this.isAITurn && !this.gameLogic.isGameOver()) {
                    // 获取当前游戏难度
                    const difficulty = this.gameMode.split('-')[1] || 'easy';
                    
                    // 困难模式下不显示任何提示（包括小黑点和背景色）
                    const shouldShowHint = !(difficulty === 'hard');
                    
                    // 只有在需要显示提示时才添加valid-move类（会显示小黑点）
                    if (shouldShowHint) {
                        cell.classList.add('valid-move');
                        // 简洁的有效位置标记
                        cell.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
                    }
                    console.log(`位置 (${row}, ${col}) 添加点击事件`);
                    cell.style.cursor = 'pointer';
                    
                    // 使用具名函数，便于后续移除事件监听器
                    const handleCellInteraction = (e) => {
                        console.log(`交互事件触发: 位置 (${row}, ${col})`);
                        try {
                            e.preventDefault();
                            e.stopPropagation();
                            this.handleCellClick(row, col);
                        } catch (error) {
                            console.error(`交互处理器错误:`, error);
                        }
                    };
                    
                    // 添加点击事件
                    cell.addEventListener('click', handleCellInteraction);
                    // 添加触摸事件支持
                    cell.addEventListener('touchstart', (e) => {
                        // 阻止默认行为（防止页面滚动）
                        e.preventDefault();
                    }, { passive: false });
                    cell.addEventListener('touchend', handleCellInteraction);
                    
                    // 将事件处理器存储在元素上，便于后续清理
                    cell._clickHandler = handleCellInteraction;
                    
                    console.log(`✅ 位置 (${row}, ${col}) 点击事件已绑定！`);
                    
                    // 添加鼠标悬停效果，让用户知道可以点击
                    cell.style.cursor = 'pointer';
                }

                // 放置棋子
                const piece = board[row][col];
                if (piece) {
                    cell.classList.add('has-piece');
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('board-piece', piece);
                    cell.appendChild(pieceElement);
                    
                    // 高亮显示最后一步落子
                    if (lastPlaced && lastPlaced.row === row && lastPlaced.col === col) {
                        cell.style.border = '3px solid #ff6b6b';
                        cell.style.boxShadow = '0 0 15px rgba(255, 107, 107, 0.8)';
                        cell.title = `最后落子: ${piece === 'black' ? '黑棋' : '白棋'}`;
                        
                        // 3秒后移除高亮
                        setTimeout(() => {
                            cell.style.border = '';
                            cell.style.boxShadow = '';
                            cell.title = '';
                        }, 3000);
                    }
                }

                this.boardElement.appendChild(cell);
            }
        }
        console.log('棋盘渲染完成');
        
        // 更新调试面板
        this.updateDebugPanel();
    }

    // 移除所有棋盘格子的点击事件监听器
    removeAllCellListeners() {
        const cells = this.boardElement.querySelectorAll('.board-cell');
        cells.forEach(cell => {
            if (cell._clickHandler) {
                cell.removeEventListener('click', cell._clickHandler);
                delete cell._clickHandler;
            }
        });
    }

    // 处理棋盘单元格点击
    handleCellClick(row, col) {
        console.log(`🎯 [handleCellClick] 点击位置: (${row}, ${col})`);
        console.log(`🎯 [handleCellClick] AI回合状态: ${this.isAITurn}`);
        console.log(`🎯 [handleCellClick] 游戏模式: ${this.gameMode}`);
        console.log(`🎯 [handleCellClick] 游戏结束状态: ${this.gameLogic.isGameOver()}`);
        
        try {
            // 检查是否是AI回合
            if (this.isAITurn) {
                console.log('❌ [handleCellClick] AI回合中，忽略点击');
                alert('❌ 现在是AI回合，请等待AI完成！');
                return;
            }
            
            // 检查游戏是否结束
            if (this.gameLogic.isGameOver()) {
                console.log('❌ [handleCellClick] 游戏已结束');
                alert('❌ 游戏已结束！');
                return;
            }
            
            const currentPlayer = this.gameLogic.getCurrentPlayer();
            console.log(`[handleCellClick] 当前玩家: ${currentPlayer}`);
            
            // 确保是有效落子位置
            const isValidMove = this.gameLogic.isValidMove(row, col, currentPlayer);
            console.log(`[handleCellClick] 位置 (${row}, ${col}) 是否有效: ${isValidMove}`);
            
            if (isValidMove) {
                console.log(`[handleCellClick] 执行落子: 玩家 ${currentPlayer} 在 (${row}, ${col})`);
                // 执行落子
                const success = this.gameLogic.placePiece(row, col);
                
                if (success) {
                    console.log('[handleCellClick] 落子成功');
                    // 更新游戏信息
                    this.updateGameInfo();
                    
                    console.log('[handleCellClick] 开始重新渲染棋盘');
                    // 渲染新棋盘
                    this.renderBoard();
                    
                    // 检查游戏是否结束
                    if (this.gameLogic.isGameOver()) {
                        console.log('[handleCellClick] 游戏结束');
                        this.showGameOver();
                        return;
                    }
                    
                    // 触发AI回合
                    console.log('[handleCellClick] 触发AI回合');
                    this.handleAITurn();
                    
                    // 更新调试面板
                    this.updateDebugPanel();
                } else {
                    console.log('[handleCellClick] 落子失败');
                }
            } else {
                console.log(`[handleCellClick] 位置 (${row}, ${col}) 不是有效落子位置`);
                // 显示无效点击的视觉效果
                this.showInvalidMoveEffect(row, col);
            }
        } catch (error) {
            console.error('[handleCellClick] 处理点击时出错:', error);
        }
    }

    // 显示无效移动的视觉效果
    showInvalidMoveEffect(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
            setTimeout(() => {
                cell.style.backgroundColor = '';
            }, 500);
        }
    }

    // 处理AI回合
    handleAITurn() {
        console.log('开始AI回合处理');
        try {
            // 确保AI回合标志正确设置
            this.isAITurn = true;
            console.log('AI回合标志已设置');
            
            // 设置AI难度
            const difficulty = this.gameMode.split('-')[1] || 'easy';
            this.aiPlayer.setDifficulty(difficulty);
            console.log(`AI难度: ${difficulty}`);
            
            // 延迟AI落子，让用户能看到AI在思考
            setTimeout(() => {
                try {
                    console.log('AI开始选择移动');
                    // 获取AI移动
                    const aiMove = this.aiPlayer.getMove(this.gameLogic, 'white');
                    console.log(`AI选择的移动: ${JSON.stringify(aiMove)}`);
                    
                    if (aiMove && aiMove.row !== undefined && aiMove.col !== undefined) {
                        console.log(`AI执行落子: (${aiMove.row}, ${aiMove.col})`);
                        // 执行AI落子
                        const success = this.gameLogic.placePiece(aiMove.row, aiMove.col);
                        
                        if (success) {
                            console.log('AI落子成功');
                            // 更新游戏信息
                            this.updateGameInfo();
                            
                            // 渲染新棋盘
                            this.renderBoard();
                            
                            // 检查游戏是否结束
                            if (this.gameLogic.isGameOver()) {
                                console.log('游戏结束');
                                this.showGameOver();
                                return;
                            }
                        }
                    } else {
                        console.log('AI没有有效移动');
                        // AI没有有效移动，检查是否需要切换玩家
                        this.gameLogic.checkCurrentPlayerMoves();
                        this.updateGameInfo();
                        this.renderBoard();
                    }
                } catch (error) {
                    console.error('AI选择移动时出错:', error);
                } finally {
                    // 确保AI回合标志正确清除
                    this.isAITurn = false;
                    console.log('✅ AI回合标志已清除');
                    
                    // 检查切换后的玩家是否有有效移动
                    const nextPlayer = this.gameLogic.getCurrentPlayer();
                    const nextValidMoves = this.gameLogic.getValidMoves(nextPlayer);
                    console.log(`🔄 切换到玩家 ${nextPlayer}，有效移动数量: ${nextValidMoves.length}`);
                    
                    if (nextValidMoves.length === 0) {
                        console.log('⚠️ 切换后的玩家没有有效移动，需要继续切换！');
                        // 如果当前玩家没有移动，尝试切换回另一个玩家
                        this.gameLogic.switchPlayer();
                        const checkAgainPlayer = this.gameLogic.getCurrentPlayer();
                        const checkAgainMoves = this.gameLogic.getValidMoves(checkAgainPlayer);
                        console.log(`🔄 再次切换到玩家 ${checkAgainPlayer}，有效移动数量: ${checkAgainMoves.length}`);
                        
                        if (checkAgainMoves.length === 0) {
                            console.log('🏁 双方都没有有效移动，游戏结束！');
                            this.showGameOver();
                            return;
                        }
                    }
                    
                    // 重新渲染棋盘显示新的有效移动
                    this.renderBoard();
                    
                    // 更新调试面板
                    this.updateDebugPanel();
                }
            }, 500);
        } catch (error) {
            console.error('处理AI回合时出错:', error);
            this.isAITurn = false;
        }
    }

    // 更新游戏信息
    updateGameInfo() {
        const counts = this.gameLogic.getPieceCounts();
        this.blackCountElement.textContent = counts.black;
        this.whiteCountElement.textContent = counts.white;
        
        const currentPlayer = this.gameLogic.getCurrentPlayer();
        let playerText = `轮到${currentPlayer === 'black' ? '黑' : '白'}方`;
        
        // 添加AI状态提示
        if (this.isAITurn) {
            playerText += ' (AI思考中...)';  
        }
        
        // 添加有效移动数量提示
        const validMoves = this.gameLogic.getValidMoves(currentPlayer);
        if (validMoves.length === 0) {
            playerText += ' 【无有效移动】';
        } else {
            playerText += ` 【${validMoves.length}个可下位置】`;
        }
        
        this.currentPlayerElement.textContent = playerText;
        
        // 更新调试面板
        this.updateDebugPanel();
    }

    // 显示游戏结束
    showGameOver() {
        const counts = this.gameLogic.getPieceCounts();
        let message = '';
        
        if (counts.black > counts.white) {
            message = '黑方获胜！';
        } else if (counts.white > counts.black) {
            message = '白方获胜！';
        } else {
            message = '平局！';
        }
        
        this.gameOverMessage.textContent = message;
        this.gameOverModal.style.display = 'flex';
    }
}

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，开始初始化游戏');
    // 创建游戏控制器实例
    const gameController = new GameController();
    
    // 添加测试功能：按T键测试困难AI的抢角行为
    document.addEventListener('keydown', (e) => {
        if (e.key === 't' || e.key === 'T') {
            console.log('🧪 测试困难AI抢角行为...');
            // 切换到困难模式
            const hardModeRadio = document.querySelector('input[value="ai-hard"]');
            if (hardModeRadio) {
                hardModeRadio.checked = true;
                gameController.gameMode = 'ai-hard';
                gameController.resetGame();
                console.log('🧪 已切换到困难模式，观察AI是否会抢角！');
            }
        }
        
        // 按C键创建角落测试场景
        if (e.key === 'c' || e.key === 'C') {
            console.log('🧪 创建角落测试场景...');
            gameController.gameMode = 'ai-hard';
            gameController.resetGame();
            
            // 手动设置棋盘，创造一个角落可用的场景
            const board = gameController.gameLogic.getBoard();
            
            // 清空棋盘
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    board[i][j] = null;
                }
            }
            
            // 设置一些棋子，让角落位置(0,0)对黑棋有效
            board[0][1] = 'white';
            board[1][0] = 'white';
            board[1][1] = 'black';
            board[3][3] = 'black';
            board[3][4] = 'white';
            board[4][3] = 'white';
            board[4][4] = 'black';
            
            // 设置当前玩家为黑棋（AI）
            gameController.gameLogic.currentPlayer = 'black';
            
            console.log('🧪 已创建角落测试场景，当前棋盘状态:');
            console.log('🧪 棋盘数组:', JSON.stringify(board));
            
            // 检查角落是否有效
            const validMoves = gameController.gameLogic.getValidMoves('black');
            console.log('🧪 黑棋的有效移动:', validMoves);
            const cornerAvailable = validMoves.some(move => move.row === 0 && move.col === 0);
            console.log('🧪 角落(0,0)是否有效:', cornerAvailable);
            
            // 强制AI走一步
            setTimeout(() => {
                console.log('🧪 强制AI执行移动...');
                gameController.makeAIMove();
            }, 1000);
        }
    });
});

// 添加全局点击事件监听器来调试
document.addEventListener('click', (e) => {
    console.log('全局点击事件:', e.target);
    if (e.target.classList.contains('board-cell')) {
        console.log('点击了棋盘格子:', e.target.dataset);
    }
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
