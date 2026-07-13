// 通用输入框组件
import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-ink-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-11 px-3.5 rounded-lg border bg-white text-ink-800',
            'placeholder:text-ink-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'transition-colors',
            error
              ? 'border-cinnabar-400 focus:ring-cinnabar-200'
              : 'border-xuan-300 focus:border-cinnabar-400 focus:ring-cinnabar-100',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-cinnabar-600">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
