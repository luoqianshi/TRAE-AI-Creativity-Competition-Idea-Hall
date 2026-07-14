import type { AccountConfig, AccountBalance, Transaction, DailySettlement, StatisticsData } from '@/types'
import { formatDate } from './storage'

export const calculator = {
  calculateEffectiveDays(restDays: number): number {
    return Math.max(1, 365 - restDays)
  },

  calculateDailyBaseCapital(totalHeartCoins: number, effectiveDays: number): number {
    return totalHeartCoins / effectiveDays
  },

  calculateHourlyValue(dailyBaseCapital: number): number {
    return dailyBaseCapital / 24
  },

  calculateAmountByHours(hours: number, hourlyValue: number): number {
    return hours * hourlyValue
  },

  calculateInterest(balance: number, dailyRate: number): number {
    return balance * dailyRate
  },

  performDailySettlement(
    balance: AccountBalance,
    config: AccountConfig
  ): DailySettlement {
    const rate = config.dailyInterestRate
    const date = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000))

    const wealthInterest = config.wealthEnabled ? this.calculateInterest(balance.wealth, rate) : 0
    const healthInterest = config.healthEnabled ? this.calculateInterest(balance.health, rate) : 0
    const emotionInterest = config.emotionEnabled ? this.calculateInterest(balance.emotion, rate) : 0

    return {
      date,
      wealthBalance: balance.wealth,
      healthBalance: balance.health,
      emotionBalance: balance.emotion,
      wealthInterest,
      healthInterest,
      emotionInterest,
      totalInterest: wealthInterest + healthInterest + emotionInterest
    }
  },

  updateBalanceAfterSettlement(
    balance: AccountBalance,
    settlement: DailySettlement
  ): AccountBalance {
    return {
      wealth: balance.wealth + settlement.wealthInterest,
      health: balance.health + settlement.healthInterest,
      emotion: balance.emotion + settlement.emotionInterest,
      total: balance.wealth + balance.health + balance.emotion + settlement.totalInterest
    }
  },

  updateBalanceAfterTransaction(
    balance: AccountBalance,
    transaction: Transaction
  ): AccountBalance {
    const newBalance = { ...balance }
    
    if (transaction.type === 'income') {
      newBalance[transaction.accountType] += transaction.amount
    } else {
      newBalance[transaction.accountType] -= transaction.amount
    }
    
    newBalance.total = newBalance.wealth + newBalance.health + newBalance.emotion
    
    return newBalance
  },

  calculateStatistics(
    transactions: Transaction[],
    settlements: DailySettlement[],
    balance: AccountBalance,
    period: 'today' | 'week' | 'month'
  ): StatisticsData {
    const today = new Date()
    let startDate: Date

    switch (period) {
      case 'today':
        startDate = today
        break
      case 'week':
        const day = today.getDay() || 7
        startDate = new Date(today)
        startDate.setDate(today.getDate() - day + 1)
        break
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        break
    }

    const start = formatDate(startDate)
    const end = formatDate(today)

    const filteredTransactions = transactions.filter(t =>
      t.createdAt >= start && t.createdAt <= end
    )

    const filteredSettlements = settlements.filter(s =>
      s.date >= start && s.date <= end
    )

    const income = { wealth: 0, health: 0, emotion: 0, total: 0 }
    const expense = { wealth: 0, health: 0, emotion: 0, total: 0 }

    filteredTransactions.forEach(t => {
      if (t.type === 'income') {
        income[t.accountType] += t.amount
        income.total += t.amount
      } else {
        expense[t.accountType] += t.amount
        expense.total += t.amount
      }
    })

    const interest = filteredSettlements.reduce((sum, s) => sum + s.totalInterest, 0)

    return {
      period,
      income,
      expense,
      netIncome: income.total - expense.total,
      interest,
      finalBalance: balance.total
    }
  },

  calculateDailyChanges(
    transactions: Transaction[],
    settlements: DailySettlement[],
    period: 'today' | 'week' | 'month'
  ): { data: number[]; labels: string[] } {
    const today = new Date()
    let startDate: Date

    switch (period) {
      case 'today':
        startDate = today
        break
      case 'week':
        const day = today.getDay() || 7
        startDate = new Date(today)
        startDate.setDate(today.getDate() - day + 1)
        break
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        break
    }

    const data: number[] = []
    const labels: string[] = []

    let currentDate = new Date(startDate)
    const endDate = new Date(today)

    while (currentDate <= endDate) {
      const dateStr = formatDate(currentDate)
      labels.push(`${currentDate.getMonth() + 1}/${currentDate.getDate()}`)

      const dayTransactions = transactions.filter(t => t.createdAt.startsWith(dateStr))
      const daySettlement = settlements.find(s => s.date === dateStr)

      let dayChange = 0
      dayTransactions.forEach(t => {
        dayChange += t.type === 'income' ? t.amount : -t.amount
      })
      if (daySettlement) {
        dayChange += daySettlement.totalInterest
      }

      data.push(dayChange)
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return { data: data.length > 0 ? data : [0], labels: labels.length > 0 ? labels : ['-'] }
  },

  checkAndPerformSettlement(
    config: AccountConfig,
    balance: AccountBalance
  ): { needsSettlement: boolean; newBalance?: AccountBalance; settlement?: DailySettlement } {
    const today = formatDate(new Date())
    if (config.lastSettlementDate !== today) {
      const settlement = this.performDailySettlement(balance, config)
      const newBalance = this.updateBalanceAfterSettlement(balance, settlement)
      return { needsSettlement: true, newBalance, settlement }
    }
    return { needsSettlement: false }
  }
}
