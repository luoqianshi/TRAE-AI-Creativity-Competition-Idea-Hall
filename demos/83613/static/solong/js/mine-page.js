/**
 * mine-page.js — 邻里接龙(Solong) "我的接龙" 页面交互逻辑
 * ============================================================
 * 依赖: solong-data.js (solongData 全局对象, 工具函数)
 *        solong-icons.js (icon() 图标函数)
 * 页面: mine.html
 */

document.addEventListener('DOMContentLoaded', function () {
  initMinePage();
});

// =============================================================
// 1. 页面初始化
// =============================================================
function initMinePage() {
  renderUserProfile();
  renderTabs();
  renderActivities('organized');
  initTabSwitch();
  initBackButton();
  startCountdownTimer();
}

// =============================================================
// 2. getUserLevel(count) — 计算等级称号
// =============================================================
function getUserLevel(count) {
  if (count >= 20) {
    return { icon: '\uD83C\uDF1F', title: '接龙传奇' };
  } else if (count >= 10) {
    return { icon: '\uD83D\uDC51', title: '接龙王' };
  } else if (count >= 5) {
    return { icon: '\uD83D\uDC09', title: '接龙达人' };
  } else {
    return { icon: '\uD83D\uDC23', title: '接龙新手' };
  }
}

// =============================================================
// 3. renderUserProfile() — 渲染用户信息面板
// =============================================================
function renderUserProfile() {
  var nickname = localStorage.getItem('solong_nickname') || '邻居';
  var participateCount = parseInt(localStorage.getItem('solong_participate_count'), 10) || 6;

  // 更新昵称
  var nameEl = document.getElementById('profileNickname');
  if (nameEl) nameEl.textContent = nickname;

  // 更新头像（取昵称首字）
  var avatarEl = document.getElementById('profileAvatar');
  if (avatarEl) avatarEl.textContent = nickname.charAt(0);

  // 更新等级
  var level = getUserLevel(participateCount);
  var levelEl = document.getElementById('profileLevel');
  if (levelEl) {
    levelEl.innerHTML = icon('crown', 14) + '<span>' + level.icon + ' ' + level.title + '</span>';
  }

  // 更新参与次数
  var countEl = document.getElementById('profileCount');
  if (countEl) countEl.textContent = participateCount;
}

// =============================================================
// 4. renderTabs() — 更新Tab计数
// =============================================================
function renderTabs() {
  var nickname = localStorage.getItem('solong_nickname') || '邻居';

  // 计算"我发起的"数量
  var organizedCount = 0;
  for (var i = 0; i < solongData.activities.length; i++) {
    if (solongData.activities[i].organizer === nickname) {
      organizedCount++;
    }
  }

  // 计算"我参与的"数量（模拟：所有活动）
  var participatedCount = solongData.activities.length;

  var orgCountEl = document.getElementById('tab-organized-count');
  if (orgCountEl) orgCountEl.textContent = organizedCount;

  var partCountEl = document.getElementById('tab-participated-count');
  if (partCountEl) partCountEl.textContent = participatedCount;
}

// =============================================================
// 5. renderActivities(type) — 根据 type 渲染活动列表
// type = 'organized' | 'participated'
// =============================================================
function renderActivities(type) {
  var container = document.getElementById('mine-activities');
  if (!container) return;

  var nickname = localStorage.getItem('solong_nickname') || '邻居';
  var list = [];

  if (type === 'organized') {
    // 我发起的：按 organizer 匹配
    for (var i = 0; i < solongData.activities.length; i++) {
      if (solongData.activities[i].organizer === nickname) {
        list.push(solongData.activities[i]);
      }
    }
  } else {
    // 我参与的：显示所有活动（模拟）
    list = solongData.activities;
  }

  // 空状态
  if (list.length === 0) {
    var emptyHtml = '';
    if (type === 'organized') {
      emptyHtml =
        '<div class="mine-empty-state">' +
          '<div class="mine-empty-icon">' + icon('empty', 64) + '</div>' +
          '<div class="mine-empty-text">还没有发起过接龙</div>' +
          '<div class="mine-empty-sub">快去试试吧！</div>' +
          '<button class="mine-empty-action" onclick="window.location.href=\'create.html\'">' +
            icon('create', 16) + ' 发起接龙' +
          '</button>' +
        '</div>';
    } else {
      emptyHtml =
        '<div class="mine-empty-state">' +
          '<div class="mine-empty-icon">' + icon('empty', 64) + '</div>' +
          '<div class="mine-empty-text">还没有参与过接龙</div>' +
          '<div class="mine-empty-sub">去逛逛吧！</div>' +
          '<button class="mine-empty-action" onclick="window.location.href=\'index.html\'">' +
            icon('home', 16) + ' 去逛逛' +
          '</button>' +
        '</div>';
    }
    container.innerHTML = emptyHtml;
    return;
  }

  // 渲染卡片
  var html = '';
  for (var k = 0; k < list.length; k++) {
    html += buildMineActivityCard(list[k], type, nickname);
  }
  container.innerHTML = html;

  // 事件委托
  container.addEventListener('click', function (e) {
    // 截单按钮
    var closeBtn = e.target.closest('.mine-btn-close');
    if (closeBtn) {
      var activityId = parseInt(closeBtn.getAttribute('data-id'), 10);
      handleCloseOrder(activityId);
      return;
    }

    // 卡片跳转
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
// 5a. buildMineActivityCard(activity, type, nickname) — 构建卡片HTML
// =============================================================
function buildMineActivityCard(activity, type, nickname) {
  var percent = getProgressPercent(activity.currentCount, activity.targetCount);
  var progressColor = getProgressColor(percent);
  var badgeHtml = getStatusBadge(activity.status);
  var countdownText = formatCountdown(activity.deadline);
  var isClosed = activity.status === 'closed';

  var closedClass = isClosed ? ' solong-card-closed' : '';

  // 操作按钮行（仅"我发起的"显示）
  var actionsHtml = '';
  if (type === 'organized') {
    var isActive = activity.status === 'active';
    var isAchieved = activity.status === 'achieved';

    if (isActive) {
      actionsHtml =
        '<div class="mine-card-actions">' +
          '<button class="mine-btn-close" data-id="' + activity.id + '">' +
            icon('close-circle', 14) + ' 截单' +
          '</button>' +
        '</div>';
    } else if (isAchieved) {
      actionsHtml =
        '<div class="mine-card-actions">' +
          '<span class="mine-btn-ended">' + icon('check', 14) + ' 已成团</span>' +
        '</div>';
    } else {
      actionsHtml =
        '<div class="mine-card-actions">' +
          '<span class="mine-btn-ended">' + icon('close', 14) + ' 已结束</span>' +
        '</div>';
    }
  }

  // 参与摘要（仅"我参与的"显示）
  var participateHtml = '';
  if (type === 'participated') {
    // 模拟参与记录：从 participants 中查找该活动的参与者中是否有当前用户昵称
    var myQty = 0;
    for (var p = 0; p < solongData.participants.length; p++) {
      var part = solongData.participants[p];
      // 用活动 organizer 作为简单匹配，或者随机给一个数量
      if (part.nickname === nickname) {
        myQty += part.quantity || 1;
      }
    }
    // 如果没匹配到，给个默认值（模拟）—— 使用活动ID求余得到一个有趣的数量
    if (myQty === 0) {
      myQty = (activity.id % 3) + 1;
    }
    participateHtml =
      '<div style="display:flex;align-items:center;gap:6px;margin-top:6px;">' +
        '<span class="mine-participate-badge">' +
          icon('person', 12) + ' 你参与了 ' + myQty + ' ' + (getMainProduct(activity) ? getMainProduct(activity).unit : '份') +
        '</span>' +
      '</div>';
  }

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
        // 进度条
        '<div style="margin-top: 8px;">' +
          '<div class="solong-progress-bar">' +
            '<div class="solong-progress-fill" style="width: ' + percent + '%; background: ' + progressColor + '; animation: none;"></div>' +
          '</div>' +
        '</div>' +
        // 进度文本 + 倒计时
        '<div class="solong-card-footer" style="padding-top: 6px; border-top: none; margin-top: 4px;">' +
          '<span style="font-size: 13px; color: #666;">' + activity.currentCount + '/' + activity.targetCount + ' \u00B7 ' + percent + '%</span>' +
          '<div class="solong-countdown">' +
            '\u23F1\uFE0F <span class="solong-countdown-time" data-deadline="' + activity.deadline + '">' + countdownText + '</span>' +
          '</div>' +
        '</div>' +
        // 参与摘要
        participateHtml +
        // 操作按钮（仅organized）
        actionsHtml +
      '</div>' +
    '</div>';
}

// =============================================================
// 6. initTabSwitch() — Tab点击切换
// =============================================================
function initTabSwitch() {
  var tabsContainer = document.getElementById('mine-tabs');
  if (!tabsContainer) return;

  tabsContainer.addEventListener('click', function (e) {
    var tab = e.target.closest('.mine-tab');
    if (!tab) return;
    if (tab.classList.contains('active')) return;

    // 切换激活状态
    var allTabs = tabsContainer.querySelectorAll('.mine-tab');
    for (var i = 0; i < allTabs.length; i++) {
      allTabs[i].classList.remove('active');
    }
    tab.classList.add('active');

    // 根据 data-tab 渲染
    var tabType = tab.getAttribute('data-tab');
    renderActivities(tabType);
  });
}

// =============================================================
// 7. handleCloseOrder(activityId) — 模拟截单操作
// =============================================================
function handleCloseOrder(activityId) {
  // 查找活动并更新状态
  var found = false;
  for (var i = 0; i < solongData.activities.length; i++) {
    if (solongData.activities[i].id === activityId) {
      if (solongData.activities[i].status === 'active') {
        solongData.activities[i].status = 'closed';
        found = true;
      }
      break;
    }
  }

  if (found) {
    alert('\u2705 \u5DF2\u6210\u529F\u622A\u5355\uFF01');
    // 重新渲染当前标签页
    var activeTab = document.querySelector('.mine-tab.active');
    if (activeTab) {
      var tabType = activeTab.getAttribute('data-tab');
      renderActivities(tabType);
    }
    // 更新Tab计数
    renderTabs();
  }
}

// =============================================================
// 8. initBackButton() — 返回按钮
// =============================================================
function initBackButton() {
  var backBtn = document.getElementById('mine-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = 'index.html';
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
