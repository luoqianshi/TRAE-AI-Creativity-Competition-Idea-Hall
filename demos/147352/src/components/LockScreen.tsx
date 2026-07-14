import { useState, useEffect } from "react";
import { Delete, Lock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

/**
 * 应用锁屏页：4 位数字密码输入，全屏覆盖。
 * 输入满 4 位自动验证，错误时抖动并清空。
 */
export default function LockScreen({ onSuccess }: { onSuccess: () => void }) {
  const password = useAppStore((s) => s.appPassword);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  // 输入满 4 位自动校验
  useEffect(() => {
    if (input.length === 4) {
      if (input === password) {
        onSuccess();
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setInput("");
          setShake(false);
        }, 500);
      }
    }
  }, [input, password, onSuccess]);

  const handleKey = (k: string) => {
    setError(false);
    if (input.length < 4) {
      setInput((prev) => prev + k);
    }
  };

  const handleDelete = () => {
    setError(false);
    setInput((prev) => prev.slice(0, -1));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between"
      style={{
        background: "linear-gradient(160deg, #E54D42 0%, #C0392B 100%)",
        paddingTop: "calc(15vh + env(safe-area-inset-top, 0px))",
        paddingBottom: "calc(4vh + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {/* 顶部图标 + 标题 */}
      <div className="flex flex-col items-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20"
          style={{ backdropFilter: "blur(8px)" }}
        >
          <Lock className="h-7 w-7 text-white" />
        </div>
        <h1 className="mt-4 text-[20px] font-semibold text-white">请输入密码</h1>
        <p className="mt-1 text-[13px] text-white/60">输入 4 位数字密码解锁应用</p>
      </div>

      {/* 密码格 */}
      <div
        className="flex gap-4"
        style={{
          animation: shake ? "shake 0.4s ease" : "none",
        }}
      >
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-10px); }
            40% { transform: translateX(10px); }
            60% { transform: translateX(-8px); }
            80% { transform: translateX(8px); }
          }
        `}</style>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex h-4 w-4 items-center justify-center"
          >
            <span
              className="rounded-full"
              style={{
                width: i < input.length ? "12px" : "12px",
                height: "12px",
                background: i < input.length
                  ? "#fff"
                  : "rgba(255,255,255,0.25)",
                border: error ? "1.5px solid #FFD700" : "none",
                transition: "background 150ms",
              }}
            />
          </div>
        ))}
      </div>

      {/* 数字键盘 */}
      <div className="w-full max-w-[280px]">
        <div className="grid grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
            <button
              key={k}
              onClick={() => handleKey(k)}
              className="flex h-16 items-center justify-center rounded-full text-[24px] font-medium text-white active:scale-95"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(4px)",
                transition: "transform 100ms",
              }}
            >
              {k}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKey("0")}
            className="flex h-16 items-center justify-center rounded-full text-[24px] font-medium text-white active:scale-95"
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(4px)",
              transition: "transform 100ms",
            }}
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="flex h-16 items-center justify-center rounded-full text-white active:scale-95"
            style={{
              background: "transparent",
              transition: "transform 100ms",
            }}
            aria-label="删除"
          >
            <Delete className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
