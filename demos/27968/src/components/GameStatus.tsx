import { useGameStore } from '@/store/gameStore';
import { getTotalSheepCount, getBoardSheepCount, getTotalBoardSheepCount } from '@/lib/gameLogic';
import PixelDog from './PixelDog';
import PixelSheep from './PixelSheep';

export default function GameStatus() {
  const { currentPlayer, board, isThinking, mode, phase, dogsPlaced, penCount, flockCounts, humanPlayer } = useGameStore();

  const dogCount = board.flat().filter((p) => p?.type === 'dog').length;
  const boardSheep = getBoardSheepCount(board);
  const totalBoardSheep = getTotalBoardSheepCount(board, flockCounts);
  const totalSheep = getTotalSheepCount(board, penCount, flockCounts);

  // Setup phase
  if (phase === 'setup') {
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <div
          className="px-6 py-3 rounded-lg text-white font-bold text-lg"
          style={{
            fontFamily: '"ZCOOL KuaiLe", cursive',
            background: 'linear-gradient(135deg, #42A5F5, #1976D2)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          <span className="flex items-center gap-2">
            <PixelDog className="w-6 h-6" />
            放置牧羊犬 {dogsPlaced}/2
          </span>
        </div>
        <p
          className="text-sm text-[#5D4037] opacity-80"
          style={{ fontFamily: '"ZCOOL KuaiLe", cursive' }}
        >
          点击空白格子放置牧羊犬（不能放在羊群上）
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {/* Turn indicator */}
      <div
        className="px-6 py-3 rounded-lg text-white font-bold text-lg"
        style={{
          fontFamily: '"ZCOOL KuaiLe", cursive',
          background: currentPlayer === 'dog'
            ? 'linear-gradient(135deg, #D2691E, #8B4513)'
            : 'linear-gradient(135deg, #81C784, #4CAF50)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        {isThinking ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">🤔</span>
            AI 思考中...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            {currentPlayer === 'dog' ? (
              <>
                <PixelDog className="w-6 h-6" />
                {mode === 'pve' && humanPlayer === 'sheep' ? 'AI 牧羊犬回合' : '牧羊犬回合'}
              </>
            ) : (
              <>
                <PixelSheep className="w-6 h-6" />
                {mode === 'pve' && humanPlayer === 'dog' ? 'AI 羊群回合' : '羊群回合'}
              </>
            )}
          </span>
        )}
      </div>

      {/* Piece counters */}
      <div className="flex gap-4">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <PixelDog className="w-8 h-8" />
          <span
            className="text-xl font-bold text-[#8B4513]"
            style={{ fontFamily: '"ZCOOL KuaiLe", cursive' }}
          >
            x{dogCount}
          </span>
        </div>

        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <PixelSheep className="w-8 h-8" />
          <span
            className="text-xl font-bold text-[#2E7D32]"
            style={{ fontFamily: '"ZCOOL KuaiLe", cursive' }}
          >
            x{totalSheep}
          </span>
        </div>

        {/* Pen indicator */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <span className="text-2xl">🏠</span>
          <span
            className="text-xl font-bold text-[#5D4037]"
            style={{ fontFamily: '"ZCOOL KuaiLe", cursive' }}
          >
            x{penCount}
          </span>
        </div>
      </div>

      {/* Board vs Pen breakdown */}
      <div
        className="text-xs text-[#5D4037] opacity-70"
        style={{ fontFamily: '"ZCOOL KuaiLe", cursive' }}
      >
        场上: {totalBoardSheep} 只 | 羊圈: {penCount} 只
      </div>
    </div>
  );
}
