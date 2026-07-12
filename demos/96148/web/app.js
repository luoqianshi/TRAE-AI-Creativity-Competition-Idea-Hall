let currentView = 'home';
let previousView = 'home';
let currentChecklist = 'japan';

function switchMainView(viewName) {
  previousView = currentView;
  currentView = viewName;
  
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const targetView = document.getElementById('view-' + viewName);
  if (targetView) {
    targetView.classList.add('active');
  }
  
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.view === viewName) {
      item.classList.add('active');
    }
  });
  
  document.querySelectorAll('.mobile-tab').forEach(tab => {
    tab.classList.remove('active');
    const tabView = tab.querySelector('.mobile-tab-label');
    if (tabView && tabView.textContent === getViewLabel(viewName)) {
      tab.classList.add('active');
    }
  });
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getViewLabel(viewName) {
  const labels = {
    'home': '首页',
    'templates': '模板',
    'profile': '我的'
  };
  return labels[viewName] || '';
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
  
  if (sidebar.classList.contains('open')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

function goToAiCreate() {
  switchMainView('ai-create');
  setTimeout(() => {
    const textarea = document.getElementById('ai-main-input');
    if (textarea) textarea.focus();
  }, 300);
}

function fillHeroInput(text) {
  const input = document.getElementById('hero-ai-input');
  if (input) {
    input.value = text;
    input.focus();
  }
}

function handleHeroInput(event) {
  if (event.key === 'Enter') {
    startFromHero();
  }
}

function startFromHero() {
  const input = document.getElementById('hero-ai-input');
  const text = input ? input.value.trim() : '';
  if (text) {
    const textarea = document.getElementById('ai-main-input');
    if (textarea) textarea.value = text;
  }
  switchMainView('ai-create');
}

function fillAiInput(text) {
  const textarea = document.getElementById('ai-main-input');
  if (textarea) {
    textarea.value = text;
    updateCharCount(textarea);
  }
}

function updateCharCount(textarea) {
  const count = textarea.value.length;
  const countEl = document.getElementById('char-count');
  if (countEl) {
    countEl.textContent = count;
  }
}

function triggerUpload() {
  showToast('图片上传功能演示');
}

function startGenerate() {
  const textarea = document.getElementById('ai-main-input');
  const text = textarea ? textarea.value.trim() : '';
  
  if (!text) {
    showToast('请先输入你的出行计划');
    return;
  }
  
  switchMainView('ai-thinking');
  runThinkingAnimation();
}

function runThinkingAnimation() {
  let progress = 0;
  const steps = [
    { id: 'step-1', delay: 300 },
    { id: 'step-2', delay: 700 },
    { id: 'step-3', delay: 1100 },
    { id: 'step-4', delay: 1500 },
    { id: 'step-5', delay: 1900 },
    { id: 'step-6', delay: 2300 }
  ];
  
  steps.forEach((step, index) => {
    setTimeout(() => {
      const stepEl = document.getElementById(step.id);
      if (stepEl) {
        const icon = stepEl.querySelector('.step-icon');
        if (icon) {
          icon.classList.remove('pending');
          icon.classList.add('current');
          icon.textContent = '●';
        }
      }
      
      setTimeout(() => {
        const stepEl2 = document.getElementById(step.id);
        if (stepEl2) {
          const icon = stepEl2.querySelector('.step-icon');
          if (icon) {
            icon.classList.remove('current');
            icon.classList.add('done');
            icon.textContent = '✓';
          }
        }
      }, 300);
    }, step.delay);
  });
  
  const progressInterval = setInterval(() => {
    progress += Math.random() * 8 + 2;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      
      setTimeout(() => {
        switchMainView('checklist');
      }, 500);
    }
    
    const percentEl = document.getElementById('thinking-percent');
    const progressFill = document.getElementById('progress-fill');
    
    if (percentEl) {
      percentEl.textContent = Math.floor(progress) + '%';
    }
    if (progressFill) {
      const circumference = 2 * Math.PI * 70;
      const offset = circumference - (progress / 100) * circumference;
      progressFill.style.strokeDashoffset = offset;
    }
  }, 100);
}

function openChecklist(id) {
  currentChecklist = id;
  switchMainView('checklist');
}

function toggleCheckItem(row) {
  const checkbox = row.querySelector('.checkbox-large');
  const text = row.querySelector('.item-text-large');
  
  if (checkbox.classList.contains('checked')) {
    checkbox.classList.remove('checked');
    checkbox.querySelector('span').textContent = '';
    text.classList.remove('checked');
  } else {
    checkbox.classList.add('checked');
    checkbox.querySelector('span').textContent = '✓';
    text.classList.add('checked');
  }
  
  updateTotalProgress();
}

function updateTotalProgress() {
  const allItems = document.querySelectorAll('.item-row-large');
  const checkedItems = document.querySelectorAll('.checkbox-large.checked');
  const total = allItems.length;
  const done = checkedItems.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  
  const progressText = document.getElementById('total-progress');
  const progressBar = document.getElementById('total-progress-bar');
  
  if (progressText) {
    progressText.textContent = percent + '%';
  }
  if (progressBar) {
    progressBar.style.width = percent + '%';
  }
  
  const statDone = document.querySelector('.stat-done');
  const statTodo = document.querySelector('.stat-todo');
  
  if (statDone) {
    statDone.textContent = '✓ 已完成 ' + done + ' 件';
  }
  if (statTodo) {
    statTodo.textContent = '○ 待准备 ' + (total - done) + ' 件';
  }
}

function addNewItem(btn) {
  const categoryCard = btn.closest('.category-card-large');
  if (!categoryCard) return;
  
  const itemsList = categoryCard.querySelector('.items-list');
  if (!itemsList) return;
  
  const itemName = prompt('请输入物品名称：');
  if (!itemName || !itemName.trim()) return;
  
  const newItem = document.createElement('div');
  newItem.className = 'item-row-large';
  newItem.onclick = function() { toggleCheckItem(this); };
  newItem.innerHTML = `
    <div class="checkbox-large"><span></span></div>
    <span class="item-text-large">${itemName.trim()}</span>
    <button class="item-delete-btn" onclick="event.stopPropagation(); deleteItem(this)">✕</button>
  `;
  
  itemsList.appendChild(newItem);
  updateCategoryCount(categoryCard);
  updateTotalProgress();
  showToast('已添加：' + itemName.trim());
}

function deleteItem(btn) {
  const row = btn.closest('.item-row-large');
  const categoryCard = btn.closest('.category-card-large');
  
  if (row) {
    row.remove();
    if (categoryCard) {
      updateCategoryCount(categoryCard);
    }
    updateTotalProgress();
    showToast('已删除');
  }
}

function updateCategoryCount(card) {
  const items = card.querySelectorAll('.item-row-large');
  const checked = card.querySelectorAll('.checkbox-large.checked');
  const countEl = card.querySelector('.cat-count');
  
  if (countEl) {
    countEl.textContent = checked.length + '/' + items.length;
  }
}

function showAiSuggest() {
  previousView = 'checklist';
  switchMainView('ai-suggest');
}

function backToChecklist() {
  switchMainView('checklist');
}

function toggleSuggestionItem(item) {
  const checkbox = item.querySelector('.suggestion-checkbox');
  
  if (checkbox.classList.contains('checked')) {
    checkbox.classList.remove('checked');
    checkbox.querySelector('span').textContent = '';
  } else {
    checkbox.classList.add('checked');
    checkbox.querySelector('span').textContent = '✓';
  }
}

function addSuggestionsToList() {
  const checkedItems = document.querySelectorAll('.suggestion-item-large .suggestion-checkbox.checked');
  const count = checkedItems.length;
  
  if (count === 0) {
    showToast('请先选择要添加的物品');
    return;
  }
  
  showToast('已添加 ' + count + ' 件物品到清单');
  setTimeout(() => {
    switchMainView('checklist');
  }, 800);
}

function goToPoster() {
  previousView = 'checklist';
  switchMainView('poster');
}

function goToFlatlay() {
  previousView = 'poster';
  switchMainView('flatlay');
}

function backToPoster() {
  switchMainView('poster');
}

function selectPosterStyle(style, btn) {
  const options = btn.parentElement.querySelectorAll('.style-option');
  options.forEach(opt => opt.classList.remove('active'));
  btn.classList.add('active');
  
  const preview = document.querySelector('.poster-preview-content');
  if (preview) {
    preview.className = 'poster-preview-content ' + style + '-style';
  }
  
  applyPosterStyle(style);
}

function applyPosterStyle(style) {
  const preview = document.querySelector('.poster-preview-content');
  if (!preview) return;
  
  const styles = {
    'apple': {
      background: 'linear-gradient(180deg, #FFFFFF 0%, #F7F7F5 100%)',
      titleColor: '#111111',
      tagColor: '#4A7DFF'
    },
    'muji': {
      background: 'linear-gradient(180deg, #F5F2EB 0%, #EDE9E0 100%)',
      titleColor: '#5C5550',
      tagColor: '#8B7355'
    },
    'magazine': {
      background: 'linear-gradient(180deg, #111111 0%, #333333 100%)',
      titleColor: '#FFFFFF',
      tagColor: '#FFD700'
    },
    'travel': {
      background: 'linear-gradient(180deg, #E8F0FF 0%, #D4E4FF 100%)',
      titleColor: '#1A365D',
      tagColor: '#4A7DFF'
    },
    'minimal': {
      background: '#FFFFFF',
      titleColor: '#111111',
      tagColor: '#8A8A8A'
    },
    'tech': {
      background: 'linear-gradient(180deg, #0F172A 0%, #1E3A5F 100%)',
      titleColor: '#60A5FA',
      tagColor: '#3B82F6'
    }
  };
  
  const s = styles[style] || styles['apple'];
  
  preview.style.background = s.background;
  const title = preview.querySelector('.poster-main-title');
  const tag = preview.querySelector('.poster-tag-line');
  
  if (title) title.style.color = s.titleColor;
  if (tag) tag.style.color = s.tagColor;
}

function selectRatio(ratio, btn) {
  const options = btn.parentElement.querySelectorAll('.ratio-option');
  options.forEach(opt => opt.classList.remove('active'));
  btn.classList.add('active');
  
  const frame = document.getElementById('poster-preview');
  if (!frame) return;
  
  const ratios = {
    '9:16': { aspectRatio: '9/16', width: '300px' },
    '1:1': { aspectRatio: '1/1', width: '350px' },
    '4:5': { aspectRatio: '4/5', width: '320px' },
    '16:9': { aspectRatio: '16/9', width: '400px' }
  };
  
  const r = ratios[ratio] || ratios['9:16'];
  frame.style.aspectRatio = r.aspectRatio;
  frame.style.width = r.width;
}

function generatePoster() {
  showToast('海报生成中...');
  setTimeout(() => {
    showToast('海报生成成功！');
  }, 1500);
}

function selectFlatlayStyle(style, btn) {
  const options = btn.parentElement.querySelectorAll('.style-option');
  options.forEach(opt => opt.classList.remove('active'));
  btn.classList.add('active');
}

function selectFlatlayRatio(ratio, btn) {
  const options = btn.parentElement.querySelectorAll('.ratio-option');
  options.forEach(opt => opt.classList.remove('active'));
  btn.classList.add('active');
}

function generateFlatlay() {
  showToast('Flat Lay 照片生成中...');
  setTimeout(() => {
    const placeholder = document.querySelector('.flatlay-placeholder');
    if (placeholder) {
      placeholder.innerHTML = `
        <div style="width: 300px; height: 300px; background: linear-gradient(135deg, #F0F4FF 0%, #E8F0FF 100%); border-radius: 24px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.08);">
          <span style="font-size: 64px;">📸</span>
          <span style="font-size: 14px; color: #4A7DFF; font-weight: 600;">生成成功！</span>
        </div>
      `;
    }
    showToast('Flat Lay 照片生成成功！');
  }, 2000);
}

function startWithTemplate(type) {
  const templateNames = {
    'travel': '旅行',
    'camping': '露营',
    'hiking': '徒步',
    'business': '出差',
    'sports': '运动',
    'photo': '摄影',
    'work': '上班',
    'baby': '宝宝'
  };
  
  const name = templateNames[type] || '出行';
  const textarea = document.getElementById('ai-main-input');
  if (textarea) {
    textarea.value = '准备去' + name;
    updateCharCount(textarea);
  }
  
  switchMainView('ai-create');
}

function useTemplate(id) {
  showToast('正在加载模板...');
  setTimeout(() => {
    switchMainView('checklist');
  }, 500);
}

function filterTemplates(category, btn) {
  const tabs = btn.parentElement.querySelectorAll('.category-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  btn.classList.add('active');
  
  const items = document.querySelectorAll('.template-item');
  items.forEach(item => {
    const itemCategory = item.dataset.category;
    if (category === 'all' || itemCategory === category) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

function showNotifications() {
  showToast('暂无新通知');
}

function showMyLists() {
  switchMainView('home');
  showToast('查看我的清单');
}

function showFavorites() {
  showToast('收藏的模板');
}

function showPosters() {
  showToast('我的AI海报');
}

function showSettings() {
  showToast('偏好设置');
}

function showFeedback() {
  showToast('意见反馈');
}

function showAbout() {
  showToast('关于灵感打包 v1.0.0');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  if (!toast || !toastMessage) return;
  
  toastMessage.textContent = message;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}

function showModal(content) {
  const overlay = document.getElementById('modal-overlay');
  const modalContent = document.getElementById('modal-content');
  
  if (modalContent) {
    modalContent.innerHTML = content;
  }
  if (overlay) {
    overlay.classList.remove('hidden');
  }
}

function hideModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

document.addEventListener('click', function(e) {
  const overlay = document.getElementById('modal-overlay');
  if (overlay && e.target === overlay) {
    hideModal();
  }
});

document.addEventListener('keydown', function(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    goToAiCreate();
  }
  
  if (e.key === 'Escape') {
    hideModal();
  }
});

document.addEventListener('DOMContentLoaded', function() {
  updateTotalProgress();
});
