/**
 * create-page.js — "发起接龙"页面交互逻辑
 * =========================================
 * 依赖: solong-theme.css (样式类), solong-data.js (工具函数), solong-icons.js (SVG图标函数 icon())
 */

document.addEventListener('DOMContentLoaded', function() {
  initForm();
  initBackButton();
  initImageUpload();
  initCategorySelector();
  initProductList();
  initCommunitySelector();
  initSubmitButton();
});

// ---- 全局变量 ----
var selectedCategory = '';
var hasImage = false;

// =============================================================
// 1. initForm() — 初始化表单
// =============================================================
function initForm() {
  // 设置 datetime-local 默认值：当前时间 + 1小时
  var now = new Date();
  var minTime = new Date(now.getTime() + 60 * 60 * 1000);
  var minStr = formatDatetimeLocal(minTime);
  var deadlineInput = document.getElementById('inputDeadline');
  if (deadlineInput) {
    deadlineInput.value = minStr;
    deadlineInput.setAttribute('min', minStr);
  }

  // 绑定字符计数
  bindCharCount('inputTitle', 'countTitle', 30);
  bindCharCount('inputDesc', 'countDesc', 500);
  bindCharCount('inputRemark', 'countRemark', 200);

  // 绑定失焦校验
  bindBlurValidate('inputTitle', 'title');
  bindBlurValidate('inputDesc', 'desc');
  bindBlurValidate('inputTarget', 'target');
  bindBlurValidate('inputDeadline', 'deadline');
}

// =============================================================
// 字符计数函数
// =============================================================
function bindCharCount(inputId, countId, max) {
  var input = document.getElementById(inputId);
  var countEl = document.getElementById(countId);
  if (!input || !countEl) return;

  input.addEventListener('input', function() {
    var len = input.value.length;
    countEl.textContent = len + '/' + max;
    if (len >= max) {
      countEl.classList.add('over');
    } else if (len >= max * 0.85) {
      countEl.classList.remove('over');
      countEl.classList.add('warn');
    } else {
      countEl.classList.remove('over', 'warn');
    }
  });
}

// =============================================================
// 失焦校验绑定
// =============================================================
function bindBlurValidate(inputId, fieldName) {
  var input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('blur', function() {
    validateField(fieldName);
  });
  // 输入时清除错误状态
  input.addEventListener('input', function() {
    if (fieldName === 'title') clearFieldError('title');
    else if (fieldName === 'desc') clearFieldError('desc');
    else if (fieldName === 'target') clearFieldError('target');
    else if (fieldName === 'deadline') clearFieldError('deadline');
  });
}

// =============================================================
// 清除单个字段错误状态
// =============================================================
function clearFieldError(fieldName) {
  var errorMap = {
    title: { input: 'inputTitle', error: 'errorTitle', wrapper: null },
    desc: { input: 'inputDesc', error: 'errorDesc', wrapper: null },
    target: { input: 'inputTarget', error: 'errorTarget', wrapper: 'targetWrapper' },
    deadline: { input: 'inputDeadline', error: 'errorDeadline', wrapper: null }
  };
  var field = errorMap[fieldName];
  if (!field) return;

  var inputEl = document.getElementById(field.input);
  var errorEl = document.getElementById(field.error);
  if (inputEl) inputEl.classList.remove('solong-input-error');
  if (field.wrapper) {
    var wrapperEl = document.getElementById(field.wrapper);
    if (wrapperEl) wrapperEl.classList.remove('solong-input-error');
  }
  if (errorEl) errorEl.classList.add('solong-hidden');
}

// =============================================================
// 2. validateField(fieldName) — 校验单个字段
// =============================================================
function validateField(fieldName) {
  switch (fieldName) {
    case 'title':
      return validateTitle();
    case 'desc':
      return validateDesc();
    case 'category':
      return validateCategory();
    case 'target':
      return validateTarget();
    case 'deadline':
      return validateDeadline();
    default:
      return true;
  }
}

// ---- 标题校验 ----
function validateTitle() {
  var input = document.getElementById('inputTitle');
  var errorEl = document.getElementById('errorTitle');
  var val = input.value.trim();
  if (val.length === 0) {
    input.classList.add('solong-input-error');
    errorEl.textContent = '请输入活动标题';
    errorEl.classList.remove('solong-hidden');
    return false;
  }
  if (val.length < 2) {
    input.classList.add('solong-input-error');
    errorEl.textContent = '标题至少2个字符';
    errorEl.classList.remove('solong-hidden');
    return false;
  }
  if (val.length > 30) {
    input.classList.add('solong-input-error');
    errorEl.textContent = '标题不超过30个字符';
    errorEl.classList.remove('solong-hidden');
    return false;
  }
  input.classList.remove('solong-input-error');
  errorEl.classList.add('solong-hidden');
  return true;
}

// ---- 描述校验 ----
function validateDesc() {
  var input = document.getElementById('inputDesc');
  var errorEl = document.getElementById('errorDesc');
  var val = input.value.trim();
  if (val.length === 0) {
    input.classList.add('solong-input-error');
    errorEl.textContent = '请输入商品描述';
    errorEl.classList.remove('solong-hidden');
    return false;
  }
  if (val.length > 500) {
    input.classList.add('solong-input-error');
    errorEl.textContent = '描述不超过500个字符';
    errorEl.classList.remove('solong-hidden');
    return false;
  }
  input.classList.remove('solong-input-error');
  errorEl.classList.add('solong-hidden');
  return true;
}

// ---- 分类校验 ----
function validateCategory() {
  var errorEl = document.getElementById('errorCategory');
  if (!selectedCategory) {
    errorEl.textContent = '请选择一个商品分类';
    errorEl.classList.remove('solong-hidden');
    return false;
  }
  errorEl.classList.add('solong-hidden');
  return true;
}

// ---- 目标人数校验 ----
function validateTarget() {
  var input = document.getElementById('inputTarget');
  var wrapper = document.getElementById('targetWrapper');
  var errorEl = document.getElementById('errorTarget');
  var val = parseInt(input.value, 10);
  if (isNaN(val) || val < 1 || input.value.indexOf('.') !== -1) {
    input.classList.add('solong-input-error');
    if (wrapper) wrapper.classList.add('solong-input-error');
    errorEl.textContent = '请输入至少1人的正整数';
    errorEl.classList.remove('solong-hidden');
    return false;
  }
  input.classList.remove('solong-input-error');
  if (wrapper) wrapper.classList.remove('solong-input-error');
  errorEl.classList.add('solong-hidden');
  return true;
}

// ---- 截止时间校验 ----
function validateDeadline() {
  var input = document.getElementById('inputDeadline');
  var errorEl = document.getElementById('errorDeadline');
  var val = input.value;
  if (!val) {
    input.classList.add('solong-input-error');
    errorEl.textContent = '请选择截止时间';
    errorEl.classList.remove('solong-hidden');
    return false;
  }
  var d = new Date(val);
  if (isNaN(d.getTime()) || d.getTime() <= Date.now()) {
    input.classList.add('solong-input-error');
    errorEl.textContent = '截止时间必须晚于当前时间';
    errorEl.classList.remove('solong-hidden');
    return false;
  }
  input.classList.remove('solong-input-error');
  errorEl.classList.add('solong-hidden');
  return true;
}

// =============================================================
// 3. validateAll() — 全量校验
// =============================================================
function validateAll() {
  var isTitle = validateTitle();
  var isDesc = validateDesc();
  var isCategory = validateCategory();
  var isProducts = validateProducts();
  var isTarget = validateTarget();
  var isDeadline = validateDeadline();

  return isTitle && isDesc && isCategory && isProducts && isTarget && isDeadline;
}

// =============================================================
// 4. initImageUpload() — 图片上传（真实文件选择 + 预览）
// =============================================================
function initImageUpload() {
  var fileInput = document.getElementById('imageFileInput');
  var uploadArea = document.getElementById('imageUploadArea');
  var previewArea = document.getElementById('imagePreviewArea');
  var previewImg = document.getElementById('imagePreviewImg');
  var deleteBtn = document.getElementById('uploadDeleteBtn');

  if (!fileInput || !uploadArea || !previewArea || !previewImg || !deleteBtn) return;

  // 点击上传区 -> 触发文件选择
  uploadArea.addEventListener('click', function() {
    fileInput.click();
  });

  // 选择文件后 -> 预览
  fileInput.addEventListener('change', function() {
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;

    // 校验文件类型和大小
    var validTypes = ['image/jpeg', 'image/png'];
    if (validTypes.indexOf(file.type) === -1) {
      alert('仅支持 JPG / PNG 格式');
      fileInput.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('图片不能超过 5MB');
      fileInput.value = '';
      return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
      previewImg.src = e.target.result;
      uploadArea.classList.add('solong-hidden');
      previewArea.classList.remove('solong-hidden');
      hasImage = true;
    };
    reader.readAsDataURL(file);
  });

  // 点击删除 -> 恢复上传区
  deleteBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    previewArea.classList.add('solong-hidden');
    uploadArea.classList.remove('solong-hidden');
    fileInput.value = '';
    previewImg.src = '';
    hasImage = false;
  });
}

// =============================================================
// 5. initCategorySelector() — 分类选择
// =============================================================
function initCategorySelector() {
  var container = document.getElementById('categorySelector');
  if (!container) return;

  var tags = container.querySelectorAll('.solong-tag');
  for (var i = 0; i < tags.length; i++) {
    tags[i].addEventListener('click', function() {
      // 清除所有选中状态
      for (var j = 0; j < tags.length; j++) {
        tags[j].classList.remove('solong-tag-active');
      }
      // 选中当前
      this.classList.add('solong-tag-active');
      selectedCategory = this.getAttribute('data-category');

      // 清除分类错误
      var errorEl = document.getElementById('errorCategory');
      if (errorEl) errorEl.classList.add('solong-hidden');
    });
  }
}

// =============================================================
// 6. initCommunitySelector() — 小区多选下拉
// =============================================================
function initCommunitySelector() {
  var trigger = document.getElementById('communityTrigger');
  var dropdown = document.getElementById('communityDropdown');
  var options = dropdown ? dropdown.querySelectorAll('.community-option') : [];
  var tagsContainer = document.getElementById('communityTags');
  var placeholder = document.getElementById('communityPlaceholder');
  var selectedValues = [];

  if (!trigger || !dropdown) return;

  // 点击触发区域 切换下拉（排除来自下拉面板内的点击）
  trigger.addEventListener('click', function(e) {
    if (e.target.closest('.community-tag-remove')) return;
    if (e.target.closest('.community-dropdown')) return;
    dropdown.classList.toggle('open');
  });

  // 点击选项
  for (var i = 0; i < options.length; i++) {
    options[i].addEventListener('click', function() {
      var val = this.getAttribute('data-value');
      var idx = selectedValues.indexOf(val);

      if (idx > -1) {
        selectedValues.splice(idx, 1);
        this.classList.remove('selected');
      } else {
        selectedValues.push(val);
        this.classList.add('selected');
      }

      renderCommunityTags();
    });
  }

  // 点击外部关闭
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#communityWrapper')) {
      dropdown.classList.remove('open');
    }
  });

  // 渲染已选标签
  function renderCommunityTags() {
    if (!tagsContainer || !placeholder) return;

    if (selectedValues.length === 0) {
      tagsContainer.innerHTML = '';
      placeholder.style.display = '';
      return;
    }

    placeholder.style.display = 'none';
    var html = '';
    for (var i = 0; i < selectedValues.length; i++) {
      html += '<span class="community-tag">' +
        escapeHtml(selectedValues[i]) +
        '<span class="community-tag-remove" data-value="' + escapeHtml(selectedValues[i]) + '">&times;</span>' +
      '</span>';
    }
    tagsContainer.innerHTML = html;

    // 绑定标签删除
    var removes = tagsContainer.querySelectorAll('.community-tag-remove');
    for (var j = 0; j < removes.length; j++) {
      removes[j].addEventListener('click', function(e) {
        e.stopPropagation();
        var val = this.getAttribute('data-value');
        var idx = selectedValues.indexOf(val);
        if (idx > -1) {
          selectedValues.splice(idx, 1);
          // 同步取消选项高亮
          for (var k = 0; k < options.length; k++) {
            if (options[k].getAttribute('data-value') === val) {
              options[k].classList.remove('selected');
            }
          }
          renderCommunityTags();
        }
      });
    }
  }

  // 对外暴露获取选中值的方法
  window.getSelectedCommunities = function() {
    return selectedValues.slice();
  };
}

// =============================================================
// 7. initSubmitButton() — 提交处理
// =============================================================
function initSubmitButton() {
  var submitBtn = document.getElementById('submitBtn');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', function() {
    var isValid = validateAll();
    if (!isValid) {
      // 滚动到第一个错误字段
      var firstError = document.querySelector('.solong-input-error, #errorCategory:not(.solong-hidden)');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // 校验通过 -> 收集商品数据，显示分享弹窗
    var products = collectProducts();
    console.log('商品列表:', JSON.stringify(products, null, 2));

    var modal = document.getElementById('shareModal');
    if (modal) {
      modal.classList.remove('solong-hidden');
      initShareModal();
    }
  });
}

// =============================================================
// 分享弹窗交互
// =============================================================
function initShareModal() {
  var modal = document.getElementById('shareModal');
  var copyBtn = document.getElementById('copyLinkBtn');
  var viewBtn = document.getElementById('viewDetailBtn');

  // 点击遮罩关闭
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.add('solong-hidden');
      }
    });
  }

  // 复制链接
  if (copyBtn) {
    // 移除旧的监听器（使用新函数替换）
    var newCopyBtn = copyBtn.cloneNode(true);
    copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
    newCopyBtn.addEventListener('click', function() {
      var linkBox = document.getElementById('shareLinkBox');
      var text = linkBox ? linkBox.textContent : 'https://solong.app/chain/9';

      // 尝试使用 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
          alert('链接已复制');
        }).catch(function() {
          fallbackCopy(text);
        });
      } else {
        fallbackCopy(text);
      }
    });
  }

  // 去查看详情
  var newViewBtn = document.getElementById('viewDetailBtn');
  if (newViewBtn) {
    var clonedViewBtn = newViewBtn.cloneNode(true);
    newViewBtn.parentNode.replaceChild(clonedViewBtn, newViewBtn);
    clonedViewBtn.addEventListener('click', function() {
      window.location.href = 'detail.html?id=9';
    });
  }
}

// ---- 降级复制 ----
function fallbackCopy(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    alert('链接已复制');
  } catch (e) {
    alert('复制失败，请手动复制链接');
  }
  document.body.removeChild(textarea);
}

// =============================================================
// 7. initBackButton() — 返回按钮
// =============================================================
function initBackButton() {
  var backBtn = document.getElementById('backBtn');
  if (!backBtn) return;
  backBtn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'index.html';
  });
}

// =============================================================
// 8. 商品列表管理
// =============================================================

// ---- 全局商品计数 ----
var productCount = 0;

// ---- 初始化商品列表 ----
function initProductList() {
  // 渲染主商品行
  addProductRow(true);

  // 绑定添加加购商品按钮
  var addBtn = document.getElementById('addProductBtn');
  if (addBtn) {
    addBtn.addEventListener('click', function() {
      if (productCount >= 8) return;
      addProductRow(false);
    });
  }
}

// ---- 生成商品行 HTML ----
function createProductRowHTML(index, isMain) {
  var delDisplay = isMain ? ' style="display:none"' : '';
  var mainActive = isMain ? 'active' : '';
  var snackActive = isMain ? '' : 'active';
  return '<div class="product-row" data-index="' + index + '">' +
    '<div class="product-row-head">' +
      '<div class="product-type-group">' +
        '<span class="product-type-tag type-main ' + mainActive + '" data-type="main">\uD83C\uDF5C 主食</span>' +
        '<span class="product-type-tag type-snack ' + snackActive + '" data-type="snack">\uD83C\uDF6A 小吃</span>' +
      '</div>' +
      '<button class="product-row-del product-del-btn"' + delDisplay + '>×</button>' +
    '</div>' +
    '<div class="product-row-fields">' +
      '<input class="solong-input product-name-input" placeholder="商品名称">' +
      '<div class="product-price-unit-group">' +
        '<div class="create-input-wrapper product-price-wrap">' +
          '<span class="create-input-prefix">¥</span>' +
          '<input type="number" class="product-price-input" step="0.01" placeholder="0.00" min="0">' +
        '</div>' +
        '<input class="solong-input product-unit-input" placeholder="单位">' +
      '</div>' +
    '</div>' +
    '<textarea class="solong-textarea product-desc-input" placeholder="商品描述，选填" maxlength="100"></textarea>' +
  '</div>';
}

// ---- 添加商品行 ----
function addProductRow(isMain) {
  var container = document.getElementById('productListContainer');
  if (!container) return;

  var index = productCount;
  var html = createProductRowHTML(index, isMain);
  container.insertAdjacentHTML('beforeend', html);
  productCount++;

  // 绑定事件
  var row = container.lastElementChild;

  // 绑定删除事件
  var delBtn = row.querySelector('.product-del-btn');
  if (delBtn) {
    delBtn.addEventListener('click', function() {
      removeProductRow(index);
    });
  }

  // 绑定商品类别切换事件
  var typeTags = row.querySelectorAll('.product-type-tag');
  for (var t = 0; t < typeTags.length; t++) {
    typeTags[t].addEventListener('click', function() {
      var parent = this.parentNode;
      var siblings = parent.querySelectorAll('.product-type-tag');
      for (var s = 0; s < siblings.length; s++) {
        siblings[s].classList.remove('active');
      }
      this.classList.add('active');
    });
  }

  // 更新添加按钮状态
  updateAddButtonStatus();
}

// ---- 移除商品行 ----
function removeProductRow(index) {
  var container = document.getElementById('productListContainer');
  if (!container) return;

  var row = container.querySelector('.product-row[data-index="' + index + '"]');
  if (row) {
    row.remove();
    productCount--;
    // 清除商品错误提示
    var errorEl = document.getElementById('errorProducts');
    if (errorEl) errorEl.classList.add('solong-hidden');
    updateAddButtonStatus();
  }
}

// ---- 更新添加按钮状态 ----
function updateAddButtonStatus() {
  var addBtn = document.getElementById('addProductBtn');
  if (!addBtn) return;
  if (productCount >= 8) {
    addBtn.disabled = true;
    addBtn.style.opacity = '0.5';
    addBtn.style.cursor = 'not-allowed';
  } else {
    addBtn.disabled = false;
    addBtn.style.opacity = '';
    addBtn.style.cursor = '';
  }
}

// ---- 商品列表校验 ----
function validateProducts() {
  var rows = document.querySelectorAll('.product-row');
  var errorEl = document.getElementById('errorProducts');
  if (!errorEl) return true;

  var allValid = true;

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var nameInput = row.querySelector('.product-name-input');
    var priceInput = row.querySelector('.product-price-input');
    var unitInput = row.querySelector('.product-unit-input');
    var nameVal = nameInput ? nameInput.value.trim() : '';
    var priceVal = priceInput ? parseFloat(priceInput.value) : NaN;
    var unitVal = unitInput ? unitInput.value.trim() : '';

    row.classList.remove('solong-input-error');

    if (!nameVal || isNaN(priceVal) || priceVal <= 0 || !unitVal) {
      row.classList.add('solong-input-error');
      allValid = false;
    }
  }

  if (!allValid) {
    errorEl.textContent = '请完善商品信息（名称、价格、单位必填）';
    errorEl.classList.remove('solong-hidden');
  } else {
    errorEl.classList.add('solong-hidden');
  }

  return allValid;
}

// ---- 收集商品数据 ----
function collectProducts() {
  var rows = document.querySelectorAll('.product-row');
  var products = [];
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var activeType = row.querySelector('.product-type-tag.active');
    var productType = activeType ? activeType.getAttribute('data-type') : 'main';
    products.push({
      name: (row.querySelector('.product-name-input') || {}).value || '',
      price: parseFloat((row.querySelector('.product-price-input') || {}).value) || 0,
      unit: (row.querySelector('.product-unit-input') || {}).value || '',
      description: (row.querySelector('.product-desc-input') || {}).value || '',
      productType: productType  // 'main' = 主食, 'snack' = 小吃
    });
  }
  // 增加小区信息
  var community = typeof window.getSelectedCommunities === 'function' ? window.getSelectedCommunities() : [];
  return {
    products: products,
    community: community  // 数组，如 ['铂宸府', '溪山悦']
  };
}

// =============================================================
// 辅助：格式化日期为 datetime-local 格式
// =============================================================
function formatDatetimeLocal(date) {
  var year = date.getFullYear();
  var month = padZero(date.getMonth() + 1);
  var day = padZero(date.getDate());
  var hours = padZero(date.getHours());
  var minutes = padZero(date.getMinutes());
  return year + '-' + month + '-' + day + 'T' + hours + ':' + minutes;
}

function padZero(n) {
  return n < 10 ? '0' + n : '' + n;
}

// =============================================================
// HTML 转义（防止 XSS）
// =============================================================
function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
