import { create } from 'zustand';
import { GameState, Animal, QuestionCategory, GameSession, UserStats } from '../types';
import { initialAnimals } from '../data/animals';
import { getRandomQuestions } from '../data/questions';

const STORAGE_KEY = 'animal-learning-game';

const defaultStats: UserStats = {
  totalStudyTime: 0,
  totalGamesPlayed: 0,
  correctRate: 0,
  completedLevels: 0,
  streakDays: 0,
  lastPlayDate: '',
};

const loadState = (): Partial<GameState> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    console.error('Failed to load game state');
  }
  return {};
};

const saveState = (state: Partial<GameState>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save game state');
  }
};

const calculateStreak = (lastPlayDate: string): number => {
  if (!lastPlayDate) return 0;
  
  const today = new Date();
  const lastDate = new Date(lastPlayDate);
  const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 1;
  if (diffDays === 1) return 2;
  return 1;
};

const saved = loadState();

interface GameStore extends GameState {
  selectAnimal: (animalId: string) => void;
  startGame: (category: QuestionCategory) => void;
  answerQuestion: (answer: string) => boolean;
  nextQuestion: () => void;
  endGame: () => void;
  addExp: (amount: number) => void;
}

const DEFAULT_EXP_PER_CORRECT = 10;

export const useGameStore = create<GameStore>((set, get) => ({
  animals: saved.animals || initialAnimals,
  currentAnimalId: saved.currentAnimalId || initialAnimals[0].id,
  questions: [],
  currentQuestionIndex: 0,
  currentCategory: 'numbers',
  score: 0,
  correctCount: 0,
  isPlaying: false,
  gameSessions: saved.gameSessions || [],
  stats: saved.stats || defaultStats,

  selectAnimal: (animalId: string) => {
    set({ currentAnimalId: animalId });
    saveState(get());
  },

  startGame: (category) => {
    const questions = getRandomQuestions(category, 5);
    set({
      questions,
      currentQuestionIndex: 0,
      currentCategory: category,
      score: 0,
      correctCount: 0,
      isPlaying: true,
    });
  },

  answerQuestion: (answer) => {
    const { questions, currentQuestionIndex, correctCount, score } = get();
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) {
      set({
        correctCount: correctCount + 1,
        score: score + 10,
      });
      get().addExp(DEFAULT_EXP_PER_CORRECT);
    }

    return isCorrect;
  },

  nextQuestion: () => {
    const { questions, currentQuestionIndex } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    } else {
      get().endGame();
    }
  },

  endGame: () => {
    const { currentCategory, score, correctCount, questions, stats } = get();
    
    const session: GameSession = {
      id: Date.now().toString(),
      category: currentCategory,
      score,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      timestamp: new Date(),
    };

    const today = new Date().toISOString().split('T')[0];
    let streakDays = stats.streakDays;
    
    if (stats.lastPlayDate !== today) {
      streakDays = calculateStreak(stats.lastPlayDate);
    }

    const totalCorrect = stats.totalGamesPlayed * 5 * (stats.correctRate / 100) + correctCount;
    const totalQuestions = stats.totalGamesPlayed * 5 + questions.length;
    const newCorrectRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const newState = {
      isPlaying: false,
      gameSessions: [...get().gameSessions, session],
      stats: {
        ...stats,
        totalGamesPlayed: stats.totalGamesPlayed + 1,
        correctRate: newCorrectRate,
        completedLevels: stats.completedLevels + 1,
        streakDays,
        lastPlayDate: today,
      },
    };

    set(newState);
    saveState({ ...get(), ...newState });
  },

  addExp: (amount) => {
    set((state) => {
      const animals = state.animals.map((animal) => {
        if (animal.id !== state.currentAnimalId) return animal;
        
        let newExp = animal.exp + amount;
        let newLevel = animal.level;
        let newMaxExp = animal.maxExp;
        const newRewards = [...animal.rewards];

        while (newExp >= newMaxExp) {
          newExp -= newMaxExp;
          newLevel += 1;
          newMaxExp = Math.floor(newMaxExp * 1.5);
          
          const rewardEmojis = ['⭐', '🌟', '💫', '🎁', '🎉', '🌈', '🦄', '🍭'];
          if (newRewards.length < rewardEmojis.length) {
            newRewards.push(rewardEmojis[newRewards.length]);
          }
        }

        return {
          ...animal,
          exp: newExp,
          level: newLevel,
          maxExp: newMaxExp,
          rewards: newRewards,
        };
      });

      const newState = { animals };
      setTimeout(() => saveState({ ...get(), ...newState }), 100);
      return newState;
    });
  },
}));

export const getCurrentAnimal = (): Animal | undefined => {
  const { animals, currentAnimalId } = useGameStore.getState();
  return animals.find((a) => a.id === currentAnimalId);
};
