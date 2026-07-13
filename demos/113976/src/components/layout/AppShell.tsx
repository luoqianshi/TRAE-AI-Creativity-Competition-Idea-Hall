// 应用外壳 - 提供页面布局（顶部头部 + 内容 + 底部导航）
import { type ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-14">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
