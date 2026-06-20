import { useGameStore } from '@/store/gameStore';
import GameBoard from '@/components/GameBoard';
import GameStatus from '@/components/GameStatus';
import GameOverModal from '@/components/GameOverModal';

export default function GamePage() {
  const { backToMenu, resetGame, phase } = useGameStore();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative"
      style={{
        background: 'linear-gradient(180deg, #87CEEB 0%, #E0F7FA 30%, #C8E6C9 70%, #A5D6A7 100%)',
      }}
    >
      {/* Background decorations */}
      <div className="absolute top-8 left-8 text-5xl opacity-30">☁️</div>
      <div className="absolute top-16 right-12 text-4xl opacity-20">☁️</div>
      <div className="absolute bottom-8 left-1/4 text-3xl opacity-40">🌿</div>
      <div className="absolute bottom-12 right-1/4 text-3xl opacity-40">🌱</div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Title */}
        <h1
          className="text-2xl sm:text-3xl font-bold text-[#5D4037]"
          style={{
            fontFamily: '"ZCOOL KuaiLe", cursive',
            textShadow: '2px 2px 0px rgba(255,255,255,0.8)',
          }}
        >
          牧羊犬与羊
        </h1>

        {/* Game Status */}
        <GameStatus />

        {/* Game Board */}
        <GameBoard />

        {/* Control buttons - only show during playing phase */}
        {phase !== 'setup' && (
          <div className="flex gap-4 mt-4">
            <button
              onClick={resetGame}
              className="px-4 py-2 rounded-lg text-white font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                fontFamily: '"ZCOOL KuaiLe", cursive',
                background: 'linear-gradient(135deg, #42A5F5, #1976D2)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              🔄 重新开始
            </button>
            <button
              onClick={backToMenu}
              className="px-4 py-2 rounded-lg text-gray-700 font-bold text-sm transition-all hover:scale-105 active:scale-95 bg-white/80 hover:bg-white"
              style={{
                fontFamily: '"ZCOOL KuaiLe", cursive',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              🏠 主菜单
            </button>
          </div>
        )}

        {/* Setup phase hint */}
        {phase === 'setup' && (
          <button
            onClick={backToMenu}
            className="px-4 py-2 rounded-lg text-gray-700 font-bold text-sm transition-all hover:scale-105 active:scale-95 bg-white/80 hover:bg-white"
            style={{
              fontFamily: '"ZCOOL KuaiLe", cursive',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            🏠 返回主菜单
          </button>
        )}
      </div>

      {/* Game Over Modal */}
      <GameOverModal />
    </div>
  );
}
