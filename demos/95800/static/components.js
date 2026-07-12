/**
 * 器件管理模块 - 支持主分类与子分类过滤
 */
const ComponentsModule = {
  currentView: localStorage.getItem('components_view_preference') || 'card',
  currentPage: 1,
  itemsPerPage: 12,
  searchTerm: '',
  filterCategory: '',
  filterSubCategory: '',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  selectedItems: new Set(),
  batchMode: false,
  _restoreSearchFocus: false,

  // 数量辅助：格式化显示（带单位）
  // component/itemType=component -> "17 个"，itemType=wire -> "17.01 m"
  formatQuantity(component) {
    if (!component) return '0';
    const qty = Number(component.quantity) ?? 0;
    const itemType = component.itemType || 'component';
    if (itemType === 'wire') {
      // 保留最多 2 位小数，去掉末尾 0
      const fixed = Number(qty.toFixed(2));
      return `${fixed} m`;
    }
    return `${Math.round(qty)} 个`;
  },

  renderComponents(filterCategory = '', searchTerm = null, view = null, filterSubCategory = '', categoryObj = null, subCategoryObj = null) {
    // 关键修复：无参调用时使用当前存储的视图偏好，而不是硬编码 card
    if (view === null) view = this.currentView;
    if (searchTerm === null) searchTerm = this.searchTerm;
    // 同步模块内部状态
    this.currentView = view;
    this.searchTerm = searchTerm;
    this.filterCategory = filterCategory;
    this.filterSubCategory = filterSubCategory;
    // 确保 localStorage 一致
    localStorage.setItem('components_view_preference', view);

    let components = DataService.getComponents();
    const categories = DataService.getCategories();

    // 搜索过滤 — 不区分大小写，匹配名字、描述、位置、参数名、参数值
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      components = components.filter(c => {
        if (String(c.name).toLowerCase().includes(term)) return true;
        if (c.description && String(c.description).toLowerCase().includes(term)) return true;
        if (c.location && String(c.location).toLowerCase().includes(term)) return true;
        // 匹配主参数：键和值
        if (c.mainParams) {
          for (const [k, v] of Object.entries(c.mainParams)) {
            if (String(k).toLowerCase().includes(term)) return true;
            if (String(v).toLowerCase().includes(term)) return true;
          }
        }
        // 匹配次要参数：键和值
        if (c.subParams) {
          for (const [k, v] of Object.entries(c.subParams)) {
            if (String(k).toLowerCase().includes(term)) return true;
            if (String(v).toLowerCase().includes(term)) return true;
          }
        }
        return false;
      });
    }

    // 分类过滤 — 只按 subCategoryId 过滤最精确的
    if (filterSubCategory) {
      components = components.filter(c => c.subCategoryId === filterSubCategory);
    } else if (filterCategory) {
      // 只有主分类时 — 仍按主分类过滤（给管理界面查看使用）
      components = components.filter(c => c.categoryId === filterCategory);
    }

    // 排序
    components.sort((a, b) => {
      let valA = a[this.sortBy];
      let valB = b[this.sortBy];
      if (this.sortOrder === 'desc') {
        [valA, valB] = [valB, valA];
      }
      if (typeof valA === 'string') {
        return valA.localeCompare(valB);
      }
      return valA - valB;
    });

    // 分页
    const totalPages = Math.ceil(components.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const paginatedComponents = components.slice(startIndex, startIndex + this.itemsPerPage);

    const container = document.getElementById('page-container');
    const categoriesMap = {};
    categories.forEach(c => categoriesMap[c.id] = c);

    // 页面标题 — 根据过滤状态构建
    let pageTitle = '全部器件';
    let breadcrumbHtml = '';

    if (subCategoryObj && categoryObj) {
      pageTitle = subCategoryObj.name;
      breadcrumbHtml = `
        <div style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 8px;">
          <a href="#components" style="color: var(--accent-primary); text-decoration: none; cursor: pointer;">全部器件</a>
          <span>/</span>
          <a href="#components/${categoryObj.id}" style="color: var(--accent-primary); text-decoration: none; cursor: pointer;">${categoryObj.name}</a>
          <span>/</span>
          <span>${subCategoryObj.name}</span>
        </div>
      `;
    } else if (categoryObj) {
      pageTitle = categoryObj.name;
      breadcrumbHtml = `
        <div style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 8px;">
          <a href="#components" style="color: var(--accent-primary); text-decoration: none; cursor: pointer;">全部器件</a>
          <span>/</span>
          <span>${categoryObj.name}</span>
        </div>
      `;
    }

    if (view === 'card') {
      container.innerHTML = this.renderCardView(paginatedComponents, categoriesMap, totalPages, pageTitle, breadcrumbHtml);
    } else {
      container.innerHTML = this.renderTableView(paginatedComponents, categoriesMap, totalPages, pageTitle, breadcrumbHtml);
    }

    this._searchDebounceTimer = null;
    this.bindListEvents();
  },

  // 卡片视图
  renderCardView(components, categoriesMap, totalPages, pageTitle, breadcrumbHtml = '') {
    if (components.length === 0 && !this.searchTerm && !this.filterCategory && !this.filterSubCategory) {
      return `
        <div class="page-header">
          <h1>${pageTitle}</h1>
          <p>管理您的电子元器件库存</p>
        </div>
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h3 class="empty-state-title">暂无器件</h3>
          <p class="empty-state-description">点击下方按钮添加您的第一个元器件</p>
          <button class="btn btn-primary" onclick="ComponentsModule.showFormModal(null, ComponentsModule.filterCategory, ComponentsModule.filterSubCategory)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            添加器件
          </button>
        </div>
      `;
    }

    const cardsHtml = components.map(c => {
      const cat = categoriesMap[c.categoryId];
      const subCat = c.subCategoryId ? categoriesMap[c.subCategoryId] : null;
      const mainParams = Object.entries(c.mainParams || {}).slice(0, 4);
      const isOutOfStock = Number(c.quantity) <= 0;
      const threshold = c.warningThreshold ?? 0;
      const isLowStock = threshold > 0 && Number(c.quantity) > 0 && Number(c.quantity) <= Number(threshold);

      const categoryLabel = subCat ? `${cat?.name || ''} · ${subCat.name}` : (cat?.name || '无分类');
      const categoryColor = cat?.color || '#64748b';

      return `
        <div class="component-card ${isOutOfStock ? 'stock-zero' : ''}" data-id="${c.id}" onclick="ComponentsModule.showDetail('${c.id}')" style="cursor: pointer;" title="点击查看详情">
          <div class="component-card-image">
            ${c.imageUrls && c.imageUrls[0]
              ? `<img src="${c.imageUrls[0]}" alt="${c.name}" style="object-position: center ${c.imagePosition ?? 50}%;">`
              : `<svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="4" y="4" width="16" height="16" rx="2"/>
                  <path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01"/>
                </svg>`
            }
          </div>
          <div class="component-card-body">
            <div class="component-card-category">
              <span class="badge" style="background: ${categoryColor}20; color: ${categoryColor};">${categoryLabel}</span>
            </div>
            <h3 class="component-card-name">${c.name}</h3>
            <div class="component-card-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              ${c.location}
            </div>
            <div class="component-card-params">
              ${mainParams.map(([key, val]) => `<span class="component-card-param">${key}: ${val}</span>`).join('')}
            </div>
            <div class="component-card-footer">
              <span class="component-card-price">¥${DataService.formatPrice(c.price)}</span>
              <span class="component-card-stock ${isOutOfStock ? 'out-of-stock' : ''} ${isLowStock ? 'low' : ''}">库存: ${ComponentsModule.formatQuantity(c)}</span>
            </div>
            <div class="component-card-actions">
              <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); ComponentsModule.addToImportCart('${c.id}')" title="入库">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                入库
              </button>
              <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); ComponentsModule.addToExportCart('${c.id}')" title="出库" ${isOutOfStock ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 16l4-4-4-4M4 12h16"/>
                </svg>
                出库
              </button>
              <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); ComponentsModule.confirmDelete('${c.id}')" title="删除">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                删除
              </button>
              <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); ComponentsModule.showDetail('${c.id}')" title="详情">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                详细
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="page-header">
        ${breadcrumbHtml}
        <h1>${pageTitle}</h1>
        <p>管理您的电子元器件库存</p>
      </div>

      <div class="toolbar">
        <div class="toolbar-left">
          <div class="search-bar" style="flex: 1; max-width: 400px; margin: 0;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" id="searchInput" placeholder="搜索器件名称、描述、位置或参数..." value="${this.searchTerm}">
          </div>
        </div>
        <div class="toolbar-right">
          <div class="view-toggle">
            <button class="view-toggle-btn ${this.currentView === 'card' ? 'active' : ''}" data-view="card">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button class="view-toggle-btn ${this.currentView === 'table' ? 'active' : ''}" data-view="table">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h18v18H3z"/>
                <path d="M3 9h18"/>
                <path d="M3 15h18"/>
                <path d="M9 3v18"/>
              </svg>
            </button>
          </div>
          <button class="btn btn-primary" onclick="ComponentsModule.showFormModal(null, ComponentsModule.filterCategory, ComponentsModule.filterSubCategory)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            添加器件
          </button>
        </div>
      </div>

      <div class="cards-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
        ${cardsHtml || '<div style="color: var(--text-muted); padding: 40px; text-align: center;">暂无器件</div>'}
      </div>

      ${totalPages > 1 ? this.renderPagination(totalPages) : ''}
    `;
  },

  // 表格视图
  renderTableView(components, categoriesMap, totalPages, pageTitle, breadcrumbHtml = '') {
    if (components.length === 0) {
      return this.renderCardView([], categoriesMap, totalPages, pageTitle, breadcrumbHtml);
    }

    return `
      <div class="page-header">
        ${breadcrumbHtml}
        <h1>${pageTitle}</h1>
        <p>管理您的电子元器件库存</p>
      </div>

      <div class="toolbar">
        <div class="toolbar-left">
          <div class="search-bar" style="flex: 1; max-width: 400px; margin: 0;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" id="searchInput" placeholder="搜索器件名称、描述、位置或参数..." value="${this.searchTerm}">
          </div>
        </div>
        <div class="toolbar-right">
          <div class="view-toggle">
            <button class="view-toggle-btn ${this.currentView === 'card' ? 'active' : ''}" data-view="card">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button class="view-toggle-btn ${this.currentView === 'table' ? 'active' : ''}" data-view="table">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h18v18H3z"/>
                <path d="M3 9h18"/>
                <path d="M3 15h18"/>
                <path d="M9 3v18"/>
              </svg>
            </button>
          </div>
          <button class="btn btn-primary" onclick="ComponentsModule.showFormModal(null, ComponentsModule.filterCategory, ComponentsModule.filterSubCategory)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            添加器件
          </button>
        </div>
      </div>

      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>名称</th>
              <th>分类</th>
              <th>位置</th>
              <th>价格</th>
              <th>库存</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${components.map(c => {
              const cat = categoriesMap[c.categoryId];
              const subCat = c.subCategoryId ? categoriesMap[c.subCategoryId] : null;
              const label = subCat ? `${cat?.name || ''} · ${subCat.name}` : (cat?.name || '无分类');
              const color = cat?.color || '#64748b';
              const isOutOfStock = Number(c.quantity) <= 0;
              const threshold = Number(c.warningThreshold ?? 0);
              const isLowStock = threshold > 0 && Number(c.quantity) > 0 && Number(c.quantity) <= threshold;
              return `
                <tr class="${isOutOfStock ? 'stock-zero' : ''}">
                  <td><strong>${c.name}</strong></td>
                  <td><span class="badge" style="background: ${color}20; color: ${color};">${label}</span></td>
                  <td>${c.location}</td>
                  <td style="color: var(--accent-secondary);">¥${DataService.formatPrice(c.price)}</td>
                  <td class="${isOutOfStock ? 'out-of-stock' : ''} ${isLowStock ? 'low' : ''}" style="${isOutOfStock || isLowStock ? 'color: var(--accent-danger);' : ''}">${ComponentsModule.formatQuantity(c)}</td>
                  <td>
                    <div style="display: flex; gap: 4px;">
                      <button class="btn btn-primary btn-sm btn-icon" onclick="ComponentsModule.addToImportCart('${c.id}')" title="入库">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                      </button>
                      <button class="btn btn-secondary btn-sm btn-icon" onclick="ComponentsModule.addToExportCart('${c.id}')" title="出库" ${isOutOfStock ? 'disabled' : ''}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M16 16l4-4-4-4M4 12h16"/>
                        </svg>
                      </button>
                      <button class="btn btn-secondary btn-sm" onclick="ComponentsModule.showDetail('${c.id}')" title="详情">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 16v-4M12 8h.01"/>
                        </svg>
                        详细
                      </button>
                      <button class="btn btn-danger btn-sm" onclick="ComponentsModule.confirmDelete('${c.id}')" title="删除">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      ${totalPages > 1 ? this.renderPagination(totalPages) : ''}
    `;
  },

  // 分页
  renderPagination(totalPages) {
    let pagesHtml = '';
    for (let i = 1; i <= totalPages; i++) {
      pagesHtml += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" onclick="ComponentsModule.goToPage(${i})">${i}</button>`;
    }

    return `
      <div class="pagination">
        <button class="pagination-btn" onclick="ComponentsModule.goToPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        ${pagesHtml}
        <button class="pagination-btn" onclick="ComponentsModule.goToPage(${this.currentPage + 1})" ${this.currentPage === totalPages ? 'disabled' : ''}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
    `;
  },

  // 绑定列表事件
  bindListEvents() {
    const self = this;
    const searchInput = document.getElementById('searchInput');
    const viewBtns = document.querySelectorAll('.view-toggle-btn');

    if (searchInput) {
      // 如果刚因为搜索触发了重渲染，恢复焦点和光标位置
      if (self._restoreSearchFocus) {
        searchInput.focus();
        try {
          const len = searchInput.value.length;
          searchInput.setSelectionRange(len, len);
        } catch (err) {
          // 忽略 setSelectionRange 不支持的情况
        }
        self._restoreSearchFocus = false;
      }

      // 防抖：使用设置中的防抖时间（默认 300ms），避免逐字重绘导致闪烁
      searchInput.addEventListener('input', (e) => {
        self.searchTerm = e.target.value;
        self.currentPage = 1;
        self._restoreSearchFocus = true;

        if (self._searchDebounceTimer) {
          clearTimeout(self._searchDebounceTimer);
        }
        const settings = DataService.getSettings();
        const debounceMs = Math.max(50, Math.min(2000, parseInt(settings.searchDebounce) || 300));
        self._searchDebounceTimer = setTimeout(() => {
          self._searchDebounceTimer = null;
          self.renderComponents(self.filterCategory, self.searchTerm, self.currentView, self.filterSubCategory);
        }, debounceMs);
      });
    }

    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        self.currentView = btn.dataset.view;
        localStorage.setItem('components_view_preference', self.currentView);
        self._restoreSearchFocus = !!self.searchTerm;
        self.renderComponents(self.filterCategory, self.searchTerm, self.currentView, self.filterSubCategory);
      });
    });
  },

  // 分页跳转
  goToPage(page) {
    this.currentPage = page;
    this._restoreSearchFocus = !!this.searchTerm;
    this.renderComponents(this.filterCategory, this.searchTerm, this.currentView, this.filterSubCategory);
  },

  // 添加到入库车
  async addToImportCart(id) {
    const components = DataService.getComponents();
    const component = components.find(c => c.id === id);
    const cart = DataService.getImportCart();
    const existing = cart.find(item => item.id === id);
    const isWire = component && component.itemType === 'wire';
    const addQty = isWire ? 1 : 1;

    if (existing) {
      existing.quantity = Number(existing.quantity) + addQty;
    } else {
      cart.push({ id, quantity: addQty });
    }

    await DataService.saveImportCart(cart);
    App.updateCartBadges();
    App.showToast('已添加到入库车', 'success');
  },

  // 添加到出库车
  async addToExportCart(id) {
    const component = DataService.getComponents().find(c => c.id === id);
    if (!component || Number(component.quantity) <= 0) {
      App.showToast('库存不足，无法出库', 'error');
      return;
    }

    const cart = DataService.getExportCart();
    const existing = cart.find(item => item.id === id);
    const isWire = component.itemType === 'wire';
    const currentQty = component ? Number(component.quantity) : 0;

    if (existing) {
      const newQty = Number(existing.quantity) + 1;
      if (newQty > currentQty) {
        App.showToast('出库数量已达库存上限', 'warning');
        return;
      }
      existing.quantity = newQty;
    } else {
      cart.push({ id, quantity: Math.min(1, currentQty) });
    }

    await DataService.saveExportCart(cart);
    App.updateCartBadges();
    App.showToast('已添加到出库车', 'success');
  },

  // 显示详情页
  showDetail(id) {
    const component = DataService.getComponents().find(c => c.id === id);
    if (!component) return;

    const categories = DataService.getCategories();
    const category = categories.find(c => c.id === component.categoryId);
    const subCategory = component.subCategoryId ? categories.find(c => c.id === component.subCategoryId) : null;
    const isOutOfStock = Number(component.quantity) <= 0;
    const threshold = component.warningThreshold ?? 0;
    const isLowStock = threshold > 0 && Number(component.quantity) > 0 && Number(component.quantity) <= Number(threshold);
    const unitForDetail = component.itemType === 'wire' ? 'm' : '个';

    const categoryLabel = subCategory ? `${category?.name || ''} · ${subCategory.name}` : (category?.name || '无分类');
    const categoryColor = category?.color || '#64748b';

    const container = document.getElementById('page-container');
    container.innerHTML = `
      <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 8px;">
            <a href="#components" style="color: var(--accent-primary); text-decoration: none; cursor: pointer;">全部器件</a>
            ${category ? `<span>/</span><a href="#components/${category.id}" style="color: var(--accent-primary); text-decoration: none; cursor: pointer;">${category.name}</a>` : ''}
            ${subCategory ? `<span>/</span><span>${subCategory.name}</span>` : ''}
          </div>
          <h1>${component.name}</h1>
          <p>查看器件详细信息</p>
        </div>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" onclick="ComponentsModule.renderComponents()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            返回列表
          </button>
          <button class="btn btn-primary" onclick="ComponentsModule.showFormModal('${component.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            编辑
          </button>
        </div>
      </div>

      <div class="detail-header">
        <div class="detail-image" style="position: relative;">
          ${component.imageUrls && component.imageUrls[0]
            ? `
              <img src="${component.imageUrls[0]}" alt="${component.name}" style="object-position: center ${component.imagePosition ?? 50}%;">
              ${component.imageUrls.length > 0 ? `
                <button class="btn btn-secondary btn-sm" style="position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.65); color: white; border-color: transparent;" onclick="ComponentsModule.showCoverEditor('${component.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  设置封面
                </button>
              ` : ''}
            `
            : `<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="opacity: 0.3;">
                <rect x="4" y="4" width="16" height="16" rx="2"/>
                <path d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01"/>
              </svg>`
          }
        </div>
        <div class="detail-info">
          <div class="detail-category">
            <span class="badge" style="background: ${categoryColor}20; color: ${categoryColor}; font-size: 0.9rem; padding: 6px 14px;">${categoryLabel}</span>
          </div>
          <h2 class="detail-title">${component.name}</h2>
          <p style="color: var(--text-secondary); margin-bottom: 16px;">${component.description}</p>

          <div class="detail-meta">
            <div class="detail-meta-item">
              <span class="detail-meta-label">存放位置</span>
              <span class="detail-meta-value">${component.location}</span>
            </div>
            <div class="detail-meta-item">
              <span class="detail-meta-label">库存数量</span>
              <span class="detail-meta-value ${isOutOfStock ? 'out-of-stock' : ''}">${ComponentsModule.formatQuantity(component)}</span>
            </div>
            ${threshold > 0 ? `
            <div class="detail-meta-item">
              <span class="detail-meta-label">预警阈值</span>
              <span class="detail-meta-value">≤ ${Number(threshold)} ${unitForDetail} 时预警${isLowStock ? ' ⚠' : ''}</span>
            </div>
            ` : ''}
            <div class="detail-meta-item">
              <span class="detail-meta-label">单价</span>
              <span class="detail-price">¥${DataService.formatPrice(component.price)}</span>
            </div>
            <div class="detail-meta-item">
              <span class="detail-meta-label">总价值</span>
              <span class="detail-meta-value">¥${DataService.formatPrice(component.price * component.quantity)}</span>
            </div>
          </div>

          <div style="display: flex; gap: 12px; margin-top: 20px;">
            <button class="btn btn-primary" onclick="ComponentsModule.addToImportCart('${component.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              入库
            </button>
            <button class="btn btn-secondary" onclick="ComponentsModule.addToExportCart('${component.id}')" ${isOutOfStock ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 16l4-4-4-4M4 12h16"/>
              </svg>
              出库
            </button>
            <button class="btn btn-danger" onclick="ComponentsModule.confirmDelete('${component.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              删除
            </button>
          </div>
        </div>
      </div>

      <div class="params-section">
        <h3 style="font-family: var(--font-display); margin-bottom: 20px; font-size: 1.1rem;">主参数</h3>
        <div class="params-main">
          ${Object.entries(component.mainParams || {}).map(([key, value]) => `
            <div class="param-card">
              <div class="param-key">${key}</div>
              <div class="param-value">${value}</div>
            </div>
          `).join('')}
        </div>

        ${Object.keys(component.subParams || {}).length > 0 ? `
          <div class="params-extra">
            <div class="params-extra-header" onclick="ComponentsModule.toggleParamsExtra(this)">
              <span class="params-extra-title">次要参数</span>
              <svg class="params-extra-toggle" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
            <div class="params-extra-content">
              <div class="params-grid">
                ${Object.entries(component.subParams || {}).map(([key, value]) => `
                  <div class="param-row">
                    <span class="param-row-key">${key}</span>
                    <span class="param-row-value">${value}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        ` : ''}
      </div>

      ${component.imageUrls && component.imageUrls.length > 0 ? `
        <div style="margin-top: 32px;">
          <h3 style="font-family: var(--font-display); margin-bottom: 16px; font-size: 1.1rem;">实物图</h3>
          <div class="image-gallery">
            ${component.imageUrls.map((url, i) => `
              <div class="gallery-image" onclick="ComponentsModule.previewImage('${url}')">
                <img src="${url}" alt="实物图 ${i + 1}">
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${component.datasheetUrls && component.datasheetUrls.length > 0 ? `
        <div style="margin-top: 32px;">
          <h3 style="font-family: var(--font-display); margin-bottom: 16px; font-size: 1.1rem;">数据手册及其他附件</h3>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${component.datasheetUrls.map(item => {
              const parts = item.split('|');
              const displayName = parts.length > 1 ? parts[0] : (item.split('/').pop() || '附件');
              const actualUrl = parts.length > 1 ? parts[1] : item;
              return `
              <a href="${actualUrl}" target="_blank" rel="noopener noreferrer" class="data-sheet-item">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="1.8" style="flex-shrink: 0;">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <line x1="10" y1="9" x2="8" y2="9"/>
                </svg>
                <span style="font-size: 0.95rem; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${displayName}
                </span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M7 17L17 7"/>
                  <polyline points="7 7 17 7 17 17"/>
                </svg>
              </a>
            `}).join('')}
          </div>
        </div>
      ` : ''}

      ${(component.attachmentUrls || component.pinDiagramUrls || []).length > 0 ? `
        <div style="margin-top: 32px;">
          <h3 style="font-family: var(--font-display); margin-bottom: 16px; font-size: 1.1rem;">附图</h3>
          <div class="image-gallery">
            ${(component.attachmentUrls || component.pinDiagramUrls || []).map((url, i) => `
              <div class="gallery-image" onclick="ComponentsModule.previewImage('${url}')">
                <img src="${url}" alt="附图 ${i + 1}">
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;

    window.scrollTo(0, 0);
  },

  // 展开/折叠次要参数
  toggleParamsExtra(header) {
    const toggle = header.querySelector('.params-extra-toggle');
    const content = header.nextElementSibling;
    toggle.classList.toggle('expanded');
    content.classList.toggle('expanded');
  },

  // 图片预览
  previewImage(url) {
    const modal = document.createElement('div');
    modal.className = 'image-preview-modal active';
    modal.innerHTML = `
      <button class="image-preview-close" onclick="this.parentElement.remove()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
      <img src="${url}" alt="预览">
    `;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    document.body.appendChild(modal);
  },

  // 显示表单弹窗 — 支持主分类+子分类联动
  showFormModal(id = null, presetCategoryId = null, presetSubCategoryId = null) {
    const component = id ? DataService.getComponents().find(c => c.id === id) : null;
    const categories = DataService.getCategories();
    const isEdit = !!component;

    const rootCategories = categories.filter(c => !c.parentId);

    // 决定表单预填值
    const currentCategoryId = presetCategoryId || (component ? component.categoryId : '') || '';
    const currentSubCategoryId = presetSubCategoryId || (component ? component.subCategoryId : '') || '';
    const currentItemType = (component && component.itemType) || 'component'; // component=器件, wire=导线

    App.openModal();
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal component-form-modal" style="max-width: 700px;">
          <div class="modal-header">
            <h2 class="modal-title">${isEdit ? '编辑器件' : '添加器件'}</h2>
            <button class="modal-close" onclick="ComponentsModule.closeModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <form id="componentForm" onsubmit="return false;" onkeydown="App.handleFormKeyDown(event, 'ComponentsModule.saveForm')">
              <input type="hidden" name="id" value="${component?.id || ''}">

              <div class="form-group">
                <label class="form-label">器件名称 *</label>
                <input type="text" class="form-input" name="name" value="${component?.name || ''}" required placeholder="例如：STM32F103C8T6">
              </div>

              <!-- 分类选择 — 主分类 + 子分类联动 -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">分类（不选代表无分类）</label>
                  <select class="form-select" name="categoryId" id="categorySelect" onchange="ComponentsModule.onCategoryChange()">
                    <option value="">无分类</option>
                    ${rootCategories.map(c => `<option value="${c.id}" ${currentCategoryId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">子分类</label>
                  <select class="form-select" name="subCategoryId" id="subCategorySelect">
                    <option value="">请先选择主分类</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">存放位置 *</label>
                  <input type="text" class="form-input" name="location" value="${component?.location || ''}" required placeholder="例如：A-01-02">
                </div>
              </div>

              <!-- 器件模型选择（器件 / 导线） -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">器件模型 *</label>
                  <select class="form-select" name="itemType" id="itemTypeSelect" onchange="ComponentsModule.onItemTypeChange()">
                    <option value="component" ${currentItemType === 'component' ? 'selected' : ''}>器件（按个计数，整数）</option>
                    <option value="wire" ${currentItemType === 'wire' ? 'selected' : ''}>导线（按米计数，支持小数）</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">单价 (元) *</label>
                  <input type="number" step="0.0001" min="0" class="form-input" name="price" value="${component?.price || ''}" required placeholder="0.0000">
                </div>
                <div class="form-group">
                  <label class="form-label">${isEdit ? '当前库存' : '初始库存'} (<span id="itemUnitLabel">${currentItemType === 'wire' ? 'm' : '个'}</span>) *</label>
                  <input type="number" min="0" step="${currentItemType === 'wire' ? 0.01 : 1}" class="form-input" name="quantity" id="quantityInput" value="${component?.quantity ?? 0}" required placeholder="0" ${isEdit ? 'readonly style="background: var(--bg-tertiary);"' : ''}>
                  ${isEdit ? '<div class="form-help">库存请通过入库/出库功能修改</div>' : ''}
                </div>

                <div class="form-group">
                  <label class="form-label">库存预警阈值 (<span id="thresholdUnitLabel">${currentItemType === 'wire' ? 'm' : '个'}</span>)</label>
                  <input type="number" min="0" step="${currentItemType === 'wire' ? 0.01 : 1}" class="form-input" name="warningThreshold" id="thresholdInput" value="${component?.warningThreshold ?? 0}" placeholder="0">
                  <div class="form-help">设为 0 则不预警，库存为 0 才提示缺货；设为 > 0 时，库存 ≤ 该值即触发预警</div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">描述</label>
                <textarea class="form-textarea" name="description" rows="3" placeholder="器件的详细描述...">${component?.description || ''}</textarea>
              </div>

              <div class="form-group">
                <label class="form-label">主参数 (每行一个，格式：名称:值)</label>
                <textarea class="form-textarea" name="mainParams" rows="4" placeholder="封装: LQFP-48
内核: Cortex-M3
主频: 72MHz">${component?.mainParams ? Object.entries(component.mainParams).map(([k, v]) => `${k}: ${v}`).join('\n') : ''}</textarea>
                <div class="form-help">主参数将在列表中优先显示</div>
              </div>

              <div class="form-group">
                <label class="form-label">次要参数 (每行一个，格式：名称:值)</label>
                <textarea class="form-textarea" name="subParams" rows="4" placeholder="RAM: 20KB
电压: 2.0-3.6V
ADC: 2x12位">${component?.subParams ? Object.entries(component.subParams).map(([k, v]) => `${k}: ${v}`).join('\n') : ''}</textarea>
                <div class="form-help">次要参数需在详情页展开查看</div>
              </div>

              <div class="form-group">
                <label class="form-label">实物图 URL</label>
                <input type="text" class="form-input" name="imageUrl" id="imageUrlInput" value="${component?.imageUrls?.[0] || ''}" placeholder="https://example.com/image.jpg">
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
                  <span style="color: var(--text-secondary); font-size: 0.85rem;">或上传本地图片：</span>
                  <input type="file" id="imageFileInput" accept="image/*" style="color: var(--text-secondary); font-size: 0.85rem;">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">数据手册及其他附件 URL (每行一个)</label>
                <textarea class="form-textarea" name="datasheetUrls" id="datasheetUrlsInput" rows="3" placeholder="https://example.com/datasheet1.pdf
https://example.com/datasheet2.pdf
自定义名称|https://example.com/abc123.pdf">${(component?.datasheetUrls || []).join('\n')}</textarea>
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
                  <span style="color: var(--text-secondary); font-size: 0.85rem;">或上传本地文件（可多选）：</span>
                  <input type="file" id="datasheetFileInput" multiple style="color: var(--text-secondary); font-size: 0.85rem;">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">附图 URL (每行一个)</label>
                <textarea class="form-textarea" name="attachmentUrls" id="attachmentUrlsInput" rows="3" placeholder="https://example.com/image1.jpg
https://example.com/image2.jpg">${(component?.pinDiagramUrls || component?.attachmentUrls || []).join('\n')}</textarea>
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
                  <span style="color: var(--text-secondary); font-size: 0.85rem;">或上传本地图片（可多选）：</span>
                  <input type="file" id="attachmentFileInput" accept="image/*" multiple style="color: var(--text-secondary); font-size: 0.85rem;">
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="ComponentsModule.closeModal()">取消</button>
            <button class="btn btn-primary" onclick="ComponentsModule.saveForm()">
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

    // 初始化子分类下拉
    this.onCategoryChange(currentSubCategoryId);

    // 文件上传：上传到后端服务器
    const bindFileUpload = (fileInputId, urlInputId, uploadType) => {
      const fileInput = document.getElementById(fileInputId);
      const urlInput = document.getElementById(urlInputId);
      if (!fileInput || !urlInput) return;

      fileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        // 创建进度条容器
        let progressContainer = document.getElementById('uploadProgress');
        if (!progressContainer) {
          progressContainer = document.createElement('div');
          progressContainer.id = 'uploadProgress';
          progressContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; min-width: 300px; z-index: 10000; box-shadow: var(--shadow-lg);';
          document.body.appendChild(progressContainer);
        }

        const existingUrls = urlInput.value.trim();
        const urls = existingUrls ? existingUrls.split('\n').filter(u => u.trim()) : [];

        const totalFiles = files.length;
        const totalSize = files.reduce((sum, f) => sum + f.size, 0);

        const formatSize = (bytes) => {
          if (bytes < 1024) return bytes + ' B';
          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
          return (bytes / 1024 / 1024).toFixed(2) + ' MB';
        };

        const updateProgress = (fileIndex, fileName, percent) => {
          progressContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: var(--text-primary); font-weight: 500;">上传中...</span>
              <span style="color: var(--text-secondary);">${fileIndex}/${totalFiles}</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${fileName}</div>
            <div style="background: var(--bg-tertiary); border-radius: 4px; height: 8px; overflow: hidden; margin-bottom: 4px;">
              <div style="background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); height: 100%; width: ${percent}%; transition: width 0.2s;"></div>
            </div>
          `;
        };

        const showSuccess = () => {
          progressContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; color: var(--accent-primary);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span style="font-weight: 500;">上传完成</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;">
              已上传 ${totalFiles} 个文件 (${formatSize(totalSize)})
            </div>
          `;
          setTimeout(() => progressContainer.remove(), 2000);
        };

        const showError = (message) => {
          progressContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; color: #dc3545;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span style="font-weight: 500;">上传失败</span>
            </div>
            <div style="font-size: 0.85rem; color: #dc3545; margin-top: 8px;">${message}</div>
          `;
          setTimeout(() => progressContainer.remove(), 5000);
        };

        // 上传文件到后端
        let uploadFailed = false;
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          updateProgress(i + 1, file.name, 0);

          const formData = new FormData();
          formData.append('file', file);

          try {
            const response = await fetch(`/api/upload/${uploadType}`, {
              method: 'POST',
              body: formData
            });

            if (response.ok) {
              const result = await response.json();
              urls.push(result.url);
              updateProgress(i + 1, file.name, 100);
            } else {
              const errorData = await response.json();
              showError(errorData.error || '上传失败');
              uploadFailed = true;
              break; // 停止继续上传
            }
          } catch (err) {
            App.showToast(`上传失败: ${err.message}`, 'error');
            uploadFailed = true;
            break;
          }
        }

        // 只有上传成功时才更新输入框
        if (!uploadFailed) {
          urlInput.value = urls.join('\n');
          fileInput.value = '';
          showSuccess();
        }
      });
    };

    bindFileUpload('imageFileInput', 'imageUrlInput', 'image');
    bindFileUpload('datasheetFileInput', 'datasheetUrlsInput', 'datasheet');
    bindFileUpload('attachmentFileInput', 'attachmentUrlsInput', 'image');
  },

  // 主分类切换 — 同步更新子分类下拉
  onCategoryChange(selectedSubId = null) {
    const catSelect = document.getElementById('categorySelect');
    const subSelect = document.getElementById('subCategorySelect');
    if (!catSelect || !subSelect) return;

    const catId = catSelect.value;
    const categories = DataService.getCategories();

    if (!catId) {
      subSelect.innerHTML = '<option value="">请先选择主分类</option>';
      return;
    }

    const subs = categories.filter(c => c.parentId === catId);
    if (subs.length === 0) {
      subSelect.innerHTML = `<option value="">该主分类下暂无子分类</option>`;
      return;
    }

    const currentSub = selectedSubId || subSelect.dataset.current || '';
    subSelect.innerHTML = `
      <option value="">（请选择子分类）</option>
      ${subs.map(s => `<option value="${s.id}" ${currentSub === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
    `;
    subSelect.dataset.current = '';
  },

  // 切换器件/导线模型时：动态调整单位标签与输入 step
  onItemTypeChange() {
    const sel = document.getElementById('itemTypeSelect');
    const qtyInput = document.getElementById('quantityInput');
    const thInput = document.getElementById('thresholdInput');
    const unitLabels = [document.getElementById('itemUnitLabel'), document.getElementById('thresholdUnitLabel')];
    if (!sel) return;
    const isWire = sel.value === 'wire';
    const unit = isWire ? 'm' : '个';
    const step = isWire ? 0.01 : 1;
    if (qtyInput) { qtyInput.step = step; }
    if (thInput) { thInput.step = step; }
    unitLabels.forEach(el => { if (el) el.textContent = unit; });
  },

  // 关闭弹窗
  closeModal() {
    App.closeModal();
  },

  // 封面选取编辑器
  showCoverEditor(id) {
    const component = DataService.getComponents().find(c => c.id === id);
    if (!component || !component.imageUrls || !component.imageUrls[0]) return;

    const imageUrl = component.imageUrls[0];
    // 初始垂直偏移，默认 50
    const initialPosition = component.imagePosition ?? 50;

    const modal = document.getElementById('modal-container');
    App.openModal();
    modal.innerHTML = `
      <div class="modal-overlay active" id="coverEditorOverlay">
        <div class="modal" style="max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column;">
          <div class="modal-header">
            <h2 class="modal-title">设置封面</h2>
            <button class="modal-close" onclick="ComponentsModule.closeModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="modal-body" style="flex: 1; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px;">
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 12px;">拖动取景框调整封面显示区域</p>
            <div id="coverEditorContainer" style="position: relative; display: inline-block; max-width: 100%; max-height: 60vh; overflow: hidden; border: 2px solid var(--accent-primary); border-radius: 8px; cursor: ns-resize; user-select: none;">
              <img src="${imageUrl}" alt="封面图片" id="coverEditorImage" style="display: block; max-width: 100%; max-height: 60vh; object-fit: contain;">
              <div id="coverFrame" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; border: 3px solid rgba(255,255,255,0.85); box-shadow: 0 0 0 9999px rgba(0,0,0,0.55); pointer-events: none;"></div>
            </div>
            <div style="margin-top: 12px; display: flex; align-items: center; gap: 12px;">
              <span style="color: var(--text-secondary); font-size: 0.85rem;">垂直位置：</span>
              <input type="range" id="coverPositionSlider" min="0" max="100" value="${initialPosition}" style="width: 200px;">
              <span id="coverPositionValue" style="color: var(--accent-primary); font-weight: 600; min-width: 40px;">${initialPosition}%</span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="ComponentsModule.closeModal()">取消</button>
            <button class="btn btn-primary" id="coverSaveBtn">保存封面</button>
          </div>
        </div>
      </div>
    `;

    const container = document.getElementById('coverEditorContainer');
    const frame = document.getElementById('coverFrame');
    const slider = document.getElementById('coverPositionSlider');
    const valueDisplay = document.getElementById('coverPositionValue');
    const saveBtn = document.getElementById('coverSaveBtn');

    // 根据百分比设置取景框高度（显示中间 60% 区域）
    const frameHeightPercent = 60;
    const maxOffset = 100 - frameHeightPercent;
    const frameTop = (initialPosition / 100) * maxOffset;
    frame.style.height = `${frameHeightPercent}%`;
    frame.style.top = `${frameTop}%`;
    frame.style.left = '0';
    frame.style.right = '0';

    let currentPosition = initialPosition;

    const updateFrame = (pos) => {
      currentPosition = Math.max(0, Math.min(100, pos));
      const top = (currentPosition / 100) * maxOffset;
      frame.style.top = `${top}%`;
      slider.value = currentPosition;
      valueDisplay.textContent = `${Math.round(currentPosition)}%`;
    };

    // 滑块控制
    slider.addEventListener('input', (e) => {
      updateFrame(parseInt(e.target.value));
    });

    // 鼠标拖动控制
    let isDragging = false;
    let startY = 0;
    let startPos = 0;

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      startY = e.clientY;
      startPos = currentPosition;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaY = e.clientY - startY;
      const containerHeight = container.offsetHeight;
      const deltaPos = (deltaY / containerHeight) * 100;
      updateFrame(startPos + deltaPos);
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // 保存
    saveBtn.addEventListener('click', async () => {
      await DataService.updateComponent(id, {
        imagePosition: Math.round(currentPosition)
      });
      await DataService.loadComponents();
      App.showToast('封面已保存', 'success');
      this.closeModal();
      // 刷新当前视图
      this.showDetail(id);
    });
  },

  // 保存表单 — 包含主/子分类校验
  saveForm() {
    const form = document.getElementById('componentForm');
    const formData = new FormData(form);

    const name = formData.get('name').trim();
    const itemType = formData.get('itemType') || 'component'; // component 或 wire
    const categoryId = formData.get('categoryId') || '';
    const subCategoryId = formData.get('subCategoryId') || '';
    const location = formData.get('location').trim();
    const rawPrice = parseFloat(formData.get('price'));
    const price = Math.round(rawPrice * 10000) / 10000;

    // 根据 itemType 解析数量与阈值
    const rawQuantity = parseFloat(formData.get('quantity'));
    const rawThreshold = parseFloat(formData.get('warningThreshold'));
    let quantity, warningThreshold;
    if (itemType === 'wire') {
      // 导线：支持小数，保留最多 2 位
      quantity = isNaN(rawQuantity) ? NaN : Math.round(rawQuantity * 100) / 100;
      warningThreshold = isNaN(rawThreshold) ? 0 : Math.max(0, Math.round(rawThreshold * 100) / 100);
    } else {
      // 器件：整数
      quantity = parseInt(formData.get('quantity'));
      warningThreshold = parseInt(formData.get('warningThreshold')) || 0;
    }

    const description = formData.get('description').trim();
    const imageUrl = formData.get('imageUrl').trim();
    const datasheetUrls = formData.get('datasheetUrls').trim().split('\n').map(u => u.trim()).filter(u => u);
    const attachmentUrls = formData.get('attachmentUrls').trim().split('\n').map(u => u.trim()).filter(u => u);

    // 必填校验
    if (!name || !location || isNaN(price) || isNaN(quantity)) {
      App.showToast('请填写所有必填字段', 'error');
      return;
    }

    // 分类校验：要么两个都为空，要么两个都不为空
    const catEmpty = !categoryId;
    const subCatEmpty = !subCategoryId;
    if (catEmpty !== subCatEmpty) {
      App.showToast('主分类和子分类必须同时选择，或都不选', 'error');
      return;
    }

    // 解析参数
    const parseParams = (text) => {
      const params = {};
      text.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
          params[key.trim()] = valueParts.join(':').trim();
        }
      });
      return params;
    };

    const mainParams = parseParams(formData.get('mainParams') || '');
    const subParams = parseParams(formData.get('subParams') || '');

    // 显示保存进度
    const showSavingProgress = () => {
      let progressEl = document.getElementById('savingProgress');
      if (!progressEl) {
        progressEl = document.createElement('div');
        progressEl.id = 'savingProgress';
        progressEl.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px 32px; z-index: 10001; box-shadow: var(--shadow-lg); text-align: center;';
        document.body.appendChild(progressEl);
      }
      progressEl.innerHTML = `
        <div style="margin-bottom: 16px;">
          <svg class="spinner" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
          </svg>
        </div>
        <div style="color: var(--text-primary); font-weight: 500;">正在保存...</div>
      `;
      return progressEl;
    };

    const hideSavingProgress = () => {
      const progressEl = document.getElementById('savingProgress');
      if (progressEl) progressEl.remove();
    };

    // 构建器件数据
    const componentData = {
      name,
      itemType,
      categoryId: categoryId || null,
      subCategoryId: subCategoryId || null,
      location,
      price,
      description,
      mainParams,
      subParams,
      imageUrls: imageUrl ? [imageUrl] : [],
      datasheetUrls,
      attachmentUrls,
      warningThreshold
    };

    const existingId = formData.get('id');

    // 异步保存到后端
    showSavingProgress();
    
    (async () => {
      try {
        if (existingId) {
          // 更新
          await DataService.updateComponent(existingId, {
            ...componentData,
            updatedAt: new Date().toISOString()
          });
          hideSavingProgress();
          this.closeModal();
          App.showToast('器件更新成功', 'success');
        } else {
          // 新增
          componentData.quantity = quantity;
          await DataService.addComponent(componentData);
          hideSavingProgress();
          this.closeModal();
          App.showToast('器件添加成功', 'success');
        }

        // 刷新列表
        await DataService.loadComponents();
        this.renderComponents(this.filterCategory, this.searchTerm, this.currentView, this.filterSubCategory);
      } catch (e) {
        hideSavingProgress();
        App.showToast('保存失败: ' + e.message, 'error');
        console.error('保存失败:', e);
      }
    })();
  },

  // 确认删除
  confirmDelete(id) {
    const component = DataService.getComponents().find(c => c.id === id);
    if (!component) return;

    const modal = document.getElementById('modal-container');
    App.openModal();
    modal.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal" style="max-width: 400px;">
          <div class="modal-body" style="padding: 40px 24px;">
            <div class="confirm-dialog">
              <div class="confirm-icon danger">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 class="confirm-title">确认删除</h3>
              <p class="confirm-message">确定要删除 "${component.name}" 吗？此操作不可撤销。</p>
              <div class="confirm-actions">
                <button class="btn btn-secondary" onclick="ComponentsModule.closeModal()">取消</button>
                <button class="btn btn-danger" onclick="ComponentsModule.deleteComponent('${id}')">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 删除器件
  async deleteComponent(id) {
    await DataService.deleteComponent(id);
    await DataService.loadComponents();

    this.closeModal();
    App.showToast('器件已删除', 'success');
    this.renderComponents(this.filterCategory, this.searchTerm, this.currentView, this.filterSubCategory);
  }
};
