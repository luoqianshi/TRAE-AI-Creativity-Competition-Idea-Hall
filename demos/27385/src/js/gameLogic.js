/**
 * 黑白棋游戏核心逻辑模块
 */
class GameLogic {
    constructor() {
        this.boardSize = 8;
        this.board = this.initializeBoard();
        this.currentPlayer = 'black';
        this.previousBoards = []; // 用于悔棋功能
        this.gameOver = false;
    }

    /**
     * 初始化棋盘
     */
    initializeBoard() {
        // 创建8x8棋盘，初始化为null
        const board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));

        // 设置初始棋子位置
        board[3][3] = 'white'; // D4 白棋
        board[3][4] = 'black'; // E4 黑棋
        board[4][3] = 'black'; // D5 黑棋
        board[4][4] = 'white'; // E5 白棋

        return board;
    }

    /**
     * 检查坐标是否在棋盘范围内
     */
    isValidPosition(row, col) {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }

    /**
     * 获取当前玩家
     */
    getCurrentPlayer() {
        return this.currentPlayer;
    }

    /**
     * 获取棋盘状态
     */
    getBoard() {
        // 返回棋盘的深拷贝，避免外部直接修改
        const boardCopy = Array(this.boardSize);
        for (let i = 0; i < this.boardSize; i++) {
            boardCopy[i] = [...this.board[i]];
        }
        return boardCopy;
    }

    /**
     * 获取所有合法落子位置
     */
    getValidMoves(player) {
        const validMoves = [];

        // 遍历整个棋盘，检查每个位置是否是合法落子
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.isValidMove(row, col, player)) {
                    validMoves.push({ row, col });
                }
            }
        }

        return validMoves;
    }

    /**
     * 检查指定位置是否是合法落子
     */
    isValidMove(row, col, player) {
        if (!this.isValidPosition(row, col) || this.board[row][col] !== null) {
            return false;
        }

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [dr, dc] of directions) {
            if (this.hasFlippablePieces(row, col, dr, dc, player)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 检查指定方向是否有可翻转的棋子
     */
    hasFlippablePieces(row, col, dr, dc, player) {
        const opponent = player === 'black' ? 'white' : 'black';
        let currentRow = row + dr;
        let currentCol = col + dc;
        let hasOpponentPiece = false;

        // 沿着指定方向检查
        while (this.isValidPosition(currentRow, currentCol)) {
            const piece = this.board[currentRow][currentCol];

            if (piece === null) {
                return false; // 遇到空位，不满足条件
            }

            if (piece === opponent) {
                hasOpponentPiece = true;
            } else if (piece === player) {
                return hasOpponentPiece; // 找到己方棋子，且中间有对方棋子
            }

            currentRow += dr;
            currentCol += dc;
        }

        return false;
    }

    /**
     * 在指定位置落子
     */
    placePiece(row, col) {
        // 保存当前棋盘状态用于悔棋
        this.saveBoardState();

        // 放置棋子
        this.board[row][col] = this.currentPlayer;

        // 翻转所有方向的棋子，并记录被翻转的位置
        this.lastFlippedPieces = this.flipPieces(row, col);

        // 切换玩家
        this.switchPlayer();

        // 检查游戏是否结束
        this.checkGameOver();
    }

    /**
     * 翻转指定位置周围的所有可翻转棋子
     */
    flipPieces(row, col) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        let allFlippedPieces = [];
        for (const [dr, dc] of directions) {
            if (this.hasFlippablePieces(row, col, dr, dc, this.currentPlayer)) {
                const flipped = this.flipInDirection(row, col, dr, dc);
                allFlippedPieces = allFlippedPieces.concat(flipped);
            }
        }
        return allFlippedPieces;
    }

    /**
     * 沿指定方向翻转棋子
     */
    flipInDirection(row, col, dr, dc) {
        const opponent = this.currentPlayer === 'black' ? 'white' : 'black';
        let currentRow = row + dr;
        let currentCol = col + dc;
        let opponentPieces = [];

        // 首先找到所有需要翻转的对手棋子
        while (this.isValidPosition(currentRow, currentCol)) {
            const piece = this.board[currentRow][currentCol];

            if (piece === null) {
                return []; // 遇到空位，不满足条件
            }

            if (piece === opponent) {
                opponentPieces.push({ row: currentRow, col: currentCol });
            } else if (piece === this.currentPlayer) {
                // 找到己方棋子，翻转中间的对手棋子
                for (const pos of opponentPieces) {
                    this.board[pos.row][pos.col] = this.currentPlayer;
                }
                return opponentPieces; // 返回被翻转的棋子位置
            }

            currentRow += dr;
            currentCol += dc;
        }
        return []; // 没有找到己方棋子
    }

    /**
     * 切换玩家
     */
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
    }

    /**
     * 保存当前棋盘状态
     */
    saveBoardState() {
        // 使用更高效的方式复制棋盘
        const boardCopy = Array(this.boardSize);
        for (let i = 0; i < this.boardSize; i++) {
            boardCopy[i] = [...this.board[i]];
        }

        const state = {
            board: boardCopy,
            currentPlayer: this.currentPlayer
        };
        this.previousBoards.push(state);
    }

    /**
     * 悔棋功能
     */
    undoMove() {
        if (this.previousBoards.length > 0) {
            const prevState = this.previousBoards.pop();
            this.board = prevState.board;
            this.currentPlayer = prevState.currentPlayer;
            this.gameOver = false;
            return true;
        }
        return false;
    }

    /**
     * 检查游戏是否结束
     */
    checkGameOver() {
        // 优化：只需要获取一次移动列表
        const blackMoves = this.getValidMoves('black');
        const whiteMoves = this.getValidMoves('white');

        // 如果双方都没有合法落子，则游戏结束
        if (blackMoves.length === 0 && whiteMoves.length === 0) {
            this.gameOver = true;
            return true;
        }

        // 如果当前玩家没有合法移动，切换到对方玩家
        const currentPlayerMoves = this.getValidMoves(this.currentPlayer);
        if (currentPlayerMoves.length === 0) {
            this.switchPlayer();
        }

        // 游戏未结束
        this.gameOver = false;
        return false;
    }

    /**
     * 获取双方棋子数量
     */
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

    /**
     * 判断游戏是否已结束
     */
    isGameOver() {
        return this.gameOver;
    }
}

// 导出GameLogic类
export default GameLogic;
