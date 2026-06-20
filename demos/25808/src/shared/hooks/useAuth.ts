import React, { useState, useEffect } from "react";
import { 当前用户, AppRoute } from "../types";
import { apiService } from "../services/apiService";

export function useAuth() {
  const [当前路由, set当前路由] = useState<AppRoute>("登录");
  const [用户, set用户] = useState<当前用户 | null>(null);
  const [登录中, set登录中] = useState(false);

  // 登录表单
  const [登录账号, set登录账号] = useState("");
  const [登录密码, set登录密码] = useState("");
  const [登录错误, set登录错误] = useState("");

  useEffect(() => {
    const 检查登录状态 = async () => {
      try {
        const 用户数据 = await apiService.getProfile();
        if (用户数据) {
          const 当前用户: 当前用户 = {
            账号: 用户数据.username,
            姓名: 用户数据.name,
            角色: 用户数据.role === "superadmin" ? "超级管理员" : 
                  用户数据.role === "engineer_director" ? "工程总监" : "工程主管",
            状态: 用户数据.status === "active" ? "启用" : "禁用",
          };
          set用户(当前用户);
          set当前路由("能效大盘");
        }
      } catch {
        localStorage.removeItem("系统登录用户");
      }
    };
    检查登录状态();
  }, []);

  const 触发登录Action = async (e: React.FormEvent) => {
    e.preventDefault();
    set登录错误("");
    set登录中(true);

    if (!登录账号.trim() || !登录密码) {
      set登录错误("错误：工作账号和登录密码不能为空");
      set登录中(false);
      return;
    }

    try {
      const 用户数据 = await apiService.login(登录账号.trim(), 登录密码);
      const 当前用户: 当前用户 = {
        账号: 用户数据.username,
        姓名: 用户数据.name,
        角色: 用户数据.role === "superadmin" ? "超级管理员" : 
              用户数据.role === "engineer_director" ? "工程总监" : "工程主管",
        状态: 用户数据.status === "active" ? "启用" : "禁用",
      };
      set用户(当前用户);
      localStorage.setItem("系统登录用户", JSON.stringify(当前用户));
      set当前路由(用户数据.role === "engineer_supervisor" ? "日常抄表" : "能效大盘");
      set登录账号("");
      set登录密码("");
    } catch (error) {
      set登录错误("错误：账号或密码输入不正确，请重新检查。");
    } finally {
      set登录中(false);
    }
  };

  const 触发退出登录 = async () => {
    try {
      await apiService.logout();
    } finally {
      localStorage.removeItem("系统登录用户");
      set用户(null);
      set当前路由("登录");
    }
  };

  const 安全跳转路由 = (目标: AppRoute) => {
    if (!用户) {
      set当前路由("登录");
      return;
    }
    if (目标 === "字典配置" && 用户.角色 === "工程主管") {
      set当前路由("日常抄表");
      return;
    }
    set当前路由(目标);
  };

  return {
    当前路由,
    set当前路由,
    用户,
    set用户,
    登录账号,
    set登录账号,
    登录密码,
    set登录密码,
    登录错误,
    set登录错误,
    登录中,
    触发登录Action,
    触发退出登录,
    安全跳转路由,
  };
}