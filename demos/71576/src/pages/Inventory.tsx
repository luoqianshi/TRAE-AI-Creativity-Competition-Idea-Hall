import { useMemo, useState } from "react";
import { Search, Plus, Boxes, Filter, ArrowUpDown, Sparkles } from "lucide-react";
import { useMedicineStore } from "@/store/useMedicineStore";
import { useRecordStore } from "@/store/useRecordStore";
import { daysUntilExpiry, getStatus } from "@/utils/date";
import { getSampleMedicines, getSampleRecords } from "@/utils/sampleData";
import MedicineCard from "@/components/MedicineCard";
import MedicineFormModal from "@/components/MedicineFormModal";
import RecordFormModal from "@/components/RecordFormModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import { cn } from "@/lib/utils";
import type { Medicine, MedicineStatus } from "@/types";

type FilterKey = "all" | MedicineStatus;
type SortKey = "days" | "name" | "quantity";

const filterOptions: { key: FilterKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "expired", label: "已过期" },
  { key: "expiring", label: "将过期" },
  { key: "safe", label: "正常" },
];

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "days", label: "按剩余天数" },
  { key: "name", label: "按名称" },
  { key: "quantity", label: "按数量" },
];

export default function Inventory() {
  const medicines = useMedicineStore((s) => s.medicines);
  const removeMedicine = useMedicineStore((s) => s.removeMedicine);
  const loadMedSample = useMedicineStore((s) => s.loadSample);
  const loadRecSample = useRecordStore((s) => s.loadSample);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("days");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [recordTarget, setRecordTarget] = useState<Medicine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Medicine | null>(null);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = medicines.filter((m) => {
      if (q) {
        const hay = `${m.name} ${m.purpose} ${m.category ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filter !== "all") {
        if (getStatus(daysUntilExpiry(m.expiryDate)) !== filter) return false;
      }
      return true;
    });
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "days")
        return daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate);
      if (sort === "quantity") return b.quantity - a.quantity;
      return a.name.localeCompare(b.name, "zh-CN");
    });
    return sorted;
  }, [medicines, search, filter, sort]);

  const handleEdit = (m: Medicine) => {
    setEditing(m);
    setFormOpen(true);
  };
  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const handleDelete = (m: Medicine) => setDeleteTarget(m);
  const confirmDelete = () => {
    if (deleteTarget) removeMedicine(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleLoadSample = () => {
    loadMedSample(getSampleMedicines());
    loadRecSample(getSampleRecords());
  };

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-herbal">药品库存</h1>
          <p className="mt-1 font-serif text-sm text-ink-muted">
            共 {medicines.length} 味常备药 · 按剩余天数排序可优先处理临近过期
          </p>
        </div>
        <button className="btn-primary self-start sm:self-auto" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          录入药品
        </button>
      </div>

      {medicines.length === 0 ? (
        <EmptyState
          icon={<Boxes className="h-7 w-7" />}
          title="药箱空空如也"
          description="录入第一味药品，或载入示例药箱快速体验。"
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <button className="btn-primary" onClick={handleAdd}>
                <Plus className="h-4 w-4" />
                录入药品
              </button>
              <button className="btn-secondary" onClick={handleLoadSample}>
                <Sparkles className="h-4 w-4" />
                载入示例药箱
              </button>
            </div>
          }
        />
      ) : (
        <>
          {/* Toolbar */}
          <div className="mb-6 flex flex-col gap-3 rounded-specimen border border-herbal/15 bg-paper-light/70 p-4 shadow-specimen lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
              <input
                className="input-field pl-9"
                placeholder="搜索药品名称、用途或分类"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 font-serif text-xs text-ink-muted">
                <Filter className="h-3.5 w-3.5" /> 筛选
              </span>
              {filterOptions.map((o) => (
                <button
                  key={o.key}
                  onClick={() => setFilter(o.key)}
                  className={cn(
                    "rounded-full px-3 py-1 font-serif text-xs transition-colors",
                    filter === o.key
                      ? "bg-herbal text-paper-light"
                      : "bg-transparent text-ink-muted hover:bg-herbal/8 hover:text-herbal",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-serif text-xs text-ink-muted">
                <ArrowUpDown className="h-3.5 w-3.5" /> 排序
              </span>
              <select
                className="input-field cursor-pointer py-1.5 text-sm"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                {sortOptions.map((o) => (
                  <option key={o.key} value={o.key}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          {list.length === 0 ? (
            <EmptyState
              icon={<Search className="h-7 w-7" />}
              title="没有符合条件的药品"
              description="尝试调整搜索关键词或筛选条件。"
            />
          ) : (
            <div className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((m) => (
                <MedicineCard
                  key={m.id}
                  medicine={m}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRecord={(med) => setRecordTarget(med)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <MedicineFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        medicine={editing}
      />
      <RecordFormModal
        open={!!recordTarget}
        onClose={() => setRecordTarget(null)}
        presetMedicine={recordTarget}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        title="移除药品"
        message={`确认从药箱中移除「${deleteTarget?.name ?? ""}」？此操作不可撤销。`}
        confirmText="移除"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
