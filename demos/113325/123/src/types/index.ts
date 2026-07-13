export interface ExamCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  subjects: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  categoryId: string;
  totalQuestions: number;
  completedQuestions: number;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  name: string;
  subjectId: string;
  questionCount: number;
}

export interface Question {
  id: string;
  subjectId: string;
  chapterId: string;
  type: 'single' | 'multiple' | 'judge';
  content: string;
  options: Option[];
  answer: string[];
  explanation: string;
  difficulty: 1 | 2 | 3;
}

export interface Option {
  key: string;
  value: string;
}

export interface ExamRecord {
  id: string;
  subjectId: string;
  startTime: string;
  endTime: string;
  duration: number;
  score: number;
  totalScore: number;
  correctCount: number;
  totalCount: number;
  answers: UserAnswer[];
}

export interface UserAnswer {
  questionId: string;
  answer: string[];
  isCorrect: boolean;
}

export interface StudyStats {
  totalDays: number;
  consecutiveDays: number;
  totalQuestions: number;
  correctRate: number;
  studyHours: number;
}

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  studyStats: StudyStats;
}

export interface DailyCheckIn {
  date: string;
  checkedIn: boolean;
  studyTime: number;
}