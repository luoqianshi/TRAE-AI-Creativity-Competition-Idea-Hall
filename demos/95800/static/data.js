/**
 * 数据服务 - 后端 API 版本
 * 所有数据通过 Flask 后端 API 存取
 */

const API_BASE = '/api';

const DataService = {
  // ==================== 器件操作 ====================
  
  getComponents() {
    // 同步获取（从缓存）
    if (this._componentsCache) return this._componentsCache;
    return [];
  },

  async loadComponents() {
    const response = await fetch(`${API_BASE}/components`);
    this._componentsCache = await response.json();
    return this._componentsCache;
  },

  async saveComponents(components) {
    // 批量保存（用于导入）- 通过导入API实现
    this._componentsCache = components;
  },

  async addComponent(component) {
    const response = await fetch(`${API_BASE}/components`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(component)
    });
    const newComponent = await response.json();
    if (this._componentsCache) this._componentsCache.push(newComponent);
    return newComponent;
  },

  async updateComponent(id, updates) {
    const response = await fetch(`${API_BASE}/components/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const updated = await response.json();
    if (this._componentsCache) {
      const index = this._componentsCache.findIndex(c => c.id === id);
      if (index !== -1) this._componentsCache[index] = updated;
    }
    return updated;
  },

  async deleteComponent(id) {
    await fetch(`${API_BASE}/components/${id}`, { method: 'DELETE' });
    if (this._componentsCache) {
      this._componentsCache = this._componentsCache.filter(c => c.id !== id);
    }
  },

  async batchDeleteComponents(ids) {
    await fetch(`${API_BASE}/components/batch-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    if (this._componentsCache) {
      this._componentsCache = this._componentsCache.filter(c => !ids.includes(c.id));
    }
  },

  // ==================== 分类操作 ====================

  getCategories() {
    if (this._categoriesCache) return this._categoriesCache;
    return [];
  },

  async loadCategories() {
    const response = await fetch(`${API_BASE}/categories`);
    this._categoriesCache = await response.json();
    return this._categoriesCache;
  },

  async saveCategories(categories) {
    this._categoriesCache = categories;
  },

  async addCategory(category) {
    const response = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    });
    const newCategory = await response.json();
    if (this._categoriesCache) this._categoriesCache.push(newCategory);
    return newCategory;
  },

  async updateCategory(id, updates) {
    const response = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const updated = await response.json();
    if (this._categoriesCache) {
      const index = this._categoriesCache.findIndex(c => c.id === id);
      if (index !== -1) this._categoriesCache[index] = updated;
    }
    return updated;
  },

  async deleteCategory(id) {
    await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
    if (this._categoriesCache) {
      this._categoriesCache = this._categoriesCache.filter(c => c.id !== id);
    }
  },

  // ==================== 入库车操作 ====================

  getImportCart() {
    return this._importCartCache || [];
  },

  async loadImportCart() {
    const response = await fetch(`${API_BASE}/cart/import`);
    this._importCartCache = await response.json();
    return this._importCartCache;
  },

  saveImportCart(cart) {
    this._importCartCache = cart;
    // 异步保存到后端
    (async () => {
      await fetch(`${API_BASE}/cart/import/clear`, { method: 'POST' });
      for (const item of cart) {
        await fetch(`${API_BASE}/cart/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      }
    })();
  },

  async addToImportCart(item) {
    const response = await fetch(`${API_BASE}/cart/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const newItem = await response.json();
    if (this._importCartCache) this._importCartCache.push(newItem);
    return newItem;
  },

  async updateImportCartItem(id, updates) {
    const response = await fetch(`${API_BASE}/cart/import/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return await response.json();
  },

  async removeFromImportCart(id) {
    await fetch(`${API_BASE}/cart/import/${id}`, { method: 'DELETE' });
    if (this._importCartCache) {
      this._importCartCache = this._importCartCache.filter(i => i.id !== id);
    }
  },

  async clearImportCart() {
    await fetch(`${API_BASE}/cart/import/clear`, { method: 'POST' });
    this._importCartCache = [];
  },

  // ==================== 出库车操作 ====================

  getExportCart() {
    return this._exportCartCache || [];
  },

  async loadExportCart() {
    const response = await fetch(`${API_BASE}/cart/export`);
    this._exportCartCache = await response.json();
    return this._exportCartCache;
  },

  saveExportCart(cart) {
    this._exportCartCache = cart;
    // 异步保存到后端
    (async () => {
      await fetch(`${API_BASE}/cart/export/clear`, { method: 'POST' });
      for (const item of cart) {
        await fetch(`${API_BASE}/cart/export`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      }
    })();
  },

  async addToExportCart(item) {
    const response = await fetch(`${API_BASE}/cart/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    const newItem = await response.json();
    if (this._exportCartCache) this._exportCartCache.push(newItem);
    return newItem;
  },

  async updateExportCartItem(id, updates) {
    const response = await fetch(`${API_BASE}/cart/export/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return await response.json();
  },

  async removeFromExportCart(id) {
    await fetch(`${API_BASE}/cart/export/${id}`, { method: 'DELETE' });
    if (this._exportCartCache) {
      this._exportCartCache = this._exportCartCache.filter(i => i.id !== id);
    }
  },

  async clearExportCart() {
    await fetch(`${API_BASE}/cart/export/clear`, { method: 'POST' });
    this._exportCartCache = [];
  },

  // ==================== 设置操作 ====================

  getSettings() {
    return this._settingsCache || {};
  },

  async loadSettings() {
    const response = await fetch(`${API_BASE}/settings`);
    this._settingsCache = await response.json();
    return this._settingsCache;
  },

  saveSettings(settings) {
    this._settingsCache = settings;
    fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
  },

  // ==================== 统计数据 ====================

  getRecentComponents(limit = 5) {
    const components = this.getComponents();
    return components
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, limit);
  },

  getStats() {
    const components = this.getComponents();
    
    const totalValue = components.reduce((sum, c) => sum + (c.price * Number(c.quantity)), 0);
    const lowStockItems = components.filter(c => {
      const threshold = Number(c.warningThreshold ?? 0);
      return threshold > 0 && Number(c.quantity) > 0 && Number(c.quantity) <= threshold;
    }).length;
    const outOfStockItems = components.filter(c => Number(c.quantity) <= 0).length;
    
    return {
      totalComponents: components.length,
      lowStockItems,
      outOfStockItems,
      totalValue: totalValue.toFixed(2)
    };
  },

  getCategoryStats() {
    const components = this.getComponents();
    const categories = this.getCategories();
    
    return categories.map(cat => {
      const catComponents = components.filter(c => c.categoryId === cat.id);
      return {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        count: catComponents.length
      };
    }).filter(stat => stat.count > 0);
  },

  getPriceRangeStats() {
    const components = this.getComponents();
    const ranges = [
      { label: '0-0.1元', min: 0, max: 0.1 },
      { label: '0.1-1元', min: 0.1, max: 1 },
      { label: '1-10元', min: 1, max: 10 },
      { label: '10-100元', min: 10, max: 100 },
      { label: '100元以上', min: 100, max: Infinity }
    ];
    
    return ranges.map(range => {
      return {
        label: range.label,
        count: components.filter(c => c.price >= range.min && c.price < range.max).length
      };
    });
  },

  getCategoryValueStats() {
    const components = this.getComponents();
    const categories = this.getCategories();
    
    return categories.map(cat => {
      const catComponents = components.filter(c => c.categoryId === cat.id);
      const value = catComponents.reduce((sum, c) => sum + (c.price * c.quantity), 0);
      return {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        value: value.toFixed(2)
      };
    }).filter(stat => parseFloat(stat.value) > 0);
  },

  // ==================== 价格格式化 ====================

  formatPrice(price) {
    const num = Number(price) || 0;
    if (num <= 0) return '0.00';
    let decimals;
    if (num < 0.05) decimals = 4;
    else if (num < 0.2) decimals = 3;
    else decimals = 2;
    let formatted = num.toFixed(decimals);
    while (formatted.length - formatted.indexOf('.') - 1 > 2 && formatted.endsWith('0')) {
      formatted = formatted.slice(0, -1);
    }
    return formatted;
  },

  // ==================== 工具函数 ====================

  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },



  async clearAllData() {
    await fetch(`${API_BASE}/clear-all`, { method: 'POST' });
    this._componentsCache = [];
    this._categoriesCache = [];
    this._importCartCache = [];
    this._exportCartCache = [];
    this._settingsCache = {};
  },

  // ==================== 初始化 ====================

  async loadAll() {
    await Promise.all([
      this.loadComponents(),
      this.loadCategories(),
      this.loadImportCart(),
      this.loadExportCart(),
      this.loadSettings()
    ]);
  },

  // 缓存
  _componentsCache: null,
  _categoriesCache: null,
  _importCartCache: null,
  _exportCartCache: null,
  _settingsCache: null
};
