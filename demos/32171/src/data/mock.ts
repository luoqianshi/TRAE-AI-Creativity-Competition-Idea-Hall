import type { Question, KnowledgePoint, StudyStats, UserInfo } from '@/types';

export const mockQuestions: Question[] = [
  {
    id: '1',
    subject: '数学',
    grade: '高一',
    content: '已知函数 f(x) = x² - 2x + 1，求 f(x) 的最小值及取得最小值时 x 的值。',
    options: ['A. 最小值为0，x=1', 'B. 最小值为1，x=0', 'C. 最小值为-1，x=1', 'D. 最小值为0，x=-1'],
    correctAnswer: 'A',
    userAnswer: 'C',
    analysis: '将函数 f(x) = x² - 2x + 1 配方得 f(x) = (x-1)²。由于平方数非负，所以当 x=1 时，f(x) 取得最小值 0。',
    knowledgePoints: ['二次函数', '配方法', '函数最值'],
    errorReason: '未正确配方，对二次函数顶点式理解有误',
    createdAt: '2024-01-15',
    mastered: false,
    reviewCount: 2,
    imageUrl: 'https://picsum.photos/id/1/600/400'
  },
  {
    id: '2',
    subject: '物理',
    grade: '高一',
    content: '一物体从高处自由下落，下落过程中重力做的功为 W，物体动能的增加量为 ΔEk，下列说法正确的是：',
    options: ['A. W > ΔEk', 'B. W < ΔEk', 'C. W = ΔEk', 'D. 无法确定'],
    correctAnswer: 'C',
    userAnswer: 'A',
    analysis: '根据动能定理，合外力对物体做的功等于物体动能的变化量。自由下落时，只有重力做功，所以重力做的功等于动能的增加量。',
    knowledgePoints: ['动能定理', '重力做功', '机械能守恒'],
    errorReason: '混淆了重力做功与合外力做功的概念',
    createdAt: '2024-01-14',
    mastered: false,
    reviewCount: 1
  },
  {
    id: '3',
    subject: '英语',
    grade: '高二',
    content: 'The book ______ I bought yesterday is very interesting.',
    options: ['A. who', 'B. which', 'C. what', 'D. whom'],
    correctAnswer: 'B',
    userAnswer: 'C',
    analysis: '这是一个定语从句，先行词是 book（物），所以关系代词应该用 which 或 that。what 不能引导定语从句。',
    knowledgePoints: ['定语从句', '关系代词', '语法'],
    errorReason: '对定语从句的关系代词选择掌握不牢固',
    createdAt: '2024-01-13',
    mastered: true,
    reviewCount: 3
  },
  {
    id: '4',
    subject: '化学',
    grade: '高一',
    content: '下列物质中，属于电解质的是：',
    options: ['A. 蔗糖', 'B. 氯化钠溶液', 'C. 氯化钠固体', 'D. 铜'],
    correctAnswer: 'C',
    userAnswer: 'B',
    analysis: '电解质是指在水溶液中或熔融状态下能导电的化合物。氯化钠固体是化合物，溶于水后能导电，属于电解质。氯化钠溶液是混合物，不是电解质。',
    knowledgePoints: ['电解质', '非电解质', '化合物'],
    errorReason: '混淆了电解质与电解质溶液的概念',
    createdAt: '2024-01-12',
    mastered: false,
    reviewCount: 0
  },
  {
    id: '5',
    subject: '数学',
    grade: '高一',
    content: '等差数列 {an} 中，a₁=2，d=3，求 a₁₀ 的值。',
    options: ['A. 27', 'B. 29', 'C. 31', 'D. 33'],
    correctAnswer: 'B',
    userAnswer: 'A',
    analysis: '等差数列通项公式：an = a₁ + (n-1)d。a₁₀ = 2 + (10-1)×3 = 2 + 27 = 29。',
    knowledgePoints: ['等差数列', '通项公式'],
    errorReason: '计算时漏加首项，直接用 9×3=27',
    createdAt: '2024-01-11',
    mastered: false,
    reviewCount: 1
  },
  {
    id: '6',
    subject: '语文',
    grade: '高二',
    content: '下列句子中，没有语病的一项是：',
    options: ['A. 通过这次活动，使我明白了很多道理', 'B. 他不但会唱歌，而且她也会跳舞', 'C. 我们要防止不发生类似的事故', 'D. 他的写作水平有了很大提高'],
    correctAnswer: 'D',
    userAnswer: 'A',
    analysis: 'A项缺主语，"通过"和"使"不能同时使用；B项关联词搭配不当；C项否定失当，"防止"和"不"重复。',
    knowledgePoints: ['病句辨析', '语法'],
    errorReason: '对主语残缺的语病类型认识不清',
    createdAt: '2024-01-10',
    mastered: true,
    reviewCount: 2
  }
];

export const mockKnowledgePoints: KnowledgePoint[] = [
  { id: '1', name: '二次函数', subject: '数学', errorCount: 5, mastery: 60 },
  { id: '2', name: '配方法', subject: '数学', errorCount: 3, mastery: 75 },
  { id: '3', name: '动能定理', subject: '物理', errorCount: 4, mastery: 50 },
  { id: '4', name: '定语从句', subject: '英语', errorCount: 6, mastery: 40 },
  { id: '5', name: '电解质', subject: '化学', errorCount: 2, mastery: 80 },
  { id: '6', name: '等差数列', subject: '数学', errorCount: 3, mastery: 65 }
];

export const mockStudyStats: StudyStats = {
  totalQuestions: 45,
  masteredQuestions: 18,
  todayAdded: 3,
  streakDays: 7,
  weeklyData: [
    { day: '周一', count: 5 },
    { day: '周二', count: 8 },
    { day: '周三', count: 3 },
    { day: '周四', count: 6 },
    { day: '周五', count: 4 },
    { day: '周六', count: 10 },
    { day: '周日', count: 3 }
  ]
};

export const mockUserInfo: UserInfo = {
  name: '小明同学',
  avatar: 'https://picsum.photos/id/64/200/200',
  grade: '高一',
  subject: '理科',
  studyDays: 30
};