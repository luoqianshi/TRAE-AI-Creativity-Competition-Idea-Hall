import { getEnrichedDailyRecords, getPrice } from "../../shared/utils/pricing";
import { DailyFieldConfig, MonthlyCircuitConfig, 抄表记录, 月度抄表记录, 字典配置 } from "../../shared/types";

export function getDailySummaries(
  历史数据: 抄表记录[],
  限额配置: 字典配置,
  日常回路配置: DailyFieldConfig[],
) {
  return getEnrichedDailyRecords(历史数据, 限额配置, 日常回路配置);
}

/**
 * 月度大类汇总项
 */
export interface MonthlyCategorySummary {
  月份: string;
  大类名称: string;
  回路数量: number;
  总用量: number;
  总费用: number;
  能耗类型: "电" | "水" | "气";
}

/**
 * 带同比/环比的月度大类汇总项
 */
export interface MonthlyCategorySummaryWithComparison extends MonthlyCategorySummary {
  上月用量?: number;
  上月费用?: number;
  环比用量变化?: number;    // 百分比
  环比费用变化?: number;
  去年同月用量?: number;
  去年同月费用?: number;
  同比用量变化?: number;    // 百分比
  同比费用变化?: number;
}

/**
 * 计算单个月份按大类聚合的汇总数据
 */
export function computeMonthlyCategorySummaries(
  月度历史: 月度抄表记录[],
  selectedMonth: string,
  circuitData: MonthlyCircuitConfig[],
  限额配置: 字典配置,
): MonthlyCategorySummary[] {
  const filteredData = 月度历史.filter((item) => item.月份 === selectedMonth);
  const item = filteredData[0];

  // 获取上月读数
  const pastRecords = 月度历史
    .filter((r) => r.月份 < selectedMonth)
    .sort((a, b) => b.月份.localeCompare(a.月份));

  const prevReadingMap = new Map<string, number>();
  for (const c of circuitData) {
    let prev = 0;
    for (const rec of pastRecords) {
      if (rec.数据 && rec.数据[c.id] !== undefined) {
        prev = Number(rec.数据[c.id]);
        break;
      }
    }
    prevReadingMap.set(c.id, prev);
  }

  // 按 category 大类分组
  const categoryMap = new Map<string, { circuits: MonthlyCircuitConfig[]; totalUsage: number; totalCost: number }>();

  circuitData.forEach((c) => {
    const cat = c.category || "未分类";
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, { circuits: [], totalUsage: 0, totalCost: 0 });
    }
    const entry = categoryMap.get(cat)!;
    entry.circuits.push(c);

    const prevReading = prevReadingMap.get(c.id) ?? 0;
    const currentReading =
      item && item.数据 && item.数据[c.id] !== undefined
        ? Number(item.数据[c.id])
        : undefined;

    if (currentReading !== undefined) {
      let usage = 0;
      const isSwapped =
        item &&
        (item.数据?.[`swap_${c.id}`] === true ||
          item.数据?.[`swap_${c.id}`] === "true");

      if (isSwapped) {
        const oldFinal =
          item.数据?.[`old_final_${c.id}`] !== undefined &&
          item.数据?.[`old_final_${c.id}`] !== ""
            ? Number(item.数据?.[`old_final_${c.id}`])
            : prevReading;
        const newStart =
          item.数据?.[`new_start_${c.id}`] !== undefined &&
          item.数据?.[`new_start_${c.id}`] !== ""
            ? Number(item.数据?.[`new_start_${c.id}`])
            : 0;
        usage =
          Math.max(0, oldFinal - prevReading) +
          Math.max(0, currentReading - newStart);
      } else {
        usage = currentReading - prevReading;
      }

      const actualUsage = Math.max(0, usage);

      // 根据能耗类型确定单价
      let price = 0;
      const priceResult = getPrice(c.id, selectedMonth, 限额配置, circuitData);
      if (priceResult.单价 > 0) {
        price = priceResult.单价;
      } else {
        if (cat.includes("电") || c.category === "电") {
          price = 限额配置.电费单价 || 0;
        } else if (cat.includes("水") || c.category === "水") {
          price = 限额配置.水费单价 || 0;
        } else if (cat.includes("气") || c.category === "气") {
          price = 限额配置.气费单价 || 0;
        }
      }

      entry.totalUsage += actualUsage;
      entry.totalCost += actualUsage * price;
    }
  });

  const results: MonthlyCategorySummary[] = [];
  categoryMap.forEach((data, catName) => {
    // 推断能耗类型
    let energyType: "电" | "水" | "气" = "电";
    if (catName.includes("水") || data.circuits.some(c => c.category === "水")) {
      energyType = "水";
    } else if (catName.includes("气") || data.circuits.some(c => c.category === "气")) {
      energyType = "气";
    }

    results.push({
      月份: selectedMonth,
      大类名称: catName,
      回路数量: data.circuits.length,
      总用量: data.totalUsage,
      总费用: data.totalCost,
      能耗类型: energyType,
    });
  });

  return results;
}

/**
 * 计算带同比/环比的月度大类汇总
 */
export function getMonthlyCategorySummariesWithComparison(
  月度历史: 月度抄表记录[],
  selectedMonth: string,
  circuitData: MonthlyCircuitConfig[],
  限额配置: 字典配置,
): MonthlyCategorySummaryWithComparison[] {
  const currentSummaries = computeMonthlyCategorySummaries(
    月度历史,
    selectedMonth,
    circuitData,
    限额配置,
  );

  // 计算上月
  const [year, month] = selectedMonth.split("-").map(Number);
  const prevMonthDate = new Date(year, month - 2, 1); // month-2 因为 month 是 1-12
  const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const prevSummaries = computeMonthlyCategorySummaries(
    月度历史,
    prevMonth,
    circuitData,
    限额配置,
  );

  // 计算去年同月
  const lastYearMonth = `${year - 1}-${String(month).padStart(2, "0")}`;
  const lastYearSummaries = computeMonthlyCategorySummaries(
    月度历史,
    lastYearMonth,
    circuitData,
    限额配置,
  );

  // 合并同比/环比数据
  return currentSummaries.map((curr) => {
    const prev = prevSummaries.find((p) => p.大类名称 === curr.大类名称);
    const lastYear = lastYearSummaries.find((l) => l.大类名称 === curr.大类名称);

    const 环比用量变化 =
      prev && prev.总用量 > 0
        ? ((curr.总用量 - prev.总用量) / prev.总用量) * 100
        : undefined;
    const 环比费用变化 =
      prev && prev.总费用 > 0
        ? ((curr.总费用 - prev.总费用) / prev.总费用) * 100
        : undefined;

    const 同比用量变化 =
      lastYear && lastYear.总用量 > 0
        ? ((curr.总用量 - lastYear.总用量) / lastYear.总用量) * 100
        : undefined;
    const 同比费用变化 =
      lastYear && lastYear.总费用 > 0
        ? ((curr.总费用 - lastYear.总费用) / lastYear.总费用) * 100
        : undefined;

    return {
      ...curr,
      上月用量: prev?.总用量,
      上月费用: prev?.总费用,
      环比用量变化,
      环比费用变化,
      去年同月用量: lastYear?.总用量,
      去年同月费用: lastYear?.总费用,
      同比用量变化,
      同比费用变化,
    };
  });
}

/**
 * 旧版月度汇总（按电/水/气三类汇总）—— 保留向后兼容
 */
export function getMonthlySummaries(
  月度历史: 月度抄表记录[],
  circuitData: MonthlyCircuitConfig[],
  限额配置: 字典配置,
) {
  const sorted = [...月度历史].sort((a, b) => a.月份.localeCompare(b.月份));

  return sorted.map((item) => {
    const month = item.月份;

    const getUsage = (key: string) => {
      if (!item.数据 || item.数据[key] === undefined) return 0;
      return Number(item.数据[key]) || 0;
    };

    const elecUsage = circuitData.filter(c => c.category === '电').reduce((sum, c) => sum + getUsage(c.id), 0);
    const waterUsage = circuitData.filter(c => c.category === '水').reduce((sum, c) => sum + getUsage(c.id), 0);
    const gasUsage = circuitData.filter(c => c.category === '气').reduce((sum, c) => sum + getUsage(c.id), 0);

    const elecCircuits = circuitData.filter(c => c.category === '电');
    const waterCircuits = circuitData.filter(c => c.category === '水');
    const gasCircuits = circuitData.filter(c => c.category === '气');
    const elecPrice = elecCircuits.length > 0 ? (getPrice(elecCircuits[0].id, month, 限额配置, circuitData).单价 || 限额配置.电费单价 || 0) : (限额配置.电费单价 || 0);
    const waterPrice = waterCircuits.length > 0 ? (getPrice(waterCircuits[0].id, month, 限额配置, circuitData).单价 || 限额配置.水费单价 || 0) : (限额配置.水费单价 || 0);
    const gasPrice = gasCircuits.length > 0 ? (getPrice(gasCircuits[0].id, month, 限额配置, circuitData).单价 || 限额配置.气费单价 || 0) : (限额配置.气费单价 || 0);
    const elecCost = elecUsage * elecPrice;
    const waterCost = waterUsage * waterPrice;
    const gasCost = gasUsage * gasPrice;
    const totalCost = elecCost + waterCost + gasCost;

    return {
      月份: month,
      天数: 30,
      电量: elecUsage,
      水量: waterUsage,
      气量: gasUsage,
      电费: elecCost,
      水费: waterCost,
      气费: gasCost,
      总费: totalCost,
    };
  });
}

export function computeMonthlyDetailSummary(
  月度历史: 月度抄表记录[],
  selectedMonth: string,
  circuitData: MonthlyCircuitConfig[],
  限额配置: 字典配置,
) {
  const filteredData = 月度历史.filter((item) => item.月份 === selectedMonth);
  const elecCircuits = circuitData.filter(c => c.category === "电");
  const electricityPrice = elecCircuits.length > 0
    ? (getPrice(elecCircuits[0].id, selectedMonth, 限额配置, circuitData).单价 || 限额配置.电费单价 || 0)
    : (限额配置.电费单价 || 0);

  const findPreviousReading = (circuitId: string): number => {
    const pastRecords = 月度历史
      .filter((item) => item.月份 < selectedMonth)
      .sort((a, b) => b.月份.localeCompare(a.月份));

    if (pastRecords.length > 0) {
      const closestRecord = pastRecords[0];
      if (closestRecord.数据 && closestRecord.数据[circuitId] !== undefined) {
        return closestRecord.数据[circuitId];
      }
    }
    return 0;
  };

  let totalUsage = 0;
  let totalAmount = 0;
  let hasAnyUsage = false;

  circuitData.forEach((c) => {
    const item = filteredData[0];
    const prevReading = findPreviousReading(c.id);
    const currentReading =
      item && item.数据 && item.数据[c.id] !== undefined
        ? item.数据[c.id]
        : undefined;

    if (currentReading !== undefined) {
      let usage = 0;
      const isSwapped = item && item.数据 && (item.数据[`swap_${c.id}`] === true || item.数据[`swap_${c.id}`] === "true");
      if (isSwapped) {
        const oldFinal = item.数据[`old_final_${c.id}`] !== undefined && item.数据[`old_final_${c.id}`] !== ""
          ? Number(item.数据[`old_final_${c.id}`])
          : prevReading;
        const newStart = item.数据[`new_start_${c.id}`] !== undefined && item.数据[`new_start_${c.id}`] !== ""
          ? Number(item.数据[`new_start_${c.id}`])
          : 0;
        usage = Math.max(0, oldFinal - prevReading) + Math.max(0, currentReading - newStart);
      } else {
        usage = currentReading - prevReading;
      }

      const actualUsage = usage >= 0 ? usage : 0;
      totalUsage += actualUsage;
      totalAmount += actualUsage * electricityPrice;
      hasAnyUsage = true;
    }
  });

  return { totalUsage, totalAmount, hasAnyUsage };
}