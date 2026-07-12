/**
 * 主应用 - 路由和页面渲染
 */
const App = {
  currentPage: 'dashboard',
  charts: {},

  // 初始化应用
  async init() {
    // 先加载所有数据
    await DataService.loadAll();
    
    // 加载系统配置（版本号等）
    await this.loadConfig();
    
    this.bindEvents();
    this.updateCategoryMenu();
    this.updateCartBadges();
    this.handleRoute();
  },

  // 加载系统配置
  async loadConfig() {
    try {
      const response = await fetch('/api/config');
      const config = await response.json();
      App._config = config;
    } catch (e) {
      App._config = { version: 'D1', maxQuotaSizeMb: 500 };
    }
  },

  // 绑定事件
  bindEvents() {
    // 所有导航统一走 hashchange：
    // - 侧边栏菜单项是 <a href="#xxx">，点击后浏览器自动更新 hash
    // - 页面中的子分类卡片链接也是 <a href="#components/.../...">
    // - hashchange 触发后由 handleRoute() 统一解析渲染
    // 这样 URL 永远和页面状态一致，点击"同一个子分类"也能正常触发
    const sidebarNav = document.querySelector('.sidebar-nav');
    if (sidebarNav) {
      sidebarNav.addEventListener('click', (e) => {
        // 不 preventDefault，让浏览器正常更新 hash；hashchange 会自己触发渲染
        // 只需确保点击的确实是导航链接
        const item = e.target.closest('.nav-item, .nav-sub-item');
        if (!item) return;
      });
    }

    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });

    // 窗口大小变化时，如果回到桌面尺寸则关闭移动端侧边栏
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.closeMobileSidebar();
      }
    });
  },

  // 更新分类菜单（只显示主分类，子分类不在侧边栏出现）
  updateCategoryMenu() {
    const submenu = document.getElementById('componentsGroup');
    if (!submenu) return;

    const categories = DataService.getCategories();
    // 只筛选出主分类（parentId 为空或 null）
    const rootCategories = categories.filter(c => !c.parentId);
    const categoryItems = rootCategories.map(cat =>
      `<a href="#components/${cat.id}" class="nav-sub-item" data-page="components" data-category="${cat.id}">${cat.name}</a>`
    ).join('');

    submenu.innerHTML = `
      <a href="#components" class="nav-sub-item" data-page="components" data-category="">全部</a>
      ${categoryItems}
    `;
  },

  // 更新购物车徽章
  updateCartBadges() {
    const importBadge = document.getElementById('importCartBadge');
    const exportBadge = document.getElementById('exportCartBadge');
    
    const importCart = DataService.getImportCart();
    const exportCart = DataService.getExportCart();
    
    if (importBadge) {
      const importCount = importCart.reduce((sum, item) => sum + item.quantity, 0);
      importBadge.textContent = importCount > 0 ? importCount : '';
    }
    
    if (exportBadge) {
      const exportCount = exportCart.reduce((sum, item) => sum + item.quantity, 0);
      exportBadge.textContent = exportCount > 0 ? exportCount : '';
    }
  },

  // 切换导航组
  toggleNavGroup(groupId) {
    const submenu = document.getElementById(groupId);
    const header = submenu.previousElementSibling;
    
    submenu.classList.toggle('expanded');
    header.classList.toggle('expanded');
  },

  // 切换移动端侧边栏
  toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sidebar) return;
    sidebar.classList.toggle('mobile-open');
    if (overlay) overlay.classList.toggle('active');
  },

  // 关闭移动端侧边栏
  closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sidebar) return;
    sidebar.classList.remove('mobile-open');
    if (overlay) overlay.classList.remove('active');
  },

  // 路由处理
  handleRoute() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    const parts = hash.split('/');
    const page = parts[0];

    this.navigateTo(page, hash);
  },

  // 导航到页面
  navigateTo(page, route = '') {
    // 移动端导航后自动关闭侧边栏
    this.closeMobileSidebar();

    // route 可能值: 'dashboard', 'components', 'components/catId', 'components/catId/subId', 'categories', 'import-cart' 等
    const pathParts = route ? route.split('/') : [page];
    // parts[0] = page 名; parts[1] = categoryId; parts[2] = subCategoryId

    // 更新导航状态
    document.querySelectorAll('.nav-item, .nav-sub-item').forEach(item => {
      const itemPage = item.dataset.page;
      const itemCategory = item.dataset.category;

      let isActive = false;
      if (page === 'components' && itemPage === 'components') {
        const categoryParam = pathParts[1] || '';
        isActive = (itemCategory || '') === categoryParam;
      } else {
        isActive = itemPage === page;
      }

      item.classList.toggle('active', isActive);
    });

    this.currentPage = page;

    // 渲染对应页面
    switch (page) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'components': {
        const categoryId = pathParts[1] || '';
        const subCategoryId = pathParts[2] || '';

        // 关键修复：每次进入元件页面，清空搜索词（不保留上一次的搜索内容）
        ComponentsModule.searchTerm = '';
        // 使用 localStorage 中保存的视图偏好
        const savedView = localStorage.getItem('components_view_preference') || 'card';
        ComponentsModule.currentView = savedView;
        ComponentsModule.filterCategory = categoryId;
        ComponentsModule.filterSubCategory = subCategoryId;
        ComponentsModule.currentPage = 1;

        if (subCategoryId) {
          // 指定了子分类 — 直接显示该子分类下的器件
          const catObj = DataService.getCategories().find(c => c.id === categoryId);
          const subObj = DataService.getCategories().find(c => c.id === subCategoryId);
          ComponentsModule.renderComponents(categoryId, '', savedView, subCategoryId, catObj, subObj);
        } else if (categoryId) {
          // 只指定了主分类 — 显示子分类列表（不显示器件）
          CategoriesModule.renderCategoryDetail(categoryId);
        } else {
          // 全部器件 — 显式传入保存的视图
          ComponentsModule.renderComponents('', '', savedView);
        }
        break;
      }
      case 'categories':
        if (route.includes('/new')) {
          CategoriesModule.showFormModal();
        } else {
          CategoriesModule.renderCategories();
        }
        break;
      case 'import-cart':
        this.renderImportCart();
        break;
      case 'export-cart':
        this.renderExportCart();
        break;
      case 'settings':
        this.renderSettings();
        break;
      default:
        this.renderDashboard();
    }

    window.scrollTo(0, 0);
  },

  // 渲染仪表盘
  renderDashboard() {
    const stats = DataService.getStats();
    const recentComponents = DataService.getRecentComponents(5);

    const container = document.getElementById('page-container');
    container.innerHTML = `
      <div class="page-header">
        <h1>仪表盘</h1>
        <p>欢迎使用元件管理系统</p>
      </div>

      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr);">
        <div class="stat-card">
          <div class="stat-icon cyan">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div class="stat-value">${stats.totalComponents}</div>
          <div class="stat-label">器件总数</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon yellow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="stat-value">${stats.lowStockItems}</div>
          <div class="stat-label">库存预警</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(239, 68, 68, 0.15); color: var(--accent-danger);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div class="stat-value">${stats.outOfStockItems}</div>
          <div class="stat-label">缺货数量</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1v22"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div class="stat-value">¥${stats.totalValue}</div>
          <div class="stat-label">库存总价值</div>
        </div>
      </div>

      <div class="card" style="margin-top: 24px;">
        <div class="card-header">
          <h3 class="card-title">价格区间</h3>
        </div>
        <div style="height: 280px;">
          <canvas id="dashboardPriceChart"></canvas>
        </div>
      </div>

      <div class="card" style="margin-top: 24px;">
        <div class="card-header">
          <h3 class="card-title">最近更新</h3>
          <a href="#components" class="btn btn-secondary btn-sm">查看全部</a>
        </div>
        <div class="table-container" style="border: none;">
          <table class="table">
            <thead>
              <tr>
                <th>名称</th>
                <th>分类</th>
                <th>位置</th>
                <th>价格</th>
                <th>库存</th>
                <th>更新时间</th>
              </tr>
            </thead>
            <tbody>
              ${recentComponents.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 40px;">暂无数据</td>
                </tr>
              ` : recentComponents.map(c => {
                const cat = DataService.getCategories().find(cat => cat.id === c.categoryId) || { name: '未分类', color: '#64748b' };
                const isOutOfStock = Number(c.quantity) <= 0;
                const threshold = c.warningThreshold ?? 0;
                const isLowStock = threshold > 0 && Number(c.quantity) > 0 && Number(c.quantity) <= Number(threshold);
                return `
                  <tr onclick="window.location.hash = '#components/${c.id}'" style="cursor: pointer;">
                    <td><strong>${c.name}</strong></td>
                    <td><span class="badge" style="background: ${cat.color}20; color: ${cat.color}">${cat.name}</span></td>
                    <td>${c.location}</td>
                    <td style="color: var(--accent-secondary);">¥${DataService.formatPrice(c.price)}</td>
                    <td class="${isOutOfStock ? 'out-of-stock' : ''} ${isLowStock ? 'low' : ''}" style="${isOutOfStock || isLowStock ? 'color: var(--accent-danger);' : ''}">${ComponentsModule.formatQuantity(c)}</td>
                    <td>${new Date(c.updatedAt).toLocaleDateString('zh-CN')}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      ${stats.lowStockItems > 0 || stats.outOfStockItems > 0 ? `
        <div class="card" style="margin-top: 24px; border-left: 4px solid var(--accent-warning);">
          <div class="card-header">
            <h3 class="card-title" style="color: var(--accent-warning);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; vertical-align: middle; margin-right: 8px;">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              库存预警
            </h3>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
            ${DataService.getComponents().filter(c => {
              const threshold = c.warningThreshold ?? 0;
              return threshold > 0 && Number(c.quantity) > 0 && Number(c.quantity) <= Number(threshold);
            }).map(c => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--bg-primary); border-radius: var(--radius-md);">
                <div>
                  <div style="font-weight: 500;">${c.name}</div>
                  <div style="font-size: 0.85rem; color: var(--text-muted);">${c.location}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-family: var(--font-display); font-weight: 600; color: ${Number(c.quantity) <= 0 ? 'var(--accent-danger)' : 'var(--accent-warning)'};">${ComponentsModule.formatQuantity(c)}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${Number(c.quantity) <= 0 ? '缺货' : '库存'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;

    this.initDashboardCharts();
  },

  // 初始化仪表盘图表
  initDashboardCharts() {
    // 销毁旧图表
    Object.values(this.charts).forEach(chart => chart.destroy());
    this.charts = {};

    // 价格区间柱状图
    const priceCtx = document.getElementById('dashboardPriceChart');
    if (priceCtx) {
      const stats = DataService.getPriceRangeStats();
      this.charts.price = new Chart(priceCtx, {
        type: 'bar',
        data: {
          labels: stats.map(s => s.label),
          datasets: [{
            data: stats.map(s => s.count),
            backgroundColor: [
              'rgba(6, 182, 212, 0.7)',
              'rgba(34, 197, 94, 0.7)',
              'rgba(249, 115, 22, 0.7)',
              'rgba(234, 179, 8, 0.7)',
              'rgba(239, 68, 68, 0.7)'
            ],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#1e293b',
              titleColor: '#f8fafc',
              bodyColor: '#94a3b8',
              borderColor: '#334155',
              borderWidth: 1,
              padding: 10
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#94a3b8', font: { family: "'Comic Sans MS', cursive, sans-serif", size: 11 } }
            },
            y: {
              grid: { color: 'rgba(51, 65, 85, 0.5)' },
              ticks: { color: '#94a3b8', font: { family: "'Comic Sans MS', cursive, sans-serif" } }
            }
          }
        }
      });
    }
  },

  // 渲染入库车
  renderImportCart() {
    const cart = DataService.getImportCart();
    const components = DataService.getComponents();
    const categories = DataService.getCategories();
    const categoriesMap = {};
    categories.forEach(c => categoriesMap[c.id] = c);

    const container = document.getElementById('page-container');
    
    if (cart.length === 0) {
      container.innerHTML = `
        <div class="page-header">
          <h1>入库车</h1>
          <p>管理待入库的器件</p>
        </div>
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <h3 class="empty-state-title">入库车为空</h3>
          <p class="empty-state-description">从器件列表添加需要入库的器件</p>
          <button class="btn btn-primary" onclick="window.location.hash = '#components'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            浏览器件
          </button>
        </div>
      `;
      return;
    }

    const cartItems = cart.map(item => {
      const component = components.find(c => c.id === item.id);
      return { ...item, component };
    }).filter(item => item.component);

    container.innerHTML = `
      <div class="page-header">
        <h1>入库车</h1>
        <p>管理待入库的器件</p>
      </div>

      <div class="card">
        ${cartItems.map(item => {
          const cat = categoriesMap[item.component.categoryId] || { name: '未分类', color: '#64748b' };
          const isWire = item.component.itemType === 'wire';
          const unit = isWire ? 'm' : '个';
          const inputStep = isWire ? '0.01' : '1';
          return `
            <div class="cart-item">
              <div class="cart-item-info">
                <div class="cart-item-name">${item.component.name}</div>
                <div class="cart-item-meta">
                  <span class="badge" style="background: ${cat.color}20; color: ${cat.color}; margin-right: 8px;">${cat.name}</span>
                  ${item.component.location} | 当前库存: ${isWire ? Number(Number(item.component.quantity).toFixed(2)) : Math.round(item.component.quantity)} ${unit}
                </div>
              </div>
              <div class="cart-item-quantity">
                <label>入库数量:</label>
                <input type="number" min="${inputStep}" step="${inputStep}" value="${item.quantity}" onchange="App.updateImportQuantity('${item.id}', this.value)">
                <span style="color: var(--text-muted); font-size: 0.8rem;">${unit}</span>
              </div>
              <div class="cart-item-actions">
                <button class="btn btn-danger btn-sm" onclick="App.removeFromImportCart('${item.id}')">移除</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="cart-summary">
        <div class="cart-summary-row">
          <span class="cart-summary-label">待入库器件数</span>
          <span class="cart-summary-value">${cartItems.length}</span>
        </div>
        <div class="cart-summary-row">
          <span class="cart-summary-label">总入库数量</span>
          <span class="cart-summary-value">${Number(cartItems.reduce((sum, item) => sum + Number(item.quantity), 0)).toFixed(cartItems.some(i => i.component.itemType === 'wire') ? 2 : 0)}</span>
        </div>
        <div style="margin-top: 16px; display: flex; gap: 12px;">
          <button class="btn btn-primary" onclick="App.confirmImportAll()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            全部入库
          </button>
          <button class="btn btn-danger" onclick="App.clearImportCart()">清空入库车</button>
        </div>
      </div>
    `;
  },

  // 更新入库数量（支持小数）
  async updateImportQuantity(id, quantity) {
    const cart = DataService.getImportCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const components = DataService.getComponents();
    const comp = components.find(c => c.id === id);
    const isWire = comp && comp.itemType === 'wire';
    const newQty = isWire
      ? Math.max(0.01, Math.round(Number(quantity) * 100) / 100)
      : Math.max(1, parseInt(quantity) || 1);
    item.quantity = newQty;
    await DataService.saveImportCart(cart);
  },

  // 确认单个入库
  async confirmImport(id) {
    const cart = DataService.getImportCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const components = DataService.getComponents();
    const component = components.find(c => c.id === id);
    if (component) {
      component.quantity = Number(component.quantity) + Number(item.quantity);
      component.updatedAt = new Date().toISOString();
      await DataService.updateComponent(id, component);
    }

    await DataService.removeFromImportCart(id);
    this.updateCartBadges();
    const unit = (component && component.itemType === 'wire') ? 'm' : '个';
    const displayQty = component && component.itemType === 'wire'
      ? Number(item.quantity).toFixed(2)
      : Math.round(item.quantity);
    this.showToast(`已入库 ${displayQty} ${unit} ${component?.name}`, 'success');
    this.renderImportCart();
  },

  // 确认全部入库
  async confirmImportAll() {
    const cart = DataService.getImportCart();
    const components = DataService.getComponents();

    for (const item of cart) {
      const component = components.find(c => c.id === item.id);
      if (component) {
        component.quantity = Number(component.quantity) + Number(item.quantity);
        component.updatedAt = new Date().toISOString();
        await DataService.updateComponent(item.id, component);
      }
    }

    await DataService.clearImportCart();
    this.updateCartBadges();
    this.showToast('全部器件已入库', 'success');
    this.renderImportCart();
  },

  // 从入库车移除
  async removeFromImportCart(id) {
    await DataService.removeFromImportCart(id);
    this.updateCartBadges();
    this.renderImportCart();
  },

  // 清空入库车
  async clearImportCart() {
    await DataService.clearImportCart();
    this.updateCartBadges();
    this.renderImportCart();
  },

  // 渲染出库车
  renderExportCart() {
    const cart = DataService.getExportCart();
    const components = DataService.getComponents();
    const categories = DataService.getCategories();
    const categoriesMap = {};
    categories.forEach(c => categoriesMap[c.id] = c);

    const container = document.getElementById('page-container');
    
    if (cart.length === 0) {
      container.innerHTML = `
        <div class="page-header">
          <h1>出库车</h1>
          <p>管理待出库的器件</p>
        </div>
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M16 16l4-4-4-4M4 12h16"/>
            </svg>
          </div>
          <h3 class="empty-state-title">出库车为空</h3>
          <p class="empty-state-description">从器件列表添加需要出库的器件</p>
          <button class="btn btn-primary" onclick="window.location.hash = '#components'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            浏览器件
          </button>
        </div>
      `;
      return;
    }

    const cartItems = cart.map(item => {
      const component = components.find(c => c.id === item.id);
      return { ...item, component };
    }).filter(item => item.component && Number(item.component.quantity) > 0);

    container.innerHTML = `
      <div class="page-header">
        <h1>出库车</h1>
        <p>管理待出库的器件</p>
      </div>

      <div class="card">
        ${cartItems.map(item => {
          const cat = categoriesMap[item.component.categoryId] || { name: '未分类', color: '#64748b' };
          const isWire = item.component.itemType === 'wire';
          const unit = isWire ? 'm' : '个';
          const maxQuantity = Number(item.component.quantity);
          const inputStep = isWire ? 0.01 : 1;
          return `
            <div class="cart-item">
              <div class="cart-item-info">
                <div class="cart-item-name">${item.component.name}</div>
                <div class="cart-item-meta">
                  <span class="badge" style="background: ${cat.color}20; color: ${cat.color}; margin-right: 8px;">${cat.name}</span>
                  ${item.component.location} | 当前库存: ${isWire ? Number(maxQuantity.toFixed(2)) : Math.round(maxQuantity)} ${unit}
                </div>
              </div>
              <div class="cart-item-quantity">
                <label>出库数量:</label>
                <input type="number" min="${inputStep}" max="${maxQuantity}" step="${inputStep}" value="${Math.min(item.quantity, maxQuantity)}" onchange="App.updateExportQuantity('${item.id}', this.value, ${maxQuantity}, ${isWire})">
                <span style="color: var(--text-muted); font-size: 0.8rem;">/ ${isWire ? Number(maxQuantity.toFixed(2)) : Math.round(maxQuantity)} ${unit}</span>
              </div>
              <div class="cart-item-actions">
                <button class="btn btn-secondary btn-sm" onclick="App.selectAllExport('${item.id}')" title="把出库数量设置为当前库存">选中全部</button>
                <button class="btn btn-danger btn-sm" onclick="App.removeFromExportCart('${item.id}')">移除</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="cart-summary">
        <div class="cart-summary-row">
          <span class="cart-summary-label">待出库器件数</span>
          <span class="cart-summary-value">${cartItems.length}</span>
        </div>
        <div class="cart-summary-row">
          <span class="cart-summary-label">总出库数量</span>
          <span class="cart-summary-value">${Number(cartItems.reduce((sum, item) => sum + Number(Math.min(item.quantity, item.component.quantity)), 0)).toFixed(cartItems.some(i => i.component.itemType === 'wire') ? 2 : 0)}</span>
        </div>
        <div style="margin-top: 16px; display: flex; gap: 12px;">
          <button class="btn btn-primary" onclick="App.confirmExportAll()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 16l4-4-4-4M4 12h16"/>
            </svg>
            全部出库
          </button>
          <button class="btn btn-danger" onclick="App.clearExportCart()">清空出库车</button>
        </div>
      </div>
    `;
  },

  // 更新出库数量（支持小数）
  updateExportQuantity(id, quantity, maxQuantity, isWire = false) {
    const cart = DataService.getExportCart();
    const item = cart.find(i => i.id === id);
    if (item) {
      let newQty;
      if (isWire) {
        newQty = Math.min(Number(maxQuantity), Math.max(0.01, Math.round(Number(quantity) * 100) / 100));
      } else {
        newQty = Math.min(Math.round(maxQuantity), Math.max(1, parseInt(quantity) || 1));
      }
      item.quantity = newQty;
      DataService.saveExportCart(cart);
    }
  },

  // 确认单个出库
  async confirmExport(id) {
    const cart = DataService.getExportCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const components = DataService.getComponents();
    const component = components.find(c => c.id === id);
    if (component) {
      const exportQty = Math.min(Number(item.quantity), Number(component.quantity));
      component.quantity = Number(component.quantity) - exportQty;
      component.updatedAt = new Date().toISOString();
      await DataService.updateComponent(id, component);
    }

    await DataService.removeFromExportCart(id);
    this.updateCartBadges();
    const unit = (component && component.itemType === 'wire') ? 'm' : '个';
    const displayQty = component && component.itemType === 'wire'
      ? Number(item.quantity).toFixed(2)
      : Math.round(item.quantity);
    this.showToast(`已出库 ${displayQty} ${unit} ${component?.name}`, 'success');
    this.renderExportCart();
  },

  // 选中全部：将出库数量设置为当前库存
  async selectAllExport(id) {
    const cart = DataService.getExportCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const components = DataService.getComponents();
    const component = components.find(c => c.id === id);
    if (!component) return;

    // 设置出库数量为当前库存
    item.quantity = Number(component.quantity);
    await DataService.saveExportCart(cart);
    this.renderExportCart();
  },

  // 单独全部出库：将当前库存数量全部出库
  async confirmExportFull(id) {
    const cart = DataService.getExportCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;

    const components = DataService.getComponents();
    const component = components.find(c => c.id === id);
    if (!component || Number(component.quantity) <= 0) {
      this.showToast('该器件没有库存', 'error');
      return;
    }

    const exportQty = Number(component.quantity);
    component.quantity = 0;
    component.updatedAt = new Date().toISOString();
    await DataService.updateComponent(id, component);

    await DataService.removeFromExportCart(id);
    this.updateCartBadges();
    const unit = component.itemType === 'wire' ? 'm' : '个';
    const displayQty = component.itemType === 'wire'
      ? Number(exportQty).toFixed(2)
      : Math.round(exportQty);
    this.showToast(`已全部出库 ${displayQty} ${unit} ${component?.name}`, 'success');
    this.renderExportCart();
  },

  // 确认全部出库
  async confirmExportAll() {
    const cart = DataService.getExportCart();
    const components = DataService.getComponents();

    for (const item of cart) {
      const component = components.find(c => c.id === item.id);
      if (component && Number(component.quantity) > 0) {
        const exportQty = Math.min(Number(item.quantity), Number(component.quantity));
        component.quantity = Number(component.quantity) - exportQty;
        component.updatedAt = new Date().toISOString();
        await DataService.updateComponent(item.id, component);
      }
    }

    await DataService.clearExportCart();
    this.updateCartBadges();
    this.showToast('全部器件已出库', 'success');
    this.renderExportCart();
  },

  // 从出库车移除
  async removeFromExportCart(id) {
    await DataService.removeFromExportCart(id);
    this.updateCartBadges();
    this.renderExportCart();
  },

  // 清空出库车
  async clearExportCart() {
    await DataService.clearExportCart();
    this.updateCartBadges();
    this.renderExportCart();
  },

  // 渲染设置页面
  renderSettings() {
    const container = document.getElementById('page-container');
    const components = DataService.getComponents();
    const settings = DataService.getSettings();
    const debounceVal = settings.searchDebounce ?? 300;
    const saveMethodVal = settings.saveMethod ?? 'ctrlEnter';

    container.innerHTML = `
      <div class="page-header">
        <h1>设置</h1>
        <p>系统设置和数据管理</p>
      </div>

      <div class="settings-section">
        <h3 class="settings-section-title">搜索设置</h3>
        <p class="settings-section-desc">调整搜索输入的防抖时间（毫秒）。数值越大，输入后列表刷新越慢，但闪烁越少。</p>
        <div style="display: flex; align-items: center; gap: 12px;">
          <label for="debounceInput" style="color: var(--text-secondary);">防抖时间：</label>
          <input type="number" id="debounceInput" min="50" max="2000" step="50" value="${debounceVal}" style="width: 120px; padding: 8px 12px; background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 6px; font-family: var(--font-display);">
          <span style="color: var(--text-secondary);">毫秒</span>
          <button class="btn btn-primary btn-sm" onclick="App.saveDebounceSetting()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <path d="M17 21v-8H7v8M7 3v5h8"/>
            </svg>
            保存
          </button>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-section-title">保存方式</h3>
        <p class="settings-section-desc">选择在添加/编辑窗口中如何触发保存操作。</p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="saveMethod" value="ctrlEnter" ${saveMethodVal === 'ctrlEnter' ? 'checked' : ''}>
            <span>按 Ctrl+Enter 或点击"保存"按钮</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="saveMethod" value="enter" ${saveMethodVal === 'enter' ? 'checked' : ''}>
            <span>按 Enter 或点击"保存"按钮</span>
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="radio" name="saveMethod" value="buttonOnly" ${saveMethodVal === 'buttonOnly' ? 'checked' : ''}>
            <span>仅点击"保存"按钮</span>
          </label>
        </div>
        <div style="margin-top: 16px;">
          <button class="btn btn-primary btn-sm" onclick="App.saveSaveMethodSetting()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <path d="M17 21v-8H7v8M7 3v5h8"/>
            </svg>
            保存
          </button>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-section-title">存储空间</h3>
        <p class="settings-section-desc">查看服务器端数据存储使用情况。</p>
        <div id="storageInfo" style="margin-top: 16px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: var(--text-secondary);">已用: <strong id="storageUsed" style="color: var(--text-primary);">计算中...</strong></span>
            <span style="color: var(--text-secondary);">配额: <strong id="storageQuota" style="color: var(--text-primary);">计算中...</strong></span>
          </div>
          <div style="background: var(--bg-tertiary); border-radius: 8px; height: 24px; overflow: hidden; position: relative;">
            <div id="storageBar" style="background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); height: 100%; width: 0%; transition: width 0.5s ease;"></div>
            <span id="storagePercent" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.8rem; color: var(--text-secondary);">0%</span>
          </div>
          <p id="storageNote" style="color: var(--text-muted); font-size: 0.85rem; margin-top: 12px;"></p>
        </div>
      </div>



      <div class="settings-section">
        <h3 class="settings-section-title">数据管理</h3>
        <p class="settings-section-desc">清空所有本地存储的数据，包括器件、分类和购物车数据。此操作不可撤销。</p>
        <button class="btn btn-danger" onclick="App.confirmClearAllData()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          清空所有数据
        </button>
      </div>

      <div class="settings-section">
        <h3 class="settings-section-title">批量删除器件</h3>
        <p class="settings-section-desc">选择多个器件进行批量删除操作。</p>
        ${components.length === 0 ? '<p style="color: var(--text-muted);">暂无器件可删除</p>' : `
          <div style="max-height: 400px; overflow-y: auto; margin-bottom: 16px;">
            <table class="table">
              <thead>
                <tr>
                  <th style="width: 40px;">
                    <input type="checkbox" class="batch-checkbox" id="selectAll" onchange="App.toggleSelectAll()">
                  </th>
                  <th>名称</th>
                  <th>分类</th>
                  <th>库存</th>
                </tr>
              </thead>
              <tbody>
                ${components.map(c => {
                  const cat = DataService.getCategories().find(cat => cat.id === c.categoryId) || { name: '未分类', color: '#64748b' };
                  return `
                    <tr>
                      <td>
                        <input type="checkbox" class="batch-checkbox component-checkbox" data-id="${c.id}" onchange="App.updateSelectedCount()">
                      </td>
                      <td>${c.name}</td>
                      <td><span class="badge" style="background: ${cat.color}20; color: ${cat.color}">${cat.name}</span></td>
                      <td>${c.quantity}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <span id="selectedCount" style="color: var(--text-secondary);">已选择 0 个器件</span>
            <button class="btn btn-danger" id="batchDeleteBtn" onclick="App.confirmBatchDelete()" disabled>批量删除</button>
          </div>
        `}
      </div>

      <div class="settings-section">
        <h3 class="settings-section-title">服务器管理</h3>
        <p class="settings-section-desc">重启后端服务器以应用配置文件更改（config.ini）。需要管理员密码验证。</p>
        <button class="btn btn-primary" onclick="App.showRestartConfirm()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6"/>
            <path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
            <path d="M20.49 15A9 9 0 0 1 5.64 18.36L1 14"/>
          </svg>
          重启服务器
        </button>
      </div>

      <div class="settings-section">
        <h3 class="settings-section-title">关于</h3>
        <p class="settings-section-desc">元件管理 Version ${App._config?.version || 'D1'}</p>
      </div>
    `;

    // 异步更新存储空间信息
    this.updateStorageInfo();
  },

  // 格式化字节大小（自适应单位）
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(i > 0 ? 2 : 0)} ${units[i]}`;
  },

  // 计算 localStorage 已用字节数（使用 Blob 获取 UTF-8 实际大小）
  calculateLocalStorageUsage() {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += new Blob([localStorage[key]]).size;
      }
    }
    return total;
  },

  // 更新存储空间显示
  async updateStorageInfo() {
    const usedEl = document.getElementById('storageUsed');
    const quotaEl = document.getElementById('storageQuota');
    const barEl = document.getElementById('storageBar');
    const percentEl = document.getElementById('storagePercent');
    const noteEl = document.getElementById('storageNote');

    if (!usedEl) return;

    try {
      const response = await fetch('/api/storage-info');
      const data = await response.json();
      
      const totalSize = data.totalSize || 0;
      const dataSize = data.dataSize || 0;
      const uploadsSize = data.uploadsSize || 0;
      
      // 从接口返回获取配置的总配额
      const maxQuotaSizeMb = data.maxQuotaSizeMb || 500;
      
      const maxQuotaSize = maxQuotaSizeMb * 1024 * 1024;
      const percent = maxQuotaSize > 0 ? (totalSize / maxQuotaSize * 100) : 0;

      usedEl.textContent = this.formatBytes(totalSize);
      quotaEl.textContent = `${maxQuotaSizeMb} MB`;
      barEl.style.width = `${Math.min(percent, 100)}%`;
      percentEl.textContent = `${percent.toFixed(1)}%`;
      noteEl.textContent = `数据文件: ${this.formatBytes(dataSize)} | 上传文件: ${this.formatBytes(uploadsSize)}`;

      if (percent > 80) {
        barEl.style.background = 'linear-gradient(90deg, var(--accent-danger), #ff6b6b)';
      } else if (percent > 50) {
        barEl.style.background = 'linear-gradient(90deg, var(--accent-warning), #feca57)';
      } else {
        barEl.style.background = 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))';
      }
    } catch (e) {
      this.showStorageFallback('获取存储信息失败');
    }
  },

  // 存储信息获取失败时的回退显示
  showStorageFallback(reason) {
    const usedEl = document.getElementById('storageUsed');
    const quotaEl = document.getElementById('storageQuota');
    const barEl = document.getElementById('storageBar');
    const percentEl = document.getElementById('storagePercent');
    const noteEl = document.getElementById('storageNote');

    if (!usedEl) return;

    usedEl.textContent = '未知';
    quotaEl.textContent = '未知';
    barEl.style.width = '0%';
    percentEl.textContent = '0%';
    noteEl.textContent = reason;
  },

  // 保存搜索防抖设置
  saveDebounceSetting() {
    const input = document.getElementById('debounceInput');
    const value = parseInt(input.value);
    if (isNaN(value) || value < 50 || value > 2000) {
      App.showToast('请输入 50-2000 之间的毫秒数', 'error');
      return;
    }
    const settings = DataService.getSettings();
    settings.searchDebounce = value;
    DataService.saveSettings(settings);
    App.showToast(`已保存：防抖时间 ${value} 毫秒`, 'success');
  },

  // 保存保存方式设置
  saveSaveMethodSetting() {
    const inputs = document.querySelectorAll('input[name="saveMethod"]');
    let value = 'ctrlEnter';
    inputs.forEach(r => {
      if (r.checked) value = r.value;
    });
    const settings = DataService.getSettings();
    settings.saveMethod = value;
    DataService.saveSettings(settings);
    const label = {
      'ctrlEnter': 'Ctrl+Enter 或按钮',
      'enter': 'Enter 或按钮',
      'buttonOnly': '仅按钮'
    };
    App.showToast(`已保存：保存方式${label[value]}`, 'success');
  },

  // 全局表单按键处理器：根据设置决定 Enter / Ctrl+Enter 的行为
  handleFormKeyDown(event, saveTarget) {
    const tag = event.target?.tagName;
    const name = event.target?.name || '';
    // 在主参数/次要参数 textarea 中按 Enter 只换行（也不影响正常输入）——直接 return
    // 不阻止默认行为（即用户说 "Enter不影响换行"
    if (tag === 'TEXTAREA') return;

    const settings = DataService.getSettings();
    const saveMethod = settings.saveMethod || 'ctrlEnter';
    const key = event.key;
    const isEnter = key === 'Enter';
    const isCtrl = event.ctrlKey || event.metaKey;
    if (!isEnter) return;
    event.preventDefault();
    event.stopPropagation();

    // 直接引用模块对象（避免通过 window 访问 const 声明的模块）
    let saveFn = null;
    if (saveTarget === 'ComponentsModule.saveForm' && typeof ComponentsModule !== 'undefined') {
      saveFn = () => ComponentsModule.saveForm();
    } else if (saveTarget === 'CategoriesModule.saveForm' && typeof CategoriesModule !== 'undefined') {
      saveFn = () => CategoriesModule.saveForm();
    }

    if (saveMethod === 'ctrlEnter' && isCtrl && saveFn) {
      saveFn();
      return;
    }
    if (saveMethod === 'enter' && !isCtrl && saveFn) {
      saveFn();
      return;
    }
    // buttonOnly: do nothing
  },



  // 切换全选
  toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.component-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
    this.updateSelectedCount();
  },

  // 更新选中计数
  updateSelectedCount() {
    const checkboxes = document.querySelectorAll('.component-checkbox:checked');
    const countEl = document.getElementById('selectedCount');
    const deleteBtn = document.getElementById('batchDeleteBtn');
    
    if (countEl) {
      countEl.textContent = `已选择 ${checkboxes.length} 个器件`;
    }
    
    if (deleteBtn) {
      deleteBtn.disabled = checkboxes.length === 0;
    }
  },

  // 确认批量删除
  confirmBatchDelete() {
    const checkboxes = document.querySelectorAll('.component-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => cb.dataset.id);
    
    if (ids.length === 0) return;

    this.openModal();
    const modal = document.getElementById('modal-container');
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
              <h3 class="confirm-title">确认批量删除</h3>
              <p class="confirm-message">确定要删除选中的 ${ids.length} 个器件吗？此操作不可撤销。</p>
              <div class="confirm-actions">
                <button class="btn btn-secondary" onclick="App.closeModal()">取消</button>
                <button class="btn btn-danger" onclick="App.executeBatchDelete()">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 执行批量删除
  async executeBatchDelete() {
    const checkboxes = document.querySelectorAll('.component-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => cb.dataset.id);

    await DataService.batchDeleteComponents(ids);
    await DataService.loadComponents();

    this.closeModal();
    this.showToast(`已删除 ${ids.length} 个器件`, 'success');
    this.renderSettings();
  },

  // 确认清空所有数据（二次确认）
  confirmClearAllData(isSecondConfirm = false) {
    const componentCount = DataService.getComponents().length;
    const categoryCount = DataService.getCategories().length;

    const titleText = isSecondConfirm ? '最后确认：清空所有数据' : '确认清空所有数据';
    const messageText = isSecondConfirm
      ? `您即将清空全部数据（${categoryCount} 个分类、${componentCount} 个器件、以及所有购物车和设置），此操作完全不可恢复。请再次确认是否执行清空？`
      : `此操作将删除 ${categoryCount} 个分类、${componentCount} 个器件，以及所有购物车和设置数据，且不可恢复。`;

    this.openModal();
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal" style="max-width: 480px;">
          <div class="modal-body" style="padding: 40px 24px;">
            <div class="confirm-dialog">
              <div class="confirm-icon danger">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 class="confirm-title">${titleText}</h3>
              <p class="confirm-message" style="line-height: 1.7;">${messageText}</p>
              <div class="confirm-actions" style="justify-content: center; flex-wrap: wrap; gap: 12px;">
                <button class="btn btn-secondary" onclick="App.closeModal()">取消</button>
                ${isSecondConfirm
                  ? '<button class="btn btn-danger" onclick="App.executeClearAllData()">确认清空</button>'
                  : '<button class="btn btn-danger" onclick="App.confirmClearAllData(true)">继续</button>'}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },



  // 执行清空所有数据
  async executeClearAllData() {
    await DataService.clearAllData();
    this.updateCategoryMenu();
    this.updateCartBadges();
    this.closeModal();
    this.showToast('所有数据已清空', 'success');
    this.renderSettings();
  },

  // 显示重启服务器确认框
  showRestartConfirm() {
    this.openModal();
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
      <div class="modal-overlay active">
        <div class="modal" style="max-width: 440px;">
          <div class="modal-body" style="padding: 32px 24px;">
            <div class="confirm-dialog">
              <div class="confirm-icon warning">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6"/>
                  <path d="M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
                  <path d="M20.49 15A9 9 0 0 1 5.64 18.36L1 14"/>
                </svg>
              </div>
              <h3 class="confirm-title">重启服务器</h3>
              <p class="confirm-message" style="line-height: 1.7;">请输入管理员密码以重启服务器。重启后配置文件（config.ini）中的更改将生效。</p>
              <div style="margin: 20px 0;">
                <input type="password" id="restartPassword" class="input" placeholder="请输入密码" 
                  style="width: 100%; padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-tertiary); color: var(--text-primary); font-size: 14px;" 
                  onkeydown="if(event.key==='Enter') App.executeRestart()">
              </div>
              <div class="confirm-actions" style="justify-content: center; gap: 12px;">
                <button class="btn btn-secondary" onclick="App.closeModal()">取消</button>
                <button class="btn btn-primary" onclick="App.executeRestart()">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6"/>
                    <path d="M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/>
                    <path d="M20.49 15A9 9 0 0 1 5.64 18.36L1 14"/>
                  </svg>
                  重启
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.getElementById('restartPassword').focus();
  },

  // 执行重启服务器
  async executeRestart() {
    const passwordInput = document.getElementById('restartPassword');
    const password = passwordInput.value;
    
    if (!password) {
      App.showToast('请输入密码', 'error');
      return;
    }
    
    try {
      const response = await fetch('/api/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        App.closeModal();
        App.showToast(data.message || '服务器正在重启...', 'success');
        // 3秒后刷新页面
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        App.showToast(data.message || '重启失败', 'error');
        passwordInput.value = '';
        passwordInput.focus();
      }
    } catch (e) {
      App.showToast('重启请求失败: ' + e.message, 'error');
    }
  },

  // 检测是否为移动设备
  isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || (window.ontouchstart !== undefined && window.innerWidth <= 1024);
  },

  // 关闭模态框（Safari 兼容 - 不使用 position: fixed）
  closeModal() {
    document.getElementById('modal-container').innerHTML = '';
    if (this.isMobileDevice()) {
      const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      delete document.body.dataset.scrollY;
      window.scrollTo(0, scrollY);
    }
  },

  // 打开模态框（移动端才锁定 body 滚动，电脑端保持原样）
  openModal() {
    if (!this.isMobileDevice()) return;

    const scrollY = window.scrollY || window.pageYOffset || 0;
    document.body.dataset.scrollY = String(scrollY);
    // 关键：不使用 position: fixed，避免 Safari 中 fixed 子元素坐标系混乱
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';

    // Safari iOS：动态计算 modal 实际可用高度
    setTimeout(() => {
      const overlay = document.querySelector('.modal-overlay.active');
      const modal = document.querySelector('.modal-overlay.active .modal');
      if (!overlay || !modal) return;
      const vh = window.innerHeight;
      overlay.style.height = vh + 'px';
      modal.style.height = vh + 'px';
      // 确保 modal-body 可滚动
      const bodyEl = modal.querySelector('.modal-body');
      if (bodyEl) {
        const header = modal.querySelector('.modal-header');
        const footer = modal.querySelector('.modal-footer');
        const headerH = header ? header.offsetHeight : 0;
        const footerH = footer ? footer.offsetHeight : 0;
        const mStyle = getComputedStyle(modal);
        const padTop = parseInt(mStyle.paddingTop, 10) || 44;
        const padBottom = parseInt(mStyle.paddingBottom, 10) || 34;
        const contentH = vh - padTop - padBottom;
        const bodyMaxH = Math.max(contentH - headerH - footerH, 200);
        bodyEl.style.maxHeight = bodyMaxH + 'px';
        bodyEl.style.overflowY = 'auto';
        bodyEl.style.webkitOverflowScrolling = 'touch';
      }
    }, 100);
  },

  // 显示Toast通知
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    const icons = {
      success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
      error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type]}</div>
      <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
