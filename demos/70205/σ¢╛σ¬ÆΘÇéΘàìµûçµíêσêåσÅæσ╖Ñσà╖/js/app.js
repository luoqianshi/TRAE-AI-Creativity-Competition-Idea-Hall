/**
 * 图媒适配原生文案一键分发工具 - 主应用逻辑
 */

// ========== 应用状态 ==========
const AppState = {
  photos: [],           // 上传的照片 [{ id, name, dataURL }]
  currentPhotoId: null, // 当前识别的照片ID
  selectedScene: 'food',// 当前选择的场景
  recognitionData: null,// 识别结果
  generatedContent: {}, // 生成的文案 { dianping: {...}, xiaohongshu: {...}, douyin: {...} }
  currentPlatform: 'dianping', // 当前查看的平台
  publishStatus: {},    // 发布状态
  history: [],          // 历史记录
  wordCount: 'medium',  // 字数要求：short / medium / long / auto
};

// ========== 平台配置 ==========
const PLATFORM_CONFIG = {
  dianping: { name: '大众点评', icon: '🟠', color: '#ff6b35', style: '真实客观评价' },
  xiaohongshu: { name: '小红书', icon: '🔴', color: '#ff2442', style: '种草安利文案' },
  douyin: { name: '抖音', icon: '⚫', color: '#161823', style: '短视频文案' },
};

// ========== DOM 工具 ==========
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const create = (tag, className, html) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (html !== undefined) el.innerHTML = html;
  return el;
};

// ========== Toast 提示 ==========
function showToast(message, type = 'info', duration = 3000) {
  const container = $('#toastContainer');
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };
  const toast = create('div', `toast ${type}`, `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span>${message}</span>
  `);
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fadeout');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ========== 视图切换 ==========
function switchView(viewName) {
  $$('.view').forEach(v => v.classList.remove('active'));
  $(`#view-${viewName}`).classList.add('active');
  $$('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });
  if (viewName === 'history') renderHistory();
}

// ========== 文件上传 ==========
function initUpload() {
  const zone = $('#uploadZone');
  const input = $('#fileInput');

  zone.addEventListener('click', () => input.click());

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dragover');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  input.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    input.value = '';
  });
}

function handleFiles(files) {
  const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
  if (imageFiles.length === 0) {
    showToast('请上传图片文件', 'error');
    return;
  }

  imageFiles.forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      showToast(`「${file.name}」超过 10MB，已跳过`, 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const photo = {
        id: 'photo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        name: file.name,
        dataURL: e.target.result,
      };
      AppState.photos.push(photo);
      renderPhotoGallery();
      startRecognition(photo.id);
      showToast(`「${file.name}」上传成功`, 'success');
    };
    reader.readAsDataURL(file);
  });
}

function renderPhotoGallery() {
  const gallery = $('#photoGallery');
  gallery.innerHTML = '';

  AppState.photos.forEach(photo => {
    const item = create('div', 'photo-item');
    item.innerHTML = `
      <img src="${photo.dataURL}" alt="${photo.name}">
      <button class="photo-remove" data-id="${photo.id}">✕</button>
    `;
    item.querySelector('.photo-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      removePhoto(photo.id);
    });
    item.addEventListener('click', () => startRecognition(photo.id));
    gallery.appendChild(item);
  });

  // 如果有照片，自动显示下一步
  if (AppState.photos.length > 0) {
    $('#step-recognize').classList.remove('hidden');
  } else {
    $('#step-recognize').classList.add('hidden');
    $('#step-content').classList.add('hidden');
    $('#step-publish').classList.add('hidden');
  }
}

function removePhoto(id) {
  AppState.photos = AppState.photos.filter(p => p.id !== id);
  renderPhotoGallery();
  showToast('已移除照片', 'info');
}

// ========== 智能识别 ==========
function startRecognition(photoId) {
  const photo = AppState.photos.find(p => p.id === photoId);
  if (!photo) return;

  AppState.currentPhotoId = photoId;
  $('#step-recognize').classList.remove('hidden');
  $('#step-recognize').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // 显示预览图
  $('#recognizePreview').innerHTML = `<img src="${photo.dataURL}" alt="${photo.name}">`;

  // 显示加载动画
  $('#recognizeLoading').classList.remove('hidden');
  $('#recognizeResult').classList.add('hidden');

  // 模拟识别步骤
  simulateRecognition();
}

function simulateRecognition() {
  const steps = $$('#loadingSteps .loading-step');
  steps.forEach(s => { s.classList.remove('active', 'done'); });
  steps[0].classList.add('active');

  let currentStep = 0;
  const stepInterval = setInterval(() => {
    steps[currentStep].classList.remove('active');
    steps[currentStep].classList.add('done');
    currentStep++;
    if (currentStep < steps.length) {
      steps[currentStep].classList.add('active');
    } else {
      clearInterval(stepInterval);
      setTimeout(showRecognitionResult, 400);
    }
  }, 600);
}

// ========== AI图片识别（豆包视觉模型 + Canvas回退） ==========
function analyzeImage(dataURL, callback) {
  fetch('http://localhost:8766/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: dataURL }),
  })
  .then(resp => {
    if (!resp.ok) throw new Error('API error: ' + resp.status);
    return resp.json();
  })
  .then(data => {
    if (data.error) throw new Error(data.error);
    callback({
      scene: data.scene || 'lifestyle',
      confidence: '高',
      reasons: [data.description || 'AI视觉模型识别'],
      colors: [data.scene_label || '', data.mood || ''].filter(Boolean),
      objects: data.objects || [],
      mood: data.mood || '',
      keyword: data.keyword || '',
      dishes: data.dishes || [],
      products: data.products || [],
      location_type: data.location_type || '',
      price_range: data.price_range || '',
      description: data.description || '',
      source: 'ai',
    });
  })
  .catch(err => {
    console.warn('AI识别失败，回退到Canvas色彩分析:', err.message);
    analyzeImageByCanvas(dataURL, callback);
  });
}

// ========== Canvas色彩分析（AI失败时的回退方案） ==========
function analyzeImageByCanvas(dataURL, callback) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;

    let r = 0, g = 0, b = 0;
    let warmCount = 0, coolCount = 0, brightCount = 0, darkCount = 0, satCount = 0, greenCount = 0;
    const total = size * size;

    for (let i = 0; i < data.length; i += 4) {
      const pr = data[i], pg = data[i + 1], pb = data[i + 2];
      r += pr; g += pg; b += pb;

      const brightness = (pr + pg + pb) / 3;
      if (brightness > 180) brightCount++;
      if (brightness < 60) darkCount++;

      const max = Math.max(pr, pg, pb);
      const min = Math.min(pr, pg, pb);
      const sat = max === 0 ? 0 : (max - min) / max;
      if (sat > 0.35) satCount++;

      if (pr > pb + 25) warmCount++;
      else if (pb > pr + 25) coolCount++;

      if (pg > pr + 10 && pg > pb + 10) greenCount++;
    }

    const avgR = r / total;
    const avgG = g / total;
    const avgB = b / total;
    const avgBrightness = (avgR + avgG + avgB) / 3;
    const warmRatio = warmCount / total;
    const coolRatio = coolCount / total;
    const brightRatio = brightCount / total;
    const darkRatio = darkCount / total;
    const satRatio = satCount / total;
    const greenRatio = greenCount / total;

    // 启发式场景判断
    let scene = 'lifestyle';
    let confidence = '低';
    const reasons = [];

    if (warmRatio > 0.35 && avgBrightness > 70 && avgBrightness < 200 && satRatio < 0.5) {
      scene = 'food';
      confidence = warmRatio > 0.5 ? '高' : '中';
      reasons.push('暖色调占比高，符合美食场景');
    } else if (satRatio > 0.3 && (brightRatio > 0.2 || greenRatio > 0.15) && avgBrightness > 100) {
      scene = 'travel';
      confidence = satRatio > 0.45 ? '高' : '中';
      reasons.push('饱和度高、亮度大，符合户外风景');
    } else if (warmRatio > 0.2 && avgBrightness > 50 && avgBrightness < 170 && satRatio < 0.35 && darkRatio < 0.3) {
      scene = 'cafe';
      confidence = '中';
      reasons.push('暖色低饱和，符合咖啡店室内环境');
    } else if (brightRatio > 0.35 && avgR > avgG && avgG >= avgB && satRatio < 0.4) {
      scene = 'beauty';
      confidence = '中';
      reasons.push('高亮度偏暖粉调，符合美妆场景');
    } else if (warmRatio > 0.15 && satRatio < 0.3 && avgBrightness > 50 && avgBrightness < 180) {
      scene = 'home';
      confidence = '中';
      reasons.push('暖色低饱和中等亮度，符合家居环境');
    } else if (brightRatio > 0.25 && satRatio > 0.2) {
      scene = 'shopping';
      confidence = '中';
      reasons.push('亮度高有色彩变化，符合商品展示');
    } else {
      scene = 'lifestyle';
      confidence = '低';
      reasons.push('色彩特征不突出，归为日常记录');
    }

    const dominantColor = avgR > avgB + 10 ? '暖色调' : avgB > avgR + 10 ? '冷色调' : '中性色调';
    const lightDesc = avgBrightness > 170 ? '明亮' : avgBrightness > 100 ? '适中' : '偏暗';
    const satDesc = satRatio > 0.35 ? '色彩饱和' : satRatio > 0.18 ? '色彩适中' : '低饱和';

    callback({
      scene,
      confidence,
      reasons,
      colors: [dominantColor, lightDesc, satDesc],
      avgBrightness: avgBrightness.toFixed(0),
      warmRatio: (warmRatio * 100).toFixed(0),
    });
  };
  img.onerror = () => {
    callback({
      scene: 'lifestyle',
      confidence: '低',
      reasons: ['图片读取失败，使用默认场景'],
      colors: ['未知', '未知', '未知'],
      avgBrightness: '0',
      warmRatio: '0',
    });
  };
  img.src = dataURL;
}

function showRecognitionResult() {
  const photo = AppState.photos.find(p => p.id === AppState.currentPhotoId);
  if (!photo) return;

  // 调用AI视觉模型识别图片（失败时自动回退到Canvas色彩分析）
  analyzeImage(photo.dataURL, (analysis) => {
    const defaultScene = analysis.scene;
    AppState.selectedScene = defaultScene;
    AppState.imageAnalysis = analysis;

    const isAI = analysis.source === 'ai';
    // AI识别时使用AI返回的元素，否则用默认
    const recognition = isAI ? {
      objects: analysis.objects || [],
      mood: analysis.mood || '',
    } : DEFAULT_RECOGNITION[defaultScene];
    AppState.recognitionData = recognition;

    // 渲染场景标签
    const sceneTagsEl = $('#sceneTags');
    sceneTagsEl.innerHTML = '';
    Object.entries(SCENE_TYPES).forEach(([key, val]) => {
      const tag = create('button', `scene-tag ${key === defaultScene ? 'active' : ''}`, `
        <span>${val.icon}</span>
        <span>${val.label}</span>
      `);
      tag.addEventListener('click', () => {
        $$('.scene-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        AppState.selectedScene = key;
        updateRecognitionDisplay(key);
      });
      sceneTagsEl.appendChild(tag);
    });

    // 渲染AI识别到的元素标签
    const objectTagsEl = $('#objectTags');
    if (objectTagsEl) {
      objectTagsEl.innerHTML = (recognition.objects || []).map(obj =>
        `<span class="object-tag">${obj}</span>`
      ).join('');
    }
    const moodEl = $('#moodDisplay');
    if (moodEl) moodEl.textContent = recognition.mood || '—';

    // AI识别时自动填充上下文输入框
    if (isAI) {
      if (analysis.keyword && $('#ctxKeyword')) $('#ctxKeyword').value = analysis.keyword;
      if (analysis.location_type && $('#ctxLocation')) $('#ctxLocation').value = analysis.location_type;
      if (analysis.price_range && $('#ctxPrice')) $('#ctxPrice').value = analysis.price_range;
      const dish = (analysis.dishes && analysis.dishes[0]) || (analysis.products && analysis.products[0]) || '';
      if (dish && $('#ctxDish')) $('#ctxDish').value = dish;
    }

    // 渲染分析结果
    const analysisEl = $('#colorAnalysis');
    if (analysisEl) {
      const badgeClass = isAI ? 'confidence-高' : `confidence-${analysis.confidence}`;
      const badgeText = isAI ? '✨ AI视觉识别' : `识别置信度：${analysis.confidence}`;
      const reasonText = isAI
        ? (analysis.description || '豆包视觉模型识别')
        : analysis.reasons.join('；');
      const colorChips = isAI
        ? [analysis.scene_label || '', analysis.mood || '', analysis.price_range ? `人均${analysis.price_range}` : ''].filter(Boolean)
        : analysis.colors;

      analysisEl.innerHTML = `
        <div class="color-chips">
          ${colorChips.map(c => `<span class="color-chip">${c}</span>`).join('')}
        </div>
        <div class="analysis-reason">
          <span class="confidence-badge ${badgeClass}">${badgeText}</span>
          <span>${reasonText}</span>
        </div>
      `;
    }

    // 切换显示
    $('#recognizeLoading').classList.add('hidden');
    $('#recognizeResult').classList.remove('hidden');
  });
}

function updateRecognitionDisplay(scene) {
  const recognition = DEFAULT_RECOGNITION[scene];
  AppState.recognitionData = recognition;

  // 渲染元素标签
  const objectTagsEl = $('#objectTags');
  objectTagsEl.innerHTML = recognition.objects.map(obj => 
    `<span class="object-tag">${obj}</span>`
  ).join('');

  // 渲染氛围
  $('#moodDisplay').textContent = recognition.mood;
}

// ========== 生成文案 ==========
function generateContent() {
  const scene = AppState.selectedScene;
  const context = {
    keyword: $('#ctxKeyword').value.trim(),
    location: $('#ctxLocation').value.trim(),
    price: $('#ctxPrice').value.trim(),
    dish1: $('#ctxDish').value.trim(),
    wordCount: AppState.wordCount,
  };

  // 生成三个平台的文案
  const platforms = ['dianping', 'xiaohongshu', 'douyin'];
  platforms.forEach(platform => {
    AppState.generatedContent[platform] = copyGenerator.generate(platform, scene, context);
  });

  // 显示文案区域
  $('#step-content').classList.remove('hidden');
  $('#step-publish').classList.remove('hidden');

  // 渲染文案
  renderContent();
  // 渲染分发平台卡片
  renderPublishPlatforms();
  // 拉取爆款笔记参考
  fetchHotNotes(AppState.selectedScene);

  // 滚动到文案区
  $('#step-content').scrollIntoView({ behavior: 'smooth', block: 'start' });

  showToast('文案生成完成！已适配 3 个平台', 'success');

  // 保存到历史
  saveToHistory();
}

function renderContent() {
  const display = $('#contentDisplay');
  display.innerHTML = '';

  // 只渲染当前选中的平台
  const platform = AppState.currentPlatform;
  const content = AppState.generatedContent[platform];
  if (!content) return;

  const config = PLATFORM_CONFIG[platform];
  const card = create('div', `content-card platform-${platform}`);
  card.innerHTML = `
    <div class="content-title-row">
      <div class="content-platform-label">
        <span>${config.icon}</span>
        <span>${config.name}</span>
        <span style="font-size: 12px; color: var(--text-muted); font-weight: 400;">${config.style}</span>
      </div>
    </div>
    <div class="content-title-box">
      <div class="content-title-label">标题</div>
      <input type="text" class="content-title" id="title_${platform}" value="${escapeHtml(content.title)}">
    </div>
    <div>
      <div class="content-body-label">
        <span>正文</span>
        <span class="char-count" id="charcount_${platform}">${content.content.length} 字</span>
      </div>
      <textarea class="content-body" id="body_${platform}">${escapeHtml(content.content)}</textarea>
    </div>
    <div class="content-hashtags">
      ${content.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join('')}
    </div>
    <div class="content-actions">
      <button class="btn-small btn-regenerate" data-platform="${platform}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        换一版
      </button>
      <button class="btn-small btn-copy" data-platform="${platform}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        复制全部
      </button>
      <button class="btn-small btn-copy-title" data-platform="${platform}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/></svg>
        复制标题
      </button>
      <button class="btn-small btn-copy-body" data-platform="${platform}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        复制正文
      </button>
      <button class="btn-small btn-copy-tags" data-platform="${platform}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
        复制标签
      </button>
    </div>
  `;

  // 绑定事件
  card.querySelector('.btn-regenerate').addEventListener('click', (e) => {
    regenerateContent(e.currentTarget.dataset.platform);
  });
  card.querySelector('.btn-copy').addEventListener('click', (e) => {
    copyContent(e.currentTarget.dataset.platform, 'all');
  });
  card.querySelector('.btn-copy-title').addEventListener('click', (e) => {
    copyContent(e.currentTarget.dataset.platform, 'title');
  });
  card.querySelector('.btn-copy-body').addEventListener('click', (e) => {
    copyContent(e.currentTarget.dataset.platform, 'body');
  });
  card.querySelector('.btn-copy-tags').addEventListener('click', (e) => {
    copyContent(e.currentTarget.dataset.platform, 'tags');
  });

  // 监听编辑
  card.querySelector(`#title_${platform}`).addEventListener('input', (e) => {
    content.title = e.target.value;
  });
  card.querySelector(`#body_${platform}`).addEventListener('input', (e) => {
    content.content = e.target.value;
    const countEl = card.querySelector(`#charcount_${platform}`);
    if (countEl) countEl.textContent = `${e.target.value.length} 字`;
  });

  display.appendChild(card);
}

function regenerateContent(platform) {
  const scene = AppState.selectedScene;
  const context = {
    keyword: $('#ctxKeyword').value.trim(),
    location: $('#ctxLocation').value.trim(),
    price: $('#ctxPrice').value.trim(),
    dish1: $('#ctxDish').value.trim(),
    wordCount: AppState.wordCount,
  };

  AppState.generatedContent[platform] = copyGenerator.regenerate(platform, scene, context);
  renderContent();
  showToast(`${PLATFORM_CONFIG[platform].name}文案已重新生成`, 'success');
  saveToHistory();
}

function copyContent(platform, type) {
  const content = AppState.generatedContent[platform];
  if (!content) return;

  let text = '';
  let label = '';
  switch (type) {
    case 'title':
      text = content.title;
      label = '标题';
      break;
    case 'body':
      text = content.content;
      label = '正文';
      break;
    case 'tags':
      text = content.hashtags.join(' ');
      label = '标签';
      break;
    case 'all':
    default:
      text = `${content.title}\n\n${content.content}\n\n${content.hashtags.join(' ')}`;
      label = '全部内容';
      break;
  }

  navigator.clipboard.writeText(text).then(() => {
    showToast(`${label}已复制到剪贴板`, 'success');
  }).catch(() => {
    // 降级方案
    const textarea = create('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast(`${label}已复制到剪贴板`, 'success');
  });
}

// ========== 平台标签切换 ==========
function initPlatformTabs() {
  $$('.platform-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.platform-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      AppState.currentPlatform = tab.dataset.platform;
      renderContent();
    });
  });
}

// ========== 一键分发 ==========
function initPublish() {
  renderPublishPlatforms();

  $('#btnPublishAll').addEventListener('click', publishAll);
  $('#btnExport').addEventListener('click', exportContent);
  $('#btnReset').addEventListener('click', resetAll);
}

function renderPublishPlatforms() {
  const container = $('#publishPlatforms');
  container.innerHTML = '';

  const platforms = ['dianping', 'xiaohongshu', 'douyin'];
  platforms.forEach(platform => {
    const content = AppState.generatedContent[platform];
    if (!content) return;

    const config = PLATFORM_CONFIG[platform];
    const card = create('div', 'publish-platform-card selected');
    card.dataset.platform = platform;
    card.innerHTML = `
      <div class="pp-header">
        <span class="pp-name">${config.icon} ${config.name}</span>
        <div class="pp-check">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>
      <div class="pp-title">标题预览</div>
      <div class="pp-title-text">${escapeHtml(content.title)}</div>
      <div class="pp-status" id="status_${platform}">待发布</div>
    `;

    card.addEventListener('click', () => {
      card.classList.toggle('selected');
    });

    container.appendChild(card);
  });
}

async function publishAll() {
  const selectedCards = $$('.publish-platform-card.selected');
  if (selectedCards.length === 0) {
    showToast('请至少选择一个平台', 'error');
    return;
  }

  $('#btnPublishAll').disabled = true;
  $('#btnPublishAll').style.opacity = '0.6';
  $('#publishLog').innerHTML = '';

  const log = $('#publishLog');
  const platforms = Array.from(selectedCards).map(c => c.dataset.platform);

  addLog('info', `开始分发到 ${platforms.length} 个平台...`);

  for (const platform of platforms) {
    const config = PLATFORM_CONFIG[platform];
    const statusEl = $(`#status_${platform}`);
    const card = $(`.publish-platform-card[data-platform="${platform}"]`);

    // 发布中
    statusEl.className = 'pp-status publishing';
    statusEl.textContent = '发布中...';
    card.style.pointerEvents = 'none';

    addLog('info', `正在投递至${config.name}...`);

    // 模拟发布过程
    await sleep(1500 + Math.random() * 1000);

    // 随机成功/失败（大部分成功）
    const success = Math.random() > 0.1;
    if (success) {
      statusEl.className = 'pp-status published';
      statusEl.textContent = '✓ 已发布';
      addLog('success', `${config.name}发布成功！`);
      AppState.publishStatus[platform] = 'published';
    } else {
      statusEl.className = 'pp-status failed';
      statusEl.textContent = '✕ 发布失败';
      addLog('error', `${config.name}发布失败，请稍后重试`);
      AppState.publishStatus[platform] = 'failed';
    }
    card.style.pointerEvents = '';
  }

  addLog('info', '分发流程已完成');
  $('#btnPublishAll').disabled = false;
  $('#btnPublishAll').style.opacity = '';

  const successCount = platforms.filter(p => AppState.publishStatus[p] === 'published').length;
  if (successCount === platforms.length) {
    showToast(`全部 ${platforms.length} 个平台发布成功！`, 'success');
  } else {
    showToast(`${successCount}/${platforms.length} 个平台发布成功`, 'info');
  }
}

function addLog(type, text) {
  const log = $('#publishLog');
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const entry = create('div', `log-entry ${type}`, `
    <span class="log-time">[${time}]</span>
    <span class="log-text">${text}</span>
  `);
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

function exportContent() {
  const platforms = ['dianping', 'xiaohongshu', 'douyin'];
  let exportText = '========== 图媒适配文案导出 ==========\n';
  exportText += `导出时间：${new Date().toLocaleString('zh-CN')}\n`;
  exportText += `场景类型：${SCENE_TYPES[AppState.selectedScene]?.label || '未知'}\n`;
  exportText += '='.repeat(40) + '\n\n';

  platforms.forEach(platform => {
    const content = AppState.generatedContent[platform];
    if (!content) return;
    const config = PLATFORM_CONFIG[platform];
    exportText += `【${config.name}】\n`;
    exportText += `标题：${content.title}\n\n`;
    exportText += `正文：\n${content.content}\n\n`;
    exportText += `标签：${content.hashtags.join(' ')}\n`;
    exportText += '-'.repeat(40) + '\n\n';
  });

  const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = create('a');
  a.href = url;
  a.download = `文案导出_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('文案已导出', 'success');
}

function resetAll() {
  if (!confirm('确定要重新开始吗？当前内容将被清空。')) return;

  AppState.photos = [];
  AppState.currentPhotoId = null;
  AppState.generatedContent = {};
  AppState.publishStatus = {};

  $('#step-recognize').classList.add('hidden');
  $('#step-content').classList.add('hidden');
  $('#step-publish').classList.add('hidden');

  renderPhotoGallery();
  $('#publishLog').innerHTML = '';
  showToast('已重置，可以开始新的创作', 'info');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== 历史记录 ==========
function saveToHistory() {
  const platforms = ['dianping', 'xiaohongshu', 'douyin'];
  const record = {
    id: 'hist_' + Date.now(),
    timestamp: new Date().toISOString(),
    scene: AppState.selectedScene,
    contents: platforms.map(p => AppState.generatedContent[p]).filter(c => c),
  };

  AppState.history.unshift(record);
  if (AppState.history.length > 50) {
    AppState.history = AppState.history.slice(0, 50);
  }
  saveHistoryToStorage();
}

function saveHistoryToStorage() {
  try {
    localStorage.setItem('tumeishi_history', JSON.stringify(AppState.history));
  } catch (e) {
    console.warn('无法保存历史记录', e);
  }
}

function loadHistoryFromStorage() {
  try {
    const data = localStorage.getItem('tumeishi_history');
    if (data) AppState.history = JSON.parse(data);
  } catch (e) {
    console.warn('无法读取历史记录', e);
  }
}

function renderHistory() {
  const list = $('#historyList');
  list.innerHTML = '';

  if (AppState.history.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <p>暂无历史记录</p>
      </div>
    `;
    return;
  }

  AppState.history.forEach(record => {
    const date = new Date(record.timestamp);
    const timeStr = date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    const sceneInfo = SCENE_TYPES[record.scene];

    const platformBadges = record.contents.map(c => {
      const config = PLATFORM_CONFIG[c.platform];
      return `<span class="history-platform-badge ${c.platform}">${config.name}</span>`;
    }).join('');

    const firstContent = record.contents[0] || {};
    const title = firstContent.title || '无标题';
    const preview = firstContent.content || '';

    const item = create('div', 'history-item');
    item.innerHTML = `
      <div class="history-item-header">
        <div class="history-item-platforms">
          <span class="history-platform-badge" style="background: rgba(108, 92, 231, 0.1); color: var(--primary);">${sceneInfo?.icon || ''} ${sceneInfo?.label || ''}</span>
          ${platformBadges}
        </div>
        <span class="history-item-time">${timeStr}</span>
      </div>
      <div class="history-item-title">${escapeHtml(title)}</div>
      <div class="history-item-preview">${escapeHtml(preview.slice(0, 100))}...</div>
    `;

    item.addEventListener('click', () => {
      // 恢复历史记录
      AppState.selectedScene = record.scene;
      record.contents.forEach(c => {
        AppState.generatedContent[c.platform] = c;
      });
      switchView('workspace');
      $('#step-content').classList.remove('hidden');
      $('#step-publish').classList.remove('hidden');
      renderContent();
      renderPublishPlatforms();
      $('#step-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast('已恢复历史记录', 'success');
    });

    list.appendChild(item);
  });
}

function initHistoryClear() {
  $('#btnClearHistory').addEventListener('click', () => {
    if (!confirm('确定要清空全部历史记录吗？')) return;
    AppState.history = [];
    saveHistoryToStorage();
    renderHistory();
    showToast('历史记录已清空', 'info');
  });
}

// ========== 工具函数 ==========
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== 初始化 ==========
function init() {
  loadHistoryFromStorage();
  initUpload();
  initPlatformTabs();
  initPublish();
  initHistoryClear();

  // 导航
  $$('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // 生成按钮
  $('#btnGenerate').addEventListener('click', generateContent);

  // 字数选择器
  $$('.wc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.wc-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.wordCount = btn.dataset.wc;
    });
  });

  // 添加示例图片入口（方便测试）
  addSampleButton();

  // 爆款参考刷新按钮
  const refreshBtn = $('#btnRefreshHotNotes');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      fetchHotNotes(AppState.selectedScene);
    });
  }
}

// ========== 爆款笔记参考 ==========
const SCENE_HOT_KEYWORDS = {
  food: '美食探店,餐厅推荐,宝藏餐厅,吃货日常,美食分享',
  cafe: '咖啡店,下午茶,甜品店,咖啡店拍照,咖啡馆',
  travel: '旅行攻略,景点打卡,旅游推荐,小众旅行,周末出游',
  shopping: '好物推荐,平价好物,好物分享,种草好物,购物分享',
  lifestyle: '日常记录,生活碎片,日常vlog,周末日常,生活日常',
  beauty: '美妆测评,护肤推荐,化妆教程,好物分享,平价美妆',
  home: '家居好物,收纳好物,租房改造,提升幸福感,家居分享',
  pet: '萌宠日常,猫咪日常,养猫日常,宠物日常,狗狗日常',
};

async function fetchHotNotes(scene) {
  const listEl = $('#hotNotesList');
  if (!listEl) return;
  listEl.innerHTML = '<div class="hot-notes-loading">加载中...</div>';

  const keyword = SCENE_HOT_KEYWORDS[scene] || '美食探店';
  try {
    const resp = await fetch(`http://127.0.0.1:8766/api/hot-notes?scene=${scene}&keyword=${encodeURIComponent(keyword)}`);
    if (!resp.ok) throw new Error('API错误');
    const data = await resp.json();
    renderHotNotes(data);
  } catch (err) {
    listEl.innerHTML = '<div class="hot-notes-loading">爆款数据服务未启动，不影响文案生成</div>';
  }
}

function renderHotNotes(data) {
  const listEl = $('#hotNotesList');
  if (!listEl) return;

  if (!data.items || data.items.length === 0) {
    listEl.innerHTML = '<div class="hot-notes-loading">暂无相关爆款笔记</div>';
    return;
  }

  listEl.innerHTML = data.items.map(note => `
    <a class="hot-note-card" href="${note.link}" target="_blank" rel="noopener">
      <div class="hot-note-title">${escapeHtml(note.title)}</div>
      <div class="hot-note-meta">
        <span class="hot-note-interactions">❤️ ${note.interactions}</span>
        <span>@${escapeHtml(note.author)}</span>
        <span>${note.date}</span>
      </div>
      ${note.desc ? `<div class="hot-note-desc">${escapeHtml(note.desc)}</div>` : ''}
    </a>
  `).join('');
}

function addSampleButton() {
  // 添加一个"使用示例图片"的便捷按钮
  const uploadZone = $('#uploadZone');
  const sampleBtn = create('button', 'btn-secondary', '使用示例图片体验');
  sampleBtn.style.cssText = 'margin-top: 16px; font-size: 13px; padding: 8px 16px;';
  sampleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    generateSamplePhoto();
  });
  uploadZone.querySelector('.upload-placeholder').appendChild(sampleBtn);
}

function generateSamplePhoto() {
  // 加载真实的示例照片（美食照片）
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const dataURL = canvas.toDataURL('image/jpeg', 0.85);

    const photo = {
      id: 'photo_sample_' + Date.now(),
      name: '示例图片.jpg',
      dataURL: dataURL,
    };
    AppState.photos.push(photo);
    renderPhotoGallery();
    startRecognition(photo.id);
    showToast('示例图片已添加，豆包AI 识别已启动', 'success');
  };
  img.onerror = () => {
    // 如果真实图片加载失败，回退到Canvas生成
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff9a9e';
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('示例图片', 200, 200);
    const dataURL = canvas.toDataURL('image/png');
    const photo = {
      id: 'photo_sample_' + Date.now(),
      name: '示例图片.png',
      dataURL: dataURL,
    };
    AppState.photos.push(photo);
    renderPhotoGallery();
    startRecognition(photo.id);
  };
  img.src = 'assets/sample-food.jpg';
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);
