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
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!verifyAdminToken(token)) {
      return Response.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase
      .from('activity_logs')
      .select(`
        id,
        user_id,
        action,
        ip_address,
        user_agent,
        endpoint,
        response_status,
        response_time_ms,
        metadata,
        created_at
      `, { count: 'exact' });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (action) {
      query = query.ilike('action', `%${action}%`);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    query = query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    const { data: logs, count, error } = await query;

    if (error) {
      console.error('[Admin] Error fetching activity logs:', error);
      return Response.json({ message: 'Failed to fetch logs' }, { status: 500 });
    }

    return Response.json({
      logs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('[Admin] Error:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}
