import { supabase } from '@/lib/auth';
import { getPaymentInfo } from '@/lib/heleket';
import { headers } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const payload = await verifyToken(token);

    if (!payload || !payload.userId) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return Response.json({ error: 'Order ID required' }, { status: 400 });
    }

    const { data: payment } = await supabase
      .from('payment_history')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', payload.userId)
      .single();

    if (!payment) {
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }

    let liveStatus = payment.payment_status;
    
    if (payment.metadata?.invoice_uuid && !['paid', 'paid_over', 'fail', 'cancel'].includes(payment.payment_status)) {
      try {
        const livePayment = await getPaymentInfo(payment.metadata.invoice_uuid);
        liveStatus = livePayment.paymentStatus;

        if (liveStatus !== payment.payment_status) {
          await supabase
            .from('payment_history')
            .update({ payment_status: liveStatus })
            .eq('order_id', orderId);
        }
      } catch {
        console.error('[Payment] Error fetching live status');
      }
    }

    return Response.json({
      orderId: payment.order_id,
      status: liveStatus,
      amount: payment.amount,
      currency: payment.currency,
      cryptoAmount: payment.crypto_amount,
      cryptoCurrency: payment.crypto_currency,
      planId: payment.plan_id,
      address: payment.payment_address,
      expiresAt: payment.expires_at,
      paidAt: payment.paid_at,
      createdAt: payment.created_at,
    });
  } catch (error) {
    console.error('[Payment] Error fetching status:', error);
    return Response.json(
      { error: 'Failed to fetch payment status' },
      { status: 500 }
    );
  }
}
