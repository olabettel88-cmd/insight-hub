import { supabase } from '@/lib/auth';
import { authenticateRequest } from '@/lib/middleware/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const auth = await authenticateRequest(request as any);
    
    if (!auth.authenticated || !auth.user) {
      return Response.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    if (auth.user.userId !== userId) {
      return Response.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Fetch user details
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        subscription_plan,
        subscription_started_at,
        subscription_ends_at,
        daily_search_limit,
        daily_searches_used,
        last_search_reset,
        api_key,
        telegram_code,
        telegram_id,
        is_active,
        created_at
      `)
      .eq('id', userId)
      .single();

    if (error || !user) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json({
      searchesUsed: user.daily_searches_used,
      searchesLimit: user.daily_search_limit,
      planType: user.subscription_plan,
      telegramCode: user.telegram_code,
      apiKey: user.api_key,
      username: user.username,
      subscriptionStartedAt: user.subscription_started_at,
      subscriptionEndsAt: user.subscription_ends_at,
      telegramId: user.telegram_id,
      isActive: user.is_active,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('[v0] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
