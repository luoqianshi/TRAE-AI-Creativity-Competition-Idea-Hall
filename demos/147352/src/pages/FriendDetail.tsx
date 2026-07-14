import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MobileShell from "@/components/MobileShell";
import NavBar from "@/components/NavBar";
import TabBar from "@/components/TabBar";
import { useAppStore } from "@/store/useAppStore";

/**
 * 友亲详情页：展示该往来人的收礼总金额、随礼总金额，下方列出所有收支明细（按时间倒序）。
 */
export default function FriendDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const friends = useAppStore((s) => s.friends);
  const transactions = useAppStore((s) => s.transactions);
  const friend = friends.find((f) => f.id === id);

  // 该往来人所有交易，按时间倒序（最近的在先）
  const records = useMemo(() => {
    if (!friend) return [];
    return transactions
      .filter((t) => t.personId === friend.id)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, friend]);

  // 收礼/随礼总额
  const incomeTotal = records
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expenseTotal = records
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  if (!friend) {
    return (
      <MobileShell withTabBar>
        <NavBar title="往来明细" showBack onBack={() => navigate(-1)} />
        <div className="px-4 py-10 text-center text-text3">未找到该亲友</div>
        <TabBar />
      </MobileShell>
    );
  }

  return (
    <MobileShell withTabBar>
      <NavBar title={friend.name} showBack onBack={() => navigate(-1)} />

      <div className="px-4 pb-6">
        {/* 统计卡：收礼总额 / 随礼总额 */}
        <section
          className="mt-4 rounded-md bg-bgcard p-5"
          style={{ boxShadow: "var(--shadow-1)" }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-caption font-medium text-text3">收礼总额</p>
              <p
                className="tnum mt-1 text-[26px] font-extrabold leading-tight"
                style={{ color: "var(--income)" }}
              >
                +¥{incomeTotal.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-caption font-medium text-text3">随礼总额</p>
              <p
                className="tnum mt-1 text-[26px] font-extrabold leading-tight"
                style={{ color: "var(--expense)" }}
              >
                -¥{expenseTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        {/* 收支明细列表 */}
        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-text1">收支明细</h2>
            <span className="text-caption text-text3">共{records.length}笔</span>
          </div>

          {records.length === 0 ? (
            <div className="py-12 text-center text-caption text-text3">
              暂无往来记录
            </div>
          ) : (
            <div
              className="overflow-hidden rounded-md bg-bgcard"
              style={{ boxShadow: "var(--shadow-1)" }}
            >
              {records.map((t, idx) => (
                <div
                  key={t.id}
                  className="flex items-center px-4 py-3"
                  style={{
                    borderBottom:
                      idx < records.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[18px]"
                    style={{ background: "var(--fill)" }}
                  >
                    {t.emoji}
                  </div>
                  <div className="min-w-0 flex-1 pl-3">
                    <div className="truncate text-body font-medium text-text1">
                      {t.event}
                    </div>
                    <div className="mt-0.5 text-mini text-text3">{t.date}</div>
                  </div>
                  <span
                    className="tnum ml-3 shrink-0 whitespace-nowrap text-h2 font-bold"
                    style={{
                      color:
                        t.type === "income"
                          ? "var(--income)"
                          : "var(--expense)",
                    }}
                  >
                    {t.type === "income" ? "+" : "-"}¥{t.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <TabBar />
    </MobileShell>
  );
}
