class PreviewGeographyChapter extends PreviewChapter {
  constructor() {
    super('preview_geography', '地理', 'fa-globe-asia', '#16a085');
    this.initUnits();
  }

  initUnits() {
    this.units = [
      {
        unitNumber: 1,
        name: '第一章 宇宙中的地球',
        description: '地球的自转与公转运动',
        knowledgePoints: [
          {
            id: 'kp_geography_001',
            title: '地球的运动',
            content: '地球自转：方向自西向东（北逆南顺），周期为一个恒星日（23时56分4秒）和一个太阳日（24小时），角速度约15°/h（除两极外），线速度从赤道向两极递减。意义：产生昼夜交替；地方时（经度每隔15°，地方时相差1小时）。地球公转：方向自西向东，周期为一个恒星年（365天6时9分10秒）和一个回归年（365天5时48分46秒），轨道为近似正圆的椭圆（1月初近日点，7月初远日点）。意义：正午太阳高度的变化；昼夜长短的变化；四季的更替；五带的划分。'
          }
        ],
        questions: [
          {
            id: 'pq_geography_001',
            knowledgePointId: 'kp_geography_001',
            question: '关于地球运动，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '地球自转的方向是自西向东', explanation: '从北极上空看地球自转是逆时针，从南极上空看是顺时针，方向都是自西向东，正确。' },
              { key: 'B', value: '地球自转一周的时间是24小时（一个太阳日）', explanation: '一个太阳日（太阳连续两次经过同一子午线）是24小时，正确。' },
              { key: 'C', value: '地球自转的角速度在赤道上最大', explanation: '除两极外，地球自转角速度各处相等，约15°/h，不正确。' },
              { key: 'D', value: '地球公转的轨道是近似正圆的椭圆', explanation: '地球公转轨道是椭圆，太阳位于椭圆的一个焦点上，正确。' },
              { key: 'E', value: '地球公转产生了四季更替', explanation: '由于黄赤交角的存在和地球公转，产生了正午太阳高度和昼夜长短的变化，形成四季更替，正确。' }
            ],
            correctAnswer: 'A',
            explanation: 'A：自西向东 ✓；B：太阳日=24小时 ✗；C：角速度处处相等（除两极）✗；D：椭圆轨道 ✗；E：公转产生四季 ✗。选A。'
          }
        ]
      },
      {
        unitNumber: 2,
        name: '第二章 地球上的大气',
        description: '大气的受热过程、热力环流与天气系统',
        knowledgePoints: [
          {
            id: 'kp_geography_002',
            title: '大气的受热过程',
            content: '大气受热过程：1.太阳短波辐射到达地面，地面吸收太阳辐射后增温；2.地面增温后，以长波辐射的形式向外辐射能量；3.大气中的水汽和CO₂强烈吸收地面长波辐射而增温（地面是近地面大气的主要直接热源）；4.大气增温后，也以长波辐射的形式向外辐射能量（大气逆辐射）。温室效应：大气逆辐射把热量还给地面，在一定程度上补偿了地面辐射损失的热量，对地面起到了保温作用。'
          },
          {
            id: 'kp_geography_003',
            title: '热力环流与天气系统',
            content: '热力环流：由于地面冷热不均而形成的空气环流。近地面热的地方空气膨胀上升，冷的地方空气收缩下沉，形成高空气流和近地面气流。常见的热力环流：海陆风（白天吹海风，夜晚吹陆风）、山谷风（白天吹谷风，夜晚吹山风）、城市热岛效应（城市气温高于郊区，形成城市风）。'
          }
        ],
        questions: [
          {
            id: 'pq_geography_002',
            knowledgePointId: 'kp_geography_002',
            question: '关于大气受热过程，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '太阳辐射是短波辐射', explanation: '太阳表面的温度很高，辐射能量主要集中在可见光和红外线波段，属于短波辐射，正确。' },
              { key: 'B', value: '地面辐射是长波辐射', explanation: '地面温度远低于太阳，辐射能量主要集中在红外线波段，属于长波辐射，正确。' },
              { key: 'C', value: '地面是近地面大气的主要直接热源', explanation: '大气对太阳短波辐射吸收很少，主要吸收地面长波辐射，地面是大气的主要直接热源，正确。' },
              { key: 'D', value: '大气逆辐射对地面有保温作用', explanation: '大气逆辐射把热量还给地面，起到了保温作用，正确。' },
              { key: 'E', value: '大气直接吸收太阳辐射而增温', explanation: '大气对太阳短波辐射吸收很少，主要靠吸收地面长波辐射增温，不正确。' }
            ],
            correctAnswer: 'A',
            explanation: 'A：太阳辐射=短波 ✓；B：地面辐射=长波 ✗；C：地面是大气主要直接热源 ✗；D：大气逆辐射=保温 ✗；E：大气主要吸收地面辐射增温 ✗。选A。'
          },
          {
            id: 'pq_geography_003',
            knowledgePointId: 'kp_geography_003',
            question: '关于热力环流，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '近地面热的地方空气上升', explanation: '地面受热，空气膨胀上升，形成低压，正确。' },
              { key: 'B', value: '近地面冷的地方空气下沉', explanation: '地面冷却，空气收缩下沉，形成高压，正确。' },
              { key: 'C', value: '白天吹海风', explanation: '白天陆地升温快，形成低压，海洋形成高压，风从海洋吹向陆地，正确。' },
              { key: 'D', value: '夜晚吹山风', explanation: '夜晚山坡降温快，空气下沉沿山坡吹向山谷，正确。' },
              { key: 'E', value: '城市中心气温通常高于郊区', explanation: '城市由于人类活动、建筑密集等原因，产生热岛效应，气温高于郊区，正确。' }
            ],
            correctAnswer: 'A',
            explanation: '选项A正确，选A。'
          }
        ]
      },
      {
        unitNumber: 3,
        name: '第三章 地球上的水',
        description: '水循环的类型、环节与意义',
        knowledgePoints: [
          {
            id: 'kp_geography_004',
            title: '水循环',
            content: '水循环的类型：海陆间循环（大循环）：海洋水蒸发→水汽输送→陆地降水→地表径流和地下径流→回到海洋；陆地内循环：陆地水蒸发→陆地降水；海上内循环：海洋水蒸发→海洋降水。水循环的环节：蒸发（蒸腾）、水汽输送、降水、地表径流、下渗、地下径流。水循环的意义：维持全球水的动态平衡；促进能量交换和物质迁移；塑造地表形态；影响全球气候和生态。'
          }
        ],
        questions: [
          {
            id: 'pq_geography_004',
            knowledgePointId: 'kp_geography_004',
            question: '关于水循环，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '水循环包括海陆间循环、陆地内循环和海上内循环', explanation: '水循环有三种类型，正确。' },
              { key: 'B', value: '地表径流是水循环的重要环节', explanation: '地表径流是水循环的关键环节之一，正确。' },
              { key: 'C', value: '水循环维持了全球水的动态平衡', explanation: '水循环使全球水处于动态平衡中，正确。' },
              { key: 'D', value: '人类活动能够影响水循环的某些环节', explanation: '如修建水库影响地表径流、城市化影响下渗和蒸发等，正确。' },
              { key: 'E', value: '水循环只发生在海洋和陆地之间', explanation: '还有海上内循环和陆地内循环，不正确。' }
            ],
            correctAnswer: 'A',
            explanation: 'A：三种类型 ✓；B：地表径流是重要环节 ✗；C：维持全球水平衡 ✗；D：人类活动影响水循环 ✗；E：不止海陆间，还有海上内循环和陆地内循环 ✗。选A。'
          }
        ]
      },
      {
        unitNumber: 4,
        name: '第四章 地貌',
        description: '内力作用与外力作用形成的地貌类型',
        knowledgePoints: [
          {
            id: 'kp_geography_005',
            title: '常见地貌类型',
            content: '内力作用形成的地貌：褶皱山（如喜马拉雅山脉）、断块山（如华山、泰山）、火山（如富士山）。外力作用形成的地貌：河流地貌（V形谷、冲积平原、三角洲）；风成地貌（风蚀蘑菇、雅丹地貌、沙丘）；喀斯特地貌（溶洞、石林、峰林）；冰川地貌（U形谷、角峰、冰斗）；海岸地貌（海蚀崖、海蚀洞、沙滩）。'
          }
        ],
        questions: [
          {
            id: 'pq_geography_005',
            knowledgePointId: 'kp_geography_005',
            question: '关于地貌类型，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '华山是断块山', explanation: '华山是典型的断块山，由断层抬升形成，正确。' },
              { key: 'B', value: '冲积平原是河流堆积作用形成的', explanation: '河流中下游地区，流速减慢，泥沙堆积形成冲积平原，正确。' },
              { key: 'C', value: '喀斯特地貌主要分布在石灰岩地区', explanation: '喀斯特地貌是石灰岩在水的溶蚀作用下形成的，正确。' },
              { key: 'D', value: '沙丘是风力堆积形成的', explanation: '沙丘是风力搬运沙粒堆积形成的，正确。' },
              { key: 'E', value: '三角洲是河流在入海口堆积形成的', explanation: '河流在入海口流速减慢，泥沙堆积形成三角洲，正确。' }
            ],
            correctAnswer: 'A',
            explanation: '选项A正确，选A。'
          }
        ]
      }
    ];
  }
}