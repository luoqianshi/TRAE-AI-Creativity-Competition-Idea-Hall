import { useGameStore } from '@/store/gameStore';
import { Piece, Position, canMoveDiagonal } from '@/types/game';
import { isSheepFlockPosition } from '@/lib/gameLogic';
import PixelDog from './PixelDog';
import PixelSheep from './PixelSheep';

// SVG Path Grid - draws all movement paths as a single SVG overlay
function PathGrid() {
  const size = 5;
  const cellSize = 100; // SVG units per cell
  const totalSize = size * cellSize;
  const centerOffset = cellSize / 2;

  const lines: JSX.Element[] = [];
  let lineKey = 0;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cx = col * cellSize + centerOffset;
      const cy = row * cellSize + centerOffset;

      // Cross directions (always available)
      const crossDirs = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 },
      ];

      for (const dir of crossDirs) {
        const nr = row + dir.dr;
        const nc = col + dir.dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          const nx = nc * cellSize + centerOffset;
          const ny = nr * cellSize + centerOffset;
          lines.push(
            <line
              key={`cross-${lineKey++}`}
              x1={cx}
              y1={cy}
              x2={nx}
              y2={ny}
              stroke="#5D4037"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.5"
            />
          );
        }
      }

      // Diagonal directions (only for specific positions)
      if (canMoveDiagonal(row, col)) {
        const diagDirs = [
          { dr: -1, dc: -1 },
          { dr: -1, dc: 1 },
          { dr: 1, dc: -1 },
          { dr: 1, dc: 1 },
        ];

        for (const dir of diagDirs) {
          const nr = row + dir.dr;
          const nc = col + dir.dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            const nx = nc * cellSize + centerOffset;
            const ny = nr * cellSize + centerOffset;
            lines.push(
              <line
                key={`diag-${lineKey++}`}
                x1={cx}
                y1={cy}
                x2={nx}
                y2={ny}
                stroke="#5D4037"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="6,4"
                opacity="0.35"
              />
            );
          }
        }
      }
    }
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      preserveAspectRatio="none"
      style={{ zIndex: 0 }}
    >
      {lines}
    </svg>
  );
}

function BoardCell({
  row,
  col,
  piece,
  isValidMove,
  isSelected,
  onCellClick,
  flockCount,
}: {
  row: number;
  col: number;
  piece: Piece | null;
  isValidMove: boolean;
  isSelected: boolean;
  onCellClick: (position: Position) => void;
  flockCount?: number;
}) {
  const { selectPiece, phase, placeDog } = useGameStore();

  const handleClick = () => {
    if (phase === 'setup') {
      placeDog({ row, col });
      return;
    }

    if (piece) {
      selectPiece(piece);
    } else if (isValidMove) {
      onCellClick({ row, col });
    }
  };

  // Checkerboard pattern
  const isDark = (row + col) % 2 === 1;

  // Check if this is a sheep flock position
  const isFlock = isSheepFlockPosition(row, col);

  return (
    <div
      className={`
        relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center
        cursor-pointer transition-all duration-150
        ${isDark ? 'bg-[#8FBC8F]' : 'bg-[#A5D6A7]'}
        ${isSelected ? 'ring-4 ring-yellow-400 ring-opacity-80 z-10' : ''}
        ${isValidMove && !piece ? 'hover:bg-yellow-200' : ''}
        ${phase === 'setup' && !piece ? 'hover:bg-blue-200' : ''}
      `}
      onClick={handleClick}
      style={{
        boxShadow: isSelected ? '0 0 12px rgba(255, 215, 0, 0.6)' : 'none',
      }}
    >
      {/* Flock indicator background */}
      {isFlock && (
        <div className="absolute inset-1 rounded bg-amber-100/40 border-2 border-dashed border-amber-400/50 z-[1]" />
      )}

      {/* Valid move indicator */}
      {isValidMove && !piece && (
        <div className="absolute inset-0 flex items-center justify-center z-[2]">
          <div className="w-4 h-4 rounded-full bg-yellow-500 opacity-60 animate-pulse" />
        </div>
      )}

      {/* Setup phase: available placement indicator */}
      {phase === 'setup' && !piece && (
        <div className="absolute inset-0 flex items-center justify-center z-[2]">
          <div className="w-3 h-3 rounded-full bg-blue-400 opacity-40 animate-pulse" />
        </div>
      )}

      {/* Piece */}
      {piece && (
        <div
          className={`
            w-12 h-12 sm:w-14 sm:h-14 transition-transform duration-200 relative z-[3]
            ${isSelected ? 'scale-110' : 'hover:scale-105'}
          `}
        >
          {piece.type === 'dog' ? (
            <PixelDog className="w-full h-full drop-shadow-md" />
          ) : (
            <PixelSheep className="w-full h-full drop-shadow-md" />
          )}

          {/* Flock count badge */}
          {piece.type === 'sheep' && flockCount && flockCount > 1 && (
            <div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white"
              style={{ fontFamily: '"ZCOOL KuaiLe", cursive' }}
            >
              {flockCount}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GameBoard() {
  const { board, selectedPiece, validMoves, moveTo, phase, flockCounts } = useGameStore();

  const isValidMovePosition = (row: number, col: number): boolean => {
    return validMoves.some((m) => m.row === row && m.col === col);
  };

  const isSelectedPosition = (row: number, col: number): boolean => {
    return selectedPiece?.position.row === row && selectedPiece?.position.col === col;
  };

  const handleCellClick = (position: Position) => {
    moveTo(position);
  };

  const getFlockCount = (row: number, col: number): number | undefined => {
    const key = `${row},${col}`;
    return flockCounts.get(key);
  };

  return (
    <div className="relative">
      {/* Wooden frame border */}
      <div
        className="p-3 rounded-lg relative"
        style={{
          background: 'linear-gradient(145deg, #8D6E63, #6D4C41)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1)',
        }}
      >
        <div className="relative grid grid-cols-5 gap-0 border-2 border-[#5D4037]">
          {/* SVG Path Grid overlay */}
          <PathGrid />

          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) => (
              <BoardCell
                key={`${rowIndex}-${colIndex}`}
                row={rowIndex}
                col={colIndex}
                piece={piece}
                isValidMove={isValidMovePosition(rowIndex, colIndex)}
                isSelected={isSelectedPosition(rowIndex, colIndex)}
                onCellClick={handleCellClick}
                flockCount={getFlockCount(rowIndex, colIndex)}
              />
            ))
          )}
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#8D6E63] rounded-full border-2 border-[#5D4037]" />
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#8D6E63] rounded-full border-2 border-[#5D4037]" />
      <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-[#8D6E63] rounded-full border-2 border-[#5D4037]" />
      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-[#8D6E63] rounded-full border-2 border-[#5D4037]" />
    </div>
  );
}
