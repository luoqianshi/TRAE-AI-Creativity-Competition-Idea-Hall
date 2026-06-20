import { getChinaDateStr } from "./dateUtils";

export enum UserRole {
  SUPER_ADMIN = "超级管理员",
  DIRECTOR = "工程总监",
  SUPERVISOR = "工程主管",
}

export const hasAdminPermission = (role: string | undefined): boolean => {
  if (!role) return false;
  return role === UserRole.SUPER_ADMIN || role === UserRole.DIRECTOR;
};

export const canModifyHistory = (role: string | undefined, targetDate: string): boolean => {
  if (!role) return false;
  return hasAdminPermission(role) || targetDate === getChinaDateStr();
};

export const canModifyMonthlyHistory = (role: string | undefined, targetMonth: string): boolean => {
  if (!role) return false;
  return hasAdminPermission(role) || targetMonth === getChinaDateStr().slice(0, 7);
};
