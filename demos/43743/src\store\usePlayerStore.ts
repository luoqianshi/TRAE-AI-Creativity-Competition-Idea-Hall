// 全局播放状态
'use client';

import { create } from 'zustand';

interface PlayerState {
  currentStoryId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  hasReachedLimit: boolean; // 今日听读是否超额
  setStory: (id: string | null) => void;
  setPlaying: (v: boolean) => void;
  setTime: (current: number, duration: number) => void;
  setVolume: (v: number) => void;
  setReachedLimit: (v: boolean) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentStoryId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  hasReachedLimit: false,
  setStory: (id) => set({ currentStoryId: id, currentTime: 0, isPlaying: false }),
  setPlaying: (v) => set({ isPlaying: v }),
  setTime: (current, duration) => set({ currentTime: current, duration }),
  setVolume: (v) => set({ volume: v }),
  setReachedLimit: (v) => set({ hasReachedLimit: v }),
  reset: () =>
    set({ currentStoryId: null, isPlaying: false, currentTime: 0, duration: 0 }),
}));
