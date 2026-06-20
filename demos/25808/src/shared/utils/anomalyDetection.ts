/**
 * ============================================================
 * 导入异常检测 - 用于识别导入数据中的质量问题
 * ============================================================
 * 
 * 检测项：
 * 1. 读数跳变 / 反向 (当前读数 < 上一读数)
 * 2. 增量异常 (相对于允许误差配置)
 * 3. 日期格式异常
 * 4. 重复日期
 * 5. 字段缺失/空值
 */

import { 抄表记录, 字典配置, DailyFieldConfig } from "../types";

export interface 异常记录 {
  date: string;
  fieldId: string;
  displayName: string;
  type: "反向读数" | "增量跳变" | "日期格式" | "重复日期" | "空值" | "首天回退";
  message: string;
  currentValue?: number;
  previousValue?: number;
  delta?: number;
  severity: "high" | "medium" | "low";
}

export interface 检测结果 {
  records: 抄表记录[];
  anomalies: 异常记录[];
  summary: {
    total: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    fieldsDetected: string[];
  };
}

/**
 * 获取字段的允许误差（从配置中读取或使用默认值）
 */
function getFieldDelta(
  fieldId: string,
  config: 字典配置,
  category: string,
): number {
  const 允许误差配置 = config.允许误差配置 || [];
  const fieldConfig = 允许误差配置.find((f) => f.fieldId === fieldId);
  if (fieldConfig) return fieldConfig.delta;

  // 兼容旧逻辑的默认回退值
  if (category === "电") return fieldId.includes("午沙") ? 5 : 10;
  if (category === "水") return fieldId.includes("喷泉") ? 2 : 5;
  if (category === "气") return 10;
  return 10;
}

/**
 * 获取某字段的类别（从日常回路配置中查询）
 */
function getFieldCategory(fieldId: string, 日常回路配置: DailyFieldConfig[]): string {
  const found = 日常回路配置.find((f) => f.id === fieldId);
  return found?.category || "";
}

/**
 * 主检测函数：对一批待导入的记录执行质量检查
 */
export function 检测导入数据异常(
  rawRecords: 抄表记录[],
  config: 字典配置,
  日常回路配置: DailyFieldConfig[],
  历史数据: 抄表记录[] = [],
): 检测结果 {
  const anomalies: 异常记录[] = [];
  const fieldsDetected = new Set<string>();

  // 步骤1: 日期格式与重复检测
  const dateMap = new Map<string, 抄表记录>();
  for (const rec of rawRecords) {
    if (!rec.日期 || !/^\d{4}-\d{2}-\d{2}$/.test(rec.日期)) {
      anomalies.push({
        date: rec.日期 || "未知",
        fieldId: "__date__",
        displayName: "日期",
        type: "日期格式",
        message: `日期格式异常：${rec.日期}，应写作 YYYY-MM-DD`,
        severity: "high",
      });
      continue;
    }
    if (dateMap.has(rec.日期)) {
      anomalies.push({
        date: rec.日期,
        fieldId: "__date__",
        displayName: "日期",
        type: "重复日期",
        message: `日期 ${rec.日期} 重复出现，将只保留最后一条`,
        severity: "medium",
      });
    }
    dateMap.set(rec.日期, rec);
  }

  // 步骤2: 按日期排序，并拼接历史数据的最后一条（作为前导参考）
  const sorted = [...rawRecords]
    .filter((r) => r.日期 && /^\d{4}-\d{2}-\d{2}$/.test(r.日期))
    .sort((a, b) => a.日期.localeCompare(b.日期));

  // 收集出现在 rawRecords 中的所有字段
  const allFieldIds = new Set<string>();
  for (const rec of sorted) {
    for (const key of Object.keys(rec)) {
      if (key === "日期") continue;
      allFieldIds.add(key);
    }
  }

  // 步骤3: 对每个字段执行增量 / 反向检测
  // 如果有历史数据，取历史数据中最新一条作为起点
  const sortedHistory = [...历史数据]
    .filter((r) => r.日期 && /^\d{4}-\d{2}-\d{2}$/.test(r.日期))
    .sort((a, b) => b.日期.localeCompare(a.日期));

  const latestHistory = sortedHistory[0] || null;

  for (const fieldId of allFieldIds) {
    const category = getFieldCategory(fieldId, 日常回路配置);
    const delta = getFieldDelta(fieldId, config, category);
    fieldsDetected.add(fieldId);

    // 以历史最后一条 + 新数据 作为完整序列做相邻比较
    const extendedSequence: 抄表记录[] = [];
    if (latestHistory && latestHistory[fieldId] !== undefined) {
      extendedSequence.push(latestHistory);
    }
    extendedSequence.push(...sorted);

    for (let i = 0; i < extendedSequence.length; i++) {
      const current = extendedSequence[i];
      const currentVal = current[fieldId] as number | string | undefined;

      // 空值检测（只对新导入数据报空值，不针对历史参考）
      if (i >= (latestHistory ? 1 : 0)) {
        if (currentVal === undefined || currentVal === null || currentVal === "") {
          anomalies.push({
            date: current.日期,
            fieldId,
            displayName: fieldId,
            type: "空值",
            message: `${fieldId} 没有填写读数`,
            severity: "low",
          });
          continue;
        }
      }

      // 非数字跳过后续检测
      const numVal = Number(currentVal);
      if (isNaN(numVal)) continue;

      // 首天 / 历史末条 特殊处理：基于允许误差配置做回退
      if (i === 0) {
        // 这是新数据的第一天，且没有历史可参考
        // 在导入场景里首天的前一读数需要根据允许误差推算，不做异常处理
        continue;
      }

      const prev = extendedSequence[i - 1];
      const prevVal = Number(prev[fieldId]);
      if (isNaN(prevVal)) continue;

      const diff = numVal - prevVal;

      // 反向读数（当前读数 < 上次读数）
      if (diff < 0) {
        anomalies.push({
          date: current.日期,
          fieldId,
          displayName: fieldId,
          type: "反向读数",
          message: `${fieldId} 读数回落：${prevVal} → ${numVal}（Δ${diff.toFixed(2)}）`,
          currentValue: numVal,
          previousValue: prevVal,
          delta: diff,
          severity: "high",
        });
        continue;
      }

      // 增量异常：若本次差值远超正常水平
      // 策略：增量 > 默认允许误差 × 5 视为异常（可通过配置调整）
      const anomalyThreshold = delta * 5;
      if (diff > anomalyThreshold && anomalyThreshold > 0) {
        anomalies.push({
          date: current.日期,
          fieldId,
          displayName: fieldId,
          type: "增量跳变",
          message: `${fieldId} 单日增量异常大：${prevVal} → ${numVal}（Δ${diff.toFixed(2)}），阈值：${anomalyThreshold}`,
          currentValue: numVal,
          previousValue: prevVal,
          delta: diff,
          severity: "medium",
        });
      }
    }
  }

  // 统计汇总
  const summary = {
    total: anomalies.length,
    highCount: anomalies.filter((a) => a.severity === "high").length,
    mediumCount: anomalies.filter((a) => a.severity === "medium").length,
    lowCount: anomalies.filter((a) => a.severity === "low").length,
    fieldsDetected: Array.from(fieldsDetected),
  };

  return {
    records: sorted,
    anomalies,
    summary,
  };
}

/**
 * 按严重程度排序异常
 */
export function 按严重程度排序(anomalies: 异常记录[]): 异常记录[] {
  const weight: Record<string, number> = { high: 3, medium: 2, low: 1 };
  return [...anomalies].sort(
    (a, b) => weight[b.severity] - weight[a.severity] || a.date.localeCompare(b.date),
  );
}

/**
 * 分组异常便于展示
 */
export function 按类型分组(
  anomalies: 异常记录[],
): Record<异常记录["type"], 异常记录[]> {
  const result: Record<string, 异常记录[]> = {};
  for (const a of anomalies) {
    if (!result[a.type]) result[a.type] = [];
    result[a.type].push(a);
  }
  return result;
}
