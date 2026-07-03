'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Trash2, ChevronRight } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { getUserInterviews, deleteInterview } from '@/firebase/firestore';
import { formatDate, scoreColor } from '@/lib/utils';
import type { Interview } from '@/types';

export default function HistoryPage() {
  const { firebaseUid } = useAuthStore();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUid) return;
    (async () => {
      setLoading(true);
      setInterviews(await getUserInterviews(firebaseUid));
      setLoading(false);
    })();
  }, [firebaseUid]);

  const filtered = useMemo(() => {
    if (!query.trim()) return interviews;
    const q = query.toLowerCase();
    return interviews.filter((i) => {
      const role = i.config.role === 'Custom Role' ? i.config.customRoleTitle ?? '' : i.config.role;
      return role.toLowerCase().includes(q) || i.config.type.toLowerCase().includes(q);
    });
  }, [interviews, query]);

  const handleDelete = async (id: string) => {
    setInterviews((prev) => prev.filter((i) => i.id !== id));
    await deleteInterview(id);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-white">Interview history</h1>
      <p className="mt-1 text-sm text-white/50">Every session, searchable and reviewable.</p>

      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by role or interview type…"
          className="w-full rounded-lg border border-border bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
        />
      </div>

      <div className="mt-6 space-y-3">
        {loading && <p className="text-center text-sm text-white/40">Loading…</p>}
        {!loading && filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-white/40">No interviews found.</p>
        )}
        {filtered.map((interview) => (
          <GlassPanel key={interview.id} className="flex items-center justify-between p-4">
            <Link href={`/results/${interview.id}`} className="flex flex-1 items-center gap-4">
              <div>
                <p className="text-sm font-medium text-white">
                  {interview.config.role === 'Custom Role' ? interview.config.customRoleTitle : interview.config.role}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge>{interview.config.type}</Badge>
                  <Badge tone="accent">{interview.config.mode}</Badge>
                  <span className="text-xs text-white/30">{formatDate(interview.createdAt)}</span>
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              {interview.report && (
                <span className={`font-display text-sm font-semibold ${scoreColor(interview.report.overallScore, 100)}`}>
                  {Math.round(interview.report.overallScore)}
                </span>
              )}
              <button
                onClick={() => handleDelete(interview.id)}
                className="rounded-lg p-2 text-white/30 hover:bg-danger/10 hover:text-danger"
                title="Delete interview"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <Link href={`/results/${interview.id}`}>
                <ChevronRight className="h-4 w-4 text-white/30" />
              </Link>
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}
