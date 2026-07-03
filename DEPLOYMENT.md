# Deployment Guide

## 1. Firebase project setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication** → Sign-in method → enable **Email/Password**.
3. **Firestore Database** → Create database → start in production mode.
4. **Project settings → General** → add a Web App → copy the config into `NEXT_PUBLIC_FIREBASE_*` env vars.
5. **Project settings → Service accounts** → Generate new private key → download the JSON.
   - Minify it to one line and set it as `FIREBASE_SERVICE_ACCOUNT_KEY`, **or** base64-encode it:
     ```bash
     base64 -i serviceAccountKey.json | tr -d '\n' > serviceAccountKey.b64
     ```
     and paste that string instead — `firebase/admin.ts` accepts either format.
   - **Never commit this file.** It's already in `.gitignore`.
6. Deploy security rules and indexes:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add   # select your project
   firebase deploy --only firestore:rules,firestore:indexes
   ```

## 2. AI provider setup (free by default)

This app uses **Groq** by default for question generation, answer evaluation, resume
parsing, coaching, and voice transcription — it's free, has no expiring trial credit, and
its API is OpenAI-compatible, so no code changes are needed to use it.

1. Create a free account at [console.groq.com](https://console.groq.com) → **API Keys** → create a key.
2. Set in `.env.local`:
   ```
   AI_PROVIDER=groq
   AI_API_KEY=gsk_...
   AI_BASE_URL=https://api.groq.com/openai/v1
   AI_CHAT_MODEL=llama-3.3-70b-versatile
   AI_WHISPER_MODEL=whisper-large-v3
   ```
3. That's it — no billing setup required. Groq's free tier is rate-limited (requests per
   minute), not paid, so if you hit a 429 during heavy testing, wait a minute and retry.

**Text-to-speech is the one piece with no solid free equivalent.** By default it's
disabled and the voice interview page automatically falls back to the browser's built-in
`SpeechSynthesis` API — no key, no cost, works out of the box in Chrome/Edge/Safari. If you
want the more natural OpenAI TTS voice instead, add a paid OpenAI key:
```
OPENAI_TTS_API_KEY=sk-...
```

**Switching to OpenAI for everything instead (paid):**
```
AI_PROVIDER=openai
AI_API_KEY=sk-...
AI_CHAT_MODEL=gpt-4o-mini
AI_WHISPER_MODEL=whisper-1
```

## 3. (Optional) Code execution sandbox

The coding-interview editor works fully for writing code and getting an **AI review** without this. If you also want to actually *run* submitted code, wire up a sandboxed execution provider (e.g. [Judge0](https://judge0.com/) or [Piston](https://github.com/engineer-man/piston)) and set:

```
CODE_EXEC_API_URL=https://your-judge0-or-piston-endpoint
```

## 4. Local development

```bash
git clone <your-repo-url>
cd ai-interview-trainer
npm install
cp .env.example .env.local   # fill in the values from steps 1–2
npm run seed                 # optional: seeds the achievements catalog
npm run dev
```

Visit `http://localhost:3000`.

## 5. Deploy to Vercel

1. Push the repo to GitHub.
2. In [vercel.com](https://vercel.com), **Add New Project** → import the repo.
3. Framework preset: **Next.js** (auto-detected).
4. Add every variable from `.env.example` under **Settings → Environment Variables** (Production + Preview).
   - For `FIREBASE_SERVICE_ACCOUNT_KEY`, paste the base64 string — multi-line JSON can break Vercel's env var UI.
5. Deploy.
6. Back in Firebase console → Authentication → Settings → **Authorized domains** → add your `*.vercel.app` domain (and any custom domain).

## 6. Post-deploy checklist

- [ ] Register a test account and confirm login/logout/forgot-password all work.
- [ ] Upload a sample PDF resume and confirm parsing succeeds.
- [ ] Run one full text interview end-to-end and confirm a report generates.
- [ ] Test the voice interview mode in Chrome (best Web Speech API support) and confirm the Whisper fallback path (`/api/voice/transcribe`) if you disable mic permissions.
- [ ] Confirm Firestore security rules are deployed (`firebase deploy --only firestore:rules`) — without them, a signed-in user could read other users' documents.
- [ ] Set a billing alert in both the Firebase and OpenAI dashboards.

## Environment variables reference

See `.env.example` for the full list with inline comments.