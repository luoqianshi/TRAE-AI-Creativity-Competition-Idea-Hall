import React from "react";
import { 抄表记录 } from "../../shared/types";

interface TrendViewToggleProps {
  view: "daily" | "monthly";
  setView: (v: "daily" | "monthly") => void;
  date: string;
  setDate: (d: string) => void;
  历史数据: 抄表记录[];
}

export const TrendViewToggle: React.FC<TrendViewToggleProps> = ({
  view,
  setView,
  date,
  setDate,
  历史数据,
}) => {
  const months: string[] = Array.from(
    new Set<string>(历史数据.map((h) => h.日期.substring(0, 7))),
  )
    .sort()
    .reverse();
  const years: string[] = Array.from(
    new Set<string>(历史数据.map((h) => h.日期.substring(0, 4))),
  )
    .sort()
    .reverse();

  const options = view === "daily" ? months : years;

  const handleViewChange = (newView: "daily" | "monthly") => {
    setView(newView);
    if (newView === "daily") {
      setDate(months[0] || "");
    } else {
      setDate(years[0] || "");
    }
  };

  return (
    <div className="flex gap-2 items-center">
      {options.length > 0 && (
        <select
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-zinc-100 text-[10px] font-bold text-zinc-600 rounded-lg px-2 py-1 border-none focus:ring-0"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {view === "daily" ? o.replace("-", "年") + "月" : o + "年"}
            </option>
          ))}
        </select>
      )}
      <div className="flex bg-zinc-100 rounded-lg p-0.5 shrink-0">
        <button
          className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${view === "daily" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
          onClick={() => handleViewChange("daily")}
        >
          日
        </button>
        <button
          className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${view === "monthly" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
          onClick={() => handleViewChange("monthly")}
        >
          月
        </button>
      </div>
    </div>
  );
};
