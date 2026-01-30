import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';
import { createClient } from '@supabase/supabase-js';

// Paths that require authentication
const PROTECTED_PATHS = ['/dashboard'];

// Paths that are only for non-authenticated users
const AUTH_PATHS = ['/login', '/register'];

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if path is protected or auth
  const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  const isAuth = AUTH_PATHS.some(path => pathname.startsWith(path));
  const isApi = pathname.startsWith('/api/') && !pathname.startsWith('/api/auth') && !pathname.startsWith('/api/public');

  // Skip if not a relevant path
  if (!isProtected && !isAuth && !isApi) {
    return NextResponse.next();
  }

  // Check for API Key in headers for API routes
  if (isApi) {
    const apiKey = request.headers.get('x-api-key');
    if (apiKey) {
      if (!apiKey.startsWith('pka291_')) {
         return NextResponse.json({ error: 'Invalid API key format' }, { status: 401 });
      }

      // Verify API key in DB
      try {
        const { data: user, error } = await supabase
          .from('users')
          .select('id, is_active, is_banned')
          .eq('api_key', apiKey)
          .single();

        if (error || !user) {
          return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
        }

        if (user.is_banned) {
          return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
        }

        if (!user.is_active) {
          return NextResponse.json({ error: 'Account inactive' }, { status: 403 });
        }

        // Valid API key - allow request and pass user info
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', user.id);
        
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      } catch (err) {
        console.error('Middleware API check error:', err);
        return NextResponse.json({ error: 'Authentication check failed' }, { status: 500 });
      }
    }
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

  // Enforce auth for API routes
  if (isApi && !isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
