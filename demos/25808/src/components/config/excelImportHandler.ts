/**
 * ============================================================
 * 通用化 Excel/CSV 导入处理器
 * ============================================================
 *
 * 设计目标：
 * 1. 不再硬编码 row[1]=李体线电表 这类字段位置
 * 2. 基于日常回路配置 + 字段匹配注册表 动态识别列
 * 3. 优先精确匹配日常回路配置中的 name/id —— 用户修改 Excel 表头
 *    与配置一致即可自动对应
 * 4. 整合异常检测与导入预览流程
 */

import * as XLSX from "xlsx";
import { 抄表记录, 单价变动事件, 字典配置, DailyFieldConfig } from "../../shared/types";
import {
  匹配表头到日常配置,
  判断是否日期列,
  从标题识别能耗类型,
  判断是否表底行,
  标准化字符串,
  匹配表头到字段规则,
} from "../../shared/constants/importFieldRegistry";
import {
  检测导入数据异常,
  异常记录,
} from "../../shared/utils/anomalyDetection";

export interface 列映射结果 {
  columnIndex: number;
  header: string;
  fieldId: string | null;
  category: string;
  displayName: string;
  isDateColumn: boolean;
}

export interface 解析结果 {
  success: boolean;
  records: 抄表记录[];
  单价事件: 单价变动事件[];
  表头?: (string | number)[];
  年份?: number;
  月份?: number;
  标题?: string;
  能耗类型?: "电" | "水" | "气" | null;
  列映射: 列映射结果[];
  异常: 异常记录[];
  信息: string;
}

// ============================================================
// 基础工具函数
// ============================================================

/** 解析 Excel 单元格中的日期，统一成 YYYY-MM-DD 格式 */
function 解析日期单元格(val: any, year: number, month: number): string {
  if (val === undefined || val === null || val === "") return "";

  // Excel 序列号日期
  if (typeof val === "number" && val > 30000) {
    const dObj = new Date(Math.round((val - 25569) * 86400) * 1000);
    const y = dObj.getUTCFullYear();
    const m = String(dObj.getUTCMonth() + 1).padStart(2, "0");
    const d = String(dObj.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const sVal = String(val).trim();

  // 格式: "5月1日" / "5月1号"
  const mChinese = sVal.match(/^(\d{1,2})\s*[月\-]\s*(\d{1,2})\s*[日号]?$/);
  if (mChinese) {
    const mm = mChinese[1].padStart(2, "0");
    const dd = mChinese[2].padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }

  // 格式: YYYY-MM-DD / YYYY/M/D
  if (sVal.includes("-") || sVal.includes("/")) {
    const parts = sVal.split(/[-/]/);
    if (parts.length === 3) {
      const yPart = parts[0].length === 4 ? parts[0] : `${year}`.slice(0, 4 - parts[0].length) + parts[0];
      const mPart = parts[1].padStart(2, "0");
      const dPart = parts[2].padStart(2, "0");
      return `${yPart}-${mPart}-${dPart}`;
    } else if (parts.length === 2) {
      return `${year}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
    }
  }

  // 格式: 纯数字 "1" / "15" / "31"  ——  理解为当月日期
  if (/^\d{1,2}$/.test(sVal)) {
    const n = Number(sVal);
    if (n >= 1 && n <= 31) {
      return `${year}-${String(month).padStart(2, "0")}-${sVal.padStart(2, "0")}`;
    }
  }

  // Date 对象
  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return "";
}

/** 根据标题行提取年月信息 */
function 解析标题年月(title: string): { year: number; month: number } {
  const now = new Date();
  const m = title.match(/(\d{4})\s*年?\s*(\d{1,2})\s*月?/);
  if (m) {
    return { year: parseInt(m[1], 10), month: parseInt(m[2], 10) };
  }
  const m2 = title.match(/(\d{4})[\-\/](\d{1,2})/);
  if (m2) {
    return { year: parseInt(m2[1], 10), month: parseInt(m2[2], 10) };
  }
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** 解析数字单元格（读数值） */
function 解析数字单元格(val: any): number | string {
  if (val === undefined || val === null || val === "") return "";
  const strVal = String(val).replace(/[,，\s]/g, "").trim();
  if (strVal === "" || strVal === "-" || strVal === "--") return "";
  const num = Number(strVal);
  return isNaN(num) ? "" : num;
}

// ============================================================
// 表头定位与识别
// ============================================================

/**
 * 智能定位表头行
 *
 * 策略（按用户需求调整）：
 * 1. 优先寻找：某一行的单元格与 日常回路配置 的 name 或 id 精确匹配
 *    -> 用户把 Excel 表头改成配置里的字段名，立即命中
 * 2. 其次：行中同时包含"日期列关键词"和匹配到配置/注册表字段
 * 3. 识别双行表头（电表名称行 + 列类型行）
 */
function 智能定位表头行(
  rows: any[][],
  日常回路配置: DailyFieldConfig[],
): { headerRowIdx: number; subHeaderRowIdx: number; isDoubleRow: boolean } {
  // 扫描前 20 行
  const scanLimit = Math.min(rows.length, 20);

  // ── 策略1：精确匹配日常回路配置中的字段名 ──
  for (let i = 0; i < scanLimit; i++) {
    const row = rows[i] || [];
    let 精确匹配数 = 0;
    let 发现日期列 = false;

    for (const cell of row) {
      const cellStr = String(cell || "");
      if (判断是否日期列(cellStr)) {
        发现日期列 = true;
        continue;
      }
      const normalized = 标准化字符串(cellStr);
      if (!normalized) continue;
      // 精确匹配配置中的 name / id
      const hit = 日常回路配置.some(
        (f) =>
          标准化字符串(f.name) === normalized ||
          标准化字符串(f.id) === normalized,
      );
      if (hit) 精确匹配数++;
      // 或匹配注册表关键词
      else if (匹配表头到字段规则(cellStr)) {
        精确匹配数++;
      }
    }

    if (精确匹配数 > 0 && 发现日期列) {
      // 检查下一行是否为"用量/用电量"等列类型行（双行表头迹象）
      const nextRow = rows[i + 1] || [];
      const nextRow有列类型 = nextRow.some((c: any) => {
        const ns = 标准化字符串(c);
        return ["用量", "用电量", "度数", "单价", "费用", "元", "kwh", "千瓦时", "读数"].some(
          (kw) => ns.includes(标准化字符串(kw)),
        );
      });
      if (nextRow有列类型) {
        return { headerRowIdx: i, subHeaderRowIdx: i + 1, isDoubleRow: true };
      }
      return { headerRowIdx: i, subHeaderRowIdx: -1, isDoubleRow: false };
    }

    // 只有字段匹配，没有日期 —— 也许日期列在下一行（双行表头）
    if (精确匹配数 >= 2) {
      const nextRow = rows[i + 1] || [];
      const nextRow有日期 = nextRow.some((c: any) => 判断是否日期列(String(c || "")));
      const nextRow有列类型 = nextRow.some((c: any) => {
        const ns = 标准化字符串(c);
        return ["用量", "用电量", "度数", "单价", "费用", "元", "kwh", "千瓦时", "读数"].some(
          (kw) => ns.includes(标准化字符串(kw)),
        );
      });
      if (nextRow有列类型 || nextRow有日期) {
        return { headerRowIdx: i, subHeaderRowIdx: i + 1, isDoubleRow: true };
      }
    }
  }

  // ── 策略2：包含式模糊匹配 ──
  for (let i = 0; i < scanLimit; i++) {
    const row = rows[i] || [];
    let 命中字段 = false;
    let 发现日期列 = false;

    for (const cell of row) {
      const cellStr = String(cell || "");
      if (判断是否日期列(cellStr)) {
        发现日期列 = true;
        continue;
      }
      if (匹配表头到日常配置(cell, 日常回路配置)) {
        命中字段 = true;
      }
    }

    if (命中字段 && 发现日期列) {
      const nextRow = rows[i + 1] || [];
      const nextRow有列类型 = nextRow.some((c: any) => {
        const ns = 标准化字符串(c);
        return ["用量", "用电量", "度数", "单价", "费用", "元", "kwh", "千瓦时", "读数"].some(
          (kw) => ns.includes(标准化字符串(kw)),
        );
      });
      if (nextRow有列类型) {
        return { headerRowIdx: i, subHeaderRowIdx: i + 1, isDoubleRow: true };
      }
      return { headerRowIdx: i, subHeaderRowIdx: -1, isDoubleRow: false };
    }
  }

  return { headerRowIdx: -1, subHeaderRowIdx: -1, isDoubleRow: false };
}

// ============================================================
// 单行表头解析
// ============================================================

function 表头驱动解析(
  rows: any[][],
  headerRow: (string | number)[],
  年份: number,
  月份: number,
  日常回路配置: DailyFieldConfig[],
  手动映射?: Record<number, string>,
): { records: 抄表记录[]; 列映射: 列映射结果[] } {
  // ── 构建每列的映射 ──
  const 列映射: 列映射结果[] = headerRow.map((cell, idx) => {
    const header = String(cell || "");

    // 日期列
    if (判断是否日期列(header)) {
      return {
        columnIndex: idx,
        header,
        fieldId: "__date__",
        category: "",
        displayName: "日期",
        isDateColumn: true,
      };
    }

    // 手动映射模式
    if (手动映射 && 手动映射[idx]) {
      return {
        columnIndex: idx,
        header,
        fieldId: 手动映射[idx],
        category: "",
        displayName: 手动映射[idx],
        isDateColumn: false,
      };
    }

    // 策略1：匹配日常配置（优先精确匹配 name/id）
    const matched = 匹配表头到日常配置(cell, 日常回路配置);
    if (matched) {
      return {
        columnIndex: idx,
        header,
        fieldId: matched.fieldId,
        category: matched.category,
        displayName: matched.displayName,
        isDateColumn: false,
      };
    }

    return {
      columnIndex: idx,
      header,
      fieldId: null,
      category: "",
      displayName: header,
      isDateColumn: false,
    };
  });

  // ── 解析数据行 ──
  const records: 抄表记录[] = [];
  const dataStartIdx = rows.indexOf(headerRow as any[]) + 1;

  for (let r = dataStartIdx; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const dateCol = 列映射.find((c) => c.isDateColumn);
    if (!dateCol) continue;

    const cleanDate = 解析日期单元格(row[dateCol.columnIndex], 年份, 月份);
    if (!cleanDate || isNaN(Date.parse(cleanDate))) continue;

    const firstCellText = String(row[0] || "");
    if (
      firstCellText.includes("合计") ||
      firstCellText.includes("小计") ||
      firstCellText.includes("总计")
    ) {
      continue;
    }

    const itemData: 抄表记录 = { 日期: cleanDate };
    let hasAnyValue = false;

    for (const col of 列映射) {
      if (col.isDateColumn || !col.fieldId) continue;
      const val = 解析数字单元格(row[col.columnIndex]);
      if (val !== "") {
        (itemData as any)[col.fieldId] = val;
        hasAnyValue = true;
      }
    }

    if (hasAnyValue) records.push(itemData);
  }

  return { records, 列映射 };
}

// ============================================================
// 双行合并表头解析
// ============================================================

/**
 * 检测双行合并表头：
 *   topRow    = 电表名称行（如：李体线电表 / 午沙线电表）
 *   bottomRow = 列类型行（如：用量 / 用电量 / 度数 / 单价）
 *
 * 识别规则：
 *   1. topRow 的单元格精确匹配日常配置 name/id → 视为电表
 *   2. bottomRow 含有"用量/用电量/度数/读数/kwh"等关键词 → 视为读数列
 *   3. 其他辅助列（单价/费用）跳过
 */
function 检测双行合并表头(
  topRow: (string | number)[],
  bottomRow: (string | number)[],
  日常回路配置: DailyFieldConfig[],
): { fieldId: string | null; isDateColumn: boolean; displayName: string }[] {
  const result: { fieldId: string | null; isDateColumn: boolean; displayName: string }[] = [];
  let currentMeter: { fieldId: string; displayName: string; category: string } | null = null;

  const 读数列关键词 = ["用量", "用电量", "度数", "度", "读数", "表底", "kwh", "千瓦时", "number", "value"];
  const 辅助列关键词 = ["单价", "费用", "金额", "元", "price", "cost"];

  for (let idx = 0; idx < Math.max(topRow.length, bottomRow.length); idx++) {
    const topCell = String(topRow[idx] || "");
    const bottomCell = String(bottomRow[idx] || "");
    const topNorm = 标准化字符串(topCell);
    const bottomNorm = 标准化字符串(bottomCell);

    // 日期列
    if (判断是否日期列(topCell) || 判断是否日期列(bottomCell)) {
      result.push({ fieldId: "__date__", isDateColumn: true, displayName: "日期" });
      continue;
    }

    // topCell 精确匹配配置字段 → 当前电表切换
    let 当前电表命中: { fieldId: string; displayName: string; category: string } | null = null;

    if (topNorm) {
      const 配置命中 = 日常回路配置.find(
        (f) =>
          标准化字符串(f.name) === topNorm ||
          标准化字符串(f.id) === topNorm,
      );
      if (配置命中) {
        当前电表命中 = {
          fieldId: 配置命中.id,
          displayName: 配置命中.name,
          category: 配置命中.category,
        };
      } else {
        const 规则命中 = 匹配表头到字段规则(topCell);
        if (规则命中) {
          当前电表命中 = {
            fieldId: 规则命中.fieldId,
            displayName: 规则命中.displayName,
            category: 规则命中.category,
          };
        }
      }
    }

    // bottomCell 也可能包含字段名（某些表格表头位于第二行）
    if (!当前电表命中 && bottomNorm) {
      const 配置命中 = 日常回路配置.find(
        (f) =>
          标准化字符串(f.name) === bottomNorm ||
          标准化字符串(f.id) === bottomNorm,
      );
      if (配置命中) {
        当前电表命中 = {
          fieldId: 配置命中.id,
          displayName: 配置命中.name,
          category: 配置命中.category,
        };
      }
    }

    if (当前电表命中) {
      currentMeter = 当前电表命中;

      // 判断本列是"电表名称列"还是"电表读数列"
      const bottom是读数列 = 读数列关键词.some((kw) => bottomNorm.includes(标准化字符串(kw)));

      if (bottom是读数列 || !bottomCell) {
        // 这一列就是电表的读数列
        result.push({
          fieldId: currentMeter.fieldId,
          isDateColumn: false,
          displayName: currentMeter.displayName,
        });
      } else {
        // 这一列是电表名称，实际读数在右侧列 —— 仍作为该电表的一列处理
        result.push({
          fieldId: currentMeter.fieldId,
          isDateColumn: false,
          displayName: `${currentMeter.displayName}(${bottomCell || topCell})`,
        });
      }
      continue;
    }

    // 当前列属于前面一个电表（合并表头覆盖）
    if (currentMeter) {
      const 是读数列 = 读数列关键词.some(
        (kw) => bottomNorm.includes(标准化字符串(kw)) || topNorm.includes(标准化字符串(kw)),
      );
      const 是辅助列 = 辅助列关键词.some(
        (kw) => bottomNorm.includes(标准化字符串(kw)) || topNorm.includes(标准化字符串(kw)),
      );

      if (是读数列) {
        result.push({
          fieldId: currentMeter.fieldId,
          isDateColumn: false,
          displayName: currentMeter.displayName,
        });
        continue;
      }
      if (是辅助列) {
        result.push({ fieldId: null, isDateColumn: false, displayName: bottomCell || topCell });
        continue;
      }
    }

    // 空单元格或未识别
    result.push({ fieldId: null, isDateColumn: false, displayName: bottomCell || topCell });
  }

  return result;
}

// ============================================================
// 单价事件解析
// ============================================================

function 解析单价事件(rows: any[][]): 单价变动事件[] {
  const events: 单价变动事件[] = [];
  const 已处理 = new Set<number>();

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;

    const headerCellIdx = row.findIndex((c: any) => {
      const s = 标准化字符串(c);
      return (
        s.includes("电费单价") ||
        s.includes("水费单价") ||
        s.includes("气费单价") ||
        s.includes("单价")
      );
    });

    if (headerCellIdx >= 0 && !已处理.has(r)) {
      已处理.add(r);
      const 事件行 = rows[r + 1];
      if (!事件行) continue;
      已处理.add(r + 1);

      const newEvent: 单价变动事件 = {
        id: Math.random().toString(36).substring(7),
        生效日期: String(事件行[0] || ""),
        电费单价: Number(事件行[1] || 0),
        水费单价: Number(事件行[2] || 0),
        气费单价: Number(事件行[3] || 0),
        操作人: "系统导入",
      };

      if (newEvent.生效日期) events.push(newEvent);
    }
  }

  return events;
}

// ============================================================
// 主入口：解析 Excel
// ============================================================

export function 解析导入文件(
  file: File,
  日常回路配置: DailyFieldConfig[],
  配置输入: 字典配置,
  历史数据: 抄表记录[] = [],
): Promise<解析结果> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        if (workbook.SheetNames.length === 0) {
          resolve({
            success: false,
            records: [],
            单价事件: [],
            列映射: [],
            异常: [],
            信息: "文件中没有工作表",
          });
          return;
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (rows.length < 2) {
          resolve({
            success: false,
            records: [],
            单价事件: [],
            列映射: [],
            异常: [],
            信息: "工作表数据不足",
          });
          return;
        }

        // 解析标题和年月
        const title = String(rows[0]?.[0] || "");
        const { year, month } = 解析标题年月(title);
        const 能耗类型 = 从标题识别能耗类型(title);

        // 解析单价事件
        const 单价事件 = 解析单价事件(rows);

        // === 智能定位表头行 ===
        const { headerRowIdx, subHeaderRowIdx, isDoubleRow } = 智能定位表头行(rows, 日常回路配置);

        let records: 抄表记录[] = [];
        let 列映射: 列映射结果[] = [];

        if (headerRowIdx >= 0) {
          if (isDoubleRow && subHeaderRowIdx >= 0) {
            // ── 双行合并表头 ──
            const topRow = rows[headerRowIdx] as (string | number)[];
            const bottomRow = rows[subHeaderRowIdx] as (string | number)[];
            const 列检测结果 = 检测双行合并表头(topRow, bottomRow, 日常回路配置);
            列映射 = 列检测结果.map((col, idx) => ({
              columnIndex: idx,
              header: col.displayName,
              fieldId: col.fieldId,
              category: "",
              displayName: col.displayName,
              isDateColumn: col.isDateColumn,
            }));

            const dataStartIdx = subHeaderRowIdx + 1;
            for (let r = dataStartIdx; r < rows.length; r++) {
              const row = rows[r];
              if (!row || row.length === 0) continue;

              let cleanDate = "";
              for (let c = 0; c < 列映射.length; c++) {
                if (列映射[c].isDateColumn) {
                  const dateVal = 解析日期单元格(row[c], year, month);
                  if (dateVal) cleanDate = dateVal;
                  break;
                }
              }

              if (!cleanDate) continue;

              const firstCellText = String(row[0] || "");
              if (
                firstCellText.includes("合计") ||
                firstCellText.includes("总计") ||
                firstCellText.includes("小计")
              ) {
                continue;
              }
              if (判断是否表底行(row)) continue;

              const itemData: 抄表记录 = { 日期: cleanDate };
              let hasAnyValue = false;

              for (let c = 0; c < 列映射.length; c++) {
                const col = 列映射[c];
                if (col.isDateColumn || !col.fieldId) continue;
                const val = 解析数字单元格(row[c]);
                if (val !== "") {
                  (itemData as any)[col.fieldId] = val;
                  hasAnyValue = true;
                }
              }

              if (hasAnyValue) records.push(itemData);
            }
          } else {
            // ── 标准单行表头 ──
            const headerRow = rows[headerRowIdx] as (string | number)[];
            const result = 表头驱动解析(rows, headerRow, year, month, 日常回路配置);
            records = result.records;
            列映射 = result.列映射;
          }
        } else {
          // ── 策略 A 回退：按旧版本结构化模板解析 ──
          if (能耗类型) {
            let baseRow: any[] | null = null;
            let baseRowIdx = -1;
            for (let i = 1; i < Math.min(rows.length, 6); i++) {
              if (判断是否表底行(rows[i] || [])) {
                baseRow = rows[i];
                baseRowIdx = i;
                break;
              }
            }

            const targetFields = 日常回路配置.filter((f) => f.category === 能耗类型);

            if (baseRow && baseRowIdx >= 0) {
              const baseItem: 抄表记录 = {
                日期: `${year}-${String(month).padStart(2, "0")}-00-fallback`,
              };
              let fieldCursor = 0;
              for (let c = 1; c < baseRow.length && fieldCursor < targetFields.length; c++) {
                const val = 解析数字单元格(baseRow[c]);
                if (val !== "") {
                  (baseItem as any)[targetFields[fieldCursor].id] = val;
                  fieldCursor++;
                }
              }

              for (let r = baseRowIdx + 1; r < rows.length; r++) {
                const row = rows[r];
                if (!row || row.length === 0) continue;
                const cleanDate = 解析日期单元格(row[0], year, month);
                if (!cleanDate || isNaN(Date.parse(cleanDate))) continue;

                const itemData: 抄表记录 = { 日期: cleanDate };
                let hasAnyValue = false;
                fieldCursor = 0;
                for (let c = 1; c < row.length && fieldCursor < targetFields.length; c++) {
                  const val = 解析数字单元格(row[c]);
                  if (val !== "") {
                    (itemData as any)[targetFields[fieldCursor].id] = val;
                    hasAnyValue = true;
                  }
                  fieldCursor++;
                }
                if (hasAnyValue) records.push(itemData);
              }

              列映射 = targetFields.map((f, i) => ({
                columnIndex: i + 1,
                header: f.name,
                fieldId: f.id,
                category: f.category,
                displayName: f.name,
                isDateColumn: false,
              }));
              列映射.unshift({
                columnIndex: 0,
                header: "日期",
                fieldId: "__date__",
                category: "",
                displayName: "日期",
                isDateColumn: true,
              });
            }
          }
        }

        // 异常检测
        const 检测结果 = 检测导入数据异常(records, 配置输入, 日常回路配置, 历史数据);
        const anomalyList = 检测结果.anomalies;

        resolve({
          success: records.length > 0,
          records,
          单价事件,
          表头: headerRowIdx >= 0 ? rows[headerRowIdx] : undefined,
          年份: year,
          月份: month,
          标题: title,
          能耗类型,
          列映射,
          异常: anomalyList,
          信息:
            records.length === 0
              ? `无法从文件中解析到任何有效抄表记录。请检查：表头是否与"日常表字段"配置中 name 一致？是否有日期列？`
              : `成功解析 ${records.length} 条记录`,
        });
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsArrayBuffer(file);
  });
}

// ============================================================
// 向后兼容：保留原函数签名，供现有调用点使用
// ============================================================

export function handleImportDailyExcel(
  file: File,
  历史数据: 抄表记录[],
  日常回路配置: DailyFieldConfig[],
  更新抄表数据: (新数据: 抄表记录[]) => void,
  配置输入: 字典配置,
  openAlert: (title: string, message: string) => void,
  openConfirm: (title: string, message: string, onConfirm: () => void) => void,
) {
  解析导入文件(file, 日常回路配置, 配置输入, 历史数据)
    .then((result) => {
      if (!result.success || result.records.length === 0) {
        openAlert("导入失败", result.信息 || "未能从文件中解析到任何抄表记录");
        return;
      }

      const highCount = result.异常.filter((a) => a.severity === "high").length;
      const mediumCount = result.异常.filter((a) => a.severity === "medium").length;
      let warningText = "";
      if (highCount > 0 || mediumCount > 0) {
        warningText = `检测到 ${highCount} 项严重异常和 ${mediumCount} 项一般异常，请在导入后核对数据。`;
      }

      openConfirm(
        "批量合并入库确认",
        `系统从 Excel 中成功识别 ${result.records.length} 天的抄表读数。${warningText}冲突日期将彻底合并补录。是否确认写入数仓？`,
        () => {
          const currentMap = new Map<string, 抄表记录>(
            历史数据.map((item) => [item.日期, item]),
          );
          result.records.forEach((newItem) => {
            const oldItem = currentMap.get(newItem.日期);
            if (oldItem) {
              currentMap.set(newItem.日期, { ...oldItem, ...newItem });
            } else {
              currentMap.set(newItem.日期, newItem);
            }
          });
          const sortedList = Array.from(currentMap.values()).sort(
            (a, b) => new Date(a.日期).getTime() - new Date(b.日期).getTime(),
          );
          更新抄表数据(sortedList);
          openAlert("批量导入成功", `成功融合写入 ${result.records.length} 条日常抄表。`);
        },
      );
    })
    .catch((err: any) => {
      openAlert("导入异常", "解析文件出错：" + (err?.message || String(err)));
    });
}

// ============================================================
// 解析 CSV
// ============================================================

export function 解析日常CSV(
  text: string,
  日常回路配置: DailyFieldConfig[],
  配置输入: 字典配置,
  历史数据: 抄表记录[] = [],
): 解析结果 {
  const lines = text.split(/\r?\n/);
  const rows: string[][] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        cells.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    cells.push(current.trim());
    rows.push(cells);
  }

  let headerRowIdx = -1;
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const row = rows[i] || [];
    for (const cell of row) {
      if (判断是否日期列(cell)) {
        headerRowIdx = i;
        break;
      }
    }
    if (headerRowIdx >= 0) break;
  }

  if (headerRowIdx < 0) {
    return {
      success: false,
      records: [],
      单价事件: [],
      列映射: [],
      异常: [],
      信息: "CSV 中未找到可识别的日期列",
    };
  }

  const now = new Date();
  const headerRow = rows[headerRowIdx];
  const { records, 列映射 } = 表头驱动解析(
    rows,
    headerRow,
    now.getFullYear(),
    now.getMonth() + 1,
    日常回路配置,
  );

  const 检测结果 = 检测导入数据异常(records, 配置输入, 日常回路配置, 历史数据);
  return {
    success: records.length > 0,
    records,
    单价事件: [],
    表头: headerRow,
    年份: now.getFullYear(),
    月份: now.getMonth() + 1,
    列映射,
    异常: 检测结果.anomalies,
    信息: records.length > 0 ? `成功解析 ${records.length} 条记录` : "未解析到任何记录",
  };
}
