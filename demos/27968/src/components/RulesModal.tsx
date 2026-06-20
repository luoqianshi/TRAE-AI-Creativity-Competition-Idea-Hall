interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="relative px-6 py-8 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(145deg, #FFF8E1, #FFECB3)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.8)',
          border: '4px solid #8D6E63',
        }}
      >
        <button
          onClick={onClose}
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
          📜 游戏规则
        </h2>

        <div className="space-y-4 text-sm text-gray-700" style={{ fontFamily: '"ZCOOL KuaiLe", cursive' }}>
          <div className="bg-white/60 rounded-lg p-4">
            <h3 className="font-bold text-[#8B4513] mb-2">🎮 棋盘布局</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>5×5 棋盘，共 25 个交叉点</li>
              <li>四个羊群，分别位于 (1,1)、(1,3)、(3,1)、(3,3)，每群初始各有 6 只羊</li>

              <li>2 只牧羊犬由玩家开局时自由放置（不能放在羊群上）</li>
            </ul>
          </div>

          <div className="bg-white/60 rounded-lg p-4">
            <h3 className="font-bold text-[#2E7D32] mb-2">🎯 移动规则</h3>
            <ul className="list-disc list-inside space-y-1">

              <li><strong>牧羊犬</strong>：可以跳过相邻的羊，将其<strong>赶回羊圈</strong></li>
              <li><strong>羊群</strong>：只能移动，不能赶牧羊犬；离开羊群后<strong>不可返回</strong>原羊群</li>
              <li>羊群位置空了之后，<strong>不会</strong>从羊圈中补充羊回来</li>
              <li>必须移动，不能跳过回合</li>
            </ul>
          </div>

          <div className="bg-white/60 rounded-lg p-4">
            <h3 className="font-bold text-[#5D4037] mb-2">🏆 胜负判定</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>牧羊犬先手</li>
              <li>牧羊犬胜利：场上所有羊都被赶回羊圈（场上羊数量为 0）</li>
              <li>羊群胜利：所有牧羊犬都被围困，无法移动</li>
            </ul>
          </div>

          <div className="bg-white/60 rounded-lg p-4">
            <h3 className="font-bold text-[#1565C0] mb-2">💡 策略提示</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>牧羊犬：寻找机会将羊赶回羊圈，利用斜线位置扩大移动范围</li>
              <li>羊群：协同合作，利用路径限制压缩牧羊犬的活动空间</li>

            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
