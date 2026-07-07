/* ========== 水性墨水配方管理系统 - 配方管理模块 ========== */

function renderFormulasPage() {
  const content = document.getElementById('content');
  const formulas = getFormulas();
  const materials = getMaterials();

  content.innerHTML = `
    <div class="toolbar flex items-center justify-between">
      <div class="flex gap-8 items-center">
        <span class="text-muted">共 <strong>${formulas.length}</strong> 个配方</span>
        ${formulas.length > 0 ? `
          <input type="text" class="input" id="formula-search" placeholder="🔍 搜索..." oninput="filterFormulaList()" style="max-width:160px;">
          <select class="select" id="formula-color-filter" onchange="filterFormulaList()" style="width:100px;">
            <option value="">全部颜色</option>
            ${[...new Set(formulas.map(f => f.color).filter(Boolean))].sort((a,b) => a.localeCompare(b,'zh')).map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        ` : ''}
      </div>
      <div class="flex gap-8">
        <button class="btn btn-primary btn-sm" onclick="showFormulaModal()" ${materials.length === 0 ? 'disabled' : ''}>
          ＋ 新建配方
        </button>
      </div>
    </div>

    ${materials.length === 0 ? `
      <div class="card">
        <div class="card-body">
          <div class="empty-state">
            <div class="icon">${ico('flask')}</div>
            <h4>请先添加原料</h4>
            <p class="text-muted mt-8">在「原料管理」中添加原料后，才可创建配方</p>
          </div>
        </div>
      </div>
    ` : formulas.length === 0 ? `
      <div class="card">
        <div class="card-body">
          <div class="empty-state">
            <div class="icon">${ico('clipboard-list')}</div>
            <h4>暂无配方</h4>
            <p class="text-muted mt-8">点击「新建配方」开始创建你的第一个墨水配方</p>
          </div>
        </div>
      </div>
    ` : `
      <div class="card">
        <div class="table-wrap">
          <table id="formula-table">
            <thead>
              <tr>
                <th>配方名称</th>
                <th>颜色</th>
                <th>基材</th>
                <th>粘度</th>
                <th>表面张力</th>
                <th>评价</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              ${formulas.map(f => `
                <tr data-name="${escHtml(f.name).toLowerCase()}" data-color="${escHtml(f.color || '')}">
                  <td><strong>${escHtml(f.name)}</strong></td>
                  <td>${f.color ? `<span class="color-dot" style="background:${COLOR_MAP[f.color] || '#94a3b8'};margin-right:4px;"></span>` + f.color : '<span class="text-muted">-</span>'}</td>
                  <td>${f.substrate ? escHtml(f.substrate) : '<span class="text-muted">-</span>'}</td>
                  <td>${f.properties?.viscosity?.value ? f.properties.viscosity.value + ' ' + (f.properties.viscosity.unit || 'mPa·s') : '<span class="text-muted">-</span>'}</td>
                  <td>${f.properties?.surfaceTension?.value ? f.properties.surfaceTension.value + ' ' + (f.properties.surfaceTension.unit || 'mN/m') : '<span class="text-muted">-</span>'}</td>
                  <td>${f.evaluation
                    ? `<span class="text-muted" style="font-size:0.78rem;max-width:120px;display:inline-block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle;" title="${escHtml(f.evaluation)}">${escHtml(f.evaluation.substring(0, 20))}${f.evaluation.length > 20 ? '…' : ''}</span>`
                    : '<span class="text-muted">-</span>'
                  }</td>
                  <td class="text-muted">${formatDate(f.updatedAt)}</td>
                  <td>
                    <div class="flex gap-4" style="flex-wrap:wrap;">
                      <button class="btn btn-ghost btn-sm" onclick="viewFormulaDetail('${f.id}')">📋 详情</button>
                      <button class="btn btn-outline btn-sm" onclick="showFormulaEvalPanel('${f.id}')" style="color:var(--warning);border-color:#fcd34d;" title="评价 & AI 分析">⭐ 评价</button>
                      <button class="btn btn-ghost btn-sm" onclick="showFormulaModal('${f.id}')">✏️ 编辑</button>
                      <button class="btn btn-ghost btn-sm" onclick="exportFormulaExcel('${f.id}')">📥 Excel</button>
                      <button class="btn btn-ghost btn-sm text-danger" onclick="confirmDeleteFormula('${f.id}','${escHtml(f.name)}')">🗑️</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `}
  `;
}

function filterFormulaList() {
  const q = (document.getElementById('formula-search')?.value || '').toLowerCase();
  const colorFilter = document.getElementById('formula-color-filter')?.value || '';
  document.querySelectorAll('#formula-table tbody tr').forEach(row => {
    const nameMatch = !q || row.dataset.name.includes(q);
    const colorMatch = !colorFilter || row.dataset.color === colorFilter;
    row.classList.toggle('hidden', !nameMatch || !colorMatch);
  });
}

function showFormulaModal(editId) {
  const isEdit = !!editId;
  const formula = isEdit ? getFormulaById(editId) : null;
  const materials = getMaterials();
  const grouped = getMaterialsByCategory();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  const existingIngredients = formula?.ingredients || [];
  const existingProperties = formula?.properties || {};
  const existingImages = formula?.imageModules || [];

  overlay.innerHTML = `
    <div class="modal wide">
      <div class="modal-header">
        <h3>${isEdit ? '编辑配方' : '新建配方'}</h3>
        <button class="btn btn-ghost btn-sm btn-icon" onclick="this.closest('.modal-overlay').remove()">${ico('xmark')}</button>
      </div>
      <div class="modal-body">
        <!-- 基本信息 -->
        <div class="form-group">
          <label>配方名称 <span class="required">*</span></label>
          <input type="text" class="input" id="fm-name" value="${isEdit ? escHtml(formula.name) : ''}" placeholder="例：水性柔版墨-蓝-001">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>颜色 <span class="required">*</span></label>
            <select class="select" id="fm-color">
              ${['','蓝','青','绿','黄','橙','红','品红','紫','黑','白','灰','棕','透明'].map(c =>
                `<option value="${c}" ${isEdit && formula.color === c ? 'selected' : ''}>${c || '请选择颜色'}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>基材</label>
            <input type="text" class="input" id="fm-substrate" value="${isEdit ? escHtml(formula.substrate || '') : ''}" placeholder="例：PET膜 / 铜版纸 / 棉布">
          </div>
        </div>

        <!-- 原料成分 -->
        <div class="card mb-16">
          <div class="card-header">
            <h3>${ico('flask')} 原料成分</h3>
            <button class="btn btn-outline btn-sm" id="btn-add-ingredient">＋ 添加成分</button>
          </div>
          <div class="card-body" id="ingredients-container">
            ${existingIngredients.length === 0 ? '<div class="text-muted text-center" style="padding:16px;" id="no-ingredients-msg">尚未添加原料成分</div>' : ''}
            ${existingIngredients.map((ing, i) => buildIngredientRow(i, ing, grouped)).join('')}
          </div>
        </div>

        <!-- 物性数据 -->
        <div class="card mb-16">
          <div class="card-header"><h3>${ico('chart-simple')} 物性数据</h3></div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label>粘度值</label>
                <input type="text" class="input" id="prop-viscosity" value="${existingProperties.viscosity?.value || ''}" placeholder="例：25">
              </div>
              <div class="form-group">
                <label>粘度单位</label>
                <select class="select" id="prop-viscosity-unit">
                  <option value="mPa·s" ${(!existingProperties.viscosity?.unit || existingProperties.viscosity.unit === 'mPa·s') ? 'selected' : ''}>mPa·s</option>
                  <option value="cP" ${existingProperties.viscosity?.unit === 'cP' ? 'selected' : ''}>cP</option>
                  <option value="s" ${existingProperties.viscosity?.unit === 's' ? 'selected' : ''}>s (涂4杯)</option>
                </select>
              </div>
              <div class="form-group">
                <label>测试方法</label>
                <input type="text" class="input" id="prop-viscosity-method" value="${escHtml(existingProperties.viscosity?.method || '')}" placeholder="例：旋转粘度计">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>表面张力值</label>
                <input type="text" class="input" id="prop-tension" value="${existingProperties.surfaceTension?.value || ''}" placeholder="例：32">
              </div>
              <div class="form-group">
                <label>表面张力单位</label>
                <select class="select" id="prop-tension-unit">
                  <option value="mN/m" ${(!existingProperties.surfaceTension?.unit || existingProperties.surfaceTension.unit === 'mN/m') ? 'selected' : ''}>mN/m</option>
                  <option value="dyn/cm" ${existingProperties.surfaceTension?.unit === 'dyn/cm' ? 'selected' : ''}>dyn/cm</option>
                </select>
              </div>
              <div class="form-group">
                <label>测试方法</label>
                <input type="text" class="input" id="prop-tension-method" value="${escHtml(existingProperties.surfaceTension?.method || '')}" placeholder="例：铂金板法">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>L*</label><input type="text" class="input" id="prop-L" value="${existingProperties.spectrophotometer?.L || ''}" placeholder="0-100"></div>
              <div class="form-group"><label>a*</label><input type="text" class="input" id="prop-a" value="${existingProperties.spectrophotometer?.a || ''}" placeholder=""></div>
              <div class="form-group"><label>b*</label><input type="text" class="input" id="prop-b" value="${existingProperties.spectrophotometer?.b || ''}" placeholder=""></div>
              <div class="form-group"><label>ΔE</label><input type="text" class="input" id="prop-dE" value="${existingProperties.spectrophotometer?.ΔE || ''}" placeholder="色差值"></div>
            </div>
          </div>
        </div>

        <!-- 图片模块 -->
        <div class="card mb-16">
          <div class="card-header">
            <h3>${ico('image')} 图片模块</h3>
            <button class="btn btn-outline btn-sm" id="btn-add-image-module">＋ 添加图片模块</button>
          </div>
          <div class="card-body" id="image-modules-container">
            ${existingImages.length === 0 ? '<div class="text-muted text-center" style="padding:16px;" id="no-images-msg">尚未添加图片模块</div>' : ''}
            ${existingImages.map((img, i) => buildImageModuleRow(i, img)).join('')}
          </div>
        </div>

        <!-- 备注 -->
        <div class="card mb-16">
          <div class="card-header"><h3>${ico('note-sticky')} 备注</h3></div>
          <div class="card-body">
            <textarea class="textarea" id="fm-remarks" placeholder="记录配方相关的观察、异常、改进想法等…" style="min-height:80px;">${escHtml(formula?.remarks || '')}</textarea>
          </div>
        </div>

        <!-- 评价 -->
        <div class="card mb-16">
          <div class="card-header"><h3>⭐ 配方评价</h3></div>
          <div class="card-body">
            <textarea class="textarea" id="fm-evaluation" placeholder="对配方进行综合评价：色相表现、干燥速度、附着力、耐性等…" style="min-height:80px;">${escHtml(formula?.evaluation || '')}</textarea>
          </div>
        </div>

        <!-- AI 诊断 -->
        <div class="card mb-16 ai-assistant-card" id="formula-ai-card">
          <div class="card-header">
            <h3>${ico('robot')} 豆包AI 异常诊断</h3>
            <span class="text-muted" style="font-size:0.72rem;">输入你的观察，让AI帮忙分析可能原因</span>
          </div>
          <div class="card-body">
            <textarea class="textarea" id="ai-question" placeholder="例如：色块干燥后有裂纹，粘度24h后上升了15%..." style="min-height:60px;"></textarea>
            <div class="flex gap-8 items-center mt-8" style="flex-wrap:wrap;">
              <button class="btn btn-primary btn-sm" id="btn-ai-ask" onclick="askDoubaoInModal()">${ico('magnifying-glass')} AI诊断</button>
              <button class="btn btn-outline btn-sm" id="btn-ai-save-result" onclick="saveAiResultToRemarks()" style="display:none;">${ico('floppy-disk')} 保存诊断结果到备注</button>
              <span class="text-muted" id="ai-status"></span>
            </div>
            <div id="ai-result" class="mt-12" style="display:none;"></div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">取消</button>
        <button class="btn btn-primary" id="btn-save-formula">${ico('floppy-disk')} 保存配方</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // ========== Add Ingredient ==========
  let ingredientCounter = existingIngredients.length;
  overlay.querySelector('#btn-add-ingredient').onclick = () => {
    const container = overlay.querySelector('#ingredients-container');
    const msg = overlay.querySelector('#no-ingredients-msg');
    if (msg) msg.remove();
    const div = document.createElement('div');
    div.innerHTML = buildIngredientRow(ingredientCounter, null, grouped);
    container.appendChild(div.firstElementChild);
    ingredientCounter++;
  };

  // ========== Add Image Module ==========
  let imageCounter = existingImages.length;
  overlay.querySelector('#btn-add-image-module').onclick = () => {
    const container = overlay.querySelector('#image-modules-container');
    const msg = overlay.querySelector('#no-images-msg');
    if (msg) msg.remove();
    const div = document.createElement('div');
    div.innerHTML = buildImageModuleRow(imageCounter, null);
    container.appendChild(div.firstElementChild);
    imageCounter++;
  };

  // ========== Save ==========
  overlay.querySelector('#btn-save-formula').onclick = () => {
    const name = overlay.querySelector('#fm-name').value.trim();
    if (!name) { showToast('请输入配方名称', 'error'); return; }

    // Collect ingredients
    const ingredients = [];
    overlay.querySelectorAll('.ingredient-row').forEach(row => {
      const select = row.querySelector('.ing-cat-select');
      const cat = select?.value || '';
      const matId = row.querySelector('.ing-material-select')?.value;
      const ratio = row.querySelector('.ing-ratio')?.value.trim();
      const mass = row.querySelector('.ing-mass')?.value.trim();
      const material = getMaterialById(matId);
      if (material) {
        ingredients.push({ materialId: matId, name: material.name, code: material.code || '', category: material.category, ratio, mass });
      }
    });

    // Collect properties
    const properties = {
      viscosity: {
        value: overlay.querySelector('#prop-viscosity').value.trim(),
        unit: overlay.querySelector('#prop-viscosity-unit').value,
        method: overlay.querySelector('#prop-viscosity-method').value.trim()
      },
      surfaceTension: {
        value: overlay.querySelector('#prop-tension').value.trim(),
        unit: overlay.querySelector('#prop-tension-unit').value,
        method: overlay.querySelector('#prop-tension-method').value.trim()
      },
      spectrophotometer: {
        L: overlay.querySelector('#prop-L').value.trim(),
        a: overlay.querySelector('#prop-a').value.trim(),
        b: overlay.querySelector('#prop-b').value.trim(),
        'ΔE': overlay.querySelector('#prop-dE').value.trim()
      }
    };

    // Collect images
    const imageModules = [];
    overlay.querySelectorAll('.image-module-card').forEach(card => {
      const label = card.querySelector('.img-label-input')?.value.trim() || '未命名';
      const img = card.querySelector('.img-preview-img');
      const hiddenInput = card.querySelector('.img-data-input');
      const moduleId = hiddenInput?.dataset.moduleId || genId();
      if (img && img.src && img.src.startsWith('data:')) {
        imageModules.push({ id: moduleId, label, dataUrl: img.src });
      } else if (hiddenInput?.value && hiddenInput.value.startsWith('data:')) {
        imageModules.push({ id: moduleId, label, dataUrl: hiddenInput.value });
      }
    });

    saveFormula({
      id: isEdit ? editId : undefined,
      name,
      color: overlay.querySelector('#fm-color')?.value || '',
      substrate: overlay.querySelector('#fm-substrate')?.value?.trim() || '',
      ingredients,
      properties,
      imageModules,
      remarks: overlay.querySelector('#fm-remarks')?.value?.trim() || '',
      evaluation: overlay.querySelector('#fm-evaluation')?.value?.trim() || ''
    });

    overlay.remove();
    showToast(isEdit ? '配方已更新' : '配方已创建', 'success');
    renderFormulasPage();
  };
}

// ========== Build Ingredient Row ==========
function buildIngredientRow(idx, ing, grouped) {
  const allMats = getMaterials();
  const cats = CATEGORIES;

  return `
    <div class="ingredient-row">
      <div class="field narrow">
        <select class="select ing-cat-select" onchange="onIngredientCatChange(this)">
          <option value="">分类</option>
          ${cats.map(c => `<option value="${c}" ${ing && ing.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="field wide">
        <select class="select ing-material-select">
          <option value="">选择原料</option>
          ${allMats.filter(m => !ing || m.category === ing.category).map(m => `
            <option value="${m.id}" data-cat="${m.category}" ${ing && ing.materialId === m.id ? 'selected' : ''}>
              ${matOptionLabel(m)}
            </option>
          `).join('')}
        </select>
      </div>
      <div class="field">
        <input type="text" class="input ing-ratio" placeholder="配比(例:35%)" value="${ing?.ratio || ''}">
      </div>
      <div class="field">
        <input type="text" class="input ing-mass" placeholder="质量(例:35.0g)" value="${ing?.mass || ''}">
      </div>
      <button class="btn btn-ghost btn-sm btn-icon text-danger" onclick="this.closest('.ingredient-row').remove();" title="删除此成分">${ico('xmark')}</button>
    </div>
  `;
}

function onIngredientCatChange(selectEl) {
  const row = selectEl.closest('.ingredient-row');
  const matSelect = row.querySelector('.ing-material-select');
  const cat = selectEl.value;
  const allMats = getMaterials();

  matSelect.innerHTML = `<option value="">选择原料</option>` +
    allMats.filter(m => !cat || m.category === cat).map(m =>
      `<option value="${m.id}" data-cat="${m.category}">${matOptionLabel(m)}</option>`
    ).join('');
}

// ========== Build Image Module Row ==========
function buildImageModuleRow(idx, img) {
  const moduleId = img?.id || genId();
  return `
    <div class="image-module-card">
      <div class="img-header">
        <input type="text" class="input img-label-input" value="${img?.label || '色块图'}" placeholder="模块名称" style="border:none;background:transparent;padding:0;font-weight:600;font-size:0.78rem;">
        <button class="btn btn-ghost btn-sm btn-icon text-danger" onclick="this.closest('.image-module-card').remove();" title="删除此模块">${ico('xmark')}</button>
      </div>
      <div class="img-body" onclick="this.querySelector('input[type=file]').click()">
        ${img?.dataUrl
          ? `<img src="${img.dataUrl}" class="img-preview-img" style="width:100%;height:100%;object-fit:cover;">`
          : `<span class="img-placeholder">${ico('camera')}</span>`
        }
        <input type="file" accept="image/*" class="hidden" onchange="handleImageUpload(this)" data-module-id="${moduleId}">
      </div>
      <input type="hidden" class="img-data-input" value="${img?.dataUrl || ''}" data-module-id="${moduleId}">
      <div class="img-actions">
        <button class="btn btn-ghost btn-sm" onclick="this.closest('.image-module-card').querySelector('input[type=file]').click()">${ico('arrows-rotate')} 更换</button>
        <button class="btn btn-ghost btn-sm text-danger" onclick="this.closest('.image-module-card').querySelector('.img-preview-img')?.remove(); this.closest('.image-module-card').querySelector('.img-data-input').value=''; this.closest('.image-module-card').querySelector('.img-body').innerHTML='<span class=\\'img-placeholder\\'>${ico('camera')}</span><input type=\\'file\\' accept=\\'image/*\\' class=\\'hidden\\' onchange=\\'handleImageUpload(this)\\' data-module-id=\\'${moduleId}\\'>';">清除</button>
      </div>
    </div>
  `;
}

function handleImageUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { showToast('图片不能超过10MB', 'error'); return; }

  const reader = new FileReader();
  reader.onload = function(e) {
    const card = input.closest('.image-module-card');
    const imgBody = card.querySelector('.img-body');
    const hiddenInput = card.querySelector('.img-data-input');

    // Update preview
    let img = imgBody.querySelector('.img-preview-img');
    if (!img) {
      img = document.createElement('img');
      img.className = 'img-preview-img';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      imgBody.innerHTML = '';
      imgBody.appendChild(img);
      imgBody.appendChild(input);
    }
    img.src = e.target.result;

    // Store data
    hiddenInput.value = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ========== Formula Detail View ==========
function viewFormulaDetail(formulaId) {
  const formula = getFormulaById(formulaId);
  if (!formula) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  const props = formula.properties || {};
  const imgs = formula.imageModules || [];
  const ings = formula.ingredients || [];

  overlay.innerHTML = `
    <div class="modal wide">
      <div class="modal-header">
        <h3>
          ${formula.color ? `<span class="color-dot" style="background:${COLOR_MAP[formula.color] || '#94a3b8'};width:14px;height:14px;vertical-align:middle;margin-right:6px;"></span>` : ''}
          ${escHtml(formula.name)}
        </h3>
        <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:4px;">
          ${formula.color ? `<span class="color-dot" style="background:${COLOR_MAP[formula.color] || '#94a3b8'};width:8px;height:8px;"></span> ${formula.color} · ` : ''}
          ${formula.substrate ? `基材: ${escHtml(formula.substrate)} · ` : ''}
          共 ${ings.length} 种原料
        </div>
        <div class="flex gap-8">
          <button class="btn btn-outline btn-sm" onclick="exportFormulaExcel('${formula.id}')">${ico('download')} 导出Excel</button>
          <button class="btn btn-primary btn-sm" onclick="this.closest('.modal-overlay').remove(); showFormulaModal('${formula.id}')">${ico('pen-to-square')} 编辑</button>
          <button class="btn btn-ghost btn-sm btn-icon" onclick="this.closest('.modal-overlay').remove()">${ico('xmark')}</button>
        </div>
      </div>
      <div class="modal-body">
        <!-- 原料成分表 -->
        <div class="card mb-16">
          <div class="card-header"><h3>${ico('flask')} 原料成分</h3></div>
          <div class="table-wrap">
            <table>
              <thead><tr><th>#</th><th>分类</th><th>原料</th><th>配比</th><th>质量</th></tr></thead>
              <tbody>
                ${ings.length === 0 ? '<tr><td colspan="5" class="text-center text-muted">暂无数据</td></tr>' : ''}
                ${ings.map((ing, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td><span class="tag tag-${CATEGORY_COLORS[ing.category] || 'solvent'}">${ing.category || '-'}</span></td>
                    <td><strong>${matDisplayLabel(ing)}</strong>${isAdmin() && ing.code ? ` <span style="font-size:0.7rem;color:var(--primary);font-family:var(--font-mono);">[${escHtml(ing.code)}]</span>` : ''}</td>
                    <td>${ing.ratio || '-'}</td>
                    <td>${ing.mass || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 物性数据 -->
        <div class="card mb-16">
          <div class="card-header"><h3>${ico('chart-simple')} 物性数据</h3></div>
          <div class="card-body">
            <div class="property-grid">
              <div class="property-item">
                <div class="prop-icon viscosity">${ico('flask')}</div>
                <div class="prop-info">
                  <div class="prop-label">粘度</div>
                  <div class="prop-value">${props.viscosity?.value ? props.viscosity.value + ' ' + (props.viscosity.unit || 'mPa·s') : '-'}</div>
                  ${props.viscosity?.method ? `<div class="text-muted">${escHtml(props.viscosity.method)}</div>` : ''}
                </div>
              </div>
              <div class="property-item">
                <div class="prop-icon tension">${ico('droplet')}</div>
                <div class="prop-info">
                  <div class="prop-label">表面张力</div>
                  <div class="prop-value">${props.surfaceTension?.value ? props.surfaceTension.value + ' ' + (props.surfaceTension.unit || 'mN/m') : '-'}</div>
                  ${props.surfaceTension?.method ? `<div class="text-muted">${escHtml(props.surfaceTension.method)}</div>` : ''}
                </div>
              </div>
              <div class="property-item">
                <div class="prop-icon spectro">${ico('palette')}</div>
                <div class="prop-info">
                  <div class="prop-label">光度计 (Lab)</div>
                  <div class="prop-value">
                    ${props.spectrophotometer?.L ? `L*${props.spectrophotometer.L}` : ''}
                    ${props.spectrophotometer?.a ? ` a*${props.spectrophotometer.a}` : ''}
                    ${props.spectrophotometer?.b ? ` b*${props.spectrophotometer.b}` : ''}
                    ${!props.spectrophotometer?.L && !props.spectrophotometer?.a && !props.spectrophotometer?.b ? '-' : ''}
                  </div>
                  ${props.spectrophotometer?.['ΔE'] ? `<div class="text-muted">ΔE = ${props.spectrophotometer['ΔE']}</div>` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        ${formula.remarks ? `
        <div class="card mb-16">
          <div class="card-header"><h3>${ico('note-sticky')} 备注</h3></div>
          <div class="card-body">
            <div style="white-space:pre-wrap;font-size:0.88rem;line-height:1.7;">${escHtml(formula.remarks)}</div>
          </div>
        </div>
        ` : ''}

        ${formula.evaluation ? `
        <div class="card mb-16">
          <div class="card-header"><h3>⭐ 配方评价</h3></div>
          <div class="card-body">
            <div style="white-space:pre-wrap;font-size:0.88rem;line-height:1.7;">${escHtml(formula.evaluation)}</div>
          </div>
        </div>
        ` : ''}

        <!-- 图片模块 -->
        ${imgs.length > 0 ? `
        <div class="card">
          <div class="card-header"><h3>${ico('image')} 图片模块</h3></div>
          <div class="card-body">
            <div class="image-modules">
              ${imgs.map(img => `
                <div class="image-module-card">
                  <div class="img-header">${escHtml(img.label || '未命名')}</div>
                  <div class="img-body" style="cursor:zoom-in;" onclick="showImagePreview('${img.dataUrl.replace(/'/g, "\\'")}')">
                    <img src="${img.dataUrl}" style="width:100%;height:100%;object-fit:cover;" alt="${escHtml(img.label)}">
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

function showImagePreview(dataUrl) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.cssText = 'background:rgba(0,0,0,.85);z-index:300;';
  overlay.onclick = () => overlay.remove();
  overlay.innerHTML = `<img src="${dataUrl}" style="max-width:90vw;max-height:90vh;object-fit:contain;border-radius:4px;">`;
  document.body.appendChild(overlay);
}

// ========== Formula Evaluation Panel (Inline AI) ==========
function showFormulaEvalPanel(formulaId) {
  const formula = getFormulaById(formulaId);
  if (!formula) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div class="modal" style="max-width:620px;">
      <div class="modal-header" style="background:linear-gradient(135deg,#fef3c7,#dbeafe);">
        <h3>⭐ 配方评价 · ${escHtml(formula.name)}</h3>
        <button class="btn btn-ghost btn-sm btn-icon" onclick="this.closest('.modal-overlay').remove()">✕</button>
      </div>
      <div class="modal-body">
        <div class="card mb-16">
          <div class="card-header"><h3>📝 评价内容</h3></div>
          <div class="card-body">
            <textarea class="textarea" id="eval-text" placeholder="对配方的综合评价：色相、干燥、附着力、耐性、性价比…" style="min-height:100px;">${escHtml(formula.evaluation || '')}</textarea>
          </div>
        </div>

        <div class="card mb-16 ai-assistant-card">
          <div class="card-header">
            <h3>🤖 AI 快速诊断</h3>
            <span class="text-muted" style="font-size:0.72rem;">基于配方数据+评价内容，让AI分析</span>
          </div>
          <div class="card-body">
            <div class="flex gap-8 mb-8" style="flex-wrap:wrap;">
              <button class="btn btn-sm eval-ai-preset" data-q="请综合评价这个配方，指出优缺点和改进建议">📊 全面评价</button>
              <button class="btn btn-sm eval-ai-preset" data-q="分析该配方可能存在什么异常风险">⚠️ 风险分析</button>
              <button class="btn btn-sm eval-ai-preset" data-q="给出优化该配方性能的3条具体建议">💡 优化建议</button>
              <button class="btn btn-sm eval-ai-preset" data-q="分析该配方的成本结构，有哪些可降本的方向？">💰 成本分析</button>
            </div>
            <textarea class="textarea" id="eval-ai-question" placeholder="或自定义提问…" style="min-height:50px;"></textarea>
            <div class="flex gap-8 items-center mt-8">
              <button class="btn btn-primary btn-sm" id="btn-eval-ai-ask">🔍 AI分析</button>
              <button class="btn btn-outline btn-sm" id="btn-eval-ai-save" style="display:none;">💾 保存结果到评价</button>
              <span class="text-muted" id="eval-ai-status"></span>
            </div>
            <div id="eval-ai-result" class="mt-12" style="display:none;"></div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">取消</button>
        <button class="btn btn-primary" id="btn-save-eval">💾 保存评价</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Preset question buttons
  overlay.querySelectorAll('.eval-ai-preset').forEach(btn => {
    btn.onclick = () => {
      overlay.querySelector('#eval-ai-question').value = btn.dataset.q;
    };
  });

  // Save evaluation
  overlay.querySelector('#btn-save-eval').onclick = () => {
    const text = overlay.querySelector('#eval-text').value.trim();
    formula.evaluation = text;
    saveFormula(formula);
    overlay.remove();
    showToast('评价已保存', 'success');
    renderFormulasPage();
  };

  // AI ask
  const askAi = async () => {
    const question = overlay.querySelector('#eval-ai-question').value.trim();
    const evalText = overlay.querySelector('#eval-text').value.trim();
    if (!question) { showToast('请输入或选择一个问题', 'error'); return; }
    if (!isAiConfigured()) { showAiConfigModal(); return; }

    const btnAsk = overlay.querySelector('#btn-eval-ai-ask');
    const btnSave = overlay.querySelector('#btn-eval-ai-save');
    const statusEl = overlay.querySelector('#eval-ai-status');
    const resultEl = overlay.querySelector('#eval-ai-result');

    btnAsk.disabled = true;
    statusEl.textContent = '⏳ AI 分析中...';
    resultEl.style.display = 'none';
    btnSave.style.display = 'none';

    const sysPrompt = buildDiagnosisPrompt(formula) + '\n用户对配方的评价:\n' + (evalText || '暂无评价');
    
    try {
      const reply = await callDoubaoAPI(question, sysPrompt);
      resultEl.style.display = 'block';
      resultEl.innerHTML = `
        <div class="ai-response">
          <div class="ai-response-header">🤖 AI 分析结果</div>
          <div class="ai-response-body" style="white-space:pre-wrap;font-size:0.85rem;line-height:1.7;">${escHtml(reply || '无回复')}</div>
          <div class="text-muted mt-8" style="font-size:0.72rem;">⚠️ AI 分析仅供参考</div>
        </div>
      `;
      btnSave.style.display = 'inline-flex';
      statusEl.textContent = '✅ 完成';
      resultEl.dataset.aiResult = reply || '';
    } catch (err) {
      resultEl.style.display = 'block';
      resultEl.innerHTML = `<div class="ai-response ai-error"><div class="ai-response-body" style="white-space:pre-wrap;color:var(--danger);">❌ ${escHtml(err.message)}</div></div>`;
      statusEl.textContent = '❌ 失败';
    } finally {
      btnAsk.disabled = false;
    }
  };

  overlay.querySelector('#btn-eval-ai-ask').onclick = askAi;

  overlay.querySelector('#eval-ai-question').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAi(); }
  });

  // Save AI result to evaluation
  overlay.querySelector('#btn-eval-ai-save').onclick = () => {
    const aiText = overlay.querySelector('#eval-ai-result')?.dataset?.aiResult || '';
    if (!aiText) { showToast('没有可保存的结果', 'error'); return; }
    const evalEl = overlay.querySelector('#eval-text');
    const existing = evalEl.value.trim();
    const newContent = existing
      ? existing + '\n\n--- AI 分析 (' + new Date().toLocaleString('zh-CN') + ') ---\n' + aiText
      : '--- AI 分析 (' + new Date().toLocaleString('zh-CN') + ') ---\n' + aiText;
    evalEl.value = newContent;
    showToast('AI结果已追加到评价', 'success');
  };
}

function confirmDeleteFormula(id, name) {
  if (confirm(`确定要删除配方「${name}」吗？此操作不可撤销。`)) {
    deleteFormula(id);
    showToast('配方已删除', 'success');
    renderFormulasPage();
  }
}

// ========== Helpers ==========
function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatDate(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function showToast(msg, type) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type || 'info'}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; }, 2500);
  setTimeout(() => toast.remove(), 2800);
}
