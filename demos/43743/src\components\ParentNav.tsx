'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Lock } from 'lucide-react';
import { cn } from '@/utils/format';

export function ParentNav({
  onParentClick,
}: {
  onParentClick: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav
      className="w-full flex items-stretch justify-around px-2 py-3"
      style={{
        background: 'rgba(255, 253, 247, 0.7)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--color-divider)',
      }}
    >
      <Link
        href="/home"
        className={cn(
          'flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition',
          pathname === '/home' ? 'text-[var(--color-forest)]' : 'text-[var(--color-muted)]',
        )}
      >
        <Home className="w-7 h-7" strokeWidth={2} />
        <span className="text-xs font-medium">首页</span>
      </Link>
      <button
        type="button"
        onClick={onParentClick}
        className="flex flex-col items-center gap-1 px-5 py-2 rounded-2xl text-[var(--color-muted)] hover:text-[var(--color-accent)] transition"
      >
        <Lock className="w-7 h-7" strokeWidth={2} />
        <span className="text-xs font-medium">家长</span>
      </button>
    </nav>
  );
}
