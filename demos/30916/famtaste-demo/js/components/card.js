/**
 * FamTaste Demo - 卡片组件
 * 设计文档引用: competition-design.md §7.3 组件规范 + §5.2.1 菜谱列表页 + §5.4 今日推荐页
 *
 * 提供通用菜谱卡片渲染函数
 * 使用 window.FamTaste.Components 命名空间导出
 */

(() => {
	// ============================================================
	// 私有工具函数
	// ============================================================

	/**
	 * 获取结果状态对应的样式类和文字
	 * @param {string} result - 结果状态 (failed | okay | perfect)
	 * @returns {{className: string, text: string, color: string}}
	 */
	function getResultStatus(result) {
		const statusMap = {
			failed: { className: "tag-danger", text: "失败", color: "#EF4444" },
			okay: { className: "tag-warning", text: "还行", color: "#EAB308" },
			perfect: { className: "tag-success", text: "完美", color: "#22C55E" },
		};
		return (
			statusMap[result] || {
				className: "tag-default",
				text: "未知",
				color: "#9CA3AF",
			}
		);
	}

	/**
	 * 获取餐别对应的图标和文字
	 * @param {string} mealType - 餐别 (breakfast | lunch | dinner)
	 * @returns {{icon: string, text: string}}
	 */
	function getMealTypeInfo(mealType) {
		const mealMap = {
			breakfast: { icon: "🌅", text: "早餐" },
			lunch: { icon: "☀️", text: "午餐" },
			dinner: { icon: "🌙", text: "晚餐" },
		};
		return mealMap[mealType] || { icon: "🍽️", text: "用餐" };
	}

	/**
	 * 渲染结果状态指示器
	 * @param {string} result - 结果状态
	 * @returns {string} HTML 字符串
	 */
	function renderResultIndicator(result) {
		if (!result) return "";
		const status = getResultStatus(result);
		return `
      <div class="card-result" style="display: flex; align-items: center; gap: 6px; margin-top: 8px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${status.color};"></span>
        <span class="tag ${status.className}" style="font-size: 11px;">${status.text}</span>
      </div>
    `;
	}

	/**
	 * 渲染标签列表
	 * @param {Array<string>} tags - 标签数组
	 * @returns {string} HTML 字符串
	 */
	function renderTags(tags) {
		if (!tags || tags.length === 0) return "";
		return tags
			.map((tag, index) => {
				// 第一个标签用 primary 样式，其余用默认样式
				const tagClass = index === 0 ? "tag tag-primary" : "tag tag-default";
				return `<span class="${tagClass}">${tag}</span>`;
			})
			.join("");
	}

	// ============================================================
	// 公共 API
	// ============================================================

	/**
	 * 渲染单张菜谱卡片
	 * @param {Object} recipeData - 菜谱数据
	 * @returns {string} HTML 字符串
	 *
	 * @example
	 * renderRecipeCard({
	 *   id: "r001",
	 *   title: "糖醋排骨",
	 *   author: "奶奶",
	 *   author_avatar: "👵",
	 *   cover_image: "placeholder-sweet-sour-ribs.svg",
	 *   versions: 3,
	 *   tags: ["复刻研究", "家传菜"],
	 *   result: "perfect"
	 * })
	 */
	function renderRecipeCard(recipeData) {
		if (!recipeData) {
			console.warn("[FamTaste Components] renderRecipeCard: 无效的菜谱数据");
			return "";
		}

		const {
			id,
			title,
			author,
			author_avatar,
			cover_image,
			cover, // 兼容 otherRecipes 中的 cover 字段
			versions,
			current_version, // 兼容 recipe 对象的 current_version 字段
			tags,
			result,
		} = recipeData;

		// 使用 cover_image 或 cover 字段
		const imageFile = cover_image || cover || "placeholder-recipe.svg";
		const imagePath = `assets/images/${imageFile}`;

		// 版本数显示为 badge（兼容 versions 和 current_version）
		const versionCount = versions || current_version;
		const versionBadge = versionCount
			? `<span class="tag tag-primary">v${versionCount}</span>`
			: "";

		return `
      <div class="card recipe-card" onclick="window.FamTaste.Router.navigate('#/recipes/${id}')" style="cursor: pointer;">
        <div class="card-image" style="height: 140px; overflow: hidden; border-radius: 8px; margin-bottom: 12px;">
          <img src="${imagePath}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div class="card-body">
          <h3 class="card-title" style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #78350F;">${title}</h3>
          <div class="card-meta" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span class="card-author" style="font-size: 13px; color: #6B7280;">
              ${author_avatar || "👨‍🍳"} ${author || "未知作者"}
            </span>
            ${versionBadge}
          </div>
          <div class="card-tags" style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${renderTags(tags)}
          </div>
          ${renderResultIndicator(result)}
        </div>
      </div>
    `;
	}

	/**
	 * 渲染菜谱卡片网格列表
	 * @param {Array<Object>} recipesArray - 菜谱数组
	 * @returns {string} HTML 字符串
	 *
	 * @example
	 * renderRecipeCardList(Data.otherRecipes)
	 * renderRecipeCardList([...Data.otherRecipes, Data.recipe])
	 */
	function renderRecipeCardList(recipesArray) {
		if (!recipesArray || recipesArray.length === 0) {
			console.warn("[FamTaste Components] renderRecipeCardList: 空的菜谱数组");
			return '<div class="recipe-grid-empty" style="padding: 32px; text-align: center; color: #9CA3AF;">暂无菜谱</div>';
		}

		const cards = recipesArray
			.map((recipe) => renderRecipeCard(recipe))
			.join("");

		return `
      <div class="recipe-grid" style="gap: 16px; padding: 16px;">
        ${cards}
      </div>
    `;
	}

	/**
	 * 渲染膳食规划推荐卡片
	 * @param {Object} mealData - 膳食数据
	 * @param {string} mealType - 餐别 (breakfast | lunch | dinner)
	 * @returns {string} HTML 字符串
	 *
	 * @example
	 * renderMealCard({
	 *   dish: "糖醋排骨",
	 *   reasons: ["周末加菜", "库存排骨快过期"],
	 *   recipe_id: "r001"
	 * }, "dinner")
	 */
	function renderMealCard(mealData, mealType) {
		if (!mealData) {
			console.warn("[FamTaste Components] renderMealCard: 无效的膳食数据");
			return "";
		}

		const { dish, reason, reasons, recipe_id } = mealData;
		// 兼容 reason 和 reasons 字段
		const reasonList = reasons || reason || [];

		const mealInfo = getMealTypeInfo(mealType);

		// 渲染理由标签
		const reasonTags = reasonList
			.map((r) => `<span class="tag tag-default">${r}</span>`)
			.join("");

		// 点击按钮的处理函数
		const handleAddToShoppingList = `
      const btn = event.target;
      btn.textContent = '已加入购物清单 ✓';
      btn.disabled = true;
      btn.style.opacity = '0.7';
      
      // 显示 toast 提示
      const toast = document.createElement('div');
      toast.style.cssText = 'position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: #22C55E; color: white; padding: 12px 24px; border-radius: 8px; font-size: 14px; z-index: 1000; animation: fadeIn 0.3s ease;';
      toast.textContent = '已加入购物清单';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    `;

		return `
      <div class="meal-card">
        <div class="meal-card-image" style="height: 120px; border-radius: 8px; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 12px;">
          <span style="font-size: 32px; margin-bottom: 8px;">${mealInfo.icon}</span>
          <span style="font-size: 14px; color: #78350F; font-weight: 500;">${mealInfo.text}</span>
        </div>
        <div class="meal-card-body">
          <h4 class="meal-card-title">${dish}</h4>
          <div class="meal-card-tags" style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
            ${reasonTags}
          </div>
          <button class="btn btn-primary meal-card-actions" onclick="${handleAddToShoppingList}" style="width: 100%;">
            一键加入购物清单
          </button>
        </div>
      </div>
    `;
	}

	// ============================================================
	// 初始化：挂载到全局命名空间
	// ============================================================

	// 确保 FamTaste 命名空间存在
	window.FamTaste = window.FamTaste || {};

	// 暴露组件 API
	window.FamTaste.Components = {
		renderRecipeCard,
		renderRecipeCardList,
		renderMealCard,
	};

	console.log("[FamTaste Components] 卡片组件模块已加载");
})();
