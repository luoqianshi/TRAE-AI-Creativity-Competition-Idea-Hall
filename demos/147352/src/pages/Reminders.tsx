import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import NavBar from "@/components/NavBar";
import TabBar from "@/components/TabBar";
import { useAppStore } from "@/store/useAppStore";
import type { Reminder } from "@/lib/types";

const typeMeta: Record<
  Reminder["type"],
  { label: string; bg: string; color: string }
> = {
  gift: { label: "待回礼", bg: "var(--brand-light)", color: "var(--brand)" },
  repay: { label: "还款", bg: "var(--gold-light)", color: "var(--gold)" },
  reciprocal: { label: "往来", bg: "var(--fill)", color: "var(--text-3)" },
};

// 根据 reminder.date 动态计算距今天数（负数表示已过期）
function calcDaysLeft(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  return diff;
}

export default function Reminders() {
  const navigate = useNavigate();
  const reminders = useAppStore((s) => s.reminders);
  const markDone = useAppStore((s) => s.markReminderDone);

  const pending = reminders.filter((r) => r.status === "pending");
  const done = reminders.filter((r) => r.status === "done");

  return (
    <MobileShell withTabBar>
      <NavBar title="提醒" showBack backTo="/profile" />

      <div className="px-4 pt-5 pb-8">
        {/* 即将到来 */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-h2 font-bold" style={{ color: "var(--gold)" }}>
                即将到来
              </h2>
              <span
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-mini font-bold text-white"
                style={{ background: "var(--gold)" }}
              >
                {pending.length}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {pending.map((r) => {
              const meta = typeMeta[r.type];
              const days = calcDaysLeft(r.date);
              const dayLabel =
                days > 0
                  ? `${days}天后`
                  : days === 0
                  ? "今天"
                  : `已过期${-days}天`;
              return (
                <button
                  key={r.id}
                  onClick={() => {
                    markDone(r.id);
                    navigate("/add");
                  }}
                  className="flex items-center gap-3 rounded-md border border-borderbase bg-bgcard p-3 text-left active:opacity-70"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-h2 font-bold"
                    style={{
                      background: meta.bg,
                      color: meta.color,
                    }}
                  >
                    {r.friendName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-body font-semibold text-text1">
                        {r.title}
                      </span>
                      <ChevronRight className="ml-1 h-4 w-4 shrink-0 text-text4" />
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className="text-caption"
                        style={{
                          color: days < 0 ? "var(--expense)" : "var(--text-3)",
                        }}
                      >
                        {dayLabel} · {r.desc}
                      </span>
                      <span
                        className="inline-flex h-5 items-center whitespace-nowrap rounded-sm px-2 text-mini font-bold"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 分隔线 */}
        <div className="mb-5 h-px" style={{ background: "var(--border)" }} />

        {/* 已处理 */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-h2 font-bold text-text3">已处理</h2>
          </div>
          <div className="flex flex-col gap-3">
            {done.map((r) => {
              const meta = typeMeta[r.type];
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-md border border-borderbase bg-bgcard p-3 opacity-60"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-h2 font-bold"
                    style={{
                      background: "var(--state-success-light)",
                      color: "var(--state-success)",
                    }}
                  >
                    {r.friendName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-body font-semibold text-text2">
                        {r.title}
                      </span>
                      <ChevronRight className="ml-1 h-4 w-4 shrink-0 text-text4" />
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-caption text-text4">{r.desc}</span>
                      <span
                        className="inline-flex h-5 items-center whitespace-nowrap rounded-sm px-2 text-mini font-bold"
                        style={{
                          background: "var(--state-success-light)",
                          color: "var(--state-success)",
                        }}
                      >
                        已完成
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <TabBar />
    </MobileShell>
  );
}
