import { DailyFieldConfig, GasGroupConfig } from "../../shared/types";

/**
 * 表格列的语义类型（取代 14 个布尔 flag）
 */
export type ColumnKind =
  | "meter_reading"      // 原始抄表读数
  | "meter_usage"        // 计算用量（今日-昨日）
  | "meter_kwh"          // 换算 kwh（电表专有）
  | "meter_price"        // 当日单价
  | "meter_cost"         // 当日费用
  | "category_total_kwh" // 分类合计-电量
  | "category_total_cost"// 分类合计-费用
  | "category_total_water_usage" // 分类合计-水用量
  | "category_total_water_cost"  // 分类合计-水费
  | "category_total_gas_usage"   // 分类合计-气用量
  | "category_total_gas_cost"    // 分类合计-气费
  | "category_price"     // 分类单价（气价）
  | "gas_group_usage";   // 燃气分组用量

export interface HistoryColumn {
  id: string;
  name: string;
  unit?: string;
  category: "电" | "水" | "气" | string;
  /** 列的语义类型（取代 isMeter / isUsage / isKwh / isPrice / isCost 等 14 个布尔） */
  kind: ColumnKind;
  /** 所属电表/回路的 id（用于用量/kwh/费用等派生列查找原始读数） */
  parentFieldId?: string;
}

function colKind(k: ColumnKind, parent?: string): Pick<HistoryColumn, "kind" | "parentFieldId"> {
  return { kind: k, parentFieldId: parent };
}

export function buildHistoryColumns(
  日常回路配置: DailyFieldConfig[],
  groups: GasGroupConfig[],
): HistoryColumn[] {
  const list: HistoryColumn[] = [];

  日常回路配置.forEach((field) => {
    // 原始抄表数值列（与系统字典里该字段的 name 完全一致）
    list.push({
      id: field.id,
      name: field.name,
      unit: field.unit,
      category: field.category || "",
      ...colKind("meter_reading", field.id),  // 必须传 field.id 作为 parentFieldId
    });

    if (field.category === "电") {
      // 电表电量 = 今日读数 - 昨日读数（换算前差值）
      list.push({
        id: `${field.id}_usage`,
        name: `${field.name}电量`,
        unit: field.unit || "度",
        category: "电",
        ...colKind("meter_usage", field.id),
      });
      // 用电量 = 电表电量 × 电表换算基数
      list.push({
        id: `${field.id}_kwh`,
        name: `${field.name}用电量`,
        unit: "度",
        category: "电",
        ...colKind("meter_kwh", field.id),
      });
      // 电单价 = 定价历史时光轴中当日生效电价
      list.push({
        id: `${field.id}_price`,
        name: `${field.name}电价`,
        unit: "元/度",
        category: "电",
        ...colKind("meter_price", field.id),
      });
      // 费用 = 结算量 × 电单价
      list.push({
        id: `${field.id}_cost`,
        name: `${field.name}费用`,
        unit: "元",
        category: "电",
        ...colKind("meter_cost", field.id),
      });
    } else if (field.category === "水") {
      // 用水量 = 今日读数 - 昨日读数
      list.push({
        id: `${field.id}_usage`,
        name: `${field.name}用水量`,
        unit: field.unit || "吨",
        category: "水",
        ...colKind("meter_usage", field.id),
      });
      // 水单价 = 定价历史时光轴中当日生效水价
      list.push({
        id: `${field.id}_price`,
        name: `${field.name}水价`,
        unit: "元/吨",
        category: "水",
        ...colKind("meter_price", field.id),
      });
      // 费用 = 用水量 × 水单价
      list.push({
        id: `${field.id}_cost`,
        name: `${field.name}费用`,
        unit: "元",
        category: "水",
        ...colKind("meter_cost", field.id),
      });
    } else if (field.category === "气") {
      // 天然气用量 = 今日读数 - 昨日读数
      list.push({
        id: `${field.id}_usage`,
        name: `${field.name}用气量`,
        unit: field.unit || "m³",
        category: "气",
        ...colKind("meter_usage", field.id),
      });
      // 气单价 = 定价历史时光轴中当日生效气价
      list.push({
        id: `${field.id}_price`,
        name: `${field.name}气价`,
        unit: "元/m³",
        category: "气",
        ...colKind("meter_price", field.id),
      });
      // 费用 = 用气量 × 气单价
      list.push({
        id: `${field.id}_cost`,
        name: `${field.name}费用`,
        unit: "元",
        category: "气",
        ...colKind("meter_cost", field.id),
      });
    }
  });

  // ── 合计行（与系统字典里字段名不同，使用系统通用名称） ──
  if (日常回路配置.some((f) => f.category === "电")) {
    // 每日总电量 = 各电表结算量之和（已含换算基数）
    list.push({
      id: "daily_total_kwh",
      name: "每日总用电量",
      unit: "度",
      category: "电",
      ...colKind("category_total_kwh"),
    });
    // 每日总电费 = 每日总用电量 × 当日生效电价
    list.push({
      id: "daily_total_cost",
      name: "每日总电费",
      unit: "元",
      category: "电",
      ...colKind("category_total_cost"),
    });
  }

  if (日常回路配置.some((f) => f.category === "水")) {
    // 每日总用水量 = 各水表用水量之和
    list.push({
      id: "daily_total_water_usage",
      name: "每日总用水量",
      unit: "吨",
      category: "水",
      ...colKind("category_total_water_usage"),
    });
    // 每日总水费 = 每日总用水量 × 当日生效水价
    list.push({
      id: "daily_total_water_cost",
      name: "每日总水费",
      unit: "元",
      category: "水",
      ...colKind("category_total_water_cost"),
    });
  }

  if (日常回路配置.some((f) => f.category === "气")) {
    // 气单价 = 定价历史时光轴中当日生效气价
    list.push({
      id: "gas_category_price",
      name: "当日气价",
      unit: "元/m³",
      category: "气",
      ...colKind("category_price"),
    });
    // 每日总用气量
    list.push({
      id: "daily_total_gas_usage",
      name: "每日总用气量",
      unit: "m³",
      category: "气",
      ...colKind("category_total_gas_usage"),
    });
    // 每日总气费
    list.push({
      id: "daily_total_gas_cost",
      name: "每日总气费",
      unit: "元",
      category: "气",
      ...colKind("category_total_gas_cost"),
    });
    groups.forEach((g) => {
      list.push({
        id: `gas_group_usage_${g.id}`,
        name: g.name,
        unit: "m³",
        category: "气",
        ...colKind("gas_group_usage", g.id),
      });
    });
  }

  return list;
}
