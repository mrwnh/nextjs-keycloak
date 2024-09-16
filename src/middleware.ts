import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isAuthenticated = request.cookies.get('admin_authenticated');

  if (isAdminRoute && !isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/registrations', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};