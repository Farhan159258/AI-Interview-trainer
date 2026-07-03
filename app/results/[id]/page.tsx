'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Sparkles, Loader2 } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { getAuthToken } from '@/hooks/useAuth';
import { getInterview } from '@/firebase/firestore';
import { scoreColor } from '@/lib/utils';
import type { Interview, LearningPlan } from '@/types';

const RECOMMENDATION_TONE: Record<string, 'success' | 'accent' | 'warn' | 'danger'> = {
  'Strong Hire': 'success',
  Hire: 'accent',
  'Leaning Hire': 'warn',
  'No Hire': 'danger',
};

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  useEffect(() => {
    (async () => setInterview(await getInterview(id)))();
  }, [id]);

  const generatePlan = async () => {
    setLoadingPlan(true);
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/coach/plan', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const { plan } = await res.json();
      setPlan(plan);
    } finally {
      setLoadingPlan(false);
    }
  };

  if (!interview) {
    return <div className="mx-auto max-w-3xl px-6 py-16 text-center text-white/40">Loading report…</div>;
  }

  const report = interview.report;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">Interview report</h1>
          <p className="mt-1 text-sm text-white/50">
            {interview.config.role === 'Custom Role' ? interview.config.customRoleTitle : interview.config.role} ·{' '}
            {interview.config.type} · {interview.config.difficulty}
          </p>
        </div>
        {report && (
          <Badge tone={RECOMMENDATION_TONE[report.hiringRecommendation] ?? 'default'}>
            {report.hiringRecommendation}
          </Badge>
        )}
      </div>

      {!report ? (
        <GlassPanel className="mt-8 flex items-center gap-3 p-6 text-white/50">
          <Loader2 className="h-4 w-4 animate-spin" /> Report is still being generated…
        </GlassPanel>
      ) : (
        <>
          <GlassPanel className="mt-8 p-6">
            <div className="flex flex-wrap items-center justify-around gap-6">
              <ScoreRing score={report.overallScore} label="Overall" size={120} />
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className={`font-display text-lg font-semibold ${scoreColor(report.technicalScore, 100)}`}>{Math.round(report.technicalScore)}</p>
                  <p className="text-xs text-white/40">Technical</p>
                </div>
                <div>
                  <p className={`font-display text-lg font-semibold ${scoreColor(report.communicationScore, 100)}`}>{Math.round(report.communicationScore)}</p>
                  <p className="text-xs text-white/40">Communication</p>
                </div>
                <div>
                  <p className={`font-display text-lg font-semibold ${scoreColor(report.confidenceScore, 100)}`}>{Math.round(report.confidenceScore)}</p>
                  <p className="text-xs text-white/40">Confidence</p>
                </div>
                <div>
                  <p className={`font-display text-lg font-semibold ${scoreColor(report.problemSolvingScore, 100)}`}>{Math.round(report.problemSolvingScore)}</p>
                  <p className="text-xs text-white/40">Problem solving</p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-white/70">{report.candidateSummary}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-success/80">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                </p>
                <ul className="space-y-1.5 text-sm text-white/60">
                  {report.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-danger/80">
                  <XCircle className="h-3.5 w-3.5" /> Weaknesses
                </p>
                <ul className="space-y-1.5 text-sm text-white/60">
                  {report.weaknesses.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            </div>
          </GlassPanel>

          <h2 className="mt-8 font-display text-lg font-semibold text-white">Answer breakdown</h2>
          <div className="mt-4 space-y-4">
            {interview.answers.map((a, i) => {
              const q = interview.questions.find((q) => q.id === a.questionId);
              return (
                <GlassPanel key={a.questionId + i} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-white">{q?.text}</p>
                    {a.evaluation && (
                      <span className={`shrink-0 font-display text-sm font-semibold ${scoreColor(a.evaluation.score)}`}>
                        {a.evaluation.score}/10
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-white/40">Your answer: {a.transcript}</p>
                  {a.evaluation && (
                    <div className="mt-3 rounded-lg bg-white/5 p-3 text-xs text-white/60">
                      <p className="font-medium text-white/70">Suggested improvement</p>
                      <p className="mt-1">{a.evaluation.suggestedImprovements[0]}</p>
                    </div>
                  )}
                </GlassPanel>
              );
            })}
          </div>

          <GlassPanel className="mt-8 p-6">
            {!plan ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <Sparkles className="h-6 w-6 text-primary-300" />
                <p className="text-sm text-white/60">Get a personalized 7-day improvement plan based on this and your past interviews.</p>
                <Button onClick={generatePlan} loading={loadingPlan}>Generate my plan</Button>
              </div>
            ) : (
              <div>
                <h3 className="font-display text-sm font-semibold text-white">Your 7-day improvement plan</h3>
                <div className="mt-4 space-y-3">
                  {plan.sevenDayPlan.map((day) => (
                    <div key={day.day} className="rounded-lg bg-white/5 p-3">
                      <p className="text-xs font-medium text-primary-300">Day {day.day} · {day.focus}</p>
                      <ul className="mt-1 space-y-0.5 text-xs text-white/60">
                        {day.tasks.map((t, i) => <li key={i}>• {t}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassPanel>

          <div className="mt-8 flex justify-center">
            <Link href="/interview/new"><Button size="lg">Practice again</Button></Link>
          </div>
        </>
      )}
    </div>
  );
}
