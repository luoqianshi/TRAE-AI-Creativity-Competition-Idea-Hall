// 数据与状态管理
const AppState = {
  diaries: [],
  currentDiary: null,
  compareLeft: null,
  compareRight: null,
  settings: {
    fontTheme: 'mixed',
    theme: 'film',
    apiKey: '',
    hasSeenWelcome: false
  }
};

// 示例日记数据
const sampleDiaries = [
  {
    id: 'd_20260707',
    date: '2026-07-07',
    displayDate: '7月7日',
    text: '放学路上，一只橘猫从围墙缺口钻出来，径直走到我脚边，蹭了蹭我的裤脚，然后蹲下来。我没带吃的，它也不走，就那么陪我坐了大概三分钟。夕阳把它的毛照得很软，我忽然觉得今天也没那么糟。',
    emotion: 'warmth',
    emotionLabel: '温暖',
    color: '#E8E0D8',
    poem: '今天有光，落在心上。',
    imageType: 'warmth',
    imageUrl: 'assets/暖橘.png'
  },
  {
    id: 'd_20260708',
    date: '2026-07-08',
    displayDate: '7月8日',
    text: '数学卷上印着 67。我把卷子对折，再对折，直到能塞进校服口袋，小得像一个秘密。然后在公交站等了四十分钟，雨把肩膀淋透了。车来的时候，我已经不想回家了。',
    emotion: 'sadness',
    emotionLabel: '悲伤',
    color: '#D4D4D0',
    poem: '雨把今天淋得很长。',
    imageType: 'sadness',
    imageUrl: 'assets/雨夜.png'
  },
  {
    id: 'd_20260709',
    date: '2026-07-09',
    displayDate: '7月9日',
    text: '明天要演讲，我睡不着，一直在想会不会忘词。',
    emotion: 'anxiety',
    emotionLabel: '焦虑',
    color: '#E0D8D0',
    poem: '九月的夜晚，有很多话在排练。',
    imageType: 'anxiety'
  },
  {
    id: 'd_20260710',
    date: '2026-07-10',
    displayDate: '7月10日',
    text: '周末了，什么都不想做，就想躺在床上看云。',
    emotion: 'calm',
    emotionLabel: '平静',
    color: '#E8ECEF',
    poem: '十月的云很慢，慢到能看见时间。',
    imageType: 'calm'
  },
  {
    id: 'd_20260711',
    date: '2026-07-11',
    displayDate: '7月11日',
    text: '今天下雨了，浑身湿透，但有人给我让了座。',
    emotion: 'sadness',
    emotionLabel: '悲伤',
    color: '#D4D4D0',
    poem: '十一月的雨天，有伞也有让座的人。',
    imageType: 'mixed'
  }
];

// 初始化数据
const DATA_VERSION = 2;

function initData() {
  const savedDiaries = localStorage.getItem('xsg_diaries');
  const savedSettings = localStorage.getItem('xsg_settings');
  const savedVersion = localStorage.getItem('xsg_data_version');

  // 数据版本更新时刷新示例数据
  if (savedDiaries && savedVersion === String(DATA_VERSION)) {
    AppState.diaries = JSON.parse(savedDiaries);
  } else {
    AppState.diaries = [...sampleDiaries];
    localStorage.setItem('xsg_data_version', String(DATA_VERSION));
    saveDiaries();
  }

  if (savedSettings) {
    AppState.settings = { ...AppState.settings, ...JSON.parse(savedSettings) };
  }
  saveSettings();
}

function saveDiaries() {
  localStorage.setItem('xsg_diaries', JSON.stringify(AppState.diaries));
}

function saveSettings() {
  localStorage.setItem('xsg_settings', JSON.stringify(AppState.settings));
}

function addDiary(diary) {
  AppState.diaries.unshift(diary);
  saveDiaries();
}

function deleteDiary(id) {
  AppState.diaries = AppState.diaries.filter(d => d.id !== id);
  saveDiaries();
}

function getDiaryById(id) {
  return AppState.diaries.find(d => d.id === id);
}

function clearAllData() {
  AppState.diaries = [...sampleDiaries];
  AppState.currentDiary = null;
  saveDiaries();
}

// 获取当前月份数据
function getMonthData(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const diary = AppState.diaries.find(d => d.date === dateStr);

    days.push({
      day,
      date: dateStr,
      hasDiary: !!diary,
      diary: diary || null
    });
  }

  return days;
}

// 获取月份第一天是星期几
function getFirstDayOfMonth(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

// 生成唯一 ID
function generateId() {
  return 'd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
