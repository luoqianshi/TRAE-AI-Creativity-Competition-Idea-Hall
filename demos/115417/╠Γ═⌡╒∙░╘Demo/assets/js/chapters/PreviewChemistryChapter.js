class PreviewChemistryChapter extends PreviewChapter {
  constructor() {
    super('preview_chemistry', '化学', 'fa-flask', '#1abc9c');
    this.initUnits();
  }

  initUnits() {
    this.units = [
      {
        unitNumber: 1,
        name: '第一章 物质及其变化',
        description: '物质的分类、离子反应与氧化还原反应',
        knowledgePoints: [
          {
            id: 'kp_chemistry_001',
            title: '物质的分类',
            content: '物质可以根据不同的标准进行分类：\n\n- 纯净物和混合物：由一种物质组成的是纯净物，由两种或两种以上物质组成的是混合物。\n- 单质和化合物：由同种元素组成的纯净物是单质，由不同种元素组成的纯净物是化合物。\n- 氧化物、酸、碱、盐：化合物可分为氧化物、酸、碱、盐等。\n\n电解质与非电解质：\n- 电解质：在水溶液里或熔融状态下能够导电的化合物（酸、碱、盐等）\n- 非电解质：在水溶液里和熔融状态下都不能导电的化合物（蔗糖、酒精等）'
          },
          {
            id: 'kp_chemistry_002',
            title: '离子反应',
            content: '离子反应：电解质在溶液中的反应实质上是离子之间的反应。\n\n离子方程式书写步骤：\n1. 写：写出正确的化学方程式\n2. 拆：把易溶于水、易电离的物质拆成离子形式\n3. 删：删去两边不参加反应的离子（即等号两边相同的离子）\n4. 查：检查原子守恒和电荷守恒\n\n离子反应发生的条件：生成沉淀、放出气体、生成水（或弱电解质）'
          },
          {
            id: 'kp_chemistry_003',
            title: '氧化还原反应',
            content: '氧化还原反应：有电子转移（得失或偏移）的反应。\n\n基本概念：\n- 氧化反应：失去电子（化合价升高）的反应\n- 还原反应：得到电子（化合价降低）的反应\n- 氧化剂：得到电子的物质（化合价降低），具有氧化性，被还原\n- 还原剂：失去电子的物质（化合价升高），具有还原性，被氧化\n\n氧化还原反应的特征：元素化合价发生变化'
          }
        ],
        questions: [
          {
            id: 'pq_chemistry_001',
            knowledgePointId: 'kp_chemistry_001',
            question: '下列物质分类正确的是（ ）',
            options: [
              { key: 'A', value: '盐酸是纯净物', explanation: '盐酸是氯化氢的水溶液，是混合物，不是纯净物，不正确。' },
              { key: 'B', value: '石墨是单质', explanation: '石墨是由碳元素组成的纯净物，是单质，正确。' },
              { key: 'C', value: '烧碱（NaOH）是碱', explanation: 'NaOH在水溶液中电离出的阴离子全是OH⁻，是碱，正确。' },
              { key: 'D', value: '硫酸铜晶体（CuSO₄·5H₂O）是混合物', explanation: '硫酸铜晶体有固定的化学组成，是纯净物，不是混合物，不正确。' },
              { key: 'E', value: '氯化钠溶液是电解质', explanation: '氯化钠溶液是混合物，电解质必须是化合物，NaCl固体是电解质，溶液不是，不正确。' }
            ],
            correctAnswer: 'B',
            explanation: '逐一分析：\n- A：盐酸是混合物 ✗\n- B：石墨是碳单质 ✓\n- C：NaOH是碱 ✗\n- D：CuSO₄·5H₂O是纯净物（结晶水合物） ✗\n- E：溶液是混合物，不是电解质 ✗\n\n选B。'
          },
          {
            id: 'pq_chemistry_002',
            knowledgePointId: 'kp_chemistry_002',
            question: '下列离子方程式书写正确的是（ ）',
            options: [
              { key: 'A', value: '铁与稀盐酸反应：2Fe + 6H⁺ = 2Fe³⁺ + 3H₂↑', explanation: '铁与稀盐酸反应生成Fe²⁺，不是Fe³⁺，应为Fe + 2H⁺ = Fe²⁺ + H₂↑，不正确。' },
              { key: 'B', value: '碳酸钙与盐酸反应：CaCO₃ + 2H⁺ = Ca²⁺ + H₂O + CO₂↑', explanation: 'CaCO₃难溶于水，不能拆；生成CO₂和H₂O，正确。' },
              { key: 'C', value: '氢氧化钡与硫酸反应：Ba²⁺ + SO₄²⁻ = BaSO₄↓', explanation: '漏掉了H⁺和OH⁻的反应，正确应为Ba²⁺ + 2OH⁻ + 2H⁺ + SO₄²⁻ = BaSO₄↓ + 2H₂O，不正确。' },
              { key: 'D', value: '钠与水反应：Na + H₂O = Na⁺ + OH⁻ + H₂↑', explanation: '未配平，正确应为2Na + 2H₂O = 2Na⁺ + 2OH⁻ + H₂↑，不正确。' },
              { key: 'E', value: '硝酸银与氯化钠反应：Ag⁺ + Cl⁻ = AgCl↓', explanation: 'AgNO₃和NaCl在水中完全电离，Ag⁺+Cl⁻=AgCl↓，正确。' }
            ],
            correctAnswer: 'B',
            explanation: '逐一检查：\n- A：铁与盐酸生成Fe²⁺，不是Fe³⁺ ✗\n- B：CaCO₃不拆，正确 ✓\n- C：漏了H⁺+OH⁻→H₂O ✗\n- D：未配平 ✗\n- E：正确 ✗\n\n选B。'
          },
          {
            id: 'pq_chemistry_003',
            knowledgePointId: 'kp_chemistry_003',
            question: '在反应2FeCl₃ + Cu = 2FeCl₂ + CuCl₂中，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: 'FeCl₃是还原剂', explanation: 'FeCl₃中Fe化合价从+3降为+2，得到电子，是氧化剂，不是还原剂。' },
              { key: 'B', value: 'Cu是还原剂', explanation: 'Cu化合价从0升为+2，失去电子，是还原剂，正确。' },
              { key: 'C', value: 'Fe元素的化合价从+3降为+2，被还原', explanation: '化合价降低，得到电子，被还原，正确。' },
              { key: 'D', value: 'Cu元素的化合价从0升为+2，被氧化', explanation: '化合价升高，失去电子，被氧化，正确。' },
              { key: 'E', value: 'FeCl₃具有氧化性', explanation: 'FeCl₃是氧化剂，具有氧化性，正确。' }
            ],
            correctAnswer: 'B',
            explanation: '分析反应2FeCl₃ + Cu = 2FeCl₂ + CuCl₂：\n- Fe：+3 → +2（化合价降低，被还原，FeCl₃是氧化剂，具有氧化性）\n- Cu：0 → +2（化合价升高，被氧化，Cu是还原剂）\n\n逐一判断：\n- A：FeCl₃是氧化剂 ✗\n- B：Cu是还原剂 ✓\n- C：Fe被还原 ✗\n- D：Cu被氧化 ✗\n- E：FeCl₃有氧化性 ✗\n\n选B。'
          }
        ]
      },
      {
        unitNumber: 2,
        name: '第二章 海水中的重要元素——钠和氯',
        description: '钠的性质、氯及其化合物与物质的量',
        knowledgePoints: [
          {
            id: 'kp_chemistry_004',
            title: '钠的性质',
            content: '钠的物理性质：银白色金属，质地柔软（可用小刀切割），密度比水小（0.97g/cm³），熔点低（97.8°C）。\n\n钠的化学性质：\n1. 与氧气反应：\n   - 常温：4Na + O₂ = 2Na₂O（氧化钠，白色）\n   - 加热或点燃：2Na + O₂ = Na₂O₂（过氧化钠，淡黄色）\n2. 与水反应：2Na + 2H₂O = 2NaOH + H₂↑\n   - 现象：浮（密度比水小）、熔（反应放热，熔点低）、游（产生气体推动）、嘶（产生气体声）、红（加酚酞后溶液变红）'
          },
          {
            id: 'kp_chemistry_005',
            title: '氯及其化合物',
            content: '氯气的性质：\n1. 物理性质：黄绿色气体，有刺激性气味，有毒，密度比空气大，能溶于水。\n2. 化学性质：\n   - 与金属反应：2Na + Cl₂ = 2NaCl；2Fe + 3Cl₂ = 2FeCl₃\n   - 与非金属反应：H₂ + Cl₂ = 2HCl\n   - 与水反应：Cl₂ + H₂O = HCl + HClO（次氯酸有漂白性）\n   - 与碱反应：Cl₂ + 2NaOH = NaCl + NaClO + H₂O\n\n漂白粉：主要成分是Ca(ClO)₂和CaCl₂，有效成分是Ca(ClO)₂。'
          },
          {
            id: 'kp_chemistry_006',
            title: '物质的量',
            content: '物质的量（n）：表示含有一定数目粒子的集合体，单位是摩尔（mol）。\n\n阿伏加德罗常数（N_A）：1mol任何粒子所含的粒子数，约为6.02×10²³ mol⁻¹。\n\n摩尔质量（M）：单位物质的量的物质所具有的质量，单位g/mol。数值上等于该物质的相对分子质量（或相对原子质量）。\n\n公式：n = m/M = N/N_A'
          }
        ],
        questions: [
          {
            id: 'pq_chemistry_004',
            knowledgePointId: 'kp_chemistry_004',
            question: '将一小块金属钠投入CuSO₄溶液中，观察到的现象是（ ）',
            options: [
              { key: 'A', value: '钠浮在液面上并熔化成小球', explanation: '钠密度比水小，浮在液面上；反应放热，钠熔点低，熔化成小球，正确。' },
              { key: 'B', value: '钠在液面上四处游动', explanation: '反应产生的氢气推动钠球四处游动，正确。' },
              { key: 'C', value: '溶液中产生蓝色沉淀', explanation: 'NaOH与CuSO₄反应生成Cu(OH)₂蓝色沉淀，正确。' },
              { key: 'D', value: '有红色固体析出', explanation: '钠先与水反应，生成的NaOH再与CuSO₄反应生成Cu(OH)₂沉淀，不会置换出Cu，不正确。' },
              { key: 'E', value: '产生无色无味气体', explanation: '钠与水反应生成H₂，氢气无色无味，正确。' }
            ],
            correctAnswer: 'A',
            explanation: '钠投入CuSO₄溶液中，先与水反应：\n- 2Na + 2H₂O = 2NaOH + H₂↑\n- 然后NaOH与CuSO₄反应：2NaOH + CuSO₄ = Cu(OH)₂↓ + Na₂SO₄\n\n现象：\n- A：浮熔 ✓\n- B：游动 ✗\n- C：Cu(OH)₂蓝色沉淀 ✗\n- D：不会置换出Cu ✗\n- E：H₂无色无味 ✗\n\n选A。'
          },
          {
            id: 'pq_chemistry_005',
            knowledgePointId: 'kp_chemistry_005',
            question: '关于氯气和氯水的性质，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '氯气是黄绿色气体，有刺激性气味', explanation: '氯气是黄绿色气体，有刺激性气味，正确。' },
              { key: 'B', value: '氯水中的次氯酸具有漂白性', explanation: 'Cl₂ + H₂O = HCl + HClO，HClO具有强氧化性，有漂白性，正确。' },
              { key: 'C', value: '干燥的氯气没有漂白性', explanation: '氯气本身没有漂白性，只有与水反应生成的HClO才有漂白性，正确。' },
              { key: 'D', value: '氯气与铁反应生成FeCl₂', explanation: '氯气与铁反应生成FeCl₃（氯化铁），不是FeCl₂，不正确。' },
              { key: 'E', value: '氯水中含有Cl₂、H₂O、HClO、H⁺、Cl⁻、ClO⁻等多种微粒', explanation: '氯水是混合物，含有多种微粒，正确。' }
            ],
            correctAnswer: 'A',
            explanation: '\n- A：氯气物理性质 ✓\n- B：HClO有漂白性 ✗\n- C：干燥Cl₂无漂白性 ✗\n- D：2Fe + 3Cl₂ = 2FeCl₃，不是FeCl₂ ✗\n- E：氯水成分复杂 ✗\n\n选A。'
          },
          {
            id: 'pq_chemistry_006',
            knowledgePointId: 'kp_chemistry_006',
            question: '关于物质的量，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '1mol H₂O的质量是18g', explanation: 'M(H₂O)=18g/mol，m=nM=1×18=18g，正确。' },
              { key: 'B', value: '1mol O₂含有的分子数约为6.02×10²³', explanation: '1mol任何物质都含有约6.02×10²³个粒子，正确。' },
              { key: 'C', value: '2mol NaCl的摩尔质量是117g/mol', explanation: '摩尔质量是物质本身的属性，NaCl的M=58.5g/mol，与物质的量无关，不正确。' },
              { key: 'D', value: '标准状况下，1mol任何气体的体积都约为22.4L', explanation: '标准状况（0°C，101kPa）下，1mol任何气体体积约为22.4L，正确。' },
              { key: 'E', value: '摩尔质量在数值上等于该物质的相对分子质量', explanation: '当摩尔质量以g/mol为单位时，数值上等于相对分子质量，正确。' }
            ],
            correctAnswer: 'A',
            explanation: '\n- A：m=1×18=18g ✓\n- B：1mol=6.02×10²³个 ✗\n- C：M是物质属性，与n无关，M(NaCl)=58.5g/mol ✗\n- D：标况下气体摩尔体积=22.4L/mol ✗\n- E：M(g/mol)数值=相对分子质量 ✗\n\n选A。'
          }
        ]
      },
      {
        unitNumber: 3,
        name: '第三章 铁 金属材料',
        description: '铁及其化合物的性质与检验',
        knowledgePoints: [
          {
            id: 'kp_chemistry_007',
            title: '铁及其化合物',
            content: '铁的性质：\n1. 物理性质：银白色金属，有金属光泽，能导电导热，能被磁铁吸引。\n2. 化学性质：\n   - 与非金属反应：3Fe + 2O₂（点燃）= Fe₃O₄；Fe + S（加热）= FeS\n   - 与酸反应：Fe + 2HCl = FeCl₂ + H₂↑；Fe + H₂SO₄ = FeSO₄ + H₂↑\n   - 与盐溶液反应：Fe + CuSO₄ = FeSO₄ + Cu\n\nFe²⁺与Fe³⁺的转化：\n- Fe²⁺→Fe³⁺：加氧化剂（如Cl₂、H₂O₂、HNO₃）\n- Fe³⁺→Fe²⁺：加还原剂（如Fe、Cu、I⁻）\n\nFe²⁺与Fe³⁺的检验：\n- Fe²⁺：加NaOH溶液，产生白色沉淀→灰绿色→红褐色\n- Fe³⁺：加KSCN溶液，溶液变为血红色'
          }
        ],
        questions: [
          {
            id: 'pq_chemistry_007',
            knowledgePointId: 'kp_chemistry_007',
            question: '关于铁及其化合物，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '铁在氧气中燃烧生成Fe₂O₃', explanation: '铁在氧气中燃烧生成Fe₃O₄（四氧化三铁），不是Fe₂O₃，不正确。' },
              { key: 'B', value: '铁与稀盐酸反应生成FeCl₃和H₂', explanation: '铁与稀盐酸（非氧化性酸）反应生成FeCl₂，不是FeCl₃，不正确。' },
              { key: 'C', value: 'Fe²⁺溶液为浅绿色，Fe³⁺溶液为黄色', explanation: 'Fe²⁺在水中呈浅绿色，Fe³⁺在水中呈黄色（棕黄色），正确。' },
              { key: 'D', value: '可用KSCN溶液检验Fe³⁺', explanation: 'Fe³⁺+3SCN⁻=Fe(SCN)₃（血红色），是检验Fe³⁺的特征反应，正确。' },
              { key: 'E', value: 'Fe与FeCl₃溶液反应可生成FeCl₂', explanation: 'Fe + 2FeCl₃ = 3FeCl₂，正确。' }
            ],
            correctAnswer: 'C',
            explanation: '\n- A：铁在氧气中燃烧生成Fe₃O₄ ✗\n- B：铁与稀盐酸生成FeCl₂ ✗\n- C：Fe²⁺浅绿色，Fe³⁺黄色 ✓\n- D：KSCN检验Fe³⁺ ✗\n- E：Fe+2Fe³⁺=3Fe²⁺ ✗\n\n选C。'
          }
        ]
      },
      {
        unitNumber: 4,
        name: '第四章 物质结构 元素周期律',
        description: '原子结构、元素周期表与元素周期律',
        knowledgePoints: [
          {
            id: 'kp_chemistry_008',
            title: '原子结构与元素周期表',
            content: '原子结构：\n- 原子由原子核（质子和中子）和核外电子组成\n- 核电荷数 = 质子数 = 核外电子数 = 原子序数\n- 质量数A = 质子数Z + 中子数N\n\n元素周期表的结构：\n- 周期：横行，共7个周期（1-3短周期，4-7长周期）\n- 族：纵行，共18列，分为主族（A）、副族（B）、第Ⅷ族、0族'
          },
          {
            id: 'kp_chemistry_009',
            title: '元素周期律',
            content: '元素周期律：元素的性质随着原子序数的递增而呈周期性变化。\n\n同周期（从左到右）：\n- 原子半径逐渐减小\n- 金属性逐渐减弱，非金属性逐渐增强\n- 最高价氧化物对应水化物的酸性逐渐增强，碱性逐渐减弱\n\n同主族（从上到下）：\n- 原子半径逐渐增大\n- 金属性逐渐增强，非金属性逐渐减弱\n- 最高价氧化物对应水化物的碱性逐渐增强，酸性逐渐减弱'
          }
        ],
        questions: [
          {
            id: 'pq_chemistry_008',
            knowledgePointId: 'kp_chemistry_008',
            question: '关于原子结构，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '原子核由质子和电子组成', explanation: '原子核由质子和中子组成，电子在核外，不正确。' },
              { key: 'B', value: '质量数 = 质子数 + 中子数', explanation: '质量数A = 质子数Z + 中子数N，正确。' },
              { key: 'C', value: '原子序数 = 核电荷数 = 质子数', explanation: '原子序数等于核电荷数，也等于质子数，正确。' },
              { key: 'D', value: '所有原子都由质子、中子和电子组成', explanation: '氢原子(¹H)没有中子，不正确。' },
              { key: 'E', value: '同位素是质子数相同、中子数不同的原子', explanation: '同位素的定义是质子数相同、中子数不同的同种元素的不同原子，正确。' }
            ],
            correctAnswer: 'B',
            explanation: '\n- A：原子核由质子和中子组成 ✗\n- B：A = Z + N ✓\n- C：原子序数=核电荷数=质子数 ✗\n- D：¹H没有中子 ✗\n- E：同位素定义 ✗\n\n选B。'
          },
          {
            id: 'pq_chemistry_009',
            knowledgePointId: 'kp_chemistry_009',
            question: '关于元素周期律，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '同周期从左到右，原子半径逐渐减小', explanation: '同周期从左到右，核电荷数增加，电子层数不变，原子核对核外电子的吸引力增强，原子半径减小，正确。' },
              { key: 'B', value: '同主族从上到下，非金属性逐渐增强', explanation: '同主族从上到下，电子层数增多，原子半径增大，原子核对最外层电子的吸引力减弱，非金属性减弱，不正确。' },
              { key: 'C', value: 'Na的金属性比Mg强', explanation: '同周期从左到右金属性减弱，Na在Mg左边，金属性更强，正确。' },
              { key: 'D', value: 'Cl的非金属性比S强', explanation: '同周期从左到右非金属性增强，Cl在S右边，非金属性更强，正确。' },
              { key: 'E', value: '原子半径：Na > Mg > Al', explanation: '同周期从左到右原子半径减小，Na、Mg、Al依次减小，正确。' }
            ],
            correctAnswer: 'A',
            explanation: '\n- A：同周期从左到右原子半径减小 ✓\n- B：同主族从上到下非金属性减弱 ✗\n- C：Na金属性>Mg ✗\n- D：Cl非金属性>S ✗\n- E：Na>Mg>Al（原子半径） ✗\n\n选A。'
          }
        ]
      }
    ];
  }
}