// 通用按钮组件
import { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cinnabar-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'md' && 'h-11 px-4 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',
        variant === 'primary' && 'bg-cinnabar-500 text-white hover:bg-cinnabar-600 active:bg-cinnabar-700',
        variant === 'secondary' && 'bg-white text-ink-700 border border-xuan-300 hover:bg-xuan-50',
        variant === 'ghost' && 'text-ink-600 hover:bg-xuan-100',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
