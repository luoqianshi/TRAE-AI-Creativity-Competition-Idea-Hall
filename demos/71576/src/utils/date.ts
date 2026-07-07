import type { MedicineStatus } from "@/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * 计算距过期剩余天数（以本地零点为基准，避免时区漂移）
 * >0 表示尚未过期，0 表示今天到期，<0 表示已过期
 */
export function daysUntilExpiry(expiryDate: string): number {
  const today = startOfToday();
  const expiry = startOfDay(new Date(expiryDate));
  return Math.round((expiry.getTime() - today.getTime()) / MS_PER_DAY);
}

/** 根据剩余天数判定状态 */
export function getStatus(days: number): MedicineStatus {
  if (days < 0) return "expired";
  if (days <= 30) return "expiring";
  return "safe";
}

/** 直接由有效期得到状态 */
export function getStatusByExpiry(expiryDate: string): MedicineStatus {
  return getStatus(daysUntilExpiry(expiryDate));
}

/** 格式化为中文日期 YYYY年MM月DD日 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}年${m}月${day}日`;
}

/** 格式化时间戳为日期时间字符串 */
export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}年${m}月${day}日 ${hh}:${mm}`;
}

/** 友好的剩余天数文案 */
export function expiryText(days: number): string {
  if (days < 0) return `已过期 ${Math.abs(days)} 天`;
  if (days === 0) return "今日到期";
  return `剩余 ${days} 天`;
}

/** 当前时间的 datetime-local 输入值 */
export function toLocalInputValue(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** 将 datetime-local 输入值转为时间戳 */
export function fromLocalInputValue(value: string): number {
  return new Date(value).getTime();
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfToday(): Date {
  return startOfDay(new Date());
}
