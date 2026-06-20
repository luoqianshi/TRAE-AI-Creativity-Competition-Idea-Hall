import { HistoryColumn } from "./historyColumnBuilder";

export function getCategoryHeaderStyles(col: HistoryColumn): string {
  switch (col.kind) {
    // 电
    case "category_total_kwh":
    case "category_total_cost":
      return "bg-rose-100/90 text-rose-950 border-rose-200/80";
    case "meter_usage":
    case "meter_kwh":
    case "meter_cost":
      return "bg-violet-100/90 text-violet-950 border-violet-200/80";
    case "meter_reading":
      return "bg-indigo-100/95 text-indigo-900 border-indigo-200/80";

    // 水
    case "category_total_water_usage":
    case "category_total_water_cost":
      return "bg-amber-100/90 text-amber-950 border-amber-200/80";
    case "meter_usage":
    case "meter_cost":
    case "meter_price":
      return "bg-cyan-100/90 text-cyan-950 border-cyan-200/80";
    case "meter_reading":
      return "bg-sky-100/95 text-sky-900 border-sky-200/80";

    // 气
    case "category_total_gas_usage":
    case "category_total_gas_cost":
      return "bg-amber-100/90 text-amber-950 border-amber-200/80";
    case "meter_usage":
    case "category_price":
      return "bg-teal-100/90 text-teal-950 border-teal-200/80 w-[90px]";
    case "meter_cost":
      return "bg-teal-100/90 text-teal-950 border-teal-200/80 w-[90px] border-r border-r-zinc-400";
    case "meter_reading":
    case "gas_group_usage":
      return "bg-emerald-100/95 text-emerald-900 border-emerald-200/80 w-[90px]";

    default:
      return "bg-zinc-100/95 text-zinc-700 border-zinc-200/80";
  }
}

export function getCategoryCellStyles(col: HistoryColumn): string {
  switch (col.kind) {
    // 电
    case "category_total_kwh":
    case "category_total_cost":
      return "text-rose-600 bg-rose-50/20 font-bold";
    case "meter_usage":
      return "text-indigo-600 bg-indigo-50/20 font-medium italic";
    case "meter_kwh":
      return "text-violet-600 bg-violet-150/10 font-bold";
    case "meter_price":
      return "text-cyan-700 bg-cyan-50/10";
    case "meter_cost":
      return "text-red-700 bg-red-50/10 font-bold";
    case "meter_reading":
      return "text-indigo-850 bg-indigo-50/10 font-bold";

    // 水
    case "category_total_water_usage":
    case "category_total_water_cost":
      return "text-amber-600 bg-amber-50/20 font-bold";
    case "meter_usage":
      return "text-sky-600 bg-sky-50/20 font-medium italic";
    case "meter_price":
      return "text-teal-700 bg-teal-50/10";
    case "meter_cost":
      return "text-orange-700 bg-orange-50/10 font-bold";
    case "meter_reading":
      return "text-sky-800 bg-sky-50/10";

    // 气
    case "category_total_gas_usage":
    case "category_total_gas_cost":
      return "text-amber-600 bg-amber-50/20 font-bold";
    case "meter_usage":
      return "text-emerald-600 bg-emerald-50/20 font-medium italic";
    case "category_price":
      return "text-teal-700 bg-teal-50/10";
    case "meter_cost":
      return "text-red-700 bg-red-50/10 font-bold border-r border-r-zinc-400";
    case "meter_reading":
    case "gas_group_usage":
      return "text-emerald-800 bg-emerald-50/10";

    default:
      return "text-zinc-650";
  }
}
