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
    const { userIds, action, data } = body;

    if (!userIds || !Array.isArray(userIds) || !action) {
      return Response.json({ message: 'User IDs array and action required' }, { status: 400 });
    }

    let updateData: Record<string, any> = {};
    let auditAction = '';

    switch (action) {
      case 'ban':
        updateData = { is_banned: true, ban_reason: data?.reason || 'Banned by admin' };
        auditAction = 'BULK_USER_BANNED';
        break;
      case 'unban':
        updateData = { is_banned: false, ban_reason: null };
        auditAction = 'BULK_USER_UNBANNED';
        break;
      case 'add_days':
        if (data?.days) {
          const daysToAdd = parseInt(data.days);
          if (isNaN(daysToAdd)) {
            return Response.json({ message: 'Invalid days value' }, { status: 400 });
          }

          // Fetch current subscription status for these users
          const { data: users, error: fetchError } = await supabase
            .from('users')
            .select('id, subscription_ends_at')
            .in('id', userIds);

          if (fetchError || !users) {
            return Response.json({ message: 'Failed to fetch user data' }, { status: 500 });
          }

          // Process updates in parallel
          const updatePromises = users.map(async (user) => {
            const currentEnd = user.subscription_ends_at ? new Date(user.subscription_ends_at) : new Date();
            const now = new Date();
            
            // If subscription expired or null, start from now. Otherwise add to existing end date.
            const basisDate = currentEnd > now ? currentEnd : now;
            const newEndDate = new Date(basisDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

            return supabase
              .from('users')
              .update({ subscription_ends_at: newEndDate.toISOString() })
              .eq('id', user.id);
          });

          await Promise.all(updatePromises);
          
          // Skip the generic update block below since we handled it here
          return Response.json({ success: true, count: userIds.length });
        }
        auditAction = 'BULK_USER_DAYS_ADDED';
        break;
      default:
        return Response.json({ message: 'Invalid action' }, { status: 400 });
    }

    if (Object.keys(updateData).length > 0) {
      updateData.updated_at = new Date().toISOString();
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .in('id', userIds);

      if (error) {
        console.error('[Admin] Bulk error:', error);
        return Response.json({ message: 'Bulk update failed' }, { status: 500 });
      }
    }

    return Response.json({ success: true, count: userIds.length });
  } catch (error) {
    console.error('[Admin] Bulk Error:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}
