/**
 * 智页AI - 设置页面脚本
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 加载配置
  await loadConfig();

  // 左侧菜单切换
  document.querySelectorAll('.opt-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      document.querySelectorAll('.opt-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.opt-section').forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${section}`).classList.add('active');
    });
  });

  // 事件绑定
  document.getElementById('temperature').addEventListener('input', (e) => {
    document.getElementById('temp-value').textContent = e.target.value;
  });

  document.getElementById('provider').addEventListener('change', (e) => {
    updateModelSuggestions(e.target.value);
  });

  document.getElementById('btn-save').addEventListener('click', saveConfig);
  document.getElementById('btn-test').addEventListener('click', testConnection);
  document.getElementById('btn-save-prefs').addEventListener('click', savePrefs);
  document.getElementById('btn-save-embedding').addEventListener('click', saveEmbeddingConfig);
  document.getElementById('btn-test-embedding').addEventListener('click', testEmbeddingConnection);
  document.getElementById('btn-save-reranker').addEventListener('click', saveRerankerConfig);
  document.getElementById('btn-test-reranker').addEventListener('click', testRerankerConnection);

  // 更新连接状态
  await updateStatus();
});

async function loadConfig() {
  const data = await chrome.storage.local.get('zhiye_ai_config');
  const prefs = await chrome.storage.local.get('zhiye_prefs');
  const embData = await chrome.storage.local.get('zhiye_embedding_config');
  const rerankData = await chrome.storage.local.get('zhiye_reranker_config');
  const cfg = data?.zhiye_ai_config || {};
  const pref = prefs?.zhiye_prefs || {};
  const embCfg = embData?.zhiye_embedding_config || {};
  const rerankCfg = rerankData?.zhiye_reranker_config || {};

  document.getElementById('provider').value = cfg.provider || 'openai';
  document.getElementById('apiKey').value = cfg.apiKey || '';
  document.getElementById('model').value = cfg.model || 'gpt-3.5-turbo';
  document.getElementById('baseUrl').value = cfg.baseUrl || '';
  document.getElementById('temperature').value = cfg.temperature ?? 0.3;
  document.getElementById('temp-value').textContent = cfg.temperature ?? 0.3;
  document.getElementById('maxTokens').value = cfg.maxTokens || 4096;

  document.getElementById('autoParse').checked = pref.autoParse !== false;
  document.getElementById('enableSelection').checked = pref.enableSelection !== false;
  document.getElementById('streamResponse').checked = pref.streamResponse !== false;
  document.getElementById('darkMode').checked = pref.darkMode || false;

  // Embedding配置
  document.getElementById('embedding-provider').value = embCfg.provider || 'openai';
  document.getElementById('embedding-model').value = embCfg.model || 'text-embedding-3-small';
  document.getElementById('embedding-apiKey').value = embCfg.apiKey || '';
  document.getElementById('embedding-baseUrl').value = embCfg.baseUrl || '';

  // Reranker配置
  document.getElementById('reranker-provider').value = rerankCfg.provider || 'cohere';
  document.getElementById('reranker-model').value = rerankCfg.model || 'rerank-english-v3.0';
  document.getElementById('reranker-apiKey').value = rerankCfg.apiKey || '';
  document.getElementById('reranker-baseUrl').value = rerankCfg.baseUrl || '';

  updateModelSuggestions(cfg.provider || 'openai');
}

function updateModelSuggestions(provider) {
  const suggestions = {
    openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4o', 'gpt-4o-mini'],
    claude: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'],
    gemini: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'],
    ollama: ['llama3', 'qwen2', 'mistral', 'codellama'],
    custom: ['custom-model']
  };

  const datalist = document.getElementById('model-suggestions');
  const models = suggestions[provider] || [];
  datalist.innerHTML = models.map(m => `<option value="${m}">`).join('');

  const modelInput = document.getElementById('model');
  if (!modelInput.value || !models.some(m => modelInput.value.includes(m))) {
    modelInput.value = models[0] || '';
  }
}

async function saveConfig() {
  const config = {
    provider: document.getElementById('provider').value,
    apiKey: document.getElementById('apiKey').value.trim(),
    model: document.getElementById('model').value.trim(),
    baseUrl: document.getElementById('baseUrl').value.trim(),
    temperature: parseFloat(document.getElementById('temperature').value),
    maxTokens: parseInt(document.getElementById('maxTokens').value)
  };

  await chrome.storage.local.set({ zhiye_ai_config: config });
  showToast('配置已保存', 'success');
  await updateStatus();
}

async function savePrefs() {
  const prefs = {
    autoParse: document.getElementById('autoParse').checked,
    enableSelection: document.getElementById('enableSelection').checked,
    streamResponse: document.getElementById('streamResponse').checked,
    darkMode: document.getElementById('darkMode').checked
  };
  await chrome.storage.local.set({ zhiye_prefs: prefs });
  showToast('偏好已保存', 'success');
}

async function updateStatus() {
  const data = await chrome.storage.local.get('zhiye_ai_config');
  const cfg = data?.zhiye_ai_config;
  const dot = document.getElementById('sidebar-status-dot');
  const text = document.getElementById('sidebar-status-text');
  if (cfg?.apiKey && cfg.apiKey.length > 5) {
    dot.classList.add('connected');
    text.textContent = `${cfg.provider} 已配置`;
  } else {
    dot.classList.remove('connected');
    text.textContent = '未配置API';
  }
}

async function testConnection() {
  const btn = document.getElementById('btn-test');
  btn.disabled = true;
  btn.textContent = '测试中...';

  console.log('[智页AI] 开始测试连接...');

  try {
    if (typeof AIClient === 'undefined') {
      throw new Error('AIClient未加载，请检查扩展文件完整性');
    }

    const config = {
      provider: document.getElementById('provider').value,
      apiKey: document.getElementById('apiKey').value.trim(),
      model: document.getElementById('model').value.trim(),
      baseUrl: document.getElementById('baseUrl').value.trim(),
      temperature: parseFloat(document.getElementById('temperature').value),
      maxTokens: 100,
      timeout: 15000
    };

    console.log('[智页AI] 测试配置:', { provider: config.provider, model: config.model, baseUrl: config.baseUrl || '默认' });

    const client = new AIClient(config);
    const result = await client.testConnection();

    console.log('[智页AI] 测试结果:', result);

    if (result.success) {
      showToast(`连接成功！响应: ${result.response.substring(0, 30)}`, 'success');
      await updateStatus();
    } else {
      showToast(`连接失败: ${result.error}`, 'error');
    }
  } catch (err) {
    console.error('[智页AI] 测试连接出错:', err);
    showToast(`测试出错: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '🧪 测试连接';
  }
}

async function saveEmbeddingConfig() {
  const config = {
    provider: document.getElementById('embedding-provider').value,
    model: document.getElementById('embedding-model').value.trim(),
    apiKey: document.getElementById('embedding-apiKey').value.trim(),
    baseUrl: document.getElementById('embedding-baseUrl').value.trim()
  };

  await chrome.storage.local.set({ zhiye_embedding_config: config });
  showToast('Embedding配置已保存', 'success');
}

async function saveRerankerConfig() {
  const config = {
    provider: document.getElementById('reranker-provider').value,
    model: document.getElementById('reranker-model').value.trim(),
    apiKey: document.getElementById('reranker-apiKey').value.trim(),
    baseUrl: document.getElementById('reranker-baseUrl').value.trim()
  };

  await chrome.storage.local.set({ zhiye_reranker_config: config });
  showToast('Reranker配置已保存', 'success');
}

async function testEmbeddingConnection() {
  const btn = document.getElementById('btn-test-embedding');
  btn.disabled = true;
  btn.textContent = '测试中...';

  console.log('[智页AI] 开始测试Embedding连接...');

  try {
    if (typeof EmbeddingClient === 'undefined') {
      throw new Error('EmbeddingClient未加载，请检查扩展文件完整性');
    }

    const config = {
      provider: document.getElementById('embedding-provider').value,
      apiKey: document.getElementById('embedding-apiKey').value.trim(),
      model: document.getElementById('embedding-model').value.trim(),
      baseUrl: document.getElementById('embedding-baseUrl').value.trim()
    };

    console.log('[智页AI] Embedding测试配置:', { provider: config.provider, model: config.model, baseUrl: config.baseUrl || '默认' });

    const client = new EmbeddingClient(config);
    const result = await client.testConnection();

    console.log('[智页AI] Embedding测试结果:', result);

    if (result.success) {
      showToast('Embedding连接成功！', 'success');
    } else {
      showToast(`Embedding连接失败: ${result.error}`, 'error');
    }
  } catch (err) {
    console.error('[智页AI] Embedding测试连接出错:', err);
    showToast(`测试出错: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '🧪 测试连接';
  }
}

async function testRerankerConnection() {
  const btn = document.getElementById('btn-test-reranker');
  btn.disabled = true;
  btn.textContent = '测试中...';

  console.log('[智页AI] 开始测试Reranker连接...');

  try {
    if (typeof RerankerClient === 'undefined') {
      throw new Error('RerankerClient未加载，请检查扩展文件完整性');
    }

    const config = {
      provider: document.getElementById('reranker-provider').value,
      apiKey: document.getElementById('reranker-apiKey').value.trim(),
      model: document.getElementById('reranker-model').value.trim(),
      baseUrl: document.getElementById('reranker-baseUrl').value.trim()
    };

    console.log('[智页AI] Reranker测试配置:', { provider: config.provider, model: config.model, baseUrl: config.baseUrl || '默认' });

    const client = new RerankerClient(config);
    const result = await client.testConnection();

    console.log('[智页AI] Reranker测试结果:', result);

    if (result.success) {
      showToast('Reranker连接成功！', 'success');
    } else {
      showToast(`Reranker连接失败: ${result.error}`, 'error');
    }
  } catch (err) {
    console.error('[智页AI] Reranker测试连接出错:', err);
    showToast(`测试出错: ${err.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '🧪 测试连接';
  }
}

function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}