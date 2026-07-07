import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Boxes,
  AlertTriangle,
  CalendarX,
  Activity,
  Plus,
  Pill,
  ScrollText,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useMedicineStore } from "@/store/useMedicineStore";
import { useRecordStore } from "@/store/useRecordStore";
import {
  daysUntilExpiry,
  getStatus,
  expiryText,
  formatDateTime,
} from "@/utils/date";
import { getSampleMedicines, getSampleRecords } from "@/utils/sampleData";
import MedicineFormModal from "@/components/MedicineFormModal";
import RecordFormModal from "@/components/RecordFormModal";
import EmptyState from "@/components/EmptyState";
import StatusSeal from "@/components/StatusSeal";
import type { Medicine } from "@/types";

export default function Dashboard() {
  const medicines = useMedicineStore((s) => s.medicines);
  const loadMedSample = useMedicineStore((s) => s.loadSample);
  const records = useRecordStore((s) => s.records);
  const loadRecSample = useRecordStore((s) => s.loadSample);

  const [medModalOpen, setMedModalOpen] = useState(false);
  const [recModalOpen, setRecModalOpen] = useState(false);

  const stats = useMemo(() => {
    let expiring = 0;
    let expired = 0;
    for (const m of medicines) {
      const s = getStatus(daysUntilExpiry(m.expiryDate));
      if (s === "expired") expired++;
      else if (s === "expiring") expiring++;
    }
    const now = new Date();
    const monthRecords = records.filter((r) => {
      const d = new Date(r.timestamp);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      );
    }).length;
    return { total: medicines.length, expiring, expired, monthRecords };
  }, [medicines, records]);

  const alerts = useMemo(() => {
    return medicines
      .map((m) => ({ m, days: daysUntilExpiry(m.expiryDate) }))
      .filter(({ days }) => days <= 30)
      .sort((a, b) => a.days - b.days);
  }, [medicines]);

  const recentRecords = useMemo(() => {
    return [...records]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }, [records]);

  const handleLoadSample = () => {
    loadMedSample(getSampleMedicines());
    loadRecSample(getSampleRecords());
  };

  const isEmpty = medicines.length === 0 && records.length === 0;

  const statCards = [
    {
      label: "药品总数",
      value: stats.total,
      icon: Boxes,
      tint: "text-herbal bg-herbal/10",
    },
    {
      label: "即将过期",
      value: stats.expiring,
      icon: AlertTriangle,
      tint: "text-amber bg-amber/12",
    },
    {
      label: "已过期",
      value: stats.expired,
      icon: CalendarX,
      tint: "text-seal bg-seal/10",
    },
    {
      label: "本月用药",
      value: stats.monthRecords,
      icon: Activity,
      tint: "text-ochre-deep bg-ochre/12",
    },
  ];

  return (
    <div className="container py-8">
      {/* Hero */}
      <section className="mb-8 animate-fade-up">
        <div className="flex flex-col gap-4 rounded-specimen border border-herbal/15 bg-paper-light/80 p-6 shadow-specimen sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-brush text-2xl text-ochre">家用药箱 · 一目了然</p>
            <h1 className="mt-1 font-serif text-3xl font-bold text-herbal sm:text-4xl">
              本草药箱
            </h1>
            <p className="mt-2 max-w-md font-serif text-sm text-ink-muted">
              管理常备药品、警惕过期浪费、记录每一次用药。让家庭药箱井井有条。
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              className="btn-primary"
              onClick={() => setMedModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              录入药品
            </button>
            <button
              className="btn-secondary"
              onClick={() => setRecModalOpen(true)}
            >
              <Pill className="h-4 w-4" />
              记一笔
            </button>
          </div>
        </div>
      </section>

      {isEmpty ? (
        <EmptyState
          icon={<Sparkles className="h-7 w-7" />}
          title="药箱还是空的"
          description="录入第一味常备药，或载入示例药箱快速体验本应用的全部功能。"
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <button className="btn-primary" onClick={() => setMedModalOpen(true)}>
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
          {/* Stats */}
          <section className="mb-10">
            <h2 className="section-title mb-4 font-serif text-xl font-bold text-herbal">
              药箱概览
            </h2>
            <div className="stagger grid grid-cols-2 gap-4 lg:grid-cols-4">
              {statCards.map((c) => (
                <div
                  key={c.label}
                  className="specimen-card corner-mark flex items-center gap-4 p-5"
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${c.tint}`}
                  >
                    <c.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <div className="font-latin text-3xl font-bold leading-none text-herbal">
                      {c.value}
                    </div>
                    <div className="mt-1 font-serif text-sm text-ink-muted">
                      {c.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Alert wall */}
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="section-title flex-1 font-serif text-xl font-bold text-herbal">
                过期提醒
              </h2>
              <Link to="/inventory" className="btn-ghost text-sm">
                全部药品 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {alerts.length === 0 ? (
              <div className="rounded-specimen border border-moss/30 bg-moss/8 px-5 py-6 font-serif text-moss">
                暂无临近过期药品，药箱状态良好。
              </div>
            ) : (
              <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {alerts.slice(0, 6).map(({ m, days }) => (
                  <AlertCard key={m.id} medicine={m} days={days} />
                ))}
              </div>
            )}
          </section>

          {/* Recent records */}
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="section-title flex-1 font-serif text-xl font-bold text-herbal">
                最近用药
              </h2>
              <Link to="/records" className="btn-ghost text-sm">
                用药记录 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {recentRecords.length === 0 ? (
              <div className="rounded-specimen border border-dashed border-herbal/25 bg-paper-light/60 px-5 py-10 text-center font-serif text-ink-muted">
                尚无用药记录，记下第一笔吧。
              </div>
            ) : (
              <ol className="stagger space-y-3">
                {recentRecords.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-4 rounded-specimen border border-herbal/12 bg-paper-light/80 px-5 py-3 shadow-specimen"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ochre/12 text-ochre">
                      <ScrollText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="truncate font-serif font-bold text-herbal">
                          {r.medicineName}
                        </span>
                        <span className="font-serif text-sm text-ochre-deep">
                          {r.dosage}
                        </span>
                      </div>
                      {r.note && (
                        <p className="truncate font-serif text-xs text-ink-muted">
                          {r.note}
                        </p>
                      )}
                    </div>
                    <time className="shrink-0 font-latin text-sm text-ink-muted">
                      {formatDateTime(r.timestamp)}
                    </time>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}

      <MedicineFormModal
        open={medModalOpen}
        onClose={() => setMedModalOpen(false)}
      />
      <RecordFormModal
        open={recModalOpen}
        onClose={() => setRecModalOpen(false)}
      />
    </div>
  );
}

function AlertCard({ medicine, days }: { medicine: Medicine; days: number }) {
  const status = getStatus(days);
  return (
    <Link
      to="/inventory"
      className="specimen-card corner-mark group flex items-center gap-4 p-4"
    >
      <StatusSeal status={status} size="sm" animate={false} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-serif font-bold text-herbal">
          {medicine.name}
        </h3>
        <p
          className={`font-serif text-sm font-medium ${
            status === "expired" ? "text-seal" : "text-amber"
          }`}
        >
          {expiryText(days)}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-ink-soft transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
