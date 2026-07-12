/**
 * 分类管理模块 - 支持主分类与子分类
 * 分类结构: { id, name, parentId, color, icon, sortOrder, createdAt, updatedAt }
 * - parentId === null  表示是主分类
 * - parentId !== null  表示是子分类，parentId 指向某个主分类 id
 *
 * 元件分类规则 (categoryId, subCategoryId):
 * - 两者都为空 => 无分类
 * - 两者都非空 => 指定主分类 + 子分类
 * - 不允许只填其中一个
 */
const CategoriesModule = {

  // ============ 渲染分类管理页面 ============
  renderCategories() {
    const categories = DataService.getCategories();
    const components = DataService.getComponents();

    const rootCategories = categories.filter(c => !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder);

    const getSubCount = (parentId) => categories.filter(c => c.parentId === parentId).length;
    const getComponentCountInCategory = (catId) => components.filter(c => c.categoryId === catId).length;
    const getComponentCountInSubCategory = (subId) => components.filter(c => c.subCategoryId === subId).length;

    const container = document.getElementById('page-container');

    container.innerHTML = `
      <div class="page-header">
        <h1>分类管理</h1>
        <p>管理元器件的主分类与子分类</p>
      </div>

      <div class="category-manage-grid">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">主分类列表</h3>
            <button class="btn btn-primary btn-sm" onclick="CategoriesModule.showFormModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              添加主分类
            </button>
          </div>
          <div class="category-tree" id="categoryTree">
            ${rootCategories.length === 0 ? `
              <div class="empty-state" style="padding: 40px 20px;">
                <p style="color: var(--text-muted);">暂无分类，点击上方按钮添加</p>
              </div>
            ` : rootCategories.map(cat => this.renderCategoryNode(cat, getSubCount, getComponentCountInCategory)).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">分类统计</h3>
          </div>
          <div style="padding: 20px;">
            ${rootCategories.length === 0 ? `
              <p style="color: var(--text-muted); text-align: center; padding: 20px;">暂无数据</p>
            ` : rootCategories.map(cat => {
              const subs = categories.filter(c => c.parentId === cat.id);
              const total = subs.length > 0
                ? subs.reduce((sum, s) => sum + getComponentCountInSubCategory(s.id), 0)
                : getComponentCountInCategory(cat.id);
              return `
                <div class="category-stat-row" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color); gap: 12px;">
                  <div class="category-stat-name" style="display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; overflow: hidden;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: ${cat.color}; flex-shrink: 0;"></div>
                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${cat.name} <span style="color: var(--text-muted); font-size: 0.85rem;">(${subs.length} 个子分类)</span></span>
                  </div>
                  <span style="font-family: var(--font-display); font-weight: 600; color: var(--accent-primary); flex-shrink: 0;">${total} 个器件</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // ============ 渲染单个主分类节点 ============
  renderCategoryNode(category, getSubCount, getComponentCount) {
    const subCount = getSubCount(category.id);
    const categories = DataService.getCategories();
    const subCategories = categories.filter(c => c.parentId === category.id);

    return `
      <div class="category-item" data-id="${category.id}" style="border-left: 4px solid ${category.color}; margin-bottom: 8px; padding-left: 12px;">
        <div class="category-node" style="padding: 12px 0;">
          <div class="category-icon" style="background: ${category.color}20; color: ${category.color};">
            ${this.getCategoryIcon(category.icon)}
          </div>
          <div class="category-info" style="min-width: 0;">
            <div class="category-name" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${category.name}</div>
            <div class="category-count">${subCount} 个子分类</div>
          </div>
          <div class="category-actions">
            <button class="btn btn-secondary btn-sm btn-icon" onclick="event.stopPropagation(); CategoriesModule.showFormModal(null, '${category.id}')" title="添加子分类">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
            <button class="btn btn-secondary btn-sm btn-icon" onclick="event.stopPropagation(); CategoriesModule.showFormModal('${category.id}')" title="编辑">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn btn-danger btn-sm btn-icon" onclick="event.stopPropagation(); CategoriesModule.confirmDelete('${category.id}')" title="删除" ${subCount > 0 || getComponentCount(category.id) > 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
        ${subCategories.length > 0 ? `
          <div style="padding-left: 44px; padding-bottom: 8px;">
            ${subCategories.map(sub => `
              <div class="sub-category-row" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: var(--bg-tertiary); border-radius: var(--radius-sm); margin-bottom: 4px; gap: 8px;">
                <div class="sub-category-name" style="display: flex; align-items: center; gap: 8px; min-width: 0; flex: 1; overflow: hidden;">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background: ${category.color}; opacity: 0.6; flex-shrink: 0;"></div>
                  <span style="font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${sub.name}</span>
                </div>
                <div style="display: flex; gap: 4px; flex-shrink: 0;">
                  <button class="btn btn-secondary btn-sm btn-icon" onclick="CategoriesModule.showFormModal('${sub.id}')" title="编辑">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    </svg>
                  </button>
                  <button class="btn btn-danger btn-sm btn-icon" onclick="CategoriesModule.confirmDelete('${sub.id}')" title="删除">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18"/>
                    </svg>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  // ============ 获取分类图标 ============
  getCategoryIcon(iconName) {
    const icons = {
      resistor: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h4l3-9 4 18 3-9h6"/></svg>',
      capacitor: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M5 12h14"/><path d="M5 8h14"/></svg>',
      inductor: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h4l2-4 4 8 2-4h4"/></svg>',
      diode: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M8 6l4 6-4 6M16 6v12"/></svg>',
      transistor: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
      ic: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01"/></svg>',
      connector: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M6 10v4M18 10v4"/></svg>',
      sensor: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l2 2"/></svg>',
      default: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
    };
    return icons[iconName] || icons.default;
  },

  // ============ 显示表单弹窗 ============
  showFormModal(id = null, parentId = null) {
    const categories = DataService.getCategories();
    const category = id ? categories.find(c => c.id === id) : null;
    const isEdit = !!category;
    const isSubCategory = !isEdit ? !!parentId : !!(category && category.parentId);
    const effectiveParent = isEdit ? category.parentId : parentId;

    const parentName = effectiveParent
      ? (categories.find(c => c.id === effectiveParent)?.name || '')
      : '';

    const rootCategories = categories.filter(c => !c.parentId);

    const colorOptions = [
      '#ef4444', '#f97316', '#eab308', '#22c55e',
      '#06b6d4', '#8b5cf6', '#ec4899', '#14b8a6'
    ];

    const iconOptions = [
      { value: 'resistor', label: '电阻' },
      { value: 'capacitor', label: '电容' },
      { value: 'inductor', label: '电感' },
      { value: 'diode', label: '二极管' },
      { value: 'transistor', label: '三极管' },
      { value: 'ic', label: '集成电路' },
      { value: 'connector', label: '连接器' },
      { value: 'sensor', label: '传感器' }
    ];

    App.openModal();
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal" style="max-width: 500px;">
          <div class="modal-header">
            <h2 class="modal-title">${isEdit ? '编辑' + (isSubCategory ? '子' : '主') + '分类' : '添加' + (isSubCategory ? '子' : '主') + '分类'}</h2>
            <button class="modal-close" onclick="CategoriesModule.closeModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <form id="categoryForm" onsubmit="return false;" onkeydown="App.handleFormKeyDown(event, 'CategoriesModule.saveForm')">
              <input type="hidden" name="id" value="${category?.id || ''}">
              <input type="hidden" name="parentId" value="${effectiveParent || ''}">

              ${isSubCategory ? `
                <div class="form-group">
                  <label class="form-label">所属主分类</label>
                  <select class="form-select" name="parentIdDisplay" ${isEdit ? 'disabled' : ''}>
                    ${rootCategories.map(c => `<option value="${c.id}" ${effectiveParent === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                  </select>
                  <div class="form-help">子分类必须归属一个主分类</div>
                </div>
              ` : ''}

              <div class="form-group">
                <label class="form-label">分类名称 *</label>
                <input type="text" class="form-input" name="name" value="${category?.name || ''}" required placeholder="例如：${isSubCategory ? '贴片电阻' : '电阻'}">
              </div>

              ${!isSubCategory ? `
                <div class="form-group">
                  <label class="form-label">颜色</label>
                  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${colorOptions.map(color => `
                      <label style="cursor: pointer;">
                        <input type="radio" name="color" value="${color}" ${(category?.color || colorOptions[0]) === color ? 'checked' : ''} style="display: none;">
                        <div style="width: 32px; height: 32px; border-radius: 8px; background: ${color}; border: 3px solid transparent; ${(category?.color || colorOptions[0]) === color ? 'border-color: white;' : ''}"></div>
                      </label>
                    `).join('')}
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">图标</label>
                  <select class="form-select" name="icon">
                    ${iconOptions.map(opt => `<option value="${opt.value}" ${category?.icon === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('')}
                  </select>
                </div>
              ` : ''}
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="CategoriesModule.closeModal()">取消</button>
            <button class="btn btn-primary" onclick="CategoriesModule.saveForm()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <path d="M17 21v-8H7v8M7 3v5h8"/>
              </svg>
              保存
            </button>
          </div>
        </div>
      </div>
    `;

    // 颜色选择器交互
    document.querySelectorAll('input[name="color"]').forEach(input => {
      input.addEventListener('change', () => {
        document.querySelectorAll('input[name="color"] + div').forEach(el => {
          el.style.borderColor = 'transparent';
        });
        input.nextElementSibling.style.borderColor = 'white';
      });
    });
  },

  // ============ 关闭弹窗 ============
  closeModal() {
    App.closeModal();
  },

  // ============ 保存表单 ============
  async saveForm() {
    const form = document.getElementById('categoryForm');
    const formData = new FormData(form);

    const name = formData.get('name').trim();
    const parentId = formData.get('parentId') || null;
    const color = formData.get('color') || '#06b6d4';
    const icon = formData.get('icon') || 'default';

    if (!name) {
      App.showToast('请输入分类名称', 'error');
      return;
    }

    const existingId = formData.get('id');
    const now = new Date().toISOString();

    if (existingId) {
      // 更新
      await DataService.updateCategory(existingId, {
        name,
        color,
        icon,
        updatedAt: now
      });
      App.showToast('分类更新成功', 'success');
    } else {
      // 新增
      const categories = DataService.getCategories();
      const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.sortOrder)) : 0;
      await DataService.addCategory({
        name,
        parentId,
        color,
        icon,
        sortOrder: maxOrder + 1,
        createdAt: now,
        updatedAt: now
      });
      App.showToast('分类添加成功', 'success');
    }

    await DataService.loadCategories();
    this.closeModal();
    App.updateCategoryMenu();
    // 如果当前在器件管理相关页面，重新路由；否则刷新分类管理页
    if (window.location.hash.startsWith('#components')) {
      App.handleRoute();
    } else {
      this.renderCategories();
    }
  },

  // ============ 确认删除 ============
  confirmDelete(id, isSecondConfirm = false) {
    const category = DataService.getCategories().find(c => c.id === id);
    if (!category) return;

    const components = DataService.getComponents();
    const categories = DataService.getCategories();

    let canDelete = true;
    let titleText = '确认删除';
    let messageText = `确定要删除 "${category.name}" 吗？`;
    let hasComponentWarning = false; // 标志：是否需要级联删除警告

    if (category.parentId === null) {
      // 主分类：有子分类或有器件时禁止删除
      const subCategories = categories.filter(c => c.parentId === id);
      if (subCategories.length > 0) {
        titleText = '无法删除';
        messageText = `该主分类下有 ${subCategories.length} 个子分类，无法删除。请先删除其下所有子分类。`;
        canDelete = false;
      } else {
        const comps = components.filter(c => c.categoryId === id);
        if (comps.length > 0) {
          titleText = '无法删除';
          messageText = `该分类下有 ${comps.length} 个器件，无法删除。请先修改或删除这些器件。`;
          canDelete = false;
        }
      }
    } else {
      // 子分类：即使有器件也允许删除，但弹出两次警告
      const comps = components.filter(c => c.subCategoryId === id);
      if (comps.length > 0) {
        hasComponentWarning = true;
        if (!isSecondConfirm) {
          // 第一次确认：警告用户有器件
          titleText = '警告：该子分类包含器件';
          messageText = `该子分类下有 ${comps.length} 个器件，删除此子分类将同时删除其中所有器件，此操作不可撤销。确认要继续删除吗？`;
        } else {
          // 第二次确认：再次确认
          titleText = '再次确认删除';
          messageText = `您即将同时删除子分类 "${category.name}" 及其下 ${comps.length} 个器件，无法恢复。请再次确认是否删除？`;
        }
      }
    }

    // 根据状态决定按钮行为：有级联警告且是第一次确认 → 触发第二次确认
    const isFirstConfirmWithComponents = hasComponentWarning && !isSecondConfirm;
    const buttonText = isFirstConfirmWithComponents ? '确认继续' : '删除';
    const buttonAction = isFirstConfirmWithComponents ? `CategoriesModule.confirmDelete('${id}', true)` : `CategoriesModule.deleteCategory('${id}')`;

    App.openModal();
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal" style="max-width: 400px;">
          <div class="modal-body" style="padding: 40px 24px;">
            <div class="confirm-dialog">
              <div class="confirm-icon ${canDelete ? (isSecondConfirm ? 'danger' : 'warning') : 'warning'}">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  ${canDelete
                    ? '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
                    : '<path d="M12 2L2 22h20L12 2z"/><path d="M12 9v4M12 17v.01"/>'}
                </svg>
              </div>
              <h3 class="confirm-title">${canDelete ? titleText : '无法删除'}</h3>
              <p class="confirm-message">${messageText}</p>
              <div class="confirm-actions">
                <button class="btn btn-secondary" onclick="CategoriesModule.closeModal()">取消</button>
                ${canDelete ? `<button class="btn btn-danger" onclick="${buttonAction}">${buttonText}</button>` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ============ 删除分类 ============
  async deleteCategory(id) {
    const category = DataService.getCategories().find(c => c.id === id);

    // 级联删除：删除子分类下的器件（如果是子分类且有器件）
    let deletedComponentCount = 0;
    if (category && category.parentId !== null) {
      const components = DataService.getComponents();
      const toDelete = components.filter(c => c.subCategoryId === id);
      deletedComponentCount = toDelete.length;
      for (const comp of toDelete) {
        await DataService.deleteComponent(comp.id);
      }
    }

    // 删除分类本身
    await DataService.deleteCategory(id);

    this.closeModal();
    App.updateCategoryMenu();

    // 根据当前页面决定如何刷新
    const hash = window.location.hash || '';
    const pathParts = hash.slice(1).split('/').filter(p => p);
    const page = pathParts[0] || '';

    if (page === 'components' && category && category.parentId !== null && pathParts[1] === category.parentId) {
      // 在主分类详情页删除了该主分类下的子分类 —— 刷新当前主分类详情页
      this.renderCategoryDetail(category.parentId);
      App.showToast(deletedComponentCount > 0 ? `已删除子分类及 ${deletedComponentCount} 个器件` : '子分类已删除', 'success');
    } else {
      // 其他情况 —— 刷新分类管理页
      this.renderCategories();
      App.showToast('分类已删除', 'success');
    }
  },

  // ============ 渲染分类详情页（显示子分类和元件） ============
  renderCategoryDetail(categoryId, subCategoryId = null) {
    const categories = DataService.getCategories();
    const components = DataService.getComponents();

    const category = categories.find(c => c.id === categoryId);
    if (!category) {
      ComponentsModule.renderComponents();
      return;
    }

    const container = document.getElementById('page-container');

    if (!subCategoryId) {
      // 显示主分类详情 — 列出该主分类下的子分类
      const subCategories = categories.filter(c => c.parentId === categoryId);

      container.innerHTML = `
        <div class="page-header" style="padding-bottom: 16px;">
          <div class="breadcrumb-nav" style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 8px; flex-wrap: wrap;">
            <a href="#components" style="color: var(--accent-primary); text-decoration: none; cursor: pointer;">全部器件</a>
            <span>/</span>
            <span>${category.name}</span>
          </div>
          <h1>${category.name}</h1>
          <p>共 ${subCategories.length} 个子分类。请选择一个子分类查看其中的器件。</p>
        </div>

        ${subCategories.length === 0 ? `
          <div class="card" style="padding: 48px; text-align: center;">
            <div style="color: var(--text-muted); font-size: 1.1rem;">该主分类下还没有子分类</div>
            <button class="btn btn-primary" style="margin-top: 16px;" onclick="CategoriesModule.showFormModal(null, '${category.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              添加子分类
            </button>
          </div>
        ` : `
          <div style="margin-bottom: 20px;">
            <button class="btn btn-primary btn-sm" onclick="CategoriesModule.showFormModal(null, '${category.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              添加子分类
            </button>
          </div>
          <div class="sub-category-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;">
            ${subCategories.map(sub => {
              const count = components.filter(c => c.subCategoryId === sub.id).length;
              return `
                <a href="#components/${category.id}/${sub.id}" class="sub-category-card" style="position: relative; display: block; min-width: 0;">
                  <button class="btn btn-danger btn-sm btn-icon" style="position: absolute; top: 8px; right: 8px; z-index: 1;" onclick="event.preventDefault(); event.stopPropagation(); CategoriesModule.confirmDelete('${sub.id}')" title="删除">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/>
                    </svg>
                  </button>
                  <h3 style="font-family: var(--font-display); font-size: 1.15rem; color: var(--text-primary); margin: 0 0 16px 0; padding-right: 40px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${sub.name}</h3>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border-color);">
                    <span style="color: var(--text-secondary); font-size: 0.9rem;">包含器件</span>
                    <span style="font-family: var(--font-display); font-size: 1.4rem; color: var(--accent-primary); font-weight: 700;">${count}</span>
                  </div>
                </a>
              `;
            }).join('')}
          </div>
        `}
      `;
      return;
    }

    // 指定了子分类 — 显示该子分类下的器件
    const subCategory = categories.find(c => c.id === subCategoryId);
    if (!subCategory) {
      CategoriesModule.renderCategoryDetail(categoryId);
      return;
    }

    ComponentsModule.renderComponents(categoryId, '', 'card', subCategoryId, category, subCategory);
  }
};
