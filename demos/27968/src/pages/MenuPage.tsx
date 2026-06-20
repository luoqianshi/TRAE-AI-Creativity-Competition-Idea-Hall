import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import PixelDog from '@/components/PixelDog';
import PixelSheep from '@/components/PixelSheep';
import RulesModal from '@/components/RulesModal';
import type { Player } from '@/types/game';

export default function MenuPage() {
  const { startGame } = useGameStore();
  const [showRules, setShowRules] = useState(false);
  const [showSideSelect, setShowSideSelect] = useState(false);

  const handlePvEClick = () => {
    setShowSideSelect(true);
  };

  const handleSideSelect = (side: Player) => {
    setShowSideSelect(false);
    startGame('pve', side);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #87CEEB 0%, #E0F7FA 40%, #A5D6A7 100%)',
      }}
    >
      {/* Cloud decorations */}
      <div className="absolute top-10 left-10 text-6xl opacity-60 animate-pulse" style={{ animationDuration: '4s' }}>
        ☁️
      </div>
      <div className="absolute top-20 right-20 text-5xl opacity-50 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}>
        ☁️
      </div>
      <div className="absolute top-32 left-1/3 text-4xl opacity-40 animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}>
        ☁️
      </div>

      {/* Grass decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#7CB342] to-transparent opacity-60" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Title */}
        <div className="flex items-center gap-4 mb-4">
          <PixelDog className="w-16 h-16 sm:w-20 sm:h-20 animate-bounce" style={{ animationDuration: '2s' }} />
          <h1
            className="text-4xl sm:text-6xl font-bold text-center"
            style={{
              fontFamily: '"ZCOOL KuaiLe", cursive',
              color: '#5D4037',
              textShadow: '3px 3px 0px rgba(255,255,255,0.8), 5px 5px 0px rgba(0,0,0,0.1)',
            }}
          >
            牧羊犬与羊
          </h1>
          <PixelSheep className="w-16 h-16 sm:w-20 sm:h-20 animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
        </div>

        {/* Subtitle */}
        <p
          className="text-lg text-[#5D4037] opacity-80 mb-4"
          style={{ fontFamily: '"ZCOOL KuaiLe", cursive' }}
        >
          像素风策略棋类游戏
        </p>

        {/* Game mode buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => startGame('pvp')}
            className="px-8 py-4 rounded-xl text-white font-bold text-xl transition-all hover:scale-105 active:scale-95"
            style={{
              fontFamily: '"ZCOOL KuaiLe", cursive',
              background: 'linear-gradient(135deg, #66BB6A, #43A047)',
              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
            }}
          >
            👥 双人对战
          </button>

          <button
            onClick={handlePvEClick}
            className="px-8 py-4 rounded-xl text-white font-bold text-xl transition-all hover:scale-105 active:scale-95"
            style={{
              fontFamily: '"ZCOOL KuaiLe", cursive',
              background: 'linear-gradient(135deg, #FF8A65, #F4511E)',
              boxShadow: '0 6px 20px rgba(244, 81, 30, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
            }}
          >
            🤖 人机对战
          </button>

          <button
            onClick={() => setShowRules(true)}
            className="px-8 py-4 rounded-xl text-[#5D4037] font-bold text-xl transition-all hover:scale-105 active:scale-95 bg-white/80 hover:bg-white"
            style={{
              fontFamily: '"ZCOOL KuaiLe", cursive',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            📜 游戏规则
          </button>
        </div>

        {/* Decorative animals at bottom */}
        <div className="flex gap-8 mt-8">
          <div className="flex flex-col items-center">
            <PixelDog className="w-12 h-12" />
            <span className="text-xs text-[#5D4037] mt-1" style={{ fontFamily: '"ZCOOL KuaiLe", cursive' }}>x2</span>
          </div>
          <div className="flex flex-col items-center">
            <PixelSheep className="w-12 h-12" />
            <span className="text-xs text-[#5D4037] mt-1" style={{ fontFamily: '"ZCOOL KuaiLe", cursive' }}>x24</span>
          </div>
        </div>
      </div>

      {/* Side Selection Modal */}
      {showSideSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className="relative px-6 py-8 rounded-2xl max-w-sm w-full"
            style={{
              background: 'linear-gradient(145deg, #FFF8E1, #FFECB3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.8)',
              border: '4px solid #8D6E63',
            }}
          >
            <button
              onClick={() => setShowSideSelect(false)}
              className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>

            <h2
              className="text-2xl font-bold mb-6 text-center"
              style={{
                fontFamily: '"ZCOOL KuaiLe", cursive',
                color: '#5D4037',
              }}
            >
              选择你的阵营
            </h2>

            <p
              className="text-center text-gray-600 mb-6"
              style={{ fontFamily: '"ZCOOL KuaiLe", cursive' }}
            >
              你想扮演哪一方？
            </p>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handleSideSelect('dog')}
                className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #FF8A65, #F4511E)',
                  boxShadow: '0 4px 12px rgba(244, 81, 30, 0.4)',
                }}
              >
                <PixelDog className="w-16 h-16" />
                <span
                  className="text-white font-bold text-lg"
                  style={{ fontFamily: '"ZCOOL KuaiLe", cursive' }}
                >
                  牧羊犬
                </span>
                <span
                  className="text-white/80 text-sm"
                  style={{ fontFamily: '"ZCOOL KuaiLe", cursive' }}
                >
                  先手 · 主动进攻
                </span>
              </button>

              <button
                onClick={() => handleSideSelect('sheep')}
                className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #66BB6A, #43A047)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                }}
              >
                <PixelSheep className="w-16 h-16" />
                <span
                  className="text-white font-bold text-lg"
                  style={{ fontFamily: '"ZCOOL KuaiLe", cursive' }}
                >
                  羊群
                </span>
                <span
                  className="text-white/80 text-sm"
                  style={{ fontFamily: '"ZCOOL KuaiLe", cursive' }}
                >
                  后手 · 围困防守
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
