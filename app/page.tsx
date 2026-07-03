'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Mic,
  Code2,
  FileText,
  BarChart3,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Badge } from '@/components/ui/Badge';

const FEATURES = [
  {
    icon: FileText,
    title: 'Resume-aware questions',
    body: 'Upload your resume and the AI builds questions from your actual projects, skills, and experience — not a generic bank.',
  },
  {
    icon: Mic,
    title: 'Voice interviews',
    body: 'The AI interviewer asks questions out loud and listens to your spoken answers, with live transcription you can edit before submitting.',
  },
  {
    icon: Code2,
    title: 'Coding interviews',
    body: 'Solve DSA and role-specific coding challenges in a real editor, then get an AI code review on correctness, efficiency, and complexity.',
  },
  {
    icon: BarChart3,
    title: 'Score breakdowns',
    body: 'Every answer is scored on substance — strengths, gaps, and a stronger sample answer — plus a full recruiter-style report at the end.',
  },
  {
    icon: Trophy,
    title: 'Gamified progress',
    body: 'Earn XP, keep your streak alive, and unlock badges as you build a consistent interview practice habit.',
  },
  {
    icon: Radio,
    title: 'A 7-day improvement plan',
    body: 'The coach reads your weak spots across interviews and builds a concrete, day-by-day plan to close the gaps.',
  },
];

const STEPS = [
  { label: 'Upload your resume', body: 'Or skip straight to picking a role and difficulty.' },
  { label: 'Choose your format', body: 'Text, voice, or a live coding round — technical, HR, or behavioral.' },
  { label: 'Answer in real time', body: 'The AI asks natural follow-ups the way a real interviewer would.' },
  { label: 'Get your report', body: 'Scores, feedback, and a plan for what to practice next.' },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* ---------------- Hero ---------------- */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 md:grid-cols-2 md:pt-24">
        <div className="flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge tone="accent">AI-powered mock interviews</Badge>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] text-white md:text-5xl">
              Rehearse the interview
              <br />
              before it counts.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/60">
              An AI interviewer that reads your resume, asks questions out loud, listens to your
              answers, and tells you exactly what a real recruiter would think — before you're in
              the room.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button size="lg">
                  Start practicing free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary">I have an account</Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-5 text-xs text-white/40">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Voice + coding rounds</span>
            </div>
          </motion.div>
        </div>

        {/* Signature element: a live "interview in progress" panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative flex items-center justify-center"
        >
          <GlassPanel className="w-full max-w-md p-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-danger" />
                <span className="text-xs font-medium text-white/50">Live · Full Stack Developer · Advanced</span>
              </div>
              <span className="text-xs text-white/30">04:12</span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs font-medium text-primary-300">AI Interviewer</p>
                <p className="mt-1.5 text-sm text-white/80">
                  Your resume mentions a Next.js + Firebase project — walk me through how you
                  handled auth state across server and client components.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3">
                <div className="flex gap-0.5">
                  {[6, 14, 9, 18, 7, 12, 5].map((h, i) => (
                    <motion.span
                      key={i}
                      className="w-0.5 rounded-full bg-accent"
                      animate={{ height: [h, h * 1.6, h] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.08 }}
                      style={{ height: h }}
                    />
                  ))}
                </div>
                <span className="text-xs text-accent/80">Listening…</span>
              </div>

              <div className="rounded-xl bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-white/50">Answer evaluation</p>
                  <span className="font-display text-sm font-semibold text-success">8.4 / 10</span>
                </div>
                <p className="mt-1.5 text-xs text-white/50">
                  Strong grasp of the auth flow — mention token refresh edge cases next time.
                </p>
              </div>
            </div>
          </GlassPanel>
        </motion.div>
      </section>

      {/* ---------------- Features ---------------- */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 max-w-lg">
          <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">
            Everything a real interview loop throws at you
          </h2>
          <p className="mt-3 text-sm text-white/50">
            Resume screen, behavioral round, technical deep-dive, and a coding round — practiced
            end to end, scored like it matters.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <GlassPanel className="h-full p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/15 text-primary-300">
                  <f.icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="mt-4 font-display text-sm font-semibold text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/50">{f.body}</p>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">How a session runs</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.label} className="relative">
              <span className="font-display text-3xl font-semibold text-white/10">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 text-sm font-semibold text-white">{s.label}</h3>
              <p className="mt-1 text-sm text-white/50">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <GlassPanel className="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <h2 className="font-display text-2xl font-semibold text-white md:text-3xl">
            Your next interview shouldn't be the first rep.
          </h2>
          <p className="max-w-md text-sm text-white/50">
            Run a full mock interview in the next five minutes — resume upload optional.
          </p>
          <Link href="/register">
            <Button size="lg">Start practicing free <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </GlassPanel>
      </section>
    </div>
  );
}
