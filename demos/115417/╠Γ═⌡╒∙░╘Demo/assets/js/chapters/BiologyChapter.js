class BiologyChapter extends Chapter {
  constructor() {
    super('biology', '生物', 'fa-dna', '#2ecc71');
    this.initLevels();
  }

  initLevels() {
    this.levels = [
      {
        levelNumber: 1,
        name: '第一章 走近细胞',
        description: '高一生物第一单元',
        difficulty: 1,
        timeLimit: 180,
        unlocked: true,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_biology_001',
            question: '细胞是生物体（ ）的基本单位',
            options: [
              { key: 'A', value: '结构和功能', explanation: '' },
              { key: 'B', value: '遗传', explanation: '' },
              { key: 'C', value: '代谢', explanation: '' },
              { key: 'D', value: '繁殖', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '细胞是生物体结构和功能的基本单位。'
          },
          {
            id: 'q_biology_002',
            question: '生命系统的结构层次从大到小排列正确的是（ ）',
            options: [
              { key: 'A', value: '生物圈→生态系统→群落→种群→个体', explanation: '' },
              { key: 'B', value: '个体→种群→群落→生态系统→生物圈', explanation: '' },
              { key: 'C', value: '生物圈→种群→群落→生态系统→个体', explanation: '' },
              { key: 'D', value: '个体→群落→种群→生态系统→生物圈', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '生命系统的结构层次从大到小为：生物圈→生态系统→群落→种群→个体→器官→组织→细胞。'
          },
          {
            id: 'q_biology_003',
            question: '原核细胞和真核细胞的主要区别是（ ）',
            options: [
              { key: 'A', value: '有无核膜包被的细胞核', explanation: '' },
              { key: 'B', value: '有无细胞膜', explanation: '' },
              { key: 'C', value: '有无细胞质', explanation: '' },
              { key: 'D', value: '有无核糖体', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '原核细胞和真核细胞的主要区别是有无核膜包被的细胞核。'
          },
          {
            id: 'q_biology_004',
            question: '下列生物属于原核生物的是（ ）',
            options: [
              { key: 'A', value: '细菌', explanation: '' },
              { key: 'B', value: '真菌', explanation: '' },
              { key: 'C', value: '植物', explanation: '' },
              { key: 'D', value: '动物', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '细菌属于原核生物。'
          },
          {
            id: 'q_biology_005',
            question: '下列生物属于真核生物的是（ ）',
            options: [
              { key: 'A', value: '大肠杆菌', explanation: '' },
              { key: 'B', value: '蓝藻', explanation: '' },
              { key: 'C', value: '酵母菌', explanation: '' },
              { key: 'D', value: '支原体', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '酵母菌属于真核生物。'
          },
          {
            id: 'q_biology_006',
            question: '显微镜的放大倍数是（ ）',
            options: [
              { key: 'A', value: '目镜放大倍数×物镜放大倍数', explanation: '' },
              { key: 'B', value: '目镜放大倍数+物镜放大倍数', explanation: '' },
              { key: 'C', value: '目镜放大倍数÷物镜放大倍数', explanation: '' },
              { key: 'D', value: '目镜放大倍数', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '显微镜的放大倍数是目镜放大倍数乘以物镜放大倍数。'
          },
          {
            id: 'q_biology_007',
            question: '使用显微镜观察时，应先使用（ ）',
            options: [
              { key: 'A', value: '低倍镜', explanation: '' },
              { key: 'B', value: '高倍镜', explanation: '' },
              { key: 'C', value: '油镜', explanation: '' },
              { key: 'D', value: '任意倍数', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '使用显微镜观察时，应先使用低倍镜找到目标，再换高倍镜观察。'
          },
          {
            id: 'q_biology_008',
            question: '细胞学说的建立者不包括（ ）',
            options: [
              { key: 'A', value: '施莱登', explanation: '' },
              { key: 'B', value: '施旺', explanation: '' },
              { key: 'C', value: '魏尔肖', explanation: '' },
              { key: 'D', value: '达尔文', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '细胞学说的建立者是施莱登和施旺，魏尔肖对其进行了补充。达尔文是进化论的建立者。'
          },
          {
            id: 'q_biology_009',
            question: '细胞学说的内容不包括（ ）',
            options: [
              { key: 'A', value: '一切动植物都由细胞发育而来', explanation: '' },
              { key: 'B', value: '细胞是一个相对独立的单位', explanation: '' },
              { key: 'C', value: '新细胞可以从老细胞中产生', explanation: '' },
              { key: 'D', value: '细胞是遗传物质的载体', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '细胞学说不包括细胞是遗传物质的载体这一内容。'
          },
          {
            id: 'q_biology_010',
            question: '病毒的特点不包括（ ）',
            options: [
              { key: 'A', value: '没有细胞结构', explanation: '' },
              { key: 'B', value: '只能寄生在活细胞内', explanation: '' },
              { key: 'C', value: '能独立进行生命活动', explanation: '' },
              { key: 'D', value: '由蛋白质和核酸组成', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '病毒没有细胞结构，不能独立进行生命活动，只能寄生在活细胞内。'
          }
        ]
      },
      {
        levelNumber: 2,
        name: '第二章 组成细胞的分子',
        description: '高一生物第二单元',
        difficulty: 1,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_biology_011',
            question: '组成细胞的元素中，含量最多的是（ ）',
            options: [
              { key: 'A', value: 'C', explanation: '' },
              { key: 'B', value: 'H', explanation: '' },
              { key: 'C', value: 'O', explanation: '' },
              { key: 'D', value: 'N', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '组成细胞的元素中，含量最多的是氧元素。'
          },
          {
            id: 'q_biology_012',
            question: '构成细胞的最基本元素是（ ）',
            options: [
              { key: 'A', value: 'C', explanation: '' },
              { key: 'B', value: 'H', explanation: '' },
              { key: 'C', value: 'O', explanation: '' },
              { key: 'D', value: 'N', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '碳是构成细胞的最基本元素。'
          },
          {
            id: 'q_biology_013',
            question: '蛋白质的基本组成单位是（ ）',
            options: [
              { key: 'A', value: '氨基酸', explanation: '' },
              { key: 'B', value: '核苷酸', explanation: '' },
              { key: 'C', value: '葡萄糖', explanation: '' },
              { key: 'D', value: '脂肪酸', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '蛋白质的基本组成单位是氨基酸。'
          },
          {
            id: 'q_biology_014',
            question: '氨基酸的结构通式中，R基的作用是（ ）',
            options: [
              { key: 'A', value: '决定氨基酸的种类', explanation: '' },
              { key: 'B', value: '连接氨基酸', explanation: '' },
              { key: 'C', value: '提供能量', explanation: '' },
              { key: 'D', value: '储存遗传信息', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '不同的氨基酸R基不同，R基决定氨基酸的种类。'
          },
          {
            id: 'q_biology_015',
            question: '蛋白质的结构层次不包括（ ）',
            options: [
              { key: 'A', value: '一级结构', explanation: '' },
              { key: 'B', value: '二级结构', explanation: '' },
              { key: 'C', value: '三级结构', explanation: '' },
              { key: 'D', value: '五级结构', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '蛋白质的结构层次包括一级、二级、三级和四级结构，没有五级结构。'
          },
          {
            id: 'q_biology_016',
            question: '核酸的基本组成单位是（ ）',
            options: [
              { key: 'A', value: '氨基酸', explanation: '' },
              { key: 'B', value: '核苷酸', explanation: '' },
              { key: 'C', value: '葡萄糖', explanation: '' },
              { key: 'D', value: '脂肪酸', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '核酸的基本组成单位是核苷酸。'
          },
          {
            id: 'q_biology_017',
            question: 'DNA和RNA的区别不包括（ ）',
            options: [
              { key: 'A', value: '五碳糖不同', explanation: '' },
              { key: 'B', value: '碱基不同', explanation: '' },
              { key: 'C', value: '结构不同', explanation: '' },
              { key: 'D', value: '元素组成不同', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: 'DNA和RNA的元素组成相同，都是C、H、O、N、P。'
          },
          {
            id: 'q_biology_018',
            question: '糖类的分类不包括（ ）',
            options: [
              { key: 'A', value: '单糖', explanation: '' },
              { key: 'B', value: '二糖', explanation: '' },
              { key: 'C', value: '多糖', explanation: '' },
              { key: 'D', value: '四糖', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '糖类分为单糖、二糖和多糖，没有四糖这一分类。'
          },
          {
            id: 'q_biology_019',
            question: '细胞中主要的能源物质是（ ）',
            options: [
              { key: 'A', value: '糖类', explanation: '' },
              { key: 'B', value: '脂肪', explanation: '' },
              { key: 'C', value: '蛋白质', explanation: '' },
              { key: 'D', value: '核酸', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '糖类是细胞中主要的能源物质。'
          },
          {
            id: 'q_biology_020',
            question: '细胞中良好的储能物质是（ ）',
            options: [
              { key: 'A', value: '糖类', explanation: '' },
              { key: 'B', value: '脂肪', explanation: '' },
              { key: 'C', value: '蛋白质', explanation: '' },
              { key: 'D', value: '核酸', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '脂肪是细胞中良好的储能物质。'
          }
        ]
      },
      {
        levelNumber: 3,
        name: '第三章 细胞的基本结构',
        description: '高一生物第三单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_biology_021',
            question: '细胞膜的主要成分是（ ）',
            options: [
              { key: 'A', value: '脂质和蛋白质', explanation: '' },
              { key: 'B', value: '糖类和蛋白质', explanation: '' },
              { key: 'C', value: '脂质和糖类', explanation: '' },
              { key: 'D', value: '核酸和蛋白质', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '细胞膜的主要成分是脂质和蛋白质。'
          },
          {
            id: 'q_biology_022',
            question: '细胞膜的结构模型是（ ）',
            options: [
              { key: 'A', value: '流动镶嵌模型', explanation: '' },
              { key: 'B', value: '三明治模型', explanation: '' },
              { key: 'C', value: '单位膜模型', explanation: '' },
              { key: 'D', value: '脂质双分子层模型', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '细胞膜的结构模型是流动镶嵌模型。'
          },
          {
            id: 'q_biology_023',
            question: '细胞膜的功能不包括（ ）',
            options: [
              { key: 'A', value: '将细胞与外界环境分隔开', explanation: '' },
              { key: 'B', value: '控制物质进出细胞', explanation: '' },
              { key: 'C', value: '进行细胞间的信息交流', explanation: '' },
              { key: 'D', value: '合成蛋白质', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '合成蛋白质是核糖体的功能，不是细胞膜的功能。'
          },
          {
            id: 'q_biology_024',
            question: '细胞质基质的功能是（ ）',
            options: [
              { key: 'A', value: '新陈代谢的主要场所', explanation: '' },
              { key: 'B', value: '储存遗传信息', explanation: '' },
              { key: 'C', value: '光合作用', explanation: '' },
              { key: 'D', value: '有氧呼吸', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '细胞质基质是新陈代谢的主要场所。'
          },
          {
            id: 'q_biology_025',
            question: '线粒体的功能是（ ）',
            options: [
              { key: 'A', value: '有氧呼吸的主要场所', explanation: '' },
              { key: 'B', value: '光合作用', explanation: '' },
              { key: 'C', value: '蛋白质合成', explanation: '' },
              { key: 'D', value: '储存遗传信息', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '线粒体是有氧呼吸的主要场所。'
          },
          {
            id: 'q_biology_026',
            question: '叶绿体的功能是（ ）',
            options: [
              { key: 'A', value: '有氧呼吸的主要场所', explanation: '' },
              { key: 'B', value: '光合作用', explanation: '' },
              { key: 'C', value: '蛋白质合成', explanation: '' },
              { key: 'D', value: '储存遗传信息', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '叶绿体是光合作用的场所。'
          },
          {
            id: 'q_biology_027',
            question: '核糖体的功能是（ ）',
            options: [
              { key: 'A', value: '蛋白质合成', explanation: '' },
              { key: 'B', value: '光合作用', explanation: '' },
              { key: 'C', value: '有氧呼吸', explanation: '' },
              { key: 'D', value: '储存遗传信息', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '核糖体是蛋白质合成的场所。'
          },
          {
            id: 'q_biology_028',
            question: '内质网的功能不包括（ ）',
            options: [
              { key: 'A', value: '蛋白质的合成和加工', explanation: '' },
              { key: 'B', value: '脂质的合成', explanation: '' },
              { key: 'C', value: '蛋白质的分类和包装', explanation: '' },
              { key: 'D', value: '糖类的合成', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '蛋白质的分类和包装是高尔基体的功能。'
          },
          {
            id: 'q_biology_029',
            question: '高尔基体的功能是（ ）',
            options: [
              { key: 'A', value: '蛋白质的合成', explanation: '' },
              { key: 'B', value: '蛋白质的分类、包装和运输', explanation: '' },
              { key: 'C', value: '光合作用', explanation: '' },
              { key: 'D', value: '有氧呼吸', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '高尔基体的功能是对蛋白质进行分类、包装和运输。'
          },
          {
            id: 'q_biology_030',
            question: '细胞核的功能是（ ）',
            options: [
              { key: 'A', value: '遗传信息库，控制细胞的代谢和遗传', explanation: '' },
              { key: 'B', value: '蛋白质合成', explanation: '' },
              { key: 'C', value: '光合作用', explanation: '' },
              { key: 'D', value: '有氧呼吸', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '细胞核是遗传信息库，控制细胞的代谢和遗传。'
          }
        ]
      },
      {
        levelNumber: 4,
        name: '第四章 细胞的物质输入和输出',
        description: '高一生物第四单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_biology_031',
            question: '渗透作用的发生条件不包括（ ）',
            options: [
              { key: 'A', value: '半透膜', explanation: '' },
              { key: 'B', value: '浓度差', explanation: '' },
              { key: 'C', value: '能量', explanation: '' },
              { key: 'D', value: '水', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '渗透作用不需要能量。'
          },
          {
            id: 'q_biology_032',
            question: '当外界溶液浓度大于细胞液浓度时，植物细胞会（ ）',
            options: [
              { key: 'A', value: '失水', explanation: '' },
              { key: 'B', value: '吸水', explanation: '' },
              { key: 'C', value: '保持不变', explanation: '' },
              { key: 'D', value: '先吸水后失水', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '当外界溶液浓度大于细胞液浓度时，植物细胞会失水。'
          },
          {
            id: 'q_biology_033',
            question: '自由扩散的特点不包括（ ）',
            options: [
              { key: 'A', value: '不需要载体', explanation: '' },
              { key: 'B', value: '不需要能量', explanation: '' },
              { key: 'C', value: '从高浓度到低浓度', explanation: '' },
              { key: 'D', value: '从低浓度到高浓度', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '自由扩散是从高浓度到低浓度运输。'
          },
          {
            id: 'q_biology_034',
            question: '协助扩散的特点是（ ）',
            options: [
              { key: 'A', value: '需要载体，不需要能量', explanation: '' },
              { key: 'B', value: '不需要载体，需要能量', explanation: '' },
              { key: 'C', value: '需要载体和能量', explanation: '' },
              { key: 'D', value: '不需要载体和能量', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '协助扩散需要载体，但不需要能量。'
          },
          {
            id: 'q_biology_035',
            question: '主动运输的特点是（ ）',
            options: [
              { key: 'A', value: '需要载体，不需要能量', explanation: '' },
              { key: 'B', value: '不需要载体，需要能量', explanation: '' },
              { key: 'C', value: '需要载体和能量', explanation: '' },
              { key: 'D', value: '不需要载体和能量', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '主动运输需要载体和能量。'
          },
          {
            id: 'q_biology_036',
            question: '胞吞和胞吐的特点是（ ）',
            options: [
              { key: 'A', value: '需要能量，不需要载体', explanation: '' },
              { key: 'B', value: '不需要能量，需要载体', explanation: '' },
              { key: 'C', value: '需要能量和载体', explanation: '' },
              { key: 'D', value: '不需要能量和载体', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '胞吞和胞吐需要能量，但不需要载体。'
          },
          {
            id: 'q_biology_037',
            question: '下列物质通过自由扩散进入细胞的是（ ）',
            options: [
              { key: 'A', value: 'O₂', explanation: '' },
              { key: 'B', value: '葡萄糖', explanation: '' },
              { key: 'C', value: '氨基酸', explanation: '' },
              { key: 'D', value: 'K⁺', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '氧气通过自由扩散进入细胞。'
          },
          {
            id: 'q_biology_038',
            question: '下列物质通过主动运输进入细胞的是（ ）',
            options: [
              { key: 'A', value: 'O₂', explanation: '' },
              { key: 'B', value: 'CO₂', explanation: '' },
              { key: 'C', value: '葡萄糖', explanation: '' },
              { key: 'D', value: 'K⁺', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '钾离子通过主动运输进入细胞。'
          },
          {
            id: 'q_biology_039',
            question: '质壁分离发生的条件不包括（ ）',
            options: [
              { key: 'A', value: '活的植物细胞', explanation: '' },
              { key: 'B', value: '有大液泡', explanation: '' },
              { key: 'C', value: '外界溶液浓度大于细胞液浓度', explanation: '' },
              { key: 'D', value: '有叶绿体', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '有叶绿体不是质壁分离发生的条件。'
          },
          {
            id: 'q_biology_040',
            question: '质壁分离复原发生的条件是（ ）',
            options: [
              { key: 'A', value: '外界溶液浓度小于细胞液浓度', explanation: '' },
              { key: 'B', value: '外界溶液浓度大于细胞液浓度', explanation: '' },
              { key: 'C', value: '外界溶液浓度等于细胞液浓度', explanation: '' },
              { key: 'D', value: '与浓度无关', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '当外界溶液浓度小于细胞液浓度时，植物细胞吸水，发生质壁分离复原。'
          }
        ]
      },
      {
        levelNumber: 5,
        name: '第五章 细胞的能量供应和利用',
        description: '高一生物第五单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_biology_041',
            question: '酶的本质是（ ）',
            options: [
              { key: 'A', value: '蛋白质或RNA', explanation: '' },
              { key: 'B', value: '糖类', explanation: '' },
              { key: 'C', value: '脂肪', explanation: '' },
              { key: 'D', value: '核酸', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '酶的本质是蛋白质或RNA。'
          },
          {
            id: 'q_biology_042',
            question: '酶的特性不包括（ ）',
            options: [
              { key: 'A', value: '高效性', explanation: '' },
              { key: 'B', value: '专一性', explanation: '' },
              { key: 'C', value: '作用条件温和', explanation: '' },
              { key: 'D', value: '永久性', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '酶不是永久性的，会失活。'
          },
          {
            id: 'q_biology_043',
            question: 'ATP的结构简式是（ ）',
            options: [
              { key: 'A', value: 'A-P~P~P', explanation: '' },
              { key: 'B', value: 'A-P-P-P', explanation: '' },
              { key: 'C', value: 'A~P~P~P', explanation: '' },
              { key: 'D', value: 'A-P-P~P', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'ATP的结构简式是A-P~P~P，其中~表示高能磷酸键。'
          },
          {
            id: 'q_biology_044',
            question: 'ATP的功能是（ ）',
            options: [
              { key: 'A', value: '细胞的能量通货', explanation: '' },
              { key: 'B', value: '储存遗传信息', explanation: '' },
              { key: 'C', value: '催化化学反应', explanation: '' },
              { key: 'D', value: '构成细胞膜', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'ATP是细胞的能量通货。'
          },
          {
            id: 'q_biology_045',
            question: '光合作用的场所是（ ）',
            options: [
              { key: 'A', value: '叶绿体', explanation: '' },
              { key: 'B', value: '线粒体', explanation: '' },
              { key: 'C', value: '细胞质基质', explanation: '' },
              { key: 'D', value: '细胞核', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '光合作用的场所是叶绿体。'
          },
          {
            id: 'q_biology_046',
            question: '光合作用的光反应阶段发生在（ ）',
            options: [
              { key: 'A', value: '类囊体薄膜', explanation: '' },
              { key: 'B', value: '叶绿体基质', explanation: '' },
              { key: 'C', value: '线粒体基质', explanation: '' },
              { key: 'D', value: '细胞质基质', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '光合作用的光反应阶段发生在类囊体薄膜上。'
          },
          {
            id: 'q_biology_047',
            question: '光合作用的暗反应阶段发生在（ ）',
            options: [
              { key: 'A', value: '类囊体薄膜', explanation: '' },
              { key: 'B', value: '叶绿体基质', explanation: '' },
              { key: 'C', value: '线粒体基质', explanation: '' },
              { key: 'D', value: '细胞质基质', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '光合作用的暗反应阶段发生在叶绿体基质中。'
          },
          {
            id: 'q_biology_048',
            question: '光合作用的总反应式是（ ）',
            options: [
              { key: 'A', value: 'CO₂ + H₂O → (CH₂O) + O₂', explanation: '' },
              { key: 'B', value: '(CH₂O) + O₂ → CO₂ + H₂O', explanation: '' },
              { key: 'C', value: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O', explanation: '' },
              { key: 'D', value: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '光合作用的总反应式是6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂。'
          },
          {
            id: 'q_biology_049',
            question: '有氧呼吸的场所不包括（ ）',
            options: [
              { key: 'A', value: '细胞质基质', explanation: '' },
              { key: 'B', value: '线粒体基质', explanation: '' },
              { key: 'C', value: '线粒体内膜', explanation: '' },
              { key: 'D', value: '叶绿体', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '叶绿体是光合作用的场所，不是有氧呼吸的场所。'
          },
          {
            id: 'q_biology_050',
            question: '有氧呼吸的总反应式是（ ）',
            options: [
              { key: 'A', value: 'CO₂ + H₂O → (CH₂O) + O₂', explanation: '' },
              { key: 'B', value: '(CH₂O) + O₂ → CO₂ + H₂O', explanation: '' },
              { key: 'C', value: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 能量', explanation: '' },
              { key: 'D', value: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '有氧呼吸的总反应式是C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 能量。'
          }
        ]
      },
      {
        levelNumber: 6,
        name: '第六章 细胞的生命历程',
        description: '高一生物第六单元',
        difficulty: 3,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_biology_051',
            question: '细胞周期的定义是（ ）',
            options: [
              { key: 'A', value: '连续分裂的细胞从一次分裂完成开始到下一次分裂完成为止', explanation: '' },
              { key: 'B', value: '细胞从出生到死亡的过程', explanation: '' },
              { key: 'C', value: '细胞分裂的过程', explanation: '' },
              { key: 'D', value: '细胞生长的过程', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '细胞周期是指连续分裂的细胞从一次分裂完成开始到下一次分裂完成为止。'
          },
          {
            id: 'q_biology_052',
            question: '细胞周期包括（ ）',
            options: [
              { key: 'A', value: '间期和分裂期', explanation: '' },
              { key: 'B', value: '前期和后期', explanation: '' },
              { key: 'C', value: '间期和前期', explanation: '' },
              { key: 'D', value: '分裂期和末期', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '细胞周期包括间期和分裂期。'
          },
          {
            id: 'q_biology_053',
            question: '间期的特点是（ ）',
            options: [
              { key: 'A', value: 'DNA复制和有关蛋白质合成', explanation: '' },
              { key: 'B', value: '染色体排列在赤道板上', explanation: '' },
              { key: 'C', value: '染色体分离', explanation: '' },
              { key: 'D', value: '细胞质分裂', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '间期的特点是DNA复制和有关蛋白质合成。'
          },
          {
            id: 'q_biology_054',
            question: '有丝分裂的过程不包括（ ）',
            options: [
              { key: 'A', value: '间期', explanation: '' },
              { key: 'B', value: '前期', explanation: '' },
              { key: 'C', value: '中期', explanation: '' },
              { key: 'D', value: '联会', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '联会是减数分裂的过程，不是有丝分裂的过程。'
          },
          {
            id: 'q_biology_055',
            question: '有丝分裂后期的特点是（ ）',
            options: [
              { key: 'A', value: '着丝点分裂，姐妹染色单体分离', explanation: '' },
              { key: 'B', value: '染色体排列在赤道板上', explanation: '' },
              { key: 'C', value: '染色体复制', explanation: '' },
              { key: 'D', value: '细胞质分裂', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '有丝分裂后期的特点是着丝点分裂，姐妹染色单体分离。'
          },
          {
            id: 'q_biology_056',
            question: '有丝分裂的意义是（ ）',
            options: [
              { key: 'A', value: '保持细胞遗传物质的稳定性', explanation: '' },
              { key: 'B', value: '产生生殖细胞', explanation: '' },
              { key: 'C', value: '增加细胞多样性', explanation: '' },
              { key: 'D', value: '减少染色体数目', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '有丝分裂的意义是保持细胞遗传物质的稳定性。'
          },
          {
            id: 'q_biology_057',
            question: '细胞分化的定义是（ ）',
            options: [
              { key: 'A', value: '在个体发育中，由一个或一种细胞增殖产生的后代，在形态、结构和生理功能上发生稳定性差异的过程', explanation: '' },
              { key: 'B', value: '细胞数目增多的过程', explanation: '' },
              { key: 'C', value: '细胞体积增大的过程', explanation: '' },
              { key: 'D', value: '细胞死亡的过程', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '细胞分化是指在个体发育中，由一个或一种细胞增殖产生的后代，在形态、结构和生理功能上发生稳定性差异的过程。'
          },
          {
            id: 'q_biology_058',
            question: '细胞分化的特点不包括（ ）',
            options: [
              { key: 'A', value: '持久性', explanation: '' },
              { key: 'B', value: '稳定性', explanation: '' },
              { key: 'C', value: '可逆性', explanation: '' },
              { key: 'D', value: '普遍性', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '细胞分化是不可逆的。'
          },
          {
            id: 'q_biology_059',
            question: '细胞衰老的特征不包括（ ）',
            options: [
              { key: 'A', value: '细胞体积增大', explanation: '' },
              { key: 'B', value: '细胞内水分减少', explanation: '' },
              { key: 'C', value: '细胞内酶活性降低', explanation: '' },
              { key: 'D', value: '细胞内色素积累', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '细胞衰老时细胞体积减小，不是增大。'
          },
          {
            id: 'q_biology_060',
            question: '细胞凋亡的定义是（ ）',
            options: [
              { key: 'A', value: '由基因决定的细胞自动结束生命的过程', explanation: '' },
              { key: 'B', value: '细胞因损伤而死亡的过程', explanation: '' },
              { key: 'C', value: '细胞因衰老而死亡的过程', explanation: '' },
              { key: 'D', value: '细胞因病毒感染而死亡的过程', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '细胞凋亡是由基因决定的细胞自动结束生命的过程。'
          }
        ]
      },
      {
        levelNumber: 7,
        name: '第七章 遗传因子的发现',
        description: '高一生物第七单元',
        difficulty: 3,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_biology_061',
            question: '孟德尔选用豌豆作为实验材料的原因不包括（ ）',
            options: [
              { key: 'A', value: '豌豆是自花传粉、闭花授粉植物', explanation: '' },
              { key: 'B', value: '豌豆具有易于区分的相对性状', explanation: '' },
              { key: 'C', value: '豌豆生长周期长', explanation: '' },
              { key: 'D', value: '豌豆子代数量多', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '豌豆生长周期短，不是长。'
          },
          {
            id: 'q_biology_062',
            question: '相对性状的定义是（ ）',
            options: [
              { key: 'A', value: '同种生物同一性状的不同表现类型', explanation: '' },
              { key: 'B', value: '不同生物同一性状的不同表现类型', explanation: '' },
              { key: 'C', value: '同种生物不同性状的不同表现类型', explanation: '' },
              { key: 'D', value: '不同生物不同性状的不同表现类型', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '相对性状是指同种生物同一性状的不同表现类型。'
          },
          {
            id: 'q_biology_063',
            question: '显性性状的定义是（ ）',
            options: [
              { key: 'A', value: '杂合子中表现出来的性状', explanation: '' },
              { key: 'B', value: '纯合子中表现出来的性状', explanation: '' },
              { key: 'C', value: '隐性纯合子中表现出来的性状', explanation: '' },
              { key: 'D', value: 'F₂中出现的性状', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '显性性状是指杂合子中表现出来的性状。'
          },
          {
            id: 'q_biology_064',
            question: '隐性性状的定义是（ ）',
            options: [
              { key: 'A', value: '杂合子中未表现出来的性状', explanation: '' },
              { key: 'B', value: '纯合子中表现出来的性状', explanation: '' },
              { key: 'C', value: '显性纯合子中表现出来的性状', explanation: '' },
              { key: 'D', value: 'F₁中出现的性状', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '隐性性状是指杂合子中未表现出来的性状。'
          },
          {
            id: 'q_biology_065',
            question: '分离定律的内容是（ ）',
            options: [
              { key: 'A', value: '在形成配子时，成对的遗传因子彼此分离，分别进入不同的配子中', explanation: '' },
              { key: 'B', value: '在形成配子时，不同对的遗传因子自由组合', explanation: '' },
              { key: 'C', value: '遗传因子在体细胞中成对存在', explanation: '' },
              { key: 'D', value: '遗传因子在配子中成单存在', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '分离定律指出在形成配子时，成对的遗传因子彼此分离，分别进入不同的配子中。'
          },
          {
            id: 'q_biology_066',
            question: '自由组合定律的内容是（ ）',
            options: [
              { key: 'A', value: '在形成配子时，成对的遗传因子彼此分离', explanation: '' },
              { key: 'B', value: '在形成配子时，不同对的遗传因子自由组合', explanation: '' },
              { key: 'C', value: '遗传因子在体细胞中成对存在', explanation: '' },
              { key: 'D', value: '遗传因子在配子中成单存在', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '自由组合定律指出在形成配子时，不同对的遗传因子自由组合。'
          },
          {
            id: 'q_biology_067',
            question: '测交的定义是（ ）',
            options: [
              { key: 'A', value: '让F₁与隐性纯合子杂交', explanation: '' },
              { key: 'B', value: '让F₁与显性纯合子杂交', explanation: '' },
              { key: 'C', value: '让F₁自交', explanation: '' },
              { key: 'D', value: '让F₂自交', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '测交是让F₁与隐性纯合子杂交。'
          },
          {
            id: 'q_biology_068',
            question: '基因型为Aa的个体自交，后代的基因型比例是（ ）',
            options: [
              { key: 'A', value: 'AA:Aa:aa=1:2:1', explanation: '' },
              { key: 'B', value: 'AA:Aa:aa=1:1:1', explanation: '' },
              { key: 'C', value: 'AA:Aa:aa=2:1:1', explanation: '' },
              { key: 'D', value: 'AA:Aa:aa=3:1:0', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '基因型为Aa的个体自交，后代的基因型比例是AA:Aa:aa=1:2:1。'
          },
          {
            id: 'q_biology_069',
            question: '基因型为Aa的个体自交，后代的表现型比例是（ ）',
            options: [
              { key: 'A', value: '显性:隐性=3:1', explanation: '' },
              { key: 'B', value: '显性:隐性=1:1', explanation: '' },
              { key: 'C', value: '显性:隐性=2:1', explanation: '' },
              { key: 'D', value: '显性:隐性=1:2', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '基因型为Aa的个体自交，后代的表现型比例是显性:隐性=3:1。'
          },
          {
            id: 'q_biology_070',
            question: '基因型为AaBb的个体自交，后代的表现型比例是（ ）',
            options: [
              { key: 'A', value: '9:3:3:1', explanation: '' },
              { key: 'B', value: '3:1:3:1', explanation: '' },
              { key: 'C', value: '1:2:1:2', explanation: '' },
              { key: 'D', value: '1:1:1:1', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '基因型为AaBb的个体自交，后代的表现型比例是9:3:3:1。'
          }
        ]
      },
      {
        levelNumber: 8,
        name: '第八章 基因和染色体的关系',
        description: '高一生物第八单元',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_biology_071',
            question: '减数分裂的特点是（ ）',
            options: [
              { key: 'A', value: '染色体复制一次，细胞分裂两次', explanation: '' },
              { key: 'B', value: '染色体复制两次，细胞分裂一次', explanation: '' },
              { key: 'C', value: '染色体复制一次，细胞分裂一次', explanation: '' },
              { key: 'D', value: '染色体复制两次，细胞分裂两次', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '减数分裂的特点是染色体复制一次，细胞分裂两次。'
          },
          {
            id: 'q_biology_072',
            question: '减数分裂的结果是（ ）',
            options: [
              { key: 'A', value: '产生四个子细胞，染色体数目减半', explanation: '' },
              { key: 'B', value: '产生两个子细胞，染色体数目不变', explanation: '' },
              { key: 'C', value: '产生四个子细胞，染色体数目不变', explanation: '' },
              { key: 'D', value: '产生两个子细胞，染色体数目减半', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '减数分裂产生四个子细胞，染色体数目减半。'
          },
          {
            id: 'q_biology_073',
            question: '同源染色体的定义是（ ）',
            options: [
              { key: 'A', value: '形态、大小一般相同，一条来自父方，一条来自母方的染色体', explanation: '' },
              { key: 'B', value: '形态、大小不同的染色体', explanation: '' },
              { key: 'C', value: '都来自父方的染色体', explanation: '' },
              { key: 'D', value: '都来自母方的染色体', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '同源染色体是指形态、大小一般相同，一条来自父方，一条来自母方的染色体。'
          },
          {
            id: 'q_biology_074',
            question: '联会发生在（ ）',
            options: [
              { key: 'A', value: '减数第一次分裂前期', explanation: '' },
              { key: 'B', value: '减数第一次分裂中期', explanation: '' },
              { key: 'C', value: '减数第二次分裂前期', explanation: '' },
              { key: 'D', value: '减数第二次分裂中期', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '联会发生在减数第一次分裂前期。'
          },
          {
            id: 'q_biology_075',
            question: '交叉互换发生在（ ）',
            options: [
              { key: 'A', value: '同源染色体的非姐妹染色单体之间', explanation: '' },
              { key: 'B', value: '同源染色体的姐妹染色单体之间', explanation: '' },
              { key: 'C', value: '非同源染色体之间', explanation: '' },
              { key: 'D', value: '姐妹染色单体之间', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '交叉互换发生在同源染色体的非姐妹染色单体之间。'
          },
          {
            id: 'q_biology_076',
            question: '减数第一次分裂后期的特点是（ ）',
            options: [
              { key: 'A', value: '同源染色体分离', explanation: '' },
              { key: 'B', value: '姐妹染色单体分离', explanation: '' },
              { key: 'C', value: '染色体复制', explanation: '' },
              { key: 'D', value: '细胞质分裂', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '减数第一次分裂后期的特点是同源染色体分离。'
          },
          {
            id: 'q_biology_077',
            question: '减数第二次分裂后期的特点是（ ）',
            options: [
              { key: 'A', value: '同源染色体分离', explanation: '' },
              { key: 'B', value: '姐妹染色单体分离', explanation: '' },
              { key: 'C', value: '染色体复制', explanation: '' },
              { key: 'D', value: '细胞质分裂', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '减数第二次分裂后期的特点是姐妹染色单体分离。'
          },
          {
            id: 'q_biology_078',
            question: '精子和卵细胞形成过程的区别不包括（ ）',
            options: [
              { key: 'A', value: '精子形成需要变形', explanation: '' },
              { key: 'B', value: '卵细胞形成需要变形', explanation: '' },
              { key: 'C', value: '一个精原细胞形成四个精子', explanation: '' },
              { key: 'D', value: '一个卵原细胞形成一个卵细胞', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '卵细胞形成不需要变形。'
          },
          {
            id: 'q_biology_079',
            question: '受精作用的意义是（ ）',
            options: [
              { key: 'A', value: '维持前后代体细胞中染色体数目的恒定', explanation: '' },
              { key: 'B', value: '增加染色体数目', explanation: '' },
              { key: 'C', value: '减少染色体数目', explanation: '' },
              { key: 'D', value: '改变染色体数目', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '受精作用的意义是维持前后代体细胞中染色体数目的恒定。'
          },
          {
            id: 'q_biology_080',
            question: '基因在染色体上的实验证据来自（ ）',
            options: [
              { key: 'A', value: '摩尔根的果蝇杂交实验', explanation: '' },
              { key: 'B', value: '孟德尔的豌豆杂交实验', explanation: '' },
              { key: 'C', value: '沃森和克里克的DNA结构模型', explanation: '' },
              { key: 'D', value: '格里菲斯的肺炎双球菌转化实验', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '摩尔根通过果蝇杂交实验证明了基因在染色体上。'
          }
        ]
      },
      {
        levelNumber: 9,
        name: '第九章 基因的本质',
        description: '高一生物第九单元',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_biology_081',
            question: 'DNA是主要的遗传物质的实验证据不包括（ ）',
            options: [
              { key: 'A', value: '格里菲斯的肺炎双球菌转化实验', explanation: '' },
              { key: 'B', value: '艾弗里的肺炎双球菌转化实验', explanation: '' },
              { key: 'C', value: '赫尔希和蔡斯的噬菌体侵染细菌实验', explanation: '' },
              { key: 'D', value: '孟德尔的豌豆杂交实验', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '孟德尔的豌豆杂交实验证明了遗传因子的存在，不是DNA是主要遗传物质的证据。'
          },
          {
            id: 'q_biology_082',
            question: 'DNA的双螺旋结构模型的建立者是（ ）',
            options: [
              { key: 'A', value: '沃森和克里克', explanation: '' },
              { key: 'B', value: '摩尔根', explanation: '' },
              { key: 'C', value: '孟德尔', explanation: '' },
              { key: 'D', value: '艾弗里', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '沃森和克里克建立了DNA的双螺旋结构模型。'
          },
          {
            id: 'q_biology_083',
            question: 'DNA的组成单位是（ ）',
            options: [
              { key: 'A', value: '脱氧核苷酸', explanation: '' },
              { key: 'B', value: '核糖核苷酸', explanation: '' },
              { key: 'C', value: '氨基酸', explanation: '' },
              { key: 'D', value: '葡萄糖', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'DNA的组成单位是脱氧核苷酸。'
          },
          {
            id: 'q_biology_084',
            question: 'DNA的碱基组成不包括（ ）',
            options: [
              { key: 'A', value: 'A', explanation: '' },
              { key: 'B', value: 'T', explanation: '' },
              { key: 'C', value: 'U', explanation: '' },
              { key: 'D', value: 'C', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'DNA的碱基是A、T、C、G，不包括U。U是RNA特有的碱基。'
          },
          {
            id: 'q_biology_085',
            question: 'DNA的碱基配对原则是（ ）',
            options: [
              { key: 'A', value: 'A-T，C-G', explanation: '' },
              { key: 'B', value: 'A-U，C-G', explanation: '' },
              { key: 'C', value: 'A-G，C-T', explanation: '' },
              { key: 'D', value: 'A-C，G-T', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'DNA的碱基配对原则是A与T配对，C与G配对。'
          },
          {
            id: 'q_biology_086',
            question: 'DNA复制的特点不包括（ ）',
            options: [
              { key: 'A', value: '半保留复制', explanation: '' },
              { key: 'B', value: '边解旋边复制', explanation: '' },
              { key: 'C', value: '全保留复制', explanation: '' },
              { key: 'D', value: '双向复制', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'DNA复制是半保留复制，不是全保留复制。'
          },
          {
            id: 'q_biology_087',
            question: 'DNA复制需要的条件不包括（ ）',
            options: [
              { key: 'A', value: '模板', explanation: '' },
              { key: 'B', value: '原料', explanation: '' },
              { key: 'C', value: '酶', explanation: '' },
              { key: 'D', value: 'RNA', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: 'DNA复制需要模板、原料、酶和能量，不需要RNA。'
          },
          {
            id: 'q_biology_088',
            question: '基因的定义是（ ）',
            options: [
              { key: 'A', value: '有遗传效应的DNA片段', explanation: '' },
              { key: 'B', value: 'DNA分子', explanation: '' },
              { key: 'C', value: '染色体', explanation: '' },
              { key: 'D', value: '蛋白质', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '基因是有遗传效应的DNA片段。'
          },
          {
            id: 'q_biology_089',
            question: 'DNA分子的多样性取决于（ ）',
            options: [
              { key: 'A', value: '碱基对的排列顺序', explanation: '' },
              { key: 'B', value: '碱基的种类', explanation: '' },
              { key: 'C', value: '碱基的数量', explanation: '' },
              { key: 'D', value: 'DNA的长度', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'DNA分子的多样性取决于碱基对的排列顺序。'
          },
          {
            id: 'q_biology_090',
            question: 'DNA分子的特异性取决于（ ）',
            options: [
              { key: 'A', value: '碱基对的特定排列顺序', explanation: '' },
              { key: 'B', value: '碱基的种类', explanation: '' },
              { key: 'C', value: '碱基的数量', explanation: '' },
              { key: 'D', value: 'DNA的长度', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'DNA分子的特异性取决于碱基对的特定排列顺序。'
          }
        ]
      },
      {
        levelNumber: 10,
        name: '第十章 基因的表达',
        description: '高一生物第十单元',
        difficulty: 5,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_biology_091',
            question: '基因表达的过程包括（ ）',
            options: [
              { key: 'A', value: '转录和翻译', explanation: '' },
              { key: 'B', value: '复制和转录', explanation: '' },
              { key: 'C', value: '复制和翻译', explanation: '' },
              { key: 'D', value: '复制、转录和翻译', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '基因表达包括转录和翻译两个过程。'
          },
          {
            id: 'q_biology_092',
            question: '转录的定义是（ ）',
            options: [
              { key: 'A', value: '以DNA为模板合成RNA的过程', explanation: '' },
              { key: 'B', value: '以RNA为模板合成DNA的过程', explanation: '' },
              { key: 'C', value: '以mRNA为模板合成蛋白质的过程', explanation: '' },
              { key: 'D', value: '以DNA为模板合成DNA的过程', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '转录是以DNA为模板合成RNA的过程。'
          },
          {
            id: 'q_biology_093',
            question: '转录的场所是（ ）',
            options: [
              { key: 'A', value: '细胞核', explanation: '' },
              { key: 'B', value: '细胞质', explanation: '' },
              { key: 'C', value: '核糖体', explanation: '' },
              { key: 'D', value: '线粒体', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '转录的场所是细胞核。'
          },
          {
            id: 'q_biology_094',
            question: '翻译的定义是（ ）',
            options: [
              { key: 'A', value: '以DNA为模板合成RNA的过程', explanation: '' },
              { key: 'B', value: '以RNA为模板合成DNA的过程', explanation: '' },
              { key: 'C', value: '以mRNA为模板合成蛋白质的过程', explanation: '' },
              { key: 'D', value: '以DNA为模板合成DNA的过程', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '翻译是以mRNA为模板合成蛋白质的过程。'
          },
          {
            id: 'q_biology_095',
            question: '翻译的场所是（ ）',
            options: [
              { key: 'A', value: '细胞核', explanation: '' },
              { key: 'B', value: '核糖体', explanation: '' },
              { key: 'C', value: '细胞质基质', explanation: '' },
              { key: 'D', value: '线粒体', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '翻译的场所是核糖体。'
          },
          {
            id: 'q_biology_096',
            question: '密码子的定义是（ ）',
            options: [
              { key: 'A', value: 'mRNA上三个相邻的碱基', explanation: '' },
              { key: 'B', value: 'DNA上三个相邻的碱基', explanation: '' },
              { key: 'C', value: 'tRNA上三个相邻的碱基', explanation: '' },
              { key: 'D', value: 'rRNA上三个相邻的碱基', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '密码子是mRNA上三个相邻的碱基。'
          },
          {
            id: 'q_biology_097',
            question: '反密码子的定义是（ ）',
            options: [
              { key: 'A', value: 'tRNA上与密码子互补配对的三个碱基', explanation: '' },
              { key: 'B', value: 'mRNA上与密码子互补配对的三个碱基', explanation: '' },
              { key: 'C', value: 'DNA上与密码子互补配对的三个碱基', explanation: '' },
              { key: 'D', value: 'rRNA上与密码子互补配对的三个碱基', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '反密码子是tRNA上与密码子互补配对的三个碱基。'
          },
          {
            id: 'q_biology_098',
            question: '中心法则的内容不包括（ ）',
            options: [
              { key: 'A', value: 'DNA→DNA', explanation: '' },
              { key: 'B', value: 'DNA→RNA', explanation: '' },
              { key: 'C', value: 'RNA→蛋白质', explanation: '' },
              { key: 'D', value: '蛋白质→RNA', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '中心法则不包括蛋白质→RNA。'
          },
          {
            id: 'q_biology_099',
            question: '基因对性状的控制方式不包括（ ）',
            options: [
              { key: 'A', value: '通过控制酶的合成来控制代谢过程', explanation: '' },
              { key: 'B', value: '通过控制蛋白质的结构直接控制性状', explanation: '' },
              { key: 'C', value: '通过控制DNA的复制来控制性状', explanation: '' },
              { key: 'D', value: '通过控制激素的合成来控制性状', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '基因对性状的控制方式不包括通过控制DNA的复制来控制性状。'
          },
          {
            id: 'q_biology_100',
            question: '下列关于基因表达的叙述正确的是（ ）',
            options: [
              { key: 'A', value: '转录和翻译都在细胞核中进行', explanation: '' },
              { key: 'B', value: '转录在细胞核中进行，翻译在细胞质中进行', explanation: '' },
              { key: 'C', value: '转录在细胞质中进行，翻译在细胞核中进行', explanation: '' },
              { key: 'D', value: '转录和翻译都在细胞质中进行', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '转录在细胞核中进行，翻译在细胞质中的核糖体上进行。'
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