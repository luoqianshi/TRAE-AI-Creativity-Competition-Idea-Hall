import { 字典配置, DailyFieldConfig, 单价变动事件, 价格查询结果 } from "../types";

interface CircuitLikeConfig {
  id: string;
  category: string;
  name?: string;
}

/**
 * 根据回路类型获取对应单价字段名
 */
function getPriceFieldByCategory(category: string): keyof 单价变动事件 {
  switch (category) {
    case "电":
      return "电费单价";
    case "水":
      return "水费单价";
    case "气":
      return "气费单价";
    default:
      return "电费单价";
  }
}

/**
 * 获取回路的能源分类
 */
function getCircuitCategory(回路id: string, 回路配置列表: CircuitLikeConfig[]): string {
  const config = 回路配置列表.find(f => f.id === 回路id);
  return config?.category || "电";
}

/**
 * 创建未配置结果
 */
function createUnconfiguredResult(category: string, 回路名称?: string): 价格查询结果 {
  return {
    单价: 0,
    状态: 'unconfigured',
    回路名称: 回路名称 || category,
    告警信息: `⚠️ 回路"${回路名称 || category}"未配置价格，请在系统字典-回路价格管理中设置`,
  };
}

/**
 * 创建未找到结果
 */
function createNotFoundResult(回路名称: string, 日期: string, 建议单价: number): 价格查询结果 {
  return {
    单价: 0,
    状态: 'not_found',
    回路名称: 回路名称,
    告警信息: `⚠️ 回路"${回路名称}"在${日期}无生效价格，请检查价格时光轴配置`,
    建议单价: 建议单价,
  };
}

/**
 * 根据回路价格历史记录反推回路分类（用于缺失 回路配置列表 时的兜底）
 */
function inferCategoryFromHistory(回路配置: { 历史记录: 单价变动事件[] }): string {
  for (const r of 回路配置.历史记录) {
    if (r.电费单价 > 0) return "电";
    if (r.水费单价 > 0) return "水";
    if (r.气费单价 > 0) return "气";
  }
  return "电";
}

/**
 * 统一价格查询入口
 * 所有板块统一调用此函数获取回路单价
 */
export function getPrice(
  回路id: string,
  日期: string,
  限额配置: 字典配置,
  回路配置列表?: CircuitLikeConfig[]
): 价格查询结果 {
  
  // 1. 获取回路配置
  const 回路列表 = 限额配置.回路价格历史列表 || [];
  const 回路配置 = 回路列表.find(h => h.回路id === 回路id);
  
  // 2. 获取回路类型：优先使用 回路配置列表；否则从历史记录反推
  let category: string;
  if (回路配置列表 && 回路配置列表.length > 0) {
    category = getCircuitCategory(回路id, 回路配置列表);
  } else if (回路配置 && 回路配置.历史记录.length > 0) {
    category = inferCategoryFromHistory(回路配置);
  } else {
    category = "电";
  }
  const 单价字段 = getPriceFieldByCategory(category);
  
  // 3. 情况1：回路未配置
  if (!回路配置) {
    const 全局默认 = category === "电" 
      ? (限额配置.电费单价 || 0)
      : category === "水"
        ? (限额配置.水费单价 || 0)
        : (限额配置.气费单价 || 0);
    return {
      单价: 0,
      状态: 'unconfigured',
      回路名称: 回路id,
      告警信息: `⚠️ 回路"${回路id}"未配置价格，请在系统字典-回路价格管理中设置`,
      建议单价: 全局默认,
    };
  }
  
  // 4. 查找生效中的价格记录
  const 有效记录 = 回路配置.历史记录.find(
    r => r.生效日期 <= 日期 && (!r.结束日期 || r.结束日期 >= 日期)
  );
  
  if (有效记录) {
    return {
      单价: 有效记录[单价字段] as number,
      状态: 'found',
      回路名称: 回路配置.回路名称,
    };
  }
  
  // 5. 情况3：未找到对应日期的价格
  return createNotFoundResult(回路配置.回路名称, 日期, 回路配置.默认单价);
}

/**
 * 获取某回路当前生效的价格
 */
export function getCurrentPrice(
  回路id: string,
  限额配置: 字典配置,
  回路配置列表?: CircuitLikeConfig[]
): 价格查询结果 {
  const today = new Date().toISOString().split('T')[0];
  return getPrice(回路id, today, 限额配置, 回路配置列表);
}

/**
 * 获取某日所有回路的汇总价格（用于大盘展示）
 */
export function getDailyPrices(
  日期: string,
  限额配置: 字典配置,
  回路配置列表: CircuitLikeConfig[]
): { 电: 价格查询结果; 水: 价格查询结果; 气: 价格查询结果 } {
  
  const 电回路 = 回路配置列表.find(f => f.category === '电');
  const 水回路 = 回路配置列表.find(f => f.category === '水');
  const 气回路 = 回路配置列表.find(f => f.category === '气');
  
  return {
    电: 电回路 ? getPrice(电回路.id, 日期, 限额配置, 回路配置列表) : createUnconfiguredResult('电'),
    水: 水回路 ? getPrice(水回路.id, 日期, 限额配置, 回路配置列表) : createUnconfiguredResult('水'),
    气: 气回路 ? getPrice(气回路.id, 日期, 限额配置, 回路配置列表) : createUnconfiguredResult('气'),
  };
}

/**
 * 获取回路的当前单价数值（便捷函数，用于兼容旧代码）
 */
export function getCircuitPrice(
  回路id: string,
  日期: string,
  限额配置: 字典配置,
  回路配置列表?: CircuitLikeConfig[]
): number {
  const result = getPrice(回路id, 日期, 限额配置, 回路配置列表);
  return result.单价;
}

// ─────────────────────────────────────────────────────────────────
// 以下是兼容函数，新代码应使用上面的 getPrice
// ─────────────────────────────────────────────────────────────────

export interface DailyPricing {
  电费单价: number;
  水费单价: number;
  气费单价: number;
}

/**
 * 根据日期返回全局默认单价（兼容旧代码）
 * @deprecated 使用 getPrice 代替
 */
export function getBillingPriceAtDate(
  _dateStr: string,
  config: 字典配置,
): DailyPricing {
  return {
    电费单价: config.电费单价 || 0,
    水费单价: config.水费单价 || 0,
    气费单价: config.气费单价 || 0,
  };
}

export interface EnrichedRecord {
  日期: string;
  电量: number;
  水量: number;
  气量: number;
  电费: number;
  水费: number;
  气费: number;
  总费: number;
  raw: 抄表记录;
}

interface 抄表记录 {
  日期: string;
  [key: string]: any;
}

/**
 * 默认回退字段ID映射（用于兼容旧数据）
 */
const DEFAULT_FALLBACK_FIELDS: Record<string, string[]> = {
  "电": ["李体线电表", "午沙线电表"],
  "水": ["酒店水表", "喷泉水表"],
  "气": ["天然气表"],
};

/**
 * 从配置中获取字段的允许误差值
 */
function getFieldDelta(fieldId: string, config: 字典配置): number {
  const 允许误差配置 = config.允许误差配置 || [];
  const fieldConfig = 允许误差配置.find(f => f.fieldId === fieldId);
  if (fieldConfig) {
    return fieldConfig.delta;
  }
  // 兼容旧逻辑的默认值
  if (fieldId === "李体线电表" || fieldId === "午沙线电表") return 5;
  if (fieldId === "酒店水表") return 5;
  if (fieldId === "喷泉水表") return 2;
  return 10; // 燃气默认
}

/**
 * 根据分类获取默认回退字段ID
 */
function getDefaultFallbackFields(category: string): string[] {
  return DEFAULT_FALLBACK_FIELDS[category] || [];
}

/**
 * Calculates raw or scaled consumption for a single field between two consecutive records
 */
export function getFieldConsumption(
  record: 抄表记录,
  prevRecord: 抄表记录 | null,
  fieldId: string,
  category: string,
  ratio: number,
  config?: 字典配置,
): number {
  const currentVal = record[fieldId] !== undefined && record[fieldId] !== null ? Number(record[fieldId]) : 0;
  let prevVal = prevRecord && prevRecord[fieldId] !== undefined && prevRecord[fieldId] !== null ? Number(prevRecord[fieldId]) : 0;

  if (!prevRecord) {
    const delta = config ? getFieldDelta(fieldId, config) : 10;
    prevVal = Math.max(0, currentVal - delta);
  }

  let rawDiff = 0;
  const isSwapped = record[`swap_${fieldId}`] === true || record[`swap_${fieldId}`] === "true";

  if (isSwapped) {
    const oldFinal = record[`old_final_${fieldId}`] !== undefined && record[`old_final_${fieldId}`] !== null && record[`old_final_${fieldId}`] !== ""
      ? Number(record[`old_final_${fieldId}`]) 
      : prevVal;
    const newStart = record[`new_start_${fieldId}`] !== undefined && record[`new_start_${fieldId}`] !== null && record[`new_start_${fieldId}`] !== ""
      ? Number(record[`new_start_${fieldId}`]) 
      : 0;

    rawDiff = Math.max(0, oldFinal - prevVal) + Math.max(0, currentVal - newStart);
  } else {
    rawDiff = Math.max(0, currentVal - prevVal);
  }

  if (category === "电") {
    return rawDiff * ratio;
  }
  return rawDiff;
}

/**
 * Perform precise double-difference utility calculation across all records
 */
export function getEnrichedDailyRecords(
  历史数据: 抄表记录[],
  限额配置: 字典配置,
  日常回路配置: DailyFieldConfig[],
): EnrichedRecord[] {
  const sortedData = [...历史数据].sort((a, b) => a.日期.localeCompare(b.日期));
  
  return sortedData.map((record, index) => {
    const prevRecord = index > 0 ? sortedData[index - 1] : null;
    const date = record.日期;
    const dailyPrices = getDailyPrices(date, 限额配置, 日常回路配置);
    const prices = {
      电费单价: dailyPrices.电.单价,
      水费单价: dailyPrices.水.单价,
      气费单价: dailyPrices.气.单价,
    };
    const ratio = 限额配置.电表换算基数 ?? 3500;
    
    // 1. Calculate Electricity
    let elecUsage = 0;
    const elecFields = 日常回路配置.filter(f => f.category === "电");
    if (elecFields.length > 0) {
      elecFields.forEach(f => {
        elecUsage += getFieldConsumption(record, prevRecord, f.id, "电", ratio, 限额配置);
      });
    } else {
      getDefaultFallbackFields("电").forEach(fieldId => {
        elecUsage += getFieldConsumption(record, prevRecord, fieldId, "电", ratio, 限额配置);
      });
    }

    // 2. Calculate Water
    let waterUsage = 0;
    const waterFields = 日常回路配置.filter(f => f.category === "水");
    if (waterFields.length > 0) {
      waterFields.forEach(f => {
        waterUsage += getFieldConsumption(record, prevRecord, f.id, "水", 1, 限额配置);
      });
    } else {
      getDefaultFallbackFields("水").forEach(fieldId => {
        waterUsage += getFieldConsumption(record, prevRecord, fieldId, "水", 1, 限额配置);
      });
    }

    // 3. Calculate Gas
    let gasUsage = 0;
    const gasFields = 日常回路配置.filter(f => f.category === "气");
    if (gasFields.length > 0) {
      gasFields.forEach(f => {
        gasUsage += getFieldConsumption(record, prevRecord, f.id, "气", 1, 限额配置);
      });
    } else {
      getDefaultFallbackFields("气").forEach(fieldId => {
        gasUsage += getFieldConsumption(record, prevRecord, fieldId, "气", 1, 限额配置);
      });
    }

    const electricityCost = elecUsage * (prices.电费单价 || 0);
    const waterCost = waterUsage * (prices.水费单价 || 0);
    const gasCost = gasUsage * (prices.气费单价 || 0);
    const totalCost = electricityCost + waterCost + gasCost;

    return {
      日期: date,
      电量: elecUsage,
      水量: waterUsage,
      气量: gasUsage,
      电费: electricityCost,
      水费: waterCost,
      气费: gasCost,
      总费: totalCost,
      raw: record,
    };
  });
}
