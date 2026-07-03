import { NextRequest, NextResponse } from 'next/server';
import { requireAuthedUser, handleApiError } from '@/lib/apiAuth';
import { codeReviewSchema } from '@/lib/validation';
import { reviewCode } from '@/services/evaluationService';

export async function POST(req: NextRequest) {
  try {
    await requireAuthedUser(req);
    const body = codeReviewSchema.parse(await req.json());
    const review = await reviewCode(body.challengeDescription, body.language, body.code);
    return NextResponse.json({ review });
  } catch (err) {
    return handleApiError(err);
  }
}
