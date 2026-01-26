import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes in production
  if (pathname.startsWith('/admin')) {
    const isProduction = process.env.NODE_ENV === 'production';

    // In production, check for valid admin token
    if (isProduction) {
      const token = request.cookies.get('admin_token')?.value;

      // Allow login page without token
      if (pathname === '/admin/login') {
        // If already has token, redirect to dashboard
        if (token) {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.next();
      }

      // For all other admin routes, require token
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
  }

  // Protect /api/admin routes
  if (pathname.startsWith('/api/admin')) {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      const token = request.cookies.get('admin_token')?.value;

      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access only' },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
