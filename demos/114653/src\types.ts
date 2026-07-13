export type Status = 'fresh' | 'warning' | 'urgent'

export interface Ingredient { id: string; name: string; icon: string; category: string; daysLeft: number; amount: string; status: Status }
export interface Medicine { id: string; name: string; icon: string; category: string; stock: number; dosage: string; status: Status; nextDose: string }
export interface ChecklistItem { id: string; name: string; icon: string; category: string; location: string; detail: string; essential: boolean; checked: boolean }

