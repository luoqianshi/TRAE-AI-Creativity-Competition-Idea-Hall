/**
 * FamTaste Demo - Tag 标签组件
 * 设计文档引用: competition-design.md §7.3 组件规范
 *
 * 提供胶囊标签、标签列表和结果状态徽章的渲染功能
 * 支持多种类型和状态样式
 */

(() => {
	// ============================================================
	// 私有配置
	// ============================================================

	/**
	 * 标签类型到 CSS 类名的映射
	 * @type {Object<string, string>}
	 */
	const TAG_TYPE_MAP = {
		default: "tag-default",
		primary: "tag-primary",
		success: "tag-success",
		warning: "tag-warning",
		danger: "tag-danger",
	};

	/**
	 * 结果状态配置
	 * @type {Object<string, {className: string, label: string}>}
	 */
	const RESULT_CONFIG = {
		failed: { className: "result-failed", label: "\u5931\u8D25" },
		okay: { className: "result-okay", label: "\u5C1A\u53EF" },
		perfect: { className: "result-perfect", label: "\u5B8C\u7F8E" },
	};

	// ============================================================
	// 私有工具函数
	// ============================================================

	/**
	 * 验证并规范化标签类型
	 *
	 * @param {string} type - 输入的类型
	 * @returns {string} 规范化后的类型（默认为 'default'）
	 */
	function normalizeType(type) {
		if (!type || !TAG_TYPE_MAP[type]) {
			return "default";
		}
		return type;
	}

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

	// ============================================================
	// 公共 API
	// ============================================================

	/**
	 * 渲染单个胶囊标签
	 *
	 * @param {string} text - 标签文字（如 "复刻研究"）
	 * @param {string} [type='default'] - 标签类型：'default' | 'primary' | 'success' | 'warning' | 'danger'
	 * @returns {string} 标签 HTML 字符串
	 *
	 * @example
	 * // 渲染主色标签
	 * Tag.renderTag('复刻研究', 'primary')
	 * // => '<span class="tag tag-primary">复刻研究</span>'
	 *
	 * // 渲染默认标签
	 * Tag.renderTag('家传菜')
	 * // => '<span class="tag tag-default">家传菜</span>'
	 */
	function renderTag(text, type) {
		const normalizedType = normalizeType(type);
		const className = TAG_TYPE_MAP[normalizedType];
		const safeText = escapeHtml(text);

		return `<span class="tag ${className}">${safeText}</span>`;
	}

	/**
	 * 渲染多个标签的容器
	 *
	 * @param {Array<string>} tagsArray - 标签文字数组（如 ["复刻研究", "家传菜", "过年必做"]）
	 * @param {string|Array<string>} [type] - 统一类型或与 tagsArray 等长的类型数组
	 * @returns {string} 标签列表容器 HTML 字符串
	 *
	 * @example
	 * // 所有标签使用相同类型
	 * Tag.renderTagList(['A', 'B', 'C'], 'primary')
	 *
	 * // 每个标签使用不同类型
	 * Tag.renderTagList(['A', 'B', 'C'], ['primary', 'default', 'success'])
	 */
	function renderTagList(tagsArray, type) {
		if (!Array.isArray(tagsArray) || tagsArray.length === 0) {
			return '<div class="tag-list"></div>';
		}

		const tagsHtml = tagsArray
			.map((text, index) => {
				// 支持数组类型（每个标签独立指定）或统一类型
				let tagType;
				if (Array.isArray(type)) {
					tagType = type[index] || "default";
				} else {
					tagType = type || "default";
				}

				return renderTag(text, tagType);
			})
			.join("\n      ");

		return `<div class="tag-list">\n      ${tagsHtml}\n    </div>`;
	}

	/**
	 * 渲染结果状态徽章
	 *
	 * @param {string} result - 结果状态：'failed' | 'okay' | 'perfect'
	 * @returns {string} 徽章 HTML 字符串
	 *
	 * @example
	 * // 完美结果
	 * Tag.renderResultBadge('perfect')
	 * // => '<span class="result-badge result-perfect"><span class="result-dot"></span>完美</span>'
	 *
	 * // 失败结果
	 * Tag.renderResultBadge('failed')
	 * // => '<span class="result-badge result-failed"><span class="result-dot"></span>失败</span>'
	 */
	function renderResultBadge(result) {
		if (!result || !RESULT_CONFIG[result]) {
			console.warn(
				`[FamTaste Tag] 无效的结果状态: "${result}"，使用默认值 "okay"`,
			);
			result = "okay";
		}

		const config = RESULT_CONFIG[result];

		return `
      <span class="result-badge ${config.className}">
        <span class="result-dot"></span>
        ${config.label}
      </span>
    `;
	}

	/**
	 * 获取所有支持的标签类型列表
	 *
	 * @returns {Array<string>} 类型名称数组
	 */
	function getSupportedTypes() {
		return Object.keys(TAG_TYPE_MAP);
	}

	/**
	 * 获取所有支持的结果状态列表
	 *
	 * @returns {Array<string>} 状态名称数组
	 */
	function getResultStates() {
		return Object.keys(RESULT_CONFIG);
	}

	// ============================================================
	// 初始化：挂载到全局命名空间
	// ============================================================

	window.FamTaste = window.FamTaste || {};

	window.FamTaste.Tag = {
		renderTag,
		renderTagList,
		renderResultBadge,
		getSupportedTypes,
		getResultStates,
	};

	console.log("[FamTaste Tag] 模块已加载");
})();
