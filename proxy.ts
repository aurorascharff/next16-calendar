import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/features/user/session';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = pathname === '/login' || pathname === '/logout' || pathname.startsWith('/book');
  const hasSession = request.cookies.has(SESSION_COOKIE);

  return !hasSession && !isPublic ? NextResponse.redirect(new URL('/login', request.url)) : NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
