/**
 * projects.js - 项目模块
 * 处理项目列表加载、筛选、详情查看、收藏功能
 */

const Projects = (() => {
    'use strict';

    let _currentPage = 1;
    let _totalPages = 1;
    let _pageSize = 12;
    let _currentFilters = {};
    let _isLoading = false;

    // ============================================
    // 项目列表
    // ============================================

    /**
     * 初始化项目列表页面
     * @param {string} containerSelector - 项目列表容器选择器
     */
    function initProjectList(containerSelector = '#project-list') {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        initSearch();
        initFilters();
        initLoadMore();
        initInfiniteScroll(container);

        loadProjects();
    }

    /**
     * 加载项目列表
     * @param {boolean} append - 是否追加到现有列表
     */
    async function loadProjects(append = false) {
        if (_isLoading) return;
        _isLoading = true;

        const container = document.querySelector('#project-list');
        const loadingEl = document.querySelector('#projects-loading');
        const emptyEl = document.querySelector('#projects-empty');
        const loadMoreBtn = document.querySelector('#load-more-projects');

        if (loadingEl) loadingEl.style.display = 'flex';
        if (emptyEl) emptyEl.style.display = 'none';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';

        try {
            const params = {
                page: _currentPage,
                limit: _pageSize,
                ..._currentFilters
            };

            const response = await API.Projects.list(params);
            const projects = response.data || response.projects || [];
            _totalPages = response.totalPages || response.total_pages || 1;

            if (!append && container) {
                container.innerHTML = '';
            }

            if (projects.length === 0 && !append) {
                if (emptyEl) emptyEl.style.display = 'flex';
                return;
            }

            const html = projects.map(project => renderProjectCard(project)).join('');

            if (container) {
                container.insertAdjacentHTML('beforeend', html);
            }

            // 绑定卡片事件
            bindProjectCardEvents();

            // 显示/隐藏加载更多按钮
            if (loadMoreBtn) {
                loadMoreBtn.style.display = _currentPage < _totalPages ? 'inline-flex' : 'none';
            }

        } catch (error) {
            Utils.showToast(error.message || '加载项目列表失败', 'error');
        } finally {
            _isLoading = false;
            if (loadingEl) loadingEl.style.display = 'none';
        }
    }

    /**
     * 渲染项目卡片
     * @param {Object} project
     * @returns {string}
     */
    function renderProjectCard(project) {
        const coverUrl = project.cover || project.thumbnail || '/assets/images/default-cover.png';
        const authorName = project.author?.username || project.author_name || '匿名';
        const authorAvatar = project.author?.avatar || '/assets/images/default-avatar.png';

        return `
            <div class="project-card" data-id="${project.id}">
                <a href="project-detail.html?id=${project.id}" class="project-card-link">
                    <div class="project-cover">
                        <img src="${coverUrl}" alt="${project.title}" loading="lazy"
                             onerror="this.src='/assets/images/default-cover.png'">
                        ${project.is_featured ? '<span class="badge-featured">精选</span>' : ''}
                    </div>
                    <div class="project-info">
                        <h3 class="project-title">${escapeHtml(project.title)}</h3>
                        <p class="project-desc">${escapeHtml(project.description || '').substring(0, 100)}</p>
                        <div class="project-tags">
                            ${(project.tags || []).slice(0, 3).map(tag =>
                                `<span class="tag">${escapeHtml(tag)}</span>`
                            ).join('')}
                        </div>
                        <div class="project-meta">
                            <div class="project-author">
                                <img src="${authorAvatar}" alt="${authorName}" class="author-avatar"
                                     onerror="this.src='/assets/images/default-avatar.png'">
                                <span>${escapeHtml(authorName)}</span>
                            </div>
                            <div class="project-stats">
                                <span title="收藏">★ ${project.favorites_count || 0}</span>
                                <span title="浏览">👁 ${project.views_count || 0}</span>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        `;
    }

    /**
     * 绑定项目卡片事件
     */
    function bindProjectCardEvents() {
        document.querySelectorAll('.project-card').forEach(card => {
            const favBtn = card.querySelector('.btn-favorite');
            if (favBtn) {
                favBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(card.dataset.id, favBtn);
                });
            }
        });
    }

    // ============================================
    // 搜索功能
    // ============================================

    /**
     * 初始化搜索
     */
    function initSearch() {
        const searchInput = document.querySelector('#project-search');
        if (!searchInput) return;

        const debouncedSearch = Utils.debounce((value) => {
            _currentFilters.keyword = value;
            _currentPage = 1;
            loadProjects();
        }, 400);

        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value.trim());
        });

        // 搜索按钮
        const searchBtn = document.querySelector('#project-search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                _currentFilters.keyword = searchInput.value.trim();
                _currentPage = 1;
                loadProjects();
            });
        }

        // 回车搜索
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                _currentFilters.keyword = searchInput.value.trim();
                _currentPage = 1;
                loadProjects();
            }
        });
    }

    // ============================================
    // 筛选功能
    // ============================================

    /**
     * 初始化筛选器
     */
    function initFilters() {
        // 分类筛选
        const categoryFilter = document.querySelector('#filter-category');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                _currentFilters.category = e.target.value;
                _currentPage = 1;
                loadProjects();
            });
        }

        // 排序筛选
        const sortFilter = document.querySelector('#filter-sort');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                _currentFilters.sort = e.target.value;
                _currentPage = 1;
                loadProjects();
            });
        }

        // 标签筛选
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                const isActive = tag.classList.contains('active');

                // 切换激活状态
                document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
                if (!isActive) {
                    tag.classList.add('active');
                    _currentFilters.tag = tag.dataset.tag;
                } else {
                    delete _currentFilters.tag;
                }

                _currentPage = 1;
                loadProjects();
            });
        });

        // 重置筛选
        const resetBtn = document.querySelector('#filter-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                _currentFilters = {};
                _currentPage = 1;

                // 重置UI
                if (categoryFilter) categoryFilter.value = '';
                if (sortFilter) sortFilter.value = '';
                document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));

                loadProjects();
            });
        }
    }

    // ============================================
    // 加载更多
    // ============================================

    /**
     * 初始化加载更多按钮
     */
    function initLoadMore() {
        const btn = document.querySelector('#load-more-projects');
        if (!btn) return;

        btn.addEventListener('click', () => {
            if (_currentPage < _totalPages) {
                _currentPage++;
                loadProjects(true);
            }
        });
    }

    /**
     * 初始化无限滚动
     */
    function initInfiniteScroll(container) {
        if (!container) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && _currentPage < _totalPages && !_isLoading) {
                    _currentPage++;
                    loadProjects(true);
                }
            });
        }, { threshold: 0.1 });

        const sentinel = document.querySelector('#scroll-sentinel');
        if (sentinel) {
            observer.observe(sentinel);
        }
    }

    // ============================================
    // 项目详情
    // ============================================

    /**
     * 加载项目详情
     * @param {string} projectId
     */
    async function loadProjectDetail(projectId) {
        const container = document.querySelector('#project-detail');
        if (!container) return;

        container.innerHTML = '<div class="loading-spinner">加载中...</div>';

        try {
            const response = await API.Projects.detail(projectId);
            const project = response.data || response;

            container.innerHTML = renderProjectDetail(project);
            initProjectDetailActions(project);

        } catch (error) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>加载失败</h3>
                    <p>${error.message || '无法加载项目详情'}</p>
                    <a href="projects.html" class="btn btn-primary">返回列表</a>
                </div>
            `;
        }
    }

    /**
     * 渲染项目详情
     * @param {Object} project
     * @returns {string}
     */
    function renderProjectDetail(project) {
        const coverUrl = project.cover || '/assets/images/default-cover.png';
        const authorName = project.author?.username || project.author_name || '匿名';
        const authorAvatar = project.author?.avatar || '/assets/images/default-avatar.png';

        return `
            <div class="project-detail-header">
                <div class="project-cover-large">
                    <img src="${coverUrl}" alt="${project.title}"
                         onerror="this.src='/assets/images/default-cover.png'">
                </div>
                <div class="project-header-info">
                    <h1 class="project-title">${escapeHtml(project.title)}</h1>
                    <p class="project-desc">${escapeHtml(project.description || '')}</p>
                    <div class="project-tags">
                        ${(project.tags || []).map(tag =>
                            `<span class="tag">${escapeHtml(tag)}</span>`
                        ).join('')}
                    </div>
                    <div class="project-author-info">
                        <img src="${authorAvatar}" alt="${authorName}" class="author-avatar-lg"
                             onerror="this.src='/assets/images/default-avatar.png'">
                        <div class="author-details">
                            <span class="author-name">${escapeHtml(authorName)}</span>
                            <span class="project-date">发布于 ${Utils.formatDate(project.created_at, 'YYYY-MM-DD')}</span>
                        </div>
                    </div>
                    <div class="project-actions">
                        <button class="btn btn-primary btn-download" data-id="${project.id}">
                            下载项目
                        </button>
                        <button class="btn btn-outline btn-favorite-lg ${project.is_favorited ? 'active' : ''}" data-id="${project.id}">
                            ${project.is_favorited ? '★ 已收藏' : '☆ 收藏'}
                        </button>
                        <button class="btn btn-outline btn-share" data-url="${window.location.href}">
                            分享
                        </button>
                    </div>
                </div>
            </div>
            <div class="project-detail-content">
                <div class="project-readme">
                    ${project.readme || project.content || '<p>暂无详细说明</p>'}
                </div>
                ${renderProjectFiles(project.files || [])}
                ${renderProjectStats(project)}
            </div>
        `;
    }

    /**
     * 渲染项目文件列表
     */
    function renderProjectFiles(files) {
        if (!files || files.length === 0) return '';

        return `
            <div class="project-files">
                <h3>项目文件</h3>
                <ul class="file-list">
                    ${files.map(file => `
                        <li class="file-item">
                            <span class="file-icon">📄</span>
                            <span class="file-name">${escapeHtml(file.name)}</span>
                            <span class="file-size">${Utils.formatFileSize(file.size)}</span>
                            <a href="${file.url}" class="file-download" download>下载</a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * 渲染项目统计
     */
    function renderProjectStats(project) {
        return `
            <div class="project-stats-detail">
                <div class="stat-item">
                    <span class="stat-value">${Utils.formatNumber(project.views_count || 0)}</span>
                    <span class="stat-label">浏览</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${Utils.formatNumber(project.favorites_count || 0)}</span>
                    <span class="stat-label">收藏</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${Utils.formatNumber(project.downloads_count || 0)}</span>
                    <span class="stat-label">下载</span>
                </div>
            </div>
        `;
    }

    /**
     * 初始化项目详情操作
     */
    function initProjectDetailActions(project) {
        // 收藏按钮
        const favBtn = document.querySelector('.btn-favorite-lg');
        if (favBtn) {
            favBtn.addEventListener('click', () => {
                toggleFavorite(project.id, favBtn);
            });
        }

        // 下载按钮
        const downloadBtn = document.querySelector('.btn-download');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                downloadProject(project.id);
            });
        }

        // 分享按钮
        const shareBtn = document.querySelector('.btn-share');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                shareProject(project.title);
            });
        }
    }

    // ============================================
    // 收藏功能
    // ============================================

    /**
     * 切换收藏状态
     * @param {string} projectId
     * @param {HTMLElement} btn
     */
    async function toggleFavorite(projectId, btn) {
        if (!Auth.isLoggedIn()) {
            Utils.showToast('请先登录', 'warning');
            setTimeout(() => {
                window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.href)}`;
            }, 1000);
            return;
        }

        const isFavorited = btn.classList.contains('active');

        try {
            if (isFavorited) {
                await API.Projects.unfavorite(projectId);
                btn.classList.remove('active');
                btn.innerHTML = '☆ 收藏';
                Utils.showToast('已取消收藏', 'info');
            } else {
                await API.Projects.favorite(projectId);
                btn.classList.add('active');
                btn.innerHTML = '★ 已收藏';
                Utils.showToast('收藏成功', 'success');
            }

            // 更新收藏计数
            updateFavoriteCount(projectId, !isFavorited);

        } catch (error) {
            Utils.showToast(error.message || '操作失败', 'error');
        }
    }

    /**
     * 更新收藏计数显示
     */
    function updateFavoriteCount(projectId, increment) {
        const card = document.querySelector(`.project-card[data-id="${projectId}"]`);
        if (card) {
            const countEl = card.querySelector('.project-stats span:first-child');
            if (countEl) {
                const current = parseInt(countEl.textContent.replace(/[^\d]/g, '')) || 0;
                const newCount = increment ? current + 1 : Math.max(0, current - 1);
                countEl.textContent = `★ ${newCount}`;
            }
        }
    }

    // ============================================
    // 下载与分享
    // ============================================

    /**
     * 下载项目
     */
    function downloadProject(projectId) {
        if (!Auth.isLoggedIn()) {
            Utils.showToast('请先登录', 'warning');
            return;
        }
        window.open(`/api/projects/${projectId}/download`, '_blank');
    }

    /**
     * 分享项目
     */
    function shareProject(title) {
        const url = window.location.href;

        if (navigator.share) {
            navigator.share({
                title: title,
                url: url
            }).catch(() => {});
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                Utils.showToast('链接已复制到剪贴板', 'success');
            });
        } else {
            Utils.showModal({
                title: '分享链接',
                content: `<input type="text" value="${url}" readonly style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;">`
            });
        }
    }

    // ============================================
    // 创建项目
    // ============================================

    /**
     * 初始化创建项目表单
     * @param {string} formSelector
     */
    function initCreateProjectForm(formSelector = '#create-project-form') {
        const form = document.querySelector(formSelector);
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn.disabled) return;
            submitBtn.disabled = true;

            try {
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                // 处理标签
                const tagsInput = form.querySelector('[name="tags"]');
                if (tagsInput && tagsInput.value) {
                    data.tags = tagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
                }

                const response = await API.Projects.create(data);
                Utils.showToast('项目创建成功！', 'success');

                setTimeout(() => {
                    window.location.href = `project-detail.html?id=${response.id || response.project?.id}`;
                }, 1000);

            } catch (error) {
                Utils.showToast(error.message || '创建失败', 'error');
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // ============================================
    // 辅助函数
    // ============================================

    /**
     * 转义HTML特殊字符
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // 公共API
    // ============================================

    return {
        initProjectList,
        loadProjects,
        loadProjectDetail,
        toggleFavorite,
        initCreateProjectForm,
        renderProjectCard,
        escapeHtml
    };
})();

if (typeof window !== 'undefined') {
    window.Projects = Projects;
}
