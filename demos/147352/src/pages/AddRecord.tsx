import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import NavBar from "@/components/NavBar";
import TabBar from "@/components/TabBar";
import PersonPicker from "@/components/PersonPicker";
import GiftBookPicker from "@/components/GiftBookPicker";
import { categories } from "@/data/seed";
import { useAppStore } from "@/store/useAppStore";
import { toChineseAmount } from "@/lib/utils";
import type { Friend, GiftBook } from "@/lib/types";

type Tab = "income" | "expense";

export default function AddRecord() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addTransaction = useAppStore((s) => s.addTransaction);
  const addFriend = useAppStore((s) => s.addFriend);
  const friends = useAppStore((s) => s.friends);
  const giftBooks = useAppStore((s) => s.giftBooks);

  // 从礼簿详情页 + 号进入时，URL 携带 bookId
  const presetBookId = searchParams.get("bookId");
  const presetBook = presetBookId
    ? giftBooks.find((b) => b.id === presetBookId)
    : null;
  // 从礼簿进入时，事由锁定为礼簿的事由，不可修改
  const catLocked = Boolean(presetBook && presetBook.reason);

  const [tab, setTab] = useState<Tab>("income");
  const [amount, setAmount] = useState("");

  // 所属礼簿：优先用 URL 携带的 bookId，其次回填上次的礼簿
  const [selectedBook, setSelectedBook] = useState<GiftBook | null>(() => {
    const id = presetBookId ?? localStorage.getItem("lastBookId");
    if (!id) return null;
    return giftBooks.find((b) => b.id === id) ?? null;
  });

  // 事由：从礼簿进入时取礼簿的 reason（反查 category key）；否则回填上次事由
  const [selectedCat, setSelectedCat] = useState(() => {
    if (presetBook?.reason) {
      const cat = categories.find((c) => c.label === presetBook.reason);
      if (cat) return cat.key;
    }
    return localStorage.getItem("lastCat") || "birthday";
  });

  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [bookPickerOpen, setBookPickerOpen] = useState(false);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const numAmount = parseFloat(amount) || 0;
  const hasAmount = numAmount > 0;
  // 大写金额：输入有效金额时实时计算
  const chineseAmount = hasAmount ? toChineseAmount(numAmount) : "";

  const handleSave = () => {
    if (!hasAmount || !selectedFriend) return;
    const cat = categories.find((c) => c.key === selectedCat);
    // 持久化上次的事由与所属礼簿，供下次打开默认回填
    localStorage.setItem("lastCat", selectedCat);
    if (selectedBook) {
      localStorage.setItem("lastBookId", selectedBook.id);
    } else {
      localStorage.removeItem("lastBookId");
    }
    addTransaction({
      id: `t${Date.now()}`,
      type: tab,
      amount: numAmount,
      category: selectedCat,
      personName: selectedFriend.name,
      personId: selectedFriend.id,
      event: cat?.label || "其他",
      date,
      giftBookId: selectedBook?.id,
      note: note.trim() || undefined,
      emoji: cat?.emoji || "🎉",
    });
    navigate("/");
  };

  const handleSelectFriend = (f: Friend) => {
    setSelectedFriend(f);
    setPickerOpen(false);
  };

  const handleCreateFriend = (name: string) => addFriend(name);

  const handleSelectBook = (b: GiftBook) => {
    setSelectedBook(b);
    setBookPickerOpen(false);
    // 选择礼簿后，事由同步变更为该礼簿创建时输入的事由
    if (b.reason) {
      const cat = categories.find((c) => c.label === b.reason);
      if (cat) setSelectedCat(cat.key);
    }
  };

  // 切换收礼/随礼：切到随礼时清空礼簿选择（随礼不关联礼簿）
  const handleTabChange = (next: Tab) => {
    setTab(next);
    if (next === "expense") setSelectedBook(null);
  };

  // 表单行配置（不含备注与日期，备注为行内输入，日期用原生 date input）
  // 所属礼簿：仅收礼时显示（选填），随礼时不显示
  const rows = [
    {
      label: "往来人",
      value: selectedFriend?.name ?? "请选择",
      placeholder: !selectedFriend,
      onClick: () => setPickerOpen(true),
    },
    ...(tab === "income"
      ? [
          {
            label: "所属礼簿",
            value: selectedBook?.title ?? "选填",
            placeholder: !selectedBook,
            onClick: () => setBookPickerOpen(true),
          },
        ]
      : []),
  ];

  return (
    <MobileShell withTabBar>
      <NavBar title="记一笔" showBack backTo="/" />

      <div className="px-4 pt-4 pb-6">
        {/* 分段：收礼 / 随礼 */}
        <div className="flex overflow-hidden rounded-sm" style={{ background: "var(--fill)" }}>
          <button
            onClick={() => handleTabChange("income")}
            className="flex-1 whitespace-nowrap py-2 text-sm font-semibold active:opacity-80"
            style={{
              background: tab === "income" ? "var(--brand)" : "transparent",
              color: tab === "income" ? "#fff" : "var(--text-2)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            收礼
          </button>
          <button
            onClick={() => handleTabChange("expense")}
            className="flex-1 whitespace-nowrap py-2 text-sm font-medium active:opacity-80"
            style={{
              background: tab === "expense" ? "var(--brand)" : "transparent",
              color: tab === "expense" ? "#fff" : "var(--text-2)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            随礼
          </button>
        </div>

        {/* 金额卡：默认不显示金额，显示占位；输入后下方实时显示大写金额 */}
        <div
          className="mt-4 px-5 py-3"
          style={{
            background: "var(--bg-card)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-1)",
          }}
        >
          <div className="flex items-baseline justify-center">
            <span
              className="text-base font-medium"
              style={{ color: hasAmount ? "var(--text-3)" : "var(--text-4)" }}
            >
              ¥
            </span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className="ml-1 w-full bg-transparent text-center text-[28px] font-extrabold outline-none placeholder:text-text4"
              style={{
                color: hasAmount
                  ? tab === "income"
                    ? "var(--income)"
                    : "var(--expense)"
                  : "var(--text-4)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            />
          </div>
          {/* 大写金额：小字灰色，实时随输入更新 */}
          <div
            className="mt-2 text-center text-mini"
            style={{
              color: "var(--text-3)",
              minHeight: "16px",
              letterSpacing: "0.02em",
            }}
          >
            {chineseAmount || "\u00A0"}
          </div>
        </div>

        {/* 分类宫格：8 大类，每类含图标、类别名、常见事由小字。
            从礼簿进入时事由锁定，仅高亮不可切换 */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          {categories.map((cat) => {
            const active = cat.key === selectedCat;
            return (
              <button
                key={cat.key}
                onClick={() => !catLocked && setSelectedCat(cat.key)}
                disabled={catLocked}
                className="flex flex-col items-center justify-center gap-1 py-3 active:scale-95 disabled:active:scale-100"
                style={{
                  background: active ? "var(--brand-light)" : "var(--bg-card)",
                  borderRadius: "var(--radius-sm)",
                  boxShadow: active ? "none" : "var(--shadow-1)",
                  transition: "all 160ms cubic-bezier(.2,.8,.2,1)",
                  opacity: catLocked && !active ? 0.4 : 1,
                  cursor: catLocked ? "default" : "pointer",
                }}
              >
                <span className="text-2xl leading-none">{cat.emoji}</span>
                <span
                  className="whitespace-nowrap text-xs font-medium"
                  style={{ color: active ? "var(--brand)" : "var(--text-2)" }}
                >
                  {cat.label}
                </span>
                {cat.reasons && (
                  <span
                    className="text-mini"
                    style={{
                      color: "var(--text-3)",
                      lineHeight: 1.2,
                    }}
                  >
                    {cat.reasons}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 表单行 */}
        <div
          className="mt-4 overflow-hidden"
          style={{
            background: "var(--bg-card)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-1)",
          }}
        >
          {rows.map((row) => (
            <button
              key={row.label}
              onClick={row.onClick}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left active:bg-fill"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <span className="text-sm font-medium text-text1">{row.label}</span>
              <div className="flex items-center gap-1">
                <span
                  className="text-sm"
                  style={{ color: row.placeholder ? "var(--text-3)" : "var(--text-2)" }}
                >
                  {row.value}
                </span>
                <ChevronRight className="h-4 w-4 text-text4" />
              </div>
            </button>
          ))}

          {/* 日期行：原生 date input，点击直接弹出系统日期选择 */}
          <div
            className="flex items-center justify-between px-4 py-3.5"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span className="text-sm font-medium text-text1">日期</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-right text-sm text-text2 outline-none"
              style={{ colorScheme: "light" }}
            />
          </div>

          {/* 备注行：行内直接输入，无需弹窗 */}
          <div className="flex items-center px-4 py-3.5">
            <span className="shrink-0 text-sm font-medium text-text1">备注</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="选填，点击输入备注"
              className="ml-3 min-w-0 flex-1 bg-transparent text-right text-sm text-text2 outline-none placeholder:text-text3"
            />
          </div>
        </div>

        {/* 保存按钮：金额与往来人齐全才可点 */}
        <button
          onClick={handleSave}
          disabled={!hasAmount || !selectedFriend}
          className="mt-6 h-11 w-full rounded-full bg-brand text-[15px] font-semibold text-white active:scale-[0.98] disabled:opacity-40"
          style={{ transition: "transform 160ms cubic-bezier(.2,.8,.2,1)" }}
        >
          保存
        </button>
      </div>

      {/* 往来人选择器 */}
      <PersonPicker
        open={pickerOpen}
        friends={friends}
        selectedId={selectedFriend?.id}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectFriend}
        onCreate={handleCreateFriend}
      />

      {/* 礼簿选择器（新增礼簿走统一创建弹窗，已选可再次点击取消） */}
      <GiftBookPicker
        open={bookPickerOpen}
        giftBooks={giftBooks}
        selectedId={selectedBook?.id}
        onClose={() => setBookPickerOpen(false)}
        onSelect={handleSelectBook}
        onClear={() => {
          setSelectedBook(null);
          setBookPickerOpen(false);
        }}
      />

      <TabBar />
    </MobileShell>
  );
}
