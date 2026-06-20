/**
 * FamTaste Demo - 版本对比 Diff 视图组件
 * 设计文档引用: competition-design.md §5.2.3 版本对比视图 ★ 核心亮点功能
 *
 * 提供左右分栏的版本差异对比功能
 * 支持食材变动和做法步骤两个维度的对比
 */

(() => {
	// ============================================================
	// 私有配置
	// ============================================================

	/** @type {string} 当前激活的对比维度 Tab */
	let activeDiffTab = "ingredients";

	/** @type {number} 基准版本号（默认 v1） */
	let baseVersionIndex = 0;

	/** @type {number} 对比版本号（默认 v2） */
	let compareVersionIndex = 1;

	// ============================================================
	// 私有工具函数
	// ============================================================

	/**
	 * 转义 HTML 特殊字符，防止 XSS
	 *
	 * @param {string} text - 原始文本
	 * @returns {string} 转义后的安全文本
	 */
	function escapeHtml(text) {
		if (typeof text !== "string") {
			text = String(text);
		}

		const escapeMap = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		};

		return text.replace(/[&<>"']/g, (char) => escapeMap[char]);
	}

	/**
	 * 获取结果状态的中文标签
	 *
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

	// ============================================================
	// 核心 Diff 算法
	// ============================================================

	/**
	 * 对比两个版本的食材列表，返回标记了差异的数组
	 *
	 * @param {Array<{name: string, amount: string}>} base - 基准版本的食材列表
	 * @param {Array<{name: string, amount: string}>} compare - 对比版本的食材列表
	 * @returns {Array<{name: string, baseAmount: string, compareAmount: string, type: string}>}
	 *
	 * @example
	 * compareIngredients(v1.ingredients, v2.ingredients)
	 * // => [
	 * //   { name: "排骨", baseAmount: "500g", compareAmount: "500g", type: "unchanged" },
	 * //   { name: "冰糖", baseAmount: "30g", compareAmount: "25g", type: "modified" },
	 * //   ...
	 * // ]
	 */
	function compareIngredients(base, compare) {
		const result = [];

		// 以 base 为基准，建立 name→index 映射
		const compareMap = new Map();
		compare.forEach((item, index) => {
			compareMap.set(item.name, item);
		});

		// 遍历 base 的每项
		base.forEach((baseItem) => {
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
					// amount 不同 → modified
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
	 */
	function compareSteps(baseSteps, compareSteps) {
		const result = [];
		const maxLen = Math.max(baseSteps.length, compareSteps.length);

		for (let i = 0; i < maxLen; i++) {
			const baseText = baseSteps[i] || "";
			const compareText = compareSteps[i] || "";

			if (!baseText && compareText) {
				// 只在 compare 有 → added
				result.push({
					baseText: "",
					compareText: compareText,
					type: "added",
				});
			} else if (baseText && !compareText) {
				// 只在 base 有 → removed
				result.push({
					baseText: baseText,
					compareText: "",
					type: "removed",
				});
			} else if (baseText === compareText) {
				// 完全相同 → unchanged
				result.push({
					baseText: baseText,
					compareText: compareText,
					type: "unchanged",
				});
			} else {
				// 两边都有但文字不同 → modified
				result.push({
					baseText: baseText,
					compareText: compareText,
					type: "modified",
				});
			}
		}

		return result;
	}

	// ============================================================
	// 渲染函数
	// ============================================================

	/**
	 * 渲染单行食材 Diff HTML
	 *
	 * @param {Object} item - Diff 结果项
	 * @returns {string} 行 HTML 字符串
	 */
	function renderIngredientRow(item) {
		const safeName = escapeHtml(item.name);
		const safeBaseAmount = escapeHtml(item.baseAmount);
		const safeCompareAmount = escapeHtml(item.compareAmount);

		switch (item.type) {
			case "modified":
				return `
          <div class="diff-row diff-modified">
            <div class="diff-left"><del class="diff-old-value">${safeName} ${safeBaseAmount}</del></div>
            <div class="diff-right"><ins class="diff-new-value">${safeName} ${safeCompareAmount}</ins></div>
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

			case "unchanged":
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
	 *
	 * @param {Object} item - Diff 结果项
	 * @returns {string} 行 HTML 字符串
	 */
	function renderStepRow(item) {
		const safeBaseText = escapeHtml(item.baseText);
		const safeCompareText = escapeHtml(item.compareText);

		switch (item.type) {
			case "modified":
				return `
          <div class="diff-row diff-modified">
            <div class="diff-left"><del class="diff-old-value">${safeBaseText}</del></div>
            <div class="diff-right"><ins class="diff-new-value">${safeCompareText}</ins></div>
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

			case "unchanged":
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
	 * 渲染版本选择器 HTML
	 *
	 * @param {Array<Object>} versions - 所有版本数组
	 * @returns {string} 选择器 HTML 字符串
	 */
	function renderVersionSelector(versions) {
		const optionsHtml = versions
			.map((v, idx) => {
				const label = `v${v.version} (${getResultLabel(v.result)})`;
				const selectedBase = idx === baseVersionIndex ? " selected" : "";
				const selectedCompare = idx === compareVersionIndex ? " selected" : "";

				return `<option value="${idx}"${selectedBase}${selectedCompare}>${label}</option>`;
			})
			.join("\n              ");

		return `
      <div class="version-selector">
        <select id="base-version-select" class="select">
          ${versions
						.map((v, idx) => {
							const label = `v${v.version} (${getResultLabel(v.result)})`;
							const selected = idx === baseVersionIndex ? " selected" : "";
							return `<option value="${idx}"${selected}>基准：${label}</option>`;
						})
						.join("\n              ")}
        </select>
        <span class="version-arrow">→</span>
        <select id="compare-version-select" class="select">
          ${versions
						.map((v, idx) => {
							const label = `v${v.version} (${getResultLabel(v.result)})`;
							const selected = idx === compareVersionIndex ? " selected" : "";
							return `<option value="${idx}"${selected}>对比：${label}</option>`;
						})
						.join("\n              ")}
        </select>
      </div>
    `;
	}

	/**
	 * 渲染 Diff 对比区域 HTML
	 *
	 * @param {Object} baseVersion - 基准版本对象
	 * @param {Object} compareVersion - 对比版本对象
	 * @returns {string} Diff 区域 HTML 字符串
	 */
	function renderDiffContent(baseVersion, compareVersion) {
		let diffRows = "";

		if (activeDiffTab === "ingredients") {
			// 食材对比
			const diffs = compareIngredients(
				baseVersion.ingredients,
				compareVersion.ingredients,
			);
			diffRows = diffs.map(renderIngredientRow).join("\n");
		} else {
			// 步骤对比
			const diffs = compareSteps(baseVersion.steps, compareVersion.steps);
			diffRows = diffs.map(renderStepRow).join("\n");
		}

		const baseBadge =
			window.FamTaste && window.FamTaste.Tag
				? window.FamTaste.Tag.renderResultBadge(baseVersion.result)
				: getResultLabel(baseVersion.result);

		const compareBadge =
			window.FamTaste && window.FamTaste.Tag
				? window.FamTaste.Tag.renderResultBadge(compareVersion.result)
				: getResultLabel(compareVersion.result);

		return `
      <div class="diff-container">
        <div class="diff-panel diff-panel-base">
          <h3 class="diff-panel-title">
            v${baseVersion.version}
            ${baseBadge}
          </h3>
        </div>
        <div class="diff-panel diff-panel-compare">
          <h3 class="diff-panel-title">
            v${compareVersion.version}
            ${compareBadge}
          </h3>
        </div>
        ${diffRows}
      </div>
    `;
	}

	/**
	 * 渲染完整的 Diff 页面
	 *
	 * @param {Object} params - 路由参数
	 * @returns {string} 完整页面 HTML 字符串
	 */
	function renderDiffPage(params) {
		// 获取数据
		const data = window.FamTaste && window.FamTaste.Data;
		if (!data || !data.versions || data.versions.length < 2) {
			return `
        <div class="page">
          <div class="page-header">
            <h1>版本对比</h1>
            <p>暂无足够的数据进行版本对比</p>
          </div>
          ${window.FamTaste && window.FamTaste.TabNav ? window.FamTaste.TabNav.renderTabBar("recipes") : ""}
        </div>
      `;
		}

		const versions = data.versions;
		const recipe = data.recipe || {};

		// 确保版本索引有效
		baseVersionIndex = Math.min(baseVersionIndex, versions.length - 1);
		compareVersionIndex = Math.min(compareVersionIndex, versions.length - 1);

		// 确保不能选择同一个版本
		if (baseVersionIndex === compareVersionIndex) {
			compareVersionIndex = Math.min(
				compareVersionIndex + 1,
				versions.length - 1,
			);
		}

		const baseVersion = versions[baseVersionIndex];
		const compareVersion = versions[compareVersionIndex];

		// Tab 激活状态
		const ingredientsActive =
			activeDiffTab === "ingredients" ? " tab-active" : "";
		const stepsActive = activeDiffTab === "steps" ? " tab-active" : "";

		const pageHtml = `
      <div class="page">
        <div class="page-header">
          <h1>版本对比</h1>
          <p>${escapeHtml(recipe.title || "菜谱")} · v${baseVersion.version} → v${compareVersion.version}</p>
          ${renderVersionSelector(versions)}
        </div>

        <!-- 对比维度 Tab -->
        <div class="diff-tabs">
          <button class="tab-btn${ingredientsActive}" data-diff-tab="ingredients">食材变动</button>
          <button class="tab-btn${stepsActive}" data-diff-tab="steps">做法步骤</button>
        </div>

        <!-- Diff 对比区 -->
        ${renderDiffContent(baseVersion, compareVersion)}

        <!-- 底部操作 -->
        <button class="btn btn-primary btn-block" id="btn-generate-guide">
          AI 生成避坑指南 →
        </button>
      </div>

      <!-- 底部 Tab Bar -->
      ${window.FamTaste && window.FamTaste.TabNav ? window.FamTaste.TabNav.renderTabBar("recipes") : ""}
    `;

		// 返回 HTML，稍后绑定事件
		return pageHtml;
	}

	// ============================================================
	// 事件处理与初始化
	// ============================================================

	/**
	 * 绑定页面交互事件
	 * 应在 DOM 渲染后调用
	 */
	function bindEvents() {
		// 绑定版本选择器事件
		const baseSelect = document.getElementById("base-version-select");
		const compareSelect = document.getElementById("compare-version-select");

		if (baseSelect) {
			baseSelect.addEventListener("change", function () {
				baseVersionIndex = parseInt(this.value, 10);
				refreshDiffView();
			});
		}

		if (compareSelect) {
			compareSelect.addEventListener("change", function () {
				compareVersionIndex = parseInt(this.value, 10);
				refreshDiffView();
			});
		}

		// 绑定对比维度 Tab 切换事件
		const tabButtons = document.querySelectorAll("[data-diff-tab]");
		tabButtons.forEach((btn) => {
			btn.addEventListener("click", function () {
				activeDiffTab = this.getAttribute("data-diff-tab");

				// 更新按钮激活状态
				tabButtons.forEach((b) => b.classList.remove("tab-active"));
				this.classList.add("tab-active");

				// 刷新 Diff 内容
				refreshDiffContent();
			});
		});

		// 绑定"AI 生成避坑指南"按钮
		const guideBtn = document.getElementById("btn-generate-guide");
		if (guideBtn) {
			guideBtn.addEventListener("click", () => {
				if (window.FamTaste && window.FamTaste.Router) {
					window.FamTaste.Router.navigate("#/replica/r001/guide");
				} else {
					window.location.hash = "#/replica/r001/guide";
				}
			});
		}

		console.log("[FamTaste DiffView] 事件绑定完成");
	}

	/**
	 * 刷新整个 Diff 视图（重新渲染页面）
	 */
	function refreshDiffView() {
		const params =
			window.FamTaste && window.FamTaste.Router
				? window.FamTaste.Router.getParams()
				: { id: "r001" };

		const html = renderDiffPage(params);

		if (window.FamTaste && window.FamTaste.Router) {
			// 通过路由系统渲染（会触发 fade 动画）
			const appElement = document.getElementById("app");
			if (appElement) {
				appElement.innerHTML = html;
				bindEvents();
				// 重新初始化 TabBar
				if (window.FamTaste.TabNav) {
					window.FamTaste.TabNav.initTabBar();
				}
			}
		}
	}

	/**
	 * 仅刷新 Diff 内容区域（不重新渲染整个页面）
	 */
	function refreshDiffContent() {
		const data = window.FamTaste && window.FamTaste.Data;
		if (!data || !data.versions) return;

		const versions = data.versions;
		const baseVersion = versions[baseVersionIndex];
		const compareVersion = versions[compareVersionIndex];

		const diffContainer = document.querySelector(".diff-container");
		if (diffContainer) {
			diffContainer.outerHTML = renderDiffContent(baseVersion, compareVersion);
		}
	}

	// ============================================================
	// 初始化：挂载到全局命名空间 + 注册路由
	// ============================================================

	window.FamTaste = window.FamTaste || {};

	window.FamTaste.DiffView = {
		renderDiffPage,
		bindEvents,
		// 暴露核心算法供测试使用
		compareIngredients,
		compareSteps,
	};

	// 注册路由（覆盖 recipe-detail.js 中的空实现）
	if (window.FamTaste && window.FamTaste.Router) {
		window.FamTaste.Router.register("#/recipes/:id/compare", (params) => {
			const html = renderDiffPage(params);

			// 延迟绑定事件（确保 DOM 已插入）
			setTimeout(() => {
				bindEvents();
				// 初始化底部 TabBar
				if (window.FamTaste.TabNav) {
					window.FamTaste.TabNav.initTabBar();
				}
			}, 200);

			return html;
		});

		console.log("[FamTaste DiffView] 路由已注册: #/recipes/:id/compare");
	}

	console.log("[FamTaste DiffView] 模块已加载");
})();
