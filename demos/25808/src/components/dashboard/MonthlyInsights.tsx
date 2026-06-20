import React from "react";
import { Zap, Droplet, Flame } from "lucide-react";
import { renderDiff } from "./renderDiff";

interface MonthlyGroup {
  month: string;
  totalElec: number;
  totalWater: number;
  totalGas: number;
  costElec: number;
  costWater: number;
  costGas: number;
  totalCost: number;
  daysCount: number;
}

interface MonthlyInsightsProps {
  monthlyGroups: MonthlyGroup[];
  dashboardDate: string;
}

export const MonthlyInsights: React.FC<MonthlyInsightsProps> = ({
  monthlyGroups,
  dashboardDate,
}) => {
  if (!monthlyGroups || monthlyGroups.length === 0) return null;

  const selectedMonthStr = dashboardDate ? dashboardDate.slice(0, 7) : monthlyGroups[0].month;
  const foundIdx = monthlyGroups.findIndex((g) => g.month === selectedMonthStr);

  let currentMonth = foundIdx !== -1 ? monthlyGroups[foundIdx] : null;
  if (!currentMonth && selectedMonthStr) {
    currentMonth = {
      month: selectedMonthStr,
      totalElec: 0,
      totalWater: 0,
      totalGas: 0,
      costElec: 0,
      costWater: 0,
      costGas: 0,
      totalCost: 0,
      daysCount: 0,
    };
  }

  if (!currentMonth) return null;

  const prevMonth = foundIdx !== -1 ? monthlyGroups[foundIdx + 1] : null;

  return (
    <div className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-xs mb-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2 md:gap-0">
        <h3 className="text-sm font-bold text-zinc-800 tracking-wider flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
            月度洞察
          </span>
          {currentMonth.month.replace("-", "年")}月 累计能耗与成本核算
        </h3>
        {prevMonth && (
          <span className="text-zinc-400 text-xs font-sans">
            对比基准：{prevMonth.month.replace("-", "年")}月
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex flex-col space-y-1.5">
          <span className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-zinc-400" /> 总动力电耗 (度)
          </span>
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600 font-mono tracking-tight">
                {currentMonth.totalElec.toLocaleString(undefined, {
                  maximumFractionDigits: 1,
                })}
              </span>
              {renderDiff(
                currentMonth.totalElec,
                prevMonth ? prevMonth.totalElec : null,
              )}
            </div>
            <span className="text-[11px] text-zinc-400 font-sans mt-0.5">
              电费结款：<span className="font-mono text-indigo-500/70 font-medium tracking-tight">¥{currentMonth.costElec.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col space-y-1.5">
          <span className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-zinc-400" /> 总自来水耗 (吨)
          </span>
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-sky-600 font-mono tracking-tight">
                {currentMonth.totalWater.toLocaleString(undefined, {
                  maximumFractionDigits: 1,
                })}
              </span>
              {renderDiff(
                currentMonth.totalWater,
                prevMonth ? prevMonth.totalWater : null,
              )}
            </div>
            <span className="text-[11px] text-zinc-400 font-sans mt-0.5">
              水费结款：<span className="font-mono text-sky-500/70 font-medium tracking-tight">¥{currentMonth.costWater.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col space-y-1.5">
          <span className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-zinc-400" /> 总天然气耗 (m³)
          </span>
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-emerald-600 font-mono tracking-tight">
                {currentMonth.totalGas.toLocaleString(undefined, {
                  maximumFractionDigits: 1,
                })}
              </span>
              {renderDiff(
                currentMonth.totalGas,
                prevMonth ? prevMonth.totalGas : null,
              )}
            </div>
            <span className="text-[11px] text-zinc-400 font-sans mt-0.5">
              气费结款：<span className="font-mono text-emerald-500/70 font-medium tracking-tight">¥{currentMonth.costGas.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col space-y-1.5 pl-4 md:pl-6 border-l border-zinc-100">
          <span className="text-xs text-zinc-500 font-semibold">
            累计参考结算成本 (元)
          </span>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-rose-600 font-mono tracking-tight">
              ¥
              {currentMonth.totalCost.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}
            </span>
            {renderDiff(
              currentMonth.totalCost,
              prevMonth ? prevMonth.totalCost : null,
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
