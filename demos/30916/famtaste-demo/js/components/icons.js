/**
 * Icons — SVG Icon 工厂
 *
 * 纯原生 JS，零外部依赖。
 * 所有图标为单色 SVG path，通过 currentColor 继承父元素颜色。
 * 线条风格统一：stroke-linecap="round"，stroke-linejoin="round"。
 *
 * 用法：
 *   window.FamTaste.Icons.get('home', { size: 24, className: 'icon-muted', strokeWidth: 1.5 })
 *   window.FamTaste.Icons.has('home')
 *   window.FamTaste.Icons.register('custom', '<path d="..."/>')
 */

window.FamTaste = window.FamTaste || {};

window.FamTaste.Icons = (() => {
	// ============================================================
	// SVG 图标库（框架阶段，仅含示例图标；具体 path 在 ST-07~ST-09 填充）
	// ============================================================
	const ICONS = {
		// === 示例图标 ===
		home: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,

		// === 食材类（占位，ST-07 填充）===
		// meat, vegetable, seasoning, seafood, staple, fruit

		// === 功能类（ST-08 填充）===
		search: `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
		filter: `<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>`,
		time: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
		difficulty: `<path d="M12 2c-1 2-3 4-3 7 0 2 1 3.5 3 3.5s3-1.5 3-3.5c0-3-2-5-3-7z"/>`,
		people: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
		bookmark: `<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>`,
		share: `<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>`,

		// === 状态类（ST-08 填充）===
		success: `<circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/>`,
		warning: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>`,
		error: `<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>`,
		info: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>`,
		loading: `<path d="M21 12a9 9 0 1 1-6.22-8.56"/>`,

		// === 导航类（占位，ST-09 填充）===
		// archive, lab, meal, back, close
	};

	// ============================================================
	// 默认配置
	// ============================================================
	const DEFAULTS = {
		size: 24,
		className: "",
		strokeWidth: 1.5,
	};

	// ============================================================
	// 占位 SVG（当图标未定义时回退）
	// ============================================================
	function fallbackSvg(options) {
		const size = options.size || DEFAULTS.size;
		const className = options.className || DEFAULTS.className;
		const strokeWidth = options.strokeWidth || DEFAULTS.strokeWidth;

		return (
			`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"` +
			` stroke="currentColor" stroke-width="${strokeWidth}"` +
			` stroke-linecap="round" stroke-linejoin="round"` +
			` class="${className}" xmlns="http://www.w3.org/2000/svg">` +
			`<circle cx="12" cy="12" r="10"/>` +
			`<line x1="12" y1="8" x2="12" y2="12"/>` +
			`<line x1="12" y1="16" x2="12.01" y2="16"/>` +
			`</svg>`
		);
	}

	// ============================================================
	// 获取图标 SVG 字符串
	// ============================================================
	function get(name, options) {
		options = options || {};
		const size = options.size || DEFAULTS.size;
		const className = options.className || DEFAULTS.className;
		const strokeWidth = options.strokeWidth || DEFAULTS.strokeWidth;
		const path = ICONS[name];

		if (!path) {
			console.warn(`[Icons] Icon "${name}" not found`);
			return fallbackSvg({ size, className, strokeWidth });
		}

		return (
			`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"` +
			` stroke="currentColor" stroke-width="${strokeWidth}"` +
			` stroke-linecap="round" stroke-linejoin="round"` +
			` class="${className}" xmlns="http://www.w3.org/2000/svg">` +
			`${path}` +
			`</svg>`
		);
	}

	// ============================================================
	// 检查图标是否存在
	// ============================================================
	function has(name) {
		return !!ICONS[name];
	}

	// ============================================================
	// 动态注册新图标
	// ============================================================
	function register(name, path) {
		if (typeof name !== "string" || typeof path !== "string") {
			console.warn(
				"[Icons] register() requires two string arguments: name, path",
			);
			return;
		}
		if (ICONS[name]) {
			console.warn(`[Icons] Overwriting existing icon: "${name}"`);
		}
		ICONS[name] = path;
	}

	// ============================================================
	// 公开 API
	// ============================================================
	return {
		get,
		has,
		register,
	};
})();
