import React from "react";
import { Archive, TrendingUp, TrendingDown, Minus, Zap, Droplet, Flame, DollarSign } from "lucide-react";
import { getMonthlyCategorySummariesWithComparison } from "./historyArchiveCalculations";
import { MonthlyCircuitConfig, 月度抄表记录, 字典配置 } from "../../shared/types";

interface HistoryMonthlySummaryListProps {
  月度历史: 月度抄表记录[];
  selectedMonth: string;
  circuitData: MonthlyCircuitConfig[];
  限额配置: 字典配置;
}

/** 格式化百分比变化 */
function formatChange(value: number | undefined): { text: string; icon: React.ReactNode; className: string } {
  if (value === undefined || value === null) {
    return { text: "-", icon: <Minus className="h-3 w-3" />, className: "text-zinc-400" };
  }
  const absVal = Math.abs(value);
  const text = `${value >= 0 ? "+" : "-"}${absVal.toFixed(1)}%`;
  if (value > 0) {
    return { text, icon: <TrendingUp className="h-3 w-3 text-rose-500" />, className: "text-rose-600 font-semibold" };
  } else if (value < 0) {
    return { text, icon: <TrendingDown className="h-3 w-3 text-emerald-500" />, className: "text-emerald-600 font-semibold" };
  }
  return { text, icon: <Minus className="h-3 w-3 text-zinc-400" />, className: "text-zinc-500" };
}

/** 根据能耗类型返回图标 */
function getEnergyIcon(type: "电" | "水" | "气"): React.ReactNode {
  switch (type) {
    case "电":
      return <Zap className="h-4 w-4 text-amber-500" />;
    case "水":
      return <Droplet className="h-4 w-4 text-blue-500" />;
    case "气":
      return <Flame className="h-4 w-4 text-orange-500" />;
    default:
      return null;
  }
}

export const HistoryMonthlySummaryList: React.FC<HistoryMonthlySummaryListProps> = ({
  月度历史,
  selectedMonth,
  circuitData,
  限额配置,
}) => {
  const summaries = React.useMemo(
    () => getMonthlyCategorySummariesWithComparison(月度历史, selectedMonth, circuitData, 限额配置),
    [月度历史, selectedMonth, circuitData, 限额配置],
  );

  // 汇总合计
  const totals = React.useMemo(() => {
    let totalUsage = 0;
    let totalCost = 0;
    let totalCircuits = 0;
    summaries.forEach((s) => {
      totalUsage += s.总用量;
      totalCost += s.总费用;
      totalCircuits += s.回路数量;
    });
    return { totalUsage, totalCost, totalCircuits };
  }, [summaries]);

  // 上月合计（用于环比）
  const prevTotals = React.useMemo(() => {
    let totalUsage = 0;
    let totalCost = 0;
    summaries.forEach((s) => {
      totalUsage += s.上月用量 ?? 0;
      totalCost += s.上月费用 ?? 0;
    });
    return { totalUsage, totalCost };
  }, [summaries]);

  const 环比总变化 = prevTotals.totalCost > 0
    ? ((totals.totalCost - prevTotals.totalCost) / prevTotals.totalCost) * 100
    : undefined;

  return (
    <div className="w-full overflow-x-auto border border-zinc-200/80 rounded-xl shadow-sm">
      <table className="w-full text-left border-collapse whitespace-nowrap" id="tbl_monthly_summary">
        <thead>
          <tr className="bg-zinc-100/95 sticky top-0 z-20">
            <th className="py-3 px-4 text-center w-12 border-b border-zinc-200/80 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md">
              序号
            </th>
            <th className="py-3 px-4 w-40 border-b border-zinc-200/80 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md">
              <div className="flex items-center space-x-1">
                <span>大类名称</span>
              </div>
            </th>
            <th className="py-3 px-4 text-center w-20 border-b border-zinc-200/80 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md">
              回路数
            </th>
            <th className="py-3 px-4 text-right border-b border-zinc-200/80 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md">
              <div className="flex items-center justify-end space-x-1">
                <span>总用量</span>
              </div>
            </th>
            <th className="py-3 px-4 text-right border-b border-zinc-200/80 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md">
              环比变化
            </th>
            <th className="py-3 px-4 text-right border-b border-zinc-200/80 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md">
              同比变化
            </th>
            <th className="py-3 px-4 text-right border-b border-zinc-200/80 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md">
              <div className="flex items-center justify-end space-x-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                <span>总费用(元)</span>
              </div>
            </th>
            <th className="py-3 px-4 text-right border-b border-zinc-200/80 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md">
              费用环比
            </th>
            <th className="py-3 px-4 text-right border-b border-zinc-200/80 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md">
              费用同比
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
          {summaries.length === 0 ? (
            <tr>
              <td colSpan={9}>
                <div className="py-20 text-center space-y-3">
                  <Archive className="h-10 w-10 text-zinc-300 mx-auto" />
                  <p className="text-xs text-zinc-400">
                    {selectedMonth} 暂无月度大类汇总数据。
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            <>
              {summaries.map((item, i) => {
                const usageChange = formatChange(item.环比用量变化);
                const usageYoY = formatChange(item.同比用量变化);
                const costChange = formatChange(item.环比费用变化);
                const costYoY = formatChange(item.同比费用变化);

                return (
                  <tr key={item.大类名称} className="hover:bg-zinc-50 transition">
                    <td className="py-3 px-4 font-mono text-center text-zinc-400">
                      {i + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-900 flex items-center space-x-2">
                      {getEnergyIcon(item.能耗类型)}
                      <span>{item.大类名称}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-zinc-500">
                      {item.回路数量}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-700 font-semibold">
                      {item.总用量.toFixed(1)} {item.能耗类型 === "电" ? "度" : item.能耗类型 === "水" ? "吨" : "m³"}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono flex items-center justify-end space-x-1 ${usageChange.className}`}>
                      {usageChange.icon}
                      <span>{usageChange.text}</span>
                    </td>
                    <td className={`py-3 px-4 text-right font-mono flex items-center justify-end space-x-1 ${usageYoY.className}`}>
                      {usageYoY.icon}
                      <span>{usageYoY.text}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-600 font-bold">
                      ￥{item.总费用.toFixed(2)}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono flex items-center justify-end space-x-1 ${costChange.className}`}>
                      {costChange.icon}
                      <span>{costChange.text}</span>
                    </td>
                    <td className={`py-3 px-4 text-right font-mono flex items-center justify-end space-x-1 ${costYoY.className}`}>
                      {costYoY.icon}
                      <span>{costYoY.text}</span>
                    </td>
                  </tr>
                );
              })}
              {/* 合计行 */}
              <tr className="bg-zinc-50/80 font-bold border-t-2 border-zinc-300">
                <td className="py-4 px-4 text-center text-zinc-400" colSpan={2}>
                  <span className="text-zinc-900 font-bold">合计</span>
                  <span className="ml-2 text-zinc-500 font-normal">
                    ({totals.totalCircuits} 回路)
                  </span>
                </td>
                <td className="py-4 px-4 text-center font-mono text-zinc-500">
                  {totals.totalCircuits}
                </td>
                <td className="py-4 px-4 text-right font-mono text-cyan-700 font-extrabold">
                  {totals.totalUsage.toFixed(1)}
                </td>
                <td className="py-4 px-4 text-right font-mono text-zinc-400">
                  -
                </td>
                <td className="py-4 px-4 text-right font-mono text-zinc-400">
                  -
                </td>
                <td className="py-4 px-4 text-right font-mono text-emerald-700 font-extrabold bg-emerald-50/30">
                  ￥{totals.totalCost.toFixed(2)}
                </td>
                <td className={`py-4 px-4 text-right font-mono ${formatChange(环比总变化).className}`}>
                  {formatChange(环比总变化).icon}
                  <span className="ml-1">{formatChange(环比总变化).text}</span>
                </td>
                <td className="py-4 px-4 text-right font-mono text-zinc-400">
                  -
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};