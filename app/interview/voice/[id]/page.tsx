'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Volume2, RotateCcw, Pause, Play, Check } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { getAuthToken } from '@/hooks/useAuth';
import { getInterview, updateInterview } from '@/firebase/firestore';
import type { Interview, InterviewQuestion } from '@/types';

export default function VoiceInterviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [index, setIndex] = useState(0);
  const [editableTranscript, setEditableTranscript] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const { isSupported, isListening, transcript, interimTranscript, start, stop, editTranscript } = useSpeechRecognition();
  const { speak, pause, resume, isPlaying, isPaused } = useTextToSpeech();

  useEffect(() => {
    (async () => {
      const data = await getInterview(id);
      setInterview(data);
      setIndex(data?.answers.length ?? 0);
    })();
  }, [id]);

  const question: InterviewQuestion | undefined = interview?.questions[index];

  useEffect(() => {
    if (question) speak(question.text);
    setEditableTranscript('');
  }, [question?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setEditableTranscript(transcript);
  }, [transcript]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      setSeconds(0);
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  if (!interview) {
    return <div className="mx-auto max-w-2xl px-6 py-16 text-center text-white/40">Loading interview…</div>;
  }

  const submitAnswer = async () => {
    if (!question || !editableTranscript.trim()) return;
    setSubmitting(true);
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
          answer: editableTranscript,
          role: roleLabel,
          difficulty: interview.config.difficulty,
        }),
      });
      const { evaluation, followUp } = await res.json();

      const updatedAnswers = [
        ...interview.answers,
        { questionId: question.id, transcript: editableTranscript, submittedAt: new Date().toISOString(), evaluation },
      ];
      const updatedQuestions = followUp ? [...interview.questions, followUp] : interview.questions;
      const updated = { ...interview, answers: updatedAnswers, questions: updatedQuestions };
      setInterview(updated);
      await updateInterview(interview.id, { answers: updatedAnswers, questions: updatedQuestions });

      if (index < updatedQuestions.length - 1) {
        setIndex(index + 1);
      } else {
        const finishToken = await getAuthToken();
        const finishRes = await fetch('/api/reports/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${finishToken}` },
          body: JSON.stringify({ interviewId: interview.id }),
        });
        if (!finishRes.ok) {
          const body = await finishRes.json().catch(() => ({}));
          console.error('[Report generation] failed:', body.error);
        }
        router.push(`/results/${interview.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Badge tone="accent">Voice interview</Badge>
        <span className="text-xs text-white/40">Question {index + 1} of {interview.questions.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={question?.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GlassPanel className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-primary-300">AI Interviewer</p>
                <p className="mt-2 text-base leading-relaxed text-white">{question?.text}</p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  onClick={() => question && speak(question.text)}
                  className="rounded-lg border border-border bg-white/5 p-2 hover:bg-white/10"
                  title="Replay question"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-white/60" />
                </button>
                {isPlaying && (
                  <button
                    onClick={isPaused ? resume : pause}
                    className="rounded-lg border border-border bg-white/5 p-2 hover:bg-white/10"
                    title={isPaused ? 'Resume' : 'Pause'}
                  >
                    {isPaused ? <Play className="h-3.5 w-3.5 text-white/60" /> : <Pause className="h-3.5 w-3.5 text-white/60" />}
                  </button>
                )}
              </div>
            </div>
            {isPlaying && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-primary-300">
                <Volume2 className="h-3.5 w-3.5" /> Speaking…
              </div>
            )}
          </GlassPanel>
        </motion.div>
      </AnimatePresence>

      <GlassPanel className="mt-4 flex flex-col items-center gap-4 p-8">
        {!isSupported && (
          <p className="text-center text-xs text-warn">
            Live transcription isn't supported in this browser — type your answer below instead.
          </p>
        )}

        <div className="relative">
          {isListening && (
            <span className="absolute inset-0 -m-2 animate-pulseRing rounded-full bg-danger/40" />
          )}
          <button
            onClick={isListening ? stop : start}
            disabled={!isSupported}
            className={`relative flex h-16 w-16 items-center justify-center rounded-full transition disabled:opacity-40 ${
              isListening ? 'bg-danger text-white' : 'bg-primary-500 text-white hover:bg-primary-600'
            }`}
          >
            {isListening ? <Square className="h-5 w-5" /> : <Mic className="h-6 w-6" />}
          </button>
        </div>

        <p className="text-xs text-white/40">
          {isListening ? `Recording… ${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}` : 'Tap to record your answer'}
        </p>

        <textarea
          value={editableTranscript + (interimTranscript ? ' ' + interimTranscript : '')}
          onChange={(e) => {
            setEditableTranscript(e.target.value);
            editTranscript(e.target.value);
          }}
          rows={5}
          placeholder="Your transcribed answer will appear here — you can edit it before submitting."
          className="w-full rounded-xl border border-border bg-white/5 p-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
        />
      </GlassPanel>

      <Button className="mt-4 w-full" size="lg" onClick={submitAnswer} loading={submitting} disabled={!editableTranscript.trim()}>
        {submitting ? 'Evaluating…' : <>Submit answer <Check className="h-4 w-4" /></>}
      </Button>
    </div>
  );
}