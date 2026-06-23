import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { getRatingVisuals, getEmptyCellVisuals, RatingLevel } from '@/lib/ratingStyles';
import { formatLocalDate, startOfLocalDay } from '@/lib/date';

const FourWeekCalendar = () => {
  const { getEntryByDate, settings } = useApp();
  const navigate = useNavigate();
  const themeId = settings.currentTheme || 'orange';

  // Get 4 weeks of dates with current week in the 3rd row
  const getCalendarDates = () => {
    const today = startOfLocalDay();
    const dayOfWeek = today.getDay();
    const thisWeekSunday = new Date(today);
    thisWeekSunday.setDate(today.getDate() - dayOfWeek);
    const startDate = new Date(thisWeekSunday);
    startDate.setDate(thisWeekSunday.getDate() - 14);
    const weeks: Date[][] = [];
    for (let week = 0; week < 4; week++) {
      const weekDates: Date[] = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + (week * 7) + day);
        weekDates.push(date);
      }
      weeks.push(weekDates);
    }
    return weeks;
  };

  const weeks = getCalendarDates();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentWeek = (weekIndex: number) => weekIndex === 2;

  return (
    <div className="space-y-0.5">
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-[10px] text-muted-foreground font-medium py-0.5">
            {day}
          </div>
        ))}
      </div>

      {weeks.map((week, weekIndex) => (
        <div
          key={weekIndex}
          className={`grid grid-cols-7 gap-0.5 ${isCurrentWeek(weekIndex) ? 'ring-2 ring-primary/30 rounded-lg p-0.5 -mx-0.5' : ''}`}
        >
          {week.map((date) => {
            const dateStr = formatLocalDate(date);
            const entry = getEntryByDate(dateStr);
            const today = isToday(date);

            const visuals = entry
              ? getRatingVisuals(themeId, Math.min(3, Math.max(1, entry.rating)) as RatingLevel)
              : null;
            const empty = !entry ? getEmptyCellVisuals(themeId) : null;

            return (
              <motion.button
                key={dateStr}
                onClick={() => navigate('/history')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all min-h-[36px] relative ${today ? 'ring-2 ring-primary' : ''}`}
                style={{
                  background: visuals ? visuals.background : empty!.background,
                  boxShadow: visuals ? visuals.boxShadow : undefined,
                  border: visuals?.border,
                }}
              >
                {entry?.rating === 3 && (
                  <span className="absolute -top-1 -right-0.5 text-[9px] leading-none">👑</span>
                )}
                <span
                  className="text-[10px] font-bold leading-none"
                  style={{
                    color: visuals ? visuals.numberColor : empty!.numberColor,
                    textShadow: visuals ? visuals.numberShadow : empty!.numberShadow,
                  }}
                >
                  {date.getDate()}
                </span>
                {entry && (
                  <span className="text-[9px] leading-none mt-0.5">
                    {['', '😊', '😆', '🤩'][entry.rating]}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default FourWeekCalendar;
