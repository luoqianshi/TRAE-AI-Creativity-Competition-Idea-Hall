import { useState } from "react";
import { Search as SearchIcon, XCircle, SlidersHorizontal } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import NavBar from "@/components/NavBar";
import TabBar from "@/components/TabBar";
import SegmentControl from "@/components/SegmentControl";
import { useAppStore } from "@/store/useAppStore";
import { categories } from "@/data/seed";
import type { Transaction } from "@/lib/types";

type Seg = "friends" | "books";
type TypeFilter = "全部" | "收礼" | "随礼";
type Range = "全部" | "本月" | "本年" | "自定义";
type CatFilter = string; // "全部" 或 category key

const allCats = [
  { key: "全部", label: "全部" },
  ...categories,
];

// 年化月份标签
function ymOf(date: string) {
  return date.slice(0, 7);
}

export default function SearchPage() {
  const transactions = useAppStore((s) => s.transactions);
  const friends = useAppStore((s) => s.friends);
  const giftBooks = useAppStore((s) => s.giftBooks);

  const [seg, setSeg] = useState<Seg>("friends");
  const [keyword, setKeyword] = useState("");
  const [typeF, setTypeF] = useState<TypeFilter>("全部");
  const [range, setRange] = useState<Range>("全部");
  const [catF, setCatF] = useState<CatFilter>("全部");
  // 自定义时间范围：起始月份与终止月份（YYYY-MM）
  const [startYM, setStartYM] = useState("");
  const [endYM, setEndYM] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisYear = new Date().getFullYear().toString();

  // 关键词高亮
  const highlight = (text: string) => {
    const kw = keyword.trim();
    if (!kw) return text;
    const parts = text.split(kw);
    return parts.map((part, i) => (
      <span key={i}>
        {part}
        {i < parts.length - 1 && (
          <span style={{ color: "var(--brand)", fontWeight: 700 }}>{kw}</span>
        )}
      </span>
    ));
  };

  // 动态过滤
  const filtered: Transaction[] = transactions.filter((t) => {
    // 分段：亲友=按 personName 搜索，礼簿=按 giftBookId 归属
    if (seg === "books") {
      if (!t.giftBookId) return false;
    }
    // 关键词
    const kw = keyword.trim();
    if (kw) {
      const hay = seg === "friends" ? t.personName + t.event : t.event + t.personName;
      if (!hay.includes(kw)) return false;
    }
    // 类型
    if (typeF === "收礼" && t.type !== "income") return false;
    if (typeF === "随礼" && t.type !== "expense") return false;
    // 时间范围
    if (range === "本月" && ymOf(t.date) !== thisMonth) return false;
    if (range === "本年" && !t.date.startsWith(thisYear)) return false;
    if (range === "自定义") {
      const ym = ymOf(t.date);
      if (startYM && ym < startYM) return false;
      if (endYM && ym > endYM) return false;
    }
    // 往来事项
    if (catF !== "全部" && t.category !== catF) return false;
    return true;
  });

  // 礼簿维度：按礼簿分组统计命中交易
  const bookGroups = giftBooks
    .map((b) => {
      const items = filtered.filter((t) => t.giftBookId === b.id);
      return { book: b, items };
    })
    .filter((g) => g.items.length > 0);

  // 是否有激活的筛选（用于高亮筛选按钮）
  const hasActiveFilter =
    typeF !== "全部" || range !== "全部" || catF !== "全部";

  const resetFilter = () => {
    setTypeF("全部");
    setRange("全部");
    setCatF("全部");
    setStartYM("");
    setEndYM("");
  };

  return (
    <MobileShell withTabBar>
      <NavBar title="搜索账目" showBack backTo="/gift-book" />

      {/* 搜索框 */}
      <div className="px-4 pt-3 pb-2">
        <div
          className="flex items-center gap-2 rounded-full border border-borderbase bg-bgcard"
          style={{ padding: "8px 16px" }}
        >
          <SearchIcon className="h-4 w-4 shrink-0 text-text3" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={seg === "friends" ? "搜索往来人/事件" : "搜索礼簿/事件"}
            className="min-w-0 flex-1 bg-transparent text-body text-text1 outline-none placeholder:text-text3"
          />
          {keyword && (
            <button onClick={() => setKeyword("")} aria-label="清除">
              <XCircle className="h-4 w-4 shrink-0 text-text4 active:opacity-70" />
            </button>
          )}
        </div>
      </div>

      {/* 分段：亲友 / 礼簿 */}
      <div className="px-4 pt-1 pb-2">
        <SegmentControl<Seg>
          options={[
            { value: "friends", label: "亲友" },
            { value: "books", label: "礼簿" },
          ]}
          value={seg}
          onChange={setSeg}
        />
      </div>

      {/* 快速筛选条：类型 chips + 筛选按钮 */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
            {(["全部", "收礼", "随礼"] as TypeFilter[]).map((opt) => {
              const active = opt === typeF;
              return (
                <button
                  key={opt}
                  onClick={() => setTypeF(opt)}
                  className="inline-flex h-7 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 text-caption active:opacity-80"
                  style={{
                    background: active ? "var(--brand)" : "var(--bg-card)",
                    color: active ? "#fff" : "var(--text-2)",
                    border: active ? "none" : "1px solid var(--border)",
                    fontWeight: active ? 500 : 400,
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full px-3 text-caption active:opacity-80"
            style={{
              background: hasActiveFilter ? "var(--brand-light)" : "var(--bg-card)",
              color: hasActiveFilter ? "var(--brand)" : "var(--text-2)",
              border: "1px solid var(--border)",
              fontWeight: hasActiveFilter ? 500 : 400,
            }}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            筛选
          </button>
        </div>
      </div>

      {/* 计数 */}
      <div className="px-4 pb-2">
        <span className="text-caption text-text3">
          找到 {filtered.length} 条记录
        </span>
      </div>

      {/* 结果列表 */}
      <div className="px-4 pb-6">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-caption text-text3">
            暂无匹配记录
          </div>
        ) : seg === "friends" ? (
          // 亲友维度：平铺交易
          <div
            className="overflow-hidden rounded-md"
            style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-1)" }}
          >
            {filtered.map((t, idx) => (
              <div
                key={t.id}
                className="flex items-center px-4 py-3"
                style={{
                  borderBottom:
                    idx < filtered.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-body font-medium text-text1">
                      {highlight(t.personName)}
                    </span>
                    <span className="whitespace-nowrap text-caption text-text3">
                      · {t.event}
                    </span>
                  </div>
                  <div className="mt-0.5 whitespace-nowrap text-caption text-text3">
                    {t.date}
                  </div>
                </div>
                <div className="shrink-0 pl-3 text-right">
                  <span
                    className="tnum whitespace-nowrap text-h2 font-bold"
                    style={{
                      color: t.type === "income" ? "var(--income)" : "var(--expense)",
                    }}
                  >
                    {t.type === "income" ? "收礼" : "随礼"} ¥{t.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 礼簿维度：按礼簿分组
          <div className="space-y-4">
            {bookGroups.length === 0 ? (
              <div className="py-12 text-center text-caption text-text3">
                暂无礼簿相关记录
              </div>
            ) : (
              bookGroups.map((g) => (
                <div key={g.book.id}>
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <span className="text-caption font-semibold text-text1">
                      {g.book.title}
                    </span>
                    <span className="text-mini text-text3">
                      {g.items.length}条
                    </span>
                  </div>
                  <div
                    className="overflow-hidden rounded-md"
                    style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-1)" }}
                  >
                    {g.items.map((t, idx) => (
                      <div
                        key={t.id}
                        className="flex items-center px-4 py-3"
                        style={{
                          borderBottom:
                            idx < g.items.length - 1 ? "1px solid var(--border)" : "none",
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-body font-medium text-text1">
                              {highlight(t.personName)}
                            </span>
                            <span className="whitespace-nowrap text-caption text-text3">
                              · {t.event}
                            </span>
                          </div>
                          <div className="mt-0.5 whitespace-nowrap text-caption text-text3">
                            {t.date}
                          </div>
                        </div>
                        <div className="shrink-0 pl-3 text-right">
                          <span
                            className="tnum whitespace-nowrap text-h2 font-bold"
                            style={{
                              color: t.type === "income" ? "var(--income)" : "var(--expense)",
                            }}
                          >
                            {t.type === "income" ? "收礼" : "随礼"} ¥{t.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <TabBar />

      {/* 筛选面板 */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={() => setFilterOpen(false)}
          />
          <div
            className="relative w-full max-w-[420px] rounded-t-2xl bg-bgcard"
            style={{
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              animation: "slideUp 240ms cubic-bezier(.2,.8,.2,1)",
            }}
          >
            <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

            <div className="flex justify-center pt-2 pb-1">
              <span className="h-1 w-9 rounded-full" style={{ background: "var(--text-4)" }} />
            </div>

            <div className="flex items-center justify-between px-4 py-2">
              <button
                onClick={() => setFilterOpen(false)}
                className="text-caption text-text3 active:opacity-60"
              >
                取消
              </button>
              <span className="text-body font-semibold text-text1">筛选</span>
              <button
                onClick={resetFilter}
                className="text-caption font-medium text-brand active:opacity-60"
              >
                重置
              </button>
            </div>

            <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-6">
              {/* 时间范围 */}
              <section className="mb-5">
                <h3 className="mb-2 text-caption font-semibold text-text2">时间范围</h3>
                <div className="flex flex-wrap gap-2">
                  {(["全部", "本月", "本年", "自定义"] as Range[]).map((r) => {
                    const active = r === range;
                    return (
                      <button
                        key={r}
                        onClick={() => setRange(r)}
                        className="inline-flex h-8 items-center justify-center rounded-full px-4 text-caption active:opacity-80"
                        style={{
                          background: active ? "var(--brand)" : "var(--fill)",
                          color: active ? "#fff" : "var(--text-2)",
                          fontWeight: active ? 500 : 400,
                        }}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
                {range === "自定义" && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="month"
                        value={startYM}
                        onChange={(e) => setStartYM(e.target.value)}
                        className="min-w-0 flex-1 rounded-md border border-borderbase bg-bgcard px-3 py-2 text-body text-text1 outline-none"
                      />
                      <span className="shrink-0 text-caption text-text3">到</span>
                      <input
                        type="month"
                        value={endYM}
                        onChange={(e) => setEndYM(e.target.value)}
                        className="min-w-0 flex-1 rounded-md border border-borderbase bg-bgcard px-3 py-2 text-body text-text1 outline-none"
                      />
                    </div>
                    <p className="mt-2 text-mini text-text3">
                      {startYM || endYM
                        ? `筛选范围：${startYM || "不限"} 到 ${endYM || "不限"}`
                        : "请选择起始月份和终止月份"}
                    </p>
                  </div>
                )}
              </section>

              {/* 往来事项 */}
              <section className="mb-5">
                <h3 className="mb-2 text-caption font-semibold text-text2">往来事项</h3>
                <div className="flex flex-wrap gap-2">
                  {allCats.map((c) => {
                    const active = c.key === catF;
                    return (
                      <button
                        key={c.key}
                        onClick={() => setCatF(c.key)}
                        className="inline-flex h-8 items-center justify-center rounded-full px-4 text-caption active:opacity-80"
                        style={{
                          background: active ? "var(--brand)" : "var(--fill)",
                          color: active ? "#fff" : "var(--text-2)",
                          fontWeight: active ? 500 : 400,
                        }}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* 底部确定按钮 */}
            <div
              className="border-t border-borderbase px-4 pt-3"
              style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
            >
              <button
                onClick={() => setFilterOpen(false)}
                className="flex h-11 w-full items-center justify-center rounded-full bg-brand text-[15px] font-semibold text-white active:scale-[0.98]"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
