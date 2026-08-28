import { NextResponse } from 'next/server';
import { dateKey } from '@/features/calendar/calendar-utils';
import { SESSION_COOKIE } from '@/features/user/session';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = pathname === '/login' || pathname.startsWith('/book');
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession && !isPublic) return NextResponse.redirect(new URL('/login', request.url));
  if (pathname === '/') return NextResponse.redirect(new URL(`/calendar/${dateKey(new Date())}`, request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
