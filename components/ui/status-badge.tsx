'use client';

import { cn } from '@/lib/utils';

type StatusBadgeProps = {
  status: string;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusClasses = {
    completed: 'bg-primary/20 text-primary',
    pending: 'bg-accent/20 text-accent',
    cancelled: 'bg-destructive/20 text-destructive',
    active: 'bg-primary/20 text-primary',
    'out of stock': 'bg-destructive/20 text-destructive',
  };

  const normalizedStatus = status.toLowerCase() as keyof typeof statusClasses;

  return (
    <span
      className={cn(
        'px-3 py-1 rounded-full text-xs font-semibold',
        statusClasses[normalizedStatus]
      )}
    >
      {status}
    </span>
  );
}
