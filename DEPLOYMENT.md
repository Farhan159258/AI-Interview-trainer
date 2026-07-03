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

## 2. OpenAI setup

1. Create an API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. Set `OPENAI_API_KEY`. Defaults use `gpt-4o-mini`, `tts-1`, and `whisper-1` — override via `OPENAI_MODEL` / `OPENAI_TTS_MODEL` / `OPENAI_WHISPER_MODEL` if you want different models.
3. Set usage limits/budget alerts in the OpenAI dashboard — this app calls the API on question generation, answer evaluation, resume parsing, coding review, and coaching, so cost scales with usage.

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
