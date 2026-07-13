import type { User, StudyStats, DailyCheckIn } from '@/types';

export const defaultUser: User = {
  id: 'user_001',
  nickname: '备考达人',
  avatar: '',
  studyStats: {
    totalDays: 15,
    consecutiveDays: 7,
    totalQuestions: 560,
    correctRate: 82,
    studyHours: 42
  }
};

export const checkInHistory: DailyCheckIn[] = [
  { date: '2026-07-11', checkedIn: true, studyTime: 60 },
  { date: '2026-07-10', checkedIn: true, studyTime: 45 },
  { date: '2026-07-09', checkedIn: true, studyTime: 90 },
  { date: '2026-07-08', checkedIn: true, studyTime: 30 },
  { date: '2026-07-07', checkedIn: true, studyTime: 75 },
  { date: '2026-07-06', checkedIn: true, studyTime: 40 },
  { date: '2026-07-05', checkedIn: true, studyTime: 55 }
];

export const examRecords = [
  {
    id: 'exam_001',
    subjectId: 'cet4-reading',
    startTime: '2026-07-10 14:00',
    endTime: '2026-07-10 15:30',
    duration: 90,
    score: 85,
    totalScore: 100,
    correctCount: 17,
    totalCount: 20,
    answers: []
  },
  {
    id: 'exam_002',
    subjectId: 'c2-office',
    startTime: '2026-07-08 10:00',
    endTime: '2026-07-08 11:30',
    duration: 90,
    score: 92,
    totalScore: 100,
    correctCount: 18,
    totalCount: 20,
    answers: []
  }
];