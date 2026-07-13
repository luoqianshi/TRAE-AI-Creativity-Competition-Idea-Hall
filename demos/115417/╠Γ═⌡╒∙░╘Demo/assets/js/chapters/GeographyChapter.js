class GeographyChapter extends Chapter {
  constructor() {
    super('geography', '地理', 'fa-globe', '#1abc9c');
    this.initLevels();
  }

  initLevels() {
    this.levels = [
      {
        levelNumber: 1,
        name: '第一单元 宇宙中的地球',
        description: '高一地理第一单元',
        difficulty: 1,
        timeLimit: 180,
        unlocked: true,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_geo_001',
            question: '地球的形状是（ ）',
            options: [
              { key: 'A', value: '正球体', explanation: '' },
              { key: 'B', value: '椭球体', explanation: '' },
              { key: 'C', value: '正方体', explanation: '' },
              { key: 'D', value: '圆柱体', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '地球是一个两极稍扁、赤道略鼓的椭球体。'
          },
          {
            id: 'q_geo_002',
            question: '地球的赤道周长约为（ ）',
            options: [
              { key: 'A', value: '40000千米', explanation: '' },
              { key: 'B', value: '30000千米', explanation: '' },
              { key: 'C', value: '20000千米', explanation: '' },
              { key: 'D', value: '10000千米', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '地球的赤道周长约为40000千米。'
          },
          {
            id: 'q_geo_003',
            question: '地球自转的方向是（ ）',
            options: [
              { key: 'A', value: '自西向东', explanation: '' },
              { key: 'B', value: '自东向西', explanation: '' },
              { key: 'C', value: '自南向北', explanation: '' },
              { key: 'D', value: '自北向南', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '地球自转的方向是自西向东。'
          },
          {
            id: 'q_geo_004',
            question: '地球自转的周期是（ ）',
            options: [
              { key: 'A', value: '1天', explanation: '' },
              { key: 'B', value: '1周', explanation: '' },
              { key: 'C', value: '1月', explanation: '' },
              { key: 'D', value: '1年', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '地球自转的周期是1天（约24小时）。'
          },
          {
            id: 'q_geo_005',
            question: '地球公转的方向是（ ）',
            options: [
              { key: 'A', value: '自西向东', explanation: '' },
              { key: 'B', value: '自东向西', explanation: '' },
              { key: 'C', value: '自南向北', explanation: '' },
              { key: 'D', value: '自北向南', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '地球公转的方向是自西向东。'
          },
          {
            id: 'q_geo_006',
            question: '地球公转的周期是（ ）',
            options: [
              { key: 'A', value: '1天', explanation: '' },
              { key: 'B', value: '1周', explanation: '' },
              { key: 'C', value: '1月', explanation: '' },
              { key: 'D', value: '1年', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '地球公转的周期是1年（约365天）。'
          },
          {
            id: 'q_geo_007',
            question: '地球自转产生的现象不包括（ ）',
            options: [
              { key: 'A', value: '昼夜交替', explanation: '' },
              { key: 'B', value: '地方时差', explanation: '' },
              { key: 'C', value: '四季变化', explanation: '' },
              { key: 'D', value: '地转偏向力', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '四季变化是地球公转产生的现象。'
          },
          {
            id: 'q_geo_008',
            question: '地球公转产生的现象不包括（ ）',
            options: [
              { key: 'A', value: '四季变化', explanation: '' },
              { key: 'B', value: '昼夜长短变化', explanation: '' },
              { key: 'C', value: '正午太阳高度变化', explanation: '' },
              { key: 'D', value: '昼夜交替', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '昼夜交替是地球自转产生的现象。'
          },
          {
            id: 'q_geo_009',
            question: '赤道的纬度是（ ）',
            options: [
              { key: 'A', value: '0°', explanation: '' },
              { key: 'B', value: '90°N', explanation: '' },
              { key: 'C', value: '90°S', explanation: '' },
              { key: 'D', value: '180°', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '赤道的纬度是0°。'
          },
          {
            id: 'q_geo_010',
            question: '本初子午线的经度是（ ）',
            options: [
              { key: 'A', value: '0°', explanation: '' },
              { key: 'B', value: '90°E', explanation: '' },
              { key: 'C', value: '90°W', explanation: '' },
              { key: 'D', value: '180°', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '本初子午线的经度是0°。'
          }
        ]
      },
      {
        levelNumber: 2,
        name: '第二单元 大气',
        description: '高一地理第二单元',
        difficulty: 1,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_geo_011',
            question: '大气的主要成分是（ ）',
            options: [
              { key: 'A', value: '氮气和氧气', explanation: '' },
              { key: 'B', value: '二氧化碳和氧气', explanation: '' },
              { key: 'C', value: '氮气和二氧化碳', explanation: '' },
              { key: 'D', value: '氧气和氢气', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '大气的主要成分是氮气（约78%）和氧气（约21%）。'
          },
          {
            id: 'q_geo_012',
            question: '对流层的特点是（ ）',
            options: [
              { key: 'A', value: '气温随高度增加而降低', explanation: '' },
              { key: 'B', value: '气温随高度增加而升高', explanation: '' },
              { key: 'C', value: '气温不变', explanation: '' },
              { key: 'D', value: '没有空气', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '对流层的气温随高度增加而降低，平均每上升1000米气温下降6℃。'
          },
          {
            id: 'q_geo_013',
            question: '平流层的特点是（ ）',
            options: [
              { key: 'A', value: '气温随高度增加而降低', explanation: '' },
              { key: 'B', value: '气温随高度增加而升高', explanation: '' },
              { key: 'C', value: '气温不变', explanation: '' },
              { key: 'D', value: '空气对流强烈', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '平流层的气温随高度增加而升高，因为臭氧吸收紫外线。'
          },
          {
            id: 'q_geo_014',
            question: '大气的受热过程不包括（ ）',
            options: [
              { key: 'A', value: '太阳辐射', explanation: '' },
              { key: 'B', value: '地面辐射', explanation: '' },
              { key: 'C', value: '大气逆辐射', explanation: '' },
              { key: 'D', value: '月球辐射', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '月球辐射不是大气受热的主要过程。'
          },
          {
            id: 'q_geo_015',
            question: '大气逆辐射的作用是（ ）',
            options: [
              { key: 'A', value: '保温作用', explanation: '' },
              { key: 'B', value: '降温作用', explanation: '' },
              { key: 'C', value: '干燥作用', explanation: '' },
              { key: 'D', value: '湿润作用', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '大气逆辐射将热量返还给地面，起到保温作用。'
          },
          {
            id: 'q_geo_016',
            question: '热力环流的形成原因是（ ）',
            options: [
              { key: 'A', value: '地面冷热不均', explanation: '' },
              { key: 'B', value: '气压差异', explanation: '' },
              { key: 'C', value: '风力大小', explanation: '' },
              { key: 'D', value: '地形起伏', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '热力环流的形成原因是地面冷热不均。'
          },
          {
            id: 'q_geo_017',
            question: '风的形成原因是（ ）',
            options: [
              { key: 'A', value: '水平气压梯度力', explanation: '' },
              { key: 'B', value: '地转偏向力', explanation: '' },
              { key: 'C', value: '摩擦力', explanation: '' },
              { key: 'D', value: '重力', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '风的形成原因是水平气压梯度力。'
          },
          {
            id: 'q_geo_018',
            question: '地转偏向力的方向是（ ）',
            options: [
              { key: 'A', value: '北半球向右偏，南半球向左偏', explanation: '' },
              { key: 'B', value: '北半球向左偏，南半球向右偏', explanation: '' },
              { key: 'C', value: '都向右偏', explanation: '' },
              { key: 'D', value: '都向左偏', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '地转偏向力使北半球的风向右偏，南半球的风向左偏。'
          },
          {
            id: 'q_geo_019',
            question: '气压带和风带的形成与（ ）有关',
            options: [
              { key: 'A', value: '太阳辐射和地球自转', explanation: '' },
              { key: 'B', value: '地形起伏', explanation: '' },
              { key: 'C', value: '海陆分布', explanation: '' },
              { key: 'D', value: '人类活动', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '气压带和风带的形成与太阳辐射和地球自转有关。'
          },
          {
            id: 'q_geo_020',
            question: '赤道低气压带的特点是（ ）',
            options: [
              { key: 'A', value: '高温多雨', explanation: '' },
              { key: 'B', value: '高温少雨', explanation: '' },
              { key: 'C', value: '低温多雨', explanation: '' },
              { key: 'D', value: '低温少雨', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '赤道低气压带盛行上升气流，形成高温多雨的气候。'
          }
        ]
      },
      {
        levelNumber: 3,
        name: '第三单元 水',
        description: '高一地理第三单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_geo_021',
            question: '地球上水的主体是（ ）',
            options: [
              { key: 'A', value: '海洋水', explanation: '' },
              { key: 'B', value: '陆地水', explanation: '' },
              { key: 'C', value: '大气水', explanation: '' },
              { key: 'D', value: '冰川水', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '地球上97%以上的水是海洋水。'
          },
          {
            id: 'q_geo_022',
            question: '人类可利用的淡水资源主要是（ ）',
            options: [
              { key: 'A', value: '河流水、淡水湖泊水和浅层地下水', explanation: '' },
              { key: 'B', value: '冰川水', explanation: '' },
              { key: 'C', value: '海洋水', explanation: '' },
              { key: 'D', value: '深层地下水', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '人类可利用的淡水资源主要是河流水、淡水湖泊水和浅层地下水。'
          },
          {
            id: 'q_geo_023',
            question: '水循环的类型不包括（ ）',
            options: [
              { key: 'A', value: '海陆间循环', explanation: '' },
              { key: 'B', value: '陆上内循环', explanation: '' },
              { key: 'C', value: '海上内循环', explanation: '' },
              { key: 'D', value: '地下循环', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '水循环的类型包括海陆间循环、陆上内循环和海上内循环。'
          },
          {
            id: 'q_geo_024',
            question: '海陆间循环的意义是（ ）',
            options: [
              { key: 'A', value: '使陆地水资源得到更新', explanation: '' },
              { key: 'B', value: '使海洋水资源得到更新', explanation: '' },
              { key: 'C', value: '使大气水资源得到更新', explanation: '' },
              { key: 'D', value: '没有意义', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '海陆间循环使陆地水资源得到不断更新。'
          },
          {
            id: 'q_geo_025',
            question: '洋流按性质分类不包括（ ）',
            options: [
              { key: 'A', value: '暖流', explanation: '' },
              { key: 'B', value: '寒流', explanation: '' },
              { key: 'C', value: '风海流', explanation: '' },
              { key: 'D', value: '密度流', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '风海流是按成因分类的，不是按性质分类的。'
          },
          {
            id: 'q_geo_026',
            question: '暖流的特点是（ ）',
            options: [
              { key: 'A', value: '水温高于流经地区', explanation: '' },
              { key: 'B', value: '水温低于流经地区', explanation: '' },
              { key: 'C', value: '水温等于流经地区', explanation: '' },
              { key: 'D', value: '水温不确定', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '暖流是从低纬度流向高纬度的洋流，水温高于流经地区。'
          },
          {
            id: 'q_geo_027',
            question: '寒流的特点是（ ）',
            options: [
              { key: 'A', value: '水温高于流经地区', explanation: '' },
              { key: 'B', value: '水温低于流经地区', explanation: '' },
              { key: 'C', value: '水温等于流经地区', explanation: '' },
              { key: 'D', value: '水温不确定', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '寒流是从高纬度流向低纬度的洋流，水温低于流经地区。'
          },
          {
            id: 'q_geo_028',
            question: '洋流对气候的影响是（ ）',
            options: [
              { key: 'A', value: '暖流增温增湿，寒流降温减湿', explanation: '' },
              { key: 'B', value: '暖流降温减湿，寒流增温增湿', explanation: '' },
              { key: 'C', value: '都增温增湿', explanation: '' },
              { key: 'D', value: '都降温减湿', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '暖流对沿岸气候有增温增湿作用，寒流有降温减湿作用。'
          },
          {
            id: 'q_geo_029',
            question: '世界大洋洋流分布规律不包括（ ）',
            options: [
              { key: 'A', value: '中低纬度形成反气旋型环流', explanation: '' },
              { key: 'B', value: '中高纬度形成气旋型环流', explanation: '' },
              { key: 'C', value: '北印度洋形成季风洋流', explanation: '' },
              { key: 'D', value: '所有洋流都自西向东', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '洋流的流向受多种因素影响，不是所有洋流都自西向东。'
          },
          {
            id: 'q_geo_030',
            question: '北印度洋季风洋流的特点是（ ）',
            options: [
              { key: 'A', value: '夏季顺时针，冬季逆时针', explanation: '' },
              { key: 'B', value: '夏季逆时针，冬季顺时针', explanation: '' },
              { key: 'C', value: '全年顺时针', explanation: '' },
              { key: 'D', value: '全年逆时针', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '北印度洋季风洋流夏季受西南季风影响顺时针流动，冬季受东北季风影响逆时针流动。'
          }
        ]
      },
      {
        levelNumber: 4,
        name: '第四单元 地貌',
        description: '高一地理第四单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_geo_031',
            question: '内力作用的表现形式不包括（ ）',
            options: [
              { key: 'A', value: '地壳运动', explanation: '' },
              { key: 'B', value: '岩浆活动', explanation: '' },
              { key: 'C', value: '变质作用', explanation: '' },
              { key: 'D', value: '风化作用', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '风化作用是外力作用的表现形式。'
          },
          {
            id: 'q_geo_032',
            question: '外力作用的表现形式不包括（ ）',
            options: [
              { key: 'A', value: '风化作用', explanation: '' },
              { key: 'B', value: '侵蚀作用', explanation: '' },
              { key: 'C', value: '搬运作用', explanation: '' },
              { key: 'D', value: '地壳运动', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '地壳运动是内力作用的表现形式。'
          },
          {
            id: 'q_geo_033',
            question: '地壳运动的类型不包括（ ）',
            options: [
              { key: 'A', value: '水平运动', explanation: '' },
              { key: 'B', value: '垂直运动', explanation: '' },
              { key: 'C', value: '旋转运动', explanation: '' },
              { key: 'D', value: '褶皱运动', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '地壳运动主要包括水平运动和垂直运动。'
          },
          {
            id: 'q_geo_034',
            question: '褶皱的基本形态是（ ）',
            options: [
              { key: 'A', value: '背斜和向斜', explanation: '' },
              { key: 'B', value: '断层和节理', explanation: '' },
              { key: 'C', value: '山峰和山谷', explanation: '' },
              { key: 'D', value: '高原和平原', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '褶皱的基本形态是背斜和向斜。'
          },
          {
            id: 'q_geo_035',
            question: '背斜的特点是（ ）',
            options: [
              { key: 'A', value: '岩层向上拱起', explanation: '' },
              { key: 'B', value: '岩层向下弯曲', explanation: '' },
              { key: 'C', value: '岩层水平', explanation: '' },
              { key: 'D', value: '岩层倾斜', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '背斜是岩层向上拱起的褶皱。'
          },
          {
            id: 'q_geo_036',
            question: '向斜的特点是（ ）',
            options: [
              { key: 'A', value: '岩层向上拱起', explanation: '' },
              { key: 'B', value: '岩层向下弯曲', explanation: '' },
              { key: 'C', value: '岩层水平', explanation: '' },
              { key: 'D', value: '岩层倾斜', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '向斜是岩层向下弯曲的褶皱。'
          },
          {
            id: 'q_geo_037',
            question: '断层的形成原因是（ ）',
            options: [
              { key: 'A', value: '地壳运动产生的压力或张力超过岩石的强度', explanation: '' },
              { key: 'B', value: '风化作用', explanation: '' },
              { key: 'C', value: '侵蚀作用', explanation: '' },
              { key: 'D', value: '搬运作用', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '断层是地壳运动产生的压力或张力超过岩石的强度导致岩层断裂并发生位移形成的。'
          },
          {
            id: 'q_geo_038',
            question: '常见的地貌类型不包括（ ）',
            options: [
              { key: 'A', value: '山地', explanation: '' },
              { key: 'B', value: '高原', explanation: '' },
              { key: 'C', value: '平原', explanation: '' },
              { key: 'D', value: '天空', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '天空不是地貌类型。'
          },
          {
            id: 'q_geo_039',
            question: '山地的特点是（ ）',
            options: [
              { key: 'A', value: '海拔高于500米，地势起伏大', explanation: '' },
              { key: 'B', value: '海拔低于500米，地势起伏小', explanation: '' },
              { key: 'C', value: '海拔低于200米，地势平坦', explanation: '' },
              { key: 'D', value: '海拔高于1000米，地势平坦', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '山地的海拔高于500米，地势起伏大。'
          },
          {
            id: 'q_geo_040',
            question: '平原的特点是（ ）',
            options: [
              { key: 'A', value: '海拔低于200米，地势平坦', explanation: '' },
              { key: 'B', value: '海拔高于500米，地势起伏大', explanation: '' },
              { key: 'C', value: '海拔低于500米，地势起伏小', explanation: '' },
              { key: 'D', value: '海拔高于1000米，地势平坦', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '平原的海拔低于200米，地势平坦。'
          }
        ]
      },
      {
        levelNumber: 5,
        name: '第五单元 植被与土壤',
        description: '高一地理第五单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_geo_041',
            question: '植被的类型不包括（ ）',
            options: [
              { key: 'A', value: '森林', explanation: '' },
              { key: 'B', value: '草原', explanation: '' },
              { key: 'C', value: '荒漠', explanation: '' },
              { key: 'D', value: '海洋', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '海洋不是植被类型。'
          },
          {
            id: 'q_geo_042',
            question: '热带雨林的特点是（ ）',
            options: [
              { key: 'A', value: '全年高温多雨，植被茂密', explanation: '' },
              { key: 'B', value: '夏季炎热干燥，冬季温和多雨', explanation: '' },
              { key: 'C', value: '全年温和湿润', explanation: '' },
              { key: 'D', value: '夏季高温多雨，冬季寒冷干燥', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '热带雨林全年高温多雨，植被茂密。'
          },
          {
            id: 'q_geo_043',
            question: '温带落叶阔叶林的特点是（ ）',
            options: [
              { key: 'A', value: '夏季高温多雨，冬季寒冷干燥，冬季落叶', explanation: '' },
              { key: 'B', value: '全年高温多雨，植被茂密', explanation: '' },
              { key: 'C', value: '夏季炎热干燥，冬季温和多雨', explanation: '' },
              { key: 'D', value: '全年温和湿润', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '温带落叶阔叶林夏季高温多雨，冬季寒冷干燥，冬季落叶。'
          },
          {
            id: 'q_geo_044',
            question: '草原植被的特点是（ ）',
            options: [
              { key: 'A', value: '以草本植物为主', explanation: '' },
              { key: 'B', value: '以木本植物为主', explanation: '' },
              { key: 'C', value: '没有植被', explanation: '' },
              { key: 'D', value: '以水生植物为主', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '草原植被以草本植物为主。'
          },
          {
            id: 'q_geo_045',
            question: '荒漠植被的特点是（ ）',
            options: [
              { key: 'A', value: '植被稀疏，耐旱', explanation: '' },
              { key: 'B', value: '植被茂密，喜湿', explanation: '' },
              { key: 'C', value: '植被中等，喜温', explanation: '' },
              { key: 'D', value: '没有植被', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '荒漠植被稀疏，植物具有耐旱特征。'
          },
          {
            id: 'q_geo_046',
            question: '土壤的组成不包括（ ）',
            options: [
              { key: 'A', value: '矿物质', explanation: '' },
              { key: 'B', value: '有机质', explanation: '' },
              { key: 'C', value: '水分和空气', explanation: '' },
              { key: 'D', value: '岩石', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '岩石不是土壤的组成部分，土壤是由岩石风化形成的。'
          },
          {
            id: 'q_geo_047',
            question: '土壤的形成因素不包括（ ）',
            options: [
              { key: 'A', value: '成土母质', explanation: '' },
              { key: 'B', value: '气候', explanation: '' },
              { key: 'C', value: '生物', explanation: '' },
              { key: 'D', value: '宇宙射线', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '宇宙射线不是土壤形成的主要因素。'
          },
          {
            id: 'q_geo_048',
            question: '土壤肥力的高低主要取决于（ ）',
            options: [
              { key: 'A', value: '有机质含量', explanation: '' },
              { key: 'B', value: '矿物质含量', explanation: '' },
              { key: 'C', value: '水分含量', explanation: '' },
              { key: 'D', value: '空气含量', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '土壤肥力的高低主要取决于有机质含量。'
          },
          {
            id: 'q_geo_049',
            question: '我国的土壤类型不包括（ ）',
            options: [
              { key: 'A', value: '红壤', explanation: '' },
              { key: 'B', value: '黄壤', explanation: '' },
              { key: 'C', value: '黑土', explanation: '' },
              { key: 'D', value: '金土', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '金土不是我国的土壤类型。'
          },
          {
            id: 'q_geo_050',
            question: '黑土的特点是（ ）',
            options: [
              { key: 'A', value: '肥力高，有机质含量丰富', explanation: '' },
              { key: 'B', value: '肥力低，有机质含量少', explanation: '' },
              { key: 'C', value: '酸性强，肥力中等', explanation: '' },
              { key: 'D', value: '碱性强，肥力中等', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '黑土肥力高，有机质含量丰富，是我国重要的农业土壤。'
          }
        ]
      },
      {
        levelNumber: 6,
        name: '第六单元 自然灾害',
        description: '高一地理第六单元',
        difficulty: 3,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_geo_051',
            question: '自然灾害的类型不包括（ ）',
            options: [
              { key: 'A', value: '气象灾害', explanation: '' },
              { key: 'B', value: '地质灾害', explanation: '' },
              { key: 'C', value: '海洋灾害', explanation: '' },
              { key: 'D', value: '人为灾害', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '人为灾害是人类活动造成的，不属于自然灾害。'
          },
          {
            id: 'q_geo_052',
            question: '气象灾害不包括（ ）',
            options: [
              { key: 'A', value: '台风', explanation: '' },
              { key: 'B', value: '寒潮', explanation: '' },
              { key: 'C', value: '地震', explanation: '' },
              { key: 'D', value: '洪涝', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '地震是地质灾害，不是气象灾害。'
          },
          {
            id: 'q_geo_053',
            question: '地质灾害不包括（ ）',
            options: [
              { key: 'A', value: '地震', explanation: '' },
              { key: 'B', value: '滑坡', explanation: '' },
              { key: 'C', value: '泥石流', explanation: '' },
              { key: 'D', value: '台风', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '台风是气象灾害，不是地质灾害。'
          },
          {
            id: 'q_geo_054',
            question: '台风的特点是（ ）',
            options: [
              { key: 'A', value: '强风、暴雨、风暴潮', explanation: '' },
              { key: 'B', value: '高温、干旱', explanation: '' },
              { key: 'C', value: '低温、大风', explanation: '' },
              { key: 'D', value: '地震、海啸', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '台风的特点是强风、暴雨和风暴潮。'
          },
          {
            id: 'q_geo_055',
            question: '寒潮的特点是（ ）',
            options: [
              { key: 'A', value: '低温、大风、雨雪', explanation: '' },
              { key: 'B', value: '高温、干旱', explanation: '' },
              { key: 'C', value: '强风、暴雨', explanation: '' },
              { key: 'D', value: '地震、滑坡', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '寒潮的特点是低温、大风和雨雪。'
          },
          {
            id: 'q_geo_056',
            question: '地震的成因是（ ）',
            options: [
              { key: 'A', value: '板块运动', explanation: '' },
              { key: 'B', value: '气象变化', explanation: '' },
              { key: 'C', value: '海洋运动', explanation: '' },
              { key: 'D', value: '人类活动', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '地震的成因是板块运动。'
          },
          {
            id: 'q_geo_057',
            question: '地震的震级表示（ ）',
            options: [
              { key: 'A', value: '地震的强度', explanation: '' },
              { key: 'B', value: '地震的破坏程度', explanation: '' },
              { key: 'C', value: '地震的位置', explanation: '' },
              { key: 'D', value: '地震的时间', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '震级表示地震的强度。'
          },
          {
            id: 'q_geo_058',
            question: '地震的烈度表示（ ）',
            options: [
              { key: 'A', value: '地震的强度', explanation: '' },
              { key: 'B', value: '地震的破坏程度', explanation: '' },
              { key: 'C', value: '地震的位置', explanation: '' },
              { key: 'D', value: '地震的时间', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '烈度表示地震的破坏程度。'
          },
          {
            id: 'q_geo_059',
            question: '滑坡的形成条件不包括（ ）',
            options: [
              { key: 'A', value: '地形起伏大', explanation: '' },
              { key: 'B', value: '降水丰富', explanation: '' },
              { key: 'C', value: '植被茂密', explanation: '' },
              { key: 'D', value: '岩石破碎', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '植被茂密可以防止滑坡，不是滑坡的形成条件。'
          },
          {
            id: 'q_geo_060',
            question: '自然灾害的防御措施不包括（ ）',
            options: [
              { key: 'A', value: '加强监测预报', explanation: '' },
              { key: 'B', value: '加强防灾减灾宣传', explanation: '' },
              { key: 'C', value: '破坏自然环境', explanation: '' },
              { key: 'D', value: '建设防灾工程', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '破坏自然环境会加剧自然灾害，不是防御措施。'
          }
        ]
      },
      {
        levelNumber: 7,
        name: '第七单元 人口',
        description: '高一地理第七单元',
        difficulty: 3,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_geo_061',
            question: '人口增长的模式不包括（ ）',
            options: [
              { key: 'A', value: '高高低模式', explanation: '' },
              { key: 'B', value: '高低高模式', explanation: '' },
              { key: 'C', value: '低低低模式', explanation: '' },
              { key: 'D', value: '高低低模式', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '人口增长模式包括高高低模式、高低高模式和低低低模式。'
          },
          {
            id: 'q_geo_062',
            question: '高高低模式的特点是（ ）',
            options: [
              { key: 'A', value: '高出生率、高死亡率、低自然增长率', explanation: '' },
              { key: 'B', value: '高出生率、低死亡率、高自然增长率', explanation: '' },
              { key: 'C', value: '低出生率、低死亡率、低自然增长率', explanation: '' },
              { key: 'D', value: '低出生率、高死亡率、低自然增长率', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '高高低模式的特点是高出生率、高死亡率、低自然增长率。'
          },
          {
            id: 'q_geo_063',
            question: '高低高模式的特点是（ ）',
            options: [
              { key: 'A', value: '高出生率、高死亡率、低自然增长率', explanation: '' },
              { key: 'B', value: '高出生率、低死亡率、高自然增长率', explanation: '' },
              { key: 'C', value: '低出生率、低死亡率、低自然增长率', explanation: '' },
              { key: 'D', value: '低出生率、高死亡率、低自然增长率', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '高低高模式的特点是高出生率、低死亡率、高自然增长率。'
          },
          {
            id: 'q_geo_064',
            question: '低低低模式的特点是（ ）',
            options: [
              { key: 'A', value: '高出生率、高死亡率、低自然增长率', explanation: '' },
              { key: 'B', value: '高出生率、低死亡率、高自然增长率', explanation: '' },
              { key: 'C', value: '低出生率、低死亡率、低自然增长率', explanation: '' },
              { key: 'D', value: '低出生率、高死亡率、低自然增长率', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '低低低模式的特点是低出生率、低死亡率、低自然增长率。'
          },
          {
            id: 'q_geo_065',
            question: '人口老龄化的标准是（ ）',
            options: [
              { key: 'A', value: '65岁以上人口占总人口的7%以上', explanation: '' },
              { key: 'B', value: '65岁以上人口占总人口的10%以上', explanation: '' },
              { key: 'C', value: '60岁以上人口占总人口的7%以上', explanation: '' },
              { key: 'D', value: '60岁以上人口占总人口的5%以上', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '人口老龄化的标准是65岁以上人口占总人口的7%以上。'
          },
          {
            id: 'q_geo_066',
            question: '人口迁移的类型不包括（ ）',
            options: [
              { key: 'A', value: '国际迁移', explanation: '' },
              { key: 'B', value: '国内迁移', explanation: '' },
              { key: 'C', value: '永久迁移', explanation: '' },
              { key: 'D', value: '动物迁移', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '动物迁移不是人口迁移类型。'
          },
          {
            id: 'q_geo_067',
            question: '影响人口迁移的因素不包括（ ）',
            options: [
              { key: 'A', value: '经济因素', explanation: '' },
              { key: 'B', value: '政治因素', explanation: '' },
              { key: 'C', value: '社会文化因素', explanation: '' },
              { key: 'D', value: '太阳活动', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '太阳活动不是影响人口迁移的主要因素。'
          },
          {
            id: 'q_geo_068',
            question: '我国人口迁移的主要方向是（ ）',
            options: [
              { key: 'A', value: '从农村到城市', explanation: '' },
              { key: 'B', value: '从城市到农村', explanation: '' },
              { key: 'C', value: '从东部到西部', explanation: '' },
              { key: 'D', value: '从沿海到内陆', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '我国人口迁移的主要方向是从农村到城市。'
          },
          {
            id: 'q_geo_069',
            question: '人口容量的特点不包括（ ）',
            options: [
              { key: 'A', value: '临界性', explanation: '' },
              { key: 'B', value: '相对性', explanation: '' },
              { key: 'C', value: '警戒性', explanation: '' },
              { key: 'D', value: '绝对性', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '人口容量具有临界性、相对性和警戒性，没有绝对性。'
          },
          {
            id: 'q_geo_070',
            question: '影响人口容量的因素不包括（ ）',
            options: [
              { key: 'A', value: '自然资源', explanation: '' },
              { key: 'B', value: '科技发展水平', explanation: '' },
              { key: 'C', value: '人口消费水平', explanation: '' },
              { key: 'D', value: '人口数量', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '人口数量不是影响人口容量的因素，人口容量是指环境能容纳的最大人口数量。'
          }
        ]
      },
      {
        levelNumber: 8,
        name: '第八单元 城市',
        description: '高一地理第八单元',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_geo_071',
            question: '城市的起源条件不包括（ ）',
            options: [
              { key: 'A', value: '农业生产技术的创新', explanation: '' },
              { key: 'B', value: '劳动分工', explanation: '' },
              { key: 'C', value: '商品交换', explanation: '' },
              { key: 'D', value: '人口减少', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '人口减少不利于城市的形成。'
          },
          {
            id: 'q_geo_072',
            question: '城市的功能分区不包括（ ）',
            options: [
              { key: 'A', value: '商业区', explanation: '' },
              { key: 'B', value: '住宅区', explanation: '' },
              { key: 'C', value: '工业区', explanation: '' },
              { key: 'D', value: '农业区', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '农业区是农村的主要功能区，不是城市的功能分区。'
          },
          {
            id: 'q_geo_073',
            question: '商业区的特点是（ ）',
            options: [
              { key: 'A', value: '位于市中心，交通便利', explanation: '' },
              { key: 'B', value: '位于城市边缘，环境优美', explanation: '' },
              { key: 'C', value: '位于城市外围，土地广阔', explanation: '' },
              { key: 'D', value: '位于城市郊区，交通不便', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '商业区通常位于市中心，交通便利。'
          },
          {
            id: 'q_geo_074',
            question: '住宅区的特点是（ ）',
            options: [
              { key: 'A', value: '城市中最广泛的功能区', explanation: '' },
              { key: 'B', value: '位于市中心，交通便利', explanation: '' },
              { key: 'C', value: '位于城市外围，土地广阔', explanation: '' },
              { key: 'D', value: '位于城市郊区，污染严重', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '住宅区是城市中最广泛的功能区。'
          },
          {
            id: 'q_geo_075',
            question: '工业区的特点是（ ）',
            options: [
              { key: 'A', value: '位于城市外围，靠近交通线', explanation: '' },
              { key: 'B', value: '位于市中心，交通便利', explanation: '' },
              { key: 'C', value: '位于城市中心，环境优美', explanation: '' },
              { key: 'D', value: '位于城市中心，人口密集', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '工业区通常位于城市外围，靠近交通线。'
          },
          {
            id: 'q_geo_076',
            question: '城市等级的划分标准是（ ）',
            options: [
              { key: 'A', value: '人口规模', explanation: '' },
              { key: 'B', value: '面积大小', explanation: '' },
              { key: 'C', value: '经济发展水平', explanation: '' },
              { key: 'D', value: '地理位置', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '城市等级的划分标准是人口规模。'
          },
          {
            id: 'q_geo_077',
            question: '城市等级与服务范围的关系是（ ）',
            options: [
              { key: 'A', value: '等级越高，服务范围越大', explanation: '' },
              { key: 'B', value: '等级越高，服务范围越小', explanation: '' },
              { key: 'C', value: '等级与服务范围无关', explanation: '' },
              { key: 'D', value: '等级越低，服务范围越大', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '城市等级越高，服务范围越大。'
          },
          {
            id: 'q_geo_078',
            question: '城市化的标志不包括（ ）',
            options: [
              { key: 'A', value: '城市人口增加', explanation: '' },
              { key: 'B', value: '城市人口占总人口比重上升', explanation: '' },
              { key: 'C', value: '城市用地规模扩大', explanation: '' },
              { key: 'D', value: '城市人口减少', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '城市人口减少不是城市化的标志。'
          },
          {
            id: 'q_geo_079',
            question: '城市化过程中出现的问题不包括（ ）',
            options: [
              { key: 'A', value: '环境污染', explanation: '' },
              { key: 'B', value: '交通拥堵', explanation: '' },
              { key: 'C', value: '住房紧张', explanation: '' },
              { key: 'D', value: '人口减少', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '人口减少不是城市化过程中出现的问题。'
          },
          {
            id: 'q_geo_080',
            question: '解决城市化问题的措施不包括（ ）',
            options: [
              { key: 'A', value: '建设卫星城', explanation: '' },
              { key: 'B', value: '加强城市管理', explanation: '' },
              { key: 'C', value: '改善交通和居住条件', explanation: '' },
              { key: 'D', value: '限制城市发展', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '限制城市发展不是解决城市化问题的有效措施。'
          }
        ]
      },
      {
        levelNumber: 9,
        name: '第九单元 农业',
        description: '高一地理第九单元',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_geo_081',
            question: '农业的分类不包括（ ）',
            options: [
              { key: 'A', value: '种植业', explanation: '' },
              { key: 'B', value: '畜牧业', explanation: '' },
              { key: 'C', value: '林业', explanation: '' },
              { key: 'D', value: '工业', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '工业不是农业的分类。'
          },
          {
            id: 'q_geo_082',
            question: '影响农业区位的因素不包括（ ）',
            options: [
              { key: 'A', value: '自然因素', explanation: '' },
              { key: 'B', value: '社会经济因素', explanation: '' },
              { key: 'C', value: '科技因素', explanation: '' },
              { key: 'D', value: '太阳活动', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '太阳活动不是影响农业区位的主要因素。'
          },
          {
            id: 'q_geo_083',
            question: '自然因素包括（ ）',
            options: [
              { key: 'A', value: '气候、地形、土壤、水源', explanation: '' },
              { key: 'B', value: '市场、交通、政策、科技', explanation: '' },
              { key: 'C', value: '人口、经济、文化、历史', explanation: '' },
              { key: 'D', value: '工业、商业、服务业、金融业', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '自然因素包括气候、地形、土壤、水源等。'
          },
          {
            id: 'q_geo_084',
            question: '社会经济因素包括（ ）',
            options: [
              { key: 'A', value: '市场、交通、政策、科技', explanation: '' },
              { key: 'B', value: '气候、地形、土壤、水源', explanation: '' },
              { key: 'C', value: '人口、经济、文化、历史', explanation: '' },
              { key: 'D', value: '工业、商业、服务业、金融业', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '社会经济因素包括市场、交通、政策、科技等。'
          },
          {
            id: 'q_geo_085',
            question: '季风水田农业的特点不包括（ ）',
            options: [
              { key: 'A', value: '小农经营', explanation: '' },
              { key: 'B', value: '单位面积产量高', explanation: '' },
              { key: 'C', value: '机械化水平低', explanation: '' },
              { key: 'D', value: '商品率高', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '季风水田农业的商品率低，大部分粮食用于自给。'
          },
          {
            id: 'q_geo_086',
            question: '商品谷物农业的特点不包括（ ）',
            options: [
              { key: 'A', value: '大规模经营', explanation: '' },
              { key: 'B', value: '机械化水平高', explanation: '' },
              { key: 'C', value: '商品率高', explanation: '' },
              { key: 'D', value: '小农经营', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '商品谷物农业是大规模经营，不是小农经营。'
          },
          {
            id: 'q_geo_087',
            question: '大牧场放牧业的特点不包括（ ）',
            options: [
              { key: 'A', value: '大规模经营', explanation: '' },
              { key: 'B', value: '商品率高', explanation: '' },
              { key: 'C', value: '机械化水平高', explanation: '' },
              { key: 'D', value: '精耕细作', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '大牧场放牧业是粗放经营，不是精耕细作。'
          },
          {
            id: 'q_geo_088',
            question: '乳畜业的特点不包括（ ）',
            options: [
              { key: 'A', value: '靠近城市分布', explanation: '' },
              { key: 'B', value: '商品率高', explanation: '' },
              { key: 'C', value: '机械化水平高', explanation: '' },
              { key: 'D', value: '远离城市分布', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '乳畜业需要靠近城市市场，不会远离城市分布。'
          },
          {
            id: 'q_geo_089',
            question: '混合农业的特点不包括（ ）',
            options: [
              { key: 'A', value: '种植业和畜牧业相结合', explanation: '' },
              { key: 'B', value: '农场形成一个良性的农业生态系统', explanation: '' },
              { key: 'C', value: '农民可以有效地利用时间安排农业活动', explanation: '' },
              { key: 'D', value: '只种植一种作物', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '混合农业是种植业和畜牧业相结合，不是只种植一种作物。'
          },
          {
            id: 'q_geo_090',
            question: '农业地域类型的形成原因不包括（ ）',
            options: [
              { key: 'A', value: '自然条件', explanation: '' },
              { key: 'B', value: '社会经济条件', explanation: '' },
              { key: 'C', value: '科技水平', explanation: '' },
              { key: 'D', value: '人口数量', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '人口数量不是农业地域类型形成的直接原因。'
          }
        ]
      },
      {
        levelNumber: 10,
        name: '第十单元 工业',
        description: '高一地理第十单元',
        difficulty: 5,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_geo_091',
            question: '工业的分类不包括（ ）',
            options: [
              { key: 'A', value: '重工业', explanation: '' },
              { key: 'B', value: '轻工业', explanation: '' },
              { key: 'C', value: '高新技术产业', explanation: '' },
              { key: 'D', value: '农业', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '农业不是工业的分类。'
          },
          {
            id: 'q_geo_092',
            question: '影响工业区位的因素不包括（ ）',
            options: [
              { key: 'A', value: '原料', explanation: '' },
              { key: 'B', value: '市场', explanation: '' },
              { key: 'C', value: '交通', explanation: '' },
              { key: 'D', value: '天气', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '天气不是影响工业区位的主要因素。'
          },
          {
            id: 'q_geo_093',
            question: '原料导向型工业的特点是（ ）',
            options: [
              { key: 'A', value: '靠近原料产地', explanation: '' },
              { key: 'B', value: '靠近市场', explanation: '' },
              { key: 'C', value: '靠近交通枢纽', explanation: '' },
              { key: 'D', value: '靠近科技中心', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '原料导向型工业需要靠近原料产地。'
          },
          {
            id: 'q_geo_094',
            question: '市场导向型工业的特点是（ ）',
            options: [
              { key: 'A', value: '靠近原料产地', explanation: '' },
              { key: 'B', value: '靠近市场', explanation: '' },
              { key: 'C', value: '靠近交通枢纽', explanation: '' },
              { key: 'D', value: '靠近科技中心', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '市场导向型工业需要靠近市场。'
          },
          {
            id: 'q_geo_095',
            question: '动力导向型工业的特点是（ ）',
            options: [
              { key: 'A', value: '靠近能源供应地', explanation: '' },
              { key: 'B', value: '靠近原料产地', explanation: '' },
              { key: 'C', value: '靠近市场', explanation: '' },
              { key: 'D', value: '靠近交通枢纽', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '动力导向型工业需要靠近能源供应地。'
          },
          {
            id: 'q_geo_096',
            question: '劳动力导向型工业的特点是（ ）',
            options: [
              { key: 'A', value: '靠近劳动力丰富的地区', explanation: '' },
              { key: 'B', value: '靠近原料产地', explanation: '' },
              { key: 'C', value: '靠近市场', explanation: '' },
              { key: 'D', value: '靠近科技中心', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '劳动力导向型工业需要靠近劳动力丰富的地区。'
          },
          {
            id: 'q_geo_097',
            question: '技术导向型工业的特点是（ ）',
            options: [
              { key: 'A', value: '靠近科技中心', explanation: '' },
              { key: 'B', value: '靠近原料产地', explanation: '' },
              { key: 'C', value: '靠近市场', explanation: '' },
              { key: 'D', value: '靠近交通枢纽', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '技术导向型工业需要靠近科技中心。'
          },
          {
            id: 'q_geo_098',
            question: '工业地域的形成条件不包括（ ）',
            options: [
              { key: 'A', value: '工业集聚', explanation: '' },
              { key: 'B', value: '工业分散', explanation: '' },
              { key: 'C', value: '交通便利', explanation: '' },
              { key: 'D', value: '气候适宜', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '气候适宜不是工业地域形成的主要条件。'
          },
          {
            id: 'q_geo_099',
            question: '工业集聚的好处不包括（ ）',
            options: [
              { key: 'A', value: '共用基础设施', explanation: '' },
              { key: 'B', value: '加强企业间的信息交流和技术协作', explanation: '' },
              { key: 'C', value: '降低运输费用和能源消耗', explanation: '' },
              { key: 'D', value: '增加环境污染', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '增加环境污染是工业集聚的问题，不是好处。'
          },
          {
            id: 'q_geo_100',
            question: '工业分散的原因不包括（ ）',
            options: [
              { key: 'A', value: '寻找最优区位', explanation: '' },
              { key: 'B', value: '降低生产成本', explanation: '' },
              { key: 'C', value: '扩大市场', explanation: '' },
              { key: 'D', value: '减少利润', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '减少利润不是工业分散的原因，工业分散是为了增加利润。'
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
