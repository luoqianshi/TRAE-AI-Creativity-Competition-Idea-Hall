import React from "react";
import { motion } from "motion/react";
import { Search, FileSpreadsheet } from "lucide-react";
import { exportAllToExcel } from "../../shared/utils/exportExcel";
import {
  DailyFieldConfig,
  MonthlyCircuitConfig,
  抄表记录,
  月度抄表记录,
  字典配置,
} from "../../shared/types";
import { getPrice } from "../../shared/utils/pricing";

import { HistoryDailyDetailList } from "./HistoryDailyDetailList";
import { HistoryDailySummaryList } from "./HistoryDailySummaryList";
import { HistoryMonthlyDetailList } from "./HistoryMonthlyDetailList";
import { HistoryMonthlySummaryList } from "./HistoryMonthlySummaryList";
import { getDailySummaries, computeMonthlyDetailSummary } from "./historyArchiveCalculations";

interface HistoryArchiveViewProps {
  历史抄表子路由: "日常" | "日常汇总" | "月度" | "月度汇总";
  set历史抄表子路由: (route: "日常" | "日常汇总" | "月度" | "月度汇总") => void;
  历史数据: 抄表记录[];
  更新抄表数据: (新数据: 抄表记录[]) => void;
  限额配置: 字典配置;
  日常回路配置: DailyFieldConfig[];
  circuitData: MonthlyCircuitConfig[];
  sortedMonthlyCols: any[];
  月度历史: 月度抄表记录[];
}

/**
 * 通用 CSV 导出工具（将 HTML table 导出为 CSV 文件下载）
 */
function exportTableToCSV(tableId: string, filename: string) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const rows: string[][] = [];
  const headers = table.querySelectorAll("thead tr");
  const bodyRows = table.querySelectorAll("tbody tr");

  headers.forEach((tr) => {
    const cells = tr.querySelectorAll("th");
    rows.push(Array.from(cells).map((c) => `"${c.textContent?.replace(/"/g, '""') || ""}"`));
  });
  bodyRows.forEach((tr) => {
    const cells = tr.querySelectorAll("td");
    if (cells.length === 0) return;
    rows.push(Array.from(cells).map((c) => `"${c.textContent?.replace(/"/g, '""') || ""}"`));
  });

  const csvContent = rows.map((r) => r.join(",")).join("\n");
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export const HistoryArchiveView: React.FC<HistoryArchiveViewProps> = ({
  历史抄表子路由,
  set历史抄表子路由,
  历史数据,
  更新抄表数据,
  限额配置,
  日常回路配置,
  circuitData,
  sortedMonthlyCols,
  月度历史,
}) => {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
    }).format(new Date()),
  );
  const [selectedYear, setSelectedYear] = React.useState<string>(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
    }).format(new Date()),
  );

  const dailySummaries = getDailySummaries(历史数据, 限额配置, 日常回路配置);

  const handleExportAll = () => {
    const year = selectedMonth.split('-')[0];
    const dailyData = 历史数据.filter(d => d.日期.startsWith(selectedMonth));
    const dailySummaryData = dailySummaries.filter(d => d.日期.startsWith(selectedMonth));
    const monthlyDetailData = 月度历史.filter(m => m.月份 === selectedMonth);

    exportAllToExcel(
      selectedMonth,
      year,
      限额配置,
      日常回路配置,
      dailyData,
      dailySummaryData,
      monthlyDetailData,
      []
    );
  };

  const currentTableId = {
    "日常": "tbl_daily_details_elec",
    "日常汇总": "tbl_daily_summary",
    "月度": "tbl_monthly_details",
    "月度汇总": "tbl_monthly_summary",
  }[历史抄表子路由] || "";

  const monthlyDetailSummary = React.useMemo(
    () => computeMonthlyDetailSummary(月度历史, selectedMonth, circuitData, 限额配置),
    [月度历史, selectedMonth, circuitData, 限额配置],
  );

  return (
    <motion.div
      key="历史抄表库"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 w-full max-w-full min-w-0 overflow-x-hidden"
      id="history_archive_root"
    >
      <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4 w-full">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 truncate">
            精细抄表数据库与财务汇总
          </h2>
          <p className="text-sm text-zinc-500 mt-1 font-sans truncate">
            高维度综合数仓：自主校准、月度能耗归档核销，提供4重层级的深度汇总表单。
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center flex-shrink-0">
          <div className="flex flex-wrap bg-zinc-100 p-1 rounded-lg gap-0.5 shrink-0">
            <button
              id="sub_tab_daily_log"
              type="button"
              onClick={() => set历史抄表子路由("日常")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${历史抄表子路由 === "日常" ? "bg-white shadow-xs text-zinc-900" : "text-zinc-600 hover:text-zinc-800"}`}
            >
              日常明细
            </button>
            <button
              id="sub_tab_daily_sum"
              type="button"
              onClick={() => set历史抄表子路由("日常汇总")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${历史抄表子路由 === "日常汇总" ? "bg-white shadow-xs text-zinc-900" : "text-zinc-600 hover:text-zinc-800"}`}
            >
              日常汇总
            </button>
            <button
              id="sub_tab_monthly_log"
              type="button"
              onClick={() => set历史抄表子路由("月度")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${历史抄表子路由 === "月度" ? "bg-white shadow-xs text-zinc-900" : "text-zinc-600 hover:text-zinc-800"}`}
            >
              月度明细
            </button>
            <button
              id="sub_tab_monthly_sum"
              type="button"
              onClick={() => set历史抄表子路由("月度汇总")}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${历史抄表子路由 === "月度汇总" ? "bg-white shadow-xs text-zinc-900" : "text-zinc-600 hover:text-zinc-800"}`}
            >
              月度汇总
            </button>
          </div>

          {(历史抄表子路由 === "日常" || 历史抄表子路由 === "日常汇总") && (
            <div className="flex items-center space-x-2 bg-white border border-zinc-200/60 rounded-xl px-3.5 py-2 shadow-xs">
              <Search className="h-4.5 w-4.5 text-zinc-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-sm focus:outline-none border-none text-zinc-750 bg-transparent py-1 w-32 font-mono font-bold"
              />
            </div>
          )}

          {历史抄表子路由 === "月度" && (
            <div className="flex items-center space-x-2 bg-white border border-zinc-200/60 rounded-xl px-3.5 py-2 shadow-xs">
              <Search className="h-4.5 w-4.5 text-zinc-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="text-sm focus:outline-none border-none text-zinc-750 bg-transparent py-1 w-32 font-mono font-bold"
              />
            </div>
          )}

          {历史抄表子路由 === "月度汇总" && (
            <div className="flex items-center space-x-2 bg-white border border-zinc-200/60 rounded-xl px-3.5 py-2 shadow-xs">
              <Search className="h-4.5 w-4.5 text-zinc-400" />
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="text-sm focus:outline-none border-none text-zinc-750 bg-transparent py-1 w-20 font-mono font-bold"
                placeholder="年份"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => currentTableId && exportTableToCSV(currentTableId, `${历史抄表子路由}_${selectedMonth}`)}
            className="bg-zinc-100 text-zinc-600 border border-zinc-200 hover:bg-zinc-200 flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="导出当前表格为 CSV"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>导出当前表</span>
          </button>

          <button
            type="button"
            onClick={handleExportAll}
            className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="h-4.5 w-4.5" />
            <span>导出全部数据</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-xs overflow-hidden w-full max-w-full">
        {历史抄表子路由 === "月度" && (
          <div className="bg-zinc-50 border-b border-zinc-200/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block font-sans">
                {selectedMonth} 账期 · 区域回路电能结算汇总
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-base font-bold text-zinc-900 tracking-tight font-sans">合计 / 汇总面板</span>
                <span className="text-[11px] text-zinc-500 font-sans">(已为您穿透表格数据，实时累加展示)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4 items-center sm:justify-end">
              <div className="bg-white border border-zinc-150 rounded-xl px-4 py-2 shadow-2xs min-w-[130px] flex flex-col justify-center">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">累计结算总电量</span>
                <span className="text-sm font-bold font-mono text-cyan-600">
                  {monthlyDetailSummary.hasAnyUsage ? monthlyDetailSummary.totalUsage.toLocaleString(undefined, { minimumFractionDigits: 1 }) : "-"} <span className="text-[10px] font-sans font-normal text-zinc-400">度</span>
                </span>
              </div>

              <div className="bg-white border border-zinc-150 rounded-xl px-4 py-2 shadow-2xs min-w-[130px] flex flex-col justify-center">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">当前执行电价</span>
                <span className="text-sm font-bold font-mono text-zinc-700">
                  ￥{((() => {
                    const elecFields = 日常回路配置.filter(f => f.category === "电");
                    return (elecFields.length > 0
                      ? (getPrice(elecFields[0].id, selectedMonth, 限额配置, 日常回路配置).单价 || 限额配置.电费单价 || 0)
                      : (限额配置.电费单价 || 0));
                  })()).toFixed(2)} <span className="text-[10px] font-sans font-normal text-zinc-400">元/度</span>
                </span>
              </div>

              <div className="bg-white border border-zinc-150 rounded-xl px-4 py-2 shadow-2xs min-w-[135px] flex flex-col justify-center">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">应结核定电费</span>
                <span className="text-sm font-bold font-mono text-rose-600">
                  {monthlyDetailSummary.hasAnyUsage ? `￥${monthlyDetailSummary.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "-"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-full overflow-x-auto overflow-y-auto max-h-[70vh] border border-zinc-200/80 rounded-xl scrollbar-thin">
          {历史抄表子路由 === "日常" && (
            <HistoryDailyDetailList
              历史数据={历史数据}
              更新抄表数据={更新抄表数据}
              selectedMonth={selectedMonth}
              日常回路配置={日常回路配置}
              限额配置={限额配置}
            />
          )}

          {历史抄表子路由 === "日常汇总" && (
            <HistoryDailySummaryList
              dailySummaries={dailySummaries}
              selectedMonth={selectedMonth}
              set历史抄表子路由={set历史抄表子路由}
              限额配置={限额配置}
              日常回路配置={日常回路配置}
            />
          )}

          {历史抄表子路由 === "月度" && (
            <HistoryMonthlyDetailList
              月度历史={月度历史}
              selectedMonth={selectedMonth}
              circuitData={circuitData}
              sortedMonthlyCols={sortedMonthlyCols}
              限额配置={限额配置}
            />
          )}

          {历史抄表子路由 === "月度汇总" && (
            <HistoryMonthlySummaryList
              月度历史={月度历史}
              selectedMonth={selectedMonth}
              circuitData={circuitData}
              限额配置={限额配置}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};
