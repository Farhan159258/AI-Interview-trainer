'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { useInterviewStore } from '@/store/interviewStore';
import { getAuthToken } from '@/hooks/useAuth';
import { createInterview } from '@/firebase/firestore';
import type { JobRole, Difficulty, InterviewType, InterviewMode, InterviewConfig, Interview } from '@/types';

const ROLES: JobRole[] = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst',
  'Data Scientist', 'AI Engineer', 'Cloud Engineer', 'DevOps Engineer', 'Custom Role',
];
const DIFFICULTIES: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];
const TYPES: InterviewType[] = ['Technical', 'HR', 'Behavioral', 'Mixed'];
const MODES: { value: InterviewMode; label: string; desc: string }[] = [
  { value: 'text', label: 'Text', desc: 'Type your answers' },
  { value: 'voice', label: 'Voice', desc: 'Speak with the AI interviewer' },
  { value: 'coding', label: 'Coding', desc: 'Live coding challenges' },
];

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition ${
        active ? 'border-primary-500 bg-primary-500/15 text-white' : 'border-border bg-white/5 text-white/60 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}

function NewInterviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('resumeId') ?? undefined;
  const { firebaseUid } = useAuthStore();
  const { setActiveInterview, setConfig } = useInterviewStore();

  const [role, setRole] = useState<JobRole>('Full Stack Developer');
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [type, setType] = useState<InterviewType>('Mixed');
  const [mode, setMode] = useState<InterviewMode>('text');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startInterview = async () => {
    if (!firebaseUid) return;
    setLoading(true);
    setError(null);

    const config: InterviewConfig = {
      role,
      customRoleTitle: role === 'Custom Role' ? customRoleTitle : undefined,
      difficulty,
      type,
      mode,
      questionCount: mode === 'coding' ? 1 : 10,
      resumeId,
    };

    try {
      if (mode === 'coding') {
        setConfig(config);
        router.push('/interview/coding/new');
        return;
      }

      const token = await getAuthToken();
      const res = await fetch('/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ config, resumeId }),
      });
      if (!res.ok) throw new Error('Failed to generate questions');
      const { questions } = await res.json();

      const interview: Interview = {
        id: `interview_${Date.now()}`,
        userId: firebaseUid,
        config,
        questions,
        answers: [],
        status: 'in_progress',
        createdAt: new Date().toISOString(),
      };
      await createInterview(interview);
      setActiveInterview(interview);

      router.push(mode === 'voice' ? `/interview/voice/${interview.id}` : `/interview/${interview.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-2xl font-semibold text-white">Set up your interview</h1>
      <p className="mt-1 text-sm text-white/50">Choose a role, difficulty, and format.</p>

      <GlassPanel className="mt-8 space-y-7 p-6">
        <div>
          <p className="mb-2 text-sm font-medium text-white/70">Job role</p>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => <Pill key={r} active={role === r} onClick={() => setRole(r)}>{r}</Pill>)}
          </div>
          {role === 'Custom Role' && (
            <Input
              className="mt-3"
              placeholder="e.g. Site Reliability Engineer"
              value={customRoleTitle}
              onChange={(e) => setCustomRoleTitle(e.target.value)}
            />
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-white/70">Difficulty</p>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => <Pill key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>{d}</Pill>)}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-white/70">Interview type</p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => <Pill key={t} active={type === t} onClick={() => setType(t)}>{t}</Pill>)}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-white/70">Format</p>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMode(m.value)}
                className={`rounded-xl border p-3 text-left transition ${
                  mode === m.value ? 'border-primary-500 bg-primary-500/15' : 'border-border bg-white/5 hover:bg-white/10'
                }`}
              >
                <p className="text-sm font-medium text-white">{m.label}</p>
                <p className="mt-0.5 text-xs text-white/40">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button className="w-full" size="lg" onClick={startInterview} loading={loading}>
          {loading ? 'Preparing your interview…' : (
            <>Start interview <ArrowRight className="h-4 w-4" /></>
          )}
        </Button>
      </GlassPanel>
    </div>
  );
}