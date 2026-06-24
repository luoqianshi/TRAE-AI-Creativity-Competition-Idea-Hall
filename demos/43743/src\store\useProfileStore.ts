// 当前家长 + 当前孩子 profile store
'use client';

import { create } from 'zustand';
import type { AgeGroup, ThemeKey } from '@/types/story';

export interface CurrentChild {
  id: string;
  nickname: string;
  ageGroup: AgeGroup;
  avatarEmoji: string;
  favoriteThemes: ThemeKey[];
}

interface ProfileState {
  profileId: string | null;
  email: string | null;
  currentChild: CurrentChild | null;
  hasOnboarded: boolean;
  setProfile: (p: { profileId: string; email: string; hasOnboarded?: boolean }) => void;
  setCurrentChild: (c: CurrentChild | null) => void;
  setHasOnboarded: (v: boolean) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profileId: null,
  email: null,
  currentChild: null,
  hasOnboarded: false,
  setProfile: ({ profileId, email, hasOnboarded }) =>
    set({ profileId, email, hasOnboarded: hasOnboarded ?? false }),
  setCurrentChild: (c) => set({ currentChild: c }),
  setHasOnboarded: (v) => set({ hasOnboarded: v }),
  reset: () =>
    set({ profileId: null, email: null, currentChild: null, hasOnboarded: false }),
}));
