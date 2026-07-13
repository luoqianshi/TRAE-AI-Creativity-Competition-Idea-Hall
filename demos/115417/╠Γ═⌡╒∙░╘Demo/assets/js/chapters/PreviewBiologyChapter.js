class PreviewBiologyChapter extends PreviewChapter {
  constructor() {
    super('preview_biology', '生物', 'fa-leaf', '#27ae60');
    this.initUnits();
  }

  initUnits() {
    this.units = [
      {
        unitNumber: 1,
        name: '第一章 走近细胞',
        description: '细胞是生命活动的基本单位',
        knowledgePoints: [
          {
            id: 'kp_biology_001',
            title: '细胞学说与原核细胞和真核细胞',
            content: '细胞学说：\n- 细胞是一个有机体，一切动植物都由细胞发育而来，并由细胞和细胞产物所构成\n- 细胞是一个相对独立的单位，既有它自己的生命，又对与其他细胞共同组成的整体生命起作用\n- 新细胞可以从老细胞中产生\n\n原核细胞与真核细胞的区别：\n- 原核细胞：无核膜（拟核），无染色体（有环状DNA），只有核糖体一种细胞器，代表生物如细菌、蓝藻\n- 真核细胞：有核膜，有染色体，有多种细胞器，代表生物如动物、植物、真菌'
          }
        ],
        questions: [
          {
            id: 'pq_biology_001',
            knowledgePointId: 'kp_biology_001',
            question: '关于原核细胞和真核细胞，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '原核细胞没有细胞核', explanation: '原核细胞没有核膜包被的细胞核，但有拟核区域，正确。' },
              { key: 'B', value: '真核细胞有核膜包被的细胞核', explanation: '真核细胞有核膜，形成真正的细胞核，正确。' },
              { key: 'C', value: '原核细胞只有核糖体一种细胞器', explanation: '原核细胞只有核糖体，没有其他膜结构的细胞器，正确。' },
              { key: 'D', value: '蓝藻是原核生物', explanation: '蓝藻（蓝细菌）是原核生物，正确。' },
              { key: 'E', value: '酵母菌是原核生物', explanation: '酵母菌是真菌，属于真核生物，不是原核生物，不正确。' }
            ],
            correctAnswer: 'A',
            explanation: 'A：原核细胞无核膜（有拟核）✓\nB：真核细胞有核膜 ✗\nC：原核细胞只有核糖体 ✗\nD：蓝藻是原核生物 ✗\nE：酵母菌是真核生物 ✗\n\n选A。'
          }
        ]
      },
      {
        unitNumber: 2,
        name: '第二章 组成细胞的分子',
        description: '蛋白质与核酸',
        knowledgePoints: [
          {
            id: 'kp_biology_002',
            title: '蛋白质',
            content: '蛋白质的基本组成单位：氨基酸（约20种）\n\n氨基酸的结构通式：H₂N-CHR-COOH\n\n肽键：一个氨基酸的α-羧基与另一个氨基酸的α-氨基脱水缩合形成的化学键（-CO-NH-）。\n\n蛋白质的结构层次：\n- 一级结构：氨基酸的排列顺序\n- 二级结构：α-螺旋、β-折叠等\n- 三级结构：多肽链的空间折叠\n- 四级结构：多条多肽链的聚合\n\n蛋白质的功能：催化、运输、调节、免疫、结构组成等。'
          },
          {
            id: 'kp_biology_003',
            title: '核酸',
            content: '核酸的种类：DNA（脱氧核糖核酸）和RNA（核糖核酸）\n\n核酸的基本组成单位：核苷酸\n\nDNA与RNA的区别：\n- DNA：五碳糖为脱氧核糖，碱基为A、T、G、C，双螺旋结构，主要分布在细胞核\n- RNA：五碳糖为核糖，碱基为A、U、G、C，单链结构，主要分布在细胞质'
          }
        ],
        questions: [
          {
            id: 'pq_biology_002',
            knowledgePointId: 'kp_biology_002',
            question: '关于蛋白质，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '蛋白质的基本组成单位是氨基酸', explanation: '蛋白质是由氨基酸脱水缩合形成的多肽链，基本单位是氨基酸，正确。' },
              { key: 'B', value: '肽键的结构简式是-CO-NH-', explanation: '肽键是酰胺键，结构简式为-CO-NH-，正确。' },
              { key: 'C', value: '两个氨基酸脱水缩合形成二肽和水', explanation: '两个氨基酸缩合脱去一分子水，形成二肽，正确。' },
              { key: 'D', value: '蛋白质变性后，肽键被破坏', explanation: '蛋白质变性是空间结构被破坏，肽键不断裂，不正确。' },
              { key: 'E', value: '蛋白质结构的多样性决定了功能的多样性', explanation: '结构决定功能，蛋白质结构的多样性决定了其功能的多样性，正确。' }
            ],
            correctAnswer: 'A',
            explanation: 'A：基本单位是氨基酸 ✓\nB：肽键-CO-NH- ✗\nC：两分子氨基酸→二肽+H₂O ✗\nD：变性破坏空间结构，肽键不断裂 ✗\nE：结构多样性决定功能多样性 ✗\n\n选A。'
          },
          {
            id: 'pq_biology_003',
            knowledgePointId: 'kp_biology_003',
            question: '关于DNA和RNA，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: 'DNA的基本组成单位是脱氧核苷酸', explanation: 'DNA由脱氧核苷酸组成，正确。' },
              { key: 'B', value: 'RNA中含有碱基T（胸腺嘧啶）', explanation: 'RNA中含有U（尿嘧啶），不含T（胸腺嘧啶），T是DNA特有的碱基，不正确。' },
              { key: 'C', value: 'DNA通常为双链结构', explanation: 'DNA通常是双螺旋结构，正确。' },
              { key: 'D', value: 'DNA和RNA中都含有碱基A、G、C', explanation: 'DNA和RNA共有A（腺嘌呤）、G（鸟嘌呤）、C（胞嘧啶），正确。' },
              { key: 'E', value: '核酸是遗传信息的携带者', explanation: '核酸是生物体遗传信息的携带者，正确。' }
            ],
            correctAnswer: 'A',
            explanation: 'A：DNA基本单位是脱氧核苷酸 ✓\nB：RNA含U不含T ✗\nC：DNA是双链结构 ✗\nD：A、G、C是DNA和RNA共有的碱基 ✗\nE：核酸携带遗传信息 ✗\n\n选A。'
          }
        ]
      },
      {
        unitNumber: 3,
        name: '第三章 细胞的基本结构',
        description: '细胞膜与细胞器',
        knowledgePoints: [
          {
            id: 'kp_biology_004',
            title: '细胞膜与细胞器',
            content: '细胞膜：\n- 成分：主要由脂质（磷脂）和蛋白质组成，还有少量糖类\n- 结构：流动镶嵌模型（磷脂双分子层为基本骨架，蛋白质镶嵌、贯穿其中）\n- 功能：将细胞与外界环境分隔开；控制物质进出细胞；进行细胞间的信息交流\n\n主要细胞器：\n- 线粒体：有氧呼吸的主要场所，为细胞提供能量（"动力工厂"）\n- 叶绿体：光合作用的场所\n- 内质网：蛋白质加工和脂质合成的场所\n- 高尔基体：对蛋白质进行加工、分类和包装\n- 核糖体：蛋白质合成的场所\n- 溶酶体：分解衰老损伤的细胞器，吞噬并杀死入侵的病毒或细菌'
          }
        ],
        questions: [
          {
            id: 'pq_biology_004',
            knowledgePointId: 'kp_biology_004',
            question: '关于细胞器，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '线粒体是有氧呼吸的主要场所', explanation: '线粒体是细胞进行有氧呼吸的主要场所，正确。' },
              { key: 'B', value: '叶绿体是光合作用的场所', explanation: '叶绿体是光合作用的场所，正确。' },
              { key: 'C', value: '核糖体是蛋白质合成的场所', explanation: '核糖体是蛋白质合成的场所，正确。' },
              { key: 'D', value: '所有细胞都有线粒体', explanation: '原核细胞没有线粒体，哺乳动物成熟红细胞也没有线粒体，不正确。' },
              { key: 'E', value: '植物细胞都有叶绿体', explanation: '并非所有植物细胞都有叶绿体，如根尖细胞没有叶绿体，不正确。' }
            ],
            correctAnswer: 'A',
            explanation: 'A：线粒体=有氧呼吸场所 ✓\nB：叶绿体=光合作用场所 ✗\nC：核糖体=蛋白质合成场所 ✗\nD：原核细胞和哺乳动物成熟红细胞无线粒体 ✗\nE：根尖细胞等无叶绿体 ✗\n\n选A。'
          }
        ]
      },
      {
        unitNumber: 4,
        name: '第四章 细胞的物质输入和输出',
        description: '物质跨膜运输的方式',
        knowledgePoints: [
          {
            id: 'kp_biology_005',
            title: '被动运输与主动运输',
            content: '被动运输：物质顺浓度梯度进出细胞，不需要消耗能量。\n- 自由扩散：物质通过简单的扩散作用进出细胞（如O₂、CO₂、水、甘油等）\n- 协助扩散：借助细胞膜上的转运蛋白进出细胞（如葡萄糖进入红细胞）\n\n主动运输：物质逆浓度梯度进出细胞，需要载体蛋白的协助，需要消耗能量（ATP）。如Na⁺、K⁺、Ca²⁺等离子。\n\n质壁分离与复原：植物细胞在高浓度溶液中失水，原生质层与细胞壁分离（质壁分离）；放入清水中，细胞吸水，质壁分离复原。'
          }
        ],
        questions: [
          {
            id: 'pq_biology_005',
            knowledgePointId: 'kp_biology_005',
            question: '关于物质跨膜运输，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '自由扩散不需要消耗能量', explanation: '自由扩散是顺浓度梯度，不需要能量，正确。' },
              { key: 'B', value: '主动运输需要消耗能量', explanation: '主动运输是逆浓度梯度，需要消耗ATP，正确。' },
              { key: 'C', value: '水分子通过自由扩散进入细胞', explanation: '水分子可以通过自由扩散（简单扩散）进出细胞，正确。' },
              { key: 'D', value: '协助扩散需要载体蛋白', explanation: '协助扩散需要转运蛋白（载体蛋白或通道蛋白）的协助，正确。' },
              { key: 'E', value: '植物细胞质壁分离后放入清水中会复原', explanation: '质壁分离的细胞放入清水中会吸水复原，正确。' }
            ],
            correctAnswer: 'A',
            explanation: 'A：自由扩散不耗能 ✓\nB：主动运输耗能 ✗\nC：水分子自由扩散 ✗\nD：协助扩散需载体蛋白 ✗\nE：质壁分离可复原 ✗\n\n选A。'
          }
        ]
      },
      {
        unitNumber: 5,
        name: '第五章 细胞的能量供应和利用',
        description: '酶、ATP与细胞呼吸和光合作用',
        knowledgePoints: [
          {
            id: 'kp_biology_006',
            title: '酶与ATP',
            content: '酶：\n- 本质：大多数是蛋白质，少数是RNA\n- 作用：生物催化剂，降低化学反应的活化能\n- 特性：高效性、专一性、作用条件温和\n\nATP（三磷酸腺苷）：\n- 结构：A-P~P~P（A是腺苷，P是磷酸基团，~是高能磷酸键）\n- 功能：细胞内的直接能源物质\n- ATP与ADP的相互转化：ATP ⇌ ADP + Pi + 能量'
          },
          {
            id: 'kp_biology_007',
            title: '细胞呼吸与光合作用',
            content: '有氧呼吸：\n- 场所：细胞质基质和线粒体\n- 总反应式：C₆H₁₂O₆ + 6O₂ + 6H₂O → 6CO₂ + 12H₂O + 能量\n- 三个阶段：糖酵解→柠檬酸循环→电子传递链\n\n无氧呼吸：\n- 场所：细胞质基质\n- 产生酒精：C₆H₁₂O₆ → 2C₂H₅OH + 2CO₂ + 少量能量\n- 产生乳酸：C₆H₁₂O₆ → 2C₃H₆O₃ + 少量能量\n\n光合作用：\n- 场所：叶绿体\n- 总反应式：6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O（光能）\n- 两个阶段：光反应→暗反应（卡尔文循环）'
          }
        ],
        questions: [
          {
            id: 'pq_biology_006',
            knowledgePointId: 'kp_biology_006',
            question: '关于酶和ATP，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '酶的化学本质都是蛋白质', explanation: '大多数酶是蛋白质，但少数酶是RNA（核酶），不正确。' },
              { key: 'B', value: '酶具有高效性和专一性', explanation: '酶作为生物催化剂，具有高效性和专一性，正确。' },
              { key: 'C', value: 'ATP是细胞内的直接能源物质', explanation: 'ATP是细胞代谢的直接能源物质，正确。' },
              { key: 'D', value: 'ATP的结构简式是A-P~P~P', explanation: 'ATP由腺苷和三个磷酸基团组成，结构简式为A-P~P~P，正确。' },
              { key: 'E', value: '酶在催化反应前后本身的性质和数量不变', explanation: '酶是催化剂，反应前后自身不变，正确。' }
            ],
            correctAnswer: 'B',
            explanation: 'A：少数酶是RNA ✗\nB：高效性和专一性 ✓\nC：ATP是直接能源 ✗\nD：A-P~P~P ✗\nE：催化剂反应前后不变 ✗\n\n选B。'
          },
          {
            id: 'pq_biology_007',
            knowledgePointId: 'kp_biology_007',
            question: '关于细胞呼吸和光合作用，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '有氧呼吸的主要场所是线粒体', explanation: '有氧呼吸的第二、三阶段在线粒体中进行，线粒体是主要场所，正确。' },
              { key: 'B', value: '无氧呼吸不产生ATP', explanation: '无氧呼吸第一阶段产生少量ATP，第二阶段不产生ATP，不正确。' },
              { key: 'C', value: '光合作用的光反应阶段产生O₂', explanation: '光反应中水的光解产生O₂，正确。' },
              { key: 'D', value: '光合作用的暗反应阶段需要光', explanation: '暗反应不需要光，但需要光反应提供的ATP和[H]，不正确。' },
              { key: 'E', value: '有氧呼吸和无氧呼吸的第一阶段相同', explanation: '两者第一阶段都是糖酵解，在细胞质基质中进行，将葡萄糖分解为丙酮酸，正确。' }
            ],
            correctAnswer: 'A',
            explanation: 'A：线粒体是有氧呼吸主要场所 ✓\nB：无氧呼吸第一阶段产生少量ATP ✗\nC：光反应产生O₂ ✗\nD：暗反应不需要光 ✗\nE：第一阶段都是糖酵解 ✗\n\n选A。'
          }
        ]
      },
      {
        unitNumber: 6,
        name: '第六章 细胞的生命历程',
        description: '有丝分裂',
        knowledgePoints: [
          {
            id: 'kp_biology_008',
            title: '有丝分裂',
            content: '细胞周期：连续分裂的细胞，从一次分裂完成时开始，到下一次分裂完成时为止。包括分裂间期和分裂期。\n\n有丝分裂各时期特点：\n- 间期：DNA复制，蛋白质合成\n- 前期：染色质→染色体，核膜核仁消失，纺锤体形成\n- 中期：染色体排列在赤道板上，纺锤丝连接着丝粒\n- 后期：着丝粒分裂，姐妹染色单体分开，移向两极\n- 末期：染色体→染色质，核膜核仁重新出现，纺锤体消失'
          }
        ],
        questions: [
          {
            id: 'pq_biology_008',
            knowledgePointId: 'kp_biology_008',
            question: '关于有丝分裂，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '间期完成DNA的复制和有关蛋白质的合成', explanation: '间期是分裂的准备期，完成DNA复制和蛋白质合成，正确。' },
              { key: 'B', value: '中期是观察染色体形态和数目的最佳时期', explanation: '中期染色体形态最清晰、数目最易观察，正确。' },
              { key: 'C', value: '后期着丝粒分裂，染色体数目加倍', explanation: '着丝粒分裂后，姐妹染色单体分开成为两条染色体，染色体数目暂时加倍，正确。' },
              { key: 'D', value: '植物细胞分裂末期形成细胞板', explanation: '植物细胞在末期形成细胞板，扩展成新的细胞壁，正确。' },
              { key: 'E', value: '有丝分裂保证亲子代细胞遗传性状的稳定', explanation: '有丝分裂将复制后的染色体平均分配到两个子细胞，保证遗传稳定，正确。' }
            ],
            correctAnswer: 'A',
            explanation: 'A：间期DNA复制和蛋白质合成 ✓\nB：中期观察染色体最佳 ✗\nC：后期着丝粒分裂，染色体加倍 ✗\nD：植物细胞末期形成细胞板 ✗\nE：有丝分裂保证遗传稳定 ✗\n\n选A。'
          }
        ]
      }
    ];
  }
}