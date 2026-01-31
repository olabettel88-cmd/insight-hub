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
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!verifyAdminToken(token)) {
      return Response.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let query = supabaseAdmin
      .from('users')
      .select(`
        id,
        username,
        subscription_plan,
        subscription_ends_at,
        daily_search_limit,
        daily_searches_used,
        is_active,
        is_banned,
        created_at,
        api_key
      `, { count: 'exact' });

    if (search) {
      query = query.or(`username.ilike.%${search}%`);
    }

    if (status === 'active') {
      query = query.eq('is_active', true).eq('is_banned', false);
    } else if (status === 'banned') {
      query = query.eq('is_banned', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * limit, page * limit - 1);

    const { data: users, count, error } = await query;

    if (error) {
      console.error('[Admin] Error fetching users:', error);
      return Response.json({ message: 'Failed to fetch users' }, { status: 500 });
    }

    return Response.json({
      users,
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
    const ip = headersList.get('x-forwarded-for') || 'unknown';

    if (!authHeader) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!verifyAdminToken(token)) {
      return Response.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, data } = body;

    if (!userId || !action) {
      return Response.json({ message: 'User ID and action required' }, { status: 400 });
    }

    const { data: currentUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!currentUser) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    let updateData: Record<string, unknown> = {};
    let auditAction = '';

    switch (action) {
      case 'ban':
        updateData = { is_banned: true, ban_reason: data?.reason || 'Banned by admin' };
        auditAction = 'USER_BANNED';
        break;
      case 'unban':
        updateData = { is_banned: false, ban_reason: null };
        auditAction = 'USER_UNBANNED';
        break;
      case 'activate':
        updateData = { is_active: true };
        auditAction = 'USER_ACTIVATED';
        break;
      case 'deactivate':
        updateData = { is_active: false };
        auditAction = 'USER_DEACTIVATED';
        break;
      case 'update_plan':
        updateData = {
          subscription_plan: data.plan,
          daily_search_limit: data.searchLimit,
          subscription_ends_at: data.endsAt,
        };
        auditAction = 'USER_PLAN_UPDATED';
        break;
      case 'update_limits':
        updateData = {
          daily_search_limit: data.dailyLimit,
          daily_searches_used: data.resetUsage ? 0 : currentUser.daily_searches_used,
        };
        auditAction = 'USER_LIMITS_UPDATED';
        break;
      case 'reset_password':
        auditAction = 'USER_PASSWORD_RESET_REQUESTED';
        break;
      default:
        return Response.json({ message: 'Invalid action' }, { status: 400 });
    }

    if (Object.keys(updateData).length > 0) {
      updateData.updated_at = new Date().toISOString();
      
      const { error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('[Admin] Error updating user:', error);
        return Response.json({ message: 'Failed to update user' }, { status: 500 });
      }
    }

    await supabaseAdmin.from('admin_audit_logs').insert({
      action: auditAction,
      target_type: 'user',
      target_id: userId,
      old_values: currentUser,
      new_values: { ...currentUser, ...updateData },
      ip_address: ip,
    });

    return Response.json({ success: true, message: `User ${action} successful` });
  } catch (error) {
    console.error('[Admin] Error:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}
