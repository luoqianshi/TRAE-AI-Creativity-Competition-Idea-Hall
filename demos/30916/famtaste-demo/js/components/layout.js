/**
 * Layout — 公共布局注入器（v2.0 新增）
 *
 * 设计文档引用: docs/design.md §5.4 公共布局注入器
 *
 * 为所有 HTML 页面提供统一的顶部导航（PC 端浮动玻璃胶囊风格）
 * 和底部 Tab Bar（移动端固定底部）。每个 HTML 文件只需引入 layout.js
 * 并调用 Layout.injectAll() 即可，无需重复写导航代码。
 *
 * 用法：
 *   // 方式一：自动注入（推荐）
 *   //   layout.js 内部监听 DOMContentLoaded，自动调用 injectAll()
 *   //   HTML 只需引入 layout.js 即可，无需额外代码
 *   //   当前页面通过 URL 自动识别
 *
 *   // 方式二：手动调用（显式指定 activePage）
 *   //   适用于 URL 无法自动识别当前页面的场景
 *   Layout.injectAll('home');          // 注入顶部导航 + 底部 Tab Bar + 回到顶部按钮
 *   Layout.injectNav('home');          // 仅注入顶部导航
 *   Layout.injectTabBar('home');       // 仅注入底部 Tab Bar
 *   Layout.injectBackToTop();          // 仅注入回到顶部按钮
 *   Layout.getCurrentPage();           // 获取当前页面文件名
 *
 * 依赖：
 *   - window.FamTaste.Icons（必须在 layout.js 之前加载）
 *
 * 响应式策略：
 *   - PC 端（≥1024px）：显示顶部浮动玻璃导航，隐藏底部 Tab Bar
 *   - 移动端（<1024px）：隐藏顶部导航，显示底部 Tab Bar
 *   - 当前页面对应的导航项自动高亮（.nav-link-active / .tab-item-active）
 *   - 导航使用标准 <a href> 跳转（非 SPA 路由）
 *   - 回到顶部按钮在滚动 >300px 后出现，PC 端和移动端均可见
 */

window.FamTaste = window.FamTaste || {};

window.FamTaste.Layout = (() => {
	// ============================================================
	// 页面配置
	// ============================================================

	/**
	 * 顶部导航 + 底部 Tab Bar 共享的页面列表
	 * @type {Array<{id: string, label: string, href: string, icon: string}>}
	 */
	const PAGES = [
		{ id: "home", label: "首页", href: "home.html", icon: "home" },
		{ id: "recipes", label: "味道档案", href: "recipes.html", icon: "archive" },
		{ id: "replica", label: "复刻实验室", href: "replica.html", icon: "lab" },
		{
			id: "mealplan",
			label: "今日吃什么",
			href: "mealplan.html",
			icon: "meal",
		},
	];

	// 回到顶部按钮的滚动阈值（px）
	const BACK_TO_TOP_THRESHOLD = 300;

	// ============================================================
	// 私有工具函数
	// ============================================================

	/**
	 * 获取当前页面对应的文件名
	 * 用于自动判断当前激活的导航项
	 *
	 * @returns {string} 当前页面文件名（如 'home.html'），默认 'home.html'
	 *
	 * @example
	 *   // URL: http://localhost:3000/recipes.html
	 *   Layout.getCurrentPage(); // → 'recipes.html'
	 */
	function getCurrentPage() {
		const path = window.location.pathname;
		const filename = path.substring(path.lastIndexOf("/") + 1) || "home.html";
		return filename;
	}

	/**
	 * 根据 activePage 参数或当前 URL 解析出激活的页面 id
	 *
	 * @param {string|undefined} activePage - 显式指定的页面 id（如 'home'）
	 * @returns {string} 激活的页面 id（如 'home'），未匹配时返回空字符串
	 */
	function resolveActivePageId(activePage) {
		// 显式指定优先
		if (typeof activePage === "string" && activePage) {
			return PAGES.some((p) => p.id === activePage) ? activePage : "";
		}
		// 自动识别：通过当前 URL 文件名匹配
		const currentFile = getCurrentPage();
		const matched = PAGES.find((p) => p.href === currentFile);
		return matched ? matched.id : "";
	}

	/**
	 * 获取图标 SVG 字符串
	 * 若 Icons 模块未加载则返回空字符串（降级处理，避免页面崩溃）
	 *
	 * @param {string} name - 图标名称
	 * @param {number} size - 图标尺寸（px）
	 * @returns {string} SVG 字符串或空字符串
	 */
	function getIcon(name, size) {
		if (
			window.FamTaste.Icons &&
			typeof window.FamTaste.Icons.get === "function"
		) {
			return window.FamTaste.Icons.get(name, { size });
		}
		return "";
	}

	// ============================================================
	// 公共 API
	// ============================================================

	/**
	 * 注入 PC 端顶部导航栏（浮动玻璃胶囊风格）
	 * - 只在 ≥1024px 显示（由 CSS 控制）
	 * - 当前页面对应的导航项添加 .nav-link-active 类
	 * - 使用标准 <a href> 跳转
	 *
	 * @param {string} [activePage] - 当前页面标识（home/recipes/replica/mealplan）；
	 *   未传则通过当前 URL 自动识别
	 */
	function injectNav(activePage) {
		// 防止重复注入
		const existing = document.querySelector(".nav-top");
		if (existing) existing.remove();

		const activeId = resolveActivePageId(activePage);
		const navHTML = `
      <nav class="nav-top" aria-label="主导航">
        <div class="nav-container">
          <a href="home.html" class="nav-logo">家庭味道</a>
          <div class="nav-links">
            ${PAGES.map((item) => {
							const isActive = item.id === activeId ? " nav-link-active" : "";
							const ariaCurrent = item.id === activeId ? "page" : "false";
							return `
              <a href="${item.href}" class="nav-link${isActive}" aria-current="${ariaCurrent}">
                ${getIcon(item.icon, 18)}
                <span>${item.label}</span>
              </a>
            `;
						}).join("")}
          </div>
        </div>
      </nav>
    `;
		document.body.insertAdjacentHTML("afterbegin", navHTML);
	}

	/**
	 * 注入移动端底部 Tab Bar
	 * - 只在 <1024px 显示（由 CSS 控制）
	 * - 当前页面对应的 Tab 项添加 .tab-item-active 类
	 * - 使用标准 <a href> 跳转
	 *
	 * @param {string} [activePage] - 当前页面标识（home/recipes/replica/mealplan）；
	 *   未传则通过当前 URL 自动识别
	 */
	function injectTabBar(activePage) {
		// 防止重复注入
		const existing = document.querySelector("nav.tab-bar");
		if (existing) existing.remove();

		const activeId = resolveActivePageId(activePage);
		const tabBarHTML = `
      <nav class="tab-bar" aria-label="底部导航">
        ${PAGES.map((item) => {
					const isActive = item.id === activeId ? " tab-item-active" : "";
					const ariaCurrent = item.id === activeId ? "page" : "false";
					return `
          <a href="${item.href}" class="tab-item${isActive}" aria-current="${ariaCurrent}">
            ${getIcon(item.icon, 22)}
            <span class="tab-label">${item.label}</span>
          </a>
        `;
				}).join("")}
      </nav>
    `;
		document.body.insertAdjacentHTML("beforeend", tabBarHTML);
	}

	/**
	 * 注入回到顶部按钮
	 * - 固定在右下角，默认隐藏
	 * - 滚动超过 300px 后显示
	 * - 点击平滑滚动到顶部
	 * - PC 端和移动端均可见（移动端位置上移避开 Tab Bar）
	 */
	function injectBackToTop() {
		// 防止重复注入
		const existing = document.querySelector(".back-to-top");
		if (existing) existing.remove();

		const btnHTML = `
      <button type="button" class="back-to-top" aria-label="回到顶部">
        ${getIcon("back", 20)}
      </button>
    `;
		document.body.insertAdjacentHTML("beforeend", btnHTML);

		const btn = document.querySelector(".back-to-top");
		if (!btn) return;

		// 点击平滑滚动到顶部
		btn.addEventListener("click", () => {
			window.scrollTo({ top: 0, behavior: "smooth" });
		});

		// 滚动时控制显隐
		const onScroll = () => {
			if (window.scrollY > BACK_TO_TOP_THRESHOLD) {
				btn.classList.add("back-to-top-visible");
			} else {
				btn.classList.remove("back-to-top-visible");
			}
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		// 初始化一次状态
		onScroll();
	}

	/**
	 * 注入顶部导航 + 底部 Tab Bar + 回到顶部按钮
	 * body 的 padding-top（PC 端导航高度）和 padding-bottom（移动端 TabBar 高度）
	 * 由 CSS 处理，不需要 JS 设置
	 *
	 * @param {string} [activePage] - 当前页面标识（home/recipes/replica/mealplan）；
	 *   未传则通过当前 URL 自动识别
	 */
	function injectAll(activePage) {
		injectNav(activePage);
		injectTabBar(activePage);
		injectBackToTop();
	}

	// ============================================================
	// 自动注入：监听 DOMContentLoaded
	// ============================================================

	/**
	 * 自动注入逻辑
	 * - 若 DOM 已就绪（document.readyState !== 'loading'），立即注入
	 * - 否则监听 DOMContentLoaded 事件后注入
	 * 这样 HTML 只需引入 layout.js 即可，无需额外调用
	 *
	 * 注意：自动注入时不传 activePage，由 URL 自动识别当前页面
	 */
	function autoInject() {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", () => injectAll());
		} else {
			injectAll();
		}
	}

	// 启动自动注入
	autoInject();

	// ============================================================
	// 公开 API
	// ============================================================
	return {
		injectNav,
		injectTabBar,
		injectBackToTop,
		injectAll,
		getCurrentPage,
		PAGES,
	};
})();
