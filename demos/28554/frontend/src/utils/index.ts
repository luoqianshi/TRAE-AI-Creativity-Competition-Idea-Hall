import dayjs from 'dayjs'
import type { Expense, CategoryStats, StatusStats } from '@/types'

// 格式化日期
export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format)
}

// 格式化金额（千分位）
export const formatAmount = (amount: number): string => {
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 计算百分比
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((value / total) * 100 * 100) / 100
}

// 从费用列表计算总金额
export const calculateTotalAmount = (expenses: Expense[]): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0)
}

// 按类目统计
export const groupByCategory = (expenses: Expense[]): CategoryStats[] => {
  const total = calculateTotalAmount(expenses)
  const grouped: Record<string, number> = {}

  expenses.forEach(expense => {
    if (!grouped[expense.category]) {
      grouped[expense.category] = 0
    }
    grouped[expense.category] += expense.amount
  })

  return Object.entries(grouped)
    .map(([name, amount]) => ({
      name,
      total: amount,
      percentage: calculatePercentage(amount, total),
      color: getCategoryColor(name)
    }))
    .sort((a, b) => b.total - a.total)
}

// 按状态统计
export const groupByStatus = (expenses: Expense[]): StatusStats[] => {
  const overallTotal = calculateTotalAmount(expenses)
  const grouped: Record<string, number> = {}

  expenses.forEach(expense => {
    if (!grouped[expense.status]) {
      grouped[expense.status] = 0
    }
    grouped[expense.status] += expense.amount
  })

  return Object.entries(grouped)
    .map(([name, total]) => ({
      name,
      total,
      percentage: calculatePercentage(total, overallTotal)
    }))
}

// 根据类目名称获取颜色
export const getCategoryColor = (categoryName: string): string => {
  const colors: Record<string, string> = {
    '教材费用': '#1989fa',
    '玩具采购': '#ff976a',
    '伙食费': '#07c160',
    '水电费': '#6467f0',
    '活动经费': '#ee0a24',
    '其他': '#969799'
  }
  return colors[categoryName] || '#1989fa'
}

// 获取状态颜色
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    '待审核': '#ff976a',
    '进行中': '#1989fa',
    '已完成': '#07c160'
  }
  return colors[status] || '#969799'
}

// 手机号验证
export const validatePhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone)
}

// 密码验证（至少6位）
export const validatePassword = (password: string): boolean => {
  return password.length >= 6
}

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

// 深拷贝
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}
