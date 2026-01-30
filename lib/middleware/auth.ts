import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from '../jwt';
import { validateSession } from '../auth';

export async function authenticateRequest(request: NextRequest): Promise<{
  authenticated: boolean;
  user?: JWTPayload;
  error?: string;
}> {
  // Try Authorization header first (for API clients)
  let token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  // If no header, try to get from cookies (for browser requests)
  if (!token) {
    const sessionCookie = request.cookies.get('pka_session')?.value;
    
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        token = parsed.accessToken; // Extract the accessToken from the cookie
      } catch {
        return { authenticated: false, error: 'Invalid session cookie' };
      }
    }
  }

  if (!token) {
    return { authenticated: false, error: 'No token provided' };
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
