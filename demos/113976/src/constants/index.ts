// 常量定义

// IndexedDB 配置
export const DB_CONFIG = {
  name: 'qinluo_family_tree',
  version: 1,
  stores: {
    users: 'users',           // 用户账号
    persons: 'persons',       // 人员节点（S2 用）
    relationships: 'relationships',  // 关系（S3 用）
  } as const,
};

// 本地存储键名
export const STORAGE_KEYS = {
  CURRENT_USER: 'qinluo_current_user',  // 当前登录用户（localStorage）
} as const;
