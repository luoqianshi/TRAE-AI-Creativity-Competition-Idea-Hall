import axios from 'axios'
import type {
  LoginForm,
  LoginResponse,
  Admin,
  Organization,
  Class,
  Category,
  Expense,
  OverviewStats,
  CategoryStats,
  StatusStats,
  ClassStats,
  OperationLog,
  ApiResponse
} from '@/types'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器，添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    const data = response.data
    // 将后端的 { success: true, data: ... } 格式转换为前端的 { code: 200, message: '', data: ... } 格式
    if (data.success !== undefined) {
      return {
        code: data.success ? 200 : (data.code || 400),
        message: data.message || (data.success ? 'success' : 'failed'),
        data: data.data
      }
    }
    return data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 认证相关
export const authApi = {
  login(credentials: LoginForm): Promise<ApiResponse<LoginResponse>> {
    return api.post('/auth/login', credentials)
  }
}

// 管理员相关
export const adminApi = {
  getAll(): Promise<ApiResponse<Admin[]>> {
    return api.get('/admins')
  },

  create(admin: Partial<Admin> & { password: string }): Promise<ApiResponse<Admin>> {
    return api.post('/admins', admin)
  }
}

// 机构相关
export const orgApi = {
  getAll(): Promise<ApiResponse<Organization[]>> {
    return api.get('/organizations')
  },

  create(org: { name: string }): Promise<ApiResponse<Organization>> {
    return api.post('/organizations', org)
  }
}

// 班级相关
export const classApi = {
  getAll(): Promise<ApiResponse<Class[]>> {
    return api.get('/classes')
  },

  create(classData: { org_id: number; name: string }): Promise<ApiResponse<Class>> {
    return api.post('/classes', classData)
  }
}

// 类目相关
export const categoryApi = {
  getAll(): Promise<ApiResponse<Category[]>> {
    return api.get('/categories')
  },

  create(category: { name: string; color?: string }): Promise<ApiResponse<Category>> {
    return api.post('/categories', category)
  },

  delete(id: number): Promise<ApiResponse<null>> {
    return api.delete(`/categories/${id}`)
  }
}

// 费用相关
export const expenseApi = {
  getAll(params?: { org_id?: number; class_id?: number; status?: string; page?: number; page_size?: number }): Promise<ApiResponse<Expense[]>> {
    // 转换为后端参数：page, limit
    const backendParams: any = {}
    if (params?.org_id) backendParams.org_id = params.org_id
    if (params?.class_id) backendParams.class_id = params.class_id
    if (params?.status) backendParams.status = params.status
    if (params?.page) backendParams.page = params.page
    if (params?.page_size) backendParams.limit = params.page_size
    return api.get('/expenses', { params: backendParams })
  },

  getById(id: number): Promise<ApiResponse<Expense>> {
    return api.get(`/expenses/${id}`)
  },

  create(expense: Partial<Expense> & { date: string; category: string; amount: number; handler: string }): Promise<ApiResponse<Expense>> {
    return api.post('/expenses', expense)
  },

  update(id: number, expense: Partial<Expense>): Promise<ApiResponse<Expense>> {
    return api.put(`/expenses/${id}`, expense)
  },

  delete(id: number): Promise<ApiResponse<null>> {
    return api.delete(`/expenses/${id}`)
  },

  // 追加金额（复用创建接口）
  addToCategory(expense: Partial<Expense> & { category: string; amount: number }): Promise<ApiResponse<Expense>> {
    return api.post('/expenses', {
      ...expense,
      handler: '系统' // 自动设置经手人
    })
  },

  // 获取统计数据
  getStats(params?: { org_id?: number; class_id?: number }): Promise<ApiResponse<{
    total_collected: number
    total_expended: number
    balance: number
    categoryStats: CategoryStats[]
    statusStats: StatusStats[]
    classStats: ClassStats[]
  }>> {
    const backendParams: any = {}
    if (params?.org_id) backendParams.org_id = params.org_id
    if (params?.class_id) backendParams.class_id = params.class_id
    return api.get('/expenses/stats/summary', { params: backendParams })
  }
}

// 统计相关（保留但内部调用expenseApi.getStats）
export const statsApi = {
  getOverview(params?: { org_id?: number; class_id?: number }): Promise<ApiResponse<OverviewStats>> {
    return expenseApi.getStats(params).then(res => {
      if (res.code === 200) {
        return {
          code: 200,
          message: res.message,
          data: {
            total_collected: res.data.total_collected,
            total_expended: res.data.total_expended,
            balance: res.data.balance,
            categoryStats: res.data.categoryStats,
            statusStats: res.data.statusStats,
            classStats: res.data.classStats
          }
        }
      }
      return { code: res.code, message: res.message, data: { total_collected: 0, total_expended: 0, balance: 0, categoryStats: [], statusStats: [], classStats: [] } }
    })
  },

  getByCategory(params?: { org_id?: number; class_id?: number }): Promise<ApiResponse<CategoryStats[]>> {
    return expenseApi.getStats(params).then(res => {
      if (res.code === 200) {
        return { code: 200, message: res.message, data: res.data.categoryStats }
      }
      return { code: res.code, message: res.message, data: [] }
    })
  },

  getByStatus(params?: { org_id?: number; class_id?: number }): Promise<ApiResponse<StatusStats[]>> {
    return expenseApi.getStats(params).then(res => {
      if (res.code === 200) {
        return { code: 200, message: res.message, data: res.data.statusStats }
      }
      return { code: res.code, message: res.message, data: [] }
    })
  }
}

// 日志相关
export const logApi = {
  getAll(params?: { limit?: number }): Promise<ApiResponse<OperationLog[]>> {
    return api.get('/logs', { params })
  }
}

// 用户信息
export const userApi = {
  getInfo(): Promise<ApiResponse<{ user: Admin }>> {
    return api.get('/user/info')
  }
}

export default api
