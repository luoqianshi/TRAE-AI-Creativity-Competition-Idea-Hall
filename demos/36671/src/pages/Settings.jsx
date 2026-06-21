import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import AnimatedPage from '../components/AnimatedPage';
import Card from '../components/Card';
import { useStorage } from '../hooks/useStorage';
export default function Settings() {
  const navigate = useNavigate();
  const { ask, dialog } = useConfirmDialog();
  const [magnets, setMagnets] = useStorage('fm_magnets', []);
  const [footprints, setFootprints] = useStorage('fm_footprints', []);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('fm_settings');
    if (saved) {
      const s = JSON.parse(saved);
      setNotifications(s.notifications ?? true);
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('fm_settings', JSON.stringify({ notifications }));
  };

  const resetData = () => {
    ask('确定要重置所有数据吗？', () => {
      setMagnets([]);
      setFootprints([]);
    });
  };

  return (
    <AnimatedPage type="fade">
            <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-xl flex items-center justify-center tap-active shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div>
          <h2 className="text-xl font-bold">设置</h2>
          <p className="text-text-secondary text-xs">应用设置</p>
        </div>
      </div>

      <Card className="mb-4">
        <p className="text-xs font-medium text-text-secondary mb-2">数据管理</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">冰箱贴</span>
            <span className="text-sm text-text-secondary">{magnets.length} 个</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">旅行足迹</span>
            <span className="text-sm text-text-secondary">{footprints.length} 条</span>
          </div>
          <button onClick={resetData} className="w-full py-2.5 bg-red-50 text-red-500 rounded-xl text-sm tap-active">重置数据</button>
        </div>
      </Card>

      
      {dialog}
    </AnimatedPage>
  );
}
