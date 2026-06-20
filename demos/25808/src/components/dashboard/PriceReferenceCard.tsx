import React from "react";
import { getDailyPrices } from "../../shared/utils/pricing";
import { 字典配置, DailyFieldConfig } from "../../shared/types";

interface PriceReferenceCardProps {
  displayRecord: any;
  dashboardDate: string;
  限额配置: 字典配置;
  回路配置列表?: DailyFieldConfig[];
}

export const PriceReferenceCard: React.FC<PriceReferenceCardProps> = ({
  displayRecord,
  dashboardDate,
  限额配置,
  回路配置列表 = [],
}) => {
  const date = displayRecord?.日期 || dashboardDate || "";
  const prices = 回路配置列表.length > 0 
    ? getDailyPrices(date, 限额配置, 回路配置列表)
    : { 
        电: { 单价: 限额配置.电费单价 || 0, 状态: 'found' as const }, 
        水: { 单价: 限额配置.水费单价 || 0, 状态: 'found' as const }, 
        气: { 单价: 限额配置.气费单价 || 0, 状态: 'found' as const } 
      };
  
  const hasCircuitPricing = 限额配置.回路价格历史列表 && 限额配置.回路价格历史列表.length > 0;

  return (
    <div
      className={`bg-white border ${hasCircuitPricing ? 'border-emerald-200 bg-emerald-50/5' : 'border-zinc-200/60'} rounded-2xl p-4 shadow-xs flex flex-col space-y-2.5 min-w-[320px] transition-all`}
      id="energy_price_ref"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase font-bold text-zinc-500 tracking-wider">
          该账期执行能耗对账单价
        </span>
        {hasCircuitPricing && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">回路级价格</span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className={`p-2 border rounded-xl ${prices.电.状态 === 'found' ? 'bg-zinc-50/50 border-zinc-200' : 'bg-amber-50 border-amber-300'}`}>
          <p className="text-xs text-zinc-500 font-semibold">电价</p>
          <p className={`text-sm font-bold mt-0.5 font-mono ${prices.电.状态 === 'found' ? 'text-zinc-800' : 'text-amber-600'}`}>
            {prices.电.状态 === 'found' 
              ? `￥${prices.电.单价.toFixed(2)}`
              : prices.电.告警信息?.includes("未配置") ? "未配置" : "—"}
          </p>
        </div>
        <div className={`p-2 border rounded-xl ${prices.水.状态 === 'found' ? 'bg-zinc-50/50 border-zinc-200' : 'bg-amber-50 border-amber-300'}`}>
          <p className="text-xs text-zinc-500 font-semibold">水价</p>
          <p className={`text-sm font-bold mt-0.5 font-mono ${prices.水.状态 === 'found' ? 'text-zinc-800' : 'text-amber-600'}`}>
            {prices.水.状态 === 'found' 
              ? `￥${prices.水.单价.toFixed(2)}`
              : prices.水.告警信息?.includes("未配置") ? "未配置" : "—"}
          </p>
        </div>
        <div className={`p-2 border rounded-xl ${prices.气.状态 === 'found' ? 'bg-zinc-50/50 border-zinc-200' : 'bg-amber-50 border-amber-300'}`}>
          <p className="text-xs text-zinc-500 font-semibold">燃气价</p>
          <p className={`text-sm font-bold mt-0.5 font-mono ${prices.气.状态 === 'found' ? 'text-zinc-800' : 'text-amber-600'}`}>
            {prices.气.状态 === 'found' 
              ? `￥${prices.气.单价.toFixed(2)}`
              : prices.气.告警信息?.includes("未配置") ? "未配置" : "—"}
          </p>
        </div>
      </div>
    </div>
  );
};
