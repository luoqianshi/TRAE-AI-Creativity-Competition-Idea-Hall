(function () {
  "use strict";

  const STORAGE_KEY = "lastTraining";

  // 打招呼脚本数据（内联兜底，避免 file:// 下 fetch 被拦截）
  const SCRIPT_FALLBACK = {
    title: "打招呼场景",
    steps: [
      {
        emoji: "🏫👩‍🏫",
        scene: "场景一 · 小区里遇到班主任",
        desc: "小明走在小区路上，抬头看见班主任迎面走来，距离越来越近。",
        question: "这时候，你会怎么做呢？",
        options: [
          { text: "🖐️ 抬头看着老师，挥手说：老师好！", correct: true },
          { text: "🏃 低下头，假装没看见，快步跑开", correct: false },
          { text: "🙈 躲到路边大树后面，等老师走过", correct: false }
        ],
        rightTip: "真棒！主动打招呼是很礼貌的行为哦👏 老师会很开心的。",
        wrongTip: "没关系哦～遇到认识的人主动打招呼会更有礼貌，我们再试一次吧😉"
      },
      {
        emoji: "👋😊",
        scene: "场景二 · 回应老师的问候",
        desc: "老师笑着对你说：「小明，你好呀，今天过得怎么样？」",
        question: "你会怎么回答呢？",
        options: [
          { text: "🗣️ 看着老师说：老师好！我今天很开心，谢谢老师～", correct: true },
          { text: "😶 不说话，只是盯着地面看", correct: false },
          { text: "📱 低头看手机，不理会老师", correct: false }
        ],
        rightTip: "做得很好！眼睛看着对方说话，是尊重又温暖的表现👏",
        wrongTip: "没关系的～说话时看着对方，会让老师感受到你的友好，再试一次吧😊"
      },
      {
        emoji: "🌟🎉",
        scene: "完成啦！",
        desc: "你已经学会了主动打招呼，真的很棒！",
        question: "点击下面的按钮，查看本次训练的小成绩～",
        options: [{ text: "📊 查看本次训练统计", correct: true }],
        rightTip: "恭喜你完成了打招呼的小训练！继续保持这份勇气哦🌟",
        wrongTip: ""
      }
    ]
  };

  let script = null;
  let state = {
    stepIndex: 0,
    correctCount: 0,
    totalShown: 0,  // 实际被选择过的题目数（不含最终页）
    startTime: Date.now()
  };

  function formatDuration(ms) {
    const s = Math.max(1, Math.round(ms / 1000));
    const m = Math.floor(s / 60);
    const r = s % 60;
    if (m === 0) return r + " 秒";
    return m + " 分 " + r + " 秒";
  }

  function saveAndFinish() {
    const durationMs = Date.now() - state.startTime;
    const correctCount = state.correctCount;
    const totalCount = state.totalShown; // 总作答次数（含错后重答）
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        durationMs: durationMs,
        durationText: formatDuration(durationMs),
        correctCount: correctCount,
        totalCount: totalCount,
        accuracy: accuracy,
        at: new Date().toISOString()
      }));
    } catch (e) {}
    window.location.href = "parent.html";
  }

  function renderStep() {
    const step = script.steps[state.stepIndex];
    const area = document.getElementById("sceneArea");
    area.innerHTML = "";

    const box = document.createElement("div");
    box.className = "scene-box fade-in";

    const isFinishStep = (state.stepIndex === script.steps.length - 1);

    let optionsHtml = "";
    step.options.forEach((opt, idx) => {
      optionsHtml += `<button class="option-btn" data-idx="${idx}">${opt.text}</button>`;
    });

    box.innerHTML = `
      <div class="scene-emoji">${step.emoji}</div>
      <div class="scene-title">${step.scene}</div>
      <div class="scene-desc">${step.desc}</div>
      <div class="scene-desc" style="color:var(--text-main); font-weight:700; margin-bottom:18px;">${step.question}</div>
      <div class="option-list">${optionsHtml}</div>
      <div id="feedbackSlot"></div>
    `;
    area.appendChild(box);

    // 绑定选项点击
    box.querySelectorAll(".option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-idx"), 10);
        const chosen = step.options[idx];

        // 最终场景：直接跳统计
        if (isFinishStep) {
          saveAndFinish();
          return;
        }

        state.totalShown += 1;
        const slot = box.querySelector("#feedbackSlot");
        slot.innerHTML = "";

        if (chosen.correct) {
          state.correctCount += 1;
          const fb = document.createElement("div");
          fb.className = "feedback correct fade-in";
          fb.innerHTML = step.rightTip || "答对啦👏";
          slot.appendChild(fb);

          const next = document.createElement("button");
          next.className = "next-btn fade-in";
          next.textContent = state.stepIndex + 1 < script.steps.length - 1 ? "下一步 ▶" : "完成训练 🌟";
          next.addEventListener("click", () => {
            state.stepIndex += 1;
            renderStep();
          });
          slot.appendChild(next);
        } else {
          const fb = document.createElement("div");
          fb.className = "feedback wrong fade-in";
          fb.innerHTML = step.wrongTip || "没关系哦，我们再试一次～";
          slot.appendChild(fb);

          const retry = document.createElement("button");
          retry.className = "next-btn fade-in";
          retry.style.background = "var(--pink-deep)";
          retry.textContent = "再来一次 💪";
          retry.addEventListener("click", () => {
            renderStep(); // 重绘本题
          });
          slot.appendChild(retry);
        }
      });
    });
  }

  function loadScript(cb) {
    try {
      fetch("../data/greet_script.json")
        .then(r => r.json())
        .then(d => cb(d))
        .catch(() => cb(SCRIPT_FALLBACK));
    } catch (e) { cb(SCRIPT_FALLBACK); }
  }

  function init() {
    state.startTime = Date.now();
    loadScript(d => {
      script = d;
      renderStep();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
