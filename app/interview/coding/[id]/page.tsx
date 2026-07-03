'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Play, Loader2, Clock } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getAuthToken } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useInterviewStore } from '@/store/interviewStore';
import { saveCodingSubmission } from '@/firebase/firestore';
import type { CodingChallenge, CodingLanguage, CodeReview } from '@/types';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const LANGUAGES: { value: CodingLanguage; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];

export default function CodingInterviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { firebaseUid } = useAuthStore();
  const { config } = useInterviewStore();

  const [challenge, setChallenge] = useState<CodingChallenge | null>(null);
  const [language, setLanguage] = useState<CodingLanguage>('javascript');
  const [code, setCode] = useState('');
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState<CodeReview | null>(null);

  useEffect(() => {
    (async () => {
      setLoadingChallenge(true);
      const token = await getAuthToken();
      const res = await fetch('/api/coding/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: config?.role ?? 'Full Stack Developer', difficulty: config?.difficulty ?? 'Intermediate' }),
      });
      const { challenge } = await res.json();
      setChallenge(challenge);
      setCode(challenge.starterCode[language]);
      setLoadingChallenge(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (challenge) setCode(challenge.starterCode[language]);
  }, [language, challenge]);

  const submitForReview = async () => {
    if (!challenge || !firebaseUid) return;
    setReviewing(true);
    try {
      const token = await getAuthToken();
      const res = await fetch('/api/coding/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ challengeDescription: challenge.description, language, code }),
      });
      const { review } = await res.json();
      setReview(review);

      await saveCodingSubmission({
        id: `sub_${Date.now()}`,
        userId: firebaseUid,
        challengeId: challenge.id,
        language,
        code,
        submittedAt: new Date().toISOString(),
        review,
      });
    } finally {
      setReviewing(false);
    }
  };

  if (loadingChallenge || !challenge) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-20 text-white/40">
        <Loader2 className="h-6 w-6 animate-spin" />
        Generating your coding challenge…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Problem panel */}
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <Badge tone="accent">{challenge.topic}</Badge>
            <span className="flex items-center gap-1 text-xs text-white/40">
              <Clock className="h-3.5 w-3.5" /> {challenge.timeLimitMinutes} min
            </span>
          </div>
          <h1 className="mt-3 font-display text-lg font-semibold text-white">{challenge.title}</h1>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/70">{challenge.description}</p>

          {challenge.examples.length > 0 && (
            <div className="mt-5 space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-white/30">Examples</p>
              {challenge.examples.map((ex, i) => (
                <div key={i} className="rounded-lg bg-white/5 p-3 font-mono text-xs text-white/60">
                  <p><span className="text-white/40">Input:</span> {ex.input}</p>
                  <p><span className="text-white/40">Output:</span> {ex.output}</p>
                  {ex.explanation && <p className="mt-1 text-white/40">{ex.explanation}</p>}
                </div>
              ))}
            </div>
          )}

          {challenge.constraints.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-white/30">Constraints</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-white/50">
                {challenge.constraints.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}

          {review && (
            <div className="mt-6 space-y-4 border-t border-border pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-white/30">AI code review</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-white/5 py-3">
                  <p className="font-display text-lg font-semibold text-white">{review.correctnessScore}/10</p>
                  <p className="text-[10px] text-white/40">Correctness</p>
                </div>
                <div className="rounded-lg bg-white/5 py-3">
                  <p className="font-display text-lg font-semibold text-white">{review.efficiencyScore}/10</p>
                  <p className="text-[10px] text-white/40">Efficiency</p>
                </div>
                <div className="rounded-lg bg-white/5 py-3">
                  <p className="font-display text-lg font-semibold text-white">{review.readabilityScore}/10</p>
                  <p className="text-[10px] text-white/40">Readability</p>
                </div>
              </div>
              <p className="text-xs text-white/50">
                Time: <span className="font-mono text-white/70">{review.timeComplexity}</span> · Space:{' '}
                <span className="font-mono text-white/70">{review.spaceComplexity}</span>
              </p>
              <p className="text-sm text-white/70">{review.overallFeedback}</p>
              {review.optimizationSuggestions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-white/40">Optimization ideas</p>
                  <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-white/60">
                    {review.optimizationSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              <Button variant="secondary" size="sm" onClick={() => router.push('/history')}>
                Finish and view history
              </Button>
            </div>
          )}
        </GlassPanel>

        {/* Editor panel */}
        <GlassPanel className="flex flex-col overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as CodingLanguage)}
              className="rounded-md border border-border bg-white/5 px-2.5 py-1.5 text-xs text-white"
            >
              {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <Button size="sm" onClick={submitForReview} loading={reviewing}>
              <Play className="h-3.5 w-3.5" /> Submit for AI review
            </Button>
          </div>
          <div className="h-[560px]">
            <MonacoEditor
              language={language === 'cpp' ? 'cpp' : language}
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v ?? '')}
              options={{ fontSize: 13, minimap: { enabled: false }, padding: { top: 16 } }}
            />
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
