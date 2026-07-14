import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * 悬浮「记一笔」FAB 按钮，固定右下，避让底部 Tab。
 */
export default function Fab() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/add")}
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
  );
}
