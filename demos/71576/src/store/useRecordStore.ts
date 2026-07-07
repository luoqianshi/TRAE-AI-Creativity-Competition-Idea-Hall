import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MedicationRecord, RecordInput } from "@/types";

interface RecordState {
  records: MedicationRecord[];
  addRecord: (input: RecordInput, medicineName: string) => void;
  removeRecord: (id: string) => void;
  loadSample: (samples: MedicationRecord[]) => void;
  clearAll: () => void;
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useRecordStore = create<RecordState>()(
  persist(
    (set) => ({
      records: [],
      addRecord: (input, medicineName) =>
        set((state) => ({
          records: [
            {
              id: uid(),
              medicineId: input.medicineId,
              medicineName,
              timestamp: input.timestamp,
              dosage: input.dosage,
              note: input.note,
            },
            ...state.records,
          ],
        })),
      removeRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),
      loadSample: (samples) =>
        set(() => ({
          records: samples,
        })),
      clearAll: () => set({ records: [] }),
    }),
    {
      name: "fmm-records",
      version: 1,
    },
  ),
);
