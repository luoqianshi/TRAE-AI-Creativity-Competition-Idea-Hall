// 认证状态管理（Zustand）
//
// 职责：
// - 管理当前登录用户
// - 登录态持久化到 localStorage
// - 提供登录、注册、登出、设置本人节点方法

import { create } from 'zustand';
import {
  register,
  login,
  saveCurrentUser,
  loadCurrentUser,
  updateUserPersonId,
} from '@/services/authService';
import type { CurrentUser, RegisterParams, LoginParams } from '@/types';

interface AuthState {
  // 当前登录用户（null 表示未登录）
  user: CurrentUser | null;
  // 初始化状态（页面加载时从 localStorage 恢复登录态）
  isLoading: boolean;

  // 初始化（页面加载时调用）
  init: () => void;

  // 注册
  register: (params: RegisterParams) => Promise<void>;
  // 登录
  login: (params: LoginParams) => Promise<void>;
  // 退出登录
  logout: () => void;

  // 设置本人节点 ID（创建本人节点后调用）
  setPerson: (personId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  init: () => {
    const user = loadCurrentUser();
    set({ user, isLoading: false });
  },

  register: async (params) => {
    const user = await register(params);
    saveCurrentUser(user);
    set({ user });
  },

  login: async (params) => {
    const user = await login(params);
    saveCurrentUser(user);
    set({ user });
  },

  logout: () => {
    saveCurrentUser(null);
    set({ user: null });
  },

  setPerson: async (personId) => {
    const current = get().user;
    if (!current) return;

    const updated = await updateUserPersonId(current.id, personId);
    saveCurrentUser(updated);
    set({ user: updated });
  },
}));
