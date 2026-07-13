class PhysicsChapter extends Chapter {
  constructor() {
    super('physics', '物理', 'fa-atom', '#3498db');
    this.initLevels();
  }

  initLevels() {
    this.levels = [
      {
        levelNumber: 1,
        name: '第一章 运动的描述',
        description: '高一物理第一单元',
        difficulty: 1,
        timeLimit: 180,
        unlocked: true,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_physics_001',
            question: '质点是一个（ ）',
            options: [
              { key: 'A', value: '理想化模型', explanation: '' },
              { key: 'B', value: '真实存在的物体', explanation: '' },
              { key: 'C', value: '很小的物体', explanation: '' },
              { key: 'D', value: '很大的物体', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '质点是一个理想化模型，当物体的大小和形状对所研究的问题影响可以忽略时，可以把物体看成质点。'
          },
          {
            id: 'q_physics_002',
            question: '参考系是（ ）',
            options: [
              { key: 'A', value: '描述物体运动时选作标准的物体', explanation: '' },
              { key: 'B', value: '静止不动的物体', explanation: '' },
              { key: 'C', value: '运动的物体', explanation: '' },
              { key: 'D', value: '地球', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '参考系是描述物体运动时选作标准的物体，可以是静止的，也可以是运动的。'
          },
          {
            id: 'q_physics_003',
            question: '时间和时刻的区别是（ ）',
            options: [
              { key: 'A', value: '时间是一段时间间隔，时刻是一个瞬间', explanation: '' },
              { key: 'B', value: '时间是一个瞬间，时刻是一段时间间隔', explanation: '' },
              { key: 'C', value: '时间和时刻没有区别', explanation: '' },
              { key: 'D', value: '时间比时刻长', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '时间是指两个时刻之间的间隔，时刻是指某一瞬时。'
          },
          {
            id: 'q_physics_004',
            question: '路程和位移的区别是（ ）',
            options: [
              { key: 'A', value: '路程是标量，位移是矢量', explanation: '' },
              { key: 'B', value: '路程是矢量，位移是标量', explanation: '' },
              { key: 'C', value: '路程和位移没有区别', explanation: '' },
              { key: 'D', value: '路程比位移大', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '路程是物体运动轨迹的长度，是标量；位移是从起点到终点的有向线段，是矢量。'
          },
          {
            id: 'q_physics_005',
            question: '速度的定义是（ ）',
            options: [
              { key: 'A', value: '位移与时间的比值', explanation: '' },
              { key: 'B', value: '路程与时间的比值', explanation: '' },
              { key: 'C', value: '时间与位移的比值', explanation: '' },
              { key: 'D', value: '时间与路程的比值', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '速度是位移与时间的比值，是矢量。'
          },
          {
            id: 'q_physics_006',
            question: '平均速度和瞬时速度的区别是（ ）',
            options: [
              { key: 'A', value: '平均速度是一段时间内的速度，瞬时速度是某一时刻的速度', explanation: '' },
              { key: 'B', value: '平均速度是某一时刻的速度，瞬时速度是一段时间内的速度', explanation: '' },
              { key: 'C', value: '平均速度和瞬时速度没有区别', explanation: '' },
              { key: 'D', value: '平均速度比瞬时速度大', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '平均速度是一段时间内位移与时间的比值，瞬时速度是某一时刻的速度。'
          },
          {
            id: 'q_physics_007',
            question: '加速度的定义是（ ）',
            options: [
              { key: 'A', value: '速度变化与时间的比值', explanation: '' },
              { key: 'B', value: '速度与时间的比值', explanation: '' },
              { key: 'C', value: '时间与速度变化的比值', explanation: '' },
              { key: 'D', value: '时间与速度的比值', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '加速度是速度变化与时间的比值，是矢量。'
          },
          {
            id: 'q_physics_008',
            question: '匀速直线运动的特点是（ ）',
            options: [
              { key: 'A', value: '速度大小和方向都不变', explanation: '' },
              { key: 'B', value: '速度大小不变，方向改变', explanation: '' },
              { key: 'C', value: '速度大小改变，方向不变', explanation: '' },
              { key: 'D', value: '速度大小和方向都改变', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '匀速直线运动的速度大小和方向都不变，加速度为零。'
          },
          {
            id: 'q_physics_009',
            question: '匀变速直线运动的特点是（ ）',
            options: [
              { key: 'A', value: '加速度不变', explanation: '' },
              { key: 'B', value: '速度不变', explanation: '' },
              { key: 'C', value: '位移不变', explanation: '' },
              { key: 'D', value: '时间不变', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '匀变速直线运动的加速度不变。'
          },
          {
            id: 'q_physics_010',
            question: '速度-时间图像中，斜率表示（ ）',
            options: [
              { key: 'A', value: '加速度', explanation: '' },
              { key: 'B', value: '速度', explanation: '' },
              { key: 'C', value: '位移', explanation: '' },
              { key: 'D', value: '时间', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '速度-时间图像中，斜率表示加速度。'
          }
        ]
      },
      {
        levelNumber: 2,
        name: '第二章 匀变速直线运动',
        description: '高一物理第二单元',
        difficulty: 1,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_physics_011',
            question: '匀变速直线运动的速度公式是（ ）',
            options: [
              { key: 'A', value: 'v = v₀ + at', explanation: '' },
              { key: 'B', value: 'v = v₀ - at', explanation: '' },
              { key: 'C', value: 'v = v₀ × at', explanation: '' },
              { key: 'D', value: 'v = v₀ ÷ at', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '匀变速直线运动的速度公式是v = v₀ + at。'
          },
          {
            id: 'q_physics_012',
            question: '匀变速直线运动的位移公式是（ ）',
            options: [
              { key: 'A', value: 'x = v₀t + ½at²', explanation: '' },
              { key: 'B', value: 'x = v₀t - ½at²', explanation: '' },
              { key: 'C', value: 'x = v₀t × ½at²', explanation: '' },
              { key: 'D', value: 'x = v₀t ÷ ½at²', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '匀变速直线运动的位移公式是x = v₀t + ½at²。'
          },
          {
            id: 'q_physics_013',
            question: '匀变速直线运动的速度-位移公式是（ ）',
            options: [
              { key: 'A', value: 'v² = v₀² + 2ax', explanation: '' },
              { key: 'B', value: 'v² = v₀² - 2ax', explanation: '' },
              { key: 'C', value: 'v² = v₀² × 2ax', explanation: '' },
              { key: 'D', value: 'v² = v₀² ÷ 2ax', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '匀变速直线运动的速度-位移公式是v² = v₀² + 2ax。'
          },
          {
            id: 'q_physics_014',
            question: '自由落体运动的加速度是（ ）',
            options: [
              { key: 'A', value: 'g = 9.8m/s²', explanation: '' },
              { key: 'B', value: 'g = 10m/s²', explanation: '' },
              { key: 'C', value: 'g = 9.8m/s', explanation: '' },
              { key: 'D', value: 'g = 9.8m', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '自由落体运动的加速度是重力加速度g = 9.8m/s²。'
          },
          {
            id: 'q_physics_015',
            question: '自由落体运动的特点是（ ）',
            options: [
              { key: 'A', value: '初速度为零，只受重力', explanation: '' },
              { key: 'B', value: '初速度不为零，只受重力', explanation: '' },
              { key: 'C', value: '初速度为零，受多个力', explanation: '' },
              { key: 'D', value: '初速度不为零，受多个力', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '自由落体运动是初速度为零，只在重力作用下的运动。'
          },
          {
            id: 'q_physics_016',
            question: '竖直上抛运动的特点是（ ）',
            options: [
              { key: 'A', value: '初速度向上，只受重力', explanation: '' },
              { key: 'B', value: '初速度向下，只受重力', explanation: '' },
              { key: 'C', value: '初速度向上，受多个力', explanation: '' },
              { key: 'D', value: '初速度向下，受多个力', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '竖直上抛运动是初速度向上，只在重力作用下的运动。'
          },
          {
            id: 'q_physics_017',
            question: '做匀加速直线运动的物体，加速度方向与速度方向（ ）',
            options: [
              { key: 'A', value: '相同', explanation: '' },
              { key: 'B', value: '相反', explanation: '' },
              { key: 'C', value: '垂直', explanation: '' },
              { key: 'D', value: '成45°角', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '做匀加速直线运动的物体，加速度方向与速度方向相同。'
          },
          {
            id: 'q_physics_018',
            question: '做匀减速直线运动的物体，加速度方向与速度方向（ ）',
            options: [
              { key: 'A', value: '相同', explanation: '' },
              { key: 'B', value: '相反', explanation: '' },
              { key: 'C', value: '垂直', explanation: '' },
              { key: 'D', value: '成45°角', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '做匀减速直线运动的物体，加速度方向与速度方向相反。'
          },
          {
            id: 'q_physics_019',
            question: '一辆汽车以20m/s的速度行驶，刹车后做匀减速直线运动，加速度大小为5m/s²，则刹车后4s内的位移是（ ）',
            options: [
              { key: 'A', value: '40m', explanation: '' },
              { key: 'B', value: '80m', explanation: '' },
              { key: 'C', value: '20m', explanation: '' },
              { key: 'D', value: '100m', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '汽车刹车后停止所需时间t = v₀/a = 20/5 = 4s，所以4s内的位移x = v₀t - ½at² = 20×4 - ½×5×4² = 80 - 40 = 40m。'
          },
          {
            id: 'q_physics_020',
            question: '一个物体从高处自由落下，下落3s后的速度是（ ）',
            options: [
              { key: 'A', value: '30m/s', explanation: '' },
              { key: 'B', value: '29.4m/s', explanation: '' },
              { key: 'C', value: '9.8m/s', explanation: '' },
              { key: 'D', value: '19.6m/s', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '自由落体运动的速度v = gt = 9.8×3 = 29.4m/s。'
          }
        ]
      },
      {
        levelNumber: 3,
        name: '第三章 相互作用',
        description: '高一物理第三单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_physics_021',
            question: '力的定义是（ ）',
            options: [
              { key: 'A', value: '物体对物体的作用', explanation: '' },
              { key: 'B', value: '物体的运动状态', explanation: '' },
              { key: 'C', value: '物体的质量', explanation: '' },
              { key: 'D', value: '物体的速度', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '力是物体对物体的作用。'
          },
          {
            id: 'q_physics_022',
            question: '力的三要素是（ ）',
            options: [
              { key: 'A', value: '大小、方向、作用点', explanation: '' },
              { key: 'B', value: '大小、质量、加速度', explanation: '' },
              { key: 'C', value: '方向、速度、加速度', explanation: '' },
              { key: 'D', value: '大小、方向、速度', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '力的三要素是大小、方向、作用点。'
          },
          {
            id: 'q_physics_023',
            question: '重力的方向是（ ）',
            options: [
              { key: 'A', value: '竖直向下', explanation: '' },
              { key: 'B', value: '水平向右', explanation: '' },
              { key: 'C', value: '水平向左', explanation: '' },
              { key: 'D', value: '竖直向上', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '重力的方向是竖直向下。'
          },
          {
            id: 'q_physics_024',
            question: '重力的大小是（ ）',
            options: [
              { key: 'A', value: 'G = mg', explanation: '' },
              { key: 'B', value: 'G = m/g', explanation: '' },
              { key: 'C', value: 'G = m + g', explanation: '' },
              { key: 'D', value: 'G = m - g', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '重力的大小G = mg，其中m是物体的质量，g是重力加速度。'
          },
          {
            id: 'q_physics_025',
            question: '弹力的产生条件是（ ）',
            options: [
              { key: 'A', value: '接触且发生弹性形变', explanation: '' },
              { key: 'B', value: '接触但不发生形变', explanation: '' },
              { key: 'C', value: '不接触但发生形变', explanation: '' },
              { key: 'D', value: '不接触且不发生形变', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '弹力产生的条件是两物体接触且发生弹性形变。'
          },
          {
            id: 'q_physics_026',
            question: '胡克定律的表达式是（ ）',
            options: [
              { key: 'A', value: 'F = kx', explanation: '' },
              { key: 'B', value: 'F = k/x', explanation: '' },
              { key: 'C', value: 'F = k + x', explanation: '' },
              { key: 'D', value: 'F = k - x', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '胡克定律的表达式是F = kx，其中k是劲度系数，x是形变量。'
          },
          {
            id: 'q_physics_027',
            question: '摩擦力的产生条件不包括（ ）',
            options: [
              { key: 'A', value: '接触', explanation: '' },
              { key: 'B', value: '有弹力', explanation: '' },
              { key: 'C', value: '有相对运动或相对运动趋势', explanation: '' },
              { key: 'D', value: '光滑接触面', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '光滑接触面没有摩擦力。'
          },
          {
            id: 'q_physics_028',
            question: '滑动摩擦力的大小是（ ）',
            options: [
              { key: 'A', value: 'f = μN', explanation: '' },
              { key: 'B', value: 'f = μ/N', explanation: '' },
              { key: 'C', value: 'f = μ + N', explanation: '' },
              { key: 'D', value: 'f = μ - N', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '滑动摩擦力的大小f = μN，其中μ是动摩擦因数，N是正压力。'
          },
          {
            id: 'q_physics_029',
            question: '静摩擦力的方向是（ ）',
            options: [
              { key: 'A', value: '与相对运动趋势方向相反', explanation: '' },
              { key: 'B', value: '与相对运动趋势方向相同', explanation: '' },
              { key: 'C', value: '竖直向下', explanation: '' },
              { key: 'D', value: '竖直向上', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '静摩擦力的方向与相对运动趋势方向相反。'
          },
          {
            id: 'q_physics_030',
            question: '力的合成遵循（ ）',
            options: [
              { key: 'A', value: '平行四边形定则', explanation: '' },
              { key: 'B', value: '三角形定则', explanation: '' },
              { key: 'C', value: '代数加法', explanation: '' },
              { key: 'D', value: '几何加法', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '力的合成遵循平行四边形定则。'
          }
        ]
      },
      {
        levelNumber: 4,
        name: '第四章 牛顿运动定律',
        description: '高一物理第四单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_physics_031',
            question: '牛顿第一定律的内容是（ ）',
            options: [
              { key: 'A', value: '物体保持静止或匀速直线运动状态，直到有外力改变它', explanation: '' },
              { key: 'B', value: '物体的加速度与合力成正比，与质量成反比', explanation: '' },
              { key: 'C', value: '作用力和反作用力大小相等，方向相反', explanation: '' },
              { key: 'D', value: '物体的速度与合力成正比', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '牛顿第一定律指出物体保持静止或匀速直线运动状态，直到有外力改变它。'
          },
          {
            id: 'q_physics_032',
            question: '牛顿第二定律的表达式是（ ）',
            options: [
              { key: 'A', value: 'F = ma', explanation: '' },
              { key: 'B', value: 'F = m/a', explanation: '' },
              { key: 'C', value: 'F = m + a', explanation: '' },
              { key: 'D', value: 'F = m - a', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '牛顿第二定律的表达式是F = ma。'
          },
          {
            id: 'q_physics_033',
            question: '牛顿第三定律的内容是（ ）',
            options: [
              { key: 'A', value: '作用力和反作用力大小相等，方向相反，作用在不同物体上', explanation: '' },
              { key: 'B', value: '物体保持静止或匀速直线运动状态', explanation: '' },
              { key: 'C', value: '物体的加速度与合力成正比', explanation: '' },
              { key: 'D', value: '物体的速度与合力成正比', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '牛顿第三定律指出作用力和反作用力大小相等，方向相反，作用在不同物体上。'
          },
          {
            id: 'q_physics_034',
            question: '惯性是物体的（ ）',
            options: [
              { key: 'A', value: '固有属性', explanation: '' },
              { key: 'B', value: '运动状态', explanation: '' },
              { key: 'C', value: '受力情况', explanation: '' },
              { key: 'D', value: '加速度', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '惯性是物体的固有属性，与物体的质量有关。'
          },
          {
            id: 'q_physics_035',
            question: '质量和重量的区别是（ ）',
            options: [
              { key: 'A', value: '质量是物体的固有属性，重量是物体受到的重力', explanation: '' },
              { key: 'B', value: '质量是物体受到的重力，重量是物体的固有属性', explanation: '' },
              { key: 'C', value: '质量和重量没有区别', explanation: '' },
              { key: 'D', value: '质量比重量大', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '质量是物体的固有属性，不随位置改变；重量是物体受到的重力，随位置改变。'
          },
          {
            id: 'q_physics_036',
            question: '一个质量为2kg的物体，受到10N的合力作用，其加速度是（ ）',
            options: [
              { key: 'A', value: '5m/s²', explanation: '' },
              { key: 'B', value: '20m/s²', explanation: '' },
              { key: 'C', value: '0.2m/s²', explanation: '' },
              { key: 'D', value: '12m/s²', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '由牛顿第二定律a = F/m = 10/2 = 5m/s²。'
          },
          {
            id: 'q_physics_037',
            question: '一个物体静止在水平面上，受到的重力和支持力是（ ）',
            options: [
              { key: 'A', value: '一对平衡力', explanation: '' },
              { key: 'B', value: '一对作用力和反作用力', explanation: '' },
              { key: 'C', value: '没有关系', explanation: '' },
              { key: 'D', value: '重力大于支持力', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '重力和支持力大小相等，方向相反，作用在同一物体上，是一对平衡力。'
          },
          {
            id: 'q_physics_038',
            question: '物体对桌面的压力和桌面对物体的支持力是（ ）',
            options: [
              { key: 'A', value: '一对平衡力', explanation: '' },
              { key: 'B', value: '一对作用力和反作用力', explanation: '' },
              { key: 'C', value: '没有关系', explanation: '' },
              { key: 'D', value: '压力大于支持力', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '压力和支持力大小相等，方向相反，作用在不同物体上，是一对作用力和反作用力。'
          },
          {
            id: 'q_physics_039',
            question: '当物体处于平衡状态时，合力（ ）',
            options: [
              { key: 'A', value: '为零', explanation: '' },
              { key: 'B', value: '不为零', explanation: '' },
              { key: 'C', value: '大于零', explanation: '' },
              { key: 'D', value: '小于零', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '物体处于平衡状态时，合力为零。'
          },
          {
            id: 'q_physics_040',
            question: '当物体做加速运动时，合力（ ）',
            options: [
              { key: 'A', value: '不为零', explanation: '' },
              { key: 'B', value: '为零', explanation: '' },
              { key: 'C', value: '等于重力', explanation: '' },
              { key: 'D', value: '等于支持力', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '物体做加速运动时，合力不为零，合力方向与加速度方向相同。'
          }
        ]
      },
      {
        levelNumber: 5,
        name: '第五章 曲线运动',
        description: '高一物理第五单元',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_physics_041',
            question: '曲线运动的特点是（ ）',
            options: [
              { key: 'A', value: '速度方向不断改变', explanation: '' },
              { key: 'B', value: '速度大小不断改变', explanation: '' },
              { key: 'C', value: '速度方向不变', explanation: '' },
              { key: 'D', value: '速度大小不变', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '曲线运动的速度方向沿切线方向，不断改变。'
          },
          {
            id: 'q_physics_042',
            question: '曲线运动的条件是（ ）',
            options: [
              { key: 'A', value: '合力方向与速度方向不在同一直线上', explanation: '' },
              { key: 'B', value: '合力方向与速度方向在同一直线上', explanation: '' },
              { key: 'C', value: '合力为零', explanation: '' },
              { key: 'D', value: '速度为零', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '当合力方向与速度方向不在同一直线上时，物体做曲线运动。'
          },
          {
            id: 'q_physics_043',
            question: '平抛运动的特点是（ ）',
            options: [
              { key: 'A', value: '水平方向匀速直线运动，竖直方向自由落体运动', explanation: '' },
              { key: 'B', value: '水平方向匀加速直线运动，竖直方向自由落体运动', explanation: '' },
              { key: 'C', value: '水平方向匀速直线运动，竖直方向匀速直线运动', explanation: '' },
              { key: 'D', value: '水平方向匀加速直线运动，竖直方向匀速直线运动', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '平抛运动可分解为水平方向的匀速直线运动和竖直方向的自由落体运动。'
          },
          {
            id: 'q_physics_044',
            question: '平抛运动的水平位移公式是（ ）',
            options: [
              { key: 'A', value: 'x = v₀t', explanation: '' },
              { key: 'B', value: 'x = ½gt²', explanation: '' },
              { key: 'C', value: 'x = v₀t + ½at²', explanation: '' },
              { key: 'D', value: 'x = v₀²/2g', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '平抛运动的水平位移x = v₀t。'
          },
          {
            id: 'q_physics_045',
            question: '平抛运动的竖直位移公式是（ ）',
            options: [
              { key: 'A', value: 'y = ½gt²', explanation: '' },
              { key: 'B', value: 'y = v₀t', explanation: '' },
              { key: 'C', value: 'y = v₀t + ½at²', explanation: '' },
              { key: 'D', value: 'y = v₀²/2g', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '平抛运动的竖直位移y = ½gt²。'
          },
          {
            id: 'q_physics_046',
            question: '匀速圆周运动的特点是（ ）',
            options: [
              { key: 'A', value: '速度大小不变，方向不断改变', explanation: '' },
              { key: 'B', value: '速度大小和方向都不变', explanation: '' },
              { key: 'C', value: '速度大小不断改变，方向不变', explanation: '' },
              { key: 'D', value: '速度大小和方向都不断改变', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '匀速圆周运动的速度大小不变，方向沿切线方向不断改变。'
          },
          {
            id: 'q_physics_047',
            question: '匀速圆周运动的周期是（ ）',
            options: [
              { key: 'A', value: '物体绕圆周一周所需的时间', explanation: '' },
              { key: 'B', value: '物体绕圆周半周所需的时间', explanation: '' },
              { key: 'C', value: '物体的速度', explanation: '' },
              { key: 'D', value: '物体的加速度', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '周期是物体绕圆周一周所需的时间。'
          },
          {
            id: 'q_physics_048',
            question: '匀速圆周运动的线速度是（ ）',
            options: [
              { key: 'A', value: 'v = 2πr/T', explanation: '' },
              { key: 'B', value: 'v = πr/T', explanation: '' },
              { key: 'C', value: 'v = 2πrT', explanation: '' },
              { key: 'D', value: 'v = πrT', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '匀速圆周运动的线速度v = 2πr/T。'
          },
          {
            id: 'q_physics_049',
            question: '匀速圆周运动的角速度是（ ）',
            options: [
              { key: 'A', value: 'ω = 2π/T', explanation: '' },
              { key: 'B', value: 'ω = π/T', explanation: '' },
              { key: 'C', value: 'ω = 2πT', explanation: '' },
              { key: 'D', value: 'ω = πT', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '匀速圆周运动的角速度ω = 2π/T。'
          },
          {
            id: 'q_physics_050',
            question: '匀速圆周运动的向心加速度是（ ）',
            options: [
              { key: 'A', value: 'a = v²/r', explanation: '' },
              { key: 'B', value: 'a = vr', explanation: '' },
              { key: 'C', value: 'a = v/r', explanation: '' },
              { key: 'D', value: 'a = r/v', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '匀速圆周运动的向心加速度a = v²/r。'
          }
        ]
      },
      {
        levelNumber: 6,
        name: '第六章 万有引力定律',
        description: '高一物理第六单元',
        difficulty: 3,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_physics_051',
            question: '万有引力定律的表达式是（ ）',
            options: [
              { key: 'A', value: 'F = Gm₁m₂/r²', explanation: '' },
              { key: 'B', value: 'F = Gm₁m₂r²', explanation: '' },
              { key: 'C', value: 'F = Gm₁m₂/r', explanation: '' },
              { key: 'D', value: 'F = Gm₁m₂r', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '万有引力定律的表达式是F = Gm₁m₂/r²，其中G是万有引力常量。'
          },
          {
            id: 'q_physics_052',
            question: '万有引力常量G的数值是（ ）',
            options: [
              { key: 'A', value: '6.67×10⁻¹¹ N·m²/kg²', explanation: '' },
              { key: 'B', value: '6.67×10¹¹ N·m²/kg²', explanation: '' },
              { key: 'C', value: '9.8 m/s²', explanation: '' },
              { key: 'D', value: '3.0×10⁸ m/s', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '万有引力常量G = 6.67×10⁻¹¹ N·m²/kg²。'
          },
          {
            id: 'q_physics_053',
            question: '万有引力定律的适用条件是（ ）',
            options: [
              { key: 'A', value: '质点或均匀球体', explanation: '' },
              { key: 'B', value: '任何物体', explanation: '' },
              { key: 'C', value: '只有天体', explanation: '' },
              { key: 'D', value: '只有地面物体', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '万有引力定律适用于质点或均匀球体。'
          },
          {
            id: 'q_physics_054',
            question: '第一宇宙速度是（ ）',
            options: [
              { key: 'A', value: '7.9km/s', explanation: '' },
              { key: 'B', value: '11.2km/s', explanation: '' },
              { key: 'C', value: '16.7km/s', explanation: '' },
              { key: 'D', value: '3.0×10⁸m/s', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '第一宇宙速度是7.9km/s，是卫星绕地球做匀速圆周运动的最小速度。'
          },
          {
            id: 'q_physics_055',
            question: '第二宇宙速度是（ ）',
            options: [
              { key: 'A', value: '7.9km/s', explanation: '' },
              { key: 'B', value: '11.2km/s', explanation: '' },
              { key: 'C', value: '16.7km/s', explanation: '' },
              { key: 'D', value: '3.0×10⁸m/s', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '第二宇宙速度是11.2km/s，是物体脱离地球引力的最小速度。'
          },
          {
            id: 'q_physics_056',
            question: '第三宇宙速度是（ ）',
            options: [
              { key: 'A', value: '7.9km/s', explanation: '' },
              { key: 'B', value: '11.2km/s', explanation: '' },
              { key: 'C', value: '16.7km/s', explanation: '' },
              { key: 'D', value: '3.0×10⁸m/s', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '第三宇宙速度是16.7km/s，是物体脱离太阳引力的最小速度。'
          },
          {
            id: 'q_physics_057',
            question: '开普勒第一定律的内容是（ ）',
            options: [
              { key: 'A', value: '行星绕太阳运动的轨道是椭圆，太阳在椭圆的一个焦点上', explanation: '' },
              { key: 'B', value: '行星与太阳的连线在相等时间内扫过相等的面积', explanation: '' },
              { key: 'C', value: '行星绕太阳运动的周期的平方与轨道半长轴的立方成正比', explanation: '' },
              { key: 'D', value: '行星绕太阳运动的速度与轨道半径成正比', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '开普勒第一定律指出行星绕太阳运动的轨道是椭圆，太阳在椭圆的一个焦点上。'
          },
          {
            id: 'q_physics_058',
            question: '开普勒第二定律的内容是（ ）',
            options: [
              { key: 'A', value: '行星与太阳的连线在相等时间内扫过相等的面积', explanation: '' },
              { key: 'B', value: '行星绕太阳运动的轨道是椭圆，太阳在椭圆的一个焦点上', explanation: '' },
              { key: 'C', value: '行星绕太阳运动的周期的平方与轨道半长轴的立方成正比', explanation: '' },
              { key: 'D', value: '行星绕太阳运动的速度与轨道半径成正比', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '开普勒第二定律指出行星与太阳的连线在相等时间内扫过相等的面积。'
          },
          {
            id: 'q_physics_059',
            question: '开普勒第三定律的内容是（ ）',
            options: [
              { key: 'A', value: '行星绕太阳运动的周期的平方与轨道半长轴的立方成正比', explanation: '' },
              { key: 'B', value: '行星绕太阳运动的轨道是椭圆，太阳在椭圆的一个焦点上', explanation: '' },
              { key: 'C', value: '行星与太阳的连线在相等时间内扫过相等的面积', explanation: '' },
              { key: 'D', value: '行星绕太阳运动的速度与轨道半径成正比', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '开普勒第三定律指出行星绕太阳运动的周期的平方与轨道半长轴的立方成正比。'
          },
          {
            id: 'q_physics_060',
            question: '地球同步卫星的特点是（ ）',
            options: [
              { key: 'A', value: '周期与地球自转周期相同', explanation: '' },
              { key: 'B', value: '周期与地球公转周期相同', explanation: '' },
              { key: 'C', value: '速度与地球自转速度相同', explanation: '' },
              { key: 'D', value: '速度与地球公转速度相同', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '地球同步卫星的周期与地球自转周期相同，为24小时。'
          }
        ]
      },
      {
        levelNumber: 7,
        name: '第七章 机械能守恒定律',
        description: '高一物理第七单元',
        difficulty: 3,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_physics_061',
            question: '功的定义是（ ）',
            options: [
              { key: 'A', value: '力与物体在力的方向上位移的乘积', explanation: '' },
              { key: 'B', value: '力与物体位移的乘积', explanation: '' },
              { key: 'C', value: '力与时间的乘积', explanation: '' },
              { key: 'D', value: '位移与时间的乘积', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '功是力与物体在力的方向上位移的乘积。'
          },
          {
            id: 'q_physics_062',
            question: '功的表达式是（ ）',
            options: [
              { key: 'A', value: 'W = Fxcosθ', explanation: '' },
              { key: 'B', value: 'W = Fx', explanation: '' },
              { key: 'C', value: 'W = F/x', explanation: '' },
              { key: 'D', value: 'W = F + x', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '功的表达式是W = Fxcosθ，其中θ是力与位移的夹角。'
          },
          {
            id: 'q_physics_063',
            question: '功率的定义是（ ）',
            options: [
              { key: 'A', value: '功与时间的比值', explanation: '' },
              { key: 'B', value: '力与速度的乘积', explanation: '' },
              { key: 'C', value: '功与力的比值', explanation: '' },
              { key: 'D', value: '时间与功的比值', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '功率是功与时间的比值。'
          },
          {
            id: 'q_physics_064',
            question: '功率的表达式是（ ）',
            options: [
              { key: 'A', value: 'P = W/t', explanation: '' },
              { key: 'B', value: 'P = Wt', explanation: '' },
              { key: 'C', value: 'P = W/t', explanation: '' },
              { key: 'D', value: 'P = W + t', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '功率的表达式是P = W/t。'
          },
          {
            id: 'q_physics_065',
            question: '动能的表达式是（ ）',
            options: [
              { key: 'A', value: 'Ek = ½mv²', explanation: '' },
              { key: 'B', value: 'Ek = mv²', explanation: '' },
              { key: 'C', value: 'Ek = mv', explanation: '' },
              { key: 'D', value: 'Ek = ½mv', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '动能的表达式是Ek = ½mv²。'
          },
          {
            id: 'q_physics_066',
            question: '重力势能的表达式是（ ）',
            options: [
              { key: 'A', value: 'Ep = mgh', explanation: '' },
              { key: 'B', value: 'Ep = mgh²', explanation: '' },
              { key: 'C', value: 'Ep = mg/h', explanation: '' },
              { key: 'D', value: 'Ep = mg + h', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '重力势能的表达式是Ep = mgh，其中h是物体相对于参考面的高度。'
          },
          {
            id: 'q_physics_067',
            question: '弹性势能的表达式是（ ）',
            options: [
              { key: 'A', value: 'Ep = ½kx²', explanation: '' },
              { key: 'B', value: 'Ep = kx²', explanation: '' },
              { key: 'C', value: 'Ep = kx', explanation: '' },
              { key: 'D', value: 'Ep = ½kx', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '弹性势能的表达式是Ep = ½kx²，其中k是劲度系数，x是形变量。'
          },
          {
            id: 'q_physics_068',
            question: '动能定理的内容是（ ）',
            options: [
              { key: 'A', value: '合外力做的功等于动能的变化', explanation: '' },
              { key: 'B', value: '合外力做的功等于势能的变化', explanation: '' },
              { key: 'C', value: '合外力做的功等于机械能的变化', explanation: '' },
              { key: 'D', value: '合外力做的功等于内能的变化', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '动能定理指出合外力做的功等于动能的变化。'
          },
          {
            id: 'q_physics_069',
            question: '机械能守恒定律的条件是（ ）',
            options: [
              { key: 'A', value: '只有重力或弹力做功', explanation: '' },
              { key: 'B', value: '只有重力做功', explanation: '' },
              { key: 'C', value: '只有弹力做功', explanation: '' },
              { key: 'D', value: '任何力都做功', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '机械能守恒定律的条件是只有重力或弹力做功。'
          },
          {
            id: 'q_physics_070',
            question: '机械能守恒定律的内容是（ ）',
            options: [
              { key: 'A', value: '动能和势能相互转化，机械能总量保持不变', explanation: '' },
              { key: 'B', value: '动能保持不变', explanation: '' },
              { key: 'C', value: '势能保持不变', explanation: '' },
              { key: 'D', value: '动能和势能都保持不变', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '机械能守恒定律指出动能和势能相互转化，机械能总量保持不变。'
          }
        ]
      },
      {
        levelNumber: 8,
        name: '第八章 静电场',
        description: '高一物理第八单元',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_physics_071',
            question: '电荷的种类不包括（ ）',
            options: [
              { key: 'A', value: '正电荷', explanation: '' },
              { key: 'B', value: '负电荷', explanation: '' },
              { key: 'C', value: '中性电荷', explanation: '' },
              { key: 'D', value: '以上都对', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '电荷只有正电荷和负电荷两种，没有中性电荷。'
          },
          {
            id: 'q_physics_072',
            question: '电荷守恒定律的内容是（ ）',
            options: [
              { key: 'A', value: '电荷既不能创生，也不能消灭，只能转移', explanation: '' },
              { key: 'B', value: '电荷可以创生和消灭', explanation: '' },
              { key: 'C', value: '电荷只能增加，不能减少', explanation: '' },
              { key: 'D', value: '电荷只能减少，不能增加', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '电荷守恒定律指出电荷既不能创生，也不能消灭，只能从一个物体转移到另一个物体。'
          },
          {
            id: 'q_physics_073',
            question: '库仑定律的表达式是（ ）',
            options: [
              { key: 'A', value: 'F = kq₁q₂/r²', explanation: '' },
              { key: 'B', value: 'F = kq₁q₂r²', explanation: '' },
              { key: 'C', value: 'F = kq₁q₂/r', explanation: '' },
              { key: 'D', value: 'F = kq₁q₂r', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '库仑定律的表达式是F = kq₁q₂/r²，其中k是静电力常量。'
          },
          {
            id: 'q_physics_074',
            question: '电场强度的定义是（ ）',
            options: [
              { key: 'A', value: '电场力与电荷的比值', explanation: '' },
              { key: 'B', value: '电荷与电场力的比值', explanation: '' },
              { key: 'C', value: '电场力与距离的比值', explanation: '' },
              { key: 'D', value: '距离与电场力的比值', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '电场强度是电场力与电荷的比值，E = F/q。'
          },
          {
            id: 'q_physics_075',
            question: '点电荷的电场强度公式是（ ）',
            options: [
              { key: 'A', value: 'E = kq/r²', explanation: '' },
              { key: 'B', value: 'E = kqr²', explanation: '' },
              { key: 'C', value: 'E = kq/r', explanation: '' },
              { key: 'D', value: 'E = kqr', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '点电荷的电场强度公式是E = kq/r²。'
          },
          {
            id: 'q_physics_076',
            question: '电场线的特点不包括（ ）',
            options: [
              { key: 'A', value: '从正电荷出发，终止于负电荷', explanation: '' },
              { key: 'B', value: '不相交', explanation: '' },
              { key: 'C', value: '不闭合', explanation: '' },
              { key: 'D', value: '可以相交', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '电场线不相交。'
          },
          {
            id: 'q_physics_077',
            question: '电势的定义是（ ）',
            options: [
              { key: 'A', value: '电势能与电荷的比值', explanation: '' },
              { key: 'B', value: '电荷与电势能的比值', explanation: '' },
              { key: 'C', value: '电势能与距离的比值', explanation: '' },
              { key: 'D', value: '距离与电势能的比值', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '电势是电势能与电荷的比值，φ = Ep/q。'
          },
          {
            id: 'q_physics_078',
            question: '电势差的定义是（ ）',
            options: [
              { key: 'A', value: '两点间电势的差值', explanation: '' },
              { key: 'B', value: '两点间电势能的差值', explanation: '' },
              { key: 'C', value: '两点间电场强度的差值', explanation: '' },
              { key: 'D', value: '两点间距离的差值', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '电势差是两点间电势的差值，U = φ₁ - φ₂。'
          },
          {
            id: 'q_physics_079',
            question: '电容器的电容定义是（ ）',
            options: [
              { key: 'A', value: '电荷量与电势差的比值', explanation: '' },
              { key: 'B', value: '电势差与电荷量的比值', explanation: '' },
              { key: 'C', value: '电荷量与距离的比值', explanation: '' },
              { key: 'D', value: '距离与电荷量的比值', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '电容是电荷量与电势差的比值，C = Q/U。'
          },
          {
            id: 'q_physics_080',
            question: '平行板电容器的电容公式是（ ）',
            options: [
              { key: 'A', value: 'C = εS/d', explanation: '' },
              { key: 'B', value: 'C = εSd', explanation: '' },
              { key: 'C', value: 'C = ε/Sd', explanation: '' },
              { key: 'D', value: 'C = d/εS', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '平行板电容器的电容公式是C = εS/d，其中ε是介电常数，S是极板面积，d是极板间距。'
          }
        ]
      },
      {
        levelNumber: 9,
        name: '第九章 恒定电流',
        description: '高一物理第九单元',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_physics_081',
            question: '电流的定义是（ ）',
            options: [
              { key: 'A', value: '单位时间内通过导体横截面的电荷量', explanation: '' },
              { key: 'B', value: '单位时间内通过导体的电子数', explanation: '' },
              { key: 'C', value: '导体横截面的面积', explanation: '' },
              { key: 'D', value: '导体的长度', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '电流是单位时间内通过导体横截面的电荷量。'
          },
          {
            id: 'q_physics_082',
            question: '电流的表达式是（ ）',
            options: [
              { key: 'A', value: 'I = Q/t', explanation: '' },
              { key: 'B', value: 'I = Qt', explanation: '' },
              { key: 'C', value: 'I = Q/t', explanation: '' },
              { key: 'D', value: 'I = Q + t', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '电流的表达式是I = Q/t。'
          },
          {
            id: 'q_physics_083',
            question: '欧姆定律的表达式是（ ）',
            options: [
              { key: 'A', value: 'I = U/R', explanation: '' },
              { key: 'B', value: 'I = UR', explanation: '' },
              { key: 'C', value: 'I = U/R', explanation: '' },
              { key: 'D', value: 'I = U + R', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '欧姆定律的表达式是I = U/R。'
          },
          {
            id: 'q_physics_084',
            question: '电阻的定义是（ ）',
            options: [
              { key: 'A', value: '导体对电流的阻碍作用', explanation: '' },
              { key: 'B', value: '导体对电流的促进作用', explanation: '' },
              { key: 'C', value: '导体的长度', explanation: '' },
              { key: 'D', value: '导体的横截面积', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '电阻是导体对电流的阻碍作用。'
          },
          {
            id: 'q_physics_085',
            question: '电阻定律的表达式是（ ）',
            options: [
              { key: 'A', value: 'R = ρL/S', explanation: '' },
              { key: 'B', value: 'R = ρLS', explanation: '' },
              { key: 'C', value: 'R = ρ/LS', explanation: '' },
              { key: 'D', value: 'R = S/ρL', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '电阻定律的表达式是R = ρL/S，其中ρ是电阻率，L是导体长度，S是横截面积。'
          },
          {
            id: 'q_physics_086',
            question: '串联电路的特点不包括（ ）',
            options: [
              { key: 'A', value: '电流处处相等', explanation: '' },
              { key: 'B', value: '总电压等于各部分电压之和', explanation: '' },
              { key: 'C', value: '总电阻等于各部分电阻之和', explanation: '' },
              { key: 'D', value: '电压处处相等', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '串联电路中电压不是处处相等的。'
          },
          {
            id: 'q_physics_087',
            question: '并联电路的特点不包括（ ）',
            options: [
              { key: 'A', value: '电压处处相等', explanation: '' },
              { key: 'B', value: '总电流等于各支路电流之和', explanation: '' },
              { key: 'C', value: '总电阻的倒数等于各支路电阻倒数之和', explanation: '' },
              { key: 'D', value: '电流处处相等', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '并联电路中电流不是处处相等的。'
          },
          {
            id: 'q_physics_088',
            question: '电功的表达式是（ ）',
            options: [
              { key: 'A', value: 'W = UIt', explanation: '' },
              { key: 'B', value: 'W = UI/t', explanation: '' },
              { key: 'C', value: 'W = UIt', explanation: '' },
              { key: 'D', value: 'W = UI + t', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '电功的表达式是W = UIt。'
          },
          {
            id: 'q_physics_089',
            question: '电功率的表达式是（ ）',
            options: [
              { key: 'A', value: 'P = UI', explanation: '' },
              { key: 'B', value: 'P = U/I', explanation: '' },
              { key: 'C', value: 'P = UI', explanation: '' },
              { key: 'D', value: 'P = U + I', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '电功率的表达式是P = UI。'
          },
          {
            id: 'q_physics_090',
            question: '焦耳定律的表达式是（ ）',
            options: [
              { key: 'A', value: 'Q = I²Rt', explanation: '' },
              { key: 'B', value: 'Q = IRt', explanation: '' },
              { key: 'C', value: 'Q = I²Rt', explanation: '' },
              { key: 'D', value: 'Q = I + R + t', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '焦耳定律的表达式是Q = I²Rt。'
          }
        ]
      },
      {
        levelNumber: 10,
        name: '第十章 磁场',
        description: '高一物理第十单元',
        difficulty: 5,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_physics_091',
            question: '磁场的基本性质是（ ）',
            options: [
              { key: 'A', value: '对放入其中的磁体或电流有力的作用', explanation: '' },
              { key: 'B', value: '对放入其中的电荷有力的作用', explanation: '' },
              { key: 'C', value: '对放入其中的物体有吸引作用', explanation: '' },
              { key: 'D', value: '对放入其中的物体有排斥作用', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '磁场的基本性质是对放入其中的磁体或电流有力的作用。'
          },
          {
            id: 'q_physics_092',
            question: '磁感线的特点不包括（ ）',
            options: [
              { key: 'A', value: '闭合曲线', explanation: '' },
              { key: 'B', value: '不相交', explanation: '' },
              { key: 'C', value: '从N极出发，回到S极', explanation: '' },
              { key: 'D', value: '不闭合', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '磁感线是闭合曲线。'
          },
          {
            id: 'q_physics_093',
            question: '安培力的定义是（ ）',
            options: [
              { key: 'A', value: '磁场对通电导体的作用力', explanation: '' },
              { key: 'B', value: '电场对电荷的作用力', explanation: '' },
              { key: 'C', value: '磁场对磁体的作用力', explanation: '' },
              { key: 'D', value: '电场对导体的作用力', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '安培力是磁场对通电导体的作用力。'
          },
          {
            id: 'q_physics_094',
            question: '安培力的表达式是（ ）',
            options: [
              { key: 'A', value: 'F = BILsinθ', explanation: '' },
              { key: 'B', value: 'F = BIL', explanation: '' },
              { key: 'C', value: 'F = BI/L', explanation: '' },
              { key: 'D', value: 'F = B + I + L', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '安培力的表达式是F = BILsinθ，其中θ是电流方向与磁场方向的夹角。'
          },
          {
            id: 'q_physics_095',
            question: '洛伦兹力的定义是（ ）',
            options: [
              { key: 'A', value: '磁场对运动电荷的作用力', explanation: '' },
              { key: 'B', value: '电场对电荷的作用力', explanation: '' },
              { key: 'C', value: '磁场对通电导体的作用力', explanation: '' },
              { key: 'D', value: '电场对导体的作用力', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '洛伦兹力是磁场对运动电荷的作用力。'
          },
          {
            id: 'q_physics_096',
            question: '洛伦兹力的表达式是（ ）',
            options: [
              { key: 'A', value: 'f = qvBsinθ', explanation: '' },
              { key: 'B', value: 'f = qvB', explanation: '' },
              { key: 'C', value: 'f = qv/B', explanation: '' },
              { key: 'D', value: 'f = q + v + B', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '洛伦兹力的表达式是f = qvBsinθ，其中θ是电荷运动方向与磁场方向的夹角。'
          },
          {
            id: 'q_physics_097',
            question: '安培定则（右手螺旋定则）用于判断（ ）',
            options: [
              { key: 'A', value: '电流产生的磁场方向', explanation: '' },
              { key: 'B', value: '磁场产生的电流方向', explanation: '' },
              { key: 'C', value: '安培力的方向', explanation: '' },
              { key: 'D', value: '洛伦兹力的方向', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '安培定则用于判断电流产生的磁场方向。'
          },
          {
            id: 'q_physics_098',
            question: '左手定则用于判断（ ）',
            options: [
              { key: 'A', value: '安培力或洛伦兹力的方向', explanation: '' },
              { key: 'B', value: '电流产生的磁场方向', explanation: '' },
              { key: 'C', value: '磁场产生的电流方向', explanation: '' },
              { key: 'D', value: '电场力的方向', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '左手定则用于判断安培力或洛伦兹力的方向。'
          },
          {
            id: 'q_physics_099',
            question: '匀强磁场的特点是（ ）',
            options: [
              { key: 'A', value: '磁感应强度大小和方向都不变', explanation: '' },
              { key: 'B', value: '磁感应强度大小不变，方向改变', explanation: '' },
              { key: 'C', value: '磁感应强度大小改变，方向不变', explanation: '' },
              { key: 'D', value: '磁感应强度大小和方向都改变', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '匀强磁场的磁感应强度大小和方向都不变。'
          },
          {
            id: 'q_physics_100',
            question: '运动电荷在匀强磁场中做匀速圆周运动的半径公式是（ ）',
            options: [
              { key: 'A', value: 'r = mv/qB', explanation: '' },
              { key: 'B', value: 'r = mq/vB', explanation: '' },
              { key: 'C', value: 'r = mvB/q', explanation: '' },
              { key: 'D', value: 'r = qB/mv', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '运动电荷在匀强磁场中做匀速圆周运动的半径r = mv/qB。'
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
