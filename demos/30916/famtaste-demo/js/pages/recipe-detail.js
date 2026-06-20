/**
 * FamTaste Demo V2 - 菜谱详情页逻辑
 * 设计文档引用: design-v2.md §3.6 页面结构 / §3.5 动效
 *
 * 职责：
 * 1. 注入顶部/底部导航（activePage='recipes'）
 * 2. 从 URL 获取 id 参数：FamTaste.getParam('id')
 * 3. 从 FamTasteData 查找对应菜谱（recipe + otherRecipes）
 * 4. 渲染 Hero 图、标题、作者、标签、难度、时间
 * 5. Tab 切换逻辑（食材/步骤/版本对比），更新 active 状态
 * 6. 食材清单渲染（带 checkbox 勾选功能，勾选后划线）
 * 7. 步骤时间线渲染
 * 8. 版本对比渲染：
 *    - 读取菜谱的 versions 数据（v1 和 v2）
 *    - 对比食材差异：added/removed/modified/unchanged
 *    - 对比步骤差异：同上
 *    - 切换按钮：食材对比 / 步骤对比
 * 9. 底部 CTA 跳转复刻表单
 * 10. pageEnter + observeReveal('.detail-section')
 *
 * 依赖：
 * - window.FamTasteIcons（图标库，由 icons.js 提供）
 * - window.FamTaste.Data（Mock 数据，由 data.js 提供）
 * - window.FamTaste.*（公共逻辑，由 shared.js 提供）
 */

(() => {
	// ============================================================
	// 私有状态
	// ============================================================

	/** @type {Object|null} 当前菜谱数据 */
	let currentRecipe = null;

	/** @type {Array<Object>} 版本数据（取自 FamTaste.Data.versions） */
	let versions = [];

	/** @type {string} 当前激活的 Tab：ingredients | steps | compare */
	let activeTab = "ingredients";

	/** @type {string} 当前对比维度：ingredients | steps */
	let activeDiff = "ingredients";

	/** @type {number} 基准版本索引（默认 v1 = 0） */
	let baseVersionIndex = 0;

	/** @type {number} 对比版本索引（默认 v2 = 1） */
	let compareVersionIndex = 1;

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
	 * 获取结果状态的中文标签
	 * @param {string} result - 结果状态：'failed' | 'okay' | 'perfect'
	 * @returns {string} 中文标签
	 */
	function getResultLabel(result) {
		const labels = {
			failed: "失败",
			okay: "尚可",
			perfect: "完美",
		};
		return labels[result] || "未知";
	}

	/**
	 * 根据 id 在 Data.recipes 中查找菜谱（适配新数据模型）
	 *
	 * @param {string} id - 菜谱 ID
	 * @returns {Object|null} 菜谱对象或 null
	 */
	function findRecipeById(id) {
		const data = window.FamTaste?.Data;
		if (!data) {
			console.error("[FamTaste RecipeDetail] Data 模块未加载");
			return null;
		}

		// 新数据模型：直接在 recipes 数组中查找
		if (Array.isArray(data.recipes)) {
			const found = data.recipes.find((r) => r.id === id);
			if (found) return found;
		}

		return null;
	}

	/**
	 * 根据 author_id 在 Data.members 中查找成员信息
	 *
	 * @param {string} authorId - 成员 ID
	 * @returns {Object|null} 成员对象或 null
	 */
	function findMemberById(authorId) {
		const data = window.FamTaste?.Data;
		if (!data || !Array.isArray(data.members)) return null;

		return data.members.find((m) => m.id === authorId) || null;
	}

	// ============================================================
	// Diff 算法（参考 js/components/diff-view.js）
	// ============================================================

	/**
	 * 对比两个版本的食材列表，返回标记了差异的数组
	 *
	 * @param {Array<{name: string, amount: string}>} base - 基准版本的食材列表
	 * @param {Array<{name: string, amount: string}>} compare - 对比版本的食材列表
	 * @returns {Array<{name: string, baseAmount: string, compareAmount: string, type: string}>}
	 *   type: 'unchanged' | 'modified' | 'added' | 'removed'
	 */
	function compareIngredients(base, compare) {
		const result = [];
		const baseArr = Array.isArray(base) ? base : [];
		const compareArr = Array.isArray(compare) ? compare : [];

		// 以 compare 为基准建立 name→item 映射
		const compareMap = new Map();
		compareArr.forEach((item) => {
			compareMap.set(item.name, item);
		});

		// 遍历 base 的每项
		baseArr.forEach((baseItem) => {
			const compareItem = compareMap.get(baseItem.name);
			if (compareItem) {
				// 找到同名项，检查 amount 是否相同
				if (baseItem.amount === compareItem.amount) {
					result.push({
						name: baseItem.name,
						baseAmount: baseItem.amount,
						compareAmount: compareItem.amount,
						type: "unchanged",
					});
				} else {
					result.push({
						name: baseItem.name,
						baseAmount: baseItem.amount,
						compareAmount: compareItem.amount,
						type: "modified",
					});
				}
				// 从 map 中移除已匹配的项（避免重复）
				compareMap.delete(baseItem.name);
			} else {
				// 在 compare 中找不到 → removed
				result.push({
					name: baseItem.name,
					baseAmount: baseItem.amount,
					compareAmount: "",
					type: "removed",
				});
			}
		});

		// 遍历 compare 中剩余的项（在 base 中找不到）→ added
		compareMap.forEach((compareItem) => {
			result.push({
				name: compareItem.name,
				baseAmount: "",
				compareAmount: compareItem.amount,
				type: "added",
			});
		});

		return result;
	}

	/**
	 * 对比两个版本的步骤数组，返回标记了差异的数组
	 *
	 * @param {Array<string>} baseSteps - 基准版本的步骤列表
	 * @param {Array<string>} compareSteps - 对比版本的步骤列表
	 * @returns {Array<{baseText: string, compareText: string, type: string}>}
	 *   type: 'unchanged' | 'modified' | 'added' | 'removed'
	 */
	function compareSteps(baseSteps, compareSteps) {
		const result = [];
		const baseArr = Array.isArray(baseSteps) ? baseSteps : [];
		const compareArr = Array.isArray(compareSteps) ? compareSteps : [];
		const maxLen = Math.max(baseArr.length, compareArr.length);

		for (let i = 0; i < maxLen; i++) {
			const baseText = baseArr[i] || "";
			const compareText = compareArr[i] || "";

			if (!baseText && compareText) {
				// 只在 compare 有 → added
				result.push({ baseText: "", compareText, type: "added" });
			} else if (baseText && !compareText) {
				// 只在 base 有 → removed
				result.push({ baseText, compareText: "", type: "removed" });
			} else if (baseText === compareText) {
				// 完全相同 → unchanged
				result.push({ baseText, compareText, type: "unchanged" });
			} else {
				// 两边都有但文字不同 → modified
				result.push({ baseText, compareText, type: "modified" });
			}
		}

		return result;
	}

	// ============================================================
	// 渲染函数
	// ============================================================

	/**
	 * 渲染 Hero 图
	 */
	function renderHero() {
		const container = document.getElementById("detail-hero");
		if (!container || !currentRecipe) return;

		const cover =
			currentRecipe.cover_image ||
			currentRecipe.cover ||
			"placeholder-sweet-sour-ribs.svg";
		const title = escapeHtml(currentRecipe.title || "菜谱");

		container.innerHTML = `
			<img src="assets/images/${escapeHtml(cover)}"
			     alt="${title}"
			     onerror="this.style.display='none';" />
		`;
	}

	/**
	 * 渲染菜谱信息区（标题/作者/标签/难度/时间/起源故事/独门秘籍）
	 */
	function renderDetailInfo() {
		const container = document.getElementById("detail-info");
		if (!container || !currentRecipe) return;

		const title = escapeHtml(currentRecipe.title || "未命名菜谱");

		// 从 Data.members 匹配作者信息
		const member = findMemberById(currentRecipe.author_id);
		const author = escapeHtml(
			currentRecipe.author_nickname || (member ? member.nickname : "未知"),
		);
		const avatar = member ? member.avatar : "👨‍🍳";

		const diff = mapDifficulty(currentRecipe.difficulty);
		const time = window.FamTaste.formatTime
			? window.FamTaste.formatTime(currentRecipe.cooking_time || 0)
			: `${currentRecipe.cooking_time || 0} 分钟`;

		// 标签 pills
		const tags = Array.isArray(currentRecipe.tags)
			? currentRecipe.tags
					.map((t) => `<span class="tag tag-tomato">${escapeHtml(t)}</span>`)
					.join("")
			: "";

		// 菜系类型
		const cuisineBadge = currentRecipe.cuisine_type
			? `<span class="tag tag-ginger">${escapeHtml(currentRecipe.cuisine_type)}</span>`
			: "";

		// 用餐时间
		const mealBadge = currentRecipe.meal_time
			? `<span class="tag tag-scallion">${escapeHtml(getMealTimeLabel(currentRecipe.meal_time))}</span>`
			: "";

		// 版本数
		const versionCount = versions.length || 0;
		const versionBadge = versionCount
			? `<span class="badge">${versionCount} 个版本</span>`
			: "";

		// 起源故事区块
		const originStory = currentRecipe.origin_story
			? `
			<div class="detail-origin-story">
				<h4>${getIcon("book")} 起源故事</h4>
				<p>${escapeHtml(currentRecipe.origin_story)}</p>
			</div>
			`
			: "";

		// 独门秘籍区块
		const secretTips = currentRecipe.secret_tips
			? `
			<div class="detail-secret-tips">
				<h4>${getIcon("warning")} 独门秘籍</h4>
				<p>${escapeHtml(currentRecipe.secret_tips)}</p>
			</div>
			`
			: "";

		container.innerHTML = `
			<h1 class="detail-title">${title}</h1>
			<div class="detail-author-row">
				<div class="detail-author-info">
					<span class="avatar avatar-lg" aria-hidden="true">${avatar}</span>
					<div>
						<div class="detail-author-name" style="font-size: var(--text-base); font-weight: var(--weight-semibold); color: var(--text-primary);">${author}</div>
						<div style="font-size: var(--text-xs); color: var(--text-tertiary);">家传菜谱</div>
					</div>
				</div>
				<div class="detail-meta" style="display: flex; align-items: center; gap: var(--space-md); font-size: var(--text-sm); color: var(--text-secondary); flex-wrap: wrap;">
					<span class="detail-meta-item">
						${getIcon("fire")}<span class="tag ${diff.tagClass}">${diff.label}</span>
					</span>
					<span class="detail-meta-item">
						${getIcon("clock")}<span>${time}</span>
					</span>
					${versionBadge}
				</div>
			</div>
			<div class="detail-tags">
				${cuisineBadge}
				${mealBadge}
				${tags}
			</div>
			${originStory}
			${secretTips}
		`;
	}

	/**
	 * 用餐时间中文标签映射
	 * @param {string} mealTime - 用餐时间标识
	 * @returns {string} 中文标签
	 */
	function getMealTimeLabel(mealTime) {
		const labels = {
			breakfast: "早餐",
			lunch: "午餐",
			dinner: "晚餐",
			snack: "加餐",
		};
		return labels[mealTime] || mealTime;
	}

	/**
	 * 渲染食材清单（带 checkbox 勾选功能）
	 * 取最新版本（versions 数组最后一项）的食材作为展示
	 */
	function renderIngredients() {
		const container = document.getElementById("ingredient-list");
		if (!container) return;

		// 取最新版本的食材；若无 versions 数据则展示空状态
		let ingredients = [];
		if (versions.length > 0) {
			const latestVersion = versions[versions.length - 1];
			ingredients = Array.isArray(latestVersion.ingredients)
				? latestVersion.ingredients
				: [];
		}

		if (ingredients.length === 0) {
			container.innerHTML = `
				<div class="empty-state">
					${getIcon("book")}
					<h3>暂无食材数据</h3>
					<p>该菜谱尚未记录食材清单</p>
				</div>
			`;
			return;
		}

		container.innerHTML = ingredients
			.map((item, idx) => {
				const name = escapeHtml(item.name || "");
				const amount = escapeHtml(item.amount || "");
				return `
					<label class="ingredient-item" data-index="${idx}">
						<div class="ingredient-check">
							<input type="checkbox" data-ingredient-index="${idx}" aria-label="勾选食材：${name}" />
							<span class="ingredient-name">${name}</span>
						</div>
						<span class="ingredient-amount">${amount}</span>
					</label>
				`;
			})
			.join("");
	}

	/**
	 * 渲染步骤时间线
	 * 取最新版本的步骤作为展示
	 */
	function renderSteps() {
		const container = document.getElementById("step-timeline");
		if (!container) return;

		let steps = [];
		if (versions.length > 0) {
			const latestVersion = versions[versions.length - 1];
			steps = Array.isArray(latestVersion.steps) ? latestVersion.steps : [];
		}

		if (steps.length === 0) {
			container.innerHTML = `
				<div class="empty-state">
					${getIcon("book")}
					<h3>暂无步骤数据</h3>
					<p>该菜谱尚未记录做法步骤</p>
				</div>
			`;
			return;
		}

		container.innerHTML = steps
			.map((step, idx) => {
				const text = escapeHtml(step || "");
				const num = idx + 1;
				return `
					<div class="step-item">
						<div class="step-number">${num}</div>
						<div class="step-content">
							<p>${text}</p>
						</div>
					</div>
				`;
			})
			.join("");
	}

	/**
	 * 渲染版本选择器
	 */
	function renderVersionSelector() {
		const container = document.getElementById("diff-version-selector");
		if (!container) return;

		if (versions.length < 2) {
			container.innerHTML = "";
			return;
		}

		container.innerHTML = `
			<select id="base-version-select" class="select" aria-label="选择基准版本">
				${versions
					.map((v, idx) => {
						const label = `基准：v${v.version}（${getResultLabel(v.result)}）`;
						const selected = idx === baseVersionIndex ? " selected" : "";
						return `<option value="${idx}"${selected}>${label}</option>`;
					})
					.join("")}
			</select>
			<span class="version-arrow" aria-hidden="true">→</span>
			<select id="compare-version-select" class="select" aria-label="选择对比版本">
				${versions
					.map((v, idx) => {
						const label = `对比：v${v.version}（${getResultLabel(v.result)}）`;
						const selected = idx === compareVersionIndex ? " selected" : "";
						return `<option value="${idx}"${selected}>${label}</option>`;
					})
					.join("")}
			</select>
		`;

		// 绑定版本选择事件
		const baseSelect = document.getElementById("base-version-select");
		const compareSelect = document.getElementById("compare-version-select");

		if (baseSelect) {
			baseSelect.addEventListener("change", function () {
				baseVersionIndex = parseInt(this.value, 10);
				// 防止选择同一个版本
				if (baseVersionIndex === compareVersionIndex) {
					compareVersionIndex = (baseVersionIndex + 1) % versions.length;
					if (compareSelect) {
						compareSelect.value = String(compareVersionIndex);
					}
				}
				renderDiffView();
			});
		}

		if (compareSelect) {
			compareSelect.addEventListener("change", function () {
				compareVersionIndex = parseInt(this.value, 10);
				// 防止选择同一个版本
				if (baseVersionIndex === compareVersionIndex) {
					baseVersionIndex =
						(compareVersionIndex - 1 + versions.length) % versions.length;
					if (baseSelect) {
						baseSelect.value = String(baseVersionIndex);
					}
				}
				renderDiffView();
			});
		}
	}

	/**
	 * 渲染单行食材 Diff HTML
	 * @param {Object} item - Diff 结果项
	 * @returns {string} 行 HTML 字符串
	 */
	function renderIngredientDiffRow(item) {
		const safeName = escapeHtml(item.name);
		const safeBaseAmount = escapeHtml(item.baseAmount);
		const safeCompareAmount = escapeHtml(item.compareAmount);

		switch (item.type) {
			case "modified":
				return `
					<div class="diff-row diff-modified">
						<div class="diff-left"><del>${safeName} ${safeBaseAmount}</del></div>
						<div class="diff-right"><ins>${safeName} ${safeCompareAmount}</ins></div>
					</div>
				`;
			case "added":
				return `
					<div class="diff-row diff-added">
						<div class="diff-left"></div>
						<div class="diff-right"><ins>+ ${safeName} ${safeCompareAmount}</ins></div>
					</div>
				`;
			case "removed":
				return `
					<div class="diff-row diff-removed">
						<div class="diff-left"><del>- ${safeName} ${safeBaseAmount}</del></div>
						<div class="diff-right"></div>
					</div>
				`;
			default:
				return `
					<div class="diff-row">
						<div class="diff-left">${safeName} ${safeBaseAmount}</div>
						<div class="diff-right">${safeName} ${safeCompareAmount}</div>
					</div>
				`;
		}
	}

	/**
	 * 渲染单行步骤 Diff HTML
	 * @param {Object} item - Diff 结果项
	 * @returns {string} 行 HTML 字符串
	 */
	function renderStepDiffRow(item) {
		const safeBaseText = escapeHtml(item.baseText);
		const safeCompareText = escapeHtml(item.compareText);

		switch (item.type) {
			case "modified":
				return `
					<div class="diff-row diff-modified">
						<div class="diff-left"><del>${safeBaseText}</del></div>
						<div class="diff-right"><ins>${safeCompareText}</ins></div>
					</div>
				`;
			case "added":
				return `
					<div class="diff-row diff-added">
						<div class="diff-left"></div>
						<div class="diff-right"><ins>+ ${safeCompareText}</ins></div>
					</div>
				`;
			case "removed":
				return `
					<div class="diff-row diff-removed">
						<div class="diff-left"><del>- ${safeBaseText}</del></div>
						<div class="diff-right"></div>
					</div>
				`;
			default:
				return `
					<div class="diff-row">
						<div class="diff-left">${safeBaseText}</div>
						<div class="diff-right">${safeCompareText}</div>
					</div>
				`;
		}
	}

	/**
	 * 渲染 Diff 视图（左右分栏）
	 */
	function renderDiffView() {
		const container = document.getElementById("diff-view");
		if (!container) return;

		if (versions.length < 2) {
			container.innerHTML = `
				<div class="empty-state">
					${getIcon("warning")}
					<h3>暂无足够版本数据</h3>
					<p>需要至少 2 个版本才能进行对比</p>
				</div>
			`;
			return;
		}

		// 确保索引有效
		baseVersionIndex = Math.min(
			Math.max(baseVersionIndex, 0),
			versions.length - 1,
		);
		compareVersionIndex = Math.min(
			Math.max(compareVersionIndex, 0),
			versions.length - 1,
		);
		if (baseVersionIndex === compareVersionIndex) {
			compareVersionIndex = (baseVersionIndex + 1) % versions.length;
		}

		const baseVersion = versions[baseVersionIndex];
		const compareVersion = versions[compareVersionIndex];

		// 列标题
		const baseLabel = `v${baseVersion.version}（${getResultLabel(baseVersion.result)}）`;
		const compareLabel = `v${compareVersion.version}（${getResultLabel(compareVersion.result)}）`;

		let diffRows = "";
		if (activeDiff === "ingredients") {
			const diffs = compareIngredients(
				baseVersion.ingredients,
				compareVersion.ingredients,
			);
			diffRows = diffs.map(renderIngredientDiffRow).join("");
		} else {
			const diffs = compareSteps(baseVersion.steps, compareVersion.steps);
			diffRows = diffs.map(renderStepDiffRow).join("");
		}

		container.innerHTML = `
			<div class="diff-column-header">
				<div>${getIcon("book")} ${escapeHtml(baseLabel)}</div>
				<div>${getIcon("book")} ${escapeHtml(compareLabel)}</div>
			</div>
			${diffRows}
		`;
	}

	/**
	 * 渲染底部 CTA 跳转链接（链接到复刻页）
	 */
	function renderCta() {
		const cta = document.getElementById("cta-replica");
		if (!cta || !currentRecipe) return;

		const id = encodeURIComponent(currentRecipe.id || "");
		cta.setAttribute("href", `replica.html?id=${id}`);
	}

	// ============================================================
	// 事件处理
	// ============================================================

	/**
	 * 处理 Tab 切换
	 * @param {string} tab - 目标 Tab id
	 */
	function switchTab(tab) {
		if (tab === activeTab) return;

		activeTab = tab;

		// 更新 Tab 按钮状态
		const tabButtons = document.querySelectorAll("#detail-tab-bar .tab-item");
		tabButtons.forEach((btn) => {
			const isActive = btn.getAttribute("data-tab") === tab;
			btn.classList.toggle("active", isActive);
			btn.setAttribute("aria-selected", isActive ? "true" : "false");
		});

		// 更新 Tab 面板显示
		const panels = document.querySelectorAll(".tab-panel");
		panels.forEach((panel) => {
			const panelTab = panel.getAttribute("id").replace("tab-panel-", "");
			const isActive = panelTab === tab;
			panel.classList.toggle("active", isActive);
			if (isActive) {
				panel.removeAttribute("hidden");
			} else {
				panel.setAttribute("hidden", "");
			}
		});
	}

	/**
	 * 处理对比维度切换（食材对比 / 步骤对比）
	 * @param {string} diff - 目标维度：ingredients | steps
	 */
	function switchDiff(diff) {
		if (diff === activeDiff) return;

		activeDiff = diff;

		// 更新切换按钮状态
		const buttons = document.querySelectorAll(".diff-toggle-btn");
		buttons.forEach((btn) => {
			const isActive = btn.getAttribute("data-diff") === diff;
			btn.classList.remove("active", "btn-primary", "btn-secondary");
			btn.classList.add(isActive ? "active" : "");
			btn.classList.add(isActive ? "btn-primary" : "btn-secondary");
		});

		// 重新渲染 Diff 视图
		renderDiffView();
	}

	/**
	 * 处理食材勾选
	 * @param {Event} event - change 事件
	 */
	function handleIngredientCheck(event) {
		const target = event.target;
		if (target.tagName !== "INPUT" || target.type !== "checkbox") return;

		const item = target.closest(".ingredient-item");
		if (!item) return;

		item.classList.toggle("checked", target.checked);
	}

	/**
	 * 绑定页面事件
	 */
	function bindEvents() {
		// Tab 切换
		const tabBar = document.getElementById("detail-tab-bar");
		if (tabBar) {
			tabBar.addEventListener("click", (event) => {
				const target = event.target.closest("[data-tab]");
				if (!target) return;
				switchTab(target.getAttribute("data-tab"));
			});
		}

		// 对比维度切换
		const diffToolbar = document.querySelector(".diff-toolbar");
		if (diffToolbar) {
			diffToolbar.addEventListener("click", (event) => {
				const target = event.target.closest("[data-diff]");
				if (!target) return;
				switchDiff(target.getAttribute("data-diff"));
			});
		}

		// 食材勾选（事件委托）
		const ingredientList = document.getElementById("ingredient-list");
		if (ingredientList) {
			ingredientList.addEventListener("change", handleIngredientCheck);
		}
	}

	/**
	 * 注入图标到静态 HTML 占位元素
	 */
	function injectStaticIcons() {
		// 返回按钮图标
		const backIcon = document.getElementById("back-icon");
		if (backIcon) {
			backIcon.innerHTML = getIcon("chevron-left");
		}

		// CTA 图标
		const ctaIcon = document.getElementById("cta-icon");
		if (ctaIcon) {
			ctaIcon.innerHTML = getIcon("repeat");
		}
	}

	// ============================================================
	// 页面初始化
	// ============================================================

	/**
	 * 初始化详情页
	 * 顺序：注入导航 → 获取 id → 查找菜谱 → 渲染各区域 → 绑定事件 → 触发动画
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

		// 3. 从 URL 获取 id 参数
		const id = window.FamTaste.getParam ? window.FamTaste.getParam("id") : null;

		// 4. 查找菜谱（默认 r001）
		currentRecipe = findRecipeById(id || "r001");

		if (!currentRecipe) {
			// 菜谱不存在时显示空状态
			const main = document.querySelector("main");
			if (main) {
				main.innerHTML = `
					<div class="container section">
						<div class="empty-state">
							${getIcon("warning")}
							<h3>未找到菜谱</h3>
							<p>菜谱 ID "${escapeHtml(id || "")}" 不存在</p>
							<a href="recipes.html" class="btn btn-primary mt-md">返回菜谱库</a>
						</div>
					</div>
				`;
			}
			if (window.FamTaste?.pageEnter) {
				window.FamTaste.pageEnter();
			}
			return;
		}

		// 5. 获取版本数据（从菜谱自身的 versions[] 获取，适配新数据模型）
		versions = Array.isArray(currentRecipe.versions)
			? currentRecipe.versions
			: [];

		// 6. 渲染各区域
		renderHero();
		renderDetailInfo();
		renderIngredients();
		renderSteps();
		renderVersionSelector();
		renderDiffView();
		renderCta();

		// 7. 绑定事件
		bindEvents();

		// 8. 触发页面进入动画
		if (window.FamTaste?.pageEnter) {
			window.FamTaste.pageEnter();
		}

		// 9. 触发滚动揭示
		if (window.FamTaste?.observeReveal) {
			window.FamTaste.observeReveal(".detail-section");
			window.FamTaste.observeReveal(".reveal");
		}

		console.log(
			`[FamTaste RecipeDetail] 详情页初始化完成，菜谱：${currentRecipe.title}`,
		);
	}

	// DOM 就绪后初始化
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
