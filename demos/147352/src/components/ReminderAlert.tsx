import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";

/**
 * 应用打开时的提醒弹窗：检查今日及已过期的待办提醒，弹窗提示。
 * 每次会话只弹一次（通过 sessionStorage 控制）。
 */
export default function ReminderAlert() {
  const navigate = useNavigate();
  const reminders = useAppStore((s) => s.reminders);
  const [visible, setVisible] = useState(false);
  const [todayReminders, setTodayReminders] = useState<typeof reminders>([]);

  useEffect(() => {
    // 本次会话已弹过则不再弹
    if (sessionStorage.getItem("reminder-alert-shown") === "1") return;

    const today = new Date().toISOString().slice(0, 10);
    const due = reminders.filter(
      (r) => r.status === "pending" && r.date <= today
    );
    if (due.length > 0) {
      setTodayReminders(due);
      setVisible(true);
      sessionStorage.setItem("reminder-alert-shown", "1");
    }
  }, [reminders]);

  if (!visible) return null;

  const handleGoReminders = () => {
    setVisible(false);
    navigate("/reminders");
  };

  const handleClose = () => setVisible(false);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-6">
      {/* 遮罩 */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={handleClose}
      />

      {/* 弹窗 */}
      <div
        className="relative w-full max-w-[320px] rounded-xl bg-bgcard"
        style={{
          boxShadow: "var(--shadow-2)",
          animation: "popIn 200ms cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <style>{`
          @keyframes popIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>

        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full active:bg-fill"
          aria-label="关闭"
        >
          <X className="h-4 w-4 text-text3" />
        </button>

        {/* 图标 */}
        <div className="flex flex-col items-center pt-6 pb-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: "var(--brand-light)" }}
          >
            <Bell className="h-6 w-6 text-brand" />
          </div>
          <h2 className="mt-3 text-h2 font-bold text-text1">
            {todayReminders.length} 条提醒待处理
          </h2>
          <p className="mt-1 text-caption text-text3">有需要处理的往来提醒</p>
        </div>

        {/* 提醒列表（最多显示 3 条） */}
        <div className="px-5 pb-3 space-y-2">
          {todayReminders.slice(0, 3).map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-2 rounded-md p-2"
              style={{ background: "var(--fill)" }}
            >
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-caption font-bold"
                style={{ background: "var(--brand-light)", color: "var(--brand)" }}
              >
                {r.friendName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-caption font-medium text-text1">
                  {r.title}
                </div>
                {r.desc && (
                  <div className="truncate text-mini text-text3">{r.desc}</div>
                )}
              </div>
            </div>
          ))}
          {todayReminders.length > 3 && (
            <p className="text-center text-mini text-text3">
              还有 {todayReminders.length - 3} 条...
            </p>
          )}
        </div>

        {/* 按钮 */}
        <div className="flex gap-2 px-5 pb-5 pt-1">
          <button
            onClick={handleClose}
            className="flex-1 rounded-full py-2.5 text-caption font-medium text-text2 active:opacity-70"
            style={{ background: "var(--fill)" }}
          >
            稍后
          </button>
          <button
            onClick={handleGoReminders}
            className="flex-1 rounded-full py-2.5 text-caption font-semibold text-white active:scale-[0.98]"
            style={{ background: "var(--brand)" }}
          >
            去查看
          </button>
        </div>
      </div>
    </div>
  );
}
