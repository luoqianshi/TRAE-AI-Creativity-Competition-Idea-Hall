import React from "react";
import { motion } from "motion/react";

interface TrendBarChartProps {
  title: string;
  subtitle: string;
  data: { date: string; value: number }[];
  limit: number;
  unit: string;
  barColorClass: string; // e.g. "bg-zinc-800"
  hoverColorClass: string; // e.g. "group-hover:bg-cyan-600"
  overLimitColorClass: string; // e.g. "bg-amber-400 group-hover:bg-amber-500"
  id?: string;
}

export const TrendBarChart: React.FC<TrendBarChartProps> = ({
  title,
  subtitle,
  data,
  unit,
  barColorClass,
  hoverColorClass,
  id,
}) => {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const highestValue = Math.max(...data.map((d) => d.value), 0);

  return (
    <div
      className="bg-white border border-zinc-200/60 rounded-2xl shadow-xs p-6 space-y-6 flex flex-col justify-between select-none"
      id={id}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-[10px] text-zinc-400 mt-1 font-sans">{subtitle}</p>
        </div>
        <span className="text-[10px] bg-zinc-50 border border-zinc-200/50 text-zinc-500 rounded-lg px-2 py-1 font-bold font-mono">
          最高: {highestValue.toFixed(1)} {unit}
        </span>
      </div>

      <div className="h-48 flex items-end justify-between gap-2.5 pt-4 border-b border-zinc-200/40 pb-2 flex-grow">
        {data.map((item, idx) => {
          const ratio = (item.value / maxVal) * 100;
          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center group relative cursor-pointer h-full justify-end"
            >
              {/* Tooltip */}
              <div className="opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 absolute bottom-full mb-1.5 bg-slate-900 border border-slate-800 text-white rounded-xl py-2 px-3 text-xxs flex flex-col items-center shadow-lg transition-all duration-300 z-20 pointer-events-none whitespace-nowrap">
                <span className="font-semibold text-slate-300">
                  {item.date}
                </span>
                <span className="text-cyan-400 font-bold font-mono mt-0.5 text-xs">
                  {item.value.toFixed(1)} {unit}
                </span>
              </div>

              {/* Bar Wrapper */}
              <div className="w-full flex items-end justify-center rounded-t-lg bg-zinc-50/50 h-full relative overflow-visible hover:bg-zinc-100/50 transition-colors">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${ratio}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: idx * 0.05,
                  }}
                  className={`w-full max-w-[14px] rounded-t-lg transition-all duration-300 relative flex justify-center ${barColorClass} ${hoverColorClass}`}
                >
                  {item.value > 0 && (
                    <span className="absolute bottom-full mb-1 text-[9px] text-zinc-500 font-bold whitespace-nowrap font-mono scale-90 origin-bottom">
                      {Math.round(item.value)}
                    </span>
                  )}
                </motion.div>
              </div>

              <span className="text-[9px] text-zinc-400 font-bold mt-2 font-mono">
                {item.date.slice(5)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
