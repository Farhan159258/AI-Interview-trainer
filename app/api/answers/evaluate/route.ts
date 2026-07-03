import { NextRequest, NextResponse } from 'next/server';
import { requireAuthedUser, handleApiError } from '@/lib/apiAuth';
import { evaluateAnswerSchema, sanitizeText } from '@/lib/validation';
import { evaluateAnswer } from '@/services/evaluationService';
import { generateFollowUpQuestion } from '@/services/interviewService';

export async function POST(req: NextRequest) {
  try {
    await requireAuthedUser(req);
    const body = evaluateAnswerSchema.parse(await req.json());
    const answer = sanitizeText(body.answer);

    const [evaluation, followUp] = await Promise.all([
      evaluateAnswer(body.question, answer, body.role, body.difficulty),
      generateFollowUpQuestion(body.question, answer),
    ]);

    return NextResponse.json({ evaluation, followUp });
  } catch (err) {
    return handleApiError(err);
  }
}
