import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, ClipboardList, Library, BarChart3, Volume2, VolumeX } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export default function NavBar() {
  const location = useLocation();
  const { settings, toggleSound } = useAppStore();

  const links = [
    { path: '/', label: '首页', icon: Home, color: 'from-kid-sky to-blue-400' },
    { path: '/learn', label: '学习', icon: BookOpen, color: 'from-kid-mint to-green-400' },
    { path: '/test', label: '测试', icon: ClipboardList, color: 'from-kid-coral to-orange-400' },
    { path: '/vocabulary', label: '词库', icon: Library, color: 'from-kid-lavender to-purple-400' },
    { path: '/progress', label: '报告', icon: BarChart3, color: 'from-kid-pink to-rose-400' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b-4 border-kid-sky/20 shadow-kid">
      <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-kid-sky via-kid-lemon to-kid-mint flex items-center justify-center shadow-kid group-hover:scale-110 transition-transform">
            <span className="text-2xl md:text-3xl animate-bounce-slow">📚</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="title-kid text-lg md:text-xl leading-tight">单词小博士</h1>
            <p className="text-[10px] md:text-xs text-kid-textLight">快乐记单词 🌟</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto scrollbar-kid">
          {links.map((l) => {
            const active = location.pathname === l.path || (l.path !== '/' && location.pathname.startsWith(l.path));
            const Icon = l.icon;
            return (
              <Link
                key={l.path}
                to={l.path}
                className={`relative shrink-0 flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-xl font-kid font-bold text-xs md:text-sm transition-all duration-200 ${
                  active
                    ? `bg-gradient-to-br ${l.color} text-white shadow-kid scale-105`
                    : 'text-kid-text hover:bg-white/60'
                }`}
              >
                <Icon size={18} strokeWidth={2.5} />
                <span className="hidden md:inline">{l.label}</span>
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white animate-pop" />
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={toggleSound}
          className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 bg-white/60 shadow-kid"
          title={settings.soundEnabled ? '静音' : '开启声音'}
        >
          {settings.soundEnabled ? (
            <Volume2 className="text-kid-mint" size={20} strokeWidth={2.5} />
          ) : (
            <VolumeX className="text-kid-coral" size={20} strokeWidth={2.5} />
          )}
        </button>
      </div>
    </header>
  );
}
