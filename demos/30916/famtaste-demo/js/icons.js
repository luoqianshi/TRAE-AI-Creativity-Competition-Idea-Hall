/**
 * FamTaste Demo V2 - SVG 图标库
 * 设计文档引用: design-v2.md §3.5 动效（零外部 CDN）
 *
 * 所有图标 24x24，stroke-width 1.5，currentColor 继承父元素颜色
 * 风格：Feather/Lucide 线条风，stroke-linecap="round"，stroke-linejoin="round"
 *
 * 用法：
 *   window.FamTasteIcons.home                          // 直接 SVG 字符串
 *   document.body.insertAdjacentHTML('beforeend', window.FamTasteIcons.home)
 *   `<button>${window.FamTasteIcons.plus} 新建</button>`
 */

(() => {
	/**
	 * SVG 图标包装函数
	 * @param {string} inner - SVG 内部内容（path/circle/polyline 等）
	 * @returns {string} 完整 SVG 字符串
	 */
	function svg(inner) {
		return (
			'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" ' +
			'stroke="currentColor" stroke-width="1.5" ' +
			'stroke-linecap="round" stroke-linejoin="round" ' +
			'xmlns="http://www.w3.org/2000/svg">' +
			inner +
			"</svg>"
		);
	}

	// === 图标定义 ===
	const icons = {
		// === 基础导航 ===
		home: svg(
			'<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>' +
				'<polyline points="9 22 9 12 15 12 15 22"/>',
		),
		search: svg(
			'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
		),
		plus: svg(
			'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
		),
		clock: svg(
			'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
		),
		user: svg(
			'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' +
				'<circle cx="12" cy="7" r="4"/>',
		),
		menu: svg(
			'<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>' +
				'<line x1="3" y1="18" x2="21" y2="18"/>',
		),

		// === 箭头 ===
		"chevron-left": svg('<polyline points="15 18 9 12 15 6"/>'),
		"chevron-right": svg('<polyline points="9 18 15 12 9 6"/>'),
		"chevron-down": svg('<polyline points="6 9 12 15 18 9"/>'),
		"arrow-right": svg(
			'<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
		),
		"arrow-up": svg(
			'<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
		),

		// === 业务功能 ===
		fire: svg(
			'<path d="M12 2c-1 2-3 4-3 7 0 2 1 3.5 3 3.5s3-1.5 3-3.5c0-3-2-5-3-7z"/>' +
				'<path d="M12 22c-4 0-7-3-7-7 0-3 2-5 4-6 0 2 1 3 2 3 0-2 1-4 3-5 0 3 2 4 2 7 0 4-2 8-4 8z"/>',
		),
		leaf: svg(
			'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>' +
				'<path d="M2 21c0-3 1.85-5.36 5.08-6"/>',
		),
		book: svg(
			'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>' +
				'<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
		),
		repeat: svg(
			'<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>' +
				'<polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
		),
		refresh: svg(
			'<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
		),
		warning: svg(
			'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' +
				'<line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
		),
		calendar: svg(
			'<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>' +
				'<line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>' +
				'<line x1="3" y1="10" x2="21" y2="10"/>',
		),

		// === 操作 ===
		heart: svg(
			'<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
		),
		share: svg(
			'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>' +
				'<circle cx="18" cy="19" r="3"/>' +
				'<line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>' +
				'<line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
		),
		check: svg('<polyline points="20 6 9 17 4 12"/>'),
		x: svg(
			'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
		),

		// === 主题切换 ===
		sun: svg(
			'<circle cx="12" cy="12" r="5"/>' +
				'<line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>' +
				'<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>' +
				'<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>' +
				'<line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>' +
				'<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>' +
				'<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
		),
		moon: svg('<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'),
	};

	// === 暴露到全局 ===
	window.FamTasteIcons = icons;

	console.log(
		`[FamTaste] 图标库加载完成，共 ${Object.keys(icons).length} 个图标`,
	);
})();
