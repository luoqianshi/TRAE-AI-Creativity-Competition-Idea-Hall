import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Transaction,
  Friend,
  GiftBook,
  Reminder,
  GiftBookGuest,
} from "@/lib/types";
import {
  seedTransactions,
  seedFriends,
  seedGiftBooks,
  seedReminders,
  seedSearchResults,
} from "@/data/seed";

interface AppState {
  transactions: Transaction[];
  friends: Friend[];
  giftBooks: GiftBook[];
  reminders: Reminder[];
  searchResults: Transaction[];
  cloudSync: boolean;
  // 应用锁密码（4位数字，空字符串表示未设置）
  appPassword: string;

  // 记一笔
  addTransaction: (t: Transaction) => void;
  // 新增往来人，返回新建的 Friend
  addFriend: (name: string) => Friend;
  // 新增礼簿，返回新建的 GiftBook
  addGiftBook: (title: string, date?: string) => GiftBook;
  // 新增礼簿（完整字段：名称/日期/事由），返回新建的 GiftBook
  addGiftBookFull: (info: { title: string; date: string; reason?: string }) => GiftBook;
  // 更新礼簿信息
  updateGiftBook: (id: string, info: { title: string; date: string; reason?: string }) => void;
  // 签到切换
  toggleGuestCheckIn: (bookId: string, guestId: string) => void;
  // 提醒标记完成
  markReminderDone: (id: string) => void;
  // 云同步开关
  setCloudSync: (v: boolean) => void;
  // 搜索
  search: (keyword: string) => Transaction[];
  // 设置应用锁密码（4位数字）
  setAppPassword: (pwd: string) => void;
  // 清除应用锁密码
  clearAppPassword: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      transactions: seedTransactions,
      friends: seedFriends,
      giftBooks: seedGiftBooks,
      reminders: seedReminders,
      searchResults: seedSearchResults,
      cloudSync: false,
      appPassword: "",

      addTransaction: (t) => {
        const today = new Date().toISOString().slice(0, 10);
        const newReminders: Reminder[] = [];
        // 随礼且日期在未来：生成提醒，提醒日期 = 随礼日期前一天
        if (t.type === "expense" && t.date > today) {
          const d = new Date(t.date);
          d.setDate(d.getDate() - 1);
          const remindDate = d.toISOString().slice(0, 10);
          newReminders.push({
            id: `r${Date.now()}`,
            friendId: t.personId,
            friendName: t.personName,
            type: "reciprocal",
            title: `明天有随礼 · ${t.event}`,
            date: remindDate,
            daysLeft: 0,
            amount: t.amount,
            status: "pending",
            desc: `随礼 ¥${t.amount} · ${t.personName}`,
          });
        }
        set((s) => ({
          transactions: [t, ...s.transactions],
          reminders: [...newReminders, ...s.reminders],
        }));
      },

      addFriend: (name) => {
        const colors = [
          "#E54D42",
          "#5B7B8A",
          "#D4835E",
          "#6B8E6B",
          "#8B6BAE",
          "#C29CB8",
          "#7BA7A0",
        ];
        const newFriend: Friend = {
          id: `f${Date.now()}`,
          name,
          avatarColor: colors[Math.floor(Math.random() * colors.length)],
          incomeCount: 0,
          expenseCount: 0,
          netAmount: 0,
        };
        set((s) => ({ friends: [...s.friends, newFriend] }));
        return newFriend;
      },

      addGiftBook: (title, date) => {
        const newBook: GiftBook = {
          id: `gb${Date.now()}`,
          title,
          date: date ?? new Date().toISOString().slice(0, 10),
          totalReceived: 0,
          guestCount: 0,
          guests: [],
        };
        set((s) => ({ giftBooks: [...s.giftBooks, newBook] }));
        return newBook;
      },

      addGiftBookFull: ({ title, date, reason }) => {
        const newBook: GiftBook = {
          id: `gb${Date.now()}`,
          title,
          date,
          reason,
          totalReceived: 0,
          guestCount: 0,
          guests: [],
        };
        set((s) => ({ giftBooks: [...s.giftBooks, newBook] }));
        return newBook;
      },

      updateGiftBook: (id, info) =>
        set((s) => ({
          giftBooks: s.giftBooks.map((b) =>
            b.id === id
              ? { ...b, title: info.title, date: info.date, reason: info.reason }
              : b
          ),
        })),

      toggleGuestCheckIn: (bookId, guestId) =>
        set((s) => ({
          giftBooks: s.giftBooks.map((b) =>
            b.id === bookId
              ? {
                  ...b,
                  guests: b.guests.map((g) =>
                    g.id === guestId ? { ...g, checkedIn: !g.checkedIn } : g
                  ),
                }
              : b
          ),
        })),

      markReminderDone: (id) =>
        set((s) => ({
          reminders: s.reminders.map((r) =>
            r.id === id ? { ...r, status: "done" as const } : r
          ),
        })),

      setCloudSync: (v) => set({ cloudSync: v }),

      setAppPassword: (pwd) => set({ appPassword: pwd }),

      clearAppPassword: () => set({ appPassword: "" }),

      search: (keyword) => {
        const kw = keyword.trim();
        if (!kw) return get().transactions;
        return get().transactions.filter(
          (t) => t.personName.includes(kw) || t.event.includes(kw)
        );
      },
    }),
    {
      name: "renqing-ledger-v2",
      // 仅持久化数据，不持久化函数
      partialize: (s) => ({
        transactions: s.transactions,
        friends: s.friends,
        giftBooks: s.giftBooks,
        reminders: s.reminders,
        cloudSync: s.cloudSync,
        appPassword: s.appPassword,
      }),
    }
  )
);

// 导出类型供组件使用
export type { Transaction, Friend, GiftBook, Reminder, GiftBookGuest };
