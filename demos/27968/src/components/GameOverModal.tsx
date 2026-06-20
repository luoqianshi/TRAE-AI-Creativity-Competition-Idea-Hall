import { useGameStore } from '@/store/gameStore';
import PixelDog from './PixelDog';
import PixelSheep from './PixelSheep';

export default function GameOverModal() {
  const { winner, resetGame, backToMenu } = useGameStore();

  if (!winner) return null;

  const isDogWin = winner === 'dog';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="relative px-8 py-10 rounded-2xl text-center max-w-sm w-full mx-4"
        style={{
          background: 'linear-gradient(145deg, #FFF8E1, #FFECB3)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.8)',
          border: '4px solid #8D6E63',
        }}
      >
        {/* Winner icon */}
        <div className="flex justify-center mb-4">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: isDogWin
                ? 'linear-gradient(135deg, #D2691E, #8B4513)'
                : 'linear-gradient(135deg, #81C784, #4CAF50)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            {isDogWin ? (
              <PixelDog className="w-16 h-16" />
            ) : (
              <PixelSheep className="w-16 h-16" />
            )}
          </div>
        </div>

        {/* Winner text */}
        <h2
          className="text-3xl font-bold mb-2"
          style={{
            fontFamily: '"ZCOOL KuaiLe", cursive',
            color: isDogWin ? '#8B4513' : '#2E7D32',
            textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
          }}
        >
          {isDogWin ? '🎉 牧羊犬获胜!' : '🎉 羊群获胜!'}
        </h2>

        <p
          className="text-gray-600 mb-8 text-sm"
          style={{ fontFamily: '"ZCOOL KuaiLe", cursive' }}
        >
          {isDogWin
            ? '牧羊犬成功将大部分羊赶回了羊圈！'
            : '羊群成功围困了所有牧羊犬，保护了同伴！'}
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={resetGame}
            className="px-6 py-3 rounded-lg text-white font-bold text-lg transition-transform hover:scale-105 active:scale-95"
            style={{
              fontFamily: '"ZCOOL KuaiLe", cursive',
              background: 'linear-gradient(135deg, #66BB6A, #43A047)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            再来一局
          </button>
          <button
            onClick={backToMenu}
            className="px-6 py-3 rounded-lg text-gray-700 font-bold text-lg transition-transform hover:scale-105 active:scale-95 bg-white/80 hover:bg-white"
            style={{
              fontFamily: '"ZCOOL KuaiLe", cursive',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            返回主菜单
          </button>
        </div>

        {/* Decorative stars */}
        <div className="absolute -top-3 -left-3 text-2xl animate-bounce">⭐</div>
        <div className="absolute -top-2 -right-4 text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
        <div className="absolute -bottom-3 -left-4 text-xl animate-bounce" style={{ animationDelay: '0.4s' }}>🌟</div>
        <div className="absolute -bottom-2 -right-3 text-2xl animate-bounce" style={{ animationDelay: '0.6s' }}>⭐</div>
      </div>
    </div>
  );
}
