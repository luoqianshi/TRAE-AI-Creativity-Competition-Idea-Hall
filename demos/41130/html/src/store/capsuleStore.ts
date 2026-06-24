import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CapsuleState, MindCapsule } from '@/types/capsule';

export const useCapsuleStore = create<CapsuleState>()(
  persist(
    (set) => ({
      capsules: [],
      addCapsule: (capsule: MindCapsule) =>
        set((state) => ({ capsules: [capsule, ...state.capsules] })),
      removeCapsule: (id: string) =>
        set((state) => ({ capsules: state.capsules.filter((c) => c.id !== id) })),
      filterTag: null,
      setFilterTag: (tag: string | null) => set({ filterTag: tag }),
      searchQuery: '',
      setSearchQuery: (query: string) => set({ searchQuery: query }),
    }),
    {
      name: 'mindcapsule_capsules',
      partialize: (state) => ({ capsules: state.capsules }),
    }
  )
);
