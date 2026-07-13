// 空状态组件
import { type ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-ink-300 mb-4">
        {icon}
      </div>
      <h3 className="text-base font-medium text-ink-700 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-ink-400 mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
