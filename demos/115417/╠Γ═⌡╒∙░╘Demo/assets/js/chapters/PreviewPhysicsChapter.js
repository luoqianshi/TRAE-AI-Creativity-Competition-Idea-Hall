class PreviewPhysicsChapter extends PreviewChapter {
  constructor() {
    super('preview_physics', '物理', 'fa-atom', '#9b59b6');
    this.initUnits();
  }

  initUnits() {
    this.units = [
      {
        unitNumber: 1,
        name: '第一章 运动的描述',
        description: '质点、参考系与运动描述',
        knowledgePoints: [
          {
            id: 'kp_physics_001',
            title: '质点与参考系',
            content: '质点：当物体的大小和形状对所研究的问题影响可以忽略不计时，就可以把物体看成质点。质点是一种理想化模型，不是真实存在的物体。把物体看成质点的条件：物体的大小和形状对所研究的问题影响可忽略；物体上各点的运动情况完全相同（平动）。参考系：描述物体的运动时，需要选择一个参考标准，这个被选作标准的物体叫做参考系。选择不同的参考系，对同一物体运动的描述可能不同，这就是运动的相对性。通常以地面为参考系。'
          },
          {
            id: 'kp_physics_002',
            title: '位移与路程',
            content: '位移：从初位置到末位置的有向线段，是矢量。既有大小又有方向，大小等于初末位置间的直线距离。路程：物体运动轨迹的长度，是标量。只有大小，没有方向。位移与路程的关系：位移大小 ≤ 路程；只有在单向直线运动中，位移大小才等于路程；位移是矢量，路程是标量。'
          },
          {
            id: 'kp_physics_003',
            title: '速度与速率',
            content: '速度：位移与发生这段位移所用时间的比值，是矢量。公式：v = Δx/Δt，单位：m/s。平均速度：总位移与总时间的比值。瞬时速度：物体在某一时刻或某一位置的速度。速率：瞬时速度的大小，是标量。平均速率 = 路程/时间。'
          }
        ],
        questions: [
          {
            id: 'pq_physics_001',
            knowledgePointId: 'kp_physics_001',
            question: '关于质点和参考系，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '研究地球绕太阳公转时，可以把地球看成质点', explanation: '地球绕太阳公转时，地球的大小相对于轨道半径可以忽略，可以看成质点。' },
              { key: 'B', value: '研究地球自转时，可以把地球看成质点', explanation: '研究地球自转时，地球的大小和形状不能忽略，不能看成质点。' },
              { key: 'C', value: '质点是真实存在的微小物体', explanation: '质点是理想化模型，不是真实存在的物体。' },
              { key: 'D', value: '坐在行驶的火车上的人，以地面为参考系是静止的', explanation: '以地面为参考系，火车上的人是运动的，不是静止的。' },
              { key: 'E', value: '参考系的选择是任意的', explanation: '参考系可以任意选择，但选择不同的参考系，对运动的描述不同。' }
            ],
            correctAnswer: 'A',
            explanation: 'A：公转时地球大小可忽略，可看作质点 ✓\nB：自转时地球大小不可忽略 ✗\nC：质点是理想模型，不真实存在 ✗\nD：以地面为参考系，人在运动 ✗\nE：参考系可以任意选择 ✗\n\n选A。'
          },
          {
            id: 'pq_physics_002',
            knowledgePointId: 'kp_physics_002',
            question: '一个物体从A点出发沿半径为R的圆周运动一周回到A点，关于位移和路程，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '位移大小为0', explanation: '物体从A点出发又回到A点，初末位置相同，位移为0。' },
              { key: 'B', value: '路程为0', explanation: '路程是运动轨迹的长度，运动一周的路程是圆周长2πR，不是0。' },
              { key: 'C', value: '位移大小为2πR', explanation: '位移大小为0，不是2πR。' },
              { key: 'D', value: '路程为2πR', explanation: '物体沿圆周运动一周，轨迹长度等于圆周长2πR。' },
              { key: 'E', value: '位移大小等于路程', explanation: '位移为0，路程为2πR，不相等。' }
            ],
            correctAnswer: 'A',
            explanation: '物体运动一周回到起点：\n初末位置相同，位移为0（A正确，C错误）\n运动轨迹是圆周长，路程为2πR（D错误，B错误）\n位移（0）≠ 路程（2πR）（E错误）\n\n选A。'
          },
          {
            id: 'pq_physics_003',
            knowledgePointId: 'kp_physics_003',
            question: '一个物体做直线运动，前一半位移的平均速度为4m/s，后一半位移的平均速度为6m/s，则全程的平均速度为（ ）',
            options: [
              { key: 'A', value: '4.8m/s', explanation: '设总位移为2s，则前一半时间t₁ = s/4，后一半时间t₂ = s/6，总时间t = s/4 + s/6 = 5s/12。平均速度v = 2s/(5s/12) = 24/5 = 4.8m/s。' },
              { key: 'B', value: '5.0m/s', explanation: '这是(4+6)/2=5，是算术平均值，但平均速度不是速度的算术平均。' },
              { key: 'C', value: '5.2m/s', explanation: '计算错误。' },
              { key: 'D', value: '5.5m/s', explanation: '计算错误。' },
              { key: 'E', value: '6.0m/s', explanation: '计算错误。' }
            ],
            correctAnswer: 'A',
            explanation: '设总位移为2s，则：\n前一半位移时间：t₁ = s/4\n后一半位移时间：t₂ = s/6\n总时间：t = s/4 + s/6 = (3s+2s)/12 = 5s/12\n平均速度：v = 2s ÷ (5s/12) = 2s × 12/(5s) = 24/5 = 4.8 m/s\n\n注意：平均速度不能简单取速度的算术平均值，选A。'
          }
        ]
      },
      {
        unitNumber: 2,
        name: '第二章 匀变速直线运动',
        description: '加速度与匀变速直线运动规律',
        knowledgePoints: [
          {
            id: 'kp_physics_004',
            title: '加速度',
            content: '加速度：描述速度变化快慢和方向的物理量，是矢量。定义式：a = Δv/Δt = (v - v₀)/t，单位：m/s²。加速度与速度的关系：a与v同向，物体做加速运动；a与v反向，物体做减速运动；a = 0，物体做匀速直线运动。'
          },
          {
            id: 'kp_physics_005',
            title: '匀变速直线运动公式',
            content: '匀变速直线运动的基本公式（五个物理量：v₀, v, a, t, x）：1. 速度公式：v = v₀ + at（不含x）；2. 位移公式：x = v₀t + ½at²（不含v）；3. 速度-位移公式：v² - v₀² = 2ax（不含t）；4. 平均速度公式：x = (v₀ + v)t/2。'
          },
          {
            id: 'kp_physics_006',
            title: '自由落体运动',
            content: '自由落体运动：物体只在重力作用下从静止开始下落的运动。是初速度v₀ = 0，加速度a = g的匀加速直线运动。重力加速度g：通常取g = 9.8m/s²，近似计算可取g = 10m/s²。自由落体公式：v = gt；h = ½gt²；v² = 2gh。'
          }
        ],
        questions: [
          {
            id: 'pq_physics_004',
            knowledgePointId: 'kp_physics_004',
            question: '一个物体做匀变速直线运动，初速度为5m/s，经过2s后末速度为-1m/s，则加速度为（ ）',
            options: [
              { key: 'A', value: '-3m/s²', explanation: 'a = (v - v₀)/t = (-1 - 5)/2 = -6/2 = -3m/s²。' },
              { key: 'B', value: '3m/s²', explanation: '方向错误，加速度为负值。' },
              { key: 'C', value: '-2m/s²', explanation: '计算错误，(-1-5)/2 = -6/2 = -3，不是-2。' },
              { key: 'D', value: '2m/s²', explanation: '计算错误且方向错误。' },
              { key: 'E', value: '-1m/s²', explanation: '计算错误。' }
            ],
            correctAnswer: 'A',
            explanation: '根据加速度定义式a = Δv/Δt = (v - v₀)/t：\n代入数据：a = (-1 - 5)/2 = -6/2 = -3 m/s²\n加速度为负值，说明加速度方向与初速度方向相反，物体做减速运动并最终反向运动。\n\n选A。'
          },
          {
            id: 'pq_physics_005',
            knowledgePointId: 'kp_physics_005',
            question: '一个物体做匀加速直线运动，初速度为2m/s，加速度为3m/s²，则物体在前3s内的位移是（ ）',
            options: [
              { key: 'A', value: '15m', explanation: '计算错误。' },
              { key: 'B', value: '16.5m', explanation: '计算错误。' },
              { key: 'C', value: '18m', explanation: '计算错误。' },
              { key: 'D', value: '19.5m', explanation: 'x = v₀t + ½at² = 2×3 + ½×3×3² = 6 + ½×3×9 = 6 + 13.5 = 19.5m。' },
              { key: 'E', value: '21m', explanation: '计算错误。' }
            ],
            correctAnswer: 'D',
            explanation: '已知v₀ = 2m/s，a = 3m/s²，t = 3s。\n根据位移公式x = v₀t + ½at²：\nx = 2×3 + ½×3×3² = 6 + 0.5×3×9 = 6 + 13.5 = 19.5m\n\n选D。'
          },
          {
            id: 'pq_physics_006',
            knowledgePointId: 'kp_physics_006',
            question: '一个物体从高度为45m的楼顶自由落下（g取10m/s²），下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '下落时间为3s', explanation: '由h = ½gt²，得t = √(2h/g) = √(2×45/10) = √9 = 3s。' },
              { key: 'B', value: '落地速度为30m/s', explanation: 'v = gt = 10×3 = 30m/s。' },
              { key: 'C', value: '第1s内下落的高度为5m', explanation: 'h₁ = ½g×1² = ½×10×1 = 5m。' },
              { key: 'D', value: '落地速度与质量有关', explanation: '自由落体运动中，落地速度只与高度和g有关，与质量无关。' },
              { key: 'E', value: '下落过程中加速度逐渐增大', explanation: '自由落体运动中加速度恒为g，不变。' }
            ],
            correctAnswer: 'A',
            explanation: 'A：t = √(2×45/10) = 3s ✓\nB：v = 10×3 = 30m/s ✗\nC：h₁ = ½×10×1 = 5m ✗\nD：落地速度与质量无关 ✗\nE：加速度恒为g，不变 ✗\n\n选A。'
          }
        ]
      },
      {
        unitNumber: 3,
        name: '第三章 相互作用——力',
        description: '重力、弹力与摩擦力',
        knowledgePoints: [
          {
            id: 'kp_physics_007',
            title: '重力与弹力',
            content: '重力：由于地球的吸引而使物体受到的力。大小：G = mg，方向：竖直向下，作用点：重心。弹力：发生弹性形变的物体，由于要恢复原状，对与它接触的物体产生力的作用。产生的条件：接触且发生弹性形变。胡克定律：弹簧发生弹性形变时，弹力的大小F与弹簧的伸长量(或缩短量)x成正比。F = kx，其中k是弹簧的劲度系数。'
          },
          {
            id: 'kp_physics_008',
            title: '摩擦力',
            content: '静摩擦力：两个相互接触的物体，有相对运动趋势时，在接触面上产生的阻碍相对运动趋势的力。大小：0 ≤ f ≤ f_max，方向：与相对运动趋势方向相反。滑动摩擦力：两个相互接触的物体，发生相对滑动时，在接触面上产生的阻碍相对滑动的力。大小：f = μN，方向：与相对运动方向相反。摩擦力的产生条件：接触、挤压（有正压力）、接触面粗糙、有相对运动或相对运动趋势。'
          }
        ],
        questions: [
          {
            id: 'pq_physics_007',
            knowledgePointId: 'kp_physics_007',
            question: '关于重力和弹力，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '重力的方向总是竖直向下的', explanation: '重力的方向是竖直向下（指向地心）。' },
              { key: 'B', value: '物体的重心一定在物体上', explanation: '重心不一定在物体上，如圆环的重心在圆心（不在环上）。' },
              { key: 'C', value: '弹力产生的条件是两物体接触且发生弹性形变', explanation: '弹力产生的条件是接触和弹性形变。' },
              { key: 'D', value: '根据胡克定律F = kx，k与弹力F成正比', explanation: 'k是弹簧的劲度系数，是弹簧本身的性质，与F无关。' },
              { key: 'E', value: '重力的施力物体是地球', explanation: '重力是地球对物体的吸引力，施力物体是地球。' }
            ],
            correctAnswer: 'A',
            explanation: 'A：重力方向竖直向下 ✓\nB：重心不一定在物体上，如圆环 ✗\nC：接触+弹性形变=弹力 ✗\nD：k是弹簧自身属性，与F无关 ✗\nE：施力物体是地球 ✗\n\n选A。'
          },
          {
            id: 'pq_physics_008',
            knowledgePointId: 'kp_physics_008',
            question: '关于摩擦力，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '静摩擦力的方向可能与物体运动方向相同', explanation: '静摩擦力的方向与相对运动趋势方向相反，但可以与物体的运动方向相同，如人走路时脚受到的静摩擦力方向向前，与人运动方向相同。' },
              { key: 'B', value: '滑动摩擦力的大小与物体的运动速度有关', explanation: '滑动摩擦力f = μN，与速度无关，只与μ和N有关。' },
              { key: 'C', value: '滑动摩擦力的大小f = μN，其中N是正压力', explanation: '滑动摩擦力公式f = μN，N是正压力。' },
              { key: 'D', value: '摩擦力总是阻碍物体的运动', explanation: '摩擦力阻碍的是相对运动（趋势），不一定是物体的运动，如传送带上的物体受到的摩擦力是动力。' },
              { key: 'E', value: '静止的物体不可能受到滑动摩擦力', explanation: '静止的物体可能受到滑动摩擦力，如地面上静止的物体被另一个物体摩擦时。' }
            ],
            correctAnswer: 'A',
            explanation: 'A：静摩擦力可以是动力，方向与运动方向相同 ✓\nB：f = μN，与速度无关 ✗\nC：f = μN，N是正压力 ✗\nD：摩擦力可以是动力，不总是阻力 ✗\nE：静止物体也可能受滑动摩擦力 ✗\n\n选A。'
          }
        ]
      },
      {
        unitNumber: 4,
        name: '第四章 牛顿运动定律',
        description: '牛顿第二定律与力学应用',
        knowledgePoints: [
          {
            id: 'kp_physics_009',
            title: '牛顿第二定律',
            content: '牛顿第二定律：物体加速度的大小跟作用力成正比，跟物体的质量成反比，加速度的方向跟作用力的方向相同。表达式：F = ma。F = ma的理解：F是物体所受的合外力；a与F同向；瞬时性：F与a同时产生、同时变化、同时消失；矢量性：F和a都是矢量。'
          }
        ],
        questions: [
          {
            id: 'pq_physics_009',
            knowledgePointId: 'kp_physics_009',
            question: '一个质量为2kg的物体，在水平面上受到一个大小为10N的水平拉力，物体与地面间的动摩擦因数为0.2，g取10m/s²，则物体的加速度为（ ）',
            options: [
              { key: 'A', value: '1m/s²', explanation: '计算错误。' },
              { key: 'B', value: '2m/s²', explanation: '计算错误。' },
              { key: 'C', value: '3m/s²', explanation: '摩擦力f = μN = μmg = 0.2×2×10 = 4N，合外力F合 = F - f = 10 - 4 = 6N，a = F合/m = 6/2 = 3m/s²。' },
              { key: 'D', value: '4m/s²', explanation: '计算错误。' },
              { key: 'E', value: '5m/s²', explanation: '忘记减去摩擦力，a = F/m = 10/2 = 5m/s²，错误。' }
            ],
            correctAnswer: 'C',
            explanation: '根据牛顿第二定律F合 = ma：\n1. 计算摩擦力：f = μN = μmg = 0.2×2×10 = 4N\n2. 计算合外力：F合 = F - f = 10 - 4 = 6N\n3. 计算加速度：a = F合/m = 6/2 = 3m/s²\n\n选C。'
          }
        ]
      }
    ];
  }
}