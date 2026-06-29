/**
 * 生日纪 - 主逻辑文件
 * 依赖全局变量: EVENTS, CELEBRITIES, HOLIDAYS, ACTIVITIES (来自 data.js)
 */

// ==================== 1. 工具函数 ====================

// ---- 生日花 & 生日石（按月份） ----
var BIRTH_FLOWERS = [
  { name: '雪花莲', emoji: '\u2740\uFE0F', meaning: '希望' },
  { name: '紫罗兰', emoji: '\uD83C\uDF37', meaning: '忠诚' },
  { name: '雏菊', emoji: '\uD83C\uDF38', meaning: '纯洁' },
  { name: '香豌豆', emoji: '\uD83C\uDF3B', meaning: '快乐' },
  { name: '铃兰', emoji: '\uD83D\uDEE0\uFE0F', meaning: '幸福归来' },
  { name: '玫瑰', emoji: '\uD83C\uDF39', meaning: '热爱' },
  { name: '飞燕草', emoji: '\uD83C\uDF38', meaning: '自由' },
  { name: '剑兰', emoji: '\uD83C\uDF3A', meaning: '思念' },
  { name: '翠菊', emoji: '\uD83C\uDF3C', meaning: '信念' },
  { name: '金盏菊', emoji: '\uD83C\uDF3B', meaning: '温暖' },
  { name: '菊花', emoji: '\uD83C\uDF3C', meaning: '高洁' },
  { name: '水仙', emoji: '\uD83D\uDC9C', meaning: '自爱' }
];

var BIRTH_STONES = [
  '石榴石', '紫水晶', '海蓝宝', '钻石',
  '祖母绿', '珍珠', '红宝石', '橄榄石',
  '蓝宝石', '欧泊', '黄玉', '绿松石'
];

// ---- 星座性格关键词 & 速配 ----
var CONSTELLATION_TRAITS = {
  '白羊座': { trait: '热情冲动，天生领袖', match: '狮子座' },
  '金牛座': { trait: '稳重务实，品味不凡', match: '处女座' },
  '双子座': { trait: '机智灵动，社交达人', match: '天秤座' },
  '巨蟹座': { trait: '温柔细腻，重情顾家', match: '天蝎座' },
  '狮子座': { trait: '自信大方，王者风范', match: '射手座' },
  '处女座': { trait: '追求完美，心思缜密', match: '金牛座' },
  '天秤座': { trait: '优雅和谐，颜值担当', match: '双子座' },
  '天蝎座': { trait: '神秘深沉，洞察力强', match: '双鱼座' },
  '射手座': { trait: '自由乐观，冒险精神', match: '白羊座' },
  '摩羯座': { trait: '坚韧沉稳，目标明确', match: '金牛座' },
  '水瓶座': { trait: '独立前卫，思维跳跃', match: '双子座' },
  '双鱼座': { trait: '浪漫敏感，富有想象', match: '天蝎座' }
};

// ---- 简易农历近似计算（仅用于展示，非精确天文历法） ----
var LUNAR_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
var LUNAR_DAYS = [
  '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'
];

function getApproxLunarDate(year, month, day) {
  // 简易近似：基于已知的农历新年偏移量做推算（非精确历法）
  var lunarNewYearOffsets = {
    2020: 25, 2021: 12, 2022: 1, 2023: 22, 2024: 10,
    2025: 29, 2026: 17, 2027: 6, 2028: 26, 2029: 13,
    2030: 3
  };
  var offset = lunarNewYearOffsets[year] || 20;
  var jan25 = new Date(year, 0, 25);
  var target = new Date(year, month - 1, day);
  var diff = Math.floor((target - jan25) / 86400000) + (25 - offset);
  if (diff < 0) diff += 354;
  var lunarMonth = Math.floor(diff / 30) + 1;
  var lunarDay = diff % 30;
  if (lunarMonth > 12) lunarMonth = 12;
  if (lunarDay > 29) lunarDay = 29;
  return LUNAR_MONTHS[lunarMonth - 1] + '月' + LUNAR_DAYS[lunarDay];
}

function getDaysLived(year, month, day) {
  var birth = new Date(year, month - 1, day);
  var today = new Date();
  var diff = Math.floor((today - birth) / 86400000);
  return diff;
}

function getZodiac(year) {
  const animals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  const baseYear = 1900;
  const index = (year - baseYear) % 12;
  return animals[(index + 12) % 12];
}

function getConstellation(month, day) {
  const md = month * 100 + day;
  if (md >= 120 && md <= 218) return '水瓶座';
  if (md >= 219 && md <= 320) return '双鱼座';
  if (md >= 321 && md <= 419) return '白羊座';
  if (md >= 420 && md <= 520) return '金牛座';
  if (md >= 521 && md <= 621) return '双子座';
  if (md >= 622 && md <= 722) return '巨蟹座';
  if (md >= 723 && md <= 822) return '狮子座';
  if (md >= 823 && md <= 922) return '处女座';
  if (md >= 923 && md <= 1023) return '天秤座';
  if (md >= 1024 && md <= 1122) return '天蝎座';
  if (md >= 1123 && md <= 1221) return '射手座';
  return '摩羯座';
}

function getGenerationLabel(year) {
  if (year >= 2010) return '10后';
  if (year >= 2000) return '00后';
  if (year >= 1990) return '90后';
  if (year >= 1980) return '80后';
  if (year >= 1970) return '70后';
  if (year >= 1960) return '60后';
  if (year >= 1950) return '50后';
  return '';
}

function getDayOfWeek(year, month, day) {
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const date = new Date(year, month - 1, day);
  return days[date.getDay()];
}

function getSeason(month, day) {
  const md = month * 100 + day;
  if (md >= 321 && md <= 531) return '春季';
  if (md >= 601 && md <= 831) return '夏季';
  if (md >= 901 && md <= 1130) return '秋季';
  return '冬季';
}

function formatDate(year, month, day) {
  return year + '年' + month + '月' + day + '日';
}

// ==================== 2. 今日热点数据 ====================

const NEWS_DATA = [
  '大连夏季达沃斯论坛闭幕，2027年将在天津举办',
  '2026美加墨世界杯小组赛激战中',
  '全国高考分数线陆续公布',
  '欧洲遭遇今夏最强热浪',
  '中国超级计算机登顶全球榜单',
  '国际奥委会首次向所有奥运选手发放津贴'
];

// ==================== 3. 数据查询函数 ====================

function getEvents(month, day) {
  if (typeof EVENTS === 'undefined') return [];
  const key = month + '-' + day;
  return EVENTS[key] || [];
}

function getCelebrities(month, day) {
  if (typeof CELEBRITIES === 'undefined') return null;
  const key = month + '-' + day;
  return CELEBRITIES[key] || null;
}

function getHolidays(month, day) {
  if (typeof HOLIDAYS === 'undefined') return [];
  const key = month + '-' + day;
  return HOLIDAYS[key] || [];
}

function getActivities(city) {
  if (typeof ACTIVITIES === 'undefined') return [];
  const data = ACTIVITIES[city];
  return data ? data : [];
}

// ==================== 4. 映射函数 ====================

function mapHolidayType(type) {
  const map = {
    '国际节日': 'international',
    '中国传统节日': 'traditional',
    '纪念日': 'memorial',
    '节气': 'seasonal',
    '其他': 'other'
  };
  return map[type] || 'other';
}

function mapEventCategory(category) {
  const map = {
    '政治': 'politics',
    '科技': 'tech',
    '文化': 'culture',
    '战争': 'war',
    '体育': 'sports',
    '经济': 'economy',
    '社会': 'society'
  };
  return map[category] || 'other';
}

// ==================== 5. 页面渲染函数 ====================

let currentBirthDate = null;

function renderTimeCard(year, month, day) {
  const container = document.getElementById('timeCard');
  if (!container) return;

  const zodiac = getZodiac(year);
  const constellation = getConstellation(month, day);
  const generation = getGenerationLabel(year);
  const dayOfWeek = getDayOfWeek(year, month, day);
  const season = getSeason(month, day);
  const formatted = formatDate(year, month, day);

  let tagsHtml = '';
  tagsHtml += '<span class="time-tag zodiac">' + zodiac + '</span>';
  tagsHtml += '<span class="time-tag constellation">' + constellation + '</span>';
  if (generation) {
    tagsHtml += '<span class="time-tag generation">' + generation + '</span>';
  }
  tagsHtml += '<span class="time-tag season">' + season + '</span>';

  container.innerHTML =
    '<div class="time-card-date">' + formatted + '</div>' +
    '<div class="time-card-weekday">' + dayOfWeek + '</div>' +
    '<div class="time-card-tags">' + tagsHtml + '</div>';
}

function renderTimeline(month, day) {
  const container = document.getElementById('timeline');
  if (!container) return;

  const events = getEvents(month, day);

  if (events.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#a0a8c9;padding:2rem;">这一天在历史长河中静悄悄，暂无大事记录。</div>';
    return;
  }

  let html = '';
  events.forEach(function (e, index) {
    const catClass = mapEventCategory(e.category || '其他');
    const regionLabel = e.region === 'china' ? '中国' : '世界';
    const isEven = index % 2 === 0;
    html += '<div class="timeline-item" data-index="' + index + '">';
    html += '<div class="timeline-dot"></div>';
    html += '<div class="timeline-content">';
    html += '<div class="timeline-year">' + (e.year < 0 ? '前' + Math.abs(e.year) + '年' : e.year + '年') + ' · ' + regionLabel + '</div>';
    html += '<div class="timeline-event">' + (e.event || '') + '</div>';
    html += '<span class="timeline-category ' + catClass + '">' + (e.category || '其他') + '</span>';
    html += '</div></div>';
  });
  container.innerHTML = html;

  // 触发渐显动画
  setTimeout(function () {
    const items = container.querySelectorAll('.timeline-item');
    items.forEach(function (item, i) {
      setTimeout(function () {
        item.classList.add('visible');
      }, i * 100);
    });
  }, 100);
}

function renderCelebrities(month, day) {
  const container = document.getElementById('celebrityGrid');
  if (!container) return;

  const celebData = getCelebrities(month, day);
  let html = '';
  let hasData = false;

  if (celebData && celebData.births && celebData.births.length > 0) {
    hasData = true;
    celebData.births.forEach(function (c) {
      const initial = c.name ? c.name.charAt(0) : '?';
      html += '<div class="celebrity-card">';
      html += '<div class="celebrity-avatar">' + initial + '</div>';
      html += '<div class="celebrity-name">' + (c.name || '未知') + '</div>';
      html += '<div class="celebrity-year">' + (c.year || '') + '年生</div>';
      html += '<div class="celebrity-identity">' + (c.identity || '') + '</div>';
      html += '<div class="celebrity-desc">' + (c.description || '') + '</div>';
      html += '</div>';
    });
  }

  if (celebData && celebData.deaths && celebData.deaths.length > 0) {
    hasData = true;
    celebData.deaths.forEach(function (c) {
      const initial = c.name ? c.name.charAt(0) : '?';
      html += '<div class="celebrity-card" style="opacity:0.8;">';
      html += '<div class="celebrity-avatar" style="background:linear-gradient(135deg,#999,#666);">' + initial + '</div>';
      html += '<div class="celebrity-name">' + (c.name || '未知') + '</div>';
      html += '<div class="celebrity-year">' + (c.year || '') + '年逝世</div>';
      html += '<div class="celebrity-identity">' + (c.identity || '') + '</div>';
      html += '<div class="celebrity-desc">' + (c.description || '') + '</div>';
      html += '</div>';
    });
  }

  if (!hasData) {
    html = '<div style="text-align:center;color:#a0a8c9;padding:2rem;">暂无名人记录，但每个平凡的日子都值得被铭记。</div>';
  }

  container.innerHTML = html;
}

function renderHolidays(month, day) {
  const container = document.getElementById('holidayTags');
  if (!container) return;

  const holidays = getHolidays(month, day);

  if (holidays.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#a0a8c9;padding:1rem;">今天不是法定节假日或传统节日，祝你拥有美好的一天！</div>';
    return;
  }

  let html = '';
  holidays.forEach(function (h) {
    const typeClass = mapHolidayType(h.type || '其他');
    html += '<span class="holiday-tag ' + typeClass + '" title="' + (h.description || '') + '">' + (h.name || '') + '</span>';
  });
  container.innerHTML = html;
}

function renderNews() {
  const container = document.getElementById('newsList');
  if (!container) return;

  let html = '';
  NEWS_DATA.forEach(function (title, index) {
    html += '<div class="news-item">';
    html += '<span class="news-index">' + (index + 1) + '</span>';
    html += '<span class="news-text">' + title + '</span>';
    html += '</div>';
  });
  container.innerHTML = html;
}

function renderActivities(city) {
  const container = document.getElementById('activityGrid');
  if (!container) return;

  const activities = getActivities(city);

  if (activities.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#a0a8c9;padding:2rem;">暂无 ' + city + ' 的活动信息，不妨去街头走走，发现惊喜。</div>';
    return;
  }

  let html = '';
  activities.forEach(function (a) {
    const typeClass = a.type || '其他';
    html += '<div class="activity-card">';
    html += '<span class="activity-type-badge ' + typeClass + '">' + typeClass + '</span>';
    html += '<div class="activity-name">' + (a.name || '') + '</div>';
    html += '<div class="activity-detail"><i class="far fa-clock"></i> ' + (a.time || '') + '</div>';
    html += '<div class="activity-detail"><i class="fas fa-map-marker-alt"></i> ' + (a.location || '') + '</div>';
    html += '<div class="activity-detail" style="margin-top:0.3rem;color:#d0d4e8;">' + (a.description || '') + '</div>';
    if (a.price) {
      html += '<div class="activity-detail" style="color:#f5d76e;"><i class="fas fa-tag"></i> ' + a.price + '</div>';
    }
    html += '<a class="activity-link" href="' + (a.link || '#') + '" target="_blank">查看详情 <i class="fas fa-external-link-alt"></i></a>';
    html += '</div>';
  });
  container.innerHTML = html;
}

function renderPosterPreview() {
  const container = document.getElementById('posterPreview');
  const titleEl = document.getElementById('polaroidTitle');
  const metaEl = document.getElementById('polaroidMeta');
  const tagsEl = document.getElementById('polaroidTags');
  const fortuneEl = document.getElementById('polaroidFortune');
  const scoresEl = document.getElementById('polaroidScores');
  const luckyEl = document.getElementById('polaroidLucky');
  const blessingEl = document.getElementById('polaroidBlessing');

  if (!currentBirthDate || !titleEl) return;

  const year = currentBirthDate.year;
  const month = currentBirthDate.month;
  const day = currentBirthDate.day;

  // ---- 信息卡 ----
  titleEl.textContent = formatDate(year, month, day);
  metaEl.textContent = getDayOfWeek(year, month, day);

  const zodiac = getZodiac(year);
  const constellation = getConstellation(month, day);
  const generation = getGenerationLabel(year);
  const season = getSeason(month, day);

  let tagsHtml = '';
  tagsHtml += '<span class="polaroid-tag zodiac">' + zodiac + '</span>';
  tagsHtml += '<span class="polaroid-tag constellation">' + constellation + '</span>';
  if (generation) tagsHtml += '<span class="polaroid-tag generation">' + generation + '</span>';
  tagsHtml += '<span class="polaroid-tag season">' + season + '</span>';
  tagsEl.innerHTML = tagsHtml;

  // 信息卡附加内容：农历、生日花、生日石、已活天数、星座性格
  var infoExtraEl = document.getElementById('polaroidInfoExtra');
  if (infoExtraEl) {
    var lunar = getApproxLunarDate(year, month, day);
    var flower = BIRTH_FLOWERS[month - 1] || BIRTH_FLOWERS[0];
    var stone = BIRTH_STONES[month - 1] || '钻石';
    var days = getDaysLived(year, month, day);
    var cInfo = CONSTELLATION_TRAITS[constellation] || { trait: '独特个性', match: '天秤座' };
    var age = new Date().getFullYear() - year;
    var ageText = age > 0 ? (age === 18 ? ' \u00B7 18岁成年礼' : (age === 60 ? ' \u00B7 花甲之年' : (age === 50 ? ' \u00B7 知天命' : ''))) : '';

    var infoHtml = '';
    infoHtml += '<div class="polaroid-info-row">\u{1F4C5} 农历 ' + lunar + ageText + '</div>';
    infoHtml += '<div class="polaroid-info-row">\u{1F33A} 生日花: ' + flower.name + ' (' + flower.meaning + ')</div>';
    infoHtml += '<div class="polaroid-info-row">\u{1F48E} 生日石: ' + stone + '</div>';
    infoHtml += '<div class="polaroid-info-row">\u23F1 生命已走过 <strong>' + days.toLocaleString() + '</strong> 天</div>';
    infoHtml += '<div class="polaroid-info-row polaroid-trait">\u2728 ' + constellation + ': ' + cInfo.trait + '</div>';
    infoExtraEl.innerHTML = infoHtml;
  }

  // ---- 运势计算 ----
  var seed = year * 10000 + month * 100 + day;
  function seededRandom(s) {
    var x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  }

  var fortuneLevels = ['大吉', '中吉', '小吉'];
  var fortuneIdx = Math.floor(seededRandom(seed) * 3);
  var fortuneLevel = fortuneLevels[fortuneIdx];

  if (fortuneEl) {
    fortuneEl.innerHTML = '今日运势 <span class="fortune-badge">' + fortuneLevel + '</span>';
  }

  // 五维评分
  var dimensions = ['爱情', '事业', '财运', '健康', '学业'];
  var starsHtml = '';
  dimensions.forEach(function (dim, i) {
    var s = Math.floor(seededRandom(seed + i * 7) * 3) + 3;
    var filledStars = '\u2605'.repeat(s) + '\u2606'.repeat(5 - s);
    starsHtml += '<div class="polaroid-score-item">';
    starsHtml += '<span class="polaroid-score-label">' + dim + '</span>';
    starsHtml += '<span class="polaroid-score-stars">' + filledStars + '</span>';
    starsHtml += '</div>';
  });
  if (scoresEl) scoresEl.innerHTML = starsHtml;

  // ---- 幸运指南 ----
  var luckyColors = ['红色', '橙色', '金色', '粉色', '紫色', '蓝色', '绿色', '白色', '珊瑚色', '薄荷绿', '鹅黄', '雾蓝'];
  var luckyNumbers = [1, 3, 5, 7, 8, 9, 13, 15, 21, 23, 28, 33, 52, 66, 88, 99];
  var luckyDirections = ['正东', '正南', '正西', '正北', '东南', '东北', '西南', '西北'];
  var luckyFoods = ['抹茶蛋糕', '草莓冰淇淋', '巧克力慕斯', '芒果班戟', '桂花糕', '红豆奶茶', '焦糖布丁', '蓝莓马芬'];
  var luckyHours = ['7:00-9:00', '9:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00', '19:00-21:00', '21:00-23:00'];
  var luckyFlowers = ['向日葵', '薰衣草', '满天星', '百合', '郁金香', '康乃馨', '樱花', '茉莉'];
  var luckyTips = [
    '今天适合主动联系老朋友，会有意外惊喜',
    '出门时留意身边的美好事物，灵感会不期而至',
    '试试换一条路线回家，可能有新发现',
    '今天穿暖色调衣服会提升整体运势',
    '晚上早点休息，好梦会带来好运气',
    '给自己一个小小的奖励，你值得被宠爱',
    '今天适合做决定，直觉格外敏锐',
    '不妨许一个小愿望，今天很容易实现'
  ];

  var colorIdx = Math.floor(seededRandom(seed + 100) * luckyColors.length);
  var num1 = luckyNumbers[Math.floor(seededRandom(seed + 200) * luckyNumbers.length)];
  var num2 = luckyNumbers[Math.floor(seededRandom(seed + 201) * luckyNumbers.length)];
  var dirIdx = Math.floor(seededRandom(seed + 300) * luckyDirections.length);
  var foodIdx = Math.floor(seededRandom(seed + 400) * luckyFoods.length);
  var hourIdx = Math.floor(seededRandom(seed + 500) * luckyHours.length);
  var flowerIdx = Math.floor(seededRandom(seed + 600) * luckyFlowers.length);
  var tipIdx = Math.floor(seededRandom(seed + 700) * luckyTips.length);
  var cInfo2 = CONSTELLATION_TRAITS[constellation] || { match: '天秤座' };

  var luckyHtml = '';
  luckyHtml += '<div class="polaroid-lucky-item">\u{1F3A8} 幸运色 <span>' + luckyColors[colorIdx] + '</span></div>';
  luckyHtml += '<div class="polaroid-lucky-item">\u{1F522} 幸运数 <span>' + num1 + ' \u00B7 ' + num2 + '</span></div>';
  luckyHtml += '<div class="polaroid-lucky-item">\u{1F9ED} 方位 <span>' + luckyDirections[dirIdx] + '</span></div>';
  luckyHtml += '<div class="polaroid-lucky-item">\u23F0 吉时 <span>' + luckyHours[hourIdx] + '</span></div>';
  luckyHtml += '<div class="polaroid-lucky-item">\u{1F35C} 美食 <span>' + luckyFoods[foodIdx] + '</span></div>';
  luckyHtml += '<div class="polaroid-lucky-item">\u{1F490} 幸运花 <span>' + luckyFlowers[flowerIdx] + '</span></div>';
  luckyHtml += '<div class="polaroid-lucky-item">\u{1F49D} 速配 <span>' + cInfo2.match + '</span></div>';
  luckyHtml += '<div class="polaroid-lucky-tip">\u{1F4A1} ' + luckyTips[tipIdx] + '</div>';
  if (luckyEl) luckyEl.innerHTML = luckyHtml;

  // ---- 祝福卡 ----
  var blessings = [
    '愿你此生尽兴，赤诚善良，愿时光能缓，故人不散。',
    '生活明朗，万物可爱，未来可期，人间值得。',
    '愿你出走半生，归来仍是少年。',
    '愿你眼里有光，心中有爱，活成自己想要的模样。',
    '愿你所求皆如愿，所行化坦途，多喜乐，长安宁。',
    '生日快乐，愿你所有的心愿都如约而至。',
    '岁岁常欢愉，年年皆胜意。',
    '愿新的一岁，仍有阳光满路，温暖如初。',
    '愿你的每一个今天都如生日般闪耀。',
    '星光不问赶路人，时光不负有心人，生日快乐！'
  ];
  var blessing = blessings[Math.floor(seededRandom(seed + 999) * blessings.length)];
  if (blessingEl) blessingEl.textContent = '\u201c' + blessing + '\u201d';

  if (container) container.classList.add('active');

  // 确保海报区域父元素可见（避免 fade-in-section opacity:0 导致海报空白）
  var posterSection = document.querySelector('.poster-section');
  if (posterSection) posterSection.classList.add('visible');
}

// ==================== 6. 事件处理 ====================

function exploreBirthday() {
  const yearSelect = document.getElementById('birthYear');
  const monthSelect = document.getElementById('birthMonth');
  const daySelect = document.getElementById('birthDay');
  if (!yearSelect || !monthSelect || !daySelect) return;

  const year = parseInt(yearSelect.value, 10);
  const month = parseInt(monthSelect.value, 10);
  const day = parseInt(daySelect.value, 10);

  if (!year || !month || !day) {
    alert('请选择完整的出生日期');
    return;
  }

  currentBirthDate = { year: year, month: month, day: day };

  // 隐藏首页，显示结果页
  const homePage = document.getElementById('homePage');
  const resultPage = document.getElementById('resultPage');

  if (homePage) homePage.classList.add('hidden');
  if (resultPage) {
    resultPage.classList.add('active');
    resultPage.scrollTop = 0;
  }

  // ===== 方案B：内置数据兜底（立即展示）=====
  renderTimeCard(year, month, day);
  renderTimeline(month, day);
  renderCelebrities(month, day);
  renderHolidays(month, day);
  renderNews();

  const citySelect = document.getElementById('citySelect');
  const city = citySelect ? citySelect.value : '上海';
  renderActivities(city);

  // 自动渲染海报预览
  renderPosterPreview();

  // 滚动渐显
  setupScrollReveal();

  // ===== 方案A：API补充（异步加载更丰富的数据）=====
  fetchAndEnrichHistory(month, day);
}

// ============ 方案A：百度百科API补充 ============
function fetchAndEnrichHistory(month, day) {
  var mm = String(month).padStart(2, '0');
  var dd = String(day).padStart(2, '0');
  var apiUrl = 'https://baike.baidu.com/cms/home/eventsOnHistory/' + mm + '.json';

  // 尝试跨域调用（浏览器可能拦截，失败则静默）
  var script = document.createElement('script');
  script.src = apiUrl;
  script.onerror = function () {
    // 跨域失败，静默使用内置数据
    document.head.removeChild(script);
  };

  // 尝试直接fetch（部分浏览器/扩展可能允许）
  if (typeof fetch !== 'undefined') {
    fetch(apiUrl, { method: 'GET', mode: 'no-cors', cache: 'no-cache' })
      .then(function (res) {
        // no-cors 模式下无法读取响应体，需要其他方案
        // 这里标记为需要补充：使用备用数据源
      })
      .catch(function () {
        // fetch失败，静默使用内置数据
      });
  }

  // 备用方案：使用 JSONP 风格的代理或本地扩展
  // 由于CORS限制，在纯前端环境下最安全的方式是内置数据兜底
  // 如果用户有代理插件，尝试解析全局变量
  window.__baiduHistoryCallback = function (data) {
    parseBaiduHistory(data, month, day);
    delete window.__baiduHistoryCallback;
  };
}

function parseBaiduHistory(rawData, month, day) {
  if (!rawData || typeof rawData !== 'object') return;
  var mm = String(month).padStart(2, '0');
  var dd = String(day).padStart(2, '0');
  var key = mm;
  var dayList = rawData[key];
  if (!dayList || !Array.isArray(dayList)) return;

  // 找到当天的事件
  var events = [];
  var births = [];
  var deaths = [];
  var holidays = [];

  dayList.forEach(function (item) {
    if (!item || item.day !== dd) return;

    // 分类：大事记/出生/逝世/节假日
    var type = (item.type || '').trim();
    var title = (item.title || '').trim();
    var year = parseInt(item.year, 10);
    var desc = (item.desc || item.title || '').trim();

    if (type === '出生') {
      births.push({ name: title, year: year || '', identity: '历史人物', description: desc });
    } else if (type === '逝世') {
      deaths.push({ name: title, year: year || '', identity: '历史人物', description: desc });
    } else if (type === '节假日') {
      holidays.push({ name: title, type: '纪念日', description: desc });
    } else {
      // 大事记
      var cat = guessCategory(title + desc);
      events.push({ year: year || 0, event: title, region: 'world', category: cat });
    }
  });

  // 如果有API数据，追加/替换到对应模块
  if (events.length > 0) {
    appendToTimeline(events);
  }
  if (births.length > 0 || deaths.length > 0) {
    appendToCelebrities(births, deaths);
  }
  if (holidays.length > 0) {
    appendToHolidays(holidays);
  }
}

function guessCategory(text) {
  text = text.toLowerCase();
  if (/战争|战役|战斗|解放|抗日|革命|起义|独立|统一/.test(text)) return '战争';
  if (/发明|发现|卫星|航天|飞行|核|电脑|网络|芯片|发射/.test(text)) return '科技';
  if (/总统|选举|成立|宪法|条约|协议|政府|国会|议会/.test(text)) return '政治';
  if (/奥运会|世界杯|冠军|金牌|足球|篮球|比赛|运动/.test(text)) return '体育';
  if (/电影|音乐|绘画|文学|小说|诗歌|艺术|作家|画家|雕塑/.test(text)) return '文化';
  if (/股市|银行|货币|经济|贸易|关税|破产|并购|GDP|通胀/.test(text)) return '经济';
  if (/地震|海啸|洪水|干旱|台风|疫情|瘟疫|灾难|事故/.test(text)) return '社会';
  return '其他';
}

// 追加事件到时间线（不替换，追加显示）
function appendToTimeline(newEvents) {
  var container = document.getElementById('timeline');
  if (!container) return;

  // 获取已存在的事件年份，避免重复
  var existingYears = {};
  container.querySelectorAll('.timeline-year').forEach(function (el) {
    var text = el.textContent || '';
    var yearMatch = text.match(/(\d+)/);
    if (yearMatch) existingYears[yearMatch[1]] = true;
  });

  var html = container.innerHTML;
  // 去掉空状态消息
  if (html.indexOf('这一天在历史长河中静悄悄') !== -1) {
    html = '';
  }

  newEvents.forEach(function (e, index) {
    var yearStr = String(e.year);
    if (existingYears[yearStr]) return; // 跳过重复
    existingYears[yearStr] = true;

    var catClass = mapEventCategory(e.category || '其他');
    var regionLabel = e.region === 'china' ? '中国' : '世界';
    html += '<div class="timeline-item api-event" style="opacity:0;transform:translateY(30px);transition:all 0.6s;">';
    html += '<div class="timeline-dot"></div>';
    html += '<div class="timeline-content">';
    html += '<div class="timeline-year">' + (e.year < 0 ? '前' + Math.abs(e.year) + '年' : e.year + '年') + ' \u00B7 ' + regionLabel + ' <span style="font-size:10px;color:#f5d76e;background:rgba(245,215,110,0.15);padding:1px 6px;border-radius:4px;margin-left:4px;">\u8865\u5145</span></div>';
    html += '<div class="timeline-event">' + (e.event || '') + '</div>';
    html += '<span class="timeline-category ' + catClass + '">' + (e.category || '其他') + '</span>';
    html += '</div></div>';
  });

  container.innerHTML = html;

  // 触发动画
  setTimeout(function () {
    container.querySelectorAll('.api-event').forEach(function (item, i) {
      setTimeout(function () {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, i * 100);
    });
  }, 50);
}

// 追加名人到网格
function appendToCelebrities(newBirths, newDeaths) {
  var container = document.getElementById('celebrityGrid');
  if (!container) return;

  // 获取已存在的名字
  var existingNames = {};
  container.querySelectorAll('.celebrity-name').forEach(function (el) {
    existingNames[el.textContent.trim()] = true;
  });

  var html = container.innerHTML;
  // 去掉空状态消息
  if (html.indexOf('暂无名人记录') !== -1) {
    html = '';
  }

  if (newBirths) {
    newBirths.forEach(function (c) {
      if (existingNames[(c.name || '').trim()]) return;
      var initial = c.name ? c.name.charAt(0) : '?';
      html += '<div class="celebrity-card api-celeb" style="opacity:0;transform:translateY(20px);transition:all 0.5s;">';
      html += '<div class="celebrity-avatar">' + initial + '</div>';
      html += '<div class="celebrity-name">' + (c.name || '未知') + '</div>';
      html += '<div class="celebrity-year">' + (c.year || '') + '年生</div>';
      html += '<div class="celebrity-identity">' + (c.identity || '') + '</div>';
      html += '<div class="celebrity-desc">' + (c.description || '') + '</div>';
      html += '</div>';
    });
  }

  if (newDeaths) {
    newDeaths.forEach(function (c) {
      if (existingNames[(c.name || '').trim()]) return;
      var initial = c.name ? c.name.charAt(0) : '?';
      html += '<div class="celebrity-card api-celeb" style="opacity:0;transform:translateY(20px);transition:all 0.5s;">';
      html += '<div class="celebrity-avatar" style="background:linear-gradient(135deg,#999,#666);">' + initial + '</div>';
      html += '<div class="celebrity-name">' + (c.name || '未知') + '</div>';
      html += '<div class="celebrity-year">' + (c.year || '') + '年逝世</div>';
      html += '<div class="celebrity-identity">' + (c.identity || '') + '</div>';
      html += '<div class="celebrity-desc">' + (c.description || '') + '</div>';
      html += '</div>';
    });
  }

  container.innerHTML = html;

  setTimeout(function () {
    container.querySelectorAll('.api-celeb').forEach(function (item, i) {
      setTimeout(function () {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, i * 80);
    });
  }, 50);
}

// 追加节日到标签云
function appendToHolidays(newHolidays) {
  var container = document.getElementById('holidayTags');
  if (!container) return;

  var existingNames = {};
  container.querySelectorAll('.holiday-tag').forEach(function (el) {
    existingNames[el.textContent.trim()] = true;
  });

  var html = container.innerHTML;
  if (html.indexOf('今天不是法定节假日') !== -1) {
    html = '';
  }

  newHolidays.forEach(function (h) {
    if (existingNames[(h.name || '').trim()]) return;
    var typeClass = mapHolidayType(h.type || '其他');
    html += '<span class="holiday-tag ' + typeClass + '" title="' + (h.description || '') + '">' + (h.name || '') + '</span>';
  });

  container.innerHTML = html;
}

function goBack() {
  const homePage = document.getElementById('homePage');
  const resultPage = document.getElementById('resultPage');

  if (homePage) homePage.classList.remove('hidden');
  if (resultPage) resultPage.classList.remove('active');

  // 重置海报预览
  const posterPreview = document.getElementById('posterPreview');
  if (posterPreview) posterPreview.classList.remove('active');
}

function changeCity() {
  const citySelect = document.getElementById('citySelect');
  if (!citySelect) return;
  const city = citySelect.value;
  renderActivities(city);
}

function generatePoster() {
  if (!currentBirthDate) {
    alert('请先生成生日报告');
    return;
  }

  renderPosterPreview();

  const posterContainer = document.getElementById('posterContainer');
  if (!posterContainer) {
    alert('海报容器未找到');
    return;
  }

  if (typeof html2canvas === 'undefined') {
    alert('海报生成库正在加载中，请稍后再试');
    return;
  }

  html2canvas(posterContainer, {
    backgroundColor: '#f5f0e8',
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false
  }).then(function (canvas) {
    const link = document.createElement('a');
    link.download = '生日纪_' + currentBirthDate.year + currentBirthDate.month + currentBirthDate.day + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(function (err) {
    console.error('海报生成失败:', err);
    alert('海报生成失败，请尝试手动截图保存');
  });
}

// ==================== 7. 辅助功能 ====================

function createStars() {
  const container = document.getElementById('stars');
  if (!container) return;

  container.innerHTML = '';
  const count = 80;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    const size = Math.random() * 2.5 + 0.5;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.setProperty('--delay', (Math.random() * 5) + 's');
    star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
    container.appendChild(star);
  }

  // 添加流星
  for (let i = 0; i < 2; i++) {
    const shooting = document.createElement('div');
    shooting.className = 'shooting-star';
    shooting.style.top = (Math.random() * 30) + '%';
    shooting.style.left = (50 + Math.random() * 50) + '%';
    shooting.style.animationDelay = (i * 7 + Math.random() * 5) + 's';
    container.appendChild(shooting);
  }
}

// ==================== 7. 日期选择器初始化 ====================

function initDatePickers() {
  const yearSelect = document.getElementById('birthYear');
  const monthSelect = document.getElementById('birthMonth');
  const daySelect = document.getElementById('birthDay');
  if (!yearSelect || !monthSelect || !daySelect) return;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  // 年份：1940 ~ 当前年份
  let yearHtml = '';
  for (let y = currentYear; y >= 1940; y--) {
    const selected = y === currentYear ? ' selected' : '';
    yearHtml += '<option value="' + y + '"' + selected + '>' + y + '</option>';
  }
  yearSelect.innerHTML = yearHtml;

  // 月份：1-12
  let monthHtml = '';
  for (let m = 1; m <= 12; m++) {
    const selected = m === currentMonth ? ' selected' : '';
    monthHtml += '<option value="' + m + '"' + selected + '>' + m + '</option>';
  }
  monthSelect.innerHTML = monthHtml;

  // 日期：1-31
  let dayHtml = '';
  for (let d = 1; d <= 31; d++) {
    const selected = d === currentDay ? ' selected' : '';
    dayHtml += '<option value="' + d + '"' + selected + '>' + d + '</option>';
  }
  daySelect.innerHTML = dayHtml;

  // 月/年变化时更新日期天数
  monthSelect.addEventListener('change', function () { updateDays(); });
  yearSelect.addEventListener('change', function () { updateDays(); });
}

function updateDays() {
  const yearSelect = document.getElementById('birthYear');
  const monthSelect = document.getElementById('birthMonth');
  const daySelect = document.getElementById('birthDay');
  if (!yearSelect || !monthSelect || !daySelect) return;

  const year = parseInt(yearSelect.value, 10);
  const month = parseInt(monthSelect.value, 10);
  const currentDay = parseInt(daySelect.value, 10);
  const maxDay = new Date(year, month, 0).getDate();

  let dayHtml = '';
  for (let d = 1; d <= maxDay; d++) {
    const selected = d === Math.min(currentDay, maxDay) ? ' selected' : '';
    dayHtml += '<option value="' + d + '"' + selected + '>' + d + '</option>';
  }
  daySelect.innerHTML = dayHtml;
}

// ==================== 8. 事件处理与初始化 ====================

function setupEventListeners() {
  const exploreBtn = document.getElementById('exploreBtn');
  if (exploreBtn) {
    exploreBtn.addEventListener('click', exploreBirthday);
  }

  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', goBack);
  }

  const citySelect = document.getElementById('citySelect');
  if (citySelect) {
    citySelect.addEventListener('change', changeCity);
  }

  const generateBtn = document.getElementById('generateBtn');
  if (generateBtn) {
    generateBtn.addEventListener('click', generatePoster);
  }

  initDatePickers();
}

function setupScrollReveal() {
  const sections = document.querySelectorAll('.fade-in-section');
  if (!sections.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  });

  sections.forEach(function (section) {
    observer.observe(section);
  });
}

// ==================== 8. 初始化 ====================

document.addEventListener('DOMContentLoaded', function () {
  createStars();
  setupEventListeners();
});
