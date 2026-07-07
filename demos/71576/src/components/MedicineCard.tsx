import { Pencil, Trash2, Pill, CalendarClock, Layers } from "lucide-react";
import type { Medicine } from "@/types";
import { daysUntilExpiry, getStatus, expiryText, formatDate } from "@/utils/date";
import { cn } from "@/lib/utils";
import StatusSeal from "@/components/StatusSeal";

interface MedicineCardProps {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
  onDelete: (medicine: Medicine) => void;
  onRecord?: (medicine: Medicine) => void;
  compact?: boolean;
}

const statusAccent: Record<string, string> = {
  expired: "border-seal/30",
  expiring: "border-amber/35",
  safe: "border-herbal/15",
};

export default function MedicineCard({
  medicine,
  onEdit,
  onDelete,
  onRecord,
  compact = false,
}: MedicineCardProps) {
  const days = daysUntilExpiry(medicine.expiryDate);
  const status = getStatus(days);

  return (
    <article
      className={cn(
        "specimen-card corner-mark group flex flex-col p-5",
        statusAccent[status],
      )}
    >
      <div className="flex items-start gap-4">
        <StatusSeal status={status} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-serif text-lg font-bold text-herbal">
              {medicine.name}
            </h3>
            {medicine.category && (
              <span className="shrink-0 rounded-full bg-ochre/12 px-2.5 py-0.5 font-serif text-xs text-ochre-deep">
                {medicine.category}
              </span>
            )}
          </div>
          {!compact && medicine.purpose && (
            <p className="mt-1 line-clamp-2 font-serif text-sm text-ink-muted">
              {medicine.purpose}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 font-serif text-sm">
        <div className="flex items-center gap-2 text-ink-muted">
          <CalendarClock className="h-4 w-4 shrink-0 text-ochre" />
          <span className="font-latin text-[15px]">
            {formatDate(medicine.expiryDate)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <Layers className="h-4 w-4 shrink-0 text-ochre" />
          <span>存量 {medicine.quantity}</span>
        </div>
      </div>

      <div
        className={cn(
          "mt-3 flex items-center gap-2 rounded-lg px-3 py-2 font-serif text-sm font-medium",
          status === "expired" && "bg-seal/10 text-seal",
          status === "expiring" && "bg-amber/12 text-amber",
          status === "safe" && "bg-moss/10 text-moss",
        )}
      >
        <Pill className="h-4 w-4 shrink-0" />
        <span>{expiryText(days)}</span>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-herbal/10 pt-3 opacity-80 transition-opacity group-hover:opacity-100">
        {onRecord && (
          <button
            type="button"
            className="btn-ghost text-xs"
            onClick={() => onRecord(medicine)}
          >
            记一笔
          </button>
        )}
        <div className="flex-1" />
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => onEdit(medicine)}
          aria-label="编辑"
        >
          <Pencil className="h-4 w-4" />
          <span className="hidden sm:inline">编辑</span>
        </button>
        <button
          type="button"
          className="btn-ghost text-xs text-seal/80 hover:bg-seal/8 hover:text-seal"
          onClick={() => onDelete(medicine)}
          aria-label="删除"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">删除</span>
        </button>
      </div>
    </article>
  );
}
