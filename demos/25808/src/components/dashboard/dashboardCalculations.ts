import { getEnrichedDailyRecords, getFieldConsumption } from "../../shared/utils/pricing";
import { DailyFieldConfig, 字典配置, 抄表记录 } from "../../shared/types";

/**
 * 根据分类获取该分类对应的字段列表
 */
function getFieldsByCategory(
  fields: DailyFieldConfig[],
  category: string,
  defaultFallbackIds?: string[]
): DailyFieldConfig[] {
  const filtered = fields.filter(f => f.category === category);
  if (filtered.length > 0) {
    return filtered;
  }
  // 如果没有找到配置字段，返回默认回退字段
  if (defaultFallbackIds) {
    return defaultFallbackIds.map(id => ({ id, name: id, category, unit: "", limit: 0 } as DailyFieldConfig));
  }
  return [];
}

/**
 * 获取某分类的换算基数
 */
function getCategoryRatio(category: string, 限额配置: 字典配置): number {
  if (category === "电") {
    return 限额配置.电表换算基数 ?? 3500;
  }
  return 1; // 水和气默认不换算
}

export function getTrendData(
  历史数据: 抄表记录[],
  category: "电" | "水" | "气",
  fieldId: string,
  view: "daily" | "monthly",
  selectedTime: string,
  elecFields: DailyFieldConfig[],
  waterFields: DailyFieldConfig[],
  gasFields: DailyFieldConfig[],
  限额配置: 字典配置,
) {
  const isAll = fieldId === "all";
  
  // 根据分类获取对应字段（使用配置或回退默认值）
  const defaultFallbacks: Record<string, string[]> = {
    "电": ["李体线电表", "午沙线电表"],
    "水": ["酒店水表", "喷泉水表"],
    "气": ["天然气表"],
  };
  
  const fields = category === "电" 
    ? getFieldsByCategory(elecFields, "电", defaultFallbacks["电"])
    : category === "水"
      ? getFieldsByCategory(waterFields, "水", defaultFallbacks["水"])
      : getFieldsByCategory(gasFields, "气", defaultFallbacks["气"]);

  const queryRatio = getCategoryRatio(category, 限额配置);
  const sortedData = [...历史数据].sort((a, b) => a.日期.localeCompare(b.日期));
  const dayUsageMap = new Map<string, number>();

  sortedData.forEach((record, index) => {
    const prevRecord = index > 0 ? sortedData[index - 1] : null;
    let val = 0;

    if (isAll) {
      fields.forEach(f => {
        val += getFieldConsumption(record, prevRecord, f.id, category, queryRatio, 限额配置);
      });
    } else {
      val = getFieldConsumption(record, prevRecord, fieldId, category, queryRatio, 限额配置);
    }

    dayUsageMap.set(record.日期, val);
  });

  if (view === "daily") {
    if (!selectedTime) return [];

    const [year, month] = selectedTime.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const fullMonthData = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      fullMonthData.push({
        date: String(i),
        value: dayUsageMap.get(dateStr) || 0,
      });
    }
    return fullMonthData;
  } else {
    const groups: { [month: string]: number } = {};
    if (selectedTime) {
      sortedData
        .filter((h) => h.日期.startsWith(selectedTime))
        .forEach((h) => {
          if (!h.日期 || h.日期 === "无数据" || h.日期.length < 7) return;
          const month = h.日期.substring(0, 7);
          groups[month] = (groups[month] || 0) + (dayUsageMap.get(h.日期) || 0);
        });
    }
    return Object.keys(groups)
      .sort()
      .map((month) => ({ date: month.slice(5), value: groups[month] }));
  }
}

/**
 * 计算月度汇总数据
 */
export function getMonthlyGroups(历史数据: 抄表记录[], 限额配置: 字典配置, 日常回路配置: DailyFieldConfig[]) {
  const enriched = getEnrichedDailyRecords(历史数据, 限额配置, 日常回路配置);
  const groups: { [month: string]: typeof enriched } = {};
  enriched.forEach((item) => {
    if (!item.日期 || item.日期 === "无数据" || item.日期.length < 7) return;
    const month = item.日期.substring(0, 7);
    if (!groups[month]) {
      groups[month] = [];
    }
    groups[month].push(item);
  });

  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map((month) => {
      const records = groups[month];
      const tElec = records.reduce((sum, item) => sum + item.电量, 0);
      const tWater = records.reduce((sum, item) => sum + item.水量, 0);
      const tGas = records.reduce((sum, item) => sum + item.气量, 0);

      const tCostElec = records.reduce((sum, item) => sum + item.电费, 0);
      const tCostWater = records.reduce((sum, item) => sum + item.水费, 0);
      const tCostGas = records.reduce((sum, item) => sum + item.气费, 0);

      return {
        month,
        totalElec: tElec,
        totalWater: tWater,
        totalGas: tGas,
        costElec: tCostElec,
        costWater: tCostWater,
        costGas: tCostGas,
        totalCost: tCostElec + tCostWater + tCostGas,
        daysCount: records.length,
      };
    });
}

