import { NavLink } from "react-router-dom";
import { LayoutDashboard, Boxes, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "药箱总览", icon: LayoutDashboard, end: true },
  { to: "/inventory", label: "药品库存", icon: Boxes, end: false },
  { to: "/records", label: "用药记录", icon: ScrollText, end: false },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-herbal/15 bg-paper/85 backdrop-blur-md">
      <div className="container flex items-center justify-between gap-4 py-3">
        <NavLink to="/" className="group flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-herbal/30 bg-paper-light font-brush text-2xl text-herbal shadow-sm transition-transform duration-300 group-hover:scale-105">
            药
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-lg font-bold text-herbal">
              本草药箱
            </span>
            <span className="font-latin text-xs italic tracking-wide text-ochre">
              Family Med Manager
            </span>
          </span>
        </NavLink>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-2 font-serif text-sm transition-all duration-200 sm:px-4",
                  isActive
                    ? "bg-herbal text-paper-light shadow-sm"
                    : "text-ink-muted hover:bg-herbal/8 hover:text-herbal",
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
