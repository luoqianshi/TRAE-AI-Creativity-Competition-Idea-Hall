import type { ExamCategory } from '@/types';

export const examCategories: ExamCategory[] = [
  {
    id: 'cet4',
    name: '英语四级',
    icon: '📚',
    color: '#5B7FFF',
    description: '大学英语四级考试备考',
    subjects: [
      {
        id: 'cet4-reading',
        name: '阅读理解',
        categoryId: 'cet4',
        totalQuestions: 500,
        completedQuestions: 120,
        chapters: [
          { id: 'cet4-r-1', name: '词汇理解', questionCount: 100 },
          { id: 'cet4-r-2', name: '长篇阅读', questionCount: 150 },
          { id: 'cet4-r-3', name: '仔细阅读', questionCount: 250 }
        ]
      },
      {
        id: 'cet4-listening',
        name: '听力理解',
        categoryId: 'cet4',
        totalQuestions: 300,
        completedQuestions: 80,
        chapters: [
          { id: 'cet4-l-1', name: '新闻听力', questionCount: 100 },
          { id: 'cet4-l-2', name: '长对话', questionCount: 100 },
          { id: 'cet4-l-3', name: '短文理解', questionCount: 100 }
        ]
      },
      {
        id: 'cet4-writing',
        name: '写作翻译',
        categoryId: 'cet4',
        totalQuestions: 100,
        completedQuestions: 30,
        chapters: [
          { id: 'cet4-w-1', name: '应用文写作', questionCount: 50 },
          { id: 'cet4-w-2', name: '短文写作', questionCount: 30 },
          { id: 'cet4-w-3', name: '段落翻译', questionCount: 20 }
        ]
      }
    ]
  },
  {
    id: 'cet6',
    name: '英语六级',
    icon: '📖',
    color: '#FF7D00',
    description: '大学英语六级考试备考',
    subjects: [
      {
        id: 'cet6-reading',
        name: '阅读理解',
        categoryId: 'cet6',
        totalQuestions: 600,
        completedQuestions: 80,
        chapters: [
          { id: 'cet6-r-1', name: '词汇理解', questionCount: 120 },
          { id: 'cet6-r-2', name: '长篇阅读', questionCount: 180 },
          { id: 'cet6-r-3', name: '仔细阅读', questionCount: 300 }
        ]
      },
      {
        id: 'cet6-listening',
        name: '听力理解',
        categoryId: 'cet6',
        totalQuestions: 400,
        completedQuestions: 50,
        chapters: [
          { id: 'cet6-l-1', name: '新闻听力', questionCount: 120 },
          { id: 'cet6-l-2', name: '长对话', questionCount: 140 },
          { id: 'cet6-l-3', name: '短文理解', questionCount: 140 }
        ]
      },
      {
        id: 'cet6-writing',
        name: '写作翻译',
        categoryId: 'cet6',
        totalQuestions: 120,
        completedQuestions: 20,
        chapters: [
          { id: 'cet6-w-1', name: '应用文写作', questionCount: 50 },
          { id: 'cet6-w-2', name: '短文写作', questionCount: 40 },
          { id: 'cet6-w-3', name: '段落翻译', questionCount: 30 }
        ]
      }
    ]
  },
  {
    id: 'computer2',
    name: '计算机二级',
    icon: '💻',
    color: '#00B42A',
    description: '全国计算机等级考试二级',
    subjects: [
      {
        id: 'c2-office',
        name: 'MS Office高级应用',
        categoryId: 'computer2',
        totalQuestions: 800,
        completedQuestions: 200,
        chapters: [
          { id: 'c2-o-1', name: '计算机基础', questionCount: 100 },
          { id: 'c2-o-2', name: 'Word操作', questionCount: 250 },
          { id: 'c2-o-3', name: 'Excel操作', questionCount: 250 },
          { id: 'c2-o-4', name: 'PowerPoint操作', questionCount: 200 }
        ]
      },
      {
        id: 'c2-python',
        name: 'Python语言程序设计',
        categoryId: 'computer2',
        totalQuestions: 600,
        completedQuestions: 100,
        chapters: [
          { id: 'c2-p-1', name: 'Python基础', questionCount: 150 },
          { id: 'c2-p-2', name: '数据类型', questionCount: 150 },
          { id: 'c2-p-3', name: '流程控制', questionCount: 150 },
          { id: 'c2-p-4', name: '函数与模块', questionCount: 150 }
        ]
      }
    ]
  },
  {
    id: 'teacher',
    name: '教师资格证',
    icon: '🎓',
    color: '#F53F3F',
    description: '教师资格考试备考',
    subjects: [
      {
        id: 't1-edu',
        name: '综合素质',
        categoryId: 'teacher',
        totalQuestions: 500,
        completedQuestions: 150,
        chapters: [
          { id: 't1-e-1', name: '职业理念', questionCount: 100 },
          { id: 't1-e-2', name: '教育法律法规', questionCount: 150 },
          { id: 't1-e-3', name: '教师职业道德', questionCount: 100 },
          { id: 't1-e-4', name: '文化素养', questionCount: 150 }
        ]
      },
      {
        id: 't1-knowledge',
        name: '教育知识与能力',
        categoryId: 'teacher',
        totalQuestions: 400,
        completedQuestions: 80,
        chapters: [
          { id: 't1-k-1', name: '教育基础', questionCount: 100 },
          { id: 't1-k-2', name: '教学实施', questionCount: 120 },
          { id: 't1-k-3', name: '学生指导', questionCount: 100 },
          { id: 't1-k-4', name: '班级管理', questionCount: 80 }
        ]
      }
    ]
  }
];

export const getCategoryById = (id: string): ExamCategory | undefined => {
  return examCategories.find(c => c.id === id);
};

export const getSubjectById = (id: string) => {
  for (const category of examCategories) {
    const subject = category.subjects.find(s => s.id === id);
    if (subject) {
      return { subject, category };
    }
  }
  return null;
};