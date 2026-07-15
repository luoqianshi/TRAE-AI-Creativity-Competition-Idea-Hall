import type { LearningStatus, LearningRecord } from '../types';

export function updateMastery(currentLevel: number, isCorrect: boolean): number {
  if (isCorrect) {
    return Math.min(100, currentLevel + Math.max(5, (100 - currentLevel) * 0.2));
  } else {
    return Math.max(0, currentLevel - Math.max(3, currentLevel * 0.3));
  }
}

export function levelToStatus(level: number): LearningStatus {
  if (level <= 15) return 'not_started';
  if (level <= 60) return 'learning';
  if (level <= 89) return 'need_review';
  return 'mastered';
}

export function statusToLevel(status: LearningStatus): number {
  switch (status) {
    case 'not_started': return 0;
    case 'learning': return 35;
    case 'need_review': return 75;
    case 'mastered': return 95;
  }
}

export function getNextReviewDate(masteryLevel: number, lastStudyAt: Date): Date {
  const intervals = [1, 2, 4, 7, 15, 30];
  const idx = Math.min(Math.floor(masteryLevel / 17), intervals.length - 1);
  const next = new Date(lastStudyAt);
  next.setDate(next.getDate() + intervals[idx]);
  return next;
}

export function needsReview(record: LearningRecord | undefined, now: Date = new Date()): boolean {
  if (!record) return false;
  if (record.status === 'mastered') return false;
  if (record.status === 'not_started') return false;
  try {
    const reviewAt = new Date(record.nextReviewAt);
    return reviewAt.getTime() <= now.getTime();
  } catch {
    return false;
  }
}

export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomSample<T>(arr: T[], n: number): T[] {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

export function createEmptyLearningRecord(wordId: number): LearningRecord {
  const now = new Date();
  const reviewAt = new Date(now);
  reviewAt.setDate(reviewAt.getDate() + 1);
  return {
    wordId,
    status: 'not_started',
    correctCount: 0,
    wrongCount: 0,
    studyCount: 0,
    lastStudyAt: now.toISOString(),
    nextReviewAt: reviewAt.toISOString(),
    masteryLevel: 0,
  };
}
