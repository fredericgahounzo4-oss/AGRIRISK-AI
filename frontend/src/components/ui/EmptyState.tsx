import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)}>
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f5e9] text-[#1a5c2a]">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-[#1a2e1d]">{title}</h3>
        {description && <p className="text-sm text-[#6b7c6e] max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
