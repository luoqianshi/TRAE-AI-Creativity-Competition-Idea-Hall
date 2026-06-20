import type { Task, ScheduleConfig, ScheduleBlock, ScheduleResult } from '@/types';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getUrgencyScore(urgency: Task['urgency']): number {
  return urgency === 'high' ? 3 : urgency === 'medium' ? 2 : 1;
}

function getDifficultyScore(difficulty: Task['difficulty']): number {
  return difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1;
}

export function generateSchedule(
  tasks: Task[],
  config: ScheduleConfig
): ScheduleResult {
  const wakeUp = timeToMinutes(config.wakeUpTime);
  const sleep = timeToMinutes(config.sleepTime);
  const lunchStart = timeToMinutes(config.lunchBreak.start);
  const lunchEnd = timeToMinutes(config.lunchBreak.end);

  // Build blocked time slots (fixed events + lunch)
  const blockedSlots: Array<{ start: number; end: number; name: string }> = [
    { start: lunchStart, end: lunchEnd, name: '午休' },
    ...config.fixedEvents.map((e) => ({
      start: timeToMinutes(e.start),
      end: timeToMinutes(e.end),
      name: e.name,
    })),
  ];

  // Sort blocked slots by start time
  blockedSlots.sort((a, b) => a.start - b.start);

  // Calculate available time slots
  const availableSlots: Array<{ start: number; end: number }> = [];
  let cursor = wakeUp;

  for (const blocked of blockedSlots) {
    if (cursor < blocked.start) {
      availableSlots.push({ start: cursor, end: blocked.start });
    }
    cursor = Math.max(cursor, blocked.end);
  }

  if (cursor < sleep) {
    availableSlots.push({ start: cursor, end: sleep });
  }

  // Calculate total available minutes
  const totalAvailable = availableSlots.reduce(
    (sum, slot) => sum + (slot.end - slot.start),
    0
  );

  // Sort tasks by priority: urgency first, then difficulty (hard tasks when energy is high)
  const sortedTasks = [...tasks].sort((a, b) => {
    const urgencyDiff = getUrgencyScore(b.urgency) - getUrgencyScore(a.urgency);
    if (urgencyDiff !== 0) return urgencyDiff;
    const diffDiff = getDifficultyScore(b.difficulty) - getDifficultyScore(a.difficulty);
    if (diffDiff !== 0) return diffDiff;
    return b.estimatedMinutes - a.estimatedMinutes;
  });

  // Assign tasks to available slots
  const blocks: ScheduleBlock[] = [];
  const fixedBlocks: ScheduleBlock[] = [];

  // Add fixed event blocks
  for (const event of config.fixedEvents) {
    fixedBlocks.push({
      id: `fixed-${event.id}`,
      taskId: `fixed-${event.id}`,
      taskName: event.name,
      startTime: event.start,
      endTime: event.end,
      priority: 0,
      breakAfter: false,
      category: '固定事项',
      urgency: 'medium',
      difficulty: 'easy',
      notes: '',
      completed: false,
    });
  }

  // Add lunch block
  fixedBlocks.push({
    id: 'lunch',
    taskId: 'lunch',
    taskName: '午休',
    startTime: config.lunchBreak.start,
    endTime: config.lunchBreak.end,
    priority: 0,
    breakAfter: false,
    category: '休息',
    urgency: 'medium',
    difficulty: 'easy',
    notes: '',
    completed: false,
  });

  let taskIndex = 0;
  let remainingMinutes = sortedTasks.reduce((s, t) => s + t.estimatedMinutes, 0);

  for (const slot of availableSlots) {
    let slotCursor = slot.start;
    const slotDuration = slot.end - slot.start;

    while (taskIndex < sortedTasks.length && slotCursor < slot.end) {
      const task = sortedTasks[taskIndex];
      let taskDuration = task.estimatedMinutes;

      // If task is too long, split it
      const remainingInSlot = slot.end - slotCursor;
      const actualDuration = Math.min(taskDuration, remainingInSlot);

      if (actualDuration <= 0) break;

      const priority = getUrgencyScore(task.urgency);

      blocks.push({
        id: `block-${task.id}-${slotCursor}`,
        taskId: task.id,
        taskName: task.name + (taskDuration > remainingInSlot ? ` (第${Math.ceil((task.estimatedMinutes - taskDuration + actualDuration) / 45)}部分)` : ''),
        startTime: minutesToTime(slotCursor),
        endTime: minutesToTime(slotCursor + actualDuration),
        priority,
        breakAfter: actualDuration >= 45 && slotCursor + actualDuration + 10 <= slot.end,
        category: task.category,
        urgency: task.urgency,
        difficulty: task.difficulty,
        notes: task.notes,
        completed: false,
      });

      slotCursor += actualDuration;
      taskDuration -= actualDuration;

      // Add break after 45+ min task
      if (blocks[blocks.length - 1].breakAfter && slotCursor + 10 <= slot.end) {
        blocks.push({
          id: `break-${slotCursor}`,
          taskId: 'break',
          taskName: '休息',
          startTime: minutesToTime(slotCursor),
          endTime: minutesToTime(slotCursor + 10),
          priority: 0,
          breakAfter: false,
          category: '休息',
          urgency: 'low',
          difficulty: 'easy',
          notes: '',
          completed: false,
        });
        slotCursor += 10;
      }

      if (taskDuration <= 0) {
        taskIndex++;
      } else {
        // Update remaining duration for split task
        sortedTasks[taskIndex] = { ...task, estimatedMinutes: taskDuration };
      }
    }
  }

  // Merge all blocks and sort by time
  const allBlocks = [...blocks, ...fixedBlocks];
  allBlocks.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  // Add wake-up and sleep markers
  const finalBlocks: ScheduleBlock[] = [
    {
      id: 'wakeup',
      taskId: 'wakeup',
      taskName: '起床',
      startTime: config.wakeUpTime,
      endTime: config.wakeUpTime,
      priority: 0,
      breakAfter: false,
      category: '作息',
      urgency: 'low',
      difficulty: 'easy',
      notes: '',
      completed: false,
    },
    ...allBlocks,
    {
      id: 'sleep',
      taskId: 'sleep',
      taskName: '睡觉',
      startTime: config.sleepTime,
      endTime: config.sleepTime,
      priority: 0,
      breakAfter: false,
      category: '作息',
      urgency: 'low',
      difficulty: 'easy',
      notes: '',
      completed: false,
    },
  ];

  return {
    id: `schedule-${Date.now()}`,
    blocks: finalBlocks,
    createdAt: new Date().toLocaleString('zh-CN'),
    config,
  };
}
