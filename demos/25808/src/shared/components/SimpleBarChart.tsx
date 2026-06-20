import React from "react";

interface SimpleBarChartProps {
  data: { date: string; val: number }[];
  colorClass?: string;
  hoverColorClass?: string;
  labelColorClass?: string;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  colorClass = "bg-zinc-700",
  hoverColorClass = "group-hover:bg-cyan-600",
  labelColorClass = "text-zinc-600",
}) => {
  const maxVal = Math.max(...data.map((d) => d.val), 100);

  return (
    <div className="h-64 flex items-end justify-between gap-3 pt-4 border-b border-zinc-200/50 pb-2 flex-grow">
      {data.map((item, idx) => {
        const ratio = (item.val / maxVal) * 100;
        return (
          <div
            key={idx}
            className="flex-1 flex flex-col items-center group relative cursor-pointer h-full"
          >
            <div className="w-full flex items-end justify-center rounded-t-md bg-zinc-50 h-full relative overflow-visible">
              <div
                style={{ height: `${ratio}%` }}
                className={`w-full max-w-[32px] rounded-t-sm transition-all duration-500 ${colorClass} ${hoverColorClass} relative`}
              >
                {item.val > 0 && (
                  <span className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-[10px] ${labelColorClass} font-bold whitespace-nowrap`}>
                    {Math.round(item.val)}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-zinc-400 mt-3 font-sans truncate">
              {item.date}
            </span>
          </div>
        );
      })}
    </div>
  );
};
