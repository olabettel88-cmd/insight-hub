import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from '../jwt';
import { validateSession } from '../auth';

export async function authenticateRequest(request: NextRequest): Promise<{
  authenticated: boolean;
  user?: JWTPayload;
  error?: string;
}> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return { authenticated: false, error: 'No authorization header' };
  }

  const token = authHeader.replace('Bearer ', '');

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
