// 认证服务 - 处理用户注册、登录、登出
//
// 设计说明：
// - 所有认证逻辑通过此文件提供
// - 当前实现：IndexedDB + 简单哈希
// - 后期迁移：改为 HTTP API 调用后端
// - UI 组件不直接调用此文件，而是通过 authStore

import { DB_CONFIG, STORAGE_KEYS } from '@/constants';
import { dbPut, dbGet, dbGetByIndex } from './db';
import { generateId, now, simpleHash } from '@/utils/helpers';
import type { User, CurrentUser, RegisterParams, LoginParams } from '@/types';

// 注册新用户
export async function register(params: RegisterParams): Promise<CurrentUser> {
  // 1. 检查手机号是否已注册
  const existing = await dbGetByIndex<User>(DB_CONFIG.stores.users, 'phone', params.phone);
  if (existing) {
    throw new Error('该手机号已注册');
  }

  // 2. 创建用户记录
  const user: User = {
    id: generateId(),
    phone: params.phone,
    passwordHash: simpleHash(params.password),
    createdAt: now(),
    personId: null,  // S2 阶段创建本人节点后填充
  };

  await dbPut(DB_CONFIG.stores.users, user);

  // 3. 返回当前登录用户信息（不含密码）
  const currentUser: CurrentUser = {
    id: user.id,
    phone: user.phone,
    personId: user.personId,
    createdAt: user.createdAt,
  };

  return currentUser;
}

// 登录
export async function login(params: LoginParams): Promise<CurrentUser> {
  // 1. 按手机号查用户
  const user = await dbGetByIndex<User>(DB_CONFIG.stores.users, 'phone', params.phone);
  if (!user) {
    throw new Error('手机号或密码错误');
  }

  // 2. 校验密码
  if (user.passwordHash !== simpleHash(params.password)) {
    throw new Error('手机号或密码错误');
  }

  // 3. 返回当前登录用户信息
  const currentUser: CurrentUser = {
    id: user.id,
    phone: user.phone,
    personId: user.personId,
    createdAt: user.createdAt,
  };

  return currentUser;
}

// 更新当前用户的 personId（创建本人节点后调用）
export async function updateUserPersonId(
  userId: string,
  personId: string,
): Promise<CurrentUser> {
  const user = await dbGet<User>(DB_CONFIG.stores.users, userId);
  if (!user) {
    throw new Error('用户不存在');
  }

  user.personId = personId;
  await dbPut(DB_CONFIG.stores.users, user);

  const currentUser: CurrentUser = {
    id: user.id,
    phone: user.phone,
    personId: user.personId,
    createdAt: user.createdAt,
  };

  return currentUser;
}

// 保存当前登录用户到 localStorage（刷新页面后仍登录）
export function saveCurrentUser(user: CurrentUser | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// 从 localStorage 读取当前登录用户（页面刷新时用）
export function loadCurrentUser(): CurrentUser | null {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!data) return null;
  try {
    return JSON.parse(data) as CurrentUser;
  } catch {
    return null;
  }
}
