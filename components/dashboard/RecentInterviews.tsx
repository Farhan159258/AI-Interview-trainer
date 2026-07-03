import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Badge } from '@/components/ui/Badge';
import { formatDate, scoreColor } from '@/lib/utils';
import type { Interview } from '@/types';

export function RecentInterviews({ interviews }: { interviews: Interview[] }) {
  return (
    <GlassPanel className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-white">Recent interviews</h3>
        <Link href="/history" className="text-xs text-primary-300 hover:underline">View all</Link>
      </div>

      <div className="mt-4 flex flex-col divide-y divide-border">
        {interviews.length === 0 && (
          <p className="py-6 text-center text-sm text-white/40">No interviews yet — start your first one.</p>
        )}
        {interviews.map((interview) => (
          <Link
            key={interview.id}
            href={`/results/${interview.id}`}
            className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 hover:opacity-80"
          >
            <div>
              <p className="text-sm font-medium text-white">
                {interview.config.role === 'Custom Role' ? interview.config.customRoleTitle : interview.config.role}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Badge>{interview.config.type}</Badge>
                <span className="text-xs text-white/30">{formatDate(interview.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {interview.report && (
                <span className={`font-display text-sm font-semibold ${scoreColor(interview.report.overallScore, 100)}`}>
                  {Math.round(interview.report.overallScore)}
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-white/30" />
            </div>
          </Link>
        ))}
      </div>
    </GlassPanel>
  );
}
