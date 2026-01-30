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
    const minConfidence = parseInt(searchParams.get('minConfidence') || '50');

    const { data: links, count, error } = await supabase
      .from('multi_account_links')
      .select(`
        id,
        primary_user_id,
        linked_user_id,
        link_type,
        confidence_score,
        evidence,
        detected_at,
        reviewed_at,
        is_confirmed
      `, { count: 'exact' })
      .gte('confidence_score', minConfidence)
      .order('confidence_score', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error('[Admin] Error fetching multi-account links:', error);
      return Response.json({ message: 'Failed to fetch data' }, { status: 500 });
    }

    const userIds = new Set<string>();
    links?.forEach(link => {
      userIds.add(link.primary_user_id);
      userIds.add(link.linked_user_id);
    });

    const { data: users } = await supabase
      .from('users')
      .select('id, username, is_banned, created_at')
      .in('id', Array.from(userIds));

    const userMap = new Map(users?.map(u => [u.id, u]) || []);

    const enrichedLinks = links?.map(link => ({
      ...link,
      primaryUser: userMap.get(link.primary_user_id),
      linkedUser: userMap.get(link.linked_user_id),
    }));

    return Response.json({
      links: enrichedLinks,
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
    const { linkId, action, banBoth } = body;

    if (!linkId || !action) {
      return Response.json({ message: 'Link ID and action required' }, { status: 400 });
    }

    const { data: link } = await supabase
      .from('multi_account_links')
      .select('*')
      .eq('id', linkId)
      .single();

    if (!link) {
      return Response.json({ message: 'Link not found' }, { status: 404 });
    }

    if (action === 'confirm') {
      await supabase
        .from('multi_account_links')
        .update({
          is_confirmed: true,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', linkId);

      if (banBoth) {
        await supabase
          .from('users')
          .update({ is_banned: true, ban_reason: 'Multi-account violation' })
          .in('id', [link.primary_user_id, link.linked_user_id]);
      }
    } else if (action === 'dismiss') {
      await supabase
        .from('multi_account_links')
        .update({
          is_confirmed: false,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', linkId);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[Admin] Error:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}
