(function () {
  let panelState = {
    isOpen: false,
    questions: [],
    totalCount: 0,
    answeredCount: 0,
    autoAnswering: false,
    currentTab: 'answer', // answer, chat, settings
    failedQuestionIds: new Set(),
    partialQuestionIds: new Set(),
    selfDecisionQuestionIds: new Set(),
    collapsedTypeGroups: new Set(),
    countdownActive: false,
    countdownOffered: false,
    autoStartCancelled: false,
    countdownTimer: null,
    selectedPreviewQuestionId: null,
    isExamPage: false,
    fullPreviewPromptOffered: false,
    previewPromptActive: false,
    previewPromptTimer: null,
    timeoutWaitPromptActive: false,
    timeoutWaitPromptTimer: null,
    singleQuestionAnswering: false,
  };

  function isOnStudyPlatform() {
    const host = window.location.host;
    const protocol = window.location.protocol;
    if (protocol === 'file:') {
      console.log('[AutoDo] isOnStudyPlatform: 本地文件测试页');
      return true;
    }
    const result = /chaoxing\.com|xueyinonline\.com|fanya\.|polymas\.com|zhihuishu\.com|^localhost$|^127\.0\.0\.1$/.test(host);
    console.log('[AutoDo] isOnStudyPlatform:', { host, result });
    return result;
  }

  function isOnZhidaoPlatform() {
    if (!isOnStudyPlatform()) return false;
    const host = window.location.host;
    if (/polymas\.com|zhihuishu\.com/.test(host)) return true;
    if (window.location.protocol === 'file:') {
      return /\/zhidao\//i.test(decodeURIComponent(window.location.pathname || ''));
    }
    return false;
  }

  function isOnChaoxingPlatform() {
    if (!isOnStudyPlatform()) return false;
    if (isOnZhidaoPlatform()) return false;
    const host = window.location.host;
    if (/chaoxing\.com|xueyinonline\.com|fanya\./.test(host)) return true;
    if (window.location.protocol === 'file:') {
      return !/\/zhidao\//i.test(decodeURIComponent(window.location.pathname || ''));
    }
    return false;
  }

  function hasZhidaoQuestionSurface() {
    return !!document.querySelector(
      '.answer-homework-page-wrap .question-item, .answer-homework-page-wrap .base-question-component, #agent__course__exam .question-item, #agent__course__exam .base-question-component'
    );
  }

  function normalizeAriaLabel(value) {
    return String(value || '').replace(/\s+/g, '');
  }

  /** 学习通考试页：subNav 等带 aria-label="考试 页面" */
  function isExamPage(root) {
    if (isOnZhidaoPlatform()) return false;
    const scope = root || document;
    if (scope.querySelector('[aria-label="考试 页面"]')) {
      return true;
    }
    const subNav = scope.querySelector('.subNav.top-subNav[aria-label], .top-subNav[aria-label]');
    if (subNav) {
      const label = normalizeAriaLabel(subNav.getAttribute('aria-label'));
      if (label === '考试页面' || label.includes('考试')) {
        return true;
      }
    }
    const marked = scope.querySelectorAll('[aria-label*="考试"]');
    for (const el of marked) {
      const label = normalizeAriaLabel(el.getAttribute('aria-label'));
      if (label === '考试页面' || label.endsWith('考试页面')) {
        return true;
      }
    }
    return false;
  }

  function isExamQuestionSurfaceReady() {
    return isExamPage() && (document.querySelector('.TiMu') || document.querySelector('.questionLi'));
  }

  function getPageKindLabel() {
    if (!isOnStudyPlatform()) return '未检测到平台';
    if (isOnZhidaoPlatform()) {
      if (document.querySelector('.answer-homework-page-wrap')) return '知到 · 作业';
      return '知到';
    }
    if (isExamPage()) return '学习通 · 考试';
    return '学习通';
  }

  function updatePageKindSubtitle() {
    const sub = document.querySelector('#autoDo-panel .title-sub');
    if (sub) {
      sub.textContent = '当前平台：' + getPageKindLabel();
    }
  }

  function isInFullPaperPreviewMode() {
    const path = window.location.pathname || '';
    if (/\/exam\/preview/i.test(path)) {
      return true;
    }
    if (document.body && document.body.classList.contains('exam-preview')) {
      return true;
    }
    return false;
  }

  function findFullPaperPreviewButton() {
    const containers = document.querySelectorAll('.sub-button.fr');
    for (const box of containers) {
      const links = box.querySelectorAll('a');
      for (const link of links) {
        const text = (link.textContent || '').replace(/\s+/g, '');
        if (text.includes('整卷预览')) {
          return link;
        }
      }
    }
    const byOnclick = document.querySelector('a.completeBtn[onclick*="topreview"], a[onclick*="topreview()"]');
    if (byOnclick && (byOnclick.textContent || '').includes('整卷预览')) {
      return byOnclick;
    }
    return null;
  }

  function isFullPaperPreviewButtonVisible(btn) {
    if (!btn || !btn.isConnected) return false;
    const rect = btn.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    const style = window.getComputedStyle(btn);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  function shouldOfferFullPaperPreviewPrompt() {
    if (panelState.fullPreviewPromptOffered) return false;
    if (!panelState.isExamPage && !isExamPage()) return false;
    if (isInFullPaperPreviewMode()) return false;
    const btn = findFullPaperPreviewButton();
    return isFullPaperPreviewButtonVisible(btn);
  }

  function clickFullPaperPreviewButton(btn) {
    if (!btn) return false;
    try {
      btn.click();
      console.log('[AutoDo] 已点击整卷预览');
      return true;
    } catch (err) {
      console.warn('[AutoDo] 点击整卷预览失败:', err);
      return false;
    }
  }

  function getIconPath(name) {
    return chrome.runtime.getURL('icons/' + name);
  }

  function getBottomIconPath(name) {
    return chrome.runtime.getURL('icons/bottom/' + name);
  }

  function ensurePreviewSection() {
    const tabAnswer = document.getElementById('tab-answer');
    if (!tabAnswer || document.getElementById('autoDo-questionPreview')) {
      return;
    }

    const questionSection = tabAnswer.querySelector('.question-section');
    if (!questionSection) {
      console.warn('[AutoDo] ensurePreviewSection: 未找到题目列表区域');
      return;
    }

    const previewSection = document.createElement('div');
    previewSection.className = 'question-preview-section';
    previewSection.innerHTML =
      '<div class="section-header">' +
      '<span class="section-title">题目预览</span>' +
      '<button class="preview-reanswer-btn" id="autoDo-reanswerBtn" type="button" style="display:none;">重新作答</button>' +
      '</div>' +
      '<div id="autoDo-questionPreview" class="question-preview-card">' +
      '<div class="preview-placeholder">点击题目列表中的题号查看预览</div>' +
      '</div>';
    tabAnswer.insertBefore(previewSection, questionSection);
    console.log('[AutoDo] ensurePreviewSection: 已注入题目预览区域');
    initQuestionPreviewDelegation();

    if (panelState.questions.length) {
      const selected =
        (panelState.selectedPreviewQuestionId &&
          panelState.questions.find((q) => q.id === panelState.selectedPreviewQuestionId)) ||
        panelState.questions[0];
      if (selected) {
        selectPreviewQuestion(selected, false);
      }
    }
  }

  function createFloatingPanel() {
    if (document.getElementById('autoDo-panel')) {
      console.log('[AutoDo] createFloatingPanel: 面板已存在，检查题目预览');
      ensurePreviewSection();
      return;
    }
    console.log('[AutoDo] createFloatingPanel: 开始创建浮动面板');

    const panel = document.createElement('div');
    panel.id = 'autoDo-panel';
    panel.className = 'open';

    panel.innerHTML = `
      <div id="autoDo-main">
        <!-- 顶部标题栏 -->
        <div id="autoDo-header">
          <div class="header-left">
            <img src="${getIconPath('WorkDo.svg')}" class="header-logo" alt="Logo">
            <div class="header-title">
              <div class="title-main">自动答题</div>
              <div class="title-sub">当前平台：${getPageKindLabel()}</div>
            </div>
          </div>
          <div class="header-right">
            <button id="autoDo-minimize" class="icon-btn" title="最小化" type="button">
              <img src="${getIconPath('zuixiao.svg')}" alt="最小化">
            </button>
            <button id="autoDo-headerStop" class="icon-btn" title="开始自动答题" type="button">
              <img id="autoDo-headerActionIcon" src="${getIconPath('jixu.svg')}" alt="开始自动答题">
            </button>
          </div>
        </div>
        
        <!-- 内容区域 -->
        <div id="autoDo-body">
          <!-- 作答页面 -->
          <div id="tab-answer" class="tab-content active">
            <div class="stats-row">
              <div class="stat-item">
                <div class="stat-label">正在作答</div>
                <div class="stat-value" id="autoDo-questionStatus">0 / 0</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">总题目</div>
                <div class="stat-value" id="autoDo-total">-</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">已做完</div>
                <div class="stat-value" id="autoDo-answered">-</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">进度</div>
                <div class="stat-value" id="autoDo-progress">-</div>
              </div>
            </div>

            <div class="question-preview-section">
              <div class="section-header">
                <span class="section-title">题目预览</span>
                <button class="preview-reanswer-btn" id="autoDo-reanswerBtn" type="button" style="display:none;">作答</button>
              </div>
              <div id="autoDo-questionPreview" class="question-preview-card">
                <div class="preview-placeholder">点击题目列表中的题号查看预览</div>
              </div>
            </div>
            
            <div class="question-section">
              <div class="section-header">
                <span class="section-title">题目列表</span>
              </div>
              <div id="autoDo-questionByType"></div>
            </div>
            
            <div class="action-buttons autoDo-action-bar">
              <button class="action-btn primary" id="autoDo-startBtn" type="button">
                <img src="${getIconPath('jixu.svg')}" alt="">
                开始答题
              </button>
              <button class="action-btn secondary" id="autoDo-stopBtn" type="button" style="display:none;">
                <img src="${getIconPath('stop.svg')}" alt="">
                停止答题
              </button>
              <button class="action-btn outline" id="autoDo-refresh" type="button">刷新</button>
            </div>
          </div>
          
          <!-- AI聊天页面 -->
          <div id="tab-page-limit" class="tab-content">
            <div class="settings-page">
              <section class="settings-card">
                <h3 class="settings-card-title">页面保护</h3>
                <p class="page-limit-hint">默认根据当前页面检测到的限制自动开启对应保护，您可手动关闭。仅处理以下五项浏览器限制，不涉及其它监考功能。</p>
                <div class="settings-row settings-row--toggle page-limit-row">
                  <span class="settings-row-label">允许复制粘贴文本</span>
                  <label class="toggle-switch">
                    <input type="checkbox" id="page-limit-copypaste">
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="settings-row settings-row--toggle page-limit-row">
                  <span class="settings-row-label">允许监听鼠标是否离开页面</span>
                  <label class="toggle-switch">
                    <input type="checkbox" id="page-limit-mouseleave">
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="settings-row settings-row--toggle page-limit-row">
                  <span class="settings-row-label">允许选中文本</span>
                  <label class="toggle-switch">
                    <input type="checkbox" id="page-limit-select">
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="settings-row settings-row--toggle page-limit-row">
                  <span class="settings-row-label">允许下载附件</span>
                  <label class="toggle-switch">
                    <input type="checkbox" id="page-limit-download">
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="settings-row settings-row--toggle page-limit-row">
                  <span class="settings-row-label">允许使用调试工具（F12）</span>
                  <label class="toggle-switch">
                    <input type="checkbox" id="page-limit-devtools">
                    <span class="slider"></span>
                  </label>
                </div>
              </section>
            </div>
          </div>

          
          <!-- 设置页面 -->
          <div id="tab-settings" class="tab-content">
            <div class="settings-page">
              <section class="settings-card">
                <h3 class="settings-card-title">作答设置</h3>
                <div class="settings-row">
                  <span class="settings-row-label">答题速度</span>
                  <select id="setting-speed" class="settings-select">
                    <option value="fast">快速</option>
                    <option value="normal" selected>正常</option>
                    <option value="slow">慢速</option>
                  </select>
                </div>
                <div class="settings-row">
                  <span class="settings-row-label">题目过滤</span>
                  <select id="setting-filter" class="settings-select">
                    <option value="none" selected>不使用</option>
                    <option value="all">全部题型</option>
                    <option value="single">仅单选题</option>
                    <option value="multi">仅多选题</option>
                    <option value="judge">仅判断题</option>
                    <option value="fill">仅填空题</option>
                  </select>
                </div>
                <div class="settings-row settings-row--toggle">
                  <div class="settings-row-label-block">
                    <span class="settings-row-label">作答跟随</span>
                    <span class="settings-row-desc">启用后自动滚动到当前作答的题目</span>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" id="setting-answerFollow">
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="settings-row settings-row--toggle">
                  <span class="settings-row-label">跳过已回答的题目</span>
                  <label class="toggle-switch">
                    <input type="checkbox" id="setting-skipAnswered">
                    <span class="slider"></span>
                  </label>
                </div>
              </section>

              <section class="settings-card">
                <div class="settings-card-head">
                  <h3 class="settings-card-title">作答模型</h3>
                  <div class="settings-card-actions settings-card-actions--icons">
                    <button type="button" class="settings-icon-btn" id="autoDo-editModelBtn" title="编辑">
                      <img src="${getBottomIconPath('edit.svg')}" alt="">
                    </button>
                    <button type="button" class="settings-icon-btn" id="autoDo-deleteModelBtn" title="删除">
                      <img src="${getBottomIconPath('delete.svg')}" alt="">
                    </button>
                    <button type="button" class="settings-icon-btn" id="autoDo-testModelBtn" title="测试">
                      <img src="${getBottomIconPath('ceshi.svg')}" alt="">
                    </button>
                    <button type="button" class="settings-icon-btn" id="autoDo-addModelBtn" title="添加">
                      <img src="${getBottomIconPath('add.svg')}" alt="">
                    </button>
                  </div>
                </div>
                <div id="autoDo-modelList" class="model-list"></div>
              </section>

              <section class="settings-card">
                <h3 class="settings-card-title">多模型决策</h3>
                <p class="settings-section-hint">多模型决策允许多个 AI 同时回答同一题，按各 AI 权重选出最终答案。</p>
                <p class="settings-section-hint settings-section-hint--sub">多个 AI 决策会导致解题时间变长。</p>
                <div class="settings-row settings-row--toggle">
                  <span class="settings-row-label">启用多模型决策</span>
                  <label class="toggle-switch">
                    <input type="checkbox" id="setting-multiModel">
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="settings-form-hint settings-form-hint--tight">需要至少启用 2 个模型才能使用多模型决策</div>
                <div class="settings-card-head settings-card-head--sub">
                  <span class="settings-subtitle">规则</span>
                  <div class="settings-card-actions settings-card-actions--icons">
                    <button type="button" class="settings-icon-btn" id="autoDo-editRuleBtn" title="编辑">
                      <img src="${getBottomIconPath('edit.svg')}" alt="">
                    </button>
                    <button type="button" class="settings-icon-btn" id="autoDo-deleteRuleBtn" title="删除">
                      <img src="${getBottomIconPath('delete.svg')}" alt="">
                    </button>
                    <button type="button" class="settings-icon-btn" id="autoDo-addRuleBtn" title="添加">
                      <img src="${getBottomIconPath('add.svg')}" alt="">
                    </button>
                  </div>
                </div>
                <div id="autoDo-ruleList" class="rule-list"></div>
              </section>
            </div>
          </div>
        </div>

        <div id="autoDo-modelModal" class="autoDo-modal" aria-hidden="true">
          <div class="autoDo-modal__backdrop" data-close-modal></div>
          <div class="autoDo-modal__panel settings-modal" role="dialog" aria-labelledby="autoDo-modelModalTitle">
            <div class="settings-modal-header">
              <h4 id="autoDo-modelModalTitle" class="settings-modal-title">添加模型</h4>
              <div class="settings-modal-tabs" role="tablist">
                <button type="button" class="settings-modal-tab active" data-model-tab="quick" role="tab">快速配置</button>
                <button type="button" class="settings-modal-tab" data-model-tab="custom" role="tab">自定义配置</button>
              </div>
            </div>

            <!-- 快速配置 -->
            <div id="model-panel-quick" class="model-config-panel settings-modal-body" role="tabpanel">
              <div class="settings-form-row settings-form-row--stack">
                <label class="settings-form-label" for="quick-provider">服务商</label>
                <select id="quick-provider" class="settings-select settings-select--full"></select>
              </div>
              <div class="settings-form-row settings-form-row--stack">
                <label class="settings-form-label" for="quick-model">模型</label>
                <select id="quick-model" class="settings-select settings-select--full"></select>
              </div>
              <div class="settings-form-row settings-form-row--stack">
                <label class="settings-form-label">API 地址</label>
                <input type="text" id="quick-baseurl" class="settings-input settings-input--full" readonly>
                <span class="settings-form-hint" id="quick-doc-hint"></span>
              </div>
              <div class="settings-form-row settings-form-row--stack">
                <label class="settings-form-label" for="quick-apikey">API Key</label>
                <input type="password" id="quick-apikey" class="settings-input settings-input--full" placeholder="sk-..." autocomplete="new-password">
                <span class="settings-form-hint" id="quick-apikey-hint"></span>
              </div>
            </div>

            <!-- 自定义配置 -->
            <div id="model-panel-custom" class="model-config-panel settings-modal-body" role="tabpanel" hidden>
              <div class="settings-form-row settings-form-row--stack">
                <label class="settings-form-label" for="custom-api-format">API 格式 <span class="settings-required">*</span></label>
                <select id="custom-api-format" class="settings-select settings-select--full">
                  <option value="openai_chat">OpenAI Chat Completions 格式</option>
                </select>
              </div>
              <div class="settings-form-row settings-form-row--stack">
                <div class="settings-form-label-row">
                  <label class="settings-form-label" for="custom-baseurl">自定义请求地址 <span class="settings-required">*</span></label>
                  <label class="settings-inline-toggle">
                    <span>完整 URL</span>
                    <input type="checkbox" id="custom-full-url">
                    <span class="settings-inline-toggle-ui"></span>
                  </label>
                </div>
                <input type="text" id="custom-baseurl" class="settings-input settings-input--full" placeholder="e.g. https://api.openai.com/v1">
                <div class="settings-info-box" id="custom-url-tip">
                  请填写兼容 OpenAI API 的服务端点地址，不要以斜杠结尾。/chat/completions 将会补充到你填写的地址末尾。
                </div>
              </div>
              <div class="settings-form-row settings-form-row--stack">
                <label class="settings-form-label" for="custom-model-id">模型 ID <span class="settings-required">*</span></label>
                <input type="text" id="custom-model-id" class="settings-input settings-input--full" placeholder="输入模型 ID">
              </div>
              <div class="settings-form-row settings-form-row--stack">
                <label class="settings-form-label" for="custom-apikey">API 密钥 <span class="settings-required">*</span></label>
                <input type="password" id="custom-apikey" class="settings-input settings-input--full" placeholder="输入 API 密钥" autocomplete="new-password">
              </div>
              <div class="settings-form-row settings-form-row--stack">
                <label class="settings-form-label" for="custom-provider-name">显示名称</label>
                <input type="text" id="custom-provider-name" class="settings-input settings-input--full" placeholder="可选，用于列表展示">
              </div>
              <button type="button" class="settings-advanced-toggle" id="custom-advanced-toggle" aria-expanded="false">
                <img src="${getIconPath('more.svg')}" class="settings-advanced-chevron" alt="">
                <span>高级配置</span>
              </button>
              <div id="custom-advanced-panel" class="settings-advanced-panel" hidden>
                <div class="settings-form-row settings-form-row--stack">
                  <label class="settings-form-label" for="custom-timeout">请求超时 (秒)</label>
                  <input type="number" id="custom-timeout" class="settings-input settings-input--full" min="5" max="300" value="60">
                </div>
              </div>
            </div>

            <div class="settings-modal-shared">
              <div class="settings-form-row settings-form-row--toggle">
                <div class="settings-form-label-block">
                  <span class="settings-form-label">默认模型</span>
                  <span class="settings-form-hint">默认使用此模型来回答问题</span>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" id="model-input-default">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
            <div class="settings-modal-footer">
              <button type="button" class="settings-modal-btn settings-modal-btn--text" id="autoDo-modelModalCancel">取消添加</button>
              <button type="button" class="settings-modal-btn settings-modal-btn--primary" id="autoDo-modelModalSubmit">添加模型</button>
            </div>
          </div>
        </div>

        <div id="autoDo-ruleModal" class="autoDo-modal" aria-hidden="true">
          <div class="autoDo-modal__backdrop" data-close-rule-modal></div>
          <div class="autoDo-modal__panel settings-modal settings-modal--rule" role="dialog" aria-labelledby="autoDo-ruleModalTitle">
            <div class="settings-modal-header settings-modal-header--simple">
              <h4 id="autoDo-ruleModalTitle" class="settings-modal-title">配置规则</h4>
            </div>
            <div class="settings-modal-body">
              <div class="settings-form-row settings-form-row--inline">
                <label class="settings-form-label" for="rule-input-name">规则名</label>
                <input type="text" id="rule-input-name" class="settings-input" placeholder="规则名称" autocomplete="off">
              </div>
              <div class="settings-form-row settings-form-row--inline">
                <label class="settings-form-label" for="rule-input-scope">使用范围</label>
                <select id="rule-input-scope" class="settings-select">
                  <option value="choice">仅选项题目</option>
                  <option value="all">全部题型</option>
                  <option value="single">仅单选题</option>
                  <option value="multi">仅多选题</option>
                  <option value="judge">仅判断题</option>
                  <option value="fill">仅填空题</option>
                </select>
              </div>
              <div class="settings-form-row settings-form-row--inline">
                <label class="settings-form-label" for="rule-input-mode">规则模式</label>
                <select id="rule-input-mode" class="settings-select">
                  <option value="weight">权重</option>
                  <option value="priority">优先级</option>
                </select>
              </div>
              <div id="rule-weightSection" class="rule-model-section">
                <div class="rule-model-table-head">
                  <span>当前模型</span>
                  <span>权重大小</span>
                </div>
                <div id="rule-weightModelList" class="rule-model-list"></div>
              </div>
              <div id="rule-prioritySection" class="rule-model-section" hidden>
                <div class="rule-model-table-head rule-model-table-head--priority">
                  <span>当前模型</span>
                </div>
                <div id="rule-priorityModelList" class="rule-model-list"></div>
              </div>
            </div>
            <div class="settings-modal-footer">
              <button type="button" class="settings-modal-btn settings-modal-btn--text" id="autoDo-ruleModalCancel">取消更改</button>
              <button type="button" class="settings-modal-btn settings-modal-btn--primary" id="autoDo-ruleModalSubmit">完成规则</button>
            </div>
          </div>
        </div>
        
        <!-- 底部导航栏 -->
        <div id="autoDo-nav-wrap">
          <div id="autoDo-nav">
            <button class="nav-item active" data-tab="answer" type="button" title="作答">
              <img src="${getIconPath('WorkDo.svg')}" class="nav-icon" alt="作答">
            </button>
            <button class="nav-item" data-tab="page-limit" type="button" title="页面限制保护">
              <img src="${getIconPath('pageLimit.svg')}" class="nav-icon" alt="页面限制保护">
            </button>
            <button class="nav-item" data-tab="settings" type="button" title="设置">
              <img src="${getIconPath('setting.svg')}" class="nav-icon" alt="设置">
            </button>
          </div>
        </div>
      </div>
      <button id="autoDo-toggle" type="button" title="拖动移动，点击展开">
        <img src="${getIconPath('WorkDo.svg')}" alt="自动答题">
      </button>
    `;

    document.body.appendChild(panel);
    loadPanelPosition(panel);
    bindPanelEvents();
    syncFloatingEnabledFromStorage();
    console.log('[AutoDo] createFloatingPanel: 面板创建完成');
  }

  function setFloatingEnabled(enabled) {
    const panel = document.getElementById('autoDo-panel');
    if (!panel) return;
    panel.classList.toggle('is-disabled', !enabled);
    if (!enabled) {
      panel.classList.remove('open');
    }
  }

  function syncFloatingEnabledFromStorage() {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
    chrome.storage.local.get(['enabled'], (result) => {
      setFloatingEnabled(result.enabled !== false);
    });
  }

  function loadPanelPosition(panel) {
    try {
      const raw = localStorage.getItem('autoDo-panel-pos');
      if (!raw) return;
      const pos = JSON.parse(raw);
      if (pos.left != null && pos.top != null) {
        panel.style.position = 'fixed';
        panel.style.left = pos.left;
        panel.style.top = pos.top;
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
      }
    } catch (_) {}
  }

  function savePanelPosition(panel) {
    try {
      localStorage.setItem(
        'autoDo-panel-pos',
        JSON.stringify({ left: panel.style.left, top: panel.style.top })
      );
    } catch (_) {}
  }

  function makeToggleDraggable(panel, toggleBtn) {
    const DRAG_THRESHOLD = 6;
    let didDrag = false;

    toggleBtn.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      didDrag = false;
      const rect = panel.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const origX = rect.left;
      const origY = rect.top;

      panel.style.position = 'fixed';
      panel.style.left = origX + 'px';
      panel.style.top = origY + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      toggleBtn.classList.add('dragging');

      const onMouseMove = (ev) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
          didDrag = true;
        }
        panel.style.left = origX + dx + 'px';
        panel.style.top = origY + dy + 'px';
      };

      const onMouseUp = () => {
        toggleBtn.classList.remove('dragging');
        document.removeEventListener('mousemove', onMouseMove, true);
        document.removeEventListener('mouseup', onMouseUp, true);
        if (didDrag) {
          savePanelPosition(panel);
        }
      };

      document.addEventListener('mousemove', onMouseMove, true);
      document.addEventListener('mouseup', onMouseUp, true);
    });

    toggleBtn.addEventListener('click', (e) => {
      if (didDrag) {
        e.preventDefault();
        didDrag = false;
        return;
      }
      const isNowOpen = !panel.classList.contains('open');
      panel.classList.toggle('open');
      console.log('[AutoDo] 切换面板:', isNowOpen ? '展开' : '收起');
    });
  }

  function isolatePanelEvents(panel) {
    if (!panel || panel.dataset.eventsIsolated === 'true') return;
    panel.dataset.eventsIsolated = 'true';

    // Exam pages often attach expensive global listeners for clicks, key input,
    // paste, focus, and pointer movement. Keep panel interactions inside AutoDo.
    [
      'click',
      'dblclick',
      'mousedown',
      'mouseup',
      'pointerdown',
      'pointerup',
      'touchstart',
      'touchend',
      'keydown',
      'keyup',
      'keypress',
      'input',
      'beforeinput',
      'change',
      'paste',
      'compositionstart',
      'compositionupdate',
      'compositionend',
      'focusin',
      'focusout',
    ].forEach((eventName) => {
      panel.addEventListener(eventName, (e) => e.stopPropagation());
    });

    panel.addEventListener('dragstart', (e) => {
      if (e.target && e.target.closest && e.target.closest('img, svg')) {
        e.preventDefault();
      }
      e.stopPropagation();
    });
  }

  function bindPanelEvents() {
    const panel = document.getElementById('autoDo-panel');
    console.log('[AutoDo] bindPanelEvents: 开始绑定事件');

    isolatePanelEvents(panel);
    makeToggleDraggable(panel, document.getElementById('autoDo-toggle'));

    document.getElementById('autoDo-refresh').addEventListener('click', () => {
      console.log('[AutoDo] 点击刷新按钮');
      scanQuestions();
      showToast('已重新扫描题目', { type: 'info' });
    });

    document.getElementById('autoDo-startBtn').addEventListener('click', () => {
      console.log('[AutoDo] 点击开始答题按钮');
      startAutoAnswer();
    });

    document.getElementById('autoDo-stopBtn').addEventListener('click', () => {
      console.log('[AutoDo] 点击停止答题按钮');
      stopAutoAnswer();
    });

    document.getElementById('autoDo-minimize').addEventListener('click', () => {
      panel.classList.remove('open');
      console.log('[AutoDo] 最小化面板');
    });

    document.getElementById('autoDo-headerStop').addEventListener('click', () => {
      if (panelState.autoAnswering) {
        console.log('[AutoDo] 头部按钮: 暂停答题');
        stopAutoAnswer();
      } else {
        console.log('[AutoDo] 头部按钮: 开始自动答题');
        if (panelState.countdownActive) {
          cancelAutoAnswerCountdown(true);
        }
        startAutoAnswer();
      }
    });

    document.getElementById('autoDo-header').addEventListener('dblclick', (e) => {
      if (e.target.closest('button')) return;
      if (panelState.autoAnswering) {
        stopAutoAnswer();
      } else {
        startAutoAnswer();
      }
    });

    const reanswerBtn = document.getElementById('autoDo-reanswerBtn');
    if (reanswerBtn) {
      reanswerBtn.addEventListener('click', () => {
        reAnswerSingleQuestion();
      });
    }

    // 导航切换
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        console.log('[AutoDo] 导航切换:', tab);
        switchTab(tab);
      });
    });

    makeDraggable(panel.querySelector('#autoDo-header'), panel);

    if (!appSettings) appSettings = getDefaultSettings();
    bindSettingsEvents();
    bindPageLimitEvents();
    initQuickProviderSelect();
    loadSettings();
    console.log('[AutoDo] bindPanelEvents: 事件绑定完成');
  }

  function ensurePageLimitGuard() {
    return window.AutoDoPageLimitGuard || null;
  }

  function getPageLimitUserOverride() {
    if (!appSettings) return {};
    if (!appSettings.pageLimit) appSettings.pageLimit = getDefaultSettings().pageLimit;
    return appSettings.pageLimit.userOverride || {};
  }

  function applyPageLimitProtection() {
    const guard = ensurePageLimitGuard();
    if (!guard) return;
    const userOverride = getPageLimitUserOverride();
    const effective = guard.getEffectiveState(userOverride);
    guard.apply(
      Object.assign({ userOverride: userOverride }, effective, {
        detected: effective.detected,
      })
    );
    return effective;
  }

  function refreshPageLimitUI() {
    const guard = ensurePageLimitGuard();
    if (!guard) return;

    const userOverride = getPageLimitUserOverride();
    const effective = guard.getEffectiveState(userOverride);
    const detected = effective.detected;

    const copyEl = document.getElementById('page-limit-copypaste');
    const mouseEl = document.getElementById('page-limit-mouseleave');
    const selectEl = document.getElementById('page-limit-select');
    const downloadEl = document.getElementById('page-limit-download');
    const devtoolsEl = document.getElementById('page-limit-devtools');

    if (copyEl) copyEl.checked = effective.allowCopyPaste;
    if (mouseEl) mouseEl.checked = effective.allowMouseLeaveMonitor;
    if (selectEl) selectEl.checked = effective.allowTextSelect;
    if (downloadEl) downloadEl.checked = effective.allowDownload;
    if (devtoolsEl) devtoolsEl.checked = effective.allowDevTools;

    const hint = document.querySelector('.page-limit-hint');
    if (hint && detected) {
      const originalParts = [];
      if (detected.copyPasteRestricted) originalParts.push('复制粘贴受限');
      if (detected.textSelectRestricted) originalParts.push('禁止选中');
      if (detected.mouseLeaveMonitored) originalParts.push('监听离开页面');
      if (detected.downloadRestricted) originalParts.push('禁止下载附件');
      if (detected.debugToolRestricted) originalParts.push('反调试暂停');

      const activeParts = [];
      if (effective.allowCopyPaste) activeParts.push('复制粘贴');
      if (effective.allowTextSelect) activeParts.push('文本选中');
      if (!effective.allowMouseLeaveMonitor) activeParts.push('屏蔽离开页面监听');
      if (effective.allowDownload) activeParts.push('附件下载');
      if (effective.allowDevTools) activeParts.push('允许调试工具');

      const base =
        '默认根据页面原始限制自动开启对应保护，您可手动关闭。仅处理以下五项浏览器限制，不涉及其它监考功能。';
      const detectedText = originalParts.length
        ? ' 页面原始检测到：' + originalParts.join('、') + '。'
        : ' 页面原始未检测到上述限制。';
      const activeText = activeParts.length
        ? ' 当前已开启保护：' + activeParts.join('、') + '。'
        : ' 当前未开启保护。';
      hint.textContent = base + detectedText + activeText;
    }
  }

  function initPageLimitProtection() {
    if (!appSettings) appSettings = getDefaultSettings();
    if (!appSettings.pageLimit) {
      appSettings.pageLimit = JSON.parse(JSON.stringify(getDefaultSettings().pageLimit));
    }
    if (!appSettings.pageLimit.userOverride) {
      appSettings.pageLimit.userOverride = {};
    }
    const guard = ensurePageLimitGuard();
    if (guard && typeof guard.refreshOriginalDetection === 'function') {
      guard.refreshOriginalDetection();
    }
    try {
      applyPageLimitProtection();
    } catch (err) {
      console.error('[AutoDo] initPageLimitProtection apply 失败:', err);
    }
    try {
      refreshPageLimitUI();
    } catch (err) {
      console.error('[AutoDo] initPageLimitProtection refreshUI 失败:', err);
    }
  }

  function bindPageLimitEvents() {
    const mapping = [
      { id: 'page-limit-copypaste', key: 'allowCopyPaste' },
      { id: 'page-limit-mouseleave', key: 'allowMouseLeaveMonitor' },
      { id: 'page-limit-select', key: 'allowTextSelect' },
      { id: 'page-limit-download', key: 'allowDownload' },
      { id: 'page-limit-devtools', key: 'allowDevTools' },
    ];

    mapping.forEach(({ id, key }) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('change', () => {
        if (!appSettings) appSettings = getDefaultSettings();
        if (!appSettings.pageLimit) {
          appSettings.pageLimit = JSON.parse(JSON.stringify(getDefaultSettings().pageLimit));
        }
        if (!appSettings.pageLimit.userOverride) {
          appSettings.pageLimit.userOverride = {};
        }
        appSettings.pageLimit.userOverride[key] = el.checked;
        try {
          saveSettings();
          applyPageLimitProtection();
          refreshPageLimitUI();
        } catch (err) {
          console.error('[AutoDo] 页面限制保护变更失败:', key, err);
        }
        console.log('[AutoDo] 页面限制保护:', key, '=', el.checked);
      });
    });
  }

  function switchTab(tab) {
    panelState.currentTab = tab;
    console.log('[AutoDo] switchTab: 切换到', tab, '页面');
    updatePanelHeaderForTab(tab);
    
    // 更新导航栏
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });
    
    // 更新内容区域
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    const target = document.getElementById('tab-' + tab);
    if (target) {
      target.classList.add('active');
      if (tab === 'settings') {
        renderModelList();
        renderRuleList();
      }
      if (tab === 'page-limit') {
        refreshPageLimitUI();
      }
      console.log('[AutoDo] switchTab: 成功激活', tab, '页面');
    } else {
      console.warn('[AutoDo] switchTab: 未找到页面:', 'tab-' + tab);
    }
  }

  function updatePanelHeaderForTab(tab) {
    const logo = document.querySelector('#autoDo-header .header-logo');
    const title = document.querySelector('#autoDo-header .title-main');
    const sub = document.querySelector('#autoDo-header .title-sub');
    if (!title || !sub) return;

    if (logo) logo.src = getIconPath('WorkDo.svg');
    title.textContent = tab === 'page-limit' ? '页面保护' : tab === 'settings' ? '设置' : '自动答题';
    sub.textContent = '当前平台：' + getPageKindLabel();
  }

  function makeDraggable(handle, element) {
    let isDragging = false;
    let startX, startY, origX, origY;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      e.preventDefault();
      isDragging = true;
      const rect = element.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      origX = rect.left;
      origY = rect.top;
      element.style.position = 'fixed';
      element.style.left = origX + 'px';
      element.style.top = origY + 'px';
      element.style.right = 'auto';
      element.style.bottom = 'auto';

      const onMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        element.style.left = (origX + dx) + 'px';
        element.style.top = (origY + dy) + 'px';
      };

      const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove, true);
        document.removeEventListener('mouseup', onMouseUp, true);
        if (element.style.left) savePanelPosition(element);
      };

      document.addEventListener('mousemove', onMouseMove, true);
      document.addEventListener('mouseup', onMouseUp, true);
    });
  }

  function resolveQuestionType(el, id) {
    const fromAttr = (el.getAttribute('typename') || '').trim();
    if (fromAttr) return fromAttr;

    const hiddenType = document.getElementById('typeName' + id);
    if (hiddenType && hiddenType.value) {
      return String(hiddenType.value).trim();
    }
    const hiddenTypeByName = el.querySelector('input[name="typeName' + id + '"]');
    if (hiddenTypeByName && hiddenTypeByName.value) {
      return String(hiddenTypeByName.value).trim();
    }

    if (el.classList.contains('ans-cc')) {
      return '多选题';
    }

    const ariaType = el.querySelector(
      '[aria-label*="多选题"], [aria-label*="单选题"], [aria-label*="判断题"], [aria-label*="填空题"], [aria-label*="简答题"], [aria-label*="问答题"], [aria-label*="论述题"], [aria-label*="计算题"]'
    );
    if (ariaType) {
      const label = ariaType.getAttribute('aria-label') || '';
      if (label.includes('多选题')) return '多选题';
      if (label.includes('单选题')) return '单选题';
      if (label.includes('判断题')) return '判断题';
      if (label.includes('填空题')) return '填空题';
      if (label.includes('简答题')) return '简答题';
      if (label.includes('问答题')) return '问答题';
      if (label.includes('论述题')) return '论述题';
      if (label.includes('计算题')) return '计算题';
    }

    const markText = el.querySelector('.mark_name, .colorShallow');
    if (markText) {
      const text = markText.textContent || '';
      if (text.includes('多选题')) return '多选题';
      if (text.includes('单选题')) return '单选题';
      if (text.includes('判断题')) return '判断题';
      if (text.includes('填空题')) return '填空题';
      if (text.includes('简答题')) return '简答题';
      if (text.includes('问答题')) return '问答题';
      if (text.includes('论述题')) return '论述题';
      if (text.includes('计算题')) return '计算题';
    }

    return fromAttr || '题目';
  }

  function isMultiOptionChecked(opt) {
    if (!opt) return false;
    if (opt.getAttribute('aria-checked') === 'true') return true;
    const label = opt.querySelector('.num_option_dx, .num_option');
    return !!(
      label &&
      (label.classList.contains('check_answer_dx') || label.classList.contains('check_answer'))
    );
  }

  function countMultiSelectedOnPage(el) {
    let count = 0;
    el.querySelectorAll('.answerBg').forEach((opt) => {
      if (isMultiOptionChecked(opt)) count += 1;
    });
    return count;
  }

  function getQuestionHiddenAnswer(id) {
    const input = document.getElementById('answer' + id);
    return input ? String(input.value || '').trim() : '';
  }

  function isQuestionAnsweredOnPage(el, typeName, id) {
    if (isOnZhidaoPlatform()) {
      return isZhidaoQuestionAnswered(el, typeName);
    }
    if (typeName === '单选题' || typeName === '判断题') {
      if (el.querySelector('.answerBg[aria-checked="true"]')) return true;
      let checked = false;
      el.querySelectorAll('.answerBg').forEach((opt) => {
        if (isMultiOptionChecked(opt)) checked = true;
      });
      return checked;
    }
    if (typeName === '多选题') {
      const selected = countMultiSelectedOnPage(el);
      const hidden = getQuestionHiddenAnswer(id);
      return selected > 0 || hidden.length > 0;
    }
    if (isTextEntryQuestionType(typeName)) {
      const values = getFillBlankValues(el, id);
      if (!values.length) {
        const answerInput = document.getElementById('answer' + id);
        return !!(answerInput && answerInput.value);
      }
      if (typeName === '填空题') {
        return values.every((v) => v.trim() !== '');
      }
      return values.some((v) => v.trim() !== '');
    }
    const answerInput = document.getElementById('answer' + id);
    return !!(answerInput && answerInput.value);
  }

  function inheritQuestionAiState(prevQ) {
    if (!prevQ) {
      return {
        aiRecord: null,
        aiRecords: null,
        multiModelMeta: null,
        needsSelfDecision: false,
      };
    }
    return {
      aiRecord: prevQ.aiRecord || null,
      aiRecords:
        prevQ.aiRecords && prevQ.aiRecords.length ? prevQ.aiRecords.slice() : null,
      multiModelMeta: prevQ.multiModelMeta || null,
      needsSelfDecision: !!prevQ.needsSelfDecision,
      _previewThinkingTab: prevQ._previewThinkingTab,
      _previewAnswerTab: prevQ._previewAnswerTab,
    };
  }

  function shouldUseMultiModelPreview(q) {
    return !!(
      appSettings?.multiModelDecision &&
      q.aiRecords &&
      q.aiRecords.length > 0
    );
  }

  function getQuestionDotStatus(q) {
    if (panelState.selfDecisionQuestionIds.has(q.id) || q.needsSelfDecision) return 'self-decision';
    if (panelState.partialQuestionIds.has(q.id)) return 'partial';
    if (q.isAnswered) return 'answered';
    if (panelState.failedQuestionIds.has(q.id)) return 'failed';
    return 'pending';
  }

  function markQuestionFailed(q) {
    panelState.failedQuestionIds.add(q.id);
    panelState.partialQuestionIds.delete(q.id);
    q.isAnswered = false;
  }

  function clearQuestionFailed(q) {
    panelState.failedQuestionIds.delete(q.id);
  }

  function markQuestionPartial(q) {
    panelState.partialQuestionIds.add(q.id);
    panelState.failedQuestionIds.delete(q.id);
  }

  function clearQuestionPartial(q) {
    panelState.partialQuestionIds.delete(q.id);
  }

  function countExpectedMultiAnswers(answerValue) {
    return String(answerValue || '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .split('')
      .filter((c, i, arr) => arr.indexOf(c) === i).length;
  }

  function updateMultiChoiceResultState(q, answerValue) {
    if (q.type !== '多选题') {
      clearQuestionPartial(q);
      return;
    }

    const expectedCount = countExpectedMultiAnswers(answerValue);
    const selectedCount = countMultiSelectedOnPage(q.element);
    const hiddenLen = getQuestionHiddenAnswer(q.id).replace(/[^A-Z]/gi, '').length;
    const effectiveSelected = Math.max(selectedCount, hiddenLen);

    clearQuestionPartial(q);

    if (expectedCount === 1 && effectiveSelected === 1) {
      markQuestionPartial(q);
      q.isAnswered = true;
      return;
    }

    if (expectedCount >= 2 && effectiveSelected < expectedCount) {
      markQuestionFailed(q);
      q.isAnswered = effectiveSelected > 0;
    }
  }

  /* ======================== 知到 (Polymas/Zhihuishu) 平台支持 ======================== */

  function getZhidaoQuestionElements() {
    const candidates = document.querySelectorAll(
      '.answer-homework-page-wrap .question-item, #agent__course__exam .question-item, .answer-homework-page-wrap .base-question-component, #agent__course__exam .base-question-component'
    );
    const seen = new Set();
    const result = [];
    candidates.forEach((node) => {
      const el = node.classList.contains('question-item')
        ? node
        : node.closest('.question-item') || node;
      if (!el || seen.has(el)) return;
      if (!el.querySelector('.title-box') || !el.querySelector('.qeustion-content')) return;
      seen.add(el);
      result.push(el);
    });
    return result;
  }

  function scanZhidaoQuestions() {
    const questions = [];
    const prevFailed = new Set(panelState.failedQuestionIds);
    const questionEls = getZhidaoQuestionElements();
    console.log('[AutoDo] scanZhidaoQuestions: 开始扫描, 找到', questionEls.length, '个知到题目元素');

    if (!questionEls.length) {
      panelState.zhidaoScanRetryCount = (panelState.zhidaoScanRetryCount || 0) + 1;
      if (panelState.zhidaoScanRetryCount <= 20) {
        console.log('[AutoDo] scanZhidaoQuestions: 题目尚未挂载, 继续等待重试', panelState.zhidaoScanRetryCount);
        setTimeout(scanQuestions, 500);
      }
    } else {
      panelState.zhidaoScanRetryCount = 0;
    }

    questionEls.forEach((el, index) => {
      const id = el.getAttribute('id') || el.getAttribute('data-id') || 'zhidao-' + (index + 1);
      const typeName = resolveZhidaoQuestionType(el);
      const stemEl = el.querySelector('.qeustion-content .markdown-latex-container');
      let title = '';
      if (stemEl) {
        title = stemEl.textContent.replace(/\s+/g, ' ').trim();
      }

      const isAnswered = isZhidaoQuestionAnswered(el, typeName);

      console.log('[AutoDo]   题目' + id + '(' + typeName + '): 已答=' + isAnswered);

      const prevQ = panelState.questions.find((item) => item.id === id);
      questions.push(
        Object.assign(
          {
            id: id,
            index: questions.length + 1,
            type: typeName,
            title: title,
            currentAnswer: '',
            isAnswered: isAnswered,
            element: el,
          },
          inheritQuestionAiState(prevQ)
        )
      );
    });

    panelState.questions = questions;
    panelState.totalCount = questions.length;
    panelState.answeredCount = questions.filter((q) =>
      isZhidaoQuestionAnswered(q.element, q.type)
    ).length;
    questions.forEach((q) => {
      if (isZhidaoQuestionAnswered(q.element, q.type)) {
        clearQuestionFailed(q);
      }
    });
    panelState.failedQuestionIds = new Set(
      questions
        .filter((q) => !q.isAnswered && !panelState.partialQuestionIds.has(q.id) && prevFailed.has(q.id))
        .map((q) => q.id)
    );

    const selected =
      panelState.selectedPreviewQuestionId &&
      questions.find((q) => q.id === panelState.selectedPreviewQuestionId);
    if (selected) {
      renderQuestionPreview(selected);
    } else if (questions.length) {
      selectPreviewQuestion(questions[0], false);
    } else {
      renderQuestionPreview(null);
    }

    panelState.isExamPage = false;
    console.log(
      '[AutoDo] scanZhidaoQuestions: 扫描完成, 总题数=' +
        questions.length +
        ', 已答=' +
        panelState.answeredCount
    );
    updateUI();
    updatePageKindSubtitle();
    tryOfferExamPageFlow();
  }

  function resolveZhidaoQuestionType(el) {
    const titleEl = el.querySelector('.title-box .title .float-left');
    if (titleEl) {
      const text = titleEl.textContent || '';
      if (text.includes('多选题')) return '多选题';
      if (text.includes('单选题')) return '单选题';
      if (text.includes('判断题')) return '判断题';
      if (text.includes('填空题')) return '填空题';
      if (text.includes('简答题')) return '简答题';
      if (text.includes('问答题')) return '问答题';
      if (text.includes('论述题')) return '论述题';
      if (text.includes('计算题')) return '计算题';
      if (text.includes('主观题')) return '简答题';
      if (text.includes('判断')) return '判断题';
    }
    const groupTitle = el.closest('.answer-group');
    if (groupTitle) {
      const gt = groupTitle.querySelector('.group-title');
      if (gt) {
        const text = gt.textContent || '';
        if (text.includes('多选题')) return '多选题';
        if (text.includes('单选题')) return '单选题';
        if (text.includes('判断题')) return '判断题';
        if (text.includes('填空题')) return '填空题';
        if (text.includes('简答题')) return '简答题';
      }
    }
    return '题目';
  }

  function isZhidaoOptionChosen(opt) {
    if (!opt) return false;
    const className = String(opt.className || '').toLowerCase();
    if (
      className.includes('is-choose') ||
      className.includes('is-selected') ||
      className.includes('is-active') ||
      className.includes('selected') ||
      className.includes('checked')
    ) {
      return true;
    }
    if (opt.getAttribute('aria-checked') === 'true') return true;
    const icon = opt.querySelector('i.iconfont');
    const iconClass = String(icon?.className || '').toLowerCase();
    return (
      iconClass.includes('xuanzhong') ||
      iconClass.includes('checked') ||
      iconClass.includes('selected') ||
      iconClass.includes('choose')
    );
  }

  function getZhidaoTextInputEl(el) {
    return (
      el.querySelector('textarea') ||
      el.querySelector('input[type="text"]') ||
      el.querySelector('.el-textarea__inner') ||
      el.querySelector('[contenteditable="true"]')
    );
  }

  function isZhidaoQuestionAnswered(el, typeName) {
    if (typeName === '单选题' || typeName === '判断题') {
      const options = el.querySelectorAll('.option-item');
      for (const opt of options) {
        if (isZhidaoOptionChosen(opt)) return true;
      }
      return false;
    }
    if (typeName === '多选题') {
      const options = el.querySelectorAll('.option-item');
      let count = 0;
      for (const opt of options) {
        if (isZhidaoOptionChosen(opt)) count += 1;
      }
      return count > 0;
    }
    if (typeName === '填空题') {
      const inputEl = getZhidaoTextInputEl(el);
      if (!inputEl) return false;
      if (inputEl.isContentEditable) return (inputEl.textContent || '').trim() !== '';
      return String(inputEl.value || '').trim() !== '';
    }
    if (typeName === '简答题' || typeName === '问答题' || typeName === '论述题') {
      const inputEl = getZhidaoTextInputEl(el);
      if (!inputEl) return false;
      if (inputEl.isContentEditable) return (inputEl.textContent || '').trim() !== '';
      return String(inputEl.value || '').trim() !== '';
    }
    return false;
  }

  function extractZhidaoOptions(el) {
    const options = [];
    const optionEls = el.querySelectorAll('.option-item');
    optionEls.forEach((opt) => {
      const orderEl = opt.querySelector('.option-order');
      const contentEl = opt.querySelector('.option-content');
      const key = orderEl ? orderEl.textContent.replace('.', '').trim() : '';
      const text = contentEl ? contentEl.textContent.replace(/\s+/g, ' ').trim() : '';
      const images = contentEl ? extractImagesFromScopes([contentEl], false) : [];
      const isChosen = isZhidaoOptionChosen(opt);
      options.push({
        key: key,
        text: text,
        images: images,
        element: opt,
        isChosen: isChosen,
      });
    });
    return options;
  }

  function getZhidaoAnswerForQuestion(el, typeName) {
    if (typeName === '单选题' || typeName === '判断题') {
      const options = el.querySelectorAll('.option-item');
      for (const opt of options) {
        if (!isZhidaoOptionChosen(opt)) continue;
        const orderEl = opt.querySelector('.option-order');
        return orderEl ? orderEl.textContent.replace('.', '').trim() : '';
      }
      return '';
    }
    if (typeName === '多选题') {
      const answers = [];
      el.querySelectorAll('.option-item').forEach((opt) => {
        if (!isZhidaoOptionChosen(opt)) return;
        const orderEl = opt.querySelector('.option-order');
        if (orderEl) answers.push(orderEl.textContent.replace('.', '').trim());
      });
      return answers.join('');
    }
    if (typeName === '填空题' || typeName === '简答题' || typeName === '问答题' || typeName === '论述题') {
      const inputEl = getZhidaoTextInputEl(el);
      if (!inputEl) return '';
      if (inputEl.isContentEditable) return inputEl.textContent || '';
      return inputEl.value || '';
    }
    return '';
  }

  function clickZhidaoOption(opt) {
    const hit =
      opt.querySelector('.option-content') ||
      opt.querySelector('.option-order') ||
      opt.querySelector('i.iconfont') ||
      opt;
    hit.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    hit.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    hit.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }

  function setZhidaoSingleChoiceAnswer(el, answerValue) {
    const target = String(answerValue).trim().toUpperCase();
    const options = el.querySelectorAll('.option-item');
    for (const opt of options) {
      const orderEl = opt.querySelector('.option-order');
      if (!orderEl) continue;
      const key = orderEl.textContent.replace('.', '').trim().toUpperCase();
      if (key === target) {
        if (isZhidaoOptionChosen(opt)) {
          console.log('[AutoDo]   知到选项已选中, 无需重复点击');
          return true;
        }
        console.log('[AutoDo]   知到点击选项 ' + key);
        clickZhidaoOption(opt);
        return true;
      }
    }
    if (target === 'TRUE' || target === 'false') {
      const isTrue = target === 'TRUE';
      for (const opt of options) {
        const text = (opt.textContent || '').trim();
        if ((isTrue && text.includes('正确')) || (!isTrue && text.includes('错误'))) {
          if (isZhidaoOptionChosen(opt)) return true;
          clickZhidaoOption(opt);
          return true;
        }
      }
    }
    console.warn('[AutoDo]   知到未找到匹配选项, 答案=' + answerValue);
    return false;
  }

  async function setZhidaoMultiChoiceAnswer(el, answerValue) {
    const normalized = String(answerValue || '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
    const letters = normalized.split('').filter((c, i, arr) => arr.indexOf(c) === i);
    console.log('[AutoDo] setZhidaoMultiChoiceAnswer: 答案=' + letters.join(''));

    if (!letters.length) return false;

    const options = el.querySelectorAll('.option-item');
    const targetSet = new Set(letters);
    let clicked = 0;

    for (const opt of options) {
      const orderEl = opt.querySelector('.option-order');
      if (!orderEl) continue;
      const key = orderEl.textContent.replace('.', '').trim().toUpperCase();
      const isChosen = isZhidaoOptionChosen(opt);

      if (targetSet.has(key)) {
        if (!isChosen) {
          console.log('[AutoDo]   知到勾选选项 ' + key);
          clickZhidaoOption(opt);
          clicked += 1;
          await new Promise((resolve) => setTimeout(resolve, 120));
        } else {
          console.log('[AutoDo]   知到选项 ' + key + ' 已选中');
        }
      }
    }

    let selectedCount = 0;
    options.forEach((opt) => {
      if (isZhidaoOptionChosen(opt)) selectedCount += 1;
    });
    return selectedCount > 0;
  }

  function setZhidaoFillBlankAnswer(el, answerValue) {
    const inputEl = getZhidaoTextInputEl(el);
    if (!inputEl) {
      console.warn('[AutoDo]   知到未找到填空输入框');
      return false;
    }
    if (inputEl.isContentEditable) {
      inputEl.focus();
      inputEl.textContent = String(answerValue || '');
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));
      inputEl.dispatchEvent(new Event('blur', { bubbles: true }));
      return true;
    }
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    if (setter) {
      setter.call(inputEl, String(answerValue || ''));
    } else {
      inputEl.value = String(answerValue || '');
    }
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    inputEl.dispatchEvent(new Event('blur', { bubbles: true }));
    console.log('[AutoDo]   知到填空已填入: ' + answerValue);
    return true;
  }

  /* ======================== 学习通平台 ======================== */

  function scanQuestions() {
    if (isOnZhidaoPlatform()) {
      return scanZhidaoQuestions();
    }

    const questions = [];
    const prevFailed = new Set(panelState.failedQuestionIds);
    const questionEls = document.querySelectorAll('.questionLi');
    console.log('[AutoDo] scanQuestions: 开始扫描, 找到', questionEls.length, '个.questionLi元素');

    questionEls.forEach((el) => {
      const id = el.getAttribute('data') || el.id.replace('question', '');
      const typeName = resolveQuestionType(el, id);
      const titleEl = el.querySelector('.mark_name');
      let title = '';
      if (titleEl) {
        title = titleEl.textContent.replace(/\d+\.\s*/, '').replace(/\([^)]*\)/, '').trim();
      }

      const currentAnswer = getQuestionHiddenAnswer(id);
      const isAnswered = isQuestionAnsweredOnPage(el, typeName, id);

      if (typeName === '单选题') {
        console.log('[AutoDo]   题目' + id + '(单选题): 选中状态=', isAnswered);
      } else if (typeName === '多选题') {
        console.log('[AutoDo]   题目' + id + '(多选题): 已答=', isAnswered);
      } else if (typeName === '填空题') {
        console.log('[AutoDo]   题目' + id + '(填空题): 已答=', isAnswered);
      } else if (typeName === '判断题') {
        console.log('[AutoDo]   题目' + id + '(判断题): 选中状态=', isAnswered);
      } else {
        console.log('[AutoDo]   题目' + id + '(未知题型=' + typeName + '): 已答=', isAnswered);
      }

      const prevQ = panelState.questions.find((item) => item.id === id);
      questions.push(
        Object.assign(
          {
            id: id,
            index: questions.length + 1,
            type: typeName,
            title: title,
            currentAnswer: currentAnswer,
            isAnswered: isAnswered,
            element: el,
          },
          inheritQuestionAiState(prevQ)
        )
      );
    });

    questions.forEach((q) => {
      if (q.type === '多选题') {
        const ans = (q.aiRecord && q.aiRecord.parsedAnswer) || q.currentAnswer;
        if (ans) updateMultiChoiceResultState(q, ans);
      }
    });

    panelState.questions = questions;
    panelState.totalCount = questions.length;
    panelState.answeredCount = questions.filter((q) => isQuestionAnsweredOnPage(q.element, q.type, q.id)).length;
    questions.forEach((q) => {
      if (isQuestionAnsweredOnPage(q.element, q.type, q.id)) {
        clearQuestionFailed(q);
      }
    });
    panelState.failedQuestionIds = new Set(
      questions
        .filter((q) => !q.isAnswered && !panelState.partialQuestionIds.has(q.id) && prevFailed.has(q.id))
        .map((q) => q.id)
    );

    const selected =
      panelState.selectedPreviewQuestionId &&
      questions.find((q) => q.id === panelState.selectedPreviewQuestionId);
    if (selected) {
      renderQuestionPreview(selected);
    } else if (questions.length) {
      selectPreviewQuestion(questions[0], false);
    } else {
      renderQuestionPreview(null);
    }

    panelState.isExamPage = isExamPage();
    console.log(
      '[AutoDo] scanQuestions: 扫描完成, 总题数=' +
        questions.length +
        ', 已答=' +
        panelState.answeredCount +
        ', 考试页=' +
        panelState.isExamPage
    );
    updateUI();
    updatePageKindSubtitle();
    tryOfferExamPageFlow();
  }

  function tryOfferExamPageFlow() {
    if (
      panelState.autoAnswering ||
      panelState.autoStartCancelled ||
      panelState.countdownActive ||
      panelState.countdownOffered ||
      panelState.previewPromptActive
    ) {
      return;
    }

    panelState.isExamPage = isExamPage();

    if (panelState.isExamPage) {
      if (!isExamQuestionSurfaceReady()) {
        return;
      }
      if (shouldOfferFullPaperPreviewPrompt()) {
        showFullPaperPreviewPrompt(() => {
          tryOfferAutoAnswerCountdown();
        });
        return;
      }
      tryOfferAutoAnswerCountdown();
      return;
    }

    tryOfferAutoAnswerCountdown();
  }

  function tryOfferAutoAnswerCountdown() {
    if (
      panelState.autoAnswering ||
      panelState.autoStartCancelled ||
      panelState.countdownActive ||
      panelState.countdownOffered ||
      panelState.previewPromptActive
    ) {
      return;
    }

    panelState.isExamPage = isExamPage();

    if (panelState.isExamPage) {
      if (!isExamQuestionSurfaceReady()) {
        return;
      }
      panelState.countdownOffered = true;
      showAutoAnswerCountdown({ exam: true });
      return;
    }

    if (panelState.questions.length > 0) {
      panelState.countdownOffered = true;
      showAutoAnswerCountdown();
    }
  }

  function updateHeaderActionBtn() {
    const btn = document.getElementById('autoDo-headerStop');
    const icon = document.getElementById('autoDo-headerActionIcon');
    if (!btn || !icon) return;

    if (panelState.autoAnswering) {
      icon.src = getIconPath('stop.svg');
      icon.alt = '暂停答题';
      btn.title = '暂停答题';
      btn.classList.add('is-answering');
    } else {
      icon.src = getIconPath('jixu.svg');
      icon.alt = '开始自动答题';
      btn.title = '开始自动答题';
      btn.classList.remove('is-answering');
    }
  }

  function getModelDisplayName(model) {
    if (!model) return 'AI';
    return model.name || model.model || model.provider || 'AI';
  }

  function formatJudgeAnswerText(key) {
    if (key === 'true') return '正确';
    if (key === 'false') return '错误';
    return key;
  }

  function isValidAnswerValue(answer) {
    return answer !== undefined && answer !== null && String(answer).trim() !== '';
  }

  function bindPreviewCollapseHandlers(container) {
    container.querySelectorAll('.preview-ai-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const block = btn.closest('.preview-ai-block');
        if (!block) return;
        const collapsed = block.classList.toggle('is-collapsed');
        btn.setAttribute('aria-expanded', String(!collapsed));
      });
    });
  }

  function isMultiModelStreaming(q) {
    return !!(
      shouldUseMultiModelPreview(q) &&
      (q.aiRecords || []).some((r) => r.thinkingStreaming)
    );
  }

  function maybeScrollThinkingPanel(container, forceBottom) {
    const body = container && container.querySelector('.preview-ai-body--thinking');
    if (!body) return;
    const stickBottom = body.dataset.stickBottom !== '0';
    if (!forceBottom && !stickBottom) return;
    body.scrollTop = body.scrollHeight;
  }

  function updateMultiModelPreviewInPlace(q, container) {
    if (!container || !q.aiRecords) return;

    q.aiRecords.forEach((r, i) => {
      const id = getRecordTabId(r, i);
      container.querySelectorAll('.preview-model-panel[data-block="thinking"]').forEach((panel) => {
        if (panel.dataset.modelId !== id) return;
        panel.innerHTML = renderMultiModelThinkingContent(q, r);
      });
      container.querySelectorAll('.preview-model-panel[data-block="answer"]').forEach((panel) => {
        if (panel.dataset.modelId !== id) return;
        const text = formatMultiModelAnswerText(q, r);
        const isErrorOnly = !!(r.error && !isValidAnswerValue(r.parsedAnswer));
        panel.innerHTML =
          '<div class="preview-model-answer-text' +
          (isErrorOnly ? ' preview-model-answer-text--muted' : '') +
          '">' +
          escapeHtml(text) +
          '</div>';
      });
      container.querySelectorAll('.preview-model-tab').forEach((tab) => {
        if (tab.dataset.modelId !== id) return;
        const streaming = r.thinkingStreaming;
        tab.classList.toggle('preview-model-tab--streaming', !!streaming);
        const baseName = r.modelName || '模型';
        const suffix = streaming ? ' · 思考中' : '';
        if (tab.textContent !== baseName + suffix) tab.textContent = baseName + suffix;
      });
    });

    const answerTab = q._previewAnswerTab || getRecordTabId(q.aiRecords[0], 0);
    const activeRecord = q.aiRecords.find((r, idx) => getRecordTabId(r, idx) === answerTab);
    const answerBlock = container.querySelector('[data-multi-block="answer"]');
    const useBtn = answerBlock && answerBlock.querySelector('.preview-use-answer-btn');
    if (useBtn) {
      if (activeRecord && isValidAnswerValue(activeRecord.parsedAnswer)) {
        useBtn.dataset.modelId = answerTab;
        useBtn.style.display = '';
      } else {
        useBtn.style.display = 'none';
      }
    }
  }

  let questionPreviewDelegationBound = false;

  function initQuestionPreviewDelegation() {
    if (questionPreviewDelegationBound) return;
    const container = document.getElementById('autoDo-questionPreview');
    if (!container) return;
    questionPreviewDelegationBound = true;

    container.addEventListener(
      'scroll',
      (e) => {
        const body = e.target.closest('.preview-ai-body--thinking');
        if (!body) return;
        const atBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 48;
        body.dataset.stickBottom = atBottom ? '1' : '0';
      },
      true
    );

    container.addEventListener('click', (e) => {
      const tab = e.target.closest('.preview-model-tab');
      if (tab) {
        e.preventDefault();
        const q = panelState.questions.find((item) => item.id === panelState.selectedPreviewQuestionId);
        if (!q) return;
        const blockType = tab.dataset.block;
        const modelId = tab.dataset.modelId;
        const blockEl = tab.closest('.preview-ai-block');
        if (!blockEl || !modelId) return;

        if (blockType === 'thinking') q._previewThinkingTab = modelId;
        else q._previewAnswerTab = modelId;

        blockEl.querySelectorAll('.preview-model-tab').forEach((t) => {
          t.classList.toggle('active', t.dataset.modelId === modelId);
        });
        blockEl.querySelectorAll('.preview-model-panel').forEach((p) => {
          p.classList.toggle('is-active', p.dataset.modelId === modelId);
        });

        if (blockType === 'answer') {
          const record = (q.aiRecords || []).find((r, i) => getRecordTabId(r, i) === modelId);
          const useBtn = blockEl.querySelector('.preview-use-answer-btn');
          if (useBtn) {
            if (record && isValidAnswerValue(record.parsedAnswer)) {
              useBtn.dataset.modelId = modelId;
              useBtn.style.display = '';
            } else {
              useBtn.style.display = 'none';
            }
          }
        }
        return;
      }

      const useBtn = e.target.closest('.preview-use-answer-btn');
      if (useBtn) {
        e.preventDefault();
        const q = panelState.questions.find((item) => item.id === panelState.selectedPreviewQuestionId);
        if (!q) return;
        const modelId = useBtn.dataset.modelId;
        if (modelId) applyMultiModelSelectedAnswer(q, modelId);
      }
    });
  }

  function renderQuestionPreview(q) {
    const container = document.getElementById('autoDo-questionPreview');
    if (!container) return;

    initQuestionPreviewDelegation();

    if (!q) {
      container.innerHTML = '<div class="preview-placeholder">点击题目列表中的题号查看预览</div>';
      updateReanswerButton(null);
      return;
    }

    const ctx = extractQuestionContext(q);
    const typeLabel = escapeHtml(q.type || '题目');
    const indexLabel = q.index ? '第' + q.index + '题 · ' : '';

    let optionsHtml = '';
    if (ctx.options.length) {
      optionsHtml = ctx.options
        .map((o) => {
          const optionImagesHtml = (o.images || [])
            .map(
              (url) =>
                '<img class="preview-content-image" src="' +
                escapeHtml(url) +
                '" alt="选项图片" loading="lazy">'
            )
            .join('');
          return (
            '<div class="preview-option">' +
            '<span class="preview-option-key">' +
            escapeHtml(o.key) +
            '</span>' +
            '<span class="preview-option-text">' +
            escapeHtml(o.text) +
            optionImagesHtml +
            '</span></div>'
          );
        })
        .join('');
    }

    const stemImagesHtml = (ctx.stemImages || ctx.images || [])
      .map(
        (url) =>
          '<img class="preview-content-image" src="' +
          escapeHtml(url) +
          '" alt="题目图片" loading="lazy">'
      )
      .join('');

    if (
      shouldUseMultiModelPreview(q) &&
      isMultiModelStreaming(q) &&
      container.querySelector('.preview-ai-block--multi')
    ) {
      updateMultiModelPreviewInPlace(q, container);
      maybeScrollThinkingPanel(container, false);
      return;
    }

    let aiBlocksHtml = '';
    if (shouldUseMultiModelPreview(q)) {
      aiBlocksHtml = renderMultiModelPreviewBlocks(q);
    }

    const record = shouldUseMultiModelPreview(q) ? null : q.aiRecord;
    if (record) {
      const modelLabel = escapeHtml(record.modelName || 'AI');

      if (record.thinking || record.thinkingStreaming) {
        const thinkingText = record.thinking
          ? escapeHtml(record.thinking)
          : '<span class="preview-ai-thinking-wait">正在思考…</span>';
        aiBlocksHtml +=
          '<div class="preview-ai-block">' +
          '<button type="button" class="preview-ai-head preview-ai-toggle" aria-expanded="true">' +
          '<span class="preview-ai-head-left">' +
          '<img class="preview-ai-icon" src="' +
          getIconPath('thinking.svg') +
          '" alt="">' +
          '<span class="preview-ai-title">思考来自 ' +
          modelLabel +
          '</span></span>' +
          '<img class="preview-ai-chevron" src="' +
          getIconPath('zhankai.svg') +
          '" alt="">' +
          '</button>' +
          '<div class="preview-ai-body preview-ai-body--thinking">' +
          thinkingText +
          (record.thinkingStreaming ? '<span class="preview-ai-cursor">▍</span>' : '') +
          '</div></div>';
      }

      const answerText = record.error
        ? '作答失败：' + record.error
        : record.parsedAnswer
          ? q.type === '判断题'
            ? '答案：' + formatJudgeAnswerText(record.parsedAnswer)
            : q.type === '多选题'
              ? '答案：' +
                String(record.parsedAnswer)
                  .toUpperCase()
                  .replace(/[^A-Z]/g, '')
              : '答案：' + record.parsedAnswer
          : record.rawReply
            ? record.rawReply
            : '暂无解析结果';

      const showAnswerBlock =
        record.error ||
        record.parsedAnswer ||
        record.rawReply ||
        (!record.thinkingStreaming && record.contentRaw);

      if (showAnswerBlock) {
      aiBlocksHtml +=
        '<div class="preview-ai-block">' +
        '<button type="button" class="preview-ai-head preview-ai-toggle" aria-expanded="true">' +
        '<span class="preview-ai-head-left">' +
        '<img class="preview-ai-icon" src="' +
        getIconPath('Aianswer.svg') +
        '" alt="">' +
        '<span class="preview-ai-title">回答来自 ' +
        modelLabel +
        '</span></span>' +
        '<img class="preview-ai-chevron" src="' +
        getIconPath('zhankai.svg') +
        '" alt="">' +
        '</button>' +
        '<div class="preview-ai-body">' +
        escapeHtml(answerText) +
        '</div></div>';
      }
    }

    const metaExtraClass = q.needsSelfDecision ? ' preview-meta--self-decision' : '';

    container.innerHTML =
      '<div class="preview-meta' +
      metaExtraClass +
      '">' +
      indexLabel +
      typeLabel +
      (q.needsSelfDecision ? ' · <span class="preview-meta-tag">需自行决策</span>' : '') +
      '</div>' +
      '<div class="preview-stem">' +
      escapeHtml(ctx.stem || q.title || '（无题干）') +
      (stemImagesHtml ? '<div class="preview-stem-images">' + stemImagesHtml + '</div>' : '') +
      '</div>' +
      (optionsHtml ? '<div class="preview-options">' + optionsHtml + '</div>' : '') +
      (aiBlocksHtml ? '<div class="preview-ai-list">' + aiBlocksHtml + '</div>' : '');

    bindPreviewCollapseHandlers(container);

    const thinkingBody = container.querySelector('.preview-ai-body--thinking');
    if (thinkingBody && !thinkingBody.dataset.stickBottom) {
      thinkingBody.dataset.stickBottom = '1';
    }

    if (isMultiModelStreaming(q) || (record && record.thinkingStreaming)) {
      maybeScrollThinkingPanel(container, true);
    }
  }

  function initStreamingAiRecord(q, model, targetRecord) {
    const record = targetRecord || {
      thinking: '正在连接 AI…',
      thinkingStreaming: true,
      rawReply: '',
      contentRaw: '',
      modelName: getModelDisplayName(model),
      modelId: model.model,
      modelConfigId: model.id,
      at: Date.now(),
    };
    if (!targetRecord) {
      q.aiRecord = record;
    } else {
      Object.assign(targetRecord, record);
    }
    if (panelState.selectedPreviewQuestionId === q.id) {
      renderQuestionPreview(q);
    }
    return targetRecord || q.aiRecord;
  }

  function selectPreviewQuestion(q, scrollToPage) {
    if (!q) return;
    panelState.selectedPreviewQuestionId = q.id;
    renderQuestionPreview(q);

    updateReanswerButton(q);

    document.querySelectorAll('.question-dot.is-preview-active').forEach((el) => {
      el.classList.remove('is-preview-active');
    });
    document.querySelectorAll('.question-dot').forEach((el) => {
      const idx = parseInt(el.textContent, 10);
      const match = panelState.questions.find((item) => item.index === idx);
      if (match && match.id === q.id) {
        el.classList.add('is-preview-active');
      }
    });

    if (scrollToPage !== false && q.element) {
      q.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      q.element.style.transition = 'background 0.3s';
      q.element.style.background = '#eef2ff';
      setTimeout(() => {
        q.element.style.background = '';
      }, 1500);
    }
  }

  function updateReanswerButton(q) {
    const reanswerBtn = document.getElementById('autoDo-reanswerBtn');
    if (!reanswerBtn) return;

    if (panelState.autoAnswering) {
      reanswerBtn.style.display = '';
      reanswerBtn.textContent = '批量作答中…';
      reanswerBtn.disabled = true;
      return;
    }

    if (panelState.singleQuestionAnswering) {
      reanswerBtn.style.display = '';
      reanswerBtn.textContent = '作答中…';
      reanswerBtn.disabled = false;
      return;
    }

    reanswerBtn.disabled = false;
    if (!q) {
      reanswerBtn.style.display = 'none';
      return;
    }
    reanswerBtn.style.display = '';
    reanswerBtn.textContent = q.isAnswered ? '重新作答' : '作答';
  }

  function updateUI() {
    const total = panelState.totalCount;
    const answered = panelState.answeredCount;
    const progress = total > 0 ? Math.round((answered / total) * 100) : 0;
    const currentQ = panelState.currentQuestionIndex !== undefined ? panelState.currentQuestionIndex + 1 : 0;

    document.getElementById('autoDo-total').textContent = total || '-';
    document.getElementById('autoDo-answered').textContent = answered || '-';
    document.getElementById('autoDo-progress').textContent = total > 0 ? progress + '%' : '-';
    document.getElementById('autoDo-questionStatus').textContent =
      total > 0 ? `${currentQ} / ${total}` : '0 / 0';

    updateHeaderActionBtn();

    const questionByType = document.getElementById('autoDo-questionByType');
    questionByType.innerHTML = '';

    if (panelState.questions.length === 0) {
      questionByType.innerHTML = '<div class="empty-state">未检测到题目，请刷新或确认是否在作业/考试页面</div>';
      renderQuestionPreview(null);
      return;
    }

    // 按题型分组
    const grouped = {};
    panelState.questions.forEach(q => {
      const type = q.type || '其他';
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(q);
    });

    // 渲染每个题型组
    Object.keys(grouped).forEach((type) => {
      const list = grouped[type];
      const typeCount = list.length;
      const typeAnswered = list.filter((q) => q.isAnswered).length;
      const typeRate = typeCount > 0 ? Math.round((typeAnswered / typeCount) * 100) : 0;
      const isCollapsed = panelState.collapsedTypeGroups.has(type);

      const typeGroup = document.createElement('div');
      typeGroup.className = 'type-group' + (isCollapsed ? ' collapsed' : '');

      const typeHeader = document.createElement('div');
      typeHeader.className = 'type-header';
      typeHeader.innerHTML = `
        <div class="type-header-left">
          <div class="type-meta-item">
            <span class="type-meta-label">题目类型</span>
            <span class="type-meta-value">${type}</span>
          </div>
          <div class="type-meta-item">
            <span class="type-meta-label">题目数量</span>
            <span class="type-meta-value">${typeCount}</span>
          </div>
          <div class="type-meta-item">
            <span class="type-meta-label">作答完成率</span>
            <span class="type-meta-value">${typeRate}%</span>
          </div>
        </div>
        <button type="button" class="type-toggle-btn" aria-expanded="${!isCollapsed}">
          ${isCollapsed ? '展开' : '收起'}
        </button>
      `;

      const toggleBtn = typeHeader.querySelector('.type-toggle-btn');
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const collapsed = typeGroup.classList.toggle('collapsed');
        if (collapsed) {
          panelState.collapsedTypeGroups.add(type);
        } else {
          panelState.collapsedTypeGroups.delete(type);
        }
        toggleBtn.textContent = collapsed ? '展开' : '收起';
        toggleBtn.setAttribute('aria-expanded', String(!collapsed));
      });

      const typeQuestions = document.createElement('div');
      typeQuestions.className = 'type-questions';

      list.forEach((q) => {
        const status = getQuestionDotStatus(q);
        const statusText =
          status === 'answered'
            ? '已作答'
            : status === 'self-decision'
              ? '权重相同，需自行决策'
              : status === 'partial'
                ? '部分作答（多选可能不完整）'
                : status === 'failed'
                  ? '自动作答失败'
                  : '未作答';
        const item = document.createElement('div');
        item.className =
          'question-dot ' +
          status +
          (panelState.selectedPreviewQuestionId === q.id ? ' is-preview-active' : '');
        item.textContent = String(q.index);
        item.title = `${q.index}. ${q.type} - ${statusText}`;
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `第${q.index}题，${statusText}`);
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          selectPreviewQuestion(q, true);
        });
        typeQuestions.appendChild(item);
      });
      
      typeGroup.appendChild(typeHeader);
      typeGroup.appendChild(typeQuestions);
      questionByType.appendChild(typeGroup);
    });
  }

  function getModelRequestUrl(model) {
    if (!model) return '';
    if (model.fullUrl && model.requestUrl) {
      return model.requestUrl.replace(/\/$/, '');
    }
    const base = (model.baseUrl || '').replace(/\/$/, '');
    if (!base) return '';
    if (base.endsWith('/chat/completions')) return base;
    return base + '/chat/completions';
  }

  function getAnswerModel() {
    if (!appSettings || !Array.isArray(appSettings.models)) return null;
    const enabled = appSettings.models.filter((m) => m.enabled !== false && m.apiKey);
    if (!enabled.length) return null;

    if (appSettings.selectedModelId) {
      const selected = enabled.find((m) => m.id === appSettings.selectedModelId);
      if (selected) return selected;
    }

    return enabled.find((m) => m.isDefault) || enabled[0];
  }

  function isDeepSeekModel(model) {
    if (!model) return false;
    const hay = [model.provider, model.providerPreset, model.baseUrl, model.model].join(' ').toLowerCase();
    return hay.includes('deepseek');
  }

  function shouldEnableThinking(model) {
    return isDeepSeekModel(model);
  }

  function isSubjectiveQuestionType(typeName) {
    return typeName === '简答题' || typeName === '问答题' || typeName === '论述题';
  }

  function isTextEntryQuestionType(typeName) {
    return typeName === '填空题' || isSubjectiveQuestionType(typeName) || typeName === '计算题';
  }

  function ensureSettingsLoaded() {
    return new Promise((resolve) => {
      if (appSettings && Array.isArray(appSettings.models)) {
        resolve(appSettings);
        return;
      }
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
        appSettings = getDefaultSettings();
        resolve(appSettings);
        return;
      }
      chrome.storage.local.get(['autoDoSettings'], (result) => {
        appSettings = result.autoDoSettings
          ? Object.assign(getDefaultSettings(), result.autoDoSettings)
          : getDefaultSettings();
        if (!Array.isArray(appSettings.models)) appSettings.models = [];
        resolve(appSettings);
      });
    });
  }

  function shouldSkipAnsweredQuestion() {
    const skipEl = document.getElementById('setting-skipAnswered');
    if (skipEl) {
      if (appSettings) appSettings.skipAnswered = skipEl.checked;
      return skipEl.checked;
    }
    return appSettings ? !!appSettings.skipAnswered : false;
  }

  function passesTypeFilter(typeName) {
    const filterEl = document.getElementById('setting-filter');
    const filter = filterEl ? filterEl.value : appSettings?.filter || 'none';
    if (filter === 'none' || filter === 'all') return true;
    const map = { single: '单选题', multi: '多选题', judge: '判断题', fill: '填空题' };
    return map[filter] === typeName;
  }

  function getAnswerDelay() {
    const speedEl = document.getElementById('setting-speed');
    const speed = speedEl ? speedEl.value : appSettings?.speed || 'normal';
    if (speed === 'fast') return 400;
    if (speed === 'slow') return 1500;
    return 800;
  }



  function isUiIconImage(img) {
    const cls = String(img.className || '').toLowerCase();
    const src = String(img.getAttribute('src') || '');
    return (
      cls.includes('icon') ||
      cls.includes('lou') ||
      cls.includes('no_view') ||
      /\/icons?\//i.test(src) ||
      /689dc301e4b07b838da42b38|time_orange|popclose/i.test(src)
    );
  }

  function isQuestionContentImage(img) {
    if (!img) return false;
    const alt = String(img.getAttribute('alt') || '').trim();
    return !isUiIconImage(img) || !!alt;
  }

  function resolveQuestionImageUrl(img, preferRemote) {
    if (!img) return '';
    const original =
      img.getAttribute('data-original') ||
      img.getAttribute('data-src') ||
      img.getAttribute('data-latex') ||
      '';
    const src = String(img.getAttribute('src') || '').trim();
    if (preferRemote && /^https?:\/\//i.test(original)) return original;
    if (src && !/^data:/i.test(src)) {
      try {
        return new URL(src, window.location.href).href;
      } catch (_) {
        return src;
      }
    }
    if (/^https?:\/\//i.test(original)) return original;
    return src;
  }

  function extractImagesFromScopes(scopes, preferRemote) {
    const urls = [];
    const seen = new Set();
    for (const scope of scopes) {
      if (!scope) continue;
      scope.querySelectorAll('img').forEach((img) => {
        if (!isQuestionContentImage(img)) return;
        const url = resolveQuestionImageUrl(img, preferRemote);
        if (!url || seen.has(url)) return;
        seen.add(url);
        urls.push(url);
      });
    }
    return urls;
  }

















  function getQuestionImageScopes(questionEl) {
    if (!questionEl) return [];
    if (isOnZhidaoPlatform()) {
      return Array.from(questionEl.querySelectorAll('.qeustion-content, .option-content, figure'));
    }
    return Array.from(
      questionEl.querySelectorAll('.mark_name, .stem_answer, .answer_p, figure')
    );
  }

  function extractQuestionImages(questionEl) {
    return extractImagesFromScopes(getQuestionImageScopes(questionEl), true);
  }

  function extractStemImages(questionEl) {
    if (!questionEl) return [];
    if (isOnZhidaoPlatform()) {
      const stemScope = questionEl.querySelector('.qeustion-content');
      return stemScope ? extractImagesFromScopes([stemScope], false) : [];
    }
    const stemScope = questionEl.querySelector('.mark_name');
    return stemScope ? extractImagesFromScopes([stemScope], false) : [];
  }

  function questionContainsImageContent(questionEl) {
    if (!questionEl) return false;
    const scopes = getQuestionImageScopes(questionEl);
    for (const scope of scopes) {
      for (const img of scope.querySelectorAll('img')) {
        if (isQuestionContentImage(img)) return true;
      }
      if (scope.querySelector('.edui-upload-video, .edui-faked-video')) return true;
      if (scope.querySelector('[style*="background-image"]')) return true;
    }
    return false;
  }

  const OPTION_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function cleanOptionText(textEl) {
    if (!textEl) return '';
    return (textEl.textContent || textEl.innerText || '')
      .replace(/<br\s*\/?>/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getOptionLabelElement(optionEl, typeName) {
    if (typeName === '多选题') {
      return optionEl.querySelector('.num_option_dx') || optionEl.querySelector('.num_option');
    }
    return optionEl.querySelector('.num_option');
  }

  /**
   * 学习通：页面上看到的是 span.num_option 里的 A/B/C/D；
   * data 属性是提交用内部编码，与显示字母不一致，不能当选项 key。
   */
  function getOptionDisplayLetter(labelEl, index, typeName) {
    if (typeName === '判断题') {
      const dataAttr = (labelEl?.getAttribute('data') || '').trim().toLowerCase();
      if (dataAttr === 'true' || dataAttr === 'false') return dataAttr;
      const text = (labelEl?.textContent || '').trim();
      if (text === '正确') return 'true';
      if (text === '错误') return 'false';
      return dataAttr || text;
    }

    const visible = (labelEl?.textContent || '').replace(/\s+/g, '').trim();
    if (/^[A-Z]$/i.test(visible)) return visible.toUpperCase();

    return OPTION_LABELS[index] || String(index + 1);
  }

  function getOptionSubmitKey(labelEl, displayLetter) {
    const dataAttr = (labelEl?.getAttribute('data') || '').trim();
    return dataAttr || displayLetter;
  }

  function getOptionLabelKey(labelEl, optionEl, index, typeName) {
    return getOptionDisplayLetter(labelEl, index, typeName);
  }

  function extractOptionsFromQuestion(el, typeName) {
    const options = [];
    const optionEls = el.querySelectorAll('.answerBg');
    optionEls.forEach((opt, index) => {
      const label = getOptionLabelElement(opt, typeName);
      const textEl = opt.querySelector('.answer_p');
      const key = getOptionDisplayLetter(label, index, typeName);
      const text = cleanOptionText(textEl);
      const images = textEl ? extractImagesFromScopes([textEl], false) : [];
      options.push({
        key: key,
        submitKey: getOptionSubmitKey(label, key),
        text: text || key,
        images: images,
        index: index,
        element: opt,
      });
    });

    if (typeName === '单选题' || typeName === '多选题') {
      options.sort((a, b) => a.key.localeCompare(b.key));
    }
    return options;
  }

  function findOptionByAnswerKey(questionEl, answerValue, typeName, matchOpts) {
    const opts = matchOpts || {};
    const target = String(answerValue).trim();
    const targetUpper = target.toUpperCase();
    const targetLower = target.toLowerCase();
    const optionEls = questionEl.querySelectorAll('.answerBg');
    const matchBySubmitKey = !!opts.matchBySubmitKey;

    for (let index = 0; index < optionEls.length; index++) {
      const opt = optionEls[index];
      const label = getOptionLabelElement(opt, typeName);
      const displayLetter = getOptionDisplayLetter(label, index, typeName);
      const submitKey = getOptionSubmitKey(label, displayLetter);

      if (typeName === '判断题') {
        const textVal = (label?.textContent || '').trim();
        if (
          displayLetter === targetLower ||
          submitKey === targetLower ||
          (targetLower === 'true' && textVal === '正确') ||
          (targetLower === 'false' && textVal === '错误')
        ) {
          return { opt, displayLetter, submitKey };
        }
        continue;
      }

      if (typeName === '单选题' || typeName === '多选题') {
        if (matchBySubmitKey) {
          if (submitKey.toUpperCase() === targetUpper) {
            return { opt, displayLetter, submitKey };
          }
          continue;
        }
        if (displayLetter.toUpperCase() === targetUpper) {
          return { opt, displayLetter, submitKey };
        }
        continue;
      }

      if (displayLetter.toUpperCase() === targetUpper) {
        return { opt, displayLetter, submitKey };
      }
    }
    return null;
  }

  function extractQuestionContext(q) {
    if (isOnZhidaoPlatform()) {
      return extractZhidaoQuestionContext(q);
    }
    const el = q.element;
    const typeName = q.type;
    const stemEl = el.querySelector('.mark_name');
    let stem = q.title || '';
    if (stemEl) {
      stem = stemEl.innerText.replace(/\s+/g, ' ').trim();
    }

    const options = extractOptionsFromQuestion(el, typeName);
    const fillBlankCount =
      typeName === '填空题' || typeName === '计算题'
        ? getFillBlankEditorIds(el, q.id).length
        : 0;
    const images = extractQuestionImages(el);
    const stemImages = extractStemImages(el);
    return { stem, options, typeName, fillBlankCount, images, stemImages };
  }

  function extractZhidaoQuestionContext(q) {
    const el = q.element;
    const typeName = q.type;
    const stemEl = el.querySelector('.qeustion-content .markdown-latex-container');
    let stem = q.title || '';
    if (stemEl) {
      stem = stemEl.innerText.replace(/\s+/g, ' ').trim();
    }
    const options = extractZhidaoOptions(el);
    const fillBlankCount =
      typeName === '填空题' || typeName === '计算题'
        ? getFillBlankEditorIds(el, q.id).length || el.querySelectorAll('textarea').length
        : 0;
    const images = extractQuestionImages(el);
    const stemImages = extractStemImages(el);
    return { stem, options, typeName, fillBlankCount, images, stemImages };
  }

  function buildFillBlankAnswerFormatHint(blankCount) {
    const count = Math.max(Number(blankCount) || 1, 1);
    if (count <= 1) return '单个文本答案';
    return (
      '按空序逐行输出（共' +
      count +
      '空），格式示例：\n' +
      '第1空:答案1\n' +
      '第2空:答案2\n' +
      '...\n' +
      '第' +
      count +
      '空:答案' +
      count +
      '。某一空答案可包含换行，换行内容仍属于该空，直到下一行「第N空:」为止。不要用竖线、逗号或分号分隔各空。'
    );
  }

  function buildAnswerMessages(ctx) {
    let answerFormat = '填空答案文本';
    const multiBlankCount = ctx.fillBlankCount || 0;
    if (ctx.typeName === '填空题' || (ctx.typeName === '计算题' && multiBlankCount > 1)) {
      answerFormat = buildFillBlankAnswerFormatHint(multiBlankCount || 1);
    }

    const isSubjective =
      ctx.typeName === '简答题' || ctx.typeName === '问答题' || ctx.typeName === '论述题';

    if (ctx.typeName === '单选题') answerFormat = '单个大写字母，如 A';
    else if (ctx.typeName === '多选题')
      answerFormat = '多个大写字母连续拼接，不要加点或空格，例如 AB 或 BCD（不要写成 B、D）';
    else if (ctx.typeName === '判断题') answerFormat = 'true 或 false（小写）';
    else if (ctx.typeName === '计算题') answerFormat = '含计算过程与最终结果，多小问可用分号分隔';
    else if (isSubjective) answerFormat = '可直接粘贴到答题框的文字要点或提纲，不必生成附件';

    let userContent = '请仔细思考后作答。\n\n';
    userContent += '【题型】' + ctx.typeName + '\n';
    userContent += '【题目】' + ctx.stem + '\n';
    if (ctx.options.length) {
      userContent += '【选项】\n';
      ctx.options.forEach((o) => {
        userContent += o.key + '. ' + o.text + '\n';
      });
    }
    if (isSubjective) {
      userContent +=
        '\n仅当题干明确依赖“未提供的外部材料/章节内容/附件内容”且无法从当前题面推出答案时，才返回：' +
        '{"cannotAnswer":true,"reason":"...","answer":""}。' +
        '\n若题目要求上传 PDF、PPT、图纸、视频等附件，或要求完成超出文本框能力的长篇报告，也应返回 cannotAnswer。' +
        '\n若题面本身可直接作答（包括常识性定义题、概念题），必须返回：{"cannotAnswer":false,"reason":"","answer":"..."}。' +
        '\n论述题/简答题的 answer 只需提供可粘贴的要点或提纲，不要输出 JSON 以外内容。';
    } else {
      userContent +=
        '\n请只返回 JSON，格式为 {"answer":"..."}，其中 answer 是最终答案（' +
        answerFormat +
        '），不要输出其他内容。';
    }

    const systemMessage = {
      role: 'system',
      content:
        '你是专业的答题助手。必须认真阅读题干和每个选项，根据知识点推理出正确答案，禁止不看题就猜。' +
        '只返回 JSON，不要 markdown，不要解释过程。',
    };


    return [systemMessage, { role: 'user', content: userContent }];
  }

  function parseCannotAnswerFromRaw(raw) {
    if (!raw) return null;
    const s = String(raw).trim();
    const jsonMatch = s.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed && parsed.cannotAnswer === true) {
        return String(parsed.reason || '题干信息不足，模型无法可靠作答').trim();
      }
    } catch (_) {
      if (/"cannotAnswer"\s*:\s*true/i.test(jsonMatch[0])) {
        const reasonMatch = jsonMatch[0].match(/"reason"\s*:\s*"([^"]*)"/i);
        return reasonMatch ? reasonMatch[1].trim() : '题干信息不足，模型无法可靠作答';
      }
    }
    return null;
  }

  function extractAnswerValueFromText(raw) {
    const s = String(raw || '').trim();
    if (!s) return '';

    const quoted = s.match(/"answer"\s*:\s*"((?:\\.|[^"\\])*)"/i);
    if (quoted) {
      return quoted[1]
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .trim();
    }

    const bare = s.match(/"answer"\s*:\s*(true|false)/i);
    if (bare) return bare[1].trim();

    const jsonMatch = s.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && parsed.answer != null && String(parsed.answer).trim() !== '') {
          return String(parsed.answer).trim();
        }
      } catch (_) {}
    }

    return '';
  }

  function looksLikeCorruptedLetterSoup(text) {
    const t = String(text || '').trim();
    if (!t || /[\u4e00-\u9fa5]/.test(t) || /[|｜，,；;\n]/.test(t)) return false;
    if (!/^[A-Za-z0-9.+\\-\\s]+$/i.test(t)) return false;
    const compact = t.replace(/\s+/g, '');
    if (compact.length < 9) return false;
    if (/^[A-D]{1,8}$/i.test(compact)) return false;
    if (/^(true|false)$/i.test(compact)) return false;
    return /^[A-Z0-9]{9,}$/i.test(compact);
  }

  function parseAnswerFromRaw(raw, ctx) {
    if (!raw) return '';
    let s = String(raw).trim();
    s = s.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

    const fromJsonField = extractAnswerValueFromText(s);
    if (fromJsonField) return fromJsonField;

    const isChoiceType =
      ctx &&
      (ctx.typeName === '单选题' || ctx.typeName === '多选题' || ctx.typeName === '判断题');
    const explicitChoice =
      /(?:故选|应选|最终答案|正确答案|答案)[是为：:\s]+([A-D](?:[、,\s/]+[A-D])*|true|false)/i.test(s);

    if (isChoiceType && s.length > 160 && !explicitChoice) {
      return '';
    }

    const choicePick = s.match(/(?:故选|应选|答案)[是为：:\s]+([A-D](?:[、,\s/]+[A-D])*)/i);
    if (choicePick) {
      return choicePick[1].replace(/[^A-Z]/gi, '').toUpperCase();
    }

    const letterOnly = s.match(/^选项?\s*([A-D])$/i);
    if (letterOnly) return letterOnly[1].toUpperCase();

    if (/^[A-D]{1,8}$/i.test(s)) return s.toUpperCase();
    if (/^(true|false)$/i.test(s)) return s.toLowerCase();

    if (s.length <= 120 && !/\{/.test(s) && !/answer/i.test(s) && !looksLikeCorruptedLetterSoup(s)) {
      return s.trim();
    }

    const lines = s.split('\n').map((line) => line.trim()).filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      const fromLine = extractAnswerValueFromText(line);
      if (fromLine) return fromLine;
      if (/^[A-D]{1,8}$/i.test(line)) return line.toUpperCase();
      if (/^(true|false)$/i.test(line)) return line.toLowerCase();
      if (isChoiceType && line.length > 80) continue;
    }

    return '';
  }

  function getModelReplyForParsing(apiResult) {
    if (!apiResult) return '';
    const content = String(apiResult.contentRaw || '').trim();
    if (content) return content;
    const reply = String(apiResult.reply || '').trim();
    const thinking = String(apiResult.thinking || '').trim();
    if (!reply) return '';
    if (thinking && reply === thinking) return '';
    if (thinking && reply.startsWith(thinking)) {
      return reply.slice(thinking.length).trim();
    }
    return reply;
  }

  function normalizeSingleChoiceAnswer(s, validKeys) {
    const upper = String(s).toUpperCase().trim();
    if (!upper) return '';
    if (validKeys.includes(upper)) return upper;
    if (upper.length === 1 && validKeys.includes(upper)) return upper;
    if (upper.length <= 16) {
      const letters = upper.match(/[A-Z]/g);
      if (letters) {
        for (let i = letters.length - 1; i >= 0; i--) {
          if (validKeys.includes(letters[i])) return letters[i];
        }
      }
    }
    return '';
  }

  function normalizeMultiChoiceAnswer(s, validKeys) {
    const upper = String(s).toUpperCase().replace(/[^A-Z]/g, '');
    if (!upper || upper.length > validKeys.length + 2) return '';
    const chars = upper.split('').filter((c) => validKeys.includes(c));
    const unique = chars.filter((c, i, arr) => arr.indexOf(c) === i).sort();
    return unique.join('');
  }

  function normalizeAIAnswer(raw, ctx) {
    const s = parseAnswerFromRaw(raw, ctx);
    if (!s) {
      console.warn('[AutoDo] normalizeAIAnswer: 无法从模型回复提取答案, raw=', raw);
      return '';
    }

    if (
      (ctx.typeName === '填空题' ||
        ctx.typeName === '计算题' ||
        isSubjectiveQuestionType(ctx.typeName)) &&
      looksLikeCorruptedLetterSoup(s)
    ) {
      console.warn('[AutoDo] normalizeAIAnswer: 疑似乱码答案已丢弃, raw=', raw);
      return '';
    }

    const validKeys = ctx.options.map((o) => String(o.key).toUpperCase());

    if (ctx.typeName === '单选题') {
      return normalizeSingleChoiceAnswer(s, validKeys);
    }

    if (ctx.typeName === '多选题') {
      return normalizeMultiChoiceAnswer(s, validKeys);
    }

    if (ctx.typeName === '判断题') {
      const lower = s.toLowerCase().trim();
      if (/^(true|t|正确|对|是|√|yes|1)$/i.test(lower)) return 'true';
      if (/^(false|f|错误|错|否|×|no|0)$/i.test(lower)) return 'false';
      if (lower === 'true' || lower === 'false') return lower;
      return '';
    }

    return s.replace(/^["'`]+|["'`]+$/g, '').trim();
  }

  function getFillBlankEditorIds(questionEl, questionId) {
    const id = String(questionId || questionEl.getAttribute('data') || questionEl.id.replace('question', ''));
    const ids = [];
    questionEl.querySelectorAll('textarea[id^="answerEditor' + id + '"]').forEach((ta) => {
      if (ta.id) ids.push(ta.id);
    });
    // 简答题等主观题常见为 answer{id}
    questionEl.querySelectorAll('textarea[id^="answer' + id + '"]').forEach((ta) => {
      if (ta.id && ids.indexOf(ta.id) === -1) ids.push(ta.id);
    });
    if (!ids.length) {
      const fallback = document.getElementById('answerEditor' + id + '1');
      if (fallback) ids.push(fallback.id);
    }
    if (!ids.length) {
      const fallbackAnswer = document.getElementById('answer' + id);
      if (fallbackAnswer) ids.push(fallbackAnswer.id);
    }
    ids.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    return ids;
  }

  function getEditorSaveToken(questionId, editorId) {
    const id = String(questionId || '');
    const eid = String(editorId || '');
    if (eid.indexOf('answerEditor' + id) === 0) {
      const suffix = eid.slice(('answerEditor' + id).length) || '1';
      return id + suffix;
    }
    if (eid.indexOf('answer' + id) === 0) {
      return id;
    }
    return id;
  }

  function getFillBlankValueByEditorId(editorId) {
    const ta = document.getElementById(editorId);
    let val = ta && ta.value ? String(ta.value).trim() : '';
    if (!val && typeof UE !== 'undefined' && UE.getEditor) {
      try {
        const ue = UE.getEditor(editorId);
        if (ue && ue.getContentTxt) {
          val = String(ue.getContentTxt() || '').trim();
        }
      } catch (_) {}
    }
    if (!val) {
      try {
        const wrap = ta ? ta.closest('.textDIV, .subEditor, .divText, .Answer') || ta.parentElement : null;
        const iframe = wrap ? wrap.querySelector('iframe') : null;
        const bodyText =
          iframe && iframe.contentWindow && iframe.contentWindow.document && iframe.contentWindow.document.body
            ? String(iframe.contentWindow.document.body.textContent || '').trim()
            : '';
        if (bodyText) val = bodyText;
      } catch (_) {}
    }
    return val;
  }

  function getFillBlankValues(questionEl, questionId) {
    const ids = getFillBlankEditorIds(questionEl, questionId);
    return ids.map((eid) => getFillBlankValueByEditorId(eid));
  }

  function countStemBlankSlots(stemText) {
    const stem = String(stemText || '');
    if (!stem) return 0;
    const slots = stem.match(/（\s*）|\(\s*\)/g);
    return slots ? slots.length : 0;
  }

  function splitFillAnswerByHeuristics(text, blankCount) {
    const source = String(text || '').trim();
    if (!source || blankCount <= 1) return source ? [source] : [];

    const normalized = source
      .replace(/^.*?(?:答案|四种|分别是|依次为)\s*[：:]/, '')
      .replace(/[。]\s*$/, '')
      .trim();

    const separators = [
      /\s*\|\s*/,
      /\s*\/\s*/,
      /\s*、\s*/,
      /\s*；\s*|\s*;\s*/,
      /\s+和\s+|\s+与\s+|\s+及\s+/,
    ];

    for (const sep of separators) {
      const parts = normalized
        .split(sep)
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts.length >= blankCount) {
        return parts.slice(0, blankCount);
      }
    }

    const wsParts = normalized.split(/\s+/).map((s) => s.trim()).filter(Boolean);
    if (wsParts.length >= blankCount) {
      return wsParts.slice(0, blankCount);
    }

    return [normalized];
  }

  function padFillAnswers(values, blankCount) {
    const expected = Math.max(Number(blankCount) || 0, 1);
    const out = Array.isArray(values) ? values.slice() : [];
    while (out.length < expected) out.push('');
    return out.slice(0, expected).map((v) => String(v || '').trim());
  }

  function parseFillBlankLineFormat(text, blankCount) {
    const source = String(text || '').replace(/\r\n/g, '\n').trim();
    if (!source) return null;

    const lines = source.split('\n');
    const headerRe = /^第\s*(\d+)\s*空\s*[：:]\s*(.*)$/;
    const result = [];
    let matchedHeaders = 0;
    let currentIdx = null;
    let currentParts = [];

    const flush = () => {
      if (currentIdx == null) return;
      const val = currentParts.join('\n').trim();
      while (result.length < currentIdx) result.push('');
      result[currentIdx - 1] = val;
    };

    for (const line of lines) {
      const m = line.match(headerRe);
      if (m) {
        flush();
        matchedHeaders += 1;
        currentIdx = Number(m[1]);
        currentParts = m[2] != null && m[2] !== '' ? [m[2]] : [];
      } else if (currentIdx != null) {
        currentParts.push(line);
      }
    }
    flush();

    if (!matchedHeaders) return null;
    return padFillAnswers(result, Math.max(blankCount || 0, result.length, matchedHeaders));
  }

  function parseFillBlankAnswers(answerValue, blankCount, stemText) {
    const text = String(answerValue || '').trim();
    if (!text) return [];
    const cleaned = text.replace(/^答案[：:]\s*/i, '').trim();

    const stemBlankCount = countStemBlankSlots(stemText);
    const expectedCount = Math.max(blankCount || 0, stemBlankCount || 0, 1);

    const lineFormat = parseFillBlankLineFormat(cleaned, expectedCount);
    if (lineFormat && lineFormat.some((v) => v !== '')) {
      return padFillAnswers(lineFormat, expectedCount);
    }

    if (/\|/.test(cleaned)) {
      const parts = cleaned
        .split(/\s*\|\s*/)
        .map((s) => s.trim())
        .filter((v) => v !== '');
      if (parts.length) {
        return padFillAnswers(parts, expectedCount);
      }
    }

    if (expectedCount <= 1) return [cleaned];

    const splitByStem = splitFillAnswerByHeuristics(cleaned, expectedCount);
    if (splitByStem.length >= expectedCount) {
      return padFillAnswers(splitByStem, expectedCount);
    }
    if (splitByStem.length === 1) {
      return padFillAnswers(splitByStem, expectedCount);
    }
    return padFillAnswers(splitByStem, expectedCount);
  }

  function chatCompletionViaBackground(payload) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'chatCompletion', payload: payload }, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!result || !result.ok) {
          reject(new Error(result?.error || 'AI 请求失败'));
          return;
        }
        resolve(result);
      });
    });
  }

  function chatCompletionStreamViaBackground(payload, onProgress) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const port = chrome.runtime.connect({ name: 'autoDoChatStream' });

      const finish = (fn) => {
        if (settled) return;
        settled = true;
        try {
          port.disconnect();
        } catch (_) {}
        fn();
      };

      port.onMessage.addListener((msg) => {
        if (msg.type === 'thinking' || msg.type === 'content') {
          if (onProgress) onProgress(msg);
          return;
        }
        if (msg.type === 'done') {
          finish(() => resolve(msg));
          return;
        }
        if (msg.type === 'error') {
          finish(() => reject(new Error(msg.error || 'AI 请求失败')));
        }
      });

      port.onDisconnect.addListener(() => {
        if (settled) return;
        const err = chrome.runtime.lastError;
        finish(() => reject(new Error(err?.message || '流式连接已断开')));
      });

      port.postMessage({ action: 'start', payload: payload });
    });
  }

  async function chatCompletionRequest(payload, q, onProgress) {
    const useStream =
      typeof onProgress === 'function' && (!!payload.enableThinking || !!payload.useStream);
    if (useStream) {
      return chatCompletionStreamViaBackground(payload, onProgress);
    }
    return chatCompletionViaBackground(payload);
  }

  function isAiRequestTimeoutError(err) {
    const msg = String(err && err.message ? err.message : err || '').trim();
    return msg === '请求超时' || /timeout/i.test(msg) || /超时/.test(msg);
  }

  function promptAiTimeoutContinueWait(options) {
    const opts = options || {};
    return new Promise((resolve) => {
      cancelTimeoutWaitPrompt();
      dismissToast();

      let seconds = 5;
      let settled = false;
      panelState.timeoutWaitPromptActive = true;

      const finish = (choice) => {
        if (settled) return;
        settled = true;
        cancelTimeoutWaitPrompt();
        const runAfter = () => resolve(choice);
        if (toast && toast.parentNode) {
          fadeOutToast(toast, runAfter);
        } else {
          runAfter();
        }
      };

      const qHint = opts.questionIndex != null ? '（第 ' + opts.questionIndex + ' 题）' : '';
      const toast = document.createElement('div');
      toast.className = 'autoDo-toast autoDo-toast--panel autoDo-toast--countdown autoDo-toast--choice';
      toast.innerHTML =
        '<p class="autoDo-toast__text">AI 思考时间较长' +
        qHint +
        '，是否继续等待？<br><span class="autoDo-toast__seconds">' +
        seconds +
        '</span>s 后自动取消等待</p>' +
        '<div class="autoDo-toast__actions">' +
        '<button type="button" class="autoDo-toast__btn autoDo-toast__btn--cancel">取消等待</button>' +
        '<button type="button" class="autoDo-toast__btn autoDo-toast__btn--primary">继续等待</button>' +
        '</div>';
      document.body.appendChild(toast);

      const secEl = toast.querySelector('.autoDo-toast__seconds');
      toast.querySelector('.autoDo-toast__btn--cancel').addEventListener('click', () => {
        finish('cancel');
      });
      toast.querySelector('.autoDo-toast__btn--primary').addEventListener('click', () => {
        finish('continue');
      });

      panelState.timeoutWaitPromptTimer = setInterval(() => {
        seconds -= 1;
        if (secEl) secEl.textContent = String(seconds);
        if (seconds <= 0) {
          finish('cancel');
        }
      }, 1000);
    });
  }

  async function chatCompletionRequestWithTimeoutRetry(payload, q, onProgress) {
    let currentPayload = Object.assign({}, payload);
    while (true) {
      if (
        panelState.shouldStop ||
        (!panelState.singleQuestionAnswering && !panelState.autoAnswering)
      ) {
        throw new Error('用户取消了作答');
      }
      try {
        return await chatCompletionRequest(currentPayload, q, onProgress);
      } catch (err) {
        if (!isAiRequestTimeoutError(err)) {
          throw err;
        }
        console.warn('[AutoDo] AI 请求超时，询问是否继续等待');
        if (q.aiRecord) {
          q.aiRecord.thinkingStreaming = false;
          q.aiRecord.error = '';
          if (panelState.selectedPreviewQuestionId === q.id) {
            renderQuestionPreview(q);
          }
        }
        const choice = await promptAiTimeoutContinueWait({ questionIndex: q.index });
        if (choice !== 'continue') {
          throw new Error('用户取消等待');
        }
        currentPayload = Object.assign({}, currentPayload, {
          timeout: Math.min((currentPayload.timeout || 60) + 60, 300),
        });
        if (q.aiRecord) {
          q.aiRecord.thinkingStreaming = true;
          q.aiRecord.error = '';
          const prefix = q.aiRecord.thinking ? q.aiRecord.thinking + '\n\n' : '';
          q.aiRecord.thinking = prefix + '请求超时，已延长等待时间并继续请求 AI…';
          if (panelState.selectedPreviewQuestionId === q.id) {
            renderQuestionPreview(q);
          }
        }
      }
    }
  }

  async function fetchAIAnswerForQuestion(model, q, targetRecord) {
    const ctx = extractQuestionContext(q);
    const url = getModelRequestUrl(model);
    if (!url) throw new Error('API 地址无效');

    let record = targetRecord;
    if (!record) {
      initStreamingAiRecord(q, model);
      record = q.aiRecord;
    }


    const isSubjective = isSubjectiveQuestionType(ctx.typeName);
    const isCalculation = ctx.typeName === '计算题';

    const basePayload = {
      url: url,
      apiKey: model.apiKey,
      model: model.model,
      messages: buildAnswerMessages(ctx),
      timeout: isSubjective
          ? Math.max(model.timeout || 60, 180)
          : isCalculation
            ? Math.max(model.timeout || 60, 120)
            : model.timeout || 60,
      max_tokens: isSubjective ? 2048 : isCalculation ? 2048 : ctx.typeName === '填空题' ? 1024 : 512,
    };

    const attempts = isSubjective
        ? [
            Object.assign({}, basePayload, {
              max_tokens: 4096,
              jsonMode: true,
              enableThinking: false,
              useStream: true,
            }),
            Object.assign({}, basePayload, {
              max_tokens: 4096,
              jsonMode: false,
              enableThinking: false,
              useStream: true,
            }),
          ]
        : isCalculation
          ? [
              Object.assign({}, basePayload, {
                max_tokens: 2048,
                jsonMode: true,
                enableThinking: false,
                useStream: true,
              }),
              Object.assign({}, basePayload, {
                max_tokens: 2048,
                jsonMode: false,
                enableThinking: false,
                useStream: true,
              }),
            ]
        : [
          Object.assign({}, basePayload, {
            max_tokens: ctx.typeName === '填空题' ? 1024 : 768,
            jsonMode: true,
            enableThinking: false,
            useStream: true,
          }),
          Object.assign({}, basePayload, {
            max_tokens: 2048,
            jsonMode: true,
            enableThinking: shouldEnableThinking(model),
            useStream: true,
          }),
          Object.assign({}, basePayload, {
            max_tokens: 2048,
            jsonMode: false,
            enableThinking: shouldEnableThinking(model),
            useStream: true,
          }),
        ];

    let lastError = null;
    let lastRenderAt = 0;

    const onStreamProgress = (msg) => {
      if (!record.thinking) {
        record.thinking = '正在连接 AI…';
      }
      if (msg.type === 'thinking') {
        record.thinking = msg.thinking || record.thinking + (msg.delta || '');
      } else if (msg.type === 'content') {
        record.rawReply = msg.content || record.rawReply + (msg.delta || '');
        record.contentRaw = record.rawReply;
      }
      record.thinkingStreaming = true;
      record.parsedAnswer = '';
      record.modelName = getModelDisplayName(model);
      record.modelId = model.model;
      record.modelConfigId = model.id;

      const now = Date.now();
      if (panelState.selectedPreviewQuestionId === q.id && now - lastRenderAt > 120) {
        lastRenderAt = now;
        renderQuestionPreview(q);
      }
    };

    for (let i = 0; i < attempts.length; i++) {
      if (
        panelState.shouldStop ||
        (!panelState.singleQuestionAnswering && !panelState.autoAnswering)
      ) {
        throw new Error('用户取消了作答');
      }
      try {
        console.log(
          '[AutoDo] fetchAIAnswer: 题目' +
            q.id +
            ', 尝试' +
            (i + 1) +
            ', 选项(按A-D排序)=',
          ctx.options.map((o) => o.key + ':' + o.text + '(submit=' + o.submitKey + ')').join(' | ')
        );

        if (attempts[i].enableThinking) {
          initStreamingAiRecord(q, model, record);
        }

        const apiResult = await chatCompletionRequestWithTimeoutRetry(attempts[i], q, onStreamProgress);
        const replyForParse = getModelReplyForParsing(apiResult);
        const cannotReason = parseCannotAnswerFromRaw(replyForParse);
        const normalized = normalizeAIAnswer(replyForParse, ctx);
        if (cannotReason && !normalized) {
          const skippedRecord = {
            thinking: apiResult.thinking || record.thinking || '',
            rawReply: apiResult.reply || '',
            contentRaw: apiResult.contentRaw || '',
            parsedAnswer: '',
            modelName: getModelDisplayName(model),
            modelId: model.model,
            modelConfigId: model.id,
            thinkingStreaming: false,
            at: Date.now(),
          };
          Object.assign(record, skippedRecord);
          if (!targetRecord) q.aiRecord = record;
          return {
            skipped: true,
            reason: cannotReason,
            aiRecord: skippedRecord,
          };
        }
        console.log('[AutoDo] fetchAIAnswer: 原始=' + apiResult.reply + ', 解析=' + normalized);
        if (normalized) {
          const resultRecord = {
            thinking: apiResult.thinking || record.thinking || '',
            rawReply: apiResult.reply || '',
            contentRaw: apiResult.contentRaw || '',
            parsedAnswer: normalized,
            modelName: getModelDisplayName(model),
            modelId: model.model,
            modelConfigId: model.id,
            thinkingStreaming: false,
            at: Date.now(),
          };
          if (!targetRecord) q.aiRecord = resultRecord;
          else Object.assign(record, resultRecord);
          return {
            answer: normalized,
            aiRecord: resultRecord,
          };
        }
        lastError = new Error('模型返回内容无法解析');
      } catch (err) {
        lastError = err;
        const errMsg = err && err.message ? err.message : 'AI 请求失败';
        record.thinkingStreaming = false;
        record.error =
          errMsg === '用户取消等待'
            ? '已取消等待'
            : '第' + (i + 1) + '次尝试失败：' + errMsg;
        record.modelName = getModelDisplayName(model);
        record.modelId = model.model;
        record.modelConfigId = model.id;
        record.at = Date.now();
        if (!targetRecord) q.aiRecord = record;
        if (panelState.selectedPreviewQuestionId === q.id) {
          renderQuestionPreview(q);
        }
        console.warn('[AutoDo] fetchAIAnswer 尝试' + (i + 1) + '失败:', err.message);
      }
    }

    throw lastError || new Error('AI 请求失败');
  }

  async function applyAnswerToQuestion(q, answerValue, applyOpts) {
    if (isOnZhidaoPlatform()) {
      return applyZhidaoAnswerToQuestion(q, answerValue, applyOpts);
    }
    const typeName = q.type;
    const matchOpts = applyOpts && applyOpts.matchBySubmitKey ? { matchBySubmitKey: true } : null;
    if (typeName === '单选题' || typeName === '判断题') {
      return setSingleChoiceAnswer(q.element, answerValue, typeName, matchOpts);
    }
    if (typeName === '多选题') {
      return setMultiChoiceAnswer(q.element, answerValue, matchOpts);
    }
    if (isTextEntryQuestionType(typeName)) {
      return setFillBlankAnswer(q.element, answerValue);
    }
    return false;
  }

  async function applyZhidaoAnswerToQuestion(q, answerValue) {
    const typeName = q.type;
    if (typeName === '单选题' || typeName === '判断题') {
      return setZhidaoSingleChoiceAnswer(q.element, answerValue);
    }
    if (typeName === '多选题') {
      return setZhidaoMultiChoiceAnswer(q.element, answerValue);
    }
    if (isTextEntryQuestionType(typeName)) {
      return setZhidaoFillBlankAnswer(q.element, answerValue);
    }
    return false;
  }

  async function recheckAnsweredWithRetry(q, typeName) {
    q.isAnswered = isQuestionAnsweredOnPage(q.element, typeName, q.id);
    if (q.isAnswered) return true;

    const retryDelays = isOnZhidaoPlatform() ? [220, 420] : [180, 320];
    for (const ms of retryDelays) {
      await new Promise((resolve) => setTimeout(resolve, ms));
      q.isAnswered = isQuestionAnsweredOnPage(q.element, typeName, q.id);
      if (q.isAnswered) return true;
    }
    return false;
  }

  async function handleQuestionAnswer(q) {
    const typeName = q.type;
    let answerValue = '';
    let answerSource = '';

    if (appSettings?.multiModelDecision) {
      const rule = getApplicableRule(q);
      if (rule) {
        clearQuestionSelfDecision(q);
        q.aiRecords = null;
        q.multiModelMeta = null;
        const idx = panelState.currentQuestionIndex + 1;
        showToast('多模型思考作答中 (' + idx + '/' + panelState.questions.length + ')…', {
          type: 'info',
          duration: 120000,
        });

        try {
          const decision = await runMultiModelDecision(q, rule);

          if (panelState.selectedPreviewQuestionId === q.id) {
            renderQuestionPreview(q);
          }

          if (decision?.tied) {
            markQuestionSelfDecision(q);
            showToast('第' + idx + '题：多个答案权重相同，需自行决策', {
              type: 'info',
              duration: 4000,
            });
            updateUI();
            return;
          }

          if (decision?.ok && isValidAnswerValue(decision.answer)) {
            answerValue = decision.answer;
            answerSource = 'multi-ai';
            clearQuestionSelfDecision(q);
          } else if (decision?.reason === 'no_models') {
            showToast('第' + idx + '题：无可用模型参与作答', { type: 'error', duration: 4000 });
            markQuestionFailed(q);
            updateUI();
            return;
          } else {
            markQuestionFailed(q);
            showToast('第' + idx + '题：多模型未能得出答案', { type: 'error', duration: 4000 });
            updateUI();
            return;
          }
        } catch (err) {
          markQuestionFailed(q);
          showToast('第' + idx + '题多模型失败：' + (err.message || '未知错误'), {
            type: 'error',
            duration: 4000,
          });
          updateUI();
          return;
        }

        if (panelState.shouldStop || (!panelState.singleQuestionAnswering && !panelState.autoAnswering)) {
          return;
        }

        if (answerValue) {
          console.log('[AutoDo]   多模型应用答案=' + answerValue);
          const applied = await applyAnswerToQuestion(q, answerValue, { matchBySubmitKey: false });
          if (isTextEntryQuestionType(typeName)) {
            await new Promise((resolve) => setTimeout(resolve, 260));
          }
          await recheckAnsweredWithRetry(q, typeName);
          if (typeName === '多选题') {
            updateMultiChoiceResultState(q, answerValue);
          }
          if (q.isAnswered && !panelState.partialQuestionIds.has(q.id)) {
            clearQuestionFailed(q);
            clearQuestionPartial(q);
          } else if (panelState.partialQuestionIds.has(q.id)) {
            clearQuestionFailed(q);
          } else if (applied) {
            markQuestionPartial(q);
          } else {
            markQuestionFailed(q);
          }
          updateUI();
        }
        return;
      }
    }

    const model = getAnswerModel();

    if (model) {
      const idx = panelState.currentQuestionIndex + 1;
      showToast('AI 思考作答中 (' + idx + '/' + panelState.questions.length + ')…', {
        type: 'info',
        duration: 60000,
      });
      initStreamingAiRecord(q, model);
      try {
        const aiResult = await fetchAIAnswerForQuestion(model, q);
        if (aiResult && aiResult.skipped) {
          clearQuestionFailed(q);
          q.aiRecord = Object.assign({}, aiResult.aiRecord || {}, {
            error: '已跳过：' + (aiResult.reason || '题干信息不足，无法可靠作答'),
          });
          q.isAnswered = isQuestionAnsweredOnPage(q.element, typeName, q.id);
          if (panelState.selectedPreviewQuestionId === q.id) {
            renderQuestionPreview(q);
          }
          showToast('第' + idx + '题已跳过：' + (aiResult.reason || '题干信息不足'), {
            type: 'info',
            duration: 3200,
          });
          updateUI();
          return;
        }
        if (aiResult && aiResult.answer) {
          answerValue = aiResult.answer;
          q.aiRecord = aiResult.aiRecord;
          answerSource = 'ai';
          if (panelState.selectedPreviewQuestionId === q.id) {
            renderQuestionPreview(q);
          }
        }
      } catch (err) {
        console.warn('[AutoDo] AI 作答失败:', err.message);
        q.aiRecord = Object.assign({}, q.aiRecord || {}, {
          error: err.message,
          thinkingStreaming: false,
          modelName: getModelDisplayName(model),
          modelId: model.model,
          at: Date.now(),
        });
        if (panelState.selectedPreviewQuestionId === q.id) {
          renderQuestionPreview(q);
        }
        showToast('第' + idx + '题 AI 失败：' + err.message, { type: 'error', duration: 4000 });
      }
    }

    if (panelState.shouldStop || (!panelState.singleQuestionAnswering && !panelState.autoAnswering)) return;

    if (!answerValue && !model) {
      const answerInput = document.getElementById('answer' + q.id);
      if (answerInput && answerInput.value) {
        answerValue = answerInput.value;
        answerSource = 'hidden';
        console.log('[AutoDo] 无 AI 模型, 使用页面隐藏答案: ' + answerValue);
      }
    } else if (!answerValue && model) {
      console.warn('[AutoDo] 已配置 AI 但本题未得到有效答案, 不使用隐藏答案');
    }

    if (!answerValue) {
      markQuestionFailed(q);
      console.log('[AutoDo]   无可用答案, 标记失败');
      updateUI();
      return;
    }

    console.log('[AutoDo]   应用答案=' + answerValue + ' (来源: ' + (answerSource || 'unknown') + ')');
    const applied = await applyAnswerToQuestion(q, answerValue, {
      matchBySubmitKey: answerSource === 'hidden',
    });

    if (isTextEntryQuestionType(typeName)) {
      await new Promise((resolve) => setTimeout(resolve, 260));
    }
    await recheckAnsweredWithRetry(q, typeName);
    if (typeName === '多选题') {
      updateMultiChoiceResultState(q, answerValue);
    }

    if (q.isAnswered && !panelState.partialQuestionIds.has(q.id)) {
      clearQuestionFailed(q);
      panelState.answeredCount = panelState.questions.filter((item) => {
        return isQuestionAnsweredOnPage(item.element, item.type, item.id);
      }).length;
      console.log('[AutoDo]   答题成功', applied ? '' : '(选项点击可能未全部生效)');
    } else if (panelState.partialQuestionIds.has(q.id)) {
      clearQuestionFailed(q);
      panelState.answeredCount = panelState.questions.filter((item) => {
        return isQuestionAnsweredOnPage(item.element, item.type, item.id);
      }).length;
      console.log('[AutoDo]   多选题部分作答, 标记浅黄色');
    } else {
      markQuestionFailed(q);
      console.log('[AutoDo]   自动作答失败, 标记红色');
    }
    updateUI();
  }

  function getAnswerForQuestion(questionEl, typeName) {
    if (isOnZhidaoPlatform()) {
      return getZhidaoAnswerForQuestion(questionEl, typeName);
    }
    console.log('[AutoDo] getAnswerForQuestion: 获取答案, 题型=' + typeName);
    if (typeName === '单选题') {
      const selected = questionEl.querySelector('.answerBg[aria-checked="true"]');
      if (selected) {
        const options = questionEl.querySelectorAll('.answerBg');
        for (let i = 0; i < options.length; i++) {
          if (options[i] === selected) {
            const label = selected.querySelector('.num_option');
            const ans = getOptionLabelKey(label, selected, i, typeName);
            console.log('[AutoDo]   单选题答案:', ans);
            return ans;
          }
        }
      }
      console.log('[AutoDo]   单选题: 未选中任何选项');
      return '';
    } else if (typeName === '多选题') {
      const allOpts = questionEl.querySelectorAll('.answerBg');
      const answers = [];
      allOpts.forEach((opt, i) => {
        if (!isMultiOptionChecked(opt)) return;
        const label = opt.querySelector('.num_option_dx') || opt.querySelector('.num_option');
        answers.push(getOptionLabelKey(label, opt, i, typeName));
      });
      const joined = answers.join('');
      console.log('[AutoDo]   多选题答案:', joined);
      return joined;
    } else if (typeName === '判断题') {
      const selected = questionEl.querySelector('.answerBg[aria-checked="true"]');
      if (selected) {
        const options = questionEl.querySelectorAll('.answerBg');
        for (let i = 0; i < options.length; i++) {
          if (options[i] === selected) {
            const label = selected.querySelector('.num_option');
            const ans = getOptionLabelKey(label, selected, i, typeName);
            console.log('[AutoDo]   判断题答案:', ans);
            return ans;
          }
        }
      }
      console.log('[AutoDo]   判断题: 未选中任何选项');
      return '';
    } else if (typeName === '填空题') {
      const id = questionEl.getAttribute('data') || questionEl.id.replace('question', '');
      const vals = getFillBlankValues(questionEl, id);
      const ans = vals.join('|');
      console.log('[AutoDo]   填空题答案:', ans);
      return ans;
    } else if (isTextEntryQuestionType(typeName) && typeName !== '填空题') {
      const id = questionEl.getAttribute('data') || questionEl.id.replace('question', '');
      const vals = getFillBlankValues(questionEl, id);
      const ans = vals.join('\n').trim();
      console.log('[AutoDo]   文本题答案:', ans);
      return ans;
    }
    console.log('[AutoDo]   未知题型(' + typeName + '), 返回空');
    return '';
  }

  function setSingleChoiceAnswer(questionEl, answerValue, typeName, matchOpts) {
    const qType = typeName || questionEl.getAttribute('typename') || '单选题';
    console.log('[AutoDo] setSingleChoiceAnswer: 开始答题, 答案=' + answerValue + ', 题型=' + qType);

    const found = findOptionByAnswerKey(questionEl, answerValue, qType, matchOpts);
    if (!found) {
      console.warn('[AutoDo]   未找到匹配选项, 答案=' + answerValue);
      return false;
    }

    const { opt, displayLetter, submitKey } = found;
    const label = getOptionLabelElement(opt, qType);
    console.log(
      '[AutoDo]   匹配选项 显示字母=' +
        displayLetter +
        ', 提交编码=' +
        submitKey +
        ', 内容=' +
        cleanOptionText(opt.querySelector('.answer_p'))
    );

    const isChecked =
      opt.getAttribute('aria-checked') === 'true' ||
      (label &&
        (label.classList.contains('check_answer') || label.classList.contains('check_answer_dx')));
    if (isChecked) {
      console.log('[AutoDo]   选项已选中, 无需重复点击');
      return true;
    }
    if (typeof addChoice === 'function') {
      console.log('[AutoDo]   调用 addChoice() 答题');
      addChoice(opt);
    } else {
      console.log('[AutoDo]   addChoice 不可用, 使用 click()');
      opt.click();
    }
    return true;
  }

  function toggleMultiChoiceOption(opt) {
    if (typeof addMultipleChoice === 'function') {
      addMultipleChoice(opt);
      return;
    }
    if (typeof addChoice === 'function') {
      addChoice(opt);
      return;
    }
    opt.click();
  }

  async function setMultiChoiceAnswer(questionEl, answerValue, matchOpts) {
    const normalized = String(answerValue || '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
    const letters = normalized.split('').filter((c, i, arr) => arr.indexOf(c) === i);
    console.log('[AutoDo] setMultiChoiceAnswer: 开始答题, 答案=' + letters.join(''));

    if (!letters.length) {
      return false;
    }

    const picked = new Set();
    let clicked = 0;

    for (const letter of letters) {
      const found = findOptionByAnswerKey(questionEl, letter, '多选题', matchOpts);
      if (!found || picked.has(found.opt)) continue;
      picked.add(found.opt);

      const { opt, displayLetter } = found;
      if (!isMultiOptionChecked(opt)) {
        console.log('[AutoDo]   勾选选项' + displayLetter);
        toggleMultiChoiceOption(opt);
        clicked += 1;
        await new Promise((resolve) => setTimeout(resolve, 120));
      } else {
        console.log('[AutoDo]   选项' + displayLetter + ' 已选中');
      }
    }

    const selectedCount = countMultiSelectedOnPage(questionEl);
    console.log('[AutoDo] setMultiChoiceAnswer: 已选' + selectedCount + '/' + letters.length);
    return selectedCount > 0;
  }

  function setFillEditorValueByIframe(editorId, value) {
    try {
      if (typeof UE !== 'undefined' && UE.getEditor) {
        const ue = UE.getEditor(editorId);
        const ueIframe = ue && ue.iframe;
        const ueBody =
          ueIframe &&
          ueIframe.contentWindow &&
          ueIframe.contentWindow.document &&
          ueIframe.contentWindow.document.body;
        if (ueBody) {
          ueBody.innerHTML = '<p>' + String(value || '').replace(/\n/g, '</p><p>') + '</p>';
          return true;
        }
      }

      const ta = document.getElementById(editorId);
      if (!ta) return false;
      const wrap = ta.closest('.textDIV, .subEditor, .divText, .Answer, .stem_answer') || ta.parentElement;
      const iframe = wrap ? wrap.querySelector('iframe') : null;
      if (!iframe || !iframe.contentWindow || !iframe.contentWindow.document) return false;
      const body = iframe.contentWindow.document.body;
      if (!body) return false;
      body.innerHTML = '<p>' + String(value || '').replace(/\n/g, '</p><p>') + '</p>';
      return true;
    } catch (_) {
      return false;
    }
  }

  async function setFillEditorValue(editorId, value) {
    const editor = document.getElementById(editorId);
    if (!editor) return false;

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    nativeInputValueSetter.call(editor, value);
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    editor.dispatchEvent(new Event('change', { bubbles: true }));

    let ueApplied = false;
    if (typeof UE !== 'undefined' && UE.getEditor) {
      try {
        const ue = UE.getEditor(editorId);
        if (ue) {
          if (!ue.isReady && ue.addListener) {
            await new Promise((resolve) => {
              let done = false;
              const finish = () => {
                if (done) return;
                done = true;
                resolve();
              };
              try {
                ue.addListener('ready', finish);
              } catch (_) {}
              setTimeout(finish, 1200);
            });
          }
          const applyToUE = () => {
            try {
              if (ue.setContent) {
                const html = String(value || '')
                  .split(/\n+/)
                  .map((line) => '<p>' + line + '</p>')
                  .join('');
                ue.setContent(html || value);
              }
              if (ue.fireEvent) ue.fireEvent('contentChange');
              ueApplied = true;
            } catch (_) {}
          };

          applyToUE();
        }
      } catch (_) {}
    }

    const iframeApplied = setFillEditorValueByIframe(editorId, value);
    return ueApplied || iframeApplied || true;
  }

  async function setFillBlankAnswer(questionEl, answerValue) {
    const id = questionEl.getAttribute('data') || questionEl.id.replace('question', '');
    const editorIds = getFillBlankEditorIds(questionEl, id);
    if (!editorIds.length) {
      console.warn('[AutoDo]   未找到填空编辑器: answerEditor' + id + '*');
      return false;
    }

    const stemText = questionEl.querySelector('.mark_name')?.innerText || '';
    const answers = parseFillBlankAnswers(answerValue, editorIds.length, stemText);
    console.log('[AutoDo] setFillBlankAnswer: 题目' + id + ', 分空答案=', answers);

    for (let i = 0; i < editorIds.length; i++) {
      const eid = editorIds[i];
      const val = String(answers[i] || '');
      await setFillEditorValue(eid, val);

      if (typeof registerUnSaveBtn === 'function') {
        const saveToken = getEditorSaveToken(id, eid);
        try {
          registerUnSaveBtn(saveToken);
        } catch (_) {}
      }

      if (typeof saveQuestion === 'function') {
        const saveToken = getEditorSaveToken(id, eid);
        try {
          saveQuestion(id, saveToken);
          // 部分页面保存有异步校验，补一次可显著提高主观题落盘成功率
          setTimeout(() => {
            try {
              saveQuestion(id, saveToken);
            } catch (_) {}
          }, 180);
        } catch (_) {}
      }

      await new Promise((resolve) => setTimeout(resolve, 120));
    }

    return true;
  }

  async function reAnswerSingleQuestion() {
    if (panelState.singleQuestionAnswering) {
      panelState.singleQuestionAnswering = false;
      updateReanswerButton(panelState.questions.find((item) => item.id === panelState.selectedPreviewQuestionId));
      dismissToast();
      showToast('已取消当前题目的作答', { type: 'info', duration: 2000 });
      panelState.shouldStop = true;
      setTimeout(() => { panelState.shouldStop = false; }, 500);
      return;
    }

    if (panelState.autoAnswering) {
      showToast('批量答题中，请等待完成', { type: 'info' });
      return;
    }

    const q = panelState.questions.find((item) => item.id === panelState.selectedPreviewQuestionId);
    if (!q) {
      showToast('请先在题目列表中选择一道题目', { type: 'info' });
      return;
    }

    await ensureSettingsLoaded();
    readAnswerSettingsFromUI();

    q.aiRecord = null;
    q.aiRecords = null;
    q.multiModelMeta = null;
    q.isAnswered = false;
    q.needsSelfDecision = false;
    panelState.failedQuestionIds.delete(q.id);
    panelState.partialQuestionIds.delete(q.id);
    panelState.selfDecisionQuestionIds.delete(q.id);
    renderQuestionPreview(q);
    updateUI();

    const model = getAnswerModel();
    const hasHidden = document.getElementById('answer' + q.id);
    const multiEnabled = appSettings?.multiModelDecision;
    const enabledModelCount = (appSettings?.models || []).filter(
      (m) => m.enabled !== false && m.apiKey
    ).length;
    if (
      !multiEnabled &&
      !model &&
      !(hasHidden && hasHidden.value)
    ) {
      showToast('未配置 AI 模型且页面无内置答案，无法作答', { type: 'error', duration: 4000 });
      return;
    }
    if (multiEnabled && enabledModelCount < 2) {
      showToast('多模型决策需要至少 2 个已启用的模型', { type: 'error', duration: 4000 });
      return;
    }

    panelState.singleQuestionAnswering = true;
    updateReanswerButton(q);

    dismissToast();
    showToast('正在作答第 ' + q.index + ' 题…', { type: 'info', duration: 60000 });

    try {
      const savedIndex = panelState.currentQuestionIndex;
      panelState.currentQuestionIndex = q.index - 1;
      await handleQuestionAnswer(q);
      panelState.currentQuestionIndex = savedIndex;
    } catch (err) {
      markQuestionFailed(q);
      console.error('[AutoDo] 单题作答异常:', err);
    }

    panelState.singleQuestionAnswering = false;
    panelState.shouldStop = false;
    updateReanswerButton(q);
    dismissToast();

    if (!panelState.questions.some((item) => item.id === panelState.selectedPreviewQuestionId)) {
      return;
    }

    q.isAnswered = isQuestionAnsweredOnPage(q.element, q.type, q.id);
    if (q.isAnswered) {
      clearQuestionFailed(q);
      showToast('第 ' + q.index + ' 题作答成功', { type: 'success', duration: 2500 });
    } else {
      markQuestionFailed(q);
      showToast('第 ' + q.index + ' 题作答失败，请检查页面', { type: 'error', duration: 4000 });
    }

    scanQuestions();
  }

  async function startAutoAnswer(options) {
    const opts = options || {};
    console.log('[AutoDo] startAutoAnswer: 开始自动答题');

    if (panelState.countdownActive) {
      cancelAutoAnswerCountdown(true);
    }

    if (panelState.autoAnswering) {
      console.warn('[AutoDo]   已在答题中，跳过');
      if (!opts.fromCountdown) {
        showToast('正在答题中，请勿重复操作', { type: 'info' });
      }
      return;
    }

    await ensureSettingsLoaded();
    readAnswerSettingsFromUI();

    if (panelState.questions.length === 0) {
      console.log('[AutoDo]   questions为空，重新扫描');
      scanQuestions();
      if (panelState.questions.length === 0) {
        console.warn('[AutoDo]   扫描后仍无题目');
        showToast('未检测到题目', { type: 'error' });
        return;
      }
    }

    const model = getAnswerModel();
    if (!model) {
      const hasHidden = panelState.questions.some((q) => {
        const input = document.getElementById('answer' + q.id);
        return input && input.value;
      });
      if (!hasHidden) {
        showToast('请先在设置中添加、启用并选中 AI 模型（如 DeepSeek）', { type: 'error', duration: 5000 });
        return;
      }
      showToast('未配置 AI 模型，将使用页面内置答案', { type: 'info', duration: 3000 });
    } else {
      console.log('[AutoDo]   使用模型:', model.name || model.model, model.model);
    }

    dismissToast();

    panelState.autoAnswering = true;
    panelState.currentQuestionIndex = 0;
    panelState.shouldStop = false;
    panelState.failedQuestionIds = new Set();

    updateReanswerButton(panelState.questions.find((item) => item.id === panelState.selectedPreviewQuestionId));

    document.getElementById('autoDo-startBtn').style.display = 'none';
    document.getElementById('autoDo-stopBtn').style.display = 'flex';
    
    console.log('[AutoDo]   状态已更新, 开始处理第1题');
    updateUI();
    processNextQuestion();
  }

  function stopAutoAnswer() {
    console.log('[AutoDo] stopAutoAnswer: 用户请求停止答题');
    panelState.shouldStop = true;
    console.log('[AutoDo]   已设置 shouldStop=true, 等待当前题目处理完成');
  }

  async function processNextQuestion() {
    if (!panelState.autoAnswering || panelState.shouldStop) {
      console.log('[AutoDo] processNextQuestion: 停止条件触发');
      finishAutoAnswer();
      return;
    }

    const q = panelState.questions[panelState.currentQuestionIndex];
    if (!q) {
      console.log('[AutoDo] processNextQuestion: 答题完成');
      finishAutoAnswer();
      return;
    }

    console.log(
      '[AutoDo] processNextQuestion: 处理第' +
        (panelState.currentQuestionIndex + 1) +
        '/' +
        panelState.questions.length +
        '题, id=' +
        q.id +
        ', 题型=' +
        q.type
    );
    selectPreviewQuestion(q, false);
    updateUI();

    if (appSettings && appSettings.answerFollow && q.element) {
      q.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    q.isAnswered = isQuestionAnsweredOnPage(q.element, q.type, q.id);

    const skipAnswered = shouldSkipAnsweredQuestion();
    console.log('[AutoDo]   页面已答=' + q.isAnswered + ', 跳过已答设置=' + skipAnswered);

    if (q.isAnswered && skipAnswered) {
      clearQuestionFailed(q);
      console.log('[AutoDo]   题目已作答且开启跳过, 跳过');
    } else {
      if (!passesTypeFilter(q.type)) {
        console.log('[AutoDo]   题型过滤跳过: ' + q.type);
      } else {
        try {
          await handleQuestionAnswer(q);
        } catch (err) {
          console.error('[AutoDo]   作答异常:', err);
          markQuestionFailed(q);
          showToast('第' + (panelState.currentQuestionIndex + 1) + '题异常：' + err.message, {
            type: 'error',
            duration: 4000,
          });
        }
      }
    }

    panelState.currentQuestionIndex++;

    setTimeout(() => {
      processNextQuestion();
    }, getAnswerDelay());
  }

  function finishAutoAnswer() {
    console.log('[AutoDo] finishAutoAnswer: 答题结束');
    panelState.autoAnswering = false;
    panelState.currentQuestionIndex = undefined;

    const total = panelState.questions.length;
    const selfDecisionCount = panelState.selfDecisionQuestionIds.size;
    const completedCount = total - selfDecisionCount;

    document.getElementById('autoDo-startBtn').style.display = 'flex';
    document.getElementById('autoDo-stopBtn').style.display = 'none';

    dismissToast();
    scanQuestions();
    updateReanswerButton(panelState.questions.find((item) => item.id === panelState.selectedPreviewQuestionId));

    let toastMsg = '作答结束，请自行检查后提交';
    if (appSettings?.multiModelDecision && selfDecisionCount > 0) {
      toastMsg =
        '已完成 ' +
        completedCount +
        ' 题，' +
        selfDecisionCount +
        ' 题权重相同需自行决策，请检查后提交';
    } else if (appSettings?.multiModelDecision) {
      toastMsg = '已完成 ' + completedCount + ' 题，请自行检查后提交';
    }

    showToast(toastMsg, { type: 'success', duration: 6000 });
    console.log('[AutoDo] finishAutoAnswer: 完成');
  }

  function showAllAnswers() {
    console.log('[AutoDo] showAllAnswers: 显示所有答案');
    if (panelState.questions.length === 0) {
      console.log('[AutoDo]   questions为空, 先扫描');
      scanQuestions();
    }

    let shownCount = 0;
    panelState.questions.forEach((q) => {
      const answerInput = document.getElementById('answer' + q.id);
      if (answerInput && answerInput.value) {
        const answerDisplay = q.element.querySelector('.mark_name');
        if (answerDisplay) {
          const existing = q.element.querySelector('.autoDo-answer-hint');
          if (existing) existing.remove();

          const hint = document.createElement('div');
          hint.className = 'autoDo-answer-hint';
          hint.style.cssText = 'margin: 8px 20px; padding: 8px 12px; background: #eef2ff; border-radius: 8px; border-left: 3px solid #667eea; font-size: 13px; color: #4338ca;';
          hint.textContent = '🔑 答案：' + answerInput.value;
          q.element.querySelector('.stem_answer').after(hint);
          shownCount++;
        } else {
          console.warn('[AutoDo]   题目' + q.id + ' 未找到 .mark_name 元素');
        }
      }
    });

    console.log('[AutoDo] showAllAnswers: 已显示' + shownCount + '个答案');
    showToast('已显示所有答案标注', { type: 'info' });
  }

  function clearAllAnswers() {
    console.log('[AutoDo] clearAllAnswers: 清空所有答案');
    if (panelState.questions.length === 0) {
      console.log('[AutoDo]   questions为空, 先扫描');
      scanQuestions();
    }

    const hints = document.querySelectorAll('.autoDo-answer-hint');
    console.log('[AutoDo]   移除' + hints.length + '个答案标注');
    hints.forEach((h) => h.remove());

    let clearedCount = 0;
    panelState.questions.forEach((q) => {
      const typeName = q.type;
      if (typeName === '单选题' || typeName === '判断题') {
        const selected = q.element.querySelector('.answerBg[aria-checked="true"]');
        if (selected) {
          if (typeof addChoice === 'function') {
            console.log('[AutoDo]   题目' + q.id + '(' + typeName + '): 调用 addChoice 取消选中');
            addChoice(selected);
            clearedCount++;
          } else {
            console.warn('[AutoDo]   题目' + q.id + ': addChoice 不可用, 无法取消选中');
          }
        } else {
          console.log('[AutoDo]   题目' + q.id + '(' + typeName + '): 未选中任何选项, 跳过');
        }
      } else if (typeName === '多选题') {
        const allOpts = q.element.querySelectorAll('.answerBg');
        let cleared = 0;
        allOpts.forEach((opt) => {
          if (!isMultiOptionChecked(opt)) return;
          console.log('[AutoDo]   题目' + q.id + '(多选题): 取消选中一项');
          toggleMultiChoiceOption(opt);
          cleared += 1;
        });
        if (cleared > 0) clearedCount++;
      } else if (typeName === '填空题') {
        const id = q.id;
        const editor = document.getElementById('answerEditor' + id + '1');
        if (editor) {
          console.log('[AutoDo]   题目' + id + '(填空题): 清空编辑器');
          editor.value = '';
          editor.dispatchEvent(new Event('input', { bubbles: true }));
          if (typeof UE !== 'undefined' && UE.getEditor) {
            const ue = UE.getEditor('answerEditor' + id + '1');
            if (ue && ue.setContent) {
              ue.setContent('');
              console.log('[AutoDo]   UE.setContent 已清空');
            }
          }
          clearedCount++;
        } else {
          console.warn('[AutoDo]   题目' + id + ': 未找到编辑器');
        }
      } else {
        console.warn('[AutoDo]   题目' + q.id + ': 未知题型(' + typeName + '), 跳过清空');
      }
    });

    console.log('[AutoDo] clearAllAnswers: 已清空' + clearedCount + '道题');
    scanQuestions();
    showToast('已清空所有答案', { type: 'info' });
  }

  function cancelPreviewPrompt() {
    if (panelState.previewPromptTimer) {
      clearInterval(panelState.previewPromptTimer);
      panelState.previewPromptTimer = null;
    }
    panelState.previewPromptActive = false;
  }

  function cancelTimeoutWaitPrompt() {
    if (panelState.timeoutWaitPromptTimer) {
      clearInterval(panelState.timeoutWaitPromptTimer);
      panelState.timeoutWaitPromptTimer = null;
    }
    panelState.timeoutWaitPromptActive = false;
  }

  function dismissToast() {
    cancelPreviewPrompt();
    cancelTimeoutWaitPrompt();
    if (panelState.countdownTimer) {
      clearInterval(panelState.countdownTimer);
      panelState.countdownTimer = null;
    }
    panelState.countdownActive = false;
    const existing = document.querySelector('.autoDo-toast');
    if (existing) existing.remove();
  }

  function fadeOutToast(toast, onDone) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('autoDo-toast--leaving');
    setTimeout(() => {
      toast.remove();
      if (onDone) onDone();
    }, 300);
  }

  function showToast(message, options) {
    const opts = typeof options === 'string' ? { type: options } : options || {};
    const type = opts.type || 'info';
    const duration = opts.duration !== undefined ? opts.duration : 4000;

    dismissToast();

    const toast = document.createElement('div');
    toast.className = 'autoDo-toast autoDo-toast--panel autoDo-toast--' + type;
    toast.innerHTML = '<p class="autoDo-toast__text">' + message + '</p>';
    document.body.appendChild(toast);
    console.log('[AutoDo] showToast:', message, type);

    if (duration > 0) {
      setTimeout(() => fadeOutToast(toast), duration);
    }
    return toast;
  }

  function cancelAutoAnswerCountdown(silent) {
    if (!silent) {
      panelState.autoStartCancelled = true;
    }
    if (panelState.countdownTimer) {
      clearInterval(panelState.countdownTimer);
      panelState.countdownTimer = null;
    }
    panelState.countdownActive = false;
    dismissToast();
    if (!silent) {
      console.log('[AutoDo] 用户取消自动作答倒计时');
    }
  }

  function showFullPaperPreviewPrompt(onComplete) {
    const done = typeof onComplete === 'function' ? onComplete : function () {};

    if (panelState.previewPromptActive || panelState.fullPreviewPromptOffered) {
      done();
      return;
    }

    const previewBtn = findFullPaperPreviewButton();
    if (!shouldOfferFullPaperPreviewPrompt() || !previewBtn) {
      panelState.fullPreviewPromptOffered = true;
      done();
      return;
    }

    dismissToast();
    panelState.fullPreviewPromptOffered = true;
    panelState.previewPromptActive = true;

    let seconds = 5;
    let settled = false;

    const finish = (choice) => {
      if (settled) return;
      settled = true;
      if (panelState.previewPromptTimer) {
        clearInterval(panelState.previewPromptTimer);
        panelState.previewPromptTimer = null;
      }
      panelState.previewPromptActive = false;

      const runAfter = () => {
        if (choice === 'yes') {
          clickFullPaperPreviewButton(previewBtn);
          setTimeout(() => {
            if (!panelState.countdownOffered && !panelState.previewPromptActive) {
              done();
            }
          }, 2500);
          return;
        }
        done();
      };

      if (toast.parentNode) {
        fadeOutToast(toast, runAfter);
      } else {
        runAfter();
      }
    };

    const toast = document.createElement('div');
    toast.className = 'autoDo-toast autoDo-toast--panel autoDo-toast--countdown autoDo-toast--choice';
    toast.innerHTML =
      '<p class="autoDo-toast__text">检测到「整卷预览」，是否在' +
      '<span class="autoDo-toast__seconds">' +
      seconds +
      '</span>s 内切换？超时将保持分题模式' +
      '</p>' +
      '<div class="autoDo-toast__actions">' +
      '<button type="button" class="autoDo-toast__btn autoDo-toast__btn--cancel">否</button>' +
      '<button type="button" class="autoDo-toast__btn autoDo-toast__btn--primary">是，切换</button>' +
      '</div>';
    document.body.appendChild(toast);

    const secEl = toast.querySelector('.autoDo-toast__seconds');
    toast.querySelector('.autoDo-toast__btn--cancel').addEventListener('click', () => {
      console.log('[AutoDo] 用户选择不切换整卷预览');
      finish('no');
    });
    toast.querySelector('.autoDo-toast__btn--primary').addEventListener('click', () => {
      console.log('[AutoDo] 用户选择切换整卷预览');
      finish('yes');
    });

    console.log('[AutoDo] 显示整卷预览询问');

    panelState.previewPromptTimer = setInterval(() => {
      seconds -= 1;
      if (secEl) secEl.textContent = String(seconds);
      if (seconds <= 0) {
        console.log('[AutoDo] 整卷预览询问超时，保持分题模式');
        finish('timeout');
      }
    }, 1000);
  }

  function showAutoAnswerCountdown(options) {
    const opts = options || {};
    if (
      panelState.autoAnswering ||
      panelState.autoStartCancelled ||
      panelState.countdownActive
    ) {
      return;
    }

    const isExam = opts.exam === true || panelState.isExamPage;
    dismissToast();

    let seconds = 5;
    panelState.countdownActive = true;

    const messageSuffix = isExam
      ? '后即将开始自动作答，若不想自动作答请按取消'
      : '后即将开始自动作答，若不想自动作答请按取消';
    const messagePrefix = isExam ? '检测到考试页面，' : '';

    const toast = document.createElement('div');
    toast.className = 'autoDo-toast autoDo-toast--panel autoDo-toast--countdown';
    toast.innerHTML =
      '<p class="autoDo-toast__text">' +
      messagePrefix +
      '<span class="autoDo-toast__seconds">' +
      seconds +
      '</span>s' +
      messageSuffix +
      '</p>' +
      '<button type="button" class="autoDo-toast__btn autoDo-toast__btn--cancel">取消</button>';
    document.body.appendChild(toast);

    const secEl = toast.querySelector('.autoDo-toast__seconds');
    toast.querySelector('.autoDo-toast__btn--cancel').addEventListener('click', () => {
      cancelAutoAnswerCountdown();
    });

    console.log('[AutoDo] 显示自动作答倒计时', isExam ? '(考试页)' : '');

    panelState.countdownTimer = setInterval(() => {
      seconds -= 1;
      if (secEl) secEl.textContent = String(seconds);
      if (seconds <= 0) {
        clearInterval(panelState.countdownTimer);
        panelState.countdownTimer = null;
        panelState.countdownActive = false;
        fadeOutToast(toast, () => {
          if (!panelState.autoStartCancelled && !panelState.autoAnswering) {
            startAutoAnswer({ fromCountdown: true });
          }
        });
      }
    }, 1000);
  }

  /** 快速配置：OpenAI 兼容服务商预设 */
  const QUICK_PROVIDERS = {
    deepseek: {
      providerName: 'DeepSeek',
      baseUrl: 'https://api.deepseek.com',
      defaultModel: 'deepseek-v4-flash',
      apiKeyHint: '在 platform.deepseek.com 申请 API Key',
      docUrl: 'https://api-docs.deepseek.com/zh-cn/',
      models: [
        { id: 'deepseek-v4-flash', label: 'deepseek-v4-flash（推荐）' },
        { id: 'deepseek-v4-pro', label: 'deepseek-v4-pro' },
        { id: 'deepseek-chat', label: 'deepseek-chat（旧版）' },
      ],
    },
    openai: {
      providerName: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      defaultModel: 'gpt-4o-mini',
      apiKeyHint: '在 platform.openai.com 申请 API Key',
      docUrl: 'https://platform.openai.com/docs/api-reference/chat/create',
      models: [
        { id: 'gpt-4o-mini', label: 'gpt-4o-mini' },
        { id: 'gpt-4o', label: 'gpt-4o' },
        { id: 'gpt-4.1', label: 'gpt-4.1' },
        { id: 'gpt-4.1-mini', label: 'gpt-4.1-mini' },
      ],
    },
    zhipu: {
      providerName: '智谱AI',
      baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
      defaultModel: 'glm-4-flash',
      apiKeyHint: '在 open.bigmodel.cn 申请 API Key',
      docUrl: 'https://docs.bigmodel.cn/cn/guide/develop/openai/introduction',
      models: [
        { id: 'glm-4-flash', label: 'glm-4-flash' },
        { id: 'glm-4-plus', label: 'glm-4-plus' },
        { id: 'glm-4-air', label: 'glm-4-air' },
        { id: 'glm-4-long', label: 'glm-4-long' },
      ],
    },
    qwen: {
      providerName: '通义千问',
      baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      defaultModel: 'qwen-plus',
      apiKeyHint: '在阿里云百炼 DashScope 控制台申请 API Key',
      docUrl: 'https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope',
      models: [
        { id: 'qwen-plus', label: 'qwen-plus' },
        { id: 'qwen-turbo', label: 'qwen-turbo' },
        { id: 'qwen-max', label: 'qwen-max' },
        { id: 'qwen-long', label: 'qwen-long' },
      ],
    },
    moonshot: {
      providerName: 'Moonshot / Kimi',
      baseUrl: 'https://api.moonshot.cn/v1',
      defaultModel: 'moonshot-v1-auto',
      apiKeyHint: '在 platform.moonshot.cn 申请 API Key',
      docUrl: 'https://platform.moonshot.cn/docs/api/chat',
      models: [
        { id: 'moonshot-v1-auto', label: 'moonshot-v1-auto' },
        { id: 'moonshot-v1-8k', label: 'moonshot-v1-8k' },
        { id: 'moonshot-v1-32k', label: 'moonshot-v1-32k' },
        { id: 'moonshot-v1-128k', label: 'moonshot-v1-128k' },
      ],
    },
    siliconflow: {
      providerName: '硅基流动',
      baseUrl: 'https://api.siliconflow.cn/v1',
      defaultModel: 'deepseek-ai/DeepSeek-V3',
      apiKeyHint: '在 cloud.siliconflow.cn 申请 API Key',
      docUrl: 'https://docs.siliconflow.cn/cn/api-reference/chat-completions/chat-completions',
      models: [
        { id: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek-V3' },
        { id: 'Qwen/QwQ-32B', label: 'QwQ-32B' },
        { id: 'Pro/deepseek-ai/DeepSeek-R1', label: 'DeepSeek-R1' },
      ],
    },
    groq: {
      providerName: 'Groq',
      baseUrl: 'https://api.groq.com/openai/v1',
      defaultModel: 'llama-3.3-70b-versatile',
      apiKeyHint: '在 console.groq.com 申请 API Key',
      docUrl: 'https://console.groq.com/docs/openai',
      models: [
        { id: 'llama-3.3-70b-versatile', label: 'llama-3.3-70b-versatile' },
        { id: 'llama-3.1-8b-instant', label: 'llama-3.1-8b-instant' },
        { id: 'mixtral-8x7b-32768', label: 'mixtral-8x7b-32768' },
      ],
    },
    openrouter: {
      providerName: 'OpenRouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      defaultModel: 'deepseek/deepseek-chat',
      apiKeyHint: '在 openrouter.ai 申请 API Key',
      docUrl: 'https://openrouter.ai/docs',
      models: [
        { id: 'deepseek/deepseek-chat', label: 'deepseek/deepseek-chat' },
        { id: 'anthropic/claude-3.5-sonnet', label: 'claude-3.5-sonnet' },
        { id: 'google/gemini-2.0-flash-001', label: 'gemini-2.0-flash' },
      ],
    },
  };

  const DEFAULT_SETTINGS = {
    speed: 'normal',
    skipAnswered: false,
    answerFollow: false,
    filter: 'none',
    multiModelDecision: false,
    pageLimit: {
      userOverride: {
        allowCopyPaste: null,
        allowTextSelect: null,
        allowMouseLeaveMonitor: null,
        allowDownload: null,
        allowDevTools: null,
      },
    },
    models: [],
    rules: [],
    chatSessions: [],
    activeChatSessionId: null,
    selectedModelId: null,
  };

  let appSettings = null;
  let editingModelId = null;
  let editingRuleId = null;
  let selectedRuleId = null;
  let modelModalTab = 'quick';

  function getDefaultSettings() {
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }

  function loadSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['autoDoSettings'], (result) => {
        const prevOverride = appSettings && appSettings.pageLimit && appSettings.pageLimit.userOverride;
        appSettings = result.autoDoSettings
          ? Object.assign(getDefaultSettings(), result.autoDoSettings)
          : getDefaultSettings();
        if (!appSettings.pageLimit || !appSettings.pageLimit.userOverride) {
          appSettings.pageLimit = Object.assign(
            {},
            getDefaultSettings().pageLimit,
            appSettings.pageLimit || {}
          );
        }
        if (prevOverride && appSettings.pageLimit && appSettings.pageLimit.userOverride) {
          Object.keys(prevOverride).forEach((k) => {
            if (typeof prevOverride[k] === 'boolean') {
              appSettings.pageLimit.userOverride[k] = prevOverride[k];
            }
          });
        }
        if (!Array.isArray(appSettings.models)) {
          appSettings.models = [];
        }
        migrateRules(appSettings);
        if (appSettings.selectedModelId && !appSettings.models.some((m) => m.id === appSettings.selectedModelId)) {
          appSettings.selectedModelId = null;
        }
        appSettings.models.forEach((m) => {
          const presetKey = detectQuickProviderKey(m);
          if (presetKey && !m.baseUrl) {
            m.baseUrl = QUICK_PROVIDERS[presetKey].baseUrl;
          }
          if (!m.configMode) {
            m.configMode = presetKey ? 'quick' : 'custom';
          }
        });
        applySettingsToUI();
        initPageLimitProtection();
        renderModelList();
        renderRuleList();
      });
    } else {
      appSettings = getDefaultSettings();
      migrateRules(appSettings);
      applySettingsToUI();
      initPageLimitProtection();
      renderModelList();
      renderRuleList();
    }
  }

  function saveSettings() {
    if (!appSettings) return;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ autoDoSettings: appSettings });
    }
  }

  function applySettingsToUI() {
    if (!appSettings) return;
    migrateRules(appSettings);
    const speed = document.getElementById('setting-speed');
    const skip = document.getElementById('setting-skipAnswered');
    const answerFollow = document.getElementById('setting-answerFollow');
    const filter = document.getElementById('setting-filter');
    const multi = document.getElementById('setting-multiModel');
    if (speed) speed.value = appSettings.speed || 'normal';
    if (skip) skip.checked = !!appSettings.skipAnswered;
    if (answerFollow) answerFollow.checked = !!appSettings.answerFollow;
    if (filter) filter.value = appSettings.filter || 'none';
    if (multi) {
      const enabledCount = (Array.isArray(appSettings.models)
        ? appSettings.models.filter((m) => m.enabled !== false && m.apiKey)
        : []
      ).length;
      if (appSettings.multiModelDecision && enabledCount < 2) {
        appSettings.multiModelDecision = false;
        saveSettings();
      }
      multi.checked = !!appSettings.multiModelDecision;
    }
  }

  function readAnswerSettingsFromUI() {
    if (!appSettings) appSettings = getDefaultSettings();
    const speed = document.getElementById('setting-speed');
    const skip = document.getElementById('setting-skipAnswered');
    const answerFollow = document.getElementById('setting-answerFollow');
    const filter = document.getElementById('setting-filter');
    const multi = document.getElementById('setting-multiModel');
    if (speed) appSettings.speed = speed.value;
    if (skip) appSettings.skipAnswered = skip.checked;
    if (answerFollow) appSettings.answerFollow = answerFollow.checked;
    if (filter) appSettings.filter = filter.value;
    if (multi) appSettings.multiModelDecision = multi.checked;
    saveSettings();
  }

  function selectModel(modelId) {
    if (!appSettings) return;
    appSettings.selectedModelId = modelId;
    saveSettings();
    renderModelList();
  }

  function getSelectedModel() {
    if (!appSettings || !appSettings.selectedModelId) return null;
    return appSettings.models.find((m) => m.id === appSettings.selectedModelId) || null;
  }


  function renderModelList() {
    const listEl = document.getElementById('autoDo-modelList');
    if (!listEl || !appSettings) return;

    if (appSettings.multiModelDecision) {
      const enabledCount = appSettings.models.filter((m) => m.enabled !== false && m.apiKey).length;
      if (enabledCount < 2) {
        appSettings.multiModelDecision = false;
        const multi = document.getElementById('setting-multiModel');
        if (multi) multi.checked = false;
        saveSettings();
      }
    }

    listEl.innerHTML = '';

    if (!appSettings.models.length) {
      appSettings.selectedModelId = null;
      listEl.innerHTML = '<p class="settings-empty">暂无模型，请添加</p>';
      return;
    }

    appSettings.models.forEach((m) => {
      const isSelected = appSettings.selectedModelId === m.id;
      const card = document.createElement('div');
      card.className = 'model-card' + (isSelected ? ' model-card--selected' : '');
      card.dataset.id = m.id;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

      const availText = m.available !== false ? '可用' : '不可用';
      const availClass = m.available !== false ? 'model-status--ok' : 'model-status--warn';

      card.innerHTML =
        '<span class="model-card-radio" aria-hidden="true"></span>' +
        '<div class="model-card-main">' +
        '<div class="model-card-title-row">' +
        '<span class="model-card-name">' +
        escapeHtml(m.name || m.model) +
        '</span>' +
        (m.isDefault ? '<span class="model-card-tag">默认</span>' : '') +
        '</div>' +
        '<div class="model-card-status">' +
        '<span class="model-status ' +
        availClass +
        '"><i></i>' +
        availText +
        '</span>' +
        '<span class="model-status ' +        '"><i></i>' +        '</span>' +
        '</div>' +
        '</div>' +
        '<label class="toggle-switch model-card-toggle" title="启用模型">' +
        '<input type="checkbox" class="model-enable-toggle"' +
        (m.enabled ? ' checked' : '') +
        '>' +
        '<span class="slider"></span>' +
        '</label>';

      const selectCard = () => selectModel(m.id);

      card.addEventListener('click', (e) => {
        if (e.target.closest('.model-card-toggle')) return;
        selectCard();
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectCard();
        }
      });

      const toggle = card.querySelector('.model-enable-toggle');
      toggle.addEventListener('click', (e) => e.stopPropagation());
      toggle.addEventListener('change', (e) => {
        e.stopPropagation();
        m.enabled = toggle.checked;
        saveSettings();
      });

      listEl.appendChild(card);
    });
  }








  function migrateRules(settings) {
    if (!settings || !Array.isArray(settings.rules)) {
      settings.rules = [];
      return;
    }
    settings.rules.forEach((r, i) => {
      if (r.enabled === undefined) r.enabled = true;
      if (!r.scope) r.scope = 'choice';
      if (!r.mode) r.mode = 'weight';
      if (!r.modelWeights || typeof r.modelWeights !== 'object') {
        r.modelWeights = {};
        const enabled = (settings.models || []).filter((m) => m.enabled !== false && m.apiKey);
        enabled.forEach((m, idx) => {
          r.modelWeights[m.id] = idx === 0 ? 10 : idx === 1 ? 2 : 1;
        });
      }
      if (!Array.isArray(r.modelOrder) || !r.modelOrder.length) {
        r.modelOrder = (settings.models || [])
          .filter((m) => m.enabled !== false && m.apiKey)
          .map((m) => m.id);
      }
      if (!r.name) r.name = '规则' + (i + 1);
    });
  }

  function questionMatchesRuleScope(q, scope) {
    const type = q.type || '';
    if (!scope || scope === 'all') return true;
    if (scope === 'choice') return type === '单选题' || type === '多选题';
    if (scope === 'single') return type === '单选题';
    if (scope === 'multi') return type === '多选题';
    if (scope === 'judge') return type === '判断题';
    if (scope === 'fill') return type === '填空题';
    return true;
  }

  function getApplicableRule(q) {
    if (!appSettings || !appSettings.multiModelDecision) return null;
    migrateRules(appSettings);
    const rules = (appSettings.rules || []).filter((r) => r.enabled !== false);
    for (const rule of rules) {
      if (questionMatchesRuleScope(q, rule.scope)) return rule;
    }
    return getDefaultMultiModelRule();
  }

  function getDefaultMultiModelRule() {
    const models = (appSettings.models || []).filter((m) => m.enabled !== false && m.apiKey);
    const modelWeights = {};
    models.forEach((m, i) => {
      modelWeights[m.id] = i === 0 ? 10 : 1;
    });
    return {
      id: '__default__',
      name: '默认',
      enabled: true,
      scope: 'all',
      mode: 'weight',
      modelWeights,
      modelOrder: models.map((m) => m.id),
    };
  }

  function isModelEligibleForQuestion(model, q) {
    if (!model || model.enabled === false || !model.apiKey) return false;
    return true;
  }

  function getModelsForRule(rule, q, mode) {
    migrateRules(appSettings);
    const all = (appSettings.models || []).filter((m) => m.enabled !== false && m.apiKey);
    if (mode === 'priority') {
      const order = rule.modelOrder || [];
      return order
        .map((id) => all.find((m) => m.id === id))
        .filter((m) => m && isModelEligibleForQuestion(m, q));
    }
    return all.filter((m) => {
      if (!isModelEligibleForQuestion(m, q)) return false;
      const w = Number(rule.modelWeights?.[m.id]);
      return !Number.isNaN(w) && w > 0;
    });
  }

  function getAnswerKeyForAggregation(answer, q) {
    if (!answer && answer !== false) return '';
    const ctx = extractQuestionContext(q);
    if (q.type === '判断题') {
      const lower = String(answer).toLowerCase();
      if (/^(true|t|正确|对|是|√|yes|1)$/i.test(lower)) return 'true';
      if (/^(false|f|错误|错|否|×|no|0)$/i.test(lower)) return 'false';
      return lower;
    }
    if (q.type === '多选题') {
      return normalizeMultiChoiceAnswer(
        String(answer),
        ctx.options.map((o) => String(o.key).toUpperCase())
      );
    }
    return String(answer).trim().toUpperCase();
  }

  function aggregateByWeight(modelResults, rule) {
    const groups = new Map();
    modelResults.forEach((item) => {
      if (!item.eligible || item.excluded) return;
      if (!isValidAnswerValue(item.answer)) return;
      const key = getAnswerKeyForAggregation(item.answer, item.question);
      if (!key) return;
      const prev = groups.get(key) || { answer: item.answer, weight: 0, models: [] };
      prev.weight += item.weight;
      prev.models.push(item.modelName);
      groups.set(key, prev);
    });

    if (!groups.size) {
      return { ok: false, reason: 'no_valid_answers' };
    }

    let topWeight = -1;
    let topGroups = [];
    groups.forEach((g) => {
      if (g.weight > topWeight) {
        topWeight = g.weight;
        topGroups = [g];
      } else if (Math.abs(g.weight - topWeight) < 1e-9) {
        topGroups.push(g);
      }
    });

    if (topGroups.length > 1) {
      return {
        ok: false,
        tied: true,
        topWeight,
        groups: Array.from(groups.values()),
      };
    }

    const winner = topGroups[0];
    return {
      ok: true,
      answer: winner.answer,
      weight: winner.weight,
      contributingModels: winner.models,
      groups: Array.from(groups.values()),
    };
  }

  function aggregateByPriority(modelResults) {
    for (const item of modelResults) {
      if (!item.eligible || item.excluded) continue;
      if (isValidAnswerValue(item.answer)) {
        return {
          ok: true,
          answer: item.answer,
          contributingModels: [item.modelName],
          usedModel: item.modelName,
        };
      }
    }
    return { ok: false, reason: 'no_valid_answers' };
  }

  function markQuestionSelfDecision(q) {
    panelState.selfDecisionQuestionIds.add(q.id);
    panelState.failedQuestionIds.delete(q.id);
    panelState.partialQuestionIds.delete(q.id);
    q.isAnswered = false;
    q.needsSelfDecision = true;
  }

  function clearQuestionSelfDecision(q) {
    panelState.selfDecisionQuestionIds.delete(q.id);
    q.needsSelfDecision = false;
  }

  function createModelAiRecord(model) {
    return {
      modelConfigId: model.id,
      modelName: getModelDisplayName(model),
      modelId: model.model,
      thinking: '',
      thinkingStreaming: false,
      rawReply: '',
      contentRaw: '',
      parsedAnswer: '',
      error: '',
      at: Date.now(),
    };
  }

  async function fetchModelAnswerForMulti(model, q, record) {
    try {
      const result = await fetchAIAnswerForQuestion(model, q, record);
      if (result?.aiRecord) Object.assign(record, result.aiRecord);
      return { model, result, record, error: null };
    } catch (err) {
      record.thinkingStreaming = false;
      record.error = err.message || '请求失败';
      record.at = Date.now();
      return { model, result: null, record, error: err };
    }
  }

  async function runMultiModelDecision(q, rule) {
    const mode = rule.mode || 'weight';
    const models = getModelsForRule(rule, q, mode);
    q.aiRecords = [];
    q.multiModelMeta = { ruleName: rule.name, mode, models: models.map((m) => getModelDisplayName(m)) };

    if (!models.length) {
      return { ok: false, reason: 'no_models' };
    }

    const modelResults = [];

    if (mode === 'priority') {
      for (let mi = 0; mi < models.length; mi++) {
        const model = models[mi];
        const eligible = isModelEligibleForQuestion(model, q);
        const excluded =
          !eligible;

        const modelName = getModelDisplayName(model);
        if (mi === 0) {
          showToast('优先级模式：正在询问「' + modelName + '」', { type: 'info', duration: 5000 });
        } else {
          showToast('「' + getModelDisplayName(models[mi - 1]) + '」无法作答，切换到「' + modelName + '」', { type: 'info', duration: 5000 });
        }

        const record = createModelAiRecord(model);
        q.aiRecords.push(record);

        if (excluded) {
          record.error = '未参与作答';
          modelResults.push({
            model,
            modelName,
          weight: 0,
          eligible,
          excluded: true,
          excludedByWeight: false,
          answer: '',
          record,
          question: q,
        });
          continue;
        }

        if (panelState.selectedPreviewQuestionId === q.id) renderQuestionPreview(q);

        const { result, error } = await fetchModelAnswerForMulti(model, q, record);
        const answer = result?.answer || '';
        const item = {
          model,
          modelName,
          weight: 0,
          eligible: true,
          excluded: false,
          excludedByWeight: false,
          answer,
          record,
          error,
          question: q,
        };
        modelResults.push(item);

        if (panelState.selectedPreviewQuestionId === q.id) renderQuestionPreview(q);

        if (isValidAnswerValue(answer)) {
          const decision = aggregateByPriority(modelResults);
          q.multiModelMeta.decision = decision;
          q.aiRecord = buildCombinedAiRecord(q, decision);
          return decision;
        }
      }
      const decision = aggregateByPriority(modelResults);
      q.multiModelMeta.decision = decision;
      q.aiRecord = buildCombinedAiRecord(q, decision);
      return decision;
    }

    const fetchJobs = models.map(async (model) => {
      const weight = Number(rule.modelWeights?.[model.id]);
      const excludedByWeight = Number.isNaN(weight) || weight <= 0;
      const eligible = isModelEligibleForQuestion(model, q);
      const excluded =
        excludedByWeight ||
        !eligible;

      const record = createModelAiRecord(model);
      q.aiRecords.push(record);

      if (excluded) {
        record.error =
          excludedByWeight
            ? '权重为 0，未参与'
              : '未参与作答';
        return {
          model,
          modelName: getModelDisplayName(model),
          weight: excludedByWeight ? 0 : weight,
          eligible,
          excluded: true,
          excludedByWeight,
          answer: '',
          record,
          question: q,
        };
      }

      const { result } = await fetchModelAnswerForMulti(model, q, record);
      return {
        model,
        modelName: getModelDisplayName(model),
        weight,
        eligible: true,
        excluded: false,
        excludedByWeight: false,
        answer: result?.answer || '',
        record,
        question: q,
      };
    });

    if (panelState.selectedPreviewQuestionId === q.id) {
      q.aiRecord = {
        thinking: '多个模型正在同时思考…',
        thinkingStreaming: true,
        modelName: models.map((m) => getModelDisplayName(m)).join('、'),
        at: Date.now(),
      };
      renderQuestionPreview(q);
    }

    const results = await Promise.all(fetchJobs);
    modelResults.push(...results);

    if (panelState.selectedPreviewQuestionId === q.id) renderQuestionPreview(q);

    const decision = aggregateByWeight(modelResults, rule);
    q.multiModelMeta.decision = decision;
    q.aiRecord = buildCombinedAiRecord(q, decision);
    return decision;
  }

  function buildCombinedAiRecord(q, decision) {
    const thinkingParts = (q.aiRecords || [])
      .map((r) => {
        const text = getThinkingDisplayText(r);
        return text ? '【' + (r.modelName || '模型') + '】\n' + text : '';
      })
      .filter(Boolean);
    const base = {
      thinking: thinkingParts.join('\n\n') || '',
      thinkingStreaming: false,
      modelName: '多模型',
      at: Date.now(),
    };

    if (!decision || !decision.ok) {
      return Object.assign(base, {
        error: decision?.tied
          ? '多个答案权重相同，需自行决策'
          : '未能得到可用答案',
        parsedAnswer: '',
        rawReply: '',
      });
    }

    return Object.assign(base, {
      parsedAnswer: decision.answer,
      rawReply: '',
      error: '',
    });
  }

  function formatMultiModelAnswerText(q, record) {
    if (record?.thinkingStreaming) {
      return '正在生成答案…';
    }
    if (record?.parsedAnswer && isValidAnswerValue(record.parsedAnswer)) {
      if (q.type === '判断题') return '答案：' + formatJudgeAnswerText(record.parsedAnswer);
      if (q.type === '多选题') {
        return (
          '答案：' +
          String(record.parsedAnswer)
            .toUpperCase()
            .replace(/[^A-Z]/g, '')
        );
      }
      return '答案：' + record.parsedAnswer;
    }
    if (record?.rawReply && !record.thinkingStreaming) {
      const ctx = extractQuestionContext(q);
      const parsed = normalizeAIAnswer(getModelReplyForParsing({ contentRaw: record.rawReply, reply: record.rawReply }), ctx);
      if (isValidAnswerValue(parsed)) {
        if (q.type === '判断题') return '答案：' + formatJudgeAnswerText(parsed);
        if (q.type === '多选题') {
          return '答案：' + String(parsed).toUpperCase().replace(/[^A-Z]/g, '');
        }
        return '答案：' + parsed;
      }
    }
    if (record?.error) return record.error;
    return '暂无答案';
  }

  function getRecordTabId(record, index) {
    return record.modelConfigId || 'model-' + index;
  }

  function ensureMultiModelPreviewTab(q, records, tabKey) {
    const ids = records.map((r, i) => getRecordTabId(r, i));
    if (!ids.includes(q[tabKey])) q[tabKey] = ids[0];
    return q[tabKey];
  }

  function isThinkingPlaceholder(text) {
    const t = String(text || '').trim();
    if (!t) return true;
    return /^(正在连接 AI|正在生成答案|正在思考|正在读取|图片已就绪)/.test(t);
  }

  function getThinkingDisplayText(record) {
    const thinking = String(record.thinking || '').trim();
    const raw = String(record.rawReply || record.contentRaw || '').trim();

    if (thinking && !isThinkingPlaceholder(thinking)) return thinking;

    if (raw) {
      if (record.thinkingStreaming || !record.parsedAnswer) return raw;
      if (!thinking || isThinkingPlaceholder(thinking)) {
        if (raw.length > 60 || raw.includes('\n')) return raw;
      }
    }

    if (thinking) return thinking;
    return '';
  }

  function renderMultiModelThinkingContent(q, record) {
    const text = getThinkingDisplayText(record);
    if (record.thinkingStreaming) {
      if (!text) {
        return (
          '<span class="preview-model-muted">正在思考…</span>' +
          '<span class="preview-ai-cursor">▍</span>'
        );
      }
      return escapeHtml(text) + '<span class="preview-ai-cursor">▍</span>';
    }
    if (text) return escapeHtml(text);
    if (record.error) {
      return '<span class="preview-model-muted">' + escapeHtml(record.error) + '</span>';
    }
    return '<span class="preview-model-muted">（无思考内容）</span>';
  }

  function renderMultiModelPreviewTabs(records, blockType, activeId, winners) {
    return records
      .map((r, i) => {
        const id = getRecordTabId(r, i);
        const isActive = id === activeId;
        const isWinner = winners && winners.includes(r.modelName);
        let cls = 'preview-model-tab';
        if (isActive) cls += ' active';
        if (isWinner) cls += ' preview-model-tab--winner';
        if (r.thinkingStreaming) cls += ' preview-model-tab--streaming';
        const tabLabel =
          (r.modelName || '模型') + (r.thinkingStreaming ? ' · 思考中' : '');
        return (
          '<button type="button" class="' +
          cls +
          '" data-block="' +
          blockType +
          '" data-model-id="' +
          escapeHtml(id) +
          '">' +
          escapeHtml(tabLabel) +
          '</button>'
        );
      })
      .join('');
  }

  function renderMultiModelPreviewPanels(records, blockType, activeId, renderContent) {
    return records
      .map((r, i) => {
        const id = getRecordTabId(r, i);
        const isActive = id === activeId;
        return (
          '<div class="preview-model-panel' +
          (isActive ? ' is-active' : '') +
          '" data-block="' +
          blockType +
          '" data-model-id="' +
          escapeHtml(id) +
          '">' +
          renderContent(r, i) +
          '</div>'
        );
      })
      .join('');
  }

  function renderMultiModelPreviewBlocks(q) {
    const records = q.aiRecords || [];
    if (!records.length) return '';

    const thinkingTab = ensureMultiModelPreviewTab(q, records, '_previewThinkingTab');
    const answerTab = ensureMultiModelPreviewTab(q, records, '_previewAnswerTab');
    const decision = q.multiModelMeta?.decision;
    const winners =
      decision?.ok && decision.contributingModels ? decision.contributingModels : [];

    let html = '';

    html +=
        '<div class="preview-ai-block preview-ai-block--multi" data-multi-block="thinking">' +
        '<button type="button" class="preview-ai-head preview-ai-toggle" aria-expanded="true">' +
        '<span class="preview-ai-head-left">' +
        '<img class="preview-ai-icon" src="' +
        getIconPath('thinking.svg') +
        '" alt="">' +
        '<span class="preview-ai-title">多个模型思考</span></span>' +
        '<img class="preview-ai-chevron" src="' +
        getIconPath('zhankai.svg') +
        '" alt="">' +
        '</button>' +
        '<div class="preview-model-tabs">' +
        renderMultiModelPreviewTabs(records, 'thinking', thinkingTab, winners) +
        '</div>' +
        '<div class="preview-ai-body preview-ai-body--thinking">' +
        renderMultiModelPreviewPanels(records, 'thinking', thinkingTab, (r) =>
          renderMultiModelThinkingContent(q, r)
        ) +
        '</div></div>';

    const answerPanelsHtml = renderMultiModelPreviewPanels(records, 'answer', answerTab, (r) => {
      const text = formatMultiModelAnswerText(q, r);
      const isErrorOnly = !!(r.error && !isValidAnswerValue(r.parsedAnswer));
      return (
        '<div class="preview-model-answer-text' +
        (isErrorOnly ? ' preview-model-answer-text--muted' : '') +
        '">' +
        escapeHtml(text) +
        '</div>'
      );
    });

    const activeRecord = records.find((r, i) => getRecordTabId(r, i) === answerTab);
    const activeIndex = records.findIndex((r, i) => getRecordTabId(r, i) === answerTab);
    const activeId = activeRecord ? getRecordTabId(activeRecord, activeIndex) : getRecordTabId(records[0], 0);
    const showUseBtn = activeRecord && isValidAnswerValue(activeRecord.parsedAnswer);

    const finalHint = q.needsSelfDecision
      ? '<div class="preview-multi-hint preview-multi-hint--tie">多个答案权重相同，请选择后点击「使用此答案」</div>'
      : decision?.ok && isValidAnswerValue(decision.answer)
        ? '<div class="preview-multi-hint">系统已按权重选择：' +
          escapeHtml(formatMultiModelAnswerText(q, { parsedAnswer: decision.answer })) +
          '</div>'
        : '';

    html +=
      '<div class="preview-ai-block preview-ai-block--multi" data-multi-block="answer">' +
      '<button type="button" class="preview-ai-head preview-ai-toggle" aria-expanded="true">' +
      '<span class="preview-ai-head-left">' +
      '<img class="preview-ai-icon" src="' +
      getIconPath('Aianswer.svg') +
      '" alt="">' +
      '<span class="preview-ai-title">多个模型回答</span></span>' +
      '<img class="preview-ai-chevron" src="' +
      getIconPath('zhankai.svg') +
      '" alt="">' +
      '</button>' +
      '<div class="preview-model-tabs">' +
      renderMultiModelPreviewTabs(records, 'answer', answerTab, winners) +
      '</div>' +
      '<div class="preview-ai-body preview-ai-body--answer">' +
      answerPanelsHtml +
      finalHint +
      '</div>' +
      (showUseBtn
        ? '<button type="button" class="preview-use-answer-btn" data-model-id="' +
          escapeHtml(activeId) +
          '">使用此答案</button>'
        : '') +
      '</div>';

    return html;
  }

  async function applyMultiModelSelectedAnswer(q, modelConfigId) {
    const record = (q.aiRecords || []).find((r, i) => getRecordTabId(r, i) === modelConfigId);
    if (!record || !isValidAnswerValue(record.parsedAnswer)) {
      showToast('该模型无可用答案', { type: 'info' });
      return;
    }

    const answerValue = record.parsedAnswer;
    clearQuestionSelfDecision(q);
    clearQuestionFailed(q);

    const applied = await applyAnswerToQuestion(q, answerValue, { matchBySubmitKey: false });
    if (isTextEntryQuestionType(q.type)) {
      await new Promise((resolve) => setTimeout(resolve, 260));
    }
    await recheckAnsweredWithRetry(q, q.type);
    if (q.type === '多选题') {
      updateMultiChoiceResultState(q, answerValue);
    }
    if (q.isAnswered && !panelState.partialQuestionIds.has(q.id)) {
      clearQuestionFailed(q);
      clearQuestionPartial(q);
    } else if (panelState.partialQuestionIds.has(q.id)) {
      clearQuestionFailed(q);
    } else if (applied) {
      markQuestionPartial(q);
    } else {
      markQuestionFailed(q);
    }

    q.aiRecord = Object.assign({}, record, {
      parsedAnswer: answerValue,
      error: '',
      thinkingStreaming: false,
      at: Date.now(),
    });
    q.multiModelMeta = Object.assign({}, q.multiModelMeta || {}, {
      manualAnswerModel: record.modelName,
    });

    updateUI();
    if (panelState.selectedPreviewQuestionId === q.id) {
      renderQuestionPreview(q);
    }
    showToast('已使用「' + (record.modelName || '模型') + '」的答案', { type: 'success', duration: 3000 });
  }

  function selectRule(ruleId) {
    selectedRuleId = ruleId;
    renderRuleList();
  }

  function renderRuleList() {
    const listEl = document.getElementById('autoDo-ruleList');
    if (!listEl || !appSettings) return;

    migrateRules(appSettings);
    listEl.innerHTML = '';

    if (!appSettings.rules || !appSettings.rules.length) {
      listEl.innerHTML = '<p class="settings-empty">暂无规则，请添加</p>';
      selectedRuleId = null;
      return;
    }

    if (selectedRuleId && !appSettings.rules.some((r) => r.id === selectedRuleId)) {
      selectedRuleId = appSettings.rules[0].id;
    }
    if (!selectedRuleId) selectedRuleId = appSettings.rules[0].id;

    appSettings.rules.forEach((r, index) => {
      const isSelected = selectedRuleId === r.id;
      const row = document.createElement('div');
      row.className = 'rule-item' + (isSelected ? ' rule-item--selected' : '');
      row.dataset.id = r.id;
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');

      row.innerHTML =
        '<span class="rule-item-name">' +
        escapeHtml(r.name || '规则' + (index + 1)) +
        '</span>' +
        '<label class="toggle-switch rule-item-toggle" title="启用规则">' +
        '<input type="checkbox" class="rule-enable-toggle"' +
        (r.enabled !== false ? ' checked' : '') +
        '>' +
        '<span class="slider"></span>' +
        '</label>';

      row.addEventListener('click', (e) => {
        if (e.target.closest('.rule-item-toggle')) return;
        selectRule(r.id);
      });

      row.addEventListener('dblclick', (e) => {
        if (e.target.closest('.rule-item-toggle')) return;
        openRuleModal('edit', r.id);
      });

      const toggle = row.querySelector('.rule-enable-toggle');
      toggle.addEventListener('click', (e) => e.stopPropagation());
      toggle.addEventListener('change', (e) => {
        e.stopPropagation();
        if (toggle.checked) {
          appSettings.rules.forEach((rule) => {
            rule.enabled = rule.id === r.id;
          });
        } else {
          const enabledCount = appSettings.rules.filter((rule) => rule.enabled !== false).length;
          r.enabled = enabledCount <= 1;
        }
        saveSettings();
        renderRuleList();
      });

      listEl.appendChild(row);
    });
  }

  function renderRuleModalModelLists(draft) {
    const weightList = document.getElementById('rule-weightModelList');
    const priorityList = document.getElementById('rule-priorityModelList');
    if (!weightList || !priorityList || !appSettings) return;

    const models = appSettings.models || [];
    weightList.innerHTML = '';
    priorityList.innerHTML = '';

    if (!models.length) {
      weightList.innerHTML = '<p class="settings-empty">请先在作答模型中添加模型</p>';
      priorityList.innerHTML = weightList.innerHTML;
      return;
    }

    const order = draft.modelOrder?.length
      ? draft.modelOrder.map((id) => models.find((m) => m.id === id)).filter(Boolean)
      : models;

    order.forEach((m, idx) => {

      const weightRow = document.createElement('div');
      weightRow.className = 'rule-model-row';
      weightRow.innerHTML =
        '<div class="rule-model-row-info">' +
        '<span class="rule-model-row-name">' +
        escapeHtml(m.name || m.model) +
        '</span>' +
        '<span class="model-status ' +        '"><i></i>' +        '</span></div>' +
        '<input type="number" class="rule-weight-input settings-input" min="0" step="0.1" data-model-id="' +
        escapeHtml(m.id) +
        '" value="' +
        escapeHtml(String(draft.modelWeights?.[m.id] ?? (idx === 0 ? 10 : 1))) +
        '">';
      weightList.appendChild(weightRow);

      const priorityRow = document.createElement('div');
      priorityRow.className = 'rule-model-row rule-model-row--priority';
      priorityRow.draggable = true;
      priorityRow.dataset.modelId = m.id;
      priorityRow.innerHTML =
        '<span class="rule-drag-handle" aria-hidden="true">≡</span>' +
        '<div class="rule-model-row-info">' +
        '<span class="rule-model-row-name">' +
        escapeHtml(m.name || m.model) +
        '</span>' +
        '<span class="model-status ' +        '"><i></i>' +        '</span></div>';

      priorityRow.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', m.id);
        priorityRow.classList.add('is-dragging');
      });
      priorityRow.addEventListener('dragend', () => priorityRow.classList.remove('is-dragging'));

      let lastDragMove = 0;
      priorityRow.addEventListener('dragover', (e) => {
        e.preventDefault();
        const now = Date.now();
        if (now - lastDragMove < 100) return;
        lastDragMove = now;
        const dragging = priorityList.querySelector('.is-dragging');
        if (!dragging || dragging === priorityRow) return;
        const rect = priorityRow.getBoundingClientRect();
        const after = e.clientY > rect.top + rect.height / 2;
        priorityList.insertBefore(dragging, after ? priorityRow.nextSibling : priorityRow);
      });

      priorityList.appendChild(priorityRow);
    });
  }

  function syncRuleModalModeUI(mode) {
    const weightSection = document.getElementById('rule-weightSection');
    const prioritySection = document.getElementById('rule-prioritySection');
    const isWeight = mode === 'weight';
    if (weightSection) weightSection.hidden = !isWeight;
    if (prioritySection) prioritySection.hidden = isWeight;
  }

  function openRuleModal(mode, ruleId) {
    const modal = document.getElementById('autoDo-ruleModal');
    const title = document.getElementById('autoDo-ruleModalTitle');
    if (!modal || !appSettings) return;

    migrateRules(appSettings);
    editingRuleId = mode === 'edit' ? ruleId : null;

    const existing =
      mode === 'edit' && ruleId
        ? appSettings.rules.find((r) => r.id === ruleId)
        : null;

    const draft = existing
      ? JSON.parse(JSON.stringify(existing))
      : {
          id: 'rule-' + Date.now(),
          name: '新规则 ' + ((appSettings.rules || []).length + 1),
          enabled: true,
          scope: 'choice',
          mode: 'weight',
          modelWeights: {},
          modelOrder: (appSettings.models || []).map((m) => m.id),
        };

    migrateRules({ rules: [draft], models: appSettings.models });

    const nameEl = document.getElementById('rule-input-name');
    const scopeEl = document.getElementById('rule-input-scope');
    const modeEl = document.getElementById('rule-input-mode');
    if (nameEl) nameEl.value = draft.name || '';
    if (scopeEl) scopeEl.value = draft.scope || 'choice';
    if (modeEl) modeEl.value = draft.mode || 'weight';

    modal.dataset.draftId = draft.id;
    if (title) title.textContent = mode === 'edit' ? '编辑规则' : '配置规则';

    renderRuleModalModelLists(draft);
    syncRuleModalModeUI(draft.mode || 'weight');

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeRuleModal() {
    const modal = document.getElementById('autoDo-ruleModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    editingRuleId = null;
  }

  function submitRuleModal() {
    if (!appSettings) return;
    const modal = document.getElementById('autoDo-ruleModal');
    const name = document.getElementById('rule-input-name')?.value?.trim();
    const scope = document.getElementById('rule-input-scope')?.value || 'choice';
    const mode = document.getElementById('rule-input-mode')?.value || 'weight';

    if (!name) {
      showToast('请填写规则名', { type: 'error' });
      return;
    }

    const modelWeights = {};
    document.querySelectorAll('#rule-weightModelList .rule-weight-input').forEach((input) => {
      const id = input.dataset.modelId;
      if (id) modelWeights[id] = parseFloat(input.value) || 0;
    });

    const modelOrder = [];
    document.querySelectorAll('#rule-priorityModelList .rule-model-row--priority').forEach((row) => {
      if (row.dataset.modelId) modelOrder.push(row.dataset.modelId);
    });
    if (!modelOrder.length) {
      (appSettings.models || []).forEach((m) => modelOrder.push(m.id));
    }

    const rule = {
      id: modal?.dataset.draftId || 'rule-' + Date.now(),
      name,
      enabled: true,
      scope,
      mode,
      modelWeights,
      modelOrder,
    };

    if (!appSettings.rules) appSettings.rules = [];
    const idx = appSettings.rules.findIndex((r) => r.id === rule.id);
    if (idx >= 0) {
      rule.enabled = appSettings.rules[idx].enabled !== false;
      appSettings.rules[idx] = rule;
    } else {
      appSettings.rules.push(rule);
    }

    selectedRuleId = rule.id;
    saveSettings();
    renderRuleList();
    closeRuleModal();
    showToast('规则已保存', { type: 'success' });
  }

  function editSelectedRule() {
    if (!selectedRuleId) {
      showToast('请先选择一条规则', { type: 'info' });
      return;
    }
    openRuleModal('edit', selectedRuleId);
  }

  function deleteSelectedRule() {
    if (!appSettings || !selectedRuleId) {
      showToast('请先选择要删除的规则', { type: 'info' });
      return;
    }
    appSettings.rules = (appSettings.rules || []).filter((r) => r.id !== selectedRuleId);
    selectedRuleId = appSettings.rules[0]?.id || null;
    saveSettings();
    renderRuleList();
    showToast('规则已删除', { type: 'success' });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function detectQuickProviderKey(m) {
    if (m.providerPreset && QUICK_PROVIDERS[m.providerPreset]) return m.providerPreset;
    const url = (m.baseUrl || '').replace(/\/$/, '');
    for (const [key, preset] of Object.entries(QUICK_PROVIDERS)) {
      if (url === preset.baseUrl.replace(/\/$/, '') || url.startsWith(preset.baseUrl.replace(/\/$/, ''))) {
        return key;
      }
    }
    if (/deepseek/i.test(m.provider || '')) return 'deepseek';
    if (/openai/i.test(m.provider || '')) return 'openai';
    if (/智谱|zhipu|bigmodel/i.test(m.provider || '')) return 'zhipu';
    if (/通义|千问|qwen|dashscope/i.test(m.provider || '')) return 'qwen';
    if (/moonshot|kimi/i.test(m.provider || '')) return 'moonshot';
    if (/硅基|siliconflow/i.test(m.provider || '')) return 'siliconflow';
    if (/groq/i.test(m.provider || '')) return 'groq';
    if (/openrouter/i.test(m.provider || '')) return 'openrouter';
    return null;
  }

  function initQuickProviderSelect() {
    const select = document.getElementById('quick-provider');
    if (!select || select.options.length) return;
    select.innerHTML = Object.entries(QUICK_PROVIDERS)
      .map(
        ([key, p]) =>
          '<option value="' + escapeHtml(key) + '">' + escapeHtml(p.providerName) + '</option>'
      )
      .join('');
  }

  function syncQuickProviderUI(presetKey, existing) {
    const preset = QUICK_PROVIDERS[presetKey] || QUICK_PROVIDERS.deepseek;
    const providerSelect = document.getElementById('quick-provider');
    const modelSelect = document.getElementById('quick-model');
    const baseUrlEl = document.getElementById('quick-baseurl');
    const apiKeyHint = document.getElementById('quick-apikey-hint');
    const docHint = document.getElementById('quick-doc-hint');

    if (providerSelect) providerSelect.value = presetKey in QUICK_PROVIDERS ? presetKey : 'deepseek';

    if (modelSelect) {
      modelSelect.innerHTML = preset.models
        .map((item) => '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.label) + '</option>')
        .join('');
      const modelId = existing?.model || preset.defaultModel;
      modelSelect.value = modelId;
      if (!modelSelect.value && preset.models[0]) modelSelect.value = preset.models[0].id;
    }

    if (baseUrlEl) baseUrlEl.value = existing?.baseUrl || preset.baseUrl;
    if (apiKeyHint) apiKeyHint.textContent = preset.apiKeyHint || '';
    if (docHint) {
      docHint.innerHTML = preset.docUrl
        ? '文档：<a href="' + preset.docUrl + '" target="_blank" rel="noopener noreferrer">查看官方说明</a>'
        : '';
    }  }

  function setModelModalTab(tab) {
    modelModalTab = tab;
    document.querySelectorAll('.settings-modal-tab').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-model-tab') === tab);
    });
    const quickPanel = document.getElementById('model-panel-quick');
    const customPanel = document.getElementById('model-panel-custom');
    if (quickPanel) quickPanel.hidden = tab !== 'quick';
    if (customPanel) customPanel.hidden = tab !== 'custom';
  }

  function updateCustomUrlTip() {
    const fullUrl = document.getElementById('custom-full-url')?.checked;
    const tip = document.getElementById('custom-url-tip');
    if (!tip) return;
    tip.textContent = fullUrl
      ? '已启用完整 URL，将直接使用你填写的地址发起请求。'
      : '请填写兼容 OpenAI API 的服务端点地址，不要以斜杠结尾。/chat/completions 将会补充到你填写的地址末尾。';
  }

  function fillCustomFormFromModel(m) {
    document.getElementById('custom-api-format').value = m.apiFormat || 'openai_chat';
    document.getElementById('custom-full-url').checked = !!m.fullUrl;
    document.getElementById('custom-baseurl').value = m.fullUrl ? m.requestUrl || m.baseUrl || '' : m.baseUrl || '';
    document.getElementById('custom-model-id').value = m.model || '';
    document.getElementById('custom-apikey').value = m.apiKey || '';
    document.getElementById('custom-provider-name').value = m.provider || m.name || '';
    document.getElementById('custom-timeout').value = m.timeout || 60;
    updateCustomUrlTip();
  }

  function resetCustomForm() {
    document.getElementById('custom-api-format').value = 'openai_chat';
    document.getElementById('custom-full-url').checked = false;
    document.getElementById('custom-baseurl').value = '';
    document.getElementById('custom-model-id').value = '';
    document.getElementById('custom-apikey').value = '';
    document.getElementById('custom-provider-name').value = '';
    document.getElementById('custom-timeout').value = 60;
    const advPanel = document.getElementById('custom-advanced-panel');
    const advBtn = document.getElementById('custom-advanced-toggle');
    if (advPanel) advPanel.hidden = true;
    if (advBtn) {
      advBtn.setAttribute('aria-expanded', 'false');
      advBtn.classList.remove('is-open');
    }
    updateCustomUrlTip();
  }

  function readQuickFormFromUI() {
    const presetKey = document.getElementById('quick-provider')?.value || 'deepseek';
    const preset = QUICK_PROVIDERS[presetKey] || QUICK_PROVIDERS.deepseek;
    const modelId = document.getElementById('quick-model')?.value || preset.defaultModel;
    const opt = preset.models.find((item) => item.id === modelId);
    return {
      configMode: 'quick',
      providerPreset: presetKey,
      provider: preset.providerName,
      baseUrl: preset.baseUrl,
      fullUrl: false,
      requestUrl: '',
      apiFormat: 'openai_chat',
      model: modelId,
      name: opt ? opt.label.split('（')[0] : modelId,
      apiKey: document.getElementById('quick-apikey')?.value.trim() || '',
      multimodal: true,
      timeout: 60,
      isDefault: !!document.getElementById('model-input-default')?.checked,
    };
  }

  function readCustomFormFromUI() {
    const fullUrl = !!document.getElementById('custom-full-url')?.checked;
    const baseUrlInput = document.getElementById('custom-baseurl')?.value.trim() || '';
    const modelId = document.getElementById('custom-model-id')?.value.trim() || '';
    const providerName = document.getElementById('custom-provider-name')?.value.trim() || modelId;
    return {
      configMode: 'custom',
      providerPreset: 'custom',
      provider: providerName,
      baseUrl: fullUrl ? '' : baseUrlInput,
      fullUrl: fullUrl,
      requestUrl: fullUrl ? baseUrlInput : '',
      apiFormat: document.getElementById('custom-api-format')?.value || 'openai_chat',
      model: modelId,
      name: providerName || modelId,
      apiKey: document.getElementById('custom-apikey')?.value.trim() || '',
      multimodal: true,
      timeout: parseInt(document.getElementById('custom-timeout')?.value, 10) || 60,
      isDefault: !!document.getElementById('model-input-default')?.checked,
    };
  }

  function readModelFormFromUI() {
    return modelModalTab === 'quick' ? readQuickFormFromUI() : readCustomFormFromUI();
  }

  function openModelModal(mode, modelId) {
    const modal = document.getElementById('autoDo-modelModal');
    if (!modal || !appSettings) return;

    const titleEl = document.getElementById('autoDo-modelModalTitle');
    const submitBtn = document.getElementById('autoDo-modelModalSubmit');
    const cancelBtn = document.getElementById('autoDo-modelModalCancel');

    initQuickProviderSelect();

    if (mode === 'edit' && modelId) {
      const m = appSettings.models.find((item) => item.id === modelId);
      if (!m) {
        showToast('未找到该模型', { type: 'error' });
        return;
      }
      editingModelId = modelId;
      const useCustom = m.configMode === 'custom' || m.providerPreset === 'custom';
      setModelModalTab(useCustom ? 'custom' : 'quick');
      if (useCustom) {
        fillCustomFormFromModel(m);
      } else {
        const presetKey = detectQuickProviderKey(m) || 'deepseek';
        syncQuickProviderUI(presetKey, m);
        document.getElementById('quick-apikey').value = m.apiKey || '';
      }
      document.getElementById('model-input-default').checked = !!m.isDefault;
      if (titleEl) titleEl.textContent = '编辑模型';
      if (submitBtn) submitBtn.textContent = '保存';
      if (cancelBtn) cancelBtn.textContent = '取消';
    } else {
      editingModelId = null;
      setModelModalTab('quick');
      syncQuickProviderUI('deepseek');
      document.getElementById('quick-apikey').value = '';
      resetCustomForm();
      const isFirst = !appSettings.models.length;
      document.getElementById('model-input-default').checked = isFirst;
      if (titleEl) titleEl.textContent = '添加模型';
      if (submitBtn) submitBtn.textContent = '添加模型';
      if (cancelBtn) cancelBtn.textContent = '取消添加';
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModelModal() {
    const modal = document.getElementById('autoDo-modelModal');
    if (!modal) return;
    editingModelId = null;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function submitModelModal() {
    if (!appSettings) appSettings = getDefaultSettings();

    const form = readModelFormFromUI();

    if (!form.model) {
      showToast('请选择或填写模型 ID', { type: 'error' });
      return;
    }
    if (!form.apiKey) {
      showToast('请填写 API Key', { type: 'error' });
      return;
    }
    if (form.configMode === 'custom') {
      if (!form.model) {
        showToast('请填写模型 ID', { type: 'error' });
        return;
      }
      if (form.fullUrl && !form.requestUrl) {
        showToast('请填写完整 URL', { type: 'error' });
        return;
      }
      if (!form.fullUrl && !form.baseUrl) {
        showToast('请填写 API 地址', { type: 'error' });
        return;
      }
    }

    if (form.isDefault) {
      appSettings.models.forEach((m) => {
        m.isDefault = false;
      });
    }

    const payload = {
      configMode: form.configMode,
      providerPreset: form.providerPreset,
      provider: form.provider,
      baseUrl: form.baseUrl,
      fullUrl: form.fullUrl,
      requestUrl: form.requestUrl,
      apiFormat: form.apiFormat,
      model: form.model,
      name: form.name,
      apiKey: form.apiKey,      timeout: form.timeout,
      isDefault: form.isDefault,
      enabled: true,
      available: true,
    };

    if (editingModelId) {
      const m = appSettings.models.find((item) => item.id === editingModelId);
      if (!m) {
        showToast('未找到该模型', { type: 'error' });
        return;
      }
      Object.assign(m, payload);
      m.enabled = m.enabled !== false;
      appSettings.selectedModelId = m.id;
      saveSettings();
      renderModelList();
      closeModelModal();
      showToast('模型已更新', { type: 'success' });
      return;
    }

    const id = 'model-' + Date.now();
    if (!appSettings.models.length) {
      payload.isDefault = true;
    }
    appSettings.models.push({ id: id, ...payload });
    appSettings.selectedModelId = id;

    saveSettings();
    renderModelList();
    closeModelModal();
    showToast('模型已添加', { type: 'success' });
  }

  function editSelectedModel() {
    const m = getSelectedModel();
    if (!m) {
      showToast('请先选择要编辑的模型', { type: 'info' });
      return;
    }
    openModelModal('edit', m.id);
  }

  function deleteSelectedModel() {
    const m = getSelectedModel();
    if (!m) {
      showToast('请先选择要删除的模型', { type: 'info' });
      return;
    }

    const label = m.name || m.model || '该模型';
    if (!window.confirm('确定删除模型「' + label + '」？')) {
      return;
    }

    const wasDefault = m.isDefault;
    appSettings.models = appSettings.models.filter((item) => item.id !== m.id);

    if (appSettings.selectedModelId === m.id) {
      appSettings.selectedModelId = null;
    }

    if (wasDefault && appSettings.models.length > 0) {
      appSettings.models[0].isDefault = true;
    }

    saveSettings();
    renderModelList();
    showToast('模型已删除', { type: 'success' });
  }

  function testSelectedModel() {
    const m = getSelectedModel();
    if (!m) {
      showToast('请先选择要测试的模型', { type: 'info' });
      return;
    }
    if (!m.apiKey) {
      showToast('该模型未配置 API Key', { type: 'error' });
      return;
    }
    const url = getModelRequestUrl(m);
    if (!url) {
      showToast('API 地址无效', { type: 'error' });
      return;
    }

    const btn = document.getElementById('autoDo-testModelBtn');
    const prevTitle = btn ? btn.title : '';
    if (btn) {
      btn.disabled = true;
      btn.title = '测试中…';
    }

    chrome.runtime.sendMessage(
      {
        action: 'testModel',
        payload: {
          url: url,
          apiKey: m.apiKey,
          model: m.model,
          timeout: m.timeout || 60,
        },
      },
      (result) => {
        if (btn) {
          btn.disabled = false;
          btn.title = prevTitle || '测试';
        }
        if (chrome.runtime.lastError) {
          showToast('测试失败：' + chrome.runtime.lastError.message, { type: 'error', duration: 5000 });
          return;
        }
        if (result && result.ok) {
          m.available = true;
          saveSettings();
          renderModelList();
          const hint = result.reply ? '：' + result.reply : '';
          showToast('模型连接成功' + hint, { type: 'success', duration: 4000 });
        } else {
          m.available = false;
          saveSettings();
          renderModelList();
          showToast('模型测试失败：' + (result?.error || '未知错误'), { type: 'error', duration: 5000 });
        }
      }
    );
  }


  function bindSettingsEvents() {
    const speed = document.getElementById('setting-speed');
    const skip = document.getElementById('setting-skipAnswered');
    const answerFollow = document.getElementById('setting-answerFollow');
    const filter = document.getElementById('setting-filter');
    const multi = document.getElementById('setting-multiModel');
    [speed, skip, answerFollow, filter].forEach((el) => {
      if (!el) return;
      el.addEventListener('change', readAnswerSettingsFromUI);
      if (el.tagName === 'INPUT' && el.type !== 'checkbox') {
        el.addEventListener('blur', readAnswerSettingsFromUI);
      }
    });

    if (multi) {
      multi.addEventListener('change', () => {
        if (multi.checked) {
          const enabledCount = (appSettings && Array.isArray(appSettings.models)
            ? appSettings.models.filter((m) => m.enabled !== false && m.apiKey)
            : []
          ).length;
          if (enabledCount < 2) {
            multi.checked = false;
            showToast('多模型决策需要至少启用 2 个模型（需填写 API Key）', { type: 'error', duration: 4000 });
            return;
          }
        }
        readAnswerSettingsFromUI();
      });
    }

    document.querySelectorAll('.settings-modal-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        setModelModalTab(btn.getAttribute('data-model-tab'));
      });
    });

    document.getElementById('quick-provider')?.addEventListener('change', (e) => {
      syncQuickProviderUI(e.target.value);
      document.getElementById('quick-apikey').value = '';
    });

    document.getElementById('custom-full-url')?.addEventListener('change', updateCustomUrlTip);

    document.getElementById('custom-advanced-toggle')?.addEventListener('click', () => {
      const panel = document.getElementById('custom-advanced-panel');
      const btn = document.getElementById('custom-advanced-toggle');
      if (!panel || !btn) return;
      const open = panel.hidden;
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.classList.toggle('is-open', open);
    });

    document.getElementById('autoDo-testModelBtn')?.addEventListener('click', testSelectedModel);
    document.getElementById('autoDo-addModelBtn')?.addEventListener('click', () => openModelModal('add'));
    document.getElementById('autoDo-editModelBtn')?.addEventListener('click', editSelectedModel);
    document.getElementById('autoDo-deleteModelBtn')?.addEventListener('click', deleteSelectedModel);
    document.getElementById('autoDo-modelModalCancel')?.addEventListener('click', closeModelModal);
    document.getElementById('autoDo-modelModalSubmit')?.addEventListener('click', submitModelModal);

    document.querySelectorAll('[data-close-modal]').forEach((el) => {
      el.addEventListener('click', closeModelModal);
    });

    document.getElementById('autoDo-addRuleBtn')?.addEventListener('click', () => openRuleModal('add'));
    document.getElementById('autoDo-editRuleBtn')?.addEventListener('click', editSelectedRule);
    document.getElementById('autoDo-deleteRuleBtn')?.addEventListener('click', deleteSelectedRule);
    document.getElementById('autoDo-ruleModalCancel')?.addEventListener('click', closeRuleModal);
    document.getElementById('autoDo-ruleModalSubmit')?.addEventListener('click', submitRuleModal);
    document.getElementById('rule-input-mode')?.addEventListener('change', (e) => {
      syncRuleModalModeUI(e.target.value);
    });

    document.querySelectorAll('[data-close-rule-modal]').forEach((el) => {
      el.addEventListener('click', closeRuleModal);
    });
  }

  function waitForPageReady() {
    console.log('[AutoDo] waitForPageReady: 等待页面就绪');
    const check = () => {
      panelState.isExamPage = isExamPage();

      if (panelState.isExamPage && isExamQuestionSurfaceReady()) {
        console.log('[AutoDo]   检测到考试页面, 优先询问是否自动作答');
        createFloatingPanel();
        ensurePreviewSection();
        updatePageKindSubtitle();
        tryOfferExamPageFlow();
        setTimeout(scanQuestions, 500);
        return;
      }

      if (isOnZhidaoPlatform() && (document.querySelector('.answer-homework-page-wrap') || hasZhidaoQuestionSurface())) {
        console.log('[AutoDo]   检测到知到作业页面, 创建面板并等待题目挂载');
        createFloatingPanel();
        ensurePreviewSection();
        updatePageKindSubtitle();
        setTimeout(scanQuestions, hasZhidaoQuestionSurface() ? 300 : 800);
        return;
      }

      if (document.querySelector('.TiMu') || document.querySelector('.questionLi')) {
        console.log('[AutoDo]   检测到题目元素, 创建面板');
        createFloatingPanel();
        ensurePreviewSection();
        updatePageKindSubtitle();
        setTimeout(scanQuestions, 500);
        return;
      }
      if (document.readyState === 'complete') {
        console.log('[AutoDo]   页面加载完成但未检测到题目元素, 仍创建面板');
        createFloatingPanel();
        ensurePreviewSection();
        updatePageKindSubtitle();
        setTimeout(scanQuestions, 800);
        return;
      }
      setTimeout(check, 300);
    };
    check();
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'setFloatingEnabled') {
      setFloatingEnabled(message.enabled !== false);
    }

    if (message.action === 'togglePanel') {
      const panel = document.getElementById('autoDo-panel');
      if (panel && !panel.classList.contains('is-disabled')) panel.classList.toggle('open');
    }

    if (message.action === 'openSettings') {
      const panel = document.getElementById('autoDo-panel');
      if (panel && !panel.classList.contains('is-disabled')) {
        panel.classList.add('open');
        switchTab('settings');
      }
    }
  });

  const isPlatform = isOnStudyPlatform();
  console.log('[AutoDo] 初始化检查, 是否在目标平台:', isPlatform);
  if (isPlatform) {
    if (document.readyState === 'loading') {
      console.log('[AutoDo]   DOM未加载完毕, 等待 DOMContentLoaded');
      document.addEventListener('DOMContentLoaded', waitForPageReady);
    } else {
      console.log('[AutoDo]   DOM已就绪, 直接调用 waitForPageReady');
      waitForPageReady();
    }
  }
})();
