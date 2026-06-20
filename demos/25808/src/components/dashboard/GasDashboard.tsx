import React from "react";
import { motion } from "motion/react";
import { Flame, Settings } from "lucide-react";
import { TrendViewToggle } from "./TrendViewToggle";
import { 抄表记录, 字典配置, DailyFieldConfig } from "../../shared/types";
import { getPrice } from "../../shared/utils/pricing";
import { SimpleBarChart } from "../../shared/components/SimpleBarChart";
import { DiffBadge } from "../../shared/components/DiffBadge";
import { useGasGroups } from "../../shared/hooks/useGasGroups";
import { GasGroupSettings } from "../GasGroupSettings";

interface GasDashboardProps {
  最新记录: 抄表记录;
  昨日记录: 抄表记录;
  限额配置: 字典配置;
  历史数据: 抄表记录[];
  日常回路配置: DailyFieldConfig[];
}

export const GasDashboard: React.FC<GasDashboardProps> = ({
  最新记录,
  昨日记录,
  限额配置,
  历史数据,
  日常回路配置,
}) => {
  const { groups, saveGroups } = useGasGroups();
  const [view, setView] = React.useState<"daily" | "monthly">("daily");
  const [date, setDate] = React.useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  React.useEffect(() => {
    if (历史数据.length > 0) {
      const latest = 历史数据[历史数据.length - 1].日期.substring(0, 7);
      setDate(latest);
    }
  }, [历史数据]);

  const gasFields = React.useMemo(
    () => 日常回路配置.filter((f) => f.category === "气"),
    [日常回路配置],
  );
  
  const calculateTotalGasField = (fields: DailyFieldConfig[], record: 抄表记录) => {
    return fields.reduce((sum, f) => sum + (record[f.id as keyof 抄表记录] !== undefined ? Number(record[f.id as keyof 抄表记录]) : 0), 0);
  }

  const gasDashboardDynamicCards = groups.map(group => {
    const fields = gasFields.filter(f => group.memberIds.includes(f.id) || (group.memberIds.length === 0 && f.name.includes(group.name)));
    const total = calculateTotalGasField(fields, 最新记录);
    const prevTotal = calculateTotalGasField(fields, 昨日记录);
    const diff = total - prevTotal;
    const gasPrice = gasFields.length > 0
      ? (getPrice(gasFields[0].id, 最新记录.日期, 限额配置, 日常回路配置).单价 || 限额配置.气费单价 || 0)
      : (限额配置.气费单价 || 0);

    return (
        <div
            key={group.id}
            className="bg-white border border-zinc-200/60 rounded-xl p-5 shadow-xs flex flex-col space-y-4 hover:shadow-sm transition-all"
            id={`gas_card_${group.id}`}
        >
            <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-700">
                    {group.name}
                </span>
                <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                    <Flame className="h-4.5 w-4.5" />
                </div>
            </div>
            <div>
                <span className="text-2xl font-black tracking-tight text-zinc-900">
                    {total.toFixed(1)}
                </span>
                <span className="text-xs text-zinc-500 ml-1.5 font-bold">
                    立方
                </span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-zinc-100 pt-3">
                <span className="text-zinc-650 font-bold">
                    {(total * gasPrice || 0).toFixed(2)} 元
                </span>
                <DiffBadge diff={diff} unit="立方" />
            </div>
        </div>
    );
  });

  const calculateTotalGas = (h: 抄表记录) => {
    return calculateTotalGasField(gasFields, h);
  };

  const filteredData = React.useMemo(() => {
    if (view === "daily") {
      if (!date) return [];
      const [year, month] = date.split("-").map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();
      const data = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
        const record = 历史数据.find((h) => h.日期 === dateStr);
        data.push({
          date: String(i),
          val: record ? calculateTotalGas(record) : 0,
        });
      }
      return data;
    } else {
      const groups: { [month: string]: number } = {};
      const year = date.split("-")[0];
      历史数据
        .filter((h) => h.日期.startsWith(year))
        .forEach((h) => {
          const m = h.日期.substring(0, 7);
          groups[m] = (groups[m] || 0) + calculateTotalGas(h);
        });
      return Object.keys(groups)
        .sort()
        .map((m) => ({ date: m.slice(5) + "月", val: groups[m] }));
    }
  }, [历史数据, view, date]);

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
      id="gas_dashboard_view"
    >
      <div className="border-b border-zinc-100 pb-4 flex justify-between items-center">
        <h2 className="text-base font-bold text-zinc-900 tracking-wider flex items-center space-x-2">
          <Flame className="h-5.5 w-5.5 text-orange-500" />
          <span>天然气汇总运营与动力分析面板</span>
        </h2>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-zinc-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
      <p className="text-xs text-zinc-500 mt-1 font-sans">
        追踪分析主天然气表与二级厨房炉灶、餐饮宴会、锅炉消耗比例及价格结算核算
      </p>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        id="gas_cards_grid"
      >
        {gasDashboardDynamicCards}

        {(() => {
          const 总气Field = 日常回路配置.filter((f) => f.category === "气");
          const 总气 =
            总气Field.reduce(
              (sum, f) =>
                sum +
                (最新记录[f.id] !== undefined ? Number(最新记录[f.id]) : 0),
              0,
            ) ||
            最新记录.天然气表 ||
            0;
          const 昨总气 =
            总气Field.reduce(
              (sum, f) =>
                sum +
                (昨日记录[f.id] !== undefined ? Number(昨日记录[f.id]) : 0),
              0,
            ) ||
            昨日记录.天然气表 ||
            0;
          const 差 = 总气 - 昨总气;
          const gasPrice2 = gasFields.length > 0
            ? (getPrice(gasFields[0].id, 最新记录.日期, 限额配置, 日常回路配置).单价 || 限额配置.气费单价 || 0)
            : (限额配置.气费单价 || 0);
          return (
            <div
              className="bg-white border border-zinc-200/60 rounded-xl p-5 shadow-xs flex flex-col space-y-4 hover:shadow-sm transition-all ring-1 ring-orange-100 bg-orange-50/10"
              id="gas_card_total"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-805">
                  燃气每日总量
                </span>
                <span className="text-xs font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                  单价: ￥{gasPrice2.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-orange-600">
                  {总气.toFixed(1)}
                </span>
                <span className="text-xs text-zinc-500 ml-1.5 font-bold">
                  立方 (每日费: ￥{(总气 * gasPrice2 || 0).toFixed(2)})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-zinc-100 pt-3">
                <span className="text-zinc-500 font-medium">总体对比昨日</span>
                <DiffBadge diff={差} unit="立方" />
              </div>
            </div>
          );
        })()}
      </div>

      <div
        className="bg-white border border-zinc-200/60 rounded-2xl shadow-xs p-6"
        id="gas_details_grid"
      >
        <h3 className="text-sm font-bold text-zinc-900 mb-6">
          各区域表数明细参考结构
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {日常回路配置
            .filter((f) => f.category === "气")
            .map((field) => {
              const cellVal =
                最新记录[field.id] !== undefined && 最新记录[field.id] !== null
                  ? Number(最新记录[field.id])
                  : 0;
              return (
                <div
                  key={field.id}
                  className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 flex flex-col items-center justify-center text-center hover:bg-zinc-50 transition-colors"
                >
                  <span className="text-xs font-bold text-zinc-700 mb-1">
                    {field.name}
                  </span>
                  <span className="text-lg font-mono font-bold text-zinc-800">
                    {cellVal.toFixed(1)}
                  </span>
                  <span className="text-xs text-zinc-400 mt-1">m³</span>
                </div>
              );
            })}
        </div>
      </div>

      <div
        className="bg-white border border-zinc-200/60 rounded-2xl shadow-xs p-6 space-y-6 flex flex-col"
        id="gas_combined_chart"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">
              锅炉与厨房用气走势
            </h3>
            <p className="text-xs text-zinc-500 mt-1">燃气总消耗</p>
          </div>
          <TrendViewToggle
            view={view}
            setView={(newView) => {
              const dates = newView === "daily" ? months : years;
              setView(newView);
              if (dates.length > 0) setDate(dates[0]);
            }}
            date={date}
            setDate={setDate}
            历史数据={[]}
          />
        </div>
        <SimpleBarChart
          data={filteredData}
          colorClass="bg-orange-500"
          hoverColorClass="group-hover:bg-orange-400"
          labelColorClass="text-orange-600"
        />
      </div>

      <GasGroupSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        groups={groups}
        saveGroups={saveGroups}
        allGasFields={gasFields}
      />
    </motion.div>
  );
};
