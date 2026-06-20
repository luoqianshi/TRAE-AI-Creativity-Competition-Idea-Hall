import { useCallback } from "react";
import { 导出数据库备份, 导入数据库备份 } from "./backupRestore";

interface UseBackupProps {
  set配置反馈: (val: string) => void;
  openConfirm: (title: string, message: string, onConfirm: () => void) => void;
  openAlert: (title: string, message: string) => void;
}

export function useBackup({ set配置反馈, openConfirm, openAlert }: UseBackupProps) {
  const handle导出数据库备份 = useCallback(() => {
    导出数据库备份(set配置反馈, openAlert);
  }, [set配置反馈, openAlert]);

  const handle导入数据库备份 = useCallback((file: File) => {
    导入数据库备份(file, openConfirm, openAlert);
  }, [openConfirm, openAlert]);

  return {
    handle导出数据库备份,
    handle导入数据库备份,
  };
}
