import { NextRequest, NextResponse } from 'next/server';

// Lightweight route guard: redirects unauthenticated users away from
// protected pages. Real auth verification happens client-side via
// Firebase's onAuthStateChanged (see hooks/useAuth.ts) and server-side
// in API routes via firebase/admin.ts — this middleware only improves UX
// by avoiding a flash of protected content, using a cookie set on login.
const PROTECTED_PATHS = [
  '/dashboard',
  '/resume',
  '/interview',
  '/results',
  '/history',
  '/analytics',
  '/profile',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const session = req.cookies.get('session_active');
  if (!session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/resume/:path*', '/interview/:path*', '/results/:path*', '/history/:path*', '/analytics/:path*', '/profile/:path*'],
};
