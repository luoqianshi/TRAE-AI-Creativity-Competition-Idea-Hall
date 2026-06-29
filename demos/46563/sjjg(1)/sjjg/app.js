// Claude Exam Reviewer - Application Logic
document.addEventListener("DOMContentLoaded", () => {
  // --- Application State ---
  let state = {
    activeTab: "study", // 'study', 'wrong', 'stats', 'add'
    questions: [],
    activeQuestionId: null,
    userAnswers: {}, // questionId -> answer (index or text)
    questionStatuses: {}, // questionId -> 'correct' | 'incorrect' | 'unattempted'
    wrongBookIds: [], // array of questionIds
    addedQuestions: [], // user-added questions (persisted)
    deepseekApiKey: "", // user-supplied DeepSeek key (persisted)
    pendingImage: null, // { dataURL, filename, size } currently being processed
    zoomScale: 1.0,
    panX: 0,
    panY: 0,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    showOriginalOpen: false
  };

  // --- DOM Elements ---
  const navLinks = document.querySelectorAll(".nav-link");
  const statsCardContainer = document.getElementById("stats-summary-card");
  const questionListContainer = document.getElementById("question-list-container");
  const workspaceContainer = document.getElementById("workspace-container");
  const statsWorkspace = document.getElementById("stats-workspace");
  const aiAddWorkspace = document.getElementById("ai-add-workspace");
  const settingsDialog = document.getElementById("settings-dialog");
  const btnOpenSettings = document.getElementById("btn-open-settings");
  const btnCloseSettings = document.getElementById("btn-close-settings");
  const btnSaveSettings = document.getElementById("btn-save-settings");
  const btnTestApi = document.getElementById("btn-test-api");
  const inputApiKey = document.getElementById("input-api-key");
  const settingsStatus = document.getElementById("settings-status");

  // --- Theme Setup ---
  function setupTheme() {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e) => {
      document.body.classList.toggle("wrong-mode-active", e.matches);
    };
    mediaQuery.addEventListener("change", handleThemeChange);
    handleThemeChange(mediaQuery);
  }

  // --- Initialization ---
  async function init() {
    console.log("[DBG-INIT] statsCardContainer =", !!statsCardContainer, "questionListContainer =", !!questionListContainer, "workspaceContainer =", !!workspaceContainer);
    setupTheme();
    setupNavListeners();
    setupSettingsDialog();
    console.log("[DBG-INIT] after setup, btnSaveSettings =", !!btnSaveSettings);
    
    // Load from localStorage FIRST, then load questions (which will merge added questions)
    loadStateFromStorage();
    console.log("[DBG-INIT] after loadStateFromStorage, addedQuestions count =", state.addedQuestions.length);
    
    await loadQuestions();
    console.log("[DBG-INIT] after loadQuestions, total questions =", state.questions.length);
    
    console.log("[DBG-INIT] before renderSidebar, statsCardContainer =", !!statsCardContainer);
    renderSidebar();
    renderWorkspace();
    renderStats();
    console.log("[DBG-INIT] init done");
  }

  // --- Load Questions from JS Variable ---
  async function loadQuestions() {
    try {
      const rawQuestions = window.QUESTIONS_DATA || [];

      // 1. Filter and sort choice questions: Chapter -> question_number
      const choices = rawQuestions.filter(q => q.type === 'choice').sort((a, b) => {
        const matchA = a.chapter.match(/第(\d+)章/);
        const matchB = b.chapter.match(/第(\d+)章/);
        const chA = matchA ? parseInt(matchA[1]) : 999;
        const chB = matchB ? parseInt(matchB[1]) : 999;
        if (chA !== chB) return chA - chB;
        if (a.chapter !== b.chapter) return a.chapter.localeCompare(b.chapter);
        return parseInt(a.question_number) - parseInt(b.question_number);
      });

      // Assign sequential display numbers to choice questions
      choices.forEach((q, idx) => {
        q.display_number = `${idx + 1}`;
      });

      // 2. Filter and sort application questions by their ID numeric suffix (q1, q2, etc.)
      const apps = rawQuestions.filter(q => q.type !== 'choice').sort((a, b) => {
        const getAppNum = (q) => {
          const match = q.id.match(/q(\d+)/);
          return match ? parseInt(match[1]) : 999;
        };
        return getAppNum(a) - getAppNum(b);
      });

      // Assign original numbers as display numbers to application questions
      apps.forEach(q => {
        const match = q.id.match(/q(\d+)/);
        const num = match ? match[1] : q.id;
        q.display_number = `应用 ${num}`;
      });

      // Combine both lists: choices first, then applications
      state.questions = [...choices, ...apps];

      // 3. Merge user-added questions (from AI add) at the end
      if (Array.isArray(state.addedQuestions) && state.addedQuestions.length > 0) {
        state.addedQuestions.forEach((q, idx) => {
          // Preserve user-added flag
          q._userAdded = true;
          q._userAddedOrder = idx;
          // No display_number yet — will be assigned below
        });
        state.questions = state.questions.concat(state.addedQuestions);
      }

      // 4. Assign display numbers to all user-added questions (continue numbering)
      const totalOriginal = state.questions.length - (state.addedQuestions?.length || 0);
      if (Array.isArray(state.addedQuestions) && state.addedQuestions.length > 0) {
        state.addedQuestions.forEach((q, idx) => {
          q.display_number = `+${idx + 1}`;
        });
      }

      if (state.questions.length > 0) {
        state.activeQuestionId = state.questions[0].id;
      }
    } catch (error) {
      console.error("Failed to load and sort questions data:", error);
    }
  }

  // --- Local Storage Management ---
  function loadStateFromStorage() {
    try {
      const storedAnswers = localStorage.getItem("claude_user_answers");
      const storedStatuses = localStorage.getItem("claude_question_statuses");
      const storedWrongBook = localStorage.getItem("claude_wrong_book");
      const storedAdded = localStorage.getItem("claude_added_questions");
      const storedKey = localStorage.getItem("claude_deepseek_api_key");

      if (storedAnswers) state.userAnswers = JSON.parse(storedAnswers);
      if (storedStatuses) state.questionStatuses = JSON.parse(storedStatuses);
      if (storedWrongBook) state.wrongBookIds = JSON.parse(storedWrongBook);
      if (storedAdded) state.addedQuestions = JSON.parse(storedAdded);
      if (storedKey) state.deepseekApiKey = storedKey;

      // NOTE: Added questions are merged into state.questions in loadQuestions(),
      // which is called AFTER loadStateFromStorage in init()
      
      // Initialize statuses for questions with no status
      state.questions.forEach(q => {
        if (!state.questionStatuses[q.id]) {
          state.questionStatuses[q.id] = "unattempted";
        }
      });
    } catch (e) {
      console.error("Error loading localStorage state:", e);
    }
  }

  function saveStateToStorage() {
    try {
      localStorage.setItem("claude_user_answers", JSON.stringify(state.userAnswers));
      localStorage.setItem("claude_question_statuses", JSON.stringify(state.questionStatuses));
      localStorage.setItem("claude_wrong_book", JSON.stringify(state.wrongBookIds));
      
      // Remove dataURL from filename to save storage space
      const questionsToSave = state.addedQuestions.map(q => ({
        ...q,
        filename: "" // dataURL is too large for localStorage
      }));
      localStorage.setItem("claude_added_questions", JSON.stringify(questionsToSave));
    } catch (e) {
      console.error("Error saving state to localStorage:", e);
    }
  }

  function saveApiKey() {
    try {
      localStorage.setItem("claude_deepseek_api_key", state.deepseekApiKey || "");
    } catch (e) {
      console.error("Error saving API key:", e);
    }
  }

  function showSaveStatus(status) {
    const badge = document.getElementById("save-badge");
    if (!badge) return;
    
    badge.classList.remove("saving", "saved");
    if (status === "saving") {
      badge.classList.add("saving");
    } else if (status === "saved") {
      badge.classList.add("saved");
      setTimeout(() => {
        badge.classList.remove("saved");
      }, 2000);
    }
  }

  function manualSaveProgress() {
    showSaveStatus("saving");
    saveStateToStorage();
    saveApiKey();
    showSaveStatus("saved");
    console.log("[DBG-SAVE] Manual save completed");
    
    // Show toast notification
    const toast = document.createElement("div");
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--surface-dark);
      color: var(--on-dark);
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
      animation: fadeInUp 0.3s ease;
    `;
    toast.textContent = "✅ 进度已保存";
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = "fadeOutDown 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // Auto-save when page is about to close
  window.addEventListener("beforeunload", (e) => {
    saveStateToStorage();
    saveApiKey();
    console.log("[DBG-SAVE] Auto-saved on beforeunload");
  });

  // Auto-save periodically (every 30 seconds)
  setInterval(() => {
    saveStateToStorage();
    console.log("[DBG-SAVE] Auto-saved periodically");
  }, 30000);

  // --- Navigation & Mode Switching ---
  function setupNavListeners() {
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        const targetMode = link.getAttribute("data-nav-mode");
        switchMode(targetMode);
      });
    });

    // Save progress button
    const btnSaveProgress = document.getElementById("btn-save-progress");
    if (btnSaveProgress) {
      btnSaveProgress.addEventListener("click", () => {
        manualSaveProgress();
      });
    }
  }

  function switchMode(mode) {
    state.activeTab = mode;

    // Update nav classes
    navLinks.forEach(link => {
      if (link.getAttribute("data-nav-mode") === mode) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Theme is now controlled by system preferences via setupTheme()

    // Toggle main workspace vs stats page vs AI add page
    if (mode === "stats") {
      workspaceContainer.style.display = "none";
      statsWorkspace.style.display = "block";
      aiAddWorkspace.style.display = "none";
      renderStats();
    } else if (mode === "add") {
      workspaceContainer.style.display = "none";
      statsWorkspace.style.display = "none";
      aiAddWorkspace.style.display = "flex";
      renderAiAddView();
    } else {
      statsWorkspace.style.display = "none";
      aiAddWorkspace.style.display = "none";
      workspaceContainer.style.display = "flex";

      // Select first question available in the current mode
      const filtered = getFilteredQuestions();
      if (filtered.length > 0) {
        // If active question is not in filtered, pick first filtered
        if (!filtered.some(q => q.id === state.activeQuestionId)) {
          state.activeQuestionId = filtered[0].id;
        }
      } else {
        state.activeQuestionId = null;
      }

      renderSidebar();
      renderWorkspace();
    }
  }

  // --- Filtering Questions ---
  function getFilteredQuestions() {
    if (state.activeTab === "wrong") {
      return state.questions.filter(q => state.wrongBookIds.includes(q.id));
    }
    return state.questions;
  }

  // --- Settings Dialog ---
  function setupSettingsDialog() {
    if (!settingsDialog) return;

    btnOpenSettings.addEventListener("click", () => {
      inputApiKey.value = state.deepseekApiKey || "";
      hideSettingsStatus();
      if (typeof settingsDialog.showModal === "function") {
        settingsDialog.showModal();
      } else {
        settingsDialog.setAttribute("open", "");
      }
      setTimeout(() => inputApiKey.focus(), 50);
    });

    btnCloseSettings.addEventListener("click", () => {
      settingsDialog.close();
    });

    // Click backdrop to close
    settingsDialog.addEventListener("click", (e) => {
      if (e.target === settingsDialog) {
        settingsDialog.close();
      }
    });

    btnSaveSettings.addEventListener("click", () => {
      const val = inputApiKey.value.trim();
      state.deepseekApiKey = val;
      saveApiKey();
      showSettingsStatus("success", "已保存到本地浏览器。");
      if (state.activeTab === "add" && typeof renderAiAddView === "function") {
        renderAiAddView();
      }
    });

    btnTestApi.addEventListener("click", async () => {
      const val = inputApiKey.value.trim();
      if (!val) {
        showSettingsStatus("error", "请先填写 API Key。");
        return;
      }
      showSettingsStatus("info", '<span class="spinner"></span>正在测试连接…');
      btnTestApi.disabled = true;
      try {
        const resp = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${val}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: "hi" }],
            max_tokens: 5
          })
        });
        if (resp.ok) {
          showSettingsStatus("success", "连接成功！API Key 可用。");
        } else {
          const text = await resp.text();
          showSettingsStatus("error", `连接失败 (${resp.status})：${text.slice(0, 100)}`);
        }
      } catch (err) {
        showSettingsStatus("error", `网络错误：${err.message}`);
      } finally {
        btnTestApi.disabled = false;
      }
    });
  }

  function showSettingsStatus(kind, html) {
    settingsStatus.className = `settings-status ${kind}`;
    settingsStatus.innerHTML = html;
    settingsStatus.style.display = "block";
  }

  function hideSettingsStatus() {
    settingsStatus.style.display = "none";
    settingsStatus.innerHTML = "";
    settingsStatus.className = "settings-status";
  }

  // --- Render Sidebar ---
  function renderSidebar() {
    // 1. Render mini stats summary card
    const total = state.questions.length;
    const answeredCount = Object.keys(state.userAnswers).length;
    const wrongCount = state.wrongBookIds.length;
    const correctCount = Object.values(state.questionStatuses).filter(s => s === "correct").length;
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    if (!statsCardContainer) { console.error("[DBG] statsCardContainer is null"); return; }
    if (!questionListContainer) { console.error("[DBG] questionListContainer is null"); return; }

    statsCardContainer.innerHTML = `
      <h3>${state.activeTab === 'wrong' ? '错题本状态' : '复习进度'}</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-val">${total}</div>
          <div class="stat-lbl">全部题目</div>
        </div>
        <div class="stat-item">
          <div class="stat-val">${wrongCount}</div>
          <div class="stat-lbl">错题本</div>
        </div>
        <div class="stat-item">
          <div class="stat-val">${answeredCount}/${total}</div>
          <div class="stat-lbl">已做题目</div>
        </div>
        <div class="stat-item">
          <div class="stat-val">${accuracy}%</div>
          <div class="stat-lbl">答题正确率</div>
        </div>
      </div>
      ${state.activeTab !== 'wrong' ? `
      <div class="stats-actions">
        <button class="btn btn-secondary btn-reset-progress" id="btn-reset-progress" style="height: 32px; font-size: 12px;">
          🔄 重置全部进度
        </button>
      </div>
      ` : ''}
    `;

    // Reset progress button handler
    const btnReset = document.getElementById("btn-reset-progress");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        if (confirm("确定要重置所有答题进度吗？所有已做题目的答案、状态和错题本都将被清空。此操作不可撤销！")) {
          state.userAnswers = {};
          state.questionStatuses = {};
          state.wrongBookIds = [];
          saveStateToStorage();
          renderSidebar();
          renderWorkspace();
          alert("进度已重置！");
        }
      });
    }

    // 2. Render flat list of questions
    const filtered = getFilteredQuestions();

    if (filtered.length === 0) {
      questionListContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--muted); font-size: 14px;">
          ${state.activeTab === "wrong" ? "错题本空空如也，真棒！" : "暂无可用题目"}
        </div>
      `;
      return;
    }

    questionListContainer.innerHTML = "";

    filtered.forEach(q => {
      const item = document.createElement("div");
      item.className = `question-item ${state.activeQuestionId === q.id ? "active" : ""} ${q._userAdded ? "added-by-user" : ""}`;
      item.setAttribute("data-q-id", q.id);

      const textSpan = document.createElement("span");
      const qTitle = q.question.substring(0, 18) + (q.question.length > 18 ? "..." : "");
      textSpan.textContent = `${q.display_number}. ${qTitle}`;
      item.appendChild(textSpan);

      if (q._userAdded) {
        const badge = document.createElement("span");
        badge.className = "added-badge";
        badge.textContent = "AI";
        badge.title = "用户通过 AI 添加";
        item.appendChild(badge);
      }

      const status = state.questionStatuses[q.id] || "unattempted";
      const statusBadge = document.createElement("span");
      statusBadge.className = `question-status-badge status-${status}`;
      statusBadge.textContent = status === "unattempted" ? "未做" : (status === "correct" ? "正确" : "错误");
      item.appendChild(statusBadge);

      item.addEventListener("click", () => {
        state.activeQuestionId = q.id;
        renderSidebar();
        renderWorkspace();
      });

      questionListContainer.appendChild(item);
    });
  }

  // --- Render Workspace ---
  function renderWorkspace() {
    if (!state.activeQuestionId) {
      renderEmptyWorkspace();
      return;
    }

    const question = state.questions.find(q => q.id === state.activeQuestionId);
    if (!question) {
      renderEmptyWorkspace();
      return;
    }

    const isWrongBook = state.wrongBookIds.includes(question.id);
    const status = state.questionStatuses[question.id] || "unattempted";
    const filtered = getFilteredQuestions();

    workspaceContainer.innerHTML = `
      <div class="workspace-content">
        <!-- Interactive workspace panel -->
        <div class="workspace-panel">
          <div class="question-text-box">${question.type === 'fill_blank' ? sanitizeFillBlankQuestion(question.question.trim()) : question.question.trim()}</div>
          
          <div class="answer-section-title">作答区域</div>
          
          <div id="answer-inputs-container">
            <!-- Dynamically populated based on question type -->
          </div>
          
          <div class="feedback-box" id="feedback-box"></div>
          
          <div class="action-buttons">
            <button class="btn btn-secondary btn-nav-arrow" id="btn-prev-q" title="上一题">&lt;</button>
            <button class="btn btn-primary" id="btn-submit" style="display: ${(question.type === 'choice' || question.type === 'true_false') ? 'none' : 'inline-block'};">提交答案</button>
            <button class="btn btn-secondary btn-nav-arrow" id="btn-next-q" title="下一题">&gt;</button>
            <button class="btn btn-secondary" id="btn-redo">重做此题</button>
            <button class="btn btn-secondary ${state.showOriginalOpen ? 'active' : ''}" id="btn-show-original">显示原题</button>
            <button class="btn btn-secondary btn-wrong-book" id="btn-toggle-wrong">
              ${isWrongBook ? '从错题本移出' : '加入错题本'}
            </button>
            ${question._userAdded ? '<button class="btn btn-secondary btn-delete-question" id="btn-delete-question">删除此题</button>' : ''}
          </div>

          <!-- Simple Image direct in the page flow -->
          <img id="question-image" class="question-image-simple" src="${question.filename}" alt="原题图片" style="display: ${state.showOriginalOpen ? 'block' : 'none'};">
          
          <!-- Explanation box -->
          <div class="explanation-card" id="explanation-card">
            <h4>学术解析 & 答案</h4>
            <div class="explanation-content" id="explanation-content"></div>
          </div>
        </div>
      </div>
    `;

    setupInteraction(question);
    setupWorkspaceNavigation(question);
  }

  function setupWorkspaceNavigation(question) {
    const filtered = getFilteredQuestions();
    const currentIndex = filtered.findIndex(q => q.id === question.id);

    const prevBtn = document.getElementById("btn-prev-q");
    const nextBtn = document.getElementById("btn-next-q");
    const jumpSelect = document.getElementById("select-jump-q");

    if (prevBtn) {
      prevBtn.disabled = currentIndex <= 0;
      prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
          state.activeQuestionId = filtered[currentIndex - 1].id;
          renderSidebar();
          renderWorkspace();
        }
      });
    }

    if (nextBtn) {
      nextBtn.disabled = currentIndex >= filtered.length - 1;
      nextBtn.addEventListener("click", () => {
        if (currentIndex < filtered.length - 1) {
          state.activeQuestionId = filtered[currentIndex + 1].id;
          renderSidebar();
          renderWorkspace();
        }
      });
    }

    if (jumpSelect) {
      jumpSelect.addEventListener("change", (e) => {
        const targetId = e.target.value;
        if (targetId) {
          state.activeQuestionId = targetId;
          renderSidebar();
          renderWorkspace();
        }
      });
    }
  }

  function renderEmptyWorkspace() {
    workspaceContainer.innerHTML = `
      <div class="empty-state">
        <svg class="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3>请选择题目</h3>
        <p>从左侧列表中选择一道题目开始复习，或者切换错题本重做以往的错题。</p>
      </div>
    `;
  }



  // --- Interaction Logic per Question Type ---
  function setupInteraction(question) {
    const inputContainer = document.getElementById("answer-inputs-container");
    const feedbackBox = document.getElementById("feedback-box");
    const explanationCard = document.getElementById("explanation-card");
    const explanationContent = document.getElementById("explanation-content");

    const btnSubmit = document.getElementById("btn-submit");
    const btnRedo = document.getElementById("btn-redo");
    const btnToggleWrong = document.getElementById("btn-toggle-wrong");

    const status = state.questionStatuses[question.id] || "unattempted";
    const savedAnswer = state.userAnswers[question.id];

    // 1. Render inputs based on type
    if (question.type === "choice") {
      inputContainer.innerHTML = `
        <div class="options-container">
          ${question.options.map((opt, idx) => {
        const letter = String.fromCharCode(65 + idx); // A, B, C, D
        return `
              <button class="option-button" data-index="${idx}">
                <span class="option-letter">${letter}.</span>
                <span class="option-text">${opt.replace(/^[A-D]\.\s*/, '')}</span>
              </button>
            `;
      }).join("")}
        </div>
      `;

      const options = inputContainer.querySelectorAll(".option-button");
      let selectedIdx = savedAnswer !== undefined ? parseInt(savedAnswer) : null;

      // Highlight selected/saved states
      const highlightStates = () => {
        options.forEach((btn, idx) => {
          btn.className = "option-button";
          if (idx === selectedIdx) {
            btn.classList.add("selected");
          }
          // Show correctness if submitted
          if (status !== "unattempted") {
            if (idx === question.correct_answer) {
              btn.classList.add("correct");
            } else if (idx === selectedIdx) {
              btn.classList.add("incorrect");
            }
          }
        });
      };
      highlightStates();

      const submitChoice = () => {
        if (selectedIdx === null) {
          alert("请选择一个选项！");
          return;
        }

        state.userAnswers[question.id] = selectedIdx;
        const isCorrect = selectedIdx === question.correct_answer;

        state.questionStatuses[question.id] = isCorrect ? "correct" : "incorrect";

        if (!isCorrect && !state.wrongBookIds.includes(question.id)) {
          state.wrongBookIds.push(question.id);
        }

        saveStateToStorage();
        showFeedback(isCorrect, isCorrect ? `回答正确！正确答案是：${String.fromCharCode(65 + question.correct_answer)}` : `回答错误。正确答案是：${String.fromCharCode(65 + question.correct_answer)}`);
        showExplanation(question, !isCorrect);
        highlightStates();
        renderSidebar();
      };

      options.forEach(btn => {
        btn.addEventListener("click", () => {
          if (status !== "unattempted") return;
          selectedIdx = parseInt(btn.getAttribute("data-index"));
          highlightStates();
          submitChoice();
        });
      });

      btnSubmit.addEventListener("click", submitChoice);

    } else if (question.type === "true_false") {
      // True/False questions: simple toggle
      inputContainer.innerHTML = `
        <div class="options-container">
          <button class="option-button" data-index="0">
            <span class="option-letter">✓</span>
            <span class="option-text">正确</span>
          </button>
          <button class="option-button" data-index="1">
            <span class="option-letter">✗</span>
            <span class="option-text">错误</span>
          </button>
        </div>
      `;

      const options = inputContainer.querySelectorAll(".option-button");
      let selectedIdx = savedAnswer !== undefined ? parseInt(savedAnswer) : null;

      const highlightStates = () => {
        options.forEach((btn, idx) => {
          btn.className = "option-button";
          if (idx === selectedIdx) {
            btn.classList.add("selected");
          }
          if (status !== "unattempted") {
            if (idx === question.correct_answer) {
              btn.classList.add("correct");
            } else if (idx === selectedIdx) {
              btn.classList.add("incorrect");
            }
          }
        });
      };
      highlightStates();

      const submitTrueFalse = () => {
        if (selectedIdx === null) {
          alert("请选择正确或错误！");
          return;
        }

        state.userAnswers[question.id] = selectedIdx;
        const isCorrect = selectedIdx === question.correct_answer;

        state.questionStatuses[question.id] = isCorrect ? "correct" : "incorrect";

        if (!isCorrect && !state.wrongBookIds.includes(question.id)) {
          state.wrongBookIds.push(question.id);
        }

        saveStateToStorage();
        const correctText = question.correct_answer === 0 ? "正确" : "错误";
        showFeedback(isCorrect, isCorrect ? `回答正确！正确答案是：${correctText}` : `回答错误。正确答案是：${correctText}`);
        showExplanation(question, !isCorrect);
        highlightStates();
        renderSidebar();
      };

      options.forEach(btn => {
        btn.addEventListener("click", () => {
          if (status !== "unattempted") return;
          selectedIdx = parseInt(btn.getAttribute("data-index"));
          highlightStates();
          submitTrueFalse();
        });
      });

      btnSubmit.addEventListener("click", submitTrueFalse);

    } else if (question.type === "multi_choice") {
      // Multi-choice: checkbox style, multiple correct answers
      inputContainer.innerHTML = `
        <div class="options-container">
          ${question.options.map((opt, idx) => {
        const letter = String.fromCharCode(65 + idx); // A, B, C, D
        const isSelected = savedAnswer && Array.isArray(savedAnswer) && savedAnswer.includes(idx);
        return `
              <button class="option-button ${isSelected ? 'selected' : ''}" data-index="${idx}">
                <span class="option-checkbox-display ${isSelected ? 'checked' : ''}">${isSelected ? '☑' : '☐'}</span>
                <span class="option-letter">${letter}.</span>
                <span class="option-text">${opt.replace(/^[A-D]\.\s*/, '')}</span>
              </button>
            `;
      }).join("")}
        </div>
        <p style="font-size: 13px; color: var(--muted); margin-top: 8px;">提示：多选题可能有一个或多个正确答案，请勾选所有正确的选项。</p>
      `;

      const options = inputContainer.querySelectorAll(".option-button");
      let selectedIdxs = (savedAnswer && Array.isArray(savedAnswer)) ? [...savedAnswer] : [];

      // Highlight selected/saved states
      const highlightStates = () => {
        options.forEach((btn, idx) => {
          btn.className = "option-button";
          const checkbox = btn.querySelector(".option-checkbox-display");
          if (selectedIdxs.includes(idx)) {
            btn.classList.add("selected");
            if (checkbox) checkbox.textContent = "☑";
            if (checkbox) checkbox.classList.add("checked");
          } else {
            if (checkbox) checkbox.textContent = "☐";
            if (checkbox) checkbox.classList.remove("checked");
          }
          // Show correctness if submitted
          if (status !== "unattempted") {
            const correctAnswers = question.correct_answers || [];
            if (correctAnswers.includes(idx)) {
              btn.classList.add("correct");
            } else if (selectedIdxs.includes(idx)) {
              btn.classList.add("incorrect");
            }
          }
        });
      };
      highlightStates();

      options.forEach(btn => {
        btn.addEventListener("click", () => {
          if (status !== "unattempted") return;
          const idx = parseInt(btn.getAttribute("data-index"));
          if (selectedIdxs.includes(idx)) {
            selectedIdxs = selectedIdxs.filter(i => i !== idx);
          } else {
            selectedIdxs.push(idx);
          }
          selectedIdxs.sort();
          highlightStates();
        });
      });

      // Submit multi-choice logic
      btnSubmit.addEventListener("click", () => {
        if (selectedIdxs.length === 0) {
          alert("请至少选择一个选项！");
          return;
        }

        state.userAnswers[question.id] = selectedIdxs;
        const correctAnswers = question.correct_answers || [];
        const isCorrect = selectedIdxs.length === correctAnswers.length &&
          selectedIdxs.every(i => correctAnswers.includes(i));

        state.questionStatuses[question.id] = isCorrect ? "correct" : "incorrect";

        if (!isCorrect && !state.wrongBookIds.includes(question.id)) {
          state.wrongBookIds.push(question.id);
        }

        saveStateToStorage();
        const correctStr = correctAnswers.map(i => String.fromCharCode(65 + i)).join("、");
        showFeedback(isCorrect, isCorrect ? `回答正确！正确答案是：${correctStr}` : `回答错误。正确答案是：${correctStr}`);
        showExplanation(question, !isCorrect);
        highlightStates();
        renderSidebar();
      });

    } else if (question.type === "fill_blank") {
      // Fill blank: text input, auto-check answer
      inputContainer.innerHTML = `
        <div class="fill-blank-container">
          <input type="text" class="fill-blank-input" id="fill-blank-input" 
            placeholder="请输入答案..." value="${savedAnswer || ''}">
          <div id="fill-blank-result" style="display: none; margin-top: 12px; padding: 12px; border-radius: 8px;">
            <div id="fill-blank-feedback" style="font-weight: 600;"></div>
            <div id="fill-blank-correct" style="margin-top: 4px; font-size: 13px;"></div>
          </div>
        </div>
      `;

      const fbInput = document.getElementById("fill-blank-input");
      const fbResult = document.getElementById("fill-blank-result");

      if (status !== "unattempted") {
        fbInput.disabled = true;
        fbResult.style.display = "block";
      }

      // Submit fill-blank logic (auto-check)
      btnSubmit.addEventListener("click", () => {
        const userAnswer = fbInput.value.trim();
        if (!userAnswer) {
          alert("请输入答案！");
          return;
        }

        state.userAnswers[question.id] = userAnswer;
        
        // Auto-check: compare user answer with correct answer
        const correctAnswer = (question.answer || "").trim();
        let isCorrect = false;
        
        if (correctAnswer) {
          // Split both by common separators and compare each part
          const normalize = (s) => s.split(/[，,、/；;]/).map(p => p.trim()).filter(Boolean);
          const userParts = normalize(userAnswer);
          const correctParts = normalize(correctAnswer);
          
          // Check if all user parts match any correct part (order doesn't matter)
          isCorrect = userParts.length === correctParts.length &&
            userParts.every(up => correctParts.some(cp => 
              up.toLowerCase() === cp.toLowerCase() || 
              cp.includes(up) || 
              up.includes(cp)
            ));
        }

        state.questionStatuses[question.id] = isCorrect ? "correct" : "incorrect";

        if (!isCorrect && !state.wrongBookIds.includes(question.id)) {
          state.wrongBookIds.push(question.id);
        }
        if (isCorrect) {
          state.wrongBookIds = state.wrongBookIds.filter(id => id !== question.id);
        }

        saveStateToStorage();
        
        // Show feedback
        const feedbackEl = document.getElementById("fill-blank-feedback");
        const correctEl = document.getElementById("fill-blank-correct");
        
        if (isCorrect) {
          fbResult.className = "correct";
          feedbackEl.textContent = "回答正确！";
          feedbackEl.style.color = "var(--success)";
          correctEl.textContent = `正确答案：${correctAnswer}`;
          correctEl.style.color = "var(--success)";
        } else {
          fbResult.className = "incorrect";
          feedbackEl.textContent = "回答错误！";
          feedbackEl.style.color = "var(--error)";
          correctEl.textContent = `正确答案：${correctAnswer || "未设置"}`;
          correctEl.style.color = "var(--success)";
        }
        
        fbInput.disabled = true;
        fbResult.style.display = "block";
        
        showExplanation(question, !isCorrect);
        renderSidebar();
      });

    } else {
      // Calculation & Drawing questions
      inputContainer.innerHTML = `
        <div class="calculation-container">
          <textarea class="calc-input" id="calc-text-input" placeholder="请在此处输入您的计算步骤或作答结果草稿..."></textarea>
          <div id="self-rating-container" style="display: none; margin-top: 12px; padding: 12px; background: var(--surface-soft); border-radius: 8px; border: 1px dashed var(--hairline)">
            <p style="font-size: 13px; margin-bottom: 8px; color: var(--muted);">根据下方的【学术解析】核对您的作答。您觉得回答正确吗？</p>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary" id="btn-self-correct" style="height: 32px; font-size: 13px;">自我判定正确</button>
              <button class="btn btn-secondary" id="btn-self-incorrect" style="height: 32px; font-size: 13px; color: var(--error);">自我判定错误</button>
            </div>
          </div>
        </div>
      `;

      const calcInput = document.getElementById("calc-text-input");
      const selfRating = document.getElementById("self-rating-container");

      if (savedAnswer !== undefined) {
        calcInput.value = savedAnswer;
      }

      if (status !== "unattempted") {
        calcInput.disabled = true;
        selfRating.style.display = "block";
      }

      // Submit calculation logic (shows explanation for self-verification)
      btnSubmit.addEventListener("click", () => {
        const userText = calcInput.value.trim();
        if (!userText) {
          alert("请输入您的计算结果或草稿！");
          return;
        }

        state.userAnswers[question.id] = userText;
        calcInput.disabled = true;
        selfRating.style.display = "block";

        showExplanation(question, true);

        // Default to incorrect first, wait for user self-correct button
        if (state.questionStatuses[question.id] === "unattempted") {
          state.questionStatuses[question.id] = "incorrect";
          if (!state.wrongBookIds.includes(question.id)) {
            state.wrongBookIds.push(question.id);
          }
        }

        saveStateToStorage();
        renderSidebar();
        showFeedback(null, "请根据下方学术解析对自己的答案进行核对并做出判定。");
      });

      // Self-rating listeners
      inputContainer.addEventListener("click", (e) => {
        if (e.target.id === "btn-self-correct") {
          state.questionStatuses[question.id] = "correct";
          // If self-correct, remove from wrong book
          state.wrongBookIds = state.wrongBookIds.filter(id => id !== question.id);
          saveStateToStorage();
          renderSidebar();
          showFeedback(true, "已记录您的自我判定：正确！");
        } else if (e.target.id === "btn-self-incorrect") {
          state.questionStatuses[question.id] = "incorrect";
          if (!state.wrongBookIds.includes(question.id)) {
            state.wrongBookIds.push(question.id);
          }
          saveStateToStorage();
          renderSidebar();
          showFeedback(false, "已记录您的自我判定：错误，题目已保存至错题本。");
        }
      });
    }

    // --- Show saved explanation if already answered ---
    if (status !== "unattempted") {
      showExplanation(question, status === "incorrect");
      if (question.type === "choice") {
        const isCorrect = status === "correct";
        showFeedback(isCorrect, isCorrect ? "回答正确！恭喜。" : `回答错误。正确答案是：${String.fromCharCode(65 + question.correct_answer)}`);
      } else if (question.type === "multi_choice") {
        const correctAnswers = question.correct_answers || [];
        const correctStr = correctAnswers.map(i => String.fromCharCode(65 + i)).join("、");
        const isCorrect = status === "correct";
        showFeedback(isCorrect, isCorrect ? "回答正确！恭喜。" : `回答错误。正确答案是：${correctStr}`);
      } else if (question.type === "fill_blank") {
        const isCorrect = status === "correct";
        showFeedback(isCorrect, isCorrect ? "回答正确！恭喜。" : `回答错误。正确答案是：${question.answer || "未设置"}`);
        // Also populate the result div
        const fbResult = document.getElementById("fill-blank-result");
        const feedbackEl = document.getElementById("fill-blank-feedback");
        const correctEl = document.getElementById("fill-blank-correct");
        if (fbResult && feedbackEl && correctEl) {
          fbResult.style.display = "block";
          if (isCorrect) {
            fbResult.className = "correct";
            feedbackEl.textContent = "回答正确！恭喜。";
            feedbackEl.style.color = "var(--success)";
            correctEl.textContent = "";
          } else {
            fbResult.className = "incorrect";
            feedbackEl.textContent = "回答错误！";
            feedbackEl.style.color = "var(--error)";
            correctEl.textContent = `正确答案：${question.answer || "未设置"}`;
            correctEl.style.color = "var(--success)";
          }
        }
      } else {
        const isCorrect = status === "correct";
        showFeedback(status === "unattempted" ? null : isCorrect, status === "correct" ? "已记录您的自我判定：正确！" : (status === "incorrect" ? "已记录您的自我判定：错误，题目已保存至错题本。" : "请核对下方解析进行自我评判。"));
      }
    }

    // --- Re-do (重做) Listener ---
    btnRedo.addEventListener("click", () => {
      // Reset state for this question
      delete state.userAnswers[question.id];
      state.questionStatuses[question.id] = "unattempted";

      saveStateToStorage();
      renderSidebar();
      renderWorkspace();
    });

    // --- Toggle Wrong Book Listener ---
    btnToggleWrong.addEventListener("click", () => {
      const idx = state.wrongBookIds.indexOf(question.id);
      if (idx > -1) {
        state.wrongBookIds.splice(idx, 1);
        btnToggleWrong.textContent = "加入错题本";
      } else {
        state.wrongBookIds.push(question.id);
        btnToggleWrong.textContent = "从错题本移出";
      }
      saveStateToStorage();
      renderSidebar();
    });

    // --- Show Original Image Listener ---
    const btnShowOriginal = document.getElementById("btn-show-original");
    const qImg = document.getElementById("question-image");

    if (btnShowOriginal && qImg) {
      btnShowOriginal.addEventListener("click", () => {
        if (qImg.style.display === "none") {
          qImg.style.display = "block";
          state.showOriginalOpen = true;
          btnShowOriginal.classList.add("active");
        } else {
          qImg.style.display = "none";
          state.showOriginalOpen = false;
          btnShowOriginal.classList.remove("active");
        }
      });
    }

    // --- Delete User-Added Question Listener ---
    const btnDeleteQuestion = document.getElementById("btn-delete-question");
    if (btnDeleteQuestion) {
      btnDeleteQuestion.addEventListener("click", () => {
        deleteAddedQuestion(question.id);
      });
    }

    // Helper to display feedback box
    function showFeedback(isCorrect, msg) {
      feedbackBox.className = "feedback-box";
      if (isCorrect === true) {
        feedbackBox.classList.add("correct");
      } else if (isCorrect === false) {
        feedbackBox.classList.add("incorrect");
      } else {
        feedbackBox.style.backgroundColor = "var(--surface-soft)";
        feedbackBox.style.border = "1px solid var(--hairline)";
        feedbackBox.style.color = "var(--body-strong)";
        feedbackBox.style.display = "block";
      }
      feedbackBox.textContent = msg;
    }

    // Helper to display explanation card
    function showExplanation(q, autoReveal = false) {
      explanationCard.classList.add("visible");
      if (autoReveal) {
        explanationContent.innerHTML = `
          <div id="explanation-detail">
            ${escapeHtml(q.explanation)}
          </div>
        `;
      } else {
        explanationContent.innerHTML = `
          <button class="btn btn-secondary btn-show-detail" id="btn-show-detail" style="height: 32px; font-size: 13px; margin-bottom: 8px;">
            👁️ 点击查看解析与答案
          </button>
          <div id="explanation-detail" style="display: none;">
            ${escapeHtml(q.explanation)}
          </div>
        `;
        
        document.getElementById("btn-show-detail").addEventListener("click", () => {
          document.getElementById("explanation-detail").style.display = "block";
          document.getElementById("btn-show-detail").style.display = "none";
        });
      }
    }
  }

  // --- Render Statistics Page ---
  function renderStats() {
    const total = state.questions.length;
    const answered = Object.keys(state.userAnswers).length;
    const wrong = state.wrongBookIds.length;
    const correct = Object.values(state.questionStatuses).filter(s => s === "correct").length;
    const correctRate = answered > 0 ? Math.round((correct / answered) * 100) : 0;

    statsWorkspace.innerHTML = `
      <h2>复习进度统计与自我评估</h2>
      
      <div class="stats-summary-grid">
        <div class="summary-card">
          <div class="summary-val">${total}</div>
          <div class="summary-lbl">题目总数</div>
        </div>
        <div class="summary-card">
          <div class="summary-val">${answered}</div>
          <div class="summary-lbl">已答题目</div>
        </div>
        <div class="summary-card">
          <div class="summary-val" style="color: var(--success);">${correct}</div>
          <div class="summary-lbl">正确题数</div>
        </div>
        <div class="summary-card">
          <div class="summary-val" style="color: ${wrong > 0 ? 'var(--error)' : 'var(--success)'}">${wrong}</div>
          <div class="summary-lbl">当前错题</div>
        </div>
      </div>
      
      <div class="stats-section-title">分章节复习状况</div>
      
      <table class="chapters-table">
        <thead>
          <tr>
            <th>章节名称</th>
            <th>题目总数</th>
            <th>已做题数</th>
            <th>正确数</th>
            <th>错误数(加入错题本)</th>
            <th>正确率</th>
          </tr>
        </thead>
        <tbody id="stats-table-body">
          <!-- Dynamically populated -->
        </tbody>
      </table>
    `;

    // Group stats by chapter
    const chStats = {};
    state.questions.forEach(q => {
      const ch = q.chapter || "未分类";
      if (!chStats[ch]) {
        chStats[ch] = { total: 0, answered: 0, correct: 0, wrong: 0 };
      }
      chStats[ch].total++;

      const status = state.questionStatuses[q.id] || "unattempted";
      if (status !== "unattempted") {
        chStats[ch].answered++;
        if (status === "correct") {
          chStats[ch].correct++;
        } else {
          chStats[ch].wrong++;
        }
      }
    });

    const tbody = document.getElementById("stats-table-body");
    Object.keys(chStats).sort().forEach(chName => {
      const stats = chStats[chName];
      const rate = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight: 500;">${chName}</td>
        <td>${stats.total}</td>
        <td>${stats.answered}</td>
        <td>${stats.correct}</td>
        <td style="color: ${stats.wrong > 0 ? 'var(--error)' : 'inherit'};">${stats.wrong}</td>
        <td style="font-weight: 600; color: ${rate >= 80 ? 'var(--success)' : (rate >= 50 ? 'var(--warning)' : 'var(--error)')}">${rate}%</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ============================================================
  // AI ADD VIEW — Upload, Recognize, Edit, Save
  // ============================================================

  function renderAiAddView() {
    if (!aiAddWorkspace) return;

    const hasKey = !!state.deepseekApiKey;

    aiAddWorkspace.innerHTML = `
      <div class="ai-add-header">
        <h2>AI 添加题目</h2>
        <p>上传一张题目截图，AI 会自动识别题干、选项、答案与解析。请仔细核对后再确认添加。<br>
        ${hasKey
          ? '✅ API Key 已配置'
          : '⚠️ 尚未配置 API Key，请先点击右上角齿轮 ⚙ 设置。'}
        </p>
      </div>

      <div id="ai-add-status" style="display: none;"></div>

      <div class="upload-zone" id="upload-zone">
        <svg class="upload-zone-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 7.5m0 0L7.5 12M12 7.5v9" />
        </svg>
        <div class="upload-zone-title">点击或拖拽图片到此处</div>
        <div class="upload-zone-hint">支持 PNG / JPG / WEBP，单张图片不超过 8MB</div>
        <input type="file" id="file-input" accept="image/*">
      </div>

      <div id="preview-container"></div>
      <div id="result-container"></div>

      <div style="margin-top: 40px;">
        <h3 style="font-size: 20px; margin-bottom: 12px;">已添加的题目（${state.addedQuestions.length}）</h3>
        <div class="added-list" id="added-list"></div>
      </div>
    `;

    setupUploadZone();
    renderAddedList();
  }

  function setupUploadZone() {
    const uploadZone = document.getElementById("upload-zone");
    const fileInput = document.getElementById("file-input");
    if (!uploadZone || !fileInput) return;

    uploadZone.addEventListener("click", () => fileInput.click());

    uploadZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadZone.classList.add("dragover");
    });

    uploadZone.addEventListener("dragleave", () => {
      uploadZone.classList.remove("dragover");
    });

    uploadZone.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadZone.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) handleFileSelect(file);
      e.target.value = ""; // allow re-selecting same file
    });
  }

  function handleFileSelect(file) {
    if (!file.type.startsWith("image/")) {
      showAiStatus("error", "请选择图片文件（PNG / JPG / WEBP）。");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showAiStatus("error", `图片太大（${(file.size / 1024 / 1024).toFixed(2)} MB），请压缩到 8MB 以下。`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target.result;
      state.pendingImage = {
        dataURL,
        filename: file.name,
        size: file.size,
        type: file.type
      };
      renderPreview();
      showAiStatus("info", "图片已就绪。点击「开始识别」按钮调用 AI 提取题目。");
    };
    reader.onerror = () => showAiStatus("error", "读取图片失败。");
    reader.readAsDataURL(file);
  }

  function renderPreview() {
    const container = document.getElementById("preview-container");
    if (!container || !state.pendingImage) return;

    const sizeKB = Math.round(state.pendingImage.size / 1024);
    container.innerHTML = `
      <div class="uploaded-preview-wrapper">
        <img class="uploaded-image-preview" src="${state.pendingImage.dataURL}" alt="待识别图片">
        <div class="preview-meta">${escapeHtml(state.pendingImage.filename)} · ${sizeKB} KB</div>
        <div class="preview-actions">
          <button class="btn btn-primary" id="btn-recognize">开始识别</button>
          <button class="btn btn-secondary" id="btn-clear-image">清除图片</button>
        </div>
      </div>
    `;

    const btnRec = document.getElementById("btn-recognize");
    const btnClear = document.getElementById("btn-clear-image");
    if (btnRec) btnRec.addEventListener("click", recognizeImage);
    if (btnClear) btnClear.addEventListener("click", clearPendingImage);
  }

  function clearPendingImage() {
    state.pendingImage = null;
    const container = document.getElementById("preview-container");
    if (container) container.innerHTML = "";
    showAiStatus("info", "已清除图片。");
  }

  async function recognizeImage() {
    if (!state.pendingImage) {
      showAiStatus("error", "请先上传图片。");
      return;
    }
    if (!state.deepseekApiKey) {
      showAiStatus("error", "请先点击右上角齿轮 ⚙ 配置 API Key。");
      return;
    }

    const btnRec = document.getElementById("btn-recognize");
    if (btnRec) {
      btnRec.disabled = true;
      btnRec.innerHTML = '<span class="spinner"></span>AI 识别中…';
    }

    showAiStatus("info", '<span class="spinner"></span>正在调用 DeepSeek 视觉 API 识别图片…');

    try {
      let result;
      let usedFallback = false;

      try {
        result = await callDeepseekVision(state.pendingImage.dataURL, state.deepseekApiKey);
      } catch (visionErr) {
        console.warn("Vision API failed, falling back to OCR + text:", visionErr.message);
        showAiStatus("info", '<span class="spinner"></span>视觉 API 不可用，正在使用 OCR 兜底识别…');

        const ocrText = await runOcr(state.pendingImage.dataURL);
        if (!ocrText || ocrText.trim().length < 5) {
          throw new Error("OCR 未能识别出有效文字，请换一张更清晰的图片。");
        }

        result = await callDeepseekTextStructuring(ocrText, state.deepseekApiKey);
        usedFallback = true;
      }

      const normalized = normalizeRecognitionResult(result);
      if (!normalized || !Array.isArray(normalized) || normalized.length === 0) {
        throw new Error("AI 返回的数据无法解析为题目，请重试或调整图片。");
      }

      const count = normalized.length;
      const successMsg = usedFallback
        ? `OCR 兜底识别完成！共识别出 ${count} 道题，请在下方核对并编辑后确认添加。`
        : `识别完成！共识别出 ${count} 道题，请在下方核对并编辑后确认添加。`;
      showAiStatus("success", successMsg);

      if (count === 1) {
        renderResultForm(normalized[0]);
      } else {
        renderMultipleResultForms(normalized);
      }
    } catch (err) {
      console.error("Recognition error:", err);
      showAiStatus("error", `识别失败：${err.message}`);
    } finally {
      if (btnRec) {
        btnRec.disabled = false;
        btnRec.textContent = "开始识别";
      }
    }
  }

  async function runOcr(imageDataURL) {
    if (typeof Tesseract === "undefined") {
      throw new Error("OCR 引擎未加载，请检查网络连接。");
    }

    try {
      const result = await Tesseract.recognize(
        imageDataURL,
        "chi_sim+eng",
        {
          logger: m => {
            if (m.status === "recognizing text") {
              const pct = Math.round(m.progress * 100);
              showAiStatus("info", `<span class="spinner"></span>OCR 识别中… ${pct}%`);
            }
          }
        }
      );
      return result.data.text || "";
    } catch (err) {
      console.error("OCR error:", err);
      throw new Error(`OCR 识别失败：${err.message}`);
    }
  }

  async function callDeepseekTextStructuring(text, apiKey) {
    const prompt = `你是数据结构领域的**资深教师和题目解析专家**。你的任务是从用户提供的题目文本中，**结合上下文智能还原**完整的题目信息并给出专业的解析。

待处理的题目文本（可能来自 OCR 识别，包含错别字、漏字、格式混乱等问题）：
"""
${text}
"""

🎯 核心要求：**结合上下文推断，不要轻易放弃**

⚠️ 重要：图片/文本中可能包含**多道独立的题目**（通常以"1."、"2."、"3."或"(1)"、"(2)"等题号分隔），请**逐道分开提取**，每道题作为数组中独立的一项。即使只有一道题，也必须使用 questions 数组格式。

输出严格的 JSON（不要 markdown 代码块包裹、不要任何额外文字）：

{
  "questions": [
    {
      "type": "choice" | "multi_choice" | "true_false" | "fill_blank" | "calculation" | "drawing" | "program",
      "chapter": "第N章 XXX（如果文本中有章节信息则填写，没有则留空）",
      "question": "完整的题干文本（已修正错别字、补全缺失内容）",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct_answer": 0,
      "correct_answers": [0, 2],
      "answer": "完整的参考答案文本（仅非 choice 类型）",
      "explanation": "详细的学术解析（必须给出）"
    }
  ]
}

题型说明：
- choice：单选题，只有一个正确答案，correct_answer 为 0-3 的整数
- multi_choice：多选题，可能有多个正确答案，correct_answers 为 [0,2] 格式的数组
- true_false：判断题，correct_answer 为 0（正确/对/是）或 1（错误/错/否），options 固定为 ["正确", "错误"]
- fill_blank：填空题，answer 为标准答案
- calculation：计算题，answer 为计算过程和结果
- drawing：绘图题（如二叉树、图、栈等），answer 为绘图说明
- program：程序计算题，给定程序代码求输出结果，answer 为程序运行结果

🔍 **智能识别策略**：
1. **多道题必须分开**：看到 "1." "2." "(1)" "(2)" 等题号，立即分割为独立的题目对象
2. **OCR 纠错**：如果文本有错别字（如同音字、形近字），根据上下文修正（例如"算发"→"算法"，"栈顶"→"栈顶"）
3. **补全缺失信息**：
   - 如果选择题缺选项，**根据该章节的常见考点和数据结构知识补全合理的干扰项**（在 explanation 中说明哪些是补全的）
   - 如果答案缺失，**根据该章节的经典结论和题目内容推测答案**
   - 如果解析缺失，**基于数据结构专业知识给出详细解析**
4. **绝对不要返回"无法识别"**：遇到不清晰的地方尽力推测，必须在 explanation 中以"⚠️ 注："开头标注推测/补全的部分
5. **如果题干不完整**：根据章节、题型和已知信息，构造合理的完整题干（在 question 字段中给出合理推断）

� **填空题特殊处理（非常重要）**：
- 如果题干中有"（...）"或"___"、"____"等填空标记，且括号内/下划线处已有答案内容（如"（顺序存储）方式是指..."）
- **必须**把答案提取到 answer 字段中（如 answer: "顺序存储"）
- **必须**把题干中的答案替换为填空占位符（如 question: "（____）方式是指..." 或 "（    ）方式是指..."）
- 不要让答案出现在 question 字段中！
- 多个填空时，answer 中用逗号分隔多个答案

� **context 上下文利用**：
- 如果能从题目内容识别出属于哪一章（第1章 绪论、第2章 线性表、第3章 栈和队列、第4章 串、第5章 数组与广义表、第6章 树和二叉树、第7章 图、第8章 动态存储管理、第9章 查找、第10章 内部排序、第11章 外部排序 等），在 chapter 字段填入
- 章节信息可以帮助你**判断题目考点**、**选择正确答案**、**撰写专业解析**

规则：
1. **必须把多道题分别放入数组中不同的对象**，每道题独立成一个对象
2. **始终给出 explanation**（基于专业知识，不要让此字段为空）
3. 遇到模糊不清的地方**先推测再标注**，不要直接说"无法识别"
4. 题干、选项的原文要尽量保留，仅修正明显的 OCR 错误
5. explanation 中以"⚠️ 注："开头的部分表示是基于上下文的推测/补全
6. choice 类型才填 options（长度必须为 4）和 correct_answer（0-3 整数）
7. multi_choice 类型填 options（长度必须为 4）和 correct_answers（整数数组）
8. true_false 类型填 options 为 ["正确", "错误"] 和 correct_answer（0 或 1）
9. fill_blank/calculation/drawing/program 类型才填 answer
9. 如果文本中没有章节信息，根据题目内容判断后填入；实在无法判断则留空字符串`;

    const resp = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{
          role: "user",
          content: prompt
        }],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    if (!resp.ok) {
      const text_resp = await resp.text();
      let detail = text_resp.slice(0, 200);
      try {
        const j = JSON.parse(text_resp);
        if (j.error && j.error.message) detail = j.error.message;
      } catch (_) {}
      throw new Error(`DeepSeek API ${resp.status}：${detail}`);
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("API 返回为空。");

    let jsonText = content.trim();
    const codeBlockMatch = jsonText.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (codeBlockMatch) jsonText = codeBlockMatch[1];

    return JSON.parse(jsonText);
  }

  const VISION_MODEL_CANDIDATES = [
    "deepseek-v5",
    "deepseek-v4",
    "deepseek-chat"
  ];

  async function callDeepseekVision(imageDataURL, apiKey) {
    const systemPrompt = `你是数据结构领域的**资深教师和题目解析专家**。你的任务是从用户提供的题目截图中，**结合上下文智能还原**完整的题目信息并给出专业的解析。

🎯 核心要求：**结合上下文推断，不要轻易放弃**

⚠️ 重要：图片中可能包含**多道独立的题目**（通常以"1."、"2."、"3."或"(1)"、"(2)"等题号分隔），请**逐道分开提取**，每道题作为数组中独立的一项。即使只有一道题，也必须使用 questions 数组格式。

输出严格的 JSON（不要 markdown 代码块包裹、不要任何额外文字）：

{
  "questions": [
    {
      "type": "choice" | "multi_choice" | "true_false" | "fill_blank" | "calculation" | "drawing" | "program",
      "chapter": "第N章 XXX（根据图片中显示的章节；综合题可填"综合"）",
      "question": "完整的题干文本（已修正识别错误、补全缺失内容）",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correct_answer": 0,
      "correct_answers": [0, 2],
      "answer": "完整的参考答案文本（仅非 choice 类型）",
      "explanation": "详细的学术解析（必须给出）"
    }
  ]
}

题型说明：
- choice：单选题，只有一个正确答案，correct_answer 为 0-3 的整数
- multi_choice：多选题，可能有多个正确答案，correct_answers 为 [0,2] 格式的数组
- true_false：判断题，correct_answer 为 0（正确/对/是）或 1（错误/错/否），options 固定为 ["正确", "错误"]
- fill_blank：填空题，answer 为标准答案
- calculation：计算题，answer 为计算过程和结果
- drawing：绘图题（如二叉树、图、栈等），answer 为绘图说明
- program：程序计算题，给定程序代码求输出结果，answer 为程序运行结果

🔍 **智能识别策略**：
1. **多道题必须分开**：看到 "1." "2." "(1)" "(2)" 等题号，立即分割为独立的题目对象
2. **图片识别纠错**：如果文字模糊、识别错误，根据上下文修正
3. **补全缺失信息**：
   - 如果选择题缺选项，**根据该章节的常见考点和数据结构知识补全合理的干扰项**（在 explanation 中说明哪些是补全的）
   - 如果答案缺失，**根据该章节的经典结论和题目内容推测答案**
   - 如果解析缺失，**基于数据结构专业知识给出详细解析**
4. **绝对不要返回"无法识别"**：遇到不清晰的地方尽力推测，必须在 explanation 中以"⚠️ 注："开头标注推测/补全的部分
5. **如果题干不完整**：根据章节、题型和已知信息，构造合理的完整题干（在 question 字段中给出合理推断）

📝 **填空题特殊处理（非常重要）**：
- 如果题干中有"（...）"或"___"、"____"等填空标记，且括号内/下划线处已有答案内容（如"（顺序存储）方式是指..."）
- **必须**把答案提取到 answer 字段中（如 answer: "顺序存储"）
- **必须**把题干中的答案替换为填空占位符（如 question: "（____）方式是指..." 或 "（    ）方式是指..."）
- 不要让答案出现在 question 字段中！
- 多个填空时，answer 中用逗号分隔多个答案

📚 **context 上下文利用**：
- 如果能从题目内容识别出属于哪一章（第1章 绪论、第2章 线性表、第3章 栈和队列、第4章 串、第5章 数组与广义表、第6章 树和二叉树、第7章 图、第8章 动态存储管理、第9章 查找、第10章 内部排序、第11章 外部排序 等），在 chapter 字段填入
- 章节信息可以帮助你**判断题目考点**、**选择正确答案**、**撰写专业解析**

规则：
1. **必须把多道题分别放入数组中不同的对象**，每道题独立成一个对象
2. **始终给出 explanation**（基于专业知识，不要让此字段为空）
3. 遇到模糊不清的地方**先推测再标注**，不要直接说"无法识别"
4. 题干、选项的原文要尽量保留，仅修正明显的识别错误
5. explanation 中以"⚠️ 注："开头的部分表示是基于上下文的推测/补全
6. choice 类型才填 options（长度必须为 4）和 correct_answer（0-3 整数）
7. multi_choice 类型填 options（长度必须为 4）和 correct_answers（整数数组）
8. fill_blank/calculation/drawing/program 类型才填 answer
9. 如果图片中没有章节信息，根据题目内容判断后填入；实在无法判断则留空字符串`;

    let lastError = null;

    for (const model of VISION_MODEL_CANDIDATES) {
      try {
        const resp = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: [{
              role: "user",
              content: [
                { type: "text", text: systemPrompt },
                { type: "image_url", image_url: { url: imageDataURL } }
              ]
            }],
            response_format: { type: "json_object" },
            temperature: 0.1
          })
        });

        if (!resp.ok) {
          const text = await resp.text();
          let detail = text.slice(0, 200);
          try {
            const j = JSON.parse(text);
            if (j.error && j.error.message) detail = j.error.message;
          } catch (_) {}
          const isSchemaError = text.includes("unknown variant") && text.includes("image_url");
          if (isSchemaError && model !== VISION_MODEL_CANDIDATES[VISION_MODEL_CANDIDATES.length - 1]) {
            lastError = new Error(`模型 ${model} 不支持图片输入，正在尝试下一个模型…`);
            continue;
          }
          throw new Error(`DeepSeek API ${resp.status}：${detail}`);
        }

        const data = await resp.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error("API 返回为空。");

        let jsonText = content.trim();
        const codeBlockMatch = jsonText.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
        if (codeBlockMatch) jsonText = codeBlockMatch[1];

        return JSON.parse(jsonText);
      } catch (err) {
        lastError = err;
        if (err.message && err.message.includes("模型") && err.message.includes("不支持图片输入")) {
          continue;
        }
        throw err;
      }
    }

    if (lastError) throw lastError;
    throw new Error("所有候选模型均调用失败。");
  }

  function normalizeSingleQuestion(raw) {
    if (!raw || typeof raw !== "object") return null;

    let type = (raw.type || "").toString().trim().toLowerCase();
    const validTypes = ["choice", "multi_choice", "true_false", "fill_blank", "calculation", "drawing", "program"];
    
    if (!validTypes.includes(type)) {
      const opts = Array.isArray(raw.options) ? raw.options : [];
      
      if (opts.length >= 2) {
        const optStr = opts.join("");
        if (optStr.includes("正确") && optStr.includes("错误")) {
          type = "true_false";
        } else {
          type = "multi_choice";
        }
      } else if (opts.length === 4) {
        type = "choice";
      } else {
        type = "calculation";
      }
    }

    let question = (raw.question || "").toString().trim();
    let answer = (raw.answer || "").toString().trim();

    // --- Step 1: Extract answer from question tail (patterns like "答案：xxx", "答：xxx", "参考答案：xxx") ---
    const tailAnswerPatterns = [
      /[答参][案考][：:]\s*(.+?)\s*$/,
      /^答[：:]\s*(.+?)\s*$/m,
      /答案\s*[为是]\s*(.+?)\s*[。.]?$/
    ];
    for (const pattern of tailAnswerPatterns) {
      const m = question.match(pattern);
      if (m && m[1]) {
        const extracted = m[1].trim();
        if (extracted.length > 0 && extracted.length < 200 && !answer) {
          answer = extracted;
        }
        // Remove the answer line from question regardless
        question = question.replace(pattern, "").trim();
        break;
      }
    }

    // --- Step 2: Extract fill-blank answers from bracket patterns (always run) ---
    // Match patterns like: （答案）、(答案)、【答案】、［答案］、〔答案〕
    const fillRegex = /[（(【〔［]([^)）】〕］]+?)[)）】〕］]/g;
    const matches = [];
    let m2;
    while ((m2 = fillRegex.exec(question)) !== null) {
      const content = m2[1].trim();
      if (content.length > 0 && content.length <= 20
          && !/[。！？!?]$/.test(content)
          && !/^[第这那上述以下上述]/.test(content)
          && !/，|。|,|\./.test(content)) {
        matches.push(content);
      }
    }

    let extractedFillAnswer = false;
    if (matches.length > 0) {
      let newQuestion = question;
      let matchIdx = 0;
      newQuestion = newQuestion.replace(/[（(【〔［]([^)）】〕］]+?)[)）】〕］]/g, (match, content) => {
        const trimmed = content.trim();
        if (trimmed.length > 0 && trimmed.length <= 20
            && !/[。！？!?]$/.test(trimmed)
            && !/^[第这那上述以下上述]/.test(trimmed)
            && !/，|。|,|\./.test(trimmed)) {
          matchIdx++;
          return "（____）";
        }
        return match;
      });

      if (matchIdx > 0) {
        question = newQuestion;
        if (!answer) {
          answer = matches.join("，");
        }
        extractedFillAnswer = true;
      }
    }

    // If we extracted fill-blank answers, force type to fill_blank (unless it's choice/multi_choice with valid options)
    if (extractedFillAnswer && type !== "choice" && type !== "multi_choice") {
      type = "fill_blank";
    }

    const result = {
      type,
      chapter: (raw.chapter || "").toString().trim(),
      question,
      explanation: (raw.explanation || "").toString().trim()
    };

    if (type === "choice") {
      let options = Array.isArray(raw.options) ? raw.options.map(o => o.toString().replace(/^[A-D][.、:：\s]+/i, "").trim()) : [];
      while (options.length < 4) options.push("");
      result.options = options.slice(0, 4);

      let ca = parseInt(raw.correct_answer);
      if (isNaN(ca) || ca < 0 || ca > 3) ca = 0;
      result.correct_answer = ca;
      result.correct_answers = [ca];
    } else if (type === "multi_choice") {
      let options = Array.isArray(raw.options) ? raw.options.map(o => o.toString().replace(/^[A-D][.、:：\s]+/i, "").trim()) : [];
      while (options.length < 4) options.push("");
      result.options = options.slice(0, 4);

      let caList = raw.correct_answers;
      if (Array.isArray(caList)) {
        result.correct_answers = caList.map(i => parseInt(i)).filter(i => !isNaN(i) && i >= 0 && i <= 3);
      } else {
        result.correct_answers = [0];
      }
      if (result.correct_answers.length === 0) result.correct_answers = [0];
    } else if (type === "true_false") {
      result.options = ["正确", "错误"];
      let ca = parseInt(raw.correct_answer);
      if (isNaN(ca) || ca < 0 || ca > 1) ca = 0;
      result.correct_answer = ca;
      result.correct_answers = [ca];
    } else {
      result.answer = answer;
    }

    // Require question; explanation is recommended but not strictly required anymore
    if (!result.question) return null;
    return result;
  }

  // Display-level sanitization: ensure fill-blank answers are not shown in question text
  function sanitizeFillBlankQuestion(questionText) {
    if (!questionText) return questionText;
    return questionText.replace(/[（(【〔［]([^)）】〕］]{1,20})[)）】〕］]/g, function(match, content) {
      const trimmed = content.trim();
      // Only blank out if it looks like a short answer (not a sentence or explanation)
      if (trimmed.length > 0 && trimmed.length <= 20
          && !/[。！？!?]$/.test(trimmed)
          && !/^[第这那上述以下上述]/.test(trimmed)
          && !/，|。|,|\./.test(trimmed)) {
        return "（____）";
      }
      return match;
    });
  }

  function normalizeRecognitionResult(raw) {
    if (!raw || typeof raw !== "object") return null;

    // New format: { questions: [...] }
    if (Array.isArray(raw.questions)) {
      const results = raw.questions.map(q => normalizeSingleQuestion(q)).filter(Boolean);
      return results.length > 0 ? results : null;
    }

    // Try to detect if question field contains multiple questions (e.g., AI didn't split properly)
    // Check for patterns like "1." "2." "\n(1)" "\n(2)" etc.
    if (typeof raw.question === "string" && raw.question.length > 100) {
      const splitResult = trySplitMultipleQuestions(raw);
      if (splitResult && splitResult.length > 1) {
        // Run each split question through normalizeSingleQuestion to ensure fill-blank extraction etc.
        const normalized = splitResult.map(q => normalizeSingleQuestion(q)).filter(Boolean);
        return normalized.length > 0 ? normalized : null;
      }
    }

    // Old format (backward compat): single question object
    const single = normalizeSingleQuestion(raw);
    return single ? [single] : null;
  }

  function trySplitMultipleQuestions(raw) {
    const text = raw.question || "";
    if (!text) return null;

    // Patterns to detect: "1.", "2.", "3." or "(1)", "(2)", "1、", "1．" etc.
    // Split on these patterns but keep the question number
    const splitRegex = /(?=\n\s*(?:\d+[\.\．、:：]|\(\d+\)))/g;
    const parts = text.split(splitRegex).map(s => s.trim()).filter(s => s.length > 10);

    if (parts.length < 2) return null;

    // Reconstruct questions
    const questions = [];
    const sharedChapter = raw.chapter || "";
    const sharedExplanation = raw.explanation || "";

    for (const part of parts) {
      // Try to detect type and structure within each part
      const isChoiceLike = /^[A-D][.、:：\s]/m.test(part) || /[A-D][.、:：]/.test(part);
      const isTrueFalse = /[对否是错](吗|？|\?)|正确|错误/.test(part);
      
      let type = "calculation";
      let options = undefined;
      
      if (isChoiceLike) {
        type = "choice";
        options = extractOptionsFromText(part);
      } else if (isTrueFalse) {
        type = "true_false";
        options = ["正确", "错误"];
      }
      
      const question = {
        type,
        chapter: sharedChapter,
        question: part,
        explanation: sharedExplanation,
        options,
        correct_answer: 0
      };

      if (question.options) {
        question.correct_answers = [0];
      } else {
        question.answer = "";
      }

      questions.push(question);
    }

    return questions.length >= 2 ? questions : null;
  }

  function extractOptionsFromText(text) {
    const options = [];
    const lines = text.split("\n");
    for (const line of lines) {
      const m = line.trim().match(/^([A-D])[\.、:：\s]+(.+)/);
      if (m) {
        const idx = m[1].charCodeAt(0) - 65; // 65 = 'A'
        if (idx >= 0 && idx < 4) {
          options[idx] = m[2].trim();
        }
      }
    }
    // Pad to 4
    while (options.length < 4) options.push("");
    return options.slice(0, 4).filter(Boolean).length >= 2 ? options : null;
  }

  function renderResultForm(data) {
    const container = document.getElementById("result-container");
    if (!container) return;

    const isChoiceType = data.type === "choice" || data.type === "multi_choice" || data.type === "true_false";
    const isMultiChoice = data.type === "multi_choice";
    const chapterOptions = getChapterSuggestions();
    const correctAnswers = data.correct_answers || (data.correct_answer !== undefined ? [data.correct_answer] : []);

    container.innerHTML = `
      <div class="result-form" id="result-form">
        <h3>核对并编辑识别结果</h3>
        <p style="background: var(--surface-soft); padding: 10px 14px; border-radius: 6px; font-size: 13px; color: var(--muted); margin-bottom: 16px;">
          💡 提示：AI 识别的<strong>答案和解析</strong>默认隐藏，避免影响你独立判断。请先核对题干/选项，确认无误后再点击下方按钮查看答案。
        </p>

        <div class="form-group">
          <label class="form-label">章节</label>
          <input type="text" class="text-input" id="r-chapter" list="chapter-list"
            value="${escapeAttr(data.chapter)}" placeholder="例如：第3章 栈和队列">
          <datalist id="chapter-list">
            ${chapterOptions.map(c => `<option value="${escapeAttr(c)}">`).join("")}
          </datalist>
        </div>

        <div class="form-group">
          <label class="form-label">题型</label>
          <div class="type-pills" id="r-type-pills">
            <button class="type-pill ${data.type === 'choice' ? 'active' : ''}" data-type="choice">单选题</button>
            <button class="type-pill ${data.type === 'multi_choice' ? 'active' : ''}" data-type="multi_choice">多选题</button>
            <button class="type-pill ${data.type === 'true_false' ? 'active' : ''}" data-type="true_false">判断题</button>
            <button class="type-pill ${data.type === 'fill_blank' ? 'active' : ''}" data-type="fill_blank">填空题</button>
            <button class="type-pill ${data.type === 'calculation' ? 'active' : ''}" data-type="calculation">计算题</button>
            <button class="type-pill ${data.type === 'drawing' ? 'active' : ''}" data-type="drawing">绘图题</button>
            <button class="type-pill ${data.type === 'program' ? 'active' : ''}" data-type="program">程序题</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">题干 <span style="color: var(--error);">*</span></label>
          <textarea class="textarea-input" id="r-question" rows="4">${escapeHtml(sanitizeFillBlankQuestion(data.question))}</textarea>
        </div>

        <div class="form-group" id="r-options-group" style="display: ${isChoiceType ? 'block' : 'none'};">
          <label class="form-label" id="r-options-label">选项（先不要看答案，自己标记正确答案）</label>
          <div class="options-edit-list" id="r-options-list">
            ${data.type === "true_false" 
              ? [0, 1].map(i => {
                  const isCorrect = data.correct_answer === i;
                  return `
                  <div class="option-row ${isCorrect ? 'correct' : ''}" data-idx="${i}">
                    <div class="option-radio ${isCorrect ? 'checked' : ''}" data-idx="${i}"></div>
                    <span class="option-letter">${i === 0 ? '正确' : '错误'}</span>
                    <input class="option-text-input" type="text" data-idx="${i}"
                      value="${escapeAttr((data.options && data.options[i]) || (i === 0 ? '正确' : '错误'))}"
                      readonly style="background: var(--surface-soft); color: var(--muted);">
                  </div>
                `;
                }).join("")
              : [0, 1, 2, 3].map(i => `
                  <div class="option-row" data-idx="${i}">
                    ${isMultiChoice
                      ? `<div class="option-checkbox" data-idx="${i}"></div>`
                      : `<div class="option-radio" data-idx="${i}"></div>`}
                    <span class="option-letter">${String.fromCharCode(65 + i)}.</span>
                    <input class="option-text-input" type="text" data-idx="${i}"
                      value="${escapeAttr((data.options && data.options[i]) || '')}"
                      placeholder="选项 ${String.fromCharCode(65 + i)} 的内容">
                  </div>
                `).join("")}
          </div>
        </div>

        <div class="form-group" id="r-answer-group" style="display: ${!isChoiceType ? 'block' : 'none'};">
          <label class="form-label">参考答案</label>
          <div class="hidden-answer" id="r-answer-hidden">
            <button type="button" class="btn btn-secondary" id="btn-reveal-answer" style="width: 100%;">
              👁️ 点击查看 AI 识别的参考答案
            </button>
            <textarea class="textarea-input mono" id="r-answer" rows="3" style="display: none; margin-top: 8px;">${escapeHtml(data.answer || "")}</textarea>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">学术解析</label>
          <div class="hidden-answer" id="r-explanation-hidden">
            <button type="button" class="btn btn-secondary" id="btn-reveal-explanation" style="width: 100%;">
              👁️ 点击查看 AI 撰写的学术解析
            </button>
            <textarea class="textarea-input" id="r-explanation" rows="5" style="display: none; margin-top: 8px;">${escapeHtml(data.explanation)}</textarea>
            <p class="form-hint">可以基于题目自行推导解题过程，但必须逻辑正确。</p>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-secondary" id="btn-rerun">重新识别</button>
          <button class="btn btn-secondary" id="btn-cancel-add">取消</button>
          <button class="btn btn-primary" id="btn-confirm-add">确认添加</button>
        </div>
      </div>
    `;

    setupResultFormEvents();
  }

  function renderMultipleResultForms(dataList) {
    const container = document.getElementById("result-container");
    if (!container) return;

    const chapterOptions = getChapterSuggestions();

    container.innerHTML = `
      <div class="multi-result-header" style="margin-bottom: 16px; padding: 12px 16px; background: var(--surface-soft); border-radius: 8px; border: 1px solid var(--hairline); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <h3 style="margin: 0; font-size: 16px;">共识别出 ${dataList.length} 道题</h3>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary" id="btn-confirm-all">全部添加</button>
          <button class="btn btn-secondary" id="btn-rerun-multi">重新识别</button>
          <button class="btn btn-secondary" id="btn-cancel-multi">取消</button>
        </div>
      </div>
      <div id="multi-forms-container">
        ${dataList.map((data, idx) => renderSingleResultCard(data, idx, chapterOptions)).join("")}
      </div>
    `;

    setupMultipleResultEvents(dataList);
  }

  function renderSingleResultCard(data, idx, chapterOptions) {
    const isChoiceType = data.type === "choice" || data.type === "multi_choice" || data.type === "true_false";
    const isMultiChoice = data.type === "multi_choice";

    return `
      <div class="result-form" id="result-form-${idx}" style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="margin: 0;">第 ${idx + 1} 题</h4>
          <button class="btn btn-primary btn-confirm-one" data-idx="${idx}" style="height: 32px; font-size: 13px;">添加此题</button>
        </div>

        <div class="form-group">
          <label class="form-label">章节</label>
          <input type="text" class="text-input r-chapter" data-idx="${idx}" list="chapter-list-${idx}"
            value="${escapeAttr(data.chapter)}" placeholder="例如：第3章 栈和队列">
          <datalist id="chapter-list-${idx}">
            ${chapterOptions.map(c => `<option value="${escapeAttr(c)}">`).join("")}
          </datalist>
        </div>

        <div class="form-group">
          <label class="form-label">题型</label>
          <div class="type-pills r-type-pills" data-idx="${idx}">
            <button class="type-pill ${data.type === 'choice' ? 'active' : ''}" data-type="choice">单选题</button>
            <button class="type-pill ${data.type === 'multi_choice' ? 'active' : ''}" data-type="multi_choice">多选题</button>
            <button class="type-pill ${data.type === 'true_false' ? 'active' : ''}" data-type="true_false">判断题</button>
            <button class="type-pill ${data.type === 'fill_blank' ? 'active' : ''}" data-type="fill_blank">填空题</button>
            <button class="type-pill ${data.type === 'calculation' ? 'active' : ''}" data-type="calculation">计算题</button>
            <button class="type-pill ${data.type === 'drawing' ? 'active' : ''}" data-type="drawing">绘图题</button>
            <button class="type-pill ${data.type === 'program' ? 'active' : ''}" data-type="program">程序题</button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">题干 <span style="color: var(--error);">*</span></label>
          <textarea class="textarea-input r-question" data-idx="${idx}" rows="4">${escapeHtml(sanitizeFillBlankQuestion(data.question))}</textarea>
        </div>

        <div class="form-group r-options-group" data-idx="${idx}" style="display: ${isChoiceType ? 'block' : 'none'};">
          <label class="form-label r-options-label" data-idx="${idx}">选项（先不要看答案，自己标记正确答案）</label>
          <div class="options-edit-list r-options-list" data-idx="${idx}">
            ${data.type === "true_false" 
              ? [0, 1].map(i => {
                  const isCorrect = data.correct_answer === i;
                  return `
                  <div class="option-row ${isCorrect ? 'correct' : ''}" data-idx="${i}">
                    <div class="option-radio ${isCorrect ? 'checked' : ''}" data-idx="${i}"></div>
                    <span class="option-letter">${i === 0 ? '正确' : '错误'}</span>
                    <input class="option-text-input" type="text" data-idx="${i}"
                      value="${escapeAttr((data.options && data.options[i]) || (i === 0 ? '正确' : '错误'))}"
                      readonly style="background: var(--surface-soft); color: var(--muted);">
                  </div>
                `;
                }).join("")
              : [0, 1, 2, 3].map(i => `
                  <div class="option-row" data-idx="${i}">
                    ${isMultiChoice
                      ? `<div class="option-checkbox" data-idx="${i}"></div>`
                      : `<div class="option-radio" data-idx="${i}"></div>`}
                    <span class="option-letter">${String.fromCharCode(65 + i)}.</span>
                    <input class="option-text-input" type="text" data-idx="${i}"
                      value="${escapeAttr((data.options && data.options[i]) || '')}"
                      placeholder="选项 ${String.fromCharCode(65 + i)} 的内容">
                  </div>
                `).join("")}
          </div>
        </div>

        <div class="form-group r-answer-group" data-idx="${idx}" style="display: ${!isChoiceType ? 'block' : 'none'};">
          <label class="form-label">参考答案</label>
          <div class="hidden-answer">
            <button type="button" class="btn btn-secondary btn-reveal-answer" data-idx="${idx}" style="width: 100%;">
              👁️ 点击查看 AI 识别的参考答案
            </button>
            <textarea class="textarea-input mono r-answer" data-idx="${idx}" rows="3" style="display: none; margin-top: 8px;">${escapeHtml(data.answer || "")}</textarea>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">学术解析</label>
          <div class="hidden-answer">
            <button type="button" class="btn btn-secondary btn-reveal-explanation" data-idx="${idx}" style="width: 100%;">
              👁️ 点击查看 AI 撰写的学术解析
            </button>
            <textarea class="textarea-input r-explanation" data-idx="${idx}" rows="5" style="display: none; margin-top: 8px;">${escapeHtml(data.explanation)}</textarea>
          </div>
        </div>
      </div>
    `;
  }

  function setupMultipleResultEvents(dataList) {
    // Type pills toggle for each form
    document.querySelectorAll(".r-type-pills").forEach(pillsContainer => {
      const idx = parseInt(pillsContainer.getAttribute("data-idx"));
      const pills = pillsContainer.querySelectorAll(".type-pill");
      pills.forEach(p => {
        p.addEventListener("click", () => {
          pills.forEach(x => x.classList.remove("active"));
          p.classList.add("active");
          const currentType = p.getAttribute("data-type");
          const isChoiceType = currentType === "choice" || currentType === "multi_choice" || currentType === "true_false";
          const isMultiChoice = currentType === "multi_choice";

          const optionsGroup = document.querySelector(`.r-options-group[data-idx="${idx}"]`);
          const answerGroup = document.querySelector(`.r-answer-group[data-idx="${idx}"]`);
          const optionsLabel = document.querySelector(`.r-options-label[data-idx="${idx}"]`);

          if (optionsGroup) optionsGroup.style.display = isChoiceType ? "block" : "none";
          if (answerGroup) answerGroup.style.display = !isChoiceType ? "block" : "none";
          if (optionsLabel) optionsLabel.textContent = isMultiChoice ? "选项（勾选所有正确答案）" : "选项（点击单选按钮标记正确答案）";

          // Re-render options with correct indicator type
          if (isChoiceType) {
            const optionsList = document.querySelector(`.r-options-list[data-idx="${idx}"]`);
            if (currentType === "true_false") {
              const correctRows = optionsList.querySelectorAll(".option-row.correct");
              const correctIdxs = Array.from(correctRows).map(r => parseInt(r.getAttribute("data-idx")));
              
              optionsList.innerHTML = [0, 1].map(i => {
                const isCorrect = correctIdxs.includes(i);
                return '<div class="option-row ' + (isCorrect ? 'correct' : '') + '" data-idx="' + i + '">' +
                  '<div class="option-radio ' + (isCorrect && correctIdxs.length === 1 ? 'checked' : '') + '" data-idx="' + i + '"></div>' +
                  '<span class="option-letter">' + (i === 0 ? '正确' : '错误') + '</span>' +
                  '<input class="option-text-input" type="text" data-idx="' + i + '" ' +
                  'value="' + escapeAttr(i === 0 ? '正确' : '错误') + '" ' +
                  'readonly style="background: var(--surface-soft); color: var(--muted);">' +
                  '</div>';
              }).join("");
              setupMultiOptionRowListeners(idx, false);
            } else {
              const currentOptions = [0, 1, 2, 3].map(i => {
                const input = optionsList.querySelector(`.option-text-input[data-idx="${i}"]`);
                return input ? input.value : "";
              });
              const correctRows = optionsList.querySelectorAll(".option-row.correct");
              const correctIdxs = Array.from(correctRows).map(r => parseInt(r.getAttribute("data-idx")));

              optionsList.innerHTML = [0, 1, 2, 3].map(i => {
                const isCorrect = correctIdxs.includes(i);
                const letter = String.fromCharCode(65 + i);
                let html = '<div class="option-row ' + (isCorrect ? 'correct' : '') + '" data-idx="' + i + '">';
                if (isMultiChoice) {
                  html += '<div class="option-checkbox ' + (isCorrect ? 'checked' : '') + '" data-idx="' + i + '"></div>';
                } else {
                  html += '<div class="option-radio ' + (isCorrect && correctIdxs.length === 1 ? 'checked' : '') + '" data-idx="' + i + '"></div>';
                }
                html += '<span class="option-letter">' + letter + '.</span>' +
                  '<input class="option-text-input" type="text" data-idx="' + i + '" ' +
                  'value="' + escapeAttr(currentOptions[i]) + '" ' +
                  'placeholder="选项 ' + letter + ' 的内容">' +
                  '</div>';
                return html;
              }).join("");

              setupMultiOptionRowListeners(idx, isMultiChoice);
            }
          }
        });
      });

      // Setup initial option listeners
      const activePill = pillsContainer.querySelector(".type-pill.active");
      const initialType = activePill ? activePill.getAttribute("data-type") : "choice";
      setupMultiOptionRowListeners(idx, initialType === "multi_choice");
    });

    // Reveal answer buttons
    document.querySelectorAll(".btn-reveal-answer").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.style.display = "none";
        const idx = btn.getAttribute("data-idx");
        const ta = document.querySelector(`.r-answer[data-idx="${idx}"]`);
        if (ta) ta.style.display = "block";
      });
    });

    // Reveal explanation buttons
    document.querySelectorAll(".btn-reveal-explanation").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.style.display = "none";
        const idx = btn.getAttribute("data-idx");
        const ta = document.querySelector(`.r-explanation[data-idx="${idx}"]`);
        if (ta) ta.style.display = "block";
      });
    });

    // Confirm single question
    document.querySelectorAll(".btn-confirm-one").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-idx"));
        confirmAddQuestionByIndex(idx);
      });
    });

    // Confirm all
    const btnConfirmAll = document.getElementById("btn-confirm-all");
    if (btnConfirmAll) {
      btnConfirmAll.addEventListener("click", () => confirmAddAllQuestions(dataList.length));
    }

    // Rerun
    const btnRerun = document.getElementById("btn-rerun-multi");
    if (btnRerun) {
      btnRerun.addEventListener("click", () => {
        document.getElementById("result-container").innerHTML = "";
        recognizeImage();
      });
    }

    // Cancel
    const btnCancel = document.getElementById("btn-cancel-multi");
    if (btnCancel) {
      btnCancel.addEventListener("click", () => {
        if (confirm("放弃当前识别结果？")) {
          document.getElementById("result-container").innerHTML = "";
          state.pendingImage = null;
          const pc = document.getElementById("preview-container");
          if (pc) pc.innerHTML = "";
          showAiStatus("info", "已取消。");
        }
      });
    }
  }

  function setupMultiOptionRowListeners(formIdx, isMultiChoice) {
    const optionsList = document.querySelector(`.r-options-list[data-idx="${formIdx}"]`);
    if (!optionsList) return;
    const optionRows = optionsList.querySelectorAll(".option-row");
    optionRows.forEach(row => {
      // Remove old listeners by cloning
      const newRow = row.cloneNode(true);
      row.parentNode.replaceChild(newRow, row);
      newRow.addEventListener("click", (e) => {
        if (e.target.tagName === "INPUT") return;
        const idx = parseInt(newRow.getAttribute("data-idx"));

        if (isMultiChoice) {
          const isCurrentlyCorrect = newRow.classList.contains("correct");
          if (isCurrentlyCorrect) {
            newRow.classList.remove("correct");
            const checkbox = newRow.querySelector(".option-checkbox");
            if (checkbox) checkbox.classList.remove("checked");
          } else {
            newRow.classList.add("correct");
            const checkbox = newRow.querySelector(".option-checkbox");
            if (checkbox) checkbox.classList.add("checked");
          }
        } else {
          const allRows = optionsList.querySelectorAll(".option-row");
          allRows.forEach(r => r.classList.remove("correct"));
          allRows.forEach(r => {
            const radio = r.querySelector(".option-radio");
            if (radio) radio.classList.remove("checked");
          });
          newRow.classList.add("correct");
          const radio = newRow.querySelector(".option-radio");
          if (radio) radio.classList.add("checked");
        }
      });
    });
  }

  function confirmAddQuestionByIndex(idx) {
    const chapter = document.querySelector(`.r-chapter[data-idx="${idx}"]`).value.trim() || "未分类";
    const question = document.querySelector(`.r-question[data-idx="${idx}"]`).value.trim();
    const explanation = document.querySelector(`.r-explanation[data-idx="${idx}"]`).value.trim();

    if (!question) { alert(`第 ${idx + 1} 题：请填写题干。`); return; }

    const activePill = document.querySelector(`.r-type-pills[data-idx="${idx}"] .type-pill.active`);
    const type = activePill ? activePill.getAttribute("data-type") : "calculation";

    const newQ = {
      id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      filename: state.pendingImage ? (state.pendingImage.filename || "") : "",
      chapter,
      type,
      question,
      explanation: explanation || "",
      _userAdded: true,
      display_number: `+${state.addedQuestions.length + 1}`
    };

    if (type === "choice" || type === "multi_choice") {
      const optionsList = document.querySelector(`.r-options-list[data-idx="${idx}"]`);
      const options = [0, 1, 2, 3].map(i => {
        const input = optionsList.querySelector(`.option-text-input[data-idx="${i}"]`);
        return input ? input.value.trim() : "";
      });
      if (options.some(o => !o)) {
        alert(`第 ${idx + 1} 题：选择题必须填写全部 4 个选项。`);
        return;
      }
      const correctRows = optionsList.querySelectorAll(".option-row.correct");
      if (correctRows.length === 0) {
        alert(type === "multi_choice" ? `第 ${idx + 1} 题：请勾选所有正确答案。` : `第 ${idx + 1} 题：请标记一个正确选项。`);
        return;
      }
      const correctIdxs = Array.from(correctRows).map(r => parseInt(r.getAttribute("data-idx")));
      newQ.options = options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`);
      newQ.correct_answer = correctIdxs[0];
      newQ.correct_answers = correctIdxs;
    } else if (type === "true_false") {
      const optionsList = document.querySelector(`.r-options-list[data-idx="${idx}"]`);
      newQ.options = ["正确", "错误"];
      const correctRows = optionsList.querySelectorAll(".option-row.correct");
      if (correctRows.length === 0) {
        alert(`第 ${idx + 1} 题：请标记一个正确选项。`);
        return;
      }
      const correctIdxs = Array.from(correctRows).map(r => parseInt(r.getAttribute("data-idx")));
      newQ.correct_answer = correctIdxs[0] === 0 || correctIdxs[0] === 1 ? correctIdxs[0] : 0;
      newQ.correct_answers = [newQ.correct_answer];
    } else {
      const ans = document.querySelector(`.r-answer[data-idx="${idx}"]`).value.trim();
      if (!ans) {
        if (!confirm(`第 ${idx + 1} 题：未填写参考答案。确认添加（这道题将无法自评）吗？`)) {
          return;
        }
        newQ.answer = "";
      } else {
        newQ.answer = ans;
      }
    }

    state.addedQuestions.push(newQ);
    state.questions.push(newQ);
    state.questionStatuses[newQ.id] = "unattempted";
    saveStateToStorage();

    // Hide the form for this question
    const form = document.getElementById(`result-form-${idx}`);
    if (form) {
      form.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--success); font-weight: 600;">✅ 第 ${idx + 1} 题已添加</div>`;
      form.style.opacity = "0.7";
    }

    showAiStatus("success", `第 ${idx + 1} 题已添加！`);
    renderAddedList();
    renderSidebar();
  }

  function confirmAddAllQuestions(totalCount) {
    let addedCount = 0;
    for (let i = 0; i < totalCount; i++) {
      const form = document.getElementById(`result-form-${i}`);
      if (!form || form.innerHTML.includes("已添加")) continue;

      const question = document.querySelector(`.r-question[data-idx="${i}"]`).value.trim();
      if (!question) continue;

      confirmAddQuestionByIndex(i);
      addedCount++;
    }

    if (addedCount > 0) {
      showAiStatus("success", `已批量添加 ${addedCount} 道题！`);
      // Clear everything after batch add
      state.pendingImage = null;
      document.getElementById("result-container").innerHTML = "";
      document.getElementById("preview-container").innerHTML = "";
    } else {
      alert("没有可添加的题目，请检查每道题的题干是否已填写。");
    }
  }

  function setupOptionRowListeners(isMultiChoice) {
    const optionRows = document.querySelectorAll("#r-options-list .option-row");
    optionRows.forEach(row => {
      row.addEventListener("click", (e) => {
        if (e.target.tagName === "INPUT") return;
        const idx = parseInt(row.getAttribute("data-idx"));

        if (isMultiChoice) {
          // Toggle checkbox style for multi-choice
          const isCurrentlyCorrect = row.classList.contains("correct");
          if (isCurrentlyCorrect) {
            row.classList.remove("correct");
            const checkbox = row.querySelector(".option-checkbox");
            if (checkbox) checkbox.classList.remove("checked");
          } else {
            row.classList.add("correct");
            const checkbox = row.querySelector(".option-checkbox");
            if (checkbox) checkbox.classList.add("checked");
          }
        } else {
          // Radio style for single choice
          optionRows.forEach(r => r.classList.remove("correct"));
          optionRows.forEach(r => {
            const radio = r.querySelector(".option-radio");
            if (radio) radio.classList.remove("checked");
          });
          row.classList.add("correct");
          const radio = row.querySelector(".option-radio");
          if (radio) radio.classList.add("checked");
        }
      });
    });
  }

  function setupResultFormEvents() {
    // Type pills toggle
    const pills = document.querySelectorAll("#r-type-pills .type-pill");
    let currentType = "choice";
    pills.forEach(p => {
      if (p.classList.contains("active")) currentType = p.getAttribute("data-type");
      p.addEventListener("click", () => {
        pills.forEach(x => x.classList.remove("active"));
        p.classList.add("active");
        currentType = p.getAttribute("data-type");
        const isChoiceType = currentType === "choice" || currentType === "multi_choice" || currentType === "true_false";
        const isMultiChoice = currentType === "multi_choice";
        document.getElementById("r-options-group").style.display = isChoiceType ? "block" : "none";
        document.getElementById("r-answer-group").style.display = !isChoiceType ? "block" : "none";
        document.getElementById("r-options-label").textContent = isMultiChoice ? "选项（勾选所有正确答案）" : "选项（点击单选按钮标记正确答案）";

        // Re-render options with correct indicator type
        const optionsGroup = document.getElementById("r-options-group");
        if (isChoiceType) {
          const optionsList = document.getElementById("r-options-list");
          if (currentType === "true_false") {
            const correctRows = optionsList.querySelectorAll(".option-row.correct");
            const correctIdxs = Array.from(correctRows).map(r => parseInt(r.getAttribute("data-idx")));
            
            optionsList.innerHTML = [0, 1].map(i => `
              <div class="option-row ${correctIdxs.includes(i) ? 'correct' : ''}" data-idx="${i}">
                <div class="option-radio ${correctIdxs.includes(i) && correctIdxs.length === 1 ? 'checked' : ''}" data-idx="${i}"></div>
                <span class="option-letter">${i === 0 ? '正确' : '错误'}</span>
                <input class="option-text-input" type="text" data-idx="${i}"
                  value="${escapeAttr(i === 0 ? '正确' : '错误')}"
                  readonly style="background: var(--surface-soft); color: var(--muted);">
              </div>
            `).join("");
            setupOptionRowListeners(false);
          } else {
            const currentOptions = [0, 1, 2, 3].map(i => {
              const input = optionsList.querySelector(`.option-text-input[data-idx="${i}"]`);
              return input ? input.value : "";
            });
            const correctRows = optionsList.querySelectorAll(".option-row.correct");
            const correctIdxs = Array.from(correctRows).map(r => parseInt(r.getAttribute("data-idx")));

            optionsList.innerHTML = [0, 1, 2, 3].map(i => `
              <div class="option-row ${correctIdxs.includes(i) ? 'correct' : ''}" data-idx="${i}">
                ${isMultiChoice
                  ? `<div class="option-checkbox ${correctIdxs.includes(i) ? 'checked' : ''}" data-idx="${i}"></div>`
                  : `<div class="option-radio ${correctIdxs.includes(i) && correctIdxs.length === 1 ? 'checked' : ''}" data-idx="${i}"></div>`}
              <span class="option-letter">${String.fromCharCode(65 + i)}.</span>
              <input class="option-text-input" type="text" data-idx="${i}"
                value="${escapeAttr(currentOptions[i])}"
                placeholder="选项 ${String.fromCharCode(65 + i)} 的内容">
            </div>
          `).join("");

            // Re-attach option row listeners
            setupOptionRowListeners(isMultiChoice);
          }
        }
      });
    });

    // Initial setup of option row listeners
    setupOptionRowListeners(currentType === "multi_choice");

    // Reveal answer button
    const btnRevealAnswer = document.getElementById("btn-reveal-answer");
    if (btnRevealAnswer) {
      btnRevealAnswer.addEventListener("click", () => {
        btnRevealAnswer.style.display = "none";
        const ta = document.getElementById("r-answer");
        if (ta) ta.style.display = "block";
      });
    }

    // Reveal explanation button
    const btnRevealExplanation = document.getElementById("btn-reveal-explanation");
    if (btnRevealExplanation) {
      btnRevealExplanation.addEventListener("click", () => {
        btnRevealExplanation.style.display = "none";
        const ta = document.getElementById("r-explanation");
        if (ta) ta.style.display = "block";
      });
    }

    // Buttons
    document.getElementById("btn-rerun").addEventListener("click", () => {
      document.getElementById("result-container").innerHTML = "";
      recognizeImage();
    });
    document.getElementById("btn-cancel-add").addEventListener("click", () => {
      if (confirm("放弃当前识别结果？")) {
        document.getElementById("result-container").innerHTML = "";
        state.pendingImage = null;
        const pc = document.getElementById("preview-container");
        if (pc) pc.innerHTML = "";
        showAiStatus("info", "已取消。");
      }
    });
    document.getElementById("btn-confirm-add").addEventListener("click", confirmAddQuestion);
  }

  function confirmAddQuestion() {
    const chapter = document.getElementById("r-chapter").value.trim() || "未分类";
    const question = document.getElementById("r-question").value.trim();
    const explanation = document.getElementById("r-explanation").value.trim();

    if (!question) { alert("请填写题干。"); return; }

    const activePill = document.querySelector("#r-type-pills .type-pill.active");
    const type = activePill ? activePill.getAttribute("data-type") : "calculation";

    const newQ = {
      id: `ai_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      filename: state.pendingImage ? (state.pendingImage.filename || "") : "",
      chapter,
      type,
      question,
      explanation: explanation || "",
      _userAdded: true,
      display_number: `+${state.addedQuestions.length + 1}`
    };

    if (type === "choice" || type === "multi_choice") {
      const options = [0, 1, 2, 3].map(i => {
        const input = document.querySelector(`#r-options-list .option-text-input[data-idx="${i}"]`);
        return input ? input.value.trim() : "";
      });
      if (options.some(o => !o)) {
        alert("选择题必须填写全部 4 个选项。");
        return;
      }
      const correctRows = document.querySelectorAll("#r-options-list .option-row.correct");
      if (correctRows.length === 0) {
        alert(type === "multi_choice" ? "请勾选所有正确答案。" : "请标记一个正确选项。");
        return;
      }
      const correctIdxs = Array.from(correctRows).map(r => parseInt(r.getAttribute("data-idx")));
      newQ.options = options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`);
      if (type === "choice") {
        newQ.correct_answer = correctIdxs[0];
        newQ.correct_answers = correctIdxs;
      } else {
        newQ.correct_answer = correctIdxs[0];
        newQ.correct_answers = correctIdxs;
      }
    } else if (type === "true_false") {
      newQ.options = ["正确", "错误"];
      const correctRows = document.querySelectorAll("#r-options-list .option-row.correct");
      if (correctRows.length === 0) {
        alert("请标记一个正确选项。");
        return;
      }
      const correctIdxs = Array.from(correctRows).map(r => parseInt(r.getAttribute("data-idx")));
      newQ.correct_answer = correctIdxs[0] === 0 || correctIdxs[0] === 1 ? correctIdxs[0] : 0;
      newQ.correct_answers = [newQ.correct_answer];
    } else {
      const ans = document.getElementById("r-answer").value.trim();
      if (!ans) {
        if (confirm("未填写参考答案。确认添加（这道题将无法自评）吗？")) {
          newQ.answer = "";
        } else {
          return;
        }
      } else {
        newQ.answer = ans;
      }
    }

    state.addedQuestions.push(newQ);
    state.questions.push(newQ);
    // Initialize status
    state.questionStatuses[newQ.id] = "unattempted";
    saveStateToStorage();

    // Clear UI state
    state.pendingImage = null;
    document.getElementById("result-container").innerHTML = "";
    document.getElementById("preview-container").innerHTML = "";

    showAiStatus("success", `已添加！题目已出现在「题目复习」列表中。`);
    renderAddedList();
    renderSidebar();
  }

  function renderAddedList() {
    const listEl = document.getElementById("added-list");
    if (!listEl) return;

    if (state.addedQuestions.length === 0) {
      listEl.innerHTML = `<div class="added-list-empty">尚未添加任何题目。识别并确认后会显示在这里。</div>`;
      return;
    }

    listEl.innerHTML = `
      <div class="added-list-header">
        <button class="btn btn-secondary btn-batch-delete" id="btn-batch-delete" style="display: none; height: 32px; font-size: 13px;">批量删除选中</button>
        <span class="added-list-count">共 ${state.addedQuestions.length} 道</span>
      </div>
      ${state.addedQuestions.map((q, idx) => {
        const preview = q.question.length > 60 ? q.question.substring(0, 60) + "…" : q.question;
        const typeLabel = {
          "choice": "单选",
          "multi_choice": "多选",
          "true_false": "判断",
          "fill_blank": "填空",
          "calculation": "计算",
          "drawing": "绘图",
          "program": "程序"
        }[q.type] || "计算";
        return `
          <div class="added-item" data-id="${escapeAttr(q.id)}">
            <input type="checkbox" class="added-item-checkbox" data-id="${escapeAttr(q.id)}">
            <div class="added-item-info">
              <div class="added-item-title">+${idx + 1}. ${escapeHtml(preview)}</div>
              <div class="added-item-meta">${escapeHtml(q.chapter)} · ${typeLabel}</div>
            </div>
            <div class="added-item-actions">
              <button class="added-item-edit" data-id="${escapeAttr(q.id)}">编辑</button>
              <button class="added-item-delete" data-id="${escapeAttr(q.id)}">删除</button>
            </div>
          </div>
        `;
      }).join("")}
    `;

    // Single delete
    listEl.querySelectorAll(".added-item-delete").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        deleteAddedQuestion(id);
      });
    });

    // Edit
    listEl.querySelectorAll(".added-item-edit").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.getAttribute("data-id");
        openEditQuestionModal(id);
      });
    });

    // Checkbox selection
    const checkboxes = listEl.querySelectorAll(".added-item-checkbox");
    const btnBatchDelete = listEl.querySelector("#btn-batch-delete");
    
    const updateBatchButton = () => {
      const checked = listEl.querySelectorAll(".added-item-checkbox:checked");
      btnBatchDelete.style.display = checked.length > 0 ? "block" : "none";
    };

    checkboxes.forEach(cb => {
      cb.addEventListener("change", updateBatchButton);
    });

    // Batch delete
    btnBatchDelete.addEventListener("click", () => {
      const checked = listEl.querySelectorAll(".added-item-checkbox:checked");
      const ids = Array.from(checked).map(cb => cb.getAttribute("data-id"));
      if (confirm(`确定删除选中的 ${ids.length} 道题吗？相关作答记录也会被清除。`)) {
        ids.forEach(id => deleteAddedQuestion(id));
      }
    });
  }

  function deleteAddedQuestion(id) {
    if (!confirm("确定删除这道题吗？相关作答记录也会被清除。")) return;

    state.addedQuestions = state.addedQuestions.filter(q => q.id !== id);
    state.questions = state.questions.filter(q => q.id !== id);
    delete state.userAnswers[id];
    delete state.questionStatuses[id];
    state.wrongBookIds = state.wrongBookIds.filter(wid => wid !== id);

    // Re-index display numbers
    state.addedQuestions.forEach((q, idx) => { q.display_number = `+${idx + 1}`; });

    saveStateToStorage();
    renderAddedList();
    renderSidebar();
    if (state.activeQuestionId === id) {
      const filtered = getFilteredQuestions();
      state.activeQuestionId = filtered.length > 0 ? filtered[0].id : null;
    }
    renderWorkspace();
    showAiStatus("info", "已删除。");
  }

  function openEditQuestionModal(id) {
    const question = state.addedQuestions.find(q => q.id === id);
    if (!question) return;

    const isChoiceType = question.type === "choice" || question.type === "multi_choice" || question.type === "true_false";
    const isMultiChoice = question.type === "multi_choice";
    const chapterOptions = getChapterSuggestions();
    const correctAnswers = question.correct_answers || (question.correct_answer !== undefined ? [question.correct_answer] : []);

    const modalHtml = `
      <div class="edit-modal-overlay" id="edit-modal-overlay">
        <div class="edit-modal">
          <div class="edit-modal-header">
            <h3>编辑题目</h3>
            <button class="btn-close-modal" id="btn-close-modal">&times;</button>
          </div>
          <div class="edit-modal-body">
            <input type="hidden" id="edit-id" value="${escapeAttr(question.id)}">
            
            <div class="form-group">
              <label class="form-label">章节</label>
              <input type="text" class="text-input" id="edit-chapter" list="edit-chapter-list"
                value="${escapeAttr(question.chapter)}" placeholder="例如：第3章 栈和队列">
              <datalist id="edit-chapter-list">
                ${chapterOptions.map(c => `<option value="${escapeAttr(c)}">`).join("")}
              </datalist>
            </div>

            <div class="form-group">
              <label class="form-label">题型</label>
              <div class="type-pills" id="edit-type-pills">
                <button class="type-pill ${question.type === 'choice' ? 'active' : ''}" data-type="choice">单选题</button>
                <button class="type-pill ${question.type === 'multi_choice' ? 'active' : ''}" data-type="multi_choice">多选题</button>
                <button class="type-pill ${question.type === 'true_false' ? 'active' : ''}" data-type="true_false">判断题</button>
                <button class="type-pill ${question.type === 'fill_blank' ? 'active' : ''}" data-type="fill_blank">填空题</button>
                <button class="type-pill ${question.type === 'calculation' ? 'active' : ''}" data-type="calculation">计算题</button>
                <button class="type-pill ${question.type === 'drawing' ? 'active' : ''}" data-type="drawing">绘图题</button>
                <button class="type-pill ${question.type === 'program' ? 'active' : ''}" data-type="program">程序题</button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">题干 <span style="color: var(--error);">*</span></label>
              <textarea class="textarea-input" id="edit-question" rows="4">${escapeHtml(question.question)}</textarea>
            </div>

            <div class="form-group" id="edit-options-group" style="display: ${isChoiceType ? 'block' : 'none'};">
              <label class="form-label">选项</label>
              <div class="options-edit-list" id="edit-options-list">
                ${question.type === "true_false"
                  ? [0, 1].map(i => `
                      <div class="option-row ${correctAnswers.includes(i) ? 'correct' : ''}" data-idx="${i}">
                        <div class="option-radio ${i === question.correct_answer ? 'checked' : ''}" data-idx="${i}"></div>
                        <span class="option-letter">${i === 0 ? '正确' : '错误'}</span>
                        <input class="option-text-input" type="text" data-idx="${i}"
                          value="${escapeAttr((question.options && question.options[i]) || (i === 0 ? '正确' : '错误'))}"
                          readonly style="background: var(--surface-soft); color: var(--muted);">
                      </div>
                    `).join("")
                  : [0, 1, 2, 3].map(i => `
                      <div class="option-row ${correctAnswers.includes(i) ? 'correct' : ''}" data-idx="${i}">
                        ${isMultiChoice
                          ? `<div class="option-checkbox ${correctAnswers.includes(i) ? 'checked' : ''}" data-idx="${i}"></div>`
                          : `<div class="option-radio ${i === question.correct_answer ? 'checked' : ''}" data-idx="${i}"></div>`}
                        <span class="option-letter">${String.fromCharCode(65 + i)}.</span>
                        <input class="option-text-input" type="text" data-idx="${i}"
                          value="${escapeAttr((question.options && question.options[i]) ? question.options[i].replace(/^[A-D]\.\s*/, '') : '')}"
                          placeholder="选项 ${String.fromCharCode(65 + i)} 的内容">
                      </div>
                    `).join("")}
              </div>
            </div>

            <div class="form-group" id="edit-answer-group" style="display: ${!isChoiceType ? 'block' : 'none'};">
              <label class="form-label">参考答案</label>
              <textarea class="textarea-input mono" id="edit-answer" rows="3">${escapeHtml(question.answer || "")}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">学术解析</label>
              <textarea class="textarea-input" id="edit-explanation" rows="5">${escapeHtml(question.explanation || "")}</textarea>
            </div>
          </div>
          <div class="edit-modal-footer">
            <button class="btn btn-secondary" id="btn-cancel-edit">取消</button>
            <button class="btn btn-primary" id="btn-save-edit">保存修改</button>
          </div>
        </div>
      </div>
    `;

    const modalContainer = document.createElement("div");
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);

    // Close modal
    const closeModal = () => {
      const overlay = document.getElementById("edit-modal-overlay");
      if (overlay) overlay.remove();
    };

    document.getElementById("btn-close-modal").addEventListener("click", closeModal);
    document.getElementById("btn-cancel-edit").addEventListener("click", closeModal);
    document.getElementById("edit-modal-overlay").addEventListener("click", (e) => {
      if (e.target.id === "edit-modal-overlay") closeModal();
    });

    // Type switching
    const typePills = document.getElementById("edit-type-pills");
    typePills.addEventListener("click", (e) => {
      const pill = e.target.closest(".type-pill");
      if (!pill) return;
      
      const newType = pill.getAttribute("data-type");
      typePills.querySelectorAll(".type-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      const optionsGroup = document.getElementById("edit-options-group");
      const answerGroup = document.getElementById("edit-answer-group");
      const optionsList = document.getElementById("edit-options-list");

      if (newType === "choice" || newType === "multi_choice" || newType === "true_false") {
        optionsGroup.style.display = "block";
        answerGroup.style.display = "none";
        // Re-render options to match type
        const isMulti = newType === "multi_choice";
        const isTrueFalse = newType === "true_false";
        
        if (isTrueFalse) {
          optionsList.innerHTML = [0, 1].map(i => `
            <div class="option-row" data-idx="${i}">
              <div class="option-radio" data-idx="${i}"></div>
              <span class="option-letter">${i === 0 ? '正确' : '错误'}</span>
              <input class="option-text-input" type="text" data-idx="${i}"
                value="${escapeAttr(i === 0 ? '正确' : '错误')}"
                readonly style="background: var(--surface-soft); color: var(--muted);">
            </div>
          `).join("");
          setupEditOptionListeners(false);
        } else {
          optionsList.innerHTML = [0, 1, 2, 3].map(i => `
            <div class="option-row" data-idx="${i}">
              ${isMulti ? `<div class="option-checkbox" data-idx="${i}"></div>` : `<div class="option-radio" data-idx="${i}"></div>`}
              <span class="option-letter">${String.fromCharCode(65 + i)}.</span>
              <input class="option-text-input" type="text" data-idx="${i}"
                value="${escapeAttr((question.options && question.options[i]) ? question.options[i].replace(/^[A-D]\.\s*/, '') : '')}"
                placeholder="选项 ${String.fromCharCode(65 + i)} 的内容">
            </div>
          `).join("");
          setupEditOptionListeners(isMulti);
        }
      } else {
        optionsGroup.style.display = "none";
        answerGroup.style.display = "block";
      }
    });

    // Option selection
    setupEditOptionListeners(isMultiChoice);

    // Save
    document.getElementById("btn-save-edit").addEventListener("click", () => {
      const id = document.getElementById("edit-id").value;
      const chapter = document.getElementById("edit-chapter").value.trim() || "未分类";
      const questionText = document.getElementById("edit-question").value.trim();
      const explanation = document.getElementById("edit-explanation").value.trim();
      const activePill = document.querySelector("#edit-type-pills .type-pill.active");
      const type = activePill ? activePill.getAttribute("data-type") : "calculation";

      if (!questionText) {
        alert("请填写题干。");
        return;
      }

      const updatedQ = {
        ...question,
        chapter,
        type,
        question: questionText,
        explanation: explanation || ""
      };

      if (type === "choice" || type === "multi_choice" || type === "true_false") {
        const optionsList = document.getElementById("edit-options-list");
        const correctRows = optionsList.querySelectorAll(".option-row.correct");
        if (correctRows.length === 0) {
          alert(type === "multi_choice" ? "请勾选所有正确答案。" : "请标记一个正确选项。");
          return;
        }
        const correctIdxs = Array.from(correctRows).map(r => parseInt(r.getAttribute("data-idx")));
        
        if (type === "true_false") {
          updatedQ.options = ["正确", "错误"];
        } else {
          const options = [0, 1, 2, 3].map(i => {
            const input = optionsList.querySelector(`.option-text-input[data-idx="${i}"]`);
            return input ? input.value.trim() : "";
          });
          if (options.some(o => !o)) {
            alert("选择题必须填写全部 4 个选项。");
            return;
          }
          updatedQ.options = options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`);
        }
        
        updatedQ.correct_answer = correctIdxs[0];
        updatedQ.correct_answers = correctIdxs;
      } else {
        updatedQ.answer = document.getElementById("edit-answer").value.trim();
      }

      // Update in arrays
      const idxAdded = state.addedQuestions.findIndex(q => q.id === id);
      if (idxAdded !== -1) state.addedQuestions[idxAdded] = updatedQ;
      
      const idxQuestions = state.questions.findIndex(q => q.id === id);
      if (idxQuestions !== -1) state.questions[idxQuestions] = updatedQ;

      saveStateToStorage();
      closeModal();
      renderAddedList();
      renderSidebar();
      if (state.activeQuestionId === id) {
        renderWorkspace();
      }
      showAiStatus("success", "修改已保存！");
    });
  }

  function setupEditOptionListeners(isMultiChoice) {
    const optionsList = document.getElementById("edit-options-list");
    if (!optionsList) return;
    const optionRows = optionsList.querySelectorAll(".option-row");
    
    optionRows.forEach(row => {
      row.addEventListener("click", (e) => {
        if (e.target.tagName === "INPUT") return;
        const idx = parseInt(row.getAttribute("data-idx"));

        if (isMultiChoice) {
          const isCorrect = row.classList.contains("correct");
          if (isCorrect) {
            row.classList.remove("correct");
            const checkbox = row.querySelector(".option-checkbox");
            if (checkbox) checkbox.classList.remove("checked");
          } else {
            row.classList.add("correct");
            const checkbox = row.querySelector(".option-checkbox");
            if (checkbox) checkbox.classList.add("checked");
          }
        } else {
          optionsList.querySelectorAll(".option-row").forEach(r => r.classList.remove("correct"));
          optionsList.querySelectorAll(".option-radio").forEach(r => r.classList.remove("checked"));
          row.classList.add("correct");
          const radio = row.querySelector(".option-radio");
          if (radio) radio.classList.add("checked");
        }
      });
    });
  }

  function getChapterSuggestions() {
    const set = new Set();
    state.questions.forEach(q => {
      if (q.chapter) set.add(q.chapter);
    });
    return Array.from(set).sort();
  }

  function showAiStatus(kind, msg) {
    const el = document.getElementById("ai-add-status");
    if (!el) return;
    el.className = `status-message ${kind}`;
    el.innerHTML = msg;
    el.style.display = "flex";
  }

  // --- Utility: HTML escape ---
  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function escapeAttr(s) { return escapeHtml(s); }

  // --- Run ---
  init();
});
