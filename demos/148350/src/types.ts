export interface Habit {
  id: string;
  name: string;
  category: "学习" | "运动" | "生活" | "心理";
  frequency: "每天" | "每周3次" | "每周5次";
  reminderTime: string;
  createdAt: string;
  color: string;
  icon: string;
}

export interface CheckInRecord {
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  note?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  condition: (stats: UserStats) => boolean;
}

export interface UserStats {
  totalCheckIns: number;
  currentStreak: number;
  longestStreak: number;
  perfectDays: number;
  completedHabits: number;
}

export interface AIMessage {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: number;
  type?: "greeting" | "encouragement" | "intervention" | "consulting";
}

export interface User {
  name: string;
  joinedAt: string;
  level: number;
  xp: number;
}

export interface UserProfile {
  nickname: string;
  gender: "男" | "女" | "";
  birthday: string; // YYYY-MM-DD
  height: number;   // cm
  weight: number;   // kg
  avatar: string;   // avatar color key
  bio: string;      // 个性签名
}

export const APP_VERSION = "1.2.0";
export const APP_BUILD = "2026.07.14";
