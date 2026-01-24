import { headers } from 'next/headers';

// Admin password - should be in environment variables in production
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123secure';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'super_secret_admin_key_12345';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return Response.json(
        { message: 'Password required' },
        { status: 400 }
      );
    }

    // Verify password
    if (password !== ADMIN_PASSWORD) {
      console.warn(`[v0] Failed admin authentication attempt from IP: ${ip}`);
      return Response.json(
        { message: 'Invalid password' },
        { status: 401 }
      );
    }

    // Generate admin token
    const token = Buffer.from(
      JSON.stringify({
        isAdmin: true,
        iat: Date.now(),
        secret: ADMIN_SECRET,
      })
    ).toString('base64');

    console.log(`[v0] Admin authenticated from IP: ${ip}`);

    return Response.json({
      token,
      message: 'Admin access granted',
    });
  } catch (error) {
    console.error('[v0] Admin verify error:', error);
    return Response.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}
