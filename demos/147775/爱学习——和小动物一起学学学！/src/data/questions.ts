import { Question } from '../types';

export const questions: Question[] = [
  {
    id: 'num-1',
    category: 'numbers',
    question: '图片中有几个苹果？',
    options: ['1', '2', '3', '4'],
    correctAnswer: '3',
  },
  {
    id: 'num-2',
    category: 'numbers',
    question: '5 + 3 = ?',
    options: ['7', '8', '9', '10'],
    correctAnswer: '8',
  },
  {
    id: 'num-3',
    category: 'numbers',
    question: '哪个数字最大？',
    options: ['5', '12', '8', '3'],
    correctAnswer: '12',
  },
  {
    id: 'num-4',
    category: 'numbers',
    question: '10 - 4 = ?',
    options: ['5', '6', '7', '8'],
    correctAnswer: '6',
  },
  {
    id: 'num-5',
    category: 'numbers',
    question: '一共有几只小动物？',
    options: ['2', '3', '4', '5'],
    correctAnswer: '3',
  },
  {
    id: 'col-1',
    category: 'colors',
    question: '天空是什么颜色的？',
    options: ['红色', '蓝色', '绿色', '黄色'],
    correctAnswer: '蓝色',
  },
  {
    id: 'col-2',
    category: 'colors',
    question: '太阳是什么颜色的？',
    options: ['紫色', '橙色', '黄色', '粉色'],
    correctAnswer: '黄色',
  },
  {
    id: 'col-3',
    category: 'colors',
    question: '草地是什么颜色的？',
    options: ['绿色', '蓝色', '红色', '白色'],
    correctAnswer: '绿色',
  },
  {
    id: 'col-4',
    category: 'colors',
    question: '草莓是什么颜色的？',
    options: ['黄色', '蓝色', '红色', '紫色'],
    correctAnswer: '红色',
  },
  {
    id: 'col-5',
    category: 'colors',
    question: '香蕉是什么颜色的？',
    options: ['绿色', '黄色', '红色', '紫色'],
    correctAnswer: '黄色',
  },
  {
    id: 'voc-1',
    category: 'vocabulary',
    question: '🐰 是什么动物？',
    options: ['小猫', '小狗', '兔子', '小鸟'],
    correctAnswer: '兔子',
  },
  {
    id: 'voc-2',
    category: 'vocabulary',
    question: '🐱 喜欢吃什么？',
    options: ['骨头', '胡萝卜', '鱼', '草'],
    correctAnswer: '鱼',
  },
  {
    id: 'voc-3',
    category: 'vocabulary',
    question: '🌳 是什么？',
    options: ['花朵', '树木', '房子', '汽车'],
    correctAnswer: '树木',
  },
  {
    id: 'voc-4',
    category: 'vocabulary',
    question: '🌞 是什么？',
    options: ['月亮', '星星', '太阳', '云朵'],
    correctAnswer: '太阳',
  },
  {
    id: 'voc-5',
    category: 'vocabulary',
    question: '🦋 是什么？',
    options: ['蜜蜂', '蝴蝶', '小鸟', '蜻蜓'],
    correctAnswer: '蝴蝶',
  },
];

export const getQuestionsByCategory = (category: string): Question[] => {
  return questions.filter(q => q.category === category);
};

export const getRandomQuestions = (category: string, count: number): Question[] => {
  const categoryQuestions = getQuestionsByCategory(category);
  const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
