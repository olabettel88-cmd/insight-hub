import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';

// Paths that require authentication
const PROTECTED_PATHS = ['/dashboard'];

// Paths that are only for non-authenticated users
const AUTH_PATHS = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if path is protected or auth
  const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  const isAuth = AUTH_PATHS.some(path => pathname.startsWith(path));
  
  // Skip if not a relevant path
  if (!isProtected && !isAuth) {
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get('pka_session');
  let isAuthenticated = false;
  
  if (sessionCookie) {
    try {
      const { accessToken } = JSON.parse(sessionCookie.value);
      const payload = await verifyToken(accessToken);
      if (payload) {
        isAuthenticated = true;
      }
    } catch (e) {
      // Invalid cookie format or token
    }
  }

  // Redirect logic
  if (isAuth && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // Optional: Add return URL
    // loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
