import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { useMedicineStore } from "@/store/useMedicineStore";
import type { Medicine, MedicineInput } from "@/types";

interface MedicineFormModalProps {
  open: boolean;
  onClose: () => void;
  medicine?: Medicine | null;
}

const categories = ["退烧", "肠胃", "慢性病", "外用", "营养", "感冒", "其他"];

const emptyForm: MedicineInput = {
  name: "",
  expiryDate: "",
  purpose: "",
  quantity: 1,
  category: "",
};

export default function MedicineFormModal({
  open,
  onClose,
  medicine,
}: MedicineFormModalProps) {
  const addMedicine = useMedicineStore((s) => s.addMedicine);
  const updateMedicine = useMedicineStore((s) => s.updateMedicine);

  const [form, setForm] = useState<MedicineInput>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (medicine) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = medicine;
      setForm({ ...rest, category: rest.category ?? "" });
    } else {
      setForm(emptyForm);
    }
  }, [open, medicine]);

  const update = <K extends keyof MedicineInput>(key: K, value: MedicineInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "请填写药品名称";
    if (!form.expiryDate) e.expiryDate = "请选择有效期";
    if (form.quantity < 1) e.quantity = "数量至少为 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const payload: MedicineInput = {
      name: form.name.trim(),
      expiryDate: form.expiryDate,
      purpose: form.purpose.trim(),
      quantity: Math.max(1, Math.floor(form.quantity)),
      category: form.category?.trim() || undefined,
    };
    if (medicine) {
      updateMedicine(medicine.id, payload);
    } else {
      addMedicine(payload);
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={medicine ? "编辑药品" : "录入新药"}
      subtitle={medicine ? "更新药品信息与存量" : "为家庭药箱添一味常备药"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-field" htmlFor="m-name">
            药品名称 <span className="text-seal">*</span>
          </label>
          <input
            id="m-name"
            className="input-field"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="如 布洛芬混悬液"
            autoFocus
          />
          {errors.name && (
            <p className="mt-1 font-serif text-xs text-seal">{errors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-field" htmlFor="m-expiry">
              有效期 <span className="text-seal">*</span>
            </label>
            <input
              id="m-expiry"
              type="date"
              className="input-field font-latin"
              value={form.expiryDate}
              onChange={(e) => update("expiryDate", e.target.value)}
            />
            {errors.expiryDate && (
              <p className="mt-1 font-serif text-xs text-seal">
                {errors.expiryDate}
              </p>
            )}
          </div>
          <div>
            <label className="label-field" htmlFor="m-qty">
              数量 <span className="text-seal">*</span>
            </label>
            <input
              id="m-qty"
              type="number"
              min={1}
              className="input-field font-latin"
              value={form.quantity}
              onChange={(e) => update("quantity", Number(e.target.value))}
            />
            {errors.quantity && (
              <p className="mt-1 font-serif text-xs text-seal">
                {errors.quantity}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="label-field" htmlFor="m-category">
            分类
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() =>
                  update("category", form.category === c ? "" : c)
                }
                className={
                  form.category === c
                    ? "rounded-full border border-herbal bg-herbal px-3 py-1 font-serif text-xs text-paper-light"
                    : "rounded-full border border-herbal/25 bg-transparent px-3 py-1 font-serif text-xs text-ink-muted hover:border-ochre hover:text-ochre-deep"
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-field" htmlFor="m-purpose">
            用途 / 备注
          </label>
          <textarea
            id="m-purpose"
            className="input-field min-h-[80px] resize-y"
            value={form.purpose}
            onChange={(e) => update("purpose", e.target.value)}
            placeholder="如 儿童退烧，饭后服用"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="btn-primary">
            {medicine ? "保存修改" : "收入药箱"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
