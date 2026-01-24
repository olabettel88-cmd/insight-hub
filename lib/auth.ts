import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt: const bcrypt = require('bcrypt');
  // return bcrypt.hash(password, 10);
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
  return `key_${Math.random().toString(36).substring(2, 20)}${Math.random().toString(36).substring(2, 20)}`;
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', userId)
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
      .select('daily_searches_used, last_search_reset')
      .eq('id', userId)
      .single();

    if (!user) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = new Date(user.last_search_reset);
    lastReset.setHours(0, 0, 0, 0);

    if (today > lastReset) {
      // Reset daily count
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
    await supabase
      .from('users')
      .update({
        daily_searches_used: supabase.rpc('increment', { row_id: userId, amount: 1 }),
      })
      .eq('id', userId);
  } catch (error) {
    console.error('[v0] Search count increment failed:', error);
  }
}
