/**
 * 热点圈 HTML Demo - 应用逻辑
 * 移植自 Flutter hot_app，使用 vanilla JS 复刻 Provider 状态管理模式
 */

// ============ 工具函数（对应 core/utils/） ============
const GeoUtils = {
  distanceInKm(lat1, lon1, lat2, lon2) {
    const r = 6371.0;
    const toRad = (d) => (d * Math.PI) / 180.0;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },
};

const FormatUtils = {
  formatHeat(h) {
    if (h >= 10000) return (h / 10000).toFixed(1) + '万';
    if (h >= 1000) return (h / 1000).toFixed(1) + 'K';
    return Math.floor(h).toString();
  },
  formatCount(c) {
    if (c >= 10000) return (c / 10000).toFixed(1) + '万';
    if (c >= 1000) return (c / 1000).toFixed(1) + 'K';
    return c.toString();
  },
};

const TimeUtils = {
  determineStatus(startTime, endTime, lastVideoTime, isPermanent) {
    if (isPermanent) return 'permanent';
    const now = Date.now();
    if (lastVideoTime && now - lastVideoTime < 60 * 60 * 1000) return 'ongoing';
    if (startTime && now < startTime) return 'impending';
    if (endTime && now > endTime) {
      if ((now - endTime) / (1000 * 60 * 60) <= 12) return 'justEnded';
    }
    return 'ongoing';
  },
  formatTimeRemaining(target) {
    const diff = target - Date.now();
    if (diff < 0) return '即将开始';
    const days = Math.floor(diff / 86400000);
    if (days > 0) {
      const d = new Date(target);
      if (days === 1 && d.getDate() === new Date().getDate() + 1) {
        return `明天${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      }
      return `${days}天后`;
    }
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours}小时后`;
    const mins = Math.floor(diff / 60000);
    if (mins > 0) return `${mins}分钟后`;
    return '即将开始';
  },
  formatRelativeTime(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    return `${Math.floor(diff / 2592000000)}个月前`;
  },
};

// ============ 日期工具（行程页专用） ============
const DateUtils = {
  pad(n) { return String(n).padStart(2, '0'); },
  toDateStr(d) {
    return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`;
  },
  parseDateStr(s) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  },
  addDays(n) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return d;
  },
  todayStr() { return this.toDateStr(new Date()); },
  diffDays(a, b) {
    const da = this.parseDateStr(a);
    const db = this.parseDateStr(b);
    return Math.round((db - da) / 86400000);
  },
  weekLabel(d) {
    return ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
  },
  friendlyDate(s) {
    const d = this.parseDateStr(s);
    const diff = this.diffDays(this.todayStr(), s);
    if (diff === 0) return '今天';
    if (diff === 1) return '明天';
    if (diff === 2) return '后天';
    if (diff === -1) return '昨天';
    return `${d.getMonth() + 1}月${d.getDate()}日 周${this.weekLabel(d)}`;
  },
};

// 出行方式定义（含图标、速度 km/h）
const TRAVEL_MODES = {
  walk:    { icon: '🚶', label: '步行', speed: 5 },
  bike:    { icon: '🚲', label: '骑行', speed: 15 },
  car:     { icon: '🚗', label: '驾车', speed: 30 },
  transit: { icon: '🚌', label: '公交', speed: 20 },
  metro:   { icon: '🚇', label: '地铁', speed: 35 },
};

// 根据距离自动推荐出行方式
function suggestMode(distKm) {
  if (distKm < 1) return 'walk';
  if (distKm < 3) return 'bike';
  if (distKm < 8) return 'metro';
  if (distKm < 20) return 'transit';
  return 'car';
}

// ============ Mock 数据（对应 feed_provider.dart / map_provider.dart） ============
const now = Date.now();
const HOUR = 3600000;
const DAY = 86400000;

const EVENT_TYPES = { sporadic: '偶发性', regular: '规律性', permanent: '常驻' };

// 生成事件相关背景图（竖屏 16:9 适配视频流）
function img(prompt, size = 'portrait_16_9') {
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;
}

const events = [
  {
    id: 'mock_2',
    name: '🍜 网红夜市排档·深夜美食节',
    description: '上百摊位排队中 · 现场直播',
    lat: 30.241, lon: 120.218,
    address: '西湖文化广场B1层',
    startTime: null, endTime: null,
    type: 'regular',
    heat: 12400, heatSpeed: 120,
    videoCount: 8, likeCount: 4500, commentCount: 1800, shareCount: 620, boostCount: 1200,
    createdAt: now - 2 * HOUR,
    isPromoted: false,
    // 每日固定营业时段
    dailyHours: { start: '18:00', end: '23:00' },
    image: img('bustling asian night market food stalls, steam rising from woks, red lanterns glowing, neon signs, warm ambient lighting, crowded alley, people walking, photorealistic, cinematic'),
  },
  {
    id: 'mock_5',
    name: '🏀 CBA季后赛·浙江队主场',
    description: '体育馆内座无虚席 · 火热进行中',
    lat: 30.245, lon: 120.210,
    address: '黄龙体育中心',
    startTime: null, endTime: null,
    type: 'sporadic',
    heat: 15200, heatSpeed: 200,
    videoCount: 12, likeCount: 5800, commentCount: 2400, shareCount: 890, boostCount: 2100,
    createdAt: now - 30 * 60000,
    isPromoted: false,
    // 比赛日固定时段
    eventHours: { start: '19:30', end: '22:00' },
    ticketRequired: true,
    ticketOptions: [
      { id: 'vip',    name: 'VIP内场席',  price: 1280, desc: '前排近距离观赛' },
      { id: 'a',      name: 'A类看台',    price: 680,  desc: '中线位置视野佳' },
      { id: 'b',      name: 'B类看台',    price: 380,  desc: '球门后方' },
      { id: 'c',      name: 'C类看台',    price: 180,  desc: '上层远观区' },
    ],
    image: img('basketball game indoor arena, players in action on court, crowded cheering stands, dramatic sports lighting, motion blur, photorealistic, cinematic'),
  },
  {
    id: 'mock_1',
    name: '🎵 周杰伦巡回演唱会·杭州站',
    description: '粉丝在场馆外集结 · 气氛热烈',
    lat: 30.235, lon: 120.225,
    address: '奥体中心体育馆',
    startTime: now + (DAY + 19 * HOUR + 30 * 60000),
    endTime: now + (DAY + 22 * HOUR),
    type: 'sporadic',
    heat: 9800, heatSpeed: 0,
    videoCount: 3, likeCount: 2100, commentCount: 520, shareCount: 340, boostCount: 720,
    createdAt: now - 6 * HOUR,
    isPromoted: false,
    ticketRequired: true,
    ticketOptions: [
      { id: 'vip',   name: 'VIP内场',     price: 2080, desc: '内场前排 赠周边' },
      { id: 'rock',  name: '摇滚区',      price: 1580, desc: '站立区 气氛最燃' },
      { id: 'a',     name: 'A区看台',     price: 980,  desc: '正面看台' },
      { id: 'b',     name: 'B区看台',     price: 580,  desc: '侧面看台' },
      { id: 'c',     name: 'C区看台',     price: 380,  desc: '山顶远观' },
    ],
    image: img('rock concert stage performance, singer silhouette holding microphone, colorful stage spotlights, raised hands crowd, atmospheric haze, dramatic lighting, photorealistic, cinematic'),
  },
  {
    id: 'mock_3',
    name: '✨ 城市灯光秀·西湖音乐喷泉',
    description: '今晚最后一场 · 错过等明天',
    lat: 30.252, lon: 120.168,
    address: '市民中心广场',
    startTime: new Date().setHours(18, 0, 0, 0),
    endTime: new Date().setHours(20, 0, 0, 0),
    type: 'sporadic',
    heat: 8100, heatSpeed: 45,
    videoCount: 5, likeCount: 1800, commentCount: 430, shareCount: 280, boostCount: 510,
    createdAt: now - 4 * HOUR,
    isPromoted: false,
    image: img('city light show at night, illuminated modern skyscrapers, colorful led projections on buildings, water fountain show, reflections on lake, dramatic sky, photorealistic, cinematic'),
  },
  {
    id: 'mock_4',
    name: '☕ 西湖落日露台咖啡馆',
    description: '龙井路18号 · 网红打卡圣地',
    lat: 30.230, lon: 120.145,
    address: '龙井路18号3楼',
    startTime: null, endTime: null,
    type: 'permanent',
    heat: 6500, heatSpeed: 10,
    videoCount: 6, likeCount: 1200, commentCount: 310, shareCount: 180, boostCount: 350,
    createdAt: now - 7 * DAY,
    isPromoted: true,
    image: img('cozy modern cafe interior, warm wooden furniture, latte art coffee on table, hanging green plants, soft golden hour natural light through window, photorealistic, cinematic'),
  },
  {
    id: 'mock_6',
    name: '🎪 周末文创市集·设计师快闪',
    description: '40+独立品牌摊位 · 仅限本周末',
    lat: 30.255, lon: 120.175,
    address: '湖滨银泰in77户外广场',
    startTime: now + (2 * DAY + 10 * HOUR),
    endTime: now + (2 * DAY + 21 * HOUR),
    type: 'sporadic',
    heat: 4200, heatSpeed: 0,
    videoCount: 2, likeCount: 680, commentCount: 180, shareCount: 95, boostCount: 140,
    createdAt: now - 12 * HOUR,
    isPromoted: false,
    image: img('outdoor creative craft market, handmade goods stalls, bohemian decorations, people browsing, warm afternoon sunlight, string lights, photorealistic, cinematic'),
  },
];

// 爆发状态（对应 heat_provider.dart 初始值）
const burstingIds = new Set(['mock_2', 'mock_5']);

// 焦点列表（对应 feed_page.dart _showFocusSheet）
const focusOptions = [
  { name: '📍 当前位置', lat: 30.26, lon: 120.18 },
  { name: '🏙️ 上海·外滩', lat: 31.24, lon: 121.49 },
  { name: '🌆 北京·三里屯', lat: 39.93, lon: 116.45 },
  { name: '🏖️ 三亚·海棠湾', lat: 18.31, lon: 109.73 },
];

// 发布者数据池（视频级，每个视频对应一个发布者）
const PUBLISHERS = [
  { id: 'u1', name: '城市猎手', avatar: '🦊' },
  { id: 'u2', name: '美食探店王', avatar: '👨‍🍳' },
  { id: 'u3', name: '现场直击', avatar: '📸' },
  { id: 'u4', name: '夜生活达人', avatar: '🦉' },
  { id: 'u5', name: '运动狂热', avatar: '🏀' },
  { id: 'u6', name: '文艺青年', avatar: '🎨' },
  { id: 'u7', name: '街拍小哥', avatar: '📷' },
  { id: 'u8', name: '潮流前线', avatar: '🎭' },
];
// 已关注列表（预设关注 u3）
const followedPublishers = new Set(['u3']);

// 根据事件索引和视频索引获取发布者
function getPublisher(eventIndex, videoIndex) {
  return PUBLISHERS[(eventIndex * 3 + videoIndex) % PUBLISHERS.length];
}

// 抖音风格分享箭头 SVG（向右箭头 + 左侧三条短横线）
const SHARE_ARROW_SVG = `<svg class="share-arrow" viewBox="0 0 48 48" width="28" height="28" fill="none">
  <path d="M28 8 L42 24 L28 40 L28 32 L12 32 L12 16 L28 16 Z" fill="#fff"/>
  <rect x="4"  y="18" width="5" height="12" rx="2" fill="#fff"/>
</svg>`;

// 热度天花板（用于柱形条填充比例）
const HEAT_CEILING = 20000;

// ============ 行程数据（独立于"想去"，更结构化） ============
// visitTime 非 null 表示已打卡（模拟"用户当天去过自动打卡"）
const trips = [
  // 今天：夜市已打卡（模拟用户当天 19:20 到达）
  { id: 't1', eventId: 'mock_2', date: DateUtils.todayStr(), startH: 19, endH: 22, mode: 'walk',    visitH: 19 },
  // 今天：灯光秀待打卡
  { id: 't2', eventId: 'mock_3', date: DateUtils.todayStr(), startH: 18, endH: 20, mode: 'metro',   visitH: null },
  // 明天
  { id: 't3', eventId: 'mock_1', date: DateUtils.toDateStr(DateUtils.addDays(1)), startH: 19, endH: 22, mode: 'metro',   visitH: null, purchasedTicket: null },
  // 后天
  { id: 't4', eventId: 'mock_6', date: DateUtils.toDateStr(DateUtils.addDays(2)), startH: 10, endH: 21, mode: 'car',     visitH: null, purchasedTicket: null },
  // 大后天
  { id: 't5', eventId: 'mock_4', date: DateUtils.toDateStr(DateUtils.addDays(3)), startH: 14, endH: 17, mode: 'bike',    visitH: null, purchasedTicket: null },
  // 5 天后（超出快捷条范围，需用日历查看）
  { id: 't6', eventId: 'mock_5', date: DateUtils.toDateStr(DateUtils.addDays(5)), startH: 19, endH: 22, mode: 'transit', visitH: null, purchasedTicket: null },
];

// ============ 足迹数据（打卡记录，含用户上传的内容） ============
// content: null 表示未上传；{type, text} 表示上传过视频/图文
const footprints = [
  // 今天
  { id: 'f1', eventId: 'mock_2', date: DateUtils.todayStr(), visitH: 19,
    content: { type: 'video', text: '夜市现场太热闹了！排队半小时终于吃到了传说中的臭豆腐 🤤', duration: 23 } },
  // 3 天前
  { id: 'f2', eventId: 'mock_4', date: DateUtils.toDateStr(DateUtils.addDays(-3)), visitH: 15,
    content: { type: 'image', text: '西湖落日绝美，露台咖啡馆视角无敌，推荐 4-5 点来 ☕🌅' } },
  // 7 天前
  { id: 'f3', eventId: 'mock_3', date: DateUtils.toDateStr(DateUtils.addDays(-7)), visitH: 19,
    content: null },
  // 12 天前
  { id: 'f4', eventId: 'mock_5', date: DateUtils.toDateStr(DateUtils.addDays(-12)), visitH: 20,
    content: { type: 'video', text: 'CBA 现场气氛炸裂！最后三秒绝杀，全场沸腾 🏀🔥', duration: 45 } },
  // 18 天前
  { id: 'f5', eventId: 'mock_2', date: DateUtils.toDateStr(DateUtils.addDays(-18)), visitH: 21,
    content: null },
  // 25 天前
  { id: 'f6', eventId: 'mock_6', date: DateUtils.toDateStr(DateUtils.addDays(-25)), visitH: 14,
    content: { type: 'image', text: '周末文创市集淘到宝了，独立设计师的手作耳环超喜欢 🎪✨' } },
  // 45 天前（3个月 tab 可见）
  { id: 'f7', eventId: 'mock_4', date: DateUtils.toDateStr(DateUtils.addDays(-45)), visitH: 16,
    content: null },
  // 80 天前
  { id: 'f8', eventId: 'mock_3', date: DateUtils.toDateStr(DateUtils.addDays(-80)), visitH: 19,
    content: { type: 'video', text: '灯光秀配合音乐喷泉太震撼，拍了完整一段 ✨', duration: 60 } },
  // 120 天前（全部 tab 可见）
  { id: 'f9', eventId: 'mock_5', date: DateUtils.toDateStr(DateUtils.addDays(-120)), visitH: 21,
    content: null },
];

// 足迹动画节点位置（百分比，按时间顺序排列成蜿蜒路径）
const FP_NODE_POSITIONS = [
  { x: 12, y: 78 },
  { x: 30, y: 45 },
  { x: 50, y: 28 },
  { x: 70, y: 52 },
  { x: 88, y: 30 },
];

// ============ 全局状态（对应 providers/） ============
const state = {
  currentTab: 'feed',
  focus: { name: '📍 当前位置', lat: 30.26, lon: 120.18 },
  wantToGo: new Set(),
  currentEventIndex: 0,
  currentVideoIndices: {},
  currentTripDate: DateUtils.todayStr(), // 行程页选中的日期
  calendarViewMonth: new Date(),          // 日历弹层当前查看月份
  miniMapCollapsed: false,
  footprintRange: 30,                     // 足迹弹层查看范围（天数）
};

// ============ DOM 引用 ============
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const feedVertical = $('#feed-vertical');
const mapMarkers = $('#map-markers');
const mapList = $('#map-list');
const profileBody = $('#profile-body');
const toastEl = $('#toast');
const tripList = $('#trip-list');
const calendarBar = $('#calendar-bar');
const tripDateTitle = $('#trip-date-title');
const tmmCanvas = $('#tmm-canvas');
const tmmSummary = $('#tmm-summary');
const calendarGrid = $('#calendar-grid');
const calTitle = $('#cal-title');
const footprintModalList = $('#footprint-modal-list');
const contentSheet = $('#content-sheet');
const ticketSheet = $('#ticket-sheet');
const paySheet = $('#pay-sheet');

// ============ Toast ============
let toastTimer = null;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1200);
}

// ============ 时间状态标签（对应 feed_page.dart） ============
// 将时间戳转为 HH:MM 字符串
function tsToHM(ts) {
  const d = new Date(ts);
  return `${DateUtils.pad(d.getHours())}:${DateUtils.pad(d.getMinutes())}`;
}

// 详细时间显示：包含日期 + 时段
function getTimeLabel(ev) {
  const isPermanent = ev.type === 'permanent';

  // 1. 常驻（咖啡馆）
  if (isPermanent) {
    return { text: '📍 常驻', cls: 'time-end' };
  }

  // 2. 每日固定时段（夜市）
  if (ev.dailyHours) {
    const now = new Date();
    const curHM = `${DateUtils.pad(now.getHours())}:${DateUtils.pad(now.getMinutes())}`;
    const inRange = curHM >= ev.dailyHours.start && curHM <= ev.dailyHours.end;
    return {
      text: `📅 每日 ${ev.dailyHours.start}-${ev.dailyHours.end} ${inRange ? '· 🔴 营业中' : '· 待营业'}`,
      cls: inRange ? 'time-live' : 'time-soon',
    };
  }

  // 3. 比赛日固定时段（CBA）
  if (ev.eventHours) {
    const now = new Date();
    const curHM = `${DateUtils.pad(now.getHours())}:${DateUtils.pad(now.getMinutes())}`;
    const inRange = curHM >= ev.eventHours.start && curHM <= ev.eventHours.end;
    return {
      text: `📅 今日 ${ev.eventHours.start}-${ev.eventHours.end} ${inRange ? '· 🔴 比赛中' : '· 待开赛'}`,
      cls: inRange ? 'time-live' : 'time-soon',
    };
  }

  // 4. 有明确 startTime/endTime（演唱会/灯光秀/市集）
  if (ev.startTime && ev.endTime) {
    const status = TimeUtils.determineStatus(ev.startTime, ev.endTime, null, false);
    const dateStr = DateUtils.friendlyDate(DateUtils.toDateStr(new Date(ev.startTime)));
    const timeRange = `${tsToHM(ev.startTime)}-${tsToHM(ev.endTime)}`;
    switch (status) {
      case 'impending':
        return { text: `📅 ${dateStr} ${timeRange} · 待开始`, cls: 'time-soon' };
      case 'ongoing':
        return { text: `📅 ${dateStr} ${timeRange} · 🔴 进行中`, cls: 'time-live' };
      case 'justEnded':
        return { text: `📅 ${dateStr} ${timeRange} · 已结束`, cls: 'time-end' };
    }
  }

  // 兜底
  return { text: '🔴 进行中', cls: 'time-live' };
}

// ============ Feed 页渲染 ============
function renderFeed() {
  feedVertical.innerHTML = '';
  events.forEach((ev, idx) => {
    const page = document.createElement('div');
    page.className = `feed-page bg-${idx % 4}`;
    page.dataset.eventIndex = idx;

    const videoCount = Math.max(1, ev.videoCount);
    const isIgniting = ev.heatSpeed >= 100; // 引爆中
    const isRising = ev.heatSpeed > 0 && !isIgniting; // 上涨中
    const fillPercent = Math.min(100, (ev.heat / HEAT_CEILING) * 100);
    const dist = GeoUtils.distanceInKm(state.focus.lat, state.focus.lon, ev.lat, ev.lon);

    // 当前视频的发布者（视频级，随横向切换变化）
    const publisher = getPublisher(idx, 0);
    const followed = followedPublishers.has(publisher.id);

    page.innerHTML = `
      <div class="heat-bar ${isIgniting ? 'igniting' : ''} ${isRising ? 'rising' : ''}" data-event-id="${ev.id}">
        ${isIgniting ? '<div class="heat-bar-ignite-label">引爆热点</div>' : ''}
        <div class="heat-bar-value">🔥 ${FormatUtils.formatHeat(ev.heat)}</div>
        <div class="heat-bar-track">
          <div class="heat-bar-fill" style="height: ${fillPercent}%">
            <div class="heat-bar-stripes"></div>
          </div>
          ${isIgniting ? `
            <div class="heat-bar-flames">
              <span style="animation-delay:0s">🔥</span>
              <span style="animation-delay:0.3s">🔥</span>
              <span style="animation-delay:0.6s">🔥</span>
            </div>
          ` : ''}
        </div>
        ${isRising ? '<div class="heat-bar-rising-icon">↑</div>' : ''}
      </div>
      <div class="video-bg" style="background-image:url('${ev.image || ''}')">
        <div class="play-icon">▶</div>
        <div class="ev-title">${ev.name}</div>
        <div class="ev-meta">${FormatUtils.formatHeat(ev.heat)} 🔥 · 视角 1/${videoCount}</div>
        <div class="ev-desc">${ev.description || ''}</div>
      </div>
      <div class="gradient-overlay"></div>
      <div class="action-sidebar" data-event-id="${ev.id}">
        <div class="publisher-block" data-publisher-id="${publisher.id}">
          <div class="publisher-avatar">${publisher.avatar}</div>
          <button class="follow-btn ${followed ? 'followed' : ''}" aria-label="关注">${followed ? '✓' : '+'}</button>
        </div>
        ${renderActionBtn('', '🤍', FormatUtils.formatCount(ev.likeCount), 'like')}
        ${renderActionBtn('', '💬', FormatUtils.formatCount(ev.commentCount), 'comment')}
        ${renderActionBtn('share-btn', SHARE_ARROW_SVG, FormatUtils.formatCount(ev.shareCount), 'share')}
        ${renderActionBtn(state.wantToGo.has(ev.id) ? 'active' : '', state.wantToGo.has(ev.id) ? '🔖' : '📑', '想去', 'wantToGo')}
      </div>
      <div class="hotspot-info-card">
        <div class="info-card-top">
          <div class="name">${ev.name}</div>
        </div>
        <div class="info-meta">
          <span class="meta-tag heat-mini">
            <span class="heat-mini-bar" style="width:${Math.min(100, (ev.heat / HEAT_CEILING) * 100)}%"></span>
            🔥 ${FormatUtils.formatHeat(ev.heat)}
          </span>
          <span class="meta-tag ${getTimeLabel(ev).cls}">${getTimeLabel(ev).text}</span>
          <span class="meta-tag">📍 ${ev.address}</span>
          <span class="meta-tag">📏 ${dist.toFixed(1)}km</span>
        </div>
      </div>
      <div class="mini-map" data-action="goto-map">
        <div class="hot"></div>
        <div class="me"></div>
        <div class="map-label">地图</div>
      </div>
      ${videoCount > 1 ? `
        <div class="same-indicator">
          <div class="dots">${Array.from({ length: videoCount }, (_, i) => `<div class="d ${i === 0 ? 'active' : ''}"></div>`).join('')}</div>
          <div class="hint">◀ 滑动查看同事件${videoCount}个视频 ▶</div>
        </div>
      ` : ''}
    `;

    // 热度柱形条点击 → 助推（事件级热度）
    page.querySelector('.heat-bar').addEventListener('click', () => {
      ev.heat += 10;
      const fill = page.querySelector('.heat-bar-fill');
      const value = page.querySelector('.heat-bar-value');
      const newPercent = Math.min(100, (ev.heat / HEAT_CEILING) * 100);
      fill.style.height = newPercent + '%';
      value.textContent = '🔥 ' + FormatUtils.formatHeat(ev.heat);
      // 闪光动画
      fill.classList.remove('boost-flash');
      void fill.offsetWidth; // 强制 reflow 重启动画
      fill.classList.add('boost-flash');
      setTimeout(() => fill.classList.remove('boost-flash'), 500);
      // 同步底部热度小标签的数字和进度条
      const heatMini = page.querySelector('.heat-mini');
      if (heatMini) {
        heatMini.lastChild.textContent = '🔥 ' + FormatUtils.formatHeat(ev.heat);
        const bar = heatMini.querySelector('.heat-mini-bar');
        if (bar) bar.style.width = Math.min(100, (ev.heat / HEAT_CEILING) * 100) + '%';
      }
      const meta = page.querySelector('.ev-meta');
      if (meta) {
        const vi = state.currentVideoIndices[idx] || 0;
        meta.textContent = `${FormatUtils.formatHeat(ev.heat)} 🔥 · 视角 ${vi + 1}/${videoCount}`;
      }
      showToast('🔥 热度 +10！');
    });

    // 关注按钮
    page.querySelector('.follow-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const pubBlock = page.querySelector('.publisher-block');
      const pubId = pubBlock.dataset.publisherId;
      const btn = e.currentTarget;
      if (followedPublishers.has(pubId)) {
        followedPublishers.delete(pubId);
        btn.classList.remove('followed');
        btn.textContent = '+';
        showToast('已取消关注');
      } else {
        followedPublishers.add(pubId);
        btn.classList.add('followed');
        btn.textContent = '✓';
        showToast('✅ 关注成功');
      }
    });

    // 互动栏（点赞/评论/分享/想去）
    page.querySelector('.action-sidebar').addEventListener('click', (e) => {
      const btn = e.target.closest('.action-btn');
      if (!btn) return;
      handleAction(btn.dataset.action, ev, btn);
    });
    page.querySelector('.mini-map').addEventListener('click', () => switchTab('map'));

    feedVertical.appendChild(page);
  });
}

function renderActionBtn(cls, icon, label, action) {
  return `
    <div class="action-btn ${cls}" data-action="${action}">
      <div class="circle">${icon}</div>
      <div class="label">${label}</div>
    </div>
  `;
}

function handleAction(action, ev, btn) {
  switch (action) {
    case 'like':
      btn.classList.add('active');
      btn.querySelector('.circle').textContent = '❤️';
      showToast('❤️ 已点赞');
      break;
    case 'comment':
      showToast('💬 查看评论');
      break;
    case 'share':
      showToast('📤 已分享');
      break;
    case 'wantToGo':
      if (state.wantToGo.has(ev.id)) {
        state.wantToGo.delete(ev.id);
        btn.classList.remove('active');
        btn.querySelector('.circle').textContent = '📑';
        removeTripByEvent(ev.id);
        updateTripBadge();
        showToast('📍 已取消想去');
      } else {
        state.wantToGo.add(ev.id);
        btn.classList.add('active');
        btn.querySelector('.circle').textContent = '🔖';
        addTripFromEvent(ev);
        updateTripBadge();
        showTripTip();
      }
      renderProfile();
      break;
  }
}

// ============ 行程管理 ============
function findEvent(id) { return events.find((e) => e.id === id); }

function addTripFromEvent(ev) {
  // 默认安排到明天 19:00，出行方式按距离推荐
  const dist = GeoUtils.distanceInKm(state.focus.lat, state.focus.lon, ev.lat, ev.lon);
  const mode = suggestMode(dist);
  trips.push({
    id: 't_' + Date.now(),
    eventId: ev.id,
    date: DateUtils.toDateStr(DateUtils.addDays(1)),
    startH: 19, endH: 21,
    mode,
    visitH: null,
  });
}

function removeTripByEvent(eventId) {
  const i = trips.findIndex((t) => t.eventId === eventId && t.id.startsWith('t_'));
  if (i >= 0) trips.splice(i, 1);
}

// 计算预计到达时间（基于上一行程结束时间 + 距离/速度 + 30 分钟缓冲）
function computeEta(trip, prevTrip) {
  const ev = findEvent(trip.eventId);
  if (!ev) return trip.startH;
  if (!prevTrip) return trip.startH;
  const prevEv = findEvent(prevTrip.eventId);
  if (!prevEv) return trip.startH;
  const dist = GeoUtils.distanceInKm(prevEv.lat, prevEv.lon, ev.lat, ev.lon);
  const speed = TRAVEL_MODES[trip.mode].speed;
  const travelH = dist / speed;
  const bufferH = 0.5; // 30 分钟缓冲
  const eta = prevTrip.endH + travelH + bufferH;
  return Math.min(eta, trip.startH + 0.5);
}

// 当天行程（按开始时间排序）
function tripsOfDate(dateStr) {
  return trips
    .filter((t) => t.date === dateStr)
    .sort((a, b) => a.startH - b.startH);
}

// ============ 行程页渲染 ============
function renderTrip() {
  renderCalendarBar();
  renderTripList();
  renderMiniMap();
}

function renderCalendarBar() {
  const labels = ['今天', '明天', '后天', '大后天'];
  calendarBar.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const d = DateUtils.addDays(i);
    const dateStr = DateUtils.toDateStr(d);
    const count = tripsOfDate(dateStr).length;
    const chip = document.createElement('div');
    chip.className = 'cal-chip' + (dateStr === state.currentTripDate ? ' active' : '');
    chip.innerHTML = `
      <div class="dow">${labels[i]} · 周${DateUtils.weekLabel(d)}</div>
      <div class="day">${d.getDate()}</div>
      <div class="badge ${count === 0 ? 'empty' : ''}">${count > 0 ? count + '项' : '·'}</div>
    `;
    chip.addEventListener('click', () => {
      state.currentTripDate = dateStr;
      renderTrip();
    });
    calendarBar.appendChild(chip);
  }
}

function renderTripList() {
  const dateStr = state.currentTripDate;
  const list = tripsOfDate(dateStr);
  const friendly = DateUtils.friendlyDate(dateStr);

  tripDateTitle.innerHTML = `<strong>${friendly}</strong> · ${list.length} 项行程`;

  // 检测时间冲突
  let conflictHtml = '';
  if (list.length >= 2) {
    for (let i = 0; i < list.length - 1; i++) {
      if (list[i].endH > list[i + 1].startH) {
        conflictHtml = `<div class="trip-conflict">⚠️ 有 ${list.length} 个事件时间重叠，请合理安排</div>`;
        break;
      }
    }
  }

  if (list.length === 0) {
    tripList.innerHTML = `
      <div class="trip-empty">
        <div class="big">🗺️</div>
        ${friendly}还没有行程<br/>
        在首页点击 📑想去 按钮添加行程<br/>
        或点击右上角 📅 选择其他日期
      </div>
    `;
    return;
  }

  tripList.innerHTML = conflictHtml + list.map((trip, idx) => {
    const ev = findEvent(trip.eventId);
    if (!ev) return '';
    const dist = GeoUtils.distanceInKm(state.focus.lat, state.focus.lon, ev.lat, ev.lon);
    const mode = TRAVEL_MODES[trip.mode];
    const prev = idx > 0 ? list[idx - 1] : null;
    const eta = computeEta(trip, prev);
    const etaStr = `${Math.floor(eta).toString().padStart(2, '0')}:${Math.round((eta % 1) * 60).toString().padStart(2, '0')}`;
    const checkedIn = trip.visitH !== null;
    const today = DateUtils.todayStr();
    // 当天 + 已过开始时间 + 用户到达过 → 已打卡
    const isToday = trip.date === today;
    const autoCheckable = isToday && new Date().getHours() >= trip.startH;

    // 票务标签：需要付费入场的事件显示"票"
    const needTicket = !!ev.ticketRequired;
    const purchased = !!trip.purchasedTicket;
    const ticketTag = needTicket
      ? `<span class="trip-tag ticket ${purchased ? 'purchased' : ''}" data-action="ticket" data-trip-id="${trip.id}">🎫 ${purchased ? '已购票' : '购票'}</span>`
      : '';

    return `
      <div class="trip-item ${checkedIn ? 'checked-in' : ''}" data-trip-id="${trip.id}">
        <div class="trip-time">
          <div class="h">${String(trip.startH).padStart(2, '0')}</div>
          <div class="m">:${String(0).padStart(2, '0')}</div>
        </div>
        <div class="trip-main">
          <div class="name">${ev.name}</div>
          <div class="addr">${ev.address} · ${dist.toFixed(1)}km</div>
          <div class="tags">
            <span class="trip-tag mode">${mode.icon} ${mode.label}</span>
            <span class="trip-tag eta">⏱️ ${etaStr} 到达</span>
            <span class="trip-tag">${String(trip.startH).padStart(2, '0')}:00 - ${String(trip.endH).padStart(2, '0')}:00</span>
            ${ticketTag}
          </div>
        </div>
        <div class="trip-status" data-trip-id="${trip.id}">
          <div class="checkin-badge ${checkedIn ? 'done' : ''}">${checkedIn ? '✓' : '○'}</div>
          <div class="checkin-label ${checkedIn ? 'done' : ''}">${checkedIn ? '已打卡' : (autoCheckable ? '点击打卡' : '待打卡')}</div>
        </div>
      </div>
    `;
  }).join('');

  // 绑定票标签点击 → 打开购票弹层
  tripList.querySelectorAll('.trip-tag.ticket').forEach((tag) => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      const trip = trips.find((t) => t.id === tag.dataset.tripId);
      if (!trip) return;
      const ev = findEvent(trip.eventId);
      if (!ev || !ev.ticketRequired) return;
      if (trip.purchasedTicket) {
        showToast('该行程已购票');
        return;
      }
      openTicketSheet(trip, ev);
    });
  });

  // 绑定打卡点击
  tripList.querySelectorAll('.trip-status').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const trip = trips.find((t) => t.id === el.dataset.tripId);
      if (!trip) return;
      if (trip.visitH !== null) {
        showToast('该行程已打卡');
        return;
      }
      const today = DateUtils.todayStr();
      if (trip.date !== today) {
        showToast('非今日行程，无法打卡');
        return;
      }
      if (new Date().getHours() < trip.startH) {
        showToast('行程尚未开始');
        return;
      }
      // 模拟"用户当天到达此地" → 自动打卡，并生成足迹记录
      trip.visitH = new Date().getHours();
      const existFp = footprints.find((x) => x.eventId === trip.eventId && x.date === trip.date);
      if (!existFp) {
        footprints.unshift({
          id: 'f_' + Date.now(),
          eventId: trip.eventId,
          date: trip.date,
          visitH: trip.visitH,
          content: null,
        });
      }
      showToast('✅ 打卡成功！');
      renderTrip();
      renderProfile();
    });
  });
}

// ============ 浮动微型地图 ============
function renderMiniMap() {
  const list = tripsOfDate(state.currentTripDate);
  const miniMap = $('#trip-mini-map');
  miniMap.classList.toggle('collapsed', state.miniMapCollapsed);

  if (list.length === 0) {
    tmmCanvas.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3);font-size:12px;">当日无行程</div>';
    tmmSummary.innerHTML = '';
    return;
  }

  // 计算各点经纬度范围，映射到 canvas 坐标
  const evs = list.map((t) => findEvent(t.eventId)).filter(Boolean);
  const lats = evs.map((e) => e.lat);
  const lons = evs.map((e) => e.lon);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const pad = 0.25; // 内边距比例
  const latRange = (maxLat - minLat) || 0.01;
  const lonRange = (maxLon - minLon) || 0.01;

  // canvas 尺寸（CSS 像素）
  const W = 100, H = 100; // 百分比坐标系

  const points = evs.map((ev, i) => {
    const x = pad + ((ev.lon - minLon) / lonRange) * (1 - 2 * pad);
    const y = 1 - (pad + ((ev.lat - minLat) / latRange) * (1 - 2 * pad));
    return { x: x * W, y: y * H, ev, trip: list[i], idx: i };
  });

  // 节点 + 连线
  let html = '';
  // 先画连线
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const done = a.trip.visitH !== null;
    html += `<div class="tmm-line ${done ? 'done' : ''}" style="
      left:${a.x}%;top:${a.y}%;width:${len}%;
      transform:rotate(${angle}deg);
    "></div>`;
  }
  // 再画节点
  points.forEach((p, i) => {
    const done = p.trip.visitH !== null;
    const eta = computeEta(p.trip, i > 0 ? list[i - 1] : null);
    const etaStr = `${String(Math.floor(eta)).padStart(2, '0')}:${String(Math.round((eta % 1) * 60)).padStart(2, '0')}`;
    html += `
      <div class="tmm-node ${done ? 'done' : ''}" style="left:${p.x}%;top:${p.y}%;">
        <div class="pin">${i + 1}</div>
        <div class="pin-time">${etaStr}</div>
      </div>
    `;
  });
  tmmCanvas.innerHTML = html;

  // 汇总：总行程数 / 总距离 / 总时长
  let totalDist = 0;
  for (let i = 0; i < evs.length; i++) {
    const from = i === 0 ? state.focus : { lat: evs[i - 1].lat, lon: evs[i - 1].lon };
    totalDist += GeoUtils.distanceInKm(from.lat, from.lon, evs[i].lat, evs[i].lon);
  }
  const totalH = list.reduce((s, t) => s + (t.endH - t.startH), 0);
  const checkedCount = list.filter((t) => t.visitH !== null).length;
  tmmSummary.innerHTML = `
    <div class="sum-item"><span>行程</span><span class="v accent">${list.length}</span></div>
    <div class="sum-item"><span>已打卡</span><span class="v">${checkedCount}/${list.length}</span></div>
    <div class="sum-item"><span>总距离</span><span class="v">${totalDist.toFixed(1)}km</span></div>
    <div class="sum-item"><span>总时长</span><span class="v">${totalH}h</span></div>
  `;
}

// ============ 日历弹层 ============
function renderCalendarModal() {
  const viewDate = state.calendarViewMonth;
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  calTitle.textContent = `${year}年${month + 1}月`;

  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay(); // 0=周日
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = DateUtils.todayStr();

  let html = '';
  // 前置空格
  for (let i = 0; i < startWeekday; i++) {
    html += '<div class="cal-cell empty"></div>';
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${DateUtils.pad(month + 1)}-${DateUtils.pad(d)}`;
    const cellDate = new Date(year, month, d);
    cellDate.setHours(0, 0, 0, 0);
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === state.currentTripDate;
    const isPast = cellDate < new Date(todayStr);
    const hasTrip = trips.some((t) => t.date === dateStr);
    const classes = [
      'cal-cell',
      isToday ? 'today' : '',
      isSelected ? 'selected' : '',
      isPast ? 'past' : '',
      hasTrip ? 'has-trip' : '',
    ].filter(Boolean).join(' ');
    html += `<div class="${classes}" data-date="${dateStr}">${d}</div>`;
  }
  calendarGrid.innerHTML = html;

  calendarGrid.querySelectorAll('.cal-cell:not(.empty)').forEach((cell) => {
    cell.addEventListener('click', () => {
      state.currentTripDate = cell.dataset.date;
      $('#calendar-modal').classList.remove('show');
      renderTrip();
    });
  });
}

// ============ 地图页渲染 ============
function renderMap() {
  const positions = [
    { top: '18%', left: '12%' },
    { top: '32%', left: '60%' },
    { top: '48%', left: '24%' },
    { top: '58%', left: '72%' },
    { top: '72%', left: '40%' },
    { top: '78%', left: '16%' },
  ];
  mapMarkers.innerHTML = events.map((ev, i) => `
    <div class="map-marker ${burstingIds.has(ev.id) ? 'bursting' : ''}"
         style="top:${positions[i % positions.length].top};left:${positions[i % positions.length].left}"
         data-event-id="${ev.id}">
      <div class="pin">🔥</div>
      <div class="pin-name">${ev.name}</div>
      <div class="pin-heat">${FormatUtils.formatHeat(ev.heat)}</div>
    </div>
  `).join('');

  // 按热度排序的列表
  const sorted = [...events].sort((a, b) => b.heat - a.heat);
  mapList.innerHTML = sorted.map((ev, i) => `
    <div class="map-list-item">
      <div class="rank ${i < 3 ? 't' + (i + 1) : ''}">${i + 1}</div>
      <div class="info">
        <div class="name">${ev.name}</div>
        <div class="sub">${ev.address}</div>
      </div>
      <div class="heat">${FormatUtils.formatHeat(ev.heat)} 🔥</div>
    </div>
  `).join('');

  $$('.map-marker').forEach((marker) => {
    marker.addEventListener('click', () => {
      const rect = marker.getBoundingClientRect();
      const canvasRect = $('#map-canvas').getBoundingClientRect();
      const cx = rect.left - canvasRect.left + rect.width / 2;
      const cy = rect.top - canvasRect.top + rect.height / 2;
      showParticles(cx, cy);
    });
  });
}

function showParticles(cx, cy) {
  const canvas = $('#map-canvas');
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.textContent = '🔥';
    p.style.left = cx - 12 + 'px';
    p.style.top = cy - 12 + 'px';
    const dx = (Math.random() - 0.5) * 120;
    const dy = -40 - Math.random() * 80;
    p.style.setProperty('--dx', dx + 'px');
    p.style.setProperty('--dy', dy + 'px');
    canvas.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

// ============ 足迹筛选与渲染 ============
// 按天数范围筛选足迹（最近 N 天），按日期倒序
function footprintsInRange(days) {
  const cutoff = DateUtils.toDateStr(DateUtils.addDays(-(days - 1)));
  return footprints
    .filter((f) => f.date >= cutoff)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.visitH - a.visitH));
}

// 渲染个人页足迹卡片（含动画 + 缩略列表）
function renderFootprintCard() {
  const recent = footprintsInRange(30);
  const contentCount = recent.filter((f) => f.content).length;

  // 动画节点：取最近 5 条（不足则全取），映射到蜿蜒路径位置
  const animNodes = recent.slice(0, 5).reverse(); // 最早→最近，呈现行进方向
  const positions = FP_NODE_POSITIONS;

  // 构建路径连线 HTML
  let pathHtml = '';
  for (let i = 0; i < animNodes.length - 1 && i < positions.length - 1; i++) {
    const a = positions[i], b = positions[i + 1];
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    pathHtml += `<div class="fp-path-seg" style="
      left:${a.x}%;top:${a.y}%;width:${len}%;
      --rot:${angle}deg;
      transform:rotate(${angle}deg);
      animation-delay:${0.15 * i + 0.2}s;
    "></div>`;
  }

  // 节点 HTML
  const nodesHtml = animNodes.map((f, i) => {
    const ev = findEvent(f.eventId);
    if (!ev) return '';
    const pos = positions[i] || positions[positions.length - 1];
    const hasContent = !!f.content;
    return `
      <div class="fp-node ${hasContent ? 'has-content' : ''}"
           style="left:${pos.x}%;top:${pos.y}%;animation-delay:${0.15 * i + 0.3}s;"
           data-footprint-id="${f.id}">
        <div class="paw">${hasContent ? '🎬' : '🐾'}</div>
        <div class="paw-label">${ev.name.replace(/^\S+\s/, '').slice(0, 6)}</div>
      </div>
    `;
  }).join('');

  // 漂浮爪印（装饰）
  const floatPaws = [0, 1, 2, 3].map((i) => `
    <div class="fp-float-paw" style="
      left:${20 + i * 20}%;top:${60 + (i % 2) * 20}%;
      animation-delay:${i * 0.8}s;
    ">🐾</div>
  `).join('');

  // 缩略列表（最近 30 天全部，横向滚动）
  const thumbsHtml = recent.map((f) => {
    const ev = findEvent(f.eventId);
    if (!ev) return '';
    const hasContent = !!f.content;
    const d = DateUtils.parseDateStr(f.date);
    return `
      <div class="fp-thumb ${hasContent ? 'has-content' : ''}" data-footprint-id="${f.id}">
        <div class="ic">${(ev.name.match(/^\S+/) || ['📍'])[0]}</div>
        <div class="nm">${ev.name.replace(/^\S+\s/, '').slice(0, 5)}</div>
        <div class="dt">${d.getMonth() + 1}/${d.getDate()}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="footprint-card">
      <div class="footprint-card-head">
        <h3>🐾 我的足迹</h3>
        <button class="fp-more" id="fp-more-btn">查看更多 ›</button>
      </div>
      <div class="fp-summary">近30天去过 <strong>${recent.length}</strong> 个地方，分享过 <strong>${contentCount}</strong> 条内容</div>
      <div class="fp-anim">
        <div class="fp-path">${pathHtml}</div>
        ${floatPaws}
        ${nodesHtml}
        <div class="fp-walker">🚶</div>
      </div>
      <div class="fp-thumb-list">${thumbsHtml}</div>
    </div>
  `;
}

// 渲染足迹详情弹层列表
function renderFootprintModal() {
  const list = footprintsInRange(state.footprintRange);
  if (list.length === 0) {
    footprintModalList.innerHTML = `
      <div class="fp-modal-empty">
        <div class="big">🐾</div>
        该时间段还没有足迹记录<br/>
        去探索更多热点吧！
      </div>
    `;
    return;
  }
  footprintModalList.innerHTML = list.map((f) => {
    const ev = findEvent(f.eventId);
    if (!ev) return '';
    const d = DateUtils.parseDateStr(f.date);
    const hasContent = !!f.content;
    const contentLabel = hasContent
      ? (f.content.type === 'video' ? `视频 ${f.content.duration}s` : '图文')
      : '未上传';
    return `
      <div class="fp-modal-item ${hasContent ? 'has-content' : ''}" data-footprint-id="${f.id}">
        <div class="date-col">
          <div class="d">${d.getDate()}</div>
          <div class="m">${d.getMonth() + 1}月</div>
        </div>
        <div class="info-col">
          <div class="name">${ev.name}</div>
          <div class="addr">${ev.address} · ${String(f.visitH).padStart(2, '0')}:00 到达</div>
          <div class="meta">
            <span class="meta-tag">${DateUtils.friendlyDate(f.date)}</span>
            <span class="meta-tag ${hasContent ? 'content' : ''}" data-action="view-content">${contentLabel}</span>
          </div>
        </div>
        <div class="arrow">${hasContent ? '›' : ''}</div>
      </div>
    `;
  }).join('');

  // 绑定查看内容
  footprintModalList.querySelectorAll('.fp-modal-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      const f = footprints.find((x) => x.id === item.dataset.footprintId);
      if (!f) return;
      if (!f.content) {
        showToast('该足迹未上传内容');
        return;
      }
      renderContentModal(f);
    });
  });
}

// 渲染内容查看弹层（视频/图文）
function renderContentModal(f) {
  const ev = findEvent(f.eventId);
  if (!ev || !f.content) return;
  const d = DateUtils.parseDateStr(f.date);
  const dateStr = `${d.getMonth() + 1}月${d.getDate()}日 ${String(f.visitH).padStart(2, '0')}:00`;
  const mediaHtml = f.content.type === 'video'
    ? `<div class="play-big">▶</div>
       <div class="media-label">视频 · ${f.content.duration}秒</div>
       <div class="media-time">📍 ${ev.address} · ${dateStr}</div>`
    : `<div class="play-big">🖼</div>
       <div class="media-label">图文记录</div>
       <div class="media-time">📍 ${ev.address} · ${dateStr}</div>`;

  contentSheet.innerHTML = `
    <div class="content-sheet-head">
      <div>
        <h3>${ev.name}</h3>
        <div class="sub">${dateStr} 打卡</div>
      </div>
      <button class="icon-btn" id="content-close">✕</button>
    </div>
    <div class="content-media">${mediaHtml}</div>
    <div class="content-text">${f.content.text}</div>
    <div class="content-actions">
      <button class="content-action">❤️ 点赞</button>
      <button class="content-action">💬 评论</button>
      <button class="content-action">📤 分享</button>
    </div>
  `;
  $('#content-modal').classList.add('show');
  $('#content-close').addEventListener('click', () => {
    $('#content-modal').classList.remove('show');
  });
  contentSheet.querySelectorAll('.content-action').forEach((btn) => {
    btn.addEventListener('click', () => showToast(btn.textContent.trim() + '（Demo）'));
  });
}

// ============ 购票流程 ============
// 支付方式
const PAY_METHODS = [
  { id: 'wechat', name: '微信支付', icon: '💚' },
  { id: 'alipay', name: '支付宝',   icon: '💙' },
  { id: 'card',   name: '银行卡',   icon: '💳' },
];

let ticketState = { trip: null, ev: null, selectedOption: null };
let payState = { ticket: null, ev: null, method: 'wechat' };

// 打开购票弹层
function openTicketSheet(trip, ev) {
  ticketState = { trip, ev, selectedOption: null };
  const friendlyDate = DateUtils.friendlyDate(trip.date);

  ticketSheet.innerHTML = `
    <div class="ticket-sheet-head">
      <div class="ev-title">${ev.name}</div>
      <div class="ev-sub">📅 ${friendlyDate} ${String(trip.startH).padStart(2,'0')}:00 · 📍 ${ev.address}</div>
    </div>
    <div class="ticket-options" id="ticket-options">
      ${ev.ticketOptions.map((opt) => `
        <div class="ticket-option" data-opt-id="${opt.id}">
          <div class="opt-radio"></div>
          <div class="opt-info">
            <div class="opt-name">${opt.name}</div>
            <div class="opt-desc">${opt.desc}</div>
          </div>
          <div class="opt-price"><span class="yuan">¥</span>${opt.price}</div>
        </div>
      `).join('')}
    </div>
    <div class="ticket-foot">
      <div class="ticket-total">
        <span class="lbl">合计</span>
        <span class="val" id="ticket-total-val"><span class="yuan">¥</span>--</span>
      </div>
      <button class="ticket-buy-btn" id="ticket-buy-btn" disabled>确认选座</button>
    </div>
  `;
  $('#ticket-modal').classList.add('show');

  // 选择票档
  ticketSheet.querySelectorAll('.ticket-option').forEach((opt) => {
    opt.addEventListener('click', () => {
      ticketSheet.querySelectorAll('.ticket-option').forEach((o) => o.classList.remove('selected'));
      opt.classList.add('selected');
      ticketState.selectedOption = ev.ticketOptions.find((o) => o.id === opt.dataset.optId);
      $('#ticket-total-val').innerHTML = `<span class="yuan">¥</span>${ticketState.selectedOption.price}`;
      $('#ticket-buy-btn').disabled = false;
      $('#ticket-buy-btn').textContent = '去支付';
    });
  });

  // 确认 → 进入支付
  $('#ticket-buy-btn').addEventListener('click', () => {
    if (!ticketState.selectedOption) return;
    $('#ticket-modal').classList.remove('show');
    setTimeout(() => openPaySheet(ticketState.trip, ticketState.ev, ticketState.selectedOption), 200);
  });
}

// 打开支付弹层
function openPaySheet(trip, ev, ticket) {
  payState = { trip, ev, ticket, method: 'wechat' };
  const friendlyDate = DateUtils.friendlyDate(trip.date);

  paySheet.innerHTML = `
    <div class="pay-sheet-head">
      <h3>确认支付</h3>
      <button class="icon-btn" id="pay-close">✕</button>
    </div>
    <div class="pay-amount-box">
      <div class="lbl">支付金额</div>
      <div class="amt"><span class="yuan">¥</span>${ticket.price}</div>
    </div>
    <div class="pay-detail">
      <div class="pay-detail-row"><span class="k">商品名称</span><span class="v">${ev.name}</span></div>
      <div class="pay-detail-row"><span class="k">票档</span><span class="v">${ticket.name}</span></div>
      <div class="pay-detail-row"><span class="k">场次</span><span class="v">${friendlyDate} ${String(trip.startH).padStart(2,'0')}:00</span></div>
      <div class="pay-detail-row"><span class="k">场馆</span><span class="v">${ev.address}</span></div>
    </div>
    <div class="pay-methods" id="pay-methods">
      ${PAY_METHODS.map((m) => `
        <div class="pay-method ${m.id === 'wechat' ? 'selected' : ''}" data-method-id="${m.id}">
          <div class="pm-ic">${m.icon}</div>
          <div class="pm-name">${m.name}</div>
          <div class="pm-radio"></div>
        </div>
      `).join('')}
    </div>
    <button class="pay-confirm-btn" id="pay-confirm-btn">确认支付 ¥${ticket.price}</button>
  `;
  $('#pay-modal').classList.add('show');

  // 切换支付方式
  paySheet.querySelectorAll('.pay-method').forEach((m) => {
    m.addEventListener('click', () => {
      paySheet.querySelectorAll('.pay-method').forEach((o) => o.classList.remove('selected'));
      m.classList.add('selected');
      payState.method = m.dataset.methodId;
    });
  });

  // 关闭
  $('#pay-close').addEventListener('click', () => $('#pay-modal').classList.remove('show'));

  // 确认支付 → 模拟支付中 → 成功
  $('#pay-confirm-btn').addEventListener('click', () => {
    const btn = $('#pay-confirm-btn');
    btn.classList.add('paying');
    btn.textContent = '支付中...';
    setTimeout(() => {
      // 回写购票信息到 trip
      trip.purchasedTicket = {
        optionId: payState.ticket.id,
        optionName: payState.ticket.name,
        price: payState.ticket.price,
        method: payState.method,
        orderId: 'T' + Date.now().toString().slice(-10),
        paidAt: Date.now(),
      };
      renderPaySuccess(trip, ev, payState.ticket);
    }, 1500);
  });
}

// 支付成功页
function renderPaySuccess(trip, ev, ticket) {
  const friendlyDate = DateUtils.friendlyDate(trip.date);
  const methodName = PAY_METHODS.find((m) => m.id === payState.method).name;
  const order = trip.purchasedTicket;

  paySheet.innerHTML = `
    <div class="pay-success">
      <div class="check">✓</div>
      <div class="title">支付成功</div>
      <div class="sub">电子票已加入行程</div>
      <div class="order-info">
        <span class="k">订单号</span><span class="v">${order.orderId}</span><br/>
        <span class="k">商品</span><span class="v">${ev.name}</span><br/>
        <span class="k">票档</span><span class="v">${ticket.name}</span><br/>
        <span class="k">场次</span><span class="v">${friendlyDate} ${String(trip.startH).padStart(2,'0')}:00</span><br/>
        <span class="k">场馆</span><span class="v">${ev.address}</span><br/>
        <span class="k">支付方式</span><span class="v">${methodName}</span><br/>
        <span class="k">金额</span><span class="v">¥${ticket.price}</span>
      </div>
      <button class="pay-success-btn" id="pay-done-btn">完成</button>
    </div>
  `;
  $('#pay-done-btn').addEventListener('click', () => {
    $('#pay-modal').classList.remove('show');
    renderTrip();
    showToast('🎫 购票成功，已加入行程');
  });
}

// ============ 个人页渲染（统计 + 足迹卡片） ============
function renderProfile() {
  const wantCount = state.wantToGo.size;
  const checkedCount = footprints.length;
  profileBody.innerHTML = `
    <div class="profile-avatar">👤</div>
    <div class="profile-name">城市探索者</div>
    <div class="profile-sub">探索足迹: ${footprints.length} 个打卡点</div>
    <div class="profile-stats">
      <div class="stat-item"><div class="val">${events.length}</div><div class="lbl">事件</div></div>
      <div class="stat-item"><div class="val">${wantCount}</div><div class="lbl">想去</div></div>
      <div class="stat-item"><div class="val">${checkedCount}</div><div class="lbl">打卡</div></div>
    </div>
    ${renderFootprintCard()}
  `;
  // 绑定查看更多
  $('#fp-more-btn').addEventListener('click', () => {
    renderFootprintModal();
    $('#footprint-modal').classList.add('show');
  });
  // 缩略列表点击查看内容
  profileBody.querySelectorAll('.fp-thumb').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const f = footprints.find((x) => x.id === thumb.dataset.footprintId);
      if (!f) return;
      if (!f.content) {
        showToast('该足迹未上传内容');
        return;
      }
      renderContentModal(f);
    });
  });
  // 动画节点点击查看内容
  profileBody.querySelectorAll('.fp-node').forEach((node) => {
    node.addEventListener('click', () => {
      const f = footprints.find((x) => x.id === node.dataset.footprintId);
      if (!f) return;
      if (!f.content) {
        showToast('该足迹未上传内容');
        return;
      }
      renderContentModal(f);
    });
  });
}

// ============ Tab 切换 ============
function switchTab(tab) {
  if (tab === 'upload') {
    $('#upload-modal').classList.add('show');
    return;
  }
  state.currentTab = tab;
  $$('.nav-item').forEach((n) => n.classList.toggle('active', n.dataset.tab === tab));
  $$('.page').forEach((p) => p.classList.remove('active'));
  const pageMap = { feed: 'page-feed', map: 'page-map', trip: 'page-trip', profile: 'page-profile' };
  $('#' + pageMap[tab]).classList.add('active');
  if (tab === 'trip') renderTrip();
}

// ============ 焦点切换 ============
function renderFocusOptions() {
  const container = $('#focus-options');
  container.innerHTML = focusOptions.map((o, i) => `
    <div class="focus-option" data-idx="${i}">
      <span class="ic">📍</span>
      <span>${o.name}</span>
    </div>
  `).join('');
  $$('.focus-option').forEach((opt) => {
    opt.addEventListener('click', () => {
      const idx = +opt.dataset.idx;
      state.focus = { ...focusOptions[idx] };
      $('#focus-name').textContent = focusOptions[idx].name.replace('📍 ', '');
      $('#focus-modal').classList.remove('show');
      renderFeed();
      if (state.currentTab === 'trip') renderTrip();
      showToast(`已切换至${focusOptions[idx].name.replace('📍 ', '')}`);
    });
  });
}

// ============ 事件绑定 ============
function bindEvents() {
  // 底部导航
  $$('.nav-item').forEach((nav) => {
    nav.addEventListener('click', () => switchTab(nav.dataset.tab));
  });

  // 焦点选择器
  $('#focus-selector').addEventListener('click', () => {
    $('#focus-modal').classList.add('show');
  });

  // 弹层关闭
  $$('.modal-mask').forEach((mask) => {
    mask.addEventListener('click', (e) => {
      if (e.target === mask) mask.classList.remove('show');
    });
  });

  // 上传选项
  $$('.upload-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      $('#upload-modal').classList.remove('show');
      showToast('📷 Demo 暂未实现上传');
    });
  });

  // 日历弹层
  $('#open-calendar').addEventListener('click', () => {
    state.calendarViewMonth = DateUtils.parseDateStr(state.currentTripDate);
    renderCalendarModal();
    $('#calendar-modal').classList.add('show');
  });
  $('#cal-prev').addEventListener('click', () => {
    state.calendarViewMonth = new Date(state.calendarViewMonth.getFullYear(), state.calendarViewMonth.getMonth() - 1, 1);
    renderCalendarModal();
  });
  $('#cal-next').addEventListener('click', () => {
    state.calendarViewMonth = new Date(state.calendarViewMonth.getFullYear(), state.calendarViewMonth.getMonth() + 1, 1);
    renderCalendarModal();
  });

  // 微型地图收缩
  $('#tmm-toggle').addEventListener('click', () => {
    state.miniMapCollapsed = !state.miniMapCollapsed;
    renderMiniMap();
  });

  // 足迹弹层关闭
  $('#footprint-close').addEventListener('click', () => {
    $('#footprint-modal').classList.remove('show');
  });
  // 足迹弹层范围 Tab 切换
  $$('.fp-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('.fp-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      state.footprintRange = +tab.dataset.range;
      renderFootprintModal();
    });
  });

  // Feed 纵向滑动跟踪
  feedVertical.addEventListener('scroll', () => {
    const idx = Math.round(feedVertical.scrollTop / feedVertical.clientHeight);
    if (idx !== state.currentEventIndex) state.currentEventIndex = idx;
  });

  // Feed 横向滑动（触屏）
  let hStartX = 0, hStartY = 0;
  feedVertical.addEventListener('touchstart', (e) => {
    hStartX = e.touches[0].clientX;
    hStartY = e.touches[0].clientY;
  }, { passive: true });
  feedVertical.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - hStartX;
    const dy = e.changedTouches[0].clientY - hStartY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const ev = events[state.currentEventIndex];
      if (!ev || ev.videoCount <= 1) return;
      const cur = state.currentVideoIndices[state.currentEventIndex] || 0;
      if (dx < 0 && cur < ev.videoCount - 1) {
        state.currentVideoIndices[state.currentEventIndex] = cur + 1;
        updateVideoIndicator(state.currentEventIndex, cur + 1);
        showToast(`视角 ${cur + 2}/${ev.videoCount}`);
      } else if (dx > 0 && cur > 0) {
        state.currentVideoIndices[state.currentEventIndex] = cur - 1;
        updateVideoIndicator(state.currentEventIndex, cur - 1);
        showToast(`视角 ${cur}/${ev.videoCount}`);
      } else if (dx < 0 && cur === ev.videoCount - 1) {
        showToast('已为你切换到下一个热点');
        feedVertical.scrollTo({ top: (state.currentEventIndex + 1) * feedVertical.clientHeight, behavior: 'smooth' });
      }
    }
  }, { passive: true });

  // Feed 横向滑动（桌面 Shift+滚轮）
  feedVertical.addEventListener('wheel', (e) => {
    if (e.shiftKey) {
      e.preventDefault();
      const ev = events[state.currentEventIndex];
      if (!ev || ev.videoCount <= 1) return;
      const cur = state.currentVideoIndices[state.currentEventIndex] || 0;
      if (e.deltaY > 0 && cur < ev.videoCount - 1) {
        state.currentVideoIndices[state.currentEventIndex] = cur + 1;
        updateVideoIndicator(state.currentEventIndex, cur + 1);
      } else if (e.deltaY < 0 && cur > 0) {
        state.currentVideoIndices[state.currentEventIndex] = cur - 1;
        updateVideoIndicator(state.currentEventIndex, cur - 1);
      }
    }
  }, { passive: false });
}

function updateVideoIndicator(eventIndex, videoIndex) {
  const page = feedVertical.children[eventIndex];
  if (!page) return;
  // 更新视角指示器圆点
  const dots = page.querySelectorAll('.same-indicator .d');
  dots.forEach((d, i) => d.classList.toggle('active', i === videoIndex));
  // 更新视角文字（热度值随事件走，不随视频变）
  const meta = page.querySelector('.ev-meta');
  if (meta) {
    const ev = events[eventIndex];
    meta.textContent = `${FormatUtils.formatHeat(ev.heat)} 🔥 · 视角 ${videoIndex + 1}/${ev.videoCount}`;
  }
  // 更新发布者头像（视频级，随横向切换变化）
  const publisher = getPublisher(eventIndex, videoIndex);
  const pubBlock = page.querySelector('.publisher-block');
  if (pubBlock) {
    pubBlock.dataset.publisherId = publisher.id;
    pubBlock.querySelector('.publisher-avatar').textContent = publisher.avatar;
    const followed = followedPublishers.has(publisher.id);
    const followBtn = pubBlock.querySelector('.follow-btn');
    followBtn.classList.toggle('followed', followed);
    followBtn.textContent = followed ? '✓' : '+';
  }
  // 注意：热度柱形条（.heat-bar）不在此更新——热度是事件级，横向切视频时保持不变
}

// ============ 行程 Tab badge + tip ============
function updateTripBadge() {
  const badge = $('#trip-badge');
  const count = state.wantToGo.size;
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'flex';
    // 重新触发 pop 动画
    badge.classList.remove('pop');
    void badge.offsetWidth;
    badge.classList.add('pop');
  } else {
    badge.style.display = 'none';
  }
}

let tripTipTimer = null;
function showTripTip() {
  const tip = $('#trip-tip');
  tip.classList.add('show');
  clearTimeout(tripTipTimer);
  tripTipTimer = setTimeout(() => tip.classList.remove('show'), 2000);
}

// ============ 时钟 ============
function updateClock() {
  const d = new Date();
  $('#clock').textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ============ 启动 ============
function init() {
  renderFeed();
  renderMap();
  renderProfile();
  renderTrip();
  renderFocusOptions();
  bindEvents();
  updateClock();
  updateTripBadge();
  setInterval(updateClock, 30000);
}

init();
