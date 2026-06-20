/**
 * FamTaste Demo V3 - 厨房场景页逻辑
 *
 * 职责：
 * 1. 注入导航
 * 2. 加载 r002 红烧肉菜谱步骤数据
 * 3. 步骤切换（上一步/下一步）+ 平板内容同步更新
 * 4. 计时器倒数（平板 + 服务卡片同步）
 * 5. "演示设备流转"按钮：依次高亮手机→平板→手表
 * 6. "触发手表震动"按钮：手表震动 + pulse-ring 激活
 * 7. 滚动揭示
 *
 * 依赖：window.FamTaste.Data（data.js）、window.FamTaste.*（shared.js）
 */

(() => {
	// ============================================================
	// 状态
	// ============================================================

	/** 当前菜谱 ID（红烧肉，多步骤适合演示）*/
	const RECIPE_ID = "r002";

	/** 当前步骤索引（0-based）*/
	let currentStepIndex = 2; // 默认第 3 步（糖色阶段，有计时）

	/** 菜谱步骤数据 */
	let steps = [];

	/** 计时器实例 */
	let timerInterval = null;

	/** 计时器剩余秒数 */
	let timerSeconds = 512; // 08:32

	// ============================================================
	// 工具函数
	// ============================================================

	function getIcon(name) {
		return window.FamTasteIcons?.[name] || "";
	}

	/**
	 * 加载菜谱步骤数据
	 */
	function loadRecipeSteps() {
		const recipe = window.FamTaste?.Data?.recipes?.find(
			(r) => r.id === RECIPE_ID,
		);
		if (!recipe || !recipe.versions?.length) return;

		// 取最新版本的步骤
		const latestVersion = recipe.versions[recipe.versions.length - 1];
		steps = latestVersion.steps || [];

		// 更新总步数显示
		const totalEl = document.getElementById("step-total");
		if (totalEl) totalEl.textContent = steps.length;
	}

	/**
	 * 渲染当前步骤到平板厨房模式
	 */
	function renderCurrentStep() {
		if (steps.length === 0) return;

		const step = steps[currentStepIndex];
		if (!step) return;

		// 步骤文案拆分：把"加入生抽 2 勺，冰糖 15g"拆成主标题 + 副标题
		// 简化处理：整句作为主标题，无副标题时隐藏
		const titleEl = document.getElementById("step-title");
		const descEl = document.getElementById("step-desc");
		const currentEl = document.getElementById("step-current");

		if (titleEl) titleEl.innerHTML = step;
		if (descEl) descEl.textContent = "";
		if (currentEl) currentEl.textContent = currentStepIndex + 1;

		// 同步服务卡片
		const widgetStepName = document.querySelector(".widget-step-name");
		if (widgetStepName) {
			widgetStepName.textContent = `红烧肉 · 第 ${currentStepIndex + 1} 步`;
		}

		// 按钮禁用态
		const btnPrev = document.getElementById("btn-prev");
		const btnNext = document.getElementById("btn-next");
		if (btnPrev) btnPrev.disabled = currentStepIndex === 0;
		if (btnNext) btnNext.disabled = currentStepIndex === steps.length - 1;
	}

	/**
	 * 格式化秒数为 MM:SS
	 */
	function formatTime(totalSeconds) {
		const m = Math.floor(totalSeconds / 60);
		const s = totalSeconds % 60;
		return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	}

	/**
	 * 更新计时器显示（平板 + 服务卡片同步）
	 */
	function updateTimerDisplay() {
		const display = formatTime(timerSeconds);

		const tabletTimer = document.getElementById("timer-display");
		if (tabletTimer) tabletTimer.textContent = display;

		const widgetTimer = document.getElementById("widget-timer");
		if (widgetTimer) widgetTimer.textContent = display;

		// 进度条（假设总时长 800 秒）
		const totalDuration = 800;
		const progress = Math.max(0, (totalDuration - timerSeconds) / totalDuration);
		const barFill = document.getElementById("timer-bar-fill");
		if (barFill) barFill.style.width = `${(1 - progress) * 100}%`;
	}

	/**
	 * 启动计时器倒数
	 */
	function startTimer() {
		if (timerInterval) return; // 已在运行

		timerInterval = setInterval(() => {
			timerSeconds--;
			if (timerSeconds <= 0) {
				timerSeconds = 0;
				stopTimer();
				// 计时结束触发手表震动
				triggerWatchPulse();
			}
			updateTimerDisplay();
		}, 1000);
	}

	/**
	 * 停止计时器
	 */
	function stopTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	// ============================================================
	// 交互：步骤切换
	// ============================================================

	function handlePrevStep() {
		if (currentStepIndex > 0) {
			currentStepIndex--;
			renderCurrentStep();
		}
	}

	function handleNextStep() {
		if (currentStepIndex < steps.length - 1) {
			currentStepIndex++;
			renderCurrentStep();
		}
	}

	// ============================================================
	// 交互：设备流转演示
	// ============================================================

	/**
	 * 演示设备流转：依次高亮 手机 → 平板 → 手表
	 */
	function demoDeviceFlow() {
		const stages = document.querySelectorAll(".flow-stage");
		if (stages.length === 0) return;

		// 清除所有激活态
		stages.forEach((s) => s.classList.remove("is-active"));

		// 依次激活
		stages.forEach((stage, index) => {
			setTimeout(() => {
				stages.forEach((s) => s.classList.remove("is-active"));
				stage.classList.add("is-active");

				// 最后一个（手表）触发震动
				if (index === stages.length - 1) {
					setTimeout(triggerWatchPulse, 400);
				}
			}, index * 800);
		});

		// Toast 提示
		if (window.FamTaste?.showToast) {
			window.FamTaste.showToast("菜谱已流转到平板", "success");
		}
	}

	/**
	 * 触发手表震动 + pulse-ring
	 */
	function triggerWatchPulse() {
		const watch = document.querySelector(".watch");
		const pulse = document.getElementById("watch-pulse");

		if (watch) {
			watch.classList.add("is-shaking");
			setTimeout(() => watch.classList.remove("is-shaking"), 1500);
		}
		if (pulse) {
			pulse.classList.add("active");
			setTimeout(() => pulse.classList.remove("active"), 4000);
		}

		if (window.FamTaste?.showToast) {
			window.FamTaste.showToast("手表震动：该翻面了", "warning");
		}
	}

	// ============================================================
	// 事件绑定
	// ============================================================

	function bindEvents() {
		const btnFlow = document.getElementById("btn-flow");
		const btnPrev = document.getElementById("btn-prev");
		const btnNext = document.getElementById("btn-next");
		const btnTriggerWatch = document.getElementById("btn-trigger-watch");

		if (btnFlow) btnFlow.addEventListener("click", demoDeviceFlow);
		if (btnPrev) btnPrev.addEventListener("click", handlePrevStep);
		if (btnNext) btnNext.addEventListener("click", handleNextStep);
		if (btnTriggerWatch)
			btnTriggerWatch.addEventListener("click", triggerWatchPulse);
	}

	// ============================================================
	// 页面初始化
	// ============================================================

	function init() {
		// 1. 注入导航
		if (window.FamTaste?.injectNav) {
			window.FamTaste.injectNav("kitchen");
		}
		if (window.FamTaste?.injectBottomNav) {
			window.FamTaste.injectBottomNav("kitchen");
		}

		// 2. 加载菜谱步骤
		loadRecipeSteps();

		// 3. 渲染当前步骤
		renderCurrentStep();

		// 4. 初始化计时器显示（不立即启动，等用户交互或流转演示）
		updateTimerDisplay();

		// 5. 绑定事件
		bindEvents();

		// 6. 滚动揭示
		if (window.FamTaste?.observeReveal) {
			window.FamTaste.observeReveal(".reveal");
		}

		// 7. 页面进入动画
		if (window.FamTaste?.pageEnter) {
			window.FamTaste.pageEnter();
		}

		console.log("[FamTaste Kitchen] 厨房场景页初始化完成");
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
