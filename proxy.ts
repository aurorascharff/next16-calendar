import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/features/user/session'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = pathname === '/login' || pathname.startsWith('/book')
  const hasSession = request.cookies.has(SESSION_COOKIE)

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (hasSession && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
}
