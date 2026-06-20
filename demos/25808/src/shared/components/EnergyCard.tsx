import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface EnergyCardProps {
  name: string;
  value: number;
  prevValue: number;
  limit: number;
  unit: string;
  Icon: LucideIcon;
  id?: string;
  cost?: number;
  category?: "电" | "水" | "气";
  customDiff?: number;
  isSwapped?: boolean;
}

export const EnergyCard: React.FC<EnergyCardProps> = ({
  name,
  value,
  prevValue,
  unit,
  Icon,
  id,
  cost,
  category,
  customDiff,
  isSwapped
}) => {
  const diff = customDiff !== undefined ? customDiff : value - prevValue;

  const getThemeClasses = () => {
    switch (category) {
      case "电":
        return {
          border: "bg-indigo-500",
          iconBg: "bg-indigo-500/10 text-indigo-600",
          valueText: "text-indigo-900",
          costText: "text-indigo-700",
        };
      case "水":
        return {
          border: "bg-sky-500",
          iconBg: "bg-sky-500/10 text-sky-600",
          valueText: "text-sky-900",
          costText: "text-sky-700",
        };
      case "气":
        return {
          border: "bg-emerald-500",
          iconBg: "bg-emerald-500/10 text-emerald-600",
          valueText: "text-emerald-900",
          costText: "text-emerald-700",
        };
      default:
        return {
          border: "bg-emerald-500",
          iconBg: "bg-emerald-500/10 text-emerald-600",
          valueText: "text-zinc-900",
          costText: "text-zinc-700",
        };
    }
  };

  const theme = getThemeClasses();

  return (
    <motion.div
      id={id}
      whileHover={{ y: -4, scale: 1.01, boxShadow: '0 12px 20px -8px rgba(0, 0, 0, 0.08)' }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="bg-white border rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-colors select-none duration-300 border-zinc-200/80 hover:border-zinc-300 shadow-xs"
    >
      {/* Dynamic top border indicator */}
      <span className={`absolute top-0 inset-x-0 h-[3px] ${theme.border}`} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 overflow-hidden">
            <span className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase font-sans truncate">{name}</span>
            {isSwapped && (
              <span className="px-1 py-0.5 rounded bg-amber-500/10 text-amber-700 font-extrabold text-[9px] scale-[0.85] origin-left border border-amber-500/10 whitespace-nowrap">
                已换表/调校
              </span>
            )}
          </div>
          <div className={`p-2 rounded-xl transition-all ${theme.iconBg}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-3xl font-extrabold tracking-tight font-sans ${theme.valueText}`}>{value.toLocaleString()}</span>
            <span className="text-[10px] text-zinc-400 font-bold tracking-wider font-sans">{unit}</span>
          </div>
          {cost !== undefined && (
            <div className="mt-1 text-xs text-zinc-500 font-sans flex items-center gap-1">
              结算成本: <span className={`font-mono font-bold ${theme.costText}`}>￥{cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] border-t border-zinc-100 mt-4 pt-3.5 font-sans">
        <span className="text-zinc-400 font-medium">对比昨日</span>
        {diff >= 0 ? (
          <span className="text-amber-600 font-bold flex items-center bg-amber-500/5 px-2 py-0.5 rounded-lg border border-amber-500/10">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>+{diff.toFixed(1)} {unit}</span>
          </span>
        ) : (
          <span className="text-emerald-600 font-bold flex items-center bg-emerald-500/5 px-2 py-0.5 rounded-lg border border-emerald-500/10">
            <TrendingDown className="h-3 w-3 mr-1" />
            <span>{diff.toFixed(1)} {unit}</span>
          </span>
        )}
      </div>
    </motion.div>
  );
};
