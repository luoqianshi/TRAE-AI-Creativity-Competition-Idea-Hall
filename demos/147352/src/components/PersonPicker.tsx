import { useState } from "react";
import { Search, Plus, Check, X } from "lucide-react";
import Avatar from "@/components/Avatar";
import type { Friend } from "@/lib/types";

interface PersonPickerProps {
  open: boolean;
  friends: Friend[];
  selectedId?: string;
  onClose: () => void;
  onSelect: (friend: Friend) => void;
  onCreate: (name: string) => Friend;
}

/**
 * 往来人选择器：底部弹出，支持搜索历史往来人 + 新增往来人。
 */
export default function PersonPicker({
  open,
  friends,
  selectedId,
  onClose,
  onSelect,
  onCreate,
}: PersonPickerProps) {
  const [keyword, setKeyword] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  if (!open) return null;

  const filtered = friends.filter((f) =>
    f.name.includes(keyword.trim())
  );

  const handleConfirmAdd = () => {
    const name = newName.trim();
    if (!name) return;
    const f = onCreate(name);
    setNewName("");
    setAdding(false);
    setKeyword("");
    onSelect(f);
  };

  const handleSelect = (f: Friend) => {
    setKeyword("");
    onSelect(f);
  };

  const handleClose = () => {
    setAdding(false);
    setNewName("");
    setKeyword("");
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
          <span className="text-body font-semibold text-text1">选择往来人</span>
          <button
            onClick={() => setAdding((v) => !v)}
            className="inline-flex items-center gap-1 text-caption font-medium text-brand active:opacity-60"
          >
            <Plus className="h-3.5 w-3.5" />
            新增
          </button>
        </div>

        {/* 新增输入框 */}
        {adding && (
          <div className="px-4 pb-2">
            <div
              className="flex items-center gap-2 rounded-md border border-borderbase bg-bgcard px-3"
              style={{ height: 40 }}
            >
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConfirmAdd()}
                placeholder="输入往来人姓名"
                className="min-w-0 flex-1 bg-transparent text-body text-text1 outline-none placeholder:text-text3"
              />
              {newName && (
                <button
                  onClick={() => setNewName("")}
                  aria-label="清除"
                  className="shrink-0"
                >
                  <X className="h-4 w-4 text-text4" />
                </button>
              )}
              <button
                onClick={handleConfirmAdd}
                disabled={!newName.trim()}
                className="shrink-0 rounded-sm bg-brand px-3 py-1 text-mini font-semibold text-white disabled:opacity-40"
              >
                确定
              </button>
            </div>
          </div>
        )}

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
              placeholder="搜索往来人"
              className="min-w-0 flex-1 bg-transparent text-caption text-text1 outline-none placeholder:text-text3"
            />
          </div>
        </div>

        {/* 历史往来人列表 */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-2 pb-4">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-caption text-text3">
              {keyword.trim() ? "未找到匹配的往来人" : "暂无往来人，点击「新增」添加"}
            </div>
          ) : (
            filtered.map((f) => {
              const active = f.id === selectedId;
              return (
                <button
                  key={f.id}
                  onClick={() => handleSelect(f)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left active:bg-fill"
                >
                  <Avatar name={f.name} color={f.avatarColor} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-body font-medium text-text1">
                      {f.name}
                    </div>
                    <div className="mt-0.5 truncate text-mini text-text3">
                      收{f.incomeCount} · 支{f.expenseCount}
                      {f.netAmount !== 0 && (
                        <span
                          className="ml-1 tnum"
                          style={{
                            color:
                              f.netAmount > 0 ? "var(--income)" : "var(--expense)",
                          }}
                        >
                          ({f.netAmount > 0 ? "+" : ""}¥{Math.abs(f.netAmount).toLocaleString()})
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
  );
}
