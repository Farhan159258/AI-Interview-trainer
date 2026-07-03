// Shared helper for API routes: verifies the Firebase ID token and applies
// per-user rate limiting. Use at the top of every protected route handler.
import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/firebase/admin';
import { checkRateLimit } from './rateLimit';

export async function requireAuthedUser(req: NextRequest) {
  const decoded = await verifyIdToken(req.headers.get('authorization'));
  const { allowed } = checkRateLimit(decoded.uid);
  if (!allowed) {
    throw new RateLimitError();
  }
  return decoded; // { uid, email, ... }
}

export class RateLimitError extends Error {
  constructor() {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
  }
}

export function handleApiError(err: unknown) {
  if (err instanceof RateLimitError) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
  }
  const message = err instanceof Error ? err.message : 'Unknown error';
  console.error('[API error]', message);
  if (message.includes('Authorization') || message.includes('token')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
}
