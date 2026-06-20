/**
 * FamTaste Demo V3 - 买菜协同页逻辑
 *
 * 职责：
 * 1. 注入导航
 * 2. 加载 Data.shoppingList 渲染可勾选清单
 * 3. 勾选交互：点击切换状态，实时更新统计（已买/待买/总价）
 * 4. 加购：输入框添加临时商品
 * 5. "演示家庭同步"按钮：依次高亮设备 + 模拟家人勾选
 * 6. "手表勾选演示"按钮：手表震动 + pulse-ring
 * 7. 滚动揭示
 *
 * 依赖：window.FamTaste.Data（data.js）、window.FamTaste.*（shared.js）
 */

(() => {
	// ============================================================
	// 状态
	// ============================================================

	/** 本地清单数据（从 Data 拷贝，支持运行时修改）*/
	let items = [];

	// ============================================================
	// 工具函数
	// ============================================================

	function getIcon(name) {
		return window.FamTasteIcons?.[name] || "";
	}

	/**
	 * 加载购物清单数据
	 */
	function loadShoppingList() {
		const data = window.FamTaste?.Data?.shoppingList;
		if (!data || !Array.isArray(data.items)) return;

		// 深拷贝，避免污染原始数据
		items = data.items.map((item) => ({ ...item }));
	}

	/**
	 * 转义 HTML
	 */
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

	// ============================================================
	// 渲染
	// ============================================================

	/**
	 * 渲染清单列表
	 */
	function renderItems() {
		const container = document.getElementById("shopping-items");
		if (!container) return;

		if (items.length === 0) {
			container.innerHTML = `
				<div class="empty-state">
					<h3>清单是空的</h3>
					<p>在下方添加你想买的食材</p>
				</div>
			`;
			updateStats();
			return;
		}

		container.innerHTML = items
			.map(
				(item) => `
			<div class="shopping-item ${item.checked ? "is-checked" : ""}" data-id="${escapeHtml(item.id)}" role="checkbox" aria-checked="${item.checked}" tabindex="0">
				<div class="shopping-checkbox"></div>
				<div class="shopping-item-body">
					<div class="shopping-item-name">${escapeHtml(item.name)} <span class="mono" style="color:var(--text-secondary);font-size:0.8em">${escapeHtml(item.quantity || "")}</span></div>
					<div class="shopping-item-meta">
						${item.note ? `<span class="shopping-item-note">${escapeHtml(item.note)}</span>` : ""}
						${item.checked_by ? `<span>· ${escapeHtml(item.checked_by)} 已买</span>` : ""}
					</div>
				</div>
				${item.price ? `<div class="shopping-item-price mono">¥${item.price}</div>` : ""}
			</div>
		`,
			)
			.join("");

		// 绑定点击事件
		container.querySelectorAll(".shopping-item").forEach((el) => {
			el.addEventListener("click", () => toggleItem(el.dataset.id));
			el.addEventListener("keydown", (e) => {
				if (e.key === " " || e.key === "Enter") {
					e.preventDefault();
					toggleItem(el.dataset.id);
				}
			});
		});

		updateStats();
	}

	/**
	 * 切换单项勾选状态
	 */
	function toggleItem(id) {
		const item = items.find((i) => i.id === id);
		if (!item) return;

		item.checked = !item.checked;
		if (item.checked && !item.checked_by) {
			item.checked_by = "我";
		} else if (!item.checked) {
			item.checked_by = null;
		}

		renderItems();

		if (window.FamTaste?.showToast) {
			window.FamTaste.showToast(
				item.checked ? `已勾选 ${item.name}` : `取消勾选 ${item.name}`,
				item.checked ? "success" : "info",
			);
		}
	}

	/**
	 * 更新统计（已买/待买/总价/进度）
	 */
	function updateStats() {
		const checkedItems = items.filter((i) => i.checked);
		const checkedCount = checkedItems.length;
		const remainingCount = items.length - checkedCount;
		const totalSpent = checkedItems.reduce(
			(sum, i) => sum + (i.price || 0),
			0,
		);

		const progressTag = document.getElementById("progress-tag");
		if (progressTag) {
			progressTag.textContent = `已买 ${checkedCount}/${items.length}`;
		}

		const checkedEl = document.getElementById("checked-count");
		if (checkedEl) checkedEl.textContent = checkedCount;

		const remainingEl = document.getElementById("remaining-count");
		if (remainingEl) remainingEl.textContent = remainingCount;

		const totalEl = document.getElementById("total-spent");
		if (totalEl) totalEl.textContent = totalSpent;
	}

	// ============================================================
	// 加购
	// ============================================================

	function handleAddItem() {
		const input = document.getElementById("add-item-input");
		if (!input || !input.value.trim()) return;

		const value = input.value.trim();
		// 简单解析：支持 "豆腐 1块" / "豆腐" 两种
		const match = value.match(/^(.+?)\s+(\d+\S*)$/);
		const name = match ? match[1] : value;
		const quantity = match ? match[2] : "";

		const newItem = {
			id: `custom-${Date.now()}`,
			name,
			quantity,
			checked: false,
			checked_by: null,
			price: null,
			note: "临时加购",
		};

		items.push(newItem);
		input.value = "";
		renderItems();

		if (window.FamTaste?.showToast) {
			window.FamTaste.showToast(`已加购 ${name}`, "success");
		}
	}

	// ============================================================
	// 设备流转演示
	// ============================================================

	/**
	 * 演示家庭同步：依次高亮 手机 → 手表 → 家人设备
	 */
	function demoFamilySync() {
		const stages = document.querySelectorAll(".flow-stage");
		if (stages.length === 0) return;

		stages.forEach((s) => s.classList.remove("is-active"));

		stages.forEach((stage, index) => {
			setTimeout(() => {
				stages.forEach((s) => s.classList.remove("is-active"));
				stage.classList.add("is-active");

				// 手表阶段触发震动
				if (stage.dataset.stage === "watch") {
					setTimeout(() => {
						const watch = stage.querySelector(".watch");
						if (watch) {
							watch.classList.add("is-shaking");
							setTimeout(() => watch.classList.remove("is-shaking"), 1500);
						}
					}, 300);
				}
			}, index * 800);
		});

		// 演示完成后，模拟勾选第二项（鲈鱼）
		setTimeout(() => {
			const yuItem = items.find((i) => i.name === "鲈鱼");
			if (yuItem && !yuItem.checked) {
				yuItem.checked = true;
				yuItem.checked_by = "爸爸";
				renderItems();
				if (window.FamTaste?.showToast) {
					window.FamTaste.showToast("爸爸刚买了鲈鱼", "success");
				}
			}
		}, stages.length * 800 + 400);

		if (window.FamTaste?.showToast) {
			window.FamTaste.showToast("家庭多端同步中...", "info");
		}
	}

	/**
	 * 手表勾选演示：震动 + 模拟勾选下一未买项
	 */
	function demoWatchCheck() {
		const watch = document.querySelector('.flow-stage[data-stage="watch"] .watch');
		if (watch) {
			watch.classList.add("is-shaking");
			setTimeout(() => watch.classList.remove("is-shaking"), 1500);
		}

		const pulse = document.getElementById("watch-pulse");
		if (pulse) {
			pulse.classList.add("active");
			setTimeout(() => pulse.classList.remove("active"), 4000);
		}

		// 模拟勾选下一个未买项
		setTimeout(() => {
			const nextUnchecked = items.find((i) => !i.checked);
			if (nextUnchecked) {
				nextUnchecked.checked = true;
				nextUnchecked.checked_by = "我（手表）";
				renderItems();
				if (window.FamTaste?.showToast) {
					window.FamTaste.showToast(
						`手表勾选：${nextUnchecked.name}`,
						"success",
					);
				}
			} else {
				if (window.FamTaste?.showToast) {
					window.FamTaste.showToast("全部买完了！", "success");
				}
			}
		}, 800);
	}

	// ============================================================
	// 事件绑定
	// ============================================================

	function bindEvents() {
		const btnSync = document.getElementById("btn-sync-demo");
		const btnWatch = document.getElementById("btn-watch-check");
		const btnAdd = document.getElementById("btn-add");
		const inputAdd = document.getElementById("add-item-input");

		if (btnSync) btnSync.addEventListener("click", demoFamilySync);
		if (btnWatch) btnWatch.addEventListener("click", demoWatchCheck);
		if (btnAdd) btnAdd.addEventListener("click", handleAddItem);
		if (inputAdd) {
			inputAdd.addEventListener("keydown", (e) => {
				if (e.key === "Enter") handleAddItem();
			});
		}
	}

	// ============================================================
	// 页面初始化
	// ============================================================

	function init() {
		// 1. 注入导航
		if (window.FamTaste?.injectNav) {
			window.FamTaste.injectNav("shopping");
		}
		if (window.FamTaste?.injectBottomNav) {
			window.FamTaste.injectBottomNav("shopping");
		}

		// 2. 加载清单数据
		loadShoppingList();

		// 3. 渲染清单
		renderItems();

		// 4. 绑定事件
		bindEvents();

		// 5. 滚动揭示
		if (window.FamTaste?.observeReveal) {
			window.FamTaste.observeReveal(".reveal");
		}

		// 6. 页面进入动画
		if (window.FamTaste?.pageEnter) {
			window.FamTaste.pageEnter();
		}

		console.log(
			`[FamTaste Shopping] 买菜协同页初始化完成，共 ${items.length} 项`,
		);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
