import { NextRequest, NextResponse } from 'next/server';
import { requireAuthedUser, handleApiError } from '@/lib/apiAuth';
import { generateLearningPlan } from '@/services/coachService';
import { adminDb } from '@/firebase/admin';
import type { Interview } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthedUser(req);

    const snap = await adminDb
      .collection('interviews')
      .where('userId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const interviews = snap.docs.map((d) => d.data() as Interview);
    const plan = await generateLearningPlan(user.uid, interviews);

    await adminDb.collection('users').doc(user.uid).collection('plans').doc(plan.id).set(plan);

    return NextResponse.json({ plan });
  } catch (err) {
    return handleApiError(err);
  }
}
