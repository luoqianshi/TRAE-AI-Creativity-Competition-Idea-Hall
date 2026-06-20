export interface Question {
  id: string;
  subject: string;
  grade: string;
  content: string;
  options?: string[];
  correctAnswer: string;
  userAnswer?: string;
  analysis: string;
  knowledgePoints: string[];
  errorReason?: string;
  createdAt: string;
  mastered: boolean;
  reviewCount: number;
  imageUrl?: string;
}

export interface KnowledgePoint {
  id: string;
  name: string;
  subject: string;
  errorCount: number;
  mastery: number;
}

export interface StudyStats {
  totalQuestions: number;
  masteredQuestions: number;
  todayAdded: number;
  streakDays: number;
  weeklyData: { day: string; count: number }[];
}

export interface UserInfo {
  name: string;
  avatar: string;
  grade: string;
  subject: string;
  studyDays: number;
}