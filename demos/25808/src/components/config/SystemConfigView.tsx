import React, { useEffect } from "react";
import { motion } from "motion/react";
import {
  Plus,
  GripHorizontal,
  Database,
  Settings,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { DailyFieldConfig, MonthlyCircuitConfig, 字典配置, 月度抄表记录, 抄表记录 } from "../../shared/types";
import { DirtyIndicator } from "../../shared/components/DirtyIndicator";

import { RateLimitConfigTab } from "./RateLimitConfigTab";
import { DailyFieldsConfigTab } from "./DailyFieldsConfigTab";
import { MonthlyCircuitConfigTab } from "./MonthlyCircuitConfigTab";
import { DataBackupConfigTab } from "./DataBackupConfigTab";
import { CircuitPricingManager } from "./CircuitPricingManager";

interface SystemConfigViewProps {
  配置激活Tab: "费率限额" | "日常表字段" | "月度回路" | "数据备份" | "回路价格";
  set配置激活Tab: (
    tab: "费率限额" | "日常表字段" | "月度回路" | "数据备份" | "回路价格",
  ) => void;
  配置反馈: string;
  配置输入: 字典配置;
  set配置输入: (val: 字典配置) => void;
  保存配置: (e: React.FormEvent) => void;
  自定义大类映射: { [key: string]: string[] };
  set自定义大类映射: React.Dispatch<
    React.SetStateAction<{ [key: string]: string[] }>
  >;
  临时日常配置: DailyFieldConfig[];
  set临时日常配置: React.Dispatch<React.SetStateAction<DailyFieldConfig[]>>;
  临时月度配置: MonthlyCircuitConfig[];
  set临时月度配置: React.Dispatch<React.SetStateAction<MonthlyCircuitConfig[]>>;
  日常回路配置: DailyFieldConfig[];
  circuitData: MonthlyCircuitConfig[];
  set日常列顺序: React.Dispatch<React.SetStateAction<string[]>>;
  set月度列顺序: React.Dispatch<React.SetStateAction<string[]>>;
  sortedDailyCols: any[];
  sortedMonthlyCols: any[];
  addDailyCol: () => void;
  removeDailyCol: (id: string) => void;
  addMonthlyCol: () => void;
  removeMonthlyCol: (id: string) => void;
  insertDailyRow: (idx: number) => void;
  insertMonthlyRow: (idx: number) => void;
  保存日常表字段: (e: React.FormEvent) => void;
  保存月度回路: (e: React.FormEvent) => void;
  导出数据库备份: () => void;
  导入数据库备份: (file: File) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  openPrompt: (title: string, onConfirm: (val: string) => void) => void;
  openAlert: (title: string, message: string) => void;
  月度历史: 月度抄表记录[];
  更新月度抄表数据: (新数据: 月度抄表记录[]) => void;
  日常抄表数据: 抄表记录[];
  更新日常抄表数据: (新数据: 抄表记录[]) => void;
  isDirty?: boolean;
  onDirtyStateChange?: (dirty: boolean) => void;
}

export const SystemConfigView: React.FC<SystemConfigViewProps> = ({
  配置激活Tab,
  set配置激活Tab,
  配置反馈,
  配置输入,
  set配置输入,
  保存配置,
  自定义大类映射,
  set自定义大类映射,
  临时日常配置,
  set临时日常配置,
  临时月度配置,
  set临时月度配置,
  日常回路配置,
  circuitData,
  set日常列顺序,
  set月度列顺序,
  sortedDailyCols,
  sortedMonthlyCols,
  addDailyCol,
  removeDailyCol,
  addMonthlyCol,
  removeMonthlyCol,
  insertDailyRow,
  insertMonthlyRow,
  保存日常表字段,
  保存月度回路,
  导出数据库备份,
  导入数据库备份,
  openConfirm,
  openPrompt,
  openAlert,
  月度历史,
  更新月度抄表数据,
  日常抄表数据,
  更新日常抄表数据,
  isDirty = false,
}) => {
  const handleTabChange = (tab: "费率限额" | "日常表字段" | "月度回路" | "数据备份" | "回路价格") => {
    if (isDirty) {
      openConfirm(
        "未保存的变更",
        "您有未保存的配置变更，切换到其他Tab可能会导致数据丢失。确定要继续吗？",
        () => {
          set配置激活Tab(tab);
        }
      );
    } else {
      set配置激活Tab(tab);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return (
    <motion.div
      key="系统字典配置"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="space-y-8"
      id="system_config_root"
    >
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          工程总监专有系统字典与回路拓扑
        </h2>
        <p className="text-xs text-zinc-400 mt-1 font-sans">
          权限受限级控制后台：重构每日抄表回路、二级分类计量拓扑、预算费率并支持在线动态热部署。
        </p>
      </div>

      <DirtyIndicator isDirty={isDirty} />

      <div className="bg-white border border-zinc-200/60 rounded-2xl shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Left config tabs navigation */}
        <div
          className="w-full md:w-56 bg-zinc-50 border-r border-zinc-200/60 p-4 space-y-1.5 select-none shrink-0"
          id="config_view_sidebar"
        >
          <button
            type="button"
            id="tab_feilv"
            onClick={() => handleTabChange("费率限额")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 ${配置激活Tab === "费率限额" ? "bg-zinc-900 text-white shadow-xs" : "text-zinc-650 hover:bg-zinc-200/50"}`}
          >
            <Settings className="h-4 w-4" />
            <span>一、费率限额标准</span>
          </button>

          <button
            type="button"
            id="tab_richang"
            onClick={() => handleTabChange("日常表字段")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 ${配置激活Tab === "日常表字段" ? "bg-zinc-900 text-white shadow-xs" : "text-zinc-650 hover:bg-zinc-200/50"}`}
          >
            <Plus className="h-4 w-4" />
            <span>二、日常主表回路</span>
          </button>

          <button
            type="button"
            id="tab_yuedu"
            onClick={() => handleTabChange("月度回路")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 ${配置激活Tab === "月度回路" ? "bg-zinc-900 text-white shadow-xs" : "text-zinc-650 hover:bg-zinc-200/50"}`}
          >
            <GripHorizontal className="h-4 w-4" />
            <span>三、月度二级回路</span>
          </button>

          <button
            type="button"
            id="tab_beifen"
            onClick={() => handleTabChange("数据备份")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 ${配置激活Tab === "数据备份" ? "bg-zinc-900 text-white shadow-xs" : "text-zinc-650 hover:bg-zinc-200/50"}`}
          >
            <Database className="h-4 w-4" />
            <span>四、数仓全备灾备</span>
          </button>

          <button
            type="button"
            id="tab_circuit_pricing"
            onClick={() => handleTabChange("回路价格")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 ${配置激活Tab === "回路价格" ? "bg-zinc-900 text-white shadow-xs" : "text-zinc-650 hover:bg-zinc-200/50"}`}
          >
            <Settings className="h-4 w-4" />
            <span>五、回路价格管理</span>
          </button>
        </div>

        {/* Right Tab Contents */}
        <div className="flex-1 p-8" id="config_view_tab_content">
          {配置激活Tab === "费率限额" && (
            <RateLimitConfigTab
              配置输入={配置输入}
              set配置输入={set配置输入}
              保存配置={保存配置}
              日常回路配置={日常回路配置}
            />
          )}

          {配置激活Tab === "日常表字段" && (
            <DailyFieldsConfigTab
              临时日常配置={临时日常配置}
              set临时日常配置={set临时日常配置}
              sortedDailyCols={sortedDailyCols}
              addDailyCol={addDailyCol}
              removeDailyCol={removeDailyCol}
              insertDailyRow={insertDailyRow}
              保存日常表字段={保存日常表字段}
              set日常列顺序={set日常列顺序}
              openConfirm={openConfirm}
            />
          )}

          {配置激活Tab === "月度回路" && (
            <MonthlyCircuitConfigTab
              临时月度配置={临时月度配置}
              set临时月度配置={set临时月度配置}
              sortedMonthlyCols={sortedMonthlyCols}
              addMonthlyCol={addMonthlyCol}
              removeMonthlyCol={removeMonthlyCol}
              insertMonthlyRow={insertMonthlyRow}
              保存月度回路={保存月度回路}
              set月度列顺序={set月度列顺序}
              配置输入={配置输入}
              set配置输入={set配置输入}
              保存配置={保存配置}
              自定义大类映射={自定义大类映射}
              set自定义大类映射={set自定义大类映射}
              openConfirm={openConfirm}
              openPrompt={openPrompt}
              openAlert={openAlert}
              配置反馈={配置反馈}
            />
          )}

          {配置激活Tab === "数据备份" && (
            <DataBackupConfigTab
              导出数据库备份={导出数据库备份}
              导入数据库备份={导入数据库备份}
              circuitData={circuitData}
              月度历史={月度历史}
              更新月度抄表数据={更新月度抄表数据}
              openConfirm={openConfirm}
              openAlert={openAlert}
              自定义大类映射={自定义大类映射}
              日常回路配置={日常回路配置}
              日常抄表数据={日常抄表数据}
              更新日常抄表数据={更新日常抄表数据}
              配置输入={配置输入}
            />
          )}

          {配置激活Tab === "回路价格" && (
            <CircuitPricingManager
              配置输入={配置输入}
              set配置输入={set配置输入}
              日常回路配置={日常回路配置}
              openConfirm={openConfirm}
              openAlert={openAlert}
            />
          )}

          {配置反馈 && (
            <div
              className={`mt-6 flex items-start space-x-2 p-3 rounded-lg text-xs leading-relaxed transition ${配置反馈.includes("错误") ? "bg-red-50 text-red-700 border border-red-105" : "bg-emerald-50 text-emerald-850 border border-emerald-105"}`}
            >
              {配置反馈.includes("错误") ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              ) : (
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              )}
              <span>{配置反馈}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
