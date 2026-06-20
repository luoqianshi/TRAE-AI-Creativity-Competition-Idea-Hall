const { calculateFortune, getDayGanZhi, getSolarFestival, getLunarFestival, getShengXiao, getXingZuo } = require('../../utils/fortune-engine');
const { solarToLunar, getYearJieQi } = require('../../utils/calendar-data');

Page({
  data: {
    currentDate: { year: 2026, month: 6 },
    selectedDate: { year: 2026, month: 6, day: 16 },
    today: { year: 2026, month: 6, day: 16 },
    calendarDays: [],
    fortune: null,
    hasBaZi: false,
    userBaZi: null,
    userFullBaZi: null,
    jieQiList: [],
    selectedLunar: null,
    baziRecords: [],
    showBaZiModal: false
  },

  onLoad() {
    const now = new Date();
    const today = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    };
    this.setData({
      currentDate: { year: today.year, month: today.month },
      selectedDate: { ...today },
      today: { ...today }
    });
    this.loadUserBaZi();
    this.generateCalendar();
  },

  onShow() {
    this.loadUserBaZi();
  },

  getMonthJieQi(year, month) {
    const jieQiList = getYearJieQi(year);
    return jieQiList.filter(jq => jq.m === month);
  },

  loadUserBaZi() {
    try {
      const records = wx.getStorageSync('baziRecords') || [];
      this.setData({ baziRecords: records });
      
      const selectedRecord = wx.getStorageSync('selectedBaZiRecord');
      if (selectedRecord) {
        wx.removeStorageSync('selectedBaZiRecord');
        this.setCurrentBaZi(selectedRecord);
        return;
      }
      
      if (records.length > 0) {
        const latest = records[0];
        this.setCurrentBaZi(latest);
      } else {
        this.setData({ hasBaZi: false });
      }
    } catch (e) {
      console.error('读取排盘记录失败', e);
      this.setData({ hasBaZi: false });
    }
  },

  setCurrentBaZi(record) {
    const riGan = record.riZhu ? record.riZhu.charAt(0) : '甲';
    const riWuXing = record.wuXing || '木';
    this.setData({
      hasBaZi: true,
      userBaZi: { riGan, riWuXing },
      userFullBaZi: {
        baZi: record.baZi || '',
        name: record.name || '未命名',
        gender: record.gender || '男',
        riZhu: record.riZhu || ''
      }
    });
    this.calculateDailyFortune();
  },

  showBaZiSelector() {
    const records = wx.getStorageSync('baziRecords') || [];
    console.log('baziRecords:', records);
    this.setData({ baziRecords: records, showBaZiModal: true });
  },

  hideBaZiSelector() {
    this.setData({ showBaZiModal: false });
  },

  selectBaZiRecord(e) {
    const idx = parseInt(e.currentTarget.dataset.idx);
    console.log('selected idx:', idx);
    const record = this.data.baziRecords[idx];
    console.log('found record:', record);
    if (record) {
      this.setCurrentBaZi(record);
      wx.showToast({ title: '已切换八字', icon: 'success' });
    } else {
      wx.showToast({ title: '未找到记录', icon: 'none' });
    }
    this.hideBaZiSelector();
  },

  generateCalendar() {
    const { currentDate } = this.data;
    const { year, month } = currentDate;

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    const jieQiMap = {};
    const jieQiList = this.getMonthJieQi(year, month);
    jieQiList.forEach(jq => {
      jieQiMap[jq.d] = jq.n;
    });

    const days = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      const prevMonthNum = month === 1 ? 12 : month - 1;
      const prevYearNum = month === 1 ? year - 1 : year;
      const day = prevMonthLastDay - (startDayOfWeek - 1 - i);
      const ganZhi = getDayGanZhi(prevYearNum, prevMonthNum, day);
      const lunar = solarToLunar(prevYearNum, prevMonthNum, day);
      const solarFestival = getSolarFestival(prevMonthNum, day);
      const lunarFestival = getLunarFestival(lunar.lunarMonth, lunar.lunarDay);
      days.push({
        day,
        date: { year: prevYearNum, month: prevMonthNum, day },
        dateKey: `${prevYearNum}-${prevMonthNum}-${day}`,
        isOtherMonth: true,
        ganZhi: `${ganZhi.gan}${ganZhi.zhi}`,
        lunarDay: lunar.dayName,
        solarFestival,
        lunarFestival,
        jieQi: null
      });
    }

    for (let day = 1; day <= totalDays; day++) {
      const ganZhi = getDayGanZhi(year, month, day);
      const lunar = solarToLunar(year, month, day);
      const solarFestival = getSolarFestival(month, day);
      const lunarFestival = getLunarFestival(lunar.lunarMonth, lunar.lunarDay);
      const jieQi = jieQiMap[day] || null;
      days.push({
        day,
        date: { year, month, day },
        isOtherMonth: false,
        isSelected: this.isSelected(year, month, day),
        isToday: this.isToday(year, month, day),
        ganZhi: `${ganZhi.gan}${ganZhi.zhi}`,
        lunarDay: lunar.dayName,
        solarFestival,
        lunarFestival,
        jieQi
      });
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonthNum = month === 12 ? 1 : month + 1;
      const nextYearNum = month === 12 ? year + 1 : year;
      const ganZhi = getDayGanZhi(nextYearNum, nextMonthNum, day);
      const lunar = solarToLunar(nextYearNum, nextMonthNum, day);
      const solarFestival = getSolarFestival(nextMonthNum, day);
      const lunarFestival = getLunarFestival(lunar.lunarMonth, lunar.lunarDay);
      days.push({
        day,
        date: { year: nextYearNum, month: nextMonthNum, day },
        isOtherMonth: true,
        ganZhi: `${ganZhi.gan}${ganZhi.zhi}`,
        lunarDay: lunar.dayName,
        solarFestival,
        lunarFestival,
        jieQi: null
      });
    }

    this.setData({ calendarDays: days, jieQiList });
  },

  isSelected(year, month, day) {
    const { selectedDate } = this.data;
    return selectedDate.year === year && selectedDate.month === month && selectedDate.day === day;
  },

  isToday(year, month, day) {
    const { today } = this.data;
    return today.year === year && today.month === month && today.day === day;
  },

  prevMonth() {
    let { year, month } = this.data.currentDate;
    if (month === 1) {
      month = 12;
      year--;
    } else {
      month--;
    }
    this.setData({ currentDate: { year, month } });
    this.generateCalendar();
  },

  nextMonth() {
    let { year, month } = this.data.currentDate;
    if (month === 12) {
      month = 1;
      year++;
    } else {
      month++;
    }
    this.setData({ currentDate: { year, month } });
    this.generateCalendar();
  },

  selectDate(e) {
    const date = e.currentTarget.dataset.date;
    this.setData({ selectedDate: date });
    this.generateCalendar();
    this.calculateDailyFortune();
  },

  calculateDailyFortune() {
    if (!this.data.hasBaZi || !this.data.userBaZi) return;

    const { selectedDate, userBaZi } = this.data;
    const date = new Date(selectedDate.year, selectedDate.month - 1, selectedDate.day);
    const fortune = calculateFortune(userBaZi, date);
    
    const lunar = solarToLunar(selectedDate.year, selectedDate.month, selectedDate.day);
    const jieQiList = this.getMonthJieQi(selectedDate.year, selectedDate.month);
    const jieQi = jieQiList.find(jq => jq.d === selectedDate.day);
    
    this.setData({ 
      fortune, 
      selectedLunar: lunar,
      jieQiList 
    });
  },

  goPaipan() {
    wx.switchTab({ url: '/pages/bazi/input' });
  }
});
