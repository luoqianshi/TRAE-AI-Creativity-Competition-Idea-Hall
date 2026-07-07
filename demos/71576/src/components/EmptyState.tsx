import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-specimen border border-dashed border-herbal/25 bg-paper-light/60 px-6 py-16 text-center animate-fade-up",
        className,
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ochre/10 text-ochre">
        {icon}
      </div>
      <h3 className="font-serif text-lg font-bold text-herbal">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm font-serif text-sm text-ink-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
