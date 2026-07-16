// ========== 全局状态 ==========
let currentView = 'home';
let currentPhase = 'A';
let riasecIndex = 0;
let anchorIndex = 0;

let assessmentData = {
  name: '', education: '', experience: '', status: '',
  preferences: ['发展空间', '稳定性', '成长空间', '兴趣匹配'],
  riasecAnswers: [],
  anchorAnswers: [],
  riasecScores: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
  anchorCounts: {}
};

// ========== 导航逻辑 ==========
function navigateTo(view) {
  if (currentView === view) return;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + view);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);
  }

  // v5 导航栏高亮
  const navV5Links = document.querySelectorAll('.nav-v5-links button');
  if (navV5Links.length > 0) {
    navV5Links.forEach(b => b.classList.remove('active'));
    const viewMapV5 = {
      home: 0,
      'assessment-guide': 1, 'assessment-library': 1, 'assessment-profile': 1, assessment: 1,
      industry: 2, 'industry-detail': 2,
      decision: 3, 'jd-parser': 3, 'work-archive': 3, 'career-profile': 3,
      'resume-builder': 3, 'growth-analytics': 3,
      about: 4
    };
    if (viewMapV5[view] !== undefined && navV5Links[viewMapV5[view]]) {
      navV5Links[viewMapV5[view]].classList.add('active');
    }
  }

  // 旧导航栏高亮（兼容）
  const navLinks = document.querySelectorAll('.nav-links button');
  if (navLinks.length > 0) {
    navLinks.forEach(b => b.classList.remove('active'));
    const viewMap = {
      home: 0, 'assessment-guide': 1, 'assessment-library': 1, 'assessment-profile': 1, assessment: 1,
      industry: 2, 'industry-detail': 2, decision: 3,
      'work-archive': 4, 'career-profile': 5, 'resume-builder': 6,
      'growth-analytics': 7, 'jd-parser': 8, about: 9
    };
    if (viewMap[view] !== undefined && navLinks[viewMap[view]]) {
      navLinks[viewMap[view]].classList.add('active');
    }
    const navLinksEl = document.getElementById('navLinks');
    if (navLinksEl) navLinksEl.classList.remove('open');
  }

  currentView = view;

  const archiveViews = ['work-archive', 'career-profile', 'resume-builder', 'growth-analytics'];
  if (archiveViews.includes(view)) {
    const subnavBtns = document.querySelectorAll('.archive-subnav-btn');
    subnavBtns.forEach(btn => btn.classList.remove('active'));
    subnavBtns.forEach(btn => {
      const onclick = btn.getAttribute('onclick') || '';
      if (onclick.includes("navigateTo('" + view + "')")) {
        btn.classList.add('active');
      }
    });
  }

  if (view === 'industry') renderIndustryGrid();
  if (view === 'decision') initDecisionTools();
  if (view === 'work-archive') { initUploader(); renderTimelineView(); renderModularView(); }
  if (view === 'career-profile') initBlockEditor();
  if (view === 'resume-builder') initResumeBuilder();
  if (view === 'growth-analytics') initAnalytics();
  if (view === 'jd-parser') initJDParser();
  if (view === 'assessment-guide') initAssessmentGuide();
  if (view === 'assessment-library') renderAssessmentLibrary();
  if (view === 'assessment-profile') renderAssessmentProfile();
}

function toggleMobileNav() {
  const navLinksEl = document.getElementById('navLinks');
  if (navLinksEl) navLinksEl.classList.toggle('open');
}

function toggleNavDropdown(e) {
  e.stopPropagation();
  const dropdown = e.currentTarget.closest('.nav-v5-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('open');
  }
}

function closeNavDropdown() {
  const dropdown = document.querySelector('.nav-v5-dropdown.open');
  if (dropdown) dropdown.classList.remove('open');
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.nav-v5-dropdown')) {
    closeNavDropdown();
  }
});

window.addEventListener('scroll', () => {
  const navbarV5 = document.getElementById('navbar-v5');
  if (navbarV5) {
    navbarV5.classList.toggle('scrolled', window.scrollY > 10);
  }
  const navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }
});

// ========== 偏好排序 ==========
function movePref(btn, direction) {
  const item = btn.closest('.pref-item');
  const parent = item.parentNode;
  const items = Array.from(parent.children);
  const idx = items.indexOf(item);
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= items.length) return;
  if (direction === -1) {
    parent.insertBefore(item, items[newIdx]);
  } else {
    parent.insertBefore(items[newIdx], item);
  }
  updatePrefRanks();
}

function updatePrefRanks() {
  const items = document.querySelectorAll('#prefSort .pref-item');
  items.forEach((item, i) => {
    item.querySelector('.pref-rank').textContent = i + 1;
  });
}

// ========== 阶段切换 ==========
function goPhase(phase) {
  if (phase === 'A' && currentPhase !== 'A') {
    currentPhase = 'A';
    document.getElementById('phaseA').style.display = 'block';
    document.getElementById('phaseB').style.display = 'none';
    document.getElementById('phaseC').style.display = 'none';
    updatePhaseTabs();
    updateProgress();
  } else if (phase === 'B' && assessmentData.riasecAnswers.length > 0) {
    currentPhase = 'B';
    document.getElementById('phaseA').style.display = 'none';
    document.getElementById('phaseB').style.display = 'block';
    document.getElementById('phaseC').style.display = 'none';
    renderRIASECQuestion();
    updatePhaseTabs();
    updateProgress();
  } else if (phase === 'C' && assessmentData.anchorAnswers.length > 0) {
    currentPhase = 'C';
    document.getElementById('phaseA').style.display = 'none';
    document.getElementById('phaseB').style.display = 'none';
    document.getElementById('phaseC').style.display = 'block';
    renderAnchorQuestion();
    updatePhaseTabs();
    updateProgress();
  }
}

function updatePhaseTabs() {
  const tabs = { A: 'phaseTabA', B: 'phaseTabB', C: 'phaseTabC' };
  Object.values(tabs).forEach(id => {
    document.getElementById(id).classList.remove('active', 'completed');
  });
  if (currentPhase === 'B' && assessmentData.riasecAnswers.length >= 42) {
    document.getElementById(tabs.A).classList.add('completed');
    document.getElementById(tabs.B).classList.add('active');
  } else if (currentPhase === 'C') {
    document.getElementById(tabs.A).classList.add('completed');
    document.getElementById(tabs.B).classList.add('completed');
    document.getElementById(tabs.C).classList.add('active');
  } else {
    document.getElementById(tabs[currentPhase]).classList.add('active');
  }
}

function updateProgress() {
  let total = 50;
  let done = 0;
  let percent = 0;
  let text = '';

  if (currentPhase === 'A') {
    done = 0;
    percent = 0;
    text = '阶段 1/3：基础信息收集';
  } else if (currentPhase === 'B') {
    done = assessmentData.riasecAnswers.filter(a => a !== undefined && a !== null).length;
    percent = Math.round((done / 42) * 100);
    text = `阶段 2/3 · 兴趣测评  ${done}/42（${percent}%）`;
  } else if (currentPhase === 'C') {
    const riasecDone = 42;
    const anchorDone = assessmentData.anchorAnswers.filter(a => a !== undefined && a !== null).length;
    done = riasecDone + anchorDone;
    percent = Math.round((done / total) * 100);
    text = `阶段 3/3 · 职业锚测评  ${anchorDone}/8（${Math.round(anchorDone / 8 * 100)}%）`;
  }

  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  if (progressFill) progressFill.style.width = percent + '%';
  if (progressText) progressText.textContent = text;
}

// ========== 阶段 A 提交 ==========
function submitPhaseA() {
  // 清除之前的验证状态
  clearValidationErrors();

  const name = document.getElementById('inputName').value.trim();
  const edu = document.getElementById('inputEdu').value;
  const exp = document.getElementById('inputExp').value;
  const status = document.getElementById('inputStatus').value;

  let hasError = false;

  if (!edu) {
    showValidationError('inputEdu', '请选择你的最高学历');
    hasError = true;
  }
  if (!exp) {
    showValidationError('inputExp', '请选择你的工作年限');
    hasError = true;
  }
  if (!status) {
    showValidationError('inputStatus', '请选择你的当前状态');
    hasError = true;
  }

  if (hasError) return;

  const prefItems = document.querySelectorAll('#prefSort .pref-item');
  const prefs = Array.from(prefItems).map(item => item.dataset.pref);

  assessmentData.name = name;
  assessmentData.education = edu;
  assessmentData.experience = exp;
  assessmentData.status = status;
  assessmentData.preferences = prefs;

  saveProgress();

  currentPhase = 'B';
  riasecIndex = assessmentData.riasecAnswers.length;
  document.getElementById('phaseA').style.display = 'none';
  document.getElementById('phaseB').style.display = 'block';
  updatePhaseTabs();
  renderRIASECQuestion();
  updateProgress();
}

// 显示内联验证错误
function showValidationError(fieldId, message) {
  const field = document.getElementById(fieldId);
  field.classList.add('form-input-error');
  // 查找或创建错误提示元素
  let errorEl = field.parentElement.querySelector('.form-error-msg');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'form-error-msg';
    field.parentElement.appendChild(errorEl);
  }
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

// 清除所有验证错误
function clearValidationErrors() {
  document.querySelectorAll('.form-input-error').forEach(el => {
    el.classList.remove('form-input-error');
  });
  document.querySelectorAll('.form-error-msg').forEach(el => {
    el.style.display = 'none';
    el.textContent = '';
  });
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', async function() {
  loadProgress();
  // 初始化API服务
  if (typeof API !== 'undefined') {
    await API.init();
  }
});

function initAssessmentGuide() {
  if (typeof startAssessmentGuide === 'function') {
    startAssessmentGuide();
  }
}
