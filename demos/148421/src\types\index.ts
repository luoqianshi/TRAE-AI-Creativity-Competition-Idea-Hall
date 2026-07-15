export type GradeCategory = 'grade1' | 'grade2' | 'grade3' | 'grade4' | 'grade5' | 'grade6';

export type LearningStatus = 'not_started' | 'learning' | 'mastered' | 'need_review';

export interface Word {
  id: number;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
  category: GradeCategory;
  unit: string;
  emoji: string;
}

export interface LearningRecord {
  wordId: number;
  status: LearningStatus;
  correctCount: number;
  wrongCount: number;
  studyCount: number;
  lastStudyAt: string;
  nextReviewAt: string;
  masteryLevel: number;
}

export interface TestRecord {
  id: number;
  testType: 'choice' | 'fill';
  category: string;
  totalCount: number;
  correctCount: number;
  wrongCount: number;
  accuracy: string;
  createdAt: string;
  wrongWordIds: number[];
  durationSeconds: number;
}

export interface DailyStat {
  date: string;
  wordsLearned: number;
  wordsTested: number;
  correctCount: number;
  studyMinutes: number;
}

export interface AppSettings {
  dailyGoal: number;
  speechRate: number;
  soundEnabled: boolean;
  selectedGrade: GradeCategory | 'all';
}

export interface ChoiceQuestion {
  type: 'choice';
  wordId: number;
  question: string;
  questionWord: string;
  options: string[];
  correctIndex: number;
  questionType: 'meaning' | 'word';
}

export interface FillQuestion {
  type: 'fill';
  wordId: number;
  prompt: string;
  meaning: string;
  answer: string;
  firstLetter: string;
  hint: string;
}

export type TestQuestion = ChoiceQuestion | FillQuestion;

export interface TestState {
  questions: TestQuestion[];
  currentIndex: number;
  answers: (number | string | null)[];
  results: boolean[];
  startTime: number;
}

export const GRADE_LABELS: Record<GradeCategory, string> = {
  grade1: '一年级',
  grade2: '二年级',
  grade3: '三年级',
  grade4: '四年级',
  grade5: '五年级',
  grade6: '六年级',
};

export const STATUS_LABELS: Record<LearningStatus, string> = {
  not_started: '未学习',
  learning: '学习中',
  mastered: '已掌握',
  need_review: '待复习',
};

export const STATUS_COLORS: Record<LearningStatus, string> = {
  not_started: 'bg-gray-200 text-gray-600',
  learning: 'bg-kid-sky/20 text-kid-sky',
  mastered: 'bg-kid-mint/20 text-green-600',
  need_review: 'bg-kid-coral/20 text-kid-coral',
};
