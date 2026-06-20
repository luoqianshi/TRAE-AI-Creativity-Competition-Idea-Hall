import React from "react";
import {
  Scale,
  Calendar,
  Activity,
  Layers,
  Calculator,
  AlertTriangle,
  CheckCircle,
  FileWarning,
} from "lucide-react";
import { 抄表记录, 字典配置, DailyFieldConfig, 月度抄表记录, MonthlyCircuitConfig } from "../../shared/types";
import { getEnrichedDailyRecords, getPrice } from "../../shared/utils/pricing";

interface ReconciliationConsoleProps {
  限额配置: 字典配置;
  历史数据: 抄表记录[];
  日常回路配置: DailyFieldConfig[];
  月度历史: 月度抄表记录[];
  circuitData: MonthlyCircuitConfig[];
}

function getAuditingDirective(
  auditMonth: string,
  startStr: string,
  endStr: string,
  monthlyRecord: any,
  realDiffPercent: number,
  diffUsage: number,
  daysCollected: any[],
  expectedDays: any[],
  日常回路配置: DailyFieldConfig[],
) {
  const absDev = Math.abs(realDiffPercent);
  if (!monthlyRecord) {
    return `【轧差预警】当前选择月份 (${auditMonth}) 缺少二级回路月度手工抄表汇总核销项，无法配平轧差。请工程主管先至「抄表登记」填报本月二级分表读数。`;
  }
  const litixianName =
    日常回路配置.find((f) => f.id === "李体线电表")?.name || "李体线电表";
  const wushaxianName =
    日常回路配置.find((f) => f.id === "午沙线电表")?.name || "午沙线电表";
  if (absDev < 3.0) {
    return `【轧差通过】两端偏差率仅为 ${realDiffPercent.toFixed(1)}%（高精对齐）。${litixianName}/${wushaxianName}电能入口主母线总消耗与各客房、暖通、泵房等二级分类回路耗能完美轧抵。母线绝缘良好、无多抄及窃电情况，巡检状态：优秀。`;
  }
  if (absDev < 5.0) {
    return `【轻微变数偏差】账期内两端电量偏差 ${realDiffPercent.toFixed(1)}%。属于合理错峰偏差。可能诱因：1. 部分配发冷库变电房分表未能在 24:00 准时核对。2. 宴会厅或大堂等动态临时配电表有少量漏抄记录。已要求工程主管下一账期点对点锁定修正。`;
  }
  return `【能耗严重失衡异常】偏差过大！两端抄表轧差偏差率为 ${realDiffPercent.toFixed(1)}%(${diffUsage.toFixed(1)}度)！急令排查：\n1. 测算查核 [${startStr} 至 ${endStr}] 期中，公共区域与餐饮中央厨房是否发生过跑旁路、设备机械性漏损或未插计量卡无计盗电窃电情况。\n2. 校验二级客房冷暖机房与动力电梯配电柜 sub-metering 分线表，排除过流导致的仪表过载失准。\n3. 日常主回路数据采样率 (${daysCollected.length}/${expectedDays.length}天) 是否缺失，重调补录日志数据核验。`;
}

export const ReconciliationConsole: React.FC<ReconciliationConsoleProps> = ({
  限额配置,
  历史数据,
  日常回路配置,
  月度历史,
  circuitData,
}) => {
  const closingDay = 限额配置.对账日 !== undefined ? 限额配置.对账日 : 28;

  const auditMonths = React.useMemo(() => {
    const list = Array.from(
      new Set<string>([
        ...历史数据.map((h) => h.日期.substring(0, 7)),
        ...月度历史.map((m) => m.月份),
      ])
    ).filter((m) => m && m.length === 7);
    return list.sort().reverse();
  }, [历史数据, 月度历史]);

  const [auditMonth, setAuditMonth] = React.useState<string>("");

  React.useEffect(() => {
    if (auditMonths.length > 0 && !auditMonth) {
      setAuditMonth(auditMonths[0]);
    }
  }, [auditMonths, auditMonth]);

  const { startStr, endStr } = React.useMemo(() => {
    if (!auditMonth) return { startStr: "", endStr: "" };

    const [yearStr, monthStr] = auditMonth.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    const startDay = closingDay + 1;
    const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
    let actualStartYear = prevYear;
    let actualStartMonth = prevMonth;
    let actualStartDay = startDay;

    if (startDay > daysInPrevMonth) {
      actualStartYear = year;
      actualStartMonth = month;
      actualStartDay = 1;
    }

    const daysInCurrentMonth = new Date(year, month, 0).getDate();
    const actualEndDay = Math.min(closingDay, daysInCurrentMonth);

    const sStr = `${actualStartYear}-${String(actualStartMonth).padStart(2, "0")}-${String(actualStartDay).padStart(2, "0")}`;
    const eStr = `${year}-${String(month).padStart(2, "0")}-${String(actualEndDay).padStart(2, "0")}`;

    return { startStr: sStr, endStr: eStr };
  }, [auditMonth, closingDay]);

  const expectedDays = React.useMemo(() => {
    if (!startStr || !endStr) return [];
    const arr: string[] = [];
    const curr = new Date(startStr);
    const end = new Date(endStr);
    while (curr <= end) {
      arr.push(curr.toISOString().split("T")[0]);
      curr.setDate(curr.getDate() + 1);
    }
    return arr;
  }, [startStr, endStr]);

  const daysCollected = React.useMemo(() => {
    if (!startStr || !endStr) return [];
    return 历史数据.filter((h) => h.日期 >= startStr && h.日期 <= endStr);
  }, [历史数据, startStr, endStr]);

  const { dailyTotalUsage, dailyTotalCost } = React.useMemo(() => {
    const enriched = getEnrichedDailyRecords(历史数据, 限额配置, 日常回路配置);
    const inPeriod = enriched.filter((item) => item.日期 >= startStr && item.日期 <= endStr);

    const usage = inPeriod.reduce((sum, item) => sum + item.电量, 0);
    const cost = inPeriod.reduce((sum, item) => sum + item.电费, 0);

    return { dailyTotalUsage: usage, dailyTotalCost: cost };
  }, [历史数据, 限额配置, 日常回路配置, startStr, endStr]);

  const monthlyRecord = React.useMemo(() => {
    return 月度历史.find((item) => item.月份 === auditMonth);
  }, [月度历史, auditMonth]);

  const findPreviousReading = React.useCallback((circuitId: string, targetMonth: string) => {
    const pastRecords = 月度历史
      .filter((item) => item.月份 < targetMonth)
      .sort((a, b) => b.月份.localeCompare(a.月份));

    if (pastRecords.length > 0) {
      const closestRecord = pastRecords[0];
      if (closestRecord.数据 && closestRecord.数据[circuitId] !== undefined) {
        return closestRecord.数据[circuitId];
      }
    }
    return 0;
  }, [月度历史]);

  const { monthlyTotalUsage, monthlyTotalAmount } = React.useMemo(() => {
    if (!monthlyRecord) return { monthlyTotalUsage: 0, monthlyTotalAmount: 0 };

    let totalUsage = 0;
    let totalAmount = 0;

    circuitData.forEach((c) => {
      const priceResult = getPrice(c.id, auditMonth, 限额配置, circuitData);
      const circuitPrice = priceResult.单价 > 0 ? priceResult.单价 : (限额配置.电费单价 || 0);
      const prevReading = findPreviousReading(c.id, auditMonth);
      const currentReading = monthlyRecord.数据 ? monthlyRecord.数据[c.id] : undefined;

      if (currentReading !== undefined) {
        let usage = 0;
        const isSwapped = monthlyRecord.数据 && (monthlyRecord.数据[`swap_${c.id}`] === true || monthlyRecord.数据[`swap_${c.id}`] === "true");
        if (isSwapped) {
          const oldFinal = monthlyRecord.数据[`old_final_${c.id}`] !== undefined && monthlyRecord.数据[`old_final_${c.id}`] !== ""
            ? Number(monthlyRecord.数据[`old_final_${c.id}`])
            : prevReading;
          const newStart = monthlyRecord.数据[`new_start_${c.id}`] !== undefined && monthlyRecord.数据[`new_start_${c.id}`] !== ""
            ? Number(monthlyRecord.数据[`new_start_${c.id}`])
            : 0;
          usage = Math.max(0, oldFinal - prevReading) + Math.max(0, currentReading - newStart);
        } else {
          usage = currentReading - prevReading;
        }

        const actualUsage = usage >= 0 ? usage : 0;
        totalUsage += actualUsage;
        totalAmount += actualUsage * circuitPrice;
      }
    });

    return { monthlyTotalUsage: totalUsage, monthlyTotalAmount: totalAmount };
  }, [monthlyRecord, circuitData, auditMonth, findPreviousReading, 限额配置]);

  const diffUsage = dailyTotalUsage - monthlyTotalUsage;
  const diffCost = dailyTotalCost - monthlyTotalAmount;
  const realDiffPercent = monthlyTotalUsage > 0 ? (diffUsage / monthlyTotalUsage) * 100 : 0;

  return (
    <div className="bg-white border border-zinc-200/75 rounded-2xl shadow-xs p-6 space-y-6 flex flex-col animate-in fade-in slide-in-from-bottom-3 duration-300" id="electricity_reconciliation_console">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-100 gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <Scale className="h-5 w-5 text-zinc-650" />
            用电跨期对账核销审计控制台
          </h3>
          <p className="text-xs text-zinc-500 font-sans">
            根据系统设定的每月用电对账日【{closingDay}号】，交叉比对日常抄表汇总与月度核销抄表的流量差距及账目偏差。
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-zinc-600">审计账期:</span>
          <select
            value={auditMonth}
            onChange={(e) => setAuditMonth(e.target.value)}
            className="text-xs font-mono py-1.5 px-3 border border-zinc-200 rounded-lg bg-zinc-50 font-bold text-zinc-800 outline-none focus:ring-1 focus:focus:ring-zinc-900 cursor-pointer"
          >
            {auditMonths.map((m) => (
              <option key={m} value={m}>
                {m.substring(0, 4)}年{m.substring(5, 7)}月账期
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between p-3.5 bg-zinc-50 border border-zinc-150 rounded-xl gap-3">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4.5 w-4.5 text-zinc-400" />
          <div className="text-xs text-zinc-755 font-semibold font-sans">
            结算校对周期：
            <span className="font-mono bg-zinc-200/60 px-1.5 py-0.5 rounded text-zinc-900 font-bold">{startStr}</span>
            <span className="mx-1 text-zinc-400">至</span>
            <span className="font-mono bg-zinc-200/60 px-1.5 py-0.5 rounded text-zinc-900 font-bold">{endStr}</span>
          </div>
        </div>
        <div className="text-[11px] text-zinc-400 font-sans">
          日常采样周期率：
          <span className="font-mono font-bold text-zinc-700">{daysCollected.length}</span>
          <span className="mx-0.5">/</span>
          <span className="font-mono">{expectedDays.length}天</span>
          {daysCollected.length < expectedDays.length && (
            <span className="text-amber-600 ml-1">（日常记录存在缺天）</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-4 rounded-xl border border-zinc-200/60 bg-white shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-505 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-zinc-500" />
              日常抄表累计 (1级端)
            </span>
            <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-semibold">母计算和</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-zinc-400">核对区间总消耗</span>
            <p className="text-xl font-bold font-mono text-zinc-900">
              {dailyTotalUsage.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} 度
            </p>
          </div>
          <div className="border-t border-zinc-100 pt-2 flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-sans">计得结算电费</span>
            <span className="font-mono font-bold text-zinc-800">
              ￥{dailyTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/60 bg-white shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-505 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-zinc-500" />
              月度二级回路 (2级端)
            </span>
            <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full font-semibold">回路核销</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-zinc-400">核对区间结算用电</span>
            {monthlyRecord ? (
              <p className="text-xl font-bold font-mono text-zinc-900">
                {monthlyTotalUsage.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} 度
              </p>
            ) : (
              <p className="text-sm font-bold text-amber-600 font-sans pt-1">
                未归档抄表数据
              </p>
            )}
          </div>
          <div className="border-t border-zinc-100 pt-2 flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-sans">回路核定电费</span>
            <span className="font-mono font-bold text-zinc-800">
              {monthlyRecord ? (
                `￥${monthlyTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              ) : (
                "无核销数据"
              )}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200/60 bg-zinc-50/20 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-505 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator className="h-4 w-4 text-zinc-600" />
              稽核轧差与核算偏差
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              !monthlyRecord
                ? "bg-zinc-100 text-zinc-500"
                : Math.abs(realDiffPercent) < 3.0
                  ? "bg-emerald-50 text-emerald-700"
                  : Math.abs(realDiffPercent) < 5.0
                    ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-700 animate-pulse"
            }`}>
              {!monthlyRecord ? "待抄表" : Math.abs(realDiffPercent) < 3.0 ? "核对通过" : Math.abs(realDiffPercent) < 5.0 ? "轻微偏差" : "偏差过大"}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-zinc-400">轧差电量偏差</span>
            <p className={`text-xl font-black font-mono ${
              !monthlyRecord
                ? "text-zinc-400"
                : diffUsage >= 0
                  ? "text-amber-700"
                  : "text-emerald-700"
            }`}>
              {diffUsage >= 0 ? "+" : ""}
              {monthlyRecord ? diffUsage.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "0.0"} 度
              {monthlyRecord && (
                <span className="text-xs ml-1.5 font-sans font-semibold">
                  ({realDiffPercent >= 0 ? "+" : ""}
                  {realDiffPercent.toFixed(1)}%)
                </span>
              )}
            </p>
          </div>
          <div className="border-t border-zinc-100 pt-2 flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-sans">轧差财务电费</span>
            <span className={`font-mono font-bold ${
              !monthlyRecord
                ? "text-zinc-650"
                : diffCost >= 0
                  ? "text-amber-700"
                  : "text-emerald-700"
            }`}>
              {monthlyRecord ? `${diffCost >= 0 ? "+" : ""}￥${diffCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "￥0.00"}
            </span>
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-xl border flex items-start space-x-3 transition-colors ${
        !monthlyRecord
          ? "bg-zinc-50 border-zinc-200 text-zinc-600"
          : Math.abs(realDiffPercent) < 3.0
            ? "bg-emerald-50/50 border-emerald-100 text-emerald-800"
            : Math.abs(realDiffPercent) < 5.0
              ? "bg-amber-50/50 border-amber-100 text-amber-800"
              : "bg-red-50/50 border-red-100 text-red-800"
      }`}>
        {!monthlyRecord ? (
          <FileWarning className="h-5 w-5 text-zinc-500 mt-0.5 flex-shrink-0" />
        ) : Math.abs(realDiffPercent) < 3.0 ? (
          <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
        ) : Math.abs(realDiffPercent) < 5.0 ? (
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        )}
        <div className="space-y-1 flex-1">
          <span className="text-xs font-bold select-none uppercase tracking-widest block">
            {!monthlyRecord ? "【审计核备提示】" : Math.abs(realDiffPercent) < 3.0 ? "【母回路对账轧差审计通过】" : Math.abs(realDiffPercent) < 5.0 ? "【二级用电回路微调稽查建议】" : "【总工程师现场高压下达指令】"}
          </span>
          <p className="text-xs leading-relaxed font-sans font-medium whitespace-pre-line text-zinc-700">
            {getAuditingDirective(auditMonth, startStr, endStr, monthlyRecord, realDiffPercent, diffUsage, daysCollected, expectedDays, 日常回路配置)}
          </p>
        </div>
      </div>
    </div>
  );
};
