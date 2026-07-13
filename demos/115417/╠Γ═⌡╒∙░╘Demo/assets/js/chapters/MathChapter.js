class MathChapter extends Chapter {
  constructor() {
    super('math', '数学', 'fa-calculator', '#3498db');
    this.initLevels();
  }

  initLevels() {
    this.levels = [
      {
        levelNumber: 1,
        name: '第一章 集合与常用逻辑用语',
        description: '高一数学基础概念',
        difficulty: 1,
        timeLimit: 180,
        unlocked: true,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_math_001',
            question: '下列各组对象中，能构成集合的是（ ）',
            options: [
              { key: 'A', value: '著名的数学家', explanation: '著名没有明确的判断标准，不同人对"著名"的理解不同，元素不确定，不符合集合元素的确定性特征。' },
              { key: 'B', value: '接近于0的数', explanation: '接近0的程度没有明确界定，无法确定哪些数属于这个范围，元素不确定，不能构成集合。' },
              { key: 'C', value: '所有的正三角形', explanation: '正三角形有明确的定义：三条边相等、三个角都是60度的三角形，元素完全确定，符合集合的定义。' },
              { key: 'D', value: '高一数学必修一中的难题', explanation: '难题的标准因人而异，没有客观统一的判断依据，元素不确定，不能构成集合。' }
            ],
            correctAnswer: 'C',
            explanation: '集合中的元素必须是确定的，A、B、D中的对象都不确定，只有C中的正三角形是确定的。'
          },
          {
            id: 'q_math_002',
            question: '设集合A={1,2,3}，B={2,3,4}，则A∩B=（ ）',
            options: [
              { key: 'A', value: '{1,2,3,4}', explanation: '这是A和B的并集A∪B，包含两个集合的所有元素，不是交集。' },
              { key: 'B', value: '{2,3}', explanation: '交集是同时属于两个集合的元素，2和3既在A中又在B中，是A和B的公共元素。' },
              { key: 'C', value: '{1,4}', explanation: '1只属于A，4只属于B，它们都不是两个集合的公共元素，不是交集。' },
              { key: 'D', value: '{3}', explanation: '只列出了一个公共元素，遗漏了2，不完整。' }
            ],
            correctAnswer: 'B',
            explanation: '交集是指两个集合中共同的元素，A和B的共同元素是2和3。'
          },
          {
            id: 'q_math_003',
            question: '命题"若x>0，则x²>0"的逆命题是（ ）',
            options: [
              { key: 'A', value: '若x²>0，则x>0', explanation: '逆命题是将原命题的条件和结论互换，原命题条件是"x>0"，结论是"x²>0"，互换后得到此命题。' },
              { key: 'B', value: '若x≤0，则x²≤0', explanation: '这是原命题的否命题，同时否定条件和结论，不是逆命题。' },
              { key: 'C', value: '若x²≤0，则x≤0', explanation: '这是原命题的逆否命题，先互换条件和结论，再同时否定，不是逆命题。' },
              { key: 'D', value: '若x>0，则x²≤0', explanation: '这是原命题的否定形式，只否定结论，不是逆命题。' }
            ],
            correctAnswer: 'A',
            explanation: '逆命题是将原命题的条件和结论互换，即"若x²>0，则x>0"。'
          },
          {
            id: 'q_math_004',
            question: '已知全集U={1,2,3,4,5}，A={1,2,3}，则∁UA=（ ）',
            options: [
              { key: 'A', value: '{1,2,3}', explanation: '' },
              { key: 'B', value: '{4,5}', explanation: '' },
              { key: 'C', value: '{1,2,3,4,5}', explanation: '' },
              { key: 'D', value: '∅', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '补集是指全集中不属于A的元素，即{4,5}。'
          },
          {
            id: 'q_math_005',
            question: '"x>1"是"x>2"的（ ）条件',
            options: [
              { key: 'A', value: '充分不必要', explanation: '' },
              { key: 'B', value: '必要不充分', explanation: '' },
              { key: 'C', value: '充要', explanation: '' },
              { key: 'D', value: '既不充分也不必要', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'x>2能推出x>1，但x>1不能推出x>2，所以是必要不充分条件。'
          },
          {
            id: 'q_math_006',
            question: '集合{a,b,c}的子集共有（ ）个',
            options: [
              { key: 'A', value: '3', explanation: '' },
              { key: 'B', value: '6', explanation: '' },
              { key: 'C', value: '7', explanation: '' },
              { key: 'D', value: '8', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: 'n个元素的集合有2ⁿ个子集，3个元素有2³=8个子集。'
          },
          {
            id: 'q_math_007',
            question: '设p: x>2，q: x>1，则p是q的（ ）',
            options: [
              { key: 'A', value: '充分条件', explanation: '' },
              { key: 'B', value: '必要条件', explanation: '' },
              { key: 'C', value: '充要条件', explanation: '' },
              { key: 'D', value: '既不充分也不必要', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'x>2一定能推出x>1，所以p是q的充分条件。'
          },
          {
            id: 'q_math_008',
            question: '若集合A={x|x²-4=0}，则A=（ ）',
            options: [
              { key: 'A', value: '{2}', explanation: '' },
              { key: 'B', value: '{-2}', explanation: '' },
              { key: 'C', value: '{2,-2}', explanation: '' },
              { key: 'D', value: '{4}', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '解方程x²-4=0，得x=2或x=-2，所以A={2,-2}。'
          },
          {
            id: 'q_math_009',
            question: '下列命题为真命题的是（ ）',
            options: [
              { key: 'A', value: '若x²=1，则x=1', explanation: '' },
              { key: 'B', value: '若x=y，则√x=√y', explanation: '' },
              { key: 'C', value: '若a>b，则ac>bc', explanation: '' },
              { key: 'D', value: '若x=1，则x²=1', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '当x=1时，x²=1一定成立，其他选项都存在反例。'
          },
          {
            id: 'q_math_010',
            question: '设A={x|x是锐角三角形}，B={x|x是钝角三角形}，则A∩B=（ ）',
            options: [
              { key: 'A', value: '{x|x是三角形}', explanation: '' },
              { key: 'B', value: '{x|x是锐角三角形}', explanation: '' },
              { key: 'C', value: '{x|x是钝角三角形}', explanation: '' },
              { key: 'D', value: '∅', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '一个三角形不可能既是锐角三角形又是钝角三角形，所以交集为空集。'
          }
        ]
      },
      {
        levelNumber: 2,
        name: '第二章 函数',
        description: '函数的概念与性质',
        difficulty: 1,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_math_011',
            question: '函数f(x)=√(x-1)的定义域是（ ）',
            options: [
              { key: 'A', value: '{x|x>1}', explanation: '' },
              { key: 'B', value: '{x|x≥1}', explanation: '' },
              { key: 'C', value: '{x|x<1}', explanation: '' },
              { key: 'D', value: '{x|x≤1}', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '根号内的表达式必须非负，即x-1≥0，所以x≥1。'
          },
          {
            id: 'q_math_012',
            question: '函数f(x)=x²的奇偶性是（ ）',
            options: [
              { key: 'A', value: '奇函数', explanation: '' },
              { key: 'B', value: '偶函数', explanation: '' },
              { key: 'C', value: '非奇非偶函数', explanation: '' },
              { key: 'D', value: '既是奇函数又是偶函数', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'f(-x)=(-x)²=x²=f(x)，所以是偶函数。'
          },
          {
            id: 'q_math_013',
            question: '函数f(x)=2x+1在R上是（ ）',
            options: [
              { key: 'A', value: '增函数', explanation: '' },
              { key: 'B', value: '减函数', explanation: '' },
              { key: 'C', value: '常函数', explanation: '' },
              { key: 'D', value: '非单调函数', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '斜率为2>0，所以f(x)在R上是增函数。'
          },
          {
            id: 'q_math_014',
            question: '已知f(x)=x²-2x，则f(2)=（ ）',
            options: [
              { key: 'A', value: '0', explanation: '' },
              { key: 'B', value: '2', explanation: '' },
              { key: 'C', value: '-2', explanation: '' },
              { key: 'D', value: '4', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'f(2)=2²-2×2=4-4=0。'
          },
          {
            id: 'q_math_015',
            question: '函数f(x)=x³的图象关于（ ）对称',
            options: [
              { key: 'A', value: 'x轴', explanation: '' },
              { key: 'B', value: 'y轴', explanation: '' },
              { key: 'C', value: '原点', explanation: '' },
              { key: 'D', value: '直线y=x', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'f(x)=x³是奇函数，图象关于原点对称。'
          },
          {
            id: 'q_math_016',
            question: '函数f(x)=1/x的定义域是（ ）',
            options: [
              { key: 'A', value: 'R', explanation: '' },
              { key: 'B', value: '{x|x≠0}', explanation: '' },
              { key: 'C', value: '{x|x>0}', explanation: '' },
              { key: 'D', value: '{x|x≥0}', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '分母不能为0，所以定义域是{x|x≠0}。'
          },
          {
            id: 'q_math_017',
            question: '函数f(x)=|x|的最小值是（ ）',
            options: [
              { key: 'A', value: '-1', explanation: '' },
              { key: 'B', value: '0', explanation: '' },
              { key: 'C', value: '1', explanation: '' },
              { key: 'D', value: '不存在', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '绝对值函数的值域是[0,+∞)，最小值是0。'
          },
          {
            id: 'q_math_018',
            question: '若f(x)=2x，则f(f(1))=（ ）',
            options: [
              { key: 'A', value: '2', explanation: '' },
              { key: 'B', value: '4', explanation: '' },
              { key: 'C', value: '1', explanation: '' },
              { key: 'D', value: '8', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'f(1)=2×1=2，f(f(1))=f(2)=2×2=4。'
          },
          {
            id: 'q_math_019',
            question: '函数f(x)=x²-4x+3的对称轴是（ ）',
            options: [
              { key: 'A', value: 'x=2', explanation: '' },
              { key: 'B', value: 'x=-2', explanation: '' },
              { key: 'C', value: 'x=1', explanation: '' },
              { key: 'D', value: 'x=3', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '二次函数f(x)=ax²+bx+c的对称轴是x=-b/(2a)=4/2=2。'
          },
          {
            id: 'q_math_020',
            question: '下列函数中，与y=x是同一个函数的是（ ）',
            options: [
              { key: 'A', value: 'y=(√x)²', explanation: '' },
              { key: 'B', value: 'y=x²/x', explanation: '' },
              { key: 'C', value: 'y=√(x²)', explanation: '' },
              { key: 'D', value: 'y=³√(x³)', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '只有D的定义域和对应法则都与y=x相同。'
          }
        ]
      },
      {
        levelNumber: 3,
        name: '第三章 指数函数',
        description: '指数运算与指数函数',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_math_021',
            question: '2⁰的值是（ ）',
            options: [
              { key: 'A', value: '0', explanation: '' },
              { key: 'B', value: '1', explanation: '' },
              { key: 'C', value: '2', explanation: '' },
              { key: 'D', value: '-1', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '任何非零数的0次幂都等于1。'
          },
          {
            id: 'q_math_022',
            question: '2³×2²=（ ）',
            options: [
              { key: 'A', value: '2⁵', explanation: '' },
              { key: 'B', value: '2⁶', explanation: '' },
              { key: 'C', value: '4⁵', explanation: '' },
              { key: 'D', value: '4⁶', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '同底数幂相乘，底数不变，指数相加：2³×2²=2^(3+2)=2⁵。'
          },
          {
            id: 'q_math_023',
            question: '(2²)³=（ ）',
            options: [
              { key: 'A', value: '2⁵', explanation: '' },
              { key: 'B', value: '2⁶', explanation: '' },
              { key: 'C', value: '4³', explanation: '' },
              { key: 'D', value: '4⁶', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '幂的乘方，底数不变，指数相乘：(2²)³=2^(2×3)=2⁶。'
          },
          {
            id: 'q_math_024',
            question: '函数y=2ˣ的图象过点（ ）',
            options: [
              { key: 'A', value: '(0,0)', explanation: '' },
              { key: 'B', value: '(0,1)', explanation: '' },
              { key: 'C', value: '(1,0)', explanation: '' },
              { key: 'D', value: '(1,1)', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '当x=0时，y=2⁰=1，所以图象过点(0,1)。'
          },
          {
            id: 'q_math_025',
            question: '函数y=2ˣ在R上是（ ）',
            options: [
              { key: 'A', value: '增函数', explanation: '' },
              { key: 'B', value: '减函数', explanation: '' },
              { key: 'C', value: '常函数', explanation: '' },
              { key: 'D', value: '非单调函数', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '底数2>1，所以指数函数y=2ˣ是增函数。'
          },
          {
            id: 'q_math_026',
            question: '4^(1/2)=（ ）',
            options: [
              { key: 'A', value: '2', explanation: '' },
              { key: 'B', value: '4', explanation: '' },
              { key: 'C', value: '16', explanation: '' },
              { key: 'D', value: '1/2', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '4^(1/2)=√4=2。'
          },
          {
            id: 'q_math_027',
            question: '函数y=(1/2)ˣ的值域是（ ）',
            options: [
              { key: 'A', value: 'R', explanation: '' },
              { key: 'B', value: '(0,+∞)', explanation: '' },
              { key: 'C', value: '[0,+∞)', explanation: '' },
              { key: 'D', value: '(-∞,0)', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '指数函数的值域都是(0,+∞)。'
          },
          {
            id: 'q_math_028',
            question: '2⁻¹=（ ）',
            options: [
              { key: 'A', value: '-2', explanation: '' },
              { key: 'B', value: '2', explanation: '' },
              { key: 'C', value: '1/2', explanation: '' },
              { key: 'D', value: '-1/2', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '负指数幂等于正指数幂的倒数：2⁻¹=1/2¹=1/2。'
          },
          {
            id: 'q_math_029',
            question: '若2ˣ=8，则x=（ ）',
            options: [
              { key: 'A', value: '2', explanation: '' },
              { key: 'B', value: '3', explanation: '' },
              { key: 'C', value: '4', explanation: '' },
              { key: 'D', value: '1/3', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '8=2³，所以x=3。'
          },
          {
            id: 'q_math_030',
            question: '函数y=3^(x+1)的图象可以由y=3ˣ的图象（ ）得到',
            options: [
              { key: 'A', value: '向左平移1个单位', explanation: '' },
              { key: 'B', value: '向右平移1个单位', explanation: '' },
              { key: 'C', value: '向上平移1个单位', explanation: '' },
              { key: 'D', value: '向下平移1个单位', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'y=3^(x+1)=3^(x-(-1))，所以向左平移1个单位。'
          }
        ]
      },
      {
        levelNumber: 4,
        name: '第四章 对数函数',
        description: '对数运算与对数函数',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_math_031',
            question: 'log₂8=（ ）',
            options: [
              { key: 'A', value: '2', explanation: '' },
              { key: 'B', value: '3', explanation: '' },
              { key: 'C', value: '4', explanation: '' },
              { key: 'D', value: '1/3', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'log₂8=log₂2³=3。'
          },
          {
            id: 'q_math_032',
            question: 'logₐa=（ ）',
            options: [
              { key: 'A', value: '0', explanation: '' },
              { key: 'B', value: '1', explanation: '' },
              { key: 'C', value: 'a', explanation: '' },
              { key: 'D', value: '1/a', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '对数恒等式：logₐa=1。'
          },
          {
            id: 'q_math_033',
            question: 'logₐ1=（ ）',
            options: [
              { key: 'A', value: '0', explanation: '' },
              { key: 'B', value: '1', explanation: '' },
              { key: 'C', value: 'a', explanation: '' },
              { key: 'D', value: '不存在', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '因为a⁰=1，所以logₐ1=0。'
          },
          {
            id: 'q_math_034',
            question: '函数y=log₂x的定义域是（ ）',
            options: [
              { key: 'A', value: 'R', explanation: '' },
              { key: 'B', value: '(0,+∞)', explanation: '' },
              { key: 'C', value: '[0,+∞)', explanation: '' },
              { key: 'D', value: '(-∞,0)', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '对数函数的定义域是(0,+∞)。'
          },
          {
            id: 'q_math_035',
            question: 'log₂4 + log₂2=（ ）',
            options: [
              { key: 'A', value: 'log₂6', explanation: '' },
              { key: 'B', value: '3', explanation: '' },
              { key: 'C', value: '2', explanation: '' },
              { key: 'D', value: '4', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'log₂4 + log₂2=2+1=3。'
          },
          {
            id: 'q_math_036',
            question: '函数y=log₂x在(0,+∞)上是（ ）',
            options: [
              { key: 'A', value: '增函数', explanation: '' },
              { key: 'B', value: '减函数', explanation: '' },
              { key: 'C', value: '常函数', explanation: '' },
              { key: 'D', value: '非单调函数', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '底数2>1，所以对数函数是增函数。'
          },
          {
            id: 'q_math_037',
            question: 'logₐ(M·N)=（ ）',
            options: [
              { key: 'A', value: 'logₐM + logₐN', explanation: '' },
              { key: 'B', value: 'logₐM - logₐN', explanation: '' },
              { key: 'C', value: 'logₐM · logₐN', explanation: '' },
              { key: 'D', value: 'logₐM / logₐN', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '对数乘法法则：logₐ(M·N)=logₐM + logₐN。'
          },
          {
            id: 'q_math_038',
            question: 'log₁₀1000=（ ）',
            options: [
              { key: 'A', value: '2', explanation: '' },
              { key: 'B', value: '3', explanation: '' },
              { key: 'C', value: '4', explanation: '' },
              { key: 'D', value: '1/3', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'log₁₀1000=log₁₀10³=3。'
          },
          {
            id: 'q_math_039',
            question: '若log₂x=3，则x=（ ）',
            options: [
              { key: 'A', value: '6', explanation: '' },
              { key: 'B', value: '8', explanation: '' },
              { key: 'C', value: '9', explanation: '' },
              { key: 'D', value: '1/8', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'log₂x=3，即2³=x，所以x=8。'
          },
          {
            id: 'q_math_040',
            question: '函数y=log₂x的图象过点（ ）',
            options: [
              { key: 'A', value: '(0,0)', explanation: '' },
              { key: 'B', value: '(0,1)', explanation: '' },
              { key: 'C', value: '(1,0)', explanation: '' },
              { key: 'D', value: '(1,1)', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '当x=1时，y=log₂1=0，所以图象过点(1,0)。'
          }
        ]
      },
      {
        levelNumber: 5,
        name: '第五章 幂函数',
        description: '幂函数的概念与性质',
        difficulty: 2,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_math_041',
            question: '函数y=x是（ ）',
            options: [
              { key: 'A', value: '一次函数', explanation: '' },
              { key: 'B', value: '二次函数', explanation: '' },
              { key: 'C', value: '幂函数', explanation: '' },
              { key: 'D', value: '指数函数', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'y=x=x¹是幂函数，幂函数的形式是y=xᵏ。'
          },
          {
            id: 'q_math_042',
            question: '幂函数y=x³的图象过点（ ）',
            options: [
              { key: 'A', value: '(0,0)', explanation: '' },
              { key: 'B', value: '(1,0)', explanation: '' },
              { key: 'C', value: '(0,1)', explanation: '' },
              { key: 'D', value: '(1,1)', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '当x=1时，y=1³=1，所以过点(1,1)。'
          },
          {
            id: 'q_math_043',
            question: '幂函数y=x²的定义域是（ ）',
            options: [
              { key: 'A', value: 'R', explanation: '' },
              { key: 'B', value: '(0,+∞)', explanation: '' },
              { key: 'C', value: '[0,+∞)', explanation: '' },
              { key: 'D', value: '(-∞,0)', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'y=x²对所有实数x都有定义，定义域是R。'
          },
          {
            id: 'q_math_044',
            question: '幂函数y=x^(1/2)的定义域是（ ）',
            options: [
              { key: 'A', value: 'R', explanation: '' },
              { key: 'B', value: '(0,+∞)', explanation: '' },
              { key: 'C', value: '[0,+∞)', explanation: '' },
              { key: 'D', value: '(-∞,0]', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'y=x^(1/2)=√x，定义域是[0,+∞)。'
          },
          {
            id: 'q_math_045',
            question: '幂函数y=x⁻¹的定义域是（ ）',
            options: [
              { key: 'A', value: 'R', explanation: '' },
              { key: 'B', value: '{x|x≠0}', explanation: '' },
              { key: 'C', value: '(0,+∞)', explanation: '' },
              { key: 'D', value: '[0,+∞)', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'y=x⁻¹=1/x，定义域是{x|x≠0}。'
          },
          {
            id: 'q_math_046',
            question: '幂函数y=x^(1/3)是（ ）',
            options: [
              { key: 'A', value: '奇函数', explanation: '' },
              { key: 'B', value: '偶函数', explanation: '' },
              { key: 'C', value: '非奇非偶函数', explanation: '' },
              { key: 'D', value: '既是奇函数又是偶函数', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'f(-x)=(-x)^(1/3)=-x^(1/3)=-f(x)，是奇函数。'
          },
          {
            id: 'q_math_047',
            question: '下列函数中，是幂函数的是（ ）',
            options: [
              { key: 'A', value: 'y=2x', explanation: '' },
              { key: 'B', value: 'y=x²', explanation: '' },
              { key: 'C', value: 'y=2ˣ', explanation: '' },
              { key: 'D', value: 'y=log₂x', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '幂函数的形式是y=xᵏ，只有B符合。'
          },
          {
            id: 'q_math_048',
            question: '幂函数y=x³在R上是（ ）',
            options: [
              { key: 'A', value: '增函数', explanation: '' },
              { key: 'B', value: '减函数', explanation: '' },
              { key: 'C', value: '常函数', explanation: '' },
              { key: 'D', value: '非单调函数', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'y=x³在R上是增函数。'
          },
          {
            id: 'q_math_049',
            question: '幂函数y=x⁴的值域是（ ）',
            options: [
              { key: 'A', value: 'R', explanation: '' },
              { key: 'B', value: '(0,+∞)', explanation: '' },
              { key: 'C', value: '[0,+∞)', explanation: '' },
              { key: 'D', value: '(-∞,0]', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '任何实数的4次方都是非负数，值域是[0,+∞)。'
          },
          {
            id: 'q_math_050',
            question: '幂函数y=x^(1/2)在[0,+∞)上是（ ）',
            options: [
              { key: 'A', value: '增函数', explanation: '' },
              { key: 'B', value: '减函数', explanation: '' },
              { key: 'C', value: '常函数', explanation: '' },
              { key: 'D', value: '非单调函数', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'y=x^(1/2)=√x在[0,+∞)上是增函数。'
          }
        ]
      },
      {
        levelNumber: 6,
        name: '第六章 三角函数',
        description: '角的概念与三角函数',
        difficulty: 3,
        timeLimit: 180,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_math_051',
            question: '30°等于（ ）弧度',
            options: [
              { key: 'A', value: 'π/6', explanation: '' },
              { key: 'B', value: 'π/4', explanation: '' },
              { key: 'C', value: 'π/3', explanation: '' },
              { key: 'D', value: 'π/2', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '30°=30×π/180=π/6。'
          },
          {
            id: 'q_math_052',
            question: 'sin(π/2)=（ ）',
            options: [
              { key: 'A', value: '0', explanation: '' },
              { key: 'B', value: '1', explanation: '' },
              { key: 'C', value: '-1', explanation: '' },
              { key: 'D', value: '1/2', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'sin(π/2)=sin90°=1。'
          },
          {
            id: 'q_math_053',
            question: 'cos(π)=（ ）',
            options: [
              { key: 'A', value: '0', explanation: '' },
              { key: 'B', value: '1', explanation: '' },
              { key: 'C', value: '-1', explanation: '' },
              { key: 'D', value: '1/2', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'cos(π)=cos180°=-1。'
          },
          {
            id: 'q_math_054',
            question: 'tan(π/4)=（ ）',
            options: [
              { key: 'A', value: '0', explanation: '' },
              { key: 'B', value: '1', explanation: '' },
              { key: 'C', value: '-1', explanation: '' },
              { key: 'D', value: '不存在', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'tan(π/4)=tan45°=1。'
          },
          {
            id: 'q_math_055',
            question: 'sin²α + cos²α=（ ）',
            options: [
              { key: 'A', value: '0', explanation: '' },
              { key: 'B', value: '1', explanation: '' },
              { key: 'C', value: '2', explanation: '' },
              { key: 'D', value: '-1', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '这是同角三角函数的基本关系：sin²α + cos²α=1。'
          },
          {
            id: 'q_math_056',
            question: 'π弧度等于（ ）度',
            options: [
              { key: 'A', value: '90°', explanation: '' },
              { key: 'B', value: '180°', explanation: '' },
              { key: 'C', value: '270°', explanation: '' },
              { key: 'D', value: '360°', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'π弧度=180°。'
          },
          {
            id: 'q_math_057',
            question: 'sin(π/6)=（ ）',
            options: [
              { key: 'A', value: '0', explanation: '' },
              { key: 'B', value: '1', explanation: '' },
              { key: 'C', value: '1/2', explanation: '' },
              { key: 'D', value: '√3/2', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'sin(π/6)=sin30°=1/2。'
          },
          {
            id: 'q_math_058',
            question: 'cos(π/3)=（ ）',
            options: [
              { key: 'A', value: '0', explanation: '' },
              { key: 'B', value: '1', explanation: '' },
              { key: 'C', value: '1/2', explanation: '' },
              { key: 'D', value: '√3/2', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: 'cos(π/3)=cos60°=1/2。'
          },
          {
            id: 'q_math_059',
            question: 'sin(0)=（ ）',
            options: [
              { key: 'A', value: '0', explanation: '' },
              { key: 'B', value: '1', explanation: '' },
              { key: 'C', value: '-1', explanation: '' },
              { key: 'D', value: '不存在', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'sin(0)=0。'
          },
          {
            id: 'q_math_060',
            question: 'tan(π/2)的值（ ）',
            options: [
              { key: 'A', value: '0', explanation: '' },
              { key: 'B', value: '1', explanation: '' },
              { key: 'C', value: '-1', explanation: '' },
              { key: 'D', value: '不存在', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: 'tan(π/2)=sin(π/2)/cos(π/2)=1/0，不存在。'
          }
        ]
      },
      {
        levelNumber: 7,
        name: '第七章 三角函数的图象',
        description: '三角函数的图象与性质',
        difficulty: 3,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_math_061',
            question: '函数y=sinx的最小正周期是（ ）',
            options: [
              { key: 'A', value: 'π', explanation: '' },
              { key: 'B', value: '2π', explanation: '' },
              { key: 'C', value: 'π/2', explanation: '' },
              { key: 'D', value: '4π', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'y=sinx的最小正周期是2π。'
          },
          {
            id: 'q_math_062',
            question: '函数y=cosx的最大值是（ ）',
            options: [
              { key: 'A', value: '0', explanation: '' },
              { key: 'B', value: '1', explanation: '' },
              { key: 'C', value: '-1', explanation: '' },
              { key: 'D', value: '2', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'y=cosx的值域是[-1,1]，最大值是1。'
          },
          {
            id: 'q_math_063',
            question: '函数y=sinx是（ ）',
            options: [
              { key: 'A', value: '奇函数', explanation: '' },
              { key: 'B', value: '偶函数', explanation: '' },
              { key: 'C', value: '非奇非偶函数', explanation: '' },
              { key: 'D', value: '既是奇函数又是偶函数', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'sin(-x)=-sinx，所以是奇函数。'
          },
          {
            id: 'q_math_064',
            question: '函数y=cosx是（ ）',
            options: [
              { key: 'A', value: '奇函数', explanation: '' },
              { key: 'B', value: '偶函数', explanation: '' },
              { key: 'C', value: '非奇非偶函数', explanation: '' },
              { key: 'D', value: '既是奇函数又是偶函数', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'cos(-x)=cosx，所以是偶函数。'
          },
          {
            id: 'q_math_065',
            question: '函数y=sinx的单调递增区间是（ ）',
            options: [
              { key: 'A', value: '[2kπ-π/2, 2kπ+π/2]', explanation: '' },
              { key: 'B', value: '[2kπ, 2kπ+π]', explanation: '' },
              { key: 'C', value: '[2kπ+π/2, 2kπ+3π/2]', explanation: '' },
              { key: 'D', value: '[2kπ-π, 2kπ]', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'y=sinx在[2kπ-π/2, 2kπ+π/2]上单调递增。'
          },
          {
            id: 'q_math_066',
            question: '函数y=2sinx的振幅是（ ）',
            options: [
              { key: 'A', value: '1', explanation: '' },
              { key: 'B', value: '2', explanation: '' },
              { key: 'C', value: 'π', explanation: '' },
              { key: 'D', value: '2π', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'y=Asinx的振幅是|A|，这里A=2，振幅是2。'
          },
          {
            id: 'q_math_067',
            question: '函数y=sin(2x)的最小正周期是（ ）',
            options: [
              { key: 'A', value: 'π', explanation: '' },
              { key: 'B', value: '2π', explanation: '' },
              { key: 'C', value: 'π/2', explanation: '' },
              { key: 'D', value: '4π', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'y=sin(ωx)的周期是2π/ω，这里ω=2，周期是π。'
          },
          {
            id: 'q_math_068',
            question: '函数y=sin(x+π/2)的图象可以由y=sinx（ ）得到',
            options: [
              { key: 'A', value: '向左平移π/2', explanation: '' },
              { key: 'B', value: '向右平移π/2', explanation: '' },
              { key: 'C', value: '向上平移π/2', explanation: '' },
              { key: 'D', value: '向下平移π/2', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'y=sin(x+π/2)=sin(x-(-π/2))，向左平移π/2。'
          },
          {
            id: 'q_math_069',
            question: '函数y=tanx的最小正周期是（ ）',
            options: [
              { key: 'A', value: 'π', explanation: '' },
              { key: 'B', value: '2π', explanation: '' },
              { key: 'C', value: 'π/2', explanation: '' },
              { key: 'D', value: '4π', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'y=tanx的最小正周期是π。'
          },
          {
            id: 'q_math_070',
            question: '函数y=sinx的值域是（ ）',
            options: [
              { key: 'A', value: '[0,1]', explanation: '' },
              { key: 'B', value: '[-1,1]', explanation: '' },
              { key: 'C', value: 'R', explanation: '' },
              { key: 'D', value: '(0,+∞)', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'y=sinx的值域是[-1,1]。'
          }
        ]
      },
      {
        levelNumber: 8,
        name: '第八章 三角恒等变换',
        description: '三角函数的和差公式',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_math_071',
            question: 'sin(A+B)=（ ）',
            options: [
              { key: 'A', value: 'sinA + sinB', explanation: '' },
              { key: 'B', value: 'sinAcosB + cosAsinB', explanation: '' },
              { key: 'C', value: 'sinAcosB - cosAsinB', explanation: '' },
              { key: 'D', value: 'cosAcosB - sinAsinB', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '正弦和角公式：sin(A+B)=sinAcosB + cosAsinB。'
          },
          {
            id: 'q_math_072',
            question: 'cos(A+B)=（ ）',
            options: [
              { key: 'A', value: 'cosA + cosB', explanation: '' },
              { key: 'B', value: 'cosAcosB + sinAsinB', explanation: '' },
              { key: 'C', value: 'cosAcosB - sinAsinB', explanation: '' },
              { key: 'D', value: 'sinAcosB + cosAsinB', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '余弦和角公式：cos(A+B)=cosAcosB - sinAsinB。'
          },
          {
            id: 'q_math_073',
            question: 'sin2α=（ ）',
            options: [
              { key: 'A', value: '2sinα', explanation: '' },
              { key: 'B', value: '2cosα', explanation: '' },
              { key: 'C', value: '2sinαcosα', explanation: '' },
              { key: 'D', value: 'sin²α - cos²α', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '二倍角公式：sin2α=2sinαcosα。'
          },
          {
            id: 'q_math_074',
            question: 'cos2α=（ ）',
            options: [
              { key: 'A', value: '2cosα', explanation: '' },
              { key: 'B', value: 'cos²α - sin²α', explanation: '' },
              { key: 'C', value: '2sinαcosα', explanation: '' },
              { key: 'D', value: '2cos²α + 1', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '二倍角公式：cos2α=cos²α - sin²α。'
          },
          {
            id: 'q_math_075',
            question: 'sin(A-B)=（ ）',
            options: [
              { key: 'A', value: 'sinA - sinB', explanation: '' },
              { key: 'B', value: 'sinAcosB + cosAsinB', explanation: '' },
              { key: 'C', value: 'sinAcosB - cosAsinB', explanation: '' },
              { key: 'D', value: 'cosAcosB + sinAsinB', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '正弦差角公式：sin(A-B)=sinAcosB - cosAsinB。'
          },
          {
            id: 'q_math_076',
            question: 'tan(A+B)=（ ）',
            options: [
              { key: 'A', value: 'tanA + tanB', explanation: '' },
              { key: 'B', value: '(tanA + tanB)/(1 - tanAtanB)', explanation: '' },
              { key: 'C', value: '(tanA - tanB)/(1 + tanAtanB)', explanation: '' },
              { key: 'D', value: 'tanAtanB', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '正切和角公式：tan(A+B)=(tanA + tanB)/(1 - tanAtanB)。'
          },
          {
            id: 'q_math_077',
            question: 'sin²(α/2)=（ ）',
            options: [
              { key: 'A', value: '(1 - cosα)/2', explanation: '' },
              { key: 'B', value: '(1 + cosα)/2', explanation: '' },
              { key: 'C', value: '1 - cosα', explanation: '' },
              { key: 'D', value: '1 + cosα', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '半角公式：sin²(α/2)=(1 - cosα)/2。'
          },
          {
            id: 'q_math_078',
            question: 'cos²(α/2)=（ ）',
            options: [
              { key: 'A', value: '(1 - cosα)/2', explanation: '' },
              { key: 'B', value: '(1 + cosα)/2', explanation: '' },
              { key: 'C', value: '1 - cosα', explanation: '' },
              { key: 'D', value: '1 + cosα', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '半角公式：cos²(α/2)=(1 + cosα)/2。'
          },
          {
            id: 'q_math_079',
            question: 'sin75°=（ ）',
            options: [
              { key: 'A', value: 'sin45° + sin30°', explanation: '' },
              { key: 'B', value: 'sin45°cos30° + cos45°sin30°', explanation: '' },
              { key: 'C', value: 'sin45°cos30° - cos45°sin30°', explanation: '' },
              { key: 'D', value: 'cos45°cos30° - sin45°sin30°', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'sin75°=sin(45°+30°)=sin45°cos30° + cos45°sin30°。'
          },
          {
            id: 'q_math_080',
            question: 'cos60°cos30° - sin60°sin30°=（ ）',
            options: [
              { key: 'A', value: 'cos90°', explanation: '' },
              { key: 'B', value: 'cos30°', explanation: '' },
              { key: 'C', value: 'sin90°', explanation: '' },
              { key: 'D', value: 'sin30°', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '这是余弦和角公式：cos(A+B)=cosAcosB - sinAsinB，所以等于cos(60°+30°)=cos90°。'
          }
        ]
      },
      {
        levelNumber: 9,
        name: '第九章 解三角形',
        description: '正弦定理与余弦定理',
        difficulty: 4,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_math_081',
            question: '在△ABC中，a/sinA=（ ）',
            options: [
              { key: 'A', value: 'b/sinB', explanation: '' },
              { key: 'B', value: 'c/sinC', explanation: '' },
              { key: 'C', value: '2R', explanation: '' },
              { key: 'D', value: '以上都对', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '正弦定理：a/sinA=b/sinB=c/sinC=2R，R是外接圆半径。'
          },
          {
            id: 'q_math_082',
            question: '在△ABC中，若a=3，b=4，C=90°，则c=（ ）',
            options: [
              { key: 'A', value: '5', explanation: '' },
              { key: 'B', value: '7', explanation: '' },
              { key: 'C', value: '√7', explanation: '' },
              { key: 'D', value: '25', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '由勾股定理：c=√(a²+b²)=√(9+16)=√25=5。'
          },
          {
            id: 'q_math_083',
            question: '余弦定理中，c²=（ ）',
            options: [
              { key: 'A', value: 'a² + b²', explanation: '' },
              { key: 'B', value: 'a² + b² - 2abcosC', explanation: '' },
              { key: 'C', value: 'a² + b² + 2abcosC', explanation: '' },
              { key: 'D', value: 'a² - b²', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '余弦定理：c²=a² + b² - 2abcosC。'
          },
          {
            id: 'q_math_084',
            question: '在△ABC中，若a=2，b=3，C=60°，则c²=（ ）',
            options: [
              { key: 'A', value: '7', explanation: '' },
              { key: 'B', value: '13', explanation: '' },
              { key: 'C', value: '19', explanation: '' },
              { key: 'D', value: '1', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: 'c²=a²+b²-2abcosC=4+9-2×2×3×cos60°=13-6=7。'
          },
          {
            id: 'q_math_085',
            question: '在△ABC中，若a=b=c，则△ABC是（ ）',
            options: [
              { key: 'A', value: '直角三角形', explanation: '' },
              { key: 'B', value: '等腰三角形', explanation: '' },
              { key: 'C', value: '等边三角形', explanation: '' },
              { key: 'D', value: '钝角三角形', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '三边相等的三角形是等边三角形。'
          },
          {
            id: 'q_math_086',
            question: '在△ABC中，若A=30°，a=1，则外接圆半径R=（ ）',
            options: [
              { key: 'A', value: '1', explanation: '' },
              { key: 'B', value: '2', explanation: '' },
              { key: 'C', value: '1/2', explanation: '' },
              { key: 'D', value: '√3', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '由正弦定理：a/sinA=2R，所以R=a/(2sinA)=1/(2×1/2)=1。'
          },
          {
            id: 'q_math_087',
            question: '在△ABC中，若a=5，b=12，c=13，则△ABC是（ ）',
            options: [
              { key: 'A', value: '锐角三角形', explanation: '' },
              { key: 'B', value: '直角三角形', explanation: '' },
              { key: 'C', value: '钝角三角形', explanation: '' },
              { key: 'D', value: '等边三角形', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '5²+12²=25+144=169=13²，满足勾股定理，是直角三角形。'
          },
          {
            id: 'q_math_088',
            question: '在△ABC中，若a=2，b=2，C=90°，则A=（ ）',
            options: [
              { key: 'A', value: '30°', explanation: '' },
              { key: 'B', value: '45°', explanation: '' },
              { key: 'C', value: '60°', explanation: '' },
              { key: 'D', value: '90°', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: 'a=b=2，C=90°，所以是等腰直角三角形，A=45°。'
          },
          {
            id: 'q_math_089',
            question: '正弦定理适用于（ ）',
            options: [
              { key: 'A', value: '只有锐角三角形', explanation: '' },
              { key: 'B', value: '只有直角三角形', explanation: '' },
              { key: 'C', value: '只有钝角三角形', explanation: '' },
              { key: 'D', value: '任意三角形', explanation: '' }
            ],
            correctAnswer: 'D',
            explanation: '正弦定理适用于任意三角形。'
          },
          {
            id: 'q_math_090',
            question: '在△ABC中，若A=60°，B=45°，则C=（ ）',
            options: [
              { key: 'A', value: '60°', explanation: '' },
              { key: 'B', value: '75°', explanation: '' },
              { key: 'C', value: '85°', explanation: '' },
              { key: 'D', value: '95°', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '三角形内角和为180°，所以C=180°-60°-45°=75°。'
          }
        ]
      },
      {
        levelNumber: 10,
        name: '第十章 概率',
        description: '概率基础与应用',
        difficulty: 5,
        timeLimit: 120,
        unlocked: false,
        completed: false,
        stars: 0,
        questions: [
          {
            id: 'q_math_091',
            question: '掷一枚均匀硬币，正面朝上的概率是（ ）',
            options: [
              { key: 'A', value: '0', explanation: '' },
              { key: 'B', value: '1', explanation: '' },
              { key: 'C', value: '1/2', explanation: '' },
              { key: 'D', value: '1/4', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '硬币只有正反两面，均匀硬币正面朝上的概率是1/2。'
          },
          {
            id: 'q_math_092',
            question: '必然事件的概率是（ ）',
            options: [
              { key: 'A', value: '0', explanation: '' },
              { key: 'B', value: '1', explanation: '' },
              { key: 'C', value: '1/2', explanation: '' },
              { key: 'D', value: '不确定', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '必然事件一定会发生，概率是1。'
          },
          {
            id: 'q_math_093',
            question: '不可能事件的概率是（ ）',
            options: [
              { key: 'A', value: '0', explanation: '' },
              { key: 'B', value: '1', explanation: '' },
              { key: 'C', value: '1/2', explanation: '' },
              { key: 'D', value: '不确定', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '不可能事件一定不会发生，概率是0。'
          },
          {
            id: 'q_math_094',
            question: '从1到10中随机取一个数，取到偶数的概率是（ ）',
            options: [
              { key: 'A', value: '1/10', explanation: '' },
              { key: 'B', value: '1/5', explanation: '' },
              { key: 'C', value: '1/2', explanation: '' },
              { key: 'D', value: '2/5', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '1到10中有5个偶数（2,4,6,8,10），概率是5/10=1/2。'
          },
          {
            id: 'q_math_095',
            question: '若P(A)=0.3，P(B)=0.5，且A与B互斥，则P(A∪B)=（ ）',
            options: [
              { key: 'A', value: '0.2', explanation: '' },
              { key: 'B', value: '0.8', explanation: '' },
              { key: 'C', value: '0.15', explanation: '' },
              { key: 'D', value: '0.65', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '互斥事件：P(A∪B)=P(A)+P(B)=0.3+0.5=0.8。'
          },
          {
            id: 'q_math_096',
            question: '若P(A)=0.4，P(B)=0.5，且A与B独立，则P(A∩B)=（ ）',
            options: [
              { key: 'A', value: '0.1', explanation: '' },
              { key: 'B', value: '0.9', explanation: '' },
              { key: 'C', value: '0.2', explanation: '' },
              { key: 'D', value: '0.7', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '独立事件：P(A∩B)=P(A)×P(B)=0.4×0.5=0.2。'
          },
          {
            id: 'q_math_097',
            question: '掷两枚均匀硬币，至少一枚正面朝上的概率是（ ）',
            options: [
              { key: 'A', value: '1/4', explanation: '' },
              { key: 'B', value: '1/2', explanation: '' },
              { key: 'C', value: '3/4', explanation: '' },
              { key: 'D', value: '1', explanation: '' }
            ],
            correctAnswer: 'C',
            explanation: '总共有4种情况：正正、正反、反正、反反，至少一枚正面有3种，概率是3/4。'
          },
          {
            id: 'q_math_098',
            question: '从一副扑克牌（52张）中随机抽一张，抽到红桃的概率是（ ）',
            options: [
              { key: 'A', value: '1/4', explanation: '' },
              { key: 'B', value: '1/13', explanation: '' },
              { key: 'C', value: '1/52', explanation: '' },
              { key: 'D', value: '13/52', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '一副牌有4种花色，每种13张，抽到红桃的概率是13/52=1/4。'
          },
          {
            id: 'q_math_099',
            question: '若P(A)=0.6，则P(∁A)=（ ）',
            options: [
              { key: 'A', value: '0.6', explanation: '' },
              { key: 'B', value: '0.4', explanation: '' },
              { key: 'C', value: '1.6', explanation: '' },
              { key: 'D', value: '0', explanation: '' }
            ],
            correctAnswer: 'B',
            explanation: '对立事件概率之和为1：P(∁A)=1-P(A)=1-0.6=0.4。'
          },
          {
            id: 'q_math_100',
            question: '同时掷两枚骰子，点数之和为7的概率是（ ）',
            options: [
              { key: 'A', value: '1/6', explanation: '' },
              { key: 'B', value: '1/12', explanation: '' },
              { key: 'C', value: '7/36', explanation: '' },
              { key: 'D', value: '5/36', explanation: '' }
            ],
            correctAnswer: 'A',
            explanation: '总共有36种情况，和为7的有(1,6)(2,5)(3,4)(4,3)(5,2)(6,1)共6种，概率是6/36=1/6。'
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
