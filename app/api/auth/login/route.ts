import { supabase, verifyPassword, logActivity, createSession, hashPassword } from '@/lib/auth';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { setSessionCookie, setRefreshTokenCookie } from '@/lib/cookies'; // ADD THIS LINE
import { headers } from 'next/headers';

// Rate limiting
const loginAttempts = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);

  if (!attempt || now > attempt.reset) {
    loginAttempts.set(ip, { count: 1, reset: now + 15 * 60 * 1000 });
    return true;
  }

  if (attempt.count >= 5) {
    return false;
  }

  attempt.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for') || '';
    const ip = forwardedFor.split(',')[0].trim() || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || '';

    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password, apiKey } = body;

    if (apiKey) {
      // API Key Login
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, username, is_active, is_banned')
        .eq('api_key', apiKey)
        .single();

      if (userError || !user) {
        return Response.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }

      if (user.is_banned) {
        await logActivity(user.id, 'LOGIN_ATTEMPT_BANNED', { ip, userAgent });
        return Response.json({ error: 'Account suspended' }, { status: 403 });
      }

      if (!user.is_active) {
        await logActivity(user.id, 'LOGIN_ATTEMPT_INACTIVE', { ip, userAgent });
        return Response.json({ error: 'Account inactive' }, { status: 403 });
      }

      // Create session
      const refreshToken = await generateRefreshToken(user.id, user.username, 'temp');
      const refreshTokenHash = await hashPassword(refreshToken);
      const sessionId = await createSession(user.id, refreshTokenHash, ip, userAgent);

      // Generate tokens
    const accessToken = await generateAccessToken(user.id, user.username, sessionId);
    const newRefreshToken = await generateRefreshToken(user.id, user.username, sessionId);

    // Set server-side cookies
    await setSessionCookie(sessionId, accessToken);
    await setRefreshTokenCookie(newRefreshToken);

    // Log success
    await logActivity(user.id, 'LOGIN_SUCCESS_APIKEY', { ip, userAgent });

      return Response.json({
        accessToken,
        refreshToken: newRefreshToken,
        token: accessToken, // Added for compatibility with frontend
        userId: user.id,
        username: user.username,
        expiresIn: 604800,
      });
    }

    if (!username || !password) {
      return Response.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, password_hash, is_active, is_banned')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (user.is_banned) {
      await logActivity(user.id, 'LOGIN_ATTEMPT_BANNED', { ip, userAgent });
      return Response.json(
        { error: 'Account suspended' },
        { status: 403 }
      );
    }

    if (!user.is_active) {
      await logActivity(user.id, 'LOGIN_ATTEMPT_INACTIVE', { ip, userAgent });
      return Response.json(
        { error: 'Account inactive' },
        { status: 403 }
      );
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      await logActivity(user.id, 'LOGIN_FAILED', { ip, userAgent });
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session
    const refreshToken = await generateRefreshToken(user.id, user.username, 'temp');
    const refreshTokenHash = await hashPassword(refreshToken);
    const sessionId = await createSession(user.id, refreshTokenHash, ip, userAgent);

    // Generate tokens
    const accessToken = await generateAccessToken(user.id, user.username, sessionId);
    const newRefreshToken = await generateRefreshToken(user.id, user.username, sessionId);

    // Set server-side cookies
    await setSessionCookie(sessionId, accessToken);
    await setRefreshTokenCookie(newRefreshToken);

    // Log success
    await logActivity(user.id, 'LOGIN_SUCCESS', { ip, userAgent });

    return Response.json({
      accessToken,
      refreshToken: newRefreshToken,
      token: accessToken, // Added for compatibility with frontend
      userId: user.id,
      username: user.username,
      expiresIn: 604800, // 7 days in seconds
    });
  } catch (error) {
    console.error('[v0] Login error:', error);
    return Response.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
