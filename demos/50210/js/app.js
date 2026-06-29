/**
 * app.js - 主应用文件
 * 负责应用初始化、全局事件监听、页面路由管理
 */

const App = (() => {
    'use strict';

    const VERSION = '1.0.0';

    // ============================================
    // 应用初始化
    // ============================================

    /**
     * 应用入口
     */
    function init() {
        console.log(`[CircuitOS v${VERSION}] Initializing...`);

        // 初始化认证状态
        Auth.checkAuthState();

        // 初始化全局UI组件
        initMobileMenu();
        initSidebarToggle();
        initBackToTop();
        initLazyLoad();
        initDropdowns();

        // 初始化全局事件
        initGlobalEvents();

        // 初始化页面特定模块
        initPageModules();

        console.log(`[CircuitOS v${VERSION}] Ready`);
    }

    // ============================================
    // 全局事件监听
    // ============================================

    /**
     * 初始化全局事件
     */
    function initGlobalEvents() {
        // 全局点击事件（关闭下拉菜单等）
        document.addEventListener('click', handleGlobalClick);

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllModals();
            }
        });

        // 窗口大小变化
        window.addEventListener('resize', Utils.debounce(handleResize, 250));

        // 页面可见性变化
        document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    /**
     * 全局点击处理
     */
    function handleGlobalClick(e) {
        // 关闭所有下拉菜单
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    }

    /**
     * 窗口大小变化处理
     */
    function handleResize() {
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('is-mobile', isMobile);
    }

    /**
     * 页面可见性变化
     */
    function handleVisibilityChange() {
        if (document.hidden) {
            document.body.classList.add('page-hidden');
        } else {
            document.body.classList.remove('page-hidden');
        }
    }

    // ============================================
    // 页面模块初始化
    // ============================================

    /**
     * 根据页面类型初始化对应模块
     */
    function initPageModules() {
        const page = getPageType();

        switch (page) {
            case 'home':
                initHomePage();
                break;
            case 'projects':
                Projects.initProjectList();
                break;
            case 'project-detail':
                initProjectDetailPage();
                break;
            case 'components':
                Components.initComponentList();
                Components.loadCompareList();
                break;
            case 'discussions':
                Discussions.initDiscussionList();
                break;
            case 'discussion-detail':
                initDiscussionDetailPage();
                break;
            case 'login':
                Auth.initLoginForm();
                break;
            case 'register':
                Auth.initRegisterForm();
                break;
            case 'profile':
                initProfilePage();
                break;
        }
    }

    /**
     * 获取当前页面类型
     */
    function getPageType() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';

        const pageMap = {
            'index.html': 'home',
            '': 'home',
            'projects.html': 'projects',
            'project-detail.html': 'project-detail',
            'components.html': 'components',
            'component-detail.html': 'component-detail',
            'discussions.html': 'discussions',
            'discussion-detail.html': 'discussion-detail',
            'login.html': 'login',
            'register.html': 'register',
            'profile.html': 'profile'
        };

        return pageMap[filename] || 'other';
    }

    // ============================================
    // 页面初始化函数
    // ============================================

    /**
     * 首页初始化
     */
    function initHomePage() {
        loadFeaturedProjects();
        loadRecentDiscussions();
        loadComponentStats();
    }

    /**
     * 加载精选项目
     */
    async function loadFeaturedProjects() {
        const container = document.querySelector('#featured-projects');
        if (!container) return;

        try {
            const response = await API.Projects.list({ featured: true, limit: 6 });
            const projects = response.data || response.projects || [];
            container.innerHTML = projects.map(p => Projects.renderProjectCard(p)).join('');
        } catch {
            container.innerHTML = '<p class="text-center">加载失败</p>';
        }
    }

    /**
     * 加载最新讨论
     */
    async function loadRecentDiscussions() {
        const container = document.querySelector('#recent-discussions');
        if (!container) return;

        try {
            const response = await API.Discussions.posts({ limit: 5, sort: 'latest' });
            const posts = response.data || response.posts || [];
            container.innerHTML = posts.map(p => Discussions.renderPostCard(p)).join('');
        } catch {
            container.innerHTML = '<p class="text-center">加载失败</p>';
        }
    }

    /**
     * 加载组件统计
     */
    async function loadComponentStats() {
        const container = document.querySelector('#component-stats');
        if (!container) return;

        try {
            const response = await API.Components.list({ limit: 8, sort: 'popular' });
            const components = response.data || response.components || [];
            container.innerHTML = components.map(c => `
                <div class="stat-card">
                    <h4>${c.name}</h4>
                    <p>${c.category_name || ''}</p>
                </div>
            `).join('');
        } catch {
            // 静默失败
        }
    }

    /**
     * 项目详情页初始化
     */
    function initProjectDetailPage() {
        const projectId = Utils.getQueryParam('id');
        if (projectId) {
            Projects.loadProjectDetail(projectId);
        }
    }

    /**
     * 讨论详情页初始化
     */
    function initDiscussionDetailPage() {
        const postId = Utils.getQueryParam('id');
        if (postId) {
            Discussions.loadPostDetail(postId);
            Discussions.initCommentForm(postId);
        }
    }

    /**
     * 个人中心页初始化
     */
    function initProfilePage() {
        if (!Auth.isLoggedIn()) {
            window.location.href = '/login.html?redirect=/profile.html';
            return;
        }
        loadUserProfile();
    }

    /**
     * 加载用户资料
     */
    async function loadUserProfile() {
        const container = document.querySelector('#profile-content');
        if (!container) return;

        try {
            const response = await API.Auth.profile();
            const user = response.user || response;
            renderProfile(user);
        } catch (error) {
            container.innerHTML = '<p class="error-text">加载用户信息失败</p>';
        }
    }

    /**
     * 渲染用户资料
     */
    function renderProfile(user) {
        const container = document.querySelector('#profile-content');
        if (!container) return;

        container.innerHTML = `
            <div class="profile-card">
                <div class="profile-avatar">
                    <img src="${user.avatar || '/assets/images/default-avatar.png'}" alt="${user.username}"
                         onerror="this.src='/assets/images/default-avatar.png'">
                </div>
                <div class="profile-info">
                    <h2>${escapeHtml(user.username)}</h2>
                    <p>${escapeHtml(user.email || '')}</p>
                    <p class="bio">${escapeHtml(user.bio || '这个人很懒，什么都没写')}</p>
                    <div class="profile-stats">
                        <span>项目: ${user.projects_count || 0}</span>
                        <span>收藏: ${user.favorites_count || 0}</span>
                        <span>评论: ${user.comments_count || 0}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // UI组件
    // ============================================

    /**
     * 初始化移动端菜单
     */
    function initMobileMenu() {
        const menuToggle = document.querySelector('#mobile-menu-toggle');
        const mobileMenu = document.querySelector('#mobile-menu');

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('open');
                menuToggle.classList.toggle('active');
                document.body.classList.toggle('menu-open');
            });
        }
    }

    /**
     * 初始化侧边栏切换
     */
    function initSidebarToggle() {
        const sidebarToggle = document.querySelector('#sidebar-toggle');
        const sidebar = document.querySelector('#sidebar');

        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                document.body.classList.toggle('sidebar-collapsed');
                Utils.Storage.set('sidebar_collapsed', sidebar.classList.contains('collapsed'));
            });

            // 恢复侧边栏状态
            if (Utils.Storage.get('sidebar_collapsed')) {
                sidebar.classList.add('collapsed');
                document.body.classList.add('sidebar-collapsed');
            }
        }
    }

    /**
     * 初始化返回顶部按钮
     */
    function initBackToTop() {
        const btn = document.querySelector('#back-to-top');
        if (!btn) return;

        window.addEventListener('scroll', Utils.throttle(() => {
            btn.classList.toggle('visible', window.scrollY > 300);
        }, 100));

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /**
     * 初始化图片懒加载
     */
    function initLazyLoad() {
        const images = document.querySelectorAll('img[data-src]');
        if (images.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '100px' });

        images.forEach(img => observer.observe(img));
    }

    /**
     * 初始化下拉菜单
     */
    function initDropdowns() {
        document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const menu = toggle.nextElementSibling;
                if (menu && menu.classList.contains('dropdown-menu')) {
                    // 关闭其他下拉菜单
                    document.querySelectorAll('.dropdown-menu.show').forEach(m => {
                        if (m !== menu) m.classList.remove('show');
                    });
                    menu.classList.toggle('show');
                }
            });
        });
    }

    /**
     * 关闭所有模态框
     */
    function closeAllModals() {
        document.querySelectorAll('.modal.show').forEach(modal => {
            modal.classList.remove('show');
        });
        document.body.classList.remove('modal-open');
    }

    // ============================================
    // 工具函数
    // ============================================

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================
    // API 公共接口
    // ============================================

    return {
        init,
        version: VERSION
    };
})();

// ============================================
// 应用启动
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

if (typeof window !== 'undefined') {
    window.App = App;
}
