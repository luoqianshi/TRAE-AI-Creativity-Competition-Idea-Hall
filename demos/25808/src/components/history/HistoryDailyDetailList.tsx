import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Archive, Calculator, AlertTriangle } from "lucide-react";
import { DailyFieldConfig, 抄表记录, 字典配置 } from "../../shared/types";
import { getPrice } from "../../shared/utils/pricing";
import { useGasGroups } from "../../shared/hooks/useGasGroups";
import {
  getElectricUsageAndKwh,
  getWaterUsageAndCost,
  getGasUsageAndCost,
  getDailyTotalElectric,
  getDailyTotalWater,
  getDailyTotalGas,
} from "./historyCalculations";
import {
  buildHistoryColumns,
  HistoryColumn,
  ColumnKind,
} from "./historyColumnBuilder";
import { getCategoryHeaderStyles, getCategoryCellStyles } from "./historyTableStyles";
import { 异常记录 } from "../../shared/utils/anomalyDetection";
import { 检测导入数据异常 } from "../../shared/utils/anomalyDetection";

interface HistoryDailyDetailListProps {
  历史数据: 抄表记录[];
  更新抄表数据: (新数据: 抄表记录[]) => void;
  selectedMonth: string;
  日常回路配置: DailyFieldConfig[];
  限额配置: 字典配置;
}

// ─────────────────────────────────────────────
// 类型
// ─────────────────────────────────────────────

type Tab = "电" | "水" | "气";

interface CellResult {
  display: string;   // 表格显示文本
  raw: unknown;      // 原始值（供 input value 使用）
  anomaly: 异常记录[];
}

interface 编辑状态 {
  data: Map<string, 抄表记录>;
  dirty: boolean;
}

// ─────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────

/** 判断列是否可编辑（原始读数输入列） */
function isMeterReading(kind: ColumnKind): boolean {
  return kind === "meter_reading";
}

/** 判断列是否为公式列（自动计算，不可编辑） */
function isFormula(kind: ColumnKind): boolean {
  return (
    kind === "meter_usage" ||
    kind === "meter_kwh" ||
    kind === "meter_price" ||
    kind === "meter_cost" ||
    kind === "category_total_kwh" ||
    kind === "category_total_cost" ||
    kind === "category_total_water_usage" ||
    kind === "category_total_water_cost" ||
    kind === "category_total_gas_usage" ||
    kind === "category_total_gas_cost" ||
    kind === "gas_group_usage"
  );
}

/** 构建单元格唯一 key */
function cellKey(fieldId: string, date: string): string {
  return `${fieldId}◆${date}`;
}

/** 获取本月的所有日期字符串列表 */
function getMonthDays(year: number, month: number): string[] {
  const days = new Date(year, month, 0).getDate();
  return Array.from({ length: days }, (_, i) => {
    const d = i + 1;
    return `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  });
}

/** 获取上月最后一天（"上结"行用） */
function getPrevMonthLastDay(year: number, month: number): string {
  const lastDay = new Date(year, month - 1, 0);
  return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
}

/** 判断是否有任何有效数据（除了日期字段） */
function hasAnyReading(record: 抄表记录): boolean {
  return Object.entries(record).some(([k, v]) => k !== "日期" && v !== undefined && v !== null && v !== "");
}

/** 将本地 Map 转换为抄表记录数组 */
function mapToRecords(data: Map<string, 抄表记录>): 抄表记录[] {
  const records: 抄表记录[] = [];
  data.forEach((record) => {
    if (hasAnyReading(record)) records.push({ ...record });
  });
  return records.sort((a, b) => new Date(a.日期).getTime() - new Date(b.日期).getTime());
}

// ─────────────────────────────────────────────
// 计算函数
// ─────────────────────────────────────────────

function calcCell(
  kind: ColumnKind,
  date: string,
  data: Map<string, 抄表记录>,
  限额配置: 字典配置,
  回路配置: DailyFieldConfig[],
  parentFieldId?: string,
): CellResult {
  const item = data.get(date);

  switch (kind) {
    case "meter_reading": {
      const raw = item ? (item[parentFieldId!] as string | number | undefined) : undefined;
      if (raw === undefined || (raw as unknown) === null || raw === "") {
        return { display: "", raw: undefined, anomaly: [] };
      }
      return { display: Number(raw).toFixed(2), raw, anomaly: [] };
    }
    case "meter_kwh": {
      const r = getElectricUsageAndKwh(date, parentFieldId!, data, 限额配置);
      if (r.kwh === undefined) return { display: "—", raw: undefined, anomaly: [] };
      return { display: r.kwh.toFixed(0), raw: r.kwh, anomaly: [] };
    }
    case "meter_price": {
      const cat = parentFieldId ? 回路配置.find((f) => f.id === parentFieldId)?.category : undefined;
      let price: number | undefined;
      if (cat === "电") {
        const r = getElectricUsageAndKwh(date, parentFieldId!, data, 限额配置);
        price = r.price;
      } else if (cat === "水") {
        const r = getWaterUsageAndCost(date, parentFieldId!, data, 限额配置);
        price = r.price;
      } else if (cat === "气") {
        const r = getGasUsageAndCost(date, parentFieldId!, data, 限额配置);
        price = r.price;
      }
      if (price === undefined) return { display: "—", raw: undefined, anomaly: [] };
      return { display: price.toFixed(2), raw: price, anomaly: [] };
    }
    case "meter_cost": {
      const cat = parentFieldId ? 回路配置.find((f) => f.id === parentFieldId)?.category : undefined;
      let cost: number | undefined;
      if (cat === "电") {
        const r = getElectricUsageAndKwh(date, parentFieldId!, data, 限额配置);
        cost = r.cost;
      } else if (cat === "水") {
        const r = getWaterUsageAndCost(date, parentFieldId!, data, 限额配置);
        cost = r.cost;
      } else if (cat === "气") {
        const r = getGasUsageAndCost(date, parentFieldId!, data, 限额配置);
        cost = r.cost;
      }
      if (cost === undefined) return { display: "—", raw: undefined, anomaly: [] };
      return { display: cost.toFixed(2), raw: cost, anomaly: [] };
    }
    case "meter_usage": {
      const cat = parentFieldId ? 回路配置.find((f) => f.id === parentFieldId)?.category : undefined;
      if (cat === "电") {
        const r = getElectricUsageAndKwh(date, parentFieldId!, data, 限额配置);
        if (r.usage === undefined) return { display: "—", raw: undefined, anomaly: [] };
        return { display: r.usage.toFixed(2), raw: r.usage, anomaly: [] };
      }
      if (cat === "水") {
        const r = getWaterUsageAndCost(date, parentFieldId!, data, 限额配置);
        if (r.usage === undefined) return { display: "—", raw: undefined, anomaly: [] };
        return { display: r.usage.toFixed(2), raw: r.usage, anomaly: [] };
      }
      if (cat === "气") {
        const r = getGasUsageAndCost(date, parentFieldId!, data, 限额配置);
        if (r.usage === undefined) return { display: "—", raw: undefined, anomaly: [] };
        return { display: r.usage.toFixed(2), raw: r.usage, anomaly: [] };
      }
      return { display: "—", raw: undefined, anomaly: [] };
    }
    case "category_total_kwh": {
      const r = getDailyTotalElectric(date, 回路配置, data, 限额配置);
      if (r.totalKwh === undefined) return { display: "—", raw: undefined, anomaly: [] };
      return { display: r.totalKwh.toFixed(0), raw: r.totalKwh, anomaly: [] };
    }
    case "category_total_cost": {
      const r = getDailyTotalElectric(date, 回路配置, data, 限额配置);
      if (r.totalCost === undefined) return { display: "—", raw: undefined, anomaly: [] };
      return { display: r.totalCost.toFixed(2), raw: r.totalCost, anomaly: [] };
    }
    case "category_total_water_usage": {
      const r = getDailyTotalWater(date, 回路配置, data, 限额配置);
      if (r.totalUsage === undefined) return { display: "—", raw: undefined, anomaly: [] };
      return { display: r.totalUsage.toFixed(2), raw: r.totalUsage, anomaly: [] };
    }
    case "category_total_water_cost": {
      const r = getDailyTotalWater(date, 回路配置, data, 限额配置);
      if (r.totalCost === undefined) return { display: "—", raw: undefined, anomaly: [] };
      return { display: r.totalCost.toFixed(2), raw: r.totalCost, anomaly: [] };
    }
    case "category_price": {
      const gasCircuits = 回路配置.filter(f => f.category === "气");
      const p = gasCircuits.length > 0
        ? (getPrice(gasCircuits[0].id, date, 限额配置, 回路配置).单价 || 限额配置.气费单价 || 0)
        : (限额配置.气费单价 || 0);
      if (p === undefined) return { display: "—", raw: undefined, anomaly: [] };
      return { display: p.toFixed(2), raw: p, anomaly: [] };
    }
    case "category_total_gas_usage": {
      const r = getDailyTotalGas(date, 回路配置, data, 限额配置);
      if (r.totalUsage === undefined) return { display: "—", raw: undefined, anomaly: [] };
      return { display: r.totalUsage.toFixed(2), raw: r.totalUsage, anomaly: [] };
    }
    case "category_total_gas_cost": {
      const r = getDailyTotalGas(date, 回路配置, data, 限额配置);
      if (r.totalCost === undefined) return { display: "—", raw: undefined, anomaly: [] };
      return { display: r.totalCost.toFixed(2), raw: r.totalCost, anomaly: [] };
    }
    case "gas_group_usage": {
      if (!parentFieldId) return { display: "—", raw: undefined, anomaly: [] };
      let usage = 0;
      回路配置.filter((f) => f.id === parentFieldId).forEach((f) => {
        const r = getGasUsageAndCost(date, f.id, data, 限额配置);
        if (r.usage !== undefined) usage += r.usage;
      });
      if (usage === 0) return { display: "—", raw: undefined, anomaly: [] };
      return { display: usage.toFixed(2), raw: usage, anomaly: [] };
    }
    default:
      return { display: "—", raw: undefined, anomaly: [] };
  }
}

// ─────────────────────────────────────────────
// 主组件
// ─────────────────────────────────────────────

export const HistoryDailyDetailList: React.FC<HistoryDailyDetailListProps> = ({
  历史数据,
  更新抄表数据,
  selectedMonth,
  日常回路配置,
  限额配置,
}) => {
  const { groups } = useGasGroups();
  const [activeTab, setActiveTab] = useState<Tab>("电");
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState<编辑状态>({ data: new Map(), dirty: false });
  const [showAnomalyOnly, setShowAnomalyOnly] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [focusedKey, setFocusedKey] = useState<string>("");

  // ── 派生数据 ──
  const [year, month] = selectedMonth.split("-").map(Number);
  const allDays = useMemo(() => getMonthDays(year, month), [year, month]);
  const prevMonthLastDay = useMemo(() => getPrevMonthLastDay(year, month), [year, month]);

  // 历史数据 → Map（只读浏览用）
  const historyMap = useMemo<Map<string, 抄表记录>>(
    () => new Map(历史数据.map((r) => [r.日期, r])),
    [历史数据],
  );

  // 当前展示用的数据：编辑模式用 localDataMap，否则用 historyMap
  const currentMap = isEditing ? editState.data : historyMap;

  // ── 异常检测 ──
  const anomalyMap = useMemo(() => {
    const m = new Map<string, Map<string, 异常记录[]>>();
    if (历史数据.length === 0) return m;
    const result = 检测导入数据异常(历史数据, 限额配置, 日常回路配置, []);
    for (const a of result.anomalies) {
      if (a.fieldId === "__date__") continue;
      if (!m.has(a.date)) m.set(a.date, new Map());
      const dayMap = m.get(a.date)!;
      if (!dayMap.has(a.fieldId)) dayMap.set(a.fieldId, []);
      dayMap.get(a.fieldId)!.push(a);
    }
    return m;
  }, [历史数据, 限额配置, 日常回路配置]);

  // ── 表格列定义 ──
  const allColumns = useMemo(
    () => buildHistoryColumns(日常回路配置, groups),
    [日常回路配置, groups],
  );

  // 按 tab 过滤列（缓存，避免 renderTable 内重复计算）
  const tabColumns = useMemo(() => {
    return allColumns.filter((c) => c.category === activeTab);
  }, [allColumns, activeTab]);

  // 只读模式下可编辑列为空；编辑模式下过滤出 meter_reading 列
  const editableColumns = useMemo(() => {
    if (!isEditing) return [];
    return tabColumns.filter((c) => isMeterReading(c.kind));
  }, [isEditing, tabColumns]);

  // ── 异常统计 ──
  const stats = useMemo(() => {
    let high = 0, medium = 0, filled = 0;
    for (const day of allDays) {
      const item = currentMap.get(day);
      if (item && hasAnyReading(item)) filled++;
      const dayMap = anomalyMap.get(day);
      if (dayMap) {
        for (const [, anoms] of dayMap) {
          for (const a of anoms) {
            if (a.severity === "high") high++;
            else if (a.severity === "medium") medium++;
          }
        }
      }
    }
    return { high, medium, filled, total: allDays.length };
  }, [allDays, currentMap, anomalyMap]);

  // ── 编辑操作 ──
  const startEdit = useCallback(() => {
    const newMap = new Map<string, 抄表记录>();
    historyMap.forEach((v, k) => newMap.set(k, { ...v } as 抄表记录));
    // 补齐本月每一天的空记录
    for (const d of allDays) {
      if (!newMap.has(d)) newMap.set(d, { 日期: d });
    }
    // 上结日也补
    if (!newMap.has(prevMonthLastDay)) newMap.set(prevMonthLastDay, { 日期: prevMonthLastDay });
    setEditState({ data: newMap, dirty: false });
    setIsEditing(true);
    setStatusMsg("提示：点击任一读数格可直接输入；Ctrl+V 粘贴整列数据（从 Excel 复制一列数值后粘贴）");
  }, [historyMap, allDays, prevMonthLastDay]);

  const cancelEdit = useCallback(() => {
    if (editState.dirty && !confirm("有未保存的修改，确定放弃？")) return;
    setIsEditing(false);
    setEditState({ data: new Map(), dirty: false });
    setFocusedKey("");
    setStatusMsg("");
  }, [editState.dirty]);

  const saveEdit = useCallback(() => {
    const validRecords = mapToRecords(editState.data);
    // 合并：保留非当月数据 + 当月有效记录
    const other = 历史数据.filter((r) => !r.日期.startsWith(selectedMonth));
    const merged = [...other, ...validRecords].sort(
      (a, b) => new Date(a.日期).getTime() - new Date(b.日期).getTime(),
    );
    更新抄表数据(merged);
    setIsEditing(false);
    setEditState({ data: new Map(), dirty: false });
    setFocusedKey("");
    setStatusMsg("保存成功！");
    setTimeout(() => setStatusMsg(""), 3000);
  }, [editState.data, 历史数据, selectedMonth, 更新抄表数据]);

  /** 写入单个格子的值 */
  const writeCell = useCallback(
    (fieldId: string, date: string, value: string) => {
      setEditState((prev) => {
        const next = new Map(prev.data);
        const item = { ...(next.get(date) || { 日期: date }) } as 抄表记录 & Record<string, unknown>;
        if (value === "") {
          delete item[fieldId];
        } else {
          item[fieldId] = value;
        }
        next.set(date, item as 抄表记录);
        return { data: next, dirty: true };
      });
    },
    [],
  );

  /** 粘贴处理：从 Excel 复制一列数据，自动向下填充 */
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>, startFieldId: string, startDate: string) => {
      e.preventDefault();
      e.stopPropagation();

      const text = e.clipboardData.getData("text");
      if (!text.trim()) return;

      // 按换行拆，过滤非数字行（保留小数点）
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.replace(/[\t,;\s]/g, "").trim())
        .filter((l) => l.length > 0 && !isNaN(Number(l)));

      if (lines.length === 0) {
        setStatusMsg("粘贴内容无效：请确保复制的是纯数字（每行一个数值）");
        setTimeout(() => setStatusMsg(""), 4000);
        return;
      }

      // 判断是否从上结行开始粘贴
      const isPrevMonthStart = !allDays.includes(startDate);
      let startIdx = allDays.indexOf(startDate);
      if (startIdx < 0) startIdx = 0;

      // 逐行写入
      const next = new Map(editState.data);
      let filled = 0;
      for (let i = 0; i < lines.length; i++) {
        // 如果是从上结行开始，第一个值放入上结行，其余从第一天开始
        let targetDate: string;
        if (isPrevMonthStart && i === 0) {
          targetDate = startDate;  // 上结行
        } else {
          const adjustedIdx = isPrevMonthStart ? i - 1 : startIdx + i;
          if (adjustedIdx < 0 || adjustedIdx >= allDays.length) break;
          targetDate = allDays[adjustedIdx];
        }

        const item = { ...(next.get(targetDate) || { 日期: targetDate }) } as 抄表记录 & Record<string, unknown>;
        item[startFieldId] = lines[i];
        next.set(targetDate, item as 抄表记录);
        filled++;
      }

      setEditState({ data: next, dirty: true });
      if (filled > 0) {
        const startDisplay = isPrevMonthStart ? startDate : allDays[startIdx];
        setStatusMsg(`已粘贴 ${filled} 个值到 "${日常回路配置.find((f) => f.id === startFieldId)?.name || startFieldId}"（从 ${startDisplay} 开始）`);
        setTimeout(() => setStatusMsg(""), 5000);
      }
    },
    [allDays, editState.data, 日常回路配置],
  );

  /** 清空当天所有读数 */
  const clearRow = useCallback((date: string) => {
    setEditState((prev) => {
      const next = new Map(prev.data);
      const item = next.get(date);
      if (item) {
        const newItem: 抄表记录 & Record<string, unknown> = { 日期: date };
        for (const k of Object.keys(item)) {
          if (k !== "日期") delete newItem[k];
        }
        next.set(date, newItem);
      }
      return { data: next, dirty: true };
    });
  }, []);

  /** 清空某列的所有读数 */
  const clearColumn = useCallback((fieldId: string) => {
    setEditState((prev) => {
      const next = new Map(prev.data);
      for (const d of allDays) {
        const item = next.get(d);
        if (item) {
          const newItem = { ...(item as 抄表记录 & Record<string, unknown>) };
          delete newItem[fieldId];
          next.set(d, newItem);
        }
      }
      return { data: next, dirty: true };
    });
  }, [allDays]);

  // ── 键盘导航 ──
  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, col: HistoryColumn, date: string) => {
      if (!isMeterReading(col.kind)) return;

      const colIdx = editableColumns.findIndex((c) => c.id === col.id);
      const dateIdx = allDays.indexOf(date);

      const moveTo = (newColIdx: number, newDateIdx: number) => {
        if (newColIdx < 0 || newColIdx >= editableColumns.length) return;
        if (newDateIdx < 0 || newDateIdx >= allDays.length) return;
        const key = cellKey(editableColumns[newColIdx].id, allDays[newDateIdx]);
        setFocusedKey(key);
      };

      if (e.key === "ArrowUp" && dateIdx > 0) {
        e.preventDefault();
        moveTo(colIdx, dateIdx - 1);
      } else if (e.key === "ArrowDown" && dateIdx < allDays.length - 1) {
        e.preventDefault();
        moveTo(colIdx, dateIdx + 1);
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          if (colIdx > 0) moveTo(colIdx - 1, dateIdx);
          else if (dateIdx > 0) moveTo(editableColumns.length - 1, dateIdx - 1);
        } else {
          if (colIdx < editableColumns.length - 1) moveTo(colIdx + 1, dateIdx);
          else if (dateIdx < allDays.length - 1) moveTo(0, dateIdx + 1);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (dateIdx < allDays.length - 1) moveTo(colIdx, dateIdx + 1);
      }
    },
    [editableColumns, allDays],
  );

  // 焦点移动
  useEffect(() => {
    if (!focusedKey) return;
    const el = document.querySelector<HTMLInputElement>(`[data-key="${focusedKey}"]`);
    if (el) { el.focus(); el.select(); }
  }, [focusedKey]);

  // ── 渲染单个单元格 ──
  const renderCell = (col: HistoryColumn, date: string): React.ReactNode => {
    const result = calcCell(col.kind, date, currentMap, 限额配置, 日常回路配置, col.parentFieldId);
    const isEditable = isEditing && isMeterReading(col.kind);
    const key = cellKey(col.id, date);

    const dayMap = anomalyMap.get(date);
    const cellAnomalies = dayMap?.get(col.parentFieldId || col.id) || [];
    const anomalyCls = isEditing
      ? ""
      : cellAnomalies.some((a) => a.severity === "high")
      ? "bg-rose-100 border-rose-300"
      : cellAnomalies.some((a) => a.severity === "medium")
      ? "bg-amber-100 border-amber-300"
      : "";
    const anomalyTip = isEditing
      ? ""
      : cellAnomalies.map((a) => `[${a.severity === "high" ? "严重" : a.severity === "medium" ? "一般" : "提示"}] ${a.message}`).join("\n");

    if (isEditable) {
      return (
        <td
          key={col.id}
          className={`py-1 px-1 text-right bg-white border border-zinc-200 ${anomalyCls}`}
          title={anomalyTip}
        >
          <input
            type="text"
            inputMode="decimal"
            data-key={key}
            className={`w-full min-w-[72px] text-right outline-none bg-transparent rounded px-1 py-0.5 text-[11px] font-mono transition-colors ${
              focusedKey === key
                ? "border-2 border-cyan-500 bg-cyan-50 text-cyan-900 ring-1 ring-cyan-400"
                : "border border-transparent hover:border-cyan-300 focus:border-cyan-500 focus:bg-cyan-50 text-zinc-800"
            }`}
            value={result.raw !== undefined ? String(result.raw) : ""}
            onFocus={() => setFocusedKey(key)}
            onChange={(e) => writeCell(col.id, date, e.target.value)}
            onKeyDown={(e) => handleCellKeyDown(e, col, date)}
            onPaste={(e) => handlePaste(e, col.id, date)}
          />
        </td>
      );
    }

    return (
      <td
        key={col.id}
        title={isFormula(col.kind) ? `自动计算：${result.display}` : anomalyTip}
        className={`py-2 px-3 text-right font-mono text-[11px] ${getCategoryCellStyles(col)} ${
          anomalyCls ? `border ${anomalyCls}` : ""
        }${result.display === "—" ? " text-zinc-300" : " text-zinc-700"}`}
      >
        {result.display}
      </td>
    );
  };

  // ── 渲染上结行 ──
  // 上结行：仅展示上月最后一天的"原始抄表数值"，不计算用量/费用/单价
  // （用量/kwh/费用 这些"差额列"在前一行的 6/1 才需要）
  const renderPrevRow = (): React.ReactNode => {
    const [pm, pd] = [new Date(year, month - 1, 0).getMonth() + 1, new Date(year, month - 1, 0).getDate()];
    return (
      <tr className="bg-amber-50/40 hover:bg-amber-50/60 transition-colors">
        <td className="py-2 px-3 font-semibold whitespace-nowrap">
          <span className="inline-block px-1 py-0.5 mr-1 text-[9px] font-black bg-amber-200 text-amber-800 rounded">
            上结
          </span>
          <span className="font-mono text-[11px] text-zinc-500">{pm}月{pd}日</span>
        </td>
        {tabColumns.map((col) => {
          // 上结行只显示"原始抄表数值"，其他公式列显示"—"
          if (isMeterReading(col.kind)) {
            return renderCell(col, prevMonthLastDay);
          }
          // 公式列在"上结日"无意义（缺少下一日作差），直接显示占位符
          return (
            <td
              key={col.id}
              className="py-2 px-3 text-right font-mono text-[11px] text-zinc-300"
            >
              —
            </td>
          );
        })}
        {isEditing && <td className="py-2 px-3 w-20" />}
      </tr>
    );
  };

  // ── 可见天（异常过滤模式） ──
  const visibleDays = useMemo(
    () =>
      showAnomalyOnly
        ? allDays.filter((d) => anomalyMap.has(d) && (anomalyMap.get(d)?.size ?? 0) > 0)
        : allDays,
    [showAnomalyOnly, allDays, anomalyMap],
  );

  const tabLabel: Record<Tab, string> = { 电: "用电明细", 水: "用水明细", 气: "天然气明细" };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* ── 工具栏 ── */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        {/* Tab 切换 */}
        <div className="flex bg-zinc-100 p-1 rounded-lg gap-1">
          {(["电", "水", "气"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-white text-cyan-700 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50"
              }`}
            >
              {tabLabel[tab]}
            </button>
          ))}
        </div>

        {/* 操作按钮区 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 异常过滤 */}
          {!isEditing && stats.high + stats.medium > 0 && (
            <button
              onClick={() => setShowAnomalyOnly((v) => !v)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-colors ${
                showAnomalyOnly
                  ? "bg-rose-100 text-rose-700 border-rose-300"
                  : "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
              }`}
            >
              <AlertTriangle className="inline h-3 w-3 mr-1" />
              {showAnomalyOnly
                ? `显示全部（${allDays.length}天）`
                : `异常 ${stats.high + stats.medium} 项`}
            </button>
          )}

          {/* 状态提示 */}
          {statusMsg && (
            <span className="px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-full max-w-xs truncate">
              {statusMsg}
            </span>
          )}

          {/* 录入进度 */}
          {!isEditing && (
            <span className="px-2 py-1 text-[11px] font-mono text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-full">
              已录入 {stats.filled}/{stats.total} 天
            </span>
          )}

          {/* 编辑 / 保存 / 取消 */}
          {isEditing ? (
            <>
              {editState.dirty && (
                <span className="px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full">
                  有未保存修改
                </span>
              )}
              <button onClick={cancelEdit} className="px-4 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold text-sm rounded-full transition-colors">
                取消
              </button>
              <button onClick={saveEdit} className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm rounded-full transition-colors">
                保存修改
              </button>
            </>
          ) : (
            <button
              onClick={startEdit}
              className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-sm rounded-full transition-colors flex items-center gap-1"
            >
              <Calculator className="h-3.5 w-3.5" />
              编辑明细
            </button>
          )}
        </div>
      </div>

      {/* ── 编辑模式帮助条 ── */}
      {isEditing && (
        <div className="px-4 py-2.5 bg-cyan-50/60 border border-cyan-200 rounded-lg text-[11px] text-cyan-800 leading-relaxed">
          <span className="font-bold mr-1">编辑模式：</span>
          点击左侧白底单元格直接
          <span className="font-semibold mx-1">输入或修改数值</span>，
          <span className="font-semibold mx-1">用量/费用列自动计算</span>。
          按住 <kbd className="px-1.5 py-0.5 mx-0.5 bg-white border border-cyan-300 rounded text-[10px] font-mono">Ctrl+V</kbd> 粘贴
          Excel 复制的一列数据（自动向下填充），
          <kbd className="px-1.5 py-0.5 mx-0.5 bg-white border border-cyan-300 rounded text-[10px] font-mono">Enter</kbd> 跳下一天，
          <kbd className="px-1.5 py-0.5 mx-0.5 bg-white border border-cyan-300 rounded text-[10px] font-mono">↑↓</kbd> 上下行。
        </div>
      )}

      {/* ── 表格 ── */}
      <div className="w-full overflow-x-auto border border-zinc-200/80 rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse whitespace-nowrap table-auto">
          <thead>
            <tr className="bg-zinc-100/95 sticky top-0 z-20">
              <th className="py-2.5 px-3 sticky left-0 z-30 bg-zinc-100/95 border-b border-zinc-200/80 font-semibold text-zinc-700 text-[11px] tracking-wider w-24 min-w-[96px] backdrop-blur-sm">
                日期
              </th>
              {tabColumns.map((col) => (
                <th
                  key={col.id}
                  className={`py-2.5 px-3 text-right font-semibold sticky top-0 z-10 border-b text-[10px] tracking-wider backdrop-blur-sm ${getCategoryHeaderStyles(col)}`}
                >
                  <span className="flex items-center justify-end gap-1 whitespace-nowrap">
                    <span>{col.name}</span>
                    {col.unit && <span className="text-zinc-400">({col.unit})</span>}
                    {isEditing && isMeterReading(col.kind) && (
                      <span className="ml-1 text-[9px] text-cyan-600 bg-cyan-50 px-1 rounded-full">可输入</span>
                    )}
                    {!isEditing && isFormula(col.kind) && (
                      <Calculator className="h-2.5 w-2.5 text-zinc-400" aria-label="自动计算" />
                    )}
                  </span>
                </th>
              ))}
              {isEditing && (
                <th className="py-2.5 px-3 sticky top-0 z-10 bg-zinc-100/95 border-b border-zinc-200/80 font-semibold text-zinc-700 text-[10px] tracking-wider text-right w-20 backdrop-blur-sm">
                  操作
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-[11px] text-zinc-700">
            {visibleDays.length === 0 ? (
              <tr>
                <td colSpan={tabColumns.length + 2}>
                  <div className="py-20 text-center space-y-3">
                    <Archive className="h-10 w-10 text-zinc-300 mx-auto" />
                    <p className="text-sm text-zinc-400">
                      {showAnomalyOnly ? "当前月份无异常数据" : `暂无${tabLabel[activeTab]}数据。点击右上角「编辑明细」开始录入。`}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {renderPrevRow()}
                {visibleDays.map((date, rowIdx) => {
                  const item = currentMap.get(date);
                  const hasData = item && hasAnyReading(item);

                  return (
                    <tr
                      key={date}
                      className={`hover:bg-zinc-50 transition-colors${rowIdx % 2 === 1 ? " bg-zinc-50/30" : ""}`}
                    >
                      <td className="py-2 px-3 font-semibold text-zinc-900 w-24 min-w-[96px] whitespace-nowrap">
                        {date.slice(8, 10)}日
                      </td>
                      {tabColumns.map((col) => renderCell(col, date))}
                      {isEditing && (
                        <td className="py-2 px-3 w-20 text-right">
                          {hasData && (
                            <button
                              onClick={() => clearRow(date)}
                              className="text-[10px] text-zinc-400 hover:text-red-600 transition-colors"
                              title="清空当天所有读数"
                            >
                              清空
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* ── 底部清列按钮（编辑模式下显示） ── */}
      {isEditing && editableColumns.length > 0 && (
        <div className="flex flex-wrap gap-2 px-2">
          <span className="text-[11px] text-zinc-400 self-center">快捷清列：</span>
          {editableColumns.map((col) => (
            <button
              key={`clr_${col.id}`}
              onClick={() => clearColumn(col.id)}
              className="px-2 py-1 text-[10px] text-zinc-500 hover:text-red-600 border border-zinc-200 hover:border-red-300 rounded-full transition-colors"
              title={`清空"${col.name}"整列读数`}
            >
              清空「{col.name}」
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
