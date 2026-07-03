import { NextRequest, NextResponse } from 'next/server';
import { requireAuthedUser, handleApiError } from '@/lib/apiAuth';
import { extractTextFromPDF, structureResume } from '@/services/resumeParser';
import { adminDb } from '@/firebase/admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthedUser(req);
    const formData = await req.formData();
    const file = formData.get('resume');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No resume file provided' }, { status: 400 });
    }
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF resumes are supported' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await extractTextFromPDF(buffer);
    const parsed = await structureResume(rawText, user.uid, file.name);

    await adminDb.collection('resumes').doc(parsed.id).set(parsed);

    return NextResponse.json({ resume: parsed });
  } catch (err) {
    return handleApiError(err);
  }
}
