import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import Card from '../components/Card';
import { useStorage } from '../hooks/useStorage';
export default function Footprints() {
  const navigate = useNavigate();
  const [footprints, setFootprints] = useStorage('fm_footprints', []);

  const sortedFootprints = [...footprints].sort((a, b) => b.date.localeCompare(a.date));

  const deleteFootprint = (id) => {
    setFootprints(prev => prev.filter(f => f.id !== id));
  };

  return (
    <AnimatedPage type="fade">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">旅行足迹</h2>
        <p className="text-text-secondary text-sm">我的旅行记录</p>
      </div>

      {sortedFootprints.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-4xl mb-3">📍</p>
          <p className="text-sm text-text-secondary mb-4">还没有旅行足迹</p>
          <button onClick={() => navigate('/add-footprint')} className="px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium tap-active">
            记录第一次旅行
          </button>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedFootprints.map((footprint, i) => (
            <Card key={footprint.id} className="stagger-item" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  📍
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{footprint.location}</p>
                    <span className="text-[10px] px-2 py-0.5 bg-teal-100 text-teal-800 rounded-full">{footprint.trip}</span>
                  </div>
                  <p className="text-[10px] text-text-secondary mb-1">{footprint.date} · {footprint.magnetName}</p>
                  {footprint.notes && <p className="text-xs text-text-secondary mt-1 line-clamp-2">{footprint.notes}</p>}
                </div>
                <button onClick={() => deleteFootprint(footprint.id)} className="p-2 text-gray-400 hover:text-red-500 tap-active flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                  </svg>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <button onClick={() => navigate('/add-footprint')} className="fixed bottom-24 right-4 w-14 h-14 bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center tap-active z-40">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </AnimatedPage>
  );
}
