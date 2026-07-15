import { useState, useCallback, useRef } from "react";
import { useApp } from "../store";
import type { Achievement, Habit } from "../types";
import Icon from "../components/Icon";
import {
  Check, Flame, Trophy, Sparkles, Clock, Target,
} from "lucide-react";

const CONFETTI_COLORS = ["#FF8C42", "#6DC77A", "#5B8FCF", "#9B8FD4", "#FFD166", "#FF6B6B", "#4ECDC4"];

function ProgressRing({ pct, size = 80, strokeWidth = 6 }: { pct: number; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0e8e0" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#grad)" strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF8C42" />
            <stop offset="100%" stopColor="#FFB380" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-extrabold text-dark-brown">{pct}%</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { habits, todayChecked, checkIn, getStats, messages } = useApp();
  const [popup, setPopup] = useState<{ habit: Habit; achievements: Achievement[] } | null>(null);
  const [confetti, setConfetti] = useState(false);
  const stats = getStats();

  const handleCheckIn = useCallback((habit: Habit) => {
    const result = checkIn(habit.id);
    if (result.newAchievements.length > 0) {
      setPopup({ habit, achievements: result.newAchievements });
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1500);
    }
  }, [checkIn]);

  const progressPct = habits.length > 0 ? Math.round((stats.completedHabits / habits.length) * 100) : 0;
  const todayStr = new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" });

  // Random confetti pieces
  const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
    left: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 0.6,
  }));

  return (
    <div className="space-y-5">
      {/* ── Hero card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-warm-orange to-warm-orange-dark p-5 sm:p-6 text-white shadow-xl shadow-warm-orange/20">
        {/* Decorative bg circles */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <p className="text-white/70 text-sm mb-1">{todayStr}</p>
            <h1 className="text-2xl font-extrabold mb-2">
              {stats.currentStreak > 0 ? `已坚持 ${stats.currentStreak} 天` : "今日打卡"}
            </h1>
            {stats.currentStreak > 0 && (
              <div className="flex items-center gap-1.5 text-white/80 text-sm">
                <Flame className="w-4 h-4 text-orange-200" />
                你比昨天更好了
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            <ProgressRing pct={progressPct} size={90} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative z-10 mt-4">
          <div className="flex justify-between text-xs text-white/60 mb-1.5">
            <span>今日进度</span>
            <span>{stats.completedHabits}/{habits.length} 项</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Confetti */}
        {confetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confettiPieces.map((c, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${c.left}%`, top: "50%",
                  background: c.color,
                  ["--delay" as string]: `${c.delay}s`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Stats mini cards ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Flame, label: "最长连续", value: `${stats.longestStreak}天`, color: "text-warm-orange", bg: "bg-warm-orange/10" },
          { icon: Target, label: "累计打卡", value: `${stats.totalCheckIns}次`, color: "text-soft-blue", bg: "bg-soft-blue/10" },
          { icon: Trophy, label: "完美日", value: `${stats.perfectDays}天`, color: "text-mint-green", bg: "bg-mint-green/10" },
        ].map((item, i) => (
          <div key={i} className="mp-card px-3 py-3.5 text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${item.bg} mb-1.5`}>
              <item.icon className={`w-4.5 h-4.5 ${item.color}`} size={18} />
            </div>
            <div className="text-lg font-bold text-dark-brown">{item.value}</div>
            <div className="text-[11px] text-gray-400">{item.label}</div>
          </div>
        ))}
      </div>

      {/* ── AI greeting bubble ── */}
      {messages.length > 0 && messages[messages.length - 1].type === "greeting" && (
        <div className="flex gap-3 items-start bg-soft-blue/5 border border-soft-blue/10 rounded-2xl p-4 animate-fade-in-up">
          <div className="w-9 h-9 rounded-xl bg-soft-blue/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-soft-blue" />
          </div>
          <p className="text-sm text-dark-brown/80 leading-relaxed pt-0.5">
            {messages[messages.length - 1].content}
          </p>
        </div>
      )}

      {/* ── Habit list ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">今日习惯</h2>
          <span className="text-xs text-gray-300">
            {stats.completedHabits === habits.length && habits.length > 0 ? "全部完成!" : `${stats.completedHabits}/${habits.length}`}
          </span>
        </div>
        <div className="space-y-2.5">
          {habits.map((habit, idx) => {
            const done = todayChecked.has(habit.id);
            return (
              <div
                key={habit.id}
                className={`mp-card p-4 flex items-center gap-4 animate-fade-in-up ${
                  done ? "bg-mint-green/[0.04] border border-mint-green/20" : ""
                }`}
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                  style={{ backgroundColor: `${habit.color}15` }}
                >
                  <Icon name={habit.icon} size={22} color={habit.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-sm ${done ? "text-gray-400 line-through" : "text-dark-brown"}`}>
                    {habit.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium" style={{ backgroundColor: `${habit.color}12`, color: habit.color }}>
                      {habit.category}
                    </span>
                    <span className="text-[11px] text-gray-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{habit.frequency}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => !done && handleCheckIn(habit)}
                  disabled={done}
                  className={`relative flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 overflow-hidden ${
                    done
                      ? "bg-mint-green text-white shadow-lg shadow-mint-green/30 scale-100"
                      : "bg-gray-50 text-gray-300 hover:bg-warm-orange hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-warm-orange/25 active:scale-95"
                  }`}
                >
                  {done ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" className="checkmark-circle" />
                    </svg>
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                </button>
              </div>
            );
          })}
          {habits.length === 0 && (
            <div className="text-center py-16 text-gray-300">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-medium">还没有习惯</p>
              <p className="text-sm mt-1">去「习惯管理」添加你的第一个习惯吧</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Achievement popup ── */}
      {popup && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setPopup(null)}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-bounce-in shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-warm-orange to-warm-orange-dark mb-4 shadow-lg shadow-warm-orange/20">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-dark-brown mb-1">太棒了!</h2>
            <p className="text-sm text-gray-400 mb-5">{popup.habit.name} 打卡成功</p>
            {popup.achievements.length > 0 && (
              <div className="space-y-2 mb-5">
                {popup.achievements.map((a) => (
                  <div key={a.id} className="bg-gradient-to-r from-warm-orange/5 to-transparent rounded-xl p-3 flex items-center gap-3 animate-slide-right">
                    <div className="w-10 h-10 rounded-xl bg-warm-orange/10 flex items-center justify-center">
                      <Icon name={a.icon} color="#FF8C42" size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-dark-brown text-sm">{a.name}</div>
                      <div className="text-xs text-gray-400">{a.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setPopup(null)}
              className="px-8 py-3 bg-gradient-to-r from-warm-orange to-warm-orange-dark text-white font-semibold rounded-2xl transition-all hover:shadow-lg hover:shadow-warm-orange/25 active:scale-95"
            >
              继续加油
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
