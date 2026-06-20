import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, ScheduleConfig, ScheduleResult, ScheduleBlock } from '@/types';
import { generateSchedule } from '@/utils/scheduler';

interface PlannerState {
  tasks: Task[];
  config: ScheduleConfig;
  scheduleResult: ScheduleResult | null;

  addTask: (task: Task) => void;
  removeTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  clearTasks: () => void;
  importTasks: (tasks: Task[]) => void;

  updateConfig: (updates: Partial<ScheduleConfig>) => void;
  addFixedEvent: (event: ScheduleConfig['fixedEvents'][0]) => void;
  removeFixedEvent: (id: string) => void;

  generatePlan: () => void;
  toggleBlockCompleted: (blockId: string) => void;
  clearSchedule: () => void;
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      tasks: [],
      config: {
        wakeUpTime: '07:00',
        sleepTime: '23:00',
        lunchBreak: { start: '12:00', end: '13:30' },
        fixedEvents: [],
      },
      scheduleResult: null,

      addTask: (task) =>
        set((state) => ({ tasks: [...state.tasks, task] })),

      removeTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      clearTasks: () => set({ tasks: [] }),

      importTasks: (tasks) =>
        set((state) => ({ tasks: [...state.tasks, ...tasks] })),

      updateConfig: (updates) =>
        set((state) => ({ config: { ...state.config, ...updates } })),

      addFixedEvent: (event) =>
        set((state) => ({
          config: {
            ...state.config,
            fixedEvents: [...state.config.fixedEvents, event],
          },
        })),

      removeFixedEvent: (id) =>
        set((state) => ({
          config: {
            ...state.config,
            fixedEvents: state.config.fixedEvents.filter((e) => e.id !== id),
          },
        })),

      generatePlan: () => {
        const { tasks, config } = get();
        if (tasks.length === 0) return;
        const result = generateSchedule(tasks, config);
        set({ scheduleResult: result });
      },

      toggleBlockCompleted: (blockId) =>
        set((state) => {
          if (!state.scheduleResult) return state;
          return {
            scheduleResult: {
              ...state.scheduleResult,
              blocks: state.scheduleResult.blocks.map((b: ScheduleBlock) =>
                b.id === blockId ? { ...b, completed: !b.completed } : b
              ),
            },
          };
        }),

      clearSchedule: () => set({ scheduleResult: null }),
    }),
    {
      name: 'ai-planner-storage',
    }
  )
);
