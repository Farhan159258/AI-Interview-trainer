import { NextRequest, NextResponse } from 'next/server';
import { requireAuthedUser, handleApiError } from '@/lib/apiAuth';
import { generateInterviewReport } from '@/services/evaluationService';
import { adminDb } from '@/firebase/admin';
import type { Interview } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthedUser(req);
    const { interviewId } = await req.json();
    if (!interviewId) {
      return NextResponse.json({ error: 'interviewId is required' }, { status: 400 });
    }

    const ref = adminDb.collection('interviews').doc(interviewId);
    const snap = await ref.get();
    if (!snap.exists || snap.data()?.userId !== user.uid) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    const interview = snap.data() as Interview;
    const report = await generateInterviewReport(interview);

    await adminDb.collection('reports').doc(report.id).set(report);
    await ref.update({ report, status: 'completed', completedAt: new Date().toISOString() });

    return NextResponse.json({ report });
  } catch (err) {
    return handleApiError(err);
  }
}
