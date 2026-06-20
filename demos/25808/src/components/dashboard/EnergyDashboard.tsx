import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Zap, Droplet, Flame } from "lucide-react";
import { 抄表记录, 字典配置, DailyFieldConfig } from "../../shared/types";
import { EnergyCard } from "../../shared/components/EnergyCard";
import { CombinedTrendChart } from "./CombinedTrendChart";
import { getFieldConsumption, getPrice } from "../../shared/utils/pricing";
import { apiService } from "../../shared/services/apiService";
import { TrendViewToggle } from "./TrendViewToggle";
import { getMonthlyGroups } from "./dashboardCalculations";
import { PriceReferenceCard } from "./PriceReferenceCard";
import { MonthlyInsights } from "./MonthlyInsights";

interface EnergyDashboardProps {
  最新记录: 抄表记录;
  昨日记录: 抄表记录;
  日常回路配置: DailyFieldConfig[];
  限额配置: 字典配置;
  历史数据: 抄表记录[];
}

export const EnergyDashboard: React.FC<EnergyDashboardProps> = ({
  最新记录: prop最新,
  昨日记录: prop昨日,
  日常回路配置,
  限额配置,
  历史数据,
}) => {
  const [dashboardDate, setDashboardDate] = React.useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });

  const foundRecord = 历史数据.find((h) => h.日期 === dashboardDate);
  const displayRecord = foundRecord || (dashboardDate ? null : prop最新);

  const isFallbackDate = !foundRecord && !dashboardDate;
  const isNoDataDate = !foundRecord && !!dashboardDate;

  let displayPrevRecord = prop昨日;
  if (dashboardDate && foundRecord) {
    const sorted = [...历史数据].sort((a, b) => a.日期.localeCompare(b.日期));
    const idx = sorted.findIndex((h) => h.日期 === dashboardDate);
    if (idx > 0) {
      displayPrevRecord = sorted[idx - 1];
    } else {
      displayPrevRecord = foundRecord;
    }
  }

  const [selectedElecId, setSelectedElecId] = React.useState<string>("all");
  const [elecTrendView, setElecTrendView] = React.useState<"daily" | "monthly">("daily");
  const [elecDate, setElecDate] = React.useState<string>("");
  const [selectedWaterId, setSelectedWaterId] = React.useState<string>("all");
  const [waterTrendView, setWaterTrendView] = React.useState<"daily" | "monthly">("daily");
  const [waterDate, setWaterDate] = React.useState<string>("");
  const [selectedGasId, setSelectedGasId] = React.useState<string>("all");
  const [gasTrendView, setGasTrendView] = React.useState<"daily" | "monthly">("daily");
  const [gasDate, setGasDate] = React.useState<string>("");

  const [dailyStats, setDailyStats] = useState<{ date: string; electricity: number; water: number; gas: number }[]>([]);

  React.useEffect(() => {
    if (历史数据.length > 0) {
      const latest = 历史数据[历史数据.length - 1].日期.substring(0, 7);
      setElecDate(latest);
      setWaterDate(latest);
      setGasDate(latest);
    }
  }, [历史数据]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const month = elecDate || waterDate || gasDate;
        if (month) {
          const stats = await apiService.getDailyStatistics(month);
          setDailyStats(stats);
        }
      } catch (error) {
        console.error('Failed to fetch daily statistics:', error);
      }
    };
    fetchStats();
  }, [elecDate, waterDate, gasDate]);

  const getVal = (rec: any, id: string) => {
    const v = rec[id];
    if (v === undefined || v === null || v === "") return 0;
    const n = parseFloat(String(v).replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const elecFields = 日常回路配置.filter((f) => f.category === "电");
  const waterFields = 日常回路配置.filter((f) => f.category === "水");
  const gasFields = 日常回路配置.filter((f) => f.category === "气");

  const powerTrendData = dailyStats.map(s => ({ date: s.date, value: s.electricity }));
  const waterTrendData = dailyStats.map(s => ({ date: s.date, value: s.water }));
  const gasTrendData = dailyStats.map(s => ({ date: s.date, value: s.gas }));

  const powerChartTitle =
    selectedElecId === "all"
      ? "动力综合用电走势"
      : `${elecFields.find((f) => f.id === selectedElecId)?.name || "分路"}用电自控走势`;
  const powerChartSubtitle =
    selectedElecId === "all"
      ? "全负荷动力供电回路累计各期耗量"
      : "对应支线二级抄表回路累计各期负荷";

  const waterChartTitle =
    selectedWaterId === "all"
      ? "全水管综合用水走势"
      : `${waterFields.find((f) => f.id === selectedWaterId)?.name || "分路"}供水自控走势`;
  const waterChartSubtitle =
    selectedWaterId === "all"
      ? "全管网给水总表及支线累计各期耗量"
      : "对应支线二级给水水表累计各期负荷";

  const gasChartTitle =
    selectedGasId === "all"
      ? "全气线综合耗能走势"
      : `${gasFields.find((f) => f.id === selectedGasId)?.name || "分路"}燃气自控走势`;
  const gasChartSubtitle =
    selectedGasId === "all"
      ? "全品级天然气锅炉与厨房合并各期耗量"
      : "对应炉眼二级计量支线合并各期气耗";

  const monthlyGroups = getMonthlyGroups(历史数据, 限额配置, 日常回路配置);

  return (
    <motion.div
      key="能效大盘内容"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
      id="energy_dashboard_root"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-100 pb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <h2
              className="text-2xl font-bold tracking-tight text-zinc-900"
              id="energy_dashboard_title"
            >
              {限额配置.酒店名称 || "国信金融酒店"}能耗审计大盘
            </h2>
            <p className="text-sm text-zinc-500 mt-1 font-sans">
              {isFallbackDate ? (
                <>当前展示最新抄表：<span className="font-bold text-zinc-700">{displayRecord?.日期}</span>（对比 {displayPrevRecord?.日期}）</>
              ) : isNoDataDate ? (
                <span className="text-red-500 font-bold">警告：所选日期 [{dashboardDate}] 尚未登记抄表记录</span>
              ) : (
                <>当前检索结果：<span className="font-bold text-zinc-700">{displayRecord?.日期}</span>（对比 {displayPrevRecord?.日期}）</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2 shadow-sm">
            <span className="text-xs font-bold text-zinc-500 shrink-0">查询日期:</span>
            <input
              type="date"
              value={dashboardDate}
              onChange={(e) => setDashboardDate(e.target.value)}
              className="text-sm font-bold text-zinc-800 bg-transparent border-none focus:ring-0 p-0 cursor-pointer"
            />
          </div>
        </div>

        <PriceReferenceCard
          displayRecord={displayRecord}
          dashboardDate={dashboardDate}
          限额配置={限额配置}
        />
      </div>

      <MonthlyInsights
        monthlyGroups={monthlyGroups}
        dashboardDate={dashboardDate}
      />

      {!displayRecord ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center shadow-xs">
          <div className="inline-flex p-4 rounded-full bg-zinc-50 text-zinc-400 mb-4">
            <Zap className="w-8 h-8 opacity-20" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">该日期暂无抄表记录</h3>
          <p className="text-sm text-zinc-500 mt-2">所选日期 [{dashboardDate}] 尚未登记任何能耗数据，请切换日期或前往【日常抄表】录入。</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-wider font-sans">
              一、当前所有已开通表计回路用能总览（字典自动同步）
            </h3>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6"
              id="energy_cards_grid"
            >
              {日常回路配置.map((field) => {
                const val = getVal(displayRecord, field.id);
                const prevVal = displayPrevRecord ? getVal(displayPrevRecord, field.id) : val;
                const Icon =
                  field.category === "电"
                    ? Zap
                    : field.category === "水"
                      ? Droplet
                      : Flame;

                const ratio = 限额配置.电表换算基数 ?? 3500;
                const isSwapped = displayRecord && (displayRecord[`swap_${field.id}`] === true || displayRecord[`swap_${field.id}`] === "true");

                const netUsage = getFieldConsumption(displayRecord, displayPrevRecord, field.id, field.category, field.category === "电" ? ratio : 1);
                const priceResult = getPrice(field.id, displayRecord.日期, 限额配置, 日常回路配置);
                const fieldPrice = priceResult.单价 > 0 ? priceResult.单价 : (field.category === "电" ? 限额配置.电费单价 : field.category === "水" ? 限额配置.水费单价 : 限额配置.气费单价) || 0;
                const circuitCost = netUsage * fieldPrice;

                return (
                  <EnergyCard
                    key={field.id}
                    name={field.name}
                    value={val}
                    prevValue={prevVal}
                    limit={field.limit}
                    unit={field.unit}
                    Icon={Icon}
                    id={`energy_card_${field.id}`}
                    cost={circuitCost}
                    category={field.category as "电" | "水" | "气"}
                    customDiff={netUsage}
                    isSwapped={isSwapped}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-wider font-sans">
          二、所有电表/水表/天然气表趋势（请点击标签切换分表或品类汇总趋势）
        </h3>

        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in"
          id="energy_charts_grid"
        >
          <div
            className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between"
            id="chart_card_elec_wrapper"
          >
            <div className="flex flex-col space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-zinc-100 pb-3">
                <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mr-1 shrink-0">
                    电力筛选:
                  </span>
                  <button
                    onClick={() => setSelectedElecId("all")}
                    className={`px-2 py-1 rounded-md text-xs font-bold tracking-tight transition cursor-pointer select-none ${
                      selectedElecId === "all"
                        ? "bg-zinc-950 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    电量总计
                  </button>
                  {elecFields.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedElecId(f.id)}
                      className={`px-2 py-1 rounded-md text-xs font-bold tracking-tight transition cursor-pointer select-none ${
                        selectedElecId === f.id
                          ? "bg-zinc-950 text-white"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
                <TrendViewToggle
                  view={elecTrendView}
                  setView={setElecTrendView}
                  date={elecDate}
                  setDate={setElecDate}
                  历史数据={历史数据}
                />
              </div>
            </div>

            <CombinedTrendChart
              title={powerChartTitle}
              subtitle={powerChartSubtitle}
              data={powerTrendData}
              unit="度"
              color="#4f46e5"
            />
          </div>

          <div
            className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between"
            id="chart_card_water_wrapper"
          >
            <div className="flex flex-col space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-zinc-100 pb-3">
                <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mr-1 shrink-0">
                    给水筛选:
                  </span>
                  <button
                    onClick={() => setSelectedWaterId("all")}
                    className={`px-2 py-1 rounded-md text-xs font-bold tracking-tight transition cursor-pointer select-none ${
                      selectedWaterId === "all"
                        ? "bg-zinc-950 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    给水总计
                  </button>
                  {waterFields.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedWaterId(f.id)}
                      className={`px-2 py-1 rounded-md text-xs font-bold tracking-tight transition cursor-pointer select-none ${
                        selectedWaterId === f.id
                          ? "bg-zinc-950 text-white"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
                <TrendViewToggle
                  view={waterTrendView}
                  setView={setWaterTrendView}
                  date={waterDate}
                  setDate={setWaterDate}
                  历史数据={历史数据}
                />
              </div>
            </div>

            <CombinedTrendChart
              title={waterChartTitle}
              subtitle={waterChartSubtitle}
              data={waterTrendData}
              unit="吨"
              color="#0ea5e9"
            />
          </div>

          <div
            className="bg-white border border-zinc-200/60 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between"
            id="chart_card_gas_wrapper"
          >
            <div className="flex flex-col space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-zinc-100 pb-3">
                <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider mr-1 shrink-0">
                    燃气筛选:
                  </span>
                  <button
                    onClick={() => setSelectedGasId("all")}
                    className={`px-2 py-1 rounded-md text-xs font-bold tracking-tight transition cursor-pointer select-none ${
                      selectedGasId === "all"
                        ? "bg-zinc-950 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    用气总计
                  </button>
                  {gasFields.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedGasId(f.id)}
                      className={`px-2 py-1 rounded-md text-xs font-bold tracking-tight transition cursor-pointer select-none ${
                        selectedGasId === f.id
                          ? "bg-zinc-950 text-white"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
                <TrendViewToggle
                  view={gasTrendView}
                  setView={setGasTrendView}
                  date={gasDate}
                  setDate={setGasDate}
                  历史数据={历史数据}
                />
              </div>
            </div>

            <CombinedTrendChart
              title={gasChartTitle}
              subtitle={gasChartSubtitle}
              data={gasTrendData}
              unit="立方"
              color="#059669"
            />
          </div>
        </div>
      </div>

      <div
        className="bg-white border border-zinc-200/60 rounded-2xl shadow-xs p-6 space-y-4"
        id="monthly_consolidated_grid"
      >
        <div className="border-b border-zinc-200 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-1.5">
              <span>三、历史月度能耗结算与费率对账核算单</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1 font-sans">
              月度能耗统计报表分析。
            </p>
          </div>
          <span className="text-xs font-bold text-zinc-500 bg-zinc-50 border border-zinc-200/50 rounded-lg px-2.5 py-1 font-mono">
            共核销 {monthlyGroups.length} 个历史账期段
          </span>
        </div>

        {monthlyGroups.length === 0 ? (
          <p className="text-sm text-zinc-400 py-8 text-center font-sans">
            暂无归纳足月历史抄表数。请在【日常抄表】录入后自动呈递生成
          </p>
        ) : (
          <div className="overflow-x-auto border border-zinc-200 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  <th className="px-6 py-4">核账账期月份</th>
                  <th className="px-6 py-4">涵盖计日天数</th>
                  <th className="px-6 py-4 text-right header_sum_column">
                    电累计用量
                  </th>
                  <th className="px-6 py-4 text-right header_sum_column">
                    水累计用量
                  </th>
                  <th className="px-6 py-4 text-right header_sum_column">
                    气累计用量
                  </th>
                  <th className="px-6 py-4 text-right font-semibold">
                    当期预估用能支出比
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {monthlyGroups.map((grp) => (
                  <tr
                    key={grp.month}
                    className="hover:bg-zinc-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-zinc-900">
                      {grp.month.replace("-", "年")}月
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 border border-emerald-100 text-emerald-700">
                        {grp.daysCount} 天已封存对账
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-indigo-600 font-semibold">
                      {grp.totalElec.toLocaleString(undefined, {
                        maximumFractionDigits: 1,
                      })}{" "}
                      度
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sky-600 font-semibold">
                      {grp.totalWater.toLocaleString(undefined, {
                        maximumFractionDigits: 1,
                      })}{" "}
                      吨
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-emerald-600 font-semibold">
                      {grp.totalGas.toLocaleString(undefined, {
                        maximumFractionDigits: 1,
                      })}{" "}
                      m³
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-emerald-600 font-bold bg-emerald-50/5 text-sm">
                      ￥
                      {grp.totalCost.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};
