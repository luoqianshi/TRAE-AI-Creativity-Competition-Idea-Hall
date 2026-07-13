class PoliticsChapter extends Chapter {
  constructor() {
    super('politics', '道法', 'fa-heart', '#e67e22');
    this.initLevels();
  }

  initLevels() {
    this.levels = [
      {
        levelNumber: 1,
        name: '第一单元 生活与消费',
        description: '高一政治第一单元',
        difficulty: 1,
        timeLimit: 180,
        unlocked: true,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_politics_001',
            question: '商品的两个基本属性是（ ）',
            options: [
              { key: 'A', value: '使用价值和价值', explanation: '' },
              { key: 'B', value: '价值和价格', explanation: '' },
              { key: 'C', value: '使用价值和交换价值', explanation: '' },
              { key: 'D', value: '价值和价值量', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '商品的两个基本属性是使用价值和价值。'
          },
          {
            id: 'q_politics_002',
            question: '货币的本质是（ ）',
            options: [
              { key: 'A', value: '商品', explanation: '' },
              { key: 'B', value: '一般等价物', explanation: '' },
              { key: 'C', value: '金银', explanation: '' },
              { key: 'D', value: '纸币', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '货币的本质是一般等价物。'
          },
          {
            id: 'q_politics_003',
            question: '货币的基本职能不包括（ ）',
            options: [
              { key: 'A', value: '价值尺度', explanation: '' },
              { key: 'B', value: '流通手段', explanation: '' },
              { key: 'C', value: '支付手段', explanation: '' },
              { key: 'D', value: '世界货币', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '货币的基本职能是价值尺度和流通手段，支付手段和世界货币是其他职能。'
          },
          {
            id: 'q_politics_004',
            question: '纸币的发行量必须以（ ）为限度',
            options: [
              { key: 'A', value: '流通中所需要的货币量', explanation: '' },
              { key: 'B', value: '国家的黄金储备', explanation: '' },
              { key: 'C', value: '居民的储蓄量', explanation: '' },
              { key: 'D', value: '商品的总量', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '纸币的发行量必须以流通中所需要的货币量为限度。'
          },
          {
            id: 'q_politics_005',
            question: '影响价格的因素主要是（ ）',
            options: [
              { key: 'A', value: '价值和供求关系', explanation: '' },
              { key: 'B', value: '价值和使用价值', explanation: '' },
              { key: 'C', value: '供求关系和使用价值', explanation: '' },
              { key: 'D', value: '价值和货币发行量', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '影响价格的因素主要是价值和供求关系。'
          },
          {
            id: 'q_politics_006',
            question: '价值规律的表现形式是（ ）',
            options: [
              { key: 'A', value: '价格围绕价值上下波动', explanation: '' },
              { key: 'B', value: '价格等于价值', explanation: '' },
              { key: 'C', value: '价格高于价值', explanation: '' },
              { key: 'D', value: '价格低于价值', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '价值规律的表现形式是价格围绕价值上下波动。'
          },
          {
            id: 'q_politics_007',
            question: '价格变动对生活必需品的影响（ ）',
            options: [
              { key: 'A', value: '较大', explanation: '' },
              { key: 'B', value: '较小', explanation: '' },
              { key: 'C', value: '没有影响', explanation: '' },
              { key: 'D', value: '不确定', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '价格变动对生活必需品的影响较小，因为它们是生活必需的。'
          },
          {
            id: 'q_politics_008',
            question: '价格变动对高档耐用品的影响（ ）',
            options: [
              { key: 'A', value: '较大', explanation: '' },
              { key: 'B', value: '较小', explanation: '' },
              { key: 'C', value: '没有影响', explanation: '' },
              { key: 'D', value: '不确定', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '价格变动对高档耐用品的影响较大，因为它们不是生活必需的。'
          },
          {
            id: 'q_politics_009',
            question: '影响消费的主要因素是（ ）',
            options: [
              { key: 'A', value: '收入水平和物价水平', explanation: '' },
              { key: 'B', value: '收入水平和消费心理', explanation: '' },
              { key: 'C', value: '物价水平和消费心理', explanation: '' },
              { key: 'D', value: '收入水平、物价水平和消费心理', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '影响消费的主要因素包括收入水平、物价水平和消费心理。'
          },
          {
            id: 'q_politics_010',
            question: '按消费目的划分，消费可以分为（ ）',
            options: [
              { key: 'A', value: '生存资料消费、发展资料消费和享受资料消费', explanation: '' },
              { key: 'B', value: '有形商品消费和劳务消费', explanation: '' },
              { key: 'C', value: '钱货两清消费、贷款消费和租赁消费', explanation: '' },
              { key: 'D', value: '个人消费和家庭消费', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '按消费目的划分，消费可以分为生存资料消费、发展资料消费和享受资料消费。'
          }
        ]
      },
      {
        levelNumber: 2,
        name: '第二单元 生产、劳动与经营',
        description: '高一政治第二单元',
        difficulty: 1,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_politics_011',
            question: '生产与消费的关系是（ ）',
            options: [
              { key: 'A', value: '生产决定消费，消费反作用于生产', explanation: '' },
              { key: 'B', value: '消费决定生产，生产反作用于消费', explanation: '' },
              { key: 'C', value: '生产和消费相互决定', explanation: '' },
              { key: 'D', value: '生产和消费没有关系', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '生产决定消费，消费对生产有反作用。'
          },
          {
            id: 'q_politics_012',
            question: '社会主义初级阶段的基本经济制度是（ ）',
            options: [
              { key: 'A', value: '公有制为主体，多种所有制经济共同发展', explanation: '' },
              { key: 'B', value: '私有制为主体，多种所有制经济共同发展', explanation: '' },
              { key: 'C', value: '单一公有制', explanation: '' },
              { key: 'D', value: '单一私有制', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '社会主义初级阶段的基本经济制度是公有制为主体，多种所有制经济共同发展。'
          },
          {
            id: 'q_politics_013',
            question: '公有制经济的主体地位主要体现在（ ）',
            options: [
              { key: 'A', value: '公有资产在社会总资产中占优势', explanation: '' },
              { key: 'B', value: '国有经济控制国民经济命脉', explanation: '' },
              { key: 'C', value: '国有经济对经济发展起主导作用', explanation: '' },
              { key: 'D', value: '以上都对', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '公有制经济的主体地位体现在公有资产在社会总资产中占优势，国有经济控制国民经济命脉，对经济发展起主导作用。'
          },
          {
            id: 'q_politics_014',
            question: '企业的主要组织形式是（ ）',
            options: [
              { key: 'A', value: '公司制', explanation: '' },
              { key: 'B', value: '合伙制', explanation: '' },
              { key: 'C', value: '个人独资企业', explanation: '' },
              { key: 'D', value: '集体企业', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '企业的主要组织形式是公司制。'
          },
          {
            id: 'q_politics_015',
            question: '公司的类型主要有（ ）',
            options: [
              { key: 'A', value: '有限责任公司和股份有限公司', explanation: '' },
              { key: 'B', value: '国有公司和私营公司', explanation: '' },
              { key: 'C', value: '上市公司和非上市公司', explanation: '' },
              { key: 'D', value: '大公司和小公司', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '公司的类型主要有有限责任公司和股份有限公司。'
          },
          {
            id: 'q_politics_016',
            question: '企业经营成功的因素不包括（ ）',
            options: [
              { key: 'A', value: '制定正确的经营战略', explanation: '' },
              { key: 'B', value: '提高自主创新能力', explanation: '' },
              { key: 'C', value: '诚信经营', explanation: '' },
              { key: 'D', value: '降低产品质量', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '降低产品质量会导致企业经营失败，不是成功因素。'
          },
          {
            id: 'q_politics_017',
            question: '就业的意义不包括（ ）',
            options: [
              { key: 'A', value: '创造社会财富', explanation: '' },
              { key: 'B', value: '获得劳动报酬', explanation: '' },
              { key: 'C', value: '实现人生价值', explanation: '' },
              { key: 'D', value: '增加社会负担', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '就业不会增加社会负担，而是减轻社会负担。'
          },
          {
            id: 'q_politics_018',
            question: '劳动者的权利不包括（ ）',
            options: [
              { key: 'A', value: '平等就业和选择职业的权利', explanation: '' },
              { key: 'B', value: '取得劳动报酬的权利', explanation: '' },
              { key: 'C', value: '休息休假的权利', explanation: '' },
              { key: 'D', value: '无故旷工的权利', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '无故旷工不是劳动者的权利，而是违反劳动纪律的行为。'
          },
          {
            id: 'q_politics_019',
            question: '我国的商业银行体系不包括（ ）',
            options: [
              { key: 'A', value: '中国工商银行', explanation: '' },
              { key: 'B', value: '中国建设银行', explanation: '' },
              { key: 'C', value: '中国人民银行', explanation: '' },
              { key: 'D', value: '中国银行', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '中国人民银行是中央银行，不是商业银行。'
          },
          {
            id: 'q_politics_020',
            question: '储蓄存款的主要机构是（ ）',
            options: [
              { key: 'A', value: '商业银行', explanation: '' },
              { key: 'B', value: '证券公司', explanation: '' },
              { key: 'C', value: '保险公司', explanation: '' },
              { key: 'D', value: '信托公司', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '储蓄存款的主要机构是商业银行。'
          }
        ]
      },
      {
        levelNumber: 3,
        name: '第三单元 收入与分配',
        description: '高一政治第三单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_politics_021',
            question: '我国的分配制度是（ ）',
            options: [
              { key: 'A', value: '按劳分配为主体，多种分配方式并存', explanation: '' },
              { key: 'B', value: '按需分配', explanation: '' },
              { key: 'C', value: '平均分配', explanation: '' },
              { key: 'D', value: '按资分配', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '我国的分配制度是按劳分配为主体，多种分配方式并存。'
          },
          {
            id: 'q_politics_022',
            question: '按劳分配的前提是（ ）',
            options: [
              { key: 'A', value: '生产资料公有制', explanation: '' },
              { key: 'B', value: '生产资料私有制', explanation: '' },
              { key: 'C', value: '市场经济', explanation: '' },
              { key: 'D', value: '计划经济', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '按劳分配的前提是生产资料公有制。'
          },
          {
            id: 'q_politics_023',
            question: '按生产要素分配不包括（ ）',
            options: [
              { key: 'A', value: '按劳动要素分配', explanation: '' },
              { key: 'B', value: '按资本要素分配', explanation: '' },
              { key: 'C', value: '按技术要素分配', explanation: '' },
              { key: 'D', value: '按人口分配', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '按生产要素分配包括劳动、资本、技术、管理等要素，不包括按人口分配。'
          },
          {
            id: 'q_politics_024',
            question: '收入分配公平的含义是（ ）',
            options: [
              { key: 'A', value: '收入分配相对平等', explanation: '' },
              { key: 'B', value: '平均分配', explanation: '' },
              { key: 'C', value: '收入差距越大越好', explanation: '' },
              { key: 'D', value: '收入差距越小越好', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '收入分配公平是指收入分配相对平等，不是平均分配。'
          },
          {
            id: 'q_politics_025',
            question: '财政的作用不包括（ ）',
            options: [
              { key: 'A', value: '促进社会公平', explanation: '' },
              { key: 'B', value: '改善人民生活', explanation: '' },
              { key: 'C', value: '促进资源合理配置', explanation: '' },
              { key: 'D', value: '阻碍经济发展', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '财政的作用是促进经济发展，不是阻碍经济发展。'
          },
          {
            id: 'q_politics_026',
            question: '财政收入的主要来源是（ ）',
            options: [
              { key: 'A', value: '税收', explanation: '' },
              { key: 'B', value: '利润', explanation: '' },
              { key: 'C', value: '债务', explanation: '' },
              { key: 'D', value: '收费', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '税收是财政收入的主要来源。'
          },
          {
            id: 'q_politics_027',
            question: '税收的基本特征是（ ）',
            options: [
              { key: 'A', value: '强制性、无偿性、固定性', explanation: '' },
              { key: 'B', value: '自愿性、有偿性、灵活性', explanation: '' },
              { key: 'C', value: '强制性、有偿性、固定性', explanation: '' },
              { key: 'D', value: '自愿性、无偿性、灵活性', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '税收的基本特征是强制性、无偿性、固定性。'
          },
          {
            id: 'q_politics_028',
            question: '我国税收的性质是（ ）',
            options: [
              { key: 'A', value: '取之于民，用之于民', explanation: '' },
              { key: 'B', value: '取之于民，用之于官', explanation: '' },
              { key: 'C', value: '取之于官，用之于民', explanation: '' },
              { key: 'D', value: '取之于商，用之于商', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '我国税收的性质是取之于民，用之于民。'
          },
          {
            id: 'q_politics_029',
            question: '个人所得税的作用是（ ）',
            options: [
              { key: 'A', value: '调节个人收入分配', explanation: '' },
              { key: 'B', value: '增加财政收入', explanation: '' },
              { key: 'C', value: '促进社会公平', explanation: '' },
              { key: 'D', value: '以上都对', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '个人所得税具有调节个人收入分配、增加财政收入、促进社会公平的作用。'
          },
          {
            id: 'q_politics_030',
            question: '违反税法的行为不包括（ ）',
            options: [
              { key: 'A', value: '偷税', explanation: '' },
              { key: 'B', value: '欠税', explanation: '' },
              { key: 'C', value: '骗税', explanation: '' },
              { key: 'D', value: '依法纳税', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '依法纳税是公民的义务，不是违反税法的行为。'
          }
        ]
      },
      {
        levelNumber: 4,
        name: '第四单元 发展社会主义市场经济',
        description: '高一政治第四单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_politics_031',
            question: '市场经济的含义是（ ）',
            options: [
              { key: 'A', value: '市场在资源配置中起决定性作用', explanation: '' },
              { key: 'B', value: '计划在资源配置中起决定性作用', explanation: '' },
              { key: 'C', value: '政府在资源配置中起决定性作用', explanation: '' },
              { key: 'D', value: '企业在资源配置中起决定性作用', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '市场经济是市场在资源配置中起决定性作用的经济。'
          },
          {
            id: 'q_politics_032',
            question: '市场配置资源的方式是（ ）',
            options: [
              { key: 'A', value: '价格、供求、竞争', explanation: '' },
              { key: 'B', value: '计划、命令、指示', explanation: '' },
              { key: 'C', value: '政府、企业、个人', explanation: '' },
              { key: 'D', value: '生产、分配、交换', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '市场配置资源的方式是价格、供求、竞争。'
          },
          {
            id: 'q_politics_033',
            question: '市场调节的局限性不包括（ ）',
            options: [
              { key: 'A', value: '自发性', explanation: '' },
              { key: 'B', value: '盲目性', explanation: '' },
              { key: 'C', value: '滞后性', explanation: '' },
              { key: 'D', value: '高效性', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '高效性是市场调节的优点，不是局限性。'
          },
          {
            id: 'q_politics_034',
            question: '社会主义市场经济的基本特征不包括（ ）',
            options: [
              { key: 'A', value: '坚持公有制的主体地位', explanation: '' },
              { key: 'B', value: '以共同富裕为根本目标', explanation: '' },
              { key: 'C', value: '能够实行科学的宏观调控', explanation: '' },
              { key: 'D', value: '完全自由放任', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '完全自由放任是资本主义市场经济的特点，不是社会主义市场经济的特征。'
          },
          {
            id: 'q_politics_035',
            question: '宏观调控的主要目标是（ ）',
            options: [
              { key: 'A', value: '促进经济增长、增加就业、稳定物价、保持国际收支平衡', explanation: '' },
              { key: 'B', value: '促进经济增长、减少就业、提高物价、扩大国际收支', explanation: '' },
              { key: 'C', value: '抑制经济增长、增加就业、稳定物价、保持国际收支平衡', explanation: '' },
              { key: 'D', value: '促进经济增长、增加就业、降低物价、缩小国际收支', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '宏观调控的主要目标是促进经济增长、增加就业、稳定物价、保持国际收支平衡。'
          },
          {
            id: 'q_politics_036',
            question: '宏观调控的手段不包括（ ）',
            options: [
              { key: 'A', value: '经济手段', explanation: '' },
              { key: 'B', value: '法律手段', explanation: '' },
              { key: 'C', value: '行政手段', explanation: '' },
              { key: 'D', value: '暴力手段', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '宏观调控的手段包括经济手段、法律手段和行政手段，不包括暴力手段。'
          },
          {
            id: 'q_politics_037',
            question: '科学发展观的第一要义是（ ）',
            options: [
              { key: 'A', value: '发展', explanation: '' },
              { key: 'B', value: '以人为本', explanation: '' },
              { key: 'C', value: '全面协调可持续', explanation: '' },
              { key: 'D', value: '统筹兼顾', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '科学发展观的第一要义是发展。'
          },
          {
            id: 'q_politics_038',
            question: '科学发展观的核心是（ ）',
            options: [
              { key: 'A', value: '发展', explanation: '' },
              { key: 'B', value: '以人为本', explanation: '' },
              { key: 'C', value: '全面协调可持续', explanation: '' },
              { key: 'D', value: '统筹兼顾', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '科学发展观的核心是以人为本。'
          },
          {
            id: 'q_politics_039',
            question: '转变经济发展方式的主攻方向是（ ）',
            options: [
              { key: 'A', value: '推进经济结构战略性调整', explanation: '' },
              { key: 'B', value: '提高自主创新能力', explanation: '' },
              { key: 'C', value: '统筹城乡发展', explanation: '' },
              { key: 'D', value: '加强环境保护', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '转变经济发展方式的主攻方向是推进经济结构战略性调整。'
          },
          {
            id: 'q_politics_040',
            question: '创新驱动发展战略的核心是（ ）',
            options: [
              { key: 'A', value: '科技创新', explanation: '' },
              { key: 'B', value: '制度创新', explanation: '' },
              { key: 'C', value: '文化创新', explanation: '' },
              { key: 'D', value: '理论创新', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '创新驱动发展战略的核心是科技创新。'
          }
        ]
      },
      {
        levelNumber: 5,
        name: '第五单元 公民的政治生活',
        description: '高一政治第五单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_politics_041',
            question: '我国的国家性质是（ ）',
            options: [
              { key: 'A', value: '人民民主专政的社会主义国家', explanation: '' },
              { key: 'B', value: '资产阶级专政的国家', explanation: '' },
              { key: 'C', value: '无产阶级专政的国家', explanation: '' },
              { key: 'D', value: '民主共和制国家', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '我国的国家性质是人民民主专政的社会主义国家。'
          },
          {
            id: 'q_politics_042',
            question: '人民民主专政的本质是（ ）',
            options: [
              { key: 'A', value: '人民当家作主', explanation: '' },
              { key: 'B', value: '公民当家作主', explanation: '' },
              { key: 'C', value: '工人阶级当家作主', explanation: '' },
              { key: 'D', value: '农民阶级当家作主', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '人民民主专政的本质是人民当家作主。'
          },
          {
            id: 'q_politics_043',
            question: '人民民主的特点是（ ）',
            options: [
              { key: 'A', value: '广泛性和真实性', explanation: '' },
              { key: 'B', value: '狭隘性和虚伪性', explanation: '' },
              { key: 'C', value: '单一性和排他性', explanation: '' },
              { key: 'D', value: '局限性和暂时性', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '人民民主具有广泛性和真实性的特点。'
          },
          {
            id: 'q_politics_044',
            question: '公民的政治权利不包括（ ）',
            options: [
              { key: 'A', value: '选举权和被选举权', explanation: '' },
              { key: 'B', value: '政治自由', explanation: '' },
              { key: 'C', value: '监督权', explanation: '' },
              { key: 'D', value: '破坏社会秩序', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '破坏社会秩序是违法行为，不是公民的政治权利。'
          },
          {
            id: 'q_politics_045',
            question: '公民的政治义务不包括（ ）',
            options: [
              { key: 'A', value: '维护国家统一和民族团结', explanation: '' },
              { key: 'B', value: '遵守宪法和法律', explanation: '' },
              { key: 'C', value: '维护国家安全、荣誉和利益', explanation: '' },
              { key: 'D', value: '损害国家利益', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '损害国家利益是违法行为，不是公民的义务。'
          },
          {
            id: 'q_politics_046',
            question: '公民参与政治生活的基本原则不包括（ ）',
            options: [
              { key: 'A', value: '坚持公民在法律面前一律平等', explanation: '' },
              { key: 'B', value: '坚持权利与义务统一', explanation: '' },
              { key: 'C', value: '坚持个人利益与国家利益相结合', explanation: '' },
              { key: 'D', value: '坚持个人利益至上', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '个人利益至上会损害国家利益，不是参与政治生活的原则。'
          },
          {
            id: 'q_politics_047',
            question: '公民参与民主决策的方式不包括（ ）',
            options: [
              { key: 'A', value: '社情民意反映制度', explanation: '' },
              { key: 'B', value: '专家咨询制度', explanation: '' },
              { key: 'C', value: '重大事项社会公示制度', explanation: '' },
              { key: 'D', value: '暴力抗议', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '暴力抗议是违法行为，不是民主决策的方式。'
          },
          {
            id: 'q_politics_048',
            question: '公民参与民主管理的主要形式是（ ）',
            options: [
              { key: 'A', value: '农村村民自治和城市居民自治', explanation: '' },
              { key: 'B', value: '选举人民代表', explanation: '' },
              { key: 'C', value: '参加政府会议', explanation: '' },
              { key: 'D', value: '信访举报', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '公民参与民主管理的主要形式是农村村民自治和城市居民自治。'
          },
          {
            id: 'q_politics_049',
            question: '公民行使监督权的渠道不包括（ ）',
            options: [
              { key: 'A', value: '信访举报制度', explanation: '' },
              { key: 'B', value: '人大代表联系群众制度', explanation: '' },
              { key: 'C', value: '舆论监督制度', explanation: '' },
              { key: 'D', value: '造谣诽谤', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '造谣诽谤是违法行为，不是行使监督权的渠道。'
          },
          {
            id: 'q_politics_050',
            question: '有序与无序政治参与的区别在于（ ）',
            options: [
              { key: 'A', value: '是否遵循法律、规则和程序', explanation: '' },
              { key: 'B', value: '是否有足够的人数', explanation: '' },
              { key: 'C', value: '是否有领导人组织', explanation: '' },
              { key: 'D', value: '是否有媒体报道', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '有序与无序政治参与的区别在于是否遵循法律、规则和程序。'
          }
        ]
      },
      {
        levelNumber: 6,
        name: '第六单元 为人民服务的政府',
        description: '高一政治第六单元',
        difficulty: 3,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_politics_051',
            question: '我国政府的性质是（ ）',
            options: [
              { key: 'A', value: '国家权力机关的执行机关', explanation: '' },
              { key: 'B', value: '国家权力机关', explanation: '' },
              { key: 'C', value: '司法机关', explanation: '' },
              { key: 'D', value: '立法机关', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '我国政府是国家权力机关的执行机关，是行政机关。'
          },
          {
            id: 'q_politics_052',
            question: '我国政府的宗旨是（ ）',
            options: [
              { key: 'A', value: '为人民服务', explanation: '' },
              { key: 'B', value: '为政府服务', explanation: '' },
              { key: 'C', value: '为官员服务', explanation: '' },
              { key: 'D', value: '为企业服务', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '我国政府的宗旨是为人民服务。'
          },
          {
            id: 'q_politics_053',
            question: '我国政府工作的基本原则是（ ）',
            options: [
              { key: 'A', value: '对人民负责', explanation: '' },
              { key: 'B', value: '对上级负责', explanation: '' },
              { key: 'C', value: '对领导负责', explanation: '' },
              { key: 'D', value: '对自己负责', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '我国政府工作的基本原则是对人民负责。'
          },
          {
            id: 'q_politics_054',
            question: '政府的职能不包括（ ）',
            options: [
              { key: 'A', value: '保障人民民主和维护国家长治久安', explanation: '' },
              { key: 'B', value: '组织社会主义经济建设', explanation: '' },
              { key: 'C', value: '组织社会主义文化建设', explanation: '' },
              { key: 'D', value: '干预公民个人生活', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '政府不能干预公民个人生活，这是侵犯公民权利的行为。'
          },
          {
            id: 'q_politics_055',
            question: '政府依法行政的含义是（ ）',
            options: [
              { key: 'A', value: '政府及其工作人员的权力由法律授予，行使行政权力必须依据宪法和法律规定', explanation: '' },
              { key: 'B', value: '政府可以随意行使权力', explanation: '' },
              { key: 'C', value: '政府只对上级负责', explanation: '' },
              { key: 'D', value: '政府可以超越法律行使权力', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '政府依法行政是指政府及其工作人员的权力由法律授予，行使行政权力必须依据宪法和法律规定。'
          },
          {
            id: 'q_politics_056',
            question: '政府决策的方式不包括（ ）',
            options: [
              { key: 'A', value: '科学决策', explanation: '' },
              { key: 'B', value: '民主决策', explanation: '' },
              { key: 'C', value: '依法决策', explanation: '' },
              { key: 'D', value: '随意决策', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '随意决策会导致决策失误，不是政府决策的方式。'
          },
          {
            id: 'q_politics_057',
            question: '有效制约和监督权力的关键是（ ）',
            options: [
              { key: 'A', value: '健全权力运行的制约和监督体系', explanation: '' },
              { key: 'B', value: '加强上级监督', explanation: '' },
              { key: 'C', value: '加强群众监督', explanation: '' },
              { key: 'D', value: '加强媒体监督', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '有效制约和监督权力的关键是健全权力运行的制约和监督体系。'
          },
          {
            id: 'q_politics_058',
            question: '我国的行政监督体系不包括（ ）',
            options: [
              { key: 'A', value: '内部监督', explanation: '' },
              { key: 'B', value: '外部监督', explanation: '' },
              { key: 'C', value: '司法监督', explanation: '' },
              { key: 'D', value: '暴力监督', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '暴力监督是违法行为，不是行政监督体系的组成部分。'
          },
          {
            id: 'q_politics_059',
            question: '政府接受监督的意义不包括（ ）',
            options: [
              { key: 'A', value: '提高行政水平和工作效率', explanation: '' },
              { key: 'B', value: '防止权力滥用', explanation: '' },
              { key: 'C', value: '保证清正廉洁', explanation: '' },
              { key: 'D', value: '阻碍政府工作', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '监督是为了促进政府工作，不是阻碍政府工作。'
          },
          {
            id: 'q_politics_060',
            question: '政务公开的意义是（ ）',
            options: [
              { key: 'A', value: '便于公民监督', explanation: '' },
              { key: 'B', value: '提高政府工作透明度', explanation: '' },
              { key: 'C', value: '保障公民知情权', explanation: '' },
              { key: 'D', value: '以上都对', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '政务公开便于公民监督，提高政府工作透明度，保障公民知情权。'
          }
        ]
      },
      {
        levelNumber: 7,
        name: '第七单元 发展社会主义民主政治',
        description: '高一政治第七单元',
        difficulty: 3,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_politics_061',
            question: '我国的根本政治制度是（ ）',
            options: [
              { key: 'A', value: '人民代表大会制度', explanation: '' },
              { key: 'B', value: '中国共产党领导的多党合作和政治协商制度', explanation: '' },
              { key: 'C', value: '民族区域自治制度', explanation: '' },
              { key: 'D', value: '基层群众自治制度', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '我国的根本政治制度是人民代表大会制度。'
          },
          {
            id: 'q_politics_062',
            question: '人民代表大会的性质是（ ）',
            options: [
              { key: 'A', value: '国家权力机关', explanation: '' },
              { key: 'B', value: '国家行政机关', explanation: '' },
              { key: 'C', value: '国家司法机关', explanation: '' },
              { key: 'D', value: '国家监察机关', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '人民代表大会是国家权力机关。'
          },
          {
            id: 'q_politics_063',
            question: '全国人民代表大会的职权不包括（ ）',
            options: [
              { key: 'A', value: '立法权', explanation: '' },
              { key: 'B', value: '决定权', explanation: '' },
              { key: 'C', value: '任免权', explanation: '' },
              { key: 'D', value: '执行权', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '执行权是政府的职权，不是全国人大的职权。'
          },
          {
            id: 'q_politics_064',
            question: '人大代表的职责不包括（ ）',
            options: [
              { key: 'A', value: '代表人民行使国家权力', explanation: '' },
              { key: 'B', value: '为人民服务', explanation: '' },
              { key: 'C', value: '对人民负责', explanation: '' },
              { key: 'D', value: '为个人谋私利', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '人大代表应该为人民服务，不能为个人谋私利。'
          },
          {
            id: 'q_politics_065',
            question: '中国共产党的性质是（ ）',
            options: [
              { key: 'A', value: '中国工人阶级的先锋队', explanation: '' },
              { key: 'B', value: '中国人民的先锋队', explanation: '' },
              { key: 'C', value: '中华民族的先锋队', explanation: '' },
              { key: 'D', value: '以上都对', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '中国共产党是中国工人阶级的先锋队，同时是中国人民和中华民族的先锋队。'
          },
          {
            id: 'q_politics_066',
            question: '中国共产党的宗旨是（ ）',
            options: [
              { key: 'A', value: '全心全意为人民服务', explanation: '' },
              { key: 'B', value: '为党服务', explanation: '' },
              { key: 'C', value: '为领导服务', explanation: '' },
              { key: 'D', value: '为企业服务', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '中国共产党的宗旨是全心全意为人民服务。'
          },
          {
            id: 'q_politics_067',
            question: '中国共产党的执政方式不包括（ ）',
            options: [
              { key: 'A', value: '科学执政', explanation: '' },
              { key: 'B', value: '民主执政', explanation: '' },
              { key: 'C', value: '依法执政', explanation: '' },
              { key: 'D', value: '独裁执政', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '独裁执政不符合中国共产党的执政理念。'
          },
          {
            id: 'q_politics_068',
            question: '中国共产党领导的多党合作和政治协商制度的基本方针是（ ）',
            options: [
              { key: 'A', value: '长期共存、互相监督、肝胆相照、荣辱与共', explanation: '' },
              { key: 'B', value: '长期共存、互相斗争、互相排斥、互不往来', explanation: '' },
              { key: 'C', value: '一党专政、多党合作、轮流执政、共同发展', explanation: '' },
              { key: 'D', value: '多党竞争、互相制衡、轮流执政、共同发展', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '中国共产党领导的多党合作和政治协商制度的基本方针是长期共存、互相监督、肝胆相照、荣辱与共。'
          },
          {
            id: 'q_politics_069',
            question: '人民政协的职能不包括（ ）',
            options: [
              { key: 'A', value: '政治协商', explanation: '' },
              { key: 'B', value: '民主监督', explanation: '' },
              { key: 'C', value: '参政议政', explanation: '' },
              { key: 'D', value: '行政执行', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '行政执行是政府的职能，不是政协的职能。'
          },
          {
            id: 'q_politics_070',
            question: '我国处理民族关系的基本原则是（ ）',
            options: [
              { key: 'A', value: '民族平等、民族团结、各民族共同繁荣', explanation: '' },
              { key: 'B', value: '民族歧视、民族压迫、民族分裂', explanation: '' },
              { key: 'C', value: '民族独立、民族自治、民族分离', explanation: '' },
              { key: 'D', value: '民族融合、民族同化、民族统一', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '我国处理民族关系的基本原则是民族平等、民族团结、各民族共同繁荣。'
          }
        ]
      },
      {
        levelNumber: 8,
        name: '第八单元 当代国际社会',
        description: '高一政治第八单元',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_politics_071',
            question: '国际社会的主要成员是（ ）',
            options: [
              { key: 'A', value: '主权国家和国际组织', explanation: '' },
              { key: 'B', value: '主权国家和地区', explanation: '' },
              { key: 'C', value: '国际组织和地区', explanation: '' },
              { key: 'D', value: '国家和企业', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '国际社会的主要成员是主权国家和国际组织。'
          },
          {
            id: 'q_politics_072',
            question: '主权国家的基本要素是（ ）',
            options: [
              { key: 'A', value: '人口、领土、政权、主权', explanation: '' },
              { key: 'B', value: '人口、领土、政权、军队', explanation: '' },
              { key: 'C', value: '人口、领土、主权、经济', explanation: '' },
              { key: 'D', value: '人口、领土、政权、文化', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '主权国家的基本要素是人口、领土、政权、主权。'
          },
          {
            id: 'q_politics_073',
            question: '主权国家的权利不包括（ ）',
            options: [
              { key: 'A', value: '独立权', explanation: '' },
              { key: 'B', value: '平等权', explanation: '' },
              { key: 'C', value: '自卫权', explanation: '' },
              { key: 'D', value: '侵略权', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '侵略是违反国际法的行为，不是主权国家的权利。'
          },
          {
            id: 'q_politics_074',
            question: '联合国的宗旨是（ ）',
            options: [
              { key: 'A', value: '维护国际和平与安全，促进国际合作与发展', explanation: '' },
              { key: 'B', value: '维护大国利益，促进大国合作', explanation: '' },
              { key: 'C', value: '维护资本主义制度，促进资本主义发展', explanation: '' },
              { key: 'D', value: '维护社会主义制度，促进社会主义发展', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '联合国的宗旨是维护国际和平与安全，促进国际合作与发展。'
          },
          {
            id: 'q_politics_075',
            question: '联合国安理会的常任理事国不包括（ ）',
            options: [
              { key: 'A', value: '中国', explanation: '' },
              { key: 'B', value: '美国', explanation: '' },
              { key: 'C', value: '英国', explanation: '' },
              { key: 'D', value: '德国', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '联合国安理会的常任理事国是中国、美国、英国、法国、俄罗斯，不包括德国。'
          },
          {
            id: 'q_politics_076',
            question: '国际关系的决定性因素是（ ）',
            options: [
              { key: 'A', value: '国家利益', explanation: '' },
              { key: 'B', value: '国家实力', explanation: '' },
              { key: 'C', value: '国家制度', explanation: '' },
              { key: 'D', value: '国家地理位置', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '国际关系的决定性因素是国家利益。'
          },
          {
            id: 'q_politics_077',
            question: '当今时代的主题是（ ）',
            options: [
              { key: 'A', value: '和平与发展', explanation: '' },
              { key: 'B', value: '战争与冲突', explanation: '' },
              { key: 'C', value: '霸权与强权', explanation: '' },
              { key: 'D', value: '分裂与对抗', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '当今时代的主题是和平与发展。'
          },
          {
            id: 'q_politics_078',
            question: '世界多极化的趋势是（ ）',
            options: [
              { key: 'A', value: '不可逆转的', explanation: '' },
              { key: 'B', value: '可以逆转的', explanation: '' },
              { key: 'C', value: '已经完成的', explanation: '' },
              { key: 'D', value: '不可能实现的', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '世界多极化的趋势是不可逆转的。'
          },
          {
            id: 'q_politics_079',
            question: '我国的外交政策是（ ）',
            options: [
              { key: 'A', value: '独立自主的和平外交政策', explanation: '' },
              { key: 'B', value: '霸权主义外交政策', explanation: '' },
              { key: 'C', value: '单边主义外交政策', explanation: '' },
              { key: 'D', value: '孤立主义外交政策', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '我国实行独立自主的和平外交政策。'
          },
          {
            id: 'q_politics_080',
            question: '我国外交政策的基本目标是（ ）',
            options: [
              { key: 'A', value: '维护我国的主权、安全和发展利益，促进世界的和平与发展', explanation: '' },
              { key: 'B', value: '维护我国的利益，损害他国利益', explanation: '' },
              { key: 'C', value: '促进世界和平，牺牲我国利益', explanation: '' },
              { key: 'D', value: '维护世界霸权，促进我国发展', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '我国外交政策的基本目标是维护我国的主权、安全和发展利益，促进世界的和平与发展。'
          }
        ]
      },
      {
        levelNumber: 9,
        name: '第九单元 文化与生活',
        description: '高一政治第九单元',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_politics_081',
            question: '文化的内涵是（ ）',
            options: [
              { key: 'A', value: '相对于经济、政治而言的人类全部精神活动及其产品', explanation: '' },
              { key: 'B', value: '人类创造的物质财富', explanation: '' },
              { key: 'C', value: '人类创造的精神财富', explanation: '' },
              { key: 'D', value: '人类创造的所有财富', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '文化是相对于经济、政治而言的人类全部精神活动及其产品。'
          },
          {
            id: 'q_politics_082',
            question: '文化的特点不包括（ ）',
            options: [
              { key: 'A', value: '文化是人类社会特有的现象', explanation: '' },
              { key: 'B', value: '文化是人们社会实践的产物', explanation: '' },
              { key: 'C', value: '文化是与生俱来的', explanation: '' },
              { key: 'D', value: '文化素养是通过后天培养的', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '文化不是与生俱来的，而是通过后天培养的。'
          },
          {
            id: 'q_politics_083',
            question: '文化与经济的关系是（ ）',
            options: [
              { key: 'A', value: '经济是基础，文化是经济的反映', explanation: '' },
              { key: 'B', value: '文化是基础，经济是文化的反映', explanation: '' },
              { key: 'C', value: '经济和文化没有关系', explanation: '' },
              { key: 'D', value: '经济和文化相互决定', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '经济是基础，文化是经济的反映，文化对经济有反作用。'
          },
          {
            id: 'q_politics_084',
            question: '文化与政治的关系是（ ）',
            options: [
              { key: 'A', value: '政治决定文化，文化反作用于政治', explanation: '' },
              { key: 'B', value: '文化决定政治，政治反作用于文化', explanation: '' },
              { key: 'C', value: '政治和文化没有关系', explanation: '' },
              { key: 'D', value: '政治和文化相互决定', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '政治决定文化，文化反作用于政治。'
          },
          {
            id: 'q_politics_085',
            question: '文化对人的影响的特点是（ ）',
            options: [
              { key: 'A', value: '潜移默化和深远持久', explanation: '' },
              { key: 'B', value: '立竿见影和短暂即逝', explanation: '' },
              { key: 'C', value: '没有影响', explanation: '' },
              { key: 'D', value: '不确定', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '文化对人的影响具有潜移默化和深远持久的特点。'
          },
          {
            id: 'q_politics_086',
            question: '文化塑造人生的表现不包括（ ）',
            options: [
              { key: 'A', value: '丰富人的精神世界', explanation: '' },
              { key: 'B', value: '增强人的精神力量', explanation: '' },
              { key: 'C', value: '促进人的全面发展', explanation: '' },
              { key: 'D', value: '损害人的身心健康', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '优秀文化塑造人生，不会损害人的身心健康。'
          },
          {
            id: 'q_politics_087',
            question: '文化多样性的含义是（ ）',
            options: [
              { key: 'A', value: '不同民族和国家文化的内容和形式各具特色', explanation: '' },
              { key: 'B', value: '所有文化都一样', explanation: '' },
              { key: 'C', value: '只有一种文化', explanation: '' },
              { key: 'D', value: '文化没有差异', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '文化多样性是指不同民族和国家文化的内容和形式各具特色。'
          },
          {
            id: 'q_politics_088',
            question: '尊重文化多样性的意义不包括（ ）',
            options: [
              { key: 'A', value: '发展本民族文化的内在要求', explanation: '' },
              { key: 'B', value: '实现世界文化繁荣的必然要求', explanation: '' },
              { key: 'C', value: '促进文化交流与合作', explanation: '' },
              { key: 'D', value: '消除文化差异', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '尊重文化多样性不是消除文化差异，而是尊重差异。'
          },
          {
            id: 'q_politics_089',
            question: '文化传播的途径不包括（ ）',
            options: [
              { key: 'A', value: '商业贸易', explanation: '' },
              { key: 'B', value: '人口迁徙', explanation: '' },
              { key: 'C', value: '教育', explanation: '' },
              { key: 'D', value: '文化隔离', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '文化隔离会阻碍文化传播，不是传播途径。'
          },
          {
            id: 'q_politics_090',
            question: '文化继承与发展的关系是（ ）',
            options: [
              { key: 'A', value: '继承是发展的必要前提，发展是继承的必然要求', explanation: '' },
              { key: 'B', value: '继承和发展没有关系', explanation: '' },
              { key: 'C', value: '发展是继承的必要前提，继承是发展的必然要求', explanation: '' },
              { key: 'D', value: '只继承不发展', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '继承是发展的必要前提，发展是继承的必然要求，二者是同一过程的两个方面。'
          }
        ]
      },
      {
        levelNumber: 10,
        name: '第十单元 文化创新',
        description: '高一政治第十单元',
        difficulty: 5,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_politics_091',
            question: '文化创新的源泉是（ ）',
            options: [
              { key: 'A', value: '社会实践', explanation: '' },
              { key: 'B', value: '传统文化', explanation: '' },
              { key: 'C', value: '外来文化', explanation: '' },
              { key: 'D', value: '书本知识', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '社会实践是文化创新的源泉。'
          },
          {
            id: 'q_politics_092',
            question: '文化创新的动力是（ ）',
            options: [
              { key: 'A', value: '社会实践', explanation: '' },
              { key: 'B', value: '个人兴趣', explanation: '' },
              { key: 'C', value: '政府指令', explanation: '' },
              { key: 'D', value: '市场需求', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '社会实践是文化创新的动力。'
          },
          {
            id: 'q_politics_093',
            question: '文化创新的作用不包括（ ）',
            options: [
              { key: 'A', value: '推动社会实践的发展', explanation: '' },
              { key: 'B', value: '促进民族文化的繁荣', explanation: '' },
              { key: 'C', value: '增强文化竞争力', explanation: '' },
              { key: 'D', value: '阻碍文化发展', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '文化创新促进文化发展，不是阻碍文化发展。'
          },
          {
            id: 'q_politics_094',
            question: '文化创新的途径不包括（ ）',
            options: [
              { key: 'A', value: '继承传统，推陈出新', explanation: '' },
              { key: 'B', value: '面向世界，博采众长', explanation: '' },
              { key: 'C', value: '立足社会实践', explanation: '' },
              { key: 'D', value: '闭门造车', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '闭门造车无法进行文化创新。'
          },
          {
            id: 'q_politics_095',
            question: '对待传统文化的正确态度是（ ）',
            options: [
              { key: 'A', value: '取其精华，去其糟粕，批判继承，古为今用', explanation: '' },
              { key: 'B', value: '全盘继承', explanation: '' },
              { key: 'C', value: '全盘抛弃', explanation: '' },
              { key: 'D', value: '视而不见', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '对待传统文化应该取其精华，去其糟粕，批判继承，古为今用。'
          },
          {
            id: 'q_politics_096',
            question: '对待外来文化的正确态度是（ ）',
            options: [
              { key: 'A', value: '面向世界，博采众长，以我为主，为我所用', explanation: '' },
              { key: 'B', value: '全盘吸收', explanation: '' },
              { key: 'C', value: '全盘拒绝', explanation: '' },
              { key: 'D', value: '盲目崇拜', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '对待外来文化应该面向世界，博采众长，以我为主，为我所用。'
          },
          {
            id: 'q_politics_097',
            question: '文化创新的主体是（ ）',
            options: [
              { key: 'A', value: '人民群众', explanation: '' },
              { key: 'B', value: '文化工作者', explanation: '' },
              { key: 'C', value: '政府官员', explanation: '' },
              { key: 'D', value: '艺术家', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '人民群众是文化创新的主体。'
          },
          {
            id: 'q_politics_098',
            question: '中华文化的特点是（ ）',
            options: [
              { key: 'A', value: '源远流长、博大精深', explanation: '' },
              { key: 'B', value: '短暂肤浅', explanation: '' },
              { key: 'C', value: '单一单调', explanation: '' },
              { key: 'D', value: '封闭保守', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '中华文化具有源远流长、博大精深的特点。'
          },
          {
            id: 'q_politics_099',
            question: '中华民族精神的核心是（ ）',
            options: [
              { key: 'A', value: '爱国主义', explanation: '' },
              { key: 'B', value: '团结统一', explanation: '' },
              { key: 'C', value: '爱好和平', explanation: '' },
              { key: 'D', value: '勤劳勇敢', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '中华民族精神的核心是爱国主义。'
          },
          {
            id: 'q_politics_100',
            question: '弘扬和培育民族精神的意义不包括（ ）',
            options: [
              { key: 'A', value: '提高全民族综合素质', explanation: '' },
              { key: 'B', value: '增强我国国际竞争力', explanation: '' },
              { key: 'C', value: '坚持社会主义道路', explanation: '' },
              { key: 'D', value: '削弱民族凝聚力', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '弘扬和培育民族精神会增强民族凝聚力，不是削弱。'
          }
        ]
      }
    ];
  }

  getLevelQuestions(levelNumber) {
    const level = this.getLevel(levelNumber);
    return level ? level.questions : [];
  }
}
