import React from "react";
import { Archive } from "lucide-react";
import { MonthlyCircuitConfig, 月度抄表记录, 字典配置 } from "../../shared/types";
import { getPrice } from "../../shared/utils/pricing";

interface HistoryMonthlyDetailListProps {
  月度历史: 月度抄表记录[];
  selectedMonth: string;
  circuitData: MonthlyCircuitConfig[];
  sortedMonthlyCols: any[];
  限额配置: 字典配置;
}

interface CircuitRow {
  circuit: MonthlyCircuitConfig;
  prevReading: number;
  currentReading: number | undefined;
  usage: number | undefined;
  actualUsage: number | undefined;
  currentPrice: number;
  amount: number | undefined;
  isSwapped: boolean;
}

function useCircuitRows(
  月度历史: 月度抄表记录[],
  selectedMonth: string,
  circuitData: MonthlyCircuitConfig[],
  限额配置: 字典配置,
): { rows: CircuitRow[]; totalUsage: number; totalAmount: number; hasAnyUsage: boolean } {
  return React.useMemo(() => {
    const filteredData = 月度历史.filter((item) => item.月份 === selectedMonth);
    const item = filteredData[0];

    // 预计算所有 circuit 的 prevReading（避免每次 render 重复遍历历史数据）
    const allPastRecords = 月度历史
      .filter((r) => r.月份 < selectedMonth)
      .sort((a, b) => b.月份.localeCompare(a.月份));

    const prevReadingMap = new Map<string, number>();
    for (const c of circuitData) {
      let prev = 0;
      for (const rec of allPastRecords) {
        if (rec.数据 && rec.数据[c.id] !== undefined) {
          prev = Number(rec.数据[c.id]);
          break;
        }
      }
      prevReadingMap.set(c.id, prev);
    }

    const electricityPrice = (() => {
      const elecCircuits = circuitData.filter(c => c.category === "电");
      if (elecCircuits.length > 0) {
        const r = getPrice(elecCircuits[0].id, selectedMonth, 限额配置, circuitData);
        return r.单价 > 0 ? r.单价 : (限额配置.电费单价 || 0);
      }
      return 限额配置.电费单价 || 0;
    })();

    const rows: CircuitRow[] = [];
    let totalUsage = 0;
    let totalAmount = 0;
    let hasAnyUsage = false;

    circuitData.forEach((c) => {
      const prevReading = prevReadingMap.get(c.id) ?? 0;
      const currentReading =
        item && item.数据 && item.数据[c.id] !== undefined
          ? Number(item.数据[c.id])
          : undefined;

      let usage: number | undefined = undefined;
      if (currentReading !== undefined) {
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
          usage = Math.max(0, oldFinal - prevReading) + Math.max(0, currentReading - newStart);
        } else {
          usage = currentReading - prevReading;
        }
      }

      const actualUsage = usage !== undefined ? (usage >= 0 ? usage : 0) : undefined;
      const amount = actualUsage !== undefined ? actualUsage * electricityPrice : undefined;

      if (actualUsage !== undefined) {
        totalUsage += actualUsage;
        totalAmount += amount!;
        hasAnyUsage = true;
      }

      rows.push({
        circuit: c,
        prevReading,
        currentReading,
        usage,
        actualUsage,
        currentPrice: electricityPrice,
        amount,
        isSwapped:
          item &&
          (item.数据?.[`swap_${c.id}`] === true ||
            item.数据?.[`swap_${c.id}`] === "true"),
      });
    });

    return { rows, totalUsage, totalAmount, hasAnyUsage };
  }, [月度历史, selectedMonth, circuitData, 限额配置]);
}

export const HistoryMonthlyDetailList: React.FC<HistoryMonthlyDetailListProps> = ({
  月度历史,
  selectedMonth,
  circuitData,
  sortedMonthlyCols,
  限额配置,
}) => {
  const { rows, totalUsage, totalAmount, hasAnyUsage } = useCircuitRows(
    月度历史,
    selectedMonth,
    circuitData,
    限额配置,
  );

  const activeCols = sortedMonthlyCols.filter(
    (col) => col.name !== "代码ID (唯一)" && col.id !== "id",
  );

  return (
    <table
      className="w-full text-left border-collapse whitespace-nowrap"
      id="tbl_monthly_details"
    >
      <thead>
        <tr>
          {activeCols.map((col) => (
            <th
              key={col.id}
              className="py-4 px-6 sticky top-0 z-10 bg-zinc-100/95 border-b border-zinc-200/80 font-semibold text-zinc-700 text-xs tracking-wider backdrop-blur-md"
            >
              {col.name}
            </th>
          ))}
          <th className="py-4 px-6 text-right sticky top-0 z-10 bg-zinc-100/95 border-b border-zinc-200/80 font-semibold text-zinc-700 text-xs tracking-wider backdrop-blur-md">
            表底数 (上月抄表)
          </th>
          <th className="py-4 px-6 text-right sticky top-0 z-10 bg-zinc-100/95 border-b border-zinc-200/80 font-semibold text-zinc-700 text-xs tracking-wider backdrop-blur-md">
            抄表值 ({selectedMonth})
          </th>
          <th className="py-4 px-6 text-right sticky top-0 z-10 bg-zinc-100/95 border-b border-zinc-200/80 font-semibold text-zinc-700 text-xs tracking-wider backdrop-blur-md">
            用量 (度)
          </th>
          <th className="py-4 px-6 text-right sticky top-0 z-10 bg-zinc-100/95 border-b border-zinc-200/80 font-semibold text-zinc-700 text-xs tracking-wider backdrop-blur-md">
            电价 (元)
          </th>
          <th className="py-4 px-6 text-right sticky top-0 z-10 bg-zinc-100/95 border-b border-zinc-200/80 font-semibold text-zinc-700 text-xs tracking-wider backdrop-blur-md">
            金额 (元)
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
        {circuitData.length === 0 ? (
          <tr>
            <td colSpan={activeCols.length + 5}>
              <div className="py-20 text-center space-y-3">
                <Archive className="h-10 w-10 text-zinc-300 mx-auto" />
                <p className="text-xs text-zinc-400">暂无二级回路配置项。</p>
              </div>
            </td>
          </tr>
        ) : (
          <>
            {rows.map((row) => {
              const { circuit, prevReading, currentReading, actualUsage, currentPrice, amount, isSwapped } = row;
              return (
                <tr key={circuit.id} className="hover:bg-zinc-50 transition">
                  {activeCols.map((col) => {
                    if (col.id === "name") {
                      return (
                        <td
                          key={col.id}
                          className="py-3.5 px-6 font-semibold text-zinc-900 break-words flex items-center"
                        >
                          <span>{circuit.name}</span>
                          {isSwapped && (
                            <span className="ml-2 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-extrabold border border-amber-200/50 leading-none">
                              调校/换新
                            </span>
                          )}
                        </td>
                      );
                    }
                    if (col.id === "category") {
                      return (
                        <td key={col.id} className="py-3.5 px-6 text-zinc-650">
                          {circuit["层级 / 区域分类"] || circuit.category || "-"}
                        </td>
                      );
                    }
                    return (
                      <td key={col.id} className="py-3.5 px-6 text-zinc-650">
                        {(circuit as Record<string, unknown>)[col.id] !== undefined
                          ? String((circuit as Record<string, unknown>)[col.id])
                          : "-"}
                      </td>
                    );
                  })}
                  <td className="py-3.5 px-6 text-right font-mono text-zinc-500">
                    {prevReading.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono text-zinc-700 font-bold">
                    {currentReading !== undefined ? currentReading.toFixed(1) : "-"}
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono text-cyan-600 font-bold">
                    {actualUsage !== undefined ? actualUsage.toFixed(1) : "-"}
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono text-zinc-500">
                    ￥{currentPrice.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono text-rose-600 font-bold">
                    {amount !== undefined ? `￥${amount.toFixed(2)}` : "-"}
                  </td>
                </tr>
              );
            })}
            {circuitData.length > 0 && (
              <tr className="bg-zinc-50/80 font-bold border-t border-zinc-200">
                <td colSpan={activeCols.length + 2} className="py-4 px-6 text-zinc-900 font-bold text-xs">
                  合计 / 汇总
                </td>
                <td className="py-4 px-6 text-right font-mono text-cyan-650 font-extrabold text-sm">
                  {hasAnyUsage ? totalUsage.toFixed(1) : "-"}
                </td>
                <td className="py-4 px-6 text-right font-mono text-zinc-400 font-normal">
                  -
                </td>
                <td className="py-4 px-6 text-right font-mono text-rose-650 font-extrabold text-sm">
                  {hasAnyUsage ? `￥${totalAmount.toFixed(2)}` : "-"}
                </td>
              </tr>
            )}
          </>
        )}
      </tbody>
    </table>
  );
};
