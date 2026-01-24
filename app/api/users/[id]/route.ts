import { supabase } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract user ID from token
    const token = authHeader.replace('Bearer ', '');
    let tokenUserId: string;

    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      tokenUserId = decoded.userId;
    } catch {
      return Response.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Users can only view their own data
    if (tokenUserId !== id) {
      return Response.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    // Fetch user data
    const { data: user, error } = await supabase
      .from('users')
      .select(
        'id, username, email, full_name, subscription_plan, telegram_code, api_key, daily_searches_used, daily_search_limit'
      )
      .eq('id', id)
      .single();

    if (error || !user) {
      return Response.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      planType: user.subscription_plan,
      telegramCode: user.telegram_code,
      apiKey: user.api_key,
      searchesUsed: user.daily_searches_used,
      searchesLimit: user.daily_search_limit,
    });
  } catch (error) {
    console.error('[v0] User endpoint error:', error);
    return Response.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}
