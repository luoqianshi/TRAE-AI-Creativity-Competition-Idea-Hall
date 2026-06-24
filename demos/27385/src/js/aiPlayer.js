/**
 * AI玩家模块
 * 实现不同难度级别的AI逻辑
 */
import GameLogic from './gameLogic.js';

class AIPlayer {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
    }

    /**
     * 设置AI难度
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    /**
     * 获取AI的落子位置
     */
    getMove(gameLogic, playerColor) {
        const validMoves = gameLogic.getValidMoves(playerColor);

        if (validMoves.length === 0) {
            return null;
        }

        let selectedMove;
        switch (this.difficulty) {
            case 'easy':
                selectedMove = this.getEasyMove(validMoves);
                break;
            case 'medium':
                selectedMove = this.getMediumMove(gameLogic, validMoves, playerColor);
                break;
            case 'hard':
                selectedMove = this.getHardMove(gameLogic, validMoves, playerColor);
                break;
            default:
                selectedMove = this.getMediumMove(gameLogic, validMoves, playerColor);
        }

        return selectedMove;
    }

    /**
     * 简单难度AI：随机选择一个合法位置
     */
    getEasyMove(validMoves) {
        const randomIndex = Math.floor(Math.random() * validMoves.length);
        return validMoves[randomIndex];
    }

    /**
     * 中等难度AI：使用2层搜索和优化的评估函数
     */
    getMediumMove(gameLogic, validMoves, playerColor) {
        let bestMove = null;
        let bestScore = -Infinity;
        const opponentColor = playerColor === 'black' ? 'white' : 'black';

        // 对每个可能的移动进行2层搜索评估
        for (const move of validMoves) {
            // 创建临时游戏状态进行模拟
            const tempGame = this.cloneGameLogic(gameLogic);
            tempGame.currentPlayer = playerColor;

            // 模拟落子
            tempGame.placePiece(move.row, move.col);

            // 使用极小极大算法评估这一步，搜索深度为2
            const score = this.minimax(tempGame, 2, -Infinity, Infinity, false, playerColor, opponentColor);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove || validMoves[0];
    }

    /**
     * 困难难度AI：使用极小极大算法，考虑未来更多步
     */
    getHardMove(gameLogic, validMoves, playerColor) {
        let bestMove = null;
        let bestScore = -Infinity;
        const opponentColor = playerColor === 'black' ? 'white' : 'black';

        // 对每个可能的移动进行评估
        for (const move of validMoves) {
            // 创建临时游戏状态进行模拟
            const tempGame = this.cloneGameLogic(gameLogic);
            tempGame.currentPlayer = playerColor;

            // 模拟落子
            tempGame.placePiece(move.row, move.col);

            // 使用极小极大算法评估这一步，搜索深度为3
            const score = this.minimax(tempGame, 3, -Infinity, Infinity, false, playerColor, opponentColor);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove || validMoves[0];
    }

    /**
     * 极小极大算法实现
     */
    minimax(gameLogic, depth, alpha, beta, isMaximizingPlayer, playerColor, opponentColor) {
        // 到达搜索深度或游戏结束
        if (depth === 0 || gameLogic.isGameOver()) {
            return this.evaluateBoard(gameLogic, playerColor);
        }

        const currentPlayer = isMaximizingPlayer ? playerColor : opponentColor;
        const validMoves = gameLogic.getValidMoves(currentPlayer);

        // 如果没有合法移动，继续递归
        if (validMoves.length === 0) {
            const tempGame = this.cloneGameLogic(gameLogic);
            return this.minimax(tempGame, depth - 1, alpha, beta, !isMaximizingPlayer, playerColor, opponentColor);
        }

        if (isMaximizingPlayer) {
            let maxScore = -Infinity;
            for (const move of validMoves) {
                const tempGame = this.cloneGameLogic(gameLogic);
                tempGame.currentPlayer = currentPlayer;
                tempGame.placePiece(move.row, move.col);

                const score = this.minimax(tempGame, depth - 1, alpha, beta, false, playerColor, opponentColor);
                maxScore = Math.max(maxScore, score);
                alpha = Math.max(alpha, score);

                if (beta <= alpha) {
                    break; // Alpha-Beta剪枝
                }
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const move of validMoves) {
                const tempGame = this.cloneGameLogic(gameLogic);
                tempGame.currentPlayer = currentPlayer;
                tempGame.placePiece(move.row, move.col);

                const score = this.minimax(tempGame, depth - 1, alpha, beta, true, playerColor, opponentColor);
                minScore = Math.min(minScore, score);
                beta = Math.min(beta, score);

                if (beta <= alpha) {
                    break; // Alpha-Beta剪枝
                }
            }
            return minScore;
        }
    }

    /**
     * 评估棋盘得分
     */
    evaluateBoard(gameLogic, playerColor) {
        const opponentColor = playerColor === 'black' ? 'white' : 'black';
        const counts = gameLogic.getPieceCounts();
        const board = gameLogic.getBoard();
        const boardSize = 8;

        let score = 0;

        // 1. 位置权重表（国际比赛级别的专业权重）
        const positionWeights = [
            [1000, -200, 100, 50, 50, 100, -200, 1000],
            [-200, -500, -25, -25, -25, -25, -500, -200],
            [100, -25, 10, 5, 5, 10, -25, 100],
            [50, -25, 5, 0, 0, 5, -25, 50],
            [50, -25, 5, 0, 0, 5, -25, 50],
            [100, -25, 10, 5, 5, 10, -25, 100],
            [-200, -500, -25, -25, -25, -25, -500, -200],
            [1000, -200, 100, 50, 50, 100, -200, 1000]
        ];

        // 2. 角落位置（非常重要）
        const corners = [
            { row: 0, col: 0 },
            { row: 0, col: boardSize - 1 },
            { row: boardSize - 1, col: 0 },
            { row: boardSize - 1, col: boardSize - 1 }
        ];

        let playerCorners = 0;
        let opponentCorners = 0;

        // 3. 角落邻接位置（危险位置，需要惩罚）
        const cornerAdjacent = [
            { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, // 左上角邻接
            { row: 0, col: boardSize - 2 }, { row: 1, col: boardSize - 1 }, { row: 1, col: boardSize - 2 }, // 右上角邻接
            { row: boardSize - 2, col: 0 }, { row: boardSize - 1, col: 1 }, { row: boardSize - 2, col: 1 }, // 左下角邻接
            { row: boardSize - 2, col: boardSize - 1 }, { row: boardSize - 1, col: boardSize - 2 }, { row: boardSize - 2, col: boardSize - 2 } // 右下角邻接
        ];

        let playerCornerAdjacent = 0;
        let opponentCornerAdjacent = 0;

        // 4. 边缘位置（重要）
        let playerEdges = 0;
        let opponentEdges = 0;

        // 5. 边缘邻接位置（需要评估）
        let playerEdgeAdjacent = 0;
        let opponentEdgeAdjacent = 0;

        // 遍历棋盘，计算各项得分
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                const piece = board[row][col];
                if (piece === null) continue;

                // 位置权重得分
                const weight = positionWeights[row][col];
                if (piece === playerColor) {
                    score += weight;
                } else {
                    score -= weight;
                }

                // 检查是否是角落
                const isCorner = corners.some(c => c.row === row && c.col === col);
                if (isCorner) {
                    if (piece === playerColor) {
                        playerCorners++;
                    } else {
                        opponentCorners++;
                    }
                }

                // 检查是否是角落邻接
                const isCornerAdjacent = cornerAdjacent.some(c => c.row === row && c.col === col);
                if (isCornerAdjacent) {
                    if (piece === playerColor) {
                        playerCornerAdjacent++;
                    } else {
                        opponentCornerAdjacent++;
                    }
                }

                // 检查是否是边缘
                const isEdge = (row === 0 || row === boardSize - 1 || col === 0 || col === boardSize - 1) && !isCorner;
                if (isEdge) {
                    if (piece === playerColor) {
                        playerEdges++;
                    } else {
                        opponentEdges++;
                    }
                }

                // 检查是否是边缘邻接
                const isEdgeAdjacent = (row === 1 || row === boardSize - 2 || col === 1 || col === boardSize - 2) && !isCornerAdjacent;
                if (isEdgeAdjacent) {
                    if (piece === playerColor) {
                        playerEdgeAdjacent++;
                    } else {
                        opponentEdgeAdjacent++;
                    }
                }
            }
        }

        // 6. 角落控制得分（权重很高）
        score += (playerCorners - opponentCorners) * 500;

        // 7. 角落邻接惩罚（如果没有控制角落，邻接位置很危险）
        if (playerCorners === 0) {
            score -= playerCornerAdjacent * 50;
        }
        if (opponentCorners === 0) {
            score += opponentCornerAdjacent * 50;
        }

        // 8. 边缘控制得分
        score += (playerEdges - opponentEdges) * 100;

        // 9. 边缘邻接得分
        score += (playerEdgeAdjacent - opponentEdgeAdjacent) * 25;

        // 10. 棋子数量得分（根据游戏阶段调整权重）
        const totalPieces = counts[playerColor] + counts[opponentColor];
        let countWeight = 10;
        if (totalPieces < 20) {
            countWeight = 5; // 游戏初期，位置比数量更重要
        } else if (totalPieces > 50) {
            countWeight = 30; // 游戏后期，数量变得非常重要
        }
        score += (counts[playerColor] - counts[opponentColor]) * countWeight;

        // 11. 行动力得分（可移动数量，权重很高）
        const playerMoves = gameLogic.getValidMoves(playerColor).length;
        const opponentMoves = gameLogic.getValidMoves(opponentColor).length;
        score += (playerMoves - opponentMoves) * 100;

        // 12. 稳定子得分
        const stablePieces = this.countStablePieces(board, playerColor, opponentColor);
        const opponentStablePieces = this.countStablePieces(board, opponentColor, playerColor);
        score += (stablePieces - opponentStablePieces) * 200;

        // 13. 奇偶性得分（游戏结束时棋盘剩余空格的奇偶性）
        const emptySpaces = 64 - totalPieces;
        if (emptySpaces <= 10) {
            if (emptySpaces % 2 === 1) {
                // 奇数空格，先手优势
                score += playerColor === 'black' ? 50 : -50;
            } else {
                // 偶数空格，后手优势
                score += playerColor === 'white' ? 50 : -50;
            }
        }

        return score;
    }

    /**
     * 评估单个移动的得分
     */
    evaluateMove(gameLogic, move, playerColor) {
        // 创建临时游戏状态进行模拟
        const tempGame = this.cloneGameLogic(gameLogic);
        tempGame.currentPlayer = playerColor;

        // 模拟落子
        tempGame.placePiece(move.row, move.col);

        // 使用评估函数计算得分
        return this.evaluateBoard(tempGame, playerColor);
    }

    /**
     * 计算一个移动能翻转多少棋子
     */
    countFlips(gameLogic, move, playerColor) {
        let flips = 0;
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
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

    /**
     * 计算稳定子数量
     */
    countStablePieces(board, playerColor, opponentColor) {
        let stableCount = 0;
        const boardSize = 8;

        // 稳定子数组，标记每个位置是否是稳定子
        const isStable = Array(boardSize).fill().map(() => Array(boardSize).fill(false));

        // 检查四个角落
        const corners = [
            { row: 0, col: 0 },
            { row: 0, col: boardSize - 1 },
            { row: boardSize - 1, col: 0 },
            { row: boardSize - 1, col: boardSize - 1 }
        ];

        for (const corner of corners) {
            if (board[corner.row][corner.col] === playerColor) {
                this.markStablePieces(board, corner.row, corner.col, playerColor, isStable);
            }
        }

        // 统计稳定子数量
        for (let row = 0; row < boardSize; row++) {
            for (let col = 0; col < boardSize; col++) {
                if (isStable[row][col]) {
                    stableCount++;
                }
            }
        }

        return stableCount;
    }

    /**
     * 标记稳定子
     */
    markStablePieces(board, row, col, playerColor, isStable) {
        const boardSize = 8;
        if (isStable[row][col]) return;

        isStable[row][col] = true;

        // 检查相邻位置
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ];

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;

            if (this.isValidPosition(newRow, newCol) &&
                board[newRow][newCol] === playerColor &&
                !isStable[newRow][newCol]) {
                // 检查该方向是否稳定
                if (this.isDirectionStable(board, newRow, newCol, dr, dc, playerColor)) {
                    this.markStablePieces(board, newRow, newCol, playerColor, isStable);
                }
            }
        }
    }

    /**
     * 检查方向是否稳定
     */
    isValidPosition(row, col) {
        const boardSize = 8;
        return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
    }

    /**
     * 检查方向是否稳定
     */
    isDirectionStable(board, row, col, dr, dc, playerColor) {
        const boardSize = 8;
        let currentRow = row;
        let currentCol = col;

        // 检查到边缘或不同颜色
        while (this.isValidPosition(currentRow, currentCol)) {
            if (board[currentRow][currentCol] !== playerColor) {
                return false;
            }
            currentRow += dr;
            currentCol += dc;
        }

        return true;
    }

    /**
     * 克隆GameLogic实例
     */
    cloneGameLogic(gameLogic) {
        const cloned = new GameLogic();
        cloned.board = JSON.parse(JSON.stringify(gameLogic.board));
        cloned.currentPlayer = gameLogic.currentPlayer;
        cloned.gameOver = gameLogic.gameOver;
        return cloned;
    }
}

// 导出AIPlayer类
export default AIPlayer;
