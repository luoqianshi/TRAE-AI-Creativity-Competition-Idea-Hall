import type { AccountConfig, AccountBalance, Transaction, DailySettlement } from '@/types'

const STORAGE_KEYS = {
  ACCOUNT_CONFIG: 'heart_bank_account_config',
  ACCOUNT_BALANCE: 'heart_bank_account_balance',
  TRANSACTIONS: 'heart_bank_transactions',
  DAILY_SETTLEMENTS: 'heart_bank_daily_settlements',
  IS_OPENED: 'heart_bank_is_opened'
}

export const storage = {
  getAccountConfig(): AccountConfig | null {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNT_CONFIG)
    return data ? JSON.parse(data) : null
  },

  setAccountConfig(config: AccountConfig): void {
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_CONFIG, JSON.stringify(config))
  },

  getAccountBalance(): AccountBalance | null {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNT_BALANCE)
    return data ? JSON.parse(data) : null
  },

  setAccountBalance(balance: AccountBalance): void {
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_BALANCE, JSON.stringify(balance))
  },

  getTransactions(): Transaction[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
    return data ? JSON.parse(data) : []
  },

  addTransaction(transaction: Transaction): void {
    const transactions = this.getTransactions()
    transactions.unshift(transaction)
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions))
  },

  getDailySettlements(): DailySettlement[] {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_SETTLEMENTS)
    return data ? JSON.parse(data) : []
  },

  addDailySettlement(settlement: DailySettlement): void {
    const settlements = this.getDailySettlements()
    settlements.unshift(settlement)
    localStorage.setItem(STORAGE_KEYS.DAILY_SETTLEMENTS, JSON.stringify(settlements))
  },

  updateLastSettlementDate(date: string): void {
    const config = this.getAccountConfig()
    if (config) {
      config.lastSettlementDate = date
      this.setAccountConfig(config)
    }
  },

  isAccountOpened(): boolean {
    return localStorage.getItem(STORAGE_KEYS.IS_OPENED) === 'true'
  },

  setAccountOpened(opened: boolean): void {
    localStorage.setItem(STORAGE_KEYS.IS_OPENED, String(opened))
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT_CONFIG)
    localStorage.removeItem(STORAGE_KEYS.ACCOUNT_BALANCE)
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS)
    localStorage.removeItem(STORAGE_KEYS.DAILY_SETTLEMENTS)
    localStorage.removeItem(STORAGE_KEYS.IS_OPENED)
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateTime(date: Date): string {
  return formatDate(date) + ' ' + String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0')
}

export function formatMoney(amount: number): string {
  return amount.toFixed(2)
}
