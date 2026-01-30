import { createClient } from '@supabase/supabase-js';
import { generateSessionId } from './jwt';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

export function generateTelegramCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function generateApiKey(): string {
  // Using crypto.getRandomValues for better entropy
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  const randomString = Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return `pka291_${randomString}`;
}

// Create session
export async function createSession(
  userId: string,
  refreshTokenHash: string,
  ip: string,
  userAgent: string
): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  const { error } = await supabase.from('sessions').insert({
    session_id: sessionId,
    user_id: userId,
    refresh_token_hash: refreshTokenHash,
    ip_address: ip,
    user_agent: userAgent,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error('[v0] Session creation failed:', error);
    throw new Error('Failed to create session');
  }

  return sessionId;
}

// Validate session
export async function validateSession(sessionId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('sessions')
    .select('id, is_active, expires_at')
    .eq('session_id', sessionId)
    .single();

  if (error || !data || !data.is_active) {
    return false;
  }

  const expiresAt = new Date(data.expires_at);
  if (expiresAt < new Date()) {
    // Session expired, delete it
    await supabase.from('sessions').delete().eq('session_id', sessionId);
    return false;
  }

  // Update last activity
  await supabase
    .from('sessions')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('session_id', sessionId);

  return true;
}

// Invalidate session (logout)
export async function invalidateSession(sessionId: string): Promise<void> {
  await supabase
    .from('sessions')
    .update({ is_active: false })
    .eq('session_id', sessionId);
}

// Invalidate all user sessions
export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await supabase
    .from('sessions')
    .update({ is_active: false })
    .eq('user_id', userId);
}

// Get user sessions
export async function getUserSessions(userId: string) {
  const { data } = await supabase
    .from('sessions')
    .select('session_id, ip_address, user_agent, created_at, last_activity_at')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('last_activity_at', { ascending: false });

  return data || [];
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('admins')
      .select('id, is_admin')
      .eq('user_id', userId)
      .eq('is_admin', true)
      .single();
    return !!data;
  } catch {
    return false;
  }
}

export async function logActivity(
  userId: string,
  action: string,
  options: {
    ip?: string;
    userAgent?: string;
    endpoint?: string;
    queryString?: string;
    responseStatus?: number;
    responseTimeMs?: number;
    metadata?: Record<string, unknown>;
  } = {}
) {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action,
      ip_address: options.ip,
      user_agent: options.userAgent,
      endpoint: options.endpoint,
      query_string: options.queryString,
      response_status: options.responseStatus,
      response_time_ms: options.responseTimeMs,
      metadata: options.metadata || {},
    });
  } catch (error) {
    console.error('[v0] Activity logging failed:', error);
  }
}

export async function checkDailyLimit(userId: string): Promise<boolean> {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('daily_searches_used, daily_search_limit, last_search_reset')
      .eq('id', userId)
      .single();

    if (!user) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = new Date(user.last_search_reset);
    lastReset.setHours(0, 0, 0, 0);

    if (today > lastReset) {
      await supabase
        .from('users')
        .update({
          daily_searches_used: 1,
          last_search_reset: new Date().toISOString(),
        })
        .eq('id', userId);
      return true;
    }

    return user.daily_searches_used < (user.daily_search_limit || 1);
  } catch (error) {
    console.error('[v0] Daily limit check failed:', error);
    return false;
  }
}

export async function incrementSearchCount(userId: string) {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('daily_searches_used')
      .eq('id', userId)
      .single();

    if (user) {
      await supabase
        .from('users')
        .update({
          daily_searches_used: (user.daily_searches_used || 0) + 1,
        })
        .eq('id', userId);
    }
  } catch (error) {
    console.error('[v0] Search count increment failed:', error);
  }
}
