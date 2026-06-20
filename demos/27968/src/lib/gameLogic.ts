import {
  Piece,
  Position,
  ValidMove,
  Player,
  BOARD_SIZE,
  CROSS_DIRECTIONS,
  ALL_DIRECTIONS,
  SHEEP_FLOCK_POSITIONS,
  SHEEP_PER_FLOCK,
  canMoveDiagonal,
  PieceType,
} from '@/types/game';

export function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

export function posKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

// Check if a position is a sheep flock position
export function isSheepFlockPosition(row: number, col: number): boolean {
  return SHEEP_FLOCK_POSITIONS.some((p) => p.row === row && p.col === col);
}

// Create initial board: 4 flocks of 6 sheep on board, pen starts empty
export function createInitialBoard(): {
  board: (Piece | null)[][];
  penCount: number;
  sheepOrigins: Map<string, string>;
  flockCounts: Map<string, number>;
  nextSheepId: number;
} {
  const board: (Piece | null)[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));
  const sheepOrigins = new Map<string, string>();
  const flockCounts = new Map<string, number>();
  let sheepId = 0;

  // Place 6 sheep at each flock position (stacked)
  for (const pos of SHEEP_FLOCK_POSITIONS) {
    const key = posKey(pos);
    // Place one visible sheep piece on the board
    board[pos.row][pos.col] = {
      id: `sheep-${sheepId++}`,
      type: 'sheep',
      position: { ...pos },
    };
    sheepOrigins.set(`sheep-${sheepId - 1}`, key);
    // Track total count at this flock (including the visible one)
    flockCounts.set(key, SHEEP_PER_FLOCK);
  }

  // Pen starts empty
  const penCount = 0;

  return { board, penCount, sheepOrigins, flockCounts, nextSheepId: sheepId };
}

// Get available directions based on position
function getDirectionsForPosition(row: number, col: number): readonly (readonly [number, number])[] {
  if (canMoveDiagonal(row, col)) {
    return ALL_DIRECTIONS;
  }
  return CROSS_DIRECTIONS;
}

export function getValidMoves(
  board: (Piece | null)[][],
  piece: Piece,
  penCount: number,
  sheepOrigins: Map<string, string>,
  moveHistory: { piece: Piece; from: Position; to: Position }[],
  flockCounts: Map<string, number>
): ValidMove[] {
  const moves: ValidMove[] = [];
  const directions = getDirectionsForPosition(piece.position.row, piece.position.col);

  for (const [dr, dc] of directions) {
    const newRow = piece.position.row + dr;
    const newCol = piece.position.col + dc;

    // Normal move to adjacent empty cell
    if (isValidPosition(newRow, newCol) && board[newRow][newCol] === null) {
      // Check "can exit but cannot return" rule for sheep
      if (piece.type === 'sheep') {
        const originKey = sheepOrigins.get(piece.id);
        const destKey = posKey({ row: newRow, col: newCol });

        // If sheep has left its origin flock, it cannot return
        if (originKey && moveHistory.some((m) => m.piece.id === piece.id)) {
          if (destKey === originKey) continue;
        }
      }

      moves.push({ row: newRow, col: newCol });
    }

    // Dog herds sheep: jump over adjacent sheep
    if (piece.type === 'dog') {
      const jumpRow = piece.position.row + dr * 2;
      const jumpCol = piece.position.col + dc * 2;
      const midPiece = board[newRow]?.[newCol];

      if (
        midPiece?.type === 'sheep' &&
        isValidPosition(jumpRow, jumpCol) &&
        board[jumpRow][jumpCol] === null
      ) {
        moves.push({
          row: jumpRow,
          col: jumpCol,
          capture: { row: newRow, col: newCol },
        });
      }
    }
  }

  return moves;
}

export function getAllPieces(
  board: (Piece | null)[][],
  type: PieceType
): Piece[] {
  const pieces: Piece[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece && piece.type === type) {
        pieces.push(piece);
      }
    }
  }
  return pieces;
}

export function hasValidMoves(
  board: (Piece | null)[][],
  type: PieceType,
  penCount: number,
  sheepOrigins: Map<string, string>,
  moveHistory: { piece: Piece; from: Position; to: Position }[],
  flockCounts: Map<string, number>
): boolean {
  const pieces = getAllPieces(board, type);
  for (const piece of pieces) {
    if (getValidMoves(board, piece, penCount, sheepOrigins, moveHistory, flockCounts).length > 0) {
      return true;
    }
  }
  return false;
}

export function checkWinner(
  board: (Piece | null)[][],
  penCount: number,
  sheepOrigins: Map<string, string>,
  moveHistory: { piece: Piece; from: Position; to: Position }[],
  flockCounts: Map<string, number>
): Player | null {
  const boardSheepCount = getBoardSheepCount(board);

  // Dog wins if no sheep left on board (all herded to pen)
  if (boardSheepCount === 0) {
    return 'dog';
  }

  // Sheep wins if dogs have no valid moves
  if (!hasValidMoves(board, 'dog', penCount, sheepOrigins, moveHistory, flockCounts)) {
    return 'sheep';
  }

  return null;
}

export function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map((row) =>
    row.map((cell) =>
      cell ? { ...cell, position: { ...cell.position } } : null
    )
  );
}

export function movePiece(
  board: (Piece | null)[][],
  from: Position,
  to: Position,
  capture?: Position
): (Piece | null)[][] {
  const newBoard = cloneBoard(board);
  const piece = newBoard[from.row][from.col];

  if (!piece) return newBoard;

  // Move piece
  newBoard[from.row][from.col] = null;
  piece.position = { ...to };
  newBoard[to.row][to.col] = piece;

  // Capture if applicable (remove the herded sheep from board)
  if (capture) {
    newBoard[capture.row][capture.col] = null;
  }

  return newBoard;
}

export function getPieceAt(
  board: (Piece | null)[][],
  position: Position
): Piece | null {
  if (!isValidPosition(position.row, position.col)) return null;
  return board[position.row][position.col];
}

// Get sheep count on board only (visible pieces)
export function getBoardSheepCount(board: (Piece | null)[][]): number {
  let count = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col]?.type === 'sheep') count++;
    }
  }
  return count;
}

// Get total sheep count on board including stacked ones
export function getTotalBoardSheepCount(
  board: (Piece | null)[][],
  flockCounts: Map<string, number>
): number {
  let count = 0;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col]?.type === 'sheep') {
        const key = `${row},${col}`;
        if (isSheepFlockPosition(row, col) && flockCounts.has(key)) {
          count += flockCounts.get(key)!;
        } else {
          count += 1;
        }
      }
    }
  }
  return count;
}

// Get total sheep count (board stacked + pen)
export function getTotalSheepCount(
  board: (Piece | null)[][],
  penCount: number,
  flockCounts: Map<string, number>
): number {
  return getTotalBoardSheepCount(board, flockCounts) + penCount;
}

// When a sheep leaves a flock position, decrement the flock count
// Returns true if there are more sheep in the flock to place on board
export function sheepLeavesFlock(
  flockCounts: Map<string, number>,
  position: Position
): { newFlockCounts: Map<string, number>; hasMore: boolean; newBoardPiece: Piece | null } {
  const key = posKey(position);
  const newFlockCounts = new Map(flockCounts);
  const currentCount = newFlockCounts.get(key) || 1;

  if (currentCount > 1) {
    // More sheep in the flock, decrement and place a new visible sheep
    newFlockCounts.set(key, currentCount - 1);
    return {
      newFlockCounts,
      hasMore: true,
      newBoardPiece: {
        id: `sheep-stack-${Date.now()}`,
        type: 'sheep',
        position: { ...position },
      },
    };
  } else {
    // Last sheep left, remove flock entry
    newFlockCounts.delete(key);
    return {
      newFlockCounts,
      hasMore: false,
      newBoardPiece: null,
    };
  }
}

// When a dog herds a sheep, the sheep goes to pen and flock count decreases
// Returns the new flock counts and a new board piece if there are more sheep
export function herdSheepToPen(
  flockCounts: Map<string, number>,
  capturePosition: Position
): { newFlockCounts: Map<string, number>; newBoardPiece: Piece | null } {
  const key = posKey(capturePosition);
  const newFlockCounts = new Map(flockCounts);
  
  // If the captured sheep is at a flock position, decrement the flock count
  if (isSheepFlockPosition(capturePosition.row, capturePosition.col) && newFlockCounts.has(key)) {
    const currentCount = newFlockCounts.get(key)!;
    if (currentCount > 1) {
      newFlockCounts.set(key, currentCount - 1);
      return {
        newFlockCounts,
        newBoardPiece: {
          id: `sheep-herd-${Date.now()}`,
          type: 'sheep',
          position: { ...capturePosition },
        },
      };
    } else {
      newFlockCounts.delete(key);
    }
  }
  
  return { newFlockCounts, newBoardPiece: null };
}
