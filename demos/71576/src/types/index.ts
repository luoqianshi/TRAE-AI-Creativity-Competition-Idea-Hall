// 药品数据模型
export interface Medicine {
  id: string;
  name: string;
  expiryDate: string; // ISO 日期 YYYY-MM-DD
  purpose: string; // 用途/备注
  quantity: number;
  category?: string; // 分类（退烧/肠胃/慢性病/外用...）
  createdAt: number;
  updatedAt: number;
}

// 用药记录数据模型
export interface MedicationRecord {
  id: string;
  medicineId: string;
  medicineName: string; // 冗余存名，药品删除后记录仍可读
  timestamp: number;
  dosage: string; // 剂量，如 "1片" / "5ml"
  note?: string; // 备注，如 "饭后" / "儿童减半"
}

// 药品状态
export type MedicineStatus = "expired" | "expiring" | "safe";

// 新增/编辑药品表单数据（不含 id 与时间戳）
export type MedicineInput = Omit<Medicine, "id" | "createdAt" | "updatedAt">;

// 新增用药记录表单数据（不含 id 与冗余名）
export type RecordInput = {
  medicineId: string;
  dosage: string;
  timestamp: number;
  note?: string;
};
