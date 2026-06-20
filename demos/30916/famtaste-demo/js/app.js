/**
 * FamTaste Demo - 应用入口
 * 设计文档引用: competition-design.md §9.2 核心实现要点 + §9.3 文件结构 + §8 页面路由与导航
 */

(() => {
	/**
	 * 应用初始化入口
	 * 在 DOMContentLoaded 后执行
	 */
	function init() {
		console.log("FamTaste Demo loaded");

		// 检查路由模块是否已加载
		if (!window.FamTaste || !window.FamTaste.Router) {
			console.error("[FamTaste] 路由模块未加载，请确保 router.js 已引入");
			return;
		}

		// 注册应用路由
		registerAppRoutes();

		// 启动路由系统
		window.FamTaste.Router.start();
	}

	/**
	 * 注册所有应用路由
	 * 使用 Router.register() 注册页面及其渲染函数
	 */
	function registerAppRoutes() {
		const Router = window.FamTaste.Router;

		// 首页 - 使用 Pages 模块的渲染函数
		Router.register("#/", (params) => {
			// 优先使用 home.js 提供的完整首页渲染
			if (
				window.FamTaste &&
				window.FamTaste.Pages &&
				typeof window.FamTaste.Pages.renderHomePage === "function"
			) {
				return window.FamTaste.Pages.renderHomePage();
			}
			// 回退到简单占位页面
			return `
        <div class="page-home">
          <h1>家庭味道 FamTaste</h1>
          <p>欢迎来到 FamTaste Demo</p>
          <nav>
            <a href="#/recipes">查看食谱</a>
            <a href="#/replica">复刻挑战</a>
            <a href="#/meal-plan">餐计划</a>
          </nav>
        </div>
      `;
		});

		// 食谱列表页（味道档案）
		Router.register("#/recipes", (params) => {
			var Pages =
				window.FamTaste && window.FamTaste.Pages ? window.FamTaste.Pages : null;
			if (Pages && Pages.renderRecipesPage) {
				return Pages.renderRecipesPage(params);
			}
			// 降级处理：Pages 模块未加载时显示错误
			return `
        <div class="page-recipes">
          <div class="error">
            <p>菜谱列表页模块加载失败</p>
            <a href="#/">返回首页</a>
          </div>
        </div>
      `;
		});

		// 食谱详情页（带动态参数 :id）
		Router.register("#/recipes/:id", (params) => {
			var Pages =
				window.FamTaste && window.FamTaste.Pages ? window.FamTaste.Pages : null;
			if (Pages && Pages.renderRecipeDetailPage) {
				return Pages.renderRecipeDetailPage(params);
			}
			// 降级处理：详情页模块未加载时显示占位符
			return `
        <div class="page-recipe-detail">
          <h1>食谱详情</h1>
          <p>食谱 ID: ${params.id}</p>
          <a href="#/recipes/${params.id}/compare">对比模式</a>
          <br><br>
          <a href="#/recipes">返回列表</a>
        </div>
      `;
		});

		// 食谱对比页
		Router.register(
			"#/recipes/:id/compare",
			(params) => `
      <div class="page-recipe-compare">
        <h1>食谱对比</h1>
        <p>对比食谱 ID: ${params.id}</p>
        <a href="#/recipes/${params.id}">返回详情</a>
      </div>
    `,
		);

		// 复刻实验室页（时间轴视图）
		Router.register("#/replica", (params) => {
			var Pages =
				window.FamTaste && window.FamTaste.Pages ? window.FamTaste.Pages : null;
			if (Pages && Pages.renderReplicaPage) {
				return Pages.renderReplicaPage(params);
			}
			// 降级处理：Pages 模块未加载时显示错误
			return `
        <div class="page-replica">
          <div class="error">
            <p>复刻实验室页模块加载失败</p>
            <a href="#/">返回首页</a>
          </div>
        </div>
      `;
		});

		// 新建复刻记录表单页
		Router.register("#/replica/new", (params) => {
			var Pages =
				window.FamTaste && window.FamTaste.Pages ? window.FamTaste.Pages : null;
			if (Pages && Pages.renderReplicaFormPage) {
				return Pages.renderReplicaFormPage(params);
			}
			// 降级处理：Pages 模块未加载时显示错误
			return `
        <div class="page-replica-form">
          <div class="error">
            <p>新建复刻记录表单页模块加载失败</p>
            <a href="#/replica">返回复刻实验室</a>
          </div>
        </div>
      `;
		});

		// 复刻指南页（带动态参数 :id）★ AI 亮点功能
		Router.register("#/replica/:id/guide", (params) => {
			var Pages =
				window.FamTaste && window.FamTaste.Pages ? window.FamTaste.Pages : null;
			if (Pages && Pages.renderPitfallGuidePage) {
				return Pages.renderPitfallGuidePage(params);
			}
			// 降级处理：避坑指南页模块未加载时显示占位符
			return `
        <div class="page-pitfall-guide">
          <div class="error">
            <p>避坑指南页模块加载失败</p>
            <a href="#/replica">返回复刻实验室</a>
          </div>
        </div>
      `;
		});

		// 餐计划页（智能膳食规划）
		Router.register("#/meal-plan", (params) => {
			// 使用 Pages 模块的渲染函数（如果已加载）
			if (
				window.FamTaste &&
				window.FamTaste.Pages &&
				window.FamTaste.Pages.renderMealPlanPage
			) {
				return window.FamTaste.Pages.renderMealPlanPage(params);
			}
			// 降级：如果 Pages 模块未加载，显示占位符
			return `
        <div class="page-meal-plan">
          <h1>餐计划</h1>
          <p>页面模块加载中...</p>
          <a href="#/">返回首页</a>
        </div>
      `;
		});

		console.log("[FamTaste] 路由注册完成");
	}

	// DOM 就绪后初始化
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		// DOM 已经就绪（defer 脚本可能触发此分支）
		init();
	}
})();
