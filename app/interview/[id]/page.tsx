'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getAuthToken } from '@/hooks/useAuth';
import { getInterview, updateInterview } from '@/firebase/firestore';
import type { Interview, InterviewQuestion } from '@/types';

export default function TextInterviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getInterview(id);
      setInterview(data);
      setIndex(data?.answers.length ?? 0);
    })();
  }, [id]);

  if (!interview) {
    return <div className="mx-auto max-w-2xl px-6 py-16 text-center text-white/40">Loading interview…</div>;
  }

  const question: InterviewQuestion | undefined = interview.questions[index];
  const isLast = index >= interview.questions.length - 1;

  const submitAnswer = async () => {
    if (!question || !answer.trim()) return;
    setSubmitting(true);
    setLastScore(null);
    try {
      const token = await getAuthToken();
      const roleLabel = interview.config.role === 'Custom Role' ? interview.config.customRoleTitle ?? 'Software Engineer' : interview.config.role;

      const res = await fetch('/api/answers/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          interviewId: interview.id,
          questionId: question.id,
          question: question.text,
          answer,
          role: roleLabel,
          difficulty: interview.config.difficulty,
        }),
      });
      if (!res.ok) throw new Error('Evaluation failed');
      const { evaluation, followUp } = await res.json();

      const updatedAnswers = [
        ...interview.answers,
        { questionId: question.id, transcript: answer, submittedAt: new Date().toISOString(), evaluation },
      ];
      const updatedQuestions = followUp ? [...interview.questions, followUp] : interview.questions;

      const updated = { ...interview, answers: updatedAnswers, questions: updatedQuestions };
      setInterview(updated);
      await updateInterview(interview.id, { answers: updatedAnswers, questions: updatedQuestions });

      setLastScore(evaluation.score);
      setAnswer('');

      setTimeout(() => {
        setLastScore(null);
        if (index < updatedQuestions.length - 1) {
          setIndex(index + 1);
        } else {
          finishInterview(updated);
        }
      }, 1400);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const finishInterview = async (finalInterview: Interview) => {
    const token = await getAuthToken();
    const res = await fetch('/api/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ interviewId: finalInterview.id }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error('[Report generation] failed:', body.error);
      // Navigate anyway — the results page detects a missing report and
      // offers a "Retry" button rather than trapping the person here.
    }
    router.push(`/results/${finalInterview.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Badge tone="accent">{interview.config.type} · {interview.config.difficulty}</Badge>
        <span className="text-xs text-white/40">Question {index + 1} of {interview.questions.length}</span>
      </div>

      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full bg-primary-500"
          animate={{ width: `${((index + 1) / interview.questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question?.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <GlassPanel className="p-6">
            {question?.isFollowUp && <Badge tone="accent" className="mb-3">Follow-up</Badge>}
            <p className="text-xs font-medium text-primary-300">AI Interviewer</p>
            <p className="mt-2 text-base leading-relaxed text-white">{question?.text}</p>
          </GlassPanel>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={6}
          placeholder="Type your answer here…"
          className="w-full rounded-xl border border-border bg-white/5 p-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
        />
      </div>

      <AnimatePresence>
        {lastScore !== null && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 rounded-lg bg-success/10 px-4 py-2 text-sm text-success"
          >
            Scored {lastScore}/10 — moving to the next question…
          </motion.div>
        )}
      </AnimatePresence>

      <Button className="mt-4 w-full" size="lg" onClick={submitAnswer} loading={submitting} disabled={!answer.trim()}>
        {submitting ? 'Evaluating…' : (
          <>{isLast ? 'Submit final answer' : 'Submit answer'} <Send className="h-4 w-4" /></>
        )}
      </Button>
    </div>
  );
}