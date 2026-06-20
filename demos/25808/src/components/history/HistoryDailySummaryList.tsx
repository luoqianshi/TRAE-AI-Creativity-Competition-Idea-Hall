import React from 'react';
import { Archive, Zap, Droplet, Flame, DollarSign, Compass } from 'lucide-react';
import { 字典配置, DailyFieldConfig } from '../../shared/types';
import { getDailyPrices } from '../../shared/utils/pricing';

interface HistoryDailySummaryListProps {
  dailySummaries: any[];
  selectedMonth: string;
  set历史抄表子路由: (route: "日常" | "日常汇总" | "月度" | "月度汇总") => void;
  限额配置: 字典配置;
  日常回路配置: DailyFieldConfig[];
}

export const HistoryDailySummaryList: React.FC<HistoryDailySummaryListProps> = ({
  dailySummaries,
  selectedMonth,
  set历史抄表子路由,
  限额配置,
  日常回路配置,
}) => {
  const filtered = dailySummaries.filter((item) => selectedMonth ? item.日期.startsWith(selectedMonth) : true);

  const totalElecUsage = filtered.reduce((sum, item) => sum + (item.电量 || 0), 0);
  const totalElecCost = filtered.reduce((sum, item) => sum + (item.电费 || 0), 0);
  const totalWaterUsage = filtered.reduce((sum, item) => sum + (item.水量 || 0), 0);
  const totalWaterCost = filtered.reduce((sum, item) => sum + (item.水费 || 0), 0);
  const totalGasUsage = filtered.reduce((sum, item) => sum + (item.气量 || 0), 0);
  const totalGasCost = filtered.reduce((sum, item) => sum + (item.气费 || 0), 0);
  const totalCost = filtered.reduce((sum, item) => sum + (item.总费 || 0), 0);

  return (
    <table className="w-full text-left border-collapse whitespace-nowrap" id="tbl_daily_summary">
      <thead>
        <tr>
          <th className="py-4 px-6 text-center w-16 sticky top-0 z-10 bg-zinc-50/95 border-b border-zinc-200/50 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md">序号</th>
          <th className="py-4 px-6 w-32 sticky top-0 z-10 bg-zinc-50/95 border-b border-zinc-200/50 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md">抄表日期</th>
          <th className="py-4 px-6 text-right sticky top-0 z-10 bg-zinc-50/95 border-b border-zinc-200/50 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md"><div className="flex items-center justify-end space-x-1"><Zap className="h-3.5 w-3.5 text-amber-500"/><span>日耗电汇总 (度)</span></div></th>
          <th className="py-4 px-6 text-right sticky top-0 z-10 bg-zinc-50/95 border-b border-zinc-200/50 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md">电价 (元/度)</th>
          <th className="py-4 px-6 text-right sticky top-0 z-10 bg-zinc-50/95 border-b border-zinc-200/50 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md"><div className="flex items-center justify-end space-x-1"><DollarSign className="h-3.5 w-3.5 text-emerald-500"/><span>电费 (元)</span></div></th>
          <th className="py-4 px-6 text-right sticky top-0 z-10 bg-zinc-50/95 border-b border-zinc-200/50 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md"><div className="flex items-center justify-end space-x-1"><Droplet className="h-3.5 w-3.5 text-blue-500"/><span>日耗水汇总 (吨)</span></div></th>
          <th className="py-4 px-6 text-right sticky top-0 z-10 bg-zinc-50/95 border-b border-zinc-200/50 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md">水价 (元/吨)</th>
          <th className="py-4 px-6 text-right sticky top-0 z-10 bg-zinc-50/95 border-b border-zinc-200/50 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md"><div className="flex items-center justify-end space-x-1"><DollarSign className="h-3.5 w-3.5 text-emerald-500"/><span>水费 (元)</span></div></th>
          <th className="py-4 px-6 text-right sticky top-0 z-10 bg-zinc-50/95 border-b border-zinc-200/50 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md"><div className="flex items-center justify-end space-x-1"><Flame className="h-3.5 w-3.5 text-orange-500"/><span>日耗气汇总 (m³)</span></div></th>
          <th className="py-4 px-6 text-right sticky top-0 z-10 bg-zinc-50/95 border-b border-zinc-200/50 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md">气价 (元/m³)</th>
          <th className="py-4 px-6 text-right sticky top-0 z-10 bg-zinc-50/95 border-b border-zinc-200/50 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md"><div className="flex items-center justify-end space-x-1"><DollarSign className="h-3.5 w-3.5 text-emerald-500"/><span>气费 (元)</span></div></th>
          <th className="py-4 px-6 text-right border-l font-extrabold text-zinc-900 bg-zinc-50/95 sticky top-0 z-10 border-b border-zinc-200/50 text-xs tracking-wider backdrop-blur-md"><div className="flex items-center justify-end space-x-1"><DollarSign className="h-3.5 w-3.5 text-emerald-500"/><span>总能耗费 (元)</span></div></th>
          <th className="py-4 px-6 text-center sticky top-0 z-10 bg-zinc-50/95 border-b border-zinc-200/50 text-xs font-bold text-zinc-500 tracking-wider backdrop-blur-md">明细快速通道</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
        {filtered.length === 0 ? (
          <tr>
            <td colSpan={13}>
              <div className="py-20 text-center space-y-3">
                <Archive className="h-10 w-10 text-zinc-300 mx-auto" />
                <p className="text-xs text-zinc-400">暂无日常抄表数据。</p>
              </div>
            </td>
          </tr>
        ) : (
          <>
            {filtered
              .slice()
              .reverse()
              .map((item, i) => {
                const dailyPrices = getDailyPrices(item.日期, 限额配置, 日常回路配置);
                return (
                  <tr key={item.日期} className="hover:bg-zinc-50 transition font-sans">
                    <td className="py-3.5 px-6 font-mono text-center text-zinc-400">{i + 1}</td>
                    <td className="py-3.5 px-6 font-semibold text-zinc-900">{item.日期}</td>
                    <td className="py-3.5 px-6 text-right font-mono text-zinc-650 font-semibold">{item.电量.toFixed(2)}</td>
                    <td className="py-3.5 px-6 text-right font-mono text-zinc-400 font-medium">￥{(dailyPrices.电.单价 || 限额配置.电费单价 || 0).toFixed(2)}</td>
                    <td className="py-3.5 px-6 text-right font-mono text-zinc-650 font-semibold">{item.电费.toFixed(2)}</td>
                    <td className="py-3.5 px-6 text-right font-mono text-zinc-650 font-semibold">{item.水量.toFixed(2)}</td>
                    <td className="py-3.5 px-6 text-right font-mono text-zinc-400 font-medium">￥{(dailyPrices.水.单价 || 限额配置.水费单价 || 0).toFixed(2)}</td>
                    <td className="py-3.5 px-6 text-right font-mono text-zinc-650 font-semibold">{item.水费.toFixed(2)}</td>
                    <td className="py-3.5 px-6 text-right font-mono text-zinc-655 font-semibold">{item.气量.toFixed(2)}</td>
                    <td className="py-3.5 px-6 text-right font-mono text-zinc-400 font-medium">￥{(dailyPrices.气.单价 || 限额配置.气费单价 || 0).toFixed(2)}</td>
                    <td className="py-3.5 px-6 text-right font-mono text-zinc-650 font-semibold">{item.气费.toFixed(2)}</td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-emerald-600 border-l bg-zinc-50/20">
                      ￥{item.总费.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          set历史抄表子路由('日常');
                        }}
                        className="text-cyan-600 hover:text-cyan-700 font-bold text-xxs flex items-center justify-center space-x-1 mx-auto cursor-pointer"
                      >
                        <Compass className="h-3 w-3" />
                        <span>展开抄表细项</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            {filtered.length > 0 && (
              <tr className="bg-zinc-100/85 font-bold border-t border-zinc-300">
                <td colSpan={2} className="py-4 px-6 text-zinc-900 font-bold text-xs">
                  合计 / 汇总
                </td>
                <td className="py-4 px-6 text-right font-mono text-zinc-700 font-bold">
                  {totalElecUsage.toFixed(2)}
                </td>
                <td className="py-4 px-6 text-right font-mono text-zinc-400 font-normal">
                  -
                </td>
                <td className="py-4 px-6 text-right font-mono text-zinc-700 font-bold">
                  ￥{totalElecCost.toFixed(2)}
                </td>
                <td className="py-4 px-6 text-right font-mono text-zinc-700 font-bold">
                  {totalWaterUsage.toFixed(2)}
                </td>
                <td className="py-4 px-6 text-right font-mono text-zinc-400 font-normal">
                  -
                </td>
                <td className="py-4 px-6 text-right font-mono text-zinc-700 font-bold">
                  ￥{totalWaterCost.toFixed(2)}
                </td>
                <td className="py-4 px-6 text-right font-mono text-zinc-700 font-bold">
                  {totalGasUsage.toFixed(2)}
                </td>
                <td className="py-4 px-6 text-right font-mono text-zinc-400 font-normal">
                  -
                </td>
                <td className="py-4 px-6 text-right font-mono text-zinc-700 font-bold">
                  ￥{totalGasCost.toFixed(2)}
                </td>
                <td className="py-4 px-6 text-right font-mono font-bold text-emerald-700 border-l bg-zinc-100/30 text-sm">
                  ￥{totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-4 px-6"></td>
              </tr>
            )}
          </>
        )}
      </tbody>
    </table>
  );
};
