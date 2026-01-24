import { supabase, verifyPassword, logActivity, hashPassword } from '@/lib/auth';
import { headers } from 'next/headers';

// Rate limiting: max 5 login attempts per IP per 15 minutes
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
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || '';

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password, apiKey } = body;

    if (!username && !password && !apiKey) {
      await logActivity('unknown', 'LOGIN_ATTEMPT_INVALID', { ip, userAgent });
      return Response.json(
        { error: 'Username and password or API key are required' },
        { status: 400 }
      );
    }

    let user;
    let userError;

    // Login with API key
    if (apiKey) {
      const { data: apiUser, error: apiError } = await supabase
        .from('users')
        .select('id, username, is_active, is_banned')
        .eq('api_key', apiKey)
        .single();

      user = apiUser;
      userError = apiError;
    } else {
      // Fetch user by username
      const { data: credUser, error: credError } = await supabase
        .from('users')
        .select('id, username, password_hash, is_active, is_banned')
        .eq('username', username)
        .single();

      user = credUser;
      userError = credError;
    }

    if (userError || !user) {
      await logActivity('unknown', 'LOGIN_ATTEMPT_INVALID_USER', { ip, userAgent });
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is banned
    if (user.is_banned) {
      await logActivity(user.id, 'LOGIN_ATTEMPT_BANNED_USER', { ip, userAgent });
      return Response.json(
        { error: 'This account has been suspended' },
        { status: 403 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      await logActivity(user.id, 'LOGIN_ATTEMPT_INACTIVE_USER', { ip, userAgent });
      return Response.json(
        { error: 'This account is not active' },
        { status: 403 }
      );
    }

    // Verify password if using credentials (not API key)
    if (!apiKey) {
      if (!password || !user.password_hash) {
        await logActivity(user.id, 'LOGIN_FAILED_INVALID_PASSWORD', { ip, userAgent });
        return Response.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const passwordValid = await verifyPassword(password, user.password_hash);
      if (!passwordValid) {
        await logActivity(user.id, 'LOGIN_FAILED_INVALID_PASSWORD', { ip, userAgent });
        return Response.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
    }

    // Generate token
    const token = Buffer.from(
      JSON.stringify({
        userId: user.id,
        username: user.username,
        iat: Date.now(),
      })
    ).toString('base64');

    // Log successful login
    await logActivity(user.id, 'LOGIN_SUCCESS', {
      ip,
      userAgent,
    });

    return Response.json({
      token,
      userId: user.id,
      username: user.username,
    });
  } catch (error) {
    console.error('[v0] Login error:', error);
    return Response.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
