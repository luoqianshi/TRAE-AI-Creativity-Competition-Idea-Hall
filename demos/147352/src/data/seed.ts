import type {
  Transaction,
  Friend,
  GiftBook,
  Reminder,
  Category,
} from "@/lib/types";

// 八大类往来事由（每类含图标、类别名、常见事由小字）
export const categories: Category[] = [
  { key: "wedding", label: "婚嫁", emoji: "💍", reasons: "订婚、成婚" },
  { key: "baby", label: "生子", emoji: "👶", reasons: "满月、百天、周岁" },
  { key: "growth", label: "成长", emoji: "🎓", reasons: "升学、成人、入伍" },
  { key: "birthday", label: "生日", emoji: "🎂", reasons: "庆生、祝寿" },
  { key: "house", label: "置业", emoji: "🏠", reasons: "乔迁、开业" },
  { key: "career", label: "事业", emoji: "💼", reasons: "升职、退休、拜师" },
  { key: "condole", label: "慰问", emoji: "🤝", reasons: "探病、受灾、丧葬" },
  { key: "festival", label: "节庆", emoji: "🏮", reasons: "拜年、中秋、访友" },
];

// 交易记录
export const seedTransactions: Transaction[] = [];

// 亲友列表
export const seedFriends: Friend[] = [];

// 礼簿
export const seedGiftBooks: GiftBook[] = [];

// 提醒
export const seedReminders: Reminder[] = [];

// 搜索结果
export const seedSearchResults: Transaction[] = [];
