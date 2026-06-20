/**
 * FamTaste Demo - SPA 路由系统
 * 设计文档引用: competition-design.md §8 页面路由与导航
 *
 * 基于 hashchange 事件的前端路由系统
 * 支持静态路径和动态参数（:param 格式）
 */

(() => {
	// ============================================================
	// 私有状态
	// ============================================================

	/** @type {Array<{pathRegex: RegExp, paramKeys: string[], renderFn: Function, path: string}>} */
	const routes = [];

	/** @type {Object<string, string>} 当前路由参数 */
	let currentParams = {};

	/** @type {string|null} 当前匹配的路由路径 */
	let currentRoute = null;

	/** @type {boolean} 路由器是否已启动 */
	let isStarted = false;

	/** @type {HTMLElement} app 挂载点 */
	let appElement = null;

	// ============================================================
	// 私有工具函数
	// ============================================================

	/**
	 * 将路由路径转换为正则表达式
	 * 支持 :param 格式的动态参数
	 *
	 * @param {string} path - 路由路径（如 '#/recipes/:id'）
	 * @returns {{pathRegex: RegExp, paramKeys: string[]}} 正则表达式和参数名列表
	 *
	 * @example
	 * pathToRegex('#/recipes/:id')
	 * // => { pathRegex: /^#\/recipes\/([^/]+)$/, paramKeys: ['id'] }
	 */
	function pathToRegex(path) {
		// 转义特殊字符（除了 : 和 /）
		const escaped = path.replace(/[.+^${}()|[\]\\]/g, "\\$&");

		// 提取参数名并替换为捕获组
		const paramNames = [];
		const regexStr = escaped.replace(
			/:([a-zA-Z_][a-zA-Z0-9_]*)/g,
			(_, paramName) => {
				paramNames.push(paramName);
				return "([^/]+)";
			},
		);

		return {
			pathRegex: new RegExp(`^${regexStr}$`),
			paramKeys: paramNames,
		};
	}

	/**
	 * 匹配当前 hash 与注册的路由
	 *
	 * @param {string} hash - 当前 URL hash（如 '#/recipes/r001'）
	 * @returns {{route: Object|null, params: Object<string, string>}}
	 */
	function matchRoute(hash) {
		// 标准化 hash（确保以 # 开头）
		const normalizedHash = hash.startsWith("#") ? hash : `#${hash}`;

		for (const route of routes) {
			const match = normalizedHash.match(route.pathRegex);
			if (match) {
				// 提取参数值
				const params = {};
				route.paramKeys.forEach((key, index) => {
					params[key] = match[index + 1]; // match[0] 是完整匹配
				});

				return { route, params };
			}
		}

		// 未匹配到任何路由
		return { route: null, params: {} };
	}

	/**
	 * 渲染页面内容到 #app 挂载点
	 * 支持 HTML 字符串或 DOM 元素
	 *
	 * @param {string|HTMLElement} content - 要渲染的内容
	 */
	function render(content) {
		if (!appElement) {
			console.error("[FamTaste Router] 找不到 #app 挂载点");
			return;
		}

		// 添加 fade-out 过渡效果
		appElement.style.opacity = "0";
		appElement.style.transition = "opacity 0.15s ease-out";

		// 短暂延迟后更新内容并淡入
		setTimeout(() => {
			if (typeof content === "string") {
				appElement.innerHTML = content;
			} else if (content instanceof HTMLElement) {
				appElement.innerHTML = "";
				appElement.appendChild(content);
			} else {
				appElement.innerHTML =
					'<div class="error">渲染错误：无效的内容类型</div>';
			}

			// fade-in
			appElement.style.opacity = "1";
		}, 150);
	}

	/**
	 * 显示 404 页面
	 */
	function showNotFound() {
		render(`
      <div class="page-not-found">
        <h2>页面不存在</h2>
        <p>抱歉，您访问的页面不存在。</p>
        <a href="#/">返回首页</a>
      </div>
    `);
	}

	/**
	 * 处理 hash 变化事件
	 * 核心路由分发逻辑
	 */
	function onHashChange() {
		const hash = window.location.hash || "#/";

		console.log(`[FamTaste Router] 路由变化: ${hash}`);

		// 匹配路由
		const { route, params } = matchRoute(hash);

		if (route) {
			// 更新当前状态
			currentParams = params;
			currentRoute = route.path;

			console.log(`[FamTaste Router] 匹配成功: ${route.path}`, params);

			try {
				// 调用路由处理函数，传入参数
				const result = route.renderFn(params);

				// 渲染结果
				if (result !== undefined && result !== null) {
					render(result);
				}
				// 如果 renderFn 返回 undefined/null，说明它自己处理了渲染（如手动操作 DOM）
			} catch (error) {
				console.error(`[FamTaste Router] 渲染错误 (${route.path}):`, error);
				render(`
          <div class="error">
            <h2>页面加载失败</h2>
            <p>${error.message}</p>
            <a href="#/">返回首页</a>
          </div>
        `);
			}
		} else {
			// 未匹配到路由
			console.warn(`[FamTaste Router] 未匹配路由: ${hash}`);
			currentParams = {};
			currentRoute = null;
			showNotFound();
		}
	}

	// ============================================================
	// 公共 API
	// ============================================================

	/**
	 * 注册路由及其对应的渲染函数
	 *
	 * @param {string} pathPattern - 路由路径模式（支持 :param 动态参数）
	 * @param {Function} renderFn - 渲染函数，接收 params 对象，返回 HTML 字符串或 DOM 元素
	 *
	 * @example
	 * Router.register('#/', (params) => '<h1>首页</h1>')
	 * Router.register('#/recipes/:id', (params) => `<h1>食谱 ${params.id}</h1>`)
	 */
	function register(pathPattern, renderFn) {
		if (typeof pathPattern !== "string") {
			throw new Error("[FamTaste Router] 路径必须是字符串");
		}
		if (typeof renderFn !== "function") {
			throw new Error("[FamTaste Router] 渲染函数必须是函数");
		}

		const { pathRegex, paramKeys } = pathToRegex(pathPattern);

		routes.push({
			path: pathPattern,
			pathRegex,
			paramKeys,
			renderFn,
		});

		console.log(`[FamTaste Router] 注册路由: ${pathPattern}`);
	}

	/**
	 * 启动路由监听
	 * 开始监听 hashchange 事件，并立即执行一次路由匹配
	 */
	function start() {
		if (isStarted) {
			console.warn("[FamTaste Router] 路由器已启动，无需重复调用");
			return;
		}

		// 获取 app 挂载点
		appElement = document.getElementById("app");
		if (!appElement) {
			console.error("[FamTaste Router] 找不到 #app 挂载点，路由无法启动");
			return;
		}

		// 监听 hash 变化
		window.addEventListener("hashchange", onHashChange);

		isStarted = true;
		console.log("[FamTaste Router] 路由器已启动");

		// 立即执行一次路由匹配（处理初始加载）
		onHashChange();
	}

	/**
	 * 手动导航到指定路径
	 * 会改变 URL hash 并触发对应的渲染函数
	 *
	 * @param {string} path - 目标路径（如 '#/recipes' 或 '/recipes'）
	 *
	 * @example
	 * Router.navigate('#/meal-plan')
	 * Router.navigate('/recipes/r001')
	 */
	function navigate(path) {
		// 标准化路径
		let normalizedPath = path;
		if (!normalizedPath.startsWith("#")) {
			normalizedPath = `#${normalizedPath}`;
		}

		// 改变 hash（会自动触发 hashchange 事件）
		window.location.hash = normalizedPath;
	}

	/**
	 * 获取当前路由参数
	 *
	 * @returns {Object<string, string>} 参数对象（如 { id: 'r001' } 或 {}）
	 */
	function getParams() {
		return { ...currentParams }; // 返回副本，防止外部修改
	}

	/**
	 * 获取当前路由路径
	 *
	 * @returns {string|null} 当前路由路径（如 '#/recipes/:id'）或 null
	 */
	function getCurrentRoute() {
		return currentRoute;
	}

	/**
	 * 获取所有已注册的路由列表（用于调试）
	 *
	 * @returns {Array<string>} 路径列表
	 */
	function getRoutes() {
		return routes.map((r) => r.path);
	}

	// ============================================================
	// 初始化：挂载到全局命名空间
	// ============================================================

	// 确保 FamTaste 命名空间存在
	window.FamTaste = window.FamTaste || {};

	// 暴露路由 API
	window.FamTaste.Router = {
		register,
		start,
		navigate,
		getParams,
		getCurrentRoute,
		getRoutes,
	};

	console.log("[FamTaste Router] 模块已加载");
})();
