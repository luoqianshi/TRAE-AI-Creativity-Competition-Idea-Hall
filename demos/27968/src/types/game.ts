export type PieceType = 'dog' | 'sheep';
export type GamePhase = 'menu' | 'setup' | 'playing' | 'gameover';
export type GameMode = 'pvp' | 'pve';
export type Player = 'dog' | 'sheep';

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  id: string;
  type: PieceType;
  position: Position;
}

export interface Move {
  piece: Piece;
  from: Position;
  to: Position;
  capture?: Position;
}

export interface ValidMove extends Position {
  capture?: Position;
}

export interface GameState {
  phase: GamePhase;
  mode: GameMode;
  currentPlayer: Player;
  board: (Piece | null)[][];
  selectedPiece: Piece | null;
  validMoves: ValidMove[];
  winner: Player | null;
  moveHistory: Move[];
  isThinking: boolean;
  dogsPlaced: number;
  penCount: number; // Sheep in the pen (outside board)
  sheepOrigins: Map<string, string>; // piece id -> origin position key
  flockCounts: Map<string, number>; // position key -> sheep count at flock position
  humanPlayer: Player | null; // In PvE mode, which side the human plays
}

export const BOARD_SIZE = 5;

// Cross directions (horizontal + vertical)
export const CROSS_DIRECTIONS = [
  [-1, 0], [0, -1], [0, 1], [1, 0]
] as const;

// All directions including diagonal
export const ALL_DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
] as const;

// Sheep flock positions (1,1), (1,3), (3,1), (3,3) - 6 sheep each on board
export const SHEEP_FLOCK_POSITIONS: Position[] = [
  { row: 1, col: 1 },
  { row: 1, col: 3 },
  { row: 3, col: 1 },
  { row: 3, col: 3 },
];

// Sheep per flock at game start
export const SHEEP_PER_FLOCK = 6;

// Positions that CANNOT move diagonally
const NO_DIAGONAL_POSITIONS = new Set([
  '1,0', '1,2', '1,4', '3,0', '3,2', '3,4',
  '0,1', '2,1', '4,1', '0,3', '2,3', '4,3',
]);

export function canMoveDiagonal(row: number, col: number): boolean {
  return !NO_DIAGONAL_POSITIONS.has(`${row},${col}`);
}
