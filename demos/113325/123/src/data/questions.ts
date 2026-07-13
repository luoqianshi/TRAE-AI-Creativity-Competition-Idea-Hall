import type { Question } from '@/types';

export const questions: Question[] = [
  {
    id: 'q1',
    subjectId: 'cet4-reading',
    chapterId: 'cet4-r-3',
    type: 'single',
    content: 'According to the passage, what is the main cause of climate change?',
    options: [
      { key: 'A', value: 'Natural disasters' },
      { key: 'B', value: 'Human activities' },
      { key: 'C', value: 'Solar radiation' },
      { key: 'D', value: 'Ocean currents' }
    ],
    answer: ['B'],
    explanation: 'The passage states that human activities, particularly the burning of fossil fuels and deforestation, are the primary causes of climate change.',
    difficulty: 2
  },
  {
    id: 'q2',
    subjectId: 'cet4-reading',
    chapterId: 'cet4-r-3',
    type: 'single',
    content: 'What does the word "sustainable" mean in the context of environmental protection?',
    options: [
      { key: 'A', value: 'Able to be maintained over time' },
      { key: 'B', value: 'Quickly changing' },
      { key: 'C', value: 'Completely replaced' },
      { key: 'D', value: 'Rapidly growing' }
    ],
    answer: ['A'],
    explanation: 'Sustainable means able to be maintained at a certain rate or level, especially in terms of environmental protection and resource use.',
    difficulty: 1
  },
  {
    id: 'q3',
    subjectId: 'cet4-reading',
    chapterId: 'cet4-r-3',
    type: 'multiple',
    content: 'Which of the following are effective ways to reduce carbon emissions? (Select all that apply)',
    options: [
      { key: 'A', value: 'Using public transportation' },
      { key: 'B', value: 'Planting more trees' },
      { key: 'C', value: 'Burning more coal' },
      { key: 'D', value: 'Recycling waste materials' }
    ],
    answer: ['A', 'B', 'D'],
    explanation: 'Using public transport reduces individual car emissions, planting trees absorbs CO2, and recycling reduces the energy needed for production. Burning coal increases emissions.',
    difficulty: 2
  },
  {
    id: 'q4',
    subjectId: 'c2-office',
    chapterId: 'c2-o-2',
    type: 'single',
    content: '在Word中，如何快速将文档中的所有"考试"替换为"测验"？',
    options: [
      { key: 'A', value: '使用"查找"功能逐个替换' },
      { key: 'B', value: '使用"替换"功能' },
      { key: 'C', value: '手动逐个修改' },
      { key: 'D', value: '使用"格式刷"功能' }
    ],
    answer: ['B'],
    explanation: '在Word中，使用"替换"功能（快捷键Ctrl+H）可以快速将文档中的指定文本替换为新文本。',
    difficulty: 1
  },
  {
    id: 'q5',
    subjectId: 'c2-office',
    chapterId: 'c2-o-3',
    type: 'single',
    content: '在Excel中，公式"=SUM(A1:A10)"的作用是什么？',
    options: [
      { key: 'A', value: '计算A1到A10的平均值' },
      { key: 'B', value: '计算A1到A10的总和' },
      { key: 'C', value: '找出A1到A10中的最大值' },
      { key: 'D', value: '统计A1到A10的单元格个数' }
    ],
    answer: ['B'],
    explanation: 'SUM函数用于计算指定单元格区域的数值总和。',
    difficulty: 1
  },
  {
    id: 'q6',
    subjectId: 'c2-python',
    chapterId: 'c2-p-1',
    type: 'single',
    content: 'Python中，以下哪个是正确的变量命名？',
    options: [
      { key: 'A', value: '1name' },
      { key: 'B', value: 'my-name' },
      { key: 'C', value: 'my_name' },
      { key: 'D', value: 'my name' }
    ],
    answer: ['C'],
    explanation: 'Python变量命名规则：只能包含字母、数字和下划线，不能以数字开头，不能包含空格和特殊字符。',
    difficulty: 1
  },
  {
    id: 'q7',
    subjectId: 'c2-python',
    chapterId: 'c2-p-2',
    type: 'judge',
    content: 'Python中的列表（list）是不可变的。',
    options: [
      { key: 'A', value: '正确' },
      { key: 'B', value: '错误' }
    ],
    answer: ['B'],
    explanation: 'Python中的列表是可变的，可以修改、添加、删除元素。元组（tuple）才是不可变的。',
    difficulty: 1
  },
  {
    id: 'q8',
    subjectId: 't1-edu',
    chapterId: 't1-e-1',
    type: 'single',
    content: '素质教育的核心是什么？',
    options: [
      { key: 'A', value: '提高升学率' },
      { key: 'B', value: '培养学生的创新精神和实践能力' },
      { key: 'C', value: '加强基础知识教学' },
      { key: 'D', value: '增加考试科目' }
    ],
    answer: ['B'],
    explanation: '素质教育的核心是培养学生的创新精神和实践能力，促进学生全面发展。',
    difficulty: 2
  },
  {
    id: 'q9',
    subjectId: 't1-edu',
    chapterId: 't1-e-2',
    type: 'single',
    content: '《中华人民共和国教育法》规定，我国实行的教育制度是？',
    options: [
      { key: 'A', value: '学前教育、初等教育、中等教育、高等教育' },
      { key: 'B', value: '初等教育、中等教育、高等教育' },
      { key: 'C', value: '义务教育、职业教育、高等教育' },
      { key: 'D', value: '基础教育、高等教育、成人教育' }
    ],
    answer: ['A'],
    explanation: '《中华人民共和国教育法》第十七条规定，国家实行学前教育、初等教育、中等教育、高等教育的学校教育制度。',
    difficulty: 2
  },
  {
    id: 'q10',
    subjectId: 't1-knowledge',
    chapterId: 't1-k-1',
    type: 'multiple',
    content: '以下哪些属于教育的基本要素？（多选）',
    options: [
      { key: 'A', value: '教育者' },
      { key: 'B', value: '受教育者' },
      { key: 'C', value: '教育内容' },
      { key: 'D', value: '教育手段' }
    ],
    answer: ['A', 'B', 'C', 'D'],
    explanation: '教育的基本要素包括教育者、受教育者、教育内容和教育手段四个方面。',
    difficulty: 2
  }
];

export const getQuestionsBySubject = (subjectId: string): Question[] => {
  return questions.filter(q => q.subjectId === subjectId);
};

export const getQuestionsByChapter = (chapterId: string): Question[] => {
  return questions.filter(q => q.chapterId === chapterId);
};

export const getQuestionById = (id: string): Question | undefined => {
  return questions.find(q => q.id === id);
};