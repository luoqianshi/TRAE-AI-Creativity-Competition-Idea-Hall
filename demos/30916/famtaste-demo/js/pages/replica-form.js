/**
 * FamTaste Demo V2 - 复刻表单页
 * 设计文档引用: design-v2.md §3.6 页面结构
 *
 * 职责：
 * 1. 注入顶部/底部导航
 * 2. 从 URL 参数 ?id=xxx 获取要复刻的菜谱 ID（可选）
 * 3. 填充菜谱选择下拉框（从 data.js 所有菜谱中取）
 * 4. 选择菜谱后动态加载食材到可编辑列表
 * 5. 每行食材：名称(只读) + 用量输入框(可编辑) + 删除按钮
 * 6. 可添加新食材行
 * 7. 动态加载步骤列表：每步描述(只读) + 备注输入框(可编辑)
 * 8. 表单验证（至少保留 1 个食材）
 * 9. 提交时收集数据，调用 showToast('保存成功！')
 *
 * 依赖：
 * - window.FamTasteIcons（图标库）
 * - window.FamTaste.Data（Mock 数据：recipe / otherRecipes / versions）
 * - window.FamTaste.*（公共逻辑：injectNav/injectBottomNav/getParam/pageEnter/showToast）
 */

(() => {
	// ============================================================
	// 私有状态
	// ============================================================

	/** @type {Array<Object>} 当前编辑中的食材列表 */
	let currentIngredients = [];

	/** @type {Array<Object>} 当前编辑中的步骤列表 */
	let currentSteps = [];

	/** @type {string|null} 当前选中的菜谱 ID */
	let selectedRecipeId = null;

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
	 * 获取所有可用菜谱列表（主菜谱 + 其他菜谱）
	 * @returns {Array<Object>} 菜谱列表
	 */
	function getAllRecipes() {
		const Data = window.FamTaste?.Data;
		const recipes = [];

		// 主菜谱
		if (Data?.recipe) {
			recipes.push({
				id: Data.recipe.id,
				title: Data.recipe.title,
				ingredients:
					Data.versions && Data.versions.length > 0
						? Data.versions[Data.versions.length - 1].ingredients || []
						: [],
				steps:
					Data.versions && Data.versions.length > 0
						? Data.versions[Data.versions.length - 1].steps || []
						: [],
			});
		}

		// 其他菜谱
		if (Array.isArray(Data?.otherRecipes)) {
			Data.otherRecipes.forEach((r) => {
				recipes.push({
					id: r.id,
					title: r.title,
					// 其他菜谱没有详细食材数据，使用空数组
					ingredients: [],
					steps: [],
				});
			});
		}

		return recipes;
	}

	/**
	 * 根据 ID 查找菜谱
	 * @param {string} recipeId - 菜谱 ID
	 * @returns {Object|null} 菜谱对象
	 */
	function findRecipeById(recipeId) {
		return getAllRecipes().find((r) => r.id === recipeId) || null;
	}

	/**
	 * 获取下一个版本号
	 * @returns {number}
	 */
	function getNextVersion() {
		const Data = window.FamTaste?.Data;
		if (!Data?.versions || Data.versions.length === 0) return 1;
		return Math.max(...Data.versions.map((v) => v.version)) + 1;
	}

	// ============================================================
	// 渲染函数：菜谱选择
	// ============================================================

	/**
	 * 填充菜谱选择下拉框
	 */
	function populateRecipeSelect() {
		const select = document.getElementById("form-recipe-select");
		if (!select) return;

		const recipes = getAllRecipes();

		// 保留默认占位选项
		select.innerHTML = '<option value="">-- 请选择菜谱 --</option>';

		recipes.forEach((r) => {
			const option = document.createElement("option");
			option.value = r.id;
			option.textContent = r.title;
			select.appendChild(option);
		});

		// 如果 URL 有 id 参数，自动选中
		const urlId = window.FamTaste?.getParam?.("id");
		if (urlId) {
			select.value = urlId;
			handleRecipeChange(urlId);
		}
	}

	// ============================================================
	// 渲染函数：食材编辑列表
	// ============================================================

	/**
	 * 渲染食材编辑列表
	 * 每行：名称(只读) + 用量输入框(可编辑) + 删除按钮
	 */
	function renderIngredients() {
		const container = document.getElementById("form-ingredients");
		if (!container) return;

		if (currentIngredients.length === 0) {
			container.innerHTML = `
        <p style="color: var(--text-tertiary); font-size: var(--text-sm); padding: var(--space-md) 0;">
          选择菜谱后将显示食材列表
        </p>
      `;
			return;
		}

		container.innerHTML = currentIngredients
			.map(
				(ing, idx) => `
          <div class="ingredient-edit-row" data-index="${idx}">
            <span class="ingredient-edit-name">${escapeHtml(ing.name)}</span>
            <input
              type="text"
              class="input ingredient-edit-amount"
              value="${escapeHtml(ing.amount)}"
              placeholder="用量"
              data-index="${idx}"
              aria-label="${escapeHtml(ing.name)} 的用量"
            />
            <button
              type="button"
              class="btn btn-ghost ingredient-delete-btn"
              data-index="${idx}"
              aria-label="删除 ${escapeHtml(ing.name)}"
              title="删除此食材"
            >
              ${getIcon("x")}
            </button>
          </div>
        `,
			)
			.join("");

		// 绑定删除按钮事件
		container.querySelectorAll(".ingredient-delete-btn").forEach((btn) => {
			btn.addEventListener("click", () => {
				const idx = parseInt(btn.dataset.index, 10);
				currentIngredients.splice(idx, 1);
				renderIngredients();
			});
		});

		// 绑定用量输入变化事件
		container.querySelectorAll(".ingredient-edit-amount").forEach((input) => {
			input.addEventListener("change", () => {
				const idx = parseInt(input.dataset.index, 10);
				if (currentIngredients[idx]) {
					currentIngredients[idx].amount = input.value;
				}
			});
		});
	}

	/**
	 * 添加空白食材行
	 */
	function addIngredientRow() {
		currentIngredients.push({ name: "新食材", amount: "" });
		renderIngredients();
	}

	// ============================================================
	// 渲染函数：步骤备注列表
	// ============================================================

	/**
	 * 渲染步骤备注列表
	 * 每步：步骤描述(只读) + 备注输入框(可编辑)
	 */
	function renderSteps() {
		const container = document.getElementById("form-steps");
		if (!container) return;

		if (currentSteps.length === 0) {
			container.innerHTML = `
        <p style="color: var(--text-tertiary); font-size: var(--text-sm); padding: var(--space-md) 0;">
          此菜谱暂无步骤信息
        </p>
      `;
			return;
		}

		container.innerHTML = currentSteps
			.map(
				(step, idx) => `
          <div class="step-edit-row">
            <span class="step-edit-number">${idx + 1}</span>
            <p class="step-edit-desc">${escapeHtml(step)}</p>
            <input
              type="text"
              class="input step-note-input"
              placeholder="添加备注..."
              data-index="${idx}"
              aria-label="步骤 ${idx + 1} 备注"
            />
          </div>
        `,
			)
			.join("");
	}

	// ============================================================
	// 交互处理
	// ============================================================

	/**
	 * 处理菜谱选择变更
	 * @param {string} recipeId - 选中的菜谱 ID
	 */
	function handleRecipeChange(recipeId) {
		selectedRecipeId = recipeId || null;

		const ingredientsSection = document.getElementById("ingredients-section");
		const stepsSection = document.getElementById("steps-section");

		if (!recipeId) {
			// 未选择时隐藏区域
			if (ingredientsSection) ingredientsSection.style.display = "none";
			if (stepsSection) stepsSection.style.display = "none";
			currentIngredients = [];
			currentSteps = [];
			renderIngredients();
			renderSteps();
			return;
		}

		// 显示区域
		if (ingredientsSection) ingredientsSection.style.display = "";
		if (stepsSection) stepsSection.style.display = "";

		// 加载对应菜谱的食材和步骤
		const recipe = findRecipeById(recipeId);
		if (recipe) {
			// 深拷贝食材数组（避免修改原始数据）
			currentIngredients = (recipe.ingredients || []).map((ing) => ({
				...ing,
			}));
			currentSteps = [...(recipe.steps || [])];
		} else {
			currentIngredients = [];
			currentSteps = [];
		}

		renderIngredients();
		renderSteps();
	}

	/**
	 * 处理表单提交
	 * @param {Event} event - 提交事件
	 */
	function handleFormSubmit(event) {
		event.preventDefault();

		// 1. 校验：是否选择了菜谱
		if (!selectedRecipeId) {
			if (window.FamTaste?.showToast) {
				window.FamTaste.showToast("请先选择要复刻的菜谱", "warning");
			}
			const select = document.getElementById("form-recipe-select");
			if (select) select.focus();
			return;
		}

		// 2. 校验：至少保留 1 个食材
		if (currentIngredients.length === 0) {
			if (window.FamTaste?.showToast) {
				window.FamTaste.showToast("请至少保留一个食材", "warning");
			}
			return;
		}

		// 3. 收集当前表单数据
		const notesTextarea = document.getElementById("form-notes");
		const notes = notesTextarea ? notesTextarea.value.trim() : "";

		// 收集步骤备注
		const stepNotes = [];
		document.querySelectorAll(".step-note-input").forEach((input) => {
			stepNotes.push(input.value.trim());
		});

		// 4. 构建新的版本数据
		const newVersion = {
			version: getNextVersion(),
			created_at: formatDate(new Date()),
			result: "okay", // 默认标记为 okay
			ingredients: currentIngredients.filter((ing) => ing.name.trim()),
			steps: currentSteps,
			notes: notes,
		};

		// 5. 推入 Data.versions 数组（模拟保存）
		const Data = window.FamTaste?.Data;
		if (Data?.versions) {
			Data.versions.push(newVersion);
			console.log("[FamTaste ReplicaForm] 新版本已保存:", newVersion);
		}

		// 6. 显示成功提示
		if (window.FamTaste?.showToast) {
			window.FamTaste.showToast(
				`保存成功！已创建 v${newVersion.version}`,
				"success",
			);
		}

		// 7. 延迟跳转回时间线页
		setTimeout(() => {
			window.location.href = "replica.html";
		}, 1200);
	}

	/**
	 * 格式化日期为 YYYY-MM-DD
	 * @param {Date} date
	 * @returns {string}
	 */
	function formatDate(date) {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const d = String(date.getDate()).padStart(2, "0");
		return `${y}-${m}-${d}`;
	}

	/**
	 * 绑定所有表单事件
	 */
	function bindEvents() {
		// 菜谱选择变更
		const recipeSelect = document.getElementById("form-recipe-select");
		if (recipeSelect) {
			recipeSelect.addEventListener("change", () => {
				handleRecipeChange(recipeSelect.value);
			});
		}

		// 添加食材按钮
		const addBtn = document.getElementById("add-ingredient-btn");
		if (addBtn) {
			addBtn.addEventListener("click", addIngredientRow);
		}

		// 表单提交
		const form = document.getElementById("replica-form");
		if (form) {
			form.addEventListener("submit", handleFormSubmit);
		}

		// 返回链接中的图标需要 JS 渲染（因为 HTML 中使用了模板字符串但实际是静态 HTML）
		const backLink = document.querySelector(".back-link");
		if (backLink) {
			backLink.innerHTML = `${getIcon("chevron-left")}返回`;
		}

		// 添加食材按钮图标
		if (addBtn) {
			addBtn.innerHTML = `${getIcon("plus")}添加食材`;
		}
	}

	// ============================================================
	// 页面初始化
	// ============================================================

	function init() {
		// 1. 注入顶部 + 底部导航
		if (window.FamTaste?.injectNav) {
			window.FamTaste.injectNav("replica-form");
		}
		if (window.FamTaste?.injectBottomNav) {
			window.FamTaste.injectBottomNav("replica");
		}

		// 2. 填充菜谱选择下拉框
		populateRecipeSelect();

		// 3. 渲染初始空的食材和步骤区
		renderIngredients();
		renderSteps();

		// 4. 绑定所有事件
		bindEvents();

		// 5. 触发页面进入动画
		if (window.FamTaste?.pageEnter) {
			window.FamTaste.pageEnter();
		}

		// 6. 触发滚动揭示
		if (window.FamTaste?.observeReveal) {
			window.FamTaste.observeReveal(".reveal");
		}

		console.log("[FamTaste ReplicaForm] 复刻表单页初始化完成");
	}

	// DOM 就绪后初始化
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
