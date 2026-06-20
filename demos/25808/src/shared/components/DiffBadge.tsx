import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface DiffBadgeProps {
  diff: number;
  unit: string;
  showBackground?: boolean;
}

export const DiffBadge: React.FC<DiffBadgeProps> = ({
  diff,
  unit,
  showBackground = false,
}) => {
  const isPositive = diff >= 0;

  if (showBackground) {
    return (
      <span
        className={`font-bold flex items-center px-2 py-0.5 rounded-lg border ${
          isPositive
            ? "text-amber-600 bg-amber-500/5 border-amber-500/10"
            : "text-emerald-600 bg-emerald-500/5 border-emerald-500/10"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3 mr-1" />
        ) : (
          <TrendingDown className="h-3 w-3 mr-1" />
        )}
        <span>
          {isPositive ? "+" : ""}
          {diff.toFixed(1)} {unit}
        </span>
      </span>
    );
  }

  return (
    <span
      className={`font-bold flex items-center ${
        isPositive ? "text-amber-600" : "text-emerald-600"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
      ) : (
        <TrendingDown className="h-3.5 w-3.5 mr-0.5" />
      )}
      {isPositive ? "+" : ""}
      {diff.toFixed(1)}
    </span>
  );
};
