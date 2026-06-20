import { useState, useEffect, useCallback } from "react";
import { 抄表记录, DailyFieldConfig, 当前用户 } from "../types";
import { dailyRecordsStore } from "./dataStore";
import { apiService } from "../services/apiService";
import { getChinaDateStr } from "../utils/dateUtils";
import { canModifyHistory, hasAdminPermission } from "../utils/permissions";

interface UseDailyRecordsProps {
  日常回路配置: DailyFieldConfig[];
  用户: 当前用户 | null;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  openAlert: (title: string, message: string) => void;
}

export function useDailyRecords({
  日常回路配置,
  用户,
  openConfirm,
  openAlert,
}: UseDailyRecordsProps) {
  const [历史数据, set历史数据] = useState<抄表记录[]>([]);
  const [输入日期, set输入日期] = useState(getChinaDateStr());
  const [日常抄表输入, set日常抄表输入] = useState<{ [key: string]: string }>({});
  const [抄表反馈, set抄表反馈] = useState("");

  useEffect(() => {
    const initData = dailyRecordsStore.get();
    set历史数据(initData);
    
    const syncData = async () => {
      const freshData = await dailyRecordsStore.syncFromApi();
      set历史数据(freshData);
    };
    syncData();
  }, []);

  useEffect(() => {
    const existing = 历史数据.find((d) => d.日期 === 输入日期);
    if (existing) {
      const loadedInputs: { [key: string]: string } = {};
      日常回路配置.forEach((field) => {
        const val = existing[field.id];
        loadedInputs[field.id] = val !== undefined && val !== null ? val.toString() : "";
        
        if (existing[`swap_${field.id}`] !== undefined) {
          loadedInputs[`swap_${field.id}`] = existing[`swap_${field.id}`].toString();
        }
        if (existing[`old_final_${field.id}`] !== undefined) {
          loadedInputs[`old_final_${field.id}`] = existing[`old_final_${field.id}`].toString();
        }
        if (existing[`new_start_${field.id}`] !== undefined) {
          loadedInputs[`new_start_${field.id}`] = existing[`new_start_${field.id}`].toString();
        }
      });
      set日常抄表输入(loadedInputs);
    } else {
      set日常抄表输入({});
    }
  }, [输入日期, 历史数据, 日常回路配置]);

  const 提交日常抄表 = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    set抄表反馈("");

    const itemValues: { [key: string]: number } = {};
    const extraSwapFields: { [key: string]: any } = {};

    for (const field of 日常回路配置) {
      const valString = 日常抄表输入[field.id] || "";
      const floatVal = parseFloat(valString);
      if (isNaN(floatVal)) {
        set抄表反馈(`错误：请输入完整的数值，表回路「${field.name}」参数无效`);
        return;
      }
      itemValues[field.id] = floatVal;

      const isSwapped = 日常抄表输入[`swap_${field.id}`] === "true";
      if (isSwapped) {
        extraSwapFields[`swap_${field.id}`] = true;
        
        const oldValStr = 日常抄表输入[`old_final_${field.id}`];
        if (oldValStr !== undefined && oldValStr !== "") {
          extraSwapFields[`old_final_${field.id}`] = parseFloat(oldValStr);
        }
        
        const newValStr = 日常抄表输入[`new_start_${field.id}`];
        if (newValStr !== undefined && newValStr !== "") {
          extraSwapFields[`new_start_${field.id}`] = parseFloat(newValStr);
        }
      }
    }

    const 总气 = 日常回路配置
      .filter((f) => f.category === "气")
      .reduce((acc, f) => acc + (itemValues[f.id] || 0), 0);
    const 已存在 = 历史数据.some((d) => d.日期 === 输入日期);

    if (!canModifyHistory(用户?.角色, 输入日期)) {
      if (已存在) {
        openAlert("权限拦截", "仅超级管理员角色及工程总监拥有修正历史日期异常数据的权限。");
      } else {
        openAlert("权限拦截", "目前只能补录或修正今天的抄表内容。");
      }
      return;
    }

    const readings = {
      ...itemValues,
      ...extraSwapFields,
      天然气表: 总气,
      李体线电表: itemValues["李体线电表"] !== undefined ? itemValues["李体线电表"] : 0,
      午沙线电表: itemValues["午沙线电表"] !== undefined ? itemValues["午沙线电表"] : 0,
      酒店水表: itemValues["酒店水表"] !== undefined ? itemValues["酒店水表"] : 0,
      喷泉水表: itemValues["喷泉水表"] !== undefined ? itemValues["喷泉水表"] : 0,
    };

    try {
      await apiService.saveDailyRecord(输入日期, readings);
      const freshData = await dailyRecordsStore.syncFromApi();
      set历史数据(freshData);
      set抄表反馈(已存在 ? "日常抄表补充与历史校对已成功更新并复现" : "日底数登记成功入库与合并");
    } catch {
      set抄表反馈("保存失败，请检查网络连接或联系管理员");
    }
  }, [日常抄表输入, 日常回路配置, 用户, 输入日期, 历史数据, openAlert]);

  const 快速清空抄表表单 = useCallback(() => {
    set日常抄表输入({});
    set抄表反馈("");
  }, []);

  const 填充单条抄表数据 = useCallback((项: 抄表记录) => {
    set输入日期(项.日期);
    const loadedInputs: { [key: string]: string } = {};
    日常回路配置.forEach((field) => {
      const val = 项[field.id];
      loadedInputs[field.id] = val !== undefined && val !== null ? val.toString() : "";
    });
    set日常抄表输入(loadedInputs);
    set抄表反馈("已载入该日的快照数据，可修改后重新入库");
  }, [日常回路配置]);

  const 删除单条抄表 = useCallback((日期: string) => {
    if (!hasAdminPermission(用户?.角色)) {
      openAlert("权限拦截", "只有超级管理员或工程总监拥有删除废弃历史测定档案的权限。");
      return;
    }
    openConfirm("删除确认", `确定要删除 ${日期} 的日常抄表记录吗？此操作不可恢复。`, async () => {
      const 新数据 = 历史数据.filter((d) => d.日期 !== 日期);
      dailyRecordsStore.set(新数据);
      set历史数据(新数据);
    });
  }, [用户, 历史数据, openConfirm, openAlert]);

  const 更新抄表数据 = useCallback((新数据: 抄表记录[]) => {
    dailyRecordsStore.set(新数据);
    set历史数据(新数据);
  }, []);

  return {
    历史数据,
    set历史数据: 更新抄表数据,
    输入日期,
    set输入日期,
    日常抄表输入,
    set日常抄表输入,
    抄表反馈,
    set抄表反馈,
    提交日常抄表,
    快速清空抄表表单,
    填充单条抄表数据,
    删除单条抄表,
    更新抄表数据,
  };
}
