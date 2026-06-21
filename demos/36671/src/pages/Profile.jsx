import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage';
import Card from '../components/Card';
import { useStorage } from '../hooks/useStorage';
import { ACHIEVEMENTS, calculateStats } from '../data/fridgeMagnet';

export default function Profile() {
  const navigate = useNavigate();
  const [magnets] = useStorage('fm_magnets', []);
  const [footprints] = useStorage('fm_footprints', []);
  const [profile, setProfile] = useState({ name: '', bio: '', avatar: '🧲' });

  useEffect(() => {
    const saved = localStorage.getItem('fm_profile');
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  const stats = calculateStats(magnets, footprints);

  const checkAchievement = (id) => {
    switch (id) {
      case 'first_magnet': return stats.totalMagnets >= 1;
      case 'first_footprint': return stats.totalFootprints >= 1;
      case 'all_themes': return stats.themes.size >= 6;
      case 'all_materials': return stats.materials.size >= 6;
      case 'ten_magnets': return stats.totalMagnets >= 10;
      case 'seven_days': return stats.streakDays >= 7;
      case 'five_footprints': return stats.totalFootprints >= 5;
      case 'master': return stats.totalMagnets >= 30;
      default: return false;
    }
  };

  const unlockedCount = ACHIEVEMENTS.filter(a => checkAchievement(a.id)).length;

  return (
    <AnimatedPage type="fade">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">我的</h2>
        <p className="text-text-secondary text-sm">个人中心</p>
      </div>

      <Card className="mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl">
            {profile.avatar}
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold">{profile.name || '未设置昵称'}</p>
            <p className="text-xs text-text-secondary">{profile.bio || '点击编辑资料'}</p>
          </div>
          <button onClick={() => navigate('/profile-edit')} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs tap-active">编辑</button>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.totalMagnets}</p>
          <p className="text-[10px] text-text-secondary">冰箱贴</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-cyan-600">{stats.totalFootprints}</p>
          <p className="text-[10px] text-text-secondary">足迹</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-blue-500">{stats.streakDays}</p>
          <p className="text-[10px] text-text-secondary">连续天数</p>
        </Card>
      </div>

      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-text-secondary">成就</p>
          <p className="text-xs text-blue-600">{unlockedCount}/{ACHIEVEMENTS.length}</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {ACHIEVEMENTS.map(ach => {
            const unlocked = checkAchievement(ach.id);
            return (
              <div key={ach.id} className={`text-center p-2 rounded-xl ${unlocked ? 'bg-blue-50' : 'bg-gray-50 opacity-50'}`}>
                <span className="text-lg block mb-1">{ach.icon}</span>
                <p className="text-[10px] font-medium">{ach.name}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="space-y-2">
        <Card className="tap-active" onClick={() => navigate('/settings')}>
          <div className="flex items-center justify-between">
            <span className="text-sm">设置</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </Card>
        <Card className="tap-active" onClick={() => navigate('/about')}>
          <div className="flex items-center justify-between">
            <span className="text-sm">关于</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-secondary">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </Card>
      </div>
    </AnimatedPage>
  );
}
