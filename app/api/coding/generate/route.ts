import { NextRequest, NextResponse } from 'next/server';
import { requireAuthedUser, handleApiError } from '@/lib/apiAuth';
import { generateCodingChallenge } from '@/services/codingService';
import type { JobRole, Difficulty } from '@/types';

export async function POST(req: NextRequest) {
  try {
    await requireAuthedUser(req);
    const { role, difficulty } = (await req.json()) as { role: JobRole; difficulty: Difficulty };
    const challenge = await generateCodingChallenge(role, difficulty);
    return NextResponse.json({ challenge });
  } catch (err) {
    return handleApiError(err);
  }
}
