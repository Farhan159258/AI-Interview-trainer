import { NextRequest, NextResponse } from 'next/server';
import { requireAuthedUser, handleApiError } from '@/lib/apiAuth';
import { generateQuestionsSchema } from '@/lib/validation';
import { generateInterviewQuestions } from '@/services/interviewService';
import { adminDb } from '@/firebase/admin';
import type { ParsedResume } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthedUser(req);
    const body = generateQuestionsSchema.parse(await req.json());

    let resume: ParsedResume | null = null;
    if (body.resumeId) {
      const snap = await adminDb.collection('resumes').doc(body.resumeId).get();
      if (snap.exists && snap.data()?.userId === user.uid) {
        resume = snap.data() as ParsedResume;
      }
    }

    const questions = await generateInterviewQuestions(body.config, resume);
    return NextResponse.json({ questions });
  } catch (err) {
    return handleApiError(err);
  }
}
