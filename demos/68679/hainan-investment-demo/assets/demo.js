// assets/demo.js — Interactive Demo Logic

// ===== DATA =====
var AGENTS = [
  { id: 'team-lead', name: 'Team Lead 主理人', role: '总体编排 / 最终决策', icon: '\u{1F3AF}', phase: 'lead', detail: '负责整个研判流程的编排调度、最终决策和正式版本发布。' },
  { id: 'deputy-lead', name: 'Deputy Lead 副主理人', role: '进度监控 / 产物校验', icon: '\u{1F4CB}', phase: 'lead', detail: '监控各阶段进度、校验产物质量、初步合并内容、执行降级兜底。' },
  { id: 'data-collection', name: '统一数据采集专员', role: 'Phase 0 数据采集', icon: '\u{1F50D}', phase: 'data', detail: '调用企查查/天眼查/法律数据/搜索工具等，采集企业全量数据写入 raw_data.db。' },
  { id: 'negative-intel', name: '负面情报专员', role: 'Phase 0.5 负面扫描', icon: '\u{26A0}\u{FE0F}', phase: 'negative', detail: '基于 raw_data.db 生成负面情报扫描卡，判定红灯/橙灯/绿灯闸门。' },
  { id: 'company-intel', name: '企业情报专员', role: 'Phase 1 企业画像', icon: '\u{1F4E2}', phase: 'analysis', detail: '生成企业情报卡：工商注册、股权结构、核心业务、竞争优势等。' },
  { id: 'policy-compliance', name: '政策法规专员', role: 'Phase 1 政策适配', icon: '\u{1F4DC}', phase: 'analysis', detail: '对照海南自贸港政策与产业准入清单，生成政策适配卡。' },
  { id: 'industry-research', name: '行业研究专员', role: 'Phase 1 行业研究', icon: '\u{1F4CA}', phase: 'analysis', detail: '生成行业研究卡：行业格局、竞争态势、发展趋势、技术路线。' },
  { id: 'risk-control', name: '风控专员', role: 'Phase 2 风控审查', icon: '\u{1F6E1}\u{FE0F}', phase: 'risk', detail: '生成财务健康度评估卡、资本结构穿透卡、风控结论终稿。' },
  { id: 'entrepreneur-portrait', name: '企业家画像专员', role: 'Phase 2 人物画像', icon: '\u{1F464}', phase: 'risk', detail: '生成企业家画像卡：教育背景、创业履历、政商关系、社会声誉。' },
  { id: 'strategy-analyst', name: '战略分析专员', role: 'Phase 3 战略研究', icon: '\u{1F3AF}', phase: 'strategy', detail: '生成商业模式可行性、招商可行性、可持续性分析、合作模式推衍卡。' },
  { id: 'report-writer', name: '报告撰写专员', role: 'Phase 4 报告生成', icon: '\u{1F4DD}', phase: 'report', detail: '基于所有卡片生成候选稿 Markdown 报告。' },
  { id: 'quality-reviewer', name: '质量审查专员', role: 'Phase 5 质量把关', icon: '\u{2705}', phase: 'quality', detail: '数据覆盖矩阵检查、按需补充搜索、终稿审查。' }
];

var PHASES = [
  { id: 'phase0', label: 'Phase 0：统一原始数据采集', agents: ['data-collection'], output: 'raw_data.db', tag: '数据层' },
  { id: 'phase05', label: 'Phase 0.5：NID-IPA 负面情报扫描', agents: ['negative-intel'], output: '负面情报扫描卡', tag: '闸门' },
  { id: 'phase1', label: 'Phase 1：全并行分析', agents: ['company-intel', 'policy-compliance', 'industry-research'], output: '企业情报卡 / 政策适配卡 / 行业研究卡', tag: '并行' },
  { id: 'phase2', label: 'Phase 2：风控审查与企业家画像', agents: ['risk-control', 'entrepreneur-portrait'], output: '风控结论 / 企业家画像卡', tag: '串+并' },
  { id: 'phase3', label: 'Phase 3：战略分析（全并行）', agents: ['strategy-analyst'], output: '商业模式 / 招商可行性 / 可持续性 / 合作模式卡', tag: '并行' },
  { id: 'phase4', label: 'Phase 4：报告撰写（候选稿）', agents: ['report-writer'], output: '候选稿 Markdown', tag: '串行' },
  { id: 'phase5', label: 'Phase 5：质量审查与补充搜索', agents: ['quality-reviewer'], output: '质量审查意见', tag: '串行' },
  { id: 'phase6', label: 'Phase 6：终稿发布', agents: ['team-lead', 'deputy-lead'], output: '正式版报告', tag: '发布' }
];

var REDLIGHTS = [
  { id: 1, title: '负面清单红灯', desc: '主营业务在地方产业准入负面清单或国家产业结构调整淘汰类' },
  { id: 2, title: '僵尸复活红灯', desc: '实控人名下有问题企业换壳、频繁变更法人/股东' },
  { id: 3, title: '环保安全埋雷红灯', desc: '高污染高能耗新建限制、历史环保/安全处罚未整改' },
  { id: 4, title: '资本结构红灯', desc: '政府 LP 持股过高、对赌/回购/返投条款密集、明股实债嫌疑' },
  { id: 5, title: '扩张模式红灯', desc: '主业非前三且市占率低、同时布局多个无关赛道、扩张过快' },
  { id: 6, title: '落地实质红灯', desc: '轻资产注册但承诺重资产投资、注册地与实际运营分离' },
  { id: 7, title: '风险隔离红灯', desc: '母体轻持股 + BU 独立法人、关联交易复杂、担保圈复杂' },
  { id: 8, title: '政策合规红灯', desc: '返投比例过高、上市对赌、行业准入受限、政策直接冲击企业模式' }
];

// ===== INIT UI =====
function initAgentGrid() {
  var grid = document.getElementById('agentGrid');
  if (!grid) return;
  grid.innerHTML = AGENTS.map(function(a) {
    return '<div class="agent-card phase-' + a.phase + '" id="agent-card-' + a.id + '">' +
      '<div class="agent-icon">' + a.icon + '</div>' +
      '<div class="agent-name">' + a.name + '</div>' +
      '<div class="agent-role">' + a.role + '</div>' +
      '<div class="agent-detail">' + a.detail + '</div>' +
    '</div>';
  }).join('');
}

function initPhaseTimeline() {
  var tl = document.getElementById('phaseTimeline');
  if (!tl) return;
  tl.innerHTML = PHASES.map(function(p) {
    return '<div class="phase-item" id="' + p.id + '">' +
      '<div class="phase-dot"></div>' +
      '<div class="phase-header">' +
        '<span class="phase-label">' + p.label + '</span>' +
        '<span class="phase-tag">' + p.tag + '</span>' +
      '</div>' +
      '<div class="phase-agents">' +
        p.agents.map(function(aid) {
          var agent = AGENTS.find(function(x) { return x.id === aid; });
          return '<span class="phase-agent-chip">' + (agent ? agent.name : aid) + '</span>';
        }).join('') +
      '</div>' +
      '<div class="phase-output">产出：' + p.output + '</div>' +
    '</div>';
  }).join('');
}

function initRedlights() {
  var grid = document.getElementById('redlightGrid');
  if (!grid) return;
  grid.innerHTML = REDLIGHTS.map(function(rl) {
    return '<div class="redlight-card rl-pass" id="rl-' + rl.id + '">' +
      '<span class="redlight-num">0' + rl.id + '</span>' +
      '<div class="rl-title"><span class="redlight-indicator"></span>' + rl.title + '</div>' +
      '<div class="rl-desc">' + rl.desc + '</div>' +
    '</div>';
  }).join('');
}

// ===== LOGGING =====
function getTimestamp() {
  var d = new Date();
  return String(d.getHours()).padStart(2,'0') + ':' +
         String(d.getMinutes()).padStart(2,'0') + ':' +
         String(d.getSeconds()).padStart(2,'0') + '.' +
         String(d.getMilliseconds()).padStart(3,'0');
}

function addLog(agent, message, type) {
  var body = document.getElementById('consoleBody');
  var title = document.getElementById('consoleTitle');
  type = type || 'action';
  var line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = '<span class="log-time">[' + getTimestamp() + ']</span> ' +
    (agent ? '<span class="log-agent">[' + agent + ']</span> ' : '') +
    '<span class="log-' + type + '">' + message + '</span>';
  if (body.querySelector('div[style]')) body.innerHTML = '';
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
  if (title) {
    title.textContent = 'Agent 运行日志 — 运行中 (' + body.querySelectorAll('.log-line').length + ' 条)';
  }
}

function setProgress(pct) {
  var fill = document.getElementById('progressFill');
  if (fill) fill.style.width = pct + '%';
}

function setPhaseStatus(phaseId, status) {
  var el = document.getElementById(phaseId);
  if (el) {
    el.classList.remove('running', 'done', 'error');
    if (status) el.classList.add(status);
  }
}

function setAgentActive(agentId, active) {
  var el = document.getElementById('agent-card-' + agentId);
  if (el) {
    if (active) el.classList.add('active');
    else el.classList.remove('active');
  }
}

function addResultCard(title, content, badge, badgeClass) {
  var container = document.getElementById('resultCards');
  if (!container) return;
  var card = document.createElement('div');
  card.className = 'result-card';
  card.innerHTML = '<div class="result-card-header">' +
    '<span class="result-card-title">' + title + '</span>' +
    '<span class="result-card-badge ' + badgeClass + '">' + badge + '</span>' +
    '</div>' +
    '<div style="font-size:0.85rem;color:var(--muted);line-height:1.7;">' + content + '</div>';
  container.appendChild(card);
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showGrade(grade, score, summary) {
  var el = document.getElementById('finalGrade');
  if (!el) return;
  var gradeClass = 'grade-' + grade.charAt(0);
  el.style.display = 'block';
  el.innerHTML = '<div class="result-card">' +
    '<div class="grade-display">' +
      '<div class="grade-circle ' + gradeClass + '">' + grade + '</div>' +
      '<div style="font-size:1.2rem;font-weight:700;">综合评分：' + score + ' 分</div>' +
      '<div style="font-size:0.85rem;color:var(--muted);margin-top:0.5rem;">' + summary + '</div>' +
    '</div>' +
  '</div>';
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showReportPreview(companyName, reportType) {
  var el = document.getElementById('reportPreview');
  if (!el) return;
  var now = new Date();
  var ts = now.getFullYear() +
    String(now.getMonth()+1).padStart(2,'0') +
    String(now.getDate()).padStart(2,'0') +
    String(now.getHours()).padStart(2,'0') +
    String(now.getMinutes()).padStart(2,'0');
  el.style.display = 'block';
  el.innerHTML = '<div class="report-preview">' +
    '<div class="report-preview-header">' +
      '<span class="report-preview-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>' +
      '<span style="font-weight:600;font-size:0.9rem;">' + reportType + '_' + companyName + '_' + ts + '_v1.0.0.md</span>' +
    '</div>' +
    '<div class="report-preview-body">' +
      '<h3>一、执行摘要</h3>' +
      '<p>本报告由海南区县招商研判智能体（12 Agent 协作）自动生成。基于统一数据采集层 raw_data.db 中的工商、司法、财务、舆情等多源数据，经过八大红灯初筛、七维差重评分及多阶段交叉验证，形成以下研判结论。</p>' +
      '<h3>二、企业基本信息</h3>' +
      '<p><strong>企业名称：</strong>' + companyName + '<br>' +
      '<strong>研判类型：</strong>' + reportType + '<br>' +
      '<strong>生成时间：</strong>' + now.toLocaleString('zh-CN') + '<br>' +
      '<strong>分析深度：</strong>标准版<br>' +
      '<strong>数据来源置信度：</strong>A 级（企查查/天眼查交叉验证）</p>' +
      '<h3>三、八大红灯初筛结果</h3>' +
      '<p>经八大红灯初筛系统检测，该企业未命中任何一票否决项，可进入完整分析流程。</p>' +
      '<h3>四、七维评分详情</h3>' +
      '<p>信用与合规风险：85/100（权重20%）| 财务健康度：82/100（权重15%）| 经营稳定性：88/100（权重15%）| 行业与市场风险：78/100（权重10%）| 政策与落地风险：80/100（权重15%）| 实控人与治理风险：75/100（权重15%）| 政商关系与基金合作风险：70/100（权重10%）</p>' +
      '<h3>五、核心发现</h3>' +
      '<p>1. 企业在目标行业中处于头部位置，技术研发投入占比超过 15%，具备核心技术壁垒。<br>' +
      '2. 企业治理结构清晰，股权集中度适中，未发现异常关联交易。<br>' +
      '3. 与海南自贸港重点产业方向高度契合，可享受相关政策优惠。<br>' +
      '4. 建议采用「产业园区入驻 + 政府产业基金跟投」的合作模式。</p>' +
      '<h3>六、风险提示</h3>' +
      '<p>1. 企业近期扩张速度较快，需关注现金流承压风险。<br>' +
      '2. 部分核心专利存在诉讼纠纷，建议进一步法律尽调。<br>' +
      '3. 行业竞争加剧，需评估其市场地位的可持续性。</p>' +
      '<h3>七、招商建议</h3>' +
      '<p>综合评分 A 级，建议招引。建议地方政府主动对接，以「招商+投资」联动模式推进合作，同时设置阶段性里程碑对赌条款以控制风险。</p>' +
    '</div>' +
  '</div>';
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===== DEMO ENGINE =====
var demoRunning = false;
var demoTimers = [];

function delay(ms) {
  return new Promise(function(resolve) {
    var t = setTimeout(resolve, ms);
    demoTimers.push(t);
  });
}

async function runPhase(phaseId, label, agentIds, logs, duration) {
  setPhaseStatus(phaseId, 'running');
  agentIds.forEach(function(aid) { setAgentActive(aid, true); });

  // staggered logs
  var logInterval = Math.max(100, Math.floor(duration / logs.length));
  for (var i = 0; i < logs.length; i++) {
    var log = logs[i];
    addLog(log.agent, log.msg, log.type || 'action');
    if (i < logs.length - 1) await delay(logInterval);
  }

  setPhaseStatus(phaseId, 'done');
  agentIds.forEach(function(aid) { setAgentActive(aid, false); });
}

async function startDemo() {
  if (demoRunning) return;
  demoRunning = true;
  var btn = document.getElementById('btnStart');
  btn.disabled = true;

  var company = document.getElementById('companyName').value || '追觅科技';
  var reportType = document.getElementById('reportType').value || '企业招商分析报告';
  var depth = document.getElementById('analysisDepth').value || '标准版';

  // Reset
  resetDemo(false);
  addLog('system', '========== 招商研判启动 ==========', 'success');
  addLog('system', '目标企业：' + company + ' | 报告类型：' + reportType + ' | 深度：' + depth, 'action');

  setProgress(5);
  await delay(600);

  // Phase 0
  await runPhase('phase0', '统一数据采集', ['data-collection'], [
    { agent: 'Team Lead', msg: '调度 data-collection-agent 启动 Phase 0 统一数据采集...' },
    { agent: '数据采集', msg: '调用企查查 MCP 查询「' + company + '」工商信息...' },
    { agent: '数据采集', msg: '调用华宇元典法律数据 MCP 查询司法/行政处罚记录...' },
    { agent: '数据采集', msg: '调用 WebSearch 搜索企业最新动态与舆情信息...' },
    { agent: '数据采集', msg: '调用 IMA 知识库查询海南自贸港相关政策原文...' },
    { agent: '数据采集', msg: '数据写入 raw_data.db 完成 — 共采集 5 类 47 条记录' },
    { agent: '数据采集', msg: 'Phase 0 完成，耗时约 3 分钟。', 'success' }
  ], 2800);
  setProgress(15);
  await delay(400);

  // Phase 0.5
  await runPhase('phase05', '负面情报扫描', ['negative-intel'], [
    { agent: 'Team Lead', msg: '调度 negative-intelligence-agent 启动 Phase 0.5...' },
    { agent: '负面情报', msg: '读取 raw_data.db，执行负面情报扫描...' },
    { agent: '负面情报', msg: '扫描八大红灯项：负面清单 / 僵尸复活 / 环保安全 / 资本结构 / 扩张模式 / 落地实质 / 风险隔离 / 政策合规' },
    { agent: '负面情报', msg: '交叉验证：负面信息需 >= 2 个独立来源确认...' },
    { agent: '负面情报', msg: '扫描完成 — 未命中红灯，绿灯通过。', 'success' },
    { agent: 'Team Lead', msg: '闸门判定：绿灯，正常运行。', 'success' }
  ], 2200);
  setProgress(25);
  await delay(400);

  // Red light animation
  REDLIGHTS.forEach(function(rl, i) {
    (function(idx) {
      setTimeout(function() {
        var card = document.getElementById('rl-' + (idx + 1));
        if (card) card.classList.add('rl-pass');
      }, 300 + idx * 100);
    })(i);
  });

  // Phase 1
  await runPhase('phase1', '全并行分析', ['company-intel', 'policy-compliance', 'industry-research'], [
    { agent: 'Deputy Lead', msg: 'Phase 1 启动：3 个 Agent 并行分析...' },
    { agent: '企业情报', msg: '读取 raw_data.db → 生成企业情报卡...' },
    { agent: '政策适配', msg: '对照海南自贸港产业准入清单 → 生成政策适配卡...' },
    { agent: '行业研究', msg: '分析行业竞争格局与技术趋势 → 生成行业研究卡...' },
    { agent: 'Deputy Lead', msg: '目录校验：3 张卡片全部生成，数据完整性 98%', 'success' },
    { agent: 'Deputy Lead', msg: 'Phase 1 完成，耗时约 5 分钟。', 'success' }
  ], 2600);
  setProgress(40);
  await delay(400);

  addResultCard('企业情报卡', '工商注册：' + company + ' | 注册资本：5000万元 | 行业：智能清洁设备制造 | 核心业务：智能扫地机器人、无线吸尘器 | 竞争优势：高速数字马达、AI视觉导航算法 | 数据来源置信度：A', '已生成', 'badge-green');
  await delay(300);
  addResultCard('政策适配卡', '自贸港政策匹配度：高 | 产业方向：高端装备制造（鼓励类）| 税收优惠：企业所得税 15% | 进口设备免税：适用 | 人才引进：符合高层次人才标准 | 建议：积极对接', '适配度高', 'badge-green');
  await delay(300);
  addResultCard('行业研究卡', '行业：智能清洁电器 | 全球市场规模：$28B（2025E）| 国内增速：22% CAGR | 竞争格局：CR5 约 65% | 技术趋势：AI + 多传感器融合 | 门槛：高速马达 + 算法', '行业前景好', 'badge-green');

  // Phase 2
  await runPhase('phase2', '风控审查与企业家画像', ['risk-control', 'entrepreneur-portrait'], [
    { agent: 'Team Lead', msg: 'Phase 2 启动：风控审查 + 企业家画像并行...' },
    { agent: '风控专员', msg: '财务健康度评估中...营收 CAGR 35%，净利润率 12%，负债率 42%' },
    { agent: '风控专员', msg: '资本结构穿透中...未发现政府 LP 异常持股，对赌条款合理' },
    { agent: '风控专员', msg: '风控结论：综合风险可控，B+ 偏乐观', 'success' },
    { agent: '企业家画像', msg: '生成企业家画像卡...教育背景：名校工科 | 创业经历：连续创业者 | 社会声誉：良好', 'success' },
    { agent: 'Team Lead', msg: 'Phase 2 完成，耗时约 8 分钟。', 'success' }
  ], 3000);
  setProgress(55);
  await delay(400);

  addResultCard('风控结论卡', '财务健康度：82/100（良好）| 资本结构：85/100（清晰）| 综合风控评级：B+ 偏乐观 | 主要风险：扩张速度偏快、部分专利诉讼中 | 建议：设置阶段性里程碑对赌', '风险可控', 'badge-orange');

  // Phase 3
  await runPhase('phase3', '战略分析', ['strategy-analyst'], [
    { agent: 'Team Lead', msg: 'Phase 3 启动：战略分析专员四维并行分析...' },
    { agent: '战略分析', msg: '3A 商业模式与项目可行性分析中...' },
    { agent: '战略分析', msg: '3B 招商可行性研究：产业契合度高、落地意愿中等...' },
    { agent: '战略分析', msg: '3C 商业模式可持续性：技术壁垒显著、但需关注代工依赖...' },
    { agent: '战略分析', msg: '3D 合作模式推衍：推荐「产业园区入驻 + 基金跟投」方案', 'success' },
    { agent: '战略分析', msg: 'Phase 3 完成，耗时约 10 分钟。', 'success' }
  ], 3000);
  setProgress(70);
  await delay(400);

  addResultCard('合作模式推衍卡', '推荐模式：产业园区入驻 + 政府产业基金跟投<br>建议股权比例：政府基金 10-15%，企业 85-90%<br>对赌条款：营收增速不低于 20%/年，三年内完成二期投资<br>返投比例：1:1.2（合理区间）<br>风险提示：未发现明股实债/利润转移/债务留置嫌疑', '推荐合作', 'badge-blue');

  // Phase 4
  await runPhase('phase4', '报告撰写', ['report-writer'], [
    { agent: 'Team Lead', msg: 'Phase 4 启动：报告撰写专员生成候选稿...' },
    { agent: '报告撰写', msg: '读取全部中间卡片，按照模板生成 ' + reportType + '...' },
    { agent: '报告撰写', msg: '目录结构校验：7 个章节完整，引用 12 张分析卡片...' },
    { agent: '报告撰写', msg: '候选稿生成完成，共 3500 字。', 'success' }
  ], 2400);
  setProgress(82);
  await delay(400);

  // Phase 5
  await runPhase('phase5', '质量审查', ['quality-reviewer'], [
    { agent: 'Team Lead', msg: 'Phase 5 启动：质量审查专员检查...' },
    { agent: '质量审查', msg: '数据覆盖矩阵检查：核心字段覆盖率 96%...' },
    { agent: '质量审查', msg: 'Top 5 缺失字段补充搜索（3/5 已补充）...' },
    { agent: '质量审查', msg: '终稿审查通过，质量评分：A-', 'success' }
  ], 2000);
  setProgress(90);
  await delay(400);

  // Phase 6
  await runPhase('phase6', '终稿发布', ['team-lead', 'deputy-lead'], [
    { agent: 'Deputy Lead', msg: '执行目录校验与产物完整性检查...' },
    { agent: 'Deputy Lead', msg: '校验通过：14 个中间产物齐全，命名规范正确', 'success' },
    { agent: 'Team Lead', msg: '终稿审核通过，发布正式版本 v1.0.0' },
    { agent: 'Team Lead', msg: '研判完成！共耗时约 35 分钟（模拟）', 'success' }
  ], 1800);
  setProgress(100);

  addLog('system', '========== 研判流程全部完成 ==========', 'success');

  // Show final grade
  showGrade('A', '83', '综合评分 A 级 — 建议招引。' + company + '在智能清洁设备行业处于领先地位，技术壁垒显著，与海南自贸港产业方向高度契合。建议采用「产业园区入驻 + 政府产业基金跟投」合作模式。');

  // Show report preview
  await delay(500);
  showReportPreview(company, reportType);

  // Update console title
  document.getElementById('consoleTitle').textContent = 'Agent 运行日志 — 已完成';

  demoRunning = false;
  btn.disabled = false;
}

function resetDemo(resetBtn) {
  if (resetBtn !== false) {
    demoTimers.forEach(function(t) { clearTimeout(t); });
    demoTimers = [];
    demoRunning = false;
    var btn = document.getElementById('btnStart');
    if (btn) btn.disabled = false;
  }

  setProgress(0);
  PHASES.forEach(function(p) { setPhaseStatus(p.id, null); });
  AGENTS.forEach(function(a) { setAgentActive(a.id, false); });

  var body = document.getElementById('consoleBody');
  if (body) body.innerHTML = '<div style="color:var(--muted);text-align:center;padding:2rem;">点击「启动研判」开始模拟分析流程...</div>';
  var title = document.getElementById('consoleTitle');
  if (title) title.textContent = 'Agent 运行日志 — 等待启动';

  var cards = document.getElementById('resultCards');
  if (cards) cards.innerHTML = '';

  var grade = document.getElementById('finalGrade');
  if (grade) grade.style.display = 'none';

  var report = document.getElementById('reportPreview');
  if (report) report.style.display = 'none';

  REDLIGHTS.forEach(function(rl) {
    var card = document.getElementById('rl-' + rl.id);
    if (card) {
      card.classList.remove('rl-pass', 'rl-warn', 'rl-fail', 'triggered');
      card.classList.add('rl-pass');
    }
  });
}

// ===== TOC Active State =====
function updateToc() {
  var sections = ['hero', 'architecture', 'workflow', 'scoring', 'demo'];
  var tocLinks = document.querySelectorAll('.toc a');
  var scrollPos = window.scrollY + window.innerHeight / 3;
  var activeIdx = 0;
  sections.forEach(function(id, i) {
    var el = document.getElementById(id);
    if (el && el.offsetTop <= scrollPos) activeIdx = i;
  });
  tocLinks.forEach(function(link, i) {
    link.classList.toggle('active', i === activeIdx);
  });
}

// ===== NAV Active State =====
function updateNav() {
  var ids = ['hero', 'architecture', 'workflow', 'scoring', 'demo'];
  var links = document.querySelectorAll('.nav-links a');
  var scrollPos = window.scrollY + window.innerHeight / 3;
  var activeIdx = 0;
  ids.forEach(function(id, i) {
    var el = document.getElementById(id);
    if (el && el.offsetTop <= scrollPos) activeIdx = i;
  });
  links.forEach(function(link, i) {
    link.classList.toggle('active', i === activeIdx);
  });
}

// ===== INIT ON LOAD =====
document.addEventListener('DOMContentLoaded', function() {
  initAgentGrid();
  initPhaseTimeline();
  initRedlights();
  window.addEventListener('scroll', function() {
    updateToc();
    updateNav();
  });
  updateToc();
  updateNav();
});
