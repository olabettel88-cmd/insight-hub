import { supabase } from '@/lib/auth';
import { createInvoice, getAvailableCurrencies } from '@/lib/heleket';
import { headers } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

const PLAN_PRICES: Record<string, { amount: number; currency: string; searches: number; duration: number }> = {
  monthly: { amount: 50, currency: 'USD', searches: 100, duration: 30 },
  quarterly: { amount: 150, currency: 'USD', searches: 300, duration: 90 },
  yearly: { amount: 1200, currency: 'USD', searches: 500, duration: 365 },
  lifetime: { amount: 300, currency: 'USD', searches: -1, duration: -1 },
};

export async function POST(request: Request) {
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

    const body = await request.json();
    const { planId, cryptoCurrency } = body;

    if (!planId || !PLAN_PRICES[planId]) {
      return Response.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const plan = PLAN_PRICES[planId];
    const orderId = `pka_${payload.userId}_${planId}_${Date.now()}`;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com';

    const invoice = await createInvoice({
      amount: plan.amount.toString(),
      currency: plan.currency,
      orderId,
      toCurrency: cryptoCurrency,
      urlCallback: `${baseUrl}/api/payment/webhook`,
      urlSuccess: `${baseUrl}/dashboard?payment=success`,
      urlReturn: `${baseUrl}/pricing`,
      lifetime: 3600,
      additionalData: JSON.stringify({ userId: payload.userId, planId }),
    });

    await supabase.from('payment_history').insert({
      user_id: payload.userId,
      order_id: orderId,
      payment_provider: 'heleket',
      amount: plan.amount,
      currency: plan.currency,
      crypto_currency: cryptoCurrency,
      payment_status: 'pending',
      plan_id: planId,
      payment_address: invoice.address,
      expires_at: new Date(invoice.expiredAt * 1000).toISOString(),
      metadata: {
        invoice_uuid: invoice.uuid,
        payment_url: invoice.url,
        searches: plan.searches,
        duration: plan.duration,
      },
    });

    return Response.json({
      success: true,
      paymentUrl: invoice.url,
      address: invoice.address,
      amount: invoice.payerAmount,
      currency: invoice.payerCurrency,
      qrCode: invoice.addressQrCode,
      expiresAt: invoice.expiredAt,
      orderId,
    });
  } catch (error) {
    console.error('[Payment] Error creating invoice:', error);
    return Response.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const currencies = await getAvailableCurrencies();
    return Response.json({ currencies });
  } catch (error) {
    console.error('[Payment] Error fetching currencies:', error);
    return Response.json(
      { error: 'Failed to fetch currencies' },
      { status: 500 }
    );
  }
}
