/**
 * Image Studio - 本地图像格式转换压缩网页（增强版）
 * 纯前端实现，所有处理均在浏览器本地 Canvas 中完成
 * @version 1.0.0
 */
(function () {
  'use strict';

  // ========================= 常量与默认配置 =========================

  const MIME_TYPES = {
    png: 'image/png',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    webp: 'image/webp',
    avif: 'image/avif',
    gif: 'image/gif',
    bmp: 'image/bmp'
  };

  const PRESETS = {
    web: { format: 'webp', quality: 80, resizeMode: 'none' },
    compress: { format: 'webp', quality: 60, resizeMode: 'none' },
    quality: { format: 'png', quality: 95, resizeMode: 'none' },
    social: { format: 'jpeg', quality: 85, resizeMode: 'fit', resizeMax: 1920 },
    avatar: { format: 'png', quality: 90, resizeMode: 'fit', resizeMax: 512, cropRatio: 1 }
  };

  const FILTER_PRESETS = {
    none: { brightness: 100, contrast: 100, saturate: 100, hue: 0, blur: 0 },
    grayscale: { brightness: 100, contrast: 110, saturate: 0, hue: 0, blur: 0 },
    sepia: { brightness: 105, contrast: 95, saturate: 80, hue: 0, blur: 0 },
    vintage: { brightness: 110, contrast: 90, saturate: 75, hue: 0, blur: 0 },
    cool: { brightness: 100, contrast: 105, saturate: 90, hue: 0, blur: 0 },
    warm: { brightness: 105, contrast: 100, saturate: 110, hue: 0, blur: 0 },
    highContrast: { brightness: 100, contrast: 150, saturate: 110, hue: 0, blur: 0 },
    oil: { brightness: 100, contrast: 120, saturate: 110, hue: 0, blur: 0 },
    sharpen: { brightness: 100, contrast: 110, saturate: 100, hue: 0, blur: 0 },
    vignette: { brightness: 95, contrast: 110, saturate: 100, hue: 0, blur: 0 }
  };

  // ========================= 状态管理 =========================

  const state = {
    results: [],
    selectedId: null,
    watermarkImage: null,
    capabilities: {},
    isProcessing: false,
    processingCount: 0,
    theme: 'auto',
    settings: {
      format: 'png',
      quality: 80,
      resizeMode: 'none',
      resizePercent: 100,
      resizeMax: 1920,
      rotate: 0,
      flipH: false,
      flipV: false,
      crop: null,
      borderColor: '#ffffff',
      borderWidth: 0,
      borderRadius: 0,
      adjustments: { brightness: 100, contrast: 100, saturate: 100, hue: 0, blur: 0 },
      filterName: 'none',
      watermarkType: 'text',
      watermarkText: 'Image Studio',
      watermarkColor: '#ffffff',
      watermarkSize: 48,
      watermarkOpacity: 50,
      watermarkPosition: 4,
      watermarkMode: 'single',
      splitMode: 'none',
      splitCols: 2,
      splitRows: 2,
      splitSize: 512
    }
  };

  // ========================= DOM 元素缓存 =========================

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const els = {
    capabilityBadges: $('#capabilityBadges'),
    themeToggle: $('#themeToggle'),
    uploadZone: $('#uploadZone'),
    uploadOverlay: $('#uploadOverlay'),
    fileInput: $('#fileInput'),
    resultsSection: $('#resultsSection'),
    resultList: $('#resultList'),
    resultsCount: $('#resultsCount'),
    summaryLine: $('#summaryLine'),
    emptyState: $('#emptyState'),
    progressBar: $('#progressBar'),
    progressFill: $('#progressFill'),
    progressText: $('#progressText'),
    clearAllBtn: $('#clearAllBtn'),
    downloadZipBtn: $('#downloadZipBtn'),
    toastContainer: $('#toastContainer'),
    cropModal: $('#cropModal'),
    cropperCanvas: $('#cropperCanvas'),
    cropperFrame: $('#cropperFrame'),
    cropWidthInput: $('#cropWidthInput'),
    cropHeightInput: $('#cropHeightInput'),
    compareModal: $('#compareModal'),
    compareBefore: $('#compareBefore'),
    compareAfter: $('#compareAfter'),
    compareAfterWrap: $('#compareAfterWrap'),
    compareSlider: $('#compareSlider'),
    infoModal: $('#infoModal'),
    infoPreview: $('#infoPreview'),
    infoList: $('#infoList'),
    exifModal: $('#exifModal'),
    exifPreview: $('#exifPreview'),
    exifList: $('#exifList'),
    paletteModal: $('#paletteModal'),
    palettePreview: $('#palettePreview'),
    paletteGrid: $('#paletteGrid'),
    renameModal: $('#renameModal'),
    renameTemplate: $('#renameTemplate'),
    renamePreview: $('#renamePreview'),
    watermarkImageName: $('#watermarkImageName')
  };

  // ========================= 工具函数 =========================

  /**
   * 格式化字节大小
   * @param {number} bytes
   * @returns {string}
   */
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  }

  /**
   * 获取文件扩展名（不含点）
   * @param {string} name
   * @returns {string}
   */
  function getExt(name) {
    const idx = name.lastIndexOf('.');
    return idx > 0 ? name.slice(idx + 1).toLowerCase() : '';
  }

  /**
   * 获取不带扩展名的文件名
   * @param {string} name
   * @returns {string}
   */
  function getBaseName(name) {
    const idx = name.lastIndexOf('.');
    return idx > 0 ? name.slice(0, idx) : name;
  }

  /**
   * 复制文本到剪贴板
   * @param {string} text
   */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast('已复制 ' + text, 'success');
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast('已复制 ' + text, 'success');
    }
  }

  /**
   * 将 HEX 颜色转为 RGB 对象
   * @param {string} hex
   * @returns {{r:number,g:number,b:number}}
   */
  function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  /**
   * 生成唯一 ID
   * @returns {string}
   */
  function uid() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  // ========================= 主题管理 =========================

  function initTheme() {
    const saved = localStorage.getItem('imageStudio.theme');
    state.theme = saved || 'auto';
    document.documentElement.setAttribute('data-theme', state.theme);
  }

  function cycleTheme() {
    const order = ['light', 'dark', 'auto'];
    const idx = order.indexOf(state.theme);
    state.theme = order[(idx + 1) % order.length];
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('imageStudio.theme', state.theme);
    toast(`主题已切换为 ${state.theme === 'auto' ? '跟随系统' : state.theme === 'dark' ? '暗色' : '浅色'}`, 'info');
  }

  // ========================= Toast 通知 =========================

  /**
   * 显示 Toast 提示
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} type
   * @param {number} duration
   */
  function toast(message, type = 'info', duration = 2600) {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    els.toastContainer.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(20px)';
      setTimeout(() => el.remove(), 200);
    }, duration);
  }

  // ========================= 浏览器能力探测 =========================

  /**
   * 探测 Canvas 是否支持某种 MIME 类型编码
   * @param {string} type
   * @returns {boolean}
   */
  function checkCanvasEncode(type) {
    try {
      const c = document.createElement('canvas');
      c.width = 2;
      c.height = 2;
      return c.toDataURL(type).indexOf(type) !== -1;
    } catch (e) {
      return false;
    }
  }

  /**
   * 通过 Image.decode 验证格式解码支持
   * @param {string} type
   * @returns {Promise<boolean>}
   */
  function checkImageDecode(type) {
    return new Promise((resolve) => {
      try {
        const c = document.createElement('canvas');
        c.width = 2;
        c.height = 2;
        const url = c.toDataURL(type);
        const img = new Image();
        img.onload = () => {
          if (img.decode) {
            img.decode().then(() => resolve(true)).catch(() => resolve(false));
          } else {
            resolve(true);
          }
        };
        img.onerror = () => resolve(false);
        img.src = url;
      } catch (e) {
        resolve(false);
      }
    });
  }

  async function detectCapabilities() {
    const formats = [
      { key: 'png', type: 'image/png' },
      { key: 'jpeg', type: 'image/jpeg' },
      { key: 'webp', type: 'image/webp', verify: true },
      { key: 'avif', type: 'image/avif', verify: true },
      { key: 'gif', type: 'image/gif' }
    ];

    for (const f of formats) {
      let supported = checkCanvasEncode(f.type);
      if (supported && f.verify) {
        supported = await checkImageDecode(f.type);
      }
      state.capabilities[f.key] = supported;
    }

    renderCapabilityBadges();
    updateFormatAvailability();
  }

  function renderCapabilityBadges() {
    const labels = {
      png: 'PNG',
      jpeg: 'JPG',
      webp: 'WebP',
      avif: 'AVIF',
      gif: 'GIF'
    };
    const html = Object.entries(labels).map(([key, label]) => {
      const supported = state.capabilities[key];
      return `<span class="badge ${supported ? 'badge-success' : 'badge-disabled'}">${label}</span>`;
    }).join('');
    els.capabilityBadges.innerHTML = html;
  }

  function updateFormatAvailability() {
    $$('.format-radio[data-requires]').forEach((label) => {
      const key = label.getAttribute('data-requires');
      const input = label.querySelector('input');
      const supported = state.capabilities[key];
      input.disabled = !supported;
      if (!supported && input.checked) {
        input.checked = false;
        $('input[name="outputFormat"][value="png"]').checked = true;
        state.settings.format = 'png';
        updateQualityUI();
      }
    });
  }

  // ========================= 模态框管理 =========================

  function openModal(modal) {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.hidden = true;
    const anyOpen = $$('.modal').some((m) => !m.hidden);
    if (!anyOpen) document.body.style.overflow = '';
  }

  function closeAllModals() {
    $$('.modal').forEach((m) => closeModal(m));
  }

  // ========================= Tab 切换 =========================

  function initTabs() {
    $$('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchTab(tab);
      });
    });
  }

  function switchTab(tab) {
    $$('.tab-btn').forEach((btn) => {
      const active = btn.dataset.tab === tab;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    $$('.tab-panel').forEach((panel) => {
      panel.classList.toggle('is-active', panel.id === `panel-${tab}`);
      panel.hidden = panel.id !== `panel-${tab}`;
    });
  }

  // ========================= 设置绑定 =========================

  function bindSettings() {
    // 输出格式
    $$('input[name="outputFormat"]').forEach((input) => {
      input.addEventListener('change', () => {
        state.settings.format = input.value;
        updateQualityUI();
        reprocessAll();
      });
    });

    // 质量
    $('#qualitySlider').addEventListener('input', (e) => {
      state.settings.quality = parseInt(e.target.value, 10);
      $('#qualityValue').textContent = state.settings.quality;
      debouncedReprocess();
    });

    // 尺寸调整
    $$('input[name="resizeMode"]').forEach((input) => {
      input.addEventListener('change', () => {
        state.settings.resizeMode = input.value;
        updateResizeUI();
        reprocessAll();
      });
    });

    $('#resizePercent').addEventListener('input', (e) => {
      state.settings.resizePercent = parseInt(e.target.value, 10);
      $('#percentValue').textContent = state.settings.resizePercent + '%';
      debouncedReprocess();
    });

    $('#resizeMax').addEventListener('change', (e) => {
      state.settings.resizeMax = parseInt(e.target.value, 10) || 1920;
      reprocessAll();
    });

    // 旋转翻转
    $('#rotateLeft').addEventListener('click', () => {
      state.settings.rotate = (state.settings.rotate - 90 + 360) % 360;
      reprocessAll();
    });
    $('#rotateRight').addEventListener('click', () => {
      state.settings.rotate = (state.settings.rotate + 90) % 360;
      reprocessAll();
    });
    $('#flipH').addEventListener('click', () => {
      state.settings.flipH = !state.settings.flipH;
      reprocessAll();
    });
    $('#flipV').addEventListener('click', () => {
      state.settings.flipV = !state.settings.flipV;
      reprocessAll();
    });

    // 裁剪预设
    $$('#cropPresets .chip, #cropperPresets .chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const ratio = chip.dataset.ratio;
        $$('#cropPresets .chip, #cropperPresets .chip').forEach((c) => c.classList.toggle('is-active', c.dataset.ratio === ratio));
        state.settings.crop = state.settings.crop || {};
        state.settings.crop.ratio = ratio;
        if (ratio !== 'free') {
          state.settings.crop.ratioValue = parseFloat(ratio);
        }
        if (cropState.active) {
          setCropRatio(ratio === 'free' ? null : parseFloat(ratio));
        }
      });
    });

    // 边框圆角
    $('#borderColor').addEventListener('input', (e) => {
      state.settings.borderColor = e.target.value;
      reprocessAll();
    });
    $('#borderWidth').addEventListener('input', (e) => {
      state.settings.borderWidth = parseInt(e.target.value, 10) || 0;
      reprocessAll();
    });
    $('#borderRadius').addEventListener('input', (e) => {
      state.settings.borderRadius = parseInt(e.target.value, 10) || 0;
      reprocessAll();
    });

    // 滤镜预设
    $$('.filter-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        $$('.filter-chip').forEach((c) => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        const name = chip.dataset.filter;
        state.settings.filterName = name;
        const preset = FILTER_PRESETS[name];
        if (preset) {
          state.settings.adjustments = { ...preset };
          updateAdjustmentUI();
          reprocessAll();
        }
      });
    });

    // 色彩调整
    ['brightness', 'contrast', 'saturate', 'hue', 'blur'].forEach((key) => {
      const input = $(`#${key}`);
      input.addEventListener('input', () => {
        state.settings.adjustments[key] = parseFloat(input.value);
        $(`#${key}Value`).textContent = input.value;
        state.settings.filterName = 'custom';
        $$('.filter-chip').forEach((c) => c.classList.remove('is-active'));
        debouncedReprocess();
      });
    });

    // 水印
    $$('input[name="watermarkType"]').forEach((input) => {
      input.addEventListener('change', () => {
        state.settings.watermarkType = input.value;
        updateWatermarkUI();
        reprocessAll();
      });
    });

    $('#watermarkText').addEventListener('input', (e) => {
      state.settings.watermarkText = e.target.value;
      reprocessAll();
    });
    $('#watermarkColor').addEventListener('input', (e) => {
      state.settings.watermarkColor = e.target.value;
      reprocessAll();
    });
    $('#watermarkSize').addEventListener('input', (e) => {
      state.settings.watermarkSize = parseInt(e.target.value, 10);
      $('#watermarkSizeValue').textContent = state.settings.watermarkSize;
      reprocessAll();
    });
    $('#watermarkOpacity').addEventListener('input', (e) => {
      state.settings.watermarkOpacity = parseInt(e.target.value, 10);
      $('#watermarkOpacityValue').textContent = state.settings.watermarkOpacity;
      reprocessAll();
    });
    $('#watermarkPosition').addEventListener('change', (e) => {
      state.settings.watermarkPosition = parseInt(e.target.value, 10);
      reprocessAll();
    });
    $('#watermarkMode').addEventListener('change', (e) => {
      state.settings.watermarkMode = e.target.value;
      reprocessAll();
    });

    $('#uploadWatermarkBtn').addEventListener('click', () => $('#watermarkImageInput').click());
    $('#watermarkImageInput').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) loadWatermark(file);
    });

    // 切片
    $('#splitMode').addEventListener('change', (e) => {
      state.settings.splitMode = e.target.value;
      updateSplitUI();
    });
    $('#splitCols').addEventListener('change', () => { state.settings.splitCols = parseInt($('#splitCols').value, 10) || 2; });
    $('#splitRows').addEventListener('change', () => { state.settings.splitRows = parseInt($('#splitRows').value, 10) || 2; });
    $('#splitSize').addEventListener('change', () => { state.settings.splitSize = parseInt($('#splitSize').value, 10) || 512; });

    // 预设
    $$('.preset-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        applyPreset(chip.dataset.preset);
      });
    });

    // 工具按钮
    $('#openRenameBtn').addEventListener('click', openRenameModal);
    $('#renameTemplate').addEventListener('input', updateRenamePreview);
    $('#applyRenameBtn').addEventListener('click', applyRename);
    $('#extractPaletteBtn').addEventListener('click', openPaletteModal);
    $('#viewExifBtn').addEventListener('click', openExifModal);
    $('#openCropBtn').addEventListener('click', openCropModal);
    $('#applyCropBtn').addEventListener('click', applyCrop);

    // 清空/下载
    $('#clearAllBtn').addEventListener('click', clearAllResults);
    $('#downloadZipBtn').addEventListener('click', downloadZip);

    // 主题
    els.themeToggle.addEventListener('click', cycleTheme);

    // 模态框关闭
    $$('[data-close-modal]').forEach((el) => {
      el.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) closeModal(modal);
      });
    });
  }

  function updateQualityUI() {
    const lossy = ['jpeg', 'webp', 'avif'].includes(state.settings.format);
    $('#qualitySlider').disabled = !lossy;
    $('#qualityGroup').classList.toggle('is-disabled', !lossy);
  }

  function updateResizeUI() {
    const mode = state.settings.resizeMode;
    $('#percentControl').hidden = mode !== 'percent';
    $('#fitControl').hidden = mode !== 'fit';
  }

  function updateWatermarkUI() {
    const type = state.settings.watermarkType;
    $('#watermarkTextControls').hidden = type !== 'text';
    $('#watermarkImageControls').hidden = type !== 'image';
  }

  function updateSplitUI() {
    const mode = state.settings.splitMode;
    $('#splitCustomControls').hidden = mode !== 'custom';
    $('#splitStripeControls').hidden = mode !== 'stripeW' && mode !== 'stripeH';
  }

  function updateAdjustmentUI() {
    const a = state.settings.adjustments;
    $('#brightness').value = a.brightness;
    $('#brightnessValue').textContent = a.brightness;
    $('#contrast').value = a.contrast;
    $('#contrastValue').textContent = a.contrast;
    $('#saturate').value = a.saturate;
    $('#saturateValue').textContent = a.saturate;
    $('#hue').value = a.hue;
    $('#hueValue').textContent = a.hue;
    $('#blur').value = a.blur;
    $('#blurValue').textContent = a.blur;
  }

  function applyPreset(name) {
    const preset = PRESETS[name];
    if (!preset) return;

    $$('.preset-chip').forEach((c) => c.classList.toggle('is-active', c.dataset.preset === name));

    state.settings.format = preset.format;
    state.settings.quality = preset.quality;
    state.settings.resizeMode = preset.resizeMode || 'none';
    if (preset.resizeMax) state.settings.resizeMax = preset.resizeMax;

    $(`input[name="outputFormat"][value="${preset.format}"]`).checked = true;
    $('#qualitySlider').value = preset.quality;
    $('#qualityValue').textContent = preset.quality;
    $(`input[name="resizeMode"][value="${state.settings.resizeMode}"]`).checked = true;
    $('#resizeMax').value = state.settings.resizeMax;

    if (preset.cropRatio) {
      state.settings.crop = state.settings.crop || {};
      state.settings.crop.ratio = String(preset.cropRatio);
      state.settings.crop.ratioValue = preset.cropRatio;
      $$('#cropPresets .chip').forEach((c) => c.classList.toggle('is-active', c.dataset.ratio === String(preset.cropRatio)));
    }

    updateQualityUI();
    updateResizeUI();
    reprocessAll();
    toast(`已应用预设：${name === 'web' ? '网页用' : name === 'compress' ? '极致压缩' : name === 'quality' ? '高质量' : name === 'social' ? '社交媒体' : '头像'}`, 'success');
  }

  // ========================= 防抖重处理 =========================

  let reprocessTimer = null;
  function debouncedReprocess() {
    clearTimeout(reprocessTimer);
    reprocessTimer = setTimeout(reprocessAll, 120);
  }

  // ========================= 上传处理 =========================

  function initUpload() {
    // 点击上传
    els.uploadZone.addEventListener('click', () => els.fileInput.click());
    els.uploadZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        els.fileInput.click();
      }
    });
    els.fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    // 拖拽上传
    let dragCounter = 0;
    window.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      els.uploadZone.classList.add('is-dragover');
    });
    window.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        els.uploadZone.classList.remove('is-dragover');
      }
    });
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      dragCounter = 0;
      els.uploadZone.classList.remove('is-dragover');
      handleFiles(e.dataTransfer.files);
    });

    // 剪贴板粘贴
    window.addEventListener('paste', (e) => {
      if (e.clipboardData && e.clipboardData.files.length) {
        handleFiles(e.clipboardData.files);
      }
    });
  }

  /**
   * 处理上传的文件列表
   * @param {FileList} files
   */
  function handleFiles(files) {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!imageFiles.length) {
      if (files.length) toast('未找到图片文件', 'warning');
      return;
    }
    imageFiles.forEach((file) => addFile(file));
  }

  /**
   * 添加文件到处理队列
   * @param {File} file
   */
  function addFile(file) {
    const result = {
      id: uid(),
      file,
      inputFormat: getExt(file.name) || file.type.replace('image/', '') || 'unknown',
      outputFormat: state.settings.format,
      inputSize: file.size,
      status: 'pending',
      error: null,
      blob: null,
      url: null,
      originalUrl: null,
      width: 0,
      height: 0,
      name: file.name
    };
    state.results.push(result);
    renderResults();
    processResult(result);
  }

  // ========================= 图片加载 =========================

  /**
   * 从文件加载图片
   * @param {File|Blob} source
   * @returns {Promise<HTMLImageElement>}
   */
  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const url = source instanceof File ? URL.createObjectURL(source) : source;
      const img = new Image();
      img.onload = () => resolve({ img, url });
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = url;
    });
  }

  /**
   * 加载水印图片
   * @param {File} file
   */
  async function loadWatermark(file) {
    try {
      const { img, url } = await loadImage(file);
      if (state.watermarkImage && state.watermarkImage.url) {
        URL.revokeObjectURL(state.watermarkImage.url);
      }
      state.watermarkImage = { img, url, name: file.name };
      els.watermarkImageName.textContent = file.name;
      toast('水印图片已加载', 'success');
      if (state.settings.watermarkType === 'image') reprocessAll();
    } catch (err) {
      toast('水印图片加载失败', 'error');
    }
  }

  // ========================= 核心处理流水线 =========================

  /**
   * 处理单张图片
   * @param {File} file
   * @param {object} options
   * @returns {Promise<{blob:Blob, width:number, height:number, url:string}>}
   */
  async function processImage(file, options = state.settings) {
    const { img, url } = await loadImage(file);

    try {
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      // 1. 几何变换（旋转/翻转）
      const angle = options.rotate || 0;
      const swap = angle % 180 !== 0;
      let canvasWidth = swap ? height : width;
      let canvasHeight = swap ? width : height;

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext('2d');

      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate((angle * Math.PI) / 180);
      ctx.scale(options.flipH ? -1 : 1, options.flipV ? -1 : 1);
      ctx.drawImage(img, -width / 2, -height / 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      let currentWidth = canvasWidth;
      let currentHeight = canvasHeight;

      // 2. 裁剪
      if (options.crop && options.crop.rel) {
        const cropCanvas = document.createElement('canvas');
        const rel = options.crop.rel;
        cropCanvas.width = Math.round(currentWidth * rel.w);
        cropCanvas.height = Math.round(currentHeight * rel.h);
        const cctx = cropCanvas.getContext('2d');
        cctx.drawImage(
          canvas,
          Math.round(currentWidth * rel.x),
          Math.round(currentHeight * rel.y),
          cropCanvas.width,
          cropCanvas.height,
          0,
          0,
          cropCanvas.width,
          cropCanvas.height
        );
        currentWidth = cropCanvas.width;
        currentHeight = cropCanvas.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = currentWidth;
        canvas.height = currentHeight;
        ctx.drawImage(cropCanvas, 0, 0);
      }

      // 3. 尺寸调整
      if (options.resizeMode === 'percent') {
        const p = options.resizePercent / 100;
        currentWidth = Math.round(currentWidth * p);
        currentHeight = Math.round(currentHeight * p);
      } else if (options.resizeMode === 'fit') {
        const max = options.resizeMax;
        const ratio = Math.min(1, max / Math.max(currentWidth, currentHeight));
        currentWidth = Math.round(currentWidth * ratio);
        currentHeight = Math.round(currentHeight * ratio);
      }

      if (currentWidth !== canvas.width || currentHeight !== canvas.height) {
        const resized = document.createElement('canvas');
        resized.width = currentWidth;
        resized.height = currentHeight;
        const rctx = resized.getContext('2d');
        rctx.imageSmoothingEnabled = true;
        rctx.imageSmoothingQuality = 'high';
        rctx.drawImage(canvas, 0, 0, currentWidth, currentHeight);
        canvas.width = currentWidth;
        canvas.height = currentHeight;
        ctx.drawImage(resized, 0, 0);
      }

      // 4. 色彩与滤镜
      const a = options.adjustments || {};
      const filterString = [
        a.brightness !== 100 && `brightness(${a.brightness}%)`,
        a.contrast !== 100 && `contrast(${a.contrast}%)`,
        a.saturate !== 100 && `saturate(${a.saturate}%)`,
        a.hue !== 0 && `hue-rotate(${a.hue}deg)`,
        a.blur > 0 && `blur(${a.blur}px)`
      ].filter(Boolean).join(' ');

      if (filterString) {
        const filtered = document.createElement('canvas');
        filtered.width = currentWidth;
        filtered.height = currentHeight;
        const fctx = filtered.getContext('2d');
        fctx.filter = filterString;
        fctx.drawImage(canvas, 0, 0);
        ctx.clearRect(0, 0, currentWidth, currentHeight);
        ctx.drawImage(filtered, 0, 0);
      }

      // 特殊滤镜：锐化、暗角、油画
      if (options.filterName === 'sharpen') {
        applyConvolution(canvas, SHARPEN_KERNEL);
      } else if (options.filterName === 'vignette') {
        applyVignette(canvas);
      } else if (options.filterName === 'oil') {
        applyOilPainting(canvas);
      }

      // 5. 水印
      await applyWatermark(canvas, options);

      // 6. 边框与圆角
      const finalCanvas = applyBorderAndRadius(canvas, options);

      // 7. JPG/GIF 输出时自动铺白底处理透明
      if (options.format === 'jpeg' || options.format === 'gif') {
        fillWhiteBackground(finalCanvas);
      }

      // 8. 编码输出
      const mime = MIME_TYPES[options.format] || 'image/png';
      const quality = ['jpeg', 'webp', 'avif'].includes(options.format) ? options.quality / 100 : undefined;

      let blob = await new Promise((resolve) => {
        finalCanvas.toBlob((b) => resolve(b), mime, quality);
      });

      // GIF/AVIF 等格式可能无法编码，回退 PNG
      if (!blob) {
        blob = await new Promise((resolve) => {
          finalCanvas.toBlob((b) => resolve(b), 'image/png');
        });
      }

      const outputUrl = URL.createObjectURL(blob);
      return { blob, width: finalCanvas.width, height: finalCanvas.height, url: outputUrl };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  const SHARPEN_KERNEL = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  /**
   * 应用卷积核
   * @param {HTMLCanvasElement} canvas
   * @param {number[]} kernel
   */
  function applyConvolution(canvas, kernel) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const src = ctx.getImageData(0, 0, w, h);
    const dst = ctx.createImageData(w, h);
    const data = src.data;
    const out = dst.data;
    const side = Math.round(Math.sqrt(kernel.length));
    const half = Math.floor(side / 2);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 0, g = 0, b = 0;
        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const px = Math.min(w - 1, Math.max(0, x + cx - half));
            const py = Math.min(h - 1, Math.max(0, y + cy - half));
            const i = (py * w + px) * 4;
            const k = kernel[cy * side + cx];
            r += data[i] * k;
            g += data[i + 1] * k;
            b += data[i + 2] * k;
          }
        }
        const idx = (y * w + x) * 4;
        out[idx] = Math.min(255, Math.max(0, r));
        out[idx + 1] = Math.min(255, Math.max(0, g));
        out[idx + 2] = Math.min(255, Math.max(0, b));
        out[idx + 3] = data[idx + 3];
      }
    }
    ctx.putImageData(dst, 0, 0);
  }

  /**
   * 应用暗角效果
   * @param {HTMLCanvasElement} canvas
   */
  function applyVignette(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, Math.max(w, h) * 0.65);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * 简易油画效果（像素级量化）
   * @param {HTMLCanvasElement} canvas
   */
  function applyOilPainting(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const src = ctx.getImageData(0, 0, w, h);
    const dst = ctx.createImageData(w, h);
    const data = src.data;
    const out = dst.data;
    const radius = 2;
    const levels = 8;
    const step = 255 / levels;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        let r = 0, g = 0, b = 0, count = 0;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const px = Math.min(w - 1, Math.max(0, x + dx));
            const py = Math.min(h - 1, Math.max(0, y + dy));
            const i = (py * w + px) * 4;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }
        out[idx] = Math.round(Math.round(r / count / step) * step);
        out[idx + 1] = Math.round(Math.round(g / count / step) * step);
        out[idx + 2] = Math.round(Math.round(b / count / step) * step);
        out[idx + 3] = data[idx + 3];
      }
    }
    ctx.putImageData(dst, 0, 0);
  }

  /**
   * 应用水印
   * @param {HTMLCanvasElement} canvas
   * @param {object} options
   */
  async function applyWatermark(canvas, options) {
    if (options.watermarkType === 'none') return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const opacity = (options.watermarkOpacity || 50) / 100;
    ctx.globalAlpha = opacity;

    if (options.watermarkType === 'text') {
      const text = options.watermarkText || '';
      const size = options.watermarkSize || 48;
      ctx.font = `bold ${size}px ${getComputedStyle(document.body).fontFamily}`;
      ctx.fillStyle = options.watermarkColor || '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      const metrics = ctx.measureText(text);
      const tw = metrics.width;
      const th = size;

      if (options.watermarkMode === 'repeat') {
        const gapX = tw + 40;
        const gapY = th + 40;
        for (let y = gapY / 2; y < h + gapY; y += gapY) {
          for (let x = gapX / 2; x < w + gapX; x += gapX) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-0.25);
            ctx.fillText(text, 0, 0);
            ctx.restore();
          }
        }
      } else {
        const pos = getPosition(options.watermarkPosition || 4, w, h, tw, th, size / 2);
        ctx.fillText(text, pos.x, pos.y);
      }
    } else if (options.watermarkType === 'image' && state.watermarkImage) {
      const img = state.watermarkImage.img;
      const ratio = Math.min(w * 0.3 / img.naturalWidth, h * 0.3 / img.naturalHeight, 1);
      const tw = img.naturalWidth * ratio;
      const th = img.naturalHeight * ratio;

      if (options.watermarkMode === 'repeat') {
        const gapX = tw + 20;
        const gapY = th + 20;
        for (let y = gapY / 2; y < h + gapY; y += gapY) {
          for (let x = gapX / 2; x < w + gapX; x += gapX) {
            ctx.drawImage(img, x - tw / 2, y - th / 2, tw, th);
          }
        }
      } else {
        const pos = getPosition(options.watermarkPosition || 4, w, h, tw, th, 0);
        ctx.drawImage(img, pos.x - tw / 2, pos.y - th / 2, tw, th);
      }
    }

    ctx.globalAlpha = 1;
  }

  /**
   * 计算九宫格位置
   * @param {number} position 0-8
   */
  function getPosition(position, w, h, tw, th, offset) {
    const pad = 20;
    const cols = [pad + tw / 2, w / 2, w - pad - tw / 2];
    const rows = [pad + offset, h / 2, h - pad - offset];
    const x = cols[position % 3];
    const y = rows[Math.floor(position / 3)];
    return { x, y };
  }

  /**
   * 应用边框与圆角
   * @param {HTMLCanvasElement} source
   * @param {object} options
   * @returns {HTMLCanvasElement}
   */
  function applyBorderAndRadius(source, options) {
    const border = options.borderWidth || 0;
    const radius = options.borderRadius || 0;
    if (!border && !radius) return source;

    const w = source.width + border * 2;
    const h = source.height + border * 2;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // 圆角路径
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.quadraticCurveTo(w, 0, w, r);
    ctx.lineTo(w, h - r);
    ctx.quadraticCurveTo(w, h, w - r, h);
    ctx.lineTo(r, h);
    ctx.quadraticCurveTo(0, h, 0, h - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();

    // 边框
    if (border) {
      ctx.fillStyle = options.borderColor || '#ffffff';
      ctx.fill();
    }

    // 裁剪内部绘制图片
    ctx.save();
    ctx.beginPath();
    const innerR = Math.max(0, r - border);
    const iw = source.width;
    const ih = source.height;
    ctx.moveTo(border + innerR, border);
    ctx.lineTo(border + iw - innerR, border);
    ctx.quadraticCurveTo(border + iw, border, border + iw, border + innerR);
    ctx.lineTo(border + iw, border + ih - innerR);
    ctx.quadraticCurveTo(border + iw, border + ih, border + iw - innerR, border + ih);
    ctx.lineTo(border + innerR, border + ih);
    ctx.quadraticCurveTo(border, border + ih, border, border + ih - innerR);
    ctx.lineTo(border, border + innerR);
    ctx.quadraticCurveTo(border, border, border + innerR, border);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(source, border, border);
    ctx.restore();

    return canvas;
  }

  /**
   * 将透明区域填充为白色（用于 JPG/GIF 输出）
   * @param {HTMLCanvasElement} canvas
   */
  function fillWhiteBackground(canvas) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3] / 255;
      if (alpha < 1) {
        data[i] = Math.round(data[i] * alpha + 255 * (1 - alpha));
        data[i + 1] = Math.round(data[i + 1] * alpha + 255 * (1 - alpha));
        data[i + 2] = Math.round(data[i + 2] * alpha + 255 * (1 - alpha));
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // ========================= 处理结果管理 =========================

  async function processResult(result) {
    if (state.isProcessing) {
      result.status = 'queued';
      return;
    }
    state.isProcessing = true;
    updateProgress();

    try {
      const options = { ...state.settings };
      options.format = state.settings.format;
      const processed = await processImage(result.file, options);

      if (result.url) URL.revokeObjectURL(result.url);
      result.blob = processed.blob;
      result.url = processed.url;
      result.width = processed.width;
      result.height = processed.height;
      result.outputFormat = options.format;
      result.status = 'done';
      result.error = null;
    } catch (err) {
      result.status = 'error';
      result.error = err.message || '处理失败';
      toast(`${result.name} 处理失败：${result.error}`, 'error');
    } finally {
      state.isProcessing = false;
      updateProgress();
      renderResults();

      // 处理队列中的下一个
      const next = state.results.find((r) => r.status === 'queued');
      if (next) processResult(next);
    }
  }

  function updateProgress() {
    const pending = state.results.filter((r) => r.status === 'pending' || r.status === 'queued').length;
    const total = state.results.length;
    const done = total - pending;
    const hasPending = pending > 0;

    els.progressBar.hidden = !hasPending;
    if (hasPending) {
      const pct = total ? (done / total) * 100 : 0;
      els.progressFill.style.width = pct + '%';
      els.progressText.textContent = `处理中 ${done}/${total}`;
    } else {
      els.progressFill.style.width = '0%';
      els.progressText.textContent = '';
    }
  }

  async function reprocessAll() {
    if (!state.results.length) return;
    // 顺序处理避免内存峰值
    for (const result of state.results) {
      result.status = 'pending';
    }
    renderResults();
    for (const result of state.results) {
      if (result.status === 'pending') await processResult(result);
    }
  }

  // ========================= 结果列表渲染 =========================

  function renderResults() {
    const hasResults = state.results.length > 0;
    els.resultsSection.hidden = !hasResults;
    els.emptyState.hidden = hasResults;
    els.resultsCount.textContent = `${state.results.length} 张`;

    let totalInput = 0;
    let totalOutput = 0;

    els.resultList.innerHTML = state.results.map((r) => {
      totalInput += r.inputSize;
      totalOutput += r.blob ? r.blob.size : 0;
      const selected = r.id === state.selectedId;
      const save = r.inputSize && r.blob ? Math.round((1 - r.blob.size / r.inputSize) * 100) : 0;

      return `
        <li class="result-item ${selected ? 'is-selected' : ''}" data-id="${r.id}">
          <div class="result-thumb" data-action="compare" title="点击查看对比">
            <img src="${r.url || ''}" alt="${r.name}" loading="lazy">
          </div>
          <div class="result-info">
            <p class="result-name" title="${r.name}">${r.outputName || r.name}</p>
            <div class="result-meta">
              <span>${r.width || '-'}×${r.height || '-'}</span>
              <span>${formatBytes(r.inputSize)} → ${r.blob ? formatBytes(r.blob.size) : '处理中'}</span>
              ${save > 0 ? `<span class="result-save">节省 ${save}%</span>` : ''}
            </div>
            <div class="result-chips">
              <span class="chip-format-in">${r.inputFormat.toUpperCase()}</span>
              <span>→</span>
              <span class="chip-format-out">${(r.outputFormat || r.inputFormat).toUpperCase()}</span>
            </div>
          </div>
          <div class="result-actions">
            <button class="action-btn" data-action="info" title="信息" aria-label="信息"><i class="bi bi-info-circle" aria-hidden="true"></i></button>
            <button class="action-btn" data-action="compare" title="对比" aria-label="对比"><i class="bi bi-eye" aria-hidden="true"></i></button>
            <button class="action-btn" data-action="download" title="下载" aria-label="下载"><i class="bi bi-download" aria-hidden="true"></i></button>
            <button class="action-btn danger" data-action="remove" title="移除" aria-label="移除"><i class="bi bi-x-lg" aria-hidden="true"></i></button>
          </div>
        </li>
      `;
    }).join('');

    const saved = totalInput - totalOutput;
    const savedPct = totalInput ? Math.round((saved / totalInput) * 100) : 0;
    els.summaryLine.innerHTML = `汇总：${formatBytes(totalInput)} → ${formatBytes(totalOutput)} ${saved > 0 ? `（节省 <strong>${savedPct}%</strong>）` : ''}`;

    // 绑定操作事件
    $$('.result-item').forEach((item) => {
      const id = item.dataset.id;
      item.querySelector('.result-thumb').addEventListener('click', () => openCompare(id));
      item.querySelectorAll('[data-action]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleResultAction(id, btn.dataset.action);
        });
      });
      item.addEventListener('click', () => {
        state.selectedId = id;
        renderResults();
      });
    });
  }

  function handleResultAction(id, action) {
    const result = state.results.find((r) => r.id === id);
    if (!result) return;

    switch (action) {
      case 'download':
        downloadResult(result);
        break;
      case 'compare':
        openCompare(id);
        break;
      case 'info':
        openInfo(result);
        break;
      case 'remove':
        removeResult(id);
        break;
    }
  }

  function downloadResult(result) {
    if (!result.blob) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.outputName || generateOutputName(result);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast('已下载 ' + (result.outputName || generateOutputName(result)), 'success');
  }

  function generateOutputName(result) {
    const base = getBaseName(result.name);
    return `${base}.${result.outputFormat}`;
  }

  function removeResult(id) {
    const idx = state.results.findIndex((r) => r.id === id);
    if (idx === -1) return;
    const result = state.results[idx];
    if (result.url) URL.revokeObjectURL(result.url);
    if (result.originalUrl) URL.revokeObjectURL(result.originalUrl);
    state.results.splice(idx, 1);
    if (state.selectedId === id) state.selectedId = null;
    renderResults();
  }

  function clearAllResults() {
    state.results.forEach((r) => {
      if (r.url) URL.revokeObjectURL(r.url);
      if (r.originalUrl) URL.revokeObjectURL(r.originalUrl);
    });
    state.results = [];
    state.selectedId = null;
    renderResults();
    toast('已清空所有图片', 'info');
  }

  // ========================= ZIP 下载 =========================

  async function downloadZip() {
    const done = state.results.filter((r) => r.blob);
    if (!done.length) {
      toast('没有可下载的文件', 'warning');
      return;
    }

    const btn = $('#downloadZipBtn');
    btn.disabled = true;
    btn.textContent = '打包中…';

    try {
      const zip = new JSZip();
      done.forEach((r) => {
        const name = r.outputName || generateOutputName(r);
        zip.file(name, r.blob);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `ImageStudio_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast('ZIP 下载已开始', 'success');
    } catch (err) {
      toast('ZIP 打包失败', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '下载 ZIP';
    }
  }

  // ========================= 裁剪浮层 =========================

  const cropState = {
    active: false,
    img: null,
    scale: 1,
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    ratio: null,
    dragging: false,
    lastX: 0,
    lastY: 0
  };

  async function openCropModal() {
    const result = state.selectedId ? state.results.find((r) => r.id === state.selectedId) : state.results[0];
    if (!result) {
      toast('请先上传图片', 'warning');
      return;
    }

    const { img } = await loadImage(result.file);
    cropState.img = img;
    cropState.active = true;

    const stage = els.cropperStage;
    const stageRect = stage.getBoundingClientRect();
    const scale = Math.min(stageRect.width / img.naturalWidth, stageRect.height / img.naturalHeight, 1);
    cropState.scale = scale;

    const displayW = Math.round(img.naturalWidth * scale);
    const displayH = Math.round(img.naturalHeight * scale);

    els.cropperCanvas.width = displayW;
    els.cropperCanvas.height = displayH;
    const ctx = els.cropperCanvas.getContext('2d');
    ctx.drawImage(img, 0, 0, displayW, displayH);

    // 初始化裁剪框
    let ratio = null;
    if (state.settings.crop && state.settings.crop.ratio && state.settings.crop.ratio !== 'free') {
      ratio = parseFloat(state.settings.crop.ratio);
    }
    setCropRatio(ratio);
    cropState.w = Math.min(displayW, displayH * (ratio || 1));
    cropState.h = ratio ? cropState.w / ratio : cropState.w;
    cropState.x = (displayW - cropState.w) / 2;
    cropState.y = (displayH - cropState.h) / 2;
    updateCropFrame();
    updateCropInputs();

    openModal(els.cropModal);
  }

  function setCropRatio(ratio) {
    cropState.ratio = ratio;
  }

  function updateCropFrame() {
    els.cropperFrame.style.left = cropState.x + 'px';
    els.cropperFrame.style.top = cropState.y + 'px';
    els.cropperFrame.style.width = cropState.w + 'px';
    els.cropperFrame.style.height = cropState.h + 'px';
  }

  function updateCropInputs() {
    els.cropWidthInput.value = Math.round(cropState.w / cropState.scale);
    els.cropHeightInput.value = Math.round(cropState.h / cropState.scale);
  }

  function initCropperEvents() {
    const frame = els.cropperFrame;

    frame.addEventListener('mousedown', startCropDrag);
    frame.addEventListener('touchstart', startCropDrag, { passive: false });

    function startCropDrag(e) {
      e.preventDefault();
      cropState.dragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      cropState.lastX = clientX;
      cropState.lastY = clientY;
    }

    window.addEventListener('mousemove', onCropMove);
    window.addEventListener('touchmove', onCropMove, { passive: false });
    window.addEventListener('mouseup', stopCropDrag);
    window.addEventListener('touchend', stopCropDrag);

    function onCropMove(e) {
      if (!cropState.dragging) return;
      e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - cropState.lastX;
      const dy = clientY - cropState.lastY;
      cropState.lastX = clientX;
      cropState.lastY = clientY;

      const maxW = els.cropperCanvas.width;
      const maxH = els.cropperCanvas.height;
      cropState.x = Math.max(0, Math.min(maxW - cropState.w, cropState.x + dx));
      cropState.y = Math.max(0, Math.min(maxH - cropState.h, cropState.y + dy));
      updateCropFrame();
    }

    function stopCropDrag() {
      cropState.dragging = false;
    }

    // 输入框调整
    els.cropWidthInput.addEventListener('change', () => {
      const w = parseInt(els.cropWidthInput.value, 10) || 1;
      cropState.w = Math.min(w * cropState.scale, els.cropperCanvas.width - cropState.x);
      if (cropState.ratio) cropState.h = cropState.w / cropState.ratio;
      updateCropFrame();
      updateCropInputs();
    });
    els.cropHeightInput.addEventListener('change', () => {
      const h = parseInt(els.cropHeightInput.value, 10) || 1;
      cropState.h = Math.min(h * cropState.scale, els.cropperCanvas.height - cropState.y);
      if (cropState.ratio) cropState.w = cropState.h * cropState.ratio;
      updateCropFrame();
      updateCropInputs();
    });
  }

  function applyCrop() {
    if (!cropState.active) return;
    const canvasW = els.cropperCanvas.width;
    const canvasH = els.cropperCanvas.height;

    state.settings.crop = {
      ratio: cropState.ratio ? String(cropState.ratio) : 'free',
      ratioValue: cropState.ratio,
      rel: {
        x: cropState.x / canvasW,
        y: cropState.y / canvasH,
        w: cropState.w / canvasW,
        h: cropState.h / canvasH
      }
    };

    closeModal(els.cropModal);
    reprocessAll();
    toast('裁剪已应用', 'success');
  }

  // ========================= 对比浮层 =========================

  async function openCompare(id) {
    const result = state.results.find((r) => r.id === id);
    if (!result) return;

    if (!result.originalUrl) {
      result.originalUrl = URL.createObjectURL(result.file);
    }
    els.compareBefore.src = result.originalUrl;
    els.compareAfter.src = result.url || '';
    els.compareAfterWrap.style.width = '50%';
    els.compareSlider.style.left = '50%';
    els.compareSlider.setAttribute('aria-valuenow', '50');
    openModal(els.compareModal);
  }

  function initCompareSlider() {
    let dragging = false;
    const stage = els.compareStage;
    const slider = els.compareSlider;
    const afterWrap = els.compareAfterWrap;

    function setPosition(clientX) {
      const rect = stage.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      afterWrap.style.width = pct + '%';
      slider.style.left = pct + '%';
      slider.setAttribute('aria-valuenow', Math.round(pct));
    }

    slider.addEventListener('mousedown', (e) => { dragging = true; e.preventDefault(); });
    slider.addEventListener('touchstart', (e) => { dragging = true; e.preventDefault(); }, { passive: false });

    window.addEventListener('mousemove', (e) => { if (dragging) setPosition(e.clientX); });
    window.addEventListener('touchmove', (e) => { if (dragging) setPosition(e.touches[0].clientX); }, { passive: false });
    window.addEventListener('mouseup', () => { dragging = false; });
    window.addEventListener('touchend', () => { dragging = false; });

    slider.addEventListener('keydown', (e) => {
      const current = parseFloat(slider.getAttribute('aria-valuenow')) || 50;
      const rect = stage.getBoundingClientRect();
      let newPct = current;
      if (e.key === 'ArrowLeft') newPct = Math.max(0, current - 2);
      if (e.key === 'ArrowRight') newPct = Math.min(100, current + 2);
      if (newPct !== current) {
        e.preventDefault();
        afterWrap.style.width = newPct + '%';
        slider.style.left = newPct + '%';
        slider.setAttribute('aria-valuenow', newPct);
      }
    });
  }

  // ========================= 图片信息浮层 =========================

  async function openInfo(result) {
    if (!result.originalUrl) result.originalUrl = URL.createObjectURL(result.file);
    els.infoPreview.innerHTML = `<img src="${result.originalUrl}" alt="">`;

    const info = [
      ['文件名', result.name],
      ['原始格式', result.inputFormat.toUpperCase()],
      ['输出格式', (result.outputFormat || result.inputFormat).toUpperCase()],
      ['原始大小', formatBytes(result.inputSize)],
      ['输出大小', result.blob ? formatBytes(result.blob.size) : '-'],
      ['尺寸', `${result.width} × ${result.height}`],
      ['MIME 类型', result.file.type || '-']
    ];

    els.infoList.innerHTML = info.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
    openModal(els.infoModal);
  }

  // ========================= EXIF 浮层 =========================

  async function openExifModal() {
    const result = state.selectedId ? state.results.find((r) => r.id === state.selectedId) : state.results[0];
    if (!result) {
      toast('请先上传图片', 'warning');
      return;
    }

    if (!result.originalUrl) result.originalUrl = URL.createObjectURL(result.file);
    els.exifPreview.innerHTML = `<img src="${result.originalUrl}" alt="">`;
    els.exifList.innerHTML = '<dt>状态</dt><dd>读取中…</dd>';
    openModal(els.exifModal);

    try {
      const exif = await exifr.parse(result.file, { gps: true });
      if (!exif) {
        els.exifList.innerHTML = '<dt>提示</dt><dd>未找到 EXIF 元数据</dd>';
        return;
      }
      const fields = [
        ['相机型号', exif.Make && exif.Model ? `${exif.Make} ${exif.Model}` : exif.Model],
        ['拍摄时间', exif.DateTimeOriginal || exif.CreateDate || exif.DateTime],
        ['光圈', exif.FNumber ? `f/${exif.FNumber}` : null],
        ['快门', exif.ExposureTime ? `${exif.ExposureTime < 1 ? `1/${Math.round(1 / exif.ExposureTime)}` : exif.ExposureTime}s` : null],
        ['ISO', exif.ISO || exif.PhotographicSensitivity],
        ['焦距', exif.FocalLength ? `${exif.FocalLength}mm` : null],
        ['宽度', exif.ImageWidth || exif.ExifImageWidth],
        ['高度', exif.ImageHeight || exif.ExifImageHeight],
        ['GPS 纬度', exif.latitude],
        ['GPS 经度', exif.longitude],
        ['方向', exif.Orientation]
      ];
      const valid = fields.filter(([_, v]) => v !== undefined && v !== null);
      if (!valid.length) {
        els.exifList.innerHTML = '<dt>提示</dt><dd>未找到常用 EXIF 字段</dd>';
      } else {
        els.exifList.innerHTML = valid.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
      }
    } catch (err) {
      els.exifList.innerHTML = `<dt>错误</dt><dd>读取失败：${err.message}</dd>`;
    }
  }

  // ========================= 主色调提取 =========================

  async function openPaletteModal() {
    const result = state.selectedId ? state.results.find((r) => r.id === state.selectedId) : state.results[0];
    if (!result) {
      toast('请先上传图片', 'warning');
      return;
    }

    if (!result.originalUrl) result.originalUrl = URL.createObjectURL(result.file);
    els.palettePreview.innerHTML = `<img src="${result.originalUrl}" alt="">`;
    els.paletteGrid.innerHTML = '<p class="hint">提取中…</p>';
    openModal(els.paletteModal);

    try {
      const colors = await extractPalette(result.file, 8);
      els.paletteGrid.innerHTML = colors.map((c) => `
        <div class="palette-color" data-hex="${c.hex}" title="点击复制">
          <div class="palette-swatch" style="background:${c.hex}"></div>
          <div class="palette-hex">${c.hex}</div>
        </div>
      `).join('');

      $$('#paletteGrid .palette-color').forEach((el) => {
        el.addEventListener('click', () => copyText(el.dataset.hex));
      });
    } catch (err) {
      els.paletteGrid.innerHTML = `<p class="hint">提取失败：${err.message}</p>`;
    }
  }

  /**
   * 提取调色板（中位切分简化版）
   * @param {File} file
   * @param {number} count
   * @returns {Promise<{hex:string,rgb:[number,number,number]}[]>}
   */
  async function extractPalette(file, count = 8) {
    const { img, url } = await loadImage(file);
    try {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 120 / Math.max(img.naturalWidth, img.naturalHeight));
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const buckets = new Map();
      const step = 24; // 量化步长
      for (let i = 0; i < data.length; i += 16) { // 采样
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        if (a < 128) continue;
        const key = `${Math.floor(r / step)},${Math.floor(g / step)},${Math.floor(b / step)}`;
        const item = buckets.get(key) || { r: 0, g: 0, b: 0, count: 0 };
        item.r += r;
        item.g += g;
        item.b += b;
        item.count++;
        buckets.set(key, item);
      }

      const sorted = Array.from(buckets.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, count)
        .map((item) => ({
          rgb: [Math.round(item.r / item.count), Math.round(item.g / item.count), Math.round(item.b / item.count)]
        }));

      return sorted.map(({ rgb }) => {
        const hex = '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
        return { rgb, hex };
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // ========================= 批量重命名 =========================

  function openRenameModal() {
    if (!state.results.length) {
      toast('没有可重命名的图片', 'warning');
      return;
    }
    updateRenamePreview();
    openModal(els.renameModal);
  }

  function updateRenamePreview() {
    const template = els.renameTemplate.value;
    const preview = state.results.map((r, i) => {
      const newName = renderRenameTemplate(template, r, i + 1);
      return `<li><span class="old-name">${r.name}</span><span class="new-name">${newName}</span></li>`;
    }).join('');
    els.renamePreview.innerHTML = preview;
  }

  function renderRenameTemplate(template, result, index) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const ext = result.outputFormat || getExt(result.name) || 'png';
    const base = getBaseName(result.name);
    return template
      .replace(/{原名}/g, base)
      .replace(/{序号}/g, String(index).padStart(3, '0'))
      .replace(/{日期}/g, date)
      .replace(/{宽}x{高}/g, `${result.width || 0}x${result.height || 0}`)
      .replace(/{格式}/g, ext.toUpperCase()) + '.' + ext;
  }

  function applyRename() {
    state.results.forEach((r, i) => {
      r.outputName = renderRenameTemplate(els.renameTemplate.value, r, i + 1);
    });
    renderResults();
    closeModal(els.renameModal);
    toast('重命名已应用', 'success');
  }

  // ========================= 切片/分割 =========================

  /**
   * 对结果进行切片并生成新结果项
   * @param {object} result
   */
  async function splitResult(result) {
    if (!result.blob || !result.url) return;
    const mode = state.settings.splitMode;
    if (mode === 'none') return;

    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = result.url;
    });

    const pieces = [];
    const w = img.naturalWidth;
    const h = img.naturalHeight;

    if (mode === 'grid3') {
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          pieces.push({ x: Math.floor(w * col / 3), y: Math.floor(h * row / 3), w: Math.floor(w / 3), h: Math.floor(h / 3), name: `_grid_${row + 1}x${col + 1}` });
        }
      }
    } else if (mode === 'custom') {
      const cols = Math.max(1, state.settings.splitCols);
      const rows = Math.max(1, state.settings.splitRows);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          pieces.push({ x: Math.floor(w * col / cols), y: Math.floor(h * row / rows), w: Math.floor(w / cols), h: Math.floor(h / rows), name: `_split_${row + 1}x${col + 1}` });
        }
      }
    } else if (mode === 'stripeW') {
      const size = Math.max(1, state.settings.splitSize);
      for (let x = 0; x < w; x += size) {
        pieces.push({ x, y: 0, w: Math.min(size, w - x), h, name: `_stripe_${x}` });
      }
    } else if (mode === 'stripeH') {
      const size = Math.max(1, state.settings.splitSize);
      for (let y = 0; y < h; y += size) {
        pieces.push({ x: 0, y, w, h: Math.min(size, h - y), name: `_stripe_${y}` });
      }
    }

    for (const piece of pieces) {
      const canvas = document.createElement('canvas');
      canvas.width = piece.w;
      canvas.height = piece.h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, piece.x, piece.y, piece.w, piece.h, 0, 0, piece.w, piece.h);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, MIME_TYPES[result.outputFormat] || 'image/png'));
      if (!blob) continue;
      state.results.push({
        id: uid(),
        file: result.file,
        inputFormat: result.inputFormat,
        outputFormat: result.outputFormat,
        inputSize: result.inputSize,
        status: 'done',
        blob,
        url: URL.createObjectURL(blob),
        width: piece.w,
        height: piece.h,
        name: getBaseName(result.name) + piece.name + '.' + result.outputFormat,
        outputName: getBaseName(result.outputName || result.name) + piece.name + '.' + result.outputFormat
      });
    }

    renderResults();
    toast(`已生成 ${pieces.length} 张切片`, 'success');
  }

  // 为结果项添加切片按钮
  function initSplitAction() {
    // 切片模式变更时，提供手动切片入口：通过结果项的隐藏菜单或工具面板执行
    // 这里在工具面板中增加一个"对选中图片切片"按钮
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-secondary btn-block';
    btn.textContent = '对选中图片执行切片';
    btn.style.marginTop = '8px';
    btn.addEventListener('click', () => {
      const result = state.selectedId ? state.results.find((r) => r.id === state.selectedId) : state.results[0];
      if (!result) {
        toast('请先选择一张图片', 'warning');
        return;
      }
      if (state.settings.splitMode === 'none') {
        toast('请先选择切片模式', 'warning');
        return;
      }
      splitResult(result);
    });
    $('#splitStripeControls').after(btn);
  }

  // ========================= 键盘快捷键 =========================

  function initKeyboard() {
    window.addEventListener('keydown', (e) => {
      const meta = e.ctrlKey || e.metaKey;

      // Esc 关闭浮层
      if (e.key === 'Escape') {
        e.preventDefault();
        closeAllModals();
        return;
      }

      // Ctrl/Cmd+S 下载全部（ZIP）
      if (meta && e.key.toLowerCase() === 's') {
        e.preventDefault();
        downloadZip();
        return;
      }

      // Delete 清空
      if (e.key === 'Delete') {
        e.preventDefault();
        clearAllResults();
        return;
      }

      // Ctrl/Cmd+V 粘贴由 window paste 事件处理
    });
  }

  // ========================= 初始化 =========================

  async function init() {
    initTheme();
    initTabs();
    bindSettings();
    initUpload();
    initCropperEvents();
    initCompareSlider();
    initKeyboard();
    initSplitAction();
    initHeroCta();

    await detectCapabilities();

    // 初始 UI 同步
    updateQualityUI();
    updateResizeUI();
    updateWatermarkUI();
    updateSplitUI();

    toast('Image Studio 已就绪，图片仅在本地处理', 'success');
  }

  function initHeroCta() {
    const cta = document.getElementById('heroCta');
    if (cta) {
      cta.addEventListener('click', () => {
        const uploadZone = document.getElementById('uploadZone');
        if (uploadZone) {
          uploadZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => document.getElementById('fileInput').click(), 400);
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
