import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import BottomTabBar from '@/components/BottomTabBar';
import CandyBackground from '@/components/CandyBackground';
import confetti from 'canvas-confetti';
import { getThemeById } from '@/lib/themes';
import { getRatingVisuals, getEmptyCellVisuals, RatingLevel } from '@/lib/ratingStyles';
import { formatLocalDate, parseLocalDate } from '@/lib/date';

// Persist viewed month across navigations within session
let persistedYear: number | null = null;
let persistedMonth: number | null = null;

const HistoryPage = () => {
  const navigate = useNavigate();
  const { entries, getEntryByDate, settings } = useApp();
  
  const [currentDate, setCurrentDate] = useState(() => {
    if (persistedYear !== null && persistedMonth !== null) {
      return new Date(persistedYear, persistedMonth, 1);
    }
    return new Date();
  });
  
  const themeId = settings.currentTheme || 'orange';
  const currentTheme = getThemeById(themeId);
  const isNeonTheme = themeId === 'black';
  const isHoloTheme = themeId === 'white';
  const isYellowTheme = themeId === 'yellow';
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Persist whenever month changes
  useEffect(() => {
    persistedYear = year;
    persistedMonth = month;
  }, [year, month]);
  
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const getWeekBestDays = () => {
    const bestDays: { [key: string]: boolean } = {};
    const weeks: { [key: number]: typeof entries } = {};
    
    entries.forEach(entry => {
      const entryDate = parseLocalDate(entry.date);
      if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
        const weekNum = Math.floor((entryDate.getDate() + firstDay - 1) / 7);
        if (!weeks[weekNum]) weeks[weekNum] = [];
        weeks[weekNum].push(entry);
      }
    });
    
    Object.values(weeks).forEach(weekEntries => {
      if (weekEntries.length > 0) {
        const best = weekEntries.reduce((a, b) => a.rating > b.rating ? a : b);
        bestDays[best.date] = true;
      }
    });
    
    return bestDays;
  };
  
  const weekBestDays = getWeekBestDays();
  
  const getRatingEmoji = (rating: number) => {
    return ['', '😊', '😆', '🤩'][rating];
  };
  
  const isToday = (day: number) => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  };

  const triggerConfetti = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    const primary = currentTheme?.preview.primary || '#f97316';
    const accent = currentTheme?.preview.accent || '#fdba74';
    
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { x, y },
      colors: [primary, accent, '#fbbf24', '#fef3c7', '#ffffff'],
      scalar: 0.6,
      ticks: 50,
    });
  };

  const getThemedButtonBg = () => {
    if (isNeonTheme) return 'linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(142 76% 36%) 100%)';
    if (isHoloTheme) return 'linear-gradient(135deg, #EF4444 0%, #F97316 16.67%, #FBBF24 33.33%, #22C55E 50%, #3B82F6 66.67%, #8B5CF6 83.33%, #EC4899 100%)';
    return 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.85) 100%)';
  };
  
  const getThemedShadow = () => {
    if (isNeonTheme) return '0 0 30px rgba(74, 222, 128, 0.3)';
    return '0 4px 15px hsl(var(--primary) / 0.3)';
  };
  
  const getTextColor = () => {
    if (isNeonTheme) return '#4ADE80';
    if (isYellowTheme) return '#78350F';
    return 'hsl(var(--primary))';
  };
  
  const getIconColor = () => isYellowTheme ? '#78350F' : '#FFFFFF';

  const getSubtleBg = () => {
    if (isNeonTheme) return 'linear-gradient(145deg, rgba(74, 222, 128, 0.15) 0%, rgba(74, 222, 128, 0.05) 100%)';
    if (isHoloTheme) return 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)';
    return 'linear-gradient(145deg, hsl(var(--card) / 0.95) 0%, hsl(var(--accent) / 0.9) 100%)';
  };

  const renderCalendarDays = () => {
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatLocalDate(new Date(year, month, day));
      const entry = getEntryByDate(dateStr);
      const isBest = weekBestDays[dateStr];
      const today = isToday(day);

      const level: RatingLevel | null = entry
        ? (Math.min(3, Math.max(1, entry.rating)) as RatingLevel)
        : null;
      const visuals = level ? getRatingVisuals(themeId, level) : null;
      const empty = !entry ? getEmptyCellVisuals(themeId) : null;

      const cellBackground = visuals ? visuals.background : empty!.background;
      const cellShadow = visuals
        ? visuals.boxShadow
        : '0 2px 10px hsl(var(--foreground) / 0.05)';
      const cellBorder = today
        ? (isNeonTheme ? '3px solid hsl(142 71% 45%)' : '3px solid hsl(var(--primary))')
        : visuals?.border ?? (entry ? 'none' : '2px solid hsl(var(--border) / 0.5)');

      days.push(
        <motion.button
          key={day}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            if (entry) {
              triggerConfetti(e);
              setTimeout(() => navigate(`/entry/${dateStr}`), 200);
            } else {
              const clickedDate = new Date(year, month, day);
              const todayDate = new Date();
              todayDate.setHours(0, 0, 0, 0);
              if (clickedDate <= todayDate) {
                navigate(`/record?date=${dateStr}`);
              }
            }
          }}
          className="aspect-square rounded-2xl flex flex-col items-center justify-center relative cursor-pointer transition-all"
          style={{
            background: cellBackground,
            boxShadow: cellShadow,
            border: cellBorder,
          }}
        >
          {level === 3 && (
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%)' }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}

          {(level === 3 || isBest) && (
            <motion.span
              className="absolute -top-1 -right-1 text-xs"
              animate={{ y: [0, -2, 0], rotate: [-5, 5, -5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              👑
            </motion.span>
          )}

          <span
            className="text-xs sm:text-sm font-bold relative z-10"
            style={{
              color: visuals
                ? visuals.numberColor
                : today
                  ? getTextColor()
                  : empty!.numberColor,
              textShadow: visuals
                ? visuals.numberShadow
                : empty!.numberShadow || 'none',
            }}
          >
            {day}
          </span>

          {entry && (
            <motion.span
              className="text-xs relative z-10"
              animate={level === 3 ? { scale: [1, 1.2, 1] } : undefined}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {getRatingEmoji(entry.rating)}
            </motion.span>
          )}
        </motion.button>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen max-w-md mx-auto pt-safe pb-20 relative overflow-hidden">
      <CandyBackground />
      
      {/* Header */}
      <header className="relative z-10 p-4 flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/')}
          className="p-3 rounded-full shadow-lg"
          style={{
            background: getThemedButtonBg(),
            boxShadow: getThemedShadow(),
          }}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: getIconColor() }} />
        </motion.button>
        
        <motion.h1 
          className="font-black text-xl"
          style={{ color: getTextColor() }}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          ✨ 嗨呀！动态 ✨
        </motion.h1>
      </header>
      
      {/* Month Navigation */}
      <div className="relative z-10 px-4 py-2 flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.2, rotate: -10 }}
          whileTap={{ scale: 0.8 }}
          onClick={prevMonth}
          className="p-3 rounded-full shadow-lg"
          style={{
            background: getSubtleBg(),
            boxShadow: isNeonTheme 
              ? '0 0 20px rgba(74, 222, 128, 0.2)'
              : '0 4px 15px hsl(var(--primary) / 0.15)',
          }}
        >
          <Rocket className="w-5 h-5 rotate-180" style={{ color: getTextColor() }} />
        </motion.button>
        
        <motion.h2 
          className="text-xl font-black"
          style={{ color: getTextColor() }}
          key={`${year}-${month}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {year}年 {monthNames[month]}
        </motion.h2>
        
        <motion.button
          whileHover={{ scale: 1.2, rotate: 10 }}
          whileTap={{ scale: 0.8 }}
          onClick={nextMonth}
          className="p-3 rounded-full shadow-lg"
          style={{
            background: getSubtleBg(),
            boxShadow: isNeonTheme 
              ? '0 0 20px rgba(74, 222, 128, 0.2)'
              : '0 4px 15px hsl(var(--primary) / 0.15)',
          }}
        >
          <Rocket className="w-5 h-5" style={{ color: getTextColor() }} />
        </motion.button>
      </div>
      
      {/* Calendar Card */}
      <div
        className="relative z-10 p-4"
        onTouchStart={(e) => {
          const touch = e.touches[0];
          (e.currentTarget as any)._swipeX = touch.clientX;
        }}
        onTouchEnd={(e) => {
          const startX = (e.currentTarget as any)._swipeX;
          if (startX == null) return;
          const endX = e.changedTouches[0].clientX;
          const diff = endX - startX;
          if (Math.abs(diff) > 60) {
            if (diff > 0) prevMonth();
            else nextMonth();
          }
          (e.currentTarget as any)._swipeX = null;
        }}
      >
        <motion.div 
          className="rounded-3xl p-4 shadow-2xl"
          style={{
            background: isNeonTheme 
              ? 'linear-gradient(145deg, hsl(222 47% 11% / 0.95) 0%, hsl(222 47% 8% / 0.9) 100%)'
              : 'linear-gradient(145deg, hsl(var(--card) / 0.95) 0%, hsl(var(--accent) / 0.9) 100%)',
            boxShadow: isNeonTheme 
              ? '0 15px 50px hsl(142 71% 45% / 0.2), inset 0 1px 0 hsl(142 71% 45% / 0.1)'
              : '0 15px 50px hsl(var(--primary) / 0.2), inset 0 1px 0 rgba(255,255,255,0.8)',
            border: isNeonTheme 
              ? '2px solid hsl(142 71% 45% / 0.3)'
              : '2px solid hsl(var(--primary) / 0.2)',
          }}
          key={`${year}-${month}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {weekDays.map(day => (
              <div key={day} className="aspect-square flex items-center justify-center">
                <span className="text-xs font-bold" style={{ color: getTextColor() }}>{day}</span>
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {renderCalendarDays()}
          </div>
        </motion.div>
      </div>
      
      {/* Legend */}
      <div className="relative z-10 p-4 flex items-center justify-center gap-4 text-sm">
        <motion.div 
          className="flex items-center gap-2 px-4 py-2 rounded-full shadow-md"
          style={{ background: getSubtleBg() }}
          whileHover={{ scale: 1.05 }}
        >
          <div 
            className="w-5 h-5 rounded-lg flex items-center justify-center"
            style={{ background: getThemedButtonBg() }}
          >
            <span className="text-[8px]">🙂</span>
          </div>
          <span className="font-medium" style={{ color: getTextColor() }}>有记录</span>
        </motion.div>
        
        <motion.div 
          className="flex items-center gap-2 px-4 py-2 rounded-full shadow-md"
          style={{ background: getSubtleBg() }}
          whileHover={{ scale: 1.05 }}
        >
          <div 
            className="w-5 h-5 rounded-lg flex items-center justify-center relative"
            style={{ background: getThemedButtonBg() }}
          >
            <span className="text-[8px]">👑</span>
          </div>
          <span className="font-medium" style={{ color: getTextColor() }}>本周最佳</span>
        </motion.div>
      </div>

      <BottomTabBar />
    </div>
  );
};

export default HistoryPage;
