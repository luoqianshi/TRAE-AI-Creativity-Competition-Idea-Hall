(function () {
  'use strict';

  /* ===== 全局状态 ===== */
  const state = {
    templates: null,
    currentTool: null,
    currentCommand: null,
    paramValues: {}
  };

  /* ===== DOM 引用 ===== */
  const toolListEl = document.getElementById('toolList');
  const commandListEl = document.getElementById('commandList');
  const paramFormEl = document.getElementById('paramForm');
  const previewBoxEl = document.getElementById('previewBox');
  const btnCopyEl = document.getElementById('btnCopy');

  /* ===== 工具图标映射 ===== */
  const toolIcons = {
    maven: '\u2615',
    npm: '\uD83D\uDCE6',
    git: '\u2387'
  };

  /* ===== 初始化 ===== */
  async function init() {
    try {
      const resp = await fetch('data/templates.json');
      if (!resp.ok) throw new Error('加载模板数据失败');
      state.templates = await resp.json();
      renderToolList();
      // 默认选中第一个工具
      const firstKey = Object.keys(state.templates.tools)[0];
      if (firstKey) selectTool(firstKey);
    } catch (err) {
      console.error(err);
      toolListEl.innerHTML = '<div class="empty-hint" style="color:#ff6b6b">加载模板数据失败</div>';
    }
  }

  /* ===== 渲染工具列表 ===== */
  function renderToolList() {
    const tools = state.templates.tools;
    toolListEl.innerHTML = Object.keys(tools).map(key => {
      const tool = tools[key];
      const activeClass = state.currentTool === key ? ' active' : '';
      return `
        <div class="tool-card${activeClass}" data-tool="${key}">
          <div class="tool-card-icon">${toolIcons[key] || ''}</div>
          <div class="tool-card-name">${tool.name}</div>
          <div class="tool-card-desc">${tool.description}</div>
        </div>
      `;
    }).join('');
  }

  /* ===== 选择工具 ===== */
  function selectTool(toolKey) {
    if (state.currentTool === toolKey) return;
    state.currentTool = toolKey;
    state.currentCommand = null;
    state.paramValues = {};
    renderToolList();
    renderCommandList();
    renderParamForm();
    updatePreview();
    updateCopyButton();
  }

  /* ===== 渲染命令列表 ===== */
  function renderCommandList() {
    if (!state.currentTool) {
      commandListEl.innerHTML = '<div class="empty-hint">请在左侧选择工具</div>';
      return;
    }
    const tool = state.templates.tools[state.currentTool];
    const commands = tool.commands;
    commandListEl.innerHTML = commands.map((cmd, idx) => {
      const activeClass = state.currentCommand === idx ? ' active' : '';
      return `
        <div class="command-card${activeClass}" data-index="${idx}">
          <div class="command-card-name">${cmd.name}</div>
          <div class="command-card-desc">${cmd.description}</div>
          <div class="command-card-template">${escapeHtml(cmd.template)}</div>
        </div>
      `;
    }).join('');
    commandListEl.scrollTop = 0;

    // 默认选中第一个命令
    if (commands.length > 0 && state.currentCommand === null) {
      selectCommand(0);
    }
  }

  /* ===== 选择命令 ===== */
  function selectCommand(commandIndex) {
    if (state.currentCommand === commandIndex) return;
    state.currentCommand = commandIndex;
    state.paramValues = {};
    initParamDefaults();
    renderCommandList();
    renderParamForm();
    updatePreview();
    updateCopyButton();
  }

  /* ===== 初始化参数默认值 ===== */
  function initParamDefaults() {
    const cmd = getCurrentCommand();
    if (!cmd || !cmd.params) return;
    cmd.params.forEach(p => {
      if (p.type === 'switch') {
        state.paramValues[p.id] = false;
      } else if (p.type === 'select' && p.options && p.options.length > 0) {
        state.paramValues[p.id] = p.options[0];
      } else {
        state.paramValues[p.id] = '';
      }
    });
  }

  /* ===== 获取当前命令对象 ===== */
  function getCurrentCommand() {
    if (state.currentTool === null || state.currentCommand === null) return null;
    const tool = state.templates.tools[state.currentTool];
    return tool.commands[state.currentCommand] || null;
  }

  /* ===== 渲染参数表单 ===== */
  function renderParamForm() {
    const cmd = getCurrentCommand();
    if (!cmd) {
      paramFormEl.innerHTML = '<div class="empty-hint">请选择命令模板</div>';
      return;
    }
    if (!cmd.params || cmd.params.length === 0) {
      paramFormEl.innerHTML = '<div class="empty-hint">此命令无额外参数</div>';
      return;
    }

    paramFormEl.innerHTML = cmd.params.map(p => {
      const requiredStar = p.required ? '<span class="required-star">*</span>' : '';
      if (p.type === 'switch') {
        const checked = state.paramValues[p.id] ? ' checked' : '';
        return `
          <div class="switch-group">
            <span class="switch-label">${p.label}</span>
            ${p.flag ? `<span class="switch-flag">${p.flag}</span>` : ''}
            <label class="toggle-switch">
              <input type="checkbox" data-param="${p.id}" data-type="switch"${checked}>
              <span class="toggle-slider"></span>
            </label>
          </div>
        `;
      }
      if (p.type === 'select') {
        const val = state.paramValues[p.id] || '';
        const isCustom = p.options && !p.options.includes(val);
        const selectedAttr = (opt) => opt === val ? ' selected' : '';
        const optionsHtml = (p.options || []).map(o =>
          `<option value="${escapeHtml(o)}"${selectedAttr(o)}>${escapeHtml(o)}</option>`
        ).join('');
        if (isCustom) {
          // 添加自定义选项
        }
        return `
          <div class="param-group">
            <label class="param-label">${p.label}${requiredStar}</label>
            <select class="param-select" data-param="${p.id}" data-type="select">
              ${optionsHtml}
              ${isCustom ? `<option value="${escapeHtml(val)}" selected>${escapeHtml(val)}</option>` : ''}
            </select>
            <input type="text" class="param-input" data-param="${p.id}" data-type="select-custom"
              placeholder="${p.placeholder || '或输入自定义值'}"
              value="${isCustom ? escapeHtml(val) : ''}">
          </div>
        `;
      }
      // type="text" 及其他
      const val = state.paramValues[p.id] || '';
      return `
        <div class="param-group">
          <label class="param-label">${p.label}${requiredStar}</label>
          <input type="text" class="param-input" data-param="${p.id}" data-type="text"
            placeholder="${p.placeholder || ''}"
            value="${escapeHtml(val)}">
        </div>
      `;
    }).join('');
  }

  /* ===== 更新参数值 ===== */
  function updateParam(paramId, value) {
    state.paramValues[paramId] = value;
    updatePreview();
  }

  /* ===== 生成命令 ===== */
  function generateCommand() {
    const cmd = getCurrentCommand();
    if (!cmd) return '';
    let result = cmd.template;

    if (cmd.params) {
      cmd.params.forEach(p => {
        if (p.type === 'switch') {
          if (state.paramValues[p.id] && p.flag) {
            result = result.trimEnd() + ' ' + p.flag;
          }
        } else {
          const val = state.paramValues[p.id];
          if (val !== undefined && val !== null && val !== '') {
            result = result.replace(new RegExp('\\{' + p.id + '\\}', 'g'), val);
          }
        }
      });
    }

    return result.trim();
  }

  /* ===== 更新预览 ===== */
  function updatePreview() {
    const cmd = getCurrentCommand();
    if (!cmd) {
      previewBoxEl.textContent = '';
      return;
    }
    previewBoxEl.textContent = generateCommand();
  }

  /* ===== 更新复制按钮状态 ===== */
  function updateCopyButton() {
    btnCopyEl.disabled = state.currentCommand === null;
  }

  /* ===== 复制命令 ===== */
  function copyCommand() {
    const command = generateCommand();
    if (!command) return;
    navigator.clipboard.writeText(command).then(() => {
      showToast('已复制');
    }).catch(() => {
      showToast('复制失败，请手动复制');
    });
  }

  /* ===== Toast 提示 ===== */
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, 1800);
  }

  /* ===== HTML 转义 ===== */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ===== 事件委托 ===== */
  document.addEventListener('click', function (e) {
    // 工具卡片点击
    const toolCard = e.target.closest('.tool-card');
    if (toolCard) {
      const toolKey = toolCard.dataset.tool;
      if (toolKey) selectTool(toolKey);
      return;
    }

    // 命令卡片点击
    const commandCard = e.target.closest('.command-card');
    if (commandCard) {
      const idx = parseInt(commandCard.dataset.index, 10);
      if (!isNaN(idx)) selectCommand(idx);
      return;
    }

    // 复制按钮
    if (e.target === btnCopyEl) {
      copyCommand();
      return;
    }
  });

  // 参数表单输入事件
  document.addEventListener('input', function (e) {
    const el = e.target;
    const paramId = el.dataset.param;
    const type = el.dataset.type;
    if (!paramId) return;

    if (type === 'switch') {
      updateParam(paramId, el.checked);
    } else if (type === 'text') {
      updateParam(paramId, el.value);
    } else if (type === 'select-custom') {
      updateParam(paramId, el.value);
      // 同步更新同组的 select
      const selectEl = paramFormEl.querySelector(`select[data-param="${paramId}"]`);
      if (selectEl && el.value) {
        const exists = Array.from(selectEl.options).some(o => o.value === el.value);
        if (!exists) {
          const opt = document.createElement('option');
          opt.value = el.value;
          opt.textContent = el.value;
          opt.selected = true;
          selectEl.appendChild(opt);
        }
        selectEl.value = el.value;
      }
    }
  });

  document.addEventListener('change', function (e) {
    const el = e.target;
    const paramId = el.dataset.param;
    const type = el.dataset.type;
    if (!paramId || type !== 'select') return;

    updateParam(paramId, el.value);
    // 同步自定义输入框
    const customEl = paramFormEl.querySelector(`input[data-type="select-custom"][data-param="${paramId}"]`);
    if (customEl) {
      customEl.value = el.value;
    }
  });

  /* ===== 启动 ===== */
  init();
})();
