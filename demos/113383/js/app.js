// 应用入口与页面渲染

let currentYear = 2026;
let currentMonth = 7;

function initApp() {
  registerRoute('#/welcome', renderWelcome);
  registerRoute('#/write', renderWrite);
  registerRoute('#/generating', renderGenerating);
  registerRoute('#/result', renderResult);
  registerRoute('#/gallery', renderGallery);
  registerRoute('#/detail', renderDetail);
  registerRoute('#/compare', renderCompare);
  registerRoute('#/me', renderMe);

  initData();
  applyTheme();
  initRouter();

  // 如果已经看过欢迎页，直接到画廊
  if (AppState.settings.hasSeenWelcome) {
    const hash = window.location.hash;
    if (!hash || hash === '#/welcome') {
      setTimeout(() => navigateTo('#/gallery'), 100);
    }
  }
}

function applyTheme() {
  document.body.className = `font-${AppState.settings.fontTheme} theme-${AppState.settings.theme}`;
}

// 欢迎页
function renderWelcome() {
  const page = document.getElementById('welcome');
  page.innerHTML = `
    <div class="welcome-page">
      <div class="welcome-brand">
        <h1>心事画廊</h1>
        <p class="slogan">每天两分钟，把心情画成一幅画</p>
      </div>
      <div class="welcome-carousel">
        <div class="welcome-carousel-inner">
          <div class="welcome-carousel-item"><img src="assets/暖橘.png" alt="温暖 · 橘猫" class="art-image" /></div>
          <div class="welcome-carousel-item"><img src="assets/雨夜.png" alt="悲伤 · 雨夜" class="art-image" /></div>
        </div>
      </div>
      <p class="welcome-poem">"写下今天，画下心情"</p>
      <div class="welcome-actions">
        <button class="btn btn-primary btn-block" onclick="startJourney()">写下今天</button>
        <p class="welcome-skip">无需注册，数据仅保存在本地</p>
      </div>
    </div>
  `;
  showPage('welcome');
}

function startJourney() {
  AppState.settings.hasSeenWelcome = true;
  saveSettings();
  navigateTo('#/write');
}

// 日记输入页
function renderWrite() {
  const page = document.getElementById('write');
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  page.innerHTML = `
    <div class="write-page">
      <div class="write-header">
        <p class="write-date">${formatDate(dateStr)}</p>
        <h2 class="write-hint">今天发生了什么？</h2>
      </div>
      <div class="write-input-wrapper">
        <textarea
          class="input-paper write-input"
          id="diaryInput"
          placeholder="可以写一句话，也可以写一段话。&#10;比如：今天下雨了，我在公交站等了40分钟，浑身湿透了..."
        ></textarea>
      </div>
      <div class="write-footer">
        <span id="emotionLabel">心情：平静</span>
        <span id="wordCount">0 字</span>
      </div>
      <p class="write-privacy">这段文字只属于你</p>
      <button class="btn btn-primary btn-block" id="submitBtn" onclick="submitDiary()">画下来</button>
      <div class="safe-bottom"></div>
    </div>
    ${createBottomNav('write')}
  `;

  const input = document.getElementById('diaryInput');
  const emotionLabel = document.getElementById('emotionLabel');
  const wordCount = document.getElementById('wordCount');
  const submitBtn = document.getElementById('submitBtn');

  input.addEventListener('input', () => {
    const text = input.value;
    const result = analyzeEmotion(text);
    input.style.background = result.color;
    emotionLabel.textContent = `心情：${result.label}`;
    wordCount.textContent = `${text.length} 字`;
    submitBtn.disabled = text.trim().length < 3;
  });

  showPage('write');
}

function submitDiary() {
  const input = document.getElementById('diaryInput');
  const text = input.value.trim();
  if (text.length < 3) return;

  const result = analyzeEmotion(text);
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  AppState.currentDiary = {
    id: generateId(),
    date: dateStr,
    displayDate: formatShortDate(dateStr),
    text: text,
    emotion: result.emotion,
    emotionLabel: result.label,
    color: result.color,
    poem: result.poem,
    imageType: result.emotion
  };

  navigateTo('#/generating');
}

// 生成中页
function renderGenerating() {
  const page = document.getElementById('generating');
  page.innerHTML = `
    <div class="generating-page">
      <div class="generating-ink">
        <div class="ink-cloud" style="top:10%;left:20%;"></div>
        <div class="ink-cloud" style="top:50%;left:60%;"></div>
        <div class="ink-cloud" style="top:70%;left:10%;"></div>
      </div>
      <div class="generating-content">
        <div class="generating-brush">
          <svg viewBox="0 0 120 120" fill="none" stroke="var(--color-text)" stroke-width="1.5" stroke-linecap="round">
            <path class="brush-path active" d="M30 60 Q 60 30, 90 60 T 90 80" />
            <path class="brush-path active" d="M40 70 Q 60 50, 80 70" style="animation-delay:0.5s" />
            <circle class="brush-path active" cx="60" cy="85" r="8" style="animation-delay:1s" />
          </svg>
        </div>
        <p class="generating-text" id="generatingText">正在读懂你的心情...</p>
        <p class="generating-subtext">画很快就好</p>
        <button class="btn btn-ghost generating-cancel" onclick="cancelGenerating()">取消</button>
      </div>
    </div>
  `;
  showPage('generating');

  const texts = ['正在读懂你的心情...', '正在为你调色...', '正在画下来...'];
  let index = 0;

  const interval = setInterval(() => {
    index = (index + 1) % texts.length;
    const el = document.getElementById('generatingText');
    if (el) el.textContent = texts[index];
  }, 1500);

  setTimeout(() => {
    clearInterval(interval);
    navigateTo('#/result');
  }, 4500);
}

function cancelGenerating() {
  navigateTo('#/write');
}

// 结果展示页
function renderResult() {
  const diary = AppState.currentDiary;
  if (!diary) {
    navigateTo('#/write');
    return;
  }

  const page = document.getElementById('result');
  page.innerHTML = `
    <div class="result-page">
      <div class="result-art painting-reveal">${renderArtPlaceholder(diary.imageType, diary.imageUrl)}</div>
      <div class="result-meta text-reveal">
        <p class="result-date">${formatDate(diary.date)}</p>
        <p class="result-poem">${diary.poem}</p>
      </div>
      <div class="result-original text-reveal text-reveal-delay-1">
        <button class="result-original-toggle" onclick="toggleOriginal(this)">
          <span>${icon('eye')}</span>
          <span>查看原文</span>
        </button>
        <div class="result-original-content">
          ${diary.text}
        </div>
      </div>
      <div class="result-actions text-reveal text-reveal-delay-2">
        <button class="result-action" onclick="saveCurrentDiary()">
          <span class="action-icon">${icon('save')}</span>
          <span>保存</span>
        </button>
        <button class="result-action" onclick="retryCurrentDiary()">
          <span class="action-icon">${icon('refresh')}</span>
          <span>重画</span>
        </button>
        <button class="result-action" onclick="shareCurrentDiary()">
          <span class="action-icon">${icon('share')}</span>
          <span>分享</span>
        </button>
      </div>
      <div class="safe-bottom"></div>
    </div>
  `;
  showPage('result');
}

function toggleOriginal(btn) {
  const content = btn.nextElementSibling;
  content.classList.toggle('active');
  const text = btn.querySelector('span:last-child');
  text.textContent = content.classList.contains('active') ? '收起原文' : '查看原文';
}

function saveCurrentDiary() {
  if (AppState.currentDiary) {
    // 如果当天已有日记，替换
    AppState.diaries = AppState.diaries.filter(d => d.date !== AppState.currentDiary.date);
    addDiary(AppState.currentDiary);
    showToast('已保存到画廊');
    setTimeout(() => navigateTo('#/gallery'), 800);
  }
}

function retryCurrentDiary() {
  navigateTo('#/generating');
}

function shareCurrentDiary() {
  showToast('分享功能在原型中暂不开放');
}

// 情绪画廊页
function renderGallery() {
  const page = document.getElementById('gallery');
  const monthData = getMonthData(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const diariesInMonth = monthData.filter(d => d.hasDiary);

  let colorRingSegments = '';
  let currentAngle = 0;
  const totalDays = monthData.length;

  monthData.forEach(day => {
    if (day.hasDiary) {
      const angle = (360 / totalDays);
      const color = day.diary.color;
      const x1 = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
      const y1 = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
      const x2 = 100 + 80 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
      const y2 = 100 + 80 * Math.sin(((currentAngle + angle) * Math.PI) / 180);

      colorRingSegments += `
        <path d="M 100 100 L ${x1} ${y1} A 80 80 0 0 1 ${x2} ${y2} Z" fill="${color}" opacity="0.8" />
      `;
    }
    currentAngle += (360 / totalDays);
  });

  let calendarHtml = '';
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  weekDays.forEach(day => {
    calendarHtml += `<div class="calendar-weekday">${day}</div>`;
  });

  for (let i = 0; i < firstDay; i++) {
    calendarHtml += `<div class="calendar-day empty"></div>`;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  monthData.forEach(day => {
    const isToday = day.date === todayStr;
    let dayClass = 'calendar-day';
    let content = '';

    if (day.hasDiary) {
      dayClass += ' has-diary';
      content = `
        <div class="day-art">${renderArtPlaceholder(day.diary.imageType, day.diary.imageUrl)}</div>
        <span class="day-number">${day.day}</span>
      `;
    } else if (isToday) {
      dayClass += ' today';
      content = `<span class="day-number">${day.day}</span>`;
    } else {
      dayClass += ' no-diary';
      content = `<span class="day-number">${day.day}</span>`;
    }

    calendarHtml += `<div class="${dayClass}" onclick="handleCalendarClick('${day.date}', ${day.hasDiary})">${content}</div>`;
  });

  page.innerHTML = `
    <div class="gallery-page">
      <h2 class="page-title" style="text-align:center;margin-bottom:24px;">情绪画廊</h2>
      <div class="color-ring">
        <svg viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="var(--color-border)" stroke-width="1" />
          ${colorRingSegments}
          <circle cx="100" cy="100" r="45" fill="var(--color-bg)" />
        </svg>
        <div class="color-ring-center">
          <div class="month">${currentMonth}月</div>
          <div class="count">${diariesInMonth.length} 幅画</div>
        </div>
      </div>
      <div class="gallery-month-nav">
        <button onclick="changeMonth(-1)">‹</button>
        <span class="current-month">${currentYear}年${currentMonth}月</span>
        <button onclick="changeMonth(1)">›</button>
      </div>
      <div class="calendar-grid">
        ${calendarHtml}
      </div>
      <div class="gallery-actions">
        <button class="btn btn-secondary" onclick="startCompare()">
          ${icon('compare')} 对比
        </button>
        <button class="btn btn-primary" onclick="navigateTo('#/write')">写日记</button>
      </div>
      <div class="safe-bottom"></div>
    </div>
    ${createBottomNav('gallery')}
  `;
  showPage('gallery');
}

function handleCalendarClick(dateStr, hasDiary) {
  if (hasDiary) {
    navigateTo('#/detail', [dateStr]);
  } else if (dateStr === new Date().toISOString().split('T')[0]) {
    navigateTo('#/write');
  }
}

function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth > 12) {
    currentMonth = 1;
    currentYear++;
  } else if (currentMonth < 1) {
    currentMonth = 12;
    currentYear--;
  }
  renderGallery();
}

function startCompare() {
  AppState.compareLeft = null;
  AppState.compareRight = null;
  showToast('请选择第一幅画');
  setTimeout(() => navigateTo('#/compare'), 300);
}

// 画作详情页
function renderDetail(params) {
  const dateStr = params[0];
  const diary = getDiaryById(dateStr) || AppState.diaries.find(d => d.date === dateStr);

  if (!diary) {
    navigateTo('#/gallery');
    return;
  }

  const page = document.getElementById('detail');
  page.innerHTML = `
    <div class="detail-page">
      ${createPageHeader('画作详情', true, "navigateTo('#/gallery')")}
      <div class="detail-art painting-reveal">${renderArtPlaceholder(diary.imageType, diary.imageUrl)}</div>
      <div class="detail-meta">
        <p class="detail-date">${formatDate(diary.date)}</p>
        <p class="detail-poem">${diary.poem}</p>
      </div>
      <div class="detail-original">
        <p class="detail-original-label">原文</p>
        <p class="detail-original-text">${diary.text}</p>
      </div>
      <div class="detail-actions">
        <button class="detail-action" onclick="deleteDetailDiary('${diary.id}')">
          <span class="action-icon">${icon('delete')}</span>
          <span>删除</span>
        </button>
        <button class="detail-action" onclick="compareDetailDiary('${diary.id}')">
          <span class="action-icon">${icon('compare')}</span>
          <span>对比</span>
        </button>
        <button class="detail-action" onclick="shareDetailDiary()">
          <span class="action-icon">${icon('share')}</span>
          <span>分享</span>
        </button>
      </div>
      <div class="safe-bottom"></div>
    </div>
  `;
  showPage('detail');
}

function deleteDetailDiary(id) {
  if (confirm('确定要删除这幅画吗？')) {
    deleteDiary(id);
    showToast('已删除');
    setTimeout(() => navigateTo('#/gallery'), 500);
  }
}

function compareDetailDiary(id) {
  AppState.compareLeft = getDiaryById(id);
  AppState.compareRight = null;
  showToast('请选择第二幅画');
  setTimeout(() => navigateTo('#/compare'), 300);
}

function shareDetailDiary() {
  showToast('分享功能在原型中暂不开放');
}

// 双画对比页
function renderCompare() {
  const page = document.getElementById('compare');

  const renderCompareItem = (diary, position) => {
    if (diary) {
      return `
        <div class="compare-item" onclick="selectCompareItem('${position}')">
          <div class="compare-art">${renderArtPlaceholder(diary.imageType, diary.imageUrl)}</div>
          <p class="compare-date">${diary.displayDate}</p>
          <p class="compare-poem">${diary.poem}</p>
        </div>
      `;
    }
    return `
      <div class="compare-item" onclick="selectCompareItem('${position}')">
        <div class="compare-placeholder">点击选择</div>
        <p class="compare-date">${position === 'left' ? '左边' : '右边'}</p>
      </div>
    `;
  };

  page.innerHTML = `
    <div class="compare-page">
      ${createPageHeader('双画对比', true, "navigateTo('#/gallery')")}
      <div class="compare-container">
        ${renderCompareItem(AppState.compareLeft, 'left')}
        ${renderCompareItem(AppState.compareRight, 'right')}
      </div>
      <div class="compare-actions">
        <button class="btn btn-primary btn-block" onclick="showDiaryPicker()">选择画作</button>
        ${AppState.compareLeft && AppState.compareRight ? `<button class="btn btn-secondary btn-block" onclick="resetCompare()">重新选择</button>` : ''}
      </div>
      <div class="safe-bottom"></div>
    </div>
  `;
  showPage('compare');
}

function selectCompareItem(position) {
  showDiaryPicker(position);
}

function showDiaryPicker(position) {
  const positionToFill = position || (AppState.compareLeft ? 'right' : 'left');
  const options = AppState.diaries.map(d => `
    <div class="me-menu-item" onclick="setCompareItem('${positionToFill}', '${d.id}')" style="cursor:pointer;">
      <span>${d.displayDate} · ${d.emotionLabel}</span>
      <span class="arrow">›</span>
    </div>
  `).join('');

  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'diaryPickerModal';
  modal.innerHTML = `
    <div class="modal">
      <h3 class="modal-title">选择${positionToFill === 'left' ? '左边' : '右边'}画作</h3>
      <div class="me-menu" style="margin-bottom:16px;">
        ${options || '<div class="me-menu-item">暂无画作</div>'}
      </div>
      <button class="btn btn-secondary btn-block" onclick="closeDiaryPicker()">取消</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeDiaryPicker() {
  const modal = document.getElementById('diaryPickerModal');
  if (modal) modal.remove();
}

function setCompareItem(position, id) {
  const diary = getDiaryById(id);
  if (position === 'left') AppState.compareLeft = diary;
  else AppState.compareRight = diary;
  closeDiaryPicker();
  renderCompare();
}

function resetCompare() {
  AppState.compareLeft = null;
  AppState.compareRight = null;
  renderCompare();
}

// 我的页
function renderMe() {
  const page = document.getElementById('me');
  const count = AppState.diaries.length;

  page.innerHTML = `
    <div class="me-page">
      <div class="me-header">
        <div class="me-avatar">我</div>
        <p class="me-nickname">画廊主人</p>
        <p class="me-stats">已收藏 ${count} 幅情绪画</p>
      </div>

      <div class="me-section">
        <h3 class="me-section-title">主题</h3>
        <div class="font-options">
          <div class="font-option ${AppState.settings.theme === 'cream' ? 'active' : ''}" onclick="setTheme('cream')">
            <div class="font-option-title">奶油</div>
            <div class="font-option-desc">水彩风</div>
          </div>
          <div class="font-option ${AppState.settings.theme === 'film' ? 'active' : ''}" onclick="setTheme('film')">
            <div class="font-option-title">胶片</div>
            <div class="font-option-desc">日记风</div>
          </div>
          <div class="font-option ${AppState.settings.theme === 'minimal' ? 'active' : ''}" onclick="setTheme('minimal')">
            <div class="font-option-title">极简</div>
            <div class="font-option-desc">留白风</div>
          </div>
        </div>
      </div>

      <div class="me-section">
        <h3 class="me-section-title">字体</h3>
        <div class="font-options">
          <div class="font-option ${AppState.settings.fontTheme === 'serif' ? 'active' : ''}" onclick="setFontTheme('serif')">
            <div class="font-option-title" style="font-family:Georgia,serif">文艺</div>
            <div class="font-option-desc">全衬线</div>
          </div>
          <div class="font-option ${AppState.settings.fontTheme === 'mixed' ? 'active' : ''}" onclick="setFontTheme('mixed')">
            <div class="font-option-title" style="font-family:Georgia,serif">默认</div>
            <div class="font-option-desc">标题衬线</div>
          </div>
          <div class="font-option ${AppState.settings.fontTheme === 'sans' ? 'active' : ''}" onclick="setFontTheme('sans')">
            <div class="font-option-title" style="font-family:sans-serif">简洁</div>
            <div class="font-option-desc">全无衬线</div>
          </div>
        </div>
      </div>

      <div class="me-section">
        <h3 class="me-section-title">AI 画作生成设置</h3>
        <div class="card" style="padding:16px;">
          <div class="input-row">
            <label class="input-row-label">
              API KEY
              <span class="tooltip-wrapper" onclick="this.classList.toggle('active')">
                <span class="tooltip-icon">${icon('help')}</span>
                <span class="tooltip-content">
                  <strong>什么是 API KEY？</strong><br>
                  API KEY 是你从画作生成服务获取的密钥。填写后，《心事画廊》可以直接调用该服务为你生成情绪插画。<br><br>
                  <strong>安全提示</strong>：你的 API KEY 只会保存在你的设备本地，我们不会收集或上传它。<br><br>
                  <strong>如何获取</strong>：请在画作生成服务的官网注册账号并创建 API KEY，然后复制粘贴到上方输入框。
                </span>
              </span>
            </label>
          </div>
          <input
            type="password"
            class="input-field"
            id="apiKeyInput"
            placeholder="请输入 API KEY"
            value="${AppState.settings.apiKey}"
            onchange="saveApiKey(this.value)"
          />
          <p class="input-hint">仅保存在本地，不会上传服务器</p>
        </div>
      </div>

      <div class="me-section">
        <h3 class="me-section-title">设置</h3>
        <div class="me-menu">
          <div class="me-menu-item">
            <span class="me-menu-text">${icon('lock')} 隐私说明</span>
            <span class="arrow">›</span>
          </div>
        </div>
      </div>

      <div class="me-section danger-zone">
        <button class="btn btn-ghost" onclick="clearAllUserData()">清空所有数据</button>
      </div>

      <div class="safe-bottom"></div>
    </div>
    ${createBottomNav('me')}
  `;
  showPage('me');
}

function setFontTheme(theme) {
  AppState.settings.fontTheme = theme;
  saveSettings();
  applyTheme();
  if (document.getElementById('me').classList.contains('active')) {
    renderMe();
  }
  showToast('字体已切换');
}

function setTheme(theme) {
  AppState.settings.theme = theme;
  saveSettings();
  applyTheme();
  if (document.getElementById('me').classList.contains('active')) {
    renderMe();
  }
  showToast('主题已切换');
}

function saveApiKey(value) {
  AppState.settings.apiKey = value.trim();
  saveSettings();
}

function clearAllUserData() {
  if (confirm('确定要清空所有数据吗？此操作不可恢复。')) {
    clearAllData();
    showToast('数据已清空');
    renderMe();
  }
}

// 启动应用
window.addEventListener('DOMContentLoaded', initApp);
