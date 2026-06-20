import {
  DailyFieldConfig,
  MonthlyCircuitConfig,
  当前用户,
} from "../types";
import { useDailyRecords } from "./useDailyRecords";
import { useMonthlyRecords } from "./useMonthlyRecords";
import { useRouteState } from "./useRouteState";
import { useBackup } from "./useBackup";

export function useMeterRecords(
  日常回路配置: DailyFieldConfig[],
  circuitData: MonthlyCircuitConfig[],
  自定义大类映射: { [key: string]: string[] },
  用户: 当前用户 | null,
  openConfirm: (title: string, message: string, onConfirm: () => void) => void,
  openAlert: (title: string, message: string) => void,
  set配置反馈: (val: string) => void,
) {
  const daily = useDailyRecords({
    日常回路配置,
    用户,
    openConfirm,
    openAlert,
  });

  const monthly = useMonthlyRecords({
    circuitData,
    用户,
    openConfirm,
    openAlert,
  });

  const route = useRouteState({
    circuitData,
    自定义大类映射,
  });

  const backup = useBackup({
    set配置反馈,
    openConfirm,
    openAlert,
  });

  return {
    ...daily,
    ...monthly,
    ...route,
    ...backup,
  };
}
