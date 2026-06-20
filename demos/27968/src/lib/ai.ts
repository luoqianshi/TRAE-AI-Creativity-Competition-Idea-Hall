import { Piece, Position, Player, BOARD_SIZE } from '@/types/game';
import {
  getValidMoves,
  getAllPieces,
  movePiece,
  checkWinner,
  getTotalBoardSheepCount,
  isSheepFlockPosition,
  posKey,
  sheepLeavesFlock,
  herdSheepToPen,
} from './gameLogic';

interface ScoredMove {
  from: Position;
  to: Position;
  capture?: Position;
  score: number;
}

// Check if a move would result in immediate win
function isWinningMove(
  board: (Piece | null)[][],
  penCount: number,
  sheepOrigins: Map<string, string>,
  moveHistory: { piece: Piece; from: Position; to: Position }[],
  flockCounts: Map<string, number>,
  player: Player
): boolean {
  const winner = checkWinner(board, penCount, sheepOrigins, moveHistory, flockCounts);
  return winner === player;
}

// Check if this move is a repeat (going back to where we just came from)
function isRepeatMove(
  moveHistory: { piece: Piece; from: Position; to: Position }[],
  piece: Piece,
  to: Position
): boolean {
  if (moveHistory.length === 0) return false;
  const lastMove = moveHistory[moveHistory.length - 1];
  // If this piece moved last time, and we're going back to where it came from
  if (lastMove.piece.id === piece.id &&
      lastMove.to.row === to.row && lastMove.to.col === to.col) {
    return true;
  }
  return false;
}

// Check if a move is part of a 2-move loop (A->B->A->B pattern)
function isTwoMoveLoop(
  moveHistory: { piece: Piece; from: Position; to: Position }[],
  piece: Piece,
  to: Position
): boolean {
  if (moveHistory.length < 3) return false;
  const h = moveHistory;
  const n = h.length;
  // Check if this piece has been oscillating
  const myMoves = h.filter(m => m.piece.id === piece.id);
  if (myMoves.length < 2) return false;
  const lastMyMove = myMoves[myMoves.length - 1];
  const secondLastMyMove = myMoves[myMoves.length - 2];
  // If we're going to where we were 2 moves ago
  if (secondLastMyMove.from.row === to.row && secondLastMyMove.from.col === to.col) {
    return true;
  }
  return false;
}

export function getBestMove(
  board: (Piece | null)[][],
  player: Player,
  penCount: number,
  sheepOrigins: Map<string, string>,
  moveHistory: { piece: Piece; from: Position; to: Position }[],
  depth: number = 3,
  flockCounts: Map<string, number>
): { from: Position; to: Position; capture?: Position } | null {
  const pieces = getAllPieces(board, player);
  let bestMove: ScoredMove | null = null;

  // Collect all possible moves with metadata
  const allMoves: (ScoredMove & { isCapture: boolean; isRepeat: boolean; isLoop: boolean })[] = [];

  for (const piece of pieces) {
    const moves = getValidMoves(board, piece, penCount, sheepOrigins, moveHistory, flockCounts);
    for (const move of moves) {
      const isCapture = !!move.capture;
      const isRepeat = isRepeatMove(moveHistory, piece, { row: move.row, col: move.col });
      const isLoop = isTwoMoveLoop(moveHistory, piece, { row: move.row, col: move.col });

      let newBoard = movePiece(
        board,
        piece.position,
        { row: move.row, col: move.col },
        move.capture
      );
      let newPenCount = penCount;
      let newFlockCounts = new Map(flockCounts);

      // Handle "herding": sheep goes to pen
      if (move.capture) {
        newPenCount++;
        const herdResult = herdSheepToPen(newFlockCounts, move.capture);
        newFlockCounts = herdResult.newFlockCounts;
        if (herdResult.newBoardPiece) {
          newBoard[move.capture.row][move.capture.col] = herdResult.newBoardPiece;
        }
      }

      // Handle sheep leaving a flock position
      if (piece.type === 'sheep' && isSheepFlockPosition(piece.position.row, piece.position.col)) {
        const result = sheepLeavesFlock(newFlockCounts, piece.position);
        newFlockCounts = result.newFlockCounts;
        if (result.hasMore && result.newBoardPiece) {
          newBoard[piece.position.row][piece.position.col] = result.newBoardPiece;
        }
      }

      const score = minimax(
        newBoard,
        newPenCount,
        sheepOrigins,
        [...moveHistory, { piece, from: piece.position, to: { row: move.row, col: move.col } }],
        depth - 1,
        player === 'sheep' ? 'dog' : 'sheep',
        player,
        -Infinity,
        Infinity,
        newFlockCounts
      );

      allMoves.push({
        from: piece.position,
        to: { row: move.row, col: move.col },
        capture: move.capture,
        score,
        isCapture,
        isRepeat,
        isLoop,
      });
    }
  }

  if (allMoves.length === 0) return null;

  // PRIORITY 1: If there are capture moves, ONLY consider captures (for dog player)
  if (player === 'dog') {
    const captureMoves = allMoves.filter(m => m.isCapture);
    if (captureMoves.length > 0) {
      // Among captures, avoid repeats if possible
      const nonRepeatCaptures = captureMoves.filter(m => !m.isRepeat && !m.isLoop);
      const candidates = nonRepeatCaptures.length > 0 ? nonRepeatCaptures : captureMoves;
      bestMove = candidates.reduce((best, m) => m.score > best.score ? m : best);
      return { from: bestMove.from, to: bestMove.to, capture: bestMove.capture };
    }
  }

  // PRIORITY 2: For sheep, prefer moves that trap dogs
  if (player === 'sheep') {
    // Filter out loop moves entirely unless no other choice
    const nonLoopMoves = allMoves.filter(m => !m.isLoop);
    const candidates = nonLoopMoves.length > 0 ? nonLoopMoves : allMoves;

    // Filter out repeat moves if possible
    const nonRepeatMoves = candidates.filter(m => !m.isRepeat);
    const finalCandidates = nonRepeatMoves.length > 0 ? nonRepeatMoves : candidates;

    bestMove = finalCandidates.reduce((best, m) => m.score > best.score ? m : best);
    return { from: bestMove.from, to: bestMove.to, capture: bestMove.capture };
  }

  // Default: pick best score, avoiding repeats
  const nonRepeatMoves = allMoves.filter(m => !m.isRepeat && !m.isLoop);
  const candidates = nonRepeatMoves.length > 0 ? nonRepeatMoves : allMoves;
  bestMove = candidates.reduce((best, m) => m.score > best.score ? m : best);

  return bestMove
    ? { from: bestMove.from, to: bestMove.to, capture: bestMove.capture }
    : null;
}

function minimax(
  board: (Piece | null)[][],
  penCount: number,
  sheepOrigins: Map<string, string>,
  moveHistory: { piece: Piece; from: Position; to: Position }[],
  depth: number,
  currentPlayer: Player,
  maximizingPlayer: Player,
  alpha: number,
  beta: number,
  flockCounts: Map<string, number>
): number {
  const winner = checkWinner(board, penCount, sheepOrigins, moveHistory, flockCounts);
  if (winner === maximizingPlayer) return 1000 + depth;
  if (winner && winner !== maximizingPlayer) return -1000 - depth;
  if (depth === 0) return evaluateBoard(board, penCount, sheepOrigins, moveHistory, maximizingPlayer, flockCounts);

  const pieces = getAllPieces(board, currentPlayer);

  if (currentPlayer === maximizingPlayer) {
    let maxEval = -Infinity;
    for (const piece of pieces) {
      const moves = getValidMoves(board, piece, penCount, sheepOrigins, moveHistory, flockCounts);
      for (const move of moves) {
        let newBoard = movePiece(
          board,
          piece.position,
          { row: move.row, col: move.col },
          move.capture
        );
        let newPenCount = penCount;
        let newFlockCounts = new Map(flockCounts);

        // Handle "herding": sheep goes to pen
        if (move.capture) {
          newPenCount++;
          const herdResult = herdSheepToPen(newFlockCounts, move.capture);
          newFlockCounts = herdResult.newFlockCounts;
          if (herdResult.newBoardPiece) {
            newBoard[move.capture.row][move.capture.col] = herdResult.newBoardPiece;
          }
        }

        // Handle sheep leaving a flock position
        if (piece.type === 'sheep' && isSheepFlockPosition(piece.position.row, piece.position.col)) {
          const result = sheepLeavesFlock(newFlockCounts, piece.position);
          newFlockCounts = result.newFlockCounts;
          if (result.hasMore && result.newBoardPiece) {
            newBoard[piece.position.row][piece.position.col] = result.newBoardPiece;
          }
        }

        const evalScore = minimax(
          newBoard,
          newPenCount,
          sheepOrigins,
          [...moveHistory, { piece, from: piece.position, to: { row: move.row, col: move.col } }],
          depth - 1,
          currentPlayer === 'sheep' ? 'dog' : 'sheep',
          maximizingPlayer,
          alpha,
          beta,
          newFlockCounts
        );
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      if (beta <= alpha) break;
    }
    return maxEval === -Infinity ? -500 : maxEval;
  } else {
    let minEval = Infinity;
    for (const piece of pieces) {
      const moves = getValidMoves(board, piece, penCount, sheepOrigins, moveHistory, flockCounts);
      for (const move of moves) {
        let newBoard = movePiece(
          board,
          piece.position,
          { row: move.row, col: move.col },
          move.capture
        );
        let newPenCount = penCount;
        let newFlockCounts = new Map(flockCounts);

        // Handle "herding": sheep goes to pen
        if (move.capture) {
          newPenCount++;
          const herdResult = herdSheepToPen(newFlockCounts, move.capture);
          newFlockCounts = herdResult.newFlockCounts;
          if (herdResult.newBoardPiece) {
            newBoard[move.capture.row][move.capture.col] = herdResult.newBoardPiece;
          }
        }

        // Handle sheep leaving a flock position
        if (piece.type === 'sheep' && isSheepFlockPosition(piece.position.row, piece.position.col)) {
          const result = sheepLeavesFlock(newFlockCounts, piece.position);
          newFlockCounts = result.newFlockCounts;
          if (result.hasMore && result.newBoardPiece) {
            newBoard[piece.position.row][piece.position.col] = result.newBoardPiece;
          }
        }

        const evalScore = minimax(
          newBoard,
          newPenCount,
          sheepOrigins,
          [...moveHistory, { piece, from: piece.position, to: { row: move.row, col: move.col } }],
          depth - 1,
          currentPlayer === 'sheep' ? 'dog' : 'sheep',
          maximizingPlayer,
          alpha,
          beta,
          newFlockCounts
        );
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      if (beta <= alpha) break;
    }
    return minEval === Infinity ? 500 : minEval;
  }
}

function evaluateBoard(
  board: (Piece | null)[][],
  penCount: number,
  sheepOrigins: Map<string, string>,
  moveHistory: { piece: Piece; from: Position; to: Position }[],
  player: Player,
  flockCounts: Map<string, number>
): number {
  const boardSheepCount = getTotalBoardSheepCount(board, flockCounts);
  const dogPieces = getAllPieces(board, 'dog');
  const dogCount = dogPieces.length;
  const sheepPieces = getAllPieces(board, 'sheep');

  let score = 0;

  if (player === 'dog') {
    // ==================== DOG (牧羊犬) EVALUATION ====================
    // Primary goal: herd all sheep to pen
    // Secondary: stay mobile, avoid being trapped

    // WIN CONDITION: Check if all sheep are herded
    if (boardSheepCount === 0) {
      return 2000; // Immediate win!
    }

    // Each sheep herded to pen is a huge win
    score += penCount * 150;

    // Fewer sheep on board = closer to victory
    score -= boardSheepCount * 50;

    // IMMEDIATE CAPTURE BONUS - strongly prefer capturing when possible
    let captureCount = 0;
    for (const dog of dogPieces) {
      const moves = getValidMoves(board, dog, penCount, sheepOrigins, moveHistory, flockCounts);
      for (const move of moves) {
        if (move.capture) {
          captureCount++;
          score += 200; // Very high bonus for having capture opportunities
          // Extra bonus for herding sheep at flock positions (reduces reserves)
          if (isSheepFlockPosition(move.capture.row, move.capture.col)) {
            score += 60;
          }
        }
      }
    }

    // Mobility is critical for dogs
    let dogMobility = 0;
    for (const dog of dogPieces) {
      dogMobility += getValidMoves(board, dog, penCount, sheepOrigins, moveHistory, flockCounts).length;
    }
    score += dogMobility * 10;

    // Prefer central positions for better reach
    for (const dog of dogPieces) {
      const centerDist = Math.abs(dog.position.row - 2) + Math.abs(dog.position.col - 2);
      score -= centerDist * 2;
    }

    // Avoid being surrounded by sheep (but not at the expense of captures)
    for (const dog of dogPieces) {
      let adjacentSheep = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = dog.position.row + dr;
          const nc = dog.position.col + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            if (board[nr][nc]?.type === 'sheep') {
              adjacentSheep++;
            }
          }
        }
      }
      score -= adjacentSheep * 3; // Reduced penalty so capture bonus dominates
    }

    // Penalty if dogs have very few moves (near trap)
    const totalDogMoves = dogPieces.reduce((sum, dog) =>
      sum + getValidMoves(board, dog, penCount, sheepOrigins, moveHistory, flockCounts).length, 0);
    if (totalDogMoves <= 2) {
      score -= 150;
    }

    // Bonus for being close to sheep (to set up captures)
    for (const dog of dogPieces) {
      for (const sheep of sheepPieces) {
        const dist = Math.abs(dog.position.row - sheep.position.row) +
                     Math.abs(dog.position.col - sheep.position.col);
        if (dist <= 2) {
          score += (3 - dist) * 5; // Small bonus for proximity
        }
      }
    }

  } else {
    // ==================== SHEEP (羊群) EVALUATION ====================
    // Primary goal: trap both dogs (no valid moves)
    // Secondary: maintain numbers, surround dogs, control center

    // WIN CONDITION: Check if dogs are trapped
    let allDogsTrapped = true;
    for (const dog of dogPieces) {
      const moves = getValidMoves(board, dog, penCount, sheepOrigins, moveHistory, flockCounts);
      if (moves.length > 0) {
        allDogsTrapped = false;
        break;
      }
    }
    if (allDogsTrapped && dogPieces.length > 0) {
      return 2000; // Immediate win!
    }

    // More sheep on board is better
    score += boardSheepCount * 40;

    // Sheep mobility - spread out to control more space
    let sheepMobility = 0;
    for (const sheep of sheepPieces) {
      sheepMobility += getValidMoves(board, sheep, penCount, sheepOrigins, moveHistory, flockCounts).length;
    }
    score += sheepMobility * 5;

    // KEY: Surround dogs - reduce their mobility
    for (const dog of dogPieces) {
      const dogMoves = getValidMoves(board, dog, penCount, sheepOrigins, moveHistory, flockCounts).length;
      score -= dogMoves * 20; // Less dog mobility = better for sheep

      // Count adjacent sheep (blockers)
      let adjacentSheep = 0;
      let adjacentEmpty = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = dog.position.row + dr;
          const nc = dog.position.col + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            if (board[nr][nc]?.type === 'sheep') {
              adjacentSheep++;
            } else if (board[nr][nc] === null) {
              adjacentEmpty++;
            }
          }
        }
      }
      // Reward surrounding dogs with sheep
      score += adjacentSheep * 15;
      // Extra bonus if dog is nearly trapped
      if (dogMoves <= 1) {
        score += 100;
      }
      if (dogMoves === 0) {
        score += 1000; // Dog is trapped!
      }

      // CRITICAL: Block escape routes - reward positions that limit dog's future moves
      // Check if moving a sheep next to a dog would reduce its moves
      for (const sheep of sheepPieces) {
        const sDist = Math.abs(sheep.position.row - dog.position.row) +
                      Math.abs(sheep.position.col - dog.position.col);
        if (sDist === 2) {
          // Sheep is 2 steps away - can potentially move to block
          score += 5;
        }
      }
    }

    // Control center positions (better for coordinating surrounds)
    const centerPositions = [
      { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 },
      { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 },
      { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 },
    ];
    for (const pos of centerPositions) {
      if (board[pos.row][pos.col]?.type === 'sheep') {
        score += 10;
      }
    }

    // Protect flock positions - having sheep at flock positions is good (reserves)
    for (const pos of [{ row: 1, col: 1 }, { row: 1, col: 3 }, { row: 3, col: 1 }, { row: 3, col: 3 }]) {
      const key = posKey(pos);
      const count = flockCounts.get(key);
      if (count && count > 1) {
        score += (count - 1) * 8; // Bonus for reserves
      }
    }

    // Avoid leaving sheep isolated and vulnerable to herding
    for (const sheep of sheepPieces) {
      let nearbySheep = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = sheep.position.row + dr;
          const nc = sheep.position.col + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            if (board[nr][nc]?.type === 'sheep') {
              nearbySheep++;
            }
          }
        }
      }
      // Slight preference for sheep to stay somewhat grouped
      score += nearbySheep * 2;
    }

    // Penalty for each sheep that can be herded (adjacent to dog with empty landing)
    for (const sheep of sheepPieces) {
      for (const dog of dogPieces) {
        const dr = sheep.position.row - dog.position.row;
        const dc = sheep.position.col - dog.position.col;
        // Check if sheep is adjacent to dog
        if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr !== 0 || dc !== 0)) {
          // Check if dog can jump over this sheep
          const jumpRow = dog.position.row + dr * 2;
          const jumpCol = dog.position.col + dc * 2;
          if (jumpRow >= 0 && jumpRow < BOARD_SIZE && jumpCol >= 0 && jumpCol < BOARD_SIZE) {
            if (board[jumpRow][jumpCol] === null) {
              score -= 40; // This sheep is vulnerable to being herded
            }
          }
        }
      }
    }

    // Anti-repetition: penalize positions that have been seen recently
    const recentPositions = new Set<string>();
    for (let i = Math.max(0, moveHistory.length - 6); i < moveHistory.length; i++) {
      const m = moveHistory[i];
      if (m.piece.type === 'sheep') {
        recentPositions.add(`${m.to.row},${m.to.col}`);
      }
    }
    for (const sheep of sheepPieces) {
      const pos = `${sheep.position.row},${sheep.position.col}`;
      if (recentPositions.has(pos)) {
        score -= 8; // Small penalty for being in a recently visited position
      }
    }
  }

  return score;
}
