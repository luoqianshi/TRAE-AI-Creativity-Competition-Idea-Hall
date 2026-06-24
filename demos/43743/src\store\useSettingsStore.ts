// 家长设置 store
'use client';

import { create } from 'zustand';

interface SettingsState {
  dailyLimitMinutes: number;
  autoCloseMinutes: number;
  listenedTodaySeconds: number;
  isParentUnlocked: boolean;
  setSettings: (s: Partial<Pick<SettingsState, 'dailyLimitMinutes' | 'autoCloseMinutes' | 'listenedTodaySeconds'>>) => void;
  setParentUnlocked: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  dailyLimitMinutes: 30,
  autoCloseMinutes: 0,
  listenedTodaySeconds: 0,
  isParentUnlocked: false,
  setSettings: (s) => set(s),
  setParentUnlocked: (v) => set({ isParentUnlocked: v }),
}));
