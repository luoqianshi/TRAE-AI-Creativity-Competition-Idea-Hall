/**
 * FamTaste Demo V2 - 膳食规划页（重建版）
 * 设计文档引用: design-v2.md §3.6 页面结构
 *
 * 核心变更：从纯展示 → 可编辑的一周膳食规划器
 *
 * 职责：
 * 1. injectNav('mealplan') + injectBottomNav('mealplan')
 * 2. 读取 Data.mealPlan["2026-W25"] 渲染当前周
 * 3. 读取 Data.members 渲染过敏提示条（汇总 allergies + dislikes）
 * 4. 渲染 4行 x 7列 = 28 格子膳食网格
 * 5. 编辑交互（JS 内存状态，Demo 不持久化）：
 *    - 空格子点击 → 弹出菜谱选择浮层（从 Data.recipes 列表，支持搜索过滤）
 *    - 已有格子点击 → 操作菜单（修改备注 / 删除 / 替换）
 * 6. 快捷操作：AI 推荐 / 同步购物清单 / 清空本周
 * 7. pageEnter() + observeReveal()
 *
 * 依赖：
 * - window.FamTasteIcons（图标库）
 * - window.FamTaste.Data（Mock 数据：mealPlan / members / recipes）
 * - window.FamTaste.*（公共逻辑：injectNav/injectBottomNav/pageEnter/observeReveal/showToast/formatTime）
 */

(() => {
	// ============================================================
	// 常量配置
	// ============================================================

	/** 一周日期标签 */
	const WEEK_DAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

	/** 一周的 key（对应 data.js 中 mealPlan 的属性名） */
	const DAY_KEYS = [
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
		"sunday",
	];

	/** 餐别配置 */
	const MEAL_TYPES = [
		{ key: "breakfast", label: "早餐", icon: "sun" },
		{ key: "lunch", label: "午餐", icon: "fire" },
		{ key: "dinner", label: "晚餐", icon: "calendar" },
		{ key: "snack", label: "夜宵", icon: "moon" },
	];

	// ============================================================
	// 私有状态（编辑状态用 JS 内存变量，Demo 不持久化）
	// ============================================================

	/** 当前显示的周标识（如 "2026-W25"） */
	let currentWeekKey = "2026-W25";

	/** 当前周的膳食数据（深拷贝自 Data.mealPlan，允许就地修改） */
	let weekData = null;

	/** 当前正在编辑的格子位置 { dayIndex, mealType } */
	let editingCell = null;

	/** 菜谱选择浮层的搜索关键词 */
	let pickerSearchQuery = "";

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
	 * 深拷贝膳食数据
	 * @param {*} obj
	 * @returns {*}
	 */
	function deepClone(obj) {
		return JSON.parse(JSON.stringify(obj));
	}

	/**
	 * 解析周标识为可读文本
	 * @param {string} weekKey - 如 "2026-W25"
	 * @returns {string}
	 */
	function formatWeekLabel(weekKey) {
		return weekKey.replace("W", "年第") + "周";
	}

	/**
	 * 获取当前周数据，如果没有则创建空结构
	 */
	function getOrCreateWeekData(weekKey) {
		const Data = window.FamTaste?.Data;
		const source = Data?.mealPlan?.[weekKey];

		if (source) {
			return deepClone(source);
		}

		// 创建空的周数据结构
		const emptyWeek = {};
		DAY_KEYS.forEach((dayKey) => {
			emptyWeek[dayKey] = {
				breakfast: null,
				lunch: null,
				dinner: null,
				snack: null,
			};
		});
		return emptyWeek;
	}

	// ============================================================
	// 渲染函数 - 过敏提示条
	// ============================================================

	/**
	 * 从 Data.members 汇总过敏信息并渲染提示条
	 */
	function renderAllergyAlert() {
		const container = document.getElementById("mealplan-allergy-alert");
		if (!container) return;

		const members = window.FamTaste?.Data?.members;
		if (!members || members.length === 0) {
			container.style.display = "none";
			return;
		}

		// 汇总所有成员的 allergies 和 dislikes
		const alerts = [];
		members.forEach((m) => {
			if (m.restrictions?.allergies && m.restrictions.allergies.length > 0) {
				alerts.push(
					`${m.nickname}对${m.restrictions.allergies.join("、")}过敏`,
				);
			}
			if (m.restrictions?.dislikes && m.restrictions.dislikes.length > 0) {
				alerts.push(`${m.nickname}不吃${m.restrictions.dislikes.join("、")}`);
			}
		});

		if (alerts.length === 0) {
			container.style.display = "none";
			return;
		}

		container.style.display = "flex";
		container.innerHTML = `
      ${getIcon("warning")}
      <span class="mealplan-allergy-text">注意：${alerts.join("；")}</span>
    `;
	}

	// ============================================================
	// 渲染函数 - 周导航
	// ============================================================

	function renderWeekNav() {
		const prevBtn = document.getElementById("week-prev");
		const nextBtn = document.getElementById("week-next");
		const labelEl = document.getElementById("week-label");

		if (prevBtn) prevBtn.innerHTML = getIcon("chevron-left");
		if (nextBtn) nextBtn.innerHTML = getIcon("chevron-right");
		if (labelEl) labelEl.textContent = formatWeekLabel(currentWeekKey);

		// 绑定切换事件（先移除旧监听器，用新按钮替换）
		if (prevBtn) {
			prevBtn.onclick = () => navigateWeek(-1);
		}
		if (nextBtn) {
			nextBtn.onclick = () => navigateWeek(1);
		}
	}

	/**
	 * 切换周（Demo 阶段只操作 W25 的数据，其他周显示空网格）
	 * @param {number} direction - -1 上一周, +1 下一周
	 */
	function navigateWeek(direction) {
		// Demo 阶段简化处理：提取当前周数字并增减
		const match = currentWeekKey.match(/W(\d+)/);
		if (!match) return;

		let weekNum = parseInt(match[1], 10) + direction;
		if (weekNum < 1) weekNum = 1;
		if (weekNum > 52) weekNum = 52;

		currentWeekKey = `2026-W${String(weekNum).padStart(2, "0")}`;
		weekData = getOrCreateWeekData(currentWeekKey);

		renderWeekNav();
		renderGrid();
	}

	// ============================================================
	// 渲染函数 - 膳食网格（核心）
	// ============================================================

	/**
	 * 渲染单个膳食格子
	 * @param {Object|null} mealData - 餐数据 { recipe_id, recipe_title, note } 或 null
	 * @param {number} dayIndex - 0-6 对应周一~周日
	 * @param {string} mealType - breakfast/lunch/dinner/snack
	 * @returns {string} HTML 字符串
	 */
	function renderMealCell(mealData, dayIndex, mealType) {
		const cellId = `cell-${dayIndex}-${mealType}`;

		if (!mealData || !mealData.recipe_id) {
			// 空格子：虚线边框 + "+" 号
			return `
        <td class="meal-cell meal-cell-empty"
            data-day="${dayIndex}"
            data-meal="${mealType}"
            id="${cellId}"
            role="gridcell"
            tabindex="0"
            aria-label="${WEEK_DAYS[dayIndex]} ${MEAL_TYPES.find((m) => m.key === mealType)?.label || mealType} - 未安排">
          ${getIcon("plus")}
          <span>添加</span>
        </td>
      `;
		}

		// 已填充格子：菜名 + 备注 + 操作按钮
		return `
      <td class="meal-cell meal-cell-filled"
          data-day="${dayIndex}"
          data-meal="${mealType}"
          id="${cellId}"
          role="gridcell"
          aria-label="${WEEK_DAYS[dayIndex]} ${MEAL_TYPES.find((m) => m.key === mealType)?.label || mealType} - ${escapeHtml(mealData.recipe_title)}">
        <span class="meal-cell-dish-name">${escapeHtml(mealData.recipe_title)}</span>
        ${mealData.note ? `<span class="meal-cell-note">${escapeHtml(mealData.note)}</span>` : ""}
        <div class="meal-cell-actions">
          <button class="meal-cell-action-btn" data-action="edit"
                  data-day="${dayIndex}" data-meal="${mealType}" type="button"
                  aria-label="修改备注">备注</button>
          <button class="meal-cell-action-btn" data-action="replace"
                  data-day="${dayIndex}" data-meal="${mealType}" type="button"
                  aria-label="替换菜品">替换</button>
          <button class="meal-cell-action-btn danger" data-action="delete"
                  data-day="${dayIndex}" data-meal="${mealType}" type="button"
                  aria-label="删除">${getIcon("x")}</button>
        </div>
      </td>
    `;
	}

	/**
	 * 渲染整个 4x7 膳食网格表格
	 */
	function renderGrid() {
		const table = document.getElementById("mealplan-grid");
		if (!table) return;

		// 表头
		let html = `<thead><tr><th></th>`;
		WEEK_DAYS.forEach((day) => {
			html += `<th scope="col">${day}</th>`;
		});
		html += `</tr></thead>`;

		// 数据行
		html += `<tbody>`;
		MEAL_TYPES.forEach((mt) => {
			html += `<tr>`;
			// 行标签
			html += `<td class="mealplan-row-label"><span class="meal-label">${getIcon(mt.icon)}${mt.label}</span></td>`;

			// 7 天的格子
			DAY_KEYS.forEach((dayKey, dayIndex) => {
				const dayMeals = weekData?.[dayKey];
				const mealData = dayMeals?.[mt.key] || null;
				html += renderMealCell(mealData, dayIndex, mt.key);
			});

			html += `</tr>`;
		});
		html += `</tbody>`;

		table.innerHTML = html;

		// 绑定格子交互事件
		bindGridEvents();
	}

	// ============================================================
	// 交互处理 - 网格事件
	// ============================================================

	/**
	 * 绑定所有格子的点击事件
	 */
	function bindGridEvents() {
		// 空格子点击 → 打开菜谱选择器
		document.querySelectorAll(".meal-cell-empty").forEach((cell) => {
			cell.addEventListener("click", () => {
				const day = parseInt(cell.dataset.day, 10);
				const meal = cell.dataset.meal;
				openPicker(day, meal);
			});
			cell.addEventListener("keydown", (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					cell.click();
				}
			});
		});

		// 已填充格子的操作按钮
		document.querySelectorAll(".meal-cell-action-btn").forEach((btn) => {
			btn.addEventListener("click", (e) => {
				e.stopPropagation(); // 阻止冒泡到格子本身
				const action = btn.dataset.action;
				const day = parseInt(btn.dataset.day, 10);
				const meal = btn.dataset.meal;
				handleCellAction(action, day, meal);
			});
		});
	}

	/**
	 * 处理已有格子的操作菜单
	 * @param {string} action - 'edit' | 'replace' | 'delete'
	 * @param {number} dayIndex
	 * @param {string} mealType
	 */
	function handleCellAction(action, dayIndex, mealType) {
		const dayKey = DAY_KEYS[dayIndex];
		const cellData = weekData?.[dayKey]?.[mealType];

		switch (action) {
			case "edit": {
				// 修改备注：prompt 输入新备注
				const newNote = prompt(
					`修改「${cellData?.recipe_title || ""}」的备注：`,
					cellData?.note || "",
				);
				if (newNote !== null && weekData?.[dayKey]?.[mealType]) {
					weekData[dayKey][mealType].note = newNote;
					renderGrid();
					if (window.FamTaste?.showToast) {
						window.FamTaste.showToast("备注已更新", "success");
					}
				}
				break;
			}
			case "replace": {
				// 替换：打开菜谱选择器
				openPicker(dayIndex, mealType);
				break;
			}
			case "delete": {
				// 删除：清空该格子
				if (confirm(`确定删除「${cellData?.recipe_title || ""}」？`)) {
					if (weekData?.[dayKey]) {
						weekData[dayKey][mealType] = null;
					}
					renderGrid();
					if (window.FamTaste?.showToast) {
						window.FamTaste.showToast("已删除", "info");
					}
				}
				break;
			}
		}
	}

	// ============================================================
	// 菜谱选择浮层
	// ============================================================

	/**
	 * 打开菜谱选择浮层
	 * @param {number} dayIndex
	 * @param {string} mealType
	 */
	function openPicker(dayIndex, mealType) {
		editingCell = { dayIndex, mealType };
		pickerSearchQuery = "";

		const overlay = document.getElementById("mealpicker-overlay");
		if (!overlay) return;

		const mealLabel =
			MEAL_TYPES.find((m) => m.key === mealType)?.label || mealType;
		const dayLabel = WEEK_DAYS[dayIndex];

		overlay.innerHTML = `
      <div class="mealpicker-panel">
        <div class="mealpicker-header">
          <h3>${dayLabel}${mealLabel} — 选择菜谱</h3>
          <button class="mealpicker-close" id="picker-close" type="button" aria-label="关闭">
            ${getIcon("x")}
          </button>
        </div>
        <div class="mealpicker-search">
          <input type="text" id="picker-search"
                 placeholder="搜索菜名..."
                 autocomplete="off"
                 aria-label="搜索菜谱" />
        </div>
        <div class="mealpicker-list" id="picker-list">
          <!-- 由 renderPickerList 填充 -->
        </div>
      </div>
    `;

		overlay.style.display = "flex";

		// 绑定关闭事件
		document
			.getElementById("picker-close")
			.addEventListener("click", closePicker);
		overlay.addEventListener("click", (e) => {
			if (e.target === overlay) closePicker();
		});

		// 绑定搜索事件
		const searchInput = document.getElementById("picker-search");
		searchInput.addEventListener("input", (e) => {
			pickerSearchQuery = e.target.value.trim().toLowerCase();
			renderPickerList();
		});

		// ESC 关闭
		const escHandler = (e) => {
			if (e.key === "Escape") {
				closePicker();
				document.removeEventListener("keydown", escHandler);
			}
		};
		document.addEventListener("keydown", escHandler);

		// 渲染列表
		renderPickerList();

		// 自动聚焦搜索框
		setTimeout(() => searchInput.focus(), 100);
	}

	/**
	 * 关闭菜谱选择浮层
	 */
	function closePicker() {
		const overlay = document.getElementById("mealpicker-overlay");
		if (overlay) {
			overlay.style.display = "none";
		}
		editingCell = null;
		pickerSearchQuery = "";
	}

	/**
	 * 渲染菜谱选择列表（支持搜索过滤）
	 */
	function renderPickerList() {
		const listEl = document.getElementById("picker-list");
		if (!listEl) return;

		const recipes = window.FamTaste?.Data?.recipes || [];

		// 搜索过滤
		let filtered = recipes;
		if (pickerSearchQuery) {
			filtered = recipes.filter(
				(r) =>
					r.title.toLowerCase().includes(pickerSearchQuery) ||
					r.cuisine_type.includes(pickerSearchQuery),
			);
		}

		if (filtered.length === 0) {
			listEl.innerHTML = `
        <div style="padding: var(--space-xl); text-align: center; color: var(--text-tertiary); font-size: var(--text-sm);">
          未找到匹配的菜谱
        </div>
      `;
			return;
		}

		listEl.innerHTML = filtered
			.map(
				(r) => `
        <button class="mealpicker-item"
                data-recipe-id="${escapeHtml(r.id)}"
                type="button">
          <span class="mealpicker-item-name">${escapeHtml(r.title)}</span>
          <span class="mealpicker-item-meta">
            ${escapeHtml(r.cuisine_type)}
            · ${window.FamTaste?.formatTime ? window.FamTaste.formatTime(r.cooking_time) : r.cooking_time + "分钟"}
          </span>
        </button>
      `,
			)
			.join("");

		// 绑定选择事件
		listEl.querySelectorAll(".mealpicker-item").forEach((item) => {
			item.addEventListener("click", () => {
				selectRecipe(item.dataset.recipe_id);
			});
		});
	}

	/**
	 * 选择菜谱后填入对应格子
	 * @param {string} recipeId
	 */
	function selectRecipe(recipeId) {
		if (!editingCell) return;

		const { dayIndex, mealType } = editingCell;
		const dayKey = DAY_KEYS[dayIndex];
		const recipe = (window.FamTaste?.Data?.recipes || []).find(
			(r) => r.id === recipeId,
		);

		if (!recipe || !weekData?.[dayKey]) return;

		// 写入数据
		weekData[dayKey][mealType] = {
			recipe_id: recipe.id,
			recipe_title: recipe.title,
			note: "",
		};

		// 关闭浮层并重新渲染
		closePicker();
		renderGrid();

		if (window.FamTaste?.showToast) {
			window.FamTaste.showToast(`已添加「${recipe.title}」`, "success");
		}
	}

	// ============================================================
	// 快捷操作
	// ============================================================

	/**
	 * AI 推荐：随机从 Data.recipes 为每个空格子填充合理菜品
	 * 考虑时段匹配（breakfast → meal_time=breakfast 的菜优先）
	 */
	function aiRecommend() {
		const recipes = window.FamTaste?.Data?.recipes || [];
		if (recipes.length === 0) {
			if (window.FamTaste?.showToast) {
				window.FamTaste.showToast("暂无菜谱可供推荐", "warning");
			}
			return;
		}

		let filledCount = 0;

		DAY_KEYS.forEach((dayKey, dayIndex) => {
			MEAL_TYPES.forEach((mt) => {
				// 只填充空格子
				if (weekData?.[dayKey]?.[mt.key]) return;

				// 尝试找时段匹配的菜
				let candidates = recipes.filter((r) => r.meal_time === mt.key);

				// 如果没有时段匹配的，就用全部菜谱
				if (candidates.length === 0) {
					candidates = recipes;
				}

				// 随机选一个
				const picked =
					candidates[Math.floor(Math.random() * candidates.length)];
				if (picked && weekData?.[dayKey]) {
					weekData[dayKey][mt.key] = {
						recipe_id: picked.id,
						recipe_title: picked.title,
						note: "AI 推荐",
					};
					filledCount++;
				}
			});
		});

		renderGrid();

		if (window.FamTaste?.showToast) {
			window.FamTaste.showToast(
				`AI 推荐已生成，填充了 ${filledCount} 个空位`,
				"success",
			);
		}
	}

	/**
	 * 同步购物清单（Demo 阶段模拟 toast）
	 */
	function syncShoppingList() {
		// 统计当前周用到的所有食材（模拟）
		let itemCount = 0;
		DAY_KEYS.forEach((dayKey) => {
			MEAL_TYPES.forEach((mt) => {
				if (weekData?.[dayKey]?.[mt.key]?.recipe_id) {
					itemCount++;
				}
			});
		});

		if (itemCount === 0) {
			if (window.FamTaste?.showToast) {
				window.FamTaste.showToast("本周还没有安排任何菜品", "warning");
			}
			return;
		}

		if (window.FamTaste?.showToast) {
			window.FamTaste.showToast(
				`已将 ${itemCount} 道菜的缺货食材加入购物清单`,
				"success",
			);
		}
	}

	/**
	 * 清空本周所有格子
	 */
	function clearWeek() {
		const totalMeals = DAY_KEYS.length * MEAL_TYPES.length;
		if (
			!confirm(
				`确定要清空本周全部 ${totalMeals} 个餐位的安排吗？此操作不可撤销。`,
			)
		) {
			return;
		}

		DAY_KEYS.forEach((dayKey) => {
			if (weekData?.[dayKey]) {
				MEAL_TYPES.forEach((mt) => {
					weekData[dayKey][mt.key] = null;
				});
			}
		});

		renderGrid();

		if (window.FamTaste?.showToast) {
			window.FamTaste.showToast("本周已清空", "info");
		}
	}

	// ============================================================
	// GSAP 动画
	// ============================================================

	function initGsapAnimation() {
		if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
			console.warn(
				"[FamTaste MealPlan] GSAP 或 ScrollTrigger 未加载，跳过动画",
			);
			return;
		}

		gsap.registerPlugin(ScrollTrigger);

		// 清除旧实例
		ScrollTrigger.getAll().forEach((st) => {
			if (st.vars.id && st.vars.id.startsWith("mealplan-")) st.kill();
		});

		// 表格入场动画
		const table = document.getElementById("mealplan-grid");
		if (table) {
			gsap.fromTo(
				table,
				{ opacity: 0, y: 30 },
				{
					opacity: 1,
					y: 0,
					duration: 0.5,
					ease: "power2.out",
					scrollTrigger: {
						trigger: "#mealplan-table-wrapper",
						start: "top 80%",
						toggleActions: "play none none reverse",
						id: "mealplan-table-enter",
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
			window.FamTaste.injectNav("mealplan");
		}
		if (window.FamTaste?.injectBottomNav) {
			window.FamTaste.injectBottomNav("mealplan");
		}

		// 2. 加载当前周数据
		weekData = getOrCreateWeekData(currentWeekKey);

		// 3. 渲染周导航
		renderWeekNav();

		// 4. 渲染过敏提示条
		renderAllergyAlert();

		// 5. 渲染膳食网格
		renderGrid();

		// 6. 绑定快捷操作按钮
		const btnAiRecommend = document.getElementById("btn-ai-recommend");
		const btnSyncShopping = document.getElementById("btn-sync-shopping");
		const btnClearWeek = document.getElementById("btn-clear-week");

		if (btnAiRecommend) btnAiRecommend.addEventListener("click", aiRecommend);
		if (btnSyncShopping)
			btnSyncShopping.addEventListener("click", syncShoppingList);
		if (btnClearWeek) btnClearWeek.addEventListener("click", clearWeek);

		// 7. 触发页面进入动画
		if (window.FamTaste?.pageEnter) {
			window.FamTaste.pageEnter();
		}

		// 8. 触发滚动揭示
		if (window.FamTaste?.observeReveal) {
			window.FamTaste.observeReveal(".reveal");
		}

		// 9. GSAP ScrollTrigger 动画
		initGsapAnimation();

		console.log(
			"[FamTaste MealPlan] 膳食规划页初始化完成，当前周:",
			currentWeekKey,
		);
	}

	// DOM 就绪后初始化
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
