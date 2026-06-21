import AnimatedPage from '../components/AnimatedPage';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';

export default function About() {
  const navigate = useNavigate();
  return (
    <AnimatedPage type="fade">
            <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-xl flex items-center justify-center tap-active shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div>
          <h2 className="text-xl font-bold">关于</h2>
          <p className="text-text-secondary text-xs">冰箱贴集应用</p>
        </div>
      </div>

      <Card className="mb-4 text-center py-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-teal-100 rounded-2xl flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 56 56" fill="none">
            <rect x="12" y="8" width="32" height="32" rx="4" stroke="#0d9488" strokeWidth="2" fill="none" />
            <circle cx="28" cy="24" r="8" stroke="#0d9488" strokeWidth="1.5" fill="none" />
            <rect x="22" y="40" width="12" height="6" rx="1" stroke="#0d9488" strokeWidth="2" fill="none" />
            <line x1="28" y1="40" x2="28" y2="46" stroke="#0d9488" strokeWidth="1.5" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">冰箱贴集</h3>
        <p className="text-sm text-text-secondary mb-1">版本 1.0.0</p>
        <p className="text-xs text-text-secondary">冰箱贴收藏与旅行足迹记录</p>
      </Card>

      <Card className="mb-4">
        <p className="text-sm font-medium mb-2">功能介绍</p>
        <div className="space-y-2">
          <p className="text-xs text-text-secondary leading-relaxed">冰箱贴集是一款帮助你管理和展示冰箱贴收藏的应用。支持多种主题和材质分类，记录每枚冰箱贴的来源地和故事。</p>
          <p className="text-xs text-text-secondary leading-relaxed">通过旅行足迹功能，帮助你追踪每次旅行中收集的冰箱贴，记录你的旅行历程。</p>
        </div>
      </Card>

      <Card className="mb-4">
        <p className="text-sm font-medium mb-2">使用提示</p>
        <div className="space-y-2">
          <p className="text-xs text-text-secondary">• 按主题分类整理冰箱贴更有序</p>
          <p className="text-xs text-text-secondary">• 记录来源地方便回忆旅行故事</p>
          <p className="text-xs text-text-secondary">• 记录旅行足迹留下美好回忆</p>
          <p className="text-xs text-text-secondary">• 定期检查品相保护收藏价值</p>
        </div>
      </Card>

      
    </AnimatedPage>
  );
}
