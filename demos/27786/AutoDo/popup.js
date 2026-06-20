let popupSettings = null;

function sendMessageToTab(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id) return;
    chrome.tabs.sendMessage(tab.id, { action }).catch(() => {
      alert('请在支持的作业/考试页面使用此插件');
    });
  });
}

function getModelDisplayName(model) {
  if (!model) return '未配置模型';
  return model.name || model.model || model.id || '未命名模型';
}

function getEnabledModels(settings) {
  return (Array.isArray(settings?.models) ? settings.models : []).filter((m) => m.enabled !== false);
}

function getCurrentModel(settings) {
  const models = Array.isArray(settings?.models) ? settings.models : [];
  if (!models.length) return null;
  const enabled = getEnabledModels(settings);
  return (
    models.find((m) => m.id === settings.selectedModelId) ||
    enabled.find((m) => m.isDefault) ||
    enabled[0] ||
    models[0]
  );
}

function getModelRequestUrl(model) {
  if (!model) return '';
  if (model.fullUrl && model.requestUrl) return model.requestUrl.replace(/\/$/, '');
  const base = (model.baseUrl || '').replace(/\/$/, '');
  if (!base) return '';
  return base.endsWith('/chat/completions') ? base : base + '/chat/completions';
}

function saveSettings(settings, callback) {
  popupSettings = settings;
  chrome.storage.local.set({ autoDoSettings: settings }, () => {
    if (callback) callback();
  });
}

function renderModelMenu(settings) {
  const menu = document.getElementById('modelMenu');
  if (!menu) return;
  const models = getEnabledModels(settings);
  const current = getCurrentModel(settings);
  if (!models.length) {
    menu.innerHTML = '<div class="model-option">未配置可用模型</div>';
    return;
  }
  menu.innerHTML = models
    .map(
      (m) =>
        '<button type="button" class="model-option' +
        (current && current.id === m.id ? ' active' : '') +
        '" data-model-id="' +
        escapeHtml(m.id) +
        '">' +
        escapeHtml(getModelDisplayName(m)) +
        '</button>'
    )
    .join('');
}

function renderModel(settings) {
  const model = getCurrentModel(settings);
  const nameEl = document.getElementById('modelStatus');
  const stateText = document.getElementById('modelStateText');
  const stateDot = document.getElementById('modelStateDot');
  const testBtn = document.getElementById('testModelBtn');

  if (!model) {
    nameEl.textContent = '未配置模型';
    stateText.textContent = '未测试';
    stateDot.style.background = '#b4b4b4';
    if (testBtn) testBtn.disabled = true;
    renderModelMenu(settings);
    return;
  }

  const configured = model.enabled !== false && !!model.apiKey;
  const available = configured && model.available === true;
  nameEl.textContent = getModelDisplayName(model);
  stateText.textContent = available ? '可用' : model.available === false ? '不可用' : '未测试';
  stateDot.style.background = available ? '#169af3' : model.available === false ? '#d82626' : '#b4b4b4';
  if (testBtn) testBtn.disabled = !configured;
  renderModelMenu(settings);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str || '');
  return div.innerHTML;
}

function updatePopupStatus() {
  chrome.storage.local.get(['enabled', 'autoDoSettings'], (result) => {
    popupSettings = result.autoDoSettings || { models: [], selectedModelId: null };
    const toggle = document.getElementById('floatingToggle');
    toggle.checked = result.enabled !== false;
    renderModel(popupSettings);
  });
}

function selectModel(modelId) {
  if (!popupSettings) return;
  popupSettings.selectedModelId = modelId;
  const model = (popupSettings.models || []).find((m) => m.id === modelId);
  if (model) {
    (popupSettings.models || []).forEach((m) => {
      m.isDefault = m.id === modelId;
    });
  }
  saveSettings(popupSettings, () => renderModel(popupSettings));
}

function testCurrentModel() {
  const model = getCurrentModel(popupSettings);
  if (!model || !model.apiKey) return;
  const url = getModelRequestUrl(model);
  if (!url) return;
  const btn = document.getElementById('testModelBtn');
  if (btn) {
    btn.disabled = true;
    btn.title = '测试中...';
  }
  chrome.runtime.sendMessage(
    {
      action: 'testModel',
      payload: {
        url,
        apiKey: model.apiKey,
        model: model.model,
        timeout: model.timeout || 60,
      },
    },
    (result) => {
      if (chrome.runtime.lastError) {
        model.available = false;
      } else {
        model.available = !!(result && result.ok);
      }
      saveSettings(popupSettings, () => {
        if (btn) btn.title = '测试';
        renderModel(popupSettings);
      });
    }
  );
}

document.getElementById('openPanelBtn').addEventListener('click', () => {
  sendMessageToTab('togglePanel');
});

document.getElementById('floatingToggle').addEventListener('change', (e) => {
  const enabled = e.target.checked;
  chrome.storage.local.set({ enabled }, () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;
      chrome.tabs.sendMessage(tab.id, { action: 'setFloatingEnabled', enabled }).catch(() => {});
    });
  });
});

document.getElementById('modelTrigger').addEventListener('click', () => {
  const menu = document.getElementById('modelMenu');
  menu.hidden = !menu.hidden;
});

document.getElementById('modelMenu').addEventListener('click', (e) => {
  const option = e.target.closest('.model-option[data-model-id]');
  if (!option) return;
  selectModel(option.dataset.modelId);
  document.getElementById('modelMenu').hidden = true;
});

document.getElementById('testModelBtn').addEventListener('click', testCurrentModel);

document.addEventListener('click', (e) => {
  const picker = document.getElementById('modelPicker');
  const menu = document.getElementById('modelMenu');
  if (menu && picker && !picker.contains(e.target)) menu.hidden = true;
});

updatePopupStatus();
