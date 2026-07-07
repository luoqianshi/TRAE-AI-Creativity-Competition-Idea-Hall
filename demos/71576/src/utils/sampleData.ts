import type { Medicine, MedicationRecord } from "@/types";

/** 相对今天偏移 N 天，返回 ISO 日期 YYYY-MM-DD */
function dayOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 几天前的零点时间戳（可带小时偏移） */
function daysAgoMs(days: number, hourOffset = 0): number {
  return Date.now() - days * 24 * 60 * 60 * 1000 + hourOffset * 60 * 60 * 1000;
}

const sampleMedicines: Medicine[] = [
  // —— 已过期 ——
  {
    id: "sample-1",
    name: "布洛芬混悬液",
    expiryDate: dayOffset(-12),
    purpose: "儿童退烧，草莓味",
    quantity: 1,
    category: "退烧",
    createdAt: daysAgoMs(40),
    updatedAt: daysAgoMs(40),
  },
  {
    id: "sample-7",
    name: "对乙酰氨基酚片",
    expiryDate: dayOffset(-45),
    purpose: "成人退烧止痛，已过期需丢弃",
    quantity: 6,
    category: "退烧",
    createdAt: daysAgoMs(200),
    updatedAt: daysAgoMs(200),
  },
  // —— 临近过期（0–30 天）——
  {
    id: "sample-5",
    name: "双氯芬酸钠凝胶",
    expiryDate: dayOffset(5),
    purpose: "跌打损伤外用止痛",
    quantity: 1,
    category: "外用",
    createdAt: daysAgoMs(120),
    updatedAt: daysAgoMs(120),
  },
  {
    id: "sample-8",
    name: "复方甘草片",
    expiryDate: dayOffset(9),
    purpose: "止咳祛痰，含服",
    quantity: 2,
    category: "感冒",
    createdAt: daysAgoMs(150),
    updatedAt: daysAgoMs(150),
  },
  {
    id: "sample-9",
    name: "健胃消食片",
    expiryDate: dayOffset(21),
    purpose: "积食腹胀，饭后嚼服",
    quantity: 3,
    category: "肠胃",
    createdAt: daysAgoMs(100),
    updatedAt: daysAgoMs(100),
  },
  {
    id: "sample-2",
    name: "蒙脱石散",
    expiryDate: dayOffset(18),
    purpose: "腹泻止泻，成人儿童皆可",
    quantity: 3,
    category: "肠胃",
    createdAt: daysAgoMs(35),
    updatedAt: daysAgoMs(10),
  },
  // —— 正常（>30 天）——
  {
    id: "sample-3",
    name: "氨氯地平片",
    expiryDate: dayOffset(96),
    purpose: "高血压常服，每日一片",
    quantity: 2,
    category: "慢性病",
    createdAt: daysAgoMs(60),
    updatedAt: daysAgoMs(60),
  },
  {
    id: "sample-12",
    name: "氯雷他定片",
    expiryDate: dayOffset(75),
    purpose: "抗过敏，换季鼻炎常备",
    quantity: 2,
    category: "感冒",
    createdAt: daysAgoMs(80),
    updatedAt: daysAgoMs(80),
  },
  {
    id: "sample-6",
    name: "小儿碳酸钙D3颗粒",
    expiryDate: dayOffset(140),
    purpose: "补钙，每日一袋",
    quantity: 4,
    category: "营养",
    createdAt: daysAgoMs(70),
    updatedAt: daysAgoMs(70),
  },
  {
    id: "sample-4",
    name: "开塞露",
    expiryDate: dayOffset(220),
    purpose: "便秘应急",
    quantity: 2,
    category: "肠胃",
    createdAt: daysAgoMs(90),
    updatedAt: daysAgoMs(90),
  },
  {
    id: "sample-10",
    name: "维生素D3滴剂",
    expiryDate: dayOffset(180),
    purpose: "婴幼儿促钙吸收，每日一滴",
    quantity: 1,
    category: "营养",
    createdAt: daysAgoMs(110),
    updatedAt: daysAgoMs(110),
  },
  {
    id: "sample-11",
    name: "红霉素软膏",
    expiryDate: dayOffset(320),
    purpose: "皮肤小创口、蚊虫叮咬外用",
    quantity: 1,
    category: "外用",
    createdAt: daysAgoMs(130),
    updatedAt: daysAgoMs(130),
  },
];

const sampleRecords: MedicationRecord[] = [
  // 今天
  {
    id: "rec-1",
    medicineId: "sample-3",
    medicineName: "氨氯地平片",
    timestamp: daysAgoMs(0, -3),
    dosage: "1片",
    note: "晨起空腹",
  },
  {
    id: "rec-2",
    medicineId: "sample-6",
    medicineName: "小儿碳酸钙D3颗粒",
    timestamp: daysAgoMs(0, -8),
    dosage: "1袋",
    note: "早餐后",
  },
  // 昨天
  {
    id: "rec-3",
    medicineId: "sample-3",
    medicineName: "氨氯地平片",
    timestamp: daysAgoMs(1, -3),
    dosage: "1片",
    note: "晨起空腹",
  },
  {
    id: "rec-6",
    medicineId: "sample-9",
    medicineName: "健胃消食片",
    timestamp: daysAgoMs(1, 1),
    dosage: "2片",
    note: "晚饭后积食",
  },
  {
    id: "rec-7",
    medicineId: "sample-12",
    medicineName: "氯雷他定片",
    timestamp: daysAgoMs(1, -10),
    dosage: "1片",
    note: "鼻炎发作",
  },
  // 前天
  {
    id: "rec-4",
    medicineId: "sample-2",
    medicineName: "蒙脱石散",
    timestamp: daysAgoMs(2),
    dosage: "1袋",
    note: "腹泻，饭后",
  },
  {
    id: "rec-8",
    medicineId: "sample-3",
    medicineName: "氨氯地平片",
    timestamp: daysAgoMs(2, -3),
    dosage: "1片",
    note: "晨起空腹",
  },
  // 更早
  {
    id: "rec-5",
    medicineId: "sample-1",
    medicineName: "布洛芬混悬液",
    timestamp: daysAgoMs(4),
    dosage: "5ml",
    note: "发烧 38.5，儿童减量",
  },
  {
    id: "rec-9",
    medicineId: "sample-8",
    medicineName: "复方甘草片",
    timestamp: daysAgoMs(5, 2),
    dosage: "2片",
    note: "咳嗽含服",
  },
  {
    id: "rec-10",
    medicineId: "sample-6",
    medicineName: "小儿碳酸钙D3颗粒",
    timestamp: daysAgoMs(6, -8),
    dosage: "1袋",
    note: "早餐后",
  },
  {
    id: "rec-11",
    medicineId: "sample-5",
    medicineName: "双氯芬酸钠凝胶",
    timestamp: daysAgoMs(7, 1),
    dosage: "适量",
    note: "扭伤外涂",
  },
  {
    id: "rec-12",
    medicineId: "sample-3",
    medicineName: "氨氯地平片",
    timestamp: daysAgoMs(8, -3),
    dosage: "1片",
    note: "晨起空腹",
  },
];

export function getSampleMedicines(): Medicine[] {
  return sampleMedicines.map((m) => ({ ...m }));
}

export function getSampleRecords(): MedicationRecord[] {
  return sampleRecords.map((r) => ({ ...r }));
}
