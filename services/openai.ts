// Thin, typed wrapper around the OpenAI SDK. Server-only.
import OpenAI from 'openai';

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set. Add it to .env.local');
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
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
  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: params.model ?? process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
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

export async function transcribeAudio(file: File): Promise<string> {
  const openai = getOpenAIClient();
  const result = await openai.audio.transcriptions.create({
    file,
    model: process.env.OPENAI_WHISPER_MODEL ?? 'whisper-1',
  });
  return result.text;
}

export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  const openai = getOpenAIClient();
  const response = await openai.audio.speech.create({
    model: process.env.OPENAI_TTS_MODEL ?? 'tts-1',
    voice: (process.env.OPENAI_TTS_VOICE as any) ?? 'alloy',
    input: text,
  });
  return response.arrayBuffer();
}
