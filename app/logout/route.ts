import { NextResponse } from 'next/server';
import { deleteSessionCookies } from '@/features/user/session';

export function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/login', request.url));
  deleteSessionCookies(response.cookies);
  return response;
}
