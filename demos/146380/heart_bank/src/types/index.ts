export interface AccountConfig {
  totalHeartCoins: number
  restDays: number
  dailyBaseCapital: number
  hourlyValue: number
  wealthEnabled: boolean
  healthEnabled: boolean
  emotionEnabled: boolean
  dailyInterestRate: number
  positiveDeclaration: string
  accountCreatedAt: string
  lastSettlementDate: string
}

export interface AccountBalance {
  wealth: number
  health: number
  emotion: number
  total: number
}

export interface Transaction {
  id: string
  accountType: 'wealth' | 'health' | 'emotion'
  type: 'income' | 'expense'
  description: string
  hours: number
  amount: number
  createdAt: string
}

export interface DailySettlement {
  date: string
  wealthBalance: number
  healthBalance: number
  emotionBalance: number
  wealthInterest: number
  healthInterest: number
  emotionInterest: number
  totalInterest: number
}

export interface StatisticsData {
  period: 'today' | 'week' | 'month'
  income: {
    wealth: number
    health: number
    emotion: number
    total: number
  }
  expense: {
    wealth: number
    health: number
    emotion: number
    total: number
  }
  netIncome: number
  interest: number
  finalBalance: number
}
