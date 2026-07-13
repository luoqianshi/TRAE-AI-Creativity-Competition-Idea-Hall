class PreviewMathChapter extends PreviewChapter {
  constructor() {
    super('preview_math', '数学', 'fa-calculator', '#3498db');
    this.initUnits();
  }

  initUnits() {
    this.units = [
      {
        unitNumber: 1,
        name: '第一章 集合与常用逻辑用语',
        description: '集合的概念与运算、充分条件与必要条件',
        knowledgePoints: [
          {
            id: 'kp_math_001',
            title: '集合的概念与特征',
            content: '集合是指具有某种特定性质的具体的或抽象的对象汇总成的集体，这些对象称为该集合的元素。集合中的元素具有三大特性：\n\n- 确定性：给定一个集合，任何一个对象是不是这个集合的元素是确定的。\n- 互异性：一个集合中的元素是互不相同的。\n- 无序性：集合中的元素没有顺序之分。\n\n常见的数集表示：\n- N：自然数集（含0）\n- N*或N+：正整数集\n- Z：整数集\n- Q：有理数集\n- R：实数集'
          },
          {
            id: 'kp_math_002',
            title: '集合的表示方法',
            content: '常用的集合表示方法有列举法、描述法和图示法（韦恩图）。\n\n- 列举法：将集合中的元素一一列举出来，并用花括号{}括起来。例如：{1, 2, 3, 4, 5}。\n- 描述法：用集合所含元素的共同特征来表示集合。一般形式：{x | x具有的性质}。例如：{x | x是小于10的正整数}。\n- 图示法：用韦恩图直观表示集合之间的关系。'
          },
          {
            id: 'kp_math_003',
            title: '集合间的基本关系',
            content: '集合间的基本关系包括子集、真子集、相等和空集。\n\n- 子集：如果集合A的任意一个元素都是集合B的元素，那么集合A称为集合B的子集，记作A ⊆ B。任何集合都是它本身的子集，即A ⊆ A。\n- 真子集：如果A ⊆ B且A ≠ B，那么集合A称为集合B的真子集，记作A ⊂ B。\n- 相等：如果A ⊆ B且B ⊆ A，那么集合A与集合B相等，记作A = B。\n- 空集：不含任何元素的集合叫做空集，记作∅。空集是任何集合的子集，是任何非空集合的真子集。'
          },
          {
            id: 'kp_math_004',
            title: '集合的基本运算',
            content: '集合的基本运算包括交集、并集、补集。\n\n- 交集：由所有属于集合A且属于集合B的元素所组成的集合，记作A ∩ B。性质：A ∩ B = B ∩ A，A ∩ ∅ = ∅，A ∩ A = A。\n- 并集：由所有属于集合A或属于集合B的元素所组成的集合，记作A ∪ B。性质：A ∪ B = B ∪ A，A ∪ ∅ = A，A ∪ A = A。\n- 补集：设U是全集，A是U的一个子集，由U中所有不属于A的元素组成的集合，称为集合A在全集U中的补集，记作∁_U A。性质：A ∪ ∁_U A = U，A ∩ ∁_U A = ∅，∁_U(∁_U A) = A。'
          },
          {
            id: 'kp_math_005',
            title: '充分条件与必要条件',
            content: '- 充分条件：如果p ⇒ q（p能推出q），那么p是q的充分条件。\n- 必要条件：如果q ⇒ p（q能推出p），那么p是q的必要条件。\n- 充要条件：如果p ⇒ q且q ⇒ p，那么p是q的充要条件。\n- 既不充分也不必要条件：如果p ⇏ q且q ⇏ p，那么p是q的既不充分也不必要条件。'
          }
        ],
        questions: [
          {
            id: 'pq_math_001',
            knowledgePointId: 'kp_math_001',
            question: '下列各组对象中，能构成集合的是（ ）',
            options: [
              { key: 'A', value: '所有的好人', explanation: '"好人"没有明确的判定标准，不具有确定性，不能构成集合。' },
              { key: 'B', value: '著名的数学家', explanation: '"著名"的标准因人而异，不具有确定性，不能构成集合。' },
              { key: 'C', value: '2024年巴黎奥运会中国金牌获得者', explanation: '有明确的判定标准，具有确定性，可以构成集合。' },
              { key: 'D', value: '接近于0的数', explanation: '"接近"没有明确的界限，不具有确定性，不能构成集合。' },
              { key: 'E', value: '方程x²-1=0的所有实数根', explanation: '方程的根是确定的（x=1或x=-1），具有确定性，可以构成集合。' }
            ],
            correctAnswer: 'C',
            explanation: '判断一组对象能否构成集合，关键看是否具有确定性。选项C有明确的判定标准，而其他选项都没有明确的判定标准，因此选C。'
          },
          {
            id: 'pq_math_002',
            knowledgePointId: 'kp_math_002',
            question: '用描述法表示"所有大于-3且小于等于5的整数组成的集合"（ ）',
            options: [
              { key: 'A', value: '{-2, -1, 0, 1, 2, 3, 4, 5}', explanation: '这是列举法，不是描述法，不符合题意。' },
              { key: 'B', value: '{x | -3 < x ≤ 5}', explanation: '没有限定x的范围，x可能是实数，不符合"整数"的要求。' },
              { key: 'C', value: '{x ∈ Z | -3 < x ≤ 5}', explanation: 'x ∈ Z表示x是整数，-3 < x ≤ 5表示x的范围，正确。' },
              { key: 'D', value: '{x ∈ R | -3 < x ≤ 5}', explanation: 'x ∈ R表示x是实数，不符合"整数"的要求。' },
              { key: 'E', value: '{x ∈ N | -3 < x ≤ 5}', explanation: 'x ∈ N表示x是自然数（含0），会漏掉负整数-2和-1。' }
            ],
            correctAnswer: 'C',
            explanation: '描述法需要明确元素的范围和性质。这里要求是整数，所以需要用x ∈ Z来限定，选C。'
          },
          {
            id: 'pq_math_003',
            knowledgePointId: 'kp_math_003',
            question: '设集合A = {x | x²-4=0}，集合B = {-2, 0, 2}，则下列关系正确的是（ ）',
            options: [
              { key: 'A', value: 'A = B', explanation: '集合A={-2, 2}，集合B={-2, 0, 2}，元素不同，A≠B。' },
              { key: 'B', value: 'A ⊂ B', explanation: '集合A的所有元素都是集合B的元素，且B中含有A没有的元素0，所以A是B的真子集。' },
              { key: 'C', value: 'B ⊂ A', explanation: '集合B中有元素0不属于A，所以B不是A的子集。' },
              { key: 'D', value: 'A ∉ B', explanation: 'A是集合，B的元素是-2,0,2，A不是B的元素，但这不是集合间的基本关系。' },
              { key: 'E', value: '∅ ⊂ A', explanation: '空集是任何非空集合的真子集，A={-2,2}是非空集合，所以∅⊂A。' }
            ],
            correctAnswer: 'B',
            explanation: '先解方程x²-4=0得x=±2，所以A={-2,2}。A的所有元素都在B中且B含有A没有的元素，所以A⊂B，选B。'
          },
          {
            id: 'pq_math_004',
            knowledgePointId: 'kp_math_004',
            question: '设全集U = {x | x是小于10的正整数}，集合A = {1, 2, 3, 4}，集合B = {3, 4, 5, 6}，则下列运算结果正确的是（ ）',
            options: [
              { key: 'A', value: 'A ∩ B = {3, 4}', explanation: '交集是由同时属于A和B的元素组成，A和B共有的元素是3和4，正确。' },
              { key: 'B', value: 'A ∪ B = {1, 2, 3, 4, 5, 6}', explanation: '并集是由属于A或属于B的元素组成，正确。' },
              { key: 'C', value: '∁_U A = {5, 6, 7, 8, 9}', explanation: '全集U={1,2,3,4,5,6,7,8,9}，A的补集是U中不属于A的元素，即{5,6,7,8,9}，正确。' },
              { key: 'D', value: '∁_U(A ∪ B) = {7, 8, 9}', explanation: 'A∪B={1,2,3,4,5,6}，其补集是{7,8,9}，正确。' },
              { key: 'E', value: 'A ∩ ∁_U B = {1, 2}', explanation: '∁_U B={1,2,7,8,9}，A与∁_U B的交集是{1,2}，正确。' }
            ],
            correctAnswer: 'A',
            explanation: '本题全面考查集合的交、并、补运算。根据定义逐一计算：\n- A∩B={3,4} ✓\n- A∪B={1,2,3,4,5,6} ✗\n- ∁_U A={5,6,7,8,9} ✗\n- ∁_U(A∪B)={7,8,9} ✗\n- A∩∁_U B={1,2} ✗\n\n选项A正确，选A。'
          },
          {
            id: 'pq_math_005',
            knowledgePointId: 'kp_math_005',
            question: '设p：x>3，q：x>5，则下列说法正确的是（ ）',
            options: [
              { key: 'A', value: 'p是q的充分条件', explanation: '如果x>3，不能推出x>5（如x=4），所以p不是q的充分条件。' },
              { key: 'B', value: 'p是q的必要条件', explanation: '如果x>5，那么一定有x>3，即q⇒p，所以p是q的必要条件。' },
              { key: 'C', value: 'q是p的充分条件', explanation: '如果x>5，那么一定有x>3，即q⇒p，所以q是p的充分条件。' },
              { key: 'D', value: 'q是p的必要条件', explanation: '如果x>3，不能推出x>5，所以q不是p的必要条件。' },
              { key: 'E', value: 'p是q的充要条件', explanation: 'p⇏q，所以不是充要条件。' }
            ],
            correctAnswer: 'B',
            explanation: '由x>5可以推出x>3（q⇒p），但由x>3不能推出x>5（p⇏q）。因此：\n- p是q的必要不充分条件（B正确）\n- q是p的充分不必要条件（C错误）\n\n选B。'
          }
        ]
      },
      {
        unitNumber: 2,
        name: '第二章 一元二次函数、方程与不等式',
        description: '不等式性质、基本不等式、二次函数与方程',
        knowledgePoints: [
          {
            id: 'kp_math_006',
            title: '等式性质与不等式性质',
            content: '不等式的基本性质：\n\n1. 对称性：如果a > b，那么b < a；如果b < a，那么a > b。\n2. 传递性：如果a > b，b > c，那么a > c。\n3. 可加性：如果a > b，那么a + c > b + c。\n4. 可乘性：如果a > b，c > 0，那么ac > bc；如果a > b，c < 0，那么ac < bc。\n5. 同向可加：如果a > b，c > d，那么a + c > b + d。\n6. 同向同正可乘：如果a > b > 0，c > d > 0，那么ac > bd。'
          },
          {
            id: 'kp_math_007',
            title: '基本不等式',
            content: '基本不等式：对于正数a和b，有(a + b)/2 ≥ √(ab)，当且仅当a = b时等号成立。\n\n基本不等式的变形：\n- a + b ≥ 2√(ab)（a, b > 0），当且仅当a = b时取等号\n- ab ≤ ((a + b)/2)²（a, b > 0），当且仅当a = b时取等号\n\n基本不等式的推广（三个正数）：\n- (a + b + c)/3 ≥ ∛(abc)（a, b, c > 0），当且仅当a = b = c时取等号'
          },
          {
            id: 'kp_math_008',
            title: '二次函数与一元二次方程',
            content: '二次函数的一般形式：y = ax² + bx + c（a ≠ 0）\n\n一元二次方程：ax² + bx + c = 0（a ≠ 0）\n\n判别式：Δ = b² - 4ac\n\n- 当Δ > 0时，方程有两个不相等的实数根：x = (-b ± √Δ)/(2a)；\n- 当Δ = 0时，方程有两个相等的实数根：x = -b/(2a)；\n- 当Δ < 0时，方程没有实数根。\n\n根与系数的关系（韦达定理）：\n- 如果方程有两根x₁和x₂，则x₁ + x₂ = -b/a，x₁·x₂ = c/a'
          },
          {
            id: 'kp_math_009',
            title: '二次函数与一元二次不等式',
            content: '一元二次不等式的解集与二次函数的图像密切相关。\n\n对于ax² + bx + c > 0（a > 0）：\n- 如果Δ > 0，解集为(-∞, x₁) ∪ (x₂, +∞)；\n- 如果Δ = 0，解集为(-∞, x₀) ∪ (x₀, +∞)；\n- 如果Δ < 0，解集为R。\n\n对于ax² + bx + c < 0（a > 0）：\n- 如果Δ > 0，解集为(x₁, x₂)；\n- 如果Δ = 0，解集为∅；\n- 如果Δ < 0，解集为∅。'
          },
          {
            id: 'kp_math_010',
            title: '二次函数的图像与性质',
            content: '二次函数y = ax² + bx + c（a ≠ 0）的图像是抛物线。\n\n- 开口方向：当a > 0时，抛物线开口向上；当a < 0时，抛物线开口向下。\n- 对称轴：x = -b/(2a)\n- 顶点坐标：(-b/(2a), (4ac - b²)/(4a))\n- 最值：当a > 0时，顶点是最低点，函数有最小值；当a < 0时，顶点是最高点，函数有最大值。\n- 单调性：当a > 0时，在(-∞, -b/(2a)]上单调递减，在[-b/(2a), +∞)上单调递增；当a < 0时，在(-∞, -b/(2a)]上单调递增，在[-b/(2a), +∞)上单调递减。'
          }
        ],
        questions: [
          {
            id: 'pq_math_006',
            knowledgePointId: 'kp_math_006',
            question: '若a > b > 0，则下列不等式一定成立的是（ ）',
            options: [
              { key: 'A', value: 'a² > b²', explanation: '因为a > b > 0，两边同乘正数a和b，由同向同正可乘性质，a·a > b·b，即a² > b²，一定成立。' },
              { key: 'B', value: 'ac > bc', explanation: '不一定成立，当c ≤ 0时，ac ≤ bc。' },
              { key: 'C', value: 'a + c > b + c', explanation: '根据不等式可加性，两边同时加一个数，不等号方向不变，一定成立。' },
              { key: 'D', value: '1/a < 1/b', explanation: '因为a > b > 0，两边同乘正数1/(ab)，得b < a，即1/a < 1/b，一定成立。' },
              { key: 'E', value: '√a > √b', explanation: '因为a > b > 0，平方根函数在正实数范围内单调递增，所以√a > √b，一定成立。' }
            ],
            correctAnswer: 'A',
            explanation: '当a > b > 0时：\n- A：由同向同正可乘，a·a > b·b，即a² > b² ✓\n- B：c的符号不确定，不一定成立 ✗\n- C：由可加性，a+c > b+c ✗\n- D：由可乘性，两边同乘1/(ab)（正数），得1/a < 1/b ✗\n- E：平方根函数单调递增，√a > √b ✗\n\n选A。'
          },
          {
            id: 'pq_math_007',
            knowledgePointId: 'kp_math_007',
            question: '已知x > 0，则x + 4/x的最小值是（ ）',
            options: [
              { key: 'A', value: '1', explanation: '不可能，x + 4/x ≥ 4，最小值是4。' },
              { key: 'B', value: '2', explanation: '不是最小值，x + 4/x ≥ 2√(x·4/x) = 4。' },
              { key: 'C', value: '4', explanation: '根据基本不等式，x + 4/x ≥ 2√(x·4/x) = 2√4 = 4，当x = 4/x即x = 2时取等号。' },
              { key: 'D', value: '5', explanation: '不是最小值。' },
              { key: 'E', value: '8', explanation: '不是最小值。' }
            ],
            correctAnswer: 'C',
            explanation: '根据基本不等式，对于正数x，有x + 4/x ≥ 2√(x·4/x) = 2√4 = 4。当且仅当x = 4/x，即x² = 4，x = 2（x > 0）时取等号，所以最小值是4，选C。'
          },
          {
            id: 'pq_math_008',
            knowledgePointId: 'kp_math_008',
            question: '方程2x² - 5x + 2 = 0的根的情况及根与系数的关系，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '有两个不相等的实数根', explanation: '判别式Δ = (-5)² - 4×2×2 = 25 - 16 = 9 > 0，所以有两个不相等的实数根。' },
              { key: 'B', value: '有两个相等的实数根', explanation: 'Δ = 9 ≠ 0，不是两个相等的根。' },
              { key: 'C', value: '两根之和为5/2', explanation: '根据韦达定理，两根之和x₁ + x₂ = -(-5)/2 = 5/2。' },
              { key: 'D', value: '两根之积为1', explanation: '根据韦达定理，两根之积x₁·x₂ = 2/2 = 1。' },
              { key: 'E', value: '两根分别为2和1/2', explanation: '解方程2x² - 5x + 2 = 0，得(x - 2)(2x - 1) = 0，x = 2或x = 1/2。' }
            ],
            correctAnswer: 'A',
            explanation: '计算判别式Δ = b² - 4ac = 25 - 16 = 9 > 0，所以方程有两个不相等的实数根（A正确）。根据韦达定理，两根之和为5/2（C错误），两根之积为1（D错误）。解方程得两根为2和1/2（E错误），选A。'
          },
          {
            id: 'pq_math_009',
            knowledgePointId: 'kp_math_009',
            question: '不等式x² - 3x - 4 < 0的解集是（ ）',
            options: [
              { key: 'A', value: '(-1, 4)', explanation: '解方程x² - 3x - 4 = 0，得(x + 1)(x - 4) = 0，x = -1或x = 4。因为a = 1 > 0，抛物线开口向上，不等式x² - 3x - 4 < 0的解集是两根之间，即(-1, 4)。' },
              { key: 'B', value: '(-∞, -1) ∪ (4, +∞)', explanation: '这是x² - 3x - 4 > 0的解集。' },
              { key: 'C', value: '[-1, 4]', explanation: '这是x² - 3x - 4 ≤ 0的解集。' },
              { key: 'D', value: '(-∞, -1] ∪ [4, +∞)', explanation: '这是x² - 3x - 4 ≥ 0的解集。' },
              { key: 'E', value: 'R', explanation: '错误，只有当Δ < 0且a > 0时，ax² + bx + c > 0的解集才是R。' }
            ],
            correctAnswer: 'A',
            explanation: '首先解方程x² - 3x - 4 = 0，得x = -1和x = 4。因为二次项系数a = 1 > 0，抛物线开口向上，不等式x² - 3x - 4 < 0表示抛物线在x轴下方的部分，即两根之间的区间(-1, 4)，选A。'
          },
          {
            id: 'pq_math_010',
            knowledgePointId: 'kp_math_010',
            question: '函数y = -2x² + 4x - 1的性质，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '开口向上', explanation: 'a = -2 < 0，抛物线开口向下，不是向上。' },
              { key: 'B', value: '对称轴是x = 1', explanation: '对称轴x = -b/(2a) = -4/(2×(-2)) = -4/(-4) = 1，正确。' },
              { key: 'C', value: '顶点坐标是(1, 1)', explanation: '将x = 1代入函数，y = -2(1)² + 4(1) - 1 = -2 + 4 - 1 = 1，所以顶点坐标是(1, 1)，正确。' },
              { key: 'D', value: '函数有最大值1', explanation: '因为a = -2 < 0，抛物线开口向下，顶点是最高点，函数有最大值1，正确。' },
              { key: 'E', value: '在区间(1, +∞)上单调递减', explanation: '因为a < 0，抛物线开口向下，在对称轴右侧（x > 1）单调递减，正确。' }
            ],
            correctAnswer: 'B',
            explanation: '对于函数y = -2x² + 4x - 1：\n- a = -2 < 0，开口向下（A错误）\n- 对称轴x = -b/(2a) = -4/(-4) = 1（B正确）\n- 顶点纵坐标y = -2(1)² + 4(1) - 1 = 1，顶点(1,1)（C错误）\n- a < 0，有最大值1（D错误）\n- 在对称轴右侧(1, +∞)单调递减（E错误）\n\n选B。'
          }
        ]
      },
      {
        unitNumber: 3,
        name: '第三章 函数的概念与性质',
        description: '函数概念、表示方法、单调性、奇偶性与幂函数',
        knowledgePoints: [
          {
            id: 'kp_math_011',
            title: '函数的概念',
            content: '函数的定义：设A、B是非空的数集，如果按照某种确定的对应关系f，使对于集合A中的任意一个数x，在集合B中都有唯一确定的数f(x)和它对应，那么就称f: A→B为从集合A到集合B的一个函数。记作y = f(x)，x ∈ A。\n\n- 定义域：x的取值范围A叫做函数的定义域。\n- 值域：函数值的集合{f(x) | x ∈ A}叫做函数的值域。\n- 三要素：定义域、对应关系、值域。'
          },
          {
            id: 'kp_math_012',
            title: '函数的表示方法',
            content: '函数的表示方法有解析法、列表法和图像法。\n\n- 解析法：用数学表达式表示两个变量之间的对应关系。例如：y = 2x + 1。\n- 列表法：列出表格来表示两个变量之间的对应关系。\n- 图像法：用图像表示两个变量之间的对应关系。\n\n分段函数：在定义域的不同部分，函数的解析式不同。'
          },
          {
            id: 'kp_math_013',
            title: '函数的单调性',
            content: '单调性定义：\n- 增函数：设函数f(x)的定义域为I，如果对于定义域I内某个区间D上的任意两个自变量x₁、x₂，当x₁ < x₂时，都有f(x₁) < f(x₂)，那么就说函数f(x)在区间D上是增函数。\n- 减函数：设函数f(x)的定义域为I，如果对于定义域I内某个区间D上的任意两个自变量x₁、x₂，当x₁ < x₂时，都有f(x₁) > f(x₂)，那么就说函数f(x)在区间D上是减函数。\n\n判断单调性的方法：\n1. 定义法\n2. 图像法\n3. 导数法（高中阶段）'
          },
          {
            id: 'kp_math_014',
            title: '函数的奇偶性',
            content: '奇偶性定义：\n- 奇函数：设函数f(x)的定义域为D，如果对于D内任意一个x，都有-x ∈ D，且f(-x) = -f(x)，那么函数f(x)就叫做奇函数。奇函数的图像关于原点对称。\n- 偶函数：设函数f(x)的定义域为D，如果对于D内任意一个x，都有-x ∈ D，且f(-x) = f(x)，那么函数f(x)就叫做偶函数。偶函数的图像关于y轴对称。\n\n判断奇偶性的步骤：\n1. 检查定义域是否关于原点对称\n2. 计算f(-x)\n3. 比较f(-x)与f(x)、-f(x)的关系'
          },
          {
            id: 'kp_math_015',
            title: '幂函数',
            content: '幂函数的定义：一般地，函数y = x^α（α为常数）叫做幂函数。\n\n常见的幂函数：\n- α = 1：y = x（一次函数，奇函数，单调递增）\n- α = 2：y = x²（二次函数，偶函数，在(-∞, 0]递减，[0, +∞)递增）\n- α = 3：y = x³（奇函数，单调递增）\n- α = 1/2：y = √x（定义域x ≥ 0，单调递增）\n- α = -1：y = 1/x（奇函数，在(-∞, 0)和(0, +∞)上单调递减）'
          }
        ],
        questions: [
          {
            id: 'pq_math_011',
            knowledgePointId: 'kp_math_011',
            question: '下列对应关系中，能构成函数的是（ ）',
            options: [
              { key: 'A', value: 'A = {1, 2, 3}，B = {4, 5, 6}，f: x→x + 3', explanation: '对于A中任意x，x+3唯一确定且在B中，能构成函数。' },
              { key: 'B', value: 'A = {1, 2, 3}，B = {4, 5, 6}，f: x→2x', explanation: '当x=1时，2x=2不在B中，不能构成函数。' },
              { key: 'C', value: 'A = R，B = R，f: x→√x', explanation: '当x < 0时，√x无意义，不能构成函数。' },
              { key: 'D', value: 'A = {x | x ≥ 0}，B = R，f: x→√x', explanation: '对于A中任意x ≥ 0，√x唯一确定且在B中，能构成函数。' },
              { key: 'E', value: 'A = R，B = R，f: x→x²', explanation: '对于A中任意x，x²唯一确定且在B中，能构成函数。' }
            ],
            correctAnswer: 'A',
            explanation: '判断能否构成函数，关键看：1）定义域中每个x都有对应；2）对应关系唯一确定；3）函数值在值域中。\n- A：每个x对应x+3，都在B中 ✓\n- B：x=1时，2x=2不在B中 ✗\n- C：x<0时，√x无意义 ✗\n- D：x≥0时，√x有意义 ✗\n- E：每个x对应x²，都在R中 ✗\n\n选A。'
          },
          {
            id: 'pq_math_012',
            knowledgePointId: 'kp_math_012',
            question: '已知函数f(x) = { 2x + 1, x ≥ 0; x², x < 0 }，则f(-2) + f(1)的值是（ ）',
            options: [
              { key: 'A', value: '1', explanation: '计算错误。' },
              { key: 'B', value: '3', explanation: '计算错误。' },
              { key: 'C', value: '5', explanation: 'f(-2) = (-2)² = 4，f(1) = 2(1) + 1 = 3，所以f(-2) + f(1) = 4 + 3 = 7，不是5。' },
              { key: 'D', value: '7', explanation: 'f(-2) = (-2)² = 4，f(1) = 2(1) + 1 = 3，所以f(-2) + f(1) = 4 + 3 = 7。' },
              { key: 'E', value: '9', explanation: '计算错误。' }
            ],
            correctAnswer: 'D',
            explanation: '这是一个分段函数，需要根据x的取值范围选择对应的解析式：当x = -2时，因为-2 < 0，所以使用f(x) = x²，得f(-2) = (-2)² = 4。当x = 1时，因为1 ≥ 0，所以使用f(x) = 2x + 1，得f(1) = 2(1) + 1 = 3。因此，f(-2) + f(1) = 4 + 3 = 7，选D。'
          },
          {
            id: 'pq_math_013',
            knowledgePointId: 'kp_math_013',
            question: '函数f(x) = x² - 2x的单调递增区间是（ ）',
            options: [
              { key: 'A', value: '(-∞, 1]', explanation: '这是单调递减区间，不是递增区间。' },
              { key: 'B', value: '[1, +∞)', explanation: '函数f(x) = x² - 2x = (x - 1)² - 1，是开口向上的抛物线，对称轴x = 1，在对称轴右侧单调递增。' },
              { key: 'C', value: '(-∞, +∞)', explanation: '整个定义域不是单调的，有增有减。' },
              { key: 'D', value: '(-1, +∞)', explanation: '错误，对称轴是x = 1，不是x = -1。' },
              { key: 'E', value: '(0, +∞)', explanation: '在(0, 1)上单调递减，在(1, +∞)上单调递增，不是整个区间都递增。' }
            ],
            correctAnswer: 'B',
            explanation: '将函数f(x) = x² - 2x配方得f(x) = (x - 1)² - 1，这是一个开口向上的抛物线，对称轴为x = 1。根据二次函数的单调性，开口向上的抛物线在对称轴左侧单调递减，在对称轴右侧单调递增。因此，单调递增区间是[1, +∞)，选B。'
          },
          {
            id: 'pq_math_014',
            knowledgePointId: 'kp_math_014',
            question: '下列函数中，既是奇函数又是增函数的是（ ）',
            options: [
              { key: 'A', value: 'f(x) = x', explanation: 'f(-x) = -x = -f(x)，是奇函数；且f(x) = x在R上单调递增，符合条件。' },
              { key: 'B', value: 'f(x) = x²', explanation: 'f(-x) = (-x)² = x² = f(x)，是偶函数，不是奇函数。' },
              { key: 'C', value: 'f(x) = x³', explanation: 'f(-x) = (-x)³ = -x³ = -f(x)，是奇函数；且f(x) = x³在R上单调递增，符合条件。' },
              { key: 'D', value: 'f(x) = -x', explanation: 'f(-x) = -(-x) = x = -f(x)，是奇函数；但f(x) = -x在R上单调递减，不是增函数。' },
              { key: 'E', value: 'f(x) = |x|', explanation: 'f(-x) = |-x| = |x| = f(x)，是偶函数，不是奇函数。' }
            ],
            correctAnswer: 'A',
            explanation: '逐一分析各选项：\n- A：f(-x) = -x = -f(x)（奇函数），且单调递增 ✓\n- B：f(-x) = x² = f(x)（偶函数）✗\n- C：f(-x) = -x³ = -f(x)（奇函数），且单调递增 ✗\n- D：f(-x) = x = -f(x)（奇函数），但单调递减 ✗\n- E：f(-x) = |x| = f(x)（偶函数）✗\n\n选A。'
          },
          {
            id: 'pq_math_015',
            knowledgePointId: 'kp_math_015',
            question: '幂函数f(x) = x^(1/2)的性质，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '定义域是R', explanation: '错误，x^(1/2) = √x，负数不能开平方，定义域不是R。' },
              { key: 'B', value: '定义域是{x | x ≥ 0}', explanation: '正确，√x的定义域是x ≥ 0。' },
              { key: 'C', value: '值域是R', explanation: '错误，√x的值域是y ≥ 0，不是R。' },
              { key: 'D', value: '值域是{y | y ≥ 0}', explanation: '正确，√x的值域是y ≥ 0。' },
              { key: 'E', value: '在定义域上单调递增', explanation: '正确，√x在[0, +∞)上单调递增。' }
            ],
            correctAnswer: 'B',
            explanation: '幂函数f(x) = x^(1/2) = √x：\n- 定义域：x ≥ 0（B正确，A错误）\n- 值域：y ≥ 0（D错误，C错误）\n- 单调性：在[0, +∞)上单调递增（E错误）\n\n选B。'
          }
        ]
      },
      {
        unitNumber: 4,
        name: '第四章 指数函数与对数函数',
        description: '指数运算、指数函数、对数运算、对数函数',
        knowledgePoints: [
          {
            id: 'kp_math_016',
            title: '指数的运算',
            content: '指数运算性质（a > 0，b > 0，m, n ∈ R）：\n1. a^m · a^n = a^(m+n)\n2. a^m / a^n = a^(m-n)\n3. (a^m)^n = a^(mn)\n4. (ab)^n = a^n · b^n\n5. (a/b)^n = a^n / b^n\n6. a^0 = 1（a ≠ 0）\n7. a^(-n) = 1/a^n'
          },
          {
            id: 'kp_math_017',
            title: '指数函数',
            content: '指数函数的定义：一般地，函数y = a^x（a > 0，且a ≠ 1）叫做指数函数。\n\n指数函数的性质：\n\n当a > 1时：定义域R，值域(0, +∞)，过定点(0, 1)，在R上单调递增，当x→+∞时y→+∞，当x→-∞时y→0。\n\n当0 < a < 1时：定义域R，值域(0, +∞)，过定点(0, 1)，在R上单调递减，当x→+∞时y→0，当x→-∞时y→+∞。'
          },
          {
            id: 'kp_math_018',
            title: '对数的概念',
            content: '对数的定义：如果a^b = N（a > 0，且a ≠ 1），那么数b叫做以a为底N的对数，记作log_a N = b。\n\n常用对数：以10为底的对数叫做常用对数，记作lg N。\n\n自然对数：以e为底的对数叫做自然对数，记作ln N，其中e ≈ 2.71828。\n\n对数恒等式：\n- a^(log_a N) = N（a > 0，a ≠ 1，N > 0）\n- log_a a^b = b（a > 0，a ≠ 1）'
          },
          {
            id: 'kp_math_019',
            title: '对数的运算',
            content: '对数运算性质（a > 0，a ≠ 1，M > 0，N > 0）：\n1. log_a (MN) = log_a M + log_a N\n2. log_a (M/N) = log_a M - log_a N\n3. log_a M^n = n log_a M（n ∈ R）\n4. 换底公式：log_a b = log_c b / log_c a（c > 0，c ≠ 1）\n5. log_a b · log_b a = 1'
          },
          {
            id: 'kp_math_020',
            title: '对数函数',
            content: '对数函数的定义：一般地，函数y = log_a x（a > 0，且a ≠ 1）叫做对数函数。\n\n对数函数的性质：\n\n当a > 1时：定义域(0, +∞)，值域R，过定点(1, 0)，在(0, +∞)上单调递增，当x→+∞时y→+∞，当x→0⁺时y→-∞。\n\n当0 < a < 1时：定义域(0, +∞)，值域R，过定点(1, 0)，在(0, +∞)上单调递减，当x→+∞时y→-∞，当x→0⁺时y→+∞。'
          }
        ],
        questions: [
          {
            id: 'pq_math_016',
            knowledgePointId: 'kp_math_016',
            question: '计算(2^3 · 2^2)^2 ÷ 2^4的结果是（ ）',
            options: [
              { key: 'A', value: '2^6', explanation: '(2^3 · 2^2)^2 ÷ 2^4 = (2^(3+2))^2 ÷ 2^4 = (2^5)^2 ÷ 2^4 = 2^10 ÷ 2^4 = 2^6，正确。' },
              { key: 'B', value: '2^8', explanation: '计算错误。' },
              { key: 'C', value: '2^10', explanation: '计算错误。' },
              { key: 'D', value: '2^12', explanation: '计算错误。' },
              { key: 'E', value: '2^14', explanation: '计算错误。' }
            ],
            correctAnswer: 'A',
            explanation: '根据指数运算性质逐步计算：1. 先计算括号内：2^3 · 2^2 = 2^(3+2) = 2^5；2. 再计算乘方：(2^5)^2 = 2^(5×2) = 2^10；3. 最后计算除法：2^10 ÷ 2^4 = 2^(10-4) = 2^6。所以结果是2^6，选A。'
          },
          {
            id: 'pq_math_017',
            knowledgePointId: 'kp_math_017',
            question: '函数y = 2^x与y = (1/2)^x的图像，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '都过定点(0, 1)', explanation: '当x = 0时，2^0 = 1，(1/2)^0 = 1，都过(0, 1)。' },
              { key: 'B', value: 'y = 2^x在R上单调递增', explanation: '因为2 > 1，所以y = 2^x在R上单调递增。' },
              { key: 'C', value: 'y = (1/2)^x在R上单调递减', explanation: '因为0 < 1/2 < 1，所以y = (1/2)^x在R上单调递减。' },
              { key: 'D', value: '两个函数的图像关于y轴对称', explanation: '(1/2)^x = 2^(-x)，即y = f(x)与y = f(-x)的图像关于y轴对称。' },
              { key: 'E', value: '两个函数的图像关于原点对称', explanation: '关于原点对称的函数是y = f(x)与y = -f(-x)，这里不是。' }
            ],
            correctAnswer: 'A',
            explanation: '分析两个指数函数：\n- A：都过(0,1)，因为任何数的0次幂都是1 ✓\n- B：a=2>1，单调递增 ✗\n- C：a=1/2，0<a<1，单调递减 ✗\n- D：(1/2)^x = 2^(-x)，即y = 2^x与y = 2^(-x)关于y轴对称 ✗\n- E：关于原点对称需要满足y = -2^(-x)，不是(1/2)^x ✗\n\n选A。'
          },
          {
            id: 'pq_math_018',
            knowledgePointId: 'kp_math_018',
            question: '下列等式正确的是（ ）',
            options: [
              { key: 'A', value: 'log₂8 = 3', explanation: '因为2^3 = 8，所以log₂8 = 3，正确。' },
              { key: 'B', value: 'log₃9 = 2', explanation: '因为3^2 = 9，所以log₃9 = 2，正确。' },
              { key: 'C', value: 'lg 100 = 2', explanation: 'lg是以10为底的对数，10^2 = 100，所以lg 100 = 2，正确。' },
              { key: 'D', value: 'ln e = 1', explanation: 'ln是以e为底的对数，e^1 = e，所以ln e = 1，正确。' },
              { key: 'E', value: 'log₄16 = 4', explanation: '因为4^2 = 16，所以log₄16 = 2，不是4。' }
            ],
            correctAnswer: 'A',
            explanation: '根据对数定义逐一判断：\n- A：2^3 = 8 ⇒ log₂8 = 3 ✓\n- B：3^2 = 9 ⇒ log₃9 = 2 ✗\n- C：10^2 = 100 ⇒ lg 100 = 2 ✗\n- D：e^1 = e ⇒ ln e = 1 ✗\n- E：4^2 = 16 ⇒ log₄16 = 2 ≠ 4 ✗\n\n选A。'
          },
          {
            id: 'pq_math_019',
            knowledgePointId: 'kp_math_019',
            question: '计算log₂4 + log₂8 - log₂2的结果是（ ）',
            options: [
              { key: 'A', value: '3', explanation: '计算错误。' },
              { key: 'B', value: '4', explanation: 'log₂4 + log₂8 - log₂2 = log₂(4×8/2) = log₂(32/2) = log₂16 = 4，正确。' },
              { key: 'C', value: '5', explanation: '计算错误。' },
              { key: 'D', value: '6', explanation: '计算错误。' },
              { key: 'E', value: '7', explanation: '计算错误。' }
            ],
            correctAnswer: 'B',
            explanation: '根据对数运算性质计算：方法一：log₂4 + log₂8 - log₂2 = log₂(4×8) - log₂2 = log₂32 - log₂2 = log₂(32/2) = log₂16 = 4。方法二：log₂4 = 2，log₂8 = 3，log₂2 = 1，所以2 + 3 - 1 = 4。选B。'
          },
          {
            id: 'pq_math_020',
            knowledgePointId: 'kp_math_020',
            question: '函数y = log₂x的性质，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '定义域是R', explanation: '错误，对数函数的定义域是(0, +∞)，不是R。' },
              { key: 'B', value: '定义域是(0, +∞)', explanation: '正确，对数函数的定义域是x > 0。' },
              { key: 'C', value: '过定点(1, 0)', explanation: '当x = 1时，log₂1 = 0，所以过(1, 0)。' },
              { key: 'D', value: '在定义域上单调递增', explanation: '因为a = 2 > 1，所以在(0, +∞)上单调递增。' },
              { key: 'E', value: '当x > 1时，y > 0', explanation: '因为a = 2 > 1，函数单调递增，当x > 1时，log₂x > log₂1 = 0。' }
            ],
            correctAnswer: 'B',
            explanation: '对于对数函数y = log₂x：\n- 定义域：(0, +∞)（B正确，A错误）\n- 过定点：(1, 0)（C错误）\n- 单调性：a = 2 > 1，在(0, +∞)上单调递增（D错误）\n- 当x > 1时，log₂x > log₂1 = 0（E错误）\n\n选B。'
          }
        ]
      },
      {
        unitNumber: 5,
        name: '第五章 三角函数',
        description: '任意角与弧度制、三角函数的概念、图像与性质',
        knowledgePoints: [
          {
            id: 'kp_math_021',
            title: '任意角与弧度制',
            content: '任意角的定义：角可以看成平面内一条射线绕着端点从一个位置旋转到另一个位置所形成的图形。按逆时针方向旋转形成的角叫做正角，按顺时针方向旋转形成的角叫做负角，不旋转形成的角叫做零角。\n\n象限角：使角的顶点与原点重合，角的始边与x轴的非负半轴重合，那么角的终边在第几象限，就说这个角是第几象限角。\n\n弧度制：把长度等于半径长的弧所对的圆心角叫做1弧度的角。弧度与角度的换算：\n- 180° = π rad\n- 1° = π/180 rad\n- 1 rad = (180/π)° ≈ 57.3°\n\n弧长公式：l = |α|r（α是圆心角的弧度数）'
          },
          {
            id: 'kp_math_022',
            title: '三角函数的概念',
            content: '设α是一个任意角，它的终边与单位圆交于点P(x, y)，那么：\n- 正弦：sin α = y\n- 余弦：cos α = x\n- 正切：tan α = y/x（x ≠ 0）\n\n三角函数在各象限的符号：\n\n| 象限 | sin α | cos α | tan α |\n| Ⅰ | + | + | + |\n| Ⅱ | + | - | - |\n| Ⅲ | - | - | + |\n| Ⅳ | - | + | - |'
          },
          {
            id: 'kp_math_023',
            title: '三角函数的基本关系',
            content: '同角三角函数的基本关系：\n1. 平方关系：sin²α + cos²α = 1\n2. 商数关系：tan α = sin α / cos α（cos α ≠ 0）'
          },
          {
            id: 'kp_math_024',
            title: '三角函数的诱导公式',
            content: '诱导公式一：终边相同的角的同一三角函数值相等\nsin(α + 2kπ) = sin α，cos(α + 2kπ) = cos α，tan(α + 2kπ) = tan α（k ∈ Z）\n\n诱导公式二：角α与角-α的三角函数关系\nsin(-α) = -sin α，cos(-α) = cos α，tan(-α) = -tan α\n\n诱导公式三：角α与角π + α的三角函数关系\nsin(π + α) = -sin α，cos(π + α) = -cos α，tan(π + α) = tan α\n\n诱导公式四：角α与角π - α的三角函数关系\nsin(π - α) = sin α，cos(π - α) = -cos α，tan(π - α) = -tan α'
          },
          {
            id: 'kp_math_025',
            title: '三角函数的图像与性质',
            content: '正弦函数y = sin x的性质：\n- 定义域：R\n- 值域：[-1, 1]\n- 周期：2π\n- 奇偶性：奇函数\n- 单调性：在[-π/2 + 2kπ, π/2 + 2kπ]上单调递增，在[π/2 + 2kπ, 3π/2 + 2kπ]上单调递减（k ∈ Z）\n\n余弦函数y = cos x的性质：\n- 定义域：R\n- 值域：[-1, 1]\n- 周期：2π\n- 奇偶性：偶函数\n- 单调性：在[-π + 2kπ, 2kπ]上单调递增，在[2kπ, π + 2kπ]上单调递减（k ∈ Z）\n\n正切函数y = tan x的性质：\n- 定义域：{x | x ≠ π/2 + kπ, k ∈ Z}\n- 值域：R\n- 周期：π\n- 奇偶性：奇函数\n- 单调性：在(-π/2 + kπ, π/2 + kπ)上单调递增（k ∈ Z）'
          }
        ],
        questions: [
          {
            id: 'pq_math_021',
            knowledgePointId: 'kp_math_021',
            question: '下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '30°是第一象限角', explanation: '30°的终边在第一象限，是第一象限角。' },
              { key: 'B', value: '-30°是第四象限角', explanation: '-30°的终边与330°相同，在第四象限，是第四象限角。' },
              { key: 'C', value: '1弧度约等于57.3°', explanation: '1 rad = (180/π)° ≈ 57.3°。' },
              { key: 'D', value: '180°等于π弧度', explanation: '弧度制与角度制的换算关系，180° = π rad。' },
              { key: 'E', value: '弧长公式是l = αr（α为角度数）', explanation: '错误，弧长公式中α必须是弧度数，不是角度数。' }
            ],
            correctAnswer: 'A',
            explanation: 'A：30°在第一象限 ✓\n- B：-30°顺时针旋转，终边在第四象限 ✗\n- C：1 rad ≈ 57.3° ✗\n- D：180° = π rad ✗\n- E：弧长公式l = |α|r中α必须是弧度，不是角度 ✗\n\n选A。'
          },
          {
            id: 'pq_math_022',
            knowledgePointId: 'kp_math_022',
            question: '已知角α的终边经过点P(-3, 4)，则下列三角函数值正确的是（ ）',
            options: [
              { key: 'A', value: 'sin α = 4/5', explanation: '点P(-3, 4)到原点的距离r = √((-3)² + 4²) = 5，sin α = y/r = 4/5，正确。' },
              { key: 'B', value: 'cos α = -3/5', explanation: 'cos α = x/r = -3/5，正确。' },
              { key: 'C', value: 'tan α = -4/3', explanation: 'tan α = y/x = 4/(-3) = -4/3，正确。' },
              { key: 'D', value: 'sin α = -4/5', explanation: 'sin α = 4/5，不是-4/5。' },
              { key: 'E', value: 'cos α = 3/5', explanation: 'cos α = -3/5，不是3/5。' }
            ],
            correctAnswer: 'A',
            explanation: '首先计算点P(-3, 4)到原点的距离r = √((-3)² + 4²) = 5。然后根据三角函数定义：\n- sin α = y/r = 4/5（A正确，D错误）\n- cos α = x/r = -3/5（B错误，E错误）\n- tan α = y/x = 4/(-3) = -4/3（C错误）\n\n选A。'
          },
          {
            id: 'pq_math_023',
            knowledgePointId: 'kp_math_023',
            question: '已知sin α = 3/5，且α是第二象限角，则cos α和tan α的值分别是（ ）',
            options: [
              { key: 'A', value: 'cos α = 4/5', explanation: 'α是第二象限角，cos α应该为负，不是4/5。' },
              { key: 'B', value: 'cos α = -4/5', explanation: '由sin²α + cos²α = 1，得cos²α = 1 - (3/5)² = 16/25，所以cos α = ±4/5。因为α是第二象限角，cos α < 0，所以cos α = -4/5。' },
              { key: 'C', value: 'tan α = 3/4', explanation: 'tan α = sin α / cos α = (3/5)/(-4/5) = -3/4，不是3/4。' },
              { key: 'D', value: 'tan α = -3/4', explanation: 'tan α = sin α / cos α = (3/5)/(-4/5) = -3/4，正确。' },
              { key: 'E', value: 'tan α = 4/3', explanation: '计算错误。' }
            ],
            correctAnswer: 'B',
            explanation: '根据同角三角函数关系：\n1. 由sin²α + cos²α = 1，得cos²α = 1 - (9/25) = 16/25，所以cos α = ±4/5。\n2. 因为α是第二象限角，cos α < 0，所以cos α = -4/5（B正确）。\n3. tan α = sin α / cos α = (3/5)/(-4/5) = -3/4（D错误）。\n\n选B。'
          },
          {
            id: 'pq_math_024',
            knowledgePointId: 'kp_math_024',
            question: '计算sin(π + π/6)和cos(-π/3)的值分别是（ ）',
            options: [
              { key: 'A', value: 'sin(π + π/6) = 1/2', explanation: '根据诱导公式三，sin(π + α) = -sin α，所以sin(π + π/6) = -sin(π/6) = -1/2，不是1/2。' },
              { key: 'B', value: 'sin(π + π/6) = -1/2', explanation: '根据诱导公式三，sin(π + π/6) = -sin(π/6) = -1/2，正确。' },
              { key: 'C', value: 'cos(-π/3) = 1/2', explanation: '根据诱导公式二，cos(-α) = cos α，所以cos(-π/3) = cos(π/3) = 1/2，正确。' },
              { key: 'D', value: 'cos(-π/3) = -1/2', explanation: 'cos(-π/3) = cos(π/3) = 1/2，不是-1/2。' },
              { key: 'E', value: 'sin(π + π/6) = √3/2', explanation: '计算错误，sin(π + π/6) = -1/2。' }
            ],
            correctAnswer: 'B',
            explanation: '根据诱导公式计算：\n1. sin(π + π/6)：由诱导公式三，sin(π + α) = -sin α，所以sin(π + π/6) = -sin(π/6) = -1/2（B正确）。\n2. cos(-π/3)：由诱导公式二，cos(-α) = cos α，所以cos(-π/3) = cos(π/3) = 1/2（C错误）。\n\n选B。'
          },
          {
            id: 'pq_math_025',
            knowledgePointId: 'kp_math_025',
            question: '关于函数y = sin x和y = cos x的性质，下列说法正确的是（ ）',
            options: [
              { key: 'A', value: '两者的周期都是2π', explanation: 'sin x和cos x的周期都是2π，正确。' },
              { key: 'B', value: 'y = sin x是奇函数', explanation: 'sin(-x) = -sin x，是奇函数，正确。' },
              { key: 'C', value: 'y = cos x是偶函数', explanation: 'cos(-x) = cos x，是偶函数，正确。' },
              { key: 'D', value: 'y = sin x的值域是[-1, 1]', explanation: 'sin x的值域是[-1, 1]，正确。' },
              { key: 'E', value: 'y = cos x在[0, π]上单调递增', explanation: 'y = cos x在[0, π]上单调递减，不是递增。' }
            ],
            correctAnswer: 'A',
            explanation: '分析两个三角函数：\n- A：sin x和cos x的周期都是2π ✓\n- B：sin(-x) = -sin x，奇函数 ✗\n- C：cos(-x) = cos x，偶函数 ✗\n- D：sin x的值域[-1, 1] ✗\n- E：cos x在[0, π]上单调递减，不是递增 ✗\n\n选A。'
          }
        ]
      }
    ];
  }
}