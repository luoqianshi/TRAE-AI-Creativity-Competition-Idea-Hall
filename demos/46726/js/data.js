/* ============================================================
   错题闯关 · 数据层
   提供示例题目、示例对话、知识点、成就等数据
   ============================================================ */

// ---------- 示例错题 ----------
const SAMPLE_MISTAKES = [
  {
    id: 1,
    subject: 'math',
    subjectName: '数学',
    icon: '📐',
    question: '一个长方形的长是 8 厘米，宽是 5 厘米。如果长增加 3 厘米，宽减少 2 厘米，那么新长方形的周长比原来增加了多少厘米？',
    answer: '2 厘米',
    knowledgePoints: ['周长计算', '长方形'],
    reason: '粗心大意',
    time: '2026-06-18',
    mastered: false,
    options: ['2 厘米', '4 厘米', '6 厘米', '8 厘米']
  },
  {
    id: 2,
    subject: 'math',
    subjectName: '数学',
    icon: '🔢',
    question: '小明读一本故事书，第一天读了全书的 1/4，第二天读了全书的 2/5，还剩 70 页没读。这本书一共有多少页？',
    answer: '200 页',
    knowledgePoints: ['分数应用题', '方程'],
    reason: '方法不会',
    time: '2026-06-17',
    mastered: false,
    options: ['180 页', '200 页', '220 页', '240 页']
  },
  {
    id: 3,
    subject: 'chinese',
    subjectName: '语文',
    icon: '📖',
    question: '"春风又绿江南岸，明月何时照我还" 中的"绿"字是什么用法？',
    answer: '形容词用作动词',
    knowledgePoints: ['古诗鉴赏', '词类活用'],
    reason: '概念不清',
    time: '2026-06-16',
    mastered: false,
    options: ['名词用作动词', '形容词用作动词', '使动用法', '意动用法']
  },
  {
    id: 4,
    subject: 'english',
    subjectName: '英语',
    icon: '🔤',
    question: 'Choose the correct answer: She ___ to school every day.',
    answer: 'goes',
    knowledgePoints: ['一般现在时', '主谓一致'],
    reason: '概念不清',
    time: '2026-06-15',
    mastered: false,
    options: ['go', 'goes', 'going', 'went']
  },
  {
    id: 5,
    subject: 'math',
    subjectName: '数学',
    icon: '📐',
    question: '一个三角形三个内角度数的比是 2:3:4，这个三角形最大的角是多少度？',
    answer: '80 度',
    knowledgePoints: ['三角形内角和', '比例'],
    reason: '计算错误',
    time: '2026-06-14',
    mastered: true,
    options: ['60 度', '80 度', '90 度', '100 度']
  },
  {
    id: 6,
    subject: 'science',
    subjectName: '科学',
    icon: '🧪',
    question: '光合作用的主要原料是什么？',
    answer: '二氧化碳和水',
    knowledgePoints: ['光合作用', '植物生理'],
    reason: '概念不清',
    time: '2026-06-13',
    mastered: false,
    options: ['氧气和水', '二氧化碳和水', '氧气和葡萄糖', '二氧化碳和氧气']
  }
];

// ---------- 知识点掌握度数据 ----------
const KNOWLEDGE_POINTS = [
  { name: '分数应用', value: 72 },
  { name: '几何图形', value: 55 },
  { name: '方程', value: 68 },
  { name: '阅读理解', value: 80 },
  { name: '语法', value: 60 },
  { name: '科学实验', value: 75 }
];

// ---------- 近7天学习趋势 ----------
const LEARNING_TREND = [
  { day: '周一', count: 3, correct: 2 },
  { day: '周二', count: 5, correct: 4 },
  { day: '周三', count: 2, correct: 2 },
  { day: '周四', count: 6, correct: 5 },
  { day: '周五', count: 4, correct: 3 },
  { day: '周六', count: 8, correct: 7 },
  { day: '今日', count: 3, correct: 2 }
];

// ---------- 成就定义 ----------
const ACHIEVEMENTS = [
  { id: 1, icon: '🌱', name: '初次尝试', desc: '首次录入错题', unlocked: true },
  { id: 2, icon: '🔥', name: '三连击', desc: '连续答对 3 道题', unlocked: true },
  { id: 3, icon: '📚', name: '学霸之路', desc: '累计录入 10 道错题', unlocked: false },
  { id: 4, icon: '⭐', name: '百分达人', desc: '获得 100 经验值', unlocked: true },
  { id: 5, icon: '🏆', name: '全对通关', desc: '一次挑战全部答对', unlocked: false },
  { id: 6, icon: '📖', name: '坚持 7 天', desc: '连续学习 7 天', unlocked: false },
  { id: 7, icon: '🎯', name: '神射手', desc: '正确率达 90% 以上', unlocked: false },
  { id: 8, icon: '👑', name: '错题大师', desc: '掌握 20 道错题', unlocked: false }
];

// ---------- AI 对话响应模板 ----------
const AI_RESPONSES = {
  '分数应用': `分数应用题的解题方法其实很简单：

📌 三步法：
1️⃣ 找出"单位 1"的量
2️⃣ 确定已知量对应的分率
3️⃣ 用 "单位1 × 分率 = 对应量"

📌 常见题型：
• 求一个数的几分之几 → 用乘法
• 已知几分之几是多少，求原数 → 用除法或方程
• 剩余问题：1 - 已用分率 = 剩余分率

多练习就能熟能生巧哦！💪`,

  '几何': `几何题的关键是画图分析和公式运用：

📐 常用公式：
• 长方形周长 = (长+宽)×2
• 长方形面积 = 长×宽
• 三角形面积 = 底×高÷2
• 圆面积 = πr²

🎨 解题技巧：
1. 把题目条件画在图上
2. 标记已知量和未知量
3. 找等量关系列方程`,

  '语法': `英语语法学习小秘诀 📝

• 时态要注意：时间标志词是关键
  → every day 就是一般现在时
  → yesterday 就是一般过去时

• 主谓一致：第三人称单数动词要加 s/es
  → She/He/It + 动词 s

• 多造句多朗读，语感比死记更有效！`,

  '练习': `好的，给你出几道练习题 ✏️

1️⃣ 一个数的 3/4 是 60，这个数是多少？
   A. 45    B. 75    C. 80    D. 90

2️⃣ 长方形长 12cm，比宽多 4cm，周长是多少？
   A. 32cm   B. 40cm   C. 48cm   D. 64cm

3️⃣ 选择正确答案：They ___ playing football now.
   A. is    B. are    C. was    D. were

做完可以问我答案哦！`,

  '粗心': `哈哈，"粗心"其实是可以训练改善的 🔧

💡 建议：
1. 题目读 2 遍再动笔，画出关键词
2. 计算时一步一步来，不要跳步
3. 做完马上检查一遍，用不同方法验证
4. 准备"错题本"，记录粗心的具体原因

记住：聪明的人不是不犯错，而是不犯同样的错误！💪`,

  'default': `好问题！让我来帮你分析一下 🤖

根据你的描述，建议从以下几个方面入手：

1️⃣ 先理解基本概念，确保基础知识扎实
2️⃣ 找类似的例题研究，学习解题思路
3️⃣ 独立尝试解题，不要急于看答案
4️⃣ 总结这类题目的解题套路

如果你能提供具体的题目，我可以给出更详细的讲解哦！📖`
};

// ---------- 用户初始状态 ----------
const DEFAULT_USER_STATE = {
  level: 3,
  xp: 280,
  stars: 5,
  streak: 0,
  totalMistakes: 6,
  masteredCount: 1,
  correctCount: 18,
  totalAnswered: 25,
  learningDays: 3,
  lastLogin: null
};

// ---------- 存储辅助 ----------
function loadData() {
  try {
    const saved = localStorage.getItem('cuotiguan_data');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return {
    user: { ...DEFAULT_USER_STATE },
    mistakes: SAMPLE_MISTAKES.map(m => ({ ...m })),
    achievements: ACHIEVEMENTS.map(a => ({ ...a })),
    dailyTasks: [
      { id: 1, title: '复习 3 道错题', desc: '加深薄弱知识点', reward: 20, done: false },
      { id: 2, title: '完成 1 次闯关挑战', desc: '检验学习成果', reward: 30, done: false },
      { id: 3, title: '向 AI 助教提问', desc: '解决学习疑惑', reward: 10, done: false }
    ]
  };
}

function saveData(data) {
  try {
    localStorage.setItem('cuotiguan_data', JSON.stringify(data));
  } catch (e) {}
}
