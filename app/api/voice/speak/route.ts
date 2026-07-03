import { NextRequest, NextResponse } from 'next/server';
import { requireAuthedUser, handleApiError } from '@/lib/apiAuth';
import { synthesizeSpeech } from '@/services/openai';
import { sanitizeText } from '@/lib/validation';

export const runtime = 'nodejs';

// Converts interview question text to speech. Falls back to the browser's
// SpeechSynthesis API on the client if this call fails or is rate-limited.
export async function POST(req: NextRequest) {
  try {
    await requireAuthedUser(req);
    const { text } = await req.json();
    if (!text || typeof text !== 'string' || text.length > 2000) {
      return NextResponse.json({ error: 'Invalid text input' }, { status: 400 });
    }

    const audio = await synthesizeSpeech(sanitizeText(text));
    return new NextResponse(audio, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
