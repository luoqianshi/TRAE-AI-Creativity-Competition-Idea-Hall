export interface SavedArtwork {
  id: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  date: string;
  category: 'all' | 'favorite' | 'recent';
}

export type MoodType = 'calm' | 'anxious' | 'tired' | 'irritated' | 'low';

export interface MoodLog {
  id: string;
  type: MoodType;
  label: string;
  time: string;
  description: string;
  icon: string;
  date?: string;
}

export interface BreathingPattern {
  id: string;
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  description: string;
}

export interface SoundScene {
  id: string;
  title: string;
  englishTitle: string;
  imageUrl: string;
  imageAlt: string;
  duration?: string;
  frequency?: string;
  mix?: string;
}

export interface AppSettings {
  isDarkMode: boolean;
  breathingPatternId: string;
  soundIntensity: number;
  musicVolume: number;
  notificationFrequency: 'low' | 'medium' | 'high';
  activeAmbientSound: 'none' | 'waves' | 'rainy' | 'wind';
}

export interface DailyFortune {
  id: number;
  level: '上上签' | '上签' | '中签' | '下签';
  title: string;
  poem: string;
  meaning: string;
  advice: string;
  tags: string[];
}
