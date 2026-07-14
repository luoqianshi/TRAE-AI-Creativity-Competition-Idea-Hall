import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import NavBar from "@/components/NavBar";
import TabBar from "@/components/TabBar";
import Fab from "@/components/Fab";
import FilterChips from "@/components/FilterChips";
import { useAppStore } from "@/store/useAppStore";

type Filter = "全部" | "收礼" | "随礼";

// 格式化 YYYY-MM
function formatMonth(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// 月份展示文案，如「2026年7月」
function monthLabel(ym: string) {
  const [y, m] = ym.split("-");
  return `${y}年${Number(m)}月`;
}

export default function Home() {
  const navigate = useNavigate();
  const transactions = useAppStore((s) => s.transactions);
  const [filter, setFilter] = useState<Filter>("全部");

  // 当前查看的月份，默认本月
  const thisMonth = formatMonth(new Date());
  const [viewMonth, setViewMonth] = useState(thisMonth);

  // 该月是否有数据（用于翻页置灰判断）
  const monthHasData = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      const ym = t.date.slice(0, 7); // YYYY-MM
      set.add(ym);
    });
    return set;
  }, [transactions]);

  // 找出比当前月份更早/更晚的有数据的最近月份
  const prevMonth = useMemo(() => {
    const sortedDesc = Array.from(monthHasData)
      .filter((m) => m < viewMonth)
      .sort()
      .reverse();
    return sortedDesc[0];
  }, [monthHasData, viewMonth]);

  const nextMonth = useMemo(() => {
    const sortedAsc = Array.from(monthHasData)
      .filter((m) => m > viewMonth)
      .sort();
    if (sortedAsc[0]) return sortedAsc[0];
    // 后续无记录：若当前查看月早于本月，则可翻到本月
    if (viewMonth < thisMonth) return thisMonth;
    return undefined;
  }, [monthHasData, viewMonth, thisMonth]);

  // 当前月交易
  const monthTx = useMemo(
    () => transactions.filter((t) => t.date.slice(0, 7) === viewMonth),
    [transactions, viewMonth]
  );

  const incomeTotal = monthTx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expenseTotal = monthTx
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const incomeCount = monthTx.filter((t) => t.type === "income").length;
  const expenseCount = monthTx.filter((t) => t.type === "expense").length;

  const filtered = monthTx.filter((t) => {
    if (filter === "收礼") return t.type === "income";
    if (filter === "随礼") return t.type === "expense";
    return true;
  });

  return (
    <MobileShell withTabBar>
      <NavBar title="记账" />

      <main className="px-4 pt-4" style={{ paddingBottom: "120px" }}>
        {/* 月份标题 */}
        <div className="mb-3 text-center text-caption font-medium text-text3">
          {monthLabel(viewMonth)}
        </div>

        {/* 双统计卡 + 左右翻页箭头 */}
        <div className="mb-5 flex items-center gap-2">
          {/* 左翻：查看上个月 */}
          <button
            onClick={() => prevMonth && setViewMonth(prevMonth)}
            disabled={!prevMonth}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full active:bg-fill disabled:opacity-30"
            style={{
              color: prevMonth ? "var(--text-2)" : "var(--text-4)",
            }}
            aria-label="上一月"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* 双卡 */}
          <div className="grid flex-1 grid-cols-2 gap-3">
            <div className="flex flex-col items-center rounded-md border border-borderbase bg-bgcard px-3 py-3">
              <div className="mb-0.5 flex items-baseline gap-1.5">
                <span className="text-body font-bold text-text1">收礼</span>
                <span className="text-mini text-text3">本月 {incomeCount} 笔</span>
              </div>
              <div
                className="tnum text-[26px] font-extrabold leading-tight"
                style={{ color: "var(--income)" }}
              >
                +{incomeTotal.toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col items-center rounded-md border border-borderbase bg-bgcard px-3 py-3">
              <div className="mb-0.5 flex items-baseline gap-1.5">
                <span className="text-body font-bold text-text1">随礼</span>
                <span className="text-mini text-text3">本月 {expenseCount} 笔</span>
              </div>
              <div
                className="tnum text-[26px] font-extrabold leading-tight"
                style={{ color: "var(--expense)" }}
              >
                -{expenseTotal.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 右翻：查看下个月 */}
          <button
            onClick={() => nextMonth && setViewMonth(nextMonth)}
            disabled={!nextMonth}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full active:bg-fill disabled:opacity-30"
            style={{
              color: nextMonth ? "var(--text-2)" : "var(--text-4)",
            }}
            aria-label="下一月"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* 筛选 chips */}
        <div className="mb-4">
          <FilterChips<Filter>
            options={["全部", "收礼", "随礼"] as const}
            value={filter}
            onChange={setFilter}
          />
        </div>

        {/* 交易列表 */}
        <div>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-caption text-text3">
              本月暂无往来记录
            </div>
          ) : (
            filtered.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => navigate(`/friend/${t.personId}`)}
                className="flex w-full items-center gap-3 py-3.5 text-left active:opacity-70"
                style={{
                  borderBottom:
                    idx < filtered.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                  transition: "opacity 120ms cubic-bezier(.2,.8,.2,1)",
                }}
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[18px]"
                  style={{ background: "var(--fill)" }}
                >
                  {t.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-body font-medium text-text1">
                    {t.personName} {t.event}
                  </div>
                  <div className="mt-0.5 text-mini text-text3">{t.date}</div>
                </div>
                <span
                  className="tnum whitespace-nowrap text-h2 font-bold"
                  style={{
                    color:
                      t.type === "income" ? "var(--income)" : "var(--expense)",
                  }}
                >
                  {t.type === "income" ? "+" : "-"}
                  {t.amount.toLocaleString()}
                </span>
              </button>
            ))
          )}
        </div>
      </main>

      <Fab />
      <TabBar />
    </MobileShell>
  );
}
