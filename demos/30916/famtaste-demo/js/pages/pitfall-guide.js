/**
 * FamTaste Demo - 避坑指南页（AI 亮点功能）
 * 设计文档引用: competition-design.md §5.3.3 避坑指南页 ★ AI 亮点 + §6.1 pitfallGuide 数据
 *
 * 展示 AI 自动生成的复刻分析报告，包含问题模式识别、原因分析和解决建议
 * 使用 window.FamTaste.Pages 命名空间导出
 */

(() => {
	// ============================================================
	// 私有工具函数
	// ============================================================

	/**
	 * 转义 HTML 特殊字符，防止 XSS
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
	 * 根据置信度值返回对应的 CSS 类名
	 * @param {string} confidence - 置信度值（'高' | '中' | '低'）
	 * @returns {string} CSS 类名
	 */
	function getConfidenceClass(confidence) {
		const classMap = {
			高: "confidence-high",
			中: "confidence-medium",
			低: "confidence-low",
		};
		return classMap[confidence] || "confidence-medium";
	}

	// ============================================================
	// 渲染函数
	// ============================================================

	/**
	 * 渲染单个 Finding 卡片
	 *
	 * @param {Object} finding - 单条发现数据
	 * @param {string} finding.pattern - 模式名称
	 * @param {string} finding.problem - 问题描述
	 * @param {string} finding.cause - 原因分析
	 * @param {string} finding.solution - 解决建议
	 * @param {string} finding.confidence - 置信度
	 * @param {number} index - 卡片序号（用于交错动画延迟）
	 * @returns {string} 卡片 HTML 字符串
	 */
	function renderFindingCard(finding, index) {
		const pattern = finding.pattern || "";
		const problem = finding.problem || "";
		const cause = finding.cause || "";
		const solution = finding.solution || "";
		const confidence = finding.confidence || "中";
		const confidenceClass = getConfidenceClass(confidence);
		const isHighConfidence = confidence === "高";

		// 交错动画延迟（高置信度卡片无延迟，其他依次递增）
		const delay = isHighConfidence ? 0 : index * 0.1;

		return `
      <div class="finding-card ${confidenceClass} ${isHighConfidence ? "finding-card-highlight" : ""}"
           style="animation-delay: ${delay}s"
           role="article"
           aria-label="发现: ${escapeHtml(pattern)}">
        <div class="finding-pattern">
          <span class="pattern-icon" aria-hidden="true">&#x1F50D;</span>
          <h3>${escapeHtml(pattern)}</h3>
        </div>

        <div class="finding-content">
          <div class="finding-problem">
            <span class="label label-problem" aria-hidden="true">&#x26A0;&#xFE0F; 问题</span>
            <p>${escapeHtml(problem)}</p>
          </div>

          <div class="finding-cause">
            <span class="label label-cause" aria-hidden="true">&#x1F50D; 原因分析</span>
            <p>${escapeHtml(cause)}</p>
          </div>

          <div class="finding-solution">
            <span class="label label-solution" aria-hidden="true">&#2705; 建议</span>
            <p>${escapeHtml(solution)}</p>
          </div>
        </div>

        <div class="finding-confidence">
          <span class="confidence-badge ${confidenceClass}" role="status" aria-label="置信度: ${confidence}">
            置信度: ${escapeHtml(confidence)}
          </span>
        </div>
      </div>
    `;
	}

	/**
	 * 渲染 Findings 列表
	 * 按置信度排序：高的在前
	 *
	 * @param {Array<Object>} findings - 发现数组
	 * @returns {string} Findings 列表 HTML 字符串
	 */
	function renderFindingsList(findings) {
		if (!findings || findings.length === 0) {
			return `
        <div class="findings-empty" role="status">
          <p>暂无避坑数据，完成更多复刻后 AI 将自动生成分析报告。</p>
        </div>
      `;
		}

		// 按置信度排序：高 > 中 > 低
		const confidenceOrder = { 高: 0, 中: 1, 低: 2 };
		const sortedFindings = [...findings].sort((a, b) => {
			const orderA = confidenceOrder[a.confidence] ?? 99;
			const orderB = confidenceOrder[b.confidence] ?? 99;
			return orderA - orderB;
		});

		// 渲染每个 Finding 卡片
		const cardsHtml = sortedFindings
			.map((finding, index) => renderFindingCard(finding, index))
			.join("\n");

		return `<div class="findings-list" role="list" aria-label="避坑发现列表">\n${cardsHtml}\n</div>`;
	}

	/**
	 * 渲染页面头部区域（AI Badge + 标题 + 摘要 + 元信息）
	 *
	 * @param {Object} pitfallGuide - 避坑指南数据
	 * @param {string} recipeTitle - 菜谱名称
	 * @returns {string} 头部 HTML 字符串
	 */
	function renderGuideHeader(pitfallGuide, recipeTitle) {
		const summary = pitfallGuide.summary || "";
		const totalAttempts = pitfallGuide.total_attempts || 0;
		const generatedAt = pitfallGuide.generated_at || "";

		return `
      <header class="guide-header">
        <!-- AI 生成标识 -->
        <div class="ai-badge" role="banner" aria-label="AI 生成内容">
          <span class="ai-icon" aria-hidden="true">&#x1F916;</span>
          <span>AI 避坑指南</span>
        </div>

        <h1 class="guide-title">${escapeHtml(recipeTitle)} &middot; 复刻分析报告</h1>

        <p class="guide-summary">${escapeHtml(summary)}</p>

        <div class="guide-meta" role="contentinfo">
          <span class="meta-item">
            <span aria-hidden="true">&#x1F4CA;</span>
            总尝试次数: <strong>${escapeHtml(String(totalAttempts))}</strong>
          </span>
          <span class="meta-separator" aria-hidden="true">|</span>
          <span class="meta-item">
            <span aria-hidden="true">&#x1F4C5;</span>
            生成时间: <strong>${escapeHtml(generatedAt)}</strong>
          </span>
        </div>
      </header>
    `;
	}

	/**
	 * 渲染底部操作按钮区域
	 *
	 * @param {string} recipeId - 菜谱 ID
	 * @returns {string} 操作区 HTML 字符串
	 */
	function renderGuideActions(recipeId) {
		return `
      <div class="guide-actions" role="navigation" aria-label="页面操作">
        <a href="#/replica"
           class="btn btn-secondary"
           onclick="event.preventDefault(); window.FamTaste.Router.navigate('#/replica');"
           role="button">
          &#x2190; 返回时间轴
        </a>
        <a href="#/recipes/${recipeId}"
           class="btn btn-primary"
           onclick="event.preventDefault(); window.FamTaste.Router.navigate('#/recipes/${escapeHtml(recipeId)}');"
           role="button">
          查看完整菜谱 &#x2192;
        </a>
      </div>
    `;
	}

	/**
	 * 渲染避坑指南主页面
	 * 组装头部、Findings 列表、底部操作和 Tab 导航
	 *
	 * @param {Object} params - 路由参数
	 * @param {string} params.id - 菜谱 ID
	 * @returns {string} 完整页面 HTML 字符串
	 *
	 * @example
	 * Router.register('#/replica/:id/guide', (params) => Pages.renderPitfallGuidePage(params));
	 */
	function renderPitfallGuidePage(params) {
		const TabNav = window.FamTaste?.TabNav;
		const Data = window.FamTaste?.Data;

		// 组件检查
		if (!TabNav) {
			console.error("[FamTaste PitfallGuide] TabNav 组件未就绪");
			return '<div class="error"><p>页面组件加载失败</p></div>';
		}

		// 数据检查
		if (!Data?.pitfallGuide) {
			console.warn("[FamTaste PitfallGuide] 避坑指南数据未找到");
			return `
        <div class="page-pitfall-guide">
          <div class="error">
            <h2>暂无避坑数据</h2>
            <p>完成更多复刻尝试后，AI 将自动生成分析报告。</p>
            <a href="#/replica">返回复刻实验室</a>
          </div>
        </div>
      `;
		}

		// 获取菜谱名称
		const recipeTitle = Data?.recipe?.title || "未知菜谱";
		const recipeId = params?.id || Data.pitfallGuide.recipe_id || "";

		// 组装完整页面
		return `
      <div class="page-pitfall-guide">
        <!-- 页面头部 -->
        ${renderGuideHeader(Data.pitfallGuide, recipeTitle)}

        <!-- Findings 卡片区 -->
        <main class="guide-content" role="main">
          ${renderFindingsList(Data.pitfallGuide.findings)}
        </main>

        <!-- 底部操作 -->
        ${renderGuideActions(recipeId)}

        <!-- 底部 Tab 导航 -->
        <footer class="guide-footer">
          ${TabNav.renderTabBar("replica")}
        </footer>
      </div>
    `;
	}

	// ============================================================
	// 初始化：挂载到全局命名空间
	// ============================================================

	// 确保 FamTaste 命名空间存在
	window.FamTaste = window.FamTaste || {};

	// 合并到 Pages 命名空间（保留其他页面已注册的函数）
	window.FamTaste.Pages = Object.assign({}, window.FamTaste.Pages || {}, {
		renderPitfallGuidePage,
	});

	console.log("[FamTaste Pages] 避坑指南页模块已加载");
})();
