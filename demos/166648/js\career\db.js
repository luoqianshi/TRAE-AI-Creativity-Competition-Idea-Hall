// ========== 职业库 ==========
// 数据来源：O*NET数据库 + 国内招聘市场（2025-2026）
// Holland代码参考O*NET官方分类
const careerDB = [

  // ==================== 原有20条（扩展新增4个字段） ====================

  // ---- 互联网/科技 ----
  { name: '数据分析师', code: 'ICR', industry: '互联网', type: '研究分析类', skills: ['SQL','Python','数据可视化','统计学'], stability: '中', techPace: '快', prospect: '需求旺盛，AI时代数据驱动决策成为标配，各行业数字化转型持续催生岗位', entryBarrier: '中等', workTraits: '偏重分析思维，需要持续学习新技术，日常与SQL、BI工具打交道' },
  { name: '产品经理', code: 'ECS', industry: '互联网', type: '管理类', skills: ['需求分析','项目管理','数据分析','沟通协调'], stability: '中', techPace: '快', prospect: '核心岗位，AI产品经理方向增量明显，复合型人才更受青睐', entryBarrier: '中等', workTraits: '跨部门协作频繁，需要平衡用户需求与商业目标，抗压能力要求高' },
  { name: '品牌设计师', code: 'AEI', industry: '互联网', type: '设计创作类', skills: ['视觉设计','品牌策略','Adobe套件','用户研究'], stability: '中', techPace: '快', prospect: 'AI辅助设计工具普及，设计师需向策略型和创意型方向升级', entryBarrier: '中等', workTraits: '注重审美与创意表达，需紧跟设计趋势，项目周期通常较短' },
  { name: '市场营销经理', code: 'ESA', industry: '互联网', type: '营销类', skills: ['市场调研','品牌推广','数据分析','渠道管理'], stability: '中', techPace: '快', prospect: '数字化营销持续增长，AI赋能精准投放，复合型营销人才稀缺', entryBarrier: '中等', workTraits: '节奏快、变化多，需要敏锐的市场嗅觉和较强的执行力' },
  { name: '用户研究员', code: 'ISA', industry: '互联网', type: '研究分析类', skills: ['用户访谈','可用性测试','数据分析','报告撰写'], stability: '中', techPace: '快', prospect: '体验经济时代UX研究价值凸显，大厂和出海企业需求稳定', entryBarrier: '较高', workTraits: '需要同理心和洞察力，大量定性定量研究交替进行，报告输出密集' },
  { name: '前端开发工程师', code: 'RIC', industry: '互联网', type: '知识技能类', skills: ['HTML/CSS/JS','React/Vue','性能优化','响应式设计'], stability: '中', techPace: '快', prospect: 'Web技术持续演进，AI辅助编码提升效率，全栈化趋势明显', entryBarrier: '中等', workTraits: '技术迭代快，需要持续学习新框架，注重代码质量和用户体验' },
  { name: 'AI产品运营', code: 'ECI', industry: '互联网', type: '管理类', skills: ['AI产品理解','数据分析','用户增长','内容运营'], stability: '低', techPace: '快', prospect: 'AI赛道高速增长，懂技术又懂运营的复合人才非常抢手', entryBarrier: '较高', workTraits: '需要理解AI技术原理并转化为运营策略，工作节奏快、变化多' },
  { name: '项目经理PMO', code: 'ECS', industry: '互联网', type: '管理类', skills: ['项目管理','风险控制','跨部门协调','进度管理'], stability: '中', techPace: '中', prospect: '各行业数字化转型需要专业项目管理人才，PMP认证加分明显', entryBarrier: '中等', workTraits: '协调沟通为主，需要把控全局进度，处理突发问题的能力很重要' },
  { name: '商务拓展BD', code: 'EBS', industry: '互联网', type: '营销类', skills: ['商务谈判','客户关系','市场分析','合同管理'], stability: '中', techPace: '快', prospect: '企业间合作与生态建设需求持续，业绩导向型岗位收入弹性大', entryBarrier: '低', workTraits: '外向型工作，需要频繁出差和社交，业绩压力大但回报可观' },
  { name: '内容运营', code: 'ASE', industry: '互联网', type: '设计创作类', skills: ['内容策划','文案撰写','数据分析','热点追踪'], stability: '低', techPace: '快', prospect: '短视频和AI内容创作重塑行业，优质内容创作者始终稀缺', entryBarrier: '低', workTraits: '创意驱动型工作，需要网感和文字功底，紧跟热点节奏快' },

  // ---- 教育 ----
  { name: '培训讲师', code: 'SEC', industry: '教育', type: '服务类', skills: ['课程设计','演讲表达','学员管理','知识沉淀'], stability: '高', techPace: '慢', prospect: '职业教育和终身学习市场持续扩大，线上+线下融合模式成为主流', entryBarrier: '低', workTraits: '以授课为主，需要良好的表达能力和耐心，备课和授课交替进行' },

  // ---- 服务业 ----
  { name: '人力资源专员', code: 'SEC', industry: '服务业', type: '服务类', skills: ['招聘管理','员工关系','薪酬福利','劳动法规'], stability: '高', techPace: '慢', prospect: 'HR数字化工具普及，传统HR需向HRBP和人才发展等高价值方向转型', entryBarrier: '低', workTraits: '与人打交道为主，需要细心和耐心，处理员工事务需要高情商' },

  // ---- 金融 ----
  { name: '财务分析师', code: 'CIE', industry: '金融', type: '研究分析类', skills: ['财务建模','Excel','数据分析','CPA知识'], stability: '高', techPace: '中', prospect: '企业对财务精细化管理和战略决策支持需求增加，CMA/CPA持证者优先', entryBarrier: '较高', workTraits: '注重数据准确性和逻辑分析，报表周期性强，加班集中在月末年底' },

  // ---- 建筑业 ----
  { name: '土木工程师', code: 'RCI', industry: '建筑业', type: '知识技能类', skills: ['结构设计','AutoCAD','项目管理','施工管理'], stability: '高', techPace: '慢', prospect: '基建投资趋于平稳，新基建和绿色建筑带来新机遇，持证工程师竞争力强', entryBarrier: '较高', workTraits: '现场与办公室交替，需要扎实的工程知识，项目周期长、责任重大' },

  // ---- 医疗 ----
  { name: '临床研究员', code: 'ISR', industry: '医疗', type: '研究分析类', skills: ['实验设计','数据分析','文献检索','GCP规范'], stability: '高', techPace: '中', prospect: '生物医药和创新药研发投入持续增长，临床研究人才缺口大', entryBarrier: '高', workTraits: '科研严谨性要求高，需要医学或药学背景，论文和数据报告输出密集' },

  // ---- 多行业 ----
  { name: '创业公司CEO', code: 'EAR', industry: '多行业', type: '管理类', skills: ['战略规划','融资能力','团队搭建','商业洞察'], stability: '低', techPace: '快', prospect: '创业风险高但回报潜力大，AI和新能源赛道机会较多', entryBarrier: '高', workTraits: '全能型角色，需要极强的抗压能力和资源整合能力，工作生活界限模糊' },

  // ---- 政府 ----
  { name: '公务员', code: 'CSE', industry: '政府', type: '监督执行类', skills: ['公文写作','政策理解','组织协调','执行力'], stability: '高', techPace: '慢', prospect: '稳定性极高，竞争激烈，数字化政务带来新的岗位需求', entryBarrier: '高', workTraits: '流程规范、层级分明，注重政策执行和公文处理，稳定性强但晋升周期长' },

  // ---- 医疗 ----
  { name: '心理咨询师', code: 'SAI', industry: '医疗', type: '服务类', skills: ['心理咨询技术','沟通能力','案例分析','伦理规范'], stability: '高', techPace: '慢', prospect: '社会心理健康意识提升，企业和学校对心理咨询需求持续增长', entryBarrier: '较高', workTraits: '需要强大的心理承受能力和共情能力，持续接受督导和培训' },

  // ---- 制造业 ----
  { name: '电子工程师', code: 'RIC', industry: '制造业', type: '知识技能类', skills: ['电路设计','嵌入式开发','测试调试','技术文档'], stability: '中', techPace: '中', prospect: '芯片国产化和智能制造推动需求，物联网和汽车电子方向前景好', entryBarrier: '较高', workTraits: '需要扎实的电子学基础，实验室和产线工作结合，注重细节和精度' },

  // ---- 贸易零售 ----
  { name: '供应链管理', code: 'CEI', industry: '贸易零售', type: '管理类', skills: ['供应商管理','库存优化','数据分析','成本控制'], stability: '中', techPace: '中', prospect: '全球供应链重构，数字化供应链管理人才稀缺，跨境电商带来新机遇', entryBarrier: '中等', workTraits: '需要全局思维和协调能力，涉及采购、仓储、物流多环节，突发事件多' },

  // ==================== 新增职业（35+条） ====================

  // ---- 互联网/科技 ----
  { name: '后端开发工程师', code: 'IRC', industry: '互联网', type: '知识技能类', skills: ['Java/Go/Python','数据库设计','分布式系统','API设计'], stability: '中', techPace: '快', prospect: '后端架构持续演进，云原生和微服务趋势下高级工程师供不应求', entryBarrier: '中等', workTraits: '注重系统架构和代码质量，需要解决高并发和性能问题，逻辑思维要求高' },
  { name: '算法工程师', code: 'IRE', industry: '互联网', type: '研究分析类', skills: ['机器学习','深度学习','Python','数学建模'], stability: '中', techPace: '快', prospect: 'AI大模型时代核心岗位，NLP/CV/推荐系统方向需求旺盛，人才缺口显著', entryBarrier: '高', workTraits: '研究导向型工作，需要扎实的数学功底和编程能力，论文复现和模型调优是日常' },
  { name: 'DevOps工程师', code: 'RIC', industry: '互联网', type: '知识技能类', skills: ['Docker/K8s','CI/CD','Linux','监控运维'], stability: '中', techPace: '快', prospect: '云原生和自动化运维需求持续增长，SRE方向前景广阔', entryBarrier: '中等', workTraits: '兼顾开发和运维，需要7x24小时响应能力，自动化思维是核心' },
  { name: '测试工程师', code: 'CRI', industry: '互联网', type: '知识技能类', skills: ['自动化测试','性能测试','Selenium','测试用例设计'], stability: '中', techPace: '快', prospect: 'AI辅助测试工具兴起，测试开发（QA工程师）方向价值更高', entryBarrier: '低', workTraits: '注重细节和逻辑严密性，需要编写测试脚本和跟踪缺陷，项目发布期加班多' },
  { name: 'UI/UX设计师', code: 'AIR', industry: '互联网', type: '设计创作类', skills: ['Figma/Sketch','交互设计','用户研究','设计系统'], stability: '中', techPace: '快', prospect: '体验设计成为产品核心竞争力，AI辅助设计工具提升效率但创意能力不可替代', entryBarrier: '中等', workTraits: '平衡美学与可用性，需要频繁与产品和开发沟通，作品集是求职关键' },
  { name: '数据科学家', code: 'IRE', industry: '互联网', type: '研究分析类', skills: ['Python/R','机器学习','统计分析','大数据处理'], stability: '中', techPace: '快', prospect: 'AI和大数据深度融合，数据科学家向AI工程师演进，高端人才稀缺', entryBarrier: '高', workTraits: '研究型工作，需要数学、统计和编程综合能力，模型构建和业务洞察并重' },
  { name: '安全工程师', code: 'IRC', industry: '互联网', type: '知识技能类', skills: ['网络安全','渗透测试','安全审计','应急响应'], stability: '高', techPace: '快', prospect: '网络安全法规趋严，数据安全和隐私保护需求激增，人才缺口大', entryBarrier: '较高', workTraits: '需要攻防兼备的技术能力，持续跟踪安全漏洞和威胁情报，责任重大' },

  // ---- 金融 ----
  { name: '银行客户经理', code: 'ESC', industry: '金融', type: '营销类', skills: ['客户关系管理','信贷评估','金融产品知识','销售技巧'], stability: '高', techPace: '慢', prospect: '传统银行数字化转型中，理财和私人银行方向增长空间大', entryBarrier: '低', workTraits: '以客户服务为主，需要金融知识储备和社交能力，业绩指标压力大' },
  { name: '基金经理', code: 'IEC', industry: '金融', type: '研究分析类', skills: ['投资分析','风险管理','财务建模','行业研究'], stability: '中', techPace: '中', prospect: '资管行业规范发展，量化基金和ESG投资是新兴方向，持证要求高', entryBarrier: '高', workTraits: '高压高回报，需要敏锐的市场判断力和强大的心理素质，工作时间长' },
  { name: '保险精算师', code: 'ICE', industry: '金融', type: '研究分析类', skills: ['精算建模','概率统计','风险管理','Excel/VBA'], stability: '高', techPace: '慢', prospect: '持证精算师稀缺，保险科技和健康险领域需求增长', entryBarrier: '高', workTraits: '数学和统计为核心，需要通过多门精算考试，工作节奏相对稳定但学习压力大' },
  { name: '风控分析师', code: 'CIE', industry: '金融', type: '研究分析类', skills: ['风险评估','数据分析','合规审查','模型构建'], stability: '高', techPace: '中', prospect: '金融监管趋严，智能风控和反欺诈方向需求旺盛', entryBarrier: '中等', workTraits: '注重数据和合规，需要严谨的分析能力，与业务部门协作频繁' },
  { name: '投资顾问', code: 'ECS', industry: '金融', type: '营销类', skills: ['资产配置','客户沟通','市场分析','金融产品'], stability: '中', techPace: '中', prospect: '财富管理市场扩容，独立投顾模式兴起，专业能力决定收入上限', entryBarrier: '中等', workTraits: '以客户服务为导向，需要持续学习金融市场知识，业绩与客户资产挂钩' },

  // ---- 医疗/健康 ----
  { name: '临床医生', code: 'ISR', industry: '医疗', type: '服务类', skills: ['临床诊断','病历书写','医患沟通','循证医学'], stability: '高', techPace: '中', prospect: '医疗资源紧缺持续，专科医生和全科医生均有广阔前景，AI辅助诊断提升效率', entryBarrier: '高', workTraits: '需要长期医学教育和规培，工作强度大、责任重，但社会地位高' },
  { name: '护士', code: 'SER', industry: '医疗', type: '服务类', skills: ['临床护理','医患沟通','护理记录','急救技能'], stability: '高', techPace: '慢', prospect: '老龄化社会护理需求激增，高级护理和专科护理方向发展空间大', entryBarrier: '中等', workTraits: '工作强度大、轮班频繁，需要耐心和细心，医患沟通能力很重要' },
  { name: '药剂师', code: 'ICS', industry: '医疗', type: '服务类', skills: ['药品管理','药理学','处方审核','用药指导'], stability: '高', techPace: '慢', prospect: '药店和医院药房需求稳定，临床药师方向价值提升', entryBarrier: '较高', workTraits: '需要药学专业背景和执业资格，工作规范性强，注重用药安全' },
  { name: '健康管理师', code: 'SEC', industry: '医疗', type: '服务类', skills: ['健康评估','营养指导','慢病管理','健康数据分析'], stability: '中', techPace: '中', prospect: '大健康产业快速发展，企业和个人健康管理意识增强，岗位需求增长', entryBarrier: '低', workTraits: '以健康咨询和教育为主，需要医学基础和沟通能力，服务导向型工作' },
  { name: '医疗器械销售', code: 'EBS', industry: '医疗', type: '营销类', skills: ['产品知识','客户关系','市场开拓','招投标'], stability: '中', techPace: '中', prospect: '国产医疗器械替代加速，高值耗材和影像设备方向利润空间大', entryBarrier: '低', workTraits: '外向型工作，需要医学产品知识和社交能力，业绩导向、出差频繁' },

  // ---- 教育 ----
  { name: '学科教师', code: 'SEC', industry: '教育', type: '服务类', skills: ['学科教学','教案设计','学生管理','教育心理学'], stability: '高', techPace: '慢', prospect: '教师编制竞争激烈但稳定性极高，STEM教育和素质教育方向需求增长', entryBarrier: '中等', workTraits: '以教学和班级管理为主，需要耐心和教育热情，备课和批改占用大量时间' },
  { name: '教育产品经理', code: 'ECS', industry: '教育', type: '管理类', skills: ['教育需求分析','产品设计','数据分析','项目管理'], stability: '中', techPace: '快', prospect: '教育科技赛道持续火热，AI+教育产品创新不断，复合型人才受欢迎', entryBarrier: '中等', workTraits: '需要同时理解教育场景和技术实现，与教师和学生用户深度沟通' },
  { name: '在线教育运营', code: 'ESC', industry: '教育', type: '管理类', skills: ['课程运营','用户增长','数据分析','社群管理'], stability: '低', techPace: '快', prospect: '在线教育行业整合后趋于理性，知识付费和职业培训赛道仍有增长空间', entryBarrier: '低', workTraits: '以用户运营为核心，需要数据驱动思维，社群互动和活动策划是日常' },
  { name: '学术研究员', code: 'IRA', industry: '教育', type: '研究分析类', skills: ['文献综述','研究方法','论文写作','数据分析'], stability: '高', techPace: '慢', prospect: '高校和科研院所需求稳定，交叉学科研究机会增多，博士学历是门槛', entryBarrier: '高', workTraits: '研究导向型工作，需要长期专注和学术热情，论文发表和项目申报是核心任务' },

  // ---- 制造业 ----
  { name: '工业工程师', code: 'IRE', industry: '制造业', type: '知识技能类', skills: ['精益生产','工艺优化','IE手法','数据分析'], stability: '中', techPace: '中', prospect: '智能制造和工业4.0推动产业升级，懂精益+数字化的工程师稀缺', entryBarrier: '中等', workTraits: '需要在产线现场和办公室之间切换，注重流程优化和效率提升，实践性强' },
  { name: '质量管理工程师', code: 'CRI', industry: '制造业', type: '知识技能类', skills: ['质量体系','统计分析','检验技术','ISO标准'], stability: '高', techPace: '慢', prospect: '制造业高质量发展需求持续，六西格玛和数字化质量管理方向有前景', entryBarrier: '中等', workTraits: '注重规范和细节，需要熟悉质量标准和检验流程，责任心强' },
  { name: '自动化工程师', code: 'IRE', industry: '制造业', type: '知识技能类', skills: ['PLC编程','机器人调试','电气控制','MES系统'], stability: '中', techPace: '中', prospect: '工业自动化和机器人替代人工趋势加速，人才需求旺盛', entryBarrier: '较高', workTraits: '需要电气和机械综合知识，现场调试工作多，解决实际问题的能力很重要' },
  { name: '生产主管', code: 'ERC', industry: '制造业', type: '管理类', skills: ['生产计划','团队管理','质量控制','成本管理'], stability: '中', techPace: '慢', prospect: '制造业管理人才需求稳定，精益管理和数字化车间是发展方向', entryBarrier: '中等', workTraits: '一线管理岗位，需要协调产线工人和上级，处理生产异常和人员管理' },

  // ---- 建筑业 ----
  { name: '建筑师', code: 'AIR', industry: '建筑业', type: '设计创作类', skills: ['方案设计','建筑规范','BIM建模','项目管理'], stability: '中', techPace: '中', prospect: '绿色建筑和城市更新带来新机遇，注册建筑师含金量高', entryBarrier: '高', workTraits: '创意与技术并重，需要通过注册建筑师考试，项目周期长、加班多' },
  { name: '造价工程师', code: 'CER', industry: '建筑业', type: '知识技能类', skills: ['工程量清单','定额计价','造价软件','合同管理'], stability: '高', techPace: '慢', prospect: '基建和房地产项目持续需要造价管控，持证造价师稀缺', entryBarrier: '中等', workTraits: '注重数据和规范，需要熟悉工程计价规则，与甲方和施工方协调频繁' },
  { name: 'BIM工程师', code: 'IRC', industry: '建筑业', type: '知识技能类', skills: ['Revit建模','碰撞检查','BIM标准','项目管理'], stability: '中', techPace: '中', prospect: 'BIM技术在建筑全生命周期应用推广，政策推动下需求快速增长', entryBarrier: '中等', workTraits: '需要掌握BIM软件和建筑知识，在设计和施工阶段进行数字化协同' },
  { name: '室内设计师', code: 'AES', industry: '建筑业', type: '设计创作类', skills: ['空间规划','施工图绘制','材料知识','客户沟通'], stability: '中', techPace: '慢', prospect: '家装和商业空间设计需求稳定，全屋定制和智能家居带来新方向', entryBarrier: '低', workTraits: '创意与落地并重，需要与客户和施工方频繁沟通，项目管理和审美能力缺一不可' },

  // ---- 政府/公共事业 ----
  { name: '政策研究员', code: 'IES', industry: '政府', type: '研究分析类', skills: ['政策分析','文献研究','报告撰写','数据分析'], stability: '高', techPace: '慢', prospect: '智库和政府机构对政策研究需求稳定，数字治理和公共政策评估方向有增长', entryBarrier: '较高', workTraits: '研究型工作，需要扎实的政策理论功底和写作能力，工作节奏相对稳定' },
  { name: '社区工作者', code: 'SEC', industry: '政府', type: '服务类', skills: ['社区治理','居民服务','活动组织','矛盾调解'], stability: '高', techPace: '慢', prospect: '基层治理需求持续，社区数字化和智慧社区建设带来新岗位', entryBarrier: '低', workTraits: '以服务居民为主，需要耐心和亲和力，处理琐碎事务和邻里纠纷' },
  { name: '公共关系专员', code: 'EAS', industry: '政府', type: '营销类', skills: ['媒体沟通','危机公关','活动策划','文案撰写'], stability: '中', techPace: '中', prospect: '企业和政府对品牌形象和舆情管理日益重视，新媒体环境挑战与机遇并存', entryBarrier: '低', workTraits: '需要敏锐的媒体嗅觉和危机处理能力，工作节奏受突发事件影响大' },

  // ---- 零售/电商 ----
  { name: '电商运营', code: 'ESC', industry: '零售/电商', type: '管理类', skills: ['平台运营','数据分析','活动策划','供应链协调'], stability: '低', techPace: '快', prospect: '直播电商和跨境电商持续增长，AI赋能选品和投放，运营人才需求旺盛', entryBarrier: '低', workTraits: '数据驱动型工作，需要关注GMV和转化率，大促期间加班强度大' },
  { name: '买手', code: 'ERS', industry: '零售/电商', type: '营销类', skills: ['市场调研','选品能力','供应商谈判','趋势分析'], stability: '低', techPace: '快', prospect: '内容电商和直播带货催生买手需求，懂供应链和消费者趋势的复合人才稀缺', entryBarrier: '低', workTraits: '需要敏锐的时尚嗅觉和商业判断力，频繁出差看货，业绩导向明显' },
  { name: '品类经理', code: 'ECE', industry: '零售/电商', type: '管理类', skills: ['品类策略','数据分析','供应商管理','定价策略'], stability: '中', techPace: '中', prospect: '零售精细化运营趋势下品类管理价值凸显，全渠道融合是新方向', entryBarrier: '中等', workTraits: '需要数据分析和商业判断力，管理品类全生命周期，与采购和运营协作频繁' },
  { name: '客户成功经理', code: 'SEC', industry: '零售/电商', type: '服务类', skills: ['客户关系','数据分析','产品培训','续费管理'], stability: '中', techPace: '中', prospect: 'SaaS和订阅经济模式下客户成功岗位需求增长，B端企业尤其重视', entryBarrier: '中等', workTraits: '以客户留存和增长为目标，需要产品理解力和沟通能力，数据驱动决策' },

  // ---- 文化传媒 ----
  { name: '记者编辑', code: 'AIE', industry: '文化传媒', type: '设计创作类', skills: ['新闻采写','选题策划','采访技巧','多媒体编辑'], stability: '低', techPace: '快', prospect: '传统媒体转型中，深度报道和融媒体方向有价值，自媒体和独立内容创作者兴起', entryBarrier: '中等', workTraits: '需要新闻敏感度和写作能力，工作节奏受新闻事件驱动，出差和加班频繁' },
  { name: '视频编导', code: 'AES', industry: '文化传媒', type: '设计创作类', skills: ['脚本撰写','拍摄指导','后期剪辑','创意策划'], stability: '低', techPace: '快', prospect: '短视频和直播行业持续火热，优质内容编导稀缺，AI工具辅助创作提效', entryBarrier: '低', workTraits: '创意驱动型工作，需要视觉叙事能力，项目制工作节奏不规律' },
  { name: '广告创意总监', code: 'AER', industry: '文化传媒', type: '设计创作类', skills: ['创意策略','团队管理','客户提案','品牌传播'], stability: '低', techPace: '快', prospect: '品牌营销持续投入，AI创意工具改变工作方式，但核心创意能力不可替代', entryBarrier: '较高', workTraits: '需要创意天赋和团队领导力，提案和客户沟通频繁，工作节奏受项目节点影响' },
  { name: '新媒体运营', code: 'AES', industry: '文化传媒', type: '设计创作类', skills: ['内容策划','社交媒体','数据分析','短视频制作'], stability: '低', techPace: '快', prospect: '各品牌和企业都需要新媒体运营，AI工具提升效率但创意和网感仍是核心竞争力', entryBarrier: '低', workTraits: '需要网感和创意能力，紧跟平台算法变化，内容产出节奏快' },
  { name: '出版编辑', code: 'AIC', industry: '文化传媒', type: '设计创作类', skills: ['选题策划','稿件审校','版权管理','排版设计'], stability: '中', techPace: '慢', prospect: '传统出版向数字出版转型，知识付费和有声书带来新机遇', entryBarrier: '中等', workTraits: '需要文字功底和耐心，审稿和校对工作细致，出版周期较长' },

  // ---- 能源/环保 ----
  { name: '新能源工程师', code: 'IRE', industry: '能源/环保', type: '知识技能类', skills: ['光伏/风电技术','系统设计','项目管理','电力电子'], stability: '中', techPace: '快', prospect: '双碳目标驱动新能源产业爆发式增长，储能和氢能方向前景广阔', entryBarrier: '较高', workTraits: '需要电气工程背景，项目现场和设计院交替工作，技术更新快' },
  { name: '环境工程师', code: 'IRC', industry: '能源/环保', type: '知识技能类', skills: ['环境影响评价','污水处理','废气治理','环境监测'], stability: '高', techPace: '中', prospect: '环保政策趋严推动需求，土壤修复和固废处理是新兴增长点', entryBarrier: '中等', workTraits: '需要环境科学知识，现场采样和实验室分析结合，注重合规和标准' },
  { name: '碳排放管理师', code: 'ICE', industry: '能源/环保', type: '研究分析类', skills: ['碳核算','碳交易','ESG报告','数据分析'], stability: '中', techPace: '快', prospect: '碳交易市场扩容，企业ESG合规需求激增，新职业前景看好', entryBarrier: '中等', workTraits: '需要环境科学和经济管理知识，数据分析和报告撰写是核心工作' },

  // ---- 法律 ----
  { name: '律师', code: 'EIC', industry: '法律', type: '监督执行类', skills: ['法律检索','合同审查','诉讼代理','法律文书'], stability: '高', techPace: '慢', prospect: '法治社会建设推动需求，知识产权和数据合规方向增长明显，通过法考是门槛', entryBarrier: '高', workTraits: '需要通过法律职业资格考试，工作强度大、案源压力大，专业细分领域决定收入' },
  { name: '知识产权专员', code: 'ICE', industry: '法律', type: '监督执行类', skills: ['专利检索','商标管理','知识产权布局','侵权分析'], stability: '高', techPace: '中', prospect: '科技创新驱动知识产权保护需求增长，专利代理和AI相关IP方向热门', entryBarrier: '较高', workTraits: '需要理工科背景+法律知识，注重细节和逻辑分析，文书撰写工作密集' },
  { name: '合规经理', code: 'CES', industry: '法律', type: '监督执行类', skills: ['合规审查','风险评估','制度设计','监管沟通'], stability: '高', techPace: '中', prospect: '企业合规管理需求持续增长，数据合规和反垄断方向尤其紧缺', entryBarrier: '较高', workTraits: '需要法律和行业知识，制定和执行合规制度，与监管部门沟通频繁' },

  // ---- 农业/食品 ----
  { name: '食品研发工程师', code: 'IRE', industry: '农业/食品', type: '知识技能类', skills: ['食品配方','感官评价','食品安全','实验设计'], stability: '中', techPace: '中', prospect: '健康食品和功能性食品需求增长，植物基和预制菜方向有创新空间', entryBarrier: '中等', workTraits: '需要食品科学背景，实验室研发和生产线试产交替，注重安全和口感' },
  { name: '农业技术员', code: 'RIC', industry: '农业/食品', type: '知识技能类', skills: ['种植技术','病虫害防治','农业机械','智慧农业'], stability: '中', techPace: '中', prospect: '智慧农业和乡村振兴推动农业现代化，农业无人机和物联网技术应用增多', entryBarrier: '低', workTraits: '需要在田间地头工作，体力劳动与技术服务结合，季节性工作节奏明显' },

  // ---- 交通/物流 ----
  { name: '物流经理', code: 'ECS', industry: '交通/物流', type: '管理类', skills: ['仓储管理','运输调度','成本控制','团队管理'], stability: '中', techPace: '中', prospect: '电商和跨境贸易推动物流需求，智慧物流和自动化仓储是发展方向', entryBarrier: '中等', workTraits: '需要统筹协调能力，处理运输和仓储中的突发问题，旺季工作强度大' },
  { name: '供应链分析师', code: 'ICE', industry: '交通/物流', type: '研究分析类', skills: ['数据分析','需求预测','供应链建模','ERP系统'], stability: '中', techPace: '快', prospect: '供应链数字化和智能化趋势下分析人才稀缺，AI辅助预测提升岗位价值', entryBarrier: '中等', workTraits: '数据驱动型工作，需要统计和供应链知识，优化库存和降低成本是核心目标' },

  // ---- 旅游/酒店 ----
  { name: '酒店经理', code: 'ESC', industry: '旅游/酒店', type: '管理类', skills: ['酒店运营','客户服务','收益管理','团队管理'], stability: '低', techPace: '慢', prospect: '旅游市场复苏后稳步增长，中高端酒店和精品民宿方向有发展空间', entryBarrier: '中等', workTraits: '服务导向型管理岗位，需要处理客户投诉和突发事件，轮班工作常见' },
  { name: '旅游产品经理', code: 'EAS', industry: '旅游/酒店', type: '营销类', skills: ['旅游线路设计','供应商管理','市场分析','客户服务'], stability: '低', techPace: '中', prospect: '定制游和体验式旅行增长，文旅融合和数字旅游带来新机遇', entryBarrier: '低', workTraits: '需要旅行经验和创意能力，与供应商和客户沟通频繁，季节性波动明显' },

  // ---- 房地产 ----
  { name: '置业顾问', code: 'ERS', industry: '房地产', type: '营销类', skills: ['客户接待','房产知识','谈判技巧','市场分析'], stability: '低', techPace: '慢', prospect: '房地产市场趋于理性，存量房交易和租赁市场成为新增长点', entryBarrier: '低', workTraits: '业绩导向型工作，需要社交能力和抗压能力，收入与成交挂钩波动大' },
  { name: '物业管理经理', code: 'ESC', industry: '房地产', type: '管理类', skills: ['物业运营','设施维护','客户服务','安全管理'], stability: '高', techPace: '慢', prospect: '存量物业持续增长，智慧物业和社区增值服务是发展方向', entryBarrier: '低', workTraits: '需要处理业主日常问题和突发事件，协调维修、安保和保洁等多方工作' },

  // ---- 咨询/专业服务 ----
  { name: '管理咨询顾问', code: 'EIC', industry: '咨询/专业服务', type: '管理类', skills: ['战略分析','问题解决','PPT制作','客户沟通'], stability: '中', techPace: '快', prospect: '企业数字化转型和战略升级需求持续，AI和可持续发展是新热点', entryBarrier: '高', workTraits: '高强度脑力工作，项目制节奏快，频繁出差和客户沟通，成长曲线陡峭' },
  { name: '猎头顾问', code: 'ESC', industry: '咨询/专业服务', type: '营销类', skills: ['人才寻访','候选人评估','客户关系','行业研究'], stability: '中', techPace: '中', prospect: '高端人才市场竞争加剧，AI和新能源领域猎头需求旺盛', entryBarrier: '低', workTraits: '业绩导向型工作，需要社交能力和行业洞察力，收入与业绩提成挂钩' },
  { name: '财务顾问', code: 'CIE', industry: '咨询/专业服务', type: '研究分析类', skills: ['财务分析','税务筹划','投资评估','合规审查'], stability: '中', techPace: '中', prospect: '企业对专业财务顾问需求增长，并购重组和IPO方向机会多', entryBarrier: '较高', workTraits: '需要CPA等资质，注重数据分析和专业判断，客户信任是核心竞争力' },

  // ---- 其他 ----
  { name: '兽医', code: 'IRS', industry: '其他', type: '服务类', skills: ['动物诊断','外科手术','药理学','医患沟通'], stability: '高', techPace: '慢', prospect: '宠物经济持续增长，宠物医疗市场规模快速扩大，兽医人才供不应求', entryBarrier: '较高', workTraits: '需要兽医学专业背景和执业资格，工作涉及手术和急诊，需要爱心和体力' },
  { name: '景观设计师', code: 'AIR', industry: '其他', type: '设计创作类', skills: ['景观规划','植物配置','CAD/SU','施工图设计'], stability: '中', techPace: '慢', prospect: '城市更新和生态修复推动需求，海绵城市和乡村振兴带来项目机会', entryBarrier: '中等', workTraits: '需要风景园林知识，创意与工程结合，现场踏勘和图纸设计交替进行' },
  { name: '运动康复师', code: 'SIR', industry: '其他', type: '服务类', skills: ['运动损伤评估','康复训练','解剖学','手法治疗'], stability: '中', techPace: '中', prospect: '全民健身和体育产业发展，运动康复需求增长，专业人才稀缺', entryBarrier: '较高', workTraits: '需要运动科学或医学背景，实操性强，与运动员和患者密切互动' },
  { name: '翻译', code: 'AIS', industry: '其他', type: '设计创作类', skills: ['笔译','口译','术语管理','CAT工具'], stability: '中', techPace: '快', prospect: 'AI翻译工具提升效率但高端口译和文学翻译仍需人工，小语种翻译稀缺', entryBarrier: '中等', workTraits: '需要扎实的双语功底和专业知识，笔译注重精准、口译注重即时反应' },
  { name: '图书馆员', code: 'CIS', industry: '其他', type: '服务类', skills: ['文献分类','信息检索','读者服务','数字资源管理'], stability: '高', techPace: '慢', prospect: '公共文化服务需求稳定，数字图书馆和知识管理方向有转型空间', entryBarrier: '中等', workTraits: '工作节奏平稳，需要信息管理知识和耐心，以读者服务为核心' },
  { name: '档案管理员', code: 'CSE', industry: '其他', type: '监督执行类', skills: ['档案整理','数字化管理','保密管理','信息检索'], stability: '高', techPace: '慢', prospect: '政企档案数字化需求增长，电子档案管理是新方向', entryBarrier: '低', workTraits: '注重规范和保密，工作细致稳定，需要耐心处理大量文档' },
];
