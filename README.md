# AI Interview Trainer

An AI-powered mock interview platform: upload a resume, run text, voice, or live-coding
interviews against an AI interviewer, get scored feedback per answer, a recruiter-style
final report, and a personalized 7-day improvement plan.

Built with Next.js 15 (App Router) + TypeScript, Firebase (Auth + Firestore), and the
OpenAI API (GPT for questions/evaluation, Whisper for speech-to-text, TTS for the
interviewer's voice).

## Features

- **Auth** — email/password registration, login, logout, password reset, protected routes, session persistence (Firebase Authentication).
- **Resume analysis** — PDF upload → skill/technology/project extraction → resume-grounded question generation.
- **Mock interviews** — role, difficulty, and interview type (Technical / HR / Behavioral / Mixed), 10–15 dynamic questions with AI-generated follow-ups.
- **Voice interviews** — the AI interviewer speaks questions (OpenAI TTS, browser fallback) and listens via the Web Speech API (Whisper fallback), with an editable live transcript.
- **Coding interviews** — Monaco-powered editor across 5 languages, AI code review (correctness/efficiency/readability, complexity analysis, alternative solutions).
- **Evaluation** — every answer scored 1–10 with strengths, weaknesses, missing concepts, and a model answer.
- **Final report** — overall / technical / communication / confidence / problem-solving scores plus a recruiter-style hiring recommendation.
- **Learning coach** — skill-gap analysis and a concrete 7-day improvement plan built from your actual weak spots.
- **History & analytics** — searchable interview history, Recharts dashboards (trend, topic breakdown, frequency, coding performance).
- **Gamification** — XP, levels, streaks, and achievement badges.
- **Security** — Firestore rules scoped to `request.auth.uid`, server-only writes for scores/XP/reports, per-user API rate limiting, Zod request validation.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Zustand, React Hook Form + Zod, Recharts |
| Backend | Next.js Route Handlers (REST) |
| Auth & DB | Firebase Authentication, Firestore, Firestore Security Rules |
| AI | Groq (free, OpenAI-API-compatible) for chat + transcription by default — swappable to OpenAI. Optional OpenAI TTS, with automatic browser SpeechSynthesis fallback |
| Code editor | Monaco Editor |
| Deployment | Vercel |

## Getting started

```bash
npm install
cp .env.example .env.local   # see DEPLOYMENT.md for how to fill this in
npm run dev
```

Full setup (Firebase project, service account, OpenAI key, Firestore rules deploy) is in
[`DEPLOYMENT.md`](./DEPLOYMENT.md). API contract for every route is in [`API.md`](./API.md).
System design and data model are in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Project structure

```
app/
  (auth)/login, register, forgot-password    # public auth pages
  dashboard/                                  # stats, trend chart, recent interviews
  resume/                                     # resume upload + parsed preview
  interview/new/                              # role/difficulty/type/mode picker
  interview/[id]/                             # text interview session
  interview/voice/[id]/                       # voice interview session
  interview/coding/[id]/                      # coding interview session
  results/[id]/                               # final report + 7-day plan
  history/                                    # searchable interview history
  analytics/                                  # Recharts dashboards
  profile/                                    # profile, XP, badges
  api/                                        # all REST route handlers
components/
  ui/           # Button, Input, GlassPanel, Badge, ScoreRing
  dashboard/    # StatCard, PerformanceChart, RecentInterviews
  layout/       # Navbar, AuthProvider
firebase/       # client.ts, admin.ts, firestore.ts (typed CRUD helpers)
services/       # openai.ts + interviewService, evaluationService, resumeParser,
                # codingService, coachService — all OpenAI-calling business logic
hooks/          # useAuth, useSpeechRecognition, useTextToSpeech
store/          # Zustand: authStore, interviewStore
lib/            # rateLimit, apiAuth, validation (Zod), utils
types/          # shared TypeScript types
scripts/        # seed.ts — seeds the achievements catalog + sample data
firestore.rules, firestore.indexes.json, firebase.json
```

## Security notes

- Every API route verifies a Firebase ID token server-side (`firebase/admin.ts`) before doing anything.
- Per-user in-memory rate limiting (`lib/rateLimit.ts`) — swap for Redis/Upstash for multi-instance production.
- All request bodies are validated with Zod (`lib/validation.ts`); free-text fields are sanitized before being sent to the model or stored.
- Firestore rules deny client writes to `resumes`, `reports`, `analytics`, and the gamification fields on `users` — those are only ever written server-side, so a malicious client can't fabricate a score or grant itself XP.
- `/api/coding/execute` deliberately does **not** run arbitrary code in-process — see `DEPLOYMENT.md` for wiring up a real sandbox (Judge0/Piston).

## License

MIT — use this for your portfolio.
