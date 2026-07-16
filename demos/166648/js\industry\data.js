// ========== 行业数据 ==========
const industryData = [
  {
    name: '互联网/科技', stability: '中', techPace: '快',
    jobs: ['前端开发','后端开发','产品经理','数据分析','AI工程师','运维工程师','测试工程师','UI/UX设计'],
    overview: '互联网/科技行业是当前数字化转型的核心驱动力，涵盖软件开发、人工智能、云计算、大数据等领域。该行业技术迭代极快，对人才的需求持续旺盛，但竞争也最为激烈。',
    chain: '上游（芯片/硬件）→ 中游（平台/基础设施）→ 下游（应用/服务）',
    trends: ['AI大模型商业化加速', '云计算渗透率持续提升', '出海成为新增长点', '监管趋严但创新不止'],
    riskLevel: '中',
    riskDesc: '行业整体增长放缓但不会衰退，AI替代部分基础岗位，但创造更多新岗位',
    hotJobs: ['AI工程师', '大模型运营', '数据科学家', '全栈开发']
  },
  {
    name: '金融', stability: '高', techPace: '中',
    jobs: ['银行柜员','理财顾问','风险控制','量化分析','审计','保险精算','投资银行','合规管理'],
    overview: '金融行业是国民经济的血脉，涵盖银行、证券、保险、基金等多个子领域。随着金融科技的发展，传统金融与科技深度融合，数字化、智能化成为行业主旋律。金融行业对从业者的专业资质和合规意识要求较高。',
    chain: '上游（监管/政策）→ 中游（金融机构/交易所）→ 下游（企业融资/个人理财）',
    trends: ['金融科技深度渗透', '绿色金融快速发展', '数字货币试点扩大', '风控智能化升级'],
    riskLevel: '中',
    riskDesc: '基础柜员岗位逐步被自助设备替代，但风控、合规、量化等高附加值岗位需求增长',
    hotJobs: ['量化分析师', '风控工程师', '金融科技产品经理', 'ESG投资顾问']
  },
  {
    name: '医疗/健康', stability: '高', techPace: '中',
    jobs: ['临床医生','护士','药剂师','医学研究员','健康管理','医疗器械','心理咨询','公共卫生'],
    overview: '医疗/健康行业是关乎国计民生的基础性行业，涵盖临床医疗、制药、医疗器械、健康管理等领域。随着人口老龄化加剧和健康意识提升，行业需求持续增长。医疗行业专业壁垒高，培养周期长，但职业回报稳定。',
    chain: '上游（医药研发/器械制造）→ 中游（医疗机构/流通）→ 下游（患者服务/健康管理）',
    trends: ['互联网医疗常态化', '精准医疗快速发展', '中医药产业振兴', '康复与心理健康需求激增'],
    riskLevel: '低',
    riskDesc: 'AI辅助诊断提升效率但无法替代医生，行业整体受技术冲击最小',
    hotJobs: ['临床医生', '医学研究员', '健康管理师', '心理咨询师']
  },
  {
    name: '教育', stability: '高', techPace: '慢',
    jobs: ['学科教师','培训讲师','教育技术','课程开发','学术研究','学生管理','在线教育','教育行政'],
    overview: '教育行业是社会发展的重要基石，涵盖基础教育、高等教育、职业教育和终身学习等多个层次。虽然教培行业经历了政策调整，但教育需求本身不会消失，形式正从线下向线上线下融合转型。',
    chain: '上游（教育政策/课程标准）→ 中游（教育机构/学校）→ 下游（学生/家长）',
    trends: ['素质教育成为主流', '教育数字化加速', '职业教育政策利好', 'AI辅助教学工具普及'],
    riskLevel: '低',
    riskDesc: '教师岗位需求稳定，AI更多作为辅助工具而非替代，但传统教培岗位面临转型压力',
    hotJobs: ['课程开发专家', '教育技术工程师', '职业教育讲师', 'STEAM教育导师']
  },
  {
    name: '制造业', stability: '中', techPace: '中',
    jobs: ['生产管理','质量控制','工业工程师','供应链','设备维护','工艺工程师','自动化','精益管理'],
    overview: '制造业是实体经济的根基，正在经历从"中国制造"到"中国智造"的深度转型。工业4.0、智能制造、绿色制造成为发展方向。行业对复合型人才（既懂制造又懂数字化）的需求日益迫切。',
    chain: '上游（原材料/零部件）→ 中游（加工制造/装配）→ 下游（品牌/渠道/售后）',
    trends: ['智能制造全面推进', '新能源车产业链爆发', '工业机器人普及加速', '绿色低碳转型'],
    riskLevel: '中',
    riskDesc: '传统流水线操作工减少，但工业工程师、自动化技术、质量管理等岗位需求增加',
    hotJobs: ['工业工程师', '自动化工程师', '供应链管理专家', '质量总监']
  },
  {
    name: '建筑业', stability: '中', techPace: '慢',
    jobs: ['土木工程师','建筑师','施工管理','造价工程师','监理','室内设计','BIM工程师','城市规划'],
    overview: '建筑业是国民经济的重要支柱产业，涵盖房屋建筑、基础设施、市政工程等领域。随着城市化进程放缓，行业正从增量扩张转向存量更新和精细化运营。BIM技术和装配式建筑正在改变传统建造方式。',
    chain: '上游（规划设计/材料供应）→ 中游（施工建设/监理）→ 下游（物业管理/运营维护）',
    trends: ['装配式建筑推广', 'BIM技术全面应用', '城市更新成为重点', '绿色建筑标准提升'],
    riskLevel: '低',
    riskDesc: '行业技术迭代较慢，AI影响有限，但房地产下行周期对行业短期有压力',
    hotJobs: ['BIM工程师', '绿色建筑设计师', '城市更新项目经理', '装配式建筑专家']
  },
  {
    name: '政府/公共事业', stability: '高', techPace: '慢',
    jobs: ['公务员','政策研究','公共管理','城市规划','社会服务','司法行政','外交事务','应急管理'],
    overview: '政府与公共事业部门是国家治理体系的核心，涵盖行政、司法、公共服务、外交等领域。该行业以稳定性著称，职业发展路径清晰，但准入门槛高、竞争激烈。数字化政务正在推动行业效率提升。',
    chain: '上游（政策制定/法律法规）→ 中游（行政执行/公共服务）→ 下游（社会公众/企业）',
    trends: ['数字政府建设加速', '基层治理精细化', '应急管理能力提升', '公共服务均等化推进'],
    riskLevel: '低',
    riskDesc: '几乎不受AI替代影响，稳定性极高，但编制竞争激烈，晋升周期较长',
    hotJobs: ['数字政务专员', '政策研究员', '公共管理专家', '应急管理师']
  },
  {
    name: '零售/电商', stability: '中', techPace: '快',
    jobs: ['店铺运营','买手','供应链管理','电商运营','客户服务','视觉陈列','物流管理','品类管理'],
    overview: '零售/电商行业是连接生产与消费的关键环节，涵盖线下零售、电商平台、直播带货、新零售等多种业态。行业技术迭代快，数据驱动运营成为标配，对复合型运营人才需求旺盛。',
    chain: '上游（品牌/供应商）→ 中游（平台/渠道/仓储物流）→ 下游（消费者）',
    trends: ['直播电商持续增长', '即时零售快速扩张', '私域运营精细化', 'AI个性化推荐升级'],
    riskLevel: '中高',
    riskDesc: '基础客服和简单运营岗位被AI工具替代风险较高，但数据分析和策略型岗位需求增加',
    hotJobs: ['直播运营专家', '数据运营分析师', '私域运营总监', '即时零售经理']
  },
  {
    name: '文化传媒', stability: '低', techPace: '快',
    jobs: ['记者编辑','内容策划','视频制作','品牌公关','新媒体运营','广告创意','出版发行','活动策划'],
    overview: '文化传媒行业涵盖新闻、出版、影视、广告、新媒体等领域，是信息传播和文化消费的重要载体。行业受技术变革影响极大，短视频、AI生成内容正在重塑内容生产方式，传统媒体持续转型。',
    chain: '上游（内容创作/IP孵化）→ 中游（制作/发行/平台）→ 下游（受众/广告主）',
    trends: ['短视频与直播主导流量', 'AIGC重塑内容生产', '知识付费持续增长', '品牌营销全域化'],
    riskLevel: '高',
    riskDesc: 'AI生成内容对基础文案、简单设计、初级视频剪辑等岗位替代风险极高',
    hotJobs: ['AI内容策略师', '短视频导演', '品牌创意总监', '知识付费产品经理']
  },
  {
    name: '能源/环保', stability: '高', techPace: '中',
    jobs: ['新能源工程师','环境工程师','石油工程师','碳排放管理','能源审计','环保咨询','电力系统','节能技术'],
    overview: '能源/环保行业是"双碳"目标下的战略性新兴产业，涵盖新能源开发、节能减排、环境治理、碳交易等领域。政策驱动明显，行业处于高速成长期，人才缺口较大。',
    chain: '上游（能源开采/设备制造）→ 中游（能源转换/电力输送）→ 下游（终端用户/碳交易）',
    trends: ['新能源装机量爆发式增长', '碳交易市场扩容', '储能技术突破', '氢能产业布局加速'],
    riskLevel: '低',
    riskDesc: '政策红利持续，行业整体增长确定性高，技术替代风险低',
    hotJobs: ['新能源工程师', '碳排放管理师', '储能技术专家', '能源审计师']
  },
  {
    name: '法律', stability: '高', techPace: '慢',
    jobs: ['律师','法务顾问','知识产权','合规管理','法律援助','仲裁调解','公证服务','法律翻译'],
    overview: '法律行业是维护社会公平正义的重要力量，涵盖诉讼、非诉、合规、知识产权等多个领域。行业专业壁垒极高，需要通过司法考试等严格准入，但一旦入行职业发展稳定且回报丰厚。',
    chain: '上游（法学教育/司法考试）→ 中游（律所/法务部门）→ 下游（个人/企业客户）',
    trends: ['企业合规需求增长', '知识产权保护加强', '法律科技工具普及', '涉外法律服务需求增加'],
    riskLevel: '低',
    riskDesc: '法律工作高度依赖专业判断和人际沟通，AI可辅助文书工作但难以替代核心业务',
    hotJobs: ['知识产权律师', '数据合规律师', '涉外法律顾问', '法律科技产品经理']
  },
  {
    name: '农业/食品', stability: '中', techPace: '中',
    jobs: ['农技推广','食品研发','质量检测','农业工程','品牌营销','供应链','食品安全','智慧农业'],
    overview: '农业/食品行业是关系国计民生的基础产业，正从传统小农经济向现代化、智能化转型。智慧农业、食品科技创新、品牌化运营成为新趋势。行业长期稳定但短期利润率偏低。',
    chain: '上游（种业/饲料/农资）→ 中游（种植养殖/加工）→ 下游（流通/品牌/零售）',
    trends: ['智慧农业技术落地', '预制菜产业爆发', '食品科技创新加速', '农产品品牌化升级'],
    riskLevel: '低',
    riskDesc: '行业整体受AI冲击较小，智慧农业反而创造新的技术岗位',
    hotJobs: ['智慧农业工程师', '食品研发科学家', '预制菜产品经理', '农产品品牌运营']
  },
  {
    name: '交通/物流', stability: '高', techPace: '中',
    jobs: ['物流管理','运输调度','仓储管理','供应链优化','交通规划','港口运营','航空管理','智能交通'],
    overview: '交通/物流行业是经济运行的"大动脉"，涵盖公路、铁路、航空、水运、管道等多种运输方式和仓储配送体系。电商的发展催生了巨大的物流需求，智慧物流和自动驾驶正在改变行业面貌。',
    chain: '上游（运输工具/基础设施）→ 中游（运输/仓储/配送）→ 下游（企业/消费者）',
    trends: ['智慧物流全面铺开', '自动驾驶商用加速', '跨境物流需求增长', '绿色低碳运输转型'],
    riskLevel: '中',
    riskDesc: '基础调度和仓储操作岗位部分被自动化替代，但供应链优化和智能交通管理岗位需求增加',
    hotJobs: ['供应链优化专家', '智能交通工程师', '自动驾驶运营经理', '跨境物流总监']
  },
  {
    name: '旅游/酒店', stability: '低', techPace: '慢',
    jobs: ['酒店管理','旅游策划','导游','会展策划','餐饮管理','收益管理','客户关系','目的地营销'],
    overview: '旅游/酒店行业是服务业的重要组成，涵盖住宿、餐饮、旅行、会展等领域。行业受宏观经济和突发事件影响较大（如疫情），但长期来看随着居民收入增长和消费升级，市场潜力依然巨大。',
    chain: '上游（旅游资源/交通）→ 中游（酒店/旅行社/平台）→ 下游（游客/企业客户）',
    trends: ['文旅融合深度发展', '体验式旅游兴起', '智慧酒店普及', '会展经济持续增长'],
    riskLevel: '低',
    riskDesc: '服务型行业，人际互动难以被AI替代，但在线平台改变了部分传统岗位',
    hotJobs: ['文旅策划师', '智慧酒店运营经理', '会展策划总监', '目的地营销专家']
  },
  {
    name: '房地产', stability: '中', techPace: '慢',
    jobs: ['房地产开发','物业管理','投资分析','建筑设计','市场营销','工程管理','估价师','商业地产'],
    overview: '房地产行业经历了高速增长期后进入调整阶段，从"开发驱动"转向"运营驱动"。物业管理、城市更新、商业地产运营、长租公寓等细分领域成为新的增长点。行业正在经历深刻转型。',
    chain: '上游（土地/规划设计）→ 中游（开发建设/营销）→ 下游（物业管理/运营服务）',
    trends: ['物业管理成为新增长极', '城市更新与旧改加速', '长租公寓规范化发展', '商业地产数字化转型'],
    riskLevel: '中',
    riskDesc: '传统开发岗位减少，但物业运营、资产管理、城市更新等领域需求增加',
    hotJobs: ['物业管理总监', '城市更新项目经理', '商业地产运营专家', '房地产科技产品经理']
  },
  {
    name: '咨询/专业服务', stability: '中', techPace: '快',
    jobs: ['管理咨询','战略咨询','IT咨询','财务咨询','人力资源咨询','市场研究','猎头服务','技术顾问'],
    overview: '咨询/专业服务行业为企业提供智力支持和专业解决方案，涵盖管理、战略、IT、财务、人力资源等多个领域。行业知识密集度高，对从业者的综合素质和行业经验要求极高，是高薪行业之一。',
    chain: '上游（方法论/数据/工具）→ 中游（咨询公司/专业机构）→ 下游（企业客户）',
    trends: ['AI辅助咨询工具兴起', '数字化转型咨询需求旺盛', 'ESG与可持续发展咨询增长', '灵活用工与猎头市场扩大'],
    riskLevel: '中高',
    riskDesc: 'AI可替代部分基础研究和数据处理工作，但高端咨询依赖经验和判断，难以完全替代',
    hotJobs: ['数字化转型顾问', 'ESG咨询专家', 'AI战略咨询师', '数据战略顾问']
  }
];

// ========== 行业探索渲染 ==========
function renderIndustryGrid() {
  const grid = document.getElementById('industryGrid');
  grid.innerHTML = industryData.map((ind, i) => {
    const stabClass = ind.stability === '高' ? 'meta-stability-high' : ind.stability === '中' ? 'meta-stability-mid' : 'meta-stability-low';
    const paceClass = ind.techPace === '快' ? 'meta-pace-fast' : ind.techPace === '中' ? 'meta-pace-mid' : 'meta-pace-slow';
    return `
      <div class="industry-card" onclick="openIndustryDetail(${i})">
        <div class="industry-card-name">${ind.name}</div>
        <div class="industry-card-meta">
          <span class="meta-tag ${stabClass}">稳定性：${ind.stability}</span>
          <span class="meta-tag ${paceClass}">迭代速度：${ind.techPace}</span>
        </div>
        <div class="industry-expand-hint">点击查看行业详情 &#10132;</div>
        <div class="industry-card-jobs">${ind.jobs.map(j => j).join('、')}</div>
      </div>
    `;
  }).join('');
}

function toggleIndustry(card) {
  card.classList.toggle('expanded');
  const hint = card.querySelector('.industry-expand-hint');
  if (card.classList.contains('expanded')) {
    hint.innerHTML = '点击收起 &#9650;';
  } else {
    hint.innerHTML = '点击展开查看细分岗位 &#9660;';
  }
}

// ========== 行业搜索功能 ==========
function filterIndustries() {
  const keyword = document.getElementById('industrySearch').value.trim().toLowerCase();
  const grid = document.getElementById('industryGrid');
  const cards = grid.querySelectorAll('.industry-card');
  let matchCount = 0;

  industryData.forEach((ind, i) => {
    const card = cards[i];
    if (!card) return;

    // 按行业名称匹配
    const nameMatch = ind.name.toLowerCase().includes(keyword);
    // 按岗位名称匹配
    const jobsMatch = ind.jobs.some(j => j.toLowerCase().includes(keyword));
    const hotJobsMatch = ind.hotJobs && ind.hotJobs.some(j => j.toLowerCase().includes(keyword));

    if (nameMatch || jobsMatch || hotJobsMatch || keyword === '') {
      card.style.display = '';
      matchCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // 无结果提示
  let noResult = document.getElementById('industryNoResult');
  if (matchCount === 0 && keyword !== '') {
    if (!noResult) {
      noResult = document.createElement('div');
      noResult.id = 'industryNoResult';
      noResult.className = 'industry-no-result';
      grid.parentNode.insertBefore(noResult, grid.nextSibling);
    }
    noResult.innerHTML = '&#128269; 未找到与 "<strong>' + keyword + '</strong>" 相关的行业或岗位';
    noResult.style.display = 'block';
  } else if (noResult) {
    noResult.style.display = 'none';
  }
}

// ========== 行业详情渲染 ==========
function openIndustryDetail(index) {
  const ind = industryData[index];
  if (!ind) return;

  const container = document.getElementById('industryDetailContent');
  const stabClass = ind.stability === '高' ? 'meta-stability-high' : ind.stability === '中' ? 'meta-stability-mid' : 'meta-stability-low';
  const paceClass = ind.techPace === '快' ? 'meta-pace-fast' : ind.techPace === '中' ? 'meta-pace-mid' : 'meta-pace-slow';
  const riskClass = ind.riskLevel === '低' ? 'meta-stability-high' : ind.riskLevel === '中' ? 'meta-stability-mid' : ind.riskLevel === '中高' ? 'meta-stability-low' : 'meta-stability-low';

  // 产业链流程图样式
  const chainParts = ind.chain.split('→').map(p => p.trim());
  const chainHtml = chainParts.map((p, i) => {
    return `<div class="chain-node">${p}</div>` + (i < chainParts.length - 1 ? '<div class="chain-arrow">&#10132;</div>' : '');
  }).join('');

  // 发展趋势
  const trendsHtml = ind.trends.map((t, i) => `<li><span class="trend-num">${i + 1}</span> ${t}</li>`).join('');

  // 热门岗位
  const hotJobsHtml = (ind.hotJobs || []).map(j => `<span class="hot-job-tag">${j}</span>`).join('');

  // 全部岗位
  const allJobsHtml = ind.jobs.map(j => `<span class="all-job-tag" onclick="event.stopPropagation()">${j}</span>`).join('');

  container.innerHTML = `
    <div class="industry-detail-header">
      <button class="btn-back" onclick="navigateTo('industry')">&#8592; 返回行业探索</button>
      <h2 class="industry-detail-title">${ind.name}</h2>
    </div>

    <!-- 行业概述 -->
    <div class="industry-detail-section">
      <div class="industry-detail-section-title">&#128218; 行业概述</div>
      <p class="industry-overview-text">${ind.overview}</p>
    </div>

    <!-- 核心数据 -->
    <div class="industry-detail-section">
      <div class="industry-detail-section-title">&#128202; 核心数据</div>
      <div class="industry-core-data">
        <div class="core-data-item">
          <div class="core-data-label">需求稳定性</div>
          <span class="meta-tag ${stabClass}">${ind.stability}</span>
        </div>
        <div class="core-data-item">
          <div class="core-data-label">技术迭代速度</div>
          <span class="meta-tag ${paceClass}">${ind.techPace}</span>
        </div>
        <div class="core-data-item">
          <div class="core-data-label">AI影响风险</div>
          <span class="meta-tag ${riskClass}">${ind.riskLevel}</span>
        </div>
      </div>
      <div class="industry-risk-desc">${ind.riskDesc}</div>
    </div>

    <!-- 产业链结构 -->
    <div class="industry-detail-section">
      <div class="industry-detail-section-title">&#128279; 产业链结构</div>
      <div class="industry-chain-flow">${chainHtml}</div>
    </div>

    <!-- 发展趋势 -->
    <div class="industry-detail-section">
      <div class="industry-detail-section-title">&#128200; 发展趋势</div>
      <ol class="industry-trends-list">${trendsHtml}</ol>
    </div>

    <!-- 热门岗位 -->
    <div class="industry-detail-section">
      <div class="industry-detail-section-title">&#128293; 热门岗位</div>
      <div class="hot-jobs-grid">${hotJobsHtml}</div>
    </div>

    <!-- 全部细分岗位 -->
    <div class="industry-detail-section">
      <div class="industry-detail-section-title">&#128187; 全部细分岗位</div>
      <div class="all-jobs-grid">${allJobsHtml}</div>
    </div>

    <!-- 行业稳定性评估矩阵 -->
    <div class="industry-detail-section">
      <div class="industry-detail-section-title">&#128203; 行业稳定性评估矩阵</div>
      <p class="matrix-desc">X轴 = 技术迭代速度（慢 → 快），Y轴 = 需求稳定性（低 → 高）。当前行业已高亮标注。</p>
      <div class="stability-matrix" id="stabilityMatrix"></div>
    </div>
  `;

  // 渲染矩阵
  renderStabilityMatrix(index);

  // 导航到详情视图
  navigateTo('industry-detail');
}

// ========== 行业稳定性评估矩阵 ==========
function renderStabilityMatrix(highlightIndex) {
  const matrix = document.getElementById('stabilityMatrix');
  if (!matrix) return;

  // 为每个行业计算矩阵坐标
  // X轴: techPace → 慢=1, 中=2, 快=3
  // Y轴: stability → 低=1, 中=2, 高=3
  const positions = industryData.map((ind, i) => {
    const x = ind.techPace === '慢' ? 1 : ind.techPace === '中' ? 2 : 3;
    const y = ind.stability === '低' ? 1 : ind.stability === '中' ? 2 : 3;
    return { index: i, name: ind.name, x, y };
  });

  // 四象限标签
  const quadrantLabels = {
    'top-left': '稳定且保守',
    'top-right': '稳定且创新',
    'bottom-left': '波动且保守',
    'bottom-right': '波动且创新'
  };

  // 构建矩阵
  // 使用3x3网格，行列从上到下: y=3(高), y=2(中), y=1(低)
  // 列从左到右: x=1(慢), x=2(中), x=3(快)
  let html = '<div class="matrix-grid">';

  // Y轴标签
  html += '<div class="matrix-y-label">需求稳定性<br><span class="matrix-axis-hint">高</span></div>';

  // 网格区域
  html += '<div class="matrix-body">';

  // 象限背景 + 行业点
  for (let row = 0; row < 3; row++) {
    const yVal = 3 - row; // y=3,2,1
    for (let col = 0; col < 3; col++) {
      const xVal = col + 1; // x=1,2,3
      let quadrantClass = '';
      if (yVal >= 2 && xVal <= 2) quadrantClass = 'quadrant-stable-slow';
      else if (yVal >= 2 && xVal >= 2) quadrantClass = 'quadrant-stable-fast';
      else if (yVal <= 2 && xVal <= 2) quadrantClass = 'quadrant-unstable-slow';
      else quadrantClass = 'quadrant-unstable-fast';

      // 找到在这个位置的行业
      const itemsHere = positions.filter(p => p.x === xVal && p.y === yVal);

      html += `<div class="matrix-cell ${quadrantClass}">`;
      itemsHere.forEach(item => {
        const isHighlight = item.index === highlightIndex;
        html += `<div class="matrix-dot ${isHighlight ? 'matrix-dot-highlight' : ''}" onclick="openIndustryDetail(${item.index})" title="${item.name}">${item.name}</div>`;
      });
      html += '</div>';
    }
  }

  html += '</div>'; // matrix-body

  // X轴标签
  html += '<div class="matrix-x-label">技术迭代速度<br><span class="matrix-axis-hint">慢 → 快</span></div>';

  html += '</div>'; // matrix-grid

  // 图例
  html += '<div class="matrix-legend">';
  html += '<div class="matrix-legend-item"><div class="matrix-legend-dot matrix-dot-highlight"></div>当前行业</div>';
  html += '<div class="matrix-legend-item"><div class="matrix-legend-dot matrix-dot-normal"></div>其他行业</div>';
  html += '</div>';

  matrix.innerHTML = html;
}
