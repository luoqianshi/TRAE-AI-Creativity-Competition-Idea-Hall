/**
 * discussions.js - 讨论区模块
 * 处理帖子列表、发帖、评论、点赞功能
 */

const Discussions = (() => {
    'use strict';

    let _currentPage = 1;
    let _totalPages = 1;
    let _pageSize = 20;
    let _currentFilters = {};
    let _isLoading = false;

    // ============================================
    // 初始化
    // ============================================

    /**
     * 初始化讨论区列表页面
     * @param {string} containerSelector
     */
    function initDiscussionList(containerSelector = '#discussion-list') {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        initSearch();
        initFilters();
        initLoadMore();
        loadPosts();
    }

    /**
     * 加载帖子列表
     * @param {boolean} append
     */
    async function loadPosts(append = false) {
        if (_isLoading) return;
        _isLoading = true;

        const container = document.querySelector('#discussion-list');
        const loadingEl = document.querySelector('#discussions-loading');
        const emptyEl = document.querySelector('#discussions-empty');

        if (loadingEl) loadingEl.style.display = 'flex';
        if (emptyEl) emptyEl.style.display = 'none';

        try {
            const params = {
                page: _currentPage,
                limit: _pageSize,
                ..._currentFilters
            };

            const response = await API.Discussions.posts(params);
            const posts = response.data || response.posts || [];
            _totalPages = response.totalPages || response.total_pages || 1;

            if (!append && container) {
                container.innerHTML = '';
            }

            if (posts.length === 0 && !append) {
                if (emptyEl) emptyEl.style.display = 'flex';
                return;
            }

            const html = posts.map(post => renderPostCard(post)).join('');

            if (container) {
                container.insertAdjacentHTML('beforeend', html);
            }

            bindPostEvents();

        } catch (error) {
            Utils.showToast(error.message || '加载帖子列表失败', 'error');
        } finally {
            _isLoading = false;
            if (loadingEl) loadingEl.style.display = 'none';
        }
    }

    /**
     * 渲染帖子卡片
     * @param {Object} post
     * @returns {string}
     */
    function renderPostCard(post) {
        const authorName = post.author?.username || post.author_name || '匿名';
        const authorAvatar = post.author?.avatar || '/assets/images/default-avatar.png';
        const timeAgo = Utils.timeAgo(post.created_at);

        return `
            <div class="discussion-card" data-id="${post.id}">
                <div class="post-author">
                    <img src="${authorAvatar}" alt="${authorName}" class="author-avatar"
                         onerror="this.src='/assets/images/default-avatar.png'">
                    <div class="author-info">
                        <span class="author-name">${escapeHtml(authorName)}</span>
                        <span class="post-time">${timeAgo}</span>
                    </div>
                </div>
                <div class="post-content">
                    <h3 class="post-title">
                        ${post.is_pinned ? '<span class="badge-pin">置顶</span>' : ''}
                        ${post.is_solved ? '<span class="badge-solved">已解决</span>' : ''}
                        <a href="discussion-detail.html?id=${post.id}">${escapeHtml(post.title)}</a>
                    </h3>
                    <p class="post-excerpt">${escapeHtml(post.excerpt || post.content || '').substring(0, 200)}</p>
                    <div class="post-tags">
                        ${(post.tags || []).map(tag =>
                            `<span class="tag">${escapeHtml(tag)}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="post-footer">
                    <div class="post-stats">
                        <button class="btn-like ${post.is_liked ? 'active' : ''}" data-id="${post.id}" title="点赞">
                            ${post.is_liked ? '❤️' : '🤍'} ${post.likes_count || 0}
                        </button>
                        <span class="stat-item" title="评论">
                            💬 ${post.comments_count || 0}
                        </span>
                        <span class="stat-item" title="浏览">
                            👁 ${post.views_count || 0}
                        </span>
                    </div>
                    <div class="post-category">
                        ${post.category ? `<span class="category-tag">${escapeHtml(post.category)}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 绑定帖子事件
     */
    function bindPostEvents() {
        document.querySelectorAll('.btn-like').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleLike(btn.dataset.id, btn);
            });
        });
    }

    // ============================================
    // 搜索功能
    // ============================================

    /**
     * 初始化搜索
     */
    function initSearch() {
        const searchInput = document.querySelector('#discussion-search');
        if (!searchInput) return;

        searchInput.addEventListener('input', Utils.debounce((e) => {
            _currentFilters.keyword = e.target.value.trim();
            _currentPage = 1;
            loadPosts();
        }, 400));

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                _currentFilters.keyword = e.target.value.trim();
                _currentPage = 1;
                loadPosts();
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
        const categoryFilter = document.querySelector('#discussion-filter-category');
        if (categoryFilter) {
            loadCategories();
            categoryFilter.addEventListener('change', (e) => {
                _currentFilters.category = e.target.value;
                _currentPage = 1;
                loadPosts();
            });
        }

        // 排序筛选
        const sortFilter = document.querySelector('#discussion-filter-sort');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                _currentFilters.sort = e.target.value;
                _currentPage = 1;
                loadPosts();
            });
        }

        // 只看未解决
        const unsolvedFilter = document.querySelector('#discussion-filter-unsolved');
        if (unsolvedFilter) {
            unsolvedFilter.addEventListener('change', (e) => {
                _currentFilters.unsolved = e.target.checked;
                _currentPage = 1;
                loadPosts();
            });
        }
    }

    /**
     * 加载分类列表
     */
    async function loadCategories() {
        try {
            const response = await API.Discussions.categories();
            const categories = response.data || response.categories || [];
            const select = document.querySelector('#discussion-filter-category');
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

    // ============================================
    // 加载更多
    // ============================================

    function initLoadMore() {
        const btn = document.querySelector('#load-more-discussions');
        if (!btn) return;

        btn.addEventListener('click', () => {
            if (_currentPage < _totalPages) {
                _currentPage++;
                loadPosts(true);
            }
        });
    }

    // ============================================
    // 发帖功能
    // ============================================

    /**
     * 初始化发帖表单
     * @param {string} formSelector
     */
    function initCreatePostForm(formSelector = '#create-post-form') {
        const form = document.querySelector(formSelector);
        if (!form) return;

        // 标签输入
        initTagInput(form);

        // 内容编辑器（简单文本框）
        const contentInput = form.querySelector('[name="content"]');
        if (contentInput) {
            initSimpleToolbar(form, contentInput);
        }

        // 预览功能
        const previewBtn = form.querySelector('#preview-btn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                togglePreview(form);
            });
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn.disabled) return;
            submitBtn.disabled = true;
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '发布中...';

            try {
                const data = collectPostFormData(form);

                // 验证
                if (!data.title.trim()) {
                    Utils.showToast('请输入标题', 'warning');
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    return;
                }
                if (!data.content.trim()) {
                    Utils.showToast('请输入内容', 'warning');
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                    return;
                }

                const response = await API.Discussions.createPost(data);
                Utils.showToast('帖子发布成功！', 'success');

                setTimeout(() => {
                    window.location.href = `discussion-detail.html?id=${response.id || response.post?.id}`;
                }, 1000);

            } catch (error) {
                Utils.showToast(error.message || '发布失败', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    /**
     * 收集帖子表单数据
     */
    function collectPostFormData(form) {
        const data = {
            title: form.querySelector('[name="title"]')?.value?.trim() || '',
            content: form.querySelector('[name="content"]')?.value?.trim() || '',
            category: form.querySelector('[name="category"]')?.value || ''
        };

        // 收集标签
        const tagsContainer = form.querySelector('.tags-container');
        if (tagsContainer) {
            data.tags = Array.from(tagsContainer.querySelectorAll('.tag-item'))
                .map(el => el.dataset.tag)
                .filter(Boolean);
        }

        return data;
    }

    /**
     * 初始化标签输入
     */
    function initTagInput(form) {
        const input = form.querySelector('#tag-input');
        const container = form.querySelector('.tags-container');
        if (!input || !container) return;

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const value = input.value.trim().replace(',', '');
                if (value && !container.querySelector(`[data-tag="${value}"]`)) {
                    addTag(container, value);
                    input.value = '';
                }
            }
            if (e.key === 'Backspace' && !input.value) {
                const tags = container.querySelectorAll('.tag-item');
                if (tags.length > 0) {
                    tags[tags.length - 1].remove();
                }
            }
        });

        // 点击容器聚焦输入
        container.addEventListener('click', () => input.focus());
    }

    /**
     * 添加标签
     */
    function addTag(container, tag) {
        const el = document.createElement('span');
        el.className = 'tag-item';
        el.dataset.tag = tag;
        el.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            background: #e0e7ff;
            color: #4338ca;
            border-radius: 4px;
            font-size: 13px;
        `;
        el.innerHTML = `${escapeHtml(tag)} <span class="tag-remove" style="cursor:pointer;margin-left:2px;">×</span>`;

        el.querySelector('.tag-remove').addEventListener('click', () => {
            el.remove();
        });

        // 插入到输入框前面
        container.insertBefore(el, container.querySelector('input'));
    }

    /**
     * 初始化简单工具栏
     */
    function initSimpleToolbar(form, textarea) {
        const toolbar = form.querySelector('.editor-toolbar');
        if (!toolbar) return;

        const actions = {
            'bold': '**',
            'italic': '*',
            'code': '`',
            'link': '[](url)'
        };

        toolbar.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const wrapper = actions[action];
                if (!wrapper) return;

                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const selected = textarea.value.substring(start, end);

                if (action === 'link') {
                    const text = selected || '链接文本';
                    textarea.value = textarea.value.substring(0, start) + `[${text}](url)` + textarea.value.substring(end);
                } else {
                    textarea.value = textarea.value.substring(0, start) + wrapper + selected + wrapper + textarea.value.substring(end);
                }

                textarea.focus();
            });
        });
    }

    /**
     * 切换预览
     */
    function togglePreview(form) {
        const contentInput = form.querySelector('[name="content"]');
        const previewEl = form.querySelector('#content-preview');
        const previewBtn = form.querySelector('#preview-btn');

        if (!contentInput || !previewEl) return;

        const isPreview = previewEl.style.display !== 'none';

        if (isPreview) {
            previewEl.style.display = 'none';
            contentInput.style.display = '';
            previewBtn.textContent = '预览';
        } else {
            previewEl.innerHTML = renderMarkdown(contentInput.value);
            previewEl.style.display = 'block';
            contentInput.style.display = 'none';
            previewBtn.textContent = '编辑';
        }
    }

    /**
     * 简单的Markdown渲染
     */
    function renderMarkdown(text) {
        if (!text) return '';
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
            .replace(/\n/g, '<br>');
    }

    // ============================================
    // 帖子详情与评论
    // ============================================

    /**
     * 加载帖子详情
     * @param {string} postId
     */
    async function loadPostDetail(postId) {
        const container = document.querySelector('#post-detail');
        if (!container) return;

        container.innerHTML = '<div class="loading-spinner">加载中...</div>';

        try {
            const response = await API.Discussions.postDetail(postId);
            const post = response.data || response;

            container.innerHTML = renderPostDetail(post);
            initPostDetailActions(post);

            // 加载评论
            loadComments(postId);

        } catch (error) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>加载失败</h3>
                    <p>${error.message || '无法加载帖子详情'}</p>
                    <a href="discussions.html" class="btn btn-primary">返回列表</a>
                </div>
            `;
        }
    }

    /**
     * 渲染帖子详情
     */
    function renderPostDetail(post) {
        const authorName = post.author?.username || post.author_name || '匿名';
        const authorAvatar = post.author?.avatar || '/assets/images/default-avatar.png';

        return `
            <article class="post-detail">
                <header class="post-header">
                    <div class="post-meta-top">
                        ${post.is_pinned ? '<span class="badge-pin">置顶</span>' : ''}
                        ${post.is_solved ? '<span class="badge-solved">已解决</span>' : ''}
                        ${post.category ? `<span class="category-tag">${escapeHtml(post.category)}</span>` : ''}
                    </div>
                    <h1 class="post-title">${escapeHtml(post.title)}</h1>
                    <div class="post-author-info">
                        <img src="${authorAvatar}" alt="${authorName}" class="author-avatar-lg"
                             onerror="this.src='/assets/images/default-avatar.png'">
                        <div class="author-details">
                            <span class="author-name">${escapeHtml(authorName)}</span>
                            <span class="post-time">${Utils.formatDate(post.created_at, 'YYYY-MM-DD HH:mm')}</span>
                        </div>
                    </div>
                </header>
                <div class="post-body">
                    ${renderMarkdown(post.content || '')}
                </div>
                <footer class="post-footer-detail">
                    <div class="post-tags">
                        ${(post.tags || []).map(tag =>
                            `<span class="tag">${escapeHtml(tag)}</span>`
                        ).join('')}
                    </div>
                    <div class="post-actions">
                        <button class="btn btn-outline btn-like-detail ${post.is_liked ? 'active' : ''}" data-id="${post.id}">
                            ${post.is_liked ? '❤️' : '🤍'} <span class="likes-count">${post.likes_count || 0}</span>
                        </button>
                        ${Auth.isLoggedIn() && Auth.getCurrentUser()?.id === (post.author?.id || post.author_id) ? `
                            <button class="btn btn-outline btn-mark-solved" data-id="${post.id}">
                                ${post.is_solved ? '取消已解决' : '标记已解决'}
                            </button>
                        ` : ''}
                    </div>
                </footer>
            </article>
        `;
    }

    /**
     * 初始化帖子详情操作
     */
    function initPostDetailActions(post) {
        // 点赞按钮
        const likeBtn = document.querySelector('.btn-like-detail');
        if (likeBtn) {
            likeBtn.addEventListener('click', () => {
                toggleLike(post.id, likeBtn, true);
            });
        }

        // 标记已解决按钮
        const solvedBtn = document.querySelector('.btn-mark-solved');
        if (solvedBtn) {
            solvedBtn.addEventListener('click', () => {
                toggleSolved(post.id);
            });
        }
    }

    // ============================================
    // 评论功能
    // ============================================

    /**
     * 加载评论列表
     * @param {string} postId
     */
    async function loadComments(postId) {
        const container = document.querySelector('#comments-list');
        if (!container) return;

        try {
            const response = await API.Discussions.comments(postId);
            const comments = response.data || response.comments || [];

            if (comments.length === 0) {
                container.innerHTML = '<p class="no-comments">暂无评论，快来发表第一条评论吧！</p>';
                return;
            }

            container.innerHTML = comments.map(comment => renderComment(comment)).join('');

            // 绑定评论事件
            container.querySelectorAll('.btn-reply').forEach(btn => {
                btn.addEventListener('click', () => {
                    const commentId = btn.dataset.id;
                    const authorName = btn.dataset.author;
                    focusCommentForm(`@${authorName} `);
                });
            });

            container.querySelectorAll('.btn-like-comment').forEach(btn => {
                btn.addEventListener('click', () => {
                    toggleCommentLike(btn.dataset.id, btn);
                });
            });

        } catch (error) {
            container.innerHTML = `<p class="error-text">加载评论失败: ${error.message}</p>`;
        }
    }

    /**
     * 渲染评论
     */
    function renderComment(comment) {
        const authorName = comment.author?.username || comment.author_name || '匿名';
        const authorAvatar = comment.author?.avatar || '/assets/images/default-avatar.png';

        return `
            <div class="comment-item" data-id="${comment.id}">
                <div class="comment-avatar">
                    <img src="${authorAvatar}" alt="${authorName}"
                         onerror="this.src='/assets/images/default-avatar.png'">
                </div>
                <div class="comment-body">
                    <div class="comment-header">
                        <span class="comment-author">${escapeHtml(authorName)}</span>
                        <span class="comment-time">${Utils.timeAgo(comment.created_at)}</span>
                    </div>
                    <div class="comment-content">
                        ${renderMarkdown(comment.content || '')}
                    </div>
                    <div class="comment-actions">
                        <button class="btn-like-comment ${comment.is_liked ? 'active' : ''}" data-id="${comment.id}">
                            ${comment.is_liked ? '❤️' : '🤍'} ${comment.likes_count || 0}
                        </button>
                        <button class="btn-reply" data-id="${comment.id}" data-author="${escapeHtml(authorName)}">
                            回复
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 初始化评论表单
     * @param {string} postId
     */
    function initCommentForm(postId) {
        const form = document.querySelector('#comment-form');
        if (!form) return;

        const textarea = form.querySelector('[name="content"]');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!Auth.isLoggedIn()) {
                Utils.showToast('请先登录', 'warning');
                return;
            }

            const content = textarea?.value?.trim();
            if (!content) {
                Utils.showToast('请输入评论内容', 'warning');
                return;
            }

            const submitBtn = form.querySelector('[type="submit"]');
            if (submitBtn.disabled) return;
            submitBtn.disabled = true;

            try {
                await API.Discussions.addComment(postId, { content });
                Utils.showToast('评论成功！', 'success');

                textarea.value = '';
                loadComments(postId);

                // 更新评论计数
                const countEl = document.querySelector('.comments-count');
                if (countEl) {
                    countEl.textContent = parseInt(countEl.textContent || 0) + 1;
                }

            } catch (error) {
                Utils.showToast(error.message || '评论失败', 'error');
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    /**
     * 聚焦评论输入框
     */
    function focusCommentForm(prefix = '') {
        const textarea = document.querySelector('#comment-form [name="content"]');
        if (textarea) {
            textarea.value = prefix;
            textarea.focus();
            textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // ============================================
    // 点赞功能
    // ============================================

    /**
     * 切换帖子点赞
     */
    async function toggleLike(postId, btn, isDetail = false) {
        if (!Auth.isLoggedIn()) {
            Utils.showToast('请先点赞', 'warning');
            return;
        }

        const isLiked = btn.classList.contains('active');

        try {
            if (isLiked) {
                await API.Discussions.unlike(postId);
                btn.classList.remove('active');
            } else {
                await API.Discussions.like(postId);
                btn.classList.add('active');
            }

            // 更新计数
            const countEl = btn.querySelector('.likes-count') || btn;
            const currentText = countEl.textContent;
            const currentCount = parseInt(currentText.replace(/[^\d]/g, '')) || 0;
            const newCount = isLiked ? currentCount - 1 : currentCount + 1;

            if (btn.querySelector('.likes-count')) {
                btn.querySelector('.likes-count').textContent = newCount;
            } else {
                const emoji = isLiked ? '🤍' : '❤️';
                btn.innerHTML = `${emoji} ${newCount}`;
            }

        } catch (error) {
            Utils.showToast(error.message || '操作失败', 'error');
        }
    }

    /**
     * 切换评论点赞
     */
    async function toggleCommentLike(commentId, btn) {
        if (!Auth.isLoggedIn()) {
            Utils.showToast('请先登录', 'warning');
            return;
        }

        const isLiked = btn.classList.contains('active');

        try {
            // 使用通用的点赞接口
            if (isLiked) {
                await API.post(`/comments/${commentId}/unlike`);
                btn.classList.remove('active');
            } else {
                await API.post(`/comments/${commentId}/like`);
                btn.classList.add('active');
            }

            const currentCount = parseInt(btn.textContent.replace(/[^\d]/g, '')) || 0;
            const newCount = isLiked ? currentCount - 1 : currentCount + 1;
            const emoji = isLiked ? '🤍' : '❤️';
            btn.innerHTML = `${emoji} ${newCount}`;

        } catch (error) {
            Utils.showToast(error.message || '操作失败', 'error');
        }
    }

    /**
     * 切换已解决状态
     */
    async function toggleSolved(postId) {
        try {
            const post = await API.Discussions.postDetail(postId);
            const data = post.data || post;
            await API.Discussions.updatePost(postId, { is_solved: !data.is_solved });
            Utils.showToast(data.is_solved ? '已取消标记' : '已标记为已解决', 'success');
            loadPostDetail(postId);
        } catch (error) {
            Utils.showToast(error.message || '操作失败', 'error');
        }
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

    // ============================================
    // 公共API
    // ============================================

    return {
        initDiscussionList,
        loadPosts,
        loadPostDetail,
        loadComments,
        initCreatePostForm,
        initCommentForm,
        toggleLike,
        renderPostCard,
        renderMarkdown
    };
})();

if (typeof window !== 'undefined') {
    window.Discussions = Discussions;
}
