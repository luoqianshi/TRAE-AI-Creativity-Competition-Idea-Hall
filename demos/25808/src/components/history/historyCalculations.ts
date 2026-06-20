import { getPrice } from "../../shared/utils/pricing";
import { 字典配置, DailyFieldConfig, 抄表记录 } from "../../shared/types";

/** 从日期字符串获取前一天字符串 */
export function getPreviousDateStr(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 获取某日在数据 Map 中的读数（兼容字段名） */
function getFieldReading(
  item: 抄表记录 | undefined,
  fieldId: string,
): number | undefined {
  if (!item) return undefined;
  const raw = item[fieldId];
  if (raw === undefined || raw === null || raw === "") return undefined;
  const num = Number(raw);
  return isNaN(num) ? undefined : num;
}

export function getElectricUsageAndKwh(
  dateStr: string,
  parentId: string,
  currentDataMap: Map<string, 抄表记录>,
  限额配置: 字典配置,
  回路配置列表?: DailyFieldConfig[],
) {
  const item = currentDataMap.get(dateStr);
  const e_today = getFieldReading(item, parentId);
  if (e_today === undefined) {
    return { usage: undefined, kwh: undefined, price: undefined, cost: undefined };
  }

  const yesterdayKey = getPreviousDateStr(dateStr);
  const e_yesterday = getFieldReading(currentDataMap.get(yesterdayKey), parentId);
  if (e_yesterday === undefined) {
    return { usage: undefined, kwh: undefined, price: undefined, cost: undefined };
  }

  const usage = Math.max(0, e_today - e_yesterday);
  const kwh = usage * (限额配置?.电表换算基数 ?? 3500);
  
  // 使用回路级价格
  const priceResult = getPrice(parentId, dateStr, 限额配置, 回路配置列表);
  const price = priceResult.单价 > 0 ? priceResult.单价 : (priceResult.建议单价 || 0);
  const cost = kwh * price;

  return { usage, kwh, price, cost };
}

export function getWaterUsageAndCost(
  dateStr: string,
  parentId: string,
  currentDataMap: Map<string, 抄表记录>,
  限额配置: 字典配置,
  回路配置列表?: DailyFieldConfig[],
) {
  const item = currentDataMap.get(dateStr);
  const w_today = getFieldReading(item, parentId);
  if (w_today === undefined) {
    return { usage: undefined, price: undefined, cost: undefined };
  }

  const yesterdayKey = getPreviousDateStr(dateStr);
  const w_yesterday = getFieldReading(currentDataMap.get(yesterdayKey), parentId);
  if (w_yesterday === undefined) {
    return { usage: undefined, price: undefined, cost: undefined };
  }

  const usage = Math.max(0, w_today - w_yesterday);
  
  // 使用回路级价格
  const priceResult = getPrice(parentId, dateStr, 限额配置, 回路配置列表);
  const price = priceResult.单价 > 0 ? priceResult.单价 : (priceResult.建议单价 || 0);
  const cost = usage * price;

  return { usage, price, cost };
}

/**
 * 燃气用量/费用计算
 * parentId 现在正确使用，不再硬编码"天然气表"
 */
export function getGasUsageAndCost(
  dateStr: string,
  parentId: string,
  currentDataMap: Map<string, 抄表记录>,
  限额配置: 字典配置,
  回路配置列表?: DailyFieldConfig[],
) {
  const item = currentDataMap.get(dateStr);
  const g_today = getFieldReading(item, parentId);
  if (g_today === undefined) {
    return { usage: undefined, price: undefined, cost: undefined };
  }

  const yesterdayKey = getPreviousDateStr(dateStr);
  const g_yesterday = getFieldReading(currentDataMap.get(yesterdayKey), parentId);
  if (g_yesterday === undefined) {
    return { usage: undefined, price: undefined, cost: undefined };
  }

  const usage = Math.max(0, g_today - g_yesterday);
  
  // 使用回路级价格
  const priceResult = getPrice(parentId, dateStr, 限额配置, 回路配置列表);
  const price = priceResult.单价 > 0 ? priceResult.单价 : (priceResult.建议单价 || 0);
  const cost = usage * price;

  return { usage, price, cost };
}

export function getDailyTotalElectric(
  dateStr: string,
  日常回路配置: DailyFieldConfig[],
  currentDataMap: Map<string, 抄表记录>,
  限额配置: 字典配置,
) {
  let totalKwh = 0;
  let totalCost = 0;
  let hasAnyData = false;

  日常回路配置
    .filter((f) => f.category === "电")
    .forEach((f) => {
      const res = getElectricUsageAndKwh(dateStr, f.id, currentDataMap, 限额配置, 日常回路配置);
      if (res.kwh !== undefined && res.cost !== undefined) {
        totalKwh += res.kwh;
        totalCost += res.cost;
        hasAnyData = true;
      }
    });

  if (!hasAnyData) return { totalKwh: undefined, totalCost: undefined };
  return { totalKwh, totalCost };
}

export function getDailyTotalWater(
  dateStr: string,
  日常回路配置: DailyFieldConfig[],
  currentDataMap: Map<string, 抄表记录>,
  限额配置: 字典配置,
) {
  let totalUsage = 0;
  let totalCost = 0;
  let hasAnyData = false;

  日常回路配置
    .filter((f) => f.category === "水")
    .forEach((f) => {
      const res = getWaterUsageAndCost(dateStr, f.id, currentDataMap, 限额配置, 日常回路配置);
      if (res.usage !== undefined && res.cost !== undefined) {
        totalUsage += res.usage;
        totalCost += res.cost;
        hasAnyData = true;
      }
    });

  if (!hasAnyData) return { totalUsage: undefined, totalCost: undefined };
  return { totalUsage, totalCost };
}

/**
 * 每日燃气总量（聚合所有 category=气 的气表字段）
 */
export function getDailyTotalGas(
  dateStr: string,
  日常回路配置: DailyFieldConfig[],
  currentDataMap: Map<string, 抄表记录>,
  限额配置: 字典配置,
) {
  let totalUsage = 0;
  let totalCost = 0;
  let hasAnyData = false;

  日常回路配置
    .filter((f) => f.category === "气")
    .forEach((f) => {
      const res = getGasUsageAndCost(dateStr, f.id, currentDataMap, 限额配置, 日常回路配置);
      if (res.usage !== undefined && res.cost !== undefined) {
        totalUsage += res.usage;
        totalCost += res.cost;
        hasAnyData = true;
      }
    });

  // 获取气价
  const 气回路 = 日常回路配置.find(f => f.category === "气");
  let gasPrice = 0;
  if (气回路) {
    const priceResult = getPrice(气回路.id, dateStr, 限额配置, 日常回路配置);
    gasPrice = priceResult.单价 > 0 ? priceResult.单价 : (priceResult.建议单价 || 0);
  }

  if (!hasAnyData) return { totalUsage: undefined, totalCost: undefined, price: undefined };
  return { totalUsage, totalCost, price: gasPrice };
}
