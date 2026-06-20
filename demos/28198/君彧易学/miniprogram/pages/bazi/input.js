/**
 * 特质解读 - 输入页面
 */

const { REGION_DATA } = require('../../utils/region-data');
const { calcTrueSolarTime } = require('../../utils/solar-time');
const { paipan } = require('../../utils/bazi-engine');

Page({
  data: {
    // 姓名
    name: '',

    // 日期选择
    year: 2000,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,

    // 保存状态
    isSaved: false,

    // 选择器范围
    years: [],
    months: [],
    days: [],
    hours: [],
    minutes: [],

    // 显示值
    yearIndex: 100, // 默认2000年
    monthIndex: 0,
    dayIndex: 0,
    hourIndex: 12,
    minuteIndex: 0,

    // 性别
    gender: '男',

    // 历法类型 solar=公历 lunar=农历 bazi=四柱
    calendarType: 'solar',

    // 地区
    region: '',
    regionLng: 116.407,
    regionLat: 39.904,

    // 分组
    group: '',

    // 保存设置
    saveSettings: true,

    // 时辰对照
    shiChenLabel: '午时',

    // 日期有效性
    isLeapYear: false,
    maxDay: 31,

    // 弹窗显示状态
    showDatePicker: false,
    showRegionPicker: false,

    // 日期弹窗临时值
    pickerYearIndex: 100,
    pickerMonthIndex: 0,
    pickerDayIndex: 0,
    pickerHourIndex: 12,
    pickerMinuteIndex: 0,

    // 地区数据
    provinces: REGION_DATA,
    currentCities: REGION_DATA[0].cities,

    // 地区弹窗临时值
    pickerProvinceIndex: 0,
    pickerCityIndex: 0
  },

  onLoad() {
    this.initPickerData();
    this.updateDayRange();
  },

  /**
   * 初始化选择器数据
   */
  initPickerData() {
    // 年份范围：1900-2100
    const years = [];
    for (let i = 1900; i <= 2100; i++) years.push(i);

    const months = [];
    for (let i = 1; i <= 12; i++) months.push(i);

    const hours = [];
    for (let i = 0; i <= 23; i++) hours.push(i);

    const minutes = [];
    for (let i = 0; i <= 59; i++) minutes.push(i);

    this.setData({
      years,
      months,
      hours,
      minutes,
      yearIndex: 100, // 2000
      monthIndex: 0,
      dayIndex: 0,
      hourIndex: 12,
      minuteIndex: 0,
      pickerYearIndex: 100,
      pickerMonthIndex: 0,
      pickerDayIndex: 0,
      pickerHourIndex: 12,
      pickerMinuteIndex: 0
    });
  },

  /**
   * 更新日期范围
   */
  updateDayRange() {
    const { year, month } = this.data;
    const daysInMonth = this.getDaysInMonth(year, month);
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    this.setData({
      days,
      maxDay: daysInMonth,
      isLeapYear: isLeap,
      dayIndex: Math.min(this.data.dayIndex, daysInMonth - 1),
      day: Math.min(this.data.day, daysInMonth)
    });
  },

  /**
   * 获取月份天数
   */
  getDaysInMonth(year, month) {
    const daysMap = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0))) {
      return 29;
    }
    return daysMap[month - 1];
  },

  /**
   * 更新时辰标签
   */
  updateShiChen(hour) {
    const shiChenMap = {
      0: '子时', 1: '丑时', 2: '丑时', 3: '寅时', 4: '寅时', 5: '卯时', 6: '卯时',
      7: '辰时', 8: '辰时', 9: '巳时', 10: '巳时', 11: '午时', 12: '午时',
      13: '未时', 14: '未时', 15: '申时', 16: '申时', 17: '酉时', 18: '酉时',
      19: '戌时', 20: '戌时', 21: '亥时', 22: '亥时', 23: '子时'
    };
    return shiChenMap[hour] || '';
  },

  // ==================== 表单事件 ====================

  onNameInput(e) {
    this.setData({ name: e.detail.value });
  },

  onGenderChange(e) {
    this.setData({ gender: e.currentTarget.dataset.gender });
  },

  onCalendarChange(e) {
    this.setData({ calendarType: e.currentTarget.dataset.type });
  },

  toggleSave() {
    const { isSaved } = this.data;
    this.setData({ isSaved: !isSaved });
    wx.showToast({ title: isSaved ? '已取消保存' : '将在分析时保存', icon: 'none' });
  },

  saveRecord() {
    const { name, year, month, day, hour, gender } = this.data;

    try {
      const records = wx.getStorageSync('baziRecords') || [];
      const recordKey = `${name}_${year}_${month}_${day}_${hour}`;

      const existing = records.find(r => {
        const rKey = `${r.name}_${r.year}_${r.month}_${r.day}_${r.hour}`;
        return rKey === recordKey;
      });

      if (existing) {
        wx.showToast({ title: '该记录已存在', icon: 'none' });
        return;
      }

      const result = paipan({ year, month, day, hour, gender });

      const record = {
        id: Date.now().toString(),
        name: name || '未命名',
        gender: gender,
        year: Number(year),
        month: Number(month),
        day: Number(day),
        hour: Number(hour),
        baZi: result.baZi || '',
        riZhu: result.riZhu.ganZhi || '',
        wuXing: result.riZhu.wuXing || '',
        saveTime: Date.now()
      };
      console.log('saved record:', record);

      records.unshift(record);
      wx.setStorageSync('baziRecords', records);
      wx.showToast({ title: '保存成功', icon: 'success' });
    } catch (e) {
      console.error('保存失败', e);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  // ==================== 日期时间弹窗 ====================

  showDatePicker() {
    // 打开弹窗时同步当前值到临时值
    this.setData({
      showDatePicker: true,
      pickerYearIndex: this.data.yearIndex,
      pickerMonthIndex: this.data.monthIndex,
      pickerDayIndex: this.data.dayIndex,
      pickerHourIndex: this.data.hourIndex,
      pickerMinuteIndex: this.data.minuteIndex
    });
  },

  hideDatePicker() {
    this.setData({ showDatePicker: false });
  },

  stopPropagation() {
    // 阻止冒泡，点击面板不关闭弹窗
  },

  confirmDatePicker() {
    const {
      pickerYearIndex, pickerMonthIndex, pickerDayIndex,
      pickerHourIndex, pickerMinuteIndex,
      years, months, days, hours, minutes
    } = this.data;

    const year = years[pickerYearIndex];
    const month = months[pickerMonthIndex];
    const day = days[pickerDayIndex];
    const hour = hours[pickerHourIndex];
    const minute = minutes[pickerMinuteIndex];

    // 先更新年月，再更新日期范围
    this.setData({
      yearIndex: pickerYearIndex,
      monthIndex: pickerMonthIndex,
      dayIndex: pickerDayIndex,
      hourIndex: pickerHourIndex,
      minuteIndex: pickerMinuteIndex,
      year, month, day, hour, minute,
      showDatePicker: false
    }, () => {
      this.updateDayRange();
      this.setData({
        shiChenLabel: this.updateShiChen(hour)
      });
    });
  },

  onPickerYearChange(e) {
    this.setData({ pickerYearIndex: e.detail.value[0] });
  },

  onPickerMonthChange(e) {
    this.setData({ pickerMonthIndex: e.detail.value[0] });
  },

  onPickerDayChange(e) {
    this.setData({ pickerDayIndex: e.detail.value[0] });
  },

  onPickerHourChange(e) {
    this.setData({ pickerHourIndex: e.detail.value[0] });
  },

  onPickerMinuteChange(e) {
    this.setData({ pickerMinuteIndex: e.detail.value[0] });
  },

  // ==================== 地区选择弹窗 ====================

  showRegionPicker() {
    const { region, provinces } = this.data;
    // 查找当前地区对应的索引
    let provIdx = 0, cityIdx = 0;
    for (let i = 0; i < provinces.length; i++) {
      const cities = provinces[i].cities;
      for (let j = 0; j < cities.length; j++) {
        if (cities[j].name === region) {
          provIdx = i;
          cityIdx = j;
          break;
        }
      }
    }
    this.setData({
      showRegionPicker: true,
      pickerProvinceIndex: provIdx,
      pickerCityIndex: cityIdx,
      currentCities: provinces[provIdx].cities
    });
  },

  hideRegionPicker() {
    this.setData({ showRegionPicker: false });
  },

  onSelectProvince(e) {
    const idx = e.currentTarget.dataset.index;
    const prov = this.data.provinces[idx];
    this.setData({
      pickerProvinceIndex: idx,
      pickerCityIndex: 0,
      currentCities: prov.cities
    });
  },

  onSelectCity(e) {
    const idx = e.currentTarget.dataset.index;
    this.setData({ pickerCityIndex: idx });
  },

  confirmRegionPicker() {
    const { provinces, pickerProvinceIndex, pickerCityIndex } = this.data;
    const prov = provinces[pickerProvinceIndex];
    const city = prov.cities[pickerCityIndex];
    // 直辖市显示省名，其他显示省+市
    const regionLabel = (prov.cities.length === 1) ? prov.name : (prov.name + ' ' + city.name);
    this.setData({
      region: city.name,
      regionLabel: regionLabel,
      regionLng: city.lng,
      regionLat: city.lat,
      showRegionPicker: false
    });
  },

  // ==================== 选择器事件 ====================

  onYearChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({
      yearIndex: idx,
      year: this.data.years[idx]
    });
    this.updateDayRange();
  },

  onMonthChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({
      monthIndex: idx,
      month: this.data.months[idx]
    });
    this.updateDayRange();
  },

  onDayChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({
      dayIndex: idx,
      day: this.data.days[idx]
    });
  },

  onHourChange(e) {
    const idx = parseInt(e.detail.value);
    this.setData({
      hourIndex: idx,
      hour: this.data.hours[idx],
      shiChenLabel: this.updateShiChen(this.data.hours[idx])
    });
  },

  // ==================== 快速设置 ====================

  setToday() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hour = now.getHours();

    this.setData({
      year, month, day, hour,
      yearIndex: year - 1900,
      monthIndex: month - 1,
      dayIndex: day - 1,
      hourIndex: hour,
      shiChenLabel: this.updateShiChen(hour)
    });
    this.updateDayRange();
  },

  setNow() {
    this.setToday();
  },

  // ==================== 排盘 ====================

  startPaipan() {
    const { year, month, day, hour, minute, gender, regionLng, regionLat, regionLabel, name, isSaved } = this.data;

    // 基本验证
    if (!year || !month || !day) {
      wx.showToast({ title: '请选择完整日期', icon: 'none' });
      return;
    }

    // 校验必填项：姓名
    if (!name || !name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }

    // 校验必填项：出生地点
    if (!regionLabel || !regionLabel.trim()) {
      wx.showToast({ title: '请选择出生地点', icon: 'none' });
      return;
    }

    // 如果开启了保存，则先保存记录
    if (isSaved) {
      this.saveRecord();
    }

    // 计算真太阳时
    const trueSolar = calcTrueSolarTime({
      year, month, day, hour, minute,
      lng: regionLng
    });

    // 跳转到结果页，传入真太阳时 + 原始时间供展示
    const params = [
      `year=${year}`, `month=${month}`, `day=${day}`,
      `hour=${trueSolar.hour}`, `minute=${trueSolar.minute}`,
      `gender=${gender}`,
      `origHour=${hour}`, `origMinute=${minute || 0}`,
      `region=${encodeURIComponent(regionLabel || '')}`,
      `lat=${regionLat}`, `lng=${regionLng}`,
      `name=${encodeURIComponent(name || '')}`
    ].join('&');

    wx.navigateTo({
      url: `/pages/bazi/result?${params}`
    });
  },

  // ==================== 分享 ====================

  onShareAppMessage() {
    return {
      title: '君彧易学 — 时序转化 · 趣味探索',
      path: '/pages/bazi/input'
    };
  }
});
