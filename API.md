# API Documentation

All routes live under `app/api/` (Next.js Route Handlers) and are relative to your deployed origin.

Every protected route requires a Firebase ID token:

```
Authorization: Bearer <firebase-id-token>
```

Get a fresh token client-side with `getAuthToken()` from `hooks/useAuth.ts`. Tokens are verified server-side with the Firebase Admin SDK (`firebase/admin.ts`). Requests are also rate-limited per user (`RATE_LIMIT_REQUESTS_PER_MINUTE`, default 20/min).

---

## `POST /api/questions/generate`

Generates 5–15 interview questions, optionally grounded in a parsed resume.

**Body**
```json
{
  "config": {
    "role": "Full Stack Developer",
    "difficulty": "Intermediate",
    "type": "Mixed",
    "mode": "text",
    "questionCount": 10
  },
  "resumeId": "resume_abc123"
}
```

**Response `200`**
```json
{ "questions": [{ "id": "q_0", "text": "...", "category": "technical", "topic": "..." }] }
```

---

## `POST /api/answers/evaluate`

Scores a single answer and decides whether a follow-up question is warranted.

**Body**
```json
{
  "interviewId": "interview_123",
  "questionId": "q_0",
  "question": "...",
  "answer": "...",
  "role": "Full Stack Developer",
  "difficulty": "Intermediate"
}
```

**Response `200`**
```json
{
  "evaluation": {
    "score": 8,
    "strengths": ["..."],
    "weaknesses": ["..."],
    "missingConcepts": ["..."],
    "suggestedImprovements": ["..."],
    "sampleAnswer": "..."
  },
  "followUp": { "id": "fq_...", "text": "...", "category": "technical", "isFollowUp": true } 
}
```
`followUp` is `null` when no follow-up is warranted.

---

## `POST /api/resume/parse`

`multipart/form-data` upload. Field name: `resume` (PDF, max 5MB).

**Response `200`**
```json
{ "resume": { "id": "resume_...", "skills": ["..."], "technologies": ["..."], "projects": [], "experience": [], "summary": "..." } }
```

---

## `POST /api/voice/transcribe`

Fallback speech-to-text via OpenAI Whisper, used when the Web Speech API is unavailable. `multipart/form-data`, field name: `audio` (max 10MB).

**Response `200`**: `{ "text": "..." }`

---

## `POST /api/voice/speak`

Text-to-speech via OpenAI TTS. Returns raw `audio/mpeg` bytes (not JSON).

**Body**: `{ "text": "..." }` (max 2000 chars)

---

## `POST /api/coding/generate`

Generates a coding challenge for a role/difficulty.

**Body**: `{ "role": "Backend Developer", "difficulty": "Advanced" }`

**Response**: `{ "challenge": { "id": "...", "title": "...", "description": "...", "examples": [], "constraints": [], "starterCode": { "javascript": "...", ... } } }`

---

## `POST /api/coding/review`

AI review of submitted code.

**Body**
```json
{ "challengeDescription": "...", "language": "python", "code": "def solve():..." }
```

**Response**: `{ "review": { "correctnessScore": 8, "efficiencyScore": 7, "readabilityScore": 9, "timeComplexity": "O(n)", "spaceComplexity": "O(1)", "optimizationSuggestions": [], "alternativeSolutions": [], "overallFeedback": "..." } }`

---

## `POST /api/coding/execute`

Contract for an external code-execution sandbox (not implemented in-process for security reasons). Returns `501` until `CODE_EXEC_API_URL` is configured to point at a Judge0/Piston-compatible endpoint.

---

## `POST /api/reports/generate`

Generates the final `InterviewReport` for a completed interview and persists it.

**Body**: `{ "interviewId": "interview_123" }`

**Response**: `{ "report": { "overallScore": 82, "technicalScore": 85, "communicationScore": 78, "confidenceScore": 80, "problemSolvingScore": 83, "candidateSummary": "...", "strengths": [], "weaknesses": [], "hiringRecommendation": "Hire" } }`

---

## `POST /api/coach/plan`

Builds a personalized 7-day improvement plan from the user's last 10 interviews.

**Response**: `{ "plan": { "skillGaps": [], "weakTopics": [], "recommendations": [], "practiceQuestions": [], "sevenDayPlan": [{ "day": 1, "focus": "...", "tasks": [] }] } }`

---

## Error format

All errors return `{ "error": "message" }` with an appropriate status code:

| Status | Meaning |
|---|---|
| 400 | Invalid request body (Zod validation failed) |
| 401 | Missing/invalid Firebase ID token |
| 429 | Rate limit exceeded |
| 500 | Unexpected server/model error |
| 501 | Code execution sandbox not configured |
