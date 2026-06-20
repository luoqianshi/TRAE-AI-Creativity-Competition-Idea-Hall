export interface Task {
  id: string;
  name: string;
  estimatedMinutes: number;
  urgency: 'high' | 'medium' | 'low';
  difficulty: 'hard' | 'medium' | 'easy';
  category: string;
  notes: string;
}

export interface FixedEvent {
  id: string;
  name: string;
  start: string;
  end: string;
}

export interface ScheduleConfig {
  wakeUpTime: string;
  sleepTime: string;
  lunchBreak: { start: string; end: string };
  fixedEvents: FixedEvent[];
}

export interface ScheduleBlock {
  id: string;
  taskId: string;
  taskName: string;
  startTime: string;
  endTime: string;
  priority: number;
  breakAfter: boolean;
  category: string;
  urgency: 'high' | 'medium' | 'low';
  difficulty: 'hard' | 'medium' | 'easy';
  notes: string;
  completed: boolean;
}

export interface ScheduleResult {
  id: string;
  blocks: ScheduleBlock[];
  createdAt: string;
  config: ScheduleConfig;
}
