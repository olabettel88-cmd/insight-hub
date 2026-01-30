import { verifyToken, generateAccessToken, JWTPayload } from '@/lib/jwt';
import { validateSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return Response.json(
        { error: 'Refresh token required' },
        { status: 400 }
      );
    }

    // Verify refresh token
    const payload = await verifyToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      return Response.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Validate session
    const sessionValid = await validateSession(payload.sessionId);
    if (!sessionValid) {
      return Response.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = await generateAccessToken(
      payload.userId,
      payload.username,
      payload.sessionId
    );

    // Update session cookie
    await setSessionCookie(payload.sessionId, newAccessToken);

    return Response.json({
      accessToken: newAccessToken,
      expiresIn: 604800,
    });
  } catch (error) {
    console.error('[v0] Token refresh error:', error);
    return Response.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}
