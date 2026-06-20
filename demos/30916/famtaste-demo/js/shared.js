/**
 * FamTaste Demo V2 - 公共逻辑
 * 设计文档引用: design-v2.md §3.5 动效 / §3.6 页面结构
 *
 * 提供：导航注入 / URL 参数 / 时间格式化 / Toast / 滚动揭示 / 页面进入动画
 *
 * 用法：
 *   window.FamTaste.injectNav('home')
 *   window.FamTaste.injectBottomNav('home')
 *   window.FamTaste.getParam('id')
 *   window.FamTaste.formatTime(45)              // "45 分钟"
 *   window.FamTaste.showToast('保存成功', 'success')
 *   window.FamTaste.observeReveal('.reveal')
 *   window.FamTaste.pageEnter()
 */

(() => {
	// === 导航配置（顶部导航：含鸿蒙场景页）===
	const NAV_ITEMS = [
		{ page: "home", label: "首页", href: "index.html", icon: "home" },
		{ page: "recipes", label: "菜谱", href: "recipes.html", icon: "book" },
		{ page: "kitchen", label: "厨房", href: "kitchen.html", icon: "fire" },
		{ page: "shopping", label: "买菜", href: "shopping.html", icon: "leaf" },
		{
			page: "replica",
			label: "复刻",
			href: "replica.html",
			icon: "repeat",
		},
		{
			page: "pitfall",
			label: "避坑",
			href: "pitfall.html",
			icon: "warning",
		},
		{
			page: "mealplan",
			label: "膳食",
			href: "mealplan.html",
			icon: "calendar",
		},
		{
			page: "restrictions",
			label: "忌口",
			href: "restrictions.html",
			icon: "heart",
		},
	];

	// === 底部导航配置（手机端，仅核心 5 项，避免拥挤）===
	const BOTTOM_NAV_PAGES = ["home", "recipes", "replica", "pitfall", "mealplan"];
	const BOTTOM_NAV_ITEMS = NAV_ITEMS.filter((item) =>
		BOTTOM_NAV_PAGES.includes(item.page),
	);

	/**
	 * 获取图标 SVG
	 * @param {string} name - 图标名
	 * @returns {string} SVG 字符串
	 */
	function getIcon(name) {
		if (window.FamTasteIcons?.[name]) {
			return window.FamTasteIcons[name];
		}
		return "";
	}

	/**
	 * 注入顶部毛玻璃导航栏
	 * @param {string} activePage - 当前页标识（home/recipes/replica/pitfall/mealplan）
	 */
	function injectNav(activePage) {
		const nav = document.createElement("nav");
		nav.className = "nav-glass";
		nav.setAttribute("aria-label", "主导航");

		// Logo
		const logo = document.createElement("a");
		logo.href = "index.html";
		logo.className = "nav-logo";
		logo.innerHTML =
			'<span class="nav-logo-mark">F</span><span>FamTaste</span>';

		// 导航链接
		const links = document.createElement("div");
		links.className = "nav-links";
		NAV_ITEMS.forEach((item) => {
			const link = document.createElement("a");
			link.href = item.href;
			link.className = "nav-link";
			link.textContent = item.label;
			link.setAttribute("data-page", item.page);
			if (item.page === activePage) {
				link.classList.add("active");
				link.setAttribute("aria-current", "page");
			}
			links.appendChild(link);
		});

		// 右侧操作区（主题切换）
		const actions = document.createElement("div");
		actions.className = "nav-actions";
		const themeToggle = document.createElement("button");
		themeToggle.className = "nav-theme-toggle";
		themeToggle.setAttribute("aria-label", "切换主题");
		themeToggle.setAttribute("type", "button");
		themeToggle.innerHTML = getIcon("moon");
		themeToggle.addEventListener("click", toggleTheme);
		actions.appendChild(themeToggle);

		nav.appendChild(logo);
		nav.appendChild(links);
		nav.appendChild(actions);

		// 插入到 body 最前面
		document.body.insertBefore(nav, document.body.firstChild);
	}

	/**
	 * 注入底部导航栏（仅手机端显示，CSS 控制）
	 * @param {string} activePage - 当前页标识
	 */
	function injectBottomNav(activePage) {
		const nav = document.createElement("nav");
		nav.className = "bottom-nav";
		nav.setAttribute("aria-label", "底部导航");

		BOTTOM_NAV_ITEMS.forEach((item) => {
			const link = document.createElement("a");
			link.href = item.href;
			link.className = "bottom-nav-item";
			if (item.page === activePage) {
				link.classList.add("active");
				link.setAttribute("aria-current", "page");
			}
			link.innerHTML =
				getIcon(item.icon) +
				'<span class="bottom-nav-label">' +
				item.label +
				"</span>";
			nav.appendChild(link);
		});

		document.body.appendChild(nav);
	}

	/**
	 * 主题切换
	 */
	function toggleTheme() {
		const current = document.documentElement.getAttribute("data-theme");
		const next = current === "dark" ? "light" : "dark";
		document.documentElement.setAttribute("data-theme", next);
		try {
			localStorage.setItem("famtaste-theme", next);
		} catch (_e) {
			// localStorage 不可用时静默降级
		}
		// 更新切换按钮图标
		const toggle = document.querySelector(".nav-theme-toggle");
		if (toggle) {
			toggle.innerHTML = getIcon(next === "dark" ? "sun" : "moon");
		}
	}

	/**
	 * 初始化主题（从 localStorage 读取）
	 */
	function initTheme() {
		try {
			const saved = localStorage.getItem("famtaste-theme");
			if (saved) {
				document.documentElement.setAttribute("data-theme", saved);
			}
		} catch (_e) {
			// 静默降级
		}
	}

	/**
	 * 获取 URL 查询参数
	 * @param {string} name - 参数名
	 * @returns {string|null} 参数值
	 */
	function getParam(name) {
		const params = new URLSearchParams(window.location.search);
		return params.get(name);
	}

	/**
	 * 格式化时间
	 * @param {number} minutes - 分钟数
	 * @returns {string} 格式化后的时间字符串
	 */
	function formatTime(minutes) {
		if (!minutes || minutes <= 0) return "0 分钟";
		if (minutes < 60) {
			return `${minutes} 分钟`;
		}
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (mins === 0) {
			return `${hours} 小时`;
		}
		return `${hours} 小时 ${mins} 分钟`;
	}

	/**
	 * 显示 Toast 提示
	 * @param {string} message - 提示消息
	 * @param {string} [type='info'] - 类型：success/error/warning/info
	 * @param {number} [duration=3000] - 显示时长（毫秒）
	 */
	function showToast(message, type, duration) {
		type = type || "info";
		duration = duration || 3000;

		// 移除已有 toast
		const existing = document.querySelector(".toast");
		if (existing) {
			existing.remove();
		}

		const toast = document.createElement("div");
		toast.className = `toast toast-${type}`;
		toast.setAttribute("role", "status");
		toast.setAttribute("aria-live", "polite");

		const iconMap = {
			success: "check",
			error: "x",
			warning: "warning",
			info: "warning",
		};
		const icon = getIcon(iconMap[type] || "warning");
		toast.innerHTML = `${icon}<span>${message}</span>`;

		document.body.appendChild(toast);

		// 自动消失
		setTimeout(() => {
			toast.classList.add("toast-out");
			setTimeout(() => {
				if (toast.parentNode) {
					toast.remove();
				}
			}, 300);
		}, duration);
	}

	/**
	 * 滚动揭示（IntersectionObserver）
	 * @param {string} selector - CSS 选择器
	 */
	function observeReveal(selector) {
		selector = selector || ".reveal";
		const elements = document.querySelectorAll(selector);

		if (!("IntersectionObserver" in window)) {
			// 不支持时直接显示
			elements.forEach((el) => {
				el.classList.add("revealed");
			});
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("revealed");
						observer.unobserve(entry.target);
					}
				});
			},
			{
				threshold: 0.1,
				rootMargin: "0px 0px -50px 0px",
			},
		);

		elements.forEach((el) => {
			observer.observe(el);
		});
	}

	/**
	 * 页面进入动画
	 */
	function pageEnter() {
		const main =
			document.querySelector("main") || document.querySelector(".page");
		if (main) {
			main.classList.add("page-enter");
		}
	}

	// === 初始化主题 ===
	initTheme();

	// === 暴露到全局 ===
	window.FamTaste = window.FamTaste || {};
	Object.assign(window.FamTaste, {
		injectNav: injectNav,
		injectBottomNav: injectBottomNav,
		getParam: getParam,
		formatTime: formatTime,
		showToast: showToast,
		observeReveal: observeReveal,
		pageEnter: pageEnter,
		toggleTheme: toggleTheme,
	});

	console.log("[FamTaste] 公共逻辑加载完成");
})();
