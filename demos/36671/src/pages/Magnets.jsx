import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import Card from '../components/Card';
import { useStorage } from '../hooks/useStorage';
import { MAGNET_THEMES } from '../data/fridgeMagnet';

export default function Magnets() {
  const navigate = useNavigate();
  const [magnets, setMagnets] = useStorage('fm_magnets', []);
  const [filter, setFilter] = useState('all');

  const sortedMagnets = [...magnets].sort((a, b) => b.date.localeCompare(a.date));
  const filtered = filter === 'all' ? sortedMagnets : sortedMagnets.filter(m => m.theme === filter);

  const deleteMagnet = (id) => {
    setMagnets(prev => prev.filter(m => m.id !== id));
  };

  return (
    <AnimatedPage type="fade">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">冰箱贴库</h2>
        <p className="text-text-secondary text-sm">我的冰箱贴收藏</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap tap-active ${filter === 'all' ? 'btn-primary text-white' : 'bg-gray-100 text-text-secondary'}`}>
          全部
        </button>
        {MAGNET_THEMES.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap tap-active ${filter === t.id ? 'btn-primary text-white' : 'bg-gray-100 text-text-secondary'}`}>
            {t.icon} {t.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-4xl mb-3">🧲</p>
          <p className="text-sm text-text-secondary mb-4">还没有冰箱贴</p>
          <button onClick={() => navigate('/add-magnet')} className="px-6 py-3 btn-primary text-white rounded-xl text-sm font-medium tap-active">
            收集第一枚冰箱贴
          </button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((magnet, i) => {
            const theme = MAGNET_THEMES.find(t => t.id === magnet.theme);
            return (
              <Card key={magnet.id} className="stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {theme?.icon || '🧲'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{magnet.name}</p>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">{magnet.origin}</span>
                    </div>
                    <p className="text-[10px] text-text-secondary mb-1">{magnet.date} · {magnet.material === 'ceramic' ? '陶瓷' : magnet.material === 'metal' ? '金属' : magnet.material === 'acrylic' ? '亚克力' : magnet.material === 'wood' ? '木质' : magnet.material === 'resin' ? '树脂' : '橡胶'}</p>
                    {magnet.notes && <p className="text-xs text-text-secondary mt-1 line-clamp-2">{magnet.notes}</p>}
                  </div>
                  <button onClick={() => deleteMagnet(magnet.id)} className="p-2 text-gray-400 hover:text-red-500 tap-active flex-shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                    </svg>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <button onClick={() => navigate('/add-magnet')} className="fixed bottom-24 right-4 w-14 h-14 btn-primary text-white rounded-full shadow-lg flex items-center justify-center tap-active z-40">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </AnimatedPage>
  );
}
