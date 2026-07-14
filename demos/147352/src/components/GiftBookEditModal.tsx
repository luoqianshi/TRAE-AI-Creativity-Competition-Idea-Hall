import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { categories } from "@/data/seed";
import type { GiftBook } from "@/lib/types";

interface GiftBookEditModalProps {
  open: boolean;
  /** 编辑模式时传入已有礼簿，创建模式不传 */
  editBook?: GiftBook | null;
  onClose: () => void;
  /** 创建成功回调 */
  onCreated?: (book: GiftBook) => void;
  /** 编辑成功回调 */
  onUpdated?: () => void;
}

/**
 * 礼簿创建/编辑弹窗：底部滑出，含名称、时间、事由三字段。
 * 创建与编辑共用同一表单，看账创建礼簿、记一笔新增礼簿、礼簿详情编辑三处入口统一使用。
 */
export default function GiftBookEditModal({
  open,
  editBook,
  onClose,
  onCreated,
  onUpdated,
}: GiftBookEditModalProps) {
  const isEdit = Boolean(editBook);
  const addGiftBookFull = useAppStore((s) => s.addGiftBookFull);
  const updateGiftBook = useAppStore((s) => s.updateGiftBook);

  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState(editBook?.title ?? "");
  const [date, setDate] = useState(editBook?.date ?? today);
  const [reason, setReason] = useState(editBook?.reason ?? "");

  // 每次打开时，按当前模式（创建/编辑）重置表单
  useEffect(() => {
    if (!open) return;
    setTitle(editBook?.title ?? "");
    setDate(editBook?.date ?? today);
    setReason(editBook?.reason ?? "");
  }, [open, editBook]);

  if (!open) return null;

  const canSave = title.trim().length > 0 && date.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const info = {
      title: title.trim(),
      date,
      reason: reason.trim() || undefined,
    };
    if (isEdit && editBook) {
      updateGiftBook(editBook.id, info);
      onUpdated?.();
    } else {
      const book = addGiftBookFull(info);
      onCreated?.(book);
    }
    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setDate(today);
    setReason("");
    onClose();
  };

  return (
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
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 240ms cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

        {/* 拖条 */}
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
          <span className="text-body font-semibold text-text1">
            {isEdit ? "编辑礼簿" : "创建礼簿"}
          </span>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="text-caption font-medium text-brand active:opacity-60 disabled:opacity-40"
          >
            保存
          </button>
        </div>

        {/* 表单 */}
        <div className="px-4 pb-6 pt-2">
          <div
            className="overflow-hidden rounded-md"
            style={{ background: "var(--fill)" }}
          >
            {/* 名称 */}
            <div className="flex items-center px-4" style={{ height: 52 }}>
              <span className="w-16 shrink-0 text-caption text-text3">名称</span>
              <input
                autoFocus={!isEdit}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="如：张三婚礼簿"
                className="min-w-0 flex-1 bg-transparent text-body text-text1 outline-none placeholder:text-text4"
                maxLength={20}
              />
            </div>

            <div className="h-px" style={{ background: "var(--border)" }} />

            {/* 时间 */}
            <div className="flex items-center px-4" style={{ height: 52 }}>
              <span className="w-16 shrink-0 text-caption text-text3">时间</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-body text-text1 outline-none"
              />
            </div>

            <div className="h-px" style={{ background: "var(--border)" }} />

            {/* 事由：与收礼/随礼一致的 8 大类下拉可选 */}
            <div className="flex items-center px-4" style={{ height: 52 }}>
              <span className="w-16 shrink-0 text-caption text-text3">事由</span>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-body text-text1 outline-none"
                style={{ colorScheme: "light" }}
              >
                <option value="">请选择事由</option>
                {categories.map((c) => (
                  <option key={c.key} value={c.label}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 底部保存按钮 */}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="mt-5 h-11 w-full rounded-full bg-brand text-[15px] font-semibold text-white active:scale-[0.98] disabled:opacity-40"
            style={{ transition: "transform 160ms cubic-bezier(.2,.8,.2,1)" }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
