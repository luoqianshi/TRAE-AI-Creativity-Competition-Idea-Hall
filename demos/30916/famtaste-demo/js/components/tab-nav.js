/**
 * FamTaste Demo - 底部 Tab 导航组件
 * 设计文档引用: competition-design.md §5.1 底部 Tab 导航栏 + §7.3 组件规范
 *
 * 提供底部固定导航栏的渲染和交互逻辑
 * 支持自动监听路由变化更新激活状态
 */

(() => {
	// ============================================================
	// 私有配置
	// ============================================================

	/**
	 * Tab 导航配置
	 * @type {Array<{id: string, icon: string, label: string, path: string}>}
	 */
	const TABS = [
		{ id: "home", icon: "\u{1F3E0}", label: "首页", path: "#/" },
		{ id: "recipes", icon: "\u{1F4D6}", label: "味道档案", path: "#/recipes" },
		{
			id: "replica",
			icon: "\u{1F52C}",
			label: "复刻实验室",
			path: "#/replica",
		},
		{
			id: "meal-plan",
			icon: "\u{1F37D}\u{FE0F}",
			label: "今日吃什么",
			path: "#/meal-plan",
		},
	];

	/** @type {HTMLElement|null} 缓存的 tab bar DOM 引用 */
	let tabBarElement = null;

	// ============================================================
	// 私有工具函数
	// ============================================================

	/**
	 * 根据当前 hash 路径判断应该激活的 tab ID
	 *
	 * @param {string} hash - 当前 URL hash（如 '#/recipes'）
	 * @returns {string} 应该激活的 tab ID
	 */
	function getActiveTabId(hash) {
		const normalizedHash = hash || "#/";

		// 精确匹配优先
		for (const tab of TABS) {
			if (normalizedHash === tab.path) {
				return tab.id;
			}
		}

		// 前缀匹配（处理子路由如 #/recipes/r001）
		for (const tab of TABS) {
			if (tab.path !== "#/" && normalizedHash.startsWith(tab.path + "/")) {
				return tab.id;
			}
		}

		// 默认返回首页
		return "home";
	}

	/**
	 * 更新 DOM 中所有 tab 的激活状态
	 *
	 * @param {string} activeId - 应该激活的 tab ID
	 */
	function updateActiveState(activeId) {
		if (!tabBarElement) return;

		// 移除所有 tab-active 类
		const allTabs = tabBarElement.querySelectorAll(".tab-item");
		allTabs.forEach((tab) => {
			tab.classList.remove("tab-active");
		});

		// 添加新的 active 类
		const activeTab = tabBarElement.querySelector(`[data-tab="${activeId}"]`);
		if (activeTab) {
			activeTab.classList.add("tab-active");
		}
	}

	/**
	 * 处理 tab 点击事件
	 * 调用 Router.navigate() 进行 JS 导航
	 *
	 * @param {Event} event - 点击事件对象
	 * @param {string} path - 目标路径
	 */
	function handleTabClick(event, path) {
		event.preventDefault();

		// 调用路由器导航
		if (
			window.FamTaste &&
			window.FamTaste.Router &&
			window.FamTaste.Router.navigate
		) {
			window.FamTaste.Router.navigate(path);
		} else {
			console.warn("[FamTaste TabNav] Router 未就绪，使用原生链接跳转");
			window.location.hash = path;
		}
	}

	// ============================================================
	// 公共 API
	// ============================================================

	/**
	 * 渲染底部 Tab 导航栏 HTML
	 *
	 * @param {string} activeRoute - 当前激活的路由名称（如 'home', 'recipes'）
	 * @returns {string} 导航栏 HTML 字符串
	 *
	 * @example
	 * // 在首页时
	 * const html = TabNav.renderTabBar('home');
	 * document.getElementById('tab-bar-container').innerHTML = html;
	 *
	 * // 在食谱页时
	 * const html = TabNav.renderTabBar('recipes');
	 */
	function renderTabBar(activeRoute) {
		const tabsHtml = TABS.map((tab) => {
			const isActive = tab.id === activeRoute ? " tab-active" : "";

			return `
        <a class="tab-item${isActive}" href="${tab.path}" data-tab="${tab.id}">
          <span class="tab-icon">${tab.icon}</span>
          <span class="tab-label">${tab.label}</span>
        </a>
      `;
		}).join("");

		return `<nav class="tab-bar">${tabsHtml}</nav>`;
	}

	/**
	 * 初始化 Tab Bar：绑定点击事件和 hashchange 监听
	 * 应在 DOM 渲染后调用
	 *
	 * @example
	 * // 先渲染到 DOM
	 * document.getElementById('tab-bar-container').innerHTML = TabNav.renderTabBar('home');
	 * // 再初始化交互
	 * TabNav.initTabBar();
	 */
	function initTabBar() {
		// 查找或缓存 tab bar 元素
		tabBarElement = document.querySelector(".tab-bar");

		if (!tabBarElement) {
			console.warn(
				"[FamTaste TabNav] 未找到 .tab-bar 元素，请先调用 renderTabBar()",
			);
			return;
		}

		// 绑定每个 tab 的点击事件
		const tabs = tabBarElement.querySelectorAll(".tab-item");
		tabs.forEach((tab) => {
			const tabId = tab.getAttribute("data-tab");
			const tabConfig = TABS.find((t) => t.id === tabId);

			if (tabConfig) {
				tab.addEventListener("click", (e) => handleTabClick(e, tabConfig.path));
			}
		});

		// 监听 hash 变化，自动更新激活状态
		window.addEventListener("hashchange", () => {
			const currentHash = window.location.hash || "#/";
			const activeId = getActiveTabId(currentHash);
			updateActiveState(activeId);
		});

		console.log("[FamTaste TabNav] 初始化完成");
	}

	/**
	 * 手动更新激活状态（供外部调用）
	 *
	 * @param {string} activeRoute - 新的激活路由名称
	 */
	function setActiveTab(activeRoute) {
		updateActiveState(activeRoute);
	}

	/**
	 * 获取 Tab 配置列表（用于调试或扩展）
	 *
	 * @returns {Array<{id: string, icon: string, label: string, path: string}>}
	 */
	function getTabs() {
		return [...TABS];
	}

	// ============================================================
	// 初始化：挂载到全局命名空间
	// ============================================================

	window.FamTaste = window.FamTaste || {};

	window.FamTaste.TabNav = {
		renderTabBar,
		initTabBar,
		setActiveTab,
		getTabs,
	};

	console.log("[FamTaste TabNav] 模块已加载");
})();
