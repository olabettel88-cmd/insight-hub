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

export async function DELETE(
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

    const token = authHeader.replace('Bearer ', '');
    if (!verifyAdminToken(token)) {
      return Response.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete API config
    const { error } = await supabase
      .from('api_config')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[v0] API delete error:', error);
      return Response.json(
        { message: 'Failed to delete API configuration' },
        { status: 500 }
      );
    }

    // Log admin action
    await supabase.from('admin_audit_logs').insert({
      admin_id: 'system',
      action: 'API_CONFIG_DELETED',
      target_type: 'api_config',
      changes: { deleted_id: id },
    });

    return Response.json({ message: 'API configuration deleted' });
  } catch (error) {
    console.error('[v0] API delete error:', error);
    return Response.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}
