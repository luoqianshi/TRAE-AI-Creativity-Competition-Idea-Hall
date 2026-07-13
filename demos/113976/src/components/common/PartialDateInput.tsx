// 模糊日期输入组件
// 支持方式：
// 1. 下拉选择：年/月/日 各自可选，未知则留空
// 2. 日历牌：带农历显示，点击日期自动填入
//
// 输出格式：
// - 仅年份：1990
// - 年月：1990-05
// - 完整日期：1990-05-15

import { useState, useMemo, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Solar } from 'lunar-javascript';
import { cn } from '@/lib/utils';
import { isValidPartialDate } from '@/utils/helpers';

interface PartialDateInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

// 解析日期字符串为年月日
function parseDate(value: string): { year: string; month: string; day: string } {
  if (!value) return { year: '', month: '', day: '' };
  const parts = value.split('-');
  return {
    year: parts[0] || '',
    month: parts[1] || '',
    day: parts[2] || '',
  };
}

// 组合年月日为字符串
function combineDate(year: string, month: string, day: string): string {
  if (!year) return '';
  let result = year;
  if (month) {
    result += `-${month.padStart(2, '0')}`;
    if (day) {
      result += `-${day.padStart(2, '0')}`;
    }
  }
  return result;
}

// 获取某月天数
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// 获取农历日期文本（如"五月十七"）
function getLunarText(year: number, month: number, day: number): string {
  try {
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();
    const dayInChinese = lunar.getDayInChinese();
    // 每月初一显示月份
    if (day === 1) {
      return lunar.getMonthInChinese() + '月';
    }
    return dayInChinese;
  } catch {
    return '';
  }
}

// 当前年
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS: number[] = [];
for (let y = CURRENT_YEAR + 1; y >= 1900; y--) {
  YEAR_OPTIONS.push(y);
}

export function PartialDateInput({
  label,
  value,
  onChange,
  error,
}: PartialDateInputProps) {
  const { year, month, day } = parseDate(value);
  const [showCalendar, setShowCalendar] = useState(false);
  const [localError, setLocalError] = useState('');

  // 日历牌的当前显示月份
  const [calYear, setCalYear] = useState(() => {
    return year ? parseInt(year) : CURRENT_YEAR;
  });
  const [calMonth, setCalMonth] = useState(() => {
    return month ? parseInt(month) : new Date().getMonth() + 1;
  });

  // 当 value 变化时，同步日历牌显示月份
  useEffect(() => {
    if (year) {
      setCalYear(parseInt(year));
      if (month) setCalMonth(parseInt(month));
    }
  }, [year, month]);

  // 天数选项（根据年月动态变化）
  const dayOptions = useMemo(() => {
    if (!year || !month) return 31;
    return getDaysInMonth(parseInt(year), parseInt(month));
  }, [year, month]);

  const updateValue = (newYear: string, newMonth: string, newDay: string) => {
    // 如果选了月/日但没选年，自动用当前年
    const finalYear = newYear || (newMonth || newDay ? String(CURRENT_YEAR) : '');
    const val = combineDate(finalYear, newMonth, newDay);
    if (val && !isValidPartialDate(val)) {
      setLocalError('日期格式有误');
    } else {
      setLocalError('');
    }
    onChange(val);
  };

  // 日历牌选择日期
  const handleCalendarSelect = (y: number, m: number, d: number) => {
    updateValue(String(y), String(m), String(d));
    setShowCalendar(false);
  };

  // 生成日历牌的日期网格
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth - 1, 1);
    const startWeekday = firstDay.getDay(); // 0=周日
    const daysInMonth = getDaysInMonth(calYear, calMonth);

    const cells: Array<{ day: number | null; lunar: string }> = [];

    // 前面的空格
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ day: null, lunar: '' });
    }

    // 每一天
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, lunar: getLunarText(calYear, calMonth, d) });
    }

    return cells;
  }, [calYear, calMonth]);

  // 判断是否选中
  const isSelected = (d: number) => {
    return year === String(calYear) && month === String(calMonth) && day === String(d);
  };

  const prevMonth = () => {
    if (calMonth === 1) {
      setCalYear(calYear - 1);
      setCalMonth(12);
    } else {
      setCalMonth(calMonth - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 12) {
      setCalYear(calYear + 1);
      setCalMonth(1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  const goToday = () => {
    const now = new Date();
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth() + 1);
  };

  const clearDate = () => {
    updateValue('', '', '');
    setShowCalendar(false);
  };

  const hasError = error || localError;

  return (
    <div className="relative">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-ink-700">
          {label}
        </label>
      )}

      {/* 下拉选择行 */}
      <div className="flex gap-2 items-center">
        {/* 年 */}
        <select
          value={year}
          onChange={(e) => updateValue(e.target.value, month, day)}
          className={cn(
            'flex-1 h-11 px-2 rounded-lg border bg-white text-ink-800 text-sm',
            'focus:outline-none focus:ring-2',
            hasError
              ? 'border-cinnabar-400 focus:ring-cinnabar-200'
              : 'border-xuan-300 focus:border-cinnabar-400 focus:ring-cinnabar-100',
          )}
        >
          <option value="">年</option>
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>
              {y}年
            </option>
          ))}
        </select>

        {/* 月 */}
        <select
          value={month}
          onChange={(e) => updateValue(year, e.target.value, day)}
          disabled={!year}
          className={cn(
            'w-20 h-11 px-2 rounded-lg border bg-white text-ink-800 text-sm',
            'focus:outline-none focus:ring-2 disabled:bg-xuan-100 disabled:text-ink-400',
            hasError
              ? 'border-cinnabar-400 focus:ring-cinnabar-200'
              : 'border-xuan-300 focus:border-cinnabar-400 focus:ring-cinnabar-100',
          )}
        >
          <option value="">月</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {m}月
            </option>
          ))}
        </select>

        {/* 日 */}
        <select
          value={day}
          onChange={(e) => updateValue(year, month, e.target.value)}
          disabled={!year || !month}
          className={cn(
            'w-20 h-11 px-2 rounded-lg border bg-white text-ink-800 text-sm',
            'focus:outline-none focus:ring-2 disabled:bg-xuan-100 disabled:text-ink-400',
            hasError
              ? 'border-cinnabar-400 focus:ring-cinnabar-200'
              : 'border-xuan-300 focus:border-cinnabar-400 focus:ring-cinnabar-100',
          )}
        >
          <option value="">日</option>
          {Array.from({ length: dayOptions }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {d}日
            </option>
          ))}
        </select>

        {/* 日历牌按钮 */}
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className={cn(
            'shrink-0 w-11 h-11 rounded-lg border flex items-center justify-center transition-colors',
            showCalendar
              ? 'border-cinnabar-400 bg-cinnabar-50 text-cinnabar-600'
              : 'border-xuan-300 bg-white text-ink-500 hover:border-cinnabar-300',
          )}
        >
          <CalendarIcon size={18} />
        </button>
      </div>

      {/* 提示文字 */}
      <p className="mt-1 text-xs text-ink-400">
        年月日均可留空（不清楚的可以不填）
      </p>

      {hasError && (
        <p className="mt-1 text-xs text-cinnabar-600">{error || localError}</p>
      )}

      {/* 日历牌弹窗 */}
      {showCalendar && (
        <>
          {/* 遮罩 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowCalendar(false)}
          />

          {/* 日历牌 */}
          <div className="absolute z-50 mt-1 rounded-xl bg-white border border-xuan-300 shadow-paper-lg p-3 w-[320px]">
            {/* 头部导航 */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={prevMonth}
                className="w-8 h-8 rounded-lg hover:bg-xuan-100 flex items-center justify-center text-ink-500"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-ink-800">
                {calYear}年 {calMonth}月
              </span>
              <button
                type="button"
                onClick={nextMonth}
                className="w-8 h-8 rounded-lg hover:bg-xuan-100 flex items-center justify-center text-ink-500"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {['日', '一', '二', '三', '四', '五', '六'].map((w) => (
                <div
                  key={w}
                  className="text-center text-[11px] text-ink-400 font-medium py-1"
                >
                  {w}
                </div>
              ))}
            </div>

            {/* 日期网格 */}
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((cell, idx) => {
                if (cell.day === null) {
                  return <div key={idx} className="aspect-square" />;
                }
                const selected = isSelected(cell.day);
                const today =
                  calYear === new Date().getFullYear() &&
                  calMonth === new Date().getMonth() + 1 &&
                  cell.day === new Date().getDate();

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      handleCalendarSelect(calYear, calMonth, cell.day!)
                    }
                    className={cn(
                      'aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors',
                      selected
                        ? 'bg-cinnabar-500 text-white'
                        : today
                          ? 'bg-cinnabar-50 text-cinnabar-600 border border-cinnabar-200'
                          : 'hover:bg-xuan-100 text-ink-700',
                    )}
                  >
                    <span className="text-sm font-medium leading-none">
                      {cell.day}
                    </span>
                    <span
                      className={cn(
                        'text-[9px] leading-none',
                        selected ? 'text-white/80' : 'text-ink-400',
                      )}
                    >
                      {cell.lunar}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 底部按钮 */}
            <div className="flex justify-between mt-3 pt-2 border-t border-xuan-100">
              <button
                type="button"
                onClick={clearDate}
                className="px-3 py-1.5 text-xs text-ink-500 hover:text-cinnabar-600"
              >
                清除
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={goToday}
                  className="px-3 py-1.5 text-xs text-ink-500 hover:text-cinnabar-600"
                >
                  今天
                </button>
                <button
                  type="button"
                  onClick={() => setShowCalendar(false)}
                  className="px-3 py-1.5 text-xs rounded-md bg-xuan-100 text-ink-600 hover:bg-xuan-200"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
