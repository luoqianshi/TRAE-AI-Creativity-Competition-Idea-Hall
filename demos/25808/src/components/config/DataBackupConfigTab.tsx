import React, { useState } from "react";
import { Database, Download, Upload, Info, FileSpreadsheet, AlertTriangle, AlertCircle, CheckCircle2, X, ChevronRight } from "lucide-react";
import { MonthlyCircuitConfig, 月度抄表记录, DailyFieldConfig, 抄表记录, 字典配置 } from "../../shared/types";
import { MonthlyImporter } from "../../shared/components/MonthlyImporter";
import { 解析导入文件, 解析日常CSV, 列映射结果 } from "./excelImportHandler";
import { 异常记录 } from "../../shared/utils/anomalyDetection";

interface DataBackupConfigTabProps {
  导出数据库备份: () => void;
  导入数据库备份: (file: File) => void;
  circuitData: MonthlyCircuitConfig[];
  月度历史: 月度抄表记录[];
  更新月度抄表数据: (新数据: 月度抄表记录[]) => void;
  openAlert: (title: string, message: string) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  自定义大类映射: { [key: string]: string[] };
  日常回路配置: DailyFieldConfig[];
  日常抄表数据: 抄表记录[];
  更新日常抄表数据: (新数据: 抄表记录[]) => void;
  配置输入: 字典配置;
}

interface 导入预览状态 {
  isOpen: boolean;
  文件名: string;
  记录数: number;
  列映射: 列映射结果[];
  异常列表: 异常记录[];
  解析记录: 抄表记录[];
  能耗类型?: "电" | "水" | "气" | null;
  年份?: number;
  月份?: number;
}

function 下载日常模板(日常回路配置: DailyFieldConfig[]) {
  // 构造一个包含日期列 + 所有日常配置字段名的 CSV 模板
  const headers = ["日期", ...日常回路配置.map((f) => f.name)];
  const sampleRow = ["2026-06-01", ...日常回路配置.map(() => "")];
  const csvContent = "\uFEFF" + [headers, sampleRow].map((row) => row.map((cell) => `"${cell || ""}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "酒店能耗数仓_日常抄表批量导入模板.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const DataBackupConfigTab: React.FC<DataBackupConfigTabProps> = ({
  导出数据库备份,
  导入数据库备份,
  circuitData,
  月度历史,
  更新月度抄表数据,
  openAlert,
  openConfirm,
  自定义大类映射,
  日常回路配置,
  日常抄表数据,
  更新日常抄表数据,
  配置输入,
}) => {
  const [预览状态, set预览状态] = useState<导入预览状态>({
    isOpen: false,
    文件名: "",
    记录数: 0,
    列映射: [],
    异常列表: [],
    解析记录: [],
  });
  const [正在解析中, set正在解析中] = useState(false);

  const 处理日常文件选择 = async (file: File) => {
    if (!file) return;
    const isCSV = file.name.toLowerCase().endsWith(".csv");
    set正在解析中(true);

    try {
      let 解析结果;
      if (isCSV) {
        const text = await file.text();
        解析结果 = 解析日常CSV(text, 日常回路配置, 配置输入, 日常抄表数据);
      } else {
        解析结果 = await 解析导入文件(file, 日常回路配置, 配置输入, 日常抄表数据);
      }

      set预览状态({
        isOpen: true,
        文件名: file.name,
        记录数: 解析结果.records.length,
        列映射: 解析结果.列映射,
        异常列表: 解析结果.异常,
        解析记录: 解析结果.records,
        能耗类型: 解析结果.能耗类型,
        年份: 解析结果.年份,
        月份: 解析结果.月份,
      });

      if (解析结果.records.length === 0) {
        openAlert(
          "解析完成但无数据",
          解析结果.信息 || "文件已解析，但未找到任何可入库的日常抄表记录。请检查文件格式是否正确。",
        );
      }
    } catch (err: any) {
      openAlert("导入异常", "解析文件失败：" + (err?.message || String(err)));
    } finally {
      set正在解析中(false);
    }
  };

  const 确认导入 = () => {
    if (预览状态.解析记录.length === 0) {
      set预览状态({ ...预览状态, isOpen: false });
      return;
    }
    openConfirm(
      "日常抄表数据合并入库",
      `系统将把 ${预览状态.解析记录.length} 条记录写入数仓。日期冲突的记录会以"后入优先"的原则合并补录。是否继续？`,
      () => {
        const currentMap = new Map<string, 抄表记录>(
          日常抄表数据.map((item) => [item.日期, item]),
        );
        预览状态.解析记录.forEach((newItem) => {
          const oldItem = currentMap.get(newItem.日期);
          if (oldItem) {
            currentMap.set(newItem.日期, { ...oldItem, ...newItem });
          } else {
            currentMap.set(newItem.日期, newItem);
          }
        });
        const sortedList = Array.from(currentMap.values()).sort(
          (a, b) => new Date(a.日期).getTime() - new Date(b.日期).getTime(),
        );
        更新日常抄表数据(sortedList);
        set预览状态((s) => ({ ...s, isOpen: false }));
        openAlert(
          "日常抄表批量导入成功",
          `成功融合写入 ${预览状态.解析记录.length} 条日常抄表记录。`,
        );
      },
    );
  };

  const 关闭预览 = () => set预览状态({ ...预览状态, isOpen: false });

  const highAnomalies = 预览状态.异常列表.filter((a) => a.severity === "high");
  const mediumAnomalies = 预览状态.异常列表.filter((a) => a.severity === "medium");
  const lowAnomalies = 预览状态.异常列表.filter((a) => a.severity === "low");

  return (
    <div className="space-y-8" id="data_backup_container">
      <div>
        <div className="flex items-center space-x-2 text-zinc-900 mb-2">
          <Database className="h-5 w-5 text-indigo-600" />
          <h3 className="text-sm font-semibold">系统数据备份与历史数据导入</h3>
        </div>
        <p className="text-xs text-zinc-500 leading-relaxed font-sans">
          本模块支持系统全部数据的完整备份与还原，并提供日常抄表与月度二级回路抄表的批量导入功能。
        </p>
      </div>

      {/* 日常抄表批量导入 */}
      <div className="border border-zinc-200/60 rounded-2xl bg-white p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">日常抄表数据批量导入</h4>
          </div>
          <span className="text-[10px] text-zinc-400">支持 .xlsx / .xls / .csv</span>
        </div>

        <div className="space-y-4">
          <div className="text-[11px] text-zinc-500 leading-relaxed font-sans">
            系统基于表头列名与字段注册表自动识别列，不再硬编码固定列位置。可处理多表/多能耗类型的数据。
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative border-2 border-dashed border-zinc-200 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition group bg-white">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) 处理日常文件选择(file);
                  e.target.value = "";
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-1">
                <Upload className="h-5 w-5 text-zinc-400 mx-auto group-hover:text-emerald-500 transition-colors" />
                <div className="text-xs font-medium text-zinc-700">
                  {正在解析中 ? "正在解析文件..." : "点击选择日常抄表 Excel / CSV 文件"}
                </div>
                <div className="text-[10px] text-zinc-400 font-sans">单月或多月历史数据均可</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => 下载日常模板(日常回路配置)}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 bg-white border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-xl text-xs font-semibold text-zinc-700 transition"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              <span>下载日常抄表导入模板</span>
            </button>
          </div>
        </div>
      </div>

      {/* 月度二级回路抄表导入 */}
      <div className="border border-zinc-200/60 rounded-2xl bg-white p-6 space-y-6">
        <div className="flex items-center space-x-2 border-b border-zinc-100 pb-4">
          <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
          <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">月度二级回路抄表导入</h4>
        </div>

        <MonthlyImporter
          circuitData={circuitData}
          月度历史={月度历史}
          更新月度抄表数据={更新月度抄表数据}
          自定义大类映射={自定义大类映射}
          openAlert={openAlert}
          openConfirm={openConfirm}
        />
      </div>

      {/* 系统备份 / 还原 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
        <div className="p-6 border border-zinc-200/60 rounded-2xl bg-zinc-50/30 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-zinc-100 rounded-lg text-zinc-650">
                <Download className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-zinc-700">导出系统备份 (JSON)</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              将系统计费配置、能耗限额、日常抄表以及月度考核的所有历史数据打包导出为 JSON 文件。
            </p>
          </div>
          <button
            type="button"
            onClick={导出数据库备份}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-zinc-900 border border-transparent rounded-lg text-xs font-semibold text-white hover:bg-zinc-800 active:scale-[0.99] transition"
          >
            <Database className="h-3.5 w-3.5" />
            <span>导出全量备份数据 (.json)</span>
          </button>
        </div>

        <div className="p-6 border border-zinc-200/60 rounded-2xl bg-zinc-50/30 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-zinc-100 rounded-lg text-zinc-650">
                <Upload className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-zinc-700">导入备份数据还原 (JSON)</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
              导入之前备份的 JSON 文件。<b>注意：此操作将彻底覆盖当前系统中的所有抄表数据与配置！建议操作前先导出备份。</b>
            </p>
          </div>
          <div className="relative border-2 border-dashed border-zinc-200 hover:border-cyan-500 rounded-xl p-4 transition text-center cursor-pointer group bg-white">
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  导入数据库备份(file);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-1">
              <Upload className="h-5 w-5 text-zinc-400 mx-auto group-hover:text-cyan-500 transition-colors" />
              <div className="text-[11px] font-medium text-zinc-600">
                点击此处选择 <b>.json</b> 备份文件
              </div>
              <div className="text-[10px] text-zinc-400 font-sans">仅支持由本系统导出的 JSON 备份文件</div>
            </div>
          </div>
        </div>
      </div>

      {/* 通用信息 */}
      <div className="p-4 border border-zinc-200 rounded-xl bg-white space-y-2">
        <div className="flex items-center space-x-2 text-zinc-800 mt-1">
          <Info className="h-4 w-4 text-cyan-500 shrink-0" />
          <span className="text-xs font-bold">操作说明</span>
        </div>
        <ul className="text-[11px] text-zinc-500 leading-relaxed font-sans space-y-1 list-disc pl-4">
          <li><b>日常抄表导入：</b>支持 Excel (.xlsx/.xls) 和 CSV 两种格式。首行应包含"日期"及各电表水表名称列。</li>
          <li><b>月度抄表导入：</b>按"大类 / 回路名称 / 读数"的结构导入，自动与已配置的回路拓扑匹配。</li>
          <li><b>数据冲突：</b>日期冲突时，新导入的数据将与现有数据按"后入优先"原则合并，不会丢失历史细节。</li>
          <li><b>异常检测：</b>读数回落与异常跳变会在预览面板中高亮提醒，可选择跳过或直接接受。</li>
        </ul>
      </div>

      {/* 预览弹窗 */}
      {预览状态.isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">日常抄表导入预览</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{预览状态.文件名}</p>
                </div>
              </div>
              <button onClick={关闭预览} className="p-1.5 hover:bg-zinc-100 rounded-lg transition">
                <X className="h-4 w-4 text-zinc-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* 摘要 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 border border-zinc-100 rounded-xl bg-zinc-50/50">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">记录数量</div>
                  <div className="text-xl font-bold text-zinc-900">{预览状态.记录数}</div>
                </div>
                <div className="p-3 border border-zinc-100 rounded-xl bg-zinc-50/50">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">识别字段</div>
                  <div className="text-xl font-bold text-zinc-900">
                    {预览状态.列映射.filter((c) => !c.isDateColumn && c.fieldId).length}
                  </div>
                </div>
                <div className="p-3 border border-rose-100 rounded-xl bg-rose-50/30">
                  <div className="text-[10px] text-rose-500 uppercase tracking-wider mb-1">严重异常</div>
                  <div className="text-xl font-bold text-rose-600">{highAnomalies.length}</div>
                </div>
                <div className="p-3 border border-amber-100 rounded-xl bg-amber-50/30">
                  <div className="text-[10px] text-amber-500 uppercase tracking-wider mb-1">一般异常</div>
                  <div className="text-xl font-bold text-amber-600">{mediumAnomalies.length}</div>
                </div>
              </div>

              {/* 列映射 */}
              <div>
                <div className="text-xs font-bold text-zinc-800 mb-2 flex items-center space-x-1.5">
                  <span>列识别结果</span>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                </div>
                <div className="border border-zinc-100 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto max-h-40 overflow-y-auto">
                    <table className="w-full text-[11px]">
                      <thead className="bg-zinc-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-zinc-600 border-b border-zinc-100">原始列名</th>
                          <th className="px-3 py-2 text-left font-semibold text-zinc-600 border-b border-zinc-100">映射字段</th>
                          <th className="px-3 py-2 text-left font-semibold text-zinc-600 border-b border-zinc-100">状态</th>
                        </tr>
                      </thead>
                      <tbody>
                        {预览状态.列映射.map((col, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-zinc-50/40"}>
                            <td className="px-3 py-1.5 text-zinc-700">{col.header}</td>
                            <td className="px-3 py-1.5 text-zinc-700 font-medium">{col.displayName}</td>
                            <td className="px-3 py-1.5">
                              {col.isDateColumn ? (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full text-[10px] font-semibold">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  <span>日期列</span>
                                </span>
                              ) : col.fieldId ? (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-semibold">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  <span>已匹配</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-full text-[10px] font-semibold">
                                  <AlertCircle className="h-2.5 w-2.5" />
                                  <span>未识别（跳过）</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 异常列表 */}
              {(highAnomalies.length > 0 || mediumAnomalies.length > 0 || lowAnomalies.length > 0) && (
                <div>
                  <div className="text-xs font-bold text-zinc-800 mb-2 flex items-center space-x-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                    <span>异常检测结果</span>
                  </div>
                  <div className="border border-zinc-100 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto max-h-52 overflow-y-auto">
                      <table className="w-full text-[11px]">
                        <thead className="bg-zinc-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-semibold text-zinc-600 border-b border-zinc-100">日期</th>
                            <th className="px-3 py-2 text-left font-semibold text-zinc-600 border-b border-zinc-100">字段</th>
                            <th className="px-3 py-2 text-left font-semibold text-zinc-600 border-b border-zinc-100">类型</th>
                            <th className="px-3 py-2 text-left font-semibold text-zinc-600 border-b border-zinc-100">详情</th>
                            <th className="px-3 py-2 text-left font-semibold text-zinc-600 border-b border-zinc-100">严重度</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...highAnomalies, ...mediumAnomalies, ...lowAnomalies].slice(0, 50).map((a, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-zinc-50/40"}>
                              <td className="px-3 py-1.5 text-zinc-700 font-mono">{a.date}</td>
                              <td className="px-3 py-1.5 text-zinc-700 font-medium">{a.displayName}</td>
                              <td className="px-3 py-1.5 text-zinc-700">{a.type}</td>
                              <td className="px-3 py-1.5 text-zinc-500">{a.message}</td>
                              <td className="px-3 py-1.5">
                                <span
                                  className={
                                    "inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold " +
                                    (a.severity === "high"
                                      ? "bg-rose-100 text-rose-700"
                                      : a.severity === "medium"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-zinc-100 text-zinc-600")
                                  }
                                >
                                  {a.severity === "high" ? "严重" : a.severity === "medium" ? "一般" : "低"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 记录预览 */}
              {预览状态.解析记录.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-zinc-800 mb-2 flex items-center space-x-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>解析数据预览（前 20 条）</span>
                  </div>
                  <div className="border border-zinc-100 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto max-h-64 overflow-y-auto">
                      <table className="w-full text-[11px]">
                        <thead className="bg-zinc-50 sticky top-0">
                          <tr>
                            {Object.keys(预览状态.解析记录[0] || {}).map((key) => (
                              <th
                                key={key}
                                className="px-3 py-2 text-left font-semibold text-zinc-600 border-b border-zinc-100 whitespace-nowrap"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {预览状态.解析记录.slice(0, 20).map((rec, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-zinc-50/40"}>
                              {Object.values(rec).map((val, vIdx) => (
                                <td key={vIdx} className="px-3 py-1.5 text-zinc-700 font-mono text-[10.5px]">
                                  {typeof val === "number" ? val.toFixed(2) : String(val || "")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 bg-zinc-50/40">
              <div className="text-[11px] text-zinc-500">
                共解析 <b className="text-zinc-800">{预览状态.记录数}</b> 条记录
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={关闭预览}
                  className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-100 transition"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={确认导入}
                  disabled={预览状态.记录数 === 0}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 disabled:bg-zinc-300 disabled:cursor-not-allowed transition"
                >
                  确认合并入库 ({预览状态.记录数})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
