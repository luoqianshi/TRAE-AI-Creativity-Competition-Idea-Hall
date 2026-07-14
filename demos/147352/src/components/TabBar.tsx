import { BookOpen, PencilLine, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

type TabKey = "home" | "gift" | "profile";

const tabs: { key: TabKey; label: string; icon: typeof BookOpen; path: string }[] = [
  { key: "home", label: "记账", icon: PencilLine, path: "/" },
  { key: "gift", label: "看账", icon: BookOpen, path: "/gift-book" },
  { key: "profile", label: "我的", icon: User, path: "/profile" },
];

/**
 * 底部三 Tab 栏。
 */
export default function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const activeKey: TabKey = pathname.startsWith("/gift-book")
    ? "gift"
    : pathname.startsWith("/profile")
    ? "profile"
    : "home";

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-30 w-full max-w-[420px] -translate-x-1/2 border-t border-borderbase bg-bgcard"
      style={{ height: "calc(50px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="flex h-[50px] items-center justify-around">
        {tabs.map((t) => {
          const active = t.key === activeKey;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => navigate(t.path)}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-[2px] active:opacity-60"
              style={{ height: "100%" }}
            >
              <Icon
                className="h-5 w-5"
                style={{ color: active ? "var(--brand)" : "var(--text-3)" }}
                strokeWidth={active ? 2.4 : 2}
              />
              <span
                className="whitespace-nowrap text-[10px]"
                style={{
                  color: active ? "var(--brand)" : "var(--text-3)",
                  fontWeight: active ? 600 : 400,
                }}
              >
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
