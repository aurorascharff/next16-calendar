import { NextResponse } from 'next/server';
import { SESSION_COOKIE, STALE_SESSION_COOKIES } from '@/features/user/session';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = pathname === '/login' || pathname === '/logout' || pathname.startsWith('/book');
  const hasSession = request.cookies.has(SESSION_COOKIE);

  const response =
    !hasSession && !isPublic ? NextResponse.redirect(new URL('/login', request.url)) : NextResponse.next();

  for (const name of STALE_SESSION_COOKIES) {
    if (request.cookies.has(name)) response.cookies.delete(name);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
