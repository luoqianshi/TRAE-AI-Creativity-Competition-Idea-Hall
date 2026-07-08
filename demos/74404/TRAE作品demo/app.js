/* ===== VibeGym｜AI 造物训练场 · 逻辑 ===== */

// ===== 训练包数据 =====
// 每个样例包带 idea（输入文本）与 key（用于切换）
const PACKS = {
  rumor: {
    key: 'rumor',
    idea: '我想做一个家庭群谣言翻译官，帮爸妈鉴别养生链接和诈骗话术，还能生成他们好接受的回复。',
    name: '家庭群谣言翻译官',
    summary: '把长辈转发的消息，转成可信度判断、核实清单和温和回复，减少家庭沟通摩擦。',
    score: 88,
    mvp: ['粘贴消息', '可信度等级', '可疑信号', '核实步骤', '温和回复'],
    risk: '不做医学结论，只做信息核查和沟通辅助。',
    prompt: '请实现一个家庭群信息核查 Demo。用户粘贴一段转发内容后，页面输出可信度等级、可疑信号、核实步骤，以及适合发给长辈的温和回复。第一版只使用内置样例模拟 AI 结果，不接真实 API，不做医学诊断。',
    similar: ['谣言核查助手', '家庭沟通翻译器', '反诈提醒卡'],
    health: { context: 90, boundary: 85, acceptance: 80 },
    roadmap: [
      { step: '01', title: '静态样例', desc: '内置 3 条转发消息，模拟可信度判断与回复输出。' },
      { step: '02', title: '交互闭环', desc: '粘贴任意内容，前端规则匹配生成结果，可复制回复。' },
      { step: '03', title: '打磨发布', desc: '移动端首屏适配、60 秒演示路径、检查清单全部通过。' },
    ],
  },
  focus: {
    key: 'focus',
    idea: '我想做一个番茄钟专注计时器，能记录今天完成了几个番茄，超时提醒我休息。',
    name: '番茄专注计时器',
    summary: '一个极简番茄钟，记录当日完成数，到点震动提醒休息，帮新手守住专注节奏。',
    score: 82,
    mvp: ['开始/暂停', '25 分钟倒计时', '今日完成数', '休息提醒', '重置'],
    risk: '第一版不接通知权限，只用页面声音与视觉提示，避免权限弹窗卡住体验。',
    prompt: '请实现一个番茄钟专注计时器 Demo。页面有 25 分钟倒计时、开始/暂停按钮、今日完成数显示，倒计时结束后播放轻提示音并切换到 5 分钟休息。第一版只用前端 setInterval，不接推送通知，不接后端，移动端首屏可用。',
    similar: ['番茄 ToDo', '专注森林轻量版', '极简计时器'],
    health: { context: 86, boundary: 80, acceptance: 78 },
    roadmap: [
      { step: '01', title: '跑通倒计时', desc: '25 分钟倒计时 + 开始/暂停，结束后给出视觉反馈。' },
      { step: '02', title: '加计数与休息', desc: '记录今日完成数，自动切到 5 分钟休息倒计时。' },
      { step: '03', title: '打磨发布', desc: '声音提醒、移动端适配、60 秒演示路径。' },
    ],
  },
  pantry: {
    key: 'pantry',
    idea: '我想做一个食材库存雷达，扫码或手动录入家里有的食材，快过期时提醒我先用它。',
    name: '食材库存雷达',
    summary: '手动录入食材与保质期，按到期日排序，临期自动标红并推荐先用，减少家庭浪费。',
    score: 76,
    mvp: ['录入食材', '保质期日期', '临期标红', '排序清单', '临期提醒'],
    risk: '第一版不接扫码 SDK 与数据库，数据存 localStorage，避免复杂依赖与隐私问题。',
    prompt: '请实现一个食材库存雷达 Demo。用户可手动添加食材名称与保质期，页面按到期日排序，临期 3 天内的食材标红置顶，并提供一条临期提醒文案。第一版数据存 localStorage，不接扫码、不接后端，移动端首屏可用。',
    similar: ['冰箱清单', '临期提醒卡', '家庭库存小工具'],
    health: { context: 82, boundary: 74, acceptance: 72 },
    roadmap: [
      { step: '01', title: '录入与列表', desc: '添加食材 + 保质期，按到期日排序展示。' },
      { step: '02', title: '临期逻辑', desc: '临期 3 天标红置顶，顶部给出提醒文案。' },
      { step: '03', title: '打磨发布', desc: 'localStorage 持久化、删除条目、移动端适配。' },
    ],
  },
  vocab: {
    key: 'vocab',
    idea: '我想做一个单词记忆卡，每天推 5 个词，能翻面看释义，标记记不记得，第二天复习错过的。',
    name: '单词记忆卡',
    summary: '每日 5 词翻卡片，正面单词背面释义，标记记得/不记得，次日只复习错过的词。',
    score: 90,
    mvp: ['每日 5 词', '翻卡交互', '记得/不记得', '错词次日复习', '进度统计'],
    risk: '第一版词库内置 30 词，不接翻译 API，避免密钥与频率限制风险。',
    prompt: '请实现一个单词记忆卡 Demo。页面每日展示 5 个单词卡片，点击翻面看释义，每张卡有「记得/不记得」按钮，不记得的词次日自动进入复习队列。第一版词库内置 30 个单词，进度存 localStorage，不接翻译 API，不接后端，移动端首屏可用。',
    similar: ['Anki 极简版', '每日单词卡', '翻卡片背词'],
    health: { context: 92, boundary: 88, acceptance: 90 },
    roadmap: [
      { step: '01', title: '翻卡与判定', desc: '5 张卡片翻面看释义，标记记得/不记得。' },
      { step: '02', title: '复习队列', desc: '不记得的词次日进入复习，进度存 localStorage。' },
      { step: '03', title: '打磨发布', desc: '进度统计、移动端翻卡手势、60 秒演示路径。' },
    ],
  },
};

// 样例展示顺序
const SAMPLE_ORDER = ['rumor', 'focus', 'pantry', 'vocab'];

// 关键词匹配（用于「输入新想法 → 命中预设样例」）
const KEYWORDS = {
  rumor: ['谣言', '家庭', '长辈', '爸妈', '养生', '诈骗', '转发', '辟谣', '反诈'],
  focus: ['番茄', '专注', '计时', '倒计时', '休息提醒', '钟'],
  pantry: ['食材', '库存', '冰箱', '保质期', '临期', '过期'],
  vocab: ['单词', '背词', '记忆卡', '翻卡', '背单词', '词汇'],
};

// ===== 工具函数 =====
const $ = (id) => document.getElementById(id);

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function showToast(msg) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), 1600);
}

// ===== 匹配预设样例 =====
function matchPack(idea) {
  const text = (idea || '').toLowerCase();
  if (!text) return { pack: PACKS.rumor, isSample: true };
  for (const key of SAMPLE_ORDER) {
    if (KEYWORDS[key].some(k => text.includes(k.toLowerCase()))) {
      return { pack: PACKS[key], isSample: true };
    }
  }
  return { pack: generateCustomPack(idea), isSample: false };
}

// ===== 根据任意想法生成基础训练包 =====
function generateCustomPack(idea) {
  const text = idea.trim();
  // 取前 12 个字作为项目名，过长则截断
  let name = text.length <= 12 ? text : text.slice(0, 12) + '…';
  // 去掉句末标点
  name = name.replace(/[，。.,！!？?…]+$/g, '');
  if (!name) name = '你的造物';

  return {
    key: 'custom',
    idea: text,
    name,
    summary: `基于「${text.slice(0, 24)}${text.length > 24 ? '…' : ''}」切出的最小可用闭环。先跑通一条输入到输出的主线，再考虑扩展。`,
    score: 70,
    mvp: ['核心输入', '单一输出', '一个样例', '复制结果'],
    risk: '第一版不接真实 API，所有结果用内置样例模拟，避免密钥与稳定性风险。',
    prompt: `请实现一个最小可用 Demo。需求来源：「${text}」。用户输入内容后，页面输出结构化结果。第一版只使用内置样例模拟 AI 结果，不接真实 API，不依赖外部密钥，移动端首屏可用，单文件即可运行。`,
    similar: ['同类最小 Demo', '表单到结果', '单页工具'],
    health: { context: 76, boundary: 72, acceptance: 68 },
    roadmap: [
      { step: '01', title: '跑通样例', desc: '一条输入对应一条输出，先证明闭环成立。' },
      { step: '02', title: '加交互', desc: '让用户能自由输入并复制结果。' },
      { step: '03', title: '打磨发布', desc: '移动端、演示路径、检查清单逐项过。' },
    ],
  };
}

// ===== 渲染训练包 =====
function renderPack(pack, statusType) {
  $('pName').textContent = pack.name;
  $('pSummary').textContent = pack.summary;
  $('pScore').textContent = pack.score;
  $('pScoreBar').style.width = pack.score + '%';
  $('pRisk').textContent = pack.risk;
  $('pPrompt').textContent = pack.prompt;

  $('pMvp').innerHTML = pack.mvp.map(m => `<span class="tag">${escapeHTML(m)}</span>`).join('');

  $('similarList').innerHTML = pack.similar
    .map(s => `<span class="tag tag-soft">${escapeHTML(s)}</span>`).join('');

  $('hContext').textContent = pack.health.context;
  $('hContextBar').style.width = pack.health.context + '%';
  $('hBoundary').textContent = pack.health.boundary;
  $('hBoundaryBar').style.width = pack.health.boundary + '%';
  $('hAccept').textContent = pack.health.acceptance;
  $('hAcceptBar').style.width = pack.health.acceptance + '%';

  $('roadmapList').innerHTML = pack.roadmap
    .map(r => `
      <li class="roadmap-step">
        <span class="step-num">${escapeHTML(r.step)}</span>
        <div class="step-body">
          <h4 class="step-title">${escapeHTML(r.title)}</h4>
          <p class="step-desc">${escapeHTML(r.desc)}</p>
        </div>
      </li>`).join('');

  const status = $('packStatus');
  const label = { sample: '样例', fresh: '已生成', custom: '自定义' }[statusType] || '样例';
  status.textContent = label;
  status.classList.toggle('fresh', statusType === 'fresh' || statusType === 'custom');
}

// ===== 渲染样例切换器 =====
function renderSamples(activeKey) {
  const wrap = $('sampleChips');
  if (!wrap) return;
  wrap.innerHTML = SAMPLE_ORDER.map(k => {
    const p = PACKS[k];
    const isActive = k === activeKey;
    const active = isActive ? ' active' : '';
    const pressed = isActive ? 'true' : 'false';
    return `<button class="chip${active}" data-sample="${k}" type="button" aria-pressed="${pressed}">${escapeHTML(p.name)}</button>`;
  }).join('');
  wrap.querySelectorAll('.chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.sample;
      const pack = PACKS[key];
      $('idea').value = pack.idea;
      currentPack = pack;
      renderPack(pack, 'sample');
      renderSamples(key);
      showToast('已切换样例：' + pack.name);
    });
  });
}

// ===== 复制 Prompt =====
function handleCopyPrompt() {
  const text = $('pPrompt').textContent;
  const btn = $('copyPrompt');
  const done = () => {
    btn.textContent = '已复制';
    btn.classList.add('copied');
    showToast('Prompt 已复制');
    setTimeout(() => {
      btn.textContent = '复制 Prompt';
      btn.classList.remove('copied');
    }, 1500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done)();
  }
}

function fallbackCopy(text, done) {
  return () => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { showToast('复制失败，请手动选中'); }
    document.body.removeChild(ta);
  };
}

// ===== 导出 Markdown 报告（随当前项目变化） =====
function handleExport() {
  const pack = currentPack || PACKS.rumor;
  const md = buildMarkdown(pack);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (pack.name || 'report').replace(/[\\/:*?"<>|]/g, '_');
  a.href = url;
  a.download = `vibegym-${safeName}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('报告已导出');
}

function buildMarkdown(pack) {
  const line = '---';
  const mvp = pack.mvp.map(m => `- ${m}`).join('\n');
  const similar = pack.similar.map(s => `- ${s}`).join('\n');
  const roadmap = pack.roadmap
    .map(r => `${r.step} ${r.title}：${r.desc}`).join('\n');
  return `# VibeGym 训练包 · ${pack.name}

${line}

## 项目摘要
${pack.summary}

## 可造性评分
**${pack.score} / 100**

## MVP 功能范围
${mvp}

## 风险提示
${pack.risk}

## 相似项目参考
${similar}

## V0 路线图
${roadmap}

## 可复制的开工 Prompt
\`\`\`
${pack.prompt}
\`\`\`

## Prompt 体检
- 上下文完整度：${pack.health.context}
- 边界约束清晰度：${pack.health.boundary}
- 验收标准明确度：${pack.health.acceptance}

${line}
由 VibeGym · AI 造物训练场 生成
`;
}

// ===== 发布体检 =====
function bindCheckup() {
  const inputs = document.querySelectorAll('.checkup-input');
  const fill = $('meterFill');
  const count = $('meterCount');
  const tip = $('meterTip');
  const tips = [
    '还没开始体检，先把默认样例跑通。',
    '样例能跑了，继续把密钥安全过一遍。',
    '密钥安全 OK，别忘了移动端首屏。',
    '移动端没问题，把 60 秒演示路径走一遍。',
    '演示路径通了，最后生成项目记忆卡。',
    '全部通过，可以发布了。🚀',
  ];
  const update = () => {
    const n = [...inputs].filter(i => i.checked).length;
    count.textContent = n;
    fill.style.width = (n / inputs.length * 100) + '%';
    tip.textContent = tips[n];
  };
  inputs.forEach(i => i.addEventListener('change', update));
  update();
}

// ===== 锚点平滑滚动（带导航偏移） =====
function bindAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.pageYOffset - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ===== 当前训练包状态（供导出使用） =====
let currentPack = PACKS.rumor;

// ===== 初始化 =====
function init() {
  renderPack(PACKS.rumor, 'sample');
  renderSamples('rumor');

  $('generate').addEventListener('click', () => {
    const idea = $('idea').value.trim();
    const { pack, isSample } = matchPack(idea);
    currentPack = pack;
    if (!idea) {
      renderPack(pack, 'sample');
      renderSamples(pack.key);
      showToast('已载入样例：' + pack.name);
      return;
    }
    if (isSample) {
      renderPack(pack, 'fresh');
      renderSamples(pack.key);
      showToast('命中预设样例：' + pack.name);
    } else {
      renderPack(pack, 'custom');
      renderSamples(null);
      showToast('已生成自定义训练包');
    }
  });

  // 输入框获得焦点时，取消样例高亮（提示进入自定义模式）
  $('idea').addEventListener('focus', () => {
    const active = document.querySelector('.chip.active');
    if (active && $('idea').value.trim() !== PACKS[active.dataset.sample].idea.trim()) {
      active.classList.remove('active');
    }
  });

  $('copyPrompt').addEventListener('click', handleCopyPrompt);
  $('exportReport').addEventListener('click', handleExport);
  bindCheckup();
  bindAnchors();
}

document.addEventListener('DOMContentLoaded', init);
