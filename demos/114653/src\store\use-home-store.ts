import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { checklistItems } from '../data/mock-data'

interface HomeState {
  selectedIngredients: string[]
  selectedMedicines: string[]
  checklist: typeof checklistItems
  toggleIngredient: (id: string) => void
  toggleMedicine: (id: string) => void
  toggleChecklist: (id: string) => void
  setAllChecklist: (checked: boolean) => void
}

const toggleId = (values: string[], id: string) => values.includes(id) ? values.filter((value) => value !== id) : [...values, id]

export const useHomeStore = create<HomeState>()(persist((set) => ({
  selectedIngredients: [], selectedMedicines: [], checklist: checklistItems,
  toggleIngredient: (id) => set((state) => ({ selectedIngredients: toggleId(state.selectedIngredients, id) })),
  toggleMedicine: (id) => set((state) => ({ selectedMedicines: toggleId(state.selectedMedicines, id) })),
  toggleChecklist: (id) => set((state) => ({ checklist: state.checklist.map((item) => item.id === id ? { ...item, checked: !item.checked } : item) })),
  setAllChecklist: (checked) => set((state) => ({ checklist: state.checklist.map((item) => ({ ...item, checked })) })),
}), { name: 'qizhi-home' }))
