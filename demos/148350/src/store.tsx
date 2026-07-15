import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Habit, CheckInRecord, AIMessage, User, UserProfile, UserStats, Achievement } from "./types";
import { APP_VERSION } from "./types";

// ── Achievements ──
const ACHIEVEMENTS: Achievement[] = [
  { id: "first_checkin", name: "初次打卡", description: "完成第一次习惯打卡", icon: "sparkles", condition: (s) => s.totalCheckIns >= 1 },
  { id: "streak_3", name: "三天小成", description: "连续打卡3天", icon: "flame", condition: (s) => s.currentStreak >= 3 },
  { id: "streak_7", name: "一周坚持", description: "连续打卡7天", icon: "star", condition: (s) => s.currentStreak >= 7 },
  { id: "streak_14", name: "双周达人", description: "连续打卡14天", icon: "zap", condition: (s) => s.currentStreak >= 14 },
  { id: "streak_21", name: "习惯初成", description: "连续打卡21天", icon: "trophy", condition: (s) => s.currentStreak >= 21 },
  { id: "total_50", name: "半百里程碑", description: "累计打卡50次", icon: "target", condition: (s) => s.totalCheckIns >= 50 },
  { id: "total_100", name: "百次达人", description: "累计打卡100次", icon: "award", condition: (s) => s.totalCheckIns >= 100 },
  { id: "perfect_7", name: "完美一周", description: "一周内完成所有习惯", icon: "gem", condition: (s) => s.perfectDays >= 7 },
];

const CATEGORIES: Record<Habit["category"], { label: string; color: string; icon: string }> = {
  "学习": { label: "学习", color: "#5B8FCF", icon: "book" },
  "运动": { label: "运动", color: "#FF8C42", icon: "dumbbell" },
  "生活": { label: "生活", color: "#6DC77A", icon: "sun" },
  "心理": { label: "心理", color: "#9B8FD4", icon: "brain" },
};

// ── Helpers ──
const todayStr = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10);

function calcStreaks(records: CheckInRecord[]): { current: number; longest: number } {
  let current = 0;
  let longest = 0;
  const dates = [...new Set(records.filter(r => r.completed).map(r => r.date))].sort().reverse();
  if (dates.length === 0) return { current: 0, longest: 0 };

  const today = new Date();
  let streak = 0;
  let maxStreak = 0;
  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i]);
    if (i === 0) {
      streak = 1;
    } else {
      const prev = new Date(dates[i - 1]);
      const diff = (prev.getTime() - d.getTime()) / 86400000;
      if (diff <= 1) {
        streak++;
      } else {
        streak = 1;
      }
    }
    if (streak > maxStreak) maxStreak = streak;
  }

  // current streak
  current = 0;
  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i]);
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    if (d.toISOString().slice(0, 10) === expected.toISOString().slice(0, 10)) {
      current++;
    } else {
      break;
    }
  }

  // also check if today is done
  const todayDone = dates[0] === todayStr();
  if (!todayDone && current > 0) {
    // yesterday was done but not today - streak can continue if today isn't over
    // we'll consider yesterday as the last day
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dates[0] === yesterday.toISOString().slice(0, 10)) {
      // streak is still alive
    } else if (current === 0) {
      // no streak
    }
  }

  return { current, longest: maxStreak };
}

function calcPerfectDays(records: CheckInRecord[], habitCount: number): number {
  if (habitCount === 0) return 0;
  const byDate = new Map<string, Set<string>>();
  for (const r of records) {
    if (r.completed) {
      if (!byDate.has(r.date)) byDate.set(r.date, new Set());
      byDate.get(r.date)!.add(r.habitId);
    }
  }
  let perfect = 0;
  for (const [, set] of byDate) {
    if (set.size >= habitCount) perfect++;
  }
  return perfect;
}

const DEFAULT_PROFILE: UserProfile = {
  nickname: "",
  gender: "",
  birthday: "",
  height: 170,
  weight: 60,
  avatar: "orange",
  bio: "",
};
const DEFAULT_HABITS: Habit[] = [
  { id: uid(), name: "阅读30分钟", category: "学习", frequency: "每天", reminderTime: "21:00", createdAt: todayStr(), color: "#5B8FCF", icon: "book" },
  { id: uid(), name: "运动20分钟", category: "运动", frequency: "每周5次", reminderTime: "08:00", createdAt: todayStr(), color: "#FF8C42", icon: "dumbbell" },
  { id: uid(), name: "冥想10分钟", category: "心理", frequency: "每天", reminderTime: "07:30", createdAt: todayStr(), color: "#9B8FD4", icon: "brain" },
];

const DEFAULT_GREETINGS = [
  "早上好！新的一天，新的开始。今天准备好打卡了吗？☀️",
  "嗨，今天看起来是个适合阅读的好天气呢！",
  "你昨天的表现很棒，今天继续保持哦！",
  "又是元气满满的一天！有什么想挑战的小目标吗？",
];

function generateAIReply(trigger: string, context: string): string {
  const replies: Record<string, string[]> = {
    greeting: [
      `早上好！今天看起来是充满可能的一天。${context ? `昨天你的${context}打卡都完成了，太厉害了！` : ""}今天也要加油哦，我会一直陪着你~`,
      `嗨！新的一天开始啦。${context}记得照顾好自己，一步一个脚印，我们一起走~`,
      `早安呀！${context ? `看到你${context}的坚持，真的很佩服你。` : ""}今天有什么小目标想要完成的？`,
      `嘿，准备好迎接新的一天了吗？无论昨天怎样，今天都是全新的开始。💪`,
    ],
    checkin: [
      `太棒了！${context}打卡成功！你已经走在变好的路上了，继续加油！✨`,
      `做得很好！${context}每一次坚持都是对自己的承诺。我为你感到骄傲！🌟`,
      `${context}打卡完成！看到你一步步接近目标，这种感觉真好。继续保持！🎯`,
      `厉害！${context}又完成了一天。记住，不是每一天都能完美，但坚持本身就了不起。`,
    ],
    streak: [
      `天哪！你已经连续坚持${context}天了！这个成绩真的很了不起，要不要给自己一个小奖励？🎉`,
      `${context}天的连续打卡，这不是运气，是你的努力换来的。继续保持这个节奏！`,
    ],
    intervention: [
      `嘿，我注意到你最近几天没有打卡了。没关系，每个人都会有想休息的时候。是太忙了，还是有点疲惫了？说出来，我们一起想办法~`,
      `好久不见！你是不是最近遇到了一些挑战？不管什么事，我都在这里陪着你。要不我们先降低一点难度，慢慢来？`,
      `停几天很正常，不用给自己太大压力。重要的是你愿意回来。今天要不要从最简单的开始？`,
    ],
    default: [
      `我理解你的感受。习惯养成是一场马拉松，不是短跑。慢慢来，比较快~`,
      `谢谢你愿意跟我分享。无论遇到什么困难，记得你已经比昨天的自己更进一步了。`,
    ],
  };

  const pool = replies[trigger] || replies.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Context ──
interface AppState {
  user: User | null;
  profile: UserProfile;
  habits: Habit[];
  records: CheckInRecord[];
  messages: AIMessage[];
  achievements: Achievement[];
  unlockedIds: Set<string>;
  todayChecked: Set<string>;
}

interface AppContextType extends AppState {
  login: (name: string) => void;
  logout: () => void;
  updateProfile: (p: Partial<UserProfile>) => void;
  updateNickname: (name: string) => void;
  addHabit: (h: Omit<Habit, "id" | "createdAt">) => void;
  updateHabit: (h: Habit) => void;
  deleteHabit: (id: string) => void;
  checkIn: (habitId: string) => { newAchievements: Achievement[]; aiMsg: string };
  getStats: () => UserStats;
  sendMessage: (text: string) => void;
  getAIWelcome: () => string;
  getCategoryInfo: (cat: Habit["category"]) => typeof CATEGORIES["学习"];
}

const AppContext = createContext<AppContextType | null>(null);

function loadState(): AppState {
  try {
    const raw = localStorage.getItem("habit-tracker-state");
    if (raw) {
      const s = JSON.parse(raw);
      return { ...s, profile: s.profile || DEFAULT_PROFILE, unlockedIds: new Set(s.unlockedIds || []), todayChecked: new Set(s.todayChecked || []) };
    }
  } catch { /* ignore */ }
  return { user: null, profile: DEFAULT_PROFILE, habits: [], records: [], messages: [], achievements: ACHIEVEMENTS, unlockedIds: new Set(), todayChecked: new Set() };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  const persist = useCallback((next: AppState) => {
    setState(next);
    localStorage.setItem("habit-tracker-state", JSON.stringify({
      ...next,
      unlockedIds: [...next.unlockedIds],
      todayChecked: [...next.todayChecked],
    }));
  }, []);

  const login = useCallback((name: string) => {
    const next: AppState = {
      user: { name, joinedAt: todayStr(), level: 1, xp: 0 },
      profile: { ...DEFAULT_PROFILE, nickname: name },
      habits: DEFAULT_HABITS,
      records: [],
      messages: [],
      achievements: ACHIEVEMENTS,
      unlockedIds: new Set(),
      todayChecked: new Set(),
    };
    // Generate initial greeting
    next.messages = [{
      id: uid(), role: "ai", content: generateAIReply("greeting", ""), timestamp: Date.now(), type: "greeting"
    }];
    persist(next);
  }, [persist]);

  const logout = useCallback(() => {
    const next: AppState = { user: null, profile: DEFAULT_PROFILE, habits: [], records: [], messages: [], achievements: ACHIEVEMENTS, unlockedIds: new Set(), todayChecked: new Set() };
    persist(next);
  }, [persist]);

  const updateProfile = useCallback((p: Partial<UserProfile>) => {
    persist({ ...state, profile: { ...state.profile, ...p } });
  }, [state, persist]);

  const updateNickname = useCallback((name: string) => {
    persist({ ...state, user: state.user ? { ...state.user, name } : null, profile: { ...state.profile, nickname: name } });
  }, [state, persist]);

  const addHabit = useCallback((h: Omit<Habit, "id" | "createdAt">) => {
    const habit: Habit = { ...h, id: uid(), createdAt: todayStr() };
    persist({ ...state, habits: [...state.habits, habit] });
  }, [state, persist]);

  const updateHabit = useCallback((h: Habit) => {
    persist({ ...state, habits: state.habits.map(x => x.id === h.id ? h : x) });
  }, [state, persist]);

  const deleteHabit = useCallback((id: string) => {
    persist({ ...state, habits: state.habits.filter(x => x.id !== id) });
  }, [state, persist]);

  const checkIn = useCallback((habitId: string): { newAchievements: Achievement[]; aiMsg: string } => {
    const today = todayStr();
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return { newAchievements: [], aiMsg: "" };

    const record: CheckInRecord = { habitId, date: today, completed: true };
    const newRecords = [...state.records.filter(r => !(r.habitId === habitId && r.date === today)), record];
    const newChecked = new Set(state.todayChecked);
    newChecked.add(habitId);

    // calc stats with new records
    const stats = { ...calcStreaks(newRecords), perfectDays: 0, totalCheckIns: newRecords.length, completedHabits: newChecked.size };
    stats.perfectDays = calcPerfectDays(newRecords, state.habits.length);

    const newAch: Achievement[] = [];
    const newUnlocked = new Set(state.unlockedIds);
    for (const a of ACHIEVEMENTS) {
      if (!newUnlocked.has(a.id) && a.condition({ ...stats, currentStreak: stats.current, longestStreak: stats.longest })) {
        newUnlocked.add(a.id);
        newAch.push(a);
      }
    }

    const congrats = newAch.length > 0 ? ` 而且你还解锁了「${newAch.map(a => a.name).join("」「")}」徽章！🏅` : "";
    const aiMsg = generateAIReply("checkin", habit.name) + congrats;

    const aiMessage: AIMessage = { id: uid(), role: "ai", content: aiMsg, timestamp: Date.now(), type: "encouragement" };
    const newMessages = [...state.messages, aiMessage];

    // if streak milestone
    if (stats.current > 1 && stats.current % 7 === 0) {
      const streakMsg: AIMessage = { id: uid(), role: "ai", content: generateAIReply("streak", String(stats.current)), timestamp: Date.now(), type: "encouragement" };
      newMessages.push(streakMsg);
    }

    persist({
      ...state,
      records: newRecords,
      todayChecked: newChecked,
      messages: newMessages,
      unlockedIds: newUnlocked,
    });

    return { newAchievements: newAch, aiMsg };
  }, [state, persist]);

  const getStats = useCallback((): UserStats => {
    const streaks = calcStreaks(state.records);
    return {
      totalCheckIns: state.records.length,
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      perfectDays: calcPerfectDays(state.records, state.habits.length),
      completedHabits: state.todayChecked.size,
    };
  }, [state]);

  const sendMessage = useCallback((text: string) => {
    const userMsg: AIMessage = { id: uid(), role: "user", content: text, timestamp: Date.now() };
    // Simulate AI thinking delay
    setTimeout(() => {
      const aiReply = generateAIReply("default", "");
      const aiMsg: AIMessage = { id: uid(), role: "ai", content: aiReply, timestamp: Date.now(), type: "consulting" };
      persist({ ...state, messages: [...state.messages, userMsg, aiMsg] });
    }, 1000);
    persist({ ...state, messages: [...state.messages, userMsg] });
  }, [state, persist]);

  const getAIWelcome = useCallback(() => {
    const completedToday = state.todayChecked.size > 0
      ? state.habits.filter(h => state.todayChecked.has(h.id)).map(h => h.name).join("、")
      : "";
    return generateAIReply("greeting", completedToday);
  }, [state]);

  const getCategoryInfo = useCallback((cat: Habit["category"]) => CATEGORIES[cat], []);

  return (
    <AppContext.Provider value={{
      ...state, login, logout, updateProfile, updateNickname, addHabit, updateHabit, deleteHabit,
      checkIn, getStats, sendMessage, getAIWelcome, getCategoryInfo,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
