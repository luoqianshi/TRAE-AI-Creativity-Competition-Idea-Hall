(function () {
  "use strict";

  const STORAGE_KEY = "lastTraining";

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function render() {
    const area = document.getElementById("statsArea");
    const data = load();

    if (!data || !data.totalCount) {
      area.innerHTML = `
        <div class="stat-card">
          <div class="label">还没有训练记录</div>
          <div class="value" style="font-size:26px; color:var(--text-sub);">先去打个招呼吧 🎈</div>
          <div class="center" style="margin-top:16px;">
            <a class="big-btn blue" href="game.html" style="display:inline-block; line-height:100px; text-decoration:none; padding:0 28px;">开始训练</a>
          </div>
        </div>`;
      return;
    }

    const acc = Math.max(0, Math.min(100, data.accuracy || 0));
    area.innerHTML = `
      <div class="stat-card fade-in">
        <div class="label">⏱ 本次训练时长</div>
        <div class="value">${data.durationText || "0 秒"}</div>
        <div class="muted">共作答 ${data.totalCount} 题，答对 ${data.correctCount} 题</div>
      </div>

      <div class="stat-card fade-in">
        <div class="label">🎯 本次训练正确率</div>
        <div class="value">${acc}%</div>
        <div class="progress-wrap">
          <div class="progress-bar" style="width:0%;"></div>
        </div>
      </div>

      <div class="center" style="margin-top:8px;">
        <a class="big-btn green" href="game.html" style="display:inline-block; line-height:100px; text-decoration:none; padding:0 28px;">再来一次</a>
      </div>
    `;

    // 动画：进度条从 0 缓涨到 acc%
    requestAnimationFrame(() => {
      const bar = area.querySelector(".progress-bar");
      if (bar) bar.style.width = acc + "%";
    });
  }

  function bindReset() {
    const btn = document.getElementById("resetBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      render();
    });
  }

  function init() {
    render();
    bindReset();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
