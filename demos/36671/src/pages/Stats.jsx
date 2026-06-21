import AnimatedPage from '../components/AnimatedPage';
import Card from '../components/Card';
import { useStorage } from '../hooks/useStorage';
import { MAGNET_THEMES, MAGNET_MATERIALS, ACHIEVEMENTS, calculateStats } from '../data/fridgeMagnet';

export default function Stats() {
  const [magnets] = useStorage('fm_magnets', []);
  const [footprints] = useStorage('fm_footprints', []);
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

  return (
    <AnimatedPage type="fade">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">数据统计</h2>
        <p className="text-text-secondary text-sm">冰箱贴数据概览</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.totalMagnets}</p>
          <p className="text-xs text-text-secondary">冰箱贴数量</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-cyan-600">{stats.totalFootprints}</p>
          <p className="text-xs text-text-secondary">旅行足迹</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-blue-500">{stats.origins.size}</p>
          <p className="text-xs text-text-secondary">到访城市</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-cyan-500">{stats.streakDays}</p>
          <p className="text-xs text-text-secondary">连续天数</p>
        </Card>
      </div>

      <Card className="mb-4">
        <p className="text-xs font-medium text-text-secondary mb-3">冰箱贴主题分布</p>
        <div className="space-y-2">
          {MAGNET_THEMES.map(theme => {
            const count = stats.themeCounts[theme.id] || 0;
            const percent = stats.totalMagnets > 0 ? Math.round(count / stats.totalMagnets * 100) : 0;
            return (
              <div key={theme.id} className="flex items-center gap-3">
                <span className="text-lg w-8">{theme.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium">{theme.name}</span>
                    <span className="text-xs text-text-secondary">{count}个</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="mb-4">
        <p className="text-xs font-medium text-text-secondary mb-3">材质分布</p>
        <div className="space-y-2">
          {MAGNET_MATERIALS.map(mat => {
            const count = stats.materialCounts[mat.id] || 0;
            const percent = stats.totalMagnets > 0 ? Math.round(count / stats.totalMagnets * 100) : 0;
            return (
              <div key={mat.id} className="flex items-center gap-3">
                <span className="text-lg w-8">{mat.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium">{mat.name}</span>
                    <span className="text-xs text-text-secondary">{count}个</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: '#3b82f6' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <p className="text-xs font-medium text-text-secondary mb-3">成就</p>
        <div className="grid grid-cols-4 gap-2">
          {ACHIEVEMENTS.map(ach => {
            const unlocked = checkAchievement(ach.id);
            return (
              <div key={ach.id} className={`text-center p-2 rounded-xl ${unlocked ? 'bg-blue-50' : 'bg-gray-50 opacity-50'}`}>
                <span className="text-xl block mb-1">{ach.icon}</span>
                <p className="text-[10px] font-medium">{ach.name}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </AnimatedPage>
  );
}
