import { supabase } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

// Create a Supabase client with the service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: activeUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: totalSearches } = await supabaseAdmin
      .from('search_history')
      .select('*', { count: 'exact', head: true });

    const { count: suspiciousActivities } = await supabaseAdmin
      .from('suspicious_activity')
      .select('*', { count: 'exact', head: true })
      .eq('is_resolved', false);

    const { count: bannedUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_banned', true);

    // Fetch API configs
    const { data: apiConfigs } = await supabaseAdmin
      .from('api_config')
      .select('id, api_name, api_url, is_active, rate_limit');

    // Fetch revenue from payment_history
    const { data: payments } = await supabaseAdmin
      .from('payment_history')
      .select('amount')
      .eq('payment_status', 'completed');

    const totalRevenue = (payments || []).reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

    // Fetch 24h traffic
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentSearches } = await supabaseAdmin
      .from('search_history')
      .select('created_at')
      .gte('created_at', oneDayAgo);
      
    const trafficChart = new Array(24).fill(0);
    (recentSearches || []).forEach((search: any) => {
        const date = new Date(search.created_at);
        const diffMs = Date.now() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 24 && diffHours >= 0) {
            // Index 23 is current hour (newest), Index 0 is 23h ago (oldest)
            trafficChart[23 - diffHours]++;
        }
    });

    const stats = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalSearches: totalSearches || 0,
      suspiciousActivities: suspiciousActivities || 0,
      bannedUsers: bannedUsers || 0,
      revenue: totalRevenue,
      trafficChart
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
