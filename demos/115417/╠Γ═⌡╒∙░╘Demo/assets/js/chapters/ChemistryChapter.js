class ChemistryChapter extends Chapter {
  constructor() {
    super('chemistry', '化学', 'fa-flask-conical', '#e74c3c');
    this.initLevels();
  }

  initLevels() {
    this.levels = [
      {
        levelNumber: 1,
        name: '第一章 物质及其变化',
        description: '高一化学第一单元',
        difficulty: 1,
        timeLimit: 180,
        unlocked: true,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chemistry_001',
            question: '下列物质属于纯净物的是（ ）',
            options: [
              { key: 'A', value: '空气', explanation: '' },
              { key: 'B', value: '海水', explanation: '' },
              { key: 'C', value: '蒸馏水', explanation: '' },
              { key: 'D', value: '石油', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '蒸馏水是由一种物质组成的，属于纯净物。'
          },
          {
            id: 'q_chemistry_002',
            question: '下列变化属于化学变化的是（ ）',
            options: [
              { key: 'A', value: '水结成冰', explanation: '' },
              { key: 'B', value: '蜡烛燃烧', explanation: '' },
              { key: 'C', value: '玻璃破碎', explanation: '' },
              { key: 'D', value: '汽油挥发', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '蜡烛燃烧生成了新物质二氧化碳和水，属于化学变化。'
          },
          {
            id: 'q_chemistry_003',
            question: '下列物质属于电解质的是（ ）',
            options: [
              { key: 'A', value: '蔗糖', explanation: '' },
              { key: 'B', value: '氯化钠', explanation: '' },
              { key: 'C', value: '酒精', explanation: '' },
              { key: 'D', value: '铜', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '氯化钠在水溶液中能导电，属于电解质。'
          },
          {
            id: 'q_chemistry_004',
            question: '下列物质属于非电解质的是（ ）',
            options: [
              { key: 'A', value: '硫酸', explanation: '' },
              { key: 'B', value: '氢氧化钠', explanation: '' },
              { key: 'C', value: '二氧化碳', explanation: '' },
              { key: 'D', value: '氯化钠', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '二氧化碳在水溶液中自身不能电离出离子，属于非电解质。'
          },
          {
            id: 'q_chemistry_005',
            question: '下列反应属于氧化还原反应的是（ ）',
            options: [
              { key: 'A', value: 'CaO + H₂O = Ca(OH)₂', explanation: '' },
              { key: 'B', value: 'Fe + CuSO₄ = FeSO₄ + Cu', explanation: '' },
              { key: 'C', value: 'NaOH + HCl = NaCl + H₂O', explanation: '' },
              { key: 'D', value: 'CaCO₃ = CaO + CO₂', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '铁与硫酸铜反应中有元素化合价的变化，属于氧化还原反应。'
          },
          {
            id: 'q_chemistry_006',
            question: '在氧化还原反应中，还原剂发生的变化是（ ）',
            options: [
              { key: 'A', value: '被氧化，失去电子', explanation: '' },
              { key: 'B', value: '被还原，得到电子', explanation: '' },
              { key: 'C', value: '被氧化，得到电子', explanation: '' },
              { key: 'D', value: '被还原，失去电子', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '还原剂在反应中失去电子，被氧化。'
          },
          {
            id: 'q_chemistry_007',
            question: '下列离子方程式书写正确的是（ ）',
            options: [
              { key: 'A', value: 'Fe + Cu²⁺ = Fe³⁺ + Cu', explanation: '' },
              { key: 'B', value: 'H⁺ + OH⁻ = H₂O', explanation: '' },
              { key: 'C', value: 'CO₃²⁻ + H⁺ = CO₂ + H₂O', explanation: '' },
              { key: 'D', value: 'Ba²⁺ + SO₄²⁻ = BaSO₄', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '氢离子和氢氧根离子反应生成水的离子方程式书写正确。'
          },
          {
            id: 'q_chemistry_008',
            question: '下列物质属于酸的是（ ）',
            options: [
              { key: 'A', value: 'NaOH', explanation: '' },
              { key: 'B', value: 'HCl', explanation: '' },
              { key: 'C', value: 'NaCl', explanation: '' },
              { key: 'D', value: 'Na₂CO₃', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'HCl在水溶液中电离出氢离子，属于酸。'
          },
          {
            id: 'q_chemistry_009',
            question: '下列物质属于碱的是（ ）',
            options: [
              { key: 'A', value: 'H₂SO₄', explanation: '' },
              { key: 'B', value: 'NaCl', explanation: '' },
              { key: 'C', value: 'Ca(OH)₂', explanation: '' },
              { key: 'D', value: 'HNO₃', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'Ca(OH)₂在水溶液中电离出氢氧根离子，属于碱。'
          },
          {
            id: 'q_chemistry_010',
            question: '下列物质属于盐的是（ ）',
            options: [
              { key: 'A', value: 'H₂O', explanation: '' },
              { key: 'B', value: 'NaOH', explanation: '' },
              { key: 'C', value: 'H₂SO₄', explanation: '' },
              { key: 'D', value: 'KNO₃', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: 'KNO₃是由金属离子和酸根离子组成的化合物，属于盐。'
          }
        ]
      },
      {
        levelNumber: 2,
        name: '第二章 物质的量',
        description: '高一化学第二单元',
        difficulty: 1,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chemistry_011',
            question: '物质的量的单位是（ ）',
            options: [
              { key: 'A', value: '克', explanation: '' },
              { key: 'B', value: '摩尔', explanation: '' },
              { key: 'C', value: '升', explanation: '' },
              { key: 'D', value: '秒', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '物质的量的单位是摩尔，符号为mol。'
          },
          {
            id: 'q_chemistry_012',
            question: '阿伏伽德罗常数的数值约为（ ）',
            options: [
              { key: 'A', value: '6.02×10²³', explanation: '' },
              { key: 'B', value: '6.02×10²⁴', explanation: '' },
              { key: 'C', value: '6.02×10²²', explanation: '' },
              { key: 'D', value: '6.02×10²¹', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '阿伏伽德罗常数约为6.02×10²³ mol⁻¹。'
          },
          {
            id: 'q_chemistry_013',
            question: '1mol任何物质所含的粒子数（ ）',
            options: [
              { key: 'A', value: '都相等', explanation: '' },
              { key: 'B', value: '都不相等', explanation: '' },
              { key: 'C', value: '与物质种类有关', explanation: '' },
              { key: 'D', value: '与温度有关', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '1mol任何物质所含的粒子数都约为6.02×10²³。'
          },
          {
            id: 'q_chemistry_014',
            question: '摩尔质量的定义是（ ）',
            options: [
              { key: 'A', value: '单位物质的量的物质所具有的质量', explanation: '' },
              { key: 'B', value: '物质的质量', explanation: '' },
              { key: 'C', value: '物质的量', explanation: '' },
              { key: 'D', value: '物质的体积', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '摩尔质量是单位物质的量的物质所具有的质量。'
          },
          {
            id: 'q_chemistry_015',
            question: '水的摩尔质量是（ ）',
            options: [
              { key: 'A', value: '18g/mol', explanation: '' },
              { key: 'B', value: '18g', explanation: '' },
              { key: 'C', value: '18mol/g', explanation: '' },
              { key: 'D', value: '18mol', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '水的摩尔质量等于其相对分子质量，为18g/mol。'
          },
          {
            id: 'q_chemistry_016',
            question: '2mol水的质量是（ ）',
            options: [
              { key: 'A', value: '18g', explanation: '' },
              { key: 'B', value: '36g', explanation: '' },
              { key: 'C', value: '9g', explanation: '' },
              { key: 'D', value: '72g', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'm = n×M = 2mol×18g/mol = 36g。'
          },
          {
            id: 'q_chemistry_017',
            question: '标准状况下，1mol任何气体的体积约为（ ）',
            options: [
              { key: 'A', value: '22.4L', explanation: '' },
              { key: 'B', value: '22.4mL', explanation: '' },
              { key: 'C', value: '22.4m³', explanation: '' },
              { key: 'D', value: '22.4cm³', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '标准状况下，1mol任何气体的体积约为22.4L。'
          },
          {
            id: 'q_chemistry_018',
            question: '气体摩尔体积的适用条件是（ ）',
            options: [
              { key: 'A', value: '标准状况', explanation: '' },
              { key: 'B', value: '常温常压', explanation: '' },
              { key: 'C', value: '任何条件', explanation: '' },
              { key: 'D', value: '高温高压', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '气体摩尔体积在标准状况下约为22.4L/mol。'
          },
          {
            id: 'q_chemistry_019',
            question: '物质的量浓度的定义是（ ）',
            options: [
              { key: 'A', value: '单位体积溶液中所含溶质的物质的量', explanation: '' },
              { key: 'B', value: '单位质量溶液中所含溶质的质量', explanation: '' },
              { key: 'C', value: '单位体积溶液中所含溶质的质量', explanation: '' },
              { key: 'D', value: '单位质量溶液中所含溶质的物质的量', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '物质的量浓度是单位体积溶液中所含溶质的物质的量。'
          },
          {
            id: 'q_chemistry_020',
            question: '将58.5g NaCl溶解在水中，配成1L溶液，其物质的量浓度是（ ）',
            options: [
              { key: 'A', value: '1mol/L', explanation: '' },
              { key: 'B', value: '2mol/L', explanation: '' },
              { key: 'C', value: '0.5mol/L', explanation: '' },
              { key: 'D', value: '0.1mol/L', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'n = m/M = 58.5g/58.5g/mol = 1mol，c = n/V = 1mol/1L = 1mol/L。'
          }
        ]
      },
      {
        levelNumber: 3,
        name: '第三章 金属及其化合物',
        description: '高一化学第三单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chemistry_021',
            question: '下列金属属于活泼金属的是（ ）',
            options: [
              { key: 'A', value: '铁', explanation: '' },
              { key: 'B', value: '铜', explanation: '' },
              { key: 'C', value: '铝', explanation: '' },
              { key: 'D', value: '金', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '铝是活泼金属，在金属活动性顺序表中位置靠前。'
          },
          {
            id: 'q_chemistry_022',
            question: '钠与水反应的现象不包括（ ）',
            options: [
              { key: 'A', value: '钠浮在水面上', explanation: '' },
              { key: 'B', value: '钠沉入水底', explanation: '' },
              { key: 'C', value: '钠熔化成小球', explanation: '' },
              { key: 'D', value: '产生气体', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '钠的密度比水小，会浮在水面上。'
          },
          {
            id: 'q_chemistry_023',
            question: '钠与水反应的产物是（ ）',
            options: [
              { key: 'A', value: 'NaOH和H₂', explanation: '' },
              { key: 'B', value: 'Na₂O和H₂', explanation: '' },
              { key: 'C', value: 'NaCl和H₂', explanation: '' },
              { key: 'D', value: 'Na₂O₂和H₂', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '钠与水反应生成氢氧化钠和氢气：2Na + 2H₂O = 2NaOH + H₂↑。'
          },
          {
            id: 'q_chemistry_024',
            question: '铝与盐酸反应的离子方程式是（ ）',
            options: [
              { key: 'A', value: '2Al + 6H⁺ = 2Al³⁺ + 3H₂↑', explanation: '' },
              { key: 'B', value: 'Al + 2H⁺ = Al²⁺ + H₂↑', explanation: '' },
              { key: 'C', value: 'Al + 3H⁺ = Al³⁺ + H₂↑', explanation: '' },
              { key: 'D', value: '2Al + 3H⁺ = 2Al³⁺ + 3H₂↑', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '铝与盐酸反应生成铝离子和氢气，离子方程式为2Al + 6H⁺ = 2Al³⁺ + 3H₂↑。'
          },
          {
            id: 'q_chemistry_025',
            question: '铁与稀硫酸反应的产物是（ ）',
            options: [
              { key: 'A', value: 'Fe₂(SO₄)₃和H₂', explanation: '' },
              { key: 'B', value: 'FeSO₄和H₂', explanation: '' },
              { key: 'C', value: 'Fe₂O₃和H₂', explanation: '' },
              { key: 'D', value: 'FeO和H₂', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '铁与稀硫酸反应生成硫酸亚铁和氢气：Fe + H₂SO₄ = FeSO₄ + H₂↑。'
          },
          {
            id: 'q_chemistry_026',
            question: '下列氧化物属于碱性氧化物的是（ ）',
            options: [
              { key: 'A', value: 'CO₂', explanation: '' },
              { key: 'B', value: 'SO₂', explanation: '' },
              { key: 'C', value: 'CaO', explanation: '' },
              { key: 'D', value: 'Al₂O₃', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'CaO能与酸反应生成盐和水，属于碱性氧化物。'
          },
          {
            id: 'q_chemistry_027',
            question: '下列氧化物属于酸性氧化物的是（ ）',
            options: [
              { key: 'A', value: 'Na₂O', explanation: '' },
              { key: 'B', value: 'CaO', explanation: '' },
              { key: 'C', value: 'CO₂', explanation: '' },
              { key: 'D', value: 'Fe₂O₃', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'CO₂能与碱反应生成盐和水，属于酸性氧化物。'
          },
          {
            id: 'q_chemistry_028',
            question: '氧化铝属于（ ）',
            options: [
              { key: 'A', value: '碱性氧化物', explanation: '' },
              { key: 'B', value: '酸性氧化物', explanation: '' },
              { key: 'C', value: '两性氧化物', explanation: '' },
              { key: 'D', value: '不成盐氧化物', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '氧化铝既能与酸反应，又能与碱反应，属于两性氧化物。'
          },
          {
            id: 'q_chemistry_029',
            question: '氢氧化铝的性质不包括（ ）',
            options: [
              { key: 'A', value: '与酸反应', explanation: '' },
              { key: 'B', value: '与碱反应', explanation: '' },
              { key: 'C', value: '受热分解', explanation: '' },
              { key: 'D', value: '与水反应', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '氢氧化铝不与水反应。'
          },
          {
            id: 'q_chemistry_030',
            question: '下列物质不能与氢氧化钠溶液反应的是（ ）',
            options: [
              { key: 'A', value: 'Al', explanation: '' },
              { key: 'B', value: 'Al₂O₃', explanation: '' },
              { key: 'C', value: 'Al(OH)₃', explanation: '' },
              { key: 'D', value: 'Fe', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '铁不能与氢氧化钠溶液反应。'
          }
        ]
      },
      {
        levelNumber: 4,
        name: '第四章 非金属及其化合物',
        description: '高一化学第四单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chemistry_031',
            question: '氯气的颜色是（ ）',
            options: [
              { key: 'A', value: '黄绿色', explanation: '' },
              { key: 'B', value: '无色', explanation: '' },
              { key: 'C', value: '红色', explanation: '' },
              { key: 'D', value: '紫色', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '氯气是黄绿色气体。'
          },
          {
            id: 'q_chemistry_032',
            question: '氯气与水反应的产物是（ ）',
            options: [
              { key: 'A', value: 'HCl和HClO', explanation: '' },
              { key: 'B', value: 'HCl和O₂', explanation: '' },
              { key: 'C', value: 'H₂和Cl₂O', explanation: '' },
              { key: 'D', value: 'H₂O和Cl₂O', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '氯气与水反应生成盐酸和次氯酸：Cl₂ + H₂O = HCl + HClO。'
          },
          {
            id: 'q_chemistry_033',
            question: '漂白粉的有效成分是（ ）',
            options: [
              { key: 'A', value: 'Ca(ClO)₂', explanation: '' },
              { key: 'B', value: 'CaCl₂', explanation: '' },
              { key: 'C', value: 'Ca(OH)₂', explanation: '' },
              { key: 'D', value: 'CaCO₃', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '漂白粉的有效成分是次氯酸钙Ca(ClO)₂。'
          },
          {
            id: 'q_chemistry_034',
            question: '二氧化硫的性质不包括（ ）',
            options: [
              { key: 'A', value: '酸性氧化物', explanation: '' },
              { key: 'B', value: '还原性', explanation: '' },
              { key: 'C', value: '漂白性', explanation: '' },
              { key: 'D', value: '氧化性', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '二氧化硫主要表现为还原性和漂白性，氧化性较弱。'
          },
          {
            id: 'q_chemistry_035',
            question: '浓硫酸的特性不包括（ ）',
            options: [
              { key: 'A', value: '吸水性', explanation: '' },
              { key: 'B', value: '脱水性', explanation: '' },
              { key: 'C', value: '强氧化性', explanation: '' },
              { key: 'D', value: '挥发性', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '浓硫酸不具有挥发性。'
          },
          {
            id: 'q_chemistry_036',
            question: '氮气的化学性质（ ）',
            options: [
              { key: 'A', value: '很稳定', explanation: '' },
              { key: 'B', value: '很活泼', explanation: '' },
              { key: 'C', value: '能燃烧', explanation: '' },
              { key: 'D', value: '能与水反应', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '氮气分子中存在氮氮三键，化学性质很稳定。'
          },
          {
            id: 'q_chemistry_037',
            question: '氨气的性质不包括（ ）',
            options: [
              { key: 'A', value: '碱性气体', explanation: '' },
              { key: 'B', value: '极易溶于水', explanation: '' },
              { key: 'C', value: '能与酸反应', explanation: '' },
              { key: 'D', value: '能燃烧', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '氨气在纯氧中可以燃烧，但通常条件下不能燃烧。'
          },
          {
            id: 'q_chemistry_038',
            question: '铵盐的性质不包括（ ）',
            options: [
              { key: 'A', value: '易溶于水', explanation: '' },
              { key: 'B', value: '受热易分解', explanation: '' },
              { key: 'C', value: '与碱反应生成氨气', explanation: '' },
              { key: 'D', value: '与酸反应', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '铵盐通常不与酸反应。'
          },
          {
            id: 'q_chemistry_039',
            question: '二氧化氮的颜色是（ ）',
            options: [
              { key: 'A', value: '红棕色', explanation: '' },
              { key: 'B', value: '无色', explanation: '' },
              { key: 'C', value: '黄色', explanation: '' },
              { key: 'D', value: '绿色', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '二氧化氮是红棕色气体。'
          },
          {
            id: 'q_chemistry_040',
            question: '下列物质属于大气污染物的是（ ）',
            options: [
              { key: 'A', value: 'N₂', explanation: '' },
              { key: 'B', value: 'O₂', explanation: '' },
              { key: 'C', value: 'SO₂', explanation: '' },
              { key: 'D', value: 'CO₂', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '二氧化硫是常见的大气污染物。'
          }
        ]
      },
      {
        levelNumber: 5,
        name: '第五章 原子结构',
        description: '高一化学第五单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chemistry_041',
            question: '原子的组成不包括（ ）',
            options: [
              { key: 'A', value: '质子', explanation: '' },
              { key: 'B', value: '中子', explanation: '' },
              { key: 'C', value: '电子', explanation: '' },
              { key: 'D', value: '离子', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '原子由质子、中子和电子组成，不包括离子。'
          },
          {
            id: 'q_chemistry_042',
            question: '质子数决定元素的（ ）',
            options: [
              { key: 'A', value: '种类', explanation: '' },
              { key: 'B', value: '质量', explanation: '' },
              { key: 'C', value: '化学性质', explanation: '' },
              { key: 'D', value: '状态', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '质子数决定元素的种类。'
          },
          {
            id: 'q_chemistry_043',
            question: '质量数等于（ ）',
            options: [
              { key: 'A', value: '质子数+中子数', explanation: '' },
              { key: 'B', value: '质子数+电子数', explanation: '' },
              { key: 'C', value: '中子数+电子数', explanation: '' },
              { key: 'D', value: '质子数', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '质量数等于质子数和中子数之和。'
          },
          {
            id: 'q_chemistry_044',
            question: '核外电子排布遵循的规律不包括（ ）',
            options: [
              { key: 'A', value: '能量最低原理', explanation: '' },
              { key: 'B', value: '泡利不相容原理', explanation: '' },
              { key: 'C', value: '洪特规则', explanation: '' },
              { key: 'D', value: '质量守恒定律', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '质量守恒定律是化学反应遵循的规律，不是核外电子排布规律。'
          },
          {
            id: 'q_chemistry_045',
            question: '第一电子层最多容纳的电子数是（ ）',
            options: [
              { key: 'A', value: '2', explanation: '' },
              { key: 'B', value: '8', explanation: '' },
              { key: 'C', value: '18', explanation: '' },
              { key: 'D', value: '32', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '第一电子层（K层）最多容纳2个电子。'
          },
          {
            id: 'q_chemistry_046',
            question: '第二电子层最多容纳的电子数是（ ）',
            options: [
              { key: 'A', value: '2', explanation: '' },
              { key: 'B', value: '8', explanation: '' },
              { key: 'C', value: '18', explanation: '' },
              { key: 'D', value: '32', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '第二电子层（L层）最多容纳8个电子。'
          },
          {
            id: 'q_chemistry_047',
            question: '第三电子层最多容纳的电子数是（ ）',
            options: [
              { key: 'A', value: '2', explanation: '' },
              { key: 'B', value: '8', explanation: '' },
              { key: 'C', value: '18', explanation: '' },
              { key: 'D', value: '32', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '第三电子层（M层）最多容纳18个电子。'
          },
          {
            id: 'q_chemistry_048',
            question: '原子序数等于（ ）',
            options: [
              { key: 'A', value: '质子数', explanation: '' },
              { key: 'B', value: '中子数', explanation: '' },
              { key: 'C', value: '电子数', explanation: '' },
              { key: 'D', value: '质量数', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '原子序数等于质子数。'
          },
          {
            id: 'q_chemistry_049',
            question: '核素的定义是（ ）',
            options: [
              { key: 'A', value: '具有一定质子数和中子数的原子', explanation: '' },
              { key: 'B', value: '具有一定质子数的原子', explanation: '' },
              { key: 'C', value: '具有一定中子数的原子', explanation: '' },
              { key: 'D', value: '具有一定电子数的原子', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '核素是具有一定质子数和中子数的原子。'
          },
          {
            id: 'q_chemistry_050',
            question: '同位素的定义是（ ）',
            options: [
              { key: 'A', value: '质子数相同，中子数不同的原子', explanation: '' },
              { key: 'B', value: '质子数不同，中子数相同的原子', explanation: '' },
              { key: 'C', value: '质子数和中子数都相同的原子', explanation: '' },
              { key: 'D', value: '质子数和中子数都不同的原子', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '同位素是质子数相同，中子数不同的原子。'
          }
        ]
      },
      {
        levelNumber: 6,
        name: '第六章 元素周期律',
        description: '高一化学第六单元',
        difficulty: 3,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chemistry_051',
            question: '元素周期表中，周期数等于（ ）',
            options: [
              { key: 'A', value: '电子层数', explanation: '' },
              { key: 'B', value: '最外层电子数', explanation: '' },
              { key: 'C', value: '质子数', explanation: '' },
              { key: 'D', value: '中子数', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '周期数等于电子层数。'
          },
          {
            id: 'q_chemistry_052',
            question: '元素周期表中，族序数等于（ ）',
            options: [
              { key: 'A', value: '电子层数', explanation: '' },
              { key: 'B', value: '最外层电子数', explanation: '' },
              { key: 'C', value: '质子数', explanation: '' },
              { key: 'D', value: '中子数', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '主族序数等于最外层电子数。'
          },
          {
            id: 'q_chemistry_053',
            question: '同周期元素从左到右，原子半径（ ）',
            options: [
              { key: 'A', value: '逐渐减小', explanation: '' },
              { key: 'B', value: '逐渐增大', explanation: '' },
              { key: 'C', value: '不变', explanation: '' },
              { key: 'D', value: '先增大后减小', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '同周期元素从左到右，核电荷数增大，原子半径逐渐减小。'
          },
          {
            id: 'q_chemistry_054',
            question: '同主族元素从上到下，原子半径（ ）',
            options: [
              { key: 'A', value: '逐渐减小', explanation: '' },
              { key: 'B', value: '逐渐增大', explanation: '' },
              { key: 'C', value: '不变', explanation: '' },
              { key: 'D', value: '先增大后减小', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '同主族元素从上到下，电子层数增多，原子半径逐渐增大。'
          },
          {
            id: 'q_chemistry_055',
            question: '同周期元素从左到右，金属性（ ）',
            options: [
              { key: 'A', value: '逐渐减弱', explanation: '' },
              { key: 'B', value: '逐渐增强', explanation: '' },
              { key: 'C', value: '不变', explanation: '' },
              { key: 'D', value: '先增强后减弱', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '同周期元素从左到右，金属性逐渐减弱。'
          },
          {
            id: 'q_chemistry_056',
            question: '同主族元素从上到下，金属性（ ）',
            options: [
              { key: 'A', value: '逐渐减弱', explanation: '' },
              { key: 'B', value: '逐渐增强', explanation: '' },
              { key: 'C', value: '不变', explanation: '' },
              { key: 'D', value: '先增强后减弱', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '同主族元素从上到下，金属性逐渐增强。'
          },
          {
            id: 'q_chemistry_057',
            question: '同周期元素从左到右，非金属性（ ）',
            options: [
              { key: 'A', value: '逐渐减弱', explanation: '' },
              { key: 'B', value: '逐渐增强', explanation: '' },
              { key: 'C', value: '不变', explanation: '' },
              { key: 'D', value: '先增强后减弱', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '同周期元素从左到右，非金属性逐渐增强。'
          },
          {
            id: 'q_chemistry_058',
            question: '同主族元素从上到下，非金属性（ ）',
            options: [
              { key: 'A', value: '逐渐减弱', explanation: '' },
              { key: 'B', value: '逐渐增强', explanation: '' },
              { key: 'C', value: '不变', explanation: '' },
              { key: 'D', value: '先增强后减弱', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '同主族元素从上到下，非金属性逐渐减弱。'
          },
          {
            id: 'q_chemistry_059',
            question: '碱金属元素位于周期表的（ ）',
            options: [
              { key: 'A', value: '第ⅠA族', explanation: '' },
              { key: 'B', value: '第ⅡA族', explanation: '' },
              { key: 'C', value: '第ⅦA族', explanation: '' },
              { key: 'D', value: '第Ⅷ族', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '碱金属元素位于周期表的第ⅠA族。'
          },
          {
            id: 'q_chemistry_060',
            question: '卤族元素位于周期表的（ ）',
            options: [
              { key: 'A', value: '第ⅠA族', explanation: '' },
              { key: 'B', value: '第ⅡA族', explanation: '' },
              { key: 'C', value: '第ⅦA族', explanation: '' },
              { key: 'D', value: '第Ⅷ族', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '卤族元素位于周期表的第ⅦA族。'
          }
        ]
      },
      {
        levelNumber: 7,
        name: '第七章 化学键',
        description: '高一化学第七单元',
        difficulty: 3,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chemistry_061',
            question: '化学键的类型不包括（ ）',
            options: [
              { key: 'A', value: '离子键', explanation: '' },
              { key: 'B', value: '共价键', explanation: '' },
              { key: 'C', value: '金属键', explanation: '' },
              { key: 'D', value: '氢键', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '氢键不属于化学键，是一种分子间作用力。'
          },
          {
            id: 'q_chemistry_062',
            question: '离子键的形成条件是（ ）',
            options: [
              { key: 'A', value: '活泼金属与活泼非金属', explanation: '' },
              { key: 'B', value: '非金属与非金属', explanation: '' },
              { key: 'C', value: '金属与金属', explanation: '' },
              { key: 'D', value: '任何元素之间', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '离子键通常形成于活泼金属和活泼非金属之间。'
          },
          {
            id: 'q_chemistry_063',
            question: '共价键的形成条件是（ ）',
            options: [
              { key: 'A', value: '活泼金属与活泼非金属', explanation: '' },
              { key: 'B', value: '非金属与非金属', explanation: '' },
              { key: 'C', value: '金属与金属', explanation: '' },
              { key: 'D', value: '任何元素之间', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '共价键通常形成于非金属元素之间。'
          },
          {
            id: 'q_chemistry_064',
            question: '下列化合物中含有离子键的是（ ）',
            options: [
              { key: 'A', value: 'HCl', explanation: '' },
              { key: 'B', value: 'NaCl', explanation: '' },
              { key: 'C', value: 'H₂O', explanation: '' },
              { key: 'D', value: 'CH₄', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'NaCl是离子化合物，含有离子键。'
          },
          {
            id: 'q_chemistry_065',
            question: '下列化合物中只含有共价键的是（ ）',
            options: [
              { key: 'A', value: 'NaCl', explanation: '' },
              { key: 'B', value: 'NaOH', explanation: '' },
              { key: 'C', value: 'H₂O', explanation: '' },
              { key: 'D', value: 'CaO', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'H₂O是共价化合物，只含有共价键。'
          },
          {
            id: 'q_chemistry_066',
            question: '极性共价键和非极性共价键的区别是（ ）',
            options: [
              { key: 'A', value: '共用电子对是否偏移', explanation: '' },
              { key: 'B', value: '键长不同', explanation: '' },
              { key: 'C', value: '键能不同', explanation: '' },
              { key: 'D', value: '成键原子不同', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '极性共价键中共用电子对发生偏移，非极性共价键中共用电子对不偏移。'
          },
          {
            id: 'q_chemistry_067',
            question: '下列物质中含有非极性共价键的是（ ）',
            options: [
              { key: 'A', value: 'H₂', explanation: '' },
              { key: 'B', value: 'HCl', explanation: '' },
              { key: 'C', value: 'H₂O', explanation: '' },
              { key: 'D', value: 'NH₃', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'H₂分子中两个氢原子形成非极性共价键。'
          },
          {
            id: 'q_chemistry_068',
            question: '共价化合物的特点是（ ）',
            options: [
              { key: 'A', value: '由共价键构成', explanation: '' },
              { key: 'B', value: '由离子键构成', explanation: '' },
              { key: 'C', value: '熔融状态下能导电', explanation: '' },
              { key: 'D', value: '固态时是离子晶体', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '共价化合物由共价键构成。'
          },
          {
            id: 'q_chemistry_069',
            question: '离子化合物的特点是（ ）',
            options: [
              { key: 'A', value: '由共价键构成', explanation: '' },
              { key: 'B', value: '由离子键构成', explanation: '' },
              { key: 'C', value: '熔融状态下不能导电', explanation: '' },
              { key: 'D', value: '固态时是分子晶体', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '离子化合物由离子键构成。'
          },
          {
            id: 'q_chemistry_070',
            question: '化学反应的实质是（ ）',
            options: [
              { key: 'A', value: '化学键的断裂和形成', explanation: '' },
              { key: 'B', value: '原子的重新排列', explanation: '' },
              { key: 'C', value: '电子的转移', explanation: '' },
              { key: 'D', value: '物质的状态变化', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '化学反应的实质是旧化学键的断裂和新化学键的形成。'
          }
        ]
      },
      {
        levelNumber: 8,
        name: '第八章 化学反应与能量',
        description: '高一化学第八单元',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chemistry_071',
            question: '化学反应中能量变化的主要原因是（ ）',
            options: [
              { key: 'A', value: '化学键的断裂和形成', explanation: '' },
              { key: 'B', value: '物质的质量变化', explanation: '' },
              { key: 'C', value: '物质的状态变化', explanation: '' },
              { key: 'D', value: '温度的变化', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '化学反应中能量变化的主要原因是化学键的断裂和形成。'
          },
          {
            id: 'q_chemistry_072',
            question: '放热反应的特点是（ ）',
            options: [
              { key: 'A', value: '反应物总能量大于生成物总能量', explanation: '' },
              { key: 'B', value: '反应物总能量小于生成物总能量', explanation: '' },
              { key: 'C', value: '反应物总能量等于生成物总能量', explanation: '' },
              { key: 'D', value: '与能量无关', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '放热反应中反应物总能量大于生成物总能量。'
          },
          {
            id: 'q_chemistry_073',
            question: '吸热反应的特点是（ ）',
            options: [
              { key: 'A', value: '反应物总能量大于生成物总能量', explanation: '' },
              { key: 'B', value: '反应物总能量小于生成物总能量', explanation: '' },
              { key: 'C', value: '反应物总能量等于生成物总能量', explanation: '' },
              { key: 'D', value: '与能量无关', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '吸热反应中反应物总能量小于生成物总能量。'
          },
          {
            id: 'q_chemistry_074',
            question: '燃烧反应属于（ ）',
            options: [
              { key: 'A', value: '放热反应', explanation: '' },
              { key: 'B', value: '吸热反应', explanation: '' },
              { key: 'C', value: '既不放热也不吸热', explanation: '' },
              { key: 'D', value: '无法判断', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '燃烧反应是放热反应。'
          },
          {
            id: 'q_chemistry_075',
            question: '中和反应属于（ ）',
            options: [
              { key: 'A', value: '放热反应', explanation: '' },
              { key: 'B', value: '吸热反应', explanation: '' },
              { key: 'C', value: '既不放热也不吸热', explanation: '' },
              { key: 'D', value: '无法判断', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '中和反应是放热反应。'
          },
          {
            id: 'q_chemistry_076',
            question: '原电池的构成条件不包括（ ）',
            options: [
              { key: 'A', value: '两个活泼性不同的电极', explanation: '' },
              { key: 'B', value: '电解质溶液', explanation: '' },
              { key: 'C', value: '形成闭合回路', explanation: '' },
              { key: 'D', value: '光照条件', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '光照条件不是原电池的构成条件。'
          },
          {
            id: 'q_chemistry_077',
            question: '原电池中，负极发生的反应是（ ）',
            options: [
              { key: 'A', value: '氧化反应', explanation: '' },
              { key: 'B', value: '还原反应', explanation: '' },
              { key: 'C', value: '中和反应', explanation: '' },
              { key: 'D', value: '分解反应', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '原电池中，负极发生氧化反应。'
          },
          {
            id: 'q_chemistry_078',
            question: '原电池中，正极发生的反应是（ ）',
            options: [
              { key: 'A', value: '氧化反应', explanation: '' },
              { key: 'B', value: '还原反应', explanation: '' },
              { key: 'C', value: '中和反应', explanation: '' },
              { key: 'D', value: '分解反应', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '原电池中，正极发生还原反应。'
          },
          {
            id: 'q_chemistry_079',
            question: '化学能与电能的转化关系是（ ）',
            options: [
              { key: 'A', value: '原电池将化学能转化为电能', explanation: '' },
              { key: 'B', value: '原电池将电能转化为化学能', explanation: '' },
              { key: 'C', value: '电解池将化学能转化为电能', explanation: '' },
              { key: 'D', value: '两者没有关系', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '原电池将化学能转化为电能。'
          },
          {
            id: 'q_chemistry_080',
            question: '下列反应属于吸热反应的是（ ）',
            options: [
              { key: 'A', value: 'C + O₂ = CO₂', explanation: '' },
              { key: 'B', value: 'CaO + H₂O = Ca(OH)₂', explanation: '' },
              { key: 'C', value: 'C + CO₂ = 2CO', explanation: '' },
              { key: 'D', value: 'NaOH + HCl = NaCl + H₂O', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '碳与二氧化碳反应是吸热反应。'
          }
        ]
      },
      {
        levelNumber: 9,
        name: '第九章 化学反应速率和化学平衡',
        description: '高一化学第九单元',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chemistry_081',
            question: '化学反应速率的定义是（ ）',
            options: [
              { key: 'A', value: '单位时间内反应物浓度的减少或生成物浓度的增加', explanation: '' },
              { key: 'B', value: '单位时间内反应物质量的减少', explanation: '' },
              { key: 'C', value: '单位时间内生成物质量的增加', explanation: '' },
              { key: 'D', value: '反应物消耗的时间', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '化学反应速率是单位时间内反应物浓度的减少或生成物浓度的增加。'
          },
          {
            id: 'q_chemistry_082',
            question: '影响化学反应速率的因素不包括（ ）',
            options: [
              { key: 'A', value: '浓度', explanation: '' },
              { key: 'B', value: '温度', explanation: '' },
              { key: 'C', value: '压强', explanation: '' },
              { key: 'D', value: '物质的量', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '物质的量不是影响化学反应速率的因素。'
          },
          {
            id: 'q_chemistry_083',
            question: '增大反应物浓度，化学反应速率（ ）',
            options: [
              { key: 'A', value: '增大', explanation: '' },
              { key: 'B', value: '减小', explanation: '' },
              { key: 'C', value: '不变', explanation: '' },
              { key: 'D', value: '无法判断', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '增大反应物浓度，化学反应速率增大。'
          },
          {
            id: 'q_chemistry_084',
            question: '升高温度，化学反应速率（ ）',
            options: [
              { key: 'A', value: '增大', explanation: '' },
              { key: 'B', value: '减小', explanation: '' },
              { key: 'C', value: '不变', explanation: '' },
              { key: 'D', value: '无法判断', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '升高温度，化学反应速率增大。'
          },
          {
            id: 'q_chemistry_085',
            question: '催化剂对化学反应速率的影响是（ ）',
            options: [
              { key: 'A', value: '增大反应速率', explanation: '' },
              { key: 'B', value: '减小反应速率', explanation: '' },
              { key: 'C', value: '不影响反应速率', explanation: '' },
              { key: 'D', value: '只影响吸热反应', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '催化剂能增大化学反应速率。'
          },
          {
            id: 'q_chemistry_086',
            question: '化学平衡的特点不包括（ ）',
            options: [
              { key: 'A', value: '正反应速率等于逆反应速率', explanation: '' },
              { key: 'B', value: '各物质浓度保持不变', explanation: '' },
              { key: 'C', value: '反应停止', explanation: '' },
              { key: 'D', value: '动态平衡', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '化学平衡是动态平衡，反应并没有停止。'
          },
          {
            id: 'q_chemistry_087',
            question: '化学平衡状态的标志是（ ）',
            options: [
              { key: 'A', value: '正反应速率等于逆反应速率', explanation: '' },
              { key: 'B', value: '反应物完全消耗', explanation: '' },
              { key: 'C', value: '生成物浓度最大', explanation: '' },
              { key: 'D', value: '反应停止', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '化学平衡状态的标志是正反应速率等于逆反应速率。'
          },
          {
            id: 'q_chemistry_088',
            question: '勒夏特列原理的内容是（ ）',
            options: [
              { key: 'A', value: '如果改变影响平衡的条件，平衡将向着减弱这种改变的方向移动', explanation: '' },
              { key: 'B', value: '平衡状态不随条件改变', explanation: '' },
              { key: 'C', value: '平衡状态只随温度改变', explanation: '' },
              { key: 'D', value: '平衡状态只随浓度改变', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '勒夏特列原理指出，如果改变影响平衡的条件，平衡将向着减弱这种改变的方向移动。'
          },
          {
            id: 'q_chemistry_089',
            question: '对于可逆反应N₂ + 3H₂ ⇌ 2NH₃，增大压强，平衡（ ）',
            options: [
              { key: 'A', value: '向正反应方向移动', explanation: '' },
              { key: 'B', value: '向逆反应方向移动', explanation: '' },
              { key: 'C', value: '不移动', explanation: '' },
              { key: 'D', value: '无法判断', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '增大压强，平衡向气体体积减小的方向移动，即向正反应方向移动。'
          },
          {
            id: 'q_chemistry_090',
            question: '对于可逆反应2SO₂ + O₂ ⇌ 2SO₃（放热反应），升高温度，平衡（ ）',
            options: [
              { key: 'A', value: '向正反应方向移动', explanation: '' },
              { key: 'B', value: '向逆反应方向移动', explanation: '' },
              { key: 'C', value: '不移动', explanation: '' },
              { key: 'D', value: '无法判断', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '升高温度，平衡向吸热反应方向移动，即向逆反应方向移动。'
          }
        ]
      },
      {
        levelNumber: 10,
        name: '第十章 有机化合物',
        description: '高一化学第十单元',
        difficulty: 5,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_chemistry_091',
            question: '有机化合物的定义是（ ）',
            options: [
              { key: 'A', value: '含碳化合物（除CO、CO₂、碳酸盐等）', explanation: '' },
              { key: 'B', value: '不含碳的化合物', explanation: '' },
              { key: 'C', value: '所有含碳化合物', explanation: '' },
              { key: 'D', value: '只含碳和氢的化合物', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '有机化合物通常指含碳化合物（除CO、CO₂、碳酸盐等少数例外）。'
          },
          {
            id: 'q_chemistry_092',
            question: '最简单的有机物是（ ）',
            options: [
              { key: 'A', value: '甲烷', explanation: '' },
              { key: 'B', value: '乙烷', explanation: '' },
              { key: 'C', value: '丙烷', explanation: '' },
              { key: 'D', value: '丁烷', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '甲烷是最简单的有机物。'
          },
          {
            id: 'q_chemistry_093',
            question: '甲烷的分子式是（ ）',
            options: [
              { key: 'A', value: 'CH₄', explanation: '' },
              { key: 'B', value: 'C₂H₆', explanation: '' },
              { key: 'C', value: 'C₃H₈', explanation: '' },
              { key: 'D', value: 'C₄H₁₀', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '甲烷的分子式是CH₄。'
          },
          {
            id: 'q_chemistry_094',
            question: '甲烷的空间结构是（ ）',
            options: [
              { key: 'A', value: '正四面体', explanation: '' },
              { key: 'B', value: '平面正方形', explanation: '' },
              { key: 'C', value: '直线形', explanation: '' },
              { key: 'D', value: '三角形', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '甲烷的空间结构是正四面体。'
          },
          {
            id: 'q_chemistry_095',
            question: '甲烷与氯气的反应属于（ ）',
            options: [
              { key: 'A', value: '取代反应', explanation: '' },
              { key: 'B', value: '加成反应', explanation: '' },
              { key: 'C', value: '氧化反应', explanation: '' },
              { key: 'D', value: '还原反应', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '甲烷与氯气在光照条件下发生取代反应。'
          },
          {
            id: 'q_chemistry_096',
            question: '乙烯的分子式是（ ）',
            options: [
              { key: 'A', value: 'C₂H₄', explanation: '' },
              { key: 'B', value: 'C₂H₆', explanation: '' },
              { key: 'C', value: 'C₃H₆', explanation: '' },
              { key: 'D', value: 'C₃H₈', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '乙烯的分子式是C₂H₄。'
          },
          {
            id: 'q_chemistry_097',
            question: '乙烯的官能团是（ ）',
            options: [
              { key: 'A', value: '碳碳双键', explanation: '' },
              { key: 'B', value: '碳碳三键', explanation: '' },
              { key: 'C', value: '羟基', explanation: '' },
              { key: 'D', value: '羧基', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '乙烯的官能团是碳碳双键。'
          },
          {
            id: 'q_chemistry_098',
            question: '乙烯与溴水的反应属于（ ）',
            options: [
              { key: 'A', value: '取代反应', explanation: '' },
              { key: 'B', value: '加成反应', explanation: '' },
              { key: 'C', value: '氧化反应', explanation: '' },
              { key: 'D', value: '还原反应', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '乙烯与溴水发生加成反应。'
          },
          {
            id: 'q_chemistry_099',
            question: '乙醇的分子式是（ ）',
            options: [
              { key: 'A', value: 'C₂H₅OH', explanation: '' },
              { key: 'B', value: 'CH₃OH', explanation: '' },
              { key: 'C', value: 'C₃H₇OH', explanation: '' },
              { key: 'D', value: 'C₄H₉OH', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '乙醇的分子式是C₂H₅OH。'
          },
          {
            id: 'q_chemistry_100',
            question: '乙醇的官能团是（ ）',
            options: [
              { key: 'A', value: '羟基', explanation: '' },
              { key: 'B', value: '羧基', explanation: '' },
              { key: 'C', value: '碳碳双键', explanation: '' },
              { key: 'D', value: '醛基', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '乙醇的官能团是羟基（-OH）。'
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