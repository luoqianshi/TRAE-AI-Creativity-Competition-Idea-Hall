/**
 * solong-data.js — 邻里接龙(Solong) 共享 Mock 数据与工具函数
 * ============================================================
 * 本文件提供静态原型页面的所有模拟数据和通用辅助函数。
 * v2.0 — 支持多商品结构
 */

// =============================================================
// 1. 模拟数据
// =============================================================
const solongData = {
  // -------- 首页统计 --------
  stats: {
    todayAchieved: 3,
    activity: 92,
    topUser: '张三',
    topCount: 15
  },

  // -------- 8条接龙活动（覆盖不同分类、状态、进度）多商品版本 --------
  activities: [
    {
      id: 1, title: '超甜芒果团', category: 'fruit',
      emoji: '🥭',
      products: [
        { id: 101, name: '金煌芒', price: 29.9, unit: '斤', isMain: true, productType: 'main', description: '海南直发金煌芒，超级甜！' },
        { id: 102, name: '秘制卤粉', price: 15.8, unit: '份', isMain: false, productType: 'snack', description: '加购小吃，柳州风味' },
        { id: 103, name: '手打柠檬茶', price: 12.0, unit: '杯', isMain: false, productType: 'snack', description: '冰爽解渴，配芒果刚好' }
      ],
      targetCount: 50, currentCount: 32,
      deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      status: 'active', organizer: '王姐',
      gradient: 'linear-gradient(135deg, #FFD700, #FFA500)'
    },
    {
      id: 2, title: '柳州卤粉拼团', category: 'noodle',
      emoji: '🍜',
      products: [
        { id: 201, name: '招牌卤粉', price: 15.8, unit: '份', isMain: true, productType: 'main', description: '柳州风味，香辣爽口' },
        { id: 202, name: '卤蛋', price: 2.5, unit: '个', isMain: false, productType: 'snack', description: '加卤蛋更香' },
        { id: 203, name: '冰绿豆沙', price: 6.0, unit: '杯', isMain: false, productType: 'snack', description: '消暑解腻' }
      ],
      targetCount: 30, currentCount: 28,
      deadline: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
      status: 'active', organizer: '陈叔',
      gradient: 'linear-gradient(135deg, #FF9A9E, #FECFEF)'
    },
    {
      id: 3, title: '渤海大虾鲜活团', category: 'seafood',
      emoji: '🦐',
      products: [
        { id: 301, name: '渤海大虾', price: 45.0, unit: '斤', isMain: true, productType: 'main', description: '鲜活渤海大虾，个头饱满' },
        { id: 302, name: '蒜蓉酱', price: 8.0, unit: '瓶', isMain: false, productType: 'snack', description: '搭配大虾，蒜香浓郁' }
      ],
      targetCount: 40, currentCount: 40,
      deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      status: 'achieved', organizer: '海鲜哥',
      gradient: 'linear-gradient(135deg, #A1C4FD, #C2E9FB)'
    },
    {
      id: 4, title: '东北松子大礼包', category: 'nut',
      emoji: '🥜',
      products: [
        { id: 401, name: '东北松子', price: 38.0, unit: '袋', isMain: true, productType: 'main', description: '东北野生松子，颗粒饱满' }
      ],
      targetCount: 20, currentCount: 8,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'active', organizer: '小李',
      gradient: 'linear-gradient(135deg, #D4A574, #E8D5B7)'
    },
    {
      id: 5, title: '进口零食大礼包', category: 'snack',
      emoji: '🍿',
      products: [
        { id: 501, name: '进口零食大礼包', price: 68.0, unit: '箱', isMain: true, productType: 'main', description: '内含20种热门进口零食' },
        { id: 502, name: '韩式海苔', price: 12.8, unit: '包', isMain: false, productType: 'snack', description: '加购，香脆可口' }
      ],
      targetCount: 25, currentCount: 12,
      deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      status: 'active', organizer: '张姐',
      gradient: 'linear-gradient(135deg, #F093FB, #F5576C)'
    },
    {
      id: 6, title: '新鲜草莓团', category: 'fruit',
      emoji: '🍓',
      products: [
        { id: 601, name: '丹东99草莓', price: 25.0, unit: '盒', isMain: true, productType: 'main', description: '丹东直发，个大味甜' },
        { id: 602, name: '草莓酱', price: 18.0, unit: '瓶', isMain: false, productType: 'snack', description: '纯手工熬制' }
      ],
      targetCount: 50, currentCount: 50,
      deadline: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      status: 'achieved', organizer: '王姐',
      gradient: 'linear-gradient(135deg, #FF758C, #FF7EB3)'
    },
    {
      id: 7, title: '手工牛肉酱', category: 'other',
      emoji: '📦',
      products: [
        { id: 701, name: '手工牛肉酱', price: 22.0, unit: '瓶', isMain: true, productType: 'main', description: '纯手工制作，真材实料' },
        { id: 702, name: '辣椒酱', price: 15.0, unit: '瓶', isMain: false, productType: 'snack', description: '加购，无辣不欢' },
        { id: 703, name: '拌面酱', price: 18.0, unit: '瓶', isMain: false, productType: 'snack', description: '加购，拌面一绝' }
      ],
      targetCount: 15, currentCount: 5,
      deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      status: 'active', organizer: '王大厨',
      gradient: 'linear-gradient(135deg, #A8E063, #56AB2F)'
    },
    {
      id: 8, title: '海南椰子鸡', category: 'other',
      emoji: '🥥',
      products: [
        { id: 801, name: '海南椰子鸡套餐', price: 88.0, unit: '份', isMain: true, productType: 'main', description: '含文昌鸡+椰子水+蘸料' }
      ],
      targetCount: 20, currentCount: 20,
      deadline: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      status: 'closed', organizer: '阿明',
      gradient: 'linear-gradient(135deg, #89F7FE, #66A6FF)'
    }
  ],

  // -------- 详情页用的一条完整活动数据（带 products） --------
  detailActivity: {
    id: 1, title: '超甜芒果团',
    description: '海南直发金煌芒，超级甜！果肉饱满多汁，不打催熟剂，自然成熟。小区团购价仅需 29.9 元/斤，市场价 45 元/斤！',
    category: 'fruit', emoji: '🥭',
    products: [
      { id: 101, name: '金煌芒', price: 29.9, unit: '斤', isMain: true, productType: 'main', description: '海南直发金煌芒，超级甜！果肉饱满多汁' },
      { id: 102, name: '秘制卤粉', price: 15.8, unit: '份', isMain: false, productType: 'snack', description: '加购小吃·柳州风味，香辣爽口' },
      { id: 103, name: '手打柠檬茶', price: 12.0, unit: '杯', isMain: false, productType: 'snack', description: '冰爽解渴，配芒果刚好' }
    ],
    targetCount: 50, currentCount: 32,
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    status: 'active', organizer: '王姐',
    gradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
    remark: '晚上 8 点小区北门取货，请自备零钱。收到货后请及时检查，如有坏果请联系团长。'
  },

  // -------- 20条参与者记录（带 items 多商品选购） --------
  participants: [
    { id: 1, nickname: '王姐', isOrganizer: true,
      items: [{ productId: 101, productName: '金煌芒', quantity: 1, subtotal: 29.9 }],
      totalAmount: 29.9, createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 2, nickname: '李四', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 2, subtotal: 59.8 }, { productId: 102, productName: '秘制卤粉', quantity: 1, subtotal: 15.8 }],
      totalAmount: 75.6, remark: '要甜的', createdAt: new Date(Date.now() - 3600000 * 1.8).toISOString() },
    { id: 3, nickname: '小明', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 3, subtotal: 89.7 }, { productId: 103, productName: '手打柠檬茶', quantity: 2, subtotal: 24.0 }],
      totalAmount: 113.7, remark: '帮邻居带', createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString() },
    { id: 4, nickname: '王叔', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 3, subtotal: 89.7 }, { productId: 102, productName: '秘制卤粉', quantity: 2, subtotal: 31.6 }],
      totalAmount: 121.3, createdAt: new Date(Date.now() - 3600000 * 1.2).toISOString() },
    { id: 5, nickname: '张阿姨', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 2, subtotal: 59.8 }],
      totalAmount: 59.8, remark: '要大的', createdAt: new Date(Date.now() - 3600000 * 1.0).toISOString() },
    { id: 6, nickname: '刘先生', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 4, subtotal: 119.6 }, { productId: 103, productName: '手打柠檬茶', quantity: 4, subtotal: 48.0 }],
      totalAmount: 167.6, createdAt: new Date(Date.now() - 3600000 * 0.8).toISOString() },
    { id: 7, nickname: '赵姐', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 1, subtotal: 29.9 }, { productId: 102, productName: '秘制卤粉', quantity: 1, subtotal: 15.8 }],
      totalAmount: 45.7, remark: '先试试', createdAt: new Date(Date.now() - 3600000 * 0.7).toISOString() },
    { id: 8, nickname: '老周', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 2, subtotal: 59.8 }, { productId: 102, productName: '秘制卤粉', quantity: 1, subtotal: 15.8 }, { productId: 103, productName: '手打柠檬茶', quantity: 1, subtotal: 12.0 }],
      totalAmount: 87.6, remark: '小孩爱吃', createdAt: new Date(Date.now() - 3600000 * 0.6).toISOString() },
    { id: 9, nickname: '小陈', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 2, subtotal: 59.8 }],
      totalAmount: 59.8, createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString() },
    { id: 10, nickname: '美芳', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 1, subtotal: 29.9 }, { productId: 103, productName: '手打柠檬茶', quantity: 1, subtotal: 12.0 }],
      totalAmount: 41.9, remark: '明天在家', createdAt: new Date(Date.now() - 3600000 * 0.4).toISOString() },
    { id: 11, nickname: '阿杰', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 5, subtotal: 149.5 }, { productId: 102, productName: '秘制卤粉', quantity: 3, subtotal: 47.4 }],
      totalAmount: 196.9, remark: '公司同事也要', createdAt: new Date(Date.now() - 3600000 * 0.35).toISOString() },
    { id: 12, nickname: '李嬸', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 2, subtotal: 59.8 }],
      totalAmount: 59.8, createdAt: new Date(Date.now() - 3600000 * 0.3).toISOString() },
    { id: 13, nickname: '大刘', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 3, subtotal: 89.7 }],
      totalAmount: 89.7, remark: '要熟的', createdAt: new Date(Date.now() - 3600000 * 0.25).toISOString() },
    { id: 14, nickname: '小芳', isOrganizer: false,
      items: [{ productId: 102, productName: '秘制卤粉', quantity: 2, subtotal: 31.6 }, { productId: 103, productName: '手打柠檬茶', quantity: 1, subtotal: 12.0 }],
      totalAmount: 43.6, createdAt: new Date(Date.now() - 3600000 * 0.22).toISOString() },
    { id: 15, nickname: '老张', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 3, subtotal: 89.7 }, { productId: 102, productName: '秘制卤粉', quantity: 2, subtotal: 31.6 }, { productId: 103, productName: '手打柠檬茶', quantity: 3, subtotal: 36.0 }],
      totalAmount: 157.3, remark: '周末聚餐用', createdAt: new Date(Date.now() - 3600000 * 0.2).toISOString() },
    { id: 16, nickname: '陈老师', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 2, subtotal: 59.8 }],
      totalAmount: 59.8, createdAt: new Date(Date.now() - 3600000 * 0.18).toISOString() },
    { id: 17, nickname: '小王', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 1, subtotal: 29.9 }],
      totalAmount: 29.9, remark: '第一次参加', createdAt: new Date(Date.now() - 3600000 * 0.15).toISOString() },
    { id: 18, nickname: '刘姐', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 2, subtotal: 59.8 }, { productId: 103, productName: '手打柠檬茶', quantity: 2, subtotal: 24.0 }],
      totalAmount: 83.8, remark: '帮两家带的', createdAt: new Date(Date.now() - 3600000 * 0.12).toISOString() },
    { id: 19, nickname: '阿强', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 2, subtotal: 59.8 }, { productId: 102, productName: '秘制卤粉', quantity: 1, subtotal: 15.8 }],
      totalAmount: 75.6, createdAt: new Date(Date.now() - 3600000 * 0.1).toISOString() },
    { id: 20, nickname: '吴老板', isOrganizer: false,
      items: [{ productId: 101, productName: '金煌芒', quantity: 6, subtotal: 179.4 }, { productId: 102, productName: '秘制卤粉', quantity: 4, subtotal: 63.2 }, { productId: 103, productName: '手打柠檬茶', quantity: 5, subtotal: 60.0 }],
      totalAmount: 302.6, remark: '店里要用', createdAt: new Date(Date.now() - 3600000 * 0.05).toISOString() }
  ],

  // -------- 商品分类映射 --------
  categoryMap: {
    fruit: { name: '水果', emoji: '🍎' },
    noodle: { name: '卤粉', emoji: '🍜' },
    seafood: { name: '海鲜', emoji: '🦐' },
    nut: { name: '坚果', emoji: '🥜' },
    snack: { name: '零食', emoji: '🍿' },
    other: { name: '其他', emoji: '📦' }
  },

  // -------- 小龙人随机提示 --------
  mascotMessages: [
    '还差 3 人就成团啦！',
    '今天的芒果特别甜哦 🥭',
    '手快有，手慢无 ⚡',
    '你已经是接龙达人了！',
    '分享给邻居，大家一起买更划算~',
    '今天的接龙热度爆棚 🔥',
    '加购小吃更划算哦！'
  ]
};

// =============================================================
// 2. 工具函数
// =============================================================

// -------- 2.1 倒计时格式化 --------
function formatCountdown(deadlineStr) {
  var deadline = typeof deadlineStr === 'string' ? new Date(deadlineStr) : deadlineStr;
  var now = Date.now();
  var diff = deadline.getTime() - now;

  if (diff <= 0) return '已截止';

  var totalSeconds = Math.floor(diff / 1000);
  var totalMinutes = Math.floor(totalSeconds / 60);
  var totalHours = Math.floor(totalMinutes / 60);
  var totalDays = Math.floor(totalHours / 24);

  var seconds = totalSeconds % 60;
  var minutes = totalMinutes % 60;
  var hours = totalHours % 24;

  if (totalDays >= 1) {
    return totalDays + '天后截止';
  } else if (totalHours >= 1) {
    return '还剩 ' + totalHours + '小时' + minutes + '分';
  } else {
    var padSec = seconds < 10 ? '0' + seconds : '' + seconds;
    var padMin = minutes < 10 ? '0' + minutes : '' + minutes;
    return '仅剩 ' + padMin + '分' + padSec + '秒';
  }
}

// -------- 2.2 时间格式化 --------
function formatTime(dateStr) {
  var d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  var month = d.getMonth() + 1;
  var day = d.getDate();
  var hours = d.getHours();
  var minutes = d.getMinutes();
  return padZero(month) + '-' + padZero(day) + ' ' + padZero(hours) + ':' + padZero(minutes);
}

function padZero(n) {
  return n < 10 ? '0' + n : '' + n;
}

// -------- 2.3 进度百分比 --------
function getProgressPercent(current, target) {
  if (target <= 0) return 0;
  return Math.min(100, Math.round(current / target * 100));
}

// -------- 2.4 趣味提示 --------
function getFunTip(percent) {
  if (percent >= 90) {
    return { icon: '🎯', text: '最后一波，手慢无！', color: '#FF0000', blink: true };
  } else if (percent >= 60) {
    return { icon: '⚡', text: '快冲，马上成团！', color: '#FF6B6B' };
  } else if (percent >= 30) {
    return { icon: '🔥', text: '热度升温中', color: '#FF7A00' };
  } else {
    return { icon: '💪', text: '加油，就差你了！', color: '#999' };
  }
}

// -------- 2.5 进度条颜色 --------
function getProgressColor(percent) {
  if (percent >= 100) return '#4CAF50';
  if (percent >= 80) return '#FF6B6B';
  if (percent >= 50) return '#FFB347';
  return '#FF7A00';
}

// -------- 2.6 状态标签HTML --------
function getStatusBadge(status) {
  switch (status) {
    case 'active':
      return '<span class="solong-badge-active">🟢 进行中</span>';
    case 'achieved':
      return '<span class="solong-badge-achieved">🎉 已成团</span>';
    case 'closed':
      return '<span class="solong-badge-closed">🔒 已截单</span>';
    default:
      return '<span class="solong-badge-closed">🔒 已截单</span>';
  }
}

// -------- 2.7 分类Emoji --------
function getCategoryEmoji(category) {
  return solongData.categoryMap[category] ? solongData.categoryMap[category].emoji : '📦';
}

// -------- 2.8 分类中文名 --------
function getCategoryName(category) {
  return solongData.categoryMap[category] ? solongData.categoryMap[category].name : '其他';
}

// -------- 2.9 根据ID获取活动数据 --------
function getActivityById(id) {
  for (var i = 0; i < solongData.activities.length; i++) {
    if (solongData.activities[i].id === id) {
      return solongData.activities[i];
    }
  }
  if (solongData.detailActivity && solongData.detailActivity.id === id) {
    return solongData.detailActivity;
  }
  return null;
}

// -------- 2.10 分类大图标 --------
function getCategoryIcon(category) {
  return getCategoryEmoji(category);
}

// -------- 2.11 随机小龙人消息 --------
function getMascotMessage() {
  var messages = solongData.mascotMessages;
  var index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

// -------- 2.12 生成随机ID --------
function getRandomId() {
  return Math.floor(Math.random() * 100000) + 1;
}

// -------- 2.13 获取活动的主商品 --------
function getMainProduct(activity) {
  if (!activity.products) return null;
  for (var i = 0; i < activity.products.length; i++) {
    if (activity.products[i].isMain || activity.products[i].productType === 'main') return activity.products[i];
  }
  return activity.products[0];
}

// -------- 2.14 获取商品类型中文名称 --------
function getProductTypeName(type) {
  switch (type) {
    case 'main': return '主食';
    case 'snack': return '小吃';
    default: return '其他';
  }
}

// -------- 2.15 格式化商品明细文本 --------
function formatItems(items) {
  if (!items || items.length === 0) return '';
  var parts = [];
  for (var i = 0; i < items.length; i++) {
    parts.push(items[i].productName + '\u00D7' + items[i].quantity);
  }
  return parts.join('\u3001');
}

// -------- 2.16 计算总数（根据items） --------
function calcTotalQuantity(items) {
  if (!items) return 0;
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].quantity || 0;
  }
  return total;
}
