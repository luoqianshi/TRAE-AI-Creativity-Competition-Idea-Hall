/**
 * 题目数据格式定义
 * 支持多种类型的题目：计算题、概念题、互动题等
 */

// 题目类型枚举
const QuestionType = {
  CALCULATION: 'calculation',  // 计算题
  CONCEPT: 'concept',          // 概念题
  INTERACTIVE: 'interactive',  // 互动题
  COMPARISON: 'comparison',    // 比较题
  DECOMPOSITION: 'decomposition', // 分解题
  VERTICAL: 'vertical'         // 竖式计算
};

// 题目难度枚举
const Difficulty = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// 学习模块数据结构
const LearningModule = {
  id: 1,
  title: '一、整数加减法',
  lessons: [
    {
      id: 1,
      title: '5以内加减法',
      description: '学习5以内的数的认识、分解、比较和加减法',
      questions: [
        // 5以内数的认识
        {
          id: 1,
          type: QuestionType.CONCEPT,
          difficulty: Difficulty.EASY,
          title: '认识数字1',
          content: '请指出下列物品中哪些表示数字1',
          options: ['🍎', '🍎🍎', '🍎🍎🍎', '🍌'],
          correctAnswer: 0,
          tools: ['十格阵', '小棒', '苹果', '西红柿'],
          explanation: '数字1可以用一个物体来表示，比如一个苹果、一根小棒等'
        },
        

        // 5以内数的分解
        {
          id: 6,
          type: QuestionType.DECOMPOSITION,
          difficulty: Difficulty.MEDIUM,
          title: '数字分解',
          content: '数字2可以分解为哪些数的和？',
          options: ['1+1', '1+2', '2+2', '3+1'],
          correctAnswer: 0,
          tools: ['数字分解工具'],
          explanation: '数字2可以分解为1+1，这是数字分解的基础'
        },
       

        // 5以内数的比较
        {
          id: 8,
          type: QuestionType.COMPARISON,
          difficulty: Difficulty.MEDIUM,
          title: '数字比较',
          content: '比较两个数的大小：3 和 2',
          options: ['3 > 2', '3 < 2', '3 = 2', '无法比较'],
          correctAnswer: 0,
          tools: ['数轴', '十格阵'],
          explanation: '通过数轴或十格阵可以直观地看到3比2大'
        },
        

        // 5以内数的加法
        {
          id: 10,
          type: QuestionType.CALCULATION,
          difficulty: Difficulty.EASY,
          title: '加法运算',
          content: '1 + 1 = ?',
          options: ['1', '2', '3', '4'],
          correctAnswer: 1,
          tools: ['十格阵', '小棒'],
          explanation: '1个物体加上1个物体等于2个物体'
        },
       

        // 5以内数的减法
        {
          id: 20,
          type: QuestionType.CALCULATION,
          difficulty: Difficulty.EASY,
          title: '减法运算',
          content: '5 - 1 = ?',
          options: ['4', '5', '6', '7'],
          correctAnswer: 0,
          tools: ['十格阵', '小棒'],
          explanation: '5个物体减去1个物体等于4个物体'
        },
          // 带分数运算
        {
          id: 35,
          type: QuestionType.CALCULATION,
          difficulty: Difficulty.HARD,
          title: '带分数加法',
          content: '1½ + 2½ = ?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1,
          tools: ['十格阵', '数字分解工具'],
          explanation: '1½ + 2½ = 3 + 1 = 4'
        },
        {
          id: 36,
          type: QuestionType.CALCULATION,
          difficulty: Difficulty.HARD,
          title: '带分数减法',
          content: '3½ - 1½ = ?',
          options: ['1', '2', '3', '4'],
          correctAnswer: 1,
          tools: ['十格阵', '数字分解工具'],
          explanation: '3½ - 1½ = 2'
        },

        // 四则混合运算
        {
          id: 37,
          type: QuestionType.CALCULATION,
          difficulty: Difficulty.HARD,
          title: '四则混合运算',
          content: '2 + 3 × 2 = ?',
          options: ['8', '10', '12', '14'],
          correctAnswer: 0,
          tools: ['十格阵', '数字分解工具'],
          explanation: '先算乘法：3 × 2 = 6，再算加法：2 + 6 = 8'
        },
        {
          id: 38,
          type: QuestionType.CALCULATION,
          difficulty: Difficulty.HARD,
          title: '四则混合运算',
          content: '10 - 4 ÷ 2 = ?',
          options: ['6', '7', '8', '9'],
          correctAnswer: 2,
          tools: ['十格阵', '数字分解工具'],
          explanation: '先算除法：4 ÷ 2 = 2，再算减法：10 - 2 = 8'
        },
        {
          id: 39,
          type: QuestionType.CALCULATION,
          difficulty: Difficulty.HARD,
          title: '四则混合运算',
          content: '(4 + 2) × 3 = ?',
          options: ['12', '16', '18', '24'],
          correctAnswer: 2,
          tools: ['十格阵', '数字分解工具'],
          explanation: '先算括号内：4 + 2 = 6，再算乘法：6 × 3 = 18'
        },

        // 竖式计算
        {
          id: 40,
          type: QuestionType.VERTICAL,
          difficulty: Difficulty.MEDIUM,
          title: '竖式加法',
          content: '23 + 15',
          verticalData: {
            top: '23',
            bottom: '15',
            operator: '+',
            result: '38'
          },
          options: ['38', '39', '40', '41'],
          correctAnswer: 0,
          tools: ['十格阵', '数字分解工具'],
          explanation: '23 + 15 = 38，竖式计算时个位相加 3+5=8，十位相加 2+1=3'
        },
        {
          id: 41,
          type: QuestionType.VERTICAL,
          difficulty: Difficulty.MEDIUM,
          title: '竖式减法',
          content: '45 - 12',
          verticalData: {
            top: '45',
            bottom: '12',
            operator: '-',
            result: '33'
          },
          options: ['32', '33', '34', '35'],
          correctAnswer: 1,
          tools: ['十格阵', '数字分解工具'],
          explanation: '45 - 12 = 33，竖式计算时个位相减 5-2=3，十位相减 4-1=3'
        },
        {
          id: 42,
          type: QuestionType.VERTICAL,
          difficulty: Difficulty.HARD,
          title: '竖式加法（进位）',
          content: '37 + 25',
          verticalData: {
            top: '37',
            bottom: '25',
            operator: '+',
            result: '62',
            carry: true
          },
          options: ['60', '61', '62', '63'],
          correctAnswer: 2,
          tools: ['十格阵', '数字分解工具'],
          explanation: '37 + 25 = 62，个位相加 7+5=12，向十位进1，十位相加 3+2+1=6'
        },
        {
          id: 43,
          type: QuestionType.VERTICAL,
          difficulty: Difficulty.HARD,
          title: '竖式减法（退位）',
          content: '42 - 18',
          verticalData: {
            top: '42',
            bottom: '18',
            operator: '-',
            result: '24',
            borrow: true
          },
          options: ['24', '25', '26', '27'],
          correctAnswer: 0,
          tools: ['十格阵', '数字分解工具'],
          explanation: '42 - 18 = 24，个位2减8不够，从十位借1，变成12-8=4，十位3-1=2'
        },
        {
          id: 44,
          type: QuestionType.VERTICAL,
          difficulty: Difficulty.HARD,
          title: '竖式乘法',
          content: '12 × 3',
          verticalData: {
            top: '12',
            bottom: '3',
            operator: '×',
            result: '36'
          },
          options: ['34', '35', '36', '37'],
          correctAnswer: 2,
          tools: ['十格阵', '数字分解工具'],
          explanation: '12 × 3 = 36，个位2×3=6，十位1×3=3'
        },
        {
          id: 45,
          type: QuestionType.VERTICAL,
          difficulty: Difficulty.HARD,
          title: '竖式乘法（进位）',
          content: '16 × 4',
          verticalData: {
            top: '16',
            bottom: '4',
            operator: '×',
            result: '64',
            carry: true
          },
          options: ['60', '62', '64', '66'],
          correctAnswer: 2,
          tools: ['十格阵', '数字分解工具'],
          explanation: '16 × 4 = 64，个位6×4=24，向十位进2，十位1×4+2=6'
        },
        {
          id: 46,
          type: QuestionType.VERTICAL,
          difficulty: Difficulty.HARD,
          title: '竖式除法',
          content: '24 ÷ 6',
          verticalData: {
            top: '24',
            bottom: '6',
            operator: '÷',
            result: '4'
          },
          options: ['3', '4', '5', '6'],
          correctAnswer: 1,
          tools: ['十格阵', '数字分解工具'],
          explanation: '24 ÷ 6 = 4，6×4=24'
        }
      ]
    }
  ]
};

// Mock API 接口
const MockAPI = {
  // 获取学习模块列表
  getLearningModules: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([LearningModule]);
      }, 500);
    });
  },

  // 获取课程信息
  getLesson: async (moduleId, lessonId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const module = LearningModule;
        const lesson = module.lessons.find(l => l.id === parseInt(lessonId));
        resolve(lesson);
      }, 500);
    });
  },

  // 获取题目列表
  getQuestions: async (moduleId, lessonId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const module = LearningModule;
        const lesson = module.lessons.find(l => l.id === parseInt(lessonId));
        resolve(lesson.questions);
      }, 500);
    });
  },

  // 获取单个题目
  getQuestion: async (moduleId, lessonId, questionId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const module = LearningModule;
        const lesson = module.lessons.find(l => l.id === parseInt(lessonId));
        const question = lesson.questions.find(q => q.id === parseInt(questionId));
        resolve(question);
      }, 500);
    });
  },

  // 提交答案
  submitAnswer: async (moduleId, lessonId, questionId, userAnswer) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const module = LearningModule;
        const lesson = module.lessons.find(l => l.id === parseInt(lessonId));
        const question = lesson.questions.find(q => q.id === parseInt(questionId));
        
        const isCorrect = userAnswer === question.correctAnswer;
        
        resolve({
          success: true,
          isCorrect,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          score: isCorrect ? 10 : 0
        });
      }, 500);
    });
  }
};

// 导出接口
window.MockAPI = MockAPI;
window.QuestionType = QuestionType;
window.Difficulty = Difficulty;