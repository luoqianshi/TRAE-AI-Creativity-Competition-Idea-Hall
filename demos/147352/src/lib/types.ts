// 人情记账本 · 类型定义

// 交易记录
export interface Transaction {
  id: string;
  type: "income" | "expense"; // 收礼 / 随礼
  amount: number;
  category: string; // 生日/婚礼/满月/升学/乔迁/借款/请客
  personName: string; // 往来人姓名
  personId: string;
  event: string; // 事件描述，如 "结婚"
  giftBookId?: string;
  date: string; // YYYY-MM-DD
  note?: string;
  reminder?: { type: string; advanceDays: number };
  emoji: string;
}

// 亲友
export interface Friend {
  id: string;
  name: string;
  avatarColor: string;
  incomeCount: number;
  expenseCount: number;
  netAmount: number; // 正=应收 负=应付
}

// 礼簿宾客
export interface GiftBookGuest {
  id: string;
  name: string;
  table?: string;
  amount: number;
  checkedIn: boolean;
}

// 礼簿
export interface GiftBook {
  id: string;
  title: string;
  date: string;
  reason?: string; // 事由，如「婚礼」「满月宴」
  totalReceived: number;
  guestCount: number;
  guests: GiftBookGuest[];
}

// 提醒
export interface Reminder {
  id: string;
  friendId: string;
  friendName: string;
  type: "gift" | "repay" | "reciprocal"; // 待回礼/还款/往来
  title: string;
  date: string;
  daysLeft: number;
  amount?: number;
  status: "pending" | "done";
  desc?: string;
}

// 分类
export interface Category {
  key: string;
  label: string;
  emoji: string;
  /** 常见事由，用于在分类下方小字展示 */
  reasons?: string;
}
