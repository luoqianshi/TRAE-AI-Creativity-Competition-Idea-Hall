import { useState } from "react";
import { Search, Plus, Check, Calendar } from "lucide-react";
import GiftBookEditModal from "@/components/GiftBookEditModal";
import type { GiftBook } from "@/lib/types";

interface GiftBookPickerProps {
  open: boolean;
  giftBooks: GiftBook[];
  selectedId?: string;
  onClose: () => void;
  onSelect: (book: GiftBook) => void;
  /** 取消选中（清除）回调 */
  onClear?: () => void;
}

/**
 * 礼簿选择器：底部弹出，支持搜索现有礼簿 + 新增礼簿（新增走统一的创建弹窗）。
 * 已选中的礼簿再次点击可取消选中。
 */
export default function GiftBookPicker({
  open,
  giftBooks,
  selectedId,
  onClose,
  onSelect,
  onClear,
}: GiftBookPickerProps) {
  const [keyword, setKeyword] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  if (!open) return null;

  const filtered = giftBooks.filter((b) =>
    b.title.includes(keyword.trim())
  );

  const handleSelect = (b: GiftBook) => {
    // 已选中的礼簿再次点击：取消选中
    if (onClear && b.id === selectedId) {
      setKeyword("");
      onClear();
      return;
    }
    setKeyword("");
    onSelect(b);
  };

  const handleClose = () => {
    setKeyword("");
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* 遮罩 */}
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={handleClose}
        />

        {/* 面板 */}
        <div
          className="relative w-full max-w-[420px] rounded-t-2xl bg-bgcard"
          style={{
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            animation: "slideUp 240ms cubic-bezier(.2,.8,.2,1)",
          }}
        >
          <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

          {/* 顶部拖条 */}
          <div className="flex justify-center pt-2 pb-1">
            <span className="h-1 w-9 rounded-full" style={{ background: "var(--text-4)" }} />
          </div>

          {/* 标题栏 */}
          <div className="flex items-center justify-between px-4 py-2">
            <button
              onClick={handleClose}
              className="text-caption text-text3 active:opacity-60"
            >
              取消
            </button>
            <span className="text-body font-semibold text-text1">选择礼簿</span>
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1 text-caption font-medium text-brand active:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              新增
            </button>
          </div>

          {/* 搜索框 */}
          <div className="px-4 pb-2">
            <div
              className="flex items-center gap-2 rounded-full bg-fill px-3"
              style={{ height: 36 }}
            >
              <Search className="h-4 w-4 shrink-0 text-text3" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索礼簿"
                className="min-w-0 flex-1 bg-transparent text-caption text-text1 outline-none placeholder:text-text3"
              />
            </div>
          </div>

          {/* 礼簿列表 */}
          <div className="no-scrollbar flex-1 overflow-y-auto px-2 pb-4">
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-caption text-text3">
                {keyword.trim() ? "未找到匹配的礼簿" : "暂无礼簿，点击「新增」添加"}
              </div>
            ) : (
              filtered.map((b) => {
                const active = b.id === selectedId;
                return (
                  <button
                    key={b.id}
                    onClick={() => handleSelect(b)}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left active:bg-fill"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
                      style={{
                        background: "var(--brand-light)",
                        color: "var(--brand)",
                      }}
                    >
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-body font-medium text-text1">
                        {b.title}
                      </div>
                      <div className="mt-0.5 truncate text-mini text-text3">
                        {b.date} · {b.guestCount}人
                        {b.totalReceived > 0 && (
                          <span className="tnum ml-1 text-brand">
                            ¥{b.totalReceived.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {active && <Check className="h-4 w-4 shrink-0 text-brand" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 新增礼簿：与看账创建礼簿共用同一弹窗 */}
      <GiftBookEditModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(book) => {
          setCreateOpen(false);
          onSelect(book);
        }}
      />
    </>
  );
}
