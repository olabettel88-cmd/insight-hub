import { headers } from 'next/headers';

// Admin password - should be in environment variables
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123secure';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'super_secret_admin_key_12345';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for') || '';
    const ip = forwardedFor.split(',')[0].trim() || headersList.get('x-real-ip') || 'unknown';

    const body = await request.json();
    const { password } = body;

    if (!password) {
      return Response.json(
        { message: 'Password required' },
        { status: 400 }
      );
    }

    // Verify password against environment variable
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

    const response = Response.json({
      token,
      message: 'Admin access granted',
    });

    // Set cookie for server-side auth if needed
    response.headers.append('Set-Cookie', `adminToken=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);
    
    // Add CORS headers to allow browser to read/set cookie if needed
    response.headers.append('Access-Control-Allow-Credentials', 'true');

    return response;
  } catch (error) {
    console.error('[v0] Admin verify error:', error);
    return Response.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}
