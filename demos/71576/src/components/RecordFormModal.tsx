import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/Modal";
import { useMedicineStore } from "@/store/useMedicineStore";
import { useRecordStore } from "@/store/useRecordStore";
import { toLocalInputValue, fromLocalInputValue } from "@/utils/date";
import type { Medicine } from "@/types";

interface RecordFormModalProps {
  open: boolean;
  onClose: () => void;
  presetMedicine?: Medicine | null;
}

export default function RecordFormModal({
  open,
  onClose,
  presetMedicine,
}: RecordFormModalProps) {
  const medicines = useMedicineStore((s) => s.medicines);
  const addRecord = useRecordStore((s) => s.addRecord);

  const [medicineId, setMedicineId] = useState("");
  const [dosage, setDosage] = useState("");
  const [timestamp, setTimestamp] = useState(() =>
    toLocalInputValue(Date.now()),
  );
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sortedMedicines = useMemo(
    () =>
      [...medicines].sort((a, b) =>
        a.name.localeCompare(b.name, "zh-CN"),
      ),
    [medicines],
  );

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setDosage("");
    setNote("");
    setTimestamp(toLocalInputValue(Date.now()));
    setMedicineId(presetMedicine?.id ?? medicines[0]?.id ?? "");
  }, [open, presetMedicine, medicines]);

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!medicineId) e.medicine = "请选择药品";
    if (!dosage.trim()) e.dosage = "请填写剂量";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const med = medicines.find((m) => m.id === medicineId);
    addRecord(
      {
        medicineId,
        dosage: dosage.trim(),
        timestamp: fromLocalInputValue(timestamp),
        note: note.trim() || undefined,
      },
      med?.name ?? "未知药品",
    );
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="记一笔用药"
      subtitle="记录服用时间与剂量，方便回溯"
    >
      {sortedMedicines.length === 0 ? (
        <div className="rounded-lg border border-dashed border-herbal/25 bg-paper/50 px-4 py-8 text-center">
          <p className="font-serif text-ink-muted">
            药箱还是空的，请先录入药品再记录用药。
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field" htmlFor="r-medicine">
              选择药品 <span className="text-seal">*</span>
            </label>
            <select
              id="r-medicine"
              className="input-field cursor-pointer"
              value={medicineId}
              onChange={(e) => setMedicineId(e.target.value)}
              disabled={!!presetMedicine}
            >
              {sortedMedicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                  {m.category ? ` · ${m.category}` : ""} · 存量 {m.quantity}
                </option>
              ))}
            </select>
            {errors.medicine && (
              <p className="mt-1 font-serif text-xs text-seal">
                {errors.medicine}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label-field" htmlFor="r-dosage">
                剂量 <span className="text-seal">*</span>
              </label>
              <input
                id="r-dosage"
                className="input-field"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="如 1片 / 5ml"
                autoFocus
              />
              {errors.dosage && (
                <p className="mt-1 font-serif text-xs text-seal">
                  {errors.dosage}
                </p>
              )}
            </div>
            <div>
              <label className="label-field" htmlFor="r-time">
                服用时间 <span className="text-seal">*</span>
              </label>
              <input
                id="r-time"
                type="datetime-local"
                className="input-field font-latin"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label-field" htmlFor="r-note">
              备注
            </label>
            <input
              id="r-note"
              className="input-field"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="如 饭后 / 儿童减半"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-primary">
              记入册中
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
