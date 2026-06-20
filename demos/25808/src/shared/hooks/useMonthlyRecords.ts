import { useState, useEffect, useCallback } from "react";
import { 月度抄表记录, MonthlyCircuitConfig, 当前用户 } from "../types";
import { monthlyRecordsStore } from "./dataStore";
import { getChinaDateStr } from "../utils/dateUtils";
import { canModifyMonthlyHistory, hasAdminPermission } from "../utils/permissions";

interface UseMonthlyRecordsProps {
  circuitData: MonthlyCircuitConfig[];
  用户: 当前用户 | null;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  openAlert: (title: string, message: string) => void;
}

export function useMonthlyRecords({
  circuitData,
  用户,
  openConfirm,
  openAlert,
}: UseMonthlyRecordsProps) {
  const [月度历史, set月度历史] = useState<月度抄表记录[]>([]);
  const [选中月度月份, set选中月度月份] = useState(getChinaDateStr().slice(0, 7));
  const [月度回路输入, set月度回路输入] = useState<{ [key: string]: string }>({});
  const [月度抄表反馈, set月度抄表反馈] = useState("");

  useEffect(() => {
    const initData = monthlyRecordsStore.get();
    set月度历史(initData);
    
    const syncData = async () => {
      const freshData = await monthlyRecordsStore.syncFromApi();
      set月度历史(freshData);
    };
    syncData();
  }, []);

  useEffect(() => {
    const existing = 月度历史.find((m) => m.月份 === 选中月度月份);
    if (existing) {
      const convertedInput: { [key: string]: string } = {};
      for (const key of Object.keys(existing.数据)) {
        convertedInput[key] = existing.数据[key].toString();
      }
      set月度回路输入(convertedInput);
    } else {
      set月度回路输入({});
    }
  }, [选中月度月份, 月度历史]);

  const 提交月度抄表 = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    set月度抄表反馈("");

    const finalData: { [key: string]: any } = {};
    for (const item of circuitData) {
      const valStr = 月度回路输入[item.id] || "";
      const floatVal = parseFloat(valStr);
      if (isNaN(floatVal)) {
        set月度抄表反馈(`错误：回路「${item.name}」的测定读数无效，请填写有效数字`);
        return;
      }
      finalData[item.id] = floatVal;

      const isSwapped = 月度回路输入[`swap_${item.id}`] === "true";
      if (isSwapped) {
        finalData[`swap_${item.id}`] = true;
        
        const oldValStr = 月度回路输入[`old_final_${item.id}`];
        if (oldValStr !== undefined && oldValStr !== "") {
          finalData[`old_final_${item.id}`] = parseFloat(oldValStr);
        }
        
        const newValStr = 月度回路输入[`new_start_${item.id}`];
        if (newValStr !== undefined && newValStr !== "") {
          finalData[`new_start_${item.id}`] = parseFloat(newValStr);
        }
      }
    }

    const 已存在 = 月度历史.some((m) => m.月份 === 选中月度月份);
    let 新月度 = [...月度历史];

    const 新记录: 月度抄表记录 = {
      月份: 选中月度月份,
      抄表人: 用户?.姓名 || "工程人员",
      数据: finalData,
    };

    if (!canModifyMonthlyHistory(用户?.角色, 选中月度月份)) {
      if (已存在) {
        openAlert("权限拦截", "月度定性数据如需修正重算，需超级管理员或工程总监介入处理。");
      } else {
        openAlert("权限拦截", "目前只能补录或修正本月的月度抄表记录，其余历史月份需超级管理员操作。");
      }
      return;
    }

    if (已存在) {
      新月度 = 月度历史.map((m) => (m.月份 === 选中月度月份 ? 新记录 : m));
      set月度抄表反馈(`月度历史：${选中月度月份}月份的回路抄表已成功覆盖并更新`);
    } else {
      新月度.push(新记录);
      新月度.sort((a, b) => b.月份.localeCompare(a.月份));
      set月度抄表反馈(`月度历史：${选中月度月份}月份的55回路全量抄表已录入归档`);
    }

    monthlyRecordsStore.set(新月度);
    set月度历史(新月度);
  }, [月度回路输入, circuitData, 用户, 选中月度月份, 月度历史, openAlert]);

  const 快速清空月度表单 = useCallback(() => {
    set月度回路输入({});
    set月度抄表反馈("");
  }, []);

  const 填充单条月度数据 = useCallback((项: 月度抄表记录) => {
    set选中月度月份(项.月份);
    const convertedInput: { [key: string]: string } = {};
    for (const key of Object.keys(项.数据)) {
      convertedInput[key] = 项.数据[key].toString();
    }
    set月度回路输入(convertedInput);
    set月度抄表反馈(`已读取「${项.月份}月」共 ${Object.keys(项.数据).length} 回路的历史抄表存档`);
  }, []);

  const 删除单条月度抄表 = useCallback((月份: string) => {
    if (!hasAdminPermission(用户?.角色)) {
      openAlert("权限拦截", "只有超级管理员或工程总监拥有删除废弃历史测定档案的权限。");
      return;
    }
    openConfirm("删除月度记录", `确定要永久删除 ${月份} 的二级回路抄表档案吗？此操作不可恢复。`, () => {
      const 新月度 = 月度历史.filter((m) => m.月份 !== 月份);
      monthlyRecordsStore.set(新月度);
      set月度历史(新月度);
      set月度抄表反馈(`已成功从档案库删除 ${月份} 的二级回路抄表数据`);
    });
  }, [用户, 月度历史, openConfirm, openAlert]);

  const 更新月度抄表数据 = useCallback((新数据: 月度抄表记录[]) => {
    monthlyRecordsStore.set(新数据);
    set月度历史(新数据);
  }, []);

  return {
    月度历史,
    set月度历史: 更新月度抄表数据,
    选中月度月份,
    set选中月度月份,
    月度回路输入,
    set月度回路输入,
    月度抄表反馈,
    set月度抄表反馈,
    提交月度抄表,
    快速清空月度表单,
    填充单条月度数据,
    删除单条月度抄表,
    更新月度抄表数据,
  };
}
