import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Plus } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import NavBar from "@/components/NavBar";
import TabBar from "@/components/TabBar";
import GiftBookEditModal from "@/components/GiftBookEditModal";
import { useAppStore } from "@/store/useAppStore";

export default function BatchGift() {
  const { id } = useParams();
  const navigate = useNavigate();
  const book = useAppStore((s) =>
    s.giftBooks.find((b) => b.id === id)
  );
  const friends = useAppStore((s) => s.friends);
  const toggleGuestCheckIn = useAppStore((s) => s.toggleGuestCheckIn);
  const [editOpen, setEditOpen] = useState(false);

  if (!book) {
    return (
      <MobileShell withTabBar>
        <NavBar title="礼簿" showBack backTo="/gift-book" />
        <div className="px-4 py-10 text-center text-text3">未找到该礼簿</div>
        <TabBar />
      </MobileShell>
    );
  }

  const checkedInCount = book.guests.filter((g) => g.checkedIn).length;

  return (
    <MobileShell withTabBar>
      <NavBar
        title={book.title}
        showBack
        backTo="/gift-book?seg=books"
        right={
          <button
            onClick={() => setEditOpen(true)}
            className="flex h-9 w-9 items-center justify-center active:opacity-60"
            aria-label="编辑礼簿"
          >
            <Pencil className="h-[18px] w-[18px] text-text2" />
          </button>
        }
      />

      <div className="px-4 pb-6">
        {/* 汇总卡 */}
        <section
          className="mt-4 rounded-md bg-bgcard p-5"
          style={{ boxShadow: "var(--shadow-1)" }}
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-caption font-medium text-text3">已收礼金</p>
              <p
                className="tnum mt-1 text-[32px] font-extrabold leading-tight"
                style={{ color: "var(--income)" }}
              >
                ¥{book.totalReceived.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-caption font-medium text-text3">收礼人数</p>
              <p className="tnum mt-1 text-h1 font-extrabold text-text1">
                {book.guestCount}
              </p>
            </div>
          </div>
          {(book.reason || book.date) && (
            <div className="mt-3 flex items-center gap-2 border-t border-borderbase pt-3 text-caption text-text3">
              <span>{book.date}</span>
              {book.reason && (
                <>
                  <span>·</span>
                  <span>{book.reason}</span>
                </>
              )}
            </div>
          )}
        </section>

        {/* 名单 */}
        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-text1">收礼名单</h2>
            <span className="text-caption text-text3">
              共{book.guests.length}人 · 已签到{checkedInCount}
            </span>
          </div>

          <div
            className="overflow-hidden rounded-md bg-bgcard"
            style={{ boxShadow: "var(--shadow-1)" }}
          >
            {book.guests.map((g, idx) => {
              // 按姓名匹配亲友，用于跳转友亲详情页
              const friend = friends.find((f) => f.name === g.name);
              return (
                <div
                  key={g.id}
                  className="flex w-full items-center justify-between px-4 py-3 text-left active:bg-fill"
                  style={{
                    borderBottom:
                      idx < book.guests.length - 1
                        ? "1px solid var(--border)"
                        : "none",
                  }}
                  onClick={() =>
                    friend && navigate(`/friend/${friend.id}`)
                  }
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                      style={{
                        background: g.checkedIn
                          ? "var(--brand-light)"
                          : "var(--fill)",
                        color: g.checkedIn ? "var(--brand)" : "var(--text-2)",
                      }}
                    >
                      {g.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-body font-semibold text-text1">
                        {g.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleGuestCheckIn(book.id, g.id);
                          }}
                          className="inline-flex h-5 items-center whitespace-nowrap rounded-sm px-2 text-mini font-medium active:opacity-70"
                          style={{
                            background: g.checkedIn
                              ? "var(--state-success)"
                              : "var(--text-4)",
                            color: g.checkedIn ? "#fff" : "var(--text-2)",
                          }}
                        >
                          {g.checkedIn ? "已签到" : "未签到"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <p
                    className="tnum ml-3 shrink-0 whitespace-nowrap text-h2 font-bold"
                    style={{ color: "var(--brand)" }}
                  >
                    +¥{g.amount.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* 悬浮 + 号 FAB（与记账页位置、大小一致），携带礼簿 id */}
      <button
        onClick={() => navigate(`/add?bookId=${book.id}`)}
        className="fixed z-20 flex h-14 w-14 items-center justify-center rounded-full bg-brand active:scale-95"
        style={{
          right: "max(20px, calc(50% - 420px/2 + 20px))",
          bottom: "calc(100px + env(safe-area-inset-bottom, 0px))",
          boxShadow: "var(--shadow-2)",
          transition: "transform 160ms cubic-bezier(.2,.8,.2,1)",
        }}
        aria-label="记一笔"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      <TabBar />

      {/* 编辑礼簿弹窗 */}
      <GiftBookEditModal
        open={editOpen}
        editBook={book}
        onClose={() => setEditOpen(false)}
      />
    </MobileShell>
  );
}
