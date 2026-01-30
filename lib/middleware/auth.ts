import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from '../jwt';
import { validateSession } from '../auth';

export async function authenticateRequest(request: NextRequest): Promise<{
  authenticated: boolean;
  user?: JWTPayload;
  error?: string;
}> {
  let token: string | undefined;

  // 1. Try Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    token = authHeader.replace('Bearer ', '');
  }

  // 2. If no header, try cookie
  if (!token) {
    const sessionCookie = request.cookies.get('pka_session');
    if (sessionCookie?.value) {
      try {
        const parsed = JSON.parse(sessionCookie.value);
        token = parsed.accessToken;
      } catch (e) {
        // Invalid cookie format
      }
    }
  }

  if (!token) {
    return { authenticated: false, error: 'No authorization header or valid session cookie' };
  }

  // Verify JWT
  const payload = await verifyToken(token);
  if (!payload) {
    return { authenticated: false, error: 'Invalid or expired token' };
  }

  // Validate session
  const sessionValid = await validateSession(payload.sessionId);
  if (!sessionValid) {
    return { authenticated: false, error: 'Session expired or invalid' };
  }

  return { authenticated: true, user: payload };
}
