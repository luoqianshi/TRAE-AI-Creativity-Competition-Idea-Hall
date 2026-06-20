import { create } from 'zustand';
import type { Product, HistoryRecord, CompareResult } from '@/types';

const HISTORY_KEY = 'unitprice_history';
const MAX_HISTORY = 20;

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function loadHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveHistory(records: HistoryRecord[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
  } catch { /* ignore */ }
}

function createEmptyProduct(): Product {
  return {
    id: generateId(),
    name: '',
    quantity: 0,
    unit: '',
    price: 0,
  };
}

interface AppState {
  products: Product[];
  history: HistoryRecord[];

  addProduct: () => void;
  removeProduct: (id: string) => void;
  updateProduct: (id: string, field: keyof Product, value: string | number) => void;
  clearAll: () => void;
  loadFromHistory: (products: Product[]) => void;

  addHistory: (products: Product[], results: CompareResult[]) => void;
  clearHistory: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  products: [createEmptyProduct(), createEmptyProduct()],
  history: loadHistory(),

  addProduct: () => {
    const { products } = get();
    if (products.length >= 6) return;
    set({ products: [...products, createEmptyProduct()] });
  },

  removeProduct: (id: string) => {
    const { products } = get();
    if (products.length <= 2) return;
    set({ products: products.filter((p) => p.id !== id) });
  },

  updateProduct: (id: string, field: keyof Product, value: string | number) => {
    const { products } = get();
    set({
      products: products.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    });
  },

  clearAll: () => {
    set({ products: [createEmptyProduct(), createEmptyProduct()] });
  },

  loadFromHistory: (products: Product[]) => {
    set({ products: products.map((p) => ({ ...p, id: generateId() })) });
  },

  addHistory: (products: Product[], results: CompareResult[]) => {
    const { history } = get();
    const record: HistoryRecord = {
      id: generateId(),
      timestamp: Date.now(),
      products: products.map((p) => ({ ...p })),
      results,
    };
    const updated = [record, ...history].slice(0, MAX_HISTORY);
    saveHistory(updated);
    set({ history: updated });
  },

  clearHistory: () => {
    saveHistory([]);
    set({ history: [] });
  },
}));