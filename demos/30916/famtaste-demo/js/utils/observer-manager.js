/**
 * ObserverManager — Intersection Observer 单例管理器
 * 设计文档引用: docs/design.md §5.1
 * 对应 Spec: REQ-ANI-001
 *
 * 基于 Intersection Observer API + CSS @keyframes 的滚动触发动画引擎。
 * 提供 fade-in、slide-up、scale-in 三类动画的自动触发管理。
 *
 * 用法：
 *   // 页面渲染完成后调用
 *   ObserverManager.init();
 *   ObserverManager.observePageAnimations();
 *
 *   // 路由切换前清理
 *   ObserverManager.disconnect();
 *
 *   // 或一键重置（供 router 调用）
 *   ObserverManager.reset();
 */

window.FamTaste = window.FamTaste || {};

window.FamTaste.ObserverManager = (() => {
	// ============================================================
	// 私有状态
	// ============================================================

	/** @type {IntersectionObserver|null} 单例 Observer 实例 */
	let observer = null;

	/** @type {Set<Element>} 当前被观察的元素集合 */
	const observedElements = new Set();

	/** @type {boolean} 是否已初始化（供调试使用） */
	let _isInitialized = false;

	// ============================================================
	// 默认配置
	// ============================================================

	const DEFAULT_CONFIG = {
		threshold: 0.2,
		rootMargin: "0px 0px -50px 0px",
		stagger: 100, // ms
	};

	/** @type {Object} 当前生效的配置 */
	let currentConfig = { ...DEFAULT_CONFIG };

	// ============================================================
	// 私有工具函数
	// ============================================================

	/**
	 * 检测用户是否偏好减少动画
	 * @returns {boolean}
	 */
	function prefersReducedMotion() {
		return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
	}

	/**
	 * 创建 IntersectionObserver 回调处理器
	 * @returns {IntersectionObserver}
	 */
	function createObserver() {
		return new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const el = entry.target;

						// 计算 stagger 延迟（单位：ms）
						const staggerIndex = parseInt(el.dataset.staggerIndex || "0", 10);
						const delay = staggerIndex * currentConfig.stagger;

						// 通过 CSS 变量传递延迟，供 CSS 动画使用
						el.style.setProperty("--stagger-delay", `${delay}ms`);

						if (prefersReducedMotion()) {
							// 无障碍：直接显示，无动画
							el.classList.remove("anim-hidden");
							el.classList.add("anim-visible");
							cleanupElement(el);
						} else {
							// 正常动画：添加可见类，触发 CSS 动画
							el.classList.remove("anim-hidden");
							el.classList.add("anim-visible");
							cleanupElement(el);
						}
					}
				});
			},
			{
				threshold: currentConfig.threshold,
				rootMargin: currentConfig.rootMargin,
			},
		);
	}

	/**
	 * 清理指定元素的观察状态
	 * @param {Element} el
	 */
	function cleanupElement(el) {
		if (observer) {
			observer.unobserve(el);
		}
		observedElements.delete(el);
	}

	// ============================================================
	// 公共 API
	// ============================================================

	/**
	 * 初始化 ObserverManager
	 * 如果用户设置了 prefers-reduced-motion: reduce，直接返回空操作对象
	 *
	 * @param {Object} [config={}] - 可选配置
	 * @param {number} [config.threshold=0.2] - 交叉阈值
	 * @param {string} [config.rootMargin='0px 0px -50px 0px'] - 根边距
	 * @param {number} [config.stagger=100] - 错峰间隔（ms）
	 * @returns {{observe: Function, disconnect: Function, unobserve: Function}}
	 */
	function init(config) {
		// 无障碍：用户偏好减少动画时，返回空操作对象
		if (prefersReducedMotion()) {
			_isInitialized = true;
			return {
				observe: () => {},
				disconnect: () => {},
				unobserve: () => {},
			};
		}

		// 如果已存在 observer，先清理
		if (observer) {
			disconnect();
		}

		// 合并配置
		currentConfig = Object.assign({}, DEFAULT_CONFIG, config || {});

		// 创建新的 IntersectionObserver 实例
		observer = createObserver();
		_isInitialized = true;

		return {
			observe: observe,
			disconnect: disconnect,
			unobserve: unobserve,
		};
	}

	/**
	 * 观察一组元素（或单个元素）
	 * 在观察前会自动添加 anim-hidden 类，确保元素初始不可见
	 *
	 * @param {Element|Element[]|NodeList} elements - 要观察的元素
	 */
	function observe(elements) {
		if (!observer) {
			console.warn("[ObserverManager] Not initialized. Call init() first.");
			return;
		}

		// 统一转换为数组
		const nodeList = Array.isArray(elements)
			? elements
			: elements instanceof NodeList
				? Array.from(elements)
				: [elements];

		nodeList.forEach((el) => {
			if (!el || !(el instanceof Element)) {
				console.warn(
					"[ObserverManager] Invalid element passed to observe():",
					el,
				);
				return;
			}

			if (!observedElements.has(el)) {
				// 初始状态：隐藏，等待触发
				el.classList.add("anim-hidden");
				el.classList.remove("anim-visible");
				observer.observe(el);
				observedElements.add(el);
			}
		});
	}

	/**
	 * 取消观察一组元素（或单个元素）
	 *
	 * @param {Element|Element[]|NodeList} elements - 要取消观察的元素
	 */
	function unobserve(elements) {
		if (!observer) {
			return;
		}

		const nodeList = Array.isArray(elements)
			? elements
			: elements instanceof NodeList
				? Array.from(elements)
				: [elements];

		nodeList.forEach((el) => {
			if (!el || !(el instanceof Element)) {
				return;
			}
			observer.unobserve(el);
			observedElements.delete(el);
		});
	}

	/**
	 * 断开所有观察并清空状态
	 * 路由切换前调用，确保旧页面的观察全部清理
	 */
	function disconnect() {
		if (observer) {
			observer.disconnect();
			observer = null;
		}
		observedElements.clear();
		_isInitialized = false;
	}

	/**
	 * 自动查找当前页面中所有带有 data-animate 属性的元素并开始观察
	 * 便捷函数，供页面渲染完成后一键调用
	 */
	function observePageAnimations() {
		if (!observer) {
			console.warn(
				"[ObserverManager] Not initialized. Call init() before observePageAnimations().",
			);
			return;
		}

		var elements = document.querySelectorAll("[data-animate]");
		if (elements.length === 0) {
			return;
		}

		elements.forEach((el, index) => {
			// 若元素未显式设置 stagger index，则按 DOM 顺序自动分配
			if (!el.dataset.staggerIndex) {
				el.dataset.staggerIndex = String(index);
			}

			// 若元素指定了动画类型（如 fade、scale），添加对应类名
			var animType = el.dataset.animate;
			if (animType && animType !== "slide-up") {
				el.classList.add(animType);
			}
		});

		observe(elements);
	}

	/**
	 * 路由切换集成接口
	 * 先 disconnect() 清理旧状态，再 init() 重新初始化，最后 observePageAnimations() 观察新页面
	 *
	 * @param {Object} [config] - 可选配置，传递给 init()
	 */
	function reset(config) {
		disconnect();
		init(config);
		observePageAnimations();
	}

	// ============================================================
	// 公开接口
	// ============================================================

	return {
		init: init,
		observe: observe,
		unobserve: unobserve,
		disconnect: disconnect,
		observePageAnimations: observePageAnimations,
		reset: reset,
	};
})();

console.log("[ObserverManager] 模块已加载");
