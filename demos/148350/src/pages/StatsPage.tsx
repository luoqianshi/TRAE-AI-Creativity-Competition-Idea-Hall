import { useApp } from "../store";
import Icon from "../components/Icon";
import { Flame, Target, Trophy, Sparkles, Calendar, Star } from "lucide-react";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default function StatsPage() {
  const { habits, records, getStats, unlockedIds, achievements } = useApp();
  const stats = getStats();

  // ── 12-week calendar heatmap (proper grid layout) ──
  const today = new Date();
  const totalDays = 84;
  const days: { date: string; count: number }[] = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().slice(0, 10);
    days.push({ date: ds, count: records.filter(r => r.date === ds && r.completed).length });
  }
  const maxCount = Math.max(1, ...days.map(d => d.count));
  const getHeatColor = (count: number) => {
    if (count === 0) return "bg-gray-100";
    const p = count / maxCount;
    if (p <= 0.25) return "bg-orange-100";
    if (p <= 0.5) return "bg-orange-200";
    if (p <= 0.75) return "bg-orange-400";
    return "bg-warm-orange";
  };

  // ── Category breakdown ──
  const catCounts = new Map<string, number>();
  for (const r of records) {
    if (r.completed) {
      const h = habits.find(x => x.id === r.habitId);
      if (h) catCounts.set(h.category, (catCounts.get(h.category) || 0) + 1);
    }
  }
  const total = stats.totalCheckIns || 1;
  const catColors: Record<string, string> = { "学习": "#5B8FCF", "运动": "#FF8C42", "生活": "#6DC77A", "心理": "#9B8FD4" };
  const catIcons: Record<string, string> = { "学习": "book", "运动": "dumbbell", "生活": "sun", "心理": "brain" };

  // ── Habit ranking ──
  const habitRank = habits
    .map(h => {
      const cnt = records.filter(r => r.habitId === h.id && r.completed).length;
      return { ...h, count: cnt, pct: Math.round((cnt / total) * 100) };
    })
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-dark-brown">数据统计</h1>
        <p className="text-sm text-gray-400 mt-0.5">你的成长，都看得见</p>
      </div>

      {/* ── Big stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Flame, label: "当前连续", value: `${stats.currentStreak}天`, color: "#FF8C42" },
          { icon: Target, label: "最长连续", value: `${stats.longestStreak}天`, color: "#5B8FCF" },
          { icon: Trophy, label: "累计打卡", value: `${stats.totalCheckIns}次`, color: "#6DC77A" },
          { icon: Sparkles, label: "完美日", value: `${stats.perfectDays}天`, color: "#9B8FD4" },
        ].map((s, i) => (
          <div key={i} className="mp-card px-4 py-4 text-center animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2" style={{ backgroundColor: `${s.color}12` }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div className="text-xl font-bold text-dark-brown">{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Calendar heatmap ── */}
      <div className="mp-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-dark-brown text-sm">打卡热力图</h3>
          <span className="text-xs text-gray-300 ml-auto">近12周</span>
        </div>
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="flex gap-0.5 min-w-fit">
            {/* Weekday labels column */}
            <div className="flex flex-col gap-0.5 mr-1 pt-4">
              {WEEKDAYS.map((d, i) => (
                <div key={i} className="h-3 w-4 flex items-center justify-end">
                  <span className="text-[9px] text-gray-300">{i % 2 === 0 ? d : ""}</span>
                </div>
              ))}
            </div>
            {/* Day cells */}
            <div className="flex gap-0.5 flex-1">
              {Array.from({ length: Math.ceil(days.length / 7) * 7 }, (_, i) => i).map(col => {
                const weekDaysInCol = [];
                for (let row = 0; row < 7; row++) {
                  const idx = col * 7 + row;
                  if (idx < days.length) {
                    weekDaysInCol.push(days[idx]);
                  }
                }
                return (
                  <div key={col} className="flex flex-col gap-0.5">
                    {weekDaysInCol.map((d, row) => (
                      <div
                        key={`${col}-${row}`}
                        className={`w-3 h-3 rounded-sm ${getHeatColor(d.count)}`}
                        title={`${d.date}: ${d.count}次`}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3 justify-end">
          <span className="text-[10px] text-gray-300">少</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-gray-100" />
          <div className="w-2.5 h-2.5 rounded-sm bg-orange-100" />
          <div className="w-2.5 h-2.5 rounded-sm bg-orange-200" />
          <div className="w-2.5 h-2.5 rounded-sm bg-orange-400" />
          <div className="w-2.5 h-2.5 rounded-sm bg-warm-orange" />
          <span className="text-[10px] text-gray-300">多</span>
        </div>
      </div>

      {/* ── Category breakdown + habit ranking ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Category */}
        <div className="mp-card p-4 sm:p-5">
          <h3 className="font-semibold text-dark-brown text-sm mb-4">分类分布</h3>
          <div className="space-y-3">
            {["学习", "运动", "生活", "心理"].map(cat => {
              const cnt = catCounts.get(cat) || 0;
              const pct = Math.round((cnt / total) * 100);
              if (habits.filter(h => h.category === cat).length === 0) return null;
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon name={catIcons[cat] || "book"} size={14} color={catColors[cat]} />
                      <span className="text-gray-500">{cat}</span>
                    </div>
                    <span className="font-semibold text-dark-brown">{cnt}次</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: catColors[cat] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habit ranking */}
        <div className="mp-card p-4 sm:p-5">
          <h3 className="font-semibold text-dark-brown text-sm mb-4">习惯排名</h3>
          {habitRank.length > 0 ? (
            <div className="space-y-2">
              {habitRank.map((h, idx) => (
                <div key={h.id} className="flex items-center gap-3 py-1.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? "bg-warm-orange text-white" : idx === 1 ? "bg-gray-200 text-gray-500" : "bg-gray-100 text-gray-400"
                  }`}>
                    {idx + 1}
                  </div>
                  <Icon name={h.icon} size={16} color={h.color} />
                  <span className="flex-1 text-sm text-dark-brown font-medium truncate">{h.name}</span>
                  <span className="text-xs font-semibold text-gray-400">{h.count}次</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-300 text-sm">暂无数据</div>
          )}
        </div>
      </div>

      {/* ── Achievements ── */}
      <div className="mp-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-warm-orange" />
          <h3 className="font-semibold text-dark-brown text-sm">成就徽章</h3>
          <span className="text-xs text-gray-300 ml-auto">{unlockedIds.size}/{achievements.length}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {achievements.map(a => {
            const unlocked = unlockedIds.has(a.id);
            return (
              <div
                key={a.id}
                className={`rounded-2xl p-3 text-center border transition-all ${
                  unlocked
                    ? "bg-warm-orange/5 border-warm-orange/20"
                    : "bg-gray-50 border-gray-100 opacity-50 grayscale"
                }`}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-1.5 ${
                  unlocked ? "bg-warm-orange/15" : "bg-gray-100"
                }`}>
                  <Icon name={a.icon} size={20} className={unlocked ? "text-warm-orange" : "text-gray-300"} />
                </div>
                <div className="text-xs font-semibold text-dark-brown">{a.name}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{a.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
