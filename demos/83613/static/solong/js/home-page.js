/**
 * home-page.js — 邻里接龙(Solong) 首页交互逻辑
 * ============================================================
 * 依赖: solong-data.js (solongData 全局对象, 工具函数)
 * 页面: index.html
 */

document.addEventListener('DOMContentLoaded', function () {
  initPage();
});

// =============================================================
// 1. 分类定义
// =============================================================
var CATEGORIES = [
  { key: 'all', label: '全部', emoji: '' },
  { key: 'fruit', label: '水果', emoji: '\uD83C\uDF4E' },
  { key: 'noodle', label: '卤粉', emoji: '\uD83C\uDF5C' },
  { key: 'seafood', label: '海鲜', emoji: '\uD83E\uDD90' },
  { key: 'nut', label: '坚果', emoji: '\uD83E\uDD5C' },
  { key: 'snack', label: '零食', emoji: '\uD83C\uDF7F' },
  { key: 'other', label: '其他', emoji: '\uD83D\uDCE6' }
];

// =============================================================
// 2. 页面初始化
// =============================================================
function initPage() {
  renderStats();
  renderCategories();
  renderActivities('all');
  initMascot();
  initHeaderButtons();
  startCountdownTimer();
}

// =============================================================
// 3. renderStats() — 渲染统计面板
// =============================================================
function renderStats() {
  var container = document.getElementById('solong-stats');
  if (!container) return;

  var stats = solongData.stats;

  container.innerHTML =
    '<div class="home-stats-inner">' +
      '<div class="home-stat-item">' +
        '<div class="home-stat-icon">' + icon('stats', 22) + '</div>' +
        '<div class="home-stat-value" id="stat-today">' + stats.todayAchieved + '</div>' +
        '<div class="home-stat-label">今日成团</div>' +
      '</div>' +
      '<div class="home-stat-divider"></div>' +
      '<div class="home-stat-item">' +
        '<div class="home-stat-icon">' + icon('hot', 22) + '</div>' +
        '<div class="home-stat-value" id="stat-activity">' + stats.activity + '%</div>' +
        '<div class="home-stat-label">活跃度</div>' +
      '</div>' +
      '<div class="home-stat-divider"></div>' +
      '<div class="home-stat-item">' +
        '<div class="home-stat-icon">' + icon('crown', 22) + '</div>' +
        '<div class="home-stat-value" id="stat-topuser">' + stats.topUser + '</div>' +
        '<div class="home-stat-label">达人榜 Top1</div>' +
      '</div>' +
    '</div>';
}

// =============================================================
// 4. renderCategories() — 渲染分类标签
// =============================================================
function renderCategories() {
  var container = document.getElementById('solong-categories');
  if (!container) return;

  var html = '';
  for (var i = 0; i < CATEGORIES.length; i++) {
    var cat = CATEGORIES[i];
    var isActive = (cat.key === 'all') ? ' solong-tag-active' : '';
    var label = cat.emoji ? cat.emoji + ' ' + cat.label : cat.label;
    html += '<span class="solong-tag' + isActive + '" data-category="' + cat.key + '">' + label + '</span>';
  }
  container.innerHTML = html;

  // 事件委托：点击分类标签
  container.addEventListener('click', function (e) {
    var target = e.target;
    if (target.classList.contains('solong-tag') || target.classList.contains('solong-tag-active')) {
      // 移除所有 active
      var tags = container.querySelectorAll('.solong-tag, .solong-tag-active');
      for (var j = 0; j < tags.length; j++) {
        tags[j].className = 'solong-tag';
      }
      // 激活当前
      target.className = 'solong-tag-active';
      var category = target.getAttribute('data-category');
      renderActivities(category);
    }
  });
}

// =============================================================
// 5. renderActivities(category) — 渲染接龙卡片
// =============================================================
function renderActivities(category) {
  var container = document.getElementById('solong-activities');
  if (!container) return;

  // 筛选
  var list = solongData.activities;
  var filtered = [];
  for (var i = 0; i < list.length; i++) {
    if (category === 'all' || list[i].category === category) {
      filtered.push(list[i]);
    }
  }

  // 空状态
  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="home-empty-state">' +
        '<div class="home-empty-icon">' + icon('empty', 56) + '</div>' +
        '<div class="home-empty-text">暂无此类接龙活动</div>' +
        '<div class="home-empty-sub">去看看其他分类吧~</div>' +
      '</div>';
    return;
  }

  // 渲染卡片
  var html = '';
  for (var k = 0; k < filtered.length; k++) {
    html += buildActivityCard(filtered[k]);
  }
  container.innerHTML = html;

  // 事件委托：卡片点击跳转
  container.addEventListener('click', function (e) {
    var card = e.target.closest('.solong-activity-card');
    if (card) {
      var id = card.getAttribute('data-id');
      if (id) {
        window.location.href = 'detail.html?id=' + id;
      }
    }
  });
}

// =============================================================
// 5a. buildActivityCard(activity) — 构建单张卡片HTML
// =============================================================
function buildActivityCard(activity) {
  var percent = getProgressPercent(activity.currentCount, activity.targetCount);
  var progressColor = getProgressColor(percent);
  var badgeHtml = getStatusBadge(activity.status);
  var countdownText = formatCountdown(activity.deadline);
  var isClosed = activity.status === 'closed';

  var closedClass = isClosed ? ' solong-card-closed' : '';

  return '' +
    '<div class="solong-activity-card' + closedClass + '" data-id="' + activity.id + '">' +
      // 图片占位区
      '<div class="solong-card-img" style="background: ' + activity.gradient + ';">' +
        '<span style="font-size: 48px; line-height: 1;">' + activity.emoji + '</span>' +
      '</div>' +
      // 信息区
      '<div class="solong-card-info" style="padding: 12px 14px 14px;">' +
        // 标题
        '<div class="solong-card-title">' + activity.title + '</div>' +
        // 价格 + 状态
        '<div style="display: flex; align-items: center; justify-content: space-between;">' +
          '<div class="solong-card-price">' +
            '\u00A5' + (getMainProduct(activity) ? getMainProduct(activity).price.toFixed(1) : '0.0') +
            '<span class="solong-card-price-unit"> /' + (getMainProduct(activity) ? getMainProduct(activity).unit : '份') + '</span>' +
          '</div>' +
          badgeHtml +
        '</div>' +
        // 进度条 + 倒计时
        '<div style="margin-top: 8px;">' +
          '<div class="solong-progress-bar">' +
            '<div class="solong-progress-fill" style="width: ' + percent + '%; background: ' + progressColor + '; animation: none;"></div>' +
          '</div>' +
        '</div>' +
        // 进度文本 + 倒计时
        '<div class="solong-card-footer" style="padding-top: 6px; border-top: none; margin-top: 4px;">' +
          '<span style="font-size: 13px; color: #666;">' + activity.currentCount + '/' + activity.targetCount + ' \u00B7 ' + percent + '%</span>' +
          '<div class="solong-countdown">' +
            icon('clock', 14) + ' <span class="solong-countdown-time" data-deadline="' + activity.deadline + '">' + countdownText + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

// =============================================================
// 6. initMascot() — 初始化小龙人吉祥物
// =============================================================
function initMascot() {
  var mascot = document.getElementById('solong-mascot');
  if (!mascot) return;

  mascot.addEventListener('click', function () {
    // 移除已有气泡
    var oldBubble = mascot.querySelector('.solong-mascot-bubble');
    if (oldBubble) {
      oldBubble.remove();
      return;
    }

    var msg = getMascotMessage();
    var bubble = document.createElement('div');
    bubble.className = 'solong-mascot-bubble';
    bubble.textContent = msg;
    mascot.appendChild(bubble);

    // 3秒后消失
    setTimeout(function () {
      if (bubble.parentNode) {
        bubble.remove();
      }
    }, 3000);
  });
}

// =============================================================
// 7. initHeaderButtons() — 标题栏按钮
// =============================================================
function initHeaderButtons() {
  var createBtn = document.getElementById('solong-header-create');
  if (createBtn) {
    createBtn.addEventListener('click', function () {
      window.location.href = 'create.html';
    });
  }
}

// =============================================================
// 9. startCountdownTimer() — 倒计时定时更新
// =============================================================
function startCountdownTimer() {
  setInterval(function () {
    var timeElements = document.querySelectorAll('.solong-countdown-time');
    for (var i = 0; i < timeElements.length; i++) {
      var el = timeElements[i];
      var deadline = el.getAttribute('data-deadline');
      if (deadline) {
        el.textContent = formatCountdown(deadline);
      }
    }
  }, 1000);
}
