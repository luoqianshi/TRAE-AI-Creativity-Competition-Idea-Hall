import { create } from 'zustand';
import type { User, ExamCategory, Subject, Question, ExamRecord } from '@/types';
import { defaultUser, examRecords } from '@/data/user';

interface AppState {
  user: User;
  currentCategory: ExamCategory | null;
  currentSubject: Subject | null;
  currentQuestion: Question | null;
  examRecords: ExamRecord[];
  selectedAnswers: string[];
  setUser: (user: User) => void;
  setCurrentCategory: (category: ExamCategory | null) => void;
  setCurrentSubject: (subject: Subject | null) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setSelectedAnswers: (answers: string[]) => void;
  addExamRecord: (record: ExamRecord) => void;
  checkIn: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: defaultUser,
  currentCategory: null,
  currentSubject: null,
  currentQuestion: null,
  examRecords: examRecords,
  selectedAnswers: [],
  setUser: (user) => set({ user }),
  setCurrentCategory: (category) => set({ currentCategory: category }),
  setCurrentSubject: (subject) => set({ currentSubject: subject }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setSelectedAnswers: (answers) => set({ selectedAnswers: answers }),
  addExamRecord: (record) => set((state) => ({
    examRecords: [...state.examRecords, record]
  })),
  checkIn: () => set((state) => ({
    user: {
      ...state.user,
      studyStats: {
        ...state.user.studyStats,
        totalDays: state.user.studyStats.totalDays + 1,
        consecutiveDays: state.user.studyStats.consecutiveDays + 1
      }
    }
  }))
}));