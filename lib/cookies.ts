import { cookies } from 'next/headers';

export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

const SESSION_COOKIE_NAME = 'pka_session';
const REFRESH_TOKEN_COOKIE_NAME = 'pka_refresh';
const FINGERPRINT_COOKIE_NAME = 'pka_fp';

const SESSION_MAX_AGE = 15 * 60;
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60;
const FINGERPRINT_MAX_AGE = 365 * 24 * 60 * 60;

export async function setSessionCookie(sessionId: string, accessToken: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify({ sessionId, accessToken }), {
    ...DEFAULT_COOKIE_OPTIONS,
    maxAge: SESSION_MAX_AGE,
  });
}

export async function setRefreshTokenCookie(refreshToken: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    ...DEFAULT_COOKIE_OPTIONS,
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function setFingerprintCookie(fingerprint: string): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(FINGERPRINT_COOKIE_NAME, fingerprint, {
    ...DEFAULT_COOKIE_OPTIONS,
    httpOnly: false,
    maxAge: FINGERPRINT_MAX_AGE,
  });
}

export async function getSessionCookie(): Promise<{ sessionId: string; accessToken: string } | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    
    if (!sessionCookie?.value) {
      return null;
    }
    
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function getRefreshTokenCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshCookie = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME);
  return refreshCookie?.value || null;
}

export async function getFingerprintCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const fpCookie = cookieStore.get(FINGERPRINT_COOKIE_NAME);
  return fpCookie?.value || null;
}

export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME);
}

export async function clearAllCookies(): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME);
  cookieStore.delete(FINGERPRINT_COOKIE_NAME);
}

export function isSessionExpired(expiresAt: Date | string): boolean {
  const expiry = new Date(expiresAt);
  return expiry < new Date();
}

export function getSessionExpiryDate(maxAgeSeconds: number = SESSION_MAX_AGE): Date {
  return new Date(Date.now() + maxAgeSeconds * 1000);
}

export function getRefreshExpiryDate(): Date {
  return new Date(Date.now() + REFRESH_MAX_AGE * 1000);
}
