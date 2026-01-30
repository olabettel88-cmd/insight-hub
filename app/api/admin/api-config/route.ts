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

export async function POST(request: Request) {
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

    const body = await request.json();
    const { apiName, apiUrl, apiKey, rateLimit } = body;

    if (!apiName || !apiUrl) {
      return Response.json(
        { message: 'API name and URL required' },
        { status: 400 }
      );
    }

    // Insert new API config
    const { data, error } = await supabase
      .from('api_config')
      .insert({
        api_name: apiName,
        api_url: apiUrl,
        api_key: apiKey,
        rate_limit: rateLimit || 100,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('[v0] API config error:', error);
      return Response.json(
        { message: 'Failed to add API configuration' },
        { status: 500 }
      );
    }

    // Log admin action
    await supabase.from('admin_audit_logs').insert({
      admin_id: 'system', // In production, get from token
      action: 'API_CONFIG_ADDED',
      target_type: 'api_config',
      changes: { api_name: apiName, api_url: apiUrl },
    });

    return Response.json({
      message: 'API configuration added',
      data,
    });
  } catch (error) {
    console.error('[v0] API config POST error:', error);
    return Response.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}
