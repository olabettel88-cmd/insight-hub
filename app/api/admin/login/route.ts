import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;
    
    // In production, this should be an environment variable
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Use trimming to avoid issues with copy-paste spaces
    if (password?.trim() === adminPassword?.trim()) {
      // Generate a simple token (in production use JWT)
      // Matching the format expected by verifyAdminToken in other routes
      const tokenPayload = JSON.stringify({ 
        isAdmin: true, 
        timestamp: Date.now() 
      });
      const token = Buffer.from(tokenPayload).toString('base64');
      
      return Response.json({ success: true, token });
    } else {
      return Response.json({ success: false, message: 'Invalid password' }, { status: 401 });
    }
  } catch (error) {
    return Response.json({ success: false, message: 'Error processing request' }, { status: 500 });
  }
}
