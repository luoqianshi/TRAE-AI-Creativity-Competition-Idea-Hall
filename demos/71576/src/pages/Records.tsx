import { useMemo, useState } from "react";
import { Plus, ScrollText, Trash2, Pill, Sparkles } from "lucide-react";
import { useRecordStore } from "@/store/useRecordStore";
import { useMedicineStore } from "@/store/useMedicineStore";
import { formatDateTime } from "@/utils/date";
import { getSampleMedicines, getSampleRecords } from "@/utils/sampleData";
import RecordFormModal from "@/components/RecordFormModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";

export default function Records() {
  const records = useRecordStore((s) => s.records);
  const removeRecord = useRecordStore((s) => s.removeRecord);
  const loadRecSample = useRecordStore((s) => s.loadSample);
  const loadMedSample = useMedicineStore((s) => s.loadSample);
  const medicines = useMedicineStore((s) => s.medicines);

  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterMed, setFilterMed] = useState<string>("all");

  const sorted = useMemo(
    () => [...records].sort((a, b) => b.timestamp - a.timestamp),
    [records],
  );

  const filtered = useMemo(
    () =>
      filterMed === "all"
        ? sorted
        : sorted.filter((r) => r.medicineId === filterMed),
    [sorted, filterMed],
  );

  // 按日期分组（用于时间线展示）
  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const r of filtered) {
      const d = new Date(r.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const handleLoadSample = () => {
    loadMedSample(getSampleMedicines());
    loadRecSample(getSampleRecords());
  };

  const confirmDelete = () => {
    if (deleteTarget) removeRecord(deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-herbal">用药记录</h1>
          <p className="mt-1 font-serif text-sm text-ink-muted">
            共 {records.length} 笔记录 · 按时间倒序，便于回溯
          </p>
        </div>
        <button
          className="btn-primary self-start sm:self-auto"
          onClick={() => setAddOpen(true)}
          disabled={medicines.length === 0}
          title={medicines.length === 0 ? "请先录入药品" : undefined}
        >
          <Plus className="h-4 w-4" />
          记一笔
        </button>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="h-7 w-7" />}
          title="尚无用药记录"
          description={
            medicines.length === 0
              ? "请先录入药品，再记录每次用药的时间与剂量。"
              : "点击「记一笔」开始记录用药，方便日后回溯。"
          }
          action={
            medicines.length === 0 ? (
              <button className="btn-secondary" onClick={handleLoadSample}>
                <Sparkles className="h-4 w-4" />
                载入示例药箱
              </button>
            ) : (
              <button className="btn-primary" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4" />
                记一笔
              </button>
            )
          }
        />
      ) : (
        <>
          {/* Filter */}
          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-specimen border border-herbal/15 bg-paper-light/70 p-3 shadow-specimen">
            <span className="px-2 font-serif text-xs text-ink-muted">
              按药品筛选
            </span>
            <button
              onClick={() => setFilterMed("all")}
              className={
                filterMed === "all"
                  ? "rounded-full bg-herbal px-3 py-1 font-serif text-xs text-paper-light"
                  : "rounded-full px-3 py-1 font-serif text-xs text-ink-muted hover:bg-herbal/8 hover:text-herbal"
              }
            >
              全部
            </button>
            {medicines.map((m) => (
              <button
                key={m.id}
                onClick={() => setFilterMed(m.id)}
                className={
                  filterMed === m.id
                    ? "rounded-full bg-herbal px-3 py-1 font-serif text-xs text-paper-light"
                    : "rounded-full px-3 py-1 font-serif text-xs text-ink-muted hover:bg-herbal/8 hover:text-herbal"
                }
              >
                {m.name}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<ScrollText className="h-7 w-7" />}
              title="该药品暂无记录"
              description="换一个药品看看，或记录第一笔用药。"
            />
          ) : (
            <div className="space-y-8">
              {grouped.map(([date, items]) => (
                <section key={date}>
                  <div className="divider-diamond mb-3">
                    <span className="font-latin text-sm tracking-wide">
                      {date.replace(/-/g, " / ")}
                    </span>
                  </div>
                  <ol className="stagger space-y-3">
                    {items.map((r) => (
                      <li
                        key={r.id}
                        className="group relative flex gap-4 rounded-specimen border border-herbal/12 bg-paper-light/80 px-5 py-4 shadow-specimen transition-all hover:shadow-specimen-hover"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ochre/30 bg-ochre/8 text-ochre">
                          <Pill className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="font-serif font-bold text-herbal">
                              {r.medicineName}
                            </span>
                            <span className="rounded-full bg-herbal/8 px-2 py-0.5 font-serif text-xs text-herbal">
                              {r.dosage}
                            </span>
                            <time className="font-latin text-sm text-ink-muted">
                              {formatDateTime(r.timestamp)}
                            </time>
                          </div>
                          {r.note && (
                            <p className="mt-1 font-serif text-sm text-ink-muted">
                              {r.note}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(r.id)}
                          className="btn-ghost self-center text-seal/70 hover:bg-seal/8 hover:text-seal"
                          aria-label="删除记录"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          )}
        </>
      )}

      <RecordFormModal open={addOpen} onClose={() => setAddOpen(false)} />
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除记录"
        message="确认删除这条用药记录？此操作不可撤销。"
        confirmText="删除"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
