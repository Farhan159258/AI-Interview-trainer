import { NextRequest, NextResponse } from 'next/server';
import { requireAuthedUser, handleApiError } from '@/lib/apiAuth';

// NOTE: Running arbitrary user-submitted code safely requires an isolated
// sandbox (e.g. Judge0, Piston, or a containerized worker) — executing code
// in the same process as the API is a security risk and is intentionally
// NOT done here. This route defines the contract your sandbox provider
// should fulfill; wire in Judge0/Piston by setting CODE_EXEC_API_URL.
export async function POST(req: NextRequest) {
  try {
    await requireAuthedUser(req);
    const { language, code, stdin } = await req.json();

    const execUrl = process.env.CODE_EXEC_API_URL;
    if (!execUrl) {
      return NextResponse.json(
        {
          error:
            'Code execution sandbox not configured. Set CODE_EXEC_API_URL to a Judge0/Piston-compatible endpoint.',
        },
        { status: 501 }
      );
    }

    const res = await fetch(execUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, code, stdin }),
    });
    const result = await res.json();
    return NextResponse.json(result);
  } catch (err) {
    return handleApiError(err);
  }
}
