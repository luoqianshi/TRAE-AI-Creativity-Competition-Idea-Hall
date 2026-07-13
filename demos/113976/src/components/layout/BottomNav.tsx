// 底部导航栏
import { Home, Network, UserPlus, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  key: string;
  label: string;
  icon: typeof Home;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: '首页', icon: Home, path: '/' },
  { key: 'tree', label: '家族树', icon: Network, path: '/tree' },
  { key: 'add', label: '添加', icon: UserPlus, path: '/add-relative' },
  { key: 'settings', label: '我的', icon: Settings, path: '/settings' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-xuan-200 safe-bottom z-10">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full',
                'transition-colors',
                active ? 'text-cinnabar-500' : 'text-ink-400',
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
