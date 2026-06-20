/**
 * ============================================================
 * 导入字段匹配注册表 - 用于消除导入解析层的硬编码
 * ============================================================
 * 
 * 设计原则：
 * 1. 导入时基于本注册表 + 日常回路配置 (DailyFieldConfig) 动态匹配列
 * 2. 关键字 (canonicalId) 与 DailyFieldConfig.id 一致
 * 3. matchers 为一组候选表头关键词，支持中英文/缩写/别名
 * 4. category 用于识别能耗类型，联动增量/单价等后续逻辑
 */

import { DailyFieldConfig } from "../types";

export interface 导入字段匹配规则 {
  fieldId: string;        // 标准字段ID，对应 DailyFieldConfig.id
  category: "电" | "水" | "气" | string;
  matchers: string[];     // 候选表头关键词（大小写不敏感）
  defaultUnit?: string;
  defaultLimit?: number;
  displayName: string;    // 推荐显示名
}

/**
 * 默认字段匹配规则库 - 覆盖酒店常见表字段
 * 用户在"日常表字段"配置中新增的字段，只要 name 与 Excel 表头一致，
 * 也会被自动匹配，无需在这里注册。
 */
export const DEFAULT_IMPORT_FIELD_RULES: 导入字段匹配规则[] = [
  // ── 电力 ────────────────────────────────────────
  {
    fieldId: "李体线电表",
    category: "电",
    matchers: ["李体线", "李体线电表", "一号主线", "主线1", "litixian", "elec1", "电力表1"],
    displayName: "李体线电表",
    defaultUnit: "度",
    defaultLimit: 1300,
  },
  {
    fieldId: "午沙线电表",
    category: "电",
    matchers: ["午沙线", "午沙线电表", "二号主线", "主线2", "wushaxian", "elec2", "电力表2"],
    displayName: "午沙线电表",
    defaultUnit: "度",
    defaultLimit: 850,
  },

  // ── 水 ────────────────────────────────────────
  {
    fieldId: "酒店水表",
    category: "水",
    matchers: ["酒店水表", "酒店水", "主水", "主水表", "water1", "冷水表"],
    displayName: "酒店水表",
    defaultUnit: "吨",
    defaultLimit: 45,
  },
  {
    fieldId: "喷泉水表",
    category: "水",
    matchers: ["喷泉水表", "喷泉", "景观水", "water2", "景观水表"],
    displayName: "喷泉水表",
    defaultUnit: "吨",
    defaultLimit: 32,
  },

  // ── 燃气 ────────────────────────────────────────
  {
    fieldId: "天然气表",
    category: "气",
    matchers: ["天然气", "天然气表", "燃气总表", "气总表", "gas", "总燃气"],
    displayName: "天然气表",
    defaultUnit: "立方米",
    defaultLimit: 120,
  },
  {
    fieldId: "气_锅炉1",
    category: "气",
    matchers: ["锅炉1", "锅炉一号", "气锅炉1", "gas_boiler1", "锅炉1表"],
    displayName: "锅炉1燃气表",
    defaultUnit: "立方米",
    defaultLimit: 50,
  },
  {
    fieldId: "气_锅炉2",
    category: "气",
    matchers: ["锅炉2", "锅炉二号", "气锅炉2", "gas_boiler2", "锅炉2表"],
    displayName: "锅炉2燃气表",
    defaultUnit: "立方米",
    defaultLimit: 50,
  },
  {
    fieldId: "气_锅炉3",
    category: "气",
    matchers: ["锅炉3", "锅炉三号", "气锅炉3", "gas_boiler3", "锅炉3表"],
    displayName: "锅炉3燃气表",
    defaultUnit: "立方米",
    defaultLimit: 50,
  },
  {
    fieldId: "气_3F宴会",
    category: "气",
    matchers: ["3F宴会", "3楼宴会", "三楼宴会", "宴会燃气", "banquet_gas"],
    displayName: "3F宴会燃气表",
    defaultUnit: "立方米",
    defaultLimit: 30,
  },
  {
    fieldId: "气_4F自助",
    category: "气",
    matchers: ["4F自助", "4楼自助", "四楼自助", "自助燃气", "cafeteria_gas"],
    displayName: "4F自助燃气表",
    defaultUnit: "立方米",
    defaultLimit: 30,
  },
  {
    fieldId: "气_4F拾鲜",
    category: "气",
    matchers: ["4F拾鲜", "4楼拾鲜", "四楼拾鲜", "拾鲜燃气", "restaurant_gas"],
    displayName: "4F拾鲜燃气表",
    defaultUnit: "立方米",
    defaultLimit: 30,
  },
];

/** 日期列匹配关键词 */
export const 日期列匹配关键词 = [
  "日期", "date", "day", "日", "时间", "抄表日期", "记录日期",
];

/** 表底数行匹配关键词 */
export const 表底行匹配关键词 = [
  "上月表底", "上月读数", "上月底数", "初始读数", "起始表底", "initial reading",
  "表底", "底数", "初始", "月初读数",
];

/** 标题能耗类型识别 - 用于确定整个表格的能耗类别 */
export const 标题能耗类型识别: { type: "电" | "水" | "气"; keywords: string[] }[] = [
  { type: "电", keywords: ["用电", "电能", "电力", "electric", "electricity", "kwh", "能耗汇总"] },
  { type: "水", keywords: ["用水", "水量", "water", "自来水", "水耗"] },
  { type: "气", keywords: ["燃气", "天然气", "煤气", "gas", "气耗"] },
];

/**
 * 对字符串做标准化（去空格、小写、去中英文括号等）
 */
export function 标准化字符串(input: string | number): string {
  return String(input || "")
    .toLowerCase()
    .replace(/[（）()【】\[\]\s_\-\/\\，,。.]/g, "")
    .trim();
}

/**
 * 尝试将表头匹配到已注册的字段规则
 */
export function 匹配表头到字段规则(
  header: string | number,
  rules: 导入字段匹配规则[] = DEFAULT_IMPORT_FIELD_RULES,
): 导入字段匹配规则 | null {
  const normalized = 标准化字符串(header);
  if (!normalized) return null;

  for (const rule of rules) {
    for (const matcher of rule.matchers) {
      const normalizedMatcher = 标准化字符串(matcher);
      if (normalized.includes(normalizedMatcher) || normalizedMatcher.includes(normalized)) {
        return rule;
      }
    }
  }
  return null;
}

/**
 * 将表头与日常回路配置匹配（优先级：配置 > 注册表）
 * 先尝试用配置的 name 精确匹配，再回退到注册表关键词匹配
 */
export function 匹配表头到日常配置(
  header: string | number,
  日常回路配置: DailyFieldConfig[],
  rules: 导入字段匹配规则[] = DEFAULT_IMPORT_FIELD_RULES,
): { fieldId: string; category: string; displayName: string } | null {
  const normalized = 标准化字符串(header);
  if (!normalized) return null;

  // 策略1: 直接匹配日常配置中的 name 或 id
  for (const field of 日常回路配置) {
    if (
      标准化字符串(field.name) === normalized ||
      标准化字符串(field.id) === normalized
    ) {
      return {
        fieldId: field.id,
        category: field.category,
        displayName: field.name,
      };
    }
  }

  // 策略2: 包含式匹配日常配置 name
  for (const field of 日常回路配置) {
    const nameNorm = 标准化字符串(field.name);
    if (nameNorm && (normalized.includes(nameNorm) || nameNorm.includes(normalized))) {
      return {
        fieldId: field.id,
        category: field.category,
        displayName: field.name,
      };
    }
  }

  // 策略3: 回退到注册表关键词匹配
  const ruleMatch = 匹配表头到字段规则(header, rules);
  if (ruleMatch) {
    // 若匹配到注册表规则，进一步检查是否在日常配置中存在同 ID 的字段
    const foundInConfig = 日常回路配置.find((f) => f.id === ruleMatch.fieldId);
    if (foundInConfig) {
      return {
        fieldId: foundInConfig.id,
        category: foundInConfig.category,
        displayName: foundInConfig.name,
      };
    }
    // 即使日常配置中没有此字段，也允许导入（作为新字段动态注入）
    return {
      fieldId: ruleMatch.fieldId,
      category: ruleMatch.category,
      displayName: ruleMatch.displayName,
    };
  }

  return null;
}

/**
 * 判断某个单元格是否为日期列
 * 要求：必须是精确匹配或短文本匹配，避免把标题行误识别为日期列
 */
export function 判断是否日期列(header: string | number): boolean {
  const normalized = 标准化字符串(header);
  if (!normalized) return false;
  
  // 日期列应该是简短的词，长度不超过10个字符
  if (normalized.length > 10) return false;
  
  // 精确匹配日期关键词
  const exactMatches = ["日期", "date", "day", "日期列", "抄表日期", "记录日期"];
  if (exactMatches.some((k) => normalized === 标准化字符串(k))) {
    return true;
  }
  
  // 包含式匹配（仅对短关键词）
  const shortKeywords = ["日", "时间"];
  for (const kw of shortKeywords) {
    if (normalized.includes(标准化字符串(kw))) {
      // 但排除单独的"日"字在数字后面的情况（如"31日"）
      // 以及排除长文本中包含"日"的情况（已通过长度检查）
      return true;
    }
  }
  
  return false;
}

/**
 * 根据标题行识别整表的能耗类型
 */
export function 从标题识别能耗类型(title: string): "电" | "水" | "气" | null {
  const normalized = 标准化字符串(title);
  for (const rule of 标题能耗类型识别) {
    for (const keyword of rule.keywords) {
      if (normalized.includes(标准化字符串(keyword))) {
        return rule.type;
      }
    }
  }
  return null;
}

/**
 * 判断某行是否为表底（初始读数）行
 */
export function 判断是否表底行(row: (string | number)[]): boolean {
  for (const cell of row) {
    const normalized = 标准化字符串(cell);
    if (!normalized) continue;
    if (表底行匹配关键词.some((k) => normalized.includes(标准化字符串(k)))) {
      return true;
    }
  }
  return false;
}
