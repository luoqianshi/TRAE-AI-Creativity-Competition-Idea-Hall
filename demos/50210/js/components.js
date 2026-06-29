/**
 * components.js - 元器件模块
 * 处理元器件搜索、参数筛选、添加元器件功能
 */

const Components = (() => {
    'use strict';

    let _currentPage = 1;
    let _totalPages = 1;
    let _pageSize = 20;
    let _currentFilters = {};
    let _isLoading = false;
    let _searchSuggestions = [];

    // ============================================
    // 初始化
    // ============================================

    /**
     * 初始化元器件列表页面
     * @param {string} containerSelector
     */
    function initComponentList(containerSelector = '#component-list') {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        initSearch();
        initFilters();
        initLoadMore();
        loadComponents();
    }

    /**
     * 加载元器件列表
     * @param {boolean} append
     */
    async function loadComponents(append = false) {
        if (_isLoading) return;
        _isLoading = true;

        const container = document.querySelector('#component-list');
        const loadingEl = document.querySelector('#components-loading');
        const emptyEl = document.querySelector('#components-empty');

        if (loadingEl) loadingEl.style.display = 'flex';
        if (emptyEl) emptyEl.style.display = 'none';

        try {
            const params = {
                page: _currentPage,
                limit: _pageSize,
                ..._currentFilters
            };

            const response = await API.Components.list(params);
            const components = response.data || response.components || [];
            _totalPages = response.totalPages || response.total_pages || 1;

            if (!append && container) {
                container.innerHTML = '';
            }

            if (components.length === 0 && !append) {
                if (emptyEl) emptyEl.style.display = 'flex';
                return;
            }

            const html = components.map(comp => renderComponentCard(comp)).join('');

            if (container) {
                container.insertAdjacentHTML('beforeend', html);
            }

            bindComponentEvents();

            // 更新分页信息
            updatePaginationInfo(response.total || components.length);

        } catch (error) {
            Utils.showToast(error.message || '加载元器件列表失败', 'error');
        } finally {
            _isLoading = false;
            if (loadingEl) loadingEl.style.display = 'none';
        }
    }

    /**
     * 渲染元器件卡片
     * @param {Object} component
     * @returns {string}
     */
    function renderComponentCard(component) {
        const imageUrl = component.image || component.thumbnail || '/assets/images/default-component.png';
        const manufacturer = component.manufacturer || component.brand || '';
        const model = component.model || component.part_number || '';

        return `
            <div class="component-card" data-id="${component.id}">
                <div class="component-image">
                    <img src="${imageUrl}" alt="${component.name}" loading="lazy"
                         onerror="this.src='/assets/images/default-component.png'">
                </div>
                <div class="component-info">
                    <h3 class="component-name">${escapeHtml(component.name)}</h3>
                    ${model ? `<p class="component-model">型号: ${escapeHtml(model)}</p>` : ''}
                    ${manufacturer ? `<p class="component-manufacturer">厂商: ${escapeHtml(manufacturer)}</p>` : ''}
                    <div class="component-params">
                        ${renderComponentParams(component.params || component.specifications || {})}
                    </div>
                    <div class="component-footer">
                        <span class="component-category">${escapeHtml(component.category_name || component.category || '')}</span>
                        <span class="component-stock ${component.stock > 0 ? 'in-stock' : 'out-stock'}">
                            ${component.stock > 0 ? '有货' : '缺货'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 渲染元器件参数
     */
    function renderComponentParams(params) {
        const entries = Object.entries(params).slice(0, 4);
        if (entries.length === 0) return '';

        return entries.map(([key, value]) =>
            `<span class="param-item"><strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(value))}</span>`
        ).join('');
    }

    // ============================================
    // 搜索功能
    // ============================================

    /**
     * 初始化搜索
     */
    function initSearch() {
        const searchInput = document.querySelector('#component-search');
        if (!searchInput) return;

        // 实时搜索建议
        searchInput.addEventListener('input', Utils.debounce(async (e) => {
            const value = e.target.value.trim();
            if (value.length >= 2) {
                await loadSearchSuggestions(value);
            } else {
                hideSearchSuggestions();
            }
        }, 300));

        // 回车搜索
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(e.target.value.trim());
                hideSearchSuggestions();
            }
        });

        // 点击外部隐藏建议
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                hideSearchSuggestions();
            }
        });

        // 搜索按钮
        const searchBtn = document.querySelector('#component-search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                performSearch(searchInput.value.trim());
                hideSearchSuggestions();
            });
        }
    }

    /**
     * 加载搜索建议
     */
    async function loadSearchSuggestions(keyword) {
        try {
            const response = await API.Components.search({ keyword, limit: 8 });
            _searchSuggestions = response.data || response.suggestions || [];
            showSearchSuggestions(_searchSuggestions);
        } catch {
            hideSearchSuggestions();
        }
    }

    /**
     * 显示搜索建议
     */
    function showSearchSuggestions(suggestions) {
        let dropdown = document.querySelector('#search-suggestions');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'search-suggestions';
            dropdown.className = 'search-suggestions-dropdown';
            dropdown.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                z-index: 100;
                max-height: 300px;
                overflow-y: auto;
            `;
            const searchContainer = document.querySelector('.search-container');
            if (searchContainer) {
                searchContainer.style.position = 'relative';
                searchContainer.appendChild(dropdown);
            }
        }

        if (suggestions.length === 0) {
            dropdown.innerHTML = '<div class="suggestion-item" style="padding:12px;color:#6b7280;">无匹配结果</div>';
        } else {
            dropdown.innerHTML = suggestions.map(item => `
                <div class="suggestion-item" data-id="${item.id}" style="
                    padding: 10px 16px;
                    cursor: pointer;
                    border-bottom: 1px solid #f3f4f6;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                ">
                    <span style="color:#6b7280;">🔌</span>
                    <div>
                        <div style="font-weight:500;">${escapeHtml(item.name)}</div>
                        <div style="font-size:12px;color:#9ca3af;">${escapeHtml(item.manufacturer || '')} ${escapeHtml(item.model || '')}</div>
                    </div>
                </div>
            `).join('');
        }

        dropdown.style.display = 'block';

        // 绑定点击事件
        dropdown.querySelectorAll('.suggestion-item[data-id]').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.id;
                const name = item.querySelector('div div:first-child').textContent;
                const searchInput = document.querySelector('#component-search');
                if (searchInput) searchInput.value = name;
                hideSearchSuggestions();
                viewComponentDetail(id);
            });
        });
    }

    /**
     * 隐藏搜索建议
     */
    function hideSearchSuggestions() {
        const dropdown = document.querySelector('#search-suggestions');
        if (dropdown) dropdown.style.display = 'none';
    }

    /**
     * 执行搜索
     */
    function performSearch(keyword) {
        _currentFilters.keyword = keyword;
        _currentPage = 1;
        loadComponents();
    }

    // ============================================
    // 筛选功能
    // ============================================

    /**
     * 初始化筛选器
     */
    function initFilters() {
        // 分类筛选
        const categoryFilter = document.querySelector('#comp-filter-category');
        if (categoryFilter) {
            loadCategories();
            categoryFilter.addEventListener('change', (e) => {
                _currentFilters.category = e.target.value;
                _currentPage = 1;
                loadComponents();
            });
        }

        // 封装类型筛选
        const packageFilter = document.querySelector('#comp-filter-package');
        if (packageFilter) {
            packageFilter.addEventListener('change', (e) => {
                _currentFilters.package = e.target.value;
                _currentPage = 1;
                loadComponents();
            });
        }

        // 厂商筛选
        const manufacturerFilter = document.querySelector('#comp-filter-manufacturer');
        if (manufacturerFilter) {
            manufacturerFilter.addEventListener('change', (e) => {
                _currentFilters.manufacturer = e.target.value;
                _currentPage = 1;
                loadComponents();
            });
        }

        // 库存状态筛选
        const stockFilter = document.querySelector('#comp-filter-stock');
        if (stockFilter) {
            stockFilter.addEventListener('change', (e) => {
                _currentFilters.in_stock = e.target.value;
                _currentPage = 1;
                loadComponents();
            });
        }

        // 重置筛选
        const resetBtn = document.querySelector('#comp-filter-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetFilters);
        }
    }

    /**
     * 加载分类列表
     */
    async function loadCategories() {
        try {
            const response = await API.Components.categories();
            const categories = response.data || response.categories || [];
            const select = document.querySelector('#comp-filter-category');
            if (select) {
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id || cat.slug;
                    option.textContent = cat.name;
                    select.appendChild(option);
                });
            }
        } catch {
            // 静默失败
        }
    }

    /**
     * 重置筛选器
     */
    function resetFilters() {
        _currentFilters = {};
        _currentPage = 1;

        document.querySelectorAll('#component-filters select').forEach(select => {
            select.value = '';
        });

        loadComponents();
    }

    // ============================================
    // 加载更多
    // ============================================

    /**
     * 初始化加载更多
     */
    function initLoadMore() {
        const btn = document.querySelector('#load-more-components');
        if (!btn) return;

        btn.addEventListener('click', () => {
            if (_currentPage < _totalPages) {
                _currentPage++;
                loadComponents(true);
            }
        });
    }

    /**
     * 更新分页信息
     */
    function updatePaginationInfo(total) {
        const info = document.querySelector('#components-pagination-info');
        if (info) {
            info.textContent = `共 ${Utils.formatNumber(total)} 个元器件`;
        }
    }

    // ============================================
    // 元器件详情
    // ============================================

    /**
     * 查看元器件详情
     * @param {string} componentId
     */
    async function viewComponentDetail(componentId) {
        const modal = document.querySelector('#component-detail-modal');

        if (modal) {
            modal.style.display = 'flex';
            modal.querySelector('.modal-body').innerHTML = '<div class="loading-spinner">加载中...</div>';
        }

        try {
            const response = await API.Components.detail(componentId);
            const component = response.data || response;

            if (modal) {
                modal.querySelector('.modal-body').innerHTML = renderComponentDetail(component);
            } else {
                window.location.href = `component-detail.html?id=${componentId}`;
            }

        } catch (error) {
            Utils.showToast(error.message || '加载失败', 'error');
            if (modal) {
                modal.querySelector('.modal-body').innerHTML = '<div class="error-message">加载失败</div>';
            }
        }
    }

    /**
     * 渲染元器件详情
     */
    function renderComponentDetail(component) {
        const imageUrl = component.image || '/assets/images/default-component.png';

        return `
            <div class="component-detail">
                <div class="component-detail-header">
                    <div class="component-detail-image">
                        <img src="${imageUrl}" alt="${component.name}"
                             onerror="this.src='/assets/images/default-component.png'">
                    </div>
                    <div class="component-detail-info">
                        <h2>${escapeHtml(component.name)}</h2>
                        <p class="component-model">型号: ${escapeHtml(component.model || component.part_number || '-')}</p>
                        <p class="component-manufacturer">厂商: ${escapeHtml(component.manufacturer || '-')}</p>
                        <p class="component-stock ${component.stock > 0 ? 'in-stock' : 'out-stock'}">
                            库存: ${component.stock > 0 ? `${component.stock} 有货` : '缺货'}
                        </p>
                    </div>
                </div>
                <div class="component-detail-specs">
                    <h3>规格参数</h3>
                    <table class="specs-table">
                        ${Object.entries(component.specifications || component.params || {}).map(([key, value]) =>
                            `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(String(value))}</td></tr>`
                        ).join('')}
                    </table>
                </div>
                ${component.description ? `
                    <div class="component-detail-desc">
                        <h3>描述</h3>
                        <p>${escapeHtml(component.description)}</p>
                    </div>
                ` : ''}
                <div class="component-detail-actions">
                    <button class="btn btn-primary" onclick="Components.addToCompare('${component.id}')">
                        添加到对比
                    </button>
                    <a href="${component.datasheet || '#'}" target="_blank" class="btn btn-outline">
                        查看数据手册
                    </a>
                </div>
            </div>
        `;
    }

    // ============================================
    // 添加元器件
    // ============================================

    /**
     * 初始化添加元器件表单
     * @param {string} formSelector
     */
    function initAddComponentForm(formSelector = '#add-component-form') {
        const form = document.querySelector(formSelector);
        if (!form) return;

        // 动态添加参数行
        const addParamBtn = form.querySelector('#add-param-btn');
        if (addParamBtn) {
            addParamBtn.addEventListener('click', () => {
                addParameterRow(form);
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn.disabled) return;
            submitBtn.disabled = true;

            try {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                // 收集参数
                const params = {};
                form.querySelectorAll('.param-row').forEach(row => {
                    const key = row.querySelector('[name="param_key"]')?.value;
                    const value = row.querySelector('[name="param_value"]')?.value;
                    if (key && value) {
                        params[key] = value;
                    }
                });
                data.specifications = params;

                const response = await API.Components.create(data);
                Utils.showToast('元器件添加成功！', 'success');

                setTimeout(() => {
                    window.location.href = `component-detail.html?id=${response.id || response.component?.id}`;
                }, 1000);

            } catch (error) {
                Utils.showToast(error.message || '添加失败', 'error');
                if (error.validationErrors) {
                    showFormErrors(form, error.validationErrors);
                }
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    /**
     * 添加参数行
     */
    function addParameterRow(form) {
        const container = form.querySelector('#params-container') || form.querySelector('.params-list');
        if (!container) return;

        const row = document.createElement('div');
        row.className = 'param-row';
        row.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;align-items:center;';

        row.innerHTML = `
            <input type="text" name="param_key" placeholder="参数名" style="flex:1;padding:8px;border:1px solid #d1d5db;border-radius:4px;">
            <input type="text" name="param_value" placeholder="参数值" style="flex:1;padding:8px;border:1px solid #d1d5db;border-radius:4px;">
            <button type="button" class="btn-remove-param" style="padding:8px 12px;background:#fee2e2;color:#dc2626;border:none;border-radius:4px;cursor:pointer;">删除</button>
        `;

        row.querySelector('.btn-remove-param').addEventListener('click', () => {
            row.remove();
        });

        container.appendChild(row);
    }

    // ============================================
    // 对比功能
    // ============================================

    let _compareList = [];

    /**
     * 添加到对比列表
     */
    function addToCompare(componentId) {
        if (_compareList.includes(componentId)) {
            Utils.showToast('已在对比列表中', 'info');
            return;
        }

        if (_compareList.length >= 4) {
            Utils.showToast('最多只能对比4个元器件', 'warning');
            return;
        }

        _compareList.push(componentId);
        Utils.Storage.set('compare_list', _compareList);
        Utils.showToast('已添加到对比列表', 'success');
        updateCompareBadge();
    }

    /**
     * 从对比列表移除
     */
    function removeFromCompare(componentId) {
        _compareList = _compareList.filter(id => id !== componentId);
        Utils.Storage.set('compare_list', _compareList);
        updateCompareBadge();
    }

    /**
     * 更新对比徽章
     */
    function updateCompareBadge() {
        const badge = document.querySelector('#compare-badge');
        if (badge) {
            badge.textContent = _compareList.length;
            badge.style.display = _compareList.length > 0 ? 'inline-flex' : 'none';
        }
    }

    /**
     * 加载对比列表
     */
    function loadCompareList() {
        _compareList = Utils.Storage.get('compare_list', []);
        updateCompareBadge();
    }

    // ============================================
    // 辅助函数
    // ============================================

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showFormErrors(form, errors) {
        for (const [field, message] of Object.entries(errors)) {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
                input.style.borderColor = '#ef4444';
                let errorEl = input.parentElement.querySelector('.field-error');
                if (!errorEl) {
                    errorEl = document.createElement('span');
                    errorEl.className = 'field-error';
                    errorEl.style.cssText = 'color:#ef4444;font-size:12px;display:block;';
                    input.parentElement.appendChild(errorEl);
                }
                errorEl.textContent = message;
            }
        }
    }

    function bindComponentEvents() {
        document.querySelectorAll('.component-card').forEach(card => {
            card.addEventListener('click', () => {
                viewComponentDetail(card.dataset.id);
            });
        });
    }

    // ============================================
    // 公共API
    // ============================================

    return {
        initComponentList,
        loadComponents,
        viewComponentDetail,
        initAddComponentForm,
        addToCompare,
        removeFromCompare,
        loadCompareList,
        performSearch
    };
})();

if (typeof window !== 'undefined') {
    window.Components = Components;
}
