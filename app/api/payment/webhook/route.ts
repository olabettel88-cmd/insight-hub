import { supabase } from '@/lib/auth';
import { verifyWebhookSignature, isPaymentComplete, isPaymentFailed, PaymentWebhook } from '@/lib/heleket';
import { checkAndAwardBadges } from '@/lib/badges';

const PLAN_DETAILS: Record<string, { searches: number; duration: number }> = {
  monthly: { searches: 100, duration: 30 },
  quarterly: { searches: 300, duration: 90 },
  yearly: { searches: 500, duration: 365 },
  lifetime: { searches: -1, duration: -1 },
};

export async function POST(request: Request) {
  try {
    const body: PaymentWebhook = await request.json();

    console.log('[Webhook] Received payment webhook:', body.orderId, body.paymentStatus);

    if (!verifyWebhookSignature(body)) {
      console.error('[Webhook] Invalid signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { data: payment } = await supabase
      .from('payment_history')
      .select('*')
      .eq('order_id', body.orderId)
      .single();

    if (!payment) {
      console.error('[Webhook] Payment not found:', body.orderId);
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }

    await supabase
      .from('payment_history')
      .update({
        payment_status: body.paymentStatus,
        transaction_hash: body.txid,
        crypto_amount: parseFloat(body.payerAmount),
        crypto_currency: body.payerCurrency,
        webhook_received: true,
        updated_at: new Date().toISOString(),
        paid_at: isPaymentComplete(body.paymentStatus) ? new Date().toISOString() : null,
      })
      .eq('order_id', body.orderId);

    if (isPaymentComplete(body.paymentStatus)) {
      const planId = payment.plan_id;
      const planDetails = PLAN_DETAILS[planId];

      if (planDetails) {
        const now = new Date();
        let subscriptionEndsAt: Date | null = null;
        
        if (planDetails.duration > 0) {
          subscriptionEndsAt = new Date(now);
          subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + planDetails.duration);
        }

        const updateData: Record<string, unknown> = {
          subscription_plan: planId,
          subscription_started_at: now.toISOString(),
          daily_search_limit: planDetails.searches === -1 ? 999999 : planDetails.searches,
          updated_at: now.toISOString(),
        };

        if (subscriptionEndsAt) {
          updateData.subscription_ends_at = subscriptionEndsAt.toISOString();
        }

        await supabase
          .from('users')
          .update(updateData)
          .eq('id', payment.user_id);

        await checkAndAwardBadges(payment.user_id);

        const { data: user } = await supabase
          .from('users')
          .select('referred_by')
          .eq('id', payment.user_id)
          .single();

        if (user?.referred_by) {
          const referralReward = payment.amount * 0.1;

          // Fetch referrer to update earnings
          const { data: referrer } = await supabase
            .from('users')
            .select('referral_earnings')
            .eq('id', user.referred_by)
            .single();

          if (referrer) {
            const newEarnings = (Number(referrer.referral_earnings) || 0) + referralReward;
            
            await supabase
              .from('users')
              .update({
                referral_earnings: newEarnings,
              })
              .eq('id', user.referred_by);
          }

          await supabase
            .from('referrals')
            .update({
              status: 'completed',
              reward_amount: referralReward,
            })
            .eq('referred_id', payment.user_id);
        }

        console.log('[Webhook] Payment completed, user upgraded:', payment.user_id, planId);
      }
    } else if (isPaymentFailed(body.paymentStatus)) {
      console.log('[Webhook] Payment failed:', body.orderId, body.paymentStatus);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
