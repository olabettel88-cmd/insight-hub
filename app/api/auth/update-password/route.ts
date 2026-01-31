import { supabase, hashPassword } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);

    if (!payload || !payload.userId) {
       return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { password } = body;

    if (!password || password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', payload.userId);

    if (error) {
      console.error('Password update error:', error);
      return Response.json({ error: 'Failed to update password' }, { status: 500 });
    }

    return Response.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password update exception:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
