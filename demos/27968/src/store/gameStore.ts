import { create } from 'zustand';
import {
  GamePhase,
  GameMode,
  Player,
  Piece,
  Position,
  ValidMove,
  Move,
} from '@/types/game';
import {
  createInitialBoard,
  getValidMoves,
  checkWinner,
  movePiece,
  getPieceAt,
  getTotalSheepCount,
  isSheepFlockPosition,
  posKey,
  sheepLeavesFlock,
  herdSheepToPen,
} from '@/lib/gameLogic';
import { getBestMove } from '@/lib/ai';

interface GameStore {
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
  penCount: number;
  sheepOrigins: Map<string, string>;
  flockCounts: Map<string, number>;
  nextSheepId: number;
  humanPlayer: Player | null;

  startGame: (mode: GameMode, humanPlayer?: Player) => void;
  autoPlaceDogsForAI: () => void;
  placeDog: (position: Position) => void;
  selectPiece: (piece: Piece | null) => void;
  moveTo: (to: Position) => void;
  resetGame: () => void;
  backToMenu: () => void;
  makeAIMove: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'menu',
  mode: 'pvp',
  currentPlayer: 'dog',
  board: Array(5).fill(null).map(() => Array(5).fill(null)),
  selectedPiece: null,
  validMoves: [],
  winner: null,
  moveHistory: [],
  isThinking: false,
  dogsPlaced: 0,
  penCount: 0,
  sheepOrigins: new Map(),
  flockCounts: new Map(),
  nextSheepId: 0,
  humanPlayer: null,

  startGame: (mode: GameMode, humanPlayer?: Player) => {
    const { board, penCount, sheepOrigins, flockCounts, nextSheepId } = createInitialBoard();
    const isPve = mode === 'pve';
    const actualHumanPlayer = isPve ? (humanPlayer || 'dog') : null;
    set({
      phase: 'setup',
      mode,
      currentPlayer: 'dog',
      board,
      selectedPiece: null,
      validMoves: [],
      winner: null,
      moveHistory: [],
      isThinking: false,
      dogsPlaced: 0,
      penCount,
      sheepOrigins,
      flockCounts,
      nextSheepId,
      humanPlayer: actualHumanPlayer,
    });

    // If PvE and AI plays dog, auto-place dogs for AI
    if (isPve && actualHumanPlayer === 'sheep') {
      setTimeout(() => {
        get().autoPlaceDogsForAI();
      }, 500);
    }
  },

  autoPlaceDogsForAI: () => {
    const { board, dogsPlaced, phase, mode, humanPlayer } = get();
    if (phase !== 'setup' || mode !== 'pve' || humanPlayer !== 'sheep') return;

    // AI places dogs at strategic positions: corners or edges
    const preferredPositions = [
      { row: 0, col: 0 }, { row: 0, col: 4 },
      { row: 4, col: 0 }, { row: 4, col: 4 },
      { row: 0, col: 2 }, { row: 2, col: 0 },
      { row: 2, col: 4 }, { row: 4, col: 2 },
      { row: 1, col: 0 }, { row: 0, col: 1 },
      { row: 0, col: 3 }, { row: 1, col: 4 },
      { row: 3, col: 0 }, { row: 4, col: 1 },
      { row: 4, col: 3 }, { row: 3, col: 4 },
      { row: 2, col: 2 },
    ];

    let placed = dogsPlaced;
    const newBoard = board.map((row) => [...row]);

    for (const pos of preferredPositions) {
      if (placed >= 2) break;
      if (newBoard[pos.row][pos.col] === null) {
        newBoard[pos.row][pos.col] = {
          id: `dog-${placed + 1}`,
          type: 'dog',
          position: { ...pos },
        };
        placed++;
      }
    }

    set({
      board: newBoard,
      dogsPlaced: placed,
      phase: placed >= 2 ? 'playing' : 'setup',
    });

    // If AI placed both dogs, it starts playing as dog
    if (placed >= 2) {
      setTimeout(() => {
        get().makeAIMove();
      }, 600);
    }
  },

  placeDog: (position: Position) => {
    const { board, dogsPlaced, phase } = get();
    if (phase !== 'setup') return;
    if (dogsPlaced >= 2) return;
    if (board[position.row][position.col] !== null) return;

    const newBoard = board.map((row) => [...row]);
    newBoard[position.row][position.col] = {
      id: `dog-${dogsPlaced + 1}`,
      type: 'dog',
      position: { ...position },
    };

    const newDogsPlaced = dogsPlaced + 1;

    if (newDogsPlaced >= 2) {
      set({
        board: newBoard,
        dogsPlaced: newDogsPlaced,
        phase: 'playing',
      });
    } else {
      set({
        board: newBoard,
        dogsPlaced: newDogsPlaced,
      });
    }
  },

  selectPiece: (piece: Piece | null) => {
    const { board, currentPlayer, phase, penCount, sheepOrigins, moveHistory, flockCounts } = get();
    if (phase !== 'playing') return;

    if (!piece) {
      set({ selectedPiece: null, validMoves: [] });
      return;
    }

    if (piece.type !== currentPlayer) return;

    const moves = getValidMoves(board, piece, penCount, sheepOrigins, moveHistory, flockCounts);
    set({ selectedPiece: piece, validMoves: moves });
  },

  moveTo: (to: Position) => {
    const {
      board,
      selectedPiece,
      validMoves,
      currentPlayer,
      mode,
      moveHistory,
      penCount,
      sheepOrigins,
      flockCounts,
      humanPlayer,
    } = get();
    if (!selectedPiece) return;

    const validMove = validMoves.find(
      (m) => m.row === to.row && m.col === to.col
    );
    if (!validMove) return;

    const from = selectedPiece.position;
    let newBoard = movePiece(board, from, to, validMove.capture);
    let newPenCount = penCount;
    let newSheepOrigins = new Map(sheepOrigins);
    let newFlockCounts = new Map(flockCounts);

    // Handle "herding": when a dog jumps over a sheep, the sheep goes to the pen
    if (validMove.capture) {
      newPenCount++;
      // Also decrement flock count if the captured sheep was at a flock position
      const herdResult = herdSheepToPen(newFlockCounts, validMove.capture);
      newFlockCounts = herdResult.newFlockCounts;
      // If there are more sheep in the flock, place a new visible sheep
      if (herdResult.newBoardPiece) {
        newBoard[validMove.capture.row][validMove.capture.col] = herdResult.newBoardPiece;
      }
    }

    // Handle sheep leaving a flock position
    if (selectedPiece.type === 'sheep' && isSheepFlockPosition(from.row, from.col)) {
      const result = sheepLeavesFlock(newFlockCounts, from);
      newFlockCounts = result.newFlockCounts;
      if (result.hasMore && result.newBoardPiece) {
        newBoard[from.row][from.col] = result.newBoardPiece;
      }
    }

    const move: Move = {
      piece: { ...selectedPiece, position: { ...to } },
      from: { ...from },
      to: { ...to },
      capture: validMove.capture,
    };

    const winner = checkWinner(newBoard, newPenCount, newSheepOrigins, [
      ...moveHistory,
      move,
    ], newFlockCounts);
    const nextPlayer: Player = currentPlayer === 'dog' ? 'sheep' : 'dog';

    set({
      board: newBoard,
      selectedPiece: null,
      validMoves: [],
      currentPlayer: nextPlayer,
      winner,
      moveHistory: [...moveHistory, move],
      penCount: newPenCount,
      sheepOrigins: newSheepOrigins,
      flockCounts: newFlockCounts,
    });

    if (winner) {
      set({ phase: 'gameover' });
      return;
    }

    // Trigger AI move if in PvE mode and next player is AI
    if (mode === 'pve' && humanPlayer && nextPlayer !== humanPlayer) {
      setTimeout(() => {
        get().makeAIMove();
      }, 600);
    }
  },

  makeAIMove: () => {
    const { board, currentPlayer, penCount, sheepOrigins, moveHistory, flockCounts, humanPlayer } = get();
    // AI can play either dog or sheep
    const aiPlayer = humanPlayer === 'dog' ? 'sheep' : 'dog';
    if (currentPlayer !== aiPlayer) return;

    set({ isThinking: true });

    setTimeout(() => {
      const aiMove = getBestMove(board, aiPlayer, penCount, sheepOrigins, moveHistory, 3, flockCounts);
      if (!aiMove) {
        set({ isThinking: false });
        return;
      }

      const { from, to, capture } = aiMove;
      const piece = getPieceAt(board, from);
      if (!piece) {
        set({ isThinking: false });
        return;
      }

      let newBoard = movePiece(board, from, to, capture);
      let newPenCount = penCount;
      let newSheepOrigins = new Map(sheepOrigins);
      let newFlockCounts = new Map(flockCounts);

      // Handle "herding": sheep goes to pen
      if (capture) {
        newPenCount++;
        // Also decrement flock count if the captured sheep was at a flock position
        const herdResult = herdSheepToPen(newFlockCounts, capture);
        newFlockCounts = herdResult.newFlockCounts;
        // If there are more sheep in the flock, place a new visible sheep
        if (herdResult.newBoardPiece) {
          newBoard[capture.row][capture.col] = herdResult.newBoardPiece;
        }
      }

      // Handle sheep leaving a flock position
      if (piece.type === 'sheep' && isSheepFlockPosition(from.row, from.col)) {
        const result = sheepLeavesFlock(newFlockCounts, from);
        newFlockCounts = result.newFlockCounts;
        if (result.hasMore && result.newBoardPiece) {
          newBoard[from.row][from.col] = result.newBoardPiece;
        }
      }

      const winner = checkWinner(newBoard, newPenCount, newSheepOrigins, [
        ...moveHistory,
        { piece, from, to, capture },
      ], newFlockCounts);

      const move: Move = {
        piece: { ...piece, position: { ...to } },
        from: { ...from },
        to: { ...to },
        capture,
      };

      const nextPlayer = aiPlayer === 'dog' ? 'sheep' : 'dog';

      set((state) => ({
        board: newBoard,
        selectedPiece: null,
        validMoves: [],
        currentPlayer: nextPlayer,
        winner,
        moveHistory: [...state.moveHistory, move],
        penCount: newPenCount,
        sheepOrigins: newSheepOrigins,
        flockCounts: newFlockCounts,
        isThinking: false,
      }));

      if (winner) {
        set({ phase: 'gameover' });
      }
    }, 800);
  },

  resetGame: () => {
    const { mode, humanPlayer } = get();
    const { board, penCount, sheepOrigins, flockCounts, nextSheepId } = createInitialBoard();
    set({
      phase: 'setup',
      currentPlayer: 'dog',
      board,
      selectedPiece: null,
      validMoves: [],
      winner: null,
      moveHistory: [],
      isThinking: false,
      dogsPlaced: 0,
      penCount,
      sheepOrigins,
      flockCounts,
      nextSheepId,
    });

    // If PvE and AI plays dog, auto-place dogs
    if (mode === 'pve' && humanPlayer === 'sheep') {
      setTimeout(() => {
        get().autoPlaceDogsForAI();
      }, 500);
    }
  },

  backToMenu: () => {
    set({
      phase: 'menu',
      mode: 'pvp',
      currentPlayer: 'dog',
      board: Array(5).fill(null).map(() => Array(5).fill(null)),
      selectedPiece: null,
      validMoves: [],
      winner: null,
      moveHistory: [],
      isThinking: false,
      dogsPlaced: 0,
      penCount: 0,
      sheepOrigins: new Map(),
      flockCounts: new Map(),
      nextSheepId: 0,
      humanPlayer: null,
    });
  },
}));
