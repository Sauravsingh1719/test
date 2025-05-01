import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export { default } from 'next-auth/middleware';

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
  const token = await getToken({ req: request });
  const url = request.nextUrl;
  const role = token?.role as 'admin' | 'teacher' | 'student' | undefined;

 
  if (token && (url.pathname.startsWith('/sign-in') || 
      url.pathname.startsWith('/sign-up') || 
      url.pathname === '/') {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }

  
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

  
  if (url.pathname.startsWith('/tests') && !token) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

 
  if (url.pathname.startsWith('/tests/results')) {
    return NextResponse.next();
  }

  
  if (!token && (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/teacher') ||
    url.pathname.startsWith('/student') ||
    url.pathname.startsWith('/tests')
  )) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}