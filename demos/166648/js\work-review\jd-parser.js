// ========== JD 解析与岗位库 ==========

// JD 解析历史存储
function getParsedJDs() {
  return JSON.parse(localStorage.getItem('parsedJDs') || '[]');
}

function saveParsedJD(jd) {
  const jds = getParsedJDs();
  jds.unshift(jd);
  localStorage.setItem('parsedJDs', JSON.stringify(jds));
}

// 技能关键词词典
const SKILL_KEYWORDS = [
  'Python', 'Java', 'Go', 'Rust', 'JavaScript', 'TypeScript', 'SQL', 'R',
  'HTML', 'CSS', 'React', 'Vue', 'Angular', 'Node.js', 'Node', 'Docker',
  'Kubernetes', 'K8s', 'AWS', '云计算', '大数据', '机器学习', '深度学习',
  'AI', 'LLM', '大模型', '数据挖掘', '数据分析', '数据可视化',
  '产品设计', '产品管理', '用户研究', 'UI设计', 'UX设计', '交互设计',
  '项目管理', 'PMP', '敏捷开发', 'Scrum', 'Excel', 'PowerPoint', 'PPT',
  '沟通能力', '团队协作', '领导力', '商业分析', '市场分析', '战略规划',
  '财务分析', '风险管理', '投资分析', '客户关系', '商务谈判',
  '运营管理', '内容策划', '新媒体', '短视频', '社群运营', '用户增长',
  '品牌推广', '营销策划', '广告投放', 'SEM', 'SEO',
  '质量管理', '质量体系', 'ISO', '六西格玛', '精益生产',
  '自动化测试', '性能测试', '测试用例', '缺陷管理',
  '网络安全', '渗透测试', '安全审计', '安全运营',
  '嵌入式开发', '单片机', 'FPGA', '芯片设计',
  '财务建模', '估值建模', 'CPA', 'CMA', 'CFA',
  '销售技巧', '客户管理', 'CRM', '渠道管理',
  '招聘管理', '薪酬福利', '员工关系', '绩效管理', 'HR',
  '教育心理学', '课程设计', '教学方法', '教育技术',
  '临床医学', '循证医学', '医患沟通', '医学研究',
  '法律文书', '合同审查', '知识产权', '数据合规',
  '供应链管理', '仓储物流', '采购管理', '库存优化',
  '英语', 'CET-4', 'CET-6', 'TOEFL', 'IELTS', '雅思', '托福',
  'MBA', '硕士', '博士', '本科', '统计学', '计算机', '金融', '经济学',
  'AutoCAD', 'Figma', 'Sketch', 'Adobe', 'Photoshop', 'Illustrator', 'PS', 'AI',
  'Git', 'GitHub', 'Linux', 'Linux/Unix', 'Shell',
  'TensorFlow', 'PyTorch', 'Hadoop', 'Spark', 'Flink', 'Hive', 'Kafka',
  'ChatGPT', 'LangChain', 'RAG', 'Agent', 'Embedding', 'Prompt',
  '数据分析', '商业洞察', '增长策略', '用户画像', 'A/B测试',
  '运营管理', '流程优化', '组织管理', '战略咨询', '管理咨询',
  '创业经验', '融资', '商业模式', '市场拓展', 'BD',
  'SCRUM', '产品运营', '用户运营', '数据驱动', '增长黑客',
  '行业研究', '竞品分析', '商业计划书', '投后管理',
  '项目管理', '风险控制', '资源整合', '团队建设',
  '沟通协调', '文字功底', '逻辑思维', '学习能力', '抗压能力',
  '数据分析能力', '问题解决', '结构化思维', '系统思维',
  '创新思维', '商业敏感度', '市场洞察', '战略规划能力'
];

// 学历识别字典
const EDU_KEYWORDS = ['博士', '硕士', '本科', '专科', '大专', 'MBA', '研究生', '统招', '985', '211', 'QS', '海归'];

// 经验识别字典
const EXP_PATTERNS = [
  { pattern: /(\d+)\s*[-~到至]\s*(\d+)\s*年/, label: 'x-y年' },
  { pattern: /(\d+)\s*年以上/, label: 'x年以上' },
  { pattern: /(\d+)\s*年/, label: 'x年' },
  { pattern: /应届|实习/, label: '应届' }
];

// 核心信息字段
const JD_FIELD_LABELS = {
  title: '岗位名称',
  company: '公司名称',
  industry: '所属行业',
  location: '工作地点',
  education: '学历要求',
  experience: '经验要求',
  type: '工作类型',
  skills: '核心技能',
  responsibilities: '岗位职责',
  requirements: '任职要求',
  description: '岗位描述'
};

// 解析 JD 文本
function parseJDText(text) {
  const result = {
    title: '',
    company: '',
    industry: '',
    location: '',
    education: '',
    experience: '',
    type: '',
    skills: [],
    responsibilities: '',
    requirements: '',
    description: text.substring(0, 300),
    matchScore: 0,
    hollandCode: '',
    dominantAnchor: ''
  };

  if (!text || text.trim().length === 0) return result;

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let sectionMode = '';
  let responsibilitiesText = '';
  let requirementsText = '';

  // 识别常见 JD 结构：公司 - 岗位 - 职责 - 要求
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 识别公司名称（通常在第一、二行）
    if (i <= 2 && !result.company &&
        (line.includes('公司') || line.includes('集团') ||
         line.includes('科技') || line.includes('科技有限公司') ||
         line.includes('企业') || line.includes('有限责任公司') ||
         /^[A-Za-z\u4e00-\u9fa5]{2,20}$/.test(line))) {
      if (!result.company) result.company = line;
      continue;
    }

    // 识别岗位名称（含"岗位"、"职位"、"招聘"或常见岗位词）
    const titleKeywords = ['工程师', '经理', '专员', '主管', '总监', '设计师', '分析师', '老师', '教师', '顾问', '运营', '产品', '开发', '测试', '销售', '助理', '研究员', '总监', '律师', '医生', '护士', '药剂师'];
    if (!result.title) {
      const titleMatch = titleKeywords.find(kw => line.includes(kw) && line.length <= 30);
      if (titleMatch) {
        result.title = line.replace(/【|】|\[|\]|\(|\)/g, '').trim();
        continue;
      }
    }

    // 识别工作地点
    if (!result.location) {
      const cityKeywords = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '苏州', '天津', '重庆', '青岛', '大连', '厦门', '长沙', '东莞', '佛山', '合肥', '郑州', '济南', '沈阳', '哈尔滨', '福州', '南昌', '昆明', '贵阳', '兰州', '海口', '三亚'];
      const foundCity = cityKeywords.find(city => line.includes(city));
      if (foundCity) {
        result.location = foundCity;
        continue;
      }
    }

    // 识别学历
    if (!result.education) {
      const eduFound = EDU_KEYWORDS.find(edu => line.includes(edu));
      if (eduFound) {
        result.education = eduFound;
      }
    }

    // 识别经验
    if (!result.experience) {
      for (const expPattern of EXP_PATTERNS) {
        const m = line.match(expPattern.pattern);
        if (m) {
          result.experience = m[0];
          break;
        }
      }
    }

    // 识别行业
    if (!result.industry) {
      const industryKeywords = ['互联网', '金融', '医疗', '教育', '制造业', '建筑', '零售', '贸易', '能源', '政府', '服务', '传媒', '游戏', '电商', '生物医药', '消费', '物流', '法律', '咨询'];
      const industryFound = industryKeywords.find(ind => line.includes(ind));
      if (industryFound) {
        result.industry = industryFound;
      }
    }

    // 技能识别
    const upperLine = line.toLowerCase();
    SKILL_KEYWORDS.forEach(skill => {
      if (line.includes(skill) && !result.skills.includes(skill)) {
        result.skills.push(skill);
      }
    });

    // 识别职责/要求段落
    if (/岗位职责|工作职责|主要职责|工作内容|you will|responsibilities|what you'll do/i.test(line)) {
      sectionMode = 'responsibilities';
      continue;
    }
    if (/任职要求|职位要求|岗位要求|任职资格|资格要求|requirements|what you need|qualifications/i.test(line)) {
      sectionMode = 'requirements';
      continue;
    }

    if (sectionMode === 'responsibilities') {
      responsibilitiesText += line + ' ';
    } else if (sectionMode === 'requirements') {
      requirementsText += line + ' ';
    }
  }

  // 如果没能从结构化解析中识别，尝试启发式
  if (!result.title) {
    // 找到第一个看起来像岗位的短语
    const titleMatch = text.match(/[\u4e00-\u9fa5]{2,15}(工程师|经理|专员|主管|设计师|分析师|老师|顾问|总监|助理)/);
    if (titleMatch) result.title = titleMatch[0];
  }

  if (!result.company) {
    const companyMatch = text.match(/[\u4e00-\u9fa5]{2,20}(公司|集团|科技|有限责任公司|有限公司)/);
    if (companyMatch) result.company = companyMatch[0];
  }

  if (!result.education) {
    const eduMatch = text.match(/(博士|硕士|本科|专科|MBA|研究生)/);
    if (eduMatch) result.education = eduMatch[0];
  }

  if (!result.experience) {
    const expMatch = text.match(/(\d+)\s*[-~到至]\s*(\d+)\s*年|(\d+)\s*年以上|应届|实习/);
    if (expMatch) result.experience = expMatch[0];
  }

  result.responsibilities = responsibilitiesText.trim();
  result.requirements = requirementsText.trim();

  // 映射到 Holland 代码
  result.hollandCode = mapJDToHolland(result);

  // 映射到职业锚
  result.dominantAnchor = mapJDToAnchor(result);

  return result;
}

// 根据 JD 内容映射 Holland 代码
function mapJDToHolland(jd) {
  const text = (jd.title + ' ' + jd.responsibilities + ' ' + jd.requirements + ' ' + jd.skills.join(' ')).toLowerCase();

  const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  // R - 实用型：工程、技术、制造、机械
  const rKeywords = ['工程', '技术', '制造', '机械', '电子', '硬件', '工业', '生产', '自动化', '设备', '操作', '运维', '开发', '代码'];
  rKeywords.forEach(k => { if (text.includes(k)) scores.R += 2; });

  // I - 研究型：分析、研究、数据、科学
  const iKeywords = ['研究', '分析', '数据', '科学', '实验', '算法', '模型', '统计', '调研', '设计', '洞察', '研发'];
  iKeywords.forEach(k => { if (text.includes(k)) scores.I += 2; });

  // A - 艺术型：设计、创意、艺术、内容
  const aKeywords = ['设计', '艺术', '创意', '内容', '文案', '视觉', '品牌', '美学', '创作', '音乐', '绘画', '视频'];
  aKeywords.forEach(k => { if (text.includes(k)) scores.A += 2; });

  // S - 社会型：教育、医疗、服务、咨询、培训
  const sKeywords = ['教育', '医疗', '服务', '咨询', '培训', '讲师', '助人', '沟通', '支持', '护理', '教学', '辅导', '客户'];
  sKeywords.forEach(k => { if (text.includes(k)) scores.S += 2; });

  // E - 企业型：管理、销售、商业、领导、创业
  const eKeywords = ['管理', '销售', '商业', '领导', '创业', '市场', '营销', '商务', '经理', '总监', '运营', '增长', '商业', '融资'];
  eKeywords.forEach(k => { if (text.includes(k)) scores.E += 2; });

  // C - 常规型：流程、规范、数据处理、财务、行政
  const cKeywords = ['流程', '规范', '财务', '行政', '会计', '数据处理', '报表', '制度', '合规', '质量', '审计', '文员'];
  cKeywords.forEach(k => { if (text.includes(k)) scores.C += 2; });

  // 取前三个字母组成 Holland code
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted.slice(0, 3).map(([k]) => k).join('');
}

// 根据 JD 内容映射职业锚
function mapJDToAnchor(jd) {
  const text = (jd.title + ' ' + jd.responsibilities + ' ' + jd.requirements + ' ' + jd.skills.join(' ')).toLowerCase();

  const anchors = {
    'technical-functional': 0,
    'managerial': 0,
    'autonomy': 0,
    'security': 0,
    'entrepreneurial': 0,
    'service': 0,
    'challenge': 0,
    'lifestyle': 0
  };

  // 技术/职能
  const tfKeywords = ['技术', '工程', '开发', '算法', '设计', '研发', '编程', '数据', '模型', '系统', '架构', '产品'];
  tfKeywords.forEach(k => { if (text.includes(k)) anchors['technical-functional'] += 2; });

  // 管理
  const mKeywords = ['管理', '经理', '主管', '总监', '领导', '团队', '组织', '战略', '规划', '决策', '运营'];
  mKeywords.forEach(k => { if (text.includes(k)) anchors['managerial'] += 2; });

  // 自主/独立
  const aKeywords = ['独立', '自主', '自由', '灵活', '创业', '顾问', '独立工作'];
  aKeywords.forEach(k => { if (text.includes(k)) anchors['autonomy'] += 1; });

  // 安全/稳定
  const sKeywords = ['稳定', '安全', '国企', '编制', '公务员', '事业单位', '长期', '保障'];
  sKeywords.forEach(k => { if (text.includes(k)) anchors['security'] += 2; });

  // 创业
  const eKeywords = ['创业', '创始人', '合伙人', '商业', '产品', '融资', '增长', '商业创新'];
  eKeywords.forEach(k => { if (text.includes(k)) anchors['entrepreneurial'] += 2; });

  // 服务/奉献
  const svKeywords = ['服务', '咨询', '教育', '医疗', '助人', '公益', '支持', '客户'];
  svKeywords.forEach(k => { if (text.includes(k)) anchors['service'] += 1; });

  // 挑战
  const chKeywords = ['挑战', '突破', '创新', '竞争', '前沿', '难题', '探索'];
  chKeywords.forEach(k => { if (text.includes(k)) anchors['challenge'] += 1; });

  // 生活方式
  const lsKeywords = ['work-life', '生活方式', '平衡', '远程', '灵活', '兼职', '自由职业'];
  lsKeywords.forEach(k => { if (text.includes(k)) anchors['lifestyle'] += 1; });

  const sorted = Object.entries(anchors).sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

// ========== 初始化 JD 解析视图 ==========
function initJDParser() {
  const container = document.getElementById('jdParserContainer');
  if (!container) return;

  // 清空之前的内容
  container.innerHTML = `
    <div class="jd-parser-wrapper">
      <div class="jd-parser-header">
        <h3>岗位描述（JD）智能解析</h3>
        <p class="jd-parser-description">粘贴或输入岗位描述（JD），系统将自动提取关键信息、识别技能要求，并与你的职业画像进行匹配分析。</p>
      </div>

      <!-- 输入区 -->
      <div class="jd-input-section">
        <label class="jd-input-label">粘贴 JD 内容（可直接复制招聘网站的岗位描述）</label>
        <textarea id="jdInputArea" placeholder="示例：
岗位名称：高级数据分析师
公司名称：某科技有限公司
工作地点：北京
学历要求：硕士
经验要求：3-5年

岗位职责：
1. 负责核心业务数据体系搭建与迭代
2. 深度参与产品与运营决策，通过数据分析驱动业务增长
3. 主导专项分析，输出可落地的业务建议
4. 推动数据驱动的决策文化建设

任职要求：
1. 3年以上数据分析经验，统计、计算机、数学相关专业优先
2. 精通 SQL、Python，熟练使用 BI 工具
3. 有互联网行业经验，对业务有深刻理解
4. 良好的沟通表达能力和抗压能力
5. 熟悉机器学习和深度学习模型者加分" rows="15"></textarea>

        <div class="jd-parser-actions">
          <button class="btn-primary" onclick="handleJDParserSubmit()">智能解析</button>
          <button class="btn-secondary" onclick="handleJDClear()">清空内容</button>
          <button class="btn-secondary" onclick="handleJDLoadSample()">加载示例</button>
        </div>
      </div>

      <!-- 结果展示区 -->
      <div id="jdParserResult"></div>

      <!-- 历史解析记录 -->
      <div class="jd-history-section">
        <h4>解析历史记录</h4>
        <div id="jdHistoryList">
          ${renderJDHistory()}
        </div>
      </div>
    </div>
  `;
}

// 处理 JD 提交解析
function handleJDParserSubmit() {
  const input = document.getElementById('jdInputArea');
  const resultContainer = document.getElementById('jdParserResult');
  const text = input.value.trim();

  if (!text) {
    resultContainer.innerHTML = `
      <div class="jd-result-empty">
        <p>请先输入岗位描述内容后再点击解析。</p>
      </div>
    `;
    return;
  }

  // 显示 loading
  resultContainer.innerHTML = `
    <div class="jd-loading">
      <div class="jd-spinner"></div>
      <p>正在解析 JD 内容...</p>
    </div>
  `;

  // 模拟异步解析过程（实际是同步的，给用户更自然的体验）
  setTimeout(() => {
    const parsed = parseJDText(text);
    renderJDParsedResult(parsed, text);

    // 保存到历史
    const jdEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      rawText: text,
      parsed: parsed
    };
    saveParsedJD(jdEntry);

    // 刷新历史列表
    const historyList = document.getElementById('jdHistoryList');
    if (historyList) historyList.innerHTML = renderJDHistory();
  }, 800);
}

// 清空 JD 输入
function handleJDClear() {
  const input = document.getElementById('jdInputArea');
  if (input) input.value = '';
  const resultContainer = document.getElementById('jdParserResult');
  if (resultContainer) resultContainer.innerHTML = '';
}

// 加载示例 JD
function handleJDLoadSample() {
  const sample = `高级数据分析师 | 某互联网科技有限公司

工作地点：北京  学历要求：硕士  经验要求：3-5年

岗位描述：
我们正在寻找一位充满激情的数据分析师加入我们的核心团队。你将与产品、运营、技术团队紧密合作，通过数据分析驱动业务决策，帮助公司在激烈的市场竞争中建立数据驱动的决策文化。

岗位职责：
1. 负责核心业务数据指标体系的搭建与迭代，确保数据准确反映业务状态
2. 深度参与产品迭代和运营策略制定，通过数据分析提供决策支持
3. 主导大型专项分析项目，从问题定义、数据采集、分析建模到报告输出
4. 构建和维护自动化分析报告，提升团队数据分析效率
5. 指导和培训初级分析师，提升团队整体数据分析能力

任职要求：
1. 硕士及以上学历，统计学、计算机、数学、经济学相关专业优先
2. 3年以上数据分析相关工作经验，有互联网大厂经验者优先
3. 精通 SQL，熟练使用 Python（Pandas、NumPy）进行数据分析
4. 熟悉 BI 工具（Tableau、Power BI、FineBI），能独立设计数据可视化
5. 具备扎实的统计学基础，理解假设检验、A/B测试等核心分析方法
6. 良好的沟通表达能力、逻辑思维能力和抗压能力
7. 有机器学习、深度学习项目经验者加分
8. 英语读写能力良好，能阅读英文技术文档

技能要求：SQL、Python、数据分析、数据可视化、统计学、A/B测试、Tableau、沟通能力`;

  const input = document.getElementById('jdInputArea');
  if (input) input.value = sample;
}

// 渲染解析结果
function renderJDParsedResult(parsed, rawText) {
  const container = document.getElementById('jdParserResult');
  if (!container) return;

  // 计算与用户画像的匹配度
  const matchData = calculateJDMatch(parsed);

  container.innerHTML = `
    <div class="jd-parsed-result">
      <div class="jd-result-header">
        <h3>📋 解析结果</h3>
        <div class="jd-match-score" style="background:${matchData.color}">
          匹配度 ${matchData.score}%
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="jd-info-section">
        <h4>基础信息</h4>
        <div class="jd-info-grid">
          <div class="jd-info-item">
            <span class="jd-info-label">岗位名称</span>
            <span class="jd-info-value">${parsed.title || '未能识别'}</span>
          </div>
          <div class="jd-info-item">
            <span class="jd-info-label">公司</span>
            <span class="jd-info-value">${parsed.company || '未能识别'}</span>
          </div>
          <div class="jd-info-item">
            <span class="jd-info-label">工作地点</span>
            <span class="jd-info-value">${parsed.location || '未能识别'}</span>
          </div>
          <div class="jd-info-item">
            <span class="jd-info-label">学历要求</span>
            <span class="jd-info-value">${parsed.education || '未能识别'}</span>
          </div>
          <div class="jd-info-item">
            <span class="jd-info-label">经验要求</span>
            <span class="jd-info-value">${parsed.experience || '未能识别'}</span>
          </div>
          <div class="jd-info-item">
            <span class="jd-info-label">所属行业</span>
            <span class="jd-info-value">${parsed.industry || '未能识别'}</span>
          </div>
        </div>
      </div>

      <!-- Holland 代码和职业锚 -->
      <div class="jd-codes-section">
        <div class="jd-code-card">
          <h4>Holland 代码</h4>
          <div class="jd-holland-display">${parsed.hollandCode}</div>
          <p class="jd-holland-desc">该岗位的职业兴趣倾向：${describeHolland(parsed.hollandCode)}</p>
        </div>
        <div class="jd-code-card">
          <h4>主导职业锚</h4>
          <div class="jd-anchor-display">${describeAnchor(parsed.dominantAnchor)}</div>
          <p class="jd-anchor-desc">该岗位最符合的职业价值观驱动</p>
        </div>
      </div>

      <!-- 核心技能 -->
      <div class="jd-skills-section">
        <h4>技能要求 (共 ${parsed.skills.length} 项)</h4>
        <div class="jd-skills-grid">
          ${parsed.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
      </div>

      <!-- 匹配度分析 -->
      <div class="jd-match-analysis">
        <h4>与你的职业画像匹配分析</h4>
        <div class="jd-match-stats">
          <div class="jd-match-stat-item">
            <span class="jd-match-stat-label">Holland 兴趣匹配</span>
            <div class="jd-match-stat-bar">
              <div class="jd-match-stat-fill" style="width:${matchData.hollandMatch}%;background:#4E46DC"></div>
            </div>
            <span class="jd-match-stat-value">${matchData.hollandMatch}%</span>
          </div>
          <div class="jd-match-stat-item">
            <span class="jd-match-stat-label">职业锚匹配</span>
            <div class="jd-match-stat-bar">
              <div class="jd-match-stat-fill" style="width:${matchData.anchorMatch}%;background:#0DB8A8"></div>
            </div>
            <span class="jd-match-stat-value">${matchData.anchorMatch}%</span>
          </div>
          <div class="jd-match-stat-item">
            <span class="jd-match-stat-label">技能覆盖度</span>
            <div class="jd-match-stat-bar">
              <div class="jd-match-stat-fill" style="width:${matchData.skillMatch}%;background:#E8990A"></div>
            </div>
            <span class="jd-match-stat-value">${matchData.skillMatch}%</span>
          </div>
        </div>
        <div class="jd-match-recommendations">
          <h5>💡 行动建议</h5>
          <ul>
            ${matchData.recommendations.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- 技能匹配详情 -->
      ${renderSkillMatchDetail(matchData)}

      <!-- 相似岗位推荐 -->
      ${renderSimilarJDs(parsed)}

      <!-- 简历生成联动入口 -->
      <div class="jd-resume-cta">
        <div class="jd-resume-cta-icon">📄</div>
        <div class="jd-resume-cta-content">
          <h4>生成针对性简历</h4>
          <p>基于 JD 关键词智能优化你的简历，提高 ATS 通过率和面试邀约率</p>
        </div>
        <button class="btn-primary" onclick="goToResumeFromJD()">去生成简历 →</button>
      </div>

      <!-- 原始文本摘录 -->
      <details class="jd-raw-text">
        <summary>查看原始 JD 文本</summary>
        <pre>${rawText.substring(0, 2000)}${rawText.length > 2000 ? '...' : ''}</pre>
      </details>
    </div>
  `;
}

// 从 JD 解析跳转到简历生成页，自动带入 JD 文本
function goToResumeFromJD() {
  const jdText = document.getElementById('jdInputText') ? document.getElementById('jdInputText').value : '';
  if (jdText) {
    localStorage.setItem('pendingJDForResume', jdText);
  }
  navigateTo('resume-builder');
}

// 计算 JD 与用户画像的匹配度
function calculateJDMatch(parsed) {
  // 获取用户画像
  const userHolland = localStorage.getItem('hollandCode') || 'RIC';
  const userAnchor = JSON.parse(localStorage.getItem('anchorCounts') || '{}');
  const userSkills = JSON.parse(localStorage.getItem('careerBlocks') || '[]').filter(b => b.type === 'skill').map(b => b.name);

  // Holland 匹配（检查前 3 个字母重合度）
  let hollandMatch = 0;
  const userCodes = userHolland.split('');
  const jdCodes = parsed.hollandCode.split('');
  for (let i = 0; i < Math.min(3, userCodes.length); i++) {
    if (jdCodes.includes(userCodes[i])) {
      hollandMatch += 33;
    }
  }
  hollandMatch = Math.min(100, hollandMatch);

  // 职业锚匹配（0 或 100）
  let anchorMatch = 0;
  if (Object.keys(userAnchor).length > 0) {
    // 找到用户主导锚
    const userDominant = Object.entries(userAnchor).sort((a, b) => b[1] - a[1])[0];
    if (userDominant && userDominant[0] === parsed.dominantAnchor) {
      anchorMatch = 100;
    } else {
      anchorMatch = 40;
    }
  } else {
    anchorMatch = 50;
  }

  // 技能匹配（含模糊匹配）
  let skillMatch = 0;
  let matchedSkills = [];
  let missingSkills = [];
  if (userSkills.length > 0 && parsed.skills.length > 0) {
    parsed.skills.forEach(function(jdSkill) {
      var isMatched = userSkills.some(function(us) {
        var u = us.toLowerCase().trim();
        var j = jdSkill.toLowerCase().trim();
        return u === j || u.indexOf(j) !== -1 || j.indexOf(u) !== -1;
      });
      if (isMatched) {
        matchedSkills.push(jdSkill);
      } else {
        missingSkills.push(jdSkill);
      }
    });
    skillMatch = Math.round((matchedSkills.length / Math.min(parsed.skills.length, 10)) * 100);
  } else {
    skillMatch = 20;
  }

  // 综合得分
  const total = Math.round((hollandMatch * 0.4) + (anchorMatch * 0.3) + (skillMatch * 0.3));

  let color = '#DC5078';
  if (total >= 70) color = '#0DB8A8';
  else if (total >= 50) color = '#E8990A';
  else color = '#DC5078';

  const recommendations = [];
  if (hollandMatch < 60) {
    recommendations.push('岗位的职业兴趣方向与你的画像匹配度一般，建议深入了解该岗位的真实工作内容，避免兴趣错配。');
  } else {
    recommendations.push('岗位的职业兴趣方向与你高度契合，这是长期职业满意度的重要保障。');
  }

  if (anchorMatch < 60) {
    recommendations.push('岗位的价值观驱动与你的职业锚不完全一致，入职前建议重点评估是否能接受该岗位的核心诉求。');
  } else {
    recommendations.push('岗位的价值观驱动与你的职业锚一致，有助于长期的职业稳定和满足感。');
  }

  if (skillMatch < 40) {
    recommendations.push(`岗位要求的技能中，你目前掌握的约 ${skillMatch}%。建议重点补充以下技能：${parsed.skills.slice(0, 5).filter(s => !userSkills.includes(s)).join('、')}。`);
  } else if (skillMatch < 70) {
    recommendations.push(`你已掌握岗位所需的 ${skillMatch}% 技能，可以通过短期培训和项目经验补充剩余技能。`);
  } else {
    recommendations.push('你的技能组合与岗位要求高度匹配，是强有力的候选人。');
  }

  if (total >= 70) {
    recommendations.push('✨ 综合来看，这是一个非常适合你的岗位方向，建议积极投递和准备面试。');
  } else if (total >= 50) {
    recommendations.push('这是一个有潜力的方向，可以作为备选，同时继续寻找更匹配的机会。');
  } else {
    recommendations.push('该岗位与你的画像匹配度较低，建议寻找与 Holland 代码和职业锚更一致的方向。');
  }

  return {
    score: total,
    hollandMatch: hollandMatch,
    anchorMatch: anchorMatch,
    skillMatch: skillMatch,
    color: color,
    recommendations: recommendations,
    matchedSkills: matchedSkills,
    missingSkills: missingSkills,
    userSkillCount: userSkills.length,
    hasProfile: userSkills.length > 0
  };
}

// 渲染技能匹配详情（已具备/需补充）
function renderSkillMatchDetail(matchData) {
  if (!matchData.hasProfile) {
    return `<div class="jd-skill-match-empty">
      <div class="jd-skill-match-empty-icon">📭</div>
      <div class="jd-skill-match-empty-text">尚无技能档案。请在"职业档案"中添加你的技能，以启用技能匹配度分析。</div>
    </div>`;
  }

  let html = '<div class="jd-skill-match-section">';
  html += '<h4 class="jd-skill-match-title">🔍 技能匹配详情</h4>';

  // 已具备技能
  if (matchData.matchedSkills && matchData.matchedSkills.length > 0) {
    html += '<div class="jd-skill-match-group">';
    html += `<div class="jd-skill-match-group-title jd-skill-match-title-have">✅ 已具备（${matchData.matchedSkills.length}）</div>`;
    html += '<div class="jd-skill-match-tags">';
    matchData.matchedSkills.forEach(function(s) {
      html += `<span class="jd-skill-match-tag jd-skill-match-tag-have">${escapeHTML(s)}</span>`;
    });
    html += '</div></div>';
  }

  // 需补充技能
  if (matchData.missingSkills && matchData.missingSkills.length > 0) {
    html += '<div class="jd-skill-match-group">';
    html += `<div class="jd-skill-match-group-title jd-skill-match-title-miss">⚠️ 需补充（${matchData.missingSkills.length}）</div>`;
    html += '<div class="jd-skill-match-tags">';
    matchData.missingSkills.slice(0, 12).forEach(function(s) {
      html += `<span class="jd-skill-match-tag jd-skill-match-tag-miss">${escapeHTML(s)}</span>`;
    });
    if (matchData.missingSkills.length > 12) {
      html += `<span class="jd-skill-match-tag jd-skill-match-tag-more">+${matchData.missingSkills.length - 12}</span>`;
    }
    html += '</div>';
    html += '<div class="jd-skill-match-suggestion">💡 建议优先补足高优先级技能，可通过在线课程、项目实践或考证快速提升</div>';
    html += '</div>';
  }

  html += '</div>';
  return html;
}

// Holland 代码描述
function describeHolland(code) {
  const desc = {
    R: '实用型',
    I: '研究型',
    A: '艺术型',
    S: '社会型',
    E: '企业型',
    C: '常规型'
  };
  return code.split('').map(c => desc[c] || c).join(' · ');
}

// 职业锚描述
function describeAnchor(anchor) {
  const labels = {
    'technical-functional': '技术/职能型',
    'managerial': '管理型',
    'autonomy': '自主/独立型',
    'security': '安全/稳定型',
    'entrepreneurial': '创业型',
    'service': '服务/奉献型',
    'challenge': '挑战型',
    'lifestyle': '生活方式型'
  };
  return labels[anchor] || anchor || '技术/职能型';
}

// 渲染历史记录
function renderJDHistory() {
  const jds = getParsedJDs();
  if (jds.length === 0) {
    return '<p class="jd-history-empty">暂无解析历史记录</p>';
  }

  return jds.slice(0, 5).map(jd => {
    const time = new Date(jd.timestamp);
    const timeStr = `${time.getFullYear()}-${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')} ${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    return `
      <div class="jd-history-item">
        <div class="jd-history-title">
          <strong>${jd.parsed.title || '(未识别岗位名称)'}</strong>
          <span class="jd-history-time">${timeStr}</span>
        </div>
        <div class="jd-history-meta">
          ${jd.parsed.company ? `<span>${jd.parsed.company}</span>` : ''}
          ${jd.parsed.hollandCode ? `<span>Holland: ${jd.parsed.hollandCode}</span>` : ''}
          ${jd.parsed.skills && jd.parsed.skills.length > 0 ? `<span>${jd.parsed.skills.length} 项技能</span>` : ''}
        </div>
        <div class="jd-history-actions">
          <button class="btn-secondary" onclick="loadJDToEditor(${jd.id})">重新查看</button>
        </div>
      </div>
    `;
  }).join('');
}

// 从历史记录加载到编辑器
function loadJDToEditor(jdId) {
  const jds = getParsedJDs();
  const jd = jds.find(j => j.id === jdId);
  if (!jd) return;

  const input = document.getElementById('jdInputArea');
  if (input) input.value = jd.rawText;

  // 滚动到编辑器
  const section = document.getElementById('jdParserContainer');
  if (section) section.scrollIntoView({ behavior: 'smooth' });

  handleJDParserSubmit();
}

// 渲染相似岗位推荐
function renderSimilarJDs(parsed) {
  if (typeof findSimilarJDs !== 'function') return '';

  const similarJDs = findSimilarJDs(parsed, 5);
  if (!similarJDs || similarJDs.length === 0) return '';

  let html = '<div class="jd-similar-section">';
  html += '<h4>🔍 相似岗位推荐</h4>';
  html += '<p class="jd-similar-desc">基于技能要求匹配度，为你推荐以下相似岗位</p>';
  html += '<div class="jd-similar-list">';

  similarJDs.forEach((jd, idx) => {
    const maxScore = 30;
    const scorePercent = Math.min(100, Math.round((jd.matchScore / maxScore) * 100));
    html += '<div class="jd-similar-item" onclick="showSimilarJDDetail(\'' + jd.id + '\')">';
    html += '<div class="jd-similar-header">';
    html += '<span class="jd-similar-name">' + jd.name + '</span>';
    html += '<span class="jd-similar-score" style="background:' + getScoreColor(scorePercent) + '">' + scorePercent + '% 匹配</span>';
    html += '</div>';
    html += '<div class="jd-similar-meta">';
    html += '<span class="jd-similar-tag">' + jd.category + '</span>';
    html += '<span class="jd-similar-exp">' + jd.experience + '</span>';
    html += '<span class="jd-similar-edu">' + jd.education + '</span>';
    html += '</div>';
    html += '<div class="jd-similar-skills">';
    jd.hardSkills.slice(0, 5).forEach(skill => {
      const matched = jd.matchedSkills && jd.matchedSkills.some(ms => ms.toLowerCase() === skill.toLowerCase());
      html += '<span class="skill-tag ' + (matched ? 'matched' : '') + '">' + skill + '</span>';
    });
    if (jd.hardSkills.length > 5) {
      html += '<span class="skill-tag more">+' + (jd.hardSkills.length - 5) + '</span>';
    }
    html += '</div>';
    html += '<div class="jd-similar-detail-link">查看详情 →</div>';
    html += '</div>';
  });

  html += '</div>';

  // 岗位详情弹窗
  html += '<div id="similarJDModal" class="modal" style="display:none">';
  html += '<div class="modal-content" style="max-width:600px">';
  html += '<div class="modal-header"><h3 id="similarJDTitle"></h3><button class="modal-close" onclick="closeSimilarJDModal()">&times;</button></div>';
  html += '<div class="modal-body" id="similarJDContent"></div>';
  html += '</div></div>';

  html += '</div>';
  return html;
}

function showSimilarJDDetail(jdId) {
  if (typeof getJDById !== 'function') return;
  const jd = getJDById(jdId);
  if (!jd) return;

  const titleEl = document.getElementById('similarJDTitle');
  const contentEl = document.getElementById('similarJDContent');
  const modal = document.getElementById('similarJDModal');
  if (!titleEl || !contentEl || !modal) return;

  titleEl.textContent = jd.name;

  let html = '';
  html += '<div class="jd-detail-meta">';
  html += '<span class="jd-detail-tag">' + jd.category + '</span>';
  html += '<span class="jd-detail-exp">' + jd.experience + '</span>';
  html += '<span class="jd-detail-edu">' + jd.education + '</span>';
  html += '</div>';

  html += '<div class="jd-detail-section">';
  html += '<h5>硬性技能要求</h5>';
  html += '<div class="jd-skills-grid">';
  jd.hardSkills.forEach(s => html += '<span class="skill-tag">' + s + '</span>');
  html += '</div></div>';

  html += '<div class="jd-detail-section">';
  html += '<h5>软性技能要求</h5>';
  html += '<div class="jd-skills-grid">';
  jd.softSkills.forEach(s => html += '<span class="skill-tag soft">' + s + '</span>');
  html += '</div></div>';

  html += '<div class="jd-detail-section">';
  html += '<h5>岗位职责</h5>';
  html += '<ul class="jd-detail-list">';
  jd.responsibilities.forEach(r => html += '<li>' + r + '</li>');
  html += '</ul></div>';

  html += '<div class="jd-detail-cta">';
  html += '<button class="btn-primary-v5" onclick="applyJDToParser(\'' + jdId + '\')">以此岗位为模板分析</button>';
  html += '</div>';

  contentEl.innerHTML = html;
  modal.style.display = 'flex';
}

function closeSimilarJDModal() {
  const modal = document.getElementById('similarJDModal');
  if (modal) modal.style.display = 'none';
}

function applyJDToParser(jdId) {
  if (typeof getJDById !== 'function') return;
  const jd = getJDById(jdId);
  if (!jd) return;

  closeSimilarJDModal();

  const jdText = `岗位名称：${jd.name}
所属行业：${jd.category}
经验要求：${jd.experience}
学历要求：${jd.education}

岗位职责：
${jd.responsibilities.map((r, i) => `${i + 1}. ${r}`).join('\n')}

技能要求：
${jd.hardSkills.join('、')}
${jd.softSkills.join('、')}`;

  const input = document.getElementById('jdInputArea');
  if (input) input.value = jdText;

  handleJDParserSubmit();
}

function getScoreColor(percent) {
  if (percent >= 70) return '#10B981';
  if (percent >= 40) return '#F59E0B';
  return '#EF4444';
}
