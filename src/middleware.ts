import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const config = {
  matcher: [
    '/admin/:path*',
    '/teacher/:path*',
    '/student/:path*',
    '/tests/:path*',
    '/sign-in',
    '/sign-up',
    '/',
  ],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET! });
  const url = request.nextUrl;
  const role = token?.role as 'admin' | 'teacher' | 'student' | undefined;

  // Redirect signed‐in users away from public routes
  if (
    token &&
    (
      url.pathname.startsWith('/sign-in') ||
      url.pathname.startsWith('/sign-up') ||
      url.pathname === '/'
    )  // ← closed this parenthesis
  ) {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }

  // Role‐based guards
  if (token) {
    if (url.pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    if (url.pathname.startsWith('/teacher') && role !== 'teacher') {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
    if (url.pathname.startsWith('/student') && role !== 'student') {
      return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
    }
  }

  // Require login for tests
  if (url.pathname.startsWith('/tests') && !token) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Always allow results page
  if (url.pathname.startsWith('/tests/results')) {
    return NextResponse.next();
  }

  // Block any other protected route if not authenticated
  if (
    !token &&
    (
      url.pathname.startsWith('/admin') ||
      url.pathname.startsWith('/teacher') ||
      url.pathname.startsWith('/student') ||
      url.pathname.startsWith('/tests')
    )
  ) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}
