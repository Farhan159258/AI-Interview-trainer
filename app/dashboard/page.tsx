'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Target, TrendingUp, Award, Flame, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getUserInterviews, getAnalytics } from '@/firebase/firestore';
import { StatCard } from '@/components/dashboard/StatCard';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { RecentInterviews } from '@/components/dashboard/RecentInterviews';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Interview, AnalyticsSnapshot } from '@/types';

export default function DashboardPage() {
  const { user, firebaseUid, loading } = useAuthStore();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!firebaseUid) return;
    (async () => {
      setFetching(true);
      const [i, a] = await Promise.all([getUserInterviews(firebaseUid), getAnalytics(firebaseUid)]);
      setInterviews(i);
      setAnalytics(a);
      setFetching(false);
    })();
  }, [firebaseUid]);

  if (loading || fetching) {
    return <div className="mx-auto max-w-7xl px-6 py-16 text-center text-white/40">Loading your dashboard…</div>;
  }

  const totalInterviews = analytics?.totalInterviews ?? interviews.length;
  const averageScore = analytics?.averageScore ?? 0;
  const bestScore = analytics?.bestScore ?? 0;
  const streak = user?.streakCount ?? 0;

  const trend = analytics?.performanceTrend?.length
    ? analytics.performanceTrend
    : interviews
        .filter((i) => i.report)
        .slice(0, 8)
        .reverse()
        .map((i) => ({ date: i.createdAt.slice(5, 10), score: i.report!.overallScore }));

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">
            Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-sm text-white/50">Here's how your interview practice is trending.</p>
        </div>
        <Link href="/interview/new">
          <Button><Plus className="h-4 w-4" /> New interview</Button>
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Target} label="Total interviews" value={totalInterviews} />
        <StatCard icon={TrendingUp} label="Average score" value={`${Math.round(averageScore)}`} sublabel="out of 100" tone="accent" />
        <StatCard icon={Award} label="Best score" value={`${Math.round(bestScore)}`} sublabel="out of 100" tone="success" />
        <StatCard icon={Flame} label="Day streak" value={streak} sublabel={streak > 0 ? 'Keep it going' : 'Start today'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceChart data={trend} />
        </div>
        <GlassPanel className="p-5">
          <h3 className="font-display text-sm font-semibold text-white">Strong vs. weak areas</h3>
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-white/30">Strong</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(analytics?.strongAreas?.length ? analytics.strongAreas : ['Not enough data yet']).map((a) => (
                <Badge key={a} tone="success">{a}</Badge>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-white/30">Needs work</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(analytics?.weakAreas?.length ? analytics.weakAreas : ['Not enough data yet']).map((a) => (
                <Badge key={a} tone="warn">{a}</Badge>
              ))}
            </div>
          </div>
        </GlassPanel>
      </div>

      <div className="mt-6">
        <RecentInterviews interviews={interviews.slice(0, 6)} />
      </div>
    </div>
  );
}
