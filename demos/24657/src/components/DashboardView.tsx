import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Play, Music, Plus, Smile, Compass, X, Check, Heart, HelpCircle, Activity, Sparkles } from 'lucide-react';
import { USER_PROFILE, BREATHING_PATTERNS } from '../data';
import { MoodLog, MoodType } from '../types';
import DailyFortuneView from './DailyFortune';

interface DashboardViewProps {
  onStartBreathing: () => void;
  onNavigateToSound: () => void;
  onNavigateToIsland: () => void;
  moodLogs: MoodLog[];
  onAddMoodLog: (type: MoodType, description: string) => void;
}

export default function DashboardView({
  onStartBreathing,
  onNavigateToSound,
  onNavigateToIsland,
  moodLogs,
  onAddMoodLog
}: DashboardViewProps) {
  const [showLogModal, setShowLogModal] = useState(false);
  const [showFortuneModal, setShowFortuneModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodType>('calm');
  const [description, setDescription] = useState('');

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onAddMoodLog(selectedMood, description);
    setDescription('');
    setShowLogModal(false);
  };

  const moodChips: { type: MoodType; label: string; bg: string; text: string; icon: string }[] = [
    { type: 'calm', label: '平静 Calm', bg: 'bg-[#dbcdfe]/30', text: 'text-[#60557f]', icon: '😊' },
    { type: 'anxious', label: '焦虑 Panic', bg: 'bg-[#ffdad6]/40', text: 'text-[#ba1a1a]', icon: '⚡' },
    { type: 'tired', label: '疲惫 Tired', bg: 'bg-[#bab0a4]/30', text: 'text-[#4a433a]', icon: '💤' },
    { type: 'irritated', label: '烦躁 Irritated', bg: 'bg-[#fed4c8]/40', text: 'text-[#795950]', icon: '💢' },
    { type: 'low', label: '低落 Low', bg: 'bg-[#f0eee8]', text: 'text-[#4e4540]', icon: '💧' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header Section */}
      <section className="relative py-4">
        {/* Soft Ambient Blur Ball */}
        <div className="absolute -top-12 -left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 space-y-1"
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-700/80">Lumina Ambient Space</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-light tracking-wide text-[#221b0b]">
            欢迎回来, {USER_PROFILE.name}.
          </h1>
          <p className="text-sm md:text-base text-[#424849] opacity-75">
            空气静谧，你在这里很安全。
          </p>
        </motion.div>
      </section>

      {/* Quick Entry Bento Grid Layout */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Breathing Exercise Recommendation Card (Large Bento Panel - span 8) */}
        <motion.div
          whileHover={{ y: -4 }}
          onClick={onStartBreathing}
          className="md:col-span-8 group cursor-pointer relative overflow-hidden glass-panel rounded-[32px] p-8 h-[340px] flex flex-col justify-between transition-all hover:shadow-2xl hover:shadow-teal-500/5 duration-500"
        >
          {/* Card Meta Header */}
          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#4f6167] bg-white/40 px-3.5 py-1 rounded-full border border-white/50">
              当前推荐
            </span>
            <h2 className="text-3xl font-light tracking-wide text-[#221b0b] mt-5">
              深远呼吸
            </h2>
            <p className="text-[#424849]/90 text-sm md:text-base max-w-sm mt-2.5 leading-relaxed font-light">
              每日清心之选，通过最经典的 4-7-8 节律调节，调节自主神经系统，稳定心率、释放深层焦虑。
            </p>
          </div>

          {/* Trigger Play Button Area */}
          <div className="flex items-center justify-between relative z-10 pt-4">
            <button className="bg-[#4f6167] text-white pl-6 pr-7 py-4 rounded-full font-medium flex items-center gap-3 active:scale-95 group-hover:bg-[#35474c] transition-all shadow-lg shadow-[#4f6167]/15">
              <span className="p-1 bg-white/20 rounded-full">
                <Play className="w-3.5 h-3.5 fill-current" />
              </span>
              <span>开始练习</span>
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4f6167] bg-white/30 backdrop-blur-md border border-white/40 px-4 py-2 rounded-full">
              <Activity className="w-3 h-3 text-teal-600 animate-pulse" />
              <span>5 分钟 · 4-7-8 疗愈</span>
            </div>
          </div>

          {/* Background Hotlinked Image */}
          <div className="absolute top-0 right-0 w-full h-full opacity-[0.16] group-hover:opacity-25 transition-opacity duration-700">
            <img
              className="w-full h-full object-cover float-right"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQc5hZqNvCTY5wiFkAchJXk8LEdLGntyAMwViIkeiSdVhuLeD9emPbA09jytrnNK4NNoyX4POVIFoMuUG1B_pGF8RA2-Rp_KuaY3pbAFm-xn4QLgHt1Xl0l8bEk3zFDpD25mbLJZj7RMtzJaBTiQjnjfqGmo5UkVD4ihshTNR-RfnDPXLRJ_-Xgih6n5cUdWbE90XF7_n_XMbfMROjNRhZu2eVmrBf3vig-gEjt0c9US1mET4g4POGZWgYb30sL78_zDEDJti8dwpy"
              alt="Artistic microscopic waves"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>

        {/* Music Soundspace Card (span 4) */}
        <motion.div
          whileHover={{ y: -4 }}
          onClick={onNavigateToSound}
          className="md:col-span-4 glass-panel rounded-[32px] p-8 flex flex-col items-center justify-between text-center group cursor-pointer transition-all hover:bg-white/50 duration-500 h-[340px]"
        >
          <div className="w-full flex flex-col items-center">
            {/* Soft secondary container layout icon */}
            <div className="w-16 h-16 bg-[#dbcdfe]/60 rounded-3xl flex items-center justify-center mb-5 shadow-lg shadow-violet-200/20 group-hover:scale-105 transition-transform duration-300">
              <Music className="w-8 h-8 text-[#60557f]" />
            </div>
            <h3 className="text-xl font-medium text-[#221b0b]">音效空间</h3>
            <p className="text-xs text-[#424849]/60 uppercase tracking-widest mt-1.5">
              共有 42 个音乐专辑
            </p>
          </div>

          {/* Overlapping Album Layered Presentation */}
          <div className="mt-4 flex -space-x-3 items-center justify-center group-hover:translate-y-[-2px] transition-transform duration-300">
            {[
              'https://lh3.googleusercontent.com/aida-public/AB6AXuB5OCbTK4Wd6xRUUZwVNmx3AY9a_RrF-jv39q770nMkYmI20yWStXAP3DM1qkKMbz3AkcPLdiN4x73McPTNehnUwqYhtp1JfOGF7g1uwEWyoYdLrEgvCL6lE1gS4LympvC5y1RdNQDYA-1X4Io9CHMBIJlPIc4_EKIB_FTo4zwmSqed_nl2u53x2ux8kdq41n0R5QFPIhZphIN4NtZyGGO054pVwfspqsSupjrT7FmZFybSa0yoWUQ0MtkyhNGi538WR_sfCwxjoBSs',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuA3gX5ehd6kDxFLu5UkVuvbMO6c0Jh4Tt5zptKy9jKHa-rgaKGpcYTCFWflpaspu8TXyU_27jMQsWS8sUl3b9NrFWNYdPK4iYTetKHinWYVgSiJuADfkP3Q9MvtW-Hx9NeWgDLR1cSsKZF-LTzZC0kTz6SF91ETKDy4IVyvU0QPqGvDCQZEEei_WzkSAjmZ5TxMA0qH-UziaapFHjJ1tngoOzAWhRD931k-ISawMUF6WkDQsQFtQgqCWsKfYwrqgg3xsB2s6-thUZH0',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCqrWwYExsUqKsENY4WClNAYJvmA9D2bcpJJvrgr4GDudiIxHwJL5FreVOc7mUoLme6c3GSFat6HecWGwdNLmk6Vl4wh01Yw0iEjNYANszeBCnIRg78kE-zg9nLqzMa9gH4UqRVvwXd8Tf5vIcATTfyKHuKNgvfIMz2s4uQ67PIuSiIhDZBJyAoLGhp6HmLpReU34MN5qZlQlkTourTkUgBN4rWLghgOuc-c7oBxGFhvJ_CDhXDbyOgpIJARiJG0BUCcJxCF8Pzylvv'
            ].map((url, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-xl bg-white border-2 border-white overflow-hidden shadow-md rotate-[-3deg] group-hover:rotate-[0deg] transition-all duration-300"
              >
                <img className="w-full h-full object-cover" src={url} alt={`Album cover ${i + 1}`} referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>

          <span className="text-xs text-[#4f6167] font-semibold tracking-wider flex items-center gap-1.5 opacity-80 mt-2">
            进入声场调音器
          </span>
        </motion.div>
      </section>

      {/* Daily Fortune Quick Access */}
      <section>
        <motion.div
          whileHover={{ y: -2 }}
          onClick={() => setShowFortuneModal(true)}
          className="glass-panel rounded-[28px] p-6 flex items-center gap-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-amber-500/5 duration-500 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-7 h-7 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-[#221b0b] tracking-wide">每日求签</h3>
            <p className="text-sm text-[#424849]/70 font-light mt-0.5">
              抽取今日运势签文，获取一份心灵的指引与启示
            </p>
          </div>
          <div className="w-10 h-10 rounded-full border border-[#a2b5bb]/30 flex items-center justify-center group-hover:bg-[#4f6167] group-hover:border-[#4f6167] transition-all duration-300">
            <Sparkles className="w-4 h-4 text-[#4f6167] group-hover:text-white transition-colors" />
          </div>
        </motion.div>
      </section>

      {/* Mood/Sentiment Summary Diary Panel */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-light text-[#221b0b] tracking-wide">今日感悟</h3>
            <p className="text-xs text-[#424849]/60">记录每一个情绪流转的静美瞬间</p>
          </div>
          <button
            onClick={onNavigateToIsland}
            className="text-xs font-semibold tracking-[0.1em] text-[#4f6167] active:scale-95 transition-transform"
          >
            历史记录
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Loop logs dynamically */}
          {moodLogs.map((log) => (
            <motion.div
              key={log.id}
              whileHover={{ scale: 1.01 }}
              className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-[18px] bg-[#a2b5bb]/35 flex items-center justify-center text-xl shadow-inner">
                  {log.type === 'calm' ? '😊' : log.type === 'anxious' ? '⚡' : log.type === 'tired' ? '💤' : log.type === 'irritated' ? '💢' : '💧'}
                </div>
                <span className="text-xs font-semibold text-[#424849]/55">{log.time}</span>
              </div>
              <div>
                <p className="text-lg font-medium text-[#221b0b]">{log.label}</p>
                <p className="text-sm text-[#424849]/80 mt-2 leading-relaxed font-light">{log.description}</p>
              </div>
            </motion.div>
          ))}

          {/* Add mood log card (Dashed Trigger button) */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            onClick={() => setShowLogModal(true)}
            className="border-2 border-dashed border-[#a2b5bb]/30 rounded-[28px] p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#4f6167]/50 hover:bg-[#a2b5bb]/5 transition-all duration-300 min-h-[160px]"
          >
            <div className="w-12 h-12 rounded-full border border-dashed border-[#a2b5bb]/60 flex items-center justify-center text-[#4f6167] mb-3">
              <Plus className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-sm font-medium text-[#4f6167]">记录当前心情</p>
            <p className="text-[11px] text-[#424849]/50 mt-1">记录觉察，映射为画布基础底料</p>
          </motion.div>
        </div>
      </section>

      {/* Mood Entry Dialog Tool */}
      <AnimatePresence>
        {showLogModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogModal(false)}
              className="absolute inset-0 bg-[#382f1e]/30 backdrop-blur-md"
            />
            {/* Container modal */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative bg-[#fff8f2] border border-white/40 w-full max-w-md p-8 rounded-[36px] shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium text-[#221b0b]">记下当前的感受</h3>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200/50 transition-colors"
                >
                  <X className="w-5 h-5 text-[#424849]" />
                </button>
              </div>

              <form onSubmit={handleSaveLog} className="space-y-6">
                {/* Mood Type Toggle row */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#424849]/60">此时的心境</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {moodChips.map((chip) => (
                      <button
                        key={chip.type}
                        type="button"
                        onClick={() => setSelectedMood(chip.type)}
                        className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all ${
                          selectedMood === chip.type
                            ? 'bg-[#4f6167] text-white shadow-md scale-102 font-semibold'
                            : 'bg-white/60 border border-slate-200 hover:bg-white text-slate-700'
                        }`}
                      >
                        <span className="mr-1.5">{chip.icon}</span>
                        {chip.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Text box */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#424849]/60">说些什么 (正念思考)</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="醒来时的一缕阳光，或是工作里小小的平和..."
                    className="w-full bg-white/60 backdrop-blur-md rounded-2xl border border-[#c2c7c9]/40 p-4 font-light text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6167]/30 focus:border-[#4f6167]/60 text-slate-800"
                  />
                </div>

                {/* Submit actions */}
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="flex-1 py-3.5 rounded-full text-sm font-medium border border-slate-200 hover:bg-slate-100/50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-full text-sm font-medium bg-[#4f6167] hover:bg-[#35474c] text-white transition-all shadow-md"
                  >
                    记存完成
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Daily Fortune Modal */}
      <AnimatePresence>
        {showFortuneModal && (
          <DailyFortuneView onClose={() => setShowFortuneModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
