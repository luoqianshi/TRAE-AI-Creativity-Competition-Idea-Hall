/**
 * FamTaste Demo V2 - 首页逻辑
 * 设计文档引用: design-v2.md §3.6 页面结构 / §3.5 动效
 *
 * 职责：
 * 1. 注入顶部/底部导航
 * 2. 渲染 Bento Grid 4 格功能入口（菜谱库/复刻时间线/AI避坑/膳食规划）
 * 3. 渲染今日推荐菜谱横向滚动卡片（取前 5 个）
 * 4. 触发页面进入动画 + 滚动揭示
 *
 * 依赖：
 * - window.FamTasteIcons（图标库，由 icons.js 提供）
 * - window.FamTaste.Data（Mock 数据，由 data.js 提供）
 * - window.FamTaste.*（公共逻辑，由 shared.js 提供：injectNav/injectBottomNav/pageEnter/observeReveal/formatTime）
 */

(() => {
	// ============================================================
	// Bento Grid 4 格功能入口配置
	// 每格：图标 + 标题 + 一句话描述 + 跳转链接 + 食材色渐变背景
	// ============================================================
	const BENTO_ITEMS = [
		{
			icon: "book",
			title: "菜谱库",
			description: "收录家人的拿手菜，每一道都有故事",
			href: "recipes.html",
			// 灶火橙 tint
			background: "var(--accent-ember-tint)",
			iconColor: "var(--accent-ember-deep)",
			iconBg: "rgba(232, 93, 47, 0.15)",
		},
		{
			icon: "repeat",
			title: "复刻时间线",
			description: "记录每次尝试，从失败到完美",
			href: "replica.html",
			// 暖黄 tint
			background: "var(--accent-ginger-tint)",
			iconColor: "#8a6420",
			iconBg: "rgba(217, 164, 65, 0.20)",
		},
		{
			icon: "warning",
			title: "AI 避坑",
			description: "帮你总结踩过的坑，下次不犯",
			href: "pitfall.html",
			// 抹茶绿 tint
			background: "var(--accent-scallion-tint)",
			iconColor: "var(--accent-scallion)",
			iconBg: "rgba(122, 139, 92, 0.18)",
		},
		{
			icon: "calendar",
			title: "膳食规划",
			description: "根据库存和口味，智能推荐三餐",
			href: "mealplan.html",
			// 酱油褐 tint
			background: "var(--accent-soy-tint)",
			iconColor: "var(--accent-soy)",
			iconBg: "rgba(107, 68, 35, 0.18)",
		},
	];

	// ============================================================
	// 私有渲染函数
	// ============================================================

	/**
	 * 获取图标 SVG 字符串
	 * @param {string} name - 图标名
	 * @returns {string} SVG 字符串
	 */
	function getIcon(name) {
		return window.FamTasteIcons?.[name] || "";
	}

	/**
	 * 渲染 Bento Grid 单格功能入口
	 * @param {Object} item - 功能入口配置
	 * @returns {string} HTML 字符串
	 */
	function renderBentoItem(item) {
		return `
			<a class="bento-item feature-card"
			   href="${item.href}"
			   style="background: ${item.background};"
			   aria-label="进入${item.title}">
				<div class="feature-card-icon"
				     style="background-color: ${item.iconBg}; color: ${item.iconColor};">
					${getIcon(item.icon)}
				</div>
				<div>
					<h3 class="feature-card-title">${item.title}</h3>
					<p class="feature-card-desc">${item.description}</p>
				</div>
			</a>
		`;
	}

	/**
	 * 渲染 Bento Grid 4 格功能入口
	 */
	function renderBentoGrid() {
		const container = document.getElementById("bento-grid");
		if (!container) return;
		container.innerHTML = BENTO_ITEMS.map(renderBentoItem).join("");
	}

	/** @type {Array<Object>} 当前显示的3个推荐菜谱 */
	let currentRecommendations = [];

	/**
	 * 渲染今日推荐菜谱横向滚动卡片
	 * 从 Data.recipes 随机取 3 个，右侧带刷新按钮
	 */
	function renderRecipeScroll() {
		const container = document.getElementById("recipe-scroll");
		if (!container) return;

		// 数据防御：数据层未就绪时显示空状态
		const data = window.FamTaste?.Data;
		if (!data || !Array.isArray(data.recipes) || data.recipes.length === 0) {
			container.innerHTML = `
				<div class="empty-state">
					${getIcon("book")}
					<h3>暂无推荐菜谱</h3>
					<p>数据加载中，请稍后再试</p>
				</div>
			`;
			return;
		}

		// 如果还没有推荐数据，随机取3个
		if (currentRecommendations.length === 0) {
			currentRecommendations = pickRandomRecipes(data.recipes, 3);
		}

		container.innerHTML = `
			<div class="recipe-scroll-wrapper">
				<div class="recipe-scroll-cards">
					${currentRecommendations.map(renderRecipeCard).join("")}
				</div>
				<button
					class="refresh-btn"
					id="refresh-recipes"
					type="button"
					aria-label="换一批推荐菜谱"
					title="换一批"
				>
					${getIcon("refresh")}
				</button>
			</div>
		`;

		// 绑定刷新按钮事件
		const refreshBtn = container.querySelector("#refresh-recipes");
		if (refreshBtn) {
			refreshBtn.addEventListener("click", handleRefreshClick);
		}
	}

	/**
	 * 从菜谱数组中随机选取指定数量的菜谱
	 * @param {Array<Object>} allRecipes - 全部菜谱
	 * @param {number} count - 选取数量
	 * @returns {Array<Object>} 随机选取的菜谱数组
	 */
	function pickRandomRecipes(allRecipes, count) {
		// Fisher-Yates 洗牌算法，取前 count 个
		const shuffled = [...allRecipes];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled.slice(0, Math.min(count, shuffled.length));
	}

	/**
	 * 处理刷新按钮点击：重新随机取3个菜谱并重新渲染
	 */
	function handleRefreshClick() {
		const data = window.FamTaste?.Data;
		if (!data || !Array.isArray(data.recipes)) return;

		// 重新随机选取（排除当前显示的，如果菜谱足够多的话）
		const excludeIds = new Set(currentRecommendations.map((r) => r.id));
		const available = data.recipes.filter((r) => !excludeIds.has(r.id));

		// 如果剩余菜谱足够3个，从剩余中选；否则从全部中重选
		if (available.length >= 3) {
			currentRecommendations = pickRandomRecipes(available, 3);
		} else {
			currentRecommendations = pickRandomRecipes(data.recipes, 3);
		}

		// 重新渲染
		renderRecipeScroll();

		// 添加旋转动画反馈
		const btn = document.getElementById("refresh-recipes");
		if (btn) {
			btn.classList.add("spinning");
			setTimeout(() => btn.classList.remove("spinning"), 500);
		}
	}

	/**
	 * 渲染单张菜谱卡片
	 * 适配新数据模型：使用 title/author_nickname/cuisine_type/difficulty/cooking_time
	 * @param {Object} recipe - 菜谱数据（来自 Data.recipes）
	 * @returns {string} HTML 字符串
	 */
	function renderRecipeCard(recipe) {
		// 难度标签映射
		const difficultyMap = {
			easy: { label: "简单", tagClass: "tag-scallion" },
			medium: { label: "中等", tagClass: "tag-ginger" },
			hard: { label: "困难", tagClass: "tag-tomato" },
		};
		const diff = difficultyMap[recipe.difficulty] || {
			label: "中等",
			tagClass: "tag-ginger",
		};

		// 烹饪时间格式化
		const time = window.FamTaste.formatTime
			? window.FamTaste.formatTime(recipe.cooking_time || 0)
			: `${recipe.cooking_time || 0} 分钟`;

		// 食物图片：使用 assets/images/ 下的 SVG placeholder
		const cover = recipe.cover_image || "placeholder-sweet-sour-ribs.svg";
		// 跳转到菜谱详情（带 id 参数）
		const href = `recipe-detail.html?id=${encodeURIComponent(recipe.id || "")}`;

		// 取首个标签展示（若有）
		const firstTag =
			Array.isArray(recipe.tags) && recipe.tags.length > 0
				? `<span class="tag tag-tomato">${recipe.tags[0]}</span>`
				: "";

		// 菜系类型标签
		const cuisineTag = recipe.cuisine_type
			? `<span class="tag tag-ginger">${recipe.cuisine_type}</span>`
			: "";

		return `
			<a class="recipe-card" href="${href}" aria-label="查看菜谱${recipe.title}">
				<div class="recipe-card-image">
					<img src="assets/images/${cover}"
					     alt="${recipe.title}"
					     loading="lazy"
					     onerror="this.style.display='none';" />
				</div>
				<div class="recipe-card-info">
					<h3 class="recipe-card-title">${recipe.title}</h3>
					<div class="recipe-card-meta">
						<span>${getIcon("user")}${recipe.author_nickname || "未知"}</span>
						<span>${getIcon("clock")}${time}</span>
					</div>
					<div class="recipe-card-tags">
						<span class="tag ${diff.tagClass}">${diff.label}</span>
						${cuisineTag}
						${firstTag}
					</div>
				</div>
			</a>
		`;
	}

	// ============================================================
	// 页面初始化
	// ============================================================

	/**
	 * 初始化首页
	 * 顺序：注入导航 → 渲染 Bento → 渲染推荐 → 触发动画
	 */
	function init() {
		// 1. 注入顶部 + 底部导航
		if (window.FamTaste?.injectNav) {
			window.FamTaste.injectNav("home");
		}
		if (window.FamTaste?.injectBottomNav) {
			window.FamTaste.injectBottomNav("home");
		}

		// 2. 渲染 Bento Grid 功能入口
		renderBentoGrid();

		// 3. 渲染今日推荐菜谱
		renderRecipeScroll();

		// 4. 触发页面进入动画
		if (window.FamTaste?.pageEnter) {
			window.FamTaste.pageEnter();
		}

		// 5. 触发滚动揭示（针对 .reveal 元素）
		if (window.FamTaste?.observeReveal) {
			window.FamTaste.observeReveal(".reveal");
		}

		// 6. 初始化数字滚动动效（痛点数据/省钱金额）
		initCounters();

		console.log("[FamTaste Home] 首页初始化完成");
	}

	// ============================================================
	// 数字滚动动效（data-counter 属性元素进入视口时从 0 滚到目标值）
	// ============================================================

	/**
	 * 初始化所有 [data-counter] 元素的滚动动画
	 */
	function initCounters() {
		const counters = document.querySelectorAll("[data-counter]");
		if (!counters.length) return;

		// 不支持 IntersectionObserver 直接执行
		if (!("IntersectionObserver" in window)) {
			counters.forEach(animateCount);
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						animateCount(entry.target);
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.5 }
		);

		counters.forEach((el) => observer.observe(el));
	}

	/**
	 * 单个元素的数字滚动动画
	 * @param {HTMLElement} el - 带 data-counter 的元素
	 */
	function animateCount(el) {
		const target = parseFloat(el.dataset.counter);
		const suffix = el.dataset.suffix || "";
		const isDecimal = !Number.isInteger(target);
		const hasYen = el.textContent.includes("¥");
		const duration = 1400;
		const start = performance.now();

		function tick(now) {
			const elapsed = now - start;
			const progress = Math.min(elapsed / duration, 1);
			// easeOutCubic
			const eased = 1 - Math.pow(1 - progress, 3);
			const current = target * eased;
			const display = isDecimal ? current.toFixed(1) : Math.round(current);

			el.textContent = (hasYen ? "¥" : "") + display + suffix;

			if (progress < 1) {
				requestAnimationFrame(tick);
			} else {
				el.textContent =
					(hasYen ? "¥" : "") +
					(isDecimal ? target.toFixed(1) : target) +
					suffix;
			}
		}

		requestAnimationFrame(tick);
	}

	// DOM 就绪后初始化
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
