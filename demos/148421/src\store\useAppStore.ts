import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Word, LearningRecord, TestRecord, DailyStat, AppSettings, GradeCategory, TestQuestion } from '../types';
import { WORDS } from '../data/words';
import {
  createEmptyLearningRecord,
  updateMastery,
  levelToStatus,
  getNextReviewDate,
  needsReview,
  shuffle,
  randomSample,
  randomChoice,
} from '../utils/algorithm';
import { todayKey, addDays } from '../utils/date';

interface AppState {
  words: Word[];
  learningRecords: Record<number, LearningRecord>;
  testRecords: TestRecord[];
  dailyStats: Record<string, DailyStat>;
  settings: AppSettings;
  currentLearnList: number[];
  currentTestSession: {
    questions: TestQuestion[];
    answers: (number | string | null)[];
    results: boolean[];
    currentIndex: number;
    startTime: number;
    testType: 'choice' | 'fill';
  } | null;
  lastResultId: number | null;

  getOrCreateRecord: (wordId: number) => LearningRecord;
  markWordStudied: (wordId: number, correct?: boolean) => void;
  markBulkStudied: (wordIds: number[]) => void;
  setSelectedGrade: (g: GradeCategory | 'all') => void;
  setDailyGoal: (n: number) => void;
  setSpeechRate: (r: number) => void;
  toggleSound: () => void;

  generateLearnList: (count: number, filterGrade?: GradeCategory | 'all', includeReview?: boolean) => number[];
  setCurrentLearnList: (ids: number[]) => void;

  generateTest: (testType: 'choice' | 'fill', count: number, filterGrade?: GradeCategory | 'all') => boolean;
  answerQuestion: (index: number, answer: number | string) => { correct: boolean; correctAnswer: number | string };
  finishTest: () => TestRecord | null;
  setLastResultId: (id: number | null) => void;

  getTestRecordById: (id: number) => TestRecord | undefined;

  getStats: () => {
    total: number;
    mastered: number;
    learning: number;
    needReview: number;
    notStarted: number;
    todayLearned: number;
    todayMinutes: number;
    totalAccuracy: string;
    totalTests: number;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  dailyGoal: 15,
  speechRate: 0.9,
  soundEnabled: true,
  selectedGrade: 'all',
};

function createDefaultDailyStat(date: string): DailyStat {
  return { date, wordsLearned: 0, wordsTested: 0, correctCount: 0, studyMinutes: 0 };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      words: WORDS,
      learningRecords: {},
      testRecords: [],
      dailyStats: {},
      settings: DEFAULT_SETTINGS,
      currentLearnList: [],
      currentTestSession: null,
      lastResultId: null,

      getOrCreateRecord: (wordId: number) => {
        const existing = get().learningRecords[wordId];
        if (existing) return existing;
        const fresh = createEmptyLearningRecord(wordId);
        set((s) => ({ learningRecords: { ...s.learningRecords, [wordId]: fresh } }));
        return fresh;
      },

      markWordStudied: (wordId: number, correct?: boolean) => {
        const today = todayKey();
        set((s) => {
          const prev = s.learningRecords[wordId] || createEmptyLearningRecord(wordId);
          const now = new Date();
          let nextLevel = prev.masteryLevel;
          const nextCorrect = prev.correctCount + (correct === true ? 1 : 0);
          const nextWrong = prev.wrongCount + (correct === false ? 1 : 0);
          if (correct !== undefined) {
            nextLevel = updateMastery(nextLevel, correct);
          } else {
            nextLevel = Math.max(nextLevel, 25);
          }
          const nextStatus = levelToStatus(nextLevel);
          const nextReview = getNextReviewDate(nextLevel, now);
          const record: LearningRecord = {
            wordId,
            status: nextStatus,
            correctCount: nextCorrect,
            wrongCount: nextWrong,
            studyCount: prev.studyCount + 1,
            lastStudyAt: now.toISOString(),
            nextReviewAt: nextReview.toISOString(),
            masteryLevel: Math.round(nextLevel),
          };
          const stat = s.dailyStats[today] || createDefaultDailyStat(today);
          const nextStat: DailyStat = {
            ...stat,
            wordsLearned: stat.wordsLearned + 1,
            correctCount: stat.correctCount + (correct === true ? 1 : 0),
            studyMinutes: stat.studyMinutes,
          };
          return {
            learningRecords: { ...s.learningRecords, [wordId]: record },
            dailyStats: { ...s.dailyStats, [today]: nextStat },
          };
        });
      },

      markBulkStudied: (wordIds: number[]) => {
        const today = todayKey();
        set((s) => {
          const now = new Date();
          const records = { ...s.learningRecords };
          wordIds.forEach((id) => {
            const prev = records[id] || createEmptyLearningRecord(id);
            const newLevel = Math.max(prev.masteryLevel, 25);
            records[id] = {
              ...prev,
              studyCount: prev.studyCount + 1,
              lastStudyAt: now.toISOString(),
              masteryLevel: Math.round(newLevel),
              status: levelToStatus(newLevel),
              nextReviewAt: getNextReviewDate(newLevel, now).toISOString(),
            };
          });
          const stat = s.dailyStats[today] || createDefaultDailyStat(today);
          return {
            learningRecords: records,
            dailyStats: {
              ...s.dailyStats,
              [today]: { ...stat, wordsLearned: stat.wordsLearned + wordIds.length },
            },
          };
        });
      },

      setSelectedGrade: (g) => set((s) => ({ settings: { ...s.settings, selectedGrade: g } })),
      setDailyGoal: (n) => set((s) => ({ settings: { ...s.settings, dailyGoal: n } })),
      setSpeechRate: (r) => set((s) => ({ settings: { ...s.settings, speechRate: r } })),
      toggleSound: () => set((s) => ({ settings: { ...s.settings, soundEnabled: !s.settings.soundEnabled } })),

      generateLearnList: (count, filterGrade = 'all', includeReview = true) => {
        const { words, learningRecords, settings } = get();
        const grade = filterGrade === 'all' ? settings.selectedGrade : filterGrade;
        let pool = grade === 'all' ? [...words] : words.filter((w) => w.category === grade);
        if (pool.length === 0) pool = [...words];

        const now = new Date();
        const review: number[] = [];
        const notStarted: number[] = [];
        const learning: number[] = [];
        pool.forEach((w) => {
          const rec = learningRecords[w.id];
          if (includeReview && needsReview(rec, now)) {
            review.push(w.id);
          } else if (!rec || rec.status === 'not_started') {
            notStarted.push(w.id);
          } else if (rec.status === 'learning') {
            learning.push(w.id);
          }
        });

        const result: number[] = [];
        result.push(...randomSample(review, Math.ceil(count * 0.4)));
        result.push(...randomSample(notStarted, Math.ceil(count * 0.45)));
        result.push(...randomSample(learning, Math.ceil(count * 0.15)));

        const unique = Array.from(new Set(result));
        const final = shuffle(unique).slice(0, count);
        set({ currentLearnList: final });
        return final;
      },

      setCurrentLearnList: (ids) => set({ currentLearnList: ids }),

      generateTest: (testType, count, filterGrade = 'all') => {
        const { words, learningRecords, settings } = get();
        const grade = filterGrade === 'all' ? settings.selectedGrade : filterGrade;
        let pool = grade === 'all' ? [...words] : words.filter((w) => w.category === grade);
        if (pool.length < 5) pool = [...words];
        if (pool.length < 4) return false;

        const now = new Date();
        const ordered = [...pool].sort((a, b) => {
          const ra = learningRecords[a.id];
          const rb = learningRecords[b.id];
          const score = (r?: LearningRecord) => {
            if (!r) return 10;
            if (needsReview(r, now)) return 0;
            if (r.status === 'learning') return 5;
            return r.status === 'mastered' ? 20 : 15;
          };
          return score(ra) - score(rb);
        });

        const selected = ordered.slice(0, Math.min(count * 2, ordered.length));
        const testWords = randomSample(selected, Math.min(count, selected.length));
        const questions: TestQuestion[] = [];

        for (const w of testWords) {
          if (testType === 'choice') {
            const isMeaningQ = Math.random() > 0.5;
            if (isMeaningQ) {
              const distractors = shuffle(pool.filter((x) => x.id !== w.id)).slice(0, 3);
              const options = shuffle([w.meaning, ...distractors.map((d) => d.meaning)]);
              questions.push({
                type: 'choice',
                wordId: w.id,
                questionWord: w.word,
                question: `单词 "${w.word}" 的中文意思是？`,
                options,
                correctIndex: options.indexOf(w.meaning),
                questionType: 'meaning',
              });
            } else {
              const distractors = shuffle(pool.filter((x) => x.id !== w.id)).slice(0, 3);
              const options = shuffle([w.word, ...distractors.map((d) => d.word)]);
              questions.push({
                type: 'choice',
                wordId: w.id,
                questionWord: w.word,
                question: `意思是"${w.meaning}"的英文单词是？`,
                options,
                correctIndex: options.indexOf(w.word),
                questionType: 'word',
              });
            }
          } else {
            const hint = w.word.length <= 4 ? w.word[0] + ' _ '.repeat(w.word.length - 1).trim() :
              w.word[0] + ' _ '.repeat(Math.max(1, Math.floor(w.word.length / 2))).trim();
            questions.push({
              type: 'fill',
              wordId: w.id,
              prompt: `请根据中文意思拼写单词：${w.meaning}`,
              meaning: w.meaning,
              answer: w.word,
              firstLetter: w.word[0].toUpperCase(),
              hint,
            });
          }
        }

        set({
          currentTestSession: {
            questions,
            answers: new Array(questions.length).fill(null),
            results: new Array(questions.length).fill(false),
            currentIndex: 0,
            startTime: Date.now(),
            testType,
          },
        });
        return questions.length > 0;
      },

      answerQuestion: (index, answer) => {
        const session = get().currentTestSession;
        if (!session) return { correct: false, correctAnswer: -1 };
        const q = session.questions[index];
        let correct = false;
        let correctAnswer: number | string;
        if (q.type === 'choice') {
          correct = (answer as number) === q.correctIndex;
          correctAnswer = q.correctIndex;
        } else {
          const userAns = String(answer).trim().toLowerCase();
          correct = userAns === q.answer.toLowerCase();
          correctAnswer = q.answer;
        }
        const newAnswers = [...session.answers];
        const newResults = [...session.results];
        newAnswers[index] = answer;
        newResults[index] = correct;

        if (correct) {
          get().markWordStudied(q.wordId, true);
        } else {
          get().markWordStudied(q.wordId, false);
        }
        const today = todayKey();
        set((s) => {
          const stat = s.dailyStats[today] || createDefaultDailyStat(today);
          return {
            dailyStats: {
              ...s.dailyStats,
              [today]: {
                ...stat,
                wordsTested: stat.wordsTested + 1,
                correctCount: stat.correctCount + (correct ? 1 : 0),
              },
            },
            currentTestSession: {
              ...session,
              answers: newAnswers,
              results: newResults,
              currentIndex: Math.min(index + 1, session.questions.length),
            },
          };
        });
        return { correct, correctAnswer };
      },

      finishTest: () => {
        const session = get().currentTestSession;
        if (!session) return null;
        const correct = session.results.filter(Boolean).length;
        const total = session.questions.length;
        const wrong: number[] = [];
        session.results.forEach((ok, i) => {
          if (!ok) wrong.push(session.questions[i].wordId);
        });
        const duration = Math.round((Date.now() - session.startTime) / 1000);
        const record: TestRecord = {
          id: Date.now(),
          testType: session.testType,
          category: get().settings.selectedGrade,
          totalCount: total,
          correctCount: correct,
          wrongCount: total - correct,
          accuracy: total === 0 ? '0%' : `${Math.round((correct / total) * 100)}%`,
          createdAt: new Date().toISOString(),
          wrongWordIds: wrong,
          durationSeconds: duration,
        };
        set((s) => {
          const nextRecords = [record, ...s.testRecords].slice(0, 100);
          return {
            testRecords: nextRecords,
            currentTestSession: null,
            lastResultId: record.id,
          };
        });
        return record;
      },

      setLastResultId: (id) => set({ lastResultId: id }),

      getTestRecordById: (id) => get().testRecords.find((t) => t.id === id),

      getStats: () => {
        const { words, learningRecords, testRecords, dailyStats } = get();
        let mastered = 0, learning = 0, needReview = 0, notStarted = 0;
        const now = new Date();
        words.forEach((w) => {
          const r = learningRecords[w.id];
          if (!r || r.status === 'not_started') notStarted++;
          else if (r.status === 'mastered') mastered++;
          else if (needsReview(r, now)) needReview++;
          else learning++;
        });
        const today = dailyStats[todayKey()] || createDefaultDailyStat(todayKey());
        const yesterday = dailyStats[todayKey(addDays(new Date(), -1))];
        const totalCorrect = Object.values(dailyStats).reduce((sum, d) => sum + d.correctCount, 0);
        const totalWordsT = Object.values(dailyStats).reduce((sum, d) => sum + d.wordsTested, 0);
        const totalAccuracy = totalWordsT === 0 ? '—' : `${Math.round((totalCorrect / totalWordsT) * 100)}%`;
        void yesterday;
        return {
          total: words.length,
          mastered,
          learning,
          needReview,
          notStarted,
          todayLearned: today.wordsLearned,
          todayMinutes: Math.round(today.studyMinutes + today.wordsLearned * 1.5),
          totalAccuracy,
          totalTests: testRecords.length,
        };
      },
    }),
    {
      name: 'word-memory-app-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        learningRecords: s.learningRecords,
        testRecords: s.testRecords,
        dailyStats: s.dailyStats,
        settings: s.settings,
      }),
    }
  )
);
