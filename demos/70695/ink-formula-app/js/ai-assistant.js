/* ========== 水性墨水配方管理系统 - 豆包AI助手 ========== */

const AI_STORAGE_KEY = 'ink_doubao_config';

// ========== API Key Management ==========
function getAiConfig() {
  try {
    const raw = localStorage.getItem(AI_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { apiKey: '', endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', model: 'doubao-lite-128k-240828' };
  } catch { return {}; }
}

function saveAiConfig(config) {
  localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(config));
}

function isAiConfigured() {
  const cfg = getAiConfig();
  return !!cfg.apiKey;
}

// ========== AI Config Modal ==========
function showAiConfigModal() {
  const cfg = getAiConfig();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div class="modal" style="max-width:480px;">
      <div class="modal-header">
        <h3>${ico('robot')} 豆包AI 配置</h3>
        <button class="btn btn-ghost btn-sm btn-icon" onclick="this.closest('.modal-overlay').remove()">${ico('xmark')}</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>豆包 API Key <span class="required">*</span></label>
          <input type="password" class="input" id="ai-apikey" value="${escHtml(cfg.apiKey || '')}" placeholder="从火山引擎控制台获取">
          <div class="text-muted mt-8">获取地址：console.volcengine.com/ark → API Key管理</div>
        </div>
        <div class="form-group">
          <label>API 端点</label>
          <input type="text" class="input" id="ai-endpoint" value="${escHtml(cfg.endpoint || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions')}">
        </div>
        <div class="form-group">
          <label>模型</label>
          <select class="select" id="ai-model">
            <option value="doubao-lite-128k-240828" ${cfg.model === 'doubao-lite-128k-240828' ? 'selected' : ''}>Doubao Lite (128K)</option>
            <option value="doubao-pro-128k-240828" ${cfg.model === 'doubao-pro-128k-240828' ? 'selected' : ''}>Doubao Pro (128K)</option>
            <option value="doubao-lite-32k-240828" ${cfg.model === 'doubao-lite-32k-240828' ? 'selected' : ''}>Doubao Lite (32K)</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">取消</button>
        <button class="btn btn-primary" id="btn-save-ai-config">${ico('floppy-disk')} 保存配置</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.querySelector('#btn-save-ai-config').onclick = () => {
    const apiKey = overlay.querySelector('#ai-apikey').value.trim();
    if (!apiKey) { showToast('请输入 API Key', 'error'); return; }

    saveAiConfig({
      apiKey,
      endpoint: overlay.querySelector('#ai-endpoint').value.trim() || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      model: overlay.querySelector('#ai-model').value
    });
    overlay.remove();
    showToast('AI 配置已保存', 'success');
  };
}

// ========== Call Doubao API ==========
async function callDoubaoAPI(userMessage, systemPrompt) {
  const cfg = getAiConfig();
  if (!cfg.apiKey) {
    showToast('请先配置豆包 API Key', 'error');
    showAiConfigModal();
    return null;
  }

  try {
    const response = await fetch(cfg.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.apiKey}`
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      if (response.status === 401 || response.status === 403) {
        throw new Error('API Key 无效或已过期');
      }
      throw new Error(`API 请求失败 (${response.status}): ${errText.substring(0, 200)}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'AI 未返回有效内容';
  } catch (err) {
    console.error('Doubao API error:', err);
    throw err;
  }
}

// ========== Build diagnosis prompt ==========
function buildDiagnosisPrompt(formula) {
  let prompt = '你是一位资深的水性墨水配方工程师和化学分析师。请根据以下配方信息和用户描述的异常现象，分析可能原因并给出解决方案。\n\n';

  if (formula) {
    prompt += '【配方信息】\n';
    prompt += `配方名称: ${formula.name}\n`;

    if (formula.ingredients?.length) {
      prompt += '原料成分:\n';
      const catOrder = ['溶剂', '助剂', '树脂', '色浆'];
      catOrder.forEach(cat => {
        const items = formula.ingredients.filter(i => i.category === cat);
        if (items.length) {
          prompt += `  [${cat}]\n`;
          items.forEach(ing => {
            prompt += `    - ${ing.name} (${ing.code || '无代码'}): 配比 ${ing.ratio || '-'}, 质量 ${ing.mass || '-'}\n`;
          });
        }
      });
    }

    const props = formula.properties || {};
    if (props.viscosity?.value) prompt += `粘度: ${props.viscosity.value} ${props.viscosity.unit || 'mPa·s'} (${props.viscosity.method || '-'})\n`;
    if (props.surfaceTension?.value) prompt += `表面张力: ${props.surfaceTension.value} ${props.surfaceTension.unit || 'mN/m'} (${props.surfaceTension.method || '-'})\n`;
    const spec = props.spectrophotometer || {};
    if (spec.L || spec.a || spec.b) prompt += `光度计: L*${spec.L || '-'} a*${spec.a || '-'} b*${spec.b || '-'} ΔE=${spec['ΔE'] || '-'}\n`;
    if (formula.remarks) prompt += `已有备注: ${formula.remarks}\n`;
  }

  prompt += '\n请以专业工程师的口吻回复，按以下结构输出：\n';
  prompt += '1. 异常现象分析\n2. 可能的原因（列出2-3个最可能的）\n3. 建议的解决方案\n4. 后续实验建议\n';
  prompt += '如果用户没有提供具体异常，请提示用户描述具体观察到的现象。';

  return prompt;
}

// ========== Ask Doubao from formula modal ==========
async function askDoubaoInModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (!overlay) return;

  const question = overlay.querySelector('#ai-question')?.value?.trim();
  if (!question) {
    showToast('请先输入需要诊断的异常现象', 'error');
    return;
  }

  const statusEl = overlay.querySelector('#ai-status');
  const resultEl = overlay.querySelector('#ai-result');
  const btnAsk = overlay.querySelector('#btn-ai-ask');
  const btnSave = overlay.querySelector('#btn-ai-save-result');

  if (!isAiConfigured()) {
    showAiConfigModal();
    return;
  }

  btnAsk.disabled = true;
  statusEl.innerHTML = ico('hourglass-half') + ' AI 分析中...';
  resultEl.style.display = 'none';
  btnSave.style.display = 'none';

  // Collect formula context
  const formulaName = overlay.querySelector('#fm-name')?.value?.trim() || '当前配方';
  const ingredients = [];
  overlay.querySelectorAll('.ingredient-row').forEach(row => {
    const matSelect = row.querySelector('.ing-material-select');
    const ratio = row.querySelector('.ing-ratio')?.value?.trim();
    const mass = row.querySelector('.ing-mass')?.value?.trim();
    const matId = matSelect?.value;
    if (matId) {
      const m = getMaterialById(matId);
      if (m) ingredients.push({ name: m.name, code: m.code, category: m.category, ratio, mass });
    }
  });

  const formula = {
    name: formulaName,
    ingredients,
    properties: {
      viscosity: {
        value: overlay.querySelector('#prop-viscosity')?.value?.trim(),
        unit: overlay.querySelector('#prop-viscosity-unit')?.value,
        method: overlay.querySelector('#prop-viscosity-method')?.value?.trim()
      },
      surfaceTension: {
        value: overlay.querySelector('#prop-tension')?.value?.trim(),
        unit: overlay.querySelector('#prop-tension-unit')?.value,
        method: overlay.querySelector('#prop-tension-method')?.value?.trim()
      },
      spectrophotometer: {
        L: overlay.querySelector('#prop-L')?.value?.trim(),
        a: overlay.querySelector('#prop-a')?.value?.trim(),
        b: overlay.querySelector('#prop-b')?.value?.trim(),
        'ΔE': overlay.querySelector('#prop-dE')?.value?.trim()
      }
    },
    remarks: overlay.querySelector('#fm-remarks')?.value?.trim()
  };

  const systemPrompt = buildDiagnosisPrompt(formula);

  try {
    const reply = await callDoubaoAPI(question, systemPrompt);
    resultEl.style.display = 'block';
    resultEl.innerHTML = `
      <div class="ai-response">
        <div class="ai-response-header">${ico('robot')} AI 诊断结果</div>
        <div class="ai-response-body" style="white-space:pre-wrap;font-size:0.85rem;line-height:1.7;">${escHtml(reply || '请求超时，请重试')}</div>
        <div class="text-muted mt-8" style="font-size:0.72rem;">${ico('triangle-exclamation')} AI 分析仅供参考，请结合实验验证</div>
      </div>
    `;
    btnSave.style.display = 'inline-flex';
    statusEl.innerHTML = ico('circle-check') + ' 诊断完成';
    // Store result for saving
    resultEl.dataset.aiResult = reply || '';
  } catch (err) {
    resultEl.style.display = 'block';
    resultEl.innerHTML = `<div class="ai-response ai-error"><div class="ai-response-body" style="white-space:pre-wrap;font-size:0.85rem;line-height:1.7;color:var(--danger);">${ico('circle-xmark')} ${escHtml(err.message)}</div></div>`;
    statusEl.innerHTML = ico('circle-xmark') + ' 请求失败';
  } finally {
    btnAsk.disabled = false;
  }
}

// Save AI result to remarks
function saveAiResultToRemarks() {
  const overlay = document.querySelector('.modal-overlay');
  if (!overlay) return;

  const resultEl = overlay.querySelector('#ai-result');
  const aiText = resultEl?.dataset?.aiResult || '';
  if (!aiText) { showToast('没有可保存的诊断结果', 'error'); return; }

  const remarksEl = overlay.querySelector('#fm-remarks');
  const existing = remarksEl?.value?.trim() || '';
  const newContent = existing
    ? existing + '\n\n--- AI 诊断 (' + new Date().toLocaleString('zh-CN') + ') ---\n' + aiText
    : '--- AI 诊断 (' + new Date().toLocaleString('zh-CN') + ') ---\n' + aiText;

  if (remarksEl) {
    remarksEl.value = newContent;
    showToast('诊断结果已追加到备注', 'success');
  }
}

// ========== Independent AI Chat ==========
function showAiChatPanel() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div class="modal wide" style="max-width:700px;">
      <div class="modal-header">
        <h3>${ico('robot')} 豆包AI 助手</h3>
        <div class="flex gap-8">
          <button class="btn btn-outline btn-sm" onclick="showAiConfigModal()">${ico('gear')} 配置</button>
          <button class="btn btn-ghost btn-sm btn-icon" onclick="this.closest('.modal-overlay').remove()">${ico('xmark')}</button>
        </div>
      </div>
      <div class="modal-body">
        ${!isAiConfigured() ? `
          <div class="empty-state">
            <div class="icon">${ico('key')}</div>
            <h4>请先配置豆包 API Key</h4>
            <button class="btn btn-primary btn-sm mt-12" onclick="showAiConfigModal()">去配置</button>
          </div>
        ` : `
          <div id="ai-chat-history" style="max-height:400px;overflow-y:auto;margin-bottom:12px;"></div>
          <div class="flex gap-8">
            <textarea class="textarea flex-1" id="ai-chat-input" placeholder="输入你的问题..." style="min-height:50px;"></textarea>
          </div>
          <div class="flex gap-8 items-center mt-8">
            <button class="btn btn-primary btn-sm" id="btn-ai-chat-send" onclick="sendAiChat()">发送</button>
            <span class="text-muted" id="ai-chat-status"></span>
          </div>
        `}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  if (isAiConfigured()) {
    overlay.querySelector('#ai-chat-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); overlay.querySelector('#btn-ai-chat-send').click(); }
    });
  }
}

async function sendAiChat() {
  const overlay = document.querySelector('.modal-overlay');
  const input = overlay?.querySelector('#ai-chat-input');
  const history = overlay?.querySelector('#ai-chat-history');
  const status = overlay?.querySelector('#ai-chat-status');
  const question = input?.value?.trim();

  if (!question) return;

  history.innerHTML += `<div class="ai-msg ai-msg-user"><strong>你：</strong>${escHtml(question)}</div>`;
  input.value = '';
  status.innerHTML = ico('hourglass-half') + ' 思考中...';

  try {
    const reply = await callDoubaoAPI(question, '你是一位水性墨水配方专家，请用中文回复用户的技术问题。回复简洁专业。');
    history.innerHTML += `<div class="ai-msg ai-msg-assistant"><strong>${ico('robot')} AI：</strong><div style="white-space:pre-wrap;">${escHtml(reply || '无回复')}</div></div>`;
    status.innerHTML = ico('circle-check');
    history.scrollTop = history.scrollHeight;
  } catch (err) {
    history.innerHTML += `<div class="ai-msg ai-msg-error"><strong>${ico('circle-xmark')} 错误：</strong>${escHtml(err.message)}</div>`;
    status.innerHTML = ico('circle-xmark');
  }
}
