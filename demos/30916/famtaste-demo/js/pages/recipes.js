/**
 * FamTaste Demo V2 - 菜谱列表页逻辑
 * 设计文档引用: design-v2.md §3.6 页面结构 / §3.5 动效
 *
 * 职责：
 * 1. 注入顶部/底部导航（activePage='recipes'）
 * 2. 渲染标签筛选栏（横向滚动 pill：全部/家常菜/快手菜/硬菜/汤品/素食）
 * 3. 合并 FamTasteData.recipe + otherRecipes 后渲染菜谱网格
 * 4. 搜索框实时过滤（按菜名，300ms 防抖）
 * 5. 标签点击筛选
 * 6. 卡片点击跳转 recipe-detail.html?id=xxx
 * 7. FAB 点击平滑滚动到顶部
 * 8. pageEnter + observeReveal('.recipe-card')
 *
 * 依赖：
 * - window.FamTasteIcons（图标库，由 icons.js 提供）
 * - window.FamTaste.Data（Mock 数据，由 data.js 提供）
 * - window.FamTaste.*（公共逻辑，由 shared.js 提供）
 */

(() => {
	// ============================================================
	// 私有配置
	// ============================================================

	/**
	 * 菜系筛选选项（横向滚动 pill）
	 * value='all' 显示全部；其他值匹配 recipe.cuisine_type
	 * @type {Array<{value: string, label: string}>}
	 */
	const TAG_FILTERS = [
		{ value: "all", label: "全部" },
		{ value: "家常菜", label: "家常菜" },
		{ value: "川菜", label: "川菜" },
		{ value: "粤菜", label: "粤菜" },
		{ value: "快手菜", label: "快手菜" },
	];

	/** @type {string} 当前激活的标签值 */
	let currentTag = "all";

	/** @type {string} 当前搜索关键字（已去空格、转小写） */
	let currentKeyword = "";

	/** @type {number|null} 防抖定时器句柄 */
	let searchDebounceTimer = null;

	/** @type {number} 搜索防抖时长（毫秒） */
	const SEARCH_DEBOUNCE_MS = 300;

	// ============================================================
	// 私有工具函数
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
	 * 转义 HTML 特殊字符，防止 XSS
	 * @param {string} text - 原始文本
	 * @returns {string} 转义后的安全文本
	 */
	function escapeHtml(text) {
		if (text === null || text === undefined) return "";
		const safe = String(text);
		const escapeMap = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		};
		return safe.replace(/[&<>"']/g, (ch) => escapeMap[ch]);
	}

	/**
	 * 获取菜谱列表（适配新数据模型）
	 * 直接从 Data.recipes 读取，统一字段格式
	 *
	 * @returns {Array<Object>} 统一格式的菜谱数组
	 */
	function mergeRecipes() {
		const data = window.FamTaste?.Data;
		if (!data || !Array.isArray(data.recipes)) {
			console.error("[FamTaste Recipes] Data 模块未加载或 recipes 数组不存在");
			return [];
		}

		// 新数据模型：recipes 数组每项已包含完整字段
		// 统一输出字段供渲染使用
		return data.recipes.map((r) => ({
			id: r.id,
			title: r.title,
			author: r.author_nickname || "未知",
			author_avatar: null, // 新模型不用 emoji avatar
			cover: r.cover_image,
			difficulty: r.difficulty || "medium",
			cooking_time: r.cooking_time || 30,
			tags: r.tags || [],
			cuisine_type: r.cuisine_type || "",
		}));
	}

	/**
	 * 难度标签映射
	 * @param {string} difficulty - 难度值（easy/medium/hard）
	 * @returns {{label: string, tagClass: string}} 标签文案与样式类
	 */
	function mapDifficulty(difficulty) {
		const map = {
			easy: { label: "简单", tagClass: "tag-scallion" },
			medium: { label: "中等", tagClass: "tag-ginger" },
			hard: { label: "困难", tagClass: "tag-tomato" },
		};
		return map[difficulty] || { label: "中等", tagClass: "tag-ginger" };
	}

	/**
	 * 根据当前菜系 + 关键词过滤菜谱列表
	 * @param {Array<Object>} list - 待过滤的菜谱数组
	 * @returns {Array<Object>} 过滤后的菜谱数组
	 */
	function applyFilters(list) {
		if (!Array.isArray(list) || list.length === 0) return [];

		return list.filter((r) => {
			// 菜系筛选：all 时通过；否则匹配 cuisine_type
			if (currentTag !== "all") {
				const cuisine = (r.cuisine_type || "").trim();
				if (cuisine !== currentTag) return false;
			}

			// 关键词筛选：按菜名匹配（包含关系，大小写不敏感）
			if (currentKeyword) {
				const title = String(r.title || "").toLowerCase();
				if (!title.includes(currentKeyword)) return false;
			}

			return true;
		});
	}

	// ============================================================
	// 渲染函数
	// ============================================================

	/**
	 * 渲染标签筛选栏
	 */
	function renderTagFilter() {
		const container = document.getElementById("tag-filter");
		if (!container) return;

		container.innerHTML = TAG_FILTERS.map((f) => {
			const isActive = f.value === currentTag;
			const activeClass = isActive ? " active" : "";
			return `
				<button
					type="button"
					class="tag${activeClass}"
					data-tag="${escapeHtml(f.value)}"
					role="tab"
					aria-selected="${isActive ? "true" : "false"}"
					aria-label="筛选标签：${escapeHtml(f.label)}"
				>${escapeHtml(f.label)}</button>
			`;
		}).join("");
	}

	/**
	 * 渲染单张菜谱卡片
	 * @param {Object} recipe - 菜谱数据（来自 mergeRecipes 统一格式）
	 * @returns {string} HTML 字符串
	 */
	function renderRecipeCard(recipe) {
		const diff = mapDifficulty(recipe.difficulty);
		const time = window.FamTaste.formatTime
			? window.FamTaste.formatTime(recipe.cooking_time || 0)
			: `${recipe.cooking_time || 0} 分钟`;

		const cover = recipe.cover || "placeholder-sweet-sour-ribs.svg";
		const href = `recipe-detail.html?id=${encodeURIComponent(recipe.id || "")}`;
		const author = escapeHtml(recipe.author || "未知");
		const title = escapeHtml(recipe.title || "未命名菜谱");

		// 取首个标签展示（若有）
		const firstTag =
			Array.isArray(recipe.tags) && recipe.tags.length > 0
				? `<span class="tag tag-tomato">${escapeHtml(recipe.tags[0])}</span>`
				: "";

		return `
			<a class="recipe-card reveal" href="${href}" aria-label="查看菜谱${title}">
				<div class="recipe-card-image">
					<img src="assets/images/${escapeHtml(cover)}"
					     alt="${title}"
					     loading="lazy"
					     onerror="this.style.display='none';" />
				</div>
				<div class="recipe-card-info">
					<h3 class="recipe-card-title">${title}</h3>
					<div class="recipe-card-meta">
						<span class="recipe-card-author">
							${getIcon("user")}
							${author}
						</span>
						<span class="recipe-card-time">
							${getIcon("clock")}${time}
						</span>
					</div>
					<div class="recipe-card-tags">
						<span class="tag ${diff.tagClass}">${diff.label}</span>
						${firstTag}
					</div>
				</div>
			</a>
		`;
	}

	/**
	 * 渲染空状态
	 * @returns {string} HTML 字符串
	 */
	function renderEmptyState() {
		return `
			<div class="empty-state" style="grid-column: 1 / -1;" role="status" aria-live="polite">
				${getIcon("search")}
				<h3>未找到匹配的菜谱</h3>
				<p>试试其他关键词或标签吧</p>
			</div>
		`;
	}

	/**
	 * 渲染菜谱网格
	 */
	function renderRecipeGrid() {
		const container = document.getElementById("recipe-grid");
		if (!container) return;

		const all = mergeRecipes();
		const filtered = applyFilters(all);

		if (filtered.length === 0) {
			container.innerHTML = renderEmptyState();
			return;
		}

		container.innerHTML = filtered.map(renderRecipeCard).join("");

		// 新渲染的卡片需要重新观察滚动揭示
		if (window.FamTaste?.observeReveal) {
			window.FamTaste.observeReveal(".recipe-card");
		}
	}

	// ============================================================
	// 事件处理
	// ============================================================

	/**
	 * 处理标签筛选点击
	 * @param {Event} event - 点击事件
	 */
	function handleTagClick(event) {
		const target = event.target.closest("[data-tag]");
		if (!target) return;

		const tag = target.getAttribute("data-tag");
		if (!tag || tag === currentTag) return;

		currentTag = tag;

		// 更新 active 状态（无需重新渲染整个筛选栏，避免抖动）
		const allTags = document.querySelectorAll("#tag-filter .tag");
		allTags.forEach((el) => {
			const isActive = el.getAttribute("data-tag") === currentTag;
			el.classList.toggle("active", isActive);
			el.setAttribute("aria-selected", isActive ? "true" : "false");
		});

		// 重新渲染网格
		renderRecipeGrid();
	}

	/**
	 * 处理搜索输入（300ms 防抖）
	 * @param {Event} event - input 事件
	 */
	function handleSearchInput(event) {
		const value = event.target.value || "";
		const keyword = value.trim().toLowerCase();

		// 关键词未变化时不触发
		if (keyword === currentKeyword) return;

		// 清除上一个防抖定时器
		if (searchDebounceTimer !== null) {
			clearTimeout(searchDebounceTimer);
		}

		searchDebounceTimer = setTimeout(() => {
			currentKeyword = keyword;
			renderRecipeGrid();
			searchDebounceTimer = null;
		}, SEARCH_DEBOUNCE_MS);
	}

	/**
	 * 处理 FAB 点击：显示添加菜谱提示（Demo 阶段用 toast）
	 */
	function handleFabClick() {
		if (window.FamTaste?.showToast) {
			window.FamTaste.showToast("长按可快速录入菜谱", "info", 2500);
		}
	}

	/**
	 * 绑定页面事件
	 */
	function bindEvents() {
		// 标签筛选点击
		const tagFilter = document.getElementById("tag-filter");
		if (tagFilter) {
			tagFilter.addEventListener("click", handleTagClick);
		}

		// 搜索框输入（防抖）
		const searchInput = document.getElementById("recipe-search");
		if (searchInput) {
			searchInput.addEventListener("input", handleSearchInput);
		}

		// FAB 点击
		const fab = document.getElementById("fab-top");
		if (fab) {
			fab.addEventListener("click", handleFabClick);
		}
	}

	/**
	 * 注入图标到静态 HTML 占位元素
	 */
	function injectStaticIcons() {
		// 搜索框图标
		const searchIcon = document.getElementById("search-icon");
		if (searchIcon) {
			searchIcon.innerHTML = getIcon("search");
		}

		// FAB 图标（添加菜谱用 plus）
		const fabIcon = document.getElementById("fab-icon");
		if (fabIcon) {
			fabIcon.innerHTML = getIcon("plus");
		}
	}

	// ============================================================
	// 页面初始化
	// ============================================================

	/**
	 * 初始化菜谱列表页
	 * 顺序：注入导航 → 注入图标 → 渲染筛选栏 → 渲染网格 → 绑定事件 → 触发动画
	 */
	function init() {
		// 1. 注入顶部 + 底部导航
		if (window.FamTaste?.injectNav) {
			window.FamTaste.injectNav("recipes");
		}
		if (window.FamTaste?.injectBottomNav) {
			window.FamTaste.injectBottomNav("recipes");
		}

		// 2. 注入静态图标
		injectStaticIcons();

		// 3. 渲染标签筛选栏
		renderTagFilter();

		// 4. 渲染菜谱网格
		renderRecipeGrid();

		// 5. 绑定事件
		bindEvents();

		// 6. 触发页面进入动画
		if (window.FamTaste?.pageEnter) {
			window.FamTaste.pageEnter();
		}

		// 7. 触发滚动揭示（针对 .reveal 元素，含页面标题区）
		if (window.FamTaste?.observeReveal) {
			window.FamTaste.observeReveal(".reveal");
		}

		console.log("[FamTaste Recipes] 菜谱列表页初始化完成");
	}

	// DOM 就绪后初始化
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
