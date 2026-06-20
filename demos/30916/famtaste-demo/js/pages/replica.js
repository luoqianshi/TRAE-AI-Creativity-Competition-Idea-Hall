/**
 * FamTaste Demo V2 - 复刻时间线页（用户维度）
 * 设计文档引用: design-v2.md §3.6 页面结构 / PRD v1.0 复刻研究核心体验
 *
 * 职责：
 * 1. 注入顶部/底部导航（injectNav + injectBottomNav）
 * 2. 读取 Data.replicaTimeline（18 条记录，按日期倒序）
 * 3. 按日期分组（同月聚合），渲染统计摘要横条
 * 4. 渲染按月份分组的时间轴：
 *    - 左侧竖线时间轴（2px #E5E5EA）
 *    - 每条记录：圆点(result 决定颜色) + 日期 + 菜名链接 + 版本号 + 结果标签 + 备注 + 操作者头像
 * 5. pageEnter() + observeReveal('.timeline-card')
 *
 * 数据结构：
 *   Data.replicaTimeline = [{ date, recipe_id, recipe_title, version, result, notes, author }, ...]
 *   Data.members = [{ id, nickname, avatar(emoji), ... }, ...]
 *
 * 依赖：
 * - window.FamTasteIcons（图标库）
 * - window.FamTaste.Data（replicaTimeline / members）
 * - window.FamTaste.*（公共逻辑：injectNav/injectBottomNav/pageEnter/observeReveal）
 */

(() => {
	// ============================================================
	// 私有工具函数
	// ============================================================

	/**
	 * 获取图标 SVG 字符串
	 * @param {string} name - 图标名
	 * @returns {string} SVG 字符串
	 */
	function getIcon(name) {
		return window.FamTasteIcons?.[name] || "";
	}

	/**
	 * 转义 HTML 特殊字符，防止 XSS
	 * @param {string} text - 原始文本
	 * @returns {string} 转义后的安全文本
	 */
	function escapeHtml(text) {
		if (typeof text !== "string") {
			text = String(text);
		}
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
	 * 根据作者昵称获取成员信息（含头像 emoji）
	 * @param {string} nickname - 作者昵称（如 "我"、"奶奶"）
	 * @returns {{ nickname: string, avatar: string }} 成员信息
	 */
	function getMemberByNickname(nickname) {
		const members = window.FamTaste?.Data?.members || [];
		const member = members.find((m) => m.nickname === nickname);
		return member || { nickname: nickname, avatar: "\u{1F464}" }; // 默认头像
	}

	/**
	 * 获取结果状态对应的样式类、标签文本和颜色
	 * @param {string} result - 结果状态 ('failed' | 'okay' | 'perfect')
	 * @returns {{ className: string, label: string, color: string }}
	 */
	function getResultStyle(result) {
		const map = {
			failed: {
				className: "result-failed",
				label: "失败",
				color: "var(--status-fail)", // 暖灰
			},
			okay: {
				className: "result-okay",
				label: "尚可",
				color: "var(--status-ok)", // 暖黄
			},
			perfect: {
				className: "result-perfect",
				label: "完美",
				color: "var(--status-perfect)", // 灶火橙
			},
		};
		return map[result] || map.okay;
	}

	/**
	 * 将 "2026-06-02" 格式化为 "06-02"
	 * @param {string} dateStr - 完整日期字符串
	 * @returns {string} MM-DD 格式
	 */
	function formatDay(dateStr) {
		if (!dateStr || dateStr.length < 10) return dateStr;
		return dateStr.substring(5); // "MM-DD"
	}

	/**
	 * 将 "2026-06-02" 格式化为 "2026年6月"
	 * @param {string} dateStr - 完整日期字符串
	 * @returns {string} 中文月份格式
	 */
	function formatMonth(dateStr) {
		if (!dateStr || dateStr.length < 7) return dateStr;
		const [year, month] = dateStr.split("-");
		return `${year}年${parseInt(month, 10)}月`;
	}

	/**
	 * 提取年月键 "2026-06" 用于分组
	 * @param {string} dateStr - 完整日期字符串
	 * @returns {string} YYYY-MM 格式
	 */
	function getMonthKey(dateStr) {
		if (!dateStr || dateStr.length < 7) return dateStr;
		return dateStr.substring(0, 7);
	}

	// ============================================================
	// 统计摘要渲染
	// ============================================================

	/**
	 * 渲染统计摘要横条（4 个数字卡片）
	 * @param {Array} timeline - replicaTimeline 全量数据
	 */
	function renderStats(timeline) {
		const container = document.getElementById("replica-stats");
		if (!container) return;

		const total = timeline.length;
		const uniqueRecipes = new Set(timeline.map((r) => r.recipe_id)).size;
		const perfectCount = timeline.filter((r) => r.result === "perfect").length;
		const okayCount = timeline.filter((r) => r.result === "okay").length;
		const failedCount = timeline.filter((r) => r.result === "failed").length;

		container.innerHTML = `
      <div class="stat-card">
        <span class="stat-number">${total}</span>
        <span class="stat-label">次尝试</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">${uniqueRecipes}</span>
        <span class="stat-label">道菜</span>
      </div>
      <div class="stat-card stat-card-perfect">
        <span class="stat-number">${perfectCount}</span>
        <span class="stat-label">完美</span>
      </div>
      <div class="stat-card stat-card-okay">
        <span class="stat-number">${okayCount}</span>
        <span class="stat-label">尚可</span>
      </div>
      <div class="stat-card stat-card-failed">
        <span class="stat-number">${failedCount}</span>
        <span class="stat-label">失败</span>
      </div>
    `;
	}

	// ============================================================
	// 时间线渲染
	// ============================================================

	/**
	 * 渲染单条记录的时间线卡片
	 * @param {Object} record - 单条 replicaTimeline 记录
	 * @returns {string} HTML 字符串
	 */
	function renderTimelineCard(record) {
		const resultStyle = getResultStyle(record.result);
		const member = getMemberByNickname(record.author);
		const dayStr = formatDay(record.date);

		return `
      <div class="timeline-card ${resultStyle.className}" role="article" aria-label="${escapeHtml(record.recipe_title)} v${record.version}">
        <!-- 左侧圆点标记 -->
        <div class="timeline-dot" style="background-color: ${resultStyle.color};" aria-hidden="true"></div>

        <!-- 右侧内容卡片 -->
        <div class="timeline-card-body">
          <!-- 卡片首行：菜名 + 版本号 + 结果标签 -->
          <div class="timeline-card-header">
            <div class="timeline-card-title-row">
              <a href="recipe-detail.html?id=${escapeHtml(record.recipe_id)}"
                 class="timeline-recipe-link"
                 aria-label="查看 ${escapeHtml(record.recipe_title)} 详情">
                ${escapeHtml(record.recipe_title)}
              </a>
              <span class="timeline-version-badge">v${record.version}</span>
              <span class="timeline-result-tag ${resultStyle.className}"
                    style="background-color: ${resultStyle.color}; color: #ffffff;">
                ${resultStyle.label}
              </span>
            </div>
            <span class="timeline-date">${dayStr}</span>
          </div>

          <!-- 备注文字 -->
          ${record.notes ? `<p class="timeline-notes">${escapeHtml(record.notes)}</p>` : ""}

          <!-- 操作者 -->
          <div class="timeline-author">
            <span class="timeline-author-avatar" aria-label="${escapeHtml(member.nickname)}">${member.avatar}</span>
            <span class="timeline-author-name">${escapeHtml(member.nickname)}</span>
          </div>
        </div>
      </div>
    `;
	}

	/**
	 * 渲染整个时间线（按月份分组）
	 * @param {Array} timeline - replicaTimeline 全量数据
	 */
	function renderTimeline(timeline) {
		const container = document.getElementById("replica-timeline");
		if (!container) return;

		if (!timeline || timeline.length === 0) {
			container.innerHTML = `
        <div class="empty-state">
          ${getIcon("repeat")}
          <h3>暂无复刻记录</h3>
          <p>开始你的第一次复刻尝试吧</p>
          <a href="replica-form.html" class="btn btn-primary btn-sm mt-md">创建复刻</a>
        </div>
      `;
			return;
		}

		// 按月份分组（数据已按日期倒序排列，保持倒序）
		const groups = {};
		timeline.forEach((record) => {
			const key = getMonthKey(record.date);
			if (!groups[key]) {
				groups[key] = [];
			}
			groups[key].push(record);
		});

		// 按月份键倒序排列组
		const sortedMonthKeys = Object.keys(groups).sort().reverse();

		// 渲染每个月份组
		const html = sortedMonthKeys
			.map((monthKey) => {
				const records = groups[monthKey];
				const monthLabel = formatMonth(records[0].date);
				const cardsHtml = records.map((r) => renderTimelineCard(r)).join("");

				return `
          <div class="timeline-month-group" role="group" aria-label="${monthLabel}">
            <h2 class="timeline-month-header">${monthLabel}</h2>
            <div class="timeline-month-records">
              ${cardsHtml}
            </div>
          </div>
        `;
			})
			.join("");

		container.innerHTML = html;
	}

	// ============================================================
	// GSAP 动画
	// ============================================================

	/**
	 * 初始化 GSAP ScrollTrigger 入场动画
	 * 卡片从下往上依次淡入，stagger 0.12s
	 */
	function initGsapAnimation() {
		if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
			console.warn("[FamTaste Replica] GSAP 或 ScrollTrigger 未加载，跳过动画");
			return;
		}

		gsap.registerPlugin(ScrollTrigger);

		// 清除旧实例
		ScrollTrigger.getAll().forEach((st) => {
			if (st.vars.id?.startsWith("replica-tl-")) st.kill();
		});

		const cards = document.querySelectorAll(".timeline-card");
		if (cards.length === 0) return;

		gsap.fromTo(
			cards,
			{
				opacity: 0,
				y: 30,
			},
			{
				opacity: 1,
				y: 0,
				duration: 0.5,
				ease: "power2.out",
				stagger: 0.12,
				scrollTrigger: {
					trigger: "#replica-timeline",
					start: "top 80%",
					end: "bottom 40%",
					toggleActions: "play none none reverse",
					id: "replica-tl-stagger",
				},
			},
		);
	}

	// ============================================================
	// 页面初始化
	// ============================================================

	function init() {
		// 1. 注入顶部 + 底部导航
		if (window.FamTaste?.injectNav) {
			window.FamTaste.injectNav("replica");
		}
		if (window.FamTaste?.injectBottomNav) {
			window.FamTaste.injectBottomNav("replica");
		}

		// 2. 读取数据
		const timeline = window.FamTaste?.Data?.replicaTimeline || [];

		// 3. 渲染统计摘要
		renderStats(timeline);

		// 4. 渲染时间线（按日期分组的用户维度视图）
		renderTimeline(timeline);

		// 5. 触发页面进入动画
		if (window.FamTaste?.pageEnter) {
			window.FamTaste.pageEnter();
		}

		// 6. 触发滚动揭示
		if (window.FamTaste?.observeReveal) {
			window.FamTaste.observeReveal(".reveal");
		}

		// 7. GSAP ScrollTrigger 动画
		initGsapAnimation();

		console.log(
			`[FamTaste Replica] 复刻时间线页初始化完成，共 ${timeline.length} 条记录`,
		);
	}

	// DOM 就绪后初始化
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
