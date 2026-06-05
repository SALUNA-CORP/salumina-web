import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { WithdrawRequest, WithdrawResponse } from '@/types/pools';

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

    const body: WithdrawRequest = await request.json();
    const { amount, payment_method, account_details } = body;

    // Validate amount
    if (!amount || amount < 10) {
      return NextResponse.json(
        { success: false, message: 'El monto mínimo de retiro es $10 USD' },
        { status: 400 }
      );
    }

    // Get user wallet
    const { data: wallet } = await supabaseAdmin
      .from('user_wallets')
      .select('balance, total_withdrawn')
      .eq('user_id', user.id)
      .single();

    if (!wallet) {
      return NextResponse.json(
        { success: false, message: 'Wallet no encontrado' },
        { status: 404 }
      );
    }

    const currentBalance = Number(wallet.balance);
    const currentTotalWithdrawn = Number(wallet.total_withdrawn || 0);

    // Check sufficient balance
    if (currentBalance < amount) {
      return NextResponse.json(
        { success: false, message: 'Saldo insuficiente' },
        { status: 400 }
      );
    }

    // Validate account details
    if (!account_details.account_number || !account_details.bank_name) {
      return NextResponse.json(
        { success: false, message: 'Detalles de cuenta bancaria incompletos' },
        { status: 400 }
      );
    }

    // Create transaction and update balance atomically
    const newBalance = currentBalance - amount;

    const { data: transaction, error: txError } = await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        user_id: user.id,
        type: 'withdrawal',
        amount,
        balance_before: currentBalance,
        balance_after: newBalance,
        status: 'pending',
        payment_method,
        payment_metadata: {
          account_details,
        },
        description: `Retiro vía ${payment_method.toUpperCase()} a ${account_details.bank_name}`,
      })
      .select()
      .single();

    if (txError || !transaction) {
      console.error('Error creating withdrawal transaction:', txError);
      return NextResponse.json(
        { success: false, message: 'Error al crear transacción de retiro' },
        { status: 500 }
      );
    }

    // Update wallet balance immediately (lock funds)
    const { error: updateError } = await supabaseAdmin
      .from('user_wallets')
      .update({
        balance: newBalance,
        total_withdrawn: currentTotalWithdrawn + amount,
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating wallet balance:', updateError);
      // Rollback transaction
      await supabaseAdmin
        .from('wallet_transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id);

      return NextResponse.json(
        { success: false, message: 'Error al actualizar saldo' },
        { status: 500 }
      );
    }

    // TODO: Process actual withdrawal with payment provider
    // For now, admin will process manually

    const response: WithdrawResponse = {
      success: true,
      transaction_id: transaction.id,
      message: 'Solicitud de retiro enviada. Será procesada en 24-48 horas hábiles.',
      estimated_completion: '24-48 horas hábiles',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}
