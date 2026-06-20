/**
 * FamTaste Demo V3 - 家庭忌口档案页逻辑
 *
 * 职责：
 * 1. 注入导航
 * 2. 渲染全家禁忌汇总（按食材聚合，标注涉及成员 + 严重程度）
 * 3. 渲染成员卡片（每人过敏源/不喜欢/角色）
 * 4. 渲染口味画像（辣/甜/咸三维分布）
 * 5. 滚动揭示
 *
 * 数据：window.FamTaste.Data.members
 *   members[i].restrictions = { allergies: [...], dislikes: [...] }
 *   members[i].preferences = { spicy, sweet, salt }
 *
 * 依赖：window.FamTaste.*（shared.js）
 */

(() => {
	// ============================================================
	// 工具函数
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
	 * 取成员昵称首字符作为头像文字（design-taste 禁 emoji，用首字替代）
	 */
	function getAvatarChar(nickname) {
		if (!nickname) return "?";
		return nickname.charAt(0);
	}

	/**
	 * 身份中文映射
	 */
	const IDENTITY_MAP = {
		grandma: "奶奶",
		grandpa: "爷爷",
		dad: "爸爸",
		mom: "妈妈",
		me: "我",
		other: "家人",
	};

	/**
	 * 口味等级 → 数值（用于进度条宽度）
	 */
	const TASTE_LEVEL = {
		none: 0,
		low: 25,
		light: 25,
		medium: 55,
		high: 85,
		heavy: 90,
	};

	const TASTE_LABEL = {
		none: "不吃",
		low: "少",
		light: "清淡",
		medium: "适中",
		high: "重",
		heavy: "重口",
	};

	// ============================================================
	// 渲染：全家禁忌汇总
	// ============================================================

	/**
	 * 聚合所有成员的过敏源和忌口，按食材分组
	 * @returns {Array} [{ food, level: 'severe'|'mild', members: [{nickname, identity}] }]
	 */
	function aggregateRestrictions(members) {
		const map = new Map(); // food -> { level, members: Map<nickname, identity> }

		members.forEach((m) => {
			const allergies = m.restrictions?.allergies || [];
			const dislikes = m.restrictions?.dislikes || [];

			allergies.forEach((food) => {
				if (!map.has(food)) {
					map.set(food, { level: "severe", members: new Map() });
				}
				map.get(food).members.set(m.nickname, m.identity);
			});

			dislikes.forEach((food) => {
				if (!map.has(food)) {
					map.set(food, { level: "mild", members: new Map() });
				} else if (map.get(food).level === "severe") {
					// 已是严重（有人过敏），保持严重
				} else {
					map.get(food).level = "mild";
				}
				map.get(food).members.set(m.nickname, m.identity);
			});
		});

		// 转为数组，严重的排前面
		return Array.from(map.entries())
			.map(([food, data]) => ({
				food,
				level: data.level,
				members: Array.from(data.members.entries()).map(
					([nickname, identity]) => ({ nickname, identity }),
				),
			}))
			.sort((a, b) => {
				if (a.level !== b.level) {
					return a.level === "severe" ? -1 : 1;
				}
				return b.members.length - a.members.length;
			});
	}

	function renderAllergySummary(members) {
		const container = document.getElementById("allergy-summary");
		if (!container) return;

		const items = aggregateRestrictions(members);

		if (items.length === 0) {
			container.innerHTML = `
				<div class="empty-state">
					<h3>全家无禁忌</h3>
					<p>暂未记录任何过敏源或忌口</p>
				</div>
			`;
			return;
		}

		const head = `
			<div class="allergy-summary-head">
				<span>食材</span>
				<span>涉及家人</span>
				<span>建议</span>
			</div>
		`;

		const rows = items
			.map((item) => {
				const isSevere = item.level === "severe";
				const avatars = item.members
					.map(
						(m) =>
							`<span class="avatar" title="${escapeHtml(m.nickname)}">${escapeHtml(getAvatarChar(m.nickname))}</span>`,
					)
					.join("");

				return `
					<div class="allergy-row ${isSevere ? "allergy-row--severe" : "allergy-row--mild"}">
						<div class="allergy-food">
							<span class="allergy-level-dot allergy-level-dot--${item.level}"></span>
							${escapeHtml(item.food)}
						</div>
						<div class="allergy-members">${avatars}</div>
						<div class="allergy-action">${isSevere ? "必须避开" : "尽量避开"}</div>
					</div>
				`;
			})
			.join("");

		container.innerHTML = head + rows;
	}

	// ============================================================
	// 渲染：成员卡片
	// ============================================================

	function renderMemberCards(members) {
		const container = document.getElementById("member-grid");
		if (!container) return;

		container.innerHTML = members
			.map((m) => {
				const allergies = m.restrictions?.allergies || [];
				const dislikes = m.restrictions?.dislikes || [];
				const isAdmin = m.role === "admin";

				const allergyTags = allergies.length
					? allergies
							.map(
								(a) =>
									`<span class="tag tag-allergy">${escapeHtml(a)}</span>`,
							)
							.join("")
					: `<span class="member-empty">无已知过敏</span>`;

				const dislikeTags = dislikes.length
					? dislikes
							.map(
								(d) =>
									`<span class="tag tag-dislike">${escapeHtml(d)}</span>`,
							)
							.join("")
					: `<span class="member-empty">都接受</span>`;

				return `
					<div class="member-card" role="article" aria-label="${escapeHtml(m.nickname)} 的忌口档案">
						<div class="member-card-head">
							<div class="member-avatar">${escapeHtml(getAvatarChar(m.nickname))}</div>
							<div class="member-info">
								<div class="member-name">${escapeHtml(m.nickname)}</div>
								<div class="member-identity">${escapeHtml(IDENTITY_MAP[m.identity] || m.identity)}</div>
							</div>
							<span class="member-role-tag ${isAdmin ? "member-role-tag--admin" : "member-role-tag--member"}">
								${isAdmin ? "管理员" : "成员"}
							</span>
						</div>

						<div class="member-section">
							<div class="member-section-label">过敏源</div>
							<div class="member-tags">${allergyTags}</div>
						</div>

						<div class="member-section">
							<div class="member-section-label">不喜欢</div>
							<div class="member-tags">${dislikeTags}</div>
						</div>
					</div>
				`;
			})
			.join("");
	}

	// ============================================================
	// 渲染：口味画像
	// ============================================================

	function renderTasteProfile(members) {
		const container = document.getElementById("taste-grid");
		if (!container) return;

		const dimensions = [
			{ key: "spicy", label: "辣度", fillClass: "taste-bar-fill--spicy" },
			{ key: "sweet", label: "甜度", fillClass: "taste-bar-fill--sweet" },
			{ key: "salt", label: "咸度", fillClass: "taste-bar-fill--salt" },
		];

		container.innerHTML = dimensions
			.map((dim) => {
				const bars = members
					.map((m) => {
						const level = m.preferences?.[dim.key] || "none";
						const value = TASTE_LEVEL[level] || 0;
						const label = TASTE_LABEL[level] || level;
						return `
							<div class="taste-bar-row">
								<div class="taste-bar-avatar">${escapeHtml(getAvatarChar(m.nickname))}</div>
								<div class="taste-bar-track">
									<div class="taste-bar-fill ${dim.fillClass}" style="width:${value}%"></div>
								</div>
								<div class="taste-bar-value">${escapeHtml(label)}</div>
							</div>
						`;
					})
					.join("");

				return `
					<div class="taste-card reveal">
						<h4 class="taste-card-title">${escapeHtml(dim.label)}</h4>
						<div class="taste-distribution">${bars}</div>
					</div>
				`;
			})
			.join("");

		// 重新触发新渲染的 reveal 元素
		if (window.FamTaste?.observeReveal) {
			window.FamTaste.observeReveal(".taste-card.reveal");
		}
	}

	// ============================================================
	// 页面初始化
	// ============================================================

	function init() {
		// 1. 注入导航
		if (window.FamTaste?.injectNav) {
			window.FamTaste.injectNav("restrictions");
		}
		if (window.FamTaste?.injectBottomNav) {
			window.FamTaste.injectBottomNav("restrictions");
		}

		// 2. 读取成员数据
		const members = window.FamTaste?.Data?.members || [];

		// 3. 渲染三块内容
		renderAllergySummary(members);
		renderMemberCards(members);
		renderTasteProfile(members);

		// 4. 滚动揭示
		if (window.FamTaste?.observeReveal) {
			window.FamTaste.observeReveal(".reveal");
		}

		// 5. 页面进入动画
		if (window.FamTaste?.pageEnter) {
			window.FamTaste.pageEnter();
		}

		console.log(
			`[FamTaste Restrictions] 忌口档案页初始化完成，共 ${members.length} 位成员`,
		);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
