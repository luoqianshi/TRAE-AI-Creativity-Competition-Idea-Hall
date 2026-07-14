import { useEffect, useState, useRef } from "react";
import type { KeyboardEvent } from "react";
import { useAppStore } from "@/store/useAppStore";

type Mode = "set" | "change" | "clear";

interface PasswordModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * 单格密码输入框：4 个独立格子，每格 1 位数字，输入后自动跳到下一格。
 * 必须定义在组件外部以保持焦点。
 */
function PinInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const cells = [0, 1, 2, 3].map((i) => value[i] ?? "");

  const setCell = (i: number, d: string) => {
    const arr = cells.slice();
    arr[i] = d;
    onChange(arr.join(""));
  };

  const handleChange = (i: number, raw: string) => {
    const d = raw.replace(/\D/g, "").slice(-1);
    if (!d) return;
    setCell(i, d);
    if (i < 3) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (cells[i]) {
        setCell(i, "");
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
        setCell(i - 1, "");
      }
    }
  };

  const handleFocus = (i: number) => {
    // 聚焦时选中当前格内容，便于覆盖输入
    refs.current[i]?.select();
  };

  return (
    <div className="flex gap-3">
      {cells.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="tel"
          inputMode="numeric"
          maxLength={1}
          value={c}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={() => handleFocus(i)}
          className="h-12 w-12 shrink-0 rounded-md border border-borderbase bg-bgcard text-center text-h2 text-text1 outline-none focus:border-brand"
        />
      ))}
    </div>
  );
}

/**
 * 密码管理弹窗：底部滑出，支持三种模式。
 * - set：首次设置密码（输入两次 4 位数字）
 * - change：修改密码（旧密码 + 新密码两次）
 * - clear：清除密码（输入当前密码验证）
 * 根据是否已有密码自动选择 set 或 change 模式。
 */
export default function PasswordModal({ open, onClose }: PasswordModalProps) {
  const appPassword = useAppStore((s) => s.appPassword);
  const setAppPassword = useAppStore((s) => s.setAppPassword);
  const clearAppPassword = useAppStore((s) => s.clearAppPassword);

  const hasPwd = Boolean(appPassword);
  const [mode, setMode] = useState<Mode>("set");
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [error, setError] = useState("");

  // 打开时根据是否已有密码初始化模式
  useEffect(() => {
    if (!open) return;
    setMode(hasPwd ? "change" : "set");
    setOldPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setError("");
  }, [open, hasPwd]);

  if (!open) return null;

  const handleSet = () => {
    if (newPwd.length !== 4) {
      setError("请输入 4 位数字密码");
      return;
    }
    if (!/^\d{4}$/.test(newPwd)) {
      setError("密码只能包含数字");
      return;
    }
    if (newPwd !== confirmPwd) {
      setError("两次输入的密码不一致");
      return;
    }
    setAppPassword(newPwd);
    handleClose();
  };

  const handleChange = () => {
    if (oldPwd !== appPassword) {
      setError("原密码不正确");
      return;
    }
    if (newPwd.length !== 4 || !/^\d{4}$/.test(newPwd)) {
      setError("新密码须为 4 位数字");
      return;
    }
    if (newPwd !== confirmPwd) {
      setError("两次输入的新密码不一致");
      return;
    }
    if (newPwd === appPassword) {
      setError("新密码不能与原密码相同");
      return;
    }
    setAppPassword(newPwd);
    handleClose();
  };

  const handleClear = () => {
    if (oldPwd !== appPassword) {
      setError("密码不正确");
      return;
    }
    clearAppPassword();
    handleClose();
  };

  const handleSubmit = () => {
    setError("");
    if (mode === "set") handleSet();
    else if (mode === "change") handleChange();
    else handleClear();
  };

  const handleClose = () => {
    setOldPwd("");
    setNewPwd("");
    setConfirmPwd("");
    setError("");
    onClose();
  };

  const title =
    mode === "set" ? "设置密码" : mode === "change" ? "修改密码" : "清除密码";

  // 计算是否可提交
  const canSubmit =
    mode === "clear"
      ? oldPwd.length === 4
      : mode === "set"
      ? newPwd.length === 4 && confirmPwd.length === 4
      : oldPwd.length === 4 && newPwd.length === 4 && confirmPwd.length === 4;

  // 包装 onChange，输入时清除错误
  const wrapChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setError("");
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
          <span className="text-body font-semibold text-text1">{title}</span>
          <div className="w-8" />
        </div>

        {/* 表单 */}
        <div className="px-4 pb-6 pt-2">
          {/* 模式切换 Tab（仅已有密码时显示） */}
          {hasPwd && (
            <div className="mb-4 flex gap-2">
              {(["change", "clear"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setError("");
                    setOldPwd("");
                    setNewPwd("");
                    setConfirmPwd("");
                  }}
                  className="flex-1 rounded-md py-2 text-caption font-medium active:opacity-80"
                  style={{
                    background:
                      mode === m ? "var(--brand-light)" : "var(--fill)",
                    color: mode === m ? "var(--brand)" : "var(--text-2)",
                    fontWeight: mode === m ? 600 : 400,
                  }}
                >
                  {m === "change" ? "修改密码" : "清除密码"}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {/* 原密码（change / clear 模式） */}
            {(mode === "change" || mode === "clear") && (
              <div className="flex items-center justify-center gap-4">
                <span
                  className="shrink-0 text-caption text-text3"
                  style={{ letterSpacing: "8px", paddingLeft: "8px" }}
                >
                  {mode === "clear" ? "当前密码" : "原密码"}
                </span>
                <PinInput
                  value={oldPwd}
                  onChange={wrapChange(setOldPwd)}
                />
              </div>
            )}

            {/* 新密码 + 确认（set / change 模式） */}
            {(mode === "set" || mode === "change") && (
              <>
                <div className="flex items-center justify-center gap-4">
                  <span
                    className="shrink-0 text-caption text-text3"
                    style={{ letterSpacing: "8px", paddingLeft: "8px" }}
                  >
                    新密码
                  </span>
                  <PinInput
                    value={newPwd}
                    onChange={wrapChange(setNewPwd)}
                  />
                </div>
                <div className="flex items-center justify-center gap-4">
                  <span
                    className="shrink-0 text-caption text-text3"
                    style={{ letterSpacing: "8px", paddingLeft: "8px" }}
                  >
                    确认密码
                  </span>
                  <PinInput
                    value={confirmPwd}
                    onChange={wrapChange(setConfirmPwd)}
                  />
                </div>
              </>
            )}

            {/* 错误提示 */}
            {error && (
              <p className="text-center text-caption text-expense">{error}</p>
            )}

            {/* 提示文案 */}
            <p className="text-center text-mini text-text4">
              {mode === "clear"
                ? "清除后进入应用不再需要密码"
                : "密码为 4 位数字，请妥善保管"}
            </p>
          </div>

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="mt-5 h-11 w-full rounded-full bg-brand text-[15px] font-semibold text-white active:scale-[0.98] disabled:opacity-40"
            style={{ transition: "transform 160ms cubic-bezier(.2,.8,.2,1)" }}
          >
            {mode === "set" ? "设置" : mode === "change" ? "修改" : "清除密码"}
          </button>
        </div>
      </div>
    </div>
  );
}
