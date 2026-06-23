// 角色项（后端返回）
export interface RoleItem {
  id: number
  name: string
  description?: string
  permissions?: string
}

// 用户类型
export interface Admin {
  id: number
  name: string
  phone: string
  /** @deprecated 使用 roles 或 roleName */
  role?: 'SuperAdmin' | 'Admin' | 'Viewer'
  /** 角色列表（后端返回） */
  roles?: RoleItem[]
  /** 权限代码数组（如 expense:create, org:manage） */
  permissions?: string[]
  is_active?: boolean
  last_login_at?: string
  created_at?: string
  updated_at?: string
}

export interface User {
  id: number
  name: string
  phone: string
  role: 'SuperAdmin' | 'Admin' | 'Viewer' | 'Parent'
}

// 机构与班级
export interface Organization {
  id: number
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Class {
  id: number
  org_id: number
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// 类目
export interface Category {
  id: number
  name: string
  color: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// 费用记录
export interface Expense {
  id: number
  date: string
  category: string
  amount: number
  handler: string
  status: '待审核' | '进行中' | '已完成'
  remark?: string
  class_id?: number
  org_id?: number
  created_by?: number
  approved_by?: number
  approved_at?: string
  created_at: string
  updated_at: string
}

// 统计
export interface OverviewStats {
  total_collected: number
  total_expended: number
  balance: number
  categoryStats: CategoryStats[]
  statusStats: StatusStats[]
  classStats: ClassStats[]
}

export interface CategoryStats {
  name: string
  total: number
  percentage: number
  color: string
}

export interface StatusStats {
  name: string
  total: number
  percentage: number
}

export interface ClassStats {
  id: number
  name: string
  total: number
}

// 操作日志
export interface OperationLog {
  id: number
  operation: string
  operator: string
  admin_id?: number
  ip_address?: string
  user_agent?: string
  created_at: string
}

// 登录
export interface LoginForm {
  phone: string
  password: string
}

export interface LoginResponse {
  token: string
  admin: Admin
}

// API响应
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页
export interface PaginationParams {
  page: number
  page_size: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
