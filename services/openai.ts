// AI provider wrapper — server-only.
//
// Chat completions and speech-to-text default to Groq, which is free
// (generous rate-limited free tier, no expiring trial credit) and
// OpenAI-API-compatible, so we can keep using the `openai` npm SDK just
// pointed at a different base URL. Text-to-speech has no solid free
// equivalent, so it stays optional — if no TTS key is configured, the
// voice interview UI automatically falls back to the browser's built-in
// SpeechSynthesis API (see hooks/useTextToSpeech.ts).
import OpenAI from 'openai';

let chatClient: OpenAI | null = null;
let ttsClient: OpenAI | null = null;

/**
 * Client used for chat completions (question generation, evaluation,
 * resume parsing, coaching) and for transcription. Defaults to Groq.
 * To use OpenAI instead, set AI_PROVIDER=openai in .env.local.
 */
function getChatClient(): OpenAI {
  const provider = process.env.AI_PROVIDER ?? 'groq';
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'AI_API_KEY is not set. Get a free key from console.groq.com (default provider) and add it to .env.local.'
    );
  }

  if (!chatClient) {
    chatClient = new OpenAI({
      apiKey,
      baseURL: provider === 'openai' ? undefined : process.env.AI_BASE_URL ?? 'https://api.groq.com/openai/v1',
    });
  }
  return chatClient;
}

function getDefaultChatModel(): string {
  return process.env.AI_CHAT_MODEL ?? 'llama-3.3-70b-versatile';
}

function getDefaultTranscriptionModel(): string {
  return process.env.AI_WHISPER_MODEL ?? 'whisper-large-v3';
}

/**
 * Calls the Chat Completions API and forces a JSON object response.
 * Throws if the model does not return valid JSON.
 */
export async function chatJSON<T>(params: {
  system: string;
  user: string;
  temperature?: number;
  model?: string;
}): Promise<T> {
  const client = getChatClient();
  const completion = await client.chat.completions.create({
    model: params.model ?? getDefaultChatModel(),
    temperature: params.temperature ?? 0.7,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: params.system },
      { role: 'user', content: params.user },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    throw new Error(`Model did not return valid JSON: ${raw.slice(0, 200)}`);
  }
}

/**
 * Speech-to-text fallback for when the browser's Web Speech API is
 * unavailable. Groq serves whisper-large-v3 for free, same request shape
 * as OpenAI's Whisper endpoint.
 */
export async function transcribeAudio(file: File): Promise<string> {
  const client = getChatClient();
  const result = await client.audio.transcriptions.create({
    file,
    model: getDefaultTranscriptionModel(),
  });
  return result.text;
}

/**
 * Text-to-speech is optional and OpenAI-only (no equivalent free tier
 * elsewhere as of writing). Set OPENAI_TTS_API_KEY to enable it — if
 * unset, callers should catch the thrown error and let the client fall
 * back to the browser's SpeechSynthesis API instead.
 */
export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  const apiKey = process.env.OPENAI_TTS_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENAI_TTS_API_KEY is not set — TTS is disabled. The client will fall back to browser speech synthesis.'
    );
  }
  if (!ttsClient) {
    ttsClient = new OpenAI({ apiKey });
  }
  const response = await ttsClient.audio.speech.create({
    model: process.env.OPENAI_TTS_MODEL ?? 'tts-1',
    voice: (process.env.OPENAI_TTS_VOICE as any) ?? 'alloy',
    input: text,
  });
  return response.arrayBuffer();
}