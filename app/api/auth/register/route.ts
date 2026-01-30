import { supabase, hashPassword, generateTelegramCode, logActivity, createSession } from '@/lib/auth';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for') || '';
    const ip = forwardedFor.split(',')[0].trim() || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || '';
    
    const body = await request.json();
    const { username, password, referralCode } = body;

    // Validation
    if (!username || !password) {
      return Response.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if username exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (checkError) {
      console.error('[v0] Error checking existing user:', checkError);
    }

    if (existingUser) {
      return Response.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Generate API key
    const apiKey = `pka_${Buffer.from(username + Date.now() + Math.random()).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)}`;
    
    // Hash password
    const passwordHash = await hashPassword(password);
    const telegramCode = generateTelegramCode();

    console.log('[v0] Creating user with username:', username);

    // Create user (RLS allows INSERT for anyone)
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        api_key: apiKey,
        telegram_code: telegramCode,
        subscription_plan: 'free',
        daily_search_limit: 1,
        daily_searches_used: 0,
        is_active: true,
        is_banned: false,
      })
      .select()
      .single();

    if (error) {
      console.error('[v0] Registration error:', error);
      return Response.json(
        { error: 'Failed to create account', details: error.message },
        { status: 500 }
      );
    }

    console.log('[v0] User created successfully:', newUser.id);

    // Create session and generate tokens
    const refreshToken = await generateRefreshToken(newUser.id, newUser.username, 'temp');
    const refreshTokenHash = await hashPassword(refreshToken);
    const sessionId = await createSession(newUser.id, refreshTokenHash, ip, userAgent);

    const accessToken = await generateAccessToken(newUser.id, newUser.username, sessionId);
    const finalRefreshToken = await generateRefreshToken(newUser.id, newUser.username, sessionId);

    // Handle referral code if provided
    if (referralCode) {
      try {
        // Find the referrer
        const { data: referrer } = await supabase
          .from('users')
          .select('id, total_referrals')
          .eq('referral_code', referralCode)
          .maybeSingle();
        
        if (referrer) {
          // Update the new user with referred_by
          await supabase
            .from('users')
            .update({ referred_by: referrer.id })
            .eq('id', newUser.id);

          // Update referrer stats
          await supabase
            .from('users')
            .update({ 
              total_referrals: (referrer.total_referrals || 0) + 1 
            })
            .eq('id', referrer.id);
        }
      } catch (refError) {
        console.error('[v0] Referral error (non-blocking):', refError);
      }
    }

    // Log activity
    try {
      await logActivity(newUser.id, 'ACCOUNT_CREATED', {
        ip,
        userAgent,
        metadata: { username },
      });
    } catch (logError) {
      console.error('[v0] Activity logging error (non-blocking):', logError);
    }

    return Response.json({
      success: true,
      userId: newUser.id,
      username: newUser.username,
      apiKey: apiKey,
      accessToken,
      refreshToken: finalRefreshToken,
      token: accessToken,
      telegramCode: telegramCode,
    });
  } catch (error) {
    console.error('[v0] Registration error:', error);
    return Response.json(
      { error: 'An error occurred during registration', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
