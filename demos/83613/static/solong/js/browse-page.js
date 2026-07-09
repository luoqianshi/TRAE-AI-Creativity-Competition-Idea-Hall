/**
 * browse-page.js — 邻里接龙(Solong) 发现页交互逻辑
 * ============================================================
 * 依赖: solong-data.js (solongData 全局对象, 工具函数)
 *       solong-icons.js (icon() 函数)
 * 页面: browse.html
 */

document.addEventListener('DOMContentLoaded', function () {
  initBrowsePage();
});

// =============================================================
// 状态管理
// =============================================================
var browseState = {
  searchKeyword: '',
  statusFilter: 'all',
  sortBy: 'hot',
  displayCount: 4,       // 当前已显示条数
  isLoading: false
};

// 排序选项定义
var SORT_OPTIONS = [
  { key: 'hot', label: '按热度' },
  { key: 'newest', label: '按最新' },
  { key: 'deadline', label: '按截止时间' }
];

// 状态筛选标签定义
var STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '\uD83D\uDFE2 进行中' },
  { key: 'achieved', label: '\uD83C\uDF89 已成团' },
  { key: 'closed', label: '\uD83D\uDD12 已截单' }
];

// =============================================================
// 页面初始化
// =============================================================
function initBrowsePage() {
  renderSearchBar();
  renderFilterTabs();
  renderSortOptions();
  renderBrowseActivities();
  initBackButton();
  initSearchInput();
  initLoadMore();
  initSortDropdown();
  startBrowseCountdownTimer();
}

// =============================================================
// 1. renderSearchBar() — 搜索栏
// =============================================================
function renderSearchBar() {
  var wrap = document.getElementById('browse-search-wrap');
  if (!wrap) return;

  wrap.innerHTML =
    '<div class="browse-search-bar">' +
      '<span class="browse-search-icon">' + icon('search', 18) + '</span>' +
      '<input type="text" id="browse-search-input" placeholder="搜索接龙活动..." autocomplete="off">' +
    '</div>';
}

// =============================================================
// 2. renderFilterTabs() — 状态筛选标签
// =============================================================
function renderFilterTabs() {
  var wrap = document.getElementById('browse-filter-wrap');
  if (!wrap) return;

  var tabsHtml = '';
  for (var i = 0; i < STATUS_TABS.length; i++) {
    var tab = STATUS_TABS[i];
    var activeClass = (tab.key === 'all') ? ' active' : '';
    tabsHtml += '<span class="browse-status-tab' + activeClass + '" data-status="' + tab.key + '">' + tab.label + '</span>';
  }

  wrap.innerHTML =
    '<div class="browse-status-tabs" id="browse-status-tabs">' + tabsHtml + '</div>' +
    '<div class="browse-sort-wrap" id="browse-sort-wrap"></div>';

  // 事件委托：点击状态标签
  var tabsContainer = document.getElementById('browse-status-tabs');
  if (tabsContainer) {
    tabsContainer.addEventListener('click', function (e) {
      var tab = e.target.closest('.browse-status-tab');
      if (!tab) return;

      // 移除全部高亮
      var allTabs = tabsContainer.querySelectorAll('.browse-status-tab');
      for (var j = 0; j < allTabs.length; j++) {
        allTabs[j].classList.remove('active');
      }
      tab.classList.add('active');

      browseState.statusFilter = tab.getAttribute('data-status');
      browseState.displayCount = 4; // 重置显示数量
      renderBrowseActivities();
    });
  }
}

// =============================================================
// 3. renderSortOptions() — 排序选项
// =============================================================
function renderSortOptions() {
  var wrap = document.getElementById('browse-sort-wrap');
  if (!wrap) return;

  var activeSort = SORT_OPTIONS[0];
  for (var i = 0; i < SORT_OPTIONS.length; i++) {
    if (SORT_OPTIONS[i].key === browseState.sortBy) {
      activeSort = SORT_OPTIONS[i];
      break;
    }
  }

  var optionsHtml = '';
  for (var j = 0; j < SORT_OPTIONS.length; j++) {
    var opt = SORT_OPTIONS[j];
    var optActive = (opt.key === browseState.sortBy) ? ' active' : '';
    optionsHtml += '<div class="browse-sort-option' + optActive + '" data-sort="' + opt.key + '">' + opt.label + '</div>';
  }

  wrap.innerHTML =
    '<div class="browse-sort-btn" id="browse-sort-btn">' +
      '<span class="browse-sort-btn-icon">' + icon('sort', 14) + '</span>' +
      '<span id="browse-sort-label">' + activeSort.label + '</span>' +
    '</div>' +
    '<div class="browse-sort-dropdown" id="browse-sort-dropdown">' +
      optionsHtml +
    '</div>';
}

// =============================================================
// 4. renderBrowseActivities() — 渲染活动列表
// =============================================================
function renderBrowseActivities() {
  var container = document.getElementById('browse-activities');
  if (!container) return;

  var list = solongData.activities;
  var filtered = [];

  // 第一步：状态筛选
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    if (browseState.statusFilter === 'all' || item.status === browseState.statusFilter) {
      filtered.push(item);
    }
  }

  // 第二步：关键词搜索（标题匹配）
  var keyword = browseState.searchKeyword.trim().toLowerCase();
  if (keyword !== '') {
    var searchResult = [];
    for (var s = 0; s < filtered.length; s++) {
      if (filtered[s].title.toLowerCase().indexOf(keyword) !== -1) {
        searchResult.push(filtered[s]);
      }
    }
    filtered = searchResult;
  }

  // 第三步：排序
  filtered = sortActivities(filtered, browseState.sortBy);

  // 保存全量结果供分页使用
  browseState._allFiltered = filtered;

  // 第四步：截取当前显示数量
  var displayList = filtered.slice(0, browseState.displayCount);

  // 空状态
  if (displayList.length === 0) {
    container.innerHTML =
      '<div class="browse-empty-state">' +
        '<div class="browse-empty-icon">' + icon('empty', 64) + '</div>' +
        '<div class="browse-empty-text">没有找到匹配的接龙活动</div>' +
        '<div class="browse-empty-sub">试试其他关键词或筛选条件吧</div>' +
      '</div>';
    updateLoadMoreBtn(false);
    return;
  }

  // 渲染卡片
  var html = '';
  for (var k = 0; k < displayList.length; k++) {
    html += buildBrowseCard(displayList[k]);
  }
  container.innerHTML = html;

  // 卡片点击跳转
  container.addEventListener('click', function (e) {
    var card = e.target.closest('.solong-activity-card');
    if (card) {
      var id = card.getAttribute('data-id');
      if (id) {
        window.location.href = 'detail.html?id=' + id;
      }
    }
  });

  // 更新加载更多按钮
  var hasMore = browseState.displayCount < filtered.length;
  updateLoadMoreBtn(hasMore);
}

// =============================================================
// 4a. buildBrowseCard(activity) — 构建单张卡片（与首页一致）
// =============================================================
function buildBrowseCard(activity) {
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
        '<div class="solong-card-title">' + escapeHtml(activity.title) + '</div>' +
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
      '</div>' +
    '</div>';
}

// =============================================================
// 4b. sortActivities(list, sortBy) — 排序
// =============================================================
function sortActivities(list, sortBy) {
  var sorted = list.slice(); // 复制

  switch (sortBy) {
    case 'hot':
      // 按热度：currentCount / targetCount 百分比降序
      sorted.sort(function (a, b) {
        var pa = a.currentCount / a.targetCount;
        var pb = b.currentCount / b.targetCount;
        if (pb !== pa) return pb - pa;
        // 百分比相同则按总人数降序
        return b.currentCount - a.currentCount;
      });
      break;

    case 'newest':
      // 按最新：deadline 降序（越新发布的越靠前）
      // 这里使用 deadline 的创建时间近似，实际应按创建时间
      // 由于没有 createdAt 字段，用 id 倒序模拟
      sorted.sort(function (a, b) {
        return b.id - a.id;
      });
      break;

    case 'deadline':
      // 按截止时间：upcoming 优先（即将截止的在前）
      sorted.sort(function (a, b) {
        var da = new Date(a.deadline).getTime();
        var db = new Date(b.deadline).getTime();
        // 已过期的排在最后
        var now = Date.now();
        var aExpired = da <= now ? 1 : 0;
        var bExpired = db <= now ? 1 : 0;
        if (aExpired !== bExpired) return aExpired - bExpired;
        return da - db;
      });
      break;
  }

  return sorted;
}

// =============================================================
// 5. initSearchInput() — 搜索输入实时过滤
// =============================================================
function initSearchInput() {
  var input = document.getElementById('browse-search-input');
  if (!input) return;

  // 防抖
  var timer = null;
  input.addEventListener('input', function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      browseState.searchKeyword = input.value;
      browseState.displayCount = 4; // 重置显示数量
      renderBrowseActivities();
    }, 300);
  });
}

// =============================================================
// 6. initLoadMore() — 加载更多
// =============================================================
function initLoadMore() {
  var wrap = document.getElementById('browse-load-more-wrap');
  if (!wrap) return;

  wrap.addEventListener('click', function (e) {
    var btn = e.target.closest('.browse-load-more-btn');
    if (!btn) return;
    if (browseState.isLoading) return;

    browseState.isLoading = true;
    btn.classList.add('loading');

    // 模拟加载延迟
    setTimeout(function () {
      browseState.displayCount += 4;
      browseState.isLoading = false;
      renderBrowseActivities();
    }, 400);
  });
}

// =============================================================
// 6a. updateLoadMoreBtn(hasMore) — 更新加载更多按钮
// =============================================================
function updateLoadMoreBtn(hasMore) {
  var wrap = document.getElementById('browse-load-more-wrap');
  if (!wrap) return;

  if (!hasMore) {
    var total = browseState._allFiltered ? browseState._allFiltered.length : 0;
    if (total > 0) {
      wrap.innerHTML = '<div class="browse-load-end">\u2014 已展示全部 ' + total + ' 个活动 \u2014</div>';
    } else {
      wrap.innerHTML = '';
    }
    return;
  }

  wrap.innerHTML =
    '<div class="browse-load-more-btn" id="browse-load-more-btn">' +
      '<span class="browse-load-icon">' + icon('refresh', 14) + '</span>' +
      '加载更多' +
    '</div>';
}

// =============================================================
// 7. initBackButton() — 返回首页
// =============================================================
function initBackButton() {
  var backBtn = document.getElementById('browse-back-btn');
  if (backBtn) {
    // 填充返回图标
    backBtn.innerHTML = icon('back', 22);
    backBtn.addEventListener('click', function () {
      window.location.href = 'index.html';
    });
  }

  // 顶部搜索按钮
  var headerSearchBtn = document.getElementById('browse-header-search-btn');
  if (headerSearchBtn) {
    headerSearchBtn.innerHTML = icon('search', 20);
    headerSearchBtn.addEventListener('click', function () {
      var input = document.getElementById('browse-search-input');
      if (input) {
        input.focus();
        // 滚动到搜索栏位置
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }
}

// =============================================================
// 8. initSortDropdown() — 排序下拉菜单
// =============================================================
function initSortDropdown() {
  var sortBtn = document.getElementById('browse-sort-btn');
  var dropdown = document.getElementById('browse-sort-dropdown');
  if (!sortBtn || !dropdown) return;

  // 点击排序按钮切换下拉
  sortBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  // 点击选项
  dropdown.addEventListener('click', function (e) {
    var option = e.target.closest('.browse-sort-option');
    if (!option) return;

    var sortKey = option.getAttribute('data-sort');
    browseState.sortBy = sortKey;
    browseState.displayCount = 4; // 重置显示数量

    // 更新选项高亮
    var options = dropdown.querySelectorAll('.browse-sort-option');
    for (var i = 0; i < options.length; i++) {
      options[i].classList.remove('active');
    }
    option.classList.add('active');

    // 更新按钮文字
    var sortLabel = document.getElementById('browse-sort-label');
    if (sortLabel) {
      for (var j = 0; j < SORT_OPTIONS.length; j++) {
        if (SORT_OPTIONS[j].key === sortKey) {
          sortLabel.textContent = SORT_OPTIONS[j].label;
          break;
        }
      }
    }

    // 关闭下拉
    dropdown.classList.remove('open');

    // 重新渲染
    renderBrowseActivities();
  });

  // 点击页面其他位置关闭下拉
  document.addEventListener('click', function () {
    dropdown.classList.remove('open');
  });
}

// =============================================================
// 10. startBrowseCountdownTimer() — 倒计时定时更新
// =============================================================
function startBrowseCountdownTimer() {
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

// =============================================================
// 11. escapeHtml() — 简易HTML转义（内部使用）
// =============================================================
function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
