import { stripe } from '@/lib/payments/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const bookmakerIds = session.metadata?.bookmakerIds?.split(',').map(Number);
  const currency = session.metadata?.currency as 'USD' | 'COP';

  if (!userId || !bookmakerIds) {
    throw new Error('Missing metadata');
  }

  const baseAmount = 20;
  const bookmakerAmount = bookmakerIds.length * 5;
  const totalAmount = baseAmount + bookmakerAmount;

  // Create subscription
  const { data: subscription, error: subError } = await supabaseAdmin
    .from('subscriptions')
    .insert({
      user_id: userId,
      status: 'active',
      currency,
      base_amount: baseAmount,
      bookmaker_amount: bookmakerAmount,
      total_amount: totalAmount,
      stripe_subscription_id: session.subscription as string,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (subError) throw subError;

  // Link bookmakers
  if (subscription) {
    const bookmakerLinks = bookmakerIds.map((bookId) => ({
      subscription_id: subscription.id,
      bookmaker_id: bookId,
    }));

    await supabaseAdmin.from('subscription_bookmakers').insert(bookmakerLinks);
  }

  // Create payment record
  await supabaseAdmin.from('payments').insert({
    user_id: userId,
    subscription_id: subscription?.id,
    amount: totalAmount,
    currency,
    payment_method: 'stripe',
    status: 'completed',
    stripe_payment_intent_id: session.payment_intent as string,
  });
}

async function handleSubscriptionUpdated(subscription: any) {
  const periodStart = typeof subscription.current_period_start === 'number'
    ? new Date(subscription.current_period_start * 1000).toISOString()
    : new Date().toISOString();

  const periodEnd = typeof subscription.current_period_end === 'number'
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : new Date().toISOString();

  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: subscription.status === 'active' ? 'active' : 'inactive',
      current_period_start: periodStart,
      current_period_end: periodEnd,
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(subscription: any) {
  await supabaseAdmin
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  if (!invoice.subscription) return;

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, id, total_amount, currency')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (subscription) {
    await supabaseAdmin.from('payments').insert({
      user_id: subscription.user_id,
      subscription_id: subscription.id,
      amount: subscription.total_amount,
      currency: subscription.currency,
      payment_method: 'stripe',
      status: 'completed',
      stripe_payment_intent_id: invoice.payment_intent as string,
    });
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  if (!invoice.subscription) return;

  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('user_id, id, total_amount, currency')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (subscription) {
    await supabaseAdmin.from('payments').insert({
      user_id: subscription.user_id,
      subscription_id: subscription.id,
      amount: subscription.total_amount,
      currency: subscription.currency,
      payment_method: 'stripe',
      status: 'failed',
      stripe_payment_intent_id: invoice.payment_intent as string,
    });
  }
}
