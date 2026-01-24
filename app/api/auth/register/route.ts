import { supabase, hashPassword, generateTelegramCode, logActivity } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
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
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

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

    // Check referral code if provided
    let referrerId = null;
    if (referralCode) {
      const { data: referrer } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .single();
      
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        api_key: apiKey,
        telegram_code: telegramCode,
        subscription_plan: 'free',
        daily_search_limit: 100,
        referrer_id: referrerId,
      })
      .select()
      .single();

    if (error) {
      console.error('[v0] Registration error:', error);
      return Response.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Log activity
    await logActivity(newUser.id, 'ACCOUNT_CREATED', {
      ip,
      userAgent,
      metadata: { username },
    });

    return Response.json({
      userId: newUser.id,
      apiKey: apiKey,
      token: apiKey,
    });
  } catch (error) {
    console.error('[v0] Registration error:', error);
    return Response.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
