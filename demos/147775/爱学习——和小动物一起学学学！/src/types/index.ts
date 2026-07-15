export type AnimalType = 'rabbit' | 'squirrel' | 'bird';

export interface Animal {
  id: string;
  type: AnimalType;
  name: string;
  emoji: string;
  level: number;
  exp: number;
  maxExp: number;
  rewards: string[];
}

export type QuestionCategory = 'numbers' | 'colors' | 'vocabulary';

export interface Question {
  id: string;
  category: QuestionCategory;
  question: string;
  image?: string;
  options: string[];
  correctAnswer: string;
}

export interface GameSession {
  id: string;
  category: QuestionCategory;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timestamp: Date;
}

export interface UserStats {
  totalStudyTime: number;
  totalGamesPlayed: number;
  correctRate: number;
  completedLevels: number;
  streakDays: number;
  lastPlayDate: string;
}

export interface GameState {
  animals: Animal[];
  currentAnimalId: string | null;
  questions: Question[];
  currentQuestionIndex: number;
  currentCategory: QuestionCategory;
  score: number;
  correctCount: number;
  isPlaying: boolean;
  gameSessions: GameSession[];
  stats: UserStats;
}
