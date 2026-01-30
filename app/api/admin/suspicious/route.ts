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
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'unresolved';
    const severity = searchParams.get('severity');

    let query = supabase
      .from('suspicious_activity')
      .select(`
        id,
        user_id,
        activity_type,
        severity,
        description,
        ip_address,
        metadata,
        is_resolved,
        resolved_at,
        resolution_notes,
        created_at
      `, { count: 'exact' });

    if (status === 'unresolved') {
      query = query.eq('is_resolved', false);
    } else if (status === 'resolved') {
      query = query.eq('is_resolved', true);
    }

    if (severity) {
      query = query.eq('severity', severity);
    }

    query = query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    const { data: activities, count, error } = await query;

    if (error) {
      console.error('[Admin] Error fetching suspicious activities:', error);
      return Response.json({ message: 'Failed to fetch activities' }, { status: 500 });
    }

    return Response.json({
      activities,
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

export async function PATCH(request: Request) {
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

    const body = await request.json();
    const { activityId, action, notes } = body;

    if (!activityId || !action) {
      return Response.json({ message: 'Activity ID and action required' }, { status: 400 });
    }

    if (action === 'resolve') {
      const { error } = await supabase
        .from('suspicious_activity')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          resolution_notes: notes || 'Resolved by admin',
        })
        .eq('id', activityId);

      if (error) {
        return Response.json({ message: 'Failed to resolve activity' }, { status: 500 });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[Admin] Error:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}
