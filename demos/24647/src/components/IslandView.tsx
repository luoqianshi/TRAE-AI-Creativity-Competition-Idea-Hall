import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image, BarChart2, Settings, ExternalLink, Calendar, Heart, Eye, Download, Star, Sparkles, Moon, Sun, Check } from 'lucide-react';
import { USER_PROFILE, MOOD_STYLE_MAP } from '../data';
import { SavedArtwork, MoodLog } from '../types';

interface IslandViewProps {
  artworks: SavedArtwork[];
  moodLogs?: MoodLog[];
  onToggleFavorite: (id: string) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

type SubTabType = 'gallery' | 'analytics' | 'calendar' | 'settings';

export default function IslandView({
  artworks,
  moodLogs = [],
  onToggleFavorite,
  isDarkMode = false,
  onToggleDarkMode
}: IslandViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('gallery');
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'favorite' | 'recent'>('all');
  const [selectedPreviewArtwork, setSelectedPreviewArtwork] = useState<SavedArtwork | null>(null);

  // Settings state mapped from props
  const isDarkPref = isDarkMode;
  const setIsDarkPref = onToggleDarkMode ? onToggleDarkMode : () => {};
  const [hapticVolume, setHapticVolume] = useState(60);
  const [hasNotif, setHasNotif] = useState(true);

  // Calendar States and Helpers
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(4); // May (0-indexed, so 4 is May)
  const [selectedDay, setSelectedDay] = useState<number | null>(20); // Default May 20, 2026

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // Sunday=0, Monday=1, ...
  };

  const normalizeDate = (year: number, month: number, d: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}.${mm}.${dd}`;
  };

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  // Gallery filter logic
  const filteredArtworks = artworks.filter((art) => {
    if (galleryFilter === 'all') return true;
    if (galleryFilter === 'favorite') {
      // For mock simplicity, we assume we want favorites (or category === favorite)
      return art.category === 'favorite' || art.id.includes('favorite') || art.id.includes('art-2') || art.id.includes('art-6');
    }
    return art.category === 'recent' || art.id.startsWith('canvas-') || art.id.startsWith('generated-');
  });

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* USER BANNER - Screen 5 浮岛 banner */}
      <section className="glass-panel rounded-[32px] p-6 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 justify-between text-left">
        {/* Sky lake twilight backdrop background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.12] scale-105 z-0">
          <img
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgBDfMX2xmp4tqTnwOac-4SfO4-w6CJkETTiKyNKC8CFtV_1trPTwgy5paWBfxGXW00o4TmLE9uxd37oGVvE4HqLueMaKl25TqcZZXcKvoqokh8QVvZkmjZmWhpQe7euXQrL6qFCMncUvB0G15mPy8MwQbkV5ZzVxPliJ2hRDQBOjC3VIyNEHtwsBxEJlzowoeNhm9ek4POBJMZilfujGVMAAZPntIV_tSqVZ629s3rtqqNGKRO07u7yNDcA-UN0mQjxe_syddYBD9"
            alt="Scenic twilight lake"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10 text-center sm:text-left">
          {/* Avatar round picture inside golden pulse rim */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <div className="absolute inset-0 bg-[#4f6167]/15 rounded-full animate-ping opacity-35" />
            <img
              className="w-full h-full object-cover rounded-full border-2 border-white shadow-md"
              src={USER_PROFILE.islandAvatarUrl}
              alt="Alex profile avatar"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-light text-[#221b0b]">{USER_PROFILE.name} 的浮岛</h1>
              <span className="p-1 bg-[#4f6167]/10 text-[#4f6167] text-[9px] uppercase tracking-wider rounded font-mono">LEVEL 4</span>
            </div>
            <p className="text-xs text-slate-500/90 font-medium">相遇的第 {USER_PROFILE.daysTogether} 天 · 呼吸长在，岁华静安</p>
          </div>
        </div>

        {/* Stats grid row */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto relative z-10 pt-4 md:pt-0 border-t md:border-t-0 border-[#c2c7c9]/25">
          <div className="bg-white/60 text-center p-3.5 px-5 rounded-2xl border border-white/50 shadow-sm">
            <p className="text-xs text-[#424849]/60 font-semibold mb-0.5">正念画作</p>
            <p className="text-xl font-bold font-mono text-[#221b0b]">{artworks.length}</p>
          </div>
          <div className="bg-white/60 text-center p-3.5 px-5 rounded-2xl border border-white/50 shadow-sm">
            <p className="text-xs text-[#424849]/60 font-semibold mb-0.5">呼吸时长</p>
            <p className="text-xl font-bold font-mono text-[#4b6167]">{USER_PROFILE.breathingHours}h</p>
          </div>
          <div className="bg-white/60 text-center p-3.5 px-5 rounded-2xl border border-white/50 shadow-sm">
            <p className="text-xs text-[#424849]/60 font-semibold mb-0.5">感悟数</p>
            <p className="text-xl font-bold font-mono text-[#795950]">{USER_PROFILE.recordsCount}</p>
          </div>
        </div>
      </section>

      {/* Sub-tab section buttons */}
      <div className="flex gap-1 bg-[#4f6167]/5 p-1 rounded-2xl max-w-xl mx-auto">
        <button
          onClick={() => setActiveSubTab('gallery')}
          className={`flex-1 py-3 text-xs tracking-wider font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'gallery'
              ? 'bg-[#4f6167] text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
          }`}
        >
          <Image className="w-4 h-4" />
          <span className="hidden sm:inline">我的画册</span>
          <span className="sm:hidden">画册</span>
        </button>
        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`flex-1 py-3 text-xs tracking-wider font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'calendar'
              ? 'bg-[#4f6167] text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">情绪日历</span>
          <span className="sm:hidden">日历</span>
        </button>
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex-1 py-3 text-xs tracking-wider font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'analytics'
              ? 'bg-[#4f6167] text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span className="hidden sm:inline">光迹统计</span>
          <span className="sm:hidden">统计</span>
        </button>
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex-1 py-3 text-xs tracking-wider font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'settings'
              ? 'bg-[#4f6167] text-white shadow'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/30'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">正念设置</span>
          <span className="sm:hidden">设置</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* Subtab 1: MY SAVED WORKS GALLERY / 我的作品 */}
        {activeSubTab === 'gallery' && (
          <motion.div
            key="gallery-sub"
            initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 text-left"
          >
            {/* Gallery Filter buttons */}
            <div className="flex justify-between items-center bg-transparent border-b border-[#c2c7c9]/20 pb-4">
              <div className="flex gap-2.5">
                {[
                  { id: 'all', label: '全部' },
                  { id: 'favorite', label: '收藏' },
                  { id: 'recent', label: '最近生成' }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setGalleryFilter(btn.id as any)}
                    className={`px-4.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      galleryFilter === btn.id
                        ? 'bg-[#4f6167] text-white shadow-sm'
                        : 'bg-white/50 hover:bg-white text-slate-600 border border-[#c2c7c9]/10'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                显示 {filteredArtworks.length} 幅灵画
              </span>
            </div>

            {/* ARTWORKS GRID list */}
            {filteredArtworks.length === 0 ? (
              <div className="border border-dashed border-[#c2c7c9] p-12 text-center rounded-3xl opacity-60">
                <p className="text-sm font-medium text-slate-500">此分类暂无画卷</p>
                <p className="text-xs text-slate-400 mt-1">进入“呼吸”栏目调整生理节奏即可生成</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filteredArtworks.map((art) => (
                  <motion.div
                    key={art.id}
                    layoutId={`art-wrap-${art.id}`}
                    whileHover={{ y: -4 }}
                    className="glass-panel overflow-hidden rounded-[24px] cursor-zoom-in group border-white/60 shadow-md flex flex-col justify-between"
                  >
                    {/* Media thumbnail */}
                    <div
                      onClick={() => setSelectedPreviewArtwork(art)}
                      className="w-full h-40 overflow-hidden relative bg-[#14182c]"
                    >
                      <img
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={art.imageUrl}
                        alt={art.title}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3.5">
                        <Eye className="w-4 h-4 text-white drop-shadow-md" />
                      </div>
                    </div>
                    {/* Card Content info */}
                    <div className="p-4.5 bg-white/40 flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]" title={art.title}>
                          {art.title}
                        </p>
                        <p className="text-[10px] text-slate-500/80 font-mono mt-0.5">{art.date}</p>
                      </div>
                      
                      {/* Heart action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(art.id);
                        }}
                        className="p-1 px-[5px] rounded-lg hover:bg-black/5 active:scale-90 text-red-500/80 transition-colors"
                      >
                        <Heart className={`w-3.5 h-3.5 inline-block ${art.imageUrl.includes('AB6AXuAvFv-') || art.id.includes('favorite') || art.id.includes('art-2') || art.id.includes('art-6') ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Subtab: EMOTION CALENDAR / 情绪日历 */}
        {activeSubTab === 'calendar' && (
          <motion.div
            key="calendar-sub"
            initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 text-left"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-[#221b0b] dark:text-slate-100">心灵时空日历</h3>
              <p className="text-xs text-[#424849]/60 dark:text-slate-400 leading-relaxed font-light">
                复盘心之波澜。点击下方日期，查看当天的所有情绪流转记录，以及呼吸时勾画而出的气韵灵迹。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Calendar Grid Selector Card */}
              <div className="md:col-span-7 glass-panel rounded-[28px] p-5 md:p-6 border border-white/60 bg-white/70 dark:bg-[#1a2035]/80">
                {/* Month Picker Arrow Header */}
                <div className="flex justify-between items-center mb-6 px-1">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {monthNames[calMonth]} {calYear}
                    </h4>
                    <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Emotion Calendar</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrevMonth}
                      className="px-2.5 py-1 rounded-lg hover:bg-[#4f6167]/10 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-[#c2c7c9]/25 text-xs font-mono transition-all"
                    >
                      &larr;
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="px-2.5 py-1 rounded-lg hover:bg-[#4f6167]/10 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-[#c2c7c9]/25 text-xs font-mono transition-all"
                    >
                      &rarr;
                    </button>
                  </div>
                </div>

                {/* Days Label Header */}
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">
                  {['日', '一', '二', '三', '四', '五', '六'].map((lbl) => (
                    <div key={lbl} className="py-1">{lbl}</div>
                  ))}
                </div>

                {/* Calendar Days Items List Grid */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {/* First-week vacant padding */}
                  {Array.from({ length: getFirstDayOfMonth(calYear, calMonth) }).map((_, padIdx) => (
                    <div key={`vacant-${padIdx}`} className="aspect-square opacity-0 pointer-events-none" />
                  ))}

                  {/* Calendar Days */}
                  {Array.from({ length: getDaysInMonth(calYear, calMonth) }).map((_, valIdx) => {
                    const day = valIdx + 1;
                    const dateStr = normalizeDate(calYear, calMonth, day);
                    const isSelected = selectedDay === day;

                    // Compute matches items for date Str
                    const dayLogs = moodLogs.filter((log) => log.date === dateStr);
                    const dayArts = artworks.filter((art) => art.date === dateStr);
                    const hasItems = dayLogs.length > 0 || dayArts.length > 0;

                    return (
                      <button
                        key={`day-${day}`}
                        onClick={() => setSelectedDay(day)}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-between p-1 md:p-1.5 transition-all border ${
                          isSelected
                            ? 'bg-[#4f6167] text-white border-[#4f6167] shadow-md shadow-[#4f6167]/15 scale-102 ring-1 ring-[#4f6167]/20 z-10'
                            : hasItems
                              ? 'bg-emerald-50/15 dark:bg-slate-800/80 border-[#4f6167]/35 hover:border-[#4f6167]/75 hover:bg-sky-50/30 text-slate-800 dark:text-slate-200'
                              : 'bg-white/10 dark:bg-slate-900/10 border-transparent hover:bg-white/40 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {/* Day indicator label */}
                        <span className="text-[10px] md:text-xs font-semibold font-mono self-start ml-0.5">{day}</span>

                        {/* Event tags indicators list */}
                        <div className="flex gap-0.5 items-center justify-center w-full min-h-[6px] pb-0.5">
                          {dayLogs.slice(0, 3).map((log) => {
                            const mapStyle = MOOD_STYLE_MAP[log.type as keyof typeof MOOD_STYLE_MAP] || MOOD_STYLE_MAP.calm;
                            return (
                              <span
                                key={log.id}
                                className="w-1.5 h-1.5 rounded-full inline-block"
                                style={{ backgroundColor: mapStyle.colorHex }}
                                title={mapStyle.chinese}
                              />
                            );
                          })}
                          {dayArts.length > 0 && (
                            <Sparkles className={`w-2.5 h-2.5 ${isSelected ? 'text-white/80' : 'text-amber-500'}`} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Legend list indicators map bar */}
                <div className="mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-800/40 flex flex-wrap gap-x-3.5 gap-y-2 text-[10px] text-slate-500 font-medium">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C0C9B7]" />
                    <span>平静</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F6DED2]" />
                    <span>焦虑</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D7E4ED]" />
                    <span>疲惫</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FED4C8]" />
                    <span>烦躁</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#B8A398]" />
                    <span>低落</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>正念画作</span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Details list container info */}
              <div className="md:col-span-5 space-y-4">
                {selectedDay === null ? (
                  <div className="glass-panel rounded-[28px] p-8 text-center border border-white/60 bg-white/40 min-h-[300px] flex flex-col items-center justify-center space-y-3">
                    <span className="text-3xl">📅</span>
                    <h5 className="text-sm font-semibold text-slate-700">未选择日期</h5>
                    <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
                      请轻戳日历中亮色卡格，倾听那一日潜藏在身心波澜下的心绪流转和感悟画作。
                    </p>
                  </div>
                ) : (() => {
                  const targetStr = normalizeDate(calYear, calMonth, selectedDay);
                  const dayLogs = moodLogs.filter((log) => log.date === targetStr);
                  const dayArts = artworks.filter((art) => art.date === targetStr);

                  return (
                    <div className="space-y-4">
                      {/* Summary Tag Header */}
                      <div className="glass-panel rounded-[24px] p-4.5 border border-white/60 bg-white/70 dark:bg-slate-800/80 text-left">
                        <span className="text-[9px] uppercase font-mono tracking-widest text-[#4f6167] font-bold">Selected Date</span>
                        <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                          {calYear}年{calMonth + 1}月{selectedDay}日
                        </h4>
                        <div className="flex gap-4.5 mt-2.5 text-[10px] text-slate-500/90 font-medium">
                          <span>心绪笔记: <strong className="text-slate-800 dark:text-slate-200 font-bold font-mono">{dayLogs.length} 条</strong></span>
                          <span>呼吸画卷: <strong className="text-slate-800 dark:text-slate-200 font-bold font-mono">{dayArts.length} 幅</strong></span>
                        </div>
                      </div>

                      {/* Display Mood log items list */}
                      <div className="glass-panel rounded-[28px] p-5 border border-white/60 bg-white/50 dark:bg-slate-800/60 text-left space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-200/40 pb-2">
                          <h5 className="text-[11px] font-bold text-[#4f6167] dark:text-slate-300 uppercase tracking-widest">
                            📝 情绪潮汐
                          </h5>
                          <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">Mood notes</span>
                        </div>

                        {dayLogs.length === 0 ? (
                          <p className="text-xs text-slate-400 font-light italic py-4">
                            今日尚未记录心事笔记，气韵悠长，平静依然。
                          </p>
                        ) : (
                          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-0.5">
                            {dayLogs.map((log) => {
                              const mappingStyle = MOOD_STYLE_MAP[log.type as keyof typeof MOOD_STYLE_MAP] || MOOD_STYLE_MAP.calm;
                              return (
                                <div
                                  key={log.id}
                                  className="p-3.5 rounded-2xl bg-white/85 dark:bg-slate-850/80 border border-slate-100 dark:border-slate-800 space-y-2 shadow-sm hover:translate-y-[-1px] transition-transform"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      {/* Colored badge */}
                                      <span
                                        className="text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                                        style={{ backgroundColor: mappingStyle.orbColor }}
                                      >
                                        {mappingStyle.chinese}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-mono font-bold">{log.time}</span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-700 dark:text-slate-300 font-light leading-relaxed">
                                    {log.description}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Display Breath Artwork list */}
                      <div className="glass-panel rounded-[28px] p-5 border border-white/60 bg-white/50 dark:bg-slate-800/60 text-left space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-200/40 pb-2">
                          <h5 className="text-[11px] font-bold text-[#4f6167] dark:text-slate-300 uppercase tracking-widest">
                            🎨 正念曼陀罗
                          </h5>
                          <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">Mandala paintings</span>
                        </div>

                        {dayArts.length === 0 ? (
                          <p className="text-xs text-slate-400 font-light italic py-4">
                            这天还没有挥洒正念星图。
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 pb-1">
                            {dayArts.map((art) => (
                              <div
                                key={art.id}
                                onClick={() => setSelectedPreviewArtwork(art)}
                                className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-900 border border-white/80 cursor-zoom-in shadow-sm hover:scale-[1.03] transition-transform duration-300"
                              >
                                <img
                                  className="w-full h-full object-cover"
                                  src={art.imageUrl}
                                  alt={art.title}
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 text-left">
                                  <p className="text-[9px] font-bold text-white truncate">{art.title}</p>
                                  <span className="text-[7px] text-white/70 font-mono mt-0.5">点击放大</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        )}

        {/* Subtab 2: LIGHT TRACES ANALYTICS / 数据统计 (Screen 11) */}
        {activeSubTab === 'analytics' && (
          <motion.div
            key="analytics-sub"
            initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 text-left"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-[#221b0b]">光迹跟踪</h3>
              <p className="text-xs text-[#424849]/60 leading-relaxed font-light">记录这一阶段的心情起落频带及正念调息契合度比重</p>
            </div>

            {/* Custom SVG Line Graph for mood fluctuations */}
            <div className="glass-panel rounded-[28px] p-6 border-white/60">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-5">周度生理频率流转 Waveform</p>
              
              <div className="h-44 w-full relative">
                {/* Responsive SVG */}
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(79, 97, 103, 0.08)" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(79, 97, 103, 0.08)" strokeDasharray="3 3" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(79, 97, 103, 0.08)" strokeDasharray="3 3" />
                  
                  {/* Gradient fill beneath line */}
                  <defs>
                    <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f6167" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#4f6167" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <path
                    d="M 10 130 Q 80 50 160 100 T 320 60 T 490 110 L 490 160 L 10 160 Z"
                    fill="url(#waveGrad)"
                  />
                  
                  {/* Smooth line stroke path */}
                  <path
                    d="M 10 130 Q 80 50 160 100 T 320 60 T 490 110"
                    fill="none"
                    stroke="#4f6167"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Marker Nodes */}
                  <circle cx="10" cy="130" r="4.5" fill="#ffffff" stroke="#4f6167" strokeWidth="2" />
                  <circle cx="95" cy="62" r="4.5" fill="#ffffff" stroke="#4f6167" strokeWidth="2" />
                  <circle cx="160" cy="100" r="4.5" fill="#ffffff" stroke="#4f6167" strokeWidth="2" />
                  <circle cx="240" cy="74" r="4.5" fill="#ffffff" stroke="#4f6167" strokeWidth="2" />
                  <circle cx="320" cy="60" r="4.5" fill="#ffffff" stroke="#4f6167" strokeWidth="2" />
                  <circle cx="410" cy="85" r="4.5" fill="#ffffff" stroke="#4f6167" strokeWidth="2" />
                  <circle cx="490" cy="110" r="4.5" fill="#ffffff" stroke="#4f6167" strokeWidth="2" />
                </svg>

                {/* Floating tags */}
                <div className="absolute top-1 right-2 bg-[#dbcdfe]/40 px-2 py-0.5 rounded text-[9px] text-[#60557f] border border-[#dbcdfe]/60 font-semibold uppercase">
                  ⭐ Optimal focus
                </div>
              </div>

              {/* Day Labels Row */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-4.5 px-1">
                <span>周一</span>
                <span>周二</span>
                <span>周三</span>
                <span>周四</span>
                <span>周五</span>
                <span>周六</span>
                <span>周日</span>
              </div>
            </div>

            {/* Ratio Breakdown and Sources of anxiety sources */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
              {/* Inner Circle metrics block */}
              <div className="glass-panel rounded-3xl p-6 border border-white/40 flex items-center gap-5">
                <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                  {/* Decorative Donut chart in SVG */}
                  <svg className="w-full h-full rotate-[-90deg]">
                    <circle cx="48" cy="48" r="38" stroke="#f1f3f4" strokeWidth="8.5" fill="transparent" />
                    <circle
                      cx="48"
                      cy="48"
                      r="38"
                      stroke="#4f6167"
                      strokeWidth="9"
                      strokeDasharray="238"
                      strokeDashoffset="65"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <p className="absolute text-center">
                    <span className="text-xl font-bold font-mono text-[#221b0b]">72%</span>
                    <span className="text-[8px] font-semibold text-slate-400 block tracking-tighter">平静率</span>
                  </p>
                </div>
                
                <div className="text-left space-y-1">
                  <p className="text-sm font-semibold text-slate-800">深度正念评估</p>
                  <p className="text-xs text-slate-500/90 leading-relaxed font-light">
                    您本周的深度生理气流平静占高达 <span className="font-semibold text-teal-700">72%</span>。在紧张的都市频率中，仍保持平稳。
                  </p>
                </div>
              </div>

              {/* Trigger percentages stats cards */}
              <div className="glass-panel rounded-3xl p-6 border border-white/40 space-y-3.5 flex flex-col justify-center text-left">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5">平静能量触发比重</p>
                <div className="space-y-2.5">
                  {[
                    { source: '生理深呼吸', ratio: '42%', bg: 'bg-[#4f6167]', width: 'w-[42%]' },
                    { source: '古典声学混音', ratio: '28%', bg: 'bg-[#a2b5bb]', width: 'w-[28%]' },
                    { source: '静止和缓睡眠', ratio: '30%', bg: 'bg-[#b8a398]', width: 'w-[30%]' }
                  ].map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                        <span>{item.source}</span>
                        <span className="font-mono">{item.ratio}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.bg} rounded-full`} style={{ width: item.ratio }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Motivational Quote banner */}
            <div className="glass-panel rounded-3xl p-6 border-white/60 flex items-center gap-4 bg-[#dde6d2]/20">
              <span className="text-2xl">🌱</span>
              <p className="text-xs text-slate-700 leading-relaxed font-light">
                “生活有其起落频率，犹如大自然中的潮汐。不要排斥紧绷；只需留出呼吸的空隙，去记录它、感悟它即可。”
              </p>
            </div>
          </motion.div>
        )}

        {/* Subtab 3: APP PREFERENCES AND SETTINGS /正念设置 */}
        {activeSubTab === 'settings' && (
          <motion.div
            key="settings-sub"
            initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 text-left max-w-xl mx-auto"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-[#221b0b]">应用安全设置</h3>
              <p className="text-xs text-[#424849]/60 leading-relaxed font-light">调节触觉反馈、夜间模式与提醒振幅参数</p>
            </div>

            <div className="glass-panel rounded-[28px] p-6 border-white/60 space-y-6">
              
              {/* Dark mode switcher toggle with icons */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-slate-800">沉浸式呼吸深色模式</p>
                  <p className="text-xs text-slate-500/80 font-light">在光照低的深夜开启，呵护眼底眼球舒适</p>
                </div>
                <button
                  onClick={() => setIsDarkPref()}
                  className={`w-14 h-8 rounded-full p-1.5 transition-colors relative flex items-center justify-between ${
                    isDarkPref ? 'bg-[#4f6167]' : 'bg-slate-200'
                  }`}
                >
                  <Moon className={`w-3.5 h-3.5 text-white absolute left-2 ${isDarkPref ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                  <Sun className={`w-3.5 h-3.5 text-slate-500 absolute right-2 ${isDarkPref ? 'opacity-0' : 'opacity-100'} transition-opacity`} />
                  
                  <motion.div
                    layout
                    className="w-5.5 h-5.5 bg-white rounded-full shadow-md z-10"
                    style={{
                      marginLeft: isDarkPref ? 'auto' : '0'
                    }}
                  />
                </button>
              </div>

              {/* Haptic triggers slide feedback */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-semibold text-[#424849]/60 tracking-wider">
                  <span>正念呼噪震动反馈强度</span>
                  <span className="text-[#4f6167] font-bold">{hapticVolume}%</span>
                </div>
                <div className="flex items-center gap-4 bg-white/40 p-4 rounded-2xl border border-white/30">
                  <span className="text-xs text-slate-400">弱</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hapticVolume}
                    onChange={(e) => setHapticVolume(Number(e.target.value))}
                    className="w-full h-1 bg-[#4f6167]/10 rounded-full appearance-none cursor-pointer accent-[#4f6167]"
                  />
                  <span className="text-xs text-slate-500">强</span>
                </div>
              </div>

              {/* Notifications frequency select list togglers */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-slate-800">呼吸状态每日轻型推送</p>
                  <p className="text-xs text-slate-500/80 font-light">在每日最疲累的时段推荐适度的呼吸疗愈</p>
                </div>
                <button
                  onClick={() => setHasNotif(!hasNotif)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors relative flex items-center justify-between ${
                    hasNotif ? 'bg-teal-600' : 'bg-slate-200'
                  }`}
                >
                  <motion.div
                    layout
                    className="w-6 h-6 bg-white rounded-full shadow-md"
                    style={{
                      marginLeft: hasNotif ? 'auto' : '0'
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Platform technical credentials declaration (Literal, Human labels only) */}
            <div className="p-5 border border-dashed border-[#c2c7c9]/40 rounded-2xl text-center space-y-1 shadow-inner bg-white/10 opacity-70">
              <p className="text-xs font-semibold text-slate-500">LUMINA Version 1.2.0</p>
              <p className="text-[10px] text-slate-400/90">© 2026 浮光正念. 全离线本地加密存储，守护您的安全隐私。</p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* FULL-SCREEN ARTWORK PREVIEW OVERLAY MODAL */}
      <AnimatePresence>
        {selectedPreviewArtwork && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPreviewArtwork(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#fff8f2] rounded-[36px] overflow-hidden border border-white/20 shadow-2xl flex flex-col justify-between"
            >
              {/* Giant clean high-contrast preview */}
              <div className="w-full h-[360px] md:h-[440px] bg-slate-900 border-b border-white/10 relative overflow-hidden">
                <img
                  className="w-full h-full object-contain"
                  src={selectedPreviewArtwork.imageUrl}
                  alt={selectedPreviewArtwork.title}
                  referrerPolicy="no-referrer"
                />
                
                {/* Close overlay */}
                <button
                  onClick={() => setSelectedPreviewArtwork(null)}
                  className="absolute top-5 right-5 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 active:scale-90 transition-all border border-white/10"
                >
                  &times;
                </button>
              </div>

              {/* Panel content context */}
              <div className="p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-violet-600 rounded-full animate-ping" />
                    <span className="text-[10px] font-bold text-violet-700 uppercase tracking-widest">
                      心灵生成艺术作品
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-[#221b0b]">{selectedPreviewArtwork.title}</h4>
                  <p className="text-xs text-slate-500/80 font-medium">生成日期：{selectedPreviewArtwork.date} · 本地正念加密链保全</p>
                </div>

                <div className="flex gap-3">
                  <a
                    href={selectedPreviewArtwork.imageUrl}
                    download={selectedPreviewArtwork.title}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 rounded-full hover:bg-slate-100 font-semibold text-slate-700 bg-white border text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>查看原图</span>
                  </a>
                  
                  <button
                    onClick={() => {
                      onToggleFavorite(selectedPreviewArtwork.id);
                    }}
                    className="px-5 py-3 rounded-full bg-[#4f6167] text-white hover:bg-[#35474c] text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#4f6167]/15 transition-all"
                  >
                    <Star className="w-3.5 h-3.5 fill-white text-white" />
                    <span>保留收藏</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
