import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_POOLS_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    // Handle pool deposit events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Check if this is a pool deposit
      if (session.metadata?.type === 'pool_deposit') {
        const transactionId = parseInt(session.metadata.transaction_id || '0');
        const userId = session.metadata.user_id;

        if (!transactionId || !userId) {
          console.error('Missing transaction_id or user_id in metadata');
          return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }

        // Get transaction
        const { data: transaction, error: txError } = await supabaseAdmin
          .from('wallet_transactions')
          .select('*')
          .eq('id', transactionId)
          .single();

        if (txError || !transaction) {
          console.error('Transaction not found:', transactionId);
          return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        // Check if already processed
        if (transaction.status === 'completed') {
          console.log('Transaction already processed:', transactionId);
          return NextResponse.json({ success: true, message: 'Already processed' });
        }

        const amount = Number(transaction.amount);

        // Get current wallet balance
        const { data: wallet } = await supabaseAdmin
          .from('user_wallets')
          .select('balance')
          .eq('user_id', userId)
          .single();

        if (!wallet) {
          console.error('Wallet not found for user:', userId);
          return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
        }

        const currentBalance = Number(wallet.balance);
        const newBalance = currentBalance + amount;

        // Update wallet balance
        const { error: walletError } = await supabaseAdmin
          .from('user_wallets')
          .update({
            balance: newBalance,
            total_deposited: supabaseAdmin.sql`total_deposited + ${amount}`,
          })
          .eq('user_id', userId);

        if (walletError) {
          console.error('Error updating wallet:', walletError);
          return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 });
        }

        // Update transaction status
        const { error: updateTxError } = await supabaseAdmin
          .from('wallet_transactions')
          .update({
            status: 'completed',
            balance_after: newBalance,
            completed_at: new Date().toISOString(),
            payment_metadata: {
              ...transaction.payment_metadata,
              stripe_payment_intent: session.payment_intent,
            },
          })
          .eq('id', transactionId);

        if (updateTxError) {
          console.error('Error updating transaction:', updateTxError);
          return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
        }

        console.log(`Deposit completed: $${amount} for user ${userId}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
