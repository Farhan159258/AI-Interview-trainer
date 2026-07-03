'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { useAuthStore } from '@/store/authStore';
import { getAnalytics, getUserInterviews } from '@/firebase/firestore';
import type { AnalyticsSnapshot, Interview } from '@/types';

const TOOLTIP_STYLE = { background: '#12141C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 };

export default function AnalyticsPage() {
  const { firebaseUid } = useAuthStore();
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    if (!firebaseUid) return;
    (async () => {
      const [a, i] = await Promise.all([getAnalytics(firebaseUid), getUserInterviews(firebaseUid)]);
      setAnalytics(a);
      setInterviews(i);
    })();
  }, [firebaseUid]);

  const frequency = interviews.reduce<Record<string, number>>((acc, i) => {
    const week = i.createdAt.slice(0, 7); // YYYY-MM as a simple bucket
    acc[week] = (acc[week] ?? 0) + 1;
    return acc;
  }, {});
  const frequencyData = Object.entries(frequency).map(([period, count]) => ({ period, count }));

  const topicBreakdown = analytics?.topicBreakdown?.length
    ? analytics.topicBreakdown
    : [{ topic: 'Not enough data', score: 0 }];

  const codingPerf = analytics?.codingPerformance?.length ? analytics.codingPerformance : [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-white">Analytics</h1>
      <p className="mt-1 text-sm text-white/50">Trends across every interview you've run.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <GlassPanel className="p-5">
          <h3 className="font-display text-sm font-semibold text-white">Performance trend</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.performanceTrend ?? []}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="score" stroke="#00E5C7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h3 className="font-display text-sm font-semibold text-white">Topic breakdown</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={topicBreakdown}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="topic" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                <Radar dataKey="score" stroke="#6C5CE7" fill="#6C5CE7" fillOpacity={0.35} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h3 className="font-display text-sm font-semibold text-white">Interview frequency</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyData}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="period" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#6C5CE7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <h3 className="font-display text-sm font-semibold text-white">Coding performance</h3>
          <div className="mt-4 h-64">
            {codingPerf.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-white/30">
                Complete a coding interview to see this chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={codingPerf}>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="correctness" stroke="#3DDC97" strokeWidth={2} dot={false} name="Correctness" />
                  <Line type="monotone" dataKey="efficiency" stroke="#F5A623" strokeWidth={2} dot={false} name="Efficiency" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
