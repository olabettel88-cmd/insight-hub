import { verifyToken } from '@/lib/jwt';
import { invalidateSession, logActivity } from '@/lib/auth';
import { clearSessionCookies } from '@/lib/cookies';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || '';

    // Clear cookies regardless of auth header validity to ensure cleanup
    await clearSessionCookies();

    if (!authHeader) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await verifyToken(token);

    if (payload) {
      await invalidateSession(payload.sessionId);
      await logActivity(payload.userId, 'LOGOUT', { ip, userAgent });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[v0] Logout error:', error);
    return Response.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
