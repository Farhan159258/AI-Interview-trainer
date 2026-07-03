import { NextRequest, NextResponse } from 'next/server';
import { requireAuthedUser, handleApiError } from '@/lib/apiAuth';
import { transcribeAudio } from '@/services/openai';

export const runtime = 'nodejs';

// Fallback transcription endpoint — used when the browser's Web Speech API
// is unavailable or unreliable. The client records audio and posts it here.
export async function POST(req: NextRequest) {
  try {
    await requireAuthedUser(req);
    const formData = await req.formData();
    const file = formData.get('audio');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio file too large (max 10MB)' }, { status: 400 });
    }

    const text = await transcribeAudio(file);
    return NextResponse.json({ text });
  } catch (err) {
    return handleApiError(err);
  }
}
