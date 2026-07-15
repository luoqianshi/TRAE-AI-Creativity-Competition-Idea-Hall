// utils/format.js — 格式化工具
const formatDate = (ts, fmt = 'YYYY-MM-DD') => {
  const d = new Date(ts);
  const map = {
    YYYY: d.getFullYear(),
    MM: String(d.getMonth() + 1).padStart(2, '0'),
    DD: String(d.getDate()).padStart(2, '0'),
    HH: String(d.getHours()).padStart(2, '0'),
    mm: String(d.getMinutes()).padStart(2, '0'),
  };
  return fmt.replace(/YYYY|MM|DD|HH|mm/g, (m) => map[m]);
};

const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}'${String(s).padStart(2, '0')}"`;
};

// 本周区间
const getWeekRange = (ts = Date.now()) => {
  const d = new Date(ts);
  const day = d.getDay() || 7; // 周日转7
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + 1);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday.getTime(), end: sunday.getTime() };
};

module.exports = { formatDate, formatDuration, getWeekRange };
