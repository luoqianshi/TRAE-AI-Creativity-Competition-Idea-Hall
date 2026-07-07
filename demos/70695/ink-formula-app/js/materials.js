/* ========== 水性墨水配方管理系统 - 原料管理模块 v2 (含权限) ========== */

function renderMaterialsPage() {
  if (!isLoggedIn()) return;

  const content = document.getElementById('content');
  const allMats = getMaterials();
  const grouped = getMaterialsByCategory();
  const isAdminUser = isAdmin();
  const allowedCats = isAdminUser ? [...CATEGORIES] : getAllowedCategories();

  // Filter which categories to show
  const visibleCategories = CATEGORIES.filter(c => allowedCats.includes(c));

  if (visibleCategories.length === 0) {
    content.innerHTML = `
      <div class="card">
        <div class="card-body">
          <div class="empty-state">
            <div class="icon">${ico('lock')}</div>
            <h4>暂无原料查看权限</h4>
            <p class="text-muted mt-8">请联系管理员为你分配原料分类的查看权限</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Count visible materials
  let totalVisible = 0;
  visibleCategories.forEach(c => { totalVisible += (grouped[c] || []).length; });

  content.innerHTML = `
    <div class="toolbar flex items-center justify-between">
      <div class="flex gap-8 items-center">
        <span class="text-muted">共 <strong>${totalVisible}</strong> 种原料</span>
        ${isAdminUser
          ? `<span class="text-muted">｜全部 ${CATEGORIES.length} 个分类</span>`
          : `<span class="text-muted">｜可查看 ${visibleCategories.length}/${CATEGORIES.length} 个分类</span>`
        }
      </div>
      <div class="flex gap-8">
        ${isAdminUser ? `
          <button class="btn btn-outline btn-sm" onclick="exportAllData()">${ico('box-archive')} 导出数据</button>
          <button class="btn btn-outline btn-sm" onclick="document.getElementById('import-file-input').click()">${ico('download')} 导入数据</button>
          <input type="file" id="import-file-input" accept=".json" class="hidden" onchange="importAllData(this.files[0]); this.value='';">
          <button class="btn btn-primary btn-sm" onclick="showMaterialModal()">＋ 添加原料</button>
        ` : ''}
      </div>
    </div>
    <div class="flex gap-12" style="flex-wrap:wrap;">
      ${visibleCategories.map(cat => {
        const items = (grouped[cat] || []).filter(m => allowedCats.includes(m.category));
        return `
          <div class="card flex-1" style="min-width:260px;">
            <div class="card-header">
              <h3>
                <span class="tag tag-${CATEGORY_COLORS[cat]}">${cat}</span>
                <span style="margin-left:8px;font-size:0.8rem;color:var(--text-light)">${items.length} 种</span>
              </h3>
              ${isAdminUser ? `<span class="text-muted" style="font-size:0.72rem;">管理</span>` : `<span class="text-muted" style="font-size:0.72rem;">只读</span>`}
            </div>
            <div class="card-body" style="padding:8px;">
              ${items.length === 0 ? '<div class="empty-state" style="padding:24px;"><span style="font-size:1.5rem;">' + ico('inbox') + '</span><p class="text-muted mt-8">暂无原料</p></div>' : ''}
              ${items.map(m => `
                <div class="flex items-center justify-between" style="padding:8px 10px;border-bottom:1px solid var(--border);">
                  <div>
                    <strong style="font-size:0.88rem;">${matDisplayLabel(m)}</strong>
                    ${isAdminUser && m.code ? `<span style="margin-left:6px;font-size:0.72rem;color:var(--primary);font-family:var(--font-mono);background:var(--primary-light);padding:1px 6px;border-radius:3px;">${escHtml(m.code)}</span>` : ''}
                    ${isAdminUser && m.specs ? `<br><span class="text-muted" style="font-size:0.76rem;">${ico('ruler')} ${escHtml(m.specs)}</span>` : ''}
                    ${isAdminUser && m.manufacturer ? `<br><span class="text-muted" style="font-size:0.74rem;">${ico('industry')} ${escHtml(m.manufacturer)}</span>` : ''}
                    ${isAdminUser && m.customInfo && Object.keys(m.customInfo).some(k => m.customInfo[k]) ? `<br><span class="text-muted" style="font-size:0.72rem;">${ico('paperclip')} ${Object.entries(m.customInfo).filter(([k,v]) => v).slice(0,2).map(([k,v]) => escHtml(k)+':'+escHtml(v)).join(' | ')}${Object.keys(m.customInfo).filter(k => m.customInfo[k]).length > 2 ? ' ...' : ''}</span>` : ''}
                  </div>
                  ${isAdminUser ? `
                  <div class="flex gap-4">
                    <button class="btn btn-ghost btn-sm btn-icon" title="编辑" onclick="showMaterialModal('${m.id}')">${ico('pen-to-square')}</button>
                    <button class="btn btn-ghost btn-sm btn-icon text-danger" title="删除" onclick="confirmDeleteMaterial('${m.id}','${escHtml(m.name)}')">${ico('trash-can')}</button>
                  </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function showMaterialModal(editId) {
  // Only admin can edit
  if (!isAdmin()) {
    showToast('仅管理员可编辑原料', 'error');
    return;
  }

  const isEdit = !!editId;
  const material = isEdit ? getMaterialById(editId) : null;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div class="modal" style="max-width:560px;">
      <div class="modal-header">
        <h3>${isEdit ? '编辑原料' : '添加原料'}</h3>
        <button class="btn btn-ghost btn-sm btn-icon" onclick="this.closest('.modal-overlay').remove()">${ico('xmark')}</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group">
            <label>公司代码</label>
            <input type="text" class="input" id="mat-code" value="${isEdit ? escHtml(material.code || '') : ''}" placeholder="例：L-001" style="font-family:var(--font-mono);">
          </div>
          <div class="form-group">
            <label>名称 <span class="required">*</span></label>
            <input type="text" class="input" id="mat-name" value="${isEdit ? escHtml(material.name) : ''}" placeholder="例：异丙醇">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>分类 <span class="required">*</span></label>
            <select class="select" id="mat-category">
              ${CATEGORIES.map(c => `<option value="${c}" ${isEdit && material.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>厂家</label>
            <input type="text" class="input" id="mat-manufacturer" value="${isEdit ? escHtml(material.manufacturer || '') : ''}" placeholder="例：陶氏化学">
          </div>
        </div>
        <div class="form-group">
          <label>规格说明</label>
          <input type="text" class="input" id="mat-specs" value="${isEdit ? escHtml(material.specs || '') : ''}" placeholder="例：99.7% 工业级">
        </div>

        <!-- 自定义信息栏 -->
        <div class="card mt-16">
          <div class="card-header">
            <h3>${ico('paperclip')} 自定义信息</h3>
            <button class="btn btn-outline btn-sm" id="btn-add-custom-field">＋ 添加字段</button>
          </div>
          <div class="card-body" id="custom-fields-container">
            ${renderCustomFields(isEdit ? (material.customInfo || {}) : {})}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">取消</button>
        <button class="btn btn-primary" id="btn-save-material">保存</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Add custom field handler
  overlay.querySelector('#btn-add-custom-field').onclick = () => {
    const container = overlay.querySelector('#custom-fields-container');
    const div = document.createElement('div');
    div.innerHTML = buildCustomFieldRow('', '');
    container.appendChild(div.firstElementChild);
  };

  overlay.querySelector('#btn-save-material').onclick = () => {
    const code = overlay.querySelector('#mat-code').value.trim();
    const name = overlay.querySelector('#mat-name').value.trim();
    const category = overlay.querySelector('#mat-category').value;
    const specs = overlay.querySelector('#mat-specs').value.trim();
    const manufacturer = overlay.querySelector('#mat-manufacturer').value.trim();

    // Collect custom info
    const customInfo = {};
    overlay.querySelectorAll('.custom-field-row').forEach(row => {
      const key = row.querySelector('.cf-key')?.value?.trim();
      const val = row.querySelector('.cf-val')?.value?.trim();
      if (key) customInfo[key] = val || '';
    });

    if (!name) { showToast('请输入原料名称', 'error'); return; }

    saveMaterial({
      id: isEdit ? editId : undefined,
      code,
      name,
      category,
      specs,
      manufacturer,
      customInfo
    });

    overlay.remove();
    showToast(isEdit ? '原料已更新' : '原料已添加', 'success');
    renderMaterialsPage();
  };

  // Enter to save
  overlay.querySelector('#mat-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') overlay.querySelector('#btn-save-material').click();
  });
}

function confirmDeleteMaterial(id, name) {
  if (!isAdmin()) {
    showToast('仅管理员可删除原料', 'error');
    return;
  }
  if (confirm(`确定要删除原料「${name}」吗？\n\n注意：已使用该原料的配方不会自动更新。`)) {
    deleteMaterial(id);
    showToast('原料已删除', 'success');
    renderMaterialsPage();
  }
}

// ========== Custom Info Field Helpers ==========
function renderCustomFields(customInfo) {
  const entries = Object.entries(customInfo || {});
  if (entries.length === 0) {
    return '<div class="text-muted text-center" style="padding:12px;" id="no-custom-msg">暂无自定义信息，点击上方按钮添加</div>';
  }
  return entries.map(([key, val]) => buildCustomFieldRow(key, val)).join('');
}

function buildCustomFieldRow(key, val) {
  return `
    <div class="custom-field-row flex gap-6 items-center" style="margin-bottom:6px;">
      <input type="text" class="input cf-key" value="${escHtml(key)}" placeholder="字段名" style="flex:1;font-size:0.82rem;">
      <input type="text" class="input cf-val" value="${escHtml(val || '')}" placeholder="值" style="flex:2;font-size:0.82rem;">
      <button class="btn btn-ghost btn-sm btn-icon text-danger" onclick="this.closest('.custom-field-row').remove();" title="删除此字段">${ico('xmark')}</button>
    </div>
  `;
}
