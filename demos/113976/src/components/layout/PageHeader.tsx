// 页面头部组件
import { type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
  right?: ReactNode;
}

export function PageHeader({ title, showBack = false, backTo, right }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-xuan-200 safe-top">
      <div className="flex items-center justify-between h-14 px-4">
        {showBack ? (
          <button
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            className="flex items-center gap-1 text-ink-600 hover:text-ink-800"
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <div className="w-6" />
        )}
        <h1 className="text-base font-serif font-bold text-ink-800 truncate">
          {title}
        </h1>
        <div className="min-w-[24px]">
          {right}
        </div>
      </div>
    </header>
  );
}
