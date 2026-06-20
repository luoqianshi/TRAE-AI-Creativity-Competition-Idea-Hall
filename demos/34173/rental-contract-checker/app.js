/* ============================================================
 *  租房合同 AI 体检官 - 核心逻辑
 *  Powered by StepFun Step 3.7 Flash
 * ============================================================ */

(() => {
  'use strict';

  // ==========================================================
  // 配置
  // ==========================================================
  const API_URL = 'https://api.stepfun.com/v1/chat/completions';
  const MODEL = 'step-3.7-flash';
  const KEY_STORAGE = 'rental-checker:api-key';

  // ==========================================================
  // DOM 引用
  // ==========================================================
  const $ = (id) => document.getElementById(id);
  const els = {
    apiKeyInput:     $('apiKeyInput'),
    saveKeyBtn:      $('saveKeyBtn'),
    keyStatus:       $('keyStatus'),
    contractInput:   $('contractInput'),
    charCount:       $('charCount'),
    loadSampleBtn:   $('loadSampleBtn'),
    analyzeBtn:      $('analyzeBtn'),
    loading:         $('loading'),
    loadingText:     $('loadingText'),
    errorBox:        $('errorBox'),
    errorMsg:        $('errorMsg'),
    result:          $('result'),
    overallCard:     $('overallCard'),
    overallIcon:     $('overallIcon'),
    overallLevel:    $('overallLevel'),
    overallSummary:  $('overallSummary'),
    redCount:        $('redCount'),
    yellowCount:     $('yellowCount'),
    greenCount:      $('greenCount'),
    clauseList:      $('clauseList'),
  };

  // ==========================================================
  // System Prompt - 核心
  // ==========================================================
  const SYSTEM_PROMPT = `你是一位资深的租房法律顾问，专门帮助 22-30 岁的年轻人识别租房合同中的风险条款。

你的任务：分析用户提供的租房合同，识别其中可能损害租客权益的条款，并用**结构化 JSON** 输出。

## 风险等级定义
- **red（红色/高风险）**：违反法律法规明确规定的条款，或极度偏向房东的"霸王条款"
  - 例如：押金超过 2 个月、房东单方随时解除、扣留全部押金不退还、维修责任全部转嫁、违约金畸高（>30%）
- **yellow（黄色/中风险）**：条款存在但显失公平，可能在特定情况下损害租客利益
  - 例如：转租需"经房东书面同意"但未约定答复时限、违约金比例较高但未明确上限、维修责任划分模糊
- **green（绿色/低风险）**：符合行业惯例或法律规定的正常条款
  - 例如：押一付一、双方协商解约、正常维修义务

## 关注的关键条款类型
1. 押金（金额、退还条件、扣减规则）
2. 租金（金额、支付方式、调整机制）
3. 租期（起止日期、续租条件）
4. 维修责任（自然损耗 vs 人为损坏、费用承担）
5. 转租与退租（条件、违约金）
6. 单方解除权（房东 / 租客）
7. 违约金比例
8. 水电燃气等杂费
9. 房屋装修与改造
10. 不可抗力与争议解决

## 输出格式（必须严格遵守 JSON）
仅返回合法 JSON，不要包含 \`\`\`json 等代码块标记，不要有任何额外说明文字。

{
  "overall_risk": "high" | "medium" | "low",
  "summary": "用一句话（30 字以内）总结这份合同的整体风险等级",
  "stats": { "red": 数字, "yellow": 数字, "green": 数字 },
  "clauses": [
    {
      "category": "押金/租金/维修/转租/解约/违约金/其他",
      "original": "引用合同中的原条款（尽量完整）",
      "risk_level": "red" | "yellow" | "green",
      "reason": "为什么这个等级（30 字以内）",
      "explanation": "大白话解释（80 字以内）",
      "suggestion": "修改建议（80 字以内，可以直接发给房东）"
    }
  ]
}

如果用户提供的不是合同（比如是问候语或无关内容），返回：
{"overall_risk":"low","summary":"未检测到有效合同内容","stats":{"red":0,"yellow":0,"green":0},"clauses":[]}`;

  // ==========================================================
  // 示例合同（演示用）
  // ==========================================================
  const SAMPLE_CONTRACT = `北京市房屋租赁合同

甲方（出租人）：张某某
乙方（承租人）：________

第一条 租赁标的
甲方将位于北京市朝阳区某小区 12 号楼 1503 室出租给乙方居住使用。房屋建筑面积 65 平米。

第二条 租赁期限
租赁期自 2026 年 7 月 1 日至 2027 年 6 月 30 日，共计 12 个月。

第三条 租金及押金
月租金为人民币 6500 元，乙方应于每月 5 日前支付下月租金。
押金为人民币 20000 元（押三付一），合同到期且乙方无违约情况下无息退还。
租赁期内如租金市场行情上涨超过 10%，甲方有权单方调整租金，乙方须服从。

第四条 维修责任
房屋及附属设施在租赁期内因自然损耗或非乙方人为原因需要维修的，费用由乙方承担。
乙方使用不当造成的损坏，由乙方按原价赔偿。

第五条 转租与退租
未经甲方书面同意，乙方不得转租。
乙方提前退租的，押金不予退还，且需支付剩余租期 50% 的违约金。
甲方因自身原因需要提前收回房屋的，需提前 30 天通知乙方，赔偿一个月租金。

第六条 违约责任
乙方逾期支付租金的，每逾期一天按月租金 5% 加收滞纳金。
乙方有下列情形之一的，甲方有权单方解除合同并没收全部押金：
（一）累计逾期支付租金达 7 天；
（二）擅自改变房屋结构；
（三）其他违约行为。

第七条 其他约定
租赁期间产生的水、电、燃气、网费、物业费由乙方承担。
房屋内的家电家具（详见清单）乙方应妥善使用，损坏按原价赔偿，不考虑折旧。
本合同未尽事宜双方协商解决，协商不成的提交北京仲裁委员会仲裁。`;

  // ==========================================================
  // 工具函数
  // ==========================================================
  function setKeyStatus(hasKey) {
    if (hasKey) {
      els.keyStatus.textContent = '已配置';
      els.keyStatus.className = 'text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700';
    } else {
      els.keyStatus.textContent = '未配置';
      els.keyStatus.className = 'text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500';
    }
  }

  function showLoading(text) {
    els.loadingText.textContent = text || 'AI 正在阅读合同...';
    els.loading.classList.remove('hidden');
  }

  function hideLoading() {
    els.loading.classList.add('hidden');
  }

  function showError(msg) {
    els.errorMsg.textContent = msg;
    els.errorBox.classList.remove('hidden');
  }

  function hideError() {
    els.errorBox.classList.add('hidden');
  }

  function showResult() {
    els.result.classList.remove('hidden');
  }

  function hideResult() {
    els.result.classList.add('hidden');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function parseJsonFromText(text) {
    // 1. 尝试直接 parse
    try { return JSON.parse(text); } catch (_) {}

    // 2. 抽取 ```json ... ``` 块
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) {
      try { return JSON.parse(fenced[1]); } catch (_) {}
    }

    // 3. 抽取第一个 { 到最后一个 } 之间的内容
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      const slice = text.slice(first, last + 1);
      try { return JSON.parse(slice); } catch (_) {}
    }

    return null;
  }

  // ==========================================================
  // 调用 step-3.7-flash
  // ==========================================================
  async function callStepFun(apiKey, contractText) {
    const body = {
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: '请分析以下租房合同：\n\n' + contractText },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    };

    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      throw new Error(`API 调用失败 (HTTP ${resp.status}): ${errText.slice(0, 300)}`);
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('API 返回内容为空');
    }

    const parsed = parseJsonFromText(content);
    if (!parsed) {
      throw new Error('AI 返回的不是合法 JSON：' + content.slice(0, 200));
    }
    return parsed;
  }

  // ==========================================================
  // 渲染结果
  // ==========================================================
  const RISK_META = {
    red: {
      label: '高风险',  icon: '🔴', bg: 'bg-red-50',     border: 'border-red-200',
      text: 'text-red-700',     accent: 'text-red-600',   bar: 'bg-red-500',
      tag: 'bg-red-100 text-red-700',
    },
    yellow: {
      label: '需注意',  icon: '🟡', bg: 'bg-amber-50',   border: 'border-amber-200',
      text: 'text-amber-700',   accent: 'text-amber-600', bar: 'bg-amber-500',
      tag: 'bg-amber-100 text-amber-700',
    },
    green: {
      label: '正常',    icon: '🟢', bg: 'bg-emerald-50', border: 'border-emerald-200',
      text: 'text-emerald-700', accent: 'text-emerald-600', bar: 'bg-emerald-500',
      tag: 'bg-emerald-100 text-emerald-700',
    },
  };

  function renderResult(data) {
    // 整体卡片
    const overallKey = data.overall_risk || 'low';
    const overall = {
      high:   { ...RISK_META.red,    card: 'bg-red-50 border-red-300',     title: 'text-red-700'   },
      medium: { ...RISK_META.yellow, card: 'bg-amber-50 border-amber-300', title: 'text-amber-700' },
      low:    { ...RISK_META.green,  card: 'bg-emerald-50 border-emerald-300', title: 'text-emerald-700' },
    }[overallKey] || { ...RISK_META.green, card: 'bg-emerald-50 border-emerald-300', title: 'text-emerald-700' };

    els.overallCard.className = 'rounded-2xl p-6 mb-6 border-2 ' + overall.card;
    els.overallIcon.textContent = overall.icon + ' ' + (overall.icon === '🔴' ? '🚨' : overall.icon === '🟡' ? '⚠️' : '✅');
    els.overallLevel.textContent = ({
      high: '这份合同风险较高', medium: '这份合同有需注意的条款', low: '这份合同整体规范',
    }[overallKey] || '整体规范');
    els.overallLevel.className = 'text-2xl font-bold mt-1 ' + overall.title;
    els.overallSummary.textContent = data.summary || '（AI 未给出总结）';

    // 统计
    const stats = data.stats || { red: 0, yellow: 0, green: 0 };
    els.redCount.textContent    = stats.red    || 0;
    els.yellowCount.textContent = stats.yellow || 0;
    els.greenCount.textContent  = stats.green  || 0;

    // 条款列表
    els.clauseList.innerHTML = '';
    const clauses = Array.isArray(data.clauses) ? data.clauses : [];

    if (clauses.length === 0) {
      els.clauseList.innerHTML = `
        <div class="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-sm">
          未识别到具体条款，可能合同文本过短或不完整。
        </div>`;
    } else {
      // 按风险等级排序：red > yellow > green
      const order = { red: 0, yellow: 1, green: 2 };
      clauses.sort((a, b) => (order[a.risk_level] ?? 3) - (order[b.risk_level] ?? 3));

      clauses.forEach((c, idx) => {
        const meta = RISK_META[c.risk_level] || RISK_META.green;
        const card = document.createElement('div');
        card.className = `clause-card ${meta.bg} ${meta.border} border-2 rounded-2xl p-5 sm:p-6`;
        card.innerHTML = `
          <div class="flex items-start gap-3 mb-3">
            <span class="text-2xl flex-shrink-0">${meta.icon}</span>
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="${meta.tag} text-xs font-medium px-2 py-0.5 rounded">${escapeHtml(c.category || '其他')}</span>
                <span class="${meta.tag} text-xs font-medium px-2 py-0.5 rounded">${meta.label}</span>
                <span class="text-xs text-slate-400">#${idx + 1}</span>
              </div>
              <div class="mt-2 text-sm text-slate-700 leading-relaxed bg-white/70 rounded-lg p-3 border border-slate-200">
                <span class="text-xs text-slate-500">原条款：</span><br/>
                ${escapeHtml(c.original || '（未提取到原文）')}
              </div>
            </div>
          </div>

          <div class="space-y-2.5 text-sm">
            <div>
              <div class="text-xs font-medium text-slate-500 mb-0.5">为什么这个等级</div>
              <div class="${meta.text}">${escapeHtml(c.reason || '—')}</div>
            </div>
            <div>
              <div class="text-xs font-medium text-slate-500 mb-0.5">大白话解释</div>
              <div class="text-slate-700 leading-relaxed">${escapeHtml(c.explanation || '—')}</div>
            </div>
            <div>
              <div class="text-xs font-medium text-slate-500 mb-0.5">💡 修改建议（可直接发给房东）</div>
              <div class="text-slate-700 leading-relaxed bg-white/70 rounded-lg p-3 border border-slate-200">
                ${escapeHtml(c.suggestion || '—')}
              </div>
            </div>
          </div>
        `;
        els.clauseList.appendChild(card);
      });
    }

    showResult();
    // 滚动到结果
    setTimeout(() => {
      els.result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  // ==========================================================
  // 事件处理
  // ==========================================================

  // 加载示例
  els.loadSampleBtn.addEventListener('click', () => {
    els.contractInput.value = SAMPLE_CONTRACT;
    updateCharCount();
    els.contractInput.focus();
  });

  // 字数统计
  function updateCharCount() {
    const n = els.contractInput.value.length;
    els.charCount.textContent = n.toLocaleString() + ' 字';
  }
  els.contractInput.addEventListener('input', updateCharCount);

  // 保存 API Key
  els.saveKeyBtn.addEventListener('click', () => {
    const v = els.apiKeyInput.value.trim();
    if (!v) {
      localStorage.removeItem(KEY_STORAGE);
      setKeyStatus(false);
      alert('已清除 API Key');
    } else {
      localStorage.setItem(KEY_STORAGE, v);
      setKeyStatus(true);
      alert('已保存到浏览器本地');
    }
  });

  // 开始分析
  els.analyzeBtn.addEventListener('click', async () => {
    hideError();
    hideResult();

    const apiKey = (els.apiKeyInput.value.trim()) || localStorage.getItem(KEY_STORAGE) || '';
    if (!apiKey) {
      showError('请先在顶部「⚙️ 配置 API Key」中填写 StepFun Key，或直接粘贴到输入框。');
      document.querySelector('details').open = true;
      els.apiKeyInput.focus();
      return;
    }

    const text = els.contractInput.value.trim();
    if (text.length < 20) {
      showError('合同内容太短（少于 20 字），请粘贴完整的合同文本。');
      return;
    }

    // 锁定按钮
    els.analyzeBtn.disabled = true;
    els.analyzeBtn.innerHTML = '<span>⏳</span><span>分析中...</span>';

    try {
      const loadingStages = [
        'AI 正在阅读合同...',
        '正在提取关键条款...',
        '正在比对法律风险...',
        '正在生成修改建议...',
      ];
      let stageIdx = 0;
      showLoading(loadingStages[0]);
      const stageTimer = setInterval(() => {
        stageIdx = (stageIdx + 1) % loadingStages.length;
        els.loadingText.textContent = loadingStages[stageIdx];
      }, 2500);

      const data = await callStepFun(apiKey, text);
      clearInterval(stageTimer);
      hideLoading();
      renderResult(data);
    } catch (err) {
      hideLoading();
      let msg = err.message || String(err);
      // 常见错误友好提示
      if (/401|invalid_api_key|Incorrect API key/i.test(msg)) {
        msg = 'API Key 无效或已过期。请检查 [StepFun 控制台](https://platform.stepfun.com/) 重新生成。';
      } else if (/429|rate_limit/i.test(msg)) {
        msg = '请求太频繁被限流，请稍等 30 秒再试。';
      } else if (/CORS|Network|Failed to fetch/i.test(msg)) {
        msg = '浏览器直接调用 API 被 CORS 拦截。解决方法：\n1) 用本地服务器打开（见 README），或\n2) 部署到 Vercel / Netlify（推荐），或\n3) 使用浏览器插件关闭 CORS。';
      }
      showError(msg);
    } finally {
      els.analyzeBtn.disabled = false;
      els.analyzeBtn.innerHTML = '<span>🔍</span><span>开始 AI 体检</span>';
    }
  });

  // ==========================================================
  // 初始化
  // ==========================================================
  function init() {
    const saved = localStorage.getItem(KEY_STORAGE);
    if (saved) {
      els.apiKeyInput.value = saved;
      setKeyStatus(true);
    }
    updateCharCount();
  }

  init();
})();
