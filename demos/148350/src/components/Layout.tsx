import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  Home, ListChecks, BarChart3, MessageCircle,
  Menu, X, Sparkles, User, UserCircle,
} from "lucide-react";
import { useApp } from "../store";

export default function Layout() {
  const { user } = useApp();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: "/", icon: Home, label: "打卡" },
    { to: "/habits", icon: ListChecks, label: "习惯" },
    { to: "/stats", icon: BarChart3, label: "统计" },
    { to: "/chat", icon: MessageCircle, label: "AI伙伴" },
    { to: "/profile", icon: UserCircle, label: "我的" },
  ];

  const isActive = (to: string) => location.pathname === to;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* ── Top bar - glass style ── */}
      <header className="glass sticky top-0 z-40 border-b border-white/40 safe-top">
        <div className="mx-auto flex h-14 items-center justify-between max-w-5xl px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-warm-orange to-warm-orange-dark shadow-md shadow-warm-orange/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-dark-brown tracking-tight">好习惯打卡</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const active = isActive(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-warm-orange/10 text-warm-orange shadow-sm"
                      : "text-gray-400 hover:text-dark-brown hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <NavLink
              to="/profile"
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-dark-brown transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-warm-orange/15 flex items-center justify-center">
                <User className="w-3 h-3 text-warm-orange" />
              </div>
              {user?.name}
            </NavLink>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-400">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {mobileOpen && (
          <nav className="md:hidden bg-white/95 backdrop-blur px-4 py-2 border-t border-gray-50 animate-fade-in">
            {navItems.map(item => {
              const active = isActive(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active ? "bg-warm-orange/10 text-warm-orange" : "text-gray-500"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        )}
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-4 pb-20 md:pb-6">
        <Outlet />
      </main>

      {/* ── Bottom nav - mobile mini-program style ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/40 safe-bottom">
        <div className="flex justify-around py-1.5 max-w-lg mx-auto">
          {navItems.map(item => {
            const active = isActive(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] ${
                  active ? "text-warm-orange" : "text-gray-300"
                }`}
              >
                <div className={`relative transition-all duration-200 ${active ? "scale-110" : ""}`}>
                  <item.icon className={`w-5 h-5 ${active ? "text-warm-orange" : ""}`} />
                  {active && (
                    <span className="absolute -top-0.5 -right-1.5 w-1.5 h-1.5 bg-warm-orange rounded-full animate-pop-in" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${active ? "text-warm-orange" : "text-gray-300"}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
