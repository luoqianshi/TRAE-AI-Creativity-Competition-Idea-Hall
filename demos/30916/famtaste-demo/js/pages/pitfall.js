/**
 * FamTaste Demo V2 - AI 避坑指南页（重建版）
 * 设计文档引用: design-v2.md §3.6 页面结构
 *
 * 核心变更：从硬编码单道菜避坑 → 基于具体菜谱联动的避坑中心
 *
 * 职责：
 * 1. 注入顶部/底部导航
 * 2. 从 Data.pitfallGuides 获取所有有避坑指南的菜谱 ID
 * 3. 渲染菜谱选择器（横向滚动卡片，显示菜名+尝试次数+成功率）
 * 4. 默认显示第一道菜的避坑详情，点击切换
 * 5. finding 卡片视觉层次：pattern(大字) > solution(高亮) > problem/cause(辅助)
 * 6. confidence 颜色：高=葱绿 / 中=姜黄 / 低=番茄红
 * 7. pageEnter() + observeReveal()
 *
 * 依赖：
 * - window.FamTasteIcons（图标库）
 * - window.FamTaste.Data（Mock 数据：pitfallGuides / recipes / replicaTimeline）
 * - window.FamTaste.*（公共逻辑：injectNav/injectBottomNav/pageEnter/observeReveal/showToast）
 */

(() => {
	// ============================================================
	// 私有状态
	// ============================================================

	/** 当前选中的菜谱 ID */
	let activeRecipeId = null;

	/** 所有有避坑指南的菜谱列表（从 pitfallGuides 提取） */
	let guideRecipes = [];

	// ============================================================
	// 私有工具函数
	// ============================================================

	function getIcon(name) {
		return window.FamTasteIcons?.[name] || "";
	}

	function escapeHtml(text) {
		if (typeof text !== "string") text = String(text);
		const map = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		};
		return text.replace(/[&<>"']/g, (ch) => map[ch]);
	}

	/**
	 * 根据置信度获取对应的 CSS 类名和颜色
	 * @param {string} confidence - '高'|'中'|'低' 或 'high'|'medium'|'low'
	 * @returns {{ className: string, colorVar: string, label: string }}
	 */
	function getConfidenceStyle(confidence) {
		const map = {
			高: {
				className: "confidence-high",
				colorVar: "var(--accent-scallion)",
				label: "高",
				tagClass: "tag-scallion",
			},
			high: {
				className: "confidence-high",
				colorVar: "var(--accent-scallion)",
				label: "高",
				tagClass: "tag-scallion",
			},
			中: {
				className: "confidence-medium",
				colorVar: "var(--accent-ginger)",
				label: "中",
				tagClass: "tag-ginger",
			},
			medium: {
				className: "confidence-medium",
				colorVar: "var(--accent-ginger)",
				label: "中",
				tagClass: "tag-ginger",
			},
			低: {
				className: "confidence-low",
				colorVar: "var(--status-fail)",
				label: "低",
				tagClass: "tag-tomato",
			},
			low: {
				className: "confidence-low",
				colorVar: "var(--status-fail)",
				label: "低",
				tagClass: "tag-tomato",
			},
		};
		return map[confidence] || map["中"];
	}

	/**
	 * 根据 recipe_id 查找菜谱标题
	 * @param {string} recipeId
	 * @returns {string}
	 */
	function getRecipeTitle(recipeId) {
		const Data = window.FamTaste?.Data;
		if (!Data?.recipes) return recipeId;
		const recipe = Data.recipes.find((r) => r.id === recipeId);
		return recipe ? recipe.title : recipeId;
	}

	/**
	 * 计算某道菜的成功率（基于 replicaTimeline）
	 * @param {string} recipeId
	 * @returns {number} 0-100 百分比
	 */
	function calcSuccessRate(recipeId) {
		const Data = window.FamTaste?.Data;
		if (!Data?.replicaTimeline) return 0;
		const records = Data.replicaTimeline.filter(
			(r) => r.recipe_id === recipeId,
		);
		if (records.length === 0) return 0;
		const perfectCount = records.filter((r) => r.result === "perfect").length;
		const okayCount = records.filter((r) => r.result === "okay").length;
		return Math.round(
			((perfectCount + okayCount * 0.5) / records.length) * 100,
		);
	}

	// ============================================================
	// 渲染函数 - 菜谱选择器
	// ============================================================

	/**
	 * 渲染单张菜谱选择器卡片
	 * @param {Object} item - { id, title, total_attempts, successRate }
	 * @param {boolean} isActive - 是否为当前选中
	 * @returns {string}
	 */
	function renderSelectorCard(item, isActive) {
		return `
      <button class="pitfall-selector-card ${isActive ? "active" : ""}"
              data-recipe-id="${escapeHtml(item.id)}"
              role="tab"
              aria-selected="${isActive}"
              aria-controls="pitfall-detail"
              type="button">
        <span class="pitfall-selector-name">${escapeHtml(item.title)}</span>
        <span class="pitfall-selector-meta">
          ${item.total_attempts} 次尝试 · 成功率 ${item.successRate}%
        </span>
      </button>
    `;
	}

	/**
	 * 渲染整个菜谱选择器横向滚动列表
	 */
	function renderSelector() {
		const container = document.getElementById("pitfall-selector");
		if (!container) return;

		const Data = window.FamTaste?.Data;
		const pitfallGuides = Data?.pitfallGuides;

		if (!pitfallGuides || Object.keys(pitfallGuides).length === 0) {
			container.innerHTML = `
        <div class="empty-state" style="flex: 0 0 300px;">
          ${getIcon("warning")}
          <h3>暂无避坑数据</h3>
          <p>完成更多复刻尝试后，AI 将自动生成分析报告</p>
        </div>
      `;
			return;
		}

		// 从 pitfallGuides 提取菜谱列表
		guideRecipes = Object.keys(pitfallGuides).map((id) => ({
			id,
			title: getRecipeTitle(id),
			total_attempts: pitfallGuides[id].total_attempts,
			successRate: calcSuccessRate(id),
		}));

		// 默认选中第一道
		if (guideRecipes.length > 0 && !activeRecipeId) {
			activeRecipeId = guideRecipes[0].id;
		}

		container.innerHTML = guideRecipes
			.map((item) => renderSelectorCard(item, item.id === activeRecipeId))
			.join("");

		// 绑定点击事件
		bindSelectorEvents();
	}

	// ============================================================
	// 渲染函数 - 避坑详情区
	// ============================================================

	/**
	 * 渲染详情头部（菜名 + 尝试次数 + 成功率 + 总结）
	 * @param {Object} guide - pitfallGuides[recipeId]
	 * @param {string} recipeTitle
	 */
	function renderDetailHeader(guide, recipeTitle) {
		const container = document.getElementById("pitfall-detail-header");
		if (!container) return;

		const successRate = calcSuccessRate(activeRecipeId);

		container.innerHTML = `
      <div class="pitfall-info-bar">
        <h2 class="pitfall-recipe-name">${escapeHtml(recipeTitle)}</h2>
        <div class="pitfall-stats">
          <span class="pitfall-stat-item">
            ${getIcon("repeat")}
            共 ${guide.total_attempts} 次尝试
          </span>
          <span class="pitfall-stat-item pitfall-stat-rate">
            成功率 ${successRate}%
            <span class="pitfall-rate-bar" style="--rate-width: ${successRate}%"></span>
          </span>
        </div>
      </div>
      <p class="pitfall-summary">${escapeHtml(guide.summary)}</p>
    `;
	}

	/**
	 * 渲染单条 finding 卡片（核心视觉层次：pattern > solution > problem/cause）
	 * @param {Object} finding - { pattern, problem, cause, solution, confidence }
	 * @param {number} index
	 * @returns {string}
	 */
	function renderFindingCard(finding, index) {
		const confidenceStyle = getConfidenceStyle(finding.confidence);

		return `
      <article class="pitfall-finding-card ${confidenceStyle.className}"
               role="article"
               aria-label="避坑发现: ${escapeHtml(finding.pattern)}"
               style="--finding-color: ${confidenceStyle.colorVar};">
        <!-- 左侧色条 -->
        <div class="finding-color-bar"></div>

        <!-- 卡片内容 -->
        <div class="finding-body">
          <!-- pattern：最突出（大字） -->
          <h3 class="finding-pattern">${getIcon("warning")}${escapeHtml(finding.pattern)}</h3>

          <!-- solution：次突出（可操作，高亮） -->
          <div class="finding-section finding-solution-section">
            <span class="finding-label">${getIcon("check")}解决方案</span>
            <p class="finding-text finding-solution">${escapeHtml(finding.solution)}</p>
          </div>

          <!-- problem：辅助信息 -->
          <div class="finding-section">
            <span class="finding-label">${getIcon("x")}问题现象</span>
            <p class="finding-text">${escapeHtml(finding.problem)}</p>
          </div>

          <!-- cause：辅助信息 -->
          <div class="finding-section">
            <span class="finding-label">${getIcon("search")}原因分析</span>
            <p class="finding-text">${escapeHtml(finding.cause)}</p>
          </div>

          <!-- 置信度标签 -->
          <span class="tag ${confidenceStyle.tagClass} finding-confidence-tag">
            置信度: ${confidenceStyle.label}
          </span>
        </div>
      </article>
    `;
	}

	/**
	 * 渲染当前选中菜谱的所有 findings
	 */
	function renderFindings() {
		const container = document.getElementById("pitfall-findings");
		if (!container) return;

		const Data = window.FamTaste?.Data;
		const guide = Data?.pitfallGuides?.[activeRecipeId];

		if (!guide || !guide.findings || guide.findings.length === 0) {
			container.innerHTML = `
        <div class="empty-state">
          ${getIcon("warning")}
          <h3>该菜暂无避坑数据</h3>
          <p>继续复刻尝试后，AI 将为你生成避坑建议</p>
        </div>
      `;
			return;
		}

		// 按 confidence 排序：高 > 中 > 低
		const order = { 高: 0, high: 0, 中: 1, medium: 1, 低: 2, low: 2 };
		const sortedFindings = [...guide.findings].sort(
			(a, b) => (order[a.confidence] ?? 99) - (order[b.confidence] ?? 99),
		);

		container.innerHTML = sortedFindings
			.map((f, i) => renderFindingCard(f, i))
			.join("");
	}

	/**
	 * 切换到指定菜谱的避坑详情
	 * @param {string} recipeId
	 */
	function switchToRecipe(recipeId) {
		if (recipeId === activeRecipeId) return;
		activeRecipeId = recipeId;

		// 更新选择器激活状态
		document.querySelectorAll(".pitfall-selector-card").forEach((card) => {
			const isActive = card.dataset.recipeId === recipeId;
			card.classList.toggle("active", isActive);
			card.setAttribute("aria-selected", isActive);
		});

		// 更新详情区
		const Data = window.FamTaste?.Data;
		const guide = Data?.pitfallGuides?.[recipeId];
		if (guide) {
			renderDetailHeader(guide, getRecipeTitle(recipeId));
			renderFindings();
		}
	}

	// ============================================================
	// 事件绑定
	// ============================================================

	function bindSelectorEvents() {
		document.querySelectorAll(".pitfall-selector-card").forEach((card) => {
			card.addEventListener("click", () => {
				const id = card.dataset.recipeId;
				if (id) switchToRecipe(id);
			});
		});
	}

	// ============================================================
	// GSAP 动画
	// ============================================================

	function initGsapAnimation() {
		if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
			console.warn("[FamTaste Pitfall] GSAP 或 ScrollTrigger 未加载，跳过动画");
			return;
		}

		gsap.registerPlugin(ScrollTrigger);

		// 清除旧实例
		ScrollTrigger.getAll().forEach((st) => {
			if (st.vars.id && st.vars.id.startsWith("pitfall-")) st.kill();
		});

		// 选择器卡片 stagger
		const selectorCards = document.querySelectorAll(".pitfall-selector-card");
		if (selectorCards.length > 0) {
			gsap.fromTo(
				selectorCards,
				{ opacity: 0, y: 20, scale: 0.96 },
				{
					opacity: 1,
					y: 0,
					scale: 1,
					duration: 0.45,
					ease: "power2.out",
					stagger: 0.08,
					scrollTrigger: {
						trigger: "#pitfall-selector",
						start: "top 85%",
						toggleActions: "play none none reverse",
						id: "pitfall-selector-stagger",
					},
				},
			);
		}

		// finding 卡片 stagger
		const findings = document.querySelectorAll(".pitfall-finding-card");
		if (findings.length > 0) {
			gsap.fromTo(
				findings,
				{ opacity: 0, x: -20 },
				{
					opacity: 1,
					x: 0,
					duration: 0.5,
					ease: "power2.out",
					stagger: 0.1,
					scrollTrigger: {
						trigger: "#pitfall-findings",
						start: "top 80%",
						toggleActions: "play none none reverse",
						id: "pitfall-findings-stagger",
					},
				},
			);
		}
	}

	// ============================================================
	// 页面初始化
	// ============================================================

	function init() {
		// 1. 注入顶部 + 底部导航
		if (window.FamTaste?.injectNav) {
			window.FamTaste.injectNav("pitfall");
		}
		if (window.FamTaste?.injectBottomNav) {
			window.FamTaste.injectBottomNav("pitfall");
		}

		// 2. 渲染菜谱选择器（内部会自动渲染第一个的详情）
		renderSelector();

		// 3. 如果已有选中菜谱，渲染其详情
		if (activeRecipeId) {
			const Data = window.FamTaste?.Data;
			const guide = Data?.pitfallGuides?.[activeRecipeId];
			if (guide) {
				renderDetailHeader(guide, getRecipeTitle(activeRecipeId));
				renderFindings();
			}
		}

		// 4. 触发页面进入动画
		if (window.FamTaste?.pageEnter) {
			window.FamTaste.pageEnter();
		}

		// 5. 触发滚动揭示
		if (window.FamTaste?.observeReveal) {
			window.FamTaste.observeReveal(".reveal");
		}

		// 6. GSAP ScrollTrigger 动画
		initGsapAnimation();

		console.log(
			"[FamTaste Pitfall] 避坑指南页初始化完成，共",
			guideRecipes.length,
			"道菜有避坑指南",
		);
	}

	// DOM 就绪后初始化
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
