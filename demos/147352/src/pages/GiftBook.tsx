import { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import {
  ChevronRight,
  Plus,
  Search,
  XCircle,
  SlidersHorizontal,
  Share2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import MobileShell from "@/components/MobileShell";
import NavBar from "@/components/NavBar";
import TabBar from "@/components/TabBar";
import SegmentControl from "@/components/SegmentControl";
import Avatar from "@/components/Avatar";
import GiftBookEditModal from "@/components/GiftBookEditModal";
import { useAppStore } from "@/store/useAppStore";
import { categories } from "@/data/seed";

type Seg = "friends" | "books" | "stats";
type TypeFilter = "全部" | "收礼" | "随礼";
type Range = "全部" | "本月" | "本年" | "自定义";
type CatFilter = string;
type AmountFilter = "全部" | "500以内" | "500-2000" | "2000-5000" | "5000以上";
type BookAmountFilter = "全部" | "10000以内" | "10000-20000" | "20000-50000" | "50000以上";
type Period = "月" | "年" | "全部";

const allCats = [
  { key: "全部", label: "全部" },
  ...categories,
];

function ymOf(date: string) {
  return date.slice(0, 7);
}

// 分类占比配色：首项品牌红，后续逐级灰阶
const catColors = [
  "var(--brand)",
  "var(--text-2)",
  "var(--text-3)",
  "var(--text-3)",
  "var(--text-4)",
  "var(--text-4)",
  "var(--text-4)",
  "var(--text-4)",
];

export default function GiftBook() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const friends = useAppStore((s) => s.friends);
  const giftBooks = useAppStore((s) => s.giftBooks);
  const transactions = useAppStore((s) => s.transactions);

  const [seg, setSeg] = useState<Seg>(
    () =>
      (searchParams.get("seg") === "books"
        ? "books"
        : searchParams.get("seg") === "stats"
        ? "stats"
        : "friends") as Seg
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [period, setPeriod] = useState<Period>("年");

  // 搜索与筛选状态
  const [keyword, setKeyword] = useState("");
  const [typeF, setTypeF] = useState<TypeFilter>("全部");
  const [range, setRange] = useState<Range>("全部");
  const [catF, setCatF] = useState<CatFilter>("全部");
  const [amountF, setAmountF] = useState<AmountFilter>("全部");
  const [bookAmountF, setBookAmountF] = useState<BookAmountFilter>("全部");
  const [startYM, setStartYM] = useState("");
  const [endYM, setEndYM] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisYear = new Date().getFullYear().toString();

  const hasActiveFilter =
    seg === "friends"
      ? typeF !== "全部" || range !== "全部" || catF !== "全部" || amountF !== "全部"
      : typeF !== "全部" || range !== "全部" || catF !== "全部" || bookAmountF !== "全部";

  const resetFilter = () => {
    setTypeF("全部");
    setRange("全部");
    setCatF("全部");
    setAmountF("全部");
    setBookAmountF("全部");
    setStartYM("");
    setEndYM("");
  };

  // 金额区间判断（亲友：单笔金额）
  const matchAmount = (amt: number) => {
    switch (amountF) {
      case "500以内":
        return amt < 500;
      case "500-2000":
        return amt >= 500 && amt < 2000;
      case "2000-5000":
        return amt >= 2000 && amt < 5000;
      case "5000以上":
        return amt >= 5000;
      default:
        return true;
    }
  };

  // 金额区间判断（礼簿：总金额）
  const matchBookAmount = (amt: number) => {
    switch (bookAmountF) {
      case "10000以内":
        return amt < 10000;
      case "10000-20000":
        return amt >= 10000 && amt < 20000;
      case "20000-50000":
        return amt >= 20000 && amt < 50000;
      case "50000以上":
        return amt >= 50000;
      default:
        return true;
    }
  };

  // 按关键词与筛选条件过滤交易
  const filteredTx = useMemo(() => {
    const kw = keyword.trim();
    return transactions.filter((t) => {
      // 分段：礼簿段只看有 giftBookId 的交易
      if (seg === "books" && !t.giftBookId) return false;
      // 关键词
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
      // 金额区间（仅亲友段生效）
      if (seg === "friends" && amountF !== "全部" && !matchAmount(t.amount)) return false;
      return true;
    });
  }, [transactions, seg, keyword, typeF, range, catF, amountF, startYM, endYM, thisMonth, thisYear]);

  // 命中的亲友 id 集合
  const hitFriendIds = useMemo(() => {
    const set = new Set<string>();
    filteredTx.forEach((t) => set.add(t.personId));
    return set;
  }, [filteredTx]);

  // 命中的礼簿 id 集合
  const hitBookIds = useMemo(() => {
    const set = new Set<string>();
    filteredTx.forEach((t) => t.giftBookId && set.add(t.giftBookId));
    return set;
  }, [filteredTx]);

  // 友亲列表：有关键词或筛选时只显示命中的
  const shownFriends = useMemo(() => {
    const kw = keyword.trim();
    if (!kw && !hasActiveFilter) return friends;
    return friends.filter((f) => hitFriendIds.has(f.id));
  }, [friends, keyword, hasActiveFilter, hitFriendIds]);

  // 礼簿列表：有关键词或筛选时只显示命中的
  const shownBooks = useMemo(() => {
    const kw = keyword.trim();
    if (!kw && !hasActiveFilter) return giftBooks;
    return giftBooks.filter(
      (b) => hitBookIds.has(b.id) && matchBookAmount(b.totalReceived)
    );
  }, [giftBooks, keyword, hasActiveFilter, hitBookIds, bookAmountF]);

  // ===== 统计段：基于真实 transactions 计算 =====
  // 按周期界定统计范围：月=本年（按月聚合）/ 年、全部=所有年份（按年聚合）
  const scopedTx = useMemo(() => {
    if (period === "月") return transactions.filter((t) => t.date.startsWith(thisYear));
    return transactions;
  }, [transactions, period, thisYear]);

  // 收支趋势：按月或按年聚合
  const trendData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number }>();
    scopedTx.forEach((t) => {
      const key =
        period === "月" ? `${Number(t.date.slice(5, 7))}月` : `${t.date.slice(0, 4)}年`;
      if (!map.has(key)) map.set(key, { income: 0, expense: 0 });
      const item = map.get(key)!;
      if (t.type === "income") item.income += t.amount;
      else item.expense += t.amount;
    });
    return Array.from(map.entries())
      .sort((a, b) => {
        if (period === "月") return parseInt(a[0]) - parseInt(b[0]);
        return parseInt(a[0]) - parseInt(b[0]);
      })
      .map(([label, v]) => ({ month: label, income: v.income, expense: v.expense }));
  }, [scopedTx, period]);

  // 趋势柱状图最大值（用于换算高度百分比）
  const trendMax = useMemo(() => {
    const all = trendData.flatMap((d) => [d.income, d.expense]);
    return Math.max(...all, 1);
  }, [trendData]);

  // 分类占比：按 category 聚合金额
  const catStats = useMemo(() => {
    const map = new Map<string, number>();
    scopedTx.forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
    return Array.from(map.entries())
      .map(([key, amount], idx) => {
        const cat = categories.find((c) => c.key === key);
        return {
          name: cat?.label || "其他",
          amount,
          percent: total > 0 ? Math.round((amount / total) * 100) : 0,
          color: catColors[idx % catColors.length],
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [scopedTx]);

  // 社交成本：今年净支出 = 今年随礼 - 今年收礼；较上年对比
  const socialCost = useMemo(() => {
    const lastYearStr = (Number(thisYear) - 1).toString();
    const calc = (yearStr: string) => {
      const inc = transactions
        .filter((t) => t.type === "income" && t.date.startsWith(yearStr))
        .reduce((s, t) => s + t.amount, 0);
      const exp = transactions
        .filter((t) => t.type === "expense" && t.date.startsWith(yearStr))
        .reduce((s, t) => s + t.amount, 0);
      return exp - inc;
    };
    const thisNet = calc(thisYear);
    const lastNet = calc(lastYearStr);
    const yoy =
      lastNet > 0
        ? Math.round(((thisNet - lastNet) / lastNet) * 100)
        : null;
    return { thisNet, lastNet, yoy };
  }, [transactions, thisYear]);

  // 分享图：截取收支趋势+分类占比+社交成本三个卡片
  const shareRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!shareRef.current || sharing) return;
    setSharing(true);
    try {
      const canvas = await html2canvas(shareRef.current, {
        backgroundColor: "#f5f5f5",
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const fileName = `人情统计_${new Date().toISOString().slice(0, 10)}.png`;

      // 优先尝试原生分享（移动端微信/浏览器）
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };
      if (nav.share && nav.canShare) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], fileName, { type: "image/png" });
          if (nav.canShare({ files: [file] })) {
            await nav.share({ files: [file], title: "人情统计" });
            return;
          }
        } catch {
          // 分享失败或被取消，回退下载
        }
      }
      // 回退：触发下载
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = fileName;
      a.click();
    } catch (e) {
      console.error(e);
      alert("生成分享图失败，请重试");
    } finally {
      setSharing(false);
    }
  };

  return (
    <MobileShell withTabBar>
      <NavBar title="看账" />

      <div className="px-4 pt-3 pb-2">
        <SegmentControl<Seg>
          options={[
            { value: "friends", label: "亲友" },
            { value: "books", label: "礼簿" },
            { value: "stats", label: "统计" },
          ]}
          value={seg}
          onChange={setSeg}
        />
      </div>

      {/* 搜索框 + 筛选按钮（仅亲友/礼簿段） */}
      {seg !== "stats" && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2">
            <div
              className="flex flex-1 items-center gap-2 rounded-full border border-borderbase bg-bgcard px-3"
              style={{ height: 36 }}
            >
              <Search className="h-4 w-4 shrink-0 text-text3" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={seg === "friends" ? "搜索往来人/事件" : "搜索礼簿/事件"}
                className="min-w-0 flex-1 bg-transparent text-caption text-text1 outline-none placeholder:text-text3"
              />
              {keyword && (
                <button onClick={() => setKeyword("")} aria-label="清除">
                  <XCircle className="h-4 w-4 shrink-0 text-text4 active:opacity-70" />
                </button>
              )}
            </div>
            <button
              onClick={() => setFilterOpen(true)}
              className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-caption active:opacity-80"
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
      )}

      {/* 计数 */}
      {seg !== "stats" && (keyword.trim() || hasActiveFilter) && (
        <div className="px-4 pb-2">
          <span className="text-caption text-text3">
            找到 {seg === "friends" ? shownFriends.length : shownBooks.length} 条
          </span>
        </div>
      )}

      {seg === "friends" ? (
        <div className="px-4 pt-2">
          {shownFriends.length === 0 ? (
            <div className="py-12 text-center text-caption text-text3">
              暂无匹配记录
            </div>
          ) : (
            shownFriends.map((f, idx) => {
              const isIncome = f.netAmount >= 0;
              return (
                <button
                  key={f.id}
                  onClick={() => navigate(`/friend/${f.id}`)}
                  className="flex w-full items-center py-3 text-left active:opacity-70"
                  style={{
                    borderBottom:
                      idx < shownFriends.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={f.name} color={f.avatarColor} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-body font-medium text-text1">
                        {f.name}
                      </div>
                      <div className="mt-0.5 truncate text-caption text-text3">
                        收{f.incomeCount} · 支{f.expenseCount}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 pl-3">
                    <span
                      className="tnum whitespace-nowrap text-body font-bold"
                      style={{
                        color: isIncome ? "var(--income)" : "var(--expense)",
                      }}
                    >
                      {isIncome ? "+" : "-"}¥{Math.abs(f.netAmount).toLocaleString()}
                    </span>
                    <ChevronRight className="h-4 w-4 text-text4" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      ) : seg === "books" ? (
        <div className="px-4 pt-2 space-y-3">
          {shownBooks.length === 0 ? (
            <div className="py-12 text-center text-caption text-text3">
              暂无匹配礼簿
            </div>
          ) : (
            shownBooks.map((b) => (
              <button
                key={b.id}
                onClick={() => navigate(`/gift-book/batch/${b.id}`)}
                className="flex w-full items-center justify-between rounded-md border border-borderbase bg-bgcard p-4 text-left active:opacity-80"
                style={{ boxShadow: "var(--shadow-1)" }}
              >
                <div className="min-w-0">
                  <div className="text-body font-semibold text-text1">{b.title}</div>
                  <div className="mt-1 text-caption text-text3">
                    {b.date} · {b.guestCount}人
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="tnum text-h2 font-bold text-brand">
                    ¥{b.totalReceived.toLocaleString()}
                  </span>
                  <ChevronRight className="h-4 w-4 text-text4" />
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4 px-4 pt-4 pb-6">
          {/* 周期分段 */}
          <div className="flex items-center justify-center">
            <div
              className="inline-flex overflow-hidden rounded-sm"
              style={{ background: "var(--fill)", border: "1px solid var(--border)" }}
            >
              {(["月", "年", "全部"] as Period[]).map((p) => {
                const active = p === period;
                return (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className="inline-flex items-center justify-center whitespace-nowrap px-5 py-2 text-caption font-medium active:opacity-80"
                    style={{
                      background: active ? "var(--brand)" : "transparent",
                      color: active ? "#fff" : "var(--text-2)",
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 分享图截图范围：收支趋势 + 分类占比 + 社交成本 */}
          <div ref={shareRef} className="space-y-4">
          {/* 收支趋势 */}
          <section
            className="rounded-md p-4"
            style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-1)" }}
          >
            <h2 className="text-body font-semibold text-text1 mb-4">收支趋势</h2>
            {trendData.length === 0 ? (
              <div className="py-8 text-center text-caption text-text3">
                暂无收支数据
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--brand)" }} />
                    <span className="text-[12px] text-text3">收礼</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--expense)" }} />
                    <span className="text-[12px] text-text3">随礼</span>
                  </div>
                </div>
                <div className="flex items-end gap-1" style={{ height: 140 }}>
                  {trendData.map((d) => (
                    <div key={d.month} className="flex h-full flex-1 items-end justify-center gap-0.5">
                      <div
                        className="w-3 rounded-t-sm"
                        style={{
                          background: "var(--brand)",
                          height: `${(d.income / trendMax) * 100}%`,
                          minHeight: d.income > 0 ? 4 : 0,
                        }}
                        title={`收礼 ¥${d.income.toLocaleString()}`}
                      />
                      <div
                        className="w-3 rounded-t-sm"
                        style={{
                          background: "var(--expense)",
                          height: `${(d.expense / trendMax) * 100}%`,
                          minHeight: d.expense > 0 ? 4 : 0,
                        }}
                        title={`随礼 ¥${d.expense.toLocaleString()}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex">
                  {trendData.map((d) => (
                    <span
                      key={d.month}
                      className="flex-1 text-center text-mini text-text3"
                    >
                      {d.month}
                    </span>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* 分类占比 */}
          <section
            className="rounded-md p-4"
            style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-1)" }}
          >
            <h2 className="text-body font-semibold text-text1 mb-4">分类占比</h2>
            {catStats.length === 0 ? (
              <div className="py-8 text-center text-caption text-text3">
                暂无分类数据
              </div>
            ) : (
              <div className="space-y-3">
                {catStats.map((c) => (
                  <div key={c.name}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-caption font-medium text-text1">{c.name}</span>
                      <span className="tnum text-caption font-medium text-text2">
                        ¥{c.amount.toLocaleString()}
                      </span>
                    </div>
                    <div
                      className="h-2 w-full overflow-hidden rounded-full"
                      style={{ background: "var(--fill)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${c.percent}%`, background: c.color }}
                      />
                    </div>
                    <div className="mt-1 text-right">
                      <span className="text-mini text-text3">{c.percent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 社交成本 */}
          <section
            className="rounded-md p-4"
            style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-1)" }}
          >
            <h2 className="text-body font-semibold text-text1 mb-3">社交成本报告</h2>
            <p className="text-caption text-text2 mb-2">
              {socialCost.thisNet >= 0 ? "今年人情净支出" : "今年人情净收入"}
            </p>
            <p
              className="tnum text-[28px] font-extrabold mb-2"
              style={{
                color:
                  socialCost.thisNet >= 0 ? "var(--expense)" : "var(--income)",
              }}
            >
              {socialCost.thisNet >= 0 ? "" : "-"}¥
              {Math.abs(socialCost.thisNet).toLocaleString()}
            </p>
            {socialCost.yoy !== null ? (
              <div className="flex items-center gap-1.5">
                <span className="text-caption text-text2">较上年</span>
                <span
                  className="inline-flex items-center gap-0.5 text-caption font-medium"
                  style={{
                    color:
                      socialCost.yoy < 0 ? "var(--success)" : "var(--expense)",
                  }}
                >
                  {socialCost.yoy < 0 ? (
                    <TrendingDown className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingUp className="h-3.5 w-3.5" />
                  )}
                  {socialCost.yoy < 0
                    ? `下降${Math.abs(socialCost.yoy)}%`
                    : `上升${socialCost.yoy}%`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-caption text-text3">暂无上年数据对比</span>
              </div>
            )}
          </section>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center pt-1">
            <button
              onClick={handleShare}
              disabled={sharing}
              className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full bg-brand px-12 text-sm font-semibold text-white active:scale-[0.98] disabled:opacity-60">
              <Share2 className="mr-1.5 h-4 w-4" />
              {sharing ? "生成中..." : "生成分享图"}
            </button>
          </div>
        </div>
      )}

      {/* FAB：亲友段记一笔 / 礼簿段创建礼簿（弹窗），统计段不显示 */}
      {seg !== "stats" && (
        <button
          onClick={() => (seg === "books" ? setCreateOpen(true) : navigate("/add"))}
        className="fixed z-20 flex h-12 w-12 items-center justify-center rounded-full bg-brand active:scale-95"
        style={{
          right: "max(20px, calc(50% - 420px/2 + 20px))",
          bottom: "calc(84px + env(safe-area-inset-bottom, 0px))",
          boxShadow: "0 4px 16px rgba(229,77,66,0.35)",
        }}
        aria-label={seg === "books" ? "创建礼簿" : "记一笔"}
      >
          <Plus className="h-6 w-6 text-white" />
        </button>
      )}
      <TabBar />

      {/* 创建礼簿弹窗 */}
      <GiftBookEditModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(book) => navigate(`/gift-book/batch/${book.id}`)}
      />

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
              {/* 类型（仅亲友段，礼簿仅为收礼使用） */}
              {seg === "friends" && (
                <section className="mb-5">
                  <h3 className="mb-2 text-caption font-semibold text-text2">类型</h3>
                  <div className="flex flex-wrap gap-2">
                    {(["全部", "收礼", "随礼"] as TypeFilter[]).map((opt) => {
                      const active = opt === typeF;
                      return (
                        <button
                          key={opt}
                          onClick={() => setTypeF(opt)}
                          className="inline-flex h-8 items-center justify-center rounded-full px-4 text-caption active:opacity-80"
                          style={{
                            background: active ? "var(--brand)" : "var(--fill)",
                            color: active ? "#fff" : "var(--text-2)",
                            fontWeight: active ? 500 : 400,
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

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

              {/* 金额区间（亲友：单笔金额 / 礼簿：总金额） */}
              {seg === "friends" && (
                <section className="mb-5">
                  <h3 className="mb-2 text-caption font-semibold text-text2">金额</h3>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        "全部",
                        "500以内",
                        "500-2000",
                        "2000-5000",
                        "5000以上",
                      ] as AmountFilter[]
                    ).map((opt) => {
                      const active = opt === amountF;
                      return (
                        <button
                          key={opt}
                          onClick={() => setAmountF(opt)}
                          className="inline-flex h-8 items-center justify-center rounded-full px-4 text-caption active:opacity-80"
                          style={{
                            background: active ? "var(--brand)" : "var(--fill)",
                            color: active ? "#fff" : "var(--text-2)",
                            fontWeight: active ? 500 : 400,
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
              {seg === "books" && (
                <section className="mb-5">
                  <h3 className="mb-2 text-caption font-semibold text-text2">总金额</h3>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        "全部",
                        "10000以内",
                        "10000-20000",
                        "20000-50000",
                        "50000以上",
                      ] as BookAmountFilter[]
                    ).map((opt) => {
                      const active = opt === bookAmountF;
                      return (
                        <button
                          key={opt}
                          onClick={() => setBookAmountF(opt)}
                          className="inline-flex h-8 items-center justify-center rounded-full px-4 text-caption active:opacity-80"
                          style={{
                            background: active ? "var(--brand)" : "var(--fill)",
                            color: active ? "#fff" : "var(--text-2)",
                            fontWeight: active ? 500 : 400,
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
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
