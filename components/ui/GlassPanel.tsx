import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function GlassPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl2 border border-border bg-surface/60 backdrop-blur-xl shadow-glass',
        className
      )}
      {...props}
    />
  );
}
