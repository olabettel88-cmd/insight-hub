import { supabase } from '@/lib/auth';
import { headers } from 'next/headers';

function verifyAdminToken(token: string): boolean {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded.isAdmin === true;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    if (!verifyAdminToken(token)) {
      return Response.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    // Fetch stats
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: totalSearches } = await supabase
      .from('search_history')
      .select('*', { count: 'exact', head: true });

    const { count: suspiciousActivities } = await supabase
      .from('suspicious_activity')
      .select('*', { count: 'exact', head: true })
      .eq('is_resolved', false);

    const { count: bannedUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_banned', true);

    // Fetch API configs
    const { data: apiConfigs } = await supabase
      .from('api_config')
      .select('id, api_name, api_url, is_active, rate_limit');

    // Fetch revenue from payment_history
    const { data: payments } = await supabase
      .from('payment_history')
      .select('amount')
      .eq('payment_status', 'completed');

    const totalRevenue = (payments || []).reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

    const stats = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalSearches: totalSearches || 0,
      suspiciousActivities: suspiciousActivities || 0,
      bannedUsers: bannedUsers || 0,
      revenue: totalRevenue,
    };

    const formattedApiConfigs = (apiConfigs || []).map((api: Record<string, unknown>) => ({
      id: api.id,
      apiName: api.api_name,
      apiUrl: api.api_url,
      isActive: api.is_active,
      rateLimit: api.rate_limit,
    }));

    return Response.json({
      stats,
      apiConfigs: formattedApiConfigs,
    });
  } catch (error) {
    console.error('[v0] Admin stats error:', error);
    return Response.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}
