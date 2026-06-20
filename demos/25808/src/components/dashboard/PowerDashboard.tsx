import React from "react";
import { motion } from "motion/react";
import { Zap } from "lucide-react";
import { TrendViewToggle } from "./TrendViewToggle";
import {
  抄表记录,
  字典配置,
  DailyFieldConfig,
  月度抄表记录,
  MonthlyCircuitConfig,
} from "../../shared/types";
import { getEnrichedDailyRecords, getPrice } from "../../shared/utils/pricing";
import { ReconciliationConsole } from "./ReconciliationConsole";
import { SimpleBarChart } from "../../shared/components/SimpleBarChart";
import { DiffBadge } from "../../shared/components/DiffBadge";

interface PowerDashboardProps {
  最新记录: 抄表记录;
  昨日记录: 抄表记录;
  限额配置: 字典配置;
  历史数据: 抄表记录[];
  日常回路配置: DailyFieldConfig[];
  月度历史: 月度抄表记录[];
  circuitData: MonthlyCircuitConfig[];
}

export const PowerDashboard: React.FC<PowerDashboardProps> = ({
  最新记录,
  昨日记录,
  限额配置,
  历史数据,
  日常回路配置,
  月度历史,
  circuitData,
}) => {
  const [view, setView] = React.useState<"daily" | "monthly">("daily");
  const [date, setDate] = React.useState<string>("");

  React.useEffect(() => {
    if (历史数据.length > 0) {
      const latest = 历史数据[历史数据.length - 1].日期.substring(0, 7);
      setDate(latest);
    }
  }, [历史数据]);

  const elecFields = React.useMemo(
    () => 日常回路配置.filter((f) => f.category === "电"),
    [日常回路配置],
  );

  const filteredData = React.useMemo(() => {
    const enriched = getEnrichedDailyRecords(历史数据, 限额配置, 日常回路配置);

    if (view === "daily") {
      if (!date) return [];
      const [year, month] = date.split("-").map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      const data = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
        const match = enriched.find((item) => item.日期 === dateStr);
        data.push({
          date: String(i),
          val: match ? match.电量 : 0,
        });
      }
      return data;
    } else {
      const groups: { [month: string]: number } = {};
      const year = date.split("-")[0];
      enriched
        .filter((item) => item.日期.startsWith(year))
        .forEach((item) => {
          const m = item.日期.substring(0, 7);
          groups[m] = (groups[m] || 0) + item.电量;
        });
      return Object.keys(groups)
        .sort()
        .map((m) => ({ date: m.slice(5) + "月", val: groups[m] }));
    }
  }, [历史数据, view, date, 日常回路配置, 限额配置]);

  return (
    <motion.div
      key="用电看板内容"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
      id="power_dashboard_root"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2
            className="text-2xl font-bold tracking-tight text-zinc-900"
            id="power_dashboard_title"
          >
            今日用电看板
          </h2>
          <p className="text-xs text-zinc-500 mt-1 font-sans">
            数据提取自最近一次抄表登记日期：{最新记录.日期}
          </p>
        </div>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        id="power_cards_grid"
      >
        {elecFields.map((field) => {
          const 值 =
            最新记录[field.id as keyof 抄表记录] !== undefined
              ? Number(最新记录[field.id as keyof 抄表记录])
              : 0;
          const 昨 =
            昨日记录[field.id as keyof 抄表记录] !== undefined
              ? Number(昨日记录[field.id as keyof 抄表记录])
              : 0;
          const 差 = 值 - 昨;
          return (
            <div
              className="bg-white border border-zinc-200/60 rounded-xl p-5 shadow-xs flex flex-col space-y-4 hover:shadow-sm transition-all"
              key={field.id}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-700">
                  {field.name}
                </span>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Zap className="h-4.5 w-4.5" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-zinc-900">
                  {值.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-500 ml-1.5 font-bold">
                  {field.unit}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-zinc-100 pt-3">
                <span className="text-zinc-500 font-medium font-sans">
                  对比昨日
                </span>
                <DiffBadge diff={差} unit={field.unit} />
              </div>
            </div>
          );
        })}

        <div className="bg-white border border-zinc-200/60 rounded-xl p-5 shadow-xs flex flex-col justify-center space-y-2">
          <h4 className="text-xs font-bold text-zinc-900">当期计费单价</h4>
          <div className="p-3 rounded-xl border border-zinc-200/55 bg-zinc-50/50 mt-2 text-center">
            <p className="text-xs text-zinc-500">
              电费价格 (截止{最新记录.日期})
            </p>
            <p className="text-sm font-bold text-zinc-800 mt-1">
              ￥
              {(elecFields.length > 0
                ? (getPrice(elecFields[0].id, 最新记录.日期, 限额配置, 日常回路配置).单价 || 限额配置.电费单价 || 0)
                : (限额配置.电费单价 || 0)).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <ReconciliationConsole
        限额配置={限额配置}
        历史数据={历史数据}
        日常回路配置={日常回路配置}
        月度历史={月度历史}
        circuitData={circuitData}
      />

      <div
        className="bg-white border border-zinc-200/60 rounded-2xl shadow-xs p-6 space-y-6 flex flex-col"
        id="power_chart_container"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">动力用电走势</h3>
            <p className="text-xs text-zinc-500 mt-1">综合动力回路累计负荷</p>
          </div>
          <TrendViewToggle
            view={view}
            setView={setView}
            date={date}
            setDate={setDate}
            历史数据={历史数据}
          />
        </div>
        <SimpleBarChart
          data={filteredData}
          colorClass="bg-zinc-700"
          hoverColorClass="group-hover:bg-cyan-600"
          labelColorClass="text-zinc-600"
        />
      </div>
    </motion.div>
  );
};
