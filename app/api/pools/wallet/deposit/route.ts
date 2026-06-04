import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { stripe } from '@/lib/payments/stripe';
import type { DepositRequest, DepositResponse } from '@/types/pools';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
    }

    const body: DepositRequest = await request.json();
    const { amount, payment_method, return_url } = body;

    // Validate amount
    if (!amount || amount < 5) {
      return NextResponse.json(
        { success: false, message: 'El monto mínimo de depósito es $5 USD' },
        { status: 400 }
      );
    }

    if (amount > 5000) {
      return NextResponse.json(
        { success: false, message: 'El monto máximo de depósito es $5,000 USD' },
        { status: 400 }
      );
    }

    // Get user wallet
    const { data: wallet } = await supabaseAdmin
      .from('user_wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (!wallet) {
      return NextResponse.json(
        { success: false, message: 'Wallet no encontrado' },
        { status: 404 }
      );
    }

    const currentBalance = Number(wallet.balance);

    // Create pending transaction
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        type: 'deposit',
        amount,
        balance_before: currentBalance,
        balance_after: currentBalance, // Will be updated on webhook
        status: 'pending',
        payment_method,
        description: `Depósito vía ${payment_method.toUpperCase()}`,
      })
      .select()
      .single();

    if (txError || !transaction) {
      console.error('Error creating transaction:', txError);
      return NextResponse.json(
        { success: false, message: 'Error al crear transacción' },
        { status: 500 }
      );
    }

    // Process payment based on method
    let checkoutUrl: string | undefined;
    let paymentId: string | undefined;

    if (payment_method === 'stripe') {
      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Depósito PolyBet',
                description: `Depósito de saldo para apuestas`,
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: return_url || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/pools/wallet?deposit=success`,
        cancel_url: return_url || `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/pools/wallet?deposit=cancelled`,
        metadata: {
          transaction_id: transaction.id.toString(),
          user_id: user.id,
          type: 'pool_deposit',
        },
      });

      checkoutUrl = session.url || undefined;
      paymentId = session.id;

      // Update transaction with payment ID
      await supabaseAdmin
        .from('wallet_transactions')
        .update({
          payment_id: paymentId,
          payment_metadata: { session_id: session.id },
        })
        .eq('id', transaction.id);
    } else if (payment_method === 'pse') {
      // TODO: Implement PSE integration
      return NextResponse.json(
        { success: false, message: 'PSE estará disponible próximamente' },
        { status: 501 }
      );
    } else if (payment_method === 'bold') {
      // TODO: Implement BOLD integration
      return NextResponse.json(
        { success: false, message: 'BOLD estará disponible próximamente' },
        { status: 501 }
      );
    } else if (payment_method === 'wompi') {
      // TODO: Implement Wompi integration
      return NextResponse.json(
        { success: false, message: 'Wompi estará disponible próximamente' },
        { status: 501 }
      );
    }

    const response: DepositResponse = {
      success: true,
      transaction_id: transaction.id,
      checkout_url: checkoutUrl,
      payment_id: paymentId,
      message: 'Transacción creada. Redirigiendo a pago...',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing deposit:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}
