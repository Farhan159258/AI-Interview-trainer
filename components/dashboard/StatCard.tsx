import { LucideIcon } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { cn } from '@/lib/utils';

export function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  tone = 'default',
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sublabel?: string;
  tone?: 'default' | 'accent' | 'success';
}) {
  const toneClasses: Record<string, string> = {
    default: 'bg-primary-500/15 text-primary-300',
    accent: 'bg-accent/15 text-accent',
    success: 'bg-success/15 text-success',
  };
  return (
    <GlassPanel className="p-5">
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', toneClasses[tone])}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="mt-4 font-display text-2xl font-semibold text-white">{value}</p>
      <p className="text-sm text-white/50">{label}</p>
      {sublabel && <p className="mt-1 text-xs text-white/30">{sublabel}</p>}
    </GlassPanel>
  );
}
