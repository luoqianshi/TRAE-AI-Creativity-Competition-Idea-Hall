/**
 * detail-page.js — 邻里接龙 详情页交互逻辑
 * ============================================================
 * 依赖 solong-data.js (solongData, formatCountdown, formatTime,
 *   getProgressPercent, getFunTip, getProgressColor, getCategoryName,
 *   getMascotMessage, getRandomId, getMainProduct, formatItems)
 *
 * 模块对照:
 *   A - 顶部栏
 *   B - 状态横幅
 *   C - 商品信息区
 *   C3 - 商品清单
 *   D - 进度展示区
 *   E - CTA按钮
 *   F - 参与列表
 *   G - 参与弹窗
 *   H - 庆祝动画
 */

/* =============================================================
   State
   ============================================================= */
var _currentActivity = null;
var _countdownTimer = null;
var _selectedTimeSlot = '';

/* =============================================================
   Init
   ============================================================= */
document.addEventListener('DOMContentLoaded', function () {
  initDetailPage();
});

function initDetailPage() {
  var activity = getDetailActivity();
  if (!activity) {
    showNotFound();
    return;
  }
  _currentActivity = activity;

  // 挂载弹窗事件（只挂一次）
  document.getElementById('cancelModalBtn').addEventListener('click', closeParticipateModal);
  document.getElementById('submitParticipateBtn').addEventListener('click', handleParticipate);
  document.getElementById('participateModal').addEventListener('click', function (e) {
    if (e.target === this) closeParticipateModal();
  });

  // 初始化时间槽点击
  initTimeSlotSelection();

  renderStatusBanner(activity);
  renderDetailInfo(activity);
  renderProductList(activity);
  renderProgress(activity);
  renderParticipants(activity.participants || getDefaultParticipants());
  initCTAButton(activity);
  initShareButton();
  initBackButton();
  initMascot();
  startCountdown(activity.deadline);

  // 已成团 → 庆祝动画
  if (activity.status === 'achieved') {
    setTimeout(triggerCelebration, 500);
  }
}

/* =============================================================
   1. getDetailActivity — 获取当前活动数据
   ============================================================= */
function getDetailActivity() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');

  if (id !== null && id !== '') {
    var numId = parseInt(id, 10);
    if (isNaN(numId)) return null;

    // 先在 activities 列表中查找
    for (var i = 0; i < solongData.activities.length; i++) {
      if (solongData.activities[i].id === numId) {
        // 附上默认 participants
        var act = solongData.activities[i];
        act.participants = act.participants || null;
        return act;
      }
    }
    // 再检查 detailActivity
    if (solongData.detailActivity && solongData.detailActivity.id === numId) {
      return solongData.detailActivity;
    }
    return null;
  }

  // 无 id 参数，使用默认 detailActivity
  return solongData.detailActivity;
}

/* =============================================================
   2. showNotFound — 404 页面
   ============================================================= */
function showNotFound() {
  var container = document.querySelector('.solong-container');
  if (!container) return;

  container.innerHTML =
    '<div class="solong-not-found">' +
      '<div class="solong-not-found-icon">' + icon('search', 48) + '</div>' +
      '<h2 style="font-size:18px;font-weight:600;margin-bottom:8px;">该接龙不存在</h2>' +
      '<p style="font-size:14px;color:var(--solong-text-disabled);">该接龙不存在或已被删除</p>' +
      '<button onclick="window.location.href=\'index.html\'" class="solong-btn-primary" ' +
        'style="margin-top:24px;width:auto;padding:0 32px;display:inline-flex;">返回首页</button>' +
    '</div>';

  // 隐藏 mascot
  var mascot = document.getElementById('mascot');
  if (mascot) mascot.style.display = 'none';
}

/* =============================================================
   3. renderStatusBanner — 状态横幅 (B)
   ============================================================= */
function renderStatusBanner(activity) {
  var banner = document.getElementById('statusBanner');
  if (!banner) return;

  // 清除之前的 class
  banner.className = 'solong-status-banner ' + activity.status;

  switch (activity.status) {
    case 'active':
      banner.innerHTML = '<span style="color:#4CAF50;">' + icon('check', 16) + '</span> 进行中 · 火热报名中';
      break;
    case 'achieved':
      banner.innerHTML = '<span style="color:#FFD700;">' + icon('celebrate', 16) + '</span> 已成团 · 已超出目标人数！';
      break;
    case 'closed':
      banner.innerHTML = icon('close', 16) + ' 已截单 · 此接龙已结束';
      break;
    default:
      banner.className = 'solong-status-banner closed';
      banner.innerHTML = icon('close', 16) + ' 已截单 · 此接龙已结束';
  }
}

/* =============================================================
   4. renderDetailInfo — 商品信息区 (C)
   ============================================================= */
function renderDetailInfo(activity) {
  // C1: 大图占位
  var imgEl = document.getElementById('detailImage');
  if (imgEl) {
    imgEl.style.background = activity.gradient || 'var(--solong-border)';
    imgEl.innerHTML = '<span style="font-size:64px;">' + (activity.emoji || '&#x1F4E6;') + '</span>';
  }

  // C2: 标题
  var titleEl = document.getElementById('detailTitle');
  if (titleEl) titleEl.textContent = activity.title;

  // C3: 描述
  var descEl = document.getElementById('detailDescription');
  if (descEl) {
    if (activity.description) {
      descEl.textContent = activity.description;
      descEl.style.display = '';
    } else {
      descEl.style.display = 'none';
    }
  }

  // C4: 团长信息
  var orgEl = document.getElementById('detailOrganizer');
  if (orgEl) {
    orgEl.innerHTML =
      icon('person', 16) + ' 团长：' + escapeHtml(activity.organizer) +
      ' · ' + icon('category', 16) + ' ' + getCategoryName(activity.category) + '类';
  }

  // C5: 目标（价格已移除，改用商品清单卡片）
  var targetEl = document.getElementById('detailTarget');
  if (targetEl) {
    targetEl.innerHTML = icon('package', 18) + ' 目标：<span id="targetCount">' + activity.targetCount + '</span> 人';
  }

  // C6: 倒计时（占位，startCountdown 持续更新）
  var countEl = document.getElementById('detailCountdown');
  if (countEl) countEl.innerHTML = icon('clock', 18) + ' ' + formatCountdown(activity.deadline);
}

/* =============================================================
   4b. renderProductList — 商品清单卡片 (C3)
   ============================================================= */
function renderProductList(activity) {
  var container = document.getElementById('productList');
  if (!container) return;

  var products = activity.products || [];
  if (products.length === 0) {
    container.innerHTML = '<p style="color:var(--solong-text-disabled);font-size:14px;">暂无商品信息</p>';
    return;
  }

  var html = '<div class="solong-product-list">';
  for (var i = 0; i < products.length; i++) {
    var p = products[i];
    var isMain = p.isMain || p.productType === 'main';
    var badgeHtml = isMain
      ? '<span class="solong-badge-main">\uD83C\uDF5C 主食</span>'
      : '<span class="solong-badge-addon">\uD83C\uDF6A 小吃</span>';
    var descHtml = p.description
      ? '<div class="solong-product-item-desc">' + escapeHtml(p.description) + '</div>'
      : '';

    html +=
      '<div class="solong-product-item">' +
        '<div class="solong-product-item-icon">' + (isMain ? '\uD83C\uDF5C' : '\uD83C\uDF6A') + '</div>' +
        '<div class="solong-product-item-body">' +
          '<div class="solong-product-item-name">' +
            '<span>' + escapeHtml(p.name) + '</span>' +
            badgeHtml +
          '</div>' +
          descHtml +
          '<div class="solong-product-item-price">¥' + p.price.toFixed(2) + ' / ' + escapeHtml(p.unit) + '</div>' +
        '</div>' +
      '</div>';
  }
  html += '</div>';

  container.innerHTML = html;
}

/* =============================================================
   5. renderProgress — 进度展示区 (D)
   ============================================================= */
function renderProgress(activity) {
  var percent = getProgressPercent(activity.currentCount, activity.targetCount);
  var fill = document.getElementById('progressFill');
  if (!fill) return;

  // 先归零，再动画过渡到目标宽度
  fill.style.transition = 'none';
  fill.style.width = '0%';

  // 强制重排
  fill.offsetHeight; // eslint-disable-line no-unused-expressions

  fill.style.transition = 'width 0.8s ease';

  requestAnimationFrame(function () {
    fill.style.width = percent + '%';

    // 根据进度切换颜色
    if (percent >= 100) {
      fill.style.background = 'linear-gradient(135deg, #4CAF50, #66BB6A)';
    } else if (percent >= 80) {
      fill.style.background = 'linear-gradient(135deg, #FF6B6B, #FF8E8E)';
    } else {
      fill.style.background = '';
    }
  });

  // 进度文字
  var textEl = document.getElementById('progressText');
  if (textEl) {
    textEl.textContent = percent + '% · 当前 ' + activity.currentCount + '/' + activity.targetCount + ' 人';
  }

  // 趣味提示
  var tip = getFunTip(percent);
  var tipEl = document.getElementById('funTip');
  if (tipEl) {
    tipEl.innerHTML =
      '<span style="font-size:16px;">' + tip.icon + '</span>' +
      '<span style="color:' + tip.color + ';">' + escapeHtml(tip.text) + '</span>';

    // 清除旧动画
    tipEl.style.animation = 'none';
    tipEl.offsetHeight; // eslint-disable-line no-unused-expressions

    if (tip.blink) {
      tipEl.style.animation = 'solong-blink 1s ease-in-out infinite';
    }
  }
}

/* =============================================================
   5b. initTimeSlotSelection — 时间槽选择初始化
   ============================================================= */
function initTimeSlotSelection() {
  var group = document.getElementById('timeSlotGroup');
  var customInput = document.getElementById('customTimeInput');
  if (!group) return;

  // 用事件委托
  group.addEventListener('click', function(e) {
    var slot = e.target.closest('.modal-time-slot');
    if (!slot) return;
    // 取消其他选中
    var all = group.querySelectorAll('.modal-time-slot');
    for (var i = 0; i < all.length; i++) {
      all[i].classList.remove('selected');
    }
    slot.classList.add('selected');

    var timeVal = slot.getAttribute('data-time');
    if (timeVal === '其他') {
      // 显示自定义输入框
      _selectedTimeSlot = '';
      if (customInput) {
        customInput.classList.remove('solong-hidden');
        customInput.focus();
      }
    } else {
      // 隐藏自定义输入框
      if (customInput) {
        customInput.classList.add('solong-hidden');
        customInput.value = '';
      }
      _selectedTimeSlot = timeVal;
    }

    // 清除错误
    var errEl = document.getElementById('timeError');
    if (errEl) errEl.classList.add('solong-hidden');
  });

  // 自定义输入时同步到 _selectedTimeSlot
  if (customInput) {
    customInput.addEventListener('input', function() {
      _selectedTimeSlot = customInput.value.trim();
      if (_selectedTimeSlot) {
        var errEl = document.getElementById('timeError');
        if (errEl) errEl.classList.add('solong-hidden');
      }
    });
  }
}

/* =============================================================
   6. renderParticipants — 参与列表 (F)
   ============================================================= */
function renderParticipants(participants) {
  var list = document.getElementById('participantList');
  if (!list) return;

  // 按时间倒序
  var sorted = participants.slice().sort(function (a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // 更新标题人数
  var titleEl = document.getElementById('participantTitle');
  if (titleEl) {
    titleEl.innerHTML = icon('stats', 18) + ' 接龙名单（' + sorted.length + '人）';
  }

  var html = '';
  for (var i = 0; i < sorted.length; i++) {
    var p = sorted[i];
    var nameDisplay = p.isOrganizer ? icon('crown', 16) + ' ' + escapeHtml(p.nickname) : escapeHtml(p.nickname);
    var remarkHtml = p.remark
      ? '<div class="solong-participant-remark">' + escapeHtml(p.remark) + '</div>'
      : '';

    // 商品明细（items），使用 formatItems 工具函数
    var itemsHtml = '';
    if (p.items && p.items.length > 0) {
      itemsHtml = '<div class="solong-participant-items">' + formatItems(p.items) + '</div>';
    }

    // 合计金额
    var totalHtml = '';
    if (p.totalAmount !== undefined && p.totalAmount !== null) {
      totalHtml = '<div class="solong-participant-total">¥' + p.totalAmount.toFixed(2) + '</div>';
    }

    // 小区 + 送达时间
    var extraHtml = '';
    if (p.community || p.timeSlot) {
      var parts = [];
      if (p.community) parts.push(escapeHtml(p.community));
      if (p.timeSlot) parts.push(escapeHtml(p.timeSlot));
      extraHtml = '<div class="solong-participant-remark">📍 ' + parts.join(' · ') + '</div>';
    }

    html +=
      '<div class="solong-participant-item">' +
        '<div class="solong-participant-avatar">' + escapeHtml(p.nickname.charAt(0)) + '</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div class="solong-participant-name">' +
            '<span class="solong-participant-num">' + (i + 1) + '.</span>' +
            '<span>' + nameDisplay + '</span>' +
          '</div>' +
          itemsHtml +
          totalHtml +
          extraHtml +
          remarkHtml +
        '</div>' +
        '<div class="solong-participant-time">' + formatTime(p.createdAt) + '</div>' +
      '</div>';
  }

  list.innerHTML = html;
}

/* =============================================================
   7. initCTAButton — 参与按钮 (E)
   ============================================================= */
function initCTAButton(activity) {
  var btn = document.getElementById('ctaButton');
  if (!btn) return;

  // 重置样式
  btn.className = 'solong-cta-button';
  btn.style.background = '';
  btn.style.pointerEvents = '';
  btn.style.cursor = '';
  btn.onclick = null;

  switch (activity.status) {
    case 'active':
      btn.innerHTML = icon('target', 18) + ' 我要接龙';
      btn.onclick = openParticipateModal;
      break;

    case 'achieved':
      btn.style.background = 'linear-gradient(135deg, #4CAF50, #66BB6A)';
      btn.innerHTML = icon('celebrate', 18) + ' 已成团，还可参与';
      btn.onclick = openParticipateModal;
      break;

    case 'closed':
      btn.className = 'solong-cta-button solong-cta-disabled';
      btn.innerHTML = icon('close', 18) + ' 已截单';
      break;

    default:
      btn.className = 'solong-cta-button solong-cta-disabled';
      btn.innerHTML = icon('close', 18) + ' 已截单';
  }
}

/* =============================================================
   8. 参与弹窗 (G)
   ============================================================= */
function openParticipateModal() {
  var modal = document.getElementById('participateModal');
  if (!modal) return;

  // 清空表单 + 错误
  document.getElementById('nicknameInput').value = '';
  document.getElementById('remarkInput').value = '';
  document.getElementById('communitySelect').value = '';
  hideError('nicknameError');
  hideError('productError');
  hideError('communityError');
  hideError('timeError');
  document.getElementById('nicknameInput').classList.remove('solong-input-error');

  // 重置时间槽
  _selectedTimeSlot = '';
  var timeSlots = document.querySelectorAll('.modal-time-slot');
  for (var ts = 0; ts < timeSlots.length; ts++) {
    timeSlots[ts].classList.remove('selected');
  }
  var customInput = document.getElementById('customTimeInput');
  if (customInput) {
    customInput.classList.add('solong-hidden');
    customInput.value = '';
  }

  // 填充商品选择列表
  var products = _currentActivity.products || [];
  var selection = document.getElementById('productSelection');
  if (selection) {
    var html = '';
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      var isMain = p.isMain || p.productType === 'main';
      var badgeHtml = isMain
        ? '<span class="solong-badge-main">\uD83C\uDF5C 主食</span>'
        : '<span class="solong-badge-addon">\uD83C\uDF6A 小吃</span>';
      var defaultVal = isMain ? '1' : '0';

      html +=
        '<div class="solong-product-row">' +
          '<div class="solong-product-row-info">' +
            '<div class="solong-product-row-name">' +
              '<span>' + escapeHtml(p.name) + '</span>' +
              badgeHtml +
            '</div>' +
            '<div class="solong-product-row-price">¥' + p.price.toFixed(2) + ' / ' + escapeHtml(p.unit) + '</div>' +
          '</div>' +
          '<input type="number" class="solong-input solong-qty-input" ' +
            'data-product-id="' + p.id + '" ' +
            'data-product-name="' + escapeHtml(p.name) + '" ' +
            'data-price="' + p.price + '" ' +
            'min="0" value="' + defaultVal + '" ' +
            'oninput="updateModalTotal()">' +
        '</div>';
    }
    selection.innerHTML = html;
  }

  // 更新合计
  updateModalTotal();

  modal.classList.remove('solong-hidden');
}

/**
 * 更新弹窗中选购商品的合计金额
 */
function updateModalTotal() {
  var totalEl = document.getElementById('modalTotal');
  if (!totalEl) return;

  var inputs = document.querySelectorAll('#productSelection .solong-qty-input');
  var total = 0;
  for (var i = 0; i < inputs.length; i++) {
    var qty = parseInt(inputs[i].value, 10);
    if (isNaN(qty)) qty = 0;
    var price = parseFloat(inputs[i].getAttribute('data-price'));
    total += qty * price;
  }
  totalEl.textContent = '合计：¥' + total.toFixed(2);
}

function closeParticipateModal() {
  var modal = document.getElementById('participateModal');
  if (modal) modal.classList.add('solong-hidden');
}

function hideError(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add('solong-hidden');
}

function showError(id, msg) {
  var el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.classList.remove('solong-hidden');
  }
}

/* =============================================================
   9. handleParticipate — 提交参与
   ============================================================= */
function handleParticipate() {
  var nickname = document.getElementById('nicknameInput').value.trim();
  var remark = document.getElementById('remarkInput').value.trim();
  var community = document.getElementById('communitySelect').value;

  // 重置错误
  hideError('nicknameError');
  hideError('productError');
  hideError('communityError');
  hideError('timeError');
  document.getElementById('nicknameInput').classList.remove('solong-input-error');

  var valid = true;

  // 校验昵称
  if (!nickname || nickname.length < 2 || nickname.length > 20) {
    showError('nicknameError', '昵称需为2-20个字符');
    document.getElementById('nicknameInput').classList.add('solong-input-error');
    valid = false;
  }

  // 校验小区
  if (!community) {
    showError('communityError', '请选择您所在的小区');
    valid = false;
  }

  // 校验送达时间
  if (!_selectedTimeSlot) {
    showError('timeError', '请选择期望送达时间');
    valid = false;
  }

  // 收集商品选择
  var qtyInputs = document.querySelectorAll('#productSelection .solong-qty-input');
  var items = [];
  var hasAny = false;
  var totalAmount = 0;

  for (var i = 0; i < qtyInputs.length; i++) {
    var input = qtyInputs[i];
    var qty = parseInt(input.value, 10);
    if (isNaN(qty)) qty = 0;
    if (qty > 0) {
      hasAny = true;
      var price = parseFloat(input.getAttribute('data-price'));
      var subtotal = qty * price;
      items.push({
        productId: parseInt(input.getAttribute('data-product-id'), 10),
        productName: input.getAttribute('data-product-name'),
        quantity: qty,
        subtotal: parseFloat(subtotal.toFixed(2))
      });
      totalAmount += subtotal;
    }
  }

  // 校验：至少选择一件商品
  if (!hasAny) {
    showError('productError', '请至少选择一件商品');
    valid = false;
  }

  if (!valid) return;

  totalAmount = parseFloat(totalAmount.toFixed(2));

  // 构建新参与者对象（多商品结构 + 小区 + 送达时间）
  var newParticipant = {
    id: getRandomId(),
    nickname: nickname,
    community: community,
    timeSlot: _selectedTimeSlot,
    items: items,
    totalAmount: totalAmount,
    remark: remark || '',
    isOrganizer: false,
    createdAt: new Date().toISOString()
  };

  // 加入列表
  var participants = solongData.participants || getDefaultParticipants();
  participants.push(newParticipant);

  // 更新活动计数（增加一位参与者）
  _currentActivity.currentCount += 1;

  // 关闭弹窗
  closeParticipateModal();

  // Toast
  showSuccessToast(nickname + '，参与成功！');

  // 重新渲染进度（动画）
  renderProgress(_currentActivity);

  // 重新渲染参与者列表
  renderParticipants(participants);

  // 高亮新记录（列表第一项）
  var items = document.querySelectorAll('.solong-participant-item');
  if (items.length > 0) {
    items[0].classList.add('solong-participant-new');
  }

  // 判断是否达成目标
  if (_currentActivity.currentCount >= _currentActivity.targetCount && _currentActivity.status === 'active') {
    _currentActivity.status = 'achieved';
    renderStatusBanner(_currentActivity);
    initCTAButton(_currentActivity);
    setTimeout(triggerCelebration, 500);
  }
}

/* =============================================================
   10. showSuccessToast — 成功提示
   ============================================================= */
function showSuccessToast(msg) {
  var container = document.getElementById('toastContainer');
  if (!container) return;

  var toast = document.createElement('div');
  toast.className = 'solong-toast solong-toast-success';
  toast.textContent = msg;
  container.appendChild(toast);

  setTimeout(function () {
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(function () {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 2500);
}

/* =============================================================
   11. startCountdown — 实时倒计时
   ============================================================= */
function startCountdown(deadline) {
  var el = document.getElementById('detailCountdown');
  if (!el) return;

  if (_countdownTimer) {
    clearInterval(_countdownTimer);
    _countdownTimer = null;
  }

  function update() {
    var text = formatCountdown(deadline);
    el.innerHTML = icon('clock', 18) + ' ' + text;

    // 距截止 < 2h 红色闪烁
    var now = Date.now();
    var diff = new Date(deadline).getTime() - now;
    if (diff > 0 && diff < 2 * 60 * 60 * 1000) {
      el.classList.add('solong-countdown-blink');
    } else {
      el.classList.remove('solong-countdown-blink');
    }

    // 过期自动切换为 closed
    if (diff <= 0 && _currentActivity && _currentActivity.status === 'active') {
      _currentActivity.status = 'closed';
      renderStatusBanner(_currentActivity);
      initCTAButton(_currentActivity);
      el.classList.remove('solong-countdown-blink');
    }
  }

  update();
  _countdownTimer = setInterval(update, 1000);
}

/* =============================================================
   12. triggerCelebration — 庆祝动画 (H)
   ============================================================= */
function triggerCelebration() {
  var container = document.getElementById('celebrationContainer');
  if (!container) return;

  // 重置
  container.innerHTML = '';
  container.classList.remove('solong-hidden');
  container.style.opacity = '1';

  // 彩色圆点 (confetti)
  var colors = [
    '#FF6B6B', '#FFB347', '#4CAF50', '#FF7A00', '#A1C4FD',
    '#F093FB', '#FFD700', '#66BB6A', '#FF758C', '#89F7FE'
  ];

  for (var i = 0; i < 30; i++) {
    var dot = document.createElement('div');
    dot.className = 'solong-confetti';
    dot.style.left = Math.random() * 100 + '%';
    dot.style.top = '-10px';
    dot.style.background = colors[Math.floor(Math.random() * colors.length)];
    var size = 6 + Math.random() * 8;
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';
    dot.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
    dot.style.animationDelay = (Math.random() * 1.0) + 's';
    container.appendChild(dot);
  }

  // 大标题
  var title = document.createElement('div');
  title.className = 'solong-celebration-title';
  title.textContent = '&#x1F389; 恭喜成团！';
  container.appendChild(title);

  // 3 秒后渐隐
  setTimeout(function () {
    container.style.transition = 'opacity 0.6s ease';
    container.style.opacity = '0';
    setTimeout(function () {
      container.classList.add('solong-hidden');
      container.style.opacity = '';
      container.innerHTML = '';
    }, 600);
  }, 3000);
}

/* =============================================================
   13. initMascot — 小龙人互动
   ============================================================= */
function initMascot() {
  var mascot = document.getElementById('mascot');
  if (!mascot) return;

  mascot.addEventListener('click', function () {
    // 移除已有气泡
    var existing = document.querySelector('.solong-mascot-bubble');
    if (existing) {
      existing.remove();
      return;
    }

    var bubble = document.createElement('div');
    bubble.className = 'solong-mascot-bubble';
    bubble.textContent = getMascotMessage();
    mascot.appendChild(bubble);

    // 3 秒后自动消失
    setTimeout(function () {
      if (bubble.parentNode) {
        bubble.parentNode.removeChild(bubble);
      }
    }, 3000);
  });
}

/* =============================================================
   14. initShareButton — 分享（含商品数据的分享卡片）
   ============================================================= */
function initShareButton() {
  var shareBtn = document.getElementById('shareBtn');
  var shareModal = document.getElementById('shareModal');
  var closeBtn = document.getElementById('closeShareBtn');
  var downloadBtn = document.getElementById('downloadQrcodeBtn');
  var qrcodeImg = document.getElementById('qrcodeImg');

  if (!shareBtn || !shareModal) return;

  shareBtn.addEventListener('click', function() {
    var activity = _currentActivity;
    if (!activity) return;

    // ---- 填充分享卡片数据 ----

    // 标题
    var titleEl = document.getElementById('shareCardTitle');
    if (titleEl) titleEl.textContent = activity.title;

    // 团长
    var orgEl = document.getElementById('shareCardOrganizer');
    if (orgEl) orgEl.innerHTML = '\uD83D\uDC64 团长：' + escapeHtml(activity.organizer);

    // 状态
    var statusEl = document.getElementById('shareCardStatus');
    if (statusEl) {
      var statusMap = {
        active: '\uD83D\uDFE2 进行中',
        achieved: '\uD83C\uDF89 已成团',
        closed: '\uD83D\uDD12 已截单'
      };
      var statusText = statusMap[activity.status] || '\uD83D\uDD12 已截单';
      var statusColor = activity.status === 'active' ? '#4CAF50' : (activity.status === 'achieved' ? '#FFD700' : '#999');
      statusEl.textContent = statusText;
      statusEl.style.background = statusColor;
    }

    // 商品清单
    var productsEl = document.getElementById('shareCardProducts');
    if (productsEl && activity.products) {
      var pHtml = '';
      for (var pi = 0; pi < activity.products.length; pi++) {
        var p = activity.products[pi];
        var isMain = p.isMain || p.productType === 'main';
        var tag = isMain ? '\uD83C\uDF5C' : '\uD83C\uDF6A';
        pHtml += '<div>' + tag + ' ' + escapeHtml(p.name) + ' \u00A5' + p.price.toFixed(1) + '/' + escapeHtml(p.unit) + '</div>';
      }
      productsEl.innerHTML = pHtml;
    }

    // 参与人数进度
    var progressEl = document.getElementById('shareCardProgress');
    if (progressEl) {
      progressEl.textContent = activity.currentCount + '/' + activity.targetCount;
    }

    // 截止时间 — 显示具体时间点
    var deadlineEl = document.getElementById('shareCardDeadline');
    var deadlineLabel = document.getElementById('shareCardDeadlineLabel');
    if (deadlineEl && activity.deadline) {
      var d = typeof activity.deadline === 'string' ? new Date(activity.deadline) : activity.deadline;
      var now = Date.now();
      var diff = d.getTime() - now;

      // 显示具体时间
      var hours = d.getHours();
      var mins = d.getMinutes();
      var timeStr = '今晚 ' + hours + ':' + (mins < 10 ? '0' + mins : mins);

      // 如果不在今天，显示日期
      var today = new Date();
      if (d.getDate() !== today.getDate() || d.getMonth() !== today.getMonth()) {
        timeStr = (d.getMonth() + 1) + '/' + d.getDate() + ' ' + hours + ':' + (mins < 10 ? '0' + mins : mins);
      }

      if (deadlineLabel) deadlineLabel.textContent = timeStr;

      // 倒计时文案（小字）
      var countdownText = '';
      if (diff <= 0) {
        countdownText = '已截止';
      } else {
        var totalMinutes = Math.floor(diff / 60000);
        if (totalMinutes < 60) {
          countdownText = '仅剩 ' + totalMinutes + ' 分钟';
        } else if (totalMinutes < 1440) {
          countdownText = '仅剩 ' + Math.floor(totalMinutes / 60) + ' 小时';
        } else {
          countdownText = Math.floor(totalMinutes / 1440) + ' 天后截止';
        }
      }
      // 倒计时放在时间下方作为小字
      var countdownSmall = deadlineEl.querySelector('.countdown-small');
      if (!countdownSmall) {
        countdownSmall = document.createElement('div');
        countdownSmall.className = 'countdown-small';
        countdownSmall.style.cssText = 'font-size:10px;color:#ccc;margin-top:1px;font-weight:400;';
        deadlineEl.appendChild(countdownSmall);
      }
      countdownSmall.textContent = countdownText;
    }

    // 小区
    var communityEl = document.getElementById('shareCardCommunity');
    if (communityEl) {
      if (activity.community && activity.community.length > 0) {
        communityEl.textContent = activity.community.join('/');
      } else {
        communityEl.textContent = '\u5168\u5C0F\u533A';
      }
    }

    // 二维码（编码当前页面 URL）
    var pageUrl = window.location.href;
    var encodedUrl = encodeURIComponent(pageUrl);
    if (qrcodeImg) {
      qrcodeImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodedUrl;
    }

    shareModal.classList.remove('solong-hidden');
  });

  // 关闭弹窗
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      shareModal.classList.add('solong-hidden');
    });
  }
  shareModal.addEventListener('click', function(e) {
    if (e.target === shareModal) {
      shareModal.classList.add('solong-hidden');
    }
  });

  // 保存图片 — 用 Canvas 绘制高清分享卡片
  if (downloadBtn) {
    downloadBtn.addEventListener('click', function() {
      var activity = _currentActivity;
      if (!activity) return;

      downloadBtn.textContent = '生成中...';
      downloadBtn.disabled = true;

      // 加载二维码图片到 Image 对象
      var qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.src = document.getElementById('qrcodeImg').src || '';

      var timeout = setTimeout(function() {
        drawCard(); // 超时也继续
      }, 3000);

      if (qrImg.src) {
        qrImg.onload = function() {
          clearTimeout(timeout);
          drawCard();
        };
        qrImg.onerror = function() {
          clearTimeout(timeout);
          drawCard(); // 加载失败也继续，跳过二维码
        };
      } else {
        drawCard();
      }

      function drawCard() {
        var W = 400, H = 580;
        var ratio = 2;
        var canvas = document.createElement('canvas');
        canvas.width = W * ratio;
        canvas.height = H * ratio;
        var ctx = canvas.getContext('2d');
        ctx.scale(ratio, ratio);

        // ========== 1. 背景圆角容器 ==========
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.roundRect(0, 0, W, H, 16);
        ctx.fill();

        // ========== 2. 顶部装饰条 ==========
        var grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, '#FF7A00');
        grad.addColorStop(1, '#FF9A3C');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(0, 0, W, 64, [16, 16, 0, 0]);
        ctx.fill();

        // 品牌
        ctx.fillStyle = '#fff';
        ctx.font = '600 15px sans-serif';
        ctx.fillText('🐉  邻里接龙', 22, 38);

        // 状态标签
        var statusMap = { active: '进行中', achieved: '已成团', closed: '已截单' };
        var st = statusMap[activity.status] || '已截单';
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.roundRect(W - 80, 16, 60, 26, 13);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '500 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(st, W - 50, 33);
        ctx.textAlign = 'left';

        // ========== 3. 标题 ==========
        ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 20px sans-serif';
        var title = activity.title || '';
        ctx.fillText(title, 24, 108);

        // ========== 4. 团长 ==========
        ctx.fillStyle = '#999';
        ctx.font = '13px sans-serif';
        ctx.fillText('👤 团长：' + (activity.organizer || ''), 24, 134);

        // ========== 5. 虚线分隔 ==========
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(24, 150);
        ctx.lineTo(W - 24, 150);
        ctx.stroke();
        ctx.setLineDash([]);

        // ========== 6. 商品清单 ==========
        var y = 170;
        ctx.fillStyle = '#FF7A00';
        ctx.font = '600 13px sans-serif';
        ctx.fillText('🛒  商品清单', 24, y);

        y += 14;
        var products = activity.products || [];
        ctx.fillStyle = '#333';
        ctx.font = '13px sans-serif';
        for (var pi = 0; pi < products.length; pi++) {
          var p = products[pi];
          var tag = (p.isMain || p.productType === 'main') ? '🍜' : '🍪';
          y += 24;
          ctx.fillText(tag + '  ' + p.name, 24, y);
          ctx.textAlign = 'right';
          ctx.fillStyle = '#FF7A00';
          ctx.font = '600 13px sans-serif';
          ctx.fillText('¥' + p.price.toFixed(1) + '/' + p.unit, W - 24, y);
          ctx.textAlign = 'left';
          ctx.fillStyle = '#333';
          ctx.font = '13px sans-serif';
        }

        // ========== 7. 三个数据卡片 ==========
        y += 16;
        var cardW = 108, cardH = 56, gap = 10;
        var startX = (W - cardW * 3 - gap * 2) / 2;
        var labels = ['参与人数', '截止时间', '限定小区'];
        var vals = [
          activity.currentCount + '/' + activity.targetCount,
          formatDeadlineTime(activity.deadline),
          (activity.community && activity.community.length > 0) ? activity.community.join('/') : '全小区'
        ];

        ctx.shadowColor = 'rgba(255,122,0,0.08)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;

        for (var ci = 0; ci < 3; ci++) {
          var cx = startX + ci * (cardW + gap);
          ctx.fillStyle = '#FFF8F0';
          ctx.beginPath();
          ctx.roundRect(cx, y, cardW, cardH, 10);
          ctx.fill();
          ctx.fillStyle = '#FF7A00';
          ctx.font = 'bold 17px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(vals[ci], cx + cardW / 2, y + 24);
          ctx.fillStyle = '#aaa';
          ctx.font = '11px sans-serif';
          ctx.fillText(labels[ci], cx + cardW / 2, y + 44);
          ctx.textAlign = 'left';
        }

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // ========== 8. 底部二维码区域（居中） ==========
        y += cardH + 18;

        // 灰色背景框
        ctx.fillStyle = '#F5F5F5';
        ctx.beginPath();
        ctx.roundRect(20, y, W - 40, 160, 12);
        ctx.fill();

        // 扫码提示
        ctx.fillStyle = '#333';
        ctx.font = '600 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📱 扫码参与接龙', W / 2, y + 30);
        ctx.textAlign = 'left';

        // 二维码（居中）
        var qrSize = 80;
        var qrX = (W - qrSize) / 2;
        var qrY = y + 44;

        // 二维码白色背景
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.roundRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 8);
        ctx.fill();

        if (qrImg && qrImg.complete && qrImg.naturalWidth > 0) {
          try {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(qrX, qrY, qrSize, qrSize, 4);
            ctx.clip();
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
            ctx.restore();
          } catch (e) {}
        }

        // 底部小字提示
        ctx.fillStyle = '#bbb';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('长按识别二维码 · 立即加入接龙', W / 2, y + 148);
        ctx.textAlign = 'left';

        // ========== 导出 ==========
        var link = document.createElement('a');
        link.download = 'solong-share.png';
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        downloadBtn.textContent = '\u2B07\uFE0F 保存图片';
        downloadBtn.disabled = false;
      }
    });
  }

  // ---- 辅助：格式化截止时间为短时间 ----
  function formatDeadlineTime(deadlineStr) {
    if (!deadlineStr) return '--';
    var d = typeof deadlineStr === 'string' ? new Date(deadlineStr) : deadlineStr;
    var now = Date.now();
    var diff = d.getTime() - now;
    if (diff <= 0) return '已截止';
    var mins = Math.floor(diff / 60000);
    if (mins < 60) return mins + '分钟后';
    if (mins < 1440) return Math.floor(mins / 60) + '小时后';
    return Math.floor(mins / 1440) + '天后';
  }
}

/* =============================================================
   15. initBackButton — 返回
   ============================================================= */
function initBackButton() {
  var backBtn = document.getElementById('backBtn');
  if (!backBtn) return;

  backBtn.addEventListener('click', function () {
    window.location.href = 'index.html';
  });
}

/* =============================================================
   16. getDefaultParticipants — 默认参与者列表
   ============================================================= */
function getDefaultParticipants() {
  return solongData.participants || [];
}

/* =============================================================
   Helpers
   ============================================================= */

/**
 * HTML 转义
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
