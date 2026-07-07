import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Medicine, MedicineInput } from "@/types";

interface MedicineState {
  medicines: Medicine[];
  addMedicine: (input: MedicineInput) => void;
  updateMedicine: (id: string, input: MedicineInput) => void;
  removeMedicine: (id: string) => void;
  getById: (id: string) => Medicine | undefined;
  loadSample: (samples: Medicine[]) => void;
  clearAll: () => void;
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useMedicineStore = create<MedicineState>()(
  persist(
    (set, get) => ({
      medicines: [],
      addMedicine: (input) =>
        set((state) => ({
          medicines: [
            {
              ...input,
              id: uid(),
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ...state.medicines,
          ],
        })),
      updateMedicine: (id, input) =>
        set((state) => ({
          medicines: state.medicines.map((m) =>
            m.id === id
              ? { ...m, ...input, updatedAt: Date.now() }
              : m,
          ),
        })),
      removeMedicine: (id) =>
        set((state) => ({
          medicines: state.medicines.filter((m) => m.id !== id),
        })),
      getById: (id) => get().medicines.find((m) => m.id === id),
      loadSample: (samples) =>
        set(() => ({
          medicines: samples,
        })),
      clearAll: () => set({ medicines: [] }),
    }),
    {
      name: "fmm-medicines",
      version: 1,
    },
  ),
);
